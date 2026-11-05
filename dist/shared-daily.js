'use strict';
(() => {
  const native = window.webkit?.messageHandlers?.dailyPuzzles;
  let state = {date:'',records:[],completed:{},status:'Preparing today’s puzzle… Included levels are ready.'};
  let refreshing = null, fetching = null, migrated = false;
  const signatures = new Map(), begun = new Set();
  const id = (game,date=puzzleDateKey(),difficulty=window.WORD_AGE_GROUP) => `${date}:${difficulty}:${game}`;
  const monthEnd = date => {
    const d=new Date(date+'T12:00:00Z'),day=d.getUTCDate();
    d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()+3);
    const last=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate();
    d.setUTCDate(Math.min(day,last));return d.toISOString().slice(0,10);
  };
  const record = game => state.date===puzzleDateKey() ? state.records.find(p=>p.id===id(game)) : null;
  const completed = game => state.date===puzzleDateKey() && !!state.completed[id(game)];
  function show(game,blocked) {
    const container=document.querySelector(game==='links'?'.game-layout':'.mini-layout');
    if(!container)return;
    container.hidden=blocked;
    container.inert=blocked;
    container.classList.toggle('daily-blocked',blocked);
    let notice=document.getElementById('daily-status-'+game);
    if(!notice) {
      notice=document.createElement('section');notice.id='daily-status-'+game;notice.className='daily-status';
      const text=document.createElement('p');text.setAttribute('role','status');
      const levels=document.createElement('button');levels.type='button';levels.className='secondary';levels.textContent='Play included levels';
      levels.onclick=()=>document.dispatchEvent(new CustomEvent('game-directions:levels',{detail:{game}}));
      notice.append(text,levels);container.before(notice);
    }
    notice.hidden=!blocked;
    notice.querySelector('p').textContent=completed(game)?'Today’s puzzle is complete. Your result is saved in history. Come back tomorrow for a new puzzle.':state.status||'Today’s puzzle is not available. Connect to Wi-Fi to prepare it, or play an included level.';
    if(game==='crossword')document.querySelector('.mini-progress-strip')?.classList.toggle('daily-blocked',blocked);
  }
  function allow(game) {
    if(window.WORDROOM_AUTHORING)return true;
    const available=!!record(game)&&!completed(game);
    show(game,!available);
    if(available && native && !begun.has(id(game))) {
      const key=id(game);begun.add(key);
      native.postMessage({operation:'begin',id:key}).catch(()=>begun.delete(key));
    }
    return available;
  }
  function leave(game) { show(game,false); }
  async function browserState() {
    await WordroomOffline.ready;
    const date=puzzleDateKey(),day=await WordroomOffline.getPack('shared-day:'+date);
    const done=(await WordroomOffline.getPack('shared-results'))?.results||{};
    return {date,records:(day?.records||[]).filter(p=>!done[p.id]),completed:done,status:state.status};
  }
  async function validateEnvelope(envelope,date) {
    if(envelope.schema!==1||envelope.date!==date||typeof envelope.payload!=='string')throw Error('Invalid puzzle file');
    const bytes=new TextEncoder().encode(envelope.payload);
    const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),n=>n.toString(16).padStart(2,'0')).join('');
    if(hash!==envelope.sha256)throw Error('Puzzle checksum failed');
    const records=JSON.parse(envelope.payload);
    if(!Array.isArray(records)||records.length!==8||new Set(records.map(p=>p.id)).size!==8)throw Error('Incomplete daily file');
    for(const p of records) {
      if(p.date!==date||!['easy','medium','hard','master'].includes(p.difficulty)||!['links','crossword'].includes(p.game)||p.id!==`${date}:${p.difficulty}:${p.game}`)throw Error('Incorrect puzzle identity');
      if(p.game==='links'&&p.layout?.length!==2||p.game==='crossword'&&p.entries?.length!==8)throw Error('Incorrect puzzle board');
      if(JSON.stringify(p).includes('<')||JSON.stringify(p).includes('>'))throw Error('Invalid puzzle text');
    }
    return records;
  }
  async function fetchBrowser() {
    if(native||window.WORDROOM_AUTHORING||fetching||!navigator.onLine||location.protocol!=='https:')return;
    if(navigator.connection?.type==='cellular'||navigator.connection?.saveData)return;
    fetching=(async()=>{
      await WordroomOffline.ready;
      const today=puzzleDateKey(),end=monthEnd(today);
      const done=(await WordroomOffline.getPack('shared-results'))?.results||{};
      for(let date=today;date<=end;) {
        const key='shared-day:'+date,existing=await WordroomOffline.getPack(key);
        if(!existing) {
          const response=await fetch(`./daily/v1/${date}.json`,{cache:'no-cache'});
          if(!response.ok)throw Error('Daily file unavailable');
          const text=await response.text();if(text.length>100000)throw Error('Daily file too large');
          const records=(await validateEnvelope(JSON.parse(text),date)).filter(p=>!done[p.id]);
          await WordroomOffline.putPack({id:key,records});
          if(date===today){state.status='';await refresh();}
        }
        const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+1);date=d.toISOString().slice(0,10);
      }
    })().catch(()=>{state.status='Today’s shared puzzle is not available yet. Included levels are ready.';refresh();}).finally(()=>fetching=null);
  }
  async function refresh() {
    if(window.WORDROOM_AUTHORING)return;
    if(refreshing)return refreshing;
    refreshing=(async()=>{
      try {state=native?await native.postMessage({operation:'today'}):await browserState();}
      catch {state.status='Daily preparation paused. Your saved progress and included levels are available.';}
      // Reconcile durable history after backup import or migration before offering a daily again.
      if(native) {
        for(const [game,historyKey] of [['links','wordLinksDailyHistoryV1'],['crossword','wordLinksMiniHistory']]) {
          for(const result of JSON.parse(localStorage.getItem(historyKey)||'[]')) {
            const key=id(game,result.date,result.ageGroup);
            if(result.date===state.date && ['easy','medium','hard','master'].includes(result.ageGroup) && !state.completed[key]) {
              state=await native.postMessage({operation:'complete',id:key,result});
            }
          }
        }
      }
      if(state.records.length && !migrated) { await WordroomOffline.removeLegacyPacks(); migrated=true; }
      for(const game of ['links','crossword']) {
        const signature=JSON.stringify([state.date,window.WORD_AGE_GROUP,record(game),completed(game)]);
        const changed=signatures.get(game)!==signature;signatures.set(game,signature);
        const active=game==='links'?window.DAILY_MODE:typeof miniMode!=='undefined'&&miniMode==='daily';
        if(active) {
          if(changed&&record(game)&&!completed(game)) {
            if(game==='links'&&typeof startDaily==='function')startDaily();
            if(game==='crossword'&&typeof startMiniDaily==='function')startMiniDaily();
          } else allow(game);
        }
      }
    })().finally(()=>refreshing=null);
    return refreshing;
  }
  async function complete(game,date,difficulty,result) {
    if(window.WORDROOM_AUTHORING)return;
    const historyKey=game==='links'?'wordLinksDailyHistoryV1':'wordLinksMiniHistory';
    const stored=JSON.parse(localStorage.getItem(historyKey)||'[]').find(item=>item.date===date&&item.ageGroup===difficulty);
    if(!stored)throw Error('Result has not been saved');
    const key=id(game,date,difficulty);
    const sessionKey=game==='links'?sessionStorageKey():miniSessionKey();
    if(native)state=await native.postMessage({operation:'complete',id:key,result:stored});
    else {
      const pack=await WordroomOffline.getPack('shared-results')||{id:'shared-results',results:{}};
      pack.results[key]=stored;await WordroomOffline.putPack(pack);
      const day=await WordroomOffline.getPack('shared-day:'+date);
      if(day){day.records=day.records.filter(p=>p.id!==key);await WordroomOffline.putPack(day);}
      state=await browserState();
    }
    // Remove only this completed session, never a different difficulty or unfinished attempt.
    localStorage.removeItem(sessionKey);
    if(game==='links') {
      const layouts=readDailyLayouts();delete layouts[`difficulty-v2:${date}:${difficulty}`];writeDailyLayouts(layouts);
    }
    await refresh();
  }
  window.WordroomDaily={allow,leave,record,completed,refresh,complete,monthEnd,validateEnvelope};
  window.addEventListener('load',()=>{refresh();fetchBrowser();});
  window.addEventListener('online',()=>{refresh();fetchBrowser();});
  window.addEventListener('daily-reset',()=>{refresh();fetchBrowser();});
})();
