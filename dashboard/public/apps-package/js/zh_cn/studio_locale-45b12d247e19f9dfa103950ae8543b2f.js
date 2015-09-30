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
v:function(d,k){studio_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){studio_locale.c(d,k);return d[k] in p?p[d[k]]:(k=studio_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){studio_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).studio_locale = {
"actor":function(d){return "男演员"},
"addItems1":function(d){return "add 1 item of type"},
"addItems2":function(d){return "add 2 items of type"},
"addItems3":function(d){return "add 3 items of type"},
"addItems5":function(d){return "add 5 items of type"},
"addItems10":function(d){return "add 10 items of type"},
"addItemsRandom":function(d){return "add random items of type"},
"addItemsTooltip":function(d){return "Add items to the scene."},
"alienInvasion":function(d){return "外星人入侵 !"},
"backgroundBlack":function(d){return "黑色"},
"backgroundCave":function(d){return "洞穴"},
"backgroundCloudy":function(d){return "多云"},
"backgroundHardcourt":function(d){return "硬地球场"},
"backgroundNight":function(d){return "夜"},
"backgroundUnderwater":function(d){return "水底"},
"backgroundCity":function(d){return "城市"},
"backgroundDesert":function(d){return "沙漠"},
"backgroundRainbow":function(d){return "彩虹"},
"backgroundSoccer":function(d){return "足球"},
"backgroundSpace":function(d){return "空间"},
"backgroundTennis":function(d){return "网球"},
"backgroundWinter":function(d){return "冬天"},
"catActions":function(d){return "操作"},
"catControl":function(d){return "循环"},
"catEvents":function(d){return "事件"},
"catLogic":function(d){return "逻辑"},
"catMath":function(d){return "数学"},
"catProcedures":function(d){return "函数"},
"catText":function(d){return "文本"},
"catVariables":function(d){return "变量"},
"changeScoreTooltip":function(d){return "添加或移走一个得分点。"},
"changeScoreTooltipK1":function(d){return "添加一个得分点。"},
"continue":function(d){return "继续"},
"decrementPlayerScore":function(d){return "移动点"},
"defaultSayText":function(d){return "在此处键入"},
"dropletBlock_addItemsToScene_description":function(d){return "Add new items to the scene."},
"dropletBlock_addItemsToScene_param0":function(d){return "type"},
"dropletBlock_addItemsToScene_param0_description":function(d){return "The type of items to be added."},
"dropletBlock_addItemsToScene_param1":function(d){return "count"},
"dropletBlock_addItemsToScene_param1_description":function(d){return "The number of items to add."},
"dropletBlock_changeScore_description":function(d){return "添加或移走一个得分点。"},
"dropletBlock_changeScore_param0":function(d){return "得分"},
"dropletBlock_changeScore_param0_description":function(d){return "The value to add to the score (negative values will reduce the score)."},
"dropletBlock_moveEast_description":function(d){return "Moves the character to the east."},
"dropletBlock_moveNorth_description":function(d){return "Moves the character to the north."},
"dropletBlock_moveSouth_description":function(d){return "Moves the character to the south."},
"dropletBlock_moveWest_description":function(d){return "Moves the character to the west."},
"dropletBlock_playSound_description":function(d){return "播放所选声音"},
"dropletBlock_playSound_param0":function(d){return "sound"},
"dropletBlock_playSound_param0_description":function(d){return "The name of the sound to play."},
"dropletBlock_setBackground_description":function(d){return "设置背景图案"},
"dropletBlock_setBackground_param0":function(d){return "image"},
"dropletBlock_setBackground_param0_description":function(d){return "The name of the background image."},
"dropletBlock_setItemActivity_description":function(d){return "Set the activity mode for an item."},
"dropletBlock_setItemActivity_param0":function(d){return "index"},
"dropletBlock_setItemActivity_param0_description":function(d){return "The index (starting at 0) indicating which item's activity should change."},
"dropletBlock_setItemActivity_param1":function(d){return "activity"},
"dropletBlock_setItemActivity_param1_description":function(d){return "The name of the activity mode ('chaseGrid', 'roamGrid', or 'fleeGrid')."},
"dropletBlock_setSpriteEmotion_description":function(d){return "设置演员心情"},
"dropletBlock_setSpritePosition_description":function(d){return "立即将小人移动到指定的位置。"},
"dropletBlock_setSpriteSpeed_description":function(d){return "设置小人的速度"},
"dropletBlock_setSprite_description":function(d){return "设置小人形象"},
"dropletBlock_setSprite_param0":function(d){return "index"},
"dropletBlock_setSprite_param0_description":function(d){return "The index (starting at 0) indicating which actor should change."},
"dropletBlock_setSprite_param1":function(d){return "image"},
"dropletBlock_setSprite_param1_description":function(d){return "The name of the actor image."},
"dropletBlock_setWalls_description":function(d){return "Changes the walls in the scene."},
"dropletBlock_setWalls_param0":function(d){return "name"},
"dropletBlock_setWalls_param0_description":function(d){return "The name of the wall set ('border', 'maze', 'maze2', or 'none')."},
"dropletBlock_throw_description":function(d){return "从特定的演员抛出一个抛出物"},
"dropletBlock_vanish_description":function(d){return "使演员消失"},
"dropletBlock_whenDown_description":function(d){return "This function executes when the down button is pressed."},
"dropletBlock_whenLeft_description":function(d){return "This function executes when the left button is pressed."},
"dropletBlock_whenRight_description":function(d){return "This function executes when the right button is pressed."},
"dropletBlock_whenTouchItem_description":function(d){return "This function executes when the actor touches any item."},
"dropletBlock_whenUp_description":function(d){return "This function executes when the up button is pressed."},
"emotion":function(d){return "心情"},
"finalLevel":function(d){return "恭喜你！你完成了最后一个谜题。"},
"for":function(d){return "为"},
"hello":function(d){return "你好"},
"helloWorld":function(d){return "世界 您好！"},
"incrementPlayerScore":function(d){return "得分点"},
"itemBlueFireball":function(d){return "蓝色火球"},
"itemPurpleFireball":function(d){return "紫色火球"},
"itemRedFireball":function(d){return "红色火球"},
"itemYellowHearts":function(d){return "黄心"},
"itemPurpleHearts":function(d){return "紫心"},
"itemRedHearts":function(d){return "红心"},
"itemRandom":function(d){return "随机"},
"itemAnna":function(d){return "钩子"},
"itemElsa":function(d){return "光芒"},
"itemHiro":function(d){return "迷你机器人"},
"itemBaymax":function(d){return "火箭"},
"itemRapunzel":function(d){return "平底锅"},
"itemCherry":function(d){return "樱桃"},
"itemIce":function(d){return "冰"},
"itemDuck":function(d){return "鸭子"},
"itemItem1":function(d){return "Item1"},
"itemItem2":function(d){return "Item2"},
"itemItem3":function(d){return "Item3"},
"itemItem4":function(d){return "Item4"},
"makeProjectileDisappear":function(d){return "消失"},
"makeProjectileBounce":function(d){return "反弹"},
"makeProjectileBlueFireball":function(d){return "做蓝色的火球"},
"makeProjectilePurpleFireball":function(d){return "做紫色的火球"},
"makeProjectileRedFireball":function(d){return "做红色的火球"},
"makeProjectileYellowHearts":function(d){return "做黄色的心"},
"makeProjectilePurpleHearts":function(d){return "做紫色的心"},
"makeProjectileRedHearts":function(d){return "做红色的心"},
"makeProjectileTooltip":function(d){return "使只是相撞的弹丸消失或反弹。"},
"makeYourOwn":function(d){return "做自己的游戏实验室应用程序"},
"moveDirectionDown":function(d){return "向下"},
"moveDirectionLeft":function(d){return "向左"},
"moveDirectionRight":function(d){return "向右"},
"moveDirectionUp":function(d){return "向上"},
"moveDirectionRandom":function(d){return "随机"},
"moveDistance25":function(d){return "25 像素"},
"moveDistance50":function(d){return "50像素"},
"moveDistance100":function(d){return "100像素"},
"moveDistance200":function(d){return "200像素"},
"moveDistance400":function(d){return "400像素"},
"moveDistancePixels":function(d){return "像素"},
"moveDistanceRandom":function(d){return "随机像素"},
"moveDistanceTooltip":function(d){return "在指定的方向上移动一个特定的距离。"},
"moveSprite":function(d){return "移动"},
"moveSpriteN":function(d){return "移动演员 "+studio_locale.v(d,"spriteIndex")},
"toXY":function(d){return "到 X，Y"},
"moveDown":function(d){return "向下移动"},
"moveDownTooltip":function(d){return "向下移动一个小人。"},
"moveLeft":function(d){return "向左移动"},
"moveLeftTooltip":function(d){return "向左移动一个小人。"},
"moveRight":function(d){return "向右移动"},
"moveRightTooltip":function(d){return "向右移动一个小人。"},
"moveUp":function(d){return "向上移动"},
"moveUpTooltip":function(d){return "向上移动一个小人。"},
"moveTooltip":function(d){return "移动一个小人。"},
"nextLevel":function(d){return "恭喜你！你解决了这个谜题。"},
"no":function(d){return "不"},
"numBlocksNeeded":function(d){return "这个谜题可以用%1个语句块解决。"},
"onEventTooltip":function(d){return "根据指定的事件执行代码。"},
"ouchExclamation":function(d){return "哎哟 ！"},
"playSoundCrunch":function(d){return "播放吱嘎声"},
"playSoundGoal1":function(d){return "播放目标 1 声音"},
"playSoundGoal2":function(d){return "播放目标 2 的声音"},
"playSoundHit":function(d){return "播放命中的声音"},
"playSoundLosePoint":function(d){return "播放失去点数的声音"},
"playSoundLosePoint2":function(d){return "播放失去点数2的声音"},
"playSoundRetro":function(d){return "播放复古的声音。"},
"playSoundRubber":function(d){return "播放橡胶的声音"},
"playSoundSlap":function(d){return "播放巴掌的声音"},
"playSoundTooltip":function(d){return "播放所选声音"},
"playSoundWinPoint":function(d){return "播放赢得点数的声音"},
"playSoundWinPoint2":function(d){return "播放赢得点数的声音2"},
"playSoundWood":function(d){return "播放木的声音"},
"positionOutTopLeft":function(d){return "到上述左上角的位置"},
"positionOutTopRight":function(d){return "到上述右上角的位置"},
"positionTopOutLeft":function(d){return "到左外侧顶部的位置"},
"positionTopLeft":function(d){return "到顶部的左边位置"},
"positionTopCenter":function(d){return "到顶部的中心位置"},
"positionTopRight":function(d){return "到顶部的右边位置"},
"positionTopOutRight":function(d){return "到右外侧顶部的位置"},
"positionMiddleLeft":function(d){return "到中间的左边位置"},
"positionMiddleCenter":function(d){return "到中间的中心位置"},
"positionMiddleRight":function(d){return "到中间的右边位置"},
"positionBottomOutLeft":function(d){return "到左外侧底部的位置"},
"positionBottomLeft":function(d){return "到底部的左边位置"},
"positionBottomCenter":function(d){return "到底部的中心位置"},
"positionBottomRight":function(d){return "到底部的右边位置"},
"positionBottomOutRight":function(d){return "到右外侧底部的位置"},
"positionOutBottomLeft":function(d){return "到左侧底部下面的位置"},
"positionOutBottomRight":function(d){return "到右侧底部下面的位置"},
"positionRandom":function(d){return "到一个随机位置"},
"projectileBlueFireball":function(d){return "蓝色火球"},
"projectilePurpleFireball":function(d){return "紫色火球"},
"projectileRedFireball":function(d){return "红色火球"},
"projectileYellowHearts":function(d){return "黄心"},
"projectilePurpleHearts":function(d){return "紫心"},
"projectileRedHearts":function(d){return "红心"},
"projectileRandom":function(d){return "随机"},
"projectileAnna":function(d){return "钩子"},
"projectileElsa":function(d){return "光芒"},
"projectileHiro":function(d){return "迷你机器人"},
"projectileBaymax":function(d){return "火箭"},
"projectileRapunzel":function(d){return "平底锅"},
"projectileCherry":function(d){return "樱桃"},
"projectileIce":function(d){return "冰"},
"projectileDuck":function(d){return "鸭子"},
"reinfFeedbackMsg":function(d){return "你可以按下“继续玩”的按钮，回去玩你的故事。"},
"repeatForever":function(d){return "一直重复下去"},
"repeatDo":function(d){return "做"},
"repeatForeverTooltip":function(d){return "当故事在进行时，在此块中反复执行这个动作。"},
"saySprite":function(d){return "说"},
"saySpriteN":function(d){return "演员"+studio_locale.v(d,"spriteIndex")+" 说"},
"saySpriteTooltip":function(d){return "从特定的小人上弹出文字气泡，表达它说的话。"},
"saySpriteChoices_0":function(d){return "嘿，你好。"},
"saySpriteChoices_1":function(d){return "大家好。"},
"saySpriteChoices_2":function(d){return "你感觉怎么样？"},
"saySpriteChoices_3":function(d){return "早上好"},
"saySpriteChoices_4":function(d){return "下午好"},
"saySpriteChoices_5":function(d){return "晚安"},
"saySpriteChoices_6":function(d){return "晚上好"},
"saySpriteChoices_7":function(d){return "有什么新鲜事吗？"},
"saySpriteChoices_8":function(d){return "什么？"},
"saySpriteChoices_9":function(d){return "在哪儿？"},
"saySpriteChoices_10":function(d){return "什么时候？"},
"saySpriteChoices_11":function(d){return "好"},
"saySpriteChoices_12":function(d){return "太好了！"},
"saySpriteChoices_13":function(d){return "好的。"},
"saySpriteChoices_14":function(d){return "不错。"},
"saySpriteChoices_15":function(d){return "祝你好运"},
"saySpriteChoices_16":function(d){return "是"},
"saySpriteChoices_17":function(d){return "不"},
"saySpriteChoices_18":function(d){return "好吧"},
"saySpriteChoices_19":function(d){return "扔的好！"},
"saySpriteChoices_20":function(d){return "祝你有愉快的一天。"},
"saySpriteChoices_21":function(d){return "再见。"},
"saySpriteChoices_22":function(d){return "我马上就回来。"},
"saySpriteChoices_23":function(d){return "明天见！"},
"saySpriteChoices_24":function(d){return "回头见！"},
"saySpriteChoices_25":function(d){return "小心！"},
"saySpriteChoices_26":function(d){return "享受吧！"},
"saySpriteChoices_27":function(d){return "我得走了。"},
"saySpriteChoices_28":function(d){return "想要成为朋友吗？"},
"saySpriteChoices_29":function(d){return "太棒了！"},
"saySpriteChoices_30":function(d){return "呜呼！"},
"saySpriteChoices_31":function(d){return "耶！"},
"saySpriteChoices_32":function(d){return "我很高兴认识你。"},
"saySpriteChoices_33":function(d){return "好吧！"},
"saySpriteChoices_34":function(d){return "谢谢你"},
"saySpriteChoices_35":function(d){return "不用了，谢谢你"},
"saySpriteChoices_36":function(d){return "Aaaaaah!"},
"saySpriteChoices_37":function(d){return "Never mind"},
"saySpriteChoices_38":function(d){return "今天"},
"saySpriteChoices_39":function(d){return "明天"},
"saySpriteChoices_40":function(d){return "昨天"},
"saySpriteChoices_41":function(d){return "我找到了你 ！"},
"saySpriteChoices_42":function(d){return "你找到我了！"},
"saySpriteChoices_43":function(d){return "10、 9、 8、 7、 6、 5、 4、 3、 2、 1 ！"},
"saySpriteChoices_44":function(d){return "你真棒 ！"},
"saySpriteChoices_45":function(d){return "你很有趣！"},
"saySpriteChoices_46":function(d){return "你好笨 ！ "},
"saySpriteChoices_47":function(d){return "你是一个很好的朋友 ！"},
"saySpriteChoices_48":function(d){return "小心 ！"},
"saySpriteChoices_49":function(d){return "鸭子 ！"},
"saySpriteChoices_50":function(d){return "明白！"},
"saySpriteChoices_51":function(d){return "噢 ！"},
"saySpriteChoices_52":function(d){return "抱歉"},
"saySpriteChoices_53":function(d){return "小心 ！"},
"saySpriteChoices_54":function(d){return "哇 ！"},
"saySpriteChoices_55":function(d){return "哎呦！"},
"saySpriteChoices_56":function(d){return "你差点就赢了我 ！"},
"saySpriteChoices_57":function(d){return "不错的尝试 ！"},
"saySpriteChoices_58":function(d){return "你抓不住我 ！"},
"scoreText":function(d){return "得分： "+studio_locale.v(d,"playerScore")},
"setBackground":function(d){return "设置背景"},
"setBackgroundRandom":function(d){return "设置随机背景"},
"setBackgroundBlack":function(d){return "设置黑色背景"},
"setBackgroundCave":function(d){return "设置洞穴的背景"},
"setBackgroundCloudy":function(d){return "设置多云背景"},
"setBackgroundHardcourt":function(d){return "设置硬地背景"},
"setBackgroundNight":function(d){return "设置的夜背景"},
"setBackgroundUnderwater":function(d){return "设置水下背景"},
"setBackgroundCity":function(d){return "设置的城市背景"},
"setBackgroundDesert":function(d){return "设置沙漠背景"},
"setBackgroundRainbow":function(d){return "设置彩虹背景"},
"setBackgroundSoccer":function(d){return "设置足球背景"},
"setBackgroundSpace":function(d){return "设置空地背景"},
"setBackgroundTennis":function(d){return "设置网球背景"},
"setBackgroundWinter":function(d){return "设置冬天背景"},
"setBackgroundLeafy":function(d){return "设置绿叶背景"},
"setBackgroundGrassy":function(d){return "设置草背景"},
"setBackgroundFlower":function(d){return "设置花背景"},
"setBackgroundTile":function(d){return "设置平铺背景"},
"setBackgroundIcy":function(d){return "设置冰冷的背景"},
"setBackgroundSnowy":function(d){return "设置多雪的背景"},
"setBackgroundBackground1":function(d){return "set background1 background"},
"setBackgroundBackground2":function(d){return "set background2 background"},
"setBackgroundBackground3":function(d){return "set background3 background"},
"setBackgroundTooltip":function(d){return "设置背景图案"},
"setEnemySpeed":function(d){return "设置敌人的速度"},
"setPlayerSpeed":function(d){return "设置竞赛者速度"},
"setScoreText":function(d){return "设置得分"},
"setScoreTextTooltip":function(d){return "设置得分区域中显示的文本。"},
"setSpriteEmotionAngry":function(d){return "对愤怒的心情"},
"setSpriteEmotionHappy":function(d){return "对快乐的心情"},
"setSpriteEmotionNormal":function(d){return "对正常的心情"},
"setSpriteEmotionRandom":function(d){return "对随机的心情"},
"setSpriteEmotionSad":function(d){return "对伤心的心情"},
"setSpriteEmotionTooltip":function(d){return "设置演员心情"},
"setSpriteAlien":function(d){return "到外形人图片"},
"setSpriteBat":function(d){return "出现一只蝙蝠的形象"},
"setSpriteBird":function(d){return "出现一只鸟的形象"},
"setSpriteCat":function(d){return "出现一只猫的形象"},
"setSpriteCaveBoy":function(d){return "到山洞男孩图片"},
"setSpriteCaveGirl":function(d){return "到山洞女孩图片"},
"setSpriteDinosaur":function(d){return "出现一只恐龙的形象"},
"setSpriteDog":function(d){return "出现一只狗的形象"},
"setSpriteDragon":function(d){return "出现一条龙的形象"},
"setSpriteGhost":function(d){return "到鬼魂图片"},
"setSpriteHidden":function(d){return "到一个隐藏的图像\n"},
"setSpriteHideK1":function(d){return "隐藏"},
"setSpriteAnna":function(d){return "对安娜图象"},
"setSpriteElsa":function(d){return "到埃尔莎图像"},
"setSpriteHiro":function(d){return "到希罗图像"},
"setSpriteBaymax":function(d){return "到Baymax 图像"},
"setSpriteRapunzel":function(d){return "到长发公主图像"},
"setSpriteKnight":function(d){return "到骑士图片"},
"setSpriteMonster":function(d){return "到怪物图片"},
"setSpriteNinja":function(d){return "到蒙面忍者图片"},
"setSpriteOctopus":function(d){return "出现一张八达通的图像"},
"setSpritePenguin":function(d){return "出现一只企鹅的形象"},
"setSpritePirate":function(d){return "到海盗图片"},
"setSpritePrincess":function(d){return "到公主图片"},
"setSpriteRandom":function(d){return "到一个随机的图像"},
"setSpriteRobot":function(d){return "到机器人图片"},
"setSpriteShowK1":function(d){return "显示"},
"setSpriteSpacebot":function(d){return "到空间机器人图片"},
"setSpriteSoccerGirl":function(d){return "到足球女孩图片"},
"setSpriteSoccerBoy":function(d){return "到足球女孩图片"},
"setSpriteSquirrel":function(d){return "出现一只松鼠的形象"},
"setSpriteTennisGirl":function(d){return "到网球女孩图片"},
"setSpriteTennisBoy":function(d){return "到网球男孩图片"},
"setSpriteUnicorn":function(d){return "到麒麟图片"},
"setSpriteWitch":function(d){return "呈现女巫形象"},
"setSpriteWizard":function(d){return "出现一个向导形象"},
"setSpritePositionTooltip":function(d){return "立即将小人移动到指定的位置。"},
"setSpriteK1Tooltip":function(d){return "显示或隐藏特定的演员。"},
"setSpriteTooltip":function(d){return "设置小人形象"},
"setSpriteSizeRandom":function(d){return "以随机的尺寸"},
"setSpriteSizeVerySmall":function(d){return "到一个非常小的尺寸"},
"setSpriteSizeSmall":function(d){return "到一个小的尺寸"},
"setSpriteSizeNormal":function(d){return "到一个正常大小的尺寸"},
"setSpriteSizeLarge":function(d){return "到一个大尺寸"},
"setSpriteSizeVeryLarge":function(d){return "到非常大的尺寸"},
"setSpriteSizeTooltip":function(d){return "设置一个演员的大小"},
"setSpriteSpeedRandom":function(d){return "到一个随机的速度"},
"setSpriteSpeedVerySlow":function(d){return "到一个非常慢的速度"},
"setSpriteSpeedSlow":function(d){return "到一个较慢的速度"},
"setSpriteSpeedNormal":function(d){return "到一个普通的速度"},
"setSpriteSpeedFast":function(d){return "到一个比较快的速度"},
"setSpriteSpeedVeryFast":function(d){return "到一个非常快的速度"},
"setSpriteSpeedTooltip":function(d){return "设置小人的速度"},
"setSpriteZombie":function(d){return "到僵尸图片"},
"setSpriteCharacter1":function(d){return "to item1"},
"setSpriteCharacter2":function(d){return "to item2"},
"shareStudioTwitter":function(d){return "看看我的故事。我用@codeorg自己写的\n"},
"shareGame":function(d){return "分享您的故事："},
"showCoordinates":function(d){return "显示坐标"},
"showCoordinatesTooltip":function(d){return "在屏幕上展现主角的坐标"},
"showTitleScreen":function(d){return "显示标题屏幕"},
"showTitleScreenTitle":function(d){return "标题"},
"showTitleScreenText":function(d){return "文本"},
"showTSDefTitle":function(d){return "在此处键入标题"},
"showTSDefText":function(d){return "在此处键入文本"},
"showTitleScreenTooltip":function(d){return "在一个标题屏幕显示有关的标题和文本。"},
"size":function(d){return "大小："},
"setSprite":function(d){return "设置"},
"setSpriteN":function(d){return "设置演员 "+studio_locale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "紧缩"},
"soundGoal1":function(d){return "目标 1"},
"soundGoal2":function(d){return "目标 2"},
"soundHit":function(d){return "命中"},
"soundLosePoint":function(d){return "丢分"},
"soundLosePoint2":function(d){return "失去2分"},
"soundRetro":function(d){return "复古"},
"soundRubber":function(d){return "橡胶"},
"soundSlap":function(d){return "一巴掌"},
"soundWinPoint":function(d){return "赢得1分"},
"soundWinPoint2":function(d){return "赢得2分"},
"soundWood":function(d){return "木材"},
"speed":function(d){return "速度"},
"startSetValue":function(d){return "开始(功能)"},
"startSetVars":function(d){return "game_vars （标题、 副标题、 背景、 目标、 危险、 球员)"},
"startSetFuncs":function(d){return "game_funcs （更新目标，更新危险、 更新播放器、 碰撞吗？ 在屏幕上?)"},
"stopSprite":function(d){return "停止"},
"stopSpriteN":function(d){return "停止演员 "+studio_locale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "停止一个小人的运动。"},
"throwSprite":function(d){return "抛出"},
"throwSpriteN":function(d){return "演员 "+studio_locale.v(d,"spriteIndex")+" 抛出"},
"throwTooltip":function(d){return "从特定的演员抛出一个抛出物"},
"vanish":function(d){return "消失"},
"vanishActorN":function(d){return "消失的演员 "+studio_locale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "使演员消失"},
"waitFor":function(d){return "等待"},
"waitSeconds":function(d){return " 秒"},
"waitForClick":function(d){return "等待点击"},
"waitForRandom":function(d){return "随机等待"},
"waitForHalfSecond":function(d){return "等待半秒"},
"waitFor1Second":function(d){return "等待 1 秒"},
"waitFor2Seconds":function(d){return "等待 2 秒"},
"waitFor5Seconds":function(d){return "等待 5 秒"},
"waitFor10Seconds":function(d){return "等待 10 秒"},
"waitParamsTooltip":function(d){return "等待指定的秒数或使用零等待，直到点击发生."},
"waitTooltip":function(d){return "等待指定的时间长度或直到发生点击"},
"whenArrowDown":function(d){return "向下箭头键"},
"whenArrowLeft":function(d){return "向左的箭头"},
"whenArrowRight":function(d){return "向右箭头"},
"whenArrowUp":function(d){return "向上箭头键"},
"whenArrowTooltip":function(d){return "当指定的方向键按下时，执行下面的操作"},
"whenDown":function(d){return "当箭头键向下"},
"whenDownTooltip":function(d){return "执行下面按向上箭头键时采取的行动。"},
"whenGameStarts":function(d){return "当故事开始的时候"},
"whenGameStartsTooltip":function(d){return "执行下面这个故事开始的时候行动。"},
"whenLeft":function(d){return "当箭头向左"},
"whenLeftTooltip":function(d){return "执行下面按向左箭头键时采取的行动。"},
"whenRight":function(d){return "当箭头向右"},
"whenRightTooltip":function(d){return "执行下面按向右箭头键时采取的行动。"},
"whenSpriteClicked":function(d){return "小人被点击时"},
"whenSpriteClickedN":function(d){return "演员 "+studio_locale.v(d,"spriteIndex")+" 被单击时"},
"whenSpriteClickedTooltip":function(d){return "当小人被点击时，执行下面的动作。"},
"whenSpriteCollidedN":function(d){return "演员 "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "当一个小人触碰到另一个小人时，执行下面的动作。"},
"whenSpriteCollidedWith":function(d){return "接近"},
"whenSpriteCollidedWithAnyActor":function(d){return "触动任何一个演员"},
"whenSpriteCollidedWithAnyEdge":function(d){return "触摸任何边缘"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "触摸任何弹丸"},
"whenSpriteCollidedWithAnything":function(d){return "触摸任何东西"},
"whenSpriteCollidedWithN":function(d){return "接近演员 "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "触摸蓝色火球"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "触摸紫色火球"},
"whenSpriteCollidedWithRedFireball":function(d){return "触摸红色火球"},
"whenSpriteCollidedWithYellowHearts":function(d){return "触摸黄色的心"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "触摸紫色的心"},
"whenSpriteCollidedWithRedHearts":function(d){return "触摸红色的心"},
"whenSpriteCollidedWithBottomEdge":function(d){return "接近地步边缘"},
"whenSpriteCollidedWithLeftEdge":function(d){return "接近左边缘"},
"whenSpriteCollidedWithRightEdge":function(d){return "接近有边缘"},
"whenSpriteCollidedWithTopEdge":function(d){return "接近上边缘"},
"whenUp":function(d){return "当箭头向上"},
"whenUpTooltip":function(d){return "执行下面按向上箭头键时采取的行动。"},
"yes":function(d){return "是"},
"dropletBlock_setItemSpeed_description":function(d){return "Sets the speed for a set of items."},
"dropletBlock_setItemSpeed_param0":function(d){return "type"},
"dropletBlock_setItemSpeed_param0_description":function(d){return "The type of items to be changed ('item_walk_item1', 'item_walk_item2', 'item_walk_item3', or ''item_walk_item4'."},
"dropletBlock_setItemSpeed_param1":function(d){return "speed"},
"dropletBlock_setItemSpeed_param1_description":function(d){return "The speed value (2, 3, 5, 8, or 12)."},
"dropletBlock_setCharacter_description":function(d){return "Sets the character image."},
"dropletBlock_setCharacter_param0":function(d){return "image"},
"dropletBlock_setCharacter_param0_description":function(d){return "The name of the character image ('character1' or 'character2')."},
"dropletBlock_setCharacterSpeed_description":function(d){return "Sets the character speed."},
"dropletBlock_setCharacterSpeed_param0":function(d){return "speed"},
"dropletBlock_setCharacterSpeed_param0_description":function(d){return "The speed value (2, 3, 5, 8, or 12)."},
"dropletBlock_whenTouchWall_description":function(d){return "This function executes when the character touches any wall."},
"dropletBlock_whenTouchWalkItem1_description":function(d){return "This function executes when the character touches items with type 'item_walk_item1'."},
"dropletBlock_whenTouchWalkItem2_description":function(d){return "This function executes when the character touches items with type 'item_walk_item2'."},
"dropletBlock_whenTouchWalkItem3_description":function(d){return "This function executes when the character touches items with type 'item_walk_item3'."},
"dropletBlock_whenTouchWalkItem4_description":function(d){return "This function executes when the character touches items with type 'item_walk_item4'."},
"setActivityRandom":function(d){return "set activity to random for"},
"setActivityPatrol":function(d){return "set activity to patrol for"},
"setActivityChase":function(d){return "set activity to chase for"},
"setActivityFlee":function(d){return "set activity to flee for"},
"setActivityNone":function(d){return "set activity to none for"},
"setActivityTooltip":function(d){return "Sets the activity for a set of items"},
"setItemSpeedSet":function(d){return "set type"},
"setItemSpeedTooltip":function(d){return "Sets the speed for a set of items"},
"setWalls":function(d){return "set walls"},
"setWallsHidden":function(d){return "set hidden walls"},
"setWallsRandom":function(d){return "set random walls"},
"setWallsBorder":function(d){return "set border walls"},
"setWallsDefault":function(d){return "set default walls"},
"setWallsMaze":function(d){return "set maze walls"},
"setWallsMaze2":function(d){return "set maze2 walls"},
"setWallsTooltip":function(d){return "Changes the walls in the scene"},
"whenTouchItem":function(d){return "when item touched"},
"whenTouchItemTooltip":function(d){return "Execute the actions below when the actor touches an item."},
"whenTouchWall":function(d){return "when wall touched"},
"whenTouchWallTooltip":function(d){return "Execute the actions below when the actor touches a wall."}};