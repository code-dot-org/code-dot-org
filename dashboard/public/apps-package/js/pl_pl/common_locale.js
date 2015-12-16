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
"and":function(d){return "i"},
"backToPreviousLevel":function(d){return "Wróć do poprzedniego poziomu"},
"blocklyMessage":function(d){return "Blockly"},
"blocks":function(d){return "bloki"},
"booleanFalse":function(d){return "fałsz"},
"booleanTrue":function(d){return "prawda"},
"catActions":function(d){return "Działania"},
"catColour":function(d){return "Kolor"},
"catLists":function(d){return "Listy"},
"catLogic":function(d){return "Logika"},
"catLoops":function(d){return "Pętle"},
"catMath":function(d){return "Matematyka"},
"catProcedures":function(d){return "Funkcje"},
"catText":function(d){return "Tekst"},
"catVariables":function(d){return "Zmienne"},
"clearPuzzle":function(d){return "Zacznij od nowa"},
"clearPuzzleConfirm":function(d){return "To spowoduje zresetowanie łamigłówki do stanu początkowego i usunięcie wszystkich bloków, które dodałeś lub zmieniłeś."},
"clearPuzzleConfirmHeader":function(d){return "Czy na pewno chcesz zacząć od nowa?"},
"codeMode":function(d){return "Kod"},
"codeTooltip":function(d){return "Zobacz wygenerowany kod w JavaScript."},
"completedWithoutRecommendedBlock":function(d){return "Gratulacje! Ukończyłeś łamigłówkę "+common_locale.v(d,"puzzleNumber")+". (Ale mógłbyś użyć innych bloków, aby otrzymać lepszy kod.)"},
"continue":function(d){return "Dalej"},
"copy":function(d){return "Copy"},
"defaultTwitterText":function(d){return "Sprawdź, co zrobiłem"},
"designMode":function(d){return "Projekt"},
"dialogCancel":function(d){return "Anuluj"},
"dialogOK":function(d){return "OK"},
"directionEastLetter":function(d){return "E"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionWestLetter":function(d){return "W"},
"dropletBlock_addOperator_description":function(d){return "Dodaj dwie liczby"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Dodaj operatora"},
"dropletBlock_andOperator_description":function(d){return "Zwraca prawda (true) tylko wtedy, gdy oba wyrażenia są prawdziwe, w przeciwnym przypadku zwraca fałsz (false)"},
"dropletBlock_andOperator_signatureOverride":function(d){return "AND (I) operator logiczny"},
"dropletBlock_assign_x_description":function(d){return "Przypisuje wartość do istniejącej zmiennej. Na przykład, x=0;"},
"dropletBlock_assign_x_param0":function(d){return "x"},
"dropletBlock_assign_x_param0_description":function(d){return "The variable name being assigned to"},
"dropletBlock_assign_x_param1":function(d){return "wartość"},
"dropletBlock_assign_x_param1_description":function(d){return "The value the variable is being assigned to."},
"dropletBlock_assign_x_signatureOverride":function(d){return "Przypisać zmienna"},
"dropletBlock_callMyFunction_description":function(d){return "Wywołuje daną funkcję, która nie ma parametrów"},
"dropletBlock_callMyFunction_n_description":function(d){return "Wywołuje daną funkcję, która ma jeden lub więcej parametrów"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Wywołaj funkcję z parametrami"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Wywołaj funkcję"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "Stwórz zmienną i zainicjuj ją jako tablicę"},
"dropletBlock_declareAssign_x_array_1_4_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_array_1_4_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_array_1_4_param1":function(d){return "1,2,3,4"},
"dropletBlock_declareAssign_x_array_1_4_param1_description":function(d){return "Początkowe wartości tablicy"},
"dropletBlock_declareAssign_x_array_1_4_signatureOverride":function(d){return "Declare a variable assigned to an array"},
"dropletBlock_declareAssign_x_description":function(d){return "Stwórz zmienną po raz pierwszy"},
"dropletBlock_declareAssign_x_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_param1":function(d){return "0"},
"dropletBlock_declareAssign_x_param1_description":function(d){return "Początkowa wartość zmiennej"},
"dropletBlock_declareAssign_x_prompt_description":function(d){return "Stwórz zmienną i przypisz jej wartość pobraną z wyświetlonego monitu"},
"dropletBlock_declareAssign_x_prompt_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_prompt_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_prompt_param1":function(d){return "\"Wprowadź wartość\""},
"dropletBlock_declareAssign_x_prompt_param1_description":function(d){return "The string the user will see in the pop up when asked to enter a value"},
"dropletBlock_declareAssign_x_prompt_signatureOverride":function(d){return "Zapytaj użytkownika o wartość i ją zapamiętaj"},
"dropletBlock_declareAssign_x_promptNum_description":function(d){return "Declares that the code will now use a variable and assign it an initial numerical value provided by the user"},
"dropletBlock_declareAssign_x_promptNum_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_promptNum_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_promptNum_param1":function(d){return "\"Wprowadź wartość\""},
"dropletBlock_declareAssign_x_promptNum_param1_description":function(d){return "The string the user will see in the pop up when asked to enter a value"},
"dropletBlock_declareAssign_x_promptNum_signatureOverride":function(d){return "Prompt the user for a numerical value and store it"},
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "Zadeklaruj zmienną"},
"dropletBlock_declareNoAssign_x_description":function(d){return "Declares a variable with the given name after 'var'"},
"dropletBlock_declareNoAssign_x_signatureOverride":function(d){return "Zadeklaruj zmienną"},
"dropletBlock_divideOperator_description":function(d){return "Podziel dwie liczby"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "Operator dzielenia"},
"dropletBlock_equalityOperator_description":function(d){return "Test jakości"},
"dropletBlock_equalityOperator_param0":function(d){return "x"},
"dropletBlock_equalityOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_equalityOperator_param1":function(d){return "y"},
"dropletBlock_equalityOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_equalityOperator_signatureOverride":function(d){return "Operator równości"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "Do something multiple times"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "pętla \"for\""},
"dropletBlock_functionParams_n_description":function(d){return "A set of statements that takes in one or more parameters, and performs a task or calculate a value when the function is called"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "Zdefiniuj funkcje z parametrami"},
"dropletBlock_functionParams_none_description":function(d){return "A set of statements that perform a task or calculate a value when the function is called"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "Zdefiniuj funkcje"},
"dropletBlock_getTime_description":function(d){return "Pobierz aktualny czas w milisekundach"},
"dropletBlock_greaterThanOperator_description":function(d){return "Porównaj dwie liczby"},
"dropletBlock_greaterThanOperator_param0":function(d){return "x"},
"dropletBlock_greaterThanOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_greaterThanOperator_param1":function(d){return "y"},
"dropletBlock_greaterThanOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_greaterThanOperator_signatureOverride":function(d){return "Greater than operator"},
"dropletBlock_ifBlock_description":function(d){return "Do something only if a condition is true"},
"dropletBlock_ifBlock_signatureOverride":function(d){return "if statement"},
"dropletBlock_ifElseBlock_description":function(d){return "Do something if a condition is true, otherwise do something else"},
"dropletBlock_ifElseBlock_signatureOverride":function(d){return "if/else statement"},
"dropletBlock_inequalityOperator_description":function(d){return "Test nierówności"},
"dropletBlock_inequalityOperator_param0":function(d){return "x"},
"dropletBlock_inequalityOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_inequalityOperator_param1":function(d){return "y"},
"dropletBlock_inequalityOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_inequalityOperator_signatureOverride":function(d){return "Inequality operator"},
"dropletBlock_lessThanOperator_description":function(d){return "Porównaj dwie liczby"},
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
"dropletBlock_mathRandom_description":function(d){return "Zwraca liczbę losową między 0 (włącznie) a 1 (wyłącznie)"},
"dropletBlock_mathRandom_signatureOverride":function(d){return "Math.random()"},
"dropletBlock_mathRound_description":function(d){return "Zaokrągl do najbliższej liczby całkowitej"},
"dropletBlock_mathRound_param0":function(d){return "x"},
"dropletBlock_mathRound_param0_description":function(d){return "An arbitrary number."},
"dropletBlock_mathRound_signatureOverride":function(d){return "Math.round(x)"},
"dropletBlock_multiplyOperator_description":function(d){return "Pomnożenie dwóch liczb"},
"dropletBlock_multiplyOperator_signatureOverride":function(d){return "Multiply operator"},
"dropletBlock_notOperator_description":function(d){return "Logiczne NIE dla wartości logicznej"},
"dropletBlock_notOperator_signatureOverride":function(d){return "AND (I) operator logiczny"},
"dropletBlock_orOperator_description":function(d){return "Zwraca true (prawda), gdy albo wyrażenie jest true, i false (fałsz) w przeciwnym wypadku"},
"dropletBlock_orOperator_signatureOverride":function(d){return "OR boolean operator"},
"dropletBlock_randomNumber_min_max_description":function(d){return "Returns a random number ranging from the first number (min) to the second number (max), including both numbers in the range"},
"dropletBlock_randomNumber_param0":function(d){return "min"},
"dropletBlock_randomNumber_param0_description":function(d){return "Zwrócona najmniejsza liczba"},
"dropletBlock_randomNumber_param1":function(d){return "max"},
"dropletBlock_randomNumber_param1_description":function(d){return "Zwrócona największa liczba"},
"dropletBlock_randomNumber_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_return_description":function(d){return "Zwróć wartość funkcji"},
"dropletBlock_return_signatureOverride":function(d){return "zwróć"},
"dropletBlock_setAttribute_description":function(d){return "Ustawia daną wartość"},
"dropletBlock_subtractOperator_description":function(d){return "Odejmowanie dwóch liczb"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"emptyBlockInFunction":function(d){return "Funkcja "+common_locale.v(d,"name")+" ma niewypełnione wejście."},
"emptyBlockInVariable":function(d){return "Zmienna "+common_locale.v(d,"name")+" ma niewypełnione wejście."},
"emptyBlocksErrorMsg":function(d){return "Blok \"powtarzaj\" lub blok \"jeśli\" muszą zawierać inne bloki, by poprawnie działać. Upewnij się, czy wewnętrzny blok pasuje do zewnętrznego."},
"emptyExampleBlockErrorMsg":function(d){return "Potrzebujesz co najmniej dwóch przykładów na funkcję "+common_locale.v(d,"functionName")+". Upewnij się, że każdy przykład zawiera wywołanie i wynik."},
"emptyFunctionBlocksErrorMsg":function(d){return "Blok funkcji musi zawierać inne bloki, by działał."},
"emptyFunctionalBlock":function(d){return "Masz blok z niewypełnionym wejściem."},
"emptyTopLevelBlock":function(d){return "Nie ma bloków do uruchomienia. Musisz dołączyć blok do bloku "+common_locale.v(d,"topLevelBlockName")+"."},
"end":function(d){return "koniec"},
"errorEmptyFunctionBlockModal":function(d){return "Wewnątrz definicji Twojej funkcji powinny znajdować się bloki. Kliknij przycisk Edytuj i przeciągnij bloki do wnętrza zielonego bloku."},
"errorIncompleteBlockInFunction":function(d){return "Kliknij przycisk Edytuj, aby upewnić się, że wewnątrz definicji Twojej funkcji nie brakuje żadnego bloku."},
"errorParamInputUnattached":function(d){return "Pamiętaj, aby dołączyć blok do każdego parametru wejścia w bloku funkcji w Twoim obszarze roboczym."},
"errorQuestionMarksInNumberField":function(d){return "Spróbuj zastąpić ??? wartością."},
"errorRequiredParamsMissing":function(d){return "Utwórz parametr dla swojej funkcji klikając na przycisk Edytuj i dodając niezbędne parametry. Przeciągnij nowe bloki parametrów do definicji swojej funkcji."},
"errorUnusedFunction":function(d){return "Utworzyłeś funkcję, ale nigdy nie użyłeś jej w swoim obszarze roboczym! W przyborniku kliknij na Funkcje i upewnij się, że używasz ich w swoim programie."},
"errorUnusedParam":function(d){return "Dodałeś blok parametru, ale nie użyłeś go w definicji. Upewnij się, że używasz swojego parametru klikając na przycisk Editi i umieszczając blok parametru wewnątrz bloku zielonego."},
"exampleErrorMessage":function(d){return "Funkcja "+common_locale.v(d,"functionName")+" zawiera jeden lub więcej przykładów, które wymagają korekty. Upewnij się, że są one zgodne z definicją i stanowią odpowiedź na pytanie."},
"examplesFailedOnClose":function(d){return "Jeden lub więcej przykładów nie odpowiada Twojej definicji. Sprawdź swoje przykłady przed zamknięciem"},
"extraTopBlocks":function(d){return "Masz nieprzywiązane bloki."},
"extraTopBlocksWhenRun":function(d){return "Masz nieprzywiązane bloki. Czy postanowiłeś przywiązać je do bloku \"po uruchomieniu\"?"},
"finalStage":function(d){return "Gratulacje! Ukończyłeś ostatni etap."},
"finalStageTrophies":function(d){return "Gratulacje! Ukończyłeś ostatni etap i wygrałeś "+common_locale.p(d,"numTrophies",0,"pl",{"one":"trofeum","other":common_locale.n(d,"numTrophies")+" trofea"})+"."},
"finish":function(d){return "Koniec"},
"generatedCodeInfo":function(d){return "Nawet najlepsze uczelnie uczą kodowania opartego o bloki (np. "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+"). Ale bloki, które użyłeś, można również znaleźć w JavaScript, w jednym z najpowszechniej stosowanym języku programowania na świecie:"},
"hashError":function(d){return "Przepraszamy, '%1' nie odpowiada żadnemu zapisanemu programowi."},
"help":function(d){return "Pomoc"},
"hideToolbox":function(d){return "(Ukryj)"},
"hintHeader":function(d){return "Oto wskazówka:"},
"hintRequest":function(d){return "Zobacz wskazówkę"},
"hintTitle":function(d){return "Podpowiedź:"},
"ignore":function(d){return "Ignoruj"},
"infinity":function(d){return "Nieskończoność"},
"jump":function(d){return "skocz"},
"keepPlaying":function(d){return "Nie przestawaj grać"},
"levelIncompleteError":function(d){return "Używasz wszystkich niezbędnych rodzajów bloków, ale w niewłaściwy sposób."},
"listVariable":function(d){return "lista"},
"makeYourOwnFlappy":function(d){return "Utwórz swoją grę Flappy"},
"missingRecommendedBlocksErrorMsg":function(d){return "Niezupełnie. Spróbuj użyć bloku, którego jeszcze nie użyłeś."},
"missingRequiredBlocksErrorMsg":function(d){return "Niezupełnie. Musisz użyć bloku, którego jeszcze nie użyłeś."},
"nestedForSameVariable":function(d){return "Używasz tej samej zmiennej wewnątrz dwóch lub więcej zagnieżdżonych pętli. Używaj unikatowych nazw zmiennych, aby uniknąć nieskończonej pętli."},
"nextLevel":function(d){return "Gratulacje! Rozwiązałeś Łamigłówkę nr "+common_locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Gratulacje! Rozwiązałeś Łamigłówkę nr "+common_locale.v(d,"puzzleNumber")+" i wygrałeś "+common_locale.p(d,"numTrophies",0,"pl",{"one":"trofeum","other":common_locale.n(d,"numTrophies")+" trofea"})+"."},
"nextPuzzle":function(d){return "Następna Łamigłówka"},
"nextStage":function(d){return "Gratulacje! Ukończyłeś etap "+common_locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Gratulacje! Ukończyłeś etap "+common_locale.v(d,"stageName")+" i wygrałeś "+common_locale.p(d,"numTrophies",0,"pl",{"one":"trofeum","other":common_locale.n(d,"numTrophies")+" trofea"})+"."},
"numBlocksNeeded":function(d){return "Gratulacje! Rozwiązałeś Łamigłówkę nr "+common_locale.v(d,"puzzleNumber")+". (Jednakże, mogłeś użyć jedynie "+common_locale.p(d,"numBlocks",0,"pl",{"one":"blok","other":common_locale.n(d,"numBlocks")+" bloki"})+")"},
"numLinesOfCodeWritten":function(d){return "Właśnie napisałeś "+common_locale.p(d,"numLines",0,"pl",{"one":"linię","other":common_locale.n(d,"numLines")+" linii"})+" kodu!"},
"openWorkspace":function(d){return "Jak to Działa"},
"orientationLock":function(d){return "Wyłącz blokadę orientacji w ustawieniach urządzenia."},
"play":function(d){return "zagraj"},
"print":function(d){return "Drukuj"},
"puzzleTitle":function(d){return "Łamigłówka "+common_locale.v(d,"puzzle_number")+" z "+common_locale.v(d,"stage_total")},
"readonlyWorkspaceHeader":function(d){return "Zobacz tylko: "},
"repeat":function(d){return "powtarzaj"},
"resetProgram":function(d){return "Zresetuj"},
"rotateText":function(d){return "Obróć swoje urządzenie."},
"runProgram":function(d){return "Uruchom"},
"runTooltip":function(d){return "Uruchom program zdefiniowany za pomocą bloków w miejscu roboczym."},
"runtimeErrorMsg":function(d){return "Twój program nie wykonał się pomyślnie. Usuń linię "+common_locale.v(d,"lineNumber")+" i spróbuj ponownie."},
"saveToGallery":function(d){return "Zapisz w galerii"},
"savedToGallery":function(d){return "Zapisane w galerii!"},
"score":function(d){return "wynik"},
"sendToPhone":function(d){return "Send To Phone"},
"shareFailure":function(d){return "Przepraszamy, ale nie możemy udostępnić tego programu."},
"shareWarningsAge":function(d){return "Podaj swój wiek poniżej i kliknij przycisk OK, aby kontynuować."},
"shareWarningsMoreInfo":function(d){return "Więcej informacji"},
"shareWarningsStoreData":function(d){return "Ta aplikacja zbudowana na Code Studio przechowuje dane, które mogą być oglądane przez każdego, kto ma ten link, zachowaj więc ostrożność, gdy ktoś poprosi Cię o podanie danych osobowych."},
"showBlocksHeader":function(d){return "Pokaż Bloki"},
"showCodeHeader":function(d){return "Pokaż Kod"},
"showGeneratedCode":function(d){return "Pokaż kod"},
"showTextHeader":function(d){return "Pokaż tekst"},
"showToolbox":function(d){return "Pokaż Przybornik"},
"showVersionsHeader":function(d){return "Poprzednie wersje"},
"signup":function(d){return "Zapisz się na kurs wprowadzający"},
"stringEquals":function(d){return "łańcuch=?"},
"submit":function(d){return "Wyślij"},
"submitYourProject":function(d){return "Prześlij swój projekt"},
"submitYourProjectConfirm":function(d){return "Nie możesz edytować swojego projektu po przesłaniu go, czy naprawdę chcesz przesłać?"},
"unsubmit":function(d){return "Nieprzesłane"},
"unsubmitYourProject":function(d){return "Nie wysyłaj swojego projektu"},
"unsubmitYourProjectConfirm":function(d){return "Nie wysłanie swojego projektu spowoduje zresetowanie przesłanej daty, czy naprawdę nie wysyłasz?"},
"subtitle":function(d){return "środowisko wizualnego programowania"},
"syntaxErrorMsg":function(d){return "Twój program zawiera literówkę. Usuń linię "+common_locale.v(d,"lineNumber")+" i spróbuj ponownie."},
"textVariable":function(d){return "tekst"},
"toggleBlocksErrorMsg":function(d){return "Musisz poprawić błąd w swoim programie, zanim może być wyświetlony w blokach."},
"tooFewBlocksMsg":function(d){return "Używasz wszystkich wymaganych rodzajów bloków, ale spróbuj użyć ich więcej, aby ukończyć łamigłówkę."},
"tooManyBlocksMsg":function(d){return "Ta łamigłówka może być rozwiązana przy pomocy bloków <x id='START_SPAN'/><x id='END_SPAN'/>."},
"tooMuchWork":function(d){return "Spowodowałeś, że miałem dużo pracy. Czy możesz zmniejszyć liczbę powtórzeń?"},
"toolboxHeader":function(d){return "Bloki"},
"toolboxHeaderDroplet":function(d){return "Przybornik"},
"totalNumLinesOfCodeWritten":function(d){return "Sumaryczny wynik: "+common_locale.p(d,"numLines",0,"pl",{"one":"1 linia","other":common_locale.n(d,"numLines")+" linii"})+" kodu."},
"tryAgain":function(d){return "Spróbuj ponownie"},
"tryBlocksBelowFeedback":function(d){return "Spróbuj użyć jednego z bloków poniżej:"},
"tryHOC":function(d){return "Weź udział w Godzinie Kodowania (the Hour of Code)"},
"unnamedFunction":function(d){return "Masz zmienną lub funkcję, która nie ma nazwy. Nie zapomnij nazwać wszystkiego."},
"wantToLearn":function(d){return "Czy chcesz nauczyć się kodowania (programowania)?"},
"watchVideo":function(d){return "Obejrzyj wideo"},
"when":function(d){return "kiedy"},
"whenRun":function(d){return "po uruchomieniu"},
"workspaceHeaderShort":function(d){return "Obszar roboczy: "}};