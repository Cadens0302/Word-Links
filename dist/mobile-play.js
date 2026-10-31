'use strict';

(() => {
  const mobile = matchMedia('(max-width: 600px)');
  const icon = (name, size = 18) => {
    const paths = {
      menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
      left: '<path d="m15 18-6-6 6-6"/>',
      right: '<path d="m9 18 6-6-6-6"/>',
      up: '<path d="m18 15-6-6-6 6"/>',
      down: '<path d="m6 9 6 6 6-6"/>',
      arrow: '<path d="M5 19 19 5M8 5h11v11"/>',
      plus: '<path d="M12 5v14M5 12h14"/>',
      spark: '<path d="m12 3 1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8L12 3Z"/>',
      refresh: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.6 9a7 7 0 0 1 11.8-2L20 12M4 12l2.6 5a7 7 0 0 0 11.8-2"/>',
      history: '<path d="M4 5h16v14H4zM8 9h8M8 13h8M8 17h5"/>'
    };
    return `<svg aria-hidden="true" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`;
  };
  const decorative = new Map([
    ['↗','arrow'],['✧','spark'],['✦','spark'],['↻','refresh'],['▤','history'],['＋','plus'],['+','plus']
  ]);
  for (const element of document.querySelectorAll('button,button span,.score-symbol,.modal-mark,.game-choice-mark,.streak-flame,.mini-challenge-streak span')) {
    for (const node of [...element.childNodes]) {
      if (node.nodeType !== Node.TEXT_NODE) continue;
      const match = node.textContent.match(/^(\s*)(↗|✧|✦|↻|▤|＋|\+)(\s*)/);
      if (!match) continue;
      const svg = icon(decorative.get(match[2]) || 'arrow', 16);
      const wrapper = document.createElement('span');
      wrapper.className = 'interface-icon';
      wrapper.innerHTML = svg;
      node.textContent = node.textContent.slice(match[0].length);
      node.before(document.createTextNode(match[1]), wrapper, document.createTextNode(match[3]));
    }
  }
  for (const menu of document.querySelectorAll('#game-menu,#mini-game-menu')) menu.innerHTML = icon('menu', 21);
  for (const [id, name] of [['direction-U','up'],['direction-D','down'],['direction-L','left'],['direction-R','right']]) {
    const button = document.getElementById(id);
    if (button) button.innerHTML = `${icon(name, 14)}<span>${{up:'Up',down:'Down',left:'Left',right:'Right'}[name]}</span>`;
  }
  const miniModal = document.getElementById('mini-modal');
  const linksActions = document.querySelector('.intro-actions');
  const miniActions = document.querySelector('.mini-header-actions');
  const linksIntro = document.querySelector('.intro');
  const miniIntro = document.querySelector('.mini-page-intro');
  const miniSide = document.querySelector('.mini-side');
  const miniBoard = document.querySelector('.mini-board-column');
  const miniFeedback = document.getElementById('mini-feedback');
  const linkFeedback = document.getElementById('feedback');
  const miniChallengeCard = miniSide?.querySelector('.mini-challenge-card');
  const miniProgress = document.querySelector('.mini-progress-strip');

  function updateIdleLinkFeedback() {
    if (!linkFeedback) return;
    const idle = linkFeedback.textContent.trim() === 'Connect the two green words to finish.'
      && !linkFeedback.classList.contains('error')
      && !linkFeedback.classList.contains('success');
    linkFeedback.toggleAttribute('data-mobile-idle', idle);
  }
  updateIdleLinkFeedback();
  if (linkFeedback) new MutationObserver(updateIdleLinkFeedback)
    .observe(linkFeedback, {childList:true,characterData:true,subtree:true,attributes:true,attributeFilter:['class']});

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
  miniBar.innerHTML = '<div class="mobile-clue-tabs" role="tablist" aria-label="Crossword clue directions"><button type="button" role="tab" data-clue-section="Across" aria-selected="true">Across · Horizontal</button><button type="button" role="tab" data-clue-section="Down" aria-selected="false">Down · Vertical</button></div><div class="mobile-mini-clue-line"><button class="mobile-mini-prev" type="button" aria-label="Previous clue">'+icon('left',18)+'</button><span class="mobile-mini-current" aria-live="polite">Clue 1</span><button class="mobile-mini-next" type="button" aria-label="Next clue">'+icon('right',18)+'</button></div><div class="mobile-mini-bottom"><span class="mobile-mini-status" role="status" aria-live="polite"></span><button class="mobile-mini-check submit" type="button">Check puzzle</button></div>';
  miniBoard.append(miniBar);
  const miniCurrent = miniBar.querySelector('.mobile-mini-current');
  const miniStatus = miniBar.querySelector('.mobile-mini-status');
  const answerControl = document.createElement('label');
  answerControl.className = 'mobile-mini-answer-control';
  answerControl.innerHTML = '<span>Your answer</span>';
  const answerInput = document.createElement('input');
  answerInput.className = 'mobile-mini-answer';
  answerInput.type = 'text';
  answerInput.readOnly = true;
  answerInput.inputMode = 'none';
  answerInput.autocomplete = 'off';
  answerInput.placeholder = 'Tap to enter letters';
  answerInput.setAttribute('aria-label', 'Letters entered for the selected crossword answer');
  answerControl.append(answerInput);
  miniBar.insertBefore(answerControl, miniBar.querySelector('.mobile-mini-clue-line'));
  answerInput.addEventListener('focus', focusAnswerCell);
  answerInput.addEventListener('click', focusAnswerCell);
  function focusAnswerCell() {
    if (!selectedEntry || typeof entryCells !== 'function') return;
    const cells = entryCells(selectedEntry).map(point => miniCell(point.row, point.col)).filter(Boolean);
    const target = cells.find(cell => !cell.value) || cells[0];
    target?.focus({preventScroll:true});
  }
  let activeClueDirection = 'Across';
  const miniDirectionTabs = miniBar.querySelector('.mobile-clue-tabs');
  const miniClueList = miniSide.querySelector('.mini-clues');
  miniClueList?.classList.add('mobile-inline-clues');
  if (miniClueList) miniBar.insertBefore(miniClueList, miniBar.querySelector('.mobile-mini-clue-line'));
  function updateMiniBar() {
    let entry = typeof selectedEntry !== 'undefined' ? selectedEntry : null;
    if (!entry) {
      const first = (miniPuzzle?.entries || []).find(item => item.dir === activeClueDirection);
      if (first && typeof highlightEntry === 'function') {
        highlightEntry(first);
        entry = first;
      }
    }
    if (entry) {
      activeClueDirection = entry.dir;
      // Keep the custom keyboard pointed at the answer currently shown in the clue bar.
      window.setMobileCrosswordEntry?.(entry);
    }
    const entries = (miniPuzzle?.entries || []).filter(item => item.dir === activeClueDirection).sort((a,b) => a.number-b.number);
    const index = entries.findIndex(item => item.id === entry?.id);
    miniCurrent.textContent = entries.length ? `Clue ${index < 0 ? 1 : index + 1} of ${entries.length}` : 'Choose a clue';
    if (entry && typeof entryCells === 'function') {
      answerInput.value = entryCells(entry).map(point => miniCell(point.row, point.col)?.value || '·').join(' ');
      answerInput.setAttribute('aria-label', `${entry.dir} clue ${entry.number} answer, ${entry.answer.length} letters. Tap to enter letters.`);
    } else answerInput.value = '';
    miniStatus.textContent = miniFeedback.textContent || '';
    miniDirectionTabs.querySelectorAll('[data-clue-section]').forEach(button => {
      button.setAttribute('aria-selected', String(activeClueDirection === button.dataset.clueSection));
    });
    miniClueList?.classList.toggle('show-down', activeClueDirection === 'Down');
    miniClueList?.querySelectorAll('.mini-clue-row').forEach(row => {
      const clue = row.querySelector('.mini-clue');
      row.hidden = mobile.matches && (!entry || entry.dir !== activeClueDirection || clue?.dataset.entry !== entry.id);
    });
    miniClueList?.querySelectorAll(':scope > div').forEach(section => {
      const list = section.querySelector('[id^="mini-"]');
      section.hidden = mobile.matches && list?.id !== `mini-${activeClueDirection.toLowerCase()}`;
    });
  }
  window.updateMobileCrosswordClue = updateMiniBar;
  new MutationObserver(updateMiniBar).observe(miniFeedback, {childList:true,characterData:true,subtree:true});
  miniBar.querySelector('.mobile-mini-check').addEventListener('click', () => document.getElementById('mini-check').click());
  function stepClue(delta) {
    const ordered = (miniPuzzle?.entries||[]).filter(entry=>entry.dir===activeClueDirection).sort((a,b) => a.number-b.number);
    if (!ordered.length) return;
    const index = ordered.findIndex(entry => entry.id === selectedEntry?.id);
    const next = ordered[(index < 0 ? (delta > 0 ? 0 : ordered.length-1) : (index+delta+ordered.length)%ordered.length)];
    highlightEntry(next);
    updateMiniBar();
  }
  miniBar.querySelector('.mobile-mini-prev').addEventListener('click', () => stepClue(-1));
  miniBar.querySelector('.mobile-mini-next').addEventListener('click', () => stepClue(1));
  miniDirectionTabs.addEventListener('click', () => window.closeMobileKeyboard?.());
  miniBar.querySelector('.mobile-mini-prev').addEventListener('click', () => window.closeMobileKeyboard?.());
  miniBar.querySelector('.mobile-mini-next').addEventListener('click', () => window.closeMobileKeyboard?.());
  for (const [selector, name] of [['.mobile-mini-prev','left'],['.mobile-mini-next','right']]) {
    const button = miniBar.querySelector(selector);
    button.innerHTML = icon(name, 18);
  }
  function showClueSection(direction) {
    activeClueDirection = direction;
    const entries = miniPuzzle?.entries?.filter(entry => entry.dir === direction).sort((a,b) => a.number-b.number) || [];
    if (entries.length && !entries.some(entry => entry.id === selectedEntry?.id)) highlightEntry(entries[0]);
    updateMiniBar();
  }
  miniDirectionTabs.addEventListener('click', event => {
    const tab = event.target.closest('[data-clue-section]');
    if (tab) showClueSection(tab.dataset.clueSection);
  });
  document.addEventListener('click', event => {
    if (!mobile.matches) return;
    if (!event.target.closest('.mobile-tools-button,.intro-actions,.mini-header-actions')) closeTools();
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (!clueBackdrop.hidden) closeLinkClue();
    closeTools();
  });

  function adapt() {
    document.body.classList.toggle('mobile-play', mobile.matches);
    document.body.classList.toggle('mobile-mini-active', mobile.matches && !miniModal.hidden);
    if (mobile.matches) {
      if (miniClueList && miniClueList.parentElement !== miniBar) miniBar.insertBefore(miniClueList, miniBar.querySelector('.mobile-mini-clue-line'));
      if (miniChallengeCard && miniProgress && miniChallengeCard.parentElement !== miniModal) miniProgress.after(miniChallengeCard);
      linkClueContent.forEach(element => clueSheet.append(element));
    } else {
      if (miniClueList && miniClueList.parentElement !== miniSide) miniSide.insertBefore(miniClueList, miniSide.firstChild);
      if (miniChallengeCard && miniChallengeCard.parentElement !== miniSide) miniSide.insertBefore(miniChallengeCard, miniFeedback);
      miniClueList?.querySelectorAll('.mini-clue-row, :scope > div').forEach(element => { element.hidden = false; });
      for (const {element,parent,next} of [...originalCluePositions].reverse()) parent.insertBefore(element, next);
      closeLinkClue();
      closeTools();
    }
    updateMiniBar();
  }
  new MutationObserver(adapt).observe(miniModal, {attributes:true,attributeFilter:['hidden']});
  mobile.addEventListener('change', adapt);
  adapt();
})();
