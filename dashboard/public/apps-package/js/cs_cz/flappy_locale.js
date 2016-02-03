var flappy_locale = {lc:{"ar":function(n){
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
v:function(d,k){flappy_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){flappy_locale.c(d,k);return d[k] in p?p[d[k]]:(k=flappy_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){flappy_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).flappy_locale = {
"continue":function(d){return "Pokračovat"},
"doCode":function(d){return "dělej"},
"elseCode":function(d){return "jinak"},
"endGame":function(d){return "konec hry"},
"endGameTooltip":function(d){return "Ukončí hru."},
"finalLevel":function(d){return "Gratulujeme! Vyřešil jsi poslední puzzle."},
"flap":function(d){return "mávni"},
"flapRandom":function(d){return "mávni náhodně silně"},
"flapVerySmall":function(d){return "mávni velmi slabě"},
"flapSmall":function(d){return "mávni slabě"},
"flapNormal":function(d){return "mávni normálně"},
"flapLarge":function(d){return "mávni silně"},
"flapVeryLarge":function(d){return "mávni velmi silně"},
"flapTooltip":function(d){return "Vyletí s Flappym vzhůru."},
"flappySpecificFail":function(d){return "Tvůj kód vypadá dobře - zamává při každém kliknutí. Ale musíš kliknout víckrát, aby ses dostal k cíli."},
"incrementPlayerScore":function(d){return "přidej bod"},
"incrementPlayerScoreTooltip":function(d){return "Přidá aktuálnímu hráči jeden bod."},
"nextLevel":function(d){return "Dobrá práce! Dokončil jsi tuto hádanku."},
"no":function(d){return "Ne"},
"numBlocksNeeded":function(d){return "Tato hádanka může být vyřešena pomoci %1 bloků."},
"playSoundRandom":function(d){return "přehrát náhodný zvuk"},
"playSoundBounce":function(d){return "přehrát zvuk odrazu"},
"playSoundCrunch":function(d){return "přehrát zvuk křupání"},
"playSoundDie":function(d){return "přehrát smutný zvuk"},
"playSoundHit":function(d){return "přehrát zvuk rány"},
"playSoundPoint":function(d){return "přehrát zvuk bodu"},
"playSoundSwoosh":function(d){return "přehrát zvuk šustění"},
"playSoundWing":function(d){return "přehrát zvuk křídel"},
"playSoundJet":function(d){return "přehrát zvuk stíhačky"},
"playSoundCrash":function(d){return "přehrát zvuk srážky"},
"playSoundJingle":function(d){return "přehrát zvuk rolničky"},
"playSoundSplash":function(d){return "přehrát zvuk šplouchnutí"},
"playSoundLaser":function(d){return "přehrát zvuk laseru"},
"playSoundTooltip":function(d){return "Přehraj vybraný zvuk."},
"reinfFeedbackMsg":function(d){return "Můžeš stisknout tlačítko \"Zkusit znovu\" a vrátit se zpět ke své hře."},
"scoreText":function(d){return "Body: "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "nastavit scénu"},
"setBackgroundRandom":function(d){return "nastavit scénu Náhodná"},
"setBackgroundFlappy":function(d){return "nastavit scénu Město (ve dne)"},
"setBackgroundNight":function(d){return "nastavit scénu Město (v noci)"},
"setBackgroundSciFi":function(d){return "nasatvit scénu Sci-Fi"},
"setBackgroundUnderwater":function(d){return "nastavit scénu Pod vodou"},
"setBackgroundCave":function(d){return "nastavit scénu Jeskyně"},
"setBackgroundSanta":function(d){return "nastavit scénu Santa"},
"setBackgroundTooltip":function(d){return "Nastavit obrázek pozadí"},
"setGapRandom":function(d){return "nastavit náhodnou mezeru"},
"setGapVerySmall":function(d){return "nastavit velmi malou mezeru"},
"setGapSmall":function(d){return "nastavit malou mezeru"},
"setGapNormal":function(d){return "nastavit normální mezeru"},
"setGapLarge":function(d){return "nastavit velkou mezeru"},
"setGapVeryLarge":function(d){return "nastavit velmi velkou mezeru"},
"setGapHeightTooltip":function(d){return "Nastaví svislou mezeru v překážce"},
"setGravityRandom":function(d){return "nastavit gravitaci Náhodně"},
"setGravityVeryLow":function(d){return "nastavit velmi nízkou gravitaci"},
"setGravityLow":function(d){return "nastavit nízkou gravitaci"},
"setGravityNormal":function(d){return "nastavit normální gravitaci"},
"setGravityHigh":function(d){return "nastavit vysokou gravitaci"},
"setGravityVeryHigh":function(d){return "nastavit velmi vysokou gravitaci"},
"setGravityTooltip":function(d){return "Nastaví úroveň gravitace"},
"setGround":function(d){return "nastavit terén"},
"setGroundRandom":function(d){return "nastavit terén Náhodně"},
"setGroundFlappy":function(d){return "nastavit terén Země"},
"setGroundSciFi":function(d){return "nastavit terén Sci-Fi"},
"setGroundUnderwater":function(d){return "nastavit terén Pod vodou"},
"setGroundCave":function(d){return "nastavit terén Jeskyně"},
"setGroundSanta":function(d){return "nastavit terén Santa"},
"setGroundLava":function(d){return "nastavit terén Láva"},
"setGroundTooltip":function(d){return "Nastaví obrázek terénu"},
"setObstacle":function(d){return "nastavit překážku"},
"setObstacleRandom":function(d){return "nastavit překážku Náhodně"},
"setObstacleFlappy":function(d){return "nastavit překážku Potrubí"},
"setObstacleSciFi":function(d){return "nastavit překážku Sci-Fi"},
"setObstacleUnderwater":function(d){return "nastavit překážku Rostlina"},
"setObstacleCave":function(d){return "nastavit překážku Jeskyně"},
"setObstacleSanta":function(d){return "nastavit překážku Komín"},
"setObstacleLaser":function(d){return "nastavit překážku Laser"},
"setObstacleTooltip":function(d){return "Nastaví obrázek překážky"},
"setPlayer":function(d){return "nastavit hráče"},
"setPlayerRandom":function(d){return "nastavit hráče Náhodně"},
"setPlayerFlappy":function(d){return "nastavit hráče Žlutý pták"},
"setPlayerRedBird":function(d){return "nastavit hráče Červený pták"},
"setPlayerSciFi":function(d){return "nastavit hráče Kosmická loď"},
"setPlayerUnderwater":function(d){return "nastavit hráče Ryba"},
"setPlayerCave":function(d){return "nastavit hráče Netopýr"},
"setPlayerSanta":function(d){return "nastavit hráče Santa"},
"setPlayerShark":function(d){return "nastavit hráče Žralok"},
"setPlayerEaster":function(d){return "nastavit hráče Velikonoční zajíček"},
"setPlayerBatman":function(d){return "nastavit hráče Netopýří chlap"},
"setPlayerSubmarine":function(d){return "nastavit hráče Ponorka"},
"setPlayerUnicorn":function(d){return "nastavit hráče Jednorožec"},
"setPlayerFairy":function(d){return "nastavit hráče Víla"},
"setPlayerSuperman":function(d){return "nastavit hráče Flappyman"},
"setPlayerTurkey":function(d){return "nastavit hráče Krocan"},
"setPlayerTooltip":function(d){return "Nastaví obrázek hráče"},
"setScore":function(d){return "nastavit body"},
"setScoreTooltip":function(d){return "Nastaví body hráče"},
"setSpeed":function(d){return "nastavit rychlost"},
"setSpeedTooltip":function(d){return "Nastaví rychlost úrovně"},
"shareFlappyTwitter":function(d){return "Podívejte se na hru Flappy, kterou jsem vytvořil/a. Napsal/a jsem ji sám/sama s pomocí @codeorg"},
"shareGame":function(d){return "Sdílej svou hru:"},
"soundRandom":function(d){return "náhodně"},
"soundBounce":function(d){return "Odrazit"},
"soundCrunch":function(d){return "křupnutí"},
"soundDie":function(d){return "smutný"},
"soundHit":function(d){return "rána"},
"soundPoint":function(d){return "bod"},
"soundSwoosh":function(d){return "šustění"},
"soundWing":function(d){return "křídlo"},
"soundJet":function(d){return "stíhačka"},
"soundCrash":function(d){return "srážka"},
"soundJingle":function(d){return "rolnička"},
"soundSplash":function(d){return "šplouchnutí"},
"soundLaser":function(d){return "laser"},
"speedRandom":function(d){return "nastavit rychlost náhodně"},
"speedVerySlow":function(d){return "nastavit velmi pomalou rychlost"},
"speedSlow":function(d){return "nastavit pomalou rychlost"},
"speedNormal":function(d){return "nastavit normální rychlost"},
"speedFast":function(d){return "nastavit vysokou rychlost"},
"speedVeryFast":function(d){return "nastavit velmi vysokou rychlost"},
"whenClick":function(d){return "když klikneš"},
"whenClickTooltip":function(d){return "Provést akce uvedené níže, když klikneš."},
"whenCollideGround":function(d){return "když se dotkne země"},
"whenCollideGroundTooltip":function(d){return "Provést akce uvedené níže, když se Flappy dotkne země."},
"whenCollideObstacle":function(d){return "když se dotkne překážky"},
"whenCollideObstacleTooltip":function(d){return "Provést akce uvedené níže, když se Flappy dotkne překážky."},
"whenEnterObstacle":function(d){return "když mine překážku"},
"whenEnterObstacleTooltip":function(d){return "Provést akce uvedené níže, když Flappy vjede do překážky."},
"whenRunButtonClick":function(d){return "když hra začne"},
"whenRunButtonClickTooltip":function(d){return "Provést akce uvedené níže, když hra začne."},
"yes":function(d){return "Ano"}};