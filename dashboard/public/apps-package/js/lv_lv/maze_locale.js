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
"atHoneycomb":function(d){return "pie meduskāres"},
"atFlower":function(d){return "pie zieda"},
"avoidCowAndRemove":function(d){return "izvairies no govs un noņem 1"},
"continue":function(d){return "Turpināt"},
"dig":function(d){return "noņemt 1"},
"digTooltip":function(d){return "noņemt 1 dubļa vienību"},
"dirE":function(d){return "A"},
"dirN":function(d){return "Z"},
"dirS":function(d){return "D"},
"dirW":function(d){return "R"},
"doCode":function(d){return "darīt"},
"elseCode":function(d){return "cits"},
"fill":function(d){return "aizpildīt 1"},
"fillN":function(d){return "aizpildīt "+maze_locale.v(d,"shovelfuls")},
"fillStack":function(d){return "aizpildīt kaudzi ar "+maze_locale.v(d,"shovelfuls")+" bedrēm"},
"fillSquare":function(d){return "aizpildīt kvadrātu"},
"fillTooltip":function(d){return "uzlikt 1 dubļa vienību"},
"finalLevel":function(d){return "Apsveicu! Jūs esat atrisinājis pēdējo puzli."},
"flowerEmptyError":function(d){return "Zieds, uz kura tu atrodies, vairs nesatur nektāru."},
"get":function(d){return "iegūt"},
"heightParameter":function(d){return "augstums"},
"holePresent":function(d){return "šeit ir bedre"},
"honey":function(d){return "pagatavot medu"},
"honeyAvailable":function(d){return "medus"},
"honeyTooltip":function(d){return "Pagatavot medu no nektāra"},
"honeycombFullError":function(d){return "Šai meduskārei vairs nepietiek vietas priekš medus."},
"ifCode":function(d){return "Ja"},
"ifInRepeatError":function(d){return "Tev jāliek \"Ja\" bloks iekš \"atkārtot\" bloka. Ja tas ir par grūtu, tad pamēģini iepriekšējo līmeni vēlreiz, un apskati, kā tas darbojas."},
"ifPathAhead":function(d){return "Ja ceļs priekšā"},
"ifTooltip":function(d){return "Ja ir ceļš noteiktā virzienā, tad darīt dažas darbības."},
"ifelseTooltip":function(d){return "Ja ir ceļš noteiktājā virzienā, tad darīt pirmā bloka darbības. Citādi, darīt otra bloka darbības."},
"ifFlowerTooltip":function(d){return "Ja noteiktajā virzienā ir zieds/medukāre, tad darīt dažas darbības."},
"ifOnlyFlowerTooltip":function(d){return "Ja izvēlētajā virzienā ir zieds, tad veikt dažas darbības."},
"ifelseFlowerTooltip":function(d){return "Ja noteiktajā virzienā ir zieds/medukāre, tad darīt pirmā bloka darbibas. Citādi, darīt otrā bloka darbības."},
"insufficientHoney":function(d){return "Tev jāpagatavo pareizo daudzumu medus."},
"insufficientNectar":function(d){return "Tev ir jāsavāc pareizais nektāra daudzums."},
"make":function(d){return "pagatavot"},
"moveBackward":function(d){return "pārvietot uz atpakaļ"},
"moveEastTooltip":function(d){return "Pārvietot mani uz austrumiem vienu lauciņu."},
"moveForward":function(d){return "pārvietot uz priekšu"},
"moveForwardTooltip":function(d){return "Pārvietot mani vienu lauciņu uz priekšu."},
"moveNorthTooltip":function(d){return "Pārvietot mani vienu lauciņu uz ziemeļiem."},
"moveSouthTooltip":function(d){return "Pārvietot mani vienu lauciņu uz dienvidiem."},
"moveTooltip":function(d){return "Pārvietot mani vienu lauciņu uz priekšu/uz atpakaļ"},
"moveWestTooltip":function(d){return "Pārvietot mani vienu lauciņu uz rietumiem."},
"nectar":function(d){return "iegūt nektāru"},
"nectarRemaining":function(d){return "nektārs"},
"nectarTooltip":function(d){return "Iegūt nektāru no zieda"},
"nextLevel":function(d){return "Apsveicu! Jūs pabeidzāt šo puzli."},
"no":function(d){return "Nē"},
"noPathAhead":function(d){return "ceļs ir bloķēts"},
"noPathLeft":function(d){return "nav ceļa pa kreisi"},
"noPathRight":function(d){return "nav ceļa pa labi"},
"notAtFlowerError":function(d){return "Nektāru var iegut tikai no ziediem."},
"notAtHoneycombError":function(d){return "Medu var pagatavot tikai pie meduskārtīm."},
"numBlocksNeeded":function(d){return "Šo puzli var atrisināt ar %1 blokiem."},
"pathAhead":function(d){return "ceļs ir priekšā"},
"pathLeft":function(d){return "ja ir ceļš pa kreisi"},
"pathRight":function(d){return "ja ir ceļš pa labi"},
"pilePresent":function(d){return "ir kaudze"},
"putdownTower":function(d){return "nolikt torni"},
"removeAndAvoidTheCow":function(d){return "noņemt 1 un izvairies no govs"},
"removeN":function(d){return "noņemt "+maze_locale.v(d,"shovelfuls")},
"removePile":function(d){return "noņemt kaudzi"},
"removeStack":function(d){return "nonemt "+maze_locale.v(d,"shovelfuls")+" kaudzes"},
"removeSquare":function(d){return "noņemt kvadrātu"},
"repeatCarefullyError":function(d){return "Lai atrisinātu šo, padomā kārtīgi par 2 gājienu modeli un vienu pagriezienu,ko ievietot \"atkārtot\" blokā. Tas nekas, ka beigās paliek brīvs gājiens."},
"repeatUntil":function(d){return "atkārtot līdz"},
"repeatUntilBlocked":function(d){return "kamēr ceļš priekšā"},
"repeatUntilFinish":function(d){return "atkārtot līdz finišam"},
"step":function(d){return "Solis"},
"totalHoney":function(d){return "kopējais medus"},
"totalNectar":function(d){return "kopejais nektārs"},
"turnLeft":function(d){return "pagriezt pa kreisi"},
"turnRight":function(d){return "pagriezt pa labi"},
"turnTooltip":function(d){return "pagriezt pa kreisi vai pa labi par 90 grādiem."},
"uncheckedCloudError":function(d){return "Pārliecinies, ka pārbaudiji visus mākoņus, lai redzētu  vai  tur  ir ziedi vai meduskārtis."},
"uncheckedPurpleError":function(d){return "Pārliecinies, ka pārbaudiji visas violetos ziedus , lai redzētu  vai  tajos ir nektārs"},
"whileMsg":function(d){return "kamēr"},
"whileTooltip":function(d){return "Atārtot slegtās darbības kamēr finiša punkts ir sasniegts."},
"word":function(d){return "Atrodi vārdu"},
"yes":function(d){return "Jā"},
"youSpelled":function(d){return "Jūs uzrakstījāt"},
"didNotCollectEverything":function(d){return "Make sure you don't leave any nectar or honey behind!"}};