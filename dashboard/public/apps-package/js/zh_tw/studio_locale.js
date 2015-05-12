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
"actor":function(d){return "演員"},
"alienInvasion":function(d){return "外星人入侵 !"},
"backgroundBlack":function(d){return "黑"},
"backgroundCave":function(d){return "洞穴"},
"backgroundCloudy":function(d){return "多雲"},
"backgroundHardcourt":function(d){return "硬地球場"},
"backgroundNight":function(d){return "夜"},
"backgroundUnderwater":function(d){return "水底"},
"backgroundCity":function(d){return "城市"},
"backgroundDesert":function(d){return "沙漠"},
"backgroundRainbow":function(d){return "彩虹"},
"backgroundSoccer":function(d){return "足球"},
"backgroundSpace":function(d){return "太空"},
"backgroundTennis":function(d){return "網球"},
"backgroundWinter":function(d){return "冬天"},
"catActions":function(d){return "動作類別"},
"catControl":function(d){return "迴圈類別"},
"catEvents":function(d){return "事件類別"},
"catLogic":function(d){return "邏輯類別"},
"catMath":function(d){return "運算類別"},
"catProcedures":function(d){return "函數類別"},
"catText":function(d){return "文本"},
"catVariables":function(d){return "變數類別"},
"changeScoreTooltip":function(d){return "將得分增加或減少一分"},
"changeScoreTooltipK1":function(d){return "增加一分"},
"continue":function(d){return "繼續 "},
"decrementPlayerScore":function(d){return "減少一分"},
"defaultSayText":function(d){return "在此處輸入"},
"emotion":function(d){return "情緒"},
"finalLevel":function(d){return "恭喜！你已經完成最後的關卡。"},
"for":function(d){return "為"},
"hello":function(d){return "你好"},
"helloWorld":function(d){return "Hello World!"},
"incrementPlayerScore":function(d){return "得分"},
"makeProjectileDisappear":function(d){return "消失"},
"makeProjectileBounce":function(d){return "彈跳"},
"makeProjectileBlueFireball":function(d){return "製造藍色火球"},
"makeProjectilePurpleFireball":function(d){return "製造紫色火球"},
"makeProjectileRedFireball":function(d){return "製造紅色火球"},
"makeProjectileYellowHearts":function(d){return "製造黃色愛心"},
"makeProjectilePurpleHearts":function(d){return "製造紫色愛心"},
"makeProjectileRedHearts":function(d){return "製造紅色愛心"},
"makeProjectileTooltip":function(d){return "讓撞擊的導彈消失或反彈。"},
"makeYourOwn":function(d){return "創作你自己的Play Lab程式"},
"moveDirectionDown":function(d){return "向下"},
"moveDirectionLeft":function(d){return " 向左"},
"moveDirectionRight":function(d){return "向右\n"},
"moveDirectionUp":function(d){return "向上"},
"moveDirectionRandom":function(d){return "隨機"},
"moveDistance25":function(d){return "25 個像素"},
"moveDistance50":function(d){return "50個像素"},
"moveDistance100":function(d){return "100個像素"},
"moveDistance200":function(d){return "200個像素"},
"moveDistance400":function(d){return "400個像素"},
"moveDistancePixels":function(d){return "像素 "},
"moveDistanceRandom":function(d){return "隨機像素"},
"moveDistanceTooltip":function(d){return "將角色在指定的方向移動指定的距離"},
"moveSprite":function(d){return "移動"},
"moveSpriteN":function(d){return "移動演員"+studio_locale.v(d,"spriteIndex")},
"toXY":function(d){return "到x,y"},
"moveDown":function(d){return "向下移動"},
"moveDownTooltip":function(d){return "將角色向下移動。"},
"moveLeft":function(d){return "向左移動"},
"moveLeftTooltip":function(d){return "將角色向左移動。"},
"moveRight":function(d){return "向右移動"},
"moveRightTooltip":function(d){return "將角色向右移動。"},
"moveUp":function(d){return "向上移動"},
"moveUpTooltip":function(d){return "將角色向上移動。"},
"moveTooltip":function(d){return "移動角色。"},
"nextLevel":function(d){return "恭喜！你已經完成這個關卡。"},
"no":function(d){return "否"},
"numBlocksNeeded":function(d){return "這個關卡可以使用 %1 個程式積木來完成。"},
"onEventTooltip":function(d){return "執行程式碼以回應指定的事件。"},
"ouchExclamation":function(d){return "哎喲 ！"},
"playSoundCrunch":function(d){return "播放收緊的音效"},
"playSoundGoal1":function(d){return "播放得分1的音效"},
"playSoundGoal2":function(d){return "播放得分2的音效"},
"playSoundHit":function(d){return "播放命中的音效"},
"playSoundLosePoint":function(d){return "播放失分的音效"},
"playSoundLosePoint2":function(d){return "播放失分2的音效"},
"playSoundRetro":function(d){return "播放復古的音效"},
"playSoundRubber":function(d){return "播放橡膠的音效"},
"playSoundSlap":function(d){return "播放掌聲音效"},
"playSoundTooltip":function(d){return "播放所選音效"},
"playSoundWinPoint":function(d){return "播放得分音效"},
"playSoundWinPoint2":function(d){return "播放得分2的音效"},
"playSoundWood":function(d){return "播放木頭音效"},
"positionOutTopLeft":function(d){return "放在左上角"},
"positionOutTopRight":function(d){return "放在右上角"},
"positionTopOutLeft":function(d){return "到左外側頂部位置"},
"positionTopLeft":function(d){return "放在左上角"},
"positionTopCenter":function(d){return "放在上面中間"},
"positionTopRight":function(d){return "放在右上角"},
"positionTopOutRight":function(d){return "到右外側頂部的位置"},
"positionMiddleLeft":function(d){return "放在左邊中間"},
"positionMiddleCenter":function(d){return "放在正中間"},
"positionMiddleRight":function(d){return "放在右邊中間"},
"positionBottomOutLeft":function(d){return "到左外側底部的位置"},
"positionBottomLeft":function(d){return "放在左下角"},
"positionBottomCenter":function(d){return "放在下面中間"},
"positionBottomRight":function(d){return "放在右下角"},
"positionBottomOutRight":function(d){return "到右外側底部的位置"},
"positionOutBottomLeft":function(d){return "到左側底部下面的位置"},
"positionOutBottomRight":function(d){return "到右側底部下面的位置"},
"positionRandom":function(d){return "放到隨機位置"},
"projectileBlueFireball":function(d){return "藍色火球"},
"projectilePurpleFireball":function(d){return "紫色火球"},
"projectileRedFireball":function(d){return "紅色火球"},
"projectileYellowHearts":function(d){return "黃色愛心"},
"projectilePurpleHearts":function(d){return "紫色愛心"},
"projectileRedHearts":function(d){return "紅色愛心"},
"projectileRandom":function(d){return "隨機"},
"projectileAnna":function(d){return "鉤"},
"projectileElsa":function(d){return "火花"},
"projectileHiro":function(d){return "微型機器人"},
"projectileBaymax":function(d){return "火箭"},
"projectileRapunzel":function(d){return "平底鍋"},
"projectileCherry":function(d){return "櫻桃"},
"projectileIce":function(d){return "冰"},
"projectileDuck":function(d){return "鴨"},
"reinfFeedbackMsg":function(d){return "你可以按下\"繼續玩\"的按鈕以回去玩你的故事。"},
"repeatForever":function(d){return "永遠重複"},
"repeatDo":function(d){return "執行"},
"repeatForeverTooltip":function(d){return "當故事進行時，請不斷執行板塊中的動作。"},
"saySprite":function(d){return "說"},
"saySpriteN":function(d){return "演員 "+studio_locale.v(d,"spriteIndex")+" 說"},
"saySpriteTooltip":function(d){return "給指定的演員彈出相關的文字框。"},
"saySpriteChoices_0":function(d){return "嘿，你好！"},
"saySpriteChoices_1":function(d){return "大家好。"},
"saySpriteChoices_2":function(d){return "你好嗎？"},
"saySpriteChoices_3":function(d){return "早安。"},
"saySpriteChoices_4":function(d){return "午安。"},
"saySpriteChoices_5":function(d){return "晚安。"},
"saySpriteChoices_6":function(d){return "晚安。"},
"saySpriteChoices_7":function(d){return "有什麼新鮮事？"},
"saySpriteChoices_8":function(d){return "什麼？"},
"saySpriteChoices_9":function(d){return "在哪裡？"},
"saySpriteChoices_10":function(d){return "什麼時候？"},
"saySpriteChoices_11":function(d){return "好。"},
"saySpriteChoices_12":function(d){return "太棒了！"},
"saySpriteChoices_13":function(d){return "好吧。"},
"saySpriteChoices_14":function(d){return "不錯。"},
"saySpriteChoices_15":function(d){return "祝你好運。"},
"saySpriteChoices_16":function(d){return "是"},
"saySpriteChoices_17":function(d){return "否"},
"saySpriteChoices_18":function(d){return "好吧"},
"saySpriteChoices_19":function(d){return "扔得好！"},
"saySpriteChoices_20":function(d){return "祝你有美好的一天。"},
"saySpriteChoices_21":function(d){return "再見。"},
"saySpriteChoices_22":function(d){return "我馬上回來。"},
"saySpriteChoices_23":function(d){return "明天見！"},
"saySpriteChoices_24":function(d){return "回頭見！"},
"saySpriteChoices_25":function(d){return "保重！"},
"saySpriteChoices_26":function(d){return "好好享受吧 ！"},
"saySpriteChoices_27":function(d){return "我得走了。"},
"saySpriteChoices_28":function(d){return "想要成為朋友嗎？"},
"saySpriteChoices_29":function(d){return "做得好！"},
"saySpriteChoices_30":function(d){return "呦呼！"},
"saySpriteChoices_31":function(d){return "耶！"},
"saySpriteChoices_32":function(d){return "很高興認識你。"},
"saySpriteChoices_33":function(d){return "好吧。"},
"saySpriteChoices_34":function(d){return "謝謝"},
"saySpriteChoices_35":function(d){return "不用了，謝謝你"},
"saySpriteChoices_36":function(d){return "啊！"},
"saySpriteChoices_37":function(d){return "沒關係"},
"saySpriteChoices_38":function(d){return "今天"},
"saySpriteChoices_39":function(d){return "明天"},
"saySpriteChoices_40":function(d){return "昨天"},
"saySpriteChoices_41":function(d){return "我找到你了！"},
"saySpriteChoices_42":function(d){return "你找到我了！"},
"saySpriteChoices_43":function(d){return "10, 9, 8, 7, 6, 5, 4, 3, 2, 1!"},
"saySpriteChoices_44":function(d){return "你真棒！"},
"saySpriteChoices_45":function(d){return "你真有趣！"},
"saySpriteChoices_46":function(d){return "你真傻！ "},
"saySpriteChoices_47":function(d){return "你真是一個很好的朋友 ！"},
"saySpriteChoices_48":function(d){return "小心！"},
"saySpriteChoices_49":function(d){return "鴨子 ！"},
"saySpriteChoices_50":function(d){return "抓到你了！"},
"saySpriteChoices_51":function(d){return "噢 ！"},
"saySpriteChoices_52":function(d){return "抱歉！"},
"saySpriteChoices_53":function(d){return "小心！"},
"saySpriteChoices_54":function(d){return "哇 ！"},
"saySpriteChoices_55":function(d){return "哎呀 ！"},
"saySpriteChoices_56":function(d){return "你差點就抓到我了 ！"},
"saySpriteChoices_57":function(d){return "不錯的嘗試！"},
"saySpriteChoices_58":function(d){return "你抓不到我 ！"},
"scoreText":function(d){return "積分: "+studio_locale.v(d,"playerScore")},
"setBackground":function(d){return "設置背景"},
"setBackgroundRandom":function(d){return "設置隨機背景"},
"setBackgroundBlack":function(d){return "設置黑色背景"},
"setBackgroundCave":function(d){return "設置洞穴背景"},
"setBackgroundCloudy":function(d){return "設置多雲背景"},
"setBackgroundHardcourt":function(d){return "設置硬地球場背景"},
"setBackgroundNight":function(d){return "設置夜晚背景"},
"setBackgroundUnderwater":function(d){return "設置水下背景"},
"setBackgroundCity":function(d){return "設置都市背景"},
"setBackgroundDesert":function(d){return "設置沙漠背景"},
"setBackgroundRainbow":function(d){return "設置彩虹背景"},
"setBackgroundSoccer":function(d){return "設置足球背景"},
"setBackgroundSpace":function(d){return "設置太空背景"},
"setBackgroundTennis":function(d){return "設置網球背景"},
"setBackgroundWinter":function(d){return "設置冬季背景"},
"setBackgroundLeafy":function(d){return "設置綠葉背景"},
"setBackgroundGrassy":function(d){return "設置草背景"},
"setBackgroundFlower":function(d){return "設置花背景"},
"setBackgroundTile":function(d){return "設置磁磚背景"},
"setBackgroundIcy":function(d){return "設置冰的背景"},
"setBackgroundSnowy":function(d){return "設置多雪的背景"},
"setBackgroundTooltip":function(d){return "設置背景圖像"},
"setEnemySpeed":function(d){return "設置敵人的速度"},
"setPlayerSpeed":function(d){return "設置遊戲者速度"},
"setScoreText":function(d){return "設置得分"},
"setScoreTextTooltip":function(d){return "設置得分區域中顯示的文字。"},
"setSpriteEmotionAngry":function(d){return "憤怒的心情"},
"setSpriteEmotionHappy":function(d){return "設置快樂模置"},
"setSpriteEmotionNormal":function(d){return "設置正常模式"},
"setSpriteEmotionRandom":function(d){return "設置隨機情緒"},
"setSpriteEmotionSad":function(d){return "設置悲傷模式"},
"setSpriteEmotionTooltip":function(d){return "設置演員的情緒"},
"setSpriteAlien":function(d){return "設為外星人的樣子"},
"setSpriteBat":function(d){return "設為蝙蝠的樣子"},
"setSpriteBird":function(d){return "設為小鳥的樣子"},
"setSpriteCat":function(d){return "設為貓咪的樣子"},
"setSpriteCaveBoy":function(d){return "設為原始人男生的樣子"},
"setSpriteCaveGirl":function(d){return "設為原始人女生的樣子"},
"setSpriteDinosaur":function(d){return "設為恐龍的樣子"},
"setSpriteDog":function(d){return "設為狗狗的樣子"},
"setSpriteDragon":function(d){return "設為龍的樣子"},
"setSpriteGhost":function(d){return "設為鬼的樣子"},
"setSpriteHidden":function(d){return "設為隱藏的影像"},
"setSpriteHideK1":function(d){return "隱藏"},
"setSpriteAnna":function(d){return "安娜的圖像"},
"setSpriteElsa":function(d){return "愛莎的圖像"},
"setSpriteHiro":function(d){return "希羅形象"},
"setSpriteBaymax":function(d){return "Baymax形象"},
"setSpriteRapunzel":function(d){return "長髮公主形象"},
"setSpriteKnight":function(d){return "設為騎士的樣子"},
"setSpriteMonster":function(d){return "設為怪獸的樣子"},
"setSpriteNinja":function(d){return "設為蒙面忍者的樣子"},
"setSpriteOctopus":function(d){return "設為章魚的樣子"},
"setSpritePenguin":function(d){return "設為企鵝的樣子"},
"setSpritePirate":function(d){return "設為海盜的樣子"},
"setSpritePrincess":function(d){return "設為公主的樣子"},
"setSpriteRandom":function(d){return "設為隨機的影像"},
"setSpriteRobot":function(d){return "設為機器人的樣子"},
"setSpriteShowK1":function(d){return "顯示"},
"setSpriteSpacebot":function(d){return "設為太空機器人的樣子"},
"setSpriteSoccerGirl":function(d){return "設為足球女孩的樣子"},
"setSpriteSoccerBoy":function(d){return "設為足球男孩的樣子"},
"setSpriteSquirrel":function(d){return "設為松鼠的樣子"},
"setSpriteTennisGirl":function(d){return "設為網球女孩的樣子"},
"setSpriteTennisBoy":function(d){return "設為網球男孩的樣子"},
"setSpriteUnicorn":function(d){return "設為獨角獸的樣子"},
"setSpriteWitch":function(d){return "設為巫婆的樣子"},
"setSpriteWizard":function(d){return "設為巫師的樣子"},
"setSpritePositionTooltip":function(d){return "立即將一個角色移動到指定的位置。"},
"setSpriteK1Tooltip":function(d){return "顯示或隱藏指定的角色。"},
"setSpriteTooltip":function(d){return "設定角色的影像"},
"setSpriteSizeRandom":function(d){return "到一個隨機的大小"},
"setSpriteSizeVerySmall":function(d){return "到非常小的尺寸"},
"setSpriteSizeSmall":function(d){return "到一個小的尺寸"},
"setSpriteSizeNormal":function(d){return "到一個正常尺寸"},
"setSpriteSizeLarge":function(d){return "到一個大尺寸"},
"setSpriteSizeVeryLarge":function(d){return "到非常大的尺寸"},
"setSpriteSizeTooltip":function(d){return "設置一個演員的大小"},
"setSpriteSpeedRandom":function(d){return "設為隨機的速度"},
"setSpriteSpeedVerySlow":function(d){return "設為非常慢的速度"},
"setSpriteSpeedSlow":function(d){return "設為慢的速度"},
"setSpriteSpeedNormal":function(d){return "設為一般的速度"},
"setSpriteSpeedFast":function(d){return "設為快的速度"},
"setSpriteSpeedVeryFast":function(d){return "設為非常快的速度"},
"setSpriteSpeedTooltip":function(d){return "設為角色的速度"},
"setSpriteZombie":function(d){return "設為僵屍的樣子"},
"shareStudioTwitter":function(d){return "看看我在@codeorg ，自己所編寫的故事。"},
"shareGame":function(d){return "分享你的故事："},
"showCoordinates":function(d){return "顯示座標"},
"showCoordinatesTooltip":function(d){return "在螢幕上展現主角的座標"},
"showTitleScreen":function(d){return "顯示標題螢幕"},
"showTitleScreenTitle":function(d){return "標題"},
"showTitleScreenText":function(d){return "文字變數"},
"showTSDefTitle":function(d){return "在這裡輸入標題"},
"showTSDefText":function(d){return "在這裡輸入本文"},
"showTitleScreenTooltip":function(d){return "顯示一個具有標題和文本的標題視窗。"},
"size":function(d){return "大小"},
"setSprite":function(d){return "賦值"},
"setSpriteN":function(d){return "選擇演員"+studio_locale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "收緊"},
"soundGoal1":function(d){return "目標 1"},
"soundGoal2":function(d){return "目標 2"},
"soundHit":function(d){return "敲擊聲"},
"soundLosePoint":function(d){return "失分"},
"soundLosePoint2":function(d){return "失2分"},
"soundRetro":function(d){return "復古"},
"soundRubber":function(d){return "橡皮聲"},
"soundSlap":function(d){return "拍手"},
"soundWinPoint":function(d){return "得分"},
"soundWinPoint2":function(d){return "得2分"},
"soundWood":function(d){return "木"},
"speed":function(d){return "速度"},
"startSetValue":function(d){return "開始 (函數)"},
"startSetVars":function(d){return "遊戲_變數 (標題、 副標題、 背景、 目標、 危險、 球員)"},
"startSetFuncs":function(d){return "遊戲_函數 (更新目標，更新危險、 更新玩家、 碰撞？ 在螢幕上?)"},
"stopSprite":function(d){return "停止"},
"stopSpriteN":function(d){return "讓演員 "+studio_locale.v(d,"spriteIndex")+" 停止"},
"stopTooltip":function(d){return "停止移動角色。"},
"throwSprite":function(d){return "發射"},
"throwSpriteN":function(d){return "演員 "+studio_locale.v(d,"spriteIndex")+" 發射"},
"throwTooltip":function(d){return "由指定的主角發射導彈。"},
"vanish":function(d){return "消失"},
"vanishActorN":function(d){return "讓演員 "+studio_locale.v(d,"spriteIndex")+" 消失"},
"vanishTooltip":function(d){return "讓演員消失。"},
"waitFor":function(d){return "等待"},
"waitSeconds":function(d){return "秒"},
"waitForClick":function(d){return "等待點擊"},
"waitForRandom":function(d){return "等待隨機"},
"waitForHalfSecond":function(d){return "等待半秒"},
"waitFor1Second":function(d){return "等待一秒"},
"waitFor2Seconds":function(d){return "等待兩秒"},
"waitFor5Seconds":function(d){return "等待五秒"},
"waitFor10Seconds":function(d){return "等待十秒"},
"waitParamsTooltip":function(d){return "等待輸入值（秒），或直接使用「０」來等候點擊"},
"waitTooltip":function(d){return "等候輸入的時間（當時間到達或點擊，就會觸發效果）"},
"whenArrowDown":function(d){return "下方向鍵"},
"whenArrowLeft":function(d){return "左方向鍵"},
"whenArrowRight":function(d){return "右方向鍵"},
"whenArrowUp":function(d){return "上方向鍵"},
"whenArrowTooltip":function(d){return "按下指定的方向鍵在執行動作"},
"whenDown":function(d){return "當按下＂下方向鍵＂"},
"whenDownTooltip":function(d){return "當按下＂下方向鍵＂，就會執行動作"},
"whenGameStarts":function(d){return "當故事開始時"},
"whenGameStartsTooltip":function(d){return "當故事開始時執行動作"},
"whenLeft":function(d){return "當按下＂左方向鍵＂"},
"whenLeftTooltip":function(d){return "當按下＂左方向鍵＂，就會執行動作"},
"whenRight":function(d){return "當按下＂右方向鍵＂"},
"whenRightTooltip":function(d){return "當按下＂右方向鍵＂，就會執行動作"},
"whenSpriteClicked":function(d){return "當你按下演員"},
"whenSpriteClickedN":function(d){return "當演員 "+studio_locale.v(d,"spriteIndex")+" 被點擊時"},
"whenSpriteClickedTooltip":function(d){return "當演員被點擊時執行動作"},
"whenSpriteCollidedN":function(d){return "當演員 "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "當兩個演員接觸時執行動作"},
"whenSpriteCollidedWith":function(d){return "接觸"},
"whenSpriteCollidedWithAnyActor":function(d){return "碰到任何一個演員"},
"whenSpriteCollidedWithAnyEdge":function(d){return "碰到任何邊緣"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "碰到任何導彈"},
"whenSpriteCollidedWithAnything":function(d){return "碰到任何東西"},
"whenSpriteCollidedWithN":function(d){return "接觸演員"+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "碰到藍色火球"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "碰到紫色火球"},
"whenSpriteCollidedWithRedFireball":function(d){return "碰到紅色火球"},
"whenSpriteCollidedWithYellowHearts":function(d){return "碰到黃色愛心"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "碰到紫色愛心"},
"whenSpriteCollidedWithRedHearts":function(d){return "碰到紅色愛心"},
"whenSpriteCollidedWithBottomEdge":function(d){return "接觸底部邊緣"},
"whenSpriteCollidedWithLeftEdge":function(d){return "接著左邊邊緣"},
"whenSpriteCollidedWithRightEdge":function(d){return "接觸右邊邊緣"},
"whenSpriteCollidedWithTopEdge":function(d){return "接觸上邊邊緣"},
"whenUp":function(d){return "當＂上方向鍵＂"},
"whenUpTooltip":function(d){return "當按下＂上方向鍵＂，就會執行動作"},
"yes":function(d){return "是"}};