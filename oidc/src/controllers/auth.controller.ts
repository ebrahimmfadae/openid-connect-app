import { Middleware } from "koa";
import { Provider } from "oidc-provider";
import * as accountService from "../services/account-persist.service";

function debug(obj: any) {
  return Object.entries(obj)
    .map(
      (ent: [string, any]) =>
        `<strong>${ent[0]}</strong>: ${JSON.stringify(ent[1])}`
    )
    .join("<br>");
}

export default (oidc: Provider): { [key: string]: Middleware } => ({
  login: async (ctx) => {
    const {
      prompt: { name },
    } = await oidc.interactionDetails(ctx.req, ctx.res);
    if (name === "login") {
      const account = await accountService.get(ctx.request.body.username);
      let result: any;
      if (account?.password === ctx.request.body.password) {
        result = {
          login: {
            accountId: ctx.request.body.username,
          },
        };
      } else {
        result = {
          error: "access_denied",
          error_description: "Username or password is incorrect.",
        };
      }
      return oidc.interactionFinished(ctx.req, ctx.res, result, {
        mergeWithLastSubmission: false,
      });
    }
  },
  register: async (ctx) => {
    const body = ctx.request.body;
    await accountService.set(body.username, {
      username: body.username,
      password: body.password,
    });
    ctx.message = "User successfully created.";
  },
  confirmInteraction: async (ctx) => {
    const interactionDetails = await oidc.interactionDetails(ctx.req, ctx.res);
    const {
      prompt: { name, details },
      params,
      session: { accountId },
    } = interactionDetails as any;

    if (name === "consent") {
      const grant = interactionDetails.grantId
        ? await oidc.Grant.find(interactionDetails.grantId)
        : new oidc.Grant({
          accountId,
          clientId: params.client_id as string,
        });

      if (grant) {
        if (details.missingOIDCScope) {
          grant.addOIDCScope(details.missingOIDCScope.join(" "));
        }
        if (details.missingOIDCClaims) {
          grant.addOIDCClaims(details.missingOIDCClaims);
        }
        if (details.missingResourceScopes) {
          for (const [indicator, scopes] of Object.entries(
            details.missingResourceScopes
          )) {
            grant.addResourceScope(indicator, (scopes as any).join(" "));
          }
        }

        const grantId = await grant.save();

        const result = { consent: { grantId } };
        await oidc.interactionFinished(ctx.req, ctx.res, result, {
          mergeWithLastSubmission: true,
        });
      }
    } else {
      ctx.throw(400, "Interaction prompt type must be `consent`.");
    }
  },
  abortInteraction: async (ctx) => {
    const result = {
      error: "access_denied",
      error_description: "End-User aborted interaction",
    };
    await oidc.interactionFinished(ctx.req, ctx.res, result, {
      mergeWithLastSubmission: false,
    });
  },
  interaction: async (ctx) => {
    const { uid, prompt, params, session } = (await oidc.interactionDetails(
      ctx.req,
      ctx.res
    )) as any;

    if (prompt.name === "login") {
      return ctx.render("login", {
        uid,
        details: prompt.details,
        params,
        session: session ? debug(session) : undefined,
        title: "Sign-In",
        dbg: {
          params: debug(params),
          prompt: debug(prompt),
        },
      });
    } else if (prompt.name === "consent") {
      return ctx.render("consent", {
        uid,
        title: "Authorize",
        clientId: params.client_id,
        scope: params.scope.replace(/ /g, ", "),
        session: session ? debug(session) : undefined,
        dbg: {
          params: debug(params),
          prompt: debug(prompt),
        },
      });
    } else {
      ctx.throw(501, "Not implemented.");
    }
  },
});
