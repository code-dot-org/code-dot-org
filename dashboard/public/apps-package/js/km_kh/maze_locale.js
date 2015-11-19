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
"fill":function(d){return "​បំពេញ ១"},
"fillN":function(d){return "​បំពេញ "+maze_locale.v(d,"shovelfuls")},
"fillStack":function(d){return "​បំពេញ​គំនរ "+maze_locale.v(d,"shovelfuls")+"​ ប្រហោង"},
"fillSquare":function(d){return "​បំពេញ​ការេ"},
"fillTooltip":function(d){return "ដាក់​ដី 1 ដុំ"},
"finalLevel":function(d){return "សូម​អបអរសាទរ! អ្នក​បាន​បញ្ចប់​ល្បែង​ប្រាជ្ញា​ចុង​ក្រោយ​ហើយ។"},
"flowerEmptyError":function(d){return "ផ្កា​ដែល​អ្នក​កំពុង​យក លែង​មាន​លម្អងហើយ"},
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
"ifTooltip":function(d){return "ប្រ​សិន​បើ មាន​ផ្លូវ​ក្នុង​ទិស​ដៅ​កំ​ណត់​ណា​មួយ នោះ​ចូរ​ធ្វើ​សកម្ម​ភាព​ណា​មួយ"},
"ifelseTooltip":function(d){return "ប្រ​សិន​បើ មាន​ផ្លូវ​ក្នុង​ទិស​ដៅ​កំ​ណត់​ណា​មួយ នោះ​ចូរ​ធ្វើ​បណ្ដុំ​សកម្ម​ភាព​ទី​មួយ។ បើ​មិន​ពុំ​នោះទេ ចូរធ្វើ​បណ្ដុំ​នៃ​សកម្ម​ភាពទីពីរ"},
"ifFlowerTooltip":function(d){return "ប្រសិន​បើ​មាន​ ផ្កា រឺ​សំបុក​ឃ្មុំ នៅក្នុង​ទិស​ដៅ​ដែល​បាន​កំណត់​ នោះ​ធ្វើ​សកម្ម​ភាព​អ្វី​ម្យ៉ាង"},
"ifOnlyFlowerTooltip":function(d){return "ប្រសិន​បើ​មាន​ ផ្កា នៅក្នុង​ទិស​ដៅ​ដែល​បាន​កំណត់​ នោះ​ធ្វើ​សកម្ម​ភាព​អ្វី​ម្យ៉ាង"},
"ifelseFlowerTooltip":function(d){return "ប្រសិន​បើ​មាន​ ផ្កា រឺ​សំបុក​ឃ្មុំ នៅក្នុង​ទិស​ដៅ​ដែល​បាន​កំណត់​ នោះ​ធ្វើ​សកម្ម​ភាព​អ្វី​ម្យ៉ាង។ បើ​មិន​ពុំ​នោះទេ ចូរធ្វើ​ប្លុក​​នៃ​សកម្ម​ភាពទីពីរ"},
"insufficientHoney":function(d){return "អ្នក​បាន​ប្រើ​ប្លុក​​ត្រូវ​​អស់​ហើយ ប៉ុន្តែ​អ្នក​ត្រូវ​ការ​ប្រមូល​​ទឹក​ឃ្មុំ​អោយ​ត្រូវ​ចំនួន។"},
"insufficientNectar":function(d){return "អ្នក​បាន​ប្រើ​ប្លុក​ត្រូវ​អស់​ហើយ ប៉ុន្តែ​អ្នក​ត្រូវ​ការ​ប្រមូល​​លម្អង​អោយ​ត្រូវ​ចំនួន។"},
"make":function(d){return "ធ្វើ"},
"moveBackward":function(d){return "ថយ​ក្រោយ"},
"moveEastTooltip":function(d){return "រំកិល​ខ្ញុំ​ទៅខាង​កើត​​ មួយចន្លោះ"},
"moveForward":function(d){return "រំកិល​ទៅមុខ"},
"moveForwardTooltip":function(d){return "រំកិល​ខ្ញុំ​ទៅ​មុខ​មួយ​ចន្លោះ"},
"moveNorthTooltip":function(d){return "រំកិល​ខ្ញុំ​ទៅ​ខាង​ជើង​មួយ​ចន្លោះ"},
"moveSouthTooltip":function(d){return "រំកិល​ខ្ញុំ​ទៅ​ខាង​ជើង​មួយ​ចន្លោះ."},
"moveTooltip":function(d){return "រំកិល​ខ្ញុំ​ទៅ​មុខ រឺ​ទៅ​ក្រោយ​មួយ​ចន្លោះ"},
"moveWestTooltip":function(d){return "រំកិល​ខ្ញុំ​ទៅ​ខាង​លិច​មួយ​ចន្លោះ"},
"nectar":function(d){return "យក​លម្អង"},
"nectarRemaining":function(d){return "លម្អង"},
"nectarTooltip":function(d){return "យក​លម្អង​ពី​ផ្កា​"},
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
"putdownTower":function(d){return "ដាក់​ពំនូក​ចុះ"},
"removeAndAvoidTheCow":function(d){return "ដក​ចេញ 1 ហើយ​ចៀស​ពី​គោ"},
"removeN":function(d){return "ដក​ចេញ "+maze_locale.v(d,"shovelfuls")},
"removePile":function(d){return "យក​ពំនូក​ចេញ"},
"removeStack":function(d){return "យក​ "+maze_locale.v(d,"shovelfuls")+"​ ពំនូក​គំនរ​ចេញ"},
"removeSquare":function(d){return "ដក​ ការេ​​ ចេញ"},
"repeatCarefullyError":function(d){return "ដើម្បី​ដោះ​ស្រាយ​បញ្ហានេះ ចូរ​គិត​អោយ​ល្អិត​ពី​ការ​ប្រើគំរូ​ ផ្លាស់​ទី​២ និង​បត់​១ ដើម្បី​ដាក់​ក្នុង​ ប្លុក​ការ​ធ្វើឡើង​វិញ។ វា​ជា​រឿង​ធម្មតា​ដែល​មាន​ការ​បត់​ច្រើន​ហួស​នៅ​ទី​បញ្ចប់។"},
"repeatUntil":function(d){return "ធ្វើ​ឡើង​វិញ​រហូត​ដល់"},
"repeatUntilBlocked":function(d){return "នៅ​ពេល​មាន​ផ្លូវ​ខាង​មុខ"},
"repeatUntilFinish":function(d){return "ធ្វើ​រហូត​ដល់​ចប់"},
"step":function(d){return "ជំហាន"},
"totalHoney":function(d){return "ទឹកឃ្មុំ​សរុប"},
"totalNectar":function(d){return "លម្អង​សរុប"},
"turnLeft":function(d){return "បត់​ឆ្វេង"},
"turnRight":function(d){return "បត់​ស្ដាំ"},
"turnTooltip":function(d){return "បង្វិល​ខ្ញុំ​ទៅ​ឆ្វេង​ឬ​ស្ដាំ 90 ដឺក្រេ។"},
"uncheckedCloudError":function(d){return "ផ្ទៀង​ផ្ទាត់​អោយ​ល្អ​ថា​អ្នក​បាន​ពិនិត្យ​រាល់​ដំុ​ពពក​ ដើម្បី​មើល​ថា​ពួក​វា​ជា​ផ្កា ឬ​សំបុក​ឃ្មុំ"},
"uncheckedPurpleError":function(d){return "ផ្ទៀង​ផ្ទាត់​អោយ​ល្អ​រាល់​ផ្កា​ពណ័​ស្វាយ​ ដើម្បី​មើល​ថា​ពួក​វា​មាន​លម្អងឬអត់"},
"whileMsg":function(d){return "នៅ​ពេល"},
"whileTooltip":function(d){return "ធ្វើ​រាល់​សកម្មភាព​ដែល​មាន​នៅ​ក្នុង​អនុគមន៍​រហូត​ដល់​លក្ខខណ្ឌ​បញ្ចប់​មក​ដល់"},
"word":function(d){return "ស្វែងរក​ពាក្យ"},
"yes":function(d){return "យល់ព្រម"},
"youSpelled":function(d){return "អ្នក​បាន​ប្រកប"}};