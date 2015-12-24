var turtle_locale = {lc:{"ar":function(n){
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
v:function(d,k){turtle_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){turtle_locale.c(d,k);return d[k] in p?p[d[k]]:(k=turtle_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){turtle_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).turtle_locale = {
"blocksUsed":function(d){return "블럭 사용: %1"},
"branches":function(d){return "가지 수"},
"catColour":function(d){return "색"},
"catControl":function(d){return "반복"},
"catMath":function(d){return "계산"},
"catProcedures":function(d){return "함수"},
"catTurtle":function(d){return "동작"},
"catVariables":function(d){return "변수"},
"catLogic":function(d){return "논리"},
"colourTooltip":function(d){return "펜의 색을 바꿉니다."},
"createACircle":function(d){return "원 만들기"},
"createSnowflakeSquare":function(d){return "사각형 형태의 눈송이 만들기"},
"createSnowflakeParallelogram":function(d){return "평행사변형 형태의 눈송이 만들기"},
"createSnowflakeLine":function(d){return "선 형태의 눈송이 만들기"},
"createSnowflakeSpiral":function(d){return "나선형 형태의 눈송이 만들기"},
"createSnowflakeFlower":function(d){return "꽃 형태의 눈송이 만들기"},
"createSnowflakeFractal":function(d){return "프랙탈 형태의 눈송이 만들기"},
"createSnowflakeRandom":function(d){return "랜덤 형태의 눈송이 만들기"},
"createASnowflakeBranch":function(d){return "가지 형태의 눈송이 만들기"},
"degrees":function(d){return "도"},
"depth":function(d){return "깊이"},
"dots":function(d){return "픽셀"},
"drawACircle":function(d){return "원 그리기"},
"drawAFlower":function(d){return "꽃 그리기"},
"drawAHexagon":function(d){return "6각형 그리기"},
"drawAHouse":function(d){return "집 그리기"},
"drawAPlanet":function(d){return "식물 그리기"},
"drawARhombus":function(d){return "마름모 그리기"},
"drawARobot":function(d){return "로봇 그리기"},
"drawARocket":function(d){return "로켓 그리기"},
"drawASnowflake":function(d){return "해바라기 그리기"},
"drawASnowman":function(d){return "눈사람 그리기"},
"drawASquare":function(d){return "사각형 그리기"},
"drawAStar":function(d){return "별 그리기"},
"drawATree":function(d){return "나무 그리기"},
"drawATriangle":function(d){return "삼각형 그리기"},
"drawUpperWave":function(d){return "위로 올라가는 물결 그리기"},
"drawLowerWave":function(d){return "아래로 내려가는 물결 그리기"},
"drawStamp":function(d){return "도장 그리기"},
"heightParameter":function(d){return "높이"},
"hideTurtle":function(d){return "예술가 숨기기"},
"jump":function(d){return "점프"},
"jumpBackward":function(d){return "뒤로 점프:"},
"jumpForward":function(d){return "앞으로 점프:"},
"jumpTooltip":function(d){return "아무것도 그리지 않고, 원하는 위치로 바로 이동시킵니다."},
"jumpEastTooltip":function(d){return "예술가를 오른쪽으로 점프시킵니다."},
"jumpNorthTooltip":function(d){return "예술가를 위쪽으로 점프시킵니다."},
"jumpSouthTooltip":function(d){return "예술가를 아래쪽으로 점프시킵니다."},
"jumpWestTooltip":function(d){return "예술가를 왼쪽으로 점프시킵니다."},
"lengthFeedback":function(d){return "이동 거리를 벗어났습니다."},
"lengthParameter":function(d){return "length"},
"loopVariable":function(d){return "counter"},
"moveBackward":function(d){return "뒤로 이동:"},
"moveEastTooltip":function(d){return "예술가를 오른쪽으로 이동시킵니다."},
"moveForward":function(d){return "앞으로 이동:"},
"moveForwardTooltip":function(d){return "예술가를 전진시킵니다."},
"moveNorthTooltip":function(d){return "예술가를 위쪽으로 이동시킵니다."},
"moveSouthTooltip":function(d){return "예술가를 아래쪽으로 이동시킵니다."},
"moveWestTooltip":function(d){return "예술가를 왼쪽으로 이동시킵니다."},
"moveTooltip":function(d){return "예술가를 원하는 만큼 전진(앞으로 이동) 또는 후진(뒤로 이동) 시킵니다."},
"notBlackColour":function(d){return "이 퍼즐에서는 검정색이 아닌, 다른 선 색을 사용해야합니다."},
"numBlocksNeeded":function(d){return "블럭 %1 개로 해결할 수 있습니다. 현재 %2 개의 블럭을 사용했습니다."},
"penDown":function(d){return "펜 내리기"},
"penTooltip":function(d){return "펜을 올려 선을 그리지 않거나, 펜을 내려 선을 그립니다."},
"penUp":function(d){return "펜 올리기"},
"reinfFeedbackMsg":function(d){return "만든 그림이 여기 있습니다! 계속 하거나 다음 퍼즐로 이동하세요!"},
"setAlpha":function(d){return "alpha 설정"},
"setColour":function(d){return "색 설정:"},
"setPattern":function(d){return "패턴 설정"},
"setWidth":function(d){return "set width"},
"shareDrawing":function(d){return "그림 공개하기:"},
"showMe":function(d){return "보이기"},
"showTurtle":function(d){return "예술가 보이기"},
"sizeParameter":function(d){return "크기"},
"step":function(d){return "단계"},
"tooFewColours":function(d){return "이 퍼즐에서는 적어도 %1 개 이상의 색을 사용해야 합니다. 현재 %2 개의 색을 사용했습니다."},
"turnLeft":function(d){return "왼쪽으로 돌기:"},
"turnRight":function(d){return "오른쪽으로 돌기:"},
"turnRightTooltip":function(d){return "예술가를 원하는 각도 만큼 회전시킵니다."},
"turnTooltip":function(d){return "예술가를 원하는 각도 만큼, 왼쪽이나 오른쪽으로 회전시킵니다."},
"turtleVisibilityTooltip":function(d){return "예술가를 보이거나 보이지 않도록 합니다."},
"widthTooltip":function(d){return "펜의 두께를 바꿉니다."},
"wrongColour":function(d){return "색이 다릅니다. %1 색 이어야 합니다."}};