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
"and":function(d){return "şi"},
"backToPreviousLevel":function(d){return "Înapoi la nivelul anterior"},
"blocklyMessage":function(d){return "Blockly"},
"blocks":function(d){return "blocuri"},
"booleanFalse":function(d){return "fals"},
"booleanTrue":function(d){return "adevărat"},
"catActions":function(d){return "Acţiuni"},
"catColour":function(d){return "Culoare"},
"catLists":function(d){return "Liste"},
"catLogic":function(d){return "Logică"},
"catLoops":function(d){return "Bucle"},
"catMath":function(d){return "Matematică"},
"catProcedures":function(d){return "Funcţii"},
"catText":function(d){return "text"},
"catVariables":function(d){return "Variabile"},
"clearPuzzle":function(d){return "Reîncepe"},
"clearPuzzleConfirm":function(d){return "Acest lucru va reseta puzzle-ul la starea sa inițială şi va şterge toate blocurile pe care le-ai adăugat sau modificat."},
"clearPuzzleConfirmHeader":function(d){return "Ești sigur că dorești să reîncepi?"},
"codeMode":function(d){return "Cod"},
"codeTooltip":function(d){return "Vezi codul JavaScript generat."},
"completedWithoutRecommendedBlock":function(d){return "Felicitări! Ai terminat Puzzle-ul "+common_locale.v(d,"puzzleNumber")+". (Dar ai putea folosi un bloc diferit pentru un cod mai puternic.)"},
"continue":function(d){return "Continuă"},
"defaultTwitterText":function(d){return "Uite ce am creat"},
"designMode":function(d){return "Design"},
"dialogCancel":function(d){return "Anulează"},
"dialogOK":function(d){return "OK"},
"directionEastLetter":function(d){return "E"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionWestLetter":function(d){return "V"},
"dropletBlock_addOperator_description":function(d){return "Adaugă două numere"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Adaugă operatorul"},
"dropletBlock_andOperator_description":function(d){return "Returnează ADEVĂRAT numai atunci când ambele expresii sunt adevărate și FALS în caz contrar"},
"dropletBlock_andOperator_signatureOverride":function(d){return "ŞI operator boolean"},
"dropletBlock_assign_x_description":function(d){return "Atribuie o valoare unei variabile existente. De exemplu, x = 0;"},
"dropletBlock_assign_x_param0":function(d){return "x"},
"dropletBlock_assign_x_param0_description":function(d){return "Numele variabilei este atribuit la"},
"dropletBlock_assign_x_param1":function(d){return "valoare"},
"dropletBlock_assign_x_param1_description":function(d){return "Valoarea dată variabilei."},
"dropletBlock_assign_x_signatureOverride":function(d){return "Atribuie o variabilă"},
"dropletBlock_callMyFunction_description":function(d){return "Apelează o anumită funcție care nu are parametri"},
"dropletBlock_callMyFunction_n_description":function(d){return "Apelează o anumită funcție care are unul sau mai mulți parametri"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Apelează o funcție cu parametri"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Apelează o funcție"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "Declară o variabilă şi o atribuie unei secvențe cu valori iniţiale date"},
"dropletBlock_declareAssign_x_array_1_4_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_array_1_4_param0_description":function(d){return "Numele pe care îl vei folosi în program pentru a referi variabila"},
"dropletBlock_declareAssign_x_array_1_4_param1":function(d){return "1,2,3,4"},
"dropletBlock_declareAssign_x_array_1_4_param1_description":function(d){return "Valorile inițiale ale matricei"},
"dropletBlock_declareAssign_x_array_1_4_signatureOverride":function(d){return "Declară o variabilă atribuită unei secvențe"},
"dropletBlock_declareAssign_x_description":function(d){return "Declară o variabilă cu numele dat după \"var\", şi îi atribuie valoarea din partea dreapta a expresiei"},
"dropletBlock_declareAssign_x_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_param0_description":function(d){return "Numele pe care îl vei folosi în program pentru a referi variabila"},
"dropletBlock_declareAssign_x_param1":function(d){return "0"},
"dropletBlock_declareAssign_x_param1_description":function(d){return "Valoarea inițială a variabilei"},
"dropletBlock_declareAssign_x_prompt_description":function(d){return "Declară că secvența de cod folosește acum o variabilă şi îi atribuie o valoare iniţială furnizată de utilizator"},
"dropletBlock_declareAssign_x_prompt_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_prompt_param0_description":function(d){return "Numele pe care îl vei folosi în program pentru a referi variabila"},
"dropletBlock_declareAssign_x_prompt_param1":function(d){return "\" Introdu valoarea \""},
"dropletBlock_declareAssign_x_prompt_param1_description":function(d){return "Șirul pe care utilizatorul îl va vedea în pop up când este rugat să introducă o valoare"},
"dropletBlock_declareAssign_x_prompt_signatureOverride":function(d){return "Solicită utilizatorului o valoare şi stocheaz-o"},
"dropletBlock_declareAssign_x_promptNum_description":function(d){return "Declares that the code will now use a variable and assign it an initial numerical value provided by the user"},
"dropletBlock_declareAssign_x_promptNum_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_promptNum_param0_description":function(d){return "Numele pe care îl vei folosi în program pentru a referi variabila"},
"dropletBlock_declareAssign_x_promptNum_param1":function(d){return "\" Introdu valoarea \""},
"dropletBlock_declareAssign_x_promptNum_param1_description":function(d){return "Șirul pe care utilizatorul îl va vedea în pop up când este rugat să introducă o valoare"},
"dropletBlock_declareAssign_x_promptNum_signatureOverride":function(d){return "Prompt the user for a numerical value and store it"},
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "Declară o variabilă"},
"dropletBlock_declareNoAssign_x_description":function(d){return "Declares a variable with the given name after 'var'"},
"dropletBlock_declareNoAssign_x_signatureOverride":function(d){return "Declară o variabilă"},
"dropletBlock_divideOperator_description":function(d){return "Împarte două numere"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "Operatorul de împărțire"},
"dropletBlock_equalityOperator_description":function(d){return "Testează dacă două valori sunt egale. Returnează adevărat dacă valoarea din partea stângă a expresiei este egală cu valoarea din partea dreaptă a acesteia, iar în caz contrar fals"},
"dropletBlock_equalityOperator_param0":function(d){return "x"},
"dropletBlock_equalityOperator_param0_description":function(d){return "Prima valoare de folosit pentru comparație."},
"dropletBlock_equalityOperator_param1":function(d){return "y"},
"dropletBlock_equalityOperator_param1_description":function(d){return "A doua valoare de utilizat pentru comparație."},
"dropletBlock_equalityOperator_signatureOverride":function(d){return "Operatorul de egalitate"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "Crează o buclă constând dintr-o expresie de iniţializare, o expresie condiţională, o expresie de incrementare şi un bloc de declaraţii executate pentru fiecare repetare a buclei"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "pentru buclă"},
"dropletBlock_functionParams_n_description":function(d){return "Un set de afirmații care ia unul sau mai mulți parametri şi efectuează o sarcină sau calculează o valoare atunci când funcţia este apelată"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "Definește o funcţie cu parametri"},
"dropletBlock_functionParams_none_description":function(d){return "Un set de afirmații care execută o sarcină sau calculează o valoare atunci când funcţia este apelată"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "Definește o funcţie"},
"dropletBlock_getTime_description":function(d){return "Obține ora curentă în milisecunde"},
"dropletBlock_greaterThanOperator_description":function(d){return "Testează dacă un număr este mai mare decât un alt număr. Returnează true (adevărat) dacă valoarea de pe partea stângă a expresiei este strict mai mare decât valoarea de pe partea dreaptă a expresiei"},
"dropletBlock_greaterThanOperator_param0":function(d){return "x"},
"dropletBlock_greaterThanOperator_param0_description":function(d){return "Prima valoare de folosit pentru comparație."},
"dropletBlock_greaterThanOperator_param1":function(d){return "y"},
"dropletBlock_greaterThanOperator_param1_description":function(d){return "A doua valoare de utilizat pentru comparație."},
"dropletBlock_greaterThanOperator_signatureOverride":function(d){return "Mai mare decât operatorul"},
"dropletBlock_ifBlock_description":function(d){return "Do something only if a condition is true"},
"dropletBlock_ifBlock_signatureOverride":function(d){return "if statement"},
"dropletBlock_ifElseBlock_description":function(d){return "Do something if a condition is true, otherwise do something else"},
"dropletBlock_ifElseBlock_signatureOverride":function(d){return "if/else statement"},
"dropletBlock_inequalityOperator_description":function(d){return "Test for inequality"},
"dropletBlock_inequalityOperator_param0":function(d){return "x"},
"dropletBlock_inequalityOperator_param0_description":function(d){return "Prima valoare de folosit pentru comparație."},
"dropletBlock_inequalityOperator_param1":function(d){return "y"},
"dropletBlock_inequalityOperator_param1_description":function(d){return "A doua valoare de utilizat pentru comparație."},
"dropletBlock_inequalityOperator_signatureOverride":function(d){return "Inequality operator"},
"dropletBlock_lessThanOperator_description":function(d){return "Compare two numbers"},
"dropletBlock_lessThanOperator_param0":function(d){return "x"},
"dropletBlock_lessThanOperator_param0_description":function(d){return "Prima valoare de folosit pentru comparație."},
"dropletBlock_lessThanOperator_param1":function(d){return "y"},
"dropletBlock_lessThanOperator_param1_description":function(d){return "A doua valoare de utilizat pentru comparație."},
"dropletBlock_lessThanOperator_signatureOverride":function(d){return "Less than operator"},
"dropletBlock_mathAbs_description":function(d){return "Ia valoarea absolută a lui x"},
"dropletBlock_mathAbs_param0":function(d){return "x"},
"dropletBlock_mathAbs_param0_description":function(d){return "An arbitrary number."},
"dropletBlock_mathAbs_signatureOverride":function(d){return "Math.abs(x)"},
"dropletBlock_mathMax_description":function(d){return "Ia valoarea maximă dintre una sau mai multe valori n1, n2,..., nX"},
"dropletBlock_mathMax_param0":function(d){return "n1, n2,..., nX"},
"dropletBlock_mathMax_param0_description":function(d){return "One or more numbers to compare."},
"dropletBlock_mathMax_signatureOverride":function(d){return "Math.max(n1, n2, ..., nX)"},
"dropletBlock_mathMin_description":function(d){return "Ia valoarea minimă dintre una sau mai multe valori n1, n2,..., nX"},
"dropletBlock_mathMin_param0":function(d){return "n1, n2,..., nX"},
"dropletBlock_mathMin_param0_description":function(d){return "One or more numbers to compare."},
"dropletBlock_mathMin_signatureOverride":function(d){return "Math.min(n1, n2, ..., nX)"},
"dropletBlock_mathRandom_description":function(d){return "Returnează un număr aleatoriu de la 0 (inclusiv) până la, dar fără să includă, 1 (exclusiv)"},
"dropletBlock_mathRandom_signatureOverride":function(d){return "Matematică.aleatorie()"},
"dropletBlock_mathRound_description":function(d){return "Rotunjeşte un număr la cel mai apropiat întreg"},
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
"dropletBlock_randomNumber_param0_description":function(d){return "Numărul minim returnat"},
"dropletBlock_randomNumber_param1":function(d){return "max"},
"dropletBlock_randomNumber_param1_description":function(d){return "Numărul maxim returnat"},
"dropletBlock_randomNumber_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_return_description":function(d){return "Return a value from a function"},
"dropletBlock_return_signatureOverride":function(d){return "returnează"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_subtractOperator_description":function(d){return "Subtract two numbers"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"emptyBlockInFunction":function(d){return "Funcţia "+common_locale.v(d,"name")+" are o intrare necompletată."},
"emptyBlockInVariable":function(d){return "Variabila "+common_locale.v(d,"name")+" are o intrare necompletată."},
"emptyBlocksErrorMsg":function(d){return "Blocul \"Repetă\" sau \"Dacă\" trebuie să aibe alte blocuri în interiorul său  pentru a putea funcționa. Asigură-te că blocul interior se încadrează corect în blocul care îl conține."},
"emptyExampleBlockErrorMsg":function(d){return "Ai nevoie de cel puţin două exemple în funcţia "+common_locale.v(d,"functionName")+". Asigură-te că fiecare exemplu are un apel şi un rezultat."},
"emptyFunctionBlocksErrorMsg":function(d){return "Blocul de funcţie trebuie să aibă alte blocuri în interior ca să funcţioneze."},
"emptyFunctionalBlock":function(d){return "Ai un bloc necompletat."},
"emptyTopLevelBlock":function(d){return "Nu există blocuri pentru a rula programul. Trebuie să atașezi un bloc la blocul "+common_locale.v(d,"topLevelBlockName")+"."},
"end":function(d){return "șfârșit"},
"errorEmptyFunctionBlockModal":function(d){return "În interiorul definiției funcției tale trebuie să includem blocuri. Dă clic pe ”editare” și trage blocuri în interiorul blocului verde."},
"errorIncompleteBlockInFunction":function(d){return "Fă clic pe \"editare\" pentru a te asigura că nu lipsesc blocuri în interiorul definiţiei funcţiei tale."},
"errorParamInputUnattached":function(d){return "Amintește-ți să ataşezi un bloc pentru fiecare parametru de intrare în blocul funcţiei din spaţiul tău de lucru."},
"errorQuestionMarksInNumberField":function(d){return "Încearcă să înlocuiești \"???\" cu o valoare."},
"errorRequiredParamsMissing":function(d){return "Creează un parametru pentru funcţia ta făcând clic pe \"editare\" şi adăugând parametrii necesari. Glisează noile blocuri parametru în definiţia funcţiei tale."},
"errorUnusedFunction":function(d){return "Ai creat o funcţie, dar nu ai folosit-o în spaţiul tău de lucru! Fă clic pe \"Funcţii\" în caseta de instrumente şi asigură-te că o folosești în programul tău."},
"errorUnusedParam":function(d){return "Ai adăugat un bloc de parametri, dar nu l-ai utilizat în definiţie. Asigură-te de utilizarea parametrului tău făcând clic pe \"editare\" şi plasând blocul parametru în interiorul blocului verde."},
"exampleErrorMessage":function(d){return "Funcţia "+common_locale.v(d,"functionName")+" are unul sau mai multe exemple care trebuie modificate. Asigură-te că acestea se potrivesc cu definiţia ta şi răspund la întrebare."},
"examplesFailedOnClose":function(d){return "Unul sau mai multe dintre exemple tale nu corespund(e) definiţiei tale. Verifică-ți exemplele înainte de a închide"},
"extraTopBlocks":function(d){return "Ai blocuri neataşate."},
"extraTopBlocksWhenRun":function(d){return "Ai blocuri neataşate. Ai vrut să le ataşezi la blocul \"când rulează\"?"},
"finalStage":function(d){return "Felicitări! Ai terminat ultima etapă."},
"finalStageTrophies":function(d){return "Felicitări! Ai terminat etapa finală şi ai câştigat "+common_locale.p(d,"numTrophies",0,"ro",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+"."},
"finish":function(d){return "Sfârsit"},
"generatedCodeInfo":function(d){return "Chiar și în universităţi de top se predă programarea bazată pe blocuri de coduri (de exemplu, "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+"). Dar în esență, blocurile de cod pe care le-ai compus pot fi de asemenea afișate în JavaScript, limbajul de programare cel mai utilizat din lume:"},
"hashError":function(d){return "Ne pare rău, '%1' nu corespunde cu nici un program salvat."},
"help":function(d){return "Ajutor"},
"hideToolbox":function(d){return "(Ascunde)"},
"hintHeader":function(d){return "Iată un indiciu:"},
"hintRequest":function(d){return "Vezi indiciu"},
"hintTitle":function(d){return "Sugestie:"},
"ignore":function(d){return "Ignoră"},
"infinity":function(d){return "Infinit"},
"jump":function(d){return "sari"},
"keepPlaying":function(d){return "Joacă în continuare"},
"levelIncompleteError":function(d){return "Utilizezi toate tipurile de blocuri necesare, dar nu așa cum trebuie."},
"listVariable":function(d){return "listă"},
"makeYourOwnFlappy":function(d){return "Crează-ți propriul tău joc Flappy"},
"missingRecommendedBlocksErrorMsg":function(d){return "Nu chiar așa. Încearcă utilizarea unui bloc pe care nu l-ai mai folosit."},
"missingRequiredBlocksErrorMsg":function(d){return "Nu chiar așa. Trebuie să utilizezi un bloc pe care nu l-ai mai folosit până acum."},
"nestedForSameVariable":function(d){return "Utilizezi aceeaşi variabilă în interiorul a două sau a mai multor bucle imbricate. Utilizează nume de variabile unice pentru a evita buclele infinite."},
"nextLevel":function(d){return "Felicitări! Ai terminat Puzzle-ul "+common_locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Felicitări! Ai terminat Puzzle-ul "+common_locale.v(d,"puzzleNumber")+" și ai câștigat "+common_locale.p(d,"numTrophies",0,"ro",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+"."},
"nextPuzzle":function(d){return "Puzzle-ul următor"},
"nextStage":function(d){return "Felicitări! Ai terminat "+common_locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Felicitări! Ai finalizat Etapa "+common_locale.v(d,"stageName")+" și ai câștigat "+common_locale.p(d,"numTrophies",0,"ro",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+"."},
"numBlocksNeeded":function(d){return "Felicităr! Ai terminat Puzzle-ul "+common_locale.v(d,"puzzleNumber")+". (Însă, ai fi putut folosi doar "+common_locale.p(d,"numBlocks",0,"ro",{"one":"1 block","other":common_locale.n(d,"numBlocks")+" blocks"})+".)"},
"numLinesOfCodeWritten":function(d){return "Ai scris doar "+common_locale.p(d,"numLines",0,"ro",{"one":"1 line","other":common_locale.n(d,"numLines")+" lines"})+" de cod!"},
"openWorkspace":function(d){return "Cum funcţionează"},
"orientationLock":function(d){return "Oprește blocarea de orientare în setările dispozitivului."},
"play":function(d){return "joacă"},
"print":function(d){return "Tipărire"},
"puzzleTitle":function(d){return "Puzzle "+common_locale.v(d,"puzzle_number")+" din "+common_locale.v(d,"stage_total")},
"readonlyWorkspaceHeader":function(d){return "Doar vizionare: "},
"repeat":function(d){return "repetă"},
"resetProgram":function(d){return "Resetează"},
"rotateText":function(d){return "Rotește dispozitivul tău."},
"runProgram":function(d){return "Rulează"},
"runTooltip":function(d){return "Rulează programul definit de blocuri în spațiul de lucru."},
"runtimeErrorMsg":function(d){return "Programul nu a rulat cu succes. Elimină linia "+common_locale.v(d,"lineNumber")+" şi încearcă din nou."},
"saveToGallery":function(d){return "Salvare în galerie"},
"savedToGallery":function(d){return "Salvat în galerie!"},
"score":function(d){return "scor"},
"shareFailure":function(d){return "Ne pare rău, nu putem distribui acest program."},
"shareWarningsAge":function(d){return "Te rugăm să-ți completezi vârsta mai jos și să apeși butonul OK pentru a continua."},
"shareWarningsMoreInfo":function(d){return "Informații suplimentare"},
"shareWarningsStoreData":function(d){return "Această aplicație construită în Studio-ul Code stochează informații care ar putea fi vizualizate de către oricine prin intermediul acestui link, deci ai grijă dacă ți se cere să furnizezi informații personale."},
"showBlocksHeader":function(d){return "Afișează blocurile"},
"showCodeHeader":function(d){return "Arată codul"},
"showGeneratedCode":function(d){return "Arată codul"},
"showTextHeader":function(d){return "Afișare Text"},
"showToolbox":function(d){return "Arată cutia de instrumente"},
"showVersionsHeader":function(d){return "Istoricul versiunilor"},
"signup":function(d){return "Înscrie-te la cursul introductiv"},
"stringEquals":function(d){return "şir=?"},
"submit":function(d){return "Trimite"},
"submitYourProject":function(d){return "Înregistrează-ți proiectul"},
"submitYourProjectConfirm":function(d){return "Nu-ți mai poți edita proiectul după ce l-ai înregistrat, ești sigur că vrei să-l înregistrezi?"},
"unsubmit":function(d){return "Retrage"},
"unsubmitYourProject":function(d){return "Retrage-ți proiectul"},
"unsubmitYourProjectConfirm":function(d){return "Retragerea proiectului tău va reseta data înscrierii lui, sigur îl retragi?"},
"subtitle":function(d){return "un mediu de programare vizual"},
"syntaxErrorMsg":function(d){return "Programul conţine o greşeală de scriere. Te rugăm să elimini linia "+common_locale.v(d,"lineNumber")+" şi să încerci din nou."},
"textVariable":function(d){return "scris"},
"toggleBlocksErrorMsg":function(d){return "Trebuie să corectezi o eroare în programul tău înainte să poată fi listată ca bloc."},
"tooFewBlocksMsg":function(d){return "Folosești toate tipurile necesare de blocuri, dar încearcă să utilizezi mai multe din aceste tipuri de blocuri pentru a completa puzzle-ul."},
"tooManyBlocksMsg":function(d){return "Acest puzzle poate fi rezolvat cu blocuri <x id='START_SPAN'/><x id='END_SPAN'/>."},
"tooMuchWork":function(d){return "M-ai făcut să lucrez foarte mult! Ai putea să încerci să repeți de mai puține ori?"},
"toolboxHeader":function(d){return "Blocuri"},
"toolboxHeaderDroplet":function(d){return "Cutie de instrumente"},
"totalNumLinesOfCodeWritten":function(d){return "Totalul all-time: "+common_locale.p(d,"numLines",0,"ro",{"one":"1 linie","other":common_locale.n(d,"numLines")+" linii"})+" de cod."},
"tryAgain":function(d){return "Încearcă din nou"},
"tryBlocksBelowFeedback":function(d){return "Încearcă să utilizezi unul din blocurile de mai jos:"},
"tryHOC":function(d){return "Încearcă Ora de Cod"},
"unnamedFunction":function(d){return "Ai o variabilă sau o funcţie care nu are nume. Nu uita să dai tuturor elementelor câte un nume descriptiv."},
"wantToLearn":function(d){return "Vrei să înveți să codezi?"},
"watchVideo":function(d){return "Urmărește clipul video"},
"when":function(d){return "când"},
"whenRun":function(d){return "când rulezi"},
"workspaceHeaderShort":function(d){return "Spaţiu de lucru: "}};