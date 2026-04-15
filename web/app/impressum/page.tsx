import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum – Neckarstücke",
  description:
    "Anbieterkennzeichnung gemäß § 5 TMG für Neckarstücke — Feinkunstdrucke aus dem Neckartal.",
};

export default function ImpressumPage() {
  return (
    <div className="flex flex-col">
      {/* ── Page header ───────────────────────────────────────────── */}
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

      {/* ── Content ───────────────────────────────────────────────── */}
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
            [Straße und Hausnummer]
            <br />
            [PLZ] [Ort]
            <br />
            Deutschland
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
            E-Mail:{" "}
            <a
              href="mailto:hallo@neckartuecke.de"
              className="text-[var(--color-sage)] hover:underline"
            >
              hallo@neckartuecke.de
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
            Umsatzsteuer-ID
          </h2>

          <p style={{ marginBottom: "2rem" }}>
            Gemäß § 19 UStG wird keine Umsatzsteuer ausgewiesen
            (Kleinunternehmerregelung).
          </p>

          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-h3)",
              letterSpacing: "var(--tracking-h3)",
              marginBottom: "0.75rem",
            }}
          >
            Verantwortlicher für den Inhalt gemäß § 55 Abs. 2 RStV
          </h2>

          <p style={{ marginBottom: "2rem" }}>
            Florian Beisel
            <br />
            [Straße und Hausnummer]
            <br />
            [PLZ] [Ort]
          </p>

          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-h3)",
              letterSpacing: "var(--tracking-h3)",
              marginBottom: "0.75rem",
            }}
          >
            Haftung für Inhalte
          </h2>

          <p style={{ marginBottom: "2rem" }}>
            Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte
            auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach
            §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht
            verpflichtet, übermittelte oder gespeicherte fremde Informationen zu
            überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige
            Tätigkeit hinweisen.
          </p>

          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-h3)",
              letterSpacing: "var(--tracking-h3)",
              marginBottom: "0.75rem",
            }}
          >
            Urheberrecht
          </h2>

          <p>
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen
            Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung,
            Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der
            Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des
            jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite
            sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.
          </p>
        </div>
      </section>
    </div>
  );
}
