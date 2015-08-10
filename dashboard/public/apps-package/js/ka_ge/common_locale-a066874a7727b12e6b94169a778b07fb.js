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
"and":function(d){return "და"},
"backToPreviousLevel":function(d){return "წინა დონეზე დაბრუნება"},
"blocklyMessage":function(d){return "Blockly"},
"blocks":function(d){return "ბლოკები"},
"booleanFalse":function(d){return "მცდარი"},
"booleanTrue":function(d){return "ჭეშმარიტი"},
"catActions":function(d){return "მოქმედებები"},
"catColour":function(d){return "ფერი"},
"catLists":function(d){return "სიები"},
"catLogic":function(d){return "ლოგიკა"},
"catLoops":function(d){return "ციკლები"},
"catMath":function(d){return "მათემატიკა"},
"catProcedures":function(d){return "ფუნქციები"},
"catText":function(d){return "ტექსტი"},
"catVariables":function(d){return "ცვლადები"},
"clearPuzzle":function(d){return "ხელახლა დაწყება"},
"clearPuzzleConfirm":function(d){return "ეს თავსატეხს საწყის მდგომარეობაში დააბრუნებს და წაშლის ყველა ბლოკს რომელიც დაამატე ან შეცვალე."},
"clearPuzzleConfirmHeader":function(d){return "დარწმუნებული ხარ, რომ გსურს ხელახლა დაწყება?"},
"codeMode":function(d){return "კოდი"},
"codeTooltip":function(d){return "შექმნილი JavaScript კოდის ნახვა."},
"continue":function(d){return "გაგრძელება"},
"defaultTwitterText":function(d){return "ნახეთ, რა გავაკეთე"},
"designMode":function(d){return "დიზაინი"},
"dialogCancel":function(d){return "გაუქმება"},
"dialogOK":function(d){return "OK"},
"directionEastLetter":function(d){return "E"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionWestLetter":function(d){return "W"},
"dropletBlock_addOperator_description":function(d){return "Add two numbers"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Add operator"},
"dropletBlock_andOperator_description":function(d){return "Logical AND of two booleans"},
"dropletBlock_andOperator_signatureOverride":function(d){return "AND boolean operator"},
"dropletBlock_assign_x_description":function(d){return "Reassign a variable"},
"dropletBlock_assign_x_param0":function(d){return "x"},
"dropletBlock_assign_x_param0_description":function(d){return "The variable name being assigned to"},
"dropletBlock_assign_x_param1":function(d){return "value"},
"dropletBlock_assign_x_param1_description":function(d){return "The value the variable is being assigned to."},
"dropletBlock_assign_x_signatureOverride":function(d){return "Assign a variable"},
"dropletBlock_callMyFunction_description":function(d){return "Use a function without an argument"},
"dropletBlock_callMyFunction_n_description":function(d){return "Use a function with argument"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Call a function with parameters"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Call a function"},
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
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "Declare a variable"},
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
"dropletBlock_functionParams_n_description":function(d){return "Create a function with an argument"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "Function with a Parameter"},
"dropletBlock_functionParams_none_description":function(d){return "Create a function without an argument"},
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
"dropletBlock_randomNumber_max_description":function(d){return "Get a random number between 0 and the specified maximum value"},
"dropletBlock_randomNumber_max_param0":function(d){return "max"},
"dropletBlock_randomNumber_max_param0_description":function(d){return "The maximum number returned"},
"dropletBlock_randomNumber_max_signatureOverride":function(d){return "randomNumber(max)"},
"dropletBlock_randomNumber_min_max_description":function(d){return "Get a random number between the specified minimum and maximum values"},
"dropletBlock_randomNumber_min_max_param0":function(d){return "min"},
"dropletBlock_randomNumber_min_max_param0_description":function(d){return "The minimum number returned"},
"dropletBlock_randomNumber_min_max_param1":function(d){return "max"},
"dropletBlock_randomNumber_min_max_param1_description":function(d){return "The maximum number returned"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_return_description":function(d){return "Return a value from a function"},
"dropletBlock_return_signatureOverride":function(d){return "return"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_subtractOperator_description":function(d){return "Subtract two numbers"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"emptyBlocksErrorMsg":function(d){return "\"გამეორების\" ან \"if\" ბლოკმა რომ იმუშაოს, საჭიროა მასში სხვა ბლოკი იყოს. დარწმუნდი, რომ შიდა ბლოკი კარგად თავსდება სათავსო ბლოკში."},
"emptyBlockInFunction":function(d){return "ფუნქცია "+common_locale.v(d,"name")+"-ში ცარიელი ველია."},
"emptyBlockInVariable":function(d){return "ცვლად "+common_locale.v(d,"name")+"-ში ცარიელი ველია."},
"emptyExampleBlockErrorMsg":function(d){return "You need at least one example in function "+common_locale.v(d,"functionName")+". Make sure each example has a call and a result."},
"emptyFunctionBlocksErrorMsg":function(d){return "ფუნქციის ბლოკმა რომ იმუშაოს, საჭიროა მასში სხვა ბლოკი იყოს მოთავსებული."},
"emptyFunctionalBlock":function(d){return "თქვენ გაქვთ ბლოკი შეუვსებელი ველით."},
"emptyTopLevelBlock":function(d){return "გასაშვები ბლოკები არ არის. საჭროა ბლოკი "+common_locale.v(d,"topLevelBlockName")+" ბლოკს დაუკავშირო."},
"end":function(d){return "ბოლო"},
"errorEmptyFunctionBlockModal":function(d){return "შენი ფუნქციის განმარტებაში საჭიროა ბლოკი იყოს. დააჭირე \"ჩასწორება\"-ს და გადაიტანე ბლოკები მწვანე ბლოკში."},
"errorIncompleteBlockInFunction":function(d){return "დააჭირე \"ჩასწორება\"-ს რათა დარწმუნდე, რომ ბლოკები ფუნქციის განმარტებაში არ გამოგრჩენია."},
"errorParamInputUnattached":function(d){return "დაიმახსოვრე რომ შენს სამუშაო სივრცეში ფუნქციის ბლოკის თითოეულ input პარამეტრს ბლოკი დაუკავშირო."},
"errorQuestionMarksInNumberField":function(d){return "სცადეთ შეცვალოთ \"???\" რაიმე მნიშვნელობით."},
"errorRequiredParamsMissing":function(d){return "შექმენი პარამეტრი შენი ფუქნციისთვის \"ჩასწორება\"-ზე დაჭერით და საჭირო პარამეტრების დამატებით. გადაიტანე ახალი პარამეტრის ბლოკები შენი ფუნქციის განმარტებაში."},
"errorUnusedFunction":function(d){return "შენ შექმენი ფუნქცია, მაგრამ შენს სამუშაო სივრცეში არ გამოგიყენებია! დააჭირე \"ფუნქციები\"-ს ინსტრუმენტების პანელზე და გამოიყენე ის შენს პროგრამაში."},
"errorUnusedParam":function(d){return "შენ დაამატე პარამეტრის ბლოკი მაგრამ განმარტებაში არ გამოგიყენებია. დარწმუნდი რომ იყენებ შენს პარამეტრს \"ჩასწორება\"-ზე დაჭერით და პარამეტრის ბლოკის მწვანე ბლოკში მოთავსებით."},
"exampleErrorMessage":function(d){return "The function "+common_locale.v(d,"functionName")+" has one or more examples that need adjusting. Make sure they match your definition and answer the question."},
"extraTopBlocks":function(d){return "შენ დაუკავშირებელი ბლოკები გაქვს."},
"extraTopBlocksWhenRun":function(d){return "შენ დაუკავშირებელი ბლოკები გაქვს. ხომ არ გინდოდა მათი \"შესრულებისას\" ბლოკთან დაკავშირება?"},
"finalStage":function(d){return "გილოცავ! შენ შეასრულე საბოლოო ნაბიჯი."},
"finalStageTrophies":function(d){return "გილოცავ! შენ შეასრულე საბოლოო ნაბიჯი და მოიგე "+common_locale.p(d,"numTrophies",0,"en",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+"."},
"finish":function(d){return "დასრულება"},
"generatedCodeInfo":function(d){return "ბლოკებზე დაფუძნებული პროგრამირება საუკეთესო უნივერსიტეტებშიც კი ისწავლება (მაგალითად, "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+"). მაგრამ რეალურად ბლოკების ჩვენება, რომლებიც ააწყვე, ასევე მსოფლიოს ყველაზე ფართოდ გამოყენებად პროგრამირების ენაში, JavaScript-შიც შეიძლება:"},
"genericFeedback":function(d){return "ნახე როგორ დაასრულე და ეცადე გაასწორო შენი პროგრამა."},
"hashError":function(d){return "ბოდიში, '%1' არ შეესაბამება არცერთ შენახულ პროგრამას."},
"help":function(d){return "დახმარება"},
"hideToolbox":function(d){return "(დამალვა)"},
"hintHeader":function(d){return "რჩევა:"},
"hintRequest":function(d){return "იხილეთ მინიშნება"},
"hintTitle":function(d){return "მინიშნება:"},
"infinity":function(d){return "უსასრულობა"},
"jump":function(d){return "ახტომა"},
"keepPlaying":function(d){return "განაგრძე თამაში"},
"levelIncompleteError":function(d){return "იყენებ ყველა საჭირო ტიპის ბლოკს, მაგრამ არასწორად."},
"listVariable":function(d){return "სია"},
"makeYourOwnFlappy":function(d){return "შექმენი საკუთარი Flappy თამაში"},
"missingBlocksErrorMsg":function(d){return "სცადე ერთი ან მეტი ქვემოთ მოცემული ბლოკი რომ ამოხსნა თავსატეხი."},
"nextLevel":function(d){return "გილოცავ! შენ დაასრულე თავსატეხი "+common_locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "გილოცავ! შენ დაასრულე თავსატეხი "+common_locale.v(d,"puzzleNumber")+" და მოიგე "+common_locale.p(d,"numTrophies",0,"en",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+"."},
"nextPuzzle":function(d){return "შემდეგი თავსატეხი"},
"nextStage":function(d){return "გილოცავ! შენ დაასრულე "+common_locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "გილოცავ! შენ დაასრულე "+common_locale.v(d,"stageName")+" და მოიგე "+common_locale.p(d,"numTrophies",0,"en",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+"."},
"numBlocksNeeded":function(d){return "გილოცავთ! თქვენ დაასრულეთ თავსატეხი "+common_locale.v(d,"puzzleNumber")+". (თუმცა, შეგეძლოთ მხოლოდ "+common_locale.p(d,"numBlocks",0,"en",{"one":"1 block","other":common_locale.n(d,"numBlocks")+" blocks"})+" გამოგეყენებინათ.)"},
"numLinesOfCodeWritten":function(d){return "შენ ახლა დაწერე "+common_locale.p(d,"numLines",0,"en",{"one":"1 line","other":common_locale.n(d,"numLines")+" lines"})+" კოდი!"},
"openWorkspace":function(d){return "როგორ მუშაობს"},
"orientationLock":function(d){return "გამორთე ორიენტაციის ბლოკი მოწყობილობების პარამეტრებში."},
"play":function(d){return "თამაში"},
"print":function(d){return "დაბეჭდვა"},
"puzzleTitle":function(d){return common_locale.v(d,"puzzle_number")+" თავსატეხი "+common_locale.v(d,"stage_total")+"-დან"},
"readonlyWorkspaceHeader":function(d){return "იხილეთ მხოლოდ: "},
"repeat":function(d){return "გამეორება"},
"resetProgram":function(d){return "საწყისი მდგომარეობა"},
"rotateText":function(d){return "მოაბრუნე შენი მოწყობილობა."},
"runProgram":function(d){return "შესრულება"},
"runTooltip":function(d){return "გაუშვი ბლოკებით განსაზღვრული პროგრამა სამუშაო სივრცეში."},
"saveToGallery":function(d){return "გალერეაში შენახვა"},
"savedToGallery":function(d){return "შენახულია გალერეაში!"},
"score":function(d){return "ქულა"},
"shareFailure":function(d){return "ბოდიში, ამ პროგრამის გაზიარება არ შეგვიძლია."},
"showBlocksHeader":function(d){return "ბლოკების ჩვენება"},
"showCodeHeader":function(d){return "კოდის ჩვენება"},
"showGeneratedCode":function(d){return "კოდის ჩვენება"},
"showTextHeader":function(d){return "ტექსტის ჩვენება"},
"showToolbox":function(d){return "ინსტრუმენტების პანელის ჩვენება"},
"signup":function(d){return "დარეგისტრირდი შესავალ კურსზე"},
"stringEquals":function(d){return "string=?"},
"subtitle":function(d){return "პროგრამირების ვიზუალური გარემო"},
"textVariable":function(d){return "ტექსტი"},
"toggleBlocksErrorMsg":function(d){return "შესაძლო რომ იყოს კოდის ბლოკად წარმოჩენა, საჭიროა მასში შეცდომა შეასწორო."},
"tooFewBlocksMsg":function(d){return "შენ იყენებ ყველა საჭირო ტიპის ბლოკს, მაგრამ სცადე უფრო მეტი ასეთი ტიპის ბლოკების გამოყენება რათა დაასრულო თავსატეხი."},
"tooManyBlocksMsg":function(d){return "ამ თავსატეხის ამოხსნა შეიძლება <x id='START_SPAN'/><x id='END_SPAN'/> ბლოკებით."},
"tooMuchWork":function(d){return "ბევრი მამუშავე! შეგიძლია ახლა შენ სცადო რამდენჯერმე გამეორება?"},
"toolboxHeader":function(d){return "ბლოკები"},
"toolboxHeaderDroplet":function(d){return "ინსტრუმენტების პანელი"},
"totalNumLinesOfCodeWritten":function(d){return "სრული რაოდენობა: კოდის "+common_locale.p(d,"numLines",0,"en",{"one":"1 line","other":common_locale.n(d,"numLines")+" lines"})+"."},
"tryAgain":function(d){return "ხელახლა ცდა"},
"tryHOC":function(d){return "სცადე კოდის საათი"},
"unnamedFunction":function(d){return "You have a variable or function that does not have a name. Don't forget to give everything a descriptive name."},
"wantToLearn":function(d){return "გსურთ ისწავლოთ პროგრამირება?"},
"watchVideo":function(d){return "უყურე ვიდეოს"},
"when":function(d){return "როდის"},
"whenRun":function(d){return "გაშვებისას"},
"workspaceHeaderShort":function(d){return "სამუშაო სივრცე: "}};