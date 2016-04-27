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
"blocksUsed":function(d){return "使用了的模块：%1"},
"branches":function(d){return "分支"},
"catColour":function(d){return "颜色"},
"catControl":function(d){return "循环"},
"catMath":function(d){return "数学"},
"catProcedures":function(d){return "函数"},
"catTurtle":function(d){return "行为"},
"catVariables":function(d){return "变量"},
"catLogic":function(d){return "逻辑"},
"colourTooltip":function(d){return "更改铅笔的颜色。"},
"createACircle":function(d){return "创建一个圆形"},
"createSnowflakeSquare":function(d){return "创建方形的雪花"},
"createSnowflakeParallelogram":function(d){return "创建平行四边形的雪花"},
"createSnowflakeLine":function(d){return "创造线型的雪花"},
"createSnowflakeSpiral":function(d){return "创造螺旋型的雪花"},
"createSnowflakeFlower":function(d){return "创建花型的雪花"},
"createSnowflakeFractal":function(d){return "创建分形的雪花"},
"createSnowflakeRandom":function(d){return "创建随机类型的雪花"},
"createASnowflakeBranch":function(d){return "创建一个雪花分支"},
"degrees":function(d){return "度"},
"depth":function(d){return "深度"},
"dots":function(d){return "像素"},
"drawACircle":function(d){return "画一个圆圈"},
"drawAFlower":function(d){return "画一朵花"},
"drawAHexagon":function(d){return "绘制一个六边形"},
"drawAHouse":function(d){return "画一个房子"},
"drawAPlanet":function(d){return "画一颗行星"},
"drawARhombus":function(d){return "绘制菱形"},
"drawARobot":function(d){return "画一个机器人"},
"drawARocket":function(d){return "画一枚火箭"},
"drawASnowflake":function(d){return "画一朵雪花"},
"drawASnowman":function(d){return "绘制一个雪人"},
"drawASquare":function(d){return "绘制一个正方形"},
"drawAStar":function(d){return "画一个星星"},
"drawATree":function(d){return "画一棵树"},
"drawATriangle":function(d){return "绘制一个三角形"},
"drawUpperWave":function(d){return "绘制上波浪"},
"drawLowerWave":function(d){return "绘制下波浪"},
"drawStamp":function(d){return "画图章"},
"heightParameter":function(d){return "高度"},
"hideTurtle":function(d){return "隐藏艺术家"},
"jump":function(d){return "跳转"},
"jumpBackward":function(d){return "向后跳"},
"jumpForward":function(d){return "向前跳"},
"jumpTooltip":function(d){return "不着痕迹地移动艺术家。"},
"jumpEastTooltip":function(d){return "将艺术家向东移动，不留下任何痕迹。"},
"jumpNorthTooltip":function(d){return "将艺术家向北移动，不留下任何痕迹。"},
"jumpSouthTooltip":function(d){return "将艺术家向男移动，不留下任何痕迹。"},
"jumpWestTooltip":function(d){return "将艺术家向西移动，不留下任何痕迹。"},
"lengthFeedback":function(d){return "你答对了正确移动的长度。"},
"lengthParameter":function(d){return "长度"},
"loopVariable":function(d){return "计数器"},
"moveBackward":function(d){return "向后移动"},
"moveEastTooltip":function(d){return "把艺术家向东移动"},
"moveForward":function(d){return "向前移动"},
"moveForwardTooltip":function(d){return "向前移动艺术家。"},
"moveNorthTooltip":function(d){return "把艺术家向北移动"},
"moveSouthTooltip":function(d){return "把艺术家向南移动"},
"moveWestTooltip":function(d){return "把艺术家向西移动"},
"moveTooltip":function(d){return "将艺术家向前或向后移动指定的量。"},
"notBlackColour":function(d){return "您需要为这个谜题设置除黑色以外的一个颜色。"},
"numBlocksNeeded":function(d){return "使用 %1 个模块可以解决这个谜题。你使用了 %2 个。"},
"penDown":function(d){return "下移铅笔"},
"penTooltip":function(d){return "上下移动铅笔来启动或停止绘图。"},
"penUp":function(d){return "上移铅笔"},
"reinfFeedbackMsg":function(d){return "这里是您的绘图 ！再次尝试来接着做下去，或者点击“继续”开始下一关。"},
"setAlpha":function(d){return "设置透明度"},
"setColour":function(d){return "设置颜色"},
"setPattern":function(d){return "设定模式"},
"setWidth":function(d){return "设置宽度"},
"shareDrawing":function(d){return "分享您的图画："},
"showMe":function(d){return "显示"},
"showTurtle":function(d){return "显示艺术家"},
"sizeParameter":function(d){return "大小"},
"step":function(d){return "步进："},
"tooFewColours":function(d){return "该谜题你需要至少使用 %1个不同颜色。你只是用了%2个。"},
"turnLeft":function(d){return "向左转"},
"turnRight":function(d){return "向右转"},
"turnRightTooltip":function(d){return "把艺术家向右转指定的角度。"},
"turnTooltip":function(d){return "把艺术家向左或向右转指定的角度。"},
"turtleVisibilityTooltip":function(d){return "使艺术家可见或不可见。"},
"widthTooltip":function(d){return "更改铅笔的宽度。"},
"wrongColour":function(d){return "您的图片显示颜色是错误的。该谜题需要颜色是 %1。"}};