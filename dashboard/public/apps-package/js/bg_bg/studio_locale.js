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
"actor":function(d){return "актьор"},
"alienInvasion":function(d){return "Извънземна инвазия!"},
"backgroundBlack":function(d){return "черно"},
"backgroundCave":function(d){return "пещера"},
"backgroundCloudy":function(d){return "облачен"},
"backgroundHardcourt":function(d){return "твърда настилка"},
"backgroundNight":function(d){return "нощ"},
"backgroundUnderwater":function(d){return "подводен"},
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
"emotion":function(d){return "настроение"},
"finalLevel":function(d){return "Поздравления! Вие решихте последния пъзел."},
"for":function(d){return "за"},
"hello":function(d){return "Здравейте"},
"helloWorld":function(d){return "Здравей, свят!"},
"incrementPlayerScore":function(d){return "точка"},
"makeProjectileDisappear":function(d){return "изчезва"},
"makeProjectileBounce":function(d){return "скача"},
"makeProjectileBlueFireball":function(d){return "направи синя огнена топка"},
"makeProjectilePurpleFireball":function(d){return "направи лилава огнена топка"},
"makeProjectileRedFireball":function(d){return "направи червена огнена топка"},
"makeProjectileYellowHearts":function(d){return "направи жълти сърца"},
"makeProjectilePurpleHearts":function(d){return "направи лилави сърца"},
"makeProjectileRedHearts":function(d){return "направи червени сърца"},
"makeProjectileTooltip":function(d){return "Прави снаряд, който се блъска, изчезва или скача."},
"makeYourOwn":function(d){return "Направете свое собствено \"Театрална лаборатория\" приложение"},
"moveDirectionDown":function(d){return "надолу"},
"moveDirectionLeft":function(d){return "ляво"},
"moveDirectionRight":function(d){return "дясно"},
"moveDirectionUp":function(d){return "нагоре"},
"moveDirectionRandom":function(d){return "случаен"},
"moveDistance25":function(d){return "25 пиксела"},
"moveDistance50":function(d){return "50 пиксела"},
"moveDistance100":function(d){return "100 пиксела"},
"moveDistance200":function(d){return "200 пиксела"},
"moveDistance400":function(d){return "400 пиксела"},
"moveDistancePixels":function(d){return "пиксели"},
"moveDistanceRandom":function(d){return "случаен брой пиксела"},
"moveDistanceTooltip":function(d){return "Премества актьора на определена дистанция в определената посока."},
"moveSprite":function(d){return "Премести"},
"moveSpriteN":function(d){return "Премести актьор "+appLocale.v(d,"spriteIndex")},
"toXY":function(d){return "спрямо x, y"},
"moveDown":function(d){return "Премести надолу"},
"moveDownTooltip":function(d){return "Премести актьора надолу."},
"moveLeft":function(d){return "движение наляво"},
"moveLeftTooltip":function(d){return "Преместване на актьора наляво."},
"moveRight":function(d){return "Преместване надясно"},
"moveRightTooltip":function(d){return "Преместване на актьора надясно."},
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
"playSoundTooltip":function(d){return "Възпроизвеждане на избраният звук."},
"playSoundWinPoint":function(d){return "възпроизвежда звук на победа точка"},
"playSoundWinPoint2":function(d){return "възпроизвежда звук 2 на победа точка"},
"playSoundWood":function(d){return "възпроизвежда звук от дърво"},
"positionOutTopLeft":function(d){return "на позиция горе вляво"},
"positionOutTopRight":function(d){return "към позиция горе вдясно"},
"positionTopOutLeft":function(d){return "горе извън лявата позиция"},
"positionTopLeft":function(d){return "позиция горе вляво"},
"positionTopCenter":function(d){return "позиция в центъра"},
"positionTopRight":function(d){return "към позиция горе вдясно"},
"positionTopOutRight":function(d){return "горе извън дясната позиция"},
"positionMiddleLeft":function(d){return "в позиция ляв център"},
"positionMiddleCenter":function(d){return "в позиция център"},
"positionMiddleRight":function(d){return "в позиция десен център"},
"positionBottomOutLeft":function(d){return "надолу извън лявата позиция"},
"positionBottomLeft":function(d){return "в позиция долен ляв ъгъл"},
"positionBottomCenter":function(d){return "в позиция долен център"},
"positionBottomRight":function(d){return "в позиция долен десен ъгъл"},
"positionBottomOutRight":function(d){return "долу извън дясната позиция"},
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
"reinfFeedbackMsg":function(d){return "Можете да натиснете бутона \"Продължете да играете\" за да се върнете да играете историята си."},
"repeatForever":function(d){return "повтаряй завинаги"},
"repeatDo":function(d){return "правя"},
"repeatForeverTooltip":function(d){return "Изпълнява действията в този блок, докато тече историята."},
"saySprite":function(d){return "казва"},
"saySpriteN":function(d){return "актьор "+appLocale.v(d,"spriteIndex")+" казва"},
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
"saySpriteChoices_36":function(d){return "Aaaaaah!"},
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
"scoreText":function(d){return "Резултат: "+appLocale.v(d,"playerScore")},
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
"setBackgroundTooltip":function(d){return "Задава фоновото изображение"},
"setEnemySpeed":function(d){return "задава скоростта на врага"},
"setPlayerSpeed":function(d){return "задава скоростта на героя"},
"setScoreText":function(d){return "поставя резултат"},
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
"setSpriteSpeedNormal":function(d){return "за нормална скорост"},
"setSpriteSpeedFast":function(d){return "на бърза скорост"},
"setSpriteSpeedVeryFast":function(d){return "до много бърза скорост"},
"setSpriteSpeedTooltip":function(d){return "Задава скоростта на актьор"},
"setSpriteZombie":function(d){return "изображение на зомби"},
"shareStudioTwitter":function(d){return "Вижте историята, която направих. Аз сам я написал с @codeorg"},
"shareGame":function(d){return "Споделете вашата история:"},
"showCoordinates":function(d){return "показва координати"},
"showCoordinatesTooltip":function(d){return "показва координатите на главният герой на екрана"},
"showTitleScreen":function(d){return "показва заглавния екран"},
"showTitleScreenTitle":function(d){return "Заглавие"},
"showTitleScreenText":function(d){return "текст"},
"showTSDefTitle":function(d){return "напиши заглавието тук"},
"showTSDefText":function(d){return "Въведете текст тук"},
"showTitleScreenTooltip":function(d){return "Покажи заглавието на екрана."},
"size":function(d){return "размер"},
"setSprite":function(d){return "задай"},
"setSpriteN":function(d){return "Задаване на актьор "+appLocale.v(d,"spriteIndex")},
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
"soundWood":function(d){return "дървен материал"},
"speed":function(d){return "скорост"},
"startSetValue":function(d){return "Старт (функция)"},
"startSetVars":function(d){return "game_vars (title, subtitle, background, target, danger, player)"},
"startSetFuncs":function(d){return "game_funcs (update-target, update-danger, update-player, collide?, on-screen?)"},
"stopSprite":function(d){return "Стоп"},
"stopSpriteN":function(d){return "спира актьор "+appLocale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Спира движението на актьора."},
"throwSprite":function(d){return "хвърлям"},
"throwSpriteN":function(d){return "актьор "+appLocale.v(d,"spriteIndex")+" хвърля"},
"throwTooltip":function(d){return "Хвърляне на снаряд от определен актьор."},
"vanish":function(d){return "изчезване"},
"vanishActorN":function(d){return "изчезва актьор "+appLocale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "Изчезване на актьор."},
"waitFor":function(d){return "изчакайте"},
"waitSeconds":function(d){return "секунди"},
"waitForClick":function(d){return "изчаква за кликване"},
"waitForRandom":function(d){return "изчаква случайно време"},
"waitForHalfSecond":function(d){return "изчаква за половин секунда"},
"waitFor1Second":function(d){return "изчаква за 1 секунда"},
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
"whenSpriteClickedN":function(d){return "когато актьор натиска на "+appLocale.v(d,"spriteIndex")},
"whenSpriteClickedTooltip":function(d){return "Изпълнява действията по-долу когато се кликне върху актьор."},
"whenSpriteCollidedN":function(d){return "когато актьор "+appLocale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "Изпълнява действията по-долу когато актьор докосва друг актьор."},
"whenSpriteCollidedWith":function(d){return "докосване"},
"whenSpriteCollidedWithAnyActor":function(d){return "докосва някой актьор"},
"whenSpriteCollidedWithAnyEdge":function(d){return "допира някой от краищата"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "докосва ракета"},
"whenSpriteCollidedWithAnything":function(d){return "докосва нещо"},
"whenSpriteCollidedWithN":function(d){return "докосва актьор "+appLocale.v(d,"spriteIndex")},
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
"whenUp":function(d){return "когато стрелка нагоре"},
"whenUpTooltip":function(d){return "Изпълнява действията по-долу когато е натисната стрелка нагоре."},
"yes":function(d){return "Да"}};