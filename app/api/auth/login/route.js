import { NextResponse } from "next/server";

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_ADMIN_API_URL ||
  "https://swaadm-admin.vercel.app/api";

export async function POST(request) {
  try {
    const body = await request.json();
    const url = new URL(request.url);
    const fromCheckout = url.searchParams.get('from');
    const response = await fetch(`${BACKEND_API_URL}/users/login?from=${fromCheckout}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: request.headers.get("origin") || "",
        Referer: request.headers.get("referer") || "",
      },
      body: JSON.stringify(body),
      redirect: "follow",
    });

    const data = await response.json();
    // Create response with same status
    const nextResponse = NextResponse.json(data, { status: response.status });

    // Note: Set-Cookie headers are not accessible via fetch API for security reasons
    // The backend sets the cookie, but we can't read it from the response headers
    // Instead, we'll rely on the backend to set the cookie directly on the client
    // OR we can modify the backend to return the token in the response body

    // If login was successful and we have user data, the cookie should be set by the backend
    // However, since we're proxying, the cookie won't be set automatically
    // We need to check if the backend returns a token in the response body
    // If not, we'll need to modify the backend to do so, or use a different approach

    // For now, let's check if there's a token in the response data
    const token = data?.token || data?.data?.token;
    if (token && data.success) {
      // Set the cookie on the proxy response so it gets sent to the client
      // In production (Vercel), use secure cookies over HTTPS
      const isProduction =
        process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
      nextResponse.cookies.set("token", token, {
        httpOnly: true,
        secure: isProduction, // Use secure cookies in production (HTTPS required)
        sameSite: "lax", // Allows cookies to be sent with top-level navigations
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days (increased from 1 hour for better UX)
        // Don't set domain - let it default to current domain
      });
    }

    return nextResponse;
  } catch (error) {
    console.error("Login proxy error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to connect to server",
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": request.headers.get("origin") || "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}
