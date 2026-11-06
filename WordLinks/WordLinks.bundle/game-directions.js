'use strict';

(() => {
  const modal=document.getElementById('game-directions-modal');
  const title=document.getElementById('directions-title');
  const description=document.getElementById('directions-description');
  const streak=document.getElementById('directions-streak');
  const eyebrow=document.getElementById('directions-eyebrow');
  const steps=document.getElementById('directions-steps');
  const levelsButton=document.getElementById('directions-levels');
  let onClose=null;
  let activeGame='links';

  const instructions={
    links:{
      eyebrow:'WORD LINKS · QUICK START',
      title:'Build a link between words.',
      description:'Connect the two green starting words with real words that cross the board.',
      steps:[
        ['Choose a starting square','Click an empty square, then choose up, down, left, or right.'],
        ['Make one matching crossing','Enter a dictionary word that crosses exactly one word already on the board, sharing its letter.'],
        ['Connect the two greens','Each letter costs 1 point. Finish the connection with the lowest total you can. Use a clue when you need help.']
      ]
    },
    crossword:{
      eyebrow:'MINI CROSSWORD · QUICK START',
      title:'Fill the grid together.',
      description:'Solve the across and down clues. Every crossing gives you a letter to work with.',
      steps:[
        ['Choose a clue','Tap an Across or Down clue, or select one of its squares to focus that answer.'],
        ['Type the answer','Enter letters in the highlighted squares. Shared squares update both crossing answers.'],
        ['Use a nudge, then check','Open a clue’s triangle for a more direct clue. Check the grid when you are ready.']
      ]
    }
  };

  function close(){
    if(modal.hidden)return;
    modal.hidden=true;
    const next=onClose;onClose=null;
    next?.();
  }

  window.showGameDirections=function(game,afterClose){
    activeGame=game==='mini'||game==='crossword'?'crossword':'links';
    const content=game==='mini'||game==='crossword'?instructions.crossword:instructions.links;
    eyebrow.textContent=content.eyebrow;
    title.textContent=content.title;
    description.textContent=content.description;
    const streakMessage=window.SHARED_PUZZLE_ACTIVE?'':activeGame==='crossword'
      ?window.getMiniStreakMessage?.()
      :window.getWordLinksStreakMessage?.();
    streak.textContent=streakMessage||'';
    streak.hidden=!streakMessage;
    levelsButton.hidden=Boolean(window.SHARED_PUZZLE_ACTIVE);
    steps.replaceChildren(...content.steps.map(([heading,copy],index)=>{
      const article=document.createElement('article');article.className='directions-step';
      const number=document.createElement('span');number.className='directions-number';number.textContent=String(index+1).padStart(2,'0');
      const text=document.createElement('div');const strong=document.createElement('strong');strong.textContent=heading;
      const paragraph=document.createElement('p');paragraph.textContent=copy;text.append(strong,paragraph);article.append(number,text);return article;
    }));
    onClose=typeof afterClose==='function'?afterClose:null;
    modal.hidden=false;
    document.getElementById('directions-continue').focus({preventScroll:true});
  };

  document.getElementById('directions-continue').addEventListener('click',close);
  levelsButton.addEventListener('click',()=>{
    const game=activeGame;
    close();
    document.dispatchEvent(new CustomEvent('game-directions:levels',{detail:{game}}));
  });
  document.getElementById('directions-close').addEventListener('click',close);
  modal.addEventListener('click',event=>{if(event.target===modal)close();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!modal.hidden)close();});
})();
