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
v:function(d,k){maze_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){maze_locale.c(d,k);return d[k] in p?p[d[k]]:(k=maze_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){maze_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).maze_locale = {
"atHoneycomb":function(d){return "at honeycomb"},
"atFlower":function(d){return "at flower"},
"avoidCowAndRemove":function(d){return "গরু এড়িয়ে যান এবং ১ অপসারণ করুন"},
"continue":function(d){return "চালিয়ে যান"},
"dig":function(d){return "1 অপসারণ করুন"},
"digTooltip":function(d){return "remove 1 unit of dirt"},
"dirE":function(d){return "E"},
"dirN":function(d){return "N"},
"dirS":function(d){return "S"},
"dirW":function(d){return "W"},
"doCode":function(d){return "করা"},
"elseCode":function(d){return "আর"},
"fill":function(d){return "fill 1"},
"fillN":function(d){return "fill "+maze_locale.v(d,"shovelfuls")},
"fillStack":function(d){return "fill stack of "+maze_locale.v(d,"shovelfuls")+" holes"},
"fillSquare":function(d){return "বর্গ পূরণ করুন"},
"fillTooltip":function(d){return "place 1 unit of dirt"},
"finalLevel":function(d){return "Congratulations! You have solved the final puzzle."},
"flowerEmptyError":function(d){return "The flower you're on has no more nectar."},
"get":function(d){return "প্রাপ্ত"},
"heightParameter":function(d){return "উচ্চতা"},
"holePresent":function(d){return "there is a hole"},
"honey":function(d){return "make honey"},
"honeyAvailable":function(d){return "honey"},
"honeyTooltip":function(d){return "Make honey from nectar"},
"honeycombFullError":function(d){return "This honeycomb does not have room for more honey."},
"ifCode":function(d){return "যদী"},
"ifInRepeatError":function(d){return "You need an \"if\" block inside a \"repeat\" block. If you're having trouble, try the previous level again to see how it worked."},
"ifPathAhead":function(d){return "if path ahead"},
"ifTooltip":function(d){return "If there is a path in the specified direction, then do some actions."},
"ifelseTooltip":function(d){return "If there is a path in the specified direction, then do the first block of actions. Otherwise, do the second block of actions."},
"ifFlowerTooltip":function(d){return "If there is a flower/honeycomb in the specified direction, then do some actions."},
"ifelseFlowerTooltip":function(d){return "If there is a flower/honeycomb in the specified direction, then do the first block of actions. Otherwise, do the second block of actions."},
"insufficientHoney":function(d){return "You're using all the right blocks, but you need to make the right amount of honey."},
"insufficientNectar":function(d){return "You're using all the right blocks, but you need to collect the right amount of nectar."},
"make":function(d){return "make"},
"moveBackward":function(d){return "move backward"},
"moveEastTooltip":function(d){return "Move me east one space."},
"moveForward":function(d){return "সামনে এগিয়ে যান"},
"moveForwardTooltip":function(d){return "Move me forward one space."},
"moveNorthTooltip":function(d){return "Move me north one space."},
"moveSouthTooltip":function(d){return "Move me south one space."},
"moveTooltip":function(d){return "Move me forward/backward one space"},
"moveWestTooltip":function(d){return "Move me west one space."},
"nectar":function(d){return "get nectar"},
"nectarRemaining":function(d){return "nectar"},
"nectarTooltip":function(d){return "Get nectar from a flower"},
"nextLevel":function(d){return "অভিনন্দন! আপনি এই ধাঁধা সম্পন্ন করেছেন।"},
"no":function(d){return "না"},
"noPathAhead":function(d){return "path is blocked"},
"noPathLeft":function(d){return "no path to the left"},
"noPathRight":function(d){return "no path to the right"},
"notAtFlowerError":function(d){return "You can only get nectar from a flower."},
"notAtHoneycombError":function(d){return "You can only make honey at a honeycomb."},
"numBlocksNeeded":function(d){return "This puzzle can be solved with %1 blocks."},
"pathAhead":function(d){return "সামনে পথ"},
"pathLeft":function(d){return "যদি বামদিকে পথ থাকে"},
"pathRight":function(d){return "if path to the right"},
"pilePresent":function(d){return "there is a pile"},
"putdownTower":function(d){return "put down tower"},
"removeAndAvoidTheCow":function(d){return "remove 1 and avoid the cow"},
"removeN":function(d){return "remove "+maze_locale.v(d,"shovelfuls")},
"removePile":function(d){return "remove pile"},
"removeStack":function(d){return "remove stack of "+maze_locale.v(d,"shovelfuls")+" piles"},
"removeSquare":function(d){return "remove square"},
"repeatCarefullyError":function(d){return "To solve this, think carefully about the pattern of two moves and one turn to put in the \"repeat\" block.  It's okay to have an extra turn at the end."},
"repeatUntil":function(d){return "যতক্ষণ না পুনরাবৃত্তি"},
"repeatUntilBlocked":function(d){return "যদি সামনে পথ"},
"repeatUntilFinish":function(d){return "শেষ পর্যন্ত পুনরাবৃত্ত করুন"},
"step":function(d){return "Step"},
"totalHoney":function(d){return "total honey"},
"totalNectar":function(d){return "total nectar"},
"turnLeft":function(d){return "বামে যান"},
"turnRight":function(d){return "ডানে যান"},
"turnTooltip":function(d){return "Turns me left or right by 90 degrees."},
"uncheckedCloudError":function(d){return "Make sure to check all clouds to see if they're flowers or honeycombs."},
"uncheckedPurpleError":function(d){return "Make sure to check all purple flowers to see if they have nectar"},
"whileMsg":function(d){return "যখন"},
"whileTooltip":function(d){return "Repeat the enclosed actions until finish point is reached."},
"word":function(d){return "Find the word"},
"yes":function(d){return "\"হ্যাঁ\""},
"youSpelled":function(d){return "You spelled"}};