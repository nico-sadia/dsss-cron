"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogger = exports.runWithContext = void 0;
const node_async_hooks_1 = require("node:async_hooks");
const logger_1 = require("./logger");
const context = new node_async_hooks_1.AsyncLocalStorage();
const runWithContext = (ctx, fn) => __awaiter(void 0, void 0, void 0, function* () {
    // Store metadata inside the context
    return yield context.run(ctx, fn);
});
exports.runWithContext = runWithContext;
const getLogger = () => {
    const ctx = context.getStore();
    // Return logger with ctx or the base logger without
    return ctx ? logger_1.baseLogger.child(ctx) : logger_1.baseLogger;
};
exports.getLogger = getLogger;
