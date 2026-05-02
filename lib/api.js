const DEFAULT_TIMEOUT_MS = 20000;

// Token storage key
const TOKEN_KEY = "krishak_auth_token";

// Get stored token (check cookies first, then localStorage)
function getStoredToken() {
  if (typeof window === "undefined") return null;
  try {
    // First check cookies (more reliable for cross-origin)
    const cookieToken = extractTokenFromDocumentCookies();
    if (cookieToken) {
      // Also store in localStorage for consistency
      if (localStorage.getItem(TOKEN_KEY) !== cookieToken) {
        localStorage.setItem(TOKEN_KEY, cookieToken);
      }
      return cookieToken;
    }
    // Fallback to localStorage
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

// Store token
function storeToken(token) {
  if (typeof window === "undefined") return;
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (e) {
    console.warn("Failed to store token:", e);
  }
}

// Extract token from document.cookie (fallback if cookies are set but not accessible via headers)
function extractTokenFromDocumentCookies() {
  if (typeof document === "undefined") return null;

  try {
    const cookies = document.cookie.split(";");
    // First check for our specific cookie name
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === TOKEN_KEY && value) {
        return decodeURIComponent(value);
      }
    }

    // Then check for common token cookie names
    const tokenCookieNames = [
      "token",
      "auth_token",
      "authToken",
      "access_token",
      "accessToken",
      "jwt",
      "session_token",
      "sessionToken",
    ];

    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (
        name &&
        value &&
        tokenCookieNames.some((tokenName) =>
          name.toLowerCase().includes(tokenName.toLowerCase())
        )
      ) {
        return decodeURIComponent(value);
      }
    }
  } catch (e) {
    console.warn("Failed to read cookies:", e);
  }

  return null;
}

function getBaseUrl() {
  // Prefer public URL per requirements
  const publicUrl =
    process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_ADMIN_API_URL;
  if (typeof window !== "undefined") {
    // Use env var if set, otherwise default to port 3000 (standard Next.js port)
    if (publicUrl) {
      return publicUrl;
    }
    // Default to port 3001 for admin API (standard Next.js dev server port)
    return "http://localhost:3001/api";
  }
  const serverUrl =
    publicUrl ||
    process.env.API_URL ||
    process.env.ADMIN_API_URL ||
    "http://localhost:3001/api";
  return serverUrl;
}

async function withTimeout(promise, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await promise(controller.signal);
    return res;
  } finally {
    clearTimeout(timer);
  }
}

function buildUrl(path, params) {
  const base = getBaseUrl().replace(/\/$/, "");
  let cleanPath = path.startsWith("/") ? path : `/${path}`;

  // Avoid double /api when base already ends with /api and path starts with /api
  if (base.endsWith("/api") && cleanPath.startsWith("/api/")) {
    cleanPath = cleanPath.slice(4);
  }

  // If base is a full URL (http://...), use it directly
  let url;
  if (base.startsWith("http://") || base.startsWith("https://")) {
    url = new URL(`${base}${cleanPath}`);
  } else {
    // Relative URL - use current origin
    url = new URL(
      `${base}${cleanPath}`,
      typeof window === "undefined" ? undefined : window.location.origin
    );
  }

  if (params && typeof params === "object") {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      if (Array.isArray(value)) {
        value.forEach((v) => url.searchParams.append(key, String(v)));
      } else {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

async function request(
  method,
  path,
  { params, body, headers, timeoutMs, credentials, cache, next } = {}
) {
  const url = buildUrl(path, params);

  const doFetch = async (signal) => {
    try {
      // Get stored token and add to headers if available
      const token = getStoredToken();
      const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

      return await fetch(url, {
        method,
        headers: {
          Accept: "application/json",
          ...(body instanceof FormData
            ? {}
            : { "Content-Type": "application/json" }),
          ...authHeaders,
          ...(headers || {}),
        },
        body:
          body instanceof FormData
            ? body
            : body !== undefined
              ? JSON.stringify(body)
              : undefined,
        credentials: credentials ?? (typeof window !== "undefined" ? "include" : "omit"),
        mode: "cors",
        signal,
        cache: cache || undefined,
        next: next || undefined,
      });
    } catch (error) {
      // Handle network errors
      if (error.name === "AbortError") {
        throw new Error("Request timeout. Please check your connection.");
      }
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        const baseUrl = url.split("/api")[0];
        throw new Error(
          `Network error: Unable to connect to API at ${baseUrl}/api. ` +
          `Please ensure:\n` +
          `1. The admin API server (krishak-admin) is running\n` +
          `2. It's running on the correct port (default: 3001)\n` +
          `3. Check your .env.local file: NEXT_PUBLIC_API_URL should be set to  (or your admin API port)`
        );
      }
      throw error;
    }
  };

  let response;
  try {
    response = await withTimeout(doFetch, timeoutMs ?? DEFAULT_TIMEOUT_MS);
  } catch (error) {
    // Re-throw network errors with better messages
    if (
      error.message.includes("Network error") ||
      error.message.includes("timeout")
    ) {
      throw error;
    }
    throw new Error(
      error.message || "Failed to fetch. Please check your connection."
    );
  }

  let data;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await response.json().catch(() => ({}));
  } else {
    data = await response.text();
  }

  // Check response body for token (browsers don't expose Set-Cookie headers)
  // Look for token in various common formats
  if (data && typeof data === "object") {
    const tokenFromBody =
      data.token ||
      data.accessToken ||
      data.access_token ||
      data.authToken ||
      data.data?.token ||
      data.data?.accessToken ||
      data.data?.access_token;

    if (tokenFromBody) {
      storeToken(tokenFromBody);
    } else if (response.ok && path.includes("/login")) {
      // If login was successful but no token in body, try reading from document.cookie
      // This handles cases where cookies are set but backend doesn't return token in body
      const tokenFromCookies = extractTokenFromDocumentCookies();
      if (tokenFromCookies) {
        storeToken(tokenFromCookies);
      }
    }
  }

  if (!response.ok) {
    const message =
      (data && (data.message || data.error)) ||
      `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  // Normalize different success shapes to { success, message, data }
  if (data && typeof data === "object") {
    if (data.success === true) {
      return {
        success: true,
        message: data.message || "",
        data: data.data ?? data.items ?? data.boxes ?? data,
      };
    }
    // Some admin routes return raw lists (e.g., designs)
    if (!("success" in data)) {
      return { success: true, message: "", data };
    }
  }

  return { success: true, message: "", data };
}

export const api = {
  get: (path, options) => request("GET", path, options),
  post: (path, body, options = {}) =>
    request("POST", path, { ...options, body }),
  put: (path, body, options = {}) => request("PUT", path, { ...options, body }),
  delete: (path, options) => request("DELETE", path, options),
};

export function setApiBaseUrl(url) {
  process.env.NEXT_PUBLIC_API_URL = url;
}

// Export function to clear stored token (for logout)
export function clearStoredToken() {
  storeToken(null);
}

export default api;
