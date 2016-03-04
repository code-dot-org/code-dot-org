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
"blocksUsed":function(d){return "已使用 %1 個程式積木"},
"branches":function(d){return "分支"},
"catColour":function(d){return "顏色"},
"catControl":function(d){return "迴圈類別"},
"catMath":function(d){return "運算類別"},
"catProcedures":function(d){return "函數類別"},
"catTurtle":function(d){return "動作類別"},
"catVariables":function(d){return "變數類別"},
"catLogic":function(d){return "邏輯類別"},
"colourTooltip":function(d){return "變更畫筆顏色。"},
"createACircle":function(d){return "建立一個圓圈"},
"createSnowflakeSquare":function(d){return "建立方形型態的雪花"},
"createSnowflakeParallelogram":function(d){return "建立平行四邊形型態的雪花"},
"createSnowflakeLine":function(d){return "建立直線型態的雪花"},
"createSnowflakeSpiral":function(d){return "建立螺旋型態的雪花"},
"createSnowflakeFlower":function(d){return "建立花朵型態的雪花"},
"createSnowflakeFractal":function(d){return "建立不規則型態的雪花"},
"createSnowflakeRandom":function(d){return "建立隨機型態的雪花"},
"createASnowflakeBranch":function(d){return "建立雪花分支"},
"degrees":function(d){return "度"},
"depth":function(d){return "深度"},
"dots":function(d){return "像素 "},
"drawACircle":function(d){return "畫一個圓形"},
"drawAFlower":function(d){return "畫一朵花"},
"drawAHexagon":function(d){return "畫個六邊形"},
"drawAHouse":function(d){return "畫一間房子"},
"drawAPlanet":function(d){return "畫一顆行星"},
"drawARhombus":function(d){return "畫一個菱形"},
"drawARobot":function(d){return "畫一個機器人"},
"drawARocket":function(d){return "畫一個火箭"},
"drawASnowflake":function(d){return "畫一片雪花"},
"drawASnowman":function(d){return "畫一個雪人"},
"drawASquare":function(d){return "畫一個正方形"},
"drawAStar":function(d){return "畫一顆星星"},
"drawATree":function(d){return "畫一棵樹"},
"drawATriangle":function(d){return "畫一個三角形"},
"drawUpperWave":function(d){return "繪製上層波"},
"drawLowerWave":function(d){return "繪製下層波"},
"drawStamp":function(d){return "繪製圖章"},
"heightParameter":function(d){return "高度"},
"hideTurtle":function(d){return "將藝術家隱藏"},
"jump":function(d){return "跳"},
"jumpBackward":function(d){return "向後跳"},
"jumpForward":function(d){return "向前跳"},
"jumpTooltip":function(d){return "移動藝術家而不留下任何記號"},
"jumpEastTooltip":function(d){return "不留下任何痕跡下把演出者向東移動"},
"jumpNorthTooltip":function(d){return "不留下任何痕跡下把演出者向北移動"},
"jumpSouthTooltip":function(d){return "不留下任何痕跡下把演出者向南移動"},
"jumpWestTooltip":function(d){return "不留下任何痕跡下把演出者向西移動"},
"lengthFeedback":function(d){return "你答對了除了移動的長度。"},
"lengthParameter":function(d){return "長度"},
"loopVariable":function(d){return "計數器"},
"moveBackward":function(d){return "向後移動"},
"moveEastTooltip":function(d){return "把演出者向東移動"},
"moveForward":function(d){return "向前移動"},
"moveForwardTooltip":function(d){return "將藝術家向前移動"},
"moveNorthTooltip":function(d){return "把演出者向北移動"},
"moveSouthTooltip":function(d){return "把演出者向南移動"},
"moveWestTooltip":function(d){return "把演出者向西移動"},
"moveTooltip":function(d){return "將藝術家向前或向後移動特定的步數。"},
"notBlackColour":function(d){return "你必需設定黑色以外的顏色來完成這個關卡。"},
"numBlocksNeeded":function(d){return "這個關卡可以使用 %1 程式積木來完成。  你使用了 %2 個程式積木。"},
"penDown":function(d){return "下筆"},
"penTooltip":function(d){return "使用\"下筆\"或\"停筆\"來開始或停止繪畫動作。"},
"penUp":function(d){return "停筆"},
"reinfFeedbackMsg":function(d){return "這是您的繪圖 ！繼續努力或者開始下一個謎題。"},
"setAlpha":function(d){return "設定半透明值"},
"setColour":function(d){return "設定顏色"},
"setPattern":function(d){return "設定模式"},
"setWidth":function(d){return "設定寬度"},
"shareDrawing":function(d){return "分享您的畫作"},
"showMe":function(d){return "顯示"},
"showTurtle":function(d){return "顯示藝術家"},
"sizeParameter":function(d){return "大小"},
"step":function(d){return "一步"},
"tooFewColours":function(d){return "你必需使用至少 %1 種不同的顏色來完成這個關卡。你只使用了 %2 種顏色。"},
"turnLeft":function(d){return "向左轉"},
"turnRight":function(d){return "向右轉"},
"turnRightTooltip":function(d){return "將藝術家向右轉動指定的角度"},
"turnTooltip":function(d){return "將藝術家向左轉動指定的角度"},
"turtleVisibilityTooltip":function(d){return "將藝術家隱藏或顯示。"},
"widthTooltip":function(d){return "更改畫筆的粗細。"},
"wrongColour":function(d){return "你圖形的顏色是錯誤的。在這個關卡中，它必須是 %1。"}};