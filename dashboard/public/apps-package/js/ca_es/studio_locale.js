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
"actor":function(d){return "actor"},
"alienInvasion":function(d){return "Invasió alienígena!"},
"backgroundBlack":function(d){return "negre"},
"backgroundCave":function(d){return "cova"},
"backgroundCloudy":function(d){return "ennuvolat"},
"backgroundHardcourt":function(d){return "pista dura"},
"backgroundNight":function(d){return "nit"},
"backgroundUnderwater":function(d){return "sota l'aigua"},
"backgroundCity":function(d){return "ciutat"},
"backgroundDesert":function(d){return "desert"},
"backgroundRainbow":function(d){return "Arc de Sant Martí"},
"backgroundSoccer":function(d){return "futbol"},
"backgroundSpace":function(d){return "espai"},
"backgroundTennis":function(d){return "Tennis"},
"backgroundWinter":function(d){return "l'hivern"},
"catActions":function(d){return "Accions"},
"catControl":function(d){return "Bucles"},
"catEvents":function(d){return "Esdeveniments"},
"catLogic":function(d){return "Lògic"},
"catMath":function(d){return "Matemàtiques"},
"catProcedures":function(d){return "Funcions"},
"catText":function(d){return "text"},
"catVariables":function(d){return "Variables"},
"changeScoreTooltip":function(d){return "Afegir o treure un punt al marcador."},
"changeScoreTooltipK1":function(d){return "Afegir un punt al marcador."},
"continue":function(d){return "Continuar"},
"decrementPlayerScore":function(d){return "treure un punt"},
"defaultSayText":function(d){return "Escriviu aquí"},
"emotion":function(d){return "estat d'ànim"},
"finalLevel":function(d){return "Felicitats! Has resolt el puzzle final."},
"for":function(d){return "per a"},
"hello":function(d){return "hola"},
"helloWorld":function(d){return "Hola món!"},
"incrementPlayerScore":function(d){return "punt"},
"makeProjectileDisappear":function(d){return "desaparèixer"},
"makeProjectileBounce":function(d){return "bota"},
"makeProjectileBlueFireball":function(d){return "fer bola de foc blava"},
"makeProjectilePurpleFireball":function(d){return "fer bola de foc porpra"},
"makeProjectileRedFireball":function(d){return "fer bola de foc vermella"},
"makeProjectileYellowHearts":function(d){return "fer cors grocs"},
"makeProjectilePurpleHearts":function(d){return "fer cors porpres"},
"makeProjectileRedHearts":function(d){return "fer cors vermells"},
"makeProjectileTooltip":function(d){return "Fer que el projectil que acaba de xocar desaparegui o reboti."},
"makeYourOwn":function(d){return "Fer el seu propi joc Lab App"},
"moveDirectionDown":function(d){return "avall"},
"moveDirectionLeft":function(d){return "esquerra"},
"moveDirectionRight":function(d){return "dret"},
"moveDirectionUp":function(d){return "cap amunt"},
"moveDirectionRandom":function(d){return "atzar"},
"moveDistance25":function(d){return "25 píxels"},
"moveDistance50":function(d){return "50 píxels"},
"moveDistance100":function(d){return "100 píxels"},
"moveDistance200":function(d){return "200 píxels"},
"moveDistance400":function(d){return "400 píxels"},
"moveDistancePixels":function(d){return "píxels"},
"moveDistanceRandom":function(d){return "píxels a l'atzar"},
"moveDistanceTooltip":function(d){return "Moure un actor d'una distància concreta a la direcció especificada."},
"moveSprite":function(d){return "moure's"},
"moveSpriteN":function(d){return "moure actor "+appLocale.v(d,"spriteIndex")},
"toXY":function(d){return "to x,y"},
"moveDown":function(d){return "Desplaça avall"},
"moveDownTooltip":function(d){return "Mou un actor avall."},
"moveLeft":function(d){return "desplaça a l'esquerra"},
"moveLeftTooltip":function(d){return "Moure un actor a l'esquerra."},
"moveRight":function(d){return "Desplaça a la dreta"},
"moveRightTooltip":function(d){return "Moure un actor a la dreta."},
"moveUp":function(d){return "Desplaça amunt"},
"moveUpTooltip":function(d){return "Mou un actor amunt."},
"moveTooltip":function(d){return "Moure un actor."},
"nextLevel":function(d){return "Felicitats! Has complert aquest puzzle."},
"no":function(d){return "No"},
"numBlocksNeeded":function(d){return "Aquest puzzle pot res resolt amb blocs de %1."},
"onEventTooltip":function(d){return "Execute code in response to the specified event."},
"ouchExclamation":function(d){return "Ai!"},
"playSoundCrunch":function(d){return "reprodueix so de cruixit"},
"playSoundGoal1":function(d){return "Reprodueix so d'objectiu 1"},
"playSoundGoal2":function(d){return "Reprodueix so d'objectiu 2"},
"playSoundHit":function(d){return "Reprodueix so de xoc"},
"playSoundLosePoint":function(d){return "reprodueix so de pèrdua de punt"},
"playSoundLosePoint2":function(d){return "reprodueix so de pèrdua de punt 2"},
"playSoundRetro":function(d){return "reprodueix so retro"},
"playSoundRubber":function(d){return "reprodueix el so de goma"},
"playSoundSlap":function(d){return "reprodueix so de bufetada"},
"playSoundTooltip":function(d){return "reprodueix so de l'elegit."},
"playSoundWinPoint":function(d){return "reprodueix so de punt de victòria"},
"playSoundWinPoint2":function(d){return "reprodueix so de punt de victòria 2"},
"playSoundWood":function(d){return "reprodueix so de fusta"},
"positionOutTopLeft":function(d){return "a la part superior damunt posició d'esquerra"},
"positionOutTopRight":function(d){return "a la posició dreta dalt"},
"positionTopOutLeft":function(d){return "a la part superior fora posició esquerra"},
"positionTopLeft":function(d){return "a la part superior esquerra"},
"positionTopCenter":function(d){return "a la posició superior centre"},
"positionTopRight":function(d){return "a la part superior dreta"},
"positionTopOutRight":function(d){return "a la part superior de fora posició dreta"},
"positionMiddleLeft":function(d){return "a la part central esquerra"},
"positionMiddleCenter":function(d){return "a la posició de mig centre"},
"positionMiddleRight":function(d){return "a la part central dreta"},
"positionBottomOutLeft":function(d){return "al fons fora posició esquerra"},
"positionBottomLeft":function(d){return "a la posició inferior esquerra"},
"positionBottomCenter":function(d){return "a la posició inferior centre"},
"positionBottomRight":function(d){return "a la posició inferior dreta"},
"positionBottomOutRight":function(d){return "al fons fora posició dreta"},
"positionOutBottomLeft":function(d){return "a la següent posició esquerra inferior"},
"positionOutBottomRight":function(d){return "a la següent posició dreta inferior"},
"positionRandom":function(d){return "a la posició aleatòria"},
"projectileBlueFireball":function(d){return "bola de foc blava"},
"projectilePurpleFireball":function(d){return "bola de foc porpra"},
"projectileRedFireball":function(d){return "bola de foc vermella"},
"projectileYellowHearts":function(d){return "cors grocs"},
"projectilePurpleHearts":function(d){return "cors porpres"},
"projectileRedHearts":function(d){return "cors vermells"},
"projectileRandom":function(d){return "atzar"},
"projectileAnna":function(d){return "Anna"},
"projectileElsa":function(d){return "Elsa"},
"projectileHiro":function(d){return "Hiro"},
"projectileBaymax":function(d){return "Baymax"},
"projectileRapunzel":function(d){return "Rapunzel"},
"projectileCherry":function(d){return "cherry"},
"projectileIce":function(d){return "ice"},
"projectileDuck":function(d){return "duck"},
"reinfFeedbackMsg":function(d){return "Podeu prémer el botó \"Torna-ho a provar\" per tornar a jugar la teva història."},
"repeatForever":function(d){return "repetir per sempre"},
"repeatDo":function(d){return "fer"},
"repeatForeverTooltip":function(d){return "Executar les accions en aquest bloc repetidament mentre que la història s'està executant."},
"saySprite":function(d){return "dir"},
"saySpriteN":function(d){return "actor"+appLocale.v(d,"spriteIndex")+"diu"},
"saySpriteTooltip":function(d){return "Fer aparèixer una bombolla de diàleg amb el text associat a l'actor concret."},
"saySpriteChoices_0":function(d){return "Hi there."},
"saySpriteChoices_1":function(d){return "Hi there!"},
"saySpriteChoices_2":function(d){return "How are you?"},
"saySpriteChoices_3":function(d){return "This is fun..."},
"saySpriteChoices_4":function(d){return "Good afternoon"},
"saySpriteChoices_5":function(d){return "Good night"},
"saySpriteChoices_6":function(d){return "Good evening"},
"saySpriteChoices_7":function(d){return "What’s new?"},
"saySpriteChoices_8":function(d){return "What?"},
"saySpriteChoices_9":function(d){return "Where?"},
"saySpriteChoices_10":function(d){return "When?"},
"saySpriteChoices_11":function(d){return "Good."},
"saySpriteChoices_12":function(d){return "Great!"},
"saySpriteChoices_13":function(d){return "All right."},
"saySpriteChoices_14":function(d){return "Not bad."},
"saySpriteChoices_15":function(d){return "Good luck."},
"saySpriteChoices_16":function(d){return "Sí"},
"saySpriteChoices_17":function(d){return "No"},
"saySpriteChoices_18":function(d){return "Okay"},
"saySpriteChoices_19":function(d){return "Nice throw!"},
"saySpriteChoices_20":function(d){return "Have a nice day."},
"saySpriteChoices_21":function(d){return "Bye."},
"saySpriteChoices_22":function(d){return "I’ll be right back."},
"saySpriteChoices_23":function(d){return "See you tomorrow!"},
"saySpriteChoices_24":function(d){return "See you later!"},
"saySpriteChoices_25":function(d){return "Take care!"},
"saySpriteChoices_26":function(d){return "Enjoy!"},
"saySpriteChoices_27":function(d){return "I have to go."},
"saySpriteChoices_28":function(d){return "Want to be friends?"},
"saySpriteChoices_29":function(d){return "Great job!"},
"saySpriteChoices_30":function(d){return "Woo hoo!"},
"saySpriteChoices_31":function(d){return "Yay!"},
"saySpriteChoices_32":function(d){return "Nice to meet you."},
"saySpriteChoices_33":function(d){return "All right!"},
"saySpriteChoices_34":function(d){return "Thank you"},
"saySpriteChoices_35":function(d){return "No, thank you"},
"saySpriteChoices_36":function(d){return "Aaaaaah!"},
"saySpriteChoices_37":function(d){return "Never mind"},
"saySpriteChoices_38":function(d){return "Today"},
"saySpriteChoices_39":function(d){return "Tomorrow"},
"saySpriteChoices_40":function(d){return "Yesterday"},
"saySpriteChoices_41":function(d){return "I found you!"},
"saySpriteChoices_42":function(d){return "You found me!"},
"saySpriteChoices_43":function(d){return "10, 9, 8, 7, 6, 5, 4, 3, 2, 1!"},
"saySpriteChoices_44":function(d){return "You are great!"},
"saySpriteChoices_45":function(d){return "You are funny!"},
"saySpriteChoices_46":function(d){return "You are silly! "},
"saySpriteChoices_47":function(d){return "You are a good friend!"},
"saySpriteChoices_48":function(d){return "Watch out!"},
"saySpriteChoices_49":function(d){return "Duck!"},
"saySpriteChoices_50":function(d){return "Gotcha!"},
"saySpriteChoices_51":function(d){return "Ow!"},
"saySpriteChoices_52":function(d){return "Sorry!"},
"saySpriteChoices_53":function(d){return "Careful!"},
"saySpriteChoices_54":function(d){return "Whoa!"},
"saySpriteChoices_55":function(d){return "Oops!"},
"saySpriteChoices_56":function(d){return "You almost got me!"},
"saySpriteChoices_57":function(d){return "Nice try!"},
"saySpriteChoices_58":function(d){return "You can’t catch me!"},
"scoreText":function(d){return "Puntuació: "+appLocale.v(d,"playerScore")},
"setBackground":function(d){return "Estableix fons"},
"setBackgroundRandom":function(d){return "Estableix un fons a l'atzar"},
"setBackgroundBlack":function(d){return "Estableix un fons negre"},
"setBackgroundCave":function(d){return "Estableix un fons de cova"},
"setBackgroundCloudy":function(d){return "Estableix un fons ennuvolat"},
"setBackgroundHardcourt":function(d){return "Estableix un fons de pista dura"},
"setBackgroundNight":function(d){return "Estableix un fons de nit"},
"setBackgroundUnderwater":function(d){return "Estableix un fons marítim"},
"setBackgroundCity":function(d){return "Estableix un fons de ciutat"},
"setBackgroundDesert":function(d){return "Estableix un fons de desert"},
"setBackgroundRainbow":function(d){return "Estableix un fons d'arc de Sant Martï"},
"setBackgroundSoccer":function(d){return "Estableix un fons de futbol"},
"setBackgroundSpace":function(d){return "Estableix un fons de l'espai"},
"setBackgroundTennis":function(d){return "Estableix un fons de tennis"},
"setBackgroundWinter":function(d){return "Estableix un fons d'hivern"},
"setBackgroundLeafy":function(d){return "set leafy background"},
"setBackgroundGrassy":function(d){return "set grassy background"},
"setBackgroundFlower":function(d){return "set flower background"},
"setBackgroundTile":function(d){return "set tile background"},
"setBackgroundIcy":function(d){return "set icy background"},
"setBackgroundSnowy":function(d){return "set snowy background"},
"setBackgroundTooltip":function(d){return "Estableix l'imatge de l'escena"},
"setEnemySpeed":function(d){return "Estableix velocitat de l'enemic"},
"setPlayerSpeed":function(d){return "Estableix velocitat jugador"},
"setScoreText":function(d){return "assigna la puntuació"},
"setScoreTextTooltip":function(d){return "Estableix el text que es mostrarà a la zona de puntuació."},
"setSpriteEmotionAngry":function(d){return "a un estat d'ànim enfadat"},
"setSpriteEmotionHappy":function(d){return "a un estat d'ànim feliç"},
"setSpriteEmotionNormal":function(d){return "a un estat d'ànim normal"},
"setSpriteEmotionRandom":function(d){return "a un estat d'ànim aleatori"},
"setSpriteEmotionSad":function(d){return "a un estat d'ànim trist"},
"setSpriteEmotionTooltip":function(d){return "Estableix l'estat d'ànim de l'actor"},
"setSpriteAlien":function(d){return "a una imatge d'alien"},
"setSpriteBat":function(d){return "a una imatge de ratpenat"},
"setSpriteBird":function(d){return "a una imatge d'ocell"},
"setSpriteCat":function(d){return "a una imatge de gat"},
"setSpriteCaveBoy":function(d){return "a una imatge de noi cavernícola"},
"setSpriteCaveGirl":function(d){return "a una imatge de noia cavernícola"},
"setSpriteDinosaur":function(d){return "a una imatge de dinosaure"},
"setSpriteDog":function(d){return "a una imatge de gos"},
"setSpriteDragon":function(d){return "a una imatge de drac"},
"setSpriteGhost":function(d){return "a una imatge de fantasma"},
"setSpriteHidden":function(d){return "a una imatge oculta"},
"setSpriteHideK1":function(d){return "amaga"},
"setSpriteAnna":function(d){return "a una imatge d'Anna"},
"setSpriteElsa":function(d){return "a una imatge d'Elsa"},
"setSpriteHiro":function(d){return "a una imatge Hiro"},
"setSpriteBaymax":function(d){return "a una imatge Baymax"},
"setSpriteRapunzel":function(d){return "a una imatge Rapunzel"},
"setSpriteKnight":function(d){return "a una imatge de cavaller"},
"setSpriteMonster":function(d){return "a una imatge de monstre"},
"setSpriteNinja":function(d){return "a una imatge de ninja emmascarat"},
"setSpriteOctopus":function(d){return "a una imatge de pop"},
"setSpritePenguin":function(d){return "a una imatge de pingüí"},
"setSpritePirate":function(d){return "a una imatge de Pirata"},
"setSpritePrincess":function(d){return "a una imatge de princesa"},
"setSpriteRandom":function(d){return "a una imatge aleatòria"},
"setSpriteRobot":function(d){return "a una imatge de robot"},
"setSpriteShowK1":function(d){return "Mostra"},
"setSpriteSpacebot":function(d){return "a una imatge de robot de l'espai"},
"setSpriteSoccerGirl":function(d){return "a una imatge de noia futbolista"},
"setSpriteSoccerBoy":function(d){return "a una imatge de noi futbolista"},
"setSpriteSquirrel":function(d){return "a una imatge d'esquirol"},
"setSpriteTennisGirl":function(d){return "a una imatge de noia tennista"},
"setSpriteTennisBoy":function(d){return "a una imatge de noi tennista"},
"setSpriteUnicorn":function(d){return "a una imatge d'unicorn"},
"setSpriteWitch":function(d){return "a una imatge de bruixa"},
"setSpriteWizard":function(d){return "a una imatge de mag"},
"setSpritePositionTooltip":function(d){return "Instantàniament mou un actor a la ubicació especificada."},
"setSpriteK1Tooltip":function(d){return "Mostra o amaga l'actor especificat."},
"setSpriteTooltip":function(d){return "Estableix la imatge d'actor"},
"setSpriteSizeRandom":function(d){return "a una mida aleatòria"},
"setSpriteSizeVerySmall":function(d){return "a una mida molt petita"},
"setSpriteSizeSmall":function(d){return "a una mida petita"},
"setSpriteSizeNormal":function(d){return "a una mida normal"},
"setSpriteSizeLarge":function(d){return "a una mida gran"},
"setSpriteSizeVeryLarge":function(d){return "a una mida molt gran"},
"setSpriteSizeTooltip":function(d){return "Defineix la mida d'un actor"},
"setSpriteSpeedRandom":function(d){return "a una velocitat a l'atzar"},
"setSpriteSpeedVerySlow":function(d){return "a una velocitat molt lenta"},
"setSpriteSpeedSlow":function(d){return "a una velocitat lenta"},
"setSpriteSpeedNormal":function(d){return "a una velocitat normal"},
"setSpriteSpeedFast":function(d){return "a una velocitat ràpida"},
"setSpriteSpeedVeryFast":function(d){return "a una velocitat molt ràpida"},
"setSpriteSpeedTooltip":function(d){return "Estableix la velocitat d'actor"},
"setSpriteZombie":function(d){return "a una imatge zombie"},
"shareStudioTwitter":function(d){return "Fes una ullada a la història que vaig fer. Vaig escriure jo amb @codeorg"},
"shareGame":function(d){return "Comparteix la teva història:"},
"showCoordinates":function(d){return "Mostra les coordenades"},
"showCoordinatesTooltip":function(d){return "mostrar les coordenades del protagonista a la pantalla"},
"showTitleScreen":function(d){return "mostrar la pantalla de títol"},
"showTitleScreenTitle":function(d){return "Títol"},
"showTitleScreenText":function(d){return "text"},
"showTSDefTitle":function(d){return "escriu el títol aquí"},
"showTSDefText":function(d){return "escriu el text aquí"},
"showTitleScreenTooltip":function(d){return "Mostra una pantalla de títol amb el títol associat i text."},
"size":function(d){return "mida"},
"setSprite":function(d){return "estableix"},
"setSpriteN":function(d){return "estableix l'actor"+appLocale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "cruixit"},
"soundGoal1":function(d){return "objectiu 1"},
"soundGoal2":function(d){return "objectiu 2"},
"soundHit":function(d){return "colpejar"},
"soundLosePoint":function(d){return "perdre el punt"},
"soundLosePoint2":function(d){return "perdre el punt 2"},
"soundRetro":function(d){return "retro"},
"soundRubber":function(d){return "goma"},
"soundSlap":function(d){return "bufetada"},
"soundWinPoint":function(d){return "guanyar el punt"},
"soundWinPoint2":function(d){return "guanyar el punt 2"},
"soundWood":function(d){return "fusta"},
"speed":function(d){return "velocitat"},
"startSetValue":function(d){return "start (rocket-height function)"},
"startSetVars":function(d){return "game_vars (title, subtitle, background, target, danger, player)"},
"startSetFuncs":function(d){return "game_funcs (update-target, update-danger, update-player, collide?, on-screen?)"},
"stopSprite":function(d){return "atura"},
"stopSpriteN":function(d){return "atura actor"+appLocale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Atura el moviment d'un actor."},
"throwSprite":function(d){return "llança"},
"throwSpriteN":function(d){return "actor"+appLocale.v(d,"spriteIndex")+"llança"},
"throwTooltip":function(d){return "Llança un projectil de l'actor especificat."},
"vanish":function(d){return "desapareix"},
"vanishActorN":function(d){return "desapareix l'actor "+appLocale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "Desapareix l'actor."},
"waitFor":function(d){return "esperar que"},
"waitSeconds":function(d){return "segons"},
"waitForClick":function(d){return "espera al clic"},
"waitForRandom":function(d){return "espera a l'atzar"},
"waitForHalfSecond":function(d){return "espera durant mig segon"},
"waitFor1Second":function(d){return "esperar 1 segon"},
"waitFor2Seconds":function(d){return "esperar 2 segons"},
"waitFor5Seconds":function(d){return "esperar 5 segons"},
"waitFor10Seconds":function(d){return "Espereu 10 segons"},
"waitParamsTooltip":function(d){return "Espera per a un nombre concret de segons o utilitza el zero per esperar fins que es produeixi un clic."},
"waitTooltip":function(d){return "Espera una quantitat específica de temps o fins que es produeix un clic."},
"whenArrowDown":function(d){return "fletxa cap avall"},
"whenArrowLeft":function(d){return "fletxa esquerra"},
"whenArrowRight":function(d){return "fletxa dreta"},
"whenArrowUp":function(d){return "fletxa cap amunt"},
"whenArrowTooltip":function(d){return "Executar les accions sota quan es prem la tecla de fletxa especificat."},
"whenDown":function(d){return "quan tecla cap avall"},
"whenDownTooltip":function(d){return "Executar les accions de sota quan es premi la tecla cap avall."},
"whenGameStarts":function(d){return "Quan comença la història"},
"whenGameStartsTooltip":function(d){return "Executar les accions de sota quan comença la història."},
"whenLeft":function(d){return "Quan tecla a l'esquerra"},
"whenLeftTooltip":function(d){return "Executar les accions  de sota quan es premi la tecla a l'esquerra."},
"whenRight":function(d){return "quan tecla a la dreta"},
"whenRightTooltip":function(d){return "Executar les accions de sota quan es premi la tecla a la dreta."},
"whenSpriteClicked":function(d){return "Quan fa clic a actor"},
"whenSpriteClickedN":function(d){return "Quan fa clic a actor "+appLocale.v(d,"spriteIndex")},
"whenSpriteClickedTooltip":function(d){return "Executar les accions de sota quan es fa clic a un actor."},
"whenSpriteCollidedN":function(d){return "Quan l'actor "+appLocale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "Executar les accions de sota quan un actor toca un altre actor."},
"whenSpriteCollidedWith":function(d){return "toca"},
"whenSpriteCollidedWithAnyActor":function(d){return "toca qualsevol actor"},
"whenSpriteCollidedWithAnyEdge":function(d){return "toca qualsevol vora"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "toca qualsevol projectil"},
"whenSpriteCollidedWithAnything":function(d){return "toca qualsevol cosa"},
"whenSpriteCollidedWithN":function(d){return "toca actor "+appLocale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "toca la bola de foc blava"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "toca la bola de foc porpra"},
"whenSpriteCollidedWithRedFireball":function(d){return "toca la bola de foc vermella"},
"whenSpriteCollidedWithYellowHearts":function(d){return "toca els cors grocs"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "toca els cors porpres"},
"whenSpriteCollidedWithRedHearts":function(d){return "toca els cors vermells"},
"whenSpriteCollidedWithBottomEdge":function(d){return "toca la vora inferior"},
"whenSpriteCollidedWithLeftEdge":function(d){return "toca la vora esquerra"},
"whenSpriteCollidedWithRightEdge":function(d){return "toca la vora dreta"},
"whenSpriteCollidedWithTopEdge":function(d){return "toca la vora superior"},
"whenUp":function(d){return "Quan tecla cap amunt"},
"whenUpTooltip":function(d){return "Executar les accions de sota quan es premi la tecla cap amunt."},
"yes":function(d){return "Sí"}};