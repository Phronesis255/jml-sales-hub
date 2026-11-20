# Structured field audit

Implemented by `form-options.js` and `form-options.css`; installed by the workspace shell. The enhancer uses an explicit form-and-field registry, including same-origin embedded forms. It does not match every field named `type`, `name`, `source`, or `status`.

## Converted to presets with a Custom option

| Area | Fields |
| --- | --- |
| Research evidence | Channel and measurement/coverage window |
| Measurement agreements | Display unit, measurement window, metric source |
| Strategy | Reporting cadence; legacy strategy KPI, source and measurement window |
| Ideas and calendar drafts | Channel, format, delivery owner |
| Listening, campaigns and trend slots | Review cadence and named accountable owners |
| Production | Backup owner, channel placement, production time zone, task owner and follow-up owner |
| Publishing | Destination platform, output format, time zone; fallback publisher/community owner fields |
| Results and evidence import defaults | Metric label, unit, reporting time zone |
| Growth and reports | Accountable owner, success metric, observation window, report reviewer, next-action owner |
| Accounts and core briefs | Account time zone; brief channel, format, time zone, owner, client approver, saved campaign and content pillar |
| Media requests | Responsible person |
| Imported creative brief editor | Format, aspect ratio, dimensions, runtime in seconds and slide count |
| Embedded planner | Team-reference responsibility; existing platform, format, campaign, pillar, owner, approval and setting-state selectors already use native options |
| Embedded Creative Brief Studio | Animation method and motion style; existing project context and output category already use selectors |

People suggestions come from active memberships in the selected brand. Client approver suggestions use the client workflow function. Campaign and pillar suggestions come only from that brand's saved operations/planner settings. Blank fields remain blank; rendering never assigns the first person or saves an activity event. Selecting a name does not create an identity or grant permission; the existing domain and governance checks still govern submission.

## Kept as free text or their existing specialized controls

- Titles, objectives, audiences, creative hooks, captions, scripts, CTA wording, messages, prompts, notes, feedback, explanations and evidence excerpts.
- Source URLs, file references, baseline evidence and comparison-period descriptions. These identify actual evidence and must not be replaced by a generic provider label.
- Detailed production output specifications, delivery packages, combined channel-role plans, combined owner/approver descriptions, schedule narratives, technical constraints, rights and acceptance criteria. A single preset would discard part of these fields' meaning.
- Creative Brief Studio's full format/specification and timeline fields. Its channel, owner and schedule fields are readonly when connected to the workspace and remain governed by the canonical calendar/assignments.
- Imported workbook Suggested owner and Status stay source metadata. They cannot become an assignment or workflow decision by editing an imported brief. Imported identity, brand, channel and timing fields retain their existing readonly state.
- Dates, times, numeric measurements, multipliers, arbitrary sample sizes, colors, file inputs and checkboxes retain their appropriate existing controls.
- Access presets, workflow roles, approval outcomes, workflow states, confidence, evidence classes, distribution, aggregation, routes and version references already use finite selectors or checkboxes. Their strict domain enums are not widened by Custom.
- Decision actor fields remain subject to the current selected person's authority; these are not an opportunity to choose another actor.

## Preservation contract

1. A native select is the canonical named control for a preset or saved value. Unknown saved values are included verbatim as a selected option. Text is never normalized, case-folded, trimmed or rewritten by this layer.
2. Choosing **Custom…** reveals the original input/textarea and transfers the original `name` and `id` to it. Exactly one control contributes the original key to `FormData`. Selecting a preset transfers them back.
3. Required validation follows the active control; blank required custom values cannot submit. Readonly and disabled fields are not enhanced. Custom inputs retain their original constraints, such as length limits.
4. A form reset restores its original value. Programmatic fills by ID retain unfamiliar strings, including multiline Studio imports and example text.
5. Dynamic modal content and same-origin embedded planner/Studio documents are observed. Nonmatching fields are untouched. No schema migration is necessary.
6. Existing research, operations and release selector builders now retain an unfamiliar current value as a selected saved-value option instead of silently choosing the first listed value. Existing submission validators remain in effect.
7. Studio preset edits still notify its textarea-based change listener. Editable HTML export temporarily restores the original controls before serialization, then restores the live presets. A downloaded Studio therefore remains editable without the host or enhancer.

## Verification

- `node --test social-workspace/tests/form-options.test.cjs`: explicit scoping, valid IANA preset time zones, account-isolated choices and no memory mutation.
- `browser-form-options.cjs`: exact legacy/custom `FormData`, single canonical key, required validation, empty owner preservation, no mount events, reset, multiline programmatic fills, dynamic forms, same-origin iframe enhancement, native planner responsibility control, Studio dirty events and editable HTML export/reopen, and a persisted 14-day KPI window.
- `browser-research.cjs`: complete research → strategy → calendar approval → production-readiness flow with the converted fields.

Browser screenshot: `.agent-work/verification/structured-fields.png`.
