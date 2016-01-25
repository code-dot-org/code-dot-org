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
"blockDestroyBlock":function(d){return "détruire un bloc"},
"blockIf":function(d){return "si"},
"blockIfLavaAhead":function(d){return "si lave devant"},
"blockMoveForward":function(d){return "avancer plus"},
"blockPlaceTorch":function(d){return "placer torche"},
"blockPlaceXAheadAhead":function(d){return "devant"},
"blockPlaceXAheadPlace":function(d){return "placer"},
"blockPlaceXPlace":function(d){return "placer"},
"blockPlantCrop":function(d){return "planter culture"},
"blockShear":function(d){return "tondre"},
"blockTillSoil":function(d){return "faucher sol"},
"blockTurnLeft":function(d){return "tourner à gauche"},
"blockTurnRight":function(d){return "tourner à droite"},
"blockTypeBedrock":function(d){return "adminium"},
"blockTypeBricks":function(d){return "briques"},
"blockTypeClay":function(d){return "argile"},
"blockTypeClayHardened":function(d){return "argile durcie"},
"blockTypeCobblestone":function(d){return "pierre taillée"},
"blockTypeDirt":function(d){return "terre"},
"blockTypeDirtCoarse":function(d){return "terre stérile"},
"blockTypeEmpty":function(d){return "vide"},
"blockTypeFarmlandWet":function(d){return "terre labourée"},
"blockTypeGlass":function(d){return "verre"},
"blockTypeGrass":function(d){return "hautes herbes"},
"blockTypeGravel":function(d){return "gravier"},
"blockTypeLava":function(d){return "lave"},
"blockTypeLogAcacia":function(d){return "bûche d'acacia"},
"blockTypeLogBirch":function(d){return "tronc de bouleau"},
"blockTypeLogJungle":function(d){return "tronc de jungle"},
"blockTypeLogOak":function(d){return "tronc de chêne"},
"blockTypeLogSpruce":function(d){return "tronc de sapin"},
"blockTypeOreCoal":function(d){return "minerai de charbon"},
"blockTypeOreDiamond":function(d){return "minerai de diamant"},
"blockTypeOreEmerald":function(d){return "minerai d'émeraude"},
"blockTypeOreGold":function(d){return "minerai d'or"},
"blockTypeOreIron":function(d){return "minerai de fer"},
"blockTypeOreLapis":function(d){return "minerai de lapis-lazuli"},
"blockTypeOreRedstone":function(d){return "minerai de redstone"},
"blockTypePlanksAcacia":function(d){return "planches en acacia"},
"blockTypePlanksBirch":function(d){return "planches en bouleau"},
"blockTypePlanksJungle":function(d){return "planches de bois tropical"},
"blockTypePlanksOak":function(d){return "planches en chêne"},
"blockTypePlanksSpruce":function(d){return "planches en sapin"},
"blockTypeRail":function(d){return "rail"},
"blockTypeSand":function(d){return "sable"},
"blockTypeSandstone":function(d){return "grès"},
"blockTypeStone":function(d){return "roche"},
"blockTypeTnt":function(d){return "TNT"},
"blockTypeTree":function(d){return "arbre"},
"blockTypeWater":function(d){return "eau"},
"blockTypeWool":function(d){return "laine"},
"blockWhileXAheadAhead":function(d){return "devant"},
"blockWhileXAheadDo":function(d){return "faire"},
"blockWhileXAheadWhile":function(d){return "tant que"},
"generatedCodeDescription":function(d){return "En glissant et en plaçant des blocs dans ce casse-tête, vous avez créé un ensemble d'instructions dans un langage informatique appelé JavaScript. Ce code indique à l'ordinateur ce qu'il faut afficher à l'écran. Tout ce que vous voyez et faites dans Minecraft découle aussi de lignes de code informatique comme celles-ci."},
"houseSelectChooseFloorPlan":function(d){return "Choisissez le plan de votre maison."},
"houseSelectEasy":function(d){return "Facile"},
"houseSelectHard":function(d){return "Difficile"},
"houseSelectLetsBuild":function(d){return "Construisons une maison."},
"houseSelectMedium":function(d){return "Moyenne"},
"keepPlayingButton":function(d){return "Continuer à jouer"},
"level10FailureMessage":function(d){return "Couvrez la lave pour la traverser, puis minez deux blocs de fer de l'autre côté."},
"level11FailureMessage":function(d){return "Veillez à placer de la pierre taillée devant vous s'il y a de la lave. Vous pourrez ainsi miner sans risque cette rangée de ressources."},
"level12FailureMessage":function(d){return "Minez 3 blocs de redstone. Pour cela, appliquez ce que vous avez appris en construisant votre maison et utilisez des expressions \"si\" pour éviter de tomber dans la lave."},
"level13FailureMessage":function(d){return "Placez un \"rail\" sur le chemin de terre qui lie votre porte au bord de la carte."},
"level1FailureMessage":function(d){return "Vous devez utiliser des commandes pour rejoindre les moutons en marchant."},
"level1TooFewBlocksMessage":function(d){return "Essayez d'utiliser d'autres commandes pour rejoindre les moutons en marchant."},
"level2FailureMessage":function(d){return "Pour couper un arbre, atteignez son tronc et utilisez la commande \"détruire un bloc\"."},
"level2TooFewBlocksMessage":function(d){return "Essayez d'utiliser d'autres commandes pour couper l'arbre. Atteignez son tronc et utilisez la commande \"détruire un bloc\"."},
"level3FailureMessage":function(d){return "Pour récupérer la laine des deux moutons, atteignez chacun d'eux et utilisez la commande \"tondre\". Pensez à utiliser des commandes pour tourner afin d'atteindre les moutons."},
"level3TooFewBlocksMessage":function(d){return "Essayez d'utiliser d'autres commandes pour récupérer la laine des deux moutons. Atteignez chacun d'eux et utilisez la commande \"tondre\"."},
"level4FailureMessage":function(d){return "Vous devez utiliser la commande \"détruire un bloc\" pour chacun des trois troncs d'arbre."},
"level5FailureMessage":function(d){return "Placez vos blocs sur le contour en terre pour construire un mur. La commande de \"répétition\" (rose) exécute les commandes qui lui sont affectées, par exemple \"placer un bloc\" et \"avancer\"."},
"level6FailureMessage":function(d){return "Placez des blocs sur le contour en terre de la maison pour terminer le casse-tête."},
"level7FailureMessage":function(d){return "Utilisez la commande \"planter\" pour placer des cultures sur chaque parcelle de sol fauché (sombre)."},
"level8FailureMessage":function(d){return "Si vous touchez un Creeper, il explose. Faufilez-vous à travers eux et entrez dans votre maison."},
"level9FailureMessage":function(d){return "Placez au moins 2 torches pour éclairer votre chemin ET minez au moins 2 blocs de charbon."},
"minecraftBlock":function(d){return "bloc"},
"nextLevelMsg":function(d){return "Casse-tête "+craft_locale.v(d,"puzzleNumber")+" terminé. Bravo !"},
"playerSelectChooseCharacter":function(d){return "Choisissez votre personnage."},
"playerSelectChooseSelectButton":function(d){return "Sélectionner"},
"playerSelectLetsGetStarted":function(d){return "Commençons."},
"reinfFeedbackMsg":function(d){return "Vous pouvez choisir \"Continuer à jouer\" pour reprendre votre partie."},
"replayButton":function(d){return "Rejouer"},
"selectChooseButton":function(d){return "Sélectionner"},
"tooManyBlocksFail":function(d){return "Casse-tête "+craft_locale.v(d,"puzzleNumber")+" terminé. Bravo ! Vous pouvez aussi le terminer avec "+craft_locale.p(d,"numBlocks",0,"fr",{"one":"1 bloc","other":craft_locale.n(d,"numBlocks")+" blocs"})+"."}};