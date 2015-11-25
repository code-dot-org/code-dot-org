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
"atHoneycomb":function(d){return "bij de honingraat"},
"atFlower":function(d){return "op de bloem"},
"avoidCowAndRemove":function(d){return "vermijd de koe en verwijder 1"},
"continue":function(d){return "Doorgaan"},
"dig":function(d){return "verwijder 1"},
"digTooltip":function(d){return "verwijder 1 stukje aarde"},
"dirE":function(d){return "O"},
"dirN":function(d){return "N"},
"dirS":function(d){return "Z"},
"dirW":function(d){return "W"},
"doCode":function(d){return "voer uit"},
"elseCode":function(d){return "anders"},
"fill":function(d){return "vul in 1"},
"fillN":function(d){return "vul "+maze_locale.v(d,"shovelfuls")},
"fillStack":function(d){return "vul stapel met "+maze_locale.v(d,"shovelfuls")+" gaten"},
"fillSquare":function(d){return "vul vierkant"},
"fillTooltip":function(d){return "plaats 1 stukje aarde"},
"finalLevel":function(d){return "Gefeliciteerd! je hebt de laatste puzzel opgelost."},
"flowerEmptyError":function(d){return "De bloem waar je op staat heeft geen nectar meer."},
"get":function(d){return "pak"},
"heightParameter":function(d){return "hoogte"},
"holePresent":function(d){return "daar is een gat"},
"honey":function(d){return "maak honing"},
"honeyAvailable":function(d){return "honing"},
"honeyTooltip":function(d){return "maak honing van nectar"},
"honeycombFullError":function(d){return "Er past geen honing meer in deze honingraat."},
"ifCode":function(d){return "als"},
"ifInRepeatError":function(d){return "Je hebt een \"als\" blok in een \"herhaal\" blok nodig. Als je vastloopt, probeer dan de vorige level nog eens om te kijken hoe het werkte."},
"ifPathAhead":function(d){return "als pad voor"},
"ifTooltip":function(d){return "als er een pad is in de aangegeven richting, doe een paar acties."},
"ifelseTooltip":function(d){return "als er een pad in de opgegeven richting is, doe je het eerste actie blok. anders, doe je de tweede actie blok."},
"ifFlowerTooltip":function(d){return "Als er een bloem/honingraat in de opgegeven richting staat, voer dan enkele acties uit."},
"ifOnlyFlowerTooltip":function(d){return "Wanneer er een bloem is in de aangegeven richting, voer dan een een paar acties uit."},
"ifelseFlowerTooltip":function(d){return "Als er een bloem/bijenkorf is in de gekozen richting staat, voer je het eerste actie blok uit. Is dat niet het geval, voer dan het tweede blok met acties uit."},
"insufficientHoney":function(d){return "Je gebruikt wel de juiste blokken, maar je moet ook de juiste hoeveelheid honing maken."},
"insufficientNectar":function(d){return "Je gebruikt wel de juiste blokken, maar je moet ook de juiste hoeveelheid nectar verzamelen."},
"make":function(d){return "maken"},
"moveBackward":function(d){return "ga achteruit"},
"moveEastTooltip":function(d){return "Ga een plek naar het oosten."},
"moveForward":function(d){return "beweeg vooruit"},
"moveForwardTooltip":function(d){return "Ga een plek naar voren."},
"moveNorthTooltip":function(d){return "Ga een plek naar het noorden."},
"moveSouthTooltip":function(d){return "Ga een plek naar het zuiden."},
"moveTooltip":function(d){return "Ga een plek vooruit/achteruit"},
"moveWestTooltip":function(d){return "Ga een plek naar het westen."},
"nectar":function(d){return "haal nectar"},
"nectarRemaining":function(d){return "nectar"},
"nectarTooltip":function(d){return "Pak nectar van een bloem"},
"nextLevel":function(d){return "Gefeliciteerd! Je hebt de puzzel voltooid."},
"no":function(d){return "Nee"},
"noPathAhead":function(d){return "pad is geblokkerd"},
"noPathLeft":function(d){return "geen pad naar links"},
"noPathRight":function(d){return "geen pad naar rechts"},
"notAtFlowerError":function(d){return "Je kan alleen nectar krijgen uit een bloem."},
"notAtHoneycombError":function(d){return "Je kan alleen honing maken bij een honingraat."},
"numBlocksNeeded":function(d){return "Deze puzzel kan worden opgelost met %1 blokken."},
"pathAhead":function(d){return "pad recht vooruit"},
"pathLeft":function(d){return "als er een pad naar links is"},
"pathRight":function(d){return "als er een pad naar rechts is"},
"pilePresent":function(d){return "er is een stapel"},
"putdownTower":function(d){return "zet een toren neer"},
"removeAndAvoidTheCow":function(d){return "verwijder 1 en ontwijk de koe"},
"removeN":function(d){return "verwijder "+maze_locale.v(d,"shovelfuls")},
"removePile":function(d){return "verwijder stapel"},
"removeStack":function(d){return "verwijder stapel van "+maze_locale.v(d,"shovelfuls")+" hopen"},
"removeSquare":function(d){return "verwijder vierkant"},
"repeatCarefullyError":function(d){return "Denk goed na over het patroon van twee zetten en één draai die in het \"herhaal\" blok gaan. Een extra draai aan het einde maakt niet uit."},
"repeatUntil":function(d){return "herhaal totdat"},
"repeatUntilBlocked":function(d){return "zolang er een pad recht vooruit is"},
"repeatUntilFinish":function(d){return "herhaal tot je klaar bent"},
"step":function(d){return "Stap"},
"totalHoney":function(d){return "totaal honing"},
"totalNectar":function(d){return "totaal nectar"},
"turnLeft":function(d){return "Draai linksom"},
"turnRight":function(d){return "Draai rechtsom"},
"turnTooltip":function(d){return "Draait me 90 graden linksom of rechtsom."},
"uncheckedCloudError":function(d){return "Zorg dat je goed kijkt welke wolken bloemen zijn of honingraten."},
"uncheckedPurpleError":function(d){return "Kijk bij alle paarse bloemen of ze nectar hebben"},
"whileMsg":function(d){return "terwijl"},
"whileTooltip":function(d){return "Herhaal de acties totdat je de finish hebt bereikt."},
"word":function(d){return "Zoek het woord"},
"yes":function(d){return "Ja"},
"youSpelled":function(d){return "Jij spelde"}};