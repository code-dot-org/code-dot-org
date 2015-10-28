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
"actor":function(d){return "figur"},
"addCharacter":function(d){return "legg til en"},
"addCharacterTooltip":function(d){return "Legg til en figur til scenen."},
"alienInvasion":function(d){return "Romveseninvasjon!"},
"backgroundBlack":function(d){return "svart"},
"backgroundCave":function(d){return "hule"},
"backgroundCloudy":function(d){return "overskyet"},
"backgroundHardcourt":function(d){return "grusbane"},
"backgroundNight":function(d){return "natt"},
"backgroundUnderwater":function(d){return "undervanns"},
"backgroundCity":function(d){return "by"},
"backgroundDesert":function(d){return "ørken"},
"backgroundRainbow":function(d){return "regnbue"},
"backgroundSoccer":function(d){return "fotball"},
"backgroundSpace":function(d){return "verdensrommmet"},
"backgroundTennis":function(d){return "tennis"},
"backgroundWinter":function(d){return "vinter"},
"calloutPlaceCommandsHere":function(d){return "Place commands here"},
"calloutPlaceCommandsAtTop":function(d){return "Place commands to set up your game at the top"},
"calloutTypeCommandsHere":function(d){return "Type your commands here"},
"calloutCharactersMove":function(d){return "These new commands let you control how the characters move"},
"calloutPutCommandsTouchCharacter":function(d){return "Put a command here to have it happen when you touch a character"},
"calloutClickCategory":function(d){return "Click a category header to see commands in each category"},
"calloutTryOutNewCommands":function(d){return "Try out all the new commands you’ve unlocked"},
"catActions":function(d){return "Handlinger"},
"catControl":function(d){return "Løkker"},
"catEvents":function(d){return "Hendelser"},
"catLogic":function(d){return "Logikk"},
"catMath":function(d){return "Matematikk"},
"catProcedures":function(d){return "Funksjoner"},
"catText":function(d){return "tekst"},
"catVariables":function(d){return "Variabler"},
"changeScoreTooltip":function(d){return "Legge til eller fjerne et poeng fra poengsummen."},
"changeScoreTooltipK1":function(d){return "Legg til ett poeng til poengsummen."},
"continue":function(d){return "Fortsett"},
"decrementPlayerScore":function(d){return "fjern poeng"},
"defaultSayText":function(d){return "Skriv her"},
"dropletBlock_addCharacter_description":function(d){return "Legg til en figur til scenen."},
"dropletBlock_addCharacter_param0":function(d){return "type"},
"dropletBlock_addCharacter_param0_description":function(d){return "The type of the character to be added ('random', 'man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_changeScore_description":function(d){return "Legge til eller fjerne et poeng fra poengsummen."},
"dropletBlock_changeScore_param0":function(d){return "poengsum"},
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
"dropletBlock_playSound_description":function(d){return "Spill den valgte lyden."},
"dropletBlock_playSound_param0":function(d){return "sound"},
"dropletBlock_playSound_param0_description":function(d){return "The name of the sound to play."},
"dropletBlock_setBackground_description":function(d){return "Angir bakgrunnsbilde"},
"dropletBlock_setBackground_param0":function(d){return "image"},
"dropletBlock_setBackground_param0_description":function(d){return "The name of the background theme ('background1', 'background2', or 'background3')."},
"dropletBlock_setBot_description":function(d){return "Changes the active bot."},
"dropletBlock_setBot_param0":function(d){return "image"},
"dropletBlock_setBot_param0_description":function(d){return "The name of the bot image ('random', 'bot1', or 'bot2')."},
"dropletBlock_setBotSpeed_description":function(d){return "Sets the bot speed."},
"dropletBlock_setBotSpeed_param0":function(d){return "fart"},
"dropletBlock_setBotSpeed_param0_description":function(d){return "The speed value ('random', 'slow', 'normal', or 'fast')."},
"dropletBlock_setSpriteEmotion_description":function(d){return "Setter skuespillerens humør"},
"dropletBlock_setSpritePosition_description":function(d){return "Flytter en figur til den angitte plasseringen."},
"dropletBlock_setSpriteSpeed_description":function(d){return "Angir farten til en skuespiller"},
"dropletBlock_setSprite_description":function(d){return "Angir skuespiller bildet"},
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
"dropletBlock_throw_description":function(d){return "Kaster et prosjektil fra valgte figur."},
"dropletBlock_vanish_description":function(d){return "Fjerner figuren."},
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
"emotion":function(d){return "humør"},
"finalLevel":function(d){return "Gratulerer! Du har løst den siste oppgaven."},
"for":function(d){return "for"},
"hello":function(d){return "hallo"},
"helloWorld":function(d){return "Hei, verden!"},
"incrementPlayerScore":function(d){return "score poeng"},
"itemBlueFireball":function(d){return "blå ildkule"},
"itemPurpleFireball":function(d){return "lilla ildkule"},
"itemRedFireball":function(d){return "rød ildkule"},
"itemYellowHearts":function(d){return "gule hjerter"},
"itemPurpleHearts":function(d){return "lilla hjerter"},
"itemRedHearts":function(d){return "røde hjerter"},
"itemRandom":function(d){return "tilfeldig"},
"itemAnna":function(d){return "krok"},
"itemElsa":function(d){return "gnistre"},
"itemHiro":function(d){return "mikroboter"},
"itemBaymax":function(d){return "rakett"},
"itemRapunzel":function(d){return "kjele"},
"itemCherry":function(d){return "kirsebær"},
"itemIce":function(d){return "is"},
"itemDuck":function(d){return "and"},
"itemMan":function(d){return "mann"},
"itemPilot":function(d){return "pilot"},
"itemPig":function(d){return "gris"},
"itemBird":function(d){return "fugl"},
"itemMouse":function(d){return "mus"},
"itemRoo":function(d){return "kenguru"},
"itemSpider":function(d){return "edderkopp"},
"makeProjectileDisappear":function(d){return "forsvinne"},
"makeProjectileBounce":function(d){return "sprett"},
"makeProjectileBlueFireball":function(d){return "lag blå ildkule"},
"makeProjectilePurpleFireball":function(d){return "lag lilla ildkule"},
"makeProjectileRedFireball":function(d){return "lag rød ildkule"},
"makeProjectileYellowHearts":function(d){return "lag gule hjerter"},
"makeProjectilePurpleHearts":function(d){return "lag lilla hjerter"},
"makeProjectileRedHearts":function(d){return "lag røde hjerter"},
"makeProjectileTooltip":function(d){return "La prosjektilet som akkurat kolliderte forsvinne eller sprette."},
"makeYourOwn":function(d){return "Lag Din Egen LekeLab-App"},
"moveDirectionDown":function(d){return "ned"},
"moveDirectionLeft":function(d){return "venstre"},
"moveDirectionRight":function(d){return "høyre"},
"moveDirectionUp":function(d){return "opp"},
"moveDirectionRandom":function(d){return "tilfeldig"},
"moveDistance25":function(d){return "25 piksler"},
"moveDistance50":function(d){return "50 piksler"},
"moveDistance100":function(d){return "100 piksler"},
"moveDistance200":function(d){return "200 piksler"},
"moveDistance400":function(d){return "400 piksler"},
"moveDistancePixels":function(d){return "piksler"},
"moveDistanceRandom":function(d){return "tilfeldige piksler"},
"moveDistanceTooltip":function(d){return "Flytt en figur en bestemt avstand i den angitte retningen."},
"moveSprite":function(d){return "flytt"},
"moveSpriteN":function(d){return "flytte figur "+studio_locale.v(d,"spriteIndex")},
"toXY":function(d){return "til x, y"},
"moveDown":function(d){return "flytt ned"},
"moveDownTooltip":function(d){return "Flytt en figur ned."},
"moveLeft":function(d){return "flytt til venstre"},
"moveLeftTooltip":function(d){return "Flytt en figur til venstre."},
"moveRight":function(d){return "flytt til høyre"},
"moveRightTooltip":function(d){return "Flytt en figur til høyre."},
"moveUp":function(d){return "flytt opp"},
"moveUpTooltip":function(d){return "Flytt en figur opp."},
"moveTooltip":function(d){return "Flytt en figur."},
"nextLevel":function(d){return "Gratulerer! Du har fullført denne oppgaven."},
"no":function(d){return "Nei"},
"numBlocksNeeded":function(d){return "Denne oppgaven kan løses med %1 blokker."},
"onEventTooltip":function(d){return "Kjøre kode som svar på den angitte hendelsen."},
"ouchExclamation":function(d){return "Au!"},
"playSoundCrunch":function(d){return "Spill knase-lyd"},
"playSoundGoal1":function(d){return "spill mål-lyd 1"},
"playSoundGoal2":function(d){return "spill mål-lyd 2"},
"playSoundHit":function(d){return "spill treff-lyd"},
"playSoundLosePoint":function(d){return "spille miste poeng lyd"},
"playSoundLosePoint2":function(d){return "spille miste poeng 2 lyd"},
"playSoundRetro":function(d){return "spill retro-lyd"},
"playSoundRubber":function(d){return "spill gummi-lyd"},
"playSoundSlap":function(d){return "spill smekke-lyd"},
"playSoundTooltip":function(d){return "Spill den valgte lyden."},
"playSoundWinPoint":function(d){return "spill poeng-lyd"},
"playSoundWinPoint2":function(d){return "spill poeng-lyd 2"},
"playSoundWood":function(d){return "Spill tre-lyd"},
"positionOutTopLeft":function(d){return "til øverste venstre posisjon ovenfor"},
"positionOutTopRight":function(d){return "til øverste høyre posisjon ovenfor"},
"positionTopOutLeft":function(d){return "til øverste venstre posisjon utenfor"},
"positionTopLeft":function(d){return "til øverste venstre posisjon"},
"positionTopCenter":function(d){return "til øverste posisjon i midten"},
"positionTopRight":function(d){return "til øverste høyre posisjon"},
"positionTopOutRight":function(d){return "til øverste høyre posisjon utenfor"},
"positionMiddleLeft":function(d){return "til midterste venstre posisjon"},
"positionMiddleCenter":function(d){return "til midterste posisjon i midten"},
"positionMiddleRight":function(d){return "til midterste høyre posisjon"},
"positionBottomOutLeft":function(d){return "til nederste venstre posisjon utenfor"},
"positionBottomLeft":function(d){return "til nederste venstre posisjon"},
"positionBottomCenter":function(d){return "til nederst i midten posisjon"},
"positionBottomRight":function(d){return "til nederst til høyre posisjon"},
"positionBottomOutRight":function(d){return "til nederste høyre posisjon utenfor"},
"positionOutBottomLeft":function(d){return "til nederste venstre posisjon nedenfor"},
"positionOutBottomRight":function(d){return "til nederste høyre posisjon nedenfor"},
"positionRandom":function(d){return "til den tilfeldige posisjonen"},
"projectileBlueFireball":function(d){return "blå ildkule"},
"projectilePurpleFireball":function(d){return "lilla ildkule"},
"projectileRedFireball":function(d){return "rød ildkule"},
"projectileYellowHearts":function(d){return "gule hjerter"},
"projectilePurpleHearts":function(d){return "lilla hjerter"},
"projectileRedHearts":function(d){return "røde hjerter"},
"projectileRandom":function(d){return "tilfeldig"},
"projectileAnna":function(d){return "krok"},
"projectileElsa":function(d){return "gnistre"},
"projectileHiro":function(d){return "mikroboter"},
"projectileBaymax":function(d){return "rakett"},
"projectileRapunzel":function(d){return "kjele"},
"projectileCherry":function(d){return "kirsebær"},
"projectileIce":function(d){return "is"},
"projectileDuck":function(d){return "and"},
"reinfFeedbackMsg":function(d){return "Du kan trykke på \"Fortsett å spille\"-knappen for å gå tilbake til å spille din historie."},
"repeatForever":function(d){return "gjenta for alltid"},
"repeatDo":function(d){return "gjør"},
"repeatForeverTooltip":function(d){return "Utfør handlingene i denne blokken gjentatte ganger mens historien kjører."},
"saySprite":function(d){return "si"},
"saySpriteN":function(d){return "figur "+studio_locale.v(d,"spriteIndex")+" sier"},
"saySpriteTooltip":function(d){return "Sprett opp en snakkeboble med den tilhørende teksten fra den spesifiserte figuren."},
"saySpriteChoices_0":function(d){return "Hei på deg."},
"saySpriteChoices_1":function(d){return "Hei alle sammen."},
"saySpriteChoices_2":function(d){return "Hvordan har du det?"},
"saySpriteChoices_3":function(d){return "God morgen"},
"saySpriteChoices_4":function(d){return "God ettermiddag"},
"saySpriteChoices_5":function(d){return "God natt"},
"saySpriteChoices_6":function(d){return "God kveld"},
"saySpriteChoices_7":function(d){return "Noe nytt?"},
"saySpriteChoices_8":function(d){return "Hva?"},
"saySpriteChoices_9":function(d){return "Hvor?"},
"saySpriteChoices_10":function(d){return "Når?"},
"saySpriteChoices_11":function(d){return "Bra."},
"saySpriteChoices_12":function(d){return "Utmerket!"},
"saySpriteChoices_13":function(d){return "Greit."},
"saySpriteChoices_14":function(d){return "Ikke dårlig."},
"saySpriteChoices_15":function(d){return "Lykke til."},
"saySpriteChoices_16":function(d){return "Ja"},
"saySpriteChoices_17":function(d){return "Nei"},
"saySpriteChoices_18":function(d){return "OK"},
"saySpriteChoices_19":function(d){return "Bra kast!"},
"saySpriteChoices_20":function(d){return "Ha en fin dag."},
"saySpriteChoices_21":function(d){return "Farvel."},
"saySpriteChoices_22":function(d){return "Jeg er straks tilbake."},
"saySpriteChoices_23":function(d){return "Sees i morgen!"},
"saySpriteChoices_24":function(d){return "Vi ses!"},
"saySpriteChoices_25":function(d){return "Ta vare på deg selv!"},
"saySpriteChoices_26":function(d){return "Kos deg!"},
"saySpriteChoices_27":function(d){return "Jeg må gå."},
"saySpriteChoices_28":function(d){return "Skal vi være venner?"},
"saySpriteChoices_29":function(d){return "Bra jobba!"},
"saySpriteChoices_30":function(d){return "Hurra!"},
"saySpriteChoices_31":function(d){return "Ja!"},
"saySpriteChoices_32":function(d){return "Hyggelig å treffe deg."},
"saySpriteChoices_33":function(d){return "Greit!"},
"saySpriteChoices_34":function(d){return "Tusen takk"},
"saySpriteChoices_35":function(d){return "Nei takk"},
"saySpriteChoices_36":function(d){return "Aaaaaah!"},
"saySpriteChoices_37":function(d){return "Glem det"},
"saySpriteChoices_38":function(d){return "I dag"},
"saySpriteChoices_39":function(d){return "I morgen"},
"saySpriteChoices_40":function(d){return "I går"},
"saySpriteChoices_41":function(d){return "Jeg fant deg!"},
"saySpriteChoices_42":function(d){return "Du fant meg!"},
"saySpriteChoices_43":function(d){return "10, 9, 8, 7, 6, 5, 4, 3, 2, 1!"},
"saySpriteChoices_44":function(d){return "Du er god!"},
"saySpriteChoices_45":function(d){return "Du er morsom!"},
"saySpriteChoices_46":function(d){return "Du er tullete! "},
"saySpriteChoices_47":function(d){return "Du er en god venn!"},
"saySpriteChoices_48":function(d){return "Se opp!"},
"saySpriteChoices_49":function(d){return "Dukk!"},
"saySpriteChoices_50":function(d){return "Tok deg!"},
"saySpriteChoices_51":function(d){return "Au!"},
"saySpriteChoices_52":function(d){return "Beklager!"},
"saySpriteChoices_53":function(d){return "Forsiktig!"},
"saySpriteChoices_54":function(d){return "OJ!"},
"saySpriteChoices_55":function(d){return "Oisann!"},
"saySpriteChoices_56":function(d){return "Du tok meg nesten!"},
"saySpriteChoices_57":function(d){return "Godt forsøk!"},
"saySpriteChoices_58":function(d){return "Du kan ikke ta meg!"},
"scoreText":function(d){return "Sluttresultat: "+studio_locale.v(d,"playerScore")},
"setActivityRandom":function(d){return "angi aktiviteten som tilfeldig for"},
"setActivityRoam":function(d){return "angi aktiviteten å streife for"},
"setActivityChase":function(d){return "angi aktiviteten å jage for"},
"setActivityFlee":function(d){return "angir aktiviteten å flykte for"},
"setActivityNone":function(d){return "angi aktiviteten til ingen for"},
"setActivityTooltip":function(d){return "Angir aktiviteten for et sett med figurer"},
"setBackground":function(d){return "sett bakgrunn"},
"setBackgroundRandom":function(d){return "sett tilfeldig bakgrunn"},
"setBackgroundBlack":function(d){return "Angi svart bakgrunn"},
"setBackgroundCave":function(d){return "sett hulebakgrunn"},
"setBackgroundCloudy":function(d){return "Angi en bakgrunn med skyer"},
"setBackgroundHardcourt":function(d){return "sett idrettsplassbakgrunn"},
"setBackgroundNight":function(d){return "sett nattbakgrunn"},
"setBackgroundUnderwater":function(d){return "sett undersjøbakgrunn"},
"setBackgroundCity":function(d){return "sett bybakgrunn"},
"setBackgroundDesert":function(d){return "sett ørkenbakgrunn"},
"setBackgroundRainbow":function(d){return "sett regnbuebakgrunn"},
"setBackgroundSoccer":function(d){return "set fotball bakgrunn"},
"setBackgroundSpace":function(d){return "set verdensrom bakgrunn"},
"setBackgroundTennis":function(d){return "set tennis bakgrunn"},
"setBackgroundWinter":function(d){return "set vinter bakgrunn"},
"setBackgroundLeafy":function(d){return "sett bladbakgrunn"},
"setBackgroundGrassy":function(d){return "sett gressbakgrunn"},
"setBackgroundFlower":function(d){return "sett blomsterbakgrunn"},
"setBackgroundTile":function(d){return "sett rutenettbakgrunn"},
"setBackgroundIcy":function(d){return "sett isbakgrunn"},
"setBackgroundSnowy":function(d){return "sett snøbakgrunn"},
"setBackgroundForest":function(d){return "angi skogbakgrunn"},
"setBackgroundSnow":function(d){return "angi snøbakgrunn"},
"setBackgroundShip":function(d){return "angi skipsbakgrunn"},
"setBackgroundTooltip":function(d){return "Angir bakgrunnsbilde"},
"setEnemySpeed":function(d){return "angi fiendens hastighet"},
"setItemSpeedSet":function(d){return "angi type"},
"setItemSpeedTooltip":function(d){return "Angir hastigheten for et sett med figurer"},
"setPlayerSpeed":function(d){return "angi spillerens hastighet"},
"setScoreText":function(d){return "Angi poengsum"},
"setScoreTextTooltip":function(d){return "Angir teksten som skal vises i feltet for score."},
"setSpriteEmotionAngry":function(d){return "til et sint humør"},
"setSpriteEmotionHappy":function(d){return "til godt humør"},
"setSpriteEmotionNormal":function(d){return "til nøytralt humør"},
"setSpriteEmotionRandom":function(d){return "til et tilfeldig humør"},
"setSpriteEmotionSad":function(d){return "til trist humør"},
"setSpriteEmotionTooltip":function(d){return "Setter figurens humør"},
"setSpriteAlien":function(d){return "til romvesenfigur"},
"setSpriteBat":function(d){return "til flaggermusbilde"},
"setSpriteBird":function(d){return "til fugle bildet"},
"setSpriteCat":function(d){return "til katte bildet"},
"setSpriteCaveBoy":function(d){return "til steinaldergutt bildet"},
"setSpriteCaveGirl":function(d){return "til steinalderjente bildet"},
"setSpriteDinosaur":function(d){return "til dinosaur bildet"},
"setSpriteDog":function(d){return "til hunde bilde"},
"setSpriteDragon":function(d){return "til drage bilde"},
"setSpriteGhost":function(d){return "til spøkelsebildet"},
"setSpriteHidden":function(d){return "til gjemt bilde"},
"setSpriteHideK1":function(d){return "gjemme"},
"setSpriteAnna":function(d){return "til et Anna-bilde"},
"setSpriteElsa":function(d){return "til et Elsa-bilde"},
"setSpriteHiro":function(d){return "til Hiro-bilde"},
"setSpriteBaymax":function(d){return "til Baymax utseende"},
"setSpriteRapunzel":function(d){return "til Rapunzel-bilde"},
"setSpriteKnight":function(d){return "til ridder-bilde"},
"setSpriteMonster":function(d){return "til monster-bilde"},
"setSpriteNinja":function(d){return "til ninja-bilde"},
"setSpriteOctopus":function(d){return "til blekksprut-bilde"},
"setSpritePenguin":function(d){return "til et pingvinbilde"},
"setSpritePirate":function(d){return "til et piratbilde"},
"setSpritePrincess":function(d){return "til et prinsessebilde"},
"setSpriteRandom":function(d){return "til et tilfeldig bilde"},
"setSpriteRobot":function(d){return "til et robotbilde"},
"setSpriteShowK1":function(d){return "vis"},
"setSpriteSpacebot":function(d){return "til romrobotbilde"},
"setSpriteSoccerGirl":function(d){return "til fotballjentebilde"},
"setSpriteSoccerBoy":function(d){return "til fotballguttbilde"},
"setSpriteSquirrel":function(d){return "til ekornbilde"},
"setSpriteTennisGirl":function(d){return "til tennisjentebilde"},
"setSpriteTennisBoy":function(d){return "til tennisguttbilde"},
"setSpriteUnicorn":function(d){return "til enhjøringbilde"},
"setSpriteWitch":function(d){return "til et bilde av en heks"},
"setSpriteWizard":function(d){return "til trollmannbilde"},
"setSpritePositionTooltip":function(d){return "Flytter en figur til den angitte plasseringen."},
"setSpriteK1Tooltip":function(d){return "Viser eller skjuler angitt figur."},
"setSpriteTooltip":function(d){return "Angir skuespillerbildet"},
"setSpriteSizeRandom":function(d){return "til tilfeldig størrelse"},
"setSpriteSizeVerySmall":function(d){return "til veldig liten størrelse"},
"setSpriteSizeSmall":function(d){return "til liten størrelse"},
"setSpriteSizeNormal":function(d){return "til normal størrelse"},
"setSpriteSizeLarge":function(d){return "til stor størrelse"},
"setSpriteSizeVeryLarge":function(d){return "til veldig stor størrelse"},
"setSpriteSizeTooltip":function(d){return "Angir størrelsen på en figur"},
"setSpriteSpeedRandom":function(d){return "til en tilfeldig fart"},
"setSpriteSpeedVerySlow":function(d){return "til en veldig langsom fart"},
"setSpriteSpeedSlow":function(d){return "til en langsom fart"},
"setSpriteSpeedNormal":function(d){return "til en normal fart"},
"setSpriteSpeedFast":function(d){return "til en rask fart"},
"setSpriteSpeedVeryFast":function(d){return "til en veldig rask fart"},
"setSpriteSpeedTooltip":function(d){return "Angir farten til en figur"},
"setSpriteZombie":function(d){return "til zombie utseende"},
"setSpriteBot1":function(d){return "til bot1"},
"setSpriteBot2":function(d){return "til bot2"},
"setMap":function(d){return "angi kart"},
"setMapRandom":function(d){return "angi tilfeldig kart"},
"setMapBlank":function(d){return "angi tomt kart"},
"setMapCircle":function(d){return "angi sirkel-kart"},
"setMapCircle2":function(d){return "angi sirkel2-kart"},
"setMapHorizontal":function(d){return "angi vannrett kart"},
"setMapGrid":function(d){return "angi rutenettet-kart"},
"setMapBlobs":function(d){return "angi boblekart"},
"setMapTooltip":function(d){return "Endrer kartet i scenen"},
"shareStudioTwitter":function(d){return "Sjekk ut historien jeg lagde. Jeg skrev den selv med @codeorg"},
"shareGame":function(d){return "Del din historie:"},
"showCoordinates":function(d){return "vis koordinater"},
"showCoordinatesTooltip":function(d){return "vis hovedpersonens koordinater på skjermen"},
"showTitleScreen":function(d){return "vis tittelskjerm"},
"showTitleScreenTitle":function(d){return "tittel"},
"showTitleScreenText":function(d){return "tekst"},
"showTSDefTitle":function(d){return "skriv tittelen her"},
"showTSDefText":function(d){return "skriv teksten her"},
"showTitleScreenTooltip":function(d){return "Vis en tittelskjerm med tilhørende tittel og tekst."},
"size":function(d){return "størrelse"},
"setSprite":function(d){return "sett"},
"setSpriteN":function(d){return "angi figur "+studio_locale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "knas"},
"soundGoal1":function(d){return "mål 1"},
"soundGoal2":function(d){return "mål 2"},
"soundHit":function(d){return "slå"},
"soundLosePoint":function(d){return "miste poeng"},
"soundLosePoint2":function(d){return "miste poeng 2"},
"soundRetro":function(d){return "retro"},
"soundRubber":function(d){return "gummi"},
"soundSlap":function(d){return "klask"},
"soundWinPoint":function(d){return "vinne poeng"},
"soundWinPoint2":function(d){return "vinne poeng 2"},
"soundWood":function(d){return "tre"},
"speed":function(d){return "fart"},
"startSetValue":function(d){return "start (funksjon)"},
"startSetVars":function(d){return "spill_verdier (tittel, undertittel, bakgrunn, mål, fare, spiller)"},
"startSetFuncs":function(d){return "spill_funk(oppdater-mål, oppdater-fare, oppdater-spiller, kollider?, på-skjermen?)"},
"stopSprite":function(d){return "stopp"},
"stopSpriteN":function(d){return "stopp figur "+studio_locale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Stopper en figurs bevegelser."},
"throwSprite":function(d){return "kaste"},
"throwSpriteN":function(d){return "figur kaster "+studio_locale.v(d,"spriteIndex")},
"throwTooltip":function(d){return "Kaster et prosjektil fra valgte figur."},
"vanish":function(d){return "fjern"},
"vanishActorN":function(d){return "fjern figur "+studio_locale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "Fjerner figuren."},
"waitFor":function(d){return "vent på"},
"waitSeconds":function(d){return "sekunder"},
"waitForClick":function(d){return "vent på klikk"},
"waitForRandom":function(d){return "Vent på tilfeldig"},
"waitForHalfSecond":function(d){return "vente et halvt sekund"},
"waitFor1Second":function(d){return "Vent i 1 sekund"},
"waitFor2Seconds":function(d){return "Vent i 2 sekunder"},
"waitFor5Seconds":function(d){return "Vent i fem sekunder"},
"waitFor10Seconds":function(d){return "Vent i 10 sekunder"},
"waitParamsTooltip":function(d){return "Venter det spesifiserte antall sekunder eller bruk null for å vente på et klikk."},
"waitTooltip":function(d){return "Venter i en viss tid eller til et klikk oppstår."},
"whenArrowDown":function(d){return "pil ned"},
"whenArrowLeft":function(d){return "pil venstre"},
"whenArrowRight":function(d){return "pil høyre"},
"whenArrowUp":function(d){return "pil opp"},
"whenArrowTooltip":function(d){return "Utfør handlingene under når den angitte piltasten trykkes."},
"whenDown":function(d){return "Når pil ned"},
"whenDownTooltip":function(d){return "Utfør handlingene nedenfor når pil ned-tasten trykkes."},
"whenGameStarts":function(d){return "Når historien starter"},
"whenGameStartsTooltip":function(d){return "Utfør handlingene nedenfor når historien starter."},
"whenLeft":function(d){return "Når venstre pil"},
"whenLeftTooltip":function(d){return "Utfør handlingene nedenfor når venstre pil-tasten trykkes."},
"whenRight":function(d){return "Når høyre pil"},
"whenRightTooltip":function(d){return "Utfør handlingene nedenfor når du trykker piltasten høyre."},
"whenSpriteClicked":function(d){return "når figuren blir klikket"},
"whenSpriteClickedN":function(d){return "når figuren "+studio_locale.v(d,"spriteIndex")+" blir klikket på"},
"whenSpriteClickedTooltip":function(d){return "Utfør handlingene under når en figur blir klikket på."},
"whenSpriteCollidedN":function(d){return "når figur "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "Utfør handlingene nedenfor når en figur berører en annen figur."},
"whenSpriteCollidedWith":function(d){return "berører"},
"whenSpriteCollidedWithAnyActor":function(d){return "berører en figur"},
"whenSpriteCollidedWithAnyEdge":function(d){return "berører en kant"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "berører et prosjektil"},
"whenSpriteCollidedWithAnything":function(d){return "berører noe"},
"whenSpriteCollidedWithN":function(d){return "berører figur "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "berører blå ildkule"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "berører lilla ildkule"},
"whenSpriteCollidedWithRedFireball":function(d){return "berører rød ildkule"},
"whenSpriteCollidedWithYellowHearts":function(d){return "berører gult hjerte"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "berører lilla hjerte"},
"whenSpriteCollidedWithRedHearts":function(d){return "berører rødt hjerte"},
"whenSpriteCollidedWithBottomEdge":function(d){return "berører nedre kant"},
"whenSpriteCollidedWithLeftEdge":function(d){return "berører venstre kant"},
"whenSpriteCollidedWithRightEdge":function(d){return "berører høyre kant"},
"whenSpriteCollidedWithTopEdge":function(d){return "berører øvre kant"},
"whenTouchItem":function(d){return "når figuren berørte"},
"whenTouchItemTooltip":function(d){return "Utfør handlingene nedenfor når figuren berører en figur."},
"whenTouchWall":function(d){return "når hinder er berørt"},
"whenTouchWallTooltip":function(d){return "Utfør handlingene nedenfor når skuespilleren berører en hindring."},
"whenUp":function(d){return "Når pil opp"},
"whenUpTooltip":function(d){return "Utfør handlingene nedenfor når pil opp-tasten trykkes."},
"yes":function(d){return "Ja"},
"failedHasSetSprite":function(d){return "Next time, set a character."},
"failedHasSetBotSpeed":function(d){return "Next time, set a bot speed."},
"failedTouchAllItems":function(d){return "Next time, get all the items."},
"failedScoreMinimum":function(d){return "Next time, reach the minimum score."},
"failedRemovedItemCount":function(d){return "Next time, get the right number of items."},
"failedSetActivity":function(d){return "Next time, set the correct character activity."},
"calloutPutCommandsHereRunStart":function(d){return "Put commands here to have them run when the program starts"},
"calloutUseArrowButtons":function(d){return "Hold down these buttons or the arrow keys on your keyboard to trigger the move events."},
"dropletBlock_addPoints_description":function(d){return "Add points to the score."},
"dropletBlock_addPoints_param0":function(d){return "score"},
"dropletBlock_addPoints_param0_description":function(d){return "The value to add to the score."},
"dropletBlock_removePoints_description":function(d){return "Remove points from the score."},
"dropletBlock_removePoints_param0":function(d){return "score"},
"dropletBlock_removePoints_param0_description":function(d){return "The value to remove from the score."},
"dropletBlock_endGame_description":function(d){return "End the game."},
"dropletBlock_endGame_param0":function(d){return "type"},
"dropletBlock_endGame_param0_description":function(d){return "Whether the game was won or lost ('win', 'lose')."},
"dropletBlock_whenGetCharacter_description":function(d){return "This function executes when the character gets any character."},
"dropletBlock_whenGetMan_description":function(d){return "This function executes when the character gets man characters."},
"dropletBlock_whenGetPilot_description":function(d){return "This function executes when the character gets pilot characters."},
"dropletBlock_whenGetPig_description":function(d){return "This function executes when the character gets pig characters."},
"dropletBlock_whenGetBird_description":function(d){return "This function executes when the character gets bird characters."},
"dropletBlock_whenGetMouse_description":function(d){return "This function executes when the character gets mouse characters."},
"dropletBlock_whenGetRoo_description":function(d){return "This function executes when the character gets roo characters."},
"dropletBlock_whenGetSpider_description":function(d){return "This function executes when the character gets spider characters."},
"loseMessage":function(d){return "You lose!"},
"winMessage":function(d){return "You win!"},
"failedHasSetBackground":function(d){return "Next time, set the background."},
"failedHasSetMap":function(d){return "Next time, set the map."},
"failedHasWonGame":function(d){return "Next time, win the game."},
"failedHasLostGame":function(d){return "Next time, lose the game"},
"failedAddItem":function(d){return "Next time, add a character."},
"failedAvoidHazard":function(d){return "Next time, don't touch the hazard."}};