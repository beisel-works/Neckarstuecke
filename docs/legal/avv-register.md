# AVV register

Last updated: 2026-04-17

Review cadence:
- review at least annually
- review on any provider change
- review whenever a provider updates its DPA, privacy policy, or transfer mechanism

Evidence storage:
- public artifacts: `docs/legal/avv-evidence/`
- account-specific exports or signed copies: store in the same folder when collected

| Provider | Processor address / source basis | Data categories | Purpose | Legal basis | Transfer mechanism | Public DPA / legal basis | Local evidence | Account verification status | Next action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Vercel | Vercel Inc.; public DPA includes legal entity details and transfer schedules. Public hosting address used in storefront notice: 340 S. Lemon Ave #4133, Walnut, CA 91789, USA. | IP address, HTTP headers, timestamps, browser/device metadata | Hosting, edge delivery, serverless execution, security logging | Art. 6(1)(f) DSGVO | SCC / UK addendum language in public DPA | `https://vercel.com/legal/dpa` | `docs/legal/avv-evidence/vercel-dpa.pdf` | Public DPA found; account plan and acceptance date not yet proven | Confirm the production Vercel account is on an eligible plan and archive dashboard evidence |
| Supabase | Supabase public DPA identifies Supabase, Inc. and includes importer details in its schedules | Email, hashed password, profile data, auth metadata, order history, preferences | Database hosting, auth, account management | Art. 6(1)(b) DSGVO | DPA plus TIA for US-related transfer risk | `https://supabase.com/downloads/docs/Supabase%2BDPA%2B260317.pdf` | `docs/legal/avv-evidence/supabase-dpa.pdf`, `docs/legal/avv-evidence/supabase-tia.pdf` | Public DPA/TIA found; account acceptance date not yet proven | Capture org-level DPA acceptance or signed copy from the live account |
| Stripe | Stripe Payments Europe, Limited, 1 Grand Canal Street Lower, Grand Canal Dock, Dublin, D02 H210, Ireland | Billing address, order details, payment details, fraud/security metadata | Payment processing, fraud prevention, regulatory compliance | Art. 6(1)(b) DSGVO | Stripe DPA plus Data Transfers Addendum | `https://stripe.com/legal/dpa` | official legal URLs only; no local snapshot committed | Public DPA found; account acceptance timestamp not yet proven | Capture the live account's governing agreement version and archive account-linked proof |
| Trigger.dev | API Hero Ltd trading as Trigger.dev, 3rd Floor, 1 Ashley Road, Altrincham, Cheshire, WA14 2DT, UK | Order IDs, workflow logs, product config, shipping data passed through jobs | Workflow automation, notifications, job execution | Art. 6(1)(b) DSGVO | SCC language in public DPA; UK company | `https://trigger.dev/legal/dpa` | official legal URLs only; no local snapshot committed | Public DPA found; account acceptance evidence not yet archived | Capture account-scoped proof from the live Trigger.dev workspace |
| Prodigi | Prodigi public terms define client as controller and Prodigi as processor; contact via `dpo@prodigi.com` | Name, shipping address, billing address, email, phone, order/product data, images uploaded for fulfilment | Print-on-demand fulfilment, shipping, support | Art. 6(1)(b) DSGVO | UK adequacy decision renewed by the European Commission on 2025-12-19, per ICO guidance | `https://www.prodigi.com/terms-of-use/` and `https://www.prodigi.com/privacy-and-cookie-policy/` | official legal URLs only; no local snapshot committed | Public processor terms found; no separate signed DPA artifact archived yet | Request a current DPA or written confirmation from `dpo@prodigi.com` and archive the response |

## Notes

- This register intentionally separates `public legal basis located` from `account-specific proof archived`.
- Do not mark the AVV work fully complete until each provider row has an account-linked artifact or a provider response stored in `docs/legal/avv-evidence/`.
