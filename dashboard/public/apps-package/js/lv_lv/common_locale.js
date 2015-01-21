var locale = {lc:{"ar":function(n){
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
},"da":function(n){return n===1?"one":"other"},"de":function(n){return n===1?"one":"other"},"el":function(n){return n===1?"one":"other"},"es":function(n){return n===1?"one":"other"},"et":function(n){return n===1?"one":"other"},"eu":function(n){return n===1?"one":"other"},"fa":function(n){return "other"},"fi":function(n){return n===1?"one":"other"},"fil":function(n){return n===0||n==1?"one":"other"},"fr":function(n){return Math.floor(n)===0||Math.floor(n)==1?"one":"other"},"he":function(n){return n===1?"one":"other"},"hi":function(n){return n===0||n==1?"one":"other"},"hr":function(n){
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
},"mk":function(n){return (n%10)==1&&n!=11?"one":"other"},"ms":function(n){return "other"},"mt":function(n){
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
v:function(d,k){locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){locale.c(d,k);return d[k] in p?p[d[k]]:(k=locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).locale = {
"and":function(d){return "un"},
"booleanTrue":function(d){return "patiess"},
"booleanFalse":function(d){return "nepatiess"},
"blocklyMessage":function(d){return "Blockly"},
"catActions":function(d){return "Darbības"},
"catColour":function(d){return "Krāsa"},
"catLogic":function(d){return "Loģika"},
"catLists":function(d){return "Saraksti"},
"catLoops":function(d){return "Cikli"},
"catMath":function(d){return "Matemātika"},
"catProcedures":function(d){return "Funkcijas"},
"catText":function(d){return "Teksts"},
"catVariables":function(d){return "Mainīgie"},
"codeTooltip":function(d){return "Skatīt ģenerēto JavaScript kodu."},
"continue":function(d){return "Turpināt"},
"dialogCancel":function(d){return "Atcelt"},
"dialogOK":function(d){return "Labi"},
"directionNorthLetter":function(d){return "Z"},
"directionSouthLetter":function(d){return "D"},
"directionEastLetter":function(d){return "A"},
"directionWestLetter":function(d){return "R"},
"end":function(d){return "beigas"},
"emptyBlocksErrorMsg":function(d){return "\"Atkārtojuma\" vai \"ja\" blokam nepieciešams saturēt citus blokus lai strādātu. Pārliecinieties, ka iekšējie bloki pareizi iederas ārējā blokā."},
"emptyFunctionBlocksErrorMsg":function(d){return "Lai tas strādātu, funkciju blokam ir nepieciešami citi bloki tajā."},
"errorEmptyFunctionBlockModal":function(d){return "Funkcijā jābūt blokiem. Klikšķini \"labot\" un velc blokus zaļajā blokā."},
"errorIncompleteBlockInFunction":function(d){return "Klikšķini \"labot\", lai pārliecinātkos, ka definētajā funkcijā nepietrūkst neviena bloka."},
"errorParamInputUnattached":function(d){return "Atceries savā darba vietā pievienot bloku katra parametra ievadei funkcijā."},
"errorUnusedParam":function(d){return "Tu pievienoji parametra bloku, bet neizmanto to funkcijas definēšanā. Pārliecinies, ka izmanto parametru, klikšķinot \"labot\" un ievietojot parametra bloku zaļajā blokā."},
"errorRequiredParamsMissing":function(d){return "Izveido parametru funkcijai, klikšķinot \"labot\" un pievienojot nepieciešamos parametrus. Velc jauno parametra bloku savā definētajā funkcijā."},
"errorUnusedFunction":function(d){return "Tu izveidoji funkciju, bet neizmanto to savā darbavietā. Klikšķini uz \"funkcijas\" rīku joslā un pārliecinies, ka izmanto to savā programmā."},
"errorQuestionMarksInNumberField":function(d){return "Nomaini \"???\" ar vērtību."},
"extraTopBlocks":function(d){return "Tev ir nepievienoti bloki. Vai tu domā pievienot šos \"kad palaists\" blokam?"},
"finalStage":function(d){return "Apsveicu! Pēdējais posms ir pabeigts."},
"finalStageTrophies":function(d){return "Apsveicu! Tu esi pabeidzis pēdējos posmu un ieguvis "+locale.p(d,"numTrophies",0,"lv",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"finish":function(d){return "Pabeigt"},
"generatedCodeInfo":function(d){return "Arī labākās universitātēs apmāca vizuālo programmēšanu (piemēram, "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). Bet pamatā bloki, ko tu esi izveidojies, var arī tikt parādīti valodā JavaScript - vienā no pasaules populārākajām programmēšanas valodām:"},
"hashError":function(d){return "Atvainojiet, '%1' neatbilst nevienai saglabātai programmai."},
"help":function(d){return "Palīdzība"},
"hintTitle":function(d){return "Padoms:"},
"jump":function(d){return "lēkt"},
"levelIncompleteError":function(d){return "Jūs izmantojat visus nepieciešamos bloka veidus, bet ne pareizā veidā."},
"listVariable":function(d){return "saraksts"},
"makeYourOwnFlappy":function(d){return "Izveido savu \"Flappy\" spēli"},
"missingBlocksErrorMsg":function(d){return "Izmēģini vienu vai vairākus no zemākesošajiem blokiem, lai atrisinātu šo mīklu."},
"nextLevel":function(d){return "Apsveicu! Esi pabeidzis mīklu "+locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Apsveicu! Tu pabeidzi mīklu "+locale.v(d,"puzzleNumber")+" un ieguvi "+locale.p(d,"numTrophies",0,"lv",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"nextStage":function(d){return "Apsveicu! Tu pabeidzi "+locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Apsveicu! tu pabeidzi "+locale.v(d,"stageName")+" un ieguvi "+locale.p(d,"numTrophies",0,"lv",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"numBlocksNeeded":function(d){return "Apsveicu! Tu pabeidzis mīkl "+locale.v(d,"puzzleNumber")+". (Tomēr tu būtu varējis izmantot tikai "+locale.p(d,"numBlocks",0,"lv",{"one":"1 block","other":locale.n(d,"numBlocks")+" blocks"})+".)"},
"numLinesOfCodeWritten":function(d){return "Tu tikko uzrakstīji "+locale.p(d,"numLines",0,"lv",{"one":"1 line","other":locale.n(d,"numLines")+" lines"})+" koda!"},
"play":function(d){return "spēlēt"},
"print":function(d){return "Drukāt"},
"puzzleTitle":function(d){return "Mīkla "+locale.v(d,"puzzle_number")+" no "+locale.v(d,"stage_total")},
"repeat":function(d){return "atkārtot"},
"resetProgram":function(d){return "Atiestatīt"},
"runProgram":function(d){return "Palaist"},
"runTooltip":function(d){return "Palaid programmu, kura izveidota no darba vietā esošajiem blokiem."},
"score":function(d){return "rezultāts"},
"showCodeHeader":function(d){return "Parādīt Kodu"},
"showBlocksHeader":function(d){return "Parādīt blokus"},
"showGeneratedCode":function(d){return "Parādīt kodu"},
"stringEquals":function(d){return "virkne=?"},
"subtitle":function(d){return "vizuāla programmēšanas vide"},
"textVariable":function(d){return "teksts"},
"tooFewBlocksMsg":function(d){return "Tu izmanto visus nepieciešamos bloku veidus, bet, lai pabeigtu šo mīklu, mēģini izmantot vēl vairāk šāda veida blokus."},
"tooManyBlocksMsg":function(d){return "Mīkla var tikt atrisināta ar <x id='START_SPAN'/><x id='END_SPAN'/> blokiem."},
"tooMuchWork":function(d){return "Tu man liki daudz darīt! Vari pamēģināt atkārtot mazāk reižu?"},
"toolboxHeader":function(d){return "Bloki"},
"openWorkspace":function(d){return "Kā tas darbojas"},
"totalNumLinesOfCodeWritten":function(d){return "Visu laiko kopējais:  "+locale.p(d,"numLines",0,"lv",{"one":"1 rinda","other":locale.n(d,"numLines")+" rindas"})+"  koda"},
"tryAgain":function(d){return "Mēgini vēlreiz"},
"hintRequest":function(d){return "Apskatīt padomu"},
"backToPreviousLevel":function(d){return "Atpakaļ uz iepriekšējo līmeni"},
"saveToGallery":function(d){return "Saglabāt galerijā"},
"savedToGallery":function(d){return "Saglabāts galerijā!"},
"shareFailure":function(d){return "Piedod, mēs nevaram izplatīt šo programmu."},
"workspaceHeader":function(d){return "Saliec savus blokus šeit: "},
"workspaceHeaderJavaScript":function(d){return "Raksti savu JavaScript kodu šeit"},
"infinity":function(d){return "Bezgalība"},
"rotateText":function(d){return "Pagriez savu ierīci."},
"orientationLock":function(d){return "Ieslēdz rotāciju ierīces uzstādījumos."},
"wantToLearn":function(d){return "Vai vēlies iemācīties programmēt?"},
"watchVideo":function(d){return "Noskaties video"},
"when":function(d){return "kad"},
"whenRun":function(d){return "kad izpilda"},
"tryHOC":function(d){return "Izmēģini Programmēšanas stundu"},
"signup":function(d){return "Piereģistrējies ievadkursam"},
"hintHeader":function(d){return "Padoms:"},
"genericFeedback":function(d){return "Apskati rezultātu un pamēģini salabot savu programmu."},
"toggleBlocksErrorMsg":function(d){return "You need to correct an error in your program before it can be shown as blocks."},
"defaultTwitterText":function(d){return "Apskaties, ko esmu izveidojis"}};