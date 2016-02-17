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
"atHoneycomb":function(d){return "kärje juures"},
"atFlower":function(d){return "lille juures"},
"avoidCowAndRemove":function(d){return "väldi lehma ja eemalda 1"},
"continue":function(d){return "Jätka"},
"dig":function(d){return "eemalda 1"},
"digTooltip":function(d){return "eemalda 1 ühik mulda"},
"dirE":function(d){return "Ida"},
"dirN":function(d){return "Põhi"},
"dirS":function(d){return "Lõuna"},
"dirW":function(d){return "Lääs"},
"doCode":function(d){return "täida"},
"elseCode":function(d){return "muidu"},
"fill":function(d){return "täida 1"},
"fillN":function(d){return "täida "+maze_locale.v(d,"shovelfuls")},
"fillStack":function(d){return "täida "+maze_locale.v(d,"shovelfuls")+" auke"},
"fillSquare":function(d){return "täida ruut"},
"fillTooltip":function(d){return "aseta maha 1 ühik mulda"},
"finalLevel":function(d){return "Tubli! Sa lahendasid viimase mõistatuse."},
"flowerEmptyError":function(d){return "Lillel, millel oled, ei ole rohkem nektarit."},
"get":function(d){return "võta"},
"heightParameter":function(d){return "kõrgus"},
"holePresent":function(d){return "seal on auk"},
"honey":function(d){return "tee mett"},
"honeyAvailable":function(d){return "mesi"},
"honeyTooltip":function(d){return "Tee nektarist mett"},
"honeycombFullError":function(d){return "Selles meekärjes ei ole mee jaoks rohkem ruumi."},
"ifCode":function(d){return "kui"},
"ifInRepeatError":function(d){return "Sul on vaja \"kui\" plokki \"korda\" ploki sisse. Kui sul on probleeme, siis proovi eelmist taset uuesti, et näha kuidas see käis."},
"ifPathAhead":function(d){return "kui ees on tee"},
"ifTooltip":function(d){return "Kui märgitud suunas on tee, siis tee mõned toimingud."},
"ifelseTooltip":function(d){return "Kui märgitud suunas on tee, siis tee esimese ploki toiminguid. Vastasel juhul tee teise ploki toiminguid."},
"ifFlowerTooltip":function(d){return "Kui märgitud suunas on lill/kärg, siis tee mõned toimingud."},
"ifOnlyFlowerTooltip":function(d){return "Kui märgitud suunas on lill, siis tee mõned toimingud."},
"ifelseFlowerTooltip":function(d){return "Kui märgitud suunas on lill/kärg, siis tee esimene plokk toiminguid. Vastasel korral tee teine plokk toiminguid."},
"insufficientHoney":function(d){return "Sa pead tegema õige koguse mett."},
"insufficientNectar":function(d){return "Sa pead koguma õige koguse nektarit."},
"make":function(d){return "tee"},
"moveBackward":function(d){return "liigu tagasi"},
"moveEastTooltip":function(d){return "Liiguta mind ühe ühiku võrra itta."},
"moveForward":function(d){return "liigu edasi"},
"moveForwardTooltip":function(d){return "Liiguta mind ühe ühiku võrra edasi."},
"moveNorthTooltip":function(d){return "Liiguta mind ühe ühiku võrra põhja."},
"moveSouthTooltip":function(d){return "Liiguta mind ühe ühiku võrra lõunasse."},
"moveTooltip":function(d){return "Liiguta mind ühe ühiku võrra edasi/tagasi"},
"moveWestTooltip":function(d){return "Liiguta mind ühe ühiku võrra läände."},
"nectar":function(d){return "korja nektarit"},
"nectarRemaining":function(d){return "nektar"},
"nectarTooltip":function(d){return "Korja õielt nektarit"},
"nextLevel":function(d){return "Palju õnne! See ülesanne on lahendatud."},
"no":function(d){return "Ei"},
"noPathAhead":function(d){return "teel on takistus"},
"noPathLeft":function(d){return "vasakul ei ole teed"},
"noPathRight":function(d){return "paremal ei ole teed"},
"notAtFlowerError":function(d){return "Nektarit saab korjata ainult õitelt."},
"notAtHoneycombError":function(d){return "Sa saad teha mett ainult kärjes."},
"numBlocksNeeded":function(d){return "Selle ülesande saab lahendada %1 pusletükiga."},
"pathAhead":function(d){return "tee on ees"},
"pathLeft":function(d){return "kui vasakul on tee"},
"pathRight":function(d){return "kui paremal on tee"},
"pilePresent":function(d){return "seal on kuhi"},
"putdownTower":function(d){return "aseta torn maha"},
"removeAndAvoidTheCow":function(d){return "eemalda 1 ja väldi lehma"},
"removeN":function(d){return "eemalda "+maze_locale.v(d,"shovelfuls")},
"removePile":function(d){return "eemalda kuhi"},
"removeStack":function(d){return "eemalda "+maze_locale.v(d,"shovelfuls")+" hunnikuid"},
"removeSquare":function(d){return "eemalda ruut"},
"repeatCarefullyError":function(d){return "Lahendamiseks, mõtle hoolikalt kahe käigu mustrile ja \"korda\" bloki käigule. Sellest pole hullu, kui sul on lõpus lisakäik."},
"repeatUntil":function(d){return "korda kuni"},
"repeatUntilBlocked":function(d){return "kuni tee on ees"},
"repeatUntilFinish":function(d){return "korda kuni lõpuni"},
"step":function(d){return "samm"},
"totalHoney":function(d){return "kokku mett"},
"totalNectar":function(d){return "kokku nektarit"},
"turnLeft":function(d){return "pööra vasakule"},
"turnRight":function(d){return "pööra paremale"},
"turnTooltip":function(d){return "Pöörab mind vasakule või paremale 90 kraadi võrra."},
"uncheckedCloudError":function(d){return "Kindlasti kontrolli kõiki pilvi, et näha, kas nad on lilled või kärjed."},
"uncheckedPurpleError":function(d){return "Kindlasti kontrolli kõiki lillat värvi lilli, et teada saada kas neil on nektarit"},
"whileMsg":function(d){return "tingimusel"},
"whileTooltip":function(d){return "Korrake lisatud tegevusi kuni lõpppunkt on saavutatud."},
"word":function(d){return "Leia sõna"},
"yes":function(d){return "Jah"},
"youSpelled":function(d){return "Sa kirjutasid"},
"didNotCollectEverything":function(d){return "Make sure you don't leave any nectar or honey behind!"}};