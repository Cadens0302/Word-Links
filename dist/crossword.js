'use strict';

const MINI_SIZE = 20;

const MINI_PUZZLES = [
  {
    title: 'A little word square',
    rows: ['#CAT#', '#ARE#', '#TEN#', '#####', '#DOG#'],
    entries: [
      {id:'1a',dir:'Across',row:0,col:1,answer:'CAT',clue:'A small pet that purrs.'},
      {id:'2a',dir:'Across',row:1,col:1,answer:'ARE',clue:'Plural form of “be.”'},
      {id:'3a',dir:'Across',row:2,col:1,answer:'TEN',clue:'Five plus five.'},
      {id:'4a',dir:'Across',row:4,col:1,answer:'DOG',clue:'A loyal pet that barks.'},
      {id:'1d',dir:'Down',row:0,col:1,answer:'CAT',clue:'A feline house companion.'},
      {id:'2d',dir:'Down',row:0,col:2,answer:'ARE',clue:'A verb used with “you.”'},
      {id:'3d',dir:'Down',row:0,col:3,answer:'TEN',clue:'The number after nine.'},
      {id:'1x',dir:'Diagonal',row:0,col:1,answer:'CAT',clue:'A feline friend, read on a slant.'},
      {id:'5a',dir:'Across',row:5,col:1,answer:'TREE',clue:'A tall plant with a trunk.'},
      {id:'6a',dir:'Across',row:6,col:1,answer:'BOOK',clue:'A story you can read.'},
      {id:'7a',dir:'Across',row:7,col:1,answer:'LAMP',clue:'A small light for a room.'},
      {id:'8a',dir:'Across',row:8,col:1,answer:'HOUSE',clue:'A place where people live.'}
    ]
  },
  {
    title: 'Sunny side up',
    rows: ['#SUN#', '#USE#', '#NET#', '#####', '#MAP#'],
    entries: [
      {id:'1a',dir:'Across',row:0,col:1,answer:'SUN',clue:'The star at the center of our sky.'},
      {id:'2a',dir:'Across',row:1,col:1,answer:'USE',clue:'Put something to work.'},
      {id:'3a',dir:'Across',row:2,col:1,answer:'NET',clue:'A mesh used to catch or hold things.'},
      {id:'4a',dir:'Across',row:4,col:1,answer:'MAP',clue:'A drawing that helps you find your way.'},
      {id:'1d',dir:'Down',row:0,col:1,answer:'SUN',clue:'It rises in the east.'},
      {id:'2d',dir:'Down',row:0,col:2,answer:'USE',clue:'Employ; make practical.'},
      {id:'3d',dir:'Down',row:0,col:3,answer:'NET',clue:'What remains after costs, sometimes.'},
      {id:'1x',dir:'Diagonal',row:0,col:1,answer:'SUN',clue:'A bright word that travels diagonally.'},
      {id:'5a',dir:'Across',row:5,col:1,answer:'FISH',clue:'An animal that swims.'},
      {id:'6a',dir:'Across',row:6,col:1,answer:'MOON',clue:'It shines at night.'},
      {id:'7a',dir:'Across',row:7,col:1,answer:'HAT',clue:'You can wear it on your head.'},
      {id:'8a',dir:'Across',row:8,col:1,answer:'BED',clue:'A place to sleep.'}
    ]
  }
];

function miniDateKey(date = new Date()) { return date.toISOString().slice(0, 10); }
function miniDailyIndex() { let hash = 0; for (const char of miniDateKey()) hash = (hash * 31 + char.charCodeAt(0)) >>> 0; return hash % MINI_PUZZLES.length; }
function miniHistory() { try { return JSON.parse(localStorage.getItem('wordLinksMiniHistory') || '[]'); } catch { return []; } }
function miniStreak() { const solved = new Set(miniHistory().map(item => item.date)); let streak = 0; const date = new Date(); while (solved.has(miniDateKey(date))) { streak++; date.setUTCDate(date.getUTCDate() - 1); } return streak; }
function recordMiniSolved() { const date = miniDateKey(); const history = miniHistory(); if (!history.some(item => item.date === date)) { history.unshift({date, title: miniPuzzle.title}); localStorage.setItem('wordLinksMiniHistory', JSON.stringify(history.slice(0, 60))); } return miniStreak(); }
function renderMiniHistory() { const panel = document.getElementById('mini-history-panel'); const history = miniHistory(); panel.innerHTML = history.length ? `<strong>Mini history</strong><br>${history.slice(0, 8).map(item => `${item.date} · ${item.title}`).join('<br>')}<br><strong>${miniStreak()} day streak</strong>` : 'No completed mini puzzles yet.'; }

let miniIndex = miniDailyIndex();
let miniPuzzle = MINI_PUZZLES[miniIndex];
let miniCells = [];
let selectedEntry = null;

function miniCell(row, col) { return miniCells[row * MINI_SIZE + col]; }

function entryCells(entry) {
  return [...entry.answer].map((_, index) => ({
    row: entry.row + (entry.dir === 'Down' || entry.dir === 'Diagonal' ? index : 0),
    col: entry.col + (entry.dir === 'Across' || entry.dir === 'Diagonal' ? index : 0)
  }));
}

function miniSeed() { let hash = 2166136261; for (const char of `${miniPuzzle.title}-${miniDateKey()}`) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); } return hash >>> 0; }
function layoutMiniEntries() {
  let state = miniSeed(); const random = () => { state = Math.imul(state ^ state >>> 13, 1274126177); return ((state >>> 0) % 100000) / 100000; };
  const occupied = new Set(); const dirs = ['Across', 'Down', 'Diagonal'];
  miniPuzzle.entries.forEach(entry => {
    for (let attempt = 0; attempt < 200; attempt++) {
      const dir = dirs[Math.floor(random() * dirs.length)]; const length = entry.answer.length;
      const row = Math.floor(random() * (MINI_SIZE - (dir === 'Across' ? 1 : length - 1)));
      const col = Math.floor(random() * (MINI_SIZE - (dir === 'Down' ? 1 : length - 1)));
      const cells = entry.answer.split('').map((_, i) => `${row + (dir !== 'Across' ? i : 0)},${col + (dir !== 'Down' ? i : 0)}`);
      if (cells.every(cell => !occupied.has(cell))) { entry.row = row; entry.col = col; entry.dir = dir; cells.forEach(cell => occupied.add(cell)); break; }
    }
  });
}

function renderMini() {
  if (!miniPuzzle._laidOut) { layoutMiniEntries(); miniPuzzle._laidOut = true; }
  const grid = document.getElementById('mini-grid');
  grid.innerHTML = '';
  miniCells = [];
  const starts = new Map();
  miniPuzzle.entries.forEach(entry => starts.set(`${entry.row},${entry.col}`, entry.id));
  const rows = Array.from({length: MINI_SIZE}, (_, r) => (miniPuzzle.rows[r] || '').padEnd(MINI_SIZE, ' ').slice(0, MINI_SIZE));
  rows.forEach((row, r) => [...row].forEach((value, c) => {
    const square = document.createElement('div');
    square.className = 'mini-square';
    const cell = document.createElement(value === '#' ? 'span' : 'input');
    cell.className = value === '#' ? 'mini-block' : 'mini-cell';
    cell.dataset.row = r;
    cell.dataset.col = c;
    const number = starts.get(`${r},${c}`);
    if (number) { const label = document.createElement('span'); label.className = 'mini-number'; label.textContent = number.replace(/[a-z]/, ''); square.append(label); }
    if (value !== '#') {
      cell.maxLength = 1;
      cell.autocomplete = 'off';
      cell.setAttribute('aria-label', `Mini crossword ${String.fromCharCode(65+c)}${r+1}`);
      cell.addEventListener('input', () => {
        cell.value = cell.value.replace(/[^a-z]/gi, '').toUpperCase();
        if (cell.value) focusMiniCell(r, c, 1);
      });
      cell.addEventListener('keydown', event => {
        if (event.key === 'Backspace' && !cell.value) focusMiniCell(r, c, -1);
        if (event.key === 'ArrowRight') { event.preventDefault(); focusMiniCell(r, c, 1); }
        if (event.key === 'ArrowLeft') { event.preventDefault(); focusMiniCell(r, c, -1); }
        if (event.key === 'ArrowDown') { event.preventDefault(); focusMiniCell(r, c, MINI_SIZE); }
        if (event.key === 'ArrowUp') { event.preventDefault(); focusMiniCell(r, c, -MINI_SIZE); }
      });
      cell.addEventListener('focus', () => highlightEntryAt(r, c));
      miniCells.push(cell);
    } else miniCells.push(null);
    square.append(cell);
    grid.append(square);
  }));
  document.getElementById('mini-title').textContent = miniPuzzle.title;
  renderMiniClues();
}

function focusMiniCell(row, col, offset) {
  const start = row * MINI_SIZE + col;
  for (let index = start + offset; index >= 0 && index < MINI_SIZE * MINI_SIZE; index += offset) {
    if (miniCells[index]) { miniCells[index].focus(); return; }
  }
}

function highlightEntry(entry) {
  selectedEntry = entry;
  document.querySelectorAll('.mini-cell').forEach(cell => cell.classList.remove('mini-active'));
  entryCells(entry).forEach(({row, col}) => miniCell(row, col)?.classList.add('mini-active'));
  document.querySelectorAll('.mini-clue').forEach(button => button.classList.toggle('active', button.dataset.entry === entry.id));
}

function highlightEntryAt(row, col) {
  const entry = miniPuzzle.entries.find(candidate => entryCells(candidate).some(cell => cell.row === row && cell.col === col));
  if (entry) highlightEntry(entry);
}

function renderMiniClues() {
  for (const direction of ['Across', 'Down', 'Diagonal']) {
    const list = document.getElementById(direction === 'Across' ? 'mini-across' : direction === 'Down' ? 'mini-down' : 'mini-diagonal');
    list.innerHTML = miniPuzzle.entries.filter(entry => entry.dir === direction).map(entry => `<button class="mini-clue" type="button" data-entry="${entry.id}"><strong>${entry.id.replace(/[a-z]/,'')}</strong> ${entry.clue}</button>`).join('');
    list.querySelectorAll('.mini-clue').forEach(button => button.addEventListener('click', () => {
      const entry = miniPuzzle.entries.find(item => item.id === button.dataset.entry);
      highlightEntry(entry);
      miniCell(entry.row, entry.col)?.focus();
    }));
  }
}

function checkMini() {
  let complete = true;
  miniPuzzle.entries.forEach(entry => entryCells(entry).forEach(({row, col}, index) => {
    const cell = miniCell(row, col);
    if (!cell || cell.value !== entry.answer[index]) { complete = false; cell?.classList.add('mini-wrong'); }
    else cell?.classList.remove('mini-wrong');
  }));
  const feedback = document.getElementById('mini-feedback');
  if (complete) { const streak = recordMiniSolved(); feedback.textContent = `Solved! Nice little crossword. You have a ${streak} day mini streak.`; } else feedback.textContent = 'Keep going—red squares need another look.';
  feedback.className = `mini-feedback${complete ? ' success' : ''}`;
  renderMiniHistory();
}

function showMiniHint(easier = false) {
  const entry = selectedEntry || miniPuzzle.entries[0];
  const hint = easier ? `Easier hint: the answer starts with “${entry.answer[0]}” and has ${entry.answer.length} letters. Follow the highlighted ${entry.dir.toLowerCase()} route.` : `Hint: start with the ${entry.dir.toLowerCase()} clue “${entry.clue}” and fill its ${entry.answer.length} squares.`;
  document.getElementById('mini-hint-text').textContent = hint;
  document.getElementById('mini-hint-text').hidden = false;
  document.getElementById('mini-easier-hint').hidden = !easier;
  highlightEntry(entry);
}

function newMiniPuzzle() {
  miniIndex = (miniIndex + 1) % MINI_PUZZLES.length;
  miniPuzzle = MINI_PUZZLES[miniIndex];
  miniPuzzle._laidOut = false;
  selectedEntry = null;
  renderMini();
}

function openMiniGame() {
  renderMini();
  document.getElementById('mini-modal').hidden = false;
  document.getElementById('game-selector').hidden = true;
}

document.getElementById('mini-crossword').addEventListener('click', openMiniGame);
document.querySelectorAll('[data-game-choice]').forEach(button => button.addEventListener('click', () => {
  if (button.dataset.gameChoice === 'mini') openMiniGame();
  else document.getElementById('game-selector').hidden = true;
}));
function showGameSelector() {
  document.getElementById('mini-modal').hidden = true;
  document.getElementById('game-selector').hidden = false;
}

document.getElementById('game-menu').addEventListener('click', showGameSelector);
document.getElementById('mini-game-menu').addEventListener('click', showGameSelector);
document.getElementById('mini-close').addEventListener('click', () => { document.getElementById('mini-modal').hidden = true; });
document.getElementById('mini-check').addEventListener('click', checkMini);
document.getElementById('mini-new').addEventListener('click', newMiniPuzzle);
document.getElementById('mini-daily').addEventListener('click', () => {
  miniIndex = miniDailyIndex();
  miniPuzzle = MINI_PUZZLES[miniIndex];
  miniPuzzle._laidOut = false;
  renderMini();
  document.getElementById('mini-feedback').textContent = `Today’s mini · ${miniStreak()} day streak`;
});
document.getElementById('mini-hint').addEventListener('click', () => showMiniHint(false));
document.getElementById('mini-easier-hint').addEventListener('click', () => showMiniHint(true));
document.getElementById('mini-history-button').addEventListener('click', () => {
  const panel = document.getElementById('mini-history-panel');
  renderMiniHistory();
  panel.hidden = !panel.hidden;
});

document.getElementById('mini-modal').addEventListener('click', event => { if (event.target.id === 'mini-modal') event.currentTarget.hidden = true; });

window.addEventListener('load', () => { document.getElementById('game-welcome').hidden = false; document.getElementById('game-selector').hidden = true; });
document.getElementById('game-welcome-continue').addEventListener('click', () => { document.getElementById('game-welcome').hidden = true; document.getElementById('game-selector').hidden = false; });
