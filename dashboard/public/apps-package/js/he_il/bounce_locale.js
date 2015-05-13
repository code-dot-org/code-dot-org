var bounce_locale = {lc:{"ar":function(n){
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
v:function(d,k){bounce_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){bounce_locale.c(d,k);return d[k] in p?p[d[k]]:(k=bounce_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){bounce_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).bounce_locale = {
"bounceBall":function(d){return "הקפץ כדור"},
"bounceBallTooltip":function(d){return "הקפץ כדור על אובייקט."},
"continue":function(d){return "המשך"},
"dirE":function(d){return "מז"},
"dirN":function(d){return "צ"},
"dirS":function(d){return "ד"},
"dirW":function(d){return "מע"},
"doCode":function(d){return "בצע"},
"elseCode":function(d){return "אחרת"},
"finalLevel":function(d){return "מזל טוב! פתרת את החידה האחרונה."},
"heightParameter":function(d){return "גובה"},
"ifCode":function(d){return "אם"},
"ifPathAhead":function(d){return "אם יש דרך מקדימה"},
"ifTooltip":function(d){return "אם ישנה דרך בכיוון הנתון, אז תעשה פעולות כלשהן."},
"ifelseTooltip":function(d){return "אם ישנה דרך בכיוון הנתון, אז בצע את הבלוק הראשון של הפעולות. אחרת, בצע את הבלוק השני של הפעולות."},
"incrementOpponentScore":function(d){return "נקודת דרוג יריב"},
"incrementOpponentScoreTooltip":function(d){return "הוסף אחד לניקוד הנוכחי של היריב."},
"incrementPlayerScore":function(d){return "נקודת דרוג"},
"incrementPlayerScoreTooltip":function(d){return "הוסף אחד לניקוד הנוכחי של השחקן."},
"isWall":function(d){return "האם זה קיר?"},
"isWallTooltip":function(d){return "מחזיר נכון אם יש כאן קיר"},
"launchBall":function(d){return "שגר כדור חדש"},
"launchBallTooltip":function(d){return "שגר כדור למשחק."},
"makeYourOwn":function(d){return "צור משחק קופצני משלך"},
"moveDown":function(d){return "הזז למטה"},
"moveDownTooltip":function(d){return "העבר את המשוט למטה."},
"moveForward":function(d){return "לזוז קדימה"},
"moveForwardTooltip":function(d){return "העבר אותיי מקום אחד קדימה."},
"moveLeft":function(d){return "זוז שמאלה"},
"moveLeftTooltip":function(d){return "הזז את המשוט לשמאל."},
"moveRight":function(d){return "זוז ימינה"},
"moveRightTooltip":function(d){return "הזז את המשוט לימין."},
"moveUp":function(d){return "זוז למעלה"},
"moveUpTooltip":function(d){return "הזז את המשוט למעלה."},
"nextLevel":function(d){return "מזל טוב! השלמת את החידה הזו."},
"no":function(d){return "לא"},
"noPathAhead":function(d){return "הדרך חסומה"},
"noPathLeft":function(d){return "אין דרך לצד שמאל"},
"noPathRight":function(d){return "אין דרך לצד ימין"},
"numBlocksNeeded":function(d){return "ניתן לפתור את הפאזל עם %1 בלוקים."},
"pathAhead":function(d){return "דרך לפניך"},
"pathLeft":function(d){return "אם ישנה דרך לצד שמאל"},
"pathRight":function(d){return "אם ישנה דרך לצד ימין"},
"pilePresent":function(d){return "ישנה ערימה"},
"playSoundCrunch":function(d){return "תשמיע צליל מעיכה"},
"playSoundGoal1":function(d){return "השמע צליל מטרה 1"},
"playSoundGoal2":function(d){return "השמע צליל מטרה 2"},
"playSoundHit":function(d){return "השמע צליל פגיעה"},
"playSoundLosePoint":function(d){return "השמע צליל איבוד נקודה"},
"playSoundLosePoint2":function(d){return "השמע צליל איבוד נקודה 2"},
"playSoundRetro":function(d){return "השמע צליל רטרו"},
"playSoundRubber":function(d){return "השמע צליל גומי"},
"playSoundSlap":function(d){return "השמע צליל חבטה"},
"playSoundTooltip":function(d){return "נגן את הצליל שנבחר."},
"playSoundWinPoint":function(d){return "השמע צליל נקודת ניצחון"},
"playSoundWinPoint2":function(d){return "השמע צליל נקודת ניצחון 2"},
"playSoundWood":function(d){return "השמע צליל עץ"},
"putdownTower":function(d){return "תוריד מגדל למטה"},
"reinfFeedbackMsg":function(d){return "באפשרותך להקיש על לחצן 'נסה שוב' כדי לחזור ולשחק את המשחק שלך."},
"removeSquare":function(d){return "הסר ריבוע"},
"repeatUntil":function(d){return "חזור עד אשר"},
"repeatUntilBlocked":function(d){return "כאשר דרך מקדימה"},
"repeatUntilFinish":function(d){return "חזור עד סיום"},
"scoreText":function(d){return "ניקוד: "+bounce_locale.v(d,"playerScore")+":"+bounce_locale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "הגדר זירה אקראית"},
"setBackgroundHardcourt":function(d){return "הפעל סצנת מגרש"},
"setBackgroundRetro":function(d){return "הפעל סצנת רטרו"},
"setBackgroundTooltip":function(d){return "קובע את תמונת הרקע"},
"setBallRandom":function(d){return "ערוך כדור אקראי"},
"setBallHardcourt":function(d){return "קובע כדור מגרש"},
"setBallRetro":function(d){return "קובע כדור רטרו"},
"setBallTooltip":function(d){return "מגדיר את תמונת הכדור"},
"setBallSpeedRandom":function(d){return "קובע את מהירות הכדור כאקראית"},
"setBallSpeedVerySlow":function(d){return "קובע מהירות איטית מאוד של כדור"},
"setBallSpeedSlow":function(d){return "קובע מהירות איטית של כדור"},
"setBallSpeedNormal":function(d){return "קובע מהירות רגילה של כדור"},
"setBallSpeedFast":function(d){return "קובע מהירות גבוהה של כדור"},
"setBallSpeedVeryFast":function(d){return "קובע מהירות מאוד גבוהה של כדור"},
"setBallSpeedTooltip":function(d){return "קובע את מהירות הכדור"},
"setPaddleRandom":function(d){return "קבע מטקה אקראית"},
"setPaddleHardcourt":function(d){return "קבע מטקת מגרש"},
"setPaddleRetro":function(d){return "קבע פדל רטרו"},
"setPaddleTooltip":function(d){return "קובע תמונת מטקה"},
"setPaddleSpeedRandom":function(d){return "קבע מהירות אקראית של פדל"},
"setPaddleSpeedVerySlow":function(d){return "קבע מהירות איטית מאוד של פדל"},
"setPaddleSpeedSlow":function(d){return "קבע מהירות איטית של פדל"},
"setPaddleSpeedNormal":function(d){return "קבע מהירות פדל נורמלית"},
"setPaddleSpeedFast":function(d){return "קבע מהירות מהירה של פדל"},
"setPaddleSpeedVeryFast":function(d){return "קבע מהירות מאוד גבוהה של פדל"},
"setPaddleSpeedTooltip":function(d){return "קובע את מהירות הפדל"},
"shareBounceTwitter":function(d){return "תראה את משחק הקפיצה שהכנתי. כתבתי אותן בעצמי ב @code.org"},
"shareGame":function(d){return "שתף את המשחק שלך:"},
"turnLeft":function(d){return "פנה שמאלה"},
"turnRight":function(d){return "פנה ימינה"},
"turnTooltip":function(d){return "מסובב אותי שמאלה או ימינה ב- 90 מעלות."},
"whenBallInGoal":function(d){return "כאשר הכדור בתוך השער"},
"whenBallInGoalTooltip":function(d){return "הרץ את הפעולות שלמטה כשהכדור נכנס לשער."},
"whenBallMissesPaddle":function(d){return "כאשר הכדור מפספס את המשוט"},
"whenBallMissesPaddleTooltip":function(d){return "הרץ את הפעולות שלמטה כשהכדור מפספס את המשוט."},
"whenDown":function(d){return "כאשר חץ למטה"},
"whenDownTooltip":function(d){return "בצע את הפעולות להלן כאשר נלחץ על המקש חץ למטה."},
"whenGameStarts":function(d){return "כאשר המשחק מתחיל"},
"whenGameStartsTooltip":function(d){return "בצע את הפעולות להלן כאשר המשחק מתחיל."},
"whenLeft":function(d){return "כאשר חץ שמאלה"},
"whenLeftTooltip":function(d){return "בצע את הפעולות להלן כאשר נלחץ על מקש חץ שמאלה."},
"whenPaddleCollided":function(d){return "כאשר הכדור פוגע במשוט"},
"whenPaddleCollidedTooltip":function(d){return "בצע את הפעולות להלן כאשר כדור מתנגש עם משוט."},
"whenRight":function(d){return "כאשר חץ ימינה"},
"whenRightTooltip":function(d){return "בצע את הפעולות להלן כאשר נלחץ על המקש חץ ימינה."},
"whenUp":function(d){return "כאשר חץ למעלה"},
"whenUpTooltip":function(d){return "בצע את הפעולות להלן כאשר נלחץ המקש חץ למעלה."},
"whenWallCollided":function(d){return "כאשר הכדור פוגע בקיר"},
"whenWallCollidedTooltip":function(d){return "בצע את הפעולות להלן כאשר הכדור מתנגש עם הקיר."},
"whileMsg":function(d){return "כאשר"},
"whileTooltip":function(d){return "חזור על הפעולות עד שנקודת הסיום הושגה."},
"yes":function(d){return "כן"}};