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
"atHoneycomb":function(d){return "på bistadet"},
"atFlower":function(d){return "på blomsten"},
"avoidCowAndRemove":function(d){return "undgå koen og fjern 1"},
"continue":function(d){return "Fortsæt"},
"dig":function(d){return "fjern 1"},
"digTooltip":function(d){return "fjern 1 enhed jord"},
"dirE":function(d){return "Ø"},
"dirN":function(d){return "N"},
"dirS":function(d){return "S"},
"dirW":function(d){return "V"},
"doCode":function(d){return "udfør"},
"elseCode":function(d){return "ellers"},
"fill":function(d){return "fyld 1"},
"fillN":function(d){return "fyld "+maze_locale.v(d,"shovelfuls")},
"fillStack":function(d){return "Fyld stak af "+maze_locale.v(d,"shovelfuls")+" huller"},
"fillSquare":function(d){return "Udfyld firkanten"},
"fillTooltip":function(d){return "placér 1 enhed af jord"},
"finalLevel":function(d){return "Tillykke! Du har løst den sidste opgave."},
"flowerEmptyError":function(d){return "Blomsten du er på, har ikke mere nektar."},
"get":function(d){return "hent"},
"heightParameter":function(d){return "højde"},
"holePresent":function(d){return "der er et hul"},
"honey":function(d){return "lav honning"},
"honeyAvailable":function(d){return "honning"},
"honeyTooltip":function(d){return "Lav honning af nektar"},
"honeycombFullError":function(d){return "Dette bistade har ikke plads til mere honning."},
"ifCode":function(d){return "hvis"},
"ifInRepeatError":function(d){return "Du har brug for en \"hvis\" blok inde i en \"gentag\" blok. Hvis du har problemer, prøv det tidligere niveau igen for at se, hvordan det virkede."},
"ifPathAhead":function(d){return "hvis stien fortsætter"},
"ifTooltip":function(d){return "Hvis der er en sti i den angivne retning, så udfør nogle handlinger."},
"ifelseTooltip":function(d){return "Hvis der er en sti i den angivne retning, så udfør den første blok af handlinger. Ellers udfør den anden blok af handlinger."},
"ifFlowerTooltip":function(d){return "Hvis der er en blomst/et bistade i den angivne retning, så udfør nogle handlinger."},
"ifOnlyFlowerTooltip":function(d){return "Hvis der er en blomst i den angivne retning, så udfør nogle handlinger."},
"ifelseFlowerTooltip":function(d){return "Hvis der er en blomst/et bistade i den angivne retning, så udfør den første gruppe af handlinger. Ellers udfør den anden gruppe af handlinger."},
"insufficientHoney":function(d){return "Du bruger alle de rigtige blokke, men du skal lave den rigtige mængde af honning."},
"insufficientNectar":function(d){return "Du bruger alle de rigtige blokke, men du har brug for at indsamle den rigtige mængde af nektar."},
"make":function(d){return "lav"},
"moveBackward":function(d){return "flyt bagud"},
"moveEastTooltip":function(d){return "Flyt mig et felt mod øst."},
"moveForward":function(d){return "flyt fremad"},
"moveForwardTooltip":function(d){return "Flyt mig en plads frem."},
"moveNorthTooltip":function(d){return "Flyt mig et felt mod nord."},
"moveSouthTooltip":function(d){return "Flyt mig én plads syd."},
"moveTooltip":function(d){return "Flyt mig én plads fremad/bagud"},
"moveWestTooltip":function(d){return "Flyt mig et felt mod vest."},
"nectar":function(d){return "hent nektar"},
"nectarRemaining":function(d){return "nektar"},
"nectarTooltip":function(d){return "Hent nektar fra en blomst"},
"nextLevel":function(d){return "Tillykke! Du har fuldført denne opgave."},
"no":function(d){return "Nej"},
"noPathAhead":function(d){return "stien er blokeret"},
"noPathLeft":function(d){return "ingen sti til venstre"},
"noPathRight":function(d){return "ingen sti til højre"},
"notAtFlowerError":function(d){return "Du kan kun hente nektar fra en blomst."},
"notAtHoneycombError":function(d){return "Du kan kun lave honning på et bistade."},
"numBlocksNeeded":function(d){return "Denne opgave kan løses med %1 blokke."},
"pathAhead":function(d){return "sti forude"},
"pathLeft":function(d){return "hvis sti til venstre"},
"pathRight":function(d){return "hvis sti til højre"},
"pilePresent":function(d){return "der er en bunke"},
"putdownTower":function(d){return "sæt tårn ned"},
"removeAndAvoidTheCow":function(d){return "fjern 1 og undgå koen"},
"removeN":function(d){return "fjern "+maze_locale.v(d,"shovelfuls")},
"removePile":function(d){return "fjern bunke"},
"removeStack":function(d){return "fjern stak af "+maze_locale.v(d,"shovelfuls")+" bunker"},
"removeSquare":function(d){return "fjern firkant"},
"repeatCarefullyError":function(d){return "For at løse dette, tænk omhyggeligt på et mønster af to bevægelser og et drej til at sætte i den \"gentag\" blokken.  Det er okay at have en ekstra tur i slutningen."},
"repeatUntil":function(d){return "gentag indtil"},
"repeatUntilBlocked":function(d){return "mens sti forude"},
"repeatUntilFinish":function(d){return "gentag indtil færdig"},
"step":function(d){return "Tip!"},
"totalHoney":function(d){return "Honning ialt"},
"totalNectar":function(d){return "Nektar ialt"},
"turnLeft":function(d){return "drej til venstre"},
"turnRight":function(d){return "drej til højre"},
"turnTooltip":function(d){return "Vender mig venstre eller højre med 90 grader."},
"uncheckedCloudError":function(d){return "Sørg for at tjekke alle skyer, for at se om der er blomster eller bistader."},
"uncheckedPurpleError":function(d){return "Sørg for at tjekke alle lilla blomster, for at se om de har nektar"},
"whileMsg":function(d){return "mens"},
"whileTooltip":function(d){return "Gentag de lukkede handlinger indtil målet er nået."},
"word":function(d){return "Find ordet"},
"yes":function(d){return "Ja"},
"youSpelled":function(d){return "Du har stavet"},
"didNotCollectEverything":function(d){return "Make sure you don't leave any nectar or honey behind!"}};