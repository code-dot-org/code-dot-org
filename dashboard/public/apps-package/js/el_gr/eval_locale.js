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
"badColorStringError":function(d){return "Χρησιμοποιήσατε ένα μη-έγκυρο χρώμα συμβολοσειράς: "+appLocale.v(d,"val")},
"badStyleStringError":function(d){return "Χρησιμοποιήσατε ένα μη-έγκυρο στυλ συμβολοσειράς: "+appLocale.v(d,"val")},
"circleBlockTitle":function(d){return "κύκλος (ακτίνα, στυλ, χρώμα)"},
"displayBlockTitle":function(d){return "υπολογισμός"},
"ellipseBlockTitle":function(d){return "έλλειψη (πλάτος, ύψος, στυλ, χρώμα)"},
"extraTopBlocks":function(d){return "Έχετε ασύνδετα μποκ. Μήπως ενοούσατε να τα επισυνάψετε στο μπλοκ \"αξιολόγηση\";"},
"infiniteRecursionError":function(d){return "Η συνάρτησή σας καλεί τον εαυτό της. Την έχουμε σταματήσει, αλλιώς θα εξακολούθησε να καλεί τον εαυτό της για πάντα."},
"overlayBlockTitle":function(d){return "επικάλυμμα (επάνω, κάτω)"},
"placeImageBlockTitle":function(d){return "τοποθέτησε-εικόνα (χ, ψ, εικόνα)"},
"offsetBlockTitle":function(d){return "μετατόπιση (x, y, εικόνα)"},
"rectangleBlockTitle":function(d){return "ορθογώνιο (πλάτος, ύψος, στυλ, χρώμα)"},
"reinfFeedbackMsg":function(d){return "Μπορείτε να πατήσετε το κουμπί \"Προσπαθείστε ξανά\" για να επεξεργαστείτε τη ζωγραφιά σας."},
"rotateImageBlockTitle":function(d){return "περιστροφή (μοίρες, εικόνα)"},
"scaleImageBlockTitle":function(d){return "κλίμακα (παράγοντας, εικόνα)"},
"squareBlockTitle":function(d){return "τετράγωνο (μέγεθος, στυλ, χρώμα)"},
"starBlockTitle":function(d){return "αστέρι (ακτίνα, στυλ, χρώμα)"},
"radialStarBlockTitle":function(d){return "Ακτινωτό-αστέρι (σημεία, εσωτερική ακτίνα, εξωτερική ακτίνα, στυλ, χρώμα)"},
"polygonBlockTitle":function(d){return "πολύγωνο (πλευρές, μήκος, στυλ, χρώμα)"},
"stringAppendBlockTitle":function(d){return "συμβολοσειρά-πρoσάρτησε (πρώτη, δεύτερη)"},
"stringLengthBlockTitle":function(d){return "μήκος συμβολοσειράς (συμβολοσειρά)"},
"textBlockTitle":function(d){return "κείμενο (συμβολοσειρά, μέγεθος, χρώμα)"},
"triangleBlockTitle":function(d){return "τρίγωνο (μέγεθος, στυλ, χρώμα)"},
"underlayBlockTitle":function(d){return "υπόστρωμα (κάτω, κορυφή)"},
"outline":function(d){return "περίγραμμα"},
"solid":function(d){return "συμπαγής"},
"string":function(d){return "συμβολοσειρά"},
"stringMismatchError":function(d){return "Έχετε μια συμβολοσειρά με την λάθος κεφαλαιοποίηση."},
"userCodeException":function(d){return "Παρουσιάστηκε σφάλμα κατά την εκτέλεση του κώδικα σας."},
"wrongBooleanError":function(d){return "Τα Μπλοκ σας αποτιμώνται στη λάθος λογική τιμή."}};