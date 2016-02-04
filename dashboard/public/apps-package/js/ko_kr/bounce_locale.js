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
"bounceBall":function(d){return "공 넘기기"},
"bounceBallTooltip":function(d){return "공이 물체에 튕기도록 합니다."},
"continue":function(d){return "계속하기"},
"dirE":function(d){return "오른쪽"},
"dirN":function(d){return "위쪽"},
"dirS":function(d){return "아래쪽"},
"dirW":function(d){return "왼쪽"},
"doCode":function(d){return "실행"},
"elseCode":function(d){return "아니면"},
"finalLevel":function(d){return "짝짝짝 축하합니다! 마지막 퍼즐을 해결했습니다."},
"heightParameter":function(d){return "높이:"},
"ifCode":function(d){return "만약"},
"ifPathAhead":function(d){return "만약 앞쪽에 길이 있으면"},
"ifTooltip":function(d){return "어떤 방향에 길이 있으면 동작을 실행합니다."},
"ifelseTooltip":function(d){return "어떤 방향에 길이 있으면 첫 번째 블럭의 동작들을 수행하고, 아니면 두 번째 블럭의 동작들을 수행합니다."},
"incrementOpponentScore":function(d){return "상대방 점수 올리기"},
"incrementOpponentScoreTooltip":function(d){return "현재 점수에 1점을 더합니다."},
"incrementPlayerScore":function(d){return "점수 올리기"},
"incrementPlayerScoreTooltip":function(d){return "점수판에 점수 저장하기"},
"isWall":function(d){return "벽이면"},
"isWallTooltip":function(d){return "벽이 있으면 \"참\"이 됩니다."},
"launchBall":function(d){return "새 공 준비"},
"launchBallTooltip":function(d){return "새로운 공을 셋팅합니다."},
"makeYourOwn":function(d){return "나만의 공 넘기기 게임 만들기"},
"moveDown":function(d){return "아래로 움직이기"},
"moveDownTooltip":function(d){return "라켓을 아래로 내립니다."},
"moveForward":function(d){return "move forward"},
"moveForwardTooltip":function(d){return "한 칸 앞으로 이동합니다."},
"moveLeft":function(d){return "왼쪽으로 움직이기"},
"moveLeftTooltip":function(d){return "라켓을 왼쪽으로 이동합니다."},
"moveRight":function(d){return "오른쪽으로 움직이기"},
"moveRightTooltip":function(d){return "라켓을 오른쪽으로 이동합니다."},
"moveUp":function(d){return "위로 올리기"},
"moveUpTooltip":function(d){return "라켓을 위로 이동시킵니다."},
"nextLevel":function(d){return "축하합니다! 퍼즐을 해결했습니다."},
"no":function(d){return "아니요"},
"noPathAhead":function(d){return "길이 막혔으면"},
"noPathLeft":function(d){return "왼쪽에 길이 없으면"},
"noPathRight":function(d){return "오른쪽에 길이 없으면"},
"numBlocksNeeded":function(d){return "%1 개의 블럭으로 퍼즐을 해결할 수 있습니다."},
"pathAhead":function(d){return "앞에 길이 있으면"},
"pathLeft":function(d){return "만약, 왼쪽에 길이 있으면"},
"pathRight":function(d){return "만약, 오른쪽에 길이 있으면"},
"pilePresent":function(d){return "흙더미가 있으면"},
"playSoundCrunch":function(d){return "부서지는 소리 출력"},
"playSoundGoal1":function(d){return "골 소리1 출력"},
"playSoundGoal2":function(d){return "골 소리2 출력"},
"playSoundHit":function(d){return "때리는 소리 출력"},
"playSoundLosePoint":function(d){return "실점 소리 출력"},
"playSoundLosePoint2":function(d){return "실점 소리2 출력"},
"playSoundRetro":function(d){return "옛날 소리 출력"},
"playSoundRubber":function(d){return "고무 소리 출력"},
"playSoundSlap":function(d){return "찰싹 소리 출력"},
"playSoundTooltip":function(d){return "선택 소리 출력"},
"playSoundWinPoint":function(d){return "득점 소리 출력"},
"playSoundWinPoint2":function(d){return "득점 소리2 출력"},
"playSoundWood":function(d){return "나무 소리 출력"},
"putdownTower":function(d){return "탑 놓기"},
"reinfFeedbackMsg":function(d){return "다시 시작하기 버튼을 눌러 게임을 다시 시작할 수 있습니다."},
"removeSquare":function(d){return "사각형 치우기"},
"repeatUntil":function(d){return "~할 때까지 반복"},
"repeatUntilBlocked":function(d){return "반복(~인 동안): 앞쪽에 길이 있으면"},
"repeatUntilFinish":function(d){return "반복(끝 날 때까지)"},
"scoreText":function(d){return "점수 : "+bounce_locale.v(d,"playerScore")+" : "+bounce_locale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "랜덤 배경 설정"},
"setBackgroundHardcourt":function(d){return "하드 코트 설정"},
"setBackgroundRetro":function(d){return "옛날 배경 설정"},
"setBackgroundTooltip":function(d){return "배경 그림 설정"},
"setBallRandom":function(d){return "랜덤 공 설정"},
"setBallHardcourt":function(d){return "하드 코트 공 설정"},
"setBallRetro":function(d){return "옛날 공 설정"},
"setBallTooltip":function(d){return "공의 이미지를 설정합니다."},
"setBallSpeedRandom":function(d){return "랜덤 스피드 공 설정"},
"setBallSpeedVerySlow":function(d){return "매우 느린 공 설정"},
"setBallSpeedSlow":function(d){return "느린 공 설정"},
"setBallSpeedNormal":function(d){return "보통 빠르기 공 설정"},
"setBallSpeedFast":function(d){return "빠른 공 설정"},
"setBallSpeedVeryFast":function(d){return "매우 빠른 공 설정"},
"setBallSpeedTooltip":function(d){return "공의 속도를 설정합니다."},
"setPaddleRandom":function(d){return "랜덤 라켓 설정"},
"setPaddleHardcourt":function(d){return "하드 코트 라켓 설정"},
"setPaddleRetro":function(d){return "옛날 라켓 설정"},
"setPaddleTooltip":function(d){return "라켓의 이미지를 설정합니다."},
"setPaddleSpeedRandom":function(d){return "랜덤 속도 라켓 설정"},
"setPaddleSpeedVerySlow":function(d){return "매우 느린 라켓 설정"},
"setPaddleSpeedSlow":function(d){return "느린 라켓 설정"},
"setPaddleSpeedNormal":function(d){return "보통 라켓 설정"},
"setPaddleSpeedFast":function(d){return "빠른 라켓 설정"},
"setPaddleSpeedVeryFast":function(d){return "매우 빠른 라켓 설정"},
"setPaddleSpeedTooltip":function(d){return "라켓의 속도를 설정합니다."},
"shareBounceTwitter":function(d){return "@codeorg 에서 만든 나의 게임을 살펴보세요."},
"shareGame":function(d){return "게임 공유하기:"},
"turnLeft":function(d){return "왼쪽으로 회전"},
"turnRight":function(d){return "오른쪽으로 회전"},
"turnTooltip":function(d){return "왼쪽이나 오른쪽으로 90 도 돕니다."},
"whenBallInGoal":function(d){return "공이 들어가면"},
"whenBallInGoalTooltip":function(d){return "공이 들어가면 아래의 동작을 실행합니다."},
"whenBallMissesPaddle":function(d){return "라켓이 공을 놓치면"},
"whenBallMissesPaddleTooltip":function(d){return "라켓이 공을 놓치면 아래의 동작을 실행합니다."},
"whenDown":function(d){return "아래 방향키를 누르면"},
"whenDownTooltip":function(d){return "아래 방향키를 누르면 아래의 동작을 실행합니다."},
"whenGameStarts":function(d){return "게임이 시작되면"},
"whenGameStartsTooltip":function(d){return "게임이 시작되면 아래 동작을 실행합니다."},
"whenLeft":function(d){return "왼쪽 방향키를 누르면"},
"whenLeftTooltip":function(d){return "왼쪽 방향키를 누르면 아래의 동작을 실행합니다."},
"whenPaddleCollided":function(d){return "라켓에 공이 부딪치면"},
"whenPaddleCollidedTooltip":function(d){return "라켓에 공이 부딪치면 아래의 동작을 실행합니다."},
"whenRight":function(d){return "오른쪽 방향키를 누르면"},
"whenRightTooltip":function(d){return "오른쪽 방향키를 누르면 아래의 동작을 실행합니다."},
"whenUp":function(d){return "위쪽 방향키를 누르면"},
"whenUpTooltip":function(d){return "위쪽 방향키를 누르면 아래의 동작을 실행합니다."},
"whenWallCollided":function(d){return "공이 벽에 부딪치면"},
"whenWallCollidedTooltip":function(d){return "공이 벽에 부딪치면 아래의 동작을 실행합니다."},
"whileMsg":function(d){return "반복(~인 동안):"},
"whileTooltip":function(d){return "어떤 조건이 될 때까지(~할 때까지), 반복적으로 실행합니다."},
"yes":function(d){return "예"}};