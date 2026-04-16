import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutzerklärung – Neckarstücke",
  description:
    "Informationen zur Verarbeitung personenbezogener Daten auf neckartuecke.de gemäß DSGVO.",
};

export default function DatenschutzPage() {
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
            Datenschutzerklärung
          </h1>
        </div>
      </section>

      <div
        className="mx-6 h-px bg-[var(--color-loess)] md:mx-10"
        aria-hidden="true"
      />

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
          <Section title="1. Datenschutz auf einen Blick">
            <p>
              Die folgenden Hinweise geben einen einfachen Überblick darüber,
              was mit Ihren personenbezogenen Daten passiert, wenn Sie diese
              Website besuchen. Personenbezogene Daten sind alle Daten, mit
              denen Sie persönlich identifiziert werden können.
            </p>
            <p>
              Die Datenverarbeitung auf dieser Website erfolgt durch den
              Websitebetreiber: Florian Beisel, beisel.works, Aufeldstraße 14,
              69437 Neckargerach.
            </p>
            <p>
              Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese
              mitteilen, zum Beispiel durch Ausfüllen eines Bestellformulars.
              Andere Daten werden automatisch beim Besuch der Website durch
              unsere IT-Systeme erfasst, etwa technische Daten wie
              Internetbrowser und Betriebssystem.
            </p>
            <p>
              Sie haben jederzeit das Recht auf Auskunft, Berichtigung, Löschung
              oder Einschränkung der Verarbeitung Ihrer gespeicherten
              personenbezogenen Daten sowie ein Widerspruchsrecht gegen die
              Verarbeitung und ein Recht auf Datenübertragbarkeit.
            </p>
          </Section>

          <Section title="2. Hosting - Vercel">
            <p>
              Diese Website wird auf den Servern von Vercel Inc., 340 S. Lemon
              Ave #4133, Walnut, CA 91789, USA, gehostet. Vercel ist unser
              technischer Dienstleister im Sinne des Art. 28 DSGVO und betreibt
              ein globales Edge-Network sowie Serverless-Funktionen zur
              Bereitstellung dieser Website.
            </p>
            <p>
              Vercel speichert automatisch Zugriffsdaten wie IP-Adressen,
              HTTP-Header, Zeitstempel und Browser-Informationen für
              Sicherheits- und Performancezwecke. Diese Daten werden gemäß
              Standard Contractual Clauses (SCCs) zwischen der EU und den USA
              übermittelt.
            </p>
            <p>
              Details:{" "}
              <a
                href="https://vercel.com/legal/privacy-policy"
                className="text-[var(--color-sage)] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://vercel.com/legal/privacy-policy
              </a>
            </p>
            <p>
              Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes
              Interesse an Sicherheit und Performance).
            </p>
          </Section>

          <Section title="3. Datenbank und Authentifizierung - Supabase">
            <p>
              Die Verwaltung von Benutzerdaten und Authentifizierung erfolgt
              über Supabase, einen Dienst der Supabase Inc., basierend auf
              PostgreSQL. Supabase ist unser Auftragsverarbeiter gemäß Art. 28
              DSGVO.
            </p>
            <ul className="mt-3 flex list-disc flex-col gap-1 pl-6">
              <li>E-Mail-Adresse für Authentifizierung</li>
              <li>Verschlüsselte Passwörter</li>
              <li>Benutzerprofildaten, wenn angegeben</li>
              <li>Bestellverlauf und Präferenzen</li>
            </ul>
            <p className="mt-3">
              Supabase unterliegt Auftragsverarbeitungsklauseln nach Art. 28
              DSGVO.
            </p>
            <p>
              Datenschutzerklärung:{" "}
              <a
                href="https://supabase.com/privacy"
                className="text-[var(--color-sage)] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://supabase.com/privacy
              </a>
            </p>
            <p>
              Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO
              (Vertragserfüllung und Kontoverwaltung).
            </p>
          </Section>

          <Section title="4. Zahlungsdienstleister - Stripe">
            <p>
              Die Zahlungsabwicklung erfolgt über Stripe Payments Europe, Ltd.,
              1 Grand Canal Street Lower, Grand Canal Dock, Dublin, D02 H210,
              Irland. Stripe ist unser Auftragsverarbeiter gemäß Art. 28 DSGVO.
            </p>
            <ul className="mt-3 flex list-disc flex-col gap-1 pl-6">
              <li>
                Zahlungsdaten wie Kartennummer, Ablaufdatum und CVC werden
                nicht auf unseren Servern gespeichert
              </li>
              <li>Name und Rechnungsadresse</li>
              <li>Bestellinformationen und Gesamtbetrag</li>
            </ul>
            <p className="mt-3">
              Wir erhalten die vollständigen Zahlungsdaten nicht direkt. Stripe
              verarbeitet diese verschlüsselt auf eigenen Servern. Die
              Datenübermittlung erfolgt unter Standard Contractual Clauses
              (SCCs).
            </p>
            <p>
              Datenschutzerklärung von Stripe:{" "}
              <a
                href="https://stripe.com/privacy"
                className="text-[var(--color-sage)] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://stripe.com/privacy
              </a>
            </p>
            <p>Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.</p>
          </Section>

          <Section title="5. Workflow-Automatisierung - Trigger.dev">
            <p>
              Für die Automatisierung von Bestellprozessen, Benachrichtigungen
              und Produktionsaufträgen nutzen wir Trigger.dev. Trigger.dev ist
              unser Auftragsverarbeiter gemäß Art. 28 DSGVO.
            </p>
            <ul className="mt-3 flex list-disc flex-col gap-1 pl-6">
              <li>Bestellnummern und Status</li>
              <li>Versandadressen zur Weitergabe an Prodigi</li>
              <li>Produktkonfigurationen</li>
              <li>Timing- und Workflow-Logs</li>
            </ul>
            <p className="mt-3">
              Datenschutzerklärung:{" "}
              <a
                href="https://trigger.dev/legal/privacy"
                className="text-[var(--color-sage)] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://trigger.dev/legal/privacy
              </a>
            </p>
            <p>Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.</p>
          </Section>

          <Section title="6. Datenerfassung bei Bestellungen">
            <p>
              Wenn Sie in unserem Shop bestellen, erheben wir folgende Daten zur
              Vertragsabwicklung:
            </p>
            <ul className="mt-3 flex list-disc flex-col gap-1 pl-6">
              <li>Name und Anschrift für den Versand</li>
              <li>E-Mail-Adresse für Bestellbestätigung und Kundenservice</li>
              <li>Zahlungsinformationen, verarbeitet durch Stripe</li>
              <li>Produktauswahl und Konfigurationen</li>
            </ul>
            <p className="mt-3">
              Zur Erfüllung von Bestellungen arbeiten wir mit Prodigi Ltd., 11
              Curtain Road, London, EC2A 3LT, Großbritannien, zusammen. Prodigi
              erhält Ihren Namen sowie Ihre Lieferadresse ausschließlich zum
              Zweck der Produktion und des Versands Ihrer Bestellung.
            </p>
            <p>
              Details:{" "}
              <a
                href="https://www.prodigi.com/privacy-and-cookie-policy/"
                className="text-[var(--color-sage)] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://www.prodigi.com/privacy-and-cookie-policy/
              </a>
            </p>
            <p>Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.</p>
          </Section>

          <Section title="7. Ihre Rechte als betroffene Person">
            <p>Sie haben gegenüber uns folgende Rechte:</p>
            <ul className="mt-3 flex list-disc flex-col gap-1 pl-6">
              <li>Auskunft (Art. 15 DSGVO)</li>
              <li>Berichtigung (Art. 16 DSGVO)</li>
              <li>Löschung (Art. 17 DSGVO)</li>
              <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Widerspruch (Art. 21 DSGVO)</li>
            </ul>
            <p className="mt-3">
              Zur Ausübung Ihrer Rechte wenden Sie sich an:{" "}
              <a
                href="mailto:kontakt@beisel.works"
                className="text-[var(--color-sage)] hover:underline"
              >
                kontakt@beisel.works
              </a>
            </p>
            <p>
              Zudem haben Sie das Recht, sich bei einer
              Datenschutz-Aufsichtsbehörde zu beschweren. Die zuständige
              Aufsichtsbehörde in Baden-Württemberg ist der Landesbeauftragte
              für den Datenschutz und die Informationsfreiheit (LfDI):{" "}
              <a
                href="https://www.baden-wuerttemberg.datenschutz.de"
                className="text-[var(--color-sage)] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://www.baden-wuerttemberg.datenschutz.de
              </a>
            </p>
          </Section>

          <Section title="8. Speicherdauer">
            <p>
              Personenbezogene Daten werden bei uns gespeichert, solange sie für
              die Erfüllung des Vertrages und erforderlicher
              Aufbewahrungspflichten notwendig sind. Nach Vertragserfüllung
              werden die Daten in der Regel nach 10 Jahren gelöscht, gemäß
              steuer- und handelsrechtlicher Aufbewahrungspflichten nach § 257
              HGB.
            </p>
          </Section>

          <Section title="9. Datenschutz-Folgenabschätzung (DPIA)">
            <p>
              Da personenbezogene Daten in die USA übermittelt werden können,
              insbesondere bei Vercel, Trigger.dev und teilweise Supabase,
              verwenden wir Standard Contractual Clauses (SCCs) zur
              Gewährleistung eines angemessenen Schutzniveaus.
            </p>
          </Section>

          <Section title="10. Änderungen dieser Datenschutzerklärung">
            <p>
              Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf
              anzupassen, um sie an aktuelle Anforderungen und technische
              Entwicklungen anzupassen. Letzte Aktualisierung: Januar 2025.
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
