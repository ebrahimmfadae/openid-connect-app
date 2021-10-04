import { Middleware } from "koa";

export default (): { [key: string]: Middleware } => ({
  pi: async (ctx) => {
    ctx.status = 200;
    ctx.message = Math.PI.toString();
  },
});
