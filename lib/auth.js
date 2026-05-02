import { api, clearStoredToken } from "@/lib/api";

export async function login({
  params,
  email,
  password,
  deviceInfo,
  ipAddress,
  location,
  loginMethod,
} = {}) {
  const body = {
    email,
    password,
    deviceInfo,
    ipAddress,
    location,
    loginMethod,
  };

  try {
    let url = `/api/auth/login`;

    if (typeof params === 'string' && params.trim() !== '') {
      url += `?from=${encodeURIComponent(params)}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data.message || "Login failed");
      error.status = response.status;
      throw error;
    }

    // Store token if present in response
    if (data.token) {
      if (typeof window !== "undefined") {
        localStorage.setItem("krishak_auth_token", data.token);
      }
    }

    // Normalize response to match api.post format
    return {
      success: data.success || true,
      message: data.message || "Login successful",
      data: data.data || data,
    };
  } catch (error) {
    throw error;
  }
}

export async function logout() {
  // Use Next.js API route proxy for logout to handle cookies properly
  // The proxy route is at /api/users/logout and will forward to the backend
  try {
    const response = await fetch("/api/users/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || "Logout failed");
      error.status = response.status;
      throw error;
    }
  } finally {
    // Always clear the stored token, even if the API call fails
    clearStoredToken();
  }
}

export async function getMe() {
  // Use Next.js API route proxy for getMe to handle cookies properly
  // The proxy route is at /api/users/me and will forward to the backend
  try {
    const response = await fetch("/api/users/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || "Failed to get user");
      error.status = response.status;
      throw error;
    }

    // Normalize response to match api.get format
    return {
      success: data.success !== false,
      message: data.message || "",
      data: data.data || data,
    };
  } catch (error) {
    throw error;
  }
}

