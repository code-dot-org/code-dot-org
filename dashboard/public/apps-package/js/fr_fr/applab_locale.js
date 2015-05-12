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
},"da":function(n){return n===1?"one":"other"},"de":function(n){return n===1?"one":"other"},"el":function(n){return n===1?"one":"other"},"es":function(n){return n===1?"one":"other"},"et":function(n){return n===1?"one":"other"},"eu":function(n){return n===1?"one":"other"},"fa":function(n){return "other"},"fi":function(n){return n===1?"one":"other"},"fil":function(n){return n===0||n==1?"one":"other"},"fr":function(n){return Math.floor(n)===0||Math.floor(n)==1?"one":"other"}},
c:function(d,k){if(!d)throw new Error("MessageFormat: Data required for '"+k+"'.")},
n:function(d,k,o){if(isNaN(d[k]))throw new Error("MessageFormat: '"+k+"' isn't a number.");return d[k]-(o||0)},
v:function(d,k){applab_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){applab_locale.c(d,k);return d[k] in p?p[d[k]]:(k=applab_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){applab_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).applab_locale = {
"catActions":function(d){return "Actions"},
"catControl":function(d){return "boucles"},
"catEvents":function(d){return "Événements"},
"catLogic":function(d){return "Logique"},
"catMath":function(d){return "Calculs"},
"catProcedures":function(d){return "fonctions"},
"catText":function(d){return "Texte"},
"catVariables":function(d){return "variables"},
"continue":function(d){return "Continuer"},
"container":function(d){return "Créer un conteneur"},
"containerTooltip":function(d){return "Crée un conteneur de division et définit son HTML interne."},
"finalLevel":function(d){return "Félicitations ! Vous avez résolu l'énigme finale."},
"nextLevel":function(d){return "Félicitations ! Vous avez terminé cette énigme."},
"no":function(d){return "Non"},
"numBlocksNeeded":function(d){return "Cette énigme peut être résolue avec %1 blocs."},
"pause":function(d){return "Pause"},
"reinfFeedbackMsg":function(d){return "Vous pouvez appuyer sur le bouton \"Essayer encore\" pour revenir à l'exécution de votre application."},
"repeatForever":function(d){return "répéter à l'infini"},
"repeatDo":function(d){return "faire"},
"repeatForeverTooltip":function(d){return "Exécuter les actions dans ce bloc à plusieurs reprises pendant que l'application s'exécute."},
"shareApplabTwitter":function(d){return "Découvrez l'histoire que j'ai créée. Je l'ai écrite moi-même avec @codeorg"},
"shareGame":function(d){return "Partage ton application :"},
"stepIn":function(d){return "Entrer"},
"stepOver":function(d){return "Passer au suivant"},
"stepOut":function(d){return "Abandonner"},
"viewData":function(d){return "Voir les données"},
"yes":function(d){return "Oui"}};