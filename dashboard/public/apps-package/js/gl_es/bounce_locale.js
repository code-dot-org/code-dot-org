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
"bounceBall":function(d){return "rebotar a pelota"},
"bounceBallTooltip":function(d){return "Rebotar a pelota contra un obxecto."},
"continue":function(d){return "Continuar"},
"dirE":function(d){return "E"},
"dirN":function(d){return "N"},
"dirS":function(d){return "S"},
"dirW":function(d){return "W"},
"doCode":function(d){return "do"},
"elseCode":function(d){return "else"},
"finalLevel":function(d){return "Congratulations! You have solved the final puzzle."},
"heightParameter":function(d){return "height"},
"ifCode":function(d){return "se"},
"ifPathAhead":function(d){return "if path ahead"},
"ifTooltip":function(d){return "If there is a path in the specified direction, then do some actions."},
"ifelseTooltip":function(d){return "If there is a path in the specified direction, then do the first block of actions. Otherwise, do the second block of actions."},
"incrementOpponentScore":function(d){return "anota un punto o adversario"},
"incrementOpponentScoreTooltip":function(d){return "Engade un punto a puntuación actual do adversario."},
"incrementPlayerScore":function(d){return "marcar un punto"},
"incrementPlayerScoreTooltip":function(d){return "Engade un punto a puntuación actual do xugador."},
"isWall":function(d){return "é esto unha parede"},
"isWallTooltip":function(d){return "Devolve verdadeiro se hai unha parede"},
"launchBall":function(d){return "lanzar unha nova pelota"},
"launchBallTooltip":function(d){return "Lanza unha pelota para xogar."},
"makeYourOwn":function(d){return "Crea o teu Propio Bounce Game"},
"moveDown":function(d){return "baixar"},
"moveDownTooltip":function(d){return "Move a pá cara abaixo."},
"moveForward":function(d){return "move forward"},
"moveForwardTooltip":function(d){return "Move me forward one space."},
"moveLeft":function(d){return "mover hacia a esquerda"},
"moveLeftTooltip":function(d){return "Mover a pá cara a esquerda."},
"moveRight":function(d){return "mover cara a dereita"},
"moveRightTooltip":function(d){return "Mover a pá cara a dereita."},
"moveUp":function(d){return "mover hacia arriba"},
"moveUpTooltip":function(d){return "Move a pá cara arriba."},
"nextLevel":function(d){return "Congratulations! You have completed this puzzle."},
"no":function(d){return "No"},
"noPathAhead":function(d){return "path is blocked"},
"noPathLeft":function(d){return "no path to the left"},
"noPathRight":function(d){return "no path to the right"},
"numBlocksNeeded":function(d){return "This puzzle can be solved with %1 blocks."},
"pathAhead":function(d){return "path ahead"},
"pathLeft":function(d){return "if path to the left"},
"pathRight":function(d){return "if path to the right"},
"pilePresent":function(d){return "there is a pile"},
"playSoundCrunch":function(d){return "reproduce o son de triscar"},
"playSoundGoal1":function(d){return "reproduce o son de meta 1"},
"playSoundGoal2":function(d){return "reproduce o son meta 2"},
"playSoundHit":function(d){return "reproduce un son de golpe"},
"playSoundLosePoint":function(d){return "reproduce son de punto perdido"},
"playSoundLosePoint2":function(d){return "reproduce son de punto perdido 2"},
"playSoundRetro":function(d){return "reproduce un son retro"},
"playSoundRubber":function(d){return "reproduce un son de goma"},
"playSoundSlap":function(d){return "reproduce un son de labazada"},
"playSoundTooltip":function(d){return "Reproduce o son escollido."},
"playSoundWinPoint":function(d){return "reproduce son de punto gañado"},
"playSoundWinPoint2":function(d){return "reproduce son de punto ganado 2"},
"playSoundWood":function(d){return "reproduce son de madeira"},
"putdownTower":function(d){return "put down tower"},
"reinfFeedbackMsg":function(d){return "You can press the \"Try again\" button to go back to playing your game."},
"removeSquare":function(d){return "remove square"},
"repeatUntil":function(d){return "repeat until"},
"repeatUntilBlocked":function(d){return "while path ahead"},
"repeatUntilFinish":function(d){return "repeat until finish"},
"scoreText":function(d){return "Puntuación: "+bounce_locale.v(d,"playerScore")+" : "+bounce_locale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "establece unha escea o chou"},
"setBackgroundHardcourt":function(d){return "por unha pista de tenis dura"},
"setBackgroundRetro":function(d){return "por unha escea retro"},
"setBackgroundTooltip":function(d){return "Sets the background image"},
"setBallRandom":function(d){return "por unha bola o chou"},
"setBallHardcourt":function(d){return "por unha bola para pista dura"},
"setBallRetro":function(d){return "por unha pelota retro"},
"setBallTooltip":function(d){return "Por unha imaxe da pelota"},
"setBallSpeedRandom":function(d){return "por a velocidade da pelota o chou"},
"setBallSpeedVerySlow":function(d){return "por a velocidade de pelota moi lenta"},
"setBallSpeedSlow":function(d){return "por velocidade de pelota lenta"},
"setBallSpeedNormal":function(d){return "por velocidade de pelota normal"},
"setBallSpeedFast":function(d){return "por unha velocidade rápida de pelota"},
"setBallSpeedVeryFast":function(d){return "por unha velocidade de pelota moi rápida"},
"setBallSpeedTooltip":function(d){return "Por unha velocidade da pelota"},
"setPaddleRandom":function(d){return "por unha pá o chou"},
"setPaddleHardcourt":function(d){return "por unha pá para pista de tenis dura"},
"setPaddleRetro":function(d){return "por unha pá retro"},
"setPaddleTooltip":function(d){return "Por unha imaxe da pa"},
"setPaddleSpeedRandom":function(d){return "por unha pá o chou"},
"setPaddleSpeedVerySlow":function(d){return "por unha velocidade da pá moi lenta"},
"setPaddleSpeedSlow":function(d){return "por unha velocidade de pá lenta"},
"setPaddleSpeedNormal":function(d){return "por unha velocidade de pá normal"},
"setPaddleSpeedFast":function(d){return "por unha velocidade de pá rápida"},
"setPaddleSpeedVeryFast":function(d){return "por unha velocidade de pá moi rápida"},
"setPaddleSpeedTooltip":function(d){return "Por unha velocidade da pá de xogo"},
"shareBounceTwitter":function(d){return "Bótalle un ollo o xogo Bounce que creei. Escribino eu mesmo con @codeorg"},
"shareGame":function(d){return "Share your game:"},
"turnLeft":function(d){return "turn left"},
"turnRight":function(d){return "turn right"},
"turnTooltip":function(d){return "Turns me left or right by 90 degrees."},
"whenBallInGoal":function(d){return "cando a pelota está na portería"},
"whenBallInGoalTooltip":function(d){return "Executa as seguintes instruccións cando a pelota entre na porteria."},
"whenBallMissesPaddle":function(d){return "cando a pelota bate na pá"},
"whenBallMissesPaddleTooltip":function(d){return "Fai as seguintes instruccións cando a pá non golpee a pelota."},
"whenDown":function(d){return "cando se pulse a tecla de frecha de baixar"},
"whenDownTooltip":function(d){return "Fai as instruccions que aparecen abaixo cando se preme a tecla de frecha hacia abaixo."},
"whenGameStarts":function(d){return "when game starts"},
"whenGameStartsTooltip":function(d){return "Execute the actions below when the game starts."},
"whenLeft":function(d){return "cando se prema a tecla de frecha esquerda"},
"whenLeftTooltip":function(d){return "Fai as instruccións que aparecen abaixo cando se prema a tecla de frecha esquerda."},
"whenPaddleCollided":function(d){return "cando a pá bate na pelota"},
"whenPaddleCollidedTooltip":function(d){return "Fai as accións que se mostran abaixo, cando a pá bate na pelota."},
"whenRight":function(d){return "cando se prema a frecha dereita"},
"whenRightTooltip":function(d){return "Fai as accións que se mostran abaixo, cando se preme a tecla fecha dereita."},
"whenUp":function(d){return "cando se preme a tecla fecha hacia arriba"},
"whenUpTooltip":function(d){return "Fai as accións que se mostran abaixo, cando se preme a tecla de frecha hacia arriba."},
"whenWallCollided":function(d){return "cando a pelota bate na parede"},
"whenWallCollidedTooltip":function(d){return "Fai as accions que se mostran abaixo cando a pelota bate na parede."},
"whileMsg":function(d){return "mentras"},
"whileTooltip":function(d){return "Repeat the enclosed actions until finish point is reached."},
"yes":function(d){return "Yes"}};