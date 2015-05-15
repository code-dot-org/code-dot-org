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
"actor":function(d){return "שחקן"},
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
"emotion":function(d){return "מצב רוח"},
"finalLevel":function(d){return "מזל טוב! פתרת את החידה האחרונה."},
"for":function(d){return "עבור"},
"hello":function(d){return "שלום"},
"helloWorld":function(d){return "הי עולם!"},
"incrementPlayerScore":function(d){return "נקודת דרוג"},
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
"positionOutBottomRight":function(d){return "to the below bottom right position"},
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
"setBackground":function(d){return "set background"},
"setBackgroundRandom":function(d){return "set random background"},
"setBackgroundBlack":function(d){return "set black background"},
"setBackgroundCave":function(d){return "set cave background"},
"setBackgroundCloudy":function(d){return "set cloudy background"},
"setBackgroundHardcourt":function(d){return "set hardcourt background"},
"setBackgroundNight":function(d){return "קבע רקע של לילה"},
"setBackgroundUnderwater":function(d){return "קבע רקע מתחת למים"},
"setBackgroundCity":function(d){return "קבע רקע עיר"},
"setBackgroundDesert":function(d){return "קבע רקע מדבר"},
"setBackgroundRainbow":function(d){return "קבע רקע קשת בענן"},
"setBackgroundSoccer":function(d){return "קבע רקע כדורגל"},
"setBackgroundSpace":function(d){return "קבע רקע חלל"},
"setBackgroundTennis":function(d){return "קבע רקע טניס"},
"setBackgroundWinter":function(d){return "קבע רקע חורף"},
"setBackgroundLeafy":function(d){return "set leafy background"},
"setBackgroundGrassy":function(d){return "קבע רקע מעושב"},
"setBackgroundFlower":function(d){return "קבע רקע פרח"},
"setBackgroundTile":function(d){return "set tile background"},
"setBackgroundIcy":function(d){return "קבע רקע קרחוני"},
"setBackgroundSnowy":function(d){return "קבע רקע מושלג"},
"setBackgroundTooltip":function(d){return "קובע את תמונת הרקע"},
"setEnemySpeed":function(d){return "קבע מהירות אויב"},
"setPlayerSpeed":function(d){return "קבע מהירות שחקן"},
"setScoreText":function(d){return "הגדר ניקוד"},
"setScoreTextTooltip":function(d){return "Sets the text to be displayed in the score area."},
"setSpriteEmotionAngry":function(d){return "to a angry mood"},
"setSpriteEmotionHappy":function(d){return "to a happy mood"},
"setSpriteEmotionNormal":function(d){return "to a normal mood"},
"setSpriteEmotionRandom":function(d){return "to a random mood"},
"setSpriteEmotionSad":function(d){return "to a sad mood"},
"setSpriteEmotionTooltip":function(d){return "Sets the actor mood"},
"setSpriteAlien":function(d){return "לתמונת חייזר"},
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
"setSpriteElsa":function(d){return "לדמות של אלסה"},
"setSpriteHiro":function(d){return "לדמות של הירו"},
"setSpriteBaymax":function(d){return "לתמונה של  Baymax"},
"setSpriteRapunzel":function(d){return "לדמות של רפונזל"},
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
"throwTooltip":function(d){return "Throws a projectile from the specified actor."},
"vanish":function(d){return "להיעלם"},
"vanishActorN":function(d){return "vanish actor "+studio_locale.v(d,"spriteIndex")},
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
"whenArrowUp":function(d){return "up arrow"},
"whenArrowTooltip":function(d){return "Execute the actions below when the specified arrow key is pressed."},
"whenDown":function(d){return "כאשר חץ למטה"},
"whenDownTooltip":function(d){return "בצע את הפעולות להלן כאשר נלחץ על המקש חץ למטה."},
"whenGameStarts":function(d){return "כאשר הסיפור מתחיל"},
"whenGameStartsTooltip":function(d){return "Execute the actions below when the story starts."},
"whenLeft":function(d){return "כאשר חץ שמאלה"},
"whenLeftTooltip":function(d){return "בצע את הפעולות להלן כאשר נלחץ על מקש חץ שמאלה."},
"whenRight":function(d){return "כאשר חץ ימינה"},
"whenRightTooltip":function(d){return "בצע את הפעולות להלן כאשר נלחץ על המקש חץ ימינה."},
"whenSpriteClicked":function(d){return "when actor clicked"},
"whenSpriteClickedN":function(d){return "when actor "+studio_locale.v(d,"spriteIndex")+" clicked"},
"whenSpriteClickedTooltip":function(d){return "Execute the actions below when an actor is clicked."},
"whenSpriteCollidedN":function(d){return "when actor "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "Execute the actions below when an actor touches another actor."},
"whenSpriteCollidedWith":function(d){return "touches"},
"whenSpriteCollidedWithAnyActor":function(d){return "touches any actor"},
"whenSpriteCollidedWithAnyEdge":function(d){return "touches any edge"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "touches any projectile"},
"whenSpriteCollidedWithAnything":function(d){return "touches anything"},
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
"whenUp":function(d){return "כאשר חץ למעלה"},
"whenUpTooltip":function(d){return "בצע את הפעולות להלן כאשר נלחץ המקש חץ למעלה."},
"yes":function(d){return "כן"}};