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
"actor":function(d){return "lik"},
"addCharacter":function(d){return "add a"},
"addCharacterTooltip":function(d){return "Add a character to the scene."},
"alienInvasion":function(d){return "Napad vanzemaljaca!"},
"backgroundBlack":function(d){return "crno"},
"backgroundCave":function(d){return "pećina"},
"backgroundCloudy":function(d){return "oblačno"},
"backgroundHardcourt":function(d){return "tvrda podloga"},
"backgroundNight":function(d){return "noć"},
"backgroundUnderwater":function(d){return "pod vodom"},
"backgroundCity":function(d){return "grad"},
"backgroundDesert":function(d){return "pustinja"},
"backgroundRainbow":function(d){return "duga"},
"backgroundSoccer":function(d){return "nogomet"},
"backgroundSpace":function(d){return "svemir"},
"backgroundTennis":function(d){return "tenis"},
"backgroundWinter":function(d){return "zima"},
"calloutPlaceCommandsHere":function(d){return "Place commands here"},
"calloutPlaceCommandsAtTop":function(d){return "Place commands to set up your game at the top"},
"calloutTypeCommandsHere":function(d){return "Type your commands here"},
"calloutCharactersMove":function(d){return "These new commands let you control how the characters move"},
"calloutPutCommandsTouchCharacter":function(d){return "Put a command here to have it happen when you touch a character"},
"calloutClickCategory":function(d){return "Click a category header to see commands in each category"},
"calloutTryOutNewCommands":function(d){return "Try out all the new commands you’ve unlocked"},
"catActions":function(d){return "Akcije"},
"catControl":function(d){return "Petlje"},
"catEvents":function(d){return "Događaji"},
"catLogic":function(d){return "Logika"},
"catMath":function(d){return "Matematika"},
"catProcedures":function(d){return "Funkcije"},
"catText":function(d){return "Tekst"},
"catVariables":function(d){return "Varijable"},
"changeScoreTooltip":function(d){return "Dodaj ili oduzmi bod."},
"changeScoreTooltipK1":function(d){return "Dodaj bod."},
"continue":function(d){return "Nastavi"},
"decrementPlayerScore":function(d){return "oduzmi bod"},
"defaultSayText":function(d){return "piši ovdje"},
"dropletBlock_addCharacter_description":function(d){return "Add a character to the scene."},
"dropletBlock_addCharacter_param0":function(d){return "type"},
"dropletBlock_addCharacter_param0_description":function(d){return "The type of the character to be added ('random', 'man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_changeScore_description":function(d){return "Dodaj ili oduzmi bod."},
"dropletBlock_changeScore_param0":function(d){return "bodovi"},
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
"dropletBlock_playSound_description":function(d){return "Pusti odrabrani zvuk."},
"dropletBlock_playSound_param0":function(d){return "sound"},
"dropletBlock_playSound_param0_description":function(d){return "The name of the sound to play."},
"dropletBlock_setBackground_description":function(d){return "Postavlja pozadinsku sliku"},
"dropletBlock_setBackground_param0":function(d){return "image"},
"dropletBlock_setBackground_param0_description":function(d){return "The name of the background theme ('background1', 'background2', or 'background3')."},
"dropletBlock_setBot_description":function(d){return "Changes the active bot."},
"dropletBlock_setBot_param0":function(d){return "image"},
"dropletBlock_setBot_param0_description":function(d){return "The name of the bot image ('random', 'bot1', or 'bot2')."},
"dropletBlock_setBotSpeed_description":function(d){return "Sets the bot speed."},
"dropletBlock_setBotSpeed_param0":function(d){return "brzina"},
"dropletBlock_setBotSpeed_param0_description":function(d){return "The speed value ('random', 'slow', 'normal', or 'fast')."},
"dropletBlock_setSpriteEmotion_description":function(d){return "Postavlja raspoloženje lika"},
"dropletBlock_setSpritePosition_description":function(d){return "Odmah premješta lik na zadanu poziciju."},
"dropletBlock_setSpriteSpeed_description":function(d){return "Postavlja brzinu lika"},
"dropletBlock_setSprite_description":function(d){return "Postavlja izgled lika"},
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
"dropletBlock_throw_description":function(d){return "Odabrani lik baca projektil."},
"dropletBlock_vanish_description":function(d){return "Učini da lik nestane."},
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
"emotion":function(d){return "raspoloženje"},
"finalLevel":function(d){return "Čestitamo ! Riješili ste posljednji zadatak."},
"for":function(d){return "za"},
"hello":function(d){return "zdravo"},
"helloWorld":function(d){return "Zdravo, svijete!"},
"incrementPlayerScore":function(d){return "osvoji bod"},
"itemBlueFireball":function(d){return "plava vatrena kugla"},
"itemPurpleFireball":function(d){return "ljubičasta vatrena kugla"},
"itemRedFireball":function(d){return "crvena vatrena kugla"},
"itemYellowHearts":function(d){return "žuta srca"},
"itemPurpleHearts":function(d){return "ljubičasta srca"},
"itemRedHearts":function(d){return "crvena srca"},
"itemRandom":function(d){return "slučajno odabran"},
"itemAnna":function(d){return "hook"},
"itemElsa":function(d){return "sparkle"},
"itemHiro":function(d){return "microbots"},
"itemBaymax":function(d){return "rocket"},
"itemRapunzel":function(d){return "saucepan"},
"itemCherry":function(d){return "cherry"},
"itemIce":function(d){return "ice"},
"itemDuck":function(d){return "duck"},
"itemMan":function(d){return "man"},
"itemPilot":function(d){return "pilot"},
"itemPig":function(d){return "pig"},
"itemBird":function(d){return "bird"},
"itemMouse":function(d){return "mouse"},
"itemRoo":function(d){return "roo"},
"itemSpider":function(d){return "spider"},
"makeProjectileDisappear":function(d){return "nestani"},
"makeProjectileBounce":function(d){return "odskoči"},
"makeProjectileBlueFireball":function(d){return "napravi plavu vatrenu kuglu"},
"makeProjectilePurpleFireball":function(d){return "napravi ljubičastu vatrenu kuglu"},
"makeProjectileRedFireball":function(d){return "napravi crvenu vatrenu kuglu"},
"makeProjectileYellowHearts":function(d){return "napravi žuta srca"},
"makeProjectilePurpleHearts":function(d){return "napravi ljubičasta srca"},
"makeProjectileRedHearts":function(d){return "napravi crvena srca"},
"makeProjectileTooltip":function(d){return "Napravi da projektil koji se sudario nestane ili da se odbije."},
"makeYourOwn":function(d){return "Napravi vlastitu aplikaciju Laboratorija Igrica"},
"moveDirectionDown":function(d){return "dolje"},
"moveDirectionLeft":function(d){return "lijevo"},
"moveDirectionRight":function(d){return "desno"},
"moveDirectionUp":function(d){return "gore"},
"moveDirectionRandom":function(d){return "slučajno odabran"},
"moveDistance25":function(d){return "25 piksela"},
"moveDistance50":function(d){return "50 piksela"},
"moveDistance100":function(d){return "100 piksela"},
"moveDistance200":function(d){return "200 piksela"},
"moveDistance400":function(d){return "400 piksela"},
"moveDistancePixels":function(d){return "pikseli"},
"moveDistanceRandom":function(d){return "nasumični broj piksela"},
"moveDistanceTooltip":function(d){return "Pomiče lik za zadanu udaljenost i u zadanom smjeru."},
"moveSprite":function(d){return "pomakni"},
"moveSpriteN":function(d){return "pomakni lik "+studio_locale.v(d,"spriteIndex")},
"toXY":function(d){return "na x,y"},
"moveDown":function(d){return "pomakni dolje"},
"moveDownTooltip":function(d){return "Pomakni lik prema dolje."},
"moveLeft":function(d){return "pomakni lijevo"},
"moveLeftTooltip":function(d){return "Pomiče lik ulijevo."},
"moveRight":function(d){return "pomakni desno"},
"moveRightTooltip":function(d){return "Pomakni lik udesno."},
"moveUp":function(d){return "pomakni gore"},
"moveUpTooltip":function(d){return "Pomakni lik prema gore."},
"moveTooltip":function(d){return "Pomakni lik."},
"nextLevel":function(d){return "Čestitamo! Ovaj zadatak je riješen."},
"no":function(d){return "Ne"},
"numBlocksNeeded":function(d){return "Ovaj zadatak se može riješiti sa %1 blokova."},
"onEventTooltip":function(d){return "Execute code in response to the specified event."},
"ouchExclamation":function(d){return "Jao!"},
"playSoundCrunch":function(d){return "pokreni zvuk krckanja"},
"playSoundGoal1":function(d){return "pokreni zvuk cilja 1"},
"playSoundGoal2":function(d){return "pokreni zvuk cilja 2"},
"playSoundHit":function(d){return "pokreni zvuk udara"},
"playSoundLosePoint":function(d){return "pokreni zvuk gubitka boda"},
"playSoundLosePoint2":function(d){return "pokreni zvuk izgubljenog boda 2"},
"playSoundRetro":function(d){return "pokreni retro zvuk"},
"playSoundRubber":function(d){return "pokreni zvuk gume"},
"playSoundSlap":function(d){return "pokreni zvuk pljeskanja"},
"playSoundTooltip":function(d){return "Pusti odrabrani zvuk."},
"playSoundWinPoint":function(d){return "pokreni zvuk osvojenog poena"},
"playSoundWinPoint2":function(d){return "pokreni zvuk 2 za osvojeni poen"},
"playSoundWood":function(d){return "pokreni zvuk drveta"},
"positionOutTopLeft":function(d){return "na položaj iznad gore lijevo"},
"positionOutTopRight":function(d){return "na položaj iznad gore desno"},
"positionTopOutLeft":function(d){return "na položaj izvana gore lijevo"},
"positionTopLeft":function(d){return "na položaj gore lijevo"},
"positionTopCenter":function(d){return "na položaj gore u sredinu"},
"positionTopRight":function(d){return "na položaj gore desno"},
"positionTopOutRight":function(d){return "na položaj izvana gore desno"},
"positionMiddleLeft":function(d){return "na položaj u sredinu lijevo"},
"positionMiddleCenter":function(d){return "na položaj u sredinu središnjeg dijela"},
"positionMiddleRight":function(d){return "na položaj u sredinu desno"},
"positionBottomOutLeft":function(d){return "na položaj izvana dolje lijevo"},
"positionBottomLeft":function(d){return "na položaj dolje lijevo"},
"positionBottomCenter":function(d){return "na položaj dolje u sredinu"},
"positionBottomRight":function(d){return "na položaj dolje desno"},
"positionBottomOutRight":function(d){return "na položaj izvana dolje desno"},
"positionOutBottomLeft":function(d){return "na položaj ispod dolje lijevo"},
"positionOutBottomRight":function(d){return "na položaj ispod dolje desno"},
"positionRandom":function(d){return "na nasumično odabran položaj"},
"projectileBlueFireball":function(d){return "plava vatrena kugla"},
"projectilePurpleFireball":function(d){return "ljubičasta vatrena kugla"},
"projectileRedFireball":function(d){return "crvena vatrena kugla"},
"projectileYellowHearts":function(d){return "žuta srca"},
"projectilePurpleHearts":function(d){return "ljubičasta srca"},
"projectileRedHearts":function(d){return "crvena srca"},
"projectileRandom":function(d){return "slučajno odabran"},
"projectileAnna":function(d){return "Anna"},
"projectileElsa":function(d){return "Elsa"},
"projectileHiro":function(d){return "Hiro"},
"projectileBaymax":function(d){return "Baymax"},
"projectileRapunzel":function(d){return "Rapunzel"},
"projectileCherry":function(d){return "cherry"},
"projectileIce":function(d){return "ice"},
"projectileDuck":function(d){return "duck"},
"reinfFeedbackMsg":function(d){return "You can press the \"Keep Playing\" button to go back to playing your story."},
"repeatForever":function(d){return "ponavljaj zauvijek"},
"repeatDo":function(d){return "uradi"},
"repeatForeverTooltip":function(d){return "Ponavljaj izvršavanje akcija u ovom bloku, dok god se priča igre događa."},
"saySprite":function(d){return "reci"},
"saySpriteN":function(d){return "lik "+studio_locale.v(d,"spriteIndex")+" kaže"},
"saySpriteTooltip":function(d){return "Zadanom liku stvara strip-dijalog-oblak s pripadnim tekstom."},
"saySpriteChoices_0":function(d){return "Hi there."},
"saySpriteChoices_1":function(d){return "Hi there!"},
"saySpriteChoices_2":function(d){return "How are you?"},
"saySpriteChoices_3":function(d){return "This is fun..."},
"saySpriteChoices_4":function(d){return "Good afternoon"},
"saySpriteChoices_5":function(d){return "Good night"},
"saySpriteChoices_6":function(d){return "Good evening"},
"saySpriteChoices_7":function(d){return "What’s new?"},
"saySpriteChoices_8":function(d){return "What?"},
"saySpriteChoices_9":function(d){return "Where?"},
"saySpriteChoices_10":function(d){return "When?"},
"saySpriteChoices_11":function(d){return "Good."},
"saySpriteChoices_12":function(d){return "Great!"},
"saySpriteChoices_13":function(d){return "All right."},
"saySpriteChoices_14":function(d){return "Not bad."},
"saySpriteChoices_15":function(d){return "Good luck."},
"saySpriteChoices_16":function(d){return "Da"},
"saySpriteChoices_17":function(d){return "Ne"},
"saySpriteChoices_18":function(d){return "Okay"},
"saySpriteChoices_19":function(d){return "Nice throw!"},
"saySpriteChoices_20":function(d){return "Have a nice day."},
"saySpriteChoices_21":function(d){return "Bye."},
"saySpriteChoices_22":function(d){return "I’ll be right back."},
"saySpriteChoices_23":function(d){return "See you tomorrow!"},
"saySpriteChoices_24":function(d){return "See you later!"},
"saySpriteChoices_25":function(d){return "Take care!"},
"saySpriteChoices_26":function(d){return "Enjoy!"},
"saySpriteChoices_27":function(d){return "I have to go."},
"saySpriteChoices_28":function(d){return "Want to be friends?"},
"saySpriteChoices_29":function(d){return "Great job!"},
"saySpriteChoices_30":function(d){return "Woo hoo!"},
"saySpriteChoices_31":function(d){return "Yay!"},
"saySpriteChoices_32":function(d){return "Nice to meet you."},
"saySpriteChoices_33":function(d){return "All right!"},
"saySpriteChoices_34":function(d){return "Thank you"},
"saySpriteChoices_35":function(d){return "No, thank you"},
"saySpriteChoices_36":function(d){return "Aaaaaah!"},
"saySpriteChoices_37":function(d){return "Never mind"},
"saySpriteChoices_38":function(d){return "Today"},
"saySpriteChoices_39":function(d){return "Tomorrow"},
"saySpriteChoices_40":function(d){return "Yesterday"},
"saySpriteChoices_41":function(d){return "I found you!"},
"saySpriteChoices_42":function(d){return "You found me!"},
"saySpriteChoices_43":function(d){return "10, 9, 8, 7, 6, 5, 4, 3, 2, 1!"},
"saySpriteChoices_44":function(d){return "You are great!"},
"saySpriteChoices_45":function(d){return "You are funny!"},
"saySpriteChoices_46":function(d){return "You are silly! "},
"saySpriteChoices_47":function(d){return "You are a good friend!"},
"saySpriteChoices_48":function(d){return "Watch out!"},
"saySpriteChoices_49":function(d){return "Duck!"},
"saySpriteChoices_50":function(d){return "Gotcha!"},
"saySpriteChoices_51":function(d){return "Ow!"},
"saySpriteChoices_52":function(d){return "Sorry!"},
"saySpriteChoices_53":function(d){return "Careful!"},
"saySpriteChoices_54":function(d){return "Whoa!"},
"saySpriteChoices_55":function(d){return "Oops!"},
"saySpriteChoices_56":function(d){return "You almost got me!"},
"saySpriteChoices_57":function(d){return "Nice try!"},
"saySpriteChoices_58":function(d){return "You can’t catch me!"},
"scoreText":function(d){return "Rezultat: "+studio_locale.v(d,"playerScore")},
"setActivityRandom":function(d){return "set activity to random for"},
"setActivityRoam":function(d){return "set activity to roam for"},
"setActivityChase":function(d){return "set activity to chase for"},
"setActivityFlee":function(d){return "set activity to flee for"},
"setActivityNone":function(d){return "set activity to none for"},
"setActivityTooltip":function(d){return "Sets the activity for a set of items"},
"setBackground":function(d){return "postavi pozadinu"},
"setBackgroundRandom":function(d){return "postavi nasumično odabranu pozadinu"},
"setBackgroundBlack":function(d){return "postavi crnu pozadinu"},
"setBackgroundCave":function(d){return "postavi pećinu kao pozadinu"},
"setBackgroundCloudy":function(d){return "postavi oblačnu pozadinu"},
"setBackgroundHardcourt":function(d){return "postavi tvrdi teren kao pozadinu"},
"setBackgroundNight":function(d){return "postavi noćnu pozadinu"},
"setBackgroundUnderwater":function(d){return "postavi podvodnu pozadinu"},
"setBackgroundCity":function(d){return "postavi gradsku pozadinu"},
"setBackgroundDesert":function(d){return "postavi pustinjsku pozadinu"},
"setBackgroundRainbow":function(d){return "postavi pozadinu s dugom"},
"setBackgroundSoccer":function(d){return "postavi nogomentu pozadinu"},
"setBackgroundSpace":function(d){return "postavi svemirsku pozadinu"},
"setBackgroundTennis":function(d){return "postavi tenisku pozadinu"},
"setBackgroundWinter":function(d){return "postavi zimsku pozadinu"},
"setBackgroundLeafy":function(d){return "set leafy background"},
"setBackgroundGrassy":function(d){return "set grassy background"},
"setBackgroundFlower":function(d){return "set flower background"},
"setBackgroundTile":function(d){return "set tile background"},
"setBackgroundIcy":function(d){return "set icy background"},
"setBackgroundSnowy":function(d){return "set snowy background"},
"setBackgroundForest":function(d){return "set forest background"},
"setBackgroundSnow":function(d){return "set snow background"},
"setBackgroundShip":function(d){return "set ship background"},
"setBackgroundTooltip":function(d){return "Postavlja pozadinsku sliku"},
"setEnemySpeed":function(d){return "postavi brzinu neprijatelja"},
"setItemSpeedSet":function(d){return "set type"},
"setItemSpeedTooltip":function(d){return "Sets the speed for a set of items"},
"setPlayerSpeed":function(d){return "postavi brzinu igrača"},
"setScoreText":function(d){return "postavi rezultat"},
"setScoreTextTooltip":function(d){return "Postavlja tekst koji će biti prikazan u području za prikaz bodova."},
"setSpriteEmotionAngry":function(d){return "ljutito raspoloženje"},
"setSpriteEmotionHappy":function(d){return "sretno raspoloženje"},
"setSpriteEmotionNormal":function(d){return "normalno raspoloženje"},
"setSpriteEmotionRandom":function(d){return "nasumično odabrano raspoloženje"},
"setSpriteEmotionSad":function(d){return "žalosno raspoloženje"},
"setSpriteEmotionTooltip":function(d){return "Postavlja raspoloženje lika"},
"setSpriteAlien":function(d){return "izgled vanzemaljca"},
"setSpriteBat":function(d){return "izgled šišmiša"},
"setSpriteBird":function(d){return "izgled ptice"},
"setSpriteCat":function(d){return "izgled mačke"},
"setSpriteCaveBoy":function(d){return "izgled pećinskog dječaka"},
"setSpriteCaveGirl":function(d){return "izgled pećinske djevojčice"},
"setSpriteDinosaur":function(d){return "izgled dinosaura"},
"setSpriteDog":function(d){return "izgled psa"},
"setSpriteDragon":function(d){return "izgled zmaja"},
"setSpriteGhost":function(d){return "izgled duha"},
"setSpriteHidden":function(d){return "skrivena slika"},
"setSpriteHideK1":function(d){return "sakrij"},
"setSpriteAnna":function(d){return "slika Anne"},
"setSpriteElsa":function(d){return "slika Else"},
"setSpriteHiro":function(d){return "slika Hiroa"},
"setSpriteBaymax":function(d){return "slika Baymaxa"},
"setSpriteRapunzel":function(d){return "slika Rapunzel"},
"setSpriteKnight":function(d){return "izgled viteza"},
"setSpriteMonster":function(d){return "izgled čudovišta"},
"setSpriteNinja":function(d){return "izgled maskiranog ninje"},
"setSpriteOctopus":function(d){return "izgled hobotnice"},
"setSpritePenguin":function(d){return "izgled pingvina"},
"setSpritePirate":function(d){return "izgled gusara"},
"setSpritePrincess":function(d){return "izgled princeze"},
"setSpriteRandom":function(d){return "nasumična slika"},
"setSpriteRobot":function(d){return "izgled robota"},
"setSpriteShowK1":function(d){return "prikaži"},
"setSpriteSpacebot":function(d){return "izgled robota svemirca"},
"setSpriteSoccerGirl":function(d){return "izgled nogometašice"},
"setSpriteSoccerBoy":function(d){return "izgled nogometaša"},
"setSpriteSquirrel":function(d){return "izgled vjeverice"},
"setSpriteTennisGirl":function(d){return "izgled teniserke"},
"setSpriteTennisBoy":function(d){return "izgled tenisera"},
"setSpriteUnicorn":function(d){return "izgled jednoroga"},
"setSpriteWitch":function(d){return "izgled vještice"},
"setSpriteWizard":function(d){return "izgled čarobnjaka"},
"setSpritePositionTooltip":function(d){return "Odmah premješta lik na zadanu poziciju."},
"setSpriteK1Tooltip":function(d){return "Prikazuje ili skriva zadani lik."},
"setSpriteTooltip":function(d){return "Postavlja izgled lika"},
"setSpriteSizeRandom":function(d){return "na nasumično odabranu veličinu"},
"setSpriteSizeVerySmall":function(d){return "na veoma malu veličinu"},
"setSpriteSizeSmall":function(d){return "na malu veličinu"},
"setSpriteSizeNormal":function(d){return "na normalnu veličinu"},
"setSpriteSizeLarge":function(d){return "na veliku veličinu"},
"setSpriteSizeVeryLarge":function(d){return "na veoma veliku veličinu"},
"setSpriteSizeTooltip":function(d){return "Postavlja veličinu lika"},
"setSpriteSpeedRandom":function(d){return "na nasumično odabranu brzinu"},
"setSpriteSpeedVerySlow":function(d){return "na jako malu brzinu"},
"setSpriteSpeedSlow":function(d){return "na sporo"},
"setSpriteSpeedNormal":function(d){return "na normalnu brzinu"},
"setSpriteSpeedFast":function(d){return "na brzo"},
"setSpriteSpeedVeryFast":function(d){return "na jako brzo"},
"setSpriteSpeedTooltip":function(d){return "Postavlja brzinu lika"},
"setSpriteZombie":function(d){return "izgled zombija"},
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
"shareStudioTwitter":function(d){return "Pogledaj priču koju sam smislio/la. Napisao/la sam je sam/a s @codeorg"},
"shareGame":function(d){return "Podijeli svoju priču:"},
"showCoordinates":function(d){return "pokaži koordinate"},
"showCoordinatesTooltip":function(d){return "na ekranu pokazuje koordinate glavnog lika"},
"showTitleScreen":function(d){return "pokaži početni ekran sa naslovom"},
"showTitleScreenTitle":function(d){return "naslov"},
"showTitleScreenText":function(d){return "tekst"},
"showTSDefTitle":function(d){return "ovdje napiši naslov"},
"showTSDefText":function(d){return "ovdje napiši tekst"},
"showTitleScreenTooltip":function(d){return "Pokazuje početni ekran s odgovarajućim naslovom i tekstom."},
"size":function(d){return "veličina"},
"setSprite":function(d){return "postavi"},
"setSpriteN":function(d){return "postavi lik "+studio_locale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "zvuk krckanja"},
"soundGoal1":function(d){return "cilj 1"},
"soundGoal2":function(d){return "cilj 2"},
"soundHit":function(d){return "pogodak"},
"soundLosePoint":function(d){return "izgubljen bod"},
"soundLosePoint2":function(d){return "izgubljen bod 2"},
"soundRetro":function(d){return "staromodni zvuk"},
"soundRubber":function(d){return "zvuk elastične gumice"},
"soundSlap":function(d){return "zvuk šamara"},
"soundWinPoint":function(d){return "osvojen bod"},
"soundWinPoint2":function(d){return "osvojen bod 2"},
"soundWood":function(d){return "zvuk drveta"},
"speed":function(d){return "brzina"},
"startSetValue":function(d){return "započni (funkcija visine rakete)"},
"startSetVars":function(d){return "game_vars (title, subtitle, background, target, danger, player)"},
"startSetFuncs":function(d){return "game_funcs (update-target, update-danger, update-player, collide?, on-screen?)"},
"stopSprite":function(d){return "zaustavi"},
"stopSpriteN":function(d){return "zaustavi lik "+studio_locale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Zaustavlja kretanje lika."},
"throwSprite":function(d){return "baci"},
"throwSpriteN":function(d){return "lik "+studio_locale.v(d,"spriteIndex")+" baca"},
"throwTooltip":function(d){return "Odabrani lik baca projektil."},
"vanish":function(d){return "nestani"},
"vanishActorN":function(d){return "učini da lik "+studio_locale.v(d,"spriteIndex")+" nestane"},
"vanishTooltip":function(d){return "Učini da lik nestane."},
"waitFor":function(d){return "čekaj na"},
"waitSeconds":function(d){return "sekunde"},
"waitForClick":function(d){return "čekaj na klik"},
"waitForRandom":function(d){return "čekaj na nasumično dugo"},
"waitForHalfSecond":function(d){return "čekaj pola sekunde"},
"waitFor1Second":function(d){return "čekaj 1 sekundu"},
"waitFor2Seconds":function(d){return "čekaj 2 sekunde"},
"waitFor5Seconds":function(d){return "čekaj 5 sekundi"},
"waitFor10Seconds":function(d){return "čekaj 10 sekundi"},
"waitParamsTooltip":function(d){return "Čeka određeni broj sekundi ili koristi nulu da bi čekao dok se ne klikne."},
"waitTooltip":function(d){return "Čeka određeno vrijeme ili dok se ne klikne."},
"whenArrowDown":function(d){return "strelica dolje"},
"whenArrowLeft":function(d){return "strelica lijevo"},
"whenArrowRight":function(d){return "strelica desno"},
"whenArrowUp":function(d){return "strelica gore"},
"whenArrowTooltip":function(d){return "Izvršava dolje navedene akcije kada se pritisne određena tipka sa strelicom."},
"whenDown":function(d){return "kada se pritisne strelica dolje"},
"whenDownTooltip":function(d){return "Izvrši sljedeće akcije kad se pritisne tipka dolje."},
"whenGameStarts":function(d){return "kad priča započne"},
"whenGameStartsTooltip":function(d){return "Izvršava sljedeće akcije kad priča započne."},
"whenLeft":function(d){return "kada se pritisne strelica prema lijevo"},
"whenLeftTooltip":function(d){return "Izvrši sljedeće akcije kad se pritisne strelica prema lijevo."},
"whenRight":function(d){return "kada se pritisne strelica prema desno"},
"whenRightTooltip":function(d){return "Izvrši sljedeće akcije kad se pritisne strelica prema desno."},
"whenSpriteClicked":function(d){return "kada se klikne na lik"},
"whenSpriteClickedN":function(d){return "kada se klikne na "+studio_locale.v(d,"spriteIndex")+" lik"},
"whenSpriteClickedTooltip":function(d){return "Izvršava dolje navedene akcije kada se klikne na lik."},
"whenSpriteCollidedN":function(d){return "kada lik "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "Izvršava dolje navedene akcije kada lik dotakne neki drugi lik."},
"whenSpriteCollidedWith":function(d){return "dotiče"},
"whenSpriteCollidedWithAnyActor":function(d){return "dotiče bilo koji lik"},
"whenSpriteCollidedWithAnyEdge":function(d){return "dotiče bilo koju ivicu"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "dotiče bilo koji projektil"},
"whenSpriteCollidedWithAnything":function(d){return "dotiče bilo šta"},
"whenSpriteCollidedWithN":function(d){return "dotiče lik "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "dotiče plavu vatrenu kuglu"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "dotiče ljubičastu vatrenu kuglu"},
"whenSpriteCollidedWithRedFireball":function(d){return "dotiče crvenu vatrenu kuglu"},
"whenSpriteCollidedWithYellowHearts":function(d){return "dotiče žuta srca"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "dotiče ljubičasta srca"},
"whenSpriteCollidedWithRedHearts":function(d){return "dotiče crvena srca"},
"whenSpriteCollidedWithBottomEdge":function(d){return "dotiče donju ivicu"},
"whenSpriteCollidedWithLeftEdge":function(d){return "dotiče lijevu ivicu"},
"whenSpriteCollidedWithRightEdge":function(d){return "dotiče desnu ivicu"},
"whenSpriteCollidedWithTopEdge":function(d){return "dotiče gornju ivicu"},
"whenTouchItem":function(d){return "when item touched"},
"whenTouchItemTooltip":function(d){return "Execute the actions below when the actor touches an item."},
"whenTouchWall":function(d){return "when wall touched"},
"whenTouchWallTooltip":function(d){return "Execute the actions below when the actor touches a wall."},
"whenUp":function(d){return "kadase pritisne strelica prema gore"},
"whenUpTooltip":function(d){return "Izvrši sljedeće akcije kad se pritisne strelica prema gore."},
"yes":function(d){return "Da"},
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