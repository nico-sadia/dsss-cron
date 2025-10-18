import { getLogger } from "../utils/logContext";

export const handleDbError = (err: Error): never => {
    const logger = getLogger();
    logger.error({ err }, "DB: Database error");
    throw new Error(`Database operation failed: ${err.message}`);
};
