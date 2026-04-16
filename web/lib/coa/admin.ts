import { getServiceClient } from "@/lib/supabase/service";
import type { CoaStatus } from "@/types/order";

export interface OpenCoaTask {
  id: string;
  orderItemId: string;
  orderId: string | null;
  customerEmail: string | null;
  editionNumber: number;
  printSlug: string;
  formatLabel: string;
  coaStatus: CoaStatus;
}

export async function getOpenCoaTasks(): Promise<OpenCoaTask[]> {
  const db = getServiceClient();
  const { data: certificates, error: certificateError } = await db
    .from("certificates_of_authenticity")
    .select("id, order_item_id, edition_number, print_slug, format_label, coa_status")
    .in("coa_status", ["pending", "printed"])
    .order("created_at");

  if (certificateError) {
    throw new Error(`Failed to load COA certificates: ${certificateError.message}`);
  }

  const orderItemIds = (certificates ?? []).map((certificate) => certificate.order_item_id);
  if (orderItemIds.length === 0) {
    return [];
  }

  const { data: orderItems, error: orderItemsError } = await db
    .from("order_items")
    .select("id, order_id, orders(customer_email)")
    .in("id", orderItemIds);

  if (orderItemsError) {
    throw new Error(`Failed to load COA order items: ${orderItemsError.message}`);
  }

  const orderItemsById = new Map(
    (orderItems ?? []).map((item) => {
      const orderRecord = Array.isArray(item.orders) ? item.orders[0] : item.orders;
      return [
        item.id,
        {
          orderId: item.order_id,
          customerEmail: orderRecord?.customer_email ?? null,
        },
      ];
    })
  );

  return (certificates ?? []).map((certificate) => {
    const orderItem = orderItemsById.get(certificate.order_item_id);
    return {
      id: certificate.id,
      orderItemId: certificate.order_item_id,
      orderId: orderItem?.orderId ?? null,
      customerEmail: orderItem?.customerEmail ?? null,
      editionNumber: certificate.edition_number,
      printSlug: certificate.print_slug,
      formatLabel: certificate.format_label,
      coaStatus: certificate.coa_status,
    };
  });
}

export async function markCoaAsDispatched(certificateId: string): Promise<void> {
  const db = getServiceClient();
  const { error } = await db
    .from("certificates_of_authenticity")
    .update({ coa_status: "dispatched" })
    .eq("id", certificateId)
    .in("coa_status", ["pending", "printed"]);

  if (error) {
    throw new Error(`Failed to update COA status: ${error.message}`);
  }
}
