var maze_locale = {lc:{"ar":function(n){
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
v:function(d,k){maze_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){maze_locale.c(d,k);return d[k] in p?p[d[k]]:(k=maze_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){maze_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).maze_locale = {
"atHoneycomb":function(d){return "na plástvi"},
"atFlower":function(d){return "na květině"},
"avoidCowAndRemove":function(d){return "Vyhni se krávě a odstraň 1"},
"continue":function(d){return "Pokračovat"},
"dig":function(d){return "odstraň 1"},
"digTooltip":function(d){return "odeber 1 jednotku hlíny"},
"dirE":function(d){return "V"},
"dirN":function(d){return "S"},
"dirS":function(d){return "J"},
"dirW":function(d){return "Z"},
"doCode":function(d){return "proveď"},
"elseCode":function(d){return "jinak"},
"fill":function(d){return "vyplň 1"},
"fillN":function(d){return "vyplň "+maze_locale.v(d,"shovelfuls")},
"fillStack":function(d){return "vyplň šachtu "+maze_locale.v(d,"shovelfuls")+" děr"},
"fillSquare":function(d){return "vyplň čtverec"},
"fillTooltip":function(d){return "umísti 1 jednotku hlíny"},
"finalLevel":function(d){return "Dobrá práce! Vyřešil jsi poslední hádanku."},
"flowerEmptyError":function(d){return "Květina, na které jsi, už nemá nektar."},
"get":function(d){return "získat"},
"heightParameter":function(d){return "výška"},
"holePresent":function(d){return "tady je díra"},
"honey":function(d){return "vyrob med"},
"honeyAvailable":function(d){return "med"},
"honeyTooltip":function(d){return "Vyrob med z nektaru"},
"honeycombFullError":function(d){return "V této plástvi není místo pro více medu."},
"ifCode":function(d){return "Pokud"},
"ifInRepeatError":function(d){return "Potřebuješ blok \"pokud\" uvnitř bloku \"opakovat\". Pokud máš potíže, zkus znovu předchozí úroveň, aby jsi zjistil, jak fungovala."},
"ifPathAhead":function(d){return "když je cesta vpřed"},
"ifTooltip":function(d){return "Pokud je v daném směru cesta, provede určité akce."},
"ifelseTooltip":function(d){return "Pokud je v daném směru cesta, proveď první blok akcí. V opačném případě proveď druhý blok akcí."},
"ifFlowerTooltip":function(d){return "Pokud je v určeném směru květina/plástev, pak udělej nějaké akce."},
"ifOnlyFlowerTooltip":function(d){return "Je-li v určeném směru je květina, pak udělejte nějaké akce."},
"ifelseFlowerTooltip":function(d){return "Pokud je v určeném směru květina/plástev, pak proveď první blok akcí. V opačném případě proveď druhý blok akcí."},
"insufficientHoney":function(d){return "Používáš správné bloky, ale je potřeba vyrobit správné množství medu."},
"insufficientNectar":function(d){return "Používáš správné bloky, ale je potřeba nasbírat správné množství nektaru."},
"make":function(d){return "vyrob"},
"moveBackward":function(d){return "posunout zpět"},
"moveEastTooltip":function(d){return "Posuň mě na východ o jedno políčko."},
"moveForward":function(d){return "posunout vpřed"},
"moveForwardTooltip":function(d){return "Posuň mě jedno pole vpřed."},
"moveNorthTooltip":function(d){return "Posuň mě na sever o jedno políčko."},
"moveSouthTooltip":function(d){return "Posuň mě na jih o jedno políčko."},
"moveTooltip":function(d){return "Posuň mě vpřed/zpět o jedno políčko"},
"moveWestTooltip":function(d){return "Posuň mě na západ o jedno políčko."},
"nectar":function(d){return "získej nektar"},
"nectarRemaining":function(d){return "nektar"},
"nectarTooltip":function(d){return "Získej nektar z květiny"},
"nextLevel":function(d){return "Dobrá práce! Dokončil jsi tuto hádanku."},
"no":function(d){return "Ne"},
"noPathAhead":function(d){return "cesta je blokována"},
"noPathLeft":function(d){return "žádná cesta vlevo"},
"noPathRight":function(d){return "žádná cesta vpravo"},
"notAtFlowerError":function(d){return "Nektar můžeš získat jenom z květiny."},
"notAtHoneycombError":function(d){return "Med můžeš vyrobit jenom v plástvi."},
"numBlocksNeeded":function(d){return "Tato hádanka může být vyřešena pomocí %1 bloků."},
"pathAhead":function(d){return "cesta vpřed"},
"pathLeft":function(d){return "když je cesta vlevo"},
"pathRight":function(d){return "když je cesta vpravo"},
"pilePresent":function(d){return "tady je hromádka"},
"putdownTower":function(d){return "polož věž"},
"removeAndAvoidTheCow":function(d){return "odstranit 1 a vyhnout se krávě"},
"removeN":function(d){return "odstraň "+maze_locale.v(d,"shovelfuls")},
"removePile":function(d){return "odstranit hromádku"},
"removeStack":function(d){return "odstranit sadu"+maze_locale.v(d,"shovelfuls")+" hromádek"},
"removeSquare":function(d){return "odstraň čtverec"},
"repeatCarefullyError":function(d){return "Chceš-li to vyřešit, zamysli se nad dvěma posuny a jedním otočením v bloku \"opakuj\". Je v pořádku mít na konci jeden posun navíc."},
"repeatUntil":function(d){return "Opakovat do"},
"repeatUntilBlocked":function(d){return "dokud je cesta vpřed"},
"repeatUntilFinish":function(d){return "opakuj do konce"},
"step":function(d){return "Krok"},
"totalHoney":function(d){return "medu celkem"},
"totalNectar":function(d){return "nektaru celkem"},
"turnLeft":function(d){return "otočit vlevo"},
"turnRight":function(d){return "otočit vpravo"},
"turnTooltip":function(d){return "Otočí mě doleva nebo doprava o 90 stupňů."},
"uncheckedCloudError":function(d){return "Nezapomeň zkontrolovat všechny mraky a zjisti, jestli jsou to květiny nebo plástve."},
"uncheckedPurpleError":function(d){return "Nezapomeň zkontrolovat všechny fialové květiny a zjistit, jestli mají nektar"},
"whileMsg":function(d){return "dokud"},
"whileTooltip":function(d){return "Opakuje obsažené akce dokud nedosáhne cíle."},
"word":function(d){return "Najdi slovo"},
"yes":function(d){return "Ano"},
"youSpelled":function(d){return "Vyhláskoval(a) jsi"},
"didNotCollectEverything":function(d){return "Make sure you don't leave any nectar or honey behind!"}};