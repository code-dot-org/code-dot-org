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
"bounceBall":function(d){return "バウンスボール"},
"bounceBallTooltip":function(d){return "物体からボールをバウンドさせてください。"},
"continue":function(d){return "続行"},
"dirE":function(d){return "東"},
"dirN":function(d){return "北"},
"dirS":function(d){return "南"},
"dirW":function(d){return "西"},
"doCode":function(d){return "実行"},
"elseCode":function(d){return "他"},
"finalLevel":function(d){return "おめでとうございます ！最後のパズルを解決しました。"},
"heightParameter":function(d){return "高さ"},
"ifCode":function(d){return "もし"},
"ifPathAhead":function(d){return "もし先に道があれば"},
"ifTooltip":function(d){return "指定した方向に道がある場合は、いくつかのアクションを行います。"},
"ifelseTooltip":function(d){return "指定した方向にパスがある場合は、最初のブロックにアクションを行います。それ以外の場合は、2 番目のブロックにアクションを行います。"},
"incrementOpponentScore":function(d){return "相手のポイントを採点する"},
"incrementOpponentScoreTooltip":function(d){return "今対戦している相手のスコアに１足してください。"},
"incrementPlayerScore":function(d){return "ポイントを採点する。"},
"incrementPlayerScoreTooltip":function(d){return "現在のプレイヤーのスコアに追加"},
"isWall":function(d){return "これは壁ですか？"},
"isWallTooltip":function(d){return "ここに壁がある場合は true を返します。"},
"launchBall":function(d){return "新しいボールを起動します。"},
"launchBallTooltip":function(d){return "プレーにボールを起動します。"},
"makeYourOwn":function(d){return "自分のバウンスゲームを作成しなさい。"},
"moveDown":function(d){return "下に移動します。"},
"moveDownTooltip":function(d){return "パドルを下に移動します。"},
"moveForward":function(d){return "前方に移動します。"},
"moveForwardTooltip":function(d){return "私を前方に 1スペース 移動させてください。"},
"moveLeft":function(d){return "左に移動"},
"moveLeftTooltip":function(d){return "パドルを左に移動します。"},
"moveRight":function(d){return "右に移動します。"},
"moveRightTooltip":function(d){return "パドルを右に移動します。"},
"moveUp":function(d){return "上に移動します。"},
"moveUpTooltip":function(d){return "パドルを上に移動します。"},
"nextLevel":function(d){return "おめでとうございます ！このパズルを完了しました。"},
"no":function(d){return "いいえ"},
"noPathAhead":function(d){return "道がふさがれています"},
"noPathLeft":function(d){return "左に道がありません"},
"noPathRight":function(d){return "右に道がありません"},
"numBlocksNeeded":function(d){return "このパズルは%1個のブロックで解けます。"},
"pathAhead":function(d){return "前に道があります。"},
"pathLeft":function(d){return "もし左に道があるとき\n"},
"pathRight":function(d){return "もし右に道があるときは"},
"pilePresent":function(d){return "山があります。"},
"playSoundCrunch":function(d){return "バリバリ音の再生"},
"playSoundGoal1":function(d){return "目標 1 のサウンドを再生します。"},
"playSoundGoal2":function(d){return "目標 2 サウンドを再生します。"},
"playSoundHit":function(d){return "サウンドを押して再生します。"},
"playSoundLosePoint":function(d){return "敗北ポイントの音を再生します。"},
"playSoundLosePoint2":function(d){return "失点音2の再生をしてください。"},
"playSoundRetro":function(d){return "レトロなサウンドを再生します。"},
"playSoundRubber":function(d){return "ゴムの音を再生します。"},
"playSoundSlap":function(d){return "平手打ちの音を再生します。"},
"playSoundTooltip":function(d){return "選択音を再生"},
"playSoundWinPoint":function(d){return "勝利ポイントの音を再生します。"},
"playSoundWinPoint2":function(d){return "勝利ポイント2の音を再生します。"},
"playSoundWood":function(d){return "木を叩く音を再生します"},
"putdownTower":function(d){return "タワーを置く"},
"reinfFeedbackMsg":function(d){return "\"Try again\" ボタンを押すと、ゲームに戻ります。"},
"removeSquare":function(d){return "正方形を削除します。"},
"repeatUntil":function(d){return "までを繰り返します"},
"repeatUntilBlocked":function(d){return "前に道がある間"},
"repeatUntilFinish":function(d){return "完了するまで繰り返し行います"},
"scoreText":function(d){return "ポイント： "+appLocale.v(d,"playerScore")+": "+appLocale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "状況をランダムに設定"},
"setBackgroundHardcourt":function(d){return " hardcourtの状況を設定"},
"setBackgroundRetro":function(d){return "状況をレトロに設定"},
"setBackgroundTooltip":function(d){return "背景画像を設定"},
"setBallRandom":function(d){return "ボールをランダムに設定"},
"setBallHardcourt":function(d){return "ハードコート用ボールを設定"},
"setBallRetro":function(d){return "レトロ用ボールを設定"},
"setBallTooltip":function(d){return "ボール画像を設定"},
"setBallSpeedRandom":function(d){return "ボール速度をランダムに 設定"},
"setBallSpeedVerySlow":function(d){return "ボール速度を非常に遅いに設定"},
"setBallSpeedSlow":function(d){return "ボール速度を遅いに設定"},
"setBallSpeedNormal":function(d){return "ボール速度を通常に設定"},
"setBallSpeedFast":function(d){return "ボール速度を非常に速いに設定"},
"setBallSpeedVeryFast":function(d){return "ボール速度を非常に早いに設定"},
"setBallSpeedTooltip":function(d){return "ボール速度を設定"},
"setPaddleRandom":function(d){return "ラケットをランダムに設定"},
"setPaddleHardcourt":function(d){return "ハードコート用ラケットを設定"},
"setPaddleRetro":function(d){return "レトロなラケットを設定"},
"setPaddleTooltip":function(d){return "パドルのイメージを設定します"},
"setPaddleSpeedRandom":function(d){return "ラケット速度をランダムに設定"},
"setPaddleSpeedVerySlow":function(d){return "ラケット速度を非常に遅いに設定"},
"setPaddleSpeedSlow":function(d){return "ラケット速度を遅いに設定"},
"setPaddleSpeedNormal":function(d){return "ラケット速度を通常に設定"},
"setPaddleSpeedFast":function(d){return "ラケット速度を高速に設定"},
"setPaddleSpeedVeryFast":function(d){return "ラケット速度を非常に早いに設定"},
"setPaddleSpeedTooltip":function(d){return "ラケット速度を設定"},
"shareBounceTwitter":function(d){return "私が開発したゲーム「Bounce」をぜひプレイしてください。@codeorgを使い、書きました。"},
"shareGame":function(d){return "あなたのゲームを共有："},
"turnLeft":function(d){return "左に回転"},
"turnRight":function(d){return "右に回転"},
"turnTooltip":function(d){return "私を左もしくは右に90 度曲がらせてください。"},
"whenBallInGoal":function(d){return "ボールがゴールに入った場合"},
"whenBallInGoalTooltip":function(d){return "ボールがゴールに入った場合、下記のアクションを実行"},
"whenBallMissesPaddle":function(d){return "ボールがパドルを外れた場合"},
"whenBallMissesPaddleTooltip":function(d){return "ボールがパドルを外したら下記のアクションを実行します。"},
"whenDown":function(d){return "下向き矢印が押されたとき"},
"whenDownTooltip":function(d){return "下矢印キーが押された場合、下記のアクションを実行"},
"whenGameStarts":function(d){return "ゲームの開始時"},
"whenGameStartsTooltip":function(d){return "ゲーム開始時、次のアクションを実行"},
"whenLeft":function(d){return "左向き矢印が押された場合"},
"whenLeftTooltip":function(d){return "左矢印キーが押された場合、下記のアクションを実行"},
"whenPaddleCollided":function(d){return "ボールがパドルに当たった場合"},
"whenPaddleCollidedTooltip":function(d){return "ボールがパドルに当たった場合、下記のアクションを実行"},
"whenRight":function(d){return "右矢印キーが押された場合"},
"whenRightTooltip":function(d){return "右矢印キーが押された場合、下記のアクションを実行"},
"whenUp":function(d){return "上矢印が押された場合"},
"whenUpTooltip":function(d){return "上矢印キーが押された場合、下記のアクションを実行"},
"whenWallCollided":function(d){return "ボールが壁に当たった場合"},
"whenWallCollidedTooltip":function(d){return "ボールが壁に当たった場合、下記のアクションを実行"},
"whileMsg":function(d){return "以下の間"},
"whileTooltip":function(d){return "終点に到着するまで、封じられた行動を繰り返してください"},
"yes":function(d){return "はい"}};