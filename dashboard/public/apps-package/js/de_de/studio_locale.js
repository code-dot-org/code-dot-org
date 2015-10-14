var studio_locale = {lc:{"ar":function(n){
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
v:function(d,k){studio_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){studio_locale.c(d,k);return d[k] in p?p[d[k]]:(k=studio_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){studio_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).studio_locale = {
"actor":function(d){return "Schauspieler"},
"addCharacter":function(d){return "add a"},
"addCharacterTooltip":function(d){return "Add a character to the scene."},
"alienInvasion":function(d){return "Alieninvasion!"},
"backgroundBlack":function(d){return "schwarz"},
"backgroundCave":function(d){return "Höhle"},
"backgroundCloudy":function(d){return "bewölkt"},
"backgroundHardcourt":function(d){return "Hardplatz"},
"backgroundNight":function(d){return "Nacht"},
"backgroundUnderwater":function(d){return "Unterwasser"},
"backgroundCity":function(d){return "Stadt"},
"backgroundDesert":function(d){return "Wüste"},
"backgroundRainbow":function(d){return "Regenbogen"},
"backgroundSoccer":function(d){return "Fußball"},
"backgroundSpace":function(d){return "Weltall"},
"backgroundTennis":function(d){return "Tennis"},
"backgroundWinter":function(d){return "Winter"},
"catActions":function(d){return "Aktionen"},
"catControl":function(d){return "Schleifen"},
"catEvents":function(d){return "Ereignisse"},
"catLogic":function(d){return "Logik"},
"catMath":function(d){return "Mathematik"},
"catProcedures":function(d){return "Funktionen"},
"catText":function(d){return "Text"},
"catVariables":function(d){return "Variablen"},
"changeScoreTooltip":function(d){return "Addiere oder subtrahiere einen Punkt von der Punktzahl."},
"changeScoreTooltipK1":function(d){return "Addiere einen Punkt zu der Punktzahl."},
"continue":function(d){return "Weiter"},
"decrementPlayerScore":function(d){return "Punkt abziehen"},
"defaultSayText":function(d){return "Hier eingeben"},
"dropletBlock_addCharacter_description":function(d){return "Add a character to the scene."},
"dropletBlock_addCharacter_param0":function(d){return "type"},
"dropletBlock_addCharacter_param0_description":function(d){return "The type of the character to be added ('random', 'man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_changeScore_description":function(d){return "Füge Punkte zu der Punktzahl hinzu."},
"dropletBlock_changeScore_param0":function(d){return "Punktestand"},
"dropletBlock_changeScore_param0_description":function(d){return "The value to add to the score (negative values will reduce the score)."},
"dropletBlock_moveRight_description":function(d){return "Moves the character to the right."},
"dropletBlock_moveUp_description":function(d){return "Moves the character up."},
"dropletBlock_moveDown_description":function(d){return "Moves the character down."},
"dropletBlock_moveLeft_description":function(d){return "Moves the character left."},
"dropletBlock_moveSlow_description":function(d){return "Changes a set of characters to move slowly."},
"dropletBlock_moveSlow_param0":function(d){return "type"},
"dropletBlock_moveSlow_param0_description":function(d){return "The type of characters to be changed ('random', 'man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_moveNormal_description":function(d){return "Changes a set of characters to move at a normal speed."},
"dropletBlock_moveNormal_param0":function(d){return "type"},
"dropletBlock_moveNormal_param0_description":function(d){return "The type of characters to be changed ('random', 'man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_moveFast_description":function(d){return "Changes a set of characters to move quickly."},
"dropletBlock_moveFast_param0":function(d){return "type"},
"dropletBlock_moveFast_param0_description":function(d){return "The type of characters to be changed ('random', 'man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_playSound_description":function(d){return "Das ausgewählte Geräusch abspielen."},
"dropletBlock_playSound_param0":function(d){return "sound"},
"dropletBlock_playSound_param0_description":function(d){return "The name of the sound to play."},
"dropletBlock_setBackground_description":function(d){return "Hintergrundbild setzen"},
"dropletBlock_setBackground_param0":function(d){return "image"},
"dropletBlock_setBackground_param0_description":function(d){return "The name of the background theme ('background1', 'background2', or 'background3')."},
"dropletBlock_setBot_description":function(d){return "Changes the active bot."},
"dropletBlock_setBot_param0":function(d){return "image"},
"dropletBlock_setBot_param0_description":function(d){return "The name of the bot image ('random', 'bot1', or 'bot2')."},
"dropletBlock_setBotSpeed_description":function(d){return "Sets the bot speed."},
"dropletBlock_setBotSpeed_param0":function(d){return "Geschwindigkeit"},
"dropletBlock_setBotSpeed_param0_description":function(d){return "The speed value ('random', 'slow', 'normal', or 'fast')."},
"dropletBlock_setSpriteEmotion_description":function(d){return "Legt die Stimmung der Figur fest"},
"dropletBlock_setSpritePosition_description":function(d){return "Bewegt das Element sofort an die angegebene Position."},
"dropletBlock_setSpriteSpeed_description":function(d){return "Legt die Geschwindigkeit einer Figur fest."},
"dropletBlock_setSprite_description":function(d){return "Legt das Aussehen der Figur fest"},
"dropletBlock_setSprite_param0":function(d){return "index"},
"dropletBlock_setSprite_param0_description":function(d){return "The index (starting at 0) indicating which actor should change."},
"dropletBlock_setSprite_param1":function(d){return "image"},
"dropletBlock_setSprite_param1_description":function(d){return "The name of the actor image."},
"dropletBlock_setToChase_description":function(d){return "Changes a set of characters to chase the bot."},
"dropletBlock_setToChase_param0":function(d){return "type"},
"dropletBlock_setToChase_param0_description":function(d){return "The type of characters to be changed ('random', 'man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_setToFlee_description":function(d){return "Changes a set of characters to flee from the bot."},
"dropletBlock_setToFlee_param0":function(d){return "type"},
"dropletBlock_setToFlee_param0_description":function(d){return "The type of characters to be changed ('random', 'man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_setToRoam_description":function(d){return "Changes a set of characters to roam freely."},
"dropletBlock_setToRoam_param0":function(d){return "type"},
"dropletBlock_setToRoam_param0_description":function(d){return "The type of characters to be changed ('random', 'man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_setToStop_description":function(d){return "Changes a set of characters to stop moving."},
"dropletBlock_setToStop_param0":function(d){return "type"},
"dropletBlock_setToStop_param0_description":function(d){return "The type of characters to be changed ('random', 'man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_setMap_description":function(d){return "Changes the map in the scene."},
"dropletBlock_setMap_param0":function(d){return "name"},
"dropletBlock_setMap_param0_description":function(d){return "The name of the map ('random', 'blank', 'circle', 'circle2', 'horizontal', 'grid', or 'blobs')."},
"dropletBlock_throw_description":function(d){return "Lässt die angegebene Figur ein Geschoss werfen."},
"dropletBlock_vanish_description":function(d){return "Lässt die Figur verschwinden."},
"dropletBlock_whenDown_description":function(d){return "This function executes when the down button is pressed."},
"dropletBlock_whenLeft_description":function(d){return "This function executes when the left button is pressed."},
"dropletBlock_whenRight_description":function(d){return "This function executes when the right button is pressed."},
"dropletBlock_whenTouchCharacter_description":function(d){return "This function executes when the character touches any character."},
"dropletBlock_whenTouchObstacle_description":function(d){return "This function executes when the character touches any obstacle."},
"dropletBlock_whenTouchMan_description":function(d){return "This function executes when the character touches man characters."},
"dropletBlock_whenTouchPilot_description":function(d){return "This function executes when the character touches pilot characters."},
"dropletBlock_whenTouchPig_description":function(d){return "This function executes when the character touches pig characters."},
"dropletBlock_whenTouchBird_description":function(d){return "This function executes when the character touches bird characters."},
"dropletBlock_whenTouchMouse_description":function(d){return "This function executes when the character touches mouse characters."},
"dropletBlock_whenTouchRoo_description":function(d){return "This function executes when the character touches roo characters."},
"dropletBlock_whenTouchSpider_description":function(d){return "This function executes when the character touches spider characters."},
"dropletBlock_whenUp_description":function(d){return "This function executes when the up button is pressed."},
"emotion":function(d){return "Stimmung"},
"finalLevel":function(d){return "Glückwunsch! Du hast die letzte Aufgabe abgeschlossen."},
"for":function(d){return "für"},
"hello":function(d){return "Hallo"},
"helloWorld":function(d){return "Hallo Welt!"},
"incrementPlayerScore":function(d){return "Punkt"},
"itemBlueFireball":function(d){return "Blauer Feuerball"},
"itemPurpleFireball":function(d){return "Lila Feuerball"},
"itemRedFireball":function(d){return "Roter Feuerball"},
"itemYellowHearts":function(d){return "gelbe Herzen"},
"itemPurpleHearts":function(d){return "lila Herzen"},
"itemRedHearts":function(d){return "rote Herzen"},
"itemRandom":function(d){return "zufällig"},
"itemAnna":function(d){return "Haken"},
"itemElsa":function(d){return "funkeln"},
"itemHiro":function(d){return "Mikrobots"},
"itemBaymax":function(d){return "Rakete"},
"itemRapunzel":function(d){return "Kochtopf"},
"itemCherry":function(d){return "Kirsche"},
"itemIce":function(d){return "Eis"},
"itemDuck":function(d){return "Ente"},
"itemMan":function(d){return "man"},
"itemPilot":function(d){return "pilot"},
"itemPig":function(d){return "pig"},
"itemBird":function(d){return "bird"},
"itemMouse":function(d){return "mouse"},
"itemRoo":function(d){return "roo"},
"itemSpider":function(d){return "spider"},
"makeProjectileDisappear":function(d){return "verschwinden"},
"makeProjectileBounce":function(d){return "abprallen"},
"makeProjectileBlueFireball":function(d){return "erzeuge blauen Feuerball"},
"makeProjectilePurpleFireball":function(d){return "erzeuge lila Feuerball"},
"makeProjectileRedFireball":function(d){return "erzeuge roten Feuerball"},
"makeProjectileYellowHearts":function(d){return "erzeuge gelbe Herzen"},
"makeProjectilePurpleHearts":function(d){return "erzeuge lila Herzen"},
"makeProjectileRedHearts":function(d){return "erzeuge rote Herzen"},
"makeProjectileTooltip":function(d){return "Lasse das kollidierende Projektil verschwinden oder abprallen."},
"makeYourOwn":function(d){return "Erstelle deine eigene Spiellabor-App"},
"moveDirectionDown":function(d){return "runter"},
"moveDirectionLeft":function(d){return "links"},
"moveDirectionRight":function(d){return "rechts"},
"moveDirectionUp":function(d){return "hoch"},
"moveDirectionRandom":function(d){return "zufällig"},
"moveDistance25":function(d){return "25 Pixel"},
"moveDistance50":function(d){return "50 Pixel"},
"moveDistance100":function(d){return "100 Pixel"},
"moveDistance200":function(d){return "200 Pixel"},
"moveDistance400":function(d){return "400 Pixel"},
"moveDistancePixels":function(d){return "Pixel"},
"moveDistanceRandom":function(d){return "Zufällige Pixel"},
"moveDistanceTooltip":function(d){return "Verschiebe einen Figur um eine bestimmte Entfernung in eine bestimmte Richtung."},
"moveSprite":function(d){return "bewegen"},
"moveSpriteN":function(d){return "bewege Figur "+studio_locale.v(d,"spriteIndex")},
"toXY":function(d){return "zu x,y"},
"moveDown":function(d){return "nach unten bewegen"},
"moveDownTooltip":function(d){return "Bewege ein Element nach unten."},
"moveLeft":function(d){return "nach links bewegen"},
"moveLeftTooltip":function(d){return "Bewege ein Element nach links."},
"moveRight":function(d){return "nach rechts bewegen"},
"moveRightTooltip":function(d){return "Bewege ein Element nach rechts."},
"moveUp":function(d){return "nach oben bewegen"},
"moveUpTooltip":function(d){return "Bewege ein Element nach oben."},
"moveTooltip":function(d){return "Bewege ein Element."},
"nextLevel":function(d){return "Glückwunsch! Du hast diese Aufgabe abgeschlossen."},
"no":function(d){return "Nein"},
"numBlocksNeeded":function(d){return "Diese Aufgabe kann mit Bausteinen %1 gelöst werden."},
"onEventTooltip":function(d){return "Führe den Code als Reaktion zu einem bestimmten Ereignis aus."},
"ouchExclamation":function(d){return "Autsch!"},
"playSoundCrunch":function(d){return "spiele Knirsch Geräusch"},
"playSoundGoal1":function(d){return "spiele Tor1 Geräusch"},
"playSoundGoal2":function(d){return "spiele Tor2 Geräusch"},
"playSoundHit":function(d){return "spiele Treffer Geräusch"},
"playSoundLosePoint":function(d){return "spiele Punktverlust Geräusch"},
"playSoundLosePoint2":function(d){return "spiele alternatives Punktverlust Geräusch"},
"playSoundRetro":function(d){return "spiele Retro Geräusch"},
"playSoundRubber":function(d){return "spiele Gummi Geräusch"},
"playSoundSlap":function(d){return "spiele Schlag Geräusch"},
"playSoundTooltip":function(d){return "Den ausgewählten Ton abspielen."},
"playSoundWinPoint":function(d){return "spiele Gewinn Geräusch"},
"playSoundWinPoint2":function(d){return "spiele alternatives Gewinn Geräusch"},
"playSoundWood":function(d){return "spiele Holz Geräusch"},
"positionOutTopLeft":function(d){return "zur oberen linken Position"},
"positionOutTopRight":function(d){return "zur oberen rechten Position"},
"positionTopOutLeft":function(d){return "zur oberen, äußeren linken Position"},
"positionTopLeft":function(d){return "an die obere linke Position"},
"positionTopCenter":function(d){return "an die obere mittlere Position"},
"positionTopRight":function(d){return "nach oben rechts"},
"positionTopOutRight":function(d){return "nach oben rechts außen"},
"positionMiddleLeft":function(d){return "in die Mitte links"},
"positionMiddleCenter":function(d){return "in die Mitte"},
"positionMiddleRight":function(d){return "in die Mitte rechts"},
"positionBottomOutLeft":function(d){return "nach unten links außen"},
"positionBottomLeft":function(d){return "nach unten links"},
"positionBottomCenter":function(d){return "nach unten in die Mitte"},
"positionBottomRight":function(d){return "nach unten rechts"},
"positionBottomOutRight":function(d){return "nach unten rechts außen"},
"positionOutBottomLeft":function(d){return "In der unteren linken Ecke"},
"positionOutBottomRight":function(d){return "In der unteren rechten Ecke"},
"positionRandom":function(d){return "Zu zufälliger Position"},
"projectileBlueFireball":function(d){return "Blauer Feuerball"},
"projectilePurpleFireball":function(d){return "Lila Feuerball"},
"projectileRedFireball":function(d){return "Roter Feuerball"},
"projectileYellowHearts":function(d){return "gelbe Herzen"},
"projectilePurpleHearts":function(d){return "lila Herzen"},
"projectileRedHearts":function(d){return "rote Herzen"},
"projectileRandom":function(d){return "zufällig"},
"projectileAnna":function(d){return "Haken"},
"projectileElsa":function(d){return "funkeln"},
"projectileHiro":function(d){return "Mikrobots"},
"projectileBaymax":function(d){return "Rakete"},
"projectileRapunzel":function(d){return "Kochtopf"},
"projectileCherry":function(d){return "Kirsche"},
"projectileIce":function(d){return "Eis"},
"projectileDuck":function(d){return "Ente"},
"reinfFeedbackMsg":function(d){return "Du kannst die Schaltfläche \"Weiter spielen\" drücken, um deine Geschichte weiterzuspielen."},
"repeatForever":function(d){return "ewig wiederholen"},
"repeatDo":function(d){return "machen"},
"repeatForeverTooltip":function(d){return "Führt die Aktionen innerhalb des Bausteins wiederholend aus."},
"saySprite":function(d){return "sagen"},
"saySpriteN":function(d){return "Element "+studio_locale.v(d,"spriteIndex")+" sage"},
"saySpriteTooltip":function(d){return "Blendet eine Sprechblase, mit dem eingegebenen Text, ein."},
"saySpriteChoices_0":function(d){return "Hallo."},
"saySpriteChoices_1":function(d){return "Hallo zusammen."},
"saySpriteChoices_2":function(d){return "Wie geht es dir?"},
"saySpriteChoices_3":function(d){return "Guten Morgen"},
"saySpriteChoices_4":function(d){return "Guten Tag"},
"saySpriteChoices_5":function(d){return "Gute Nacht"},
"saySpriteChoices_6":function(d){return "Guten Abend"},
"saySpriteChoices_7":function(d){return "Was gibt's neues?"},
"saySpriteChoices_8":function(d){return "Was?"},
"saySpriteChoices_9":function(d){return "Wo?"},
"saySpriteChoices_10":function(d){return "Wann?"},
"saySpriteChoices_11":function(d){return "Gut."},
"saySpriteChoices_12":function(d){return "Super!"},
"saySpriteChoices_13":function(d){return "Alles gut."},
"saySpriteChoices_14":function(d){return "Nicht schlecht."},
"saySpriteChoices_15":function(d){return "Viel Glück."},
"saySpriteChoices_16":function(d){return "Ja"},
"saySpriteChoices_17":function(d){return "Nein"},
"saySpriteChoices_18":function(d){return "Okay"},
"saySpriteChoices_19":function(d){return "Guter Wurf!"},
"saySpriteChoices_20":function(d){return "Schönen Tag noch."},
"saySpriteChoices_21":function(d){return "Tschüss."},
"saySpriteChoices_22":function(d){return "Ich komme gleich zurück."},
"saySpriteChoices_23":function(d){return "Bis morgen!"},
"saySpriteChoices_24":function(d){return "Bis später!"},
"saySpriteChoices_25":function(d){return "Pass auf dich auf!"},
"saySpriteChoices_26":function(d){return "Genieße es!"},
"saySpriteChoices_27":function(d){return "Ich muss gehen."},
"saySpriteChoices_28":function(d){return "Wollen wir Freunde sein?"},
"saySpriteChoices_29":function(d){return "Gute Arbeit!"},
"saySpriteChoices_30":function(d){return "Woo Hoo!"},
"saySpriteChoices_31":function(d){return "Yay!"},
"saySpriteChoices_32":function(d){return "Schön dich kennenzulernen."},
"saySpriteChoices_33":function(d){return "Alles gut!"},
"saySpriteChoices_34":function(d){return "Vielen Dank"},
"saySpriteChoices_35":function(d){return "Nein danke"},
"saySpriteChoices_36":function(d){return "Aaaaaah!"},
"saySpriteChoices_37":function(d){return "Macht nichts"},
"saySpriteChoices_38":function(d){return "Heute"},
"saySpriteChoices_39":function(d){return "Morgen"},
"saySpriteChoices_40":function(d){return "Gestern"},
"saySpriteChoices_41":function(d){return "Ich habe dich gefunden!"},
"saySpriteChoices_42":function(d){return "Du hast mich gefunden!"},
"saySpriteChoices_43":function(d){return "10, 9, 8, 7, 6, 5, 4, 3, 2, 1!"},
"saySpriteChoices_44":function(d){return "Du bist großartig!"},
"saySpriteChoices_45":function(d){return "Du bist lustig!"},
"saySpriteChoices_46":function(d){return "Du bist dumm! "},
"saySpriteChoices_47":function(d){return "Du bist ein guter Freund!"},
"saySpriteChoices_48":function(d){return "Pass auf!"},
"saySpriteChoices_49":function(d){return "Ducke dich!"},
"saySpriteChoices_50":function(d){return "Hab' dich!"},
"saySpriteChoices_51":function(d){return "Ow!"},
"saySpriteChoices_52":function(d){return "'Tschuldigung!"},
"saySpriteChoices_53":function(d){return "Vorsichtig!"},
"saySpriteChoices_54":function(d){return "Whoa!"},
"saySpriteChoices_55":function(d){return "Oops!"},
"saySpriteChoices_56":function(d){return "Du hast mich gleich!"},
"saySpriteChoices_57":function(d){return "Netter Versuch!"},
"saySpriteChoices_58":function(d){return "Du kannst mich nicht kriegen!"},
"scoreText":function(d){return "Punktestand: "+studio_locale.v(d,"playerScore")},
"setActivityRandom":function(d){return "set activity to random for"},
"setActivityRoam":function(d){return "set activity to roam for"},
"setActivityChase":function(d){return "set activity to chase for"},
"setActivityFlee":function(d){return "set activity to flee for"},
"setActivityNone":function(d){return "set activity to none for"},
"setActivityTooltip":function(d){return "Sets the activity for a set of items"},
"setBackground":function(d){return "Hintergrund setzen"},
"setBackgroundRandom":function(d){return "zufälligen Hintergrund setzen"},
"setBackgroundBlack":function(d){return "schwarzen Hintergrund setzen"},
"setBackgroundCave":function(d){return "Höhle als Hintergrund setzen"},
"setBackgroundCloudy":function(d){return "Wolkigen Hintergrund setzen"},
"setBackgroundHardcourt":function(d){return "Tennisplatz als Hintergrund setzen"},
"setBackgroundNight":function(d){return "Nacht als Hintergrund setzen"},
"setBackgroundUnderwater":function(d){return "Unterwasser als Hintergrund setzen"},
"setBackgroundCity":function(d){return "Setze Hintergrund Stadt"},
"setBackgroundDesert":function(d){return "Setze Hintergrund Wüste"},
"setBackgroundRainbow":function(d){return "Setze Hintergrund Regenbogen"},
"setBackgroundSoccer":function(d){return "Setze Hintegrund Fussball"},
"setBackgroundSpace":function(d){return "Setze Hintergrund Weltall"},
"setBackgroundTennis":function(d){return "Setze Hintergrund Tennis"},
"setBackgroundWinter":function(d){return "Setze Hintergrund Winter"},
"setBackgroundLeafy":function(d){return "lege blättrigen Hintergrund fest"},
"setBackgroundGrassy":function(d){return "lege grasigen Hintergrund fest"},
"setBackgroundFlower":function(d){return "lege blumigen Hintergrund fest"},
"setBackgroundTile":function(d){return "lege gefliesten Hintergrund fest"},
"setBackgroundIcy":function(d){return "lege eisigen Hintergrund fest"},
"setBackgroundSnowy":function(d){return "lege verschneiten Hintergrund fest"},
"setBackgroundForest":function(d){return "set forest background"},
"setBackgroundSnow":function(d){return "set snow background"},
"setBackgroundShip":function(d){return "set ship background"},
"setBackgroundTooltip":function(d){return "Hintergrundbild setzen"},
"setEnemySpeed":function(d){return "Feindliche Geschwindigkeits Einstellung"},
"setItemSpeedSet":function(d){return "set type"},
"setItemSpeedTooltip":function(d){return "Sets the speed for a set of items"},
"setPlayerSpeed":function(d){return "Spieler Geschwindigkeit einstellen"},
"setScoreText":function(d){return "Punktestand setzen"},
"setScoreTextTooltip":function(d){return "Setzt den Text, welcher im Punktestand-Bereich angezeigt werden soll."},
"setSpriteEmotionAngry":function(d){return "wütende Stimmung"},
"setSpriteEmotionHappy":function(d){return "fröhlich machen"},
"setSpriteEmotionNormal":function(d){return "in normale Stimmung versetzen"},
"setSpriteEmotionRandom":function(d){return "in zufällige Stimmung versetzen"},
"setSpriteEmotionSad":function(d){return "traurig machen"},
"setSpriteEmotionTooltip":function(d){return "Legt die Stimmung der Figur fest"},
"setSpriteAlien":function(d){return "zu einem Außerirdischen machen"},
"setSpriteBat":function(d){return "zeige Fledermaus-Bild"},
"setSpriteBird":function(d){return "zeige Vogel-Bild"},
"setSpriteCat":function(d){return "zeige Katzen-Bild"},
"setSpriteCaveBoy":function(d){return "zu einem Höhlenjungen machen"},
"setSpriteCaveGirl":function(d){return "zu einem Höhlenmädchen machen"},
"setSpriteDinosaur":function(d){return "zeige Dinosaurier-Bild"},
"setSpriteDog":function(d){return "zeige Hund-Bild"},
"setSpriteDragon":function(d){return "zeige Drachen-Bild"},
"setSpriteGhost":function(d){return "zu einem Gespenst machen"},
"setSpriteHidden":function(d){return "verstecke Bild"},
"setSpriteHideK1":function(d){return "ausblenden"},
"setSpriteAnna":function(d){return "zu einem Bild von Anna"},
"setSpriteElsa":function(d){return "zu einem Bild von Elsa"},
"setSpriteHiro":function(d){return "zum Hiro Bild hinzu"},
"setSpriteBaymax":function(d){return "zum babymax Bild hinzu"},
"setSpriteRapunzel":function(d){return "zum Rapunzel Bild hinzu"},
"setSpriteKnight":function(d){return "zu einem Ritter machen"},
"setSpriteMonster":function(d){return "zu einem Monster machen"},
"setSpriteNinja":function(d){return "zu einem Ninja machen"},
"setSpriteOctopus":function(d){return "zeige Kraken-Bild"},
"setSpritePenguin":function(d){return "zeige Pinguin-Bild"},
"setSpritePirate":function(d){return "zu einem Piraten machen"},
"setSpritePrincess":function(d){return "zu einer Prinzessin machen"},
"setSpriteRandom":function(d){return "zeige zufälliges Bild"},
"setSpriteRobot":function(d){return "zu einem Roboter machen"},
"setSpriteShowK1":function(d){return "einblenden"},
"setSpriteSpacebot":function(d){return "zu einem Spacebot machen"},
"setSpriteSoccerGirl":function(d){return "zu einer Fussballspielerin machen"},
"setSpriteSoccerBoy":function(d){return "zu einem Fussballspieler machen"},
"setSpriteSquirrel":function(d){return "zeige Eichhörnchen-Bild"},
"setSpriteTennisGirl":function(d){return "zu einer Tennisspielerin machen"},
"setSpriteTennisBoy":function(d){return "zu einem Tennisspieler machen"},
"setSpriteUnicorn":function(d){return "zum Einhorn machen"},
"setSpriteWitch":function(d){return "zeige Hexen-Bild"},
"setSpriteWizard":function(d){return "zeige Zauberer-Bild"},
"setSpritePositionTooltip":function(d){return "Bewegt das Element sofort an die angegebene Position."},
"setSpriteK1Tooltip":function(d){return "Zeigt oder verbirgt den angegebenen Schauspieler."},
"setSpriteTooltip":function(d){return "Legt das Aussehen der Figur fest"},
"setSpriteSizeRandom":function(d){return "zufällige Größe festlegen"},
"setSpriteSizeVerySmall":function(d){return "auf eine sehr kleine Größe"},
"setSpriteSizeSmall":function(d){return "auf eine kleine Größe"},
"setSpriteSizeNormal":function(d){return "auf eine normale Größe"},
"setSpriteSizeLarge":function(d){return "auf eine große Größe"},
"setSpriteSizeVeryLarge":function(d){return "auf eine sehr große Größe"},
"setSpriteSizeTooltip":function(d){return "Setzt die Größe eines Elements"},
"setSpriteSpeedRandom":function(d){return "auf zufällige Geschwindigkeit wechseln"},
"setSpriteSpeedVerySlow":function(d){return "auf sehr langsame Geschwindigkeit wechseln"},
"setSpriteSpeedSlow":function(d){return "auf langsame Geschwindigkeit wechseln"},
"setSpriteSpeedNormal":function(d){return "auf normale Geschwindigkeit wechseln"},
"setSpriteSpeedFast":function(d){return "auf schnelle Geschwindigkeit wechseln"},
"setSpriteSpeedVeryFast":function(d){return "auf sehr schnelle Geschwindigkeit wechseln"},
"setSpriteSpeedTooltip":function(d){return "Legt die Geschwindigkeit eines Elements fest"},
"setSpriteZombie":function(d){return "zu einem Zombie Bild"},
"setSpriteBot1":function(d){return "to bot1"},
"setSpriteBot2":function(d){return "to bot2"},
"setMap":function(d){return "set map"},
"setMapRandom":function(d){return "set random map"},
"setMapBlank":function(d){return "set blank map"},
"setMapCircle":function(d){return "set circle map"},
"setMapCircle2":function(d){return "set circle2 map"},
"setMapHorizontal":function(d){return "set horizontal map"},
"setMapGrid":function(d){return "set grid map"},
"setMapBlobs":function(d){return "set blobs map"},
"setMapTooltip":function(d){return "Changes the map in the scene"},
"shareStudioTwitter":function(d){return "Schau Dir das Spiel an, das ich gemacht habe. Ich habe es selbst geschrieben, mit @codeorg"},
"shareGame":function(d){return "Teile dein Spiel:"},
"showCoordinates":function(d){return "Koordinaten anzeigen"},
"showCoordinatesTooltip":function(d){return "Die Koordinaten des Protagonisten anzeigen"},
"showTitleScreen":function(d){return "Titelbildschirm anzeigen"},
"showTitleScreenTitle":function(d){return "Titel"},
"showTitleScreenText":function(d){return "Text"},
"showTSDefTitle":function(d){return "Titel hier eingeben"},
"showTSDefText":function(d){return "Text hier eingeben"},
"showTitleScreenTooltip":function(d){return "Zeigt einen Titelbildschirm mit dem dazugehörigen Titel und Text."},
"size":function(d){return "Größe"},
"setSprite":function(d){return "setze"},
"setSpriteN":function(d){return "Figur festlegen "+studio_locale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "knirschen"},
"soundGoal1":function(d){return "Tor 1"},
"soundGoal2":function(d){return "Tor 2"},
"soundHit":function(d){return "Treffer"},
"soundLosePoint":function(d){return "Punktverlust"},
"soundLosePoint2":function(d){return "Punktverlust 2"},
"soundRetro":function(d){return "Retro"},
"soundRubber":function(d){return "Radiergummi"},
"soundSlap":function(d){return "Schlag"},
"soundWinPoint":function(d){return "Punktgewinn"},
"soundWinPoint2":function(d){return "Punktgewinn 2"},
"soundWood":function(d){return "Holzton"},
"speed":function(d){return "Geschwindigkeit"},
"startSetValue":function(d){return "start (Funktion)"},
"startSetVars":function(d){return "Game_vars (Titel, Untertitel, Hintergrund, Ziel, Gefahr, Spieler)"},
"startSetFuncs":function(d){return "game_funcs (aktualisiere-Ziel, aktualisiere-Gefahr, aktualisiere-Spieler, kollidieren?, auf Bildschirm?)"},
"stopSprite":function(d){return "Stop"},
"stopSpriteN":function(d){return "stoppe Figur "+studio_locale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Stoppt die Bewegung einer Figur."},
"throwSprite":function(d){return "werfen"},
"throwSpriteN":function(d){return "Schauspieler "+studio_locale.v(d,"spriteIndex")+"-Wurf"},
"throwTooltip":function(d){return "Lässt die angegebene Figur ein Geschoss werfen."},
"vanish":function(d){return "verschwinden"},
"vanishActorN":function(d){return "verschwundener Schauspieler "+studio_locale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "Lässt die Figur verschwinden."},
"waitFor":function(d){return "warten auf"},
"waitSeconds":function(d){return "Sekunden"},
"waitForClick":function(d){return "Auf Klick warten"},
"waitForRandom":function(d){return "warte eine zufällige Zeit lang"},
"waitForHalfSecond":function(d){return "Eine halbe Sekunde warten"},
"waitFor1Second":function(d){return "1 Sekunde warten"},
"waitFor2Seconds":function(d){return "2 Sekunden warten"},
"waitFor5Seconds":function(d){return "5 Sekunden warten"},
"waitFor10Seconds":function(d){return "10 Sekunden warten"},
"waitParamsTooltip":function(d){return "Wartet eine bestimmte Anzahl an Sekunden oder auf einen Klick bei Angabe von 0."},
"waitTooltip":function(d){return "Wartet eine bestimmte Anzahl an Sekunden oder auf einen Klick."},
"whenArrowDown":function(d){return "Pfeil-nach-unten"},
"whenArrowLeft":function(d){return "Pfeil-nach-links"},
"whenArrowRight":function(d){return "Pfeil-nach-rechts"},
"whenArrowUp":function(d){return "Pfeil-nach-oben"},
"whenArrowTooltip":function(d){return "Führe die untenstehenden Aktionen aus wenn die entsprechende Pfeiltaste gedrückt wird."},
"whenDown":function(d){return "Wenn Pfeil-nach-unten"},
"whenDownTooltip":function(d){return "Führe die nachfolgenden Aktionen aus, wenn die Pfeil-runter-Taste gedrückt wird."},
"whenGameStarts":function(d){return "Wenn das Spiel beginnt"},
"whenGameStartsTooltip":function(d){return "Führe die nachfolgenden Aktionen aus, wenn die Geschichte beginnt."},
"whenLeft":function(d){return "Wenn Pfeil-nach-links"},
"whenLeftTooltip":function(d){return "Führe die nachfolgenden Aktionen aus, wenn die Pfeil-links-Taste gedrückt wird."},
"whenRight":function(d){return "Wenn Pfeil-nach-rechts"},
"whenRightTooltip":function(d){return "Führe die nachfolgenden Aktionen aus, wenn die Pfeil-rechts-Taste gedrückt wird."},
"whenSpriteClicked":function(d){return "Wenn die Figur geklickt wird"},
"whenSpriteClickedN":function(d){return "Wenn die Figur "+studio_locale.v(d,"spriteIndex")+" geklickt wird"},
"whenSpriteClickedTooltip":function(d){return "Führe die nachfolgenden Aktionen aus, wenn ein Darsteller angeklickt wird."},
"whenSpriteCollidedN":function(d){return "Wenn die Figur "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "Führe die unterstehenden Aktionen aus wenn eine Figure eine andere berührt."},
"whenSpriteCollidedWith":function(d){return "berührt"},
"whenSpriteCollidedWithAnyActor":function(d){return "Berührt jeden Schauspieler"},
"whenSpriteCollidedWithAnyEdge":function(d){return "berührt einen beliebigen Rand"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "berührt ein beliebiges Geschoss"},
"whenSpriteCollidedWithAnything":function(d){return "berührt irgendetwas"},
"whenSpriteCollidedWithN":function(d){return "berührt Schauspieler "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "berührt blauen Feuerball"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "berührt violetten Feuerball"},
"whenSpriteCollidedWithRedFireball":function(d){return "berührt roten Feuerball"},
"whenSpriteCollidedWithYellowHearts":function(d){return "berührt gelbes Herz"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "berührt violettes Herz"},
"whenSpriteCollidedWithRedHearts":function(d){return "berührt rotes Herz"},
"whenSpriteCollidedWithBottomEdge":function(d){return "Berührt unteren Rand"},
"whenSpriteCollidedWithLeftEdge":function(d){return "Berührt linken Rand"},
"whenSpriteCollidedWithRightEdge":function(d){return "berührt rechten Rand"},
"whenSpriteCollidedWithTopEdge":function(d){return "berührt oberen Rand"},
"whenTouchItem":function(d){return "when item touched"},
"whenTouchItemTooltip":function(d){return "Execute the actions below when the actor touches an item."},
"whenTouchWall":function(d){return "when wall touched"},
"whenTouchWallTooltip":function(d){return "Execute the actions below when the actor touches a wall."},
"whenUp":function(d){return "wenn Pfeil-nach-oben"},
"whenUpTooltip":function(d){return "Führe die nachfolgenden Aktionen aus, wenn die Pfeil-nach-oben-Taste gedrückt wird."},
"yes":function(d){return "Ja"},
"calloutPlaceCommandsHere":function(d){return "Place commands here"},
"calloutPlaceCommandsAtTop":function(d){return "Place commands to set up your game at the top"},
"calloutTypeCommandsHere":function(d){return "Type your commands here"},
"calloutCharactersMove":function(d){return "These new commands let you control how the characters move"},
"calloutPutCommandsTouchCharacter":function(d){return "Put a command here to have it happen when you touch a character"},
"calloutClickCategory":function(d){return "Click a category header to see commands in each category"},
"calloutTryOutNewCommands":function(d){return "Try out all the new commands you’ve unlocked"},
"failedHasSetSprite":function(d){return "Next time, set a character."},
"failedHasSetBotSpeed":function(d){return "Next time, set a bot speed."},
"failedTouchAllItems":function(d){return "Next time, get all the items."},
"failedScoreMinimum":function(d){return "Next time, reach the minimum score."},
"failedRemovedItemCount":function(d){return "Next time, get the right number of items."},
"failedSetActivity":function(d){return "Next time, set the correct character activity."}};