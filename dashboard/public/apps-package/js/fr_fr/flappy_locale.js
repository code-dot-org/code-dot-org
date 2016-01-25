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
v:function(d,k){flappy_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){flappy_locale.c(d,k);return d[k] in p?p[d[k]]:(k=flappy_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){flappy_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).flappy_locale = {
"continue":function(d){return "Continuer"},
"doCode":function(d){return "faire"},
"elseCode":function(d){return "autre"},
"endGame":function(d){return "terminer le jeu"},
"endGameTooltip":function(d){return "Met fin à la partie."},
"finalLevel":function(d){return "Félicitations ! Vous avez résolu la dernière énigme."},
"flap":function(d){return "battre des ailes"},
"flapRandom":function(d){return "battre des ailes d'une quantité aléatoire"},
"flapVerySmall":function(d){return "battre des ailes très faiblement"},
"flapSmall":function(d){return "battre des ailes faiblement"},
"flapNormal":function(d){return "battre des ailes normalement"},
"flapLarge":function(d){return "battre des ailes fortement"},
"flapVeryLarge":function(d){return "battre des ailes très fortement"},
"flapTooltip":function(d){return "Fait voler Flappy vers le haut."},
"flappySpecificFail":function(d){return "Ton code semble bon - il battra des ailes à chaque clic. Mais tu dois cliquer plusieurs fois pour battre des ailes jusqu'à la cible."},
"incrementPlayerScore":function(d){return "marquer un point"},
"incrementPlayerScoreTooltip":function(d){return "Ajouter un point au score actuel du joueur."},
"nextLevel":function(d){return "Félicitations ! Tu as terminé cette énigme."},
"no":function(d){return "Non"},
"numBlocksNeeded":function(d){return "Cette énigme peut être résolue avec %1 blocs."},
"playSoundRandom":function(d){return "jouer un son aléatoire"},
"playSoundBounce":function(d){return "jouer le son rebond"},
"playSoundCrunch":function(d){return "jouer le son accroupir"},
"playSoundDie":function(d){return "jouer un son triste"},
"playSoundHit":function(d){return "jouer le son Baffe"},
"playSoundPoint":function(d){return "jouer le son Point"},
"playSoundSwoosh":function(d){return "jouer le son Tourbillon"},
"playSoundWing":function(d){return "jouer le son Battement d'ailes"},
"playSoundJet":function(d){return "jouer le son Jet"},
"playSoundCrash":function(d){return "jouer le son Accident"},
"playSoundJingle":function(d){return "jouer le son Clochettes"},
"playSoundSplash":function(d){return "jouer le son clapotis"},
"playSoundLaser":function(d){return "jouer le son Laser"},
"playSoundTooltip":function(d){return "Jouer le son choisi."},
"reinfFeedbackMsg":function(d){return "Tu peux cliquer sur le bouton « Réessayer » pour revenir à ta partie."},
"scoreText":function(d){return "Score : "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "choisir l'arrière-plan"},
"setBackgroundRandom":function(d){return "choisir un arrière-plan au hasard"},
"setBackgroundFlappy":function(d){return "choisir l'arrière-plan Ville (journée)"},
"setBackgroundNight":function(d){return "choisir l'arrière-plan Ville (nuit)"},
"setBackgroundSciFi":function(d){return "choisir l'arrière-plan Science-Fiction"},
"setBackgroundUnderwater":function(d){return "choisir l'arrière-plan Sous-marin"},
"setBackgroundCave":function(d){return "choisir l'arrière-plan Cave"},
"setBackgroundSanta":function(d){return "choisia la scène Nuit de Noël"},
"setBackgroundTooltip":function(d){return "Définit l'image d'arrière-plan"},
"setGapRandom":function(d){return "choisir un écart au hasard"},
"setGapVerySmall":function(d){return "choisir un écart très petit"},
"setGapSmall":function(d){return "choisir un écart petit"},
"setGapNormal":function(d){return "choisir un écart moyen"},
"setGapLarge":function(d){return "choisir un écart grand"},
"setGapVeryLarge":function(d){return "choisis un écart très grand"},
"setGapHeightTooltip":function(d){return "Définit la hauteur de l'espace dans un obstacle"},
"setGravityRandom":function(d){return "choisir un niveau de pesanteur aléatoire"},
"setGravityVeryLow":function(d){return "choisir un niveau de pesanteur très faible"},
"setGravityLow":function(d){return "choisir un niveau de pesanteur faible"},
"setGravityNormal":function(d){return "choisir un niveau de pesanteur moyen"},
"setGravityHigh":function(d){return "choisir un niveau de pesanteur élevé"},
"setGravityVeryHigh":function(d){return "choisir un niveau de pesanteur très élevé"},
"setGravityTooltip":function(d){return "Définit le niveau de gravité"},
"setGround":function(d){return "choisir le sol"},
"setGroundRandom":function(d){return "choisir un sol aléatoire"},
"setGroundFlappy":function(d){return "choisir le sol Terre"},
"setGroundSciFi":function(d){return "choisir le sol Science-Fiction"},
"setGroundUnderwater":function(d){return "choisir le sol Sous-marin"},
"setGroundCave":function(d){return "choisir le sol Cave"},
"setGroundSanta":function(d){return "choisir le sol Nuit de Noël"},
"setGroundLava":function(d){return "choisir le sol Lave"},
"setGroundTooltip":function(d){return "Définit l'image du sol"},
"setObstacle":function(d){return "choisir l'obstacle"},
"setObstacleRandom":function(d){return "choisir un obstacle au hasard"},
"setObstacleFlappy":function(d){return "choisir l'obstacle Tuyau"},
"setObstacleSciFi":function(d){return "choisir l'obstacle Science-Fiction"},
"setObstacleUnderwater":function(d){return "choisir l'obstacle Plante grimpante"},
"setObstacleCave":function(d){return "choisir l'obstacle Cave"},
"setObstacleSanta":function(d){return "choisir l'obstacle Cheminée"},
"setObstacleLaser":function(d){return "choisir l'obstacle Laser"},
"setObstacleTooltip":function(d){return "Définit l'image de l'obstacle"},
"setPlayer":function(d){return "choisir le personnage"},
"setPlayerRandom":function(d){return "choisir un personnage au hasard"},
"setPlayerFlappy":function(d){return "choisir le personnage Oiseau jaune"},
"setPlayerRedBird":function(d){return "choisir le personnage Oiseau rouge"},
"setPlayerSciFi":function(d){return "choisir le personnage Vaisseau spatial"},
"setPlayerUnderwater":function(d){return "choisir le personnage Poisson"},
"setPlayerCave":function(d){return "choisir le personnage Chauve-souris"},
"setPlayerSanta":function(d){return "choisir le personnage Père Noël"},
"setPlayerShark":function(d){return "choisir le personnage Requin"},
"setPlayerEaster":function(d){return "choisir le personnage Lapin de Pâques"},
"setPlayerBatman":function(d){return "choisir le personnage Homme chauve-souris"},
"setPlayerSubmarine":function(d){return "choisir le personnage Sous-marin"},
"setPlayerUnicorn":function(d){return "choisir le personnage Pégase"},
"setPlayerFairy":function(d){return "choisir le personnage Fée"},
"setPlayerSuperman":function(d){return "choisir le personnage Homme volant"},
"setPlayerTurkey":function(d){return "choisir le personnage Dindon"},
"setPlayerTooltip":function(d){return "Choisit l'image du personnage"},
"setScore":function(d){return "mettre le score à"},
"setScoreTooltip":function(d){return "Définit le score du joueur"},
"setSpeed":function(d){return "régler la vitesse"},
"setSpeedTooltip":function(d){return "Définit la vitesse de défilement du niveau"},
"shareFlappyTwitter":function(d){return "Regarde le jeu Flappy que j'ai fait. Je l'ai écrit moi-même avec @codeorg"},
"shareGame":function(d){return "Partager ton jeu :"},
"soundRandom":function(d){return "aléatoire"},
"soundBounce":function(d){return "rebondir"},
"soundCrunch":function(d){return "crunch"},
"soundDie":function(d){return "triste"},
"soundHit":function(d){return "claque"},
"soundPoint":function(d){return "point"},
"soundSwoosh":function(d){return "tourbillon"},
"soundWing":function(d){return "aile"},
"soundJet":function(d){return "jet"},
"soundCrash":function(d){return "accident"},
"soundJingle":function(d){return "clochettes"},
"soundSplash":function(d){return "clapotis"},
"soundLaser":function(d){return "laser"},
"speedRandom":function(d){return "régler la vitesse à une cadence aléatoire"},
"speedVerySlow":function(d){return "régler la vitesse sur \"très lent\""},
"speedSlow":function(d){return "régler la vitesse sur \"lent\""},
"speedNormal":function(d){return "régler la vitesse sur \"normal\""},
"speedFast":function(d){return "régler la vitesse sur \"rapide\""},
"speedVeryFast":function(d){return "régler la vitesse sur \"très rapide\""},
"whenClick":function(d){return "lors d'un clic"},
"whenClickTooltip":function(d){return "Exécute les actions insérées lors d'un clic de souris."},
"whenCollideGround":function(d){return "quand le sol est touché"},
"whenCollideGroundTooltip":function(d){return "Exécute les actions ci-dessous lorsque Flappy touche le sol."},
"whenCollideObstacle":function(d){return "quand un obstacle est heurté"},
"whenCollideObstacleTooltip":function(d){return "Exécute les actions ci-dessous lorsque Flappy rentre en collision avec un obstacle."},
"whenEnterObstacle":function(d){return "quand un obstacle est dépassé"},
"whenEnterObstacleTooltip":function(d){return "Exécute les actions insérées quand Flappy dépasse un obstacle."},
"whenRunButtonClick":function(d){return "quand la partie démarre"},
"whenRunButtonClickTooltip":function(d){return "Exécute les actions insérées lors du lancement du jeu."},
"yes":function(d){return "Oui"}};