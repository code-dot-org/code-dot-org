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
"continue":function(d){return "চালিয়ে যান"},
"doCode":function(d){return "করা"},
"elseCode":function(d){return "আর"},
"endGame":function(d){return "খেলা শেষ করুন"},
"endGameTooltip":function(d){return "খেলা শেষ করে।"},
"finalLevel":function(d){return "অভিনন্দন! আপনি শেষ ধাঁধা সমাধান করছেন।"},
"flap":function(d){return "পাখা ঝাপ্টান"},
"flapRandom":function(d){return "এলোমেলো পরিমানে পাখা ঝাপ্টান"},
"flapVerySmall":function(d){return "খুব সামান্য পরিমানে পাখা ঝাপ্টান"},
"flapSmall":function(d){return "সামান্য পরিমানে পাখা ঝাপ্টান"},
"flapNormal":function(d){return "সাধারণ পরিমানে পাখা ঝাপ্টান"},
"flapLarge":function(d){return "অনেক পাখা ঝাপ্টান"},
"flapVeryLarge":function(d){return "অনেক বেশি পরিমানে পাখা ঝাপ্টান"},
"flapTooltip":function(d){return "ফ্ল্যাপিকে উপরের দিকে উড়ান।"},
"flappySpecificFail":function(d){return "তোমার কোড দেখে ঠিক আছে বলে মনে হয় - এটা প্রতিটি ক্লিকের মাধ্যমেই পাখা নাড়াবে। কিন্তু আপনাকে লক্ষ্য পর্যন্ত যেতে অনেকবার ক্লিক করে পাখা নাড়তে হবে।"},
"incrementPlayerScore":function(d){return "পয়েন্ট যোগ"},
"incrementPlayerScoreTooltip":function(d){return "বর্তমান খেলোয়াড়ের হিসাবে একটি যোগ করুন।"},
"nextLevel":function(d){return "অভিনন্দন! আপনি এই ধাঁধা সম্পন্ন করেছেন।"},
"no":function(d){return "না"},
"numBlocksNeeded":function(d){return "This puzzle can be solved with %1 blocks."},
"playSoundRandom":function(d){return "ইচ্ছামত শব্দ বাজান"},
"playSoundBounce":function(d){return "বাউন্স শব্দ বাজান"},
"playSoundCrunch":function(d){return "কড়মড়ে শব্দ বাজান"},
"playSoundDie":function(d){return "দুঃখের শব্দ বাজান"},
"playSoundHit":function(d){return "স্মাস শব্দ বাজান"},
"playSoundPoint":function(d){return "পয়েন্ট শব্দ বাজান"},
"playSoundSwoosh":function(d){return "সোওয়াস শব্দ বাজান"},
"playSoundWing":function(d){return "বাতাসের শব্দ বাজান"},
"playSoundJet":function(d){return "জেট শব্দ বাজান"},
"playSoundCrash":function(d){return "ক্রাসের শব্দ বাজান"},
"playSoundJingle":function(d){return "জিঙ্গেল শব্দ বাজান"},
"playSoundSplash":function(d){return "স্পালাস শব্দ বাজান"},
"playSoundLaser":function(d){return "লেজার শব্দ বাজান"},
"playSoundTooltip":function(d){return "নির্বাচিত শব্দটি প্লে করুন।"},
"reinfFeedbackMsg":function(d){return "আপনি  পুনঃরাই আপনার খেলা প্লে করতে গিয়ে \"Try again\" বোতাম টিপতে পারেন."},
"scoreText":function(d){return "স্কোর: "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "প্রকৃতি সেট করুন"},
"setBackgroundRandom":function(d){return "এলোমেলো দৃশ্য সেট করুন"},
"setBackgroundFlappy":function(d){return "শহরের(দিন) দৃশ্য সেট করুন"},
"setBackgroundNight":function(d){return "শহরের(রাত) দৃশ্য সেট করুন"},
"setBackgroundSciFi":function(d){return "কল্পবিজ্ঞানের দৃশ্য সেট করুন"},
"setBackgroundUnderwater":function(d){return "জলতলের দৃশ্য সেট করুন "},
"setBackgroundCave":function(d){return "গুহার দৃশ্য সেট করুন "},
"setBackgroundSanta":function(d){return "সান্তার দৃশ্য সেট করুন "},
"setBackgroundTooltip":function(d){return "ব্যাকগ্রাউন্ড ইমেজ সেট করে"},
"setGapRandom":function(d){return "একটি এলোমেলো ফাঁক সেট করুন"},
"setGapVerySmall":function(d){return "একটি খুব ছোট ফাঁক সেট করুন"},
"setGapSmall":function(d){return "একটি ছোট ফাঁক সেট করুন"},
"setGapNormal":function(d){return "একটি স্বাভাবিক ফাঁক সেট করুন"},
"setGapLarge":function(d){return "একটি বড় ফাঁক সেট করুন"},
"setGapVeryLarge":function(d){return "একটি খুব বড় ফাঁক সেট করুন"},
"setGapHeightTooltip":function(d){return "বাধা মধ্যে একটি  উল্লম্ব ফাঁক সেট করুন"},
"setGravityRandom":function(d){return "এলোমেলো মাধ্যাকর্ষণ সেট করুন"},
"setGravityVeryLow":function(d){return "খুব কম মাধ্যাকর্ষণ সেট করুন"},
"setGravityLow":function(d){return "কম মাধ্যাকর্ষণ সেট করুন"},
"setGravityNormal":function(d){return "স্বাভাবিক মাধ্যাকর্ষণ সেট করুন"},
"setGravityHigh":function(d){return "উচ্চ মাধ্যাকর্ষণ সেট করুন"},
"setGravityVeryHigh":function(d){return "খুব উচ্চ মাধ্যাকর্ষণ সেট করুন"},
"setGravityTooltip":function(d){return "মাধ্যাকর্ষণ স্তর নির্ধারণ করুন"},
"setGround":function(d){return "ক্ষেত্র ঠিক করুন"},
"setGroundRandom":function(d){return "এলোমেলো ক্ষেত্র ঠিক করুন"},
"setGroundFlappy":function(d){return "স্থল ক্ষেত্র ঠিক করুন"},
"setGroundSciFi":function(d){return "কল্পবিজ্ঞান স্থল ঠিক করুন"},
"setGroundUnderwater":function(d){return "জলতলের ক্ষেত্র ঠিক করুন"},
"setGroundCave":function(d){return "গুহা ক্ষেত্র ঠিক করুন"},
"setGroundSanta":function(d){return "সান্তা ক্ষেত্র ঠিক করুন"},
"setGroundLava":function(d){return "সান্তা ক্ষেত্র ঠিক করুন"},
"setGroundTooltip":function(d){return "লাভা ক্ষেত্র ঠিক করুন"},
"setObstacle":function(d){return "বাধা সেট করুন"},
"setObstacleRandom":function(d){return "এলোমেলো বাধা সেট করুন"},
"setObstacleFlappy":function(d){return "পাইপ বাধা সেট করুন"},
"setObstacleSciFi":function(d){return "কল্পবিজ্ঞান বাধা সেট করুন"},
"setObstacleUnderwater":function(d){return "গাছ বাধা সেট করুন"},
"setObstacleCave":function(d){return "গুহা বাধা সেট করুন"},
"setObstacleSanta":function(d){return "চিমনি বাধা সেট করুন"},
"setObstacleLaser":function(d){return "লেজার বাধা সেট করুন"},
"setObstacleTooltip":function(d){return "চবি বাধা সেট করুন"},
"setPlayer":function(d){return "প্লেয়ার সেট করুন"},
"setPlayerRandom":function(d){return "এলোমেলো প্লেয়ার সেট করুন"},
"setPlayerFlappy":function(d){return "হলুদ পাখি প্লেয়ারটি সেট করুন"},
"setPlayerRedBird":function(d){return "লাল রঙের পাখি প্লেয়ারটি সেট করুন"},
"setPlayerSciFi":function(d){return "মহাকাশযান প্লেয়ারটি সেট করুন"},
"setPlayerUnderwater":function(d){return "মাছের প্লেয়ারটি সেট করুন"},
"setPlayerCave":function(d){return "বাদুড় প্লেয়ারটি সেট করুন"},
"setPlayerSanta":function(d){return "সান্টা প্লেয়ারটি সেট করুন"},
"setPlayerShark":function(d){return "হাঙ্গর প্লেয়ারটি সেট করুন"},
"setPlayerEaster":function(d){return "ইস্টার বানি প্লেয়ারটি সেট করুন"},
"setPlayerBatman":function(d){return "বাদুড় মানব প্লেয়ারটি সেট করুন"},
"setPlayerSubmarine":function(d){return "সাবমেরিন প্লেয়ারটি সেট করুন"},
"setPlayerUnicorn":function(d){return "ইউনিকর্ন প্লেয়ারটি সেট করুন"},
"setPlayerFairy":function(d){return "পরী প্লেয়ারটি সেট করুন"},
"setPlayerSuperman":function(d){return "ফ্লাপিমানুষ প্লেয়ার সেট করুন"},
"setPlayerTurkey":function(d){return "টার্কি পাখি প্লেয়ার সেট করুন"},
"setPlayerTooltip":function(d){return "প্লেয়ার ছবি সেট করে"},
"setScore":function(d){return "স্কোর সেট করুন"},
"setScoreTooltip":function(d){return "প্লেয়ার স্কোর নির্ধারণ করে।"},
"setSpeed":function(d){return "গতির সেট করুন"},
"setSpeedTooltip":function(d){return "গতি স্তর নির্ধারণ করে।"},
"shareFlappyTwitter":function(d){return "আমি তৈরি Flappy খেলা দেখুন। আমি এটা নিজে codeorg সাথে লিখেছে"},
"shareGame":function(d){return "আপনার খেলা শেয়ার করুন:"},
"soundRandom":function(d){return "এলোমেলো"},
"soundBounce":function(d){return "লাফিয়ে ওঠা"},
"soundCrunch":function(d){return "কড়্কড়্ শব্দ"},
"soundDie":function(d){return "দু:খিত"},
"soundHit":function(d){return "চূর্ণ করা"},
"soundPoint":function(d){return "নির্দেশ করা"},
"soundSwoosh":function(d){return "শব্দ করে তাড়ানো"},
"soundWing":function(d){return "ডানা"},
"soundJet":function(d){return "জেট"},
"soundCrash":function(d){return "ক্র্যাশ"},
"soundJingle":function(d){return "ঝমঝম"},
"soundSplash":function(d){return "জলের ছিটা"},
"soundLaser":function(d){return "আলোকবিম্ব"},
"speedRandom":function(d){return "এলোমেলো গতি সেট করুন"},
"speedVerySlow":function(d){return "খুব ধীরে গতি সেট করুন"},
"speedSlow":function(d){return "ধীর গতি সেট করুন"},
"speedNormal":function(d){return "স্বাভাবিক গতি সেট করুন"},
"speedFast":function(d){return "দ্রুত গতি সেট করুন"},
"speedVeryFast":function(d){return "অতি দ্রুত গতি সেট করুন"},
"whenClick":function(d){return "ক্লিক করলে"},
"whenClickTooltip":function(d){return "যখন একটি ক্লিক ইভেন্ট হবে তখন নীচের কাজ সম্পাদন করুন।"},
"whenCollideGround":function(d){return "যখন মাটিতে আঘাত করবে"},
"whenCollideGroundTooltip":function(d){return "যখন ফ্লাপি মাটিকে আঘাত করবে তখন নীচের কাজ সম্পাদন করুন।"},
"whenCollideObstacle":function(d){return "যখন বাধা আঘাত করবে"},
"whenCollideObstacleTooltip":function(d){return "যখন ফ্লাপি একটা বাধাকে আঘাত করবে তখন নীচের কাজ সম্পাদন করুন।"},
"whenEnterObstacle":function(d){return "যখন বাধা পার হবে"},
"whenEnterObstacleTooltip":function(d){return "যখন ফ্লাপি একটা বাধাতে প্রবেশ করবে তখন নীচের কাজ সম্পাদন করুন।"},
"whenRunButtonClick":function(d){return "যখন খেলা শুরু"},
"whenRunButtonClickTooltip":function(d){return "যখন খেলা শুরু করে নিচে কর্ম সম্পাদন করে."},
"yes":function(d){return "\"হ্যাঁ\""}};