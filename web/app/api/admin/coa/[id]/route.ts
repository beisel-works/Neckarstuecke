import { NextResponse } from "next/server";
import { markCoaAsDispatched } from "@/lib/coa/admin";
import { isCoaAdminAuthorized } from "@/lib/admin-auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  if (!isCoaAdminAuthorized(request.headers.get("authorization"))) {
    return NextResponse.json(
      { error: "Unauthorized." },
      {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="COA Admin"' },
      }
    );
  }

  const { id } = await params;
  await markCoaAsDispatched(id);
  return NextResponse.json({ ok: true });
}
