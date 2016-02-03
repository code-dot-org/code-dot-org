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
v:function(d,k){bounce_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){bounce_locale.c(d,k);return d[k] in p?p[d[k]]:(k=bounce_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){bounce_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).bounce_locale = {
"bounceBall":function(d){return "লাফানো বল"},
"bounceBallTooltip":function(d){return "বস্তুতে বল ধাক্কা লাগিয়ে অন্য দিকে পাঠান।"},
"continue":function(d){return "চালিয়ে যান"},
"dirE":function(d){return "E"},
"dirN":function(d){return "N"},
"dirS":function(d){return "S"},
"dirW":function(d){return "W"},
"doCode":function(d){return "করা"},
"elseCode":function(d){return "আর"},
"finalLevel":function(d){return "অভিনন্দন! আপনি শেষ ধাঁধা সমাধান করছেন।"},
"heightParameter":function(d){return "উচ্চতা"},
"ifCode":function(d){return "যদী"},
"ifPathAhead":function(d){return "যদি সামনে পথ থাকে"},
"ifTooltip":function(d){return "একটি নির্দিষ্ট দিক যদি রাস্তা থাকে, তাহলে কিছু কাজ করুন।"},
"ifelseTooltip":function(d){return "নির্দিষ্ট দিক একটি পথ থাকলে প্রথম ব্লকের কাজ করুন। না থাকলে দ্বিতীয় ব্লক কাজ করুন।"},
"incrementOpponentScore":function(d){return "বিরোধী দলের পয়েন্ট বৃদ্ধি করলে"},
"incrementOpponentScoreTooltip":function(d){return "বিপক্ষ দলের বর্তমান হিসাবে একটি পয়েন্ট যোগ করুন।"},
"incrementPlayerScore":function(d){return "পয়েন্ট জিতুন"},
"incrementPlayerScoreTooltip":function(d){return "বর্তমান খেলোয়াড়ের হিসাবে একটি যোগ করুন।"},
"isWall":function(d){return "এটা কি একটা দেয়াল"},
"isWallTooltip":function(d){return "যদি এখানে একটি দেয়াল থাকে তবে ফলাফল হ্যাঁবোধক দেখাবে"},
"launchBall":function(d){return "নতুন বল সচল করুন"},
"launchBallTooltip":function(d){return "বল খেলার মধ্যে প্রবর্তন করান."},
"makeYourOwn":function(d){return "আপনার নিজের বাউন্স গেম তৈরি করুন"},
"moveDown":function(d){return "নিচে নামুন"},
"moveDownTooltip":function(d){return "প্যাডেলটি নিচের দিকে নামান।"},
"moveForward":function(d){return "সামনে এগিয়ে যান"},
"moveForwardTooltip":function(d){return "আমাকে সমনের দিকে এক ঘর সরান"},
"moveLeft":function(d){return "বামে যান"},
"moveLeftTooltip":function(d){return "প্যাডেলটি বামদিকে নিয়ে যান।"},
"moveRight":function(d){return "ডানে যান"},
"moveRightTooltip":function(d){return "প্যাডেলটি ডানদিকে সরিয়ে রাখুন।"},
"moveUp":function(d){return "উপরে উঠুন"},
"moveUpTooltip":function(d){return "প্যাডেলটি উপরে নিয়ে যান।"},
"nextLevel":function(d){return "অভিনন্দন! আপনি এই ধাঁধা সম্পন্ন করেছেন।"},
"no":function(d){return "না"},
"noPathAhead":function(d){return "পথ বন্ধ"},
"noPathLeft":function(d){return "বাঁদিকে কোন পথ নেই"},
"noPathRight":function(d){return "ডানদিকে কোন পথ নেই"},
"numBlocksNeeded":function(d){return "এই ধাঁধাটি %1 ব্লক দিয়ে সমাধান করা যেতে পারে।"},
"pathAhead":function(d){return "সামনে পথ"},
"pathLeft":function(d){return "যদি বামদিকে পথ থাকে"},
"pathRight":function(d){return "যদি ডানদিকে পথ থাকে"},
"pilePresent":function(d){return "একটি গাদা আছে"},
"playSoundCrunch":function(d){return "কড়মড়ে শব্দ বাজান"},
"playSoundGoal1":function(d){return "গোলের প্রথম শব্দ চালু করুন"},
"playSoundGoal2":function(d){return "গোলের দ্বিতীয় শব্দ চালু করুন"},
"playSoundHit":function(d){return "সফল হওয়ার শব্দ চালু করুন"},
"playSoundLosePoint":function(d){return "পয়েন্ট হারানোর শব্দ সচল করুন"},
"playSoundLosePoint2":function(d){return "পয়েন্ট হারানোর দ্বিতীয় শব্দ সচল করুন"},
"playSoundRetro":function(d){return "রেট্রো শব্দ সচল করুন"},
"playSoundRubber":function(d){return "রাবার শব্দ সচল করুন"},
"playSoundSlap":function(d){return "চড় মারার শব্দ প্লে করুন"},
"playSoundTooltip":function(d){return "নির্বাচিত শব্দটি প্লে করুন।"},
"playSoundWinPoint":function(d){return "পয়েন্ট জেতার শব্দ প্লে করুন"},
"playSoundWinPoint2":function(d){return "পয়েন্ট জেতার দ্বিতীয় শব্দ প্লে করুন"},
"playSoundWood":function(d){return "কাঠের শব্দ প্লে করুন"},
"putdownTower":function(d){return "টাওয়ার ধ্বংস করুন"},
"reinfFeedbackMsg":function(d){return "আপনি  পুনঃরাই আপনার খেলা প্লে করতে গিয়ে \"Try again\" বোতাম টিপতে পারেন."},
"removeSquare":function(d){return "বর্গ অপসারণ করুন"},
"repeatUntil":function(d){return "যতক্ষণ না পুনরাবৃত্তি"},
"repeatUntilBlocked":function(d){return "যদি সামনে পথ"},
"repeatUntilFinish":function(d){return "শেষ পর্যন্ত পুনরাবৃত্ত করুন"},
"scoreText":function(d){return "স্কোর: "+bounce_locale.v(d,"playerScore")+" : "+bounce_locale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "এলোমেলো দৃশ্য সেট করুন"},
"setBackgroundHardcourt":function(d){return "হার্ডকোর্ট দৃশ্য সেট করুন"},
"setBackgroundRetro":function(d){return "বিপরীতমুখী দৃশ্য-বিন্যাস করুন"},
"setBackgroundTooltip":function(d){return "ব্যাকগ্রাউন্ড ইমেজ সেট করে"},
"setBallRandom":function(d){return "এলোমেলো বল সেট করুন"},
"setBallHardcourt":function(d){return "হার্ডকোর্ট বল সেট করুন"},
"setBallRetro":function(d){return "বিপরীতমুখী বল সেট করুন"},
"setBallTooltip":function(d){return "বল এর ছবি সেট করে"},
"setBallSpeedRandom":function(d){return "এলোমেলো বল গতির বিন্যাস করুন"},
"setBallSpeedVerySlow":function(d){return "অতি মন্থর গতির বল সেট করুন"},
"setBallSpeedSlow":function(d){return "মন্থর গতির বল সেট করুন"},
"setBallSpeedNormal":function(d){return "স্বাভাবিক গতির বল সেট করুন"},
"setBallSpeedFast":function(d){return "দ্রুত গতির বল  বিন্যাস করুন"},
"setBallSpeedVeryFast":function(d){return "খুব দ্রুত গতির বল  বিন্যাস করুন"},
"setBallSpeedTooltip":function(d){return "বল এর গতি সেট করে"},
"setPaddleRandom":function(d){return "সেট এলোমেলো প্যাডেল"},
"setPaddleHardcourt":function(d){return "সেট হার্ডকোর্ট প্যাডেল"},
"setPaddleRetro":function(d){return "সেট বিপরীতমুখী প্যাডেল"},
"setPaddleTooltip":function(d){return "প্যাডেল এর ছবি সেট করে"},
"setPaddleSpeedRandom":function(d){return "সেট এলোমেলো প্যাডেল এর গতি"},
"setPaddleSpeedVerySlow":function(d){return "অতি মন্থর গতির প্যাডেল বিন্যাস করুন"},
"setPaddleSpeedSlow":function(d){return "ধীর গতির প্যাডেল বিন্যাস করুন"},
"setPaddleSpeedNormal":function(d){return "সাধারণ গতির প্যাডেল বিন্যাস করুন"},
"setPaddleSpeedFast":function(d){return "দ্রুত গতির প্যাডেল বিন্যাস করুন"},
"setPaddleSpeedVeryFast":function(d){return "খুব দ্রুত গতির প্যাডেল বিন্যাস করুন"},
"setPaddleSpeedTooltip":function(d){return "প্যাডেল এর গতি সেট করে"},
"shareBounceTwitter":function(d){return "চেক আউট বাউন্স গেম |মেড. |নিজেই লিখেছিলেন @codeorg"},
"shareGame":function(d){return "আপনার খেলা শেয়ার করুন:"},
"turnLeft":function(d){return "বামে যান"},
"turnRight":function(d){return "ডানে যান"},
"turnTooltip":function(d){return "আমাকে বামে বা ডানে 90 ডিগ্রী ঘুরিয়ে দেয়।"},
"whenBallInGoal":function(d){return "বলটি যখন জালে জড়াবে"},
"whenBallInGoalTooltip":function(d){return "বলটি যখন গোলপোস্টে প্রবেশ করে তখন নিচের কাজগুলো নির্বাহ করুন।"},
"whenBallMissesPaddle":function(d){return "বল যখন প্যাডেলে আঘাত করবে না"},
"whenBallMissesPaddleTooltip":function(d){return "বল যখন প্যাডেলে আঘাত করবে না তখন নিচের কাজগুলো নির্বাহ করুন।"},
"whenDown":function(d){return "নিম্নমুখী তীরচিহ্নের ক্ষেত্রে"},
"whenDownTooltip":function(d){return "নিম্নমুখী বোতামে চাপলে নিচের কাজগুলো নির্বাহ করুন।"},
"whenGameStarts":function(d){return "যখন খেলা শুরু"},
"whenGameStartsTooltip":function(d){return "যখন খেলা শুরু করে নিচে কর্ম সম্পাদন করে."},
"whenLeft":function(d){return "বাম মুখী অ্যারোর ক্ষেত্রে"},
"whenLeftTooltip":function(d){return "বাম মুখী অ্যারো বোতাম চাপলে নিচের কাজগুলো নির্বাহ করুন।"},
"whenPaddleCollided":function(d){return "বল প্যাডেলে আঘাত করলে"},
"whenPaddleCollidedTooltip":function(d){return "বল প্যাডেলে আঘাত করলে নিচের কাজগুলো নির্বাহ করুন।"},
"whenRight":function(d){return "ডান মুখী অ্যারো বোতামের ক্ষেত্রে"},
"whenRightTooltip":function(d){return "ডান মুখী অ্যারো বোতামে চাপলে নিচের কাজগুলো নির্বাহ করুন।"},
"whenUp":function(d){return "ঊর্ধ্বমুখী অ্যারো বোতাম চাপলে"},
"whenUpTooltip":function(d){return "ঊর্ধ্বমুখী অ্যারো বোতাম চাপলে নিচের কাজগুলো নির্বাহ করুন।"},
"whenWallCollided":function(d){return "দেয়ালে বল আঘাত করলে"},
"whenWallCollidedTooltip":function(d){return "বল দেয়ালে আঘাত করলে নিচের কাজগুলো নির্বাহ করুন।"},
"whileMsg":function(d){return "যখন"},
"whileTooltip":function(d){return "সমাপ্তি বিন্দুতে না পৌঁছানো পর্যন্ত ঘিরা কাজ পুনরাবৃত্তি করুন।"},
"yes":function(d){return "\"হ্যাঁ\""}};