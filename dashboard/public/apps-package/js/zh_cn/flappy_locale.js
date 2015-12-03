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
"continue":function(d){return "继续"},
"doCode":function(d){return "做"},
"elseCode":function(d){return "否则"},
"endGame":function(d){return "结束游戏"},
"endGameTooltip":function(d){return "结束游戏"},
"finalLevel":function(d){return "恭喜你！你完成了最后一个难题。"},
"flap":function(d){return "拍翅膀"},
"flapRandom":function(d){return "以随机力度拍翅膀"},
"flapVerySmall":function(d){return "非常轻地拍翅膀"},
"flapSmall":function(d){return "轻拍翅膀"},
"flapNormal":function(d){return "以正常地力度拍翅膀"},
"flapLarge":function(d){return "用力拍翅膀"},
"flapVeryLarge":function(d){return "非常用力地拍翅膀"},
"flapTooltip":function(d){return "让小鸟往上飞"},
"flappySpecificFail":function(d){return "您的代码看起来不错-每次点击它将飞动一下。但你需要点击多次使它飞到目标。"},
"incrementPlayerScore":function(d){return "得一分"},
"incrementPlayerScoreTooltip":function(d){return "在玩家现有分数上加一分"},
"nextLevel":function(d){return "恭喜！您已完成了这个难题。"},
"no":function(d){return "不"},
"numBlocksNeeded":function(d){return "这个难题可以用%1个块解决。"},
"playSoundRandom":function(d){return "播放随机的音效"},
"playSoundBounce":function(d){return "播放弹跳的音效"},
"playSoundCrunch":function(d){return "播放吱嘎声"},
"playSoundDie":function(d){return "播放悲伤的音效"},
"playSoundHit":function(d){return "播放摔碎的声音"},
"playSoundPoint":function(d){return "播放得分的声音"},
"playSoundSwoosh":function(d){return "播放嗖嗖的声音"},
"playSoundWing":function(d){return "播放拍翅膀的声音"},
"playSoundJet":function(d){return "播放喷气机的声音"},
"playSoundCrash":function(d){return "播放撞击的声音"},
"playSoundJingle":function(d){return "播放叮当声"},
"playSoundSplash":function(d){return "播放溅水的声音"},
"playSoundLaser":function(d){return "播放激光的声音"},
"playSoundTooltip":function(d){return "播放所选声音"},
"reinfFeedbackMsg":function(d){return "你可以按“重试”按钮来返回你的游戏"},
"scoreText":function(d){return "得分： "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "设置场景"},
"setBackgroundRandom":function(d){return "设置随机场景"},
"setBackgroundFlappy":function(d){return "设置为城市场景(白天)"},
"setBackgroundNight":function(d){return "设置为城市场景(夜晚)"},
"setBackgroundSciFi":function(d){return "设置为科幻场景"},
"setBackgroundUnderwater":function(d){return "设置为水下场景"},
"setBackgroundCave":function(d){return "设置为洞穴场景"},
"setBackgroundSanta":function(d){return "设置为圣诞场景"},
"setBackgroundTooltip":function(d){return "设置背景图案"},
"setGapRandom":function(d){return "设置一个随机宽度的缝隙"},
"setGapVerySmall":function(d){return "设置一个很小的间隙"},
"setGapSmall":function(d){return "设置一个小的间隙"},
"setGapNormal":function(d){return "设置一个正常的间隙"},
"setGapLarge":function(d){return "设置一个大的间隙"},
"setGapVeryLarge":function(d){return "设置一个很大的间隙"},
"setGapHeightTooltip":function(d){return "设置障碍中的垂直间距"},
"setGravityRandom":function(d){return "设置重力为随机"},
"setGravityVeryLow":function(d){return "设置重力为非常小"},
"setGravityLow":function(d){return "设置重力为小"},
"setGravityNormal":function(d){return "设置重力为正常"},
"setGravityHigh":function(d){return "设置重力为大"},
"setGravityVeryHigh":function(d){return "设置重力为非常大"},
"setGravityTooltip":function(d){return "设置关卡重力"},
"setGround":function(d){return "设置地面"},
"setGroundRandom":function(d){return "设置地面为随机效果"},
"setGroundFlappy":function(d){return "设置地面为地板效果"},
"setGroundSciFi":function(d){return "设置地面为科幻效果"},
"setGroundUnderwater":function(d){return "设置地面为水下效果"},
"setGroundCave":function(d){return "设置地面为洞穴效果"},
"setGroundSanta":function(d){return "设置地面为圣诞效果"},
"setGroundLava":function(d){return "设置地面为岩浆效果"},
"setGroundTooltip":function(d){return "设置地面图片"},
"setObstacle":function(d){return "设置障碍"},
"setObstacleRandom":function(d){return "设置障碍为随机效果"},
"setObstacleFlappy":function(d){return "设置障碍为水管"},
"setObstacleSciFi":function(d){return "设置障碍为科幻"},
"setObstacleUnderwater":function(d){return "设置障碍为星球"},
"setObstacleCave":function(d){return "设置障碍为洞穴"},
"setObstacleSanta":function(d){return "设置障碍为烟囱"},
"setObstacleLaser":function(d){return "设置障碍为激光"},
"setObstacleTooltip":function(d){return "设置障碍图片"},
"setPlayer":function(d){return "设置玩家"},
"setPlayerRandom":function(d){return "设置玩家为随机效果"},
"setPlayerFlappy":function(d){return "设置玩家为黄色小鸟"},
"setPlayerRedBird":function(d){return "设置玩家为红色小鸟"},
"setPlayerSciFi":function(d){return "设置玩家为宇宙飞船"},
"setPlayerUnderwater":function(d){return "设置玩家为鱼"},
"setPlayerCave":function(d){return "设置玩家为蝙蝠"},
"setPlayerSanta":function(d){return "设置玩家为圣诞老人"},
"setPlayerShark":function(d){return "设置玩家为鲨鱼"},
"setPlayerEaster":function(d){return "设置玩家为复活节兔子"},
"setPlayerBatman":function(d){return "设置玩家为击球员"},
"setPlayerSubmarine":function(d){return "设置玩家为潜水艇"},
"setPlayerUnicorn":function(d){return "设置玩家为独角兽"},
"setPlayerFairy":function(d){return "设置玩家为小精灵"},
"setPlayerSuperman":function(d){return "设置玩家为飞翔的人"},
"setPlayerTurkey":function(d){return "设置玩家为火鸡"},
"setPlayerTooltip":function(d){return "设置玩家图片"},
"setScore":function(d){return "设置得分"},
"setScoreTooltip":function(d){return "设置玩家分数"},
"setSpeed":function(d){return "设置速度"},
"setSpeedTooltip":function(d){return "设置关卡速度"},
"shareFlappyTwitter":function(d){return "看看我自己写的Flappy Bird游戏。我在 @codeorg 编写的。"},
"shareGame":function(d){return "分享你的游戏:"},
"soundRandom":function(d){return "随机"},
"soundBounce":function(d){return "反弹"},
"soundCrunch":function(d){return "紧缩"},
"soundDie":function(d){return "伤心"},
"soundHit":function(d){return "粉碎"},
"soundPoint":function(d){return "点"},
"soundSwoosh":function(d){return "旋风"},
"soundWing":function(d){return "翼"},
"soundJet":function(d){return "喷射"},
"soundCrash":function(d){return "崩溃"},
"soundJingle":function(d){return "叮当"},
"soundSplash":function(d){return "飞溅"},
"soundLaser":function(d){return "激光"},
"speedRandom":function(d){return "设置速度：随机"},
"speedVerySlow":function(d){return "设置速度：非常慢"},
"speedSlow":function(d){return "设置速度：慢"},
"speedNormal":function(d){return "设置速度：正常"},
"speedFast":function(d){return "设置速度：快"},
"speedVeryFast":function(d){return "设置速度：非常快"},
"whenClick":function(d){return "当点击时"},
"whenClickTooltip":function(d){return "在 点击 事件发生时执行下面的动作。"},
"whenCollideGround":function(d){return "当撞击地面时"},
"whenCollideGroundTooltip":function(d){return "在 小鸟撞击地面 时执行下面的动作"},
"whenCollideObstacle":function(d){return "当击中一个障碍"},
"whenCollideObstacleTooltip":function(d){return "执行下面的操作当 Flappy 击中一个障碍。"},
"whenEnterObstacle":function(d){return "当通过一个障碍"},
"whenEnterObstacleTooltip":function(d){return "执行下面的操作当 Flappy 进入一个障碍。"},
"whenRunButtonClick":function(d){return "当游戏开始后"},
"whenRunButtonClickTooltip":function(d){return "在游戏开始时执行以下指令。"},
"yes":function(d){return "是"}};