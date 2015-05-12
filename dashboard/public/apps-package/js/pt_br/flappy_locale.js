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
"continue":function(d){return "Continuar"},
"doCode":function(d){return "faça"},
"elseCode":function(d){return "se não"},
"endGame":function(d){return "fim de Jogo"},
"endGameTooltip":function(d){return "Termina o Jogo."},
"finalLevel":function(d){return "Parabéns! Você resolveu o desafio final."},
"flap":function(d){return "bata asas"},
"flapRandom":function(d){return "bata asas de forma aleatória"},
"flapVerySmall":function(d){return "bata asas pouquíssimas vezes"},
"flapSmall":function(d){return "bata asas poucas vezes"},
"flapNormal":function(d){return "bata asas normalmente"},
"flapLarge":function(d){return "bata asas muitas vezes"},
"flapVeryLarge":function(d){return "bata asas muitíssimas vezes"},
"flapTooltip":function(d){return "Faça com que o passarinho voe."},
"flappySpecificFail":function(d){return "Seu código parece bom - ele irá bater as asas com cada clique. Mas você precisa clicar muitas vezes para bater as asas para o alvo."},
"incrementPlayerScore":function(d){return "marque um ponto"},
"incrementPlayerScoreTooltip":function(d){return "Soma um ponto à pontuação atual do jogador."},
"nextLevel":function(d){return "Parabéns! Você completou este desafio."},
"no":function(d){return "Não"},
"numBlocksNeeded":function(d){return "Esse desafio pode ser resolvido com %1 blocos."},
"playSoundRandom":function(d){return "reproduza som aleatório"},
"playSoundBounce":function(d){return "reproduza som de bola pulando"},
"playSoundCrunch":function(d){return "reproduza barulho de trituração"},
"playSoundDie":function(d){return "reproduza som triste"},
"playSoundHit":function(d){return "reproduza som de esmagamento"},
"playSoundPoint":function(d){return "reproduza som de pontuação"},
"playSoundSwoosh":function(d){return "reproduza som de vento encanado"},
"playSoundWing":function(d){return "reproduza som de asas batendo"},
"playSoundJet":function(d){return "reproduza som de jato"},
"playSoundCrash":function(d){return "reproduza som de batida"},
"playSoundJingle":function(d){return "reproduza som de chocalho"},
"playSoundSplash":function(d){return "reproduza som de água"},
"playSoundLaser":function(d){return "reproduza som de laser"},
"playSoundTooltip":function(d){return "Reproduz o som escolhido."},
"reinfFeedbackMsg":function(d){return "Você pode pressionar o botão de \"Tentar novamente\" para voltar a jogar o seu jogo."},
"scoreText":function(d){return "Pontuação: "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "escolha o cenário"},
"setBackgroundRandom":function(d){return "escolha um cenário aleatoriamente"},
"setBackgroundFlappy":function(d){return "escolha o cenário Cidade (dia)"},
"setBackgroundNight":function(d){return "escolha o cenário Cidade (noite)"},
"setBackgroundSciFi":function(d){return "escolha o cenário de Ficção Científica"},
"setBackgroundUnderwater":function(d){return "escolha o cenário Subaquático"},
"setBackgroundCave":function(d){return "escolha o cenário Caverna"},
"setBackgroundSanta":function(d){return "escolha o cenário de Natal"},
"setBackgroundTooltip":function(d){return "Define a imagem de fundo"},
"setGapRandom":function(d){return "escolha uma abertura de tamanho aleatório"},
"setGapVerySmall":function(d){return "escolha uma abertura bem pequena"},
"setGapSmall":function(d){return "escolha uma abertura pequena"},
"setGapNormal":function(d){return "escolha uma abertura de tamanho normal"},
"setGapLarge":function(d){return "escolha uma abertura grande"},
"setGapVeryLarge":function(d){return "escolha uma abertura muito grande"},
"setGapHeightTooltip":function(d){return "Define a abertura vertical em um obstáculo"},
"setGravityRandom":function(d){return "defina gravidade aleatoriamente"},
"setGravityVeryLow":function(d){return "defina gravidade muito baixa"},
"setGravityLow":function(d){return "defina gravidade baixa"},
"setGravityNormal":function(d){return "defina gravidade normal"},
"setGravityHigh":function(d){return "defina gravidade alta"},
"setGravityVeryHigh":function(d){return "defina gravidade muito alta"},
"setGravityTooltip":function(d){return "Define o nível da gravidade"},
"setGround":function(d){return "escolha o terreno"},
"setGroundRandom":function(d){return "defina terreno aleatório"},
"setGroundFlappy":function(d){return "defina terreno de Terra"},
"setGroundSciFi":function(d){return "defina terreno de Ficção Científica"},
"setGroundUnderwater":function(d){return "defina terreno Subaquático"},
"setGroundCave":function(d){return "defina terreno de Caverna"},
"setGroundSanta":function(d){return "defina terreno de Natal"},
"setGroundLava":function(d){return "defina terreno de Lava"},
"setGroundTooltip":function(d){return "Define a imagem do terreno"},
"setObstacle":function(d){return "escolha o obstáculo"},
"setObstacleRandom":function(d){return "escolha o obstáculo aleatoriamente"},
"setObstacleFlappy":function(d){return "escolha obstáculo Tubular"},
"setObstacleSciFi":function(d){return "escolha obstáculo de Ficção Científica"},
"setObstacleUnderwater":function(d){return "escolha obstáculo de Planta"},
"setObstacleCave":function(d){return "escolha obstáculo de Caverna"},
"setObstacleSanta":function(d){return "escolha obstáculo de Chaminé"},
"setObstacleLaser":function(d){return "escolha obstáculo de Laser"},
"setObstacleTooltip":function(d){return "Define a imagem do obstáculo"},
"setPlayer":function(d){return "escolha o jogador"},
"setPlayerRandom":function(d){return "escolha o jogador aleatoriamente"},
"setPlayerFlappy":function(d){return "escolha o Pássaro Amarelo"},
"setPlayerRedBird":function(d){return "escolha o Pássaro Vermelho"},
"setPlayerSciFi":function(d){return "escolha a Nave Espacial"},
"setPlayerUnderwater":function(d){return "escolha o Peixe"},
"setPlayerCave":function(d){return "escolha o Morcego"},
"setPlayerSanta":function(d){return "escolha o Papai Noel"},
"setPlayerShark":function(d){return "escolha o Tubarão"},
"setPlayerEaster":function(d){return "escolha o Coelhinho da Páscoa"},
"setPlayerBatman":function(d){return "escolha o Homem Morcego"},
"setPlayerSubmarine":function(d){return "escolha o Submarino"},
"setPlayerUnicorn":function(d){return "escolha o Unicórnio"},
"setPlayerFairy":function(d){return "escolha a Fada"},
"setPlayerSuperman":function(d){return "escolha o Flappyman"},
"setPlayerTurkey":function(d){return "escolha o Peru"},
"setPlayerTooltip":function(d){return "Define a imagem do(a) jogador(a)"},
"setScore":function(d){return "defina a pontuação"},
"setScoreTooltip":function(d){return "Define a pontuação do jogador"},
"setSpeed":function(d){return "defina a velocidade"},
"setSpeedTooltip":function(d){return "Define a velocidade do nível"},
"shareFlappyTwitter":function(d){return "Veja o jogo Flappy bird que eu fiz. Eu mesmo programei com a @codeorg"},
"shareGame":function(d){return "Compartilhe seu jogo:"},
"soundRandom":function(d){return "aleatório"},
"soundBounce":function(d){return "quicar"},
"soundCrunch":function(d){return "triture"},
"soundDie":function(d){return "triste"},
"soundHit":function(d){return "esmague"},
"soundPoint":function(d){return "ponto"},
"soundSwoosh":function(d){return "sussurro"},
"soundWing":function(d){return "asa"},
"soundJet":function(d){return "jato"},
"soundCrash":function(d){return "batida"},
"soundJingle":function(d){return "tinido"},
"soundSplash":function(d){return "splash"},
"soundLaser":function(d){return "laser"},
"speedRandom":function(d){return "defina a velocidade aleatoriamente"},
"speedVerySlow":function(d){return "defina velocidade muito lenta"},
"speedSlow":function(d){return "defina velocidade lenta"},
"speedNormal":function(d){return "defina velocidade normal"},
"speedFast":function(d){return "defina velocidade rápida"},
"speedVeryFast":function(d){return "defina velocidade muito rápida"},
"whenClick":function(d){return "quando clicar"},
"whenClickTooltip":function(d){return "Execute as ações abaixo quando ocorrer um clique."},
"whenCollideGround":function(d){return "quando bater no chão"},
"whenCollideGroundTooltip":function(d){return "Execute as ações abaixo quando o passarinho bater no chão."},
"whenCollideObstacle":function(d){return "quando atingir um obstáculo"},
"whenCollideObstacleTooltip":function(d){return "Execute as ações abaixo quando o passarinho atingir um obstáculo."},
"whenEnterObstacle":function(d){return "quando passar o obstáculo"},
"whenEnterObstacleTooltip":function(d){return "Execute as ações abaixo quando o passarinho atingir um obstáculo."},
"whenRunButtonClick":function(d){return "Quando o jogo começar"},
"whenRunButtonClickTooltip":function(d){return "Execute as ações abaixo quando o jogo começar."},
"yes":function(d){return "Sim"}};