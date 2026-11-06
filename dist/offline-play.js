'use strict';

(() => {
  const store = window.WordroomOffline;
  const edition = 'links-difficulty-v2-crossword-v8';
  const originalLinks = dailyPuzzleFor;
  const originalMini = miniDailyPuzzle;
  const cached = new Map();
  let preparing = null, progress = '', lastTrigger = null;
  const packKey = (date, difficulty) => edition + ':' + date + ':' + difficulty;
  const dateAfter = (date, days) => {
    const value = new Date(date + 'T12:00:00Z');
    value.setUTCDate(value.getUTCDate() + days);
    return value.toISOString().slice(0,10);
  };

  // Generation is synchronous, with every live-game global restored before
  // yielding. It never renders, spends hints, or changes the active session.
  function generate(date, difficulty) {
    const saved = {
      difficulty:window.WORD_AGE_GROUP, daily:window.DAILY_MODE, custom:window.CUSTOM_PUZZLE,
      mode:miniMode, level:miniLevel, date:miniPuzzleDate, index:miniIndex, puzzle:miniPuzzle
    };
    try {
      window.WORD_AGE_GROUP = difficulty;
      window.DAILY_MODE = true;
      window.CUSTOM_PUZZLE = null;
      const links = originalLinks(date);
      const layout = randomStartingWords(links[0], links[1], 'daily-difficulty-v2-' + difficulty + '-' + date);
      miniMode = 'daily'; miniLevel = null; miniPuzzleDate = date;
      miniIndex = miniDailyIndex(date); miniPuzzle = originalMini(date);
      layoutMiniEntries();
      numberMiniEntries(miniPuzzle.entries);
      if (layout.length !== 2 || miniPuzzle.entries.length !== 8) throw new Error('A puzzle could not be prepared.');
      return {id:packKey(date,difficulty),edition,date,difficulty,links:links.slice(0,2),layout,entries:structuredClone(miniPuzzle.entries)};
    } finally {
      window.WORD_AGE_GROUP = saved.difficulty; window.DAILY_MODE = saved.daily; window.CUSTOM_PUZZLE = saved.custom;
      miniMode = saved.mode; miniLevel = saved.level; miniPuzzleDate = saved.date; miniIndex = saved.index; miniPuzzle = saved.puzzle;
    }
  }
  const panel = document.createElement('dialog');
  panel.className = 'offline-dialog';
  panel.setAttribute('aria-labelledby','offline-title');
  panel.innerHTML = '<button type="button" class="secondary offline-close" aria-label="Close progress and backups">Close</button><div class="eyebrow">PLAY ANYWHERE</div><h2 id="offline-title">Progress & backups</h2><p>Both games, their dictionaries, clues and extra levels are included in this app. No account is needed to play.</p><p id="offline-save-status" role="status"></p><p id="offline-pack-status" role="status"></p><div class="offline-actions"><button type="button" class="secondary" id="export-progress">Export progress</button><label class="secondary offline-import">Import backup<input type="file" accept=".json,application/json" id="import-progress"></label></div><p id="offline-backup-status" role="status"></p><p class="offline-note">Daily puzzles follow your device’s local midnight. Daily puzzles are prepared automatically. Cloud accounts and cross-device syncing are not connected yet; keep an exported backup outside this app.</p>';
  document.body.append(panel);
  const shellStatus=document.createElement('p');
  shellStatus.setAttribute('role','status');
  panel.querySelector('#offline-title').after(shellStatus);
  if(location.protocol==='file:') {
    shellStatus.textContent='Game files are included on this device.';
  } else {
    panel.querySelector('#offline-title').nextElementSibling.nextElementSibling.textContent='Prepare this website on your device before travelling. No account is needed to play.';
    shellStatus.textContent='Checking offline game files…';
    if('serviceWorker' in navigator && location.protocol==='https:') {
      navigator.serviceWorker.register('./service-worker.js').then(()=>navigator.serviceWorker.ready)
        .then(()=>{shellStatus.textContent='Game files are ready for offline use in this browser.';})
        .catch(()=>{shellStatus.textContent='Offline website preparation failed. Reconnect and reopen this page before travelling.';});
    } else shellStatus.textContent='Offline website storage is unavailable here. Use the installed app for offline play.';
  }
  function refresh() {
    const status = store.status();
    const storageMessage = status.persistent === false
      ? 'Progress is stored on this device, but the browser may clear it when storage is low.'
      : 'Progress is stored on this device. No cloud backup.';
    panel.querySelector('#offline-save-status').textContent = status.failure || (status.pending ? 'Saving on this device…' : storageMessage);
    panel.querySelector('#offline-pack-status').textContent = 'Included levels are always available offline. Daily puzzles are prepared automatically over Wi-Fi in the app.';
  }
  const close = () => { panel.close(); lastTrigger?.focus({preventScroll:true}); };
  panel.querySelector('.offline-close').addEventListener('click',close);
  panel.addEventListener('close',()=>lastTrigger?.focus({preventScroll:true}));
  for (const container of document.querySelectorAll('.intro-actions,.mini-header-actions')) {
    const button = document.createElement('button');
    button.type='button'; button.className='secondary'; button.textContent='Progress & backups';
    button.addEventListener('click',()=>{ lastTrigger=button; window.closeMobileKeyboard?.(); refresh(); panel.showModal(); });
    container.append(button);
  }
  panel.querySelector('#export-progress').onclick=()=>{
    const text=store.exportBackup();
    if(window.webkit?.messageHandlers?.exportWordroomBackup) {
      window.webkit.messageHandlers.exportWordroomBackup.postMessage(text);
    } else {
      const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));
      const link=document.createElement('a'); link.href=url; link.download='Word-Links-backup.json'; link.click();
      setTimeout(()=>URL.revokeObjectURL(url),1000);
    }
    panel.querySelector('#offline-backup-status').textContent='Choose where to save your backup.';
  };
  panel.querySelector('#import-progress').onchange=async event=>{
    const file=event.target.files[0]; if(!file)return;
    const output=panel.querySelector('#offline-backup-status');
    try {
      if(file.size>20_000_000)throw new Error('Choose a backup smaller than 20 MB.');
      const text=await file.text(); store.validateBackup(text);
      output.textContent='History will be combined. Existing unfinished games will be kept. ';
      const accept=document.createElement('button');
      accept.type='button'; accept.className='secondary'; accept.textContent='Import this backup';
      const cancel=document.createElement('button');
      cancel.type='button'; cancel.className='secondary'; cancel.textContent='Cancel';
      cancel.onclick=()=>{output.textContent='Import cancelled.';};
      accept.onclick=async()=>{
        accept.disabled=true;
        try {
          const count=await store.importBackup(text);
          output.textContent='Imported '+count+' saved records. Reopen the app to load imported games.';
        } catch(error) { output.textContent='Import failed: '+error.message; }
      };
      output.append(accept,cancel);
    } catch(error) { output.textContent='Import failed: '+error.message; }
    finally { event.target.value=''; }
  };
  const recoveryButton=document.createElement('button');
  recoveryButton.type='button'; recoveryButton.className='secondary'; recoveryButton.textContent='Other saved attempts';
  const recoveryList=document.createElement('div');
  recoveryList.className='offline-recovery-list';
  panel.querySelector('.offline-actions').after(recoveryButton,recoveryList);
  recoveryButton.onclick=async()=>{
    recoveryButton.disabled=true;
    recoveryList.replaceChildren();
    try {
      const saves=await store.recoveredSessions();
      const note=document.createElement('p');
      note.textContent=saves.length ? 'Restore an imported attempt and reopen the app. Your current attempt will remain here as another save.' : 'No other imported attempts yet.';
      recoveryList.append(note);
      for(const save of saves) {
        const button=document.createElement('button');
        button.type='button'; button.className='secondary'; button.textContent='Restore: '+save.title;
        button.onclick=async()=>{
          button.disabled=true;
          try { await store.restoreSession(save.archive,save.key); location.reload(); }
          catch(error) { note.textContent='Restore failed: '+error.message; button.disabled=false; }
        };
        recoveryList.append(button);
      }
    } catch(error) { recoveryList.textContent='Could not load saved attempts: '+error.message; }
    finally { recoveryButton.disabled=false; }
  };
  window.addEventListener('wordroom-storage-status',refresh);
  // Visible failure notice: never quietly claim a failed save succeeded.
  const notice=document.createElement('p');
  notice.className='offline-save-warning'; notice.setAttribute('role','alert'); notice.hidden=true;
  document.body.append(notice);
  notice.textContent=store.status().failure; notice.hidden=!store.status().failure;
  window.addEventListener('wordroom-storage-status',()=>{
    const message=store.status().failure; notice.textContent=message; notice.hidden=!message;
  });
  if(window.WORDROOM_AUTHORING)window.WordroomTrip = {generate,edition,dateAfter};
})();
