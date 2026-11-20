# JML Social Workspace — local prototype

Launch **Open Social Workspace.cmd** in the repository root. Keep its server window open, then use `http://127.0.0.1:8766/social-workspace.html`. Reuse that address and browser profile to keep the same local memory. Opening the HTML directly from disk is not the supported launch path.

This checkout uses port 8766 because an older prototype is running on 8765. Each address has separate browser memory. To bring existing work into this build, export a full JSON backup from the older prototype and restore it here as Workspace administrator. The older memory stays intact. The launcher verifies the checkout identity before reusing a server. If needed, `python social-workspace/serve.py --port 8765` can serve this build on the old origin after the older server has been stopped.

The six primary views are **Today, Content Planner, Studio, Review, Publish and Learn**. Their sections live in expandable sidebar submenus. One account switcher and one person switcher control the entire platform, including the full original planner. Its calendar modes, workflow filters, campaigns, assets, team tools, reports, settings and prepared artwork remain available through the shared sidebar. The standalone planner still has its own navigation when opened separately.

## Try people and handoffs

**Switch person** in the top bar opens Asha Raman, Luca Vale and Sam Rivera directly, on fresh and existing local workspaces. Their fictional Northstar memberships are prepared once; existing records, edited memberships and disabled people are preserved.

- **Asha:** account management, strategy, operations, internal QA and analysis.
- **Luca:** copy, design/video and publishing, with assignment-based access.
- **Sam:** client decisions and requested inputs for shared Northstar work.

The switcher shows the destination account and responsibilities before switching. Choosing a person who does not belong to the current account opens an account they can access. The selected person survives reload.

To explore immediately, open **Switch person → Try a sample handoff** as the administrator or Asha. This explicit action creates one fictional prepared draft and opens it as Luca. Review the draft, switch to Asha to complete internal QA, then switch to Sam and choose **Review → Creative approvals**. Planning and production prerequisites are clearly marked as supplied example context; internal QA and client creative decisions remain pending until performed. The sample does not publish anything or modify real clients' content.

## Explore with demo data

Every workspace view includes **Load demo data** for that area and **Load full demo workspace** for the connected example. Preview the destination and records, then confirm the load. The full Northstar example includes audience research, strategy and KPIs, calendar drafts, production routes, creative versions, review queues, simulated publishing, measurements, reports, growth work and resources. Asha, Luca and Sam have relevant assignments and handoffs.

Loaders use fictional accounts. When a real client is selected, the preview names the fictional Northstar destination and loading switches to it. Real calendars, pending approvals, capacity and permissions stay intact. Previously loaded examples, edits and deletions are preserved; loading again does not duplicate them. Historical decisions and outcomes are labelled as supplied fiction. Pending examples can be completed through the normal role controls.

In **Learn**, the fictional evidence is selected initially when a loaded demo has no recorded observations. The Evidence selector can switch between Fixture and Recorded. Creating a new observation still defaults to recorded evidence.

## Structured choices and interface details

Measurement windows, reporting cadence, channels, formats, time zones, owners, units and other bounded fields use dropdowns. Existing values remain available, and supported fields include **Custom…** for a value outside the presets. Captions, findings, briefs and other narrative fields remain free text. See [the field audit](FORM-FIELDS-AUDIT.md) for coverage and exceptions.

The shared interface and embedded tools use account-derived colors, restrained navigation, consistent controls and bundled local fonts. Brand inputs are retained; supporting colors have measured contrast. See [the theme notes](THEME.md) and [token report](theme-tokens.json).

## Try the supplied Northstar files

1. Open **Switch person** and choose **Asha Raman**. The prototype opens Northstar Coffee automatically when the current account is outside her memberships.
2. Use **Client accounts → People & access** to inspect the team's functions and stage owners if needed.
3. Open **Content Planner → Bulk import → Calendar CSV**. Choose the supplied CSV, or **Load Northstar sample**. Review column mapping and choose **Luca Vale** as the default assignee. The preview should show 48 valid rows. Confirm the 48 drafts.
4. Switch to **Creative briefs XLSX**. Choose the supplied workbook, or load its sample. The preview should match all 48 Content IDs: 7 video briefs and 41 graphic briefs. Confirm attachment.
5. Open a post in the calendar or Studio. **Attached creative brief** exposes every workbook field. **Edit detailed brief** saves a new revision. **Open full Creative Brief Studio** opens the existing comprehensive editor and saves its complete module answers into the same record.
6. Switch to **Luca Vale** to inspect My assignments & inbox. A brief revision creates a refreshed handoff; older notifications remain as history. Use the current assignment to accept the work.

The CSV proposes dates, times and copy. It does not schedule, approve or publish anything. The workbook's “Suggested owner” and “Status” are retained as source notes. Actual assignments and decisions come from the selected people and workflow controls.

Repeated source uploads show duplicate or already-attached rows instead of overwriting local work. Invalid rows can be excluded while valid rows are imported. A validation report can be downloaded. The account and person are checked again before confirmation.

## Complete the workflow

- **Plan:** confirm the foundation with the named client; capture audience evidence and references; group themes; select an angle; define a versioned KPI and baseline; submit strategy and calendar snapshots for client decisions. Research promotions keep their evidence and KPI links.
- **Studio:** fill the production brief, assign producer and QA reviewer, resolve required inputs, accept production readiness against the approved calendar, and complete the route's tasks. File/caption changes create new creative versions.
- **Review:** the internal QA reviewer checks the current version. The named client makes a separate creative decision. Client reviewers and client viewers see the shared projection of their account. Administrator access does not authorize a client decision.
- **Publish:** create an approved placement, inspect the exact files/caption and decision references, then have the assigned publisher acknowledge the handoff. Download actual release assets, caption and manifest as a ZIP. Use manual or simulated scheduling/verification; retain failed or uncertain attempts and their reconciliation.
- **Learn:** enter or import evidence, save KPI calculations with their observation revisions and baseline, write findings, review reports and propose the next research question, strategy revision, calendar item or brief. Accepted proposals retain their source result.

Optional-step policy can permit ordinary production steps to be skipped with a reason. Internal QA, client approval and publishing verification remain protected gates. A post's history connects versions, people, handoffs and release events.

## Memory and exports

The canonical workspace document is stored in IndexedDB as JSON-compatible records. Uploaded creative binaries are stored locally alongside it. Brief snapshots, creative versions, approvals, import batches, assignments, evidence and learning history survive reload.

**Memory & backups** is available to the Agency Administrator. JSON exports preserve the full document and uploaded data. Portable `.jmlpack` exports also include referenced local library artwork. Restore validates the document and checks bundled media before replacement. The first people-model migration retains a separate pre-migration document for recovery.

**People & access → Export this account / Restore this account** transfers only the selected account. Restore previews the brand and record counts, requires explicit replacement confirmation and preserves other accounts and existing shared identities. Workspace administrators cannot use a backup to introduce unknown people or increase privileges; creating missing identities requires the Agency Administrator.

**Export account CSV** is a calendar transfer format. It does not replace a full JSON/portable backup: CSV cannot represent all versions, evidence and decisions. Formula-like text is prefixed with an apostrophe for safe spreadsheet viewing. The XLSX importer accepts standard unencrypted workbooks with literal values; formula rows, macros, embedded objects and external workbook links are unsupported.

This is a single-device role simulation. Social publishing, platform analytics, external notifications, authenticated accounts and shared server storage are not connected. No import, approval, release simulation or local notification sends anything to an external service.

## Verification

Domain checks:

```powershell
node --test social-workspace\tests\*.test.cjs
```

Browser checks use Playwright and an installed Chrome, serve this checkout on an ephemeral loopback port, and use isolated browser storage:

```powershell
node social-workspace\tests\browser-expansion.cjs
node social-workspace\tests\browser-research.cjs
node social-workspace\tests\browser-release.cjs
node social-workspace\tests\browser-review.cjs
node social-workspace\tests\browser-account-memory.cjs
node social-workspace\tests\browser-person-switching.cjs
node social-workspace\tests\browser-navigation.cjs
node social-workspace\tests\browser-planner-shell.cjs
```

Set `NODE_PATH` to an available Playwright installation and `JML_CHROME` if Chrome is installed at a different path. Verification does not change the user's normal browser memory. Temporary screenshots are written to `.agent-work/verification` and are not shipped as application data.
