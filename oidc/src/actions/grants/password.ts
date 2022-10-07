import { InvalidGrant } from "oidc-provider/lib/helpers/errors";
import presence from "oidc-provider/lib/helpers/validate_presence";
import filterClaims from "oidc-provider/lib/helpers/filter_claims";
import instance from "oidc-provider/lib/helpers/weak_cache";
import dpopValidate from "oidc-provider/lib/helpers/validate_dpop";
import resolveResource from "oidc-provider/lib/helpers/resolve_resource";
import { Middleware } from "koa";
import * as accountService from "../../services/account-persist.service";

export const gty = "password";

export const parameters = ["username", "password", "resource", "scope"];

export const passwordHandler: Middleware = async function (ctx, next) {
  const {
    issueRefreshToken,
    conformIdTokenClaims,
    features: {
      userinfo,
      dPoP: { iatTolerance },
      mTLS: { getCertificate },
      resourceIndicators,
    },
    ttl: { Session },
    claims: fullClaims,
    expiresWithSession,
  } = instance(ctx.oidc.provider).configuration();

  presence(ctx, "username", "password");

  const params = ctx.oidc.params;

  const doc = await accountService.get(params.username);
  if (doc.password !== params.password) {
    throw new InvalidGrant("password grant invalid");
  }

  const account = await ctx.oidc.provider.Account.findAccount(
    ctx,
    params.username
  );

  ctx.oidc.entity("Account", account);

  const session = new ctx.oidc.provider.Session({
    accountId: account.accountId,
  });
  session.ensureClientContainer(ctx.oidc.client.clientId);

  ctx.oidc.entity("Session", session);

  const grant = new ctx.oidc.provider.Grant({
    clientId: ctx.oidc.client.clientId,
    accountId: account.accountId,
    sessionUid: session.uid,
  });

  if (params?.resource) {
    grant.addResourceScope(params?.resource, params.scope);
  } else {
    grant.addOIDCScope(ctx.oidc.client.scope);
  }

  ctx.oidc.entity("Grant", grant);

  await grant.save();

  session.grantIdFor(ctx.oidc.client.clientId, grant.jti);

  await session.save(Session);

  const scopeSet = new Set<string>();

  const password = {
    clientId: grant.clientId,
    grantId: grant.jti,
    accountId: grant.accountId,
    expiresWithSession: await expiresWithSession(ctx, {
      scopes: scopeSet,
    }),
    sessionUid: session.uid,
    sid: session.authorizations[ctx.oidc.client.clientId].sid,
    scopes: scopeSet,
    claims: fullClaims,
    acr: undefined,
    amr: undefined,
    authTime: grant.iat,
    nonce: undefined,
    resource: params?.resource,
    resourceIndicators: new Set([params?.resource]),
    scope: params?.scope ?? ctx.oidc.client.scope,
  };

  password.scope.split(" ").forEach((scope: string) => scopeSet.add(scope));

  let cert: string | undefined;
  if (ctx.oidc.client.tlsClientCertificateBoundAccessTokens) {
    cert = getCertificate(ctx);
    if (!cert) {
      throw new InvalidGrant("mutual TLS client certificate not provided");
    }
  }

  const { AccessToken, IdToken, RefreshToken, ReplayDetection } =
    ctx.oidc.provider;

  const at = new AccessToken({
    accountId: account.accountId,
    client: ctx.oidc.client,
    expiresWithSession: password.expiresWithSession,
    grantId: password.grantId,
    gty,
    sessionUid: password.sessionUid,
    sid: password.sid,
  });

  if (ctx.oidc.client.tlsClientCertificateBoundAccessTokens) {
    at.setThumbprint("x5t", cert);
  }

  const dPoP = await dpopValidate(ctx);

  if (dPoP) {
    const unique = await ReplayDetection.unique(
      ctx.oidc.client.clientId,
      dPoP.jti,
      dPoP.iat + iatTolerance
    );

    if (!unique) new InvalidGrant("DPoP Token Replay detected");

    at.setThumbprint("jkt", dPoP.thumbprint);
  }

  const resource = await resolveResource(ctx, password, {
    userinfo,
    resourceIndicators,
  });

  if (resource) {
    const resourceServerInfo = await resourceIndicators.getResourceServerInfo(
      ctx,
      resource,
      ctx.oidc.client
    );
    at.resourceServer = new ctx.oidc.provider.ResourceServer(
      resource,
      resourceServerInfo
    );
    at.scope = grant.getResourceScopeFiltered(resource, password.scopes);
  } else {
    at.claims = password.claims;
    at.scope = grant.getOIDCScopeFiltered(password.scopes);
  }

  ctx.oidc.entity("AccessToken", at);
  const accessToken = await at.save();

  let refreshToken: string | undefined;
  if (await issueRefreshToken(ctx, ctx.oidc.client, password)) {
    const rt = new RefreshToken({
      accountId: account.accountId,
      acr: password.acr,
      amr: password.amr,
      authTime: password.authTime,
      claims: password.claims,
      client: ctx.oidc.client,
      expiresWithSession: password.expiresWithSession,
      grantId: password.grantId,
      gty,
      nonce: password.nonce,
      resource: password.resource,
      rotations: 0,
      scope: password.scope,
      sessionUid: password.sessionUid,
      sid: password.sid,
    });

    if (ctx.oidc.client.tokenEndpointAuthMethod === "none") {
      if (at.jkt) {
        rt.jkt = at.jkt;
      }

      if (ctx.oidc.client.tlsClientCertificateBoundAccessTokens) {
        rt["x5t#S256"] = at["x5t#S256"];
      }
    }

    ctx.oidc.entity("RefreshToken", rt);
    refreshToken = await rt.save();
  }

  let idToken: string | undefined;
  if (password.scopes.has("openid")) {
    const claims = filterClaims(password.claims, "id_token", grant);
    const rejected = grant.getRejectedOIDCClaims();
    const token = new IdToken(
      {
        ...(await account.claims("id_token", password.scope, claims, rejected)),
        acr: password.acr,
        amr: password.amr,
        auth_time: password.authTime,
      },
      { ctx }
    );

    if (conformIdTokenClaims && userinfo.enabled && !at.aud) {
      token.scope = "openid";
    } else {
      token.scope = grant.getOIDCScopeFiltered(password.scopes);
    }

    token.mask = claims;
    token.rejected = rejected;

    token.set("nonce", password.nonce);
    token.set("at_hash", accessToken);
    token.set("sid", password.sid);

    idToken = await token.issue({ use: "idtoken" });
  }

  ctx.body = {
    access_token: accessToken,
    expires_in: at.expiration,
    id_token: idToken,
    refresh_token: refreshToken,
    scope: at.scope,
    token_type: at.tokenType,
  };

  await next();
};
