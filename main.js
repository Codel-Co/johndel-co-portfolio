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

  /* ---------------------------------------------- resume link check
     The button points at assets/johndel-co-resume.pdf. If that file has not
     been added to the repo yet, say so in place instead of opening a 404. */

  var resumeLink = document.querySelector('a[download]');

  if (resumeLink) {
    resumeLink.addEventListener('click', function (e) {
      if (resumeLink.dataset.verified === 'true') { return; }
      e.preventDefault();

      fetch(resumeLink.getAttribute('href'), { method: 'HEAD' })
        .then(function (res) {
          if (!res.ok) { throw new Error(res.status); }
          resumeLink.dataset.verified = 'true';
          resumeLink.click();
        })
        .catch(function () {
          var note = document.getElementById('resumeNote');
          if (!note) {
            note = document.createElement('p');
            note.id = 'resumeNote';
            note.className = 'actions__note';
            note.setAttribute('role', 'status');
            resumeLink.closest('.actions').after(note);
          }
          note.textContent = 'Resume file not found. Add assets/johndel-co-resume.pdf to the site folder.';
        });
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

})();
