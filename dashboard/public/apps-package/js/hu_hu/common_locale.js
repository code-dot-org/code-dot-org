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
},"da":function(n){return n===1?"one":"other"},"de":function(n){return n===1?"one":"other"},"el":function(n){return n===1?"one":"other"},"es":function(n){return n===1?"one":"other"},"et":function(n){return n===1?"one":"other"},"eu":function(n){return n===1?"one":"other"},"fa":function(n){return "other"},"fi":function(n){return n===1?"one":"other"},"fil":function(n){return n===0||n==1?"one":"other"},"fr":function(n){return Math.floor(n)===0||Math.floor(n)==1?"one":"other"},"gl":function(n){return n===1?"one":"other"},"he":function(n){return n===1?"one":"other"},"hi":function(n){return n===0||n==1?"one":"other"},"hr":function(n){
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
"and":function(d){return "és"},
"booleanTrue":function(d){return "igaz"},
"booleanFalse":function(d){return "hamis"},
"blocklyMessage":function(d){return "Blockly"},
"catActions":function(d){return "Műveletek"},
"catColour":function(d){return "Szín"},
"catLogic":function(d){return "Logika"},
"catLists":function(d){return "Listák"},
"catLoops":function(d){return "Ciklusok"},
"catMath":function(d){return "Matematika"},
"catProcedures":function(d){return "Funkciók"},
"catText":function(d){return "szöveg"},
"catVariables":function(d){return "Változók"},
"codeTooltip":function(d){return "Lássuk a generált JavaScript kódot."},
"continue":function(d){return "Tovább"},
"dialogCancel":function(d){return "Mégsem"},
"dialogOK":function(d){return "OK"},
"directionNorthLetter":function(d){return "Észak"},
"directionSouthLetter":function(d){return "Dél"},
"directionEastLetter":function(d){return "Kelet"},
"directionWestLetter":function(d){return "Nyugat"},
"end":function(d){return "vége"},
"emptyBlocksErrorMsg":function(d){return "Ahhoz hogy az \"Ismételd\" vagy a \"Ha\" blokkok működjenek, más blokkoknak is kell bennük lenni. Győződj meg arról, hogy a belső blokk megfelelően illeszkedik a külső befogadó blokkhoz."},
"emptyFunctionBlocksErrorMsg":function(d){return "A függvény blokkon belül lenni kell más blokkoknak is ahhoz, hogy működjön."},
"errorEmptyFunctionBlockModal":function(d){return "A függvénydeklarációdban blokkoknak kell lenni. Kattints a \"szerkesztés\" gombra, és húzd be a blokkokat a zöld blokkba."},
"errorIncompleteBlockInFunction":function(d){return "Kattints a \"szerkesztés\"-re, hogy pótold az esetlegesen hiányzó blokkokat a függvénydeklarációdból."},
"errorParamInputUnattached":function(d){return "Ne felejts a munkaterületen levő függvények minden bemenő paraméteréhez egy blokkot illeszteni."},
"errorUnusedParam":function(d){return "Hozzáadtál egy paraméterblokkot, de nem használtad fel azt a deklarálásodban. Győződj meg róla, hogy használod a paraméteredet, rákattintva a \"szerkesztés\"-re  és arról is, hogy bele van-e illesztve a paraméterblokkod a zöld blokkba!"},
"errorRequiredParamsMissing":function(d){return "Hozz létre egy paramétert a függvényed számára a \"szerkesztés\"-re kattintva, és hozzáadva a szükséges paramétereket! Húzd az új paraméterblokkokat a függvénydeklarációdra!"},
"errorUnusedFunction":function(d){return "Létrehoztál egy függvényt, de soha sem használtad fel azt a munkaterületeden! Kattints a \"Függvények\"-re az eszközkészleten, és győződj meg róla, hogy használod a függvényt a programodban."},
"errorQuestionMarksInNumberField":function(d){return "Próbálj a \"???\" helyére értéket írni."},
"extraTopBlocks":function(d){return "Különálló blokkjaid vannak. A \"futtatáskor\" blokkhoz akartad ezeket csatolni?"},
"finalStage":function(d){return "Gratulálok! Teljesítetted az utolsó szakaszt."},
"finalStageTrophies":function(d){return "Gratulálok! Teljesítetted az utolsó szakaszt és nyertél "+locale.p(d,"numTrophies",0,"hu",{"one":"egy trófeát","other":locale.n(d,"numTrophies")+" trófeát"})+"."},
"finish":function(d){return "Kész"},
"generatedCodeInfo":function(d){return "Még a legjobb egyetemeken (pl. "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+") is tanítanak blokk alapú programozást, de a felszín alatt az általad összeállított blokkok is megjeleníthetők JavaScriptben, a világ legszélesebb körben használt nyelvén :"},
"hashError":function(d){return "Sajnálom, de \"%1\" nem felel meg egyetlen mentett programnak sem."},
"help":function(d){return "Segítség"},
"hintTitle":function(d){return "Tanács:"},
"jump":function(d){return "Ugorj"},
"levelIncompleteError":function(d){return "Minden szükséges blokkot felhasználtál, de nem megfelelően."},
"listVariable":function(d){return "lista"},
"makeYourOwnFlappy":function(d){return "Készíts saját Flappy játékot"},
"missingBlocksErrorMsg":function(d){return "A feladvány megoldásához használj egy vagy több blokkot az alábbiak közül."},
"nextLevel":function(d){return "Gratulálok! Megoldottad a "+locale.v(d,"puzzleNumber")+". feladványt."},
"nextLevelTrophies":function(d){return "Gratulálok! Megoldottad a "+locale.v(d,"puzzleNumber")+". feladványt és nyertél "+locale.p(d,"numTrophies",0,"hu",{"one":"egy trófeát","other":locale.n(d,"numTrophies")+" trófeát"})+"."},
"nextStage":function(d){return "Gratulálok! A(z) "+locale.v(d,"stageName")+". szint teljesítve."},
"nextStageTrophies":function(d){return "Gratulálok! Teljesítetted a(z) "+locale.v(d,"stageNumber")+". szintet és nyertél "+locale.p(d,"numTrophies",0,"hu",{"one":"egy trófeát","other":locale.n(d,"numTrophies")+" trófeát"})+"."},
"numBlocksNeeded":function(d){return "Gratulálok! Megoldottad a "+locale.v(d,"puzzleNumber")+". feladványt. (Habár megoldható csupán "+locale.p(d,"numBlocks",0,"hu",{"one":"1 blokk","other":locale.n(d,"numBlocks")+" blokk"})+" használatával.)"},
"numLinesOfCodeWritten":function(d){return "Éppen most írtál újabb "+locale.p(d,"numLines",0,"hu",{"one":"1 sor","other":locale.n(d,"numLines")+" sor"})+" kódot!"},
"play":function(d){return "lejátszás"},
"print":function(d){return "Nyomtatás"},
"puzzleTitle":function(d){return locale.v(d,"puzzle_number")+"/"+locale.v(d,"stage_total")+". feladvány"},
"repeat":function(d){return "ismételd"},
"resetProgram":function(d){return "Visszaállítás"},
"runProgram":function(d){return "Futtatás"},
"runTooltip":function(d){return "A munkalapon összeépített program futtatása."},
"score":function(d){return "pontszám"},
"showCodeHeader":function(d){return "Kód megjelenítése"},
"showBlocksHeader":function(d){return "Blokkok megjelenítése"},
"showGeneratedCode":function(d){return "Kód megjelenítése"},
"stringEquals":function(d){return "string =?"},
"subtitle":function(d){return "vizuális programozási felület"},
"textVariable":function(d){return "szöveg"},
"tooFewBlocksMsg":function(d){return "A megfelelő blokkokat használod, de próbálj meg többet használni belőlük, hogy megoldd a feladványt."},
"tooManyBlocksMsg":function(d){return "Ez a feladvány megoldható <x id='START_SPAN'/><x id='END_SPAN'/> blokkal."},
"tooMuchWork":function(d){return "Sokat dolgoztattál. Megpróbálnád egy kicsit kevesebb ismétléssel?"},
"toolboxHeader":function(d){return "blokkok"},
"openWorkspace":function(d){return "Hogyan is működik"},
"totalNumLinesOfCodeWritten":function(d){return "Összesített eredmény: "+locale.p(d,"numLines",0,"hu",{"one":"1 sor","other":locale.n(d,"numLines")+" sor"})+" kód."},
"tryAgain":function(d){return "Próbáld újra"},
"hintRequest":function(d){return "Segítség"},
"backToPreviousLevel":function(d){return "Vissza az előző szintre"},
"saveToGallery":function(d){return "Mentés a galériába"},
"savedToGallery":function(d){return "Elmentve a galériába!"},
"shareFailure":function(d){return "Sajnálom, de nem tudjuk megosztani ezt a programot."},
"workspaceHeader":function(d){return "Itt fűzd fel a blokkokat: "},
"workspaceHeaderJavaScript":function(d){return "Ide írd a JavaScript kódodat"},
"infinity":function(d){return "Végtelen"},
"rotateText":function(d){return "Fordítsd el a készüléked."},
"orientationLock":function(d){return "Kapcsold ki a tájolási zárat az eszközbeállításokban."},
"wantToLearn":function(d){return "Szeretnél megtanulni programozni?"},
"watchVideo":function(d){return "Nézd meg a videót"},
"when":function(d){return "amikor"},
"whenRun":function(d){return "futtatáskor"},
"tryHOC":function(d){return "Próbáld ki a Kódolás Óráját"},
"signup":function(d){return "Regisztrálj a bevezető képzésre"},
"hintHeader":function(d){return "Itt egy ötlet:"},
"genericFeedback":function(d){return "Nézd meg hogy milyen lett, és próbáld meg kijavítani a programod."},
"toggleBlocksErrorMsg":function(d){return "Ki kell javítanod egy hibát a programodban, mielőtt blokként megjelenhetne."},
"defaultTwitterText":function(d){return "Nézd meg, mit csináltam"}};