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
"atHoneycomb":function(d){return "på bikube"},
"atFlower":function(d){return "på blomsten"},
"avoidCowAndRemove":function(d){return "unngå kua og fjern 1"},
"continue":function(d){return "Fortsett"},
"dig":function(d){return "fjern 1"},
"digTooltip":function(d){return "fjern 1 enhet jord"},
"dirE":function(d){return "Ø"},
"dirN":function(d){return "N"},
"dirS":function(d){return "S"},
"dirW":function(d){return "V"},
"doCode":function(d){return "gjør"},
"elseCode":function(d){return "ellers"},
"fill":function(d){return "fyll 1"},
"fillN":function(d){return "fyll "+maze_locale.v(d,"shovelfuls")},
"fillStack":function(d){return "Fyll stabelen av "+maze_locale.v(d,"shovelfuls")+" hull"},
"fillSquare":function(d){return "fyll et kvadrat"},
"fillTooltip":function(d){return "plasser 1 enhet jord"},
"finalLevel":function(d){return "Gratulerer! Du har løst den siste oppgaven."},
"flowerEmptyError":function(d){return "Blomsten du er på er tom for nektar."},
"get":function(d){return "hent"},
"heightParameter":function(d){return "høyde"},
"holePresent":function(d){return "det er et hull"},
"honey":function(d){return "Lag honning"},
"honeyAvailable":function(d){return "honning"},
"honeyTooltip":function(d){return "Lag honning av nektar"},
"honeycombFullError":function(d){return "Denne bikuben har ikke plass til mer honning."},
"ifCode":function(d){return "hvis"},
"ifInRepeatError":function(d){return "Du trenger en \"hvis\"-blokk inni en \"gjenta\"-blokk. Hvis du får vanskeligheter, prøv det forrige nivået en gang til for å se hvordan det fungerte."},
"ifPathAhead":function(d){return "hvis det er sti foran"},
"ifTooltip":function(d){return "Hvis det er en sti i den angitte retningen, så gjør noen handlinger."},
"ifelseTooltip":function(d){return "Hvis det er en sti i den angitte retningen, så utfør den første blokken med handlinger. Ellers, utfør den andre blokken med handlinger."},
"ifFlowerTooltip":function(d){return "Hvis det befinner seg en blomst/bikube i den angitte retningen, utfør en handling."},
"ifOnlyFlowerTooltip":function(d){return "Hvis det er en blomst i den angitte retningen, utfør handlinger."},
"ifelseFlowerTooltip":function(d){return "Hvis det er en blomst/bikube i angitt retning, utfør handlingen  i den første blokken. Ellers, utfør handlingen i blokk nummer to."},
"insufficientHoney":function(d){return "Du bruker alle de riktige blokkene, men du må lage riktig mengde honning."},
"insufficientNectar":function(d){return "Du bruker alle riktige blokker, men du må samle inn riktig mengde nektar."},
"make":function(d){return "Lag"},
"moveBackward":function(d){return "Flytt bakover"},
"moveEastTooltip":function(d){return "Flytte meg en rute østover."},
"moveForward":function(d){return "gå fremover"},
"moveForwardTooltip":function(d){return "Flytt meg en plass fremover."},
"moveNorthTooltip":function(d){return "Flytte meg en plass nordover."},
"moveSouthTooltip":function(d){return "Flytte meg en plass sørover."},
"moveTooltip":function(d){return "Flytte meg en plass fremover/bakover"},
"moveWestTooltip":function(d){return "Flytte meg en plass vestover."},
"nectar":function(d){return "få nektar"},
"nectarRemaining":function(d){return "nektar"},
"nectarTooltip":function(d){return "Få nektar fra en blomst"},
"nextLevel":function(d){return "Gratulerer! Du har fullført denne utfordringen."},
"no":function(d){return "Nei"},
"noPathAhead":function(d){return "stien er blokkert"},
"noPathLeft":function(d){return "ingen sti til venstre"},
"noPathRight":function(d){return "ingen sti til høyre"},
"notAtFlowerError":function(d){return "Du kan bare få nektar fra en blomst."},
"notAtHoneycombError":function(d){return "Du kan bare lage honning i en bikube."},
"numBlocksNeeded":function(d){return "Denne utfordringen kan bli løst med %1 blokker."},
"pathAhead":function(d){return "sti foran"},
"pathLeft":function(d){return "hvis sti til venstre"},
"pathRight":function(d){return "hvis sti til høyre"},
"pilePresent":function(d){return "det er en haug"},
"putdownTower":function(d){return "sett ned tårn"},
"removeAndAvoidTheCow":function(d){return "fjern 1 og unngå kua"},
"removeN":function(d){return "fjern "+maze_locale.v(d,"shovelfuls")},
"removePile":function(d){return "fjern haugen"},
"removeStack":function(d){return "Fjern raden med med "+maze_locale.v(d,"shovelfuls")+" hauger"},
"removeSquare":function(d){return "fjern kvadratet"},
"repeatCarefullyError":function(d){return "For å løse dette, se etter et mønster av to forflytninger og en retningsforandring  som kan plasseres i \"repeter\" blokken. Det er greit å avslutte med en ekstra retningsforandring."},
"repeatUntil":function(d){return "gjenta til"},
"repeatUntilBlocked":function(d){return "så lenge det er en sti foran"},
"repeatUntilFinish":function(d){return "gjenta til ferdig"},
"step":function(d){return "Trinn"},
"totalHoney":function(d){return "total honning"},
"totalNectar":function(d){return "total nektar"},
"turnLeft":function(d){return "snu mot venstre"},
"turnRight":function(d){return "snu mot høyre"},
"turnTooltip":function(d){return "Snur meg mot venstre eller høyre med 90 grader."},
"uncheckedCloudError":function(d){return "Sørg for å sjekke alle skyer for å se om de er blomster eller bikuber."},
"uncheckedPurpleError":function(d){return "Husk å undersøke alle lilla blomster for å se om de inneholder nektar"},
"whileMsg":function(d){return "så lenge"},
"whileTooltip":function(d){return "Gjenta disse handlingene inntil målet er nådd."},
"word":function(d){return "Finn ordet"},
"yes":function(d){return "Ja"},
"youSpelled":function(d){return "Du stavet"},
"didNotCollectEverything":function(d){return "Make sure you don't leave any nectar or honey behind!"}};