import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_USER = process.env.ADMIN_USERNAME ?? "admin";
const ADMIN_PASS = process.env.ADMIN_PASSWORD ?? "logicbiz123";

function unauthorized() {
  return new NextResponse("Acceso restringido", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Panel admin LogicBiz"',
    },
  });
}

function isAdminAuthorized(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return false;
  }

  const base64Credentials = authHeader.slice("Basic ".length);
  const credentials = atob(base64Credentials);
  const separatorIndex = credentials.indexOf(":");
  if (separatorIndex === -1) {
    return false;
  }
  const username = credentials.slice(0, separatorIndex);
  const password = credentials.slice(separatorIndex + 1);

  return username === ADMIN_USER && password === ADMIN_PASS;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const needsAuthForAdmin = pathname.startsWith("/admin");
  const needsAuthForProjectsMutation =
    pathname.startsWith("/api/projects") && request.method !== "GET";

  if (needsAuthForAdmin || needsAuthForProjectsMutation) {
    if (!isAdminAuthorized(request)) {
      return unauthorized();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/projects"],
};
