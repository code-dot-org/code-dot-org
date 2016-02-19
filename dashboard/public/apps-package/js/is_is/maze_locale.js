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
"atHoneycomb":function(d){return "við býkúpu"},
"atFlower":function(d){return "við blóm"},
"avoidCowAndRemove":function(d){return "forðast kúna og fjarlægja 1"},
"continue":function(d){return "Halda áfram"},
"dig":function(d){return "fjarlægja 1"},
"digTooltip":function(d){return "fjarlægja 1 einingu moldar"},
"dirE":function(d){return "A"},
"dirN":function(d){return "N"},
"dirS":function(d){return "S"},
"dirW":function(d){return "V"},
"doCode":function(d){return "gera"},
"elseCode":function(d){return "annars"},
"fill":function(d){return "fylla 1"},
"fillN":function(d){return "fylla "+maze_locale.v(d,"shovelfuls")},
"fillStack":function(d){return "fylla "+maze_locale.v(d,"shovelfuls")+" holur"},
"fillSquare":function(d){return "fylla ferning"},
"fillTooltip":function(d){return "setja 1 einingu moldar"},
"finalLevel":function(d){return "Til hamingju! Þú hefur leyst síðustu þrautina."},
"flowerEmptyError":function(d){return "Blómið sem þú ert á hefur ekki meiri blómasafa."},
"get":function(d){return "sækja"},
"heightParameter":function(d){return "hæð"},
"holePresent":function(d){return "það er hola"},
"honey":function(d){return "búa til hunang"},
"honeyAvailable":function(d){return "hunang"},
"honeyTooltip":function(d){return "Búa til hunang úr blómasafa"},
"honeycombFullError":function(d){return "Þessi býkúpa hefur ekki pláss fyrir meira hunang."},
"ifCode":function(d){return "ef"},
"ifInRepeatError":function(d){return "Þú þarft að nota \"ef\" kubb innan í \"endurtaka\" kubb. Ef þú lendir í vandræðum er ágætt að skoða síðustu þraut til sjá hvernig þetta var leyst."},
"ifPathAhead":function(d){return "ef slóð framundan"},
"ifTooltip":function(d){return "Ef það er slóð í þessa stefnu þá á að gera eitthvað."},
"ifelseTooltip":function(d){return "Ef það er slóð í þessa stefnu þá á að gera fyrstu kubbastæðuna. Annars á að gera stæðu númer tvö."},
"ifFlowerTooltip":function(d){return "Ef það er blóm/býkúpa í hina tilteknu átt, þá skal gera einhverjar aðgerðir."},
"ifOnlyFlowerTooltip":function(d){return "Ef það er blóm í hina tilteknu átt, þá gera einhverjar aðgerðir."},
"ifelseFlowerTooltip":function(d){return "Ef það er blóm/býkúpa í hina tilteknu átt, þá skal gera fyrstu aðgerðastæðuna. Annars skal gera hina aðgerðastæðuna."},
"insufficientHoney":function(d){return "Þú þarft að búa til rétt magn hunangs."},
"insufficientNectar":function(d){return "Þú þarft að safna réttu magni af blómasafa."},
"make":function(d){return "búa til"},
"moveBackward":function(d){return "fara aftur á bak"},
"moveEastTooltip":function(d){return "Færa mig austur um eitt bil."},
"moveForward":function(d){return "færa áfram"},
"moveForwardTooltip":function(d){return "Færa mig fram um eitt bil."},
"moveNorthTooltip":function(d){return "Færa mig norður um eitt bil."},
"moveSouthTooltip":function(d){return "Færa mig suður um eitt bil."},
"moveTooltip":function(d){return "Færa mig fram/aftur um eitt bil"},
"moveWestTooltip":function(d){return "Færa mig vestur um eitt bil."},
"nectar":function(d){return "sækja blómasafa"},
"nectarRemaining":function(d){return "blómasafi"},
"nectarTooltip":function(d){return "Ná í blómasafa úr blómi"},
"nextLevel":function(d){return "Til hamingju! Þú hefur lokið við þessa þraut."},
"no":function(d){return "Nei"},
"noPathAhead":function(d){return "slóð er lokuð"},
"noPathLeft":function(d){return "engin slóð til vinstri"},
"noPathRight":function(d){return "engin slóð til hægri"},
"notAtFlowerError":function(d){return "Þú getur aðeins fengið blómasafa úr blómi."},
"notAtHoneycombError":function(d){return "Þú getur aðeins búið til hunang við býkúpu."},
"numBlocksNeeded":function(d){return "Þessa þraut er hægt að leysa með %1 kubbum."},
"pathAhead":function(d){return "slóð framundan"},
"pathLeft":function(d){return "ef slóð til vinstri"},
"pathRight":function(d){return "ef slóð til hægri"},
"pilePresent":function(d){return "það er haugur"},
"putdownTower":function(d){return "setja niður turn"},
"removeAndAvoidTheCow":function(d){return "fjarlægja 1 og forðast kúna"},
"removeN":function(d){return "fjarlægja "+maze_locale.v(d,"shovelfuls")},
"removePile":function(d){return "fjarlægja haug"},
"removeStack":function(d){return "fjarlægja stæðu af "+maze_locale.v(d,"shovelfuls")+" haugum"},
"removeSquare":function(d){return "fjarlægja ferning"},
"repeatCarefullyError":function(d){return "Til að leysa þetta skaltu athuga vel mynstrið tvær hreyfingar - einn snúningur sem fer í \"endurtaka\" kubbinn. Það er í lagi að hafa aukasnúning í lokin."},
"repeatUntil":function(d){return "endurtaka uns"},
"repeatUntilBlocked":function(d){return "meðan slóð framundan"},
"repeatUntilFinish":function(d){return "endurtaka til loka"},
"step":function(d){return "Þrep"},
"totalHoney":function(d){return "samtals hunang"},
"totalNectar":function(d){return "samtals blómasafi"},
"turnLeft":function(d){return "snúa til vinstri"},
"turnRight":function(d){return "snúa til hægri"},
"turnTooltip":function(d){return "Snýr mér til vinstri eða hægri um 90 gráður."},
"uncheckedCloudError":function(d){return "Gættu þess að athuga öll ský til að sjá hvort þau eru blóm eða býkúpur."},
"uncheckedPurpleError":function(d){return "Gættu þess að athuga öll fjólublá blóm til að kanna hvort þau hafi blómasafa"},
"whileMsg":function(d){return "meðan"},
"whileTooltip":function(d){return "Endurtaka aðgerðirnar í kubbnum þar til endamarki er náð."},
"word":function(d){return "Finna orðið"},
"yes":function(d){return "Já"},
"youSpelled":function(d){return "Þú stafaðir"},
"didNotCollectEverything":function(d){return "Make sure you don't leave any nectar or honey behind!"}};