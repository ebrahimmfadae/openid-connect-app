import { Middleware } from "koa";

export default (): { [key: string]: Middleware } => ({
  registerForm: async (ctx) => {
    return ctx.render("register", {
      title: "Register User",
      authServerUrl: process.env.PUBLIC_OIDC_ISSUER,
    });
  },
  callback: async (ctx) => {
    if ("error" in ctx.query) {
      ctx.throw(401, `${ctx.query.error}: ${ctx.query.error_description}`);
    } else {
      return ctx.render("token", {
        code: ctx.query.code,
        title: "App Callback",
        authServerUrl: process.env.PUBLIC_OIDC_ISSUER,
        appUrl: process.env.PUBLIC_APP_URL,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
      });
    }
  },
  sampleApp: async (ctx) => {
    return ctx.render("sample-app", {
      title: "Sample App",
      authServerUrl: process.env.PUBLIC_OIDC_ISSUER,
      apiUrl: process.env.PUBLIC_API_URL,
      appUrl: process.env.PUBLIC_APP_URL,
      clientId: process.env.CLIENT_ID,
    });
  },
  signIn: async (ctx) => {
    return ctx.render("sign-in", {
      title: "Get Token With Credentials",
      authServerUrl: process.env.PUBLIC_OIDC_ISSUER,
      apiUrl: process.env.PUBLIC_API_URL,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
    });
  },
  clientLogin: async (ctx) => {
    return ctx.render("client-login", {
      title: "Client Login",
      authServerUrl: process.env.PUBLIC_OIDC_ISSUER,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
    });
  },
  pi: async (ctx) => {
    return ctx.render("pi", { title: "PI", apiUrl: process.env.PUBLIC_API_URL });
  },
});
