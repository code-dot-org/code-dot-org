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
"addCharacter":function(d){return "dodaj"},
"addCharacterTooltip":function(d){return "Dodaj lik na scenu."},
"alienInvasion":function(d){return "Napad vanzemaljaca!"},
"backgroundBlack":function(d){return "crno"},
"backgroundCave":function(d){return "špilja"},
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
"catText":function(d){return "tekst"},
"catVariables":function(d){return "Varijable"},
"changeScoreTooltip":function(d){return "Dodaje ili oduzima bod."},
"changeScoreTooltipK1":function(d){return "Dodaje bod."},
"continue":function(d){return "Nastavi"},
"decrementPlayerScore":function(d){return "oduzmi bod"},
"defaultSayText":function(d){return "piši ovdje"},
"dropletBlock_addCharacter_description":function(d){return "Dodaj lik na scenu."},
"dropletBlock_addCharacter_param0":function(d){return "type"},
"dropletBlock_addCharacter_param0_description":function(d){return "The type of the character to be added ('random', 'man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_changeScore_description":function(d){return "Dodaje ili oduzima bod."},
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
"dropletBlock_playSound_description":function(d){return "Pušta odrabrani zvuk."},
"dropletBlock_playSound_param0":function(d){return "sound"},
"dropletBlock_playSound_param0_description":function(d){return "The name of the sound to play."},
"dropletBlock_setBackground_description":function(d){return "Postavlja sliku pozadine"},
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
"dropletBlock_throw_description":function(d){return "Baca projektil iz odabranog lika."},
"dropletBlock_vanish_description":function(d){return "Čini da lik nestane."},
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
"itemAnna":function(d){return "kuka"},
"itemElsa":function(d){return "iskra"},
"itemHiro":function(d){return "mikroboti"},
"itemBaymax":function(d){return "raketa"},
"itemRapunzel":function(d){return "lonac"},
"itemCherry":function(d){return "trešnja"},
"itemIce":function(d){return "led"},
"itemDuck":function(d){return "patka"},
"itemMan":function(d){return "čovjek"},
"itemPilot":function(d){return "pilot"},
"itemPig":function(d){return "svinja"},
"itemBird":function(d){return "ptica"},
"itemMouse":function(d){return "miš"},
"itemRoo":function(d){return "kengur"},
"itemSpider":function(d){return "pauk"},
"makeProjectileDisappear":function(d){return "nestati"},
"makeProjectileBounce":function(d){return "odskočiti"},
"makeProjectileBlueFireball":function(d){return "napravi plavu vatrenu kuglu"},
"makeProjectilePurpleFireball":function(d){return "napravi ljubičastu vatrenu kuglu"},
"makeProjectileRedFireball":function(d){return "napravi crvenu vatrenu kuglu"},
"makeProjectileYellowHearts":function(d){return "napravi žuta srca"},
"makeProjectilePurpleHearts":function(d){return "napravi ljubičasta srca"},
"makeProjectileRedHearts":function(d){return "napravi crvena srca"},
"makeProjectileTooltip":function(d){return "Napravi da projektil koji se sudario nestane ili da se odbije."},
"makeYourOwn":function(d){return "Napravi vlastitu igricu laboratorija"},
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
"moveDownTooltip":function(d){return "Pomiče lik dolje."},
"moveLeft":function(d){return "pomakni lijevo"},
"moveLeftTooltip":function(d){return "Pomiče lik ulijevo."},
"moveRight":function(d){return "pomakni desno"},
"moveRightTooltip":function(d){return "Pomiče lik udesno."},
"moveUp":function(d){return "pomakni gore"},
"moveUpTooltip":function(d){return "Pomiče lik gore."},
"moveTooltip":function(d){return "Pomiče lik."},
"nextLevel":function(d){return "Čestitamo! Ovaj zadatak je riješen."},
"no":function(d){return "Ne"},
"numBlocksNeeded":function(d){return "Ovaj zadatak se može riješiti s %1 blokova."},
"onEventTooltip":function(d){return "Pokreni kod kao odgovor na navedeni događaj."},
"ouchExclamation":function(d){return "Jao!"},
"playSoundCrunch":function(d){return "pokreni zvuk krckanja"},
"playSoundGoal1":function(d){return "pokreni zvuk cilj 1"},
"playSoundGoal2":function(d){return "pokreni zvuk cilj 2"},
"playSoundHit":function(d){return "pokreni zvuk udara"},
"playSoundLosePoint":function(d){return "pokreni zvuk gubitak boda"},
"playSoundLosePoint2":function(d){return "pokreni zvuk izgubljen bod 2"},
"playSoundRetro":function(d){return "pokreni retro zvuk"},
"playSoundRubber":function(d){return "pokreni zvuk gume"},
"playSoundSlap":function(d){return "pokreni zvuk pljeska"},
"playSoundTooltip":function(d){return "Pokreni odabrani zvuk."},
"playSoundWinPoint":function(d){return "pokreni zvuk dobiveni bod"},
"playSoundWinPoint2":function(d){return "pokreni zvuk dobiven bod 2"},
"playSoundWood":function(d){return "pokreni zvuk drvo"},
"positionOutTopLeft":function(d){return "na položaj iznad gore lijevo"},
"positionOutTopRight":function(d){return "na položaj iznad gore desno"},
"positionTopOutLeft":function(d){return "na položaj izvana gore lijevo"},
"positionTopLeft":function(d){return "na položaj gore lijevo"},
"positionTopCenter":function(d){return "na položaj gore u sredinu"},
"positionTopRight":function(d){return "na položaj gore desno"},
"positionTopOutRight":function(d){return "na položaj izvana gore desno"},
"positionMiddleLeft":function(d){return "na položaj u sredinu lijevo"},
"positionMiddleCenter":function(d){return "na položaj u sredinu sredine"},
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
"projectileAnna":function(d){return "kuka"},
"projectileElsa":function(d){return "iskra"},
"projectileHiro":function(d){return "mikroboti"},
"projectileBaymax":function(d){return "raketa"},
"projectileRapunzel":function(d){return "lonac"},
"projectileCherry":function(d){return "trešnja"},
"projectileIce":function(d){return "led"},
"projectileDuck":function(d){return "patka"},
"reinfFeedbackMsg":function(d){return "Možete pritisnuti \""+studio_locale.v(d,"backButton")+"\" gumb za povratak na izvršavanje vaše priče."},
"repeatForever":function(d){return "ponavljaj zauvijek"},
"repeatDo":function(d){return "napravi"},
"repeatForeverTooltip":function(d){return "Opetovano izvršava akcije u bloku, dok god se program izvršava."},
"saySprite":function(d){return "reći"},
"saySpriteN":function(d){return "lik "+studio_locale.v(d,"spriteIndex")+" kaže"},
"saySpriteTooltip":function(d){return "Zadanom liku stvara strip-oblačić s pripadnim tekstom."},
"saySpriteChoices_0":function(d){return "Bok."},
"saySpriteChoices_1":function(d){return "Bok svima."},
"saySpriteChoices_2":function(d){return "Kako si?"},
"saySpriteChoices_3":function(d){return "Dobro jutro"},
"saySpriteChoices_4":function(d){return "Dobar dan"},
"saySpriteChoices_5":function(d){return "Laku noć"},
"saySpriteChoices_6":function(d){return "Dobra večer"},
"saySpriteChoices_7":function(d){return "Što je novo?"},
"saySpriteChoices_8":function(d){return "Što?"},
"saySpriteChoices_9":function(d){return "Gdje?"},
"saySpriteChoices_10":function(d){return "Kada?"},
"saySpriteChoices_11":function(d){return "Dobro."},
"saySpriteChoices_12":function(d){return "Odlično!"},
"saySpriteChoices_13":function(d){return "U redu."},
"saySpriteChoices_14":function(d){return "Nije loše."},
"saySpriteChoices_15":function(d){return "Sretno."},
"saySpriteChoices_16":function(d){return "Da"},
"saySpriteChoices_17":function(d){return "Ne"},
"saySpriteChoices_18":function(d){return "U redu"},
"saySpriteChoices_19":function(d){return "Dobar pokušaj!"},
"saySpriteChoices_20":function(d){return "Ugodan dan."},
"saySpriteChoices_21":function(d){return "Bok."},
"saySpriteChoices_22":function(d){return "Odmah se vraćam."},
"saySpriteChoices_23":function(d){return "Vidimo se sutra!"},
"saySpriteChoices_24":function(d){return "Vidimo se kasnije!"},
"saySpriteChoices_25":function(d){return "Čuvaj se!"},
"saySpriteChoices_26":function(d){return "Uživaj!"},
"saySpriteChoices_27":function(d){return "Moram ići."},
"saySpriteChoices_28":function(d){return "Želiš da budemo prijatelji?"},
"saySpriteChoices_29":function(d){return "Odličan posao!"},
"saySpriteChoices_30":function(d){return "Jupi!"},
"saySpriteChoices_31":function(d){return "Super!"},
"saySpriteChoices_32":function(d){return "Drago mi je da smo se upoznali."},
"saySpriteChoices_33":function(d){return "U redu!"},
"saySpriteChoices_34":function(d){return "Hvala ti"},
"saySpriteChoices_35":function(d){return "Ne, hvala"},
"saySpriteChoices_36":function(d){return "Aaaaaah!"},
"saySpriteChoices_37":function(d){return "Nema veze"},
"saySpriteChoices_38":function(d){return "Danas"},
"saySpriteChoices_39":function(d){return "Sutra"},
"saySpriteChoices_40":function(d){return "Jučer"},
"saySpriteChoices_41":function(d){return "Našao sam te!"},
"saySpriteChoices_42":function(d){return "Našao si me!"},
"saySpriteChoices_43":function(d){return "10, 9, 8, 7, 6, 5, 4, 3, 2, 1!"},
"saySpriteChoices_44":function(d){return "Sjajan/a si!"},
"saySpriteChoices_45":function(d){return "Smiješan/a si!"},
"saySpriteChoices_46":function(d){return "Ti si šašav/a! "},
"saySpriteChoices_47":function(d){return "Ti si dobar prijatelj/prijateljica!"},
"saySpriteChoices_48":function(d){return "Pazi!"},
"saySpriteChoices_49":function(d){return "Sagni se!"},
"saySpriteChoices_50":function(d){return "Imam te!"},
"saySpriteChoices_51":function(d){return "Oh!"},
"saySpriteChoices_52":function(d){return "Oprostite!"},
"saySpriteChoices_53":function(d){return "Oprezno!"},
"saySpriteChoices_54":function(d){return "Čekaj!"},
"saySpriteChoices_55":function(d){return "Ups!"},
"saySpriteChoices_56":function(d){return "Skoro si me!"},
"saySpriteChoices_57":function(d){return "Dobar pokušaj!"},
"saySpriteChoices_58":function(d){return "Ne možeš me uhvatiti!"},
"scoreText":function(d){return "Rezultat: "+studio_locale.v(d,"playerScore")},
"setActivityRandom":function(d){return "postavlja aktivnosti za slučajan odabir"},
"setActivityRoam":function(d){return "postavlja aktivnosti da lutaju"},
"setActivityChase":function(d){return "postavlja aktivnost loviti za"},
"setActivityFlee":function(d){return "set activity to flee for"},
"setActivityNone":function(d){return "set activity to none for"},
"setActivityTooltip":function(d){return "Postavlja aktivnosti za skup likova"},
"setBackground":function(d){return "postavi pozadinu"},
"setBackgroundRandom":function(d){return "postavi nasumično odabranu pozadinu"},
"setBackgroundBlack":function(d){return "postavi crnu pozadinu"},
"setBackgroundCave":function(d){return "postavi pozadinu špilja"},
"setBackgroundCloudy":function(d){return "postavi oblačnu pozadinu"},
"setBackgroundHardcourt":function(d){return "postavi pozadinu beton"},
"setBackgroundNight":function(d){return "postavi noćnu pozadinu"},
"setBackgroundUnderwater":function(d){return "postavi pozadinu pod vodom"},
"setBackgroundCity":function(d){return "postavi gradsku pozadinu"},
"setBackgroundDesert":function(d){return "postavi pustinjsku pozadinu"},
"setBackgroundRainbow":function(d){return "postavi pozadinu s dugom"},
"setBackgroundSoccer":function(d){return "postavi nogomentu pozadinu"},
"setBackgroundSpace":function(d){return "postavi svemirsku pozadinu"},
"setBackgroundTennis":function(d){return "postavi tenisku pozadinu"},
"setBackgroundWinter":function(d){return "postavi zimsku pozadinu"},
"setBackgroundLeafy":function(d){return "postavi lisnatu pozadinu"},
"setBackgroundGrassy":function(d){return "stavi travnatu podlogu"},
"setBackgroundFlower":function(d){return "postavi cvjetnu podlogu"},
"setBackgroundTile":function(d){return "postavi podlogu od pločica"},
"setBackgroundIcy":function(d){return "postavi ledenu podlogu"},
"setBackgroundSnowy":function(d){return "postavi snježu podlogu"},
"setBackgroundForest":function(d){return "set forest background"},
"setBackgroundSnow":function(d){return "set snow background"},
"setBackgroundShip":function(d){return "set ship background"},
"setBackgroundTooltip":function(d){return "Postavlja sliku pozadine"},
"setEnemySpeed":function(d){return "postavi brzinu neprijatelja"},
"setItemSpeedSet":function(d){return "set type"},
"setItemSpeedTooltip":function(d){return "Sets the speed for a set of items"},
"setPlayerSpeed":function(d){return "postavi brzinu igrača"},
"setScoreText":function(d){return "postavi rezultat"},
"setScoreTextTooltip":function(d){return "Postavlja tekst koji će biti prikazan u području bodova."},
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
"setSpriteCaveBoy":function(d){return "izgled špiljskog dječaka"},
"setSpriteCaveGirl":function(d){return "izgled špiljske djevojčice"},
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
"setSpriteRapunzel":function(d){return "slika Rapunzela"},
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
"setSpriteSpacebot":function(d){return "izgled svemirca"},
"setSpriteSoccerGirl":function(d){return "izgled nogometašice"},
"setSpriteSoccerBoy":function(d){return "izgled nogometaša"},
"setSpriteSquirrel":function(d){return "izgled vjeverice"},
"setSpriteTennisGirl":function(d){return "izgled tenisačice"},
"setSpriteTennisBoy":function(d){return "izgled tenisača"},
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
"setSpriteSpeedVerySlow":function(d){return "za jako sporu brzinu"},
"setSpriteSpeedSlow":function(d){return "za sporu brzinu"},
"setSpriteSpeedNormal":function(d){return "za normalnu brzinu"},
"setSpriteSpeedFast":function(d){return "za brzu brzinu"},
"setSpriteSpeedVeryFast":function(d){return "za jako brzu brzinu"},
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
"showTitleScreen":function(d){return "pokaži početni ekran"},
"showTitleScreenTitle":function(d){return "naslov"},
"showTitleScreenText":function(d){return "tekst"},
"showTSDefTitle":function(d){return "ovdje napiši naslov"},
"showTSDefText":function(d){return "ovdje napiši tekst"},
"showTitleScreenTooltip":function(d){return "Pokazuje početni ekran s odgovarajućim naslovom i tekstom."},
"size":function(d){return "veličina"},
"setSprite":function(d){return "postaviti"},
"setSpriteN":function(d){return "postavi lik "+studio_locale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "krckati"},
"soundGoal1":function(d){return "cilj 1"},
"soundGoal2":function(d){return "cilj 2"},
"soundHit":function(d){return "pogodak"},
"soundLosePoint":function(d){return "izgubljen bod"},
"soundLosePoint2":function(d){return "izgubljen bod 2"},
"soundRetro":function(d){return "retro"},
"soundRubber":function(d){return "guma"},
"soundSlap":function(d){return "pljuska"},
"soundWinPoint":function(d){return "osvojen bod"},
"soundWinPoint2":function(d){return "osvojen bod 2"},
"soundWood":function(d){return "drvo"},
"speed":function(d){return "brzina"},
"startSetValue":function(d){return "start (funkcija)"},
"startSetVars":function(d){return "igrine_varijable (naslov, podnaslov, pozadina, cilj, opasnost, igrač)"},
"startSetFuncs":function(d){return "igrine_funkcije (osvježi-metu, osvježi-opasnost, osvježi-igrača, sudaranje?, na zaslonu?)"},
"stopSprite":function(d){return "zaustaviti"},
"stopSpriteN":function(d){return "zaustavi lik "+studio_locale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Zaustavlja kretanje lika."},
"throwSprite":function(d){return "baciti"},
"throwSpriteN":function(d){return "lik "+studio_locale.v(d,"spriteIndex")+" baca"},
"throwTooltip":function(d){return "Baca projektil iz odabranog lika."},
"vanish":function(d){return "nestati"},
"vanishActorN":function(d){return "nestaje lik "+studio_locale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "Čini da lik nestane."},
"waitFor":function(d){return "čekaj"},
"waitSeconds":function(d){return "sekunde"},
"waitForClick":function(d){return "čekaj klik"},
"waitForRandom":function(d){return "čekaj nasumično dugo"},
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
"whenDown":function(d){return "kad strelica dolje"},
"whenDownTooltip":function(d){return "Izvrši sljedeće akcije kad se pritisne tipka dolje."},
"whenGameStarts":function(d){return "kad priča započne"},
"whenGameStartsTooltip":function(d){return "Izvršava sljedeće akcije kad priča započne."},
"whenLeft":function(d){return "kad lijeva strelica"},
"whenLeftTooltip":function(d){return "Izvrši sljedeće akcije kad se pritisne lijeva strelica."},
"whenRight":function(d){return "kad desna strelica"},
"whenRightTooltip":function(d){return "Izvrši sljedeće akcije kad se pritisne desna strelica."},
"whenSpriteClicked":function(d){return "kada se klikne lik"},
"whenSpriteClickedN":function(d){return "kada se klikne "+studio_locale.v(d,"spriteIndex")+" lik"},
"whenSpriteClickedTooltip":function(d){return "Izvršava dolje navedene akcije kada se klikne lik."},
"whenSpriteCollidedN":function(d){return "kada lik "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "Izvršava dolje navedene akcije kada lik takne neki drugi lik."},
"whenSpriteCollidedWith":function(d){return "dotaknuti"},
"whenSpriteCollidedWithAnyActor":function(d){return "dotakne bilo koji lik"},
"whenSpriteCollidedWithAnyEdge":function(d){return "dotakne bilo koji rub"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "dotakne bilo koji projektil"},
"whenSpriteCollidedWithAnything":function(d){return "dotakne bilo što"},
"whenSpriteCollidedWithN":function(d){return "dotakne lik "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "dotakne plavu vatrenu kuglu"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "dotakne ljubičastu vatrenu kuglu"},
"whenSpriteCollidedWithRedFireball":function(d){return "dotakne crvenu vatrenu kuglu"},
"whenSpriteCollidedWithYellowHearts":function(d){return "dotakne žuta srca"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "dotakne ljubičasta srca"},
"whenSpriteCollidedWithRedHearts":function(d){return "dotakne crvena srca"},
"whenSpriteCollidedWithBottomEdge":function(d){return "dotakne donji rub"},
"whenSpriteCollidedWithLeftEdge":function(d){return "dotakne lijevu rub"},
"whenSpriteCollidedWithRightEdge":function(d){return "dotakne desni rub"},
"whenSpriteCollidedWithTopEdge":function(d){return "dotakne gornji rub"},
"whenTouchItem":function(d){return "when character touched"},
"whenTouchItemTooltip":function(d){return "Execute the actions below when the actor touches a character."},
"whenTouchWall":function(d){return "when obstacle touched"},
"whenTouchWallTooltip":function(d){return "Execute the actions below when the actor touches an obstacle."},
"whenUp":function(d){return "kad strelica gore"},
"whenUpTooltip":function(d){return "Izvrši sljedeće akcije kad se pritisne strelica gore."},
"yes":function(d){return "Da"},
"failedHasSetSprite":function(d){return "Next time, set a character."},
"failedHasSetBotSpeed":function(d){return "Next time, set a bot speed."},
"failedTouchAllItems":function(d){return "Next time, get all the items."},
"failedScoreMinimum":function(d){return "Next time, reach the minimum score."},
"failedRemovedItemCount":function(d){return "Next time, get the right number of items."},
"failedSetActivity":function(d){return "Next time, set the correct character activity."},
"addPoints10":function(d){return "add 10 points"},
"addPoints50":function(d){return "add 50 points"},
"addPoints100":function(d){return "add 100 points"},
"addPoints400":function(d){return "add 400 points"},
"addPoints1000":function(d){return "add 1000 points"},
"addPointsTooltip":function(d){return "Add points to the score."},
"calloutPutCommandsHereRunStart":function(d){return "Put commands here to have them run when the program starts"},
"calloutClickEvents":function(d){return "Click on the events header to see event function blocks."},
"calloutUseArrowButtons":function(d){return "Hold down these buttons or the arrow keys on your keyboard to trigger the move events"},
"calloutUseArrowButtonsAutoSteer":function(d){return "You can still use these buttons or the arrow keys on your keyboard to move"},
"calloutMoveRightRunButton":function(d){return "Add a second moveRight command to your code and then click here to run it"},
"calloutShowCodeToggle":function(d){return "Click here to switch between block and text mode"},
"calloutShowPlaceGoUpHere":function(d){return "Place goUp command here to move up"},
"calloutShowPlaySound":function(d){return "It's your game, so you choose the sounds now. Try the dropdown to pick a different sound"},
"calloutInstructions":function(d){return "Don't know what to do? Click the instructions to see them again"},
"calloutPlaceTwo":function(d){return "Can you make two MOUSEs appear when you get one MOUSE?"},
"calloutPlaceTwoWhenBird":function(d){return "Can you make two MOUSEs appear when you get a BIRD?"},
"calloutSetMapAndSpeed":function(d){return "Set the map and your speed."},
"calloutFinishButton":function(d){return "Click here when you are ready to share your game."},
"tapOrClickToPlay":function(d){return "Tap or click to play"},
"tapOrClickToReset":function(d){return "Tap or click to reset"},
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
"hoc2015_lastLevel_continueText":function(d){return "Done"},
"hoc2015_reinfFeedbackMsg":function(d){return "You can press the \""+studio_locale.v(d,"backButton")+"\" button to go back to playing your game."},
"hoc2015_shareGame":function(d){return "Share your game:"},
"iceAge":function(d){return "Ice Age!"},
"itemIAProjectile1":function(d){return "hearts"},
"itemIAProjectile2":function(d){return "boulder"},
"itemIAProjectile3":function(d){return "ice cube"},
"itemIAProjectile4":function(d){return "snowflake"},
"itemIAProjectile5":function(d){return "ice crystal"},
"loseMessage":function(d){return "You lose!"},
"projectileIAProjectile1":function(d){return "hearts"},
"projectileIAProjectile2":function(d){return "boulder"},
"projectileIAProjectile3":function(d){return "ice cube"},
"projectileIAProjectile4":function(d){return "snowflake"},
"projectileIAProjectile5":function(d){return "ice crystal"},
"removePoints10":function(d){return "remove 10 points"},
"removePoints50":function(d){return "remove 50 points"},
"removePoints100":function(d){return "remove 100 points"},
"removePoints400":function(d){return "remove 400 points"},
"removePoints1000":function(d){return "remove 1000 points"},
"removePointsTooltip":function(d){return "Remove points from the score."},
"setSpriteManny":function(d){return "to a Manny image"},
"setSpriteSid":function(d){return "to a Sid image"},
"setSpriteGranny":function(d){return "to a Granny image"},
"setSpriteDiego":function(d){return "to a Diego image"},
"setSpriteScrat":function(d){return "to a Scrat image"},
"whenGetCharacterPIG":function(d){return "when get PIG"},
"whenGetCharacterMAN":function(d){return "when get MAN"},
"whenGetCharacterROO":function(d){return "when get ROO"},
"whenGetCharacterBIRD":function(d){return "when get BIRD"},
"whenGetCharacterSPIDER":function(d){return "when get SPIDER"},
"whenGetCharacterMOUSE":function(d){return "when get MOUSE"},
"whenGetCharacterPILOT":function(d){return "when get PILOT"},
"whenGetCharacterTooltip":function(d){return "Execute the actions below when an actor gets the specified type of character."},
"whenTouchCharacter":function(d){return "when character touched"},
"whenTouchCharacterTooltip":function(d){return "Execute the actions below when the actor touches a character."},
"whenTouchObstacle":function(d){return "when obstacle touched"},
"whenTouchObstacleTooltip":function(d){return "Execute the actions below when the actor touches an obstacle."},
"whenTouchGoal":function(d){return "when goal touched"},
"whenTouchGoalTooltip":function(d){return "Execute the actions below when the actor touches a goal."},
"winMessage":function(d){return "You win!"},
"failedHasSetBackground":function(d){return "Next time, set the background."},
"failedHasSetMap":function(d){return "Next time, set the map."},
"failedHasWonGame":function(d){return "Next time, win the game."},
"failedHasLostGame":function(d){return "Next time, lose the game"},
"failedAddItem":function(d){return "Next time, add a character."},
"failedAvoidHazard":function(d){return "\"Uh oh, a GUY got you!  Try again.\""},
"failedHasAllGoals":function(d){return "\"Try again, BOTX.  You can get it.\""},
"successHasAllGoals":function(d){return "\"You did it, BOTX!\""},
"successCharacter1":function(d){return "\"Well done, BOT1!\""},
"successGenericCharacter":function(d){return "\"Congratulations.  You did it!\""},
"failedTwoItemsTimeout":function(d){return "You need to get the pilots before time runs out. To move, put the goUp and goDown commands inside the whenUp and whenDown functions. Then, press and hold the arrow keys on your keyboard (or screen) to move quickly."},
"failedFourItemsTimeout":function(d){return "To pass this level, you'll need to put goLeft, goRight, goUp and goDown into the right functions. If your code looks correct, but you can't get there fast enough, try pressing and holding the arrow keys on your keyboard (or screen)."},
"failedScoreTimeout":function(d){return "Try to reach all the pilots before time runs out. To move faster, press and hold the arrow keys on your keyboard (or screen)."},
"failedScoreScore":function(d){return "You got the pilots, but you still don't have enough points to pass the level. Use the addPoints command to add 100 points when you get a pilot."},
"failedScoreGoals":function(d){return "You used the addPoints command, but not in the right place. Can you put it inside the whenGetPilot function so BOT1 can't get points until he gets a pilot?"},
"failedWinLoseTimeout":function(d){return "Try to reach all the pilots before time runs out. To move faster, press and hold the arrow keys on your keyboard (or screen)."},
"failedWinLoseScore":function(d){return "You got the pilots, but you still don't have enough points to pass the level. Use the addPoints command to add 100 points when you get a pilot. Use removePoints to subtract 100 when you touch a MAN. Avoid the MANs!"},
"failedWinLoseGoals":function(d){return "You used the addPoints command, but not in the right place. Can you make it so that the command is only called when you get the pilot? Also, remove points when you touch the MAN."},
"failedAddCharactersTimeout":function(d){return "Use three addCharacter commands at the top of your program to add PIGs when you hit run. Now go get them."},
"failedChainCharactersTimeout":function(d){return "You need to get 20 MOUSEs. They move fast. Try pressing and holding the keys on your keyboard (or screen) to chase them."},
"failedChainCharactersScore":function(d){return "You got the MOUSEs, but you don't have enough points to move to the next level. Make sure you add 100 points to your score every time you get a MOUSE?"},
"failedChainCharactersItems":function(d){return "You used the addPoints command, but not in the right place.  Can you make it so that the command is only called when you get the MOUSEs?"},
"failedChainCharacters2Timeout":function(d){return "You need to get 8 MOUSEs. Can you make two (or more) of them appear every time you get a ROO?"},
"failedChangeSettingTimeout":function(d){return "Get 3 pilots to move on."},
"failedChangeSettingSettings":function(d){return "Make the level your own. To pass this level, you need to change the map and set your speed."}};