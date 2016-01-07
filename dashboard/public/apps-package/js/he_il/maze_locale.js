var maze_locale = {lc:{"ar":function(n){
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
v:function(d,k){maze_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){maze_locale.c(d,k);return d[k] in p?p[d[k]]:(k=maze_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){maze_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).maze_locale = {
"atHoneycomb":function(d){return "בחלת דבש"},
"atFlower":function(d){return "בפרח"},
"avoidCowAndRemove":function(d){return "המנע מהפרה ומחק 1"},
"continue":function(d){return "המשך"},
"dig":function(d){return "הסר 1"},
"digTooltip":function(d){return "הסר 1 יחידה של עפר"},
"dirE":function(d){return "E"},
"dirN":function(d){return "N"},
"dirS":function(d){return "S"},
"dirW":function(d){return "W"},
"doCode":function(d){return "בצע"},
"elseCode":function(d){return "אחרת"},
"fill":function(d){return "מלא 1"},
"fillN":function(d){return "מלא "+maze_locale.v(d,"shovelfuls")},
"fillStack":function(d){return "מלא ערמה של "+maze_locale.v(d,"shovelfuls")+" בורות"},
"fillSquare":function(d){return "מלא את הריבוע"},
"fillTooltip":function(d){return "שים יחידה אחת של עפר"},
"finalLevel":function(d){return "כל הכבוד! פתרת את החידה האחרונה."},
"flowerEmptyError":function(d){return "אין יותר צוף על הפרח שאתה נמצא עליו."},
"get":function(d){return "קבל"},
"heightParameter":function(d){return "גובה"},
"holePresent":function(d){return "יש חור"},
"honey":function(d){return "להכין דבש"},
"honeyAvailable":function(d){return "דבש"},
"honeyTooltip":function(d){return "להכין דבש מצוף"},
"honeycombFullError":function(d){return "בחלת הדבש הזו אין מקום יותר לדבש נוסף."},
"ifCode":function(d){return "אם"},
"ifInRepeatError":function(d){return "אתה צריך בלוק \"אם\" בתוך בלוק \"חזור שוב\". אם אתה מתקשה, נסה את השלב הקודם שוב כדי לראות איך זה עבד."},
"ifPathAhead":function(d){return "אם קיימת דרך לפניך"},
"ifTooltip":function(d){return "אם יש דרך בכיוון שנבחר, בצע מספר פעולות."},
"ifelseTooltip":function(d){return "אם יש דרך בכיוון שנבחר, אז בצע את המקבץ הראשון של פעולות. אחרת, בצע את המקבץ השני של פעולות."},
"ifFlowerTooltip":function(d){return "אם יש פרח/כוורת בכיוון שנבחר,  בצע פעולות מסוימות."},
"ifOnlyFlowerTooltip":function(d){return "אם יש פרח בכיוון המסויים, אז תעשה כמה פעולות."},
"ifelseFlowerTooltip":function(d){return "אם יש פרח/כוורת בכיוון שנבחר, בצע את הבלוק הראשון של הפעולות. אחרת, בצע את הבלוק השני של פעולות."},
"insufficientHoney":function(d){return "אתה משתמש בכל הבלוקים הנכונים, אבל אתה צריך לייצר את הכמות הנכונה של דבש."},
"insufficientNectar":function(d){return "אתה משתמש בכל הבלוקים הנכונים, אבל אתה צריך לאסוף את הכמות הנכונה של צוף."},
"make":function(d){return "תעשה"},
"moveBackward":function(d){return "זוז אחורה"},
"moveEastTooltip":function(d){return "תזיז אותי משבצת אחת מזרחה."},
"moveForward":function(d){return "לזוז קדימה"},
"moveForwardTooltip":function(d){return "הזז אותי צעד אחד קדימה."},
"moveNorthTooltip":function(d){return "תזיז אותי משבצת אחת צפונה."},
"moveSouthTooltip":function(d){return "תזיז אותי משבצת אחת דרומה."},
"moveTooltip":function(d){return "תזיז אותי מקום אחד קדימה/אחורה"},
"moveWestTooltip":function(d){return "תזיז אותי משבצת אחת מערבה."},
"nectar":function(d){return "תשיג צוף"},
"nectarRemaining":function(d){return "צוף"},
"nectarTooltip":function(d){return "תשיג צוף מפרח"},
"nextLevel":function(d){return "כל הכבוד! השלמת את החידה הזה."},
"no":function(d){return "לא"},
"noPathAhead":function(d){return "הדרך חסומה"},
"noPathLeft":function(d){return "אין דרך שמאלה"},
"noPathRight":function(d){return "אין דרך ימינה"},
"notAtFlowerError":function(d){return "אתה יכול לקבל צוף רק מפרח."},
"notAtHoneycombError":function(d){return "אתה יכול לעשות דבש רק בחלת הדבש."},
"numBlocksNeeded":function(d){return "ניתן לפתור את החידה עם %1 של אבני בנייה."},
"pathAhead":function(d){return "דרך לפניך"},
"pathLeft":function(d){return "אם ישנה דרך לצד שמאל"},
"pathRight":function(d){return "אם ישנה דרך לצד ימין"},
"pilePresent":function(d){return "ישנה ערימה"},
"putdownTower":function(d){return "תוריד מגדל למטה"},
"removeAndAvoidTheCow":function(d){return "מחק 1 והימנע מהפרה"},
"removeN":function(d){return "הסר "+maze_locale.v(d,"shovelfuls")+" דליים"},
"removePile":function(d){return "הסר ערימה"},
"removeStack":function(d){return "הסר ערמה של "+maze_locale.v(d,"shovelfuls")+" ערימות עפר"},
"removeSquare":function(d){return "הסר ריבוע"},
"repeatCarefullyError":function(d){return "כדי לפתור זאת, חשוב היטב על התבנית של שתי תזוזות וסיבוב אחד שייכנסו לבלוק \"חזר שוב\". זה בסדר שיש לך פנייה נוספת בסוף."},
"repeatUntil":function(d){return "חזור עד אשר"},
"repeatUntilBlocked":function(d){return "כל עוד יש דרך מקדימה"},
"repeatUntilFinish":function(d){return "חזור עד לסיום"},
"step":function(d){return "צעד"},
"totalHoney":function(d){return "סה\"כ דבש"},
"totalNectar":function(d){return "סה\"כ צוף"},
"turnLeft":function(d){return "פנה שמאלה"},
"turnRight":function(d){return "פנה ימינה"},
"turnTooltip":function(d){return "מסובב אותי שמאלה או ימינה ב- 90 מעלות."},
"uncheckedCloudError":function(d){return "הקפד לבדוק את כל העננים כדי לראות אם יש פרחים או חלות דבש."},
"uncheckedPurpleError":function(d){return "הקפד לבדוק את כל הפרחים הסגולים כדי לראות אם יש להם צוף"},
"whileMsg":function(d){return "כאשר"},
"whileTooltip":function(d){return "חזור על שורת הפעולות עד שתגיע לנקודת הסיום."},
"word":function(d){return "מצא את המילה"},
"yes":function(d){return "כן"},
"youSpelled":function(d){return "אייתת"}};