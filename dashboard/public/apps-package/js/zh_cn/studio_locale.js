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
"actor":function(d){return "男演员"},
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
"emotion":function(d){return "心情"},
"finalLevel":function(d){return "恭喜你！你完成了最后一个谜题。"},
"for":function(d){return "为"},
"hello":function(d){return "你好"},
"helloWorld":function(d){return "世界 您好！"},
"incrementPlayerScore":function(d){return "得分点"},
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
"onEventTooltip":function(d){return "Execute code in response to the specified event."},
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
"projectileAnna":function(d){return "安娜"},
"projectileElsa":function(d){return "埃尔莎"},
"projectileHiro":function(d){return "希罗"},
"projectileBaymax":function(d){return "Baymax"},
"projectileRapunzel":function(d){return "长发公主"},
"projectileCherry":function(d){return "cherry"},
"projectileIce":function(d){return "ice"},
"projectileDuck":function(d){return "duck"},
"reinfFeedbackMsg":function(d){return "你可以按“重试”按钮来返回你的游戏"},
"repeatForever":function(d){return "一直重复下去"},
"repeatDo":function(d){return "做"},
"repeatForeverTooltip":function(d){return "当故事在进行时，在此块中反复执行这个动作。"},
"saySprite":function(d){return "说"},
"saySpriteN":function(d){return "演员"+studio_locale.v(d,"spriteIndex")+" 说"},
"saySpriteTooltip":function(d){return "从特定的小人上弹出文字气泡，表达它说的话。"},
"saySpriteChoices_0":function(d){return "Hi there."},
"saySpriteChoices_1":function(d){return "Hi there!"},
"saySpriteChoices_2":function(d){return "How are you?"},
"saySpriteChoices_3":function(d){return "This is fun..."},
"saySpriteChoices_4":function(d){return "Good afternoon"},
"saySpriteChoices_5":function(d){return "Good night"},
"saySpriteChoices_6":function(d){return "Good evening"},
"saySpriteChoices_7":function(d){return "What’s new?"},
"saySpriteChoices_8":function(d){return "What?"},
"saySpriteChoices_9":function(d){return "Where?"},
"saySpriteChoices_10":function(d){return "When?"},
"saySpriteChoices_11":function(d){return "Good."},
"saySpriteChoices_12":function(d){return "Great!"},
"saySpriteChoices_13":function(d){return "All right."},
"saySpriteChoices_14":function(d){return "Not bad."},
"saySpriteChoices_15":function(d){return "Good luck."},
"saySpriteChoices_16":function(d){return "是"},
"saySpriteChoices_17":function(d){return "不"},
"saySpriteChoices_18":function(d){return "Okay"},
"saySpriteChoices_19":function(d){return "Nice throw!"},
"saySpriteChoices_20":function(d){return "Have a nice day."},
"saySpriteChoices_21":function(d){return "Bye."},
"saySpriteChoices_22":function(d){return "I’ll be right back."},
"saySpriteChoices_23":function(d){return "See you tomorrow!"},
"saySpriteChoices_24":function(d){return "See you later!"},
"saySpriteChoices_25":function(d){return "Take care!"},
"saySpriteChoices_26":function(d){return "Enjoy!"},
"saySpriteChoices_27":function(d){return "I have to go."},
"saySpriteChoices_28":function(d){return "Want to be friends?"},
"saySpriteChoices_29":function(d){return "Great job!"},
"saySpriteChoices_30":function(d){return "Woo hoo!"},
"saySpriteChoices_31":function(d){return "Yay!"},
"saySpriteChoices_32":function(d){return "Nice to meet you."},
"saySpriteChoices_33":function(d){return "All right!"},
"saySpriteChoices_34":function(d){return "Thank you"},
"saySpriteChoices_35":function(d){return "No, thank you"},
"saySpriteChoices_36":function(d){return "Aaaaaah!"},
"saySpriteChoices_37":function(d){return "Never mind"},
"saySpriteChoices_38":function(d){return "Today"},
"saySpriteChoices_39":function(d){return "Tomorrow"},
"saySpriteChoices_40":function(d){return "Yesterday"},
"saySpriteChoices_41":function(d){return "我找到了你 ！"},
"saySpriteChoices_42":function(d){return "You found me!"},
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
"yes":function(d){return "是"}};