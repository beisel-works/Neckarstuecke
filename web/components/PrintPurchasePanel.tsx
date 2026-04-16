"use client";

import { useState } from "react";
import SizeSelector from "@/components/SizeSelector";
import PrintInquiryForm from "@/components/PrintInquiryForm";
import type { PrintVariantRow } from "@/types/print";

interface PrintPurchasePanelProps {
  variants: PrintVariantRow[];
  printTitle: string;
  printId: string;
  printSlug: string;
  printImageUrl?: string | null;
}

export default function PrintPurchasePanel({
  variants,
  printTitle,
  printId,
  printSlug,
  printImageUrl,
}: PrintPurchasePanelProps) {
  const [showInquiry, setShowInquiry] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <SizeSelector
        variants={variants}
        printTitle={printTitle}
        printId={printId}
        printSlug={printSlug}
        printImageUrl={printImageUrl}
        onRequestInquiry={() => setShowInquiry(true)}
      />
      {showInquiry ? (
        <PrintInquiryForm printTitle={printTitle} printSlug={printSlug} />
      ) : null}
    </div>
  );
}
