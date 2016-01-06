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
"blocksUsed":function(d){return "استعمال کیے گۓ بلاک: %1"},
"branches":function(d){return "شاخیں"},
"catColour":function(d){return "رنگ بھریں"},
"catControl":function(d){return "لوپس"},
"catMath":function(d){return "ریاضی"},
"catProcedures":function(d){return "Functions"},
"catTurtle":function(d){return "ایکشنز"},
"catVariables":function(d){return "متغیرات"},
"catLogic":function(d){return "منطق"},
"colourTooltip":function(d){return "پنسل کا رنگ تبدیل کرتا ہے."},
"createACircle":function(d){return "ایک دائرہ بنائیں"},
"createSnowflakeSquare":function(d){return "اسکوائر ٹائپ کا سنوفلیک کری-ایٹ کریں"},
"createSnowflakeParallelogram":function(d){return "اسکوائر ٹائپ کا سنوفلیک کری-ایٹ کریں"},
"createSnowflakeLine":function(d){return "ایک سنوفلیک ٹائپ کی لائن کری-ایٹ کریں"},
"createSnowflakeSpiral":function(d){return "ایک سنوفلیک ٹائپ کا اسپائرل کری-ایٹ کریں"},
"createSnowflakeFlower":function(d){return "ایک سنوفلیک ٹائپ کا فلاور کری-ایٹ کریں"},
"createSnowflakeFractal":function(d){return "ایک سنوفلیک ٹائپ کا فریکٹل کری-ایٹ کریں"},
"createSnowflakeRandom":function(d){return "ایک سنوفلیک ٹائپ کا رینڈم کری-ایٹ کریں"},
"createASnowflakeBranch":function(d){return "ایک سنوفلیک برانچ کری-ایٹ کریں"},
"degrees":function(d){return "ڈگریز"},
"depth":function(d){return "گہرائی"},
"dots":function(d){return "پکسلز"},
"drawACircle":function(d){return "ایک دائرہ بنائیں"},
"drawAFlower":function(d){return "ایک پھول بنائیں"},
"drawAHexagon":function(d){return "ایک ھیگزاگون کا خاکہ بنائیں"},
"drawAHouse":function(d){return "ایک گھر بنائیں"},
"drawAPlanet":function(d){return "ایک سیّارہ بنائیں"},
"drawARhombus":function(d){return "ایک روھمبس کا خاکہ بنائیں"},
"drawARobot":function(d){return "ایک روبوٹ کا خاکہ بنائیں"},
"drawARocket":function(d){return "ایک راکٹ کا خاکہ بنائیں"},
"drawASnowflake":function(d){return "ایک سنوفلیک کا خاکہ بنائیں"},
"drawASnowman":function(d){return "ایک سنومین کا خاکہ بنائیں"},
"drawASquare":function(d){return "ایک مربع بنائیں"},
"drawAStar":function(d){return "ایک ستارہ کا خاکہ بنائیں"},
"drawATree":function(d){return "ایک درخت کا خاکہ بنائیں"},
"drawATriangle":function(d){return "ایک مثلث بنائیں"},
"drawUpperWave":function(d){return "ایک اَپر-ویو (اونچی لہر) کا خاکہ بنائیں"},
"drawLowerWave":function(d){return "ایک لوئر ویو (نچلی لہر) کا خاکہ بنائیں"},
"drawStamp":function(d){return "اسٹیمپ کا خاکہ بنائیں"},
"heightParameter":function(d){return "height"},
"hideTurtle":function(d){return "فن کار چھپائیں"},
"jump":function(d){return "چھلانگ لگایں"},
"jumpBackward":function(d){return "پیچھے کی طرف چھلانگ لگائیں"},
"jumpForward":function(d){return "آگے کی طرف چھلانگ لگائیں"},
"jumpTooltip":function(d){return "یہ کوئی بھی نشانات چھوڑے بغیر آرٹسٹ کو موو کرتا ہے۔"},
"jumpEastTooltip":function(d){return "یہ کوئی بھی نشانات چھوڑے بغیر آرٹسٹ کو مشرق کی جانب موو کرتا ہے۔"},
"jumpNorthTooltip":function(d){return "یہ کوئی بھی نشانات چھوڑے بغیر آرٹسٹ کو شمال کی جانب موو کرتا ہے۔"},
"jumpSouthTooltip":function(d){return "کوئی بھی نشانات چھوڑے بغیر آرٹسٹ کو جنوب کی جانب موو کرتا ہے۔"},
"jumpWestTooltip":function(d){return "یہ کوئی بھی نشانات چھوڑے بغیر آرٹسٹ کو مغرب کی جانب موڑتا ہے۔"},
"lengthFeedback":function(d){return "تم نے ٹھیک سمجھا ماسوائے ان لینتھس (لمبائیوں) کو موو کرنے کے۔"},
"lengthParameter":function(d){return "لمبائی"},
"loopVariable":function(d){return "گنتی کرنے والا"},
"moveBackward":function(d){return "بیک-ورڈ موو کریں"},
"moveEastTooltip":function(d){return "مصور کو مشرق کی طرف بڑھاتا ہے."},
"moveForward":function(d){return "فارورڈ موو کریں"},
"moveForwardTooltip":function(d){return "یہ آرٹسٹ کو فارورڈ موو کرتا ہے۔"},
"moveNorthTooltip":function(d){return "مصور کو جنوب کی طرف بڑھاتا ہے."},
"moveSouthTooltip":function(d){return "مصور کو جنوب کی طرف بڑھاتا ہے."},
"moveWestTooltip":function(d){return "مصور کو مغرب کی طرف بڑھاتا ہے."},
"moveTooltip":function(d){return "مخصوص قدر کے مطابق آرٹسٹ کو فارورڈ یا بیک-ورڈ موو کرتا ہے۔"},
"notBlackColour":function(d){return "آپ کو اس پزل کے لیے سیاہ کے علاوہ دیگر رنگوں کے سیٹ کرنے ضرورت ہوگی"},
"numBlocksNeeded":function(d){return "یہ پزل %1 بلاک کے ساتھ حل کیا جاسکتا ہے۔ آپ نے %2 استعمال کیا ہے۔"},
"penDown":function(d){return "پنسل نیچے"},
"penTooltip":function(d){return "ڈرائنگ شروع کرنے یا روکنے کے لیے، پینسل کو اٹھاتا یا جھکاتا ہے۔"},
"penUp":function(d){return "پنسل اَپ"},
"reinfFeedbackMsg":function(d){return "یہاں ہے آپ کی ڈرائنگ! اس پر کام کرتے رہیں یا اگلے سوال پر چلیں."},
"setAlpha":function(d){return "سیٹ ایلفا"},
"setColour":function(d){return "سیٹ کلر"},
"setPattern":function(d){return "سیٹ پیٹرن"},
"setWidth":function(d){return "سیٹ وڈتھ"},
"shareDrawing":function(d){return "اپنی ڈرائنگ دوسروں کو دکھائیں:"},
"showMe":function(d){return "مجھے دکھاؤ"},
"showTurtle":function(d){return "شو آرٹسٹ"},
"sizeParameter":function(d){return "size"},
"step":function(d){return "اسٹیپ"},
"tooFewColours":function(d){return "اس پزل کے لیے آپ کو کم از کم %1 مختلف کلرز استعمال کرنے کی ضرورت ہے۔ آپ نے صرف %2 استعمال کیا ہے۔"},
"turnLeft":function(d){return "بائیں طرف پلٹیں"},
"turnRight":function(d){return "دائیں طرف پلٹیں"},
"turnRightTooltip":function(d){return "مصور کو مخصوص زاویہ سے دائیں جانب موڑتا ہے."},
"turnTooltip":function(d){return "مصورکو بتائے گۓ ڈگری کے مطابق بائیں یا دائیں موڑتا ہے."},
"turtleVisibilityTooltip":function(d){return "مصور کو دکھاتا یا چھپاتا ہے."},
"widthTooltip":function(d){return "پنسل کی چوڑائی بدلتا ہے."},
"wrongColour":function(d){return "آپ کی تصویر غلط رنگ کی ہے. اس سوال کے لیے، اسے %1 ہونا چاہئیے."}};