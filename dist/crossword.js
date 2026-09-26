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

function miniSeed() { let hash = 2166136261; for (const char of `${miniPuzzle.title}-${miniDateKey()}-${miniIndex}`) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); } return hash >>> 0; }
function layoutMiniEntries() {
  let state = miniSeed();
  const random = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
  const entries = miniPuzzle.entries.map(entry => ({...entry}));
  const dirs = [{name:'Across',dr:0,dc:1},{name:'Down',dr:1,dc:0},{name:'Diagonal',dr:1,dc:1}];
  let solved = false;
  for (let restart=0; restart<160 && !solved; restart++) {
    const order=[...entries].sort((a,b)=>b.answer.length-a.answer.length);
    for(let i=order.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
    const occupancy=new Map();
    const cellsFor=(entry,row,col,dir)=>[...entry.answer].map((letter,i)=>({letter,row:row+dir.dr*i,col:col+dir.dc*i}));
    const first=order[0],firstDir=dirs[Math.floor(random()*dirs.length)];
    const maxRow=MINI_SIZE-1-(firstDir.dr?(first.answer.length-1):0);
    const maxCol=MINI_SIZE-1-(firstDir.dc?(first.answer.length-1):0);
    first.row=Math.floor(random()*(maxRow+1));first.col=Math.floor(random()*(maxCol+1));first.dir=firstDir.name;
    cellsFor(first,first.row,first.col,firstDir).forEach(cell=>occupancy.set(`${cell.row},${cell.col}`,cell.letter));
    const placeNext=index=>{
      if(index===order.length)return true;
      const entry=order[index], candidates=[];
      for(const placed of order.slice(0,index)){
        const oldDir=dirs.find(dir=>dir.name===placed.dir);
        const oldCells=cellsFor(placed,placed.row,placed.col,oldDir);
        for(const dir of dirs){
          if(dir.name===placed.dir)continue;
          for(const oldCell of oldCells){
            for(let letterIndex=0;letterIndex<entry.answer.length;letterIndex++){
              if(entry.answer[letterIndex]!==oldCell.letter)continue;
              const row=oldCell.row-dir.dr*letterIndex,col=oldCell.col-dir.dc*letterIndex;
              const cells=cellsFor(entry,row,col,dir);
              if(cells.some(cell=>cell.row<0||cell.row>=MINI_SIZE||cell.col<0||cell.col>=MINI_SIZE))continue;
              let crosses=0,valid=true;
              for(const cell of cells){const key=`${cell.row},${cell.col}`;if(occupancy.has(key)){if(occupancy.get(key)!==cell.letter){valid=false;break;}crosses++;}}
              if(valid&&crosses)candidates.push({row,col,dir,cells});
            }
          }
        }
      }
      for(let i=candidates.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[candidates[i],candidates[j]]=[candidates[j],candidates[i]];}
      const seen=new Set();
      for(const candidate of candidates){
        const signature=`${candidate.row},${candidate.col},${candidate.dir.name}`;
        if(seen.has(signature))continue;seen.add(signature);
        entry.row=candidate.row;entry.col=candidate.col;entry.dir=candidate.dir.name;
        const added=[];
        candidate.cells.forEach(cell=>{const key=`${cell.row},${cell.col}`;if(!occupancy.has(key)){occupancy.set(key,cell.letter);added.push(key);}});
        if(placeNext(index+1))return true;
        added.forEach(key=>occupancy.delete(key));
      }
      return false;
    };
    solved=placeNext(1);
  }
  if(!solved){
    throw new Error('Could not generate a crossword where every answer crosses another.');
  }
  const starts = new Map(); let number=0;
  entries.sort((a,b)=>a.row-b.row || a.col-b.col).forEach(entry=>{
    const key=`${entry.row},${entry.col}`;
    if (!starts.has(key)) starts.set(key,++number);
    const suffix=entry.dir==='Across'?'a':entry.dir==='Down'?'d':'x';
    entry.id=`${starts.get(key)}${suffix}`;
  });
  miniPuzzle.entries=entries;
}

function renderMini() {
  if (!miniPuzzle._laidOut) { layoutMiniEntries(); miniPuzzle._laidOut = true; }
  const grid = document.getElementById('mini-grid');
  grid.innerHTML = '';
  miniCells = [];
  const starts = new Map();
  const rows = Array.from({length:MINI_SIZE},()=>Array(MINI_SIZE).fill(' '));
  miniPuzzle.entries.forEach(entry=>{
    starts.set(`${entry.row},${entry.col}`,entry.id);
    entryCells(entry).forEach(({row,col},i)=>{ if(row>=0&&row<MINI_SIZE&&col>=0&&col<MINI_SIZE) rows[row][col]=entry.answer[i]; });
  });
  rows.forEach((row, r) => row.forEach((value, c) => {
    const square = document.createElement('div');
    square.className = 'mini-square';
    const cell = document.createElement(value === ' ' ? 'span' : 'input');
    cell.className = value === ' ' ? 'mini-empty' : 'mini-cell';
    cell.dataset.row = r;
    cell.dataset.col = c;
    const number = starts.get(`${r},${c}`);
    if (number) { const label = document.createElement('span'); label.className = 'mini-number'; label.textContent = number.replace(/[a-z]+$/i, ''); square.append(label); }
    if (value !== ' ') {
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
    list.innerHTML = miniPuzzle.entries.filter(entry => entry.dir === direction).map(entry => `<button class="mini-clue" type="button" data-entry="${entry.id}"><strong>${entry.id.replace(/[a-z]+$/i,'')}</strong> ${entry.clue}</button>`).join('');
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
  miniPuzzle = {...MINI_PUZZLES[miniIndex], entries:MINI_PUZZLES[miniIndex].entries.map(entry=>({...entry}))};
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
  miniPuzzle = {...MINI_PUZZLES[miniIndex], entries:MINI_PUZZLES[miniIndex].entries.map(entry=>({...entry}))};
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
