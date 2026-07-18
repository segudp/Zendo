import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode"; // I should use a simple base64 decode if jwt-decode isn't installed. I'll write a simple decoder.

interface DecodedToken {
  role: string;
  exp: number;
}

// Simple base64url decode function to avoid extra dependencies for the edge middleware
function parseJwt(token: string): DecodedToken | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const path = request.nextUrl.pathname;

  // Si no hay token y quiere acceder al dashboard, redirigir al login
  if (!token && path.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (!token && path.startsWith("/commerce")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token) {
    const decoded = parseJwt(token);
    const userRole = decoded?.role;

    // Redirigir al inicio correspondiente si entra a / o /login
    if (path === "/" || path === "/login") {
      if (userRole === "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/admin", request.url));
      } else if (userRole === "COMMERCE_OWNER" || userRole === "COMMERCE_STAFF") {
        return NextResponse.redirect(new URL("/commerce", request.url));
      }
    }

    // RBAC Security
    if (path.startsWith("/admin") && userRole !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/commerce", request.url));
    }
    
    if (path.startsWith("/commerce") && (userRole !== "COMMERCE_OWNER" && userRole !== "COMMERCE_STAFF")) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
