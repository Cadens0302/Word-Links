'use strict';

// Both games follow the player's device calendar and local midnight.
function puzzleDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
function previousPuzzleDate(key) {
  const date = new Date(`${key}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}
function nextPuzzleMidnight(now = Date.now()) {
  const midnight = new Date(now);
  // Calendar arithmetic handles local daylight-saving changes.
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime();
}

let currentPuzzleDay = puzzleDateKey();
let puzzleMidnightTimer;
function checkPuzzleMidnight() {
  clearTimeout(puzzleMidnightTimer);
  const day = puzzleDateKey();
  if (day !== currentPuzzleDay) {
    currentPuzzleDay = day;
    window.dispatchEvent(new CustomEvent('daily-reset', { detail: { date: day } }));
  }
  puzzleMidnightTimer = setTimeout(checkPuzzleMidnight, Math.max(1, nextPuzzleMidnight() - Date.now()));
}
window.addEventListener('DOMContentLoaded', checkPuzzleMidnight);
window.addEventListener('focus', checkPuzzleMidnight);
window.addEventListener('pageshow', checkPuzzleMidnight);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) checkPuzzleMidnight();
});
