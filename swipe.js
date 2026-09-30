/* tcm-quiz 滑动切题插件：左滑→下一题，右滑→上一题 */
(function () {
  'use strict';
  var SWIPE_MIN = 45, SWIPE_RATIO = 0.75;
  var startX = 0, startY = 0, tracking = false;

  function norm(s) { return (s || '').replace(/\s+/g, ''); }

  function findBtn(keywords) {
    var els = document.querySelectorAll('button, [role="button"], a');
    var best = null, bestScore = -1;
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.disabled) continue;
      var t = norm(el.textContent);
      if (!t) continue;
      for (var k = 0; k < keywords.length; k++) {
        if (t.indexOf(keywords[k]) !== -1) {
          var score = 100 - t.length;
          var r = el.getBoundingClientRect();
          if (r.width === 0 && r.height === 0) continue;
          if (r.top > window.innerHeight * 0.5) score += 50;
          if (score > bestScore) { bestScore = score; best = el; }
          break;
        }
      }
    }
    return best;
  }

  var PREV_KEYS = ['上一题', '上一页', '上一章', '‹', '«', 'Prev', 'prev'];
  var NEXT_KEYS = ['下一题', '下一页', '下一章', '›', '»', 'Next', 'next'];

  function isFormEl(el) {
    while (el && el !== document.body) {
      var tag = el.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
      el = el.parentElement;
    }
    return false;
  }

  function onStart(e) {
    if (isFormEl(e.target)) { tracking = false; return; }
    var p = e.touches ? e.touches[0] : e;
    startX = p.clientX; startY = p.clientY; tracking = true;
  }

  function onEnd(e) {
    if (!tracking) return;
    tracking = false;
    var p = e.changedTouches ? e.changedTouches[0] : e;
    var dx = p.clientX - startX, dy = p.clientY - startY;
    if (Math.abs(dx) < SWIPE_MIN) return;
    if (Math.abs(dy) > Math.abs(dx) * SWIPE_RATIO) return;
    var btn = dx < 0 ? findBtn(NEXT_KEYS) : findBtn(PREV_KEYS);
    if (btn) btn.click();
  }

  document.addEventListener('touchstart', onStart, { passive: true });
  document.addEventListener('touchend', onEnd, { passive: true });
  document.addEventListener('mousedown', onStart);
  document.addEventListener('mouseup', onEnd);
})();
