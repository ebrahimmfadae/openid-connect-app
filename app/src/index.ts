import Koa from "koa";
import render from "koa-ejs";
import koaStatic from "koa-static";
import path from "path";
import router from "./routes";

const app = new Koa();
render(app, {
  cache: false,
  viewExt: "ejs",
  layout: false,
  root: path.resolve("app/src/views"),
});

app.use(koaStatic(path.resolve("public")));
app.use(router().routes());

app.listen(process.env.PORT, () => {
  console.log(`sample-app listening on port ${process.env.PORT}`);
});
