import cors from "@koa/cors";
import dotenv from "dotenv";
import Koa from "koa";
import path from "path";
import router from "./routes";

dotenv.config({ path: path.resolve("api/.env") });

const app = new Koa();

app.use(cors());
app.use(router().routes());

app.listen(process.env.PORT, () => {
  console.log(
    `api listening on port ${process.env.PORT}, check http://localhost:${process.env.PORT}`
  );
});
