import { NextResponse, type NextRequest } from "next/server";
import { isCoaAdminAuthorized } from "@/lib/admin-auth";

export function proxy(request: NextRequest) {
  if (isCoaAdminAuthorized(request.headers.get("authorization"))) {
    return NextResponse.next();
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="COA Admin", charset="UTF-8"',
    },
  });
}

export const config = {
  matcher: ["/admin/coa"],
};
