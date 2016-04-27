var maze_locale = {lc:{"ar":function(n){
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
v:function(d,k){maze_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){maze_locale.c(d,k);return d[k] in p?p[d[k]]:(k=maze_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){maze_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).maze_locale = {
"atHoneycomb":function(d){return "ფიჭაში"},
"atFlower":function(d){return "ყვავილზე"},
"avoidCowAndRemove":function(d){return "მოერიდე ძროხას და წაშალე 1"},
"continue":function(d){return "გაგრძელება"},
"dig":function(d){return "წაშალე 1"},
"digTooltip":function(d){return "1 ერთეული მიწის მოშორება"},
"dirE":function(d){return "E"},
"dirN":function(d){return "N"},
"dirS":function(d){return "S"},
"dirW":function(d){return "W"},
"doCode":function(d){return "შესრულება"},
"elseCode":function(d){return "სხვა შემთხვევაში"},
"fill":function(d){return "შეავსე 1"},
"fillN":function(d){return maze_locale.v(d,"shovelfuls")+"-ის შევსება"},
"fillStack":function(d){return "ორმოს "+maze_locale.v(d,"shovelfuls")+" რიგის შევსება"},
"fillSquare":function(d){return "კვადრატის შევსება"},
"fillTooltip":function(d){return "ერთი ერთეული მიწის მოთავსება"},
"finalLevel":function(d){return "გილოცავთ! თქვენ ამოხსენით უკანასკნელი თავსატეხი."},
"flowerEmptyError":function(d){return "ყვავილს, რომელზეც ახლა ხართ, ნექტარი აღარ აქვს."},
"get":function(d){return "ამოღება"},
"heightParameter":function(d){return "სიმაღლე"},
"holePresent":function(d){return "აქ ორმოა"},
"honey":function(d){return "თაფლის გაკეთება"},
"honeyAvailable":function(d){return "თაფლი"},
"honeyTooltip":function(d){return "თაფლის გაკეთება ნექტარისგან"},
"honeycombFullError":function(d){return "ამ ფიჭაში თაფლისთვის მეტი ადგილი არ არის."},
"ifCode":function(d){return "თუ"},
"ifInRepeatError":function(d){return "თქენ გჭირდებათ \"თუ\" ბლოკი \"გამეორების\" ბლოკში. თუ რამე პრობლემა გაქვთ, ხელახლა სცადეთ წინა დონე და ნახეთ, როგორ მუშაობს ამონახსნი."},
"ifPathAhead":function(d){return "თუ წინ გზაა"},
"ifTooltip":function(d){return "თუ განსაზღვრული მიმართულებით გზა არის, შეასრულეთ გარკვეული მოქმედებები."},
"ifelseTooltip":function(d){return "თუ განსაზღვრული მიმართულებით არის გზა, შეასრულეთ მოქმედებების პირველი ბლოკი. სხვა შემთხვევაში, შეასრულეთ მოქმედებების მეორე ბლოკი."},
"ifFlowerTooltip":function(d){return "თუ განსაზღვრული მიმართულებით არის ყვავილი/ფიჭა, შეასრულეთ გარკვეული მოქმედებები."},
"ifOnlyFlowerTooltip":function(d){return "თუ განსაზღვრული მიმართულებით არის ყვავილი, შეასრულეთ მოქმედებები."},
"ifelseFlowerTooltip":function(d){return "თუ განსაზღვრული მიმართულებით არის ყვავილი/ფიჭა, შეასრულეთ მოქმედებების პირველი ბლოკი. სხვა შემთხვევაში, შეასრულეთ მოქმედებების მეორე ბლოკი."},
"insufficientHoney":function(d){return "საჭიროა სწორი რაოდენობის თაფლის გაკეთება."},
"insufficientNectar":function(d){return "საჭიროა შეაგროვოთ სწორი რაოდენობის ნექტარი."},
"make":function(d){return "გაკეთება"},
"moveBackward":function(d){return "უკან გადაადგილება"},
"moveEastTooltip":function(d){return "გადამაადგილეთ ერთი უჯრით აღმოსავლეთით."},
"moveForward":function(d){return "წინ გადაადგილება"},
"moveForwardTooltip":function(d){return "გადამაადგილეთ ერთი უჯრით წინ."},
"moveNorthTooltip":function(d){return "გადამაადგილეთ ერთი უჯრით ჩრდილოეთით."},
"moveSouthTooltip":function(d){return "გადამაადგილეთ ერთი უჯრით სამხრეთით."},
"moveTooltip":function(d){return "გადამაადგილე ერთი უჯრით წინ/უკან"},
"moveWestTooltip":function(d){return "გადამაადგილეთ ერთი უჯრით დასავლეთით."},
"nectar":function(d){return "ნექტარის აღება"},
"nectarRemaining":function(d){return "ნექტარი"},
"nectarTooltip":function(d){return "ნექტარის აღება ყვავილიდან"},
"nextLevel":function(d){return "გილოცავთ! თქვენ დაასრულეთ ეს თავსატეხი."},
"no":function(d){return "არა"},
"noPathAhead":function(d){return "გზა დაბლოკილია"},
"noPathLeft":function(d){return "მარცხნივ გზა არ არის"},
"noPathRight":function(d){return "მარჯვნივ გზა არ არის"},
"notAtFlowerError":function(d){return "ნექტარის აღება მხოლოდ ყვავილიდან შეგიძლიათ."},
"notAtHoneycombError":function(d){return "თაფლის გაკეთება მხოლოდ ფიჭაში შეგიძლიათ."},
"numBlocksNeeded":function(d){return "ამ თავსატეხის ამოსახსნელად საჭიროა %1 ბლოკი."},
"pathAhead":function(d){return "წინ გზაა"},
"pathLeft":function(d){return "თუ გზა მიდის მარცხნივ"},
"pathRight":function(d){return "თუ გზა მიდის მარჯვნივ"},
"pilePresent":function(d){return "აქ არის გროვა"},
"putdownTower":function(d){return "კოშკის დადგმა"},
"removeAndAvoidTheCow":function(d){return "წაშალეთ ერთი და აარიდეთ თავი ძროხას"},
"removeN":function(d){return "წაშალეთ "+maze_locale.v(d,"shovelfuls")},
"removePile":function(d){return "გროვის მოშორება"},
"removeStack":function(d){return maze_locale.v(d,"shovelfuls")+" გროვის რიგის წაშლა"},
"removeSquare":function(d){return "კვადრატის წაშლა"},
"repeatCarefullyError":function(d){return "ამის ამოსახსნელად კარგად დაუფიქრდით ორი მოქმედების და ერთი მობრუნების კომბინაციას, რომელიც გამეორების ბლოკში უნდა ჩასვათ. არაუშავს, თუ ბოლოში დამატებითი მოტრიალება დაგჭირდათ."},
"repeatUntil":function(d){return "გაიმეორე სანამ"},
"repeatUntilBlocked":function(d){return "სანამ წინ გზაა"},
"repeatUntilFinish":function(d){return "დასრულებამდე გამეორება"},
"step":function(d){return "ნაბიჯი"},
"totalHoney":function(d){return "თაფლის სრული რაოდენობა"},
"totalNectar":function(d){return "ნექტარის სრული რაოდენობა"},
"turnLeft":function(d){return "მარცხნივ მობრუნება"},
"turnRight":function(d){return "მარჯვნივ მობრუნება"},
"turnTooltip":function(d){return "მაბრუნებს მარჯვნივ ან მარცხნივ 90 გრადუსით."},
"uncheckedCloudError":function(d){return "შეამოწმეთ ყველა ღრუბელი და ნახეთ, არის თუ არა ყვავილები ან ფიჭები."},
"uncheckedPurpleError":function(d){return "შეამოწმეთ ყველა იასამნისფერი ყვავილი და ნახეთ, აქვთ თუ არა მათ ნექტარი"},
"whileMsg":function(d){return "სანამ"},
"whileTooltip":function(d){return "გაიმეორეთ ჩაკეტილი მოქმედება უკანასკნელ წერტილზე მისვლამდე."},
"word":function(d){return "იპოვეთ სიტყვა"},
"yes":function(d){return "დიახ"},
"youSpelled":function(d){return "თქვენ შეიყვანეთ"}};