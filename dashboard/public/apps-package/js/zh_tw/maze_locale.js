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
"atHoneycomb":function(d){return "在蜂巢"},
"atFlower":function(d){return "在花叢中"},
"avoidCowAndRemove":function(d){return "避開牛隻，並且移除1鏟泥土"},
"continue":function(d){return "繼續"},
"dig":function(d){return "移除 1"},
"digTooltip":function(d){return "移除1鏟泥土"},
"dirE":function(d){return "東"},
"dirN":function(d){return "北"},
"dirS":function(d){return "南"},
"dirW":function(d){return "西"},
"doCode":function(d){return "執行"},
"elseCode":function(d){return "否則"},
"fill":function(d){return "填充 1"},
"fillN":function(d){return "填充 "+maze_locale.v(d,"shovelfuls")},
"fillStack":function(d){return "將深度是 "+maze_locale.v(d,"shovelfuls")+" 的坑洞填滿"},
"fillSquare":function(d){return "填滿正方形"},
"fillTooltip":function(d){return "填充1鏟泥土 "},
"finalLevel":function(d){return "恭喜！你已經完成最後的關卡。"},
"flowerEmptyError":function(d){return "你所在的花朵已經沒有花蜜了"},
"get":function(d){return "取值"},
"heightParameter":function(d){return "高度"},
"holePresent":function(d){return "那裡有個坑洞"},
"honey":function(d){return "製造蜂蜜"},
"honeyAvailable":function(d){return "蜂蜜"},
"honeyTooltip":function(d){return "由花蜜製造蜂蜜"},
"honeycombFullError":function(d){return "這個蜂窩裝不下更多蜂蜜了"},
"ifCode":function(d){return "如果"},
"ifInRepeatError":function(d){return "你需要將\"如果\"程式積木放在\"重覆\"程式積木中。如果遇到困難，試著回到前一個階段看看它是如何運作的。"},
"ifPathAhead":function(d){return "如果前面有路"},
"ifTooltip":function(d){return "如果在指定的方向有路的話，就執行某些指定動作。"},
"ifelseTooltip":function(d){return "如果在指定的方向有路的話，就執行第一個程式積木的動作，否則就執行第二個程式積木的動作。"},
"ifFlowerTooltip":function(d){return "如果指定的方向有花或蜂巢，則作出一些行動。"},
"ifOnlyFlowerTooltip":function(d){return "如果在指定的方向有一朵花，就執行一些行動。"},
"ifelseFlowerTooltip":function(d){return "如果在指定方向有花朵或蜂窩，則做第一個積木的工作，否則，做第二積木的工作。\n。"},
"insufficientHoney":function(d){return "你所使用的積木都正確，但是你需要收集正確數量的蜂蜜。"},
"insufficientNectar":function(d){return "你所使用的積木都正確，但是你需要收集正確數量的花蜜。"},
"make":function(d){return "製作"},
"moveBackward":function(d){return "向後移動"},
"moveEastTooltip":function(d){return "將我向東邊移動一步。"},
"moveForward":function(d){return "向前移動"},
"moveForwardTooltip":function(d){return "將我向前移動一格"},
"moveNorthTooltip":function(d){return "將我向北邊移動一步。"},
"moveSouthTooltip":function(d){return "將我向南邊移動一步。"},
"moveTooltip":function(d){return "將我向前/向後移動一格"},
"moveWestTooltip":function(d){return "將我向西邊移動一步。"},
"nectar":function(d){return "採花蜜"},
"nectarRemaining":function(d){return "花蜜"},
"nectarTooltip":function(d){return "從花朵中採集花蜜"},
"nextLevel":function(d){return "恭喜！你已經完成這個關卡。"},
"no":function(d){return "否"},
"noPathAhead":function(d){return "路被堵住了"},
"noPathLeft":function(d){return "左邊沒有路"},
"noPathRight":function(d){return "右邊沒有路"},
"notAtFlowerError":function(d){return "您只可以在花朵採集花蜜。"},
"notAtHoneycombError":function(d){return "您只可以在蜂巢製做蜂蜜。"},
"numBlocksNeeded":function(d){return "這個關卡可以使用 %1 個程式積木來完成。"},
"pathAhead":function(d){return "前面有路"},
"pathLeft":function(d){return "如果左邊有路"},
"pathRight":function(d){return "如果右邊有路"},
"pilePresent":function(d){return "有一堆土"},
"putdownTower":function(d){return "將小土丘放下"},
"removeAndAvoidTheCow":function(d){return "移除 1 並避開牛"},
"removeN":function(d){return "移除 "+maze_locale.v(d,"shovelfuls")},
"removePile":function(d){return "移除土推"},
"removeStack":function(d){return "移除由"+maze_locale.v(d,"shovelfuls")+"鏟土堆成的小土堆"},
"removeSquare":function(d){return "移除正方型內的土堆"},
"repeatCarefullyError":function(d){return "要解決這個問題，想清楚，把兩個移動和一個轉方向放在\"重複\"積木中。最後尾有一個額外的轉方向是接受的。"},
"repeatUntil":function(d){return "重複 直到"},
"repeatUntilBlocked":function(d){return "當前面有路時"},
"repeatUntilFinish":function(d){return "重覆直到完成"},
"step":function(d){return "步驟"},
"totalHoney":function(d){return "蜂蜜總數"},
"totalNectar":function(d){return "花蜜總數"},
"turnLeft":function(d){return "向左轉"},
"turnRight":function(d){return "向右轉"},
"turnTooltip":function(d){return "將我向左或右轉90度。"},
"uncheckedCloudError":function(d){return "請務必檢查所有的雲，看看他們是不是花或蜂窩。"},
"uncheckedPurpleError":function(d){return "請務必檢查所有紫色的花，看看是否他們有花蜜"},
"whileMsg":function(d){return "當"},
"whileTooltip":function(d){return "重覆程式積木內的動作，直到完成為止。"},
"word":function(d){return "尋找那個字詞"},
"yes":function(d){return "是"},
"youSpelled":function(d){return "你併寫的"},
"didNotCollectEverything":function(d){return "Make sure you don't leave any nectar or honey behind!"}};