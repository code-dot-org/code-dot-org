var craft_locale = {lc:{"ar":function(n){
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
v:function(d,k){craft_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){craft_locale.c(d,k);return d[k] in p?p[d[k]]:(k=craft_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){craft_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).craft_locale = {
"blockDestroyBlock":function(d){return "ბლოკის განადგურება"},
"blockIf":function(d){return "თუ"},
"blockIfLavaAhead":function(d){return "თუ წინ არის ლავა"},
"blockMoveForward":function(d){return "წინ გადაადგილება"},
"blockPlaceTorch":function(d){return "ჩირაღდნის დაყენება"},
"blockPlaceXAheadAhead":function(d){return "წინ"},
"blockPlaceXAheadPlace":function(d){return "დააყენე ან დადე"},
"blockPlaceXPlace":function(d){return "დააყენე ან დადე"},
"blockPlantCrop":function(d){return "მცენარის გასხვლა"},
"blockShear":function(d){return "გაკრეჭა"},
"blockTillSoil":function(d){return "ნიადაგამდე"},
"blockTurnLeft":function(d){return "მარცხნივ მობრუნება"},
"blockTurnRight":function(d){return "მარჯვნივ მობრუნება"},
"blockTypeBedrock":function(d){return "ქვენაფენი ქანი"},
"blockTypeBricks":function(d){return "აგურები"},
"blockTypeClay":function(d){return "თიხა"},
"blockTypeClayHardened":function(d){return "გამომწვარი თიხა"},
"blockTypeCobblestone":function(d){return "რიყის ქვა"},
"blockTypeDirt":function(d){return "ჭუჭყი"},
"blockTypeDirtCoarse":function(d){return "მსხვილი ჭუჭყი"},
"blockTypeEmpty":function(d){return "ცარიელი"},
"blockTypeFarmlandWet":function(d){return "მდელო"},
"blockTypeGlass":function(d){return "მინა"},
"blockTypeGrass":function(d){return "ბალახი"},
"blockTypeGravel":function(d){return "ხრეში"},
"blockTypeLava":function(d){return "ლავა"},
"blockTypeLogAcacia":function(d){return "აკაციის მორი"},
"blockTypeLogBirch":function(d){return "არყის მორი"},
"blockTypeLogJungle":function(d){return "ჯუნგლის ხის მორი"},
"blockTypeLogOak":function(d){return "მუხის მორი"},
"blockTypeLogSpruce":function(d){return "ნაძვის მორი"},
"blockTypeOreCoal":function(d){return "ნახშირის მადანი"},
"blockTypeOreDiamond":function(d){return "ალმასის საბადო"},
"blockTypeOreEmerald":function(d){return "ზურმუხტის საბადო"},
"blockTypeOreGold":function(d){return "ოქროს საბადო"},
"blockTypeOreIron":function(d){return "რკინის საბადო"},
"blockTypeOreLapis":function(d){return "ლილაქვას საბადო"},
"blockTypeOreRedstone":function(d){return "წითელი ქვის საბადო"},
"blockTypePlanksAcacia":function(d){return "აკაციის ფიცრები"},
"blockTypePlanksBirch":function(d){return "არყის ხის ფიცრები"},
"blockTypePlanksJungle":function(d){return "ჯუგლის ხის ფიცრები"},
"blockTypePlanksOak":function(d){return "მუხის ფიცრები"},
"blockTypePlanksSpruce":function(d){return "ნაძვის ფიცრები"},
"blockTypeRail":function(d){return "რელსი"},
"blockTypeSand":function(d){return "ქვიშა"},
"blockTypeSandstone":function(d){return "ქვიშაქვა"},
"blockTypeStone":function(d){return "ქვა"},
"blockTypeTnt":function(d){return "ტროტილი"},
"blockTypeTree":function(d){return "ხე"},
"blockTypeWater":function(d){return "წყალი"},
"blockTypeWool":function(d){return "მატყლი"},
"blockWhileXAheadAhead":function(d){return "წინ"},
"blockWhileXAheadDo":function(d){return "შესრულება"},
"blockWhileXAheadWhile":function(d){return "სანამ"},
"generatedCodeDescription":function(d){return "ამ თავსატეხში ბლოკების გადატანითა და განთავსებით თქვენ შექმენით ინსტრუქციების ნაკრები კომპიუტერულ ენაზე Javascript. ეს კოდი ეუბნება კომპიუტერს, თუ რა უნდა აჩვენოს ეკრანზე. ყველაფერი, რასაც ხედავთ და აკეთებთ მაინკრაფტში ასევე იწყება კომპიუტერული კოდის რამდენიმე ხაზით - აი, ასეთით."},
"houseSelectChooseFloorPlan":function(d){return "აირჩიეთ იატაკის გეგმა თქვენი სახლისთვის."},
"houseSelectEasy":function(d){return "მარტივი"},
"houseSelectHard":function(d){return "რთული"},
"houseSelectLetsBuild":function(d){return "ავაშენოთ სახლი."},
"houseSelectMedium":function(d){return "საშუალო"},
"keepPlayingButton":function(d){return "თამაშის გაგრძელება"},
"level10FailureMessage":function(d){return "გადახურეთ ლავა, რომ შეძლოთ მისი გადაჭრა, შემდეგ კი მოიპოვეთ ორი რკინის ბლოკი მეორე მხარეს."},
"level11FailureMessage":function(d){return "თუ წინ არის ლავა, არ დაგავიწყდეთ წინ რიყის ქვის დაწყობა. ეს მოგცემთ საშუალებას უსაფრთხოდ დაამუშავოთ რესურსები."},
"level12FailureMessage":function(d){return "აუცილებლად მოიპოვეთ 3 წითელი ქვის ბლოკი. ამისთვის დაგჭირდებათი ის, რაც ისწავლეთ სახლის შენების პროცესში და \"თუ\" დებულებების გამოყენება - იმისთვის, რომ ლავაში არ ჩავარდეთ."},
"level13FailureMessage":function(d){return "ჭუჭყიან გზაზე განათავსეთ \"რელსები\" თქვენი კარიდან რუკის კიდემდე."},
"level1FailureMessage":function(d){return "ცხვართან მისასვლელად უნდა გამოიყენოთ ბრძანებები."},
"level1TooFewBlocksMessage":function(d){return "სცადეთ ცხვართად მისასვლელად მეტი ბრძანების გამოყენება."},
"level2FailureMessage":function(d){return "ხის მოსაჭრელად, მიუახლოვდით მის ტანს და გამოიყენეთ ბრძანება \"ბლოკის განადგურება\"."},
"level2TooFewBlocksMessage":function(d){return "სცადეთ მეტი ბრძანება გამოიყენოთ ხის მოსაჭრელად. მიუახლოვდით ხის ტანს და გამოიყენეთ ბრძანება \"ბლოკის განადგურება\"."},
"level3FailureMessage":function(d){return "ცხვრის მატყლის შესაგროვებლად მიდით თითოეულ ცხვართან და გამოიყენეთ ბრძანება \"გაკრეჭა\". არ დაგავწყდეთ გამოიყენოთ მობრუნების ბრძანება ყოველ ცხვართან."},
"level3TooFewBlocksMessage":function(d){return "სცადეთ გამოიენოთ მეტი ბრძანება ორივე ცხვრის მატყლის შესაგროვებლად. მიდით თითოეულ ცხვართან და გამოიყენეთ ბრძანება \"გაკრეჭა\"."},
"level4FailureMessage":function(d){return "You must use the \"destroy block\" command on each of the three tree trunks."},
"level5FailureMessage":function(d){return "Place your blocks on the dirt outline to build a wall. The pink \"repeat\" command will run commands placed inside it, like \"place block\" and \"move forward\"."},
"level6FailureMessage":function(d){return "Place blocks on the dirt outline of the house to complete the puzzle."},
"level7FailureMessage":function(d){return "Use the \"plant\" command to place crops on each patch of dark tilled soil."},
"level8FailureMessage":function(d){return "If you touch a creeper it will explode. Sneak around them and enter your house."},
"level9FailureMessage":function(d){return "Don't forget to place at least 2 torches to light your way AND mine at least 2 coal."},
"minecraftBlock":function(d){return "ბლოკი"},
"nextLevelMsg":function(d){return "Puzzle "+craft_locale.v(d,"puzzleNumber")+" completed. Congratulations!"},
"playerSelectChooseCharacter":function(d){return "Choose your character."},
"playerSelectChooseSelectButton":function(d){return "არჩევა"},
"playerSelectLetsGetStarted":function(d){return "Let's get started."},
"reinfFeedbackMsg":function(d){return "You can press \"Keep Playing\" to go back to playing your game."},
"replayButton":function(d){return "გამეორება"},
"selectChooseButton":function(d){return "არჩევა"},
"tooManyBlocksFail":function(d){return "Puzzle "+craft_locale.v(d,"puzzleNumber")+" completed. Congratulations! It is also possible to complete it with "+craft_locale.p(d,"numBlocks",0,"en",{"one":"1 block","other":craft_locale.n(d,"numBlocks")+" blocks"})+"."}};