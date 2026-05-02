import { NextResponse } from "next/server";

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_ADMIN_API_URL ||
  "https://swaadm-admin.vercel.app/api";

export async function POST(request) {
  try {
    // Get the token from cookies
    const token = request.cookies.get("token")?.value;

    // Forward the request to the backend
    const response = await fetch(`${BACKEND_API_URL}/users/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: token ? `token=${token}` : "",
        Origin: request.headers.get("origin") || "",
        Referer: request.headers.get("referer") || "",
      },
      credentials: "include",
      redirect: "follow",
    });

    const data = await response.json();

    // Create response with same status
    const nextResponse = NextResponse.json(data, { status: response.status });

    // Clear the cookie on the frontend domain
    const isProduction =
      process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
    nextResponse.cookies.set("token", "", {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 0, // Delete the cookie
    });

    return nextResponse;
  } catch (error) {
    console.error("Logout proxy error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to logout",
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
