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
v:function(d,k){studio_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){studio_locale.c(d,k);return d[k] in p?p[d[k]]:(k=studio_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){studio_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).studio_locale = {
"actor":function(d){return "персонаж"},
"alienInvasion":function(d){return "Вторжение инопланетян!"},
"backgroundBlack":function(d){return "черный"},
"backgroundCave":function(d){return "пещера"},
"backgroundCloudy":function(d){return "облачно"},
"backgroundHardcourt":function(d){return "твердая поверхность"},
"backgroundNight":function(d){return "ночь"},
"backgroundUnderwater":function(d){return "под водой"},
"backgroundCity":function(d){return "город"},
"backgroundDesert":function(d){return "пустыня"},
"backgroundRainbow":function(d){return "радуга"},
"backgroundSoccer":function(d){return "футбол"},
"backgroundSpace":function(d){return "космос"},
"backgroundTennis":function(d){return "теннис"},
"backgroundWinter":function(d){return "зима"},
"catActions":function(d){return "Действия"},
"catControl":function(d){return "Циклы"},
"catEvents":function(d){return "События"},
"catLogic":function(d){return "Логика"},
"catMath":function(d){return "Математика"},
"catProcedures":function(d){return "функции"},
"catText":function(d){return "Текст"},
"catVariables":function(d){return "переменные"},
"changeScoreTooltip":function(d){return "Добавить или отнять очко."},
"changeScoreTooltipK1":function(d){return "Добавить очко."},
"continue":function(d){return "Продолжить"},
"decrementPlayerScore":function(d){return "отнять очко"},
"defaultSayText":function(d){return "Введи здесь"},
"emotion":function(d){return "настроение"},
"finalLevel":function(d){return "Поздравляю! Последняя головоломка решена."},
"for":function(d){return "для"},
"hello":function(d){return "привет"},
"helloWorld":function(d){return "Привет, мир!"},
"incrementPlayerScore":function(d){return "оценка точки"},
"makeProjectileDisappear":function(d){return "исчезнуть"},
"makeProjectileBounce":function(d){return "отказ"},
"makeProjectileBlueFireball":function(d){return "сделать синий огненный шар"},
"makeProjectilePurpleFireball":function(d){return "сделать фиолетовый огненный шар"},
"makeProjectileRedFireball":function(d){return "сделать красный огненный шар"},
"makeProjectileYellowHearts":function(d){return "сделать желтые сердца"},
"makeProjectilePurpleHearts":function(d){return "сделать фиолетовые сердца"},
"makeProjectileRedHearts":function(d){return "сделать красные сердца"},
"makeProjectileTooltip":function(d){return "Заставить столкнувшийся снаряд исчезнуть или отскочить."},
"makeYourOwn":function(d){return "Создайте своё собственное Игровое Приложение"},
"moveDirectionDown":function(d){return "вниз"},
"moveDirectionLeft":function(d){return "влево"},
"moveDirectionRight":function(d){return "вправо"},
"moveDirectionUp":function(d){return "вверх"},
"moveDirectionRandom":function(d){return "случайный"},
"moveDistance25":function(d){return "25 пикселей"},
"moveDistance50":function(d){return "50 пикселей"},
"moveDistance100":function(d){return "100 пикселей"},
"moveDistance200":function(d){return "200 пикселей"},
"moveDistance400":function(d){return "400 пикселей"},
"moveDistancePixels":function(d){return "точек"},
"moveDistanceRandom":function(d){return "случайные пиксели"},
"moveDistanceTooltip":function(d){return "Переместить персонажа на определенное расстояние в определенном направлении."},
"moveSprite":function(d){return "переместить"},
"moveSpriteN":function(d){return "переместить персонажа "+studio_locale.v(d,"spriteIndex")},
"toXY":function(d){return "к x,y"},
"moveDown":function(d){return "Переместить вниз"},
"moveDownTooltip":function(d){return "Переместить персонажа вниз."},
"moveLeft":function(d){return "переместить влево"},
"moveLeftTooltip":function(d){return "Переместить персонажа влево."},
"moveRight":function(d){return "Переместить вправо"},
"moveRightTooltip":function(d){return "Переместить персонажа вправо."},
"moveUp":function(d){return "переместить вверх"},
"moveUpTooltip":function(d){return "Переместить персонажа вверх."},
"moveTooltip":function(d){return "Переместить персонажа."},
"nextLevel":function(d){return "Поздравляю! Головоломка решена."},
"no":function(d){return "Нет"},
"numBlocksNeeded":function(d){return "Эта головоломка может быть решена с помощью %1 блоков."},
"onEventTooltip":function(d){return "Выполните код в ответ на определенное событие."},
"ouchExclamation":function(d){return "Ой!"},
"playSoundCrunch":function(d){return "исполнить звук хруста"},
"playSoundGoal1":function(d){return "исполнить звук цели 1"},
"playSoundGoal2":function(d){return "исполнить звук цели 2"},
"playSoundHit":function(d){return "исполнить звук удара"},
"playSoundLosePoint":function(d){return "исполнить звук проигрыша очка"},
"playSoundLosePoint2":function(d){return "исполнить звук проигрыша очка 2"},
"playSoundRetro":function(d){return "исполнить звук ретро"},
"playSoundRubber":function(d){return "исполнить звук резины"},
"playSoundSlap":function(d){return "исполнить звук шлепка"},
"playSoundTooltip":function(d){return "Исполнить выбранный звук."},
"playSoundWinPoint":function(d){return "исполнить звук выигрыша очка"},
"playSoundWinPoint2":function(d){return "исполнить звук выигрыша очка 2"},
"playSoundWood":function(d){return "исполнить звук дерева"},
"positionOutTopLeft":function(d){return "на позицию сверху слева"},
"positionOutTopRight":function(d){return "на позицию сверху справа"},
"positionTopOutLeft":function(d){return "на позицию снаружи сверху слева"},
"positionTopLeft":function(d){return "на верхнюю левую позицию"},
"positionTopCenter":function(d){return "на центральную верхнюю позицию"},
"positionTopRight":function(d){return "на правую верхнюю позицию"},
"positionTopOutRight":function(d){return "на позицию снаружи сверху справа"},
"positionMiddleLeft":function(d){return "на позицию посередине слева"},
"positionMiddleCenter":function(d){return "на позицию в центре"},
"positionMiddleRight":function(d){return "на позицию посередине справа"},
"positionBottomOutLeft":function(d){return "на позицию снизу снаружи слева"},
"positionBottomLeft":function(d){return "на позицию снизу слева"},
"positionBottomCenter":function(d){return "на позицию снизу по центру"},
"positionBottomRight":function(d){return "на позицию снизу справа"},
"positionBottomOutRight":function(d){return "на позицию снизу снаружи справа"},
"positionOutBottomLeft":function(d){return "на позицию снизу слева"},
"positionOutBottomRight":function(d){return "на позицию снизу справа"},
"positionRandom":function(d){return "в случайную позицию"},
"projectileBlueFireball":function(d){return "синий огненный шар"},
"projectilePurpleFireball":function(d){return "фиолетовый огненный шар"},
"projectileRedFireball":function(d){return "красный огненный шар"},
"projectileYellowHearts":function(d){return "желтые сердца"},
"projectilePurpleHearts":function(d){return "фиолетовые сердца"},
"projectileRedHearts":function(d){return "красные сердца"},
"projectileRandom":function(d){return "случайный"},
"projectileAnna":function(d){return "крючок"},
"projectileElsa":function(d){return "искра"},
"projectileHiro":function(d){return "минироботы"},
"projectileBaymax":function(d){return "ракета"},
"projectileRapunzel":function(d){return "кастрюля"},
"projectileCherry":function(d){return "вишня"},
"projectileIce":function(d){return "лед"},
"projectileDuck":function(d){return "утка"},
"reinfFeedbackMsg":function(d){return "Вы можете нажать на кнопку «Продолжить играть», чтобы вернуться к Вашей истории."},
"repeatForever":function(d){return "повторять бесконечно"},
"repeatDo":function(d){return "выполнить"},
"repeatForeverTooltip":function(d){return "Выполнять действия в этом блоке неоднократно пока выполняется игра."},
"saySprite":function(d){return "сказать"},
"saySpriteN":function(d){return "персонаж "+studio_locale.v(d,"spriteIndex")+" говорит"},
"saySpriteTooltip":function(d){return "Показать речевой пузырь с указанным текстом у указанного персонажа."},
"saySpriteChoices_0":function(d){return "Привет."},
"saySpriteChoices_1":function(d){return "Всем привет."},
"saySpriteChoices_2":function(d){return "Как ваши дела?"},
"saySpriteChoices_3":function(d){return "Доброе утро"},
"saySpriteChoices_4":function(d){return "Добрый день"},
"saySpriteChoices_5":function(d){return "Спокойной ночи"},
"saySpriteChoices_6":function(d){return "Добрый вечер"},
"saySpriteChoices_7":function(d){return "Что нового?"},
"saySpriteChoices_8":function(d){return "Что?"},
"saySpriteChoices_9":function(d){return "Где?"},
"saySpriteChoices_10":function(d){return "Когда?"},
"saySpriteChoices_11":function(d){return "Хорошо."},
"saySpriteChoices_12":function(d){return "Отлично!"},
"saySpriteChoices_13":function(d){return "Хорошо."},
"saySpriteChoices_14":function(d){return "Неплохо."},
"saySpriteChoices_15":function(d){return "Удачи."},
"saySpriteChoices_16":function(d){return "Да"},
"saySpriteChoices_17":function(d){return "Нет"},
"saySpriteChoices_18":function(d){return "Хорошо"},
"saySpriteChoices_19":function(d){return "Хороший бросок!"},
"saySpriteChoices_20":function(d){return "Хорошего дня."},
"saySpriteChoices_21":function(d){return "Пока."},
"saySpriteChoices_22":function(d){return "Я скоро вернусь."},
"saySpriteChoices_23":function(d){return "Увидимся завтра!"},
"saySpriteChoices_24":function(d){return "Увидимся позже!"},
"saySpriteChoices_25":function(d){return "Береги себя!"},
"saySpriteChoices_26":function(d){return "Наслаждайтесь!"},
"saySpriteChoices_27":function(d){return "Мне нужно идти."},
"saySpriteChoices_28":function(d){return "Хотите быть друзьями?"},
"saySpriteChoices_29":function(d){return "Отличная работа!"},
"saySpriteChoices_30":function(d){return "Вуу-хуу!"},
"saySpriteChoices_31":function(d){return "Ура!"},
"saySpriteChoices_32":function(d){return "Приятно познакомиться."},
"saySpriteChoices_33":function(d){return "Хорошо!"},
"saySpriteChoices_34":function(d){return "Спасибо"},
"saySpriteChoices_35":function(d){return "Нет, спасибо"},
"saySpriteChoices_36":function(d){return "Аааааа!"},
"saySpriteChoices_37":function(d){return "Неважно"},
"saySpriteChoices_38":function(d){return "Сегодня"},
"saySpriteChoices_39":function(d){return "Завтра"},
"saySpriteChoices_40":function(d){return "Вчера"},
"saySpriteChoices_41":function(d){return "Я нашел тебя!"},
"saySpriteChoices_42":function(d){return "Ты нашёл меня!"},
"saySpriteChoices_43":function(d){return "10, 9, 8, 7, 6, 5, 4, 3, 2, 1!"},
"saySpriteChoices_44":function(d){return "Молодец!"},
"saySpriteChoices_45":function(d){return "Вы забавный!"},
"saySpriteChoices_46":function(d){return "Вы глупый! "},
"saySpriteChoices_47":function(d){return "Ты хороший друг!"},
"saySpriteChoices_48":function(d){return "Осторожно!"},
"saySpriteChoices_49":function(d){return "Утка!"},
"saySpriteChoices_50":function(d){return "Попался!"},
"saySpriteChoices_51":function(d){return "Ой!"},
"saySpriteChoices_52":function(d){return "Извините!"},
"saySpriteChoices_53":function(d){return "Осторожно!"},
"saySpriteChoices_54":function(d){return "Ура!"},
"saySpriteChoices_55":function(d){return "Ой!"},
"saySpriteChoices_56":function(d){return "Почти поймал меня!"},
"saySpriteChoices_57":function(d){return "Хорошая попытка!"},
"saySpriteChoices_58":function(d){return "Ты не сможешь поймать меня!"},
"scoreText":function(d){return "Оценка: "+studio_locale.v(d,"playerScore")},
"setBackground":function(d){return "установить фон"},
"setBackgroundRandom":function(d){return "установить случайный фон"},
"setBackgroundBlack":function(d){return "установить Чёрный фон"},
"setBackgroundCave":function(d){return "установить Пещера фон"},
"setBackgroundCloudy":function(d){return "установить Облака фон"},
"setBackgroundHardcourt":function(d){return "установить Твердое покрытие фон"},
"setBackgroundNight":function(d){return "установите Ночь фон"},
"setBackgroundUnderwater":function(d){return "установитье Под Водой фон"},
"setBackgroundCity":function(d){return "установить Город фон"},
"setBackgroundDesert":function(d){return "установить Пустыня фон"},
"setBackgroundRainbow":function(d){return "установить Радуга фон"},
"setBackgroundSoccer":function(d){return "установить Футбол фон"},
"setBackgroundSpace":function(d){return "установить Космос фон"},
"setBackgroundTennis":function(d){return "установить Теннис фон"},
"setBackgroundWinter":function(d){return "установить зимний фон"},
"setBackgroundLeafy":function(d){return "установить фон с листьями"},
"setBackgroundGrassy":function(d){return "установить фон с травой"},
"setBackgroundFlower":function(d){return "установить фон с цветами"},
"setBackgroundTile":function(d){return "установить фон с плитками"},
"setBackgroundIcy":function(d){return "установить фон со льдом"},
"setBackgroundSnowy":function(d){return "установить фон со снегом"},
"setBackgroundTooltip":function(d){return "Установить на задний план изображение"},
"setEnemySpeed":function(d){return "установить скорость врага"},
"setPlayerSpeed":function(d){return "установить скорость игрока"},
"setScoreText":function(d){return "задать счет"},
"setScoreTextTooltip":function(d){return "Установить текст, отображаемый в области оценки."},
"setSpriteEmotionAngry":function(d){return "к изображению Angry Mood"},
"setSpriteEmotionHappy":function(d){return "хорошее настроение"},
"setSpriteEmotionNormal":function(d){return "нормальное настроение"},
"setSpriteEmotionRandom":function(d){return "случайное настроение"},
"setSpriteEmotionSad":function(d){return "печальное настроение"},
"setSpriteEmotionTooltip":function(d){return "Установить настроение актера"},
"setSpriteAlien":function(d){return "изображение чужого"},
"setSpriteBat":function(d){return "изображение летучей мыши"},
"setSpriteBird":function(d){return "изображение птицы"},
"setSpriteCat":function(d){return "изображение кота"},
"setSpriteCaveBoy":function(d){return "изображение \"Пещерный Мальчик\""},
"setSpriteCaveGirl":function(d){return "изображение \"пещерная девочка\""},
"setSpriteDinosaur":function(d){return "изображение динозавра"},
"setSpriteDog":function(d){return "изображение собаки"},
"setSpriteDragon":function(d){return "изображение  дракона"},
"setSpriteGhost":function(d){return "изображение призрака"},
"setSpriteHidden":function(d){return "скрытая картинка"},
"setSpriteHideK1":function(d){return "скрыть"},
"setSpriteAnna":function(d){return "к изображению Анны"},
"setSpriteElsa":function(d){return "к изображению Эльзы"},
"setSpriteHiro":function(d){return "изображению Хиро"},
"setSpriteBaymax":function(d){return "изображению Баймакса"},
"setSpriteRapunzel":function(d){return "изображению Рапунцель"},
"setSpriteKnight":function(d){return "изображение рыцаря"},
"setSpriteMonster":function(d){return "изображение монстра"},
"setSpriteNinja":function(d){return "изображение ниндзя"},
"setSpriteOctopus":function(d){return "изображение осьминога"},
"setSpritePenguin":function(d){return "изображение пингвина"},
"setSpritePirate":function(d){return "изображение пирата"},
"setSpritePrincess":function(d){return "изображение принцессы"},
"setSpriteRandom":function(d){return "случайнаякартинка"},
"setSpriteRobot":function(d){return "изображение робота"},
"setSpriteShowK1":function(d){return "показать"},
"setSpriteSpacebot":function(d){return "изображение космического робота"},
"setSpriteSoccerGirl":function(d){return "девочка-футболистка"},
"setSpriteSoccerBoy":function(d){return "мальчик-футболист"},
"setSpriteSquirrel":function(d){return "изображение белки"},
"setSpriteTennisGirl":function(d){return "девочка-теннисистка"},
"setSpriteTennisBoy":function(d){return "мальчик-теннисист"},
"setSpriteUnicorn":function(d){return "изображение единорога"},
"setSpriteWitch":function(d){return "изображение ведьмы"},
"setSpriteWizard":function(d){return "изображение волшебника"},
"setSpritePositionTooltip":function(d){return "Мгновенно перемещает персонажа в указанное место."},
"setSpriteK1Tooltip":function(d){return "Показать или скрыть указанного персонажа."},
"setSpriteTooltip":function(d){return "Установить изображение персонажа"},
"setSpriteSizeRandom":function(d){return "случайного размера"},
"setSpriteSizeVerySmall":function(d){return "очень маленького размера"},
"setSpriteSizeSmall":function(d){return "маленького размера"},
"setSpriteSizeNormal":function(d){return "обычного размера"},
"setSpriteSizeLarge":function(d){return "большого размера"},
"setSpriteSizeVeryLarge":function(d){return "очень большого размера"},
"setSpriteSizeTooltip":function(d){return "Установить размер персонажа"},
"setSpriteSpeedRandom":function(d){return "для случайной скорости"},
"setSpriteSpeedVerySlow":function(d){return "для очень медленной скорости"},
"setSpriteSpeedSlow":function(d){return "для медленной скорости"},
"setSpriteSpeedNormal":function(d){return "для нормальной скорости"},
"setSpriteSpeedFast":function(d){return "для быстрой скорости"},
"setSpriteSpeedVeryFast":function(d){return "для очень быстрой скорости"},
"setSpriteSpeedTooltip":function(d){return "Установите скорость персонажа"},
"setSpriteZombie":function(d){return "образ зомби"},
"shareStudioTwitter":function(d){return "Оцените игру, которую я сделал. Она написана мною с помощью @codeorg"},
"shareGame":function(d){return "Поделиться своей игрой:"},
"showCoordinates":function(d){return "показать координаты"},
"showCoordinatesTooltip":function(d){return "показать на экране координаты главного героя"},
"showTitleScreen":function(d){return "показать титульный экран"},
"showTitleScreenTitle":function(d){return "название"},
"showTitleScreenText":function(d){return "текст"},
"showTSDefTitle":function(d){return "введите название здесь"},
"showTSDefText":function(d){return "введите текст здесь"},
"showTitleScreenTooltip":function(d){return "Показать титульный экран с указанным названием и текстом."},
"size":function(d){return "размер"},
"setSprite":function(d){return "присвоить"},
"setSpriteN":function(d){return "указать персонажа "+studio_locale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "хруст"},
"soundGoal1":function(d){return "цель 1"},
"soundGoal2":function(d){return "цель 2"},
"soundHit":function(d){return "удар"},
"soundLosePoint":function(d){return "потеря очка"},
"soundLosePoint2":function(d){return "потеря 2 очка"},
"soundRetro":function(d){return "ретро"},
"soundRubber":function(d){return "резина"},
"soundSlap":function(d){return "шлепок"},
"soundWinPoint":function(d){return "выигрыш очка"},
"soundWinPoint2":function(d){return "выигрыш 2 очка"},
"soundWood":function(d){return "дерево"},
"speed":function(d){return "скорость"},
"startSetValue":function(d){return "Старт (функция)"},
"startSetVars":function(d){return "game_vars (заголовок, подзаголовок, фон, цель, опасность, игрок)"},
"startSetFuncs":function(d){return "game_funcs (обновить-цель, обновить-опасность, обновить-игрока, столкновение?, на экране?)"},
"stopSprite":function(d){return "остановка"},
"stopSpriteN":function(d){return "остановить персонаж "+studio_locale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Останавливает движение персонажа."},
"throwSprite":function(d){return "кинуть"},
"throwSpriteN":function(d){return "персонаж "+studio_locale.v(d,"spriteIndex")+" кидает"},
"throwTooltip":function(d){return "Кидает снаряд от указанного персонажа."},
"vanish":function(d){return "исчезнуть"},
"vanishActorN":function(d){return "исчезнуть персонажу "+studio_locale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "Заставляет персонажа исчезнуть."},
"waitFor":function(d){return "ждать"},
"waitSeconds":function(d){return "секунд"},
"waitForClick":function(d){return "ожидать нажатия на мышку"},
"waitForRandom":function(d){return "подождать случайное время"},
"waitForHalfSecond":function(d){return "подождите полсекунды"},
"waitFor1Second":function(d){return "подождите 1 секунду"},
"waitFor2Seconds":function(d){return "подождите 2 секунды"},
"waitFor5Seconds":function(d){return "подождите 5 секунд"},
"waitFor10Seconds":function(d){return "подождите 10 секунд"},
"waitParamsTooltip":function(d){return "Подождите указанное количество секунд или, если указан 0, до нажатия клавиши."},
"waitTooltip":function(d){return "Подождите указанное количество времени или пока не произойдёт нажатие клавиши."},
"whenArrowDown":function(d){return "клавиша вниз"},
"whenArrowLeft":function(d){return "клавиша влево"},
"whenArrowRight":function(d){return "клавиша вправо"},
"whenArrowUp":function(d){return "клавиша вверх"},
"whenArrowTooltip":function(d){return "Выполнить действия, указанные ниже, когда нажата указанная клавиша."},
"whenDown":function(d){return "когда клавиша вниз"},
"whenDownTooltip":function(d){return "Выполните действия ниже, когда когда будет нажата клавиша стрелка вниз."},
"whenGameStarts":function(d){return "когда начнётся игра"},
"whenGameStartsTooltip":function(d){return "Выполнить действия ниже, когда начнётся игра."},
"whenLeft":function(d){return "когда клавиша влево"},
"whenLeftTooltip":function(d){return "Выполните действия ниже, когда нажата клавиша стрелка влево."},
"whenRight":function(d){return "когда клавиша вправо"},
"whenRightTooltip":function(d){return "Выполните действия ниже, когда нажата клавиша стрелка вправо."},
"whenSpriteClicked":function(d){return "когда на персонаже нажали мышкой"},
"whenSpriteClickedN":function(d){return "когда на персонажа "+studio_locale.v(d,"spriteIndex")+" нажали"},
"whenSpriteClickedTooltip":function(d){return "Выполните действия ниже, когда на персонаже нажали мышкой."},
"whenSpriteCollidedN":function(d){return "когда персонаж "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "Выполнить действия, указанные ниже, когда персонаж сталкивается с другим персонажем."},
"whenSpriteCollidedWith":function(d){return "касается"},
"whenSpriteCollidedWithAnyActor":function(d){return "касается другого персонажа"},
"whenSpriteCollidedWithAnyEdge":function(d){return "касается угла"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "касается любого снаряда"},
"whenSpriteCollidedWithAnything":function(d){return "касается чего-нибудь"},
"whenSpriteCollidedWithN":function(d){return "касается персонажа "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "касается синего огненного шара"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "касается фиолетового огненного шара"},
"whenSpriteCollidedWithRedFireball":function(d){return "касается красного огненного шара"},
"whenSpriteCollidedWithYellowHearts":function(d){return "касается жёлтых сердец"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "касается фиолетовых сердец"},
"whenSpriteCollidedWithRedHearts":function(d){return "касается красных сердец"},
"whenSpriteCollidedWithBottomEdge":function(d){return "касается нижней границы"},
"whenSpriteCollidedWithLeftEdge":function(d){return "касается левой границы"},
"whenSpriteCollidedWithRightEdge":function(d){return "касается правой границы"},
"whenSpriteCollidedWithTopEdge":function(d){return "касается верхней границы"},
"whenUp":function(d){return "когда клавиша вверх"},
"whenUpTooltip":function(d){return "Выпонить действия, указанные ниже, когда нажата клавиша вверх."},
"yes":function(d){return "Да"}};