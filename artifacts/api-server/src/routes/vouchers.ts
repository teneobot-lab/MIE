import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, vouchers } from "@workspace/db";

const router: IRouter = Router();

// Validasi voucher
router.post("/vouchers/validate", async (req, res): Promise<void> => {
  const { code, orderTotal } = req.body;
  if (!code) { res.status(400).json({ message: "Kode voucher wajib diisi" }); return; }

  const [voucher] = await db.select().from(vouchers)
    .where(eq(vouchers.code, code.toUpperCase().trim()));

  if (!voucher) { res.status(404).json({ message: "Voucher tidak ditemukan" }); return; }
  if (!voucher.active) { res.status(400).json({ message: "Voucher tidak aktif" }); return; }
  if (voucher.usedCount >= voucher.maxUses) { res.status(400).json({ message: "Voucher sudah habis dipakai" }); return; }
  if (voucher.expiresAt && new Date() > voucher.expiresAt) { res.status(400).json({ message: "Voucher sudah kadaluarsa" }); return; }
  if (orderTotal < voucher.minOrder) { res.status(400).json({ message: `Minimum order ${voucher.minOrder} untuk pakai voucher ini` }); return; }

  const discount = voucher.type === "percent"
    ? Math.round(orderTotal * voucher.value / 100)
    : Math.min(voucher.value, orderTotal);

  res.json({ ...voucher, discount, finalTotal: orderTotal - discount });
});

// Pakai voucher (increment usedCount)
router.post("/vouchers/use", async (req, res): Promise<void> => {
  const { code } = req.body;
  const [voucher] = await db.select().from(vouchers).where(eq(vouchers.code, code.toUpperCase().trim()));
  if (!voucher) { res.status(404).json({ message: "Voucher tidak ditemukan" }); return; }
  await db.update(vouchers).set({ usedCount: voucher.usedCount + 1 }).where(eq(vouchers.id, voucher.id));
  res.json({ message: "Voucher dipakai" });
});

// CRUD voucher untuk admin
router.get("/admin/vouchers", async (_req, res): Promise<void> => {
  const rows = await db.select().from(vouchers).orderBy(vouchers.createdAt);
  res.json(rows);
});

router.post("/admin/vouchers", async (req, res): Promise<void> => {
  const { code, description, type, value, minOrder, maxUses, expiresAt } = req.body;
  const [created] = await db.insert(vouchers).values({
    code: code.toUpperCase().trim(),
    description, type, value: Number(value),
    minOrder: Number(minOrder ?? 0),
    maxUses: Number(maxUses ?? 1),
    expiresAt: expiresAt ? new Date(expiresAt) : null,
  }).returning();
  res.json(created);
});

router.patch("/admin/vouchers/:id/toggle", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const [v] = await db.select().from(vouchers).where(eq(vouchers.id, id));
  if (!v) { res.status(404).json({ message: "Not found" }); return; }
  const [updated] = await db.update(vouchers).set({ active: !v.active }).where(eq(vouchers.id, id)).returning();
  res.json(updated);
});

router.delete("/admin/vouchers/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  await db.delete(vouchers).where(eq(vouchers.id, id));
  res.json({ message: "Deleted" });
});

export default router;
