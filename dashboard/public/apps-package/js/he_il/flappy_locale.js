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
v:function(d,k){flappy_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){flappy_locale.c(d,k);return d[k] in p?p[d[k]]:(k=flappy_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){flappy_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).flappy_locale = {
"continue":function(d){return "המשך"},
"doCode":function(d){return "בצע"},
"elseCode":function(d){return "אחרת"},
"endGame":function(d){return "סוף המשחק"},
"endGameTooltip":function(d){return "מסיים את המשחק."},
"finalLevel":function(d){return "מזל טוב! השלמת את הפאזל האחרון."},
"flap":function(d){return "נופף"},
"flapRandom":function(d){return "נופף כמות אקראית"},
"flapVerySmall":function(d){return "נופף מעט מאוד"},
"flapSmall":function(d){return "נופף מעט"},
"flapNormal":function(d){return "נופף במידה הרגילה"},
"flapLarge":function(d){return "נופף הרבה"},
"flapVeryLarge":function(d){return "נופף הרבה מאוד"},
"flapTooltip":function(d){return "לעופך את פלאפי למעלה."},
"flappySpecificFail":function(d){return "הקוד שלך נראה טוב -. זה יעוף עם כל לחיצה. אבל אתה צריך ללחוץ הרבה פעמים כדי לנופף אל המטרה."},
"incrementPlayerScore":function(d){return "זכה בנקודה"},
"incrementPlayerScoreTooltip":function(d){return "הוסף אחד לניקוד הנוכחי של השחקן."},
"nextLevel":function(d){return "מזל טוב! השלמת את הפאזל הזה."},
"no":function(d){return "לא"},
"numBlocksNeeded":function(d){return "ניתן לפתור את הפאזל עם %1 בלוק."},
"playSoundRandom":function(d){return "תשמיע צליל אקראי"},
"playSoundBounce":function(d){return "נגן צליל הקפצת כדור"},
"playSoundCrunch":function(d){return "תשמיע צליל מעיכה"},
"playSoundDie":function(d){return "תשמיע צליל עצוב"},
"playSoundHit":function(d){return "תשמיע צליל רסיקה"},
"playSoundPoint":function(d){return "תשמיע צליל נקודת משחק"},
"playSoundSwoosh":function(d){return "תשמיע צליל \"סווש\""},
"playSoundWing":function(d){return "תשמיע צליל עוף עף"},
"playSoundJet":function(d){return "תשמיע צליל מטוס"},
"playSoundCrash":function(d){return "תשמיע צליל התרסקות"},
"playSoundJingle":function(d){return "תשמיע ג'ינגל צליל"},
"playSoundSplash":function(d){return "תשמיע קול חבטה במים"},
"playSoundLaser":function(d){return "השמע צליל לייזר"},
"playSoundTooltip":function(d){return "נגן את הצליל שנבחר."},
"reinfFeedbackMsg":function(d){return "באפשרותך להקיש על לחצן 'נסה שוב' כדי לחזור ולשחק את המשחק שלך."},
"scoreText":function(d){return "ציון: "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "הגדר זירה"},
"setBackgroundRandom":function(d){return "תגדיר זירה אקראי"},
"setBackgroundFlappy":function(d){return "הגדר זירת עיר (יום)"},
"setBackgroundNight":function(d){return "תגדיר זירת עיר (לילה)"},
"setBackgroundSciFi":function(d){return "הגדרת זירת Sci-Fi"},
"setBackgroundUnderwater":function(d){return "הגדר זירה מתחת למים"},
"setBackgroundCave":function(d){return "הגדר זירת מערה"},
"setBackgroundSanta":function(d){return "הגדר זירה סנטה"},
"setBackgroundTooltip":function(d){return "קובע את תמונת הרקע"},
"setGapRandom":function(d){return "הגדר רווח אקראי"},
"setGapVerySmall":function(d){return "הגדר רווח קטן מאוד"},
"setGapSmall":function(d){return "הגדר רווח קטן"},
"setGapNormal":function(d){return "הגדר רווח נורמלי"},
"setGapLarge":function(d){return "הגדר רווח גדול"},
"setGapVeryLarge":function(d){return "הגדר רווח גדול מאוד"},
"setGapHeightTooltip":function(d){return "הגדר רווח אנכי בתוך מכשול"},
"setGravityRandom":function(d){return "הגדר כובד אקראי"},
"setGravityVeryLow":function(d){return "הגדר כובד נמוך מאוד"},
"setGravityLow":function(d){return "הגדר כובד נמוך"},
"setGravityNormal":function(d){return "הגדר כובד נורמלי"},
"setGravityHigh":function(d){return "הגדר כובד גבוהה"},
"setGravityVeryHigh":function(d){return "הגדר כובד גבוהה מאוד"},
"setGravityTooltip":function(d){return "הגדר את הרמה של הכובד"},
"setGround":function(d){return "הגדר קרקע"},
"setGroundRandom":function(d){return "הגדר קרקע באקראי"},
"setGroundFlappy":function(d){return "הגדר קרקע קרקע"},
"setGroundSciFi":function(d){return "set ground Sci-Fi"},
"setGroundUnderwater":function(d){return "set ground Underwater"},
"setGroundCave":function(d){return "set ground Cave"},
"setGroundSanta":function(d){return "set ground Santa"},
"setGroundLava":function(d){return "set ground Lava"},
"setGroundTooltip":function(d){return "Sets the ground image"},
"setObstacle":function(d){return "הגדר מכשול"},
"setObstacleRandom":function(d){return "הגדר מכשול אקראי"},
"setObstacleFlappy":function(d){return "הגדר מכשול צינור"},
"setObstacleSciFi":function(d){return "set obstacle Sci-Fi"},
"setObstacleUnderwater":function(d){return "set obstacle Plant"},
"setObstacleCave":function(d){return "set obstacle Cave"},
"setObstacleSanta":function(d){return "set obstacle Chimney"},
"setObstacleLaser":function(d){return "set obstacle Laser"},
"setObstacleTooltip":function(d){return "Sets the obstacle image"},
"setPlayer":function(d){return "set player"},
"setPlayerRandom":function(d){return "set player Random"},
"setPlayerFlappy":function(d){return "הגדר נגן ציפור צהובה"},
"setPlayerRedBird":function(d){return "set player Red Bird"},
"setPlayerSciFi":function(d){return "set player Spaceship"},
"setPlayerUnderwater":function(d){return "set player Fish"},
"setPlayerCave":function(d){return "set player Bat"},
"setPlayerSanta":function(d){return "set player Santa"},
"setPlayerShark":function(d){return "set player Shark"},
"setPlayerEaster":function(d){return "set player Easter Bunny"},
"setPlayerBatman":function(d){return "set player Bat guy"},
"setPlayerSubmarine":function(d){return "set player Submarine"},
"setPlayerUnicorn":function(d){return "set player Unicorn"},
"setPlayerFairy":function(d){return "set player Fairy"},
"setPlayerSuperman":function(d){return "הגדר נגן Flappyman"},
"setPlayerTurkey":function(d){return "set player Turkey"},
"setPlayerTooltip":function(d){return "Sets the player image"},
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
"soundSplash":function(d){return "שכשוך"},
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
"whenEnterObstacleTooltip":function(d){return "בצע את הפעולות הבאות כאשר פלאפי נכנס במכשול."},
"whenRunButtonClick":function(d){return "כאשר המשחק מתחיל"},
"whenRunButtonClickTooltip":function(d){return "בצע את הפעולות להלן כאשר המשחק מתחיל."},
"yes":function(d){return "כן"}};