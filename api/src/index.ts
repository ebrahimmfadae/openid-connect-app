import cors from "@koa/cors";
import Koa from "koa";
import router from "./routes";

const app = new Koa();

app.use(cors());
app.use(router().routes());

app.listen(process.env.PORT, () => {
  console.log(`api listening on port ${process.env.PORT}`);
});
