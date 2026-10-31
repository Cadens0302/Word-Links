'use strict';

(() => {
  const phone = matchMedia('(max-width: 600px)');
  const body = document.body;
  const wordInput = document.getElementById('word');
  const miniGrid = document.getElementById('mini-grid');
  const miniModal = document.getElementById('mini-modal');
  let activeGame = null;
  let activeMiniCell = null;

  function createKeyboard(name, host) {
    const panel = document.createElement('section');
    panel.className = `site-keyboard site-keyboard-${name}`;
    panel.setAttribute('aria-label', `${name === 'links' ? 'Word Links' : 'Crossword'} letter keyboard`);
    panel.innerHTML = `<div class="site-keyboard-head"><span>${name === 'links' ? 'WRITE YOUR WORD' : 'FILL THE GRID'}</span><button class="site-keyboard-done" type="button" aria-label="Close letter keyboard">Done ×</button></div>`;
    for (const letters of ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM']) {
      const row = document.createElement('div');
      row.className = 'site-keyboard-row';
      for (const letter of letters) {
        const key = document.createElement('button');
        key.type = 'button';
        key.className = 'site-keyboard-key';
        key.textContent = letter;
        key.setAttribute('aria-label', `Type ${letter}`);
        key.dataset.letter = letter;
        row.append(key);
      }
      if (letters === 'ZXCVBNM') {
        const backspace = document.createElement('button');
        backspace.type = 'button';
        backspace.className = 'site-keyboard-key site-keyboard-backspace';
        backspace.textContent = '⌫';
        backspace.setAttribute('aria-label', 'Delete letter');
        backspace.dataset.letter = 'Backspace';
        row.append(backspace);
      }
      panel.append(row);
    }
    panel.addEventListener('pointerdown', event => {
      if (event.target.closest('button')) event.preventDefault();
    });
    panel.addEventListener('click', event => {
      const key = event.target.closest('[data-letter]');
      if (key) typeLetter(name, key.dataset.letter);
      else if (event.target.closest('.site-keyboard-done')) closeKeyboard();
    });
    document.body.append(panel);
    return panel;
  }

  createKeyboard('links', document.querySelector('.entry-panel'));
  createKeyboard('mini', document.querySelector('.mini-board-column'));

  function openKeyboard(game) {
    if (!phone.matches) return;
    activeGame = game;
    body.classList.toggle('links-keyboard-open', game === 'links');
    body.classList.toggle('mini-keyboard-open', game === 'mini');
  }
  function closeKeyboard() {
    activeGame = null;
    body.classList.remove('links-keyboard-open', 'mini-keyboard-open');
  }
  window.closeMobileKeyboard = closeKeyboard;

  function typeLetter(game, key) {
    if (!phone.matches || activeGame !== game) return;
    if (game === 'links') {
      if (wordInput.disabled) return;
      wordInput.value = key === 'Backspace' ? wordInput.value.slice(0, -1) : (wordInput.value + key).slice(0, 15);
      wordInput.dispatchEvent(new Event('input', {bubbles: true}));
      wordInput.focus({preventScroll: true});
      return;
    }
    const cell = activeMiniCell?.isConnected ? activeMiniCell : miniGrid.querySelector('.mini-cell');
    if (!cell) return;
    cell.focus({preventScroll: true});
    cell.dispatchEvent(new KeyboardEvent('keydown', {key, bubbles: true, cancelable: true}));
    if (document.activeElement?.classList.contains('mini-cell')) activeMiniCell = document.activeElement;
    window.updateMobileCrosswordClue?.();
  }

  // The mobile clue navigator changes the selected answer without focusing a
  // grid cell. Track that answer silently so the on-screen keyboard always
  // writes into the visible clue instead of a previously selected word.
  window.setMobileCrosswordEntry = entry => {
    if (!phone.matches || !entry || typeof window.entryCells !== 'function' || typeof window.miniCell !== 'function') return;
    const cells = window.entryCells(entry)
      .map(point => window.miniCell(point.row, point.col))
      .filter(Boolean);
    activeMiniCell = cells.find(cell => !cell.value) || cells[0] || activeMiniCell;
  };

  function setInputModes() {
    const compact = phone.matches;
    wordInput.readOnly = compact;
    wordInput.inputMode = compact ? 'none' : 'text';
    miniGrid.querySelectorAll('.mini-cell').forEach(cell => {
      cell.readOnly = compact;
      cell.inputMode = compact ? 'none' : 'text';
    });
    if (!compact) closeKeyboard();
  }
  new MutationObserver(setInputModes).observe(miniGrid, {childList: true});
  phone.addEventListener('change', setInputModes);
  setInputModes();

  wordInput.addEventListener('focus', () => openKeyboard('links'));
  wordInput.addEventListener('click', () => openKeyboard('links'));
  miniGrid.addEventListener('focusin', event => {
    if (!event.target.classList.contains('mini-cell')) return;
    activeMiniCell = event.target;
    if (!miniModal.hidden) openKeyboard('mini');
  });
  miniGrid.addEventListener('click', event => {
    if (event.target.classList.contains('mini-cell')) openKeyboard('mini');
  });
  document.querySelector('.mobile-mini-answer')?.addEventListener('focus', () => {
    if (phone.matches && !miniModal.hidden) openKeyboard('mini');
  });
  document.querySelector('.mobile-mini-answer')?.addEventListener('click', () => {
    if (phone.matches && !miniModal.hidden) openKeyboard('mini');
  });
  document.getElementById('word-form').addEventListener('submit', closeKeyboard);
  document.getElementById('mini-check').addEventListener('click', closeKeyboard);
  for (const selector of ['#game-menu', '#mini-game-menu', '.mobile-tools-button', '#clue', '.mobile-mini-current']) {
    document.querySelectorAll(selector).forEach(button => button.addEventListener('click', closeKeyboard));
  }
  new MutationObserver(() => { if (miniModal.hidden) closeKeyboard(); }).observe(miniModal, {attributes:true,attributeFilter:['hidden']});
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && activeGame) closeKeyboard();
  });
})();
