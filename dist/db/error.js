"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleDbError = void 0;
const logContext_1 = require("../utils/logContext");
const handleDbError = (err) => {
    const logger = (0, logContext_1.getLogger)();
    logger.error({ err }, "DB: Database error");
    throw new Error(`Database operation failed: ${err.message}`);
};
exports.handleDbError = handleDbError;
