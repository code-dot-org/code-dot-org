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
"continue":function(d){return "Continua"},
"doCode":function(d){return "Executar"},
"elseCode":function(d){return "senão"},
"endGame":function(d){return "terminar jogo"},
"endGameTooltip":function(d){return "Termina o jogo."},
"finalLevel":function(d){return "Parabéns! Resolveste o puzzle final."},
"flap":function(d){return "flap"},
"flapRandom":function(d){return "flap a random amount"},
"flapVerySmall":function(d){return "flap a very small amount"},
"flapSmall":function(d){return "flap a small amount"},
"flapNormal":function(d){return "flap a normal amount"},
"flapLarge":function(d){return "flap a large amount"},
"flapVeryLarge":function(d){return "flap a very large amount"},
"flapTooltip":function(d){return "Fly Flappy upwards."},
"flappySpecificFail":function(d){return "O teu código parece bem - vai agitar-se com cada clique. Mas precisas de clicar várias vezes para agitar-se até ao alvo."},
"incrementPlayerScore":function(d){return "marca um ponto"},
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
"playSoundSwoosh":function(d){return "play swoosh sound"},
"playSoundWing":function(d){return "play wing sound"},
"playSoundJet":function(d){return "play jet sound"},
"playSoundCrash":function(d){return "play crash sound"},
"playSoundJingle":function(d){return "play jingle sound"},
"playSoundSplash":function(d){return "play splash sound"},
"playSoundLaser":function(d){return "toca som laser"},
"playSoundTooltip":function(d){return "Tocar o som escolhido."},
"reinfFeedbackMsg":function(d){return "Podes selecionar o botão \"Tenta Novamente\" para voltar e jogares o teu jogo."},
"scoreText":function(d){return "Pontuação: "+appLocale.v(d,"playerScore")},
"setBackground":function(d){return "definir cena"},
"setBackgroundRandom":function(d){return "definir cena aleatória"},
"setBackgroundFlappy":function(d){return "definir cena Cidade (dia)"},
"setBackgroundNight":function(d){return "definir cena Cidade (noite)"},
"setBackgroundSciFi":function(d){return "definir cena ficção cientifica"},
"setBackgroundUnderwater":function(d){return "definir cena debaixo de água"},
"setBackgroundCave":function(d){return "definir cena Caverna"},
"setBackgroundSanta":function(d){return "definir cena Pai Natal"},
"setBackgroundTooltip":function(d){return "definir a imagem de fundo"},
"setGapRandom":function(d){return "set a random gap"},
"setGapVerySmall":function(d){return "set a very small gap"},
"setGapSmall":function(d){return "set a small gap"},
"setGapNormal":function(d){return "set a normal gap"},
"setGapLarge":function(d){return "set a large gap"},
"setGapVeryLarge":function(d){return "set a very large gap"},
"setGapHeightTooltip":function(d){return "Sets the vertical gap in an obstacle"},
"setGravityRandom":function(d){return "set gravity random"},
"setGravityVeryLow":function(d){return "set gravity very low"},
"setGravityLow":function(d){return "set gravity low"},
"setGravityNormal":function(d){return "set gravity normal"},
"setGravityHigh":function(d){return "set gravity high"},
"setGravityVeryHigh":function(d){return "set gravity very high"},
"setGravityTooltip":function(d){return "Sets the level's gravity"},
"setGround":function(d){return "set ground"},
"setGroundRandom":function(d){return "set ground Random"},
"setGroundFlappy":function(d){return "set ground Ground"},
"setGroundSciFi":function(d){return "set ground Sci-Fi"},
"setGroundUnderwater":function(d){return "set ground Underwater"},
"setGroundCave":function(d){return "set ground Cave"},
"setGroundSanta":function(d){return "set ground Santa"},
"setGroundLava":function(d){return "set ground Lava"},
"setGroundTooltip":function(d){return "Sets the ground image"},
"setObstacle":function(d){return "definir obstáculo"},
"setObstacleRandom":function(d){return "definir obstáculo aleatório"},
"setObstacleFlappy":function(d){return "definir obstáculo Cano"},
"setObstacleSciFi":function(d){return "definir obstáculo Ficção Cientifica"},
"setObstacleUnderwater":function(d){return "definir obstáculo Planta"},
"setObstacleCave":function(d){return "definir obstáculo Caverna"},
"setObstacleSanta":function(d){return "definir obstáculo Chaminé"},
"setObstacleLaser":function(d){return "definir obstáculo Lazer"},
"setObstacleTooltip":function(d){return "Sets the obstacle image"},
"setPlayer":function(d){return "set player"},
"setPlayerRandom":function(d){return "set player Random"},
"setPlayerFlappy":function(d){return "set player Yellow Bird"},
"setPlayerRedBird":function(d){return "set player Red Bird"},
"setPlayerSciFi":function(d){return "set player Spaceship"},
"setPlayerUnderwater":function(d){return "set player Fish"},
"setPlayerCave":function(d){return "set player Bat"},
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
"setScoreTooltip":function(d){return "definir pontuação do  jogador"},
"setSpeed":function(d){return "definir velocidade"},
"setSpeedTooltip":function(d){return "definir velocidade do nível"},
"shareFlappyTwitter":function(d){return "Check out the Flappy game I made. I wrote it myself with @codeorg"},
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
"soundCrash":function(d){return "crash"},
"soundJingle":function(d){return "jingle"},
"soundSplash":function(d){return "splash"},
"soundLaser":function(d){return "laser"},
"speedRandom":function(d){return "definir velocidade aleatória"},
"speedVerySlow":function(d){return "definir velocidade muito lenta"},
"speedSlow":function(d){return "definir velocidade lenta"},
"speedNormal":function(d){return "definir velocidade normal"},
"speedFast":function(d){return "definir velocidade rápida"},
"speedVeryFast":function(d){return "definir velocidade muito rápida"},
"whenClick":function(d){return "when click"},
"whenClickTooltip":function(d){return "Execute the actions below when a click event occurs."},
"whenCollideGround":function(d){return "quando bate no chão"},
"whenCollideGroundTooltip":function(d){return "Execute the actions below when Flappy hits the ground."},
"whenCollideObstacle":function(d){return "quando bate num obstáculo"},
"whenCollideObstacleTooltip":function(d){return "Execute the actions below when Flappy hits an obstacle."},
"whenEnterObstacle":function(d){return "quando passa um obstáculo"},
"whenEnterObstacleTooltip":function(d){return "Execute the actions below when Flappy enters an obstacle."},
"whenRunButtonClick":function(d){return "quando o jogo começa"},
"whenRunButtonClickTooltip":function(d){return "Executa as ações abaixo quando o jogo começar."},
"yes":function(d){return "Sim"}};