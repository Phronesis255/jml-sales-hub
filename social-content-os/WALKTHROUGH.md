# Social Content OS — End-to-end walkthrough

This guide follows one new client from the day you add them to the first results report and the plan for the next cycle. Each stage lists who does it, where to find it in the app, the sub-steps, and what has to be true before the next stage can start.

The prototype runs entirely in your browser. Publishing, platform analytics, logins and notifications are **simulated**: nothing is sent to an outside service.

---

## Before you start

### Run the app
- **Windows:** double-click `workspace/START WINDOWS.cmd`. Keep its window open and use `http://127.0.0.1:18766/social-workspace.html`.
- **Mac/Linux:** run `python3 workspace/social-workspace/serve.py --port 18766`.
- Always use the same address and browser. Your work is saved in that browser's storage for that address only.

### The people in this guide
The example team uses three roles. Use **Switch person** (top right) to act as each one.

| Person | Role | What they do |
|---|---|---|
| **Workspace administrator** | Agency admin | Creates client accounts, adds people, manages backups. Cannot approve on the client's behalf. |
| **Asha Raman** | Account manager, strategist, operations, creative QA, analyst | Runs the account: foundation, research, strategy, calendar, production set-up, internal QA, placements, results and reports. |
| **Luca Vale** | Copywriter, designer/video, publisher | Produces the creative and publishes it. |
| **Sam Rivera** | Client approver | Approves the foundation, strategy, calendar and each finished creative. Supplies requested inputs. |
| **Client stakeholder** | Client viewer | Read-only view of shared material and reports. |

To try everything with fictional data first, open **Today → Start here → Load full demo workspace**, or use **Switch person → Try a sample handoff**.

### How the app tells you what's next
- **Today** lists your open assignments first, with the primary action on each row.
- A **Production readiness** card on each post lists every remaining step, who it's waiting on, and a button where you can act.
- **Handoffs** on each post shows the four stages: Production → Internal QA → Client decision → Publishing.
- Fields marked `*` are required. If something is missing, a red message appears under the field or at the bottom of the form.

---

## The stages at a glance

| # | Stage | Done by | Approved by | Where |
|---|---|---|---|---|
| 1 | Add the client account | Admin | — | Client accounts → Accounts |
| 2 | People, access and stage owners | Admin | — | Client accounts → People & access |
| 3 | Client foundation | Asha | Sam | Content Planner → Foundation |
| 4 | Research | Asha | — | Content Planner → Research |
| 5 | Strategy & KPIs | Asha | Sam | Content Planner → Strategy & KPIs |
| 6 | Content calendar | Asha | Sam | Content Planner → Calendar / Research / Bulk import |
| 7 | Brief and production set-up | Asha (+ Luca for copy) | Asha accepts the brief | Post → Brief & copy |
| 8 | Create the content | Luca | — | Post → Production workflow / Creative versions |
| 9 | Internal QA | Asha | — | Review → Internal QA |
| 10 | Client creative approval | Sam | Sam | Review → Creative approvals |
| 11 | Publish and verify | Asha prepares, Luca publishes | — | Publish → Publishing desk |
| 12 | Measure results | Asha | — | Learn → Results |
| 13 | Report to the client | Asha | Asha marks it client-ready | Learn → Reports |
| 14 | Growth and the next cycle | Asha | Back to Sam via the plan | Learn → Growth |

The **Content Planner** progress strip at the top of Foundation, Research and Strategy shows stages 3–6 at a glance: done (green), current, or waiting for the client (amber).

---

## Stage 1 — Add the client account
**Who:** Workspace administrator · **Where:** sidebar → **Client accounts → Accounts**

1. Click **Add a client account**.
2. Fill in:
   - **Client name** and a short **Account description**.
   - **Time zone** (for example `America/Los_Angeles`). All dates and release times for this client use it.
   - **Primary** and **Accent** colors. The whole interface takes on these colors when this account is selected; contrast is adjusted automatically.
3. Click **Create account**. The new client appears in the **Client account** switcher at the top of every page.

**Done when:** the client is selectable in the account switcher.

---

## Stage 2 — People, access and stage owners
**Who:** Workspace administrator · **Where:** **Client accounts → People & access**

### 2.1 Add the people
1. Click **Add person** and enter a display name for each team member and each client contact.

### 2.2 Give each person a membership on this client
1. Click **Add membership** (or **Edit access** on an existing card).
2. Choose the **Person** and an **Access preset**:
   - **Workspace Admin**: runs the account.
   - **Team Member**: works on assigned items.
   - **Client Approver**: makes client decisions.
   - **Client Viewer**: read-only.
3. Tick the person's **Workflow functions**. These decide which steps they may do:

   | Function | Can do |
   |---|---|
   | Account Manager / Client Success Lead | Coordinate the account, community handoffs |
   | Social Media Strategist / Strategy Lead | Research, strategy, growth |
   | Content Operations Manager | Plan, set up and accept production |
   | Content Strategist / Copywriter | Produce (copy) |
   | Designer / Video Editor | Produce (design and video) |
   | Creative Lead / Art Director | Internal QA |
   | Publishing Specialist | Publish and verify |
   | Social Media Analyst | Measurement and reports |
   | Client Owner / Named Approver | Client decisions |

4. For client contacts, tick **Share submitted client material and reports** if they should see them.

### 2.3 Name the stage owners
In the **Stage ownership** table, click **Assign** on each row to name a **delivery owner** (does the work) and a **decision owner** (accepts it). The 13 stages are:

1. Onboard & align
2. Audit & research
3. Strategy & measurement
4. Plan & approve calendar
5. Brief & prepare production
6. Create content
7. Internal quality review
8. Client creative approval
9. Publish & verify
10. Audience growth
11. Measure & diagnose
12. Report to client
13. Optimize next cycle

### 2.4 Optional: workflow policy
**Configure optional step** lets you mark ordinary production steps as skippable (each skip needs a reason). Internal QA, client approval and publishing verification can never be skipped.

**Done when:** every person who will touch this client has a membership, and the client approver is named.

> Tip: **Export this account** on the same page saves a backup of just this client.

---

## Stage 3 — Client foundation
**Who:** Asha · **Approved by:** Sam · **Where:** **Content Planner → Foundation**

### 3.1 Write the foundation
Click **Set up foundation** (later **Edit foundation**) and fill in:
- Business and priority offers
- Audience and customer needs
- Service scope and restrictions
- 90-day priorities (or a substitute brief)
- Brand book and approved references
- Available media and permissions
- Accounts, evidence access and missing inputs
- Delivery roles, backup owners and escalation contacts
- **Client approver** and **Community owner** (chosen from the people list)
- Optional: content items per week, next input review date

### 3.2 Get the client's confirmation
1. Save the foundation as a version. It appears under **Client confirmation**.
2. Switch to **Sam** → **Review → Plan approvals** → **Review** → **Approve** (or **Request changes** with a note).

### 3.3 Optional: campaigns
Under **Campaigns (optional)**, add a campaign when it needs its own objective and dates.

**Done when:** the progress strip shows **Foundation · Approved**.

---

## Stage 4 — Research
**Who:** Asha · **Where:** **Content Planner → Research**

Research has four tabs.

### 4.1 Evidence inbox
1. Click **Capture evidence**.
2. **Observation or audience question** \*: what you noticed, in one or two sentences.
3. **How should this be treated?**: *Verified observation*, *Hypothesis* or *Creative reference*.
4. **Source link or file reference** \*, or attach the original file. One of the two is required.
5. Optional (**Context and usage limits**): short title, observation date, channel, audience, period covered, confidence (Unassessed / Low / Medium / High), usage limits.
6. On each evidence card you can **Inspect source**, **Edit**, **Review** (mark it reviewed), or **Merge duplicate**.

### 4.2 Themes (optional)
Group related evidence into a theme: what the evidence suggests, contradictions, confidence, and the supporting sources.

### 4.3 Angles & ideas
Turn a theme into a testable angle, decide on it with a reason, then promote it to a calendar draft.

### 4.4 Audits & watchlists
Create a **listening watchlist** (a competitor, brand or recurring question) with a review cadence. Record each collection run and note coverage gaps.

**Done when:** you have enough evidence to justify the strategy. The strip shows the source count.

---

## Stage 5 — Strategy & KPIs
**Who:** Asha · **Approved by:** Sam · **Where:** **Content Planner → Strategy & KPIs**

### 5.1 Choose how success is measured
1. Click **Choose a measure** / **Add measure**.
2. Pick a preset: Reach, Views, Impressions, Saves per 1,000 views, Shares per 1,000 views, Link clicks, Click-through rate, New follows, Net follower change, or Qualified leads. Presets fill in the formula and unit.
3. Add the channel, measurement window and a **baseline** if one exists. The baseline can stay unknown.

### 5.2 Write the strategy
Click **Save strategy version** and fill in:
- Business objective
- Audience and value proposition
- Channel roles and cadence
- Pillars and funnel stages
- Primary KPI
- Metric definition and denominator
- Measurement source
- Baseline or evidence gap
- Target, if agreed
- Measurement window
- Reporting cadence
- Discovery, growth experiments and community ownership

### 5.3 Get the client's decision
Switch to **Sam** → **Review → Plan approvals** → approve the strategy version, or request changes.

**Done when:** **Current direction** shows the strategy as *approved*, and the strip shows **Strategy & KPIs · Approved**.

---

## Stage 6 — Content calendar
**Who:** Asha · **Approved by:** Sam

### 6.1 Create drafts
There are four ways to create drafts:

| Way | Where | Best for |
|---|---|---|
| **Create draft from evidence** | Research → evidence card | One idea tied to its source. The **opening message** becomes the first line of the caption. |
| **New content** | Today (top right) | A one-off post |
| **Bulk import** | Content Planner → Bulk import | A whole calendar (CSV) plus detailed briefs (XLSX). Preview, map columns, choose a default assignee, confirm. Invalid rows can be excluded; duplicates are detected. |
| **+ New idea** | Content Planner → Calendar | Planning ideas directly in the calendar |

Each draft gets a channel, format, producer and **proposed date**. A date is needed before production.

### 6.2 Arrange the calendar
**Content Planner → Calendar** has List / Week / Month / 90-day views, filters, notes per day and a status chip on each card. **Schedule list** shows the same posts as a table.

Optional: **Reserved trend slots** (on Strategy & KPIs → *Calendar approvals and reserved slots*) hold capacity for topical posts, each with an evergreen fallback.

### 6.3 Send the calendar for approval
1. Use either:
   - **Send calendar for approval** on any draft's **Production readiness** card, or
   - Strategy & KPIs → *Calendar approvals and reserved slots* → **Send calendar for approval**. This section opens on its own when drafts are waiting.
2. Choose the period. The dialog shows how many planned items are included.
3. Click **Send to {client approver}**.

### 6.4 The client approves the calendar
Switch to **Sam** → **Today → Awaiting your review → Calendar plan** (or Review → Plan approvals). The review shows every planned item with its channel, format, purpose, KPI and date. Sam clicks **Approve calendar Vn**, or **Request changes** (a note is required).

**Done when:** each draft's readiness card shows **✓ Calendar approved**. This approves the *plan* only; each finished creative is still approved separately.

---

## Stage 7 — Brief and production set-up
**Who:** Asha (copy fields may be Luca's) · **Where:** open the post → **Brief & copy**

Every post has tabs: **Brief & copy · Production workflow · Creative versions · Review & feedback · Media requests · Version history**.

### 7.1 Complete the brief
- **Content:** title, platform, format, working caption, visual direction, slide copy or script, call to action.
- **Audience and objective** (inherited from the strategy).
- **People and timing:** content owner, final approver, publication date, time and time zone.
- Optional: **Open full Creative Brief Studio** for the detailed multi-module brief.
- Click **Save brief version**. Edits autosave on this device; saving a version shares it with the team. Once a brief has been accepted, saving a new version means it must be accepted again; the form warns you.

### 7.2 Set up production
On the **Production readiness** card, click **Set up production** and fill in:

1. **What are we making?** Choose a route:

   | Route | Checklist steps |
   |---|---|
   | Designed static | Set layout and visual references → Design and adapt each placement → Check slide order, copy and export |
   | Motion graphics | Prepare script and style frames → Approve style frames → Animate and add sound → Render and check captions |
   | Real footage edit | Check footage, releases and sound → Assemble rough cut → Approve rough cut structure → Finish captions, audio and cover |
   | AI-generated video | Approve AI use and references → Prepare shot prompts and start frames → Select takes and record AI use → Edit, caption and export |

2. **Producer**, **Internal reviewer** and **Draft due** date.
3. Route instructions, **Source assets or approved references** \*, **Permission or licence covering these assets** \*, and **Required output**.
4. Real footage adds people and releases; AI video adds an AI-use and disclosure plan.
5. Optional: review due date, permission expiry, backup owner, placement, opening hook, package and acceptance notes.

### 7.3 Accept the brief
When every row on the readiness card is ticked, click **Accept production brief**. This creates the handoffs: **Production → Luca** and **Internal QA → Asha**.

**Done when:** readiness says *Ready for production* and the Handoffs stepper shows Production assigned.

---

## Stage 8 — Create the content
**Who:** Luca · **Where:** Today → assignment, then the post's **Production workflow** and **Creative versions** tabs

1. **Accept the assignment.** On Today, open the row's **Details** and click **Accept work**. You can also mark **I'm blocked** or **Request reassignment**, with a note.
2. **Start production.** On **Production workflow**, click **Start production**. The checklist unlocks only after this.
3. **Request inputs if needed.** On **Media requests**, click **Add media request**, naming the item, the responsible person and a due date. The client can answer with text and an attached file. The team accepts the file (**Accept supplied input**) or asks for a correction.
4. **Work through the checklist.** Tick finished steps and click **Save ticked steps**. Sign-off steps (for example *Approve style frames*) need the named person.
5. **Upload the creative.** On **Creative versions**, click **Upload first version** / **Upload new version**:
   - Add images or video (PNG, JPG, WebP, GIF, MP4, WebM; up to 30 MB each). Unsupported files are listed and skipped.
   - Reorder files and add alt text.
   - Confirm the **exact caption** and describe **What changed?**.
   - Every upload creates a new version; earlier versions are kept.
6. If the post isn't ready for QA yet, a **Before internal QA** notice says what's still missing.

**Done when:** the current version exists, production has started on the current brief, and all checklist steps are done. Internal QA then shows **Ready to check**.

---

## Stage 9 — Internal QA
**Who:** Asha (the internal reviewer) · **Where:** **Review → Internal QA** → **Check Vn**

1. Look at every file (use the arrows under the preview) and the caption snapshot.
2. Tick all five checks:
   - Matches the approved brief
   - Copy and claims checked
   - Brand and legibility checked
   - Files and slide order checked
   - Usage permissions checked
3. Then either:
   - **Send to client**, which hands the version to the client approver, or
   - **Return to producer** with a note. Luca uploads a corrected version and QA starts again.
4. Optional: **Add annotation** (Production workflow tab) to comment on a slide, frame or timecode.

**Done when:** Handoffs shows **Internal QA ✓** and **Client decision** assigned.

---

## Stage 10 — Client creative approval
**Who:** Sam · **Where:** **Today → Awaiting your review**, or **Review → Creative approvals**

1. Open the item. The files are on the left; the caption and decision are on the right.
2. Click **Approve Vn** to approve this exact version (these files and this caption), **or** **Request changes**, explaining what needs to change (required).
3. If changes are requested, Luca uploads a new version, it passes QA again, and it comes back to Sam.

**Done when:** the post shows **Approved** and appears under **Publish → Ready to place**.

---

## Stage 11 — Publish and verify
**Who:** Asha prepares the placement; Luca publishes · **Where:** **Publish → Publishing desk**

### 11.1 Prepare a placement (Asha)
1. Under **Ready to place**, click **Prepare placement**.
2. Check the preview of the approved creative, then set:
   - **Destination platform**, **Destination account**, **Delivery method** (*Manual handoff* or *Simulation*), **Output format**.
   - **Planned local date and time** and **Destination time zone**. If this differs from the brief, tick the timing-change approval.
   - **Assigned publisher** and **Community handoff owner** (who watches the first comments).
   - Optional: permission expiry, finishing instructions, links and tags.
3. Tick **Release approval covers this destination and the selected creative and caption** and click **Save placement**.
4. To publish the same creative elsewhere, use **Add another destination** under *Approved creatives already placed*.

### 11.2 Publish it (Luca)
The placement dialog shows a progress bar: **Prepared → Publisher accepts → Schedule → Verify**. It stays open between steps.

1. **Accept approved package** after checking the exact files and caption.
2. **Download approved files (ZIP)** and **Download manifest** if needed. The manifest binds the files to their hashes.
3. **Schedule** (*Simulate schedule*, or *Record handoff* for manual delivery):
   - Simulation lets you choose the platform response: Accepted / Rejected by the platform / No response (outcome unknown).
   - Tick the account, files, caption, links and timing check.
4. **Verify publication** once it's live. Manual mode asks for the live post URL, the actual time and evidence.
5. If delivery is uncertain or failed, use **Reconcile attempt**. **Cancel placement** and **Pause placement** are also available. Coordinators can pause all releases under **Release controls**.

### 11.3 Community handoff
After verification, the community owner gets **Accept community handoff** on Today and watches the first comments.

**Done when:** all four steps are green, the post shows **Published**, and the board's **Published** column lists it.

---

## Stage 12 — Measure results
**Who:** Asha (analyst) · **Where:** **Learn → Results**

1. Click **Record results** and choose the published placement.
2. Set the **reporting period**. It can't end before the publish date.
3. Enter the counts the KPI needs (for example **Saves** and **Views**). Leave a field blank only when that value is unknown; enter 0 only when it was zero. At least one value is required.
4. Optional (**Other measures and collection details**): reach, impressions, likes, comments, shares, follows, leads; collection date; organic/paid; aggregation.
5. Click **Save counts and calculate KPI**. The **Measured outcomes** card shows the result, a bar against the baseline, and the change versus baseline.

Other ways to add evidence, under **Performance evidence**:
- **Single measure**: one account-level observation.
- **Import file**: CSV or JSON, with column mapping and a review step.
- **Compare two periods**, **Calculate a rate**, **Export evidence (JSON)**.
- **Calculate from existing evidence**: compute a KPI from saved observations.

**Done when:** each published post's KPI result is saved.

---

## Stage 13 — Report to the client
**Who:** Asha · **Read by:** Sam / client viewers · **Where:** **Learn → Reports**

1. Click **Draft report** on a result card, or **Create report** on the Reports tab.
2. Write the findings, limitations and the decision you're asking the client for, and attach the measured outcomes.
3. The assigned reviewer opens the snapshot, ticks *I checked period, sources, definitions, calculations and limitations*, and clicks **Mark client ready**.
4. The client sees it under **Today → Latest report** and **Learn → Shared reports**, and can **Send feedback**, which creates a follow-up for the team.

**Done when:** the report is *Client ready* and shared.

---

## Stage 14 — Growth and the next cycle
**Who:** Asha · **Where:** **Learn → Growth**

1. **Record growth work** with **Add record**: finding, audience opportunity, experiment, watchlist, collaboration or community case. Each has an owner and a review date. Records are grouped by type.
2. **Propose the next step** from a measured outcome (**Propose the next test**). The proposal can be a new research question, a strategy revision, a calendar item or a brief.
3. **Review the proposal** and accept or decline it. Accepted proposals create the draft or planning request and keep a link to the result they came from.
4. Accepted changes flow back into **Stage 4–6**. A changed strategy or calendar goes back to the client for approval, and the cycle repeats.

---

## Quick reference

### "What's blocking me?"

| You see | It means | What to do |
|---|---|---|
| Readiness: *Send a calendar version that includes this item* | The calendar covering this post isn't approved | Click **Send calendar for approval**, then the client approves it |
| Readiness: *Calendar Vn … is waiting for a decision* | Sent, waiting on the client | Client: Review → Plan approvals |
| Readiness: *Set up production* | No route, producer or reviewer yet | Click **Set up production** |
| Readiness: *Add slide copy…*, *Add the working caption*, *Planned date is missing* | Brief fields are missing | Open **Brief & copy**, fill them in and save a version |
| *Before internal QA: … needs to start production and finish N steps* | Production not started or checklist incomplete | Producer: Production workflow → **Start production**, tick steps |
| *Waiting for {name}* chip | Someone else owns this decision | Switch person, or ask them |
| *Only {name} can do this* | Your role can't do this action | Switch to the named person |
| *This reporting period ends before the post was published* | Results window is too early | Pick dates on or after the publish date |

### Where things live

| I want to… | Go to |
|---|---|
| See my work | **Today** |
| Plan (foundation, research, strategy, calendar) | **Content Planner** |
| See all production at a glance | **Studio → Production board** (To brief → In production → Internal QA → Client review → Approved → Published) |
| Check or approve work | **Review** (Internal QA, Client decisions, Planning decisions) |
| Publish | **Publish → Publishing desk** |
| Results, reports, growth | **Learn** |
| Add clients and people | **Client accounts** |
| Back up or restore everything | **Memory & backups** (admin): JSON or portable `.jmlpack` |

### Good habits
- Export a **portable backup** (`.jmlpack`) before big changes. Browser storage can be cleared.
- Keep one browser and one address per workspace. Different addresses don't share data.
- Every version, decision and release attempt is kept. Open **Version history** on any post for the full audit trail.
