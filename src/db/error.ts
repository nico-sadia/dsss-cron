import { getLogger } from "../utils/logContext";

export const handleDbError = (error: Error): never => {
    const logger = getLogger();
    logger.error({ error }, "DB: Database error");
    throw new Error(`Database operation failed: ${error.message}`);
};
