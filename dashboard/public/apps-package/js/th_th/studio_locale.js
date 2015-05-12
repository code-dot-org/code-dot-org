var studio_locale = {lc:{"ar":function(n){
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
v:function(d,k){studio_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){studio_locale.c(d,k);return d[k] in p?p[d[k]]:(k=studio_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){studio_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).studio_locale = {
"actor":function(d){return "นักแสดง"},
"alienInvasion":function(d){return "การบุกรุกของต่างดาว!"},
"backgroundBlack":function(d){return "สีดำ"},
"backgroundCave":function(d){return "ถ้ำ"},
"backgroundCloudy":function(d){return "มีเมฆมาก"},
"backgroundHardcourt":function(d){return "hardcourt"},
"backgroundNight":function(d){return "กลางคืน"},
"backgroundUnderwater":function(d){return "ใต้น้ำ"},
"backgroundCity":function(d){return "เมือง"},
"backgroundDesert":function(d){return "ทะเลทราย"},
"backgroundRainbow":function(d){return "รุ้งกินนำ้"},
"backgroundSoccer":function(d){return "ฟุตบอล"},
"backgroundSpace":function(d){return "พื้นที่ว่าง"},
"backgroundTennis":function(d){return "เทนนิส"},
"backgroundWinter":function(d){return "ฤดูหนาว"},
"catActions":function(d){return "การดำเนินการ"},
"catControl":function(d){return "ลูป"},
"catEvents":function(d){return "เหตุการณ์"},
"catLogic":function(d){return "ตรรกะ"},
"catMath":function(d){return "คำนวณ"},
"catProcedures":function(d){return "ฟังก์ชัน"},
"catText":function(d){return "ข้อความ"},
"catVariables":function(d){return "ตัวแปร"},
"changeScoreTooltip":function(d){return "เพิ่ม หรือลบ หนึ่งคะแนน."},
"changeScoreTooltipK1":function(d){return "เพิ่มให้ หนึ่งคะแนน."},
"continue":function(d){return "ดำเนินการต่อไป"},
"decrementPlayerScore":function(d){return "ลบคะแนนออก"},
"defaultSayText":function(d){return "พิมพ์ที่นี่"},
"emotion":function(d){return "อารมณ์"},
"finalLevel":function(d){return "ขอแสดงความยินดีคุณสามารถแก้ปัญหาสุดท้ายได้แล้ว."},
"for":function(d){return "สำหรับ"},
"hello":function(d){return "สวัสดี"},
"helloWorld":function(d){return "สวัสดีชาวโลก!"},
"incrementPlayerScore":function(d){return "คะแนนที่ได้"},
"makeProjectileDisappear":function(d){return "หายไป"},
"makeProjectileBounce":function(d){return "กระเด้ง"},
"makeProjectileBlueFireball":function(d){return "ทำลูกไฟสีฟ้า"},
"makeProjectilePurpleFireball":function(d){return "ทำลูกไฟสีม่วง"},
"makeProjectileRedFireball":function(d){return "ทำลูกไฟสีแดง"},
"makeProjectileYellowHearts":function(d){return "ทำหัวใจสีเหลือง"},
"makeProjectilePurpleHearts":function(d){return "ทำหัวใจสีม่วง"},
"makeProjectileRedHearts":function(d){return "ทำหัวใจสีแดง"},
"makeProjectileTooltip":function(d){return "ทำให้การเคลื่อนที่แบบโค้งที่เพิ่งชนกัน หายไป และ กระเด้ง."},
"makeYourOwn":function(d){return "ทำ App แล็บของตนเอง"},
"moveDirectionDown":function(d){return "ลง"},
"moveDirectionLeft":function(d){return "ซ้าย"},
"moveDirectionRight":function(d){return "ขวา"},
"moveDirectionUp":function(d){return "ขึ้น"},
"moveDirectionRandom":function(d){return "สุ่ม"},
"moveDistance25":function(d){return "25 พิกเซล"},
"moveDistance50":function(d){return "50 พิกเซล"},
"moveDistance100":function(d){return "100 พิกเซล"},
"moveDistance200":function(d){return "200 พิกเซล"},
"moveDistance400":function(d){return "400 พิกเซล"},
"moveDistancePixels":function(d){return "pixels"},
"moveDistanceRandom":function(d){return "การสุ่มเลือกพิกเซล"},
"moveDistanceTooltip":function(d){return "ย้ายตัวละครไปตามระยะทางและทิศทางที่ระบุ"},
"moveSprite":function(d){return "การเคลื่อนย้าย"},
"moveSpriteN":function(d){return "การเคลื่อนย้ายตัวแสดง "+studio_locale.v(d,"spriteIndex")},
"toXY":function(d){return "ไปที่ x, y"},
"moveDown":function(d){return "เคลื่อนลง"},
"moveDownTooltip":function(d){return "ย้ายตัวละครลงข้างล่าง"},
"moveLeft":function(d){return "ย้ายไปทางซ้าย"},
"moveLeftTooltip":function(d){return "ย้ายตัวละครไปทางซ้าย"},
"moveRight":function(d){return "ย้ายไปทางขวา"},
"moveRightTooltip":function(d){return "เคลื่อนย้าย ตัวแสดง ไปทางขวา."},
"moveUp":function(d){return "เคลื่อนขึ้น"},
"moveUpTooltip":function(d){return "เคลื่อนย้าย ตัวแสดง ไปด้านบน."},
"moveTooltip":function(d){return "เคลื่อนย้าย ตัวแสดง."},
"nextLevel":function(d){return "ขอแสดงความยินดีคุณสำเร็จปริศนานี้."},
"no":function(d){return "ไม่ใช่"},
"numBlocksNeeded":function(d){return "ปริศนานี้สามารถแก้ได้เพียงแค่ %1 บล็อกเท่านั้นเอง"},
"onEventTooltip":function(d){return "สั่งโปรแกรมให้ทำงาน ในการตอบสนองต่อเหตุการณ์ยางอย่าง."},
"ouchExclamation":function(d){return "โอ้ย!"},
"playSoundCrunch":function(d){return "ให้เล่นเสียงดังกร้วม"},
"playSoundGoal1":function(d){return "เล่นเสียงที่บรรลุเป้าหมายเสียงที่ 1"},
"playSoundGoal2":function(d){return "เล่นเสียงที่บรรลุเป้าหมายเสียงที่ 2"},
"playSoundHit":function(d){return "เล่นเสียงที่โดนชน"},
"playSoundLosePoint":function(d){return "เล่นเสียงที่เสียคะแนน เสียงที่ 1"},
"playSoundLosePoint2":function(d){return "เล่นเสียงที่เสียคะแนน เสียงที่ 2"},
"playSoundRetro":function(d){return "เล่นเสียงย้อนยุค"},
"playSoundRubber":function(d){return "เล่นเสียงยาง"},
"playSoundSlap":function(d){return "เล่นเสียงตบ"},
"playSoundTooltip":function(d){return "เล่นเสียงที่ถูกเลือก."},
"playSoundWinPoint":function(d){return "เล่นเสียงของการชนะ เสียงที่ 1"},
"playSoundWinPoint2":function(d){return "เล่นเสียงของการชนะ เสียงที่ 2"},
"playSoundWood":function(d){return "เล่นเสียงไม้"},
"positionOutTopLeft":function(d){return "ไปที่ตำแหน่งด้านบนซ้าย"},
"positionOutTopRight":function(d){return "ไปที่ตำแหน่งด้านบนขวา"},
"positionTopOutLeft":function(d){return "ไปที่ตำแหน่งด้านบนซ้ายข้างนอก"},
"positionTopLeft":function(d){return "ไปที่ตำแหน่งด้านบนซ้าย"},
"positionTopCenter":function(d){return "ไปที่ตำแหน่งด้านบนกลาง"},
"positionTopRight":function(d){return "ไปที่ตำแหน่งด้านบนขวา"},
"positionTopOutRight":function(d){return "ไปที่ตำแหน่งด้านบนขวาด้านนอก"},
"positionMiddleLeft":function(d){return "ไปที่ตำแหน่งกลางซ้าย"},
"positionMiddleCenter":function(d){return "ไปที่ตำแหน่งศูนย์กลาง"},
"positionMiddleRight":function(d){return "ไปที่ตำแหน่งกลางขวา"},
"positionBottomOutLeft":function(d){return "ไปที่ตำแหน่งด้านล่างซ้ายด้านนอก"},
"positionBottomLeft":function(d){return "ไปที่ตำแหน่งล่างซ้าย"},
"positionBottomCenter":function(d){return "ไปที่ตำแหน่งล่างกลาง"},
"positionBottomRight":function(d){return "ไปที่ตำแหน่งล่างขวา"},
"positionBottomOutRight":function(d){return "ไปที่ตำแหน่งล่างขวาด้านนอก"},
"positionOutBottomLeft":function(d){return "ไปที่ตำแหน่งที่ตำ่กว่าด้านล่างซ้าย"},
"positionOutBottomRight":function(d){return "ไปที่ตำแหน่งตำ่กว่าตำแหน่งล่างขวา"},
"positionRandom":function(d){return "สุ่มไปที่ตำแหน่งใดตำแหน่งหนึ่ง"},
"projectileBlueFireball":function(d){return "ลูกไฟสีฟ้า"},
"projectilePurpleFireball":function(d){return "ลูกไฟสีม่วง"},
"projectileRedFireball":function(d){return "ลูกไฟสีแดง"},
"projectileYellowHearts":function(d){return "หัวใจสีเหลือง"},
"projectilePurpleHearts":function(d){return "หัวใจสีม่วง"},
"projectileRedHearts":function(d){return "หัวใจสีแดง"},
"projectileRandom":function(d){return "สุ่ม"},
"projectileAnna":function(d){return "ตะขอ"},
"projectileElsa":function(d){return "จุดประกาย"},
"projectileHiro":function(d){return "หุ่นตัวจิ๋ว"},
"projectileBaymax":function(d){return "จรวด"},
"projectileRapunzel":function(d){return "กระทะทอด"},
"projectileCherry":function(d){return "เชอรี่"},
"projectileIce":function(d){return "นำ้แข็ง"},
"projectileDuck":function(d){return "เป็ด"},
"reinfFeedbackMsg":function(d){return "คุณสามารถกดปุ่ม \"เล่นต่อ\" เพื่อกลับไปเล่นเรื่องราวของคุณ."},
"repeatForever":function(d){return "ทำซำ้ไปตลอดกาล"},
"repeatDo":function(d){return "ทำ"},
"repeatForeverTooltip":function(d){return "ดำเนินการในบล็อกนี้ซ้ำ ๆ ในขณะที่เรื่องกำลังดำเนินอยู่."},
"saySprite":function(d){return "บอกว่า"},
"saySpriteN":function(d){return "นักแสดง  "+studio_locale.v(d,"spriteIndex")+" พูดว่า"},
"saySpriteTooltip":function(d){return "ผุดบอลลูนคำพูดด้วยข้อความเกี่ยวข้องจากนักแสดงคนนั้นโดยเฉพาะ."},
"saySpriteChoices_0":function(d){return "สวัสดีนะนั่น."},
"saySpriteChoices_1":function(d){return "สวัสดีทุกคน."},
"saySpriteChoices_2":function(d){return "คุณเป็นอย่างไรบ้าง ?"},
"saySpriteChoices_3":function(d){return "สวัสดีตอนเช้า"},
"saySpriteChoices_4":function(d){return "สวัสดีตอนบ่าย"},
"saySpriteChoices_5":function(d){return "ราตรีสวัสดิ์"},
"saySpriteChoices_6":function(d){return "สวัสดีตอนเย็น"},
"saySpriteChoices_7":function(d){return "มีอะไรใหม่บ้างมั๊ย?"},
"saySpriteChoices_8":function(d){return "อะไรนะ ?"},
"saySpriteChoices_9":function(d){return "ที่ไหนน่ะ ?"},
"saySpriteChoices_10":function(d){return "เมื่อไหร่ ?"},
"saySpriteChoices_11":function(d){return "ดี."},
"saySpriteChoices_12":function(d){return "ดีมาก!"},
"saySpriteChoices_13":function(d){return "ตกลง."},
"saySpriteChoices_14":function(d){return "ไม่เลว."},
"saySpriteChoices_15":function(d){return "โชคดี."},
"saySpriteChoices_16":function(d){return "ใช่"},
"saySpriteChoices_17":function(d){return "ไม่ใช่"},
"saySpriteChoices_18":function(d){return "ตกลง"},
"saySpriteChoices_19":function(d){return "โยนดีนี่!"},
"saySpriteChoices_20":function(d){return "ขอให้มีวันที่ดี."},
"saySpriteChoices_21":function(d){return "ลาก่อน."},
"saySpriteChoices_22":function(d){return "เดี๋ยวฉันกลับมา."},
"saySpriteChoices_23":function(d){return "เจอกันพรุ่งนี้!"},
"saySpriteChoices_24":function(d){return "เจอกันทีหลังนะ!"},
"saySpriteChoices_25":function(d){return "ดูแลตัวเองดีๆนะ!"},
"saySpriteChoices_26":function(d){return "ขอให้สนุกนะ!"},
"saySpriteChoices_27":function(d){return "ฉันต้องไปแล้ว."},
"saySpriteChoices_28":function(d){return "อยากเป็นเพื่อนกันมั๊ย?"},
"saySpriteChoices_29":function(d){return "ทำงานดีมาก!"},
"saySpriteChoices_30":function(d){return "วูฮู!"},
"saySpriteChoices_31":function(d){return "เย่!"},
"saySpriteChoices_32":function(d){return "ยินดีที่ได้รู้จักคุณ."},
"saySpriteChoices_33":function(d){return "ตกลง!"},
"saySpriteChoices_34":function(d){return "ขอบคุณ"},
"saySpriteChoices_35":function(d){return "ไม่ล่ะ ขอบคุณ"},
"saySpriteChoices_36":function(d){return "อ้าาาาาาา!"},
"saySpriteChoices_37":function(d){return "ไม่เป็นไร"},
"saySpriteChoices_38":function(d){return "วันนี้"},
"saySpriteChoices_39":function(d){return "วันพรุ่งนี้"},
"saySpriteChoices_40":function(d){return "เมื่อวานนี้"},
"saySpriteChoices_41":function(d){return "ฉันพบคุณ!"},
"saySpriteChoices_42":function(d){return "คุณเจอฉัน!"},
"saySpriteChoices_43":function(d){return "10, 9, 8, 7, 6, 5, 4, 3, 2, 1!"},
"saySpriteChoices_44":function(d){return "คุณดีมาก!"},
"saySpriteChoices_45":function(d){return "คุณตลกดี!"},
"saySpriteChoices_46":function(d){return "คุณดูเซ่อ! "},
"saySpriteChoices_47":function(d){return "คุณเป็นเพื่อนที่ดี!"},
"saySpriteChoices_48":function(d){return "ระวัง!"},
"saySpriteChoices_49":function(d){return "เซ็งเป็ด!"},
"saySpriteChoices_50":function(d){return "ได้เลย!"},
"saySpriteChoices_51":function(d){return "อ่าว!"},
"saySpriteChoices_52":function(d){return "ขออภัย!"},
"saySpriteChoices_53":function(d){return "ระวังหน่อย!"},
"saySpriteChoices_54":function(d){return "ว้าววว!"},
"saySpriteChoices_55":function(d){return "โอ๊ะ!"},
"saySpriteChoices_56":function(d){return "คุณเกือบจะจับฉันได้!"},
"saySpriteChoices_57":function(d){return "ทำได้ดีนี่!"},
"saySpriteChoices_58":function(d){return "คุณจับฉันไม่ได้หรอก!"},
"scoreText":function(d){return "คะแนน: "+studio_locale.v(d,"playerScore")},
"setBackground":function(d){return "ติดตั้งฉากหลัง"},
"setBackgroundRandom":function(d){return "สุ่มติดตั้งฉากหลัง"},
"setBackgroundBlack":function(d){return "ติดตั้งฉากหลังสีดำ"},
"setBackgroundCave":function(d){return "ติดตั้งฉากหลังเป็นรูปถำ้"},
"setBackgroundCloudy":function(d){return "ติดตั้งฉากหลังเป็นรูปเมฆมากๆ"},
"setBackgroundHardcourt":function(d){return "ติดตั้งฉากหลังเป็นรูป hardcourt"},
"setBackgroundNight":function(d){return "ติดตั้งฉากหลังเป็นรูปตอนกลางคืน"},
"setBackgroundUnderwater":function(d){return "ตั้งพื้นหลังเป็นใต้ทะเล"},
"setBackgroundCity":function(d){return "ตั้งพื้นหลังเป็นเมือง"},
"setBackgroundDesert":function(d){return "ตั้งพื้นหลังเป็นทะเลทราย"},
"setBackgroundRainbow":function(d){return "ตั้งพื้นหลังเป็นสายรุ้ง"},
"setBackgroundSoccer":function(d){return "ตั้งพื้นหลังเป็นฟุตบอล"},
"setBackgroundSpace":function(d){return "ตั้งพื้นหลังเป็นอวกาศ"},
"setBackgroundTennis":function(d){return "ตั้งพื้นหลังเป็นเทนนิส"},
"setBackgroundWinter":function(d){return "ตั้งพื้นหลังเป็นฤดูหนาว"},
"setBackgroundLeafy":function(d){return "ตั้งพื้นหลังเป็นใบไม้"},
"setBackgroundGrassy":function(d){return "ตั้งพื้นหลังเป็นหญ้า"},
"setBackgroundFlower":function(d){return "ตั้งพื้นหลังเป็นดอกไม้"},
"setBackgroundTile":function(d){return "ตั้งพื้นหลังเป็นกระเบื้อง"},
"setBackgroundIcy":function(d){return "ตั้งพื้นหลังเป็นนำ้แข็ง"},
"setBackgroundSnowy":function(d){return "ตั้งพื้นหลังเป็นหิมะตก"},
"setBackgroundTooltip":function(d){return "ตั่งค่าภาพพื้นหลัง"},
"setEnemySpeed":function(d){return "ตั้งค่าความเร็วศัตรู"},
"setPlayerSpeed":function(d){return "ตั้งค่าความเร็วของผู้เล่น"},
"setScoreText":function(d){return "set score"},
"setScoreTextTooltip":function(d){return "ตั้งค่าให้ข้อความแสดงในพื้นที่ของคะแนน."},
"setSpriteEmotionAngry":function(d){return "ที่อารมณ์โกรธ"},
"setSpriteEmotionHappy":function(d){return "ที่อารมณ์แห่งความสุข"},
"setSpriteEmotionNormal":function(d){return "ที่อารมณ์ปกติ"},
"setSpriteEmotionRandom":function(d){return "ที่การสุ่มอารมณ์"},
"setSpriteEmotionSad":function(d){return "ที่อารมณ์เศร้า"},
"setSpriteEmotionTooltip":function(d){return "ตั้งค่าอารมณ์ของนักแสดง"},
"setSpriteAlien":function(d){return "ที่รูปของมนุษย์ต่างดาว"},
"setSpriteBat":function(d){return "ที่รูปของค้างคาว"},
"setSpriteBird":function(d){return "ที่รูปของนก"},
"setSpriteCat":function(d){return "ที่รูปแมว"},
"setSpriteCaveBoy":function(d){return "ที่รูปของเด็กชายถำ้"},
"setSpriteCaveGirl":function(d){return "ที่รูปของเด็กหญิงถำ้"},
"setSpriteDinosaur":function(d){return "ที่รูปไดโนเสาร์"},
"setSpriteDog":function(d){return "ที่รูปสุนัข"},
"setSpriteDragon":function(d){return "ที่รูปมังกร"},
"setSpriteGhost":function(d){return "ที่รูปผี"},
"setSpriteHidden":function(d){return "ที่รูปซ่อน"},
"setSpriteHideK1":function(d){return "ซ่อน"},
"setSpriteAnna":function(d){return "ที่รูปแอนนา"},
"setSpriteElsa":function(d){return "ที่รูปเอลซ่า"},
"setSpriteHiro":function(d){return "ที่รูปไฮโร"},
"setSpriteBaymax":function(d){return "ที่รูป Baymax"},
"setSpriteRapunzel":function(d){return "ที่รูปราพันเซล"},
"setSpriteKnight":function(d){return "ที่รูปอัศวิน"},
"setSpriteMonster":function(d){return "ที่รูปสัตว์ประหลาด"},
"setSpriteNinja":function(d){return "ที่รูปหน้ากากนินจา"},
"setSpriteOctopus":function(d){return "ที่รูปปลาหมึกยักษ์"},
"setSpritePenguin":function(d){return "ที่รูปนกเพนกวิน"},
"setSpritePirate":function(d){return "ที่รูปโจรสลัด"},
"setSpritePrincess":function(d){return "ที่รูปเจ้าหญิง"},
"setSpriteRandom":function(d){return "ที่รูปสุ่ม"},
"setSpriteRobot":function(d){return "ที่รูปหุ่นยนต์"},
"setSpriteShowK1":function(d){return "แสดง"},
"setSpriteSpacebot":function(d){return "ที่รูปของ spacebot"},
"setSpriteSoccerGirl":function(d){return "ที่รูปนักเตะฟุตบอลหญิง"},
"setSpriteSoccerBoy":function(d){return "ที่รูปนักเตะฟุตบอลชาย"},
"setSpriteSquirrel":function(d){return "ที่รูปของกระรอก"},
"setSpriteTennisGirl":function(d){return "ที่รูปนักเทนนิสหญิง"},
"setSpriteTennisBoy":function(d){return "ที่รูปนักเทนนิสชาย"},
"setSpriteUnicorn":function(d){return "ที่รูปของม้ายูนิคอน"},
"setSpriteWitch":function(d){return "ที่รูปของแม่มด"},
"setSpriteWizard":function(d){return "ที่รูปของพ่อมด"},
"setSpritePositionTooltip":function(d){return "ย้ายตัวละครไปยังตำแหน่งที่ระบุทันที"},
"setSpriteK1Tooltip":function(d){return "แสดงหรือซ่อนนักแสดงที่ระบุเอาไว้."},
"setSpriteTooltip":function(d){return "ติดตั้งรูปของนักแสดง"},
"setSpriteSizeRandom":function(d){return "ที่ขนาดโดยการสุ่ม"},
"setSpriteSizeVerySmall":function(d){return "ที่ขนาดเล็กมาก"},
"setSpriteSizeSmall":function(d){return "ที่ขนาดเล็ก"},
"setSpriteSizeNormal":function(d){return "ที่ขนาดปกติ"},
"setSpriteSizeLarge":function(d){return "ที่ขนาดใหญ่"},
"setSpriteSizeVeryLarge":function(d){return "ที่ขนาดใหญ่มาก"},
"setSpriteSizeTooltip":function(d){return "ตั้งค่าขนาดของนักแสดง"},
"setSpriteSpeedRandom":function(d){return "ที่ความเร็วแบบสุ่ม"},
"setSpriteSpeedVerySlow":function(d){return "ที่ความเร็วช้ามาก"},
"setSpriteSpeedSlow":function(d){return "ที่ความเร็วช้า"},
"setSpriteSpeedNormal":function(d){return "ที่ความเร็วปกติ"},
"setSpriteSpeedFast":function(d){return "ที่ความเร็วสูง"},
"setSpriteSpeedVeryFast":function(d){return "ที่ความเร็วสูงมาก"},
"setSpriteSpeedTooltip":function(d){return "ตั้งค่าความเร็วของนักแสดง"},
"setSpriteZombie":function(d){return "ที่ภาพของซอมบี้"},
"shareStudioTwitter":function(d){return "เอาเรื่องราวที่ฉันทำขึ้นออกมา ฉันเขียนมันด้วยตัวฉันเองกับ @codeorg"},
"shareGame":function(d){return "แบ่งปันเรื่องราวของคุณ:"},
"showCoordinates":function(d){return "แสดงพิกัด"},
"showCoordinatesTooltip":function(d){return "แสดงพิกัดของตัวเอกบนหน้าจอ"},
"showTitleScreen":function(d){return "แสดงหน้าชื่อเรื่อง"},
"showTitleScreenTitle":function(d){return "ชื่อเรื่อง"},
"showTitleScreenText":function(d){return "ข้อความ"},
"showTSDefTitle":function(d){return "พิมพ์ชื่อเรื่องที่นี่"},
"showTSDefText":function(d){return "พิมพ์อักขระที่นี่"},
"showTitleScreenTooltip":function(d){return "แสดงชื่อเรื่องกับชื่อเรื่องและข้อความที่เกี่ยวข้อง."},
"size":function(d){return "ขนาด"},
"setSprite":function(d){return "ชุด"},
"setSpriteN":function(d){return "ชุดนักแสดง "+studio_locale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "crunch"},
"soundGoal1":function(d){return "เป้าหมายที่ 1"},
"soundGoal2":function(d){return "เป้าหมายที่ 2"},
"soundHit":function(d){return "ชน"},
"soundLosePoint":function(d){return "เสียแต้ม"},
"soundLosePoint2":function(d){return "เสียแต้ม 2"},
"soundRetro":function(d){return "ย้อนยุค"},
"soundRubber":function(d){return "ยาง"},
"soundSlap":function(d){return "ตบ"},
"soundWinPoint":function(d){return "แต้มชนะ"},
"soundWinPoint2":function(d){return "แต้มชนะ 2"},
"soundWood":function(d){return "ไม้"},
"speed":function(d){return "ความเร็ว"},
"startSetValue":function(d){return "เริ่มต้น (หน้าที่การทำงาน)"},
"startSetVars":function(d){return "game_vars (ชื่อ คำบรรยาย พื้นหลัง เป้าหมาย อันตราย ผู้เล่น)"},
"startSetFuncs":function(d){return "game_funcs (ปรับปรุงเป้าหมาย ปรับปรุงอันตราย ปรับปรุงเครื่อง เล่น ชน?, บนหน้าจอหรือไม่)"},
"stopSprite":function(d){return "หยุด"},
"stopSpriteN":function(d){return "หยุดนักแสดง "+studio_locale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "หยุดการเคลื่อนไหวของนักแสดง."},
"throwSprite":function(d){return "โยน"},
"throwSpriteN":function(d){return "นักโยน "+studio_locale.v(d,"spriteIndex")},
"throwTooltip":function(d){return "โยนแบบโค้งจากนักแสดงที่ถูกระบุ."},
"vanish":function(d){return "หายไป"},
"vanishActorN":function(d){return "นักแสดงที่หายตัวไป "+studio_locale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "นักแสดงที่หายไป."},
"waitFor":function(d){return "คอยสำหรับ"},
"waitSeconds":function(d){return "วินาที"},
"waitForClick":function(d){return "รอการคลิก"},
"waitForRandom":function(d){return "รอการสุ่ม"},
"waitForHalfSecond":function(d){return "รอครึ่งวินาที"},
"waitFor1Second":function(d){return "รอ 1 วินาที"},
"waitFor2Seconds":function(d){return "รอ 2 วินาที"},
"waitFor5Seconds":function(d){return "รอ 5 วินาที"},
"waitFor10Seconds":function(d){return "รอ 10 วินาที"},
"waitParamsTooltip":function(d){return "รอในจำนวนวินาทีที่ถูกกำหนดแล้วหรือใช้ศูนย์เพื่อการรอจนกว่าคลิกจะเกิดขึ้น."},
"waitTooltip":function(d){return "รอตามเวลาที่ระบุ หรือรอจนกว่าจะมีการคลิกเกิดขึ้น"},
"whenArrowDown":function(d){return "ลูกศรลง"},
"whenArrowLeft":function(d){return "ลูกศรซ้าย"},
"whenArrowRight":function(d){return "ลูกศรขวา"},
"whenArrowUp":function(d){return "ลูกศรขึ้น"},
"whenArrowTooltip":function(d){return "ดำเนินการด้านล่างเมื่อปุ่มลูกศรที่กำหนดถูกกด."},
"whenDown":function(d){return "เมื่อกดลูกศรลง"},
"whenDownTooltip":function(d){return "ทำคำสั่งด้านล่างเมื่อมีการกดปุ่มลง."},
"whenGameStarts":function(d){return "เมื่อเรื่องราวเริ่มต้นขึ้น"},
"whenGameStartsTooltip":function(d){return "ดำเนินการด้านล่างเมื่อเรื่องเริ่มต้น."},
"whenLeft":function(d){return "เมื่อกดลูกศรซ้าย"},
"whenLeftTooltip":function(d){return "ทำคำสั่งด้านล่างเมื่อมีการกดปุ่มซ้าย."},
"whenRight":function(d){return "เมื่อกดลูกศรขวา"},
"whenRightTooltip":function(d){return "ทำคำสั่งด้านล่างเมื่อมีการกดปุ่มขวา."},
"whenSpriteClicked":function(d){return "เมื่อคลิกที่ตัวละคร"},
"whenSpriteClickedN":function(d){return "เมื่อนักแสดงถูกคลิก "+studio_locale.v(d,"spriteIndex")},
"whenSpriteClickedTooltip":function(d){return "ดำเนินการด้านล่างเมื่อนักแสดงถูกคลิก."},
"whenSpriteCollidedN":function(d){return "เมื่อนักแสดง "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "ดำเนินการด้านล่างเมื่อนักแสดงสัมผัสนักแสดงอื่น."},
"whenSpriteCollidedWith":function(d){return "สัมผัส"},
"whenSpriteCollidedWithAnyActor":function(d){return "สัมผัสนักแสดงใด ๆ"},
"whenSpriteCollidedWithAnyEdge":function(d){return "สัมผัสขอบใด ๆ"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "สัมผัสกระสุนใด ๆ"},
"whenSpriteCollidedWithAnything":function(d){return "สัมผัสอะไรก็ได้"},
"whenSpriteCollidedWithN":function(d){return "สัมผัสนักแสดง "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "สัมผัสลูกไฟสีน้ำเงิน"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "สัมผัสลูกไฟสีม่วง"},
"whenSpriteCollidedWithRedFireball":function(d){return "สัมผัสลูกไฟสีแดง"},
"whenSpriteCollidedWithYellowHearts":function(d){return "สัมผัสหัวใจสีเหลือง"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "สัมผัสหัวใจสีม่วง"},
"whenSpriteCollidedWithRedHearts":function(d){return "สัมผัสหัวใจสีแดง"},
"whenSpriteCollidedWithBottomEdge":function(d){return "สัมผัสขอบล่าง"},
"whenSpriteCollidedWithLeftEdge":function(d){return "สัมผัสขอบซ้าย"},
"whenSpriteCollidedWithRightEdge":function(d){return "สัมผัสขอบขวา"},
"whenSpriteCollidedWithTopEdge":function(d){return "สัมผัสขอบบน"},
"whenUp":function(d){return "เมื่อกดลูกศรขึ้น"},
"whenUpTooltip":function(d){return "ทำคำสั่งด้านล่างเมื่อมีการกดปุ่มขึ้น."},
"yes":function(d){return "ใช่"}};