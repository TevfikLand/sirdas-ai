import { env } from "../../config/env.js";
import type { AiProvider } from "./types.js";

export class AiUnavailableError extends Error {
  constructor() { super("AI_NOT_CONFIGURED"); }
}

class DisabledProvider implements AiProvider {
  readonly name = "disabled";
  async analyzeEntry(): Promise<never> { throw new AiUnavailableError(); }
}

export function getAiProvider(): AiProvider {
  if (env.AI_PROVIDER === "disabled") return new DisabledProvider();
  throw new AiUnavailableError();
}
