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
v:function(d,k){bounce_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){bounce_locale.c(d,k);return d[k] in p?p[d[k]]:(k=bounce_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){bounce_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).bounce_locale = {
"bounceBall":function(d){return "faire rebondir la balle"},
"bounceBallTooltip":function(d){return "Fais rebondir une balle sur un objet."},
"continue":function(d){return "Continuer"},
"dirE":function(d){return "E"},
"dirN":function(d){return "N"},
"dirS":function(d){return "S"},
"dirW":function(d){return "O"},
"doCode":function(d){return "faire"},
"elseCode":function(d){return "sinon"},
"finalLevel":function(d){return "Félicitations ! Vous avez résolu la dernière énigme."},
"heightParameter":function(d){return "hauteur"},
"ifCode":function(d){return "si"},
"ifPathAhead":function(d){return "si chemin devant"},
"ifTooltip":function(d){return "S'il y a un chemin dans la direction indiquée, alors effectuer certaines actions."},
"ifelseTooltip":function(d){return "S'il y a un chemin dans la direction indiquée, alors exécuter le premier bloc d'actions. Sinon, exécuter le deuxième bloc d'actions."},
"incrementOpponentScore":function(d){return "marquer un point pour l'adversaire"},
"incrementOpponentScoreTooltip":function(d){return "Ajouter un au score de l'adversaire."},
"incrementPlayerScore":function(d){return "marquer un point"},
"incrementPlayerScoreTooltip":function(d){return "Ajouter un point au score actuel du joueur."},
"isWall":function(d){return "est-ce un mur"},
"isWallTooltip":function(d){return "Retourne vrai s'il y a un mur ici"},
"launchBall":function(d){return "lancer une nouvelle balle"},
"launchBallTooltip":function(d){return "Mettre une balle en jeu."},
"makeYourOwn":function(d){return "Crée ton propre jeu à Rebond"},
"moveDown":function(d){return "déplacer vers le bas"},
"moveDownTooltip":function(d){return "Déplace la raquette vers le bas."},
"moveForward":function(d){return "avancer plus"},
"moveForwardTooltip":function(d){return "Me fait avancer d'un espace."},
"moveLeft":function(d){return "déplacer vers la gauche"},
"moveLeftTooltip":function(d){return "Déplace la raquette vers la gauche."},
"moveRight":function(d){return "déplacer vers la droite"},
"moveRightTooltip":function(d){return "Déplace la raquette vers la droite."},
"moveUp":function(d){return "déplacer vers le haut"},
"moveUpTooltip":function(d){return "Déplace la raquette vers le haut."},
"nextLevel":function(d){return "Félicitations ! Vous avez terminé cette énigme."},
"no":function(d){return "Non"},
"noPathAhead":function(d){return "le chemin est bloqué"},
"noPathLeft":function(d){return "pas de chemin vers la gauche"},
"noPathRight":function(d){return "pas de chemin vers la droite"},
"numBlocksNeeded":function(d){return "Cette énigme peut être résolue avec %1 blocs."},
"pathAhead":function(d){return "chemin devant"},
"pathLeft":function(d){return "si chemin à gauche"},
"pathRight":function(d){return "si chemin à droite"},
"pilePresent":function(d){return "Il y a une pile"},
"playSoundCrunch":function(d){return "jouer le son accroupir"},
"playSoundGoal1":function(d){return "jouer le son but 1"},
"playSoundGoal2":function(d){return "jouer le son but 2"},
"playSoundHit":function(d){return "jouer le son coup"},
"playSoundLosePoint":function(d){return "jouer le son perdre un point"},
"playSoundLosePoint2":function(d){return "jouer le son perdre un point 2"},
"playSoundRetro":function(d){return "jouer un son rétro"},
"playSoundRubber":function(d){return "jouer un son caoutchouc"},
"playSoundSlap":function(d){return "jouer un son claque"},
"playSoundTooltip":function(d){return "Jouer le son choisi."},
"playSoundWinPoint":function(d){return "jouer le son gagner un point"},
"playSoundWinPoint2":function(d){return "jouer le son gagner un point 2"},
"playSoundWood":function(d){return "jouer un son de bois"},
"putdownTower":function(d){return "poser la tour"},
"reinfFeedbackMsg":function(d){return "Vous pouvez cliquer sur le bouton « Réessayer » pour revenir à votre partie."},
"removeSquare":function(d){return "retirer le carré"},
"repeatUntil":function(d){return "répéter jusqu’à"},
"repeatUntilBlocked":function(d){return "Tant que chemin devant"},
"repeatUntilFinish":function(d){return "répéter jusqu'à la fin"},
"scoreText":function(d){return "Résultat: "+bounce_locale.v(d,"playerScore")+" : "+bounce_locale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "choisir une scène aléatoire"},
"setBackgroundHardcourt":function(d){return "choisir l'arrière-plan Tennis de table"},
"setBackgroundRetro":function(d){return "choisir l'arrière-plan Rétro"},
"setBackgroundTooltip":function(d){return "Définit l'image d'arrière-plan"},
"setBallRandom":function(d){return "choisir l'apparence de la balle au hasard"},
"setBallHardcourt":function(d){return "choisir l'apparence de la balle Tennis de table"},
"setBallRetro":function(d){return "choisir l'apparence de la balle Rétro"},
"setBallTooltip":function(d){return "Définit l'image de la balle"},
"setBallSpeedRandom":function(d){return "choisir une vitesse aléatoire pour la balle"},
"setBallSpeedVerySlow":function(d){return "choisir une vitesse trés lente pour la balle"},
"setBallSpeedSlow":function(d){return "choisir pour la balle à une vitesse lente"},
"setBallSpeedNormal":function(d){return "choisir une vitesse normale pour la balle"},
"setBallSpeedFast":function(d){return "choisir pour la balle à une vitesse rapide"},
"setBallSpeedVeryFast":function(d){return "choisir pour la balle une vitesse très rapide"},
"setBallSpeedTooltip":function(d){return "Définit la vitesse de la balle."},
"setPaddleRandom":function(d){return "choisir l'apparence de la raquette au hasard"},
"setPaddleHardcourt":function(d){return "choisir l'apparence de la raquette Tennis de table"},
"setPaddleRetro":function(d){return "choisir l'apparence de la raquette Rétro"},
"setPaddleTooltip":function(d){return "Définit l'image de la raquette"},
"setPaddleSpeedRandom":function(d){return "choisir une valeur aléatoire pour la vitesse de la raquette"},
"setPaddleSpeedVerySlow":function(d){return "régler la vitesse de la raquette à une valeur très lente"},
"setPaddleSpeedSlow":function(d){return "choisir la vitesse lente pour la raquette"},
"setPaddleSpeedNormal":function(d){return "choisir une vitesse normale pour la raquette"},
"setPaddleSpeedFast":function(d){return "choisir la vitesse rapide pour la raquette"},
"setPaddleSpeedVeryFast":function(d){return "choisir une vitesse très rapide pour la raquette"},
"setPaddleSpeedTooltip":function(d){return "Règle la vitesse de la raquette"},
"shareBounceTwitter":function(d){return "Regarde le jeu de rebond que j'ai fait. Je l'ai écrit moi-même avec @codeorg"},
"shareGame":function(d){return "Partagez votre jeu :"},
"turnLeft":function(d){return "tourner à gauche"},
"turnRight":function(d){return "tourner à droite"},
"turnTooltip":function(d){return "Me tourne 90 degrés à gauche ou à droite."},
"whenBallInGoal":function(d){return "quand la balle est dans le but"},
"whenBallInGoalTooltip":function(d){return "Exécuter les actions ci-dessous lorsqu'une balle entre dans le but."},
"whenBallMissesPaddle":function(d){return "quand la balle manque la raquette"},
"whenBallMissesPaddleTooltip":function(d){return "Exécuter les actions ci-dessous quand une balle manque la raquette."},
"whenDown":function(d){return "quand flèche en bas"},
"whenDownTooltip":function(d){return "Exécute les actions ci-dessous quand on presse la touche 'flèche en bas'."},
"whenGameStarts":function(d){return "lors du lancement du jeu"},
"whenGameStartsTooltip":function(d){return "Exécute les actions insérées au lancement du jeu."},
"whenLeft":function(d){return "quand flèche à gauche"},
"whenLeftTooltip":function(d){return "Exécute les actions ci-dessous quand on presse la touche 'flèche à gauche'."},
"whenPaddleCollided":function(d){return "quand la balle touche la raquette"},
"whenPaddleCollidedTooltip":function(d){return "Exécute les actions ci-dessous quand une balle se heurte à une raquette."},
"whenRight":function(d){return "quand flèche à droite"},
"whenRightTooltip":function(d){return "Exécute les actions ci-dessous quand on presse la touche 'flèche à droite'."},
"whenUp":function(d){return "quand flèche en haut"},
"whenUpTooltip":function(d){return "Exécute les actions ci-dessous quand on presse la touche 'flèche en haut'."},
"whenWallCollided":function(d){return "quand la balle touche un mur"},
"whenWallCollidedTooltip":function(d){return "Exécute les actions ci-dessous quand une balle se heurte à un mur."},
"whileMsg":function(d){return "tant que"},
"whileTooltip":function(d){return "Répète les actions incluses jusqu'à ce que le point final soit atteint."},
"yes":function(d){return "Oui"}};