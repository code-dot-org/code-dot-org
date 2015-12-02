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
"bounceBall":function(d){return "弹跳球"},
"bounceBallTooltip":function(d){return "把球从一个物体弹开"},
"continue":function(d){return "继续"},
"dirE":function(d){return "东"},
"dirN":function(d){return "北"},
"dirS":function(d){return "南"},
"dirW":function(d){return "西"},
"doCode":function(d){return "执行"},
"elseCode":function(d){return "否则"},
"finalLevel":function(d){return "恭喜你！你完成了最后一个谜题。"},
"heightParameter":function(d){return "高度"},
"ifCode":function(d){return "如果"},
"ifPathAhead":function(d){return "如果前面有路"},
"ifTooltip":function(d){return "如果在指定的方向有路，执行一些操作。"},
"ifelseTooltip":function(d){return "如果在指定的方向有路，执行第一部分的操作。否则，执行第二部分的操作。"},
"incrementOpponentScore":function(d){return "对手的得分点"},
"incrementOpponentScoreTooltip":function(d){return "给对手增加一分"},
"incrementPlayerScore":function(d){return "得分点"},
"incrementPlayerScoreTooltip":function(d){return "在玩家现有分数上加一分"},
"isWall":function(d){return "这是一堵墙吗"},
"isWallTooltip":function(d){return "如果这里有一堵墙，返回真"},
"launchBall":function(d){return "推出新球"},
"launchBallTooltip":function(d){return "启动一个球开始发挥作用。"},
"makeYourOwn":function(d){return "制作自己的弹跳球游戏"},
"moveDown":function(d){return "向下移动"},
"moveDownTooltip":function(d){return "把球拍向下移动"},
"moveForward":function(d){return "向前移动"},
"moveForwardTooltip":function(d){return "把我向前移动一格。"},
"moveLeft":function(d){return "向左移动"},
"moveLeftTooltip":function(d){return "把球拍向左移动"},
"moveRight":function(d){return "向右移动"},
"moveRightTooltip":function(d){return "把球拍向右移动"},
"moveUp":function(d){return "向上移动"},
"moveUpTooltip":function(d){return "把球拍向上移动"},
"nextLevel":function(d){return "恭喜你！你解决了这个谜题。"},
"no":function(d){return "不"},
"noPathAhead":function(d){return "路被堵上了"},
"noPathLeft":function(d){return "左边没有路"},
"noPathRight":function(d){return "右边没有路"},
"numBlocksNeeded":function(d){return "这个谜题可以用%1个语句块解决。"},
"pathAhead":function(d){return "前面有路"},
"pathLeft":function(d){return "如果左边有路"},
"pathRight":function(d){return "如果右边有路"},
"pilePresent":function(d){return "有一堆土"},
"playSoundCrunch":function(d){return "播放吱嘎声"},
"playSoundGoal1":function(d){return "播放目标 1 声音"},
"playSoundGoal2":function(d){return "播放目标 2 的声音"},
"playSoundHit":function(d){return "播放命中的声音"},
"playSoundLosePoint":function(d){return "播放失去点数的声音"},
"playSoundLosePoint2":function(d){return "播放失去点数2的声音"},
"playSoundRetro":function(d){return "播放复古的声音。"},
"playSoundRubber":function(d){return "播放橡胶的声音"},
"playSoundSlap":function(d){return "播放巴掌的声音"},
"playSoundTooltip":function(d){return "播放所选声音"},
"playSoundWinPoint":function(d){return "播放赢得点数的声音"},
"playSoundWinPoint2":function(d){return "播放赢得点数的声音2"},
"playSoundWood":function(d){return "播放木的声音"},
"putdownTower":function(d){return "放下塔"},
"reinfFeedbackMsg":function(d){return "你可以按“重试”按钮来返回你的游戏"},
"removeSquare":function(d){return "移除正方形"},
"repeatUntil":function(d){return "重复直到"},
"repeatUntilBlocked":function(d){return "当前面有路"},
"repeatUntilFinish":function(d){return "重复直到完成"},
"scoreText":function(d){return "积分: "+bounce_locale.v(d,"playerScore")+": "+bounce_locale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "设置随机的场景"},
"setBackgroundHardcourt":function(d){return "设置为硬地场景"},
"setBackgroundRetro":function(d){return "设置为复古场景"},
"setBackgroundTooltip":function(d){return "设置背景图案"},
"setBallRandom":function(d){return "设置随机弹球"},
"setBallHardcourt":function(d){return "设置为硬地场球"},
"setBallRetro":function(d){return "设置为复古弹球"},
"setBallTooltip":function(d){return "设置球图像"},
"setBallSpeedRandom":function(d){return "设置随机小球速度\n"},
"setBallSpeedVerySlow":function(d){return "设置很慢的球的速度"},
"setBallSpeedSlow":function(d){return "设置较慢球的速度"},
"setBallSpeedNormal":function(d){return "设置普通球速度"},
"setBallSpeedFast":function(d){return "设置快速的球的速度"},
"setBallSpeedVeryFast":function(d){return "设置非常快速的球的速度"},
"setBallSpeedTooltip":function(d){return "设置弹球的速度"},
"setPaddleRandom":function(d){return "设置为随机球拍"},
"setPaddleHardcourt":function(d){return "设置为硬地球拍"},
"setPaddleRetro":function(d){return "设置复古的球拍"},
"setPaddleTooltip":function(d){return "设置的桨图像"},
"setPaddleSpeedRandom":function(d){return "设置随机球拍速度"},
"setPaddleSpeedVerySlow":function(d){return "设置很慢的球拍速度"},
"setPaddleSpeedSlow":function(d){return "设置慢速球拍速度"},
"setPaddleSpeedNormal":function(d){return "设置正常球拍的速度"},
"setPaddleSpeedFast":function(d){return "设置快速球拍的速度"},
"setPaddleSpeedVeryFast":function(d){return "设置非常快球拍的速度"},
"setPaddleSpeedTooltip":function(d){return "设置球拍的速度"},
"shareBounceTwitter":function(d){return "看看我自己写的弹球游戏。我用 @codeorg 做的。"},
"shareGame":function(d){return "分享你的游戏:"},
"turnLeft":function(d){return "向左转"},
"turnRight":function(d){return "向右转"},
"turnTooltip":function(d){return "把我向左或者向右转90度。"},
"whenBallInGoal":function(d){return "当球在目标区域"},
"whenBallInGoalTooltip":function(d){return "当球在目标区域时，执行下面的操作"},
"whenBallMissesPaddle":function(d){return "当球拍没有击中球"},
"whenBallMissesPaddleTooltip":function(d){return "当球拍没有击中球时，执行下面的操作"},
"whenDown":function(d){return "当箭头键向下"},
"whenDownTooltip":function(d){return "执行下面按向上箭头键时采取的行动。"},
"whenGameStarts":function(d){return "当游戏开始"},
"whenGameStartsTooltip":function(d){return "执行以下指令在游戏的开始时。"},
"whenLeft":function(d){return "当箭头向左"},
"whenLeftTooltip":function(d){return "执行下面按向左箭头键时采取的行动。"},
"whenPaddleCollided":function(d){return "当球拍击中球"},
"whenPaddleCollidedTooltip":function(d){return "当球撞到球拍时，执行下面的操作"},
"whenRight":function(d){return "当箭头向右"},
"whenRightTooltip":function(d){return "执行下面按向右箭头键时采取的行动。"},
"whenUp":function(d){return "当箭头向上"},
"whenUpTooltip":function(d){return "执行下面按向上箭头键时采取的行动。"},
"whenWallCollided":function(d){return "当球撞到墙"},
"whenWallCollidedTooltip":function(d){return "当球撞到墙时，执行下面的操作"},
"whileMsg":function(d){return "当"},
"whileTooltip":function(d){return "重复块所包含的操作直到完成。"},
"yes":function(d){return "是"}};