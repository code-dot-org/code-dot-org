var maze_locale = {lc:{"ar":function(n){
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
v:function(d,k){maze_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){maze_locale.c(d,k);return d[k] in p?p[d[k]]:(k=maze_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){maze_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).maze_locale = {
"atHoneycomb":function(d){return "στην κυψέλη"},
"atFlower":function(d){return "στο λουλούδι"},
"avoidCowAndRemove":function(d){return "απόφυγε την αγελάδα και αφαίρεσε 1"},
"continue":function(d){return "Συνέχεια"},
"dig":function(d){return "αφαίρεσε 1"},
"digTooltip":function(d){return "βγάλε 1 μονάδα χώματος"},
"dirE":function(d){return "Α"},
"dirN":function(d){return "Β"},
"dirS":function(d){return "Ν"},
"dirW":function(d){return "Δ"},
"doCode":function(d){return "κάνε"},
"elseCode":function(d){return "αλλιώς"},
"fill":function(d){return "γέμισε 1"},
"fillN":function(d){return "γέμισε "+maze_locale.v(d,"shovelfuls")},
"fillStack":function(d){return "γέμισε τη στοίβα των φτυαριές"+maze_locale.v(d,"shovelfuls")+" τρυπών"},
"fillSquare":function(d){return "γέμισε το τετράγωνο"},
"fillTooltip":function(d){return "βάλε 1 μονάδα χώματος"},
"finalLevel":function(d){return "Συγχαρητήρια! Έλυσες το τελευταίο Παζλ."},
"flowerEmptyError":function(d){return "Το λουλούδι στο οποίο βρίσκεσαι δεν έχει άλλο νέκταρ."},
"get":function(d){return "πάρε"},
"heightParameter":function(d){return "ύψος"},
"holePresent":function(d){return "υπάρχει μια τρύπα"},
"honey":function(d){return "φτιάξε μέλι"},
"honeyAvailable":function(d){return "μέλι"},
"honeyTooltip":function(d){return "Φτιάξε μέλι από νέκταρ"},
"honeycombFullError":function(d){return "Αυτή η κυψέλη δεν έχει χώρο για άλλο μέλι."},
"ifCode":function(d){return "εάν"},
"ifInRepeatError":function(d){return "Χρειάζεσαι ένα πλακίδιο  «εάν» μέσα σε ένα πλακίδιο «επανάλαβε». Εάν αντιμετωπίζεις προβλήματα, δοκίμασε το προηγούμενο επίπεδο πάλι για να δεις πώς λειτούργησε."},
"ifPathAhead":function(d){return "Εάν υπάρχει διαδρομή μπροστά"},
"ifTooltip":function(d){return "Αν υπάρχει ένα μονοπάτι προς τη συγκεκριμένη κατεύθυνση, τότε κάνε κάποιες ενέργειες."},
"ifelseTooltip":function(d){return "Αν υπάρχει ένα μονοπάτι στη συγκεκριμένη κατεύθυνση, τότε εκτέλεσε την πρώτη ομάδα ενεργειών. Διαφορετικά, εκτέλεσε τη δεύτερη ομάδα ενεργειών."},
"ifFlowerTooltip":function(d){return "Εάν υπάρχει λουλούδι / κυψέλη στη συγκεκριμένη κατεύθυνση, τότε κάνε κάποιες ενέργειες."},
"ifOnlyFlowerTooltip":function(d){return "Αν υπάρχει ένα λουλούδι στην συγκεκριμένη κατεύθυνση, τότε κάνε κάποιες ενέργεις."},
"ifelseFlowerTooltip":function(d){return "Εάν υπάρχει λουλούδι / κυψέλη στη συγκεκριμένη κατεύθυνση, τότε κάνε το πρώτο σετ από ενέργειες. Διαφορετικά, κάνε το δεύτερο σετ από ενέργειες."},
"insufficientHoney":function(d){return "Χρησιμοποιείς όλα τα σωστά πλακίδια, αλλά χρειάζεται να φτιάξεις τη σωστή ποσότητα μελιού."},
"insufficientNectar":function(d){return "Χρησιμοποιείς όλα τα σωστά πλακίδια, αλλά χρειάζεται να μαζέψεις τη σωστή ποσότητα μελιού."},
"make":function(d){return "φτιάξε"},
"moveBackward":function(d){return "πήγαινε πίσω"},
"moveEastTooltip":function(d){return "Πήγαινέ με ανατολικά ένα βήμα."},
"moveForward":function(d){return "προχώρησε μπροστά"},
"moveForwardTooltip":function(d){return "Μετακίνησέ με προς τα μπροστά κατά ένα βήμα."},
"moveNorthTooltip":function(d){return "Πήγαινέ με βόρεια ένα βήμα."},
"moveSouthTooltip":function(d){return "Πήγαινέ με νότια ένα βήμα."},
"moveTooltip":function(d){return "Πήγαινέ με εμπρός / πίσω ένα βήμα"},
"moveWestTooltip":function(d){return "Πήγαινέ με δυτικά ένα βήμα."},
"nectar":function(d){return "πάρε νέκταρ"},
"nectarRemaining":function(d){return "νέκταρ"},
"nectarTooltip":function(d){return "Πάρε νέκταρ από το λουλούδι"},
"nextLevel":function(d){return "Συγχαρητήρια! Έχετε ολοκληρώσει αυτό το παζλ."},
"no":function(d){return "Όχι"},
"noPathAhead":function(d){return "το μονοπάτι είναι κλειστό"},
"noPathLeft":function(d){return "δεν υπάρχει μονοπάτι προς τα αριστερά"},
"noPathRight":function(d){return "δεν υπάρχει μονοπάτι προς τα δεξιά"},
"notAtFlowerError":function(d){return "Μπορείς να πάρεις νέκταρ μόνο από ένα λουλούδι."},
"notAtHoneycombError":function(d){return "Μπορείς να φτιάξεις μέλι μόνο στην κυψέλη."},
"numBlocksNeeded":function(d){return "Αυτό το παζλ μπορεί να λυθεί με %1 μπλοκ."},
"pathAhead":function(d){return "μονοπάτι ελεύθερο"},
"pathLeft":function(d){return "εάν υπάρχει μονοπάτι αριστερά"},
"pathRight":function(d){return "εάν υπάρχει μονοπάτι δεξιά"},
"pilePresent":function(d){return "υπάρχει ένας σωρός"},
"putdownTower":function(d){return "άφησε κάτω τον πύργο"},
"removeAndAvoidTheCow":function(d){return "αφαίρεσε ένα και απέφυγε την αγελάδα"},
"removeN":function(d){return "αφαίρεσε "+maze_locale.v(d,"shovelfuls")},
"removePile":function(d){return "αφαίρεσε το σωρό"},
"removeStack":function(d){return "αφαίρεσε τη στοίβα από "+maze_locale.v(d,"shovelfuls")+" σωρούς"},
"removeSquare":function(d){return "αφαίρεσε το τετράγωνο"},
"repeatCarefullyError":function(d){return "Για να το λύσεις αυτό, σκέψου προσεκτικά σχετικά με το μοτίβο των δύο κινήσεων και της μιας στροφής που θα βάλεις στο πλακίδιο «επανάληψη».  Δεν υπάρχει πρόβλημα αν έχεις μία επιπλέον στροφή στο τέλος."},
"repeatUntil":function(d){return "επανάλαβε μέχρις ότου"},
"repeatUntilBlocked":function(d){return "όσο υπ'αρχει μονοπάτι εμπρός"},
"repeatUntilFinish":function(d){return "επανάλαβε μέχρι το τέλος"},
"step":function(d){return "Βήμα"},
"totalHoney":function(d){return "συνολικό μέλι"},
"totalNectar":function(d){return "συνολικό νέκταρ"},
"turnLeft":function(d){return "στρίψε αριστερά"},
"turnRight":function(d){return "στρίψε δεξιά"},
"turnTooltip":function(d){return "Με περιστρέφει αριστερά ή δεξιά κατά 90 μοίρες."},
"uncheckedCloudError":function(d){return "Βεβαιώσου ότι έλεγξες όλα τα σύννεφα για να δεις εάν είναι λουλούδια ή κυψέλες."},
"uncheckedPurpleError":function(d){return "Βεβαιώσου ότι έλεγξες όλα τα μοβ λουλούδια για να δεις εάν έχουν νέκταρ"},
"whileMsg":function(d){return "όσο"},
"whileTooltip":function(d){return "Επανάλαβε τις εσωτερικές ενέργειες μέχρι το τελικό σημείο."},
"word":function(d){return "Βρες τη λέξη"},
"yes":function(d){return "Ναι"},
"youSpelled":function(d){return "Έγραψες"}};