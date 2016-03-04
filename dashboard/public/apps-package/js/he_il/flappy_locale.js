var flappy_locale = {lc:{"ar":function(n){
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
v:function(d,k){flappy_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){flappy_locale.c(d,k);return d[k] in p?p[d[k]]:(k=flappy_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){flappy_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).flappy_locale = {
"continue":function(d){return "המשך"},
"doCode":function(d){return "בצע"},
"elseCode":function(d){return "אחרת"},
"endGame":function(d){return "סיים המשחק"},
"endGameTooltip":function(d){return "מסיים את המשחק."},
"finalLevel":function(d){return "מזל טוב! השלמת את הפאזל האחרון."},
"flap":function(d){return "נופף"},
"flapRandom":function(d){return "נופף כמות אקראית"},
"flapVerySmall":function(d){return "נופף מעט מאוד"},
"flapSmall":function(d){return "נופף מעט"},
"flapNormal":function(d){return "נופף במידה הרגילה"},
"flapLarge":function(d){return "נופף הרבה"},
"flapVeryLarge":function(d){return "נופף הרבה מאוד"},
"flapTooltip":function(d){return "הטס פלאפי למעלה."},
"flappySpecificFail":function(d){return "הקוד שלך נראה טוב -. זה יעוף עם כל לחיצה. אבל אתה צריך ללחוץ הרבה פעמים כדי לנופף אל המטרה."},
"incrementPlayerScore":function(d){return "זכה בנקודה"},
"incrementPlayerScoreTooltip":function(d){return "הוסף אחד לניקוד הנוכחי של השחקן."},
"nextLevel":function(d){return "מזל טוב! השלמת את הפאזל הזה."},
"no":function(d){return "לא"},
"numBlocksNeeded":function(d){return "ניתן לפתור את הפאזל עם %1 בלוק."},
"playSoundRandom":function(d){return "השמע צליל אקראי"},
"playSoundBounce":function(d){return "נגן צליל הקפצת כדור"},
"playSoundCrunch":function(d){return "תשמיע צליל מעיכה"},
"playSoundDie":function(d){return "השמע צליל עצוב"},
"playSoundHit":function(d){return "השמע צליל רסיקה"},
"playSoundPoint":function(d){return "השמע צליל נקודה"},
"playSoundSwoosh":function(d){return "השמע צליל \"סווש\""},
"playSoundWing":function(d){return "השמע צליל נפנוף"},
"playSoundJet":function(d){return "השמע צליל מטוס"},
"playSoundCrash":function(d){return "השמע צליל ריסוק"},
"playSoundJingle":function(d){return "השמע צליל ג'ינגל"},
"playSoundSplash":function(d){return "תשמיע קול חבטה במים"},
"playSoundLaser":function(d){return "השמע צליל לייזר"},
"playSoundTooltip":function(d){return "נגן את הצליל שנבחר."},
"reinfFeedbackMsg":function(d){return "באפשרותך להקיש על לחצן 'נסה שוב' כדי לחזור ולשחק את המשחק שלך."},
"scoreText":function(d){return "ניקוד: "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "קבע רקע"},
"setBackgroundRandom":function(d){return "קבע רקע אקראית"},
"setBackgroundFlappy":function(d){return "קבע רקע עיר (יום)"},
"setBackgroundNight":function(d){return "קבע רקע עיר (לילה)"},
"setBackgroundSciFi":function(d){return "קבע רקע מדע בדיוני"},
"setBackgroundUnderwater":function(d){return "קבע רקע תת מימי"},
"setBackgroundCave":function(d){return "קבע רקע מערה"},
"setBackgroundSanta":function(d){return "קבע רקע סנטה"},
"setBackgroundTooltip":function(d){return "קובע את תמונת הרקע"},
"setGapRandom":function(d){return "קבע מרווח אקראית"},
"setGapVerySmall":function(d){return "קבע מרווח קטן מאוד"},
"setGapSmall":function(d){return "קבע מרווח קטן"},
"setGapNormal":function(d){return "קבע מרווח רגיל"},
"setGapLarge":function(d){return "קבע מרווח גדול"},
"setGapVeryLarge":function(d){return "קבע מרווח גדול מאוד"},
"setGapHeightTooltip":function(d){return "קובע את גודל המרווח האנכי בתוך מכשול"},
"setGravityRandom":function(d){return "קבע כח-כבידה אקראית"},
"setGravityVeryLow":function(d){return "קבע כח-כבידה חלש מאוד"},
"setGravityLow":function(d){return "קבע כח-כבידה חלש"},
"setGravityNormal":function(d){return "קבע כח-כבידה רגיל"},
"setGravityHigh":function(d){return "קבע כח-כבידה חזק"},
"setGravityVeryHigh":function(d){return "קבע כח-כבידה חזק מאוד"},
"setGravityTooltip":function(d){return "קובע את חוזק כוח הכבידה"},
"setGround":function(d){return "קבע קרקע"},
"setGroundRandom":function(d){return "קבע קרקע אקראית"},
"setGroundFlappy":function(d){return "קבע קרקע \"אדמה\""},
"setGroundSciFi":function(d){return "קבע קרקע \"בדיוני\""},
"setGroundUnderwater":function(d){return "קבע קרקע \"מצולות\""},
"setGroundCave":function(d){return "קבע קרקע \"מערה\""},
"setGroundSanta":function(d){return "קבע קרקע \"סנטה\""},
"setGroundLava":function(d){return "קבע קרקע \"לבה\""},
"setGroundTooltip":function(d){return "קובע את תמונת הקרקע"},
"setObstacle":function(d){return "קבע מכשול"},
"setObstacleRandom":function(d){return "קבע מכשול אקראית"},
"setObstacleFlappy":function(d){return "קבע מכשול \"צינור\""},
"setObstacleSciFi":function(d){return "קבע מכשול \"בדיוני\""},
"setObstacleUnderwater":function(d){return "קבע מכשול \"צמח\""},
"setObstacleCave":function(d){return "קבע מכשול \"מערה\""},
"setObstacleSanta":function(d){return "קבע מכשול \"ארובה\""},
"setObstacleLaser":function(d){return "קבע מכשול \"לייזר\""},
"setObstacleTooltip":function(d){return "קובע את התמונת המכשול"},
"setPlayer":function(d){return "קבע שחקן"},
"setPlayerRandom":function(d){return "קבע שחקן אקראית"},
"setPlayerFlappy":function(d){return "קבע שחקן \"ציפור צהובה\""},
"setPlayerRedBird":function(d){return "קבע שחקן \"ציפור אדומה\""},
"setPlayerSciFi":function(d){return "קבע שחקן \"חללית\""},
"setPlayerUnderwater":function(d){return "קבע שחקן \"דג\""},
"setPlayerCave":function(d){return "קבע שחקן \"עטלף\""},
"setPlayerSanta":function(d){return "קבע שחקן \"סנטה\""},
"setPlayerShark":function(d){return "קבע שחקן \"כריש\""},
"setPlayerEaster":function(d){return "קבע שחקן \"ארנב פסחא\""},
"setPlayerBatman":function(d){return "קבע שחקן \"איש העטלף\""},
"setPlayerSubmarine":function(d){return "קבע שחקן \"צוללת\""},
"setPlayerUnicorn":function(d){return "קבע שחקן \"חד-קרן\""},
"setPlayerFairy":function(d){return "קבע שחקן \"פיה\""},
"setPlayerSuperman":function(d){return "הגדר נגן Flappyman"},
"setPlayerTurkey":function(d){return "קבע שחקן \"תרניגול הודו\""},
"setPlayerTooltip":function(d){return "קובע את תמונת השחקן"},
"setScore":function(d){return "הגדר ניקוד"},
"setScoreTooltip":function(d){return "מגדיר את ניקוד השחקן"},
"setSpeed":function(d){return "הגדר מהירות"},
"setSpeedTooltip":function(d){return "מגדיר את מהירות השלב"},
"shareFlappyTwitter":function(d){return "תראו את משחק התעופה שהכנתי. כתבתי אותו בעצמי ב@code.org"},
"shareGame":function(d){return "שתף את המשחק שלך:"},
"soundRandom":function(d){return "אקראי"},
"soundBounce":function(d){return "הקפצה"},
"soundCrunch":function(d){return "מעיכה"},
"soundDie":function(d){return "עצוב"},
"soundHit":function(d){return "התנפצות"},
"soundPoint":function(d){return "נקודה"},
"soundSwoosh":function(d){return "\"סווש\""},
"soundWing":function(d){return "כנף"},
"soundJet":function(d){return "מטוס"},
"soundCrash":function(d){return "התרסקות"},
"soundJingle":function(d){return "מנגינה"},
"soundSplash":function(d){return "שפריץ"},
"soundLaser":function(d){return "לייזר"},
"speedRandom":function(d){return "קבע מהירות אקראית"},
"speedVerySlow":function(d){return "הגדר מהירות איטית מאד"},
"speedSlow":function(d){return "הגדר מהירות איטית"},
"speedNormal":function(d){return "הגדר מהירות רגילה"},
"speedFast":function(d){return "הגדר מהירות מהירה"},
"speedVeryFast":function(d){return "הגדר מהירות מהירה מאד"},
"whenClick":function(d){return "בזמן קליק"},
"whenClickTooltip":function(d){return "בצע את הפעולות להלן באירוע קליק."},
"whenCollideGround":function(d){return "כאשר פוגע באדמה"},
"whenCollideGroundTooltip":function(d){return "בצע את הפעולות הבאות כאשר פלאפי פוגע בקרקע."},
"whenCollideObstacle":function(d){return "כאשר פוגע במכשול"},
"whenCollideObstacleTooltip":function(d){return "בצע את הפעולות הבאות כאשר פלאפי פוגע במכשול."},
"whenEnterObstacle":function(d){return "כאשר עובר מכשול"},
"whenEnterObstacleTooltip":function(d){return "בצע את הפעולות הבאות כאשר פלאפי פוגע במכשול."},
"whenRunButtonClick":function(d){return "כאשר המשחק מתחיל"},
"whenRunButtonClickTooltip":function(d){return "בצע את הפעולות להלן כאשר המשחק מתחיל."},
"yes":function(d){return "כן"}};