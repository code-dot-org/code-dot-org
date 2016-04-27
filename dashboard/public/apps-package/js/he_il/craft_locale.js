var craft_locale = {lc:{"ar":function(n){
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
v:function(d,k){craft_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){craft_locale.c(d,k);return d[k] in p?p[d[k]]:(k=craft_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){craft_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).craft_locale = {
"blockDestroyBlock":function(d){return "השמד בלוק"},
"blockIf":function(d){return "אם"},
"blockIfLavaAhead":function(d){return "אם לבה נמצאת מקדימה"},
"blockMoveForward":function(d){return "לזוז קדימה"},
"blockPlaceTorch":function(d){return "שים לפיד"},
"blockPlaceXAheadAhead":function(d){return "קדימה"},
"blockPlaceXAheadPlace":function(d){return "מקם"},
"blockPlaceXPlace":function(d){return "מקם"},
"blockPlantCrop":function(d){return "שתול יבול"},
"blockShear":function(d){return "לגזוז"},
"blockTillSoil":function(d){return "חרוש את האדמה"},
"blockTurnLeft":function(d){return "פנה שמאלה"},
"blockTurnRight":function(d){return "פנה ימינה"},
"blockTypeBedrock":function(d){return "אבן יסוד"},
"blockTypeBricks":function(d){return "לבנים"},
"blockTypeClay":function(d){return "חימר"},
"blockTypeClayHardened":function(d){return "חימר קשה"},
"blockTypeCobblestone":function(d){return "אבן"},
"blockTypeDirt":function(d){return "אדמה"},
"blockTypeDirtCoarse":function(d){return "אדמה גסה"},
"blockTypeEmpty":function(d){return "ריק"},
"blockTypeFarmlandWet":function(d){return "אדמה חקלאית"},
"blockTypeGlass":function(d){return "זכוכית"},
"blockTypeGrass":function(d){return "דשא"},
"blockTypeGravel":function(d){return "חצץ"},
"blockTypeLava":function(d){return "לבה"},
"blockTypeLogAcacia":function(d){return "בול עץ שיטה"},
"blockTypeLogBirch":function(d){return "בול עץ ליבנה"},
"blockTypeLogJungle":function(d){return "בול עץ ג'ונגל"},
"blockTypeLogOak":function(d){return "בול עץ אלון"},
"blockTypeLogSpruce":function(d){return "בול עץ אשוחית"},
"blockTypeOreCoal":function(d){return "עפרות פחם"},
"blockTypeOreDiamond":function(d){return "עפרת יהלומים"},
"blockTypeOreEmerald":function(d){return "עפרת ברקת"},
"blockTypeOreGold":function(d){return "עפרת זהב"},
"blockTypeOreIron":function(d){return "עפרת ברזל"},
"blockTypeOreLapis":function(d){return "עפרת לפיס"},
"blockTypeOreRedstone":function(d){return "עפרת רדסטון"},
"blockTypePlanksAcacia":function(d){return "קרשי שיטה"},
"blockTypePlanksBirch":function(d){return "קרשי ליבנה"},
"blockTypePlanksJungle":function(d){return "קרשי ג'ונגל"},
"blockTypePlanksOak":function(d){return "קרשי אלון"},
"blockTypePlanksSpruce":function(d){return "קרשי אשוחית"},
"blockTypeRail":function(d){return "מסילה"},
"blockTypeSand":function(d){return "חול"},
"blockTypeSandstone":function(d){return "אבן חול"},
"blockTypeStone":function(d){return "אבן"},
"blockTypeTnt":function(d){return "חומר נפץ"},
"blockTypeTree":function(d){return "עץ"},
"blockTypeWater":function(d){return "מים"},
"blockTypeWool":function(d){return "צמר"},
"blockWhileXAheadAhead":function(d){return "קדימה"},
"blockWhileXAheadDo":function(d){return "בצע"},
"blockWhileXAheadWhile":function(d){return "כאשר"},
"generatedCodeDescription":function(d){return "על-ידי גרירה והצבת בלוקים כאלו, ניתן ליצור אוסף של הוראות בשפת קוד למחשב - הנקראת ג'אווה סקריפט (Javascript). קוד זה מורה למחשב מה להציג על המסך. כל מה שאתם רואים ועושים במיינקראפט גם הוא מתחיל עם שורות קוד שכאלו."},
"houseSelectChooseFloorPlan":function(d){return "בחר את תוכנית הבית שלך."},
"houseSelectEasy":function(d){return "קל"},
"houseSelectHard":function(d){return "קשה"},
"houseSelectLetsBuild":function(d){return "בואו נבנה בית."},
"houseSelectMedium":function(d){return "בינוני"},
"keepPlayingButton":function(d){return "המשך לשחק"},
"level10FailureMessage":function(d){return "כסה את הלבה על מנת לחצות ואז חצוב שני בלוקי ברזל בצד השני."},
"level11FailureMessage":function(d){return "הקפידו למקם ריצוף אם יש לבה מלפנים. פעולה זו תאפשר לכם לחצוב בבטחה שורה זו של משאבים."},
"level12FailureMessage":function(d){return "הקפידו על חציבת 3 בלוקי רדסטון. פעולה זו משלבת את מה שלמדתם מבניית הבית שלכם ושימוש במשפטי \"אם\" כדי להימנע מנפילה לתוך הלבה."},
"level13FailureMessage":function(d){return "מקם מסילה לאורך שביל עפר המוביל מהדלת שלך עד לקצה המפה."},
"level1FailureMessage":function(d){return "עליך להשתמש בפקודות כדי להגיע אל הכבשים."},
"level1TooFewBlocksMessage":function(d){return "נסו להשתמש בפקודות נוספות על מנת להוליך אתןהכבשים."},
"level2FailureMessage":function(d){return "על מנת לכרות עץ, עליכם ללכת עד שתגיעו אל הגזע שלו, ולהשתמש בפקודה \"להשמיד את הבלוק\"."},
"level2TooFewBlocksMessage":function(d){return "נסו להשתמש בפקודות נוספות על מנת לכרות את העץ. לכו אל גזעו והשתמשו בפקודה \"להשמיד את הבלוק\"."},
"level3FailureMessage":function(d){return "כדי לאסוף צמר של כבשה, עליכם ללכת לכל כבשה ולהשתמש בפקודה \"גזירה\". זכרו להשתמש בפקודות פנייה כדי להגיע אל הכבשים."},
"level3TooFewBlocksMessage":function(d){return "נסה להשתמש בפקודות נוספות על מנת לאסוף צמר של כבשה. לכו לכל כבשה והשתמשו בפקודה \"גזירה\"."},
"level4FailureMessage":function(d){return "עליכם להשתמש בפקודה \"השמד בלוק\" על כל אחד משלושת הגזעים."},
"level5FailureMessage":function(d){return "מקמו בלוקים על קווי העפר על מנת לבנות קיר. הפקודה בצבע ורוד \"חזור\" תפעיל פקודות הממוקמות בתוכה, כמו \"מקם אבן\" ו-\"להתקדם\"."},
"level6FailureMessage":function(d){return "מקמו בלוקים על קווי העפר של הבית כדי להשלים את הפאזל."},
"level7FailureMessage":function(d){return "השתמשו בפקודה \"שתול\" על מנת למקם יבולים על כל חלקת אדמה כהה."},
"level8FailureMessage":function(d){return "אם תגעו במטפס הוא יתפוצץ. עליכם להתגנב מסביב, ולהיכנס לבית שלכם."},
"level9FailureMessage":function(d){return "אל תשכחו להציב לפחות 2 לפידים כדי להאיר את דרככם ולכרות לפחות 2 בלוקי פחם."},
"minecraftBlock":function(d){return "בלוק"},
"nextLevelMsg":function(d){return "פאזל "+craft_locale.v(d,"puzzleNumber")+" הושלם. מזל טוב!"},
"playerSelectChooseCharacter":function(d){return "בחר דמות."},
"playerSelectChooseSelectButton":function(d){return "בחר"},
"playerSelectLetsGetStarted":function(d){return "בואו נתחיל."},
"reinfFeedbackMsg":function(d){return "באפשרותך להקיש \"להמשיך לשחק\" על מנת לחזור לשחק את המשחק."},
"replayButton":function(d){return "שחקו שוב"},
"selectChooseButton":function(d){return "בחר"},
"tooManyBlocksFail":function(d){return "פאזל "+craft_locale.v(d,"puzzleNumber")+" הושלם. מזל טוב! אפשר גם להשלים את זה עם "+craft_locale.p(d,"numBlocks",0,"he",{"one":"1 block","other":craft_locale.n(d,"numBlocks")+" blocks"})+"."}};