import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db, adminUsers } from "@workspace/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router: IRouter = Router();
const JWT_SECRET = process.env["JWT_SECRET"] ?? "mie-ayam-secret-2024";
const JWT_EXPIRES = "8h";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) { res.status(401).json({ message: "Unauthorized" }); return; }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: number; username: string; role: string };
    (req as any).admin = payload;
    next();
  } catch {
    res.status(401).json({ message: "Token invalid atau expired" });
  }
}

export function requireRole(role: "owner") {
  return (req: Request, res: Response, next: NextFunction): void => {
    const admin = (req as any).admin;
    if (!admin || admin.role !== role) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }
    next();
  };
}

// Login
router.post("/auth/login", async (req, res): Promise<void> => {
  const { username, password } = req.body;
  if (!username || !password) { res.status(400).json({ message: "Username dan password wajib diisi" }); return; }

  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.username, username));
  if (!user || !user.isActive) { res.status(401).json({ message: "Username atau password salah" }); return; }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) { res.status(401).json({ message: "Username atau password salah" }); return; }

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

// Verify token
router.get("/auth/me", requireAuth, (req, res): void => {
  res.json({ admin: (req as any).admin });
});

// Register admin pertama (hanya jika belum ada user)
router.post("/auth/setup", async (req, res): Promise<void> => {
  const count = await db.select().from(adminUsers);
  if (count.length > 0) { res.status(403).json({ message: "Setup sudah dilakukan" }); return; }

  const { username, password } = req.body;
  if (!username || !password || password.length < 6) {
    res.status(400).json({ message: "Username dan password minimal 6 karakter" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [user] = await db.insert(adminUsers).values({ username, passwordHash, role: "owner" }).returning();
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

// Tambah user kasir (owner only)
router.post("/auth/users", requireAuth, requireRole("owner"), async (req, res): Promise<void> => {
  const { username, password, role } = req.body;
  if (!username || !password || password.length < 6) {
    res.status(400).json({ message: "Username dan password minimal 6 karakter" });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const [user] = await db.insert(adminUsers).values({ username, passwordHash, role: role ?? "kasir" }).returning();
  res.json({ id: user.id, username: user.username, role: user.role });
});

// List users (owner only)
router.get("/auth/users", requireAuth, requireRole("owner"), async (_req, res): Promise<void> => {
  const users = await db.select({ id: adminUsers.id, username: adminUsers.username, role: adminUsers.role, isActive: adminUsers.isActive, createdAt: adminUsers.createdAt }).from(adminUsers);
  res.json(users);
});

// Toggle user active
router.patch("/auth/users/:id/toggle", requireAuth, requireRole("owner"), async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
  if (!user) { res.status(404).json({ message: "User tidak ditemukan" }); return; }
  const [updated] = await db.update(adminUsers).set({ isActive: !user.isActive }).where(eq(adminUsers.id, id)).returning();
  res.json({ id: updated.id, isActive: updated.isActive });
});

export default router;
