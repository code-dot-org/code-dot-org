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
"actor":function(d){return "personagem"},
"alienInvasion":function(d){return "Invasão alienígena!"},
"backgroundBlack":function(d){return "preto"},
"backgroundCave":function(d){return "caverna"},
"backgroundCloudy":function(d){return "nublado"},
"backgroundHardcourt":function(d){return "quadra esportiva"},
"backgroundNight":function(d){return "noite"},
"backgroundUnderwater":function(d){return "debaixo d'água"},
"backgroundCity":function(d){return "cidade"},
"backgroundDesert":function(d){return "deserto"},
"backgroundRainbow":function(d){return "arco-íris"},
"backgroundSoccer":function(d){return "futebol"},
"backgroundSpace":function(d){return "espaço"},
"backgroundTennis":function(d){return "tênis"},
"backgroundWinter":function(d){return "inverno"},
"catActions":function(d){return "Ações"},
"catControl":function(d){return "laços"},
"catEvents":function(d){return "Eventos"},
"catLogic":function(d){return "Lógica"},
"catMath":function(d){return "Matemática"},
"catProcedures":function(d){return "funções"},
"catText":function(d){return "Texto"},
"catVariables":function(d){return "variáveis"},
"changeScoreTooltip":function(d){return "Adiciona ou remove um ponto."},
"changeScoreTooltipK1":function(d){return "Adiciona um ponto."},
"continue":function(d){return "Continuar"},
"decrementPlayerScore":function(d){return "remova o ponto"},
"defaultSayText":function(d){return "digite aqui"},
"emotion":function(d){return "humor"},
"finalLevel":function(d){return "Parabéns! Você resolveu o desafio final."},
"for":function(d){return "para"},
"hello":function(d){return "olá"},
"helloWorld":function(d){return "Olá, mundo!"},
"incrementPlayerScore":function(d){return "marque o ponto"},
"makeProjectileDisappear":function(d){return "desapareça"},
"makeProjectileBounce":function(d){return "quique"},
"makeProjectileBlueFireball":function(d){return "crie bola de fogo azul"},
"makeProjectilePurpleFireball":function(d){return "crie bola de fogo roxa"},
"makeProjectileRedFireball":function(d){return "crie bola de fogo vermelha"},
"makeProjectileYellowHearts":function(d){return "crie corações amarelos"},
"makeProjectilePurpleHearts":function(d){return "crie corações roxos"},
"makeProjectileRedHearts":function(d){return "crie corações vermelhos"},
"makeProjectileTooltip":function(d){return "Faça o projétil que colidiu desaparecer ou quicar."},
"makeYourOwn":function(d){return "Faça seu próprio aplicativo do Laboratório"},
"moveDirectionDown":function(d){return "para baixo"},
"moveDirectionLeft":function(d){return "para esquerda"},
"moveDirectionRight":function(d){return "direita"},
"moveDirectionUp":function(d){return "cima"},
"moveDirectionRandom":function(d){return "aleatório"},
"moveDistance25":function(d){return "25 pixels"},
"moveDistance50":function(d){return "50 pixels"},
"moveDistance100":function(d){return "100 pixels"},
"moveDistance200":function(d){return "200 pixels"},
"moveDistance400":function(d){return "400 pixels"},
"moveDistancePixels":function(d){return "pixels"},
"moveDistanceRandom":function(d){return "pixels aleatórios"},
"moveDistanceTooltip":function(d){return "Move um personagem em uma distância específica na direção indicada."},
"moveSprite":function(d){return "mova"},
"moveSpriteN":function(d){return "mova o personagem "+appLocale.v(d,"spriteIndex")},
"toXY":function(d){return "para x,y"},
"moveDown":function(d){return "mova para baixo"},
"moveDownTooltip":function(d){return "Move um personagem para baixo."},
"moveLeft":function(d){return "mova à esquerda"},
"moveLeftTooltip":function(d){return "Move um personagem à esquerda."},
"moveRight":function(d){return "mova à direita"},
"moveRightTooltip":function(d){return "Move um personagem à direita."},
"moveUp":function(d){return "mova para cima"},
"moveUpTooltip":function(d){return "Move um personagem para cima."},
"moveTooltip":function(d){return "Move um personagem."},
"nextLevel":function(d){return "Parabéns! Você completou esse desafio."},
"no":function(d){return "Não"},
"numBlocksNeeded":function(d){return "Esse desafio pode ser resolvido com %1 blocos."},
"ouchExclamation":function(d){return "Ai!"},
"playSoundCrunch":function(d){return "reproduza som de trituração"},
"playSoundGoal1":function(d){return "reproduza som de objetivo alcançado 1"},
"playSoundGoal2":function(d){return "reproduza som de objetivo alcançado 2"},
"playSoundHit":function(d){return "reproduza som de pancada"},
"playSoundLosePoint":function(d){return "reproduza som de ponto perdido"},
"playSoundLosePoint2":function(d){return "reproduza som de ponto perdido 2"},
"playSoundRetro":function(d){return "reproduza som retrô"},
"playSoundRubber":function(d){return "reproduza som de borracha"},
"playSoundSlap":function(d){return "reproduza som de palmas"},
"playSoundTooltip":function(d){return "Reproduza o som escolhido."},
"playSoundWinPoint":function(d){return "fazer som de ponto ganho"},
"playSoundWinPoint2":function(d){return "reproduza som de ponto ganho 2"},
"playSoundWood":function(d){return "reproduza som de madeira"},
"positionOutTopLeft":function(d){return "para a posição superior esquerda"},
"positionOutTopRight":function(d){return "para a posição superior direita"},
"positionTopOutLeft":function(d){return "para a posição superior esquerda externa"},
"positionTopLeft":function(d){return "para a posição superior esquerda"},
"positionTopCenter":function(d){return "para a posição superior central"},
"positionTopRight":function(d){return "para a posição superior direita"},
"positionTopOutRight":function(d){return "para a posição superior direita externa"},
"positionMiddleLeft":function(d){return "para a posição central esquerda"},
"positionMiddleCenter":function(d){return "para o meio da posição central"},
"positionMiddleRight":function(d){return "para a posição central direita"},
"positionBottomOutLeft":function(d){return "para a posição inferior esquerda externa"},
"positionBottomLeft":function(d){return "para a posição inferior esquerda"},
"positionBottomCenter":function(d){return "para a posição inferior central"},
"positionBottomRight":function(d){return "para a posição inferior direita"},
"positionBottomOutRight":function(d){return "para a posição inferior direita externa"},
"positionOutBottomLeft":function(d){return "para a posição inferior esquerda"},
"positionOutBottomRight":function(d){return "para a posição inferior direita"},
"positionRandom":function(d){return "para a posição aleatória"},
"projectileBlueFireball":function(d){return "bola de fogo azul"},
"projectilePurpleFireball":function(d){return "bola de fogo roxa"},
"projectileRedFireball":function(d){return "bola de fogo vermelha"},
"projectileYellowHearts":function(d){return "corações amarelos"},
"projectilePurpleHearts":function(d){return "corações roxos"},
"projectileRedHearts":function(d){return "corações vermelhos"},
"projectileRandom":function(d){return "aleatório"},
"projectileAnna":function(d){return "gancho"},
"projectileElsa":function(d){return "centelha"},
"projectileHiro":function(d){return "microrrobôs"},
"projectileBaymax":function(d){return "foguete"},
"projectileRapunzel":function(d){return "panela"},
"projectileCherry":function(d){return "cereja"},
"projectileIce":function(d){return "gelo"},
"projectileDuck":function(d){return "pato"},
"reinfFeedbackMsg":function(d){return "Você pode clicar em \"Tente novamente\" para voltar a jogar o jogo."},
"repeatForever":function(d){return "repita infinitamente"},
"repeatDo":function(d){return "faça"},
"repeatForeverTooltip":function(d){return "Execute as ações neste bloco repetidamente enquanto a história é contada."},
"saySprite":function(d){return "diga"},
"saySpriteN":function(d){return "personagem "+appLocale.v(d,"spriteIndex")+" diz"},
"saySpriteTooltip":function(d){return "Faz surgir um balão de fala com o texto relacionado ao personagem especificada."},
"saySpriteChoices_1":function(d){return "Oi!"},
"saySpriteChoices_2":function(d){return "Como vai você?"},
"saySpriteChoices_3":function(d){return "Isso é divertido..."},
"scoreText":function(d){return "Pontuação: "+appLocale.v(d,"playerScore")},
"setBackground":function(d){return "defina o plano de fundo"},
"setBackgroundRandom":function(d){return "defina o plano de fundo aleatoriamente"},
"setBackgroundBlack":function(d){return "defina o plano de fundo preto"},
"setBackgroundCave":function(d){return "defina o plano de fundo de caverna"},
"setBackgroundCloudy":function(d){return "defina o plano de fundo de nuvens"},
"setBackgroundHardcourt":function(d){return "defina o plano de fundo de quadra esportiva"},
"setBackgroundNight":function(d){return "defina o plano de fundo de noite"},
"setBackgroundUnderwater":function(d){return "defina o plano de fundo subaquático"},
"setBackgroundCity":function(d){return "defina o plano de fundo de cidade"},
"setBackgroundDesert":function(d){return "defina o plano de fundo de deserto"},
"setBackgroundRainbow":function(d){return "defina o plano de fundo de arco-íris"},
"setBackgroundSoccer":function(d){return "defina o plano de fundo de futebol"},
"setBackgroundSpace":function(d){return "defina o plano de fundo de espaço sideral"},
"setBackgroundTennis":function(d){return "defina o plano de fundo de tênis"},
"setBackgroundWinter":function(d){return "defina o plano de fundo de inverno"},
"setBackgroundLeafy":function(d){return "defina o plano de fundo de folhas"},
"setBackgroundGrassy":function(d){return "defina o plano de fundo de grama"},
"setBackgroundFlower":function(d){return "defina o plano de fundo de flores"},
"setBackgroundTile":function(d){return "defina o plano de fundo de ladrilhos"},
"setBackgroundIcy":function(d){return "defina o plano de fundo de gelo"},
"setBackgroundSnowy":function(d){return "defina o plano de fundo de neve"},
"setBackgroundTooltip":function(d){return "Define a imagem do plano de fundo"},
"setEnemySpeed":function(d){return "definir velocidade do inimigo"},
"setPlayerSpeed":function(d){return "definir velocidade do jogador"},
"setScoreText":function(d){return "defina a pontuação"},
"setScoreTextTooltip":function(d){return "Define o texto que vai ser exibido na pontuação."},
"setSpriteEmotionAngry":function(d){return "como bravo"},
"setSpriteEmotionHappy":function(d){return "como feliz"},
"setSpriteEmotionNormal":function(d){return "como normal"},
"setSpriteEmotionRandom":function(d){return "como aleatório"},
"setSpriteEmotionSad":function(d){return "como triste"},
"setSpriteEmotionTooltip":function(d){return "Define o humor do personagem"},
"setSpriteAlien":function(d){return "como um alienígena"},
"setSpriteBat":function(d){return "para uma imagem de morcego"},
"setSpriteBird":function(d){return "para uma imagem de pássaro"},
"setSpriteCat":function(d){return "para uma imagem de gato"},
"setSpriteCaveBoy":function(d){return "para a imagem de um menino das cavernas"},
"setSpriteCaveGirl":function(d){return "para a imagem de uma menina das cavernas"},
"setSpriteDinosaur":function(d){return "para uma imagem de dinossauro"},
"setSpriteDog":function(d){return "para uma imagem de cachorro"},
"setSpriteDragon":function(d){return "para uma imagem de dragão"},
"setSpriteGhost":function(d){return "como um fantasma"},
"setSpriteHidden":function(d){return "para uma imagem oculta"},
"setSpriteHideK1":function(d){return "oculte"},
"setSpriteAnna":function(d){return "para uma imagem da Anna"},
"setSpriteElsa":function(d){return "para uma imagem da Elsa"},
"setSpriteHiro":function(d){return "para uma imagem de Hiro"},
"setSpriteBaymax":function(d){return "para uma imagem de Baymax"},
"setSpriteRapunzel":function(d){return "para uma imagem da Rapunzel"},
"setSpriteKnight":function(d){return "como um cavaleiro"},
"setSpriteMonster":function(d){return "como um monstro"},
"setSpriteNinja":function(d){return "como um ninja mascarado"},
"setSpriteOctopus":function(d){return "para uma imagem de polvo"},
"setSpritePenguin":function(d){return "para uma imagem de pinguim"},
"setSpritePirate":function(d){return "como um pirata"},
"setSpritePrincess":function(d){return "como uma princesa"},
"setSpriteRandom":function(d){return "para uma imagem aleatória"},
"setSpriteRobot":function(d){return "como um robô"},
"setSpriteShowK1":function(d){return "mostre"},
"setSpriteSpacebot":function(d){return "como um robô espacial"},
"setSpriteSoccerGirl":function(d){return "para a imagem de uma jogadora de futebol"},
"setSpriteSoccerBoy":function(d){return "para a imagem de um jogador de futebol"},
"setSpriteSquirrel":function(d){return "para uma imagem de esquilo"},
"setSpriteTennisGirl":function(d){return "para a imagem de uma jogadora de tênis"},
"setSpriteTennisBoy":function(d){return "para a imagem de um jogador de tênis"},
"setSpriteUnicorn":function(d){return "como um unicórnio"},
"setSpriteWitch":function(d){return "para uma imagem de bruxa"},
"setSpriteWizard":function(d){return "para uma imagem de mago"},
"setSpritePositionTooltip":function(d){return "Move um personagem instantaneamente para o local especificado."},
"setSpriteK1Tooltip":function(d){return "Mostra ou oculta o personagem especificado."},
"setSpriteTooltip":function(d){return "Define a imagem do personagem"},
"setSpriteSizeRandom":function(d){return "para um tamanho aleatório"},
"setSpriteSizeVerySmall":function(d){return "para um tamanho muito pequeno"},
"setSpriteSizeSmall":function(d){return "para um tamanho pequeno"},
"setSpriteSizeNormal":function(d){return "para um tamanho normal"},
"setSpriteSizeLarge":function(d){return "para um tamanho grande"},
"setSpriteSizeVeryLarge":function(d){return "para um tamanho muito grande"},
"setSpriteSizeTooltip":function(d){return "Define o tamanho de um personagem"},
"setSpriteSpeedRandom":function(d){return "para uma velocidade aleatória"},
"setSpriteSpeedVerySlow":function(d){return "para uma velocidade bem lenta"},
"setSpriteSpeedSlow":function(d){return "para uma velocidade lenta"},
"setSpriteSpeedNormal":function(d){return "para uma velocidade normal"},
"setSpriteSpeedFast":function(d){return "para uma velocidade rápida"},
"setSpriteSpeedVeryFast":function(d){return "para uma velocidade bem rápida"},
"setSpriteSpeedTooltip":function(d){return "Define a velocidade de um personagem"},
"setSpriteZombie":function(d){return "como um zumbi"},
"shareStudioTwitter":function(d){return "Dê uma na olhada na história que eu fiz. Eu mesmo a escrevi com a @codeorg"},
"shareGame":function(d){return "Compartilhe sua história:"},
"showCoordinates":function(d){return "mostrar coordenadas"},
"showCoordinatesTooltip":function(d){return "mostrar as coordenadas do protagonista na tela"},
"showTitleScreen":function(d){return "mostre a tela principal"},
"showTitleScreenTitle":function(d){return "título"},
"showTitleScreenText":function(d){return "texto"},
"showTSDefTitle":function(d){return "digite o título aqui"},
"showTSDefText":function(d){return "digite o texto aqui"},
"showTitleScreenTooltip":function(d){return "Mostrar um tela de título com o título e o texto associados."},
"size":function(d){return "tamanho"},
"setSprite":function(d){return "definir"},
"setSpriteN":function(d){return "defina o personagem "+appLocale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "triture"},
"soundGoal1":function(d){return "objetivo 1"},
"soundGoal2":function(d){return "objetivo 2"},
"soundHit":function(d){return "bata"},
"soundLosePoint":function(d){return "perder ponto"},
"soundLosePoint2":function(d){return "perder ponto 2"},
"soundRetro":function(d){return "retrô"},
"soundRubber":function(d){return "borracha"},
"soundSlap":function(d){return "tapa"},
"soundWinPoint":function(d){return "ganhar ponto"},
"soundWinPoint2":function(d){return "ganhar ponto 2"},
"soundWood":function(d){return "madeira"},
"speed":function(d){return "velocidade"},
"startSetValue":function(d){return "iniciar (função altura do foguete)"},
"startSetVars":function(d){return "game_vars (title, subtitle, background, target, danger, player)"},
"startSetFuncs":function(d){return "game_funcs (update-target, update-danger, update-player, collide?, on-screen?)"},
"stopSprite":function(d){return "pare"},
"stopSpriteN":function(d){return "pare o personagem "+appLocale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Para o movimento de um personagem."},
"throwSprite":function(d){return "lance"},
"throwSpriteN":function(d){return "personagem "+appLocale.v(d,"spriteIndex")+" lança"},
"throwTooltip":function(d){return "Lança um projétil com o personagem especificado."},
"vanish":function(d){return "desapareça"},
"vanishActorN":function(d){return "faça o personagem desaparecer "+appLocale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "Faz o personagem desaparecer."},
"waitFor":function(d){return "espere por"},
"waitSeconds":function(d){return "segundos"},
"waitForClick":function(d){return "espere pelo clique"},
"waitForRandom":function(d){return "espere aleatoriamente"},
"waitForHalfSecond":function(d){return "espere por meio segundo"},
"waitFor1Second":function(d){return "espere por 1 segundo"},
"waitFor2Seconds":function(d){return "espere por 2 segundos"},
"waitFor5Seconds":function(d){return "espere por 5 segundos"},
"waitFor10Seconds":function(d){return "espere por 10 segundos"},
"waitParamsTooltip":function(d){return "Espera por um número determinado de segundos ou usa o zero para esperar até que ocorra um clique."},
"waitTooltip":function(d){return "Espera uma determinada quantia de tempo ou até que ocorra um clique."},
"whenArrowDown":function(d){return "seta para baixo"},
"whenArrowLeft":function(d){return "seta para a esquerda"},
"whenArrowRight":function(d){return "seta para a direita"},
"whenArrowUp":function(d){return "seta para cima"},
"whenArrowTooltip":function(d){return "Execute as ações abaixo quando a tecla com a seta especificada estiver pressionada."},
"whenDown":function(d){return "quando a seta para baixo estiver pressionada"},
"whenDownTooltip":function(d){return "Execute as ações abaixo quando a tecla com a seta para baixo estiver pressionada."},
"whenGameStarts":function(d){return "quando a história começa"},
"whenGameStartsTooltip":function(d){return "Execute as ações abaixo quando a história começar."},
"whenLeft":function(d){return "quando a seta à esquerda estiver pressionada"},
"whenLeftTooltip":function(d){return "Execute as ações abaixo quando a tecla com a seta à esquerda estiver pressionada."},
"whenRight":function(d){return "quando a seta à direita estiver pressionada"},
"whenRightTooltip":function(d){return "Execute as ações abaixo quando a tecla com a seta à direita estiver pressionada."},
"whenSpriteClicked":function(d){return "quando o personagem for clicado"},
"whenSpriteClickedN":function(d){return "quando o personagem "+appLocale.v(d,"spriteIndex")+" for clicado"},
"whenSpriteClickedTooltip":function(d){return "Execute as ações abaixo quando um personagem for clicado."},
"whenSpriteCollidedN":function(d){return "quando o personagem "+appLocale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "Execute as ações abaixo quando um personagem tocar em outro personagem."},
"whenSpriteCollidedWith":function(d){return "toca"},
"whenSpriteCollidedWithAnyActor":function(d){return "toca qualquer personagem"},
"whenSpriteCollidedWithAnyEdge":function(d){return "toca qualquer borda"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "toca qualquer projétil"},
"whenSpriteCollidedWithAnything":function(d){return "toca em alguma coisa"},
"whenSpriteCollidedWithN":function(d){return "toca o personagem "+appLocale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "toca a bola de fogo azul"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "toca a bola de fogo roxa"},
"whenSpriteCollidedWithRedFireball":function(d){return "toca a bola de fogo vermelha"},
"whenSpriteCollidedWithYellowHearts":function(d){return "toca os corações amarelos"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "toca os corações roxos"},
"whenSpriteCollidedWithRedHearts":function(d){return "toca os corações vermelhos"},
"whenSpriteCollidedWithBottomEdge":function(d){return "toca a borda inferior"},
"whenSpriteCollidedWithLeftEdge":function(d){return "toca a borda esquerda"},
"whenSpriteCollidedWithRightEdge":function(d){return "toca a borda direita"},
"whenSpriteCollidedWithTopEdge":function(d){return "toca a borda superior"},
"whenUp":function(d){return "quando a seta para cima estiver pressionada"},
"whenUpTooltip":function(d){return "Execute as ações abaixo quando a tecla com a seta para cima estiver pressionada."},
"yes":function(d){return "Sim"}};