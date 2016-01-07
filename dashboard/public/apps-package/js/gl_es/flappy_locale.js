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
"doCode":function(d){return "faga"},
"elseCode":function(d){return "se non"},
"endGame":function(d){return "fin de Xogo"},
"endGameTooltip":function(d){return "Termina o Xogo."},
"finalLevel":function(d){return "Parabéns! Vostede resolveu o último desafío."},
"flap":function(d){return "bata ás"},
"flapRandom":function(d){return "bata ás de forma aleatoria"},
"flapVerySmall":function(d){return "bata ás pouquísimas veces"},
"flapSmall":function(d){return "bata ás poucas veces"},
"flapNormal":function(d){return "bata ás normalmente"},
"flapLarge":function(d){return "bata ás moitas veces"},
"flapVeryLarge":function(d){return "bata ás muitísimas veces"},
"flapTooltip":function(d){return "faga que o paxariño voe."},
"flappySpecificFail":function(d){return "O seu código parece bon - baterá as ás con cada clic. Pero precisa clicar moitas veces para bater as ás para o obxectivo."},
"incrementPlayerScore":function(d){return "marque un punto"},
"incrementPlayerScoreTooltip":function(d){return "Engade un punto a puntuación actual do xugador."},
"nextLevel":function(d){return "Parabéns! Vostede completou o desafío."},
"no":function(d){return "Non"},
"numBlocksNeeded":function(d){return "Este desafío pode ser resolvido com %1 bloques."},
"playSoundRandom":function(d){return "reproduza son aleatorio"},
"playSoundBounce":function(d){return "reproduza son de bola chimpando"},
"playSoundCrunch":function(d){return "reproduce o son de triscar"},
"playSoundDie":function(d){return "reproduza son triste"},
"playSoundHit":function(d){return "reproduza son de esmagamento"},
"playSoundPoint":function(d){return "reproduza son de puntuación"},
"playSoundSwoosh":function(d){return "reproduza son de vento encanado"},
"playSoundWing":function(d){return "reproduza son de ás batendo"},
"playSoundJet":function(d){return "reproduza son de chorro"},
"playSoundCrash":function(d){return "reproduza son de batida"},
"playSoundJingle":function(d){return "reproduza son de chocallo"},
"playSoundSplash":function(d){return "reproduza son de auga"},
"playSoundLaser":function(d){return "reproduza son de laser"},
"playSoundTooltip":function(d){return "Reproduce o son escollido."},
"reinfFeedbackMsg":function(d){return "Pode presionar o botón de \"Tentar novamente\" para voltar a xogar o seu xogo."},
"scoreText":function(d){return "Pontuación: "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "escolla o escenario"},
"setBackgroundRandom":function(d){return "escolla un escenario aleatoriamente"},
"setBackgroundFlappy":function(d){return "escolla o escenario Cidade (día)"},
"setBackgroundNight":function(d){return "escolla o escenario Cidade (noite)"},
"setBackgroundSciFi":function(d){return "escolla o escenario de Fición Científica"},
"setBackgroundUnderwater":function(d){return "escolla o escenario Subaquático"},
"setBackgroundCave":function(d){return "escolla o escenario Caverna"},
"setBackgroundSanta":function(d){return "escolla o escenario de Nadal"},
"setBackgroundTooltip":function(d){return "Define a imagen de fundo"},
"setGapRandom":function(d){return "escolla unha abertura de tamaño aleatorio"},
"setGapVerySmall":function(d){return "escolla unha abertura ben pequena"},
"setGapSmall":function(d){return "escolla unha abertura pequena"},
"setGapNormal":function(d){return "escolla unha abertura de tamaño normal"},
"setGapLarge":function(d){return "escolla unha abertura grande"},
"setGapVeryLarge":function(d){return "escolla unha abertura moito grande"},
"setGapHeightTooltip":function(d){return "Define a abertura vertical nun obstáculo"},
"setGravityRandom":function(d){return "defina gravidade aleatoriamente"},
"setGravityVeryLow":function(d){return "defina gravidade moi baixa"},
"setGravityLow":function(d){return "defina gravidade baixa"},
"setGravityNormal":function(d){return "defina gravidade normal"},
"setGravityHigh":function(d){return "defina gravidade alta"},
"setGravityVeryHigh":function(d){return "defina gravidade moi alta"},
"setGravityTooltip":function(d){return "Define o nivel da gravidade"},
"setGround":function(d){return "escolla o terreno"},
"setGroundRandom":function(d){return "defina terreno aleatorio"},
"setGroundFlappy":function(d){return "defina terreno de Terra"},
"setGroundSciFi":function(d){return "defina terreno de Fición Científica"},
"setGroundUnderwater":function(d){return "defina terreno Subaquático"},
"setGroundCave":function(d){return "defina terreno de Caverna"},
"setGroundSanta":function(d){return "defina terreno de Nadal"},
"setGroundLava":function(d){return "defina terreno de Lava"},
"setGroundTooltip":function(d){return "Define a imaxe do terreno"},
"setObstacle":function(d){return "escolla o obstáculo"},
"setObstacleRandom":function(d){return "escolla o obstáculo aleatoriamente"},
"setObstacleFlappy":function(d){return "escolla obstáculo Tubular"},
"setObstacleSciFi":function(d){return "escolla obstáculo de Fición Científica"},
"setObstacleUnderwater":function(d){return "escolla obstáculo de Planta"},
"setObstacleCave":function(d){return "escolla obstáculo de Caverna"},
"setObstacleSanta":function(d){return "escolla obstáculo de Cheminea"},
"setObstacleLaser":function(d){return "escolla obstáculo de Laser"},
"setObstacleTooltip":function(d){return "Define a imaxe do obstáculo"},
"setPlayer":function(d){return "escolla o xogador"},
"setPlayerRandom":function(d){return "escolla o xogador aleatoriamente"},
"setPlayerFlappy":function(d){return "escolla o Paxaro Amarelo"},
"setPlayerRedBird":function(d){return "escolla o Paxaro Vermelho"},
"setPlayerSciFi":function(d){return "escolla a Nave Espacial"},
"setPlayerUnderwater":function(d){return "escolla o Peixe"},
"setPlayerCave":function(d){return "escolla o Morcego"},
"setPlayerSanta":function(d){return "escolla o Papa Noel"},
"setPlayerShark":function(d){return "escolla o Tubarón"},
"setPlayerEaster":function(d){return "escolla o Coelliño da Páscoa"},
"setPlayerBatman":function(d){return "escolla o Homem Morcego"},
"setPlayerSubmarine":function(d){return "escolla o Submarino"},
"setPlayerUnicorn":function(d){return "escolla o Unicornio"},
"setPlayerFairy":function(d){return "escolla a Fada"},
"setPlayerSuperman":function(d){return "escolla o Flappyman"},
"setPlayerTurkey":function(d){return "escolla o Pavo"},
"setPlayerTooltip":function(d){return "Define a imaxe do(a) xogador(a)"},
"setScore":function(d){return "defina a puntuación"},
"setScoreTooltip":function(d){return "Define a puntuación do xogador"},
"setSpeed":function(d){return "defina a velocidade"},
"setSpeedTooltip":function(d){return "Define a velocidade do nivel"},
"shareFlappyTwitter":function(d){return "Vexa o xogo Flappy bird que eu fixen. Eu mesmo programei coa @codeorg"},
"shareGame":function(d){return "Comparta o seu xogo:"},
"soundRandom":function(d){return "aleatorio"},
"soundBounce":function(d){return "rebotar"},
"soundCrunch":function(d){return "triture"},
"soundDie":function(d){return "triste"},
"soundHit":function(d){return "esmague"},
"soundPoint":function(d){return "punto"},
"soundSwoosh":function(d){return "susurro"},
"soundWing":function(d){return "á"},
"soundJet":function(d){return "chorro"},
"soundCrash":function(d){return "batida"},
"soundJingle":function(d){return "tinido"},
"soundSplash":function(d){return "splash"},
"soundLaser":function(d){return "laser"},
"speedRandom":function(d){return "defina a velocidade aleatoriamente"},
"speedVerySlow":function(d){return "defina velocidade moito lenta"},
"speedSlow":function(d){return "defina velocidade lenta"},
"speedNormal":function(d){return "defina velocidade normal"},
"speedFast":function(d){return "defina velocidade rápida"},
"speedVeryFast":function(d){return "defina velocidade moito rápida"},
"whenClick":function(d){return "cando clicar"},
"whenClickTooltip":function(d){return "Execute as accións abaixo cando ocorrer un clic."},
"whenCollideGround":function(d){return "cando bata no chan"},
"whenCollideGroundTooltip":function(d){return "Execute as accións abaixo cando o paxariño bata no chan."},
"whenCollideObstacle":function(d){return "cando acade un obstáculo"},
"whenCollideObstacleTooltip":function(d){return "Execute as accións abaixo cando o paxariño acade un obstáculo."},
"whenEnterObstacle":function(d){return "cando pase o obstáculo"},
"whenEnterObstacleTooltip":function(d){return "Execute as accións abaixo cando o paxariño acade un obstáculo."},
"whenRunButtonClick":function(d){return "Cando o xogo comece"},
"whenRunButtonClickTooltip":function(d){return "Execute as accións abaixo cando o xogo comece."},
"yes":function(d){return "Si"}};