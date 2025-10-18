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
exports.spotifyRequest = void 0;
const error_1 = require("./error");
const spotifyRequest = (_a) => __awaiter(void 0, [_a], void 0, function* ({ url, payload, params, accessToken, }) {
    var _b;
    // Default to get GET request if no method given
    const headers = buildHeaders(accessToken, (_b = payload.method) !== null && _b !== void 0 ? _b : "GET");
    // Format body based on type of data given
    const body = normalizeBody(payload.body);
    // Append query string
    url += buildQueryString(params);
    const res = yield fetch(url, Object.assign(Object.assign({}, payload), { headers,
        body }));
    if (!res.ok)
        yield (0, error_1.handleSpotifyError)(res);
    const data = yield res.json();
    return data;
});
exports.spotifyRequest = spotifyRequest;
// Build query string with params
const buildQueryString = (params) => {
    if (!params || Object.keys(params).length === 0) {
        return "";
    }
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
            query.append(key, String(value));
        }
    }
    return `?${query.toString()}`;
};
const buildHeaders = (accessToken, method) => {
    const headers = {
        Authorization: `Bearer ${accessToken}`,
    };
    if (method !== "GET" && method !== "DELETE") {
        headers["Content-Type"] = "application/json";
    }
    return headers;
};
const normalizeBody = (body) => {
    if (body instanceof FormData ||
        body instanceof URLSearchParams ||
        typeof body === "string" ||
        body instanceof Blob) {
        return body;
    }
    return JSON.stringify(body);
};
