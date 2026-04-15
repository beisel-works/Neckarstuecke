import Link from "next/link";

const footerLinks = [
  { href: "/impressum", label: "Impressum" },
  { href: "/datenschutz", label: "Datenschutz" },
  { href: "/ueber-uns", label: "Über uns" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--color-loess)] bg-[var(--color-charcoal)] text-[var(--color-paper)]">
      <div
        className="mx-auto flex flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between md:px-10"
        style={{ maxWidth: "var(--container-content)" }}
      >
        {/* Brand statement */}
        <div className="flex flex-col gap-1">
          <span
            className="font-medium tracking-[0.12em] uppercase"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.875rem",
              letterSpacing: "0.12em",
            }}
          >
            Neckarstücke
          </span>
          <span
            className="text-[var(--color-stone)]"
            style={{
              fontSize: "var(--text-caption)",
              fontFamily: "var(--font-sans)",
            }}
          >
            Das Neckartal. Unvergänglich.
          </span>
        </div>

        {/* Footer nav */}
        <nav aria-label="Footer-Navigation">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 list-none m-0 p-0">
            {footerLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-[var(--color-stone)] hover:text-[var(--color-paper)] transition-colors"
                  style={{
                    fontSize: "var(--text-caption)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Copyright */}
        <p
          className="text-[var(--color-stone)]"
          style={{
            fontSize: "var(--text-caption)",
            fontFamily: "var(--font-sans)",
          }}
        >
          &copy; {year} Neckarstücke
        </p>
      </div>
    </footer>
  );
}
