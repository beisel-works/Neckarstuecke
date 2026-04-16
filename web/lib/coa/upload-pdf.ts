import { getServiceClient } from "@/lib/supabase/service";

export async function uploadCoaPdf(
  orderId: string,
  orderItemId: string,
  pdfBytes: Buffer
): Promise<string> {
  const db = getServiceClient();
  const path = `${orderId}/${orderItemId}.pdf`;
  const { error } = await db.storage
    .from("coa-pdfs")
    .upload(path, pdfBytes, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (error) {
    throw new Error(`COA PDF upload failed: ${error.message}`);
  }

  return path;
}
