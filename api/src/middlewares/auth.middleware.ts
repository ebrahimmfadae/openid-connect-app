import { Middleware } from "koa";
import fetch from "node-fetch";

export const authenticate: Middleware = async (ctx, next) => {
  const body = new URLSearchParams();
  if (!ctx.request.headers.authorization) return ctx.throw(401);
  body.append(
    "token",
    ctx.request.headers.authorization.replace(/^Bearer /, "")
  );
  body.append("client_id", process.env.CLIENT_ID as string);
  body.append("client_secret", process.env.CLIENT_SECRET as string);
  const url = `${process.env.OIDC_ISSUER}/token/introspection`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      ["Content-Type"]: "application/x-www-form-urlencoded",
    },
    body: body,
  });
  if (response.status !== 200) ctx.throw(401);
  const json = await response.json();
  const { active, aud } = json;
  // Resource URI and audience (aud) must be equal
  if (active && aud.trim() === ctx.request.href.split("?")[0]) {
    ctx.state.session = json;
    await next();
  } else {
    ctx.throw(401);
  }
};

export const authorize =
  (...scopes: string[]): Middleware =>
    async (ctx, next) => {
      if (
        ctx.state.session &&
        scopes.every((scope) => ctx.state.session.scope.includes(scope))
      ) {
        await next();
      } else {
        ctx.throw(401);
      }
    };
