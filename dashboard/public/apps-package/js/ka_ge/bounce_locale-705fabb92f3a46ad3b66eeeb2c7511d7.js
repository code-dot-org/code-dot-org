var bounce_locale = {lc:{"ar":function(n){
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
v:function(d,k){bounce_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){bounce_locale.c(d,k);return d[k] in p?p[d[k]]:(k=bounce_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){bounce_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).bounce_locale = {
"bounceBall":function(d){return "ბურთის ასხლეტა"},
"bounceBallTooltip":function(d){return "ობიექტიდან ბურთის ასხლეტა."},
"continue":function(d){return "გაგრძელება"},
"dirE":function(d){return "E"},
"dirN":function(d){return "N"},
"dirS":function(d){return "S"},
"dirW":function(d){return "W"},
"doCode":function(d){return "შესრულება"},
"elseCode":function(d){return "სხვა შემთხვევაში"},
"finalLevel":function(d){return "გილოცავ! შენ ამოხსენი უკანასკნელი თავსატეხი."},
"heightParameter":function(d){return "სიმაღლე"},
"ifCode":function(d){return "თუ"},
"ifPathAhead":function(d){return "თუ წინ გზაა"},
"ifTooltip":function(d){return "თუ განსაზღვრული მიმართულებით გზა არის, შეასრულე გარკვეული მოქმედებები."},
"ifelseTooltip":function(d){return "თუ განსაზღვრული მიმართულებით არის გზა, შეასრულე მოქმედებების პირველი ბლოკი. სხვა შემთხვევაში, შეასრულე მოქმედებების მეორე ბლოკი."},
"incrementOpponentScore":function(d){return "ქულა ერგო მოწინააღმდეგეს"},
"incrementOpponentScoreTooltip":function(d){return "დაუმატე ერთი ქულა მოწინააღმდეგის მიმდინარე ანგარიშს."},
"incrementPlayerScore":function(d){return "დაგროვილი ქულები"},
"incrementPlayerScoreTooltip":function(d){return "დაუმატე ერთი მიმდინარე მოთამაშის ანგარიშს."},
"isWall":function(d){return "ეს არის კედელი"},
"isWallTooltip":function(d){return "აბრუნებს ჭეშმარიტ მნიშვნელობას თუ იქ არის კედელი"},
"launchBall":function(d){return "ახალი ბურთის გაშვება"},
"launchBallTooltip":function(d){return "ბურთის თამაშში გაშვება."},
"makeYourOwn":function(d){return "შექმენი შენი საკუთარი Bounce თამაში"},
"moveDown":function(d){return "გადაადგილება ქვემოთ"},
"moveDownTooltip":function(d){return "პლატფორმის ქვემოთ გადაადგილება."},
"moveForward":function(d){return "წინ გადაადგილება"},
"moveForwardTooltip":function(d){return "გადამაადგილე ერთი უჯრით წინ."},
"moveLeft":function(d){return "გადაადგილება მარცხნივ"},
"moveLeftTooltip":function(d){return "პლატფორმის მარცხნივ გადაადგილება."},
"moveRight":function(d){return "მარჯვნივ გადაადგილება"},
"moveRightTooltip":function(d){return "პლატფორმის მარჯვნივ გადაადგილება."},
"moveUp":function(d){return "გადაადგილება ზემოთ"},
"moveUpTooltip":function(d){return "პლატფორმის ზემოთ გადაადგილება."},
"nextLevel":function(d){return "გილოცავ! შენ დაასრულე ეს თავსატეხი."},
"no":function(d){return "არა"},
"noPathAhead":function(d){return "გზა დაბლოკილია"},
"noPathLeft":function(d){return "მარცხნივ გზა არ არის"},
"noPathRight":function(d){return "მარჯვნივ გზა არ არის"},
"numBlocksNeeded":function(d){return "ამ თავსატეხის ამოსახსნელად საჭიროა %1 ბლოკი."},
"pathAhead":function(d){return "წინ გზაა"},
"pathLeft":function(d){return "თუ გზა მიდის მარცხნივ"},
"pathRight":function(d){return "თუ გზა მიდის მარჯვნივ"},
"pilePresent":function(d){return "აქ არის გროვა"},
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
"putdownTower":function(d){return "კოშკის დადგმა"},
"reinfFeedbackMsg":function(d){return "შეგიძლია დააწვე \"სცადე ხელახლა\" ღილაკს და განაგრძო შენი თამაში."},
"removeSquare":function(d){return "კვადრატის წაშლა"},
"repeatUntil":function(d){return "გაიმეორე სანამ"},
"repeatUntilBlocked":function(d){return "სანამ წინ გზაა"},
"repeatUntilFinish":function(d){return "დასრულებამდე გამეორება"},
"scoreText":function(d){return "ანგარიში: "+bounce_locale.v(d,"playerScore")+":"+bounce_locale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "შემთხვევითი სცენის დაყენება"},
"setBackgroundHardcourt":function(d){return "დააყენე სცენა მყარი ზედაპირით"},
"setBackgroundRetro":function(d){return "რეტრო სცენის დაყენება"},
"setBackgroundTooltip":function(d){return "აყენებს ფონის სურათს"},
"setBallRandom":function(d){return "შემთხვევითი ბურთის გაშვება"},
"setBallHardcourt":function(d){return "მყარი ბურთის გაშვება"},
"setBallRetro":function(d){return "რეტრო ბურთის გაშვება"},
"setBallTooltip":function(d){return "აყენებს ბურთის სურათს"},
"setBallSpeedRandom":function(d){return "ბურთისთვის შემთხვევითი სიჩქარის მინიჭება"},
"setBallSpeedVerySlow":function(d){return "ბურთისთვის ძალიან დაბალი სიჩქარის მინიჭება"},
"setBallSpeedSlow":function(d){return "ბურთისთვის დაბალი სიჩქარის მინიჭება"},
"setBallSpeedNormal":function(d){return "ბურთისთვის ნორმალური სიჩქარის მინიჭება"},
"setBallSpeedFast":function(d){return "ბურთისთვის მაღალი სიჩქარის მინიჭება"},
"setBallSpeedVeryFast":function(d){return "ბურთისთვის ძალიან მაღალი სიჩქარის მინიჭება"},
"setBallSpeedTooltip":function(d){return "ანიჭებს ბურთს გარკვეულ სიჩქარეს"},
"setPaddleRandom":function(d){return "შემთხვევითი პლატფორმის გაშვება"},
"setPaddleHardcourt":function(d){return "მყარზედაპირიანი პლატფორმის გაშვება"},
"setPaddleRetro":function(d){return "რეტრო პლატფორმის გაშვება"},
"setPaddleTooltip":function(d){return "აყენებს პლატფორმის სურათს"},
"setPaddleSpeedRandom":function(d){return "პლატფორმისთვის შემთხვევითი სიჩქარის მინიჭება"},
"setPaddleSpeedVerySlow":function(d){return "პლატფორმისთვის ძალიან დაბალი სიჩქარის მინიჭება"},
"setPaddleSpeedSlow":function(d){return "პლატფორმისთვის დაბალი სიჩქარის მინიჭება"},
"setPaddleSpeedNormal":function(d){return "პლატფორმისთვის ნორმალური სიჩქარის მინიჭება"},
"setPaddleSpeedFast":function(d){return "პლატფორმისთვის მაღალი სიჩქარის მინიჭება"},
"setPaddleSpeedVeryFast":function(d){return "პლატფორმისთვის ძალიან მაღალი სიჩქარის მინიჭება"},
"setPaddleSpeedTooltip":function(d){return "აყენებს პლატფორმის სიჩქარეს"},
"shareBounceTwitter":function(d){return "ნახე ჩემი გაკეთებული Bounce თამაში. მე თვითონ დავწერე @codeorg-ის მეშვეობით"},
"shareGame":function(d){return "გააზიარე შენი თამაში:"},
"turnLeft":function(d){return "მარცხნივ მობრუნება"},
"turnRight":function(d){return "მარჯვნივ მობრუნება"},
"turnTooltip":function(d){return "მაბრუნებს მარჯვნივ ან მარცხნივ 90 გრადუსით."},
"whenBallInGoal":function(d){return "როცა ბურთი მიზანს ხვდება"},
"whenBallInGoalTooltip":function(d){return "შესრულდეს ქვემოთ მოცემული მოქმედებები, როცა ბურთი ხვდება მიზანს."},
"whenBallMissesPaddle":function(d){return "როცა ბურთი ცდება პლატფორმას"},
"whenBallMissesPaddleTooltip":function(d){return "შესრულდეს ქვემოთ მოცემული მოქმედებები, როცა ბურთი ცდება პლატფორმას."},
"whenDown":function(d){return "როცა ქვემოთა ისარი"},
"whenDownTooltip":function(d){return "შესრულდეს ქვემოთ მოცემული მოქმედებები, როცა აჭერენ ქვემოთა ისარს."},
"whenGameStarts":function(d){return "თამაშის დაწყებისას"},
"whenGameStartsTooltip":function(d){return "შეასრულე მოქმედებები ქვემოთ როცა თამაში დაიწყება."},
"whenLeft":function(d){return "როცა მარცხენა ისარი"},
"whenLeftTooltip":function(d){return "შესრულდეს ქვემოთ მოცემული მოქმედებები, როცა აჭერენ მარცხენა ისარს."},
"whenPaddleCollided":function(d){return "როცა ბურთი ხვდება პლატფორმას"},
"whenPaddleCollidedTooltip":function(d){return "შესრულდეს ქვემოთ მოცემული მოქმედებები, როცა ბურთი ეჯახება პლატფორმას."},
"whenRight":function(d){return "როცა მარჯვენა ისარი"},
"whenRightTooltip":function(d){return "შესრულდეს ქვემოთ მოცემული მოქმედებები, როცა აჭერენ მარჯვენა ისარს."},
"whenUp":function(d){return "როცა ზემოთა ისარი"},
"whenUpTooltip":function(d){return "შესრულდეს ქვემოთ მოცემული მოქმედებები, როცა აჭერენ ზემოთა ისარს."},
"whenWallCollided":function(d){return "როცა ბურთი ხვდება კედელს"},
"whenWallCollidedTooltip":function(d){return "შესრულდეს ქვემოთ მოცემული მოქმედებები, როცა ბურთი ეჯახება კედელს."},
"whileMsg":function(d){return "სანამ"},
"whileTooltip":function(d){return "გაიმეორე ჩაკეტილი მოქმედება უკანასკნელ წერტილამდე მისვლამდე."},
"yes":function(d){return "დიახ"}};