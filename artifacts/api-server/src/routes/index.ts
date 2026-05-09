import { Router, type IRouter } from "express";
import authRouter, { requireAuth } from "./auth";
import skipRouter from "./skip";
import historyRouter from "./history";
import settingsRouter from "./settings";
import healthRouter from "./health";
import menuRouter from "./menu";
import ordersRouter from "./orders";
import songsRouter from "./songs";
import statsRouter from "./stats";
import adminMenuRouter from "./admin-menu";
import profilesRouter from "./profiles";
import paymentsRouter from "./payments";
import laporanRouter from "./laporan";
import vouchersRouter from "./vouchers";

const router: IRouter = Router();

// Public routes
router.use(healthRouter);
router.use(menuRouter);
router.use(ordersRouter);
router.use(songsRouter);
router.use(profilesRouter);
router.use(paymentsRouter);
router.use(settingsRouter);
router.use(skipRouter);
router.use(historyRouter);
router.use(authRouter);

// Protected routes (kasir/admin only)
router.use(requireAuth, statsRouter);
router.use(requireAuth, adminMenuRouter);
router.use(requireAuth, laporanRouter);
router.use(requireAuth, vouchersRouter);

export default router;
