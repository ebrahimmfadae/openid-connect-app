import { Middleware } from "koa";

export const noCache: Middleware = async (ctx, next) => {
  ctx.set("Pragma", "no-cache");
  ctx.set("Cache-Control", "no-cache, no-store");
  await next();
};
