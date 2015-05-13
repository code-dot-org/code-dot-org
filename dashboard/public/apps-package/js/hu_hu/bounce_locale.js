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
"bounceBall":function(d){return "pattogó labda"},
"bounceBallTooltip":function(d){return "Pattintsd vissza a labdát egy tárgyról."},
"continue":function(d){return "Tovább"},
"dirE":function(d){return "Kelet"},
"dirN":function(d){return "Észak"},
"dirS":function(d){return "Dél"},
"dirW":function(d){return "Nyugat"},
"doCode":function(d){return "csináld"},
"elseCode":function(d){return "különben"},
"finalLevel":function(d){return "Gratulálok, megoldottad az utolsó feladatot."},
"heightParameter":function(d){return "magasság"},
"ifCode":function(d){return "ha"},
"ifPathAhead":function(d){return "Ha útvonal van előttünk"},
"ifTooltip":function(d){return "Ha a megadott irányban létezik egy útvonal, akkor csinálj bizonyos intézkedéseket."},
"ifelseTooltip":function(d){return "Ha van egy út a megadott irányban, akkor csináld az első blokk műveletek. Másképp csinál a második blokk műveletek."},
"incrementOpponentScore":function(d){return "pontot szerez az ellenfél"},
"incrementOpponentScoreTooltip":function(d){return "Az ellenfél pontszámának növelése eggyel."},
"incrementPlayerScore":function(d){return "pontszám"},
"incrementPlayerScoreTooltip":function(d){return "Adjon egyet az aktuális játékos pontjaihoz."},
"isWall":function(d){return "Ez egy fal?"},
"isWallTooltip":function(d){return "Igaz értéket ad, ha itt van fal"},
"launchBall":function(d){return "Indíts új labdát"},
"launchBallTooltip":function(d){return "Hozd játékba a labdát."},
"makeYourOwn":function(d){return "Készíts saját visszapattanós játékot"},
"moveDown":function(d){return "lejjebb"},
"moveDownTooltip":function(d){return "Vidd lejjebb az ütőt."},
"moveForward":function(d){return "előrelépni"},
"moveForwardTooltip":function(d){return "Vigyél előre egy helyet."},
"moveLeft":function(d){return "balra"},
"moveLeftTooltip":function(d){return "Vidd balra az ütőt."},
"moveRight":function(d){return "jobbra"},
"moveRightTooltip":function(d){return "Vidd jobbra az ütőt."},
"moveUp":function(d){return "feljebb"},
"moveUpTooltip":function(d){return "Vidd feljebb az ütőt."},
"nextLevel":function(d){return "Gratulálok! Ezt a feladatot megoldottad."},
"no":function(d){return "Nem"},
"noPathAhead":function(d){return "az útvonal el van zárva"},
"noPathLeft":function(d){return "nincs út balra"},
"noPathRight":function(d){return "nincs út jobbra "},
"numBlocksNeeded":function(d){return "Ez a feladat a(z) %1 blokkal megoldható."},
"pathAhead":function(d){return "Út előre"},
"pathLeft":function(d){return "Ha van balra út"},
"pathRight":function(d){return "Ha van jobbra út"},
"pilePresent":function(d){return "van egy halom"},
"playSoundCrunch":function(d){return "recsegő hang lejátszása"},
"playSoundGoal1":function(d){return "1. cél hang lejátszása"},
"playSoundGoal2":function(d){return "2. cél hang lejátszása"},
"playSoundHit":function(d){return "ütődés hang lejátszása"},
"playSoundLosePoint":function(d){return "pont elvesztése hang lejátszása"},
"playSoundLosePoint2":function(d){return "pont elvesztése hang 2 lejátszása"},
"playSoundRetro":function(d){return "retro hang lejátszása"},
"playSoundRubber":function(d){return "gumi hang lejátszása"},
"playSoundSlap":function(d){return "pofon hang lejátszása"},
"playSoundTooltip":function(d){return "Kiválasztott hang lejátszása."},
"playSoundWinPoint":function(d){return "pontnyerés hang lejátszása"},
"playSoundWinPoint2":function(d){return "pontnyerés hang 2 lejátszása"},
"playSoundWood":function(d){return "fa hang lejátszása"},
"putdownTower":function(d){return "Tegyen le tornyot"},
"reinfFeedbackMsg":function(d){return "Nyomja meg a \"Játszd újra\" gombot hogy visszatérj a saját játékodhoz."},
"removeSquare":function(d){return "távolítsa el a négyzetet"},
"repeatUntil":function(d){return "ismételd amíg nem"},
"repeatUntilBlocked":function(d){return "amíg van út előre"},
"repeatUntilFinish":function(d){return "befejezésig ismételd"},
"scoreText":function(d){return "Pontszám: "+bounce_locale.v(d,"playerScore")+": "+bounce_locale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "Véletlenszerű háttér beállítása"},
"setBackgroundHardcourt":function(d){return "Salakos háttér beállítása"},
"setBackgroundRetro":function(d){return "Retró háttér beállítása"},
"setBackgroundTooltip":function(d){return "Adja meg a háttér képet"},
"setBallRandom":function(d){return "Véletlenszerű labda beállítása"},
"setBallHardcourt":function(d){return "labda típusa: keménypályás"},
"setBallRetro":function(d){return "Retro labda beállítása"},
"setBallTooltip":function(d){return "Labda képének beállítása"},
"setBallSpeedRandom":function(d){return "Változó labdasebesség beállítása"},
"setBallSpeedVerySlow":function(d){return "Labda sebesség beállítása: Nagyon lassú"},
"setBallSpeedSlow":function(d){return "Labda sebesség beállítása: Lassú"},
"setBallSpeedNormal":function(d){return "Labda sebesség beállítása: Normál"},
"setBallSpeedFast":function(d){return "Labda sebesség beállítása: Gyors"},
"setBallSpeedVeryFast":function(d){return "Labda sebesség beállítása: Nagyon gyors"},
"setBallSpeedTooltip":function(d){return "Beállítja a labda sebességét."},
"setPaddleRandom":function(d){return "ütő típusa: random"},
"setPaddleHardcourt":function(d){return "ütő típusa: keménypályás"},
"setPaddleRetro":function(d){return "ütő típusa: retro"},
"setPaddleTooltip":function(d){return "Az ütő típusát állítja be"},
"setPaddleSpeedRandom":function(d){return "Az ütő sebessége: véletlenszerű"},
"setPaddleSpeedVerySlow":function(d){return "Ütő sebessége: nagyon lassú"},
"setPaddleSpeedSlow":function(d){return "Ütő sebessége: lassú"},
"setPaddleSpeedNormal":function(d){return "Ütő sebessége: normál"},
"setPaddleSpeedFast":function(d){return "Ütő sebessége: gyors"},
"setPaddleSpeedVeryFast":function(d){return "Ütő sebessége: nagyon gyors"},
"setPaddleSpeedTooltip":function(d){return "Az ütő sebességét állítja be"},
"shareBounceTwitter":function(d){return "Próbáld ki, milyen visszapattanós játékot készítettem. Magam programoztam a code.org weboldalon"},
"shareGame":function(d){return "Oszd meg a játékod:"},
"turnLeft":function(d){return "fordulj balra"},
"turnRight":function(d){return "fordulj jobbra"},
"turnTooltip":function(d){return "Balra vagy jobbra fordít 90 fokkal."},
"whenBallInGoal":function(d){return "Ha a labda célba ér"},
"whenBallInGoalTooltip":function(d){return "Végrehajtja az alábbi parancsokat, ha a labda a célba ér."},
"whenBallMissesPaddle":function(d){return "ha a labda nem találja el az ütőt"},
"whenBallMissesPaddleTooltip":function(d){return "Végrehajtja az alábbi parancsokat, ha a labda nem találja el az ütőt."},
"whenDown":function(d){return "Lefele nyílnál"},
"whenDownTooltip":function(d){return "Végrehajtja az alábbi parancsokat, ha a lefelé nyilat megnyomják."},
"whenGameStarts":function(d){return "amikor a játék elindul"},
"whenGameStartsTooltip":function(d){return "Végrehajtja a lenti utasításokat, ha a játék elindul."},
"whenLeft":function(d){return "balra nyíl esetén"},
"whenLeftTooltip":function(d){return "Végrehajtja az alábbi parancsokat, ha a balra nyilat megnyomják."},
"whenPaddleCollided":function(d){return "ha a labda eltalálja az ütőt"},
"whenPaddleCollidedTooltip":function(d){return "Végrehajtja az alábbi parancsokat, ha a labda és az ütő összeütközik."},
"whenRight":function(d){return "jobbra nyíl esetén"},
"whenRightTooltip":function(d){return "Végrehajtja az alábbi parancsokat, ha a jobbra nyilat megnyomják."},
"whenUp":function(d){return "felfelé nyílnál"},
"whenUpTooltip":function(d){return "Végrehajtja az alábbi parancsokat, ha a felfelé nyilat megnyomják."},
"whenWallCollided":function(d){return "ha a labda eltalálja a falat"},
"whenWallCollidedTooltip":function(d){return "Végrehajtja az alábbi parancsokat, ha a labda nekimegy a falnak."},
"whileMsg":function(d){return "amíg"},
"whileTooltip":function(d){return "Ismételjük a közbülső műveleteket amíg végponthoz nem ér."},
"yes":function(d){return "Igen"}};