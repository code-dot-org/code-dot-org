var bounce_locale = {lc:{"ar":function(n){
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
v:function(d,k){bounce_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){bounce_locale.c(d,k);return d[k] in p?p[d[k]]:(k=bounce_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){bounce_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).bounce_locale = {
"bounceBall":function(d){return "studsa bollen"},
"bounceBallTooltip":function(d){return "Studsa en boll på ett objekt."},
"continue":function(d){return "Fortsätt"},
"dirE":function(d){return "Ö"},
"dirN":function(d){return "N"},
"dirS":function(d){return "S"},
"dirW":function(d){return "V"},
"doCode":function(d){return "utför"},
"elseCode":function(d){return "annars"},
"finalLevel":function(d){return "Grattis! Du har löst det sista pusslet."},
"heightParameter":function(d){return "höjd"},
"ifCode":function(d){return "om"},
"ifPathAhead":function(d){return "om väg finns framåt"},
"ifTooltip":function(d){return "Om det finns en väg i den angivna riktningen, gör några handlingar."},
"ifelseTooltip":function(d){return "Om det finns en väg i den angivna riktningen, gör i så fall det första blocket av handlingar. Annars, gör den andra blocket av handlingar."},
"incrementOpponentScore":function(d){return "motståndarens poäng"},
"incrementOpponentScoreTooltip":function(d){return "Lägg till en till den nuvarande motståndare poängen."},
"incrementPlayerScore":function(d){return "poäng punkt"},
"incrementPlayerScoreTooltip":function(d){return "Lägg till ett till den nuvarande spelarens poängsumma."},
"isWall":function(d){return "är detta en vägg"},
"isWallTooltip":function(d){return "Returnerar sant om det finns en vägg här"},
"launchBall":function(d){return "ny boll"},
"launchBallTooltip":function(d){return "Sätt en ny boll i spel."},
"makeYourOwn":function(d){return "Gör ditt eget Studs-spel"},
"moveDown":function(d){return "flytta neråt"},
"moveDownTooltip":function(d){return "Flytta paddeln nedåt."},
"moveForward":function(d){return "gå framåt"},
"moveForwardTooltip":function(d){return "Flytta mig framåt en ruta."},
"moveLeft":function(d){return "flytta vänster"},
"moveLeftTooltip":function(d){return "Flytta paddeln till vänster."},
"moveRight":function(d){return "flytta höger"},
"moveRightTooltip":function(d){return "Flytta paddeln till höger."},
"moveUp":function(d){return "flytta uppåt"},
"moveUpTooltip":function(d){return "Flytta UPP paddeln."},
"nextLevel":function(d){return "Grattis! Du har slutfört detta pusslet."},
"no":function(d){return "Nej"},
"noPathAhead":function(d){return "vägen är blockerad"},
"noPathLeft":function(d){return "ingen väg till vänster"},
"noPathRight":function(d){return "ingen väg till höger"},
"numBlocksNeeded":function(d){return "Detta pusslet kan lösas med %1 block."},
"pathAhead":function(d){return "väg framåt"},
"pathLeft":function(d){return "Om väg finns till vänster"},
"pathRight":function(d){return "Om vägen finns till höger"},
"pilePresent":function(d){return "Det finns en hög"},
"playSoundCrunch":function(d){return "spela krossa ljud"},
"playSoundGoal1":function(d){return "spela mål 1 ljud"},
"playSoundGoal2":function(d){return "spela mål 2 ljud"},
"playSoundHit":function(d){return "spela träffljud"},
"playSoundLosePoint":function(d){return "spela förlora poäng ljud"},
"playSoundLosePoint2":function(d){return "spela förlora poäng 2 ljud"},
"playSoundRetro":function(d){return "spela retro-ljud"},
"playSoundRubber":function(d){return "spela gummi-ljud"},
"playSoundSlap":function(d){return "spela klappljud"},
"playSoundTooltip":function(d){return "Spela upp det valda ljudet."},
"playSoundWinPoint":function(d){return "spela ljudet för vinn-punkten"},
"playSoundWinPoint2":function(d){return "spela ljudet för vinn-punkt 2"},
"playSoundWood":function(d){return "spela träljud"},
"putdownTower":function(d){return "lägg ner tornet"},
"reinfFeedbackMsg":function(d){return "Du kan klicka på \"Försök igen\" för att gå tillbaka till att spela ditt spel."},
"removeSquare":function(d){return "ta bort ruta"},
"repeatUntil":function(d){return "upprepa tills"},
"repeatUntilBlocked":function(d){return "medan väg finns framåt"},
"repeatUntilFinish":function(d){return "Upprepa tills målet nåtts"},
"scoreText":function(d){return "Poäng: "+bounce_locale.v(d,"playerScore")+": "+bounce_locale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "ställ in tillfällig bakgrund"},
"setBackgroundHardcourt":function(d){return "Ange hardcourt scen"},
"setBackgroundRetro":function(d){return "Ange retro scen"},
"setBackgroundTooltip":function(d){return "Ange bakgrundsbild"},
"setBallRandom":function(d){return "Ange slumpmässig boll"},
"setBallHardcourt":function(d){return "Ange hardcourt boll"},
"setBallRetro":function(d){return "Ange retro boll"},
"setBallTooltip":function(d){return "Anger bollens bild"},
"setBallSpeedRandom":function(d){return "Ange slumpmässig hastighet på bollen"},
"setBallSpeedVerySlow":function(d){return "Ange väldigt långsam hastighet på bollen"},
"setBallSpeedSlow":function(d){return "Ange långsam hastighet på bollen"},
"setBallSpeedNormal":function(d){return "Ange normal hastighet på bollen"},
"setBallSpeedFast":function(d){return "Ange snabb hastighet på bollen"},
"setBallSpeedVeryFast":function(d){return "Ange väldigt snabb hastighet på bollen"},
"setBallSpeedTooltip":function(d){return "Anger hastigheten på bollen"},
"setPaddleRandom":function(d){return "Ange slumpmässig paddel"},
"setPaddleHardcourt":function(d){return "Ange hardcourt paddel"},
"setPaddleRetro":function(d){return "Ange retro paddel"},
"setPaddleTooltip":function(d){return "Anger bilden på paddeln"},
"setPaddleSpeedRandom":function(d){return "ange slumpmässig hastighet på paddeln"},
"setPaddleSpeedVerySlow":function(d){return "ange väldigt långsam hastighet på paddeln"},
"setPaddleSpeedSlow":function(d){return "ange långsam hastighet på paddeln"},
"setPaddleSpeedNormal":function(d){return "ange normal hastighet på paddeln"},
"setPaddleSpeedFast":function(d){return "ange snabb hastighet på paddeln"},
"setPaddleSpeedVeryFast":function(d){return "ange väldigt snabb hastighet på paddeln"},
"setPaddleSpeedTooltip":function(d){return "Anger hastigheten på paddeln"},
"shareBounceTwitter":function(d){return "Kolla in Bounce-spelet jag gjort. Jag skrev det själv med @codeorg"},
"shareGame":function(d){return "Dela ditt spel:"},
"turnLeft":function(d){return "sväng vänster"},
"turnRight":function(d){return "sväng höger"},
"turnTooltip":function(d){return "Vänder mig åt vänster eller höger 90 grader."},
"whenBallInGoal":function(d){return "när bollen är i mål"},
"whenBallInGoalTooltip":function(d){return "Utföra åtgärderna nedan när en boll går in i målet."},
"whenBallMissesPaddle":function(d){return "När bollen missar paddel"},
"whenBallMissesPaddleTooltip":function(d){return "Utföra åtgärderna nedan när en boll missar paddeln."},
"whenDown":function(d){return "när pil nedåt"},
"whenDownTooltip":function(d){return "Utföra åtgärderna nedan när NEDPIL trycks."},
"whenGameStarts":function(d){return "när spelet börjar"},
"whenGameStartsTooltip":function(d){return "Utför kommandona nedan när spelet startar."},
"whenLeft":function(d){return "när pil vänster"},
"whenLeftTooltip":function(d){return "Utföra åtgärderna nedan när du trycker på VÄNSTERPIL."},
"whenPaddleCollided":function(d){return "När bollen träffar paddel"},
"whenPaddleCollidedTooltip":function(d){return "Utför åtgärderna nedan när en boll krockar med en vägg."},
"whenRight":function(d){return "när pil höger"},
"whenRightTooltip":function(d){return "Utföra åtgärderna nedan när du trycker på HÖGERPIL."},
"whenUp":function(d){return "när pil upp"},
"whenUpTooltip":function(d){return "Utför handlingarna nedan när pil-upptangenten trycks ner."},
"whenWallCollided":function(d){return "När bollen träffar väggen"},
"whenWallCollidedTooltip":function(d){return "Utför åtgärderna nedan när en boll krockar med en vägg."},
"whileMsg":function(d){return "medan"},
"whileTooltip":function(d){return "Upprepa de omslutna åtgärderna tills målet nåtts."},
"yes":function(d){return "Ja"}};