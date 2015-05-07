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
"actor":function(d){return "acteur"},
"alienInvasion":function(d){return "Invasion extraterrestre !"},
"backgroundBlack":function(d){return "noir"},
"backgroundCave":function(d){return "grotte"},
"backgroundCloudy":function(d){return "nuageux"},
"backgroundHardcourt":function(d){return "Terrain"},
"backgroundNight":function(d){return "nuit"},
"backgroundUnderwater":function(d){return "sous l'eau"},
"backgroundCity":function(d){return "ville"},
"backgroundDesert":function(d){return "désert"},
"backgroundRainbow":function(d){return "arc en ciel"},
"backgroundSoccer":function(d){return "soccer"},
"backgroundSpace":function(d){return "espace"},
"backgroundTennis":function(d){return "tennis"},
"backgroundWinter":function(d){return "hiver"},
"catActions":function(d){return "Actions"},
"catControl":function(d){return "boucles"},
"catEvents":function(d){return "Événements"},
"catLogic":function(d){return "Logique"},
"catMath":function(d){return "Math"},
"catProcedures":function(d){return "fonctions"},
"catText":function(d){return "Texte"},
"catVariables":function(d){return "variables"},
"changeScoreTooltip":function(d){return "Ajouter ou enlever un point au score."},
"changeScoreTooltipK1":function(d){return "Ajouter un point au score."},
"continue":function(d){return "Continuer"},
"decrementPlayerScore":function(d){return "supprimer le point"},
"defaultSayText":function(d){return "Tapez ici"},
"emotion":function(d){return "humeur"},
"finalLevel":function(d){return "Félicitations ! Vous avez résolu l'énigme finale."},
"for":function(d){return "pour"},
"hello":function(d){return "salut"},
"helloWorld":function(d){return "Bonjour tout le monde!"},
"incrementPlayerScore":function(d){return "marquer un point"},
"makeProjectileDisappear":function(d){return "disparaître"},
"makeProjectileBounce":function(d){return "rebond"},
"makeProjectileBlueFireball":function(d){return "fabriquer une boule de feu bleue"},
"makeProjectilePurpleFireball":function(d){return "fabriquer une boule de feu violette"},
"makeProjectileRedFireball":function(d){return "fabriquer une boule de feu rouge"},
"makeProjectileYellowHearts":function(d){return "fabriquer des coeurs jaunes"},
"makeProjectilePurpleHearts":function(d){return "fabriquer des coeurs violets"},
"makeProjectileRedHearts":function(d){return "fabriquer des coeurs violets"},
"makeProjectileTooltip":function(d){return "Faire disparaitre ou rebondir le projectile qui heurte une surface ."},
"makeYourOwn":function(d){return "Faire votre propre application Play Lab"},
"moveDirectionDown":function(d){return "vers le bas"},
"moveDirectionLeft":function(d){return "gauche"},
"moveDirectionRight":function(d){return "vers la droite"},
"moveDirectionUp":function(d){return "vers le haut"},
"moveDirectionRandom":function(d){return "aléatoire"},
"moveDistance25":function(d){return "25 pixels"},
"moveDistance50":function(d){return "50 pixels"},
"moveDistance100":function(d){return "100 pixels"},
"moveDistance200":function(d){return "200 pixels"},
"moveDistance400":function(d){return "400 pixels"},
"moveDistancePixels":function(d){return "pixels"},
"moveDistanceRandom":function(d){return "pixels au hasard"},
"moveDistanceTooltip":function(d){return "Déplacer un acteur sur une certaine distance dans la direction spécifiée."},
"moveSprite":function(d){return "déplacer"},
"moveSpriteN":function(d){return "déplacer l'acteur "+appLocale.v(d,"spriteIndex")},
"toXY":function(d){return "en x, y"},
"moveDown":function(d){return "déplacer vers le bas"},
"moveDownTooltip":function(d){return "Déplacer un acteur vers le bas."},
"moveLeft":function(d){return "déplacer vers la gauche"},
"moveLeftTooltip":function(d){return "Déplacer un acteur vers la gauche."},
"moveRight":function(d){return "déplacer vers la droite"},
"moveRightTooltip":function(d){return "Déplacer un acteur vers la droite."},
"moveUp":function(d){return "déplacer vers le haut"},
"moveUpTooltip":function(d){return "Déplacer un acteur vers le haut."},
"moveTooltip":function(d){return "Déplacer un acteur."},
"nextLevel":function(d){return "Félicitations ! Vous avez terminé cette énigme."},
"no":function(d){return "Non"},
"numBlocksNeeded":function(d){return "Cette enigme peut être résolue avec %1 blocs."},
"onEventTooltip":function(d){return "Exécuter du code en réponse à l'événement spécifié."},
"ouchExclamation":function(d){return "Aïe !"},
"playSoundCrunch":function(d){return "jouer le son accroupir"},
"playSoundGoal1":function(d){return "jouer le son but 1"},
"playSoundGoal2":function(d){return "jouer le son but 2"},
"playSoundHit":function(d){return "jouer le son coup"},
"playSoundLosePoint":function(d){return "jour le son perdre un point"},
"playSoundLosePoint2":function(d){return "jour le son perdre un point 2"},
"playSoundRetro":function(d){return "jouer un son rétro"},
"playSoundRubber":function(d){return "jouer un son caoutchouc"},
"playSoundSlap":function(d){return "jouer un son claque"},
"playSoundTooltip":function(d){return "Jouer le son choisi."},
"playSoundWinPoint":function(d){return "jouer le son gagner un point"},
"playSoundWinPoint2":function(d){return "jouer le son gagner un point 2"},
"playSoundWood":function(d){return "jouer un son de bois"},
"positionOutTopLeft":function(d){return "la position en haut à gauche"},
"positionOutTopRight":function(d){return "à la position en haut à droite"},
"positionTopOutLeft":function(d){return "vers le haut extérieur gauche"},
"positionTopLeft":function(d){return "à la position en haut à gauche"},
"positionTopCenter":function(d){return "la position en haut et au centre"},
"positionTopRight":function(d){return "la position en haut à droite"},
"positionTopOutRight":function(d){return "vers le haut extérieur droit"},
"positionMiddleLeft":function(d){return "la position au milieu gauche"},
"positionMiddleCenter":function(d){return "la position au centre au milieu"},
"positionMiddleRight":function(d){return "la position au milieu à droite"},
"positionBottomOutLeft":function(d){return "vers le bas extérieur gauche"},
"positionBottomLeft":function(d){return "la position en bas à gauche"},
"positionBottomCenter":function(d){return "la position en bas au centre"},
"positionBottomRight":function(d){return "la position en bas à droite"},
"positionBottomOutRight":function(d){return "en bas à droite vers l'extérieur"},
"positionOutBottomLeft":function(d){return "en bas à gauche ci-dessous"},
"positionOutBottomRight":function(d){return "en bas à droite ci dessous"},
"positionRandom":function(d){return "vers une position aléatoire"},
"projectileBlueFireball":function(d){return "une boule de feu bleue"},
"projectilePurpleFireball":function(d){return "boule de feu violette"},
"projectileRedFireball":function(d){return "boule de feu rouge"},
"projectileYellowHearts":function(d){return "cœurs jaunes"},
"projectilePurpleHearts":function(d){return "cœurs violets"},
"projectileRedHearts":function(d){return "cœurs rouges"},
"projectileRandom":function(d){return "aléatoire"},
"projectileAnna":function(d){return "crochet"},
"projectileElsa":function(d){return "éclat"},
"projectileHiro":function(d){return "Hiro"},
"projectileBaymax":function(d){return "fusée"},
"projectileRapunzel":function(d){return "casserole"},
"projectileCherry":function(d){return "cerise"},
"projectileIce":function(d){return "glace"},
"projectileDuck":function(d){return "canard"},
"reinfFeedbackMsg":function(d){return "Vous pouvez appuyer sur le bouton « Continuer à jouer » pour retourner jouer votre histoire."},
"repeatForever":function(d){return "répéter à l'infini"},
"repeatDo":function(d){return "faire"},
"repeatForeverTooltip":function(d){return "Exécuter les actions dans ce bloc à plusieurs reprises pendant que l'histoire est en marche."},
"saySprite":function(d){return "dire"},
"saySpriteN":function(d){return "l'acteur "+appLocale.v(d,"spriteIndex")+" dit"},
"saySpriteTooltip":function(d){return "Montre une bulle de texte pour l'acteur spécifié."},
"saySpriteChoices_0":function(d){return "Salut."},
"saySpriteChoices_1":function(d){return "Salut tout le monde."},
"saySpriteChoices_2":function(d){return "Comment allez-vous ?"},
"saySpriteChoices_3":function(d){return "Bonjour"},
"saySpriteChoices_4":function(d){return "Bon après-midi"},
"saySpriteChoices_5":function(d){return "Bonne nuit"},
"saySpriteChoices_6":function(d){return "Bonsoir"},
"saySpriteChoices_7":function(d){return "Quoi de neuf ?"},
"saySpriteChoices_8":function(d){return "Quoi ?"},
"saySpriteChoices_9":function(d){return "Où ça ?"},
"saySpriteChoices_10":function(d){return "Quand ?"},
"saySpriteChoices_11":function(d){return "Bien."},
"saySpriteChoices_12":function(d){return "Super !"},
"saySpriteChoices_13":function(d){return "D'accord."},
"saySpriteChoices_14":function(d){return "Pas mal."},
"saySpriteChoices_15":function(d){return "Bonne chance."},
"saySpriteChoices_16":function(d){return "Oui"},
"saySpriteChoices_17":function(d){return "Non"},
"saySpriteChoices_18":function(d){return "OK"},
"saySpriteChoices_19":function(d){return "Beau lancer !"},
"saySpriteChoices_20":function(d){return "Bonne Journée."},
"saySpriteChoices_21":function(d){return "Au revoir."},
"saySpriteChoices_22":function(d){return "Je reviendrai."},
"saySpriteChoices_23":function(d){return "À demain !"},
"saySpriteChoices_24":function(d){return "A plus tard !"},
"saySpriteChoices_25":function(d){return "Prenez soin de vous !"},
"saySpriteChoices_26":function(d){return "Profitez !"},
"saySpriteChoices_27":function(d){return "Je dois partir."},
"saySpriteChoices_28":function(d){return "Vous voulez être amis ?"},
"saySpriteChoices_29":function(d){return "Beau travail !"},
"saySpriteChoices_30":function(d){return "Woo hoo !"},
"saySpriteChoices_31":function(d){return "Yay !"},
"saySpriteChoices_32":function(d){return "Ravi de vous rencontrer."},
"saySpriteChoices_33":function(d){return "D'accord!"},
"saySpriteChoices_34":function(d){return "Merci"},
"saySpriteChoices_35":function(d){return "Non merci"},
"saySpriteChoices_36":function(d){return "Aaaaaah !"},
"saySpriteChoices_37":function(d){return "C'est pas grave"},
"saySpriteChoices_38":function(d){return "Aujourd'hui"},
"saySpriteChoices_39":function(d){return "Demain"},
"saySpriteChoices_40":function(d){return "Hier"},
"saySpriteChoices_41":function(d){return "Je vous ai trouvé !"},
"saySpriteChoices_42":function(d){return "Vous m'a trouvé !"},
"saySpriteChoices_43":function(d){return "10, 9, 8, 7, 6, 5, 4, 3, 2, 1 !"},
"saySpriteChoices_44":function(d){return "Vous êtes super !"},
"saySpriteChoices_45":function(d){return "Vous êtes drôle !"},
"saySpriteChoices_46":function(d){return "Vous êtes stupide ! "},
"saySpriteChoices_47":function(d){return "Vous êtes un bon ami !"},
"saySpriteChoices_48":function(d){return "Méfiez-vous !"},
"saySpriteChoices_49":function(d){return "Canard !"},
"saySpriteChoices_50":function(d){return "Gotcha !"},
"saySpriteChoices_51":function(d){return "Ow !"},
"saySpriteChoices_52":function(d){return "Désolé !"},
"saySpriteChoices_53":function(d){return "Attention !"},
"saySpriteChoices_54":function(d){return "Waouh !"},
"saySpriteChoices_55":function(d){return "Oups !"},
"saySpriteChoices_56":function(d){return "Tu m'as presque eu !"},
"saySpriteChoices_57":function(d){return "Joli essai !"},
"saySpriteChoices_58":function(d){return "Vous ne pouvez pas m'attraper !"},
"scoreText":function(d){return "Score : "+appLocale.v(d,"playerScore")},
"setBackground":function(d){return "définir l'arrière-plan"},
"setBackgroundRandom":function(d){return "définir un arrière-plan aléatoire"},
"setBackgroundBlack":function(d){return "définir l'arrière-plan noir"},
"setBackgroundCave":function(d){return "définir l'arrière-plan caverne"},
"setBackgroundCloudy":function(d){return "définir l'arrière-plan nuageux"},
"setBackgroundHardcourt":function(d){return "définir l'arrière-plan Terrain"},
"setBackgroundNight":function(d){return "définir l'arrière-plan nuit"},
"setBackgroundUnderwater":function(d){return "définir l'arrière-plan sous-marin"},
"setBackgroundCity":function(d){return "définir l'arrière plan ville"},
"setBackgroundDesert":function(d){return "définir l'arrière plan désert"},
"setBackgroundRainbow":function(d){return "définir l'arrière plan arc-en-ciel"},
"setBackgroundSoccer":function(d){return "définir l'arrière plan football"},
"setBackgroundSpace":function(d){return "définir l'arrière plan espace"},
"setBackgroundTennis":function(d){return "définir l'arrière plan tennis"},
"setBackgroundWinter":function(d){return "définir l'arrière plan hiver"},
"setBackgroundLeafy":function(d){return "choisir une image de fond à feuilles"},
"setBackgroundGrassy":function(d){return "choisir une image de fond d'herbe"},
"setBackgroundFlower":function(d){return "choisir une image de fond à fleurs"},
"setBackgroundTile":function(d){return "choisir une image de fond en briques"},
"setBackgroundIcy":function(d){return "choisir une image de fond de glace"},
"setBackgroundSnowy":function(d){return "choisir une image de fond de neige"},
"setBackgroundTooltip":function(d){return "Définit l'image d'arrière-plan"},
"setEnemySpeed":function(d){return "définir la vitesse de l'ennemi"},
"setPlayerSpeed":function(d){return "définir la vitesse du joueur"},
"setScoreText":function(d){return "mettre le score à"},
"setScoreTextTooltip":function(d){return "définit le texte à afficher dans la zone de score."},
"setSpriteEmotionAngry":function(d){return "à une mauvaise humeur"},
"setSpriteEmotionHappy":function(d){return "une bonne humeur"},
"setSpriteEmotionNormal":function(d){return "une humeur normale"},
"setSpriteEmotionRandom":function(d){return "une humeur aléatoire"},
"setSpriteEmotionSad":function(d){return "une mauvaise humeur"},
"setSpriteEmotionTooltip":function(d){return "Définit l'humeur de l'acteur"},
"setSpriteAlien":function(d){return "une image d'extra terrestre"},
"setSpriteBat":function(d){return "une image de chauve-souris"},
"setSpriteBird":function(d){return "une image d'oiseau"},
"setSpriteCat":function(d){return "une image de chat"},
"setSpriteCaveBoy":function(d){return "une image d'homme des cavernes"},
"setSpriteCaveGirl":function(d){return "une image de femme des cavernes"},
"setSpriteDinosaur":function(d){return "une image de dinosaure"},
"setSpriteDog":function(d){return "une image de chien"},
"setSpriteDragon":function(d){return "une image de dragon"},
"setSpriteGhost":function(d){return "une image de fantôme"},
"setSpriteHidden":function(d){return "une image masquée"},
"setSpriteHideK1":function(d){return "cacher"},
"setSpriteAnna":function(d){return "pour une image de Anna"},
"setSpriteElsa":function(d){return "pour une image de Elsa"},
"setSpriteHiro":function(d){return "à une image d'Hiro"},
"setSpriteBaymax":function(d){return "à une image de Baymax"},
"setSpriteRapunzel":function(d){return "à une image de Raiponce"},
"setSpriteKnight":function(d){return "à une image de chevalier"},
"setSpriteMonster":function(d){return "à une image de monstre"},
"setSpriteNinja":function(d){return "à une image de ninja masqué"},
"setSpriteOctopus":function(d){return "à une image de pieuvre"},
"setSpritePenguin":function(d){return "une image de pingouin"},
"setSpritePirate":function(d){return "une image de pirate"},
"setSpritePrincess":function(d){return "une image de princesse"},
"setSpriteRandom":function(d){return "une image au hasard"},
"setSpriteRobot":function(d){return "une image de robot"},
"setSpriteShowK1":function(d){return "montrer"},
"setSpriteSpacebot":function(d){return "une image de robot de l'espace"},
"setSpriteSoccerGirl":function(d){return "une image de joueuse de football"},
"setSpriteSoccerBoy":function(d){return "une image de joueur de football"},
"setSpriteSquirrel":function(d){return "une image d'écureuil"},
"setSpriteTennisGirl":function(d){return "en une image de Mademoiselle Tennis"},
"setSpriteTennisBoy":function(d){return "une image de joueur de tennis"},
"setSpriteUnicorn":function(d){return "une image de licorne"},
"setSpriteWitch":function(d){return "une image de sorcier"},
"setSpriteWizard":function(d){return "une image de sorcier"},
"setSpritePositionTooltip":function(d){return "Déplace instantanément un acteur à l'emplacement spécifié."},
"setSpriteK1Tooltip":function(d){return "Affiche ou masque l'acteur spécifié."},
"setSpriteTooltip":function(d){return "Définit l'image de l'acteur"},
"setSpriteSizeRandom":function(d){return "à une taille au hasard"},
"setSpriteSizeVerySmall":function(d){return "à une très petite taille"},
"setSpriteSizeSmall":function(d){return "à une petite taille"},
"setSpriteSizeNormal":function(d){return "à une taille normale"},
"setSpriteSizeLarge":function(d){return "à une grande taille"},
"setSpriteSizeVeryLarge":function(d){return "à une très grande taille"},
"setSpriteSizeTooltip":function(d){return "Définit la taille d'un acteur"},
"setSpriteSpeedRandom":function(d){return "une vitesse aléatoire"},
"setSpriteSpeedVerySlow":function(d){return "une vitesse très lente"},
"setSpriteSpeedSlow":function(d){return "une vitesse lente"},
"setSpriteSpeedNormal":function(d){return "une vitesse normale"},
"setSpriteSpeedFast":function(d){return "une vitesse rapide"},
"setSpriteSpeedVeryFast":function(d){return "une vitesse très rapide"},
"setSpriteSpeedTooltip":function(d){return "Définit la vitesse d'un acteur"},
"setSpriteZombie":function(d){return "vers une image de zombie"},
"shareStudioTwitter":function(d){return "Découvrez l'histoire que j'ai faite. Je l'ai écrit moi-même avec @codeorg"},
"shareGame":function(d){return "Partagez votre histoire :"},
"showCoordinates":function(d){return "afficher les coordonnées"},
"showCoordinatesTooltip":function(d){return "montrer les coordonnées du protagoniste sur l'écran"},
"showTitleScreen":function(d){return "afficher l'écran titre"},
"showTitleScreenTitle":function(d){return "titre"},
"showTitleScreenText":function(d){return "texte"},
"showTSDefTitle":function(d){return "taper le titre ici"},
"showTSDefText":function(d){return "taper le texte ici"},
"showTitleScreenTooltip":function(d){return "Afficher un écran titre avec le titre et le texte correspondants."},
"size":function(d){return "taille"},
"setSprite":function(d){return "définir"},
"setSpriteN":function(d){return "définir l'acteur "+appLocale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "crunch"},
"soundGoal1":function(d){return "objectif 1"},
"soundGoal2":function(d){return "objectif 2"},
"soundHit":function(d){return "touché"},
"soundLosePoint":function(d){return "Perdre un point"},
"soundLosePoint2":function(d){return "perdre un point 2"},
"soundRetro":function(d){return "retro"},
"soundRubber":function(d){return "caoutchouc"},
"soundSlap":function(d){return "gifler"},
"soundWinPoint":function(d){return "point décisif"},
"soundWinPoint2":function(d){return "point décisif 2"},
"soundWood":function(d){return "bois"},
"speed":function(d){return "vitesse"},
"startSetValue":function(d){return "démarrer (fonction)"},
"startSetVars":function(d){return "variables_jeu (titre, sous-titre, arrière-plan, cible, danger, joueur)"},
"startSetFuncs":function(d){return "game_funcs (mise à jour-cible, mise à jour-danger, mise à jour lecteur, entrent en collision?, à l'écran?)"},
"stopSprite":function(d){return "arrêter"},
"stopSpriteN":function(d){return "stopper l'acteur "+appLocale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Arrête le mouvement d'un acteur."},
"throwSprite":function(d){return "jeter"},
"throwSpriteN":function(d){return "l'acteur "+appLocale.v(d,"spriteIndex")+" lance"},
"throwTooltip":function(d){return "Lance un projectile depuis l'acteur spécifié."},
"vanish":function(d){return "faire disparaître"},
"vanishActorN":function(d){return "faire disparaître l'acteur "+appLocale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "Fait disparaître l'acteur."},
"waitFor":function(d){return "Attendre"},
"waitSeconds":function(d){return "secondes"},
"waitForClick":function(d){return "attendre le clic"},
"waitForRandom":function(d){return "attendre un événement aléatoire"},
"waitForHalfSecond":function(d){return "attendre une demi-seconde"},
"waitFor1Second":function(d){return "attendre 1 seconde"},
"waitFor2Seconds":function(d){return "attendre 2 secondes"},
"waitFor5Seconds":function(d){return "attendre 5 secondes"},
"waitFor10Seconds":function(d){return "attendre 10 secondes"},
"waitParamsTooltip":function(d){return "Attend un nombre de secondes donné ou utilise 0 pour attendre jusqu'au clic."},
"waitTooltip":function(d){return "Attend un temps donné ou jusqu'au clic."},
"whenArrowDown":function(d){return "flèche vers le bas"},
"whenArrowLeft":function(d){return "flèche vers la gauche"},
"whenArrowRight":function(d){return "flèche vers la droite"},
"whenArrowUp":function(d){return "flèche vers le haut"},
"whenArrowTooltip":function(d){return "Exécuter les actions ci-dessous quand on appuie sur la touche fléchée spécifiée."},
"whenDown":function(d){return "quand flèche en bas"},
"whenDownTooltip":function(d){return "Exécute les actions ci-dessous quand on presse la touche 'flèche en bas'."},
"whenGameStarts":function(d){return "Quand l'histoire commence"},
"whenGameStartsTooltip":function(d){return "Exécuter les actions ci-dessous lorsque l'histoire commence."},
"whenLeft":function(d){return "quand flèche à gauche"},
"whenLeftTooltip":function(d){return "Exécute les actions ci-dessous quand on presse la touche 'flèche à gauche'."},
"whenRight":function(d){return "quand flèche à droite"},
"whenRightTooltip":function(d){return "Exécute les actions ci-dessous quand on presse la touche 'flèche à droite'."},
"whenSpriteClicked":function(d){return "quand on clique sur un acteur"},
"whenSpriteClickedN":function(d){return "quand on clique sur l'acteur "+appLocale.v(d,"spriteIndex")},
"whenSpriteClickedTooltip":function(d){return "Exécuter les actions ci-dessous lorsqu'on clique sur un acteur."},
"whenSpriteCollidedN":function(d){return "lorsque l'acteur "+appLocale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "Exécuter les actions ci-dessous quand un acteur touche un autre acteur."},
"whenSpriteCollidedWith":function(d){return "touche"},
"whenSpriteCollidedWithAnyActor":function(d){return "touche n'importe quel acteur"},
"whenSpriteCollidedWithAnyEdge":function(d){return "touche n'importe quel bord"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "touche n'importe quel projectile"},
"whenSpriteCollidedWithAnything":function(d){return "touche n'importe quoi"},
"whenSpriteCollidedWithN":function(d){return "touche acteur "+appLocale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "touche une boule de feu bleue"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "touche une boule de feu violette"},
"whenSpriteCollidedWithRedFireball":function(d){return "touche une boule de feu rouge"},
"whenSpriteCollidedWithYellowHearts":function(d){return "touche des coeurs jaunes"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "touche des coeurs violets"},
"whenSpriteCollidedWithRedHearts":function(d){return "touche des coeurs rouges"},
"whenSpriteCollidedWithBottomEdge":function(d){return "touche le bord du bas"},
"whenSpriteCollidedWithLeftEdge":function(d){return "touche le bord gauche"},
"whenSpriteCollidedWithRightEdge":function(d){return "touche le bord droit"},
"whenSpriteCollidedWithTopEdge":function(d){return "touche le bord du haut"},
"whenUp":function(d){return "quand flèche en haut"},
"whenUpTooltip":function(d){return "Exécute les actions ci-dessous quand on presse la touche 'flèche en haut'."},
"yes":function(d){return "Oui"}};