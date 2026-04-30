import express, { type Express } from "express";
import path from "path";
import path from "path";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
const corsOriginEnv = process.env["CORS_ORIGIN"];
const corsOrigins = corsOriginEnv
  ? (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      const allowed = corsOriginEnv.split(',').map((s) => s.trim()).filter(Boolean);
      const isAllowed = allowed.some((a) => origin === a) ||
        /^https:\/\/mie-api-server-xw4r[a-z0-9-]*\.vercel\.app$/.test(origin);
      callback(null, isAllowed);
    }
  : true;
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("/var/www/mie-ayam-berteman/uploads"));
app.use("/uploads", express.static("/var/www/mie-ayam-berteman/uploads"));

app.use("/api", router);

export default app;
