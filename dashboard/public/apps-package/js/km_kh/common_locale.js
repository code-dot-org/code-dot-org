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
"and":function(d){return "និង"},
"booleanTrue":function(d){return "ពិត"},
"booleanFalse":function(d){return "មិន​ពិត"},
"blocklyMessage":function(d){return "Blockly"},
"catActions":function(d){return "សកម្មភាព"},
"catColour":function(d){return "ពណ៌"},
"catLogic":function(d){return "តក្កវិជ្ជា"},
"catLists":function(d){return "បញ្ជី"},
"catLoops":function(d){return "រង្វិល​ជុំ"},
"catMath":function(d){return "គណិតវិទ្យា"},
"catProcedures":function(d){return "អនុគមន៍"},
"catText":function(d){return "អត្ថ​​បទ"},
"catVariables":function(d){return "អថេរ"},
"codeTooltip":function(d){return "មើល​កូដ JavaScript ដែល​បាន​បង្កើត។"},
"continue":function(d){return "បន្ត"},
"dialogCancel":function(d){return "បោះបង់"},
"dialogOK":function(d){return "យល់ព្រម"},
"directionNorthLetter":function(d){return "ខាងជើង"},
"directionSouthLetter":function(d){return "ខាងត្បូង"},
"directionEastLetter":function(d){return "ខាងកើត"},
"directionWestLetter":function(d){return "ខាងលិច"},
"end":function(d){return "end"},
"emptyBlocksErrorMsg":function(d){return "ប្លុក \"ធ្វើ​ឡើង​វិញ\" ឬ \"ប្រសិន​បើ\" ត្រូវ​ការ​ប្លុក​ដទៃ​ទៀត​នៅ​ក្នុង​វា ដើម្បី​ឲ្យ​អាច​ដើរ​បាន។ អ្នក​ត្រូវ​ប្រាកដ​ថា​ប្លុក​ខាង​ក្នុង​នោះ​ដាក់​ទៅ​សម​ទៅ​នឹង​ប្លុក​ផ្ទុក​ទាំង​នោះ​ដែរ។"},
"emptyFunctionBlocksErrorMsg":function(d){return "ប្លុក \"អនុគមន៍\" ត្រូវ​ការ​ប្លុក​ដទៃ​ទៀត​នៅ​ក្នុង​វា ទើប​វា​អាច​ធ្វើ​ការ​បាន។"},
"errorEmptyFunctionBlockModal":function(d){return "There need to be blocks inside your function definition. Click \"edit\" and drag blocks inside the green block."},
"errorIncompleteBlockInFunction":function(d){return "Click \"edit\" to make sure you don't have any blocks missing inside your function definition."},
"errorParamInputUnattached":function(d){return "Remember to attach a block to each parameter input on the function block in your workspace."},
"errorUnusedParam":function(d){return "You added a parameter block, but didn't use it in the definition. Make sure to use your parameter by clicking \"edit\" and placing the parameter block inside the green block."},
"errorRequiredParamsMissing":function(d){return "Create a parameter for your function by clicking \"edit\" and adding the necessary parameters. Drag the new parameter blocks into your function definition."},
"errorUnusedFunction":function(d){return "You created a function, but never used it on your workspace! Click on \"Functions\" in the toolbox and make sure you use it in your program."},
"errorQuestionMarksInNumberField":function(d){return "Try replacing \"???\" with a value."},
"extraTopBlocks":function(d){return "You have unattached blocks. Did you mean to attach these to the \"when run\" block?"},
"finalStage":function(d){return "សូម​អបអរសាទរ! អ្នក​បាន​បញ្ចប់​ដំណាក់កាល​ចុងក្រោយ​ហើយ។"},
"finalStageTrophies":function(d){return "សូម​អបអរសាទរ! អ្នក​បាន​បញ្ចប់​ដំណាក់កាល​ចុងក្រោយ ហើយ​បាន​ឈ្នះ​"+locale.p(d,"numTrophies",0,"en",{"one":"ពាន​មួយ","other":"ពាន "+locale.n(d,"numTrophies")})+"។"},
"finish":function(d){return "បញ្ចប់"},
"generatedCodeInfo":function(d){return "Even top universities teach block-based coding (e.g., "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). But under the hood, the blocks you have assembled can also be shown in JavaScript, the world's most widely used coding language:"},
"hashError":function(d){return "Sorry, '%1' doesn't correspond with any saved program."},
"help":function(d){return "ជំនួយ"},
"hintTitle":function(d){return "គន្លឹះ៖"},
"jump":function(d){return "លោត"},
"levelIncompleteError":function(d){return "អ្នក​កំពុង​ប្រើ​ប្រភេទ​ប្លុក​សំខាន់ៗ​ទាំង​អស់ ប៉ុន្តែ​មិន​ត្រឹមត្រូវ​នោះ​ទេ។"},
"listVariable":function(d){return "បញ្ជី"},
"makeYourOwnFlappy":function(d){return "បង្កើត​ហ្គេម Flappy របស់​អ្នក"},
"missingBlocksErrorMsg":function(d){return "Try one or more of the blocks below to solve this puzzle."},
"nextLevel":function(d){return "សូម​អបអរសាទរ! អ្នក​បាន​បញ្ចប់​ល្បែង​ប្រាជ្ញា "+locale.v(d,"puzzleNumber")+" ហើយ។"},
"nextLevelTrophies":function(d){return "Congratulations! You completed Puzzle "+locale.v(d,"puzzleNumber")+" and won "+locale.p(d,"numTrophies",0,"en",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"nextStage":function(d){return "Congratulations! You completed "+locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Congratulations! You completed "+locale.v(d,"stageName")+" and won "+locale.p(d,"numTrophies",0,"en",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"numBlocksNeeded":function(d){return "Congratulations! You completed Puzzle "+locale.v(d,"puzzleNumber")+". (However, you could have used only "+locale.p(d,"numBlocks",0,"en",{"one":"1 block","other":locale.n(d,"numBlocks")+" blocks"})+".)"},
"numLinesOfCodeWritten":function(d){return "You just wrote "+locale.p(d,"numLines",0,"en",{"one":"1 line","other":locale.n(d,"numLines")+" lines"})+" of code!"},
"play":function(d){return "play"},
"print":function(d){return "បោះពុម្ព"},
"puzzleTitle":function(d){return "ល្បែង​ប្រាជ្ញា​ទី "+locale.v(d,"puzzle_number")+" នៃ "+locale.v(d,"stage_total")},
"repeat":function(d){return "ធ្វើ​ឡើង​វិញ"},
"resetProgram":function(d){return "កំណត់​ឡើង​វិញ"},
"runProgram":function(d){return "រត់"},
"runTooltip":function(d){return "Run the program defined by the blocks in the workspace."},
"score":function(d){return "ពិន្ទុ"},
"showCodeHeader":function(d){return "បង្ហាញ​កូដ"},
"showBlocksHeader":function(d){return "បង្ហាញ​ប្លុក"},
"showGeneratedCode":function(d){return "បង្ហាញ​កូដ"},
"stringEquals":function(d){return "string=?"},
"subtitle":function(d){return "a visual programming environment"},
"textVariable":function(d){return "អត្ថ​បទ"},
"tooFewBlocksMsg":function(d){return "You are using all of the necessary types of blocks, but try using more  of these types of blocks to complete this puzzle."},
"tooManyBlocksMsg":function(d){return "អ្នក​អាច​ដោះស្រាយ​ល្បែង​ប្រាជ្ញា​នេះ​ជាមួយ <x id='START_SPAN'/><x id='END_SPAN'/> ប្លុក។"},
"tooMuchWork":function(d){return "អ្នក​ឲ្យ​ខ្ញុំ​ធ្វើ​ការងារ​ច្រើន​ណាស់! តើ​អ្នក​អាច​ឲ្យ​ធ្វើ​ឡើង​វិញ​តិច​ជាង​មុន​បាន​ទេ?"},
"toolboxHeader":function(d){return "ប្លុក"},
"openWorkspace":function(d){return "របៀប​វា​ដំណើរការ"},
"totalNumLinesOfCodeWritten":function(d){return "សរុប​គ្រប់​ពេល៖ "+locale.p(d,"numLines",0,"en",{"one":"1 បន្ទាត់","other":locale.n(d,"numLines")+" បន្ទាត់"})+"​នៃ​កូដ។"},
"tryAgain":function(d){return "ព្យាយាម​ម្ដង​ទៀត"},
"hintRequest":function(d){return "មើល​គន្លឹះ"},
"backToPreviousLevel":function(d){return "ត្រឡប់​ទៅ​កម្រិត​មុន"},
"saveToGallery":function(d){return "រក្សាទុក​ទៅ​វិចិត្រសាល"},
"savedToGallery":function(d){return "បាន​រក្សាទុក​ក្នុង​វិចិត្រសាល!"},
"shareFailure":function(d){return "សូមទោស, យើង​មិន​អាច​ចែករំលែក​កម្មវិធី​នេះ​បាន​ទេ។"},
"workspaceHeader":function(d){return "ផ្គុំ​ប្លុក​របស់​អ្នក​នៅ​ទីនេះ៖ "},
"workspaceHeaderJavaScript":function(d){return "វាយ​បញ្ចូល​កូដ JavaScript របស់​អ្នក នៅ​ទីនេះ"},
"infinity":function(d){return "អនន្ត"},
"rotateText":function(d){return "បង្វិល​ឧបករណ៍​របស់​អ្នក។"},
"orientationLock":function(d){return "Turn off orientation lock in device settings."},
"wantToLearn":function(d){return "ចង់​រៀន​សរសេរ​កូដ​ទេ?"},
"watchVideo":function(d){return "មើល​វីដេអូ"},
"when":function(d){return "នៅ​ពេល"},
"whenRun":function(d){return "when run"},
"tryHOC":function(d){return "សាក​ល្បង \"ពេល​វេលា​នៃ​កូដ\""},
"signup":function(d){return "ចុះ​ឈ្មោះ​សម្រាប់​វគ្គ​សិក្សា​ណែនាំ​ដំបូង"},
"hintHeader":function(d){return "នេះ​គឺ​ជា​គន្លឹះ៖"},
"genericFeedback":function(d){return "See how you ended up, and try to fix your program."},
"toggleBlocksErrorMsg":function(d){return "You need to correct an error in your program before it can be shown as blocks."},
"defaultTwitterText":function(d){return "Check out what I made"}};