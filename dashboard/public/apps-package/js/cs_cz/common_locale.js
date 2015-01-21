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
"and":function(d){return "a"},
"booleanTrue":function(d){return "pravda"},
"booleanFalse":function(d){return "záporné"},
"blocklyMessage":function(d){return "Blockly"},
"catActions":function(d){return "Akce"},
"catColour":function(d){return "Barva"},
"catLogic":function(d){return "Logika"},
"catLists":function(d){return "Seznamy"},
"catLoops":function(d){return "Smyčky"},
"catMath":function(d){return "Matematika"},
"catProcedures":function(d){return "Funkce"},
"catText":function(d){return "text"},
"catVariables":function(d){return "Proměnné"},
"codeTooltip":function(d){return "Zobrazit vygenerovaný kód JavaScriptu."},
"continue":function(d){return "Pokračovat"},
"dialogCancel":function(d){return "Storno"},
"dialogOK":function(d){return "OK"},
"directionNorthLetter":function(d){return "S"},
"directionSouthLetter":function(d){return "J"},
"directionEastLetter":function(d){return "V"},
"directionWestLetter":function(d){return "Z"},
"end":function(d){return "konec"},
"emptyBlocksErrorMsg":function(d){return "Bloky \"Opakovat\" nebo \"Pokud\" v sobě musí mít další bloky, aby fungovaly. Ujisti se, že vnitřní bloky jsou v pořádku vložené dovnitř vnějších bloků."},
"emptyFunctionBlocksErrorMsg":function(d){return "Blok funkce v sobě musí obsahovat další bloky."},
"errorEmptyFunctionBlockModal":function(d){return "Musí být nějaké bloky uvnitř funkce. Klepněte na tlačítko \"Upravit\" a přetáhněte bloky do zeleného bloku."},
"errorIncompleteBlockInFunction":function(d){return "Klepněte na tlačítko \"Upravit\", ujistěte se, že nemáte žádné chybějící bloky uvnitř definice funkce."},
"errorParamInputUnattached":function(d){return "Nezapomeňte připojit blok pro každý vstupní parametr k bloku funkce v pracovním prostoru."},
"errorUnusedParam":function(d){return "Přidán blok parametru, ale nebyl nepoužit v definici. Ujistěte se, že parametr používáte klepnutím na tlačítko \"Upravit\" a uvedením parametru do zeleného bloku."},
"errorRequiredParamsMissing":function(d){return "Vytvořte parametr pro funkci klepnutím na tlačítko \"Upravit\" a přidáním potřebných parametrů. Přetáhněte nové bloky parametrů do vaší definice funkce."},
"errorUnusedFunction":function(d){return "Vytvořili jste funkci, ale nikdy jste použili v pracovní prostor. Klikněte na \"Funkce\" v panelu a zkontrolujte, zda ji používáte ve vašem programu."},
"errorQuestionMarksInNumberField":function(d){return "Zkuste nahradit \"???\" hodnotou."},
"extraTopBlocks":function(d){return "Máš nepřipojené bloky. Nechceš je připojit k bloku \"po spuštění\"?"},
"finalStage":function(d){return "Dobrá práce! Dokončil si poslední fázi."},
"finalStageTrophies":function(d){return "Dobrá práce! Dokončil si poslední fázi a vyhrál "+locale.p(d,"numTrophies",0,"cs",{"one":"trofej","other":locale.n(d,"numTrophies")+" trofejí"})+"."},
"finish":function(d){return "Dokončit"},
"generatedCodeInfo":function(d){return "Dokonce nejlepší university učí programovat pomocí bloků (např. "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). Ale vnitřek bloků, které jsi sestavil, lze zobrazit také v JavaScriptu, světově nejrozšířenějším programovacím jazyce:"},
"hashError":function(d){return "Promiň, ale '%1' neodpovídá žádnému uloženému programu."},
"help":function(d){return "Nápověda"},
"hintTitle":function(d){return "Tip:"},
"jump":function(d){return "skoč"},
"levelIncompleteError":function(d){return "Používáš všechny potřebné typy bloků, ale nesprávným způsobem."},
"listVariable":function(d){return "seznam"},
"makeYourOwnFlappy":function(d){return "Vytvoř Si Vlastní Hru Flappy"},
"missingBlocksErrorMsg":function(d){return "Použijte jeden či více bloků k vyřešení těto hádanky."},
"nextLevel":function(d){return "Dobrá práce! Dokončil jsi Hádanku "+locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Dobrá práce! Dokončil jsi Hádanku "+locale.v(d,"puzzleNumber")+" a vyhrál "+locale.p(d,"numTrophies",0,"cs",{"one":"trofej","other":locale.n(d,"numTrophies")+" trofeje"})+"."},
"nextStage":function(d){return "Blahopřejeme! Dokončil jsi "+locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Blahopřejeme! Dokončil jsi "+locale.v(d,"stageName")+" a vyhrál "+locale.p(d,"numTrophies",0,"cs",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"numBlocksNeeded":function(d){return "Dobrá práce! Dokončil jsi Hádanku "+locale.v(d,"puzzleNumber")+". (Ale mohl jsi použít pouze "+locale.p(d,"numBlocks",0,"cs",{"one":"1 blok","other":locale.n(d,"numBlocks")+" bloků"})+".)"},
"numLinesOfCodeWritten":function(d){return "Už jsi napsal "+locale.p(d,"numLines",0,"cs",{"one":"1 řádek","other":locale.n(d,"numLines")+" řádků"})+" kódu!"},
"play":function(d){return "hrát"},
"print":function(d){return "Tisk"},
"puzzleTitle":function(d){return "Hádanka "+locale.v(d,"puzzle_number")+" z "+locale.v(d,"stage_total")},
"repeat":function(d){return "opakuj"},
"resetProgram":function(d){return "Obnovit"},
"runProgram":function(d){return "Spustit"},
"runTooltip":function(d){return "Spustí program definovaný bloky na pracovní ploše."},
"score":function(d){return "výsledek"},
"showCodeHeader":function(d){return "Zobrazit kód"},
"showBlocksHeader":function(d){return "Zobrazit bloky"},
"showGeneratedCode":function(d){return "Zobrazit kód"},
"stringEquals":function(d){return "řetězec =?"},
"subtitle":function(d){return "vizuální programovací prostředí"},
"textVariable":function(d){return "text"},
"tooFewBlocksMsg":function(d){return "Používáš všechny potřebné bloky, ale zkus použít více těchto bloků pro vyřešení této hádanky."},
"tooManyBlocksMsg":function(d){return "Tato hádanka může být vyřešena pomocí <x id='START_SPAN'/><x id='END_SPAN'/> bloků."},
"tooMuchWork":function(d){return "Přinutil jsi mne udělat spoustu práce! Mohl bys zkusit opakovat méně krát?"},
"toolboxHeader":function(d){return "bloky"},
"openWorkspace":function(d){return "Jak To Funguje"},
"totalNumLinesOfCodeWritten":function(d){return "Celkově: "+locale.p(d,"numLines",0,"cs",{"one":"1 řádek","other":locale.n(d,"numLines")+" řádků"})+" kódu."},
"tryAgain":function(d){return "Zkusit znovu"},
"hintRequest":function(d){return "Viz tip"},
"backToPreviousLevel":function(d){return "Zpět na předchozí úroveň"},
"saveToGallery":function(d){return "Uložit do galerie"},
"savedToGallery":function(d){return "Uloženo v galerii!"},
"shareFailure":function(d){return "Omlouváme se, ale tento program nemůžeme sdílet."},
"workspaceHeader":function(d){return "Sestav si zde své bloky: "},
"workspaceHeaderJavaScript":function(d){return "Zde napiš tvůj kód v JavaScriptu"},
"infinity":function(d){return "Nekonečno"},
"rotateText":function(d){return "Otoč své zařízení."},
"orientationLock":function(d){return "Vypni uzamčení rotace v nastavení zařízení."},
"wantToLearn":function(d){return "Chceš se naučit programovat?"},
"watchVideo":function(d){return "Shlédnout Video"},
"when":function(d){return "když"},
"whenRun":function(d){return "po spuštění"},
"tryHOC":function(d){return "Vyzkoušej Hodinu Programování"},
"signup":function(d){return "Zaregistruj se do úvodního kurzu"},
"hintHeader":function(d){return "Zde je rada:"},
"genericFeedback":function(d){return "Podívej se jak jsi skončil a zkus svůj program opravit."},
"toggleBlocksErrorMsg":function(d){return "You need to correct an error in your program before it can be shown as blocks."},
"defaultTwitterText":function(d){return "Check out what I made"}};