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
"codeTooltip":function(d){return "Δείτε τον κώδικα JavaScript."},
"continue":function(d){return "Συνέχεια"},
"dialogCancel":function(d){return "Άκυρο"},
"dialogOK":function(d){return "OΚ"},
"directionNorthLetter":function(d){return "Β"},
"directionSouthLetter":function(d){return "Ν"},
"directionEastLetter":function(d){return "Α"},
"directionWestLetter":function(d){return "Δ"},
"end":function(d){return "τέλος"},
"emptyBlocksErrorMsg":function(d){return "Το μπλοκ του \"Repeat\" ή του \"If\" πρέπει να περιέχει άλλα μπλοκ για να δουλέψει. Σιγουρέψου ότι το εσωτερικό μπλοκ χωράει σωστά μέσα στο μπλόκ που το περιέχει."},
"emptyFunctionBlocksErrorMsg":function(d){return "Το μπλόκ της συνάρτησης χρειάζεται να έχει άλλα μπλοκ μέσα του για να δουλέψει."},
"errorEmptyFunctionBlockModal":function(d){return "Πρέπει να εισάγετε κάποια μπλοκ μέσα στον ορισμό της συνάρτησης. Κάντε κλικ στο κουμπί \"Επεξεργασία\" και σύρετε τα μπλοκς μέσα στο πράσινο μπλοκ."},
"errorIncompleteBlockInFunction":function(d){return "Κάντε κλικ στο κουμπί \"Επεξεργασία\" για να βεβαιωθείτε ότι δε λείπει κάποιο μπλοκ μέσα στον ορισμό της συνάρτησης."},
"errorParamInputUnattached":function(d){return "Θυμηθείτε να ενώσετε ένα μπλοκ σε κάθε παράμετρο εισόδου στο μπλοκ της συνάρτησης στο χώρο εργασίας σας."},
"errorUnusedParam":function(d){return "Προσθέσατε ένα μπλοκ παραμέτρου, αλλά δεν το χρησιμοποιήσατε στον ορισμό. Για να χρησιμοποιήσετε την παράμετρο, κάντε κλικ στο \"Επεξεργασία\" και τοποθετήστε το μπλοκ παραμέτρου μέσα στο πράσινο μπλοκ."},
"errorRequiredParamsMissing":function(d){return "Δημιουργήστε μια παράμετρο για τη συνάρτησή σας κάνοντας κλικ στο \"Επεξεργασία\" και προσθέτοντας τις απαραίτητες παραμέτρους. Σύρετε τα νέα μπλοκ παραμέτρων μέσα στον ορισμό της συνάρτησής σας."},
"errorUnusedFunction":function(d){return "Δημιουργήσατε μια συνάρτηση, αλλά δεν τη χρησιμοποιήσατε στο χώρο εργασίας σας! Κάνε κλικ στο \"Συναρτήσεις\" στην εργαλειοθήκη και βεβαιωθείτε ότι τη χρησιμοποιείτε στο πρόγραμμά σας."},
"errorQuestionMarksInNumberField":function(d){return "Δοκιμάστε να αντικαταστήσετε τα ερωτηματικά με μια τιμή."},
"extraTopBlocks":function(d){return "Έχεις ασύνδετα μπλοκ. Θέλεις να τα συνδέσεις στο μπλοκ \"όταν εκτελείται\";"},
"finalStage":function(d){return "Συγχαρητήρια! τέλειωσες το τελικό στάδιο."},
"finalStageTrophies":function(d){return "Συγχαρητήρια! Τέλειωσες το τελευταίο στάδιο και κέρδισες "+locale.p(d,"numTrophies",0,"el",{"one":"τρόπαιο","other":locale.n(d,"numTrophies")+" τράπαια"})+"."},
"finish":function(d){return "Τερματισμός"},
"generatedCodeInfo":function(d){return "Ακόμη και τα κορυφαία πανεπιστήμια διδάσκουν κώδικα με βάση τα μπλοκ (π.χ. "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). Αλλά στο παρασκήνιο τα μπλοκ που συναρμολόγησες μπορούν να εμφανιστούν σε JavaScript, την πιο διαδεδομένη γλώσσα προγραμματισμού στον κόσμο:"},
"hashError":function(d){return "Συγνώμη, το '%1' δεν αντιστοιχεί με κανένα αποθηκευμένο πρόγραμμα."},
"help":function(d){return "Βοήθεια"},
"hintTitle":function(d){return "Υπόδειξη:"},
"jump":function(d){return "πήδα"},
"levelIncompleteError":function(d){return "Χρησιμοποιείς όλα τα αναγκαία είδη μπλοκ, αλλά όχι με τον σωστό τρόπο."},
"listVariable":function(d){return "λίστα"},
"makeYourOwnFlappy":function(d){return "Φτιάξτε το δικό σας Flappy παιχνίδι"},
"missingBlocksErrorMsg":function(d){return "Δοκίμασε ένα ή περισσότερα από τα παρακάτω μπλοκ για να λύσεις το παζλ."},
"nextLevel":function(d){return "Συγχαρητήρια! Τελείωσες το παζλ "+locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Συγχαρητήρια! Τελείωσες το παζλ "+locale.v(d,"puzzleNumber")+" και κέρδισες "+locale.p(d,"numTrophies",0,"el",{"one":"τρόπαιο","other":locale.n(d,"numTrophies")+" τρόπαια"})+"."},
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
"openWorkspace":function(d){return "Πώς λειτουργεί"},
"totalNumLinesOfCodeWritten":function(d){return "Γενικό σύνολο: "+locale.p(d,"numLines",0,"el",{"one":"1 γραμμή","other":locale.n(d,"numLines")+" γραμμές"})+" κώδικα."},
"tryAgain":function(d){return "Δοκίμασε ξανά"},
"hintRequest":function(d){return "Δείτε την υπόδειξη"},
"backToPreviousLevel":function(d){return "Πίσω στο προηγούμενο επίπεδο"},
"saveToGallery":function(d){return "Αποθήκευση στη συλλογή"},
"savedToGallery":function(d){return "Αποθηκεύτηκε στη συλλογή!"},
"shareFailure":function(d){return "Συγγνώμη, δεν μπορούμε να μοιράσουμε αυτό το πρόγραμμα."},
"workspaceHeader":function(d){return "Συναρμολόγησε τα μπλοκ σου εδώ: "},
"workspaceHeaderJavaScript":function(d){return "Πληκτρολογήστε τον Javascript κώδικά σας εδώ"},
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