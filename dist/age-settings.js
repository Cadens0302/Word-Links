'use strict';

// Keep only the age band in storage. The player gives their age again each time
// they open the site; switching games within this page load does not ask again.
const WORD_AGE_GROUPS = [
  {id:'1-3',label:'Ages 1–3',min:1,max:3,minWordLength:4,maxWordLength:5},
  {id:'4-7',label:'Ages 4–7',min:4,max:7,minWordLength:5,maxWordLength:6},
  {id:'8-11',label:'Ages 8–11',min:8,max:11,minWordLength:6,maxWordLength:7},
  // Keep middle-school puzzles thoughtful without making long, obscure entries
  // the default challenge. Six- and seven-letter words still reward crossings.
  {id:'12-14',label:'Ages 12–14',min:12,max:14,minWordLength:6,maxWordLength:7},
  {id:'15-18',label:'Ages 15–18',min:15,max:17,minWordLength:8,maxWordLength:9},
  {id:'18+',label:'Ages 18+',min:18,max:120,minWordLength:8,maxWordLength:10}
];
const WORD_AGE_STORAGE_KEY = 'beaconWordroomAgeGroupV1';
window.WORD_AGE_GROUPS = WORD_AGE_GROUPS;
function groupForAge(age) { return WORD_AGE_GROUPS.find(group => age >= group.min && age <= group.max) || null; }
function currentWordAgeGroup() { return WORD_AGE_GROUPS.find(group => group.id === window.WORD_AGE_GROUP) || WORD_AGE_GROUPS.at(-1); }
window.WORD_AGE_GROUP = WORD_AGE_GROUPS.some(group => group.id === localStorage.getItem(WORD_AGE_STORAGE_KEY))
  ? localStorage.getItem(WORD_AGE_STORAGE_KEY) : '18+';
window.currentWordAgeGroup = currentWordAgeGroup;
window.filterWordsForAge = function(pool, maxLengthOverride = Infinity) {
  const group = currentWordAgeGroup();
  const minLength = group.minWordLength;
  const maxLength = Math.min(group.maxWordLength, Number.isFinite(maxLengthOverride) ? maxLengthOverride : Infinity);
  return pool.filter(item => {
    const word = typeof item === 'string' ? item : Array.isArray(item) ? item[0] : item?.answer || item?.word || '';
    return word.length >= minLength && word.length <= maxLength;
  });
};

window.ageSelectionConfirmedThisLoad = false;
const ageInput = document.getElementById('age-input');
const ageForm = document.getElementById('age-form');
const agePanel = document.getElementById('age-choice-panel');
const gameChoices = document.getElementById('game-choice-grid');
const gameSelector = document.getElementById('game-selector');
function updateAgeButtons() {
  const group = currentWordAgeGroup();
  for (const id of ['age-profile-links','age-profile-crossword']) {
    const button = document.getElementById(id);
    if (button) button.textContent = `${group.label} · Change`;
  }
}
function updateAgePreview() {
  const age = Number(ageInput.value);
  const group = groupForAge(age);
  document.getElementById('age-value').value = `${age} ${age === 1 ? 'year' : 'years'}`;
  ageInput.setAttribute('aria-valuetext', `${age} years old, ${group?.label || 'age group unavailable'}`);
}
window.showGameChooser = function(requireAge = false) {
  if (requireAge) window.ageSelectionConfirmedThisLoad = false;
  document.getElementById('game-welcome').hidden = true;
  document.getElementById('welcome-modal').hidden = true;
  document.getElementById('mini-modal').hidden = true;
  const needsAge = !window.ageSelectionConfirmedThisLoad;
  agePanel.hidden = !needsAge;
  gameChoices.hidden = needsAge;
  gameSelector.hidden = false;
  if (needsAge) {
    ageInput.value = 18;
    document.getElementById('age-error').textContent = '';
    updateAgePreview();
    requestAnimationFrame(() => ageInput.focus());
  }
};
function openAgeSettings() { window.showGameChooser(true); }
updateAgeButtons();
updateAgePreview();
ageInput.addEventListener('input', updateAgePreview);
document.getElementById('age-profile-links')?.addEventListener('click', openAgeSettings);
document.getElementById('age-profile-crossword')?.addEventListener('click', openAgeSettings);
ageForm.addEventListener('submit', event => {
  event.preventDefault();
  const group = groupForAge(Number(ageInput.value));
  if (!group) { document.getElementById('age-error').textContent = 'Choose an age from 1 to 120.'; return; }
  const previous = window.WORD_AGE_GROUP;
  window.WORD_AGE_GROUP = group.id;
  localStorage.setItem(WORD_AGE_STORAGE_KEY, group.id);
  window.ageSelectionConfirmedThisLoad = true;
  updateAgeButtons();
  agePanel.hidden = true;
  gameChoices.hidden = false;
  if (previous !== group.id) window.dispatchEvent(new CustomEvent('word-age-change', {detail:{group}}));
  gameChoices.querySelector('button')?.focus({preventScroll:true});
});
