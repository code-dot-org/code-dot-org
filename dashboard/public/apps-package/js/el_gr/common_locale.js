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
"and":function(d){return "και"},
"booleanTrue":function(d){return "Αληθές"},
"booleanFalse":function(d){return "ψευδές"},
"blocks":function(d){return "μπλοκ"},
"blocklyMessage":function(d){return "Blockly"},
"catActions":function(d){return "Ενέργειες"},
"catColour":function(d){return "Χρώμα"},
"catLogic":function(d){return "Λογική"},
"catLists":function(d){return "Λίστες"},
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
"continue":function(d){return "Συνέχεια"},
"designMode":function(d){return "Σχεδίαση"},
"designModeHeader":function(d){return "Κατάσταση Σχεδίασης"},
"dialogCancel":function(d){return "Άκυρο"},
"dialogOK":function(d){return "OΚ"},
"directionNorthLetter":function(d){return "Β"},
"directionSouthLetter":function(d){return "Ν"},
"directionEastLetter":function(d){return "Α"},
"directionWestLetter":function(d){return "Δ"},
"dropletBlock_addOperator_description":function(d){return "Πρόσθεση δύο αριθμών"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Add operator"},
"dropletBlock_andOperator_description":function(d){return "Επιστρέφει αληθές μόνο όταν και οι δύο εκφράσεις είναι αληθείς ή ψευδείς διαφορετικά"},
"dropletBlock_andOperator_signatureOverride":function(d){return "διαδικός τελεστής ΚΑΙ"},
"dropletBlock_arcLeft_description":function(d){return "Μετακινεί τη χελώνα σε ένα τόξο προς τα αριστερά χρησιμοποιώντας  το δεδομένο αριθμό μοιρών και ακτίνας"},
"dropletBlock_arcLeft_param0":function(d){return "angle"},
"dropletBlock_arcLeft_param1":function(d){return "ακτίνα"},
"dropletBlock_arcRight_description":function(d){return "Μετακινεί τη χελώνα σε ένα τόξο προς τα δεξιά χρησιμοποιώντας το δεδομένο αριθμό μοιρών και ακτίνας"},
"dropletBlock_arcRight_param0":function(d){return "angle"},
"dropletBlock_arcRight_param1":function(d){return "ακτίνα"},
"dropletBlock_assign_x_description":function(d){return "Νέα ανάθεση τιμής σε μεταβλητή"},
"dropletBlock_assign_x_signatureOverride":function(d){return "Assign a variable"},
"dropletBlock_button_description":function(d){return "Δημιουργεί ένα πλήκτρο και αναθέτει ένα αναγνωριστικό στοιχείο"},
"dropletBlock_button_param0":function(d){return "buttonId"},
"dropletBlock_button_param1":function(d){return "κείμενο"},
"dropletBlock_callMyFunction_description":function(d){return "Καλεί μία ονοματισμένη συνάρτηση που δε δέχεται παραμέτρους"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Κάλεσε μία συνάρτηση"},
"dropletBlock_callMyFunction_n_description":function(d){return "Καλεί μία ονοματισμένη συνάρτηση που δέχεται μία ή περισσότερες παραμέτρους"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Κάλεσε συνάρτηση με παραμέτρους"},
"dropletBlock_changeScore_description":function(d){return "Πρόσθεσε ή αφαίρεσε έναν πόντο στη βαθμολογία."},
"dropletBlock_checkbox_description":function(d){return "Δημιουργεί ένα πλαίσιο ελέγχου και αναθέτει ένα αναγνωριστικό στοιχείο"},
"dropletBlock_checkbox_param0":function(d){return "checkboxId"},
"dropletBlock_checkbox_param1":function(d){return "checked"},
"dropletBlock_circle_description":function(d){return "Σχεδιάζει έναν κύκλο στον ενεργό καμβά με τις καθορισμένες συντεταγμένες για το κέντρο (x, y) και την ακτίνα"},
"dropletBlock_circle_param0":function(d){return "κέντροX"},
"dropletBlock_circle_param1":function(d){return "κέντροY"},
"dropletBlock_circle_param2":function(d){return "ακτίνα"},
"dropletBlock_clearCanvas_description":function(d){return "Καθαρίζει όλα τα στοιχεία στον ενεργό καμβά"},
"dropletBlock_clearInterval_description":function(d){return "Καθαρίζει ένα υπάρχον χρονόμετρο δίνοντας την τιμή που επιστρέφεται από το setInterval()"},
"dropletBlock_clearInterval_param0":function(d){return "interval"},
"dropletBlock_clearTimeout_description":function(d){return "Καθαρίζει ένα χρονόμετρο δίνοντας την τιμή που επιστρέφεται από το setTimeout()"},
"dropletBlock_clearTimeout_param0":function(d){return "timeout"},
"dropletBlock_console.log_description":function(d){return "Εμφανίζει το κείμενο ή τη μεταβλητή στην οθόνη κονσόλας"},
"dropletBlock_console.log_param0":function(d){return "μήνυμα"},
"dropletBlock_container_description":function(d){return "Δημιουργεί ένα περιεχόμενο διαίρεσης με το καθορισμένο αναγνωριστικό, και προαιρετικά ορίζει την εσωτερική του HTML"},
"dropletBlock_createCanvas_description":function(d){return "Δημιουργεί έναν καμβά με το καθορισμένο αναγνωριστικό, και προαιρετικά ορίζει τις διαστάσεις πλάτους και ύψους"},
"dropletBlock_createCanvas_param0":function(d){return "αναγνωριστικόΚαμβά"},
"dropletBlock_createCanvas_param1":function(d){return "πλάτος"},
"dropletBlock_createCanvas_param2":function(d){return "ύψος"},
"dropletBlock_createRecord_description":function(d){return "Χρησιμοποιώντας τον πίνακα αποθήκευσης στοιχείων του App Lab, δημιουργεί μία εγγραφή με μοναδικό αναγνωριστικό στον πίνακα του οποίου δίδεται το όνομα, και καλεί την συνάρτησηΕπιστροφής όταν ολοκληρωθεί η ενέργεια."},
"dropletBlock_createRecord_param0":function(d){return "όνομαΠίνακα"},
"dropletBlock_createRecord_param1":function(d){return "εγγραφή"},
"dropletBlock_createRecord_param2":function(d){return "συνάρτησηΕπιστροφής"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "Δημιουργεί μία μεταβλητή και την προετοιμάζει ως μήτρα"},
"dropletBlock_declareAssign_x_array_1_4_signatureOverride":function(d){return "Declare a variable assigned to an array"},
"dropletBlock_declareAssign_x_description":function(d){return "Ορίζει μία μεταβλητή με το δεδομένο όνομα μετά το 'var' και θέτει την τιμή τις σε αυτήν που βρίσκεται στα δεξιά της έκφρασης"},
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "Όρισε μία μεταβλητή"},
"dropletBlock_declareAssign_x_prompt_description":function(d){return "Δημιουργεί μία μεταβλητή και θέτει μία τιμή εμφανίζοντας μία γραμμή"},
"dropletBlock_declareAssign_x_prompt_signatureOverride":function(d){return "Prompt the user for a value and store it"},
"dropletBlock_deleteElement_description":function(d){return "Διαγράφει το στοιχείο με το καθορισμένο αναγνωριστικό"},
"dropletBlock_deleteElement_param0":function(d){return "αναγνωριστικό"},
"dropletBlock_deleteRecord_description":function(d){return "Χρησιμοποιώντας τον πίνακα δεδομένων του App Lab, διαγράφει την παρεχόμενη εγγραφή στο όνομαΠίνακα. Η εγγραφή είναι ένα αντικείμενο που πρέπει να ορίζεται μοναδικά με το αναγνωριστικό πεδίο του. Όταν η κλήση ολοκληρωθεί, καλείτε η συνάρτησηΕπιστροφής."},
"dropletBlock_deleteRecord_param0":function(d){return "όνομαΠίνακα"},
"dropletBlock_deleteRecord_param1":function(d){return "εγγραφή"},
"dropletBlock_deleteRecord_param2":function(d){return "συνάρτησηΕπιστροφής"},
"dropletBlock_divideOperator_description":function(d){return "Διαιρεί δύο αριθμούς"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "Divide operator"},
"dropletBlock_dot_description":function(d){return "Σχεδιάζει μία τελεία στη θέση της χελώνας με την καθορισμένη ακτίνα"},
"dropletBlock_dot_param0":function(d){return "ακτίνα"},
"dropletBlock_drawImage_description":function(d){return "Σχεδιάζει μία εικόνα στον ενεργό καμβά με το δεδομένο στοιχείο εικόνας και τα x, y ως συντεταγμένες της επάνω αριστερής γωνίας"},
"dropletBlock_drawImage_param0":function(d){return "αναγνωριστικό"},
"dropletBlock_drawImage_param1":function(d){return "x"},
"dropletBlock_drawImage_param2":function(d){return "y"},
"dropletBlock_drawImage_param3":function(d){return "πλάτος"},
"dropletBlock_drawImage_param4":function(d){return "ύψος"},
"dropletBlock_dropdown_description":function(d){return "Σχεδιάζει ένα πτυσσόμενο κουτί, του αναθέτει αναγνωριστικό και το γεμίζει με μία λίστα στοιχείων"},
"dropletBlock_dropdown_signatureOverride":function(d){return "dropdown(dropdownID, option1, option2, ..., optionX)"},
"dropletBlock_equalityOperator_description":function(d){return "Δοκιμή για ισότητα"},
"dropletBlock_equalityOperator_signatureOverride":function(d){return "Equality operator"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "Δημιουργεί ένα βρόχο που αποτελείται από μία έκφραση προετοιμασίας, μία έκφραση συνθήκης, μία έκφραση προσαύξησης και ένα μπλοκ από εντολές που εκτελούνται σε κάθε επανάληψη του βρόχου"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "βρόχος \"για\""},
"dropletBlock_functionParams_n_description":function(d){return "Ένα σύνολο εντολών που λαμβάνει μία ή περισσότερες παραμέτρους, και εκτελεί μία εργασία ή υπολογίζει μία τιμή όταν καλείται η συνάρτηση"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "Ορίζει μία συνάρτηση με παραμέτρους"},
"dropletBlock_functionParams_none_description":function(d){return "Ένα σετ εντολών που εκτελεί μία εργασία ή υπολογίζει μία τιμή όταν καλείται η συνάρτηση"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "Ορισμός μίας συνάρτησης"},
"dropletBlock_getAlpha_description":function(d){return "Gets the alpha"},
"dropletBlock_getAlpha_param0":function(d){return "εικόνα"},
"dropletBlock_getAlpha_param1":function(d){return "x"},
"dropletBlock_getAlpha_param2":function(d){return "y"},
"dropletBlock_getAttribute_description":function(d){return "Παίρνει το δεδομένο χαρακτηριστικό"},
"dropletBlock_getBlue_description":function(d){return "Gets the given blue value"},
"dropletBlock_getBlue_param0":function(d){return "εικόνα"},
"dropletBlock_getBlue_param1":function(d){return "x"},
"dropletBlock_getBlue_param2":function(d){return "y"},
"dropletBlock_getChecked_description":function(d){return "Παίρνει την κατάσταση του πλαισίου ελέγχου ή του κουμπιού επιλογής"},
"dropletBlock_getChecked_param0":function(d){return "αναγνωριστικό"},
"dropletBlock_getDirection_description":function(d){return "Get the turtle's direction (0 degrees is pointing up)"},
"dropletBlock_getGreen_description":function(d){return "Gets the given green value"},
"dropletBlock_getGreen_param0":function(d){return "εικόνα"},
"dropletBlock_getGreen_param1":function(d){return "x"},
"dropletBlock_getGreen_param2":function(d){return "y"},
"dropletBlock_getImageData_description":function(d){return "Get the ImageData for a rectangle (x, y, width, height) within the active  canvas"},
"dropletBlock_getImageData_param0":function(d){return "startX"},
"dropletBlock_getImageData_param1":function(d){return "startY"},
"dropletBlock_getImageData_param2":function(d){return "endX"},
"dropletBlock_getImageData_param3":function(d){return "endY"},
"dropletBlock_getImageURL_description":function(d){return "Get the URL associated with an image or image upload button"},
"dropletBlock_getImageURL_param0":function(d){return "imageID"},
"dropletBlock_getKeyValue_description":function(d){return "Reads the value associated with the key from the remote data store."},
"dropletBlock_getKeyValue_param0":function(d){return "κλειδί"},
"dropletBlock_getKeyValue_param1":function(d){return "συνάρτησηΕπιστροφής"},
"dropletBlock_getRed_description":function(d){return "Gets the given red value"},
"dropletBlock_getRed_param0":function(d){return "εικόνα"},
"dropletBlock_getRed_param1":function(d){return "x"},
"dropletBlock_getRed_param2":function(d){return "y"},
"dropletBlock_getText_description":function(d){return "Παίρνει το κείμενο από το δεδομένο στοιχείο"},
"dropletBlock_getText_param0":function(d){return "αναγνωριστικό"},
"dropletBlock_getTime_description":function(d){return "Παίρνει την τρέχουσα ώρα σε χιλιοστά του δευτερολέπτου"},
"dropletBlock_getUserId_description":function(d){return "Παίρνει ένα μοναδικό αναγνωριστικό για τον τρέχοντα χρήστη αυτής της εφαρμογής"},
"dropletBlock_getX_description":function(d){return "Παίρνει την τιμή του x σε πίξελ των συντεταγμένων της χελώνας"},
"dropletBlock_getXPosition_description":function(d){return "Παίρνει τη θέση x του στοιχείου"},
"dropletBlock_getXPosition_param0":function(d){return "αναγνωριστικό"},
"dropletBlock_getY_description":function(d){return "Παίρνει την τιμή του y σε πίξελ των συντεταγμένων της χελώνας"},
"dropletBlock_getYPosition_description":function(d){return "Παίρνει τη θέση y του στοιχείου"},
"dropletBlock_getYPosition_param0":function(d){return "αναγνωριστικό"},
"dropletBlock_greaterThanOperator_description":function(d){return "Compare two numbers"},
"dropletBlock_greaterThanOperator_signatureOverride":function(d){return "Greater than operator"},
"dropletBlock_hide_description":function(d){return "Κρύβει τη χελώνα ώστε να μην εμφανίζεται στην οθόνη"},
"dropletBlock_hideElement_description":function(d){return "Hide the element with the specified id"},
"dropletBlock_hideElement_param0":function(d){return "αναγνωριστικό"},
"dropletBlock_ifBlock_description":function(d){return "Εκτελεί ένα μπλοκ εντολών αν η καθορισμένη συνθήκη είναι αληθής"},
"dropletBlock_ifBlock_signatureOverride":function(d){return "δήλωση αν"},
"dropletBlock_ifElseBlock_description":function(d){return "Εκτελεί ένα μπλοκ εντολών αν η καθορισμένη συνθήκη είναι αληθής - διαφορετικά εκτελείται το μπλοκ των εντολών στο \"αλλιώς\""},
"dropletBlock_ifElseBlock_signatureOverride":function(d){return "δήλωση αν/αλλιώς"},
"dropletBlock_image_description":function(d){return "Create an image and assign it an element id"},
"dropletBlock_image_param0":function(d){return "αναγνωριστικό"},
"dropletBlock_image_param1":function(d){return "url"},
"dropletBlock_imageUploadButton_description":function(d){return "Δημιούργησε ένα πλήκτρο μεταφόρτωσης εικόνας και θέσε σε αυτό ένα μοναδικό αναγνωριστικό στοιχείο"},
"dropletBlock_inequalityOperator_description":function(d){return "Test for inequality"},
"dropletBlock_inequalityOperator_signatureOverride":function(d){return "Inequality operator"},
"dropletBlock_innerHTML_description":function(d){return "Θέσε την εσωτερική HTML ενός στοιχείο με το συγκεκριμένο αναγνωριστικό"},
"dropletBlock_lessThanOperator_description":function(d){return "Compare two numbers"},
"dropletBlock_lessThanOperator_signatureOverride":function(d){return "Less than operator"},
"dropletBlock_line_description":function(d){return "Σχεδιάζει μία γραμμή στον ενεργό καμβά από το x1, y1 στο x2, y2."},
"dropletBlock_line_param0":function(d){return "x1"},
"dropletBlock_line_param1":function(d){return "y1"},
"dropletBlock_line_param2":function(d){return "x2"},
"dropletBlock_line_param3":function(d){return "y2"},
"dropletBlock_mathAbs_description":function(d){return "Παίρνει την απόλυτη τιμή του x"},
"dropletBlock_mathAbs_signatureOverride":function(d){return "Math.abs(x)"},
"dropletBlock_mathMax_description":function(d){return "Παίρνει τη μέγιστη τιμή μεταξύ μίας ή περισσοτέρων τιμών n1, n2, ..., nX"},
"dropletBlock_mathMax_signatureOverride":function(d){return "Math.max(n1, n2, ..., nX)"},
"dropletBlock_mathMin_description":function(d){return "Παίρνει τη ελάχιστη τιμή μεταξύ μίας ή περισσοτέρων τιμών n1, n2, ..., nX"},
"dropletBlock_mathMin_signatureOverride":function(d){return "Math.min(n1, n2, ..., nX)"},
"dropletBlock_mathRound_description":function(d){return "Round to the nearest integer"},
"dropletBlock_mathRound_signatureOverride":function(d){return "Math.round(x)"},
"dropletBlock_move_description":function(d){return "Μετακινεί τη χελώνα από την τρέχουσα θέση της. Προσθέτει x στη θέση x της χελώνας και y στη θέση y της χελώνας"},
"dropletBlock_move_param0":function(d){return "x"},
"dropletBlock_move_param1":function(d){return "y"},
"dropletBlock_moveBackward_description":function(d){return "Μετακινεί τη χελώνα πίσω με βάση έναν δεδομένο αριθμό πίξελ στην τρέχουσα κατεύθυνσή της"},
"dropletBlock_moveBackward_param0":function(d){return "εικονοστοιχεία"},
"dropletBlock_moveForward_description":function(d){return "Μετακινεί τη χελώνα μπροστά με βάση έναν δεδομένο αριθμό πίξελ στην τρέχουσα κατεύθυνσή της"},
"dropletBlock_moveForward_param0":function(d){return "εικονοστοιχεία"},
"dropletBlock_moveTo_description":function(d){return "Μετακινεί τη χελώνα στις δεδομένες συντεταγμένες x, y στην οθόνη"},
"dropletBlock_moveTo_param0":function(d){return "x"},
"dropletBlock_moveTo_param1":function(d){return "y"},
"dropletBlock_multiplyOperator_description":function(d){return "Πολλαπλασίασε δύο αριθμούς"},
"dropletBlock_multiplyOperator_signatureOverride":function(d){return "Multiply operator"},
"dropletBlock_notOperator_description":function(d){return "Επιστρέψει ψευδές αν η έκφραση μπορεί να μετατραπεί σε αληθής - διαφορετικά επιστρέφει αληθές"},
"dropletBlock_notOperator_signatureOverride":function(d){return "διαδικός τελεστής ΚΑΙ"},
"dropletBlock_onEvent_description":function(d){return "Execute code in response to the specified event."},
"dropletBlock_onEvent_param0":function(d){return "αναγνωριστικό"},
"dropletBlock_onEvent_param1":function(d){return "συμβάν"},
"dropletBlock_onEvent_param2":function(d){return "function"},
"dropletBlock_orOperator_description":function(d){return "Επιστρέφει αληθές όταν οποιαδήποτε είναι αληθής, διαφορετικά επιστρέφει ψευδές"},
"dropletBlock_orOperator_signatureOverride":function(d){return "διαδικός τελεστής Ή"},
"dropletBlock_penColor_description":function(d){return "Ορίζει το χρώμα της γραμμής που σχεδιάζει η χελώνα καθώς κινείται"},
"dropletBlock_penColor_param0":function(d){return "χρώμα"},
"dropletBlock_penColour_description":function(d){return "Ορίζει το χρώμα της γραμμής που σχεδιάζει η χελώνα καθώς κινείται"},
"dropletBlock_penColour_param0":function(d){return "χρώμα"},
"dropletBlock_penDown_description":function(d){return "Κάνει μία γραμμή να σχεδιαστεί πίσω από τη χελώνα καθώς αυτή κινείται"},
"dropletBlock_penUp_description":function(d){return "Σταματά το σχεδιασμό γραμμής πίσω από τη χελώνα καθώς αυτή κινείται"},
"dropletBlock_penWidth_description":function(d){return "Set the turtle to the specified pen width"},
"dropletBlock_penWidth_param0":function(d){return "πλάτος"},
"dropletBlock_playSound_description":function(d){return "Παίξε ένα αρχείο ήχου MP3, OGG ή WAV από την καθορισμένη URL"},
"dropletBlock_playSound_param0":function(d){return "url"},
"dropletBlock_putImageData_description":function(d){return "Set the ImageData for a rectangle within the active  canvas with x, y as the top left coordinates"},
"dropletBlock_putImageData_param0":function(d){return "εικόνα"},
"dropletBlock_putImageData_param1":function(d){return "startX"},
"dropletBlock_putImageData_param2":function(d){return "startY"},
"dropletBlock_radioButton_description":function(d){return "Create a radio button and assign it an element id"},
"dropletBlock_radioButton_param0":function(d){return "αναγνωριστικό"},
"dropletBlock_radioButton_param1":function(d){return "checked"},
"dropletBlock_radioButton_param2":function(d){return "group"},
"dropletBlock_randomNumber_max_description":function(d){return "Get a random number between 0 and the specified maximum value"},
"dropletBlock_randomNumber_max_signatureOverride":function(d){return "randomNumber(max)"},
"dropletBlock_randomNumber_min_max_description":function(d){return "Get a random number between the specified minimum and maximum values"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_readRecords_description":function(d){return "Χρησιμοποιώντας την αποθήκη δεδομένων του App Lab, διαβάζει μία εγγραφή από το καθορισμένο όνομαΠίνακα που ταιριάζει με τους όρουςΑναζήτησης. Όταν η κλήση ολοκληρωθεί, καλείται η συνάρτηση callbackFunction και μεταφέρονται σε αυτήν οι σειρές των εγγραφών."},
"dropletBlock_readRecords_param0":function(d){return "όνομαΠίνακα"},
"dropletBlock_readRecords_param1":function(d){return "όροιΑναζήτησης"},
"dropletBlock_readRecords_param2":function(d){return "συνάρτησηΕπιστροφής"},
"dropletBlock_rect_description":function(d){return "Σχεδιάζει ένα τετράγωνο στον ενεργό καμβά, που τοποθετείται στα επάνωΑριστεράΧ και επάνωΑριστεράΥ, με μέγεθος το πλάτος και ύψος."},
"dropletBlock_rect_param0":function(d){return "επάνωΑριστεράΧ"},
"dropletBlock_rect_param1":function(d){return "επάνωΑριστεράΥ"},
"dropletBlock_rect_param2":function(d){return "πλάτος"},
"dropletBlock_rect_param3":function(d){return "ύψος"},
"dropletBlock_return_description":function(d){return "Επίστεψε μία τιμή από μία συνάρτηση"},
"dropletBlock_return_signatureOverride":function(d){return "επιστροφή"},
"dropletBlock_setActiveCanvas_description":function(d){return "Set the canvas id for subsequent canvas commands (only needed when there are multiple canvas elements)"},
"dropletBlock_setActiveCanvas_param0":function(d){return "αναγνωριστικόΚαμβά"},
"dropletBlock_setAlpha_description":function(d){return "Sets the given value"},
"dropletBlock_setAlpha_param0":function(d){return "εικόνα"},
"dropletBlock_setAlpha_param1":function(d){return "x"},
"dropletBlock_setAlpha_param2":function(d){return "y"},
"dropletBlock_setAlpha_param3":function(d){return "alphaValue"},
"dropletBlock_setAttribute_description":function(d){return "Ορίζει τη δεδομένη τιμή"},
"dropletBlock_setBackground_description":function(d){return "Ορίζει την εικόνα στο φόντο"},
"dropletBlock_setBlue_description":function(d){return "Θέτει το ποσό του μπλε (που κυμαίνεται από 0 έως 255) στο χρώμα του πίξελ που βρίσκεται στη δεδομένη θέση x και y στη δεδομένη εικόνα, με βάση το ποσό εισαγωγής τιμήΜπλε."},
"dropletBlock_setBlue_param0":function(d){return "εικόνα"},
"dropletBlock_setBlue_param1":function(d){return "x"},
"dropletBlock_setBlue_param2":function(d){return "y"},
"dropletBlock_setBlue_param3":function(d){return "τιμήΜπλε"},
"dropletBlock_setChecked_description":function(d){return "Όρισε την κατάσταση του πλαισίου ελέγχου ή του πλήκτρου επιλογής"},
"dropletBlock_setChecked_param0":function(d){return "αναγνωριστικό"},
"dropletBlock_setChecked_param1":function(d){return "checked"},
"dropletBlock_setFillColor_description":function(d){return "Set the fill color for the active  canvas"},
"dropletBlock_setFillColor_param0":function(d){return "χρώμα"},
"dropletBlock_setGreen_description":function(d){return "Θέτει το ποσό του πράσινου (που κυμαίνεται από 0 έως 255) στο χρώμα του πίξελ που βρίσκεται στη δεδομένη θέση x και y στη δεδομένη εικόνα, με βάση το ποσό εισαγωγής τιμήΠράσινου."},
"dropletBlock_setGreen_param0":function(d){return "εικόνα"},
"dropletBlock_setGreen_param1":function(d){return "x"},
"dropletBlock_setGreen_param2":function(d){return "y"},
"dropletBlock_setGreen_param3":function(d){return "τιμήΠράσινου"},
"dropletBlock_setImageURL_description":function(d){return "Set the URL for the specified image element id"},
"dropletBlock_setImageURL_param0":function(d){return "αναγνωριστικό"},
"dropletBlock_setImageURL_param1":function(d){return "url"},
"dropletBlock_setInterval_description":function(d){return "Continue to execute code each time the specified number of milliseconds has elapsed"},
"dropletBlock_setInterval_param0":function(d){return "callbackFunction"},
"dropletBlock_setInterval_param1":function(d){return "χιλιοστά του δευτερολέπτου"},
"dropletBlock_setKeyValue_description":function(d){return "Αποθηκεύει ένα ζεύγος κλειδί/τιμή στην αποθήκη δεδομένων του App Lab και καλεί τη συνάρτηση callbackFunction όταν η ενέργεια έχει ολοκληρωθεί."},
"dropletBlock_setKeyValue_param0":function(d){return "κλειδί"},
"dropletBlock_setKeyValue_param1":function(d){return "τιμή"},
"dropletBlock_setKeyValue_param2":function(d){return "συνάρτησηΕπιστροφής"},
"dropletBlock_setParent_description":function(d){return "Ορίζει ένα στοιχείο να γίνει παιδί του γονικού στοιχείου"},
"dropletBlock_setPosition_description":function(d){return "Τοποθέτησε ένα στοιχείο με συντεταγμένες x, y, πλάτος και ύψος"},
"dropletBlock_setPosition_param0":function(d){return "αναγνωριστικό"},
"dropletBlock_setPosition_param1":function(d){return "x"},
"dropletBlock_setPosition_param2":function(d){return "y"},
"dropletBlock_setPosition_param3":function(d){return "πλάτος"},
"dropletBlock_setPosition_param4":function(d){return "ύψος"},
"dropletBlock_setRed_description":function(d){return "Θέτει το ποσό του κόκκινου (που κυμαίνεται από 0 έως 255) στο χρώμα του πίξελ που βρίσκεται στη δεδομένη θέση x και y στη δεδομένη εικόνα, με βάση το ποσό εισαγωγής τιμήΚόκκινου."},
"dropletBlock_setRed_param0":function(d){return "εικόνα"},
"dropletBlock_setRed_param1":function(d){return "x"},
"dropletBlock_setRed_param2":function(d){return "y"},
"dropletBlock_setRed_param3":function(d){return "τιμήΚόκκινου"},
"dropletBlock_setRGB_description":function(d){return "Sets the RGB color values (ranging from 0 to 255) of the pixel located at the given x and y position in the given image data to the input red, green, blue amounts"},
"dropletBlock_setRGB_param0":function(d){return "εικόνα"},
"dropletBlock_setRGB_param1":function(d){return "x"},
"dropletBlock_setRGB_param2":function(d){return "y"},
"dropletBlock_setRGB_param3":function(d){return "κόκκινο"},
"dropletBlock_setRGB_param4":function(d){return "πράσινο"},
"dropletBlock_setRGB_param5":function(d){return "μπλε"},
"dropletBlock_setStrokeColor_description":function(d){return "Όρισε το χρώμα ζωγραφίσματος του ενεργού καμβά"},
"dropletBlock_setStrokeColor_param0":function(d){return "χρώμα"},
"dropletBlock_setSprite_description":function(d){return "Ορίζει την εικόνα του ηθοποιού"},
"dropletBlock_setSpriteEmotion_description":function(d){return "Ορίζει τη διάθεση του ηθοποιού"},
"dropletBlock_setSpritePosition_description":function(d){return "Μεταφέρει άμεσα έναν ηθοποιό στην καθορισμένη θέση."},
"dropletBlock_setSpriteSpeed_description":function(d){return "Ορίζει την ταχύτητα του ηθοποιού"},
"dropletBlock_setStrokeWidth_description":function(d){return "Όρισε το πάχος γραμμής για τον ενεργό καμβά"},
"dropletBlock_setStrokeWidth_param0":function(d){return "πλάτος"},
"dropletBlock_setStyle_description":function(d){return "Πρόσθεσε CSS στυλ σε ένα στοιχείο"},
"dropletBlock_setText_description":function(d){return "Όρισε το κείμενο ενός καθορισμένου στοιχείο"},
"dropletBlock_setText_param0":function(d){return "αναγνωριστικό"},
"dropletBlock_setText_param1":function(d){return "κείμενο"},
"dropletBlock_setTimeout_description":function(d){return "Όρισε ένα χρονόμετρο και εκτέλεσε κώδικα όταν ο δεδομένος αριθμός χιλιοστών του δευτερολέπτου έχει παρέλθει"},
"dropletBlock_setTimeout_param0":function(d){return "function"},
"dropletBlock_setTimeout_param1":function(d){return "χιλιοστά του δευτερολέπτου"},
"dropletBlock_show_description":function(d){return "Εμφανίζει τη χελώνα στην οθόνη, κάνοντάς την ορατή στην τρέχουσα θέση της"},
"dropletBlock_showElement_description":function(d){return "Show the element with the specified id"},
"dropletBlock_showElement_param0":function(d){return "αναγνωριστικό"},
"dropletBlock_speed_description":function(d){return "Change the execution speed of the program to the specified percentage value"},
"dropletBlock_speed_param0":function(d){return "τιμή"},
"dropletBlock_startWebRequest_description":function(d){return "Ζήτησε δεδομένα από το internet και εκτέλεσε κώδικα όταν το αίτημα έχει ολοκληρωθεί"},
"dropletBlock_startWebRequest_param0":function(d){return "url"},
"dropletBlock_startWebRequest_param1":function(d){return "function"},
"dropletBlock_subtractOperator_description":function(d){return "Αφαίρεσε δύο αριθμούς"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_textInput_description":function(d){return "Δημιούργησε ένα πλαίσιο εισαγωγής κειμένου και θέσε το αναγνωριστικό του"},
"dropletBlock_textInput_param0":function(d){return "inputId"},
"dropletBlock_textInput_param1":function(d){return "κείμενο"},
"dropletBlock_textLabel_description":function(d){return "Create a text label, assign it an element id, and bind it to an associated element"},
"dropletBlock_textLabel_param0":function(d){return "labelId"},
"dropletBlock_textLabel_param1":function(d){return "κείμενο"},
"dropletBlock_textLabel_param2":function(d){return "forId"},
"dropletBlock_throw_description":function(d){return "Ρίχνει ένα βλήμα από τον καθορισμένο ηθοποιό."},
"dropletBlock_turnLeft_description":function(d){return "Turn the turtle counterclockwise by the specified number of degrees"},
"dropletBlock_turnLeft_param0":function(d){return "angle"},
"dropletBlock_turnRight_description":function(d){return "Turn the turtle clockwise by the specified number of degrees"},
"dropletBlock_turnRight_param0":function(d){return "angle"},
"dropletBlock_turnTo_description":function(d){return "Turn the turtle to the specified direction (0 degrees is pointing up)"},
"dropletBlock_turnTo_param0":function(d){return "angle"},
"dropletBlock_updateRecord_description":function(d){return "Χρησιμοποιώντας την αποθήκη στοιχείων του App Lab, ενημερώνη τη δεδομένη εγγραφή στο όνομαΠίνακα. Η εγγραφή πρέπει να είναι μοναδικά ορισμένη με το αναγνωριστικό της. Όταν η κλήση ολοκληρωθεί, καλείται η συνάρτηση callbackFunction"},
"dropletBlock_updateRecord_param0":function(d){return "όνομαΠίνακα"},
"dropletBlock_updateRecord_param1":function(d){return "εγγραφή"},
"dropletBlock_updateRecord_param2":function(d){return "συνάρτησηΕπιστροφής"},
"dropletBlock_vanish_description":function(d){return "Εξαφανίζει έναν ηθοποιό."},
"dropletBlock_whileBlock_description":function(d){return "Δημιουργεί ένα βρόχο που αποτελείται από μία έκφραση υπό συνθήκη και ένα μπλοκ εντολών που εκτελούνται σε κάθε επανάληψη του βρόχου. Ο βρόχος συνεχίζει να εκτελεταί όσο η συνθήκη υπολογίζεται ως αληθής"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "βρόχος ενώ"},
"dropletBlock_write_description":function(d){return "Create a block of text"},
"dropletBlock_write_param0":function(d){return "κείμενο"},
"end":function(d){return "τέλος"},
"emptyBlocksErrorMsg":function(d){return "Το μπλοκ του \"Repeat\" ή του \"If\" πρέπει να περιέχει άλλα μπλοκ για να δουλέψει. Σιγουρέψου ότι το εσωτερικό μπλοκ χωράει σωστά μέσα στο μπλόκ που το περιέχει."},
"emptyFunctionalBlock":function(d){return "Έχετε ένα μπλόκ με κενό περιεχόμενο."},
"emptyFunctionBlocksErrorMsg":function(d){return "Το μπλόκ της συνάρτησης χρειάζεται να έχει άλλα μπλοκ μέσα του για να δουλέψει."},
"errorEmptyFunctionBlockModal":function(d){return "Πρέπει να εισάγετε κάποια μπλοκ μέσα στον ορισμό της συνάρτησης. Κάντε κλικ στο κουμπί \"Επεξεργασία\" και σύρετε τα μπλοκς μέσα στο πράσινο μπλοκ."},
"errorIncompleteBlockInFunction":function(d){return "Κάντε κλικ στο κουμπί \"Επεξεργασία\" για να βεβαιωθείτε ότι δε λείπει κάποιο μπλοκ μέσα στον ορισμό της συνάρτησης."},
"errorParamInputUnattached":function(d){return "Θυμηθείτε να ενώσετε ένα μπλοκ σε κάθε παράμετρο εισόδου στο μπλοκ της συνάρτησης στο χώρο εργασίας σας."},
"errorUnusedParam":function(d){return "Προσθέσατε ένα μπλοκ παραμέτρου, αλλά δεν το χρησιμοποιήσατε στον ορισμό. Για να χρησιμοποιήσετε την παράμετρο, κάντε κλικ στο \"Επεξεργασία\" και τοποθετήστε το μπλοκ παραμέτρου μέσα στο πράσινο μπλοκ."},
"errorRequiredParamsMissing":function(d){return "Δημιουργήστε μια παράμετρο για τη συνάρτησή σας κάνοντας κλικ στο \"Επεξεργασία\" και προσθέτοντας τις απαραίτητες παραμέτρους. Σύρετε τα νέα μπλοκ παραμέτρων μέσα στον ορισμό της συνάρτησής σας."},
"errorUnusedFunction":function(d){return "Δημιουργήσατε μια συνάρτηση, αλλά δεν τη χρησιμοποιήσατε στο χώρο εργασίας σας! Κάνε κλικ στο \"Συναρτήσεις\" στην εργαλειοθήκη και βεβαιωθείτε ότι τη χρησιμοποιείτε στο πρόγραμμά σας."},
"errorQuestionMarksInNumberField":function(d){return "Δοκιμάστε να αντικαταστήσετε τα ερωτηματικά με μια τιμή."},
"extraTopBlocks":function(d){return "Έχεις ασύνδετα μπλοκ."},
"extraTopBlocksWhenRun":function(d){return "Έχεις ασύνδετα μπλοκ. Μήπως εννοείς να τα συνδέσεις στο μπλοκ \"όταν τρέχει\";"},
"finalStage":function(d){return "Συγχαρητήρια! τέλειωσες το τελικό στάδιο."},
"finalStageTrophies":function(d){return "Συγχαρητήρια! Τέλειωσες το τελευταίο στάδιο και κέρδισες "+locale.p(d,"numTrophies",0,"el",{"one":"τρόπαιο","other":locale.n(d,"numTrophies")+" τράπαια"})+"."},
"finish":function(d){return "Τερματισμός"},
"generatedCodeInfo":function(d){return "Ακόμη και τα κορυφαία πανεπιστήμια διδάσκουν κώδικα με βάση τα μπλοκ (π.χ. "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). Αλλά στο παρασκήνιο τα μπλοκ που συναρμολόγησες μπορούν να εμφανιστούν σε JavaScript, την πιο διαδεδομένη γλώσσα προγραμματισμού στον κόσμο:"},
"hashError":function(d){return "Συγνώμη, το '%1' δεν αντιστοιχεί με κανένα αποθηκευμένο πρόγραμμα."},
"help":function(d){return "Βοήθεια"},
"hintTitle":function(d){return "Υπόδειξη:"},
"jump":function(d){return "πήδα"},
"keepPlaying":function(d){return "Συνέχισε το Παιχνίδι"},
"levelIncompleteError":function(d){return "Χρησιμοποιείς όλα τα αναγκαία είδη μπλοκ, αλλά όχι με τον σωστό τρόπο."},
"listVariable":function(d){return "λίστα"},
"makeYourOwnFlappy":function(d){return "Φτιάξτε το δικό σας Flappy παιχνίδι"},
"missingBlocksErrorMsg":function(d){return "Δοκίμασε ένα ή περισσότερα από τα παρακάτω μπλοκ για να λύσεις το παζλ."},
"nextLevel":function(d){return "Συγχαρητήρια! Τελείωσες το παζλ "+locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Συγχαρητήρια! Τελείωσες το παζλ "+locale.v(d,"puzzleNumber")+" και κέρδισες "+locale.p(d,"numTrophies",0,"el",{"one":"τρόπαιο","other":locale.n(d,"numTrophies")+" τρόπαια"})+"."},
"nextPuzzle":function(d){return "Next Puzzle"},
"nextStage":function(d){return "Συγχαρητήρια! Ολοκληρώσατε το "+locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Συγχαρητήρια! Ολοκλήρωσες  το στάδιο "+locale.v(d,"stageName")+" και κέρδισες "+locale.p(d,"numTrophies",0,"el",{"one":"a trophy","other":locale.n(d,"numTrophies")+" τράπαια"})+"."},
"numBlocksNeeded":function(d){return "Συγχαρητήρια! Τελείωσες το πάζλ "+locale.v(d,"puzzleNumber")+". (Όμως, θα μπορούσες να βάλεις μόνο   "+locale.p(d,"numBlocks",0,"el",{"one":"1 μπλοκ","other":locale.n(d,"numBlocks")+" μπλοκ"})+".)"},
"numLinesOfCodeWritten":function(d){return "Μόλις έγραψες "+locale.p(d,"numLines",0,"el",{"one":"1 γραμμή","other":locale.n(d,"numLines")+" γραμμές"})+" κώδικα!"},
"play":function(d){return "παίξε"},
"print":function(d){return "Εκτύπωσε"},
"puzzleTitle":function(d){return "Παζλ "+locale.v(d,"puzzle_number")+" από "+locale.v(d,"stage_total")},
"repeat":function(d){return "επανάλαβε"},
"resetProgram":function(d){return "Επαναφορά"},
"runProgram":function(d){return "Τρέξτε"},
"runTooltip":function(d){return "Τρέξτε το πρόγραμμα που ορίζεται από τα μπλοκ στο χώρο εργασίας."},
"score":function(d){return "σκορ"},
"showCodeHeader":function(d){return "Προβολή κώδικα"},
"showBlocksHeader":function(d){return "Εμφάνισε τα μπλοκ"},
"showGeneratedCode":function(d){return "Προβολή κώδικα"},
"stringEquals":function(d){return "συμβολοσειρά = ;"},
"subtitle":function(d){return "ένα οπτικό περιβάλλον προγραμματισμού"},
"textVariable":function(d){return "κείμενο"},
"tooFewBlocksMsg":function(d){return "Χρησιμοποιείς όλα τα αναγκαία είδη μπλοκ, αλλά δοκίμασε να χρησιμοποιήσεις περισσότερα απο τα μπλοκ αυτών των ειδών για να ολοκληρώσεις το παζλ."},
"tooManyBlocksMsg":function(d){return "Αυτό το παζλ μπορεί να λυθεί με  <x id='START_SPAN'/><x id='END_SPAN'/> μπλοκ."},
"tooMuchWork":function(d){return "Με ανάγκασες να κάνω πολλή δουλειά! Μπορείς με λιγότερες επαναλήψεις;"},
"toolboxHeader":function(d){return "μπλοκ"},
"toolboxHeaderDroplet":function(d){return "Εργαλειοθήκη"},
"hideToolbox":function(d){return "(Κρύψε)"},
"showToolbox":function(d){return "Εμφάνιση Εργαλειοθήκης"},
"openWorkspace":function(d){return "Πώς λειτουργεί"},
"totalNumLinesOfCodeWritten":function(d){return "Γενικό σύνολο: "+locale.p(d,"numLines",0,"el",{"one":"1 γραμμή","other":locale.n(d,"numLines")+" γραμμές"})+" κώδικα."},
"tryAgain":function(d){return "Δοκίμασε ξανά"},
"hintRequest":function(d){return "Δείτε την υπόδειξη"},
"backToPreviousLevel":function(d){return "Πίσω στο προηγούμενο επίπεδο"},
"saveToGallery":function(d){return "Αποθήκευση στη συλλογή"},
"savedToGallery":function(d){return "Αποθηκεύτηκε στη συλλογή!"},
"shareFailure":function(d){return "Συγγνώμη, δεν μπορούμε να μοιράσουμε αυτό το πρόγραμμα."},
"workspaceHeaderShort":function(d){return "Χώρος εργασίας: "},
"infinity":function(d){return "Άπειρο"},
"rotateText":function(d){return "Περιστρέψτε τη συσκευή σας."},
"orientationLock":function(d){return "Απενεργοποιήστε το κλείδωμα περιστροφής στις ρυθμίσεις της συσκευής σας."},
"wantToLearn":function(d){return "Θέλετε να μάθετε προγραμματισμό;"},
"watchVideo":function(d){return "Δείτε το βίντεο"},
"when":function(d){return "όταν"},
"whenRun":function(d){return "όταν εκτελείται"},
"tryHOC":function(d){return "Δοκίμασε την Ώρα του Κώδικα"},
"signup":function(d){return "Κάντε εγγραφή για το εισαγωγικό μάθημα"},
"hintHeader":function(d){return "Να μια συμβουλή:"},
"genericFeedback":function(d){return "Δες πως κατέληξες και δοκίμασε να διορθώσεις το πρόγραμμά σου."},
"toggleBlocksErrorMsg":function(d){return "Πρέπει να διορθώσετε ένα σφάλμα στο πρόγραμμά σας πριν μπορεί να παρουσιασθεί ως μπλοκ."},
"defaultTwitterText":function(d){return "Δείτε τι έκανα"}};