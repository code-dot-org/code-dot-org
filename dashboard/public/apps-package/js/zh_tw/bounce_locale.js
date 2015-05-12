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
v:function(d,k){bounce_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){bounce_locale.c(d,k);return d[k] in p?p[d[k]]:(k=bounce_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){bounce_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).bounce_locale = {
"bounceBall":function(d){return "反彈球"},
"bounceBallTooltip":function(d){return "從某一物體反彈的球。"},
"continue":function(d){return "繼續"},
"dirE":function(d){return "東"},
"dirN":function(d){return "北"},
"dirS":function(d){return "南"},
"dirW":function(d){return "西"},
"doCode":function(d){return "執行"},
"elseCode":function(d){return "否則"},
"finalLevel":function(d){return "恭喜！你已經完成最後的關卡。"},
"heightParameter":function(d){return "高度"},
"ifCode":function(d){return "如果"},
"ifPathAhead":function(d){return "如果前面有路"},
"ifTooltip":function(d){return "如果在指定的方向有路的話，就執行某些指定動作。"},
"ifelseTooltip":function(d){return "如果在指定的方向有路的話，就執行第一個程式積木的動作，否則就執行第二個程式積木的動作。"},
"incrementOpponentScore":function(d){return "對手的得分點"},
"incrementOpponentScoreTooltip":function(d){return "增加一個到目前對手的得分。"},
"incrementPlayerScore":function(d){return "得分"},
"incrementPlayerScoreTooltip":function(d){return "替玩家加一分"},
"isWall":function(d){return "這是牆嗎"},
"isWallTooltip":function(d){return "如果這裡有牆，則返回 ｢真｣ （true）"},
"launchBall":function(d){return "重新發球"},
"launchBallTooltip":function(d){return "發出一顆球開始遊戲"},
"makeYourOwn":function(d){return "設計屬於你的反彈球遊戲"},
"moveDown":function(d){return "向下移動"},
"moveDownTooltip":function(d){return "槳向下移動。"},
"moveForward":function(d){return "向前移動"},
"moveForwardTooltip":function(d){return "將我向前移動一格"},
"moveLeft":function(d){return "向左移動"},
"moveLeftTooltip":function(d){return "槳移到左邊。"},
"moveRight":function(d){return "向右移動"},
"moveRightTooltip":function(d){return "槳向右移動。"},
"moveUp":function(d){return "向上移動"},
"moveUpTooltip":function(d){return "槳向上移動。"},
"nextLevel":function(d){return "恭喜！你已經完成這個關卡。"},
"no":function(d){return "否"},
"noPathAhead":function(d){return "路被堵住了"},
"noPathLeft":function(d){return "左邊沒有路"},
"noPathRight":function(d){return "右邊沒有路"},
"numBlocksNeeded":function(d){return "這個關卡可以使用 %1 個程式積木來完成。"},
"pathAhead":function(d){return "前面有路"},
"pathLeft":function(d){return "如果左邊有路"},
"pathRight":function(d){return "如果右邊有路"},
"pilePresent":function(d){return "有一堆土"},
"playSoundCrunch":function(d){return "播放嘎吱音效"},
"playSoundGoal1":function(d){return "播放得分1的音效"},
"playSoundGoal2":function(d){return "播放得分2的音效"},
"playSoundHit":function(d){return "播放命中的音效"},
"playSoundLosePoint":function(d){return "播放失分的音效"},
"playSoundLosePoint2":function(d){return "播放失分2的音效"},
"playSoundRetro":function(d){return "播放復古的音效"},
"playSoundRubber":function(d){return "播放橡膠的音效"},
"playSoundSlap":function(d){return "播放掌聲音效"},
"playSoundTooltip":function(d){return "播放所選音效"},
"playSoundWinPoint":function(d){return "播放得分音效"},
"playSoundWinPoint2":function(d){return "播放得分2的音效"},
"playSoundWood":function(d){return "播放木頭音效"},
"putdownTower":function(d){return "將小土丘放下"},
"reinfFeedbackMsg":function(d){return "您可以按\"重試\"按鈕，回去玩您的遊戲。"},
"removeSquare":function(d){return "移除正方型內的土堆"},
"repeatUntil":function(d){return "重複 直到"},
"repeatUntilBlocked":function(d){return "當前面有路時"},
"repeatUntilFinish":function(d){return "重覆直到完成"},
"scoreText":function(d){return "分數: "+bounce_locale.v(d,"playerScore")+": "+bounce_locale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "設定隨機場景"},
"setBackgroundHardcourt":function(d){return "將場景設為硬地球場"},
"setBackgroundRetro":function(d){return "將場景設為復古場景"},
"setBackgroundTooltip":function(d){return "設置背景圖像"},
"setBallRandom":function(d){return "將球設定為隨機種類"},
"setBallHardcourt":function(d){return "將球設定為硬式網球"},
"setBallRetro":function(d){return "將球設定為復古種類"},
"setBallTooltip":function(d){return "設定球的圖像"},
"setBallSpeedRandom":function(d){return "將球的速度設定為隨機"},
"setBallSpeedVerySlow":function(d){return "將球的速度設定為非常慢"},
"setBallSpeedSlow":function(d){return "將球的速度設定為慢"},
"setBallSpeedNormal":function(d){return "將球的速度設定為正常"},
"setBallSpeedFast":function(d){return "將球的速度設定為快速"},
"setBallSpeedVeryFast":function(d){return "將球的速度設定為非常快"},
"setBallSpeedTooltip":function(d){return "設定球的速度"},
"setPaddleRandom":function(d){return "將球拍的種類設定為隨機"},
"setPaddleHardcourt":function(d){return "將球拍設定為硬式網球拍"},
"setPaddleRetro":function(d){return "將球拍設定為復古球拍"},
"setPaddleTooltip":function(d){return "設置球拍外觀"},
"setPaddleSpeedRandom":function(d){return "設定揮拍速度為隨機"},
"setPaddleSpeedVerySlow":function(d){return "設定揮拍速度為非常慢"},
"setPaddleSpeedSlow":function(d){return "設定揮拍速度為慢"},
"setPaddleSpeedNormal":function(d){return "設定揮拍速度為正常"},
"setPaddleSpeedFast":function(d){return "設定揮拍速度為快速"},
"setPaddleSpeedVeryFast":function(d){return "設定揮拍速度為非常快"},
"setPaddleSpeedTooltip":function(d){return "設定揮拍速度"},
"shareBounceTwitter":function(d){return "來玩玩看我在@codeorg玩程的反彈球遊戲吧。"},
"shareGame":function(d){return "分享您的遊戲"},
"turnLeft":function(d){return "向左轉"},
"turnRight":function(d){return "向右轉"},
"turnTooltip":function(d){return "將我向左或右轉90度。"},
"whenBallInGoal":function(d){return "當球在目標區"},
"whenBallInGoalTooltip":function(d){return "當球進入目標區時執行以下動作。"},
"whenBallMissesPaddle":function(d){return "當球拍未擊中球"},
"whenBallMissesPaddleTooltip":function(d){return "當球拍未能擊中球，執行以下行動。"},
"whenDown":function(d){return "當按下＂下方向鍵＂"},
"whenDownTooltip":function(d){return "當按下＂下方向鍵＂，就會執行動作"},
"whenGameStarts":function(d){return "當遊戲開始時"},
"whenGameStartsTooltip":function(d){return "當游戲開始時，執行以下動作。"},
"whenLeft":function(d){return "當按下＂左方向鍵＂"},
"whenLeftTooltip":function(d){return "當按下＂左方向鍵＂，就會執行動作"},
"whenPaddleCollided":function(d){return "當球拍擊中球"},
"whenPaddleCollidedTooltip":function(d){return "當球撞到球拍時，執行以下的行動。"},
"whenRight":function(d){return "當按下＂右方向鍵＂"},
"whenRightTooltip":function(d){return "當按下＂右方向鍵＂，就會執行動作"},
"whenUp":function(d){return "當＂上方向鍵＂"},
"whenUpTooltip":function(d){return "當按下＂上方向鍵＂，就會執行動作"},
"whenWallCollided":function(d){return "當球打在牆上"},
"whenWallCollidedTooltip":function(d){return "當球撞到牆時，執行以下的行動。"},
"whileMsg":function(d){return "當"},
"whileTooltip":function(d){return "重覆程式積木內的動作，直到完成為止。"},
"yes":function(d){return "是"}};