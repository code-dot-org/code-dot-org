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
"blockDestroyBlock":function(d){return "izkoplji kocko"},
"blockIf":function(d){return "če"},
"blockIfLavaAhead":function(d){return "če je lava spredaj"},
"blockMoveForward":function(d){return "premakni se naprej"},
"blockPlaceTorch":function(d){return "postavi baklo"},
"blockPlaceXAheadAhead":function(d){return "spredaj"},
"blockPlaceXAheadPlace":function(d){return "postavi"},
"blockPlaceXPlace":function(d){return "postavi"},
"blockPlantCrop":function(d){return "posadi rastlino"},
"blockShear":function(d){return "ostriži"},
"blockTillSoil":function(d){return "prekoplji zemljo"},
"blockTurnLeft":function(d){return "obrni se levo"},
"blockTurnRight":function(d){return "obrni se desno"},
"blockTypeBedrock":function(d){return "živa skala"},
"blockTypeBricks":function(d){return "opeke"},
"blockTypeClay":function(d){return "glina"},
"blockTypeClayHardened":function(d){return "trda glina"},
"blockTypeCobblestone":function(d){return "tlakovec"},
"blockTypeDirt":function(d){return "umazanijo"},
"blockTypeDirtCoarse":function(d){return "zemlja"},
"blockTypeEmpty":function(d){return "prazno"},
"blockTypeFarmlandWet":function(d){return "obdelana zemlja"},
"blockTypeGlass":function(d){return "steklo"},
"blockTypeGrass":function(d){return "trava"},
"blockTypeGravel":function(d){return "gramoz"},
"blockTypeLava":function(d){return "lava"},
"blockTypeLogAcacia":function(d){return "akacijin hlod"},
"blockTypeLogBirch":function(d){return "brezin hlod"},
"blockTypeLogJungle":function(d){return "džuglski hlod"},
"blockTypeLogOak":function(d){return "hrastov hlod"},
"blockTypeLogSpruce":function(d){return "smrekin hlod"},
"blockTypeOreCoal":function(d){return "premogova ruda"},
"blockTypeOreDiamond":function(d){return "diamanova ruda"},
"blockTypeOreEmerald":function(d){return "emeraldova ruda"},
"blockTypeOreGold":function(d){return "zlata ruda"},
"blockTypeOreIron":function(d){return "železova ruda"},
"blockTypeOreLapis":function(d){return "lapizova ruda"},
"blockTypeOreRedstone":function(d){return "rdečekamena ruda"},
"blockTypePlanksAcacia":function(d){return "akacijine deske"},
"blockTypePlanksBirch":function(d){return "brezine deske"},
"blockTypePlanksJungle":function(d){return "džunglske deske"},
"blockTypePlanksOak":function(d){return "hrastove deske"},
"blockTypePlanksSpruce":function(d){return "smrekine deske"},
"blockTypeRail":function(d){return "tračnice"},
"blockTypeSand":function(d){return "pesek"},
"blockTypeSandstone":function(d){return "peščenjak"},
"blockTypeStone":function(d){return "kamen"},
"blockTypeTnt":function(d){return "tnt"},
"blockTypeTree":function(d){return "drevo"},
"blockTypeWater":function(d){return "voda"},
"blockTypeWool":function(d){return "volna"},
"blockWhileXAheadAhead":function(d){return "spredaj"},
"blockWhileXAheadDo":function(d){return "izvrši"},
"blockWhileXAheadWhile":function(d){return "dokler"},
"generatedCodeDescription":function(d){return "Z vlečenjem in spuščanjem blokov v tej setavljanki, ustvarite niz navodil v računalniškem jeziku Javascript. Ta koda pove računalniku kaj naj prikaže na zaslonu. Vse kar vidiš in narediš v Minecraftu se tudi začne z vrsticami računalniške kode kot ta."},
"houseSelectChooseFloorPlan":function(d){return "Izberite tloris za vašo hišo."},
"houseSelectEasy":function(d){return "Enostavno"},
"houseSelectHard":function(d){return "Težko"},
"houseSelectLetsBuild":function(d){return "Zgradimo hišo."},
"houseSelectMedium":function(d){return "Srednje težko"},
"keepPlayingButton":function(d){return "Igraj naprej"},
"level10FailureMessage":function(d){return "Prekrij lavo, da lahko prideš čez, nato nakoplji dve železovi rudi na drugi strani."},
"level11FailureMessage":function(d){return "Make sure to place cobblestone ahead if there is lava ahead. This will let you safely mine this row of resources."},
"level12FailureMessage":function(d){return "Be sure to mine 3 redstone blocks. This combines what you learned from building your house and using \"if\" statements to avoid falling in lava."},
"level13FailureMessage":function(d){return "Place \"rail\" along the dirt path leading from your door to the edge of the map."},
"level1FailureMessage":function(d){return "You need to use commands to walk to the sheep."},
"level1TooFewBlocksMessage":function(d){return "Try using more commands to walk to the sheep."},
"level2FailureMessage":function(d){return "To chop down a tree, walk to its trunk and use the \"destroy block\" command."},
"level2TooFewBlocksMessage":function(d){return "Try using more commands to chop down the tree. Walk to its trunk and use the \"destroy block\" command."},
"level3FailureMessage":function(d){return "To gather wool from both sheep, walk to each one and use the \"shear\" command. Remember to use turn commands to reach the sheep."},
"level3TooFewBlocksMessage":function(d){return "Try using more commands to gather wool from both sheep. Walk to each one and use the \"shear\" command."},
"level4FailureMessage":function(d){return "You must use the \"destroy block\" command on each of the three tree trunks."},
"level5FailureMessage":function(d){return "Place your blocks on the dirt outline to build a wall. The pink \"repeat\" command will run commands placed inside it, like \"place block\" and \"move forward\"."},
"level6FailureMessage":function(d){return "Place blocks on the dirt outline of the house to complete the puzzle."},
"level7FailureMessage":function(d){return "Use the \"plant\" command to place crops on each patch of dark tilled soil."},
"level8FailureMessage":function(d){return "Če se dotakneš Grozečka, ga bo razneslo. Odkradi se mimo njih do tvoje hiše."},
"level9FailureMessage":function(d){return "Don't forget to place at least 2 torches to light your way AND mine at least 2 coal."},
"minecraftBlock":function(d){return "kocka"},
"nextLevelMsg":function(d){return "Naloga "+craft_locale.v(d,"puzzleNumber")+" opravljena. Čestitke!"},
"playerSelectChooseCharacter":function(d){return "Izberi svojega junaka."},
"playerSelectChooseSelectButton":function(d){return "Izberite"},
"playerSelectLetsGetStarted":function(d){return "Začnimo."},
"reinfFeedbackMsg":function(d){return "Lahko pritisneš \"Igraj naprej\", da nadaljuješ z igranjem."},
"replayButton":function(d){return "Ponovi"},
"selectChooseButton":function(d){return "Izberite"},
"tooManyBlocksFail":function(d){return "Puzzle "+craft_locale.v(d,"puzzleNumber")+" completed. Congratulations! It is also possible to complete it with "+craft_locale.p(d,"numBlocks",0,"sl",{"one":"1 block","other":craft_locale.n(d,"numBlocks")+" blocks"})+"."}};