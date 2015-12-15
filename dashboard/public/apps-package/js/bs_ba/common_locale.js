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
"backToPreviousLevel":function(d){return "Povratak na prethodni nivo"},
"blocklyMessage":function(d){return "Blockly"},
"blocks":function(d){return "blokovi"},
"booleanFalse":function(d){return "neistinito"},
"booleanTrue":function(d){return "istinito"},
"catActions":function(d){return "Akcije"},
"catColour":function(d){return "Boja"},
"catLists":function(d){return "Liste"},
"catLogic":function(d){return "Logika"},
"catLoops":function(d){return "Petlje"},
"catMath":function(d){return "Matematika"},
"catProcedures":function(d){return "Funkcije"},
"catText":function(d){return "Tekst"},
"catVariables":function(d){return "Varijable"},
"clearPuzzle":function(d){return "Počni Ponovo"},
"clearPuzzleConfirm":function(d){return "Ova akcija će resetovati ovaj zadatak na njegovo početno stanje i izbrisati će sve blokove koje si dodao/la ili promijenio/la."},
"clearPuzzleConfirmHeader":function(d){return "Jesi li siguran/na da želiš početi iznova?"},
"codeMode":function(d){return "Kôd"},
"codeTooltip":function(d){return "Pogledaj stvoreni JavaScript kôd."},
"completedWithoutRecommendedBlock":function(d){return "Čestitamo! Završili ste Zagonetku "+common_locale.v(d,"puzzleNumber")+". (Ali bi mogli upotrijebiti drugačiji blok za bolji kod.)"},
"continue":function(d){return "Nastavi"},
"copy":function(d){return "Copy"},
"defaultTwitterText":function(d){return "Pogledaj šta sam napravio"},
"designMode":function(d){return "Dizajn"},
"dialogCancel":function(d){return "Poništi"},
"dialogOK":function(d){return "U redu"},
"directionEastLetter":function(d){return "Istok"},
"directionNorthLetter":function(d){return "Sjever"},
"directionSouthLetter":function(d){return "Jug"},
"directionWestLetter":function(d){return "Zapad"},
"dropletBlock_addOperator_description":function(d){return "Saberi dva broja"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Add operator"},
"dropletBlock_andOperator_description":function(d){return "Vraća istinito samo onda kada su oba izraza istinita. U suprotnom vraća neistinito"},
"dropletBlock_andOperator_signatureOverride":function(d){return "AND (I) logički operator"},
"dropletBlock_assign_x_description":function(d){return "Assigns a value to an existing variable. For example, x = 0;"},
"dropletBlock_assign_x_param0":function(d){return "x"},
"dropletBlock_assign_x_param0_description":function(d){return "The variable name being assigned to"},
"dropletBlock_assign_x_param1":function(d){return "vrijednost"},
"dropletBlock_assign_x_param1_description":function(d){return "The value the variable is being assigned to."},
"dropletBlock_assign_x_signatureOverride":function(d){return "Assign a variable"},
"dropletBlock_callMyFunction_description":function(d){return "Zove imenovanu funkciju koja ne uzima parametre"},
"dropletBlock_callMyFunction_n_description":function(d){return "Poziva imenovanu funkciju koja uzima jedan ili više parametara"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Poziva funkciju sa parametrima"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Zovi funkciju"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "Create a variable and initialize it as an array"},
"dropletBlock_declareAssign_x_array_1_4_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_array_1_4_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_array_1_4_param1":function(d){return "1,2,3,4"},
"dropletBlock_declareAssign_x_array_1_4_param1_description":function(d){return "The initial values to the array"},
"dropletBlock_declareAssign_x_array_1_4_signatureOverride":function(d){return "Declare a variable assigned to an array"},
"dropletBlock_declareAssign_x_description":function(d){return "Deklarira varijablu sa datim imenom nakon 'var', i dodijeljuje joj vrijednost na desnoj strani izraza"},
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
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "Deklariraj varijablu"},
"dropletBlock_declareNoAssign_x_description":function(d){return "Declares a variable with the given name after 'var'"},
"dropletBlock_declareNoAssign_x_signatureOverride":function(d){return "Deklariraj varijablu"},
"dropletBlock_divideOperator_description":function(d){return "Podijeli dva broja"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "Divide operator"},
"dropletBlock_equalityOperator_description":function(d){return "Test for equality"},
"dropletBlock_equalityOperator_param0":function(d){return "x"},
"dropletBlock_equalityOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_equalityOperator_param1":function(d){return "y"},
"dropletBlock_equalityOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_equalityOperator_signatureOverride":function(d){return "Equality operator"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "Kreira petlju koja se sastoji od izaza inicijalizacije, uvjetnog izraza, inkrementirajućeg izraza, i bloka izraza izvršenih za svaku iteraciju petlje"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "od-do-za petlja"},
"dropletBlock_functionParams_n_description":function(d){return "Skup izraza koji uzima jedan ili više parametara, i obavlja zadatak ili izračunava vrijednost kada je funkcija pozvana"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "Definiraj funkciju sa parametrima"},
"dropletBlock_functionParams_none_description":function(d){return "Skup izjava koji izvršavaju zadatak ili računaju vrijednost pri pozivu funkcije"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "Definiraj funkciju"},
"dropletBlock_getTime_description":function(d){return "Uzmi trenutno vrijeme u milisekundama"},
"dropletBlock_greaterThanOperator_description":function(d){return "Compare two numbers"},
"dropletBlock_greaterThanOperator_param0":function(d){return "x"},
"dropletBlock_greaterThanOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_greaterThanOperator_param1":function(d){return "y"},
"dropletBlock_greaterThanOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_greaterThanOperator_signatureOverride":function(d){return "Greater than operator"},
"dropletBlock_ifBlock_description":function(d){return "Izvršava blok izraza ako je dati uvjet istinit"},
"dropletBlock_ifBlock_signatureOverride":function(d){return "ako izjava"},
"dropletBlock_ifElseBlock_description":function(d){return "Izvršava blok izraza ako je dati uvjet istinit; u suprotnom, izvršava se blok izraza u \"inače\" dijelu"},
"dropletBlock_ifElseBlock_signatureOverride":function(d){return "ako/inače izraz"},
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
"dropletBlock_mathAbs_description":function(d){return "Uzima apsolutnu vrijednost od x"},
"dropletBlock_mathAbs_param0":function(d){return "x"},
"dropletBlock_mathAbs_param0_description":function(d){return "An arbitrary number."},
"dropletBlock_mathAbs_signatureOverride":function(d){return "Math.Abs(x)"},
"dropletBlock_mathMax_description":function(d){return "Uzima maksimalnu vrijednost of jedne ili više vrijednosti n1, n2,..., nX"},
"dropletBlock_mathMax_param0":function(d){return "n1, n2,..., nX"},
"dropletBlock_mathMax_param0_description":function(d){return "One or more numbers to compare."},
"dropletBlock_mathMax_signatureOverride":function(d){return "Math.Max (n1, n2,..., nX)"},
"dropletBlock_mathMin_description":function(d){return "Uzima najmanju vrijednost jedne ili više vrijednosti n1, n2,..., nX"},
"dropletBlock_mathMin_param0":function(d){return "n1, n2,..., nX"},
"dropletBlock_mathMin_param0_description":function(d){return "One or more numbers to compare."},
"dropletBlock_mathMin_signatureOverride":function(d){return "Math.min (n1, n2,..., nX)"},
"dropletBlock_mathRandom_description":function(d){return "Vraća broj između vrijednosti 0 (uključujući nulu) pa sve do vrijednosti 1 (ne uključujući jedan)"},
"dropletBlock_mathRandom_signatureOverride":function(d){return "Matematički.slučajno()"},
"dropletBlock_mathRound_description":function(d){return "Round to the nearest integer"},
"dropletBlock_mathRound_param0":function(d){return "x"},
"dropletBlock_mathRound_param0_description":function(d){return "An arbitrary number."},
"dropletBlock_mathRound_signatureOverride":function(d){return "Math.round(x)"},
"dropletBlock_multiplyOperator_description":function(d){return "Pomnoži dva broja"},
"dropletBlock_multiplyOperator_signatureOverride":function(d){return "Multiply operator"},
"dropletBlock_notOperator_description":function(d){return "Vraća neistinito ako se izraz može pretvoriti u istinito; inače, vraća istinito"},
"dropletBlock_notOperator_signatureOverride":function(d){return "AND boolean operator"},
"dropletBlock_orOperator_description":function(d){return "Vraća istinito ako je jedan od izraza istinit, i neistinito u suprotnom"},
"dropletBlock_orOperator_signatureOverride":function(d){return "ILI logički operator"},
"dropletBlock_randomNumber_min_max_description":function(d){return "Returns a random number ranging from the first number (min) to the second number (max), including both numbers in the range"},
"dropletBlock_randomNumber_param0":function(d){return "min."},
"dropletBlock_randomNumber_param0_description":function(d){return "Vraća najmanji broj"},
"dropletBlock_randomNumber_param1":function(d){return "max."},
"dropletBlock_randomNumber_param1_description":function(d){return "Vrača največi broj"},
"dropletBlock_randomNumber_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_return_description":function(d){return "Vrati vrijednost iz funkcije"},
"dropletBlock_return_signatureOverride":function(d){return "vrati"},
"dropletBlock_setAttribute_description":function(d){return "Postavlja zadanu vrijednost"},
"dropletBlock_subtractOperator_description":function(d){return "Oduzmi dva broja"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_whileBlock_description":function(d){return "Stvara petlju koja se sastoji od uvjetnog izraza i bloka izraza koji se izvršavaju pri svakoj iteraciji petlje. Petlja se nastavlja izvršavati sve dok je uvjet istinit"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "dok petlja"},
"emptyBlockInFunction":function(d){return "Funkciji "+common_locale.v(d,"name")+" nedostaje unešena vrijednost."},
"emptyBlockInVariable":function(d){return "Promjenjivoj "+common_locale.v(d,"name")+" nije dodijeljena vrijednost."},
"emptyBlocksErrorMsg":function(d){return "Da bi blokovi \"Ponovi\" ili \"Ako\" radili, u njih treba ugraditi druge blokove. Provjeri uklapa li se unutarnji blok pravilno u vanjski blok."},
"emptyExampleBlockErrorMsg":function(d){return "Potrebno vam je najmanje dva primjera u funkciji "+common_locale.v(d,"functionName")+". Pobrinite se da svaki primjer ima poziv funkcije i rezultat."},
"emptyFunctionBlocksErrorMsg":function(d){return "Funkcijski blok treba u sebi sadržavati druge blokove da bi mogao raditi."},
"emptyFunctionalBlock":function(d){return "Imaš nepopunjen blok."},
"emptyTopLevelBlock":function(d){return "Nema blokova za kretanje. Morate dodati blokove "+common_locale.v(d,"topLevelBlockName")+" bloku."},
"end":function(d){return "kraj"},
"errorEmptyFunctionBlockModal":function(d){return "Moraš staviti blokove unutar definicije funkcije. Klikni na \"uredi\" i dovuci blokove unutar zelenog bloka."},
"errorIncompleteBlockInFunction":function(d){return "Klikni na \"uredi\" da budeš siguran da nijedan blok ne nedostaje unutar tvoje definicije funkcije."},
"errorParamInputUnattached":function(d){return "Sjeti se da prikačiš blok za svaki unos parametra na blok funkcije na svojoj radnoj površini."},
"errorQuestionMarksInNumberField":function(d){return "Pokušaj zamijeniti \"???\" sa nekom vrijednošću."},
"errorRequiredParamsMissing":function(d){return "Napravi parametar za svoju funkciju tako da što ćeš kliknuti na \"uredi\" i dodati neophodne parametre. Dovuci nove blokove parametara u svoju definiciju funkcije."},
"errorUnusedFunction":function(d){return "Napravio si funkciju, ali je nikad nisi koristio na svojoj radnoj površini! Klikni na \"Funkcije\" na alatnoj traci i pobrini se da je iskoristiš u svom programu."},
"errorUnusedParam":function(d){return "Dodao si blok parametara, ali ga nisi koristio u definiciji. Pobrini se da koristiš svoj parametar tako da klikneš na \"uredi\" i staviš blok parametara unutar zelenog bloka."},
"exampleErrorMessage":function(d){return "Funkcija "+common_locale.v(d,"functionName")+" ima jedan ili više primjera kojima treba podešavanje. Pobrinite se da se podudaraju sa vašom definicijom i odgovorite na pitanje."},
"examplesFailedOnClose":function(d){return "Jedan ili više primjera se ne slaže sa vašom definicijom. Provjerite svoje primjere prije nego zatvorite"},
"extraTopBlocks":function(d){return "Imaš neprivezane blokove."},
"extraTopBlocksWhenRun":function(d){return "Imaš neprivezane blokove. Da li si mislio/la da ih prikačiš za \"pri pokretanju\" blok?"},
"finalStage":function(d){return "Čestitamo! Posljednja faza je završena."},
"finalStageTrophies":function(d){return "Čestitamo! Završena je posljednja faza i osvajaš "+common_locale.p(d,"numTrophies",0,"en",{"one":"trofej","other":common_locale.n(d,"numTrophies")+" trofeja"})+"."},
"finish":function(d){return "Završi"},
"generatedCodeInfo":function(d){return "Čak i vrhunski univerziteti podučavaju kodiranje pomoću blokova (npr. "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+"). Ali u suštini, blokovi koje si spojio se mogu prikazati kao kôd u JavaScript'u, najkorištenijem programskom jeziku na svijetu:"},
"hashError":function(d){return "Nažalost, '%1' ne odgovara nijednom snimljenom programu."},
"help":function(d){return "Pomoć"},
"hideToolbox":function(d){return "(Sakrij)"},
"hintHeader":function(d){return "Evo jedan savjet:"},
"hintRequest":function(d){return "Pogledaj savjet"},
"hintTitle":function(d){return "Savjet:"},
"ignore":function(d){return "Ignoriši"},
"infinity":function(d){return "Beskonačnost"},
"jump":function(d){return "skoči"},
"keepPlaying":function(d){return "Nastaviti Igrati"},
"levelIncompleteError":function(d){return "Koristiš sve potrebne vrste blokova, ali na pogrešan način."},
"listVariable":function(d){return "lista"},
"makeYourOwnFlappy":function(d){return "Napravi Svoju vlastitu Flappy igricu"},
"missingRecommendedBlocksErrorMsg":function(d){return "Ne baš. Probajte da upotrijebite blok koji niste iskoristili."},
"missingRequiredBlocksErrorMsg":function(d){return "Ne baš. Morate iskoristiti blok koji niste upotrijebili."},
"nestedForSameVariable":function(d){return "Koristite istu varijablu unutar dvije ili više ugniježdenih petlji. Koristite jedinstvenu promjenjivu kako bi ste izbjegli beskonačne petlje."},
"nextLevel":function(d){return "Čestitamo! Zadatak "+common_locale.v(d,"puzzleNumber")+" je riješen."},
"nextLevelTrophies":function(d){return "Čestitamo! Riješivši Zadatak "+common_locale.v(d,"puzzleNumber")+" osvajaš "+common_locale.p(d,"numTrophies",0,"en",{"one":"trofej","other":common_locale.n(d,"numTrophies")+" trofeja"})+"."},
"nextPuzzle":function(d){return "Sledeča zagonetka"},
"nextStage":function(d){return "Čestitke! Završio si "+common_locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Čestitamo! Završio si fazu "+common_locale.v(d,"stageName")+" i osvojio "+common_locale.p(d,"numTrophies",0,"en",{"one":"trofej","other":common_locale.n(d,"numTrophies")+" trofeja"})+"."},
"numBlocksNeeded":function(d){return "Čestitamo! Zadatak "+common_locale.v(d,"puzzleNumber")+" je riješen. (Međutim, mogao si samo iskoristiti "+common_locale.p(d,"numBlocks",0,"en",{"one":"1 blok","other":common_locale.n(d,"numBlocks")+" blokova"})+".)"},
"numLinesOfCodeWritten":function(d){return "Upravo si napisao "+common_locale.p(d,"numLines",0,"en",{"one":"1 liniju","other":common_locale.n(d,"numLines")+" linija"})+" kôda!"},
"openWorkspace":function(d){return "Kako To Radi"},
"orientationLock":function(d){return "U postavkama uređaja isključi blokadu orijentacije."},
"play":function(d){return "igraj"},
"print":function(d){return "Isprintaj"},
"puzzleTitle":function(d){return "Zadatak "+common_locale.v(d,"puzzle_number")+" od "+common_locale.v(d,"stage_total")},
"readonlyWorkspaceHeader":function(d){return "Prikaži samo: "},
"repeat":function(d){return "ponovi"},
"resetProgram":function(d){return "Resetuj"},
"rotateText":function(d){return "Okreni svoj uređaj."},
"runProgram":function(d){return "Pokreni"},
"runTooltip":function(d){return "Pokreni program određen blokovima na radnom prostoru."},
"runtimeErrorMsg":function(d){return "Vaš program nije uspješno izvršen. Molim izbrišite liniju "+common_locale.v(d,"lineNumber")+" i pokušajte ponovo."},
"saveToGallery":function(d){return "Snimi u galeriju"},
"savedToGallery":function(d){return "Snimljeno u galeriju!"},
"score":function(d){return "bodovi"},
"sendToPhone":function(d){return "Send To Phone"},
"shareFailure":function(d){return "Žalim, ali ne možemo dijeliti ovaj program."},
"shareWarningsAge":function(d){return "Molimo vas da unesete svoje ime ispod da kliknete na OK."},
"shareWarningsMoreInfo":function(d){return "Opširnije"},
"shareWarningsStoreData":function(d){return "Ova aplikacija se zasniva na podacima Code Studio trgovina koje mogu svi pogledati preko linka za razmjenu, s'toga pazite ukoliko vam se bude tražilo da unesete lične podatke."},
"showBlocksHeader":function(d){return "Pokaži Blokove"},
"showCodeHeader":function(d){return "Pokaži Kôd"},
"showGeneratedCode":function(d){return "Pokaži kôd"},
"showTextHeader":function(d){return "Prikaži tekst"},
"showToolbox":function(d){return "Prikaži Alatni okvir"},
"showVersionsHeader":function(d){return "Historija verzije"},
"signup":function(d){return "Registrirajte se na početni kurs"},
"stringEquals":function(d){return "string=?"},
"submit":function(d){return "Potvrdi"},
"submitYourProject":function(d){return "Pošaljite svoj projekat"},
"submitYourProjectConfirm":function(d){return "Ne možete vršiti izmjene na svom projektu nakon što ga pošaljete, zbilja šaljete?"},
"unsubmit":function(d){return "Poništi objavu"},
"unsubmitYourProject":function(d){return "Opozovite svoj projekat"},
"unsubmitYourProjectConfirm":function(d){return "Ukoliko opozovete svoj projekat resetovat ćete datum slanja, zbilja opozivate?"},
"subtitle":function(d){return "grafičko okruženje za programiranje"},
"syntaxErrorMsg":function(d){return "Vaš program ima pogrešku. Molimo vas da uklonite liniju "+common_locale.v(d,"lineNumber")+" i da pokušate ponovo."},
"textVariable":function(d){return "tekst"},
"toggleBlocksErrorMsg":function(d){return "Trebaš ispraviti grešku u svom programu prije nego što može biti prikazan u obliku blokova."},
"tooFewBlocksMsg":function(d){return "Koristiš sve neophodne vrste blokova, ali za rješavanje ovog zadatka pokušaj koristiti više ovakvih blokova."},
"tooManyBlocksMsg":function(d){return "Ovaj zadatak se može riješiti sa <x id='START_SPAN'/><x id='END_SPAN'/> blokova."},
"tooMuchWork":function(d){return "Uh, baš sam se naradio! Možeš li mi sada dati uputstva sa manje ponavljanja?"},
"toolboxHeader":function(d){return "Blokovi"},
"toolboxHeaderDroplet":function(d){return "Alatni okvir"},
"totalNumLinesOfCodeWritten":function(d){return "Sveukupno: "+common_locale.p(d,"numLines",0,"en",{"one":"1 linija","other":common_locale.n(d,"numLines")+" linija"})+" kôda."},
"tryAgain":function(d){return "Pokušaj ponovo"},
"tryBlocksBelowFeedback":function(d){return "Probajte upotrijebiti jedan od blokova ispod:"},
"tryHOC":function(d){return "Isprobaj Sat Kodiranja"},
"unnamedFunction":function(d){return "Imate promjenjivu ili funkciju koja nema imena. Ne zaboravite da svemu dodijelite ime koje ga opisuje."},
"wantToLearn":function(d){return "Želiš li naučiti programirati?"},
"watchVideo":function(d){return "Pogledaj Video"},
"when":function(d){return "kada"},
"whenRun":function(d){return "pri pokretanju"},
"workspaceHeaderShort":function(d){return "Radni prostor: "},
"hintPrompt":function(d){return "Need help?"},
"hintReviewTitle":function(d){return "Review Your Hints"},
"hintSelectInstructions":function(d){return "Instructions and old hints"},
"hintSelectNewHint":function(d){return "Get a new hint"}};