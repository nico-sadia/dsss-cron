import { AsyncLocalStorage } from "node:async_hooks";
import { baseLogger } from "./logger";

type LogContext = { userId?: string; job?: string };
const context = new AsyncLocalStorage<LogContext>();

export const runWithContext = async (
    ctx: LogContext,
    fn: () => Promise<void>
) => {
    // Store metadata inside the context
    return await context.run(ctx, fn);
};

export const getLogger = () => {
    const ctx = context.getStore();

    // Return logger with ctx or the base logger without
    return ctx ? baseLogger.child(ctx) : baseLogger;
};
