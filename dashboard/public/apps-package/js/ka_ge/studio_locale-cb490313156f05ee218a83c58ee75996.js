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
"actor":function(d){return "მსახიობი"},
"addItems1":function(d){return "ტიპის 1 საგნის დამატება"},
"addItems2":function(d){return "ტიპის 2 საგნის დამატება"},
"addItems3":function(d){return "ტიპის 3 საგნის დამატება"},
"addItems5":function(d){return "ტიპის 5 საგნის დამატება"},
"addItems10":function(d){return "ტიპის 10 საგნის დამატება"},
"addItemsRandom":function(d){return "ტიპის შემთხვევითი საგნების დამატება"},
"addItemsTooltip":function(d){return "გამოსახულებისთვის საგნის დამატება."},
"alienInvasion":function(d){return "უცხოპლანეტელების შემოსევა!"},
"backgroundBlack":function(d){return "შავი"},
"backgroundCave":function(d){return "გამოქვაბული"},
"backgroundCloudy":function(d){return "ღრუბლიანი"},
"backgroundHardcourt":function(d){return "მყარი კორტი"},
"backgroundNight":function(d){return "ღამე"},
"backgroundUnderwater":function(d){return "წყალქვეშა"},
"backgroundCity":function(d){return "ქალაქი"},
"backgroundDesert":function(d){return "უდაბნო"},
"backgroundRainbow":function(d){return "ცისარტყელა"},
"backgroundSoccer":function(d){return "ფეხბურთი"},
"backgroundSpace":function(d){return "კოსმოსი"},
"backgroundTennis":function(d){return "ტენისი"},
"backgroundWinter":function(d){return "ზამთარი"},
"catActions":function(d){return "მოქმედებები"},
"catControl":function(d){return "ციკლები"},
"catEvents":function(d){return "მოვლენები"},
"catLogic":function(d){return "ლოგიკა"},
"catMath":function(d){return "მათემატიკა"},
"catProcedures":function(d){return "ფუნქციები"},
"catText":function(d){return "ტექსტი"},
"catVariables":function(d){return "ცვლადები"},
"changeScoreTooltip":function(d){return "ქულის ერთით გაზრდა ან შემცირება."},
"changeScoreTooltipK1":function(d){return "ქულის ერთით გაზრდა."},
"continue":function(d){return "გაგრძელება"},
"decrementPlayerScore":function(d){return "ქულის დაკლება"},
"defaultSayText":function(d){return "დაწერეთ აქ"},
"dropletBlock_changeScore_description":function(d){return "ქულის ერთით გაზრდა ან შემცირება."},
"dropletBlock_penColour_description":function(d){return "Sets the color of the line drawn behind the turtle as it moves"},
"dropletBlock_penColour_param0":function(d){return "color"},
"dropletBlock_setBackground_description":function(d){return "აყენებს ფონის სურათს"},
"dropletBlock_setSpriteEmotion_description":function(d){return "Sets the actor mood"},
"dropletBlock_setSpritePosition_description":function(d){return "მყისიერად გადააადგილებს მსახიობს კონკრეტულ ადგილას."},
"dropletBlock_setSpriteSpeed_description":function(d){return "აყენებს მსახიობის სიჩქარეს"},
"dropletBlock_setSprite_description":function(d){return "აყენებს მსახიობის სურათს"},
"dropletBlock_throw_description":function(d){return "Throws a projectile from the specified actor."},
"dropletBlock_vanish_description":function(d){return "Vanishes the actor."},
"emotion":function(d){return "განწყობა"},
"finalLevel":function(d){return "გილოცავ! შენ ამოხსენი უკანასკნელი თავსატეხი."},
"for":function(d){return "for"},
"hello":function(d){return "გამარჯობა"},
"helloWorld":function(d){return "ჰეი, სამყარო!"},
"incrementPlayerScore":function(d){return "score point"},
"itemBlueFireball":function(d){return "blue fireball"},
"itemPurpleFireball":function(d){return "purple fireball"},
"itemRedFireball":function(d){return "red fireball"},
"itemYellowHearts":function(d){return "yellow hearts"},
"itemPurpleHearts":function(d){return "purple hearts"},
"itemRedHearts":function(d){return "red hearts"},
"itemRandom":function(d){return "შემთხვევითი"},
"itemAnna":function(d){return "hook"},
"itemElsa":function(d){return "sparkle"},
"itemHiro":function(d){return "microbots"},
"itemBaymax":function(d){return "rocket"},
"itemRapunzel":function(d){return "saucepan"},
"itemCherry":function(d){return "cherry"},
"itemIce":function(d){return "ice"},
"itemDuck":function(d){return "duck"},
"makeProjectileDisappear":function(d){return "გაქრობა"},
"makeProjectileBounce":function(d){return "არეკვლა"},
"makeProjectileBlueFireball":function(d){return "ლურჯი ცეცხლოვანი ბურთის შექმნა"},
"makeProjectilePurpleFireball":function(d){return "იისფერი ცეცხლოვანი ბურთის შექმნა"},
"makeProjectileRedFireball":function(d){return "წითელი ცეცხლოვანი ბურთის შექმნა"},
"makeProjectileYellowHearts":function(d){return "ყვითელი ცეცხლოვანი ბურთის შექმნა"},
"makeProjectilePurpleHearts":function(d){return "იისფერი გულების შექმნა"},
"makeProjectileRedHearts":function(d){return "წითელი გულების შექმნა"},
"makeProjectileTooltip":function(d){return "დაჯახებული სხეულის გაქრობა ან არეკვლა."},
"makeYourOwn":function(d){return "საკუთარი Play Lab აპლიკაციის შექმნა"},
"moveDirectionDown":function(d){return "ქვემოთ"},
"moveDirectionLeft":function(d){return "მარცხნივ"},
"moveDirectionRight":function(d){return "მარჯვნივ"},
"moveDirectionUp":function(d){return "ზემოთ"},
"moveDirectionRandom":function(d){return "შემთხვევითი"},
"moveDistance25":function(d){return "25 პიქსელი"},
"moveDistance50":function(d){return "50 პიქსელი"},
"moveDistance100":function(d){return "100 პიქსელი"},
"moveDistance200":function(d){return "200 პიქსელი"},
"moveDistance400":function(d){return "400 პიქსელი"},
"moveDistancePixels":function(d){return "პიქსელით"},
"moveDistanceRandom":function(d){return "შემთხვევითი პიქსელები"},
"moveDistanceTooltip":function(d){return "მსახიობის გადაადგილება კონკრეტული მიმართულებითა და მანძილით."},
"moveSprite":function(d){return "გადაადგილება"},
"moveSpriteN":function(d){return "მსახიობის გადაადგილება "+studio_locale.v(d,"spriteIndex")},
"toXY":function(d){return "x, y-ზე"},
"moveDown":function(d){return "move down"},
"moveDownTooltip":function(d){return "მსახიობის ქვემოთ გადაადგილება."},
"moveLeft":function(d){return "move left"},
"moveLeftTooltip":function(d){return "მსახიობის მარცხნივ გადაადგილება."},
"moveRight":function(d){return "move right"},
"moveRightTooltip":function(d){return "მსახიობის მარჯვნივ გადაადგილება."},
"moveUp":function(d){return "move up"},
"moveUpTooltip":function(d){return "მსახიობის ზემოთ გადაადგილება."},
"moveTooltip":function(d){return "მსახიობის გადაადგილება."},
"nextLevel":function(d){return "გილოცავ! შენ დაასრულე ეს თავსატეხი."},
"no":function(d){return "არა"},
"numBlocksNeeded":function(d){return "ამ თავსატეხის ამოსახსნელად საჭიროა %1 ბლოკი."},
"onEventTooltip":function(d){return "Execute code in response to the specified event."},
"ouchExclamation":function(d){return "Ouch!"},
"playSoundCrunch":function(d){return "play crunch sound"},
"playSoundGoal1":function(d){return "play goal 1 sound"},
"playSoundGoal2":function(d){return "play goal 2 sound"},
"playSoundHit":function(d){return "play hit sound"},
"playSoundLosePoint":function(d){return "play lose point sound"},
"playSoundLosePoint2":function(d){return "play lose point 2 sound"},
"playSoundRetro":function(d){return "play retro sound"},
"playSoundRubber":function(d){return "play rubber sound"},
"playSoundSlap":function(d){return "play slap sound"},
"playSoundTooltip":function(d){return "Play the chosen sound."},
"playSoundWinPoint":function(d){return "play win point sound"},
"playSoundWinPoint2":function(d){return "play win point 2 sound"},
"playSoundWood":function(d){return "play wood sound"},
"positionOutTopLeft":function(d){return "to the above top left position"},
"positionOutTopRight":function(d){return "to the above top right position"},
"positionTopOutLeft":function(d){return "to the top outside left position"},
"positionTopLeft":function(d){return "to the top left position"},
"positionTopCenter":function(d){return "to the top center position"},
"positionTopRight":function(d){return "to the top right position"},
"positionTopOutRight":function(d){return "to the top outside right position"},
"positionMiddleLeft":function(d){return "to the middle left position"},
"positionMiddleCenter":function(d){return "to the middle center position"},
"positionMiddleRight":function(d){return "to the middle right position"},
"positionBottomOutLeft":function(d){return "to the bottom outside left position"},
"positionBottomLeft":function(d){return "to the bottom left position"},
"positionBottomCenter":function(d){return "to the bottom center position"},
"positionBottomRight":function(d){return "to the bottom right position"},
"positionBottomOutRight":function(d){return "to the bottom outside right position"},
"positionOutBottomLeft":function(d){return "to the below bottom left position"},
"positionOutBottomRight":function(d){return "to the below bottom right position"},
"positionRandom":function(d){return "to the random position"},
"projectileBlueFireball":function(d){return "blue fireball"},
"projectilePurpleFireball":function(d){return "purple fireball"},
"projectileRedFireball":function(d){return "red fireball"},
"projectileYellowHearts":function(d){return "yellow hearts"},
"projectilePurpleHearts":function(d){return "purple hearts"},
"projectileRedHearts":function(d){return "red hearts"},
"projectileRandom":function(d){return "შემთხვევითი"},
"projectileAnna":function(d){return "hook"},
"projectileElsa":function(d){return "sparkle"},
"projectileHiro":function(d){return "microbots"},
"projectileBaymax":function(d){return "rocket"},
"projectileRapunzel":function(d){return "saucepan"},
"projectileCherry":function(d){return "cherry"},
"projectileIce":function(d){return "ice"},
"projectileDuck":function(d){return "duck"},
"reinfFeedbackMsg":function(d){return "You can press the \"Keep Playing\" button to go back to playing your story."},
"repeatForever":function(d){return "repeat forever"},
"repeatDo":function(d){return "შესრულება"},
"repeatForeverTooltip":function(d){return "Execute the actions in this block repeatedly while the story is running."},
"saySprite":function(d){return "say"},
"saySpriteN":function(d){return "actor "+studio_locale.v(d,"spriteIndex")+" say"},
"saySpriteTooltip":function(d){return "Pop up a speech bubble with the associated text from the specified actor."},
"saySpriteChoices_0":function(d){return "გამარჯობა."},
"saySpriteChoices_1":function(d){return "სალამი ყველას."},
"saySpriteChoices_2":function(d){return "როგორ ხარ?"},
"saySpriteChoices_3":function(d){return "დილა მშვიდობისა"},
"saySpriteChoices_4":function(d){return "შუადღე მშვიდობისა"},
"saySpriteChoices_5":function(d){return "ღამე მშვიდობისა"},
"saySpriteChoices_6":function(d){return "საღამო მშვიდობისა"},
"saySpriteChoices_7":function(d){return "რა არის ახალი?"},
"saySpriteChoices_8":function(d){return "რა?"},
"saySpriteChoices_9":function(d){return "სად?"},
"saySpriteChoices_10":function(d){return "როდის?"},
"saySpriteChoices_11":function(d){return "კარგი."},
"saySpriteChoices_12":function(d){return "დიდებულია!"},
"saySpriteChoices_13":function(d){return "კიბატონო."},
"saySpriteChoices_14":function(d){return "ცუდი არაა."},
"saySpriteChoices_15":function(d){return "წარმატებები."},
"saySpriteChoices_16":function(d){return "დიახ"},
"saySpriteChoices_17":function(d){return "არა"},
"saySpriteChoices_18":function(d){return "კარგი"},
"saySpriteChoices_19":function(d){return "კარგი ნასროლია!"},
"saySpriteChoices_20":function(d){return "სასიამოვნო დღეს გისურვებთ."},
"saySpriteChoices_21":function(d){return "ნახვამდის."},
"saySpriteChoices_22":function(d){return "მალე დავბრუნდები."},
"saySpriteChoices_23":function(d){return "ხვალამდე!"},
"saySpriteChoices_24":function(d){return "დროებით!"},
"saySpriteChoices_25":function(d){return "თავს მოუარე!"},
"saySpriteChoices_26":function(d){return "ისიამოვნე!"},
"saySpriteChoices_27":function(d){return "უნდა წავიდე."},
"saySpriteChoices_28":function(d){return "გინდა ვიმეგობროთ?"},
"saySpriteChoices_29":function(d){return "ყოჩაღ!"},
"saySpriteChoices_30":function(d){return "Woo hoo!"},
"saySpriteChoices_31":function(d){return "ვაშა!"},
"saySpriteChoices_32":function(d){return "სასიამოვნოა თქვენი გაცნობა."},
"saySpriteChoices_33":function(d){return "ძალიან კარგი!"},
"saySpriteChoices_34":function(d){return "მადლობა"},
"saySpriteChoices_35":function(d){return "არა, გმადლობთ"},
"saySpriteChoices_36":function(d){return "აააააააჰ!"},
"saySpriteChoices_37":function(d){return "უმნიშვნელოა"},
"saySpriteChoices_38":function(d){return "დღეს"},
"saySpriteChoices_39":function(d){return "ხვალ"},
"saySpriteChoices_40":function(d){return "გუშინ"},
"saySpriteChoices_41":function(d){return "გიპოვე!"},
"saySpriteChoices_42":function(d){return "მიპოვე!"},
"saySpriteChoices_43":function(d){return "10, 9, 8, 7, 6, 5, 4, 3, 2, 1!"},
"saySpriteChoices_44":function(d){return "მაგარი ხარ!"},
"saySpriteChoices_45":function(d){return "სასაცილო ხარ!"},
"saySpriteChoices_46":function(d){return "სახალისო ხარ! "},
"saySpriteChoices_47":function(d){return "კარგი მეგობარი ხარ!"},
"saySpriteChoices_48":function(d){return "ფრთხილად!"},
"saySpriteChoices_49":function(d){return "ჩაიკუზე!"},
"saySpriteChoices_50":function(d){return "დაგიჭირე!"},
"saySpriteChoices_51":function(d){return "ვაი!"},
"saySpriteChoices_52":function(d){return "Sorry!"},
"saySpriteChoices_53":function(d){return "Careful!"},
"saySpriteChoices_54":function(d){return "Whoa!"},
"saySpriteChoices_55":function(d){return "Oops!"},
"saySpriteChoices_56":function(d){return "You almost got me!"},
"saySpriteChoices_57":function(d){return "Nice try!"},
"saySpriteChoices_58":function(d){return "You can’t catch me!"},
"scoreText":function(d){return "ქულა: "+studio_locale.v(d,"playerScore")},
"setBackground":function(d){return "set background"},
"setBackgroundRandom":function(d){return "set random background"},
"setBackgroundBlack":function(d){return "set black background"},
"setBackgroundCave":function(d){return "set cave background"},
"setBackgroundCloudy":function(d){return "set cloudy background"},
"setBackgroundHardcourt":function(d){return "set hardcourt background"},
"setBackgroundNight":function(d){return "set night background"},
"setBackgroundUnderwater":function(d){return "set underwater background"},
"setBackgroundCity":function(d){return "set city background"},
"setBackgroundDesert":function(d){return "set desert background"},
"setBackgroundRainbow":function(d){return "set rainbow background"},
"setBackgroundSoccer":function(d){return "set soccer background"},
"setBackgroundSpace":function(d){return "set space background"},
"setBackgroundTennis":function(d){return "set tennis background"},
"setBackgroundWinter":function(d){return "set winter background"},
"setBackgroundLeafy":function(d){return "set leafy background"},
"setBackgroundGrassy":function(d){return "set grassy background"},
"setBackgroundFlower":function(d){return "set flower background"},
"setBackgroundTile":function(d){return "set tile background"},
"setBackgroundIcy":function(d){return "set icy background"},
"setBackgroundSnowy":function(d){return "set snowy background"},
"setBackgroundTooltip":function(d){return "აყენებს ფონის სურათს"},
"setEnemySpeed":function(d){return "set enemy speed"},
"setPlayerSpeed":function(d){return "set player speed"},
"setScoreText":function(d){return "ქულის დაყენება"},
"setScoreTextTooltip":function(d){return "Sets the text to be displayed in the score area."},
"setSpriteEmotionAngry":function(d){return "to an angry mood"},
"setSpriteEmotionHappy":function(d){return "to a happy mood"},
"setSpriteEmotionNormal":function(d){return "to a normal mood"},
"setSpriteEmotionRandom":function(d){return "to a random mood"},
"setSpriteEmotionSad":function(d){return "to a sad mood"},
"setSpriteEmotionTooltip":function(d){return "Sets the actor mood"},
"setSpriteAlien":function(d){return "to an alien image"},
"setSpriteBat":function(d){return "to a bat image"},
"setSpriteBird":function(d){return "to a bird image"},
"setSpriteCat":function(d){return "to a cat image"},
"setSpriteCaveBoy":function(d){return "to a cave boy image"},
"setSpriteCaveGirl":function(d){return "to a cave girl image"},
"setSpriteDinosaur":function(d){return "to a dinosaur image"},
"setSpriteDog":function(d){return "to a dog image"},
"setSpriteDragon":function(d){return "to a dragon image"},
"setSpriteGhost":function(d){return "to a ghost image"},
"setSpriteHidden":function(d){return "to a hidden image"},
"setSpriteHideK1":function(d){return "hide"},
"setSpriteAnna":function(d){return "to an Anna image"},
"setSpriteElsa":function(d){return "ელზას სურათი"},
"setSpriteHiro":function(d){return "გმირის სურათი"},
"setSpriteBaymax":function(d){return "Baymax-ის სურათი"},
"setSpriteRapunzel":function(d){return "რაპუნცელის სურათი"},
"setSpriteKnight":function(d){return "რაინდის სურათი"},
"setSpriteMonster":function(d){return "ურჩხულის სურათი"},
"setSpriteNinja":function(d){return "შენიღბული ნინძას სურათი"},
"setSpriteOctopus":function(d){return "რვაფეხას სურათი"},
"setSpritePenguin":function(d){return "პინგვინის სურათი"},
"setSpritePirate":function(d){return "მეკობრის სურათი"},
"setSpritePrincess":function(d){return "პრინცესას სურათი"},
"setSpriteRandom":function(d){return "შემთხვევითი სურათი"},
"setSpriteRobot":function(d){return "რობოტის სურათი"},
"setSpriteShowK1":function(d){return "ჩვენებ"},
"setSpriteSpacebot":function(d){return "spacebot-ის სურათი"},
"setSpriteSoccerGirl":function(d){return "ფეხბურთელი გოგოს სურათი"},
"setSpriteSoccerBoy":function(d){return "ფეხბურთელი ბიჭის სურათი"},
"setSpriteSquirrel":function(d){return "ციყვის სურათი"},
"setSpriteTennisGirl":function(d){return "ჩოგბურთელი გოგოს სურათი"},
"setSpriteTennisBoy":function(d){return "ჩოგბურთელი ბიჭის სურათი"},
"setSpriteUnicorn":function(d){return "Unicorn-ის სურათი"},
"setSpriteWitch":function(d){return "ჯადოქარი ქალის სურათი"},
"setSpriteWizard":function(d){return "ჯადოქარი კაცის სურათი"},
"setSpritePositionTooltip":function(d){return "მყისიერად გადააადგილებს მსახიობს კონკრეტულ ადგილას."},
"setSpriteK1Tooltip":function(d){return "აჩენს ან მალავს კონკრეტულ მსახიობს."},
"setSpriteTooltip":function(d){return "აყენებს მსახიობის სურათს"},
"setSpriteSizeRandom":function(d){return "შემთხვევით ზომაზე"},
"setSpriteSizeVerySmall":function(d){return "ძალიან მცირე ზომაზე"},
"setSpriteSizeSmall":function(d){return "მცირე ზომაზე"},
"setSpriteSizeNormal":function(d){return "ნორმალურ ზომაზე"},
"setSpriteSizeLarge":function(d){return "დიდ ზომაზე"},
"setSpriteSizeVeryLarge":function(d){return "ძალიან დიდ ზომაზე"},
"setSpriteSizeTooltip":function(d){return "აყენებს მსახიობის ზომას"},
"setSpriteSpeedRandom":function(d){return "შემთხვევით სიჩქარეზე"},
"setSpriteSpeedVerySlow":function(d){return "ძალიან ნელ სიჩქარეზე"},
"setSpriteSpeedSlow":function(d){return "ნელ სიჩქარეზე"},
"setSpriteSpeedNormal":function(d){return "ნორმალურ სიჩქარეზე"},
"setSpriteSpeedFast":function(d){return "მაღალ სიჩქარეზე"},
"setSpriteSpeedVeryFast":function(d){return "ძალიან მაღალ სიჩქარეზე"},
"setSpriteSpeedTooltip":function(d){return "აყენებს მსახიობის სიჩქარეს"},
"setSpriteZombie":function(d){return "ზომბის ფოტო"},
"shareStudioTwitter":function(d){return "ნახეთ რა შევქმენი. მე თვითონ დავწერე @codeorg-ით"},
"shareGame":function(d){return "გააზიარეთ თქვენი ნამუშევარი:"},
"showCoordinates":function(d){return "კოორდინატების ჩვენება"},
"showCoordinatesTooltip":function(d){return "პროტაგონისტის კოორდინატების ჩვენება ეკრანზე"},
"showTitleScreen":function(d){return "დასახელებების ეკრანის ჩვენება"},
"showTitleScreenTitle":function(d){return "დასახელება"},
"showTitleScreenText":function(d){return "ტექსტი"},
"showTSDefTitle":function(d){return "დასახელება შეიყვანეთ აქ"},
"showTSDefText":function(d){return "ტექსტი შეიყვანეთ აქ"},
"showTitleScreenTooltip":function(d){return "დასახელებასა და ტექსტთან ასოცირებული დასახელებების ეკრანის ჩვენება."},
"size":function(d){return "size"},
"setSprite":function(d){return "მინიჭება"},
"setSpriteN":function(d){return "set actor "+studio_locale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "ხრაშუნი"},
"soundGoal1":function(d){return "goal 1"},
"soundGoal2":function(d){return "goal 2"},
"soundHit":function(d){return "hit"},
"soundLosePoint":function(d){return "lose point"},
"soundLosePoint2":function(d){return "lose point 2"},
"soundRetro":function(d){return "retro"},
"soundRubber":function(d){return "rubber"},
"soundSlap":function(d){return "slap"},
"soundWinPoint":function(d){return "win point"},
"soundWinPoint2":function(d){return "win point 2"},
"soundWood":function(d){return "wood"},
"speed":function(d){return "speed"},
"startSetValue":function(d){return "start (function)"},
"startSetVars":function(d){return "game_vars (title, subtitle, background, target, danger, player)"},
"startSetFuncs":function(d){return "game_funcs (update-target, update-danger, update-player, collide?, on-screen?)"},
"stopSprite":function(d){return "stop"},
"stopSpriteN":function(d){return "stop actor "+studio_locale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Stops an actor's movement."},
"throwSprite":function(d){return "throw"},
"throwSpriteN":function(d){return "actor "+studio_locale.v(d,"spriteIndex")+" throw"},
"throwTooltip":function(d){return "Throws a projectile from the specified actor."},
"vanish":function(d){return "vanish"},
"vanishActorN":function(d){return "vanish actor "+studio_locale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "Vanishes the actor."},
"waitFor":function(d){return "wait for"},
"waitSeconds":function(d){return "seconds"},
"waitForClick":function(d){return "wait for click"},
"waitForRandom":function(d){return "wait for random"},
"waitForHalfSecond":function(d){return "wait for a half second"},
"waitFor1Second":function(d){return "wait for 1 second"},
"waitFor2Seconds":function(d){return "wait for 2 seconds"},
"waitFor5Seconds":function(d){return "wait for 5 seconds"},
"waitFor10Seconds":function(d){return "wait for 10 seconds"},
"waitParamsTooltip":function(d){return "Waits for a specified number of seconds or use zero to wait until a click occurs."},
"waitTooltip":function(d){return "Waits for a specified amount of time or until a click occurs."},
"whenArrowDown":function(d){return "down arrow"},
"whenArrowLeft":function(d){return "left arrow"},
"whenArrowRight":function(d){return "right arrow"},
"whenArrowUp":function(d){return "up arrow"},
"whenArrowTooltip":function(d){return "Execute the actions below when the specified arrow key is pressed."},
"whenDown":function(d){return "when down arrow"},
"whenDownTooltip":function(d){return "Execute the actions below when the down arrow key is pressed."},
"whenGameStarts":function(d){return "when story starts"},
"whenGameStartsTooltip":function(d){return "Execute the actions below when the story starts."},
"whenLeft":function(d){return "when left arrow"},
"whenLeftTooltip":function(d){return "Execute the actions below when the left arrow key is pressed."},
"whenRight":function(d){return "when right arrow"},
"whenRightTooltip":function(d){return "Execute the actions below when the right arrow key is pressed."},
"whenSpriteClicked":function(d){return "when actor clicked"},
"whenSpriteClickedN":function(d){return "when actor "+studio_locale.v(d,"spriteIndex")+" clicked"},
"whenSpriteClickedTooltip":function(d){return "Execute the actions below when an actor is clicked."},
"whenSpriteCollidedN":function(d){return "when actor "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "Execute the actions below when an actor touches another actor."},
"whenSpriteCollidedWith":function(d){return "touches"},
"whenSpriteCollidedWithAnyActor":function(d){return "ეხება ნებისმიერ მსახიობს"},
"whenSpriteCollidedWithAnyEdge":function(d){return "ეხება ნებისმიერ კიდეს"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "ეხება ნებისმიერ გასროლილ სხეულს"},
"whenSpriteCollidedWithAnything":function(d){return "ეხება ნებისმიერ რამეს"},
"whenSpriteCollidedWithN":function(d){return "ეხება მსახიობს "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "ეხება ლურჯ ცეცხლოვან ბურთს"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "ეხება იისფერ ცეცხლოვან ბურთს"},
"whenSpriteCollidedWithRedFireball":function(d){return "ეხება წითელ ცეცხლოვან ბურთს"},
"whenSpriteCollidedWithYellowHearts":function(d){return "ეხება ყვითელ გულებს"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "ეხება იისფერ გულებს"},
"whenSpriteCollidedWithRedHearts":function(d){return "ეხება წითელ გულებს"},
"whenSpriteCollidedWithBottomEdge":function(d){return "ეხება ქვედა კიდეს"},
"whenSpriteCollidedWithLeftEdge":function(d){return "ეხება მარცხენა კიდეს"},
"whenSpriteCollidedWithRightEdge":function(d){return "ეხება მარჯვენა კიდეს"},
"whenSpriteCollidedWithTopEdge":function(d){return "ეხება ზედა კიდეს"},
"whenUp":function(d){return "when up arrow"},
"whenUpTooltip":function(d){return "Execute the actions below when the up arrow key is pressed."},
"yes":function(d){return "დიახ"}};