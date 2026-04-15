import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutzerklärung – Neckarstücke",
  description:
    "Informationen zur Verarbeitung personenbezogener Daten auf neckartuecke.de gemäß DSGVO.",
};

export default function DatenschutzPage() {
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
            Datenschutzerklärung
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
          className="mx-auto flex flex-col gap-10"
          style={{
            maxWidth: "var(--container-prose, 680px)",
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-body)",
            lineHeight: "var(--leading-body)",
            color: "var(--color-charcoal)",
          }}
        >
          <Section title="1. Verantwortlicher">
            <p>
              Verantwortlicher im Sinne der DSGVO ist:
              <br />
              Florian Beisel, beisel.works
              <br />
              [Straße und Hausnummer], [PLZ] [Ort]
              <br />
              E-Mail:{" "}
              <a
                href="mailto:hallo@neckartuecke.de"
                className="text-[var(--color-sage)] hover:underline"
              >
                hallo@neckartuecke.de
              </a>
            </p>
          </Section>

          <Section title="2. Erhebung und Speicherung personenbezogener Daten">
            <p>
              Beim Besuch unserer Website werden automatisch Informationen an den
              Server unseres Hosters übermittelt. Diese Informationen werden
              temporär in einem sogenannten Logfile gespeichert. Folgende
              Informationen werden dabei ohne Ihr Zutun erfasst und bis zur
              automatisierten Löschung gespeichert:
            </p>
            <ul className="list-disc pl-6 mt-3 flex flex-col gap-1">
              <li>IP-Adresse des anfragenden Rechners</li>
              <li>Datum und Uhrzeit des Zugriffs</li>
              <li>Name und URL der abgerufenen Datei</li>
              <li>Website, von der aus der Zugriff erfolgt (Referrer-URL)</li>
              <li>
                Verwendeter Browser sowie ggf. das Betriebssystem Ihres Rechners
              </li>
            </ul>
            <p className="mt-3">
              Die genannten Daten werden zur Gewährleistung eines reibungslosen
              Verbindungsaufbaus und einer komfortablen Nutzung unserer Website
              verarbeitet (Art. 6 Abs. 1 lit. f DSGVO).
            </p>
          </Section>

          <Section title="3. Hosting – Vercel">
            <p>
              Diese Website wird bei Vercel Inc., 340 Pine Street Suite 701, San
              Francisco, CA 94104, USA gehostet. Vercel verarbeitet dabei
              Verbindungsdaten (IP-Adresse, Zeitstempel, aufgerufene URLs) im
              Rahmen der Bereitstellung des Dienstes. Grundlage ist Art. 6 Abs. 1
              lit. f DSGVO (berechtigtes Interesse an einem zuverlässigen Betrieb
              der Website). Weitere Informationen:{" "}
              <a
                href="https://vercel.com/legal/privacy-policy"
                className="text-[var(--color-sage)] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                vercel.com/legal/privacy-policy
              </a>
              .
            </p>
          </Section>

          <Section title="4. Datenbank – Supabase">
            <p>
              Produktdaten (Motive, Varianten, Preise) werden in einer
              Supabase-Datenbank (Supabase Inc., San Francisco, CA, USA)
              gespeichert. Es handelt sich um reine Produktinformationen — keine
              personenbezogenen Daten von Besuchern werden in Supabase gespeichert.
              Supabase-Server befinden sich innerhalb der EU (Frankfurt, AWS
              eu-central-1).
            </p>
          </Section>

          <Section title="5. Zahlungsabwicklung – Stripe">
            <p>
              Zahlungen werden über Stripe (Stripe Payments Europe, Ltd., 1 Grand
              Canal Street Lower, Grand Canal Dock, Dublin, Irland) abgewickelt.
              Beim Bezahlvorgang werden Sie auf die gesicherten Seiten von Stripe
              weitergeleitet. Stripe verarbeitet dabei Ihre Zahlungsdaten (Name,
              Adresse, Zahlungsmittel) gemäß der eigenen Datenschutzerklärung.
              Wir erhalten lediglich eine Bestätigung über den Ausgang der
              Zahlung. Grundlage ist Art. 6 Abs. 1 lit. b DSGVO
              (Vertragserfüllung). Weitere Informationen:{" "}
              <a
                href="https://stripe.com/de/privacy"
                className="text-[var(--color-sage)] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                stripe.com/de/privacy
              </a>
              .
            </p>
          </Section>

          <Section title="6. Warenkorb (LocalStorage)">
            <p>
              Der Warenkorb dieser Website wird ausschließlich lokal in Ihrem
              Browser (localStorage) gespeichert. Diese Daten verlassen Ihr Gerät
              nicht und werden nicht an unsere Server übertragen. Sie können den
              Speicher jederzeit über die Einstellungen Ihres Browsers löschen.
            </p>
          </Section>

          <Section title="7. Ihre Rechte">
            <p>Sie haben gegenüber uns folgende Rechte:</p>
            <ul className="list-disc pl-6 mt-3 flex flex-col gap-1">
              <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
              <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
              <li>Recht auf Löschung (Art. 17 DSGVO)</li>
              <li>
                Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)
              </li>
              <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>
                Recht auf Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)
              </li>
            </ul>
            <p className="mt-3">
              Zur Ausübung Ihrer Rechte wenden Sie sich bitte an:{" "}
              <a
                href="mailto:hallo@neckartuecke.de"
                className="text-[var(--color-sage)] hover:underline"
              >
                hallo@neckartuecke.de
              </a>
              . Sie haben zudem das Recht, sich bei einer Datenschutz-Aufsichtsbehörde
              zu beschweren.
            </p>
          </Section>

          <Section title="8. Änderungen dieser Datenschutzerklärung">
            <p>
              Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit
              sie stets den aktuellen rechtlichen Anforderungen entspricht oder um
              Änderungen unserer Leistungen umzusetzen. Für Ihren erneuten Besuch
              gilt dann die neue Datenschutzerklärung. Stand: April 2026.
            </p>
          </Section>
        </div>
      </section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2
        className="mb-4 text-[var(--color-charcoal)]"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-h3)",
          lineHeight: "var(--leading-h3)",
          letterSpacing: "var(--tracking-h3)",
        }}
      >
        {title}
      </h2>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}
