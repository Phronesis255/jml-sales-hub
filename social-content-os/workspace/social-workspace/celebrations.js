/* Transient success feedback. Never persisted or replayed when the workspace opens. */
(function (root) {
  'use strict';
  const index = rows => new Map((rows || []).map(row => [row.id, row]));
  const handoffActions = new Set(['Plan approved', 'Production assigned', 'Production readiness accepted', 'Brief confirmed at hand-off', 'Sent for review', 'Creative approved', 'Input accepted', 'Client input received']);

  function outcome(before, after) {
    const placements = index(before.releaseLearning?.placements);
    let handoff = false;
    for (const placement of after.releaseLearning?.placements || []) {
      const old = placements.get(placement.id);
      // Imported historical receipts and prepared demo data are not a publication.
      if (!old) continue;
      if (old.state !== 'verified' && placement.state === 'verified' && placement.verification) return 'publish';
      if ((!old.receipt && placement.receipt) || (!old.communityReceipt && placement.communityReceipt) ||
          (old.state !== 'handed-off' && placement.state === 'handed-off')) handoff = true;
    }
    const assignments = index(before.governance?.assignments);
    for (const assignment of after.governance?.assignments || []) {
      const old = assignments.get(assignment.id);
      if ((!old && assignment.state === 'assigned') || (old && old.state !== 'accepted' && assignment.state === 'accepted')) handoff = true;
    }
    const posts = index(before.posts);
    for (const post of after.posts || []) {
      const old = posts.get(post.id);
      if (!old) continue;
      const history = index(old.history);
      if ((post.history || []).some(event => !history.has(event.id) && handoffActions.has(event.action))) handoff = true;
    }
    const brands = index(before.brands);
    for (const brand of after.brands || []) {
      const old = brands.get(brand.id)?.operations;
      if (!old || !brand.operations) continue;
      const calendars = index(old.calendars), decisions = index(old.decisions);
      if ((brand.operations.calendars || []).some(row => !calendars.has(row.id)) ||
          (brand.operations.decisions || []).some(row => !decisions.has(row.id) && row.decision === 'approved')) handoff = true;
    }
    return handoff ? 'handoff' : '';
  }

  let layer, timer, pending;
  function clear() {
    clearTimeout(timer);
    if (pending) root.cancelAnimationFrame(pending);
    pending = null;
    layer?.remove();
    layer = null;
  }
  function show(kind) {
    clear();
    if (!['publish', 'handoff'].includes(kind) || document.hidden) return;
    // Wait until the caller has reopened any detail dialog in the top layer.
    pending = root.requestAnimationFrame(() => {
      pending = null;
      try {
        const reduced = root.matchMedia('(prefers-reduced-motion: reduce)').matches;
        layer = document.createElement('div');
        layer.className = 'success-motion success-motion--' + kind;
        layer.setAttribute('aria-hidden', 'true');
        layer.innerHTML = '<span class="success-relay"><i class="success-relay-dot"></i><svg viewBox="0 0 48 48" fill="none"><circle class="success-ring" cx="24" cy="24" r="19"/><path class="success-check" d="m15 24 6 6 12-13"/></svg></span>';
        if (kind === 'publish' && !reduced) {
          const count = root.innerWidth < 600 ? 40 : 68;
          for (let i = 0; i < count; i++) {
            const particle = document.createElement('i');
            particle.className = 'success-confetti';
            const angle = Math.PI * 2 * i / count;
            const reach = (0.35 + Math.random() * 0.65) * Math.min(root.innerWidth * 0.55, 580);
            particle.style.cssText = '--x:' + Math.cos(angle) * reach + 'px;--y:' + (Math.sin(angle) * reach * 0.65 - 110) + 'px;--fall:' + (root.innerHeight * 0.6) + 'px;--spin:' + (Math.random() * 900 - 450) + 'deg;--delay:' + Math.random() * 100 + 'ms;--confetti-color:var(' + ['--brand-primary', '--brand-accent', '--ink'][i % 3] + ');';
            layer.append(particle);
          }
        }
        // A manual popover is non-modal: above dialogs, with no focus or click capture.
        document.body.append(layer);
        if (typeof layer.showPopover === 'function') {
          layer.setAttribute('popover', 'manual');
          layer.showPopover();
        } else (document.querySelector('dialog[open]') || document.body).append(layer);
        timer = setTimeout(clear, reduced ? 1100 : kind === 'publish' ? 2100 : 1000);
      } catch (_) {
        // Decorative feedback must never turn a successful save into an error.
        clear();
      }
    });
  }
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => { if (document.hidden) clear(); });
    root.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', clear);
    root.addEventListener('pagehide', clear);
  }
  const api = {outcome, show, clear};
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.JMLCelebrations = api;
})(typeof window === 'undefined' ? globalThis : window);
