(() => {
  const search = document.querySelector('#search');
  const clear = document.querySelector('#clear-search');
  const cards = [...document.querySelectorAll('.resource')];
  const groups = [...document.querySelectorAll('[data-collection]')];
  const subgroups = [...document.querySelectorAll('[data-subgroup]')];
  const empty = document.querySelector('#empty');
  const related = document.querySelector('[data-related]');
  const result = document.querySelector('#results');
  const campaign = document.querySelector('#campaign-status');
  const normalize = value => value.normalize('NFKC').toLowerCase().trim();
  const records = cards.map(card => ({card, text: normalize(`${card.dataset.search} ${card.textContent}`)}));
  function render() {
    const terms = normalize(search.value).split(/\s+/).filter(Boolean);
    let count = 0;
    for (const {card, text} of records) {
      card.hidden = !terms.every(term => text.includes(term));
      if (!card.hidden) count++;
    }
    for (const group of subgroups) group.hidden = !group.querySelector('.resource:not([hidden])');
    for (const group of groups) group.hidden = !group.querySelector('.resource:not([hidden])');
    related.hidden = terms.length > 0;
    result.textContent = `${count} resource${count === 1 ? '' : 's'}${terms.length ? ' found' : ''}`;
    empty.hidden = count > 0;
    clear.hidden = !terms.length;
    campaign.hidden = location.hash !== '#campaigns' || document.querySelector('#campaigns').hidden;
  }
  function jump() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const target = document.getElementById(id === 'all' ? 'browse' : id);
    if (!target) return;
    if (target.closest('[hidden]')) { search.value = ''; render(); }
    target.scrollIntoView({block: 'start'});
  }
  search.addEventListener('input', render);
  clear.addEventListener('click', () => { search.value = ''; render(); search.focus(); });
  window.addEventListener('hashchange', () => { render(); jump(); });
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', () => { if (link.hash === location.hash) jump(); });
  });
  new MutationObserver(() => {
    if (!document.documentElement.classList.contains('jml-locked')) {
      document.querySelector('#main-content').focus({preventScroll:true});
      jump();
    }
  }).observe(document.documentElement, {attributes:true, attributeFilter:['class']});
  render();
  if (!document.documentElement.classList.contains('jml-locked')) jump();
})();
