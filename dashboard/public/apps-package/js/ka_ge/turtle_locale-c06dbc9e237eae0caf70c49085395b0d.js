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
"blocksUsed":function(d){return "გამოყენებული ბლოკები: %1"},
"branches":function(d){return "ტოტები"},
"catColour":function(d){return "ფერი"},
"catControl":function(d){return "ციკლები"},
"catMath":function(d){return "მათემატიკა"},
"catProcedures":function(d){return "ფუნქციები"},
"catTurtle":function(d){return "მოქმედებები"},
"catVariables":function(d){return "ცვლადები"},
"catLogic":function(d){return "ლოგიკა"},
"colourTooltip":function(d){return "ცვლის ფანქრის ფერს."},
"createACircle":function(d){return "წრის შექმნა"},
"createSnowflakeSquare":function(d){return "კვადრატის ტიპის ფიფქის შექმნა"},
"createSnowflakeParallelogram":function(d){return "პარალელოგრამის ტიპის ფიფქის შექმნა"},
"createSnowflakeLine":function(d){return "ხაზის ტიპის ფიფქის შექმნა"},
"createSnowflakeSpiral":function(d){return "სპირალის ტიპის ფიფქის შექმნა"},
"createSnowflakeFlower":function(d){return "ყვავილის ტიპის ფიფქის შექმნა"},
"createSnowflakeFractal":function(d){return "ფრაქტალის ტიპის ფიფქის შექმნა"},
"createSnowflakeRandom":function(d){return "შემთხვევითი ტიპის ფიფქის შექმნა"},
"createASnowflakeBranch":function(d){return "ფიფქის ტოტის შექმნა"},
"degrees":function(d){return "გრადუსი"},
"depth":function(d){return "სიღრმე"},
"dots":function(d){return "პიქსელით"},
"drawASquare":function(d){return "კვადრატის დახატვა"},
"drawATriangle":function(d){return "სამკუთხედის დახატვა"},
"drawACircle":function(d){return "წრის დახატვა"},
"drawAFlower":function(d){return "ყვავილის დახატვა"},
"drawAHexagon":function(d){return "ექვსკუთხედის დახატვა"},
"drawAHouse":function(d){return "სახლის დახატვა"},
"drawAPlanet":function(d){return "პლანეტის დახატვა"},
"drawARhombus":function(d){return "რომბის დახატვა"},
"drawARobot":function(d){return "რობოტის დახატვა"},
"drawARocket":function(d){return "რაკეტის დახატვა"},
"drawASnowflake":function(d){return "ფიფქის დახატვა"},
"drawASnowman":function(d){return "თოვლის ქალის დახატვა"},
"drawAStar":function(d){return "ვარსკვლავის დახატვა"},
"drawATree":function(d){return "ხის დახატვა"},
"drawUpperWave":function(d){return "ზედა ტალღის დახატვა"},
"drawLowerWave":function(d){return "ქვედა ტალღის დახატვა"},
"drawStamp":function(d){return "შტამპის დახატვა"},
"heightParameter":function(d){return "სიმაღლე"},
"hideTurtle":function(d){return "მხატვრის დამალვა"},
"jump":function(d){return "ახტომა"},
"jumpBackward":function(d){return "უკან გადახტომა"},
"jumpForward":function(d){return "წინ გადახტომა"},
"jumpTooltip":function(d){return "მხატვრის გადაადგილება კვალის დატოვების გარეშე."},
"jumpEastTooltip":function(d){return "გადააადგილებს მხატვარს აღმოსავლეთით კვალის დატოვების გარეშე."},
"jumpNorthTooltip":function(d){return "კვალის დატოვების გარეშე გადააადგილებს მხატვარს ჩრდილოეთით."},
"jumpSouthTooltip":function(d){return "კვალის დატოვების გარეშე გადააადგილებს მხატვარს სამხრეთით."},
"jumpWestTooltip":function(d){return "კვალის დატოვების გარეშე გადააადგილებს მხატვარს დასავლეთით."},
"lengthFeedback":function(d){return "გადაადგილების სიგრძის გარდა ყველაფერი სწორია."},
"lengthParameter":function(d){return "სიგრძე"},
"loopVariable":function(d){return "მრიცხველი"},
"moveBackward":function(d){return "უკან გადაადგილება"},
"moveEastTooltip":function(d){return "გადააადგილებს მხატვარს აღმოსავლეთით."},
"moveForward":function(d){return "წინ გადაადგილება"},
"moveForwardTooltip":function(d){return "გადააადგილებს მხატვარს წინ."},
"moveNorthTooltip":function(d){return "გადააადგილებს მხატვარს ჩრდილოეთით."},
"moveSouthTooltip":function(d){return "გადააადგილებს მხატვარს სამხრეთით."},
"moveWestTooltip":function(d){return "გადააადგილებს მხატვარს დასავლეთით."},
"moveTooltip":function(d){return "განსაზღვრული ოდენობით გადააადგილებს მხატვარს წინ და უკან."},
"notBlackColour":function(d){return "ამ თავსატეხისთვის შავისგან განსხვავებული ფერის დაყენებაა საჭირო."},
"numBlocksNeeded":function(d){return "ამ თავსატეხის ამოხსნა შეიძლება %1 ბლოკით. შენ გამოიყენე %2."},
"penDown":function(d){return "ფანქრის დადება"},
"penTooltip":function(d){return "მაღლა ან დაბლა სწევს ფანქარს, ხატვის დასაწყებად ან შესაწყვეტად."},
"penUp":function(d){return "ფანქრის აწევა"},
"reinfFeedbackMsg":function(d){return "ესეც შენი ნახატი! განაგრძე მასზე მუშაობა ან გადადი შემდეგ თავსატეხზე."},
"setColour":function(d){return "ფერის განსაზღვრა"},
"setPattern":function(d){return "ნიმუშის შექმნა"},
"setWidth":function(d){return "სიგანის განსაზღვრა"},
"shareDrawing":function(d){return "გააზიარე შენი ნახატი:"},
"showMe":function(d){return "მაჩვენე"},
"showTurtle":function(d){return "მხატვრის ჩვენება"},
"sizeParameter":function(d){return "ზომა"},
"step":function(d){return "ნაბიჯი"},
"tooFewColours":function(d){return "ამ თავსატეხისთვის საჭიროა %1 მაინც განსხვავებული ფერის გამოყენება. შენ გამოიყენე მხოლოდ %2."},
"turnLeft":function(d){return "მარცხნივ მობრუნება"},
"turnRight":function(d){return "მარჯვნივ მობრუნება"},
"turnRightTooltip":function(d){return "განსაზღვრული გრადუსით აბრუნებს მხატვარს მარჯვნივ."},
"turnTooltip":function(d){return "გრადუსების განსაზღვრული რიცხვით აბრუნებს მხატვარს მარჯვნივ ან მარცხნივ."},
"turtleVisibilityTooltip":function(d){return "მხატვარს ხდის ხილულს ან უჩინარს."},
"widthTooltip":function(d){return "ცვლის ფანქრის სიგანეს."},
"wrongColour":function(d){return "შენი სურათი არასწორი ფერისაა. ამ თავსატეხისთვის, ის საჭიროა იყოს %1."}};