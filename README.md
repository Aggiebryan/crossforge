# CrossForge CRM

Internal operating system and CRM for a contract wholesaling business
(CrossForge Capital, LLC). Two pipelines — sellers and buyers — run in
parallel, and the application enforces the operating discipline that keeps the
business lawful and solvent.

The app exists to make four failures **structurally impossible**:

1. Signing a purchase contract without a completed lead sheet and a written underwriting basis.
2. Marketing a property to buyers before a valid, assignable contract exists.
3. Losing earnest money because a due-diligence deadline passed unnoticed.
4. Pricing a deal off stale or unverified buyer information.

Where the operating manual is prescriptive, the app is prescriptive. Warnings
state the consequence, not a vague caution. The application's job is to be
stronger than the operator's emotion on a bad day.

---

## Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn-style primitives.
- **Backend/DB:** Supabase — PostgreSQL, Auth, Storage (private buckets), Row Level Security, Edge Functions, `pg_cron`.
- **Charts:** Recharts.
- **Email/SMS:** provider-agnostic adapter layer (SendGrid / Twilio) behind an interface.
- **Hosting:** Vercel.

### Engineering standards baked in

- Every table has `id uuid pk default gen_random_uuid()`, `created_at`, `updated_at`, `created_by`, `org_id`.
- Multi-tenant from day one — **every query is scoped by `org_id` through RLS**, never client-side filtering.
- Soft deletes only (`deleted_at`); hard delete is owner-only and the UI requires a named confirmation.
- Full audit trail in `activity_log` (actor, entity, action, before/after, timestamp).
- All money is integer **cents**; dates carry an explicit business timezone (default `America/Chicago`, per-org configurable).
- Mobile-responsive throughout.

---

## Repository layout

```
src/
  domain/
    constants.ts          # Frozen vocabulary: 18 stages, repair lines,
                          # checklists, folders, roles, disqualifiers…
    engines/              # Pure, unit-tested business-rule engines (the core)
      repair.ts           # contingency 10/15%, round-up, tier reconciliation
      mao.ts              # both MAO forms, tightening, offer band, walk-away
      buyers.ts           # grade+POF validation, decay, match, certainty
      deadlines.ts        # 6 deadlines, 3-business-day advance alerts
      title.ts            # green/yellow/red worst-lens triage
      qualification.ts    # five pillars, red-flag gate
      compliance.ts       # fair-housing + hype screens, attorney triggers
      files.ts            # enforced YYYY-MM-DD_Address_DocType naming
      leadSources.ts      # scorecard + tiering + verdict
      gates.ts            # the six no-cross rules + master checklist + cadence
      engines.test.ts     # 44 vitest cases covering the acceptance criteria
  app/(app)/              # Operator screens (dashboard, pipeline, underwriting,
                          # buyers, contracts, disposition, closing, kpi, day)
  components/             # AppShell, command palette, checklist rail, panels
  lib/supabase/           # browser + server clients, config
  demo/                   # demo dataset so gates are explorable without a DB
supabase/migrations/      # 0001–0007: schema, RLS, jobs, bootstrap seed
```

The **business logic lives in `src/domain/engines`** as pure functions. The UI
and (where mirrored) the database call the same rules, so a gate can't drift
between screens. This is also why the acceptance criteria are testable without
a running database — see `npm test`.

---

## Getting started

```bash
npm install
cp .env.example .env.local     # fill in Supabase + provider keys
npm run dev                    # http://localhost:3000
npm test                       # run the engine test suite (44 cases)
npm run build                  # production build
```

**No Supabase project yet?** The app still runs. Auth middleware detects the
missing configuration and lets you explore against the bundled demo dataset
(`src/demo/data.ts`). Every enforced gate is wired to real engine code, so the
blocks, banners, and hard-stops behave exactly as they will in production.

### Database

Apply the migrations in `supabase/migrations` (via the Supabase CLI or the
dashboard SQL editor). They create the full schema, enable and force RLS on
every tenant table, build the match-engine indexes, install the nightly
`pg_cron` jobs (grade decay, deadline alerting, stale-yellow escalation), and
register an org-bootstrap trigger that seeds the 18 stages, TX state rules, and
the starter script library whenever an org is created.

---

## Roles & permissions (Section 7)

| Role | Access |
|------|--------|
| Owner / Operator | Full access, financials, overrides, SOP editing |
| Acquisitions | Seller leads, qualification, underwriting, offers, contracts. No buyer financials, no P&L |
| Dispositions | Buyer list, disposition, closing coordination. Read-only underwriting |
| Transaction Coordinator | Contracts, title, deadlines, closing. No pricing edits |
| Virtual Assistant | Assigned leads only, quick capture, skip trace, data entry. No pricing/financials/deletion |
| Bookkeeper | Financial records, expenses, income. No seller/buyer PII beyond a settlement statement |

Enforced at the database via RLS (`has_pricing_access`, `has_financials_access`,
`can_delete`, per-VA `assigned_to` scoping) and mirrored in the UI via the role
switcher in the sidebar. A VA cannot be assigned a task type until an
acknowledged SOP exists for it (`va_task_allowed`).

---

## Acceptance criteria → where to see it

| # | Criterion | Where |
|---|-----------|-------|
| 1 | Quick-capture lead blocked past *Contact made* until the full sheet is done | `/pipeline/L-1003`; `gates.gateIncompleteLeadAdvance` |
| 2 | Two-pillars-absent warning; two red flags block *Offer pending* without a written override | Lead detail qualification panel; `qualification.assessPillars/assessRedFlags` |
| 3 | Contingency 10%, auto-raises to 15% on limited access; every line rounds up | `/underwriting`; `repair.computeRepairTotals` |
| 4 | Repair-tier mismatch reconciliation prompt | `/underwriting` (visual tier vs. computed); `repair.reconcileTier` |
| 5 | MAO both forms; thin-pool haircut auto-triggered by <2 A/B buyers; walk-away hard-stop | `/underwriting`; `mao.*`, `buyers.countMatchingABBuyers` |
| 6 | Grade A blocked without POF | `/buyers/[id]`; `buyers.validateGrade` |
| 7 | Nightly decay: A→B at 91 days, Re-verify queue, restoration needs a fresh note | `/buyers/B-203`, dashboard; `buyers.applyDecay/canRestoreGrade`, `job_buyer_grade_decay` |
| 8 | Property → ranked buyer short list under two seconds | `/buyers` "Match to property"; timed in-page, `match_buyers` SQL + GIN/price indexes |
| 9 | Deal blast blocked with no assignable contract | `/disposition`; `gates.gateDispositionSend` |
| 10 | Six deadlines auto-calendared with 3-business-day alerts | `/contracts`; `deadlines.calendarDeadlines` |
| 11 | Clean ownership+liens but serious property defect → yellow/red, not green | `/contracts` title triage; `title.fileTierFromIssues` |
| 12 | Income blocked before funding confirmation | `/closing`; `gates.gateIncomeRecognition` + `assert_funding_confirmed` DB trigger |
| 13 | Not *Closed* until all 19 checklist items + post-close review are done | Lead detail rail + `/closing`; `gates.gateMarkClosed` |
| 14 | Upload → filename `YYYY-MM-DD_Address_DocType` into the correct numbered folder | Lead detail deal-folder meter; `files.buildFilename` |
| 15 | KPI dashboard answers the three questions without arithmetic | `/kpi` and `/` top row |
| 16 | VA has no access to pricing/financials/deletion | Sidebar role switcher → Virtual Assistant; RLS policies |

---

## The six no-cross rules (Section 4.1)

Each returns a **named, visible enforcement message** so the operator learns the
rule from the block (`src/domain/engines/gates.ts`):

1. No contract without a completed lead sheet.
2. No earnest money without confirmed title contact, written escrow instructions, and a phone-verified wire.
3. No property marketed until a valid assignable contract exists.
4. No deal sent to buyers without a written deal analysis.
5. No fee counted as income until the closing wire clears (also enforced by a DB trigger).
6. No deal closed without the assignment fee and seller disclosure documented.

---

## Build phases

Phases 1–6 are implemented end-to-end (schema + engines + screens). Phase 7
(integration adapters, SOP module UI, webhook delivery worker) has its data
model, gating functions, and webhook outbox in the schema; the provider
adapters are stubbed behind the interface described in Section 8 and are the
natural next increment.

## Testing

```bash
npm test        # 44 engine cases, one per acceptance-critical rule
```

The engines are deterministic and DB-free, so this suite is the fastest guard
against a gate regressing.
