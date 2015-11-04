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
"actor":function(d){return "актьор"},
"addCharacter":function(d){return "добави"},
"addCharacterTooltip":function(d){return "Добавяне на характер в сцената."},
"alienInvasion":function(d){return "Извънземна инвазия!"},
"backgroundBlack":function(d){return "черно"},
"backgroundCave":function(d){return "пещера"},
"backgroundCloudy":function(d){return "облачен"},
"backgroundHardcourt":function(d){return "твърда настилка"},
"backgroundNight":function(d){return "нощ"},
"backgroundUnderwater":function(d){return "под вода"},
"backgroundCity":function(d){return "град"},
"backgroundDesert":function(d){return "пустиня"},
"backgroundRainbow":function(d){return "дъга"},
"backgroundSoccer":function(d){return "футбол"},
"backgroundSpace":function(d){return "космос"},
"backgroundTennis":function(d){return "тенис"},
"backgroundWinter":function(d){return "зима"},
"calloutPlaceCommandsHere":function(d){return "Place commands here"},
"calloutPlaceCommandsAtTop":function(d){return "Place commands to set up your game at the top"},
"calloutTypeCommandsHere":function(d){return "Type your commands here"},
"calloutCharactersMove":function(d){return "These new commands let you control how the characters move"},
"calloutPutCommandsTouchCharacter":function(d){return "Put a command here to have it happen when you touch a character"},
"calloutClickCategory":function(d){return "Click a category header to see commands in each category"},
"calloutTryOutNewCommands":function(d){return "Try out all the new commands you’ve unlocked"},
"catActions":function(d){return "Действия"},
"catControl":function(d){return "Повторения"},
"catEvents":function(d){return "Събития"},
"catLogic":function(d){return "Логика"},
"catMath":function(d){return "Математика"},
"catProcedures":function(d){return "Функции"},
"catText":function(d){return "Текст"},
"catVariables":function(d){return "Променливи"},
"changeScoreTooltip":function(d){return "Добавяне или премахване на точка към резултата."},
"changeScoreTooltipK1":function(d){return "Добавяне на точка към резултата."},
"continue":function(d){return "Напред"},
"decrementPlayerScore":function(d){return "премахване на точка"},
"defaultSayText":function(d){return "Въведете тук"},
"dropletBlock_addCharacter_description":function(d){return "Добавяне на характер в сцената."},
"dropletBlock_addCharacter_param0":function(d){return "type"},
"dropletBlock_addCharacter_param0_description":function(d){return "The type of the character to be added ('random', 'man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_changeScore_description":function(d){return "Добавяне или премахване на точка към резултата."},
"dropletBlock_changeScore_param0":function(d){return "точки"},
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
"dropletBlock_playSound_description":function(d){return "Възпроизвеждане на избраният звук."},
"dropletBlock_playSound_param0":function(d){return "sound"},
"dropletBlock_playSound_param0_description":function(d){return "The name of the sound to play."},
"dropletBlock_setBackground_description":function(d){return "Задава фон"},
"dropletBlock_setBackground_param0":function(d){return "image"},
"dropletBlock_setBackground_param0_description":function(d){return "The name of the background theme ('background1', 'background2', or 'background3')."},
"dropletBlock_setBot_description":function(d){return "Changes the active bot."},
"dropletBlock_setBot_param0":function(d){return "изображение"},
"dropletBlock_setBot_param0_description":function(d){return "The name of the bot image ('random', 'bot1', or 'bot2')."},
"dropletBlock_setBotSpeed_description":function(d){return "Sets the bot speed."},
"dropletBlock_setBotSpeed_param0":function(d){return "скорост"},
"dropletBlock_setBotSpeed_param0_description":function(d){return "The speed value ('random', 'slow', 'normal', or 'fast')."},
"dropletBlock_setSpriteEmotion_description":function(d){return "Задава настроението на Актьора"},
"dropletBlock_setSpritePosition_description":function(d){return "Веднага придвижва актьор към указаното местоположение."},
"dropletBlock_setSpriteSpeed_description":function(d){return "Задава скоростта на актьор"},
"dropletBlock_setSprite_description":function(d){return "Задава изображение на актьора"},
"dropletBlock_setSprite_param0":function(d){return "индекс"},
"dropletBlock_setSprite_param0_description":function(d){return "The index (starting at 0) indicating which actor should change."},
"dropletBlock_setSprite_param1":function(d){return "изображение"},
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
"dropletBlock_throw_description":function(d){return "Хвърляне на снаряд от определен актьор."},
"dropletBlock_vanish_description":function(d){return "Изчезване на актьор."},
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
"emotion":function(d){return "настроение"},
"finalLevel":function(d){return "Поздравления! Вие решихте последния пъзел."},
"for":function(d){return "за"},
"hello":function(d){return "Здравейте"},
"helloWorld":function(d){return "Здравей, свят!"},
"incrementPlayerScore":function(d){return "получава точка"},
"itemBlueFireball":function(d){return "синя огнена топка"},
"itemPurpleFireball":function(d){return "лилава огнена топка"},
"itemRedFireball":function(d){return "червена огнена топка"},
"itemYellowHearts":function(d){return "жълти сърца"},
"itemPurpleHearts":function(d){return "лилави сърца"},
"itemRedHearts":function(d){return "червени сърца"},
"itemRandom":function(d){return "случаен"},
"itemAnna":function(d){return "кука"},
"itemElsa":function(d){return "блясък"},
"itemHiro":function(d){return "микроботи"},
"itemBaymax":function(d){return "ракета"},
"itemRapunzel":function(d){return "тиган"},
"itemCherry":function(d){return "череша"},
"itemIce":function(d){return "лед"},
"itemDuck":function(d){return "патица"},
"itemMan":function(d){return "мъж"},
"itemPilot":function(d){return "пилот"},
"itemPig":function(d){return "прасе"},
"itemBird":function(d){return "птица"},
"itemMouse":function(d){return "мишка"},
"itemRoo":function(d){return "Ру"},
"itemSpider":function(d){return "паяк"},
"makeProjectileDisappear":function(d){return "изчезва"},
"makeProjectileBounce":function(d){return "скача"},
"makeProjectileBlueFireball":function(d){return "направи синя огнена топка"},
"makeProjectilePurpleFireball":function(d){return "направи лилава огнена топка"},
"makeProjectileRedFireball":function(d){return "направи червена огнена топка"},
"makeProjectileYellowHearts":function(d){return "направи жълти сърца"},
"makeProjectilePurpleHearts":function(d){return "направи лилави сърца"},
"makeProjectileRedHearts":function(d){return "направи червени сърца"},
"makeProjectileTooltip":function(d){return "Направи снаряд, който се блъска, изчезва или скача."},
"makeYourOwn":function(d){return "Направете свое собствено \"Театрална лаборатория\" приложение"},
"moveDirectionDown":function(d){return "надолу"},
"moveDirectionLeft":function(d){return "наляво"},
"moveDirectionRight":function(d){return "надясно"},
"moveDirectionUp":function(d){return "нагоре"},
"moveDirectionRandom":function(d){return "случаен"},
"moveDistance25":function(d){return "25 пиксела"},
"moveDistance50":function(d){return "50 пиксела"},
"moveDistance100":function(d){return "100 пиксела"},
"moveDistance200":function(d){return "200 пиксела"},
"moveDistance400":function(d){return "400 пиксела"},
"moveDistancePixels":function(d){return "пиксели"},
"moveDistanceRandom":function(d){return "случаен брой пиксели"},
"moveDistanceTooltip":function(d){return "Премества актьора на определена дистанция в определената посока."},
"moveSprite":function(d){return "Премести"},
"moveSpriteN":function(d){return "Премести актьор "+studio_locale.v(d,"spriteIndex")},
"toXY":function(d){return "спрямо x, y"},
"moveDown":function(d){return "Премести надолу"},
"moveDownTooltip":function(d){return "Премести актьора надолу."},
"moveLeft":function(d){return "премести наляво"},
"moveLeftTooltip":function(d){return "Преместване на актьора наляво."},
"moveRight":function(d){return "Премести надясно"},
"moveRightTooltip":function(d){return "Премества актьора надясно."},
"moveUp":function(d){return "Премести нагоре"},
"moveUpTooltip":function(d){return "Премества актьор нагоре."},
"moveTooltip":function(d){return "Преместване на актьор."},
"nextLevel":function(d){return "Поздравления! Вие завършихте този пъзел."},
"no":function(d){return "Не"},
"numBlocksNeeded":function(d){return "Този пъзел може да бъде решен с %1 блока."},
"onEventTooltip":function(d){return "Изпълнение на код в отговор на дадено събитие."},
"ouchExclamation":function(d){return "Ох!"},
"playSoundCrunch":function(d){return "възпроизвежда звук за разбиване"},
"playSoundGoal1":function(d){return "възпроизвежда звук 1 гол"},
"playSoundGoal2":function(d){return "възпроизвежда звук  2 гол"},
"playSoundHit":function(d){return "възпроизвежда звук за удар"},
"playSoundLosePoint":function(d){return "възпроизвежда звук за загуба на точка"},
"playSoundLosePoint2":function(d){return "възпроизвежда звук 2 за загуба на точка"},
"playSoundRetro":function(d){return "възпроизвежда ретро звук"},
"playSoundRubber":function(d){return "възпроизвежда звук на ластик"},
"playSoundSlap":function(d){return "възпроизвежда звук от шамар"},
"playSoundTooltip":function(d){return "Възпроизвеждане на избрания звук."},
"playSoundWinPoint":function(d){return "възпроизвежда звук на победа точка"},
"playSoundWinPoint2":function(d){return "възпроизвежда звук 2 на победа точка"},
"playSoundWood":function(d){return "възпроизвежда звук от дърво"},
"positionOutTopLeft":function(d){return "на позиция горе вляво"},
"positionOutTopRight":function(d){return "към позиция горе вдясно"},
"positionTopOutLeft":function(d){return "горе извън лявата позиция"},
"positionTopLeft":function(d){return "позиция горе вляво"},
"positionTopCenter":function(d){return "позиция в центъра"},
"positionTopRight":function(d){return "на позиция горе вдясно"},
"positionTopOutRight":function(d){return "горе извън дясната позиция"},
"positionMiddleLeft":function(d){return "на позиция ляв център"},
"positionMiddleCenter":function(d){return "в позиция център"},
"positionMiddleRight":function(d){return "в позиция десен център"},
"positionBottomOutLeft":function(d){return "надолу, извън лявата позиция"},
"positionBottomLeft":function(d){return "в позиция долен ляв ъгъл"},
"positionBottomCenter":function(d){return "в позиция долен център"},
"positionBottomRight":function(d){return "в позиция долен десен ъгъл"},
"positionBottomOutRight":function(d){return "долу, извън дясната позиция"},
"positionOutBottomLeft":function(d){return "под долната лява позиция"},
"positionOutBottomRight":function(d){return "под долната дясна позиция"},
"positionRandom":function(d){return "на случайна позиция"},
"projectileBlueFireball":function(d){return "синя огнена топка"},
"projectilePurpleFireball":function(d){return "лилава огнена топка"},
"projectileRedFireball":function(d){return "червена огнена топка"},
"projectileYellowHearts":function(d){return "жълти сърца"},
"projectilePurpleHearts":function(d){return "лилави сърца"},
"projectileRedHearts":function(d){return "червени сърца"},
"projectileRandom":function(d){return "случаен"},
"projectileAnna":function(d){return "кука"},
"projectileElsa":function(d){return "блясък"},
"projectileHiro":function(d){return "микроботи"},
"projectileBaymax":function(d){return "ракета"},
"projectileRapunzel":function(d){return "тиган"},
"projectileCherry":function(d){return "череша"},
"projectileIce":function(d){return "лед"},
"projectileDuck":function(d){return "патица"},
"reinfFeedbackMsg":function(d){return "Можете да натиснете бутона \""+studio_locale.v(d,"backButton")+"\", за да се върнете да играете историята си."},
"repeatForever":function(d){return "повтаряй завинаги"},
"repeatDo":function(d){return "правя"},
"repeatForeverTooltip":function(d){return "Изпълнява действията в този блок, докато тече историята."},
"saySprite":function(d){return "казва"},
"saySpriteN":function(d){return "актьор "+studio_locale.v(d,"spriteIndex")+" казва"},
"saySpriteTooltip":function(d){return "Запълва балончето за реч със съответния текст на определен актьор."},
"saySpriteChoices_0":function(d){return "Здрасти."},
"saySpriteChoices_1":function(d){return "Здравейте."},
"saySpriteChoices_2":function(d){return "Какво правиш?"},
"saySpriteChoices_3":function(d){return "Добро утро"},
"saySpriteChoices_4":function(d){return "Добър ден"},
"saySpriteChoices_5":function(d){return "Добър вечер"},
"saySpriteChoices_6":function(d){return "Добър вечер"},
"saySpriteChoices_7":function(d){return "Какво ново?"},
"saySpriteChoices_8":function(d){return "Какво?"},
"saySpriteChoices_9":function(d){return "Къде?"},
"saySpriteChoices_10":function(d){return "Кога?"},
"saySpriteChoices_11":function(d){return "Добре."},
"saySpriteChoices_12":function(d){return "Чудесно!"},
"saySpriteChoices_13":function(d){return "Добре."},
"saySpriteChoices_14":function(d){return "Не е лошо."},
"saySpriteChoices_15":function(d){return "На добър час."},
"saySpriteChoices_16":function(d){return "Да"},
"saySpriteChoices_17":function(d){return "Не"},
"saySpriteChoices_18":function(d){return "Добре"},
"saySpriteChoices_19":function(d){return "Хубаво хвърляне!"},
"saySpriteChoices_20":function(d){return "Приятен ден."},
"saySpriteChoices_21":function(d){return "Чао."},
"saySpriteChoices_22":function(d){return "Ей сега се връщам."},
"saySpriteChoices_23":function(d){return "До утре!"},
"saySpriteChoices_24":function(d){return "До скоро!"},
"saySpriteChoices_25":function(d){return "Умната!"},
"saySpriteChoices_26":function(d){return "Наслаждавай се!"},
"saySpriteChoices_27":function(d){return "Трябва да тръгвам."},
"saySpriteChoices_28":function(d){return "Искаш ли да бъдем приятели?"},
"saySpriteChoices_29":function(d){return "Чудесна работа!"},
"saySpriteChoices_30":function(d){return "Йо!"},
"saySpriteChoices_31":function(d){return "Уау!"},
"saySpriteChoices_32":function(d){return "Радвам се да се запознаем."},
"saySpriteChoices_33":function(d){return "Добре!"},
"saySpriteChoices_34":function(d){return "Благодаря"},
"saySpriteChoices_35":function(d){return "Не, благодаря"},
"saySpriteChoices_36":function(d){return "Aaaaaaх!"},
"saySpriteChoices_37":function(d){return "Няма значение"},
"saySpriteChoices_38":function(d){return "Днес"},
"saySpriteChoices_39":function(d){return "Утре"},
"saySpriteChoices_40":function(d){return "Вчера"},
"saySpriteChoices_41":function(d){return "Намерих те!"},
"saySpriteChoices_42":function(d){return "Ти ме намери!"},
"saySpriteChoices_43":function(d){return "10, 9, 8, 7, 6, 5, 4, 3, 2, 1!"},
"saySpriteChoices_44":function(d){return "Вие сте страхотни!"},
"saySpriteChoices_45":function(d){return "Ти си забавен!"},
"saySpriteChoices_46":function(d){return "Вие сте глупави! "},
"saySpriteChoices_47":function(d){return "Вие сте добър приятел!"},
"saySpriteChoices_48":function(d){return "Пазете се!"},
"saySpriteChoices_49":function(d){return "Патица!"},
"saySpriteChoices_50":function(d){return "Пипнах те!"},
"saySpriteChoices_51":function(d){return "АУ!"},
"saySpriteChoices_52":function(d){return "Съжалявам!"},
"saySpriteChoices_53":function(d){return "Внимателно!"},
"saySpriteChoices_54":function(d){return "Уау!"},
"saySpriteChoices_55":function(d){return "Опа!"},
"saySpriteChoices_56":function(d){return "Почти ме хвана!"},
"saySpriteChoices_57":function(d){return "Добър опит!"},
"saySpriteChoices_58":function(d){return "Не можеш да ме хванеш!"},
"scoreText":function(d){return "Резултат: "+studio_locale.v(d,"playerScore")},
"setActivityRandom":function(d){return "Задаване дейност на случаен принцип за"},
"setActivityRoam":function(d){return "Задаване дейност за претърсване"},
"setActivityChase":function(d){return "Задайте дейност за преследване за"},
"setActivityFlee":function(d){return "Задаване дейност за бягство за"},
"setActivityNone":function(d){return "Задаване дейност за изчезване за"},
"setActivityTooltip":function(d){return "Задава дейността на набор от елементи"},
"setBackground":function(d){return "задава фон"},
"setBackgroundRandom":function(d){return "задава произволен фон"},
"setBackgroundBlack":function(d){return "задава черен фон"},
"setBackgroundCave":function(d){return "задава фон пещера"},
"setBackgroundCloudy":function(d){return "задава облачен фон"},
"setBackgroundHardcourt":function(d){return "задава фон с твърдо покритие"},
"setBackgroundNight":function(d){return "задава фон нощ"},
"setBackgroundUnderwater":function(d){return "задава подводен фон"},
"setBackgroundCity":function(d){return "задаване на фон град"},
"setBackgroundDesert":function(d){return "задаване на фон пустиня"},
"setBackgroundRainbow":function(d){return "задаване на фон дъга"},
"setBackgroundSoccer":function(d){return "задава на фон стадион"},
"setBackgroundSpace":function(d){return "задаване на фон космос"},
"setBackgroundTennis":function(d){return "задава фон тенискорт"},
"setBackgroundWinter":function(d){return "задава фон зима"},
"setBackgroundLeafy":function(d){return "Задава зелен фон"},
"setBackgroundGrassy":function(d){return "Задава тревист фон"},
"setBackgroundFlower":function(d){return "Задава фон цвете"},
"setBackgroundTile":function(d){return "задава фасетен фон"},
"setBackgroundIcy":function(d){return "Задава леден фон"},
"setBackgroundSnowy":function(d){return "Задава снежен фон"},
"setBackgroundForest":function(d){return "Задаване горски фон"},
"setBackgroundSnow":function(d){return "Задава снежен фон"},
"setBackgroundShip":function(d){return "Задаване кораб за фон"},
"setBackgroundTooltip":function(d){return "Задава фоновото изображение"},
"setEnemySpeed":function(d){return "задава скоростта на врага"},
"setItemSpeedSet":function(d){return "определяне на тип"},
"setItemSpeedTooltip":function(d){return "Задава скоростта на набор от елементи"},
"setPlayerSpeed":function(d){return "задава скоростта на героя"},
"setScoreText":function(d){return "задава резултат"},
"setScoreTextTooltip":function(d){return "Задава текста да се показва в областта на резултата."},
"setSpriteEmotionAngry":function(d){return "с ядосано настроение"},
"setSpriteEmotionHappy":function(d){return "с весело настроение"},
"setSpriteEmotionNormal":function(d){return "с нормално настроение"},
"setSpriteEmotionRandom":function(d){return "със случайно настроение"},
"setSpriteEmotionSad":function(d){return "с тъжно настроение"},
"setSpriteEmotionTooltip":function(d){return "Задава настроението на Актьора"},
"setSpriteAlien":function(d){return "извънземно"},
"setSpriteBat":function(d){return "прилеп"},
"setSpriteBird":function(d){return "птица"},
"setSpriteCat":function(d){return " котка"},
"setSpriteCaveBoy":function(d){return "пещерно момче"},
"setSpriteCaveGirl":function(d){return "пещерно момиче"},
"setSpriteDinosaur":function(d){return "динозавър"},
"setSpriteDog":function(d){return "куче"},
"setSpriteDragon":function(d){return "дракон"},
"setSpriteGhost":function(d){return "дух"},
"setSpriteHidden":function(d){return "скрито изображение"},
"setSpriteHideK1":function(d){return "скрива"},
"setSpriteAnna":function(d){return " Анна"},
"setSpriteElsa":function(d){return "Елза"},
"setSpriteHiro":function(d){return " Хиро"},
"setSpriteBaymax":function(d){return "Баумакс"},
"setSpriteRapunzel":function(d){return "Рапунцел"},
"setSpriteKnight":function(d){return "рицар"},
"setSpriteMonster":function(d){return "чудовище"},
"setSpriteNinja":function(d){return "маскиран нинджа"},
"setSpriteOctopus":function(d){return "октопод"},
"setSpritePenguin":function(d){return "пингвин"},
"setSpritePirate":function(d){return "пират"},
"setSpritePrincess":function(d){return "принцеса"},
"setSpriteRandom":function(d){return "случайно изображение"},
"setSpriteRobot":function(d){return "робот"},
"setSpriteShowK1":function(d){return "показва"},
"setSpriteSpacebot":function(d){return "космически робот"},
"setSpriteSoccerGirl":function(d){return "момиче футболист"},
"setSpriteSoccerBoy":function(d){return "момче футболист"},
"setSpriteSquirrel":function(d){return "катерица"},
"setSpriteTennisGirl":function(d){return "момиче тенесист"},
"setSpriteTennisBoy":function(d){return "момче тенесист"},
"setSpriteUnicorn":function(d){return "еднорог"},
"setSpriteWitch":function(d){return "вещица"},
"setSpriteWizard":function(d){return "магьосник"},
"setSpritePositionTooltip":function(d){return "Веднага придвижва актьор към указаното местоположение."},
"setSpriteK1Tooltip":function(d){return "Показва или скрива определен актьор."},
"setSpriteTooltip":function(d){return "Задава изображение на актьора"},
"setSpriteSizeRandom":function(d){return "с произволен размер"},
"setSpriteSizeVerySmall":function(d){return "с много малък размер"},
"setSpriteSizeSmall":function(d){return "с малък размер"},
"setSpriteSizeNormal":function(d){return "с нормален размер"},
"setSpriteSizeLarge":function(d){return "с голям размер"},
"setSpriteSizeVeryLarge":function(d){return "с много голям размер"},
"setSpriteSizeTooltip":function(d){return "Задава размера на актьор"},
"setSpriteSpeedRandom":function(d){return "на случайна скорост"},
"setSpriteSpeedVerySlow":function(d){return "на много бавна скорост"},
"setSpriteSpeedSlow":function(d){return "на бавна скорост"},
"setSpriteSpeedNormal":function(d){return " нормална скорост"},
"setSpriteSpeedFast":function(d){return " бърза скорост"},
"setSpriteSpeedVeryFast":function(d){return "много бърза скорост"},
"setSpriteSpeedTooltip":function(d){return "Задава скоростта на актьор"},
"setSpriteZombie":function(d){return "зомби"},
"setSpriteBot1":function(d){return "за бот1"},
"setSpriteBot2":function(d){return "за бот2"},
"setMap":function(d){return "задава карта"},
"setMapRandom":function(d){return "задава случайна карта"},
"setMapBlank":function(d){return "задава празна карта"},
"setMapCircle":function(d){return "задава кръгова карта"},
"setMapCircle2":function(d){return "задава кръгова карта2"},
"setMapHorizontal":function(d){return "задава хоризонтална карта"},
"setMapGrid":function(d){return "поставя мрежова карта"},
"setMapBlobs":function(d){return "задава петниста карта"},
"setMapTooltip":function(d){return "Променя картата в сцената"},
"shareStudioTwitter":function(d){return "Вижте историята, която направих. Аз сам я написал с @codeorg"},
"shareGame":function(d){return "Споделете вашата история:"},
"showCoordinates":function(d){return "показва координати"},
"showCoordinatesTooltip":function(d){return "показва координатите на главния герой на екрана"},
"showTitleScreen":function(d){return "показва заглавния екран"},
"showTitleScreenTitle":function(d){return "Заглавие"},
"showTitleScreenText":function(d){return "текст"},
"showTSDefTitle":function(d){return "напиши заглавието тук"},
"showTSDefText":function(d){return "Въведете текст тук"},
"showTitleScreenTooltip":function(d){return "Покажи заглавието на екрана."},
"size":function(d){return "размер"},
"setSprite":function(d){return "задай"},
"setSpriteN":function(d){return "Задаване на актьор "+studio_locale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "криза"},
"soundGoal1":function(d){return "цел 1"},
"soundGoal2":function(d){return "цел 2"},
"soundHit":function(d){return "удар"},
"soundLosePoint":function(d){return "загуби точка"},
"soundLosePoint2":function(d){return "загуби точка 2"},
"soundRetro":function(d){return "ретро"},
"soundRubber":function(d){return "каучук"},
"soundSlap":function(d){return "шамар"},
"soundWinPoint":function(d){return "спечели точка"},
"soundWinPoint2":function(d){return "спечели точка 2"},
"soundWood":function(d){return "дърво"},
"speed":function(d){return "скорост"},
"startSetValue":function(d){return "Старт (функция)"},
"startSetVars":function(d){return "game_vars (title, subtitle, background, target, danger, player)"},
"startSetFuncs":function(d){return "game_funcs (update-target, update-danger, update-player, collide?, on-screen?)"},
"stopSprite":function(d){return "Стоп"},
"stopSpriteN":function(d){return "спира актьор "+studio_locale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Спира движението на актьора."},
"throwSprite":function(d){return "хвърля"},
"throwSpriteN":function(d){return "актьор "+studio_locale.v(d,"spriteIndex")+" хвърля"},
"throwTooltip":function(d){return "Хвърляне на снаряд от определен актьор."},
"vanish":function(d){return "изчезване"},
"vanishActorN":function(d){return "изчезва актьор "+studio_locale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "Изчезване на актьор."},
"waitFor":function(d){return "изчакай за"},
"waitSeconds":function(d){return "секунди"},
"waitForClick":function(d){return "изчаква за кликване"},
"waitForRandom":function(d){return "изчаква случайно време"},
"waitForHalfSecond":function(d){return "половин секунда"},
"waitFor1Second":function(d){return "1 секунда"},
"waitFor2Seconds":function(d){return "изчаква за 2 секунди"},
"waitFor5Seconds":function(d){return "изчакава 5 секунди"},
"waitFor10Seconds":function(d){return "изчаква 10 секунди"},
"waitParamsTooltip":function(d){return "Задава определен брой секунди да се изчака или нула за изчакване след едно кликване."},
"waitTooltip":function(d){return "Изчакване за определен период от време или до извършване на щракване."},
"whenArrowDown":function(d){return "стрелка надолу"},
"whenArrowLeft":function(d){return "лява стрелка"},
"whenArrowRight":function(d){return "стрелка надясно"},
"whenArrowUp":function(d){return "стрелка нагоре"},
"whenArrowTooltip":function(d){return "Следва действията по-долу когато е натисната определена стрелка."},
"whenDown":function(d){return "когато стрелката надолу"},
"whenDownTooltip":function(d){return "Изпълнява действията по-долу когато се натисне стрелка надолу."},
"whenGameStarts":function(d){return "Когато историята започва"},
"whenGameStartsTooltip":function(d){return "Следва действията по-долу, когато историята започва."},
"whenLeft":function(d){return "когато стрелка наляво "},
"whenLeftTooltip":function(d){return "Изпълнява действията по-долу когато се натисне стрелка надолу."},
"whenRight":function(d){return "когато стрелка надясно"},
"whenRightTooltip":function(d){return "Изпълнява действията по-долу когато е натисната стрелка надясно."},
"whenSpriteClicked":function(d){return "Когато е кликнато върху актьор"},
"whenSpriteClickedN":function(d){return "когато е кликнато върху актьор "+studio_locale.v(d,"spriteIndex")},
"whenSpriteClickedTooltip":function(d){return "Изпълнява действията по-долу когато се кликне върху актьор."},
"whenSpriteCollidedN":function(d){return "когато актьор "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "Изпълнява действията по-долу когато актьор докосва друг актьор."},
"whenSpriteCollidedWith":function(d){return "докосване"},
"whenSpriteCollidedWithAnyActor":function(d){return "докосва някой актьор"},
"whenSpriteCollidedWithAnyEdge":function(d){return "допира някой от краищата"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "докосва ракета"},
"whenSpriteCollidedWithAnything":function(d){return "докосва нещо"},
"whenSpriteCollidedWithN":function(d){return "докосва актьор "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "докосва синята огнена топка"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "докосва лилавата огнена топка"},
"whenSpriteCollidedWithRedFireball":function(d){return "докосва червената огнена топка"},
"whenSpriteCollidedWithYellowHearts":function(d){return "докосва жълтите сърца"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "докосва лилавите сърца"},
"whenSpriteCollidedWithRedHearts":function(d){return "докосва червените сърца"},
"whenSpriteCollidedWithBottomEdge":function(d){return "докосва долния ръб"},
"whenSpriteCollidedWithLeftEdge":function(d){return "докосва ляв ръб"},
"whenSpriteCollidedWithRightEdge":function(d){return "докосва десния ръб"},
"whenSpriteCollidedWithTopEdge":function(d){return "докосва горния ръб"},
"whenTouchItem":function(d){return "Когато е докоснат елемент"},
"whenTouchItemTooltip":function(d){return "Изпълни действията по-долу, когато Актьорът докосва елемент."},
"whenTouchWall":function(d){return "Когато е докосната стената"},
"whenTouchWallTooltip":function(d){return "Изпълни действията по-долу, когато Актьорът докосва стена."},
"whenUp":function(d){return "когато стрелка нагоре"},
"whenUpTooltip":function(d){return "Изпълнява действията по-долу когато е натисната стрелка нагоре."},
"yes":function(d){return "Да"},
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