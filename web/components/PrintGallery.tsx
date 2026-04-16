"use client";

import { useState } from "react";
import Image from "next/image";

type GalleryView = "artwork" | "mockup";

interface PrintGalleryProps {
  title: string;
  artworkUrl: string | null;
  mockupUrl: string | null;
}

export default function PrintGallery({
  title,
  artworkUrl,
  mockupUrl,
}: PrintGalleryProps) {
  const [view, setView] = useState<GalleryView>("artwork");
  const activeUrl = view === "mockup" && mockupUrl ? mockupUrl : artworkUrl;
  const activeLabel = view === "mockup" ? "Gerahmte Vorschau" : "Artwork";

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[var(--color-loess)]">
        {activeUrl ? (
          <Image
            src={activeUrl}
            alt={view === "mockup" ? `${title} gerahmte Vorschau` : title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-8 text-center text-[var(--color-stone)]">
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-h2)",
                lineHeight: "var(--leading-h2)",
              }}
            >
              {title}
            </span>
          </div>
        )}
      </div>

      {mockupUrl ? (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setView("artwork")}
            aria-pressed={view === "artwork"}
            className={`border px-4 py-2 transition-colors ${
              view === "artwork"
                ? "border-[var(--color-charcoal)] bg-[var(--color-charcoal)] text-[var(--color-paper)]"
                : "border-[var(--color-loess)] bg-transparent text-[var(--color-charcoal)]"
            }`}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--text-caption)",
            }}
          >
            Artwork
          </button>
          <button
            type="button"
            onClick={() => setView("mockup")}
            aria-pressed={view === "mockup"}
            className={`border px-4 py-2 transition-colors ${
              view === "mockup"
                ? "border-[var(--color-charcoal)] bg-[var(--color-charcoal)] text-[var(--color-paper)]"
                : "border-[var(--color-loess)] bg-transparent text-[var(--color-charcoal)]"
            }`}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--text-caption)",
            }}
          >
            Gerahmte Vorschau
          </button>
          <span
            className="text-[var(--color-stone)]"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--text-caption)",
            }}
          >
            {activeLabel}
          </span>
        </div>
      ) : null}
    </div>
  );
}
