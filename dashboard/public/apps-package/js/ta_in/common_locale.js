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
"and":function(d){return "மற்றும்"},
"booleanTrue":function(d){return "மெய்"},
"booleanFalse":function(d){return "தவறு"},
"blocklyMessage":function(d){return "Blockly"},
"catActions":function(d){return "செயல்கள்"},
"catColour":function(d){return "நிறம்"},
"catLogic":function(d){return "தர்க்கம்"},
"catLists":function(d){return "பட்டியல்கள்"},
"catLoops":function(d){return "சுழற்சிகள்"},
"catMath":function(d){return "கணிதம்"},
"catProcedures":function(d){return "செயல்பாடுகள்"},
"catText":function(d){return "உரை"},
"catVariables":function(d){return "மாறிலிகள்"},
"codeTooltip":function(d){return "உருவாக்கப்பட்ட ஜாவாஉரைக் குறியீடுகளை பார்க்க."},
"continue":function(d){return "தொடர்க"},
"dialogCancel":function(d){return "ரத்து செய்"},
"dialogOK":function(d){return "சரி"},
"directionNorthLetter":function(d){return "வடக்கு"},
"directionSouthLetter":function(d){return "தெற்கு"},
"directionEastLetter":function(d){return "கிழக்கு"},
"directionWestLetter":function(d){return "மேற்கு"},
"end":function(d){return "end"},
"emptyBlocksErrorMsg":function(d){return "The \"Repeat\" or \"If\" block needs to have other blocks inside it to work. Make sure the inner block fits properly inside the containing block."},
"emptyFunctionBlocksErrorMsg":function(d){return "The function block needs to have other blocks inside it to work."},
"errorEmptyFunctionBlockModal":function(d){return "There need to be blocks inside your function definition. Click \"edit\" and drag blocks inside the green block."},
"errorIncompleteBlockInFunction":function(d){return "Click \"edit\" to make sure you don't have any blocks missing inside your function definition."},
"errorParamInputUnattached":function(d){return "Remember to attach a block to each parameter input on the function block in your workspace."},
"errorUnusedParam":function(d){return "You added a parameter block, but didn't use it in the definition. Make sure to use your parameter by clicking \"edit\" and placing the parameter block inside the green block."},
"errorRequiredParamsMissing":function(d){return "Create a parameter for your function by clicking \"edit\" and adding the necessary parameters. Drag the new parameter blocks into your function definition."},
"errorUnusedFunction":function(d){return "You created a function, but never used it on your workspace! Click on \"Functions\" in the toolbox and make sure you use it in your program."},
"errorQuestionMarksInNumberField":function(d){return "Try replacing \"???\" with a value."},
"extraTopBlocks":function(d){return "You have unattached blocks. Did you mean to attach these to the \"when run\" block?"},
"finalStage":function(d){return "வாழ்த்துக்கள்! நீங்கள் இறுதிக் கட்டத்தை நிறைவு செய்துள்ளீர்கள்."},
"finalStageTrophies":function(d){return "Congratulations! You have completed the final stage and won "+locale.p(d,"numTrophies",0,"ta",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"finish":function(d){return "Finish"},
"generatedCodeInfo":function(d){return "Even top universities teach block-based coding (e.g., "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). But under the hood, the blocks you have assembled can also be shown in JavaScript, the world's most widely used coding language:"},
"hashError":function(d){return "மன்னிக்கவும், '%1' எந்த சேமிக்கப்பட்ட நிரலுடனும் பொருந்தவில்லை."},
"help":function(d){return "உதவி"},
"hintTitle":function(d){return "குறிப்பு:"},
"jump":function(d){return "jump"},
"levelIncompleteError":function(d){return "You are using all of the necessary types of blocks but not in the right way."},
"listVariable":function(d){return "பட்டியல்"},
"makeYourOwnFlappy":function(d){return "Make Your Own Flappy Game"},
"missingBlocksErrorMsg":function(d){return "Try one or more of the blocks below to solve this puzzle."},
"nextLevel":function(d){return "வாழ்த்துக்கள்! நீங்கள் "+locale.v(d,"puzzleNumber")+" ஆவது புதிரை நிறைவு செய்துள்ளீர்கள்."},
"nextLevelTrophies":function(d){return "Congratulations! You completed Puzzle "+locale.v(d,"puzzleNumber")+" and won "+locale.p(d,"numTrophies",0,"ta",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"nextStage":function(d){return "Congratulations! You completed "+locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Congratulations! You completed "+locale.v(d,"stageName")+" and won "+locale.p(d,"numTrophies",0,"ta",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"numBlocksNeeded":function(d){return "Congratulations! You completed Puzzle "+locale.v(d,"puzzleNumber")+". (However, you could have used only "+locale.p(d,"numBlocks",0,"ta",{"one":"1 block","other":locale.n(d,"numBlocks")+" blocks"})+".)"},
"numLinesOfCodeWritten":function(d){return "You just wrote "+locale.p(d,"numLines",0,"ta",{"one":"1 line","other":locale.n(d,"numLines")+" lines"})+" of code!"},
"play":function(d){return "play"},
"print":function(d){return "Print"},
"puzzleTitle":function(d){return locale.v(d,"stage_total")+" ஆம் நிலையில் புதிர் "+locale.v(d,"puzzle_number")},
"repeat":function(d){return "மறுபடி"},
"resetProgram":function(d){return "மீட்டமை"},
"runProgram":function(d){return "Run"},
"runTooltip":function(d){return "Run the program defined by the blocks in the workspace."},
"score":function(d){return "score"},
"showCodeHeader":function(d){return "குறியீட்டை காண்பி"},
"showBlocksHeader":function(d){return "Show Blocks"},
"showGeneratedCode":function(d){return "குறியீட்டை காண்பி"},
"stringEquals":function(d){return "string=?"},
"subtitle":function(d){return "a visual programming environment"},
"textVariable":function(d){return "உரை"},
"tooFewBlocksMsg":function(d){return "You are using all of the necessary types of blocks, but try using more  of these types of blocks to complete this puzzle."},
"tooManyBlocksMsg":function(d){return "This puzzle can be solved with <x id='START_SPAN'/><x id='END_SPAN'/> blocks."},
"tooMuchWork":function(d){return "You made me do a lot of work!  Could you try repeating fewer times?"},
"toolboxHeader":function(d){return "தொகுதிகள்"},
"openWorkspace":function(d){return "இது எப்படி செயல்படுகிறது"},
"totalNumLinesOfCodeWritten":function(d){return "All-time total: "+locale.p(d,"numLines",0,"ta",{"one":"1 line","other":locale.n(d,"numLines")+" lines"})+" of code."},
"tryAgain":function(d){return "மீண்டும் முயற்சி செய்"},
"hintRequest":function(d){return "See hint"},
"backToPreviousLevel":function(d){return "முந்தைய நிலைக்கு திரும்பவும்"},
"saveToGallery":function(d){return "Save to gallery"},
"savedToGallery":function(d){return "Saved in gallery!"},
"shareFailure":function(d){return "Sorry, we can't share this program."},
"workspaceHeader":function(d){return "உங்கள் தொகுதிகளை இங்கே பொருத்துங்கள்: "},
"workspaceHeaderJavaScript":function(d){return "Type your JavaScript code here"},
"infinity":function(d){return "முடிவிலி"},
"rotateText":function(d){return "உங்கள் சாதனத்தை சுழற்றவும்."},
"orientationLock":function(d){return "Turn off orientation lock in device settings."},
"wantToLearn":function(d){return "குறியீடுகள் கற்க வேண்டுமா?"},
"watchVideo":function(d){return "காணொளியை பார்க்கவும்"},
"when":function(d){return "when"},
"whenRun":function(d){return "when run"},
"tryHOC":function(d){return "Try the Hour of Code"},
"signup":function(d){return "ஆரம்ப பாடத்திற்கு பதிவுபெறவும்"},
"hintHeader":function(d){return "Here's a tip:"},
"genericFeedback":function(d){return "See how you ended up, and try to fix your program."},
"toggleBlocksErrorMsg":function(d){return "You need to correct an error in your program before it can be shown as blocks."},
"defaultTwitterText":function(d){return "Check out what I made"}};