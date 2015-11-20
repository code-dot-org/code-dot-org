var craft_locale = {lc:{"ar":function(n){
  if (n === 0) {
    return 'zero';
  }
  if (n == 1) {
    return 'one';
  }
  if (n == 2) {
    return 'two';
  }
  if ((n % 100) >= 3 && (n % 100) <= 10 && n == Math.floor(n)) {
    return 'few';
  }
  if ((n % 100) >= 11 && (n % 100) <= 99 && n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"en":function(n){return n===1?"one":"other"},"bg":function(n){return n===1?"one":"other"},"bn":function(n){return n===1?"one":"other"},"ca":function(n){return n===1?"one":"other"},"cs":function(n){
  if (n == 1) {
    return 'one';
  }
  if (n == 2 || n == 3 || n == 4) {
    return 'few';
  }
  return 'other';
},"da":function(n){return n===1?"one":"other"},"de":function(n){return n===1?"one":"other"},"el":function(n){return n===1?"one":"other"},"es":function(n){return n===1?"one":"other"},"et":function(n){return n===1?"one":"other"},"eu":function(n){return n===1?"one":"other"},"fa":function(n){return "other"},"fi":function(n){return n===1?"one":"other"},"fil":function(n){return n===0||n==1?"one":"other"},"fr":function(n){return Math.floor(n)===0||Math.floor(n)==1?"one":"other"},"ga":function(n){return n==1?"one":(n==2?"two":"other")},"gl":function(n){return n===1?"one":"other"},"he":function(n){return n===1?"one":"other"},"hi":function(n){return n===0||n==1?"one":"other"},"hr":function(n){
  if ((n % 10) == 1 && (n % 100) != 11) {
    return 'one';
  }
  if ((n % 10) >= 2 && (n % 10) <= 4 &&
      ((n % 100) < 12 || (n % 100) > 14) && n == Math.floor(n)) {
    return 'few';
  }
  if ((n % 10) === 0 || ((n % 10) >= 5 && (n % 10) <= 9) ||
      ((n % 100) >= 11 && (n % 100) <= 14) && n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"hu":function(n){return "other"},"id":function(n){return "other"},"is":function(n){
    return ((n%10) === 1 && (n%100) !== 11) ? 'one' : 'other';
  },"it":function(n){return n===1?"one":"other"},"ja":function(n){return "other"},"ko":function(n){return "other"},"lt":function(n){
  if ((n % 10) == 1 && ((n % 100) < 11 || (n % 100) > 19)) {
    return 'one';
  }
  if ((n % 10) >= 2 && (n % 10) <= 9 &&
      ((n % 100) < 11 || (n % 100) > 19) && n == Math.floor(n)) {
    return 'few';
  }
  return 'other';
},"lv":function(n){
  if (n === 0) {
    return 'zero';
  }
  if ((n % 10) == 1 && (n % 100) != 11) {
    return 'one';
  }
  return 'other';
},"mk":function(n){return (n%10)==1&&n!=11?"one":"other"},"mr":function(n){return n===1?"one":"other"},"ms":function(n){return "other"},"mt":function(n){
  if (n == 1) {
    return 'one';
  }
  if (n === 0 || ((n % 100) >= 2 && (n % 100) <= 4 && n == Math.floor(n))) {
    return 'few';
  }
  if ((n % 100) >= 11 && (n % 100) <= 19 && n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"nl":function(n){return n===1?"one":"other"},"no":function(n){return n===1?"one":"other"},"pl":function(n){
  if (n == 1) {
    return 'one';
  }
  if ((n % 10) >= 2 && (n % 10) <= 4 &&
      ((n % 100) < 12 || (n % 100) > 14) && n == Math.floor(n)) {
    return 'few';
  }
  if ((n % 10) === 0 || n != 1 && (n % 10) == 1 ||
      ((n % 10) >= 5 && (n % 10) <= 9 || (n % 100) >= 12 && (n % 100) <= 14) &&
      n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"pt":function(n){return n===1?"one":"other"},"ro":function(n){
  if (n == 1) {
    return 'one';
  }
  if (n === 0 || n != 1 && (n % 100) >= 1 &&
      (n % 100) <= 19 && n == Math.floor(n)) {
    return 'few';
  }
  return 'other';
},"ru":function(n){
  if ((n % 10) == 1 && (n % 100) != 11) {
    return 'one';
  }
  if ((n % 10) >= 2 && (n % 10) <= 4 &&
      ((n % 100) < 12 || (n % 100) > 14) && n == Math.floor(n)) {
    return 'few';
  }
  if ((n % 10) === 0 || ((n % 10) >= 5 && (n % 10) <= 9) ||
      ((n % 100) >= 11 && (n % 100) <= 14) && n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"sk":function(n){
  if (n == 1) {
    return 'one';
  }
  if (n == 2 || n == 3 || n == 4) {
    return 'few';
  }
  return 'other';
},"sl":function(n){
  if ((n % 100) == 1) {
    return 'one';
  }
  if ((n % 100) == 2) {
    return 'two';
  }
  if ((n % 100) == 3 || (n % 100) == 4) {
    return 'few';
  }
  return 'other';
},"sq":function(n){return n===1?"one":"other"},"sr":function(n){
  if ((n % 10) == 1 && (n % 100) != 11) {
    return 'one';
  }
  if ((n % 10) >= 2 && (n % 10) <= 4 &&
      ((n % 100) < 12 || (n % 100) > 14) && n == Math.floor(n)) {
    return 'few';
  }
  if ((n % 10) === 0 || ((n % 10) >= 5 && (n % 10) <= 9) ||
      ((n % 100) >= 11 && (n % 100) <= 14) && n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"sv":function(n){return n===1?"one":"other"},"ta":function(n){return n===1?"one":"other"},"th":function(n){return "other"},"tr":function(n){return n===1?"one":"other"},"uk":function(n){
  if ((n % 10) == 1 && (n % 100) != 11) {
    return 'one';
  }
  if ((n % 10) >= 2 && (n % 10) <= 4 &&
      ((n % 100) < 12 || (n % 100) > 14) && n == Math.floor(n)) {
    return 'few';
  }
  if ((n % 10) === 0 || ((n % 10) >= 5 && (n % 10) <= 9) ||
      ((n % 100) >= 11 && (n % 100) <= 14) && n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"ur":function(n){return n===1?"one":"other"},"vi":function(n){return "other"},"zh":function(n){return "other"}},
c:function(d,k){if(!d)throw new Error("MessageFormat: Data required for '"+k+"'.")},
n:function(d,k,o){if(isNaN(d[k]))throw new Error("MessageFormat: '"+k+"' isn't a number.");return d[k]-(o||0)},
v:function(d,k){craft_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){craft_locale.c(d,k);return d[k] in p?p[d[k]]:(k=craft_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){craft_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).craft_locale = {
"blockDestroyBlock":function(d){return "bloc détruire"},
"blockIf":function(d){return "si"},
"blockIfLavaAhead":function(d){return "if lava ahead"},
"blockMoveForward":function(d){return "avancer plus"},
"blockPlaceTorch":function(d){return "place torch"},
"blockPlaceXAheadAhead":function(d){return "devant"},
"blockPlaceXAheadPlace":function(d){return "place"},
"blockPlaceXPlace":function(d){return "place"},
"blockPlantCrop":function(d){return "plant crop"},
"blockShear":function(d){return "shear"},
"blockTillSoil":function(d){return "sol labouré"},
"blockTurnLeft":function(d){return "tourner à gauche"},
"blockTurnRight":function(d){return "tourner à droite"},
"blockTypeBedrock":function(d){return "bedrock"},
"blockTypeBricks":function(d){return "briques"},
"blockTypeClay":function(d){return "argile"},
"blockTypeClayHardened":function(d){return "hardened clay"},
"blockTypeCobblestone":function(d){return "cobblestone"},
"blockTypeDirt":function(d){return "dirt"},
"blockTypeDirtCoarse":function(d){return "coarse dirt"},
"blockTypeEmpty":function(d){return "vide"},
"blockTypeFarmlandWet":function(d){return "farmland"},
"blockTypeGlass":function(d){return "verre"},
"blockTypeGrass":function(d){return "herbe"},
"blockTypeGravel":function(d){return "gravel"},
"blockTypeLava":function(d){return "lave"},
"blockTypeLogAcacia":function(d){return "bûche d'acacia"},
"blockTypeLogBirch":function(d){return "birch log"},
"blockTypeLogJungle":function(d){return "jungle log"},
"blockTypeLogOak":function(d){return "bûche de chêne"},
"blockTypeLogSpruce":function(d){return "spruce log"},
"blockTypeOreCoal":function(d){return "minerai de charbon"},
"blockTypeOreDiamond":function(d){return "minerai de diamant"},
"blockTypeOreEmerald":function(d){return "minerai d'émeraude"},
"blockTypeOreGold":function(d){return "minerai d'or"},
"blockTypeOreIron":function(d){return "minerai de fer"},
"blockTypeOreLapis":function(d){return "lapis ore"},
"blockTypeOreRedstone":function(d){return "redstone ore"},
"blockTypePlanksAcacia":function(d){return "acacia planks"},
"blockTypePlanksBirch":function(d){return "birch planks"},
"blockTypePlanksJungle":function(d){return "jungle planks"},
"blockTypePlanksOak":function(d){return "oak planks"},
"blockTypePlanksSpruce":function(d){return "spruce planks"},
"blockTypeRail":function(d){return "rail"},
"blockTypeSand":function(d){return "sable"},
"blockTypeSandstone":function(d){return "sandstone"},
"blockTypeStone":function(d){return "pierre"},
"blockTypeTnt":function(d){return "TNT"},
"blockTypeTree":function(d){return "arbre"},
"blockTypeWater":function(d){return "eau"},
"blockTypeWool":function(d){return "laine"},
"blockWhileXAheadAhead":function(d){return "devant"},
"blockWhileXAheadDo":function(d){return "faire"},
"blockWhileXAheadWhile":function(d){return "tant que"},
"generatedCodeDescription":function(d){return "En faisant glisser et en plaçant des blocs dans ce puzzle, tu as créé un ensemble d'instructions dans un langage informatique appelé Javascript. Ce code indique aux ordinateurs ce qu'il faut afficher à l'écran. Tout ce que tu verras et feras dans Minecraft fonctionne également avec des lignes de code informatique comme celles-ci."},
"houseSelectChooseFloorPlan":function(d){return "Choose the floor plan for your house."},
"houseSelectEasy":function(d){return "Facile"},
"houseSelectHard":function(d){return "Difficile"},
"houseSelectLetsBuild":function(d){return "Allons construire une maison."},
"houseSelectMedium":function(d){return "Moyen"},
"keepPlayingButton":function(d){return "Keep Playing"},
"level10FailureMessage":function(d){return "Cover up the lava to walk across, then mine two of the iron blocks on the other side."},
"level11FailureMessage":function(d){return "Make sure to place cobblestone ahead if there is lava ahead. This will let you safely mine this row of resources."},
"level12FailureMessage":function(d){return "Be sure to mine 3 redstone blocks. This combines what you learned from building your house and using \"if\" statements to avoid falling in lava."},
"level13FailureMessage":function(d){return "Place \"rail\" sur le chemin de terre allant de ta porte au bord de la carte."},
"level1FailureMessage":function(d){return "Tu dois utiliser des commandes pour marcher jusqu'au mouton."},
"level1TooFewBlocksMessage":function(d){return "Essaie d'utiliser plus de commande pour marcher jusqu'au mouton."},
"level2FailureMessage":function(d){return "Pour abattre un arbre, marche jusqu'à son tronc et utilise la commande \"détruire bloc\"."},
"level2TooFewBlocksMessage":function(d){return "Essaie d'utiliser plus de commandes pour abattre l'arbre. Marche jusqu'au tronc et utilise la commande \"détruire bloc\"."},
"level3FailureMessage":function(d){return "To gather wool from both sheep, walk to each one and use the \"shear\" command. Remember to use turn commands to reach the sheep."},
"level3TooFewBlocksMessage":function(d){return "Try using more commands to gather wool from both sheep. Walk to each one and use the \"shear\" command."},
"level4FailureMessage":function(d){return "Tu dois utiliser la commande \"détruire bloc\" sur chacun des trois troncs d'arbre."},
"level5FailureMessage":function(d){return "Place your blocks on the dirt outline to build a wall. The pink \"repeat\" command will run commands placed inside it, like \"place block\" and \"move forward\"."},
"level6FailureMessage":function(d){return "Place blocks on the dirt outline of the house to complete the puzzle."},
"level7FailureMessage":function(d){return "Use the \"plant\" command to place crops on each patch of dark tilled soil."},
"level8FailureMessage":function(d){return "Si tu touches une liane, elle explosera. Faufile-toi entre elles et entre dans ta maison."},
"level9FailureMessage":function(d){return "N'oublie pas de placer au moins 2 torches pour éclairer ton chemin ET extrais au moins 2 charbons."},
"minecraftBlock":function(d){return "bloc"},
"nextLevelMsg":function(d){return "Puzzle "+craft_locale.v(d,"puzzleNumber")+" complété. Félicitations !"},
"playerSelectChooseCharacter":function(d){return "Choisis ton personnage."},
"playerSelectChooseSelectButton":function(d){return "Selection"},
"playerSelectLetsGetStarted":function(d){return "Commençons."},
"reinfFeedbackMsg":function(d){return "Tu peux appuyer sur \"Continuer à jouer\" pour retourner jouer à ton jeu."},
"replayButton":function(d){return "Rejouer"},
"selectChooseButton":function(d){return "Selection"},
"tooManyBlocksFail":function(d){return "Énigme "+craft_locale.v(d,"puzzleNumber")+" complétée. Félicitations ! Il est possible de la compléter avec "+craft_locale.p(d,"numBlocks",0,"fr",{"one":"1 bloc","other":craft_locale.n(d,"numBlocks")+" blocs"})+"."}};