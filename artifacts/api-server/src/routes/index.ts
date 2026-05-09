import { Router, type IRouter } from "express";
import skipRouter from "./skip";
import historyRouter from "./history";
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

router.use(healthRouter);
router.use(menuRouter);
router.use(ordersRouter);
router.use(songsRouter);
router.use(statsRouter);
router.use(adminMenuRouter);
router.use(profilesRouter);
router.use(paymentsRouter);
router.use(laporanRouter);
router.use(vouchersRouter);
  router.use(skipRouter);
  router.use(historyRouter);

export default router;
