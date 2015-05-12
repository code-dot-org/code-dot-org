var applab_locale = {lc:{"ar":function(n){
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
},"da":function(n){return n===1?"one":"other"},"de":function(n){return n===1?"one":"other"},"el":function(n){return n===1?"one":"other"}},
c:function(d,k){if(!d)throw new Error("MessageFormat: Data required for '"+k+"'.")},
n:function(d,k,o){if(isNaN(d[k]))throw new Error("MessageFormat: '"+k+"' isn't a number.");return d[k]-(o||0)},
v:function(d,k){applab_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){applab_locale.c(d,k);return d[k] in p?p[d[k]]:(k=applab_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){applab_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).applab_locale = {
"catActions":function(d){return "Ενέργειες"},
"catControl":function(d){return "Βρόχοι"},
"catEvents":function(d){return "Συμβάντα"},
"catLogic":function(d){return "Λογική"},
"catMath":function(d){return "Μαθηματικά"},
"catProcedures":function(d){return "Συναρτήσεις"},
"catText":function(d){return "κείμενο"},
"catVariables":function(d){return "Μεταβλητές"},
"continue":function(d){return "Συνέχεια"},
"container":function(d){return "Δημιουργία πλαισίου"},
"containerTooltip":function(d){return "Δημιουργεί ένα πλαίσιο και ορίζει το περιεχόμενο HTML."},
"finalLevel":function(d){return "Συγχαρητήρια! Έλυσες το τελευταίο Παζλ."},
"nextLevel":function(d){return "Συγχαρητήρια! Έχεις ολοκληρώσει αυτό το παζλ."},
"no":function(d){return "Όχι"},
"numBlocksNeeded":function(d){return "Αυτό το παζλ μπορεί να λυθεί με %1 μπλοκ."},
"pause":function(d){return "Διακοπή"},
"reinfFeedbackMsg":function(d){return "Μπορείς να πατήσεις το κουμπί \"Προσπάθησε ξανά\" για να επιστρέψεις στην εκτέλεση της εφαρμογής σου."},
"repeatForever":function(d){return "επανάλαβε για πάντα"},
"repeatDo":function(d){return "κάνε"},
"repeatForeverTooltip":function(d){return "Εκτέλεσε τις ενέργειες αυτού του μπλοκ επανειλημμένα όσο εκτελείται η εφαρμογή."},
"shareApplabTwitter":function(d){return "Δες την εφαρμογή που έφτιαξα. Την έγραψα μόνος μου με το @codeorg"},
"shareGame":function(d){return "Μοιράσου την εφαρμογή σου:"},
"stepIn":function(d){return "Βήμα εντός"},
"stepOver":function(d){return "Παράκαμψε"},
"stepOut":function(d){return "Βήμα εκτός"},
"viewData":function(d){return "Προβολή δεδομένων"},
"yes":function(d){return "Ναι"}};