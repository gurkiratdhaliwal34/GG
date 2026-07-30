/* ==========================================================================
   Summit Tire & Wheels — shared behaviour
   Everything here is progressive enhancement: with JS off, the nav panel is
   simply absent (links still reachable in the footer) and bands render fully.
   ========================================================================== */

(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- mobile nav ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var panel = document.getElementById('navPanel');

  if (toggle && panel) {
    var close = function () {
      panel.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
    };

    var open = function () {
      panel.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
    };

    toggle.addEventListener('click', function () {
      if (toggle.getAttribute('aria-expanded') === 'true') {
        close();
      } else {
        open();
      }
    });

    /* Escape closes and returns focus to the button */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        close();
        toggle.focus();
      }
    });

    /* clicking outside closes */
    document.addEventListener('click', function (e) {
      if (panel.hidden) return;
      if (panel.contains(e.target) || toggle.contains(e.target)) return;
      close();
    });

    /* leaving mobile width resets state so the desktop nav isn't left broken */
    window.addEventListener('resize', function () {
      if (window.innerWidth > 960 && !panel.hidden) close();
    });
  }

  /* ---------- quote form → mailto ----------
     There is no server behind this site, so the form hands the details to the
     customer's own mail client. Guarded on data-mailto: to move to a real
     endpoint, set an action on the form and delete that attribute, and this
     block stops touching it.

     Deliberately placed above the reveal code below, which returns early on
     pages that have no bands — quotes.html is one of them. */
  var quoteForm = document.querySelector('form[data-mailto]');

  if (quoteForm) {
    /* Returns what a person would call the value: the visible label for a
       radio group, the option text for a select, otherwise the raw value. */
    var readField = function (name) {
      var el = quoteForm.querySelector('[name="' + name + '"]');
      if (!el) return '';

      if (el.type === 'radio') {
        var picked = quoteForm.querySelector('[name="' + name + '"]:checked');
        if (!picked) return '';
        var shown = picked.parentNode.querySelector('span');
        return shown ? shown.textContent.trim() : picked.value;
      }

      if (el.tagName === 'SELECT') {
        var opt = el.options[el.selectedIndex];
        return opt ? opt.text.trim() : '';
      }

      return el.value.trim();
    };

    /* Native validation runs before this fires, so required fields are
       already filled by the time we get here. */
    quoteForm.addEventListener('submit', function (e) {
      e.preventDefault();

      /* The honeypot is invisible to people. Filled means a bot — drop it
         without feedback rather than telling it that it was caught. */
      var trap = quoteForm.querySelector('[name="company"]');
      if (trap && trap.value) return;

      var fields = [
        ['Name', 'name'],
        ['Phone', 'phone'],
        ['Email', 'email'],
        ['Vehicle is at', 'where'],
        ['Vehicle', 'vehicle'],
        ['Tire size', 'size'],
        ['New or used', 'condition'],
        ['How many', 'qty'],
        ['Needed', 'timing'],
        ['Notes', 'notes']
      ];

      var lines = [];
      for (var f = 0; f < fields.length; f++) {
        var value = readField(fields[f][1]);
        if (value) lines.push(fields[f][0] + ': ' + value);
      }

      var who = readField('name');

      window.location.href =
        'mailto:' + quoteForm.getAttribute('data-mailto') +
        '?subject=' + encodeURIComponent('Tire quote request' + (who ? ' — ' + who : '')) +
        '&body=' + encodeURIComponent(lines.join('\r\n'));
    });
  }

  /* ---------- band reveal + count-up ---------- */
  var bands = document.querySelectorAll('[data-reveal]');
  if (!bands.length) return;

  var countUp = function (el, to, duration) {
    var start = null;
    var frame = function (now) {
      if (start === null) start = now;
      var t = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(to * eased);
      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = to;
      }
    };
    requestAnimationFrame(frame);
  };

  var run = function (band) {
    band.classList.add('in');
    var nums = band.querySelectorAll('.num');
    for (var i = 0; i < nums.length; i++) {
      (function (el, delay) {
        setTimeout(function () {
          countUp(el, parseInt(el.getAttribute('data-to'), 10), 600);
        }, delay);
      })(nums[i], 220 + i * 90);
    }
  };

  for (var b = 0; b < bands.length; b++) {
    var band = bands[b];

    if (reduce || !('IntersectionObserver' in window)) {
      band.classList.add('reveal', 'in');
      continue;
    }

    band.classList.add('reveal');

    /* zero the figures only now that we know we'll animate them */
    var nums = band.querySelectorAll('.num');
    for (var n = 0; n < nums.length; n++) nums[n].textContent = '0';

    (function (el) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            run(el);
            io.disconnect();
          }
        });
      }, { threshold: 0.35 });
      io.observe(el);
    })(band);
  }
})();
