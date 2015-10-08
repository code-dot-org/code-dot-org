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
"actor":function(d){return "שחקן"},
"addItems1":function(d){return "הוסף פריט 1"},
"addItems2":function(d){return "הוסף 2 פריטים"},
"addItems3":function(d){return "הוסף 3 פריטים"},
"addItems5":function(d){return "הוסף 5 פריטים"},
"addItems10":function(d){return "הוסף 10 פריטים"},
"addItemsRandom":function(d){return "הוסף מספר אקראי של פריטים"},
"addItemsTooltip":function(d){return "הוסף פריטים לסצנה. "},
"alienInvasion":function(d){return "פלישת חייזרים!"},
"backgroundBlack":function(d){return "שחור"},
"backgroundCave":function(d){return "מערה"},
"backgroundCloudy":function(d){return "מעונן"},
"backgroundHardcourt":function(d){return "משטח קשה"},
"backgroundNight":function(d){return "לילה"},
"backgroundUnderwater":function(d){return "תת-ימי"},
"backgroundCity":function(d){return "עיר"},
"backgroundDesert":function(d){return "מדבר"},
"backgroundRainbow":function(d){return "קשת"},
"backgroundSoccer":function(d){return "כדורגל"},
"backgroundSpace":function(d){return "חלל"},
"backgroundTennis":function(d){return "טניס"},
"backgroundWinter":function(d){return "חורף"},
"catActions":function(d){return "פעולות"},
"catControl":function(d){return "חזרות"},
"catEvents":function(d){return "אירועים"},
"catLogic":function(d){return "לוגיקה"},
"catMath":function(d){return "מתמטיקה"},
"catProcedures":function(d){return "פונקציות"},
"catText":function(d){return "טקסט"},
"catVariables":function(d){return "משתנים"},
"changeScoreTooltip":function(d){return "הוסף או הורד נקודה לניקוד."},
"changeScoreTooltipK1":function(d){return "הוסף נקודה לניקוד."},
"continue":function(d){return "המשך"},
"decrementPlayerScore":function(d){return "החסר נקודה"},
"defaultSayText":function(d){return "הקלד כאן"},
"dropletBlock_addItemsToScene_description":function(d){return "Add new items to the scene."},
"dropletBlock_addItemsToScene_param0":function(d){return "type"},
"dropletBlock_addItemsToScene_param0_description":function(d){return "The type of items to be added ('item_walk_item1', 'item_walk_item2', 'item_walk_item3', or ''item_walk_item4'."},
"dropletBlock_addItemsToScene_param1":function(d){return "count"},
"dropletBlock_addItemsToScene_param1_description":function(d){return "The number of items to add."},
"dropletBlock_changeScore_description":function(d){return "הוסף או הורד נקודה לניקוד."},
"dropletBlock_changeScore_param0":function(d){return "ציון"},
"dropletBlock_changeScore_param0_description":function(d){return "The value to add to the score (negative values will reduce the score)."},
"dropletBlock_moveEast_description":function(d){return "Moves the character to the east."},
"dropletBlock_moveNorth_description":function(d){return "Moves the character to the north."},
"dropletBlock_moveSouth_description":function(d){return "Moves the character to the south."},
"dropletBlock_moveWest_description":function(d){return "Moves the character to the west."},
"dropletBlock_playSound_description":function(d){return "נגן את הצליל שנבחר."},
"dropletBlock_playSound_param0":function(d){return "sound"},
"dropletBlock_playSound_param0_description":function(d){return "The name of the sound to play."},
"dropletBlock_setBackground_description":function(d){return "קובע את תמונת הרקע"},
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
"dropletBlock_setItemSpeed_param1":function(d){return "מהירות"},
"dropletBlock_setItemSpeed_param1_description":function(d){return "The speed value (2, 3, 5, 8, or 12)."},
"dropletBlock_setCharacter_description":function(d){return "Sets the character image."},
"dropletBlock_setCharacter_param0":function(d){return "image"},
"dropletBlock_setCharacter_param0_description":function(d){return "The name of the character image ('character1' or 'character2')."},
"dropletBlock_setCharacterSpeed_description":function(d){return "Sets the character speed."},
"dropletBlock_setCharacterSpeed_param0":function(d){return "מהירות"},
"dropletBlock_setCharacterSpeed_param0_description":function(d){return "The speed value (2, 3, 5, 8, or 12)."},
"dropletBlock_setSpriteEmotion_description":function(d){return "מגדיר את מצב הרוח של שחקן"},
"dropletBlock_setSpritePosition_description":function(d){return "מיד מעביר שחקן למיקום שצוין."},
"dropletBlock_setSpriteSpeed_description":function(d){return "משנה את המהירות של הדמות"},
"dropletBlock_setSprite_description":function(d){return "קובע את תמונת השחקן"},
"dropletBlock_setSprite_param0":function(d){return "index"},
"dropletBlock_setSprite_param0_description":function(d){return "The index (starting at 0) indicating which actor should change."},
"dropletBlock_setSprite_param1":function(d){return "image"},
"dropletBlock_setSprite_param1_description":function(d){return "The name of the actor image."},
"dropletBlock_setWalls_description":function(d){return "Changes the walls in the scene."},
"dropletBlock_setWalls_param0":function(d){return "name"},
"dropletBlock_setWalls_param0_description":function(d){return "The name of the wall set ('border', 'maze', 'maze2', 'default', or 'hidden')."},
"dropletBlock_throw_description":function(d){return "משליח חפץ מהשחקן המסומן."},
"dropletBlock_vanish_description":function(d){return "מעלים את השחקן."},
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
"emotion":function(d){return "מצב רוח"},
"finalLevel":function(d){return "מזל טוב! פתרת את החידה האחרונה."},
"for":function(d){return "עבור"},
"hello":function(d){return "שלום"},
"helloWorld":function(d){return "הי עולם!"},
"incrementPlayerScore":function(d){return "נקודת דרוג"},
"itemBlueFireball":function(d){return "כדור-אש כחול"},
"itemPurpleFireball":function(d){return "כדור-אש סגול"},
"itemRedFireball":function(d){return "כדור-אש אדום"},
"itemYellowHearts":function(d){return "כדור-אש צהוב"},
"itemPurpleHearts":function(d){return "לבבות סגולים"},
"itemRedHearts":function(d){return "לבבות אדומים"},
"itemRandom":function(d){return "אקראי"},
"itemAnna":function(d){return "קרס"},
"itemElsa":function(d){return "נצנוץ"},
"itemHiro":function(d){return "מיקרובוטים"},
"itemBaymax":function(d){return "טיל"},
"itemRapunzel":function(d){return "סיר"},
"itemCherry":function(d){return "דובדבן"},
"itemIce":function(d){return "קרח"},
"itemDuck":function(d){return "ברוז"},
"itemItem1":function(d){return "Item1"},
"itemItem2":function(d){return "Item2"},
"itemItem3":function(d){return "Item3"},
"itemItem4":function(d){return "Item4"},
"makeProjectileDisappear":function(d){return "העלם"},
"makeProjectileBounce":function(d){return "הקפצה"},
"makeProjectileBlueFireball":function(d){return "צור כדור האש כחול"},
"makeProjectilePurpleFireball":function(d){return "צור כדור אש סגול"},
"makeProjectileRedFireball":function(d){return "צור כדור אש אדום"},
"makeProjectileYellowHearts":function(d){return "צור לבבות צהובים"},
"makeProjectilePurpleHearts":function(d){return "צור לבבות סגולים"},
"makeProjectileRedHearts":function(d){return "צור לבבות אדומים"},
"makeProjectileTooltip":function(d){return "גרום לקליעים שהתנגשו להיעלם או לקפץ."},
"makeYourOwn":function(d){return "צור אפליקצית מעבדה משלך"},
"moveDirectionDown":function(d){return "למטה"},
"moveDirectionLeft":function(d){return "שמאלה"},
"moveDirectionRight":function(d){return "ימינה"},
"moveDirectionUp":function(d){return "למעלה"},
"moveDirectionRandom":function(d){return "אקראי"},
"moveDistance25":function(d){return "25 פיקסלים"},
"moveDistance50":function(d){return "50 פיקסלים"},
"moveDistance100":function(d){return "100 פיקסלים"},
"moveDistance200":function(d){return "200 פיקסלים"},
"moveDistance400":function(d){return "400 פיקסלים"},
"moveDistancePixels":function(d){return "פיקסלים"},
"moveDistanceRandom":function(d){return "מספר אקראי של פיקסלים"},
"moveDistanceTooltip":function(d){return "הזז את השחקן מרחק מסויים בכיוון שנבחר."},
"moveSprite":function(d){return "זוז"},
"moveSpriteN":function(d){return "הזז את השחקן "+studio_locale.v(d,"spriteIndex")},
"toXY":function(d){return "ל x,y"},
"moveDown":function(d){return "הזז למטה"},
"moveDownTooltip":function(d){return "הזז שחקן כלפי מטה."},
"moveLeft":function(d){return "זוז שמאלה"},
"moveLeftTooltip":function(d){return "הזז שחקן שמאלה."},
"moveRight":function(d){return "זוז ימינה"},
"moveRightTooltip":function(d){return "הזז שחקן ימינה."},
"moveUp":function(d){return "זוז למעלה"},
"moveUpTooltip":function(d){return "הזז שחקן למעלה."},
"moveTooltip":function(d){return "הזז שחקן."},
"nextLevel":function(d){return "מזל טוב! השלמת את הפאזל הזה."},
"no":function(d){return "לא"},
"numBlocksNeeded":function(d){return "ניתן לפתור את הפאזל עם %1 בלוק."},
"onEventTooltip":function(d){return "בצע קוד בתגובה לאירוע מסויים."},
"ouchExclamation":function(d){return "איי !"},
"playSoundCrunch":function(d){return "תשמיע צליל מעיכה"},
"playSoundGoal1":function(d){return "השמע צליל מטרה 1"},
"playSoundGoal2":function(d){return "השמע צליל מטרה 2"},
"playSoundHit":function(d){return "השמע צליל פגיעה"},
"playSoundLosePoint":function(d){return "השמע צליל איבוד נקודה"},
"playSoundLosePoint2":function(d){return "השמע צליל איבוד נקודה 2"},
"playSoundRetro":function(d){return "השמע צליל רטרו"},
"playSoundRubber":function(d){return "השמע צליל גומי"},
"playSoundSlap":function(d){return "השמע צליל סטירה"},
"playSoundTooltip":function(d){return "נגן את הצליל שנבחר."},
"playSoundWinPoint":function(d){return "השמע צליל נקודת ניצחון"},
"playSoundWinPoint2":function(d){return "השמע צליל נקודת ניצחון 2"},
"playSoundWood":function(d){return "השמע צליל עץ"},
"positionOutTopLeft":function(d){return "למיקום העליון השמאלי"},
"positionOutTopRight":function(d){return "במיקום למעלה מימין"},
"positionTopOutLeft":function(d){return "במיקום למעלה החיצוני משמאל"},
"positionTopLeft":function(d){return "במיקום למעלה משמאל"},
"positionTopCenter":function(d){return "במיקום למעלה במרכז"},
"positionTopRight":function(d){return "במיקום למעלה מימין"},
"positionTopOutRight":function(d){return "במיקום למעלה ימני חיצוני"},
"positionMiddleLeft":function(d){return "במיקום שמאלי אמצעי"},
"positionMiddleCenter":function(d){return "במיקום אמצעי מרכזי"},
"positionMiddleRight":function(d){return "במיקום אמצעי ימני"},
"positionBottomOutLeft":function(d){return "במיקום תחתון שמאלי חיצוני"},
"positionBottomLeft":function(d){return "במיקום תחתון שמאלי"},
"positionBottomCenter":function(d){return "במיקום תחתון מרכזי"},
"positionBottomRight":function(d){return "במיקום תחתון ימני"},
"positionBottomOutRight":function(d){return "במיקום תחתון ימני חיצוני"},
"positionOutBottomLeft":function(d){return "במיקום תחתון שמאלי למטה"},
"positionOutBottomRight":function(d){return "למיקום התחתון הימני"},
"positionRandom":function(d){return "למיקום אקראי"},
"projectileBlueFireball":function(d){return "כדור-אש כחול"},
"projectilePurpleFireball":function(d){return "כדור-אש סגול"},
"projectileRedFireball":function(d){return "כדור-אש אדום"},
"projectileYellowHearts":function(d){return "כדור-אש צהוב"},
"projectilePurpleHearts":function(d){return "לבבות סגולים"},
"projectileRedHearts":function(d){return "לבבות אדומים"},
"projectileRandom":function(d){return "אקראי"},
"projectileAnna":function(d){return "קרס"},
"projectileElsa":function(d){return "נצנוץ"},
"projectileHiro":function(d){return "מיקרובוטים"},
"projectileBaymax":function(d){return "טיל"},
"projectileRapunzel":function(d){return "סיר"},
"projectileCherry":function(d){return "דובדבן"},
"projectileIce":function(d){return "קרח"},
"projectileDuck":function(d){return "ברוז"},
"reinfFeedbackMsg":function(d){return "באפשרותך להקיש על כפתור \"להמשיך לשחק\" כדי לחזור והפעיל את הסיפור שלך."},
"repeatForever":function(d){return "חזור לנצח"},
"repeatDo":function(d){return "בצע"},
"repeatForeverTooltip":function(d){return "חזור על פעולות בבלוק זה שוב ושוב כל עוד הסיפור רץ."},
"saySprite":function(d){return "אמור"},
"saySpriteN":function(d){return "שחקן "+studio_locale.v(d,"spriteIndex")+" אומר"},
"saySpriteTooltip":function(d){return "הצג בועית דיבור עם הטקסט המשויך לשחקן הספציפי."},
"saySpriteChoices_0":function(d){return "שלום לך."},
"saySpriteChoices_1":function(d){return "היי כולם."},
"saySpriteChoices_2":function(d){return "מה שלומכם?"},
"saySpriteChoices_3":function(d){return "בוקר טוב"},
"saySpriteChoices_4":function(d){return "צהריים טובים"},
"saySpriteChoices_5":function(d){return "לילה טוב"},
"saySpriteChoices_6":function(d){return "ערב טוב"},
"saySpriteChoices_7":function(d){return "מה חדש?"},
"saySpriteChoices_8":function(d){return "מה?"},
"saySpriteChoices_9":function(d){return "איפה?"},
"saySpriteChoices_10":function(d){return "מתי?"},
"saySpriteChoices_11":function(d){return "טוב."},
"saySpriteChoices_12":function(d){return "נהדר!"},
"saySpriteChoices_13":function(d){return "בסדר."},
"saySpriteChoices_14":function(d){return "לא רע."},
"saySpriteChoices_15":function(d){return "בהצלחה."},
"saySpriteChoices_16":function(d){return "כן"},
"saySpriteChoices_17":function(d){return "לא"},
"saySpriteChoices_18":function(d){return "בסדר"},
"saySpriteChoices_19":function(d){return "זריקה טובה!"},
"saySpriteChoices_20":function(d){return "שיהיה לך יום יפה."},
"saySpriteChoices_21":function(d){return "ביי."},
"saySpriteChoices_22":function(d){return "אחזור בקרוב."},
"saySpriteChoices_23":function(d){return "אראה אותך מחר!"},
"saySpriteChoices_24":function(d){return "אראה אותך אחרכך!"},
"saySpriteChoices_25":function(d){return "תהיה אחראי!"},
"saySpriteChoices_26":function(d){return "תהנה!"},
"saySpriteChoices_27":function(d){return "אני צריך ללכת."},
"saySpriteChoices_28":function(d){return "רוצה שנהיה חברים?"},
"saySpriteChoices_29":function(d){return "כל הכבוד!"},
"saySpriteChoices_30":function(d){return "ווו הווו!"},
"saySpriteChoices_31":function(d){return "יש!"},
"saySpriteChoices_32":function(d){return "נעים להכיר."},
"saySpriteChoices_33":function(d){return "בסדר!"},
"saySpriteChoices_34":function(d){return "תודה רבה"},
"saySpriteChoices_35":function(d){return "לא, תודה"},
"saySpriteChoices_36":function(d){return "אההה!"},
"saySpriteChoices_37":function(d){return "לא משנה"},
"saySpriteChoices_38":function(d){return "היום"},
"saySpriteChoices_39":function(d){return "מחר"},
"saySpriteChoices_40":function(d){return "אתמול"},
"saySpriteChoices_41":function(d){return "מצאתי אותך!"},
"saySpriteChoices_42":function(d){return ". מצאת אותי!"},
"saySpriteChoices_43":function(d){return "10, 9, 8, 7, 6, 5, 4, 3, 2, 1!"},
"saySpriteChoices_44":function(d){return "אתה מדהים!"},
"saySpriteChoices_45":function(d){return "אתה מצחיק!"},
"saySpriteChoices_46":function(d){return "אתה מטופש! "},
"saySpriteChoices_47":function(d){return ". אתה חבר טוב!"},
"saySpriteChoices_48":function(d){return "תיזהר!"},
"saySpriteChoices_49":function(d){return "ברווז!"},
"saySpriteChoices_50":function(d){return "תפסתי אותך!"},
"saySpriteChoices_51":function(d){return "אוו!"},
"saySpriteChoices_52":function(d){return "סליחה!"},
"saySpriteChoices_53":function(d){return "זהירות!"},
"saySpriteChoices_54":function(d){return "הלו!"},
"saySpriteChoices_55":function(d){return "אופס!"},
"saySpriteChoices_56":function(d){return "כמעט תפסת אותי!"},
"saySpriteChoices_57":function(d){return "ניסיון יפה!"},
"saySpriteChoices_58":function(d){return "לא תתפוס אותי!"},
"scoreText":function(d){return "ציון: "+studio_locale.v(d,"playerScore")},
"setActivityRandom":function(d){return "set activity to random for"},
"setActivityPatrol":function(d){return "set activity to patrol for"},
"setActivityChase":function(d){return "set activity to chase for"},
"setActivityFlee":function(d){return "set activity to flee for"},
"setActivityNone":function(d){return "set activity to none for"},
"setActivityTooltip":function(d){return "Sets the activity for a set of items"},
"setBackground":function(d){return "קבע רקע"},
"setBackgroundRandom":function(d){return "קבע רקע אקראי"},
"setBackgroundBlack":function(d){return "קבע רקע שחור"},
"setBackgroundCave":function(d){return "קבע רקע מערה"},
"setBackgroundCloudy":function(d){return "קבע רקע מעונן"},
"setBackgroundHardcourt":function(d){return "קבע את רקע המגרש"},
"setBackgroundNight":function(d){return "קבע רקע של לילה"},
"setBackgroundUnderwater":function(d){return "קבע רקע מתחת למים"},
"setBackgroundCity":function(d){return "קבע רקע עיר"},
"setBackgroundDesert":function(d){return "קבע רקע מדבר"},
"setBackgroundRainbow":function(d){return "קבע רקע קשת בענן"},
"setBackgroundSoccer":function(d){return "קבע רקע כדורגל"},
"setBackgroundSpace":function(d){return "קבע רקע חלל"},
"setBackgroundTennis":function(d){return "קבע רקע טניס"},
"setBackgroundWinter":function(d){return "קבע רקע חורף"},
"setBackgroundLeafy":function(d){return "קביעת רקע עלים"},
"setBackgroundGrassy":function(d){return "קבע רקע מעושב"},
"setBackgroundFlower":function(d){return "קבע רקע פרח"},
"setBackgroundTile":function(d){return "קביעת רקע אריחים"},
"setBackgroundIcy":function(d){return "קבע רקע קרחוני"},
"setBackgroundSnowy":function(d){return "קבע רקע מושלג"},
"setBackgroundBackground1":function(d){return "set background1 background"},
"setBackgroundBackground2":function(d){return "set background2 background"},
"setBackgroundBackground3":function(d){return "set background3 background"},
"setBackgroundTooltip":function(d){return "קובע את תמונת הרקע"},
"setEnemySpeed":function(d){return "קבע מהירות אויב"},
"setItemSpeedSet":function(d){return "set type"},
"setItemSpeedTooltip":function(d){return "Sets the speed for a set of items"},
"setPlayerSpeed":function(d){return "קבע מהירות שחקן"},
"setScoreText":function(d){return "הגדר ניקוד"},
"setScoreTextTooltip":function(d){return "מגדיר את הטקסט שיוצג באזור הניקוד."},
"setSpriteEmotionAngry":function(d){return "למצב רוח עצבני"},
"setSpriteEmotionHappy":function(d){return "למצב רוח שמח"},
"setSpriteEmotionNormal":function(d){return "למצב רוח רגיל"},
"setSpriteEmotionRandom":function(d){return "למצב רוח אקראי"},
"setSpriteEmotionSad":function(d){return "למצב רוח עצוב"},
"setSpriteEmotionTooltip":function(d){return "מגדיר את מצב הרוח של שחקן"},
"setSpriteAlien":function(d){return "לתמונת חייזר"},
"setSpriteBat":function(d){return "לתמונת עטלף"},
"setSpriteBird":function(d){return "לתמונת ציפור"},
"setSpriteCat":function(d){return "לתמונת חתול"},
"setSpriteCaveBoy":function(d){return "לתמונת איש מערות"},
"setSpriteCaveGirl":function(d){return "לתמונת נערת מערות"},
"setSpriteDinosaur":function(d){return "לתמונת דינוזאור"},
"setSpriteDog":function(d){return "לתמונת כלב"},
"setSpriteDragon":function(d){return "לתמונת דרקון"},
"setSpriteGhost":function(d){return "לתמונת רוח רפאים"},
"setSpriteHidden":function(d){return "לתמונה מוסתרת"},
"setSpriteHideK1":function(d){return "הסתר"},
"setSpriteAnna":function(d){return "לתמונה של אנה"},
"setSpriteElsa":function(d){return "לדמות של אלסה"},
"setSpriteHiro":function(d){return "לדמות של הירו"},
"setSpriteBaymax":function(d){return "לתמונה של  Baymax"},
"setSpriteRapunzel":function(d){return "לדמות של רפונזל"},
"setSpriteKnight":function(d){return "לתמונת אביר"},
"setSpriteMonster":function(d){return "לתמונת מפלצת"},
"setSpriteNinja":function(d){return "לתמונת נינג'ה עם מסכה"},
"setSpriteOctopus":function(d){return "לתמונת תמנון"},
"setSpritePenguin":function(d){return "לתמונת פינגווין"},
"setSpritePirate":function(d){return "לתמונת פיראט"},
"setSpritePrincess":function(d){return "לתמונת נסיכה"},
"setSpriteRandom":function(d){return "לתמונה אקראית"},
"setSpriteRobot":function(d){return "לתמונת רובוט"},
"setSpriteShowK1":function(d){return "הצג"},
"setSpriteSpacebot":function(d){return "לעבר תמונת רובוט החלל"},
"setSpriteSoccerGirl":function(d){return "לתמונת ילדת כדורגל"},
"setSpriteSoccerBoy":function(d){return "לתמונת ילד כדורגל"},
"setSpriteSquirrel":function(d){return "לתמונת סנאי"},
"setSpriteTennisGirl":function(d){return "לתמונת ילדת טניס"},
"setSpriteTennisBoy":function(d){return "לתמונת ילד טניס"},
"setSpriteUnicorn":function(d){return "לתמונת חד קרן"},
"setSpriteWitch":function(d){return "לתמונת מכשפה"},
"setSpriteWizard":function(d){return "לתמונת מכשף"},
"setSpritePositionTooltip":function(d){return "מיד מעביר שחקן למיקום שצוין."},
"setSpriteK1Tooltip":function(d){return "מציג או מסתיר את השחקן שצוין."},
"setSpriteTooltip":function(d){return "קובע את תמונת השחקן"},
"setSpriteSizeRandom":function(d){return "לגודל אקראי"},
"setSpriteSizeVerySmall":function(d){return "לגודל קטן מאוד"},
"setSpriteSizeSmall":function(d){return "לגודל קטן"},
"setSpriteSizeNormal":function(d){return "לגודל רגיל"},
"setSpriteSizeLarge":function(d){return "לגודל גדול"},
"setSpriteSizeVeryLarge":function(d){return "לגודל גדול מאוד"},
"setSpriteSizeTooltip":function(d){return "קובע את גודל השחקן"},
"setSpriteSpeedRandom":function(d){return "למהירות אקראית"},
"setSpriteSpeedVerySlow":function(d){return "למהירות איטית ביותר"},
"setSpriteSpeedSlow":function(d){return "למהירות איטית"},
"setSpriteSpeedNormal":function(d){return "למהירות רגילה"},
"setSpriteSpeedFast":function(d){return "למהירות מהירה"},
"setSpriteSpeedVeryFast":function(d){return "למהירות מהירה ביותר"},
"setSpriteSpeedTooltip":function(d){return "משנה את המהירות של הדמות"},
"setSpriteZombie":function(d){return "לתמונת זומבי"},
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
"shareStudioTwitter":function(d){return "תראו את הסיפור שיצרתי. כתבתי אותו בעצמי עם @codeorg"},
"shareGame":function(d){return "שתף את הסיפור שלך:"},
"showCoordinates":function(d){return "הצג נקודות ציון"},
"showCoordinatesTooltip":function(d){return "הצג את נקודות הציון של היריב על המסך"},
"showTitleScreen":function(d){return "הצג את מסך הכותרת"},
"showTitleScreenTitle":function(d){return "כותרת"},
"showTitleScreenText":function(d){return "טקסט"},
"showTSDefTitle":function(d){return "הקלד את הכותרת כאן"},
"showTSDefText":function(d){return "הקלד טקסט כאן"},
"showTitleScreenTooltip":function(d){return "הצג את מסך הכותרת עם הכותרת והטקסט המשויכים."},
"size":function(d){return "גודל"},
"setSprite":function(d){return "השם"},
"setSpriteN":function(d){return "הגדר שחקן "+studio_locale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "מעיכה"},
"soundGoal1":function(d){return "מטרה 1"},
"soundGoal2":function(d){return "מטרה 2"},
"soundHit":function(d){return "פגיעה"},
"soundLosePoint":function(d){return "לאבד נקודה"},
"soundLosePoint2":function(d){return "לאבד נקודה 2"},
"soundRetro":function(d){return "רטרו"},
"soundRubber":function(d){return "גומי"},
"soundSlap":function(d){return "חבטה"},
"soundWinPoint":function(d){return "זכיה בנקודה"},
"soundWinPoint2":function(d){return "זכיה בנקודה 2"},
"soundWood":function(d){return "עץ"},
"speed":function(d){return "מהירות"},
"startSetValue":function(d){return "התחל (function)"},
"startSetVars":function(d){return "game_vars (כותרת, כותרת משנה, הרקע, היעד, סכנה, נגן)"},
"startSetFuncs":function(d){return "game_funcs (עדכון-יעד, עדכון-סכנה, עדכון-שחקן, מתנגשים?, על המסך?)"},
"stopSprite":function(d){return "עצור"},
"stopSpriteN":function(d){return "עצור שחקן "+studio_locale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "עוצר את תנועת השחקן."},
"throwSprite":function(d){return "זרוק"},
"throwSpriteN":function(d){return "שחקן "+studio_locale.v(d,"spriteIndex")+" זורק"},
"throwTooltip":function(d){return "משליח חפץ מהשחקן המסומן."},
"vanish":function(d){return "להיעלם"},
"vanishActorN":function(d){return "העלם שחקן "+studio_locale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "מעלים את השחקן."},
"waitFor":function(d){return "חכה ל"},
"waitSeconds":function(d){return "שניות"},
"waitForClick":function(d){return "חכה ללחיצה"},
"waitForRandom":function(d){return "חכה לאקראי"},
"waitForHalfSecond":function(d){return "חכה במשך חצי שניה"},
"waitFor1Second":function(d){return "חכה שנייה אחת"},
"waitFor2Seconds":function(d){return "חכה 2 שניות"},
"waitFor5Seconds":function(d){return "חכה 5 שניות"},
"waitFor10Seconds":function(d){return "חכה 10 שניות"},
"waitParamsTooltip":function(d){return "מחכה למשך מספר השניות שהוגדר או השתמש באפס כדי לחכות ללחיצה."},
"waitTooltip":function(d){return "מחכה במשך הזמן שהוגדר או עד שמתרחשת לחיצה."},
"whenArrowDown":function(d){return "חץ למטה"},
"whenArrowLeft":function(d){return "חץ שמאלה"},
"whenArrowRight":function(d){return "חץ ימינה"},
"whenArrowUp":function(d){return "חץ למעלה"},
"whenArrowTooltip":function(d){return "בצע את הפעולות להלן, כאשר מקש החץ שצוין נלחץ."},
"whenDown":function(d){return "כאשר חץ למטה"},
"whenDownTooltip":function(d){return "בצע את הפעולות להלן כאשר נלחץ על המקש חץ למטה."},
"whenGameStarts":function(d){return "כאשר הסיפור מתחיל"},
"whenGameStartsTooltip":function(d){return "בצע את הפעולות הבאות מיד כשהסיפור מתחיל."},
"whenLeft":function(d){return "כאשר חץ שמאלה"},
"whenLeftTooltip":function(d){return "בצע את הפעולות להלן כאשר נלחץ על מקש חץ שמאלה."},
"whenRight":function(d){return "כאשר חץ ימינה"},
"whenRightTooltip":function(d){return "בצע את הפעולות להלן כאשר נלחץ על המקש חץ ימינה."},
"whenSpriteClicked":function(d){return "כשחקן נלחץ"},
"whenSpriteClickedN":function(d){return "כשדמות "+studio_locale.v(d,"spriteIndex")+" נלחצת"},
"whenSpriteClickedTooltip":function(d){return "בצע את הפעולות להלן כאשר שחקן נלחץ."},
"whenSpriteCollidedN":function(d){return "כאשר שחקן "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "בצע את הפעולות להלן כאשר שחקן אחד נוגע בשחקן אחר."},
"whenSpriteCollidedWith":function(d){return "נוגע"},
"whenSpriteCollidedWithAnyActor":function(d){return "נוגע בכל שחקן"},
"whenSpriteCollidedWithAnyEdge":function(d){return "נוגע באחד הקצוות"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "נוגע בכל קליע"},
"whenSpriteCollidedWithAnything":function(d){return "נוגע בכל דבר"},
"whenSpriteCollidedWithN":function(d){return "נוגע בשחקן "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "נוגע בכדור אש כחול"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "נוגע בכדור אש סגול"},
"whenSpriteCollidedWithRedFireball":function(d){return "נוגע בכדור אש אדום"},
"whenSpriteCollidedWithYellowHearts":function(d){return "נוגע בלבבות צהובים"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "נוגע בלבבות סגולים"},
"whenSpriteCollidedWithRedHearts":function(d){return "נוגע בלבבות אדומים"},
"whenSpriteCollidedWithBottomEdge":function(d){return "נוגע בקצה התחתון"},
"whenSpriteCollidedWithLeftEdge":function(d){return "נוגע בקצה השמאלי"},
"whenSpriteCollidedWithRightEdge":function(d){return "נוגע בקצה הימני"},
"whenSpriteCollidedWithTopEdge":function(d){return "נוגע בקצה העליון"},
"whenTouchItem":function(d){return "when item touched"},
"whenTouchItemTooltip":function(d){return "Execute the actions below when the actor touches an item."},
"whenTouchWall":function(d){return "when wall touched"},
"whenTouchWallTooltip":function(d){return "Execute the actions below when the actor touches a wall."},
"whenUp":function(d){return "כאשר חץ למעלה"},
"whenUpTooltip":function(d){return "בצע את הפעולות להלן כאשר נלחץ המקש חץ למעלה."},
"yes":function(d){return "כן"},
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