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
"continue":function(d){return "続行"},
"doCode":function(d){return "してください"},
"elseCode":function(d){return "他"},
"endGame":function(d){return "ゲームオーバー"},
"endGameTooltip":function(d){return "ゲームおしまい"},
"finalLevel":function(d){return "おめでとうございます ！最後のパズルを解決しました。"},
"flap":function(d){return "フラップ"},
"flapRandom":function(d){return "ランダムな量だけパタパタします。"},
"flapVerySmall":function(d){return "ほんの少しだけパタパタします。"},
"flapSmall":function(d){return "すこしだけパタパタします。"},
"flapNormal":function(d){return "普通にパタパタします。"},
"flapLarge":function(d){return "たくさんパタパタします。"},
"flapVeryLarge":function(d){return "とてもたくさんパタパタします。"},
"flapTooltip":function(d){return "フラッピーをうえにとばします"},
"flappySpecificFail":function(d){return "いいコードですね。クリックするたびにパタパタします。でも、的に当てるには何度もクリックしなければなりません。"},
"incrementPlayerScore":function(d){return "1 ポイント"},
"incrementPlayerScoreTooltip":function(d){return "現在のプレイヤーのスコアに追加"},
"nextLevel":function(d){return "おめでとうございます ！このパズルを完了しました。"},
"no":function(d){return "いいえ"},
"numBlocksNeeded":function(d){return "このパズルは%1個のブロックで解けます。"},
"playSoundRandom":function(d){return "ランダムな音を再生"},
"playSoundBounce":function(d){return "バウンド音の再生"},
"playSoundCrunch":function(d){return "バリバリ音の再生"},
"playSoundDie":function(d){return "悲しい音を再生"},
"playSoundHit":function(d){return "叩く音を再生"},
"playSoundPoint":function(d){return "ポイントする音の再生"},
"playSoundSwoosh":function(d){return "シュッと動く音の再生"},
"playSoundWing":function(d){return "羽音の再生"},
"playSoundJet":function(d){return "ジェット音の再生"},
"playSoundCrash":function(d){return "クラッシュ音を再生"},
"playSoundJingle":function(d){return "チリンチリンとなる音の再生"},
"playSoundSplash":function(d){return "スプラッシュ音の再生"},
"playSoundLaser":function(d){return "レーザー音を再生"},
"playSoundTooltip":function(d){return "選択音を再生"},
"reinfFeedbackMsg":function(d){return "\"Try again\" ボタンを押すと、ゲームに戻ります。"},
"scoreText":function(d){return "ポイント： "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "背景をセット"},
"setBackgroundRandom":function(d){return "背景をランダムに設定"},
"setBackgroundFlappy":function(d){return "状況を街（昼）に設定"},
"setBackgroundNight":function(d){return "背景を夜の街にセット"},
"setBackgroundSciFi":function(d){return "状況をSFに設定"},
"setBackgroundUnderwater":function(d){return "背景を水中にセット"},
"setBackgroundCave":function(d){return "状況を洞窟に設定"},
"setBackgroundSanta":function(d){return "状況をクリスマスに設定"},
"setBackgroundTooltip":function(d){return "背景画像を設定"},
"setGapRandom":function(d){return "障害物のすきまをランダムに設定"},
"setGapVerySmall":function(d){return "障害物のすきまを非常に小さいに設定"},
"setGapSmall":function(d){return "障害物のすきまを小さいに設定"},
"setGapNormal":function(d){return "障害物のすきまを通常に設定"},
"setGapLarge":function(d){return "障害物のすきまを大きいに設定"},
"setGapVeryLarge":function(d){return "障害物のすきまを非常に大きいに設定"},
"setGapHeightTooltip":function(d){return "障害物の上下のすきまを設定"},
"setGravityRandom":function(d){return "重力をランダムに設定"},
"setGravityVeryLow":function(d){return "重力を非常に小さいに設定"},
"setGravityLow":function(d){return "重力を小さいに設定"},
"setGravityNormal":function(d){return "重力を通常に設定"},
"setGravityHigh":function(d){return "重力を大きいに設定"},
"setGravityVeryHigh":function(d){return "重力を非常に大きいに設定"},
"setGravityTooltip":function(d){return "重力のレベルを設定"},
"setGround":function(d){return "じめんをセット"},
"setGroundRandom":function(d){return "地面をランダムに設定"},
"setGroundFlappy":function(d){return "地面を通常に設定"},
"setGroundSciFi":function(d){return "地面をSFに設定"},
"setGroundUnderwater":function(d){return "地面を水中に設定"},
"setGroundCave":function(d){return "地面を洞窟に設定"},
"setGroundSanta":function(d){return "地面をクリスマスに設定"},
"setGroundLava":function(d){return "地面を溶岩に設定"},
"setGroundTooltip":function(d){return "地面の画像を設定"},
"setObstacle":function(d){return "しょうがい物をセット"},
"setObstacleRandom":function(d){return "障害物をランダムに設定"},
"setObstacleFlappy":function(d){return "障害物をパイプに設定"},
"setObstacleSciFi":function(d){return "障害物をSFに設定"},
"setObstacleUnderwater":function(d){return "障害物を植物に設定"},
"setObstacleCave":function(d){return "障害物を洞窟に設定"},
"setObstacleSanta":function(d){return "障害物を煙突に設定"},
"setObstacleLaser":function(d){return "障害物をレーザーに設定"},
"setObstacleTooltip":function(d){return "障害物の背景を設定"},
"setPlayer":function(d){return "プレイヤーをセット"},
"setPlayerRandom":function(d){return "プレーヤーをランダムに設定"},
"setPlayerFlappy":function(d){return "プレーヤーをイエローバードに設定"},
"setPlayerRedBird":function(d){return "プレーヤーをレッドバードに設定"},
"setPlayerSciFi":function(d){return "プレーヤーをスペースシップに設定"},
"setPlayerUnderwater":function(d){return "プレーヤーをフィッシュに設定"},
"setPlayerCave":function(d){return "プレーヤーをバットマンに設定"},
"setPlayerSanta":function(d){return "プレーヤーをサンタクロースに設定"},
"setPlayerShark":function(d){return "プレーヤーをシャークに設定"},
"setPlayerEaster":function(d){return "プレーヤーをイースターバニーに設定"},
"setPlayerBatman":function(d){return "プレーヤーをバットマンに設定"},
"setPlayerSubmarine":function(d){return "プレーヤーをサブマリンに設定"},
"setPlayerUnicorn":function(d){return "プレーヤーをユニコーンに設定"},
"setPlayerFairy":function(d){return "プレーヤーをフェアリーに設定"},
"setPlayerSuperman":function(d){return "プレーヤーをフラッピーマンに設定"},
"setPlayerTurkey":function(d){return "プレーヤーをターキーに設定"},
"setPlayerTooltip":function(d){return "プレーヤーの画像を設定"},
"setScore":function(d){return "得点を設定"},
"setScoreTooltip":function(d){return "プレーヤーの得点を設定"},
"setSpeed":function(d){return "速度を設定"},
"setSpeedTooltip":function(d){return "速度のレベルを設定"},
"shareFlappyTwitter":function(d){return "作られたフラッピーゲームをチェックしてください。@ codeorgで書きました。"},
"shareGame":function(d){return "あなたのゲームを共有："},
"soundRandom":function(d){return "ランダム"},
"soundBounce":function(d){return "バウンス"},
"soundCrunch":function(d){return "crunch"},
"soundDie":function(d){return "かなしい"},
"soundHit":function(d){return "うつ"},
"soundPoint":function(d){return "ポイント"},
"soundSwoosh":function(d){return "シューッという音を鳴らしますします。"},
"soundWing":function(d){return "羽"},
"soundJet":function(d){return "jet"},
"soundCrash":function(d){return "ぶつかる"},
"soundJingle":function(d){return "jingle"},
"soundSplash":function(d){return "splash"},
"soundLaser":function(d){return "レーザー"},
"speedRandom":function(d){return "速度をランダムに設定"},
"speedVerySlow":function(d){return "速度を非常に遅いに設定"},
"speedSlow":function(d){return "速度を遅いに設定"},
"speedNormal":function(d){return "速度を通常に設定"},
"speedFast":function(d){return "速度を早いに設定"},
"speedVeryFast":function(d){return "速度を非常に早いに設定"},
"whenClick":function(d){return "クリックしたとき"},
"whenClickTooltip":function(d){return "クリックしたイベント発生時に次のアクションを実行"},
"whenCollideGround":function(d){return "地面をヒットしたとき"},
"whenCollideGroundTooltip":function(d){return "フラッピーが地面にぶつかったとき、次のアクションを実行"},
"whenCollideObstacle":function(d){return "障害物をヒットしたとき"},
"whenCollideObstacleTooltip":function(d){return "フラッピーがどかんにぶつかったとき、次のアクションを実行"},
"whenEnterObstacle":function(d){return "障害物を通過したとき"},
"whenEnterObstacleTooltip":function(d){return "フラッピーが障害物に進入したとき、次のアクションを実行"},
"whenRunButtonClick":function(d){return "ゲームの開始時"},
"whenRunButtonClickTooltip":function(d){return "ゲーム開始時、次のアクションを実行"},
"yes":function(d){return "はい"}};