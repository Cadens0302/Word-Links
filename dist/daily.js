'use strict';

// Daily state is intentionally device-local: no account or personal data is needed.
const DAILY_STORAGE_KEY = 'wordLinksDailyHistoryV1';
const EXTRA_BEST_STORAGE_KEY = 'wordLinksExtraBestV2';
const EXTRA_COMPLETED_STORAGE_KEY = 'wordLinksExtraCompletedV1';
const EXTRA_HISTORY_STORAGE_KEY = 'wordLinksExtraHistoryV1';
const PUZZLE_ASSIGNMENTS_STORAGE_KEY = 'wordLinksPuzzleAssignmentsV1';
const DAILY_LAYOUT_STORAGE_KEY = 'wordLinksDailyLayoutsV6';
const DAILY_STARTER_WORDS = Object.keys(WORD_CLUES)
  .filter(word => WORDS.has(word) && word.length >= 3 && word.length <= 9)
  .sort();

function todayKey() { return puzzleDateKey(); }

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

function updateNextExtraPuzzleButton() {
  const button = document.getElementById('next-extra-puzzle');
  if (!button) return;
  const level = Number(window.EXTRA_LEVEL);
  const isExtraLevel = window.DAILY_MODE !== true && Number.isInteger(level) && level >= 1 && level <= EXTRA_LEVELS.length && Array.isArray(window.EXTRA_PUZZLE);
  button.hidden = !isExtraLevel;
  if (!isExtraLevel) return;
  const completed = Boolean(readExtraCompleted()[level]);
  const isFinalLevel = level >= EXTRA_LEVELS.length;
  button.textContent = isFinalLevel && completed ? 'All extra puzzles complete' : 'Move on to next puzzle';
  const canMoveOn = completed && !isFinalLevel;
  button.classList.toggle('is-locked', !canMoveOn);
  button.setAttribute('aria-disabled', String(!canMoveOn));
  button.title = completed
    ? isFinalLevel ? 'You completed every extra puzzle.' : `Open Level ${level + 1}`
    : 'Complete this level to unlock the next puzzle.';
}

function setExtraLevelsOpen(open) {
  const modal = document.getElementById('levels-modal');
  modal.hidden = !open;
  document.body.classList.toggle('extra-levels-open', open);
  if (open) document.getElementById('level-grid')?.querySelector('[data-level]')?.focus({preventScroll:true});
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

function dailyPuzzleWordsFor(date, avoid = []) {
  const ageGroup = window.currentWordAgeGroup();
  let hash = 0;
  for (const char of `${date}:${ageGroup.id}`) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  let state = (Math.imul(hash ^ 0x9e3779b9, 1664525) + 1013904223) >>> 0;
  const random = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
  const profile = window.wordLinksAgeChallenge?.() || {minLength:3,maxLength:9};
  let ageWords = DAILY_STARTER_WORDS.filter(word => word.length >= profile.minLength && word.length <= profile.maxLength);
  if (ageWords.length < 2) ageWords = DAILY_STARTER_WORDS.filter(word => word.length >= 3 && word.length <= 9);
  const familiarWords = ageWords.filter(word => window.isAgePreferredDailyWord?.(word));
  const words = familiarWords.length >= 2 ? familiarWords : ageWords;
  for (let i = words.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [words[i], words[j]] = [words[j], words[i]];
  }
  // Avoid both of yesterday's starters, so every fresh daily board has a new pair.
  const fresh = words.filter(word => !avoid.includes(word));
  return fresh.length >= 2 ? fresh.slice(0, 2) : words.slice(0, 2);
}

function dailyPuzzleFor(date) {
  const yesterday = dailyPuzzleWordsFor(previousPuzzleDate(date));
  const [first, second] = dailyPuzzleWordsFor(date, yesterday);
  return [first, second, `Daily Connection · ${window.currentWordAgeGroup().label} · ${dailyDateLabel(date)}`];
}

function dailyDateLabel(date) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'short', month: 'long', day: 'numeric', year: 'numeric'
  });
}

function streakFor(history, anchor = todayKey()) {
  const ageGroup = window.currentWordAgeGroup().id;
  const days = new Set(history.filter(item => (item.ageGroup || '18+') === ageGroup).map(item => item.date));
  let cursor = days.has(anchor) ? anchor : previousPuzzleDate(anchor);
  let streak = 0;
  while (days.has(cursor)) { streak++; cursor = previousPuzzleDate(cursor); }
  return streak;
}

function updateStreakLabels() {
  const history = readHistory();
  const ageHistory = history.filter(item => (item.ageGroup || '18+') === window.currentWordAgeGroup().id);
  const streak = streakFor(ageHistory);
  document.getElementById('streak-count').textContent = `${streak} day${streak === 1 ? '' : 's'} streak`;
  document.getElementById('welcome-streak').textContent = `${streak} day${streak === 1 ? '' : 's'}`;
  document.getElementById('welcome-solved').textContent = ageHistory.length;
  const best = ageHistory.length ? Math.min(...ageHistory.map(item => item.score)) : null;
  document.getElementById('welcome-best').textContent = best === null ? '—' : best;
}
window.getWordLinksStreakMessage = function() {
  updateStreakLabels();
  return `Your Word Links daily streak is ${document.getElementById('welcome-streak').textContent}.`;
};

function startDaily() {
  window.CUSTOM_PUZZLE = null;
  window.DAILY_MODE = true;
  const date = todayKey();
  window.DAILY_PUZZLE = dailyPuzzleFor(date);
  window.DAILY_SEED = `daily-v6-${window.currentWordAgeGroup().id}-${date}`;
  const layouts = readDailyLayouts();
  const layoutKey = `v8:${date}:${window.currentWordAgeGroup().id}`;
  window.DAILY_LAYOUT = Array.isArray(layouts[layoutKey]) ? layouts[layoutKey] : null;
  window.EXTRA_LEVEL = null;
  window.EXTRA_PUZZLE = null;
  window.EXTRA_SEED = null;
  startGame();
  updateNextExtraPuzzleButton();
  if (!layouts[layoutKey] && Array.isArray(window.STARTING_WORDS)) {
    layouts[layoutKey] = window.STARTING_WORDS;
    writeDailyLayouts(layouts);
  }
  updateStreakLabels();
  animateGameEntrance('links');
}

function levelWordsForAge(levelNumber, level, fallbackIndex) {
  const profile = window.wordLinksAgeChallenge?.() || {minLength:3,maxLength:15};
  const eligiblePairs = level.puzzles.filter(pair => pair.every(word => word.length >= profile.minLength && word.length <= profile.maxLength));
  let seed = 2166136261;
  for (const char of `${levelNumber}:${window.currentWordAgeGroup().id}`) { seed ^= char.charCodeAt(0); seed = Math.imul(seed, 16777619); }
  if (eligiblePairs.length) return [...eligiblePairs[(seed >>> 0) % eligiblePairs.length]];
  let pool = DAILY_STARTER_WORDS.filter(word => word.length >= profile.minLength && word.length <= profile.maxLength);
  const familiar = pool.filter(word => window.isAgePreferredDailyWord?.(word));
  if (familiar.length >= 2) pool = familiar;
  if (pool.length < 2) pool = DAILY_STARTER_WORDS.filter(word => word.length >= 3 && word.length <= 9);
  if (!pool.length) return [...level.puzzles[fallbackIndex % level.puzzles.length]];
  const firstIndex = (seed >>> 0) % pool.length;
  let secondIndex = (Math.imul(seed >>> 0, 1664525) + 1013904223) >>> 0;
  secondIndex %= pool.length - 1;
  if (secondIndex >= firstIndex) secondIndex++;
  return [pool[firstIndex], pool[secondIndex]];
}

function startExtraLevel(levelNumber) {
  const level = EXTRA_LEVELS[levelNumber - 1];
  if (!level) return;
  window.CUSTOM_PUZZLE = null;
  window.DAILY_MODE = false;
  window.DAILY_PUZZLE = null;
  window.EXTRA_LEVEL = levelNumber;
  window.DAILY_LAYOUT = null;
  const assignments = readPuzzleAssignments();
  const assignmentKey = `level-v2-${levelNumber}`;
  if (!Number.isInteger(assignments[assignmentKey])) {
    const oldKey = `level-${levelNumber}`;
    const previous = Number.isInteger(assignments[oldKey]) ? assignments[oldKey] : (levelNumber * 7 + level.name.length) % level.puzzles.length;
    assignments[assignmentKey] = (previous + 1) % level.puzzles.length;
    writePuzzleAssignments(assignments);
  }
  const puzzleIndex = assignments[assignmentKey] % level.puzzles.length;
  window.EXTRA_PUZZLE = [...levelWordsForAge(levelNumber, level, puzzleIndex), level.name];
  window.EXTRA_SEED = `level-v3-${levelNumber}-${window.currentWordAgeGroup().id}`;
  startGame();
  updateNextExtraPuzzleButton();
  setExtraLevelsOpen(false);
  document.getElementById('history-modal').hidden = true;
  document.getElementById('welcome-modal').hidden = true;
  animateGameEntrance('links');
}

function renderLevels() {
  const target = document.getElementById('level-grid');
  const note = document.querySelector('#levels-modal .level-note');
  if (note) note.textContent = 'Recommended scores match the 1-point-per-letter system. Lower scores are better.';
  const best = readExtraBest();
  const completed = readExtraCompleted();
  target.innerHTML = EXTRA_LEVELS.map((level, index) => {
    const number = index + 1;
    const score = best[number];
    const unlocked = number === 1 || Boolean(completed[number - 1]);
    const status = completed[number] ? '✓ Completed' : unlocked ? 'Not completed' : `🔒 Complete level ${number - 1} first`;
    return `<button class="level-card${completed[number] ? ' completed' : ''}${unlocked ? '' : ' locked'}" type="button" data-level="${number}"${unlocked ? '' : ' disabled'}><span class="level-number">${number}</span><span class="level-name">${level.name}</span><span class="level-difficulty">${level.difficulty}</span><span class="level-status">${status}</span><span class="level-best">Best: ${score === undefined ? '—' : `${score} pts`}</span><span class="level-target">Recommended: ≤ ${level.target} pts</span></button>`;
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
    const streak=streakFor(readHistory());
    feedback(`Congratulations! Level ${window.EXTRA_LEVEL} complete. You scored ${result.score} points. ${isBest ? 'New personal best. ' : ''}Recommended score: ${level.target} points. Your daily streak is ${streak} day${streak===1?'':'s'}.`, 'success');
    renderLevels();
    updateNextExtraPuzzleButton();
    return;
  }
  if (!window.DAILY_MODE) return;
  const date = todayKey();
  const ageGroup = window.currentWordAgeGroup().id;
  const history = readHistory().filter(item => item.date !== date || (item.ageGroup || '18+') !== ageGroup);
  history.push({date, ageGroup, gameType:'Word Links', challengeName:window.DAILY_PUZZLE[2], score: result.score, words: result.words, puzzle: window.DAILY_PUZZLE[2]});
  history.sort((a,b) => a.date.localeCompare(b.date));
  writeHistory(history);
  const streak = streakFor(history, date);
  updateStreakLabels();
  feedback(`Congratulations! You finished today’s daily puzzle. Your streak is ${streak} day${streak === 1 ? '' : 's'}. Your score: ${result.score} points.`, 'success');
}

window.wordLinksCompleted = recordCompletion;
document.getElementById('next-extra-puzzle')?.addEventListener('click', () => {
  const level = Number(window.EXTRA_LEVEL);
  if (!level) return;
  if (!readExtraCompleted()[level]) {
    feedback('Finish this level to continue to the next level.', 'error');
    return;
  }
  if (level >= EXTRA_LEVELS.length) {
    feedback('You have completed every extra puzzle.', 'success');
    return;
  }
  startExtraLevel(level + 1);
});

function renderHistory(section = 'all') {
  const target = document.getElementById('history-list');
  const daily = readHistory().map(item => ({...item, type:'daily'}));
  const levels = readExtraHistory().map(item => ({...item, type:'level'}));
  const history = (section === 'daily' ? daily : section === 'levels' ? levels : [...daily, ...levels]).sort((a,b) => b.date.localeCompare(a.date));
  document.querySelectorAll('[data-history-section]').forEach(button => button.classList.toggle('active', button.dataset.historySection === section));
  if (!history.length) { target.innerHTML = `<div class="history-empty">No ${section === 'daily' ? 'daily challenges' : section === 'levels' ? 'level puzzles' : 'puzzles'} solved yet.</div>`; return; }
  target.innerHTML = history.map(item => {
    const date = new Date(`${item.date}T12:00:00`).toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric',year:'numeric'});
    const age = item.ageGroup ? ` · ${window.WORD_AGE_GROUPS.find(group => group.id === item.ageGroup)?.label || item.ageGroup}` : '';
    const label = item.type === 'daily' ? `<strong>Daily challenge</strong> · ${item.gameType || 'Word Links'} · ${item.challengeName || item.puzzle || `Challenge ${item.date}`}${age}` : `<strong>Level ${item.level}</strong> · Word Links · ${EXTRA_LEVELS[item.level - 1]?.name || 'Extra puzzle'}`;
    return `<div class="history-row"><div><div class="history-date">${date}</div><div class="history-meta">${label} · ${item.words?.length || 0} links</div></div><div class="history-score">${item.score} pts</div></div>`;
  }).join('');
}

function openWelcome() {
  updateStreakLabels();
  const solvedToday = readHistory().some(item => item.date === todayKey() && (item.ageGroup || '18+') === window.currentWordAgeGroup().id);
  document.getElementById('welcome-copy').textContent = solvedToday
    ? 'You’ve solved today’s challenge already. You can revisit it or keep your streak ready for tomorrow.'
    : 'A new daily puzzle is ready. Keep your run going with today’s connection.';
  document.getElementById('welcome-modal').hidden = false;
}

const welcomeLevelsButton = document.createElement('button');
welcomeLevelsButton.id = 'welcome-levels';
welcomeLevelsButton.className = 'secondary mini-welcome-secondary';
welcomeLevelsButton.type = 'button';
welcomeLevelsButton.textContent = 'Choose a level';
document.getElementById('play-daily').after(welcomeLevelsButton);
welcomeLevelsButton.addEventListener('click', () => {
  renderLevels();
  document.getElementById('welcome-modal').hidden = true;
  setExtraLevelsOpen(true);
});

document.getElementById('extra-puzzles').addEventListener('click', () => { renderLevels(); setExtraLevelsOpen(true); });
document.getElementById('daily-challenge-button').addEventListener('click', () => {
  setExtraLevelsOpen(false);
  startDaily();
  document.getElementById('history-modal').hidden = true;
  document.getElementById('welcome-modal').hidden = true;
});
document.getElementById('history-button').addEventListener('click', () => { renderHistory('all'); document.getElementById('history-modal').hidden = false; });
document.querySelectorAll('[data-history-section]').forEach(button => button.addEventListener('click', () => renderHistory(button.dataset.historySection)));
document.getElementById('history-close').addEventListener('click', () => { document.getElementById('history-modal').hidden = true; });
document.getElementById('levels-close').addEventListener('click', () => setExtraLevelsOpen(false));
document.getElementById('welcome-close').addEventListener('click', () => { document.getElementById('welcome-modal').hidden = true; });
document.getElementById('play-daily').addEventListener('click', () => { startDaily(); document.getElementById('welcome-modal').hidden = true; });
document.getElementById('welcome-modal').addEventListener('click', event => { if (event.target.id === 'welcome-modal') event.currentTarget.hidden = true; });
document.getElementById('history-modal').addEventListener('click', event => { if (event.target.id === 'history-modal') event.currentTarget.hidden = true; });
document.getElementById('levels-modal').addEventListener('click', event => { if (event.target.id === 'levels-modal') setExtraLevelsOpen(false); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !document.getElementById('levels-modal').hidden) setExtraLevelsOpen(false);
});
document.addEventListener('game-directions:levels', event => {
  if(event.detail?.game!=='links')return;
  renderLevels();
  document.getElementById('welcome-modal').hidden=true;
  setExtraLevelsOpen(true);
});

startDaily();
window.addEventListener('word-age-change', () => { if (window.DAILY_MODE) startDaily(); });

window.addEventListener('daily-reset', () => {
  if (window.DAILY_MODE) {
    startDaily();
    feedback('A new daily challenge is ready. Daily puzzles reset at 12:00 AM local time.', 'success');
  }
  updateStreakLabels();
  if (!document.getElementById('welcome-modal').hidden) openWelcome();
});
