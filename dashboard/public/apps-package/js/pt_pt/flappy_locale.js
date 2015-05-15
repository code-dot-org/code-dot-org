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
v:function(d,k){flappy_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){flappy_locale.c(d,k);return d[k] in p?p[d[k]]:(k=flappy_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){flappy_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).flappy_locale = {
"continue":function(d){return "Continua"},
"doCode":function(d){return "fazer"},
"elseCode":function(d){return "se não"},
"endGame":function(d){return "terminar jogo"},
"endGameTooltip":function(d){return "Termina o jogo."},
"finalLevel":function(d){return "Parabéns! Resolveste o desafio final."},
"flap":function(d){return "Bater as assas"},
"flapRandom":function(d){return "Bater as assas um valor de vezes aleatório"},
"flapVerySmall":function(d){return "Bater as assas uma quantidade muito pequena"},
"flapSmall":function(d){return "Bater as assas uma quantidade pequena"},
"flapNormal":function(d){return "Bater as assas uma quantidade normal"},
"flapLarge":function(d){return "Bater as assas uma quantidade grande"},
"flapVeryLarge":function(d){return "Bater as assas uma quantidade muito grande"},
"flapTooltip":function(d){return "Voa o Flappy para cima."},
"flappySpecificFail":function(d){return "O teu código parece bem - vai agitar-se com cada clique. Mas precisas de clicar várias vezes para agitar-se até ao alvo."},
"incrementPlayerScore":function(d){return "marcar um ponto"},
"incrementPlayerScoreTooltip":function(d){return "Adiciona um ponto à pontuação atual do jogador."},
"nextLevel":function(d){return "Parabéns! Completaste este puzzle."},
"no":function(d){return "Não"},
"numBlocksNeeded":function(d){return "Este puzzle pode ser resolvido com blocos de  %1 ."},
"playSoundRandom":function(d){return "tocar som aleatório"},
"playSoundBounce":function(d){return "toca som de salto"},
"playSoundCrunch":function(d){return "toca som de triturar"},
"playSoundDie":function(d){return "toca som triste"},
"playSoundHit":function(d){return "toca som esmagar"},
"playSoundPoint":function(d){return "toca som ponto"},
"playSoundSwoosh":function(d){return "fazer som swoosh"},
"playSoundWing":function(d){return "fazer som da assa"},
"playSoundJet":function(d){return "fazer som  de jato"},
"playSoundCrash":function(d){return "fazer som de crash"},
"playSoundJingle":function(d){return "fazer som de sino"},
"playSoundSplash":function(d){return "fazer som de salpico"},
"playSoundLaser":function(d){return "toca som laser"},
"playSoundTooltip":function(d){return "Tocar o som escolhido."},
"reinfFeedbackMsg":function(d){return "Podes selecionar o botão \"Tenta Novamente\" para voltar e jogares o teu jogo."},
"scoreText":function(d){return "Pontuação: "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "definir cena"},
"setBackgroundRandom":function(d){return "definir cena aleatória"},
"setBackgroundFlappy":function(d){return "definir cena Cidade (dia)"},
"setBackgroundNight":function(d){return "definir cena Cidade (noite)"},
"setBackgroundSciFi":function(d){return "definir cena ficção cientifica"},
"setBackgroundUnderwater":function(d){return "definir cena debaixo de água"},
"setBackgroundCave":function(d){return "definir cena Caverna"},
"setBackgroundSanta":function(d){return "definir cena Pai Natal"},
"setBackgroundTooltip":function(d){return "definir a imagem de fundo"},
"setGapRandom":function(d){return "Defina um intervalo aleatório"},
"setGapVerySmall":function(d){return "Defina um intervalo muito pequeno"},
"setGapSmall":function(d){return "Defina um intervalo pequeno"},
"setGapNormal":function(d){return "Defina um intervalo normal"},
"setGapLarge":function(d){return "definir uma grande lacuna"},
"setGapVeryLarge":function(d){return "definir intervalo muito grande"},
"setGapHeightTooltip":function(d){return "Define o espaço vertical num obstáculo"},
"setGravityRandom":function(d){return "definir gravidade aleatória"},
"setGravityVeryLow":function(d){return "definir gravidade como muito baixa"},
"setGravityLow":function(d){return "definir gravidade como  baixa"},
"setGravityNormal":function(d){return "definir gravidade como normal"},
"setGravityHigh":function(d){return "definir gravidade como alta"},
"setGravityVeryHigh":function(d){return "definir gravidade como muito alta"},
"setGravityTooltip":function(d){return "Define a gravidade do nível"},
"setGround":function(d){return "definir chão"},
"setGroundRandom":function(d){return "definir chão como aleatório"},
"setGroundFlappy":function(d){return "definir chão como terra"},
"setGroundSciFi":function(d){return "definir chão como ficção cientifica"},
"setGroundUnderwater":function(d){return "definir chão como sub-aquático"},
"setGroundCave":function(d){return "definir chão como caverna"},
"setGroundSanta":function(d){return "definir chão como natalício"},
"setGroundLava":function(d){return "definir chão como lava"},
"setGroundTooltip":function(d){return "definir chão como imagem"},
"setObstacle":function(d){return "definir obstáculo"},
"setObstacleRandom":function(d){return "definir obstáculo aleatório"},
"setObstacleFlappy":function(d){return "definir obstáculo Cano"},
"setObstacleSciFi":function(d){return "definir obstáculo Ficção Cientifica"},
"setObstacleUnderwater":function(d){return "definir obstáculo Planta"},
"setObstacleCave":function(d){return "definir obstáculo Caverna"},
"setObstacleSanta":function(d){return "definir obstáculo Chaminé"},
"setObstacleLaser":function(d){return "definir obstáculo Lazer"},
"setObstacleTooltip":function(d){return "definir obstáculo com imagem"},
"setPlayer":function(d){return "definir jogador"},
"setPlayerRandom":function(d){return "definir o jogador aleatóriamente"},
"setPlayerFlappy":function(d){return "definir o jogador pássaro amarelo"},
"setPlayerRedBird":function(d){return "definir o jogador pássaro vermelho"},
"setPlayerSciFi":function(d){return "definir o jogador nave espacial"},
"setPlayerUnderwater":function(d){return "definir o jogador peixe"},
"setPlayerCave":function(d){return "definir o jogador morcego"},
"setPlayerSanta":function(d){return "definir jogador Pai Natal"},
"setPlayerShark":function(d){return "definir jogador Tubarão"},
"setPlayerEaster":function(d){return "definir jogador Coelho da Páscoa"},
"setPlayerBatman":function(d){return "definir jogador Homem Morcego"},
"setPlayerSubmarine":function(d){return "definir jogador Submarino"},
"setPlayerUnicorn":function(d){return "definir jogador Unicórnio"},
"setPlayerFairy":function(d){return "definir jogador Fada"},
"setPlayerSuperman":function(d){return "definir jogador Homem Flappy"},
"setPlayerTurkey":function(d){return "definir jogador Peru"},
"setPlayerTooltip":function(d){return "definir imagem do jogador"},
"setScore":function(d){return "definir pontuação"},
"setScoreTooltip":function(d){return "Define a pontuação do jogador"},
"setSpeed":function(d){return "definir velocidade"},
"setSpeedTooltip":function(d){return "definir velocidade do nível"},
"shareFlappyTwitter":function(d){return "Confira o Flappy jogo que eu fiz. Eu escrevi isso sozinho com @codeorg"},
"shareGame":function(d){return "Partilha o teu jogo:"},
"soundRandom":function(d){return "aleatório"},
"soundBounce":function(d){return "saltar"},
"soundCrunch":function(d){return "triturar"},
"soundDie":function(d){return "triste"},
"soundHit":function(d){return "esmagar"},
"soundPoint":function(d){return "ponto"},
"soundSwoosh":function(d){return "swoosh"},
"soundWing":function(d){return "asa"},
"soundJet":function(d){return "jato"},
"soundCrash":function(d){return "acidente"},
"soundJingle":function(d){return "sino"},
"soundSplash":function(d){return "salpico"},
"soundLaser":function(d){return "laser"},
"speedRandom":function(d){return "definir velocidade aleatória"},
"speedVerySlow":function(d){return "definir velocidade muito lenta"},
"speedSlow":function(d){return "definir velocidade lenta"},
"speedNormal":function(d){return "definir velocidade normal"},
"speedFast":function(d){return "definir velocidade rápida"},
"speedVeryFast":function(d){return "definir velocidade muito rápida"},
"whenClick":function(d){return "quando clicar"},
"whenClickTooltip":function(d){return "Executar as seguintes ações quando ocorrer um evento de clique."},
"whenCollideGround":function(d){return "quando bate no chão"},
"whenCollideGroundTooltip":function(d){return "Executar as acções abaixo quando o Flappy atingir o chão."},
"whenCollideObstacle":function(d){return "quando bate num obstáculo"},
"whenCollideObstacleTooltip":function(d){return "Executar as acções abaixo quando o Flappy atingir um obstáculo."},
"whenEnterObstacle":function(d){return "quando passa um obstáculo"},
"whenEnterObstacleTooltip":function(d){return "Executar as acções abaixo quando o Flappy entrar num obstáculo."},
"whenRunButtonClick":function(d){return "quando o jogo começa"},
"whenRunButtonClickTooltip":function(d){return "Executa as ações abaixo quando o jogo começar."},
"yes":function(d){return "Sim"}};