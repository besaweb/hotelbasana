(function(){
  "use strict";

  // Footer year
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Nav scroll state
  var nav = document.getElementById('siteNav');
  var brandLogo = document.getElementById('brandLogo');

  // Active-section highlighting in nav (accessibility: aria-current)
  var navAnchors = document.querySelectorAll('.site-nav__links a[href^="#"], .mobile-menu a[href^="#"]');
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id], footer[id]'));
  var setCurrent = function(id){
    navAnchors.forEach(function(a){
      if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  };
  var updateCurrentSection = function(){
    if (!sections.length) return;
    var atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (atBottom) { setCurrent('contact'); return; }
    var line = 130; // matches fixed-nav height area
    var current = sections[0];
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].getBoundingClientRect().top - line <= 0) current = sections[i];
    }
    setCurrent(current.id);
  };

  var onScroll = function(){
    var scrolled = window.scrollY > 40;
    nav.classList.toggle('is-scrolled', scrolled);
    if (brandLogo) brandLogo.classList.toggle('is-scrolled', scrolled);
    updateCurrentSection();
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  var burger = document.getElementById('burgerBtn');
  var mobileMenu = document.getElementById('mobileMenu');
  if (burger && mobileMenu) {
    burger.addEventListener('click', function(){
      var open = mobileMenu.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mobileMenu.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        mobileMenu.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // i18n (AL/EN)
  var dict = window.I18N_DICT || { en: {}, al: {} };
  var currentLang = 'en';
  function applyLang(lang){
    if (!dict[lang]) lang = 'en';
    var d = dict[lang];
    document.documentElement.setAttribute('lang', lang === 'al' ? 'sq' : lang);
    document.querySelectorAll('[data-i18n]').forEach(function(el){
      var key = el.getAttribute('data-i18n');
      if (d[key] !== undefined) el.innerHTML = d[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el){
      var key = el.getAttribute('data-i18n-placeholder');
      if (d[key] !== undefined) el.setAttribute('placeholder', d[key]);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function(el){
      var key = el.getAttribute('data-i18n-aria');
      if (d[key] !== undefined) el.setAttribute('aria-label', d[key]);
    });
    if (d['meta.title']) document.title = d['meta.title'];
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && d['meta.description']) metaDesc.setAttribute('content', d['meta.description']);
    document.querySelectorAll('.lang-switch__btn').forEach(function(btn){
      var active = btn.getAttribute('data-lang') === lang;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    currentLang = lang;
    try { localStorage.setItem('basana-lang', lang); } catch(e) {}
  }
  document.querySelectorAll('.lang-switch__btn').forEach(function(btn){
    btn.addEventListener('click', function(){ applyLang(btn.getAttribute('data-lang')); });
  });
  var savedLang = 'al';
  try { savedLang = localStorage.getItem('basana-lang') || 'al'; } catch(e) {}
  applyLang(savedLang);

  // Request form — AJAX submit to send-request.php
  var form = document.getElementById('requestForm');
  var status = document.getElementById('formStatus');
  if (form && status) {
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var t = function(key){ return (dict[currentLang] && dict[currentLang][key]) || (dict.en && dict.en[key]) || key; };
      var name = form.querySelector('[name="name"]').value.trim();
      var email = form.querySelector('[name="email"]').value.trim();
      var message = form.querySelector('[name="message"]').value.trim();
      status.className = 'request-form__status';
      if (!name || !email || !message) {
        status.textContent = t('form.status.invalid');
        status.classList.add('is-error');
        return;
      }
      status.textContent = t('form.status.sending');
      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      fetch(form.getAttribute('action'), {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      }).then(function(res){
        if (!res.ok) throw new Error('bad status');
        return res.json().catch(function(){ return {}; });
      }).then(function(data){
        if (data && data.ok === false) throw new Error(data.error || 'rejected');
        status.textContent = t('form.status.success');
        status.classList.add('is-success');
        form.reset();
      }).catch(function(){
        status.textContent = t('form.status.error');
        status.classList.add('is-error');
      }).finally(function(){
        if (submitBtn) submitBtn.disabled = false;
      });
    });
  }

  // Scroll reveal
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('is-visible'); });
  }
})();
