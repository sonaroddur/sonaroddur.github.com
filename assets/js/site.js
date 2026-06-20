/* Sona Roddur — shared preview behaviour: language, filter, reveal, rings */
(function () {
  var SVGNS = 'http://www.w3.org/2000/svg';
  var root = document.documentElement;

  /* ---- language toggle ---- */
  var langButtons = document.querySelectorAll('[data-set-lang]');
  langButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var lang = btn.getAttribute('data-set-lang');
      root.setAttribute('data-lang', lang);
      root.setAttribute('lang', lang);
      langButtons.forEach(function (o) {
        var on = o.getAttribute('data-set-lang') === lang;
        o.classList.toggle('is-active', on);
        o.setAttribute('aria-pressed', String(on));
      });
    });
  });

  /* ---- archive filter ---- */
  var filters = document.querySelectorAll('.filter');
  var entries = document.querySelectorAll('.entry');
  var countEl = document.querySelector('.filter-count');
  var searchInput = document.querySelector('.archive-search input');
  var activeType = 'all';
  function toBn(n) { return String(n).replace(/[0-9]/g, function (d) { return '০১২৩৪৫৬৭৮৯'[d]; }); }
  function applyArchive() {
    var q = (searchInput && searchInput.value || '').trim().toLowerCase();
    var visible = 0;
    entries.forEach(function (e) {
      var typeOk = activeType === 'all' || e.getAttribute('data-type') === activeType;
      var textOk = !q || e.textContent.toLowerCase().indexOf(q) !== -1;
      var show = typeOk && textOk;
      e.classList.toggle('is-hidden', !show);
      if (show) visible++;
    });
    if (countEl) {
      countEl.innerHTML = '<span class="lang-en">' + visible + (visible === 1 ? ' piece' : ' pieces') + '</span>' +
        '<span class="lang-bn bengali">' + toBn(visible) + 'টি লেখা</span>';
    }
  }
  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      activeType = btn.getAttribute('data-filter');
      filters.forEach(function (o) {
        var on = o === btn;
        o.classList.toggle('is-active', on);
        o.setAttribute('aria-pressed', String(on));
      });
      applyArchive();
    });
  });
  if (searchInput) searchInput.addEventListener('input', applyArchive);
  if (entries.length) applyArchive();

  /* ---- build the rings ---- */
  function organicRing(cx, cy, r, seed) {
    var N = 140, d = '';
    for (var k = 0; k <= N; k++) {
      var a = (k / N) * Math.PI * 2;
      var wob = 1 + 0.016 * Math.sin(a * 3 + seed) + 0.01 * Math.sin(a * 7 + seed * 1.7);
      var rr = r * wob;
      var x = (cx + rr * Math.cos(a)).toFixed(1);
      var y = (cy + rr * Math.sin(a)).toFixed(1);
      d += (k === 0 ? 'M' : 'L') + x + ' ' + y + ' ';
    }
    return d + 'Z';
  }

  function buildRings() {
    var svg = document.querySelector('.rings');
    if (!svg) return;
    var ringGroup = svg.querySelector('#ringGroup');
    var nodeGroup = svg.querySelector('#nodeGroup');
    var dataEl = document.getElementById('pieces');
    var pieces = dataEl ? JSON.parse(dataEl.textContent) : [];
    var cx = 300, cy = 300, nRings = 16, rMin = 50, rMax = 272;
    var liveByRing = {};
    pieces.forEach(function (p) { liveByRing[p.ring] = p; });

    for (var i = 1; i <= nRings; i++) {
      var r = rMin + (rMax - rMin) * (i / nRings);
      var path = document.createElementNS(SVGNS, 'path');
      path.setAttribute('d', organicRing(cx, cy, r, i));
      path.setAttribute('class', 'ring' + (liveByRing[i] ? ' is-live' : ''));
      path.style.setProperty('--i', i);
      ringGroup.appendChild(path);
    }

    pieces.forEach(function (p) {
      var r = rMin + (rMax - rMin) * (p.ring / nRings);
      var a = (p.angle) * Math.PI / 180;
      var x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
      var link = document.createElementNS(SVGNS, 'a');
      link.setAttribute('href', p.href);
      link.setAttribute('class', 'node-link');
      link.setAttribute('aria-label', p.t_bn + ' · ' + p.t_en);
      var hit = document.createElementNS(SVGNS, 'circle');
      hit.setAttribute('cx', x); hit.setAttribute('cy', y); hit.setAttribute('r', 26);
      hit.setAttribute('fill', 'transparent');
      var halo = document.createElementNS(SVGNS, 'circle');
      halo.setAttribute('cx', x); halo.setAttribute('cy', y); halo.setAttribute('r', 13);
      halo.setAttribute('class', 'node-halo');
      var dot = document.createElementNS(SVGNS, 'circle');
      dot.setAttribute('cx', x); dot.setAttribute('cy', y); dot.setAttribute('r', 4.5);
      dot.setAttribute('class', 'node-dot');
      var label = document.createElementNS(SVGNS, 'text');
      var ly = y > cy ? y + 30 : y - 22;
      label.setAttribute('x', x); label.setAttribute('y', ly);
      label.setAttribute('class', 'node-label');
      label.textContent = p.t_bn;
      link.appendChild(hit); link.appendChild(halo); link.appendChild(dot); link.appendChild(label);
      nodeGroup.appendChild(link);
    });
  }
  buildRings();

  /* ---- reveal on scroll ---- */
  var items = document.querySelectorAll('.reveal-up');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('visible'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  }
})();
