'use strict';

const MINI_SIZE = 12;

const MINI_WORDS = [
  ['CAT','A small pet that purrs.'], ['DOG','A pet that barks.'],
  ['SUN','The star that lights our days.'], ['MAP','A drawing that helps you find your way.'],
  ['HAT','Something you wear on your head.'], ['BED','Where you sleep at night.'],
  ['CUP','A small container for a drink.'], ['BEE','An insect that makes honey.'],
  ['KEY','It unlocks a door.'], ['OWL','A bird known for its nighttime hoot.'],
  ['TREE','A tall plant with a trunk.'], ['BOOK','Its pages tell a story.'],
  ['LAMP','A light you might put beside your bed.'], ['FISH','An animal with fins and gills.'],
  ['MOON','Earth’s natural companion in the night sky.'], ['RAIN','Water falling from clouds.'],
  ['BOAT','A small craft that floats on water.'], ['CAKE','A sweet treat with birthday candles.'],
  ['STAR','A distant light that twinkles at night.'], ['KITE','It flies on the end of a string.'],
  ['APPLE','A crunchy fruit that can be red or green.'], ['HOUSE','A building where people live.'],
  ['BEACH','A sandy place beside the sea.'], ['CLOUD','A fluffy shape floating in the sky.'],
  ['TRAIN','It carries passengers along tracks.'], ['BREAD','You use slices of it for a sandwich.'],
  ['CHAIR','A seat with a back and usually four legs.'], ['RIVER','Water flowing toward a lake or sea.'],
  ['MUSIC','Sounds arranged into a song.'], ['TIGER','A large cat with stripes.'],
  ['GARDEN','A place where people grow flowers.'], ['ORANGE','A citrus fruit with the same name as a color.'],
  ['BRIDGE','A structure that lets you cross a river.'], ['FLOWER','The colorful part of a plant that may smell sweet.'],
  ['RABBIT','A long-eared animal that hops.'], ['PENCIL','A writing tool with an eraser on one end.'],
  ['WINDOW','A glass opening that lets light into a room.'], ['FOREST','A large area covered with trees.'],
  ['TURTLE','A slow-moving animal with a shell.'], ['BASKET','A woven container with a handle.'],
  ['RAINBOW','A colorful arc that can appear after rain.'], ['BALLOON','An air-filled party decoration.'],
  ['BICYCLE','A two-wheeled vehicle powered by pedals.'], ['DOLPHIN','A playful sea mammal with a curved fin.'],
  ['KITCHEN','The room where meals are cooked.'], ['PENGUIN','A black-and-white bird that waddles and swims.'],
  ['GIRAFFE','An animal with a very long neck.'], ['LIBRARY','A place where you can borrow books.'],
  ['PANCAKE','A round breakfast food often served with syrup.'], ['FEATHER','A light covering on a bird.'],
  ['ELEPHANT','A very large animal with a trunk.'], ['UMBRELLA','You hold this above your head to stay dry.'],
  ['SANDWICH','A meal made with filling between slices of bread.'], ['MOUNTAIN','A very high natural rise in the land.'],
  ['NOTEBOOK','A book of blank pages for writing.'], ['FOOTBALL','A sport played with a ball and two teams.'],
  ['BACKPACK','A bag carried over both shoulders.'], ['SNOWFLAKE','A tiny ice crystal that falls in winter.'],
  ['BUTTERFLY','An insect with large, colorful wings.'], ['CHOCOLATE','A sweet treat made from cocoa.'],
  ['SUNFLOWER','A tall flower with a large yellow head.'], ['PINEAPPLE','A tropical fruit with spiky leaves on top.']
].map(([answer,clue]) => ({answer,clue}));

// Daily crossword answers come from the site's accepted-word dictionary and
// use its authored clue bank, so every generated entry is both valid and fair.
const MINI_DAILY_WORDS = [...new Map([
  ...Object.entries(WORD_CLUES).filter(([answer]) => WORDS.has(answer)).map(([answer, clue]) => ({answer, clue})),
  ...MINI_WORDS
].filter(word => word.answer.length >= 3 && word.answer.length <= 9)
  .map(word => [word.answer, word])).values()];
const MINI_LEVEL_EXTRA_WORDS = [
  {answer:'AIRPLANE',clue:'It carries passengers between airports.'},
  {answer:'BIRTHDAY',clue:'A special day that comes once each year.'},
  {answer:'BASEBALL',clue:'A bat, a glove, and four bases belong to this sport.'},
  {answer:'COMPUTER',clue:'You can use this machine to write, browse, and play.'},
  {answer:'TREASURE',clue:'Gold or jewels hidden away might be called this.'},
  {answer:'CARNIVAL',clue:'A lively fair with rides, games, and treats.'},
  {answer:'SEASHELL',clue:'A hard, often spiral-shaped find on a beach.'},
  {answer:'ADVENTURE',clue:'An exciting experience filled with discovery.'},
  {answer:'WATERFALL',clue:'A stream plunges over a steep edge to make one.'},
  {answer:'NEWSPAPER',clue:'A printed publication filled with articles and headlines.'},
  {answer:'FIREPLACE',clue:'A built-in place where a room can have a fire.'},
  {answer:'HOSPITAL',clue:'Doctors and nurses care for patients in this place.'},
  {answer:'RAINSTORM',clue:'A period of heavy rain, often with wind and thunder.'},
  {answer:'LEMONADE',clue:'A tart, refreshing drink made with lemons.'},
  {answer:'FOOTPATH',clue:'A narrow route intended for people walking.'},
  {answer:'LANDMARK',clue:'A notable place that helps people recognize an area.'},
  {answer:'KEYSTONE',clue:'The central stone that locks an arch in place.'},
  {answer:'PASTRIES',clue:'Sweet or savory baked goods made from dough.'},
  {answer:'SUNRISES',clue:'The first appearances of the sun above the horizon.'},
  {answer:'WILDFLOWER',clue:'A bloom that grows naturally without being planted in a garden.'},
  {answer:'TELEPHONE',clue:'A device used to call someone far away.'},
  {answer:'NOTEBOOKS',clue:'Books of blank pages used for writing.'},
  {answer:'BACKYARD',clue:'The outdoor space just behind a home.'},
  {answer:'MOONLIGHT',clue:'The soft glow seen outdoors at night.'},
  {answer:'SNOWSTORM',clue:'A heavy fall of snow with strong winds.'}
];
const MINI_LEVEL_WORDS = [...new Map([
  ...MINI_WORDS,
  ...Object.entries(WORD_CLUES).map(([answer, clue]) => ({answer, clue})),
  ...MINI_LEVEL_EXTRA_WORDS
].filter(word => WORDS.has(word.answer) && word.answer.length >= 3 && word.answer.length <= 9)
  .map(word => [word.answer, word])).values()];
const MINI_DAILY_GENERATOR_VERSION = 6;

const MINI_LEVELS = [
  ['First steps','Easy',3,4],['Bright beginnings','Easy',3,4],['Little by little','Easy',3,5],['Word paths','Easy',3,5],['Crossing clues','Easy',4,5],
  ['A longer look','Medium',4,6],['Steady solver','Medium',4,6],['More to discover','Medium',5,6],['Clever crossings','Medium',5,7],['The word trail','Medium',5,7],
  ['Brain stretch','Hard',6,7],['Thoughtful links','Hard',6,8],['Expert eyes','Hard',7,8],['Deep crossword','Hard',7,9],['Master puzzle','Expert',8,9]
].map(([name,difficulty,minLength,maxLength])=>({name,difficulty,minLength,maxLength}));

const ADDITIONAL_MINI_LEVELS = [
  ['Crossing point','Medium',5,7],['Word garden','Medium',5,7],['Steady clues','Medium',5,8],['The long way','Medium',6,8],['Clue builder','Hard',6,8],
  ['Pattern finder','Hard',6,9],['Careful crossing','Hard',6,9],['Letter craft','Hard',7,9],['Deep grid','Hard',7,9],['The upper tier','Hard',7,9],
  ['Expert crossing','Expert',7,9],['Nine by nine','Expert',7,9],['Sharp solver','Expert',8,9],['Clue master','Expert',8,9],['The final stretch','Expert',8,9],
  ['Master grid','Master',7,9],['Last crossing','Master',7,9],['Word architect','Master',7,9],['The great weave','Master',7,9],['Grand finale','Master',7,9]
];
MINI_LEVELS.push(...ADDITIONAL_MINI_LEVELS.map(([name,difficulty,minLength,maxLength])=>({name,difficulty,minLength,maxLength})));

// Easier hints explain the answer in everyday language without spelling it out.
const MINI_EASY_HINTS = {
  GARDEN:"This is where flowers, vegetables, and other plants grow.", GARDENS:"These are places where flowers, vegetables, and other plants grow.", STAR:"Astronomers group these into patterns called constellations.", ALSO:"In “I like the book, and I ___ like the film,” fill in this word.", HAT:"A cap, beanie, or sunhat is one.", KEY:"Turn this in a lock when you want to open a door.", MAP:"It may show a compass rose and a scale for measuring distance.",
  RIVER:"A bridge may take you over one, and it may flow into a sea.", FLOWER:"A bee may visit one, and a bouquet is made of them.", TREE:"Birds may nest among its branches; its trunk has bark.", LEAF:"In autumn, many turn yellow, orange, or red.", ROOT:"Carrots and beets are examples of edible ones.", SEED:"Put one in soil and water it to start a plant.", STEM:"A florist trims this part before putting a bloom in a vase.", ROSE:"Its stem often has thorns, and red is a familiar color for it.", TULIP:"This spring bloom is strongly associated with the Netherlands.", DAISY:"People sometimes pluck its petals while saying “loves me, loves me not.”", GRASS:"You might mow it on a weekend.", FOREST:"Deer, birds, and squirrels may all live among its trees.", OCEAN:"Whales, coral reefs, and deep-sea trenches are found here.", LAKE:"People may go boating or fishing on one, with land all around.", POND:"A lily pad or a frog may float in one.", STREAM:"You might hear this trickling beside a hiking path.", BEACH:"People build sandcastles and look for shells here.", ISLAND:"A boat or plane may be the only way to reach one.", HILL:"You may roll down one or climb to its top.", VALLEY:"A river often winds through the low ground between the slopes.", CLOUD:"A plane can fly through one, and it may bring rain.", RAIN:"People carry umbrellas to avoid getting wet from this.", SNOW:"Children may make a snowman after this falls.", WIND:"It can turn a pinwheel or fill a sail.", STORM:"Lightning and thunder may arrive with this weather.", SUN:"Earth orbits this, and plants need its light.", MOON:"It changes shape in the sky over the course of a month.", SPACE:"Astronauts travel here in rockets.", EARTH:"It is the third planet from the Sun.", FIRE:"A campfire can toast marshmallows, but never leave one unattended.", WATER:"A glass of this is often offered when someone is thirsty.", ICE:"Skates glide across this when a pond freezes.", AIR:"A balloon fills with this invisible mixture.", SAND:"A handful of this slips between your fingers at the shore.", STONE:"You might skip a flat one across a pond.",
  BRIDGE:"The Golden Gate is a famous example of this structure.", ROAD:"Drivers follow painted lanes along this route.", PATH:"A garden may have a stepping-stone one winding through it.", TRAIL:"Hikers follow colored markers along one in a park.", TRAIN:"It stops at stations and pulls a line of passenger cars.", BOAT:"It may have oars, a sail, or a motor.", SHIP:"A captain steers this large vessel across the ocean.", PLANE:"Passengers buckle their seat belts before takeoff in one.", CAR:"A steering wheel and pedals help you control one.", BIKE:"A helmet and two wheels are clues to this ride.", HOUSE:"It may have a front porch, a chimney, and several rooms.", HOME:"People often say “there’s no place like ___.”", DOOR:"A knob or handle helps you open this.", WINDOW:"Curtains hang on either side of this opening.", ROOF:"Rain runs off this top part into gutters.", ROOM:"A bedroom and kitchen are each one of these.", CHAIR:"A table is often surrounded by several of these seats.", TABLE:"People gather around this for dinner or homework.", BED:"A pillow and blanket usually go on this.", LAMP:"A switch turns this bedside object on and off.", BOOK:"A library lends these, and a reader turns their pages.", PAGE:"An author’s words fill one side of this sheet.", STORY:"It may begin “Once upon a time.”", POEM:"Its lines may rhyme, though they do not have to.", PEN:"A signature is often written with this ink tool.", PENCIL:"A sharpener makes its point ready for writing.", PAPER:"A printer feeds sheets of this into its tray.", WORD:"A sentence is made from several of these.", LETTER:"A mailbox may deliver one written to you.", MUSIC:"A melody and beat combine to make this sound.", SONG:"A chorus is the part people often sing along to.", DANCE:"At a wedding, guests may move to the band’s rhythm.", PIANO:"A pianist presses keys with both hands.", DRUM:"A drummer keeps the beat by striking this instrument.", BELL:"A school may ring this to signal the end of class.", CLOCK:"Its hands may point to the hour and minute.", TIME:"A calendar and a watch help people keep track of this.", DAY:"It starts at midnight and ends at the next midnight.", NIGHT:"Stars are easiest to spot during this part of the day.", YEAR:"People celebrate a birthday once during each of these.", SPRING:"This season follows winter; many trees begin to bud.", SUMMER:"School vacations and long sunny afternoons often happen then.", WINTER:"Coats, scarves, and hot cocoa are common during this season.",
  APPLE:"A pie made with cinnamon often uses this fruit.", PEAR:"Its shape is wide at the bottom and narrow at the top.", PEACH:"Its fuzzy skin surrounds a large stone-like pit.", GRAPE:"A bunch of these can be green or purple; dried ones are raisins.", LEMON:"A wedge of this sour fruit is often served with tea or fish.", BREAD:"Toast and sandwiches are commonly made from slices of this.", CAKE:"Candles are often placed on top at a birthday party.", SOUP:"People may dip crackers or bread into a bowl of this.", SALT:"A tiny pinch of this can bring out the flavor in food.", SUGAR:"People stir this into coffee to make it sweeter.", HONEY:"A bear in a story might look for a jar of this.", MILK:"Cows produce this; people often pour it over cereal.", TEA:"A tea bag steeps in hot water to make this drink.", CUP:"A handle often helps you hold this while drinking.", SPOON:"This utensil has a rounded bowl at one end.", FORK:"Its tines help pick up pieces of food.", PLATE:"A dinner setting usually puts one at each seat.",
  CAT:"It may chase a ball of yarn and nap in a sunny spot.", DOG:"It may fetch a stick when you throw it.", BIRD:"A nest is where many of these lay their eggs.", FISH:"Gills help it breathe underwater.", HORSE:"A saddle is placed on its back for a rider.", SHEEP:"A shepherd may care for a flock of these.", GOAT:"It may climb rocky slopes and nibble anything nearby.", DUCK:"It may paddle across a pond and say “quack.”", FROG:"It catches insects with a long, sticky tongue.", BEAR:"It may hibernate in a den during winter.", FOX:"In fables, this clever animal often outsmarts others.", WOLF:"Its howl can be heard across a forest at night.", LION:"In a zoo, you may recognize the male by his mane.", TIGER:"Its striped coat helps it blend into tall grasses.", OWL:"Its large eyes help it hunt after dark.", EAGLE:"This bird’s nest is called an eyrie.", BEE:"It carries pollen between blossoms and makes honey.", ANT:"A picnic crumb can attract a whole trail of these insects.", WORM:"After rain, one may wriggle across the sidewalk.", SHELL:"A beachcomber might find one left behind by a snail.", WING:"Birds flap these; airplanes have them too.", TAIL:"A dog may wag this when it is excited.", HAND:"You clap by bringing these together.", FOOT:"A shoe goes on this body part.", EYE:"You blink this body part to keep it moist.", EAR:"An earring may hang from this part of your head.", NOSE:"A tissue may be used to wipe this part of your face.", HEART:"A doctor listens to this organ with a stethoscope.", SMILE:"People often show this in a happy photograph.", DREAM:"The strange scenes in your sleep may be one of these.", HOPE:"“I think it will work out” expresses this feeling.", LOVE:"A heart symbol is often used to represent this feeling.", FRIEND:"You might invite this person over to play or talk.", KIND:"Someone who shares and helps others is acting this way.", BRAVE:"A firefighter entering a rescue is showing this quality.", CALM:"Take a slow breath to feel more like this.", HAPPY:"A celebration may leave you feeling this way.", QUIET:"A library asks visitors to keep their voices this way.", QUICK:"A rabbit is known for moving this way.", SLOW:"A turtle is famous for moving this way.",
  GREEN:"A traffic light uses this color to say “go.”", BLUE:"Mixing this color with yellow makes green.", RED:"A stop sign is usually painted this color.", GOLD:"Olympic winners often receive a medal made to look like this metal.", SILVER:"A second-place medal is often made to look like this metal.", WHITE:"A blank sheet and a wedding dress are often this color.", BLACK:"A chalkboard or a raven is often this color.", LIGHT:"A lamp produces this so you can read after dark.", SOUND:"A bell ringing or a dog barking makes this.", SHORE:"Waves break against the edge of land here.", SIGHT:"A person who can use their eyes has this sense.", NORTH:"On most maps, this direction is at the top.", SOUTH:"On a U.S. map, Florida is far in this direction.", EAST:"On a map of the U.S., the Atlantic coast is on this side.", WEST:"On a map of the U.S., California is on this side.",
  KITE:"A long string keeps this toy from blowing away.", BOOKS:'You read these collections of pages.', ORANGE:"Peel this fruit before eating its juicy segments.", RABBIT:"It may thump the ground with its back feet.", WINDOW:"Curtains hang on either side of this opening.", TURTLE:"It can pull its head and legs inside its shell.", BASKET:"A handle makes this container easy to carry.", RAINBOW:"Its arc can show red, orange, yellow, green, blue, and violet.", BALLOON:"At a party, these are often tied to a chair with ribbon.", BICYCLE:"Pedaling turns its chain and rear wheel.", DOLPHIN:"It leaps above waves and communicates with clicks.", KITCHEN:"A stove, sink, and refrigerator are usually found here.", PENGUIN:"It cannot fly, but it can swim quickly in icy water.", GIRAFFE:"Its long neck helps it reach leaves high in trees.", LIBRARY:"Visitors can borrow books and return them here.", PANCAKE:"Maple syrup is often poured over a stack of these.", FEATHER:"It may drift down when a bird molts.", ELEPHANT:"Its trunk can pick up food and spray water.", UMBRELLA:"Open this over yourself before walking through a downpour.", SANDWICH:"A lunchbox favorite often has filling between two slices.", MOUNTAIN:"Climbers may need ropes and a base camp to reach its summit.", NOTEBOOK:"Students write class notes between its covers.", FOOTBALL:"A quarterback throws this oval ball to a teammate.", BACKPACK:"Shoulder straps help carry school supplies in this bag.", SNOWFLAKE:"Under a microscope, each one has a delicate icy pattern.", BUTTERFLY:"It begins as a caterpillar before growing colorful wings.", CHOCOLATE:"It may be eaten as a bar or melted into a cake.", SUNFLOWER:"Its large yellow head holds seeds that birds like to eat.", PINEAPPLE:"Twist off its leafy crown before slicing the tropical fruit."
};

Object.assign(MINI_EASY_HINTS, {
  ANCHOR:"A boat drops this heavy object so it stays in one place.", COMPASS:"A hiker can use this to find north.", CRATER:"The moon has round, bowl-shaped marks made by impacts.", HABITAT:"An animal’s home in nature might be a forest, pond, or desert.", INSECT:"Ants, bees, and butterflies are examples of these tiny animals.", MAGNET:"This can pick up a paper clip from a table.", GLACIER:"A huge river of ice can slowly move down a mountain.", MIGRATE:"Some birds do this by flying to warmer places for winter.", MINERAL:"Quartz and salt are examples found in rocks and soil.", OBSERVE:"A scientist might do this by watching something closely.", PLANET:"Earth is one; it travels around the Sun.", PROTEIN:"Eggs, beans, and fish contain this nutrient.", REFLECT:"A mirror does this with light, sending it back.", REGION:"A map may divide a country into areas like this.", SPECIES:"Lions and tigers are different kinds of this group.", SURFACE:"The top or outside layer of something is its ___. ", THUNDER:"You hear this rumbling sound after lightning flashes.", JOURNEY:"A long trip to a new place can be called this.", PATTERN:"Stripes, polka dots, or a repeated sequence can form one.", CURRENT:"A river’s moving water can flow in this direction.", CURIOUS:"Someone who asks lots of questions may be this.", CAPTURE:"A camera can do this to a moment in a photograph.", CIRCUIT:"A battery, wires, and bulb can make a path like this.", CLIMATE:"A place’s usual weather over many years is its ___. ", COLLECT:"People do this when they gather stamps, shells, or rocks.",
  BOUNDARY:"A fence can mark the edge between two yards.", EQUATION:"In math, this shows that two amounts are equal.", FRICTION:"This rubbing force can slow a sliding box.", GRAVITY:"This force makes a dropped ball fall to the ground.", VOLCANO:"Hot lava can pour out of the top of this mountain.", ELEMENT:"Oxygen and iron are examples of this kind of pure substance.", MEASURE:"A ruler helps you do this to find an object’s length.", WEATHER:"Look outside to see if today has sun, rain, or snow.", NATURAL:"A forest is this; a building is made by people.", CULTURE:"Food, music, celebrations, and customs are part of a community’s ___. ", HISTORY:"Museums and old documents can teach us about the past.", IMAGINE:"You do this when you picture a dragon or castle in your mind.", DESCRIBE:"Use details to tell someone what a place or object looks like.", COMPARE:"Put two shells side by side and look for what is alike.", CONTRAST:"Look for the differences between two things to do this.", EVIDENCE:"A footprint or photograph can be a clue that supports an idea.", CONCLUDE:"After checking the clues, a detective may do this to solve a case.", FRACTION:"One-half and three-quarters are examples used in math.", MULTIPLE:"12 is one of 3 because 3 × 4 = 12.", MATERIAL:"Wood, glass, and metal are examples used to make things.", ORGANISM:"A single tree, mushroom, or dog is a living one.", BEHAVIOR:"A dog wagging its tail is showing this kind of action.", LANGUAGE:"English, Spanish, and sign systems are ways to communicate.", SOLUTION:"In a mystery, this is the answer; in science, it can be a dissolved mixture.", SEQUENCE:"First, next, then, and last describe this kind of order.", CONTINENT:"Asia and Africa are two of Earth’s large land areas.",
  ANALYSIS:"To solve a puzzle, you might break it into smaller parts and examine each one.", APPROACH:"A plan or method for tackling a tricky problem is one.", ARTIFACT:"An old tool or clay pot found at an excavation can be one.", AUDIENCE:"The people sitting in a theater to watch a play are this.", CALCULATE:"Use arithmetic to work out the answer to a problem.", CATEGORY:"Apples and pears fit into the same fruit group, or ___. ", CREDIBLE:"A source with trustworthy evidence is more likely to be this.", DECISION:"After weighing choices, you make one of these.", ESTIMATE:"Without counting every item, make a close, thoughtful guess.", EVALUATE:"A judge does this when comparing work against clear standards.", FAMILIAR:"A song you have heard many times may feel this way.", IDENTIFY:"Recognize a plant and name what kind it is to do this.", INFLUENCE:"A friend can have this effect on a choice you make.", INTERPRET:"A reader does this to explain what a poem or chart means.", METAPHOR:"“Time is a thief” is an example of this figure of speech.", PARALLEL:"Railway tracks run beside one another like this.", PERSUADE:"Give good reasons to try to convince someone; that is to ___. ", RESOURCE:"A library book or map can be a helpful one when learning.", STRATEGY:"A step-by-step plan for winning a game is this.", STRUCTURE:"A building’s beams and walls are part of its framework or ___. ", VARIABLE:"In an experiment, this is something that can change.", VIEWPOINT:"Two people may describe the same event from a different one.", TRANSFORM:"A caterpillar changes into a butterfly; it can ___ into one.", ABSTRACT:"A feeling like fairness is an idea, not a physical object, so it is ___. ", COMPOUND:"A word like “raincoat” joins two smaller words to make this.", CONSTRUCT:"Builders do this when they put materials together to make something.",
  AMBIGUOUS:"A sentence with two possible meanings can be described this way.", ARTICULATE:"A speaker who explains an idea clearly is this.", ASSUMPTION:"Check this before trusting an idea that has not been proven.", COHERENT:"A well-organized explanation with connected ideas is this.", CRITERION:"One standard used to judge a project is a ___. ", DELIBERATE:"A careful choice made on purpose is this.", EMPIRICAL:"A claim supported by measurements and experiments is based on this kind of evidence.", HYPOTHESIS:"A scientist tests this proposed explanation with an experiment.", INFERENCE:"Use clues to reach this conclusion when it is not stated directly.", INTEGRITY:"Keeping promises and telling the truth show this quality.", INTRICATE:"A tiny watch mechanism with many detailed parts is this.", METICULOUS:"Someone who checks every small detail is being this.", OBJECTIVE:"A goal is one meaning; a fair report without personal bias is another.", PARADIGM:"A familiar model or framework that shapes how people think is this.", PLAUSIBLE:"An explanation that seems reasonable could be described this way.", PRAGMATIC:"A practical person focuses on what will work in real life.", PREVALENCE:"If many people have something, its frequency or this is high.", RECONCILE:"Compare two accounts and try to make them agree; then you ___. ", RESILIENT:"A person who bounces back after a setback is this.", RIGOROUS:"A careful investigation that checks every step is this.", SYNTHESIS:"Combine ideas from several sources to make a new whole; that is a ___. ", VERSATILE:"A tool that works for many different jobs is this.", BENEVOLENT:"A generous person who wants to help others is this.", CATALYST:"A spark can be this when it starts a much bigger change.", CONSENSUS:"After discussion, a group may reach a shared agreement called this.", HIERARCHY:"An organization chart can show this ranking from top to bottom.", IMPLICIT:"A message suggested without being said directly is this.", SCRUTINY:"A detective gives evidence this close attention.", UBIQUITOUS:"If something is found almost everywhere, it is this."
});

// These everyday and classroom words make the 12–14 daily crossword fairer:
// each has a plain-language easier clue ready if a player needs it.
window.isAgePreferredDailyWord = word => window.WORD_AGE_GROUP !== '12-14' || Boolean(MINI_EASY_HINTS[word]);

function miniDateKey(date = new Date()) { return puzzleDateKey(date); }
function miniDailyIndex(date = miniDateKey()) { let hash = 2166136261; for (const char of `${window.WORD_AGE_GROUP}:${date}`) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); } return hash >>> 0; }
function miniDailyPuzzle(date = miniDateKey()) {
  return {title:`Daily Crossword · ${window.currentWordAgeGroup().label} · ${miniDateLabel(date)}`,entries:[]};
}
function miniPreviousDailyAnswers(date) {
  const saved = {mode:miniMode,level:miniLevel,date:miniPuzzleDate,index:miniIndex,puzzle:miniPuzzle};
  try {
    miniMode = 'daily';
    miniLevel = null;
    miniPuzzleDate = previousPuzzleDate(date);
    miniIndex = miniDailyIndex(miniPuzzleDate);
    miniPuzzle = miniDailyPuzzle(miniPuzzleDate);
    layoutMiniEntries(MINI_DAILY_WORDS);
    return miniPuzzle.entries.map(entry => entry.answer);
  } catch { return []; }
  finally {
    miniMode = saved.mode;
    miniLevel = saved.level;
    miniPuzzleDate = saved.date;
    miniIndex = saved.index;
    miniPuzzle = saved.puzzle;
  }
}
function miniDateLabel(date) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
    weekday:'short', month:'long', day:'numeric', year:'numeric'
  });
}
function miniHistory() { try { return JSON.parse(localStorage.getItem('wordLinksMiniHistory') || '[]'); } catch { return []; } }
function miniLevelProgress() { try { return JSON.parse(localStorage.getItem('wordLinksMiniLevelProgress') || '{}'); } catch { return {}; } }
function saveMiniLevelProgress(progress) { localStorage.setItem('wordLinksMiniLevelProgress', JSON.stringify(progress)); }
function miniStreak() { return streakFor(miniHistory(), miniDateKey()); }
function updateMiniChallengeStreak() {
  const line = document.getElementById('mini-challenge-streak');
  if (line) line.textContent = `${miniStreak()} day streak`;
}
function recordMiniSolved() { const date = miniPuzzleDate; const ageGroup = window.WORD_AGE_GROUP; const history = miniHistory(); if (!history.some(item => item.date === date && (item.ageGroup || '18+') === ageGroup)) { history.unshift({date, ageGroup, gameType:'Mini Crossword', challengeName:miniPuzzle.title, title:miniPuzzle.title}); localStorage.setItem('wordLinksMiniHistory', JSON.stringify(history.slice(0, 60))); } return miniStreak(); }
function renderMiniHistory(section = 'all') {
  const panel = document.getElementById('mini-history-list');
  const daily = miniHistory().map(item => ({...item, section:'daily'}));
  const levels = (miniLevelProgress().history || []).map(item => ({...item, section:'levels'}));
  const history = [...daily, ...levels].filter(item => section === 'all' || item.section === section)
    .sort((a,b) => b.date.localeCompare(a.date));
  document.querySelectorAll('[data-mini-history-section]').forEach(button => {
    const active = button.dataset.miniHistorySection === section;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
    button.tabIndex = active ? 0 : -1;
  });
  panel.setAttribute('aria-labelledby', `mini-history-tab-${section}`);
  panel.replaceChildren();
  if (!history.length) {
    const empty = document.createElement('div');
    empty.className = 'history-empty';
    empty.textContent = section === 'daily' ? 'No completed daily crosswords yet.' : section === 'levels' ? 'No completed crossword levels yet.' : 'No completed crosswords yet. Your finished puzzles will appear here.';
    panel.append(empty);
  }
  for (const item of history) {
    const row = document.createElement('div'); row.className = 'history-row';
    const details = document.createElement('div');
    const title = document.createElement('div'); title.className = 'history-date';
    title.textContent = item.challengeName || item.title || (item.section === 'levels' ? `Level ${item.level}` : `Daily Crossword · ${miniDateLabel(item.date)}`);
    const meta = document.createElement('div'); meta.className = 'history-meta';
    const kind = document.createElement('strong');
    kind.textContent = item.section === 'levels' ? `Level ${item.level}` : 'Daily challenge';
    const age = item.ageGroup ? ` · ${window.WORD_AGE_GROUPS.find(group => group.id === item.ageGroup)?.label || item.ageGroup}` : '';
    meta.append(kind, document.createTextNode(` · Completed ${miniDateLabel(item.date)}${age}`));
    const status = document.createElement('span'); status.textContent = '✓ Solved'; status.className = 'level-status';
    details.append(title, meta); row.append(details, status); panel.append(row);
  }
}


let miniIndex = miniDailyIndex();
let miniPuzzle = miniDailyPuzzle();
let miniCells = [];
let selectedEntry = null;
let lastMiniClickedCell = null;
let miniMode = 'daily';
let miniPuzzleDate = miniDateKey();
let miniLevel = null;
let miniRevealUsed = false;
let miniResumeState = null;
function miniSessionKey(mode = miniMode, level = miniLevel, date = miniPuzzleDate, title = miniPuzzle?.title) { return mode === 'level' ? `wordLinksMiniSession:level:${level}` : `dailyChallenge:Mini Crossword:v${MINI_DAILY_GENERATOR_VERSION}:${title||'Daily Crossword'}:${date}`; }
function readMiniSession(mode, level, title) {
  try {
    const date=miniDateKey(), key=miniSessionKey(mode,level,date,title);
    const saved = JSON.parse(localStorage.getItem(key) || 'null');
    return saved?.title === title && Array.isArray(saved.entries) && Array.isArray(saved.answers) ? saved : null;
  } catch { return null; }
}
function saveMiniSession() {
  if (!miniPuzzle?.entries?.length) return;
  const answers = miniPuzzle.entries.flatMap(entry => entryCells(entry).map(({row, col}) => {
    const value = miniCell(row, col)?.value;
    return value ? {row, col, value} : null;
  }).filter(Boolean));
  try {
    localStorage.setItem(miniSessionKey(), JSON.stringify({gameType:miniMode==='daily'?'Mini Crossword':'Mini Crossword Level',challengeName:miniPuzzle.title,title:miniPuzzle.title,entries:miniPuzzle.entries,answers,selectedEntryId:selectedEntry?.id||null,revealUsed:miniRevealUsed,feedback:document.getElementById('mini-feedback').textContent}));
  } catch {}
}
function resetMiniReveal() {
  miniRevealUsed = false;
}

function updateMiniRevealButtons() {
  document.querySelectorAll('[data-mini-reveal]').forEach(button => {
    button.disabled = miniRevealUsed;
    button.textContent = miniRevealUsed ? 'Word reveal used for this puzzle' : 'Reveal this word · 1 use for this puzzle';
  });
}

function revealMiniWord(entryId) {
  if (miniRevealUsed) return;
  const entry = miniPuzzle.entries.find(item => item.id === entryId);
  if (!entry) return;
  selectedEntry = entry;
  entryCells(entry).forEach(({row, col}, index) => {
    const cell = miniCell(row, col);
    if (cell) { cell.value = entry.answer[index]; cell.classList.remove('mini-wrong'); }
  });
  miniRevealUsed = true;
  updateMiniRevealButtons();
  updateMiniProgress();
  updateMiniClueChecks();
  saveMiniSession();
}

function miniCell(row, col) { return miniCells[row * MINI_SIZE + col]; }

function entryCells(entry) {
  return [...entry.answer].map((_, index) => ({
    row: entry.row + (entry.dir === 'Down' ? index : 0),
    col: entry.col + (entry.dir === 'Across' ? index : 0)
  }));
}

function miniSeed() { let hash = 2166136261; const seedDate = miniMode === 'level' ? `level-${miniLevel}` : `${window.WORD_AGE_GROUP}-${miniPuzzleDate}`; const seedName = miniMode === 'daily' ? 'shared-daily' : miniPuzzle.title; for (const char of `${seedName}-${seedDate}-${miniIndex}`) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); } return hash >>> 0; }
function layoutMiniEntries(wordPoolOverride = null) {
  let state = miniSeed();
  const random = () => { state = (Math.imul(state,1664525)+1013904223) >>> 0; return state/4294967296; };
  const dirs = [{name:'Across',dr:0,dc:1},{name:'Down',dr:1,dc:0}];
  const wordPool = wordPoolOverride || (miniMode === 'level' ? MINI_LEVEL_WORDS.filter(word => word.answer.length >= MINI_LEVELS[miniLevel-1].minLength && word.answer.length <= MINI_LEVELS[miniLevel-1].maxLength) : miniMode === 'daily' ? MINI_DAILY_WORDS : MINI_WORDS);
  if (miniMode === 'daily' && !wordPoolOverride) {
    // Alternate disjoint, stable pools so consecutive dates never reuse an
    // answer. A date-derived partition also generates identically on every device.
    const epochDay = Math.floor(Date.parse(`${miniPuzzleDate}T12:00:00Z`) / 86400000);
    const parity = ((epochDay % 2) + 2) % 2;
    const agePool = window.filterWordsForAge(MINI_DAILY_WORDS, 9);
    const accessiblePool = agePool.filter(word => window.isAgePreferredDailyWord(word.answer));
    const selectedPool = accessiblePool.length >= 16 ? accessiblePool : agePool;
    const partitionedPool = selectedPool.filter((_, index) => index % 2 === parity);
    const dailyPool = partitionedPool.length >= 8 ? partitionedPool : selectedPool;
    layoutMiniEntries(dailyPool);
    return;
  }
  const targetCount = miniMode === 'daily' ? 8 : 9;
  const varietyTarget = miniMode === 'daily' ? 4 : miniMode === 'level'
    ? Math.min(5, MINI_LEVELS[miniLevel-1].maxLength - MINI_LEVELS[miniLevel-1].minLength + 1)
    : 5;
  const key = (row,col) => `${row},${col}`;
  const cellsFor = (word,row,col,dir) => [...word.answer].map((letter,i) => ({letter,row:row+dir.dr*i,col:col+dir.dc*i}));
  const boundsArea = cells => {
    const rows=cells.map(cell=>cell.row),cols=cells.map(cell=>cell.col);
    return (Math.max(...rows)-Math.min(...rows)+1)*(Math.max(...cols)-Math.min(...cols)+1);
  };
  let best=[],bestScore=-Infinity;
  // Bounded attempts keep generation quick; every addition joins the existing network.
  for(let attempt=0;attempt<24;attempt++) {
    const placed=[],occupied=new Map(),used=new Set();
    const add=(word,row,col,dir,cells)=>{
      placed.push({...word,row,col,dir:dir.name}); used.add(word.answer);
      cells.forEach(cell=>occupied.set(key(cell.row,cell.col),cell));
    };
    const starterLength = miniMode === 'daily' ? window.currentWordAgeGroup().minWordLength : miniMode === 'level' ? MINI_LEVELS[miniLevel-1].minLength : 6;
    const starters=wordPool.filter(word=>word.answer.length>=starterLength);
    const first=starters[Math.floor(random()*starters.length)],dir=dirs[Math.floor(random()*dirs.length)];
    const row=Math.floor((MINI_SIZE-dir.dr*(first.answer.length-1))/2);
    const col=Math.floor((MINI_SIZE-dir.dc*(first.answer.length-1))/2);
    add(first,row,col,dir,cellsFor(first,row,col,dir));
    while(placed.length<targetCount) {
      const candidates=[],seen=new Set(),oldCells=[...occupied.values()];
      const lengths=new Set(placed.map(word=>word.answer.length));
      for(const word of wordPool) {
        if(used.has(word.answer))continue;
        for(const dir of dirs) for(const cross of oldCells) {
          for(let i=0;i<word.answer.length;i++) {
            if(word.answer[i]!==cross.letter)continue;
            const row=cross.row-dir.dr*i,col=cross.col-dir.dc*i;
            const signature=`${word.answer}:${row},${col}:${dir.name}`;
            if(seen.has(signature))continue; seen.add(signature);
            const cells=cellsFor(word,row,col,dir);
            if(cells.some(cell=>cell.row<0||cell.row>=MINI_SIZE||cell.col<0||cell.col>=MINI_SIZE))continue;
            // One matching crossing prevents overlaps, duplicated routes, and crowded hubs.
            const overlaps=cells.filter(cell=>occupied.has(key(cell.row,cell.col)));
            if(overlaps.length!==1 || occupied.get(key(overlaps[0].row,overlaps[0].col)).letter!==overlaps[0].letter)continue;
            if(placed.some(entry=>entry.dir===dir.name && entryCells(entry).some(cell=>cell.row===cross.row&&cell.col===cross.col)))continue;
            if(occupied.has(key(row-dir.dr,col-dir.dc)) || occupied.has(key(row+dir.dr*word.answer.length,col+dir.dc*word.answer.length)))continue;
            // Keep a black-cell gap between unrelated branches, allowing the crossing itself.
            let crowded=false;
            for(const cell of cells) {
              if(Math.max(Math.abs(cell.row-cross.row),Math.abs(cell.col-cross.col))<=1)continue;
              for(const [dr,dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
                if(occupied.has(key(cell.row+dr,cell.col+dc)))crowded=true;
              }
            }
            if(crowded)continue;
            const area=boundsArea([...oldCells,...cells]);
            const lengthBonus=lengths.has(word.answer.length)?0:24;
            const directionBonus=placed.some(entry=>entry.dir===dir.name)?0:18;
            const score=area+lengthBonus+directionBonus+random()*22;
            candidates.push({word,row,col,dir,cells,score});
          }
        }
      }
      if(!candidates.length)break;
      candidates.sort((a,b)=>b.score-a.score);
      const pick=candidates[0];
      add(pick.word,pick.row,pick.col,pick.dir,pick.cells);
    }
    const score=placed.length*1000+new Set(placed.map(entry=>entry.answer.length)).size*30+boundsArea([...occupied.values()]);
    if(score>bestScore){best=placed;bestScore=score;}
    if(best.length===targetCount && new Set(best.map(entry=>entry.answer.length)).size>=varietyTarget)break;
  }
  if(best.length<targetCount)throw new Error('Could not generate a connected crossword.');
  const starts=new Map(); let number=0;
  best.sort((a,b)=>a.row-b.row||a.col-b.col).forEach(entry=>{
    const start=key(entry.row,entry.col);
    if(!starts.has(start))starts.set(start,++number);
    entry.id=`${starts.get(start)}${entry.dir==='Across'?'a':'d'}`;
  });
  miniPuzzle.entries=best;
}

function numberMiniEntries(entries) {
  const ordered = [...entries].sort((a,b) => a.row-b.row || a.col-b.col || (a.dir === b.dir ? 0 : a.dir === 'Across' ? -1 : 1));
  ordered.forEach((entry,index) => { entry.number = index + 1; });
}

function miniDirectionArrow(entry) { return entry.dir === 'Left' ? '←' : entry.dir === 'Across' || entry.dir === 'Right' ? '→' : '↓'; }
function miniArrowPlacement(entry) { return entry.dir === 'Left' ? 'left' : entry.dir === 'Across' || entry.dir === 'Right' ? 'right' : 'down'; }

function renderMini() {
  resetMiniReveal();
  if (!miniPuzzle._laidOut) { layoutMiniEntries(); miniPuzzle._laidOut = true; }
  numberMiniEntries(miniPuzzle.entries);
  const grid = document.getElementById('mini-grid');
  grid.innerHTML = '';
  miniCells = [];
  const starts = new Map();
  const rows = Array.from({length:MINI_SIZE},()=>Array(MINI_SIZE).fill(' '));
  miniPuzzle.entries.forEach(entry=>{
    const startKey = `${entry.row},${entry.col}`;
    if (!starts.has(startKey)) starts.set(startKey, []);
    starts.get(startKey).push(entry);
    entryCells(entry).forEach(({row,col},i)=>{ if(row>=0&&row<MINI_SIZE&&col>=0&&col<MINI_SIZE) rows[row][col]=entry.answer[i]; });
  });
  rows.forEach((row, r) => row.forEach((value, c) => {
    const square = document.createElement('div');
    square.className = 'mini-square';
    const cell = document.createElement(value === ' ' ? 'span' : 'input');
    cell.className = value === ' ' ? 'mini-block' : 'mini-cell';
    cell.dataset.row = r;
    cell.dataset.col = c;
    const startEntries = starts.get(`${r},${c}`) || [];
    startEntries.forEach(entry => {
      const label = document.createElement('span');
      label.className = `mini-number mini-number-${entry.dir.toLowerCase()}`;
      if (startEntries.length > 1 && entry.dir === 'Down') label.classList.add('mini-number-secondary');
      label.dataset.direction = entry.dir;
      label.dataset.arrow = miniArrowPlacement(entry);
      label.innerHTML = `<span class="mini-number-value">${entry.number}</span><span class="mini-number-arrow" aria-hidden="true">${miniDirectionArrow(entry)}</span>`;
      square.append(label);
    });
    if (value !== ' ') {
      cell.maxLength = 1;
      cell.autocomplete = 'off';
      cell.setAttribute('aria-label', `Mini crossword ${String.fromCharCode(65+c)}${r+1}`);
      cell.addEventListener('input', () => {
        cell.value = cell.value.replace(/[^a-z]/gi, '').toUpperCase();
        if (cell.value) focusMiniEntryCell(r, c, 1);
        updateMiniProgress();
        updateMiniClueChecks();
        saveMiniSession();
      });
      cell.addEventListener('keydown', event => {
        if (/^[a-z]$/i.test(event.key) && !event.metaKey && !event.ctrlKey && !event.altKey) {
          event.preventDefault();
          cell.value = event.key.toUpperCase();
          cell.classList.remove('mini-wrong');
          focusMiniEntryCell(r, c, 1);
          updateMiniProgress();
          updateMiniClueChecks();
          saveMiniSession();
          return;
        }
        if (event.key === 'Backspace') {
          event.preventDefault();
          if (cell.value) {
            cell.value = '';
            cell.classList.remove('mini-wrong');
            updateMiniProgress();
            updateMiniClueChecks();
            saveMiniSession();
          } else focusMiniEntryCell(r, c, -1);
          return;
        }
        if (event.key === 'ArrowRight') { event.preventDefault(); focusMiniCell(r, c, 1); }
        if (event.key === 'ArrowLeft') { event.preventDefault(); focusMiniCell(r, c, -1); }
        if (event.key === 'ArrowDown') { event.preventDefault(); focusMiniCell(r, c, MINI_SIZE); }
        if (event.key === 'ArrowUp') { event.preventDefault(); focusMiniCell(r, c, -MINI_SIZE); }
      });
      cell.addEventListener('focus', () => highlightEntryAt(r, c));
      cell.addEventListener('click', () => {
        const key = r + ',' + c;
        const entries = miniPuzzle.entries.filter(entry => entryCells(entry).some(point => point.row === r && point.col === c));
        if (key === lastMiniClickedCell && entries.length > 1) {
          const current = Math.max(0, entries.indexOf(selectedEntry));
          highlightEntry(entries[(current + 1) % entries.length]);
        }
        lastMiniClickedCell = key;
        saveMiniSession();
      });
      miniCells.push(cell);
    } else miniCells.push(null);
    square.append(cell);
    grid.append(square);
  }));
  document.getElementById('mini-title').textContent = miniPuzzle.title;
  renderMiniClues();
  if (miniResumeState) {
    miniResumeState.answers.forEach(({row, col, value}) => { const cell = miniCell(row, col); if (cell) cell.value = value; });
    miniRevealUsed = Boolean(miniResumeState.revealUsed);
    selectedEntry = miniPuzzle.entries.find(entry => entry.id === miniResumeState.selectedEntryId) || null;
    if (selectedEntry) highlightEntry(selectedEntry);
    if (miniResumeState.feedback) document.getElementById('mini-feedback').textContent = miniResumeState.feedback;
    miniResumeState = null;
  }
  updateMiniRevealButtons();
  updateMiniProgress();
  updateMiniClueChecks();
  saveMiniSession();
  animateGameEntrance("mini");
}

function updateMiniProgress() {
  const cells = new Set(miniPuzzle.entries.flatMap(entry => entryCells(entry).map(cell => String(cell.row) + ',' + cell.col)));
  const filled = [...cells].filter(key => {
    const parts = key.split(',').map(Number);
    return Boolean(miniCell(parts[0],parts[1])?.value);
  }).length;
  const percent = cells.size ? Math.round(filled / cells.size * 100) : 0;
  document.getElementById('mini-progress-count').textContent = filled + ' of ' + cells.size;
  document.getElementById('mini-progress-bar').style.width = percent + '%';
  document.querySelector('.mini-progress-track').setAttribute('aria-valuenow', percent);
}

function focusMiniEntryCell(row, col, offset) {
  if (selectedEntry) {
    const cells = entryCells(selectedEntry);
    const index = cells.findIndex(cell => cell.row === row && cell.col === col);
    const next = cells[index + offset];
    if (next) { miniCell(next.row,next.col)?.focus(); return; }
  }
  focusMiniCell(row,col,offset);
}

function focusMiniCell(row, col, offset) {
  const start = row * MINI_SIZE + col;
  for (let index = start + offset; index >= 0 && index < MINI_SIZE * MINI_SIZE; index += offset) {
    if (miniCells[index]) { miniCells[index].focus(); return; }
  }
}

function highlightEntry(entry) {
  selectedEntry = entry;
  document.querySelectorAll('.mini-cell').forEach(cell => cell.classList.remove('mini-active'));
  entryCells(entry).forEach(({row, col}) => miniCell(row, col)?.classList.add('mini-active'));
  document.querySelectorAll('.mini-clue').forEach(button => button.classList.toggle('active', button.dataset.entry === entry.id));
}

function highlightEntryAt(row, col) {
  const candidates = miniPuzzle.entries.filter(candidate => entryCells(candidate).some(cell => cell.row === row && cell.col === col));
  const entry = candidates.includes(selectedEntry) ? selectedEntry : candidates[0];
  if (entry) highlightEntry(entry);
}

function miniEasyHint(entry) {
  const specific = MINI_EASY_HINTS[entry.answer];
  const answer = entry.answer;
  const semantic = specific && specific.trim().toLowerCase() !== entry.clue.trim().toLowerCase()
    ? specific : `Think about the clue: ${entry.clue}`;
  return `${semantic.trim().replace(/[.!?]+$/, '')}. It starts with “${answer[0]}” and ends with “${answer.at(-1)}”.`;
}

function renderMiniClues() {
  for (const direction of ['Across', 'Down']) {
    const list = document.getElementById(direction === 'Across' ? 'mini-across' : 'mini-down');
    list.innerHTML = miniPuzzle.entries.filter(entry => entry.dir === direction).map(entry => `<div class="mini-clue-row" style="grid-template-columns:minmax(0,1fr) 32px 20px"><button class="mini-clue" type="button" data-entry="${entry.id}" aria-label="${direction} clue ${entry.number}: ${entry.clue} (${entry.answer.length} letters)"><strong class="mini-clue-label" data-arrow="${miniArrowPlacement(entry)}"><span>${entry.number}</span><span class="mini-clue-arrow" aria-hidden="true">${miniDirectionArrow(entry)}</span></strong> ${entry.clue} <span class="mini-length">(${entry.answer.length})</span></button><button class="mini-clue-toggle" type="button" aria-label="Show a better hint for ${direction} clue ${entry.number}" aria-expanded="false">▸</button><span class="mini-clue-check" style="display:none;place-items:center;width:20px;height:30px;color:#5c7837;font-size:17px;font-weight:bold" data-entry-check="${entry.id}" role="img" aria-label="Completed">✓</span><span class="mini-better-hint" hidden><span class="mini-easy-hint"></span><button class="mini-reveal-word secondary" type="button" data-mini-reveal="${entry.id}" hidden style="display:block;width:100%;margin-top:7px;padding:8px 10px;border:1px solid #c9c0ae;border-radius:6px;background:rgba(255,254,250,.55);color:var(--ink);cursor:pointer;font-size:11px">${miniRevealUsed?'Word reveal used for this puzzle':'Reveal this word · 1 use for this puzzle'}</button></span></div>`).join('');
    list.querySelectorAll('.mini-clue').forEach(button => button.addEventListener('click', () => {
      const entry = miniPuzzle.entries.find(item => item.id === button.dataset.entry);
      highlightEntry(entry);
      miniCell(entry.row, entry.col)?.focus();
      saveMiniSession();
    }));
    list.querySelectorAll('.mini-clue-toggle').forEach(button => button.addEventListener('click', () => {
      const row = button.closest('.mini-clue-row');
      const hint = row.querySelector('.mini-better-hint');
      const expanded = button.getAttribute('aria-expanded') === 'true';
      if (!expanded) {
        const clueId = row.querySelector('.mini-clue').dataset.entry;
        const entry = miniPuzzle.entries.find(item => item.id === clueId);
        if (entry) row.querySelector('.mini-easy-hint').textContent = `Hint: ${miniEasyHint(entry)}`;
      }
      document.querySelectorAll('.mini-clue-toggle[aria-expanded="true"]').forEach(openButton => {
        if (openButton === button) return;
        openButton.setAttribute('aria-expanded', 'false');
        openButton.textContent = '▸';
        const openRow = openButton.closest('.mini-clue-row');
        openRow.querySelector('.mini-better-hint').hidden = true;
        openRow.querySelector('[data-mini-reveal]').hidden = true;
      });
      button.setAttribute('aria-expanded', String(!expanded));
      button.textContent = expanded ? '▸' : '▾';
      hint.hidden = expanded;
      row.querySelector('[data-mini-reveal]').hidden = expanded;
    }));
    list.querySelectorAll('[data-mini-reveal]').forEach(button => button.addEventListener('click', () => revealMiniWord(button.dataset.miniReveal)));
  }
  document.getElementById('mini-daily-date').textContent = `Shared puzzle · ${miniDateKey()} · Resets at 12:00 AM local time`;
  updateMiniClueChecks();
}

function updateMiniClueChecks() {
  miniPuzzle.entries.forEach(entry => {
    const complete = entryCells(entry).every(({row, col}, index) => miniCell(row, col)?.value === entry.answer[index]);
    const check = document.querySelector(`[data-entry-check="${entry.id}"]`);
    if (check) check.style.display = complete ? 'grid' : 'none';
  });
}

function checkMini() {
  let complete = true;
  miniPuzzle.entries.forEach(entry => entryCells(entry).forEach(({row, col}, index) => {
    const cell = miniCell(row, col);
    if (!cell || cell.value !== entry.answer[index]) { complete = false; cell?.classList.add('mini-wrong'); }
    else cell?.classList.remove('mini-wrong');
  }));
  const feedback = document.getElementById('mini-feedback');
  if (complete && miniMode === 'level') { const progress=miniLevelProgress(); progress.completed=progress.completed||{}; progress.best=progress.best||{}; progress.history=progress.history||[]; progress.completed[miniLevel]=true; progress.best[miniLevel]=Math.min(progress.best[miniLevel]??Infinity,filledMiniCells()); progress.history.push({date:miniDateKey(),level:miniLevel,title:miniPuzzle.title}); saveMiniLevelProgress(progress); feedback.textContent=`Congratulations! Level ${miniLevel} complete. ${miniLevel<MINI_LEVELS.length?'The next level is unlocked.':'You completed every crossword level!'} Your daily mini streak is ${miniStreak()} day${miniStreak()===1?'':'s'}.`; renderMiniLevels(); } else if (complete) { const streak = recordMiniSolved(); updateMiniChallengeStreak(); feedback.textContent = `Congratulations! You solved today’s crossword. Your daily streak is ${streak} day${streak===1?'':'s'}.`; } else feedback.textContent = 'Keep going—red squares need another look.';
  feedback.className = `mini-feedback${complete ? ' success' : ''}`;
  renderMiniHistory();
  saveMiniSession();
}

function filledMiniCells() {
  return [...new Set(miniPuzzle.entries.flatMap(entry=>entryCells(entry).map(cell=>`${cell.row},${cell.col}`)))].filter(key=>{
    const [row,col]=key.split(',').map(Number); return Boolean(miniCell(row,col)?.value);
  }).length;
}

function renderMiniLevels() {
  const target=document.getElementById('mini-level-grid'), progress=miniLevelProgress();
  target.innerHTML=MINI_LEVELS.map((level,index)=>{
    const number=index+1, unlocked=number===1||Boolean(progress.completed?.[number-1]), completed=Boolean(progress.completed?.[number]);
    const status=completed?'✓ Completed':unlocked?'Ready to play':`🔒 Complete level ${number-1} first`;
    const lengths=level.minLength===level.maxLength?`${level.minLength} letters`:`${level.minLength}–${level.maxLength} letters`;
    return `<button class="level-card${completed?' completed':''}${unlocked?'':' locked'}" type="button" data-mini-level="${number}"${unlocked?'':' disabled'}><span class="level-number">${number}</span><span class="level-name">${level.name}</span><span class="level-difficulty">${level.difficulty}</span><span class="level-status">${status}</span><span class="level-best">${lengths} · 9 words</span></button>`;
  }).join('');
  target.querySelectorAll('[data-mini-level]:not([disabled])').forEach(button=>button.addEventListener('click',()=>startMiniLevel(Number(button.dataset.miniLevel))));
}

function startMiniLevel(number) {
  const level=MINI_LEVELS[number-1], progress=miniLevelProgress();
  if(!level || (number>1&&!progress.completed?.[number-1]))return;
  miniMode='level'; miniLevel=number; miniIndex=0;
  const title=`Level ${number} · ${level.name}`;
  miniResumeState=readMiniSession('level',number,title);
  miniPuzzle={title,entries:miniResumeState?miniResumeState.entries:[],_laidOut:Boolean(miniResumeState)}; selectedEntry=null;
  document.getElementById('mini-levels-modal').hidden=true;
  document.getElementById('mini-feedback').textContent=`Level ${number} · ${level.difficulty} · ${level.minLength}–${level.maxLength} letters`;
  renderMini();
  updateMiniNextPuzzleButton();
}

function showMiniLevels() {
  renderMiniLevels();
  document.getElementById('mini-levels-modal').hidden=false;
  document.getElementById('mini-welcome').hidden=true;
}

function startMiniDaily() {
  miniPuzzleDate = miniDateKey();
  miniMode='daily'; miniLevel=null; miniIndex=miniDailyIndex();
  const puzzle=miniDailyPuzzle(miniPuzzleDate);
  miniResumeState=readMiniSession('daily',null,puzzle.title);
  miniPuzzle={...puzzle,entries:miniResumeState?miniResumeState.entries:puzzle.entries.map(entry=>({...entry}))};
  miniPuzzle._laidOut=Boolean(miniResumeState); selectedEntry=null;
  document.getElementById('mini-levels-modal').hidden=true;
  document.getElementById('mini-welcome').hidden=true;
  const resumed=Boolean(miniResumeState);
  renderMini();
  updateMiniNextPuzzleButton();
  if(!resumed) document.getElementById('mini-feedback').textContent=`Daily challenge · ${miniStreak()} day streak`;
  saveMiniSession();
}

function restartMiniPuzzle() {
  const currentKey = miniSessionKey();
  try {
    localStorage.removeItem(currentKey);
    if (miniMode === 'daily') localStorage.removeItem(`wordLinksMiniSession:daily:${miniPuzzleDate}`);
  } catch {}
  miniResumeState = null;
  selectedEntry = null;
  lastMiniClickedCell = null;
  miniRevealUsed = false;
  if (miniMode === 'level') {
    const level = MINI_LEVELS[miniLevel - 1];
    miniIndex = 0;
    miniPuzzle = {title:`Level ${miniLevel} · ${level.name}`, entries:[], _laidOut:false};
    renderMini();
    document.getElementById('mini-feedback').textContent = `Level ${miniLevel} restarted · ${level.difficulty} · ${level.minLength}–${level.maxLength} letters`;
  } else {
    miniPuzzleDate = miniDateKey();
    miniIndex = miniDailyIndex();
    miniPuzzle = {...miniDailyPuzzle(miniPuzzleDate), entries:[], _laidOut:false};
    renderMini();
    document.getElementById('mini-feedback').textContent = `Daily crossword restarted · ${miniStreak()} day streak`;
  }
  document.getElementById('mini-feedback').className = 'mini-feedback';
  saveMiniSession();
  updateMiniNextPuzzleButton();
  document.querySelector('.mini-cell')?.focus();
}


function openMiniGame() {
  miniPuzzleDate = miniDateKey();
  miniMode='daily'; miniLevel=null; miniIndex=miniDailyIndex();
  const puzzle=miniDailyPuzzle(miniPuzzleDate);
  miniResumeState=readMiniSession('daily',null,puzzle.title);
  miniPuzzle={...puzzle,entries:miniResumeState?miniResumeState.entries:[],_laidOut:Boolean(miniResumeState)};
  renderMini();
  const streak = miniStreak();
  updateMiniChallengeStreak();
  document.getElementById('mini-welcome-streak').textContent = `Your daily crossword streak is ${streak} day${streak === 1 ? '' : 's'}.`;
  document.getElementById('mini-modal').hidden = false;
  document.getElementById('mini-welcome').hidden = false;
  document.getElementById('game-selector').hidden = true;
}

document.querySelectorAll('[data-game-choice]').forEach(button => button.addEventListener('click', () => {
  if (button.dataset.gameChoice === 'mini') openMiniGame();
  else {
    document.getElementById('game-selector').hidden = true;
    animateGameEntrance('links');
    openWelcome();
  }
}));
function showGameSelector() {
  window.showGameChooser();
}

document.getElementById('game-menu').addEventListener('click', showGameSelector);
document.getElementById('mini-game-menu').addEventListener('click', showGameSelector);
document.getElementById('mini-check').addEventListener('click', checkMini);
document.getElementById('mini-daily').addEventListener('click', startMiniDaily);
const miniRestartButton = document.createElement('button');
miniRestartButton.id = 'mini-restart';
miniRestartButton.className = 'secondary restart-puzzle';
miniRestartButton.type = 'button';
miniRestartButton.textContent = '↻ Restart puzzle';
miniRestartButton.setAttribute('aria-label', 'Restart the current Mini Crossword puzzle');
document.querySelector('.mini-header-actions')?.append(miniRestartButton);
miniRestartButton.addEventListener('click', restartMiniPuzzle);
const miniNextPuzzleButton = document.createElement('button');
miniNextPuzzleButton.id = 'mini-next-puzzle';
miniNextPuzzleButton.className = 'secondary mini-next-puzzle';
miniNextPuzzleButton.type = 'button';
miniNextPuzzleButton.textContent = 'Move on to next puzzle';
document.querySelector('.mini-header-actions')?.append(miniNextPuzzleButton);
function updateMiniNextPuzzleButton() {
  miniNextPuzzleButton.hidden = miniMode !== 'level';
  miniNextPuzzleButton.textContent = miniLevel >= MINI_LEVELS.length ? 'All extra puzzles complete' : 'Move on to next puzzle';
  miniNextPuzzleButton.title = miniLevel >= MINI_LEVELS.length ? 'You completed every crossword level.' : `Complete Level ${miniLevel} to unlock the next puzzle.`;
}
miniNextPuzzleButton.addEventListener('click', () => {
  if (miniMode !== 'level') return;
  const progress = miniLevelProgress();
  if (!progress.completed?.[miniLevel]) {
    document.getElementById('mini-feedback').textContent = `Finish Level ${miniLevel} first to unlock the next puzzle.`;
    document.getElementById('mini-feedback').className = 'mini-feedback error';
    return;
  }
  if (miniLevel >= MINI_LEVELS.length) {
    document.getElementById('mini-feedback').textContent = 'You have completed every crossword level.';
    return;
  }
  startMiniLevel(miniLevel + 1);
});
document.getElementById('mini-levels-open').addEventListener('click', showMiniLevels);
document.getElementById('mini-levels-close').addEventListener('click',()=>{document.getElementById('mini-levels-modal').hidden=true;});
document.getElementById('mini-levels-modal').addEventListener('click',event=>{if(event.target.id==='mini-levels-modal')event.currentTarget.hidden=true;});
document.getElementById('mini-welcome-start').addEventListener('click',startMiniDaily);
document.getElementById('mini-welcome-close').addEventListener('click', () => { document.getElementById('mini-welcome').hidden = true; });
document.getElementById('mini-welcome-levels').addEventListener('click',showMiniLevels);
const miniHistoryModal = document.getElementById('mini-history-modal');
function closeMiniHistory() {
  miniHistoryModal.hidden = true;
  document.getElementById('mini-history-button').focus({preventScroll:true});
}
document.getElementById('mini-history-button').addEventListener('click', () => {
  renderMiniHistory('all');
  miniHistoryModal.hidden = false;
  document.getElementById('mini-history-close').focus({preventScroll:true});
});
document.getElementById('mini-history-close').addEventListener('click', closeMiniHistory);
miniHistoryModal.addEventListener('click', event => { if (event.target === miniHistoryModal) closeMiniHistory(); });
const miniHistoryTabs = [...document.querySelectorAll('[data-mini-history-section]')];
miniHistoryTabs.forEach((button, index) => {
  button.addEventListener('click', () => renderMiniHistory(button.dataset.miniHistorySection));
  button.addEventListener('keydown', event => {
    const offsets = {ArrowRight:1, ArrowLeft:-1, Home:-index, End:miniHistoryTabs.length-1-index};
    if (!(event.key in offsets)) return;
    event.preventDefault();
    const next = miniHistoryTabs[(index + offsets[event.key] + miniHistoryTabs.length) % miniHistoryTabs.length];
    renderMiniHistory(next.dataset.miniHistorySection); next.focus();
  });
});
miniHistoryModal.addEventListener('keydown', event => {
  if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); closeMiniHistory(); }
  if (event.key === 'Tab') {
    const focusable = [...miniHistoryModal.querySelectorAll('button, [tabindex="0"]')].filter(el => el.tabIndex >= 0);
    const first = focusable[0], last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});

document.getElementById('mini-modal').addEventListener('click', event => { if (event.target.id === 'mini-modal') event.currentTarget.hidden = true; });

window.addEventListener('load', () => { document.getElementById('game-welcome').hidden = false; document.getElementById('game-selector').hidden = true; });
document.getElementById('game-welcome-continue').addEventListener('click', () => { document.getElementById('game-welcome').hidden = true; document.getElementById('game-selector').hidden = false; });

window.addEventListener('word-age-change', () => { if (miniMode === 'daily') startMiniDaily(); });
window.addEventListener('daily-reset', () => {
  if (miniMode === 'daily' && miniCells.length) {
    const welcomeHidden = document.getElementById('mini-welcome').hidden;
    const levelsHidden = document.getElementById('mini-levels-modal').hidden;
    startMiniDaily();
    document.getElementById('mini-welcome').hidden = welcomeHidden;
    document.getElementById('mini-levels-modal').hidden = levelsHidden;
    document.getElementById('mini-feedback').textContent = 'A new daily crossword is ready. Daily puzzles reset at 12:00 AM local time.';
  }
  const streak = miniStreak();
  updateMiniChallengeStreak();
  document.getElementById('mini-welcome-streak').textContent = `Your daily crossword streak is ${streak} day${streak === 1 ? '' : 's'}.`;
});
