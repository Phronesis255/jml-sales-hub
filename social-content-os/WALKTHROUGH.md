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
| **Sam Rivera** | Client approver | Approves the strategy & KPIs (once), the calendar, and each finished creative. Supplies requested inputs. Never sees the internal foundation brief. |
| **Client stakeholder** | Client viewer | Read-only view of shared material and reports. |

To try everything with fictional data first, open **Today → Start here → Load full demo workspace**, or use **Switch person → Try a sample handoff**.

### How the app tells you what's next
- **Plan for {client}** on **Today** lists the five planning stages: foundation (internal, ticked as soon as it's saved), research (optional), strategy & KPIs (the client's sign-off), calendar and production handoff. Each stage shows *Done* (approved by whom and when), *With {client approver}* (nothing to do until they decide), a red *Changes requested* row with the client's note, or the next thing to do with its button. The heading always names the one next step, or who you are waiting on. It is built from the account's records each time Today opens; it is not a demo.
  - **Who sees it:** people who plan the account (strategy or account coordination), for example Asha and the administrator. Producers like Luca and client contacts don't. Buttons appear only for steps that person can do. For example, someone with strategy access only sees the production handoff as *waiting for an account coordinator*.
  - **Which accounts:** every client added with **Add client**, plus any older account once someone saves its foundation, strategy or calendar. The fictional demo accounts (Demo studio, Northstar Coffee) never show it.
  - **When it appears and disappears:** it hides once every required step is done, and comes back by itself when something new needs doing: a post added or moved after the calendar was approved, a client asking for changes, or a newly approved post with no producer. The *Hand off to production* list only shows approved posts with no production set-up and no draft yet.
- **Assigned to you** on **Today** lists your open assignments, with the primary action on each row. A QA assignment shows *Waiting for {producer}'s draft* until there is something to check.
- When the client decides, their confirmation names who takes it from there, for example *Calendar approved. Asha Raman will hand these posts to production.*
- A **Production readiness** card on each post lists every remaining step, who it's waiting on, and a button where you can act.
- **Handoffs** on each post shows the four stages: Production → Internal QA → Client decision → Publishing.
- Fields marked `*` are required. If something is missing, a red message appears under the field or at the bottom of the form.

---

## The stages at a glance

| # | Stage | Done by | Approved by | Where |
|---|---|---|---|---|
| 1 | Add the client account | Admin | — | Client accounts → Accounts |
| 2 | People, access and stage owners | Admin | — | Client accounts → People & access |
| 3 | Client foundation (internal) | Asha | — | Content Planner → Foundation |
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
3. Click **Create account**. The new client appears in the **Client account** switcher at the top of every page, and the app opens its **Foundation** page.

**Done when:** the client is selectable in the account switcher.

> The client approver doesn't have to exist yet. If no one at the client has access, the Foundation form asks for the approver's name and adds them for you (Stage 3). You still need Stage 2 to give your own team access.

---

## Stage 2 — People, access and stage owners
**Who:** Workspace administrator · **Where:** **Client accounts → People & access**

### 2.1 Add the people
1. Click **Add person** and enter a display name for each team member and each client contact.

### 2.2 Give each person a membership on this client
1. Click **Give someone access** (or **Edit access** on a card). The page groups people into **Your team** and **Client contacts**; stage owners, optional steps and backups sit in collapsed sections below.
2. Choose the **Person** and a **Role**. The person list leaves out other clients' contacts.
   - **Workspace Admin**: runs the account.
   - **Team Member**: works on assigned items.
   - **Client Approver**: makes client decisions.
   - **Client Viewer**: read-only.
3. The role ticks its usual functions under **What they can do** (Workspace Admin: account, strategy, operations, creative QA, analytics; Team Member: copy, design, publishing; Client Approver: client approval). Adjust them if needed. Functions decide which steps a person may do:

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
Optional. Open **Stage owners (optional)** and click **Assign** on each row to name a **delivery owner** (does the work) and a **decision owner** (accepts it). The 13 stages are:

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
**Who:** Asha · **Approved by:** nobody: it's the team's internal brief · **Where:** **Content Planner → Foundation**

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
- **Client approver**: chosen from the client contacts with access. On a new client with no contacts yet, type the approver's **full name** instead. Saving adds them to People & access as this account's Client Approver.
- **Community owner** (optional, chosen from the people list)
- Optional: content items per week, next input review date

### 3.2 Save it
Click **Save foundation**. It is **not** sent to the client: the message says *Foundation saved. Next: set the strategy and KPIs for {name} to approve.* Earlier versions are kept under **Saved versions · internal, not sent to the client**. You can edit it any time without asking the client again.

### 3.3 Optional: campaigns
Under **Campaigns (optional)**, add a campaign when it needs its own objective and dates.

**Done when:** the progress strip shows **Foundation · Saved**, and the Plan card on Today ticks *Client foundation · Saved by Asha*.

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
**Who:** Asha · **Approved by:** Sam (the client's one planning sign-off) · **Where:** **Content Planner → Strategy & KPIs**

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

Click **Send to {client approver} for approval**. The message says *Strategy and KPIs sent to Sam Rivera for approval.*

### 5.3 The client approves the KPIs
Switch to **Sam** → **Today → Awaiting your review → Strategy & KPIs** → **Review**. The review leads with **How success will be measured**: the main measure, how it's calculated, the measurement window, the baseline, the target and how often results are reported. **The plan behind these KPIs** (offer, objective, audience, channels, themes, scope) is collapsed underneath for context. Sam clicks **Approve KPIs**, or **Request changes** with a note. The message reads *KPIs approved. Asha Raman will plan the calendar against them next.*

This is the client's only sign-off on planning before the calendar. Editing the internal foundation later doesn't undo it.

**Done when:** the strip shows **Strategy & KPIs · KPIs approved**, and the Plan card on Today shows *Strategy & KPIs V1 · Approved by Sam*.

---

## Stage 6 — Content calendar
**Who:** Asha · **Approved by:** Sam

**What "the calendar" is:** there is no separate calendar document to build. **Every post with a proposed date is on the calendar.** *Sending the calendar* takes a snapshot of everything planned in a period and asks the client to approve it. The snapshot covers topic, channel, format, date and goal, and the client still approves each finished post later.

The **Calendar approval** bar at the top of **Content Planner → Calendar** always shows where you are:

| Bar | Meaning | Action |
|---|---|---|
| *Agree the strategy first* | The strategy isn't approved yet | Go to Strategy & KPIs |
| *Not sent for approval yet* (grey) | Planned posts exist, none sent | **Send calendar for approval** |
| *Calendar Vn is with Sam* (amber) | Sent, waiting for a decision | See what was sent |
| *Sam asked for changes to Calendar Vn* (red) | Rejected, with Sam's note | Fix the posts, then **Send revised calendar** |
| *Calendar Vn approved by Sam* (green) | Approved | If posts were added or changed since: **Send update for approval** |

The bar's **How posts get onto the calendar** section repeats the options below.

### 6.1 Create drafts
There are four ways to create drafts:

| Way | Where | Best for |
|---|---|---|
| **Create draft from evidence** | Research → evidence card | One idea tied to its source. The **opening message** becomes the first line of the caption. |
| **+ Add a post** (or **+ New idea** inside the calendar) | Content Planner → Calendar | Planning posts one by one. Both open the same dialog: topic, opening message, call to action, channel, format, **content theme** (from the strategy), **proposed date**, time and **producer**. You stay on the calendar. |
| **Bulk import** | Content Planner → Bulk import | A whole calendar (CSV) plus detailed briefs (XLSX). Preview, map columns, choose a default assignee, confirm. Invalid rows can be excluded; duplicates are detected. |
| **New content** | Today (top right) | A one-off post outside the planning flow |

Drafts made from research or from the calendar inherit the latest strategy: its audience, objective and measure, plus the client approver. The client sees that goal and measure on every row of the calendar review. A date is needed before production.

### 6.2 Arrange the calendar
**Content Planner → Calendar** has List / Week / Month / 90-day views, filters, notes per day and a status chip on each card. **Schedule list** shows the same posts as a table.

**Change a date:** click a post in the calendar → **Change date**, or use **Change date** under *People and timing* on the post's Studio page. The calendar updates straight away, and no new brief revision is created. If the post was on an approved or pending calendar, the dialog says so and the bar asks you to send an update.

Optional: **Reserved trend slots** (on Strategy & KPIs → *Calendar approvals and reserved slots*) hold capacity for topical posts, each with an evergreen fallback.

### 6.3 Send the calendar for approval
1. Click **Send calendar for approval** on the Calendar approval bar. The same button is on any draft's **Production readiness** card and under Strategy & KPIs.
2. Choose the period. It starts from the last version's period, and the dialog shows how many planned items are included.
3. Click **Send to {client approver}**. The bar turns amber: *Calendar Vn is with Sam*.

### 6.4 The client decides
Switch to **Sam** → **Today → Awaiting your review → Calendar plan** (or Review → Plan approvals). The review shows every planned item with its channel, format, purpose, KPI and date. Sam clicks **Approve calendar Vn**, or **Request changes** (a note is required). From V2 on, the review starts with **Changed since V{n-1}** (for example *Moved: Meet our route setters · Dec 4 → Dec 5*) and repeats Sam's earlier request.

### 6.5 If the client asks for changes
- On Asha's **Today**, the **Plan for {client}** card turns the calendar row red: *Calendar Vn: Sam asked for changes*, with Sam's note and **Revise the calendar**. It also counts in **Needs attention**.
- The Calendar bar turns red, and the readiness card on each affected post shows the request.
- Fix the posts in the calendar (for a date: click the post → **Change date**), then click **Send revised calendar**. The dialog repeats Sam's note, lists **Changed since Vn**, and reuses the same period.

**Done when:** the Plan card shows **Calendar Vn · Approved by Sam**, and the next row reads **Hand off to production**. This approves the *plan* only; each finished creative is still approved separately.

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

### 7.2 Hand off to production
Start from **Today → Plan for {client} → Hand off to production**: each approved post is listed with its planned producer. Click **Set up production →** to open the post's **Production workflow** tab, then **Set up production** (the same button is on the post's **Production readiness** card). Fill in:

1. **What are we making?** Choose a route:

   Each type comes with an **optional to-do list** the producer can use for their own tracking. Nothing waits on it.

   | Route | Optional to-do steps |
   |---|---|
   | Designed static | Set layout and visual references → Design and adapt each placement → Check slide order, copy and export |
   | Motion graphics | Prepare script and style frames → Approve style frames → Animate and add sound → Render and check captions |
   | Real footage edit | Check footage, releases and sound → Assemble rough cut → Approve rough cut structure → Finish captions, audio and cover |
   | AI-generated video | Approve AI use and references → Prepare shot prompts and start frames → Select takes and record AI use → Edit, caption and export |

2. **Producer**, **Internal reviewer** and **Draft due** date.
3. Route instructions, **Source assets or approved references** \*, **Permission or licence covering these assets** \*, and **Required output**.
4. Real footage adds people and releases; AI video adds an AI-use and disclosure plan.
5. Optional: review due date, permission expiry, backup owner, placement, opening hook, package and acceptance notes.

Saving it creates the handoffs straight away: **Production → Luca** and **Internal QA → Asha**. The message says so (*Handed to Luca Vale (producer) and Asha Raman (reviewer). They'll see it on their Today.*), and the post leaves the Plan card's list. Asha's QA row reads *Waiting for Luca's draft* until a version is uploaded.

### 7.3 Confirm the brief is ready
When every row on the readiness card is ticked, click **Confirm brief is ready**. This records that the brief revision Luca works from is complete. If the brief changes later, it needs confirming again.

**Done when:** readiness says *Ready for production* and the Handoffs stepper shows Production assigned.

---

## Stage 8 — Create the content
**Who:** Luca · **Where:** Today → assignment, then the post's **Production workflow** and **Creative versions** tabs

1. **Open the assignment.** On Today, the row's button says what to do: **Upload the draft**, or **See requested changes** after client feedback. **Details** lets you **Accept work**, mark **I'm blocked**, or **Request reassignment**, with a note. Accepting is optional.
2. **Request inputs if needed.** On **Media requests**, click **Add media request**, naming the item, the responsible person and a due date. The client can answer with text and an attached file. On the same **Media requests** tab, the team sees a preview of the file and clicks **Accept file**; the file is attached to the post with nothing to re-upload. **Ask again** sends the request back to the client with a note. If you have the file yourself, use **Attach it myself**.
3. **Optional: use the to-do.** On **Production workflow**, open **Production to-do (optional)** to tick steps for your own tracking. Nothing waits on it.
4. **Upload the creative.** Click **Upload the draft** (later **Upload new version**):
   - Text posts only need the caption; adding an image is optional.
   - Image and video posts: add files (PNG, JPG, WebP, GIF, MP4, WebM; up to 30 MB each), reorder them and add alt text. Unsupported files are listed and skipped.
   - Confirm the **exact caption**. Version 1 takes an optional note for the reviewer; later versions ask **What changed?**.
   - Click **Save and send to {reviewer}**. Every upload creates a new version; earlier versions are kept.

**Done when:** the version is saved. The toast says it was sent to the reviewer, and Handoffs shows **Production ✓** and **Internal QA** assigned.

---

## Stage 9 — Quick check (internal QA)
**Who:** Asha (the internal reviewer) · **Where:** Today → **Check and send**, or **Review → Internal QA** → **Check Vn**

1. Look over the files (use the arrows under the preview) and the caption.
2. Choose one:
   - **Looks good — send to {client}**: one click hands this exact version to the client approver.
   - **Fix the caption**: correct a typo yourself. Your fix is saved as a new version with the same files and goes straight to the client in the same step, with no round trip to the producer.
   - **Return to producer**, with a note, for real problems. The producer uploads a new version, and it comes back to you.
3. Optional: **Add annotation** (Production workflow tab) to comment on a slide, frame or timecode.

Every new version passes this quick check once before the client sees it, including versions made after the client asked for changes.

**Done when:** Handoffs shows **Internal QA ✓** and **Client decision** assigned.

---

## Stage 10 — Client creative approval
**Who:** Sam · **Where:** **Today → Awaiting your review**, or **Review → Creative approvals**

1. Open the item. The files are on the left; the caption and decision are on the right.
2. Click **Approve Vn** to approve this exact version (these files and this caption), **or** **Request changes**, explaining what needs to change (required).
3. If changes are requested, Luca's Today shows **See requested changes**. Sam's note appears at the top of the post with an **Upload new version** button. The new version passes the quick check again and comes back to Sam.

**Done when:** the post shows **Approved** and appears under **Publish → Ready to place**.

---

## Stage 11 — Publish and verify
**Who:** Asha or Luca prepares the placement; Luca publishes · **Where:** **Publish → Publishing desk**

### 11.1 Prepare a placement
1. Under **Ready to place**, click **Prepare placement**.
2. Check the preview of the approved creative, then set the three essentials: **Destination platform**, **Planned local date and time**, and **Publisher**. If the time differs from the brief, tick the timing-change approval.
3. Everything else is pre-filled from the approved creative and sits under **More options**: destination account, delivery method (*Simulation* or *Manual handoff*), output format, time zone, community handoff owner, permission expiry, finishing instructions.
4. Click **Save placement**. Saving is the release approval for this exact, client-approved version, so there's no checkbox to tick. The placement dialog opens straight away.
5. To publish the same creative elsewhere, use **Add another destination** under *Approved creatives already placed*.

### 11.2 Publish it (Luca)
The placement dialog shows a progress bar: **Prepared → Publisher accepts → Schedule → Verify**.

- **Simulation:** check the files and caption, then click **Publish now (simulated)**. That one click accepts the package, schedules it and verifies the publication.
- **Manual handoff:** **Accept approved package**, then **Record handoff**, then **Verify publication** with the live post URL and time. No confirmation boxes to tick; clicking the button is the confirmation.
- **Download approved files (ZIP)** and **Download manifest** are there if you need the exact files.
- If a release is uncertain or failed, use **Reconcile attempt**. **Cancel placement** and **Pause placement** are also available. Coordinators can pause all releases under **Release controls**.

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
| *Waiting for {reviewer} to give it a quick check* | The version is with the internal reviewer | Switch to the reviewer, or wait for them |
| *{client} asked for changes to Vn* (top of the post) | The client wants a fix | Producer: **Upload new version** with the fix |
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
