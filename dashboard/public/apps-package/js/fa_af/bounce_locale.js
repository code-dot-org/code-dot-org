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
"bounceBall":function(d){return "توپ را بپران"},
"bounceBallTooltip":function(d){return "توپ را از روی یک شئ بپران."},
"continue":function(d){return "ادامه بده"},
"dirE":function(d){return "شرق"},
"dirN":function(d){return "شمال"},
"dirS":function(d){return "جنوب"},
"dirW":function(d){return "غرب"},
"doCode":function(d){return "انجام بده"},
"elseCode":function(d){return "وگرنه"},
"finalLevel":function(d){return "تبریک! شما پازل نهایی را حل کردید."},
"heightParameter":function(d){return "ارتفاع"},
"ifCode":function(d){return "اگر"},
"ifPathAhead":function(d){return "اگر مسیر رو به جلو است"},
"ifTooltip":function(d){return "اگر راهی در مسیر مسخصی است,اقداماتی بکن."},
"ifelseTooltip":function(d){return "اگر راهی در مسیر مشخصی وجود دارد,اولین از سری اقدامات را انجام ده,در غیر این صورت به سراغ دومین اقدام برو."},
"incrementOpponentScore":function(d){return "امتیاز رقیب را افزایش بده"},
"incrementOpponentScoreTooltip":function(d){return "یک امتیاز به رقیب اضافه کنید."},
"incrementPlayerScore":function(d){return "نمره امتیاز"},
"incrementPlayerScoreTooltip":function(d){return "یکی به امتیاز بازیکن فعلی اضافه کن."},
"isWall":function(d){return "آیا این دیوار است؟"},
"isWallTooltip":function(d){return "صحیح را برمیگرداند اگر دیواری اینجا باشد"},
"launchBall":function(d){return "توپ جدید آماده کن"},
"launchBallTooltip":function(d){return "یک توپ وارد بازی کن."},
"makeYourOwn":function(d){return "بازی پرشی خودتان را بسازید"},
"moveDown":function(d){return "برو پایین"},
"moveDownTooltip":function(d){return "راکت را به سمت پایین حرکت بده."},
"moveForward":function(d){return "به جلو حرکت کردن"},
"moveForwardTooltip":function(d){return "به اندازه یک فاصله من را جلو ببر."},
"moveLeft":function(d){return "برو چپ"},
"moveLeftTooltip":function(d){return "راکت را به سمت چپ حرکت بده."},
"moveRight":function(d){return "برو راست"},
"moveRightTooltip":function(d){return "راکت را به سمت راست حرکت بده."},
"moveUp":function(d){return "برو بالا"},
"moveUpTooltip":function(d){return "راکت را به سمت بالا حرکت بده."},
"nextLevel":function(d){return "تبریک! شما این پازل را به اتمام رساندید."},
"no":function(d){return "نه"},
"noPathAhead":function(d){return "راه مسدود است"},
"noPathLeft":function(d){return "سمت چپ راهی نیست"},
"noPathRight":function(d){return "سمت راست راهی نیست"},
"numBlocksNeeded":function(d){return "این پازل می تواند با %1 از بلوکها حل شود."},
"pathAhead":function(d){return "مسیر پیش رو"},
"pathLeft":function(d){return "اگر مسیر به سمت چپ بود"},
"pathRight":function(d){return "اگر مسیر به سمت راست بود"},
"pilePresent":function(d){return "آنجا یک توده وجود دارد"},
"playSoundCrunch":function(d){return "صدای خرد شدن را پخش کن"},
"playSoundGoal1":function(d){return "صدای گل 1 را پخش کن"},
"playSoundGoal2":function(d){return "صدای گل 2 را پخش کن"},
"playSoundHit":function(d){return "صدای ضربه را پخش کن"},
"playSoundLosePoint":function(d){return "صدای از دست دادن امتیاز را پخش کن"},
"playSoundLosePoint2":function(d){return "صدای از دست دادن امتیاز دوم را پخش کن"},
"playSoundRetro":function(d){return "صدای قدیمی پخش کن"},
"playSoundRubber":function(d){return "صدای کش را پخش کن"},
"playSoundSlap":function(d){return "صدای دست زدن را پخش کن"},
"playSoundTooltip":function(d){return "صدای انتخاب شده را پخش کن."},
"playSoundWinPoint":function(d){return "صدای کسب امتیاز را پخش کن"},
"playSoundWinPoint2":function(d){return "صدای کسب امتیاز 2 را پخش کن"},
"playSoundWood":function(d){return "صدای چوب را پخش کن"},
"putdownTower":function(d){return "کثیفی ها را پایین بکشید"},
"reinfFeedbackMsg":function(d){return "می‌توانید دکمه \"تلاش دوباره\" را بزنید تا به عقب برگشته و بازی‌تان را انجام دهید."},
"removeSquare":function(d){return "مربع را حزف کن"},
"repeatUntil":function(d){return "تکرار کن تا زمانی که"},
"repeatUntilBlocked":function(d){return "تا زمانیکه مسیر پیش رو است "},
"repeatUntilFinish":function(d){return "آنقدر تکرار کن تا تمام شود"},
"scoreText":function(d){return "امتیاز: "+bounce_locale.v(d,"playerScore")+" : "+bounce_locale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "منظره را تصادفی کن"},
"setBackgroundHardcourt":function(d){return "منظرۀ زمین بازی را تنظیم کن"},
"setBackgroundRetro":function(d){return "منظرۀ قدیمی را تنظیم کن"},
"setBackgroundTooltip":function(d){return "تعیین تصویر پس‌زمینه"},
"setBallRandom":function(d){return "توپ تصادفی را تنظیم کن"},
"setBallHardcourt":function(d){return "توپ زمین بازی را تنظیم کن"},
"setBallRetro":function(d){return "توپ چهل تیکه را تنظیم کن"},
"setBallTooltip":function(d){return "تصویر توپ را تنظیم میکند"},
"setBallSpeedRandom":function(d){return "سرعت توپ را تصادفی کن"},
"setBallSpeedVerySlow":function(d){return "سرعت توپ را بسیار آهسته کن"},
"setBallSpeedSlow":function(d){return "سرعت توپ را آهسته کن"},
"setBallSpeedNormal":function(d){return "سرعت توپ را معمولی کن"},
"setBallSpeedFast":function(d){return "سرعت توپ را تند کن"},
"setBallSpeedVeryFast":function(d){return "سرعت توپ را بسیار تند کن"},
"setBallSpeedTooltip":function(d){return "سرعت توپ را تنظیم میکند"},
"setPaddleRandom":function(d){return "راکت را تصادفی تنظیم کن"},
"setPaddleHardcourt":function(d){return "راکت زمین بازی را تنظیم کن"},
"setPaddleRetro":function(d){return "راکت قدیمی را تنظیم کن"},
"setPaddleTooltip":function(d){return "تصویر راکت را تنظیم میکند"},
"setPaddleSpeedRandom":function(d){return "سرعت راکت را تصادفی کن"},
"setPaddleSpeedVerySlow":function(d){return "سرعت راکت را بسیار آهسته کن"},
"setPaddleSpeedSlow":function(d){return "سرعت راکت را آهسته کن"},
"setPaddleSpeedNormal":function(d){return "سرعت راکت را معمولی کن"},
"setPaddleSpeedFast":function(d){return "سرعت راکت را تند کن"},
"setPaddleSpeedVeryFast":function(d){return "سرعت راکت را بسیار تند کن"},
"setPaddleSpeedTooltip":function(d){return "سرعت راکت را تنظیم میکند"},
"shareBounceTwitter":function(d){return "بازی جهش را، که من ساخته ام، نگاه کن. من خودم با @codeorg آن را نوشته ام"},
"shareGame":function(d){return "بازی خود را به اشتراک بگذارید:"},
"turnLeft":function(d){return "بپیچ به چپ"},
"turnRight":function(d){return "بپیچ به راست"},
"turnTooltip":function(d){return "من را به راست یا چپ 90 درجه بچرخان."},
"whenBallInGoal":function(d){return "زمانی که توپ در هدف قرار دارد"},
"whenBallInGoalTooltip":function(d){return "کارهای زیر را انجام بده وقتی که یک توپ وارد هدف می شود."},
"whenBallMissesPaddle":function(d){return "وقتی که توپ به راکت نخورد"},
"whenBallMissesPaddleTooltip":function(d){return "کارهای زیر را انجام بده وقتی که یک توپ به راکت نمی خورد."},
"whenDown":function(d){return "وقتی که پیکان پایین"},
"whenDownTooltip":function(d){return "کارهای زیر را انجام بده وقتی که کلید جهت پایین فشار داده میشود."},
"whenGameStarts":function(d){return "وقتی که بازی شروع می شود"},
"whenGameStartsTooltip":function(d){return "هنگامیکه بازی شروع می‌شود، اقدامات زیر را اجرا کن."},
"whenLeft":function(d){return "وقتی که پیکان چپ"},
"whenLeftTooltip":function(d){return "کارهای زیر را انجام بده وقتی که کلید فلش چپ فشار داده می شود."},
"whenPaddleCollided":function(d){return "وقتی توپ به راکت برخورد می کند"},
"whenPaddleCollidedTooltip":function(d){return "کارهای زیر را انجام بده وقتی که یک توپ به راکت می خورد."},
"whenRight":function(d){return "وقتی که پیکان راست"},
"whenRightTooltip":function(d){return "کارهای زیر را انجام بده وقتی که کلید جهت راست فشار داده می شود."},
"whenUp":function(d){return "وقتی که پیکان بالا"},
"whenUpTooltip":function(d){return "کارهای زیر را انجام بده هنگامیکه کلید جهت بالا زده می‌شود."},
"whenWallCollided":function(d){return "زمانی که توپ به دیوار برخورد میکند"},
"whenWallCollidedTooltip":function(d){return "کارهای زیر را انجام بده وقتی که یک توپ به دیوار میخورد."},
"whileMsg":function(d){return "هنگامیکه"},
"whileTooltip":function(d){return "اقدامات محصور را تا زمانیکه به نقطه آخر برسی تکرار کن."},
"yes":function(d){return "بله"}};