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
"atHoneycomb":function(d){return "hunajakennossa"},
"atFlower":function(d){return "kukan luona"},
"avoidCowAndRemove":function(d){return "Vältä lehmää ja poista 1"},
"continue":function(d){return "Jatka"},
"dig":function(d){return "poista 1"},
"digTooltip":function(d){return "poista 1 yksikkö maata"},
"dirE":function(d){return "I"},
"dirN":function(d){return "P"},
"dirS":function(d){return "E"},
"dirW":function(d){return "L"},
"doCode":function(d){return "tee"},
"elseCode":function(d){return "muuten"},
"fill":function(d){return "täytä 1"},
"fillN":function(d){return "täytä "+maze_locale.v(d,"shovelfuls")},
"fillStack":function(d){return "Täytä "+maze_locale.v(d,"shovelfuls")+" kuoppaa"},
"fillSquare":function(d){return "täytä neliö"},
"fillTooltip":function(d){return "aseta yksi yksikkö maata"},
"finalLevel":function(d){return "Onneksi olkoon! Olet suorittanut viimeisen tehtävän."},
"flowerEmptyError":function(d){return "Kukkassa jonka päällä olet ei ole enään mettä."},
"get":function(d){return "kerää"},
"heightParameter":function(d){return "korkeus"},
"holePresent":function(d){return "tässä on kuoppa"},
"honey":function(d){return "tee hunajaa"},
"honeyAvailable":function(d){return "hunaja"},
"honeyTooltip":function(d){return "Tee medestä hunajaa"},
"honeycombFullError":function(d){return "Hunajakennossa ei ole enempää tilaa hunajalle."},
"ifCode":function(d){return "jos"},
"ifInRepeatError":function(d){return "Tarvitset \"jos\"-lohkon \"toista\"-lohkon sisään. Jos sinulla on vaikeuksia, yritä edellistä tasoa uudestaan ja katso miten se toimii."},
"ifPathAhead":function(d){return "jos edessä on polku"},
"ifTooltip":function(d){return "Jos määrätyssä suunnassa on polku, niin suorita jokin toiminto."},
"ifelseTooltip":function(d){return "Jos määrätyssä suunnassa on polku, niin suorita ensimmäinen lohko toimintoja. Muuten suorita toinen lohko toimintoja."},
"ifFlowerTooltip":function(d){return "Jos määritellyssä suunnassa on kukka/hunajakenno, tee joitain toimintoja."},
"ifOnlyFlowerTooltip":function(d){return "Jos määrätyssä suunnassa on kukka, niin suorita jokin toiminto."},
"ifelseFlowerTooltip":function(d){return "Jos määritellyssä suunnassa on kukka/hunajakenno, tee ensimmäiset toiminnot. Muutoin tee toiset toiminnot."},
"insufficientHoney":function(d){return "Sinun täytyy tehdä oikea määrä hunajaa."},
"insufficientNectar":function(d){return "Sinun täytyy kerätä oikea määrä mettä."},
"make":function(d){return "tee"},
"moveBackward":function(d){return "Liiku taaksepäin"},
"moveEastTooltip":function(d){return "Liikuta minua yksi askel itään."},
"moveForward":function(d){return "liiku eteenpäin"},
"moveForwardTooltip":function(d){return "Liikuta minua eteenpäin yhden välin verran."},
"moveNorthTooltip":function(d){return "Liikuta minua yksi askel pohjoiseen."},
"moveSouthTooltip":function(d){return "Liikuta minua yksi askel etelään."},
"moveTooltip":function(d){return "Liikuta minua eteen- tai taaksepäin yksi askel"},
"moveWestTooltip":function(d){return "Liikuta minua yksi askel länteen."},
"nectar":function(d){return "kerää mesi"},
"nectarRemaining":function(d){return "mesi"},
"nectarTooltip":function(d){return "Kerää mesi kukasta"},
"nextLevel":function(d){return "Onneksi olkoon! Olet suorittanut tämän tehtävän."},
"no":function(d){return "Ei"},
"noPathAhead":function(d){return "polulla on este"},
"noPathLeft":function(d){return "ei polkua vasemmalle"},
"noPathRight":function(d){return "ei polkua oikealle"},
"notAtFlowerError":function(d){return "Voit saada mettä vain kukasta."},
"notAtHoneycombError":function(d){return "Voit tehdä hunajaa vain hunajakennossa."},
"numBlocksNeeded":function(d){return "Tehtävän voi ratkaista %1 lohkolla."},
"pathAhead":function(d){return "polku edessä"},
"pathLeft":function(d){return "jos polku vasemmalle"},
"pathRight":function(d){return "jos polku oikealle"},
"pilePresent":function(d){return "tässä on kasa"},
"putdownTower":function(d){return "aseta torni"},
"removeAndAvoidTheCow":function(d){return "poista yksi ja vältä lehmää"},
"removeN":function(d){return "poista "+maze_locale.v(d,"shovelfuls")},
"removePile":function(d){return "poista kasa"},
"removeStack":function(d){return "poista "+maze_locale.v(d,"shovelfuls")+" kasaa"},
"removeSquare":function(d){return "poista neliö"},
"repeatCarefullyError":function(d){return "Ratkaistaksesi tämän, mieti tarkkaan kahden siirron ja yhden käännöksen laittamista \"toista\" lohkoon.  Voit myös jättää yhden lisäkäännöksen loppuun."},
"repeatUntil":function(d){return "toista kunnes"},
"repeatUntilBlocked":function(d){return "niin kauan kuin polku edessä"},
"repeatUntilFinish":function(d){return "toista kunnes lopussa"},
"step":function(d){return "Askel"},
"totalHoney":function(d){return "yhteensä hunajaa"},
"totalNectar":function(d){return "yhteensä mettä"},
"turnLeft":function(d){return "käänny vasempaan"},
"turnRight":function(d){return "käänny oikeaan"},
"turnTooltip":function(d){return "Kääntää minua vasempaan tai oikeaan 90 astetta."},
"uncheckedCloudError":function(d){return "Muista tarkistaa kaikki pilvet nähdäksesi, ovatko ne kukkia tai hunajakennoja."},
"uncheckedPurpleError":function(d){return "Tarkista kaikista violeteista kukista, onko niissä mettä"},
"whileMsg":function(d){return "niin kauan kuin"},
"whileTooltip":function(d){return "Toista sisällä oleva toiminto kunnes saavutetaan loppupiste."},
"word":function(d){return "Etsi sana"},
"yes":function(d){return "Kyllä"},
"youSpelled":function(d){return "Kirjoitit"},
"didNotCollectEverything":function(d){return "Make sure you don't leave any nectar or honey behind!"}};