var locale = {lc:{"ar":function(n){
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
},"da":function(n){return n===1?"one":"other"},"de":function(n){return n===1?"one":"other"},"el":function(n){return n===1?"one":"other"},"es":function(n){return n===1?"one":"other"},"et":function(n){return n===1?"one":"other"},"eu":function(n){return n===1?"one":"other"},"fa":function(n){return "other"},"fi":function(n){return n===1?"one":"other"},"fil":function(n){return n===0||n==1?"one":"other"},"fr":function(n){return Math.floor(n)===0||Math.floor(n)==1?"one":"other"},"he":function(n){return n===1?"one":"other"},"hi":function(n){return n===0||n==1?"one":"other"},"hr":function(n){
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
v:function(d,k){locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){locale.c(d,k);return d[k] in p?p[d[k]]:(k=locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).locale = {
"and":function(d){return "ו"},
"booleanTrue":function(d){return "נכון"},
"booleanFalse":function(d){return "שגוי"},
"blocklyMessage":function(d){return "בלוקלי"},
"catActions":function(d){return "פעולות"},
"catColour":function(d){return "צבע"},
"catLogic":function(d){return "הגיון"},
"catLists":function(d){return "רשימות"},
"catLoops":function(d){return "לולאות"},
"catMath":function(d){return "מתמטיקה"},
"catProcedures":function(d){return "פונקציות"},
"catText":function(d){return "טקסט"},
"catVariables":function(d){return "משתנים"},
"codeTooltip":function(d){return "ראה קוד JavaScript שנוצר."},
"continue":function(d){return "המשך"},
"dialogCancel":function(d){return "בטל"},
"dialogOK":function(d){return "אישור"},
"directionNorthLetter":function(d){return "צ"},
"directionSouthLetter":function(d){return "ד"},
"directionEastLetter":function(d){return "מז"},
"directionWestLetter":function(d){return "מע"},
"end":function(d){return "סוף"},
"emptyBlocksErrorMsg":function(d){return "בלוקי ה\"חזור שוב\" או ה\"אם\" צריכים בלוקים אחרים בתוכם כדי לעבוד. וודא כי הבלוק הפנימי מתאים בבלוק החיצוני."},
"emptyFunctionBlocksErrorMsg":function(d){return "פונקציית הבלוק דורשת בלוקים אחרים בתוכה כדי לעבוד."},
"errorEmptyFunctionBlockModal":function(d){return "צריכים להיות בלוקים בתוך הגדרת הפונקציה שלך. לחץ על \"עריכה\" וגרור את הבלוקים שבתוך הבלוק הירוק."},
"errorIncompleteBlockInFunction":function(d){return "לחץ על \"ערוך\" כדי לוודא שאין לך בלוקים חסרים בתוך הגדרת הפונקציה שלך."},
"errorParamInputUnattached":function(d){return "זכור להצמיד בלוק לכל פרמטר קלט שבבלוק הפונקציה בסביבת העבודה שלך."},
"errorUnusedParam":function(d){return "הוספת בלוק פרמטר, אבל לא ביצעת בו שימוש בהגדרה. הקפד להשתמש בפרמטר על ידי לחיצה על \"עריכה\" והצבת בלוק הפרמטר בתוך הבלוק הירוק."},
"errorRequiredParamsMissing":function(d){return "תיצור פרמטר לפונקציה שלך ע\"י לחיצה על \"עריכה\" והוספת הפרמטים הנחוצים. גרור את בלוק הפרמטר החדש אל תוך הגדרת הפונקציה שלך."},
"errorUnusedFunction":function(d){return "יצרת פונקציה, אך לא ביצעת בה שימוש בסביבת העבודה שלך! לחץ על \"פונקציות\" בארגז הכלים ותוודא שאתה משתמש בה בתוכנית שלך."},
"errorQuestionMarksInNumberField":function(d){return "נסה להחליף \"???\" בערך כלשהו."},
"extraTopBlocks":function(d){return "יש לך אבני כעיגולים בצבע. התכוונת לצרף אלה כדי לחסום את \"בעת הפעלת\"?"},
"finalStage":function(d){return "מזל טוב! השלמת את השלב הסופי."},
"finalStageTrophies":function(d){return "מזל טוב! השלמת את השלב הסופי וזכית ב"+locale.p(d,"numTrophies",0,"he",{"one":"פרס","other":locale.n(d,"numTrophies")+" פרסים"})+"."},
"finish":function(d){return "סיים"},
"generatedCodeInfo":function(d){return "אפילו האוניברסטאות הטובות ביותר מלמדות תכנות בשיטת בלוקים (לדוגמה, "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). אבל מתחת למכסה המנוע, המיומנויות שרכשת ניתנות למימוש גם בג'אווה סקריפט, שפת התכנות הפופלרית בעולם:"},
"hashError":function(d){return "סליחה, אך '%1' אינו תואם לאף תוכנית שנשמרה."},
"help":function(d){return "עזרה"},
"hintTitle":function(d){return "רמז:"},
"jump":function(d){return "קפוץ"},
"levelIncompleteError":function(d){return "הנך משתמש בכל סוגי הבלוקים הנדרשים אך לא באופן הנכון."},
"listVariable":function(d){return "רשימה"},
"makeYourOwnFlappy":function(d){return "תיצור משחק Flappy משלך"},
"missingBlocksErrorMsg":function(d){return "השתמש באחד או יותר מהבלוקים להלן כדי לפתור את הפאזל."},
"nextLevel":function(d){return "מזל טוב! השלמת את פאזל "+locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "מזל טוב! השלמת את פאזל "+locale.v(d,"puzzleNumber")+" וזכית ב"+locale.p(d,"numTrophies",0,"he",{"one":"פרס","other":locale.n(d,"numTrophies")+" פרסים"})+"."},
"nextStage":function(d){return "מזל טוב! השלמת "+locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "כל הכבוד! השלמת את שלב "+locale.v(d,"stageName")+" וזכית ב-"+locale.p(d,"numTrophies",0,"he",{"one":"פרס","other":locale.n(d,"numTrophies")+" פרסים"})+"."},
"numBlocksNeeded":function(d){return "כל הכבוד! השלמת את חידה "+locale.v(d,"puzzleNumber")+". (עם זאת, יכולת להשתמש רק ב "+locale.p(d,"numBlocks",0,"he",{"one":"1 בלוק","other":locale.n(d,"numBlocks")+" בלוקים"})+".)"},
"numLinesOfCodeWritten":function(d){return "כתבת "+locale.p(d,"numLines",0,"he",{"one":"שורת","other":locale.n(d,"numLines")+" שורות"})+" קוד!"},
"play":function(d){return "הפעל"},
"print":function(d){return "הדפס"},
"puzzleTitle":function(d){return "חידה "+locale.v(d,"puzzle_number")+" מ- "+locale.v(d,"stage_total")},
"repeat":function(d){return "חזור על"},
"resetProgram":function(d){return "אפס"},
"runProgram":function(d){return "הרץ"},
"runTooltip":function(d){return "הפעל את התוכנית המוגדרת על-ידי הבלוקים בסביבת העבודה."},
"score":function(d){return "ציון"},
"showCodeHeader":function(d){return "הצג קוד"},
"showBlocksHeader":function(d){return "הצג בלוקים"},
"showGeneratedCode":function(d){return "הצג קוד"},
"stringEquals":function(d){return "מחרוזת=?"},
"subtitle":function(d){return "סביבת תיכנות חזותית"},
"textVariable":function(d){return "טקסט"},
"tooFewBlocksMsg":function(d){return "אתה משתמש בכל סוגי הבלוקים הנחוצים, אך נסה להשתמש ביותר בלוקים מסוגים אלו כדי להשלים את הפאזל."},
"tooManyBlocksMsg":function(d){return "ניתן לפתור את החידה הזאת עם  <x id='START_SPAN'/><x id='END_SPAN'/>  בלוקים."},
"tooMuchWork":function(d){return "גרמת לי להרבה עבודה! האם אתה יכול לנסות לחזור פחות פעמים?"},
"toolboxHeader":function(d){return "בלוקים"},
"openWorkspace":function(d){return "איך זה עובד"},
"totalNumLinesOfCodeWritten":function(d){return "סך כל הזמנים:  "+locale.p(d,"numLines",0,"he",{"one":"שורה אחת","other":locale.n(d,"numLines")+" שורות"})+" של קוד."},
"tryAgain":function(d){return "נסה שוב"},
"hintRequest":function(d){return "ראה רמז"},
"backToPreviousLevel":function(d){return "חזרה לשלב הקודם"},
"saveToGallery":function(d){return "שמור לגלריה"},
"savedToGallery":function(d){return "נשמר בגלריה!"},
"shareFailure":function(d){return "מצטערים, אנחנו לא יכולים לשתף תוכנית זו."},
"workspaceHeader":function(d){return "הרכב את הבלוקים שלך כאן: "},
"workspaceHeaderJavaScript":function(d){return "הקלד את קוד JavaScript שלך כאן"},
"infinity":function(d){return "אינסוף"},
"rotateText":function(d){return "סובב את המכשיר שלך."},
"orientationLock":function(d){return "בטל את נעילת הכיוון בהגדרות המכשיר."},
"wantToLearn":function(d){return "רוצה ללמוד לתכנת?"},
"watchVideo":function(d){return "צפה בסרטון"},
"when":function(d){return "מתי"},
"whenRun":function(d){return "מתי לרוץ"},
"tryHOC":function(d){return "נסה את \"שעת הקוד\" (Hour of Code)"},
"signup":function(d){return "הירשם לקורס המבוא"},
"hintHeader":function(d){return "הנה עצה:"},
"genericFeedback":function(d){return "לראות איך גמרת, ולנסות לתקן את התוכנית שלך."},
"toggleBlocksErrorMsg":function(d){return "You need to correct an error in your program before it can be shown as blocks."},
"defaultTwitterText":function(d){return "Check out what I made"}};