import type { AppType } from "../../../server/rpc";
import { hc } from "hono/client";

const honoClient = hc<AppType>("/", { init: { credentials: "include" } }).api;

export default honoClient;
