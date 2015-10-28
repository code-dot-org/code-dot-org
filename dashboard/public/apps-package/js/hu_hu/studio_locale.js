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
"actor":function(d){return "szereplő"},
"addCharacter":function(d){return "add a"},
"addCharacterTooltip":function(d){return "Add a character to the scene."},
"alienInvasion":function(d){return "Földönkívüli invázió!"},
"backgroundBlack":function(d){return "fekete"},
"backgroundCave":function(d){return "barlang"},
"backgroundCloudy":function(d){return "felhős"},
"backgroundHardcourt":function(d){return "salakos"},
"backgroundNight":function(d){return "éjszaka"},
"backgroundUnderwater":function(d){return "vízalatti"},
"backgroundCity":function(d){return "város"},
"backgroundDesert":function(d){return "sivatag"},
"backgroundRainbow":function(d){return "szivárvány"},
"backgroundSoccer":function(d){return "foci"},
"backgroundSpace":function(d){return "világűr"},
"backgroundTennis":function(d){return "tenisz"},
"backgroundWinter":function(d){return "téli"},
"calloutPlaceCommandsHere":function(d){return "Place commands here"},
"calloutPlaceCommandsAtTop":function(d){return "Place commands to set up your game at the top"},
"calloutTypeCommandsHere":function(d){return "Type your commands here"},
"calloutCharactersMove":function(d){return "These new commands let you control how the characters move"},
"calloutPutCommandsTouchCharacter":function(d){return "Put a command here to have it happen when you touch a character"},
"calloutClickCategory":function(d){return "Click a category header to see commands in each category"},
"calloutTryOutNewCommands":function(d){return "Try out all the new commands you’ve unlocked"},
"catActions":function(d){return "Műveletek"},
"catControl":function(d){return "hurkok"},
"catEvents":function(d){return "Események"},
"catLogic":function(d){return "Logika"},
"catMath":function(d){return "Matematika"},
"catProcedures":function(d){return "funkciók"},
"catText":function(d){return "szöveg"},
"catVariables":function(d){return "változók"},
"changeScoreTooltip":function(d){return "Adj hozzá vagy vegyél el egy pontot a pontszámból."},
"changeScoreTooltipK1":function(d){return "Adj egy pontot a pontszámhoz."},
"continue":function(d){return "Tovább"},
"decrementPlayerScore":function(d){return "távolítsd el a pontot"},
"defaultSayText":function(d){return "Ide írj"},
"dropletBlock_addCharacter_description":function(d){return "Add a character to the scene."},
"dropletBlock_addCharacter_param0":function(d){return "type"},
"dropletBlock_addCharacter_param0_description":function(d){return "The type of the character to be added ('random', 'man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_changeScore_description":function(d){return "Adj hozzá vagy vegyél el egy pontot a pontszámból."},
"dropletBlock_changeScore_param0":function(d){return "pontszám"},
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
"dropletBlock_playSound_description":function(d){return "Kiválasztott hang lejátszása."},
"dropletBlock_playSound_param0":function(d){return "sound"},
"dropletBlock_playSound_param0_description":function(d){return "The name of the sound to play."},
"dropletBlock_setBackground_description":function(d){return "Add meg a háttér képet"},
"dropletBlock_setBackground_param0":function(d){return "image"},
"dropletBlock_setBackground_param0_description":function(d){return "The name of the background theme ('background1', 'background2', or 'background3')."},
"dropletBlock_setBot_description":function(d){return "Changes the active bot."},
"dropletBlock_setBot_param0":function(d){return "image"},
"dropletBlock_setBot_param0_description":function(d){return "The name of the bot image ('random', 'bot1', or 'bot2')."},
"dropletBlock_setBotSpeed_description":function(d){return "Sets the bot speed."},
"dropletBlock_setBotSpeed_param0":function(d){return "sebesség"},
"dropletBlock_setBotSpeed_param0_description":function(d){return "The speed value ('random', 'slow', 'normal', or 'fast')."},
"dropletBlock_setSpriteEmotion_description":function(d){return "Szereplő hangulatának beállítása"},
"dropletBlock_setSpritePosition_description":function(d){return "Egy szereplő azonnal átkerül a megadott helyre."},
"dropletBlock_setSpriteSpeed_description":function(d){return "A szereplő sebességének beállítása"},
"dropletBlock_setSprite_description":function(d){return "A szereplő külsejének beállítása"},
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
"dropletBlock_throw_description":function(d){return "Adott karakter dobja a lövedéket."},
"dropletBlock_vanish_description":function(d){return "Eltünteti a szereplőt."},
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
"emotion":function(d){return "hangulat"},
"finalLevel":function(d){return "Gratulálok, megoldottad az utolsó feladatot."},
"for":function(d){return "ciklus"},
"hello":function(d){return "helló"},
"helloWorld":function(d){return "Helló világ!"},
"incrementPlayerScore":function(d){return "pontszám"},
"itemBlueFireball":function(d){return "kék tűzgolyó"},
"itemPurpleFireball":function(d){return "lila tűzgolyó"},
"itemRedFireball":function(d){return "piros tűzgolyó"},
"itemYellowHearts":function(d){return "sárga szívek"},
"itemPurpleHearts":function(d){return "lila szívek"},
"itemRedHearts":function(d){return "piros szívek"},
"itemRandom":function(d){return "véletlen"},
"itemAnna":function(d){return "horog"},
"itemElsa":function(d){return "szikra"},
"itemHiro":function(d){return "mikrobot"},
"itemBaymax":function(d){return "rakéta"},
"itemRapunzel":function(d){return "serpenyő"},
"itemCherry":function(d){return "cseresznye"},
"itemIce":function(d){return "jég"},
"itemDuck":function(d){return "kacsa"},
"itemMan":function(d){return "man"},
"itemPilot":function(d){return "pilot"},
"itemPig":function(d){return "pig"},
"itemBird":function(d){return "bird"},
"itemMouse":function(d){return "mouse"},
"itemRoo":function(d){return "roo"},
"itemSpider":function(d){return "spider"},
"makeProjectileDisappear":function(d){return "eltűnik"},
"makeProjectileBounce":function(d){return "visszapattan"},
"makeProjectileBlueFireball":function(d){return "legyen kék a tűzgolyó"},
"makeProjectilePurpleFireball":function(d){return "legyen lila a tűzgolyó"},
"makeProjectileRedFireball":function(d){return "legyen piros a tűzgolyó"},
"makeProjectileYellowHearts":function(d){return "csinálj sárga szíveket"},
"makeProjectilePurpleHearts":function(d){return "csinálj lila szíveket"},
"makeProjectileRedHearts":function(d){return "csinálj piros szíveket"},
"makeProjectileTooltip":function(d){return "Állítsd be, hogy az éppen ütköző lövedék eltűnjön vagy visszapattanjon."},
"makeYourOwn":function(d){return "Készíts saját Játéklabor alkalmazást"},
"moveDirectionDown":function(d){return "le"},
"moveDirectionLeft":function(d){return "balra"},
"moveDirectionRight":function(d){return "jobbra"},
"moveDirectionUp":function(d){return "fel"},
"moveDirectionRandom":function(d){return "véletlen"},
"moveDistance25":function(d){return "25 képpont"},
"moveDistance50":function(d){return "50 képpont"},
"moveDistance100":function(d){return "100 képpont"},
"moveDistance200":function(d){return "200 képpont"},
"moveDistance400":function(d){return "400 képpont"},
"moveDistancePixels":function(d){return "képpontok"},
"moveDistanceRandom":function(d){return "véletlenszerű képpontok"},
"moveDistanceTooltip":function(d){return "Mozgass egy szereplőt egy meghatározott távolságra a megadott irányba."},
"moveSprite":function(d){return "mozogj"},
"moveSpriteN":function(d){return "mozgasd a "+studio_locale.v(d,"spriteIndex")+". szereplőt"},
"toXY":function(d){return "x,y-ig"},
"moveDown":function(d){return "lejjebb"},
"moveDownTooltip":function(d){return "Mozgass egy szereplőt lefele."},
"moveLeft":function(d){return "balra"},
"moveLeftTooltip":function(d){return "Mozgass egy szereplőt balra."},
"moveRight":function(d){return "jobbra"},
"moveRightTooltip":function(d){return "Mozgass egy szereplőt jobbra."},
"moveUp":function(d){return "feljebb"},
"moveUpTooltip":function(d){return "Mozgass egy szereplőt felfele."},
"moveTooltip":function(d){return "Mozgass egy szereplőt."},
"nextLevel":function(d){return "Gratulálok! Ezt a feladatot megoldottad."},
"no":function(d){return "Nem"},
"numBlocksNeeded":function(d){return "Ez a feladat a(z) %1 blokkal megoldható."},
"onEventTooltip":function(d){return "Kódot futtat egy meghatározott esemény hatására."},
"ouchExclamation":function(d){return "Jaj!"},
"playSoundCrunch":function(d){return "recsegő hang lejátszása"},
"playSoundGoal1":function(d){return "1. cél hang lejátszása"},
"playSoundGoal2":function(d){return "2. cél hang lejátszása"},
"playSoundHit":function(d){return "ütődés hang lejátszása"},
"playSoundLosePoint":function(d){return "pont elvesztése hang lejátszása"},
"playSoundLosePoint2":function(d){return "pont elvesztése hang 2 lejátszása"},
"playSoundRetro":function(d){return "retro hang lejátszása"},
"playSoundRubber":function(d){return "gumi hang lejátszása"},
"playSoundSlap":function(d){return "pofon hang lejátszása"},
"playSoundTooltip":function(d){return "Kiválasztott hang lejátszása."},
"playSoundWinPoint":function(d){return "pontnyerés hang lejátszása"},
"playSoundWinPoint2":function(d){return "pontnyerés hang 2 lejátszása"},
"playSoundWood":function(d){return "fa hang lejátszása"},
"positionOutTopLeft":function(d){return "bal felső állásba"},
"positionOutTopRight":function(d){return "jobb felső állásba"},
"positionTopOutLeft":function(d){return "legfelülre a bal külső pozícióba"},
"positionTopLeft":function(d){return "balra fölülre"},
"positionTopCenter":function(d){return "felülre középre"},
"positionTopRight":function(d){return "jobbra felülre"},
"positionTopOutRight":function(d){return "legfelülre a jobb külső pozícióba"},
"positionMiddleLeft":function(d){return "bal középsőre "},
"positionMiddleCenter":function(d){return "közép-középre"},
"positionMiddleRight":function(d){return "jobbra középre "},
"positionBottomOutLeft":function(d){return "legalulra a bal külső pozícióba"},
"positionBottomLeft":function(d){return "bal alsó pozícióba"},
"positionBottomCenter":function(d){return "alsó középső helyzetbe"},
"positionBottomRight":function(d){return "a jobb alsó pozícióba"},
"positionBottomOutRight":function(d){return "legalulra a jobb külső pozícióba"},
"positionOutBottomLeft":function(d){return "az alábbi bal alsó pozícióba"},
"positionOutBottomRight":function(d){return "az alábbi jobb alsó pozícióba"},
"positionRandom":function(d){return "véletlenszerű helyzetbe"},
"projectileBlueFireball":function(d){return "kék tűzgolyó"},
"projectilePurpleFireball":function(d){return "lila tűzgolyó"},
"projectileRedFireball":function(d){return "piros tűzgolyó"},
"projectileYellowHearts":function(d){return "sárga szívek"},
"projectilePurpleHearts":function(d){return "lila szívek"},
"projectileRedHearts":function(d){return "piros szívek"},
"projectileRandom":function(d){return "véletlen"},
"projectileAnna":function(d){return "horog"},
"projectileElsa":function(d){return "szikra"},
"projectileHiro":function(d){return "mikrobot"},
"projectileBaymax":function(d){return "rakéta"},
"projectileRapunzel":function(d){return "serpenyő"},
"projectileCherry":function(d){return "cseresznye"},
"projectileIce":function(d){return "jég"},
"projectileDuck":function(d){return "kacsa"},
"reinfFeedbackMsg":function(d){return "Nyomd meg a \""+studio_locale.v(d,"backButton")+"\" gombot, hogy visszatérj a történethez."},
"repeatForever":function(d){return "ismételd végtelenszer"},
"repeatDo":function(d){return "csináld"},
"repeatForeverTooltip":function(d){return "Hajtsd vége a műveleteket a blokkban ismételve miközben a történet zajlik."},
"saySprite":function(d){return "mondd"},
"saySpriteN":function(d){return studio_locale.v(d,"spriteIndex")+". szereplő mondja"},
"saySpriteTooltip":function(d){return "Ugorjon fel egy beszéd buborék, a megadott szereplő szövegével."},
"saySpriteChoices_0":function(d){return "Szia."},
"saySpriteChoices_1":function(d){return "Sziasztok."},
"saySpriteChoices_2":function(d){return "Hogy vagy?"},
"saySpriteChoices_3":function(d){return "Jó reggelt"},
"saySpriteChoices_4":function(d){return "Jó napot"},
"saySpriteChoices_5":function(d){return "Jó éjszakát"},
"saySpriteChoices_6":function(d){return "Jó estét"},
"saySpriteChoices_7":function(d){return "Mi újság?"},
"saySpriteChoices_8":function(d){return "Hogyan?"},
"saySpriteChoices_9":function(d){return "Hol?"},
"saySpriteChoices_10":function(d){return "Mikor?"},
"saySpriteChoices_11":function(d){return "Jó."},
"saySpriteChoices_12":function(d){return "Nagyszerű!"},
"saySpriteChoices_13":function(d){return "Rendben."},
"saySpriteChoices_14":function(d){return "Nem rossz."},
"saySpriteChoices_15":function(d){return "Sok szerencsét!"},
"saySpriteChoices_16":function(d){return "Igen"},
"saySpriteChoices_17":function(d){return "Nem"},
"saySpriteChoices_18":function(d){return "Oké"},
"saySpriteChoices_19":function(d){return "Szép dobás!"},
"saySpriteChoices_20":function(d){return "Legyen szép napod."},
"saySpriteChoices_21":function(d){return "Viszlát."},
"saySpriteChoices_22":function(d){return "Mindjárt jövök."},
"saySpriteChoices_23":function(d){return "A holnapi viszontlátásig!"},
"saySpriteChoices_24":function(d){return "Viszontlátásra később!"},
"saySpriteChoices_25":function(d){return "Vigyázz magadra!"},
"saySpriteChoices_26":function(d){return "Jó szórakozást!"},
"saySpriteChoices_27":function(d){return "Mennem kell."},
"saySpriteChoices_28":function(d){return "Leszünk barátok?"},
"saySpriteChoices_29":function(d){return "Szép munka!"},
"saySpriteChoices_30":function(d){return "Hohó!"},
"saySpriteChoices_31":function(d){return "Jaj!"},
"saySpriteChoices_32":function(d){return "Örülök, hogy találkoztunk."},
"saySpriteChoices_33":function(d){return "Tiszta ügy!"},
"saySpriteChoices_34":function(d){return "Köszönöm"},
"saySpriteChoices_35":function(d){return "Köszönöm, nem"},
"saySpriteChoices_36":function(d){return "Aaaaaah!"},
"saySpriteChoices_37":function(d){return "Semmi baj"},
"saySpriteChoices_38":function(d){return "Ma"},
"saySpriteChoices_39":function(d){return "Holnap"},
"saySpriteChoices_40":function(d){return "Tegnap"},
"saySpriteChoices_41":function(d){return "Megvagy!"},
"saySpriteChoices_42":function(d){return "Megtaláltál!"},
"saySpriteChoices_43":function(d){return "10, 9, 8, 7, 6, 5, 4, 3, 2, 1!"},
"saySpriteChoices_44":function(d){return "Szuper vagy!"},
"saySpriteChoices_45":function(d){return "Vicces vagy!"},
"saySpriteChoices_46":function(d){return "Buta vagy! "},
"saySpriteChoices_47":function(d){return "Jó barát vagy!"},
"saySpriteChoices_48":function(d){return "Vigyázz!"},
"saySpriteChoices_49":function(d){return "Kacsa!"},
"saySpriteChoices_50":function(d){return "Megvagy!"},
"saySpriteChoices_51":function(d){return "Oh!"},
"saySpriteChoices_52":function(d){return "Ne haragudj!"},
"saySpriteChoices_53":function(d){return "Óvatosan!"},
"saySpriteChoices_54":function(d){return "Whoa!"},
"saySpriteChoices_55":function(d){return "Hoppá!"},
"saySpriteChoices_56":function(d){return "Majdnem elkaptál!"},
"saySpriteChoices_57":function(d){return "Szép próbálkozás!"},
"saySpriteChoices_58":function(d){return "Nem tudsz elkapni!"},
"scoreText":function(d){return "Pontszám: "+studio_locale.v(d,"playerScore")},
"setActivityRandom":function(d){return "set activity to random for"},
"setActivityRoam":function(d){return "set activity to roam for"},
"setActivityChase":function(d){return "set activity to chase for"},
"setActivityFlee":function(d){return "set activity to flee for"},
"setActivityNone":function(d){return "set activity to none for"},
"setActivityTooltip":function(d){return "Sets the activity for a set of items"},
"setBackground":function(d){return "háttér beállítása"},
"setBackgroundRandom":function(d){return "véletlen háttér beállítása"},
"setBackgroundBlack":function(d){return "fekete háttér beállítása"},
"setBackgroundCave":function(d){return "barlangos háttér beállítása "},
"setBackgroundCloudy":function(d){return "felhős háttér beállítása"},
"setBackgroundHardcourt":function(d){return "salakos háttér beállítása"},
"setBackgroundNight":function(d){return "éjszakai háttér beállítása"},
"setBackgroundUnderwater":function(d){return "víz alatti háttér beállítása"},
"setBackgroundCity":function(d){return "városos háttér beállítása"},
"setBackgroundDesert":function(d){return "sivatagos háttér beállítása"},
"setBackgroundRainbow":function(d){return "szivárványos háttér beállítása"},
"setBackgroundSoccer":function(d){return "focis háttér beállítása"},
"setBackgroundSpace":function(d){return "űr háttér beállítása"},
"setBackgroundTennis":function(d){return "tenisz háttér beállítása"},
"setBackgroundWinter":function(d){return "téli háttér beállítása"},
"setBackgroundLeafy":function(d){return "leveles háttér beállítása"},
"setBackgroundGrassy":function(d){return "füves háttér beállítása"},
"setBackgroundFlower":function(d){return "virágos háttér bellítása"},
"setBackgroundTile":function(d){return "csempés háttér beállítása"},
"setBackgroundIcy":function(d){return "jeges háttér beállítása"},
"setBackgroundSnowy":function(d){return "havas háttér beállítása"},
"setBackgroundForest":function(d){return "set forest background"},
"setBackgroundSnow":function(d){return "set snow background"},
"setBackgroundShip":function(d){return "set ship background"},
"setBackgroundTooltip":function(d){return "Adja meg a háttér képet"},
"setEnemySpeed":function(d){return "ellenfél sebesség beállítása"},
"setItemSpeedSet":function(d){return "set type"},
"setItemSpeedTooltip":function(d){return "Sets the speed for a set of items"},
"setPlayerSpeed":function(d){return "játékos sebességének beállítása"},
"setScoreText":function(d){return "Pontszám beállítása"},
"setScoreTextTooltip":function(d){return "A pontszám mezőben megjelenő szöveg beállítása."},
"setSpriteEmotionAngry":function(d){return "haragos"},
"setSpriteEmotionHappy":function(d){return "boldogság"},
"setSpriteEmotionNormal":function(d){return "normál hangulat"},
"setSpriteEmotionRandom":function(d){return "véletlenszerű hangulat"},
"setSpriteEmotionSad":function(d){return "szomorú"},
"setSpriteEmotionTooltip":function(d){return "Szereplő hangulatának beállítása"},
"setSpriteAlien":function(d){return "űrlénnyé"},
"setSpriteBat":function(d){return "denevérré"},
"setSpriteBird":function(d){return "madárrá"},
"setSpriteCat":function(d){return "macskává"},
"setSpriteCaveBoy":function(d){return "ősemberré"},
"setSpriteCaveGirl":function(d){return "ősleánnyá"},
"setSpriteDinosaur":function(d){return "dinoszurusszá"},
"setSpriteDog":function(d){return "kutyává"},
"setSpriteDragon":function(d){return "sárkánnyá"},
"setSpriteGhost":function(d){return "szellemmé"},
"setSpriteHidden":function(d){return "rejtett képre"},
"setSpriteHideK1":function(d){return "elrejt"},
"setSpriteAnna":function(d){return "Annává"},
"setSpriteElsa":function(d){return "Elzává"},
"setSpriteHiro":function(d){return "Hiro képre"},
"setSpriteBaymax":function(d){return "Baymax képre"},
"setSpriteRapunzel":function(d){return "Rapunzel képre"},
"setSpriteKnight":function(d){return "lovaggá"},
"setSpriteMonster":function(d){return "szörnnyé"},
"setSpriteNinja":function(d){return "maszkos nindzsává"},
"setSpriteOctopus":function(d){return "polippá"},
"setSpritePenguin":function(d){return "pingvinné"},
"setSpritePirate":function(d){return "kalózzá"},
"setSpritePrincess":function(d){return "hercegnővé"},
"setSpriteRandom":function(d){return "véletlenszerűen"},
"setSpriteRobot":function(d){return "robottá"},
"setSpriteShowK1":function(d){return "mutasd"},
"setSpriteSpacebot":function(d){return "űrrobot képre"},
"setSpriteSoccerGirl":function(d){return "focistalánnyá"},
"setSpriteSoccerBoy":function(d){return "focistafiúvá"},
"setSpriteSquirrel":function(d){return "mókussá"},
"setSpriteTennisGirl":function(d){return "teniszező lánnyá"},
"setSpriteTennisBoy":function(d){return "teniszező fiúvá"},
"setSpriteUnicorn":function(d){return "egyszarvúvá"},
"setSpriteWitch":function(d){return "boszorkánnyá"},
"setSpriteWizard":function(d){return "varázslóvá"},
"setSpritePositionTooltip":function(d){return "Egy szereplő azonnal átkerül a megadott helyre."},
"setSpriteK1Tooltip":function(d){return "Megjeleníti vagy elrejti a megadott szereplőt."},
"setSpriteTooltip":function(d){return "A szereplő külsejének beállítása"},
"setSpriteSizeRandom":function(d){return "véletlenszerű méretre"},
"setSpriteSizeVerySmall":function(d){return "nagyon kicsire"},
"setSpriteSizeSmall":function(d){return "kicsire"},
"setSpriteSizeNormal":function(d){return "átlagos méretűre"},
"setSpriteSizeLarge":function(d){return "nagyra"},
"setSpriteSizeVeryLarge":function(d){return "nagyon nagyra"},
"setSpriteSizeTooltip":function(d){return "A szereplő méretének beállítása"},
"setSpriteSpeedRandom":function(d){return "véletlenszerű sebességre"},
"setSpriteSpeedVerySlow":function(d){return "nagyon lassú sebességre"},
"setSpriteSpeedSlow":function(d){return "lassú sebességre"},
"setSpriteSpeedNormal":function(d){return "normál sebességre"},
"setSpriteSpeedFast":function(d){return "gyors sebességre"},
"setSpriteSpeedVeryFast":function(d){return "nagyon gyors sebességre"},
"setSpriteSpeedTooltip":function(d){return "A szereplő sebességének beállítása"},
"setSpriteZombie":function(d){return "zombivá"},
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
"shareStudioTwitter":function(d){return "Nézd meg a történetet amit csináltam. Magam írtam a code.org felületén."},
"shareGame":function(d){return "Oszd meg a történetedet:"},
"showCoordinates":function(d){return "mutasd a koordinátákat"},
"showCoordinatesTooltip":function(d){return "mutasd a főszereplő helyzetét a képernyőn"},
"showTitleScreen":function(d){return "mutasd a képernyő címét"},
"showTitleScreenTitle":function(d){return "cím"},
"showTitleScreenText":function(d){return "szöveg"},
"showTSDefTitle":function(d){return "ide írd a címet"},
"showTSDefText":function(d){return "ide írd a szöveget"},
"showTitleScreenTooltip":function(d){return "Mutasd a képernyő címét a kapcsolódó címmel és szöveggel."},
"size":function(d){return "méret"},
"setSprite":function(d){return "állítsd be"},
"setSpriteN":function(d){return studio_locale.v(d,"spriteIndex")+". szereplő beállítása"},
"soundCrunch":function(d){return "ropogás"},
"soundGoal1":function(d){return "1. cél"},
"soundGoal2":function(d){return "2. cél"},
"soundHit":function(d){return "találat"},
"soundLosePoint":function(d){return "pontvesztés"},
"soundLosePoint2":function(d){return "2 pont vesztés"},
"soundRetro":function(d){return "retro"},
"soundRubber":function(d){return "gumi"},
"soundSlap":function(d){return "ütés"},
"soundWinPoint":function(d){return "pontszerzés"},
"soundWinPoint2":function(d){return "pontszerzés 2"},
"soundWood":function(d){return "fa"},
"speed":function(d){return "sebesség"},
"startSetValue":function(d){return "Kezdeti (funkció)"},
"startSetVars":function(d){return "game_vars(cím, alcím, háttér, cél, veszély, játékos)"},
"startSetFuncs":function(d){return "game_funcs(cél-frissítése, veszély-frissítése, játékos-frissítése, összeütközik?, a képernyőn megjelenő?)"},
"stopSprite":function(d){return "állj"},
"stopSpriteN":function(d){return studio_locale.v(d,"spriteIndex")+". szereplő álljon meg"},
"stopTooltip":function(d){return "Szereplő mozgásának megállítása."},
"throwSprite":function(d){return "dob"},
"throwSpriteN":function(d){return studio_locale.v(d,"spriteIndex")+". szereplő eldobás"},
"throwTooltip":function(d){return "Adott karakter dobja a lövedéket."},
"vanish":function(d){return "eltűnik"},
"vanishActorN":function(d){return studio_locale.v(d,"spriteIndex")+". szereplő eltüntetése"},
"vanishTooltip":function(d){return "Eltünteti a szereplőt."},
"waitFor":function(d){return "várj, amíg"},
"waitSeconds":function(d){return "másodperc"},
"waitForClick":function(d){return "várj a kattintásra"},
"waitForRandom":function(d){return "várj véletlenszerűen"},
"waitForHalfSecond":function(d){return "várj fél másodpercet"},
"waitFor1Second":function(d){return "várj egy másodpercet"},
"waitFor2Seconds":function(d){return "várj 2 másodpercet"},
"waitFor5Seconds":function(d){return "várj 5 másodpercet"},
"waitFor10Seconds":function(d){return "várj 10 másodpercet"},
"waitParamsTooltip":function(d){return "Várj a megadott számú másodpercig vagy adj meg nullát kattintásra várakozáshoz."},
"waitTooltip":function(d){return "Várj a megadott ideig vagy amíg nem történik kattintás."},
"whenArrowDown":function(d){return "lefelé nyíl"},
"whenArrowLeft":function(d){return "balra nyíl"},
"whenArrowRight":function(d){return "jobbra nyíl"},
"whenArrowUp":function(d){return "felfelé nyíl"},
"whenArrowTooltip":function(d){return "Hajtsd végre az alábbi műveleteket, ha az adott nyíl gombot megnyomják."},
"whenDown":function(d){return "Ha van lefelé nyíl"},
"whenDownTooltip":function(d){return "Végrehajtja az alábbi parancsokat, ha a lefelé nyilat megnyomják."},
"whenGameStarts":function(d){return "amikor a történet kezdődik"},
"whenGameStartsTooltip":function(d){return "Hajtsd végre az alábbi műveleteket a történet indulásakor."},
"whenLeft":function(d){return "Ha van balra nyíl"},
"whenLeftTooltip":function(d){return "Végrehajtja az alábbi parancsokat, ha a balra nyilat megnyomják."},
"whenRight":function(d){return "Ha van jobbra nyíl"},
"whenRightTooltip":function(d){return "Végrehajtja az alábbi parancsokat, ha a jobbra nyilat megnyomják."},
"whenSpriteClicked":function(d){return "amikor a szereplőre kattintunk"},
"whenSpriteClickedN":function(d){return "ha "+studio_locale.v(d,"spriteIndex")+". szereplőre kattint"},
"whenSpriteClickedTooltip":function(d){return "Hajtsd végre az alábbi műveleteket, ha egy szereplőre kattintanak."},
"whenSpriteCollidedN":function(d){return "ha "+studio_locale.v(d,"spriteIndex")+". szereplő"},
"whenSpriteCollidedTooltip":function(d){return "Hajtsd végre az alábbi műveleteket, ha az egyik szereplő hozzáér egy másikhoz."},
"whenSpriteCollidedWith":function(d){return "megérinti"},
"whenSpriteCollidedWithAnyActor":function(d){return "megérinti bármelyik szereplőt"},
"whenSpriteCollidedWithAnyEdge":function(d){return "bármely szegély érintése"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "bármely lövedék érintése"},
"whenSpriteCollidedWithAnything":function(d){return "bármi érintése"},
"whenSpriteCollidedWithN":function(d){return "megérinti "+studio_locale.v(d,"spriteIndex")+". szereplőt"},
"whenSpriteCollidedWithBlueFireball":function(d){return "kék tűzgolyó érintése"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "lila tűzgolyó érintése"},
"whenSpriteCollidedWithRedFireball":function(d){return "piros tűzgolyó érintése"},
"whenSpriteCollidedWithYellowHearts":function(d){return "sárga szívek érintése"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "lila szívek érintése"},
"whenSpriteCollidedWithRedHearts":function(d){return "piros szívek érintése"},
"whenSpriteCollidedWithBottomEdge":function(d){return "alsó szegély érintése"},
"whenSpriteCollidedWithLeftEdge":function(d){return "bal  szegély érintése"},
"whenSpriteCollidedWithRightEdge":function(d){return "jobb  szegély érintése"},
"whenSpriteCollidedWithTopEdge":function(d){return "felső  szegély érintése"},
"whenTouchItem":function(d){return "when item touched"},
"whenTouchItemTooltip":function(d){return "Execute the actions below when the actor touches an item."},
"whenTouchWall":function(d){return "when wall touched"},
"whenTouchWallTooltip":function(d){return "Execute the actions below when the actor touches a wall."},
"whenUp":function(d){return "Ha van felfelé nyíl"},
"whenUpTooltip":function(d){return "Végrehajtja az alábbi parancsokat, ha a felfelé nyilat megnyomják."},
"yes":function(d){return "Igen"},
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