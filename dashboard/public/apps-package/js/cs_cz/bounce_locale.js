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
"bounceBall":function(d){return "odrazit míč"},
"bounceBallTooltip":function(d){return "Odrazit míč mimo objekt."},
"continue":function(d){return "Pokračovat"},
"dirE":function(d){return "V"},
"dirN":function(d){return "S"},
"dirS":function(d){return "J"},
"dirW":function(d){return "Z"},
"doCode":function(d){return "proveď"},
"elseCode":function(d){return "jinak"},
"finalLevel":function(d){return "Dobrá práce! Vyřešil jsi poslední hádanku."},
"heightParameter":function(d){return "výška"},
"ifCode":function(d){return "Pokud"},
"ifPathAhead":function(d){return "když je cesta vpřed"},
"ifTooltip":function(d){return "Pokud je v daném směru cesta, provede určité akce."},
"ifelseTooltip":function(d){return "Pokud je v daném směru cesta, proveď první blok akcí. V opačném případě proveď druhý blok akcí."},
"incrementOpponentScore":function(d){return "přidej bod soupeři"},
"incrementOpponentScoreTooltip":function(d){return "Přičti jedna do aktuálního skóre soupeře."},
"incrementPlayerScore":function(d){return "Bod"},
"incrementPlayerScoreTooltip":function(d){return "Přidá aktuálnímu hráči jeden bod."},
"isWall":function(d){return "je to zeď"},
"isWallTooltip":function(d){return "Vrátí hodnotu pravda, pokud je zde zeď"},
"launchBall":function(d){return "vypustit nový míč"},
"launchBallTooltip":function(d){return "Vypustit míč do hry."},
"makeYourOwn":function(d){return "Vyrob si vlastní hru Odraz"},
"moveDown":function(d){return "pohyb dolů"},
"moveDownTooltip":function(d){return "Pohne pálkou dolů."},
"moveForward":function(d){return "posunout vpřed"},
"moveForwardTooltip":function(d){return "Posuň mě jedno pole vpřed."},
"moveLeft":function(d){return "pohnout vlevo"},
"moveLeftTooltip":function(d){return "Pohne pálkou vlevo."},
"moveRight":function(d){return "pohnout vpravo"},
"moveRightTooltip":function(d){return "Pohne pálkou vpravo."},
"moveUp":function(d){return "pohnout nahoru"},
"moveUpTooltip":function(d){return "Pohne pálkou nahoru."},
"nextLevel":function(d){return "Dobrá práce! Dokončil jsi tuto hádanku."},
"no":function(d){return "Ne"},
"noPathAhead":function(d){return "cesta je blokována"},
"noPathLeft":function(d){return "žádná cesta vlevo"},
"noPathRight":function(d){return "žádná cesta vpravo"},
"numBlocksNeeded":function(d){return "Tato hádanka může být vyřešena pomocí %1 bloků."},
"pathAhead":function(d){return "cesta vpřed"},
"pathLeft":function(d){return "když je cesta vlevo"},
"pathRight":function(d){return "když je cesta vpravo"},
"pilePresent":function(d){return "tady je hromádka"},
"playSoundCrunch":function(d){return "přehrát zvuk křupání"},
"playSoundGoal1":function(d){return "přehrát zvuk cíl 1"},
"playSoundGoal2":function(d){return "přehrát zvuk cíl 2"},
"playSoundHit":function(d){return "přehrát zvuk zásah"},
"playSoundLosePoint":function(d){return "přehrát zvuk ztráta bodu"},
"playSoundLosePoint2":function(d){return "přehrát zvuk ztráta bodu 2"},
"playSoundRetro":function(d){return "přehrát zvuk \"retro\""},
"playSoundRubber":function(d){return "přehrát zvuk guma"},
"playSoundSlap":function(d){return "přehrát zvuk plácnutí"},
"playSoundTooltip":function(d){return "Přehraj vybraný zvuk."},
"playSoundWinPoint":function(d){return "přehrát zvuk získaný bod"},
"playSoundWinPoint2":function(d){return "přehrát zvuk získaný bod 2"},
"playSoundWood":function(d){return "přehrát zvuk dřevo"},
"putdownTower":function(d){return "položit mohylu"},
"reinfFeedbackMsg":function(d){return "Můžeš stisknout tlačítko \"Zkusit znovu\" a vrátit se zpět ke své hře."},
"removeSquare":function(d){return "odstraň čtverec"},
"repeatUntil":function(d){return "Opakovat do"},
"repeatUntilBlocked":function(d){return "dokud je cesta vpřed"},
"repeatUntilFinish":function(d){return "opakuj do konce"},
"scoreText":function(d){return "Výsledek: "+bounce_locale.v(d,"playerScore")+": "+bounce_locale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "nastavit náhodnou scénu"},
"setBackgroundHardcourt":function(d){return "nastavit scénu 'tenisový kurt'"},
"setBackgroundRetro":function(d){return "nastavit scénu 'retro'"},
"setBackgroundTooltip":function(d){return "Nastavit obrázek pozadí"},
"setBallRandom":function(d){return "nastavit náhodný míč"},
"setBallHardcourt":function(d){return "nastavit tenisový míč"},
"setBallRetro":function(d){return "nastavit retro míč"},
"setBallTooltip":function(d){return "Nastavit podobu míče"},
"setBallSpeedRandom":function(d){return "nastavit náhodnou rychlost míče"},
"setBallSpeedVerySlow":function(d){return "nastavit velmi pomalou rychlost míče"},
"setBallSpeedSlow":function(d){return "nastavit pomalou rychlost míče"},
"setBallSpeedNormal":function(d){return "nastavit normální rychlost míče"},
"setBallSpeedFast":function(d){return "nastavit vysokou rychlost míče"},
"setBallSpeedVeryFast":function(d){return "nastavit velmi vysokou rychlost míče"},
"setBallSpeedTooltip":function(d){return "Nastaví rychlost míče"},
"setPaddleRandom":function(d){return "nastavit náhodnou pálku"},
"setPaddleHardcourt":function(d){return "nastavit tenisovou pálku"},
"setPaddleRetro":function(d){return "nastavit retro pálku"},
"setPaddleTooltip":function(d){return "Nastaví vzhled pálky"},
"setPaddleSpeedRandom":function(d){return "nastavit náhodnou rychlost odpalu"},
"setPaddleSpeedVerySlow":function(d){return "nastavit velmi pomalou rychlost odpalu"},
"setPaddleSpeedSlow":function(d){return "nastavit pomalou rychlost odpalu"},
"setPaddleSpeedNormal":function(d){return "nastavit normální rychlost odpalu"},
"setPaddleSpeedFast":function(d){return "nastavit vysokou rychlost odpalu"},
"setPaddleSpeedVeryFast":function(d){return "nastavit velmi vysokou rychlost odpalu"},
"setPaddleSpeedTooltip":function(d){return "Nastaví rychlost odpalu"},
"shareBounceTwitter":function(d){return "Podívejte se na hru Odraz, kterou jsem vyrobil. Napsal jsem ji sám s @codeorg"},
"shareGame":function(d){return "Sdílej svou hru:"},
"turnLeft":function(d){return "otočit vlevo"},
"turnRight":function(d){return "otočit vpravo"},
"turnTooltip":function(d){return "Otočí mě doleva nebo doprava o 90 stupňů."},
"whenBallInGoal":function(d){return "když je míč v brance"},
"whenBallInGoalTooltip":function(d){return "Spusť uvedené akce když míč spadne do brány."},
"whenBallMissesPaddle":function(d){return "když míč mine pálku"},
"whenBallMissesPaddleTooltip":function(d){return "Spusť uvedené akce když míč mine do pálku."},
"whenDown":function(d){return "když šipka dolů"},
"whenDownTooltip":function(d){return "Spusť uvedené akce když je stisknutá klávesa \"dolů\"."},
"whenGameStarts":function(d){return "když hra začne"},
"whenGameStartsTooltip":function(d){return "Provést akce uvedené níže, když hra začne."},
"whenLeft":function(d){return "když šipka vlevo"},
"whenLeftTooltip":function(d){return "Spusť uvedené akce když je stisknutá klávesa \"vlevo\"."},
"whenPaddleCollided":function(d){return "když míč zasáhne pálku"},
"whenPaddleCollidedTooltip":function(d){return "Spusť uvedené akce když se míč dotkne pálky."},
"whenRight":function(d){return "když šipka vpravo"},
"whenRightTooltip":function(d){return "Spusť uvedené akce když je stisknutá klávesa \"vpravo\"."},
"whenUp":function(d){return "když šipka nahoru"},
"whenUpTooltip":function(d){return "Spusť uvedené akce když je stisknutá klávesa \"nahoru\"."},
"whenWallCollided":function(d){return "když míč zasáhne zeď"},
"whenWallCollidedTooltip":function(d){return "Spusť uvedené akce když se míč dotkne zdi."},
"whileMsg":function(d){return "dokud"},
"whileTooltip":function(d){return "Opakuje obsažené akce dokud nedosáhne cíle."},
"yes":function(d){return "Ano"}};