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
"atHoneycomb":function(d){return "মধুর চাকে"},
"atFlower":function(d){return "ফুলের কাছে"},
"avoidCowAndRemove":function(d){return "গরু এড়িয়ে যান এবং ১ অপসারণ করুন"},
"continue":function(d){return "চালিয়ে যান"},
"dig":function(d){return "1 অপসারণ করুন"},
"digTooltip":function(d){return "1 একক গোবর অপসারণ করুন"},
"dirE":function(d){return "E"},
"dirN":function(d){return "N"},
"dirS":function(d){return "S"},
"dirW":function(d){return "W"},
"doCode":function(d){return "করা"},
"elseCode":function(d){return "আর"},
"fill":function(d){return "1 পূরণ করুন"},
"fillN":function(d){return maze_locale.v(d,"shovelfuls")+" পুরন করুন"},
"fillStack":function(d){return "fill stack of "+maze_locale.v(d,"shovelfuls")+" holes"},
"fillSquare":function(d){return "বর্গ পূরণ করুন"},
"fillTooltip":function(d){return "১ একক ময়লা স্থাপন করুন"},
"finalLevel":function(d){return "অভিনন্দন! আপনি শেষ ধাঁধা সমাধান করছেন।"},
"flowerEmptyError":function(d){return "আপনি ভ্রমণরত ফুল আর কোন পুষ্পমধু নেই।"},
"get":function(d){return "প্রাপ্ত"},
"heightParameter":function(d){return "উচ্চতা"},
"holePresent":function(d){return "সেখানে একটি গর্ত আছে।"},
"honey":function(d){return "মধু তৈরি করুন"},
"honeyAvailable":function(d){return "মধু"},
"honeyTooltip":function(d){return "পুষ্পমধু থেকে মধু করুন"},
"honeycombFullError":function(d){return "এই মৌচাকে আর মধু জন্য কোন জায়গা নাই।"},
"ifCode":function(d){return "যদী"},
"ifInRepeatError":function(d){return "You need an \"if\" block inside a \"repeat\" block. If you're having trouble, try the previous level again to see how it worked."},
"ifPathAhead":function(d){return "যদি সামনে পথ থাকে"},
"ifTooltip":function(d){return "একটি নির্দিষ্ট দিক যদি রাস্তা থাকে, তাহলে কিছু কাজ করুন।"},
"ifelseTooltip":function(d){return "If there is a path in the specified direction, then do the first block of actions. Otherwise, do the second block of actions."},
"ifFlowerTooltip":function(d){return "If there is a flower/honeycomb in the specified direction, then do some actions."},
"ifOnlyFlowerTooltip":function(d){return "If there is a flower in the specified direction, then do some actions."},
"ifelseFlowerTooltip":function(d){return "If there is a flower/honeycomb in the specified direction, then do the first block of actions. Otherwise, do the second block of actions."},
"insufficientHoney":function(d){return "You're using all the right blocks, but you need to make the right amount of honey."},
"insufficientNectar":function(d){return "You're using all the right blocks, but you need to collect the right amount of nectar."},
"make":function(d){return "তৈরি করা"},
"moveBackward":function(d){return "পেছনে চলুন"},
"moveEastTooltip":function(d){return "আমাকে পূর্ব দিকে এক ঘর স্থানান্তর করুন"},
"moveForward":function(d){return "সামনে এগিয়ে যান"},
"moveForwardTooltip":function(d){return "আমাকে সমনের দিকে এক ঘর সরান"},
"moveNorthTooltip":function(d){return "আমাকে উত্তর দিকে এক ঘর সরান"},
"moveSouthTooltip":function(d){return "আমাকে দক্ষিণ দিকে এক ঘর স্থানান্তর করুন"},
"moveTooltip":function(d){return "আমাকে সমনের বা পেছনে দিকে এক ঘর সরান"},
"moveWestTooltip":function(d){return "আমাকে পশ্চিম দিকে এক ঘর সরান"},
"nectar":function(d){return "পুষ্পমধু নিন"},
"nectarRemaining":function(d){return "পুষ্পমধু "},
"nectarTooltip":function(d){return "একটি ফুল থেকে পুষ্পমধু নিন"},
"nextLevel":function(d){return "অভিনন্দন! আপনি এই ধাঁধা সম্পন্ন করেছেন।"},
"no":function(d){return "না"},
"noPathAhead":function(d){return "পথ বন্ধ"},
"noPathLeft":function(d){return "বাঁদিকে কোন পথ নেই"},
"noPathRight":function(d){return "ডানদিকে কোন পথ নেই"},
"notAtFlowerError":function(d){return "You can only get nectar from a flower."},
"notAtHoneycombError":function(d){return "You can only make honey at a honeycomb."},
"numBlocksNeeded":function(d){return "This puzzle can be solved with %1 blocks."},
"pathAhead":function(d){return "সামনে পথ"},
"pathLeft":function(d){return "যদি বামদিকে পথ থাকে"},
"pathRight":function(d){return "যদি ডানদিকে পথ থাকে"},
"pilePresent":function(d){return "একটি গাদা আছে"},
"putdownTower":function(d){return "টাওয়ার ধ্বংস করুন"},
"removeAndAvoidTheCow":function(d){return "১টি সরান এবং গাভী এড়ান"},
"removeN":function(d){return "সরান "+maze_locale.v(d,"shovelfuls")},
"removePile":function(d){return "গাদা সারনো"},
"removeStack":function(d){return "খড়ের "+maze_locale.v(d,"shovelfuls")+" গাদা অপসারণ করুন"},
"removeSquare":function(d){return "বর্গ অপসারণ করুন"},
"repeatCarefullyError":function(d){return "To solve this, think carefully about the pattern of two moves and one turn to put in the \"repeat\" block.  It's okay to have an extra turn at the end."},
"repeatUntil":function(d){return "যতক্ষণ না পুনরাবৃত্তি"},
"repeatUntilBlocked":function(d){return "যদি সামনে পথ"},
"repeatUntilFinish":function(d){return "শেষ পর্যন্ত পুনরাবৃত্ত করুন"},
"step":function(d){return "ধাপ"},
"totalHoney":function(d){return "মোট মধু"},
"totalNectar":function(d){return "মোট পুষ্পমধু"},
"turnLeft":function(d){return "বামে যান"},
"turnRight":function(d){return "ডানে যান"},
"turnTooltip":function(d){return "Turns me left or right by 90 degrees."},
"uncheckedCloudError":function(d){return "Make sure to check all clouds to see if they're flowers or honeycombs."},
"uncheckedPurpleError":function(d){return "Make sure to check all purple flowers to see if they have nectar"},
"whileMsg":function(d){return "যখন"},
"whileTooltip":function(d){return "Repeat the enclosed actions until finish point is reached."},
"word":function(d){return "শব্দটি খুঁজুন"},
"yes":function(d){return "\"হ্যাঁ\""},
"youSpelled":function(d){return "আপনি বানান করেছেন"}};