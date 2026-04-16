import Link from "next/link";
import CartButton from "@/components/CartButton";

const navLinks = [
  { href: "/kollektion", label: "Kollektion" },
  { href: "/ueber-uns", label: "Über uns" },
];

export default function Header() {
  return (
    <header className="border-b border-[var(--color-loess)] bg-[var(--color-paper)]">
      <div
        className="mx-auto flex max-w-[var(--container-content)] items-center justify-between gap-6 px-6 py-5 md:px-10"
        style={{ maxWidth: "var(--container-content)" }}
      >
        <Link
          href="/"
          className="font-[var(--font-display)] text-[1.125rem] tracking-[0.12em] uppercase text-[var(--color-charcoal)] hover:text-[var(--color-sage)] transition-colors"
          style={{ fontFamily: "var(--font-display)", letterSpacing: "0.12em" }}
          aria-label="Neckarstücke — Zur Startseite"
        >
          Neckarstücke
        </Link>

        <div className="flex items-center gap-4 sm:gap-6">
          <nav aria-label="Hauptnavigation">
            <ul className="m-0 flex list-none items-center gap-6 p-0 sm:gap-8">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-[var(--text-label)] font-[var(--font-sans)] font-medium tracking-[var(--tracking-label)] uppercase text-[var(--color-charcoal)] hover:text-[var(--color-sage)] transition-colors"
                    style={{
                      fontSize: "var(--text-label)",
                      letterSpacing: "var(--tracking-label)",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <CartButton />
              </li>
            </ul>
          </nav>

          <Link
            href="/datenschutz"
            className="text-[var(--color-charcoal)] transition-colors hover:text-[var(--color-sage)]"
            style={{
              fontSize: "var(--text-caption)",
              fontFamily: "var(--font-sans)",
            }}
          >
            Datenschutz
          </Link>
        </div>
      </div>
    </header>
  );
}
