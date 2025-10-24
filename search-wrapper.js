// search-wrapper.js — live search + relevance ranking + smart typo correction + “showing results for”
(function () {
  const PAGE_SIZE   = 3;
  const DEBOUNCE_MS = 150;
  const STORE_KEY   = 'tutorialSearchState';

  const SUGGESTIONS = [
    'new project',
    'learning objectives',
    'project labels',
    'mcq',
    'curriculum'
  ];

  // ---------- utils ----------
  const debounce = (fn, ms) => { let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), ms); }; };
  const esc = (s) => String(s)
    .replaceAll('&','&amp;').replaceAll('<','&lt;')
    .replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&#039;");
  const normalize = (s) => (s || '').toLowerCase().normalize('NFKC').trim();
  const tokenize = (q) => normalize(q).split(/[\s,./\-_:;()]+/).filter(Boolean);

  function highlight(text, words){
    if (!words.length) return esc(text);
    const parts = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
    const re = new RegExp(`(${parts.join('|')})`, 'gi');
    return esc(text).replace(re, '<mark>$1</mark>');
  }

  function levenshtein(a, b){
    if (a === b) return 0;
    const m = a.length, n = b.length;
    if (!m) return n; if (!n) return m;
    const dp = new Array(n + 1);
    for (let j = 0; j <= n; j++) dp[j] = j;
    for (let i = 1; i <= m; i++) {
      let prev = dp[0]; dp[0] = i;
      for (let j = 1; j <= n; j++) {
        const tmp = dp[j];
        dp[j] = Math.min(
          dp[j] + 1,
          dp[j-1] + 1,
          prev + (a[i-1] === b[j-1] ? 0 : 1)
        );
        prev = tmp;
      }
    }
    return dp[n];
  }

  const STOP = new Set([
    'the','and','to','of','in','a','for','on','with','at','by','is','it','as','be',
    'this','that','your','you','from','or','are','can','will','into','an','any'
  ]);

  // ---------- dictionary ----------
  function buildDictionary(index){
    const counts = new Map();
    const bump = (w) => counts.set(w, (counts.get(w) || 0) + 1);

    for (const item of index || []) {
      for (const w of tokenize(item.title || '')) if (w.length >= 3) bump(w);
      const words = tokenize((item.transcript || '').slice(0, 2000));
      let seen = 0;
      for (const w of words) {
        if (seen++ > 200) break;
        if (w.length >= 4 && !STOP.has(w)) bump(w);
      }
      if (Array.isArray(item.keywords)) {
        for (const kw of item.keywords) {
          const w = normalize(kw);
          if (w.length >= 3) bump(w);
        }
      }
    }
    for (const s of SUGGESTIONS) for (const w of tokenize(s)) if (w.length >= 3) bump(w);
    return counts;
  }

  function suggestCorrections(word, dict, limit = 2){
    if (!word || word.length < 3) return [];
    const maxDist = word.length <= 4 ? 1 : word.length <= 7 ? 2 : 3;
    const cand = [];
    for (const [w, freq] of dict.entries()) {
      if (w === word) continue;
      if (Math.abs(w.length - word.length) > maxDist) continue;
      const d = levenshtein(word, w);
      if (d <= maxDist) cand.push({ w, d, freq });
    }
    cand.sort((a,b) => (a.d - b.d) || (b.freq - a.freq) || a.w.localeCompare(b.w));
    const out = [];
    for (const c of cand) { if (!out.includes(c.w)) out.push(c.w); if (out.length >= limit) break; }
    return out;
  }

  function buildLookups(index){
    const titleSet = new Set();
    const keywordSet = new Set();
    for (const it of index || []) {
      const t = normalize(it.title || '');
      if (t) titleSet.add(t);
      if (Array.isArray(it.keywords)) for (const kw of it.keywords) keywordSet.add(normalize(kw));
    }
    const chipSet = new Set(SUGGESTIONS.map(normalize));
    return { titleSet, keywordSet, chipSet };
  }

  function rankSuggestions(phrases, dict, lookups){
    const { titleSet, keywordSet, chipSet } = lookups;
    const scored = [];
    for (const p of phrases) {
      const toks = tokenize(p);
      let score = 0;
      for (const t of toks) score += (dict.get(t) || 0);
      if (titleSet.has(normalize(p))) score += 50;
      if (chipSet.has(normalize(p)))  score += 20;
      for (const t of toks) if (keywordSet.has(t)) score += 10;
      scored.push({ p, score, len: p.length });
    }
    scored.sort((a,b) => (b.score - a.score) || (a.len - b.len) || a.p.localeCompare(b.p));
    return scored.map(x => x.p);
  }

  // ---------- NEW: validate corrections ----------
  function suggestCorrectionsForQuery(query, dict, lookups, index) {
    const tokens = tokenize(query);
    if (!tokens.length) return [];

    const perToken = tokens.map(tok => [tok, ...suggestCorrections(tok, dict, 2)]);
    const suggestions = new Set();
    const MAX_COMBOS = 128;
    function dfs(i, cur){
      if (suggestions.size >= MAX_COMBOS) return;
      if (i === perToken.length) {
        const phrase = cur.join(' ');
        if (phrase !== query) suggestions.add(phrase);
        return;
      }
      for (const choice of perToken[i]) {
        cur.push(choice);
        dfs(i+1, cur);
        cur.pop();
        if (suggestions.size >= MAX_COMBOS) break;
      }
    }
    dfs(0, []);

    const ranked = rankSuggestions(Array.from(suggestions), dict, lookups);

    // Only keep those that actually have transcript hits
    const valid = [];
    for (const s of ranked) {
      const res = rankedSearch(s, index);
      if (res.length > 0) valid.push({ phrase: s, hits: res.length });
      if (valid.length >= 5) break;
    }
    return valid.map(v => v.phrase);
  }

  function makeSnippet(source, words){
    const lower = source.toLowerCase();
    let bestIdx = Infinity;
    for (const w of words) {
      const i = lower.indexOf(w);
      if (i !== -1 && i < bestIdx) bestIdx = i;
    }
    const sentences = source.match(/[^.!?]*[.!?]/g) || [source];
    let sentence = sentences.find(s => words.every(w => s.toLowerCase().includes(w)));
    if (!sentence) {
      const base = isFinite(bestIdx) ? bestIdx : 0;
      const start = Math.max(0, base - 90);
      const end   = Math.min(source.length, base + 90);
      sentence = (start>0 ? '…' : '') + source.slice(start, end) + (end<source.length ? '…' : '');
    }
    const withQuotes = /[“”"]/.test(sentence) ? sentence.trim() : `“${sentence.trim()}”`;
    return highlight(withQuotes, words);
  }

  // ---------- relevance scoring ----------
  function computeScore(item, qTokens) {
    const title = normalize(item.title || '');
    const body  = normalize(item.transcript || '');
    const kws   = Array.isArray(item.keywords) ? item.keywords.map(normalize) : [];

    const W = {
      exactTitle: 120,
      startsTitle: 70,
      containsTitle: 45,
      exactPhraseBody: 28,
      keywordHit: 22,
      tokenInTitle: 11,
      tokenInBody: 5,
      orderBonus: 7,
      earlyPosBonus: 5,
      sameSection: 12,
      recencyBonus: 6
    };

    const query = qTokens.join(' ');
    let score = 0;

    if (title === query) score += W.exactTitle;
    if (title.startsWith(query)) score += W.startsTitle;
    if (title.includes(query)) score += W.containsTitle;
    if (body.includes(query)) score += W.exactPhraseBody;

    for (const kw of kws) {
      if (!kw) continue;
      if (kw === query) score += W.keywordHit + 5;
      else if (kw.includes(query) || query.includes(kw)) score += W.keywordHit;
      for (const t of qTokens) if (kw === t) score += 6;
    }

    const titleTokens = new Set(tokenize(item.title || ''));
    const bodyLower = body;
    let lastIdx = -1;
    for (const t of qTokens) {
      if (titleTokens.has(t)) score += W.tokenInTitle;
      const idx = bodyLower.indexOf(t);
      if (idx >= 0) {
        score += W.tokenInBody;
        if (lastIdx >= 0 && idx > lastIdx) score += W.orderBonus;
        if (idx < 80) score += W.earlyPosBonus;
        lastIdx = idx;
      }
    }

    const activeSection = window.ACTIVE_SECTION && normalize(window.ACTIVE_SECTION);
    if (activeSection && normalize(item.section || '') === activeSection) {
      score += W.sameSection;
    }

    return score;
  }

  // ---------- ranked search ----------
  function rankedSearch(query, index){
    const qTokens = tokenize(query);
    if (!qTokens.length) return [];

    const scored = [];
    for (const item of index || []) {
      const title = (item.title || '').toString();
      const body  = (item.transcript || '').toString();

      const tl = title.toLowerCase();
      const bl = body.toLowerCase();

      const combo = tl + ' ' + bl;
      const hit = qTokens.every(w => combo.includes(w));
      if (!hit) continue;

      const score = computeScore(item, qTokens);
      if (score <= 0) continue;

      const snippetSource = qTokens.some(w => bl.includes(w)) ? body : title;

      scored.push({
        item,
        score,
        layer: title || 'Untitled',
        snippetHtml: makeSnippet(snippetSource, qTokens)
      });
    }

    scored.sort((a,b) => (b.score - a.score)
      || (a.layer.length - b.layer.length)
      || a.layer.localeCompare(b.layer));
    return scored;
  }

  function renderBatch(resultsEl, items, start, count, navigate){
    const tpl = resultsEl.closest('#searchModal')?.querySelector('#sw-result-template');
    const end = Math.min(items.length, start + count);
    for (let i = start; i < end; i++) {
      const { layer, snippetHtml } = items[i];
      if (tpl) {
        const node = tpl.content.cloneNode(true);
        node.querySelector('.sw-layer').textContent = layer;
        node.querySelector('.sw-quote').innerHTML = snippetHtml;
        node.querySelector('.sw-btn').addEventListener('click', (e) => {
          e.preventDefault(); navigate?.(layer);
        });
        resultsEl.appendChild(node);
        if (i < end-1) resultsEl.appendChild(Object.assign(document.createElement('hr'), {className:'sw-sep'}));
      }
    }
    return end;
  }

  function loadState(){
    try { return JSON.parse(sessionStorage.getItem(STORE_KEY) || '{}'); }
    catch { return {}; }
  }
  function saveState(q, rendered){
    try { sessionStorage.setItem(STORE_KEY, JSON.stringify({ q, rendered })); }
    catch {}
  }

  // ---------- mount ----------
  window.SearchWrapperMount = function mount(root, { close, navigate } = {}) {
    const input      = root.querySelector('#searchInput');
    const resultsEl  = root.querySelector('#results');
    const suggestEl  = root.querySelector('#suggest');
    const suggestRow = root.querySelector('.sw-suggest-row');
    const closeBtn   = root.querySelector('#closeSearch');

    const INDEX = window.TUTORIAL_INDEX || [];
    const DICT  = buildDictionary(INDEX);
    const LOOK  = buildLookups(INDEX);

    let ranked = [];
    let rendered = 0;
    let currentQ = '';

    function renderSuggestions(){
      if (!suggestEl) return;
      suggestEl.innerHTML = '';
      SUGGESTIONS.forEach(word => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'sw-chip';
        b.textContent = word;
        b.addEventListener('click', () => { input.value = word; run.flush?.(); });
        suggestEl.appendChild(b);
      });
      if (suggestRow) suggestRow.hidden = false;
    }
    function hideSuggestions(){ if (suggestRow) suggestRow.hidden = true; }

    function showLoadMore(){
      if (rendered >= ranked.length) return;
      const more = document.createElement('div');
      more.className = 'sw-actions';
      more.style.textAlign = 'center';
      const btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'sw-btn sw-load';
      btn.textContent = 'Load more';
      btn.addEventListener('click', () => {
        more.remove();
        rendered = renderBatch(resultsEl, ranked, rendered, PAGE_SIZE, navigate);
        saveState(currentQ, rendered);
        showLoadMore();
      });
      more.appendChild(btn); resultsEl.appendChild(more);
    }

    function doSearchNow(){
      const q = (input.value || '').trim();
      currentQ = q;
      resultsEl.innerHTML = '';

      if (!q) {
        ranked = []; rendered = 0; saveState('', 0);
        renderSuggestions(); return;
      }

      hideSuggestions();
      const scored = rankedSearch(q, INDEX);
      ranked = scored;

      if (ranked.length === 0) {
        // Try valid corrections
        const validCorrections = suggestCorrectionsForQuery(q, DICT, LOOK, INDEX);
        if (validCorrections.length > 0) {
          const best = validCorrections[0];
          const correctedResults = rankedSearch(best, INDEX);
          const note = document.createElement('div');
          note.className = 'sw-block';
          note.innerHTML = `<p class="sw-found" style="color:#9aa3b2"> 
            Showing results for <span style="color:var(--blue);font-weight:700">“${esc(best)}”</span>.</p>`;
          resultsEl.appendChild(note);
          ranked = correctedResults;
          rendered = renderBatch(resultsEl, ranked, 0, PAGE_SIZE, navigate);
          saveState(best, rendered);
          showLoadMore();
          return;
        }

        // Otherwise: no valid correction either
        const none = document.createElement('div');
        none.className = 'sw-block';
        none.innerHTML = `<p class="sw-found" style="color:#9aa3b2">No match found.</p>`;
        resultsEl.appendChild(none);
        return;
      }

      rendered = renderBatch(resultsEl, ranked, 0, PAGE_SIZE, navigate);
      const state = loadState();
      if (state.q && state.q === q && state.rendered && state.rendered > rendered) {
        const target = Math.min(state.rendered, ranked.length);
        const need = target - rendered;
        if (need > 0) rendered = renderBatch(resultsEl, ranked, rendered, need, navigate);
      }
      saveState(q, rendered);
      showLoadMore();
    }

    const run = debounce(doSearchNow, DEBOUNCE_MS);
    run.flush = doSearchNow;
    input.addEventListener('input', (e) => {
  const val = e.target.value.trim();

  // hide or show "Suggested" row instantly
  if (suggestRow) {
    if (val.length > 0) {
      suggestRow.style.display = 'none';
    } else {
      suggestRow.style.display = '';
    }
  }

  run();
});


    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); if (ranked && ranked.length) navigate?.(ranked[0].layer); }
    });
    closeBtn?.addEventListener('click', () => close?.());

    const state = loadState();
    if (state.q) input.value = state.q;
    run.flush();
    setTimeout(() => input?.focus(), 0);
  };
})();
