var appLocale = {lc:{"ar":function(n){
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
v:function(d,k){appLocale.c(d,k);return d[k]},
p:function(d,k,o,l,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:(k=appLocale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).appLocale = {
"atHoneycomb":function(d){return "at honeycomb"},
"atFlower":function(d){return "at flower"},
"avoidCowAndRemove":function(d){return "avoid the cow and remove 1"},
"continue":function(d){return "ต่อไป\n"},
"dig":function(d){return "remove 1"},
"digTooltip":function(d){return "remove 1 unit of dirt"},
"dirE":function(d){return "E"},
"dirN":function(d){return "N"},
"dirS":function(d){return "S"},
"dirW":function(d){return "W"},
"doCode":function(d){return "ทำ"},
"elseCode":function(d){return "นอกจากนั้น"},
"fill":function(d){return "fill 1"},
"fillN":function(d){return "fill "+appLocale.v(d,"shovelfuls")},
"fillStack":function(d){return "fill stack of "+appLocale.v(d,"shovelfuls")+" holes"},
"fillSquare":function(d){return "fill square"},
"fillTooltip":function(d){return "place 1 unit of dirt"},
"finalLevel":function(d){return "ขอแสดงความยินดีคุณสามารถแก้ปัญหาสุดท้ายได้แล้ว."},
"flowerEmptyError":function(d){return "The flower you're on has no more nectar."},
"get":function(d){return "ได้รับ"},
"heightParameter":function(d){return "ความสูง"},
"holePresent":function(d){return "there is a hole"},
"honey":function(d){return "make honey"},
"honeyAvailable":function(d){return "honey"},
"honeyTooltip":function(d){return "Make honey from nectar"},
"honeycombFullError":function(d){return "This honeycomb does not have room for more honey."},
"ifCode":function(d){return "ถ้า"},
"ifInRepeatError":function(d){return "You need an \"if\" block inside a \"repeat\" block. If you're having trouble, try the previous level again to see how it worked."},
"ifPathAhead":function(d){return "ถ้าเป็นทางข้างหน้า"},
"ifTooltip":function(d){return "ถ้ามีเส้นทางในทิศที่กำหนด ให้กระทำบางอย่าง"},
"ifelseTooltip":function(d){return "ถ้ามีเส้นทางในทิศที่กำหนด ให้กระทำในบล็อกแรก มิเช่นนั้น ให้กระทำในบล็อกที่สอง"},
"ifFlowerTooltip":function(d){return "ถ้ามีดอกไม้/รังผึ้งในทิศที่กำหนด ให้กระทำบางอย่าง"},
"ifelseFlowerTooltip":function(d){return "If there is a flower/honeycomb in the specified direction, then do the first block of actions. Otherwise, do the second block of actions."},
"insufficientHoney":function(d){return "You're using all the right blocks, but you need to make the right amount of honey."},
"insufficientNectar":function(d){return "You're using all the right blocks, but you need to collect the right amount of nectar."},
"make":function(d){return "make"},
"moveBackward":function(d){return "เดินไปข้างหน้า"},
"moveEastTooltip":function(d){return "พาฉันเดินไปทิศตะวันออกหนึ่งช่อง"},
"moveForward":function(d){return "เดินไปข้างหน้า"},
"moveForwardTooltip":function(d){return "พาฉันเดินข้างหน้าไปหนึ่งช่อง"},
"moveNorthTooltip":function(d){return "พาฉันเดินไปทิศเหนือหนึ่งช่อง"},
"moveSouthTooltip":function(d){return "พาฉันเดินไปทิศใต้หนึ่งช่อง"},
"moveTooltip":function(d){return "พาฉันเดินข้างหน้า/ถอยหลังไปหนึ่งช่อง"},
"moveWestTooltip":function(d){return "พาฉันเดินไปทิศตะวันตกหนึ่งช่อง"},
"nectar":function(d){return "รับน้ำหวาน"},
"nectarRemaining":function(d){return "น้ำหวาน"},
"nectarTooltip":function(d){return "รับน้ำหวานจากดอกไม้"},
"nextLevel":function(d){return "ขอแสดงความยินดีคุณสำเร็จปริศนานี้."},
"no":function(d){return "ไม่ใช่"},
"noPathAhead":function(d){return "เส้นทางถูกบล็อก"},
"noPathLeft":function(d){return "ไม่มีเส้นทางไปทางซ้าย"},
"noPathRight":function(d){return "ไม่มีเส้นทางไปทางขวา"},
"notAtFlowerError":function(d){return "คุณสามารถรับน้ำหวานจากดอกไม้เท่านั้น"},
"notAtHoneycombError":function(d){return "You can only make honey at a honeycomb."},
"numBlocksNeeded":function(d){return "ปริศนานี้สามารถแก้ได้เพียงแค่ %1 บล็อกเท่านั้นเอง"},
"pathAhead":function(d){return "เส้นทางข้างหน้า"},
"pathLeft":function(d){return "ถ้าเส้นทางไปทางซ้าย"},
"pathRight":function(d){return "ถ้าเส้นทางไปทางขวา"},
"pilePresent":function(d){return "there is a pile"},
"putdownTower":function(d){return "put down tower"},
"removeAndAvoidTheCow":function(d){return "remove 1 and avoid the cow"},
"removeN":function(d){return "remove "+appLocale.v(d,"shovelfuls")},
"removePile":function(d){return "remove pile"},
"removeStack":function(d){return "remove stack of "+appLocale.v(d,"shovelfuls")+" piles"},
"removeSquare":function(d){return "remove square"},
"repeatCarefullyError":function(d){return "To solve this, think carefully about the pattern of two moves and one turn to put in the \"repeat\" block.  It's okay to have an extra turn at the end."},
"repeatUntil":function(d){return "ทำซ้ำจนกว่า"},
"repeatUntilBlocked":function(d){return "ขณะที่ยังมีทางข้างหน้า"},
"repeatUntilFinish":function(d){return "repeat until finish"},
"step":function(d){return "Step"},
"totalHoney":function(d){return "total honey"},
"totalNectar":function(d){return "total nectar"},
"turnLeft":function(d){return "เลี้ยวซ้าย"},
"turnRight":function(d){return "เลี้ยวขวา"},
"turnTooltip":function(d){return "หันตัวเราไปทางซ้ายหรือขวา 90 องศา"},
"uncheckedCloudError":function(d){return "Make sure to check all clouds to see if they're flowers or honeycombs."},
"uncheckedPurpleError":function(d){return "Make sure to check all purple flowers to see if they have nectar"},
"whileMsg":function(d){return "ในขณะที่"},
"whileTooltip":function(d){return "ทำซ้ำจนกระทั่งถึงจุดสิ้นสุด"},
"word":function(d){return "Find the word"},
"yes":function(d){return "ใช่"},
"youSpelled":function(d){return "You spelled"}};