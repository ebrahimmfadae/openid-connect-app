import { Middleware } from "koa";
import { Provider } from "oidc-provider";

export const onlyClient: (oidc: Provider) => Middleware =
  (oidc) => async (ctx, next) => {
    const clientCredentials = await oidc.ClientCredentials.find(
      ctx.request.headers.authorization?.replace(/^Bearer /, "") ?? ""
    );
    if (clientCredentials) {
      await next();
    } else {
      ctx.status = 401;
      ctx.message = "UNAUTHORIZED";
      return;
    }
  };
