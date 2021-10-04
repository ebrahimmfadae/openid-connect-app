import Router from "koa-router";
import { Provider } from "oidc-provider";
import authRouter from "../routes/auth.router";

export default (oidc: Provider) => {
  const router = new Router();

  router.use(authRouter(oidc).routes());

  return router;
};
