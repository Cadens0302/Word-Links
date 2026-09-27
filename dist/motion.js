'use strict';

const gameEntranceAnimations = new WeakMap();
function animateGameEntrance(game) {
  const selector = game === 'mini'
    ? '.mini-board-column, .mini-side, .mini-info-card'
    : '.intro, .board-panel, .score-panel, .entry-panel, .mission';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll(selector).forEach((element, index) => {
    gameEntranceAnimations.get(element)?.cancel();
    if (reduced || !element.animate) return;
    // Animate only content; screen backgrounds must remain fully opaque.
    const animation = element.animate([
      { opacity: 0, transform: 'translateY(12px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 380, delay: Math.min(index * 40, 120), easing: 'ease-out', fill: 'backwards' });
    gameEntranceAnimations.set(element, animation);
  });
}

function replayMotion(element, className) {
  if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
}

document.addEventListener('click', event => {
  const control = event.target.closest('button:not(:disabled), a, summary, .cell, .mini-cell');
  if (control) replayMotion(control, 'motion-pop');
});

document.addEventListener('input', event => {
  if (event.target.matches('.mini-cell')) replayMotion(event.target, 'motion-fill');
});

const motionObserver = new MutationObserver(records => {
  for (const record of records) {
    const element = record.target.nodeType === Node.TEXT_NODE ? record.target.parentElement : record.target;
    const message = element.closest?.('.feedback, .mini-feedback, .score-line strong, .mini-progress-line strong');
    if (message) replayMotion(message, 'motion-update');
  }
});
motionObserver.observe(document.body, { subtree: true, childList: true, characterData: true });
