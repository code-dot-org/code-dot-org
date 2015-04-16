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
"badColorStringError":function(d){return "คุณใช้สีของสตริงที่ไม่ถูกต้อง: "+appLocale.v(d,"val")},
"badStyleStringError":function(d){return "คุณใช้แบบของสตริงที่ไม่ถูกต้อง: "+appLocale.v(d,"val")},
"circleBlockTitle":function(d){return "วงกลม (รัศมี แบบ สี)"},
"displayBlockTitle":function(d){return "การทดสอบ"},
"ellipseBlockTitle":function(d){return "วงรี (ความกว้าง ความสูง ลักษณะ สี)"},
"extraTopBlocks":function(d){return "คุณมีบล็อกที่แยกออกไป คุณหมายถึงว่าคุณจะแนบบล็อกเหล่านี้ไปที่ บล็อก \"การแสดงผล\" หรือไม่ ?"},
"infiniteRecursionError":function(d){return "ฟังก์ชันของคุณกำลังเรียกตัวเอง เราหยุดมันไว้ มิฉะนั้น มันจะเรียกตัวมันเองไปตลอด."},
"overlayBlockTitle":function(d){return "ซ้อนทับ (บน ล่าง)"},
"placeImageBlockTitle":function(d){return "เอารูปวาง (x, y, รูป)"},
"offsetBlockTitle":function(d){return "ออฟเซ็ต (x, y รูปภาพ)"},
"rectangleBlockTitle":function(d){return "สี่เหลี่ยม (กว้าง สูง รูปแบบ สี)"},
"reinfFeedbackMsg":function(d){return "คุณสามารถกดปุ่ม \"เล่นต่อ\" เพื่อแก้ไขรูปวาดของคุณ."},
"rotateImageBlockTitle":function(d){return "การหมุน (องศา รูป)"},
"scaleImageBlockTitle":function(d){return "การหดขยายมาตราส่วน (ปัจจัย รูปภาพ)"},
"squareBlockTitle":function(d){return "สี่เหลี่ยมจตุรัส (ขนาด รูปแบบ สี)"},
"starBlockTitle":function(d){return "ดาว (รัศมี แบบ สี)"},
"radialStarBlockTitle":function(d){return "รัศมีดาว (จุด ภายใน ภาย นอก รูปแบบ สี)"},
"polygonBlockTitle":function(d){return "รูปหลายเหลี่ยม (ด้าน ความยาว รูปแบบ สี)"},
"stringAppendBlockTitle":function(d){return "เพิ่มสตริง (ก่อน ที่สอง)"},
"stringLengthBlockTitle":function(d){return "ความยาวสตริง (สายอักขระ)"},
"textBlockTitle":function(d){return "ข้อความ (สตริง ขนาด สี)"},
"triangleBlockTitle":function(d){return "สามเหลี่ยม (ขนาด รูปแบบ สี)"},
"underlayBlockTitle":function(d){return "underlay (ด้านล่าง ด้านบน)"},
"outline":function(d){return "โครงร่าง"},
"solid":function(d){return "ของแข็ง"},
"string":function(d){return "อักขระ"},
"stringMismatchError":function(d){return "คุณมีสตริงที่มีการใช้อักษรตัวใหญ่ไม่ถูกต้อง."},
"userCodeException":function(d){return "ความผิดพลาดเกิดขึ้น ในขณะที่มีการดำเนินการของโปรแกรม."},
"wrongBooleanError":function(d){return "Your blocks evaluate to the wrong boolean value."}};