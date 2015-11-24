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
"and":function(d){return "và"},
"backToPreviousLevel":function(d){return "Chơi lại màn trước"},
"blocklyMessage":function(d){return "Blockly"},
"blocks":function(d){return "khối"},
"booleanFalse":function(d){return "sai"},
"booleanTrue":function(d){return "đúng"},
"catActions":function(d){return "Các hành động"},
"catColour":function(d){return "Màu sắc"},
"catLists":function(d){return "Danh sách"},
"catLogic":function(d){return "Logic"},
"catLoops":function(d){return "Vòng lặp"},
"catMath":function(d){return "thuật toán"},
"catProcedures":function(d){return "Các hàm"},
"catText":function(d){return "văn bản"},
"catVariables":function(d){return "Các biến"},
"clearPuzzle":function(d){return "Bắt đầu lại"},
"clearPuzzleConfirm":function(d){return "Cái này sẽ cài đặt lại bảng đố lắp hình trong tình trạng bắt đầu và xoá tất cả các khối bạn đã thêm vào hay đã thay đổi"},
"clearPuzzleConfirmHeader":function(d){return "Bạn có chắc bạn muốn bắt đầu lại?"},
"codeMode":function(d){return "Mã"},
"codeTooltip":function(d){return "Xem mã \"JavaScript\" đã được tạo ra."},
"completedWithoutRecommendedBlock":function(d){return "Chúc mừng! Bạn đã hoàn thành câu đố "+common_locale.v(d,"puzzleNumber")+".(Nhưng bạn có thể dùng khối khác để lập trình tốt hơn.)"},
"continue":function(d){return "Tiếp tục"},
"defaultTwitterText":function(d){return "Hãy xem thử ứng dụng tôi vừa tạo"},
"designMode":function(d){return "Thiết kế"},
"dialogCancel":function(d){return "Huỷ"},
"dialogOK":function(d){return "Đồng ý"},
"directionEastLetter":function(d){return "Đông"},
"directionNorthLetter":function(d){return "Bắc"},
"directionSouthLetter":function(d){return "Nam"},
"directionWestLetter":function(d){return "Tây"},
"dropletBlock_addOperator_description":function(d){return "Cộng hai số"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Thêm người điều hành"},
"dropletBlock_andOperator_description":function(d){return "Logical AND of two booleans"},
"dropletBlock_andOperator_signatureOverride":function(d){return "AND boolean operator"},
"dropletBlock_assign_x_description":function(d){return "Assigns a value to an existing variable. For example, x = 0;"},
"dropletBlock_assign_x_param0":function(d){return "x"},
"dropletBlock_assign_x_param0_description":function(d){return "The variable name being assigned to"},
"dropletBlock_assign_x_param1":function(d){return "value"},
"dropletBlock_assign_x_param1_description":function(d){return "The value the variable is being assigned to."},
"dropletBlock_assign_x_signatureOverride":function(d){return "Assign a variable"},
"dropletBlock_callMyFunction_description":function(d){return "Calls a named function that takes no parameters"},
"dropletBlock_callMyFunction_n_description":function(d){return "Calls a named function that takes one or more parameters"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Call a function with parameters"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Gọi một hàm"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "Create a variable and initialize it as an array"},
"dropletBlock_declareAssign_x_array_1_4_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_array_1_4_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_array_1_4_param1":function(d){return "1,2,3,4"},
"dropletBlock_declareAssign_x_array_1_4_param1_description":function(d){return "The initial values to the array"},
"dropletBlock_declareAssign_x_array_1_4_signatureOverride":function(d){return "Declare a variable assigned to an array"},
"dropletBlock_declareAssign_x_description":function(d){return "Create a variable for the first time"},
"dropletBlock_declareAssign_x_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_param1":function(d){return "0"},
"dropletBlock_declareAssign_x_param1_description":function(d){return "The initial value of the variable"},
"dropletBlock_declareAssign_x_prompt_description":function(d){return "Create a variable and assign it a value by displaying a prompt"},
"dropletBlock_declareAssign_x_prompt_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_prompt_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_prompt_param1":function(d){return "\"Enter value\""},
"dropletBlock_declareAssign_x_prompt_param1_description":function(d){return "The string the user will see in the pop up when asked to enter a value"},
"dropletBlock_declareAssign_x_prompt_signatureOverride":function(d){return "Prompt the user for a value and store it"},
"dropletBlock_declareAssign_x_promptNum_description":function(d){return "Declares that the code will now use a variable and assign it an initial numerical value provided by the user"},
"dropletBlock_declareAssign_x_promptNum_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_promptNum_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_promptNum_param1":function(d){return "\"Enter value\""},
"dropletBlock_declareAssign_x_promptNum_param1_description":function(d){return "The string the user will see in the pop up when asked to enter a value"},
"dropletBlock_declareAssign_x_promptNum_signatureOverride":function(d){return "Prompt the user for a numerical value and store it"},
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "Declare a variable"},
"dropletBlock_declareNoAssign_x_description":function(d){return "Declares a variable with the given name after 'var'"},
"dropletBlock_declareNoAssign_x_signatureOverride":function(d){return "Declare a variable"},
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
"dropletBlock_mathRandom_description":function(d){return "Trả về một số ngẫu nhiên khác nhau, từ 0 (bao gồm) trở lên nhưng không bao gồm 1 (đặc biệt)"},
"dropletBlock_mathRandom_signatureOverride":function(d){return "Math.Random()"},
"dropletBlock_mathRound_description":function(d){return "Round to the nearest integer"},
"dropletBlock_mathRound_param0":function(d){return "x"},
"dropletBlock_mathRound_param0_description":function(d){return "An arbitrary number."},
"dropletBlock_mathRound_signatureOverride":function(d){return "Math.round(x)"},
"dropletBlock_multiplyOperator_description":function(d){return "Multiply two numbers"},
"dropletBlock_multiplyOperator_signatureOverride":function(d){return "Multiply operator"},
"dropletBlock_notOperator_description":function(d){return "Logical NOT of a boolean"},
"dropletBlock_notOperator_signatureOverride":function(d){return "AND boolean operator"},
"dropletBlock_orOperator_description":function(d){return "Logical OR of two booleans"},
"dropletBlock_orOperator_signatureOverride":function(d){return "OR boolean operator"},
"dropletBlock_randomNumber_min_max_description":function(d){return "Returns a random number ranging from the first number (min) to the second number (max), including both numbers in the range"},
"dropletBlock_randomNumber_param0":function(d){return "min"},
"dropletBlock_randomNumber_param0_description":function(d){return "Số nhỏ nhất trả lại"},
"dropletBlock_randomNumber_param1":function(d){return "tối đa"},
"dropletBlock_randomNumber_param1_description":function(d){return "Số lớn nhất trả lại"},
"dropletBlock_randomNumber_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_return_description":function(d){return "Return a value from a function"},
"dropletBlock_return_signatureOverride":function(d){return "trở lại"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_subtractOperator_description":function(d){return "Subtract two numbers"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"emptyBlockInFunction":function(d){return "Hàm "+common_locale.v(d,"name")+" có một đầu vào chưa được điền."},
"emptyBlockInVariable":function(d){return "Biến "+common_locale.v(d,"name")+" có một đầu vào chưa được điền."},
"emptyBlocksErrorMsg":function(d){return "Miếng ghép được \"Lặp lại\" hay \"Nếu\" cần có những miếng ghép bên trong để hoạt động. Đảm bảo là miếng gạch đó khớp hoàn toàn phần ở trong của miếng gạch kia."},
"emptyExampleBlockErrorMsg":function(d){return "Bạn cần ít nhất một ví dụ về hàm "+common_locale.v(d,"functionName")+". Hãy chắc chắn mỗi ví dụ có một lần gọi hàm và một kết quả."},
"emptyFunctionBlocksErrorMsg":function(d){return "Khối \"hàm\"  cần có các khối lệnh bên trong để khiến nó hoạt động."},
"emptyFunctionalBlock":function(d){return "Bạn có một khối với input chưa điền."},
"emptyTopLevelBlock":function(d){return "Không có khối lệnh nào được chạy. Bạn phải kèm một khối lệnh khác vào khối lệnh "+common_locale.v(d,"topLevelBlockName")+"."},
"end":function(d){return "kết thúc"},
"errorEmptyFunctionBlockModal":function(d){return "Cần các khối bên trong định nghĩa về chức năng của bạn. Chọn \"Chỉnh sửa\" và đặt các khối bên trong khối màu xanh lá cây."},
"errorIncompleteBlockInFunction":function(d){return "Chọn \"Chỉnh sửa\" để đảm bảo rằng bạn không thiếu khối nào trong định nghĩa chức năng của bạn."},
"errorParamInputUnattached":function(d){return "Hãy nhớ đính một khối vào mỗi thông số input trên khối chức năng trong không gian làm việc của bạn."},
"errorQuestionMarksInNumberField":function(d){return "Thử thay thế \"???\" với một giá trị."},
"errorRequiredParamsMissing":function(d){return "Thiết lập một tham số cho các chức năng của bạn bằng cách nhấp vào \"chỉnh sửa\" và thêm các tham số cần thiết. Kéo các khối tham số mới vào định nghĩa chức năng của bạn."},
"errorUnusedFunction":function(d){return "Bạn vừa thiết lập một chức năng, nhưng chưa bao giờ sử dụng nó trong không gian làm việc của bạn! Nhấn vào \"Chức năng\" trong hộp công cụ và đảm bảo rằng bạn sẽ sử dụng nó trong chương trình của bạn."},
"errorUnusedParam":function(d){return "Bạn thêm một khối tham số, nhưng đã không sử dụng nó trong định nghĩa. Đảm bảo rằng bạn sử dụng tham số của bạn bằng cách nhấp vào \"chỉnh sửa\" và đặt khối tham số bên trong các khối màu xanh lá cây."},
"exampleErrorMessage":function(d){return "Hàm "+common_locale.v(d,"functionName")+" có một hoặc nhiều ví dụ mà cần chỉnh sửa. Hãy đảm bảo chúng khớp với định nghĩa của bạn và trả lời câu hỏi."},
"examplesFailedOnClose":function(d){return "Một hay nhiều ví dụ của bạn không khớp với định nghĩa của bạn. Kiểm tra ví dụ của bạn trước khi đóng"},
"extraTopBlocks":function(d){return "Bạn có các khối lệnh chưa được đính kèm."},
"extraTopBlocksWhenRun":function(d){return "Bạn có các khối lệnh chưa được đính kèm. Bạn định đính kèm chúng vào khối lệnh \"when run\"?"},
"finalStage":function(d){return "Chúc mừng. Bạn vừa hoàn thành xong bước cuối cùng."},
"finalStageTrophies":function(d){return "Chúc mừng! Bạn vừa hoàn thành bước cuối cùng và dành danh hiệu "+common_locale.p(d,"numTrophies",0,"vi",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+"."},
"finish":function(d){return "Hoàn Thành"},
"generatedCodeInfo":function(d){return "Các trường đại học hàng đầu cũng dạy lập trình dựa trên \"khối lệnh\" (block) (như: "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+"). Tuy nhiên, để hổ trợ, các \"khối lệnh\" cũng được hiển thị trong ngôn ngữ JavaScript, ngôn ngữ lập trình thông dụng nhất:"},
"hashError":function(d){return "Xin lỗi, '%1' không tương ứng với bất kì chương trình đã lưu."},
"help":function(d){return "Trợ Giúp"},
"hideToolbox":function(d){return "(Ẩn)"},
"hintHeader":function(d){return "Đây là một số mẹo:"},
"hintRequest":function(d){return "Xem gợi ý"},
"hintTitle":function(d){return "Gợi ý:"},
"ignore":function(d){return "Bỏ qua"},
"infinity":function(d){return "Vô cùng"},
"jump":function(d){return "nhảy"},
"keepPlaying":function(d){return "Tiếp tục chơi"},
"levelIncompleteError":function(d){return "Bạn đã dùng tất cả các khối cần thiết, nhưng không đúng cách."},
"listVariable":function(d){return "danh sách"},
"makeYourOwnFlappy":function(d){return "Tự tạo game Flappy Bird của riêng bạn"},
"missingRecommendedBlocksErrorMsg":function(d){return "Không chính xác lắm. Hãy thử sử dụng một khối bạn chưa sử dụng."},
"missingRequiredBlocksErrorMsg":function(d){return "Không chính xác lắm. Bạn phải sử dụng một khối bạn chưa sử dụng."},
"nestedForSameVariable":function(d){return "You're using the same variable inside two or more nested loops. Use unique variable names to avoid infinite loops."},
"nextLevel":function(d){return "Chúc mừng! Bạn đã hoàn thành câu số "+common_locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Chúc mừng! Bạn đã hoàn thành Câu đố "+common_locale.v(d,"puzzleNumber")+" và chiến thắng "+common_locale.v(d,"numTrophies")+"."},
"nextPuzzle":function(d){return "Câu đố tiếp theo"},
"nextStage":function(d){return "Chúc mừng! Bạn đã hoàn thành xong "+common_locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Chúc mừng! Bạn đã vượt qua vòng "+common_locale.v(d,"stageName")+" và giành được "+common_locale.p(d,"numTrophies",0,"vi",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+"."},
"numBlocksNeeded":function(d){return "Chúc mừng! Bạn đã hoàn thành câu đố "+common_locale.v(d,"puzzleNumber")+". Nhưng bạn thật sự chỉ cần "+common_locale.p(d,"numBlocks",0,"vi",{"one":"1 block","other":common_locale.n(d,"numBlocks")+" blocks"})+" khối thôi ."},
"numLinesOfCodeWritten":function(d){return "Bạn vừa mới viết "+common_locale.p(d,"numLines",0,"vi",{"one":"1 dòng","other":common_locale.n(d,"numLines")+" dòng"})+" mã!"},
"openWorkspace":function(d){return "Hoạt động ra sao"},
"orientationLock":function(d){return "Tắt khóa hướng trong cài đặt thiết bị."},
"play":function(d){return "Bắt đầu chơi"},
"print":function(d){return "In"},
"puzzleTitle":function(d){return "Câu đố thứ "+common_locale.v(d,"puzzle_number")+" trong số "+common_locale.v(d,"stage_total")+" câu"},
"readonlyWorkspaceHeader":function(d){return "Chỉ để xem:"},
"repeat":function(d){return "lặp lại"},
"resetProgram":function(d){return "Thiết lập lại"},
"rotateText":function(d){return "Xoay thiết bị của bạn."},
"runProgram":function(d){return "Chạy"},
"runTooltip":function(d){return "Chạy chương trình được thiết kế bởi các khối lệnh trong khung làm việc."},
"runtimeErrorMsg":function(d){return "Your program did not run successfully. Please remove line "+common_locale.v(d,"lineNumber")+" and try again."},
"saveToGallery":function(d){return "Lưu vào bộ sưu tập"},
"savedToGallery":function(d){return "Đã lưu trong bộ sưu tập!"},
"score":function(d){return "Ghi điểm/điểm số"},
"shareFailure":function(d){return "Xin lỗi, chúng tôi không chia sẻ chương trình này."},
"shareWarningsAge":function(d){return "Please provide your age below and click OK to continue."},
"shareWarningsMoreInfo":function(d){return "More Info"},
"shareWarningsStoreData":function(d){return "This app built on Code Studio stores data that could be viewed by anyone with this sharing link, so be careful if you are asked to provide personal information."},
"showBlocksHeader":function(d){return "Hiển thị khối"},
"showCodeHeader":function(d){return "Xem mã"},
"showGeneratedCode":function(d){return "Xem mã"},
"showTextHeader":function(d){return "Hiển thị văn bản"},
"showToolbox":function(d){return "Hiển thị hộp công cụ"},
"showVersionsHeader":function(d){return "Lược sử Phiên bản"},
"signup":function(d){return "Đăng ký cho khóa học mở đầu"},
"stringEquals":function(d){return "Chuỗi =?"},
"submit":function(d){return "Chấp nhận"},
"submitYourProject":function(d){return "Submit your project"},
"submitYourProjectConfirm":function(d){return "You cannot edit your project after submitting it, really submit?"},
"unsubmit":function(d){return "Unsubmit"},
"unsubmitYourProject":function(d){return "Unsubmit your project"},
"unsubmitYourProjectConfirm":function(d){return "Unsubmitting your project will reset the submitted date, really unsubmit?"},
"subtitle":function(d){return "một môi trường lập trình trực quan"},
"syntaxErrorMsg":function(d){return "Your program contains a typo. Please remove line "+common_locale.v(d,"lineNumber")+" and try again."},
"textVariable":function(d){return "văn bản"},
"toggleBlocksErrorMsg":function(d){return "Bạn cần phải sửa một lỗi trong chương trình của bạn trước khi nó được hiển thị thành các khối."},
"tooFewBlocksMsg":function(d){return "Bạn đang sử dụng tất cả các loại khối lệnh cần thiết, nhưng hãy thử sử dụng các loại khối lệnh khác để hoàn thành câu đố."},
"tooManyBlocksMsg":function(d){return "Câu đố này có thể được giải quyết với <x id='START_SPAN'/><x id='END_SPAN'/> khối lệnh."},
"tooMuchWork":function(d){return "Bạn làm tôi phải làm quá nhiều việc! Bạn làm ơn thử làm cho nó ít hơn được không?"},
"toolboxHeader":function(d){return "các khối"},
"toolboxHeaderDroplet":function(d){return "Hộp công cụ"},
"totalNumLinesOfCodeWritten":function(d){return "Thời gian tổng cộng: "+common_locale.p(d,"numLines",0,"vi",{"one":"1 dòng","other":common_locale.n(d,"numLines")+" dòng"})+" của mã chương trình."},
"tryAgain":function(d){return "Thử lại"},
"tryBlocksBelowFeedback":function(d){return "Try using one of the blocks below:"},
"tryHOC":function(d){return "Học thử Hour of Code"},
"unnamedFunction":function(d){return "Bạn có một biến hoặc hàm mà chưa có tên. Đừng quên đặt cho mọi thứ một cái tên một cái tên mô tả nó."},
"wantToLearn":function(d){return "Bạn muốn học lập trình?"},
"watchVideo":function(d){return "Xem Video"},
"when":function(d){return "Khi nào"},
"whenRun":function(d){return "Khi chạy"},
"workspaceHeaderShort":function(d){return "Không gian làm việc:"}};