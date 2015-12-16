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
"and":function(d){return "ve"},
"backToPreviousLevel":function(d){return "Önceki seviyeye dön"},
"blocklyMessage":function(d){return "Parçalı"},
"blocks":function(d){return "bloklar"},
"booleanFalse":function(d){return "false"},
"booleanTrue":function(d){return "doğru"},
"catActions":function(d){return "Eylemler"},
"catColour":function(d){return "Renk"},
"catLists":function(d){return "Listeler"},
"catLogic":function(d){return "Mantık"},
"catLoops":function(d){return "Döngüler"},
"catMath":function(d){return "Matematik"},
"catProcedures":function(d){return "Fonksiyonlar"},
"catText":function(d){return "yazı"},
"catVariables":function(d){return "Değişkenler"},
"clearPuzzle":function(d){return "Baştan Başla"},
"clearPuzzleConfirm":function(d){return "Bu, bulmacayı başlangıç durumuna sıfırlayacak ve eklediğiniz veya değiştirdiğiniz tüm blokları silecek."},
"clearPuzzleConfirmHeader":function(d){return "Baştan başlamak istediğinizden emin misiniz?"},
"codeMode":function(d){return "Kod"},
"codeTooltip":function(d){return "Oluşturulan JavaScript kodunu gör."},
"completedWithoutRecommendedBlock":function(d){return "Tebrikler! "+common_locale.v(d,"puzzleNumber")+" numaralı bulmacayı çözdünüz. (Ama daha güçlü kodlar kullanarakta yapabilirsiniz.)"},
"continue":function(d){return "Devam Et"},
"copy":function(d){return "Kopyala"},
"defaultTwitterText":function(d){return "Ne yaptığıma bakın"},
"designMode":function(d){return "Tasarım"},
"dialogCancel":function(d){return "İptal"},
"dialogOK":function(d){return "TAMAM"},
"directionEastLetter":function(d){return "D"},
"directionNorthLetter":function(d){return "K"},
"directionSouthLetter":function(d){return "G"},
"directionWestLetter":function(d){return "B"},
"dropletBlock_addOperator_description":function(d){return "iki sayı ekle"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Operatör ekle"},
"dropletBlock_andOperator_description":function(d){return "Sadece iki ifade de doğru ise doğru, aksi halde yanlış döndürür"},
"dropletBlock_andOperator_signatureOverride":function(d){return "VE mantıksal operatörü"},
"dropletBlock_assign_x_description":function(d){return "Mevcut bir değişkene bir değer atar. Örneğin, x = 0;"},
"dropletBlock_assign_x_param0":function(d){return "x"},
"dropletBlock_assign_x_param0_description":function(d){return "Atanan değişkenin adı"},
"dropletBlock_assign_x_param1":function(d){return "value"},
"dropletBlock_assign_x_param1_description":function(d){return "Değişkene atanan değer."},
"dropletBlock_assign_x_signatureOverride":function(d){return "Bir değişken atar"},
"dropletBlock_callMyFunction_description":function(d){return "Parametre almayan isim verilmiş fonksiyonu çağırır"},
"dropletBlock_callMyFunction_n_description":function(d){return "Bir yada daha fazla parametre alan isim verilmiş fonksiyonu çağırır"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Parametreler ile bir fonksiyon çağır"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Bir fonksiyon çağırır"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "Create a variable and initialize it as an array"},
"dropletBlock_declareAssign_x_array_1_4_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_array_1_4_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_array_1_4_param1":function(d){return "1,2,3,4"},
"dropletBlock_declareAssign_x_array_1_4_param1_description":function(d){return "Dizi için başlangıç değerleri"},
"dropletBlock_declareAssign_x_array_1_4_signatureOverride":function(d){return "Bir diziye atanmış bir değişken tanımlayın"},
"dropletBlock_declareAssign_x_description":function(d){return "'var' ifadesinden sonra belirtilen isimle bir değişken tanımlar ve değişkene eşitliğin sağ tarafındaki değeri atar"},
"dropletBlock_declareAssign_x_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_param1":function(d){return "0"},
"dropletBlock_declareAssign_x_param1_description":function(d){return "Değişkenin başlangıç değeri"},
"dropletBlock_declareAssign_x_prompt_description":function(d){return "Create a variable and assign it a value by displaying a prompt"},
"dropletBlock_declareAssign_x_prompt_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_prompt_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_prompt_param1":function(d){return "\"Değeri girin\""},
"dropletBlock_declareAssign_x_prompt_param1_description":function(d){return "Kullanıcının, kendisinden bir değer girmesi istendiğinde açılır pencerede göreceği metin"},
"dropletBlock_declareAssign_x_prompt_signatureOverride":function(d){return "Kullanıcıdan bir değer ister ve onu saklayın"},
"dropletBlock_declareAssign_x_promptNum_description":function(d){return "Declares that the code will now use a variable and assign it an initial numerical value provided by the user"},
"dropletBlock_declareAssign_x_promptNum_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_promptNum_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_promptNum_param1":function(d){return "\"Değeri girin\""},
"dropletBlock_declareAssign_x_promptNum_param1_description":function(d){return "Kullanıcının, kendisinden bir değer girmesi istendiğinde açılır pencerede göreceği metin"},
"dropletBlock_declareAssign_x_promptNum_signatureOverride":function(d){return "Prompt the user for a numerical value and store it"},
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "Bir değişken tanımlayın"},
"dropletBlock_declareNoAssign_x_description":function(d){return "Declares a variable with the given name after 'var'"},
"dropletBlock_declareNoAssign_x_signatureOverride":function(d){return "Bir değişken tanımlayın"},
"dropletBlock_divideOperator_description":function(d){return "İki sayıyı bölün"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "Bölme operatörü"},
"dropletBlock_equalityOperator_description":function(d){return "Test for equality"},
"dropletBlock_equalityOperator_param0":function(d){return "x"},
"dropletBlock_equalityOperator_param0_description":function(d){return "İlk değer karşılaştırma için kullanılacak."},
"dropletBlock_equalityOperator_param1":function(d){return "y"},
"dropletBlock_equalityOperator_param1_description":function(d){return "İkinci değer karşılaştırma için kullanılacak."},
"dropletBlock_equalityOperator_signatureOverride":function(d){return "Eşitlik operatörü"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "Do something multiple times"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "döngü için"},
"dropletBlock_functionParams_n_description":function(d){return "A set of statements that takes in one or more parameters, and performs a task or calculate a value when the function is called"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "Parametrelerle birlikte bir fonksiyon tanımlayın"},
"dropletBlock_functionParams_none_description":function(d){return "A set of statements that perform a task or calculate a value when the function is called"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "Bir fonksiyon tanımlayın"},
"dropletBlock_getTime_description":function(d){return "Get the current time in milliseconds"},
"dropletBlock_greaterThanOperator_description":function(d){return "Compare two numbers"},
"dropletBlock_greaterThanOperator_param0":function(d){return "x"},
"dropletBlock_greaterThanOperator_param0_description":function(d){return "İlk değer karşılaştırma için kullanılacak."},
"dropletBlock_greaterThanOperator_param1":function(d){return "y"},
"dropletBlock_greaterThanOperator_param1_description":function(d){return "İkinci değer karşılaştırma için kullanılacak."},
"dropletBlock_greaterThanOperator_signatureOverride":function(d){return "Greater than operator"},
"dropletBlock_ifBlock_description":function(d){return "Do something only if a condition is true"},
"dropletBlock_ifBlock_signatureOverride":function(d){return "eğer ifadesi"},
"dropletBlock_ifElseBlock_description":function(d){return "Do something if a condition is true, otherwise do something else"},
"dropletBlock_ifElseBlock_signatureOverride":function(d){return "eğer/değilse ifadesi"},
"dropletBlock_inequalityOperator_description":function(d){return "Test for inequality"},
"dropletBlock_inequalityOperator_param0":function(d){return "x"},
"dropletBlock_inequalityOperator_param0_description":function(d){return "İlk değer karşılaştırma için kullanılacak."},
"dropletBlock_inequalityOperator_param1":function(d){return "y"},
"dropletBlock_inequalityOperator_param1_description":function(d){return "İkinci değer karşılaştırma için kullanılacak."},
"dropletBlock_inequalityOperator_signatureOverride":function(d){return "Inequality operator"},
"dropletBlock_lessThanOperator_description":function(d){return "Compare two numbers"},
"dropletBlock_lessThanOperator_param0":function(d){return "x"},
"dropletBlock_lessThanOperator_param0_description":function(d){return "İlk değer karşılaştırma için kullanılacak."},
"dropletBlock_lessThanOperator_param1":function(d){return "y"},
"dropletBlock_lessThanOperator_param1_description":function(d){return "İkinci değer karşılaştırma için kullanılacak."},
"dropletBlock_lessThanOperator_signatureOverride":function(d){return "Operatörden daha az"},
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
"dropletBlock_mathRandom_description":function(d){return "0 ile 1 arasında (0 dahil 1 dahil değil ) değişen rasgele bir sayı verir"},
"dropletBlock_mathRandom_signatureOverride":function(d){return "Math.random()"},
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
"dropletBlock_randomNumber_min_max_description":function(d){return "Returns a random number in the closed range from min to max."},
"dropletBlock_randomNumber_param0":function(d){return "min"},
"dropletBlock_randomNumber_param0_description":function(d){return "Minimum sayı döndü"},
"dropletBlock_randomNumber_param1":function(d){return "maks"},
"dropletBlock_randomNumber_param1_description":function(d){return "Maksimum sayı döndü"},
"dropletBlock_randomNumber_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_return_description":function(d){return "Return a value from a function"},
"dropletBlock_return_signatureOverride":function(d){return "geri dönme"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_subtractOperator_description":function(d){return "Subtract two numbers"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"emptyBlockInFunction":function(d){return "fonksiyonun "+common_locale.v(d,"isim")+" içi boş bir girişi vardır"},
"emptyBlockInVariable":function(d){return common_locale.v(d,"isim")+" isimli değişkenin içeriği boş."},
"emptyBlocksErrorMsg":function(d){return "\"Tekrar\" bloğu veya \"Eğer\" bloğunun çalışması için içlerinde başka bloklar yer almalıdır. İçteki bloğun taşıyıcı blok içine doğru bir şekilde yerleştiğinden emin ol."},
"emptyExampleBlockErrorMsg":function(d){return "En az 2 fonksiyona ihtiyacınız var. Her örneğin çağrıldığına ve sonuç döndüğüne emin olun."},
"emptyFunctionBlocksErrorMsg":function(d){return "Fonksiyon bloğunun çalışabilmesi için içine başka bloklar koymalısın."},
"emptyFunctionalBlock":function(d){return "Doldurulmamış bir giriş bloğunuz bulunuyor."},
"emptyTopLevelBlock":function(d){return "Çalıştırmak için blok yok. "+common_locale.v(d,"topLevelBlockName")+" bloğunu engellemek için iliştirmeniz gerekir."},
"end":function(d){return "son"},
"errorEmptyFunctionBlockModal":function(d){return "Fonksiyon tanımının içinde bloklara ihtiyacın var. \"Düzenle\" butonuna tıkla ve blokları yeşil bloğun içine sürükle."},
"errorIncompleteBlockInFunction":function(d){return "Fonksiyon tanımının içinde eksik blokların kalıp kalmadığından emin olmak için \"düzenle\" butonuna tıkla."},
"errorParamInputUnattached":function(d){return "Çalışma alanında bulunan fonksiyon bloğundaki her parametre girdisine bir blok eklemeyi unutma."},
"errorQuestionMarksInNumberField":function(d){return "\"???\" kısmını bir değerle değiştirmeyi deneyin."},
"errorRequiredParamsMissing":function(d){return "\"Düzenle\" butonuna tıklayarak ve gerekli parametreleri ekleyecek fonksiyonun için bir parametre yarat. Yeni parametre bloğunu, fonksiyon tanımının içine sürükle."},
"errorUnusedFunction":function(d){return "Bir fonksiyon yarattın ama çalışma alanında kullanmadın! Araç çubuğundaki \"fonksiyonlar\" kısmına tıkla ve fonksiyonunu programında kullandığına emin ol."},
"errorUnusedParam":function(d){return "Parametre bloğu ekledin ama bunu tanımında kullanmadın. \"Düzenle\" butonuna tıklayarak ve parametre bloğunu yeşil bloğun içine yerleştirerek parametreni kullandığından emin ol."},
"exampleErrorMessage":function(d){return common_locale.v(d,"functionName")+" fonksiyonunda bir ya da daha fazla örnekte düzeltme yapılmasına ihtiyaç vardırç Tanımla uyuştuğuna emin olun ve soruyu cevaplandırın."},
"examplesFailedOnClose":function(d){return "Bir veya daha fazla örneğiniz tanımınızla uyuşmuyor. Örneklerinizi kapatmadan önce kontrol ediniz"},
"extraTopBlocks":function(d){return "Bağımsız bloğa sahipsin."},
"extraTopBlocksWhenRun":function(d){return "Bağlanmamış komutlarınız var. Bunları \"Çalıştığı zaman\" komutuna mı bağlamak istemiştin?"},
"finalStage":function(d){return "Son aşamayı bitirdiniz. Tebrikler!"},
"finalStageTrophies":function(d){return "Tebrikler! Son aşamayı bitirerek "+common_locale.p(d,"numTrophies",0,"tr",{"one":"bir ganimet","other":common_locale.n(d,"numTrophies")+" ganimet"})+" kazandınız."},
"finish":function(d){return "Bitiş"},
"generatedCodeInfo":function(d){return "Dünyanın en iyi üniversiteleri bile yap-boz oyun tabanlı kodlama öğretiyor (Örn. "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+"). Ayrıca detaylı incelerseniz, birleştirdiğiniz bloklar dünyanın en yaygın kullanılan kodlama dili olan JavaScript dilinde de görüntüleniyor:"},
"hashError":function(d){return "Üzgünüz, '%1' kayıtlı herhangi bir programa karşılık gelmez."},
"help":function(d){return "Yardım"},
"hideToolbox":function(d){return "(Gizle)"},
"hintHeader":function(d){return "İşte bir ipucu:"},
"hintRequest":function(d){return "İpucunu gör"},
"hintTitle":function(d){return "İpucu:"},
"ignore":function(d){return "Yoksay"},
"infinity":function(d){return "Sonsuz"},
"jump":function(d){return "zıpla"},
"keepPlaying":function(d){return "Oynamaya devam et"},
"levelIncompleteError":function(d){return "Tüm gerekli türdeki blokları kullanıyorsunuz ama doğru şekilde değil."},
"listVariable":function(d){return "liste"},
"makeYourOwnFlappy":function(d){return "Kendi Flappy Oyununu Yap"},
"missingRecommendedBlocksErrorMsg":function(d){return "Yaklaştın. Farklı blokları da kullanmayı deneyin."},
"missingRequiredBlocksErrorMsg":function(d){return "Yaklaştın. Kullanman gereken bloğu henüz kullanmadın."},
"nestedForSameVariable":function(d){return "İki veya daha fazla iç içe geçmiş döngülerin içinde aynı değişkeni kullanıyorsun. Benzersiz değişken kullanarak sonsuz döngüyü önleyin."},
"nextLevel":function(d){return "Tebrikler! Bulmaca "+common_locale.v(d,"puzzleNumber")+" tamamlandı."},
"nextLevelTrophies":function(d){return "Tebrikler! Bulmaca "+common_locale.v(d,"puzzleNumber")+" tamamlandı ve "+common_locale.p(d,"numTrophies",0,"tr",{"one":"bir kupa","other":common_locale.n(d,"numTrophies")+"  kupa"})+" kazandınız."},
"nextPuzzle":function(d){return "Sonraki bulmaca"},
"nextStage":function(d){return "Tebrikler! "+common_locale.v(d,"stageName")+" tamamlandı."},
"nextStageTrophies":function(d){return "Tebrikler! Kademe "+common_locale.v(d,"stageNumber")+" tamamlandı ve "+common_locale.p(d,"numTrophies",0,"tr",{"one":"bir kupa","other":common_locale.n(d,"numTrophies")+" kupalar"})+" kazandınız."},
"numBlocksNeeded":function(d){return "Tebrikler! Bulmaca "+common_locale.v(d,"puzzleNumber")+" tamamlandı. (Ancak, sadece "+common_locale.p(d,"numBlocks",0,"tr",{"one":"1 blok","other":common_locale.n(d,"numBlocks")+" blok"})+" kullanmış olabilirdiniz.)"},
"numLinesOfCodeWritten":function(d){return "Tam olarak "+common_locale.p(d,"numLines",0,"tr",{"one":"1 satır","other":common_locale.n(d,"numLines")+" satır"})+" kod yazdınız!"},
"openWorkspace":function(d){return "Nasıl Çalışır"},
"orientationLock":function(d){return "Yönlendirme kilidini aygıt ayarlarından devre dışı bırakın."},
"play":function(d){return "oynat"},
"print":function(d){return "Yazdır"},
"puzzleTitle":function(d){return "Bulmaca "+common_locale.v(d,"puzzle_number")+" / "+common_locale.v(d,"stage_total")},
"readonlyWorkspaceHeader":function(d){return "Yalnızca görüntüleme: "},
"repeat":function(d){return "bu işlemleri"},
"resetProgram":function(d){return "Yeniden başla"},
"rotateText":function(d){return "Cihazınızı döndürün."},
"runProgram":function(d){return "Çalıştır"},
"runTooltip":function(d){return "Çalişma alaninda bloklar tarafından tanımlanmış bir program çalıştır."},
"runtimeErrorMsg":function(d){return "Programınız başarılı şekilde çalışmadı. Lütfen "+common_locale.v(d,"lineNumber")+" satırını kaldırınız ve tekrar deneyiniz."},
"saveToGallery":function(d){return "Galerisine Kaydet"},
"savedToGallery":function(d){return "Galeri klasörüne kaydedilmiş!"},
"score":function(d){return "puan"},
"sendToPhone":function(d){return "Telefona Gönder"},
"shareFailure":function(d){return "Üzgünüz, bu programı paylaşamıyoruz."},
"shareWarningsAge":function(d){return "Lütfen yaşınızı aşağıya giriniz ve devam etmek için TAMAM'a tıklayınız."},
"shareWarningsMoreInfo":function(d){return "Daha fazla bilgi"},
"shareWarningsStoreData":function(d){return "Code Studio'da oluşturulmuş bu Uygulamada, bu paylaşım linki vasıtasıyla herhangi bir kişi tarafın görüntülenebilecek veriler saklanmaktadır, dolayısıyla eğer kişisel bilgileri vermeniz isteniyorsa dikkatli olunuz.\n"},
"showBlocksHeader":function(d){return "Bloklarını göster"},
"showCodeHeader":function(d){return "Kodu Görüntüle"},
"showGeneratedCode":function(d){return "Kodu Görüntüle"},
"showTextHeader":function(d){return "Metni göster"},
"showToolbox":function(d){return "Araç kutusunu göster"},
"showVersionsHeader":function(d){return "Versiyon Geçmişi"},
"signup":function(d){return "Giriş dersi için üye olun"},
"stringEquals":function(d){return "dizi=?"},
"submit":function(d){return "Gönder"},
"submitYourProject":function(d){return "Projenizi gönderin"},
"submitYourProjectConfirm":function(d){return "Projenizi gönderdikten sonra düzenleyemezsiniz, gerçekten göndermek istiyormusunuz?"},
"unsubmit":function(d){return "Gönderme"},
"unsubmitYourProject":function(d){return "Projeni gönderme"},
"unsubmitYourProjectConfirm":function(d){return "Gönderilmeyen projeleriniz gönderi tarihini sıfırlayacaktır, onaylıyor musunuz?"},
"subtitle":function(d){return "Bir görsel programa ortamı"},
"syntaxErrorMsg":function(d){return "Programınızda yazım hatası var. Lütfen "+common_locale.v(d,"lineNumber")+" satırını çıkartınız ve tekrar deneyiniz."},
"textVariable":function(d){return "metin"},
"toggleBlocksErrorMsg":function(d){return "Bloklar halinde gösterilebilmesi için programındaki bir hatayı düzeltmelisin."},
"tooFewBlocksMsg":function(d){return "Tüm gerekli blok türlerini kullanıyorsun,fakat bulmacayı tamamlamak için bu blok tiplerinden daha fazla kullanmayı dene."},
"tooManyBlocksMsg":function(d){return "Bu bulmaca <x id='START_SPAN'/><x id='END_SPAN'/> bloklarıyla çözülebilir."},
"tooMuchWork":function(d){return "Bana çok fazla iş yaptırdın!Daha az tekrar etmeyi deneyebilir misin ?"},
"toolboxHeader":function(d){return "bloklar"},
"toolboxHeaderDroplet":function(d){return "Araç kutusu"},
"totalNumLinesOfCodeWritten":function(d){return "Toplam: "+common_locale.p(d,"numLines",0,"tr",{"one":"1 satır","other":common_locale.n(d,"numLines")+" satır"})+" kod."},
"tryAgain":function(d){return "Tekrar dene"},
"tryBlocksBelowFeedback":function(d){return "Aşağıdaki bloklardan birini kullanmayı deneyin:"},
"tryHOC":function(d){return "Kodlama Saati'ni Deneyin"},
"unnamedFunction":function(d){return "İsmi olmayan bir fonksiyon veya değişkeniniz var. Her şeye tanımlayıcı bir isim vermeyi unutmayın."},
"wantToLearn":function(d){return "Kod yazmayı öğrenmek ister misiniz?"},
"watchVideo":function(d){return "Videoyu İzle"},
"when":function(d){return "Ne zaman"},
"whenRun":function(d){return "Çalıştığı zaman"},
"workspaceHeaderShort":function(d){return "Çalışma alanı: "},
"dropletBlock_randomNumber_description":function(d){return "Returns a random number in the closed range from min to max."}};