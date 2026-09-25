'use strict';

// Each level has several word pairs. One pair is chosen at random when the
// level starts so replaying a level does not always show the same opening.
const EXTRA_LEVELS = [
  {name:'Warm-up', difficulty:'Easy', target:22, puzzles:[['CAT','DOG'],['SUN','MAP'],['RED','BLUE'],['BEE','FOX'],['PEN','CUP']]},
  {name:'First steps', difficulty:'Easy', target:26, puzzles:[['TREE','BIRD'],['BOOK','FISH'],['RAIN','WIND'],['STAR','MOON'],['LAKE','FROG']]},
  {name:'Getting clever', difficulty:'Easy', target:31, puzzles:[['APPLE','PEAR'],['HOUSE','ROAD'],['SAND','SHELL'],['HAND','FOOT'],['SHIP','BOAT']]},
  {name:'Word walker', difficulty:'Easy', target:37, puzzles:[['CHAIR','TABLE'],['RIVER','STONE'],['CLOUD','WATER'],['MUSIC','DANCE'],['LIGHT','SOUND']]},
  {name:'Crossroads', difficulty:'Easy', target:44, puzzles:[['BRIDGE','SHORE'],['PAPER','PENCIL'],['HORSE','SHEEP'],['GREEN','GRASS'],['NIGHT','OCEAN']]},
  {name:'Sharp turns', difficulty:'Medium', target:52, puzzles:[['GARDEN','FLOWER'],['FOREST','TRAIL'],['WINTER','SUMMER'],['PEACH','LEMON'],['TRAIN','PLANE']]},
  {name:'Longer links', difficulty:'Medium', target:61, puzzles:[['ISLAND','MOUNTAIN'],['WINDOW','DOOR'],['FRIEND','FAMILY'],['SILVER','GOLD'],['SPRING','AUTUMN']]},
  {name:'Tangled paths', difficulty:'Medium', target:71, puzzles:[['BASKET','MARKET'],['CANDLE','PENCIL'],['POCKET','JACKET'],['BOTTLE','PLASTIC'],['PILLOW','BLANKET']]},
  {name:'Deep thinking', difficulty:'Medium', target:82, puzzles:[['SUNRISE','SUNSET'],['SEASIDE','COUNTRY'],['THUNDER','LIGHTNING'],['HARVEST','GARDENS'],['PAINTING','DRAWING']]},
  {name:'The maze', difficulty:'Medium', target:94, puzzles:[['NOTEBOOK','KEYBOARD'],['BACKPACK','JOURNEY'],['TREASURE','ISLAND'],['CAMPFIRE','FOREST'],['RAINFOREST','WILDLIFE']]},
  {name:'Brain burner', difficulty:'Hard', target:106, puzzles:[['BUTTERFLY','DRAGONFLY'],['BREAKFAST','SANDWICH'],['CHOCOLATE','VANILLA'],['TELEPHONE','COMPUTER'],['SOMETHING','ANYWHERE']]},
  {name:'Hard mode', difficulty:'Hard', target:118, puzzles:[['ADVENTURE','EXPLORING'],['COMMUNITY','TOGETHER'],['KNOWLEDGE','DISCOVERY'],['CELEBRATION','BIRTHDAY'],['PLAYGROUND','CHILDREN']]},
  {name:'Expert route', difficulty:'Hard', target:130, puzzles:[['IMAGINATION','CREATIVITY'],['CONSTELLATION','STARGAZING'],['UNDERSTANDING','COMPASSION'],['CONVERSATION','FRIENDSHIP'],['PHOTOGRAPHY','MEMORIES']]},
  {name:'Master link', difficulty:'Hard', target:142, puzzles:[['ARCHITECTURE','ENGINEERING'],['ENVIRONMENTAL','SUSTAINABLE'],['EXTRAORDINARY','IMPOSSIBLE'],['TRANSFORMATION','BEGINNING'],['RESPONSIBILITY','GENEROSITY']]},
  {name:'The final knot', difficulty:'Extreme', target:154, puzzles:[['DETERMINATION','PERSEVERANCE'],['COLLABORATION','COMMUNICATION'],['INTERNATIONAL','ADVENTUROUS'],['INDEPENDENCE','IMAGINATIVE'],['CELEBRATION','CONNECTIONS']]}
];

// Keep every level's opening vocabulary available even when a compact build
// of the main dictionary is used. These words also expand the playable set.
for (const level of EXTRA_LEVELS) {
  for (const pair of level.puzzles) {
    for (const word of pair) WORDS.add(word);
  }
}
