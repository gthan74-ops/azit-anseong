(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  root.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── header + reading progress ─────────────────────── */
  var header = doc.getElementById('site-header');
  var progress = doc.querySelector('.progress i');

  var lastY = window.scrollY || window.pageYOffset;

  var updateChrome = function () {
    var y = window.scrollY || window.pageYOffset;
    if (header) {
      header.classList.toggle('is-stuck', y > 6);
      var menuOpen = doc.body.classList.contains('nav-open');
      if (!menuOpen) {
        var goingDown = y > lastY + 3;
        var goingUp = y < lastY - 3;
        if (y > 280 && goingDown) header.classList.add('is-hidden');
        else if (goingUp || y < 120) header.classList.remove('is-hidden');
      }
      if (y <= 280) header.classList.remove('is-hidden');
    }
    lastY = y;
    if (progress) {
      var max = doc.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? Math.min(1, y / max) * 100 : 0) + '%';
    }
  };
  updateChrome();
  window.addEventListener('scroll', updateChrome, { passive: true });
  window.addEventListener('resize', updateChrome);

  /* ── mobile menu ───────────────────────────────────── */
  var menuButton = doc.querySelector('.menu');
  var nav = doc.getElementById('navigation');

  if (menuButton && nav) {
    var setOpen = function (open) {
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
      nav.classList.toggle('open', open);
      doc.body.classList.toggle('nav-open', open);
      var label = menuButton.querySelector('.menu-txt');
      if (label) label.textContent = open ? '닫기' : '메뉴';
      if (open) {
        var first = nav.querySelector('a');
        if (first) first.focus({ preventScroll: true });
      }
    };

    menuButton.addEventListener('click', function () {
      setOpen(menuButton.getAttribute('aria-expanded') !== 'true');
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && doc.body.classList.contains('nav-open')) {
        setOpen(false);
        menuButton.focus({ preventScroll: true });
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) setOpen(false);
    });
  }

  /* ── reveal on scroll ──────────────────────────────── */
  var selector = [
    '.hero-copy', '.hero-figure', '.project-lead-inner',
    '.rail-label', '.sec-head', '.about-cols', '.company-film',
    '.svc li', '.flow',
    '.product-head', '.product-side', '.bleed', '.facts', '.pstats',
    '.detail-copy', '.detail-grid > h2',
    '.shot', '.vessels-note',
    '.usage-head',
    '.steps li',
    '.stats', '.proof-detail', '.quotes', '.proof-photos',
    '.tl li',
    '.team-main > *', '.ip',
    '.film-wide',
    '.together-inner > *'
  ].join(',');

  var targets = Array.prototype.slice.call(doc.querySelectorAll(selector));

  if (reduceMotion || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    targets.forEach(function (el) { el.classList.add('reveal'); });

    var show = function (el) { el.classList.add('is-in'); };

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          show(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

    targets.forEach(function (el) { observer.observe(el); });

    /* safety net: anything already on screen or skipped by a fast flick */
    var sweep = function () {
      var limit = window.innerHeight * 0.96;
      targets.forEach(function (el) {
        if (!el.classList.contains('is-in') && el.getBoundingClientRect().top < limit) show(el);
      });
    };
    window.addEventListener('load', sweep);
    window.addEventListener('scroll', function () {
      if (window.requestAnimationFrame) window.requestAnimationFrame(sweep);
    }, { passive: true });
    setTimeout(sweep, 300);
  }

  /* ── films: play overlay, one at a time ────────────── */
  var videos = Array.prototype.slice.call(doc.querySelectorAll('video'));

  videos.forEach(function (video) {
    var media = video.closest('.film-media');
    if (media && !media.querySelector('.video-play')) {
      var play = doc.createElement('button');
      play.type = 'button';
      play.className = 'video-play';
      play.setAttribute('aria-label', '영상 재생');
      play.innerHTML = '<span aria-hidden="true"></span>';
      play.addEventListener('click', function () {
        var attempt = video.play();
        if (attempt && attempt.catch) attempt.catch(function () {});
      });
      media.appendChild(play);
    }

    var sync = function () {
      if (media) media.classList.toggle('is-playing', !video.paused && !video.ended);
    };
    video.addEventListener('play', sync);
    video.addEventListener('pause', sync);
    video.addEventListener('ended', sync);

    if (!('playsInline' in video)) video.setAttribute('playsinline', '');

    video.addEventListener('play', function () {
      videos.forEach(function (other) {
        if (other !== video && !other.paused) other.pause();
      });
    });
  });
})();
