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
"and":function(d){return "en"},
"booleanTrue":function(d){return "waar"},
"booleanFalse":function(d){return "onwaar"},
"blocklyMessage":function(d){return "Blockly"},
"catActions":function(d){return "Acties"},
"catColour":function(d){return "Kleur"},
"catLogic":function(d){return "Logica"},
"catLists":function(d){return "Lijsten"},
"catLoops":function(d){return "Lussen"},
"catMath":function(d){return "Wiskunde"},
"catProcedures":function(d){return "Functies"},
"catText":function(d){return "tekst"},
"catVariables":function(d){return "Variabelen"},
"codeTooltip":function(d){return "Zie gegenereerde JavaScript-code."},
"continue":function(d){return "Verder"},
"dialogCancel":function(d){return "Annuleren"},
"dialogOK":function(d){return "OK"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "Z"},
"directionEastLetter":function(d){return "O"},
"directionWestLetter":function(d){return "W"},
"end":function(d){return "einde"},
"emptyBlocksErrorMsg":function(d){return "De \"herhaal\" of \"als\" blokken hebben andere blokken in hun nodig om te werken. Zorg ervoor dat de binnenste blok correct past in de bevattende blok."},
"emptyFunctionBlocksErrorMsg":function(d){return "Het functie-blok moet andere blokken bevatten om te werken."},
"errorEmptyFunctionBlockModal":function(d){return "Er moeten blokken staan binnen je functie-definitie. Klik op \"bewerk\" en sleep blokken binnen het groene blok."},
"errorIncompleteBlockInFunction":function(d){return "Klik \"bewerk\" en zorg ervoor dat je geen blokken mist in je functie-definitie."},
"errorParamInputUnattached":function(d){return "Denk er aan om aan iedere parameter input op het functieblok in je werkruimte een blok toe te voegen."},
"errorUnusedParam":function(d){return "Je voegde een parameter blok toe maar gebruikte deze niet in je functie. Zorg ervoor dat je je parameter gebruikt door op \"bewerk\" te klikken en de parameter blok binnen de groene blok te plaatsen."},
"errorRequiredParamsMissing":function(d){return "Maak een parameter voor je functie door op \"bewerk\" te klikken en de nodige parameters toe te voegen. Sleep de nieuwe parameter blok in je functie-definitie."},
"errorUnusedFunction":function(d){return "Je maakte een functie  maar gebruikte deze nooit in je werkruimte! Klik op \"Functies\" in de gereedschapskist en zorg ervoor dat je ze gebruikt in je programma."},
"errorQuestionMarksInNumberField":function(d){return "Vervang \"???\" door een waarde."},
"extraTopBlocks":function(d){return "Je hebt blokken die nergens aan vast zitten. Was het je bedoeling die aan het \"bij uitvoeren\"-blok toe te voegen?"},
"finalStage":function(d){return "Gefeliciteerd! U hebt de laatste fase voltooid."},
"finalStageTrophies":function(d){return "Gefeliciteerd! U hebt de laatste fase voltooid en won "+locale.p(d,"numTrophies",0,"nl",{"one":"een trofee","other":locale.n(d,"numTrophies")+" trofeeën"})+"."},
"finish":function(d){return "Voltooien"},
"generatedCodeInfo":function(d){return "Zelf op topuniversiteiten wordt les gegevens met programmeertalen die op blokken zijn gebaseerd (bijv. "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). Maar onder de motorkop kunnen de blokken waarmee je een programma hebt gemaakt ook getoond worden in JavaScript, de programmeertaal die wereldwijd het meest wordt gebruikt:"},
"hashError":function(d){return "Sorry, '%1' komt niet overeen met een opgeslagen programma."},
"help":function(d){return "Hulp"},
"hintTitle":function(d){return "Tip:"},
"jump":function(d){return "spring"},
"levelIncompleteError":function(d){return "U gebruikt al de nodige typen van blokken, maar niet op de juiste manier."},
"listVariable":function(d){return "lijst"},
"makeYourOwnFlappy":function(d){return "Maak je eigen 'Flappy'-spel"},
"missingBlocksErrorMsg":function(d){return "Probeer een of meer van de blokken onderaan om deze puzzel op te lossen."},
"nextLevel":function(d){return "Gefeliciteerd! U voltooide puzzel "+locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Gefeliciteerd! Je hebt puzzel "+locale.v(d,"puzzleNumber")+" opgelost en je hebt "+locale.p(d,"numTrophies",0,"nl",{"one":"een trofee","other":locale.n(d,"numTrophies")+" trofeeën"})+" gewonnen."},
"nextStage":function(d){return "Gefeliciteerd! Je hebt "+locale.v(d,"stageName")+" af."},
"nextStageTrophies":function(d){return "Gefeliciteerd! Je hebt "+locale.v(d,"stageName")+" af en je hebt "+locale.p(d,"numTrophies",0,"nl",{"one":"een medaille","other":locale.n(d,"numTrophies")+" medailles"})+" gewonnen."},
"numBlocksNeeded":function(d){return "Gefeliciteerd! U voltooide puzzel "+locale.v(d,"puzzleNumber")+". (Nochtans, u  kon alleen "+locale.p(d,"numBlocks",0,"nl",{"one":"1 block","other":locale.n(d,"numBlocks")+" blocks"})+".)  gebruiken"},
"numLinesOfCodeWritten":function(d){return "Je schreef zojuist "+locale.p(d,"numLines",0,"nl",{"one":"1 regel","other":locale.n(d,"numLines")+" regels"})+" code!"},
"play":function(d){return "afspelen"},
"print":function(d){return "Afdrukken"},
"puzzleTitle":function(d){return "Puzzel "+locale.v(d,"puzzle_number")+" van "+locale.v(d,"stage_total")},
"repeat":function(d){return "herhaal"},
"resetProgram":function(d){return "Herstellen"},
"runProgram":function(d){return "Uitvoeren"},
"runTooltip":function(d){return "Voer het programma gedefinieerd door de blokken uit in de werkruimte."},
"score":function(d){return "score"},
"showCodeHeader":function(d){return "Code weergeven"},
"showBlocksHeader":function(d){return "Toon blokken"},
"showGeneratedCode":function(d){return "Code weergeven"},
"stringEquals":function(d){return "tekenreeks =?"},
"subtitle":function(d){return "een visuele programmeeromgeving"},
"textVariable":function(d){return "tekst"},
"tooFewBlocksMsg":function(d){return "Je gebruikt alle soorten blokken die je nodig hebt, maar probeer deze soorten vaker te gebruiken om deze puzzel op te lossen."},
"tooManyBlocksMsg":function(d){return "Deze puzzel kan worden opgelost met <x id='START_SPAN'/><x id='END_SPAN'/> blokken."},
"tooMuchWork":function(d){return "Je laat me veel werk doen! Kun je proberen minder te herhalen?"},
"toolboxHeader":function(d){return "blokken"},
"openWorkspace":function(d){return "Hoe het werkt"},
"totalNumLinesOfCodeWritten":function(d){return "Totale tijd: "+locale.p(d,"numLines",0,"nl",{"one":"1 regel","other":locale.n(d,"numLines")+" regels"})+" code."},
"tryAgain":function(d){return "Probeer opnieuw"},
"hintRequest":function(d){return "Bekijk tip"},
"backToPreviousLevel":function(d){return "Terug naar het vorige niveau"},
"saveToGallery":function(d){return "Opslaan in galerij"},
"savedToGallery":function(d){return "Opgeslagen in galerij!"},
"shareFailure":function(d){return "Sorry, we kunnen dit programma niet delen."},
"workspaceHeader":function(d){return "Zet je blokken hier in elkaar:"},
"workspaceHeaderJavaScript":function(d){return "Typ hier jouw JavaScript-code"},
"infinity":function(d){return "Oneindig"},
"rotateText":function(d){return "Draai je apparaat."},
"orientationLock":function(d){return "Schakel de orientatie blokkering uit in de instellingen van je apparaat."},
"wantToLearn":function(d){return "Wil je leren programmeren?"},
"watchVideo":function(d){return "Bekijk de video"},
"when":function(d){return "wanneer"},
"whenRun":function(d){return "als gestart"},
"tryHOC":function(d){return "Probeer \"Hour of Code\""},
"signup":function(d){return "Neem deel aan de introductie cursus"},
"hintHeader":function(d){return "Een tip:"},
"genericFeedback":function(d){return "Kijk wat er gebeurde, en probeer je programma te verbeteren."},
"toggleBlocksErrorMsg":function(d){return "You need to correct an error in your program before it can be shown as blocks."},
"defaultTwitterText":function(d){return "Kijk wat ik gemaakt heb"}};