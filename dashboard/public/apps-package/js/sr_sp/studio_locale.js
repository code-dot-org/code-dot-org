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
"actor":function(d){return "учесник"},
"addItems1":function(d){return "add 1 item of type"},
"addItems2":function(d){return "add 2 items of type"},
"addItems3":function(d){return "add 3 items of type"},
"addItems5":function(d){return "add 5 items of type"},
"addItems10":function(d){return "add 10 items of type"},
"addItemsRandom":function(d){return "add random items of type"},
"addItemsTooltip":function(d){return "Add items to the scene."},
"alienInvasion":function(d){return "Invazija vanzemaljaca!"},
"backgroundBlack":function(d){return "Crna"},
"backgroundCave":function(d){return "Pećina"},
"backgroundCloudy":function(d){return "Oblačno"},
"backgroundHardcourt":function(d){return "Tvrdo"},
"backgroundNight":function(d){return "Noć"},
"backgroundUnderwater":function(d){return "Pod vodom"},
"backgroundCity":function(d){return "Grad"},
"backgroundDesert":function(d){return "Pustinja"},
"backgroundRainbow":function(d){return "Duga"},
"backgroundSoccer":function(d){return "Fudbal"},
"backgroundSpace":function(d){return "Prostor"},
"backgroundTennis":function(d){return "Tenis"},
"backgroundWinter":function(d){return "Zima"},
"catActions":function(d){return "Акције"},
"catControl":function(d){return "Петље"},
"catEvents":function(d){return "Догађаји"},
"catLogic":function(d){return "Логика"},
"catMath":function(d){return "Математика"},
"catProcedures":function(d){return "Функције"},
"catText":function(d){return "текст"},
"catVariables":function(d){return "Променљиве"},
"changeScoreTooltip":function(d){return "Додај или одузми поен резултату."},
"changeScoreTooltipK1":function(d){return "Додај поен резултату."},
"continue":function(d){return "Настави"},
"decrementPlayerScore":function(d){return "одузми поен"},
"defaultSayText":function(d){return "упиши овде"},
"dropletBlock_changeScore_description":function(d){return "Додај или одузми поен резултату."},
"dropletBlock_penColour_description":function(d){return "Sets the color of the line drawn behind the turtle as it moves"},
"dropletBlock_penColour_param0":function(d){return "color"},
"dropletBlock_setBackground_description":function(d){return "Поставља слику у позадини"},
"dropletBlock_setSpriteEmotion_description":function(d){return "Postavi glumčevo raspoloženje"},
"dropletBlock_setSpritePosition_description":function(d){return "Instantly moves an actor to the specified location."},
"dropletBlock_setSpriteSpeed_description":function(d){return "Sets the speed of an actor"},
"dropletBlock_setSprite_description":function(d){return "Sets the actor image"},
"dropletBlock_throw_description":function(d){return "Throws a projectile from the specified actor."},
"dropletBlock_vanish_description":function(d){return "Vanishes the actor."},
"emotion":function(d){return "расположење"},
"finalLevel":function(d){return "Честитамо! Решили сте финалну слагалицу."},
"for":function(d){return "Za"},
"hello":function(d){return "здраво"},
"helloWorld":function(d){return "Здраво Свете!"},
"incrementPlayerScore":function(d){return "освоји поен"},
"itemBlueFireball":function(d){return "plava vatrena lopta"},
"itemPurpleFireball":function(d){return "purple fireball"},
"itemRedFireball":function(d){return "crvena vatrena lopta"},
"itemYellowHearts":function(d){return "žuta srca"},
"itemPurpleHearts":function(d){return "ljubičasta srca"},
"itemRedHearts":function(d){return "crvena srca"},
"itemRandom":function(d){return "насумичан"},
"itemAnna":function(d){return "kuka"},
"itemElsa":function(d){return "sparkle"},
"itemHiro":function(d){return "microbots"},
"itemBaymax":function(d){return "raketa"},
"itemRapunzel":function(d){return "šerpa"},
"itemCherry":function(d){return "cherry"},
"itemIce":function(d){return "ice"},
"itemDuck":function(d){return "duck"},
"makeProjectileDisappear":function(d){return "нестани"},
"makeProjectileBounce":function(d){return "одбиј се"},
"makeProjectileBlueFireball":function(d){return "направи плаву ватрену лопту"},
"makeProjectilePurpleFireball":function(d){return "направи љубичасту ватрену лопту"},
"makeProjectileRedFireball":function(d){return "направи црвену ватрену лопту"},
"makeProjectileYellowHearts":function(d){return "направи жута срца"},
"makeProjectilePurpleHearts":function(d){return "направи љубичаста срца"},
"makeProjectileRedHearts":function(d){return "направи црвена срца"},
"makeProjectileTooltip":function(d){return "Учини да пројектил који се сударио нестане или се одбије."},
"makeYourOwn":function(d){return "Napravi svoju  Igraj laboratoriju app"},
"moveDirectionDown":function(d){return "доле"},
"moveDirectionLeft":function(d){return "лево"},
"moveDirectionRight":function(d){return "десно"},
"moveDirectionUp":function(d){return "горе"},
"moveDirectionRandom":function(d){return "насумичан"},
"moveDistance25":function(d){return "25 пиксела"},
"moveDistance50":function(d){return "50 пиксела"},
"moveDistance100":function(d){return "100 пиксела"},
"moveDistance200":function(d){return "200 пиксела"},
"moveDistance400":function(d){return "400 пиксела"},
"moveDistancePixels":function(d){return "пиксели"},
"moveDistanceRandom":function(d){return "случајни пиксели"},
"moveDistanceTooltip":function(d){return "Помери учесника за одређено растојање у одређеном смеру."},
"moveSprite":function(d){return "помери"},
"moveSpriteN":function(d){return "помери учесника "+studio_locale.v(d,"spriteIndex")},
"toXY":function(d){return "u x,y"},
"moveDown":function(d){return "помери доле"},
"moveDownTooltip":function(d){return "Помери учесника на доле."},
"moveLeft":function(d){return "помери лево"},
"moveLeftTooltip":function(d){return "Помери учесника у лево."},
"moveRight":function(d){return "помери десно"},
"moveRightTooltip":function(d){return "Помери учесника у десно."},
"moveUp":function(d){return "помери се горе"},
"moveUpTooltip":function(d){return "Podigni glumca"},
"moveTooltip":function(d){return "Pomeri glumca."},
"nextLevel":function(d){return "Честитке! Завршили сте пузлу."},
"no":function(d){return "не"},
"numBlocksNeeded":function(d){return "Ова слагалица се може решити са %1 блокова."},
"onEventTooltip":function(d){return "Izvrši kod shodno navedenom događaju."},
"ouchExclamation":function(d){return "Jao!"},
"playSoundCrunch":function(d){return "свирај звук крцкања"},
"playSoundGoal1":function(d){return "одсвирај звук циља 1"},
"playSoundGoal2":function(d){return "одсвирај звук циља 2"},
"playSoundHit":function(d){return "одсвирај звук ударца"},
"playSoundLosePoint":function(d){return "одсвирај звук изгубљеног поена"},
"playSoundLosePoint2":function(d){return "одсвирај звук изгубљеног поена 2"},
"playSoundRetro":function(d){return "одсвирај старински звук"},
"playSoundRubber":function(d){return "одсвирај звук гуме"},
"playSoundSlap":function(d){return "одсвирај звук пљеска"},
"playSoundTooltip":function(d){return "Свирај одабрани звук."},
"playSoundWinPoint":function(d){return "одсвирај звук освојеног поена"},
"playSoundWinPoint2":function(d){return "одсвирај звук освојеног поена 2"},
"playSoundWood":function(d){return "одсвирај звук дрвета"},
"positionOutTopLeft":function(d){return "Gore levo pozicija"},
"positionOutTopRight":function(d){return "gore desno pozicija"},
"positionTopOutLeft":function(d){return "spolja levo pozicija"},
"positionTopLeft":function(d){return "ka gornjoj levoj poziciji"},
"positionTopCenter":function(d){return "ka gornjoj centralnoj poziciji"},
"positionTopRight":function(d){return "ka gornjoj desnoj poziciji"},
"positionTopOutRight":function(d){return "to the top outside right position"},
"positionMiddleLeft":function(d){return "to the middle left position"},
"positionMiddleCenter":function(d){return "to the middle center position"},
"positionMiddleRight":function(d){return "to the middle right position"},
"positionBottomOutLeft":function(d){return "to the bottom outside left position"},
"positionBottomLeft":function(d){return "to the bottom left position"},
"positionBottomCenter":function(d){return "to the bottom center position"},
"positionBottomRight":function(d){return "to the bottom right position"},
"positionBottomOutRight":function(d){return "to the bottom outside right position"},
"positionOutBottomLeft":function(d){return "to the below bottom left position"},
"positionOutBottomRight":function(d){return "to the below bottom right position"},
"positionRandom":function(d){return "to the random position"},
"projectileBlueFireball":function(d){return "plava vatrena lopta"},
"projectilePurpleFireball":function(d){return "purple fireball"},
"projectileRedFireball":function(d){return "crvena vatrena lopta"},
"projectileYellowHearts":function(d){return "žuta srca"},
"projectilePurpleHearts":function(d){return "ljubičasta srca"},
"projectileRedHearts":function(d){return "crvena srca"},
"projectileRandom":function(d){return "насумичан"},
"projectileAnna":function(d){return "kuka"},
"projectileElsa":function(d){return "Elsa"},
"projectileHiro":function(d){return "Hiro"},
"projectileBaymax":function(d){return "raketa"},
"projectileRapunzel":function(d){return "šerpa"},
"projectileCherry":function(d){return "cherry"},
"projectileIce":function(d){return "ice"},
"projectileDuck":function(d){return "duck"},
"reinfFeedbackMsg":function(d){return "You can press the \"Try again\" button to go back to playing your story."},
"repeatForever":function(d){return "repeat forever"},
"repeatDo":function(d){return "Уради"},
"repeatForeverTooltip":function(d){return "Execute the actions in this block repeatedly while the story is running."},
"saySprite":function(d){return "say"},
"saySpriteN":function(d){return "учесник "+studio_locale.v(d,"spriteIndex")+" каже"},
"saySpriteTooltip":function(d){return "Појави облачић с повезаним текстом од одређеног учесника."},
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
"saySpriteChoices_16":function(d){return "Да"},
"saySpriteChoices_17":function(d){return "не"},
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
"saySpriteChoices_32":function(d){return "Drago mi je."},
"saySpriteChoices_33":function(d){return "U redu!"},
"saySpriteChoices_34":function(d){return "Hvala"},
"saySpriteChoices_35":function(d){return "ne, hvala"},
"saySpriteChoices_36":function(d){return "Aaaaaah!"},
"saySpriteChoices_37":function(d){return "Nema veze"},
"saySpriteChoices_38":function(d){return "Danas"},
"saySpriteChoices_39":function(d){return "Sutra"},
"saySpriteChoices_40":function(d){return "Juče"},
"saySpriteChoices_41":function(d){return "I found you!"},
"saySpriteChoices_42":function(d){return "You found me!"},
"saySpriteChoices_43":function(d){return "10, 9, 8, 7, 6, 5, 4, 3, 2, 1!"},
"saySpriteChoices_44":function(d){return "You are great!"},
"saySpriteChoices_45":function(d){return "Duhovit si!"},
"saySpriteChoices_46":function(d){return "You are silly! "},
"saySpriteChoices_47":function(d){return "Ti si dobar drug."},
"saySpriteChoices_48":function(d){return "Watch out!"},
"saySpriteChoices_49":function(d){return "Duck!"},
"saySpriteChoices_50":function(d){return "Gotcha!"},
"saySpriteChoices_51":function(d){return "Ow!"},
"saySpriteChoices_52":function(d){return "Sorry!"},
"saySpriteChoices_53":function(d){return "Pažljivo!"},
"saySpriteChoices_54":function(d){return "Whoa!"},
"saySpriteChoices_55":function(d){return "Oops!"},
"saySpriteChoices_56":function(d){return "Zamalo."},
"saySpriteChoices_57":function(d){return "Nice try!"},
"saySpriteChoices_58":function(d){return "Ne možeš da me uhvatiš!"},
"scoreText":function(d){return "Резултат: "+studio_locale.v(d,"playerScore")},
"setBackground":function(d){return "постави позадину"},
"setBackgroundRandom":function(d){return "постави случајну позадину"},
"setBackgroundBlack":function(d){return "постави црну позадину"},
"setBackgroundCave":function(d){return "постави пећинску позадину"},
"setBackgroundCloudy":function(d){return "постави облачну позадину"},
"setBackgroundHardcourt":function(d){return "постави терен као позадину"},
"setBackgroundNight":function(d){return "постави ноћну позадину"},
"setBackgroundUnderwater":function(d){return "постави подводну позадину"},
"setBackgroundCity":function(d){return "постави град у позадини"},
"setBackgroundDesert":function(d){return "постави пустињу у позадини"},
"setBackgroundRainbow":function(d){return "постави дугу у позадини"},
"setBackgroundSoccer":function(d){return "постави фудбалску позадину"},
"setBackgroundSpace":function(d){return "постави свемирску позадину"},
"setBackgroundTennis":function(d){return "постави тениску позадину"},
"setBackgroundWinter":function(d){return "постави зимску позадину"},
"setBackgroundLeafy":function(d){return "Postavi lisnatu pozadinu."},
"setBackgroundGrassy":function(d){return "Postavi travnatu pozadinu."},
"setBackgroundFlower":function(d){return "Postavi pozadinu od cveća."},
"setBackgroundTile":function(d){return "set tile background"},
"setBackgroundIcy":function(d){return "Postavi ledenu pozadinu"},
"setBackgroundSnowy":function(d){return "Postavi snežnu pozadinu"},
"setBackgroundTooltip":function(d){return "Подешава позадинску слику"},
"setEnemySpeed":function(d){return "Postavi brzinu neprijatelja"},
"setPlayerSpeed":function(d){return "Postavi brzinu igrača"},
"setScoreText":function(d){return "постави резултат"},
"setScoreTextTooltip":function(d){return "Подешавање текста који се приказује поред резултата."},
"setSpriteEmotionAngry":function(d){return "u ljuto raspoloženje"},
"setSpriteEmotionHappy":function(d){return "ka srećnom raspoloženju"},
"setSpriteEmotionNormal":function(d){return "u normalno raspoloženje"},
"setSpriteEmotionRandom":function(d){return "u nasumično raspoloženje"},
"setSpriteEmotionSad":function(d){return "u tužno raspoloženje"},
"setSpriteEmotionTooltip":function(d){return "Postavi glumčevo raspoloženje"},
"setSpriteAlien":function(d){return "to an alien image"},
"setSpriteBat":function(d){return "to a bat image"},
"setSpriteBird":function(d){return "to a bird image"},
"setSpriteCat":function(d){return "to a cat image"},
"setSpriteCaveBoy":function(d){return "to a cave boy image"},
"setSpriteCaveGirl":function(d){return "to a cave girl image"},
"setSpriteDinosaur":function(d){return "to a dinosaur image"},
"setSpriteDog":function(d){return "to a dog image"},
"setSpriteDragon":function(d){return "to a dragon image"},
"setSpriteGhost":function(d){return "to a ghost image"},
"setSpriteHidden":function(d){return "to a hidden image"},
"setSpriteHideK1":function(d){return "hide"},
"setSpriteAnna":function(d){return "to a Anna image"},
"setSpriteElsa":function(d){return "to a Elsa image"},
"setSpriteHiro":function(d){return "to a Hiro image"},
"setSpriteBaymax":function(d){return "to a Baymax image"},
"setSpriteRapunzel":function(d){return "to a Rapunzel image"},
"setSpriteKnight":function(d){return "to a knight image"},
"setSpriteMonster":function(d){return "to a monster image"},
"setSpriteNinja":function(d){return "to a masked ninja image"},
"setSpriteOctopus":function(d){return "to an octopus image"},
"setSpritePenguin":function(d){return "to a penguin image"},
"setSpritePirate":function(d){return "to a pirate image"},
"setSpritePrincess":function(d){return "to a princess image"},
"setSpriteRandom":function(d){return "to a random image"},
"setSpriteRobot":function(d){return "to a robot image"},
"setSpriteShowK1":function(d){return "show"},
"setSpriteSpacebot":function(d){return "to a spacebot image"},
"setSpriteSoccerGirl":function(d){return "to a soccer girl image"},
"setSpriteSoccerBoy":function(d){return "to a soccer boy image"},
"setSpriteSquirrel":function(d){return "to a squirrel image"},
"setSpriteTennisGirl":function(d){return "to a tennis girl image"},
"setSpriteTennisBoy":function(d){return "to a tennis boy image"},
"setSpriteUnicorn":function(d){return "to a unicorn image"},
"setSpriteWitch":function(d){return "to a witch image"},
"setSpriteWizard":function(d){return "to a wizard image"},
"setSpritePositionTooltip":function(d){return "Instantly moves an actor to the specified location."},
"setSpriteK1Tooltip":function(d){return "Shows or hides the specified actor."},
"setSpriteTooltip":function(d){return "Sets the actor image"},
"setSpriteSizeRandom":function(d){return "to a random size"},
"setSpriteSizeVerySmall":function(d){return "to a very small size"},
"setSpriteSizeSmall":function(d){return "to a small size"},
"setSpriteSizeNormal":function(d){return "to a normal size"},
"setSpriteSizeLarge":function(d){return "to a large size"},
"setSpriteSizeVeryLarge":function(d){return "to a very large size"},
"setSpriteSizeTooltip":function(d){return "Sets the size of an actor"},
"setSpriteSpeedRandom":function(d){return "to a random speed"},
"setSpriteSpeedVerySlow":function(d){return "to a very slow speed"},
"setSpriteSpeedSlow":function(d){return "to a slow speed"},
"setSpriteSpeedNormal":function(d){return "to a normal speed"},
"setSpriteSpeedFast":function(d){return "to a fast speed"},
"setSpriteSpeedVeryFast":function(d){return "to a very fast speed"},
"setSpriteSpeedTooltip":function(d){return "Sets the speed of an actor"},
"setSpriteZombie":function(d){return "to a zombie image"},
"shareStudioTwitter":function(d){return "Check out the story I made. I wrote it myself with @codeorg"},
"shareGame":function(d){return "Share your story:"},
"showCoordinates":function(d){return "show coordinates"},
"showCoordinatesTooltip":function(d){return "show the protagonist's coordinates on the screen"},
"showTitleScreen":function(d){return "show title screen"},
"showTitleScreenTitle":function(d){return "title"},
"showTitleScreenText":function(d){return "текст"},
"showTSDefTitle":function(d){return "type title here"},
"showTSDefText":function(d){return "type text here"},
"showTitleScreenTooltip":function(d){return "Show a title screen with the associated title and text."},
"size":function(d){return "dimenzija"},
"setSprite":function(d){return "подеси"},
"setSpriteN":function(d){return "set actor "+studio_locale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "крц"},
"soundGoal1":function(d){return "cilj 1\n"},
"soundGoal2":function(d){return "cilj 2"},
"soundHit":function(d){return "udri"},
"soundLosePoint":function(d){return "lose point"},
"soundLosePoint2":function(d){return "lose point 2"},
"soundRetro":function(d){return "retro"},
"soundRubber":function(d){return "rubber"},
"soundSlap":function(d){return "ošamari"},
"soundWinPoint":function(d){return "win point"},
"soundWinPoint2":function(d){return "win point 2"},
"soundWood":function(d){return "wood"},
"speed":function(d){return "speed"},
"startSetValue":function(d){return "start (rocket-height function)"},
"startSetVars":function(d){return "game_vars (title, subtitle, background, target, danger, player)"},
"startSetFuncs":function(d){return "game_funcs (update-target, update-danger, update-player, collide?, on-screen?)"},
"stopSprite":function(d){return "stop"},
"stopSpriteN":function(d){return "stop actor "+studio_locale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Stops an actor's movement."},
"throwSprite":function(d){return "throw"},
"throwSpriteN":function(d){return "actor "+studio_locale.v(d,"spriteIndex")+" throw"},
"throwTooltip":function(d){return "Throws a projectile from the specified actor."},
"vanish":function(d){return "vanish"},
"vanishActorN":function(d){return "vanish actor "+studio_locale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "Vanishes the actor."},
"waitFor":function(d){return "čekaj za"},
"waitSeconds":function(d){return "sekunde"},
"waitForClick":function(d){return "čekaj za klik"},
"waitForRandom":function(d){return "wait for random"},
"waitForHalfSecond":function(d){return "wait for a half second"},
"waitFor1Second":function(d){return "wait for 1 second"},
"waitFor2Seconds":function(d){return "wait for 2 seconds"},
"waitFor5Seconds":function(d){return "wait for 5 seconds"},
"waitFor10Seconds":function(d){return "wait for 10 seconds"},
"waitParamsTooltip":function(d){return "Waits for a specified number of seconds or use zero to wait until a click occurs."},
"waitTooltip":function(d){return "Waits for a specified amount of time or until a click occurs."},
"whenArrowDown":function(d){return "strelica nadole"},
"whenArrowLeft":function(d){return "leva strelica"},
"whenArrowRight":function(d){return "desna strelica"},
"whenArrowUp":function(d){return "gornja strelica"},
"whenArrowTooltip":function(d){return "Execute the actions below when the specified arrow key is pressed."},
"whenDown":function(d){return "кад је стрелица на доле"},
"whenDownTooltip":function(d){return "Изврши акције испод кад се притисне стрелица на доле."},
"whenGameStarts":function(d){return "kada počne priča"},
"whenGameStartsTooltip":function(d){return "Execute the actions below when the story starts."},
"whenLeft":function(d){return "када је стрелица на лево"},
"whenLeftTooltip":function(d){return "Изврши акције испод кад се притисне стрелица лево."},
"whenRight":function(d){return "кад је десна стрелица"},
"whenRightTooltip":function(d){return "Изврши акције испод кад се притисне стрелица десно."},
"whenSpriteClicked":function(d){return "kada klikne učesnik"},
"whenSpriteClickedN":function(d){return "when actor "+studio_locale.v(d,"spriteIndex")+" clicked"},
"whenSpriteClickedTooltip":function(d){return "Execute the actions below when an actor is clicked."},
"whenSpriteCollidedN":function(d){return "when actor "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "Execute the actions below when an actor touches another actor."},
"whenSpriteCollidedWith":function(d){return "dodiruje"},
"whenSpriteCollidedWithAnyActor":function(d){return "dodiruje bilo koji učesnik"},
"whenSpriteCollidedWithAnyEdge":function(d){return "dodiruje ivice"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "dodoruje projektile"},
"whenSpriteCollidedWithAnything":function(d){return "dodirne bilošta"},
"whenSpriteCollidedWithN":function(d){return "touches actor "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "touches blue fireball"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "touches purple fireball"},
"whenSpriteCollidedWithRedFireball":function(d){return "touches red fireball"},
"whenSpriteCollidedWithYellowHearts":function(d){return "touches yellow hearts"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "touches purple hearts"},
"whenSpriteCollidedWithRedHearts":function(d){return "touches red hearts"},
"whenSpriteCollidedWithBottomEdge":function(d){return "touches bottom edge"},
"whenSpriteCollidedWithLeftEdge":function(d){return "touches left edge"},
"whenSpriteCollidedWithRightEdge":function(d){return "touches right edge"},
"whenSpriteCollidedWithTopEdge":function(d){return "touches top edge"},
"whenUp":function(d){return "кад је стрелица на горе"},
"whenUpTooltip":function(d){return "Изврши акције испод кад се притисне стрелица на горе."},
"yes":function(d){return "Да"}};