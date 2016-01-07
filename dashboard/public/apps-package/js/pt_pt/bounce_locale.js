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
"bounceBall":function(d){return "ressaltar a bola"},
"bounceBallTooltip":function(d){return "Fazer ressaltar a bola de um objeto."},
"continue":function(d){return "Continuar"},
"dirE":function(d){return "E"},
"dirN":function(d){return "N"},
"dirS":function(d){return "S"},
"dirW":function(d){return "O"},
"doCode":function(d){return "fazer"},
"elseCode":function(d){return "se não"},
"finalLevel":function(d){return "Parabéns! Resolveste o desafio final."},
"heightParameter":function(d){return "altura"},
"ifCode":function(d){return "se"},
"ifPathAhead":function(d){return "se há caminho em frente"},
"ifTooltip":function(d){return "Se há caminho na direção especificada, faz algumas ações."},
"ifelseTooltip":function(d){return "Se há caminho na direção especificada, faz o primeiro bloco de ações. Senão, faz o segundo bloco de ações."},
"incrementOpponentScore":function(d){return "marcar um ponto do adversário"},
"incrementOpponentScoreTooltip":function(d){return "Adicionar um ponto à pontuação do adversário atual."},
"incrementPlayerScore":function(d){return "marcar um ponto"},
"incrementPlayerScoreTooltip":function(d){return "Adicionar um ponto à pontuação atual do jogador."},
"isWall":function(d){return "isto é uma parede"},
"isWallTooltip":function(d){return "Devolve verdadeiro se houver uma parede aqui"},
"launchBall":function(d){return "lançar nova bola"},
"launchBallTooltip":function(d){return "Lançar uma bola no jogo."},
"makeYourOwn":function(d){return "Cria o teu próprio jogo de pingue-pongue"},
"moveDown":function(d){return "mover para baixo"},
"moveDownTooltip":function(d){return "Mover a raquete para baixo."},
"moveForward":function(d){return "segue em frente"},
"moveForwardTooltip":function(d){return "Segue em frente uma unidade."},
"moveLeft":function(d){return "mover para a esquerda"},
"moveLeftTooltip":function(d){return "Mover a raquete para a esquerda."},
"moveRight":function(d){return "mover para a direita"},
"moveRightTooltip":function(d){return "Mover a raquete para a direita."},
"moveUp":function(d){return "mover para cima"},
"moveUpTooltip":function(d){return "Mover a raquete para cima."},
"nextLevel":function(d){return "Parabéns! Concluíste este desafio."},
"no":function(d){return "Não"},
"noPathAhead":function(d){return "caminho está bloqueado"},
"noPathLeft":function(d){return "Não há caminho para a esquerda"},
"noPathRight":function(d){return "não há caminho para a direita"},
"numBlocksNeeded":function(d){return "Este desafio pode ser resolvido com %1 blocos."},
"pathAhead":function(d){return "caminho em frente"},
"pathLeft":function(d){return "se há caminho para a esquerda"},
"pathRight":function(d){return "se há caminho para a direita"},
"pilePresent":function(d){return "há uma pilha"},
"playSoundCrunch":function(d){return "toca som de triturar"},
"playSoundGoal1":function(d){return "tocar som do objetivo 1"},
"playSoundGoal2":function(d){return "tocar som do objetivo 2"},
"playSoundHit":function(d){return "tocar som de embate"},
"playSoundLosePoint":function(d){return "tocar som de ponto perdido"},
"playSoundLosePoint2":function(d){return "tocar som de ponto perdido 2"},
"playSoundRetro":function(d){return "tocar som retro"},
"playSoundRubber":function(d){return "tocar som de borracha"},
"playSoundSlap":function(d){return "tocar som de chapada"},
"playSoundTooltip":function(d){return "Tocar o som escolhido."},
"playSoundWinPoint":function(d){return "tocar som de ponto ganho"},
"playSoundWinPoint2":function(d){return "tocar som de ponto ganho 2"},
"playSoundWood":function(d){return "tocar som de madeira"},
"putdownTower":function(d){return "coloca a torre em baixo"},
"reinfFeedbackMsg":function(d){return "Podes clicar no botão \"Voltar a tentar\" para voltares a jogar o teu jogo."},
"removeSquare":function(d){return "remove o quadrado"},
"repeatUntil":function(d){return "repetir até"},
"repeatUntilBlocked":function(d){return "enquanto houver caminho em frente"},
"repeatUntilFinish":function(d){return "repete até terminar"},
"scoreText":function(d){return "Pontuação: "+bounce_locale.v(d,"playerScore")+" - "+bounce_locale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "definir cena aleatória"},
"setBackgroundHardcourt":function(d){return "definir cena de campo de ténis"},
"setBackgroundRetro":function(d){return "definir cena retro"},
"setBackgroundTooltip":function(d){return "definir a imagem de fundo"},
"setBallRandom":function(d){return "definir bola aleatória"},
"setBallHardcourt":function(d){return "definir bola de ténis"},
"setBallRetro":function(d){return "definir bola retro"},
"setBallTooltip":function(d){return "Define a imagem da bola"},
"setBallSpeedRandom":function(d){return "definir velocidade da bola: aleatória"},
"setBallSpeedVerySlow":function(d){return "definir velocidade da bola: muito lenta"},
"setBallSpeedSlow":function(d){return "definir velocidade da bola: lenta"},
"setBallSpeedNormal":function(d){return "definir velocidade da bola: normal"},
"setBallSpeedFast":function(d){return "definir velocidade da bola: rápida"},
"setBallSpeedVeryFast":function(d){return "definir velocidade da bola: muito rápida"},
"setBallSpeedTooltip":function(d){return "Define a velocidade da bola"},
"setPaddleRandom":function(d){return "definir raquete: aleatória"},
"setPaddleHardcourt":function(d){return "definir raquete: de ténis"},
"setPaddleRetro":function(d){return "definir raquete: retro"},
"setPaddleTooltip":function(d){return "Define a imagem da raquete"},
"setPaddleSpeedRandom":function(d){return "definir velocidade da raquete: aleatória"},
"setPaddleSpeedVerySlow":function(d){return "definir velocidade da raquete: muito lenta"},
"setPaddleSpeedSlow":function(d){return "definir velocidade da raquete: lenta"},
"setPaddleSpeedNormal":function(d){return "definir velocidade da raquete: normal"},
"setPaddleSpeedFast":function(d){return "definir velocidade da raquete: rápida"},
"setPaddleSpeedVeryFast":function(d){return "definir velocidade da raquete: muito rápida"},
"setPaddleSpeedTooltip":function(d){return "Define a velocidade da raquete"},
"shareBounceTwitter":function(d){return "Vê o jogo de pingue-pongue que eu criei. Fui que o programei no @codeorg"},
"shareGame":function(d){return "Partilha o teu jogo:"},
"turnLeft":function(d){return "virar à esquerda"},
"turnRight":function(d){return "virar à direita"},
"turnTooltip":function(d){return "Vira à esquerda ou à direita 90 graus."},
"whenBallInGoal":function(d){return "quando a bola estiver na baliza"},
"whenBallInGoalTooltip":function(d){return "Executar as seguintes ações quando a bola entrar na baliza."},
"whenBallMissesPaddle":function(d){return "quando a bola não tocar na raquete"},
"whenBallMissesPaddleTooltip":function(d){return "Executar as seguintes ações quando a bola não tocar na raquete."},
"whenDown":function(d){return "quando clicar seta para baixo"},
"whenDownTooltip":function(d){return "Executar as seguintes ações quando a tecla da seta para baixo for pressionada."},
"whenGameStarts":function(d){return "quando o jogo começa"},
"whenGameStartsTooltip":function(d){return "Executa as ações abaixo quando o jogo começar."},
"whenLeft":function(d){return "quando clicar seta para a esquerda"},
"whenLeftTooltip":function(d){return "Executar as seguintes ações quando a tecla da seta para a esquerda for pressionada."},
"whenPaddleCollided":function(d){return "quando a bola bate na raquete"},
"whenPaddleCollidedTooltip":function(d){return "Executar as seguintes ações quando a bola tocar na raquete."},
"whenRight":function(d){return "quando clicar seta para a direita"},
"whenRightTooltip":function(d){return "Executar as seguintes ações quando a tecla da seta para a direita for pressionada."},
"whenUp":function(d){return "quando clicar seta para cima"},
"whenUpTooltip":function(d){return "Executar as seguintes ações quando clicar na seta para cima."},
"whenWallCollided":function(d){return "quando a bola bate na parede"},
"whenWallCollidedTooltip":function(d){return "Executar as seguintes ações quando a bola bater na parede."},
"whileMsg":function(d){return "enquanto"},
"whileTooltip":function(d){return "Repete as ações seguintes até a condição de terminação ser alcançada."},
"yes":function(d){return "Sim"}};