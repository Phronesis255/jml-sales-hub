/* Demo branch only: a "Fill with demo data" button on every pop-up form, for presenting the workflow live.
   It fills empty fields with plausible values (and placeholder images for uploads). It never submits:
   the presenter still clicks the form's own button, so every rule and permission still applies. */
(() => {
  'use strict';
  const modal = document.getElementById('modal');
  if (!modal) return;

  const pick = list => list[Math.floor(Math.random() * list.length)];
  const iso = days => { const d = new Date(); d.setDate(d.getDate() + days); return d.toLocaleDateString('sv-SE'); };
  const account = () => (document.title.split(' · ')[1] || 'the studio').trim();
  const postTitle = () => (document.querySelector('main h1')?.textContent || 'this post').trim();
  const topics = ['3 stretches for desk workers', 'What to bring to your first class', 'Meet the teacher: Saturday mornings', 'Behind the scenes: setting up the studio', 'Your first month: what to expect', 'Five-minute evening wind-down'];
  const people = ['Maya Chen', 'Jordan Ellis', 'Priya Nair', 'Sam Okafor', 'Lena Fischer'];
  const clients = ['Cedar & Stone Pilates', 'Bright Harbor Yoga', 'Northside Climbing Gym', 'Lumen Barre Studio', 'Willow Lane Spin', 'Saltwater Swim School'];
  // A client name that isn't already an account (read from the account switcher).
  const newClient = () => { const taken = new Set([...document.querySelectorAll('select option')].map(o => o.textContent.trim())); return clients.find(c => !taken.has(c)) || pick(clients) + ' ' + (new Date().getMonth() + 1); };

  // Values by field name (and, where names repeat, by form). Functions run at fill time.
  const byName = {
    // Client account
    'account-form:name': newClient,
    'account-form:description': 'Neighbourhood studio with beginner classes and a loyal local following',
    'governance-person:name': () => pick(people),
    // Foundation
    business: () => 'Small-group classes, an intro pack for new members and a monthly community event at ' + account() + '.',
    audience: 'Busy local professionals (25–45) who want something calm and consistent near home.',
    priorities: 'Fill the beginner series and grow weekday attendance.',
    scope: 'Instagram and Facebook organic posts. No paid ads or influencer work.',
    newApprover: () => pick(people),
    brandBook: 'Brand guide v2 (shared drive › Brand)',
    media: 'Studio photo library from the autumn shoot; staff have signed releases.',
    access: 'Instagram and Facebook admin access granted to the agency.',
    weeklyCapacity: '3',
    // Research
    observation: 'Several Google reviews mention feeling nervous before a first class.',
    reference: 'Google reviews, last 60 days',
    // Strategy & KPIs
    channelRoles: 'Instagram: 3 posts a week, reels and carousels. Facebook: class schedule and events.',
    pillars: 'Beginner tips; Class spotlights; Teacher stories; Community events',
    target: '12 saves per 1,000 views',
    growth: 'Test carousels against reels for beginner tips in the first month.',
    // Posts
    title: () => pick(topics),
    hook: 'New here? This is exactly what happens, step by step.',
    cta: 'Book the beginner series',
    problem: 'People worry they will not keep up in their first class.',
    rationale: 'Answers the most common question we hear at the front desk.',
    caption: 'New here? This is exactly what happens, step by step.\n\nBook the beginner series.',
    direction: 'Warm, natural light. Real members, not stock photos.',
    slideCopy: '1: The question\n2: What happens\n3: What to bring\n4: Book your first class',
    // Hand-off to production
    instructions: '4-slide carousel: hook, three steps, call to action. Brand colours, large type.',
    references: 'Studio photo library › Autumn shoot › Beginners class',
    rights: 'Our own photos; everyone pictured signed a release.',
    consent: 'Two members on camera; releases on file; no children.',
    disclosure: 'AI used only to extend backgrounds; disclosed in the caption.',
    // Publishing and results
    url: () => 'https://www.instagram.com/p/DEMO' + Math.random().toString(36).slice(2, 8).toUpperCase() + '/',
    source: 'Instagram Insights export',
    'value-saves': '46', 'value-views': '3200', 'value-clicks': '58', 'value-reach': '2900',
    // Reports and decisions
    summary: 'The beginner post is saving well above target in its first days: people are keeping it for later.',
    gaps: 'Early numbers from one post, organic only. The full-window reading follows.',
    ask: 'Shall we make two more first-timer posts next month?',
    note: () => modal.querySelector('[value="changes-requested"],[value="decision-no"]') ? 'Looks good to us, thanks!' : 'Demo note: everything checked against the brief.',
    reason: 'Covering while the usual producer is away.',
    'qc-failure:note': 'Slide 2 still shows last season’s price. Please update it and re-export.',
    'request-again-form:note': 'Could you send the higher-resolution version of this file?',
    'decision:note': 'The client said yes, so we will make two more posts like this next month.',
    'decision:title': () => pick(topics),
  };
  const byType = { date: () => iso(7), time: '09:00', number: '1', url: 'https://example.com/demo', email: 'demo@example.com', tel: '+1 555 0100', 'datetime-local': () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) };
  const dateByName = { due: 3, draftDue: 5, reviewDue: 6, responseDue: 14, end: 0 };
  // Successive demo posts land on different days: a week out, then every two days.
  let nextPostDay = 7;

  const labelOf = el => (el.closest('label')?.childNodes[0]?.textContent || el.getAttribute('aria-label') || el.name || '').replace(/[*·].*$/, '').trim();
  const resolve = v => typeof v === 'function' ? v() : v;
  function set(el, value) {
    el.value = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }
  function valueFor(el, form) {
    const fid = form.id || form.dataset.opsForm || form.dataset.rlForm || form.dataset.researchForm || form.dataset.personaForm || '';
    const key = fid && byName[fid + ':' + el.name] !== undefined ? fid + ':' + el.name : el.name;
    if (byName[key] !== undefined) return resolve(byName[key]);
    if (el.type === 'date' && el.name === 'date') { const d = nextPostDay; nextPostDay += 2; return iso(d); }
    if (el.type === 'date' && dateByName[el.name] !== undefined) return iso(dateByName[el.name]);
    if (!el.required) return null; // Optional fields we don't know stay empty.
    if (byType[el.type]) return resolve(byType[el.type]);
    return el.tagName === 'TEXTAREA' ? 'Demo answer: ' + labelOf(el).toLowerCase() + '.' : 'Demo ' + labelOf(el).toLowerCase();
  }

  // Placeholder artwork for upload fields: one image per slide, labelled with the post title.
  async function placeholderFiles(input) {
    const count = /carousel/i.test(document.querySelector('main .eyebrow')?.textContent || '') ? 3 : 1, colours = ['#21405d', '#2f5d50', '#7a5c2e', '#5d3a2f'], title = postTitle(), files = [];
    for (let i = 1; i <= count; i++) {
      const c = document.createElement('canvas'); c.width = 1080; c.height = 1350; const x = c.getContext('2d');
      x.fillStyle = colours[(i - 1) % colours.length]; x.fillRect(0, 0, 1080, 1350); x.fillStyle = '#fff';
      x.font = 'bold 78px sans-serif'; let line = '', y = 560;
      for (const w of (i === 1 ? title : i === count ? 'Book your first class' : 'Step ' + (i - 1)).split(' ')) { if (x.measureText(line + w).width > 900) { x.fillText(line, 90, y); line = ''; y += 96; } line += w + ' '; }
      x.fillText(line, 90, y); x.font = '32px sans-serif'; x.fillText(account() + ' · ' + i + '/' + count + ' · demo artwork', 90, 1260);
      const blob = await new Promise(r => c.toBlob(r, 'image/png'));
      files.push(new File([blob], 'demo-slide-' + i + '.png', { type: 'image/png' }));
    }
    const dt = new DataTransfer(); files.forEach(f => dt.items.add(f)); input.files = dt.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    return files.length;
  }

  async function fill(form, button) {
    let filled = 0;
    // Upload fields can sit outside the form element, so look across the whole dialog. Text posts need no artwork.
    const textPost = /text post/i.test(document.querySelector('main .eyebrow')?.textContent || '');
    for (const el of modal.querySelectorAll('input[type=file]')) {
      if (el.disabled || el.files.length || textPost || !/image|video/.test(el.accept || 'image')) continue;
      filled += await placeholderFiles(el);
      await new Promise(r => setTimeout(r, 600)); // let the app finish reading the files
    }
    for (const el of form.querySelectorAll('input[name],select[name],textarea[name]')) {
      if (el.disabled || el.readOnly || el.type === 'hidden' || el.dataset.formOptions === 'custom' || el.type === 'file') continue;
      // Required confirmations are ticked; so is "add a post idea", which shows the next cycle starting.
      if (el.type === 'checkbox') { if ((el.required || el.name === 'propose') && !el.checked) { el.checked = true; el.dispatchEvent(new Event('change', { bubbles: true })); filled++; } continue; }
      if (el.type === 'radio') { if (!form.querySelector('input[type=radio][name="' + CSS.escape(el.name) + '"]:checked')) { el.checked = true; el.dispatchEvent(new Event('change', { bubbles: true })); filled++; } continue; }
      if (el.tagName === 'SELECT') {
        if (el.value) continue;
        const option = [...el.options].find(o => o.value && o.value !== el.dataset.customValue && !/custom/i.test(o.textContent));
        if (option) { set(el, option.value); filled++; }
        continue;
      }
      if (String(el.value).trim()) continue;
      const value = valueFor(el, form);
      if (value === null || value === undefined) continue;
      set(el, value); filled++;
    }
    button.textContent = filled ? 'Filled ' + filled + (filled === 1 ? ' field' : ' fields') + ' ✓' : 'Nothing left to fill';
    setTimeout(() => { if (button.isConnected) button.textContent = 'Fill with demo data'; }, 2200);
    form.querySelector('button[type=submit],button:not([type])')?.focus();
  }

  // A form is worth filling if it has something other than radio choices (the person switcher, for example).
  const fillable = form => [...form.querySelectorAll('input[name],select[name],textarea[name]')].some(el => !el.disabled && !['hidden', 'radio'].includes(el.type));
  function decorate() {
    if (!modal.open) return;
    const form = modal.querySelector('form'), head = modal.querySelector('.modal-head');
    if (!form || !head || head.querySelector('.demo-fill') || !fillable(form)) return;
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'btn small demo-fill'; button.textContent = 'Fill with demo data';
    button.title = 'Fills empty fields with demo values. Nothing is saved until you submit.';
    button.addEventListener('click', () => fill(modal.querySelector('form'), button).catch(err => { button.textContent = 'Could not fill: ' + err.message; }));
    head.insertBefore(button, head.lastElementChild);
  }
  const style = document.createElement('style');
  style.textContent = '.modal-head .demo-fill{margin-left:auto;margin-right:8px;border-style:dashed;white-space:nowrap}';
  document.head.append(style);
  new MutationObserver(decorate).observe(modal, { childList: true, subtree: true, attributes: true, attributeFilter: ['open'] });
})();
