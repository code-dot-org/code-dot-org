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
"actor":function(d){return "بازیگر"},
"addCharacter":function(d){return "add a"},
"addCharacterTooltip":function(d){return "Add a character to the scene."},
"alienInvasion":function(d){return "حمله ی موجودات فضایی!"},
"backgroundBlack":function(d){return "سیاه"},
"backgroundCave":function(d){return "غار"},
"backgroundCloudy":function(d){return "ابری"},
"backgroundHardcourt":function(d){return "hardcourt"},
"backgroundNight":function(d){return "شب"},
"backgroundUnderwater":function(d){return "زیر آب"},
"backgroundCity":function(d){return "شهر"},
"backgroundDesert":function(d){return "بیابان"},
"backgroundRainbow":function(d){return "رنگین کمان"},
"backgroundSoccer":function(d){return "فوتبال"},
"backgroundSpace":function(d){return "فضا"},
"backgroundTennis":function(d){return "تنیس"},
"backgroundWinter":function(d){return "زمستان"},
"calloutPlaceCommandsHere":function(d){return "Place commands here"},
"calloutPlaceCommandsAtTop":function(d){return "Place commands to set up your game at the top"},
"calloutTypeCommandsHere":function(d){return "Type your commands here"},
"calloutCharactersMove":function(d){return "These new commands let you control how the characters move"},
"calloutPutCommandsTouchCharacter":function(d){return "Put a command here to have it happen when you touch a character"},
"calloutClickCategory":function(d){return "Click a category header to see commands in each category"},
"calloutTryOutNewCommands":function(d){return "Try out all the new commands you’ve unlocked"},
"catActions":function(d){return "اقدامات"},
"catControl":function(d){return "حلقه ها"},
"catEvents":function(d){return "رویدادها"},
"catLogic":function(d){return "منطق"},
"catMath":function(d){return "ریاضی"},
"catProcedures":function(d){return "توابع"},
"catText":function(d){return "متن"},
"catVariables":function(d){return "متغیرها"},
"changeScoreTooltip":function(d){return "افزودن یا حذف یک امتیاز به امتیازات .\n"},
"changeScoreTooltipK1":function(d){return "افزودن یک امتیاز به امتیازات ."},
"continue":function(d){return "ادامه بده"},
"decrementPlayerScore":function(d){return "حذف امتیاز"},
"defaultSayText":function(d){return "ایجا تایپ کن"},
"dropletBlock_addCharacter_description":function(d){return "Add a character to the scene."},
"dropletBlock_addCharacter_param0":function(d){return "type"},
"dropletBlock_addCharacter_param0_description":function(d){return "The type of the character to be added ('random', 'man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_changeScore_description":function(d){return "افزودن یا حذف یک امتیاز به امتیازات .\n"},
"dropletBlock_changeScore_param0":function(d){return "امتیاز"},
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
"dropletBlock_playSound_description":function(d){return "صدای انتخاب شده را پخش کن."},
"dropletBlock_playSound_param0":function(d){return "sound"},
"dropletBlock_playSound_param0_description":function(d){return "The name of the sound to play."},
"dropletBlock_setBackground_description":function(d){return "تعیین تصویر پس‌زمینه"},
"dropletBlock_setBackground_param0":function(d){return "image"},
"dropletBlock_setBackground_param0_description":function(d){return "The name of the background theme ('background1', 'background2', or 'background3')."},
"dropletBlock_setBot_description":function(d){return "Changes the active bot."},
"dropletBlock_setBot_param0":function(d){return "image"},
"dropletBlock_setBot_param0_description":function(d){return "The name of the bot image ('random', 'bot1', or 'bot2')."},
"dropletBlock_setBotSpeed_description":function(d){return "Sets the bot speed."},
"dropletBlock_setBotSpeed_param0":function(d){return "سرعت"},
"dropletBlock_setBotSpeed_param0_description":function(d){return "The speed value ('random', 'slow', 'normal', or 'fast')."},
"dropletBlock_setSpriteEmotion_description":function(d){return "تعیین احساس بازیگر"},
"dropletBlock_setSpritePosition_description":function(d){return "بلافاصله بازیگر را به موقعیت مشخص شده حرکت می‌دهد."},
"dropletBlock_setSpriteSpeed_description":function(d){return "تعیین سرعت یک بازیگر"},
"dropletBlock_setSprite_description":function(d){return "تعیین تصویر بازیگر"},
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
"dropletBlock_throw_description":function(d){return "یک موشک را از عملگر مشخصی پرتاب می کند."},
"dropletBlock_vanish_description":function(d){return "ناپدید کردن بازیگر."},
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
"emotion":function(d){return "حالت"},
"finalLevel":function(d){return "تبریک! شما پازل نهایی را حل کردید."},
"for":function(d){return "بشمار با"},
"hello":function(d){return "سلام"},
"helloWorld":function(d){return "سلام دنیا!"},
"incrementPlayerScore":function(d){return "نمره امتیاز"},
"itemBlueFireball":function(d){return "توپ آتشین آبی"},
"itemPurpleFireball":function(d){return "توپ آتشین بنفش"},
"itemRedFireball":function(d){return "توپ آتشین قرمز"},
"itemYellowHearts":function(d){return "قلب های زرذ"},
"itemPurpleHearts":function(d){return "قلب های بنفش"},
"itemRedHearts":function(d){return "قلب های قرمز"},
"itemRandom":function(d){return "تصادفی"},
"itemAnna":function(d){return "قلاب"},
"itemElsa":function(d){return "درخشش"},
"itemHiro":function(d){return "آدم آهنی کوچولو"},
"itemBaymax":function(d){return "موشک"},
"itemRapunzel":function(d){return "ماهی تابه"},
"itemCherry":function(d){return "گیلاس"},
"itemIce":function(d){return "یخ"},
"itemDuck":function(d){return "اردک"},
"itemMan":function(d){return "man"},
"itemPilot":function(d){return "pilot"},
"itemPig":function(d){return "pig"},
"itemBird":function(d){return "bird"},
"itemMouse":function(d){return "mouse"},
"itemRoo":function(d){return "roo"},
"itemSpider":function(d){return "spider"},
"makeProjectileDisappear":function(d){return "ناپدید می شود"},
"makeProjectileBounce":function(d){return "پریدن"},
"makeProjectileBlueFireball":function(d){return "توپ آتشین آبی بساز"},
"makeProjectilePurpleFireball":function(d){return "توپ آتشین بنفش بساز"},
"makeProjectileRedFireball":function(d){return "توپ آتشین قرمز بساز"},
"makeProjectileYellowHearts":function(d){return "قلب زرد بساز"},
"makeProjectilePurpleHearts":function(d){return "قلب های بنفش بساز"},
"makeProjectileRedHearts":function(d){return "قلب های  قرمز بساز"},
"makeProjectileTooltip":function(d){return "موشکی که تازه برخورد کرده را ناپدید کنید یا بالا و پایین ببرید."},
"makeYourOwn":function(d){return "برنامه ی آزمایشگاه بازی خودتان را بسازید"},
"moveDirectionDown":function(d){return "پایین"},
"moveDirectionLeft":function(d){return "سمت چپ"},
"moveDirectionRight":function(d){return "سمت راست"},
"moveDirectionUp":function(d){return "بالا"},
"moveDirectionRandom":function(d){return "تصادفی"},
"moveDistance25":function(d){return "۲۰ پیکسل"},
"moveDistance50":function(d){return "۵۰ پیکسل"},
"moveDistance100":function(d){return "۱۰۰ پیکسل"},
"moveDistance200":function(d){return "۲۰۰ پیکسل"},
"moveDistance400":function(d){return "۴۰۰ پیکسل"},
"moveDistancePixels":function(d){return "پیکسل"},
"moveDistanceRandom":function(d){return "پیکسل های تصادفی"},
"moveDistanceTooltip":function(d){return "یک بازیگر رو در جهت خاص به فاصله خاصی حرکت بده ."},
"moveSprite":function(d){return "حرکت"},
"moveSpriteN":function(d){return "بازیگر را حرکت بده"+studio_locale.v(d,"spriteIndex")+" "},
"toXY":function(d){return "به x,y"},
"moveDown":function(d){return "برو پایین"},
"moveDownTooltip":function(d){return "یک بازیگر رو پایین ببر ."},
"moveLeft":function(d){return "برو چپ"},
"moveLeftTooltip":function(d){return "یک بازیگر رو به چپ ببر ."},
"moveRight":function(d){return "برو راست"},
"moveRightTooltip":function(d){return "یک بازیگر رو به راست ببر ."},
"moveUp":function(d){return "برو بالا"},
"moveUpTooltip":function(d){return "یک بازیگر رو بالا ببر ."},
"moveTooltip":function(d){return "یک بازیگر رو حرکت بده ."},
"nextLevel":function(d){return "تبریک! شما این پازل را به اتمام رساندید."},
"no":function(d){return "نه"},
"numBlocksNeeded":function(d){return "این پازل می تواند با %1 از بلوکها حل شود."},
"onEventTooltip":function(d){return "کد را در پاسخ به رویداد مشخص شده اجرا کن."},
"ouchExclamation":function(d){return "اوخ!"},
"playSoundCrunch":function(d){return "صدای خرد شدن را پخش کن"},
"playSoundGoal1":function(d){return "صدای گل 1 را پخش کن"},
"playSoundGoal2":function(d){return "صدای گل 2 را پخش کن"},
"playSoundHit":function(d){return "صدای ضربه را پخش کن"},
"playSoundLosePoint":function(d){return "صدای از دست دادن امتیاز را پخش کن"},
"playSoundLosePoint2":function(d){return "صدای از دست دادن امتیاز دوم را پخش کن"},
"playSoundRetro":function(d){return "صدای قدیمی پخش کن"},
"playSoundRubber":function(d){return "صدای کش را پخش کن"},
"playSoundSlap":function(d){return "صدای دست زدن را پخش کن"},
"playSoundTooltip":function(d){return "صدای انتخاب شده را پخش کن."},
"playSoundWinPoint":function(d){return "صدای کسب امتیاز را پخش کن"},
"playSoundWinPoint2":function(d){return "صدای کسب امتیاز 2 را پخش کن"},
"playSoundWood":function(d){return "صدای چوب را پخش کن"},
"positionOutTopLeft":function(d){return "به جهت بالا و چپ"},
"positionOutTopRight":function(d){return "به جهت بالا و راست"},
"positionTopOutLeft":function(d){return "به جهت بالا و چپ بیرونی"},
"positionTopLeft":function(d){return "به موقعیت بالا سمت چپ"},
"positionTopCenter":function(d){return "به موقعیت وسط در بالا"},
"positionTopRight":function(d){return "به موقعیت بالا سمت راست"},
"positionTopOutRight":function(d){return "به جهت بالا و راست بیرونی"},
"positionMiddleLeft":function(d){return "به موقعیت وسط سمت چپ"},
"positionMiddleCenter":function(d){return "به موقعیت وسط"},
"positionMiddleRight":function(d){return "به موقعیت وسط سمت راست"},
"positionBottomOutLeft":function(d){return "به جهت پایین و چپ بیرونی"},
"positionBottomLeft":function(d){return "به موقعیت پایین سمت چپ"},
"positionBottomCenter":function(d){return "به موقعیت وسط در پایین"},
"positionBottomRight":function(d){return "به موقعیت پایین سمت راست"},
"positionBottomOutRight":function(d){return "به جهت پایین و راست بیرونی"},
"positionOutBottomLeft":function(d){return "به جهت پایین و چپ"},
"positionOutBottomRight":function(d){return "به جهت پایین و راست"},
"positionRandom":function(d){return "به موقعیت تصادفی"},
"projectileBlueFireball":function(d){return "توپ آتشین آبی"},
"projectilePurpleFireball":function(d){return "توپ آتشین بنفش"},
"projectileRedFireball":function(d){return "توپ آتشین قرمز"},
"projectileYellowHearts":function(d){return "قلب های زرذ"},
"projectilePurpleHearts":function(d){return "قلب های بنفش"},
"projectileRedHearts":function(d){return "قلب های قرمز"},
"projectileRandom":function(d){return "تصادفی"},
"projectileAnna":function(d){return "قلاب"},
"projectileElsa":function(d){return "درخشش"},
"projectileHiro":function(d){return "آدم آهنی کوچولو"},
"projectileBaymax":function(d){return "موشک"},
"projectileRapunzel":function(d){return "ماهی تابه"},
"projectileCherry":function(d){return "گیلاس"},
"projectileIce":function(d){return "یخ"},
"projectileDuck":function(d){return "اردک"},
"reinfFeedbackMsg":function(d){return "شما می توانید دکمه ی \"Keep Playing\" را فشار دهید تا به بازی کردن داستان خود برگردید."},
"repeatForever":function(d){return "تکرار بی‌پایان"},
"repeatDo":function(d){return "انجام بده"},
"repeatForeverTooltip":function(d){return "اجرای عملیات داخل این بلوک بطور مکرر تا زمانی که داستان ادامه دارد."},
"saySprite":function(d){return "گفتن"},
"saySpriteN":function(d){return "بازیگر می گوید"+studio_locale.v(d,"spriteIndex")},
"saySpriteTooltip":function(d){return "نمایش یک بیان صحبت با متن مربوطه از طرف بازیگر مشخص شده."},
"saySpriteChoices_0":function(d){return "سلام."},
"saySpriteChoices_1":function(d){return "سلام به همگی."},
"saySpriteChoices_2":function(d){return "حالتون چطوره?"},
"saySpriteChoices_3":function(d){return "صبح بخیر"},
"saySpriteChoices_4":function(d){return "عصر بخیر"},
"saySpriteChoices_5":function(d){return "شب بخیر"},
"saySpriteChoices_6":function(d){return "غروب بخیر"},
"saySpriteChoices_7":function(d){return "تازه چه خبر؟"},
"saySpriteChoices_8":function(d){return "چی?"},
"saySpriteChoices_9":function(d){return "کجا؟"},
"saySpriteChoices_10":function(d){return "چه وقت؟"},
"saySpriteChoices_11":function(d){return "خوبه."},
"saySpriteChoices_12":function(d){return "عالیه!"},
"saySpriteChoices_13":function(d){return "باشه."},
"saySpriteChoices_14":function(d){return "بد نبود."},
"saySpriteChoices_15":function(d){return "موفق باشید."},
"saySpriteChoices_16":function(d){return "بله"},
"saySpriteChoices_17":function(d){return "نه"},
"saySpriteChoices_18":function(d){return "باشه"},
"saySpriteChoices_19":function(d){return "پرتاب خوبی بود!"},
"saySpriteChoices_20":function(d){return "روز خوبی داشته باشید."},
"saySpriteChoices_21":function(d){return "خداحافظ."},
"saySpriteChoices_22":function(d){return "زود برمیگردم."},
"saySpriteChoices_23":function(d){return "فردا می بینمت!"},
"saySpriteChoices_24":function(d){return "بعدا می بینمت!"},
"saySpriteChoices_25":function(d){return "مواظب خودت باش!"},
"saySpriteChoices_26":function(d){return "لذت ببر!"},
"saySpriteChoices_27":function(d){return "باید برم."},
"saySpriteChoices_28":function(d){return "می خواهی دوست باشیم؟"},
"saySpriteChoices_29":function(d){return "کارت عالی بود!"},
"saySpriteChoices_30":function(d){return "یوو هوو!"},
"saySpriteChoices_31":function(d){return "آره!"},
"saySpriteChoices_32":function(d){return "از دیدنت خوشوقتم."},
"saySpriteChoices_33":function(d){return "باشه!"},
"saySpriteChoices_34":function(d){return "متشکرم"},
"saySpriteChoices_35":function(d){return "نه، ممنون"},
"saySpriteChoices_36":function(d){return "آآآآآآه!"},
"saySpriteChoices_37":function(d){return "بی خیال"},
"saySpriteChoices_38":function(d){return "امروز"},
"saySpriteChoices_39":function(d){return "فردا"},
"saySpriteChoices_40":function(d){return "دیروز"},
"saySpriteChoices_41":function(d){return "پیدات کردم!"},
"saySpriteChoices_42":function(d){return "تو پیدام کردی!"},
"saySpriteChoices_43":function(d){return "10،9،8،7،6،5،4،3،2،1!"},
"saySpriteChoices_44":function(d){return "تو عالی هستی!"},
"saySpriteChoices_45":function(d){return "تو بامزه ای!"},
"saySpriteChoices_46":function(d){return "تو احمقی! "},
"saySpriteChoices_47":function(d){return "تو دوست خوبی هستی!"},
"saySpriteChoices_48":function(d){return "مواظب باش!"},
"saySpriteChoices_49":function(d){return "سرتو بدزد!"},
"saySpriteChoices_50":function(d){return "گرفتم!"},
"saySpriteChoices_51":function(d){return "اوو!"},
"saySpriteChoices_52":function(d){return "ببخشید!"},
"saySpriteChoices_53":function(d){return "دقت کن!"},
"saySpriteChoices_54":function(d){return "ووآآآ!"},
"saySpriteChoices_55":function(d){return "آخ!"},
"saySpriteChoices_56":function(d){return "داشتم گولتو می خوردم!"},
"saySpriteChoices_57":function(d){return "تلاش خوبی بود!"},
"saySpriteChoices_58":function(d){return "نمی تونی منو بگیری!"},
"scoreText":function(d){return "امتیاز: "+studio_locale.v(d,"playerScore")},
"setActivityRandom":function(d){return "set activity to random for"},
"setActivityRoam":function(d){return "set activity to roam for"},
"setActivityChase":function(d){return "set activity to chase for"},
"setActivityFlee":function(d){return "set activity to flee for"},
"setActivityNone":function(d){return "set activity to none for"},
"setActivityTooltip":function(d){return "Sets the activity for a set of items"},
"setBackground":function(d){return "مجموعه پس زمینه"},
"setBackgroundRandom":function(d){return "قراردادن زمینه تصادفی"},
"setBackgroundBlack":function(d){return "قراردادن زمینه سیاه"},
"setBackgroundCave":function(d){return "قراردادن زمینه غار"},
"setBackgroundCloudy":function(d){return "قراردادن زمینه ابری"},
"setBackgroundHardcourt":function(d){return "قراردادن زمینه زمخت"},
"setBackgroundNight":function(d){return "قراردادن زمینه شب"},
"setBackgroundUnderwater":function(d){return "قراردادن زمینه زیرآبی"},
"setBackgroundCity":function(d){return "رنگ پیش زمینه ی شهر رو تعیین کن"},
"setBackgroundDesert":function(d){return "رنگ پیش زمینه ی بیابان رو تعیین کن"},
"setBackgroundRainbow":function(d){return "رنگ پیش زمینه ی رنگین کمان رو تعیین کن"},
"setBackgroundSoccer":function(d){return "رنگ پیش زمینه ی فوتبال رو تعیین کن"},
"setBackgroundSpace":function(d){return "رنگ پیش زمینه ی فضا رو تعیین کن"},
"setBackgroundTennis":function(d){return "رنگ پیش زمینه ی تنیس رو تعیین کن"},
"setBackgroundWinter":function(d){return "رنگ پیش زمینه ی زمستان رو تعیین کن"},
"setBackgroundLeafy":function(d){return "پس زمينه برگی تنظیم کن"},
"setBackgroundGrassy":function(d){return "پس زمینه چمنی تنظیم کن"},
"setBackgroundFlower":function(d){return "پس زمینه گل تنظیم کن"},
"setBackgroundTile":function(d){return "پس زمینه کاشی تنظیم کن"},
"setBackgroundIcy":function(d){return "پس زمینه یخی تنظیم کن"},
"setBackgroundSnowy":function(d){return "پس زمینه برفی تنظیم کن"},
"setBackgroundForest":function(d){return "set forest background"},
"setBackgroundSnow":function(d){return "set snow background"},
"setBackgroundShip":function(d){return "set ship background"},
"setBackgroundTooltip":function(d){return "تعیین تصویر پس‌زمینه"},
"setEnemySpeed":function(d){return "سرعت دشمن را تعیین کن"},
"setItemSpeedSet":function(d){return "set type"},
"setItemSpeedTooltip":function(d){return "Sets the speed for a set of items"},
"setPlayerSpeed":function(d){return "تنظیم سرعت پخش"},
"setScoreText":function(d){return "تنظیم امتیاز"},
"setScoreTextTooltip":function(d){return "نوشته را تنظیم می کند تا در ناحیه ی امتیاز نمایش داده شود."},
"setSpriteEmotionAngry":function(d){return "به یک حال عصبانی"},
"setSpriteEmotionHappy":function(d){return "به خلق و خوی شاد"},
"setSpriteEmotionNormal":function(d){return "تبدیل احساس به حالت نرمال"},
"setSpriteEmotionRandom":function(d){return "تبدیل احساس به یک حالت تصادفی"},
"setSpriteEmotionSad":function(d){return "تبدیل احساس به حالت غمگین"},
"setSpriteEmotionTooltip":function(d){return "تعیین احساس بازیگر"},
"setSpriteAlien":function(d){return "تغییر تصویر به موجود فضایی"},
"setSpriteBat":function(d){return "تغییر تصویر به خفاش"},
"setSpriteBird":function(d){return "تصویر پرنده"},
"setSpriteCat":function(d){return "تصویر گربه"},
"setSpriteCaveBoy":function(d){return "تغییر تصویر به پسر غار نشین"},
"setSpriteCaveGirl":function(d){return "تغییر تصویر به دختر غار نیشن"},
"setSpriteDinosaur":function(d){return "تغییر تصویر به دایناسور"},
"setSpriteDog":function(d){return "تصویر سگ"},
"setSpriteDragon":function(d){return "تغییر تصویر به اژدها"},
"setSpriteGhost":function(d){return "تغییر تصویر به روح"},
"setSpriteHidden":function(d){return "به یک تصویر مخفی"},
"setSpriteHideK1":function(d){return "پنهان کردن"},
"setSpriteAnna":function(d){return "به یک عکس آنا"},
"setSpriteElsa":function(d){return "به یک عکس السا"},
"setSpriteHiro":function(d){return "تصویر Hiro"},
"setSpriteBaymax":function(d){return "تغییر تصویر به بایمکس"},
"setSpriteRapunzel":function(d){return "تصویر Rapunzel"},
"setSpriteKnight":function(d){return "تغییر تصویر به شوالیه"},
"setSpriteMonster":function(d){return "به تصویر هیولا"},
"setSpriteNinja":function(d){return "به تصویر ماسک نینجا"},
"setSpriteOctopus":function(d){return "به تصویر هشت پا"},
"setSpritePenguin":function(d){return "به تصویر پنگوئن"},
"setSpritePirate":function(d){return "به تصویر دزد دریایی"},
"setSpritePrincess":function(d){return "به تصویر شاهزاده خانم"},
"setSpriteRandom":function(d){return "به یک تصویر تصادفی"},
"setSpriteRobot":function(d){return "به تصویر ربات"},
"setSpriteShowK1":function(d){return "نشان می دهد"},
"setSpriteSpacebot":function(d){return "به تصویر ربات فضایی"},
"setSpriteSoccerGirl":function(d){return "به تصویر دختر فوتبالیست"},
"setSpriteSoccerBoy":function(d){return "به تصویر پسر فوتبالیست"},
"setSpriteSquirrel":function(d){return "به تصویر سنجاب"},
"setSpriteTennisGirl":function(d){return "به تصویر دختر تنیسور"},
"setSpriteTennisBoy":function(d){return "به تصویر پسر تنیسور"},
"setSpriteUnicorn":function(d){return "به تصویر تک شاخ"},
"setSpriteWitch":function(d){return "به تصویر جادوگر"},
"setSpriteWizard":function(d){return "به تصویر جادوگر"},
"setSpritePositionTooltip":function(d){return "بلافاصله بازیگر را به موقعیت مشخص شده حرکت می‌دهد."},
"setSpriteK1Tooltip":function(d){return "بازیگر مشخص شده را نشان می دهد یا پنهان می کند ."},
"setSpriteTooltip":function(d){return "تعیین تصویر بازیگر"},
"setSpriteSizeRandom":function(d){return "به اندازه تصادفی"},
"setSpriteSizeVerySmall":function(d){return "به اندازه بسیار کوچک"},
"setSpriteSizeSmall":function(d){return "به اندازه کوچک"},
"setSpriteSizeNormal":function(d){return "به اندازه معمولی"},
"setSpriteSizeLarge":function(d){return "به اندازه بزرگ"},
"setSpriteSizeVeryLarge":function(d){return "به اندازه بسیار بزرگ"},
"setSpriteSizeTooltip":function(d){return "اندازه را برای یک بازیگر مشخص کن"},
"setSpriteSpeedRandom":function(d){return "به یک سرعت تصادفی"},
"setSpriteSpeedVerySlow":function(d){return "به سرعت خیلی آهسته"},
"setSpriteSpeedSlow":function(d){return "به سرعت آهسته"},
"setSpriteSpeedNormal":function(d){return "به سرعت معمولی"},
"setSpriteSpeedFast":function(d){return "به سرعت سریع"},
"setSpriteSpeedVeryFast":function(d){return "به سرعت خیلی سریع"},
"setSpriteSpeedTooltip":function(d){return "تعیین سرعت یک بازیگر"},
"setSpriteZombie":function(d){return "به تصویر زامبی"},
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
"shareStudioTwitter":function(d){return "داستانی که ساخته‌ام را ببین. من خودم آن را با @codeorg نوشته‌ام"},
"shareGame":function(d){return "داستانت را به اشتراک بگذار:"},
"showCoordinates":function(d){return "نشان دادن مختصات"},
"showCoordinatesTooltip":function(d){return "نشان دادن مختصات بازیگر اصلی در صفحه"},
"showTitleScreen":function(d){return "نمایش عنوان صفحه"},
"showTitleScreenTitle":function(d){return "عنوان"},
"showTitleScreenText":function(d){return "متن"},
"showTSDefTitle":function(d){return "عنوان را اینجا بنویس"},
"showTSDefText":function(d){return "متن را اینجا بنویس"},
"showTitleScreenTooltip":function(d){return "یک صفحه ی عنوان با عنوان و نوشته ی مرتبط نشان دهید."},
"size":function(d){return "اندازه"},
"setSprite":function(d){return "مجموعه"},
"setSpriteN":function(d){return "عملگر را تنظیم کنید "+studio_locale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "خرد شدن"},
"soundGoal1":function(d){return "هدف 1"},
"soundGoal2":function(d){return "هدف 2"},
"soundHit":function(d){return "آمار"},
"soundLosePoint":function(d){return "صدای از دست دادن امتیاز"},
"soundLosePoint2":function(d){return "از دست دادن نقطه ای 2"},
"soundRetro":function(d){return "یکپارچه سازی با سیستم عامل"},
"soundRubber":function(d){return "صدای پلاستیک"},
"soundSlap":function(d){return "سیلی"},
"soundWinPoint":function(d){return "صدای برنده شدن امتیاز"},
"soundWinPoint2":function(d){return "صدای برنده شدن امتیاز ۲"},
"soundWood":function(d){return "چوب"},
"speed":function(d){return "سرعت"},
"startSetValue":function(d){return "شروع (عملکرد)"},
"startSetVars":function(d){return "متغیر های-بازی(عنوان،عنوان فرعی،پس زمینه،هدف،خطر،بازی کن)"},
"startSetFuncs":function(d){return "عملکرد های بازی (به روز رسانی-هدف ، به روز رسانی-خطر ، به روز رسانی-بازیکن ، برخورد؟ ، روی صفحه نمایش؟)"},
"stopSprite":function(d){return "بایست"},
"stopSpriteN":function(d){return "توقف بازیگر "+studio_locale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "حرکت یک عملگر را متوقف می کند."},
"throwSprite":function(d){return "پرتاب"},
"throwSpriteN":function(d){return "عملگر "+studio_locale.v(d,"spriteIndex")+" پرتاب"},
"throwTooltip":function(d){return "یک موشک را از عملگر مشخصی پرتاب می کند."},
"vanish":function(d){return "ناپدید شدن"},
"vanishActorN":function(d){return "ناپدید شدن بازیگر "+studio_locale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "ناپدید کردن بازیگر."},
"waitFor":function(d){return "منتظر ماندن برای"},
"waitSeconds":function(d){return "ثانیه"},
"waitForClick":function(d){return "برای کلیک کردن صبر کنید"},
"waitForRandom":function(d){return "منتظر انتخاب تصادفی باشید"},
"waitForHalfSecond":function(d){return "برای نیم ثانیه صبر کنید"},
"waitFor1Second":function(d){return "برای 1 ثانیه صبر کنید"},
"waitFor2Seconds":function(d){return "برای 2 ثانیه صبر کنید"},
"waitFor5Seconds":function(d){return "برای 5 ثانیه صبر کنید"},
"waitFor10Seconds":function(d){return "برای 10 ثانیه صبر کنید"},
"waitParamsTooltip":function(d){return "به مقدار ثانیه های مشخصی وقفه ایجاد کنید یا از صفر استفاده کنید برای ایجاد وقفه  تا زمانی که کلیک  کردن رخ بدهد."},
"waitTooltip":function(d){return "وقفه ای ایجاد کنید به مقدار زمان مشخصی  یا تا زمانی که کلیک کردن رخ دهد."},
"whenArrowDown":function(d){return "فلش سمت پایین"},
"whenArrowLeft":function(d){return "فلش سمت چپ"},
"whenArrowRight":function(d){return "فلش سمت راست"},
"whenArrowUp":function(d){return "فلش سمت بالا"},
"whenArrowTooltip":function(d){return "وقتی کلید جهت دار مشخصی فشرده شده است عملیات زیر را اجرا میکند."},
"whenDown":function(d){return "وقتی که پیکان پایین"},
"whenDownTooltip":function(d){return "کارهای زیر را انجام بده وقتی که کلید جهت پایین فشار داده میشود."},
"whenGameStarts":function(d){return "وقتی که داستان شروع می شود"},
"whenGameStartsTooltip":function(d){return "وقتی که داستان شروع می شود اقدامات زیر را انجام دهید."},
"whenLeft":function(d){return "وقتی که پیکان چپ"},
"whenLeftTooltip":function(d){return "کارهای زیر را انجام بده وقتی که کلید فلش چپ فشار داده می شود."},
"whenRight":function(d){return "وقتی که پیکان راست"},
"whenRightTooltip":function(d){return "کارهای زیر را انجام بده وقتی که کلید جهت راست فشار داده می شود."},
"whenSpriteClicked":function(d){return "وقتی که  بازیگر کلیک کرد"},
"whenSpriteClickedN":function(d){return "هنگامی که بر روی بازیگر "+studio_locale.v(d,"spriteIndex")+" کلیک شده است"},
"whenSpriteClickedTooltip":function(d){return "اجرای عملیات زیر هنگام کلیک روی یک بازیگر."},
"whenSpriteCollidedN":function(d){return "هنگامی که بازیگر "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "اجرای عملیات زیر هنگامیکه یک بازیگر به بازیگر دیگری می‌زسد."},
"whenSpriteCollidedWith":function(d){return "لمس"},
"whenSpriteCollidedWithAnyActor":function(d){return "تماس داشتن با هر بازیگری"},
"whenSpriteCollidedWithAnyEdge":function(d){return "لمس هر لبه"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "تماس داشتن با هر مسیر حرکت"},
"whenSpriteCollidedWithAnything":function(d){return "تماس داشتن با هر چیزی"},
"whenSpriteCollidedWithN":function(d){return "تماس داشتن با بازیگر "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "تماس داشتن با گلوله آتشین آبی"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "تماس داشتن با گلوله آتشین بنفش"},
"whenSpriteCollidedWithRedFireball":function(d){return "تماس داشتن با گلوله آتشین قرمز"},
"whenSpriteCollidedWithYellowHearts":function(d){return "تماس داشتن با قلب های زرد"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "تماس داشتن با قلب های بنفش"},
"whenSpriteCollidedWithRedHearts":function(d){return "تماس داشتن با قلب های قرمز"},
"whenSpriteCollidedWithBottomEdge":function(d){return "تماس داشتن با لبه ی پایینی"},
"whenSpriteCollidedWithLeftEdge":function(d){return "تماس داشتن با لبه ی چپ"},
"whenSpriteCollidedWithRightEdge":function(d){return "تماس داشتن با لبه ی راست"},
"whenSpriteCollidedWithTopEdge":function(d){return "تماس داشتن با لبه ی بالا"},
"whenTouchItem":function(d){return "when character touched"},
"whenTouchItemTooltip":function(d){return "Execute the actions below when the actor touches a character."},
"whenTouchWall":function(d){return "when obstacle touched"},
"whenTouchWallTooltip":function(d){return "Execute the actions below when the actor touches an obstacle."},
"whenUp":function(d){return "وقتی که پیکان بالا"},
"whenUpTooltip":function(d){return "کارهای زیر را انجام بده هنگامیکه کلید جهت بالا زده می‌شود."},
"yes":function(d){return "بله"},
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