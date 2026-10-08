import type App from "../../../apps/platform/server/src/index";
import type { WorkerEnv } from "../../../apps/platform/server/env";

export type AppBindings = WorkerEnv;
export type AppType = typeof App;
