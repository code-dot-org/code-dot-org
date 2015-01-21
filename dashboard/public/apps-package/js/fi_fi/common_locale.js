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
"and":function(d){return "ja"},
"booleanTrue":function(d){return "tosi"},
"booleanFalse":function(d){return "epätosi"},
"blocklyMessage":function(d){return "Blocky"},
"catActions":function(d){return "Toiminnot"},
"catColour":function(d){return "Väri"},
"catLogic":function(d){return "Logiikka"},
"catLists":function(d){return "Listat"},
"catLoops":function(d){return "Silmukat"},
"catMath":function(d){return "Matematiikka"},
"catProcedures":function(d){return "Funktiot"},
"catText":function(d){return "teksti"},
"catVariables":function(d){return "Muuttujat"},
"codeTooltip":function(d){return "Näytä tuotettu JavaScript-koodi."},
"continue":function(d){return "Jatka"},
"dialogCancel":function(d){return "Peru"},
"dialogOK":function(d){return "OK"},
"directionNorthLetter":function(d){return "P"},
"directionSouthLetter":function(d){return "E"},
"directionEastLetter":function(d){return "I"},
"directionWestLetter":function(d){return "L"},
"end":function(d){return "loppu"},
"emptyBlocksErrorMsg":function(d){return "\"Toista\" ja \"Jos\"-lohkot tarvitsevat toisen lohkon sisäänsä toimiakseen. Varmista, että sisempi lohko asettuu oikein ulompaan lohkoon."},
"emptyFunctionBlocksErrorMsg":function(d){return "Lisää Funktio-lohkon sisään muita lohkoja saadaksesi koodi toimimaan oikein."},
"errorEmptyFunctionBlockModal":function(d){return "Funktiomäärittelysi sisällä täytyy olla lohkoja. Napsauta \"muokkaa\" ja raahaa lohkoja vihreän lohkon sisään."},
"errorIncompleteBlockInFunction":function(d){return "Napsauta \"muokkaa\" varmistaaksesi että sinulta ei puutu lohkoja funktion määritelmän sisältä."},
"errorParamInputUnattached":function(d){return "Muista liittää lohko jokaiseen syöteparametriin työtilasi funktiolohkossa."},
"errorUnusedParam":function(d){return "Lisäsit parametrilohkon, mutta et käyttänyt sitä määrittelyssä. Varmista että käytät parametrejäsi napsauttamalla \"muokkaa\" ja laittamalla parametrilohko vihreän lohkon sisään."},
"errorRequiredParamsMissing":function(d){return "Luo funktiollesi parametri painamalla \"muokkaa\" ja lisäämällä tarpeelliset parametrit. Raahaa uudet parametrilohkot funktiomäärittelyysi."},
"errorUnusedFunction":function(d){return "Teit Funktion, mutta et koskaan käyttänyt sitä työtilassasi! Napsauta \"Funktiot\" työkaluissa ja varmista että käytät sitä ohjelmassasi."},
"errorQuestionMarksInNumberField":function(d){return "Korvaa \"???\" arvolla."},
"extraTopBlocks":function(d){return "Ohjelmassa on lohkoja, joita ei ole kiinnitetty mihinkään. Ehkä ne pitäisi kiinnittää \"suoritettaessa\"-lohkoon?"},
"finalStage":function(d){return "Onneksi olkoon! Olet suorittanut viimeisen vaiheen."},
"finalStageTrophies":function(d){return "Onneksi olkoon! Olet suorittanut viimeisen vaiheen ja voittanut "+locale.p(d,"numTrophies",0,"fi",{"one":"pokaalin","other":locale.n(d,"numTrophies")+" pokaalia"})+"."},
"finish":function(d){return "Valmis"},
"generatedCodeInfo":function(d){return "Jopa huippuyliopistot opettavat lohkopohjaista ohjelmointia (esim. "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"), mutta konepellin alla kokoamasi lohkot voidaan näyttää myös esim. JavaScript-kielellä. JavaScript on maailman eniten käytetty ohjelmointikieli:"},
"hashError":function(d){return "Valitan, '%1' ei vastaa mitään tallennettua ohjelmaa."},
"help":function(d){return "Ohje"},
"hintTitle":function(d){return "Vihje:"},
"jump":function(d){return "hyppää"},
"levelIncompleteError":function(d){return "Käytät kaikkia oikeanlaisia lohkoja, mutta et oikealla tavalla."},
"listVariable":function(d){return "lista"},
"makeYourOwnFlappy":function(d){return "Tee oma Flappy-pelisi"},
"missingBlocksErrorMsg":function(d){return "Yritä ratkaista tehtävä yhdellä tai useammalla alla olevalla lohkolla."},
"nextLevel":function(d){return "Onneksi olkoon! Olet suorittanut "+locale.v(d,"puzzleNumber")+". tehtävän."},
"nextLevelTrophies":function(d){return "Oneness olkoon! Let suorittanut tehtävän "+locale.v(d,"puzzleNumber")+" ja voittanut "+locale.p(d,"numTrophies",0,"fi",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"nextStage":function(d){return "Onnittelut! Olet suorittanut tason "+locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Onnittelut! Olet suorittanut tason "+locale.v(d,"stageName")+" ja voitit "+locale.p(d,"numTrophies",0,"fi",{"one":"pokaalin","other":locale.n(d,"numTrophies")+" pokaalia"})+"."},
"numBlocksNeeded":function(d){return "Onneksi olkoon! Olet suorittanut "+locale.v(d,"puzzleNumber")+". pulman (olisit tosin voinut käyttää vain "+locale.p(d,"numBlocks",0,"fi",{"one":"yhden lohkon","other":locale.n(d,"numBlocks")+" lohkoa"})+")."},
"numLinesOfCodeWritten":function(d){return "Kirjoitit juuri "+locale.p(d,"numLines",0,"fi",{"one":"yhden rivin","other":locale.n(d,"numLines")+" riviä"})+" koodia!"},
"play":function(d){return "pelaa"},
"print":function(d){return "Tulosta"},
"puzzleTitle":function(d){return "Tehtävä "+locale.v(d,"puzzle_number")+" / "+locale.v(d,"stage_total")},
"repeat":function(d){return "toista"},
"resetProgram":function(d){return "Alusta"},
"runProgram":function(d){return "Suorita"},
"runTooltip":function(d){return "Suorittaa työtilassa olevien lohkojen määrittämän ohjelman."},
"score":function(d){return "pisteet"},
"showCodeHeader":function(d){return "Näytä koodi"},
"showBlocksHeader":function(d){return "Näytä lohkot"},
"showGeneratedCode":function(d){return "Näytä koodi"},
"stringEquals":function(d){return "merkkijono=?"},
"subtitle":function(d){return "visuaalinen ohjelmointiympäristö"},
"textVariable":function(d){return "teksti"},
"tooFewBlocksMsg":function(d){return "Käytät kyllä kaikkia oikeanlaisia lohkoja, mutta yritä käyttää niitä lisää, jotta saat tehtävän ratkaistua."},
"tooManyBlocksMsg":function(d){return "Tämän tehtävän voi ratkaista <x id='START_SPAN'/><x id='END_SPAN'/> lohkolla."},
"tooMuchWork":function(d){return "Sait minut tekemään paljon töitä! Voisitko kokeilla samaa vähemmillä toistoilla?"},
"toolboxHeader":function(d){return "lohkot"},
"openWorkspace":function(d){return "Miten se toimii"},
"totalNumLinesOfCodeWritten":function(d){return "Kokonaismäärä: "+locale.p(d,"numLines",0,"fi",{"one":"yksi rivi","other":locale.n(d,"numLines")+" riviä"})+" koodia."},
"tryAgain":function(d){return "Yritä uudestaan"},
"hintRequest":function(d){return "Katso vihje"},
"backToPreviousLevel":function(d){return "Takaisin edelliseen tasoon"},
"saveToGallery":function(d){return "Tallenna galleriaan"},
"savedToGallery":function(d){return "Tallennettu galleriaan!"},
"shareFailure":function(d){return "Emme valitettavasti voi jakaa tätä ohjelmaa."},
"workspaceHeader":function(d){return "Kokoa lohkosi täällä: "},
"workspaceHeaderJavaScript":function(d){return "Kirjoita JavaScript-koodi tähän"},
"infinity":function(d){return "Ääretön"},
"rotateText":function(d){return "Käännä laitettasi."},
"orientationLock":function(d){return "Poista laitteesi asentolukko."},
"wantToLearn":function(d){return "Haluatko oppia koodaamaan?"},
"watchVideo":function(d){return "Katso video"},
"when":function(d){return "kun"},
"whenRun":function(d){return "suoritettaessa"},
"tryHOC":function(d){return "Kokeile koodaustuntia"},
"signup":function(d){return "Rekisteröidy johdantokurssille"},
"hintHeader":function(d){return "Tässä on Vihje:"},
"genericFeedback":function(d){return "Katso miten päädyit tähän, ja koita korjata ohjelmasi."},
"toggleBlocksErrorMsg":function(d){return "You need to correct an error in your program before it can be shown as blocks."},
"defaultTwitterText":function(d){return "Katso mitä tein"}};