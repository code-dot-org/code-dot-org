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
"and":function(d){return "이면서"},
"booleanTrue":function(d){return "true"},
"booleanFalse":function(d){return "false"},
"blocklyMessage":function(d){return "Blockly(블러클리)"},
"catActions":function(d){return "동작"},
"catColour":function(d){return "색"},
"catLogic":function(d){return "논리"},
"catLists":function(d){return "리스트"},
"catLoops":function(d){return "반복"},
"catMath":function(d){return "계산"},
"catProcedures":function(d){return "함수"},
"catText":function(d){return "문장"},
"catVariables":function(d){return "변수"},
"codeTooltip":function(d){return "자바스크립트(JavaScript) 코드 보기."},
"continue":function(d){return "계속하기"},
"dialogCancel":function(d){return "취소"},
"dialogOK":function(d){return "확인"},
"directionNorthLetter":function(d){return "위쪽"},
"directionSouthLetter":function(d){return "아래쪽"},
"directionEastLetter":function(d){return "오른쪽"},
"directionWestLetter":function(d){return "왼쪽"},
"end":function(d){return "끝"},
"emptyBlocksErrorMsg":function(d){return "\"반복\" 블럭이나 \"조건\" 블럭이 실행되려면, 그 안에 다른 블럭들이 있어야 합니다. 블럭 안쪽에 필요한 블럭들을 끼워 맞춰 연결하세요."},
"emptyFunctionBlocksErrorMsg":function(d){return "함수 블럭 안에는 다른 블럭을 넣어주어야 합니다."},
"errorEmptyFunctionBlockModal":function(d){return "함수 정의 안에 블럭을 추가해야 합니다. \"편집\"을 클릭한 후 녹색 블럭 안으로 블럭을 드래그하세요."},
"errorIncompleteBlockInFunction":function(d){return "함수 정의 안에 빠진 블럭을 채우려면 \"편집\"을 클릭하세요."},
"errorParamInputUnattached":function(d){return "작업공간에서 함수 블럭의 각 파라매터 입력에 블럭을 추가하는 것을 잊지마세요."},
"errorUnusedParam":function(d){return "파라매터 블럭은 추가했지만 함수 정의에서 파라매터 블럭을 사용하지 않았습니다. \"편집\"을 클릭해서 파라매터를 사용하도록 만들고 파라매터 블럭을 녹색 블럭 안으로 옮기세요."},
"errorRequiredParamsMissing":function(d){return "\"편집\"을 클릭해서 함수에 파라매터를 만들고 필요한 파라매터를 추가해보세요. 파라매터 블럭을 함수 정의문으로 드래그하면 됩니다."},
"errorUnusedFunction":function(d){return "작성한 함수가 한 번도 사용되지 않았습니다. 도구상자에서 \"함수\"를 클릭하고 프로그램에서 함수를 사용하도록 만드세요."},
"errorQuestionMarksInNumberField":function(d){return "\"???\"를 값으로 바꾸세요."},
"extraTopBlocks":function(d){return "블럭들이 붙어있지 않습니다. 블럭들을 붙이겠습니까?"},
"finalStage":function(d){return "축하합니다! 마지막 단계까지 성공적으로 해결했습니다."},
"finalStageTrophies":function(d){return "축하합니다! 마지막 단계까지 성공적으로 해결했고, "+locale.p(d,"numTrophies",0,"ko",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+" 을 얻었습니다."},
"finish":function(d){return "마침"},
"generatedCodeInfo":function(d){return " "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"와 같은 유명한 대학에서도 블럭기반 프로그래밍을 가르칩니다. 하지만, 블럭들은 모두 JavaScript로 바뀌어 실행됩니다 : "},
"hashError":function(d){return "죄송합니다. 저장된 '%1' 프로그램은 없습니다."},
"help":function(d){return "도움말"},
"hintTitle":function(d){return "힌트:"},
"jump":function(d){return "점프"},
"levelIncompleteError":function(d){return "필요한 블럭들을 모두 사용했지만, 정확한 방법은 아닙니다."},
"listVariable":function(d){return "리스트"},
"makeYourOwnFlappy":function(d){return "자신만의 플래피 게임을 만들어보세요."},
"missingBlocksErrorMsg":function(d){return "퍼즐을 풀기 위해 아래 블럭들을 더 사용해 보세요."},
"nextLevel":function(d){return "축하합니다! "+locale.v(d,"puzzleNumber")+" 번 퍼즐을 해결했습니다."},
"nextLevelTrophies":function(d){return "축하합니다! "+locale.v(d,"puzzleNumber")+" 번 퍼즐을 해결하고, "+locale.p(d,"numTrophies",0,"ko",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+" 를 얻었습니다."},
"nextStage":function(d){return "축하드립니다! "+locale.v(d,"stageName")+"을(를) 완료하셨습니다."},
"nextStageTrophies":function(d){return "축하합니다. "+locale.v(d,"stageName")+" 를 완료하였습니다. "+locale.p(d,"numTrophies",0,"ko",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"numBlocksNeeded":function(d){return "축하합니다! "+locale.v(d,"puzzleNumber")+" 번 퍼즐을 해결했습니다. (하지만, "+locale.p(d,"numBlocks",0,"ko",{"one":"1 block","other":locale.n(d,"numBlocks")+" blocks"})+" 만 사용해야 합니다.)"},
"numLinesOfCodeWritten":function(d){return "오! 코드 "+locale.p(d,"numLines",0,"ko",{"one":"1 line","other":locale.n(d,"numLines")+" 줄"})+"로 해결했네요!"},
"play":function(d){return "실행"},
"print":function(d){return "인쇄"},
"puzzleTitle":function(d){return "퍼즐 "+locale.v(d,"puzzle_number")+"/"+locale.v(d,"stage_total")},
"repeat":function(d){return "반복"},
"resetProgram":function(d){return "처음 상태로"},
"runProgram":function(d){return "실행"},
"runTooltip":function(d){return "블럭들로 작성되어있는 프로그램을 실행합니다."},
"score":function(d){return "점수"},
"showCodeHeader":function(d){return "코드 보기"},
"showBlocksHeader":function(d){return "블럭 보이기"},
"showGeneratedCode":function(d){return "코드 보기"},
"stringEquals":function(d){return "문장=?"},
"subtitle":function(d){return "비주얼 프로그래밍 환경"},
"textVariable":function(d){return "문장"},
"tooFewBlocksMsg":function(d){return "퍼즐을 해결하기 위해 필요한 블럭 종류는 모두 사용했지만, 이런 종류의 블럭들을 더 사용해 보세요."},
"tooManyBlocksMsg":function(d){return "이 퍼즐은  <x id='START_SPAN'/><x id='END_SPAN'/> 블럭들을 사용해 해결할 수 있습니다."},
"tooMuchWork":function(d){return "작업을 너무 많이 해야 되요! 더 적게 반복하는 방법은 없을까요?"},
"toolboxHeader":function(d){return "blocks"},
"openWorkspace":function(d){return "실행 설명"},
"totalNumLinesOfCodeWritten":function(d){return "지금까지: 코드 "+locale.p(d,"numLines",0,"ko",{"one":"1 line","other":locale.n(d,"numLines")+" 줄"})+" 사용."},
"tryAgain":function(d){return "다시 시도"},
"hintRequest":function(d){return "도움 보기"},
"backToPreviousLevel":function(d){return "이전 퍼즐"},
"saveToGallery":function(d){return "갤러리에 저장"},
"savedToGallery":function(d){return "갤러리에 저장되었습니다!"},
"shareFailure":function(d){return "프로그램을 공유할 수 없습니다."},
"workspaceHeader":function(d){return "블럭들을 이곳에서 조립하세요:"},
"workspaceHeaderJavaScript":function(d){return "자바스크립트 코드 작성"},
"infinity":function(d){return "무한"},
"rotateText":function(d){return "돌리세요."},
"orientationLock":function(d){return "회전 잠금을 해제하세요."},
"wantToLearn":function(d){return "코드(code)를 배워볼까요?"},
"watchVideo":function(d){return "비디오 보기"},
"when":function(d){return "~할 때"},
"whenRun":function(d){return "실행하면"},
"tryHOC":function(d){return "Hour of Code 해보기"},
"signup":function(d){return "샘플 코스를 위해 가입하기"},
"hintHeader":function(d){return "도움말:"},
"genericFeedback":function(d){return "어떻게 종료되는지 살펴보고 프로그램을 수정해 보세요."},
"toggleBlocksErrorMsg":function(d){return "You need to correct an error in your program before it can be shown as blocks."},
"defaultTwitterText":function(d){return "만든 작품 확인하기"}};