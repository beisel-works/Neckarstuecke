import { NextResponse } from "next/server";
import { getOpenCoaTasks } from "@/lib/coa/admin";
import { isCoaAdminAuthorized } from "@/lib/admin-auth";

export async function GET(request: Request): Promise<NextResponse> {
  if (!isCoaAdminAuthorized(request.headers.get("authorization"))) {
    return NextResponse.json(
      { error: "Unauthorized." },
      {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="COA Admin"' },
      }
    );
  }

  const rows = await getOpenCoaTasks();
  return NextResponse.json({ rows });
}
