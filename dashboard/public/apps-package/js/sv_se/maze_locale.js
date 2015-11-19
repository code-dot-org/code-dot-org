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
"atHoneycomb":function(d){return "vid honungskakan"},
"atFlower":function(d){return "vid blomman"},
"avoidCowAndRemove":function(d){return "undvik kon och ta bort 1"},
"continue":function(d){return "Fortsätt"},
"dig":function(d){return "ta bort 1"},
"digTooltip":function(d){return "ta bort 1 enhet jord"},
"dirE":function(d){return "Ö"},
"dirN":function(d){return "N"},
"dirS":function(d){return "S"},
"dirW":function(d){return "V"},
"doCode":function(d){return "utför"},
"elseCode":function(d){return "annars"},
"fill":function(d){return "Fyll 1"},
"fillN":function(d){return "fyll "+maze_locale.v(d,"shovelfuls")},
"fillStack":function(d){return "fyll stapel med "+maze_locale.v(d,"shovelfuls")+" högar"},
"fillSquare":function(d){return "fyll kvadrat"},
"fillTooltip":function(d){return "Placera 1 lera"},
"finalLevel":function(d){return "Grattis! Du har löst det sista pusslet."},
"flowerEmptyError":function(d){return "Blomman du är på har ingen mer nektar."},
"get":function(d){return "hämta"},
"heightParameter":function(d){return "höjd"},
"holePresent":function(d){return "Det finns ett hål"},
"honey":function(d){return "gör honung"},
"honeyAvailable":function(d){return "honung"},
"honeyTooltip":function(d){return "Gör honung av nektar"},
"honeycombFullError":function(d){return "Den här  honungskakan har inte plats för mer honung."},
"ifCode":function(d){return "om"},
"ifInRepeatError":function(d){return "Du behöver ett \"Om\"-block inuti ett \"Upprepa\"-block. Om du har svårt med det här, gör förra nivån igen för att se hur det funkade."},
"ifPathAhead":function(d){return "om väg finns framåt"},
"ifTooltip":function(d){return "Om det finns en sökväg i den angivna riktningen, utför ett antal åtgärder."},
"ifelseTooltip":function(d){return "Om det finns en väg i den angivna riktningen, gör i så fall det första blocket av handlingar. Annars, gör den andra blocket av handlingar."},
"ifFlowerTooltip":function(d){return "Om det finns en blomma/honungskaka i angiven riktning, utför vissa åtgärder."},
"ifOnlyFlowerTooltip":function(d){return "Om det finns en blomma åt det angivna hållet så gör vissa saker."},
"ifelseFlowerTooltip":function(d){return "Om det finns en blomma/honungskaka i angiven riktning, utför då det första blocket av åtgärder. Annars, utför det andra blocket av åtgärder."},
"insufficientHoney":function(d){return "Du använder alla de rätta blocken, men du måste göra rätt mängd honung."},
"insufficientNectar":function(d){return "Du använder alla de rätta blocken, men du behöver samla in rätt mängd av nektar."},
"make":function(d){return "gör"},
"moveBackward":function(d){return "flytta bakåt"},
"moveEastTooltip":function(d){return "Flytta mig öst ett steg."},
"moveForward":function(d){return "gå framåt"},
"moveForwardTooltip":function(d){return "Flytta mig framåt en ruta."},
"moveNorthTooltip":function(d){return "Flytta mig norrut ett steg."},
"moveSouthTooltip":function(d){return "Flytta mig söderut ett steg."},
"moveTooltip":function(d){return "Flytta mig framåt/bakåt ett steg"},
"moveWestTooltip":function(d){return "Flytta mig väst ett steg."},
"nectar":function(d){return "få nektar"},
"nectarRemaining":function(d){return "nektar"},
"nectarTooltip":function(d){return "Få nektar från en blomma"},
"nextLevel":function(d){return "Grattis! Du har slutfört detta pusslet."},
"no":function(d){return "Nej"},
"noPathAhead":function(d){return "stigen är blockerad"},
"noPathLeft":function(d){return "ingen stig till vänster"},
"noPathRight":function(d){return "ingen stig åt höger"},
"notAtFlowerError":function(d){return "Du kan bara få nektar från en blomma."},
"notAtHoneycombError":function(d){return "Du kan bara göra honung vid en honungskaka."},
"numBlocksNeeded":function(d){return "Detta pusslet kan lösas med %1 block."},
"pathAhead":function(d){return "väg framåt"},
"pathLeft":function(d){return "Om väg finns till vänster"},
"pathRight":function(d){return "Om vägen finns till höger"},
"pilePresent":function(d){return "Det finns en hög"},
"putdownTower":function(d){return "lägg ner tornet"},
"removeAndAvoidTheCow":function(d){return "ta bort 1 och undvik kon"},
"removeN":function(d){return "ta bort "+maze_locale.v(d,"shovelfuls")},
"removePile":function(d){return "ta bort hög"},
"removeStack":function(d){return "ta bort stapel med "+maze_locale.v(d,"shovelfuls")+" högar"},
"removeSquare":function(d){return "ta bort ruta"},
"repeatCarefullyError":function(d){return "För att lösa detta, tänka noga på mönstret av två flytt och en sväng  i \"upprepa\"blocket.  Det är okej att ha en extra sväng i slutet."},
"repeatUntil":function(d){return "upprepa tills"},
"repeatUntilBlocked":function(d){return "medan väg finns framåt"},
"repeatUntilFinish":function(d){return "Upprepa tills målet nåtts"},
"step":function(d){return "steg"},
"totalHoney":function(d){return "total honungsmängd"},
"totalNectar":function(d){return "total mängd nektar"},
"turnLeft":function(d){return "sväng vänster"},
"turnRight":function(d){return "sväng höger"},
"turnTooltip":function(d){return "Vänder mig åt vänster eller höger 90 grader."},
"uncheckedCloudError":function(d){return "Se till att kolla alla moln för att se om de är blommor eller honungskakor."},
"uncheckedPurpleError":function(d){return "Se till att kolla alla lila blommor för att se om de har nektar"},
"whileMsg":function(d){return "medan"},
"whileTooltip":function(d){return "Upprepa de omslutna åtgärderna tills målet nåtts."},
"word":function(d){return "Hitta ordet"},
"yes":function(d){return "Ja"},
"youSpelled":function(d){return "Du stavade"}};