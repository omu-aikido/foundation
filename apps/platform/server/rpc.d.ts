import type App from "./src/index";
import type { WorkerEnv } from "./env";

export type AppBindings = WorkerEnv;
export type AppType = typeof App;
