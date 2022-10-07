import Koa from "koa";
import render from "koa-ejs";
import mount from "koa-mount";
import koaStatic from "koa-static";
import path from "path";
import { configuration } from "./configs/configuration";
import { oidc } from "./configs/provider";
import connectMongodb from "./db/mongodb/connection";
import router from "./routes";

const start = async () => {
  await connectMongodb();

  const app = new Koa();
  render(app, {
    cache: false,
    viewExt: "ejs",
    layout: false,
    root: path.resolve("oidc/src/views"),
  });

  const provider = oidc(process.env.OIDC_ISSUER as string, configuration);

  app.use(koaStatic(path.resolve("public")));
  app.use(router(provider).routes());
  app.use(mount(provider.app));

  app.listen(process.env.PORT, () => {
    console.log(`oidc-provider listening on port ${process.env.PORT}`);
  });
};

void start();
