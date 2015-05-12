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
},"da":function(n){return n===1?"one":"other"},"de":function(n){return n===1?"one":"other"},"el":function(n){return n===1?"one":"other"},"es":function(n){return n===1?"one":"other"},"et":function(n){return n===1?"one":"other"},"eu":function(n){return n===1?"one":"other"},"fa":function(n){return "other"},"fi":function(n){return n===1?"one":"other"},"fil":function(n){return n===0||n==1?"one":"other"},"fr":function(n){return Math.floor(n)===0||Math.floor(n)==1?"one":"other"},"gl":function(n){return n===1?"one":"other"},"he":function(n){return n===1?"one":"other"},"hi":function(n){return n===0||n==1?"one":"other"},"hr":function(n){
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
},"mk":function(n){return (n%10)==1&&n!=11?"one":"other"},"ms":function(n){return "other"},"mt":function(n){
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
"bounceBall":function(d){return "bumbas atlēciens"},
"bounceBallTooltip":function(d){return "Met bumbu pa kādu objektu tā, lai tā atlec."},
"continue":function(d){return "Turpināt"},
"dirE":function(d){return "A"},
"dirN":function(d){return "Z"},
"dirS":function(d){return "D"},
"dirW":function(d){return "R"},
"doCode":function(d){return "darīt"},
"elseCode":function(d){return "cits"},
"finalLevel":function(d){return "Apsveicu! Jūs esat atrisinājis pēdējo puzli."},
"heightParameter":function(d){return "augstums"},
"ifCode":function(d){return "Ja"},
"ifPathAhead":function(d){return "Ja ceļs priekšā"},
"ifTooltip":function(d){return "Ja ir ceļš noteiktā virzienā, tad darīt dažas darbības."},
"ifelseTooltip":function(d){return "Ja ir ceļš noteiktājā virzienā, tad darīt pirmā bloka darbības. Citādi, darīt otra bloka darbības."},
"incrementOpponentScore":function(d){return "Pretinieka rezultāts"},
"incrementOpponentScoreTooltip":function(d){return "Palielināt esošo pretinieka rezultātu par vienu."},
"incrementPlayerScore":function(d){return "Gūt punktu"},
"incrementPlayerScoreTooltip":function(d){return "Palielināt pašreizējā spēlētāja rezultātu par vienu."},
"isWall":function(d){return "vai šī ir siena"},
"isWallTooltip":function(d){return "Atgriež vērtību \"patiess\", ja šeit ir siena"},
"launchBall":function(d){return "palaist jaunu bumbu"},
"launchBallTooltip":function(d){return "Palaist bumbu spēlē."},
"makeYourOwn":function(d){return "Izveidot savu \"Bumbas spēli\""},
"moveDown":function(d){return "pārvietot uz leju"},
"moveDownTooltip":function(d){return "Pārvietot airi uz leju."},
"moveForward":function(d){return "pārvietot uz priekšu"},
"moveForwardTooltip":function(d){return "Pārvietot mani vienu lauciņu uz priekšu."},
"moveLeft":function(d){return "pārvietot pa kreisi"},
"moveLeftTooltip":function(d){return "Pārvietot dēlīti pa kreisi."},
"moveRight":function(d){return "Pārvietot pa labi"},
"moveRightTooltip":function(d){return "Pārvietot dēlīti pa labi."},
"moveUp":function(d){return "Pārvietot augšup"},
"moveUpTooltip":function(d){return "Pārvietot dēlīti uz augšu."},
"nextLevel":function(d){return "Apsveicu! Jūs pabeidzāt šo puzli."},
"no":function(d){return "Nē"},
"noPathAhead":function(d){return "ceļs ir bloķēts"},
"noPathLeft":function(d){return "nav ceļa pa kreisi"},
"noPathRight":function(d){return "nav ceļa pa labi"},
"numBlocksNeeded":function(d){return "Šo puzli var atrisināt ar %1 blokiem."},
"pathAhead":function(d){return "ceļs ir priekšā"},
"pathLeft":function(d){return "ja ir ceļš pa kreisi"},
"pathRight":function(d){return "ja ir ceļš pa labi"},
"pilePresent":function(d){return "ir kaudze"},
"playSoundCrunch":function(d){return "atskaņot krakšķa skaņu"},
"playSoundGoal1":function(d){return "atskaņot pirmo rezultāta skaņu"},
"playSoundGoal2":function(d){return "atskaņot otro rezultāta skaņu"},
"playSoundHit":function(d){return "atskaņot sitiena skaņu"},
"playSoundLosePoint":function(d){return "atskaņot punkta zaudēšanas skaņu"},
"playSoundLosePoint2":function(d){return "atskaņot punkta zaudēšanas otro skaņu"},
"playSoundRetro":function(d){return "atskaņot retro skaņu"},
"playSoundRubber":function(d){return "atskaņot gumijas skaņu"},
"playSoundSlap":function(d){return "atskaņot pliķa skaņu"},
"playSoundTooltip":function(d){return "Atskaņot izvēlēto skaņu."},
"playSoundWinPoint":function(d){return "atskaņot punkta iegūšanas skaņu"},
"playSoundWinPoint2":function(d){return "atskaņot punkta iegūšanas otro skaņu"},
"playSoundWood":function(d){return "atskaņot koka skaņu"},
"putdownTower":function(d){return "nolikt torni"},
"reinfFeedbackMsg":function(d){return "Tu vari nospiest \"Mēģināt vēlreiz\" pogu, lai atgrieztos atpakaļ pie spēles spēlēšanas."},
"removeSquare":function(d){return "noņemt kvadrātu"},
"repeatUntil":function(d){return "atkārtot līdz"},
"repeatUntilBlocked":function(d){return "kamēr ceļš priekšā"},
"repeatUntilFinish":function(d){return "atkārtot līdz finišam"},
"scoreText":function(d){return "Rezultāts: "+bounce_locale.v(d,"playerScore")+": "+bounce_locale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "uzstādīt nejaušu ainu"},
"setBackgroundHardcourt":function(d){return "iestatīt korta ainu"},
"setBackgroundRetro":function(d){return "iestatīt retro ainu"},
"setBackgroundTooltip":function(d){return "Iestata fona attēlu"},
"setBallRandom":function(d){return "iestatīt nejaušu bumbu"},
"setBallHardcourt":function(d){return "iestatīt korta bumbu"},
"setBallRetro":function(d){return "iestatīt retro bumbu"},
"setBallTooltip":function(d){return "Iestata bumbas attēlu"},
"setBallSpeedRandom":function(d){return "iestatīt nejaušu bumbas ātrumu"},
"setBallSpeedVerySlow":function(d){return "iestatīt ļoti lēnu bumbas ātrumu"},
"setBallSpeedSlow":function(d){return "iestatīt lēnu bumbas ātrumu"},
"setBallSpeedNormal":function(d){return "iestatīt vidēju bumbas ātrumu"},
"setBallSpeedFast":function(d){return "iestatīt ātru bumbas ātrumu"},
"setBallSpeedVeryFast":function(d){return "iestatīt ļoti ātru bumbas ātrumu"},
"setBallSpeedTooltip":function(d){return "Iestata bumbas ātrumu"},
"setPaddleRandom":function(d){return "iestatīt nejaušu dēlīti"},
"setPaddleHardcourt":function(d){return "iestatīt korta airi"},
"setPaddleRetro":function(d){return "iestatīt retro airi"},
"setPaddleTooltip":function(d){return "Iestata aira attēlu"},
"setPaddleSpeedRandom":function(d){return "iestatīt nejaušu aira ātrumu"},
"setPaddleSpeedVerySlow":function(d){return "iestatīt ļoti lēnu aira ātrumu"},
"setPaddleSpeedSlow":function(d){return "iestatīt lēnu aira ātrumu"},
"setPaddleSpeedNormal":function(d){return "iestatīt normālu aira ātrumu"},
"setPaddleSpeedFast":function(d){return "iestatīt ātru aira ātrumu"},
"setPaddleSpeedVeryFast":function(d){return "iestatīt ļoti ātru aira ātrumu"},
"setPaddleSpeedTooltip":function(d){return "Iestata aira ātrumu"},
"shareBounceTwitter":function(d){return "Apskaties \"Bumbas spēli\", kuru es izveidoju. Es pats to izveidoju kopā ar @codeorg"},
"shareGame":function(d){return "Iesaki savu speli:"},
"turnLeft":function(d){return "pagriezt pa kreisi"},
"turnRight":function(d){return "pagriezt pa labi"},
"turnTooltip":function(d){return "pagriezt pa kreisi vai pa labi par 90 grādiem."},
"whenBallInGoal":function(d){return "kad bumba trāpa mērķi"},
"whenBallInGoalTooltip":function(d){return "Veikt zemāk esošās darbības, kad bumba trāpa mērķi."},
"whenBallMissesPaddle":function(d){return "kad bumba netrāpa pa dēlīti"},
"whenBallMissesPaddleTooltip":function(d){return "Veikt zemāk esošās darbības, kad bumba netrāpa pa dēlīti."},
"whenDown":function(d){return "kad bultiņa uz leju"},
"whenDownTooltip":function(d){return "Veikt zemāk esošās darbības, kad nospiež bultiņu uz leju."},
"whenGameStarts":function(d){return "kad spēle sākas"},
"whenGameStartsTooltip":function(d){return "Izpildīt sekojošas darbības, kad spēle sākas."},
"whenLeft":function(d){return "kad kreisā bultiņa"},
"whenLeftTooltip":function(d){return "Veikt zemāk esošās darbības, kad nospiež kreiso bultiņu."},
"whenPaddleCollided":function(d){return "kad bumba atsitas pret dēlīti"},
"whenPaddleCollidedTooltip":function(d){return "Veikt zemāk esošās darbības, kad bumba atsitas pret dēlīti."},
"whenRight":function(d){return "kad labā bultiņa"},
"whenRightTooltip":function(d){return "Veikt zemāk esošās darbības, kad nospiež labo bultiņu."},
"whenUp":function(d){return "kad bultiņa uz augšu"},
"whenUpTooltip":function(d){return "Veikt zemāk esošās darbības, kad nospiež bultiņu uz augšu."},
"whenWallCollided":function(d){return "kad bumbiņa atsitas pret sienu"},
"whenWallCollidedTooltip":function(d){return "Veikt zemāk esošās darbības, kad bumba saskaras ar sienu."},
"whileMsg":function(d){return "kamēr"},
"whileTooltip":function(d){return "Atārtot slegtās darbības kamēr finiša punkts ir sasniegts."},
"yes":function(d){return "Jā"}};