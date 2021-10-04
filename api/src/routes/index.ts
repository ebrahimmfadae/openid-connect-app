import Router from "koa-router";
import appRouter from "./api.router";

export default () => {
  const router = new Router();

  router.use(appRouter().routes());

  return router;
};
