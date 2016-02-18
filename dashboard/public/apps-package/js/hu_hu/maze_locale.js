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
"atHoneycomb":function(d){return "a lépnél"},
"atFlower":function(d){return "a virágnál"},
"avoidCowAndRemove":function(d){return "Kerüld el a tehenet, és távolíts el 1-et"},
"continue":function(d){return "Tovább"},
"dig":function(d){return "távolítsd el 1"},
"digTooltip":function(d){return "távolíts el 1 egységnyi földet"},
"dirE":function(d){return "Kelet"},
"dirN":function(d){return "Észak"},
"dirS":function(d){return "Dél"},
"dirW":function(d){return "Nyugat"},
"doCode":function(d){return "csináld"},
"elseCode":function(d){return "különben"},
"fill":function(d){return "töltsd fel 1"},
"fillN":function(d){return "töltsd fel "+maze_locale.v(d,"shovelfuls")},
"fillStack":function(d){return "töltsd fel a gödröt "+maze_locale.v(d,"shovelfuls")+" lapát földddel"},
"fillSquare":function(d){return "négyzet kitöltése"},
"fillTooltip":function(d){return "rakj le 1 adag földet"},
"finalLevel":function(d){return "Gratulálok, megoldottad az utolsó feladatot."},
"flowerEmptyError":function(d){return "Ebben a virágban nincs több nektár."},
"get":function(d){return "listából értéke"},
"heightParameter":function(d){return "magasság"},
"holePresent":function(d){return "van egy lyuk"},
"honey":function(d){return "készíts mézet"},
"honeyAvailable":function(d){return "méz"},
"honeyTooltip":function(d){return "Készíts mézet a nektárból"},
"honeycombFullError":function(d){return "Ebben a lépben nincs több méznek hely."},
"ifCode":function(d){return "ha"},
"ifInRepeatError":function(d){return "Szüksége van egy \"ha\"/\"if\" blokkra a  \"repeat\"/\"ismételd\" blokkon belül. Ha gondjaid vannak, próbáld újra az előző szintet, hogy lásd, hogyan működött."},
"ifPathAhead":function(d){return "ha van út előre"},
"ifTooltip":function(d){return "Ha van út az adott irányban, akkor csinálj valamit."},
"ifelseTooltip":function(d){return "Ha van út az adott irányban, akkor csináld az első blokk műveleteit, minden más esetben a második blokk műveleteit hajts végre."},
"ifFlowerTooltip":function(d){return "Ha van virág illetve méhsejt a megadott irányban, akkor csinálj valamit."},
"ifOnlyFlowerTooltip":function(d){return "Ha van virág a megadott irányban, akkor csinálj valamit."},
"ifelseFlowerTooltip":function(d){return "Ha van virág illetve lép a megadott irányban, akkor az első blokk műveleteit végezd el. Más esetben a második blokk műveleteit."},
"insufficientHoney":function(d){return "A megfelelő blokkokat használtad, de a mézből is megfelelő mennyiséget kell készítened."},
"insufficientNectar":function(d){return "A megfelelő blokkokat használtad, de a nektárból is megfelelő mennyiséget kell gyűjtened."},
"make":function(d){return "készíts"},
"moveBackward":function(d){return "menj hátrafelé"},
"moveEastTooltip":function(d){return "Mozgass kelet felé egy egységnyit."},
"moveForward":function(d){return "előrelépni"},
"moveForwardTooltip":function(d){return "Mozgass előre egy egységnyit."},
"moveNorthTooltip":function(d){return "Mozgass észak felé egy egységnyit."},
"moveSouthTooltip":function(d){return "Mozgass dél felé egy egységnyit."},
"moveTooltip":function(d){return "Mozgass előre vagy hátra egy egységnyit"},
"moveWestTooltip":function(d){return "Mozgass nyugat felé egy egységnyit."},
"nectar":function(d){return "gyűjts nektárt"},
"nectarRemaining":function(d){return "nektár"},
"nectarTooltip":function(d){return "Gyűjts nektárt a virágról"},
"nextLevel":function(d){return "Gratulálok! Ezt a feladatot megoldottad."},
"no":function(d){return "Nem"},
"noPathAhead":function(d){return "az út el van zárva"},
"noPathLeft":function(d){return "nincs út balra"},
"noPathRight":function(d){return "nincs út jobbra "},
"notAtFlowerError":function(d){return "Csak virágból tudsz nektárt gyűjteni."},
"notAtHoneycombError":function(d){return "Csak lépnél tudsz mézet készíteni."},
"numBlocksNeeded":function(d){return "Ez a feladat a(z) %1 blokkal megoldható."},
"pathAhead":function(d){return "út előre"},
"pathLeft":function(d){return "ha van balra út"},
"pathRight":function(d){return "ha van jobbra út"},
"pilePresent":function(d){return "van egy halom"},
"putdownTower":function(d){return "torony lerakása"},
"removeAndAvoidTheCow":function(d){return "vegyél el 1-et és kerüld el a tehenet"},
"removeN":function(d){return "távolítsd el "+maze_locale.v(d,"shovelfuls")},
"removePile":function(d){return "halom eltávolítása"},
"removeStack":function(d){return "távolíts el egy "+maze_locale.v(d,"shovelfuls")+" lapátnyi halmot"},
"removeSquare":function(d){return "távolítsd el a négyzetet"},
"repeatCarefullyError":function(d){return "A megoldáshoz gondold meg két  \"Előrelépni\" és egy \"Fordulj\" parancs használatát az \"Ismételd amíg\" blokkban. Nem baj hogyha a végén még egy külön \"Fordulj\" parancs lesz."},
"repeatUntil":function(d){return "ismételd amíg nem"},
"repeatUntilBlocked":function(d){return "amíg van út előtted"},
"repeatUntilFinish":function(d){return "befejezésig ismételd"},
"step":function(d){return "Lépés"},
"totalHoney":function(d){return "összes méz"},
"totalNectar":function(d){return "összes nektár"},
"turnLeft":function(d){return "fordulj balra"},
"turnRight":function(d){return "fordulj jobbra"},
"turnTooltip":function(d){return "90 fokkal balra vagy jobbra fordít engem."},
"uncheckedCloudError":function(d){return "Ügyelj arra, hogy megnézz minden felhőt, hogy meglásd vajon ők virágok vagy lépek."},
"uncheckedPurpleError":function(d){return "Ügyelj arra, hogy megnézd az összes lila virágot, vajon van-e nektár benne."},
"whileMsg":function(d){return "amíg"},
"whileTooltip":function(d){return "Ismételd a közbülső műveleteket a végpont eléréséig."},
"word":function(d){return "Ezt a szót keresd"},
"yes":function(d){return "Igen"},
"youSpelled":function(d){return "Amit találtál"},
"didNotCollectEverything":function(d){return "Make sure you don't leave any nectar or honey behind!"}};