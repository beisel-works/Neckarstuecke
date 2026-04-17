import CoaAdminTable from "@/components/CoaAdminTable";
import { getOpenCoaTasks } from "@/lib/coa/admin";

export const dynamic = "force-dynamic";

export default async function CoaAdminPage() {
  const rows = await getOpenCoaTasks();

  return (
    <main className="px-6 py-12 md:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="flex flex-col gap-2">
          <p
            className="uppercase text-[var(--color-stone)]"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--text-overline)",
              letterSpacing: "var(--tracking-overline)",
            }}
          >
            Intern
          </p>
          <h1
            className="text-[var(--color-charcoal)]"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-h2)",
              lineHeight: "var(--leading-h2)",
            }}
          >
            Offene COA-Aufgaben
          </h1>
        </div>

        {rows.length === 0 ? (
          <p
            className="text-[var(--color-stone)]"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--text-body)",
              lineHeight: "var(--leading-body)",
            }}
          >
            Keine offenen COA-Aufgaben.
          </p>
        ) : (
          <CoaAdminTable rows={rows} />
        )}
      </div>
    </main>
  );
}
