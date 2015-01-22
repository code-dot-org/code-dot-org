var locale = {lc:{"ar":function(n){
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
v:function(d,k){locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){locale.c(d,k);return d[k] in p?p[d[k]]:(k=locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).locale = {
"and":function(d){return "və"},
"booleanTrue":function(d){return "doğru"},
"booleanFalse":function(d){return "yalan"},
"blocklyMessage":function(d){return "\"Blockly\""},
"catActions":function(d){return "Əmrlər"},
"catColour":function(d){return "Rəng"},
"catLogic":function(d){return "Məntiq"},
"catLists":function(d){return "Siyahılar"},
"catLoops":function(d){return "Dövlər"},
"catMath":function(d){return "Riyaziyyat"},
"catProcedures":function(d){return "Funksiyalar"},
"catText":function(d){return "mətn"},
"catVariables":function(d){return "Dəyişənlər"},
"codeTooltip":function(d){return "Generasiya olunmuş \"JavaScript\" kodunu nəzərdən keçirin."},
"continue":function(d){return "Davam et"},
"dialogCancel":function(d){return "İmtina et"},
"dialogOK":function(d){return "Oldu"},
"directionNorthLetter":function(d){return "Şimal"},
"directionSouthLetter":function(d){return "Cənub"},
"directionEastLetter":function(d){return "Şərq"},
"directionWestLetter":function(d){return "Qərb"},
"end":function(d){return "son"},
"emptyBlocksErrorMsg":function(d){return "\"Təkrar\" və ya \"Əgər\" blokları işləsin deyə içərisində başqa blokların olmağı lazımdır. Əmin olun ki, daxili blokun konteyner blokun içərisinə düz yerləşir."},
"emptyFunctionBlocksErrorMsg":function(d){return "The function block needs to have other blocks inside it to work."},
"errorEmptyFunctionBlockModal":function(d){return "There need to be blocks inside your function definition. Click \"edit\" and drag blocks inside the green block."},
"errorIncompleteBlockInFunction":function(d){return "Click \"edit\" to make sure you don't have any blocks missing inside your function definition."},
"errorParamInputUnattached":function(d){return "Remember to attach a block to each parameter input on the function block in your workspace."},
"errorUnusedParam":function(d){return "You added a parameter block, but didn't use it in the definition. Make sure to use your parameter by clicking \"edit\" and placing the parameter block inside the green block."},
"errorRequiredParamsMissing":function(d){return "Create a parameter for your function by clicking \"edit\" and adding the necessary parameters. Drag the new parameter blocks into your function definition."},
"errorUnusedFunction":function(d){return "You created a function, but never used it on your workspace! Click on \"Functions\" in the toolbox and make sure you use it in your program."},
"errorQuestionMarksInNumberField":function(d){return "Try replacing \"???\" with a value."},
"extraTopBlocks":function(d){return "Qoşulmamış bloklarınız var. Onları \"icra etdikdə\" blokuna qoşmaq istəmirsiniz?"},
"finalStage":function(d){return "Təbriklər! Siz son mərhələni başa vurdunuz."},
"finalStageTrophies":function(d){return "Təbriklər! Siz sonuncu mərhələni tamamladınız və "+locale.p(d,"numTrophies",0,"en",{"one":"bir kubok","other":locale.n(d,"numTrophies")+" kubok"})+" qazandınız."},
"finish":function(d){return "Finish"},
"generatedCodeInfo":function(d){return "Even top universities teach block-based coding (e.g., "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). But under the hood, the blocks you have assembled can also be shown in JavaScript, the world's most widely used coding language:"},
"hashError":function(d){return "Təəssüf ki, '%1' yaddaşa verilmiş heç bir proqramla uyğunlaşmır."},
"help":function(d){return "Kömək"},
"hintTitle":function(d){return "Məsləhət:"},
"jump":function(d){return "atıl"},
"levelIncompleteError":function(d){return "Siz bütün lazım olan bloklardan istifadə edirsiniz amma səhv formada."},
"listVariable":function(d){return "siyahı"},
"makeYourOwnFlappy":function(d){return "Make Your Own Flappy Game"},
"missingBlocksErrorMsg":function(d){return "Bu tapmacanı həll etmək üçün aşağıdakı bloklardan bir və ya bir neçəsini sınaqdan keçirin."},
"nextLevel":function(d){return "Təbriklər! Siz "+locale.v(d,"puzzleNumber")+" nömrəli tapmacanı tamamladınız."},
"nextLevelTrophies":function(d){return "Təbriklər! Siz "+locale.v(d,"puzzleNumber")+" nömrəli tapmacanı tamamladınız və "+locale.p(d,"numTrophies",0,"en",{"one":"bir kubok","other":locale.n(d,"numTrophies")+" kubok"})+" qazandınız."},
"nextStage":function(d){return "Təbriklər! Siz "+locale.v(d,"stageName")+" mərhələsini tamamladınız."},
"nextStageTrophies":function(d){return "Təbriklər! Siz "+locale.v(d,"stageName")+" mərhələsini tamamladınız və "+locale.p(d,"numTrophies",0,"en",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+" qazandınız."},
"numBlocksNeeded":function(d){return "Təbriklər! Siz "+locale.v(d,"puzzleNumber")+" nömrəli tapmacanı tamamladınız. (Amma siz cəmi "+locale.p(d,"numBlocks",0,"en",{"one":"1 blokdan","other":locale.n(d,"numBlocks")+" blokdan"})+" istifadə edə bilərdiniz)"},
"numLinesOfCodeWritten":function(d){return "Siz indicə "+locale.p(d,"numLines",0,"en",{"one":"bir sətir","other":locale.n(d,"numLines")+" sətir"})+" kod yazdınız!"},
"play":function(d){return "play"},
"print":function(d){return "Print"},
"puzzleTitle":function(d){return "Tapmaca "+locale.v(d,"puzzle_number")+" (cəmi "+locale.v(d,"stage_total")+" tapmaca var)"},
"repeat":function(d){return "təkrar et"},
"resetProgram":function(d){return "Yenidən başla"},
"runProgram":function(d){return "İcra et"},
"runTooltip":function(d){return "İş sahəsindəki blokların təsvir etdiyi proqramı icra et."},
"score":function(d){return "score"},
"showCodeHeader":function(d){return "Kodu göstər"},
"showBlocksHeader":function(d){return "Show Blocks"},
"showGeneratedCode":function(d){return "Kodu göstər"},
"stringEquals":function(d){return "string=?"},
"subtitle":function(d){return "vizual proqramlaşdırma mühiti"},
"textVariable":function(d){return "mətn"},
"tooFewBlocksMsg":function(d){return "Siz bütün lazım olan blok növlərindən istifadə edirsiniz, amma bu tapmacanı tamamlamaq üçün daha çox blok növlərindən istifadə etməyə çalışın."},
"tooManyBlocksMsg":function(d){return "Bu tapmaca <x id='START_SPAN'/><x id='END_SPAN'/> blokla həll oluna bilər."},
"tooMuchWork":function(d){return "Siz mənə çox iş gördürdünüz! Təkrarlamaları azalda bilərsiniz?"},
"toolboxHeader":function(d){return "bloklar"},
"openWorkspace":function(d){return "Bu necə işləyir?"},
"totalNumLinesOfCodeWritten":function(d){return "Ümumi cəm: "+locale.p(d,"numLines",0,"en",{"one":"1 sətir","other":locale.n(d,"numLines")+" sətir"})+" kod."},
"tryAgain":function(d){return "Bir daha cəhd edin"},
"hintRequest":function(d){return "See hint"},
"backToPreviousLevel":function(d){return "Əvvəlki mərhələyə qayıt"},
"saveToGallery":function(d){return "Qalereyada yadda saxla"},
"savedToGallery":function(d){return "Qalereyada yadda saxlandı!"},
"shareFailure":function(d){return "Sorry, we can't share this program."},
"workspaceHeader":function(d){return "Bloklarınızı burada birləşdirin: "},
"workspaceHeaderJavaScript":function(d){return "Type your JavaScript code here"},
"infinity":function(d){return "Sonsuzluq"},
"rotateText":function(d){return "Cihazınızı döndərin."},
"orientationLock":function(d){return "Cihaz nizamlamalarında səmt kilidini söndürün."},
"wantToLearn":function(d){return "Want to learn to code?"},
"watchVideo":function(d){return "Videoya baxın"},
"when":function(d){return "when"},
"whenRun":function(d){return "icra etdikdə"},
"tryHOC":function(d){return "Kod Saatında özünüzü sınayın"},
"signup":function(d){return "Giriş kursu üçün qeydiyyatdan keçin"},
"hintHeader":function(d){return "Here's a tip:"},
"genericFeedback":function(d){return "See how you ended up, and try to fix your program."},
"toggleBlocksErrorMsg":function(d){return "You need to correct an error in your program before it can be shown as blocks."},
"defaultTwitterText":function(d){return "Check out what I made"}};