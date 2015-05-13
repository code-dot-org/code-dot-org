var flappy_locale = {lc:{"ar":function(n){
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
v:function(d,k){flappy_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){flappy_locale.c(d,k);return d[k] in p?p[d[k]]:(k=flappy_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){flappy_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).flappy_locale = {
"continue":function(d){return "Συνέχισε"},
"doCode":function(d){return "κάνε"},
"elseCode":function(d){return "αλλιώς"},
"endGame":function(d){return "τέλειωσε το παιχνίδι"},
"endGameTooltip":function(d){return "Τελειώνει το παιχνίδι."},
"finalLevel":function(d){return "Συγχαρητήρια! Έλυσες το τελευταίο Παζλ."},
"flap":function(d){return "Φτερούγισε"},
"flapRandom":function(d){return "Φτερούγισε τυχαία"},
"flapVerySmall":function(d){return "Φτερούγισε πολύ λίγο"},
"flapSmall":function(d){return "Φτερούγισε λίγο"},
"flapNormal":function(d){return "Φτερούγισε φυσιολογικά"},
"flapLarge":function(d){return "Φτερούγισε πολύ"},
"flapVeryLarge":function(d){return "Φτερούγισε πάρα πολύ"},
"flapTooltip":function(d){return "Πέτα τον Flappy προς τα επάνω."},
"flappySpecificFail":function(d){return "Ο κώδικάς σου δείχνει σωστός - θα φτερουγίζει με κάθε κλικ. Αλλά χρειάζεται να κάνεις κλικ πολλές φορές για να πετάξεις προς το στόχο."},
"incrementPlayerScore":function(d){return "σκόραρε έναν πόντο"},
"incrementPlayerScoreTooltip":function(d){return "Προσθέστε ένα στην τρέχουσα βαθμολογία παίκτη."},
"nextLevel":function(d){return "Συγχαρητήρια! Έχεις ολοκληρώσει αυτό το παζλ."},
"no":function(d){return "Όχι"},
"numBlocksNeeded":function(d){return "Αυτό το παζλ μπορεί να λυθεί με %1 μπλοκ."},
"playSoundRandom":function(d){return "παίξε τυχαίο ήχο"},
"playSoundBounce":function(d){return "παίξε ήχο αναπήδησης"},
"playSoundCrunch":function(d){return "παίξε ήχο τριξίματος"},
"playSoundDie":function(d){return "παίξε θλιμμένο ήχο"},
"playSoundHit":function(d){return "παίξε ήχο χτυπήματος"},
"playSoundPoint":function(d){return "παίξε ήχο πόντου"},
"playSoundSwoosh":function(d){return "παίξε ήχο στροβιλισμού"},
"playSoundWing":function(d){return "παίξε ήχο φτερού"},
"playSoundJet":function(d){return "παίξε ήχο τζετ"},
"playSoundCrash":function(d){return "παίξε ήχο συντριβής"},
"playSoundJingle":function(d){return "παίξε ήχο κουδουνίσματος"},
"playSoundSplash":function(d){return "παίξε ήχο πλατσουρίσματος"},
"playSoundLaser":function(d){return "παίξε ήχο λέιζερ"},
"playSoundTooltip":function(d){return "Παίξε τον επιλεγμένο ήχο."},
"reinfFeedbackMsg":function(d){return "Μπορείς να πατήσεις το πλήκτρο \"Δοκίμασε ξανά\" για να επιστρέψεις στο παιχνίδι σου."},
"scoreText":function(d){return "Βαθμολογία: "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "όρισε τη σκηνή"},
"setBackgroundRandom":function(d){return "όρισε Τυχαία σκηνή"},
"setBackgroundFlappy":function(d){return "όρισε τη σκηνή Πόλης (ημέρα)"},
"setBackgroundNight":function(d){return "όρισε τη σκηνή Πόλης (νύχτα)"},
"setBackgroundSciFi":function(d){return "όρισε τη σκηνή Διαστήματος"},
"setBackgroundUnderwater":function(d){return "όρισε τη σκηνή Κάτω από το Νερό"},
"setBackgroundCave":function(d){return "όρισε τη σκηνή Σπηλιά"},
"setBackgroundSanta":function(d){return "όρισε τη σκηνή Άη Βασίλης"},
"setBackgroundTooltip":function(d){return "Ορίζει την εικόνα στο φόντο"},
"setGapRandom":function(d){return "όρισε τυχαίο κενό"},
"setGapVerySmall":function(d){return "όρισε πολύ μικρό κενό"},
"setGapSmall":function(d){return "όρισε μικρό κενό"},
"setGapNormal":function(d){return "όρισε κανονικό κενό"},
"setGapLarge":function(d){return "όρισε μεγάλο κενό"},
"setGapVeryLarge":function(d){return "όρισε πολύ μεγάλο κενό"},
"setGapHeightTooltip":function(d){return "Ορίζει το κάθετο κενό σε ένα εμπόδιο"},
"setGravityRandom":function(d){return "όρισε τυχαία βαρύτητα"},
"setGravityVeryLow":function(d){return "όρισε πολύ μικρή βαρύτητα"},
"setGravityLow":function(d){return "όρισε μικρή βαρύτητα"},
"setGravityNormal":function(d){return "όρισε κανονική βαρύτητα"},
"setGravityHigh":function(d){return "όρισε μεγάλη βαρύτητα"},
"setGravityVeryHigh":function(d){return "όρισε πολύ μεγάλη βαρύτητα"},
"setGravityTooltip":function(d){return "Ορίζει τη βαρύτητα του επιπέδου"},
"setGround":function(d){return "όρισε το έδαφος"},
"setGroundRandom":function(d){return "όρισε Τυχαίο έδαφος"},
"setGroundFlappy":function(d){return "όρισε το έδαφος Πάτωμα"},
"setGroundSciFi":function(d){return "όρισε το έδαφος Διάστημα"},
"setGroundUnderwater":function(d){return "όρισε το έδαφος Κάτω από το Νερό"},
"setGroundCave":function(d){return "όρισε το έδαφος Σπηλιά"},
"setGroundSanta":function(d){return "όρισε το έδαφος Άη Βασίλης"},
"setGroundLava":function(d){return "όρισε το έδαφος Λάβα"},
"setGroundTooltip":function(d){return "Ορίζει την εικόνα του εδάφους"},
"setObstacle":function(d){return "όρισε εμπόδιο"},
"setObstacleRandom":function(d){return "όρισε Τυχαίο εμπόδιο"},
"setObstacleFlappy":function(d){return "όρισε εμπόδιο Σωλήνας"},
"setObstacleSciFi":function(d){return "όρισε εμπόδιο Διάστημα"},
"setObstacleUnderwater":function(d){return "όρισε εμπόδιο Φυτό"},
"setObstacleCave":function(d){return "όρισε εμπόδιο Σπηλιά"},
"setObstacleSanta":function(d){return "όρισε εμπόδιο Καμινάδα"},
"setObstacleLaser":function(d){return "όρισε εμπόδιο Λέιζερ"},
"setObstacleTooltip":function(d){return "Ορίζει την εικόνα του εμποδίου"},
"setPlayer":function(d){return "όρισε παίκτη"},
"setPlayerRandom":function(d){return "όρισε Τυχαίο παίκτη"},
"setPlayerFlappy":function(d){return "όρισε παίκτη Κίτρινο Πουλί"},
"setPlayerRedBird":function(d){return "όρισε παίκτη Κόκκινο Πουλί"},
"setPlayerSciFi":function(d){return "όρισε παίκτη Διαστημόπλοιο"},
"setPlayerUnderwater":function(d){return "όρισε παίκτη Ψάρι"},
"setPlayerCave":function(d){return "όρισε παίκτη Νυχτερίδα"},
"setPlayerSanta":function(d){return "όρισε παίκτη Άη Βασίλης"},
"setPlayerShark":function(d){return "όρισε παίκτη Καρχαρία"},
"setPlayerEaster":function(d){return "όρισε παίκτη Λαγουδάκι"},
"setPlayerBatman":function(d){return "όρισε παίκτη Ροπαλοφόρος"},
"setPlayerSubmarine":function(d){return "όρισε παίκτη Υποβρύχιο"},
"setPlayerUnicorn":function(d){return "όρισε παίκτη Μονόκερως"},
"setPlayerFairy":function(d){return "όρισε παίκτη Νεράιδα"},
"setPlayerSuperman":function(d){return "όρισε παίκτη Φτερούγης"},
"setPlayerTurkey":function(d){return "όρισε παίκτη Γαλοπούλα"},
"setPlayerTooltip":function(d){return "Ορίζει την εικόνα του παίκτη"},
"setScore":function(d){return "όρισε σκορ"},
"setScoreTooltip":function(d){return "Ορίζει το σκορ του παίκτη"},
"setSpeed":function(d){return "όρισε ταχύτητα"},
"setSpeedTooltip":function(d){return "Ορίζει την ταχύτητα του επιπέδου"},
"shareFlappyTwitter":function(d){return "Κοίτα το παιχνίδι Flappy που έφτιαξα. Το έγραψα μόνος μου με το @codeorg"},
"shareGame":function(d){return "Μοιράσου το παιχνίδι σου:"},
"soundRandom":function(d){return "τυχαίο"},
"soundBounce":function(d){return "αναπήδησε"},
"soundCrunch":function(d){return "τρίξιμο"},
"soundDie":function(d){return "λυπητερό"},
"soundHit":function(d){return "θρυμματισμός"},
"soundPoint":function(d){return "σκοράρισμα"},
"soundSwoosh":function(d){return "στροβιλισμός"},
"soundWing":function(d){return "φτερούγισμα"},
"soundJet":function(d){return "τζετ"},
"soundCrash":function(d){return "συντριβή"},
"soundJingle":function(d){return "κουδούνισμα"},
"soundSplash":function(d){return "πλατσούρισμα"},
"soundLaser":function(d){return "λέιζερ"},
"speedRandom":function(d){return "όρισε τυχαία ταχύτητα"},
"speedVerySlow":function(d){return "όρισε πολύ μικρή ταχύτητα"},
"speedSlow":function(d){return "όρισε μικρή ταχύτητα"},
"speedNormal":function(d){return "όρισε κανονική ταχύτητα"},
"speedFast":function(d){return "όρισε μεγάλη ταχύτητα"},
"speedVeryFast":function(d){return "όρισε πολύ μεγάλη ταχύτητα"},
"whenClick":function(d){return "με το κλικ"},
"whenClickTooltip":function(d){return "Εκτέλεσε τις παρακάτω ενέργειες όταν πατηθεί το κλικ."},
"whenCollideGround":function(d){return "όταν χτυπήσει στο έδαφος"},
"whenCollideGroundTooltip":function(d){return "Εκτέλεσε τις παρακάτω ενέργειες όταν ο Flappy χτυπήσει στο έδαφος."},
"whenCollideObstacle":function(d){return "όταν χτυπήσει εμπόδιο"},
"whenCollideObstacleTooltip":function(d){return "Εκτέλεσε τις παρακάτω ενέργειες όταν ο Flappy xτυπήσει ένα εμπόδιο."},
"whenEnterObstacle":function(d){return "όταν περάσει εμπόδιο"},
"whenEnterObstacleTooltip":function(d){return "Εκτέλεσε τις παρακάτω ενέργειες όταν ο Flappy ακουμπήσει ένα εμπόδιο."},
"whenRunButtonClick":function(d){return "όταν το παιχνίδι αρχίζει"},
"whenRunButtonClickTooltip":function(d){return "Εκτέλεσε τις παρακάτω ενέργειες όταν το παιχνίδι αρχίζει."},
"yes":function(d){return "Ναι"}};