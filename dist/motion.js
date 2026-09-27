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
