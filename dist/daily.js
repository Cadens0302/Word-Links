'use strict';

// Daily state is intentionally device-local: no account or personal data is needed.
const DAILY_STORAGE_KEY = 'wordLinksDailyHistoryV1';
const EXTRA_BEST_STORAGE_KEY = 'wordLinksExtraBestV1';
const EXTRA_COMPLETED_STORAGE_KEY = 'wordLinksExtraCompletedV1';
const EXTRA_HISTORY_STORAGE_KEY = 'wordLinksExtraHistoryV1';
const PUZZLE_ASSIGNMENTS_STORAGE_KEY = 'wordLinksPuzzleAssignmentsV1';
const DAILY_LAYOUT_STORAGE_KEY = 'wordLinksDailyLayoutsV1';
const DAILY_PUZZLES = [
  ['LIGHT','SOUND','THE FIRST CONNECTION'],
  ['NIGHT','SHORE','AFTER HOURS'],
  ['RIVER','GARDEN','GREEN THINGS'],
  ['BRIDGE','STONE','CROSSING OVER'],
  ['MUSIC','DANCE','THE RHYTHM'],
  ['OCEAN','ISLAND','OPEN WATER'],
  ['PAPER','PENCIL','ON THE PAGE'],
  ['SIGHT','STONE','A DIFFERENT PERSPECTIVE'],
  ['CLOUD','WATER','WEATHER WATCH'],
  ['FOREST','TRAIL','OUT IN THE WOODS'],
  ['APPLE','BREAD','KITCHEN TABLE'],
  ['TRAIN','BRIDGE','A JOURNEY BEGINS']
];

function todayKey() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth()+1).padStart(2,'0')}-${String(now.getUTCDate()).padStart(2,'0')}`;
}

function readHistory() {
  try { return JSON.parse(localStorage.getItem(DAILY_STORAGE_KEY) || '[]'); }
  catch { return []; }
}

function writeHistory(history) {
  try { localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(history)); } catch {}
}

function readExtraBest() {
  try { return JSON.parse(localStorage.getItem(EXTRA_BEST_STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

function writeExtraBest(best) {
  try { localStorage.setItem(EXTRA_BEST_STORAGE_KEY, JSON.stringify(best)); } catch {}
}

function readExtraCompleted() {
  try { return JSON.parse(localStorage.getItem(EXTRA_COMPLETED_STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

function writeExtraCompleted(completed) {
  try { localStorage.setItem(EXTRA_COMPLETED_STORAGE_KEY, JSON.stringify(completed)); } catch {}
}

function readExtraHistory() {
  try { return JSON.parse(localStorage.getItem(EXTRA_HISTORY_STORAGE_KEY) || '[]'); }
  catch { return []; }
}

function writeExtraHistory(history) {
  try { localStorage.setItem(EXTRA_HISTORY_STORAGE_KEY, JSON.stringify(history)); } catch {}
}

function readPuzzleAssignments() {
  try { return JSON.parse(localStorage.getItem(PUZZLE_ASSIGNMENTS_STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

function writePuzzleAssignments(assignments) {
  try { localStorage.setItem(PUZZLE_ASSIGNMENTS_STORAGE_KEY, JSON.stringify(assignments)); } catch {}
}

function readDailyLayouts() {
  try { return JSON.parse(localStorage.getItem(DAILY_LAYOUT_STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

function writeDailyLayouts(layouts) {
  try { localStorage.setItem(DAILY_LAYOUT_STORAGE_KEY, JSON.stringify(layouts)); } catch {}
}

function dailyPuzzleFor(date) {
  let hash = 0;
  for (const char of date) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  const puzzle = DAILY_PUZZLES[hash % DAILY_PUZZLES.length];
  return puzzle[2] ? puzzle : [puzzle[0], puzzle[1], `DAILY CONNECTION ${date}`];
}

function streakFor(history, anchor = todayKey()) {
  const days = new Set(history.map(item => item.date));
  let cursor = new Date(`${anchor}T12:00:00`);
  if (!days.has(anchor)) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(cursor.toISOString().slice(0,10))) { streak++; cursor.setDate(cursor.getDate() - 1); }
  return streak;
}

function updateStreakLabels() {
  const history = readHistory();
  const streak = streakFor(history);
  document.getElementById('streak-count').textContent = `${streak} day${streak === 1 ? '' : 's'} streak`;
  document.getElementById('welcome-streak').textContent = `${streak} day${streak === 1 ? '' : 's'}`;
  document.getElementById('welcome-solved').textContent = history.length;
  const best = history.length ? Math.min(...history.map(item => item.score)) : null;
  document.getElementById('welcome-best').textContent = best === null ? '—' : best;
}

function startDaily() {
  window.DAILY_MODE = true;
  const date = todayKey();
  const assignments = readPuzzleAssignments();
  const assignmentKey = `daily-${date}`;
  if (!Number.isInteger(assignments[assignmentKey])) {
    const generated = dailyPuzzleFor(date);
    assignments[assignmentKey] = DAILY_PUZZLES.findIndex(puzzle => puzzle[0] === generated[0] && puzzle[1] === generated[1]);
    writePuzzleAssignments(assignments);
  }
  window.DAILY_PUZZLE = DAILY_PUZZLES[assignments[assignmentKey]] || dailyPuzzleFor(date);
  window.DAILY_SEED = `daily-${date}`;
  const layouts = readDailyLayouts();
  window.DAILY_LAYOUT = Array.isArray(layouts[date]) ? layouts[date] : null;
  window.EXTRA_LEVEL = null;
  window.EXTRA_PUZZLE = null;
  window.EXTRA_SEED = null;
  startGame();
  if (!layouts[date] && Array.isArray(window.STARTING_WORDS)) {
    layouts[date] = window.STARTING_WORDS;
    writeDailyLayouts(layouts);
  }
  updateStreakLabels();
}

function startExtraLevel(levelNumber) {
  const level = EXTRA_LEVELS[levelNumber - 1];
  if (!level) return;
  window.DAILY_MODE = false;
  window.DAILY_PUZZLE = null;
  window.EXTRA_LEVEL = levelNumber;
  window.DAILY_LAYOUT = null;
  const assignments = readPuzzleAssignments();
  const assignmentKey = `level-${levelNumber}`;
  if (!Number.isInteger(assignments[assignmentKey])) {
    assignments[assignmentKey] = (levelNumber * 7 + level.name.length) % level.puzzles.length;
    writePuzzleAssignments(assignments);
  }
  const puzzleIndex = assignments[assignmentKey] % level.puzzles.length;
  window.EXTRA_PUZZLE = [...level.puzzles[puzzleIndex], level.name];
  window.EXTRA_SEED = `level-${levelNumber}`;
  startGame();
  document.getElementById('levels-modal').hidden = true;
  document.getElementById('history-modal').hidden = true;
  document.getElementById('welcome-modal').hidden = true;
}

function renderLevels() {
  const target = document.getElementById('level-grid');
  const best = readExtraBest();
  const completed = readExtraCompleted();
  target.innerHTML = EXTRA_LEVELS.map((level, index) => {
    const number = index + 1;
    const score = best[number];
    const unlocked = number === 1 || Boolean(completed[number - 1]);
    const status = completed[number] ? '✓ Completed' : unlocked ? 'Not completed' : `🔒 Complete level ${number - 1} first`;
    return `<button class="level-card${completed[number] ? ' completed' : ''}${unlocked ? '' : ' locked'}" type="button" data-level="${number}"${unlocked ? '' : ' disabled'}><span class="level-number">${number}</span><span class="level-name">${level.name}</span><span class="level-status">${status}</span><span class="level-best">Best: ${score === undefined ? '—' : `${score} pts`}</span><span class="level-target">Target: ≤ ${level.target} pts</span></button>`;
  }).join('');
  target.querySelectorAll('[data-level]').forEach(button => {
    button.addEventListener('click', () => startExtraLevel(Number(button.dataset.level)));
  });
}

function recordCompletion(result) {
  if (!window.DAILY_MODE && window.EXTRA_LEVEL) {
    const best = readExtraBest();
    const completed = readExtraCompleted();
    const previous = best[window.EXTRA_LEVEL];
    const isBest = previous === undefined || result.score < previous;
    if (isBest) { best[window.EXTRA_LEVEL] = result.score; writeExtraBest(best); }
    completed[window.EXTRA_LEVEL] = true;
    writeExtraCompleted(completed);
    const levelHistory = readExtraHistory();
    levelHistory.push({date: todayKey(), level: window.EXTRA_LEVEL, score: result.score, words: result.words});
    writeExtraHistory(levelHistory);
    const level = EXTRA_LEVELS[window.EXTRA_LEVEL - 1];
    feedback(`Level ${window.EXTRA_LEVEL} complete! You scored ${result.score} points. ${isBest ? 'New personal best. ' : ''}Target: ${level.target} points.`, 'success');
    renderLevels();
    return;
  }
  if (!window.DAILY_MODE) return;
  const date = todayKey();
  const history = readHistory().filter(item => item.date !== date);
  history.push({date, score: result.score, words: result.words, puzzle: window.DAILY_PUZZLE[2]});
  history.sort((a,b) => a.date.localeCompare(b.date));
  writeHistory(history);
  const streak = streakFor(history, date);
  updateStreakLabels();
  feedback(`Good job finishing today’s daily puzzle! You now have a ${streak} day${streak === 1 ? '' : 's'} streak. Your score: ${result.score} points.`, 'success');
}

window.wordLinksCompleted = recordCompletion;

function renderHistory(section = 'all') {
  const target = document.getElementById('history-list');
  const daily = readHistory().map(item => ({...item, type:'daily'}));
  const levels = readExtraHistory().map(item => ({...item, type:'level'}));
  const history = (section === 'daily' ? daily : section === 'levels' ? levels : [...daily, ...levels]).sort((a,b) => b.date.localeCompare(a.date));
  document.querySelectorAll('[data-history-section]').forEach(button => button.classList.toggle('active', button.dataset.historySection === section));
  if (!history.length) { target.innerHTML = `<div class="history-empty">No ${section === 'daily' ? 'daily challenges' : section === 'levels' ? 'level puzzles' : 'puzzles'} solved yet.</div>`; return; }
  target.innerHTML = history.map(item => {
    const date = new Date(`${item.date}T12:00:00`).toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric',year:'numeric'});
    const label = item.type === 'daily' ? `Daily challenge · ${item.puzzle || `Challenge ${item.date}`}` : `Level ${item.level} · ${EXTRA_LEVELS[item.level - 1]?.name || 'Extra puzzle'}`;
    return `<div class="history-row"><div><div class="history-date">${date}</div><div class="history-meta">${label} · ${item.words?.length || 0} links</div></div><div class="history-score">${item.score} pts</div></div>`;
  }).join('');
}

function openWelcome() {
  updateStreakLabels();
  const solvedToday = readHistory().some(item => item.date === todayKey());
  document.getElementById('welcome-copy').textContent = solvedToday
    ? 'You’ve solved today’s challenge already. You can revisit it or keep your streak ready for tomorrow.'
    : 'A new daily puzzle is ready. Keep your run going with today’s connection.';
  document.getElementById('welcome-modal').hidden = false;
}

document.getElementById('extra-puzzles').addEventListener('click', () => { renderLevels(); document.getElementById('levels-modal').hidden = false; });
document.getElementById('history-button').addEventListener('click', () => { renderHistory('all'); document.getElementById('history-modal').hidden = false; });
document.querySelectorAll('[data-history-section]').forEach(button => button.addEventListener('click', () => renderHistory(button.dataset.historySection)));
document.getElementById('history-close').addEventListener('click', () => { document.getElementById('history-modal').hidden = true; });
document.getElementById('levels-close').addEventListener('click', () => { document.getElementById('levels-modal').hidden = true; });
document.getElementById('welcome-close').addEventListener('click', () => { document.getElementById('welcome-modal').hidden = true; });
document.getElementById('play-daily').addEventListener('click', () => { startDaily(); document.getElementById('welcome-modal').hidden = true; });
document.getElementById('welcome-modal').addEventListener('click', event => { if (event.target.id === 'welcome-modal') event.currentTarget.hidden = true; });
document.getElementById('history-modal').addEventListener('click', event => { if (event.target.id === 'history-modal') event.currentTarget.hidden = true; });
document.getElementById('levels-modal').addEventListener('click', event => { if (event.target.id === 'levels-modal') event.currentTarget.hidden = true; });

startDaily();
openWelcome();
