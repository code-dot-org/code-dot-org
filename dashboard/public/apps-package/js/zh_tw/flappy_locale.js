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
v:function(d,k){flappy_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){flappy_locale.c(d,k);return d[k] in p?p[d[k]]:(k=flappy_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){flappy_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).flappy_locale = {
"continue":function(d){return "繼續 "},
"doCode":function(d){return "執行"},
"elseCode":function(d){return "否則"},
"endGame":function(d){return "結束遊戲"},
"endGameTooltip":function(d){return "遊戲結束"},
"finalLevel":function(d){return "恭喜你 ！你已經解決了最後的關卡。"},
"flap":function(d){return "拍打翅膀"},
"flapRandom":function(d){return "以隨機的力量拍打翅膀"},
"flapVerySmall":function(d){return "以非常小的力量拍打翅膀"},
"flapSmall":function(d){return "以較小的力量拍打翅膀"},
"flapNormal":function(d){return "以正常的力量拍打翅膀"},
"flapLarge":function(d){return "以較大的力量拍打翅膀"},
"flapVeryLarge":function(d){return "以非常大的力量拍打翅膀"},
"flapTooltip":function(d){return "讓Flappy向上飛"},
"flappySpecificFail":function(d){return "您的程式碼看起來不錯-每點擊一次，它將拍打一下。但你需要點擊多次以飛到目標。"},
"incrementPlayerScore":function(d){return "得一分"},
"incrementPlayerScoreTooltip":function(d){return "替玩家加一分"},
"nextLevel":function(d){return "恭喜！你已經完成這個關卡。"},
"no":function(d){return "否"},
"numBlocksNeeded":function(d){return "這個關卡可以使用 %1 個程式積木來完成。"},
"playSoundRandom":function(d){return "播放隨機的音效"},
"playSoundBounce":function(d){return "播放彈跳音效"},
"playSoundCrunch":function(d){return "播放收緊的音效"},
"playSoundDie":function(d){return "播放悲傷音效"},
"playSoundHit":function(d){return "播放粉碎音效"},
"playSoundPoint":function(d){return "播放得分音效"},
"playSoundSwoosh":function(d){return "播放旋風音效"},
"playSoundWing":function(d){return "播放拍打翅膀音效"},
"playSoundJet":function(d){return "播放噴射音效"},
"playSoundCrash":function(d){return "播放碰撞音效"},
"playSoundJingle":function(d){return "播放叮噹音效"},
"playSoundSplash":function(d){return "播放飛濺音效"},
"playSoundLaser":function(d){return "播放雷射音效"},
"playSoundTooltip":function(d){return "播放所選音效"},
"reinfFeedbackMsg":function(d){return "您可以按\"重試\"按鈕，回去玩您的遊戲。"},
"scoreText":function(d){return "得分: "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "設置場景"},
"setBackgroundRandom":function(d){return "設定為隨機場景"},
"setBackgroundFlappy":function(d){return "設定為城市場景(白天)"},
"setBackgroundNight":function(d){return "設定為城市場景(晚上)"},
"setBackgroundSciFi":function(d){return "設定為科幻場景"},
"setBackgroundUnderwater":function(d){return "設定為水底場景"},
"setBackgroundCave":function(d){return "設定為山洞場景"},
"setBackgroundSanta":function(d){return "設定為聖誕場景"},
"setBackgroundTooltip":function(d){return "設置背景圖像"},
"setGapRandom":function(d){return "設定一個隨機的間距"},
"setGapVerySmall":function(d){return "設定一個非常小的間距"},
"setGapSmall":function(d){return "設定一個較小的間距"},
"setGapNormal":function(d){return "設定一個正常的間距"},
"setGapLarge":function(d){return "設定一個較大的間距"},
"setGapVeryLarge":function(d){return "設定一個非常大的間距"},
"setGapHeightTooltip":function(d){return "設定障礙物的垂直間距"},
"setGravityRandom":function(d){return "設定為隨機重力"},
"setGravityVeryLow":function(d){return "設定為極小重力"},
"setGravityLow":function(d){return "設定為較小重力"},
"setGravityNormal":function(d){return "設定為正常重力"},
"setGravityHigh":function(d){return "設定為較大重力"},
"setGravityVeryHigh":function(d){return "設定為極大重力"},
"setGravityTooltip":function(d){return "設定關卡重力值"},
"setGround":function(d){return "設置地面"},
"setGroundRandom":function(d){return "設定地面種類為隨機風格"},
"setGroundFlappy":function(d){return "設定地面種類為地板風格"},
"setGroundSciFi":function(d){return "設定地面種類為科幻風格"},
"setGroundUnderwater":function(d){return "設定地面種類為水底風格"},
"setGroundCave":function(d){return "設定地面種類為洞穴風格"},
"setGroundSanta":function(d){return "設定地面種類為聖誕風格"},
"setGroundLava":function(d){return "設定地面種類為岩漿風格"},
"setGroundTooltip":function(d){return "設置地面圖像"},
"setObstacle":function(d){return "設置障礙物"},
"setObstacleRandom":function(d){return "設定障礙物種類為隨機風格"},
"setObstacleFlappy":function(d){return "設定障礙物種類為水管"},
"setObstacleSciFi":function(d){return "設定障礙物種類為科幻"},
"setObstacleUnderwater":function(d){return "設定障礙物種類為植物"},
"setObstacleCave":function(d){return "設定障礙物種類為洞穴"},
"setObstacleSanta":function(d){return "設定障礙物種類為煙囪"},
"setObstacleLaser":function(d){return "設定障礙物種類為雷射"},
"setObstacleTooltip":function(d){return "設置障礙圖像"},
"setPlayer":function(d){return "設置玩家角色"},
"setPlayerRandom":function(d){return "設置玩家為隨機種類"},
"setPlayerFlappy":function(d){return "設置玩家為黃色小鳥"},
"setPlayerRedBird":function(d){return "設置玩家為紅色小鳥"},
"setPlayerSciFi":function(d){return "設置玩家為飛船"},
"setPlayerUnderwater":function(d){return "設置玩家為魚"},
"setPlayerCave":function(d){return "設置玩家為蝙蝠"},
"setPlayerSanta":function(d){return "設置玩家為聖誕老人"},
"setPlayerShark":function(d){return "設置玩家為鯊魚"},
"setPlayerEaster":function(d){return "設置玩家為復活節兔子"},
"setPlayerBatman":function(d){return "設置玩家為蝙蝠俠"},
"setPlayerSubmarine":function(d){return "設置玩家為潛水艇"},
"setPlayerUnicorn":function(d){return "設置玩家為獨角獸"},
"setPlayerFairy":function(d){return "設置玩家為小精靈"},
"setPlayerSuperman":function(d){return "設置玩家為飛翔的人"},
"setPlayerTurkey":function(d){return "設置玩家為火雞"},
"setPlayerTooltip":function(d){return "設置玩家圖像"},
"setScore":function(d){return "設置得分"},
"setScoreTooltip":function(d){return "設置玩家的得分"},
"setSpeed":function(d){return "設置速度"},
"setSpeedTooltip":function(d){return "設置關卡的速度"},
"shareFlappyTwitter":function(d){return "來玩玩我在 @codeorg　自己完成的 Flappy 遊戲吧。"},
"shareGame":function(d){return "分享您的遊戲"},
"soundRandom":function(d){return "隨機"},
"soundBounce":function(d){return "反彈"},
"soundCrunch":function(d){return "收緊"},
"soundDie":function(d){return "傷心"},
"soundHit":function(d){return "粉碎"},
"soundPoint":function(d){return "分數"},
"soundSwoosh":function(d){return "旋風"},
"soundWing":function(d){return "翼"},
"soundJet":function(d){return "噴射"},
"soundCrash":function(d){return "倒塌"},
"soundJingle":function(d){return "鈴聲"},
"soundSplash":function(d){return "濺射"},
"soundLaser":function(d){return "鐳射"},
"speedRandom":function(d){return "設定為隨機的速度"},
"speedVerySlow":function(d){return "設定為極慢的速度"},
"speedSlow":function(d){return "設定為稍慢的速度"},
"speedNormal":function(d){return "設定為正常的速度"},
"speedFast":function(d){return "設定為較快的速度"},
"speedVeryFast":function(d){return "設定為極快的速度"},
"whenClick":function(d){return "當點擊時"},
"whenClickTooltip":function(d){return "當點擊事件發生時，就執行以下程式碼。"},
"whenCollideGround":function(d){return "當撞到地面時"},
"whenCollideGroundTooltip":function(d){return "當 Flappy 撞到地面時，執行以下動作。"},
"whenCollideObstacle":function(d){return "當撞到一個障礙物時"},
"whenCollideObstacleTooltip":function(d){return "當 Flappy 撞到一個障礙時，執行以下動作。"},
"whenEnterObstacle":function(d){return "當通過障礙物時"},
"whenEnterObstacleTooltip":function(d){return "當 Flappy 進入障礙物時，執行以下動作。"},
"whenRunButtonClick":function(d){return "當遊戲開始時"},
"whenRunButtonClickTooltip":function(d){return "當游戲開始時，執行以下動作。"},
"yes":function(d){return "確定"}};