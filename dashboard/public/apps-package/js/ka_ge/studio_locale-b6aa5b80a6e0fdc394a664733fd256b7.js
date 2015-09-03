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
"dropletBlock_setSpriteEmotion_description":function(d){return "განსაზღვრავს მსახიობის გუნებას"},
"dropletBlock_setSpritePosition_description":function(d){return "მყისიერად გადააადგილებს მსახიობს კონკრეტულ ადგილას."},
"dropletBlock_setSpriteSpeed_description":function(d){return "აყენებს მსახიობის სიჩქარეს"},
"dropletBlock_setSprite_description":function(d){return "აყენებს მსახიობის სურათს"},
"dropletBlock_throw_description":function(d){return "ისვრის ყუმბარას კონკრეტული მსახიობისგან."},
"dropletBlock_vanish_description":function(d){return "აქრობს მსახიობს."},
"emotion":function(d){return "განწყობა"},
"finalLevel":function(d){return "გილოცავ! შენ ამოხსენი უკანასკნელი თავსატეხი."},
"for":function(d){return "for"},
"hello":function(d){return "გამარჯობა"},
"helloWorld":function(d){return "ჰეი, სამყარო!"},
"incrementPlayerScore":function(d){return "დაგროვილი ქულები"},
"itemBlueFireball":function(d){return "ლურჯი ცეცხლოვანი ბურთი"},
"itemPurpleFireball":function(d){return "იასამნისფერი ცეცხლოვანი ბურთი"},
"itemRedFireball":function(d){return "წითელი ცეცხლოვანი ბურთი"},
"itemYellowHearts":function(d){return "ყვითელი გულები"},
"itemPurpleHearts":function(d){return "იასამნისფერი გულები"},
"itemRedHearts":function(d){return "წითელი გულები"},
"itemRandom":function(d){return "შემთხვევითი"},
"itemAnna":function(d){return "კაუჭი"},
"itemElsa":function(d){return "ბრჭყვიალი"},
"itemHiro":function(d){return "მიკრობოტები"},
"itemBaymax":function(d){return "რაკეტა"},
"itemRapunzel":function(d){return "ტაფა"},
"itemCherry":function(d){return "ალუბალი"},
"itemIce":function(d){return "ყინული"},
"itemDuck":function(d){return "იხვი"},
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
"moveDown":function(d){return "გადაადგილება ქვემოთ"},
"moveDownTooltip":function(d){return "მსახიობის ქვემოთ გადაადგილება."},
"moveLeft":function(d){return "გადაადგილება მარცხნივ"},
"moveLeftTooltip":function(d){return "მსახიობის მარცხნივ გადაადგილება."},
"moveRight":function(d){return "მარჯვნივ გადაადგილება"},
"moveRightTooltip":function(d){return "მსახიობის მარჯვნივ გადაადგილება."},
"moveUp":function(d){return "გადაადგილება ზემოთ"},
"moveUpTooltip":function(d){return "მსახიობის ზემოთ გადაადგილება."},
"moveTooltip":function(d){return "მსახიობის გადაადგილება."},
"nextLevel":function(d){return "გილოცავ! შენ დაასრულე ეს თავსატეხი."},
"no":function(d){return "არა"},
"numBlocksNeeded":function(d){return "ამ თავსატეხის ამოსახსნელად საჭიროა %1 ბლოკი."},
"onEventTooltip":function(d){return "კოდის გაშვება კონკრეტული მოვლენის საპასუხოდ."},
"ouchExclamation":function(d){return "ვაი!"},
"playSoundCrunch":function(d){return "ხრაშუნის ხმის დაკვრა"},
"playSoundGoal1":function(d){return "პირველი მიზნის ხმის დაკვრა"},
"playSoundGoal2":function(d){return "მეორე მიზნის ხმის დაკვრა"},
"playSoundHit":function(d){return "დარტყმის ხმის დაკვრა"},
"playSoundLosePoint":function(d){return "ქულის დაკარგვის ხმის დაკვრა"},
"playSoundLosePoint2":function(d){return "ქულის დაკარგვის მეორე ხმის დაკვრა"},
"playSoundRetro":function(d){return "რეტრო ხმის დაკვრა"},
"playSoundRubber":function(d){return "რეზინის ხმის დაკვრა"},
"playSoundSlap":function(d){return "შემოტყაპუნების ხმის დაკვრა"},
"playSoundTooltip":function(d){return "შერჩეული ხმის დაკვრა."},
"playSoundWinPoint":function(d){return "ქულის მოგების ხმის დაკვრა"},
"playSoundWinPoint2":function(d){return "ქულის მოგების მეორე ხმის დაკვრა"},
"playSoundWood":function(d){return "ხის ხმის დაკვრა"},
"positionOutTopLeft":function(d){return "მარცხენა ზედა პოზიციაზე"},
"positionOutTopRight":function(d){return "მარჯვენა ზედა პოზიციაზე"},
"positionTopOutLeft":function(d){return "ზედა გარეთა მარცხენა პოზიციაზე"},
"positionTopLeft":function(d){return "ზედა მარხენა პოზიციაზე"},
"positionTopCenter":function(d){return "ზედა ცენტრალურ პოზიციაზე"},
"positionTopRight":function(d){return "ზედა მარჯვენა პოზიციაზე"},
"positionTopOutRight":function(d){return "ზედა გარეთა მარჯვენა პოზიციაზე"},
"positionMiddleLeft":function(d){return "შუა მარცხენა პოზიციაზე"},
"positionMiddleCenter":function(d){return "შუა ცენტრალურ პოზიციაზე"},
"positionMiddleRight":function(d){return "შუა მარჯვენა პოზიციაზე"},
"positionBottomOutLeft":function(d){return "ქვედა გარეთა მარცხენა პოზიციაზე"},
"positionBottomLeft":function(d){return "ქვედა მარცხენა პოზიციაზე"},
"positionBottomCenter":function(d){return "ქვედა ცენტრალურ პოზიციაზე"},
"positionBottomRight":function(d){return "ქვედა მარჯვენა პოზიციაზე"},
"positionBottomOutRight":function(d){return "ქვედა გარეთა მარჯვენა პოზიციაზე"},
"positionOutBottomLeft":function(d){return "ქვემოთა ქვედა მარცხენა პოზიციაზე"},
"positionOutBottomRight":function(d){return "ქვემოთა ქვედა მარჯვენა პოზიციაზე"},
"positionRandom":function(d){return "შემთხვევით პოზიციაზე"},
"projectileBlueFireball":function(d){return "ლურჯი ცეცხლოვანი ბურთი"},
"projectilePurpleFireball":function(d){return "იასამნისფერი ცეცხლოვანი ბურთი"},
"projectileRedFireball":function(d){return "წითელი ცეცხლოვანი ბურთი"},
"projectileYellowHearts":function(d){return "ყვითელი გულები"},
"projectilePurpleHearts":function(d){return "იასამნისფერი გულები"},
"projectileRedHearts":function(d){return "წითელი გულები"},
"projectileRandom":function(d){return "შემთხვევითი"},
"projectileAnna":function(d){return "კაუჭი"},
"projectileElsa":function(d){return "ბრჭყვიალი"},
"projectileHiro":function(d){return "მიკრობოტები"},
"projectileBaymax":function(d){return "რაკეტა"},
"projectileRapunzel":function(d){return "ტაფა"},
"projectileCherry":function(d){return "ალუბალი"},
"projectileIce":function(d){return "ყინული"},
"projectileDuck":function(d){return "იხვი"},
"reinfFeedbackMsg":function(d){return "შეგიძლია დააწვე \""+studio_locale.v(d,"backButton")+"\" ღილაკს რათა განაგრძო თამაში."},
"repeatForever":function(d){return "მუდამ გამეორება"},
"repeatDo":function(d){return "შესრულება"},
"repeatForeverTooltip":function(d){return "შეასრულე მოქმედებები ამ ბლოკში განმეორებითად, სანამ თამაში მიმდინარეობს."},
"saySprite":function(d){return "თქმა"},
"saySpriteN":function(d){return "მსახიობი "+studio_locale.v(d,"spriteIndex")+" ამბობს"},
"saySpriteTooltip":function(d){return "სასაუბრო ბუშტის ჩვენება მითითებული პერსონაჟის მითითებული ტექსტით."},
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
"saySpriteChoices_52":function(d){return "ბოდიში!"},
"saySpriteChoices_53":function(d){return "ფრთხილად!"},
"saySpriteChoices_54":function(d){return "ოჰო!"},
"saySpriteChoices_55":function(d){return "უი!"},
"saySpriteChoices_56":function(d){return "თითქმის დამიჭირე!"},
"saySpriteChoices_57":function(d){return "კარგი მცდელობა იყო!"},
"saySpriteChoices_58":function(d){return "ვერ დამიჭერ!"},
"scoreText":function(d){return "ქულა: "+studio_locale.v(d,"playerScore")},
"setBackground":function(d){return "ფონის დაყენება"},
"setBackgroundRandom":function(d){return "შემთხვევითი ფონის დაყენება"},
"setBackgroundBlack":function(d){return "შავი ფონის დაყენება"},
"setBackgroundCave":function(d){return "გამოქვაბულის ფონის დაყენება"},
"setBackgroundCloudy":function(d){return "მოღრუბლული ფონის დაყენება"},
"setBackgroundHardcourt":function(d){return "მყარი საფარის ფონის დაყენება"},
"setBackgroundNight":function(d){return "ღამის ფონის დაყენება"},
"setBackgroundUnderwater":function(d){return "წყალქვეშა ფონის დაყენება"},
"setBackgroundCity":function(d){return "ქალაქის ფონის დაყენება"},
"setBackgroundDesert":function(d){return "უდაბნოს ფონის დაყენება"},
"setBackgroundRainbow":function(d){return "ცისარტყელას ფონის დაყენება"},
"setBackgroundSoccer":function(d){return "ფეხბურთის ფონის დაყენება"},
"setBackgroundSpace":function(d){return "კოსმოსის ფონის დაყენება"},
"setBackgroundTennis":function(d){return "ჩოგბურთის ფონის დაყენება"},
"setBackgroundWinter":function(d){return "ზამთრის ფონის დაყენება"},
"setBackgroundLeafy":function(d){return "ფოთლებიანი ფონის დაყენება"},
"setBackgroundGrassy":function(d){return "ბალახიანი ფონის დაყენება"},
"setBackgroundFlower":function(d){return "ყვავლისი ფონის დაყენება"},
"setBackgroundTile":function(d){return "ფილებიანი ფონის დაყენება"},
"setBackgroundIcy":function(d){return "ყინულიანი ფონის დაყენება"},
"setBackgroundSnowy":function(d){return "თოვლიანი ფონის დაყენება"},
"setBackgroundTooltip":function(d){return "აყენებს ფონის სურათს"},
"setEnemySpeed":function(d){return "მტრის სიჩქარის განსაზღვრა"},
"setPlayerSpeed":function(d){return "მოთამაშის სიჩქარის განსაზღვრა"},
"setScoreText":function(d){return "ქულის დაყენება"},
"setScoreTextTooltip":function(d){return "აყენებს ტექსტს ქულების ადგილზე გამოსაჩენად."},
"setSpriteEmotionAngry":function(d){return "გაბრაზებულ გუნებაზე"},
"setSpriteEmotionHappy":function(d){return "მხიარულ გუნებაზე"},
"setSpriteEmotionNormal":function(d){return "ნორმალურ გუნებაზე"},
"setSpriteEmotionRandom":function(d){return "შემთხვევით გუნებაზე"},
"setSpriteEmotionSad":function(d){return "სევდიან გუნებაზე"},
"setSpriteEmotionTooltip":function(d){return "განსაზღვრავს მსახიობის გუნებას"},
"setSpriteAlien":function(d){return "უცხოპლანეტელის სურათზე"},
"setSpriteBat":function(d){return "ღამურის სურათზე"},
"setSpriteBird":function(d){return "ჩიტის სურათზე"},
"setSpriteCat":function(d){return "კატის სურათზე"},
"setSpriteCaveBoy":function(d){return "გამოქვაბულის ბიჭის სურათზე"},
"setSpriteCaveGirl":function(d){return "გამოქვაბულის გოგოს(ჟასმინის) სურათზე"},
"setSpriteDinosaur":function(d){return "დინოზავრის სურათზე"},
"setSpriteDog":function(d){return "ძაღლის სურათზე"},
"setSpriteDragon":function(d){return "დრაკონის სურათზე"},
"setSpriteGhost":function(d){return "მოჩვენების სურათზე"},
"setSpriteHidden":function(d){return "დამალულ სურათზე"},
"setSpriteHideK1":function(d){return "დამალვა"},
"setSpriteAnna":function(d){return "ანას სურათზე"},
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
"size":function(d){return "ზომა"},
"setSprite":function(d){return "მინიჭება"},
"setSpriteN":function(d){return "მსახიობი "+studio_locale.v(d,"spriteIndex")+"-ს დაყენება"},
"soundCrunch":function(d){return "ხრაშუნი"},
"soundGoal1":function(d){return "მიზანი 1"},
"soundGoal2":function(d){return "მიზანი 2"},
"soundHit":function(d){return "დარტყმა"},
"soundLosePoint":function(d){return "ქულის დაკარგვა"},
"soundLosePoint2":function(d){return "2 ქულის დაკარგვა"},
"soundRetro":function(d){return "რეტრო"},
"soundRubber":function(d){return "რეზინი"},
"soundSlap":function(d){return "შემოტყაპუნება"},
"soundWinPoint":function(d){return "ქულის მოგება"},
"soundWinPoint2":function(d){return "2 ქულის მოგება"},
"soundWood":function(d){return "ხე"},
"speed":function(d){return "სიჩქარე"},
"startSetValue":function(d){return "დაწყება (ფუნქციის)"},
"startSetVars":function(d){return "თამაში_ცვლადები (სათაური, სუბტიტრი, ფონი, სამიზნე, საფრთხე, მოთამაშე)"},
"startSetFuncs":function(d){return "თამაში_ფუნქციები(განახლება-სამიზნე, განახლება-საფრთხე, განახლება-მოთამაშე, დაჯახება?, ეკრანზე?)"},
"stopSprite":function(d){return "შეჩერება"},
"stopSpriteN":function(d){return "პერსონაჟის შეჩერება "+studio_locale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "აჩერებს პერსონაჟის მოძრაობას."},
"throwSprite":function(d){return "სროლა"},
"throwSpriteN":function(d){return "მსახიობი "+studio_locale.v(d,"spriteIndex")+" ისვრის"},
"throwTooltip":function(d){return "ისვრის ყუმბარას კონკრეტული მსახიობისგან."},
"vanish":function(d){return "გაქრობა"},
"vanishActorN":function(d){return "მსახიობი "+studio_locale.v(d,"spriteIndex")+"-ის გაქრობა"},
"vanishTooltip":function(d){return "აქრობს მსახიობს."},
"waitFor":function(d){return "მოცდა"},
"waitSeconds":function(d){return "წამები"},
"waitForClick":function(d){return "კლიკისთვის მოცდა"},
"waitForRandom":function(d){return "შემთხვევითი დროით მოცდა"},
"waitForHalfSecond":function(d){return "ნახევარი წამით მოცდა"},
"waitFor1Second":function(d){return "1 წამით მოცდა"},
"waitFor2Seconds":function(d){return "2 წამით მოცდა"},
"waitFor5Seconds":function(d){return "5 წამით მოცდა"},
"waitFor10Seconds":function(d){return "10 წამით მოცდა"},
"waitParamsTooltip":function(d){return "იცდის გარკვეული რაოდენობის წამებით ან ნულის გამოყენებით სანამ ღილაკს არ დააკლიკებენ."},
"waitTooltip":function(d){return "იცდის გარკვეული რაოდენობის წამებით ან სანამ ღილაკს არ დააკლიკებენ."},
"whenArrowDown":function(d){return "ქვედა ისარი"},
"whenArrowLeft":function(d){return "მარცხენა ისარი"},
"whenArrowRight":function(d){return "მარჯვენა ისარი"},
"whenArrowUp":function(d){return "ზედა ისარი"},
"whenArrowTooltip":function(d){return "შეასრულე ქვემოთ მითითებული მოქმედებები როდესაც კონკრეტულ ისრიან ღილაკს დააწვებიან."},
"whenDown":function(d){return "როცა ქვემოთა ისარი"},
"whenDownTooltip":function(d){return "შესრულდეს ქვემოთ მოცემული მოქმედებები, როცა აჭერენ ქვემოთა ისარს."},
"whenGameStarts":function(d){return "როცა თამაში დაიწყება"},
"whenGameStartsTooltip":function(d){return "შეასრულე ქვემოთ მითითებული მოქმედებები როდესაც თამაში დაიწყება."},
"whenLeft":function(d){return "როცა მარცხენა ისარი"},
"whenLeftTooltip":function(d){return "შესრულდეს ქვემოთ მოცემული მოქმედებები, როცა აჭერენ მარცხენა ისარს."},
"whenRight":function(d){return "როცა მარჯვენა ისარი"},
"whenRightTooltip":function(d){return "შესრულდეს ქვემოთ მოცემული მოქმედებები, როცა აჭერენ მარჯვენა ისარს."},
"whenSpriteClicked":function(d){return "როცა მსახიობზე აკლიკებენ"},
"whenSpriteClickedN":function(d){return "როცა მსახიობ "+studio_locale.v(d,"spriteIndex")+"-ზე აკლიკებენ"},
"whenSpriteClickedTooltip":function(d){return "შეასრულე ქვემოთ მითითებული მოქმედებები როდესაც მსახიობზე დააკლიკებენ."},
"whenSpriteCollidedN":function(d){return "როცა მსახიობი "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "შეასრულე ქვემოთ მითითებულ მოქმედებები როდესაც პერსონაჟი შეეხება სხვა პერსონაჟს."},
"whenSpriteCollidedWith":function(d){return "ეხება"},
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
"whenUp":function(d){return "როცა ზემოთა ისარი"},
"whenUpTooltip":function(d){return "შესრულდეს ქვემოთ მოცემული მოქმედებები, როცა აჭერენ ზემოთა ისარს."},
"yes":function(d){return "დიახ"},
"itemItem1":function(d){return "Item1"},
"itemItem2":function(d){return "Item2"},
"itemItem3":function(d){return "Item3"},
"itemItem4":function(d){return "Item4"},
"setBackgroundBackground1":function(d){return "set background1 background"},
"setBackgroundBackground2":function(d){return "set background2 background"},
"setBackgroundBackground3":function(d){return "set background3 background"},
"setSpriteCharacter1":function(d){return "to item1"},
"setSpriteCharacter2":function(d){return "to item2"}};