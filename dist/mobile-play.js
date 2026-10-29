'use strict';

(() => {
  const mobile = matchMedia('(max-width: 600px)');
  const miniModal = document.getElementById('mini-modal');
  const linksActions = document.querySelector('.intro-actions');
  const miniActions = document.querySelector('.mini-header-actions');
  const linksIntro = document.querySelector('.intro');
  const miniIntro = document.querySelector('.mini-page-intro');
  const miniSide = document.querySelector('.mini-side');
  const miniBoard = document.querySelector('.mini-board-column');
  const miniFeedback = document.getElementById('mini-feedback');

  function makeToolsButton(label, container, actions) {
    const button = document.createElement('button');
    button.className = 'mobile-tools-button secondary';
    button.type = 'button';
    button.textContent = label;
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', `Open ${label.toLowerCase()}`);
    container.append(button);
    button.addEventListener('click', () => {
      const open = !actions.classList.contains('mobile-actions-open');
      closeTools();
      actions.classList.toggle('mobile-actions-open', open);
      button.setAttribute('aria-expanded', String(open));
    });
    return button;
  }
  const linksTools = makeToolsButton('Puzzles & options', linksIntro, linksActions);
  const miniTools = makeToolsButton('Puzzles & options', miniIntro, miniActions);
  for (const [actions, game] of [[linksActions, 'links'], [miniActions, 'crossword']]) {
    const help = document.createElement('button');
    help.type = 'button';
    help.className = 'secondary mobile-help-button';
    help.textContent = 'How to play';
    help.addEventListener('click', () => window.showGameDirections?.(game));
    actions.append(help);
  }
  function closeTools() {
    linksActions.classList.remove('mobile-actions-open');
    miniActions.classList.remove('mobile-actions-open');
    linksTools.setAttribute('aria-expanded', 'false');
    miniTools.setAttribute('aria-expanded', 'false');
  }
  for (const actions of [linksActions, miniActions]) {
    actions.addEventListener('click', event => {
      if (event.target.closest('button,a')) closeTools();
    });
  }

  // The full clue remains available in a short sheet above the compact link form.
  const linkClue = document.getElementById('clue');
  const linkClueContent = ['reroll-clue','easier-clue','clue-text','easier-clue-text'].map(id => document.getElementById(id));
  const originalCluePositions = linkClueContent.map(element => ({element, parent:element.parentNode, next:element.nextSibling}));
  const clueBackdrop = document.createElement('div');
  clueBackdrop.className = 'mobile-links-clue-backdrop';
  clueBackdrop.hidden = true;
  const clueSheet = document.createElement('section');
  clueSheet.className = 'mobile-links-clue-sheet';
  clueSheet.setAttribute('role', 'dialog');
  clueSheet.setAttribute('aria-modal', 'true');
  clueSheet.setAttribute('aria-label', 'Word Links clue');
  const clueHeading = document.createElement('div');
  clueHeading.className = 'mobile-sheet-heading';
  clueHeading.innerHTML = '<strong>Your clue</strong>';
  const clueClose = document.createElement('button');
  clueClose.type = 'button';
  clueClose.className = 'mobile-sheet-close';
  clueClose.setAttribute('aria-label', 'Close clue');
  clueClose.textContent = '×';
  clueHeading.append(clueClose);
  clueSheet.append(clueHeading);
  clueBackdrop.append(clueSheet);
  document.body.append(clueBackdrop);
  function closeLinkClue() {
    clueBackdrop.hidden = true;
    linkClue.setAttribute('aria-expanded', 'false');
  }
  clueClose.addEventListener('click', closeLinkClue);
  clueBackdrop.addEventListener('click', event => { if (event.target === clueBackdrop) closeLinkClue(); });
  linkClue.addEventListener('click', () => {
    if (!mobile.matches || document.getElementById('clue-text').hidden) return;
    clueBackdrop.hidden = false;
    clueClose.focus({preventScroll:true});
  });
  document.getElementById('word-form').addEventListener('submit', closeLinkClue);

  // A focused clue and turn buttons keep crossword solving on one screen.
  const miniBar = document.createElement('div');
  miniBar.className = 'mobile-mini-bar';
  miniBar.innerHTML = '<div class="mobile-mini-directions" role="group" aria-label="Crossword clue directions"><button type="button" data-mini-direction="Across" aria-pressed="false">→ Across</button><button type="button" data-mini-direction="Down" aria-pressed="false">↓ Down</button></div><div class="mobile-mini-clue-line"><button class="mobile-mini-prev" type="button" aria-label="Previous clue">‹</button><button class="mobile-mini-current" type="button" aria-label="Open all crossword clues">Tap a square or choose a clue</button><button class="mobile-mini-next" type="button" aria-label="Next clue">›</button></div><div class="mobile-mini-bottom"><span class="mobile-mini-status" role="status" aria-live="polite"></span><button class="mobile-mini-check submit" type="button">Check puzzle</button></div>';
  miniBoard.append(miniBar);
  const miniCurrent = miniBar.querySelector('.mobile-mini-current');
  const miniStatus = miniBar.querySelector('.mobile-mini-status');
  function updateMiniBar() {
    const entry = typeof selectedEntry !== 'undefined' ? selectedEntry : null;
    miniCurrent.textContent = entry ? `${entry.number} ${entry.dir} · ${entry.clue} (${entry.answer.length})` : 'Tap a square or choose a clue';
    miniStatus.textContent = miniFeedback.textContent || '';
    miniBar.querySelectorAll('[data-mini-direction]').forEach(button => {
      const active = entry?.dir === button.dataset.miniDirection;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }
  window.updateMobileCrosswordClue = updateMiniBar;
  new MutationObserver(updateMiniBar).observe(miniFeedback, {childList:true,characterData:true,subtree:true});
  miniCurrent.addEventListener('click', openMiniClues);
  miniBar.querySelector('.mobile-mini-check').addEventListener('click', () => document.getElementById('mini-check').click());
  function stepClue(delta) {
    if (!miniPuzzle?.entries?.length) return;
    const ordered = [...miniPuzzle.entries].sort((a,b) => a.number-b.number);
    const index = ordered.findIndex(entry => entry.id === selectedEntry?.id);
    const next = ordered[(index < 0 ? (delta > 0 ? 0 : ordered.length-1) : (index+delta+ordered.length)%ordered.length)];
    highlightEntry(next);
    miniCell(next.row, next.col)?.focus({preventScroll:true});
    updateMiniBar();
  }
  miniBar.querySelector('.mobile-mini-prev').addEventListener('click', () => stepClue(-1));
  miniBar.querySelector('.mobile-mini-next').addEventListener('click', () => stepClue(1));
  miniBar.querySelectorAll('[data-mini-direction]').forEach(button => button.addEventListener('click', () => {
    const entries = miniPuzzle?.entries?.filter(entry => entry.dir === button.dataset.miniDirection).sort((a,b) => a.number-b.number) || [];
    if (!entries.length) return;
    const index = entries.findIndex(entry => entry.id === selectedEntry?.id);
    const next = entries[index < 0 ? 0 : (index+1) % entries.length];
    highlightEntry(next);
    miniCell(next.row, next.col)?.focus({preventScroll:true});
    updateMiniBar();
  }));
  const miniClose = document.createElement('button');
  miniClose.type = 'button';
  miniClose.className = 'mobile-mini-close';
  miniClose.textContent = 'Close clues ×';
  miniSide.prepend(miniClose);
  const miniDirectionTabs = document.createElement('div');
  miniDirectionTabs.className = 'mobile-clue-tabs';
  miniDirectionTabs.setAttribute('role', 'tablist');
  miniDirectionTabs.setAttribute('aria-label', 'Crossword clues');
  miniDirectionTabs.innerHTML = '<button type="button" role="tab" data-clue-section="Across" aria-selected="true">Horizontal · Across</button><button type="button" role="tab" data-clue-section="Down" aria-selected="false">Vertical · Down</button>';
  miniClose.after(miniDirectionTabs);
  function showClueSection(direction) {
    miniDirectionTabs.querySelectorAll('[data-clue-section]').forEach(button => {
      const active = button.dataset.clueSection === direction;
      button.setAttribute('aria-selected', String(active));
    });
    miniSide.querySelector('.mini-clues')?.classList.toggle('show-down', direction === 'Down');
  }
  miniDirectionTabs.addEventListener('click', event => {
    const tab = event.target.closest('[data-clue-section]');
    if (tab) showClueSection(tab.dataset.clueSection);
  });
  showClueSection('Across');
  function openMiniClues() {
    if (!mobile.matches) return;
    miniSide.classList.add('mobile-clues-open');
    miniClose.focus({preventScroll:true});
  }
  function closeMiniClues() {
    miniSide.classList.remove('mobile-clues-open');
    miniCurrent.focus({preventScroll:true});
  }
  miniClose.addEventListener('click', closeMiniClues);
  miniSide.addEventListener('click', event => {
    if (mobile.matches && event.target.closest('.mini-clue')) closeMiniClues();
  });
  document.addEventListener('click', event => {
    if (!mobile.matches) return;
    if (!event.target.closest('.mobile-tools-button,.intro-actions,.mini-header-actions')) closeTools();
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (!clueBackdrop.hidden) closeLinkClue();
    if (miniSide.classList.contains('mobile-clues-open')) closeMiniClues();
    closeTools();
  });

  function adapt() {
    document.body.classList.toggle('mobile-play', mobile.matches);
    document.body.classList.toggle('mobile-mini-active', mobile.matches && !miniModal.hidden);
    if (mobile.matches) {
      linkClueContent.forEach(element => clueSheet.append(element));
    } else {
      for (const {element,parent,next} of [...originalCluePositions].reverse()) parent.insertBefore(element, next);
      closeLinkClue();
      closeMiniClues();
      closeTools();
    }
    updateMiniBar();
  }
  new MutationObserver(adapt).observe(miniModal, {attributes:true,attributeFilter:['hidden']});
  mobile.addEventListener('change', adapt);
  adapt();
})();
