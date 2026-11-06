'use strict';

(() => {
  const phone = matchMedia('(max-width: 600px)');
  const body = document.body;
  const header = document.querySelector('.masthead');
  const layout = document.querySelector('.game-layout');
  const board = document.querySelector('.board-panel');
  const grid = document.getElementById('grid');
  const mission = document.querySelector('.mission');
  const miniColumn = document.querySelector('.mini-board-column');
  const miniGrid = document.getElementById('mini-grid');
  const miniCard = document.querySelector('.mini-challenge-card');
  let scheduled = false;

  const outerHeight = element => {
    if (!element || !element.getClientRects().length) return 0;
    const style = getComputedStyle(element);
    return element.offsetHeight + parseFloat(style.marginTop || 0) + parseFloat(style.marginBottom || 0);
  };
  const setPixels = (element, name, value) => {
    const pixels = Math.floor(value) + 'px';
    if (element.style.getPropertyValue(name) !== pixels) element.style.setProperty(name, pixels);
  };

  function fitBoards() {
    scheduled = false;
    if (!phone.matches) return;
    setPixels(body, '--app-visible-height', window.visualViewport?.height || innerHeight);
    setPixels(body, '--app-visible-top', window.visualViewport?.offsetTop || 0);
    setPixels(body, '--app-header-height', header.offsetHeight);
    if (!body.classList.contains('mobile-mini-active')) {
      const visible = [...layout.children].filter(element => element.getClientRects().length);
      const gaps = Math.max(0, visible.length - 1) * parseFloat(getComputedStyle(layout).rowGap || 0);
      const others = visible.filter(element => element !== board).reduce((sum, element) => sum + outerHeight(element), 0);
      const chrome = outerHeight(board) - grid.offsetHeight;
      let size = Math.min(layout.clientWidth - 30, layout.clientHeight - others - chrome - gaps - 2);
      if (size < 170 && mission.getClientRects().length) {
        mission.classList.add('app-guidance-hidden');
        schedule();
        return;
      }
      setPixels(body, '--links-board-size', Math.max(105, size));
    } else if (miniColumn.getClientRects().length) {
      const bar = miniColumn.querySelector('.mobile-mini-bar');
      const style = getComputedStyle(miniColumn);
      const available = miniColumn.clientHeight - outerHeight(bar) - parseFloat(style.rowGap || 0) - 4;
      if (available < 150 && miniCard?.getClientRects().length) {
        miniCard.classList.add('app-guidance-hidden');
        schedule();
        return;
      }
      let size = Math.min(miniColumn.clientWidth - 4, available);
      if (body.classList.contains('mini-keyboard-open')) {
        const keyboard = document.querySelector('.site-keyboard-mini');
        const answer = document.querySelector('.mobile-mini-answer');
        if (keyboard?.getClientRects().length && answer) {
          // Keep the active answer above the overlay, including longer clues.
          const clearance = keyboard.getBoundingClientRect().top - answer.getBoundingClientRect().bottom - 10;
          size = Math.min(size, miniGrid.offsetHeight + clearance);
        }
      }
      setPixels(body, '--app-crossword-size', Math.max(120, size));
    }
  }
  function schedule() {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(fitBoards);
    }
  }
  function resetGuidance() {
    mission.classList.remove('app-guidance-hidden');
    miniCard?.classList.remove('app-guidance-hidden');
    schedule();
  }
  const observer = new ResizeObserver(schedule);
  for (const element of [header, layout, layout.querySelector('aside'), mission, miniColumn,
    document.querySelector('.mobile-mini-bar'), document.querySelector('.mini-progress-strip'),
    document.querySelector('.site-keyboard-mini')]) {
    if (element) observer.observe(element);
  }
  new MutationObserver(resetGuidance).observe(body, {attributes: true, attributeFilter: ['class']});
  window.addEventListener('resize', resetGuidance);
  window.visualViewport?.addEventListener('resize', schedule);
  window.visualViewport?.addEventListener('scroll', schedule);
  phone.addEventListener('change', resetGuidance);
  window.addEventListener('pageshow', schedule);
  schedule();
})();
