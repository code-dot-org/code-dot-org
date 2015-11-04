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
"actor":function(d){return "pjesmarrës"},
"addCharacter":function(d){return "add a"},
"addCharacterTooltip":function(d){return "Add a character to the scene."},
"alienInvasion":function(d){return "Pushtimi i Alienëve!"},
"backgroundBlack":function(d){return "e zezë"},
"backgroundCave":function(d){return "shpellë"},
"backgroundCloudy":function(d){return "me re"},
"backgroundHardcourt":function(d){return "terren i fortë"},
"backgroundNight":function(d){return "natë"},
"backgroundUnderwater":function(d){return "nën ujë"},
"backgroundCity":function(d){return "qytet"},
"backgroundDesert":function(d){return "shkretëtirë"},
"backgroundRainbow":function(d){return "ylber"},
"backgroundSoccer":function(d){return "futboll"},
"backgroundSpace":function(d){return "hapësirë"},
"backgroundTennis":function(d){return "tenis"},
"backgroundWinter":function(d){return "dimër"},
"calloutPlaceCommandsHere":function(d){return "Place commands here"},
"calloutPlaceCommandsAtTop":function(d){return "Place commands to set up your game at the top"},
"calloutTypeCommandsHere":function(d){return "Type your commands here"},
"calloutCharactersMove":function(d){return "These new commands let you control how the characters move"},
"calloutPutCommandsTouchCharacter":function(d){return "Put a command here to have it happen when you touch a character"},
"calloutClickCategory":function(d){return "Click a category header to see commands in each category"},
"calloutTryOutNewCommands":function(d){return "Try out all the new commands you’ve unlocked"},
"catActions":function(d){return "Veprimet"},
"catControl":function(d){return "perseritje"},
"catEvents":function(d){return "Ngjarjet"},
"catLogic":function(d){return "Logjika"},
"catMath":function(d){return "Matematikë"},
"catProcedures":function(d){return "funksionet"},
"catText":function(d){return "Tekst"},
"catVariables":function(d){return "variabla"},
"changeScoreTooltip":function(d){return "Shto ose hiq një pikë tek rezultati."},
"changeScoreTooltipK1":function(d){return "Shto një pikë tek rezultati."},
"continue":function(d){return "Vazhdo"},
"decrementPlayerScore":function(d){return "hiq pikën"},
"defaultSayText":function(d){return "shtyp këtu"},
"dropletBlock_addCharacter_description":function(d){return "Add a character to the scene."},
"dropletBlock_addCharacter_param0":function(d){return "type"},
"dropletBlock_addCharacter_param0_description":function(d){return "The type of the character to be added ('random', 'man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_changeScore_description":function(d){return "Shto ose hiq një pikë tek rezultati."},
"dropletBlock_changeScore_param0":function(d){return "rezultati"},
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
"dropletBlock_playSound_description":function(d){return "Luaj tingullin e zgjedhur."},
"dropletBlock_playSound_param0":function(d){return "sound"},
"dropletBlock_playSound_param0_description":function(d){return "The name of the sound to play."},
"dropletBlock_setBackground_description":function(d){return "Vendos sfondin e imazhit"},
"dropletBlock_setBackground_param0":function(d){return "image"},
"dropletBlock_setBackground_param0_description":function(d){return "The name of the background theme ('background1', 'background2', or 'background3')."},
"dropletBlock_setBot_description":function(d){return "Changes the active bot."},
"dropletBlock_setBot_param0":function(d){return "image"},
"dropletBlock_setBot_param0_description":function(d){return "The name of the bot image ('random', 'bot1', or 'bot2')."},
"dropletBlock_setBotSpeed_description":function(d){return "Sets the bot speed."},
"dropletBlock_setBotSpeed_param0":function(d){return "shpejtësia"},
"dropletBlock_setBotSpeed_param0_description":function(d){return "The speed value ('random', 'slow', 'normal', or 'fast')."},
"dropletBlock_setSpriteEmotion_description":function(d){return "Vendos gjëndjen e pjesmarrësit"},
"dropletBlock_setSpritePosition_description":function(d){return "Lëviz menjëherë pjesmarrësin në vendin e caktuar."},
"dropletBlock_setSpriteSpeed_description":function(d){return "Vendos shpejtësinë e pjesmarrësit"},
"dropletBlock_setSprite_description":function(d){return "Vendos imazhin e pjesmarrësit"},
"dropletBlock_setSprite_param0":function(d){return "index"},
"dropletBlock_setSprite_param0_description":function(d){return "The index (starting at 0) indicating which actor should change."},
"dropletBlock_setSprite_param1":function(d){return "image"},
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
"dropletBlock_throw_description":function(d){return "Hedh një raketë nga një pjesmarrës i caktuar."},
"dropletBlock_vanish_description":function(d){return "Zhduk pjesmarrësin."},
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
"emotion":function(d){return "humori"},
"finalLevel":function(d){return "Urime! Ju keni perfunduar enigmen perfundimatare."},
"for":function(d){return "për"},
"hello":function(d){return "përshëndetje"},
"helloWorld":function(d){return "Përshëndetje Botë!"},
"incrementPlayerScore":function(d){return "rezultati"},
"itemBlueFireball":function(d){return "top zjarri blu"},
"itemPurpleFireball":function(d){return "top zjarri lejla"},
"itemRedFireball":function(d){return "top zjarri i kuq"},
"itemYellowHearts":function(d){return "zemrat e verdha"},
"itemPurpleHearts":function(d){return "zemrat lejla"},
"itemRedHearts":function(d){return "zemrat e kuqe"},
"itemRandom":function(d){return "zakonshem"},
"itemAnna":function(d){return "grep"},
"itemElsa":function(d){return "shkëlqen"},
"itemHiro":function(d){return "mikrobet"},
"itemBaymax":function(d){return "raketë"},
"itemRapunzel":function(d){return "tenxhere"},
"itemCherry":function(d){return "qershi"},
"itemIce":function(d){return "akull"},
"itemDuck":function(d){return "rosë"},
"itemMan":function(d){return "man"},
"itemPilot":function(d){return "pilot"},
"itemPig":function(d){return "pig"},
"itemBird":function(d){return "bird"},
"itemMouse":function(d){return "mouse"},
"itemRoo":function(d){return "roo"},
"itemSpider":function(d){return "spider"},
"makeProjectileDisappear":function(d){return "zhduket"},
"makeProjectileBounce":function(d){return "përplas"},
"makeProjectileBlueFireball":function(d){return "bëj topa zjarri blu"},
"makeProjectilePurpleFireball":function(d){return "bëj topa zjarri lejla"},
"makeProjectileRedFireball":function(d){return "bëj topa zjarri të kuq"},
"makeProjectileYellowHearts":function(d){return "bëj zemra të verdha"},
"makeProjectilePurpleHearts":function(d){return "bëj zemra lejla"},
"makeProjectileRedHearts":function(d){return "bëj zemra të kuqe"},
"makeProjectileTooltip":function(d){return "Bëj që raketa, e cila sapo u përplas, të zhduket ose të kërcejë."},
"makeYourOwn":function(d){return "Bëj aplikacionin tënd Play Lab"},
"moveDirectionDown":function(d){return "poshtë"},
"moveDirectionLeft":function(d){return "majtas"},
"moveDirectionRight":function(d){return "djathtas"},
"moveDirectionUp":function(d){return "lart"},
"moveDirectionRandom":function(d){return "zakonshem"},
"moveDistance25":function(d){return "25 piksela"},
"moveDistance50":function(d){return "50 piksela"},
"moveDistance100":function(d){return "100 piksela"},
"moveDistance200":function(d){return "200 piksela"},
"moveDistance400":function(d){return "400 piksela"},
"moveDistancePixels":function(d){return "piksela"},
"moveDistanceRandom":function(d){return "piksela të rastësishme"},
"moveDistanceTooltip":function(d){return "Lëviz një pjesmarrës tek një largësi e caktuar në drejtimin e caktuar."},
"moveSprite":function(d){return "lëviz"},
"moveSpriteN":function(d){return "lëviz pjesmarrësin "+studio_locale.v(d,"spriteIndex")},
"toXY":function(d){return "tek x,y"},
"moveDown":function(d){return "lëviz poshtë"},
"moveDownTooltip":function(d){return "Lëviz një pjesmarrës poshtë."},
"moveLeft":function(d){return "lëviz majtas"},
"moveLeftTooltip":function(d){return "Lëviz një pjesmarrës majtas."},
"moveRight":function(d){return "lëviz djathtas"},
"moveRightTooltip":function(d){return "Lëviz një pjesmarrës djathtas."},
"moveUp":function(d){return "lëviz sipër"},
"moveUpTooltip":function(d){return "Lëviz një pjesmarrës lart."},
"moveTooltip":function(d){return "Lëviz një pjesmarrës."},
"nextLevel":function(d){return "Urime! Ju keni perfunduar kete enigme."},
"no":function(d){return "Jo"},
"numBlocksNeeded":function(d){return "Kjo enigme mund te zgjidhet me %1 rreshta."},
"onEventTooltip":function(d){return "Ekzekuto kodin në përgjigje te eventit specifik."},
"ouchExclamation":function(d){return "Ouch!"},
"playSoundCrunch":function(d){return "vendos tingullin \"e kërcitjes\""},
"playSoundGoal1":function(d){return "vendos tingullin \"qëllimi 1\""},
"playSoundGoal2":function(d){return "vendos tingullin \"qëllimi 2\""},
"playSoundHit":function(d){return "vendos tingullin \"e goditjes\""},
"playSoundLosePoint":function(d){return "vendos tingullin \"humb pikë\""},
"playSoundLosePoint2":function(d){return "vendos tingullin \"humb pikë 2\""},
"playSoundRetro":function(d){return "vendos tingullin \"retro\""},
"playSoundRubber":function(d){return "vendos tingullin e \"gomës\""},
"playSoundSlap":function(d){return "vendos tingullin e \"goditjes\""},
"playSoundTooltip":function(d){return "Vendos tingullin e zgjedhur."},
"playSoundWinPoint":function(d){return "vendos tingullin e \"fitoj pikë\""},
"playSoundWinPoint2":function(d){return "vendos tingullin e \" fitoj pikë 2\""},
"playSoundWood":function(d){return "vendos tingullin \"e pyllit\""},
"positionOutTopLeft":function(d){return "në pozicionin sipër në të majtë"},
"positionOutTopRight":function(d){return "në pozicionin lart në të djathtë"},
"positionTopOutLeft":function(d){return "në pozicionin e jashtëm lart në të majtë"},
"positionTopLeft":function(d){return "në pozicionin lart në të majtë"},
"positionTopCenter":function(d){return "në pozicionin lart në qendër"},
"positionTopRight":function(d){return "në pozicionin lart në të djathtë"},
"positionTopOutRight":function(d){return "në pozicionin e jashtëm lart në të djathtë"},
"positionMiddleLeft":function(d){return "në pozicionin në mes majtas"},
"positionMiddleCenter":function(d){return "në pozicionin në mes të qendrës"},
"positionMiddleRight":function(d){return "në pozicionin në mes në të djathtë"},
"positionBottomOutLeft":function(d){return "në pozicionin e poshtëm nga jashtë"},
"positionBottomLeft":function(d){return "në pozicionin majtas poshtë"},
"positionBottomCenter":function(d){return "në pozicionin poshtë në mes"},
"positionBottomRight":function(d){return "në pozicionin në mes në të djathtë"},
"positionBottomOutRight":function(d){return "në pozicionin poshtë nga jashtë në të djathtë"},
"positionOutBottomLeft":function(d){return "në pozicionin poshtë në fund majtas"},
"positionOutBottomRight":function(d){return "në pozicionin poshtë në fund djathtas"},
"positionRandom":function(d){return "në pozicion të çfarëdoshëm"},
"projectileBlueFireball":function(d){return "top zjarri blu"},
"projectilePurpleFireball":function(d){return "top zjarri lejla"},
"projectileRedFireball":function(d){return "top zjarri i kuq"},
"projectileYellowHearts":function(d){return "zemrat e verdha"},
"projectilePurpleHearts":function(d){return "zemrat lejla"},
"projectileRedHearts":function(d){return "zemrat e kuqe"},
"projectileRandom":function(d){return "zakonshem"},
"projectileAnna":function(d){return "grep"},
"projectileElsa":function(d){return "shkëlqen"},
"projectileHiro":function(d){return "mikrobet"},
"projectileBaymax":function(d){return "raketë"},
"projectileRapunzel":function(d){return "tenxhere"},
"projectileCherry":function(d){return "qershi"},
"projectileIce":function(d){return "akull"},
"projectileDuck":function(d){return "rosë"},
"reinfFeedbackMsg":function(d){return "Mund të shtypni butonin \""+studio_locale.v(d,"backButton")+"\" që të shkoni mbrapa për të luajtur ngjarjen tënde."},
"repeatForever":function(d){return "përsërit përgjithmonë"},
"repeatDo":function(d){return "bej"},
"repeatForeverTooltip":function(d){return "Kryej veprimet në këtë bllok herë pas here, ndërkohë që ngjarja juaj po vazhdon."},
"saySprite":function(d){return "thuaj"},
"saySpriteN":function(d){return "pjesmarrës "+studio_locale.v(d,"spriteIndex")+" thuaj"},
"saySpriteTooltip":function(d){return "Shfaq një flluskë të shoqëruar me tekstin përkatës nga pjesmarësi i caktuar."},
"saySpriteChoices_0":function(d){return "Përshëndetje"},
"saySpriteChoices_1":function(d){return "Përshëndetje të gjithëve."},
"saySpriteChoices_2":function(d){return "Si po ja kaloni?"},
"saySpriteChoices_3":function(d){return "Mirëmëngjesi"},
"saySpriteChoices_4":function(d){return "Mirëdita"},
"saySpriteChoices_5":function(d){return "Natën e mirë"},
"saySpriteChoices_6":function(d){return "Mirëmbrëma"},
"saySpriteChoices_7":function(d){return "Cfarë ka ndonjë të re?"},
"saySpriteChoices_8":function(d){return "Cfarë?"},
"saySpriteChoices_9":function(d){return "Ku?"},
"saySpriteChoices_10":function(d){return "Kur?"},
"saySpriteChoices_11":function(d){return "Mirë."},
"saySpriteChoices_12":function(d){return "Shkëlqyeshëm!"},
"saySpriteChoices_13":function(d){return "Në rregull."},
"saySpriteChoices_14":function(d){return "Jo keq."},
"saySpriteChoices_15":function(d){return "Paç fat."},
"saySpriteChoices_16":function(d){return "Po"},
"saySpriteChoices_17":function(d){return "Jo"},
"saySpriteChoices_18":function(d){return "Në rregull"},
"saySpriteChoices_19":function(d){return "Hedhje e mirë!"},
"saySpriteChoices_20":function(d){return "Kalofshi një ditë të bukur."},
"saySpriteChoices_21":function(d){return "Mirëupafshim."},
"saySpriteChoices_22":function(d){return "Do të kthehem për pak."},
"saySpriteChoices_23":function(d){return "Shihemi nesër!"},
"saySpriteChoices_24":function(d){return "Shihemi më vonë!"},
"saySpriteChoices_25":function(d){return "Bëj kujdes!"},
"saySpriteChoices_26":function(d){return "Shijoje!"},
"saySpriteChoices_27":function(d){return "Më duhet te shkoj."},
"saySpriteChoices_28":function(d){return "Do të bëhemi miq?"},
"saySpriteChoices_29":function(d){return "Punë e mrekullueshme!"},
"saySpriteChoices_30":function(d){return "Uuu huu!"},
"saySpriteChoices_31":function(d){return "Yay!"},
"saySpriteChoices_32":function(d){return "Kënaqësi që ju takova."},
"saySpriteChoices_33":function(d){return "Në rregull!"},
"saySpriteChoices_34":function(d){return "Faleminderit"},
"saySpriteChoices_35":function(d){return "Jo, faleminderit"},
"saySpriteChoices_36":function(d){return "Aaaaaah!"},
"saySpriteChoices_37":function(d){return "S'ka rëndësi"},
"saySpriteChoices_38":function(d){return "Sot"},
"saySpriteChoices_39":function(d){return "Nesër"},
"saySpriteChoices_40":function(d){return "Dje"},
"saySpriteChoices_41":function(d){return "Të gjeta!"},
"saySpriteChoices_42":function(d){return "Më gjete!"},
"saySpriteChoices_43":function(d){return "10, 9, 8, 7, 6, 5, 4, 3, 2, 1!"},
"saySpriteChoices_44":function(d){return "Je i mrekullueshëm!"},
"saySpriteChoices_45":function(d){return "Je zbavitës!"},
"saySpriteChoices_46":function(d){return "Je budalla!"},
"saySpriteChoices_47":function(d){return "Je një shok i mirë!"},
"saySpriteChoices_48":function(d){return "Kujdes!"},
"saySpriteChoices_49":function(d){return "Përkulu!"},
"saySpriteChoices_50":function(d){return "Të kapa!"},
"saySpriteChoices_51":function(d){return "Ou!"},
"saySpriteChoices_52":function(d){return "Më fal!"},
"saySpriteChoices_53":function(d){return "Kujdes!"},
"saySpriteChoices_54":function(d){return "Whoa!"},
"saySpriteChoices_55":function(d){return "Ups!"},
"saySpriteChoices_56":function(d){return "Për pak me kape!"},
"saySpriteChoices_57":function(d){return "Përpjekje e bukur!"},
"saySpriteChoices_58":function(d){return "Ti s'më kap dot!"},
"scoreText":function(d){return "Pikë: "+studio_locale.v(d,"playerScore")},
"setActivityRandom":function(d){return "set activity to random for"},
"setActivityRoam":function(d){return "set activity to roam for"},
"setActivityChase":function(d){return "set activity to chase for"},
"setActivityFlee":function(d){return "set activity to flee for"},
"setActivityNone":function(d){return "set activity to none for"},
"setActivityTooltip":function(d){return "Sets the activity for a set of items"},
"setBackground":function(d){return "vendos sfond"},
"setBackgroundRandom":function(d){return "vendos sfond të çfarëdoshëm"},
"setBackgroundBlack":function(d){return "vendos sfond të zi"},
"setBackgroundCave":function(d){return "vcendos sfond shpelle"},
"setBackgroundCloudy":function(d){return "vendos sfond me re"},
"setBackgroundHardcourt":function(d){return "vendos sfond me terren të fortë"},
"setBackgroundNight":function(d){return "vendos sfond nate"},
"setBackgroundUnderwater":function(d){return "vendos një sfond nën ujor"},
"setBackgroundCity":function(d){return "vendos një sfond qyteti"},
"setBackgroundDesert":function(d){return "vendos një sfond shkretëtire"},
"setBackgroundRainbow":function(d){return "vendos një sfond ylberi"},
"setBackgroundSoccer":function(d){return "vendos një sfond futbolli"},
"setBackgroundSpace":function(d){return "vendos një sfond hapësire"},
"setBackgroundTennis":function(d){return "vendos një sfond tenisi"},
"setBackgroundWinter":function(d){return "vendos sfond dimri"},
"setBackgroundLeafy":function(d){return "vendos sfond me gjethe"},
"setBackgroundGrassy":function(d){return "vendos sfond me bar"},
"setBackgroundFlower":function(d){return "vendos sfond me lule"},
"setBackgroundTile":function(d){return "vendos sfond me tjegulla"},
"setBackgroundIcy":function(d){return "vendos sfond të akullt"},
"setBackgroundSnowy":function(d){return "vendos sfond me dëborë"},
"setBackgroundForest":function(d){return "set forest background"},
"setBackgroundSnow":function(d){return "set snow background"},
"setBackgroundShip":function(d){return "set ship background"},
"setBackgroundTooltip":function(d){return "Rregullo sfondin e imazhit"},
"setEnemySpeed":function(d){return "vendos shpejtësinë e armikut"},
"setItemSpeedSet":function(d){return "set type"},
"setItemSpeedTooltip":function(d){return "Sets the speed for a set of items"},
"setPlayerSpeed":function(d){return "vendos shpejtësinë e lojtarit"},
"setScoreText":function(d){return "vendos pikët"},
"setScoreTextTooltip":function(d){return "Vendos tekstin, që të shfaqet në fushën e pikëve."},
"setSpriteEmotionAngry":function(d){return "në gjëndje të nxehur"},
"setSpriteEmotionHappy":function(d){return "në gjëndje të gëzuar"},
"setSpriteEmotionNormal":function(d){return "në gjëndje normale"},
"setSpriteEmotionRandom":function(d){return "në një gjëndje të rastit"},
"setSpriteEmotionSad":function(d){return "në gjëndje të mërzitur"},
"setSpriteEmotionTooltip":function(d){return "Vendos gjëndjen e pjesmarrësit"},
"setSpriteAlien":function(d){return "në një imazh të huaj"},
"setSpriteBat":function(d){return "në një imazh lakuriqi nate"},
"setSpriteBird":function(d){return "në një imazh zogu"},
"setSpriteCat":function(d){return "në një imazh maceje"},
"setSpriteCaveBoy":function(d){return "në një imazh djali prej shpelle"},
"setSpriteCaveGirl":function(d){return "në një imazh vajze prej shpelle"},
"setSpriteDinosaur":function(d){return "në një imazh dinosauri"},
"setSpriteDog":function(d){return "në një imazh qeni"},
"setSpriteDragon":function(d){return "në një imazh dragoi"},
"setSpriteGhost":function(d){return "në një imazh fantazme"},
"setSpriteHidden":function(d){return "në një imazh të fshehur"},
"setSpriteHideK1":function(d){return "fsheh"},
"setSpriteAnna":function(d){return "tek nje imazh i Anës"},
"setSpriteElsa":function(d){return "tek nje imazh i Elsës"},
"setSpriteHiro":function(d){return "në një imazh Hiro"},
"setSpriteBaymax":function(d){return "në një imazh Baymax"},
"setSpriteRapunzel":function(d){return "në një imazh Rapunzel"},
"setSpriteKnight":function(d){return "në një imazh kalorësi"},
"setSpriteMonster":function(d){return "në një imazh përbindëshi"},
"setSpriteNinja":function(d){return "në një imazh ninja të maskuar"},
"setSpriteOctopus":function(d){return "në një imazh oktapodi"},
"setSpritePenguin":function(d){return "në një imazh pinguini"},
"setSpritePirate":function(d){return "në një imazh pirati"},
"setSpritePrincess":function(d){return "në një imazh princeshe"},
"setSpriteRandom":function(d){return "në një imazh të rastësishëm"},
"setSpriteRobot":function(d){return "në një imazh roboti"},
"setSpriteShowK1":function(d){return "trego"},
"setSpriteSpacebot":function(d){return "në një imazh spacebot"},
"setSpriteSoccerGirl":function(d){return "në një imazh vajze futbolliste"},
"setSpriteSoccerBoy":function(d){return "në një imazh djali futbollist"},
"setSpriteSquirrel":function(d){return "në një imazh ketri"},
"setSpriteTennisGirl":function(d){return "në një imazh vajze teniste"},
"setSpriteTennisBoy":function(d){return "në një imazh djali tenist"},
"setSpriteUnicorn":function(d){return "në një imazh njëbrirëshi"},
"setSpriteWitch":function(d){return "në një imazh shtrige"},
"setSpriteWizard":function(d){return "në një imazh magjistari"},
"setSpritePositionTooltip":function(d){return "Lëviz menjëherë pjesmarrësin në vendin e caktuar."},
"setSpriteK1Tooltip":function(d){return "Tregon ose fsheh pjesmarrësin e përcaktuar."},
"setSpriteTooltip":function(d){return "Vendos imazhin e pjesmarrësit"},
"setSpriteSizeRandom":function(d){return "në një madhësi të çfarëdoshme"},
"setSpriteSizeVerySmall":function(d){return "në një madhësi shumë të vogël"},
"setSpriteSizeSmall":function(d){return "në një madhësi të vogël"},
"setSpriteSizeNormal":function(d){return "në një madhësi normale"},
"setSpriteSizeLarge":function(d){return "në një madhësi të madhe"},
"setSpriteSizeVeryLarge":function(d){return "në një madhësi shumë të madhe"},
"setSpriteSizeTooltip":function(d){return "Vendos madhësinë e pjesmarrësit"},
"setSpriteSpeedRandom":function(d){return "në një shpejtsi të çfarëdoshme"},
"setSpriteSpeedVerySlow":function(d){return "me një shpejtësi shumë të ngadaltë"},
"setSpriteSpeedSlow":function(d){return "me një shpejtësi të ngadaltë"},
"setSpriteSpeedNormal":function(d){return "me një shpejtësi normale"},
"setSpriteSpeedFast":function(d){return "me një shpejtësi shumë të shpejtë"},
"setSpriteSpeedVeryFast":function(d){return "me një shpejtësi akoma edhe më të shpejtë"},
"setSpriteSpeedTooltip":function(d){return "Vendos shpejtësinë e pjesmarrësit"},
"setSpriteZombie":function(d){return "në një imazh zombi"},
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
"shareStudioTwitter":function(d){return "Shiko ngjarjen që bëra unë. E shkruajta vetë me @codeorg"},
"shareGame":function(d){return "Shpërnda historinë tënde:"},
"showCoordinates":function(d){return "trego koordinatat"},
"showCoordinatesTooltip":function(d){return "shfaq koordinatat e protagonistëve në ekran"},
"showTitleScreen":function(d){return "shfaq ekranin e titullit"},
"showTitleScreenTitle":function(d){return "titull"},
"showTitleScreenText":function(d){return "tekst"},
"showTSDefTitle":function(d){return "shkruaj titullin këtu"},
"showTSDefText":function(d){return "shtyp tekstin këtu"},
"showTitleScreenTooltip":function(d){return "Shfaq një ekran shoqëruar me titullin dhe tekstin përkatës."},
"size":function(d){return "madhësia"},
"setSprite":function(d){return "vendos"},
"setSpriteN":function(d){return "vendos pjesmarrësin "+studio_locale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "përtyp"},
"soundGoal1":function(d){return "qëllimi 1"},
"soundGoal2":function(d){return "qëllimi 2"},
"soundHit":function(d){return "godit"},
"soundLosePoint":function(d){return "humb pikë"},
"soundLosePoint2":function(d){return "humb pikën 2"},
"soundRetro":function(d){return "retro"},
"soundRubber":function(d){return "gomë"},
"soundSlap":function(d){return "gjuaj"},
"soundWinPoint":function(d){return "fito pikë"},
"soundWinPoint2":function(d){return "fito pikë 2"},
"soundWood":function(d){return "druri"},
"speed":function(d){return "shpejtësia"},
"startSetValue":function(d){return "fillo (funksionin)"},
"startSetVars":function(d){return "game_vars (ttulli, nëntitulli, sfond, target, rrezik, lojtar)"},
"startSetFuncs":function(d){return "game_funcs (përditëso-targetin, përditëso-rrezikun, përditëso-lojtarin, përplaset?, në-ekran?)"},
"stopSprite":function(d){return "ndalo"},
"stopSpriteN":function(d){return "ndalo pjesmarrësin "+studio_locale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Ndalon lëvizjen e një pjemsarrësi."},
"throwSprite":function(d){return "hedh"},
"throwSpriteN":function(d){return "pjesmarrës "+studio_locale.v(d,"spriteIndex")+" hedh"},
"throwTooltip":function(d){return "Hedh një raketë nga një pjesmarrës i caktuar."},
"vanish":function(d){return "zhduket"},
"vanishActorN":function(d){return "zhduk pjesmarrësin "+studio_locale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "Zhduk pjesmarrësin."},
"waitFor":function(d){return "prit për"},
"waitSeconds":function(d){return "sekondat"},
"waitForClick":function(d){return "prit për klikimin"},
"waitForRandom":function(d){return "prit për çfarëdo"},
"waitForHalfSecond":function(d){return "prit për gjysëm sekonde"},
"waitFor1Second":function(d){return "prit për 1 sekondë"},
"waitFor2Seconds":function(d){return "prit 2 sekonda"},
"waitFor5Seconds":function(d){return "prit 5 sekonda"},
"waitFor10Seconds":function(d){return "prit 10 sekonda"},
"waitParamsTooltip":function(d){return "Pret për një numër të caktuar sekondash ose përdor zeron për të pritur derisa të ndodhë klikimi."},
"waitTooltip":function(d){return "Pret për një sasi të caktuar kohe ose pret derisa të ndodhë klikimi."},
"whenArrowDown":function(d){return "shigjetë drejtuar poshtë"},
"whenArrowLeft":function(d){return "shigjetë drejtuar majtas"},
"whenArrowRight":function(d){return "shigjetë drejtuar djathtas"},
"whenArrowUp":function(d){return "shigjetë drejtuar lart"},
"whenArrowTooltip":function(d){return "Kryej veprimet e mëposhtme kur tasti i shigjetës së caktuar të shtypet."},
"whenDown":function(d){return "kur shigjeta është poshtë"},
"whenDownTooltip":function(d){return "Kryej veprimet më poshtë kur tasti i shigjetës poshtë të shtypet."},
"whenGameStarts":function(d){return "kur ngjarjafillon"},
"whenGameStartsTooltip":function(d){return "Kryej veprimet e mëposhtme kur ngjarja fillon."},
"whenLeft":function(d){return "kur shigjeta është majtas"},
"whenLeftTooltip":function(d){return "Kryej veprimet më poshtë kur tasti i shigjetës majtas të shtypet."},
"whenRight":function(d){return "kur shigjeta është djathtas"},
"whenRightTooltip":function(d){return "Kryej veprimet më poshtë kur tasti i shigjetës djathtas të shtypet."},
"whenSpriteClicked":function(d){return "kur klikoi pjesmarrësi"},
"whenSpriteClickedN":function(d){return "kur klikoi pjesmarrësi "+studio_locale.v(d,"spriteIndex")},
"whenSpriteClickedTooltip":function(d){return "Kryej veprimet më poshtë kur një pjesmarrës klikohet."},
"whenSpriteCollidedN":function(d){return "kur pjesmarrësi "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "Kryej veprimet më poshtë kur pjesmarrësi prek pjesmarrësin tjetër."},
"whenSpriteCollidedWith":function(d){return "prekje"},
"whenSpriteCollidedWithAnyActor":function(d){return "prek ndonjë pjesmarrës"},
"whenSpriteCollidedWithAnyEdge":function(d){return "prek ndonjë cep"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "prek ndonjë raketë"},
"whenSpriteCollidedWithAnything":function(d){return "prek ndonjë gjë"},
"whenSpriteCollidedWithN":function(d){return "prek pjesmarrësin "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "prek topin e zjarrtë blu"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "prek topin e zjarrit lejla"},
"whenSpriteCollidedWithRedFireball":function(d){return "prek topin e zjarrit të kuq"},
"whenSpriteCollidedWithYellowHearts":function(d){return "prek zemrat e verdha"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "prek zemrat lejla"},
"whenSpriteCollidedWithRedHearts":function(d){return "prek zemrat e kuqe"},
"whenSpriteCollidedWithBottomEdge":function(d){return "prek cepin në fund"},
"whenSpriteCollidedWithLeftEdge":function(d){return "prek cepin e majtë"},
"whenSpriteCollidedWithRightEdge":function(d){return "prek cepin e djathtë"},
"whenSpriteCollidedWithTopEdge":function(d){return "prek cepin në majë"},
"whenTouchItem":function(d){return "when character touched"},
"whenTouchItemTooltip":function(d){return "Execute the actions below when the actor touches a character."},
"whenTouchWall":function(d){return "when obstacle touched"},
"whenTouchWallTooltip":function(d){return "Execute the actions below when the actor touches an obstacle."},
"whenUp":function(d){return "kur shigjeta është lart"},
"whenUpTooltip":function(d){return "Kryej veprimet më poshtë kur tasti i shigjetës lart shtypet."},
"yes":function(d){return "Po"},
"failedHasSetSprite":function(d){return "Next time, set a character."},
"failedHasSetBotSpeed":function(d){return "Next time, set a bot speed."},
"failedTouchAllItems":function(d){return "Next time, get all the items."},
"failedScoreMinimum":function(d){return "Next time, reach the minimum score."},
"failedRemovedItemCount":function(d){return "Next time, get the right number of items."},
"failedSetActivity":function(d){return "Next time, set the correct character activity."},
"addPoints10":function(d){return "add 10 points"},
"addPoints50":function(d){return "add 50 points"},
"addPoints100":function(d){return "add 100 points"},
"addPoints400":function(d){return "add 400 points"},
"addPoints1000":function(d){return "add 1000 points"},
"addPointsTooltip":function(d){return "Add points to the score."},
"calloutPutCommandsHereRunStart":function(d){return "Put commands here to have them run when the program starts"},
"calloutClickEvents":function(d){return "Click on the events header to see event function blocks."},
"calloutUseArrowButtons":function(d){return "Hold down these buttons or the arrow keys on your keyboard to trigger the move events"},
"calloutUseArrowButtonsAutoSteer":function(d){return "You can still use these buttons or the arrow keys on your keyboard to move"},
"calloutMoveRightRunButton":function(d){return "Add a second moveRight command to your code and then click here to run it"},
"calloutShowCodeToggle":function(d){return "Click here to switch between block and text mode"},
"calloutShowPlaceGoUpHere":function(d){return "Place goUp command here to move up"},
"calloutShowPlaySound":function(d){return "It's your game, so you choose the sounds now. Try the dropdown to pick a different sound"},
"calloutInstructions":function(d){return "Don't know what to do? Click the instructions to see them again"},
"calloutPlaceTwo":function(d){return "Can you make two MOUSEs appear when you get one MOUSE?"},
"calloutPlaceTwoWhenBird":function(d){return "Can you make two MOUSEs appear when you get a BIRD?"},
"calloutSetMapAndSpeed":function(d){return "Set the map and your speed."},
"calloutFinishButton":function(d){return "Click here when you are ready to share your game."},
"tapOrClickToPlay":function(d){return "Tap or click to play"},
"tapOrClickToReset":function(d){return "Tap or click to reset"},
"dropletBlock_addPoints_description":function(d){return "Add points to the score."},
"dropletBlock_addPoints_param0":function(d){return "score"},
"dropletBlock_addPoints_param0_description":function(d){return "The value to add to the score."},
"dropletBlock_removePoints_description":function(d){return "Remove points from the score."},
"dropletBlock_removePoints_param0":function(d){return "score"},
"dropletBlock_removePoints_param0_description":function(d){return "The value to remove from the score."},
"dropletBlock_endGame_description":function(d){return "End the game."},
"dropletBlock_endGame_param0":function(d){return "type"},
"dropletBlock_endGame_param0_description":function(d){return "Whether the game was won or lost ('win', 'lose')."},
"dropletBlock_whenGetCharacter_description":function(d){return "This function executes when the character gets any character."},
"dropletBlock_whenGetMan_description":function(d){return "This function executes when the character gets man characters."},
"dropletBlock_whenGetPilot_description":function(d){return "This function executes when the character gets pilot characters."},
"dropletBlock_whenGetPig_description":function(d){return "This function executes when the character gets pig characters."},
"dropletBlock_whenGetBird_description":function(d){return "This function executes when the character gets bird characters."},
"dropletBlock_whenGetMouse_description":function(d){return "This function executes when the character gets mouse characters."},
"dropletBlock_whenGetRoo_description":function(d){return "This function executes when the character gets roo characters."},
"dropletBlock_whenGetSpider_description":function(d){return "This function executes when the character gets spider characters."},
"hoc2015_lastLevel_continueText":function(d){return "Done"},
"hoc2015_reinfFeedbackMsg":function(d){return "You can press the \""+studio_locale.v(d,"backButton")+"\" button to go back to playing your game."},
"hoc2015_shareGame":function(d){return "Share your game:"},
"iceAge":function(d){return "Ice Age!"},
"itemIAProjectile1":function(d){return "hearts"},
"itemIAProjectile2":function(d){return "boulder"},
"itemIAProjectile3":function(d){return "ice cube"},
"itemIAProjectile4":function(d){return "snowflake"},
"itemIAProjectile5":function(d){return "ice crystal"},
"loseMessage":function(d){return "You lose!"},
"projectileIAProjectile1":function(d){return "hearts"},
"projectileIAProjectile2":function(d){return "boulder"},
"projectileIAProjectile3":function(d){return "ice cube"},
"projectileIAProjectile4":function(d){return "snowflake"},
"projectileIAProjectile5":function(d){return "ice crystal"},
"removePoints10":function(d){return "remove 10 points"},
"removePoints50":function(d){return "remove 50 points"},
"removePoints100":function(d){return "remove 100 points"},
"removePoints400":function(d){return "remove 400 points"},
"removePoints1000":function(d){return "remove 1000 points"},
"removePointsTooltip":function(d){return "Remove points from the score."},
"setSpriteManny":function(d){return "to a Manny image"},
"setSpriteSid":function(d){return "to a Sid image"},
"setSpriteGranny":function(d){return "to a Granny image"},
"setSpriteDiego":function(d){return "to a Diego image"},
"setSpriteScrat":function(d){return "to a Scrat image"},
"whenGetCharacterPIG":function(d){return "when get PIG"},
"whenGetCharacterMAN":function(d){return "when get MAN"},
"whenGetCharacterROO":function(d){return "when get ROO"},
"whenGetCharacterBIRD":function(d){return "when get BIRD"},
"whenGetCharacterSPIDER":function(d){return "when get SPIDER"},
"whenGetCharacterMOUSE":function(d){return "when get MOUSE"},
"whenGetCharacterPILOT":function(d){return "when get PILOT"},
"whenGetCharacterTooltip":function(d){return "Execute the actions below when an actor gets the specified type of character."},
"whenTouchCharacter":function(d){return "when character touched"},
"whenTouchCharacterTooltip":function(d){return "Execute the actions below when the actor touches a character."},
"whenTouchObstacle":function(d){return "when obstacle touched"},
"whenTouchObstacleTooltip":function(d){return "Execute the actions below when the actor touches an obstacle."},
"whenTouchGoal":function(d){return "when goal touched"},
"whenTouchGoalTooltip":function(d){return "Execute the actions below when the actor touches a goal."},
"winMessage":function(d){return "You win!"},
"failedHasSetBackground":function(d){return "Next time, set the background."},
"failedHasSetMap":function(d){return "Next time, set the map."},
"failedHasWonGame":function(d){return "Next time, win the game."},
"failedHasLostGame":function(d){return "Next time, lose the game"},
"failedAddItem":function(d){return "Next time, add a character."},
"failedAvoidHazard":function(d){return "\"Uh oh, a GUY got you!  Try again.\""},
"failedHasAllGoals":function(d){return "\"Try again, BOTX.  You can get it.\""},
"successHasAllGoals":function(d){return "\"You did it, BOTX!\""},
"successCharacter1":function(d){return "\"Well done, BOT1!\""},
"successGenericCharacter":function(d){return "\"Congratulations.  You did it!\""},
"failedTwoItemsTimeout":function(d){return "You need to get the pilots before time runs out. To move, put the goUp and goDown commands inside the whenUp and whenDown functions. Then, press and hold the arrow keys on your keyboard (or screen) to move quickly."},
"failedFourItemsTimeout":function(d){return "To pass this level, you'll need to put goLeft, goRight, goUp and goDown into the right functions. If your code looks correct, but you can't get there fast enough, try pressing and holding the arrow keys on your keyboard (or screen)."},
"failedScoreTimeout":function(d){return "Try to reach all the pilots before time runs out. To move faster, press and hold the arrow keys on your keyboard (or screen)."},
"failedScoreScore":function(d){return "You got the pilots, but you still don't have enough points to pass the level. Use the addPoints command to add 100 points when you get a pilot."},
"failedScoreGoals":function(d){return "You used the addPoints command, but not in the right place. Can you put it inside the whenGetPilot function so BOT1 can't get points until he gets a pilot?"},
"failedWinLoseTimeout":function(d){return "Try to reach all the pilots before time runs out. To move faster, press and hold the arrow keys on your keyboard (or screen)."},
"failedWinLoseScore":function(d){return "You got the pilots, but you still don't have enough points to pass the level. Use the addPoints command to add 100 points when you get a pilot. Use removePoints to subtract 100 when you touch a MAN. Avoid the MANs!"},
"failedWinLoseGoals":function(d){return "You used the addPoints command, but not in the right place. Can you make it so that the command is only called when you get the pilot? Also, remove points when you touch the MAN."},
"failedAddCharactersTimeout":function(d){return "Use three addCharacter commands at the top of your program to add PIGs when you hit run. Now go get them."},
"failedChainCharactersTimeout":function(d){return "You need to get 20 MOUSEs. They move fast. Try pressing and holding the keys on your keyboard (or screen) to chase them."},
"failedChainCharactersScore":function(d){return "You got the MOUSEs, but you don't have enough points to move to the next level. Make sure you add 100 points to your score every time you get a MOUSE?"},
"failedChainCharactersItems":function(d){return "You used the addPoints command, but not in the right place.  Can you make it so that the command is only called when you get the MOUSEs?"},
"failedChainCharacters2Timeout":function(d){return "You need to get 8 MOUSEs. Can you make two (or more) of them appear every time you get a ROO?"},
"failedChangeSettingTimeout":function(d){return "Get 3 pilots to move on."},
"failedChangeSettingSettings":function(d){return "Make the level your own. To pass this level, you need to change the map and set your speed."}};