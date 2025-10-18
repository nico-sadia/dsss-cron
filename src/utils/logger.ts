import pino from "pino";

export const baseLogger = pino({
    level: process.env.NODE_ENV === "development" ? "debug" : "info",
    transport:
        process.env.NODE_ENV === "development"
            ? {
                  target: "pino-pretty",
                  options: {
                      colorize: true,
                      translateTime: "HH:MM:ss",
                      ignore: "pid,hostname",
                  },
              }
            : undefined,
});

// Files can add context such as type of job to base logger
export const createLogger = (context: object) => baseLogger.child(context);
