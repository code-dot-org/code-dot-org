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
"atHoneycomb":function(d){return "در کندوی عسل"},
"atFlower":function(d){return "در گل"},
"avoidCowAndRemove":function(d){return "از گاو دوری کنید و ۱ را حذف کنید"},
"continue":function(d){return "ادامه بده"},
"dig":function(d){return "۱ را حذف کن"},
"digTooltip":function(d){return "1 واحد خاک را حذف کن"},
"dirE":function(d){return "شرق"},
"dirN":function(d){return "شمال"},
"dirS":function(d){return "جنوب"},
"dirW":function(d){return "غرب"},
"doCode":function(d){return "انجام بده"},
"elseCode":function(d){return "وگرنه"},
"fill":function(d){return "1 را پر کن"},
"fillN":function(d){return "پر کنید "+maze_locale.v(d,"shovelfuls")},
"fillStack":function(d){return "چاله ها را پر کن بیل"+maze_locale.v(d,"shovelfuls")},
"fillSquare":function(d){return "مربع را پر کنید"},
"fillTooltip":function(d){return "1 واحد خاک را قرار بده"},
"finalLevel":function(d){return "تبریک! شما پازل نهایی را حل کردید."},
"flowerEmptyError":function(d){return "گلی که رویش هستی دیگر شهد ندارد."},
"get":function(d){return "بگیر"},
"heightParameter":function(d){return "ارتفاع"},
"holePresent":function(d){return "یک سوراخ وجود دارد"},
"honey":function(d){return "عسل بساز"},
"honeyAvailable":function(d){return "عسل"},
"honeyTooltip":function(d){return "از شهد گل عسل درست کن"},
"honeycombFullError":function(d){return "این کندوی عسل برای عسل بیشتر جا ندارد."},
"ifCode":function(d){return "اگر"},
"ifInRepeatError":function(d){return "به یک بلوک \"if\" داخل یک بلوک \"repeat\" نیاز داری. اگر مشکل داری، سعی کن مرحله قبلی رو دوباره انجام بدی تا ببینی چگونه کار می کرد."},
"ifPathAhead":function(d){return "اگر مسیر رو به جلو است"},
"ifTooltip":function(d){return "اگر راهی در مسیر مسخصی است,اقداماتی بکن."},
"ifelseTooltip":function(d){return "اگر راهی در مسیر مشخصی وجود دارد,اولین از سری اقدامات را انجام ده,در غیر این صورت به سراغ دومین اقدام برو."},
"ifFlowerTooltip":function(d){return "اگر یک گل /کندوی عسل در جهت مشخص شده وجود دارد، آنگاه اقداماتی را انجام بده."},
"ifOnlyFlowerTooltip":function(d){return "اگر در جهت مشخص شده راهی هست، چند کار انجام بده."},
"ifelseFlowerTooltip":function(d){return "اگر یک گل یا کندوی عسل در جهت مشخص شده وجود دارد، آنگاه اولین بلوک اقدامات را انجام بده. در غیر این صورت ، دومین بلوک را انجام بده."},
"insufficientHoney":function(d){return "تو از بلوک‌های درست استفاده میکنی، اما باید به مقدار صحیح عسل درست کنی."},
"insufficientNectar":function(d){return "تو از بلوک‌های درست استفاده میکنی، اما باید میزان شهد صحیح را جمع کنی."},
"make":function(d){return "بساز"},
"moveBackward":function(d){return "حرکت به عقب"},
"moveEastTooltip":function(d){return "من را یک قدم به سمت شرق ببر."},
"moveForward":function(d){return "به جلو حرکت کردن"},
"moveForwardTooltip":function(d){return "به اندازه یک فاصله من را جلو ببر."},
"moveNorthTooltip":function(d){return "من را یک قدم به سمت شمال ببر."},
"moveSouthTooltip":function(d){return "من را یک قدم به سمت جنوب ببر."},
"moveTooltip":function(d){return "من را یک خانه به عقب/جلو حرکت بده"},
"moveWestTooltip":function(d){return "من را یک قدم به سمت غرب ببر."},
"nectar":function(d){return "گرفتن شهد"},
"nectarRemaining":function(d){return "شهد"},
"nectarTooltip":function(d){return "گرفتن شهد از یک گل"},
"nextLevel":function(d){return "تبریک! شما این پازل را به اتمام رساندید."},
"no":function(d){return "نه"},
"noPathAhead":function(d){return "راه مسدود است"},
"noPathLeft":function(d){return "سمت چپ راهی نیست"},
"noPathRight":function(d){return "سمت راست راهی نیست"},
"notAtFlowerError":function(d){return "شهد را می‌توانی فقط از یک گل بگیری."},
"notAtHoneycombError":function(d){return "عسل را فقط می‌توانی در یک شانه عسل تولید کنی."},
"numBlocksNeeded":function(d){return "این پازل می تواند با %1 از بلوکها حل شود."},
"pathAhead":function(d){return "مسیر پیش رو"},
"pathLeft":function(d){return "اگر مسیر به سمت چپ بود"},
"pathRight":function(d){return "اگر مسیر به سمت راست بود"},
"pilePresent":function(d){return "آنجا یک توده وجود دارد"},
"putdownTower":function(d){return "کثیفی ها را پایین بکشید"},
"removeAndAvoidTheCow":function(d){return "۱ را حذف کنید و از گاو اجتناب کنید"},
"removeN":function(d){return maze_locale.v(d,"shovelfuls")+" را حذف کن"},
"removePile":function(d){return "کپه را حذف کن"},
"removeStack":function(d){return "بک دسته از"+maze_locale.v(d,"shovelfuls")+" را حذف کن"},
"removeSquare":function(d){return "مربع را حزف کن"},
"repeatCarefullyError":function(d){return "برای حل کردن ، با دقت به الگوی دو حرکت و یک چرخش برای قرار دادن در بلوک \" تکرار \" فکر کنید . خوب است که یک چرخش اضافه در انتها داشته باشیم . "},
"repeatUntil":function(d){return "تکرار کن تا زمانی که"},
"repeatUntilBlocked":function(d){return "تا زمانیکه مسیر پیش رو است "},
"repeatUntilFinish":function(d){return "آنقدر تکرار کن تا تمام شود"},
"step":function(d){return "مرحله"},
"totalHoney":function(d){return "همه ی عسل ها "},
"totalNectar":function(d){return "همه ی شهد ها"},
"turnLeft":function(d){return "بپیچ به چپ"},
"turnRight":function(d){return "بپیچ به راست"},
"turnTooltip":function(d){return "من را به راست یا چپ 90 درجه بچرخان."},
"uncheckedCloudError":function(d){return "مطمئن شوید که تمام ابرها را برای وجود گل ها یا کندو های عسل بررسی کرده اید ."},
"uncheckedPurpleError":function(d){return "مطمئن شوید که تمام  گل های بنفش را برای وجود شهد بررسی کرده اید . "},
"whileMsg":function(d){return "هنگامیکه"},
"whileTooltip":function(d){return "اقدامات محصور را تا زمانیکه به نقطه آخر برسی تکرار کن."},
"word":function(d){return "کلمه را پیدا کنید"},
"yes":function(d){return "بله"},
"youSpelled":function(d){return "اسپل کنید"}};