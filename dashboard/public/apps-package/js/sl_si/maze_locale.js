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
"atHoneycomb":function(d){return "pri satovju"},
"atFlower":function(d){return "v cvetu"},
"avoidCowAndRemove":function(d){return "izogni se kravi in odstrani 1"},
"continue":function(d){return "Nadaljuj"},
"dig":function(d){return "odstrani 1"},
"digTooltip":function(d){return "odstrani 1 enoto umazanije"},
"dirE":function(d){return "V"},
"dirN":function(d){return "S"},
"dirS":function(d){return "J"},
"dirW":function(d){return "Z"},
"doCode":function(d){return "izvrši"},
"elseCode":function(d){return "potem"},
"fill":function(d){return "zapolni 1"},
"fillN":function(d){return "zapolni "+maze_locale.v(d,"shovelfuls")},
"fillStack":function(d){return "zapolni kopico "+maze_locale.v(d,"shovelfuls")+" lukenj"},
"fillSquare":function(d){return "zapolni kvadrat"},
"fillTooltip":function(d){return "postavi 1 enoto umazanije"},
"finalLevel":function(d){return "Čestitke! Rešil/a si zadnjo uganko."},
"flowerEmptyError":function(d){return "Roža, na kateri si, nima več medu."},
"get":function(d){return "najdi"},
"heightParameter":function(d){return "višina"},
"holePresent":function(d){return "tam je luknja"},
"honey":function(d){return "naredi med"},
"honeyAvailable":function(d){return "med"},
"honeyTooltip":function(d){return "Naredi med iz nektarja"},
"honeycombFullError":function(d){return "To satovje nima več prostora za še več medu."},
"ifCode":function(d){return "če"},
"ifInRepeatError":function(d){return "Znotraj \"če\" bloka potrebuješ tudi blok \"ponovi\". Če imaš pri tem težave, ponovi prejšnjo sobo in poglej, kako deluje."},
"ifPathAhead":function(d){return "če je pot naprej"},
"ifTooltip":function(d){return "Če obstaja pot naprej v določeni smeri, potem naredi nekaj."},
"ifelseTooltip":function(d){return "Če obstaja pot naprej v določeni smeri, potem naredi prvi blok dejanj. V nasprotnem primeru, naredi drugi blok dejanj."},
"ifFlowerTooltip":function(d){return "Če v dani smeri obstaja roža/satovje, potem izvedi dejanja."},
"ifOnlyFlowerTooltip":function(d){return "Če obstaja pot naprej v določeni smeri, potem ukrepaj."},
"ifelseFlowerTooltip":function(d){return "Če v dani smeri obstaja roža/satovje, potem izvedi prvi blok dejanj. Drugače izvedi drugi blok dejanj."},
"insufficientHoney":function(d){return "Uporabil si prave bloke, vendar moraš narediti pravo količino medu."},
"insufficientNectar":function(d){return "Uporabil si prave bloke, vendar moraš nabrati pravo količino nektarja."},
"make":function(d){return "naredi"},
"moveBackward":function(d){return "premakni nazaj"},
"moveEastTooltip":function(d){return "Premakni me vzhodno vsaj za eno mesto."},
"moveForward":function(d){return "premakni se naprej"},
"moveForwardTooltip":function(d){return "Premakni me naprej za 1 mesto."},
"moveNorthTooltip":function(d){return "Premakni me severno za vsaj eno mesto."},
"moveSouthTooltip":function(d){return "Premakni me južno za vsaj eno mesto."},
"moveTooltip":function(d){return "Premaknime me za eno mesto naprej/nazaj"},
"moveWestTooltip":function(d){return "Premakni me zahodno za vsaj eno mesto."},
"nectar":function(d){return "dobi nektar"},
"nectarRemaining":function(d){return "nektar"},
"nectarTooltip":function(d){return "Dobi nektar iz rože"},
"nextLevel":function(d){return "Čestitke! Zaključil/a si to uganko."},
"no":function(d){return "Ne"},
"noPathAhead":function(d){return "pot je blokirana"},
"noPathLeft":function(d){return "ni poti na levo"},
"noPathRight":function(d){return "ni poti na desno"},
"notAtFlowerError":function(d){return "Nektar lahko dobiš samo iz rože."},
"notAtHoneycombError":function(d){return "Med lahko delaš samo pri satovju."},
"numBlocksNeeded":function(d){return "Ta uganka je lahko rešena z %1 bloki."},
"pathAhead":function(d){return "pot naprej"},
"pathLeft":function(d){return "če je pot na levo"},
"pathRight":function(d){return "če je pot na desno"},
"pilePresent":function(d){return "tukaj je kup"},
"putdownTower":function(d){return "postavi stolp"},
"removeAndAvoidTheCow":function(d){return "odstrani 1 in se izogni kravi"},
"removeN":function(d){return "odstrani "+maze_locale.v(d,"shovelfuls")},
"removePile":function(d){return "odstrani kup"},
"removeStack":function(d){return "odstrani več "+maze_locale.v(d,"shovelfuls")+" kupov"},
"removeSquare":function(d){return "odstrani kvadrat"},
"repeatCarefullyError":function(d){return "Za uspešno rešitev dobor premisli o vzorcu premikanja znotraj bloka \"ponovi\". Dodaten obrat na konvu nič ne škodi."},
"repeatUntil":function(d){return "ponavljaj dokler"},
"repeatUntilBlocked":function(d){return "dokler je pot naprej"},
"repeatUntilFinish":function(d){return "ponavljaj do konca"},
"step":function(d){return "Korak"},
"totalHoney":function(d){return "skupaj medu"},
"totalNectar":function(d){return "skupaj nekatrja"},
"turnLeft":function(d){return "obrni se levo"},
"turnRight":function(d){return "obrni se desno"},
"turnTooltip":function(d){return "Obrne me levo ali desno za 90 stopinj."},
"uncheckedCloudError":function(d){return "Prepričaj se, da si preveril vse oblake in izvedel ali so rože ali satovje."},
"uncheckedPurpleError":function(d){return "Prepričaj se, da si pregledal vse vijolične rože, če imajo nektar"},
"whileMsg":function(d){return "dokler"},
"whileTooltip":function(d){return "Ponavljaj vključena dejanja, dokler ne dosežeš zaključne točke."},
"word":function(d){return "Poišči besedo"},
"yes":function(d){return "Da"},
"youSpelled":function(d){return "Ti si črkoval"}};