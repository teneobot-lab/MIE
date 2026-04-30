import { Router, type IRouter } from "express";
import healthRouter from "./health";
import menuRouter from "./menu";
import ordersRouter from "./orders";
import songsRouter from "./songs";
import statsRouter from "./stats";
import adminMenuRouter from "./admin-menu";
import profilesRouter from "./profiles";

const router: IRouter = Router();

router.use(healthRouter);
router.use(menuRouter);
router.use(ordersRouter);
router.use(songsRouter);
router.use(statsRouter);
router.use(adminMenuRouter);
router.use(profilesRouter);

export default router;
