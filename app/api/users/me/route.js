import { NextResponse } from "next/server";

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_ADMIN_API_URL ||
  "http://localhost:3001/api";

export async function GET(request) {
  try {
    // Get the token from cookies (set by the login proxy)
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // Forward the request to the backend with the token
    const response = await fetch(`${BACKEND_API_URL}/users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Cookie: `token=${token}`, // Forward the cookie
        Origin: request.headers.get("origin") || "",
        Referer: request.headers.get("referer") || "",
      },
      credentials: "include",
      redirect: "follow",
    });

    // Check if the response is JSON before parsing
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      console.error(
        `GetMe proxy: Backend returned non-JSON response (${contentType}), status: ${response.status}`
      );
      return NextResponse.json(
        {
          success: false,
          message: "Backend service unavailable. Please try again later.",
        },
        { status: 502 }
      );
    }

    const data = await response.json();

    // Create response with same status
    const nextResponse = NextResponse.json(data, { status: response.status });

    return nextResponse;
  } catch (error) {
    console.error("GetMe proxy error:", error);
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
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}
