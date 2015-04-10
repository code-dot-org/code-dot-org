var appLocale = {lc:{"ar":function(n){
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
v:function(d,k){appLocale.c(d,k);return d[k]},
p:function(d,k,o,l,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:(k=appLocale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).appLocale = {
"bounceBall":function(d){return "quique a bola"},
"bounceBallTooltip":function(d){return "Quique a bola quando bater no objeto."},
"continue":function(d){return "Continuar"},
"dirE":function(d){return "L"},
"dirN":function(d){return "N"},
"dirS":function(d){return "S"},
"dirW":function(d){return "O"},
"doCode":function(d){return "faça"},
"elseCode":function(d){return "se não"},
"finalLevel":function(d){return "Parabéns! Você resolveu o último desafio."},
"heightParameter":function(d){return "altura"},
"ifCode":function(d){return "se"},
"ifPathAhead":function(d){return "se houver caminho à frente"},
"ifTooltip":function(d){return "Se houver um caminho na direção especificada, realize algumas ações."},
"ifelseTooltip":function(d){return "Se houver um caminho na direção especificada, faça o primeiro bloco de ações. Caso contrário, faça o segundo bloco de ações."},
"incrementOpponentScore":function(d){return "marca o ponto do oponente"},
"incrementOpponentScoreTooltip":function(d){return "Soma um ponto à pontuação atual do jogador."},
"incrementPlayerScore":function(d){return "marque o ponto"},
"incrementPlayerScoreTooltip":function(d){return "Some um ponto à pontuação atual do jogador."},
"isWall":function(d){return "isso é uma parede"},
"isWallTooltip":function(d){return "Retorna verdadeiro se houver uma parede aqui"},
"launchBall":function(d){return "lance uma nova bola"},
"launchBallTooltip":function(d){return "Lança uma bola em jogo."},
"makeYourOwn":function(d){return "Crie seu próprio jogo de pingue-pongue"},
"moveDown":function(d){return "mova para baixo"},
"moveDownTooltip":function(d){return "Move a raquete para baixo."},
"moveForward":function(d){return "avance"},
"moveForwardTooltip":function(d){return "Mova-me um espaço para a frente."},
"moveLeft":function(d){return "mova à esquerda"},
"moveLeftTooltip":function(d){return "Move a raquete à esquerda."},
"moveRight":function(d){return "mova à direita"},
"moveRightTooltip":function(d){return "Move a raquete à direita."},
"moveUp":function(d){return "mova para cima"},
"moveUpTooltip":function(d){return "Move a raquete para cima."},
"nextLevel":function(d){return "Parabéns! Você completou o desafio."},
"no":function(d){return "Não"},
"noPathAhead":function(d){return "o caminho está bloqueado"},
"noPathLeft":function(d){return "Não há caminho à esquerda"},
"noPathRight":function(d){return "Não há caminho à direita"},
"numBlocksNeeded":function(d){return "Este desafio pode ser resolvido com %1 blocos."},
"pathAhead":function(d){return "se houver caminho à frente"},
"pathLeft":function(d){return "se houver caminho à esquerda"},
"pathRight":function(d){return "se houver caminho à direita"},
"pilePresent":function(d){return "houver uma pilha"},
"playSoundCrunch":function(d){return "reproduza barulho de trituração"},
"playSoundGoal1":function(d){return "reproduza som de objetivo alcançado 1"},
"playSoundGoal2":function(d){return "reproduza som de objetivo alcançado 2"},
"playSoundHit":function(d){return "reproduza barulho de pancada"},
"playSoundLosePoint":function(d){return "reproduza som de ponto perdido"},
"playSoundLosePoint2":function(d){return "reproduza som de ponto perdido 2"},
"playSoundRetro":function(d){return "reproduza som retrô"},
"playSoundRubber":function(d){return "reproduza som de borracha"},
"playSoundSlap":function(d){return "reproduza som de palmas"},
"playSoundTooltip":function(d){return "Reproduza o som escolhido."},
"playSoundWinPoint":function(d){return "reproduza som de ponto ganho"},
"playSoundWinPoint2":function(d){return "reproduza som de ponto ganho 2"},
"playSoundWood":function(d){return "reproduza som de madeira"},
"putdownTower":function(d){return "derrube a torre"},
"reinfFeedbackMsg":function(d){return "Você pode pressionar o botão de \"Tentar novamente\" para voltar a jogar o seu jogo."},
"removeSquare":function(d){return "remova o quadrado"},
"repeatUntil":function(d){return "repita até"},
"repeatUntilBlocked":function(d){return "enquanto houver caminho em frente"},
"repeatUntilFinish":function(d){return "repita até terminar"},
"scoreText":function(d){return "Pontuação: "+appLocale.v(d,"playerScore")+" : "+appLocale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "defina cenário aleatório"},
"setBackgroundHardcourt":function(d){return "defina o tipo de quadra"},
"setBackgroundRetro":function(d){return "defina cenário retrô"},
"setBackgroundTooltip":function(d){return "Define a imagem do plano de fundo"},
"setBallRandom":function(d){return "defina bola aleatória"},
"setBallHardcourt":function(d){return "defina o tipo de bola"},
"setBallRetro":function(d){return "defina bola retrô"},
"setBallTooltip":function(d){return "Define a imagem da bola"},
"setBallSpeedRandom":function(d){return "defina a velocidade da bola aleatoriamente"},
"setBallSpeedVerySlow":function(d){return "defina a velocidade da bola como muito lenta"},
"setBallSpeedSlow":function(d){return "defina a velocidade da bola como lenta"},
"setBallSpeedNormal":function(d){return "defina a velocidade da bola como normal"},
"setBallSpeedFast":function(d){return "defina a velocidade da bola como rápida"},
"setBallSpeedVeryFast":function(d){return "defina a velocidade da bola como muito rápida"},
"setBallSpeedTooltip":function(d){return "Define a velocidade da bola"},
"setPaddleRandom":function(d){return "defina a raquete aleatoriamente"},
"setPaddleHardcourt":function(d){return "defina raquete para quadras rápidas"},
"setPaddleRetro":function(d){return "defina raquete retrô"},
"setPaddleTooltip":function(d){return "Define a imagem da raquete"},
"setPaddleSpeedRandom":function(d){return "defina a velocidade da raquete aleatoriamente"},
"setPaddleSpeedVerySlow":function(d){return "defina a velocidade da raquete como muito lenta"},
"setPaddleSpeedSlow":function(d){return "defina a velocidade da raquete como lenta"},
"setPaddleSpeedNormal":function(d){return "defina a velocidade da raquete como normal"},
"setPaddleSpeedFast":function(d){return "defina a velocidade da raquete como rápida"},
"setPaddleSpeedVeryFast":function(d){return "defina a velocidade da raquete como muito rápida"},
"setPaddleSpeedTooltip":function(d){return "Define a velocidade da raquete"},
"shareBounceTwitter":function(d){return "Veja o jogo de Pingue-pongue que eu fiz. Eu mesmo programei com a @codeorg"},
"shareGame":function(d){return "Compartilhe seu jogo:"},
"turnLeft":function(d){return "vire à esquerda"},
"turnRight":function(d){return "vire à direita"},
"turnTooltip":function(d){return "Vire 90 graus à esquerda ou à direita."},
"whenBallInGoal":function(d){return "quando a bola chega ao alvo"},
"whenBallInGoalTooltip":function(d){return "Execute as ações abaixo quando uma bola chegar ao objetivo."},
"whenBallMissesPaddle":function(d){return "quando a bola não atinge a raquete"},
"whenBallMissesPaddleTooltip":function(d){return "Execute as ações abaixo quando uma bola não atingir a raquete."},
"whenDown":function(d){return "quando a seta para baixo estiver pressionada"},
"whenDownTooltip":function(d){return "Execute as ações abaixo quando a tecla com a seta para baixo estiver pressionada."},
"whenGameStarts":function(d){return "quando o jogo começa"},
"whenGameStartsTooltip":function(d){return "Execute as ações abaixo quando o jogo começar."},
"whenLeft":function(d){return "quando a seta à esquerda estiver pressionada"},
"whenLeftTooltip":function(d){return "Execute as ações abaixo quando a tecla com a seta à esquerda estiver pressionada."},
"whenPaddleCollided":function(d){return "quando a bola atinge a raquete"},
"whenPaddleCollidedTooltip":function(d){return "Execute as ações abaixo quando uma bola atingir uma raquete."},
"whenRight":function(d){return "quando a seta à direita estiver pressionada"},
"whenRightTooltip":function(d){return "Execute as ações abaixo quando a tecla com a seta à direita estiver pressionada."},
"whenUp":function(d){return "quando a seta para cima estiver pressionada"},
"whenUpTooltip":function(d){return "Execute as ações abaixo quando a tecla com a seta para cima estiver pressionada."},
"whenWallCollided":function(d){return "quando a bola atinge a parede"},
"whenWallCollidedTooltip":function(d){return "Execute as ações abaixo quando uma bola atingir uma parede."},
"whileMsg":function(d){return "enquanto"},
"whileTooltip":function(d){return "Repita as ações até satisfazer a condição."},
"yes":function(d){return "Sim"}};