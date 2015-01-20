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
"and":function(d){return "eta"},
"booleanTrue":function(d){return "egia"},
"booleanFalse":function(d){return "gezurra"},
"blocklyMessage":function(d){return "Blockly"},
"catActions":function(d){return "Ekintzak"},
"catColour":function(d){return "Kolorea"},
"catLogic":function(d){return "Logika"},
"catLists":function(d){return "Zerrendak"},
"catLoops":function(d){return "Itzuliak"},
"catMath":function(d){return "Matematika"},
"catProcedures":function(d){return "Funtzioak"},
"catText":function(d){return "Testua"},
"catVariables":function(d){return "Aldagaiak"},
"codeTooltip":function(d){return "Ikusi sortutako Javascript kodea."},
"continue":function(d){return "Jarraitu"},
"dialogCancel":function(d){return "Ezeztatu"},
"dialogOK":function(d){return "Ongi"},
"directionNorthLetter":function(d){return "I"},
"directionSouthLetter":function(d){return "H"},
"directionEastLetter":function(d){return "E"},
"directionWestLetter":function(d){return "M"},
"end":function(d){return "end"},
"emptyBlocksErrorMsg":function(d){return "\"Errepikatu\" edo \"baldintza\" blokeak barruan beste bloke batzuk behar ditu funtzionatzeko. Egiaztatu barruko blokeak egoki kokatuak daudela."},
"emptyFunctionBlocksErrorMsg":function(d){return "The function block needs to have other blocks inside it to work."},
"errorEmptyFunctionBlockModal":function(d){return "There need to be blocks inside your function definition. Click \"edit\" and drag blocks inside the green block."},
"errorIncompleteBlockInFunction":function(d){return "Click \"edit\" to make sure you don't have any blocks missing inside your function definition."},
"errorParamInputUnattached":function(d){return "Remember to attach a block to each parameter input on the function block in your workspace."},
"errorUnusedParam":function(d){return "You added a parameter block, but didn't use it in the definition. Make sure to use your parameter by clicking \"edit\" and placing the parameter block inside the green block."},
"errorRequiredParamsMissing":function(d){return "Create a parameter for your function by clicking \"edit\" and adding the necessary parameters. Drag the new parameter blocks into your function definition."},
"errorUnusedFunction":function(d){return "You created a function, but never used it on your workspace! Click on \"Functions\" in the toolbox and make sure you use it in your program."},
"errorQuestionMarksInNumberField":function(d){return "Try replacing \"???\" with a value."},
"extraTopBlocks":function(d){return "You have unattached blocks. Did you mean to attach these to the \"when run\" block?"},
"finalStage":function(d){return "Zorionak! Azkeneko eszenatokia osatu duzu."},
"finalStageTrophies":function(d){return "Zorionak! Azkeneko eszenatokia osatu duzu eta "+locale.p(d,"numTrophies",0,"eu",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"finish":function(d){return "Finish"},
"generatedCodeInfo":function(d){return "Goi mailako unibertsitateek (adib., "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+" ) ere blokeetan oinarritutako kodeketa irakasten dute. Baina zuk erabilitako blokeen azpian munduan zehar erabilera zabalen duen kode hizkuntza dago, JavaScript:"},
"hashError":function(d){return "Barkatu. %1 ez dator bat inongo gordetako programarekin."},
"help":function(d){return "Laguntza"},
"hintTitle":function(d){return "Aholkua:"},
"jump":function(d){return "salto egin"},
"levelIncompleteError":function(d){return "Beharrezko diren kode mota guztiak erabiltzen ari zara baina ez modu egokian."},
"listVariable":function(d){return "zerrenda"},
"makeYourOwnFlappy":function(d){return "Egin zure Flappy joko propioa"},
"missingBlocksErrorMsg":function(d){return "Probatu azpiko bloke bat edo gehiago pule hau ebazteko."},
"nextLevel":function(d){return "Zorionak!  "+locale.v(d,"puzzleNumber")+" puzlea osatu duzu."},
"nextLevelTrophies":function(d){return "Zorionak!  "+locale.v(d,"puzzleNumber")+" puzlea osatu duzu eta  "+locale.p(d,"numTrophies",0,"eu",{"one":"garaikur 1","other":locale.n(d,"numTrophies")+" garaikur"})+" irabazi dituzu."},
"nextStage":function(d){return "Zorionak! "+locale.v(d,"stageName")+" osatu duzu."},
"nextStageTrophies":function(d){return "Zorionak!  "+locale.v(d,"stageName")+" osatu duzu eta "+locale.p(d,"numTrophies",0,"eu",{"one":"garaikur 1","other":locale.n(d,"numTrophies")+" garaikur"})+" irabazi dituzu."},
"numBlocksNeeded":function(d){return "Zorionak! "+locale.v(d,"puzzleNumber")+". puzlea osatu dizu. (Hala ere "+locale.p(d,"numBlocks",0,"eu",{"one":"bloke 1","other":locale.n(d,"numBlocks")+" bloke"})+" erabili ahal zenituen."},
"numLinesOfCodeWritten":function(d){return " "+locale.p(d,"numLines",0,"eu",{"one":"lerro 1","other":locale.n(d,"numLines")+" lerro"})+" kode idatzi berri dituzu!\n"},
"play":function(d){return "play"},
"print":function(d){return "Print"},
"puzzleTitle":function(d){return locale.v(d,"stage_total")+"etik, "+locale.v(d,"puzzle_number")+" puzlea"},
"repeat":function(d){return "errepikatu"},
"resetProgram":function(d){return "Leheneratu"},
"runProgram":function(d){return "Abiarazi"},
"runTooltip":function(d){return "Lan eremuko blokeek definitutako programa abiarazi."},
"score":function(d){return "score"},
"showCodeHeader":function(d){return "Ikusi Iturburua"},
"showBlocksHeader":function(d){return "Show Blocks"},
"showGeneratedCode":function(d){return "Ikusi iturburua"},
"stringEquals":function(d){return "string=?"},
"subtitle":function(d){return "programazio ingurune bisuala"},
"textVariable":function(d){return "testua"},
"tooFewBlocksMsg":function(d){return "Beharrezko bloke mota guztiak erabiltzen ari zara, baina saiatu mota hontako bloke gehiago erabiltzen puzlea osatzeko."},
"tooManyBlocksMsg":function(d){return "Puzlea hau  <x id='START_SPAN'/><x id='END_SPAN'/> blokeekin ebaz daiteke."},
"tooMuchWork":function(d){return "Lan asko eginarazi didazu! Saiatu zaitezke gutxiagotan errepikatzen?"},
"toolboxHeader":function(d){return "Blokeak"},
"openWorkspace":function(d){return "Nola dabilen"},
"totalNumLinesOfCodeWritten":function(d){return "Guztira:  "+locale.p(d,"numLines",0,"eu",{"one":"kode lerro 1","other":locale.n(d,"numLines")+" lerro kode"})+"."},
"tryAgain":function(d){return "Saiatu berriro"},
"hintRequest":function(d){return "See hint"},
"backToPreviousLevel":function(d){return "Atzera aurreko mailara"},
"saveToGallery":function(d){return "Save to gallery"},
"savedToGallery":function(d){return "Saved in gallery!"},
"shareFailure":function(d){return "Sorry, we can't share this program."},
"workspaceHeader":function(d){return "Mihiztatu zure blokeak hemen: "},
"workspaceHeaderJavaScript":function(d){return "Type your JavaScript code here"},
"infinity":function(d){return "Infinito"},
"rotateText":function(d){return "Biratu zure gailua."},
"orientationLock":function(d){return "Itzali orientazio lokatzea gailuaren aukeretan."},
"wantToLearn":function(d){return "Kodetzen ikasi nahi?"},
"watchVideo":function(d){return "Ikusi Bideoa"},
"when":function(d){return "when"},
"whenRun":function(d){return "when run"},
"tryHOC":function(d){return "Probatu Kode Ordua"},
"signup":function(d){return "Izena eman sarrera kurtsorako"},
"hintHeader":function(d){return "Hemen aholkua:"},
"genericFeedback":function(d){return "See how you ended up, and try to fix your program."},
"toggleBlocksErrorMsg":function(d){return "You need to correct an error in your program before it can be shown as blocks."},
"defaultTwitterText":function(d){return "Check out what I made"}};