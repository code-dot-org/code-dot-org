var studio_locale = {lc:{"ar":function(n){
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
v:function(d,k){studio_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){studio_locale.c(d,k);return d[k] in p?p[d[k]]:(k=studio_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){studio_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).studio_locale = {
"actor":function(d){return "aktorea"},
"addCharacter":function(d){return "add a"},
"addCharacterTooltip":function(d){return "Add a character to the scene."},
"alienInvasion":function(d){return "Alien inbasioa!"},
"backgroundBlack":function(d){return "beltza"},
"backgroundCave":function(d){return "aitzulo"},
"backgroundCloudy":function(d){return "lainotua"},
"backgroundHardcourt":function(d){return "kantxa"},
"backgroundNight":function(d){return "gaua"},
"backgroundUnderwater":function(d){return "ur azpian"},
"backgroundCity":function(d){return "hiria"},
"backgroundDesert":function(d){return "basamortua"},
"backgroundRainbow":function(d){return "hortzadarra"},
"backgroundSoccer":function(d){return "futbola"},
"backgroundSpace":function(d){return "espazioa"},
"backgroundTennis":function(d){return "tenisa"},
"backgroundWinter":function(d){return "negua"},
"catActions":function(d){return "Ekintzak"},
"catControl":function(d){return "Itzuliak"},
"catEvents":function(d){return "Gertaerak"},
"catLogic":function(d){return "Logika"},
"catMath":function(d){return "Matematika"},
"catProcedures":function(d){return "Funtzioak"},
"catText":function(d){return "Testua"},
"catVariables":function(d){return "Aldagaiak"},
"changeScoreTooltip":function(d){return "Gehitu edo kendu puntu bat markagailuari."},
"changeScoreTooltipK1":function(d){return "Gehitu puntu bat markagailuari."},
"continue":function(d){return "Jarraitu"},
"decrementPlayerScore":function(d){return "kendu puntu bat"},
"defaultSayText":function(d){return "idatzi hemen"},
"dropletBlock_addCharacter_description":function(d){return "Add a character to the scene."},
"dropletBlock_addCharacter_param0":function(d){return "type"},
"dropletBlock_addCharacter_param0_description":function(d){return "The type of the character to be added ('random', 'man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_changeScore_description":function(d){return "Gehitu edo kendu puntu bat markagailuari."},
"dropletBlock_changeScore_param0":function(d){return "markagailua"},
"dropletBlock_changeScore_param0_description":function(d){return "The value to add to the score (negative values will reduce the score)."},
"dropletBlock_moveRight_description":function(d){return "Moves the character to the right."},
"dropletBlock_moveUp_description":function(d){return "Moves the character up."},
"dropletBlock_moveDown_description":function(d){return "Moves the character down."},
"dropletBlock_moveLeft_description":function(d){return "Moves the character left."},
"dropletBlock_moveSlow_description":function(d){return "Changes a set of characters to move slowly."},
"dropletBlock_moveSlow_param0":function(d){return "type"},
"dropletBlock_moveSlow_param0_description":function(d){return "The type of characters to be changed ('random', 'man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_moveNormal_description":function(d){return "Changes a set of characters to move at a normal speed."},
"dropletBlock_moveNormal_param0":function(d){return "type"},
"dropletBlock_moveNormal_param0_description":function(d){return "The type of characters to be changed ('random', 'man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_moveFast_description":function(d){return "Changes a set of characters to move quickly."},
"dropletBlock_moveFast_param0":function(d){return "type"},
"dropletBlock_moveFast_param0_description":function(d){return "The type of characters to be changed ('random', 'man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_playSound_description":function(d){return "Jo aukeratutako soinua."},
"dropletBlock_playSound_param0":function(d){return "sound"},
"dropletBlock_playSound_param0_description":function(d){return "The name of the sound to play."},
"dropletBlock_setBackground_description":function(d){return "Atzeko irudia ezartzen du"},
"dropletBlock_setBackground_param0":function(d){return "image"},
"dropletBlock_setBackground_param0_description":function(d){return "The name of the background theme ('background1', 'background2', or 'background3')."},
"dropletBlock_setBot_description":function(d){return "Changes the active bot."},
"dropletBlock_setBot_param0":function(d){return "irudia"},
"dropletBlock_setBot_param0_description":function(d){return "The name of the bot image ('random', 'bot1', or 'bot2')."},
"dropletBlock_setBotSpeed_description":function(d){return "Sets the bot speed."},
"dropletBlock_setBotSpeed_param0":function(d){return "abiadura"},
"dropletBlock_setBotSpeed_param0_description":function(d){return "The speed value ('random', 'slow', 'normal', or 'fast')."},
"dropletBlock_setSpriteEmotion_description":function(d){return "Ezarri aktorearen umorea"},
"dropletBlock_setSpritePosition_description":function(d){return "Toki zehatz batera aktorea berehala mugitzen du."},
"dropletBlock_setSpriteSpeed_description":function(d){return "Aktore baten abiadura ezartzen du"},
"dropletBlock_setSprite_description":function(d){return "Aktorearen irudia ezartzen du"},
"dropletBlock_setSprite_param0":function(d){return "indizea"},
"dropletBlock_setSprite_param0_description":function(d){return "The index (starting at 0) indicating which actor should change."},
"dropletBlock_setSprite_param1":function(d){return "irudia"},
"dropletBlock_setSprite_param1_description":function(d){return "The name of the actor image."},
"dropletBlock_setToChase_description":function(d){return "Changes a set of characters to chase the bot."},
"dropletBlock_setToChase_param0":function(d){return "type"},
"dropletBlock_setToChase_param0_description":function(d){return "The type of characters to be changed ('random', 'man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_setToFlee_description":function(d){return "Changes a set of characters to flee from the bot."},
"dropletBlock_setToFlee_param0":function(d){return "type"},
"dropletBlock_setToFlee_param0_description":function(d){return "The type of characters to be changed ('random', 'man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_setToRoam_description":function(d){return "Changes a set of characters to roam freely."},
"dropletBlock_setToRoam_param0":function(d){return "type"},
"dropletBlock_setToRoam_param0_description":function(d){return "The type of characters to be changed ('random', 'man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_setToStop_description":function(d){return "Changes a set of characters to stop moving."},
"dropletBlock_setToStop_param0":function(d){return "type"},
"dropletBlock_setToStop_param0_description":function(d){return "The type of characters to be changed ('random', 'man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_setMap_description":function(d){return "Changes the map in the scene."},
"dropletBlock_setMap_param0":function(d){return "name"},
"dropletBlock_setMap_param0_description":function(d){return "The name of the map ('random', 'blank', 'circle', 'circle2', 'horizontal', 'grid', or 'blobs')."},
"dropletBlock_throw_description":function(d){return "Zehaztutako aktoretik jaurtigai bat botatzen du."},
"dropletBlock_vanish_description":function(d){return "Aktorea ezabatzen du."},
"dropletBlock_whenDown_description":function(d){return "This function executes when the down button is pressed."},
"dropletBlock_whenLeft_description":function(d){return "This function executes when the left button is pressed."},
"dropletBlock_whenRight_description":function(d){return "This function executes when the right button is pressed."},
"dropletBlock_whenTouchCharacter_description":function(d){return "This function executes when the character touches any character."},
"dropletBlock_whenTouchObstacle_description":function(d){return "This function executes when the character touches any obstacle."},
"dropletBlock_whenTouchMan_description":function(d){return "This function executes when the character touches man characters."},
"dropletBlock_whenTouchPilot_description":function(d){return "This function executes when the character touches pilot characters."},
"dropletBlock_whenTouchPig_description":function(d){return "This function executes when the character touches pig characters."},
"dropletBlock_whenTouchBird_description":function(d){return "This function executes when the character touches bird characters."},
"dropletBlock_whenTouchMouse_description":function(d){return "This function executes when the character touches mouse characters."},
"dropletBlock_whenTouchRoo_description":function(d){return "This function executes when the character touches roo characters."},
"dropletBlock_whenTouchSpider_description":function(d){return "This function executes when the character touches spider characters."},
"dropletBlock_whenUp_description":function(d){return "This function executes when the up button is pressed."},
"emotion":function(d){return "umorea"},
"finalLevel":function(d){return "Zorionak! Amaierako puzlea ebatzi duzu."},
"for":function(d){return "ondorengoarekin zenbatu"},
"hello":function(d){return "kaixo"},
"helloWorld":function(d){return "Kaixo mundua!"},
"incrementPlayerScore":function(d){return "Lortutako puntuazioa"},
"itemBlueFireball":function(d){return "suzko bola urdina"},
"itemPurpleFireball":function(d){return "suzko bola morea"},
"itemRedFireball":function(d){return "suzko bola gorria"},
"itemYellowHearts":function(d){return "bihotz horiak"},
"itemPurpleHearts":function(d){return "bihotz moreak"},
"itemRedHearts":function(d){return "bihotz gorriak"},
"itemRandom":function(d){return "ausazkoa"},
"itemAnna":function(d){return "kako"},
"itemElsa":function(d){return "izpi"},
"itemHiro":function(d){return "mikrorobotak"},
"itemBaymax":function(d){return "kohete"},
"itemRapunzel":function(d){return "burruntzalia"},
"itemCherry":function(d){return "gerezia"},
"itemIce":function(d){return "izotza"},
"itemDuck":function(d){return "ahatea"},
"itemMan":function(d){return "man"},
"itemPilot":function(d){return "pilot"},
"itemPig":function(d){return "pig"},
"itemBird":function(d){return "bird"},
"itemMouse":function(d){return "mouse"},
"itemRoo":function(d){return "roo"},
"itemSpider":function(d){return "spider"},
"makeProjectileDisappear":function(d){return "desagertu"},
"makeProjectileBounce":function(d){return "errebotatu"},
"makeProjectileBlueFireball":function(d){return "sortu suzko bola urdina"},
"makeProjectilePurpleFireball":function(d){return "sortu suzko bola morea"},
"makeProjectileRedFireball":function(d){return "sortu suzko bola gorria"},
"makeProjectileYellowHearts":function(d){return "bihotz horiak egin"},
"makeProjectilePurpleHearts":function(d){return "bihotz moreak egin"},
"makeProjectileRedHearts":function(d){return "bihotz gorriak egin"},
"makeProjectileTooltip":function(d){return "Talka egin duen jaurtigaia desagertarazi edo errebotatu."},
"makeYourOwn":function(d){return "Sortu zure Play Lab aplikazioa"},
"moveDirectionDown":function(d){return "behera"},
"moveDirectionLeft":function(d){return "ezkerra"},
"moveDirectionRight":function(d){return "eskuina"},
"moveDirectionUp":function(d){return "gora"},
"moveDirectionRandom":function(d){return "ausazkoa"},
"moveDistance25":function(d){return "25 pixel"},
"moveDistance50":function(d){return "50 pixel"},
"moveDistance100":function(d){return "100 pixel"},
"moveDistance200":function(d){return "200 pixel"},
"moveDistance400":function(d){return "400 pixel"},
"moveDistancePixels":function(d){return "Pixelak"},
"moveDistanceRandom":function(d){return "ausazko pixelak"},
"moveDistanceTooltip":function(d){return "Mugitu aktorea distantzia zehatz batean eta norabide zehatzean."},
"moveSprite":function(d){return "mugitu"},
"moveSpriteN":function(d){return "aktorea mugitu "+studio_locale.v(d,"spriteIndex")},
"toXY":function(d){return "x,y ra"},
"moveDown":function(d){return "mugiru behera"},
"moveDownTooltip":function(d){return "Mugitu aktore bat behera."},
"moveLeft":function(d){return "mugitu ezkerrera"},
"moveLeftTooltip":function(d){return "mugitu aktore bat ezkerrera."},
"moveRight":function(d){return "mugitu eskuinera"},
"moveRightTooltip":function(d){return "Mugitu aktore bat eskuinera."},
"moveUp":function(d){return "Mugitu gora"},
"moveUpTooltip":function(d){return "Mugitu aktore bat gora."},
"moveTooltip":function(d){return "Mugitu aktore bat."},
"nextLevel":function(d){return "Zorionak! Puzle hau osatu duzu."},
"no":function(d){return "Ez"},
"numBlocksNeeded":function(d){return "Puzle hau %1 blokeekin ebaz daiteke."},
"onEventTooltip":function(d){return "Kodea exekutatu zehaztutako gertaerari erantzunez."},
"ouchExclamation":function(d){return "Ai!"},
"playSoundCrunch":function(d){return "jo karraska soinua"},
"playSoundGoal1":function(d){return "jo 1 gol soinua"},
"playSoundGoal2":function(d){return "jo 2 gol soinua"},
"playSoundHit":function(d){return "jo kolpe soinua"},
"playSoundLosePoint":function(d){return "jo galdutako puntuaren soinua"},
"playSoundLosePoint2":function(d){return "jo galdutako 2 puntuaren soinua"},
"playSoundRetro":function(d){return "jo retro soinua"},
"playSoundRubber":function(d){return "jo borragoma soinua"},
"playSoundSlap":function(d){return "jo zaplasteko soinua"},
"playSoundTooltip":function(d){return "Jo aukeratutako soinua."},
"playSoundWinPoint":function(d){return "jo puntu irabazle soinua"},
"playSoundWinPoint2":function(d){return "jo puntu irabazle soinua 2"},
"playSoundWood":function(d){return "jo egur soinua"},
"positionOutTopLeft":function(d){return "goiko ezker posiziora"},
"positionOutTopRight":function(d){return "goiko eskuin posiziora"},
"positionTopOutLeft":function(d){return "konpoko goiko ezker posiziora"},
"positionTopLeft":function(d){return "joan goi ezkerreko posiziora"},
"positionTopCenter":function(d){return "goi erdiko posiziora"},
"positionTopRight":function(d){return "goi eskuineko posiziora"},
"positionTopOutRight":function(d){return "goiko goiko eskuin posiziora"},
"positionMiddleLeft":function(d){return "erdiko ezkerreko posiziora"},
"positionMiddleCenter":function(d){return "erdiko zentroko posiziora"},
"positionMiddleRight":function(d){return "erdiko eskuineko posiziora"},
"positionBottomOutLeft":function(d){return "beheko kanpo ezker posiziora"},
"positionBottomLeft":function(d){return "beheko ezkerreko posiziora"},
"positionBottomCenter":function(d){return "behko zentroko posiziora"},
"positionBottomRight":function(d){return "beheko eskuineko posiziora"},
"positionBottomOutRight":function(d){return "beheko kanpo eskuin posiziora"},
"positionOutBottomLeft":function(d){return "beheko azpiko ezker posiziora"},
"positionOutBottomRight":function(d){return "beheko azpiko eskuin posiziora"},
"positionRandom":function(d){return "ausazko posiziora"},
"projectileBlueFireball":function(d){return "suzko bola urdina"},
"projectilePurpleFireball":function(d){return "suzko bola morea"},
"projectileRedFireball":function(d){return "suzko bola gorria"},
"projectileYellowHearts":function(d){return "bihotz horiak"},
"projectilePurpleHearts":function(d){return "bihotz moreak"},
"projectileRedHearts":function(d){return "bihotz gorriak"},
"projectileRandom":function(d){return "ausazkoa"},
"projectileAnna":function(d){return "kako"},
"projectileElsa":function(d){return "izpi"},
"projectileHiro":function(d){return "mikrorobotak"},
"projectileBaymax":function(d){return "kohete"},
"projectileRapunzel":function(d){return "burruntzalia"},
"projectileCherry":function(d){return "gerezia"},
"projectileIce":function(d){return "izotza"},
"projectileDuck":function(d){return "ahatea"},
"reinfFeedbackMsg":function(d){return "\""+studio_locale.v(d,"backButton")+"\" botoia zapal zenezake, zure istorioan berriro jolasteko."},
"repeatForever":function(d){return "errepikatu betirako"},
"repeatDo":function(d){return "egin"},
"repeatForeverTooltip":function(d){return "Exekutatu blokeko ekintzak etengabe istorioa martxan dagoen bitartean."},
"saySprite":function(d){return "esan"},
"saySpriteN":function(d){return studio_locale.v(d,"spriteIndex")+" aktoreak dio"},
"saySpriteTooltip":function(d){return "Zehaztutako aktoretik bokadiloa atera lotutako testuarekin."},
"saySpriteChoices_0":function(d){return "Kaixo."},
"saySpriteChoices_1":function(d){return "Kaixo denoi."},
"saySpriteChoices_2":function(d){return "Zer moduz zaude?"},
"saySpriteChoices_3":function(d){return "Egun on"},
"saySpriteChoices_4":function(d){return "Arratsalde on"},
"saySpriteChoices_5":function(d){return "Gabon"},
"saySpriteChoices_6":function(d){return "Gabon"},
"saySpriteChoices_7":function(d){return "Ze berri?"},
"saySpriteChoices_8":function(d){return "Zer?"},
"saySpriteChoices_9":function(d){return "Non?"},
"saySpriteChoices_10":function(d){return "Noiz?"},
"saySpriteChoices_11":function(d){return "Ondo."},
"saySpriteChoices_12":function(d){return "Ederto!"},
"saySpriteChoices_13":function(d){return "Ondo."},
"saySpriteChoices_14":function(d){return "Ez gaizki."},
"saySpriteChoices_15":function(d){return "Zorte on."},
"saySpriteChoices_16":function(d){return "Bai"},
"saySpriteChoices_17":function(d){return "Ez"},
"saySpriteChoices_18":function(d){return "Ongi da"},
"saySpriteChoices_19":function(d){return "Jaurtiketa bikaina!"},
"saySpriteChoices_20":function(d){return "Egun ona izan."},
"saySpriteChoices_21":function(d){return "Agur."},
"saySpriteChoices_22":function(d){return "Laster nator."},
"saySpriteChoices_23":function(d){return "Bihar arte!"},
"saySpriteChoices_24":function(d){return "Gero arte!"},
"saySpriteChoices_25":function(d){return "Kontuz!"},
"saySpriteChoices_26":function(d){return "Ondo pasa!"},
"saySpriteChoices_27":function(d){return "Joan behar dut."},
"saySpriteChoices_28":function(d){return "Lagunak izatea nahi al duzu?"},
"saySpriteChoices_29":function(d){return "Lan aparta!"},
"saySpriteChoices_30":function(d){return "Woo hoo!"},
"saySpriteChoices_31":function(d){return "Yay!"},
"saySpriteChoices_32":function(d){return "Pozik zu ezagutzeaz"},
"saySpriteChoices_33":function(d){return "Ados!"},
"saySpriteChoices_34":function(d){return "Mila esker"},
"saySpriteChoices_35":function(d){return "Ez, mila esker"},
"saySpriteChoices_36":function(d){return "Aaaaaah!"},
"saySpriteChoices_37":function(d){return "Ez du inporta."},
"saySpriteChoices_38":function(d){return "Gaur"},
"saySpriteChoices_39":function(d){return "Bihar"},
"saySpriteChoices_40":function(d){return "Atzo"},
"saySpriteChoices_41":function(d){return "Topatu zaitut!"},
"saySpriteChoices_42":function(d){return "Topatu nauzu!"},
"saySpriteChoices_43":function(d){return "10, 9, 8, 7, 6, 5, 4, 3, 2, 1!"},
"saySpriteChoices_44":function(d){return "Zoragarria zara!"},
"saySpriteChoices_45":function(d){return "Dibertigarria zara!"},
"saySpriteChoices_46":function(d){return "Ergela zara! "},
"saySpriteChoices_47":function(d){return "Lagun ona zara!"},
"saySpriteChoices_48":function(d){return "Kontuz!"},
"saySpriteChoices_49":function(d){return "Ahatea!"},
"saySpriteChoices_50":function(d){return "Harrapatu zaitut!"},
"saySpriteChoices_51":function(d){return "Au!"},
"saySpriteChoices_52":function(d){return "Barkatu!"},
"saySpriteChoices_53":function(d){return "Kontuz!"},
"saySpriteChoices_54":function(d){return "Alajaina!"},
"saySpriteChoices_55":function(d){return "Oops!"},
"saySpriteChoices_56":function(d){return "Ia ia harrapatu nauzu!"},
"saySpriteChoices_57":function(d){return "Saiakera ona!"},
"saySpriteChoices_58":function(d){return "Ezin nauzu harrapatu!"},
"scoreText":function(d){return "Markagailua: "+studio_locale.v(d,"playerScore")},
"setActivityRandom":function(d){return "set activity to random for"},
"setActivityRoam":function(d){return "set activity to roam for"},
"setActivityChase":function(d){return "set activity to chase for"},
"setActivityFlee":function(d){return "set activity to flee for"},
"setActivityNone":function(d){return "set activity to none for"},
"setActivityTooltip":function(d){return "Sets the activity for a set of items"},
"setBackground":function(d){return "ezarri atzeko planoa"},
"setBackgroundRandom":function(d){return "ezarri ausazko atzeko planoa"},
"setBackgroundBlack":function(d){return "ezarri atzekalde beltza"},
"setBackgroundCave":function(d){return "ezarri haitzulo atzekaldea"},
"setBackgroundCloudy":function(d){return "ezarri atzekalde hodeitsua"},
"setBackgroundHardcourt":function(d){return "ezarri zoru gogorreko atzekaldea"},
"setBackgroundNight":function(d){return "ezarri gaueko atzekaldea"},
"setBackgroundUnderwater":function(d){return "ezarri ur azpiko atzeko planoa"},
"setBackgroundCity":function(d){return "ezarri hiriko atzeko planoa"},
"setBackgroundDesert":function(d){return "ezarri desertuko atzeko planoa"},
"setBackgroundRainbow":function(d){return "ezarri ostadar atzeko planoa"},
"setBackgroundSoccer":function(d){return "ezarri futbol atzeko planoa"},
"setBackgroundSpace":function(d){return "ezarri espazioko atzeko planoa"},
"setBackgroundTennis":function(d){return "ezarri tenis atzeko planoa"},
"setBackgroundWinter":function(d){return "ezarri neguko atzeko planoa"},
"setBackgroundLeafy":function(d){return "ezarri atzeko plano hostotsua"},
"setBackgroundGrassy":function(d){return "ezarri atzeko plano belartsua"},
"setBackgroundFlower":function(d){return "ezarri lore atzeko planoa"},
"setBackgroundTile":function(d){return "ezarri azulejodun atzeko planoa"},
"setBackgroundIcy":function(d){return "ezarri atzeko plano izoztua"},
"setBackgroundSnowy":function(d){return "ezarri atzeko plano elurtua"},
"setBackgroundForest":function(d){return "set forest background"},
"setBackgroundSnow":function(d){return "set snow background"},
"setBackgroundShip":function(d){return "set ship background"},
"setBackgroundTooltip":function(d){return "Atzeko irudia ezartzen du"},
"setEnemySpeed":function(d){return "ezarri etsaiaren abiadura"},
"setItemSpeedSet":function(d){return "set type"},
"setItemSpeedTooltip":function(d){return "Sets the speed for a set of items"},
"setPlayerSpeed":function(d){return "ezarri jokalariaren abiadura"},
"setScoreText":function(d){return "ezarri markagailua"},
"setScoreTextTooltip":function(d){return "Puntuazioaren tokian bistaratuko den testua ezartzen du."},
"setSpriteEmotionAngry":function(d){return "umore txarrera"},
"setSpriteEmotionHappy":function(d){return "umore onera"},
"setSpriteEmotionNormal":function(d){return "umore arruntera"},
"setSpriteEmotionRandom":function(d){return "ausazko umorera"},
"setSpriteEmotionSad":function(d){return "umore tristera"},
"setSpriteEmotionTooltip":function(d){return "Ezarri aktorearen umorea"},
"setSpriteAlien":function(d){return "estralurtar irudi batera"},
"setSpriteBat":function(d){return "saguzar irudi batera"},
"setSpriteBird":function(d){return "txori irudi batera"},
"setSpriteCat":function(d){return "katu irudi batera"},
"setSpriteCaveBoy":function(d){return "Haitzuloetako mutikoaren irudiari."},
"setSpriteCaveGirl":function(d){return "Haitzuloetako neskatoaren irudiari."},
"setSpriteDinosaur":function(d){return "dinosauru irudi batera"},
"setSpriteDog":function(d){return "txakur irudi batera"},
"setSpriteDragon":function(d){return "dragoi irudi batera"},
"setSpriteGhost":function(d){return "mamu irudi batera"},
"setSpriteHidden":function(d){return "ezkutuko irudira"},
"setSpriteHideK1":function(d){return "ezkutatu"},
"setSpriteAnna":function(d){return "Anna irudi batera"},
"setSpriteElsa":function(d){return "Elsa irudi batera"},
"setSpriteHiro":function(d){return "Hiro irudi batera"},
"setSpriteBaymax":function(d){return "Baymax irudi batera"},
"setSpriteRapunzel":function(d){return "Rapunzel irudi batera"},
"setSpriteKnight":function(d){return "zaldun irudi batera"},
"setSpriteMonster":function(d){return "munstro irudi batera"},
"setSpriteNinja":function(d){return "ninja irudi batera"},
"setSpriteOctopus":function(d){return "olagarro irudi batera"},
"setSpritePenguin":function(d){return "pinguino irudi batera"},
"setSpritePirate":function(d){return "pirata irudi batera"},
"setSpritePrincess":function(d){return "printzesa irudi batera"},
"setSpriteRandom":function(d){return "ausazko irudi batera"},
"setSpriteRobot":function(d){return "robot irudi batera"},
"setSpriteShowK1":function(d){return "erakutsi"},
"setSpriteSpacebot":function(d){return "espazioko robot baten irudira"},
"setSpriteSoccerGirl":function(d){return "neska futbolari irudi batera"},
"setSpriteSoccerBoy":function(d){return "mutil futbolari irudi batera"},
"setSpriteSquirrel":function(d){return "urtxintxa irudi batera"},
"setSpriteTennisGirl":function(d){return "neska tenislari irudi batera"},
"setSpriteTennisBoy":function(d){return "mutil tenislari irudi batera"},
"setSpriteUnicorn":function(d){return "adarbakar irudi batera"},
"setSpriteWitch":function(d){return "sorgin irudi batera"},
"setSpriteWizard":function(d){return "azti irudi batera"},
"setSpritePositionTooltip":function(d){return "Toki zehatz batera aktorea berehala mugitzen du."},
"setSpriteK1Tooltip":function(d){return "Zehaztutako aktorea erakutsi edo ezkutatzen du."},
"setSpriteTooltip":function(d){return "Aktorearen irudia ezartzen du"},
"setSpriteSizeRandom":function(d){return "ausazko tamainara"},
"setSpriteSizeVerySmall":function(d){return "tamaiana oso txikira"},
"setSpriteSizeSmall":function(d){return "tamaina txikira"},
"setSpriteSizeNormal":function(d){return "tamaina normalera"},
"setSpriteSizeLarge":function(d){return "tamaina handira"},
"setSpriteSizeVeryLarge":function(d){return "tamaiana oso handira"},
"setSpriteSizeTooltip":function(d){return "Ezarri aktorearen tamaiana"},
"setSpriteSpeedRandom":function(d){return "ausazko abiadura batera"},
"setSpriteSpeedVerySlow":function(d){return "abiadura oso motel batera"},
"setSpriteSpeedSlow":function(d){return "abiadura motel batera"},
"setSpriteSpeedNormal":function(d){return "abiadura normal batera"},
"setSpriteSpeedFast":function(d){return "abiadura azkar batera"},
"setSpriteSpeedVeryFast":function(d){return "abiadura oso azkar batera"},
"setSpriteSpeedTooltip":function(d){return "Aktore baten abiadura ezartzen du"},
"setSpriteZombie":function(d){return "zonbi irudi batera"},
"setSpriteBot1":function(d){return "to bot1"},
"setSpriteBot2":function(d){return "to bot2"},
"setMap":function(d){return "set map"},
"setMapRandom":function(d){return "set random map"},
"setMapBlank":function(d){return "set blank map"},
"setMapCircle":function(d){return "set circle map"},
"setMapCircle2":function(d){return "set circle2 map"},
"setMapHorizontal":function(d){return "set horizontal map"},
"setMapGrid":function(d){return "set grid map"},
"setMapBlobs":function(d){return "set blobs map"},
"setMapTooltip":function(d){return "Changes the map in the scene"},
"shareStudioTwitter":function(d){return "Ikusi egin dudan istorioa. @codeorg-ekin idatzi dut nik bakarrik"},
"shareGame":function(d){return "Partekatu zure istorioa:"},
"showCoordinates":function(d){return "erakutsi kordenatuak"},
"showCoordinatesTooltip":function(d){return "erakutsi protagonistaren kordenatuak pantailan"},
"showTitleScreen":function(d){return "erakutsi titulu pantaila"},
"showTitleScreenTitle":function(d){return "titulua"},
"showTitleScreenText":function(d){return "testua"},
"showTSDefTitle":function(d){return "idatzi titulua hemen"},
"showTSDefText":function(d){return "idatzi testua hemen"},
"showTitleScreenTooltip":function(d){return "Hasierako pantaila erakusten du zehaztutako izenburu eta testuarekin."},
"size":function(d){return "tamaina"},
"setSprite":function(d){return "ezarri"},
"setSpriteN":function(d){return "ezarri aktorea "+studio_locale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "zapaldu"},
"soundGoal1":function(d){return "helburu 1"},
"soundGoal2":function(d){return "helburu 2"},
"soundHit":function(d){return "kolpe"},
"soundLosePoint":function(d){return "puntua galdu"},
"soundLosePoint2":function(d){return "puntua galdu 2"},
"soundRetro":function(d){return "retro"},
"soundRubber":function(d){return "borragoma"},
"soundSlap":function(d){return "masailekoa"},
"soundWinPoint":function(d){return "puntua irabazi"},
"soundWinPoint2":function(d){return "puntua irabazi 2"},
"soundWood":function(d){return "egurra"},
"speed":function(d){return "abiadura"},
"startSetValue":function(d){return "hasi (funtzioa)"},
"startSetVars":function(d){return "jokuko aldagaiak(titulua, azpititulua, atzeko planoa, helburua, arriskua, jokalaria)"},
"startSetFuncs":function(d){return "jokuaren_funtzioak (eguneratu-helburura, eguneratu-arriskua, eguneratu-jokalaria, talka?, Pantailan?)"},
"stopSprite":function(d){return "geratu"},
"stopSpriteN":function(d){return "gelditu aktorea "+studio_locale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Aktore baten mugimendua geratzen du."},
"throwSprite":function(d){return "bota"},
"throwSpriteN":function(d){return "aktorea "+studio_locale.v(d,"spriteIndex")+" bota"},
"throwTooltip":function(d){return "Zehaztutako aktoretik jaurtigai bat botatzen du."},
"vanish":function(d){return "desagertu"},
"vanishActorN":function(d){return studio_locale.v(d,"spriteIndex")+" aktorea desagertarazi"},
"vanishTooltip":function(d){return "Aktorea ezabatzen du."},
"waitFor":function(d){return "itxaron"},
"waitSeconds":function(d){return "segundu"},
"waitForClick":function(d){return "itxoin klikatzea"},
"waitForRandom":function(d){return "itxoin ausazkoa"},
"waitForHalfSecond":function(d){return "itxoin segundu erdia"},
"waitFor1Second":function(d){return "itxoin segundu 1"},
"waitFor2Seconds":function(d){return "itxoin 2 segundu"},
"waitFor5Seconds":function(d){return "itxoin 5 segundu"},
"waitFor10Seconds":function(d){return "itxoin 10 segundu"},
"waitParamsTooltip":function(d){return "Zehazturiko segunduak itxaroten ditu, erabili zero klik egin arte itxaroteko."},
"waitTooltip":function(d){return "Klikatzea edo denbora kopuru zehatz bat itxoiten ditu."},
"whenArrowDown":function(d){return "behera gezia"},
"whenArrowLeft":function(d){return "ezker gezia"},
"whenArrowRight":function(d){return "eskuin gezia"},
"whenArrowUp":function(d){return "gora gezia"},
"whenArrowTooltip":function(d){return "Exekutatu beheko ekintzak zehaztutako tekla sakatzen denean."},
"whenDown":function(d){return "beheko gezia sakatzean"},
"whenDownTooltip":function(d){return "Exekutatu behekaldeko ekintzak beheko gezidun tekla sakatzean."},
"whenGameStarts":function(d){return "isotorioa hasten denean"},
"whenGameStartsTooltip":function(d){return "Exekutatu beheko ekintzak istorioa hasten denean."},
"whenLeft":function(d){return "ezkerreko gezia sakatzean"},
"whenLeftTooltip":function(d){return "Exekutatu behekaldeko ekintzak ezkerreko gezidun tekla sakatzean."},
"whenRight":function(d){return "eskuineko gezia sakatzean"},
"whenRightTooltip":function(d){return "Exekutatu behekaldeko ekintzak eskubiko gezidun tekla sakatzean."},
"whenSpriteClicked":function(d){return "aktorea klikatzean"},
"whenSpriteClickedN":function(d){return studio_locale.v(d,"spriteIndex")+" aktorea klikatutakoan"},
"whenSpriteClickedTooltip":function(d){return "Aktorea klikatzen denean ekintza hauek exekutatu."},
"whenSpriteCollidedN":function(d){return "aktoreak "+studio_locale.v(d,"spriteIndex")+" egiten duenean"},
"whenSpriteCollidedTooltip":function(d){return "Exekutatu beheko ekintzak aktore batek beste bat ikutzen duenean."},
"whenSpriteCollidedWith":function(d){return "ukitu"},
"whenSpriteCollidedWithAnyActor":function(d){return "edozein aktore ukitu"},
"whenSpriteCollidedWithAnyEdge":function(d){return "edozein ertz ukitu"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "edozein jaurtigai ukitu"},
"whenSpriteCollidedWithAnything":function(d){return "edozer ukitu"},
"whenSpriteCollidedWithN":function(d){return "aktorea ukitu "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "su-bola urdina ukitu"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "su-bola morea ukitu"},
"whenSpriteCollidedWithRedFireball":function(d){return "su-bola gorria ukitu"},
"whenSpriteCollidedWithYellowHearts":function(d){return "bihotz horiak ukitu"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "bihotz moreak ukitu"},
"whenSpriteCollidedWithRedHearts":function(d){return "bihotz gorriak ukitu"},
"whenSpriteCollidedWithBottomEdge":function(d){return "beheko ertza ukitu"},
"whenSpriteCollidedWithLeftEdge":function(d){return "ezker ertza ukitu"},
"whenSpriteCollidedWithRightEdge":function(d){return "eskuin ertza ukitu"},
"whenSpriteCollidedWithTopEdge":function(d){return "goiko ertza ukitu"},
"whenTouchItem":function(d){return "when item touched"},
"whenTouchItemTooltip":function(d){return "Execute the actions below when the actor touches an item."},
"whenTouchWall":function(d){return "when wall touched"},
"whenTouchWallTooltip":function(d){return "Execute the actions below when the actor touches a wall."},
"whenUp":function(d){return "goiko gezia denean"},
"whenUpTooltip":function(d){return "Exekutatu behekaldeko ekintzak gora gezidun tekla sakatzean."},
"yes":function(d){return "Bai"},
"calloutPlaceCommandsHere":function(d){return "Place commands here"},
"calloutPlaceCommandsAtTop":function(d){return "Place commands to set up your game at the top"},
"calloutTypeCommandsHere":function(d){return "Type your commands here"},
"calloutCharactersMove":function(d){return "These new commands let you control how the characters move"},
"calloutPutCommandsTouchCharacter":function(d){return "Put a command here to have it happen when you touch a character"},
"calloutClickCategory":function(d){return "Click a category header to see commands in each category"},
"calloutTryOutNewCommands":function(d){return "Try out all the new commands you’ve unlocked"}};