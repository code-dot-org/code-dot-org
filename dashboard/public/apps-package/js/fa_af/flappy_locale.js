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
"continue":function(d){return "ادامه بده"},
"doCode":function(d){return "انجام بده"},
"elseCode":function(d){return "وگرنه"},
"endGame":function(d){return "پایان بازی"},
"endGameTooltip":function(d){return "بازی را تمام می‌کند."},
"finalLevel":function(d){return "تبریک! شما پازل نهایی را حل کردید."},
"flap":function(d){return "پریدن"},
"flapRandom":function(d){return "به میزان تصادفی بپر"},
"flapVerySmall":function(d){return "خیلی کم بپر"},
"flapSmall":function(d){return "یه کم بپر"},
"flapNormal":function(d){return "به میزان متوسط بپر"},
"flapLarge":function(d){return "زیاد بپر"},
"flapVeryLarge":function(d){return "خیلی زیاد بپر"},
"flapTooltip":function(d){return "پرواز به سمت بالا."},
"flappySpecificFail":function(d){return "کد شما خوب به نظر می‌رسد - پرنده با هر کلیک پر می‌زند. ولی برای پر زدن بسوی هدف باید چندین بار کلیک کنید."},
"incrementPlayerScore":function(d){return "یک امتیاز بگیر"},
"incrementPlayerScoreTooltip":function(d){return "یکی به امتیاز بازیکن فعلی اضافه کن."},
"nextLevel":function(d){return "تبریک! شما این پازل را به اتمام رساندید."},
"no":function(d){return "نه"},
"numBlocksNeeded":function(d){return "این پازل می تواند با %1 از بلوکها حل شود."},
"playSoundRandom":function(d){return "پخش صدای تصادفی"},
"playSoundBounce":function(d){return "پخش صدای جهش"},
"playSoundCrunch":function(d){return "صدای خرد شدن را پخش کن"},
"playSoundDie":function(d){return "پخش صدای غمگین"},
"playSoundHit":function(d){return "پخش صدای ضربه"},
"playSoundPoint":function(d){return "پخش صدای امتیازگیری"},
"playSoundSwoosh":function(d){return "پخش صدای خش خش"},
"playSoundWing":function(d){return "پخش صدای بال زدن"},
"playSoundJet":function(d){return "پخش صدای جت"},
"playSoundCrash":function(d){return "پخش صدای تصادف"},
"playSoundJingle":function(d){return "صدای جرنگ جرنگ پخش کن"},
"playSoundSplash":function(d){return "پخش صدای چلپ چلوپ"},
"playSoundLaser":function(d){return "پخش صدای لیزر"},
"playSoundTooltip":function(d){return "صدای انتخاب شده را پخش کن."},
"reinfFeedbackMsg":function(d){return "می‌توانید دکمه \"تلاش دوباره\" را بزنید تا به عقب برگشته و بازی‌تان را انجام دهید."},
"scoreText":function(d){return "امتیاز: "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "تنظیم صحنه"},
"setBackgroundRandom":function(d){return "تنظیم صحنه تصادفی"},
"setBackgroundFlappy":function(d){return "قراردادن صحنه شهر (روز)"},
"setBackgroundNight":function(d){return "قراردادن صحنه شهر (شب)"},
"setBackgroundSciFi":function(d){return "قراردادن صحنه علمی تخیلی"},
"setBackgroundUnderwater":function(d){return "قراردادن صحنه زیرآب"},
"setBackgroundCave":function(d){return "قراردادن صحنه غار"},
"setBackgroundSanta":function(d){return "قراردادن صحنه بابانوئل"},
"setBackgroundTooltip":function(d){return "تعیین تصویر پس‌زمینه"},
"setGapRandom":function(d){return "تنظیم فاصله تصادفی"},
"setGapVerySmall":function(d){return "تنظیم یک فاصله کم"},
"setGapSmall":function(d){return "تنظیم یک فاصله کوچک"},
"setGapNormal":function(d){return "تنظیم یک فاصله متوسط"},
"setGapLarge":function(d){return "تنظیم یک فاصله زیاد"},
"setGapVeryLarge":function(d){return "تنظیم یک فاصله خیلی زیاد"},
"setGapHeightTooltip":function(d){return "فاصله عمودی را در یک مانع تنظیم میکند"},
"setGravityRandom":function(d){return "تنظیم جاذبه تصادفی"},
"setGravityVeryLow":function(d){return "تنظیم جاذبه خیلی کم"},
"setGravityLow":function(d){return "تنظیم جاذبه کم"},
"setGravityNormal":function(d){return "تنظیم جاذبه معمولی"},
"setGravityHigh":function(d){return "تنظیم جاذبه زیاد"},
"setGravityVeryHigh":function(d){return "تنظیم جاذبه خیلی زیاد"},
"setGravityTooltip":function(d){return "جاذبه سطح را تعیین می‌کند"},
"setGround":function(d){return "تنظیم زمینه"},
"setGroundRandom":function(d){return "قراردادن زمینه بطور تصادفی"},
"setGroundFlappy":function(d){return "تنظیم شکل زمینه"},
"setGroundSciFi":function(d){return "قراردادن زمینه علمی تخیلی"},
"setGroundUnderwater":function(d){return "قراردادن زمینه زیرآبی"},
"setGroundCave":function(d){return "قراردادن زمینه غار"},
"setGroundSanta":function(d){return "قراردادن زمینه بابانوئل"},
"setGroundLava":function(d){return "قراردادن زمینه آتشفشانی"},
"setGroundTooltip":function(d){return "تصویر زمینه را تعیین می‌کند"},
"setObstacle":function(d){return "تنظیم مانع"},
"setObstacleRandom":function(d){return "قراردادن مانع بطور تصادفی"},
"setObstacleFlappy":function(d){return "قراردادن مانع لوله"},
"setObstacleSciFi":function(d){return "قراردادن مانع علمی تخیلی"},
"setObstacleUnderwater":function(d){return "قراردادن مانع گیاه"},
"setObstacleCave":function(d){return "قراردادن مانع غار"},
"setObstacleSanta":function(d){return "قراردادن مانع دودکش"},
"setObstacleLaser":function(d){return "قراردادن مانع لیزر"},
"setObstacleTooltip":function(d){return "تصویر مانع را تعیین می‌کند"},
"setPlayer":function(d){return "تنظیم بازیکن"},
"setPlayerRandom":function(d){return "قراردادن بازیکن بطور تصادفی"},
"setPlayerFlappy":function(d){return "قراردادن پرنده زرد بعنوان بازیکن"},
"setPlayerRedBird":function(d){return "قراردادن پرنده قرمز بعنوان بازیکن"},
"setPlayerSciFi":function(d){return "قراردادن سفینه‌فضایی بعنوان بازیکن"},
"setPlayerUnderwater":function(d){return "قراردادن ماهی بعنوان بازیکن"},
"setPlayerCave":function(d){return "قراردادن خفاش بعنوان بازیکن"},
"setPlayerSanta":function(d){return "قراردادن بابانوئل بعنوان بازیکن"},
"setPlayerShark":function(d){return "قراردادن کوسه بعنوان بازیکن"},
"setPlayerEaster":function(d){return "قراردادن خرگوش عید پاک بعنوان بازیکن"},
"setPlayerBatman":function(d){return "قراردادن مرد خفاشی بعنوان بازیکن"},
"setPlayerSubmarine":function(d){return "قراردادن زیردریایی بعنوان بازیکن"},
"setPlayerUnicorn":function(d){return "قراردادن اسب تک شاخ بعنوان بازیکن"},
"setPlayerFairy":function(d){return "قراردادن فرشته بعنوان بازیکن"},
"setPlayerSuperman":function(d){return "قراردادن مرد پرنده بعنوان بازیکن"},
"setPlayerTurkey":function(d){return "قراردادن بوقلمون بعنوان بازیکن"},
"setPlayerTooltip":function(d){return "تصویر بازیکن را تعیین می‌کند"},
"setScore":function(d){return "قرار دادن امتیاز"},
"setScoreTooltip":function(d){return "امتیاز بازیکن را تعیین می‌کند"},
"setSpeed":function(d){return "تنظیم سرعت"},
"setSpeedTooltip":function(d){return "سرعت مرحله را تعیین می‌کند"},
"shareFlappyTwitter":function(d){return "بازی Flappy که من ساخته‌ام را نگاه کن. من خودم با @codeorg آن را نوشته‌ام"},
"shareGame":function(d){return "بازی خود را به اشتراک بگذارید:"},
"soundRandom":function(d){return "تصادفی"},
"soundBounce":function(d){return "پریدن"},
"soundCrunch":function(d){return "خرد شدن"},
"soundDie":function(d){return "غمگین"},
"soundHit":function(d){return "برخورد"},
"soundPoint":function(d){return "امتیاز"},
"soundSwoosh":function(d){return "خش خش"},
"soundWing":function(d){return "بال زدن"},
"soundJet":function(d){return "جت"},
"soundCrash":function(d){return "سقوط کردن"},
"soundJingle":function(d){return "صدای زنگ"},
"soundSplash":function(d){return "چلپ چلوپ"},
"soundLaser":function(d){return "لیزر"},
"speedRandom":function(d){return "تعیین سرعت بطور تصادفی"},
"speedVerySlow":function(d){return "قرار دادن سرعت بسیار کند"},
"speedSlow":function(d){return "قرار دادن سرعت کند"},
"speedNormal":function(d){return "قرار دادن سرعت معمولی"},
"speedFast":function(d){return "قرار دادن سرعت سریع"},
"speedVeryFast":function(d){return "تعیین سرعت خیلی سریع"},
"whenClick":function(d){return "هنگام کلیک"},
"whenClickTooltip":function(d){return "هنگامیکه یک رویداد کلیک رخ می‌دهد، اقدامات زیر را اجرا کن."},
"whenCollideGround":function(d){return "زمانی که به زمین میخورد"},
"whenCollideGroundTooltip":function(d){return "اجرای اقدامات زیر زمانی که flappy به زمین میخورد."},
"whenCollideObstacle":function(d){return "هنگامیکه به یک مانع برخورد می‌کند"},
"whenCollideObstacleTooltip":function(d){return "هنگامیکه Flappy به یک مانع برخورد می‌کند، اقدامات زیر را اجرا کن."},
"whenEnterObstacle":function(d){return "هنگامیکه از مانع عبور می‌کند"},
"whenEnterObstacleTooltip":function(d){return "هنگامیکه Flappy وارد یک مانع می‌شود، اقدامات زیر را اجرا کن."},
"whenRunButtonClick":function(d){return "وقتی که بازی شروع می شود"},
"whenRunButtonClickTooltip":function(d){return "هنگامیکه بازی شروع می‌شود، اقدامات زیر را اجرا کن."},
"yes":function(d){return "بله"}};