var common_locale = {lc:{"ar":function(n){
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
v:function(d,k){common_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){common_locale.c(d,k);return d[k] in p?p[d[k]]:(k=common_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){common_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).common_locale = {
"and":function(d){return "이면서"},
"backToPreviousLevel":function(d){return "이전 퍼즐"},
"blocklyMessage":function(d){return "Blockly(블러클리)"},
"blocks":function(d){return "블록"},
"booleanFalse":function(d){return "거짓"},
"booleanTrue":function(d){return "참"},
"catActions":function(d){return "동작"},
"catColour":function(d){return "색"},
"catLists":function(d){return "리스트"},
"catLogic":function(d){return "논리"},
"catLoops":function(d){return "반복"},
"catMath":function(d){return "계산"},
"catProcedures":function(d){return "함수"},
"catText":function(d){return "문장"},
"catVariables":function(d){return "변수"},
"clearPuzzle":function(d){return "다시 시작하기"},
"clearPuzzleConfirm":function(d){return "퍼즐을 시작 상태로 되돌리고 추가 및 변경했던 블록들을 모두 삭제합니다."},
"clearPuzzleConfirmHeader":function(d){return "정말 다시 시작하겠습니까?"},
"codeMode":function(d){return "코드"},
"codeTooltip":function(d){return "자바스크립트(JavaScript) 코드 보기."},
"completedWithoutRecommendedBlock":function(d){return "축하합니다! "+common_locale.v(d,"puzzleNumber")+" 번 퍼즐을 해결했습니다. (하지만, 보다 강력한 다른 코드를 사용할 수도 있었습니다.)"},
"continue":function(d){return "계속하기"},
"copy":function(d){return "복사"},
"defaultTwitterText":function(d){return "만든 작품 확인하기"},
"designMode":function(d){return "디자인"},
"dialogCancel":function(d){return "취소"},
"dialogOK":function(d){return "확인"},
"directionEastLetter":function(d){return "오른쪽"},
"directionNorthLetter":function(d){return "위쪽"},
"directionSouthLetter":function(d){return "아래쪽"},
"directionWestLetter":function(d){return "왼쪽"},
"dropletBlock_addOperator_description":function(d){return "두 숫자 더하기"},
"dropletBlock_addOperator_signatureOverride":function(d){return "연산자 추가"},
"dropletBlock_andOperator_description":function(d){return "두 식이 모두 참과 거짓 이외의  것인 경우 참을 반환합니다."},
"dropletBlock_andOperator_signatureOverride":function(d){return "AND 부울 연산자"},
"dropletBlock_assign_x_description":function(d){return "기존 변수에 값을 할당. 예를 들어, x=0;"},
"dropletBlock_assign_x_param0":function(d){return "x"},
"dropletBlock_assign_x_param0_description":function(d){return "할당 된 변수의 이름"},
"dropletBlock_assign_x_param1":function(d){return "값"},
"dropletBlock_assign_x_param1_description":function(d){return "변수에 할당된 값"},
"dropletBlock_assign_x_signatureOverride":function(d){return "변수 할당"},
"dropletBlock_callMyFunction_description":function(d){return "매개 변수가 지정되지 않은 함수 호출"},
"dropletBlock_callMyFunction_n_description":function(d){return "하나 이상의 매개 변수가 명명된 함수 호출"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "매개 변수가 있는 함수 호출"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "함수 호출"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "Create a variable and initialize it as an array"},
"dropletBlock_declareAssign_x_array_1_4_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_array_1_4_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_array_1_4_param1":function(d){return "1,2,3,4"},
"dropletBlock_declareAssign_x_array_1_4_param1_description":function(d){return "배열의 초기값"},
"dropletBlock_declareAssign_x_array_1_4_signatureOverride":function(d){return "배열 변수를 선언하세요."},
"dropletBlock_declareAssign_x_description":function(d){return "‘var’ 다음에 변수 이름을 선언하고, 수식 오른쪽에 값을 할당하세요."},
"dropletBlock_declareAssign_x_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_param1":function(d){return "0"},
"dropletBlock_declareAssign_x_param1_description":function(d){return "변수의 초기값"},
"dropletBlock_declareAssign_x_prompt_description":function(d){return "사용자가 제공한 초기값을 변수에 할당하는 코드를 작성하세요."},
"dropletBlock_declareAssign_x_prompt_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_prompt_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_prompt_param1":function(d){return "\"값을 입력하시오\""},
"dropletBlock_declareAssign_x_prompt_param1_description":function(d){return "값을 입력할 때 사용자가 볼 수 있도록 팝업창에 표시되는 문자열"},
"dropletBlock_declareAssign_x_prompt_signatureOverride":function(d){return "Prompt the user for a value and store it"},
"dropletBlock_declareAssign_x_promptNum_description":function(d){return "Declares that the code will now use a variable and assign it an initial numerical value provided by the user"},
"dropletBlock_declareAssign_x_promptNum_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_promptNum_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_promptNum_param1":function(d){return "\"값을 입력하시오\""},
"dropletBlock_declareAssign_x_promptNum_param1_description":function(d){return "값을 입력할 때 사용자가 볼 수 있도록 팝업창에 표시되는 문자열"},
"dropletBlock_declareAssign_x_promptNum_signatureOverride":function(d){return "Prompt the user for a numerical value and store it"},
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "변수를 선언하시오"},
"dropletBlock_declareNoAssign_x_description":function(d){return "Declares a variable with the given name after 'var'"},
"dropletBlock_declareNoAssign_x_signatureOverride":function(d){return "변수를 선언하시오"},
"dropletBlock_divideOperator_description":function(d){return "Divide two numbers"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "Divide operator"},
"dropletBlock_equalityOperator_description":function(d){return "Test for equality"},
"dropletBlock_equalityOperator_param0":function(d){return "x"},
"dropletBlock_equalityOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_equalityOperator_param1":function(d){return "y"},
"dropletBlock_equalityOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_equalityOperator_signatureOverride":function(d){return "Equality operator"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "Do something multiple times"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "for loop"},
"dropletBlock_functionParams_n_description":function(d){return "A set of statements that takes in one or more parameters, and performs a task or calculate a value when the function is called"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "Function with a Parameter"},
"dropletBlock_functionParams_none_description":function(d){return "A set of statements that perform a task or calculate a value when the function is called"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "Function Definition"},
"dropletBlock_getTime_description":function(d){return "Get the current time in milliseconds"},
"dropletBlock_greaterThanOperator_description":function(d){return "Compare two numbers"},
"dropletBlock_greaterThanOperator_param0":function(d){return "x"},
"dropletBlock_greaterThanOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_greaterThanOperator_param1":function(d){return "y"},
"dropletBlock_greaterThanOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_greaterThanOperator_signatureOverride":function(d){return "Greater than operator"},
"dropletBlock_ifBlock_description":function(d){return "Do something only if a condition is true"},
"dropletBlock_ifBlock_signatureOverride":function(d){return "if statement"},
"dropletBlock_ifElseBlock_description":function(d){return "Do something if a condition is true, otherwise do something else"},
"dropletBlock_ifElseBlock_signatureOverride":function(d){return "if/else statement"},
"dropletBlock_inequalityOperator_description":function(d){return "Test for inequality"},
"dropletBlock_inequalityOperator_param0":function(d){return "x"},
"dropletBlock_inequalityOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_inequalityOperator_param1":function(d){return "y"},
"dropletBlock_inequalityOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_inequalityOperator_signatureOverride":function(d){return "Inequality operator"},
"dropletBlock_lessThanOperator_description":function(d){return "Compare two numbers"},
"dropletBlock_lessThanOperator_param0":function(d){return "x"},
"dropletBlock_lessThanOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_lessThanOperator_param1":function(d){return "y"},
"dropletBlock_lessThanOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_lessThanOperator_signatureOverride":function(d){return "Less than operator"},
"dropletBlock_mathAbs_description":function(d){return "Absolute value"},
"dropletBlock_mathAbs_param0":function(d){return "x"},
"dropletBlock_mathAbs_param0_description":function(d){return "An arbitrary number."},
"dropletBlock_mathAbs_signatureOverride":function(d){return "Math.abs(x)"},
"dropletBlock_mathMax_description":function(d){return "Maximum value"},
"dropletBlock_mathMax_param0":function(d){return "n1, n2,..., nX"},
"dropletBlock_mathMax_param0_description":function(d){return "One or more numbers to compare."},
"dropletBlock_mathMax_signatureOverride":function(d){return "Math.max(n1, n2, ..., nX)"},
"dropletBlock_mathMin_description":function(d){return "Minimum value"},
"dropletBlock_mathMin_param0":function(d){return "n1, n2,..., nX"},
"dropletBlock_mathMin_param0_description":function(d){return "One or more numbers to compare."},
"dropletBlock_mathMin_signatureOverride":function(d){return "Math.min(n1, n2, ..., nX)"},
"dropletBlock_mathRandom_description":function(d){return "0부터 1보다 작은 범위의 랜덤 수를 만들어 줍니다."},
"dropletBlock_mathRandom_signatureOverride":function(d){return "Math.random()"},
"dropletBlock_mathRound_description":function(d){return "Round to the nearest integer"},
"dropletBlock_mathRound_param0":function(d){return "x"},
"dropletBlock_mathRound_param0_description":function(d){return "An arbitrary number."},
"dropletBlock_mathRound_signatureOverride":function(d){return "Math.round(x)"},
"dropletBlock_multiplyOperator_description":function(d){return "Multiply two numbers"},
"dropletBlock_multiplyOperator_signatureOverride":function(d){return "Multiply operator"},
"dropletBlock_notOperator_description":function(d){return "Logical NOT of a boolean"},
"dropletBlock_notOperator_signatureOverride":function(d){return "AND 부울 연산자"},
"dropletBlock_orOperator_description":function(d){return "Logical OR of two booleans"},
"dropletBlock_orOperator_signatureOverride":function(d){return "OR boolean operator"},
"dropletBlock_randomNumber_min_max_description":function(d){return "Returns a random number ranging from the first number (min) to the second number (max), including both numbers in the range"},
"dropletBlock_randomNumber_param0":function(d){return "최소"},
"dropletBlock_randomNumber_param0_description":function(d){return "가장 작은 수를 찾아 줍니다."},
"dropletBlock_randomNumber_param1":function(d){return "최대"},
"dropletBlock_randomNumber_param1_description":function(d){return "가장 큰 수를 찾아 줍니다."},
"dropletBlock_randomNumber_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_return_description":function(d){return "Return a value from a function"},
"dropletBlock_return_signatureOverride":function(d){return "다음을 돌려줌"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_subtractOperator_description":function(d){return "두 숫자를 뺍니다"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "연산자를 뺍니다"},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "만약 반복"},
"emptyBlockInFunction":function(d){return "함수 "+common_locale.v(d,"name")+" 에 입력되지 않은 부분이 있습니다."},
"emptyBlockInVariable":function(d){return "변수 "+common_locale.v(d,"name")+" 에 입력되지 않은 부분이 있습니다."},
"emptyBlocksErrorMsg":function(d){return "\"반복\" 블럭이나 \"조건\" 블럭이 실행되려면, 그 안에 다른 블럭들이 있어야 합니다. 블럭 안쪽에 필요한 블럭들을 끼워 맞춰 연결하세요."},
"emptyExampleBlockErrorMsg":function(d){return common_locale.v(d,"functionName")+" 함수에 대해 적어도 한 가지 예시가 필요합니다. 각 예시마다 호출과 결과가 있어야 합니다."},
"emptyFunctionBlocksErrorMsg":function(d){return "함수 블럭 안에는 다른 블럭을 넣어주어야 합니다."},
"emptyFunctionalBlock":function(d){return "입력값을 넣지 않은 블럭이 있습니다."},
"emptyTopLevelBlock":function(d){return "실행할 블록이 없습니다. "+common_locale.v(d,"topLevelBlockName")+" 에 블록을 연결해야 합니다."},
"end":function(d){return "끝"},
"errorEmptyFunctionBlockModal":function(d){return "함수 정의 안에 블럭을 추가해야 합니다. \"편집\"을 클릭한 후 녹색 블럭 안으로 블럭을 드래그하세요."},
"errorIncompleteBlockInFunction":function(d){return "함수 정의 안에 빠진 블럭을 채우려면 \"편집\"을 클릭하세요."},
"errorParamInputUnattached":function(d){return "작업공간에서 함수 블럭의 각 파라매터 입력에 블럭을 추가하는 것을 잊지마세요."},
"errorQuestionMarksInNumberField":function(d){return "\"???\"를 값으로 바꾸세요."},
"errorRequiredParamsMissing":function(d){return "\"편집\"을 클릭해서 함수에 파라매터를 만들고 필요한 파라매터를 추가해보세요. 파라매터 블럭을 함수 정의문으로 드래그하면 됩니다."},
"errorUnusedFunction":function(d){return "작성한 함수가 한 번도 사용되지 않았습니다. 도구상자에서 \"함수\"를 클릭하고 프로그램에서 함수를 사용하도록 만드세요."},
"errorUnusedParam":function(d){return "파라매터 블럭은 추가했지만 함수 정의에서 파라매터 블럭을 사용하지 않았습니다. \"편집\"을 클릭해서 파라매터를 사용하도록 만들고 파라매터 블럭을 녹색 블럭 안으로 옮기세요."},
"exampleErrorMessage":function(d){return common_locale.v(d,"functionName")+" 함수에는 하나 이상 수정할 예시들이 있어야 합니다. 정의와 질문에 대한 답이 일치하도록 해주세요."},
"examplesFailedOnClose":function(d){return "예시에서 하나 이상이 정의와 맞지 않습니다. 닫기 전에 예시를 확인해 주세요."},
"extraTopBlocks":function(d){return "연결시키지 않은 블록들이 있습니다."},
"extraTopBlocksWhenRun":function(d){return "연결하지 않은 블록들이 있습니다.  \"실행하면\" 블록에 연결하시겠습니까?"},
"finalStage":function(d){return "축하합니다! 마지막 단계까지 성공적으로 해결했습니다."},
"finalStageTrophies":function(d){return "축하합니다! 마지막 단계까지 성공적으로 해결했고, "+common_locale.p(d,"numTrophies",0,"ko",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+" 을 얻었습니다."},
"finish":function(d){return "마침"},
"generatedCodeInfo":function(d){return " "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+"와 같은 유명한 대학에서도 블럭기반 프로그래밍을 가르칩니다. 하지만, 블럭들은 모두 JavaScript로 바뀌어 실행됩니다 : "},
"hashError":function(d){return "죄송합니다. 저장된 '%1' 프로그램은 없습니다."},
"help":function(d){return "도움말"},
"hideToolbox":function(d){return "(숨기기)"},
"hintHeader":function(d){return "도움말:"},
"hintRequest":function(d){return "도움 보기"},
"hintTitle":function(d){return "힌트:"},
"ignore":function(d){return "무시"},
"infinity":function(d){return "무한"},
"jump":function(d){return "점프"},
"keepPlaying":function(d){return "계속 진행"},
"levelIncompleteError":function(d){return "필요한 블럭들을 모두 사용했지만, 정확한 방법은 아닙니다."},
"listVariable":function(d){return "리스트"},
"makeYourOwnFlappy":function(d){return "자신만의 플래피 게임을 만들어보세요."},
"missingRecommendedBlocksErrorMsg":function(d){return "아직 부족합니다. 사용되지 않은 블록을 사용해 보세요."},
"missingRequiredBlocksErrorMsg":function(d){return "아직 부족합니다. 사용되지 않은 블록을 사용해야 합니다."},
"nestedForSameVariable":function(d){return "두 번 이상 중첩된 반복문을 사용하고 있습니다. 무한 반복을 피하려면 각 반복에 다른 변수를 사용하세요."},
"nextLevel":function(d){return "축하합니다! "+common_locale.v(d,"puzzleNumber")+" 번 퍼즐을 해결했습니다."},
"nextLevelTrophies":function(d){return "축하합니다! "+common_locale.v(d,"puzzleNumber")+" 번 퍼즐을 해결하고, "+common_locale.p(d,"numTrophies",0,"ko",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+" 를 얻었습니다."},
"nextPuzzle":function(d){return "다음 퍼즐"},
"nextStage":function(d){return "축하드립니다! "+common_locale.v(d,"stageName")+"을(를) 완료하셨습니다."},
"nextStageTrophies":function(d){return "축하합니다. "+common_locale.v(d,"stageName")+" 를 완료하였습니다. "+common_locale.p(d,"numTrophies",0,"ko",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+"."},
"numBlocksNeeded":function(d){return "축하합니다! "+common_locale.v(d,"puzzleNumber")+" 번 퍼즐을 해결했습니다. (하지만, "+common_locale.p(d,"numBlocks",0,"ko",{"one":"1 block","other":common_locale.n(d,"numBlocks")+" blocks"})+" 만 사용해야 합니다.)"},
"numLinesOfCodeWritten":function(d){return "오! 코드 "+common_locale.p(d,"numLines",0,"ko",{"one":"1 line","other":common_locale.n(d,"numLines")+" 줄"})+"로 해결했네요!"},
"openWorkspace":function(d){return "실행 설명"},
"orientationLock":function(d){return "회전 잠금을 해제하세요."},
"play":function(d){return "실행"},
"print":function(d){return "인쇄"},
"puzzleTitle":function(d){return "퍼즐 "+common_locale.v(d,"puzzle_number")+"/"+common_locale.v(d,"stage_total")},
"readonlyWorkspaceHeader":function(d){return "읽기 전용: "},
"repeat":function(d){return "반복"},
"resetProgram":function(d){return "처음 상태로"},
"rotateText":function(d){return "돌리세요."},
"runProgram":function(d){return "실행"},
"runTooltip":function(d){return "블럭들로 작성되어있는 프로그램을 실행합니다."},
"runtimeErrorMsg":function(d){return "프로그램이 성공적으로 실행되지 않았습니다. "+common_locale.v(d,"lineNumber")+" 줄을 지우고 다시 시도해 보세요."},
"saveToGallery":function(d){return "갤러리에 저장"},
"savedToGallery":function(d){return "갤러리에 저장되었습니다!"},
"score":function(d){return "점수"},
"sendToPhone":function(d){return "전화로 보내기"},
"shareFailure":function(d){return "프로그램을 공유할 수 없습니다."},
"shareWarningsAge":function(d){return "나이를 입력하고 OK를 눌러 계속 진행하세요."},
"shareWarningsMoreInfo":function(d){return "추가 정보"},
"shareWarningsStoreData":function(d){return "코드 스튜디오에 내장되어있는 이 앱은 많은 사람들에게 보여질 수 있는 데이터를 저장하기 때문에 개인 정보를 묻는 질문에는 주의를 기울여주세요."},
"showBlocksHeader":function(d){return "블럭 보이기"},
"showCodeHeader":function(d){return "코드 보기"},
"showGeneratedCode":function(d){return "코드 보기"},
"showTextHeader":function(d){return "텍스트 표시"},
"showToolbox":function(d){return "도구 상자 보이기"},
"showVersionsHeader":function(d){return "버전 히스토리"},
"signup":function(d){return "샘플 코스를 위해 가입하기"},
"stringEquals":function(d){return "문장=?"},
"submit":function(d){return "제출하기"},
"submitYourProject":function(d){return "프로젝트 제출"},
"submitYourProjectConfirm":function(d){return "프로젝트를 제출한 후에는 편집할 수 없습니다. 제출하시겠습니까?"},
"unsubmit":function(d){return "제출 취소"},
"unsubmitYourProject":function(d){return "프로젝트 제출 취소"},
"unsubmitYourProjectConfirm":function(d){return "프로젝트 제출 취소를 하면 제출했던 날짜가 지워집니다. 제출 취소를 진행할까요?"},
"subtitle":function(d){return "비주얼 프로그래밍 환경"},
"syntaxErrorMsg":function(d){return "프로그램에 오타가 있습니다. "+common_locale.v(d,"lineNumber")+" 줄을 지우고 다시 시도해 보세요."},
"textVariable":function(d){return "문장"},
"toggleBlocksErrorMsg":function(d){return "블록으로 보여지기 전에 오류를 수정해야 합니다."},
"tooFewBlocksMsg":function(d){return "퍼즐을 해결하기 위해 필요한 블럭 종류는 모두 사용했지만, 이런 종류의 블럭들을 더 사용해 보세요."},
"tooManyBlocksMsg":function(d){return "이 퍼즐은  <x id='START_SPAN'/><x id='END_SPAN'/> 블럭들을 사용해 해결할 수 있습니다."},
"tooMuchWork":function(d){return "작업을 너무 많이 해야 되요! 더 적게 반복하는 방법은 없을까요?"},
"toolboxHeader":function(d){return "blocks"},
"toolboxHeaderDroplet":function(d){return "도구 상자"},
"totalNumLinesOfCodeWritten":function(d){return "지금까지: 코드 "+common_locale.p(d,"numLines",0,"ko",{"one":"1 line","other":common_locale.n(d,"numLines")+" 줄"})+" 사용."},
"tryAgain":function(d){return "다시 시도"},
"tryBlocksBelowFeedback":function(d){return "아래 블록들 중 하나를 사용해보세요:"},
"tryHOC":function(d){return "Hour of Code 해보기"},
"unnamedFunction":function(d){return "이름이 없는 변수나 함수가 있습니다. 모든 것에 적당한 표현의 이름을 주는 것을 잊지 마세요."},
"wantToLearn":function(d){return "코드(code)를 배워볼까요?"},
"watchVideo":function(d){return "비디오 보기"},
"when":function(d){return "~할 때"},
"whenRun":function(d){return "실행하면"},
"workspaceHeaderShort":function(d){return "작업 영역: "},
"hintPrompt":function(d){return "Need help?"},
"hintReviewTitle":function(d){return "Review Your Hints"},
"hintSelectInstructions":function(d){return "Instructions and old hints"},
"hintSelectNewHint":function(d){return "Get a new hint"}};