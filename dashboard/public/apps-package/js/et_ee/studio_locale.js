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
"actor":function(d){return "tegelaskuju"},
"addCharacter":function(d){return "lisa"},
"addCharacterTooltip":function(d){return "Lisa tegelaskuju."},
"alienInvasion":function(d){return "Tulnukate sissetung!"},
"backgroundBlack":function(d){return "must"},
"backgroundCave":function(d){return "koobas"},
"backgroundCloudy":function(d){return "pilvine"},
"backgroundHardcourt":function(d){return "kõvakattega väljak"},
"backgroundNight":function(d){return "öö"},
"backgroundUnderwater":function(d){return "veealune"},
"backgroundCity":function(d){return "linn"},
"backgroundDesert":function(d){return "kõrb"},
"backgroundRainbow":function(d){return "vikerkaar"},
"backgroundSoccer":function(d){return "jalgpall"},
"backgroundSpace":function(d){return "kosmos"},
"backgroundTennis":function(d){return "tennis"},
"backgroundWinter":function(d){return "talv"},
"calloutPlaceCommandsHere":function(d){return "Place commands here"},
"calloutPlaceCommandsAtTop":function(d){return "Place commands to set up your game at the top"},
"calloutTypeCommandsHere":function(d){return "Type your commands here"},
"calloutCharactersMove":function(d){return "These new commands let you control how the characters move"},
"calloutPutCommandsTouchCharacter":function(d){return "Put a command here to have it happen when you touch a character"},
"calloutClickCategory":function(d){return "Click a category header to see commands in each category"},
"calloutTryOutNewCommands":function(d){return "Try out all the new commands you’ve unlocked"},
"catActions":function(d){return "Tegevused"},
"catControl":function(d){return "Tsüklid"},
"catEvents":function(d){return "Sündmused"},
"catLogic":function(d){return "Loogika"},
"catMath":function(d){return "Matemaatika"},
"catProcedures":function(d){return "Funktsioonid"},
"catText":function(d){return "Tekst"},
"catVariables":function(d){return "Muutujad"},
"changeScoreTooltip":function(d){return "Lisa või eemalda tulemuselt üks punkt."},
"changeScoreTooltipK1":function(d){return "Lisa tulemusele punkt."},
"continue":function(d){return "Jätka"},
"decrementPlayerScore":function(d){return "eemalda tulemuselt punkt"},
"defaultSayText":function(d){return "kirjuta siia"},
"dropletBlock_addCharacter_description":function(d){return "Lisa tegelaskuju."},
"dropletBlock_addCharacter_param0":function(d){return "type"},
"dropletBlock_addCharacter_param0_description":function(d){return "The type of the character to be added ('random', 'man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_changeScore_description":function(d){return "Lisa või lahuta tulemuselt üks punkt."},
"dropletBlock_changeScore_param0":function(d){return "tulemus"},
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
"dropletBlock_playSound_description":function(d){return "Lase valitud heli."},
"dropletBlock_playSound_param0":function(d){return "sound"},
"dropletBlock_playSound_param0_description":function(d){return "The name of the sound to play."},
"dropletBlock_setBackground_description":function(d){return "Valib taustapildi"},
"dropletBlock_setBackground_param0":function(d){return "image"},
"dropletBlock_setBackground_param0_description":function(d){return "The name of the background theme ('background1', 'background2', or 'background3')."},
"dropletBlock_setBot_description":function(d){return "Changes the active bot."},
"dropletBlock_setBot_param0":function(d){return "image"},
"dropletBlock_setBot_param0_description":function(d){return "The name of the bot image ('random', 'bot1', or 'bot2')."},
"dropletBlock_setBotSpeed_description":function(d){return "Sets the bot speed."},
"dropletBlock_setBotSpeed_param0":function(d){return "kiirus"},
"dropletBlock_setBotSpeed_param0_description":function(d){return "The speed value ('random', 'slow', 'normal', or 'fast')."},
"dropletBlock_setSpriteEmotion_description":function(d){return "Määrab näitleja meeleolu"},
"dropletBlock_setSpritePosition_description":function(d){return "Liigutab tegelase koheselt määratud asukohta."},
"dropletBlock_setSpriteSpeed_description":function(d){return "Määrab tegelase kiiruse"},
"dropletBlock_setSprite_description":function(d){return "Määrab tegelase pildi"},
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
"dropletBlock_throw_description":function(d){return "Määratud tegelaskuju viskab viskekeha."},
"dropletBlock_vanish_description":function(d){return "Kaotab tegelase."},
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
"emotion":function(d){return "meeleolu"},
"finalLevel":function(d){return "Tubli! Sa lahendasid viimase mõistatuse."},
"for":function(d){return " "},
"hello":function(d){return "tere"},
"helloWorld":function(d){return "Tere, maailm!"},
"incrementPlayerScore":function(d){return "lisa punkt"},
"itemBlueFireball":function(d){return "sinine tulekera"},
"itemPurpleFireball":function(d){return "lilla tulekera"},
"itemRedFireball":function(d){return "punane tulekera"},
"itemYellowHearts":function(d){return "kollased südamed"},
"itemPurpleHearts":function(d){return "lillad südamed"},
"itemRedHearts":function(d){return "punased südamed"},
"itemRandom":function(d){return "juhuslik"},
"itemAnna":function(d){return "konks"},
"itemElsa":function(d){return "säde"},
"itemHiro":function(d){return "mikrobotid"},
"itemBaymax":function(d){return "rakett"},
"itemRapunzel":function(d){return "kastrul"},
"itemCherry":function(d){return "kirss"},
"itemIce":function(d){return "jää"},
"itemDuck":function(d){return "part"},
"itemMan":function(d){return "mees"},
"itemPilot":function(d){return "piloot"},
"itemPig":function(d){return "siga"},
"itemBird":function(d){return "lind"},
"itemMouse":function(d){return "hiir"},
"itemRoo":function(d){return "roo"},
"itemSpider":function(d){return "ämblik"},
"makeProjectileDisappear":function(d){return "kaduma"},
"makeProjectileBounce":function(d){return "põrge"},
"makeProjectileBlueFireball":function(d){return "loo sinine tulekera"},
"makeProjectilePurpleFireball":function(d){return "loo lilla tulekera"},
"makeProjectileRedFireball":function(d){return "loo punane tulekera"},
"makeProjectileYellowHearts":function(d){return "loo kollased südamed"},
"makeProjectilePurpleHearts":function(d){return "loo lillad südamed"},
"makeProjectileRedHearts":function(d){return "loo punased südamed"},
"makeProjectileTooltip":function(d){return "Pane just põrganud lendav osake kaduma või põrkama."},
"makeYourOwn":function(d){return "Tee ise Mängulabori rakendus"},
"moveDirectionDown":function(d){return "alla"},
"moveDirectionLeft":function(d){return "vasakule"},
"moveDirectionRight":function(d){return "paremale"},
"moveDirectionUp":function(d){return "üles"},
"moveDirectionRandom":function(d){return "juhuslik"},
"moveDistance25":function(d){return "25 pikslit"},
"moveDistance50":function(d){return "50 pikslit"},
"moveDistance100":function(d){return "100 pikslit"},
"moveDistance200":function(d){return "200 pikslit"},
"moveDistance400":function(d){return "400 pikslit"},
"moveDistancePixels":function(d){return "piksli võrra"},
"moveDistanceRandom":function(d){return "suvaline arv piksleid"},
"moveDistanceTooltip":function(d){return "Liiguta tegelaskuju määratud kaugusesse määratud suunas."},
"moveSprite":function(d){return "liiguta"},
"moveSpriteN":function(d){return "liiguta tegelaskuju "+studio_locale.v(d,"spriteIndex")},
"toXY":function(d){return "x,y"},
"moveDown":function(d){return "liigu alla"},
"moveDownTooltip":function(d){return "Liiguta tegelaskuju alla."},
"moveLeft":function(d){return "liigu vasakule"},
"moveLeftTooltip":function(d){return "Liiguta tegelaskuju vasakule."},
"moveRight":function(d){return "liigu paremale"},
"moveRightTooltip":function(d){return "Liiguta tegelaskuju paremale."},
"moveUp":function(d){return "liigu üles"},
"moveUpTooltip":function(d){return "Liiguta tegelaskuju üles."},
"moveTooltip":function(d){return "Liiguta tegelaskuju."},
"nextLevel":function(d){return "Palju õnne! See ülesanne on lahendatud."},
"no":function(d){return "Ei"},
"numBlocksNeeded":function(d){return "Selle ülesande saab lahendada %1 pusletükiga."},
"onEventTooltip":function(d){return "Rakenda sündmusele vastavat koodi."},
"ouchExclamation":function(d){return "Ai!"},
"playSoundCrunch":function(d){return "lase heli \"krõbin\""},
"playSoundGoal1":function(d){return "lase heli \"värav 1\""},
"playSoundGoal2":function(d){return "lase heli \"värav 2\""},
"playSoundHit":function(d){return "lase heli \"löök\""},
"playSoundLosePoint":function(d){return "lase heli \"kaotasid punkti\""},
"playSoundLosePoint2":function(d){return "lase heli \"kaotasid punkti 2\""},
"playSoundRetro":function(d){return "lase heli \"retro\""},
"playSoundRubber":function(d){return "lase heli \"kumm\""},
"playSoundSlap":function(d){return "lase heli \"laks\""},
"playSoundTooltip":function(d){return "Lase valitud heli."},
"playSoundWinPoint":function(d){return "lase heli \"võidad punkti\""},
"playSoundWinPoint2":function(d){return "lase heli \"võidad punkti 2\""},
"playSoundWood":function(d){return "lase heli \"puit\""},
"positionOutTopLeft":function(d){return "üles vasakule kohale"},
"positionOutTopRight":function(d){return "üles paremale kohale"},
"positionTopOutLeft":function(d){return "vasakule väljapoole üles"},
"positionTopLeft":function(d){return "üles vasakule"},
"positionTopCenter":function(d){return "üles keskele"},
"positionTopRight":function(d){return "üles paremale"},
"positionTopOutRight":function(d){return "paremale väljapoole üles"},
"positionMiddleLeft":function(d){return "keskele vasakule"},
"positionMiddleCenter":function(d){return "keskele keskele"},
"positionMiddleRight":function(d){return "keskele paremale"},
"positionBottomOutLeft":function(d){return "vasakule väljapoole alla"},
"positionBottomLeft":function(d){return "alla vasakule"},
"positionBottomCenter":function(d){return "alla keskele"},
"positionBottomRight":function(d){return "alla paremale"},
"positionBottomOutRight":function(d){return "paremale väljapoole alla"},
"positionOutBottomLeft":function(d){return "alla vasakusse nurka"},
"positionOutBottomRight":function(d){return "alla paremasse nurka"},
"positionRandom":function(d){return "juhuslikku kohta"},
"projectileBlueFireball":function(d){return "sinine tulekera"},
"projectilePurpleFireball":function(d){return "lilla tulekera"},
"projectileRedFireball":function(d){return "punane tulekera"},
"projectileYellowHearts":function(d){return "kollased südamed"},
"projectilePurpleHearts":function(d){return "lillad südamed"},
"projectileRedHearts":function(d){return "punased südamed"},
"projectileRandom":function(d){return "juhuslik"},
"projectileAnna":function(d){return "konks"},
"projectileElsa":function(d){return "säde"},
"projectileHiro":function(d){return "mikrobotid"},
"projectileBaymax":function(d){return "rakett"},
"projectileRapunzel":function(d){return "kastrul"},
"projectileCherry":function(d){return "kirss"},
"projectileIce":function(d){return "jää"},
"projectileDuck":function(d){return "part"},
"reinfFeedbackMsg":function(d){return "Võite vajutada nuppu \""+studio_locale.v(d,"backButton")+"\", et naaseda loo mängimise juurde."},
"repeatForever":function(d){return "korda igavesti"},
"repeatDo":function(d){return "täida"},
"repeatForeverTooltip":function(d){return "Käivita tegevusi selles plokis korduvalt samal ajal, kui lugu käib."},
"saySprite":function(d){return "ütle"},
"saySpriteN":function(d){return "tegelane "+studio_locale.v(d,"spriteIndex")+" ütleb"},
"saySpriteTooltip":function(d){return "Tekita jutumull määratud tegelase tekstiga."},
"saySpriteChoices_0":function(d){return "Hei sina."},
"saySpriteChoices_1":function(d){return "Tere kõigile."},
"saySpriteChoices_2":function(d){return "Kuidas sul läheb?"},
"saySpriteChoices_3":function(d){return "Tere hommikust"},
"saySpriteChoices_4":function(d){return "Tere päevast"},
"saySpriteChoices_5":function(d){return "Head ööd"},
"saySpriteChoices_6":function(d){return "Tere õhtust"},
"saySpriteChoices_7":function(d){return "Mis on uut?"},
"saySpriteChoices_8":function(d){return "Mis?"},
"saySpriteChoices_9":function(d){return "Kus?"},
"saySpriteChoices_10":function(d){return "Millal?"},
"saySpriteChoices_11":function(d){return "Hea."},
"saySpriteChoices_12":function(d){return "Suurepärane!"},
"saySpriteChoices_13":function(d){return "Hästi."},
"saySpriteChoices_14":function(d){return "Pole paha."},
"saySpriteChoices_15":function(d){return "Edu."},
"saySpriteChoices_16":function(d){return "Jah"},
"saySpriteChoices_17":function(d){return "Ei"},
"saySpriteChoices_18":function(d){return "Olgu"},
"saySpriteChoices_19":function(d){return "Kena vise!"},
"saySpriteChoices_20":function(d){return "Head päeva."},
"saySpriteChoices_21":function(d){return "Nägemist."},
"saySpriteChoices_22":function(d){return "Olen kohe tagasi."},
"saySpriteChoices_23":function(d){return "Homme näeme!"},
"saySpriteChoices_24":function(d){return "Hiljem näeme!"},
"saySpriteChoices_25":function(d){return "Hoia ennast!"},
"saySpriteChoices_26":function(d){return "Naudi!"},
"saySpriteChoices_27":function(d){return "Pean minema."},
"saySpriteChoices_28":function(d){return "Tahad olla sõber?"},
"saySpriteChoices_29":function(d){return "Hästi tehtud!"},
"saySpriteChoices_30":function(d){return "Juhhuu!"},
"saySpriteChoices_31":function(d){return "Jee!"},
"saySpriteChoices_32":function(d){return "Tore sinuga tutvuda."},
"saySpriteChoices_33":function(d){return "Hästi!"},
"saySpriteChoices_34":function(d){return "Aitäh"},
"saySpriteChoices_35":function(d){return "Ei, tänan"},
"saySpriteChoices_36":function(d){return "Aaaaaah!"},
"saySpriteChoices_37":function(d){return "Unusta ära"},
"saySpriteChoices_38":function(d){return "Täna"},
"saySpriteChoices_39":function(d){return "Homme"},
"saySpriteChoices_40":function(d){return "Eile"},
"saySpriteChoices_41":function(d){return "Ma leidsin su!"},
"saySpriteChoices_42":function(d){return "Leidsid mu üles!"},
"saySpriteChoices_43":function(d){return "10, 9, 8, 7, 6, 5, 4, 3, 2, 1!"},
"saySpriteChoices_44":function(d){return "Sa oled suurepärane!"},
"saySpriteChoices_45":function(d){return "Sa oled naljakas!"},
"saySpriteChoices_46":function(d){return "Sa oled tobe! "},
"saySpriteChoices_47":function(d){return "Sa oled hea sõber!"},
"saySpriteChoices_48":function(d){return "Vaata ette!"},
"saySpriteChoices_49":function(d){return "Kummardu!"},
"saySpriteChoices_50":function(d){return "Kätte sain!"},
"saySpriteChoices_51":function(d){return "Ai!"},
"saySpriteChoices_52":function(d){return "Vabandust!"},
"saySpriteChoices_53":function(d){return "Ettevaatust!"},
"saySpriteChoices_54":function(d){return "Vau!"},
"saySpriteChoices_55":function(d){return "Uups!"},
"saySpriteChoices_56":function(d){return "Peaaegu said mu kätte!"},
"saySpriteChoices_57":function(d){return "Hea üritus!"},
"saySpriteChoices_58":function(d){return "Sa ei saa mind kätte!"},
"scoreText":function(d){return "Tulemus: "+studio_locale.v(d,"playerScore")},
"setActivityRandom":function(d){return "sea tegevus juhuslikuks"},
"setActivityRoam":function(d){return "sea tegevus hulkumiseks"},
"setActivityChase":function(d){return "sea tegevus tagaajamiseks"},
"setActivityFlee":function(d){return "sea tegevus põgenemiseks"},
"setActivityNone":function(d){return "sea tegevus mittemillekski"},
"setActivityTooltip":function(d){return "Seab määratud tegelastele tegevuse"},
"setBackground":function(d){return "vali taust"},
"setBackgroundRandom":function(d){return "vali suvaline taust"},
"setBackgroundBlack":function(d){return "vali musta värvi taust"},
"setBackgroundCave":function(d){return "vali koopa taust"},
"setBackgroundCloudy":function(d){return "vali pilvine taust"},
"setBackgroundHardcourt":function(d){return "vali kõvakattega väljak taustaks"},
"setBackgroundNight":function(d){return "vali öine taust"},
"setBackgroundUnderwater":function(d){return "vali veealune taust"},
"setBackgroundCity":function(d){return "vali linna taust"},
"setBackgroundDesert":function(d){return "vali kõrbe taust"},
"setBackgroundRainbow":function(d){return "vali vikerkaare taust"},
"setBackgroundSoccer":function(d){return "vali jalgpalli taust"},
"setBackgroundSpace":function(d){return "vali kosmose taust"},
"setBackgroundTennis":function(d){return "vali tennise taust"},
"setBackgroundWinter":function(d){return "vali talvine taust"},
"setBackgroundLeafy":function(d){return "määra leherohke taust"},
"setBackgroundGrassy":function(d){return "vali rohtukasvanud taust"},
"setBackgroundFlower":function(d){return "vali lille taust"},
"setBackgroundTile":function(d){return "vali plaatide taust"},
"setBackgroundIcy":function(d){return "vali jäine taust"},
"setBackgroundSnowy":function(d){return "vali lumine taust"},
"setBackgroundForest":function(d){return "määra taustaks mets"},
"setBackgroundSnow":function(d){return "määra taustaks lumi"},
"setBackgroundShip":function(d){return "määra taustaks laev"},
"setBackgroundTooltip":function(d){return "Valib taustapildi"},
"setEnemySpeed":function(d){return "vali vaenlase kiirus"},
"setItemSpeedSet":function(d){return "määra tüüp"},
"setItemSpeedTooltip":function(d){return "Määrab teatud tegelastele kiiruse"},
"setPlayerSpeed":function(d){return "vali mängija kiirus"},
"setScoreText":function(d){return "määra tulemus"},
"setScoreTextTooltip":function(d){return "Määrab teksti, mis kuvatakse skoori alal."},
"setSpriteEmotionAngry":function(d){return "vihasesse meeleollu"},
"setSpriteEmotionHappy":function(d){return "rõõmsasse meeleollu"},
"setSpriteEmotionNormal":function(d){return "tavalisse meeleollu"},
"setSpriteEmotionRandom":function(d){return "juhuslikku meeleollu"},
"setSpriteEmotionSad":function(d){return "kurba meeleollu"},
"setSpriteEmotionTooltip":function(d){return "Määrab tegelaskuju meeleolu"},
"setSpriteAlien":function(d){return "tulnuka pildiks"},
"setSpriteBat":function(d){return "nahkhiire pildiks"},
"setSpriteBird":function(d){return "linnu pildiks"},
"setSpriteCat":function(d){return "kassi pildiks"},
"setSpriteCaveBoy":function(d){return "koopapoisi pildiks"},
"setSpriteCaveGirl":function(d){return "koopatüdruku pildiks"},
"setSpriteDinosaur":function(d){return "dinosauruse pildiks"},
"setSpriteDog":function(d){return "koera pildiks"},
"setSpriteDragon":function(d){return "draakoni pildiks"},
"setSpriteGhost":function(d){return "kummituse pildiks"},
"setSpriteHidden":function(d){return "peidetud pildiks"},
"setSpriteHideK1":function(d){return "peida"},
"setSpriteAnna":function(d){return "Anna pildiks"},
"setSpriteElsa":function(d){return "Elsa pildiks"},
"setSpriteHiro":function(d){return "Hiro pildiks"},
"setSpriteBaymax":function(d){return "Baymaxi pildiks"},
"setSpriteRapunzel":function(d){return "Rapuntseli pildiks"},
"setSpriteKnight":function(d){return "rüütli pildiks"},
"setSpriteMonster":function(d){return "koletise pildiks"},
"setSpriteNinja":function(d){return "maskeeritud ninja pildiks"},
"setSpriteOctopus":function(d){return "kaheksajala pildiks"},
"setSpritePenguin":function(d){return "pingviini pildiks"},
"setSpritePirate":function(d){return "piraadi pildiks"},
"setSpritePrincess":function(d){return "printsessi pildiks"},
"setSpriteRandom":function(d){return "juhuslikuks pildiks"},
"setSpriteRobot":function(d){return "roboti pildiks"},
"setSpriteShowK1":function(d){return "näita"},
"setSpriteSpacebot":function(d){return "kosmoseroboti pildiks"},
"setSpriteSoccerGirl":function(d){return "jalgpallitüdruku pildiks"},
"setSpriteSoccerBoy":function(d){return "jalgpallipoisi pildiks"},
"setSpriteSquirrel":function(d){return "orava pildiks"},
"setSpriteTennisGirl":function(d){return "tennisetüdruku pildiks"},
"setSpriteTennisBoy":function(d){return "tennisepoisi pildiks"},
"setSpriteUnicorn":function(d){return "ükssarve pildiks"},
"setSpriteWitch":function(d){return "nõia pildiks"},
"setSpriteWizard":function(d){return "võluri pildiks"},
"setSpritePositionTooltip":function(d){return "Liigutab tegelase koheselt määratud asukohta."},
"setSpriteK1Tooltip":function(d){return "Kuvab või peidab määratud tegelase."},
"setSpriteTooltip":function(d){return "Määrab tegelase pildi"},
"setSpriteSizeRandom":function(d){return "juhuslikuks"},
"setSpriteSizeVerySmall":function(d){return "väga väikseks"},
"setSpriteSizeSmall":function(d){return "väikseks"},
"setSpriteSizeNormal":function(d){return "normaalseks"},
"setSpriteSizeLarge":function(d){return "suureks"},
"setSpriteSizeVeryLarge":function(d){return "väga suureks"},
"setSpriteSizeTooltip":function(d){return "Määrab tegelase suuruse"},
"setSpriteSpeedRandom":function(d){return "juhuslikuks"},
"setSpriteSpeedVerySlow":function(d){return "väga aeglaseks"},
"setSpriteSpeedSlow":function(d){return "aeglaseks"},
"setSpriteSpeedNormal":function(d){return "normaalseks"},
"setSpriteSpeedFast":function(d){return "kiireks"},
"setSpriteSpeedVeryFast":function(d){return "väga kiireks"},
"setSpriteSpeedTooltip":function(d){return "Määrab tegelase kiiruse"},
"setSpriteZombie":function(d){return "zombi pildiks"},
"setSpriteBot1":function(d){return "bot1-ni"},
"setSpriteBot2":function(d){return "bot2-ni"},
"setMap":function(d){return "määra kaart"},
"setMapRandom":function(d){return "määra juhuslik kaart"},
"setMapBlank":function(d){return "määra tühi kaart"},
"setMapCircle":function(d){return "määra ringikujuline kaart"},
"setMapCircle2":function(d){return "määra ringikujuline2 kaart"},
"setMapHorizontal":function(d){return "määra horisontaalne kaart"},
"setMapGrid":function(d){return "lisa võrgu kaart"},
"setMapBlobs":function(d){return "lisa kujundite kaart"},
"setMapTooltip":function(d){return "Muudab stseeni kaarti"},
"shareStudioTwitter":function(d){return "Vaata seda lugu, mis ma tegin. Kirjutasin selle ise @codeorgi abiga"},
"shareGame":function(d){return "Jaga oma lugu:"},
"showCoordinates":function(d){return "näita koordinaate"},
"showCoordinatesTooltip":function(d){return "kuva ekraanil peategelase koordinaadid"},
"showTitleScreen":function(d){return "näita tiitellehte"},
"showTitleScreenTitle":function(d){return "pealkiri"},
"showTitleScreenText":function(d){return "tekst"},
"showTSDefTitle":function(d){return "sisesta pealkiri"},
"showTSDefText":function(d){return "sisesta tekst"},
"showTitleScreenTooltip":function(d){return "Kuva tiitelleht koos vastava pealkirja ja tekstiga."},
"size":function(d){return "suurus"},
"setSprite":function(d){return "väärtusta"},
"setSpriteN":function(d){return "sea tegelane "+studio_locale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "purustama"},
"soundGoal1":function(d){return "eesmärk 1"},
"soundGoal2":function(d){return "eesmärk 2"},
"soundHit":function(d){return "löök"},
"soundLosePoint":function(d){return "kaotasid punkti"},
"soundLosePoint2":function(d){return "kaotasid punkti 2"},
"soundRetro":function(d){return "retro"},
"soundRubber":function(d){return "kumm"},
"soundSlap":function(d){return "laks"},
"soundWinPoint":function(d){return "võidetud punkt"},
"soundWinPoint2":function(d){return "võidetud punkt 2"},
"soundWood":function(d){return "puit"},
"speed":function(d){return "kiirus"},
"startSetValue":function(d){return "käivita (funktsioon)"},
"startSetVars":function(d){return "mängu_muutujad (pealkiri, alampealkiri, taust, eesmärk, oht, mängija)"},
"startSetFuncs":function(d){return "game_funcs (update-target, update-danger, update-player, collide?, on-screen?)"},
"stopSprite":function(d){return "stopp"},
"stopSpriteN":function(d){return "peata tegelane "+studio_locale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Peatab tegelase liikumise."},
"throwSprite":function(d){return "viska"},
"throwSpriteN":function(d){return "tegelaskuju "+studio_locale.v(d,"spriteIndex")+" viskab"},
"throwTooltip":function(d){return "Määratud tegelaskuju viskab viskekeha."},
"vanish":function(d){return "kaota"},
"vanishActorN":function(d){return "kaota tegelane "+studio_locale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "Kaotab tegelase."},
"waitFor":function(d){return "oota"},
"waitSeconds":function(d){return "sekundit"},
"waitForClick":function(d){return "oota klikki"},
"waitForRandom":function(d){return "oota juhuslikku sündmust"},
"waitForHalfSecond":function(d){return "oota pool sekundit"},
"waitFor1Second":function(d){return "oota 1 sekund"},
"waitFor2Seconds":function(d){return "oota 2 sekundit"},
"waitFor5Seconds":function(d){return "oota 5 sekundit"},
"waitFor10Seconds":function(d){return "oota 10 sekundit"},
"waitParamsTooltip":function(d){return "Ootab määratud arvu sekundeid või kasuta nulli, et oodata, kuni klikitakse."},
"waitTooltip":function(d){return "Ootab määratud aja või kuni klikitakse."},
"whenArrowDown":function(d){return "nool alla"},
"whenArrowLeft":function(d){return "nool vasakule"},
"whenArrowRight":function(d){return "nool paremale"},
"whenArrowUp":function(d){return "nool üles"},
"whenArrowTooltip":function(d){return "Käivita järgnevad tegevused, kui vajutatakse määratud nuppu."},
"whenDown":function(d){return "kui hoitakse allanoolt"},
"whenDownTooltip":function(d){return "Täida allolevad käsud, kui vajutatakse allanoolt."},
"whenGameStarts":function(d){return "kui lugu algab"},
"whenGameStartsTooltip":function(d){return "Käivita järgmised tegevused, kui lugu algab."},
"whenLeft":function(d){return "kui hoitakse vasaknoolt"},
"whenLeftTooltip":function(d){return "Kui kasutaja vajutab vasakpoolset noolt, teosta järgmised toimingud."},
"whenRight":function(d){return "kui hoitakse paremnoolt"},
"whenRightTooltip":function(d){return "Täida allolevad käsud, kui vajutatakse paremnoolt."},
"whenSpriteClicked":function(d){return "kui tegelast puudutatakse"},
"whenSpriteClickedN":function(d){return "kui tegelast "+studio_locale.v(d,"spriteIndex")+" puudutatakse"},
"whenSpriteClickedTooltip":function(d){return "Käivita järgnevad tegevused, kui tegelast puudutatakse."},
"whenSpriteCollidedN":function(d){return "kui tegelane "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "Käivita järgnevad tegevused, kui üks tegelane puudutab teist tegelast."},
"whenSpriteCollidedWith":function(d){return "puudutab"},
"whenSpriteCollidedWithAnyActor":function(d){return "puudutab mõnda tegelast"},
"whenSpriteCollidedWithAnyEdge":function(d){return "puudutab mõnda serva"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "puudutab mõnda viskekeha"},
"whenSpriteCollidedWithAnything":function(d){return "puudutab ükskõik mida"},
"whenSpriteCollidedWithN":function(d){return "puudutab tegelast "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "puudutab sinist tulekera"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "puudutab lillat tulekera"},
"whenSpriteCollidedWithRedFireball":function(d){return "puudutab punast tulekera"},
"whenSpriteCollidedWithYellowHearts":function(d){return "puudutab kollaseid südameid"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "puudutab lillasid südameid"},
"whenSpriteCollidedWithRedHearts":function(d){return "puudutab punaseid südameid"},
"whenSpriteCollidedWithBottomEdge":function(d){return "puudutab alumist serva"},
"whenSpriteCollidedWithLeftEdge":function(d){return "puudutab vasakut serva"},
"whenSpriteCollidedWithRightEdge":function(d){return "puudutab paremat serva"},
"whenSpriteCollidedWithTopEdge":function(d){return "puudutab ülemist serva"},
"whenTouchItem":function(d){return "kui tegelast puudutatakse"},
"whenTouchItemTooltip":function(d){return "Teosta allpool olevad tegevused, kui tegelane puudutab tegelaskuju."},
"whenTouchWall":function(d){return "kui puudutatakse tõket"},
"whenTouchWallTooltip":function(d){return "Teosta allpool olevad tegevused, kui tegelane puudutab tõket."},
"whenUp":function(d){return "kui hoitakse ülesnoolt"},
"whenUpTooltip":function(d){return "Täida allolevad käsud, kui vajutatakse ülesnoolt."},
"yes":function(d){return "Jah"},
"failedHasSetSprite":function(d){return "Next time, set a character."},
"failedHasSetBotSpeed":function(d){return "Next time, set a bot speed."},
"failedTouchAllItems":function(d){return "Next time, get all the items."},
"failedScoreMinimum":function(d){return "Next time, reach the minimum score."},
"failedRemovedItemCount":function(d){return "Next time, get the right number of items."},
"failedSetActivity":function(d){return "Next time, set the correct character activity."},
"calloutPutCommandsHereRunStart":function(d){return "Put commands here to have them run when the program starts"},
"calloutUseArrowButtons":function(d){return "Hold down these buttons or the arrow keys on your keyboard to trigger the move events."},
"dropletBlock_endGame_description":function(d){return "End the game."},
"dropletBlock_endGame_param0":function(d){return "type"},
"dropletBlock_endGame_param0_description":function(d){return "Whether the game was won or lost ('win', 'lose')."},
"loseMessage":function(d){return "You lose!"},
"winMessage":function(d){return "You win!"},
"failedHasSetBackground":function(d){return "Next time, set the background."},
"failedHasSetMap":function(d){return "Next time, set the map."},
"failedHasWonGame":function(d){return "Next time, win the game."},
"failedHasLostGame":function(d){return "Next time, lose the game"},
"failedAddItem":function(d){return "Next time, add a character."}};