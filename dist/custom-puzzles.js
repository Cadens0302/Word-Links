(() => {
  const limitOptions = '<option value="-1">Unlimited</option><option value="0">None</option>' + Array.from({length:20},(_,i)=>`<option value="${i+1}">${i+1}</option>`).join('');
  const limitsMarkup = (kind) => `<fieldset class="custom-limits"><legend>Help for players</legend>
    <div class="custom-limit-fixed"><strong>Clues</strong><span>Unlimited</span></div>
    <label>${kind==='links'?'Clue rerolls':'Layout rerolls'}<select data-limit="rerolls">${limitOptions.replace('value="3"','value="3" selected')}</select></label>
    ${kind==='links' ? '<div class="custom-limit-fixed"><strong>Easier clues</strong><span>Unlimited</span></div>' : '<div class="custom-limit-fixed"><strong>Answer reveal</strong><span>1 use per puzzle</span></div>'}
    <p>${kind==='links'?'Players can ask for a new clue whenever they need one. Rerolls choose a different clue.':'Players can open clues freely. Layout rerolls rearrange the same words; answer reveal is available once.'}</p>
  </fieldset>`;

  const overlay = document.createElement('div');
  overlay.id = 'custom-puzzle-builder'; overlay.className = 'custom-builder-backdrop'; overlay.hidden = true;
  overlay.innerHTML = `<section class="custom-builder" role="dialog" aria-modal="true" aria-labelledby="custom-builder-title">
    <button class="custom-builder-close" type="button" aria-label="Close puzzle builder">×</button>
    <div class="eyebrow">MAKE IT YOURS</div><h2 id="custom-builder-title">Build a puzzle</h2>
    <p class="custom-builder-description">Choose your game and make a fresh puzzle to play.</p>
    <label class="custom-field custom-title-field">Puzzle name <span>optional</span><input id="custom-puzzle-title" maxlength="40" placeholder="My puzzle"></label>
    <div id="custom-links-fields" class="custom-fields" hidden>
      <label class="custom-field">First starting word<input id="custom-word-one" maxlength="15" autocomplete="off" placeholder="For example, GARDEN"></label>
      <label class="custom-field">Second starting word<input id="custom-word-two" maxlength="15" autocomplete="off" placeholder="For example, BRIDGE"></label>
      <div class="custom-placement"><strong>Place your starting words</strong><div class="custom-placement-row"><button type="button" class="custom-placement-pick active" data-pick-word="one" aria-pressed="true">First word</button><input id="custom-place-one" value="A2" maxlength="3" aria-label="First word starting square" placeholder="A2"><select id="custom-dir-one" aria-label="First word direction"><option value="R">→ Right</option><option value="D">↓ Down</option><option value="L">← Left</option><option value="U">↑ Up</option></select></div><div class="custom-placement-row"><button type="button" class="custom-placement-pick" data-pick-word="two" aria-pressed="false">Second word</button><input id="custom-place-two" value="A9" maxlength="3" aria-label="Second word starting square" placeholder="A9"><select id="custom-dir-two" aria-label="Second word direction"><option value="R">→ Right</option><option value="D">↓ Down</option><option value="L">← Left</option><option value="U">↑ Up</option></select></div><div class="custom-board-picker" aria-label="Click a square to place the selected word"><div class="custom-board-corner" aria-hidden="true"></div><div id="custom-board-columns" class="custom-board-columns" aria-hidden="true"></div><div id="custom-board-rows" class="custom-board-rows" aria-hidden="true"></div><div id="custom-placement-grid" class="custom-placement-grid" role="group" aria-label="Word placement squares"></div></div><small id="custom-placement-instruction" role="status" aria-live="polite">Choose the first word, then click its starting square. Click a square to place it.</small></div>
      ${limitsMarkup('links')}
      <p class="custom-note">Use two different words from the Wordroom dictionary. Starting words must not overlap or touch.</p>
    </div>
    <div id="custom-crossword-fields" class="custom-fields" hidden>
      <label class="custom-field" for="custom-crossword-entries">Words and clues <span>one per line</span><textarea id="custom-crossword-entries" rows="9" spellcheck="false" placeholder="GARDEN | A place where flowers grow\nRIVER | Moving water headed toward a lake or sea\nBRIDGE | A structure that lets you cross a river\nFOREST | A large area covered with trees\nWINDOW | A glass opening that lets light into a room\nPLANET | A large world that travels around a star\nSTREAM | A small flowing body of water\nTHUNDER | A loud sound after lightning"></textarea></label>
      <p class="custom-note">Enter 8–24 unique dictionary words, 3–9 letters each. The game arranges eight connected answers automatically.</p>
      <details class="custom-placement-help"><summary>Choose exact crossword squares</summary><p>Use eight lines and add the start square and direction after each clue, like <strong>GARDEN | A place where flowers grow | B4 | across</strong>. Each later answer must cross exactly one earlier answer at a matching letter. Squares use A–L and rows 1–12.</p></details>
      ${limitsMarkup('crossword')}
    </div>
    <p id="custom-builder-status" class="custom-builder-status" role="status" aria-live="polite"></p>
    <div class="custom-builder-actions"><button id="custom-builder-submit" class="custom-builder-submit" type="button">Create and play <span aria-hidden="true">↗</span></button><button id="custom-share-copy" class="custom-share-copy" type="button">Copy share link <span aria-hidden="true">⤴</span></button></div>
  </section>`;
  document.body.append(overlay);

  const shareOverlay=document.createElement('div');shareOverlay.id='custom-share-welcome';shareOverlay.className='custom-builder-backdrop custom-share-backdrop';shareOverlay.hidden=true;
  shareOverlay.innerHTML=`<section class="custom-share-card" role="dialog" aria-modal="true" aria-labelledby="custom-share-title"><div class="eyebrow">A PUZZLE FOR YOU</div><h2 id="custom-share-title">A friend made you a puzzle.</h2><p id="custom-share-description"></p><button id="custom-share-open" type="button" class="custom-builder-submit">Open real game <span aria-hidden="true">↗</span></button><p id="custom-share-error" class="custom-builder-status error" role="status" hidden></p></section>`;
  document.body.append(shareOverlay);

  const completionOverlay=document.createElement('div');completionOverlay.id='custom-puzzle-complete';completionOverlay.className='custom-builder-backdrop custom-complete-backdrop';completionOverlay.hidden=true;
  completionOverlay.innerHTML=`<section class="custom-share-card custom-complete-card" role="dialog" aria-modal="true" aria-labelledby="custom-complete-title" aria-describedby="custom-complete-copy"><button class="custom-complete-close" type="button" aria-label="Close completion message">×</button><div class="eyebrow">PUZZLE COMPLETE</div><h2 id="custom-complete-title">Nicely done.</h2><p id="custom-complete-copy">You finished a puzzle made by a player.</p><button id="custom-complete-home" type="button" class="custom-builder-submit">Go to the main game <span aria-hidden="true">↗</span></button></section>`;
  document.body.append(completionOverlay);
  let completionShown=false;
  window.showCustomPuzzleCompletion=function(game){
    if(completionShown)return;
    completionShown=true;
    const crossword=game==='crossword';
    completionOverlay.querySelector('#custom-complete-title').textContent=crossword?'Crossword complete.':'Word Links complete.';
    completionOverlay.querySelector('#custom-complete-copy').textContent=crossword?'You finished a player made crossword. Head back to the main game to play another puzzle.':'You finished a player made Word Links puzzle. Head back to the main game to play another puzzle.';
    completionOverlay.hidden=false;
    completionOverlay.querySelector('#custom-complete-home').focus({preventScroll:true});
  };
  completionOverlay.querySelector('#custom-complete-home').addEventListener('click',()=>location.assign(`${location.pathname}${location.search}`));
  completionOverlay.querySelector('.custom-complete-close').addEventListener('click',()=>{completionOverlay.hidden=true;});
  completionOverlay.addEventListener('click',event=>{if(event.target===completionOverlay)completionOverlay.hidden=true;});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!completionOverlay.hidden)completionOverlay.hidden=true;});

  const linksFields=overlay.querySelector('#custom-links-fields'),crosswordFields=overlay.querySelector('#custom-crossword-fields'),status=overlay.querySelector('#custom-builder-status');
  let activeGame='links', pendingShare=null;
  let activePlacement='one';
  const placementInputs={one:overlay.querySelector('#custom-place-one'),two:overlay.querySelector('#custom-place-two')};
  const placementWordInputs={one:overlay.querySelector('#custom-word-one'),two:overlay.querySelector('#custom-word-two')};
  const placementDirections={one:overlay.querySelector('#custom-dir-one'),two:overlay.querySelector('#custom-dir-two')};
  const placementGrid=overlay.querySelector('#custom-placement-grid');
  const placementInstruction=overlay.querySelector('#custom-placement-instruction');
  overlay.querySelector('#custom-board-columns').innerHTML=Array.from({length:15},(_,i)=>`<span>${String.fromCharCode(65+i)}</span>`).join('');
  overlay.querySelector('#custom-board-rows').innerHTML=Array.from({length:15},(_,i)=>`<span>${i+1}</span>`).join('');
  function drawPlacementGrid(){
    const starts=new Map(),letters=new Map(),vectors={R:[0,1],L:[0,-1],U:[-1,0],D:[1,0]};
    for(const key of ['one','two']){
      const square=placementInputs[key].value.trim().toUpperCase().match(/^([A-O])(1[0-5]|[1-9])$/);if(!square)continue;
      const start={r:Number(square[2])-1,c:square[1].charCodeAt(0)-65};starts.set(`${start.r},${start.c}`,key);
      const word=placementWordInputs[key].value.toUpperCase().replace(/[^A-Z]/g,'').slice(0,15),[dr,dc]=vectors[placementDirections[key].value]||vectors.R;
      [...word].forEach((letter,index)=>{const r=start.r+dr*index,c=start.c+dc*index;if(r<0||r>14||c<0||c>14)return;const id=`${r},${c}`,cell=letters.get(id)||{owners:new Set(),letters:[]};cell.owners.add(key);cell.letters.push(letter);letters.set(id,cell);});
    }
    placementGrid.replaceChildren();
    for(let r=0;r<15;r++)for(let c=0;c<15;c++){
      const square=`${String.fromCharCode(65+c)}${r+1}`,button=document.createElement('button'),id=`${r},${c}`,cell=letters.get(id),startOwner=starts.get(id),owners=cell?[...cell.owners]:[];
      button.type='button';button.className='custom-placement-cell';button.textContent=cell?cell.letters.join(''):'';button.title=`${square}${cell?` · ${cell.letters.join(' / ')}${owners.length>1?' · words overlap':''}`:''}${startOwner?` · ${startOwner==='one'?'First':'Second'} word starts here`:''}`;button.setAttribute('aria-label',button.title||`${square} · empty square`);button.setAttribute('aria-pressed',String(startOwner===activePlacement));
      owners.forEach(owner=>button.classList.add(owner==='one'?'first-word':'second-word'));if(startOwner)button.classList.add('word-start');if(startOwner===activePlacement)button.classList.add('active-start');if(owners.length>1)button.classList.add('word-overlap');
      button.addEventListener('click',()=>{placementInputs[activePlacement].value=square;drawPlacementGrid();placementInstruction.textContent=`${activePlacement==='one'?'First':'Second'} word starts at ${square}. Choose the other word or create your puzzle.`;});
      placementGrid.append(button);
    }
  }
  overlay.querySelectorAll('[data-pick-word]').forEach(button=>button.addEventListener('click',()=>{activePlacement=button.dataset.pickWord;overlay.querySelectorAll('[data-pick-word]').forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active));});placementInstruction.textContent=`Click a square to place the ${activePlacement==='one'?'first':'second'} word.`;drawPlacementGrid();}));
  [...Object.values(placementInputs),...Object.values(placementWordInputs),...Object.values(placementDirections)].forEach(input=>{input.addEventListener('input',drawPlacementGrid);input.addEventListener('change',drawPlacementGrid);});
  drawPlacementGrid();
  const titleInput=()=>overlay.querySelector('#custom-puzzle-title').value.trim().slice(0,40)|| (activeGame==='links'?'My Word Links':'My Crossword');
  const settings=()=>{const fields=activeGame==='links'?linksFields:crosswordFields;const value=fields.querySelector('[data-limit="rerolls"]').value;return {hints:null,rerolls:value==='-1'?null:Number(value),easier:null};};
  const setError=message=>{status.textContent=message;status.className='custom-builder-status error';};
  function close(){overlay.hidden=true;status.textContent='';status.className='custom-builder-status';}
  function readLinks(){
    const words=[overlay.querySelector('#custom-word-one').value.trim().toUpperCase(),overlay.querySelector('#custom-word-two').value.trim().toUpperCase()];
    if(words.some(word=>!/^[A-Z]{3,15}$/.test(word)))return {error:'Enter two words that are 3–15 letters long.'};
    if(words[0]===words[1])return {error:'Choose two different starting words.'};
    if(words.some(word=>!window.isWordAccepted?.(word)))return {error:'Both starting words must be in the Wordroom dictionary.'};
    const placements=[];
    for(let i=0;i<2;i++){
      const square=overlay.querySelector(`#custom-place-${i?'two':'one'}`).value.trim().toUpperCase().match(/^([A-O])(1[0-5]|[1-9])$/);
      if(!square)return {error:`Choose a valid starting square for the ${i?'second':'first'} word, from A1 to O15.`};
      placements.push({c:square[1].charCodeAt(0)-65,r:Number(square[2])-1,dir:overlay.querySelector(`#custom-dir-${i?'two':'one'}`).value});
    }
    const vectors={R:[0,1],L:[0,-1],U:[-1,0],D:[1,0]};
    const cells=words.map((word,i)=>[...word].map((letter,k)=>({letter,r:placements[i].r+vectors[placements[i].dir][0]*k,c:placements[i].c+vectors[placements[i].dir][1]*k})));
    if(cells.flat().some(cell=>cell.r<0||cell.r>14||cell.c<0||cell.c>14))return {error:'A word would go past the board edge. Change its square or direction.'};
    if(cells[0].some(a=>cells[1].some(b=>Math.abs(a.r-b.r)<=1&&Math.abs(a.c-b.c)<=1)))return {error:'Keep the two starting words separate, with at least one empty square between them.'};
    return {words,placements};
  }
  function readCrossword(){
    const lines=overlay.querySelector('#custom-crossword-entries').value.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
    const entries=[];
    for(const line of lines){const parts=line.split('|').map(part=>part.trim());if(parts.length<2||!parts[0]||!parts[1])return {error:'Use ANSWER | clue on every line.'};const answer=parts[0].toUpperCase();if(!/^[A-Z]{3,9}$/.test(answer))return {error:'Each answer must be 3–9 letters. Remove spaces and punctuation from answers.'};if(parts[1].length>180)return {error:'Keep each clue under 180 characters so the share link stays manageable.'};const item={answer,clue:parts[1]};if(parts[2]||parts[3]){const cell=parts[2]?.toUpperCase().match(/^([A-L])(1[0-2]|[1-9])$/);const dir=parts[3]?.toLowerCase();if(!cell||!['across','down'].includes(dir))return {error:'Pinned answers need both a square (A1–L12) and a direction (across or down).'};item.col=cell[1].charCodeAt(0)-65;item.row=Number(cell[2])-1;item.dir=dir==='across'?'Across':'Down';}entries.push(item);}
    if(entries.length<8||entries.length>24)return {error:'Enter 8–24 word and clue pairs.'};
    if(new Set(entries.map(e=>e.answer)).size!==entries.length)return {error:'Each answer must be different. Remove duplicate words.'};
    if(entries.some(e=>!window.isWordAccepted?.(e.answer)))return {error:'One or more answers are not in the Wordroom dictionary.'};
    const pinned=entries.some(e=>e.row!==undefined||e.col!==undefined||e.dir);
    if(pinned&&(entries.length!==8||entries.some(e=>e.row===undefined||e.col===undefined||!e.dir)))return {error:'Exact placement needs exactly eight entries, each with a square and direction.'};
    return {entries,pinned};
  }
  function payloadForForm(){
    const title=titleInput(),limits=settings();
    if(activeGame==='links'){const result=readLinks();if(result.error)return result;return {v:1,g:'links',title,words:result.words,placements:result.placements,limits};}
    const result=readCrossword();if(result.error)return result;
    const preview=window.previewMiniCustomPuzzle?.(result.entries,title);if(!preview?.ok)return {error:preview?.message||'Those entries could not be connected.'};
    return {v:1,g:'crossword',title,entries:preview.entries,limits};
  }
  function encode(payload){const bytes=new TextEncoder().encode(JSON.stringify(payload));let binary='';bytes.forEach(byte=>binary+=String.fromCharCode(byte));return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
  function decode(token){const binary=atob(token.replace(/-/g,'+').replace(/_/g,'/'));const bytes=Uint8Array.from(binary,ch=>ch.charCodeAt(0));return JSON.parse(new TextDecoder().decode(bytes));}
  async function copyShareLink(){const payload=payloadForForm();if(payload.error){setError(payload.error);return;}const url=new URL(location.href);url.hash=`puzzle=${encode(payload)}`;if(url.href.length>8500){setError('This puzzle’s share link is too long. Shorten the clues and try again.');return;}try{await navigator.clipboard.writeText(url.href);status.className='custom-builder-status';status.textContent='Share link copied. Send it to a friend to open this puzzle.';}catch{const temp=document.createElement('textarea');temp.value=url.href;temp.style.position='fixed';temp.style.opacity='0';document.body.append(temp);temp.select();const copied=document.execCommand('copy');temp.remove();if(copied){status.className='custom-builder-status';status.textContent='Share link copied. Send it to a friend to open this puzzle.';}else setError('Your browser could not copy the link. Try copying the page address after creating the puzzle.');}}
  function openBuilder(game){completionShown=false;activeGame=game;const crossword=game==='crossword';linksFields.hidden=crossword;crosswordFields.hidden=!crossword;overlay.querySelector('#custom-builder-title').textContent=crossword?'Build a crossword':'Build a Word Links puzzle';overlay.querySelector('.custom-builder-description').textContent=crossword?'Write your own clues and place the answers, or let the game arrange a connected crossword.':'Choose two starting words, click their starting squares, and set the help available to players.';activePlacement='one';overlay.querySelectorAll('[data-pick-word]').forEach(button=>{const active=button.dataset.pickWord==='one';button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});drawPlacementGrid();placementInstruction.textContent='Choose the first word, then click its starting square. Click a square to place it.';overlay.hidden=false;status.textContent='';status.className='custom-builder-status';requestAnimationFrame(()=>overlay.querySelector(crossword?'#custom-crossword-entries':'#custom-word-one').focus());}

  document.querySelectorAll('.intro-actions,.mini-header-actions').forEach(toolbar=>{const button=document.createElement('button');button.type='button';button.className='custom-puzzle-button';button.textContent='✦ Create a puzzle';button.setAttribute('aria-haspopup','dialog');button.addEventListener('click',()=>openBuilder(toolbar.matches('.mini-header-actions')?'crossword':'links'));toolbar.prepend(button);});
  overlay.querySelector('.custom-builder-close').addEventListener('click',close);overlay.addEventListener('click',event=>{if(event.target===overlay)close();});
  overlay.querySelector('#custom-share-copy').addEventListener('click',copyShareLink);
  overlay.querySelector('#custom-builder-submit').addEventListener('click',()=>{status.className='custom-builder-status';const payload=payloadForForm();if(payload.error){setError(payload.error);return;}let result;if(payload.g==='links')result=window.createWordLinksPuzzle(payload.words[0],payload.words[1],payload.title,payload.limits,payload.placements);else result=window.createMiniCustomPuzzle(payload.entries,payload.title,payload.limits);if(!result?.ok){setError(result?.message||'The puzzle could not be created. Check the entries and try again.');return;}close();});

  function openSharedPuzzle(payload){
    completionShown=false;
    shareOverlay.hidden=true;window.SHARED_PUZZLE_ACTIVE=true;window.ageSelectionConfirmedThisLoad=true;
    document.getElementById('game-selector').hidden=true;document.getElementById('game-welcome').hidden=true;document.getElementById('welcome-modal').hidden=true;
    let result;
    if(payload.g==='links'){
      result=window.createWordLinksPuzzle(payload.words?.[0],payload.words?.[1],payload.title,payload.limits,payload.placements);
      if(result?.ok)document.getElementById('mini-modal').hidden=true;
    }else if(payload.g==='crossword'){
      result=window.createMiniCustomPuzzle(payload.entries,payload.title,payload.limits);
    }else result={ok:false,message:'This share link does not contain a supported puzzle.'};
    if(!result?.ok){window.SHARED_PUZZLE_ACTIVE=false;shareOverlay.hidden=false;const error=shareOverlay.querySelector('#custom-share-error');error.textContent=result?.message||'This puzzle link is invalid.';error.hidden=false;return;}
    document.body.classList.add('shared-puzzle-mode');
    for(const link of document.querySelectorAll('.masthead a.brand,.mini-masthead a.brand')){const label=document.createElement('span');label.className=link.className;label.textContent=link.textContent;link.replaceWith(label);}
    window.animateGameEntrance?.(payload.g==='links'?'links':'mini');
  }
  shareOverlay.querySelector('#custom-share-open').addEventListener('click',()=>{if(pendingShare)openSharedPuzzle(pendingShare);});
  shareOverlay.addEventListener('click',event=>{if(event.target===shareOverlay)shareOverlay.hidden=true;});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){if(!overlay.hidden)close();else if(!shareOverlay.hidden)shareOverlay.hidden=true;}});

  const token=new URLSearchParams(location.hash.slice(1)).get('puzzle');
  if(token){try{if(token.length>8500)throw new Error('Link too long');const payload=decode(token);if(payload?.v!==1||!['links','crossword'].includes(payload.g))throw new Error('Invalid puzzle');for(const value of Object.values(payload.limits||{}))if(value!==null&&(!Number.isInteger(value)||value<0||value>20))throw new Error('Invalid settings');pendingShare=payload;openSharedPuzzle(payload);}catch{pendingShare=null;shareOverlay.querySelector('#custom-share-title').textContent='This puzzle link is not valid.';shareOverlay.querySelector('#custom-share-description').textContent='Ask your friend to make a new share link.';shareOverlay.querySelector('#custom-share-open').hidden=true;shareOverlay.hidden=false;}}
})();
