'use strict';

const MINI_SIZE = 12;

const MINI_WORDS = [
  ['CAT','A small pet that purrs.'], ['DOG','A pet that barks.'],
  ['SUN','The star that lights our days.'], ['MAP','A drawing that helps you find your way.'],
  ['HAT','Something you wear on your head.'], ['BED','Where you sleep at night.'],
  ['CUP','A small container for a drink.'], ['BEE','An insect that makes honey.'],
  ['KEY','It unlocks a door.'], ['OWL','A bird known for its nighttime hoot.'],
  ['TREE','A tall plant with a trunk.'], ['BOOK','Its pages tell a story.'],
  ['LAMP','A light you might put beside your bed.'], ['FISH','An animal with fins and gills.'],
  ['MOON','Earth’s natural companion in the night sky.'], ['RAIN','Water falling from clouds.'],
  ['BOAT','A small craft that floats on water.'], ['CAKE','A sweet treat with birthday candles.'],
  ['STAR','A distant light that twinkles at night.'], ['KITE','It flies on the end of a string.'],
  ['APPLE','A crunchy fruit that can be red or green.'], ['HOUSE','A building where people live.'],
  ['BEACH','A sandy place beside the sea.'], ['CLOUD','A fluffy shape floating in the sky.'],
  ['TRAIN','It carries passengers along tracks.'], ['BREAD','You use slices of it for a sandwich.'],
  ['CHAIR','A seat with a back and usually four legs.'], ['RIVER','Water flowing toward a lake or sea.'],
  ['MUSIC','Sounds arranged into a song.'], ['TIGER','A large cat with stripes.'],
  ['GARDEN','A place where people grow flowers.'], ['ORANGE','A citrus fruit with the same name as a color.'],
  ['BRIDGE','A structure that lets you cross a river.'], ['FLOWER','The colorful part of a plant that may smell sweet.'],
  ['RABBIT','A long-eared animal that hops.'], ['PENCIL','A writing tool with an eraser on one end.'],
  ['WINDOW','A glass opening that lets light into a room.'], ['FOREST','A large area covered with trees.'],
  ['TURTLE','A slow-moving animal with a shell.'], ['BASKET','A woven container with a handle.'],
  ['RAINBOW','A colorful arc that can appear after rain.'], ['BALLOON','An air-filled party decoration.'],
  ['BICYCLE','A two-wheeled vehicle powered by pedals.'], ['DOLPHIN','A playful sea mammal with a curved fin.'],
  ['KITCHEN','The room where meals are cooked.'], ['PENGUIN','A black-and-white bird that waddles and swims.'],
  ['GIRAFFE','An animal with a very long neck.'], ['LIBRARY','A place where you can borrow books.'],
  ['PANCAKE','A round breakfast food often served with syrup.'], ['FEATHER','A light covering on a bird.'],
  ['ELEPHANT','A very large animal with a trunk.'], ['UMBRELLA','You hold this above your head to stay dry.'],
  ['SANDWICH','A meal made with filling between slices of bread.'], ['MOUNTAIN','A very high natural rise in the land.'],
  ['NOTEBOOK','A book of blank pages for writing.'], ['FOOTBALL','A sport played with a ball and two teams.'],
  ['BACKPACK','A bag carried over both shoulders.'], ['SNOWFLAKE','A tiny ice crystal that falls in winter.'],
  ['BUTTERFLY','An insect with large, colorful wings.'], ['CHOCOLATE','A sweet treat made from cocoa.'],
  ['SUNFLOWER','A tall flower with a large yellow head.'], ['PINEAPPLE','A tropical fruit with spiky leaves on top.']
].map(([answer,clue]) => ({answer,clue}));

const MINI_PUZZLES = [
  {title:'A little word square',entries:[]},
  {title:'Sunny side up',entries:[]}
];
const MINI_LEVELS = [
  ['First steps','Easy',3,4],['Bright beginnings','Easy',3,4],['Little by little','Easy',3,5],['Word paths','Easy',3,5],['Crossing clues','Easy',4,5],
  ['A longer look','Medium',4,6],['Steady solver','Medium',4,6],['More to discover','Medium',5,6],['Clever crossings','Medium',5,7],['The word trail','Medium',5,7],
  ['Brain stretch','Hard',6,7],['Thoughtful links','Hard',6,8],['Expert eyes','Hard',7,8],['Deep crossword','Hard',7,9],['Master puzzle','Expert',8,9]
].map(([name,difficulty,minLength,maxLength])=>({name,difficulty,minLength,maxLength}));

function miniDateKey(date = new Date()) { return date.toISOString().slice(0, 10); }
function miniDailyIndex() { let hash = 0; for (const char of miniDateKey()) hash = (hash * 31 + char.charCodeAt(0)) >>> 0; return hash % MINI_PUZZLES.length; }
function miniHistory() { try { return JSON.parse(localStorage.getItem('wordLinksMiniHistory') || '[]'); } catch { return []; } }
function miniLevelProgress() { try { return JSON.parse(localStorage.getItem('wordLinksMiniLevelProgress') || '{}'); } catch { return {}; } }
function saveMiniLevelProgress(progress) { localStorage.setItem('wordLinksMiniLevelProgress', JSON.stringify(progress)); }
function miniStreak() { const solved = new Set(miniHistory().map(item => item.date)); let streak = 0; const date = new Date(); if (!solved.has(miniDateKey(date))) date.setUTCDate(date.getUTCDate() - 1); while (solved.has(miniDateKey(date))) { streak++; date.setUTCDate(date.getUTCDate() - 1); } return streak; }
function recordMiniSolved() { const date = miniDateKey(); const history = miniHistory(); if (!history.some(item => item.date === date)) { history.unshift({date, title: miniPuzzle.title}); localStorage.setItem('wordLinksMiniHistory', JSON.stringify(history.slice(0, 60))); } return miniStreak(); }
function renderMiniHistory() { const panel = document.getElementById('mini-history-panel'); const daily = miniHistory().map(item => ({...item, label:'Daily'})); const levels = (miniLevelProgress().history || []).map(item => ({...item, label:`Level ${item.level}`})); const history = [...daily,...levels].sort((a,b)=>b.date.localeCompare(a.date)); panel.innerHTML = history.length ? `<strong>Crossword history</strong><br>${history.slice(0, 10).map(item => `${item.date} · ${item.label} · ${item.title}`).join('<br>')}<br><strong>${miniStreak()} day daily streak</strong>` : 'No completed mini puzzles yet.'; }

let miniIndex = miniDailyIndex();
let miniPuzzle = MINI_PUZZLES[miniIndex];
let miniCells = [];
let selectedEntry = null;
let lastMiniClickedCell = null;
let miniMode = 'daily';
let miniLevel = null;
let miniRevealUsed = false;
let miniResumeState = null;
function miniSessionKey(mode = miniMode, level = miniLevel) { return mode === 'level' ? `wordLinksMiniSession:level:${level}` : `wordLinksMiniSession:daily:${miniDateKey()}`; }
function readMiniSession(mode, level, title) {
  try {
    const saved = JSON.parse(localStorage.getItem(miniSessionKey(mode, level)) || 'null');
    return saved?.title === title && Array.isArray(saved.entries) && Array.isArray(saved.answers) ? saved : null;
  } catch { return null; }
}
function saveMiniSession() {
  if (!miniPuzzle?.entries?.length) return;
  const answers = miniPuzzle.entries.flatMap(entry => entryCells(entry).map(({row, col}) => {
    const value = miniCell(row, col)?.value;
    return value ? {row, col, value} : null;
  }).filter(Boolean));
  try {
    localStorage.setItem(miniSessionKey(), JSON.stringify({title:miniPuzzle.title,entries:miniPuzzle.entries,answers,selectedEntryId:selectedEntry?.id||null,revealUsed:miniRevealUsed,feedback:document.getElementById('mini-feedback').textContent}));
  } catch {}
}
const miniRevealButton = document.createElement('button');
miniRevealButton.type = 'button';
miniRevealButton.className = 'secondary';
miniRevealButton.textContent = 'Reveal a word · 1 use';
miniRevealButton.style.cssText = 'width:100%;margin-top:4px;padding:9px 12px;border:1px solid #c9c0ae;border-radius:6px;background:rgba(255,254,250,.55);color:var(--ink);cursor:pointer;font-size:12px';
document.querySelector('.mini-hint-actions').append(miniRevealButton);

function resetMiniReveal() {
  miniRevealUsed = false;
  miniRevealButton.disabled = false;
  miniRevealButton.textContent = 'Reveal a word · 1 use';
}

miniRevealButton.addEventListener('click', () => {
  if (miniRevealUsed) return;
  const entry = selectedEntry || miniPuzzle.entries[0];
  if (!entry) return;
  entryCells(entry).forEach(({row, col}, index) => {
    const cell = miniCell(row, col);
    if (cell) { cell.value = entry.answer[index]; cell.classList.remove('mini-wrong'); }
  });
  miniRevealUsed = true;
  miniRevealButton.disabled = true;
  miniRevealButton.textContent = 'Word revealed · used';
  updateMiniProgress();
  updateMiniClueChecks();
  saveMiniSession();
});

function miniCell(row, col) { return miniCells[row * MINI_SIZE + col]; }

function entryCells(entry) {
  return [...entry.answer].map((_, index) => ({
    row: entry.row + (entry.dir === 'Down' ? index : 0),
    col: entry.col + (entry.dir === 'Across' ? index : 0)
  }));
}

function miniSeed() { let hash = 2166136261; const seedDate = miniMode === 'level' ? `level-${miniLevel}` : miniDateKey(); for (const char of `${miniPuzzle.title}-${seedDate}-${miniIndex}`) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); } return hash >>> 0; }
function layoutMiniEntries() {
  let state = miniSeed();
  const random = () => { state = (Math.imul(state,1664525)+1013904223) >>> 0; return state/4294967296; };
  const dirs = [{name:'Across',dr:0,dc:1},{name:'Down',dr:1,dc:0}];
  const wordPool = miniMode === 'level' ? MINI_WORDS.filter(word => word.answer.length >= MINI_LEVELS[miniLevel-1].minLength && word.answer.length <= MINI_LEVELS[miniLevel-1].maxLength) : miniMode === 'daily' ? MINI_WORDS.filter(word => word.answer.length <= 6) : MINI_WORDS;
  const targetCount = miniMode === 'daily' ? 8 : 9;
  const varietyTarget = miniMode === 'daily' ? 4 : 5;
  const key = (row,col) => `${row},${col}`;
  const cellsFor = (word,row,col,dir) => [...word.answer].map((letter,i) => ({letter,row:row+dir.dr*i,col:col+dir.dc*i}));
  const boundsArea = cells => {
    const rows=cells.map(cell=>cell.row),cols=cells.map(cell=>cell.col);
    return (Math.max(...rows)-Math.min(...rows)+1)*(Math.max(...cols)-Math.min(...cols)+1);
  };
  let best=[],bestScore=-Infinity;
  // Bounded attempts keep generation quick; every addition joins the existing network.
  for(let attempt=0;attempt<24;attempt++) {
    const placed=[],occupied=new Map(),used=new Set();
    const add=(word,row,col,dir,cells)=>{
      placed.push({...word,row,col,dir:dir.name}); used.add(word.answer);
      cells.forEach(cell=>occupied.set(key(cell.row,cell.col),cell));
    };
    const starterLength = miniMode === 'daily' ? 4 : miniMode === 'level' ? MINI_LEVELS[miniLevel-1].minLength : 6;
    const starters=wordPool.filter(word=>word.answer.length>=starterLength);
    const first=starters[Math.floor(random()*starters.length)],dir=dirs[Math.floor(random()*dirs.length)];
    const row=Math.floor((MINI_SIZE-dir.dr*(first.answer.length-1))/2);
    const col=Math.floor((MINI_SIZE-dir.dc*(first.answer.length-1))/2);
    add(first,row,col,dir,cellsFor(first,row,col,dir));
    while(placed.length<targetCount) {
      const candidates=[],seen=new Set(),oldCells=[...occupied.values()];
      const lengths=new Set(placed.map(word=>word.answer.length));
      for(const word of wordPool) {
        if(used.has(word.answer))continue;
        for(const dir of dirs) for(const cross of oldCells) {
          for(let i=0;i<word.answer.length;i++) {
            if(word.answer[i]!==cross.letter)continue;
            const row=cross.row-dir.dr*i,col=cross.col-dir.dc*i;
            const signature=`${word.answer}:${row},${col}:${dir.name}`;
            if(seen.has(signature))continue; seen.add(signature);
            const cells=cellsFor(word,row,col,dir);
            if(cells.some(cell=>cell.row<0||cell.row>=MINI_SIZE||cell.col<0||cell.col>=MINI_SIZE))continue;
            // One matching crossing prevents overlaps, duplicated routes, and crowded hubs.
            const overlaps=cells.filter(cell=>occupied.has(key(cell.row,cell.col)));
            if(overlaps.length!==1 || occupied.get(key(overlaps[0].row,overlaps[0].col)).letter!==overlaps[0].letter)continue;
            if(placed.some(entry=>entry.dir===dir.name && entryCells(entry).some(cell=>cell.row===cross.row&&cell.col===cross.col)))continue;
            if(occupied.has(key(row-dir.dr,col-dir.dc)) || occupied.has(key(row+dir.dr*word.answer.length,col+dir.dc*word.answer.length)))continue;
            // Keep a black-cell gap between unrelated branches, allowing the crossing itself.
            let crowded=false;
            for(const cell of cells) {
              if(Math.max(Math.abs(cell.row-cross.row),Math.abs(cell.col-cross.col))<=1)continue;
              for(const [dr,dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
                if(occupied.has(key(cell.row+dr,cell.col+dc)))crowded=true;
              }
            }
            if(crowded)continue;
            const area=boundsArea([...oldCells,...cells]);
            const lengthBonus=lengths.has(word.answer.length)?0:24;
            const directionBonus=placed.some(entry=>entry.dir===dir.name)?0:18;
            const score=area+lengthBonus+directionBonus+random()*22;
            candidates.push({word,row,col,dir,cells,score});
          }
        }
      }
      if(!candidates.length)break;
      candidates.sort((a,b)=>b.score-a.score);
      const pick=candidates[0];
      add(pick.word,pick.row,pick.col,pick.dir,pick.cells);
    }
    const score=placed.length*1000+new Set(placed.map(entry=>entry.answer.length)).size*30+boundsArea([...occupied.values()]);
    if(score>bestScore){best=placed;bestScore=score;}
    if(best.length===targetCount && new Set(best.map(entry=>entry.answer.length)).size>=varietyTarget)break;
  }
  if(best.length<targetCount)throw new Error('Could not generate a connected crossword.');
  const starts=new Map(); let number=0;
  best.sort((a,b)=>a.row-b.row||a.col-b.col).forEach(entry=>{
    const start=key(entry.row,entry.col);
    if(!starts.has(start))starts.set(start,++number);
    entry.id=`${starts.get(start)}${entry.dir==='Across'?'a':'d'}`;
  });
  miniPuzzle.entries=best;
}

function renderMini() {
  resetMiniReveal();
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
    cell.className = value === ' ' ? 'mini-block' : 'mini-cell';
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
        if (cell.value) focusMiniEntryCell(r, c, 1);
        updateMiniProgress();
        updateMiniClueChecks();
        saveMiniSession();
      });
      cell.addEventListener('keydown', event => {
        if (event.key === 'Backspace' && !cell.value) focusMiniEntryCell(r, c, -1);
        if (event.key === 'ArrowRight') { event.preventDefault(); focusMiniCell(r, c, 1); }
        if (event.key === 'ArrowLeft') { event.preventDefault(); focusMiniCell(r, c, -1); }
        if (event.key === 'ArrowDown') { event.preventDefault(); focusMiniCell(r, c, MINI_SIZE); }
        if (event.key === 'ArrowUp') { event.preventDefault(); focusMiniCell(r, c, -MINI_SIZE); }
      });
      cell.addEventListener('focus', () => highlightEntryAt(r, c));
      cell.addEventListener('click', () => {
        const key = r + ',' + c;
        const entries = miniPuzzle.entries.filter(entry => entryCells(entry).some(point => point.row === r && point.col === c));
        if (key === lastMiniClickedCell && entries.length > 1) {
          const current = Math.max(0, entries.indexOf(selectedEntry));
          highlightEntry(entries[(current + 1) % entries.length]);
        }
        lastMiniClickedCell = key;
        saveMiniSession();
      });
      miniCells.push(cell);
    } else miniCells.push(null);
    square.append(cell);
    grid.append(square);
  }));
  document.getElementById('mini-title').textContent = miniPuzzle.title;
  renderMiniClues();
  if (miniResumeState) {
    miniResumeState.answers.forEach(({row, col, value}) => { const cell = miniCell(row, col); if (cell) cell.value = value; });
    miniRevealUsed = Boolean(miniResumeState.revealUsed);
    miniRevealButton.disabled = miniRevealUsed;
    miniRevealButton.textContent = miniRevealUsed ? 'Word revealed · used' : 'Reveal a word · 1 use';
    selectedEntry = miniPuzzle.entries.find(entry => entry.id === miniResumeState.selectedEntryId) || null;
    if (selectedEntry) highlightEntry(selectedEntry);
    if (miniResumeState.feedback) document.getElementById('mini-feedback').textContent = miniResumeState.feedback;
    miniResumeState = null;
  }
  updateMiniProgress();
  updateMiniClueChecks();
  saveMiniSession();
}

function updateMiniProgress() {
  const cells = new Set(miniPuzzle.entries.flatMap(entry => entryCells(entry).map(cell => String(cell.row) + ',' + cell.col)));
  const filled = [...cells].filter(key => {
    const parts = key.split(',').map(Number);
    return Boolean(miniCell(parts[0],parts[1])?.value);
  }).length;
  const percent = cells.size ? Math.round(filled / cells.size * 100) : 0;
  document.getElementById('mini-progress-count').textContent = filled + ' of ' + cells.size;
  document.getElementById('mini-progress-bar').style.width = percent + '%';
  document.querySelector('.mini-progress-track').setAttribute('aria-valuenow', percent);
}

function focusMiniEntryCell(row, col, offset) {
  if (selectedEntry) {
    const cells = entryCells(selectedEntry);
    const index = cells.findIndex(cell => cell.row === row && cell.col === col);
    const next = cells[index + offset];
    if (next) { miniCell(next.row,next.col)?.focus(); return; }
  }
  focusMiniCell(row,col,offset);
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
  const candidates = miniPuzzle.entries.filter(candidate => entryCells(candidate).some(cell => cell.row === row && cell.col === col));
  const entry = candidates.includes(selectedEntry) ? selectedEntry : candidates[0];
  if (entry) highlightEntry(entry);
}

function renderMiniClues() {
  for (const direction of ['Across', 'Down']) {
    const list = document.getElementById(direction === 'Across' ? 'mini-across' : 'mini-down');
    list.innerHTML = miniPuzzle.entries.filter(entry => entry.dir === direction).map(entry => `<div class="mini-clue-row" style="grid-template-columns:minmax(0,1fr) 32px 20px"><button class="mini-clue" type="button" data-entry="${entry.id}"><strong>${entry.id.replace(/[a-z]+$/i,'')}</strong> ${entry.clue} <span class="mini-length">(${entry.answer.length})</span></button><button class="mini-clue-toggle" type="button" aria-label="Show a better hint for clue ${entry.id.replace(/[a-z]+$/i,'')}" aria-expanded="false">▸</button><span class="mini-clue-check" style="display:none;place-items:center;width:20px;height:30px;color:#5c7837;font-size:17px;font-weight:bold" data-entry-check="${entry.id}" role="img" aria-label="Completed">✓</span><span class="mini-better-hint" hidden>It starts with ${entry.answer[0]} and has ${entry.answer.length} letters.</span></div>`).join('');
    list.querySelectorAll('.mini-clue').forEach(button => button.addEventListener('click', () => {
      const entry = miniPuzzle.entries.find(item => item.id === button.dataset.entry);
      highlightEntry(entry);
      miniCell(entry.row, entry.col)?.focus();
      saveMiniSession();
    }));
    list.querySelectorAll('.mini-clue-toggle').forEach(button => button.addEventListener('click', () => {
      const row = button.closest('.mini-clue-row');
      const hint = row.querySelector('.mini-better-hint');
      const expanded = button.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.mini-clue-toggle[aria-expanded="true"]').forEach(openButton => {
        if (openButton === button) return;
        openButton.setAttribute('aria-expanded', 'false');
        openButton.textContent = '▸';
        openButton.closest('.mini-clue-row').querySelector('.mini-better-hint').hidden = true;
      });
      button.setAttribute('aria-expanded', String(!expanded));
      button.textContent = expanded ? '▸' : '▾';
      hint.hidden = expanded;
    }));
  }
  document.getElementById('mini-daily-date').textContent = `Shared puzzle · ${miniDateKey()}`;
  updateMiniClueChecks();
}

function updateMiniClueChecks() {
  miniPuzzle.entries.forEach(entry => {
    const complete = entryCells(entry).every(({row, col}, index) => miniCell(row, col)?.value === entry.answer[index]);
    const check = document.querySelector(`[data-entry-check="${entry.id}"]`);
    if (check) check.style.display = complete ? 'grid' : 'none';
  });
}

function checkMini() {
  let complete = true;
  miniPuzzle.entries.forEach(entry => entryCells(entry).forEach(({row, col}, index) => {
    const cell = miniCell(row, col);
    if (!cell || cell.value !== entry.answer[index]) { complete = false; cell?.classList.add('mini-wrong'); }
    else cell?.classList.remove('mini-wrong');
  }));
  const feedback = document.getElementById('mini-feedback');
  if (complete && miniMode === 'level') { const progress=miniLevelProgress(); progress.completed=progress.completed||{}; progress.best=progress.best||{}; progress.history=progress.history||[]; progress.completed[miniLevel]=true; progress.best[miniLevel]=Math.min(progress.best[miniLevel]??Infinity,filledMiniCells()); progress.history.push({date:miniDateKey(),level:miniLevel,title:miniPuzzle.title}); saveMiniLevelProgress(progress); feedback.textContent=`Congratulations! Level ${miniLevel} complete. ${miniLevel<MINI_LEVELS.length?'The next level is unlocked.':'You completed every crossword level!'} Your daily mini streak is ${miniStreak()} day${miniStreak()===1?'':'s'}.`; renderMiniLevels(); } else if (complete) { const streak = recordMiniSolved(); feedback.textContent = `Congratulations! You solved today’s crossword. Your daily streak is ${streak} day${streak===1?'':'s'}.`; } else feedback.textContent = 'Keep going—red squares need another look.';
  feedback.className = `mini-feedback${complete ? ' success' : ''}`;
  renderMiniHistory();
  saveMiniSession();
}

function showMiniHint(easier = false) {
  const entry = selectedEntry || miniPuzzle.entries[0];
  const hint = easier ? `Easier hint: the answer starts with “${entry.answer[0]}” and has ${entry.answer.length} letters. Follow the highlighted ${entry.dir.toLowerCase()} route.` : `Hint: start with the ${entry.dir.toLowerCase()} clue “${entry.clue}” and fill its ${entry.answer.length} squares.`;
  document.getElementById('mini-hint-text').textContent = hint;
  document.getElementById('mini-hint-text').hidden = false;
  document.getElementById('mini-easier-hint').hidden = !easier;
  highlightEntry(entry);
}

function filledMiniCells() {
  return [...new Set(miniPuzzle.entries.flatMap(entry=>entryCells(entry).map(cell=>`${cell.row},${cell.col}`)))].filter(key=>{
    const [row,col]=key.split(',').map(Number); return Boolean(miniCell(row,col)?.value);
  }).length;
}

function renderMiniLevels() {
  const target=document.getElementById('mini-level-grid'), progress=miniLevelProgress();
  target.innerHTML=MINI_LEVELS.map((level,index)=>{
    const number=index+1, unlocked=number===1||Boolean(progress.completed?.[number-1]), completed=Boolean(progress.completed?.[number]);
    const status=completed?'✓ Completed':unlocked?'Ready to play':`🔒 Complete level ${number-1} first`;
    const lengths=level.minLength===level.maxLength?`${level.minLength} letters`:`${level.minLength}–${level.maxLength} letters`;
    return `<button class="level-card${completed?' completed':''}${unlocked?'':' locked'}" type="button" data-mini-level="${number}"${unlocked?'':' disabled'}><span class="level-number">${number}</span><span class="level-name">${level.name}</span><span class="level-difficulty">${level.difficulty}</span><span class="level-status">${status}</span><span class="level-best">${lengths} · 9 words</span></button>`;
  }).join('');
  target.querySelectorAll('[data-mini-level]:not([disabled])').forEach(button=>button.addEventListener('click',()=>startMiniLevel(Number(button.dataset.miniLevel))));
}

function startMiniLevel(number) {
  const level=MINI_LEVELS[number-1], progress=miniLevelProgress();
  if(!level || (number>1&&!progress.completed?.[number-1]))return;
  miniMode='level'; miniLevel=number; miniIndex=0;
  const title=`Level ${number} · ${level.name}`;
  miniResumeState=readMiniSession('level',number,title);
  miniPuzzle={title,entries:miniResumeState?miniResumeState.entries:[],_laidOut:Boolean(miniResumeState)}; selectedEntry=null;
  document.getElementById('mini-levels-modal').hidden=true;
  document.getElementById('mini-feedback').textContent=`Level ${number} · ${level.difficulty} · ${level.minLength}–${level.maxLength} letters`;
  renderMini();
}

function showMiniLevels() {
  renderMiniLevels();
  document.getElementById('mini-levels-modal').hidden=false;
  document.getElementById('mini-welcome').hidden=true;
}

function startMiniDaily() {
  miniMode='daily'; miniLevel=null; miniIndex=miniDailyIndex();
  const puzzle=MINI_PUZZLES[miniIndex];
  miniResumeState=readMiniSession('daily',null,puzzle.title);
  miniPuzzle={...puzzle,entries:miniResumeState?miniResumeState.entries:puzzle.entries.map(entry=>({...entry}))};
  miniPuzzle._laidOut=Boolean(miniResumeState); selectedEntry=null;
  document.getElementById('mini-levels-modal').hidden=true;
  document.getElementById('mini-welcome').hidden=true;
  const resumed=Boolean(miniResumeState);
  renderMini();
  if(!resumed) document.getElementById('mini-feedback').textContent=`Daily challenge · ${miniStreak()} day streak`;
  saveMiniSession();
}


function openMiniGame() {
  miniMode='daily'; miniLevel=null; miniIndex=miniDailyIndex();
  const puzzle=MINI_PUZZLES[miniIndex];
  miniResumeState=readMiniSession('daily',null,puzzle.title);
  miniPuzzle={...puzzle,entries:miniResumeState?miniResumeState.entries:[],_laidOut:Boolean(miniResumeState)};
  renderMini();
  const streak = miniStreak();
  document.getElementById('mini-welcome-streak').textContent = `Your daily crossword streak is ${streak} day${streak === 1 ? '' : 's'}.`;
  document.getElementById('mini-modal').hidden = false;
  document.getElementById('mini-welcome').hidden = false;
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
document.getElementById('mini-daily').addEventListener('click', startMiniDaily);
document.getElementById('mini-levels-open').addEventListener('click', showMiniLevels);
document.getElementById('mini-levels-close').addEventListener('click',()=>{document.getElementById('mini-levels-modal').hidden=true;});
document.getElementById('mini-levels-modal').addEventListener('click',event=>{if(event.target.id==='mini-levels-modal')event.currentTarget.hidden=true;});
document.getElementById('mini-welcome-start').addEventListener('click',startMiniDaily);
document.getElementById('mini-welcome-levels').addEventListener('click',showMiniLevels);
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
