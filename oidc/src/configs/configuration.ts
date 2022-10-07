import { Configuration } from "oidc-provider";
import { MongoDbAdapter } from "../adapters/mongodb";
import * as accountService from "../services/account-persist.service";

export const configuration: Configuration = {
  scopes: ["api:read", "api:write", "offline_access"],
  adapter: MongoDbAdapter,
  clientBasedCORS() {
    return true;
  },
  async findAccount(_, id) {
    const account = await accountService.get(id);
    return (
      account && {
        accountId: id,
        async claims(_, scope) {
          if (!scope) return undefined;
          const openid = { sub: id };
          const email = {
            email: account.email,
            email_verified: account.emailVerified,
          };
          const accountInfo = {}
          if (scope.includes("openid")) Object.assign(accountInfo, openid)
          if (scope.includes("email")) Object.assign(accountInfo, email)
          return accountInfo
        },
      }
    );
  },
  clients: [
    {
      client_id: "app",
      client_secret: "scorpion",
      redirect_uris: ["http://localhost:3005/cb"],
      grant_types: [
        "authorization_code",
        "password",
        "refresh_token",
        "client_credentials",
      ],
      scope: "openid email profile phone address offline_access api:read",
    },
    {
      client_id: "api",
      client_secret: "night-wolf",
      redirect_uris: [],
      response_types: [],
      grant_types: ["client_credentials"],
      scope: "openid email profile phone address",
    },
  ],
  claims: {
    address: ["address"],
    email: ["email", "email_verified"],
    phone: ["phone_number", "phone_number_verified"],
    profile: [
      "birthdate",
      "family_name",
      "gender",
      "given_name",
      "locale",
      "middle_name",
      "name",
      "nickname",
      "picture",
      "preferred_username",
      "profile",
      "updated_at",
      "website",
      "zoneinfo",
    ]
  },
  features: {
    clientCredentials: { enabled: true },
    introspection: {
      enabled: true,
      allowedPolicy(ctx, client, token) {
        return client.introspectionEndpointAuthMethod !== "none" ||
          token.clientId === ctx.oidc.client?.clientId
      },
    },
    revocation: { enabled: true },
    devInteractions: { enabled: false },
    resourceIndicators: {
      enabled: true,
      useGrantedResource() {
        return true
      },
      defaultResource(ctx) {
        return Array.isArray(ctx.oidc.params?.resource)
          ? ctx.oidc.params?.resource[0]
          : ctx.oidc.params?.resource;
      },
      getResourceServerInfo() {
        return {
          scope: "api:read offline_access",
        };
      },
    },
  },
  jwks: {
    keys: [
      {
        kty: "RSA",
        n: "jw3bixcae4ktBdXYcKeK5J7pmsXvQdvuOB8yv_q426tsMDlTZ1jj9CgYEZF_SCfzwQ5pcogLD-WY-LYJtt8zfjU_mWZZWcbR1QcMIWhLsSdi2OSlksIewMiv5CzvDBzs6h9sU0yr6yY6SYmT89jXU-D0MqSakDR0x0tyVUonGAWiVGJYINCCEbonoqFYAXjKdrNCCIliXiWQS6rajkEEXj0I2uQr4L1S80mSWWvDfFmFw4yC7V9nOGf1OPotscLCpT7vzlhHCuh3rY12bTEceZeARQ9G9aWQMBhQZPIPBvLdTRl5smFByFJ_FWs2yXXdHXFRo2L8UgwV2D4qVlgUXw",
        e: "AQAB",
        d: "PodKHUPd-X1-RnywfJ1fIosrhNFbwSfGupU4c529y5bkVTfZcuTxzrjvvE4imoGMFCiegsdgPnSXJq87E8oAEfxobj7Ec29qLHlGHhweabLTjAZ1MO7UzmNqLoxNeLfz_mn5yXdL9h7hf185Ym63wBwl4TT9smabXLlnokwlRmQXL-FWN5P50X60XgPG9hbv5BGPCrfbNNkLzae3fVeTfAZUYw-rwfrKN_HVUz78lo3cNhE2AVMnIF2CeZeH1xrUC81MWGJi7W1R1MtMTUObdqCpqLMtoWSojF3UT0pOMCiMeEt25EGpMiRVNy8HQD-z92uBEh8n2DYWb8Fou1Wa0Q",
        p: "23oJTOlWauw_fQJxBmwkfzPL_j9p_Fjtf_ThESn4ZpCkl2Y5cKSqc70bBP3SkgKRWWIt8QunkmkSHDmVzu0_UQu7YgCxqwwR8TvK8uCgNw8umtE_2w2fvf8l_863TEg4btz87kMtk01vWRUcqQxlBvd-bTmL8FDm0iblkskSpbs",
        q: "ptwhZzh1TkXFiglDz04_dC6s-Ek_qRxTtUSdhaRr7UDzpa_mEEd41m3kgmjgIlK-FgDpf66N4OWHQow76PVtRUAQSZDSPo4k8TNs5AY_oyzIBAWBnakfs8L368Vo4O3RZJ4wiMqnphTRGiM6rLOev74uTILcVnPgDZLbAm2Gb60",
        dp: "QDjIienpcKYqucDCI_f3AgW9Fmul7sJy1LNqPGSEnDaNAwRVoIF-oxld06sWN8VqlLYm7VbUtQHr27h5_q_rjCKbtUSwuHVytp0heMqD9ziJEaJTRh0JdkY370-k0Tx8zuv5UxrzNhw9jdqgpVLMKSq4outo6Gwz7qCVIsuVmks",
        dq: "FHPNAFryPfrdYLMMBcAAlRwXhYNs8yyOshxL9pKVzAn3E2sBFyO7kwT7SmTSfEKKHCZWeJkLuPJJZwXLXh2fHCrjFDFVI-fGbW4xPa3qZPTbO2r1XT7arO0L-HFFDrT3wo6FQm8cp4XLr5l72qlVnwkPob80hMBFSUSj5aNJJC0",
        qi: "MJJ6KTrCdq1gEgH-MpDF4DeXhE_dlB1P2am3juUR8ieZmohWbruBo6vmA_9Fm_lUs6V3qZ7gjbszguQZwcIFnvXceOBMH35_8TQLM3IrnNTJJTyWslrH3rdLAsIPk_x0cgIJ_gC0BHiQ9TfW8mKjGAK0JRv-V8XXnT4ZFQrlmQI",
      },
    ],
  },
  cookies: {
    keys: ["subzero"],
  },
  ttl: {
    AccessToken: function AccessTokenTTL(_, token) {
      if (token.resourceServer) {
        return token.resourceServer.accessTokenTTL || 60 * 60; // 1 hour in seconds
      }
      return 60 * 60; // 1 hour in seconds
    },
    AuthorizationCode: 600 /* 10 minutes in seconds */,
    BackchannelAuthenticationRequest:
      function BackchannelAuthenticationRequestTTL(ctx) {
        if (ctx && ctx.oidc && ctx.oidc.params?.requested_expiry) {
          return Math.min(10 * 60, ctx.oidc.params?.requested_expiry as number); // 10 minutes in seconds or requested_expiry, whichever is shorter
        }
        return 10 * 60; // 10 minutes in seconds
      },
    ClientCredentials: function ClientCredentialsTTL(token) {
      if (token.resourceServer) {
        return token.resourceServer.accessTokenTTL || 10 * 60; // 10 minutes in seconds
      }
      return 10 * 60; // 10 minutes in seconds
    },
    DeviceCode: 600 /* 10 minutes in seconds */,
    Grant: 1209600 /* 14 days in seconds */,
    IdToken: 3600 /* 1 hour in seconds */,
    Interaction: 3600 /* 1 hour in seconds */,
    RefreshToken: function RefreshTokenTTL(ctx, token, client) {
      if (
        ctx &&
        ctx.oidc.entities.RotatedRefreshToken &&
        client.applicationType === "web" &&
        client.tokenEndpointAuthMethod === "none" &&
        !token.isSenderConstrained()
      ) {
        // Non-Sender Constrained SPA RefreshTokens do not have infinite expiration through rotation
        return ctx.oidc.entities.RotatedRefreshToken.remainingTTL;
      }
      return 14 * 24 * 60 * 60; // 14 days in seconds
    },
    Session: 1209600 /* 14 days in seconds */,
  },
};
