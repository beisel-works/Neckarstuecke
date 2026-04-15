import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-6 py-24 text-center md:py-36 md:px-10">
        <p
          className="mb-6 tracking-[0.12em] uppercase text-[var(--color-sage)]"
          style={{
            fontSize: "var(--text-overline)",
            fontFamily: "var(--font-sans)",
            letterSpacing: "var(--tracking-overline)",
          }}
        >
          Erste Kollektion — 2026
        </p>
        <h1
          className="mb-6 max-w-3xl text-[var(--color-charcoal)]"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.25rem, 5vw, var(--text-display))",
            lineHeight: "var(--leading-display)",
            letterSpacing: "var(--tracking-display)",
          }}
        >
          Das Neckartal.
          <br />
          Unvergänglich.
        </h1>
        <p
          className="mb-10 max-w-xl text-[var(--color-charcoal)]"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-body)",
            lineHeight: "var(--leading-body)",
          }}
        >
          Feinkunstdrucke für Menschen, die das Neckartal kennen — jene, die
          geblieben sind, und jene, die gegangen sind und es noch immer in sich
          tragen.
        </p>
        <Link
          href="/kollektion"
          className="inline-flex items-center justify-center rounded-none border border-[var(--color-charcoal)] bg-[var(--color-charcoal)] px-8 py-3 text-[var(--color-paper)] transition-colors hover:bg-[var(--color-sage)] hover:border-[var(--color-sage)]"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-label)",
            letterSpacing: "var(--tracking-label)",
            fontWeight: 500,
          }}
        >
          Kollektion entdecken
        </Link>
      </section>

      {/* Divider */}
      <div
        className="mx-auto h-px w-16 bg-[var(--color-loess)]"
        aria-hidden="true"
      />

      {/* Collection teaser placeholder */}
      <section className="px-6 py-16 md:px-10 md:py-24">
        <div
          className="mx-auto"
          style={{ maxWidth: "var(--container-content)" }}
        >
          <p
            className="mb-10 tracking-[0.12em] uppercase text-[var(--color-sage)] text-center"
            style={{
              fontSize: "var(--text-overline)",
              fontFamily: "var(--font-sans)",
              letterSpacing: "var(--tracking-overline)",
            }}
          >
            Kollektion 01
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {["Minneburg", "Dilsberg", "Hirschhorn", "Heidelberg"].map(
              (location) => (
                <div
                  key={location}
                  className="aspect-[2/3] bg-[var(--color-loess)] flex items-end p-4"
                >
                  <span
                    className="text-[var(--color-stone)]"
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "var(--text-caption)",
                    }}
                  >
                    {location}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
