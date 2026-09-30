/* tcm-quiz 滑动切题插件 v2：左滑→下一题，右滑→上一题 */
(function () {
  'use strict';
  var SWIPE_MIN = 45, SWIPE_RATIO = 0.75;
  var startX = 0, startY = 0, tracking = false;
  var diagnosed = false;

  function norm(s) { return (s || '').replace(/\s+/g, ''); }

  /* 方式一：按文字/aria-label 匹配导航按钮 */
  function findBtnByText(keywords) {
    var els = document.querySelectorAll('button, [role="button"], a');
    var best = null, bestScore = -1;
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.disabled) continue;
      var t = norm(el.textContent) + norm(el.getAttribute('aria-label')) + norm(el.title);
      if (!t) continue;
      for (var k = 0; k < keywords.length; k++) {
        if (t.indexOf(keywords[k]) !== -1) {
          var score = 100 - t.length;
          var r = el.getBoundingClientRect();
          if (r.width === 0) continue;
          if (r.top > window.innerHeight * 0.5) score += 50;
          if (score > bestScore) { bestScore = score; best = el; }
          break;
        }
      }
    }
    return best;
  }

  /* 方式二（兜底）：按位置猜测——屏幕底部最左边的可点元素=上一题，最右边=下一题 */
  function findBtnByPosition(isNext) {
    var els = [].slice.call(document.querySelectorAll('button, [role="button"]'));
    els = els.filter(function (el) {
      if (el.disabled) return false;
      var t = norm(el.textContent) + norm(el.getAttribute('aria-label'));
      if (/提交|交卷|完成|返回|收藏|解析/.test(t)) return false;
      var r = el.getBoundingClientRect();
      return r.width > 10 && r.height > 10 && r.top > window.innerHeight * 0.55;
    });
    if (els.length < 2) return null;
    els.sort(function (a, b) {
      return a.getBoundingClientRect().left - b.getBoundingClientRect().left;
    });
    return isNext ? els[els.length - 1] : els[0];
  }

  /* 诊断：找不到按钮时，一次性弹窗列出屏幕底部所有按钮的文字 */
  function diagnose() {
    if (diagnosed) return;
    diagnosed = true;
    var els = [].slice.call(document.querySelectorAll('button, [role="button"]'));
    var info = els.map(function (el) {
      var t = norm(el.textContent) || norm(el.getAttribute('aria-label')) || '(无文字)';
      var r = el.getBoundingClientRect();
      return t + ' [' + Math.round(r.left) + ',' + Math.round(r.top) + ']';
    }).filter(function (s) { return s.indexOf('(无文字)') === -1 || true; });
    alert('滑动已识别，但未找到导航按钮。\n页面按钮列表：\n' + info.join('\n'));
  }

  var PREV_KEYS = ['上一题', '上一页', '上一章', '上一', '‹', '«', '←', 'Prev'];
  var NEXT_KEYS = ['下一题', '下一页', '下一章', '下一', '›', '»', '→', 'Next'];

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
    var isNext = dx < 0;
    var btn = findBtnByText(isNext ? NEXT_KEYS : PREV_KEYS);
    if (!btn) btn = findBtnByPosition(isNext);
    if (btn) { btn.click(); diagnosed = true; }
    else diagnose();
  }

  document.addEventListener('touchstart', onStart, { passive: true });
  document.addEventListener('touchend', onEnd, { passive: true });
  document.addEventListener('mousedown', onStart);
  document.addEventListener('mouseup', onEnd);
})();
