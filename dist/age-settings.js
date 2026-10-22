'use strict';

// The choice lasts for this visit. Daily seeds include the selected difficulty,
// so everyone choosing the same mode receives the same puzzle on a given date.
const WORD_DIFFICULTIES = [
  {id:'easy',label:'Easy',minWordLength:3,maxWordLength:6,links:{minLength:6,maxLength:8,minGap:2,maxGap:4}},
  {id:'medium',label:'Medium',minWordLength:4,maxWordLength:7,links:{minLength:5,maxLength:6,minGap:5,maxGap:6}},
  {id:'hard',label:'Hard',minWordLength:5,maxWordLength:8,links:{minLength:4,maxLength:5,minGap:7,maxGap:9}},
  {id:'master',label:'Masters',minWordLength:6,maxWordLength:9,links:{minLength:3,maxLength:4,minGap:10,maxGap:12}}
];
window.WORD_AGE_GROUPS = WORD_DIFFICULTIES; // Existing daily and history modules use this lookup.
window.WORD_AGE_GROUP = 'medium';
window.currentWordAgeGroup = () => WORD_DIFFICULTIES.find(item => item.id === window.WORD_AGE_GROUP) || WORD_DIFFICULTIES[1];
window.wordLinksAgeChallenge = () => window.currentWordAgeGroup().links;
window.filterWordsForAge = (pool,maxLengthOverride=Infinity) => {
  const mode=window.currentWordAgeGroup();
  return pool.filter(item => {
    const word=typeof item==='string'?item:Array.isArray(item)?item[0]:item?.answer||item?.word||'';
    return word.length>=mode.minWordLength && word.length<=Math.min(mode.maxWordLength,maxLengthOverride);
  });
};

window.showWordroomConfirmation = function({title, message, confirmLabel = 'Confirm', danger = false} = {}) {
  return new Promise(resolve => {
    const backdrop = document.createElement('div');
    backdrop.className = 'wordroom-confirm-backdrop';
    backdrop.innerHTML = `<section class="wordroom-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="wordroom-confirm-title" aria-describedby="wordroom-confirm-copy"><div class="eyebrow">PLEASE CONFIRM</div><h2 id="wordroom-confirm-title"></h2><p id="wordroom-confirm-copy"></p><div class="wordroom-confirm-actions"><button class="wordroom-confirm-cancel" type="button">Cancel</button><button class="wordroom-confirm-accept" type="button"></button></div></section>`;
    backdrop.querySelector('#wordroom-confirm-title').textContent = title || 'Are you sure?';
    backdrop.querySelector('#wordroom-confirm-copy').textContent = message || '';
    const cancel = backdrop.querySelector('.wordroom-confirm-cancel');
    const accept = backdrop.querySelector('.wordroom-confirm-accept');
    accept.textContent = confirmLabel;
    if (danger) accept.classList.add('danger');
    document.body.append(backdrop);
    const trigger = document.activeElement;
    let settled = false;
    const finish = answer => {
      if (settled) return;
      settled = true;
      document.removeEventListener('keydown', onKeyDown);
      backdrop.remove();
      trigger?.focus?.({preventScroll:true});
      resolve(answer);
    };
    const onKeyDown = event => {
      if (event.key === 'Escape') { event.preventDefault(); finish(false); }
      if (event.key === 'Tab') {
        event.preventDefault();
        (document.activeElement === cancel ? accept : cancel).focus();
      }
    };
    cancel.addEventListener('click', () => finish(false));
    accept.addEventListener('click', () => finish(true));
    backdrop.addEventListener('click', event => { if (event.target === backdrop) finish(false); });
    document.addEventListener('keydown', onKeyDown);
    cancel.focus({preventScroll:true});
  });
};


window.ageSelectionConfirmedThisLoad = false;
const chooser=document.getElementById('game-selector');
const panel=document.getElementById('age-choice-panel');
const choices=document.getElementById('game-choice-grid');
const difficultyChoices=[...document.querySelectorAll('[data-difficulty]')];
let selectedDifficulty='medium';
function showSelection(id) {
  selectedDifficulty=id;
  difficultyChoices.forEach(button=>{
    const active=button.dataset.difficulty===id;
    button.classList.toggle('selected',active);
    button.setAttribute('aria-checked',String(active));
    if(active && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      button.classList.remove('difficulty-pop');
      void button.offsetWidth;
      button.classList.add('difficulty-pop');
    }
  });
}
function updateDifficultyButtons(){
  const label=window.currentWordAgeGroup().label;
  for(const id of ['age-profile-links','age-profile-crossword']){
    const button=document.getElementById(id);
    if(button) button.textContent=`${label} · Change`;
  }
}
window.showGameChooser=function(requireDifficulty=false){
  document.getElementById('game-welcome').hidden=true;
  document.getElementById('welcome-modal').hidden=true;
  document.getElementById('mini-modal').hidden=true;
  const needsDifficulty=requireDifficulty || !window.ageSelectionConfirmedThisLoad;
  panel.hidden=!needsDifficulty;
  choices.hidden=needsDifficulty;
  chooser.hidden=false;
  if(needsDifficulty){
    showSelection(window.WORD_AGE_GROUP);
    requestAnimationFrame(()=>difficultyChoices.find(button=>button.dataset.difficulty===selectedDifficulty)?.focus({preventScroll:true}));
  }
};
difficultyChoices.forEach(button=>button.addEventListener('click',()=>showSelection(button.dataset.difficulty)));
document.getElementById('difficulty-form').addEventListener('submit',event=>{
  event.preventDefault();
  const previous=window.WORD_AGE_GROUP;
  window.WORD_AGE_GROUP=selectedDifficulty;
  window.ageSelectionConfirmedThisLoad=true;
  updateDifficultyButtons();
  panel.hidden=true;
  choices.hidden=false;
  if(previous!==selectedDifficulty) window.dispatchEvent(new CustomEvent('word-age-change',{detail:{group:window.currentWordAgeGroup()}}));
  choices.querySelector('button')?.focus({preventScroll:true});
});
for(const id of ['age-profile-links','age-profile-crossword']){
  document.getElementById(id)?.addEventListener('click',()=>window.showGameChooser(true));
}
updateDifficultyButtons();
showSelection(selectedDifficulty);
