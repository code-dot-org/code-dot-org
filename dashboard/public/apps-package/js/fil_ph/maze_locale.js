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
"atHoneycomb":function(d){return "sa honeycomb"},
"atFlower":function(d){return "sa bulaklak"},
"avoidCowAndRemove":function(d){return "iwasan ang baka at alisin ang 1"},
"continue":function(d){return "Magpatuloy"},
"dig":function(d){return "alisin ang 1"},
"digTooltip":function(d){return "alisin ang 1 na unit ng dumi"},
"dirE":function(d){return "E"},
"dirN":function(d){return "N"},
"dirS":function(d){return "S"},
"dirW":function(d){return "W"},
"doCode":function(d){return "gawin"},
"elseCode":function(d){return "else"},
"fill":function(d){return "punuin ang 1"},
"fillN":function(d){return "punuin "+maze_locale.v(d,"shovelfuls")},
"fillStack":function(d){return "punuin ang stack ng "+maze_locale.v(d,"shovelfuls")+" mga butas"},
"fillSquare":function(d){return "punuin ang parisukat"},
"fillTooltip":function(d){return "maglagay ng 1 unit ng dumi"},
"finalLevel":function(d){return "Maligayang pagbati! Nalutas mo na ang pinakahuling puzzle."},
"flowerEmptyError":function(d){return "Ang bulaklak kung saan ikaw ang nakadapo ay wala ng nectar."},
"get":function(d){return "kunin"},
"heightParameter":function(d){return "taas"},
"holePresent":function(d){return "merong butas"},
"honey":function(d){return "gumawa ng honey"},
"honeyAvailable":function(d){return "honey"},
"honeyTooltip":function(d){return "Gumawa ng honey mula sa nectar"},
"honeycombFullError":function(d){return "Ang honeycomb na ito ay wala ng paglalagyan ng honey."},
"ifCode":function(d){return "kung"},
"ifInRepeatError":function(d){return "Kailangan mo ng \"if\" block sa loob ng \"repeat\" block. Kung nahihirapan, subukan ang previous na level muli upang makita kung paano ito gumana."},
"ifPathAhead":function(d){return "kung ang daan sa unahan"},
"ifTooltip":function(d){return "Kung meron daanan sa tinukay na direksyon, kung gayon ay gumawa ng mga aksyon."},
"ifelseTooltip":function(d){return "Kung meron daan sa nasabing direksyon, kung gayon ay gawin ang unang bloke ng mga aksyon. Kung hindi, gawin ang pangalawang bloke ng mga aksyon."},
"ifFlowerTooltip":function(d){return "Kung meron bulaklak/honeycomb sa itinurong direksyon, saka gawin ang mga aksyon."},
"ifOnlyFlowerTooltip":function(d){return "Kung may bulaklak sa nasabing direksiyon, gumawa ng kahit anong action."},
"ifelseFlowerTooltip":function(d){return "Kung meron bulaklak/honeycomb sa itinurong direksyon, saka gawin ang unang mga block ng mga aksyon. Kung hindi, gawin ang pangalawang block ng mga aksyon."},
"insufficientHoney":function(d){return "Ginagamit mo ang lahat ng tamang mga block, ngunit kailangan mo gumawa ng tamang dami ng honey."},
"insufficientNectar":function(d){return "Ginagamit mo ang lahat ng tamang mga block, ngunit kailangan mo kumulekta ng tamang dami ng honey."},
"make":function(d){return "gawin"},
"moveBackward":function(d){return "gumalaw patalikod"},
"moveEastTooltip":function(d){return "Igalaw ako pasilangan ng isang puwang."},
"moveForward":function(d){return "umabante"},
"moveForwardTooltip":function(d){return "Igalaw ako ng paunahan ng isang puwang."},
"moveNorthTooltip":function(d){return "Igalaw ako pahilaga ng isang puwang."},
"moveSouthTooltip":function(d){return "Igalaw ako patimog ng isang puwang."},
"moveTooltip":function(d){return "Gumalaw ng paabante/patalikod ng isang puwang"},
"moveWestTooltip":function(d){return "Igalaw ako pakanluran ng isang puwang."},
"nectar":function(d){return "kunin ang nectar"},
"nectarRemaining":function(d){return "nectar"},
"nectarTooltip":function(d){return "Kumuha ng nectar mula sa bulaklak"},
"nextLevel":function(d){return "Maligayang pagbati! Natapos mo ang puzzle na ito."},
"no":function(d){return "Hindi"},
"noPathAhead":function(d){return "ang daanan ay nahaharangan"},
"noPathLeft":function(d){return "walang daanan pakaliwa"},
"noPathRight":function(d){return "walang daanan pakanan"},
"notAtFlowerError":function(d){return "Maaari ka lang kumuha ng nectar mula sa bulaklak."},
"notAtHoneycombError":function(d){return "Maaari ka lang gumawa ng honey sa honeycomb."},
"numBlocksNeeded":function(d){return "Ang puzzle na ito ay maaaring malutas sa %1 na mga block."},
"pathAhead":function(d){return "ang daan sa unahan"},
"pathLeft":function(d){return "kung ang daan sa kaliwa"},
"pathRight":function(d){return "kung ang daan sa kanan"},
"pilePresent":function(d){return "meron mga tambak"},
"putdownTower":function(d){return "ibaba ang tore"},
"removeAndAvoidTheCow":function(d){return "alisin ang 1 at iwasan ang baka"},
"removeN":function(d){return "alisin "+maze_locale.v(d,"shovelfuls")},
"removePile":function(d){return "alisin ang tambak"},
"removeStack":function(d){return "alisin ang nakasalansan na mga "+maze_locale.v(d,"shovelfuls")+" tambak"},
"removeSquare":function(d){return "alisin ang parisukat"},
"repeatCarefullyError":function(d){return "Upang masagot ito, pag-isipan ng mabuti ang pattern ng dalawang galaw at isang turn upang mailagay ang \"repeat\" block. Ayos lang na magkaroon ng extra na turn sa huli."},
"repeatUntil":function(d){return "ulitin hanggang"},
"repeatUntilBlocked":function(d){return "habang ang daan ay diretso"},
"repeatUntilFinish":function(d){return "ulitin hanggang matapos"},
"step":function(d){return "Hakbang"},
"totalHoney":function(d){return "kabuuan ng honey"},
"totalNectar":function(d){return "kabuuan ng nectar"},
"turnLeft":function(d){return "kumaliwa"},
"turnRight":function(d){return "kumanan"},
"turnTooltip":function(d){return "Iniikot ako pakaliwa o pakanan ng 90 degrees."},
"uncheckedCloudError":function(d){return "Siguraduhin na natingnan ang lahat ng mga ulap upang malaman kung ito ay mga bulaklak o mga honeycomb."},
"uncheckedPurpleError":function(d){return "Siguraduhin na natingnan ang lahat ng purple na bulaklak upang malaman kung ito ay may nectar"},
"whileMsg":function(d){return "habang"},
"whileTooltip":function(d){return "Ulitin ang mga nakalakip na mga aksyon hanggang ang dulo ay maabot."},
"word":function(d){return "Hanapin ang salita"},
"yes":function(d){return "Oo"},
"youSpelled":function(d){return "Ini-spell mo ang"}};