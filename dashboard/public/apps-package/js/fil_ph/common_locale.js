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
},"da":function(n){return n===1?"one":"other"},"de":function(n){return n===1?"one":"other"},"el":function(n){return n===1?"one":"other"},"es":function(n){return n===1?"one":"other"},"et":function(n){return n===1?"one":"other"},"eu":function(n){return n===1?"one":"other"},"fa":function(n){return "other"},"fi":function(n){return n===1?"one":"other"},"fil":function(n){return n===0||n==1?"one":"other"},"fr":function(n){return Math.floor(n)===0||Math.floor(n)==1?"one":"other"},"he":function(n){return n===1?"one":"other"},"hi":function(n){return n===0||n==1?"one":"other"},"hr":function(n){
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
"and":function(d){return "at"},
"booleanTrue":function(d){return "tama"},
"booleanFalse":function(d){return "mali"},
"blocklyMessage":function(d){return "Blockly"},
"catActions":function(d){return "Mga aksyon"},
"catColour":function(d){return "Kulay"},
"catLogic":function(d){return "Lohika"},
"catLists":function(d){return "Mga listahan"},
"catLoops":function(d){return "Mga loop"},
"catMath":function(d){return "Math"},
"catProcedures":function(d){return "Mga function"},
"catText":function(d){return "Text"},
"catVariables":function(d){return "Mga variable"},
"codeTooltip":function(d){return "Tingnan ang nabuo na JavaScripy code."},
"continue":function(d){return "Magpatuloy"},
"dialogCancel":function(d){return "Kanselahin"},
"dialogOK":function(d){return "OK"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionEastLetter":function(d){return "E"},
"directionWestLetter":function(d){return "W"},
"end":function(d){return "tapos"},
"emptyBlocksErrorMsg":function(d){return "Ang \"Repeat\" o \"if\" block ay kailangan ng iba pang mga block sa loob nito upang gumana. Siguraduhin na ang block na asa loob ay nakasukat ng maayos sa loob ng naglalaman na block."},
"emptyFunctionBlocksErrorMsg":function(d){return "Ang function na block ay kailangang magkaroon ng iba pang mga block sa loob nito upang gumana."},
"errorEmptyFunctionBlockModal":function(d){return "Dapat meron mga block sa loob ng iyong kahulugan ng function. I-click ang \"i-edit\" at i-drag ang mga block sa loob ng berdeng block."},
"errorIncompleteBlockInFunction":function(d){return "I-click ang \"i-edit\" upang tiyakin na wala kang nawawala sa loob ng iyong kahulugan ng function ng anumang mga block."},
"errorParamInputUnattached":function(d){return "Tandaang i-attach ang isang block sa bawat input parameter sa function block sa iyong workspace."},
"errorUnusedParam":function(d){return "Nagdagdag ka ng isang block na parameter, ngunit hindi ito ginamit sa definition. Siguraduhin na gamitin ang iyong mga parameter sa pamamagitan ng pag-click sa \"i-edit\" at paglalagay ng parameter block sa loob ng berdeng block."},
"errorRequiredParamsMissing":function(d){return "Lumikha ng parameter sa pamamagitan ng pag-click sa \"i-edit\" at pagdagdag ng mga kinakailangang parameter. I-drag ang mga bagong block parameter sa iyong kahulugan ng function."},
"errorUnusedFunction":function(d){return "Lumikha ka ng isang function, ngunit hindi kailanman ginamit ito sa iyong workspace! Mag-click sa \"Mga Functions\" sa toolbox at tiyakin na ginagamit mo ito sa iyong program."},
"errorQuestionMarksInNumberField":function(d){return "Subukan ang pagpalit ng \"???\" na may value."},
"extraTopBlocks":function(d){return "Mayroon kang hindi isinama na block. Ibig mo bang ilakip ang mga ito sa \"when run\" block?"},
"finalStage":function(d){return "Maligayang pagbati! Natapos mo na ang pinakahuling stage."},
"finalStageTrophies":function(d){return "Maligayang pagbati! Nakumpleto mo na ang pinakahuling stage at nanalo ng "+locale.p(d,"numTrophies",0,"fil",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"finish":function(d){return "Katapusan"},
"generatedCodeInfo":function(d){return "Kahit ang mga nangungunang mga unibersidad ay nagtuturo ng block-based na coding (eg, "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). Ngunit sa ilalim nito, ang mga bloke na iyong binuo ay maaari ring ipakita sa JavaScript, pinaka-tinatanggap na mga wika coding ng mundo:"},
"hashError":function(d){return "Pasensya, '%1' ay walang katumbas sa mga na save na program."},
"help":function(d){return "Tulong"},
"hintTitle":function(d){return "Pahiwatig:"},
"jump":function(d){return "talon"},
"levelIncompleteError":function(d){return "Ginagamit mo ang lahat ng kinakailangang mga uri ng mga bloke ngunit hindi sa tamang paraan."},
"listVariable":function(d){return "list"},
"makeYourOwnFlappy":function(d){return "Gumawa Ng Sarili Mong Flappy Game"},
"missingBlocksErrorMsg":function(d){return "Subukan ang isa o higit pa sa mga bloke sa ibaba upang malutas itong palaisipan."},
"nextLevel":function(d){return "Maligayang bati! Natapos mo ang Puzzle "+locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Maligayang bati! Nakumpleto mo ang Puzzle "+locale.v(d,"puzzleNumber")+" at nanalo ng "+locale.p(d,"numTrophies",0,"fil",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"nextStage":function(d){return "Maligayang bati! Nakumpleto mo ang "+locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Maligayang bati! Natapos mo ang "+locale.v(d,"stageName")+" at nanalo ng "+locale.p(d,"numTrophies",0,"fil",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"numBlocksNeeded":function(d){return "Maligayang bati! Nakumpleto mo ang Puzzle "+locale.v(d,"puzzleNumber")+". (Subalit, maaari mo sanang gamitin lamang ang "+locale.p(d,"numBlocks",0,"fil",{"one":"1 block","other":locale.n(d,"numBlocks")+" blocks"})+".)"},
"numLinesOfCodeWritten":function(d){return "Ikaw ang nagsulat ng "+locale.p(d,"numLines",0,"fil",{"one":"1 line","other":locale.n(d,"numLines")+" lines"})+" ng code!"},
"play":function(d){return "i-play"},
"print":function(d){return "I-print"},
"puzzleTitle":function(d){return "Puzzle "+locale.v(d,"puzzle_number")+" ng "+locale.v(d,"stage_total")},
"repeat":function(d){return "ulitin"},
"resetProgram":function(d){return "Ulitin"},
"runProgram":function(d){return "Patakbuhin"},
"runTooltip":function(d){return "Patakbuhin ang program na tinutukoy ng mga block sa workspace."},
"score":function(d){return "Score"},
"showCodeHeader":function(d){return "Ipakita ang Code"},
"showBlocksHeader":function(d){return "Ipakita ang mga Block"},
"showGeneratedCode":function(d){return "Ipakita ang Code"},
"stringEquals":function(d){return "string=?"},
"subtitle":function(d){return "isang visual programming na environment"},
"textVariable":function(d){return "text"},
"tooFewBlocksMsg":function(d){return "Ginagamit mo ang lahat na posibleng klase ng bloke, ngunit subukan mong gamitin ang iba pang mga uri ng mga block upang makumpleto ang puzzle na ito."},
"tooManyBlocksMsg":function(d){return "Ang puzzle na ito ay maaaring malutas gamit ang <x id='START_SPAN'/><x id='END_SPAN'/> na mga block."},
"tooMuchWork":function(d){return "Pinagawa mo ako ng naparaming trabaho! Maaari mo ba na ulitin ng mas kaunting mga beses?"},
"toolboxHeader":function(d){return "Mga block"},
"openWorkspace":function(d){return "Kung Paano Ito Gumagana"},
"totalNumLinesOfCodeWritten":function(d){return "Kinabuohan: "+locale.p(d,"numLines",0,"fil",{"one":"1 line","other":locale.n(d,"numLines")+" lines"})+" ng code."},
"tryAgain":function(d){return "Subukang muli"},
"hintRequest":function(d){return "Tingnan ang hint"},
"backToPreviousLevel":function(d){return "Bumalik sa nakaraang level"},
"saveToGallery":function(d){return "I-save sa gallery"},
"savedToGallery":function(d){return "Na-save sa gallery!"},
"shareFailure":function(d){return "Pasesnya, hindi namin pwede ibahagi ang program na ito."},
"workspaceHeader":function(d){return "I-assemble ang iyong mga bloke dito: "},
"workspaceHeaderJavaScript":function(d){return "I-type ang iyong JavaScript code dito"},
"infinity":function(d){return "Walang katapusan"},
"rotateText":function(d){return "Paikutin ang iyong device."},
"orientationLock":function(d){return "I-off ang orientation ng lock sa mga setting ng device."},
"wantToLearn":function(d){return "Gusto mo matuto mag-code?"},
"watchVideo":function(d){return "Panoorin ang Video"},
"when":function(d){return "kelan"},
"whenRun":function(d){return "kapag tumakbo"},
"tryHOC":function(d){return "Subukan ang Hour of Code"},
"signup":function(d){return "Mag-sign up para sa intro ng kurso"},
"hintHeader":function(d){return "Narito ang isang tip:"},
"genericFeedback":function(d){return "Tingnan kung ano ang nangyari dito, at subukang ayusin ang iyong mga program."},
"toggleBlocksErrorMsg":function(d){return "You need to correct an error in your program before it can be shown as blocks."},
"defaultTwitterText":function(d){return "Check out what I made"}};