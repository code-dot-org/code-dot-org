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
"actor":function(d){return "acteur"},
"addCharacter":function(d){return "add a"},
"addCharacterTooltip":function(d){return "Add a character to the scene."},
"alienInvasion":function(d){return "Buitenaardse invasie!"},
"backgroundBlack":function(d){return "zwart"},
"backgroundCave":function(d){return "grot"},
"backgroundCloudy":function(d){return "bewolkt"},
"backgroundHardcourt":function(d){return "sportveld"},
"backgroundNight":function(d){return "nacht"},
"backgroundUnderwater":function(d){return "onder water"},
"backgroundCity":function(d){return "stad"},
"backgroundDesert":function(d){return "woestijn"},
"backgroundRainbow":function(d){return "regenboog"},
"backgroundSoccer":function(d){return "voetbal"},
"backgroundSpace":function(d){return "ruimte"},
"backgroundTennis":function(d){return "Tennis"},
"backgroundWinter":function(d){return "winter"},
"calloutPlaceCommandsHere":function(d){return "Place commands here"},
"calloutPlaceCommandsAtTop":function(d){return "Place commands to set up your game at the top"},
"calloutTypeCommandsHere":function(d){return "Type your commands here"},
"calloutCharactersMove":function(d){return "These new commands let you control how the characters move"},
"calloutPutCommandsTouchCharacter":function(d){return "Put a command here to have it happen when you touch a character"},
"calloutClickCategory":function(d){return "Click a category header to see commands in each category"},
"calloutTryOutNewCommands":function(d){return "Try out all the new commands you’ve unlocked"},
"catActions":function(d){return "Acties"},
"catControl":function(d){return "Lussen"},
"catEvents":function(d){return "Gebeurtenissen"},
"catLogic":function(d){return "Logica"},
"catMath":function(d){return "wiskundige"},
"catProcedures":function(d){return "Functies"},
"catText":function(d){return "Tekst"},
"catVariables":function(d){return "Variabelen"},
"changeScoreTooltip":function(d){return "Verwijder of voeg een punt toe aan de score."},
"changeScoreTooltipK1":function(d){return "Voeg een punt toe aan de score."},
"continue":function(d){return "Doorgaan"},
"decrementPlayerScore":function(d){return "verwijder punt"},
"defaultSayText":function(d){return "type hier"},
"dropletBlock_addCharacter_description":function(d){return "Add a character to the scene."},
"dropletBlock_addCharacter_param0":function(d){return "type"},
"dropletBlock_addCharacter_param0_description":function(d){return "The type of the character to be added ('random', 'man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_changeScore_description":function(d){return "Verwijder of voeg een punt toe aan de score."},
"dropletBlock_changeScore_param0":function(d){return "score"},
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
"dropletBlock_playSound_description":function(d){return "Speel het gekozen geluid af."},
"dropletBlock_playSound_param0":function(d){return "sound"},
"dropletBlock_playSound_param0_description":function(d){return "The name of the sound to play."},
"dropletBlock_setBackground_description":function(d){return "Hiermee stelt u de achtergrondafbeelding in"},
"dropletBlock_setBackground_param0":function(d){return "image"},
"dropletBlock_setBackground_param0_description":function(d){return "The name of the background theme ('background1', 'background2', or 'background3')."},
"dropletBlock_setBot_description":function(d){return "Changes the active bot."},
"dropletBlock_setBot_param0":function(d){return "image"},
"dropletBlock_setBot_param0_description":function(d){return "The name of the bot image ('random', 'bot1', or 'bot2')."},
"dropletBlock_setBotSpeed_description":function(d){return "Sets the bot speed."},
"dropletBlock_setBotSpeed_param0":function(d){return "snelheid"},
"dropletBlock_setBotSpeed_param0_description":function(d){return "The speed value ('random', 'slow', 'normal', or 'fast')."},
"dropletBlock_setSpriteEmotion_description":function(d){return "Zet het humeur van de acteur"},
"dropletBlock_setSpritePosition_description":function(d){return "Verplaats de speler meteen naar een opgegeven plaats."},
"dropletBlock_setSpriteSpeed_description":function(d){return "Hiermee stel je de snelheid van een speler in"},
"dropletBlock_setSprite_description":function(d){return "Hiermee wordt de acteur afbeelding ingesteld"},
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
"dropletBlock_throw_description":function(d){return "Gooit een projectiel vanaf de gekozen speler."},
"dropletBlock_vanish_description":function(d){return "Laat de acteur verdwijnen."},
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
"emotion":function(d){return "humeur"},
"finalLevel":function(d){return "Gefeliciteerd! je hebt de laatste puzzel opgelost."},
"for":function(d){return "voor"},
"hello":function(d){return "hallo"},
"helloWorld":function(d){return "Hallo wereld!"},
"incrementPlayerScore":function(d){return "Scoor punt"},
"itemBlueFireball":function(d){return "blauwe vuurbal"},
"itemPurpleFireball":function(d){return "paarse vuurbal"},
"itemRedFireball":function(d){return "rode vuurbal"},
"itemYellowHearts":function(d){return "geel hart"},
"itemPurpleHearts":function(d){return "paars hart"},
"itemRedHearts":function(d){return "rood hart"},
"itemRandom":function(d){return "willekeurig"},
"itemAnna":function(d){return "haak"},
"itemElsa":function(d){return "glinstering"},
"itemHiro":function(d){return "microbots"},
"itemBaymax":function(d){return "raket"},
"itemRapunzel":function(d){return "steelpan"},
"itemCherry":function(d){return "kers"},
"itemIce":function(d){return "ijs"},
"itemDuck":function(d){return "eend"},
"itemMan":function(d){return "man"},
"itemPilot":function(d){return "pilot"},
"itemPig":function(d){return "pig"},
"itemBird":function(d){return "bird"},
"itemMouse":function(d){return "mouse"},
"itemRoo":function(d){return "roo"},
"itemSpider":function(d){return "spider"},
"makeProjectileDisappear":function(d){return "verdwijn"},
"makeProjectileBounce":function(d){return "stuiter"},
"makeProjectileBlueFireball":function(d){return "maak een blauwe vuurbal"},
"makeProjectilePurpleFireball":function(d){return "maak een paarse vuurbal"},
"makeProjectileRedFireball":function(d){return "maak een rode vuurbal"},
"makeProjectileYellowHearts":function(d){return "maak gele harten"},
"makeProjectilePurpleHearts":function(d){return "maak paarse harten"},
"makeProjectileRedHearts":function(d){return "maak rode harten"},
"makeProjectileTooltip":function(d){return "Laat het projectiel dat net botste verdwijnen of stuiteren."},
"makeYourOwn":function(d){return "Maak je eigen Speel Lab App"},
"moveDirectionDown":function(d){return "omlaag"},
"moveDirectionLeft":function(d){return "links"},
"moveDirectionRight":function(d){return "rechts"},
"moveDirectionUp":function(d){return "omhoog"},
"moveDirectionRandom":function(d){return "willekeurig"},
"moveDistance25":function(d){return "25 pixels"},
"moveDistance50":function(d){return "50 pixels"},
"moveDistance100":function(d){return "100 pixels"},
"moveDistance200":function(d){return "200 pixels"},
"moveDistance400":function(d){return "400 pixels"},
"moveDistancePixels":function(d){return "pixels"},
"moveDistanceRandom":function(d){return "willekeurige pixels"},
"moveDistanceTooltip":function(d){return "Beweeg een figuur de aangegeven afstand in de aangegeven richting."},
"moveSprite":function(d){return "verplaats"},
"moveSpriteN":function(d){return "verplaats speler "+studio_locale.v(d,"spriteIndex")},
"toXY":function(d){return "naar x,y"},
"moveDown":function(d){return "omlaag"},
"moveDownTooltip":function(d){return "verplaats een figuur omlaag."},
"moveLeft":function(d){return "naar links"},
"moveLeftTooltip":function(d){return "verplaats een figuur naar links."},
"moveRight":function(d){return "naar rechts"},
"moveRightTooltip":function(d){return "verplaats een figuur naar rechts."},
"moveUp":function(d){return "omhoog"},
"moveUpTooltip":function(d){return "verplaats een figuur omhoog."},
"moveTooltip":function(d){return "verplaats een figuur."},
"nextLevel":function(d){return "Gefeliciteerd! Je hebt de puzzel voltooid."},
"no":function(d){return "Nee"},
"numBlocksNeeded":function(d){return "Deze puzzel kan opgelost worden met %1 blokken."},
"onEventTooltip":function(d){return "Code uitvoeren in reactie op de opgegeven gebeurtenis."},
"ouchExclamation":function(d){return "Auw!"},
"playSoundCrunch":function(d){return "krakend geluid afspelen"},
"playSoundGoal1":function(d){return "doel 1 geluid afspelen"},
"playSoundGoal2":function(d){return "doel 2 geluid afspelen"},
"playSoundHit":function(d){return "raak-geluid afspelen"},
"playSoundLosePoint":function(d){return "speel het punt verloren geluid af"},
"playSoundLosePoint2":function(d){return "speel het punt verloren geluid 2 af"},
"playSoundRetro":function(d){return "speel retro geluid af"},
"playSoundRubber":function(d){return "speel rubber geluid af"},
"playSoundSlap":function(d){return "speel klap geluid af"},
"playSoundTooltip":function(d){return "Het gekozen geluid afspelen."},
"playSoundWinPoint":function(d){return "speel het punt gewonnen geluid af"},
"playSoundWinPoint2":function(d){return "speel het punt gewonnen geluid 2 af"},
"playSoundWood":function(d){return "speel hout geluid af"},
"positionOutTopLeft":function(d){return "naar linksboven"},
"positionOutTopRight":function(d){return "naar rechtsboven"},
"positionTopOutLeft":function(d){return "naar boven buiten de linkerpositie"},
"positionTopLeft":function(d){return "naar de positie linksboven"},
"positionTopCenter":function(d){return "naar de positie midden boven"},
"positionTopRight":function(d){return "naar de positie rechtsboven"},
"positionTopOutRight":function(d){return "naar boven buiten de rechterpositie"},
"positionMiddleLeft":function(d){return "naar de midden linkse positie"},
"positionMiddleCenter":function(d){return "naar de middelste positie"},
"positionMiddleRight":function(d){return "naar de positie middel rechts"},
"positionBottomOutLeft":function(d){return "naar beneden buiten de linkerpositie"},
"positionBottomLeft":function(d){return "naar de positie linksonder"},
"positionBottomCenter":function(d){return "naar de positie midden onder"},
"positionBottomRight":function(d){return "naar de positie rechtsonder"},
"positionBottomOutRight":function(d){return "naar beneden buiten de rechterpositie"},
"positionOutBottomLeft":function(d){return "naar beneden links"},
"positionOutBottomRight":function(d){return "naar benden rechts"},
"positionRandom":function(d){return "naar de willekeurige positie"},
"projectileBlueFireball":function(d){return "blauwe vuurbal"},
"projectilePurpleFireball":function(d){return "paarse vuurbal"},
"projectileRedFireball":function(d){return "rode vuurbal"},
"projectileYellowHearts":function(d){return "geel hart"},
"projectilePurpleHearts":function(d){return "paars hart"},
"projectileRedHearts":function(d){return "rood hart"},
"projectileRandom":function(d){return "willekeurig"},
"projectileAnna":function(d){return "haak"},
"projectileElsa":function(d){return "glinstering"},
"projectileHiro":function(d){return "Hiro"},
"projectileBaymax":function(d){return "raket"},
"projectileRapunzel":function(d){return "steelpan"},
"projectileCherry":function(d){return "kers"},
"projectileIce":function(d){return "ijs"},
"projectileDuck":function(d){return "eend"},
"reinfFeedbackMsg":function(d){return "Druk op de \"Doorgaan met spelen\" knop om terug te gaan naar het afspelen van jouw verhaal."},
"repeatForever":function(d){return "blijven herhalen"},
"repeatDo":function(d){return "voer uit"},
"repeatForeverTooltip":function(d){return "Voer de acties in dit blok zolang het verhaal bezig is."},
"saySprite":function(d){return "zeg"},
"saySpriteN":function(d){return "speler "+studio_locale.v(d,"spriteIndex")+" zegt"},
"saySpriteTooltip":function(d){return "Toon een tekstballon met de tekst van de speler."},
"saySpriteChoices_0":function(d){return "Hoi."},
"saySpriteChoices_1":function(d){return "Hallo iedereen."},
"saySpriteChoices_2":function(d){return "Hoe gaat het?"},
"saySpriteChoices_3":function(d){return "Goedemorgen"},
"saySpriteChoices_4":function(d){return "Goedemiddag"},
"saySpriteChoices_5":function(d){return "Goedenacht"},
"saySpriteChoices_6":function(d){return "Goedenavond"},
"saySpriteChoices_7":function(d){return "Wat is er nieuw?"},
"saySpriteChoices_8":function(d){return "Wat?"},
"saySpriteChoices_9":function(d){return "Waar?"},
"saySpriteChoices_10":function(d){return "Wanneer?"},
"saySpriteChoices_11":function(d){return "Goed."},
"saySpriteChoices_12":function(d){return "Geweldig!"},
"saySpriteChoices_13":function(d){return "Prima."},
"saySpriteChoices_14":function(d){return "Niet slecht."},
"saySpriteChoices_15":function(d){return "Veel succes."},
"saySpriteChoices_16":function(d){return "Ja"},
"saySpriteChoices_17":function(d){return "Nee"},
"saySpriteChoices_18":function(d){return "Oké"},
"saySpriteChoices_19":function(d){return "Goed gegooid!"},
"saySpriteChoices_20":function(d){return "Fijne dag nog."},
"saySpriteChoices_21":function(d){return "Doei."},
"saySpriteChoices_22":function(d){return "Ik ben zo terug."},
"saySpriteChoices_23":function(d){return "Tot morgen!"},
"saySpriteChoices_24":function(d){return "Tot later!"},
"saySpriteChoices_25":function(d){return "Hou je taai!"},
"saySpriteChoices_26":function(d){return "Veel plezier!"},
"saySpriteChoices_27":function(d){return "Ik moet gaan."},
"saySpriteChoices_28":function(d){return "Wil je vrienden worden?"},
"saySpriteChoices_29":function(d){return "Goed gedaan!"},
"saySpriteChoices_30":function(d){return "Woehoe!"},
"saySpriteChoices_31":function(d){return "Jeuj!"},
"saySpriteChoices_32":function(d){return "Aangenaam kennis te maken."},
"saySpriteChoices_33":function(d){return "OK!"},
"saySpriteChoices_34":function(d){return "Bedankt"},
"saySpriteChoices_35":function(d){return "Nee, jij bedankt"},
"saySpriteChoices_36":function(d){return "Aaaaaah!"},
"saySpriteChoices_37":function(d){return "Laat maar"},
"saySpriteChoices_38":function(d){return "Vandaag"},
"saySpriteChoices_39":function(d){return "Morgen"},
"saySpriteChoices_40":function(d){return "Gisteren"},
"saySpriteChoices_41":function(d){return "Ik heb je gevonden!"},
"saySpriteChoices_42":function(d){return "Je hebt me gevonden!"},
"saySpriteChoices_43":function(d){return "10, 9, 8, 7, 6, 5, 4, 3, 2, 1!"},
"saySpriteChoices_44":function(d){return "Je bent geweldig!"},
"saySpriteChoices_45":function(d){return "Je bent grappig!"},
"saySpriteChoices_46":function(d){return "Gekkie!"},
"saySpriteChoices_47":function(d){return "Je bent een goede vriend!"},
"saySpriteChoices_48":function(d){return "Kijk uit!"},
"saySpriteChoices_49":function(d){return "Bukken!"},
"saySpriteChoices_50":function(d){return "'k Heb je!"},
"saySpriteChoices_51":function(d){return "Au!"},
"saySpriteChoices_52":function(d){return "Sorry!"},
"saySpriteChoices_53":function(d){return "Voorzichtig!"},
"saySpriteChoices_54":function(d){return "Whoa!"},
"saySpriteChoices_55":function(d){return "Oeps!"},
"saySpriteChoices_56":function(d){return "Je had me bijna!"},
"saySpriteChoices_57":function(d){return "Goed geprobeerd!"},
"saySpriteChoices_58":function(d){return "Je kunt me toch niet vangen!"},
"scoreText":function(d){return "Score: "+studio_locale.v(d,"playerScore")},
"setActivityRandom":function(d){return "set activity to random for"},
"setActivityRoam":function(d){return "set activity to roam for"},
"setActivityChase":function(d){return "set activity to chase for"},
"setActivityFlee":function(d){return "set activity to flee for"},
"setActivityNone":function(d){return "set activity to none for"},
"setActivityTooltip":function(d){return "Sets the activity for a set of items"},
"setBackground":function(d){return "stel de achtergrond in"},
"setBackgroundRandom":function(d){return "stel een willekeurige achtergrond in"},
"setBackgroundBlack":function(d){return "stel een zwarte achtergrond in"},
"setBackgroundCave":function(d){return "stel de grotachtergrond in"},
"setBackgroundCloudy":function(d){return "stel de bewolkte achtergrond in"},
"setBackgroundHardcourt":function(d){return "stel de tennisveld achtergrond in"},
"setBackgroundNight":function(d){return "stel de nachtachtergrond in"},
"setBackgroundUnderwater":function(d){return "stel de onderwaterachtergrond in"},
"setBackgroundCity":function(d){return "gebruik stadsachtergrond"},
"setBackgroundDesert":function(d){return "gebruik woestijnachtergrond"},
"setBackgroundRainbow":function(d){return "gebruik regenboogachtergrond"},
"setBackgroundSoccer":function(d){return "gebruik voetbalachtergrond"},
"setBackgroundSpace":function(d){return "gebruik ruimteachtergrond"},
"setBackgroundTennis":function(d){return "gebruik tennisachtergrond"},
"setBackgroundWinter":function(d){return "gebruik winterachtergrond"},
"setBackgroundLeafy":function(d){return "zet blaadjes achtergrond"},
"setBackgroundGrassy":function(d){return "set een grasland in als achtergrond"},
"setBackgroundFlower":function(d){return "zet bloemetjes achtergrond"},
"setBackgroundTile":function(d){return "zet tegeltjes achtergrond"},
"setBackgroundIcy":function(d){return "zet ijzige achtergrond"},
"setBackgroundSnowy":function(d){return "zet sneeuwige achtergrond"},
"setBackgroundForest":function(d){return "set forest background"},
"setBackgroundSnow":function(d){return "set snow background"},
"setBackgroundShip":function(d){return "set ship background"},
"setBackgroundTooltip":function(d){return "Hiermee stelt u de achtergrondafbeelding in"},
"setEnemySpeed":function(d){return "snelheid vijand instellen"},
"setItemSpeedSet":function(d){return "set type"},
"setItemSpeedTooltip":function(d){return "Sets the speed for a set of items"},
"setPlayerSpeed":function(d){return "snelheid speler instellen"},
"setScoreText":function(d){return "score instellen"},
"setScoreTextTooltip":function(d){return "Hiermee wordt de tekst op het scorebord weergeven."},
"setSpriteEmotionAngry":function(d){return "naar een boze stemming"},
"setSpriteEmotionHappy":function(d){return "naar een blij humeur"},
"setSpriteEmotionNormal":function(d){return "naar een normaal humeur"},
"setSpriteEmotionRandom":function(d){return "naar een willekeurig humeur"},
"setSpriteEmotionSad":function(d){return "naar een verdrietig humeur"},
"setSpriteEmotionTooltip":function(d){return "Zet het humeur van de acteur"},
"setSpriteAlien":function(d){return "naar een alien plaatje"},
"setSpriteBat":function(d){return "naar een vleermuis plaatje"},
"setSpriteBird":function(d){return "naar een vogel plaatje"},
"setSpriteCat":function(d){return "naar een kat"},
"setSpriteCaveBoy":function(d){return "in een grot-jongen plaatje"},
"setSpriteCaveGirl":function(d){return "in een grot-meisje plaatje"},
"setSpriteDinosaur":function(d){return "naar een dinosaurus"},
"setSpriteDog":function(d){return "naar een hond"},
"setSpriteDragon":function(d){return "naar een draak plaatje"},
"setSpriteGhost":function(d){return "naar een spook plaatje"},
"setSpriteHidden":function(d){return "naar onzichtbaar"},
"setSpriteHideK1":function(d){return "verberg"},
"setSpriteAnna":function(d){return "naar een Anna afbeelding"},
"setSpriteElsa":function(d){return "naar een Elsa afbeelding"},
"setSpriteHiro":function(d){return "naar een Hiro afbeelding"},
"setSpriteBaymax":function(d){return "naar een Baymax afbeelding"},
"setSpriteRapunzel":function(d){return "naar een Rapunzel afbeelding"},
"setSpriteKnight":function(d){return "naar een ridder plaatje"},
"setSpriteMonster":function(d){return "naar een monster plaatje"},
"setSpriteNinja":function(d){return "naar een gemaskerde ninja plaatje"},
"setSpriteOctopus":function(d){return "naar een inktvis"},
"setSpritePenguin":function(d){return "naar een penguin"},
"setSpritePirate":function(d){return "naar een piraat plaatje"},
"setSpritePrincess":function(d){return "naar een princes plaatje"},
"setSpriteRandom":function(d){return "naar een willekeurige afbeelding"},
"setSpriteRobot":function(d){return "naar een robot plaatje"},
"setSpriteShowK1":function(d){return "toon"},
"setSpriteSpacebot":function(d){return "naar een spacebot plaatje"},
"setSpriteSoccerGirl":function(d){return "in een voetbal-meisje plaatje"},
"setSpriteSoccerBoy":function(d){return "in een voetbal-jongen plaatje"},
"setSpriteSquirrel":function(d){return "naar een eekhoorn plaatje"},
"setSpriteTennisGirl":function(d){return "in een tennis-meisje plaatje"},
"setSpriteTennisBoy":function(d){return "in een tennis-meisje plaatje"},
"setSpriteUnicorn":function(d){return "naar een eenhoorn plaatje"},
"setSpriteWitch":function(d){return "naar een heks"},
"setSpriteWizard":function(d){return "naar een tovenaar plaatje"},
"setSpritePositionTooltip":function(d){return "Verplaats de speler meteen naar een opgegeven plaats."},
"setSpriteK1Tooltip":function(d){return "Toont of verbergt de speler."},
"setSpriteTooltip":function(d){return "Hiermee wordt de acteur afbeelding ingesteld"},
"setSpriteSizeRandom":function(d){return "in een willekeurige grootte"},
"setSpriteSizeVerySmall":function(d){return "in een erg kleine grootte"},
"setSpriteSizeSmall":function(d){return "in een kleine grootte"},
"setSpriteSizeNormal":function(d){return "in een normale grootte"},
"setSpriteSizeLarge":function(d){return "in een grote grootte"},
"setSpriteSizeVeryLarge":function(d){return "in een erg grote grootte"},
"setSpriteSizeTooltip":function(d){return "Verander het formaat van een acteur"},
"setSpriteSpeedRandom":function(d){return "op willekeurige snelheid"},
"setSpriteSpeedVerySlow":function(d){return "naar heel langzaam"},
"setSpriteSpeedSlow":function(d){return "naar langzaam"},
"setSpriteSpeedNormal":function(d){return "naar normaal"},
"setSpriteSpeedFast":function(d){return "naar snel"},
"setSpriteSpeedVeryFast":function(d){return "naar heel snel"},
"setSpriteSpeedTooltip":function(d){return "Hiermee stel je de snelheid van een speler in"},
"setSpriteZombie":function(d){return "naar een zombie plaatje"},
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
"shareStudioTwitter":function(d){return "Lees mijn verhaal. Ik heb dat zelf met @codeorg geschreven"},
"shareGame":function(d){return "Deel je verhaal:"},
"showCoordinates":function(d){return "Toon coördinaten"},
"showCoordinatesTooltip":function(d){return "toon de coördinaten van de hoofdrolspeler op het scherm"},
"showTitleScreen":function(d){return "toon titelscherm"},
"showTitleScreenTitle":function(d){return "titel"},
"showTitleScreenText":function(d){return "tekst"},
"showTSDefTitle":function(d){return "typ hier de titel"},
"showTSDefText":function(d){return "typ de tekst hier"},
"showTitleScreenTooltip":function(d){return "toon een titelscherm met bijbehorende titel en tekst."},
"size":function(d){return "grootte"},
"setSprite":function(d){return "zetten"},
"setSpriteN":function(d){return "Zet speler "+studio_locale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "kraak"},
"soundGoal1":function(d){return "doel 1"},
"soundGoal2":function(d){return "doel 2"},
"soundHit":function(d){return "raak"},
"soundLosePoint":function(d){return "punt verloren"},
"soundLosePoint2":function(d){return "punt verloren 2"},
"soundRetro":function(d){return "retro"},
"soundRubber":function(d){return "rubber"},
"soundSlap":function(d){return "klap"},
"soundWinPoint":function(d){return "punt gewonnen"},
"soundWinPoint2":function(d){return "punt gewonnen 2"},
"soundWood":function(d){return "hout"},
"speed":function(d){return "snelheid"},
"startSetValue":function(d){return "start (functie)"},
"startSetVars":function(d){return "game_vars (titel, subtitel, achtergrond, doelwit, gevaar, speler)"},
"startSetFuncs":function(d){return "game_funcs(update-doelwit, update-gevaar, update-speler, botsing?, op-scherm?)"},
"stopSprite":function(d){return "stop"},
"stopSpriteN":function(d){return "stop speler "+studio_locale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Hiermee wordt een beweging van een acteur gestopt."},
"throwSprite":function(d){return "gooi"},
"throwSpriteN":function(d){return "speler "+studio_locale.v(d,"spriteIndex")+" gooit"},
"throwTooltip":function(d){return "Gooit een projectiel vanaf de gekozen speler."},
"vanish":function(d){return "verdwijnen"},
"vanishActorN":function(d){return "verdwenen acteur "+studio_locale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "Laat de acteur verdwijnen."},
"waitFor":function(d){return "wacht op"},
"waitSeconds":function(d){return "seconden"},
"waitForClick":function(d){return "wacht voor de klik"},
"waitForRandom":function(d){return "wacht op willekeurig"},
"waitForHalfSecond":function(d){return "wacht een halve seconde"},
"waitFor1Second":function(d){return "wacht 1 seconde"},
"waitFor2Seconds":function(d){return "wacht 2 seconden"},
"waitFor5Seconds":function(d){return "wacht 5 seconden"},
"waitFor10Seconds":function(d){return "wacht 10 seconden"},
"waitParamsTooltip":function(d){return "Wacht voor een opgegeven aantal seconden of voer nul in om te wachten op een klik."},
"waitTooltip":function(d){return "Wacht voor een gekozen tijdsduur of op een klik."},
"whenArrowDown":function(d){return "pijltje naar beneden"},
"whenArrowLeft":function(d){return "pijltje naar links"},
"whenArrowRight":function(d){return "pijltje naar rechts"},
"whenArrowUp":function(d){return "pijltje naar boven"},
"whenArrowTooltip":function(d){return "Voer de acties hieronder uit als de opgegeven pijltjestoets wordt ingedrukt."},
"whenDown":function(d){return "als pijltje naar beneden"},
"whenDownTooltip":function(d){return "Voer de acties hieronder uit als pijltje naar beneden wordt ingedrukt."},
"whenGameStarts":function(d){return "zodra het verhaal begint"},
"whenGameStartsTooltip":function(d){return "Voer de acties hieronder uit als het verhaal begint."},
"whenLeft":function(d){return "als pijltje naar links"},
"whenLeftTooltip":function(d){return "Voer de acties hieronder uit als pijltje naar links wordt ingedrukt."},
"whenRight":function(d){return "als pijltje naar rechts"},
"whenRightTooltip":function(d){return "Voer de acties hieronder uit als pijltje naar rechts wordt ingedrukt."},
"whenSpriteClicked":function(d){return "als speler geklikt heeft"},
"whenSpriteClickedN":function(d){return "als speler "+studio_locale.v(d,"spriteIndex")+" geklikt heeft"},
"whenSpriteClickedTooltip":function(d){return "Voer de acties hieronder uit als op een speler geklikt wordt."},
"whenSpriteCollidedN":function(d){return "als speler "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "Voer de acties hieronder uit als een speler een andere speler raakt."},
"whenSpriteCollidedWith":function(d){return "raakt"},
"whenSpriteCollidedWithAnyActor":function(d){return "raakt een acteur"},
"whenSpriteCollidedWithAnyEdge":function(d){return "raakt een rand"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "raakt een voorwerp"},
"whenSpriteCollidedWithAnything":function(d){return "raakt iets"},
"whenSpriteCollidedWithN":function(d){return "raakt speler "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "raakt een blauwe vuurbal"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "raakt paarse vuurbal"},
"whenSpriteCollidedWithRedFireball":function(d){return "raakt een rode vuurbal"},
"whenSpriteCollidedWithYellowHearts":function(d){return "raakt een  geel hart"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "raakt een paars hart"},
"whenSpriteCollidedWithRedHearts":function(d){return "raakt een rood hart"},
"whenSpriteCollidedWithBottomEdge":function(d){return "raakt onderrand"},
"whenSpriteCollidedWithLeftEdge":function(d){return "raakt linkerrand"},
"whenSpriteCollidedWithRightEdge":function(d){return "raakt rechterrand"},
"whenSpriteCollidedWithTopEdge":function(d){return "raakt bovenrand"},
"whenTouchItem":function(d){return "when item touched"},
"whenTouchItemTooltip":function(d){return "Execute the actions below when the actor touches an item."},
"whenTouchWall":function(d){return "when wall touched"},
"whenTouchWallTooltip":function(d){return "Execute the actions below when the actor touches a wall."},
"whenUp":function(d){return "als pijltje naar boven"},
"whenUpTooltip":function(d){return "Voer de acties hieronder uit als pijltje naar boven wordt ingedrukt."},
"yes":function(d){return "Ja"},
"failedHasSetSprite":function(d){return "Next time, set a character."},
"failedHasSetBotSpeed":function(d){return "Next time, set a bot speed."},
"failedTouchAllItems":function(d){return "Next time, get all the items."},
"failedScoreMinimum":function(d){return "Next time, reach the minimum score."},
"failedRemovedItemCount":function(d){return "Next time, get the right number of items."},
"failedSetActivity":function(d){return "Next time, set the correct character activity."},
"calloutPutCommandsHereRunStart":function(d){return "Put commands here to have them run when the program starts"},
"calloutClickEvents":function(d){return "Click on the events header to see event function blocks."},
"calloutUseArrowButtons":function(d){return "Hold down these buttons or the arrow keys on your keyboard to trigger the move events"},
"calloutRunButton":function(d){return "Add a moveRight command to your code and then click here to run it"},
"calloutShowCodeToggle":function(d){return "Click here to switch between block and text mode"},
"calloutShowPlaceGoUpHere":function(d){return "Place goUp command here to move up"},
"calloutShowPlaySound":function(d){return "It's your game, so you choose the sounds now. Try the dropdown to pick a different sound"},
"calloutInstructions":function(d){return "Don't know what to do? Click the instructions to see them again"},
"calloutPlaceTwo":function(d){return "Can you make two MOUSEs appear when you get a BIRD?"},
"calloutSetMapAndSpeed":function(d){return "Set the map and your speed."},
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
"failedAvoidHazard":function(d){return "\"Uh oh, a GUY got you!  Try again.\""},
"failedHasAllGoals":function(d){return "\"Try again, BOTX.  You can get it.\""},
"successHasAllGoals":function(d){return "\"You did it, BOTX!\""},
"successCharacter1":function(d){return "\"Well done, BOT1!\""},
"successGenericCharacter":function(d){return "\"Congratulations.  You did it!\""},
"failedTwoItemsTimeout":function(d){return "You need to get the pilots before time runs out. To move, put the goUp and goDown commands inside the whenUp and whenDown functions. Then, press and hold the arrow keys on your keyboard (or screen) to move quickly."},
"failedFourItemsTimeout":function(d){return "To pass this level, you'll need to put goLeft, goRight, goUp and go Down into the right functions. If your code looks correct, but you can't get there fast enough, try pressing and holding the arrow keys on your keyboard (or screen)."},
"failedScoreTimeout":function(d){return "Try to reach all the pilots before time runs out. To move faster, press and hold the arrow keys on your keyboard (or screen)."},
"failedScoreScore":function(d){return "You got the pilots, but you still don't have enough points to pass the level. Use the addPoints command to add 100 points when you get a pilot."},
"failedScoreGoals":function(d){return "You used the addPoints command, but not in the right place. Can you put it inside the whenGetPilot function so BOT1 can't get points until he gets a pilot?"},
"failedWinLoseTimeout":function(d){return "Try to reach all the pilots before time runs out. To move faster, press and hold the arrow keys on your keyboard (or screen)."},
"failedWinLoseScore":function(d){return "You got the pilots, but you still don't have enough points to pass the level. Use the addPoints command to add 100 points when you get a pilot. Use removePoints to subtract 100 when you touch a MAN. Avoid the MANs!"},
"failedWinLoseGoals":function(d){return "You used the addPoints command, but not in the right place. Can you make it so that the command is only called when you get the pilot? Also, remove points when you touch the MAN."},
"failedAddCharactersTimeout":function(d){return "Use three addCharacter commands at the top of your program to add PIGs when you hit run. Now go get them."},
"failedChainCharactersTimeout":function(d){return "You need to get 8 MOUSEs. They move fast. Try pressing and holding the keys on your keyboard (or screen) to chase them."},
"failedChainCharactersScore":function(d){return "You got the MOUSEs, but you don't have enough points to move to the next level. Can you add 100 points to your score every time you get a MOUSE? "},
"failedChainCharactersItems":function(d){return "You used the addPoints command, but not in the right place.  Can you make it so that the command is only called when you get the MOUSEs?"},
"failedChainCharacters2Timeout":function(d){return "You need to get 8 MOUSEs. Can you make two (or more) of them appear every time you get a ROO?"},
"failedChangeSettingTimeout":function(d){return "Get 3 pilots to move on."},
"failedChangeSettingSettings":function(d){return "Make the level your own. To pass this level, you need to change the map and set your speed."}};