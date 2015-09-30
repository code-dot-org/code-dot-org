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
"and":function(d){return "a"},
"backToPreviousLevel":function(d){return "Zpět na předchozí úroveň"},
"blocklyMessage":function(d){return "Blockly"},
"blocks":function(d){return "bloky"},
"booleanFalse":function(d){return "záporné"},
"booleanTrue":function(d){return "pravda"},
"catActions":function(d){return "Akce"},
"catColour":function(d){return "Barva"},
"catLists":function(d){return "Seznamy"},
"catLogic":function(d){return "Logika"},
"catLoops":function(d){return "Smyčky"},
"catMath":function(d){return "Matematika"},
"catProcedures":function(d){return "Funkce"},
"catText":function(d){return "text"},
"catVariables":function(d){return "Proměnné"},
"clearPuzzle":function(d){return "Začít znovu"},
"clearPuzzleConfirm":function(d){return "Toto obnoví hádanku do jejího původního stavu a odstraní všechny bloky, které jste přidali nebo změnili."},
"clearPuzzleConfirmHeader":function(d){return "Jste si jisti, že chcete začít znovu?"},
"codeMode":function(d){return "Kód"},
"codeTooltip":function(d){return "Zobrazit vygenerovaný kód JavaScriptu."},
"continue":function(d){return "Pokračovat"},
"defaultTwitterText":function(d){return "Check out what I made"},
"designMode":function(d){return "Návrh"},
"dialogCancel":function(d){return "Storno"},
"dialogOK":function(d){return "OK"},
"directionEastLetter":function(d){return "V"},
"directionNorthLetter":function(d){return "S"},
"directionSouthLetter":function(d){return "J"},
"directionWestLetter":function(d){return "Z"},
"dropletBlock_addOperator_description":function(d){return "Sečti dvě čísla"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Přidej operátor"},
"dropletBlock_andOperator_description":function(d){return "Vrátí hodnotu pravda pouze v případě, že oba výrazy jsou pravdivé nebo oba nepravdvé"},
"dropletBlock_andOperator_signatureOverride":function(d){return "A logický operátor"},
"dropletBlock_assign_x_description":function(d){return "Přiřadí hodnotu existující proměnné. Například, x = 0;"},
"dropletBlock_assign_x_param0":function(d){return "x"},
"dropletBlock_assign_x_param0_description":function(d){return "The variable name being assigned to"},
"dropletBlock_assign_x_param1":function(d){return "value"},
"dropletBlock_assign_x_param1_description":function(d){return "The value the variable is being assigned to."},
"dropletBlock_assign_x_signatureOverride":function(d){return "Přiřaďte proměnnou"},
"dropletBlock_callMyFunction_description":function(d){return "Volá pojmenovanou funkci, která nepotřebuje žádné parametry"},
"dropletBlock_callMyFunction_n_description":function(d){return "Volá pojmenovanou funkci, která potřebuje jeden či více parametrů"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Volá funkci s parametry"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Volat funkci"},
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
"dropletBlock_divideOperator_description":function(d){return "Dělení dvou čísel"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "Operátor dělení"},
"dropletBlock_equalityOperator_description":function(d){return "Test for equality"},
"dropletBlock_equalityOperator_param0":function(d){return "x"},
"dropletBlock_equalityOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_equalityOperator_param1":function(d){return "y"},
"dropletBlock_equalityOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_equalityOperator_signatureOverride":function(d){return "Operátor rovnosti"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "Do something multiple times"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "for loop"},
"dropletBlock_functionParams_n_description":function(d){return "Create a function with an argument"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "Function with a Parameter"},
"dropletBlock_functionParams_none_description":function(d){return "Create a function without an argument"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "Definuj funkci"},
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
"dropletBlock_return_signatureOverride":function(d){return "zpátky"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_subtractOperator_description":function(d){return "Subtract two numbers"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"emptyBlocksErrorMsg":function(d){return "Bloky \"Opakovat\" nebo \"Pokud\" v sobě musí mít další bloky, aby fungovaly. Ujisti se, že vnitřní bloky jsou v pořádku vložené dovnitř vnějších bloků."},
"emptyBlockInFunction":function(d){return "Funkce "+common_locale.v(d,"name")+" má nevyplněné vstupy."},
"emptyBlockInVariable":function(d){return "Proměnná "+common_locale.v(d,"name")+" má nevyplněné vstupy."},
"emptyExampleBlockErrorMsg":function(d){return "You need at least one example in function "+common_locale.v(d,"functionName")+". Make sure each example has a call and a result."},
"emptyFunctionBlocksErrorMsg":function(d){return "Blok funkce v sobě musí obsahovat další bloky."},
"emptyFunctionalBlock":function(d){return "Máš blok s nevyplněným vstupem."},
"emptyTopLevelBlock":function(d){return "Nejsou zde žádné bloky pro spuštění. Musíš připojit blok k bloku "+common_locale.v(d,"topLevelBlockName")+"."},
"end":function(d){return "konec"},
"errorEmptyFunctionBlockModal":function(d){return "Musí být nějaké bloky uvnitř funkce. Klepněte na tlačítko \"Upravit\" a přetáhněte bloky do zeleného bloku."},
"errorIncompleteBlockInFunction":function(d){return "Klepněte na tlačítko \"Upravit\", ujistěte se, že nemáte žádné chybějící bloky uvnitř definice funkce."},
"errorParamInputUnattached":function(d){return "Nezapomeňte připojit blok pro každý vstupní parametr k bloku funkce v pracovním prostoru."},
"errorQuestionMarksInNumberField":function(d){return "Zkuste nahradit \"???\" hodnotou."},
"errorRequiredParamsMissing":function(d){return "Vytvořte parametr pro funkci klepnutím na tlačítko \"Upravit\" a přidáním potřebných parametrů. Přetáhněte nové bloky parametrů do vaší definice funkce."},
"errorUnusedFunction":function(d){return "Vytvořili jste funkci, ale nikdy jste použili v pracovní prostor. Klikněte na \"Funkce\" v panelu a zkontrolujte, zda ji používáte ve vašem programu."},
"errorUnusedParam":function(d){return "Přidán blok parametru, ale nebyl nepoužit v definici. Ujistěte se, že parametr používáte klepnutím na tlačítko \"Upravit\" a uvedením parametru do zeleného bloku."},
"exampleErrorMessage":function(d){return "The function "+common_locale.v(d,"functionName")+" has one or more examples that need adjusting. Make sure they match your definition and answer the question."},
"examplesFailedOnClose":function(d){return "One or more of your examples do not match your definition. Check your examples before closing"},
"extraTopBlocks":function(d){return "Máš nepřipojené bloky."},
"extraTopBlocksWhenRun":function(d){return "Máš nepřipojené bloky. Chtěl si je připojit k bloku \"po spuštění\"?"},
"finalStage":function(d){return "Dobrá práce! Dokončil si poslední fázi."},
"finalStageTrophies":function(d){return "Dobrá práce! Dokončil si poslední fázi a vyhrál "+common_locale.p(d,"numTrophies",0,"cs",{"one":"trofej","other":common_locale.n(d,"numTrophies")+" trofejí"})+"."},
"finish":function(d){return "Dokončit"},
"generatedCodeInfo":function(d){return "Dokonce nejlepší university učí programovat pomocí bloků (např. "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+"). Ale vnitřek bloků, které jsi sestavil, lze zobrazit také v JavaScriptu, světově nejrozšířenějším programovacím jazyce:"},
"genericFeedback":function(d){return "Podívej se jak jsi skončil a zkus svůj program opravit."},
"hashError":function(d){return "Promiň, ale '%1' neodpovídá žádnému uloženému programu."},
"help":function(d){return "Nápověda"},
"hideToolbox":function(d){return "(Skrýt)"},
"hintHeader":function(d){return "Zde je rada:"},
"hintRequest":function(d){return "Viz tip"},
"hintTitle":function(d){return "Tip:"},
"ignore":function(d){return "Ignore"},
"infinity":function(d){return "Nekonečno"},
"jump":function(d){return "skoč"},
"keepPlaying":function(d){return "Hrát dál"},
"levelIncompleteError":function(d){return "Používáš všechny potřebné typy bloků, ale nesprávným způsobem."},
"listVariable":function(d){return "seznam"},
"makeYourOwnFlappy":function(d){return "Vytvoř Si Vlastní Hru Flappy"},
"missingBlocksErrorMsg":function(d){return "Použijte jeden či více bloků k vyřešení těto hádanky."},
"nextLevel":function(d){return "Dobrá práce! Dokončil jsi Hádanku "+common_locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Dobrá práce! Dokončil jsi Hádanku "+common_locale.v(d,"puzzleNumber")+" a vyhrál "+common_locale.p(d,"numTrophies",0,"cs",{"one":"trofej","other":common_locale.n(d,"numTrophies")+" trofeje"})+"."},
"nextPuzzle":function(d){return "Další hádanka"},
"nextStage":function(d){return "Blahopřejeme! Dokončil jsi "+common_locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Blahopřejeme! Dokončil jsi "+common_locale.v(d,"stageName")+" a vyhrál "+common_locale.p(d,"numTrophies",0,"cs",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+"."},
"numBlocksNeeded":function(d){return "Dobrá práce! Dokončil jsi Hádanku "+common_locale.v(d,"puzzleNumber")+". (Ale mohl jsi použít pouze "+common_locale.p(d,"numBlocks",0,"cs",{"one":"1 blok","other":common_locale.n(d,"numBlocks")+" bloků"})+".)"},
"numLinesOfCodeWritten":function(d){return "Už jsi napsal "+common_locale.p(d,"numLines",0,"cs",{"one":"1 řádek","other":common_locale.n(d,"numLines")+" řádků"})+" kódu!"},
"openWorkspace":function(d){return "Jak To Funguje"},
"orientationLock":function(d){return "Vypni uzamčení rotace v nastavení zařízení."},
"play":function(d){return "hrát"},
"print":function(d){return "Tisk"},
"puzzleTitle":function(d){return "Hádanka "+common_locale.v(d,"puzzle_number")+" z "+common_locale.v(d,"stage_total")},
"readonlyWorkspaceHeader":function(d){return "Zobrazení pouze: "},
"repeat":function(d){return "opakuj"},
"resetProgram":function(d){return "Obnovit"},
"rotateText":function(d){return "Otoč své zařízení."},
"runProgram":function(d){return "Spustit"},
"runTooltip":function(d){return "Spustí program definovaný bloky na pracovní ploše."},
"saveToGallery":function(d){return "Uložit do galerie"},
"savedToGallery":function(d){return "Uloženo v galerii!"},
"score":function(d){return "výsledek"},
"shareFailure":function(d){return "Omlouváme se, ale tento program nemůžeme sdílet."},
"showBlocksHeader":function(d){return "Zobrazit bloky"},
"showCodeHeader":function(d){return "Zobrazit kód"},
"showGeneratedCode":function(d){return "Zobrazit kód"},
"showTextHeader":function(d){return "Zobrazit text"},
"showVersionsHeader":function(d){return "Version History"},
"showToolbox":function(d){return "Zobrazit Nástroje"},
"signup":function(d){return "Zaregistruj se do úvodního kurzu"},
"stringEquals":function(d){return "řetězec =?"},
"subtitle":function(d){return "vizuální programovací prostředí"},
"textVariable":function(d){return "text"},
"toggleBlocksErrorMsg":function(d){return "Musíš opravit chybu v tvém programu předtím, než může být zobrazený v blocích."},
"tooFewBlocksMsg":function(d){return "Používáš všechny potřebné bloky, ale zkus použít více těchto bloků pro vyřešení této hádanky."},
"tooManyBlocksMsg":function(d){return "Tato hádanka může být vyřešena pomocí <x id='START_SPAN'/><x id='END_SPAN'/> bloků."},
"tooMuchWork":function(d){return "Přinutil jsi mne udělat spoustu práce! Mohl bys zkusit opakovat méně krát?"},
"toolboxHeader":function(d){return "Bloky"},
"toolboxHeaderDroplet":function(d){return "Nástroje"},
"totalNumLinesOfCodeWritten":function(d){return "Celkově: "+common_locale.p(d,"numLines",0,"cs",{"one":"1 řádek","other":common_locale.n(d,"numLines")+" řádků"})+" kódu."},
"tryAgain":function(d){return "Zkusit znovu"},
"tryHOC":function(d){return "Vyzkoušej Hodinu Programování"},
"unnamedFunction":function(d){return "You have a variable or function that does not have a name. Don't forget to give everything a descriptive name."},
"wantToLearn":function(d){return "Chceš se naučit programovat?"},
"watchVideo":function(d){return "Shlédnout Video"},
"when":function(d){return "když"},
"whenRun":function(d){return "po spuštění"},
"workspaceHeaderShort":function(d){return "Pracovní prostor: "},
"dropletBlock_declareNoAssign_x_description":function(d){return "Declares a variable with the given name after 'var'"},
"dropletBlock_declareNoAssign_x_signatureOverride":function(d){return "Declare a variable"},
"nestedForSameVariable":function(d){return "You're using the same variable inside two or more nested loops. Use unique variable names to avoid infinite loops."},
"submit":function(d){return "Submit"},
"submitYourProject":function(d){return "Submit your project"},
"submitYourProjectConfirm":function(d){return "You cannot edit your project after submitting it, really submit?"}};