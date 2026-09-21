/* ============================================================
   Johndel M. Co — portfolio behaviour
   Mobile menu, scroll reveals, active-section tracking.
   ============================================================ */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------- startup preloader */

  var preloader = document.getElementById('preloader');

  if (preloader) {
    if (reduceMotion) {
      preloader.remove();
    } else {
      document.body.classList.add('is-locked');

      var MIN_SHOW = 900;   // ms — floor so it never just flashes
      var MAX_SHOW = 3200;  // ms — ceiling in case a resource stalls
      var started = Date.now();
      var dismissed = false;

      var dismiss = function () {
        if (dismissed) { return; }
        dismissed = true;

        var wait = Math.max(0, MIN_SHOW - (Date.now() - started));
        window.setTimeout(function () {
          preloader.classList.add('is-hidden');
          document.body.classList.remove('is-locked');
          window.setTimeout(function () { preloader.remove(); }, 750);
        }, wait);
      };

      window.setTimeout(dismiss, MAX_SHOW);

      if (document.readyState === 'complete') {
        dismiss();
      } else {
        window.addEventListener('load', dismiss);
      }
    }
  }

  /* ---------------------------------------------- mobile menu */

  var toggle = document.getElementById('menuToggle');
  var menu = document.getElementById('mobileMenu');
  var menuLinks = menu ? menu.querySelectorAll('a') : [];

  function openMenu() {
    menu.hidden = false;
    // next frame so the transition runs
    requestAnimationFrame(function () {
      menu.classList.add('is-open');
    });
    toggle.setAttribute('aria-expanded', 'true');
    toggle.querySelector('.menu-toggle__label').textContent = 'Close';
    document.body.classList.add('is-locked');
  }

  function closeMenu(focusToggle) {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.querySelector('.menu-toggle__label').textContent = 'Menu';
    document.body.classList.remove('is-locked');

    var hide = function () { menu.hidden = true; };
    if (reduceMotion) { hide(); } else { window.setTimeout(hide, 380); }

    if (focusToggle) { toggle.focus(); }
  }

  function menuIsOpen() {
    return toggle.getAttribute('aria-expanded') === 'true';
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menuIsOpen() ? closeMenu(false) : openMenu();
    });

    Array.prototype.forEach.call(menuLinks, function (link) {
      link.addEventListener('click', function () { closeMenu(false); });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuIsOpen()) { closeMenu(true); }
    });

    // keep focus inside the open panel
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || !menuIsOpen()) { return; }
      var focusable = [toggle].concat(Array.prototype.slice.call(menuLinks));
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    });

    // if the viewport grows back to desktop, drop the panel
    window.matchMedia('(min-width: 861px)').addEventListener('change', function (e) {
      if (e.matches && menuIsOpen()) { closeMenu(false); }
    });
  }

  /* ---------------------------------------------- smooth scrolling */

  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) { return; }

    var id = link.getAttribute('href');
    if (id === '#' || id.length < 2) { return; }

    var target = document.querySelector(id);
    if (!target) { return; }

    e.preventDefault();
    target.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start'
    });

    // move keyboard focus along with the view
    window.setTimeout(function () {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      target.removeAttribute('tabindex');
    }, reduceMotion ? 0 : 620);

    if (history.replaceState) { history.replaceState(null, '', id); }
  });

  /* ---------------------------------------------- scroll reveals */

  var revealables = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window) || reduceMotion) {
    Array.prototype.forEach.call(revealables, function (el) {
      el.classList.add('is-in');
    });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    Array.prototype.forEach.call(revealables, function (el) {
      revealObserver.observe(el);
    });
  }


  /* ---------------------------------------------- header state */

  var header = document.getElementById('siteHeader');

  function onScroll() {
    if (header) {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    }
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------------------------------------------- active nav link */

  var sections = document.querySelectorAll('main section[id]');
  var navLinks = document.querySelectorAll('.nav-desktop a');

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        var id = entry.target.id;
        Array.prototype.forEach.call(navLinks, function (link) {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    Array.prototype.forEach.call(sections, function (s) { spy.observe(s); });
  }

  /* ---------------------------------------------- skills toggle */

  var toggleWrap = document.querySelector('.skills-toggle');
  var tabTechnical = document.getElementById('tabTechnical');
  var tabProfessional = document.getElementById('tabProfessional');
  var panelTechnical = document.getElementById('panelTechnical');
  var panelProfessional = document.getElementById('panelProfessional');
  var thumb = toggleWrap ? toggleWrap.querySelector('.skills-toggle__thumb') : null;

  function positionThumb(activeBtn) {
    if (!thumb || !activeBtn) { return; }
    var wrapRect = toggleWrap.getBoundingClientRect();
    var btnRect = activeBtn.getBoundingClientRect();
    toggleWrap.style.setProperty('--thumb-w', btnRect.width + 'px');
    toggleWrap.style.setProperty('--thumb-x', (btnRect.left - wrapRect.left - 4) + 'px');
  }

  function activateTab(which) {
    var showTechnical = which === 'technical';
    var activeBtn = showTechnical ? tabTechnical : tabProfessional;
    var inactiveBtn = showTechnical ? tabProfessional : tabTechnical;
    var showPanel = showTechnical ? panelTechnical : panelProfessional;
    var hidePanel = showTechnical ? panelProfessional : panelTechnical;

    if (!activeBtn || !showPanel || activeBtn.classList.contains('is-active')) { return; }

    activeBtn.classList.add('is-active');
    activeBtn.setAttribute('aria-selected', 'true');
    activeBtn.removeAttribute('tabindex');
    inactiveBtn.classList.remove('is-active');
    inactiveBtn.setAttribute('aria-selected', 'false');
    inactiveBtn.setAttribute('tabindex', '-1');

    positionThumb(activeBtn);

    var swap = function () {
      hidePanel.hidden = true;
      hidePanel.classList.remove('is-leaving');
      showPanel.hidden = false;
      requestAnimationFrame(function () { showPanel.classList.remove('is-leaving'); });
    };

    if (reduceMotion) {
      swap();
    } else {
      hidePanel.classList.add('is-leaving');
      window.setTimeout(swap, 260);
    }
  }

  if (tabTechnical && tabProfessional) {
    tabTechnical.addEventListener('click', function () { activateTab('technical'); });
    tabProfessional.addEventListener('click', function () { activateTab('professional'); });

    [tabTechnical, tabProfessional].forEach(function (btn, i, arr) {
      btn.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') { return; }
        e.preventDefault();
        var next = arr[i === 0 ? 1 : 0];
        next.focus();
        activateTab(next === tabTechnical ? 'technical' : 'professional');
      });
    });

    window.setTimeout(function () { positionThumb(tabTechnical); }, 50);
    window.addEventListener('resize', function () {
      var active = toggleWrap.querySelector('.skills-toggle__btn.is-active');
      positionThumb(active);
    });
  }

  /* ---------------------------------------------- certificate lightbox */

  var certModal = document.getElementById('certModal');
  var certModalImg = document.getElementById('certModalImg');
  var certModalTitle = document.getElementById('certModalTitle');
  var certModalIssuer = document.getElementById('certModalIssuer');
  var certCards = document.querySelectorAll('.cert-card');
  var lastCertTrigger = null;

  function openCert(card) {
    if (!certModal) { return; }
    lastCertTrigger = card;
    certModalImg.src = card.getAttribute('data-cert-src');
    certModalImg.alt = card.getAttribute('data-cert-title') + ' certificate';
    certModalTitle.textContent = card.getAttribute('data-cert-title');
    certModalIssuer.textContent = card.getAttribute('data-cert-issuer');

    certModal.hidden = false;
    document.body.classList.add('is-locked');
    requestAnimationFrame(function () { certModal.classList.add('is-open'); });
  }

  function closeCert() {
    if (!certModal || certModal.hidden) { return; }
    certModal.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    var hide = function () {
      certModal.hidden = true;
      certModalImg.src = '';
    };
    if (reduceMotion) { hide(); } else { window.setTimeout(hide, 360); }
    if (lastCertTrigger) { lastCertTrigger.focus(); }
  }

  Array.prototype.forEach.call(certCards, function (card) {
    card.addEventListener('click', function () { openCert(card); });
  });

  if (certModal) {
    Array.prototype.forEach.call(
      certModal.querySelectorAll('[data-cert-close]'),
      function (el) { el.addEventListener('click', closeCert); }
    );
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !certModal.hidden) { closeCert(); }
    });
  }

})();
