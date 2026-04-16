import { NextRequest, NextResponse } from "next/server";
import { captureHandledException } from "@/lib/sentry";
import { getServiceClient } from "@/lib/supabase/service";

function normalizeString(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (!normalized) return null;
  return normalized.slice(0, maxLength);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid inquiry payload." }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const payload = {
    name: normalizeString(record.name, 200),
    email: normalizeString(record.email, 320),
    delivery_country: normalizeString(record.delivery_country, 120),
    message:
      typeof record.message === "string" ? record.message.trim().slice(0, 2000) : "",
    print_slug: normalizeString(record.print_slug, 120),
    variant_label: normalizeString(record.variant_label, 120),
    price_hint: normalizeString(record.price_hint, 120),
    session_id: normalizeString(record.session_id, 120),
  };

  if (
    !payload.name ||
    !payload.email ||
    !payload.delivery_country ||
    !payload.print_slug ||
    !payload.variant_label
  ) {
    return NextResponse.json(
      { error: "Missing required inquiry fields." },
      { status: 400 }
    );
  }

  try {
    const db = getServiceClient();
    const { error } = await db.from("print_inquiries").insert(payload);

    if (error) {
      captureHandledException(error.message, {
        surface: "api.inquiries",
        statusCode: 500,
        extras: {
          print_slug: payload.print_slug,
          variant_label: payload.variant_label,
        },
      });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const notificationEmail = process.env.INQUIRY_NOTIFICATION_EMAIL;
    if (notificationEmail) {
      console.info(
        `[api.inquiries] TODO send inquiry notification to ${notificationEmail} for ${payload.print_slug} (${payload.variant_label}).`
      );
    } else {
      console.info(
        `[api.inquiries] TODO configure INQUIRY_NOTIFICATION_EMAIL for ${payload.print_slug} (${payload.variant_label}).`
      );
    }
  } catch (error) {
    captureHandledException(error, {
      surface: "api.inquiries",
      statusCode: 500,
      extras: {
        print_slug: payload.print_slug,
        variant_label: payload.variant_label,
      },
    });
    return NextResponse.json(
      { error: "Inquiry could not be stored." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
