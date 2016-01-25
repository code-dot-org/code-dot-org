var craft_locale = {lc:{"ar":function(n){
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
v:function(d,k){craft_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){craft_locale.c(d,k);return d[k] in p?p[d[k]]:(k=craft_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){craft_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).craft_locale = {
"blockDestroyBlock":function(d){return "κατάστρεψε μπλοκ"},
"blockIf":function(d){return "εάν"},
"blockIfLavaAhead":function(d){return "αν λάβα μπροστά"},
"blockMoveForward":function(d){return "προχώρησε μπροστά"},
"blockPlaceTorch":function(d){return "βάλε δαυλό"},
"blockPlaceXAheadAhead":function(d){return "μπροστά"},
"blockPlaceXAheadPlace":function(d){return "βάλε"},
"blockPlaceXPlace":function(d){return "βάλε"},
"blockPlantCrop":function(d){return "βάλε καλλιέργεια"},
"blockShear":function(d){return "κούρεψε"},
"blockTillSoil":function(d){return "μέχρι το έδαφος"},
"blockTurnLeft":function(d){return "στρίψε αριστερά"},
"blockTurnRight":function(d){return "στρίψε δεξιά"},
"blockTypeBedrock":function(d){return "υπόβαθρο"},
"blockTypeBricks":function(d){return "τούβλα"},
"blockTypeClay":function(d){return "πηλός"},
"blockTypeClayHardened":function(d){return "σκληρός πηλός"},
"blockTypeCobblestone":function(d){return "πλακόστρωτο"},
"blockTypeDirt":function(d){return "χώμα"},
"blockTypeDirtCoarse":function(d){return "χονδρό χώμα"},
"blockTypeEmpty":function(d){return "κενό"},
"blockTypeFarmlandWet":function(d){return "χωράφι"},
"blockTypeGlass":function(d){return "γυαλί"},
"blockTypeGrass":function(d){return "γρασίδι"},
"blockTypeGravel":function(d){return "χαλίκι"},
"blockTypeLava":function(d){return "λάβα"},
"blockTypeLogAcacia":function(d){return "ξύλο ακακίας"},
"blockTypeLogBirch":function(d){return "ξύλο σημύδας"},
"blockTypeLogJungle":function(d){return "ξύλο ζούγκλας"},
"blockTypeLogOak":function(d){return "ξύλο δρυ"},
"blockTypeLogSpruce":function(d){return "ξύλο έλατου"},
"blockTypeOreCoal":function(d){return "μετάλλευμα άνθρακα"},
"blockTypeOreDiamond":function(d){return "μετάλλευμα διαμαντιού"},
"blockTypeOreEmerald":function(d){return "μετάλλευμα σμαραγδιού"},
"blockTypeOreGold":function(d){return "μετάλλευμα χρυσού"},
"blockTypeOreIron":function(d){return "μετάλλευμα σιδήρου"},
"blockTypeOreLapis":function(d){return "μετάλλευμα λάπις"},
"blockTypeOreRedstone":function(d){return "μετάλλευμα κοκκινόπετρας"},
"blockTypePlanksAcacia":function(d){return "σανίδες ακακίας"},
"blockTypePlanksBirch":function(d){return "σανίδες σημύδας"},
"blockTypePlanksJungle":function(d){return "σανίδες ζούγκλας"},
"blockTypePlanksOak":function(d){return "σανίδες δρυ"},
"blockTypePlanksSpruce":function(d){return "σανίδες έλατου"},
"blockTypeRail":function(d){return "σιδηροδρομική γραμμή"},
"blockTypeSand":function(d){return "άμμος"},
"blockTypeSandstone":function(d){return "αμμόλιθος"},
"blockTypeStone":function(d){return "πέτρα"},
"blockTypeTnt":function(d){return "εκρηκτικά"},
"blockTypeTree":function(d){return "δέντρο"},
"blockTypeWater":function(d){return "νερό"},
"blockTypeWool":function(d){return "μαλλί"},
"blockWhileXAheadAhead":function(d){return "μπροστά"},
"blockWhileXAheadDo":function(d){return "κάνε"},
"blockWhileXAheadWhile":function(d){return "όσο"},
"generatedCodeDescription":function(d){return "Σύροντας και τοποθετώντας μπλοκς σε αυτό το παζλ, έχετε δημιουργήσει ένα σύνολο εντολών σε μια γλώσσα προγραμματισμού στον Η/Υ που ονομάζεται Javascript. Αυτός ο κώδικας λέει στους υπολογιστές τι να εμφανίσουν στην οθόνη. Ό, τι βλέπετε και κάνετε στο Minecraft αρχίζει επίσης, με γραμμές κώδικα υπολογιστών όπως αυτές."},
"houseSelectChooseFloorPlan":function(d){return "Διάλεξε το σχέδιο για το σπίτι σου."},
"houseSelectEasy":function(d){return "Εύκολο"},
"houseSelectHard":function(d){return "Δύσκολο"},
"houseSelectLetsBuild":function(d){return "Ας φτιάξουμε ένα σπίτι."},
"houseSelectMedium":function(d){return "Μεσαίο"},
"keepPlayingButton":function(d){return "Συνέχισε να Παίζεις"},
"level10FailureMessage":function(d){return "Κάλυψε τη λάβα για να προχωρήσεις και μετά εξόρυξε δύο μπλοκ σιδήρου από την άλλη πλευρά."},
"level11FailureMessage":function(d){return "Βεβαιώσου ότι έβαλες πλακόστρωτο μπροστά αν υπάρχει λάβα. Αυτό θα σου επιτρέψει να εξορύξεις με ασφάλεια αυτή τη σειρά πόρων."},
"level12FailureMessage":function(d){return "Βεβαιώσου ότι εξόρυξες 3 μπλοκ κοκκινόπετρας. Αυτό συνδυάζει ό,τι έμαθες από το κτίσιμο του σπιτιού σου και τη χρήση των εντολών \"αν\" για να αποφύγεις να πέσεις στη λάβα."},
"level13FailureMessage":function(d){return "Βάλε σιδηροδρομική γραμμή κατά μήκος του χωματόδρομου που οδηγεί από την πόρτα σου στην άκρη του χάρτη."},
"level1FailureMessage":function(d){return "Πρέπει να χρησιμοποιήσεις εντολές για να περπατήσεις προς το πρόβατο."},
"level1TooFewBlocksMessage":function(d){return "Δοκίμασε να χρησιμοποιήσεις περισσότερες εντολές για να περπατήσεις προς το πρόβατο."},
"level2FailureMessage":function(d){return "Για να κόψεις ένα δέντρο, φτάσε τον κορμό του και χρησιμοποίησε την εντολή \"κατάστρεψε μπλοκ\"."},
"level2TooFewBlocksMessage":function(d){return "Δοκίμασε να χρησιμοποιήσεις περισσότερες εντολές για να κόψεις ένα δέντρο. Φτάσε τον κορμό του και χρησιμοποίησε την εντολή \"κατάστρεψε μπλοκ\"."},
"level3FailureMessage":function(d){return "Για να μαζέψεις μαλλί από τα πρόβατα, φτάσε το καθένα και χρησιμοποίησε την εντολή \"κούρεψε\". Θυμήσου να χρησιμοποιείς εντολές \"στρίψε\" για να φτάσεις τα πρόβατα."},
"level3TooFewBlocksMessage":function(d){return "Χρησιμοποίησε περισσότερες εντολές για να μαζέψεις μαλλί από τα πρόβατα. Φτάσε το καθένα και χρησιμοποίησε την εντολή \"κούρεψε\"."},
"level4FailureMessage":function(d){return "Πρέπει να χρησιμοποιήσεις την εντολή \"κατάστρεψε μπλοκ\" σε καθέναν από τους τρεις κορμούς δέντρων."},
"level5FailureMessage":function(d){return "Βάλε τα μπλοκ σου στο χωματόδρομο για να φτιάξεις ένα τοίχος. Η ροζ εντολή \"επανάληψη\" θα τρέξει τις εντολές μέσα της, όπως το \"βάλε μπλοκ\" και το \"πάμε μπροστά\"."},
"level6FailureMessage":function(d){return "Βάλε μπλοκ στο χωματόδρομο του σπιτιού για να ολοκληρώσεις αυτό το παζλ."},
"level7FailureMessage":function(d){return "Χρησιμοποίησε την εντολή \"φύτεψε\" για να βάλεις καλλιέργειες σε κάθε χωράφι σκουρόχρωμου χώματος."},
"level8FailureMessage":function(d){return "Αν ακουμπήσεις ένα αναρριχητικό φυτό, θα εκραγεί. Πήγαινε κρυφά τριγύρω τους και μπες στο σπίτι σου."},
"level9FailureMessage":function(d){return "Μην ξεχάσεις να βάλεις τουλάχιστον δύο δαυλούς για να φωτίσεις το μονοπάτι σου ΚΑΙ να εξορύξεις τουλάχιστον δύο άνθρακες."},
"minecraftBlock":function(d){return "μπλοκ"},
"nextLevelMsg":function(d){return "Το Παζλ "+craft_locale.v(d,"puzzleNumber")+" ολοκληρώθηκε. Συγχαρητήρια!"},
"playerSelectChooseCharacter":function(d){return "Διάλεξε τον χαρακτήρα σου."},
"playerSelectChooseSelectButton":function(d){return "Επιλογή"},
"playerSelectLetsGetStarted":function(d){return "Ας αρχίσουμε."},
"reinfFeedbackMsg":function(d){return "Μπορείς να πατήσεις \"Συνέχισε το παιχνίδι\" για να επιστρέψεις στο παιχνίδι σου."},
"replayButton":function(d){return "Επανάληψη"},
"selectChooseButton":function(d){return "Επιλογή"},
"tooManyBlocksFail":function(d){return "Το Παζλ "+craft_locale.v(d,"puzzleNumber")+" ολοκληρώθηκε. Συγχαρητήρια! Είναι επίσης δυνατό να ολοκληρωθεί με "+craft_locale.p(d,"numBlocks",0,"el",{"one":"1 block","other":craft_locale.n(d,"numBlocks")+" blocks"})+"."}};