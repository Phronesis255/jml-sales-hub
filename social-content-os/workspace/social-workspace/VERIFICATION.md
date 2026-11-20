# Expansion verification — 20 November 2026

The expanded prototype, demo loaders, structured fields and visual refinement were checked with **90 passing domain tests** and **12 isolated browser workflows** using installed Chrome. Application JavaScript syntax checks also pass. Browser fixtures use separate storage and do not populate the user's normal profile.

| Browser workflow | Verified outcome |
| --- | --- |
| Bulk intake and memory | 48 supplied CSV rows; 41 Graphic and 7 Video briefs from the supplied XLSX; 48 current assignments; detailed edits and full Brief Studio revision; duplicate protection; native calendar; mobile layout; JSON round trip; pre-migration backup; competing-tab write rejection. |
| Research to production | Three audience questions → theme → selected evidence → angle and versioned KPI → calendar draft; named foundation, strategy and calendar decisions; Operations readiness; Luca starts production. |
| Creative review | Asha returns V1; Luca uploads a corrected V2 file and caption; Asha passes QA; Sam approves that exact version. Failed V1 remains in history. Administrator and producer cannot provide client approval. |
| Release and learning | Named publisher receipt; actual ZIP containing assets, caption and hash manifest; release verification; community receipt; saved 67 / 4,800 × 1,000 = 14.0 result against a 9.0 baseline; accepted next-plan proposal. ZIP bytes and SHA-256 independently checked. |
| Account memory | Export one account, change its record, preview and restore its JSON; recover original revision and uploaded file bytes; preserve other brands and shared people; reject an unknown identity without a write. |
| Direct person switching | Fresh and administrator-only existing memory expose Asha, Luca and Sam; person/account persist after reload; existing memberships and real content remain intact; optional fictional sample moves from Luca's draft through Asha's actual QA to Sam's exact-version approval; mobile selector fits. |
| Shared navigation | All 23 native planner sections use the host sidebar/account switcher; native navigation is hidden in embedded mode; role permissions filter sections; five content-detail sections and client creative/planning/input queues have sidebar links; mobile Enter/Space/Escape, scrolling and focus restoration pass. |
| Native planner continuity | Four calendar modes; unsaved idea form survives section navigation; immediate save persists before leaving for Studio; drag-reschedule creates canonical revision; day note persists; account-specific filters and view remembered; campaign creation works; deferred legacy import preserves edited records; standalone navigation unchanged. Planner height follows content with no nested vertical page scroll, dialogs stay in view, and all seven week columns fit at desktop width. |
| Demo workflow | Actual preview and full-load confirmation; nine posts, four release states, research, production, review, results, reports and resources; Asha/Luca/Sam queues; repeat loading preserves edits; fictional evidence remains visible after reload; all four shared native reference panels; original local sample SVGs; mobile loader. Domain coverage also verifies real-client planning/capacity preservation, permission boundaries and account-export manifest round trips. |
| Structured fields | Preset/custom/blank/legacy values preserve exactly one FormData key; required validation and reset work; account-scoped options; dynamic and embedded forms; imported multiline fields; saved KPI; Studio input listeners and downloaded standalone HTML remain editable. |
| Theme and fonts | Local fonts load without external network; input controls fit the mobile import screen; all eight brand palettes pass the documented semantic contrast checks. |
| Populated responsive views | Eleven populated views fit 375px; content-list titles retain a readable column instead of collapsing to individual characters; the embedded planner loads the shared fonts; account switching updates the theme; desktop and mobile screenshots inspected. |

No browser JavaScript errors were reported in the passing runs. Desktop and mobile captures are local verification files under `.agent-work/verification`.

The preview server was checked on `http://127.0.0.1:8766/social-workspace.html`, including its checkout identity header and byte-for-byte bulk importer match. The older server on port 8765 was left running. Separate origins have separate local memory; the README explains JSON transfer.

These tests exercise local workflow behavior. They do not establish authenticated multi-user security or validate external publishing and analytics APIs, which are not connected.
