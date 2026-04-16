"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { OpenCoaTask } from "@/lib/coa/admin";

interface CoaAdminTableProps {
  rows: OpenCoaTask[];
}

export default function CoaAdminTable({ rows }: CoaAdminTableProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleDispatch(certificateId: string) {
    setPendingId(certificateId);

    try {
      const response = await fetch(`/api/admin/coa/${certificateId}`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error("COA dispatch update failed.");
      }

      router.refresh();
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="overflow-x-auto border border-[var(--color-loess)]">
      <table className="min-w-full divide-y divide-[var(--color-loess)]">
        <thead className="bg-[var(--color-paper)]">
          <tr>
            {["Bestellung", "E-Mail", "Motiv", "Format", "Edition", "Status", ""].map((label) => (
              <th
                key={label}
                className="px-4 py-3 text-left text-[var(--color-stone)]"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "var(--text-caption)",
                  fontWeight: 500,
                }}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-loess)] bg-white">
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="px-4 py-3">{row.orderId ?? "-"}</td>
              <td className="px-4 py-3">{row.customerEmail ?? "-"}</td>
              <td className="px-4 py-3">{row.printSlug}</td>
              <td className="px-4 py-3">{row.formatLabel}</td>
              <td className="px-4 py-3">Nr. {row.editionNumber}</td>
              <td className="px-4 py-3">{row.coaStatus}</td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => handleDispatch(row.id)}
                  disabled={pendingId === row.id}
                  className="border border-[var(--color-charcoal)] px-4 py-2 text-[var(--color-charcoal)] transition-colors hover:bg-[var(--color-loess)] disabled:opacity-60"
                >
                  {pendingId === row.id ? "Speichert..." : "Als versendet markieren"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
