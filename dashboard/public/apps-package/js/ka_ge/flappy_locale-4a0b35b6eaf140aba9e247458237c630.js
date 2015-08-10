var flappy_locale = {lc:{"ar":function(n){
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
v:function(d,k){flappy_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){flappy_locale.c(d,k);return d[k] in p?p[d[k]]:(k=flappy_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){flappy_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).flappy_locale = {
"continue":function(d){return "გაგრძელება"},
"doCode":function(d){return "შესრულება"},
"elseCode":function(d){return "სხვა შემთხვევაში"},
"endGame":function(d){return "თამაშის დასრულება"},
"endGameTooltip":function(d){return "ასრულებს თამაშს."},
"finalLevel":function(d){return "გილოცავ! შენ ამოხსენი უკანასკნელი თავსატეხი."},
"flap":function(d){return "ფრთების ქნევა"},
"flapRandom":function(d){return "შემთხვევითი სიძლიერით აფრენა"},
"flapVerySmall":function(d){return "ძალიან მცირე სიძლიერით აფრენა"},
"flapSmall":function(d){return "მცირე სიძლიერით აფრენა"},
"flapNormal":function(d){return "ნორმალური სიძლიერით აფრენა"},
"flapLarge":function(d){return "დიდი სიძლიერით აფრენა"},
"flapVeryLarge":function(d){return "ძალიან დიდი სიძლიერით აფრენა"},
"flapTooltip":function(d){return "ზემოთ აფრენა."},
"flappySpecificFail":function(d){return "შენი კოდი კარგად გამოიყურება - ჩიტი ყოველ დაჭერაზე ფრთებს მოიქნევს. მაგრამ საჭიროა ბევრჯერ დაჭერა რომ ჩიტი მიზანთან მიფრინდეს."},
"incrementPlayerScore":function(d){return "ქულის აღება"},
"incrementPlayerScoreTooltip":function(d){return "Add one to the current player score."},
"nextLevel":function(d){return "გილოცავ! შენ დაასრულე ეს თავსატეხი."},
"no":function(d){return "არა"},
"numBlocksNeeded":function(d){return "ამ თავსატეხის ამოსახსნელად საჭიროა %1 ბლოკი."},
"playSoundRandom":function(d){return "შემთხვევითი ხმის ჩართვა"},
"playSoundBounce":function(d){return "ახტომის ხმის ჩართვა"},
"playSoundCrunch":function(d){return "play crunch sound"},
"playSoundDie":function(d){return "სევდიანი ხმის ჩართვა"},
"playSoundHit":function(d){return "დანგრევის ხმის ჩართვა"},
"playSoundPoint":function(d){return "ქულის ხმის ჩართვა"},
"playSoundSwoosh":function(d){return "ჩაქროლების ხმის ჩართვა"},
"playSoundWing":function(d){return "ფრთის ხმის ჩართვა"},
"playSoundJet":function(d){return "რეაქტიული ძრავის ხმის ჩართვა"},
"playSoundCrash":function(d){return "დაჯახების ხმის ჩართვა"},
"playSoundJingle":function(d){return "ჟღარუნის ხმის ჩართვა"},
"playSoundSplash":function(d){return "წყლის შხაპუნის ხმის ჩართვა"},
"playSoundLaser":function(d){return "ლაზერის ხმის ჩართვა"},
"playSoundTooltip":function(d){return "Play the chosen sound."},
"reinfFeedbackMsg":function(d){return "შეგიძლია დააწვე \"სცადე ხელახლა\" ღილაკს და განაგრძო შენი თამაში."},
"scoreText":function(d){return "ქულა: "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "სცენის დაყენება"},
"setBackgroundRandom":function(d){return "შემთხვევითი სცენის დაყენება"},
"setBackgroundFlappy":function(d){return "სცენის დაყენება \"ქალაქი (დღე)\""},
"setBackgroundNight":function(d){return "სცენის დაყენება \"ქალაქი (ღამე)\""},
"setBackgroundSciFi":function(d){return "სცენის დაყენება \"Sci-Fi\""},
"setBackgroundUnderwater":function(d){return "სცენის დაყენება \"წყალქვეშ\""},
"setBackgroundCave":function(d){return "სცენის დაყენება \"გამოქვაბული\""},
"setBackgroundSanta":function(d){return "სცენის დაყენება \"სანტა\""},
"setBackgroundTooltip":function(d){return "აყენებს ფონის სურათს"},
"setGapRandom":function(d){return "აყენებს შემთხვევით ნაპრალს"},
"setGapVerySmall":function(d){return "აყენებს ძალიან მცირე ნაპრალს"},
"setGapSmall":function(d){return "აყენებს ძალიან პატარა ნაპრალს"},
"setGapNormal":function(d){return "აყენებს ნორმალური ზომის ნაპრალს"},
"setGapLarge":function(d){return "აყენებს დიდ ნაპრალს"},
"setGapVeryLarge":function(d){return "აყენებს ძალიან დიდ ნაპრალს"},
"setGapHeightTooltip":function(d){return "წინააღმდეგობაში აყენებს ვერტიკალურ ნაპრალს"},
"setGravityRandom":function(d){return "შემთხვევითი გრავიტაციის დაყენება"},
"setGravityVeryLow":function(d){return "ძალიან დაბალი გრავიტაციის დაყენება"},
"setGravityLow":function(d){return "დაბალი გრავიტაციის დაყენება"},
"setGravityNormal":function(d){return "ნორმალური გრავიტაციის დაყენება"},
"setGravityHigh":function(d){return "მაღალი გრავიტაციის დაყენება"},
"setGravityVeryHigh":function(d){return "ძალიან მაღალი გრავიტაციის დაყენება"},
"setGravityTooltip":function(d){return "აყენებს გრავიტაციის დონეებს"},
"setGround":function(d){return "ზედაპირის დაყენება"},
"setGroundRandom":function(d){return "ზედაპირის შემთხვევითად დაყენება"},
"setGroundFlappy":function(d){return "ზედაპირის დაყენება \"მიწა\""},
"setGroundSciFi":function(d){return "ზედაპირის დაყენება \"Sci-Fi\""},
"setGroundUnderwater":function(d){return "ზედაპირის დაყენება \"წყალქვეშ\""},
"setGroundCave":function(d){return "ზედაპირის დაყენება \"გამოქვაბული\""},
"setGroundSanta":function(d){return "ზედაპირის დაყენება \"სანტა\""},
"setGroundLava":function(d){return "ზედაპირის დაყენება \"ლავა\""},
"setGroundTooltip":function(d){return "აყენებს ზედაპირის სურათს"},
"setObstacle":function(d){return "წინააღმდეგობის დაყენება"},
"setObstacleRandom":function(d){return "შემთხვევითი წინააღმდეგობის დაყენება"},
"setObstacleFlappy":function(d){return "წინააღმდეგობის დაყენება \"მილი\""},
"setObstacleSciFi":function(d){return "წინააღმდეგობის დაყენება \"Sci-Fi\""},
"setObstacleUnderwater":function(d){return "წინააღმდეგობis დაყენება \"მცენარე\""},
"setObstacleCave":function(d){return "წინააღმდეგობის დაყენება \"გამოქვაბული\""},
"setObstacleSanta":function(d){return "წინააღმდეგობის დაყენება \"საკვამური\""},
"setObstacleLaser":function(d){return "წინააღმდეგობის შექმნა \"ლაზერი\""},
"setObstacleTooltip":function(d){return "წინააღმდეგობის სურათის შექმნა"},
"setPlayer":function(d){return "მოთამაშის შექმნა"},
"setPlayerRandom":function(d){return "შემთხვევითი მოთამაშის შექმნა"},
"setPlayerFlappy":function(d){return "მოთამაშის შექმნა \"ყვითელი ჩიტი\""},
"setPlayerRedBird":function(d){return "მოთამაშის შექმნა \"წითელი ჩიტი\""},
"setPlayerSciFi":function(d){return "მოთამაშის შექმნა \"კოსმოსური ხომალდი\""},
"setPlayerUnderwater":function(d){return "მოთამაშის შექმნა \"თევზი\""},
"setPlayerCave":function(d){return "მოთამაშის შექმნა \"ღამურა\""},
"setPlayerSanta":function(d){return "მოთამაშის შექმნა \"სანტა"},
"setPlayerShark":function(d){return "მოთამაშის შექმნა \"ზვიგენი\""},
"setPlayerEaster":function(d){return "მოთამაშის შექმნა \"სააღდგომო კურდღელი\""},
"setPlayerBatman":function(d){return "მოთამაშის შექმნა \"Batman\""},
"setPlayerSubmarine":function(d){return "მოთამაშის შექმნა \"წყალქვეშა ნავი\""},
"setPlayerUnicorn":function(d){return "მოთამაშის შექმნა Unicorn"},
"setPlayerFairy":function(d){return "მოთამაშის შექმნა \"ფერია\""},
"setPlayerSuperman":function(d){return "მოთამაშის შექმნა Flappyman"},
"setPlayerTurkey":function(d){return "მოთამაშის შექმნა \"ინდაური\""},
"setPlayerTooltip":function(d){return "მოთამაშის სურათის დაყენება"},
"setScore":function(d){return "ქულის დაყენება"},
"setScoreTooltip":function(d){return "მოთამაშის ქულის დაყენება"},
"setSpeed":function(d){return "სისწრაფის დაყენება"},
"setSpeedTooltip":function(d){return "აყენებს დონის სისწრაფეს"},
"shareFlappyTwitter":function(d){return "ნახე ჩემი გაკეთებული Flappy თამაში. მე თვითონ დავწერე @codeorg-ის მეშვეობით"},
"shareGame":function(d){return "გააზიარე შენი თამაში:"},
"soundRandom":function(d){return "შემთხვევითი"},
"soundBounce":function(d){return "არეკვლა"},
"soundCrunch":function(d){return "ხრაშუნი"},
"soundDie":function(d){return "სევდა"},
"soundHit":function(d){return "დანგრევა"},
"soundPoint":function(d){return "ქულა"},
"soundSwoosh":function(d){return "ჩაქროლება"},
"soundWing":function(d){return "ფრთა"},
"soundJet":function(d){return "რეაქტიული ძრავა"},
"soundCrash":function(d){return "დაჯახება"},
"soundJingle":function(d){return "ჟღარუნი"},
"soundSplash":function(d){return "შხაპუნი"},
"soundLaser":function(d){return "ლაზერი"},
"speedRandom":function(d){return "შემთხვევითი სიჩქარის დაყენება"},
"speedVerySlow":function(d){return "ძალიან დაბალი სიჩქარის დაყენება"},
"speedSlow":function(d){return "დაბალი სიჩქარის დაყენება"},
"speedNormal":function(d){return "ნორმალური სიჩქარის დაყენება"},
"speedFast":function(d){return "მაღალი სიჩქარის დაყენება"},
"speedVeryFast":function(d){return "ძალიან მაღალი სიჩქარის დაყენება"},
"whenClick":function(d){return "მაუსზე დაჭერისას"},
"whenClickTooltip":function(d){return "შეასრულე მოქმედებები ქვემოთ, როცა მოხდება დაჭერის event."},
"whenCollideGround":function(d){return "მიწაზე დაცემისას"},
"whenCollideGroundTooltip":function(d){return "შეასრულე მოქმედებები ქვემოთ როცა Flappy მიწაზე დაეცემა."},
"whenCollideObstacle":function(d){return "წინააღმდეგობასთან შეჯახებისას"},
"whenCollideObstacleTooltip":function(d){return "შეასრულე მოქმედებები ქვემოთ, როცა Flappy წინააღმდეგობას დაეჯახება."},
"whenEnterObstacle":function(d){return "წინააღმდეგობას გაცდენისას"},
"whenEnterObstacleTooltip":function(d){return "შეასრულე მოქმედებები ქვემოთ როცა Flappy წინააღმდეგობას გაივლის."},
"whenRunButtonClick":function(d){return "თამაშის დაწყებისას"},
"whenRunButtonClickTooltip":function(d){return "შეასრულე მოქმედებები ქვემოთ როცა თამაში დაიწყება."},
"yes":function(d){return "დიახ"}};