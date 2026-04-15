import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Über uns – Neckarstücke",
  description:
    "Neckarstücke hält das Neckartal in Feinkunstdrucken fest — limitierte Editionen, zeitlos gestaltet, für Menschen mit Verbindung zur Region.",
  openGraph: {
    title: "Über uns – Neckarstücke",
    description:
      "Neckarstücke hält das Neckartal in Feinkunstdrucken fest — limitierte Editionen, zeitlos gestaltet.",
    type: "website",
    locale: "de_DE",
  },
};

export default function UeberUnsPage() {
  return (
    <div className="flex flex-col">
      {/* ── Page header ───────────────────────────────────────────── */}
      <section className="px-6 pt-16 pb-10 md:px-10 md:pt-24 md:pb-14">
        <div className="mx-auto" style={{ maxWidth: "var(--container-content)" }}>
          <p
            className="mb-4 uppercase text-[var(--color-sage)]"
            style={{
              fontSize: "var(--text-overline)",
              fontFamily: "var(--font-sans)",
              letterSpacing: "var(--tracking-overline)",
            }}
          >
            Das Projekt
          </p>
          <h1
            className="text-[var(--color-charcoal)]"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 4vw, var(--text-h1))",
              lineHeight: "var(--leading-h1)",
              letterSpacing: "var(--tracking-h1)",
            }}
          >
            Über Neckarstücke
          </h1>
        </div>
      </section>

      <div
        className="mx-6 h-px bg-[var(--color-loess)] md:mx-10"
        aria-hidden="true"
      />

      {/* ── Story ─────────────────────────────────────────────────── */}
      <section className="px-6 py-14 md:px-10 md:py-20">
        <div
          className="mx-auto flex flex-col gap-12"
          style={{ maxWidth: "var(--container-prose, 680px)" }}
        >
          {/* Lead */}
          <div>
            <h2
              className="mb-6 text-[var(--color-charcoal)]"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-h2)",
                lineHeight: "var(--leading-h2)",
                letterSpacing: "var(--tracking-h2)",
              }}
            >
              Das Neckartal. Unvergänglich.
            </h2>
            <p
              className="text-[var(--color-charcoal)]"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "var(--text-body)",
                lineHeight: "var(--leading-body)",
                marginBottom: "1.25rem",
              }}
            >
              Das Neckartal liegt zwischen Heilbronn und Heidelberg — eine
              Landschaft aus bewaldeten Hängen, Burgruinen und Flussbiegungen,
              die sich kaum verändert hat, seit Menschen hier leben. Neckarstücke
              hält diese Orte fest: als Feinkunstdrucke, die das Wesen eines
              Platzes zeigen, nicht seine Oberfläche.
            </p>
            <p
              className="text-[var(--color-charcoal)]"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "var(--text-body)",
                lineHeight: "var(--leading-body)",
              }}
            >
              Jedes Motiv entsteht aus direkter Kenntnis des Ortes —
              Jahreszeit, Lichtstand, die Geometrie des Geländes. Die Illustrationen
              sind reduziert, mit begrenzter Farbpalette und klaren Formen, beeinflusst
              von den großen Plakatgrafikern des 20. Jahrhunderts. Nicht Fotografie,
              nicht Illustration im dekorativen Sinne — sondern eine Interpretation,
              die länger hält als eine Aufnahme.
            </p>
          </div>

          {/* Curation */}
          <div>
            <h2
              className="mb-6 text-[var(--color-charcoal)]"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-h2)",
                lineHeight: "var(--leading-h2)",
                letterSpacing: "var(--tracking-h2)",
              }}
            >
              Kuratiert, nicht massenproduziert
            </h2>
            <p
              className="text-[var(--color-charcoal)]"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "var(--text-body)",
                lineHeight: "var(--leading-body)",
                marginBottom: "1.25rem",
              }}
            >
              Jede Kollektion umfasst eine kleine, sorgfältig ausgewählte Anzahl
              von Motiven. Nicht Hirschhorn, Dilsberg, Minneburg und Heidelberg,
              weil sie bekannt sind — sondern weil jeder dieser Orte eine eigene
              Stimmung trägt, die sich in der richtigen Jahreszeit, aus dem
              richtigen Winkel, in eine unvergängliche Form bringen lässt.
            </p>
            <p
              className="text-[var(--color-charcoal)]"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "var(--text-body)",
                lineHeight: "var(--leading-body)",
              }}
            >
              Die Drucke entstehen auf Hahnemühle Fine Art Papier, einem der
              hochwertigsten Träger für Kunstdrucke. Jedes Exemplar ist signiert
              und nummeriert. Die Auflage ist begrenzt — was einmal vergriffen ist,
              bleibt vergriffen.
            </p>
          </div>

          {/* For whom */}
          <div>
            <h2
              className="mb-6 text-[var(--color-charcoal)]"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-h2)",
                lineHeight: "var(--leading-h2)",
                letterSpacing: "var(--tracking-h2)",
              }}
            >
              Für wen
            </h2>
            <p
              className="text-[var(--color-charcoal)]"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "var(--text-body)",
                lineHeight: "var(--leading-body)",
                marginBottom: "1.25rem",
              }}
            >
              Neckarstücke richtet sich an Menschen, die eine Verbindung zu
              dieser Region haben — aufgewachsen, gelebt, oft besucht. Und an alle,
              die etwas an die Wand hängen möchten, das eine echte Geschichte hat,
              keine dekorative.
            </p>
            <p
              className="text-[var(--color-charcoal)]"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "var(--text-body)",
                lineHeight: "var(--leading-body)",
              }}
            >
              Ein Neckarstück ist kein Souvenir. Es ist ein Gegenstand, der
              länger hält als der Anlass, aus dem er gekauft wurde.
            </p>
          </div>

          {/* CTA */}
          <div>
            <Link
              href="/kollektion"
              className="inline-block bg-[var(--color-charcoal)] text-[var(--color-paper)] px-8 py-3 hover:bg-[var(--color-sage)] transition-colors"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "var(--text-label)",
                letterSpacing: "0.08em",
              }}
            >
              Zur Kollektion
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
