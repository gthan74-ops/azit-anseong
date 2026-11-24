(function () {
  'use strict';

  var doc = document;
  doc.documentElement.classList.add('js');

  /* sticky header state */
  var header = doc.getElementById('site-header');
  var onScroll = function () {
    if (!header) return;
    header.classList.toggle('is-stuck', window.scrollY > 8);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* mobile menu */
  var menuButton = doc.querySelector('.menu');
  var nav = doc.getElementById('navigation');
  if (menuButton && nav) {
    var setOpen = function (open) {
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
      nav.classList.toggle('open', open);
    };
    menuButton.addEventListener('click', function () {
      setOpen(menuButton.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        menuButton.focus();
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 820) setOpen(false);
    });
  }

  /* scroll reveal */
  var targets = Array.prototype.slice.call(doc.querySelectorAll(
    '.hero-copy, .hero-visual, .section-head, .about-copy, .approach-card, .service-card, .flow, ' +
    '.product-head, .product-hero, .product-facts, .detail-copy, .lineup-card, .process-head, .steps li, ' +
    '.proof-card, .voices, .proof-photos figure, .timeline li, .team-list li, .ip-card, ' +
    '.feature-film, .film-card, .cta-panel'
  ));

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    targets.forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = Math.min(i % 4, 3) * 60 + 'ms';
    });

    var pending = targets.slice();
    var revealNow = function () {
      if (!pending.length) return;
      var limit = window.innerHeight * 0.94;
      pending = pending.filter(function (el) {
        if (el.getBoundingClientRect().top < limit) {
          el.classList.add('is-in');
          return false;
        }
        return true;
      });
    };

    /* a scroll check, not a one-off observer: elements skipped during a fast
       flick must still appear, so every frame that matters gets a look */
    var ticking = false;
    var request = function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        ticking = false;
        revealNow();
      });
    };
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    window.addEventListener('load', request);
    request();
    setTimeout(revealNow, 120);
  }

  /* only one film plays at a time */
  var videos = Array.prototype.slice.call(doc.querySelectorAll('video'));
  videos.forEach(function (video) {
    video.addEventListener('play', function () {
      videos.forEach(function (other) {
        if (other !== video && !other.paused) other.pause();
      });
    });
  });
})();
