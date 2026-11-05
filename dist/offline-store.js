'use strict';

// Keep the existing game saves synchronous. Mirror each successful write into
// IndexedDB. Cloud sync is not configured, so retain only the latest snapshot.
(() => {
  const eligible = key => /^(wordLinks(?:DailyHistoryV1|ExtraBestV2|ExtraCompletedV1|ExtraHistoryV1|PuzzleAssignmentsV1|DailyLayoutsV6|MiniHistory|MiniLevelProgress)$|wordLinks(?:Mini)?Session:|dailyChallenge:)/.test(key);
  const originalSet = Storage.prototype.setItem;
  const originalRemove = Storage.prototype.removeItem;
  const uuid = () => crypto.randomUUID();
  const importJournalKey = 'beaconWordroomPendingImportV1';
  // An interrupted import is rolled back before any game scripts read saves.
  const interrupted = localStorage.getItem(importJournalKey);
  if (interrupted) {
    const prior = JSON.parse(interrupted);
    for (const [key,value] of Object.entries(prior)) {
      if (!eligible(key)) continue;
      if (value === null) originalRemove.call(localStorage,key);
      else originalSet.call(localStorage,key,value);
    }
    originalRemove.call(localStorage,importJournalKey);
  }
  const stableJSON = value => JSON.stringify(value, (_, item) =>
    item && !Array.isArray(item) && typeof item === 'object'
      ? Object.fromEntries(Object.entries(item).sort(([a],[b])=>a.localeCompare(b))) : item);
  const combineHistory = (a,b) => {
    const seen = new Set();
    return [...a,...b].filter(item => {
      const id=stableJSON(item);
      if(seen.has(id))return false;
      seen.add(id);return true;
    });
  };
  let database, failure = '', pending = 0;
  const notify = () => window.dispatchEvent(new Event('wordroom-storage-status'));
  const ready = new Promise((resolve, reject) => {
    const request = indexedDB.open('beacon-wordroom-offline', 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore('saves', {keyPath:'key'});
      db.createObjectStore('operations', {keyPath:'id'});
      db.createObjectStore('packs', {keyPath:'id'});
    };
    request.onsuccess = () => { database = request.result; resolve(database); };
    request.onerror = () => reject(request.error);
  });
  ready.catch(() => { failure = 'Extra backup storage is unavailable. Export your progress to keep a separate copy.'; notify(); });

  async function transaction(names, work) {
    const db = await ready;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(names, 'readwrite');
      work(tx);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || new Error('Save interrupted'));
    });
  }
  function mirror(key, value) {
    pending++;
    transaction(['saves'], tx => {
      tx.objectStore('saves').put({key,value});
    }).catch(() => { failure = 'The extra backup could not be saved. Export your progress before closing the app.'; })
      .finally(() => { pending--; notify(); });
  }
  Storage.prototype.setItem = function(key, value) {
    try { originalSet.call(this, key, value); }
    catch (error) {
      if (this === localStorage && eligible(String(key))) {
        failure = 'Your latest progress could not be saved. Keep this game open and free some device storage.';
        notify();
      }
      throw error;
    }
    if (this === localStorage && eligible(String(key))) mirror(String(key), String(value));
  };
  Storage.prototype.removeItem = function(key) {
    originalRemove.call(this, key);
    if (this === localStorage && eligible(String(key))) mirror(String(key), null);
  };
  function snapshot() {
    const data = {};
    for (let i=0; i<localStorage.length; i++) {
      const key = localStorage.key(i);
      if (eligible(key)) data[key] = localStorage.getItem(key);
    }
    return data;
  }
  function exportBackup() {
    return JSON.stringify({format:'beacon-wordroom-backup',version:1,createdAt:new Date().toISOString(),data:snapshot()}, null, 2);
  }
  function validateBackup(text) {
    if (typeof text !== 'string' || text.length > 20_000_000) throw new Error('Choose a Wordroom backup smaller than 20 MB.');
    const backup = JSON.parse(text);
    if (backup.format !== 'beacon-wordroom-backup' || backup.version !== 1 ||
        !backup.data || Array.isArray(backup.data) || typeof backup.data !== 'object') throw new Error('This is not a supported Wordroom backup.');
    for (const [key,value] of Object.entries(backup.data)) {
      if (!eligible(key) || typeof value !== 'string' || value.length > 5_000_000) throw new Error('This backup contains an invalid save.');
      const parsed = JSON.parse(value);
      if (parsed === null || typeof parsed !== 'object') throw new Error('This backup contains an invalid save.');
      const safe = value => {
        if (typeof value === 'string') return !/[<>]/.test(value);
        if (value && typeof value === 'object') return Object.entries(value).every(([key,item]) =>
          !['__proto__','constructor','prototype'].includes(key) && safe(item));
        return true;
      };
      if (!safe(parsed)) throw new Error('This backup contains unsupported text or fields.');
      const validWord = word => word && /^[A-Z]{1,15}$/.test(word.text) &&
        Number.isInteger(word.r) && word.r>=0 && word.r<15 &&
        Number.isInteger(word.c) && word.c>=0 && word.c<15 && ['H','R','L','U','D'].includes(word.dir);
      if (/Session:|^dailyChallenge:/.test(key)) {
        if (key.includes('Mini')) {
          if (!Array.isArray(parsed.entries) || parsed.entries.length<1 || parsed.entries.length>20 ||
              parsed.entries.some(entry=>!entry || typeof entry.answer!=='string' || !/^[A-Z]{1,12}$/.test(entry.answer) ||
                !Number.isInteger(entry.row) || !Number.isInteger(entry.col) || entry.row<0 || entry.col<0 ||
                !['Across','Down'].includes(entry.dir) ||
                entry.row+(entry.dir==='Down'?entry.answer.length:1)>12 ||
                entry.col+(entry.dir==='Across'?entry.answer.length:1)>12) ||
              !Array.isArray(parsed.answers) || parsed.answers.some(cell=>!cell || !Number.isInteger(cell.row) ||
                !Number.isInteger(cell.col) || cell.row<0 || cell.row>=12 || cell.col<0 || cell.col>=12 ||
                typeof cell.value!=='string' || !/^[A-Z]$/.test(cell.value))) throw new Error('Invalid crossword save.');
        } else if (!Array.isArray(parsed.words) || parsed.words.length<2 || !parsed.words.every(validWord) ||
                   !Number.isFinite(parsed.score) || parsed.score<0 || typeof parsed.name!=='string') {
          throw new Error('Invalid Word Links save.');
        }
      }
      if (/ExtraBest|ExtraCompleted|MiniLevelProgress/.test(key) && Array.isArray(parsed)) throw new Error('Invalid level progress.');
      if (/ExtraBest/.test(key) && Object.values(parsed).some(score=>!Number.isFinite(score)||score<0)) throw new Error('Invalid level scores.');
      if (key==='wordLinksMiniLevelProgress') {
        if (parsed.history && !Array.isArray(parsed.history)) throw new Error('Invalid level history.');
        if (parsed.best && Object.values(parsed.best).some(score=>!Number.isFinite(score)||score<0)) throw new Error('Invalid crossword scores.');
      }
      if (/History/.test(key) && (!Array.isArray(parsed) || parsed.some(item => !item || typeof item !== 'object' || !/^\d{4}-\d{2}-\d{2}$/.test(item.date)))) throw new Error('Invalid puzzle history.');

    }
    return backup.data;
  }
  // Merge histories; conflicting unfinished sessions remain on this device.
  // The incoming copy is retained in IndexedDB for recovery rather than lost.
  async function importBackup(text) {
    const incoming = validateBackup(text), before = snapshot();
    const merged = {};
    for (const [key,value] of Object.entries(incoming)) {
      const current = before[key];
      if (!current) { merged[key] = value; continue; }
      const a = JSON.parse(current), b = JSON.parse(value);
      if (Array.isArray(a) && Array.isArray(b) && /History/.test(key)) {
        merged[key] = JSON.stringify(combineHistory(a,b));
      } else if (/ExtraCompleted|ExtraBest/.test(key)) {
        const values = {...b,...a};
        for (const k of Object.keys(b)) values[k] = /Best/.test(key) && typeof a[k]==='number' && typeof b[k]==='number'
          ? Math.min(a[k],b[k]) : Boolean(a[k] || b[k]);
        merged[key] = JSON.stringify(values);
      } else if (key === 'wordLinksMiniLevelProgress') {
        const completed={...a.completed};
        for(const [level,done] of Object.entries(b.completed || {})) completed[level]=Boolean(completed[level] || done);
        const best={...a.best};
        for(const [level,score] of Object.entries(b.best || {})) best[level]=Math.min(best[level] ?? Infinity,score);
        merged[key]=JSON.stringify({...a,completed,best,history:combineHistory(a.history || [],b.history || [])});
      }
    }
    await transaction(['packs'], tx => tx.objectStore('packs').put({id:'import-'+uuid(),backup:incoming,createdAt:new Date().toISOString()}));
    const rollback=Object.fromEntries(Object.keys(merged).map(key=>[key,before[key] ?? null]));
    originalSet.call(localStorage,importJournalKey,JSON.stringify(rollback));
    try {
      for (const [key,value] of Object.entries(merged)) originalSet.call(localStorage,key,value);
      originalRemove.call(localStorage,importJournalKey);
    } catch (error) {
      for (const key of Object.keys(merged)) {
        if (before[key] === undefined) originalRemove.call(localStorage,key);
        else originalSet.call(localStorage,key,before[key]);
      }
      originalRemove.call(localStorage,importJournalKey);
      throw new Error('Not enough storage to import this backup. Existing progress was retained.');
    }
    for (const [key,value] of Object.entries(merged)) mirror(key,value);
    return Object.keys(merged).length;
  }
  async function putPack(pack) {
    await transaction(['packs'], tx => tx.objectStore('packs').put(pack));
    const read = await getPack(pack.id);
    if (JSON.stringify(read) !== JSON.stringify(pack)) throw new Error('Puzzle pack verification failed.');
  }
  async function getPack(id) {
    const db = await ready;
    return new Promise((resolve,reject) => {
      const request = db.transaction('packs').objectStore('packs').get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  async function recoveredSessions() {
    const db=await ready;
    const archives=await new Promise((resolve,reject)=>{
      const request=db.transaction('packs').objectStore('packs').getAll(IDBKeyRange.bound('import-','import-\uffff'));
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error);
    });
    const saves=[], seen=new Set();
    for(const archive of archives) {
      for(const [key,value] of Object.entries(archive.backup || {})) {
        if(!/Session:|^dailyChallenge:/.test(key) || localStorage.getItem(key)===value)continue;
        const identity=key+value;
        if(seen.has(identity))continue;
        seen.add(identity);
        const parsed=JSON.parse(value);
        saves.push({archive:archive.id,key,title:parsed.challengeName || parsed.name || parsed.title || 'Saved puzzle',savedAt:archive.createdAt});
      }
    }
    return saves;
  }
  async function restoreSession(archiveID,key) {
    if(!archiveID.startsWith('import-') || !/Session:|^dailyChallenge:/.test(key))throw new Error('Choose a saved game.');
    const archive=await getPack(archiveID);
    const value=archive?.backup?.[key];
    validateBackup(JSON.stringify({format:'beacon-wordroom-backup',version:1,data:{[key]:value}}));
    const current=localStorage.getItem(key);
    if(current && current!==value) {
      await putPack({id:'import-'+uuid(),createdAt:new Date().toISOString(),backup:{[key]:current}});
    }
    localStorage.setItem(key,value);
  }
  async function removeLegacyPacks() {
    // Old generated packs are disposable. Unfinished sessions and import archives
    // contain their own boards and are deliberately left intact.
    await transaction(['packs'],tx=>{
      const request=tx.objectStore('packs').openCursor();
      request.onsuccess=()=>{
        const cursor=request.result;if(!cursor)return;
        if(String(cursor.key).startsWith('links-difficulty-v2-crossword-v8:') ||
           String(cursor.key)==='readiness:links-difficulty-v2-crossword-v8')cursor.delete();
        cursor.continue();
      };
    });
  }
  window.WordroomOffline = {
    ready, removeLegacyPacks, exportBackup, validateBackup, importBackup, putPack, getPack, recoveredSessions, restoreSession,
    status: () => ({pending, failure, cloudConfigured:false})
  };
  ready.then(() => {
    // Existing installations retain all their saves; migration is additive.
    const data = snapshot();
    return transaction(['saves','operations'], tx => {
      tx.objectStore('operations').clear();
      for (const [key,value] of Object.entries(data)) tx.objectStore('saves').put({key,value});
    });
  }).catch(() => {});
})();
