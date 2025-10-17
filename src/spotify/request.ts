import { handleSpotifyError } from "./error";

type QueryParams = Record<string, string | number | boolean | undefined>;

type SpotifyRequestProps = {
    url: string;
    payload: RequestInit;
    params?: QueryParams;
    accessToken: string;
};

export const spotifyRequest = async <T>({
    url,
    payload,
    params,
    accessToken,
}: SpotifyRequestProps): Promise<T> => {
    // Default to get GET request if no method given
    const headers: HeadersInit = buildHeaders(
        accessToken,
        payload.method ?? "GET"
    );

    // Format body based on type of data given
    const body = normalizeBody(payload.body);

    // Append query string
    url += buildQueryString(params);

    const res = await fetch(url, {
        ...payload,
        headers,
        body,
    });

    if (!res.ok) await handleSpotifyError(res);
    const data = await res.json();
    return data as Promise<T>;
};

// Build query string with params
const buildQueryString = (params?: QueryParams) => {
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

const buildHeaders = (accessToken: string, method: string) => {
    const headers: HeadersInit = {
        Authorization: `Bearer ${accessToken}`,
    };

    if (method !== "GET" && method !== "DELETE") {
        headers["Content-Type"] = "application/json";
    }

    return headers;
};

const normalizeBody = (body: any) => {
    if (
        body instanceof FormData ||
        body instanceof URLSearchParams ||
        typeof body === "string" ||
        body instanceof Blob
    ) {
        return body;
    }

    return JSON.stringify(body);
};
