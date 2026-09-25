'use strict';

// Each level has several word pairs. One pair is chosen at random when the
// level starts so replaying a level does not always show the same opening.
const EXTRA_LEVELS = [
  {name:'Warm-up', target:28, puzzles:[['CAT','DOG'],['SUN','MAP'],['RED','BLUE'],['BEE','FOX'],['PEN','CUP']]},
  {name:'First steps', target:30, puzzles:[['TREE','BIRD'],['BOOK','FISH'],['RAIN','WIND'],['STAR','MOON'],['LAKE','FROG']]},
  {name:'Getting clever', target:32, puzzles:[['APPLE','PEAR'],['HOUSE','ROAD'],['SAND','SHELL'],['HAND','FOOT'],['SHIP','BOAT']]},
  {name:'Word walker', target:34, puzzles:[['CHAIR','TABLE'],['RIVER','STONE'],['CLOUD','WATER'],['MUSIC','DANCE'],['LIGHT','SOUND']]},
  {name:'Crossroads', target:36, puzzles:[['BRIDGE','SHORE'],['PAPER','PENCIL'],['HORSE','SHEEP'],['GREEN','GRASS'],['NIGHT','OCEAN']]},
  {name:'Sharp turns', target:38, puzzles:[['GARDEN','FLOWER'],['FOREST','TRAIL'],['WINTER','SUMMER'],['PEACH','LEMON'],['TRAIN','PLANE']]},
  {name:'Longer links', target:40, puzzles:[['ISLAND','MOUNTAIN'],['WINDOW','DOOR'],['FRIEND','FAMILY'],['SILVER','GOLD'],['SPRING','AUTUMN']]},
  {name:'Tangled paths', target:42, puzzles:[['BASKET','MARKET'],['CANDLE','PENCIL'],['POCKET','JACKET'],['BOTTLE','PLASTIC'],['PILLOW','BLANKET']]},
  {name:'Deep thinking', target:44, puzzles:[['SUNRISE','SUNSET'],['SEASIDE','COUNTRY'],['THUNDER','LIGHTNING'],['HARVEST','GARDENS'],['PAINTING','DRAWING']]},
  {name:'The maze', target:46, puzzles:[['NOTEBOOK','KEYBOARD'],['BACKPACK','JOURNEY'],['TREASURE','ISLAND'],['CAMPFIRE','FOREST'],['RAINFOREST','WILDLIFE']]},
  {name:'Brain burner', target:48, puzzles:[['BUTTERFLY','DRAGONFLY'],['BREAKFAST','SANDWICH'],['CHOCOLATE','VANILLA'],['TELEPHONE','COMPUTER'],['SOMETHING','ANYWHERE']]},
  {name:'Hard mode', target:50, puzzles:[['ADVENTURE','EXPLORING'],['COMMUNITY','TOGETHER'],['KNOWLEDGE','DISCOVERY'],['CELEBRATION','BIRTHDAY'],['PLAYGROUND','CHILDREN']]},
  {name:'Expert route', target:52, puzzles:[['IMAGINATION','CREATIVITY'],['CONSTELLATION','STARGAZING'],['UNDERSTANDING','COMPASSION'],['CONVERSATION','FRIENDSHIP'],['PHOTOGRAPHY','MEMORIES']]},
  {name:'Master link', target:54, puzzles:[['ARCHITECTURE','ENGINEERING'],['ENVIRONMENTAL','SUSTAINABLE'],['EXTRAORDINARY','IMPOSSIBLE'],['TRANSFORMATION','BEGINNING'],['RESPONSIBILITY','GENEROSITY']]},
  {name:'The final knot', target:56, puzzles:[['DETERMINATION','PERSEVERANCE'],['COLLABORATION','COMMUNICATION'],['INTERNATIONAL','ADVENTUROUS'],['INDEPENDENCE','IMAGINATIVE'],['CELEBRATION','CONNECTIONS']]}
];

// Keep every level's opening vocabulary available even when a compact build
// of the main dictionary is used. These words also expand the playable set.
for (const level of EXTRA_LEVELS) {
  for (const pair of level.puzzles) {
    for (const word of pair) WORDS.add(word);
  }
}
