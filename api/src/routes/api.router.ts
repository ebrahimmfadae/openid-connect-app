import Router from "koa-router";
import apiController from "../controllers/api.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

export default () => {
  const router = new Router();

  const { pi } = apiController();

  router.get("/pi", authenticate, authorize("api:read"), pi);

  return router;
};
