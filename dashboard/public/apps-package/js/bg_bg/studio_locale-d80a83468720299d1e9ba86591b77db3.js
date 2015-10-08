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
"addItems1":function(d){return "Добавяне на 1 елемент от тип"},
"addItems2":function(d){return "Добавяне на 2 елемента от тип"},
"addItems3":function(d){return "Добавяне на 3 елемента от тип"},
"addItems5":function(d){return "Добавяне на 5 елемента от тип"},
"addItems10":function(d){return "Добавяне на 10 елемента от тип"},
"addItemsRandom":function(d){return "Добавяне на случайни елементи от тип"},
"addItemsTooltip":function(d){return "Добавяне на елементи към сцената."},
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
"dropletBlock_addItemsToScene_description":function(d){return "Add new items to the scene."},
"dropletBlock_addItemsToScene_param0":function(d){return "type"},
"dropletBlock_addItemsToScene_param0_description":function(d){return "The type of items to be added ('item_walk_item1', 'item_walk_item2', 'item_walk_item3', or ''item_walk_item4'."},
"dropletBlock_addItemsToScene_param1":function(d){return "count"},
"dropletBlock_addItemsToScene_param1_description":function(d){return "The number of items to add."},
"dropletBlock_changeScore_description":function(d){return "Добавяне или премахване на точка към резултата."},
"dropletBlock_changeScore_param0":function(d){return "точки"},
"dropletBlock_changeScore_param0_description":function(d){return "The value to add to the score (negative values will reduce the score)."},
"dropletBlock_moveEast_description":function(d){return "Moves the character to the east."},
"dropletBlock_moveNorth_description":function(d){return "Moves the character to the north."},
"dropletBlock_moveSouth_description":function(d){return "Moves the character to the south."},
"dropletBlock_moveWest_description":function(d){return "Moves the character to the west."},
"dropletBlock_playSound_description":function(d){return "Възпроизвеждане на избраният звук."},
"dropletBlock_playSound_param0":function(d){return "sound"},
"dropletBlock_playSound_param0_description":function(d){return "The name of the sound to play."},
"dropletBlock_setBackground_description":function(d){return "Този блок променя изображението на фона на играта."},
"dropletBlock_setBackground_param0":function(d){return "image"},
"dropletBlock_setBackground_param0_description":function(d){return "The name of the background theme ('background1', 'background2', or 'background3')."},
"dropletBlock_setItemActivity_description":function(d){return "Sets the activity mode for a set of items."},
"dropletBlock_setItemActivity_param0":function(d){return "type"},
"dropletBlock_setItemActivity_param0_description":function(d){return "The type of items to be changed ('item_walk_item1', 'item_walk_item2', 'item_walk_item3', or ''item_walk_item4'."},
"dropletBlock_setItemActivity_param1":function(d){return "activity"},
"dropletBlock_setItemActivity_param1_description":function(d){return "The name of the activity mode ('patrol', 'chase', 'flee', or 'none')."},
"dropletBlock_setItemSpeed_description":function(d){return "Sets the speed for a set of items."},
"dropletBlock_setItemSpeed_param0":function(d){return "type"},
"dropletBlock_setItemSpeed_param0_description":function(d){return "The type of items to be changed ('item_walk_item1', 'item_walk_item2', 'item_walk_item3', or ''item_walk_item4'."},
"dropletBlock_setItemSpeed_param1":function(d){return "скорост"},
"dropletBlock_setItemSpeed_param1_description":function(d){return "The speed value (2, 3, 5, 8, or 12)."},
"dropletBlock_setCharacter_description":function(d){return "Sets the character image."},
"dropletBlock_setCharacter_param0":function(d){return "image"},
"dropletBlock_setCharacter_param0_description":function(d){return "The name of the character image ('character1' or 'character2')."},
"dropletBlock_setCharacterSpeed_description":function(d){return "Sets the character speed."},
"dropletBlock_setCharacterSpeed_param0":function(d){return "скорост"},
"dropletBlock_setCharacterSpeed_param0_description":function(d){return "The speed value (2, 3, 5, 8, or 12)."},
"dropletBlock_setSpriteEmotion_description":function(d){return "Задава настроението на Актьора"},
"dropletBlock_setSpritePosition_description":function(d){return "Веднага придвижва актьор към указаното местоположение."},
"dropletBlock_setSpriteSpeed_description":function(d){return "Задава скоростта на актьор"},
"dropletBlock_setSprite_description":function(d){return "Задава изображение на актьора"},
"dropletBlock_setSprite_param0":function(d){return "index"},
"dropletBlock_setSprite_param0_description":function(d){return "The index (starting at 0) indicating which actor should change."},
"dropletBlock_setSprite_param1":function(d){return "image"},
"dropletBlock_setSprite_param1_description":function(d){return "The name of the actor image."},
"dropletBlock_setWalls_description":function(d){return "Changes the walls in the scene."},
"dropletBlock_setWalls_param0":function(d){return "name"},
"dropletBlock_setWalls_param0_description":function(d){return "The name of the wall set ('border', 'maze', 'maze2', 'default', or 'hidden')."},
"dropletBlock_throw_description":function(d){return "Хвърляне на снаряд от определен актьор."},
"dropletBlock_vanish_description":function(d){return "Изчезване на актьор."},
"dropletBlock_whenDown_description":function(d){return "This function executes when the down button is pressed."},
"dropletBlock_whenLeft_description":function(d){return "This function executes when the left button is pressed."},
"dropletBlock_whenRight_description":function(d){return "This function executes when the right button is pressed."},
"dropletBlock_whenTouchItem_description":function(d){return "This function executes when the character touches any item."},
"dropletBlock_whenTouchWall_description":function(d){return "This function executes when the character touches any wall."},
"dropletBlock_whenTouchWalkItem1_description":function(d){return "This function executes when the character touches items with type 'item_walk_item1'."},
"dropletBlock_whenTouchWalkItem2_description":function(d){return "This function executes when the character touches items with type 'item_walk_item2'."},
"dropletBlock_whenTouchWalkItem3_description":function(d){return "This function executes when the character touches items with type 'item_walk_item3'."},
"dropletBlock_whenTouchWalkItem4_description":function(d){return "This function executes when the character touches items with type 'item_walk_item4'."},
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
"itemItem1":function(d){return "Item1"},
"itemItem2":function(d){return "Item2"},
"itemItem3":function(d){return "Item3"},
"itemItem4":function(d){return "Item4"},
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
"setActivityRandom":function(d){return "set activity to random for"},
"setActivityPatrol":function(d){return "set activity to patrol for"},
"setActivityChase":function(d){return "set activity to chase for"},
"setActivityFlee":function(d){return "set activity to flee for"},
"setActivityNone":function(d){return "set activity to none for"},
"setActivityTooltip":function(d){return "Sets the activity for a set of items"},
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
"setBackgroundBackground1":function(d){return "set background1 background"},
"setBackgroundBackground2":function(d){return "set background2 background"},
"setBackgroundBackground3":function(d){return "set background3 background"},
"setBackgroundTooltip":function(d){return "Задава фоновото изображение"},
"setEnemySpeed":function(d){return "задава скоростта на врага"},
"setItemSpeedSet":function(d){return "set type"},
"setItemSpeedTooltip":function(d){return "Sets the speed for a set of items"},
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
"setSpriteCharacter1":function(d){return "to character1"},
"setSpriteCharacter2":function(d){return "to character2"},
"setWalls":function(d){return "set walls"},
"setWallsHidden":function(d){return "set hidden walls"},
"setWallsRandom":function(d){return "set random walls"},
"setWallsBorder":function(d){return "set border walls"},
"setWallsDefault":function(d){return "set default walls"},
"setWallsMaze":function(d){return "set maze walls"},
"setWallsMaze2":function(d){return "set maze2 walls"},
"setWallsTooltip":function(d){return "Changes the walls in the scene"},
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
"whenRight":function(d){return "Когато стрелка надясно"},
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
"whenTouchItem":function(d){return "when item touched"},
"whenTouchItemTooltip":function(d){return "Execute the actions below when the actor touches an item."},
"whenTouchWall":function(d){return "when wall touched"},
"whenTouchWallTooltip":function(d){return "Execute the actions below when the actor touches a wall."},
"whenUp":function(d){return "когато стрелка нагоре"},
"whenUpTooltip":function(d){return "Изпълнява действията по-долу когато е натисната стрелка нагоре."},
"yes":function(d){return "Да"},
"addCharacter":function(d){return "add a"},
"addCharacterTooltip":function(d){return "Add a character to the scene."},
"dropletBlock_addCharacter_description":function(d){return "Add a character to the scene."},
"dropletBlock_addCharacter_param0":function(d){return "type"},
"dropletBlock_addCharacter_param0_description":function(d){return "The type of the character to be added ('man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_moveRight_description":function(d){return "Moves the character to the right."},
"dropletBlock_moveUp_description":function(d){return "Moves the character up."},
"dropletBlock_moveDown_description":function(d){return "Moves the character down."},
"dropletBlock_moveLeft_description":function(d){return "Moves the character left."},
"dropletBlock_moveSlow_description":function(d){return "Changes a set of characters to move slow."},
"dropletBlock_moveSlow_param0":function(d){return "type"},
"dropletBlock_moveSlow_param0_description":function(d){return "The type of characters to be changed ('man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_moveNormal_description":function(d){return "Changes a set of characters to move at a normal speed."},
"dropletBlock_moveNormal_param0":function(d){return "type"},
"dropletBlock_moveNormal_param0_description":function(d){return "The type of characters to be changed ('man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_moveFast_description":function(d){return "Changes a set of characters to move fast."},
"dropletBlock_moveFast_param0":function(d){return "type"},
"dropletBlock_moveFast_param0_description":function(d){return "The type of characters to be changed ('man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_setBot_description":function(d){return "Changes the active bot."},
"dropletBlock_setBot_param0":function(d){return "image"},
"dropletBlock_setBot_param0_description":function(d){return "The name of the bot image ('bot1' or 'bot2')."},
"dropletBlock_setBotSpeed_description":function(d){return "Sets the bot speed."},
"dropletBlock_setBotSpeed_param0":function(d){return "speed"},
"dropletBlock_setBotSpeed_param0_description":function(d){return "The speed value ('slow', 'normal', or 'fast')."},
"dropletBlock_setToChase_description":function(d){return "Changes a set of characters to chase the bot."},
"dropletBlock_setToChase_param0":function(d){return "type"},
"dropletBlock_setToChase_param0_description":function(d){return "The type of characters to be changed ('man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_setToFlee_description":function(d){return "Changes a set of characters to flee from the bot."},
"dropletBlock_setToFlee_param0":function(d){return "type"},
"dropletBlock_setToFlee_param0_description":function(d){return "The type of characters to be changed ('man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_setToRoam_description":function(d){return "Changes a set of characters to roam freely."},
"dropletBlock_setToRoam_param0":function(d){return "type"},
"dropletBlock_setToRoam_param0_description":function(d){return "The type of characters to be changed ('man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_setToStop_description":function(d){return "Changes a set of characters to stop moving."},
"dropletBlock_setToStop_param0":function(d){return "type"},
"dropletBlock_setToStop_param0_description":function(d){return "The type of characters to be changed ('man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_setMap_description":function(d){return "Changes the map in the scene."},
"dropletBlock_setMap_param0":function(d){return "name"},
"dropletBlock_setMap_param0_description":function(d){return "The name of the map ('blank', 'circle', 'circle2', 'horizontal', 'grid', or 'blobs')."},
"dropletBlock_whenTouchCharacter_description":function(d){return "This function executes when the character touches any item."},
"dropletBlock_whenTouchObstacle_description":function(d){return "This function executes when the character touches any obstacle."},
"dropletBlock_whenTouchMan_description":function(d){return "This function executes when the character touches items with type 'man'."},
"dropletBlock_whenTouchPilot_description":function(d){return "This function executes when the character touches items with type 'pilot'."},
"dropletBlock_whenTouchPig_description":function(d){return "This function executes when the character touches items with type 'pig'."},
"dropletBlock_whenTouchBird_description":function(d){return "This function executes when the character touches items with type 'bird'."},
"dropletBlock_whenTouchMouse_description":function(d){return "This function executes when the character touches items with type 'mouse'."},
"dropletBlock_whenTouchRoo_description":function(d){return "This function executes when the character touches items with type 'roo'."},
"dropletBlock_whenTouchSpider_description":function(d){return "This function executes when the character touches items with type 'spider'."},
"itemMan":function(d){return "man"},
"itemPilot":function(d){return "pilot"},
"itemPig":function(d){return "pig"},
"itemBird":function(d){return "bird"},
"itemMouse":function(d){return "mouse"},
"itemRoo":function(d){return "roo"},
"itemSpider":function(d){return "spider"},
"setActivityRoam":function(d){return "set activity to roam for"},
"setBackgroundForest":function(d){return "set forest background"},
"setBackgroundSnow":function(d){return "set snow background"},
"setBackgroundShip":function(d){return "set ship background"},
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
"setMapTooltip":function(d){return "Changes the map in the scene"}};