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
      {id:'3d',dir:'Down',row:0,col:3,answer:'TEN',clue:'The number after nine.'}
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
      {id:'3d',dir:'Down',row:0,col:3,answer:'NET',clue:'What remains after costs, sometimes.'}
    ]
  }
];

let miniIndex = 0;
let miniPuzzle = MINI_PUZZLES[0];
let miniCells = [];
let selectedEntry = null;

function miniCell(row, col) { return miniCells[row * MINI_SIZE + col]; }

function entryCells(entry) {
  return [...entry.answer].map((_, index) => ({
    row: entry.row + (entry.dir === 'Down' ? index : 0),
    col: entry.col + (entry.dir === 'Across' ? index : 0)
  }));
}

function renderMini() {
  const grid = document.getElementById('mini-grid');
  grid.innerHTML = '';
  miniCells = [];
  const starts = new Map();
  miniPuzzle.entries.forEach(entry => starts.set(`${entry.row},${entry.col}`, entry.id));
  const rows = Array.from({length: MINI_SIZE}, (_, r) => (miniPuzzle.rows[r] || '').padEnd(MINI_SIZE, '#').slice(0, MINI_SIZE));
  rows.forEach((row, r) => [...row].forEach((value, c) => {
    const cell = document.createElement(value === '#' ? 'span' : 'input');
    cell.className = value === '#' ? 'mini-block' : 'mini-cell';
    cell.dataset.row = r;
    cell.dataset.col = c;
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
    grid.append(cell);
  }));
  document.getElementById('mini-title').textContent = miniPuzzle.title;
  renderMiniClues();
}

function focusMiniCell(row, col, offset) {
  const start = row * MINI_SIZE + col;
  for (let index = start + offset; index >= 0 && index < 25; index += offset) {
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
  for (const direction of ['Across', 'Down']) {
    const list = document.getElementById(direction === 'Across' ? 'mini-across' : 'mini-down');
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
  feedback.textContent = complete ? 'Solved! Nice little crossword.' : 'Keep going—red squares need another look.';
  feedback.className = `mini-feedback${complete ? ' success' : ''}`;
}

function newMiniPuzzle() {
  miniIndex = (miniIndex + 1) % MINI_PUZZLES.length;
  miniPuzzle = MINI_PUZZLES[miniIndex];
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
document.getElementById('mini-modal').addEventListener('click', event => { if (event.target.id === 'mini-modal') event.currentTarget.hidden = true; });

window.addEventListener('load', () => { document.getElementById('game-selector').hidden = false; });
