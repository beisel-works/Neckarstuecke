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
        className="mx-auto flex max-w-[var(--container-content)] items-center justify-between px-6 py-5 md:px-10"
        style={{ maxWidth: "var(--container-content)" }}
      >
        {/* Wordmark */}
        <Link
          href="/"
          className="font-[var(--font-display)] text-[1.125rem] tracking-[0.12em] uppercase text-[var(--color-charcoal)] hover:text-[var(--color-sage)] transition-colors"
          style={{ fontFamily: "var(--font-display)", letterSpacing: "0.12em" }}
          aria-label="Neckarstücke — Zur Startseite"
        >
          Neckarstücke
        </Link>

        {/* Primary navigation + cart */}
        <nav aria-label="Hauptnavigation">
          <ul className="flex items-center gap-8 list-none m-0 p-0">
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
      </div>
    </header>
  );
}
