var appLocale = {lc:{"ar":function(n){
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
v:function(d,k){appLocale.c(d,k);return d[k]},
p:function(d,k,o,l,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:(k=appLocale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).appLocale = {
"actor":function(d){return "ηθοποιός"},
"alienInvasion":function(d){return "Εισβολή εξωγήινων!"},
"backgroundBlack":function(d){return "μαύρο"},
"backgroundCave":function(d){return "σπηλιά"},
"backgroundCloudy":function(d){return "συννεφιασμένος"},
"backgroundHardcourt":function(d){return "σκληρό γήπεδο"},
"backgroundNight":function(d){return "νύχτα"},
"backgroundUnderwater":function(d){return "υποβρύχια"},
"backgroundCity":function(d){return "πόλη"},
"backgroundDesert":function(d){return "έρημος"},
"backgroundRainbow":function(d){return "ουράνιο τόξο"},
"backgroundSoccer":function(d){return "ποδόσφαιρο"},
"backgroundSpace":function(d){return "διάστημα"},
"backgroundTennis":function(d){return "τένις"},
"backgroundWinter":function(d){return "χειμώνας"},
"catActions":function(d){return "Ενέργειες"},
"catControl":function(d){return "Βρόχοι"},
"catEvents":function(d){return "Συμβάντα"},
"catLogic":function(d){return "Λογική"},
"catMath":function(d){return "Μαθηματικά"},
"catProcedures":function(d){return "Συναρτήσεις"},
"catText":function(d){return "κείμενο"},
"catVariables":function(d){return "Μεταβλητές"},
"changeScoreTooltip":function(d){return "Πρόσθεσε ή αφαίρεσε έναν πόντο στη βαθμολογία."},
"changeScoreTooltipK1":function(d){return "Πρόσθεσε έναν πόντο στη βαθμολογία."},
"continue":function(d){return "Συνέχεια"},
"decrementPlayerScore":function(d){return "αφαίρεσε πόντο"},
"defaultSayText":function(d){return "γράψε εδώ"},
"emotion":function(d){return "διάθεση"},
"finalLevel":function(d){return "Συγχαρητήρια! Έλυσες το τελευταίο Παζλ."},
"for":function(d){return "για"},
"hello":function(d){return "γεια σου"},
"helloWorld":function(d){return "Γεια σου Κόσμε!"},
"incrementPlayerScore":function(d){return "σκόραρε πόντο"},
"makeProjectileDisappear":function(d){return "εξαφάνισε"},
"makeProjectileBounce":function(d){return "αναπήδηση"},
"makeProjectileBlueFireball":function(d){return "φτιάξε μπλε μπάλα φωτιάς"},
"makeProjectilePurpleFireball":function(d){return "φτιάξε μοβ μπάλα φωτιάς"},
"makeProjectileRedFireball":function(d){return "φτιάξε κόκκινη μπάλα φωτιάς"},
"makeProjectileYellowHearts":function(d){return "φτιάξε κίτρινες καρδιές"},
"makeProjectilePurpleHearts":function(d){return "φτιάξε μοβ καρδιές"},
"makeProjectileRedHearts":function(d){return "φτιάξε κόκκινες καρδιές"},
"makeProjectileTooltip":function(d){return "Κάνε το βλήμα που μόλις συγκρούστηκε να εξαφανιστεί ή να αναπηδήσει."},
"makeYourOwn":function(d){return "Κάνε τη Δική σου Εφαρμογή Εργαστήριο Παιχνιδιού"},
"moveDirectionDown":function(d){return "κάτω"},
"moveDirectionLeft":function(d){return "αριστερά"},
"moveDirectionRight":function(d){return "δεξιά"},
"moveDirectionUp":function(d){return "επάνω"},
"moveDirectionRandom":function(d){return "τυχαίο"},
"moveDistance25":function(d){return "25 εικονοστοιχεία"},
"moveDistance50":function(d){return "50 εικονοστοιχεία"},
"moveDistance100":function(d){return "100 εικονοστοιχεία"},
"moveDistance200":function(d){return "200 εικονοστοιχεία"},
"moveDistance400":function(d){return "400 εικονοστοιχεία"},
"moveDistancePixels":function(d){return "εικονοστοιχεία"},
"moveDistanceRandom":function(d){return "τυχαία εικονοστοιχεία"},
"moveDistanceTooltip":function(d){return "Προχώρησε έναν ηθοποιό συγκεκριμένη απόσταση προς συγκεκριμένη κατεύθυνση."},
"moveSprite":function(d){return "προχώρησε"},
"moveSpriteN":function(d){return "προχώρησε τον ηθοποιό "+appLocale.v(d,"spriteIndex")},
"toXY":function(d){return "έως x, y"},
"moveDown":function(d){return "προχώρησε προς τα κάτω"},
"moveDownTooltip":function(d){return "Προχώρησε τον ηθοποιό προς τα κάτω."},
"moveLeft":function(d){return "Προχώρησε αριστερά"},
"moveLeftTooltip":function(d){return "Προχώρησε έναν ηθοποιό προς τα αριστερά."},
"moveRight":function(d){return "Προχώρησε δεξιά"},
"moveRightTooltip":function(d){return "Προχώρησε έναν ηθοποιό προς τα αριστερά."},
"moveUp":function(d){return "προχώρησε προς τα επάνω"},
"moveUpTooltip":function(d){return "Μετακίνησε τον ηθοποιό προς τα πάνω."},
"moveTooltip":function(d){return "Μετακίνησε έναν ηθοποιό."},
"nextLevel":function(d){return "Συγχαρητήρια! Έχεις ολοκληρώσει αυτό το παζλ."},
"no":function(d){return "Όχι"},
"numBlocksNeeded":function(d){return "Αυτό το παζλ μπορεί να λυθεί με %1 μπλοκ."},
"onEventTooltip":function(d){return "Εκτέλεση κώδικα σε απάντηση για το συγκεκριμένο συμβάν."},
"ouchExclamation":function(d){return "Ωχ!"},
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
"positionOutTopLeft":function(d){return "στην παραπάνω επάνω αριστερή θέση"},
"positionOutTopRight":function(d){return "στην παραπάνω επάνω δεξιά θέση"},
"positionTopOutLeft":function(d){return "στην επάνω εξωτερική αριστερή θέση"},
"positionTopLeft":function(d){return "στην επάνω αριστερή θέση"},
"positionTopCenter":function(d){return "στην επάνω κεντρική θέση"},
"positionTopRight":function(d){return "στην επάνω δεξιά θέση"},
"positionTopOutRight":function(d){return "στην επάνω εξωτερική δεξιά θέση"},
"positionMiddleLeft":function(d){return "στην μεσαία αριστερή θέση"},
"positionMiddleCenter":function(d){return "στην μεσαία κεντρική θέση"},
"positionMiddleRight":function(d){return "στην μεσαία δεξιά θέση"},
"positionBottomOutLeft":function(d){return "στην κάτω εξωτερική αριστερή θέση"},
"positionBottomLeft":function(d){return "στην κάτω αριστερή θέση"},
"positionBottomCenter":function(d){return "στην κάτω κεντρική θέση"},
"positionBottomRight":function(d){return "στην κάτω δεξιά θέση"},
"positionBottomOutRight":function(d){return "στην κάτω εξωτερική δεξιά θέση"},
"positionOutBottomLeft":function(d){return "στην παρακάτω κάτω αριστερή θέση"},
"positionOutBottomRight":function(d){return "στην παρακάτω κάτω δεξιά θέση"},
"positionRandom":function(d){return "στην τυχαία θέση"},
"projectileBlueFireball":function(d){return "μπλε μπάλα φωτιάς"},
"projectilePurpleFireball":function(d){return "μοβ μπάλα φωτιάς"},
"projectileRedFireball":function(d){return "κόκκινη μπάλα φωτιάς"},
"projectileYellowHearts":function(d){return "κίτρινες καρδιές"},
"projectilePurpleHearts":function(d){return "μοβ καρδιές"},
"projectileRedHearts":function(d){return "κόκκινες καρδιές"},
"projectileRandom":function(d){return "τυχαίο"},
"projectileAnna":function(d){return "άγκιστρο"},
"projectileElsa":function(d){return "Έλσα"},
"projectileHiro":function(d){return "ρομπότ"},
"projectileBaymax":function(d){return "ρουκέτα"},
"projectileRapunzel":function(d){return "κατσαρόλα"},
"projectileCherry":function(d){return "κεράσι"},
"projectileIce":function(d){return "πάγος"},
"projectileDuck":function(d){return "πάπια"},
"reinfFeedbackMsg":function(d){return "Μπορείς να πατήσεις το \"Συνέχισε να Παίζεις\" κουμπί για να πας πίσω και να παίξεις την ιστορία σου."},
"repeatForever":function(d){return "επανάλαβε για πάντα"},
"repeatDo":function(d){return "κάνε"},
"repeatForeverTooltip":function(d){return "Εκτέλεσε τις ενέργειες σε αυτό το σετ επαναλαμβανόμενα όσο εκτελείται η ιστορία."},
"saySprite":function(d){return "πες"},
"saySpriteN":function(d){return "ο ηθοποιός "+appLocale.v(d,"spriteIndex")+" λέει"},
"saySpriteTooltip":function(d){return "Εμφάνισε μια φούσκα ομιλίας με το σχετικό κείμενο από τον καθορισμένο ηθοποιό."},
"saySpriteChoices_0":function(d){return "Γεια σου."},
"saySpriteChoices_1":function(d){return "Γεια σας."},
"saySpriteChoices_2":function(d){return "Πώς είστε;"},
"saySpriteChoices_3":function(d){return "Καλημέρα"},
"saySpriteChoices_4":function(d){return "Καλό απόγευμα"},
"saySpriteChoices_5":function(d){return "Καληνύχτα"},
"saySpriteChoices_6":function(d){return "Καλησπέρα"},
"saySpriteChoices_7":function(d){return "Τι νέο υπάρχει;"},
"saySpriteChoices_8":function(d){return "Τι;"},
"saySpriteChoices_9":function(d){return "Πού;"},
"saySpriteChoices_10":function(d){return "Πότε;"},
"saySpriteChoices_11":function(d){return "Καλό."},
"saySpriteChoices_12":function(d){return "Πολύ ωραία!"},
"saySpriteChoices_13":function(d){return "Εντάξει."},
"saySpriteChoices_14":function(d){return "Όχι άσχημα."},
"saySpriteChoices_15":function(d){return "Καλή τύχη."},
"saySpriteChoices_16":function(d){return "Ναι"},
"saySpriteChoices_17":function(d){return "Όχι"},
"saySpriteChoices_18":function(d){return "Εντάξει"},
"saySpriteChoices_19":function(d){return "Ωραία βολή!"},
"saySpriteChoices_20":function(d){return "Να έχεις μια ωραία μέρα."},
"saySpriteChoices_21":function(d){return "Γεια χαρά."},
"saySpriteChoices_22":function(d){return "Επιστρέφω σε πολύ λίγο."},
"saySpriteChoices_23":function(d){return "Θα σε δω αύριο!"},
"saySpriteChoices_24":function(d){return "Θα σε δω αργότερα!"},
"saySpriteChoices_25":function(d){return "Να προσέχεις!"},
"saySpriteChoices_26":function(d){return "απόλαυσε το!"},
"saySpriteChoices_27":function(d){return "Πρέπει να φύγω."},
"saySpriteChoices_28":function(d){return "Θέλεις να γίνουμε φίλοι;"},
"saySpriteChoices_29":function(d){return "Τα κατάφερες πολύ καλά!"},
"saySpriteChoices_30":function(d){return "Woo hoo!"},
"saySpriteChoices_31":function(d){return "Yay!"},
"saySpriteChoices_32":function(d){return "Χάρηκα που σε γνώρισα."},
"saySpriteChoices_33":function(d){return "Εντάξει!"},
"saySpriteChoices_34":function(d){return "Ευχαριστούμε"},
"saySpriteChoices_35":function(d){return "Οχι, ευχαριστώ"},
"saySpriteChoices_36":function(d){return "Aaaaaah!"},
"saySpriteChoices_37":function(d){return "Δεν πειράζει"},
"saySpriteChoices_38":function(d){return "Σήμερα"},
"saySpriteChoices_39":function(d){return "Αύριο"},
"saySpriteChoices_40":function(d){return "Χθες"},
"saySpriteChoices_41":function(d){return "Σε βρήκα!"},
"saySpriteChoices_42":function(d){return "Με βρήκες!"},
"saySpriteChoices_43":function(d){return "10, 9, 8, 7, 6, 5, 4, 3, 2, 1!"},
"saySpriteChoices_44":function(d){return "Είσαι σπουδαίος!"},
"saySpriteChoices_45":function(d){return "Είσαι αστείος!"},
"saySpriteChoices_46":function(d){return "Είσαι ανόητος! "},
"saySpriteChoices_47":function(d){return "Είσαι ένας καλός φίλος!"},
"saySpriteChoices_48":function(d){return "Πρόσεξε!"},
"saySpriteChoices_49":function(d){return "Πάπια!"},
"saySpriteChoices_50":function(d){return "Gotcha!"},
"saySpriteChoices_51":function(d){return "Οου!"},
"saySpriteChoices_52":function(d){return "Συγνώμη!"},
"saySpriteChoices_53":function(d){return "Προσοχή!"},
"saySpriteChoices_54":function(d){return "Στάσου!"},
"saySpriteChoices_55":function(d){return "Ουπς!"},
"saySpriteChoices_56":function(d){return "Σχεδόν μ' έφτασες!"},
"saySpriteChoices_57":function(d){return "Καλή προσπάθεια!"},
"saySpriteChoices_58":function(d){return "Δεν μπορείς να με πιάσεις!"},
"scoreText":function(d){return "Βαθμολογία: "+appLocale.v(d,"playerScore")},
"setBackground":function(d){return "όρισε το φόντο"},
"setBackgroundRandom":function(d){return "όρισε τυχαίο φόντο"},
"setBackgroundBlack":function(d){return "όρισε μαύρο φόντο"},
"setBackgroundCave":function(d){return "όρισε φόντο σπηλιάς"},
"setBackgroundCloudy":function(d){return "όρισε συννεφιασμένο φόντο"},
"setBackgroundHardcourt":function(d){return "όρισε φόντο γηπέδου"},
"setBackgroundNight":function(d){return "όρισε φόντο νύχτας"},
"setBackgroundUnderwater":function(d){return "όρισε φόντο κάτω από το νερό"},
"setBackgroundCity":function(d){return "όρισε φόντο πόλης"},
"setBackgroundDesert":function(d){return "όρισε φόντο ερήμου"},
"setBackgroundRainbow":function(d){return "όρισε φόντο ουράνιου τόξου"},
"setBackgroundSoccer":function(d){return "όρισε φόντο ποδοσφαίρου"},
"setBackgroundSpace":function(d){return "όρισε φόντο διαστήματος"},
"setBackgroundTennis":function(d){return "όρισε φόντο τένις"},
"setBackgroundWinter":function(d){return "όρισε φόντο χειμώνα"},
"setBackgroundLeafy":function(d){return "ορισμός φόντου με φύλλα"},
"setBackgroundGrassy":function(d){return "ορισμός φόντου με χορτάρι"},
"setBackgroundFlower":function(d){return "ορισμός φόντου με λουλούδια"},
"setBackgroundTile":function(d){return "ορισμός φόντου με πλακίδια"},
"setBackgroundIcy":function(d){return "ορισμός φόντου με πάγο"},
"setBackgroundSnowy":function(d){return "ορισμός φόντου με χιόνι"},
"setBackgroundTooltip":function(d){return "Ορίζει την εικόνα στο φόντο"},
"setEnemySpeed":function(d){return "καθόρισε ταχύτητα του εχθρού"},
"setPlayerSpeed":function(d){return "καθόρισε ταχύτητα παίκτη"},
"setScoreText":function(d){return "όρισε σκορ"},
"setScoreTextTooltip":function(d){return "Ορίζει το κείμενο που θα εμφανίζεται στην περιοχή της βαθμολογίας."},
"setSpriteEmotionAngry":function(d){return "σε οργισμένη διάθεση"},
"setSpriteEmotionHappy":function(d){return "σε χαρούμενη διάθεση"},
"setSpriteEmotionNormal":function(d){return "σε κανονική διάθεση"},
"setSpriteEmotionRandom":function(d){return "σε τυχαία διάθεση"},
"setSpriteEmotionSad":function(d){return "σε λυπημένη διάθεση"},
"setSpriteEmotionTooltip":function(d){return "Ορίζει τη διάθεση του ηθοποιού"},
"setSpriteAlien":function(d){return "σε εικόνα εξωγήινου"},
"setSpriteBat":function(d){return "σε εικόνα νυχτερίδας"},
"setSpriteBird":function(d){return "σε εικόνα πουλιού"},
"setSpriteCat":function(d){return "σε εικόνα γάτας"},
"setSpriteCaveBoy":function(d){return "σε εικόνα παιδιού σπηλαίων"},
"setSpriteCaveGirl":function(d){return "σε εικόνα κοριτσιού σπηλαίων"},
"setSpriteDinosaur":function(d){return "σε εικόνα δεινοσαύρου"},
"setSpriteDog":function(d){return "σε εικόνα σκυλιού"},
"setSpriteDragon":function(d){return "σε εικόνα δράκου"},
"setSpriteGhost":function(d){return "σε εικόνα φαντάσματος"},
"setSpriteHidden":function(d){return "σε κρυμμένη εικόνα"},
"setSpriteHideK1":function(d){return "κρύψε"},
"setSpriteAnna":function(d){return "προς μια εικόνα της Άννας"},
"setSpriteElsa":function(d){return "προς μια εικόνα της Έλσας"},
"setSpriteHiro":function(d){return "προς μια εικόνα του Hiro"},
"setSpriteBaymax":function(d){return "προς μια εικόνα του Baymax"},
"setSpriteRapunzel":function(d){return "προς μια εικόνα του Ραπουνζέλ"},
"setSpriteKnight":function(d){return "σε εικόνα ιππότη"},
"setSpriteMonster":function(d){return "σε εικόνα τέρατος"},
"setSpriteNinja":function(d){return "σε εικόνα μασκοφόρου νίντζα"},
"setSpriteOctopus":function(d){return "σε εικόνα χταποδιού"},
"setSpritePenguin":function(d){return "σε εικόνα πιγκουίνου"},
"setSpritePirate":function(d){return "σε εικόνα πειρατή"},
"setSpritePrincess":function(d){return "σε εικόνα πριγκίπισσας"},
"setSpriteRandom":function(d){return "σε τυχαία εικόνα"},
"setSpriteRobot":function(d){return "σε εικόνα ρομπότ"},
"setSpriteShowK1":function(d){return "δείξε"},
"setSpriteSpacebot":function(d){return "σε εικόνα διαστημόπλοιου"},
"setSpriteSoccerGirl":function(d){return "σε εικόνα ποδοσφαιρίστριας"},
"setSpriteSoccerBoy":function(d){return "σε εικόνα ποδοσφαιριστή"},
"setSpriteSquirrel":function(d){return "σε εικόνα σκίουρου"},
"setSpriteTennisGirl":function(d){return "σε εικόνα τενίστριας"},
"setSpriteTennisBoy":function(d){return "σε εικόνα τενίστα"},
"setSpriteUnicorn":function(d){return "σε εικόνα μονόκερου"},
"setSpriteWitch":function(d){return "σε εικόνα μάγισσας"},
"setSpriteWizard":function(d){return "σε εικόνα μάγου"},
"setSpritePositionTooltip":function(d){return "Μεταφέρει άμεσα έναν ηθοποιό στην καθορισμένη θέση."},
"setSpriteK1Tooltip":function(d){return "Εμφανίζει ή κρύβει έναν καθορισμένο ηθοποιό."},
"setSpriteTooltip":function(d){return "Ορίζει την εικόνα του ηθοποιού"},
"setSpriteSizeRandom":function(d){return "σε τυχαίο μέγεθος"},
"setSpriteSizeVerySmall":function(d){return "σε πολύ μικρό μέγεθος"},
"setSpriteSizeSmall":function(d){return "σε μικρό μέγεθος"},
"setSpriteSizeNormal":function(d){return "σε κανονικό μέγεθος"},
"setSpriteSizeLarge":function(d){return "σε μεγάλο μέγεθος"},
"setSpriteSizeVeryLarge":function(d){return "σε πολύ μεγάλο μέγεθος"},
"setSpriteSizeTooltip":function(d){return "Ορίζει το μέγεθος ενός ηθοποιού"},
"setSpriteSpeedRandom":function(d){return "σε τυχαία ταχύτητα"},
"setSpriteSpeedVerySlow":function(d){return "σε πολύ αργή ταχύτητα"},
"setSpriteSpeedSlow":function(d){return "σε αργή ταχύτητα"},
"setSpriteSpeedNormal":function(d){return "σε κανονική ταχύτητα"},
"setSpriteSpeedFast":function(d){return "σε γρήγορη ταχύτητα"},
"setSpriteSpeedVeryFast":function(d){return "σε πολύ γρήγορη ταχύτητα"},
"setSpriteSpeedTooltip":function(d){return "Ορίζει την ταχύτητα του ηθοποιού"},
"setSpriteZombie":function(d){return "σε εικόνα ζόμπι"},
"shareStudioTwitter":function(d){return "Κοίτα την ιστορία που έφτιαξα. Την έγραψα μόνος μου με το @codeorg"},
"shareGame":function(d){return "Μοιράσου την ιστορία σου:"},
"showCoordinates":function(d){return "δες συντεταγμένες"},
"showCoordinatesTooltip":function(d){return "δες τις συντεταγμένες του πρωταγωνιστή στην οθόνη"},
"showTitleScreen":function(d){return "εμφάνιση οθόνης τίτλων"},
"showTitleScreenTitle":function(d){return "τίτλος"},
"showTitleScreenText":function(d){return "κείμενο"},
"showTSDefTitle":function(d){return "γράψε τίτλο εδώ"},
"showTSDefText":function(d){return "γράψε κείμενο εδώ"},
"showTitleScreenTooltip":function(d){return "Εμφάνισε την οθόνη τίτλων με το σχετικό τίτλο και κείμενο."},
"size":function(d){return "μέγεθος"},
"setSprite":function(d){return "Γρίφος"},
"setSpriteN":function(d){return "όρισε ηθοποιό "+appLocale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "τρίξιμο"},
"soundGoal1":function(d){return "γκολ 1"},
"soundGoal2":function(d){return "γκολ 2"},
"soundHit":function(d){return "χτύπα"},
"soundLosePoint":function(d){return "χάσε πόντο"},
"soundLosePoint2":function(d){return "χάσε πόντο 2"},
"soundRetro":function(d){return "ρετρό"},
"soundRubber":function(d){return "καουτσούκ"},
"soundSlap":function(d){return "χαστούκι"},
"soundWinPoint":function(d){return "κέρδισε πόντο"},
"soundWinPoint2":function(d){return "κέρδισε πόντο 2"},
"soundWood":function(d){return "ξύλο"},
"speed":function(d){return "ταχύτητα"},
"startSetValue":function(d){return "start (rocket-height function)"},
"startSetVars":function(d){return "game_vars (title, subtitle, background, target, danger, player)"},
"startSetFuncs":function(d){return "game_funcs (update-target, update-danger, update-player, collide?, on-screen?)"},
"stopSprite":function(d){return "στοπ"},
"stopSpriteN":function(d){return "σταμάτησε τον ηθοποιό "+appLocale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Σταματά την κίνηση του ηθοποιού."},
"throwSprite":function(d){return "ρίξε"},
"throwSpriteN":function(d){return "ο ηθοποιός "+appLocale.v(d,"spriteIndex")+" να ρίξει"},
"throwTooltip":function(d){return "Ρίχνει ένα βλήμα από τον καθορισμένο ηθοποιό."},
"vanish":function(d){return "εξαφάνισε"},
"vanishActorN":function(d){return "εξαφάνισε τον ηθοποιό "+appLocale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "Εξαφανίζει έναν ηθοποιό."},
"waitFor":function(d){return "περίμενε για"},
"waitSeconds":function(d){return "δευτερόλεπτα"},
"waitForClick":function(d){return "περίμενε για κλικ"},
"waitForRandom":function(d){return "περίμενε για τυχαίο"},
"waitForHalfSecond":function(d){return "περίμενε για μισό δευτερόλεπτο"},
"waitFor1Second":function(d){return "περίμενε για 1 δευτερόλεπτο"},
"waitFor2Seconds":function(d){return "περίμενε για 2 δευτερόλεπτα"},
"waitFor5Seconds":function(d){return "περίμενε για 5 δευτερόλεπτα"},
"waitFor10Seconds":function(d){return "περίμενε για 10 δευτερόλεπτα"},
"waitParamsTooltip":function(d){return "Περιμένει για καθορισμένο αριθμό δευτερολέπτων ή χρησιμοποίησε μηδέν για να περιμένει μέχρι να γίνει κλικ."},
"waitTooltip":function(d){return "Περιμένει για ένα καθορισμένο χρονικό διάστημα ή μέχρι να συμβεί ένα κλικ."},
"whenArrowDown":function(d){return "κάτω βέλος"},
"whenArrowLeft":function(d){return "αριστερό βέλος"},
"whenArrowRight":function(d){return "δεξί βέλος"},
"whenArrowUp":function(d){return "επάνω βέλος"},
"whenArrowTooltip":function(d){return "Εκτελεί τις παρακάτω ενέργειες όταν το καθορισμένο βέλος πατηθεί."},
"whenDown":function(d){return "όταν πατηθεί το κάτω βέλος"},
"whenDownTooltip":function(d){return "Εκτέλεσε τις παρακάτω ενέργειες όταν πατηθεί το πλήκτρο κάτω βέλος."},
"whenGameStarts":function(d){return "όταν ξεκινά η ιστορία"},
"whenGameStartsTooltip":function(d){return "Εκτέλεσε τις παρακάτω ενέργειες όταν ξεκινά η ιστορία."},
"whenLeft":function(d){return "όταν πατηθεί το αριστερό βέλος"},
"whenLeftTooltip":function(d){return "Εκτέλεσε τις παρακάτω ενέργειες όταν πατηθεί το πλήκτρο αριστερό βέλος."},
"whenRight":function(d){return "όταν πατηθεί το δεξί βέλος"},
"whenRightTooltip":function(d){return "Εκτέλεσε τις παρακάτω ενέργειες όταν πατηθεί το πλήκτρο δεξί βέλος."},
"whenSpriteClicked":function(d){return "όταν γίνει κλικ στον ηθοποιό"},
"whenSpriteClickedN":function(d){return "όταν γίνει κλικ στον ηθοποιό "+appLocale.v(d,"spriteIndex")},
"whenSpriteClickedTooltip":function(d){return "Εκτέλεσε τις παρακάτω ενέργειες όταν γίνει κλικ στον ηθοποιό."},
"whenSpriteCollidedN":function(d){return "όταν ο ηθοποιός "+appLocale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "Εκτέλεσε τις παρακάτω ενέργειες όταν ένας ηθοποιός ακουμπήσει έναν άλλον ηθοποιό."},
"whenSpriteCollidedWith":function(d){return "ακουμπά"},
"whenSpriteCollidedWithAnyActor":function(d){return "ακουμπά οποιονδήποτε ηθοποιό"},
"whenSpriteCollidedWithAnyEdge":function(d){return "ακουμπά οποιαδήποτε άκρη"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "ακουμπά οποιοδήποτε βλήμα"},
"whenSpriteCollidedWithAnything":function(d){return "ακουμπά οτιδήποτε"},
"whenSpriteCollidedWithN":function(d){return "ακουμπά τον ηθοποιό "+appLocale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "ακουμπά τη μπλε μπάλα φωτιάς"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "ακουμπά τη μοβ μπάλα φωτιάς"},
"whenSpriteCollidedWithRedFireball":function(d){return "ακουμπά την κόκκινη μπάλα φωτιάς"},
"whenSpriteCollidedWithYellowHearts":function(d){return "ακουμπά την κίτρινη μπάλα φωτιάς"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "ακουμπά τις μοβ καρδιές"},
"whenSpriteCollidedWithRedHearts":function(d){return "ακουμπά τις κόκκινες καρδιές"},
"whenSpriteCollidedWithBottomEdge":function(d){return "ακουμπά την κάτω άκρη"},
"whenSpriteCollidedWithLeftEdge":function(d){return "ακουμπά την αριστερή άκρη"},
"whenSpriteCollidedWithRightEdge":function(d){return "ακουμπά τη δεξιά άκρη"},
"whenSpriteCollidedWithTopEdge":function(d){return "ακουμπά την επάνω άκρη"},
"whenUp":function(d){return "όταν πατηθεί το επάνω βέλος"},
"whenUpTooltip":function(d){return "Εκτέλεσε τις παρακάτω ενέργειες όταν πατηθεί το πλήκτρο πάνω βέλος."},
"yes":function(d){return "Ναι"}};