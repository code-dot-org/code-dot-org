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
"continue":function(d){return "계속하기"},
"doCode":function(d){return "do"},
"elseCode":function(d){return "else"},
"endGame":function(d){return "게임 끝내기"},
"endGameTooltip":function(d){return "게임 종료"},
"finalLevel":function(d){return "축하합니다! 마지막 퍼즐을 해결했습니다."},
"flap":function(d){return "펄럭이기"},
"flapRandom":function(d){return "랜덤으로 펄럭이기"},
"flapVerySmall":function(d){return "매우 조금 펄럭이기"},
"flapSmall":function(d){return "조금 펄럭이기"},
"flapNormal":function(d){return "펄럭이기"},
"flapLarge":function(d){return "많이 펄럭이기"},
"flapVeryLarge":function(d){return "매우 많이 펄럭이기"},
"flapTooltip":function(d){return "플래피를 위로 날게 하기"},
"flappySpecificFail":function(d){return "적합한 코드입니다. - 클릭할 때마다 펄럭여 올라갑니다. 목표에 도착하려면 많이 클릭해야 합니다."},
"incrementPlayerScore":function(d){return "포인트 얻음"},
"incrementPlayerScoreTooltip":function(d){return "현재 플레이어의 점수를 1점 올립니다."},
"nextLevel":function(d){return "축하합니다! 퍼즐을 해결했습니다."},
"no":function(d){return "아니요"},
"numBlocksNeeded":function(d){return "%1 개의 블럭으로 퍼즐을 해결할 수 있습니다."},
"playSoundRandom":function(d){return "랜덤 소리 출력"},
"playSoundBounce":function(d){return "튕김 소리 출력"},
"playSoundCrunch":function(d){return "부서지는 소리 출력"},
"playSoundDie":function(d){return "아픈 소리 출력"},
"playSoundHit":function(d){return "때리는 소리 출력"},
"playSoundPoint":function(d){return "점수 소리 출력"},
"playSoundSwoosh":function(d){return "휙 소리 출력"},
"playSoundWing":function(d){return "날개 소리 출력"},
"playSoundJet":function(d){return "제트기 소리 출력"},
"playSoundCrash":function(d){return "충돌 소리 출력"},
"playSoundJingle":function(d){return "따르릉 소리 출력"},
"playSoundSplash":function(d){return "철푸덕 소리 출력"},
"playSoundLaser":function(d){return "레이저 소리 출력"},
"playSoundTooltip":function(d){return "선택 소리 출력"},
"reinfFeedbackMsg":function(d){return "다시 시도하기 버튼을 눌러 게임을 다시 시작할 수 있습니다."},
"scoreText":function(d){return "점수 : "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "배경 설정"},
"setBackgroundRandom":function(d){return "랜덤 배경 설정"},
"setBackgroundFlappy":function(d){return "도시(낮) 배경 설정"},
"setBackgroundNight":function(d){return "도시(밤) 배경 설정"},
"setBackgroundSciFi":function(d){return "공상과학 배경 설정"},
"setBackgroundUnderwater":function(d){return "물속 배경 설정"},
"setBackgroundCave":function(d){return "동굴 배경 설정"},
"setBackgroundSanta":function(d){return "산타 배경 설정"},
"setBackgroundTooltip":function(d){return "배경 이미지 설정"},
"setGapRandom":function(d){return "랜덤 간격 설정"},
"setGapVerySmall":function(d){return "아주 작은 간격 설정"},
"setGapSmall":function(d){return "작은 간격 설정"},
"setGapNormal":function(d){return "보통 간격 설정"},
"setGapLarge":function(d){return "큰 간격 설정"},
"setGapVeryLarge":function(d){return "아주 큰 간격 설정"},
"setGapHeightTooltip":function(d){return "물체 위로 간격 설정"},
"setGravityRandom":function(d){return "랜덤 중력 설정"},
"setGravityVeryLow":function(d){return "매우 낮은 중력 설정"},
"setGravityLow":function(d){return "낮은 중력 설정"},
"setGravityNormal":function(d){return "보통 중력 설정"},
"setGravityHigh":function(d){return "높은 중력 설정"},
"setGravityVeryHigh":function(d){return "매우 높은 중력 설정"},
"setGravityTooltip":function(d){return "중력의 정도를 설정합니다."},
"setGround":function(d){return "바닥 설정"},
"setGroundRandom":function(d){return "랜덤 바닥 설정"},
"setGroundFlappy":function(d){return "일반 바닥 설정"},
"setGroundSciFi":function(d){return "공상과학 바닥 설정"},
"setGroundUnderwater":function(d){return "물속 바닥 설정"},
"setGroundCave":function(d){return "동굴 바닥 설정"},
"setGroundSanta":function(d){return "산타 바닥 설정"},
"setGroundLava":function(d){return "용암 바닥 설정"},
"setGroundTooltip":function(d){return "바닥 이미지 설정"},
"setObstacle":function(d){return "물체 설정"},
"setObstacleRandom":function(d){return "랜덤 물체 설정"},
"setObstacleFlappy":function(d){return "파이프 물체 설정"},
"setObstacleSciFi":function(d){return "공상과학 물체 설정"},
"setObstacleUnderwater":function(d){return "나무 물체 설정"},
"setObstacleCave":function(d){return "동굴 물체 설정"},
"setObstacleSanta":function(d){return "굴뚝 물체 설정"},
"setObstacleLaser":function(d){return "레이저 물체 설정"},
"setObstacleTooltip":function(d){return "물체 이미지 설정"},
"setPlayer":function(d){return "플레이어 설정"},
"setPlayerRandom":function(d){return "랜덤 플레이어 설정"},
"setPlayerFlappy":function(d){return "노랑새 플레이어 설정"},
"setPlayerRedBird":function(d){return "빨강새 플레이어 설정"},
"setPlayerSciFi":function(d){return "우주선 플레이어 설정"},
"setPlayerUnderwater":function(d){return "물고기 플레이어 설정"},
"setPlayerCave":function(d){return "박쥐 플레이어 설정"},
"setPlayerSanta":function(d){return "싼타 플레이어 설정"},
"setPlayerShark":function(d){return "상어 플레이어 설정"},
"setPlayerEaster":function(d){return "부활절토끼 플레이어 설정"},
"setPlayerBatman":function(d){return "배트가이 플레이어 설정"},
"setPlayerSubmarine":function(d){return "잠수함 플레이어 설정"},
"setPlayerUnicorn":function(d){return "유니콘 플레이어 설정"},
"setPlayerFairy":function(d){return "요정 플레이어 설정"},
"setPlayerSuperman":function(d){return "플래피맨 플레이어 설정"},
"setPlayerTurkey":function(d){return "칠면조 플레이어 설정"},
"setPlayerTooltip":function(d){return "플레이어 이미지 설정"},
"setScore":function(d){return "점수 등록"},
"setScoreTooltip":function(d){return "플레이어의 점수를 등록합니다."},
"setSpeed":function(d){return "스피드 설정"},
"setSpeedTooltip":function(d){return "레벨 스피드 설정"},
"shareFlappyTwitter":function(d){return "@codeorg 에서 내가 직접 만든 플래피 게임을 해보세요."},
"shareGame":function(d){return "게임 공유하기:"},
"soundRandom":function(d){return "random(랜덤)"},
"soundBounce":function(d){return "튕기게 하기"},
"soundCrunch":function(d){return "부서지는 소리"},
"soundDie":function(d){return "아픔 소리"},
"soundHit":function(d){return "때리는 소리"},
"soundPoint":function(d){return "점수 소리"},
"soundSwoosh":function(d){return "휙 소리"},
"soundWing":function(d){return "날개 소리"},
"soundJet":function(d){return "제트기 소리"},
"soundCrash":function(d){return "충돌 소리"},
"soundJingle":function(d){return "따르릉 소리"},
"soundSplash":function(d){return "튕김 소리"},
"soundLaser":function(d){return "레이저 소리"},
"speedRandom":function(d){return "랜덤 스피드 설정"},
"speedVerySlow":function(d){return "매우 느린 스피드 설정"},
"speedSlow":function(d){return "느린 스피드 설정"},
"speedNormal":function(d){return "보통 스피드 설정"},
"speedFast":function(d){return "빠른 스피드 설정"},
"speedVeryFast":function(d){return "매우 빠른 스피드 설정"},
"whenClick":function(d){return "클릭했을 때"},
"whenClickTooltip":function(d){return "클릭 이벤트가 발생하면 아래의 동작을 실행합니다."},
"whenCollideGround":function(d){return "땅에 떨어지면"},
"whenCollideGroundTooltip":function(d){return "플래피가 땅에 떨어지면 아래 동작을 실행합니다."},
"whenCollideObstacle":function(d){return "물체에 부딪치면"},
"whenCollideObstacleTooltip":function(d){return "플래피가 물체에 부딪치면 아래 동작을 실행합니다."},
"whenEnterObstacle":function(d){return "물체를 통과하면"},
"whenEnterObstacleTooltip":function(d){return "물체를 통과하면 아래 동작을 실행합니다."},
"whenRunButtonClick":function(d){return "게임을 시작하면"},
"whenRunButtonClickTooltip":function(d){return "게임을 시작하면 아래 동작을 실행합니다."},
"yes":function(d){return "예"}};