import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum – Neckarstücke",
  description:
    "Anbieterkennzeichnung gemäß § 5 TMG für Neckarstücke - Feinkunstdrucke aus dem Neckartal.",
};

export default function ImpressumPage() {
  return (
    <div className="flex flex-col">
      <section className="px-6 pt-16 pb-10 md:px-10 md:pt-24 md:pb-14">
        <div className="mx-auto" style={{ maxWidth: "var(--container-content)" }}>
          <h1
            className="text-[var(--color-charcoal)]"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 4vw, var(--text-h1))",
              lineHeight: "var(--leading-h1)",
              letterSpacing: "var(--tracking-h1)",
            }}
          >
            Impressum
          </h1>
        </div>
      </section>

      <div
        className="mx-6 h-px bg-[var(--color-loess)] md:mx-10"
        aria-hidden="true"
      />

      <section className="px-6 py-14 md:px-10 md:py-20">
        <div
          className="mx-auto prose prose-sm max-w-none"
          style={{
            maxWidth: "var(--container-prose, 680px)",
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-body)",
            lineHeight: "var(--leading-body)",
            color: "var(--color-charcoal)",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-h3)",
              letterSpacing: "var(--tracking-h3)",
              marginBottom: "0.75rem",
            }}
          >
            Angaben gemäß § 5 TMG
          </h2>

          <p style={{ marginBottom: "2rem" }}>
            Florian Beisel
            <br />
            beisel.works
            <br />
            Aufeldstraße 14
            <br />
            69437 Neckargerach
          </p>

          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-h3)",
              letterSpacing: "var(--tracking-h3)",
              marginBottom: "0.75rem",
            }}
          >
            Kontakt
          </h2>

          <p style={{ marginBottom: "2rem" }}>
            Telefon: +49 151 23033390
            <br />
            E-Mail:{" "}
            <a
              href="mailto:kontakt@beisel.works"
              className="text-[var(--color-sage)] hover:underline"
            >
              kontakt@beisel.works
            </a>
          </p>

          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-h3)",
              letterSpacing: "var(--tracking-h3)",
              marginBottom: "0.75rem",
            }}
          >
            Umsatzsteuer
          </h2>

          <p style={{ marginBottom: "2rem" }}>
            Gemäß § 19 UStG wird keine Umsatzsteuer berechnet
            (Kleinunternehmerregelung). Eine Umsatzsteuer-Identifikationsnummer
            liegt nicht vor.
          </p>

          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-h3)",
              letterSpacing: "var(--tracking-h3)",
              marginBottom: "0.75rem",
            }}
          >
            Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
          </h2>

          <p style={{ marginBottom: "2rem" }}>
            Florian Beisel
            <br />
            Aufeldstraße 14
            <br />
            69437 Neckargerach
          </p>

          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-h3)",
              letterSpacing: "var(--tracking-h3)",
              marginBottom: "0.75rem",
            }}
          >
            Streitschlichtung
          </h2>

          <p style={{ marginBottom: "2rem" }}>
            Die Europäische Kommission stellt eine Plattform zur
            Online-Streitbeilegung (OS) bereit:{" "}
            <a
              href="https://ec.europa.eu/consumers/odr"
              className="text-[var(--color-sage)] hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://ec.europa.eu/consumers/odr
            </a>
          </p>

          <p>
            Unsere E-Mail-Adresse finden Sie oben im Impressum. Wir sind nicht
            bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
            Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </div>
      </section>
    </div>
  );
}
