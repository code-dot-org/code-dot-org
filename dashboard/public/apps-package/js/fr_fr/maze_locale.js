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
"atHoneycomb":function(d){return "au nid d'abeille"},
"atFlower":function(d){return "à la fleur"},
"avoidCowAndRemove":function(d){return "éviter la vache et retirer 1"},
"continue":function(d){return "Continuer"},
"dig":function(d){return "retirer 1"},
"digTooltip":function(d){return "retirer 1 unité de terre"},
"dirE":function(d){return "E"},
"dirN":function(d){return "N"},
"dirS":function(d){return "S"},
"dirW":function(d){return "O"},
"doCode":function(d){return "faire"},
"elseCode":function(d){return "sinon"},
"fill":function(d){return "remplir 1"},
"fillN":function(d){return "remplir "+maze_locale.v(d,"shovelfuls")},
"fillStack":function(d){return "remplir les trous avec "+maze_locale.v(d,"shovelfuls")+" "},
"fillSquare":function(d){return "remplir le carré"},
"fillTooltip":function(d){return "placer 1 unité de terre"},
"finalLevel":function(d){return "Félicitations ! Tu as résolu l'énigme finale."},
"flowerEmptyError":function(d){return "La fleur sur laquelle tu es n'a plus de nectar."},
"get":function(d){return "obtenir"},
"heightParameter":function(d){return "hauteur"},
"holePresent":function(d){return "il y a un trou"},
"honey":function(d){return "fabriquer du miel"},
"honeyAvailable":function(d){return "miel"},
"honeyTooltip":function(d){return "Transformer le nectar en miel"},
"honeycombFullError":function(d){return "Il n'y a plus de place pour mettre du miel dans ce nid d'abeille."},
"ifCode":function(d){return "si"},
"ifInRepeatError":function(d){return "Tu as besoin d'un bloc \"Si\" à l'intérieur d'un bloc \"répéter\". Si tu rencontres des difficultés, essayez à nouveau le niveau précédent pour voir comment cela fonctionnait."},
"ifPathAhead":function(d){return "si chemin devant"},
"ifTooltip":function(d){return "S'il y a un chemin dans la direction indiquée, alors effectuer certaines actions."},
"ifelseTooltip":function(d){return "S'il y a un chemin dans la direction indiquée, alors exécuter le premier bloc d'actions. Sinon, exécuter le deuxième bloc d'actions."},
"ifFlowerTooltip":function(d){return "S'il y a une fleur/un nid d'abeille dans la direction indiquée, alors effectuer certaines actions."},
"ifOnlyFlowerTooltip":function(d){return "Si il y a une fleur dans la direction indiquée, alors effectuer certaines actions."},
"ifelseFlowerTooltip":function(d){return "S'il y a une fleur ou un nid d'abeille dans la direction indiquée, alors le premier bloc d'actions est exécuté. Sinon, on exécute le deuxième bloc d'actions."},
"insufficientHoney":function(d){return "Tu utilises correctement tous les blocs, mais tu dois produire la bonne quantité de miel."},
"insufficientNectar":function(d){return "Tu utilises correctement tous les blocs, mais tu dois collecter la bonne quantité de nectar."},
"make":function(d){return "fabriquer"},
"moveBackward":function(d){return "reculer"},
"moveEastTooltip":function(d){return "Déplace-moi d'une case vers l'Est."},
"moveForward":function(d){return "avancer plus"},
"moveForwardTooltip":function(d){return "Me fait avancer d'un espace."},
"moveNorthTooltip":function(d){return "Déplace d'un espace vers le Nord."},
"moveSouthTooltip":function(d){return "Déplace d'un espace vers le Sud."},
"moveTooltip":function(d){return "Déplace d'une case vers l'avant ou l'arrière"},
"moveWestTooltip":function(d){return "Déplace d'une case vers l'Ouest."},
"nectar":function(d){return "prendre du nectar"},
"nectarRemaining":function(d){return "nectar"},
"nectarTooltip":function(d){return "Prendre le nectar d'une fleur"},
"nextLevel":function(d){return "Félicitations ! Tu as terminé cette énigme."},
"no":function(d){return "Non"},
"noPathAhead":function(d){return "le chemin est bloqué"},
"noPathLeft":function(d){return "pas de chemin à gauche"},
"noPathRight":function(d){return "pas de chemin à droite"},
"notAtFlowerError":function(d){return "Tu ne peux récupérer du nectar que depuis une fleur."},
"notAtHoneycombError":function(d){return "Tu ne peux faire du miel que sur un nid d'abeille."},
"numBlocksNeeded":function(d){return "Cette énigme peut être résolue avec %1 blocs."},
"pathAhead":function(d){return "chemin devant"},
"pathLeft":function(d){return "si chemin à gauche"},
"pathRight":function(d){return "si chemin à droite"},
"pilePresent":function(d){return "Il y a une pile"},
"putdownTower":function(d){return "poser la tour"},
"removeAndAvoidTheCow":function(d){return "retirer 1 et éviter la vache"},
"removeN":function(d){return "supprimer "+maze_locale.v(d,"shovelfuls")},
"removePile":function(d){return "retirer la motte"},
"removeStack":function(d){return "retirer une pile de "+maze_locale.v(d,"shovelfuls")+" mottes"},
"removeSquare":function(d){return "retirer le carré"},
"repeatCarefullyError":function(d){return "Pour résoudre cette énigme, pense à la suite d'instructions contenant deux déplacements et un changement de direction, que tu pourrais insérer dans le bloc « répéter ». Ce n'est pas grave si tu te tournes une fois de trop à la fin."},
"repeatUntil":function(d){return "répéter jusqu’à"},
"repeatUntilBlocked":function(d){return "Tant que chemin devant"},
"repeatUntilFinish":function(d){return "répéter jusqu'à la fin"},
"step":function(d){return "Étape"},
"totalHoney":function(d){return "quantité de miel"},
"totalNectar":function(d){return "quantité de nectar"},
"turnLeft":function(d){return "tourner à gauche"},
"turnRight":function(d){return "tourner à droite"},
"turnTooltip":function(d){return "Me tourne 90 degrés à gauche ou à droite."},
"uncheckedCloudError":function(d){return "Vérifie bien tous les nuages pour voir s'ils cachent des fleurs ou des nids d'abeille."},
"uncheckedPurpleError":function(d){return "Vérifie bien toutes les fleurs violettes pour voir si elles contiennent du nectar"},
"whileMsg":function(d){return "tant que"},
"whileTooltip":function(d){return "Répète les actions incluses jusqu'à ce que le point final soit atteint."},
"word":function(d){return "Trouver le mot"},
"yes":function(d){return "Oui"},
"youSpelled":function(d){return "Tu as épelé"},
"didNotCollectEverything":function(d){return "Make sure you don't leave any nectar or honey behind!"}};