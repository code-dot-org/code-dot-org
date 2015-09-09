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
"continue":function(d){return "Continuar"},
"doCode":function(d){return "fazer"},
"elseCode":function(d){return "se não"},
"endGame":function(d){return "terminar jogo"},
"endGameTooltip":function(d){return "Termina o jogo."},
"finalLevel":function(d){return "Parabéns! Resolveste o desafio final."},
"flap":function(d){return "bater as assas"},
"flapRandom":function(d){return "bater as assas por vezes aleatórias"},
"flapVerySmall":function(d){return "bater as assas muito poucas vezes"},
"flapSmall":function(d){return "bater as assas poucas vezes"},
"flapNormal":function(d){return "bater as assas por vezes razoáveis"},
"flapLarge":function(d){return "bater as assas por algumas vezes"},
"flapVeryLarge":function(d){return "bater as assas por muitas vezes"},
"flapTooltip":function(d){return "Faz o passarinho voar para cima."},
"flappySpecificFail":function(d){return "O teu código parece bem - vai agitar-se com cada clique. Mas precisas de clicar várias vezes para agitar-se até ao alvo."},
"incrementPlayerScore":function(d){return "marcar um ponto"},
"incrementPlayerScoreTooltip":function(d){return "Adiciona um ponto à pontuação atual do jogador."},
"nextLevel":function(d){return "Parabéns! Concluíste este desafio."},
"no":function(d){return "Não"},
"numBlocksNeeded":function(d){return "Este desafio pode ser resolvido com %1 blocos."},
"playSoundRandom":function(d){return "reproduzir som aleatório"},
"playSoundBounce":function(d){return "reproduzir som de salto"},
"playSoundCrunch":function(d){return "reproduzir som de triturar"},
"playSoundDie":function(d){return "reproduzir som triste"},
"playSoundHit":function(d){return "reproduzir som de esmagamento"},
"playSoundPoint":function(d){return "reproduzir som de pontuação"},
"playSoundSwoosh":function(d){return "reproduzir som do vento"},
"playSoundWing":function(d){return "reproduzir som das asas"},
"playSoundJet":function(d){return "reproduzir som de um jato"},
"playSoundCrash":function(d){return "reproduzir som de queda"},
"playSoundJingle":function(d){return "reproduzir com de um sino"},
"playSoundSplash":function(d){return "reproduzir som de mergulho"},
"playSoundLaser":function(d){return "reproduzir som de laser"},
"playSoundTooltip":function(d){return "Tocar o som escolhido."},
"reinfFeedbackMsg":function(d){return "Podes clicar no botão \"Voltar a tentar\" para voltares a jogar o teu jogo."},
"scoreText":function(d){return "Pontuação: "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "definir cenário"},
"setBackgroundRandom":function(d){return "definir cenário aleatório"},
"setBackgroundFlappy":function(d){return "definir cenário de cidade (dia)"},
"setBackgroundNight":function(d){return "definir cenário de cidade (noite)"},
"setBackgroundSciFi":function(d){return "definir cenário de ficção científica"},
"setBackgroundUnderwater":function(d){return "definir cenário debaixo de água"},
"setBackgroundCave":function(d){return "definir cenário de caverna"},
"setBackgroundSanta":function(d){return "definir cenário de Natal"},
"setBackgroundTooltip":function(d){return "Define a imagem de fundo"},
"setGapRandom":function(d){return "definir um buraco aleatório"},
"setGapVerySmall":function(d){return "definir um buraco muito pequeno"},
"setGapSmall":function(d){return "definir um buraco pequeno"},
"setGapNormal":function(d){return "definir um buraco normal"},
"setGapLarge":function(d){return "definir um buraco grande"},
"setGapVeryLarge":function(d){return "definir um buraco muito grande"},
"setGapHeightTooltip":function(d){return "Define o a altura do buraco num obstáculo"},
"setGravityRandom":function(d){return "definir gravidade aleatória"},
"setGravityVeryLow":function(d){return "definir gravidade como muito baixa"},
"setGravityLow":function(d){return "definir gravidade como  baixa"},
"setGravityNormal":function(d){return "definir gravidade como normal"},
"setGravityHigh":function(d){return "definir gravidade como alta"},
"setGravityVeryHigh":function(d){return "definir gravidade como muito alta"},
"setGravityTooltip":function(d){return "Define o nível da gravidade"},
"setGround":function(d){return "definir chão"},
"setGroundRandom":function(d){return "definir chão como aleatório"},
"setGroundFlappy":function(d){return "definir chão como terra"},
"setGroundSciFi":function(d){return "definir chão como ficção cientifica"},
"setGroundUnderwater":function(d){return "definir chão como debaixo de água"},
"setGroundCave":function(d){return "definir chão como caverna"},
"setGroundSanta":function(d){return "definir chão como natalício"},
"setGroundLava":function(d){return "definir chão como lava"},
"setGroundTooltip":function(d){return "Define a imagem do chão"},
"setObstacle":function(d){return "definir obstáculo"},
"setObstacleRandom":function(d){return "definir obstáculo aleatório"},
"setObstacleFlappy":function(d){return "definir obstáculo como cano"},
"setObstacleSciFi":function(d){return "definir obstáculo como ficção científica"},
"setObstacleUnderwater":function(d){return "definir obstáculo como planta"},
"setObstacleCave":function(d){return "definir obstáculo como caverna"},
"setObstacleSanta":function(d){return "definir obstáculo como chaminé"},
"setObstacleLaser":function(d){return "definir obstáculo como laser"},
"setObstacleTooltip":function(d){return "Define a imagem do obstáculo"},
"setPlayer":function(d){return "definir jogador"},
"setPlayerRandom":function(d){return "definir o jogador como aleatório"},
"setPlayerFlappy":function(d){return "definir o jogador pássaro amarelo"},
"setPlayerRedBird":function(d){return "definir o jogador como pássaro vermelho"},
"setPlayerSciFi":function(d){return "definir o jogador como nave espacial"},
"setPlayerUnderwater":function(d){return "definir o jogador como peixe"},
"setPlayerCave":function(d){return "definir o jogador como morcego"},
"setPlayerSanta":function(d){return "definir o jogador como Pai Natal"},
"setPlayerShark":function(d){return "definir o jogador como tubarão"},
"setPlayerEaster":function(d){return "definir o jogador como Coelho da Páscoa"},
"setPlayerBatman":function(d){return "definir o jogador como homem morcego"},
"setPlayerSubmarine":function(d){return "definir o jogador como submarino"},
"setPlayerUnicorn":function(d){return "definir o jogador como unicórnio"},
"setPlayerFairy":function(d){return "definir o jogador como fada"},
"setPlayerSuperman":function(d){return "definir o jogador como homem pássaro"},
"setPlayerTurkey":function(d){return "definir o jogador como perú"},
"setPlayerTooltip":function(d){return "Define a imagem do jogador"},
"setScore":function(d){return "definir pontuação"},
"setScoreTooltip":function(d){return "Define a pontuação do jogador"},
"setSpeed":function(d){return "definir velocidade"},
"setSpeedTooltip":function(d){return "Define a velocidade do nível"},
"shareFlappyTwitter":function(d){return "Vê o Flappy Bird que eu criei. Eu escrevi isto sozinho no @codeorg"},
"shareGame":function(d){return "Partilha o teu jogo:"},
"soundRandom":function(d){return "aleatório"},
"soundBounce":function(d){return "saltar"},
"soundCrunch":function(d){return "triturar"},
"soundDie":function(d){return "triste"},
"soundHit":function(d){return "esmagamento"},
"soundPoint":function(d){return "ponto"},
"soundSwoosh":function(d){return "vento"},
"soundWing":function(d){return "bater das asas"},
"soundJet":function(d){return "jato"},
"soundCrash":function(d){return "choque"},
"soundJingle":function(d){return "sino"},
"soundSplash":function(d){return "mergulho"},
"soundLaser":function(d){return "laser"},
"speedRandom":function(d){return "definir velocidade como aleatória"},
"speedVerySlow":function(d){return "definir velocidade como muito lenta"},
"speedSlow":function(d){return "definir velocidade como lenta"},
"speedNormal":function(d){return "definir velocidade como normal"},
"speedFast":function(d){return "definir velocidade como rápida"},
"speedVeryFast":function(d){return "definir velocidade como muito rápida"},
"whenClick":function(d){return "quando clicar"},
"whenClickTooltip":function(d){return "Executar as seguintes ações quando ocorrer um evento de clique."},
"whenCollideGround":function(d){return "quando bater no chão"},
"whenCollideGroundTooltip":function(d){return "Executar as seguintes ações quando o passarinho bater no chão."},
"whenCollideObstacle":function(d){return "quando bater num obstáculo"},
"whenCollideObstacleTooltip":function(d){return "Executar as seguintes acções quando o passarinho for contra um obstáculo."},
"whenEnterObstacle":function(d){return "quando passar por um obstáculo"},
"whenEnterObstacleTooltip":function(d){return "Executar as seguintes ações quando o passarinho entrar num obstáculo."},
"whenRunButtonClick":function(d){return "quando o jogo começa"},
"whenRunButtonClickTooltip":function(d){return "Executar as seguintes ações quando o jogo começar."},
"yes":function(d){return "Sim"}};