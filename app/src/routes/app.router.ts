import Router from "koa-router";
import appController from "../controllers/app.controller";

export default () => {
  const router = new Router();

  const { callback, sampleApp, signIn, clientLogin, registerForm, pi } =
    appController();

  router.get("/", sampleApp);
  router.get("/register", registerForm);
  router.get("/sign-in", signIn);
  router.get("/client-login", clientLogin);
  router.get("/cb", callback);
  router.get("/pi", pi);

  return router;
};
