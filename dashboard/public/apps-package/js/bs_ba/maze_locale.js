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
"atHoneycomb":function(d){return "na saću"},
"atFlower":function(d){return "na cvijetu"},
"avoidCowAndRemove":function(d){return "izbjegni kravu i ukloni 1"},
"continue":function(d){return "Nastavi"},
"dig":function(d){return "ukloni 1"},
"digTooltip":function(d){return "ukloni 1 komad zemlje"},
"dirE":function(d){return "Istok"},
"dirN":function(d){return "Sjever"},
"dirS":function(d){return "Jug"},
"dirW":function(d){return "Zapad"},
"doCode":function(d){return "uradi"},
"elseCode":function(d){return "inače"},
"fill":function(d){return "popuniti 1"},
"fillN":function(d){return "popuniti "+maze_locale.v(d,"shovelfuls")},
"fillStack":function(d){return "popuni stog od "+maze_locale.v(d,"shovelfuls")+" rupa"},
"fillSquare":function(d){return "popuni kvadrat"},
"fillTooltip":function(d){return "stavi 1 komad zemlje"},
"finalLevel":function(d){return "Čestitamo ! Riješili ste posljednji zadatak."},
"flowerEmptyError":function(d){return "Cvijet na kojem se nalaziš nema više nektara."},
"get":function(d){return "uzmi"},
"heightParameter":function(d){return "visina"},
"holePresent":function(d){return "ovdje je rupa"},
"honey":function(d){return "napravi med"},
"honeyAvailable":function(d){return "med"},
"honeyTooltip":function(d){return "Pravi med od nektara"},
"honeycombFullError":function(d){return "Ovo saće nema više slobodnog prostora za med."},
"ifCode":function(d){return "ako"},
"ifInRepeatError":function(d){return "Treba ti \"ako\" blok unutar \"ponovi\" bloka. Ako imaš problema s time, pogledaj prethodni nivo da vidiš kako to radi."},
"ifPathAhead":function(d){return "ako je put ispred"},
"ifTooltip":function(d){return "Ako staza ide u zadanom smjeru, onda uradi neke akcije."},
"ifelseTooltip":function(d){return "Ako staza vodi u zadanom smjeru, onda uradi prvu grupu akcija, a inače uradi drugu grupu akcija."},
"ifFlowerTooltip":function(d){return "Ako u navedenom smjeru postoji cvijet ili saće, onda uradi neke akcije."},
"ifOnlyFlowerTooltip":function(d){return "Ukoliko imate cvijet u zadatom smijeru, onda uradite neke radnje."},
"ifelseFlowerTooltip":function(d){return "Ako u navedenom smjeru postoji cvijet ili saće, onda uradi prvi blok akcija. Inače uradi drugi blok akcija."},
"insufficientHoney":function(d){return "Koristiš sve odgovarajuće blokove, ali trebaš napraviti pravu količinu meda."},
"insufficientNectar":function(d){return "Koristiš sve odgovarajuće blokove, ali trebaš prikupiti pravu količinu nektara."},
"make":function(d){return "kreiraj"},
"moveBackward":function(d){return "idi unatrag"},
"moveEastTooltip":function(d){return "Premjesti me za jedno polje na Istok."},
"moveForward":function(d){return "idi naprijed"},
"moveForwardTooltip":function(d){return "Pomakni me naprijed za jedno polje."},
"moveNorthTooltip":function(d){return "Pomakni me za jedno polje na Sjever."},
"moveSouthTooltip":function(d){return "Pomakni me za jedno polje na Jug."},
"moveTooltip":function(d){return "Pomakni me naprijed ili nazad za jedno polje"},
"moveWestTooltip":function(d){return "Pomakni me za jedno polje na Zapad."},
"nectar":function(d){return "pokupi nektar"},
"nectarRemaining":function(d){return "nektar"},
"nectarTooltip":function(d){return "Pokupi nektar sa cvijeta"},
"nextLevel":function(d){return "Čestitamo! Ovaj zadatak je riješen."},
"no":function(d){return "Ne"},
"noPathAhead":function(d){return "staza je blokirana"},
"noPathLeft":function(d){return "s lijeve strane nema staze"},
"noPathRight":function(d){return "s desne strane nema staze"},
"notAtFlowerError":function(d){return "Nektar možeš dobiti samo iz cvijeta."},
"notAtHoneycombError":function(d){return "Med možeš napraviti samo na saću."},
"numBlocksNeeded":function(d){return "Ovaj zadatak se može riješiti sa %1 blokova."},
"pathAhead":function(d){return "staza je ispred"},
"pathLeft":function(d){return "ako je staza lijevo"},
"pathRight":function(d){return "ako je staza desno"},
"pilePresent":function(d){return "ovdje je hrpa"},
"putdownTower":function(d){return "spusti kulu"},
"removeAndAvoidTheCow":function(d){return "ukloni 1 i izbjegni kravu"},
"removeN":function(d){return "ukloni "+maze_locale.v(d,"shovelfuls")},
"removePile":function(d){return "ukloni hrpu"},
"removeStack":function(d){return "ukloni stog od "+maze_locale.v(d,"shovelfuls")+" hrpa"},
"removeSquare":function(d){return "ukloni kvadrat"},
"repeatCarefullyError":function(d){return "Da bi ovo riješio, dobro razmisli o uzorku sastavljenom od dva kretanja i jednog skretanja koji se stavlja u blok \"ponovi\". U redu je ako na kraju imaš jedno skretanje više."},
"repeatUntil":function(d){return "ponavljaj dok ne bude"},
"repeatUntilBlocked":function(d){return "dok je staza ispred"},
"repeatUntilFinish":function(d){return "ponavljaj dok ne završiš"},
"step":function(d){return "Korak"},
"totalHoney":function(d){return "ukupna količina meda"},
"totalNectar":function(d){return "ukupna količina nektara"},
"turnLeft":function(d){return "okreni lijevo"},
"turnRight":function(d){return "okreni desno"},
"turnTooltip":function(d){return "Okreće me lijevo ili desno za 90 stepeni."},
"uncheckedCloudError":function(d){return "Dobro provjeri sve oblake da vidiš da li su cvjetovi ili saće."},
"uncheckedPurpleError":function(d){return "Dobro provjeri sve ljubičaste cvjetove da vidiš ima li na njima nektara"},
"whileMsg":function(d){return "dok"},
"whileTooltip":function(d){return "Ponavlja umetnute akcije dok se ne dosegne zadani cilj."},
"word":function(d){return "Pronađi riječ"},
"yes":function(d){return "Da"},
"youSpelled":function(d){return "Napisao si"}};