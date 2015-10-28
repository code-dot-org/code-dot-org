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
"actor":function(d){return "персонаж"},
"addCharacter":function(d){return "додати"},
"addCharacterTooltip":function(d){return "Додати персонаж до сцени."},
"alienInvasion":function(d){return "Інопланетне вторгнення!"},
"backgroundBlack":function(d){return "чорний"},
"backgroundCave":function(d){return "печера"},
"backgroundCloudy":function(d){return "хмарно"},
"backgroundHardcourt":function(d){return "корт"},
"backgroundNight":function(d){return "ніч"},
"backgroundUnderwater":function(d){return "підводний"},
"backgroundCity":function(d){return "місто"},
"backgroundDesert":function(d){return "пустеля"},
"backgroundRainbow":function(d){return "веселка"},
"backgroundSoccer":function(d){return "футбол"},
"backgroundSpace":function(d){return "космос"},
"backgroundTennis":function(d){return "теніс"},
"backgroundWinter":function(d){return "зима"},
"calloutPlaceCommandsHere":function(d){return "Place commands here"},
"calloutPlaceCommandsAtTop":function(d){return "Place commands to set up your game at the top"},
"calloutTypeCommandsHere":function(d){return "Type your commands here"},
"calloutCharactersMove":function(d){return "These new commands let you control how the characters move"},
"calloutPutCommandsTouchCharacter":function(d){return "Put a command here to have it happen when you touch a character"},
"calloutClickCategory":function(d){return "Click a category header to see commands in each category"},
"calloutTryOutNewCommands":function(d){return "Try out all the new commands you’ve unlocked"},
"catActions":function(d){return "Дії"},
"catControl":function(d){return "петлі"},
"catEvents":function(d){return "Події"},
"catLogic":function(d){return "Логіка"},
"catMath":function(d){return "Математика"},
"catProcedures":function(d){return "функції"},
"catText":function(d){return "Текст"},
"catVariables":function(d){return "змінні"},
"changeScoreTooltip":function(d){return "Додати або видалити бал."},
"changeScoreTooltipK1":function(d){return "Додати бал."},
"continue":function(d){return "Далі"},
"decrementPlayerScore":function(d){return "видалити бал"},
"defaultSayText":function(d){return "друкувати тут"},
"dropletBlock_addCharacter_description":function(d){return "Додати персонаж до сцени."},
"dropletBlock_addCharacter_param0":function(d){return "type"},
"dropletBlock_addCharacter_param0_description":function(d){return "The type of the character to be added ('random', 'man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_changeScore_description":function(d){return "Додати або видалити бал."},
"dropletBlock_changeScore_param0":function(d){return "рахунок"},
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
"dropletBlock_playSound_description":function(d){return "Відтворити обраний звук."},
"dropletBlock_playSound_param0":function(d){return "sound"},
"dropletBlock_playSound_param0_description":function(d){return "The name of the sound to play."},
"dropletBlock_setBackground_description":function(d){return "Встановлює фонове зображення"},
"dropletBlock_setBackground_param0":function(d){return "image"},
"dropletBlock_setBackground_param0_description":function(d){return "The name of the background theme ('background1', 'background2', or 'background3')."},
"dropletBlock_setBot_description":function(d){return "Changes the active bot."},
"dropletBlock_setBot_param0":function(d){return "зображення"},
"dropletBlock_setBot_param0_description":function(d){return "The name of the bot image ('random', 'bot1', or 'bot2')."},
"dropletBlock_setBotSpeed_description":function(d){return "Sets the bot speed."},
"dropletBlock_setBotSpeed_param0":function(d){return "швидкість"},
"dropletBlock_setBotSpeed_param0_description":function(d){return "The speed value ('random', 'slow', 'normal', or 'fast')."},
"dropletBlock_setSpriteEmotion_description":function(d){return "Встановлює настрій персонажа"},
"dropletBlock_setSpritePosition_description":function(d){return "Миттєво переміщує персонажа у вказане місце."},
"dropletBlock_setSpriteSpeed_description":function(d){return "Встановлює швидкість персонажа"},
"dropletBlock_setSprite_description":function(d){return "Встановлює зображення персонажа"},
"dropletBlock_setSprite_param0":function(d){return "індекс"},
"dropletBlock_setSprite_param0_description":function(d){return "The index (starting at 0) indicating which actor should change."},
"dropletBlock_setSprite_param1":function(d){return "зображення"},
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
"dropletBlock_throw_description":function(d){return "Кидати снаряд від вказаного актора."},
"dropletBlock_vanish_description":function(d){return "Персонаж зникає."},
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
"emotion":function(d){return "настрій"},
"finalLevel":function(d){return "Вітання! Ви розв'язали останнє завдання."},
"for":function(d){return "для"},
"hello":function(d){return "привіт"},
"helloWorld":function(d){return "Привіт, світе!"},
"incrementPlayerScore":function(d){return "додати бал"},
"itemBlueFireball":function(d){return "синя вогняна куля"},
"itemPurpleFireball":function(d){return "фіолетова вогняна куля"},
"itemRedFireball":function(d){return "червона вогняна куля"},
"itemYellowHearts":function(d){return "жовті серця"},
"itemPurpleHearts":function(d){return "фіолетові серця"},
"itemRedHearts":function(d){return "червоні серця"},
"itemRandom":function(d){return "випадковий"},
"itemAnna":function(d){return "гачок"},
"itemElsa":function(d){return "іскру"},
"itemHiro":function(d){return "мікроботи"},
"itemBaymax":function(d){return "ракету"},
"itemRapunzel":function(d){return "сковорідку"},
"itemCherry":function(d){return "вишню"},
"itemIce":function(d){return "лід"},
"itemDuck":function(d){return "качку"},
"itemMan":function(d){return "людину"},
"itemPilot":function(d){return "пілота"},
"itemPig":function(d){return "свиню"},
"itemBird":function(d){return "пташку"},
"itemMouse":function(d){return "мишку"},
"itemRoo":function(d){return "кенгуру"},
"itemSpider":function(d){return "павука"},
"makeProjectileDisappear":function(d){return "зникнути"},
"makeProjectileBounce":function(d){return "відбитись"},
"makeProjectileBlueFireball":function(d){return "змусити синю вогняну кулю"},
"makeProjectilePurpleFireball":function(d){return "змусити фіолетову вогняну кулю"},
"makeProjectileRedFireball":function(d){return "змусити червону вогняну кулю"},
"makeProjectileYellowHearts":function(d){return "змусити жовті серця"},
"makeProjectilePurpleHearts":function(d){return "змусити фіолетові серця"},
"makeProjectileRedHearts":function(d){return "змусити червоні серця"},
"makeProjectileTooltip":function(d){return "Змусити снаряд зникнути або відбитись при зіткненні."},
"makeYourOwn":function(d){return "Створіть власну програму в Ігровій студії"},
"moveDirectionDown":function(d){return "вниз"},
"moveDirectionLeft":function(d){return "ліворуч"},
"moveDirectionRight":function(d){return "праворуч"},
"moveDirectionUp":function(d){return "вгору"},
"moveDirectionRandom":function(d){return "випадковий"},
"moveDistance25":function(d){return "25 пікселів"},
"moveDistance50":function(d){return "50 пікселів"},
"moveDistance100":function(d){return "100 пікселів"},
"moveDistance200":function(d){return "200 пікселів"},
"moveDistance400":function(d){return "400 пікселів"},
"moveDistancePixels":function(d){return "пікселів"},
"moveDistanceRandom":function(d){return "Випадкові пікселі"},
"moveDistanceTooltip":function(d){return "Переміщення персонажа на вказану відстань у вказаному напрямку."},
"moveSprite":function(d){return "переміститись"},
"moveSpriteN":function(d){return "перемістити персонажа "+studio_locale.v(d,"spriteIndex")},
"toXY":function(d){return "до x,y"},
"moveDown":function(d){return "рухатися вниз"},
"moveDownTooltip":function(d){return "Перемістити персонаж вниз."},
"moveLeft":function(d){return "рухатись ліворуч"},
"moveLeftTooltip":function(d){return "Перемістити персонаж вліво."},
"moveRight":function(d){return "рухатись праворуч"},
"moveRightTooltip":function(d){return "Перемістити персонаж вправо."},
"moveUp":function(d){return "рухатися вгору"},
"moveUpTooltip":function(d){return "Рухати персонаж вгору."},
"moveTooltip":function(d){return "Перемістити персонаж."},
"nextLevel":function(d){return "Вітання! Ви розв'язали останнє завдання."},
"no":function(d){return "Ні"},
"numBlocksNeeded":function(d){return "Це завдання можна розв'язати за допомогою %1 блоків."},
"onEventTooltip":function(d){return "Виконайте код у відповідь на певну подію."},
"ouchExclamation":function(d){return "Ой!"},
"playSoundCrunch":function(d){return "грати звук хрускоту"},
"playSoundGoal1":function(d){return "грати звук цілі 1"},
"playSoundGoal2":function(d){return "грати звук цілі 2"},
"playSoundHit":function(d){return "грати звук влучання"},
"playSoundLosePoint":function(d){return "грати звук втрати балу"},
"playSoundLosePoint2":function(d){return "грати звук втрати балу 2"},
"playSoundRetro":function(d){return "грати звук ретро"},
"playSoundRubber":function(d){return "грати звук гумки"},
"playSoundSlap":function(d){return "грати звук ляпаса"},
"playSoundTooltip":function(d){return "Відтворити обраний звук."},
"playSoundWinPoint":function(d){return "грати звук переможного балу"},
"playSoundWinPoint2":function(d){return "грати звук переможного балу 2"},
"playSoundWood":function(d){return "грати звук деревини"},
"positionOutTopLeft":function(d){return "до позиції вгору вліво"},
"positionOutTopRight":function(d){return "до позиції вгору праворуч"},
"positionTopOutLeft":function(d){return "до позиції вгору ззовні зліва"},
"positionTopLeft":function(d){return "положення вгору ліворуч"},
"positionTopCenter":function(d){return "положення вгору посередині"},
"positionTopRight":function(d){return "положення вгору праворуч"},
"positionTopOutRight":function(d){return "до позиції вгору ззовні справа"},
"positionMiddleLeft":function(d){return "положення посередині зліва"},
"positionMiddleCenter":function(d){return "положення посередині в центрі"},
"positionMiddleRight":function(d){return "положення посередині праворуч"},
"positionBottomOutLeft":function(d){return "до позиції вниз ззовні зліва"},
"positionBottomLeft":function(d){return "положення внизу зліва"},
"positionBottomCenter":function(d){return "положення внизу посередині"},
"positionBottomRight":function(d){return "положення внизу справа"},
"positionBottomOutRight":function(d){return "до позиції вниз ззовні справа"},
"positionOutBottomLeft":function(d){return "до позиції вниз зліва"},
"positionOutBottomRight":function(d){return "до позиції вниз справа"},
"positionRandom":function(d){return "випадкове положення"},
"projectileBlueFireball":function(d){return "синя вогняна куля"},
"projectilePurpleFireball":function(d){return "фіолетова вогняна куля"},
"projectileRedFireball":function(d){return "червона вогняна куля"},
"projectileYellowHearts":function(d){return "жовті серця"},
"projectilePurpleHearts":function(d){return "фіолетові серця"},
"projectileRedHearts":function(d){return "червоні серця"},
"projectileRandom":function(d){return "випадковий"},
"projectileAnna":function(d){return "гачок"},
"projectileElsa":function(d){return "іскру"},
"projectileHiro":function(d){return "мікроботи"},
"projectileBaymax":function(d){return "ракету"},
"projectileRapunzel":function(d){return "сковорідку"},
"projectileCherry":function(d){return "вишню"},
"projectileIce":function(d){return "лід"},
"projectileDuck":function(d){return "качку"},
"reinfFeedbackMsg":function(d){return "Можна натиснути кнопку \""+studio_locale.v(d,"backButton")+"\", щоб повернутися до своєї історії."},
"repeatForever":function(d){return "повторювати завжди"},
"repeatDo":function(d){return "робити"},
"repeatForeverTooltip":function(d){return "Виконати дії з цього блоку кілька разів поки триває історія."},
"saySprite":function(d){return "говорити"},
"saySpriteN":function(d){return "персонаж "+studio_locale.v(d,"spriteIndex")+" говорить"},
"saySpriteTooltip":function(d){return "Показати бульбашку мовлення з відповідним текстом біля вказаного персонажу."},
"saySpriteChoices_0":function(d){return "Привіт."},
"saySpriteChoices_1":function(d){return "Привіт всім."},
"saySpriteChoices_2":function(d){return "Як твої справи?"},
"saySpriteChoices_3":function(d){return "Доброго ранку"},
"saySpriteChoices_4":function(d){return "Доброго дня"},
"saySpriteChoices_5":function(d){return "Надобраніч"},
"saySpriteChoices_6":function(d){return "Доброго вечора"},
"saySpriteChoices_7":function(d){return "Що нового?"},
"saySpriteChoices_8":function(d){return "Що?"},
"saySpriteChoices_9":function(d){return "Де?"},
"saySpriteChoices_10":function(d){return "Коли?"},
"saySpriteChoices_11":function(d){return "Добре."},
"saySpriteChoices_12":function(d){return "Чудово!"},
"saySpriteChoices_13":function(d){return "Все гаразд."},
"saySpriteChoices_14":function(d){return "Непогано."},
"saySpriteChoices_15":function(d){return "Успіхів."},
"saySpriteChoices_16":function(d){return "Так"},
"saySpriteChoices_17":function(d){return "Ні"},
"saySpriteChoices_18":function(d){return "Добре"},
"saySpriteChoices_19":function(d){return "Хороший кидок!"},
"saySpriteChoices_20":function(d){return "Гарного дня."},
"saySpriteChoices_21":function(d){return "Бувай."},
"saySpriteChoices_22":function(d){return "Я скоро повернусь."},
"saySpriteChoices_23":function(d){return "Побачимося завтра!"},
"saySpriteChoices_24":function(d){return "Побачимося пізніше!"},
"saySpriteChoices_25":function(d){return "Бережи себе!"},
"saySpriteChoices_26":function(d){return "Насолоджуйтесь!"},
"saySpriteChoices_27":function(d){return "Мені потрібно йти."},
"saySpriteChoices_28":function(d){return "Хочеш бути друзями?"},
"saySpriteChoices_29":function(d){return "Чудова робота!"},
"saySpriteChoices_30":function(d){return "Увіііііі!"},
"saySpriteChoices_31":function(d){return "Ура!"},
"saySpriteChoices_32":function(d){return "Приємно побачитись."},
"saySpriteChoices_33":function(d){return "Все гаразд!"},
"saySpriteChoices_34":function(d){return "Дякую"},
"saySpriteChoices_35":function(d){return "Ні, дякую вам"},
"saySpriteChoices_36":function(d){return "Ааааааах!"},
"saySpriteChoices_37":function(d){return "Не зважай"},
"saySpriteChoices_38":function(d){return "Сьогодні"},
"saySpriteChoices_39":function(d){return "Завтра"},
"saySpriteChoices_40":function(d){return "Вчора"},
"saySpriteChoices_41":function(d){return "Я знайшов вас!"},
"saySpriteChoices_42":function(d){return "Ви знайшли мене!"},
"saySpriteChoices_43":function(d){return "10, 9, 8, 7, 6, 5, 4, 3, 2, 1!"},
"saySpriteChoices_44":function(d){return "Ти молодець!"},
"saySpriteChoices_45":function(d){return "Ти кумедний!"},
"saySpriteChoices_46":function(d){return "Ти дурненький! "},
"saySpriteChoices_47":function(d){return "Ти хороший друг!"},
"saySpriteChoices_48":function(d){return "Будьте уважні!"},
"saySpriteChoices_49":function(d){return "Качка!"},
"saySpriteChoices_50":function(d){return "Попався!"},
"saySpriteChoices_51":function(d){return "Ой!"},
"saySpriteChoices_52":function(d){return "Вибачте!"},
"saySpriteChoices_53":function(d){return "Обережно!"},
"saySpriteChoices_54":function(d){return "Ура!"},
"saySpriteChoices_55":function(d){return "Ой!"},
"saySpriteChoices_56":function(d){return "Ви майже зловили мене!"},
"saySpriteChoices_57":function(d){return "Хороша спроба!"},
"saySpriteChoices_58":function(d){return "Не спіймаєш!"},
"scoreText":function(d){return "Рахунок: "+studio_locale.v(d,"playerScore")},
"setActivityRandom":function(d){return "встановити діяльність як випадкову для"},
"setActivityRoam":function(d){return "встановити діяльність бродіння для"},
"setActivityChase":function(d){return "встановити діяльність як переслідування для"},
"setActivityFlee":function(d){return "встановити діяльність як втечу для"},
"setActivityNone":function(d){return "встановити діяльність як відсутню для"},
"setActivityTooltip":function(d){return "Встановлює діяльність для набору елементів"},
"setBackground":function(d){return "встановити тло"},
"setBackgroundRandom":function(d){return "встановити випадкове тло"},
"setBackgroundBlack":function(d){return "встановити чорне тло"},
"setBackgroundCave":function(d){return "встановити тло печери"},
"setBackgroundCloudy":function(d){return "встановити хмарне тло"},
"setBackgroundHardcourt":function(d){return "встановити тло тенісного залу"},
"setBackgroundNight":function(d){return "встановити нічне тло"},
"setBackgroundUnderwater":function(d){return "встановити тло підводне"},
"setBackgroundCity":function(d){return "встановити тло міста"},
"setBackgroundDesert":function(d){return "встановити тло пустелі"},
"setBackgroundRainbow":function(d){return "встановити тло веселки"},
"setBackgroundSoccer":function(d){return "встановити тло футболу"},
"setBackgroundSpace":function(d){return "встановити тло космосу"},
"setBackgroundTennis":function(d){return "встановити тло тенісу"},
"setBackgroundWinter":function(d){return "встановити тло зими"},
"setBackgroundLeafy":function(d){return "встановити листяний фон"},
"setBackgroundGrassy":function(d){return "встановити трав'янистий фон"},
"setBackgroundFlower":function(d){return "встановити квітковий фон"},
"setBackgroundTile":function(d){return "встановити черепичний фон"},
"setBackgroundIcy":function(d){return "встановити крижаний фон"},
"setBackgroundSnowy":function(d){return "встановити сніжний фон"},
"setBackgroundForest":function(d){return "встановити тло лісу"},
"setBackgroundSnow":function(d){return "встановити тло снігу"},
"setBackgroundShip":function(d){return "встановити тло корабля"},
"setBackgroundTooltip":function(d){return "Встановлює фонове зображення"},
"setEnemySpeed":function(d){return "встановити швидкість ворога"},
"setItemSpeedSet":function(d){return "встановити тип"},
"setItemSpeedTooltip":function(d){return "Встановлює швидкість для набору елементів"},
"setPlayerSpeed":function(d){return "встановити швидкість гравця"},
"setScoreText":function(d){return "встановити рахунок"},
"setScoreTextTooltip":function(d){return "Задає текст, який буде відображатися в області балів."},
"setSpriteEmotionAngry":function(d){return "на поганий настрій"},
"setSpriteEmotionHappy":function(d){return "до радісного настрою"},
"setSpriteEmotionNormal":function(d){return "до нормального настрою"},
"setSpriteEmotionRandom":function(d){return "до випадкового настрою"},
"setSpriteEmotionSad":function(d){return "до сумного настрою"},
"setSpriteEmotionTooltip":function(d){return "Встановлює настрій персонажа"},
"setSpriteAlien":function(d){return "у зображення інопланетянина"},
"setSpriteBat":function(d){return "у зображення кажана"},
"setSpriteBird":function(d){return "у зображення птаха"},
"setSpriteCat":function(d){return "у зображення кота"},
"setSpriteCaveBoy":function(d){return "на зображення печерного хлопчика"},
"setSpriteCaveGirl":function(d){return "на зображення печерної дівчинки"},
"setSpriteDinosaur":function(d){return "у зображення динозавра"},
"setSpriteDog":function(d){return "у зображення собаки"},
"setSpriteDragon":function(d){return "у зображення дракона"},
"setSpriteGhost":function(d){return "у зображення привида"},
"setSpriteHidden":function(d){return "у приховане зображення"},
"setSpriteHideK1":function(d){return "приховати"},
"setSpriteAnna":function(d){return "на зображення Анни"},
"setSpriteElsa":function(d){return "на зображення Ельзи"},
"setSpriteHiro":function(d){return "у зображення Хіро"},
"setSpriteBaymax":function(d){return "у зображення Беймаксу"},
"setSpriteRapunzel":function(d){return "у зображення Рапунцель"},
"setSpriteKnight":function(d){return "у зображення лицаря"},
"setSpriteMonster":function(d){return "у зображення монстра"},
"setSpriteNinja":function(d){return "у зображення ніндзя у масці"},
"setSpriteOctopus":function(d){return "у зображення восьминога"},
"setSpritePenguin":function(d){return "у зображення пінгвіна"},
"setSpritePirate":function(d){return "у зображення пірата"},
"setSpritePrincess":function(d){return "у зображення принцеси"},
"setSpriteRandom":function(d){return "у випадкове зображення"},
"setSpriteRobot":function(d){return "у зображення робота"},
"setSpriteShowK1":function(d){return "показати"},
"setSpriteSpacebot":function(d){return "у зображення космонавта"},
"setSpriteSoccerGirl":function(d){return "на зображення дівчинки-футболістки"},
"setSpriteSoccerBoy":function(d){return "на зображення хлопчика-футболіста"},
"setSpriteSquirrel":function(d){return "у зображення білочки"},
"setSpriteTennisGirl":function(d){return "на зображення дівчинки-тенісистки"},
"setSpriteTennisBoy":function(d){return "на зображення хлопчика-тенісиста"},
"setSpriteUnicorn":function(d){return "у зображення єдинорога"},
"setSpriteWitch":function(d){return "у зображення відьми"},
"setSpriteWizard":function(d){return "у зображення чарівника"},
"setSpritePositionTooltip":function(d){return "Миттєво переміщує персонажа у вказане місце."},
"setSpriteK1Tooltip":function(d){return "Показує або приховує вказаного персонажа."},
"setSpriteTooltip":function(d){return "Встановлює зображення персонажа"},
"setSpriteSizeRandom":function(d){return "до випадкового розміру"},
"setSpriteSizeVerySmall":function(d){return "до дуже малого розміру"},
"setSpriteSizeSmall":function(d){return "до малого розміру"},
"setSpriteSizeNormal":function(d){return "до звичайного розміру"},
"setSpriteSizeLarge":function(d){return "до великого розміру"},
"setSpriteSizeVeryLarge":function(d){return "до дуже великого розміру"},
"setSpriteSizeTooltip":function(d){return "Встановлює розмір персонажа"},
"setSpriteSpeedRandom":function(d){return "до випадкової швидкості"},
"setSpriteSpeedVerySlow":function(d){return "до дуже повільної швидкості"},
"setSpriteSpeedSlow":function(d){return "до повільної швидкості"},
"setSpriteSpeedNormal":function(d){return "до нормальної швидкості"},
"setSpriteSpeedFast":function(d){return "до високої швидкості"},
"setSpriteSpeedVeryFast":function(d){return "до дуже високої швидкості"},
"setSpriteSpeedTooltip":function(d){return "Встановлює швидкість персонажа"},
"setSpriteZombie":function(d){return "у зображення зомбі"},
"setSpriteBot1":function(d){return "до бота1"},
"setSpriteBot2":function(d){return "до бота2"},
"setMap":function(d){return "встановити карту"},
"setMapRandom":function(d){return "встановити випадкову карту"},
"setMapBlank":function(d){return "встановити порожню карту"},
"setMapCircle":function(d){return "встановити карту кола"},
"setMapCircle2":function(d){return "встановити карту кола2"},
"setMapHorizontal":function(d){return "встановити горизонтальну карту"},
"setMapGrid":function(d){return "встановити карту сітки"},
"setMapBlobs":function(d){return "встановити карту крапель"},
"setMapTooltip":function(d){return "Змінює карту сцени"},
"shareStudioTwitter":function(d){return "Подивіться на гру, яку я зробив! Я написав її сам разом з @codeorg"},
"shareGame":function(d){return "Поділися своєю історією:"},
"showCoordinates":function(d){return "показати координати"},
"showCoordinatesTooltip":function(d){return "показати координати головного героя на екрані"},
"showTitleScreen":function(d){return "показати титульний екран"},
"showTitleScreenTitle":function(d){return "назва"},
"showTitleScreenText":function(d){return "текст"},
"showTSDefTitle":function(d){return "надрукуйте тут заголовок"},
"showTSDefText":function(d){return "надрукуйте тут текст"},
"showTitleScreenTooltip":function(d){return "Показати титульний екран з відповідним заголовком і текстом."},
"size":function(d){return "розмір"},
"setSprite":function(d){return "встановити"},
"setSpriteN":function(d){return "встановити персонажа "+studio_locale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "хрускіт"},
"soundGoal1":function(d){return "ціль 1"},
"soundGoal2":function(d){return "ціль 2"},
"soundHit":function(d){return "удар"},
"soundLosePoint":function(d){return "втрата балу"},
"soundLosePoint2":function(d){return "втрата балу 2"},
"soundRetro":function(d){return "ретро"},
"soundRubber":function(d){return "гума"},
"soundSlap":function(d){return "ляпас"},
"soundWinPoint":function(d){return "виграшний бал"},
"soundWinPoint2":function(d){return "виграшний бал 2"},
"soundWood":function(d){return "дерево"},
"speed":function(d){return "швидкість"},
"startSetValue":function(d){return "почати (функції)"},
"startSetVars":function(d){return "game_vars (назва, заголовок, тло, ціль, небезпека, гравець)"},
"startSetFuncs":function(d){return "game_funcs (оновити ціль, оновити небезпеку, оновити гравця, зіткнення?, на екрані?)"},
"stopSprite":function(d){return "зупинити"},
"stopSpriteN":function(d){return "зупинити персонажа "+studio_locale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Зупинити рух персонажа."},
"throwSprite":function(d){return "кидати"},
"throwSpriteN":function(d){return "персонаж "+studio_locale.v(d,"spriteIndex")+" кидає"},
"throwTooltip":function(d){return "Кидати снаряд від вказаного актора."},
"vanish":function(d){return "зникнути"},
"vanishActorN":function(d){return "зникнути персонажу "+studio_locale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "Персонаж зникає."},
"waitFor":function(d){return "чекати на"},
"waitSeconds":function(d){return "секунди"},
"waitForClick":function(d){return "чекати на клік"},
"waitForRandom":function(d){return "чекати випадковий час"},
"waitForHalfSecond":function(d){return "чекати півсекунди"},
"waitFor1Second":function(d){return "чекати 1 секунду"},
"waitFor2Seconds":function(d){return "чекати 2 секунди"},
"waitFor5Seconds":function(d){return "чекати 5 секунд"},
"waitFor10Seconds":function(d){return "чекати 10 секунд"},
"waitParamsTooltip":function(d){return "Очікування заданої кількості секунд або задайте нуль, щоб чекати, поки не відбудеться клік."},
"waitTooltip":function(d){return "Очікувати визначений період часу, або до клацання."},
"whenArrowDown":function(d){return "стрілка вниз"},
"whenArrowLeft":function(d){return "стрілка ліворуч"},
"whenArrowRight":function(d){return "стрілка праворуч"},
"whenArrowUp":function(d){return "стрілка вгору"},
"whenArrowTooltip":function(d){return "Виконання дій, поданих нижче, коли натиснута відповідна клавіша стрілки."},
"whenDown":function(d){return "Коли стрілка вниз"},
"whenDownTooltip":function(d){return "Виконати дії, подані нижче, при натисненні клавіші стрілка вниз."},
"whenGameStarts":function(d){return "коли історія починається"},
"whenGameStartsTooltip":function(d){return "Виконання дій, поданих нижче, коли історія починається."},
"whenLeft":function(d){return "коли стрілка Вліво"},
"whenLeftTooltip":function(d){return "Виконати дії, подані нижче, при натисненні клавіші стрілка вліво."},
"whenRight":function(d){return "коли стрілка Вправо"},
"whenRightTooltip":function(d){return "Виконати дії, подані нижче, при натисненні клавіші стрілка вправо."},
"whenSpriteClicked":function(d){return "коли персонаж клацнули"},
"whenSpriteClickedN":function(d){return "коли клацнули персонажа "+studio_locale.v(d,"spriteIndex")},
"whenSpriteClickedTooltip":function(d){return "Виконати дії, подані нижче, коли клацнули персонаж."},
"whenSpriteCollidedN":function(d){return "коли персонаж "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "Виконати дії, подані нижче, коли персонаж торкається іншого персонажу."},
"whenSpriteCollidedWith":function(d){return "торкається"},
"whenSpriteCollidedWithAnyActor":function(d){return "торкається будь-якого персонажу"},
"whenSpriteCollidedWithAnyEdge":function(d){return "торкається будь-якого краю"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "торкається будь-якого снаряду"},
"whenSpriteCollidedWithAnything":function(d){return "торкається будь-чого"},
"whenSpriteCollidedWithN":function(d){return "торкається персонажа "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "торкається синьої вогняної кулі"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "торкається фіолетової вогняної кулі"},
"whenSpriteCollidedWithRedFireball":function(d){return "торкається червоної вогняної кулі"},
"whenSpriteCollidedWithYellowHearts":function(d){return "торкається жовтих сердець"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "торкається фіолетових сердець"},
"whenSpriteCollidedWithRedHearts":function(d){return "торкається червоних сердець"},
"whenSpriteCollidedWithBottomEdge":function(d){return "торкається нижнього краю"},
"whenSpriteCollidedWithLeftEdge":function(d){return "торкається лівого краю"},
"whenSpriteCollidedWithRightEdge":function(d){return "торкається правого краю"},
"whenSpriteCollidedWithTopEdge":function(d){return "торкається верхнього краю"},
"whenTouchItem":function(d){return "коли елементу торкнулись"},
"whenTouchItemTooltip":function(d){return "Виконує дії, подані нижче, коли персонаж торкається об'єкту."},
"whenTouchWall":function(d){return "коли торкнулись стіни"},
"whenTouchWallTooltip":function(d){return "Виконує дії, подані нижче, коли персонаж торкається стіни."},
"whenUp":function(d){return "коли стрілка Вгору"},
"whenUpTooltip":function(d){return "Виконати дії, подані нижче, при натисненні клавіші стрілка вгору."},
"yes":function(d){return "Так"},
"failedHasSetSprite":function(d){return "Next time, set a character."},
"failedHasSetBotSpeed":function(d){return "Next time, set a bot speed."},
"failedTouchAllItems":function(d){return "Next time, get all the items."},
"failedScoreMinimum":function(d){return "Next time, reach the minimum score."},
"failedRemovedItemCount":function(d){return "Next time, get the right number of items."},
"failedSetActivity":function(d){return "Next time, set the correct character activity."},
"calloutPutCommandsHereRunStart":function(d){return "Put commands here to have them run when the program starts"},
"calloutUseArrowButtons":function(d){return "Hold down these buttons or the arrow keys on your keyboard to trigger the move events."},
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
"loseMessage":function(d){return "You lose!"},
"winMessage":function(d){return "You win!"},
"failedHasSetBackground":function(d){return "Next time, set the background."},
"failedHasSetMap":function(d){return "Next time, set the map."},
"failedHasWonGame":function(d){return "Next time, win the game."},
"failedHasLostGame":function(d){return "Next time, lose the game"},
"failedAddItem":function(d){return "Next time, add a character."},
"failedAvoidHazard":function(d){return "Next time, don't touch the hazard."}};