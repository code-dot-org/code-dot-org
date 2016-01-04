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
"and":function(d){return "και"},
"backToPreviousLevel":function(d){return "Πίσω στο προηγούμενο επίπεδο"},
"blocklyMessage":function(d){return "Blockly"},
"blocks":function(d){return "μπλοκ"},
"booleanFalse":function(d){return "ψευδές"},
"booleanTrue":function(d){return "Αληθές"},
"catActions":function(d){return "Ενέργειες"},
"catColour":function(d){return "Χρώμα"},
"catLists":function(d){return "Λίστες"},
"catLogic":function(d){return "Λογική"},
"catLoops":function(d){return "Βρόχοι"},
"catMath":function(d){return "Μαθηματικά"},
"catProcedures":function(d){return "Συναρτήσεις"},
"catText":function(d){return "κείμενο"},
"catVariables":function(d){return "Μεταβλητές"},
"clearPuzzle":function(d){return "Ξεκινήστε από την αρχή"},
"clearPuzzleConfirm":function(d){return "Αυτό θα επαναφέρει το παζλ στην αρχική του κατάσταση και θα διαγράψει όλα τα μποκ που προσθέσατε ή αλλάξατε."},
"clearPuzzleConfirmHeader":function(d){return "Είστε βέβαιος ότι θέλετε να ξεκινήσετε από την αρχή;"},
"codeMode":function(d){return "Κώδικας"},
"codeTooltip":function(d){return "Δείτε τον κώδικα JavaScript."},
"completedWithoutRecommendedBlock":function(d){return "Συγχαρητήρια! Ολοκλήρωσες το Παζλ "+common_locale.v(d,"puzzleNumber")+". (Αλλά θα μπορούσες να χρησιμοποιήσεις ένα μπλοκ για καλύτερο κώδικα.)"},
"continue":function(d){return "Συνέχεια"},
"copy":function(d){return "Αντιγραφή"},
"defaultTwitterText":function(d){return "Δείτε τι έκανα"},
"designMode":function(d){return "Σχεδίαση"},
"dialogCancel":function(d){return "Άκυρο"},
"dialogOK":function(d){return "OΚ"},
"directionEastLetter":function(d){return "Α"},
"directionNorthLetter":function(d){return "Β"},
"directionSouthLetter":function(d){return "Ν"},
"directionWestLetter":function(d){return "Δ"},
"dropletBlock_addOperator_description":function(d){return "Πρόσθεση δύο αριθμών"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Τελεστής πρόσθεσης"},
"dropletBlock_andOperator_description":function(d){return "Επιστρέφει αληθές μόνο όταν και οι δύο εκφράσεις είναι αληθείς ή ψευδείς διαφορετικά"},
"dropletBlock_andOperator_signatureOverride":function(d){return "διαδικός τελεστής ΚΑΙ"},
"dropletBlock_assign_x_description":function(d){return "Αναθέτει μία τιμή σε μία υπάρχουσα μεταβλητή. Για παράδειγμα, x = 0."},
"dropletBlock_assign_x_param0":function(d){return "x"},
"dropletBlock_assign_x_param0_description":function(d){return "Το όνομα μεταβλητής που θα γίνει η ανάθεση"},
"dropletBlock_assign_x_param1":function(d){return "τιμή"},
"dropletBlock_assign_x_param1_description":function(d){return "Η τιμή της μεταβλητής που θα γίνει η ανάθεση."},
"dropletBlock_assign_x_signatureOverride":function(d){return "Αναθέτει μια μεταβλητή"},
"dropletBlock_callMyFunction_description":function(d){return "Καλεί μία ονοματισμένη συνάρτηση που δε δέχεται παραμέτρους"},
"dropletBlock_callMyFunction_n_description":function(d){return "Καλεί μία ονοματισμένη συνάρτηση που δέχεται μία ή περισσότερες παραμέτρους"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Κάλεσε συνάρτηση με παραμέτρους"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Κάλεσε μία συνάρτηση"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "Δηλώνει μια μεταβλητή και την αναθέτει σε ένα πίνακα με τις δοσμένες αρχικές τιμές"},
"dropletBlock_declareAssign_x_array_1_4_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_array_1_4_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_array_1_4_param1":function(d){return "1,2,3,4"},
"dropletBlock_declareAssign_x_array_1_4_param1_description":function(d){return "The initial values to the array"},
"dropletBlock_declareAssign_x_array_1_4_signatureOverride":function(d){return "Δήλωσε μία μεταβλητή η οποία έχει ανατεθεί σε ένα πίνακα"},
"dropletBlock_declareAssign_x_description":function(d){return "Ορίζει μία μεταβλητή με το δεδομένο όνομα μετά το 'var' και θέτει την τιμή τις σε αυτήν που βρίσκεται στα δεξιά της έκφρασης"},
"dropletBlock_declareAssign_x_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_param1":function(d){return "0"},
"dropletBlock_declareAssign_x_param1_description":function(d){return "The initial value of the variable"},
"dropletBlock_declareAssign_x_prompt_description":function(d){return "Δηλώνει ότι ο κώδικας θα χρησιμοποιήσει μία μεταβλητή και θα της αναθέσει μία αρχική τιμή η οποία θα δοθεί από το χρήστη"},
"dropletBlock_declareAssign_x_prompt_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_prompt_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_prompt_param1":function(d){return "\"Enter value\""},
"dropletBlock_declareAssign_x_prompt_param1_description":function(d){return "The string the user will see in the pop up when asked to enter a value"},
"dropletBlock_declareAssign_x_prompt_signatureOverride":function(d){return "Ζήτησε από το χρήστη μία τιμή και αποθήκευσέ τη"},
"dropletBlock_declareAssign_x_promptNum_description":function(d){return "Declares that the code will now use a variable and assign it an initial numerical value provided by the user"},
"dropletBlock_declareAssign_x_promptNum_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_promptNum_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_promptNum_param1":function(d){return "\"Enter value\""},
"dropletBlock_declareAssign_x_promptNum_param1_description":function(d){return "The string the user will see in the pop up when asked to enter a value"},
"dropletBlock_declareAssign_x_promptNum_signatureOverride":function(d){return "Prompt the user for a numerical value and store it"},
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "Όρισε μία μεταβλητή"},
"dropletBlock_declareNoAssign_x_description":function(d){return "Declares a variable with the given name after 'var'"},
"dropletBlock_declareNoAssign_x_signatureOverride":function(d){return "Όρισε μία μεταβλητή"},
"dropletBlock_divideOperator_description":function(d){return "Διαιρεί δύο αριθμούς"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "Τελεστής διαίρεσης"},
"dropletBlock_equalityOperator_description":function(d){return "Ελέγχει αν δύο τιμές είναι ίσες. Επιστρέφει αληθές αν η τιμή στην αριστερή πλευρά της έκφρασης είναι ίση με την τιμή στην δεξιά πλευρά της έκφρασης, και ψευδές σε κάθε άλλη περίπτωση"},
"dropletBlock_equalityOperator_param0":function(d){return "x"},
"dropletBlock_equalityOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_equalityOperator_param1":function(d){return "y"},
"dropletBlock_equalityOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_equalityOperator_signatureOverride":function(d){return "Τελεστής ισότητας"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "Δημιουργεί ένα βρόχο που αποτελείται από μία έκφραση προετοιμασίας, μία έκφραση συνθήκης, μία έκφραση προσαύξησης και ένα μπλοκ από εντολές που εκτελούνται σε κάθε επανάληψη του βρόχου"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "βρόχος \"για\""},
"dropletBlock_functionParams_n_description":function(d){return "Ένα σύνολο εντολών που λαμβάνει μία ή περισσότερες παραμέτρους, και εκτελεί μία εργασία ή υπολογίζει μία τιμή όταν καλείται η συνάρτηση"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "Ορίζει μία συνάρτηση με παραμέτρους"},
"dropletBlock_functionParams_none_description":function(d){return "Ένα σετ εντολών που εκτελεί μία εργασία ή υπολογίζει μία τιμή όταν καλείται η συνάρτηση"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "Ορισμός μίας συνάρτησης"},
"dropletBlock_getTime_description":function(d){return "Παίρνει την τρέχουσα ώρα σε χιλιοστά του δευτερολέπτου"},
"dropletBlock_greaterThanOperator_description":function(d){return "Compare two numbers"},
"dropletBlock_greaterThanOperator_param0":function(d){return "x"},
"dropletBlock_greaterThanOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_greaterThanOperator_param1":function(d){return "y"},
"dropletBlock_greaterThanOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_greaterThanOperator_signatureOverride":function(d){return "Greater than operator"},
"dropletBlock_ifBlock_description":function(d){return "Εκτελεί ένα μπλοκ εντολών αν η καθορισμένη συνθήκη είναι αληθής"},
"dropletBlock_ifBlock_signatureOverride":function(d){return "δήλωση αν"},
"dropletBlock_ifElseBlock_description":function(d){return "Εκτελεί ένα μπλοκ εντολών αν η καθορισμένη συνθήκη είναι αληθής - διαφορετικά εκτελείται το μπλοκ των εντολών στο \"αλλιώς\""},
"dropletBlock_ifElseBlock_signatureOverride":function(d){return "δήλωση αν/αλλιώς"},
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
"dropletBlock_mathAbs_description":function(d){return "Παίρνει την απόλυτη τιμή του x"},
"dropletBlock_mathAbs_param0":function(d){return "x"},
"dropletBlock_mathAbs_param0_description":function(d){return "An arbitrary number."},
"dropletBlock_mathAbs_signatureOverride":function(d){return "Math.abs(x)"},
"dropletBlock_mathMax_description":function(d){return "Παίρνει τη μέγιστη τιμή μεταξύ μίας ή περισσοτέρων τιμών n1, n2, ..., nX"},
"dropletBlock_mathMax_param0":function(d){return "n1, n2,..., nX"},
"dropletBlock_mathMax_param0_description":function(d){return "One or more numbers to compare."},
"dropletBlock_mathMax_signatureOverride":function(d){return "Math.max(n1, n2, ..., nX)"},
"dropletBlock_mathMin_description":function(d){return "Παίρνει τη ελάχιστη τιμή μεταξύ μίας ή περισσοτέρων τιμών n1, n2, ..., nX"},
"dropletBlock_mathMin_param0":function(d){return "n1, n2,..., nX"},
"dropletBlock_mathMin_param0_description":function(d){return "One or more numbers to compare."},
"dropletBlock_mathMin_signatureOverride":function(d){return "Math.min(n1, n2, ..., nX)"},
"dropletBlock_mathRandom_description":function(d){return "Επιστρέφει έναν τυχαίο αριθμό από το 0 (συμπεριλαμβανόμενο) μέχρι, αλλά χωρίς να περιλαμβάνει, το 1"},
"dropletBlock_mathRandom_signatureOverride":function(d){return "Μαθηματικά.τυχαίος()"},
"dropletBlock_mathRound_description":function(d){return "Round to the nearest integer"},
"dropletBlock_mathRound_param0":function(d){return "x"},
"dropletBlock_mathRound_param0_description":function(d){return "An arbitrary number."},
"dropletBlock_mathRound_signatureOverride":function(d){return "Math.round(x)"},
"dropletBlock_multiplyOperator_description":function(d){return "Πολλαπλασίασε δύο αριθμούς"},
"dropletBlock_multiplyOperator_signatureOverride":function(d){return "Multiply operator"},
"dropletBlock_notOperator_description":function(d){return "Επιστρέψει ψευδές αν η έκφραση μπορεί να μετατραπεί σε αληθής - διαφορετικά επιστρέφει αληθές"},
"dropletBlock_notOperator_signatureOverride":function(d){return "διαδικός τελεστής ΚΑΙ"},
"dropletBlock_orOperator_description":function(d){return "Επιστρέφει αληθές όταν οποιαδήποτε είναι αληθής, διαφορετικά επιστρέφει ψευδές"},
"dropletBlock_orOperator_signatureOverride":function(d){return "διαδικός τελεστής Ή"},
"dropletBlock_randomNumber_min_max_description":function(d){return "Returns a random number in the closed range from min to max."},
"dropletBlock_randomNumber_param0":function(d){return "ελάχιστο"},
"dropletBlock_randomNumber_param0_description":function(d){return "Επιστρέφεται ο ελάχιστον αριθμός"},
"dropletBlock_randomNumber_param1":function(d){return "μέγιστο"},
"dropletBlock_randomNumber_param1_description":function(d){return "Επιστρέφεται ο μέγιστος αριθμός"},
"dropletBlock_randomNumber_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_return_description":function(d){return "Επίστεψε μία τιμή από μία συνάρτηση"},
"dropletBlock_return_signatureOverride":function(d){return "επιστροφή"},
"dropletBlock_setAttribute_description":function(d){return "Ορίζει τη δεδομένη τιμή"},
"dropletBlock_subtractOperator_description":function(d){return "Αφαίρεσε δύο αριθμούς"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_whileBlock_description":function(d){return "Δημιουργεί ένα βρόχο που αποτελείται από μία έκφραση υπό συνθήκη και ένα μπλοκ εντολών που εκτελούνται σε κάθε επανάληψη του βρόχου. Ο βρόχος συνεχίζει να εκτελεταί όσο η συνθήκη υπολογίζεται ως αληθής"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "βρόχος ενώ"},
"emptyBlockInFunction":function(d){return "Η συνάρτηση "+common_locale.v(d,"name")+" έχει μία είσοδο που δεν έχει συμπληρωθεί."},
"emptyBlockInVariable":function(d){return "Η μεταβλητή "+common_locale.v(d,"name")+" έχει μία είσοδο που δεν έχει συμπληρωθεί."},
"emptyBlocksErrorMsg":function(d){return "Το μπλοκ του \"Repeat\" ή του \"If\" πρέπει να περιέχει άλλα μπλοκ για να δουλέψει. Σιγουρέψου ότι το εσωτερικό μπλοκ χωράει σωστά μέσα στο μπλόκ που το περιέχει."},
"emptyExampleBlockErrorMsg":function(d){return "Χρειάζεσαι τουλάχιστον δύο παραδείγματα στη συνάρτηση "+common_locale.v(d,"functionName")+". Βεβαιώσου ότι κάθε παράδειγμα έχει μία κλήση και ένα αποτέλεσμα."},
"emptyFunctionBlocksErrorMsg":function(d){return "Το μπλόκ της συνάρτησης χρειάζεται να έχει άλλα μπλοκ μέσα του για να δουλέψει."},
"emptyFunctionalBlock":function(d){return "Έχετε ένα μπλόκ με κενό περιεχόμενο."},
"emptyTopLevelBlock":function(d){return "Δεν υπάρχουν μπλοκ εντολών προς εκτέλεση. Πρέπει να επισυνάψεις ένα μπλοκ στο "+common_locale.v(d,"topLevelBlockName")+" μπλοκ."},
"end":function(d){return "τέλος"},
"errorEmptyFunctionBlockModal":function(d){return "Πρέπει να εισάγετε κάποια μπλοκ μέσα στον ορισμό της συνάρτησης. Κάντε κλικ στο κουμπί \"Επεξεργασία\" και σύρετε τα μπλοκς μέσα στο πράσινο μπλοκ."},
"errorIncompleteBlockInFunction":function(d){return "Κάντε κλικ στο κουμπί \"Επεξεργασία\" για να βεβαιωθείτε ότι δε λείπει κάποιο μπλοκ μέσα στον ορισμό της συνάρτησης."},
"errorParamInputUnattached":function(d){return "Θυμηθείτε να ενώσετε ένα μπλοκ σε κάθε παράμετρο εισόδου στο μπλοκ της συνάρτησης στο χώρο εργασίας σας."},
"errorQuestionMarksInNumberField":function(d){return "Δοκιμάστε να αντικαταστήσετε τα ερωτηματικά με μια τιμή."},
"errorRequiredParamsMissing":function(d){return "Δημιουργήστε μια παράμετρο για τη συνάρτησή σας κάνοντας κλικ στο \"Επεξεργασία\" και προσθέτοντας τις απαραίτητες παραμέτρους. Σύρετε τα νέα μπλοκ παραμέτρων μέσα στον ορισμό της συνάρτησής σας."},
"errorUnusedFunction":function(d){return "Δημιουργήσατε μια συνάρτηση, αλλά δεν τη χρησιμοποιήσατε στο χώρο εργασίας σας! Κάνε κλικ στο \"Συναρτήσεις\" στην εργαλειοθήκη και βεβαιωθείτε ότι τη χρησιμοποιείτε στο πρόγραμμά σας."},
"errorUnusedParam":function(d){return "Προσθέσατε ένα μπλοκ παραμέτρου, αλλά δεν το χρησιμοποιήσατε στον ορισμό. Για να χρησιμοποιήσετε την παράμετρο, κάντε κλικ στο \"Επεξεργασία\" και τοποθετήστε το μπλοκ παραμέτρου μέσα στο πράσινο μπλοκ."},
"exampleErrorMessage":function(d){return "Η συνάρτηση "+common_locale.v(d,"functionName")+" έχει ένα ή περισσότερα παραδείγματα που χρειάζονται τροποποίηση. Βεβαιώσου ότι συμφωνούν με τον ορισμό σας και απαντάνε στην ερώτηση."},
"examplesFailedOnClose":function(d){return "Ένα ή περισσότερα από τα παραδείγματα δεν συμφωνούν με τον ορισμό σας. Ελέγξτε τα παραδείγματά σας πριν την έξοδο"},
"extraTopBlocks":function(d){return "Έχεις ασύνδετα μπλοκ."},
"extraTopBlocksWhenRun":function(d){return "Έχεις ασύνδετα μπλοκ. Μήπως εννοείς να τα συνδέσεις στο μπλοκ \"όταν τρέχει\";"},
"finalStage":function(d){return "Συγχαρητήρια! τέλειωσες το τελικό στάδιο."},
"finalStageTrophies":function(d){return "Συγχαρητήρια! Τέλειωσες το τελευταίο στάδιο και κέρδισες "+common_locale.p(d,"numTrophies",0,"el",{"one":"τρόπαιο","other":common_locale.n(d,"numTrophies")+" τρόπαια"})+"."},
"finish":function(d){return "Τερματισμός"},
"generatedCodeInfo":function(d){return "Ακόμη και τα κορυφαία πανεπιστήμια διδάσκουν κώδικα με βάση τα μπλοκ (π.χ. "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+"). Αλλά στο παρασκήνιο τα μπλοκ που συναρμολόγησες μπορούν να εμφανιστούν σε JavaScript, την πιο διαδεδομένη γλώσσα προγραμματισμού στον κόσμο:"},
"hashError":function(d){return "Συγνώμη, το '%1' δεν αντιστοιχεί με κανένα αποθηκευμένο πρόγραμμα."},
"help":function(d){return "Βοήθεια"},
"hideToolbox":function(d){return "(Κρύψε)"},
"hintHeader":function(d){return "Να μια συμβουλή:"},
"hintRequest":function(d){return "Δείτε την υπόδειξη"},
"hintTitle":function(d){return "Υπόδειξη:"},
"ignore":function(d){return "Αγνόησε"},
"infinity":function(d){return "Άπειρο"},
"jump":function(d){return "πήδα"},
"keepPlaying":function(d){return "Συνέχισε το Παιχνίδι"},
"levelIncompleteError":function(d){return "Χρησιμοποιείς όλα τα αναγκαία είδη μπλοκ, αλλά όχι με τον σωστό τρόπο."},
"listVariable":function(d){return "λίστα"},
"makeYourOwnFlappy":function(d){return "Φτιάξτε το δικό σας Flappy παιχνίδι"},
"missingRecommendedBlocksErrorMsg":function(d){return "Περίπου. Δοκίμασε ένα μπλοκ που δεν έχεις ακόμη χρησιμοποιήσει."},
"missingRequiredBlocksErrorMsg":function(d){return "Περίπου. Πρέπει να χρησιμοποιήσεις ένα μπλοκ που δεν έχεις ακόμη χρησιμοποιήσει."},
"nestedForSameVariable":function(d){return "Χρησιμοποιείτε την ίδια μεταβλητή μέσα σε δύο ή περισσότερους ένθετους βρόχους. Χρησιμοποιήστε μοναδικά ονόματα μεταβλητών για να αποφύγετε ατέρμονους βρόγχους."},
"nextLevel":function(d){return "Συγχαρητήρια! Τελείωσες το παζλ "+common_locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Συγχαρητήρια! Τελείωσες το παζλ "+common_locale.v(d,"puzzleNumber")+" και κέρδισες "+common_locale.p(d,"numTrophies",0,"el",{"one":"τρόπαιο","other":common_locale.n(d,"numTrophies")+" τρόπαια"})+"."},
"nextPuzzle":function(d){return "Επόμενος γρίφος"},
"nextStage":function(d){return "Συγχαρητήρια! Ολοκληρώσατε το "+common_locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Συγχαρητήρια! Ολοκλήρωσες  το στάδιο "+common_locale.v(d,"stageName")+" και κέρδισες "+common_locale.p(d,"numTrophies",0,"el",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" τράπαια"})+"."},
"numBlocksNeeded":function(d){return "Συγχαρητήρια! Τελείωσες το πάζλ "+common_locale.v(d,"puzzleNumber")+". (Όμως, θα μπορούσες να βάλεις μόνο   "+common_locale.p(d,"numBlocks",0,"el",{"one":"1 μπλοκ","other":common_locale.n(d,"numBlocks")+" μπλοκ"})+".)"},
"numLinesOfCodeWritten":function(d){return "Μόλις έγραψες "+common_locale.p(d,"numLines",0,"el",{"one":"1 γραμμή","other":common_locale.n(d,"numLines")+" γραμμές"})+" κώδικα!"},
"openWorkspace":function(d){return "Πώς λειτουργεί"},
"orientationLock":function(d){return "Απενεργοποιήστε το κλείδωμα περιστροφής στις ρυθμίσεις της συσκευής σας."},
"play":function(d){return "παίξε"},
"print":function(d){return "Εκτύπωσε"},
"puzzleTitle":function(d){return "Παζλ "+common_locale.v(d,"puzzle_number")+" από "+common_locale.v(d,"stage_total")},
"readonlyWorkspaceHeader":function(d){return "Μόνο για προβολή: "},
"repeat":function(d){return "επανάλαβε"},
"resetProgram":function(d){return "Επαναφορά"},
"rotateText":function(d){return "Περιστρέψτε τη συσκευή σας."},
"runProgram":function(d){return "Εκτέλεση"},
"runTooltip":function(d){return "Τρέξτε το πρόγραμμα που ορίζεται από τα μπλοκ στο χώρο εργασίας."},
"runtimeErrorMsg":function(d){return "Το πρόγραμμά σας δεν εκτελέστηκε με επιτυχία. Παρακαλούμε να αφαιρέσετε τη γραμμή "+common_locale.v(d,"lineNumber")+" και προσπαθήστε ξανά."},
"saveToGallery":function(d){return "Αποθήκευση στη συλλογή"},
"savedToGallery":function(d){return "Αποθηκεύτηκε στη συλλογή!"},
"score":function(d){return "σκορ"},
"sendToPhone":function(d){return "Αποστολή στο Κινητό"},
"shareFailure":function(d){return "Συγγνώμη, δεν μπορούμε να μοιράσουμε αυτό το πρόγραμμα."},
"shareWarningsAge":function(d){return "Παρακαλούμε να δηλώστε την ηλικία σας παρακάτω και κάντε κλικ στο κουμπί OK για να συνεχίσετε."},
"shareWarningsMoreInfo":function(d){return "Περισσότερες Πληροφορίες"},
"shareWarningsStoreData":function(d){return "Αυτή η εφαρμογή Code Studio αποθηκεύει δεδομένα που θα μπορούσαν να προβληθούν από οποιονδήποτε με αυτόν τον σύνδεσμο διαμοιρασμού, οπότε να είστε προσεκτικοί αν σας ζητηθεί να δώσετε προσωπικές πληροφορίες."},
"showBlocksHeader":function(d){return "Εμφάνισε τα μπλοκ"},
"showCodeHeader":function(d){return "Προβολή κώδικα"},
"showGeneratedCode":function(d){return "Προβολή κώδικα"},
"showTextHeader":function(d){return "Εμφάνιση κειμένου"},
"showToolbox":function(d){return "Εμφάνιση Εργαλειοθήκης"},
"showVersionsHeader":function(d){return "Ιστορικό αλλαγών"},
"signup":function(d){return "Κάντε εγγραφή για το εισαγωγικό μάθημα"},
"stringEquals":function(d){return "συμβολοσειρά = ;"},
"submit":function(d){return "Υποβολή"},
"submitYourProject":function(d){return "Υποβάλετε το έργο σας"},
"submitYourProjectConfirm":function(d){return "Δεν μπορώ να επεξεργαστείτε το έργο σας μετά την υποβολή, Θες πράγματι να το υποβάλλεις;"},
"unsubmit":function(d){return "Ανακλήθηκε"},
"unsubmitYourProject":function(d){return "Κατάργησε την υποβολή του έργου σου"},
"unsubmitYourProjectConfirm":function(d){return "Η κατάργηση της υποβολής του έργου σου θα επαναφέρει την ημερομηνία υποβολής, θέλεις να την καταργήσεις;"},
"subtitle":function(d){return "ένα οπτικό περιβάλλον προγραμματισμού"},
"syntaxErrorMsg":function(d){return "Το πρόγραμμα σας περιέχει ένα συντακτικό λάθος. Παρακαλούμε αφαιρέστε τη γραμμή "+common_locale.v(d,"lineNumber")+" και προσπαθήστε ξανά."},
"textVariable":function(d){return "κείμενο"},
"toggleBlocksErrorMsg":function(d){return "Πρέπει να διορθώσετε ένα σφάλμα στο πρόγραμμά σας πριν μπορεί να παρουσιασθεί ως μπλοκ."},
"tooFewBlocksMsg":function(d){return "Χρησιμοποιείς όλα τα αναγκαία είδη μπλοκ, αλλά δοκίμασε να χρησιμοποιήσεις περισσότερα απο τα μπλοκ αυτών των ειδών για να ολοκληρώσεις το παζλ."},
"tooManyBlocksMsg":function(d){return "Αυτό το παζλ μπορεί να λυθεί με  <x id='START_SPAN'/><x id='END_SPAN'/> μπλοκ."},
"tooMuchWork":function(d){return "Με ανάγκασες να κάνω πολλή δουλειά! Μπορείς με λιγότερες επαναλήψεις;"},
"toolboxHeader":function(d){return "μπλοκ"},
"toolboxHeaderDroplet":function(d){return "Εργαλειοθήκη"},
"totalNumLinesOfCodeWritten":function(d){return "Γενικό σύνολο: "+common_locale.p(d,"numLines",0,"el",{"one":"1 γραμμή","other":common_locale.n(d,"numLines")+" γραμμές"})+" κώδικα."},
"tryAgain":function(d){return "Δοκίμασε ξανά"},
"tryBlocksBelowFeedback":function(d){return "Δοκίμασε να χρησιμοποιήσεις κάποιο από τα παρακάτω μπλοκ:"},
"tryHOC":function(d){return "Δοκίμασε την Ώρα του Κώδικα"},
"unnamedFunction":function(d){return "Έχεις μια μεταβλητή ή συνάρτηση που δεν έχει όνομα. Μην ξεχνάς να δείνεις πάντα ένα περιγραφικό όνομα."},
"wantToLearn":function(d){return "Θέλετε να μάθετε προγραμματισμό;"},
"watchVideo":function(d){return "Δείτε το βίντεο"},
"when":function(d){return "όταν"},
"whenRun":function(d){return "όταν εκτελείται"},
"workspaceHeaderShort":function(d){return "Χώρος εργασίας: "},
"hintPrompt":function(d){return "Need help?"},
"hintReviewTitle":function(d){return "Review Your Hints"},
"hintSelectInstructions":function(d){return "Instructions and old hints"},
"hintSelectNewHint":function(d){return "Get a new hint"}};