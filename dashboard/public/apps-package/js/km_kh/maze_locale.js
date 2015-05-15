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
"atHoneycomb":function(d){return "នៅ​សំបុក​ឃ្មុំ"},
"atFlower":function(d){return "នៅ​ផ្កា"},
"avoidCowAndRemove":function(d){return "ចៀស​គោ ហើយ​ដក​ចេញ 1"},
"continue":function(d){return "បន្ត"},
"dig":function(d){return "ដក​ចេញ 1"},
"digTooltip":function(d){return "ដក​ដី​ចេញ 1 ដុំ"},
"dirE":function(d){return "ខាងកើត"},
"dirN":function(d){return "ខាងជើង"},
"dirS":function(d){return "ខាងត្បូង"},
"dirW":function(d){return "ខាងលិច"},
"doCode":function(d){return "ធ្វើ"},
"elseCode":function(d){return "បើ​មិន​អ៊ីចឹង​ទេ"},
"fill":function(d){return "ចាក់​បំពេញ 1"},
"fillN":function(d){return "ចាក់​បំពេញ "+maze_locale.v(d,"shovelfuls")},
"fillStack":function(d){return "fill stack of "+maze_locale.v(d,"shovelfuls")+" holes"},
"fillSquare":function(d){return "fill square"},
"fillTooltip":function(d){return "ដាក់​ដី 1 ដុំ"},
"finalLevel":function(d){return "សូម​អបអរសាទរ! អ្នក​បាន​បញ្ចប់​ល្បែង​ប្រាជ្ញា​ចុង​ក្រោយ​ហើយ។"},
"flowerEmptyError":function(d){return "The flower you're on has no more nectar."},
"get":function(d){return "យក"},
"heightParameter":function(d){return "កម្ពស់"},
"holePresent":function(d){return "មាន​រន្ធ​មួយ"},
"honey":function(d){return "ផលិត​ទឹកឃ្មុំ"},
"honeyAvailable":function(d){return "ទឹកឃ្មុំ"},
"honeyTooltip":function(d){return "ផលិត​ទឹកឃ្មុំ​ពី​លម្អង​ផ្កា"},
"honeycombFullError":function(d){return "សំបុកឃ្មុំ​នេះ​លែង​មាន​កន្លែង​ទំនេរ​សម្រាប់​ផ្ទុក​ទឹកឃ្មុំ​ទៀត​ហើយ។"},
"ifCode":function(d){return "ប្រសិន​បើ"},
"ifInRepeatError":function(d){return "អ្នក​ត្រូវការ​ប្លុក \"បើ\" នៅ​ក្នុង​ប្លុក \"ធ្វើ​ឡើង​វិញ\"។ ប្រសិន​បើ​អ្នក​ជួប​បញ្ហា សូម​សាកល្បង​កម្រិត​មុន​ម្ដង​ទៀត ដើម្បី​មើល​ថា​វា​ដើរ​យ៉ាង​ដូច​ម្ដេច។"},
"ifPathAhead":function(d){return "បើផ្លូវខាងមុខ"},
"ifTooltip":function(d){return "If there is a path in the specified direction, then do some actions."},
"ifelseTooltip":function(d){return "If there is a path in the specified direction, then do the first block of actions. Otherwise, do the second block of actions."},
"ifFlowerTooltip":function(d){return "If there is a flower/honeycomb in the specified direction, then do some actions."},
"ifelseFlowerTooltip":function(d){return "If there is a flower/honeycomb in the specified direction, then do the first block of actions. Otherwise, do the second block of actions."},
"insufficientHoney":function(d){return "You're using all the right blocks, but you need to make the right amount of honey."},
"insufficientNectar":function(d){return "You're using all the right blocks, but you need to collect the right amount of nectar."},
"make":function(d){return "ផលិត"},
"moveBackward":function(d){return "ថយ​ក្រោយ"},
"moveEastTooltip":function(d){return "Move me east one space."},
"moveForward":function(d){return "move forward"},
"moveForwardTooltip":function(d){return "Move me forward one space."},
"moveNorthTooltip":function(d){return "Move me north one space."},
"moveSouthTooltip":function(d){return "Move me south one space."},
"moveTooltip":function(d){return "Move me forward/backward one space"},
"moveWestTooltip":function(d){return "Move me west one space."},
"nectar":function(d){return "យក​លម្អង"},
"nectarRemaining":function(d){return "លម្អង"},
"nectarTooltip":function(d){return "យក​លម្អង​ពី​ផ្កា​មួយ"},
"nextLevel":function(d){return "សូម​អបអរ​សាទរ! អ្នក​បាន​បញ្ចប់​ល្បែង​ប្រាជ្ញា​នេះ​ហើយ។"},
"no":function(d){return "ទេ"},
"noPathAhead":function(d){return "ផ្លូវ​ត្រូវ​បាន​ឃាំង"},
"noPathLeft":function(d){return "គ្មាន​ផ្លូវ​ទៅ​ឆ្វេង​ទេ"},
"noPathRight":function(d){return "គ្មាន​ផ្លូវ​ទៅ​ស្ដាំ​ទេ"},
"notAtFlowerError":function(d){return "អ្នក​អាច​យក​លម្អង​បាន​តែ​ពី​ផ្កា​ប៉ុណ្ណោះ។"},
"notAtHoneycombError":function(d){return "អ្នក​អាច​ផលិត​ទឹកឃ្មុំ​បាន​តែ​នៅ​សំបុកឃ្មុំ​ប៉ុណ្ណោះ។"},
"numBlocksNeeded":function(d){return "ល្បែង​ប្រាជ្ញា​នេះ​អាច​ត្រូវ​បាន​ដោះស្រាយ​ជាមួយ​ប្លុក​ចំនួន %1 ។"},
"pathAhead":function(d){return "ផ្លូវ​ខាង​មុខ"},
"pathLeft":function(d){return "ប្រសិន​បើ​មាន​ផ្លូវ​ទៅ​ឆ្វេង"},
"pathRight":function(d){return "ប្រសិន​បើ​មាន​ផ្លូវ​ទៅ​ស្ដាំ"},
"pilePresent":function(d){return "មាន​ពំនូក​មួយ"},
"putdownTower":function(d){return "put down tower"},
"removeAndAvoidTheCow":function(d){return "ដក​ចេញ 1 ហើយ​ចៀស​ពី​គោ"},
"removeN":function(d){return "ដក​ចេញ "+maze_locale.v(d,"shovelfuls")},
"removePile":function(d){return "យក​ពំនូក​ចេញ"},
"removeStack":function(d){return "remove stack of "+maze_locale.v(d,"shovelfuls")+" piles"},
"removeSquare":function(d){return "remove square"},
"repeatCarefullyError":function(d){return "To solve this, think carefully about the pattern of two moves and one turn to put in the \"repeat\" block.  It's okay to have an extra turn at the end."},
"repeatUntil":function(d){return "ធ្វើ​ឡើង​វិញ​រហូត​ដល់"},
"repeatUntilBlocked":function(d){return "នៅ​ពេល​មាន​ផ្លូវ​ខាង​មុខ"},
"repeatUntilFinish":function(d){return "ធ្វើ​រហូត​ដល់​ចប់"},
"step":function(d){return "ជំហាន"},
"totalHoney":function(d){return "ទឹកឃ្មុំ​សរុប"},
"totalNectar":function(d){return "លម្អង​សរុប"},
"turnLeft":function(d){return "បត់​ឆ្វេង"},
"turnRight":function(d){return "បត់​ស្ដាំ"},
"turnTooltip":function(d){return "បង្វិល​ខ្ញុំ​ទៅ​ឆ្វេង​ឬ​ស្ដាំ 90 ដឺក្រេ។"},
"uncheckedCloudError":function(d){return "Make sure to check all clouds to see if they're flowers or honeycombs."},
"uncheckedPurpleError":function(d){return "Make sure to check all purple flowers to see if they have nectar"},
"whileMsg":function(d){return "នៅ​ពេល"},
"whileTooltip":function(d){return "Repeat the enclosed actions until finish point is reached."},
"word":function(d){return "ស្វែងរក​ពាក្យ"},
"yes":function(d){return "យល់ព្រម"},
"youSpelled":function(d){return "អ្នក​បាន​ប្រកប"}};