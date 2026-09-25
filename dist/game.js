'use strict';
const WORDS = new Set(`am an as at be by do go he hi if in is it me my no of on or ox so to up us we act add age ago aid aim air all also and ant any ape apple arc arch are area arm arms art arts ash ask ate aunt auto away axe baby back bad bag bake ball band bank bar bare bark barn base bat bath bay beak beam bean bear beat bed bee been bell belt bend bent berry best bet bid big bike bill bird bite black blade blame blank blast blend blind block bloom blue board boat body bold bone book boot born both bowl box boy brain branch brave bread break brick bridge bright bring broad broke brown brush bud bug build bulb burn bus bush busy but buy buzz cage cake call calm came camp can cane cap cape car card care cart case cash cat catch cave chain chair chalk charm chart chase chat cheap check cheek chest chick chief child chill chin chip choir chop city claim class clean clear cliff climb clock close cloud club clue coal coast coat code coin cold come cook cool cop corn cost cot couch could count court cover cow crab crack craft crane crash cream creek crew crop crow crown cry cup cure curl cut dad daily dance dare dark data date dawn day dead deal dear deep deer den desk dew dice did dig dim dine dirt dish dive do dock does dog doll dome done door dot down drag draw dream dress drew dried drift drill drink drive drop dry duck due dug dull dust each ear earth east easy eat echo edge eel egg eight elbow elder elm else end enter even ever every eye face fact fade fail fair fall fame fan far farm fast fat fate fear fed feed feel feet fell felt fence fern few field fig file fill film fin find fine fire firm first fish fit five fix flag flame flat flea fled flew flight flip float floor flour flow flower fly foam fog fold folk food foot for fork form fort found four fox frame free fresh friend frog from frost fruit full fun fur gain game gap garden gardens gas gate gave gem get ghost gift girl give glad glass globe glow glue goal goat gold gone good goose got grace grade grain grand grape graph grass gray great green grew grey grid grin grip grow guard guess guest guide gum guy had hair half hall ham hand hang happy hard hare harm harp has hat hate have hay he head heal heap hear heart heat heavy heel held hello help hen herb herd here hero hid hide high hill him hip hire his hit hive hold hole home honey hook hope horn horse hot hour house how huge hug hull hum hunt hurt ice idea ill ink inn into iron ivy jar jaw jazz jet job join joke joy judge juice jump just keep kept key kick kid kind king kiss kit kite knee knew knife knit knot know lace lack lad lake lamb lamp land lane large last late laugh law lawn lay leaf lean leap learn least leave led left leg lemon lend less let lid lie life lift light like limb lime line link lion lip list lit live load loaf loan lock log long look loop loose lord lose loss lost lot loud love low luck lunch lung made magic mail main make male mall man map mare mark marsh mask mast match mate math may maze meal mean meat meet melt men menu mess met metal mice middle might mile milk mill mind mint miss mist mix moan mode moon more most moss moth mouse mouth move much mud mug mule must nail name near neat neck need nest net new news next nice night nine nod noise noon nor north nose not note now nut oak oar oat ocean odd off oil old olive once one only onto open opt orbit order other our out oval oven over owl own pack page paid pain pair pale palm pan panda paper park part pass past pat path paw pay pea peace peach peak pear pen pet pick pie pig pile pill pin pine pink pipe pit place plain plan plane plant plate play plot plum plus poem poet pond pool pop port pose post pot pound pour power press price pride print prize proof proud pull pump pure push put queen quick quiet quilt quiz race rack radio raft rag rail rain raise rake ram ran range rank rat rate raw ray reach read ready real red reed reef rest rib rice rich ride right rim ring rise risk river road roam roar rob rock rode roll roof room root rope rose round row rub rug rule run rush sad safe said sail saint sake sale salt same sand sang sat save saw say sea seal seat seed seek seem seen self sell send sent serve set sew shade shake shall shape share shark sharp she shed sheep sheet shelf shell shine ship shirt shoe shop shore short shot show shy sick side sigh sight sign silk silver sin sing sink sip sir sit six size ski skill skin sky slam sleep slide slim slip slow small smart smell smile smoke snap snow so soap sock soda soft soil sold sole some son song soon sort soul sound soup sour south sow space spade spare spark speak speed spell spend spice spin spoon sport spot spring spy square stack stage stain stair stake stamp stand star start state stay steam steel stem step stick still stone stood stop store storm story stove straw stream street string strong stuck study style sub such sugar suit sum sun sung sure surf swam swan swim swing table tail take tale talk tall tame tan tank tap tape tar task taste tax tea teach team tear teeth tell ten tent term test text than thank that the their them then there these they thick thin thing think third this those three threw throw thumb tide tie tiger tile till time tin tiny tip tire toad toast toe told tone too took tool top tore torn toss total touch town toy track trade trail train trap travel tree trick tried trip true trunk try tub tuck tune turn twig twin two type ugly under unit until upon use used user usual van vase vast very vest vet view vine visit voice vote wait wake walk wall want war warm warn was wash waste watch water wave wax way weak wear web week well went were west wet whale what wheat wheel when where which while white who whole why wide wild will win wind wine wing winter wire wise wish wit with wolf woman won wood wool word work world worm worn worth would wrap yard yarn year yell yes yet you young your zero zip zone zoo`.toUpperCase().split(/\s+/));
for (const word of WORD_LINKS_DICTIONARY.split(" ")) WORDS.add(word);
const PUZZLES = [['LIGHT','SOUND','THE FIRST CONNECTION'],['NIGHT','SHORE','AFTER HOURS'],['SIGHT','STONE','A DIFFERENT PERSPECTIVE'],['RIVER','GARDEN','GREEN THINGS'],['BRIDGE','STONE','CROSSING OVER'],['MUSIC','DANCE','THE RHYTHM'],['OCEAN','ISLAND','OPEN WATER'],['PAPER','PENCIL','ON THE PAGE']];
let words=[], selected=null, direction='H', score=0, won=false, puzzleIndex=-1, activeClue=null, clueRerolls=3, clueOptions=[], clueIndex=0;
const $ = id => document.getElementById(id);
const cells = word => [...word.text].map((letter,i)=>({r:word.r+(word.dir==='V'?i:0),c:word.c+(word.dir==='H'?i:0),letter}));
function boardMap(){const map=new Map();words.forEach((w,id)=>cells(w).forEach(p=>{const key=p.r+','+p.c;const v=map.get(key)||{letter:p.letter,ids:[]};v.ids.push(id);map.set(key,v);}));return map;}
function components(){const parents=words.map((_,i)=>i);const root=i=>parents[i]===i?i:(parents[i]=root(parents[i]));for(const p of boardMap().values())for(const id of p.ids)parents[root(id)]=root(p.ids[0]);return words.map((_,i)=>root(i));}
function validate(text,r,c,dir){
  if(won)return {error:'Connection complete! Replay for a new puzzle.'};
  if(!/^[A-Z]{2,15}$/.test(text))return {error:'Enter a word with 2–15 letters.'};
  if(!WORDS.has(text))return {error:'That word is not in this edition’s word list. Try another, or use a clue.'};
  if(words.some(w=>w.text===text))return {error:'That word is already on the board.'};
  const map=boardMap(),path=cells({text,r,c,dir}),crossed=new Set();let added=0;
  if(path.some(p=>p.r<0||p.r>14||p.c<0||p.c>14))return {error:'That word extends beyond the board. Choose another starting square.'};
  for(const p of path){const old=map.get(p.r+','+p.c);if(old){if(old.letter!==p.letter)return {error:'Crossing letters must match. Check the preview on the board.'};for(const id of old.ids){if(words[id].dir===dir)return {error:'Words must cross, rather than overlap in the same direction.'};crossed.add(id);}}else{added++;const neighbors=dir==='H'?[[p.r-1,p.c],[p.r+1,p.c]]:[[p.r,p.c-1],[p.r,p.c+1]];if(neighbors.some(([rr,cc])=>map.has(rr+','+cc)))return {error:'Leave a blank square beside words, except where they cross.'};}}
  const last=path[path.length-1];if(map.has((r-(dir==='V'?1:0))+','+(c-(dir==='H'?1:0)))||map.has((last.r+(dir==='V'?1:0))+','+(last.c+(dir==='H'?1:0))))return {error:'Leave a blank square before and after your word.'};
  const roots=components(),groups=new Set([...crossed].map(id=>roots[id]));const bridge=crossed.size===2&&groups.size===2&&groups.has(roots[0])&&groups.has(roots[1]);
  if(crossed.size!==1&&!bridge)return {error:'Cross exactly one existing word, or cross one word from each group to finish.'};
  if(!added)return {error:'Your word must add new letters.'};return {bridge,cost:10+text.length};
}
function feedback(message,type=''){ $('feedback').textContent=message;$('feedback').className='feedback '+type; }
function render(){const map=boardMap();const preview=selected?cells({text:$('word').value.toUpperCase().replace(/[^A-Z]/g,''),...selected,dir:direction}):[];const pm=new Map(preview.map(p=>[p.r+','+p.c,p.letter]));
  const clueEnds=activeClue?new Set([`${activeClue.r},${activeClue.c}`,`${cells(activeClue).at(-1).r},${cells(activeClue).at(-1).c}`]):new Set();
  [...$('grid').children].forEach((button,i)=>{const r=Math.floor(i/15),c=i%15,key=r+','+c,old=map.get(key),letter=pm.get(key);button.className='cell';if(old)button.classList.add(old.ids.some(id=>id<2)?'start':'placed');if(letter)button.classList.add(old&&old.letter!==letter?'invalid':'preview');if(clueEnds.has(key))button.classList.add(key===`${activeClue.r},${activeClue.c}`?'clue-start':'clue-end');if(selected&&r===selected.r&&c===selected.c)button.classList.add('selected');button.textContent=old?.letter||letter||'';button.setAttribute('aria-label',`${String.fromCharCode(65+c)}${r+1}${old?', '+old.letter:letter?', preview '+letter:clueEnds.has(key)?', clue endpoint':', empty'}`);button.setAttribute('aria-pressed',String(Boolean(selected&&r===selected.r&&c===selected.c)));});
  $('selection-label').textContent=selected?`Starts at ${String.fromCharCode(65+selected.c)}${selected.r+1}`:'Start at a square';$('cost').textContent=$('word').value?`${10+$('word').value.length} points`:'10 + letters';$('score').textContent=score;$('link-count').textContent=`${words.length-2} link${words.length===3?'':'s'} placed`;
}
function setDirection(dir){direction=dir;for(const [id,value]of [['horizontal','H'],['vertical','V']]){$(id).classList.toggle('active',dir===value);$(id).setAttribute('aria-pressed',String(dir===value));}render();}
function submitWord(text,r,c,dir){if(!Number.isInteger(r)||!Number.isInteger(c)||!['H','V'].includes(dir))return {error:'Choose a starting square and direction.'};text=String(text).trim().toUpperCase();const result=validate(text,r,c,dir);if(result.error){feedback(result.error,'error');return result;}words.push({text,r,c,dir});score+=result.cost;won=result.bridge;$('word').value='';clearClue();feedback(won?`Connected! You joined ${words[0].text} and ${words[1].text} in ${score} points. ${window.DAILY_MODE?'Your daily result is saved below.':'Your level result is saved below.'}`:`${text} linked. +${result.cost} points. Keep the connection going.`, 'success');$('word').disabled=won;document.querySelector('.submit').disabled=won;$('clue').disabled=won;render();if(won&&typeof window.wordLinksCompleted==='function')window.wordLinksCompleted({score,words:words.map(w=>w.text),mode:window.DAILY_MODE?'daily':'extra',level:window.EXTRA_LEVEL||null});return {word:text,score,complete:won};}
function seededRandom(seed){let state=2166136261;for(const char of String(seed)){state^=char.charCodeAt(0);state=Math.imul(state,16777619);}return()=>{state+=state<<13;state^=state>>>7;state+=state<<3;state^=state>>>17;state+=state<<5;return (state>>>0)/4294967296;};}
function randomStartingWords(a,b,seed){const random=seed===undefined?Math.random:seededRandom(seed);for(let attempt=0;attempt<200;attempt++){const first={text:a,r:Math.floor(random()*15),c:Math.floor(random()*(16-a.length)),dir:'H'};const second={text:b,r:Math.floor(random()*15),c:Math.floor(random()*(16-b.length)),dir:'H'};const firstCells=cells(first),secondCells=cells(second);if(first.r===second.r&&firstCells.some(x=>secondCells.some(y=>x.c===y.c)))continue;if(firstCells.some(x=>secondCells.some(y=>Math.abs(x.r-y.r)<=1&&Math.abs(x.c-y.c)<=1)))continue;return [first,second];}return [{text:a,r:1,c:1,dir:'H'},{text:b,r:12,c:7,dir:'H'}];}
function startGame(){puzzleIndex=(puzzleIndex+1)%PUZZLES.length;const puzzle=window.EXTRA_PUZZLE||window.DAILY_PUZZLE||PUZZLES[puzzleIndex];const[a,b,name]=puzzle;const seed=window.DAILY_MODE?window.DAILY_SEED:window.EXTRA_LEVEL?window.EXTRA_SEED:undefined;words=window.DAILY_MODE&&Array.isArray(window.DAILY_LAYOUT)?window.DAILY_LAYOUT.map(word=>({...word})):randomStartingWords(a,b,seed);window.STARTING_WORDS=words.map(word=>({...word}));score=0;won=false;selected=null;activeClue=null;clueRerolls=3;clueOptions=[];clueIndex=0;$('word').value='';$('word').disabled=false;document.querySelector('.submit').disabled=false;$('clue').disabled=false;clearClue();$('puzzle-name').textContent=name;$('puzzle-mode').textContent=window.DAILY_MODE?'DAILY CHALLENGE':window.EXTRA_LEVEL?'EXTRA LEVEL '+window.EXTRA_LEVEL:'EXTRA PUZZLE';$('start-one').textContent=a;$('start-two').textContent=b;feedback('Connect the two green words to finish.');setDirection('H');}
for(let i=0;i<15;i++){$('column-labels').append(Object.assign(document.createElement('span'),{textContent:String.fromCharCode(65+i)}));$('row-labels').append(Object.assign(document.createElement('span'),{textContent:i+1}));}
for(let i=0;i<225;i++){const b=document.createElement('button');b.type='button';b.addEventListener('click',()=>{if(won)return;selected={r:Math.floor(i/15),c:i%15};render();$('word').focus();});b.addEventListener('keydown',e=>{const offset={ArrowLeft:-1,ArrowRight:1,ArrowUp:-15,ArrowDown:15}[e.key];if(offset!==undefined){e.preventDefault();$('grid').children[Math.max(0,Math.min(224,i+offset))].focus();}});$('grid').append(b);}
$('horizontal').addEventListener('click',()=>setDirection('H'));$('vertical').addEventListener('click',()=>setDirection('V'));$('word').addEventListener('input',render);$('word-form').addEventListener('submit',e=>{e.preventDefault();if(!selected){feedback('Click the square where your word should begin.','error');return;}submitWord($('word').value,selected.r,selected.c,direction);});
document.querySelectorAll('.replay').forEach(b=>b.addEventListener('click',startGame));
function clearClue() {
  activeClue = null;
  clueOptions = [];
  clueIndex = 0;
  $('clue-text').hidden = true;
  $('clue-text').textContent = '';
  $('easier-clue-text').hidden = true;
  $('easier-clue-text').textContent = '';
  $('easier-clue').hidden = true;
  $('reroll-clue').hidden = true;
  $('clue').setAttribute('aria-expanded', 'false');
  if ($('grid')?.children.length) render();
}

function findClues() {
  const roots=components(), targetCells=words.slice(1).flatMap(cells);
  const candidates=[];
  const seen=new Set();
  for (const text of Object.keys(WORD_CLUES)) {
    if (!WORDS.has(text) || words.some(w => w.text === text)) continue;
    for (const word of words) {
      const dir = word.dir === 'H' ? 'V' : 'H';
      for (const square of cells(word)) {
        for (let i = 0; i < text.length; i++) {
          if (text[i] !== square.letter) continue;
          const r = square.r - (dir === 'V' ? i : 0);
          const c = square.c - (dir === 'H' ? i : 0);
          const move={text,r,c,dir};
          if (!validate(text,r,c,dir).error) {
            const path=cells(move); const distance=Math.min(...path.flatMap(p=>targetCells.map(t=>Math.abs(p.r-t.r)+Math.abs(p.c-t.c))));
            const wordIndex=words.indexOf(word); const useful=roots[wordIndex]===roots[0]&&roots[wordIndex]!==roots[1];
            const key=`${text}:${r}:${c}:${dir}`;
            if (!seen.has(key)) { seen.add(key); candidates.push({move,distance,priority:useful?0:1}); }
          }
        }
      }
    }
  }
  candidates.sort((a,b)=>a.priority-b.priority||a.distance-b.distance);
  return candidates.map(candidate => candidate.move);
}

function clueMessage(move) {
  if (!move) return 'No word clue fits this layout yet. Easier route hint: choose a highlighted start box, use the highlighted end box, and enter a word that crosses the existing word there. The next useful word will move toward the second green word.';
  const end = cells(move).at(-1);
  const coordinate = p => `${String.fromCharCode(65+p.c)}${p.r+1}`;
  const board=boardMap(); const crossing=cells(move).find(p=>board.has(`${p.r},${p.c}`));
  const anchor=crossing?words.find(word=>cells(word).some(p=>p.r===crossing.r&&p.c===crossing.c)):null;
  const clue=WORD_CLUES[move.text] || 'A word that fits the highlighted route and helps connect the two green words.';
  const next=words[1]?.text?`After placing it, look for the next legal crossing that moves toward ${words[1].text}.`:'Use the highlighted route to continue the connection.';
  return `Start at ${coordinate(move)} · End at ${coordinate(end)}\n${move.dir === 'H' ? 'Across' : 'Down'} · ${move.text.length} letters\nClue: ${clue}\n${next}`;
}

function easierClueMessage(move) {
  if (!move) return 'Try the highlighted route and look for a word that crosses the existing word.';
  const end = cells(move).at(-1);
  const coordinate = p => `${String.fromCharCode(65+p.c)}${p.r+1}`;
  const board=boardMap(); const crossing=cells(move).find(p=>board.has(`${p.r},${p.c}`));
  const anchor=crossing?words.find(word=>cells(word).some(p=>p.r===crossing.r&&p.c===crossing.c)):null;
  return `Easier clue: starts with “${move.text[0]}”, has ${move.text.length} letters, and crosses ${anchor?.text || 'the existing word'} at ${crossing?coordinate(crossing):'the highlighted box'}. It ends at ${coordinate(end)}.`;
}

function showClue(move) {
  activeClue = move;
  $('clue-text').textContent = clueMessage(activeClue);
  $('clue-text').hidden = false;
  $('easier-clue').hidden = false;
  $('reroll-clue').hidden = false;
  $('reroll-clue').textContent = `↻ Reroll clue (${clueRerolls} left)`;
  $('clue').setAttribute('aria-expanded', 'true');
  render();
}

$('clue').addEventListener('click', () => {
  if (!$('clue-text').hidden) { clearClue(); return; }
  clueOptions = findClues();
  clueIndex = 0;
  showClue(clueOptions[clueIndex] || null);
});
$('reroll-clue').addEventListener('click', () => {
  if (clueRerolls < 1) return;
  if (!clueOptions.length || clueOptions.length < 2) { feedback('There is no different legal clue for this layout yet.','error'); return; }
  clueRerolls -= 1;
  clueIndex = (clueIndex + 1) % clueOptions.length;
  showClue(clueOptions[clueIndex]);
});
$('easier-clue').addEventListener('click', () => {
  $('easier-clue-text').textContent = easierClueMessage(activeClue);
  $('easier-clue-text').hidden = false;
  $('easier-clue').hidden = true;
});
$('dictionary-info').textContent = `${WORDS.size.toLocaleString()} accepted words, 2–15 letters long. The list combines the ENABLE word-game dictionary with this edition’s original words. Names, abbreviations, and hyphenated words may not be accepted.`;

startGame();
if(document.modelContext?.registerTool){try{Promise.resolve(document.modelContext.registerTool({name:'place_word',description:'Place and score a word in Word Links. Rows and columns are zero-based; direction is H or V.',inputSchema:{type:'object',properties:{word:{type:'string'},row:{type:'integer',minimum:0,maximum:14},column:{type:'integer',minimum:0,maximum:14},direction:{type:'string',enum:['H','V']}},required:['word','row','column','direction'],additionalProperties:false},execute:input=>submitWord(input.word,input.row,input.column,input.direction)})).catch(()=>{});}catch{}}
