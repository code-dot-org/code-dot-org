var bounce_locale = {lc:{"ar":function(n){
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
v:function(d,k){bounce_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){bounce_locale.c(d,k);return d[k] in p?p[d[k]]:(k=bounce_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){bounce_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).bounce_locale = {
"bounceBall":function(d){return "μπάλα που αναπηδά"},
"bounceBallTooltip":function(d){return "Κάνε τη μπάλα να αναπηδήσει μακρυά από ένα αντικείμενο."},
"continue":function(d){return "Συνέχεια"},
"dirE":function(d){return "Α"},
"dirN":function(d){return "Β"},
"dirS":function(d){return "Ν"},
"dirW":function(d){return "Δ"},
"doCode":function(d){return "κάνε"},
"elseCode":function(d){return "αλλιώς"},
"finalLevel":function(d){return "Συγχαρητήρια! Έλυσες το τελευταίο Παζλ."},
"heightParameter":function(d){return "ύψος"},
"ifCode":function(d){return "εάν"},
"ifPathAhead":function(d){return "Εάν υπάρχει διαδρομή μπροστά"},
"ifTooltip":function(d){return "Αν υπάρχει ένα μονοπάτι προς τη συγκεκριμένη κατεύθυνση, τότε κάνε κάποιες ενέργειες."},
"ifelseTooltip":function(d){return "Αν υπάρχει ένα μονοπάτι στη συγκεκριμένη κατεύθυνση, τότε εκτέλεσε την πρώτη ομάδα ενεργειών. Διαφορετικά, εκτέλεσε τη δεύτερη ομάδα ενεργειών."},
"incrementOpponentScore":function(d){return "σκόραρε πόντο αντιπάλου"},
"incrementOpponentScoreTooltip":function(d){return "Πρόσθεσε ένα στη βαθμολογία του αντιπάλου."},
"incrementPlayerScore":function(d){return "σκόραρε πόντο"},
"incrementPlayerScoreTooltip":function(d){return "Προσθέστε ένα στην τρέχουσα βαθμολογία παίκτη."},
"isWall":function(d){return "αυτός είναι ένας τοίχος"},
"isWallTooltip":function(d){return "Επιστρέφει αληθές εάν υπάρχει ένας τοίχος εδώ"},
"launchBall":function(d){return "εκτόξευσε νέα μπάλα"},
"launchBallTooltip":function(d){return "Εκτόξευσε νέα μπάλα στο παιχνίδι."},
"makeYourOwn":function(d){return "Φτιάξε το Δικό Σου παιχνίδι Αναπήδησης"},
"moveDown":function(d){return "προχώρησε προς τα κάτω"},
"moveDownTooltip":function(d){return "Μετακίνησε τη ρακέτα προς τα κάτω."},
"moveForward":function(d){return "προχώρησε μπροστά"},
"moveForwardTooltip":function(d){return "Μετακίνησε με προς τα μπροστά κατά ένα βήμα."},
"moveLeft":function(d){return "Προχώρησε αριστερά"},
"moveLeftTooltip":function(d){return "Μετακίνησε τη ρακέτα προς τα αριστερά."},
"moveRight":function(d){return "Προχώρησε δεξιά"},
"moveRightTooltip":function(d){return "Μετακίνησε τη ρακέτα προς τα δεξιά."},
"moveUp":function(d){return "προχώρησε προς τα επάνω"},
"moveUpTooltip":function(d){return "Μετακίνησε τη ρακέτα προς τα πάνω."},
"nextLevel":function(d){return "Συγχαρητήρια! Έχετε ολοκληρώσει αυτό το παζλ."},
"no":function(d){return "Όχι"},
"noPathAhead":function(d){return "μονοπάτι κλειστό"},
"noPathLeft":function(d){return "κανένα μονοπάτι προς τα αριστερά"},
"noPathRight":function(d){return "κανένα μονοπάτι προς τα δεξιά"},
"numBlocksNeeded":function(d){return "Αυτό το παζλ μπορεί να λυθεί με %1 μπλοκ."},
"pathAhead":function(d){return "μονοπάτι ελεύθερο"},
"pathLeft":function(d){return "εάν υπάρχει μονοπάτι αριστερά"},
"pathRight":function(d){return "εάν υπάρχει μονοπάτι δεξιά"},
"pilePresent":function(d){return "υπάρχει ένας σωρός"},
"playSoundCrunch":function(d){return "παίξε ήχο τριξίματος"},
"playSoundGoal1":function(d){return "παίξε ήχο γκολ 1"},
"playSoundGoal2":function(d){return "παίξε ήχο γκολ 2"},
"playSoundHit":function(d){return "παίξε ήχο κτυπήματος"},
"playSoundLosePoint":function(d){return "παίξε ήχο απώλειας πόντου"},
"playSoundLosePoint2":function(d){return "παίξε ήχου απώλειας πόντου 2"},
"playSoundRetro":function(d){return "παίξε ήχο ρετρό"},
"playSoundRubber":function(d){return "παίξε ήχου καουτσούκ"},
"playSoundSlap":function(d){return "παίξε ήχου χαστουκιού"},
"playSoundTooltip":function(d){return "Παίξε τον επιλεγμένο ήχο."},
"playSoundWinPoint":function(d){return "παίξε ήχο πόντου νίκης"},
"playSoundWinPoint2":function(d){return "παίξε ήχο πόντου νίκης 2"},
"playSoundWood":function(d){return "παίξε ήχο ξύλου"},
"putdownTower":function(d){return "άφησε κάτω τον πύργο"},
"reinfFeedbackMsg":function(d){return "Μπορείς να πατήσεις το πλήκτρο \"Δοκίμασε ξανά\" για να επιστρέψεις στο παιχνίδι σου."},
"removeSquare":function(d){return "αφαίρεσε το τετράγωνο"},
"repeatUntil":function(d){return "επανάλαβε μέχρις ότου"},
"repeatUntilBlocked":function(d){return "όσο μονοπάτι εμπρός"},
"repeatUntilFinish":function(d){return "επανάλαβε μέχρι τέλος"},
"scoreText":function(d){return "Σκορ: "+bounce_locale.v(d,"playerScore")+" : "+bounce_locale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "όρισε τυχαία σκηνή"},
"setBackgroundHardcourt":function(d){return "όρισε σκηνή γηπέδου"},
"setBackgroundRetro":function(d){return "όρισε σκηνή ρετρό"},
"setBackgroundTooltip":function(d){return "Ορίζει την εικόνα στο φόντο"},
"setBallRandom":function(d){return "όρισε τυχαία μπάλα"},
"setBallHardcourt":function(d){return "όρισε μπάλα γηπέδου"},
"setBallRetro":function(d){return "όρισε μπάλα ρετρό"},
"setBallTooltip":function(d){return "Ορίζει την εικόνα της μπάλας"},
"setBallSpeedRandom":function(d){return "όρισε τυχαία ταχύτητα μπάλας"},
"setBallSpeedVerySlow":function(d){return "όρισε πολύ αργή ταχύτητα μπάλας"},
"setBallSpeedSlow":function(d){return "όρισε αργή ταχύτητα μπάλας"},
"setBallSpeedNormal":function(d){return "όρισε κανονική ταχύτητα μπάλας"},
"setBallSpeedFast":function(d){return "όρισε γρήγορη ταχύτητα μπάλας"},
"setBallSpeedVeryFast":function(d){return "όρισε πολύ γρήγορη ταχύτητα μπάλας"},
"setBallSpeedTooltip":function(d){return "Ορίζει την ταχύτητα της μπάλας"},
"setPaddleRandom":function(d){return "όρισε τυχαία ρακέτα"},
"setPaddleHardcourt":function(d){return "όρισε ρακέτα γηπέδου"},
"setPaddleRetro":function(d){return "όρισε ρακέτα ρετρό"},
"setPaddleTooltip":function(d){return "Ορίζει την εικόνα της ρακέτας"},
"setPaddleSpeedRandom":function(d){return "όρισε τυχαία ταχύτητα ρακέτας"},
"setPaddleSpeedVerySlow":function(d){return "όρισε πολύ αργή ταχύτητα ρακέτας"},
"setPaddleSpeedSlow":function(d){return "όρισε αργή ταχύτητα ρακέτας"},
"setPaddleSpeedNormal":function(d){return "όρισε κανονική ταχύτητα ρακέτας"},
"setPaddleSpeedFast":function(d){return "όρισε γρήγορη ταχύτητα ρακέτας"},
"setPaddleSpeedVeryFast":function(d){return "όρισε πολύ γρήγορη ταχύτητα ρακέτας"},
"setPaddleSpeedTooltip":function(d){return "Ορίζει την ταχύτητα της ρακέτας"},
"shareBounceTwitter":function(d){return "Κοιτάξτε το παιχνίδι Αναπήδησης που έφτιαξα. Το έγραψα εγώ με το @codeorg"},
"shareGame":function(d){return "Μοιράσου το παιχνίδι σου:"},
"turnLeft":function(d){return "στρίψε αριστερά"},
"turnRight":function(d){return "στρίψε δεξιά"},
"turnTooltip":function(d){return "Με περιστρέφει αριστερά ή δεξιά κατά 90 μοίρες."},
"whenBallInGoal":function(d){return "όταν η μπάλα είναι στο στόχο"},
"whenBallInGoalTooltip":function(d){return "Εκτέλεσε της παρακάτω ενέργειες όταν η μπάλα εισέλθει στο στόχο."},
"whenBallMissesPaddle":function(d){return "όταν η μπάλα αστοχεί τη ρακέτα"},
"whenBallMissesPaddleTooltip":function(d){return "Εκτέλεσε τις παρακάτω ενέργειες όταν η μπάλα αστοχήσει τη ρακέτα."},
"whenDown":function(d){return "όταν πατηθεί το κάτω βέλος"},
"whenDownTooltip":function(d){return "Εκτέλεσε τις παρακάτω ενέργειες όταν πατηθεί το πλήκτρο κάτω βέλος."},
"whenGameStarts":function(d){return "όταν το παιχνίδι αρχίζει"},
"whenGameStartsTooltip":function(d){return "Εκτέλεσε τις παρακάτω ενέργειες όταν το παιχνίδι αρχίζει."},
"whenLeft":function(d){return "όταν πατηθεί το αριστερό βέλος"},
"whenLeftTooltip":function(d){return "Εκτέλεσε τις παρακάτω ενέργειες όταν πατηθεί το πλήκτρο αριστερό βέλος."},
"whenPaddleCollided":function(d){return "όταν η μπάλα κτυπήσει τη ρακέτα"},
"whenPaddleCollidedTooltip":function(d){return "Εκτέλεσε τις παρακάτω ενέργειες όταν η μπάλα συγκρουσθεί με τη ρακέτα."},
"whenRight":function(d){return "όταν πατηθεί το δεξί βέλος"},
"whenRightTooltip":function(d){return "Εκτέλεσε τις παρακάτω ενέργειες όταν πατηθεί το πλήκτρο δεξί βέλος."},
"whenUp":function(d){return "όταν πατηθεί το πάνω βέλος"},
"whenUpTooltip":function(d){return "Εκτέλεσε τις παρακάτω ενέργειες όταν πατηθεί το πλήκτρο πάνω βέλος."},
"whenWallCollided":function(d){return "όταν η μπάλα κτυπήσει τοίχο"},
"whenWallCollidedTooltip":function(d){return "Εκτέλεσε τις παρακάτω ενέργειες όταν η μπάλα συγκρουσθεί με έναν τοίχο."},
"whileMsg":function(d){return "όσο"},
"whileTooltip":function(d){return "Επανάλαβε τις εσωτερικές ενέργειες μέχρι το τελικό σημείο."},
"yes":function(d){return "Ναι"}};