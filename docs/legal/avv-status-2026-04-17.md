# AVV/DPA status review

Last updated: 2026-04-17

Scope:
- BEI-76: Vercel, Supabase, Stripe
- BEI-78: Trigger.dev, Prodigi

Evidence folder:
- `docs/legal/avv-evidence/`

Status legend:
- `public-basis-verified`: official public terms or DPA located and documented
- `account-proof-pending`: public basis exists, but this workspace does not prove the account-level acceptance date or plan eligibility
- `manual-contact-required`: no separate self-serve DPA artifact was found in public sources, or provider contact is still needed for a cleaner Article 28 record

## Findings

### Vercel

- Status: `public-basis-verified`, `account-proof-pending`
- Official sources:
  - `https://vercel.com/legal/dpa`
  - archived PDF: `docs/legal/avv-evidence/vercel-dpa.pdf`
- What is verified:
  - Vercel publishes a Data Processing Addendum.
  - The public DPA says it forms part of the agreement and applies to customers on `Enterprise` and `Pro` plans.
  - The DPA includes SCC and UK transfer language.
- What is not yet verified:
  - Whether the Neckarstücke account is on an eligible Vercel plan.
  - The dashboard-level acceptance date or a countersigned artifact tied to this account.
- Manual next step:
  - Open the Vercel account used for production.
  - Confirm plan eligibility and capture the DPA acceptance record or current dashboard evidence.

### Supabase

- Status: `public-basis-verified`, `account-proof-pending`
- Official sources:
  - `https://supabase.com/downloads/docs/Supabase%2BDPA%2B260317.pdf`
  - `https://supabase.com/downloads/docs/Supabase%2BTIA%2B250314.pdf`
  - archived:
    - `docs/legal/avv-evidence/supabase-dpa.pdf`
    - `docs/legal/avv-evidence/supabase-tia.pdf`
- What is verified:
  - Supabase publishes a DPA.
  - The public DPA says it forms part of the agreement from the date the customer signs or otherwise agrees to it.
  - Supabase also publishes a transfer impact assessment covering US-related transfer risk.
- What is not yet verified:
  - The actual agreement path used for the Neckarstücke account.
  - The acceptance date or signed copy attached to this account.
- Manual next step:
  - Open the Supabase org/project account used by Neckarstücke.
  - Capture the active DPA acceptance record or signed copy tied to that account.

### Stripe

- Status: `public-basis-verified`, `account-proof-pending`
- Official sources:
  - `https://stripe.com/legal/dpa`
  - `https://stripe.com/legal/dpa/faqs`
  - `https://stripe.com/legal/ssa`
- What is verified:
  - Stripe publishes a DPA.
  - Stripe states that the DPA forms part of the Stripe Services Agreement.
  - Stripe states that SCCs and the UK addendum are incorporated through the Data Transfers Addendum.
- What is not yet verified:
  - The exact Stripe entity and account acceptance timestamp connected to the live Neckarstücke account.
  - A locally archived PDF or dashboard export proving the merchant account accepted the terms on a given date.
- Manual next step:
  - Open the live Stripe account.
  - Capture the governing agreement version and store an account-linked evidence artifact.

### Trigger.dev

- Status: `public-basis-verified`, `account-proof-pending`
- Official sources:
  - `https://trigger.dev/legal/dpa`
  - `https://trigger.dev/legal/privacy`
- What is verified:
  - Trigger.dev publishes a DPA.
  - The public DPA says it forms part of the Terms of Service and that, by using the service or entering into an agreement, the customer appoints Trigger.dev as processor.
  - The public DPA defines SCCs and says Trigger.dev will use reasonable endeavours to enter into SCCs with relevant subprocessors for restricted transfers.
- What is not yet verified:
  - The account record proving the Neckarstücke workspace accepted the current DPA.
  - Any provider-issued PDF or account-scoped export.
- Manual next step:
  - Open the Trigger.dev cloud account.
  - Capture the applicable plan, current terms version, and any DPA acceptance evidence available in the account.

### Prodigi

- Status: `public-basis-verified`, `manual-contact-required`
- Official sources:
  - `https://www.prodigi.com/terms-of-use/`
  - `https://www.prodigi.com/privacy-and-cookie-policy/`
- What is verified:
  - Prodigi public terms describe the client as controller and Prodigi as processor.
  - Prodigi public privacy materials provide DPO contact details at `dpo@prodigi.com`.
  - Prodigi public terms describe controller instructions, processor obligations, and subcontractor handling.
- What is not yet verified:
  - A separate signed DPA or self-serve DPA acceptance flow tied to the live Prodigi account.
  - A date-stamped account artifact proving Article 28 coverage beyond the public terms.
- Manual next step:
  - Contact `dpo@prodigi.com` and request the current DPA or written confirmation that the operative terms satisfy the processor terms for the active merchant account.
  - Archive the response in `docs/legal/avv-evidence/`.

## Transfer notes

- Vercel: US transfer language is documented in the public DPA.
- Supabase: public DPA plus public TIA are archived locally.
- Stripe: DPA and Data Transfers Addendum cover SCC and UK addendum according to Stripe's official legal pages.
- Trigger.dev: public DPA explicitly references SCCs.
- Prodigi: UK transfer basis should be recorded using the renewed UK adequacy decision noted by the ICO on 2025-12-19. This still needs a final legal cross-check if you want a regulator-ready packet.

## Result

- The public-source side of BEI-76 and BEI-78 is documented.
- The account-proof side of BEI-76 and BEI-78 is still blocked on vendor account access and, for Prodigi, likely direct contact.
