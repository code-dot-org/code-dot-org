var turtle_locale = {lc:{"ar":function(n){
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
v:function(d,k){turtle_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){turtle_locale.c(d,k);return d[k] in p?p[d[k]]:(k=turtle_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){turtle_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).turtle_locale = {
"blocksUsed":function(d){return "Μπλοκ χρησιμοποιημένα: %1"},
"branches":function(d){return "διακλαδώσεις"},
"catColour":function(d){return "Χρώμα"},
"catControl":function(d){return "Βρόχοι"},
"catMath":function(d){return "Μαθηματικά"},
"catProcedures":function(d){return "Συναρτήσεις"},
"catTurtle":function(d){return "Ενέργειες"},
"catVariables":function(d){return "Μεταβλητές"},
"catLogic":function(d){return "Λογική"},
"colourTooltip":function(d){return "Αλλάζει το χρώμα του μολυβιού."},
"createACircle":function(d){return "Φτιάξε κύκλο"},
"createSnowflakeSquare":function(d){return "δημιούργησε μια νιφάδα χιονιού τύπου τετραγώνου"},
"createSnowflakeParallelogram":function(d){return "δημιούργησε μια νιφάδα χιονιού τύπου παραλληλόγραμμου"},
"createSnowflakeLine":function(d){return "δημιούργησε μια νιφάδα χιονιού γραμμικού τύπου"},
"createSnowflakeSpiral":function(d){return "δημιούργησε μια νιφάδα χιονιού τύπου έλικας"},
"createSnowflakeFlower":function(d){return "δημιούργησε μια νιφάδα χιονιού τύπου λουλουδιού"},
"createSnowflakeFractal":function(d){return "δημιούργησε μια νιφάδα χιονιού τύπου φράκταλ"},
"createSnowflakeRandom":function(d){return "δημιούργησε μια νιφάδα χιονιού τυχαίου τύπου"},
"createASnowflakeBranch":function(d){return "δημιουργήσετε ένα κλάδο της νιφάδας χιονιού"},
"degrees":function(d){return "μοίρες"},
"depth":function(d){return "βάθος"},
"dots":function(d){return "εικονοστοιχεία"},
"drawASquare":function(d){return "σχεδίασε ένα τετράγωνο"},
"drawATriangle":function(d){return "σχεδίασε ένα τρίγωνο"},
"drawACircle":function(d){return "Σχεδίασε ένα κύκλο"},
"drawAFlower":function(d){return "σχεδίασε ένα λουλούδι"},
"drawAHexagon":function(d){return "σχεδίασε ένα εξάγωνο"},
"drawAHouse":function(d){return "σχεδίασε ένα σπίτι"},
"drawAPlanet":function(d){return "σχεδίασε έναν πλανήτη"},
"drawARhombus":function(d){return "σχεδίασε έναν ρόμβο"},
"drawARobot":function(d){return "σχεδίασε ένα ρομπότ"},
"drawARocket":function(d){return "σχεδίασε έναν πύραυλο"},
"drawASnowflake":function(d){return "σχεδίασε μια νιφάδα χιονιού"},
"drawASnowman":function(d){return "σχεδίασε έναν χιονάνθρωπο"},
"drawAStar":function(d){return "σχεδίασε ένα αστέρι"},
"drawATree":function(d){return "σχεδίασε ένα δέντρο"},
"drawUpperWave":function(d){return "σχεδίασε επάνω κύμα"},
"drawLowerWave":function(d){return "σχεδίασε κάτω κύμα"},
"drawStamp":function(d){return "σφραγίδα"},
"heightParameter":function(d){return "ύψος"},
"hideTurtle":function(d){return "κρύψε τον καλλιτέχνη"},
"jump":function(d){return "πήδα"},
"jumpBackward":function(d){return "κάνε άλμα προς τα πίσω κατά"},
"jumpForward":function(d){return "κάνε άλμα προς τα εμπρός κατά"},
"jumpTooltip":function(d){return "Μετακινεί τον καλλιτέχνη χωρίς να αφήνει ίχνη."},
"jumpEastTooltip":function(d){return "Μετακινεί τον καλλιτέχνη ανατολικά χωρίς να αφήνει σημάδια."},
"jumpNorthTooltip":function(d){return "Μετακινεί τον καλλιτέχνη βόρεια χωρίς να αφήνει σημάδια."},
"jumpSouthTooltip":function(d){return "Μετακινεί τον καλλιτέχνη νότια χωρίς να αφήνει σημάδια."},
"jumpWestTooltip":function(d){return "Μετακινεί τον καλλιτέχνη δυτικά χωρίς να αφήνει σημάδια."},
"lengthFeedback":function(d){return "Το πέτυχες σωστά εκτός από το μήκος που θα πηδήξεις."},
"lengthParameter":function(d){return "μήκος"},
"loopVariable":function(d){return "μετρητής"},
"moveBackward":function(d){return "προχώρησε προς τα πίσω κατά"},
"moveEastTooltip":function(d){return "Μετακινεί τον καλλιτέχνη ανατολικά."},
"moveForward":function(d){return "προχώρησε προς τα εμπρός κατά"},
"moveForwardTooltip":function(d){return "Μετακινεί τον καλλιτέχνη μπροστά."},
"moveNorthTooltip":function(d){return "Μετακινεί τον καλλιτέχνη βόρεια."},
"moveSouthTooltip":function(d){return "Μετακινεί τον καλλιτέχνη νότια."},
"moveWestTooltip":function(d){return "Μετακινεί τον καλλιτέχνη δυτικά."},
"moveTooltip":function(d){return "Μετακινεί τον καλλιτέχνη μπροστά ή πίσω κατά την καθορισμένη τιμή."},
"notBlackColour":function(d){return "Πρέπει να ορίσεις ένα χρώμα διαφορετικό από το μαύρο για αυτό το παζλ."},
"numBlocksNeeded":function(d){return "Αυτό το παζλ μπορεί να λυθεί με %1 μπλοκ. Χρησιμοποιήσατε %2."},
"penDown":function(d){return "μολύβι κάτω"},
"penTooltip":function(d){return "Ανεβάζει ή κατεβάζει το μολύβι, για να ξεκινήσει ή να σταματήσει η σχεδίαση."},
"penUp":function(d){return "μολύβι επάνω"},
"reinfFeedbackMsg":function(d){return "Εδώ είναι το σχέδιό σου! Συνέχισε με αυτό ή πήγαινε στο επόμενο παζλ."},
"setColour":function(d){return "όρισε χρώμα"},
"setPattern":function(d){return "όρισε μοτίβο"},
"setWidth":function(d){return "όρισε πάχος"},
"shareDrawing":function(d){return "Μοιράσου το σχέδιό σου:"},
"showMe":function(d){return "Δείξε μου"},
"showTurtle":function(d){return "εμφάνισε τον καλλιτέχνη"},
"sizeParameter":function(d){return "μέγεθος"},
"step":function(d){return "βήμα"},
"tooFewColours":function(d){return "Πρέπει να χρησιμοποιήσεις τουλάχιστον %1 διαφορετικά χρώματα για αυτό το παζλ.  Έχεις χρησιμοποιήσει μόνο %2."},
"turnLeft":function(d){return "στρίψε αριστερά κατά"},
"turnRight":function(d){return "στρίψε δεξιά κατά"},
"turnRightTooltip":function(d){return "Στρίβει τον καλλιτέχνη δεξιά κατά την καθορισμένη γωνία."},
"turnTooltip":function(d){return "Στρίβει τον καλλιτέχνη αριστερά ή δεξιά κατά τον καθορισμένο αριθμό μοιρών."},
"turtleVisibilityTooltip":function(d){return "Κάνει τον καλλιτέχνη ορατό ή αόρατο."},
"widthTooltip":function(d){return "Αλλάζει το πάχος του μολυβιού."},
"wrongColour":function(d){return "Η εικόνα σας έχει λάθος χρώμα. Για αυτό το παζλ, πρέπει να είναι %1."}};