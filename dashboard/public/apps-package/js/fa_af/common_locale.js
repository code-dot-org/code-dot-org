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
v:function(d,k){locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){locale.c(d,k);return d[k] in p?p[d[k]]:(k=locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).locale = {
"and":function(d){return "و"},
"booleanTrue":function(d){return "صحیح"},
"booleanFalse":function(d){return "ناصحیح"},
"blocklyMessage":function(d){return "بلوکی"},
"catActions":function(d){return "اقدامات"},
"catColour":function(d){return "رنگ"},
"catLogic":function(d){return "منطق"},
"catLists":function(d){return "فهرست‌ها"},
"catLoops":function(d){return "حلقه ها"},
"catMath":function(d){return "ریاضی"},
"catProcedures":function(d){return "توابع"},
"catText":function(d){return "متن"},
"catVariables":function(d){return "متغیرها"},
"codeTooltip":function(d){return "کد جاوا اسکریپت تولید شده رو ببین."},
"continue":function(d){return "ادامه بده"},
"dialogCancel":function(d){return "لغو کن"},
"dialogOK":function(d){return "باشه"},
"directionNorthLetter":function(d){return "شمال"},
"directionSouthLetter":function(d){return "جنوب"},
"directionEastLetter":function(d){return "شرق"},
"directionWestLetter":function(d){return "غرب"},
"end":function(d){return "پایان"},
"emptyBlocksErrorMsg":function(d){return "بلوکهای \"تکرار\" یا \"شرطی\" برای کار کردن نیاز به بلوکهای دیگری در داخل خود دارند. مطمئن شوید که بلوک داخلی به درستی درون بلوک اصلی قرار گرفته است."},
"emptyFunctionBlocksErrorMsg":function(d){return "بلوک تابع برای به کار افتادن نیاز به بلوک های دیگری در داخل خود دارد."},
"errorEmptyFunctionBlockModal":function(d){return "باید بلوکهایی در تعریف تابع تو باشند. روی ویرایش کلیک کن و بلوکها را به داخل بلوک سبز بکش."},
"errorIncompleteBlockInFunction":function(d){return "روی ویرایش کلیک کن که مطمئن بشوی داخل تعریف تابعت هیچ بلوکی را از قلم نینداختی."},
"errorParamInputUnattached":function(d){return "یادت باشه که روی بلوک تابع در فضای کاریت، به هر پارامتر ورودی یک بلوک بچسبانی."},
"errorUnusedParam":function(d){return "تو یک بلوک پارامتر اضافه کردی اما از آن در تعریف استفاده نکردی. مطمئن شو که از پارامترت استفاده میکنی با کلیک کردن روی \"ویرایش\" و قرار دادن بلوک پارامتر داخل بلوک سبز."},
"errorRequiredParamsMissing":function(d){return "یک پارامتر برای تابعت بساز با کلیک کردن روی \"ویرایش\" و اضافه کردن پارامترهای لازم. بلوکهای پارامترهای جدید را بکش به داخل تعریف تابعت."},
"errorUnusedFunction":function(d){return "شما یک تابع ساختید اما هرگز آن را در فضای کاری خود استفاده نکردید! روی \"توابع\" در جعبه ابزار کلیک کنید و از آن در برنامه خود استفاده کنید."},
"errorQuestionMarksInNumberField":function(d){return "سعی کنید به جای \"؟؟؟\" یک مقدار قرار دهید ."},
"extraTopBlocks":function(d){return "تو بلوک‌های نچسبیده‌ داری. آیا میخواستی که اینها را به بلوک \"زمان اجرا\" وصل کنی؟"},
"finalStage":function(d){return "آفرین! شما مرحله‌ی نهایی را به پایان رساندید."},
"finalStageTrophies":function(d){return "آفرین! شما مرحله‌ی نهایی را به پایان رساندید و برنده‌ی "+locale.p(d,"numTrophies",0,"fa",{"one":"یک جایزه","other":locale.n(d,"numTrophies")+" جایزه"})+" شدید."},
"finish":function(d){return "تمام کن"},
"generatedCodeInfo":function(d){return "دانشگاههای برتر نیز کدنویسی بر اساس بلوک ها را آموزش می دهند (مثل "+locale.v(d,"berkeleyLink")+" و "+locale.v(d,"harvardLink")+"). اما در پشت پرده، بلوک هایی که شما سر هم کرده اید را می توان به زبان جاوا اسکریپت نشان داد، که پر استفاده ترین زبان کدنویسی در دنیاست:"},
"hashError":function(d){return "با عرض پوزش، '%1' با هیچ کدام از برنامه‌های ذخیره شده مطابقت ندارد."},
"help":function(d){return "راهنما"},
"hintTitle":function(d){return "راهنمایی:"},
"jump":function(d){return "پرش"},
"levelIncompleteError":function(d){return "شما همه‌ی بلوک‌های مورد نیاز را بکار بردید، ولی نه به روش درست."},
"listVariable":function(d){return "فهرست"},
"makeYourOwnFlappy":function(d){return "پرنده ی فلاپیِ خودتان را بسازید"},
"missingBlocksErrorMsg":function(d){return "برای حل این پازل، یک یا چند تا از بلوک‌های زیر را بکار ببرید."},
"nextLevel":function(d){return "آفرین! شما پازل "+locale.v(d,"puzzleNumber")+" را به پایان رساندید."},
"nextLevelTrophies":function(d){return "آفرین! شما معمای "+locale.v(d,"puzzleNumber")+" را به پایان رساندید و برنده‌ی "+locale.p(d,"numTrophies",0,"fa",{"one":"یک جایزه","other":locale.n(d,"numTrophies")+" جایزه"})+" شدید."},
"nextStage":function(d){return "آفرین! شما "+locale.v(d,"stageName")+" را به پایان رساندید."},
"nextStageTrophies":function(d){return "آفرین! شما مرحله‌ی "+locale.v(d,"stageName")+" را به پایان رساندید و برنده‌ی "+locale.p(d,"numTrophies",0,"fa",{"one":"یک جایزه","other":locale.n(d,"numTrophies")+" جایزه"})+" شدید."},
"numBlocksNeeded":function(d){return "آفرین! شما پازل "+locale.v(d,"puzzleNumber")+" را به پایان رساندید. (اگرچه می‌توانستید تنها "+locale.p(d,"numBlocks",0,"fa",{"one":"یک بلوک","other":locale.n(d,"numBlocks")+" بلوک"})+" بکار ببرید.)"},
"numLinesOfCodeWritten":function(d){return "شما همین الان  "+locale.p(d,"numLines",0,"fa",{"one":"یک خط","other":locale.n(d,"numLines")+" خط"})+" کد نوشتید!"},
"play":function(d){return "بازی کن"},
"print":function(d){return "چاپ کن"},
"puzzleTitle":function(d){return "پازل "+locale.v(d,"puzzle_number")+"  از"+locale.v(d,"stage_total")},
"repeat":function(d){return "تکرار کن"},
"resetProgram":function(d){return "تنظیم مجدد"},
"runProgram":function(d){return "اجرا کن"},
"runTooltip":function(d){return "برنامه‌ای را اجرا کن که با بلوک‌های داخل فضای کار تعریف شده."},
"score":function(d){return "امتیاز"},
"showCodeHeader":function(d){return "کد را نشان بده"},
"showBlocksHeader":function(d){return "بلوک‌ها را نشان بده"},
"showGeneratedCode":function(d){return "نمایشِ کد"},
"stringEquals":function(d){return "رشته =?"},
"subtitle":function(d){return "یک محیط برنامه نویسیِ دیداری"},
"textVariable":function(d){return "متن"},
"tooFewBlocksMsg":function(d){return "شما از همه‌ی بلوک‌های لازم داری استفاده میکنی، ولی برای حل این پازل تعداد بیشتری از این بلوک‌ها را استفاده کن."},
"tooManyBlocksMsg":function(d){return "این معما را می‌توان با بلوکهای <x id='START_SPAN'/><x id='END_SPAN'/> حل کرد."},
"tooMuchWork":function(d){return "شما منو مجبور به انجام مقدار زیادی کار کردید. میشه تعداد تکرار رو کمتر کنید؟"},
"toolboxHeader":function(d){return "بلوک ها"},
"openWorkspace":function(d){return "چگونه کار می کند"},
"totalNumLinesOfCodeWritten":function(d){return "در مجموع: "+locale.p(d,"numLines",0,"fa",{"one":"یک خط","other":locale.n(d,"numLines")+" خط"})+" کد."},
"tryAgain":function(d){return "دوباره تلاش کن"},
"hintRequest":function(d){return "راهنمایی را ببینید"},
"backToPreviousLevel":function(d){return "برگرد به سطح قبلی"},
"saveToGallery":function(d){return "در گالری ذخیره کن"},
"savedToGallery":function(d){return "در گالری ذخیره شد!"},
"shareFailure":function(d){return "با عرض پوزش، ما نمیتوانیم این برنامه را به اشتراک بگذاریم."},
"workspaceHeader":function(d){return "بلوک‌های خودت رو اینجا سرهم کن: "},
"workspaceHeaderJavaScript":function(d){return "کد جاوا اسکریپت خودت را اینجا وارد کن"},
"infinity":function(d){return "بی نهایت"},
"rotateText":function(d){return "دستگاهت  را بچرخان."},
"orientationLock":function(d){return "قفل جهت یابی را در تنظیمات دستگاه باز کنید."},
"wantToLearn":function(d){return "آیا می‌خواهید کد نویسی را یاد بگیرید؟"},
"watchVideo":function(d){return "ویدیو را ببینید"},
"when":function(d){return "وقتی"},
"whenRun":function(d){return "زمان اجرا"},
"tryHOC":function(d){return "ساعتِ کد نویسی را امتحان کنید"},
"signup":function(d){return "برای دوره‌ی مقدماتی نام نویسی کنید"},
"hintHeader":function(d){return "این هم یک راهنمایی:"},
"genericFeedback":function(d){return "ببین چطور به اینجا رسیدی، و سعی کن برنامه ات را درست کنی."},
"toggleBlocksErrorMsg":function(d){return "You need to correct an error in your program before it can be shown as blocks."},
"defaultTwitterText":function(d){return "آنچه من ساخته ام را امتحان کن "}};