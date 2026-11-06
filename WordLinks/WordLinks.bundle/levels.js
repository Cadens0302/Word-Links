'use strict';

// Each level has several word pairs. One pair is chosen at random when the
// level starts so replaying a level does not always show the same opening.
const EXTRA_LEVELS = [
  {name:'Warm-up', difficulty:'Easy', target:9, puzzles:[['CAT','DOG'],['SUN','MAP'],['RED','BLUE'],['BEE','FOX'],['PEN','CUP']]},
  {name:'First steps', difficulty:'Easy', target:10, puzzles:[['TREE','BIRD'],['BOOK','FISH'],['RAIN','WIND'],['STAR','MOON'],['LAKE','FROG']]},
  {name:'Getting clever', difficulty:'Easy', target:12, puzzles:[['APPLE','PEAR'],['HOUSE','ROAD'],['SAND','SHELL'],['HAND','FOOT'],['SHIP','BOAT']]},
  {name:'Word walker', difficulty:'Easy', target:14, puzzles:[['CHAIR','TABLE'],['RIVER','STONE'],['CLOUD','WATER'],['MUSIC','DANCE'],['LIGHT','SOUND']]},
  {name:'Crossroads', difficulty:'Easy', target:16, puzzles:[['BRIDGE','SHORE'],['PAPER','PENCIL'],['HORSE','SHEEP'],['GREEN','GRASS'],['NIGHT','OCEAN']]},
  {name:'Sharp turns', difficulty:'Medium', target:18, puzzles:[['GARDEN','FLOWER'],['FOREST','TRAIL'],['WINTER','SUMMER'],['PEACH','LEMON'],['TRAIN','PLANE']]},
  {name:'Longer links', difficulty:'Medium', target:20, puzzles:[['ISLAND','MOUNTAIN'],['WINDOW','DOOR'],['FRIEND','FAMILY'],['SILVER','GOLD'],['SPRING','AUTUMN']]},
  {name:'Tangled paths', difficulty:'Medium', target:23, puzzles:[['BASKET','MARKET'],['CANDLE','PENCIL'],['POCKET','JACKET'],['BOTTLE','PLASTIC'],['PILLOW','BLANKET']]},
  {name:'Deep thinking', difficulty:'Medium', target:26, puzzles:[['SUNRISE','SUNSET'],['SEASIDE','COUNTRY'],['THUNDER','LIGHTNING'],['HARVEST','GARDENS'],['PAINTING','DRAWING']]},
  {name:'The maze', difficulty:'Medium', target:29, puzzles:[['NOTEBOOK','KEYBOARD'],['BACKPACK','JOURNEY'],['TREASURE','ISLAND'],['CAMPFIRE','FOREST'],['RAINFOREST','WILDLIFE']]},
  {name:'Brain burner', difficulty:'Hard', target:32, puzzles:[['BUTTERFLY','DRAGONFLY'],['BREAKFAST','SANDWICH'],['CHOCOLATE','VANILLA'],['TELEPHONE','COMPUTER'],['SOMETHING','ANYWHERE']]},
  {name:'Hard mode', difficulty:'Hard', target:36, puzzles:[['ADVENTURE','EXPLORING'],['COMMUNITY','TOGETHER'],['KNOWLEDGE','DISCOVERY'],['CELEBRATION','BIRTHDAY'],['PLAYGROUND','CHILDREN']]},
  {name:'Expert route', difficulty:'Hard', target:40, puzzles:[['IMAGINATION','CREATIVITY'],['CONSTELLATION','STARGAZING'],['UNDERSTANDING','COMPASSION'],['CONVERSATION','FRIENDSHIP'],['PHOTOGRAPHY','MEMORIES']]},
  {name:'Master link', difficulty:'Hard', target:45, puzzles:[['ARCHITECTURE','ENGINEERING'],['ENVIRONMENTAL','SUSTAINABLE'],['EXTRAORDINARY','IMPOSSIBLE'],['TRANSFORMATION','BEGINNING'],['RESPONSIBILITY','GENEROSITY']]},
  {name:'The final knot', difficulty:'Extreme', target:50, puzzles:[['DETERMINATION','PERSEVERANCE'],['COLLABORATION','COMMUNICATION'],['INTERNATIONAL','ADVENTUROUS'],['INDEPENDENCE','IMAGINATIVE'],['CELEBRATION','CONNECTIONS']]}
];

// Keep every level's opening vocabulary available even when a compact build
// of the main dictionary is used. These words also expand the playable set.
for (const level of EXTRA_LEVELS) {
  for (const pair of level.puzzles) {
    for (const word of pair) WORDS.add(word);
  }
}

// Additional level openings keep the 50-level path varied while using the
// same validated dictionary and deterministic level assignment system.
const ADDITIONAL_LEVEL_OPENINGS = [
  ['CANDLE','FLAME'],['PILLOW','BLANKET'],['BOTTLE','WATER'],['POCKET','JACKET'],
  ['MARKET','BASKET'],['PAINTING','DRAWING'],['HARVEST','GARDENS'],['SEASIDE','COUNTRY'],
  ['THUNDER','LIGHTNING'],['SUNRISE','SUNSET'],['KEYBOARD','NOTEBOOK'],['JOURNEY','BACKPACK'],
  ['CAMPFIRE','FOREST'],['WILDLIFE','RAINFOREST'],['VANILLA','CHOCOLATE'],['BREAKFAST','SANDWICH'],
  ['DRAGONFLY','BUTTERFLY'],['EXPLORING','ADVENTURE'],['TOGETHER','COMMUNITY'],['DISCOVERY','KNOWLEDGE'],
  ['BIRTHDAY','CELEBRATION'],['CHILDREN','PLAYGROUND'],['CREATIVITY','IMAGINATION'],['STARGAZING','CONSTELLATION'],
  ['COMPASSION','UNDERSTANDING'],['FRIENDSHIP','CONVERSATION'],['MEMORIES','PHOTOGRAPHY'],['ENGINEERING','ARCHITECTURE'],
  ['SUSTAINABLE','ENVIRONMENTAL'],['IMPOSSIBLE','EXTRAORDINARY'],['BEGINNING','TRANSFORMATION'],['GENEROSITY','RESPONSIBILITY'],
  ['PERSEVERANCE','DETERMINATION'],['COMMUNICATION','COLLABORATION'],['ADVENTUROUS','INTERNATIONAL'],['IMAGINATIVE','INDEPENDENCE'],
  ['CONNECTIONS','CELEBRATION'],['LANDMARK','KEYSTONE'],['WATERFALL','TREASURE'],['TELEPHONE','COMPUTER']
];
const ADDITIONAL_LEVEL_NAMES = ['Lantern trail','Quiet crossing','Open road','Hidden hinge','Market square','Painter’s path','Harvest route','Coastal turn','Storm signal','Morning bridge','Keyed route','Packed trail','Ember crossing','Wild passage','Sweet pairing','Morning table','Winged route','Explorer’s map','Shared ground','Discovery lane','Birthday bridge','Playground path','Bright ideas','Sky watcher','Kindred route','Conversation lane','Memory map','Built to last','Green horizon','Rare route','First light','Giving back','Steady climb','Teamwork trail','World traveler','Independent route','Final connection','Stone marker','Falling water','Signal path'];
for (let index = EXTRA_LEVELS.length; index < 50; index++) {
  const opening = ADDITIONAL_LEVEL_OPENINGS[index - 15];
  const puzzles = Array.from({length:5}, (_, offset) => {
    const pair = ADDITIONAL_LEVEL_OPENINGS[(index - 15 + offset * 7) % ADDITIONAL_LEVEL_OPENINGS.length];
    return [...pair];
  });
  const difficulty = index < 10 ? 'Easy' : index < 20 ? 'Medium' : index < 30 ? 'Hard' : index < 40 ? 'Expert' : 'Master';
  EXTRA_LEVELS.push({name:ADDITIONAL_LEVEL_NAMES[index - 15], difficulty, target:50 + (index - 14) * 3, puzzles});
}

// Apply one consistent difficulty progression across every level, including
// the original levels whose earlier labels did not match their position.
EXTRA_LEVELS.forEach((level, index) => {
  level.difficulty = index < 10 ? 'Easy' : index < 20 ? 'Medium' : index < 30 ? 'Hard' : index < 40 ? 'Expert' : 'Master';
});

// Register vocabulary introduced by all 50 levels before crossword setup and
// refresh the choose-screen count after the complete Word Links bank exists.
for (const level of EXTRA_LEVELS) {
  for (const pair of level.puzzles) {
    for (const word of pair) WORDS.add(word);
  }
}
if (typeof document !== 'undefined') {
  const dictionaryCount = document.querySelector('#game-word-count strong');
  if (dictionaryCount) dictionaryCount.textContent = WORDS.size.toLocaleString();
}
