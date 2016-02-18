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
"atHoneycomb":function(d){return "pri uli"},
"atFlower":function(d){return "pri kvetine"},
"avoidCowAndRemove":function(d){return "vyhnite sa krave a odstráňte 1"},
"continue":function(d){return "Pokračovať"},
"dig":function(d){return "odstrániť 1"},
"digTooltip":function(d){return "odstrániť 1 jednotku hliny"},
"dirE":function(d){return "V"},
"dirN":function(d){return "S"},
"dirS":function(d){return "J"},
"dirW":function(d){return "Z"},
"doCode":function(d){return "vykonaj"},
"elseCode":function(d){return "ináč"},
"fill":function(d){return "vyplniť 1"},
"fillN":function(d){return "vyplniť "+maze_locale.v(d,"shovelfuls")},
"fillStack":function(d){return "vyplniť naraz "+maze_locale.v(d,"shovelfuls")+" jamy"},
"fillSquare":function(d){return "vyplniť štvorec"},
"fillTooltip":function(d){return "polož 1 jednotku hliny"},
"finalLevel":function(d){return "Gratulujem! Vyriešil si poslednú úlohu."},
"flowerEmptyError":function(d){return "Táto kvetina nemá viac nektáru."},
"get":function(d){return "získať"},
"heightParameter":function(d){return "výška"},
"holePresent":function(d){return "tam je jama"},
"honey":function(d){return "vyrob med"},
"honeyAvailable":function(d){return "med"},
"honeyTooltip":function(d){return "Vyrob med z nektáru"},
"honeycombFullError":function(d){return "Tento úľ nemá miesto pre viac medu."},
"ifCode":function(d){return "ak"},
"ifInRepeatError":function(d){return "Potrebujete bloku s \"keby\" vnútri bloku \"opakovať\". Ak máte problémy, pozrite si predchádzajúcu úroveň znova, aby ste videli, ako to fungovalo."},
"ifPathAhead":function(d){return "ak je cesta vpred"},
"ifTooltip":function(d){return "Ak sa tam nachádza cesta v určenom smere, sprav niektoré opatrenia."},
"ifelseTooltip":function(d){return "Ak je v určenom smere cesta, potom vykonaj prvý blok akcií. V opačnom prípade vykonaj druhý blok akcií."},
"ifFlowerTooltip":function(d){return "Ak je kvetina/úľ v určenom smere, potom urob niektoré činnosti."},
"ifOnlyFlowerTooltip":function(d){return "Pokiaľ je kvetina v danom smere, tak vykonaj nejaké akcie."},
"ifelseFlowerTooltip":function(d){return "Ak je kvetina/úľ v určenom smere, potom urob prvý blok činností. Inač urob druhý blok činností."},
"insufficientHoney":function(d){return "Používate správne bloky, ale musíte vyrobiť dostatočné množstvo medu."},
"insufficientNectar":function(d){return "Používate správne bloky, ale musíte pozbierať dostatočné množstvo nektáru."},
"make":function(d){return "spravte"},
"moveBackward":function(d){return "posunúť dozadu"},
"moveEastTooltip":function(d){return "Posunte ma o jedno miesto na východ."},
"moveForward":function(d){return "posunúť dopredu"},
"moveForwardTooltip":function(d){return "Presunúť ma jedno pole vpred."},
"moveNorthTooltip":function(d){return "Posunte ma o jedno miesto na sever."},
"moveSouthTooltip":function(d){return "Posunte ma o jedno miesto na juh."},
"moveTooltip":function(d){return "Posunte ma o jedno miesto dopredu/dozadu"},
"moveWestTooltip":function(d){return "Posunte ma o jedno miesto na západ."},
"nectar":function(d){return "získať nektár\n"},
"nectarRemaining":function(d){return "nektár"},
"nectarTooltip":function(d){return "Získať nektár z kvetu"},
"nextLevel":function(d){return "Gratulujem! Vyriešil si hádanku."},
"no":function(d){return "Nie"},
"noPathAhead":function(d){return "cesta je blokovaná"},
"noPathLeft":function(d){return "žiadna cesta vľavo"},
"noPathRight":function(d){return "žiadna cesta vpravo"},
"notAtFlowerError":function(d){return "Nektár môžete získať len z kvetu."},
"notAtHoneycombError":function(d){return "Med môžete vyrobiť iba v uli."},
"numBlocksNeeded":function(d){return "Táto hádanka môže byť vyriešená s %1 blokmi."},
"pathAhead":function(d){return "cesta vpred"},
"pathLeft":function(d){return "ak je cesta vľavo"},
"pathRight":function(d){return "ak je cesta vpravo"},
"pilePresent":function(d){return "tu je hromada"},
"putdownTower":function(d){return "polož vežu"},
"removeAndAvoidTheCow":function(d){return "odstráň 1 a vyhni sa krave"},
"removeN":function(d){return "odstránte "+maze_locale.v(d,"shovelfuls")},
"removePile":function(d){return "odstráňte hromadu"},
"removeStack":function(d){return "odstráňte naraz "+maze_locale.v(d,"shovelfuls")+" hromady"},
"removeSquare":function(d){return "odstrániť štvorec"},
"repeatCarefullyError":function(d){return "Aby ste toto vyriešeili, starostlivo popremyšlajte o dalšich dvoch ťahoch a odbočke ktoré pridáte do bloku \"opakovať\".  To je v poriadku ak máte na konci odbočku navyše."},
"repeatUntil":function(d){return "opakovať dokiaľ"},
"repeatUntilBlocked":function(d){return "pokiaľ je cesta vpred"},
"repeatUntilFinish":function(d){return "opakovať do konca"},
"step":function(d){return "Krok"},
"totalHoney":function(d){return "celkové množstvo medu"},
"totalNectar":function(d){return "celkové množstvo nektáru"},
"turnLeft":function(d){return "otočiť vľavo"},
"turnRight":function(d){return "otočiť vpravo"},
"turnTooltip":function(d){return "Obráti ma doľava alebo doprava o 90 stupňov."},
"uncheckedCloudError":function(d){return "Nezabudnite skontrolovať všetky oblaky či sú kvety alebo ule."},
"uncheckedPurpleError":function(d){return "Nezabudnite skontrolovať všetky fialové kvety či majú nektár"},
"whileMsg":function(d){return "pokiaľ"},
"whileTooltip":function(d){return "Opakujte priložené činnosti dokým dosiahnete cieľový bod."},
"word":function(d){return "Nájdi slovo"},
"yes":function(d){return "Áno"},
"youSpelled":function(d){return "Vyhláskovali ste"},
"didNotCollectEverything":function(d){return "Make sure you don't leave any nectar or honey behind!"}};