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
"actor":function(d){return "aktér"},
"addCharacter":function(d){return "add a"},
"addCharacterTooltip":function(d){return "Add a character to the scene."},
"alienInvasion":function(d){return "Mimozemská invaze!"},
"backgroundBlack":function(d){return "černý"},
"backgroundCave":function(d){return "jeskyně"},
"backgroundCloudy":function(d){return "zamračeno"},
"backgroundHardcourt":function(d){return "tenisový kurt"},
"backgroundNight":function(d){return "noc"},
"backgroundUnderwater":function(d){return "pod vodou"},
"backgroundCity":function(d){return "město"},
"backgroundDesert":function(d){return "poušť"},
"backgroundRainbow":function(d){return "duha"},
"backgroundSoccer":function(d){return "fotbal"},
"backgroundSpace":function(d){return "vesmír"},
"backgroundTennis":function(d){return "tenis"},
"backgroundWinter":function(d){return "zima"},
"catActions":function(d){return "Akce"},
"catControl":function(d){return "Smyčky"},
"catEvents":function(d){return "Události"},
"catLogic":function(d){return "Logika"},
"catMath":function(d){return "Matematika"},
"catProcedures":function(d){return "Funkce"},
"catText":function(d){return "text"},
"catVariables":function(d){return "Proměnné"},
"changeScoreTooltip":function(d){return "Přidat nebo odebrat bod ze skóre."},
"changeScoreTooltipK1":function(d){return "Přidat bod."},
"continue":function(d){return "Pokračovat"},
"decrementPlayerScore":function(d){return "Odebrat bod"},
"defaultSayText":function(d){return "Piš zde"},
"dropletBlock_addCharacter_description":function(d){return "Add a character to the scene."},
"dropletBlock_addCharacter_param0":function(d){return "type"},
"dropletBlock_addCharacter_param0_description":function(d){return "The type of the character to be added ('random', 'man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_changeScore_description":function(d){return "Přidat nebo odebrat bod ze skóre."},
"dropletBlock_changeScore_param0":function(d){return "výsledek"},
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
"dropletBlock_playSound_description":function(d){return "Přehraj vybraný zvuk."},
"dropletBlock_playSound_param0":function(d){return "sound"},
"dropletBlock_playSound_param0_description":function(d){return "The name of the sound to play."},
"dropletBlock_setBackground_description":function(d){return "Nastaví motiv pozadí."},
"dropletBlock_setBackground_param0":function(d){return "image"},
"dropletBlock_setBackground_param0_description":function(d){return "The name of the background theme ('background1', 'background2', or 'background3')."},
"dropletBlock_setBot_description":function(d){return "Changes the active bot."},
"dropletBlock_setBot_param0":function(d){return "obrázek"},
"dropletBlock_setBot_param0_description":function(d){return "The name of the bot image ('random', 'bot1', or 'bot2')."},
"dropletBlock_setBotSpeed_description":function(d){return "Sets the bot speed."},
"dropletBlock_setBotSpeed_param0":function(d){return "rychlost"},
"dropletBlock_setBotSpeed_param0_description":function(d){return "The speed value ('random', 'slow', 'normal', or 'fast')."},
"dropletBlock_setSpriteEmotion_description":function(d){return "Nastaví náladu aktéra."},
"dropletBlock_setSpritePosition_description":function(d){return "Okamžitě přesune aktéra na zadané místo."},
"dropletBlock_setSpriteSpeed_description":function(d){return "Nastaví rychlost aktéra."},
"dropletBlock_setSprite_description":function(d){return "Nastaví obrázek aktéra."},
"dropletBlock_setSprite_param0":function(d){return "index"},
"dropletBlock_setSprite_param0_description":function(d){return "The index (starting at 0) indicating which actor should change."},
"dropletBlock_setSprite_param1":function(d){return "obrázek"},
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
"dropletBlock_throw_description":function(d){return "Hodí střelu zadaným aktérem."},
"dropletBlock_vanish_description":function(d){return "Aktér zmizí."},
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
"emotion":function(d){return "nálada"},
"finalLevel":function(d){return "Dobrá práce! Vyřešil si poslední hádanku."},
"for":function(d){return "pro"},
"hello":function(d){return "ahoj"},
"helloWorld":function(d){return "Ahoj světe!"},
"incrementPlayerScore":function(d){return "Bod"},
"itemBlueFireball":function(d){return "modrá ohnivá koule"},
"itemPurpleFireball":function(d){return "fialová ohnivá koule"},
"itemRedFireball":function(d){return "červená ohnivá koule"},
"itemYellowHearts":function(d){return "žlutá srdce"},
"itemPurpleHearts":function(d){return "fialová srdce"},
"itemRedHearts":function(d){return "červená srdce"},
"itemRandom":function(d){return "náhodně"},
"itemAnna":function(d){return "hák"},
"itemElsa":function(d){return "jiskra"},
"itemHiro":function(d){return "mikroboti"},
"itemBaymax":function(d){return "raketa"},
"itemRapunzel":function(d){return "pánev"},
"itemCherry":function(d){return "třešeň"},
"itemIce":function(d){return "led"},
"itemDuck":function(d){return "kachna"},
"itemMan":function(d){return "man"},
"itemPilot":function(d){return "pilot"},
"itemPig":function(d){return "pig"},
"itemBird":function(d){return "bird"},
"itemMouse":function(d){return "mouse"},
"itemRoo":function(d){return "roo"},
"itemSpider":function(d){return "spider"},
"makeProjectileDisappear":function(d){return "zmizet"},
"makeProjectileBounce":function(d){return "odrazit"},
"makeProjectileBlueFireball":function(d){return "udělej modrou ohnivou kouli"},
"makeProjectilePurpleFireball":function(d){return "udělej fialovou ohnivou kouli"},
"makeProjectileRedFireball":function(d){return "udělej červenou ohnivou kouli"},
"makeProjectileYellowHearts":function(d){return "udělej žlutá srdce"},
"makeProjectilePurpleHearts":function(d){return "udělej fialová srdce"},
"makeProjectileRedHearts":function(d){return "udělej červená srdce"},
"makeProjectileTooltip":function(d){return "Nechat střelu narazit a zmizet nebo odrazit."},
"makeYourOwn":function(d){return "Vytvořit si vlastní hru v Hravé laboratoři"},
"moveDirectionDown":function(d){return "dolů"},
"moveDirectionLeft":function(d){return "vlevo"},
"moveDirectionRight":function(d){return "vpravo"},
"moveDirectionUp":function(d){return "nahoru"},
"moveDirectionRandom":function(d){return "náhodně"},
"moveDistance25":function(d){return "25 pixelů"},
"moveDistance50":function(d){return "50 pixelů"},
"moveDistance100":function(d){return "100 pixelů"},
"moveDistance200":function(d){return "200 pixelů"},
"moveDistance400":function(d){return "400 pixelů"},
"moveDistancePixels":function(d){return "pixely"},
"moveDistanceRandom":function(d){return "náhodné pixely"},
"moveDistanceTooltip":function(d){return "Přemístit herce určenou vzdálenost ve specifickém směru."},
"moveSprite":function(d){return "pohyb"},
"moveSpriteN":function(d){return "pohnout hercem "+studio_locale.v(d,"spriteIndex")},
"toXY":function(d){return "do x,y"},
"moveDown":function(d){return "pohyb dolů"},
"moveDownTooltip":function(d){return "pohnout hercem dolů."},
"moveLeft":function(d){return "pohnout vlevo"},
"moveLeftTooltip":function(d){return "pohnout hercem vlevo."},
"moveRight":function(d){return "pohnout vpravo"},
"moveRightTooltip":function(d){return "pohnout hercem vpravo."},
"moveUp":function(d){return "pohnout nahoru"},
"moveUpTooltip":function(d){return "pohnout hercem nahoru."},
"moveTooltip":function(d){return "pohnout hercem."},
"nextLevel":function(d){return "Dobrá práce! Dokončil jsi tuto hádanku."},
"no":function(d){return "Ne"},
"numBlocksNeeded":function(d){return "Tato hádanka může být vyřešena pomocí %1 bloků."},
"onEventTooltip":function(d){return "Spustit kód v reakci na konkrétní událost."},
"ouchExclamation":function(d){return "Au!"},
"playSoundCrunch":function(d){return "přehrát zvuk křupání"},
"playSoundGoal1":function(d){return "přehrát zvuk cíl 1"},
"playSoundGoal2":function(d){return "přehrát zvuk cíl 2"},
"playSoundHit":function(d){return "přehrát zvuk zásah"},
"playSoundLosePoint":function(d){return "přehrát zvuk ztráta bodu"},
"playSoundLosePoint2":function(d){return "přehrát zvuk ztráta bodu 2"},
"playSoundRetro":function(d){return "přehrát zvuk \"retro\""},
"playSoundRubber":function(d){return "přehrát zvuk guma"},
"playSoundSlap":function(d){return "přehrát zvuk plácnutí"},
"playSoundTooltip":function(d){return "Přehraj vybraný zvuk."},
"playSoundWinPoint":function(d){return "přehrát zvuk vyhraný bod"},
"playSoundWinPoint2":function(d){return "přehrát zvuk vyhraný bod 2"},
"playSoundWood":function(d){return "přehrát zvuk dřeva"},
"positionOutTopLeft":function(d){return "nad horní levou pozicí"},
"positionOutTopRight":function(d){return "na pozici nad horní pravou pozicí"},
"positionTopOutLeft":function(d){return "na horní vnější levou pozici"},
"positionTopLeft":function(d){return "na horní levou pozici"},
"positionTopCenter":function(d){return "na horní středovou pozici"},
"positionTopRight":function(d){return "na horní pravou pozici"},
"positionTopOutRight":function(d){return "na horní vnější pravou pozici"},
"positionMiddleLeft":function(d){return "na střední levou pozici"},
"positionMiddleCenter":function(d){return "na prostřední středovou pozici"},
"positionMiddleRight":function(d){return "na prostřední pravou pozici"},
"positionBottomOutLeft":function(d){return "na spodní vnější levou pozici"},
"positionBottomLeft":function(d){return "na spodní levou pozici"},
"positionBottomCenter":function(d){return "na dolní středovou pozici"},
"positionBottomRight":function(d){return "na spodní pravou pozici"},
"positionBottomOutRight":function(d){return "na spodní vnější pravou pozici"},
"positionOutBottomLeft":function(d){return "na pozici pod spodní levou pozicí"},
"positionOutBottomRight":function(d){return "na pozici pod spodní pravou pozicí"},
"positionRandom":function(d){return "na náhodnou pozici"},
"projectileBlueFireball":function(d){return "modrá ohnivá koule"},
"projectilePurpleFireball":function(d){return "fialová ohnivá koule"},
"projectileRedFireball":function(d){return "červená ohnivá koule"},
"projectileYellowHearts":function(d){return "žlutá srdce"},
"projectilePurpleHearts":function(d){return "fialová srdce"},
"projectileRedHearts":function(d){return "červená srdce"},
"projectileRandom":function(d){return "náhodně"},
"projectileAnna":function(d){return "hák"},
"projectileElsa":function(d){return "jiskra"},
"projectileHiro":function(d){return "mikroboti"},
"projectileBaymax":function(d){return "raketa"},
"projectileRapunzel":function(d){return "pánev"},
"projectileCherry":function(d){return "třešeň"},
"projectileIce":function(d){return "led"},
"projectileDuck":function(d){return "kachna"},
"reinfFeedbackMsg":function(d){return "Můžete stisknou tlačítko \""+studio_locale.v(d,"backButton")+"\" pro návrat k přehrání vašeho příběhu."},
"repeatForever":function(d){return "opakujte do nekonečna"},
"repeatDo":function(d){return "dělej"},
"repeatForeverTooltip":function(d){return "Provést akce v tomto bloku opakovaně, pokud je spuštěn příběh."},
"saySprite":function(d){return "řekni"},
"saySpriteN":function(d){return "aktér "+studio_locale.v(d,"spriteIndex")+" říká"},
"saySpriteTooltip":function(d){return "Vyskočí textová bublina zvoleného aktéra."},
"saySpriteChoices_0":function(d){return "Ahoj."},
"saySpriteChoices_1":function(d){return "Ahoj všichni."},
"saySpriteChoices_2":function(d){return "Jak se máš?"},
"saySpriteChoices_3":function(d){return "Dobré ráno"},
"saySpriteChoices_4":function(d){return "Dobré odpoledne"},
"saySpriteChoices_5":function(d){return "Dobrou noc"},
"saySpriteChoices_6":function(d){return "Dobrý večer"},
"saySpriteChoices_7":function(d){return "Co je nového?"},
"saySpriteChoices_8":function(d){return "Co?"},
"saySpriteChoices_9":function(d){return "Kde?"},
"saySpriteChoices_10":function(d){return "Kdy?"},
"saySpriteChoices_11":function(d){return "Dobře."},
"saySpriteChoices_12":function(d){return "Skvělé!"},
"saySpriteChoices_13":function(d){return "Dobře."},
"saySpriteChoices_14":function(d){return "Není to zlé."},
"saySpriteChoices_15":function(d){return "Hodně štěstí."},
"saySpriteChoices_16":function(d){return "Ano"},
"saySpriteChoices_17":function(d){return "Ne"},
"saySpriteChoices_18":function(d){return "Dobře"},
"saySpriteChoices_19":function(d){return "Pěkný hod!"},
"saySpriteChoices_20":function(d){return "Hezký den."},
"saySpriteChoices_21":function(d){return "Nashledanou."},
"saySpriteChoices_22":function(d){return "Hned jsem zpátky."},
"saySpriteChoices_23":function(d){return "Na viděnou zítra!"},
"saySpriteChoices_24":function(d){return "Zatím se měj!"},
"saySpriteChoices_25":function(d){return "Opatruj se!"},
"saySpriteChoices_26":function(d){return "Užijte si!"},
"saySpriteChoices_27":function(d){return "Musím jít."},
"saySpriteChoices_28":function(d){return "Chcete se s námi spřátelit?"},
"saySpriteChoices_29":function(d){return "Skvělá práce!"},
"saySpriteChoices_30":function(d){return "Pane jo!"},
"saySpriteChoices_31":function(d){return "Hurá!"},
"saySpriteChoices_32":function(d){return "Těší mě."},
"saySpriteChoices_33":function(d){return "Dobře!"},
"saySpriteChoices_34":function(d){return "Děkuji"},
"saySpriteChoices_35":function(d){return "Ne, děkuji"},
"saySpriteChoices_36":function(d){return "Aaaaaah!"},
"saySpriteChoices_37":function(d){return "Nevadí"},
"saySpriteChoices_38":function(d){return "Dnes"},
"saySpriteChoices_39":function(d){return "Zítra"},
"saySpriteChoices_40":function(d){return "Včera"},
"saySpriteChoices_41":function(d){return "Našel jsem tě!"},
"saySpriteChoices_42":function(d){return "Našel si mě!"},
"saySpriteChoices_43":function(d){return "10, 9, 8, 7, 6, 5, 4, 3, 2, 1!"},
"saySpriteChoices_44":function(d){return "Jsi skvělý!"},
"saySpriteChoices_45":function(d){return "Jsi vtipný!"},
"saySpriteChoices_46":function(d){return "Jsi pošetilý! "},
"saySpriteChoices_47":function(d){return "Jsi dobrý přítel!"},
"saySpriteChoices_48":function(d){return "Dávej pozor!"},
"saySpriteChoices_49":function(d){return "Kachna!"},
"saySpriteChoices_50":function(d){return "Mám tě!"},
"saySpriteChoices_51":function(d){return "Ou!"},
"saySpriteChoices_52":function(d){return "Promiň!"},
"saySpriteChoices_53":function(d){return "Opatrně!"},
"saySpriteChoices_54":function(d){return "Páni!"},
"saySpriteChoices_55":function(d){return "Jejda!"},
"saySpriteChoices_56":function(d){return "Málem jsi mě dostal!"},
"saySpriteChoices_57":function(d){return "Hezký pokus!"},
"saySpriteChoices_58":function(d){return "Nemůžeš mě chytit!"},
"scoreText":function(d){return "Body: "+studio_locale.v(d,"playerScore")},
"setActivityRandom":function(d){return "nastavit činnost náhodně pro"},
"setActivityRoam":function(d){return "set activity to roam for"},
"setActivityChase":function(d){return "nastavení aktivity honit se za"},
"setActivityFlee":function(d){return "nastavení aktivity uniknout do"},
"setActivityNone":function(d){return "nastavit činnost nikomu pro"},
"setActivityTooltip":function(d){return "Nastaví činnost pro sadu položek"},
"setBackground":function(d){return "nastavit pozadí"},
"setBackgroundRandom":function(d){return "nastavit náhodné pozadí"},
"setBackgroundBlack":function(d){return "nastavit černé pozadí"},
"setBackgroundCave":function(d){return "nastavit pozadí jeskyně"},
"setBackgroundCloudy":function(d){return "nastavit mraky na pozadí"},
"setBackgroundHardcourt":function(d){return "nastavit tenisové hřiště na pozadí"},
"setBackgroundNight":function(d){return "nastavit pozadí noc"},
"setBackgroundUnderwater":function(d){return "nastavit pozadí pod vodou"},
"setBackgroundCity":function(d){return "nastavit město na pozadí"},
"setBackgroundDesert":function(d){return "nastavit poušť na pozadí"},
"setBackgroundRainbow":function(d){return "nastavit duhu na pozadí"},
"setBackgroundSoccer":function(d){return "nastavit fotbal na pozadí"},
"setBackgroundSpace":function(d){return "nastavit vesmír na pozadí"},
"setBackgroundTennis":function(d){return "nastavit tenis na pozadí"},
"setBackgroundWinter":function(d){return "nastavit zimu na pozadí"},
"setBackgroundLeafy":function(d){return "nastavit listnaté pozadí"},
"setBackgroundGrassy":function(d){return "nastavit travnaté pozadí"},
"setBackgroundFlower":function(d){return "nastavit květinové pozadí"},
"setBackgroundTile":function(d){return "nastavit dlaždicové pozadí"},
"setBackgroundIcy":function(d){return "nastavit ledové pozadí"},
"setBackgroundSnowy":function(d){return "nastavit zasněžené pozadí"},
"setBackgroundForest":function(d){return "set forest background"},
"setBackgroundSnow":function(d){return "set snow background"},
"setBackgroundShip":function(d){return "set ship background"},
"setBackgroundTooltip":function(d){return "Nastavit obrázek pozadí"},
"setEnemySpeed":function(d){return "nastavit rychlost protivníka"},
"setItemSpeedSet":function(d){return "nastavit typ"},
"setItemSpeedTooltip":function(d){return "Nastaví se rychlost pro skupinu položek"},
"setPlayerSpeed":function(d){return "nastavit rychlost hráče"},
"setScoreText":function(d){return "nastavit body"},
"setScoreTextTooltip":function(d){return "Nastaví text, který se má zobrazit v oblasti pro výsledek."},
"setSpriteEmotionAngry":function(d){return "na nahněvanou náladu"},
"setSpriteEmotionHappy":function(d){return "na šťastnou náladu"},
"setSpriteEmotionNormal":function(d){return "na normální náladu"},
"setSpriteEmotionRandom":function(d){return "na náhodnou náladu"},
"setSpriteEmotionSad":function(d){return "na smutnou náladu"},
"setSpriteEmotionTooltip":function(d){return "Nastaví náladu aktéra"},
"setSpriteAlien":function(d){return "na obrázek mimozemšťana"},
"setSpriteBat":function(d){return "na obrázek netopýra"},
"setSpriteBird":function(d){return "na obrázek ptáka"},
"setSpriteCat":function(d){return "na obrázek kočky"},
"setSpriteCaveBoy":function(d){return "na obrázek jeskynního chlapce"},
"setSpriteCaveGirl":function(d){return "na obrazek dívky (Jasmine) jeskyně"},
"setSpriteDinosaur":function(d){return "na obrázek dinosaura"},
"setSpriteDog":function(d){return "na obrázek psa"},
"setSpriteDragon":function(d){return "na obrázek draka"},
"setSpriteGhost":function(d){return "na obrázek ducha"},
"setSpriteHidden":function(d){return "na skrytý obrázek"},
"setSpriteHideK1":function(d){return "skrýt"},
"setSpriteAnna":function(d){return "na obrázek Anny"},
"setSpriteElsa":function(d){return "na obrázek Elsy"},
"setSpriteHiro":function(d){return "na obrázek Hira"},
"setSpriteBaymax":function(d){return "na obrázek Baymaxe"},
"setSpriteRapunzel":function(d){return "na obrázek Rapunzela"},
"setSpriteKnight":function(d){return "na obrázek rytíře"},
"setSpriteMonster":function(d){return "na obrázek příšery"},
"setSpriteNinja":function(d){return "na obrázek zamaskované ninjy"},
"setSpriteOctopus":function(d){return "na obrázek chobotnice"},
"setSpritePenguin":function(d){return "na obrázek tučňáka (Waddles)"},
"setSpritePirate":function(d){return "na obrázek piráta"},
"setSpritePrincess":function(d){return "na obrázek princezny"},
"setSpriteRandom":function(d){return "na náhodný obrázek"},
"setSpriteRobot":function(d){return "na obrázek robota (Spiff)"},
"setSpriteShowK1":function(d){return "zobrazit"},
"setSpriteSpacebot":function(d){return "na obrázek vesmírného robota"},
"setSpriteSoccerGirl":function(d){return "na obrázek fotbalistky"},
"setSpriteSoccerBoy":function(d){return "na obrázek fotbalisty"},
"setSpriteSquirrel":function(d){return "na obrázek veverky"},
"setSpriteTennisGirl":function(d){return "na obrázek tenistky"},
"setSpriteTennisBoy":function(d){return "na obrázek tenisty"},
"setSpriteUnicorn":function(d){return "na obrázek jednorožce"},
"setSpriteWitch":function(d){return "na obrázek čarodějnice"},
"setSpriteWizard":function(d){return "na obrázek čaroděje"},
"setSpritePositionTooltip":function(d){return "Okamžitě přesune aktéra na zadané místo."},
"setSpriteK1Tooltip":function(d){return "Zobrazí nebo skryje zadaného aktéra."},
"setSpriteTooltip":function(d){return "Nastaví obrázek aktéra"},
"setSpriteSizeRandom":function(d){return "na náhodnou velikost"},
"setSpriteSizeVerySmall":function(d){return "na velmi malou velikost"},
"setSpriteSizeSmall":function(d){return "na malou velikost"},
"setSpriteSizeNormal":function(d){return "na normální velikost"},
"setSpriteSizeLarge":function(d){return "na velkou velikost"},
"setSpriteSizeVeryLarge":function(d){return "na velmi velikou velikost"},
"setSpriteSizeTooltip":function(d){return "Nastaví velikost aktéra"},
"setSpriteSpeedRandom":function(d){return "na náhodnou rychlost"},
"setSpriteSpeedVerySlow":function(d){return "na velmi pomalou rychlost"},
"setSpriteSpeedSlow":function(d){return "na pomalou rychlost"},
"setSpriteSpeedNormal":function(d){return "na normální rychlost"},
"setSpriteSpeedFast":function(d){return "na rychlou rychlost"},
"setSpriteSpeedVeryFast":function(d){return "na velmi rychlou rychlost"},
"setSpriteSpeedTooltip":function(d){return "Nastaví rychlost aktéra"},
"setSpriteZombie":function(d){return "na obrázek zombie"},
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
"shareStudioTwitter":function(d){return "Zkontrolujte si příběh, který si udělal. Napsal jsem to sám s @codeorg"},
"shareGame":function(d){return "Sdílej svůj příběh:"},
"showCoordinates":function(d){return "Zobrazit souřadnice"},
"showCoordinatesTooltip":function(d){return "zobrazí souřadnice hlavní postavy na obrazovce"},
"showTitleScreen":function(d){return "zobrazit úvodní obrazovku"},
"showTitleScreenTitle":function(d){return "název"},
"showTitleScreenText":function(d){return "text"},
"showTSDefTitle":function(d){return "zde napiš název"},
"showTSDefText":function(d){return "zde zadejte text"},
"showTitleScreenTooltip":function(d){return "Zobrazit úvodní obrazovka s přípojeným názvem a textem."},
"size":function(d){return "velikost"},
"setSprite":function(d){return "nastavit"},
"setSpriteN":function(d){return "nastavit aktéra "+studio_locale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "křupnutí"},
"soundGoal1":function(d){return "cíl 1"},
"soundGoal2":function(d){return "cíl 2"},
"soundHit":function(d){return "zásah"},
"soundLosePoint":function(d){return "ztratit bod"},
"soundLosePoint2":function(d){return "ztratit bod 2"},
"soundRetro":function(d){return "retro"},
"soundRubber":function(d){return "guma"},
"soundSlap":function(d){return "facka"},
"soundWinPoint":function(d){return "vyhrát bod"},
"soundWinPoint2":function(d){return "vyhrát bod 2"},
"soundWood":function(d){return "dřevo"},
"speed":function(d){return "rychlost"},
"startSetValue":function(d){return "start (funkce)"},
"startSetVars":function(d){return "game_vars (název, podnázev, pozadí, cíl, nebezpečí, hráč)"},
"startSetFuncs":function(d){return "game_funcs (aktualizuj-cíl, aktualizuj-nebezpečí, aktualizuj-hráče, kolize?, na-obrazovce?)"},
"stopSprite":function(d){return "zastavit"},
"stopSpriteN":function(d){return "zastavit aktéra "+studio_locale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Zastaví pohyb aktéra."},
"throwSprite":function(d){return "hod"},
"throwSpriteN":function(d){return "aktér "+studio_locale.v(d,"spriteIndex")+" hodí"},
"throwTooltip":function(d){return "Hodí střelu zadaným aktérem."},
"vanish":function(d){return "zmizí"},
"vanishActorN":function(d){return "zmizí aktér "+studio_locale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "Aktér zmizí."},
"waitFor":function(d){return "čekat na"},
"waitSeconds":function(d){return "sekundy"},
"waitForClick":function(d){return "čekat na klepnutí"},
"waitForRandom":function(d){return "čekat náhodně"},
"waitForHalfSecond":function(d){return "čekat půl sekundy"},
"waitFor1Second":function(d){return "čekat 1 sekundu"},
"waitFor2Seconds":function(d){return "čekat 2 sekundy"},
"waitFor5Seconds":function(d){return "čekat 5 sekund"},
"waitFor10Seconds":function(d){return "čekat 10 sekund"},
"waitParamsTooltip":function(d){return "Čeká se zadaný počet sekund nebo se použijte nula pro čekání na výskyt klepnutí."},
"waitTooltip":function(d){return "Čeká se zadané množství času nebo dokud nedojde ke klepnutí."},
"whenArrowDown":function(d){return "šipka dolů"},
"whenArrowLeft":function(d){return "šipka vlevo"},
"whenArrowRight":function(d){return "šipka vpravo"},
"whenArrowUp":function(d){return "šipka nahoru"},
"whenArrowTooltip":function(d){return "Provést zadané níže uvedené akce po stisknutí klávesy se šipkou."},
"whenDown":function(d){return "když šipka dolů"},
"whenDownTooltip":function(d){return "Spusťte níže uvedené akce, když je stisknutá klávesa \"dolů\"."},
"whenGameStarts":function(d){return "když se příběh začne"},
"whenGameStartsTooltip":function(d){return "Provést níže uvedené akce, když příběh začne."},
"whenLeft":function(d){return "když šipka vlevo"},
"whenLeftTooltip":function(d){return "Spusťte níže uvedené akce, když je stisknutá klávesa \"vlevo\"."},
"whenRight":function(d){return "když šipka vpravo"},
"whenRightTooltip":function(d){return "Spusťte níže uvedené akce, když je stisknutá klávesa \"vpravo\"."},
"whenSpriteClicked":function(d){return "po klepnutí na aktéra"},
"whenSpriteClickedN":function(d){return "po klepnutí na aktéra "+studio_locale.v(d,"spriteIndex")},
"whenSpriteClickedTooltip":function(d){return "Provést níže uvedené akce po klepnutí na aktéra."},
"whenSpriteCollidedN":function(d){return "když se aktér "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "Provést níže uvedené akce, když se aktér dotkne jiného herce."},
"whenSpriteCollidedWith":function(d){return "dotkne se"},
"whenSpriteCollidedWithAnyActor":function(d){return "dotkne se nějakého aktéra"},
"whenSpriteCollidedWithAnyEdge":function(d){return "dotkne se nějakého okraje"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "dotkne se nějaké střely"},
"whenSpriteCollidedWithAnything":function(d){return "dotkne se čehokoliv"},
"whenSpriteCollidedWithN":function(d){return "dotkne se aktéra "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "dotkne modré ohnivé koule"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "dotkne fialové ohnivé koule"},
"whenSpriteCollidedWithRedFireball":function(d){return "dotkne červené ohnivé koule"},
"whenSpriteCollidedWithYellowHearts":function(d){return "dotkne žlutých srdcí"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "dotkne fialových srdcí"},
"whenSpriteCollidedWithRedHearts":function(d){return "dotkne červených srdcí"},
"whenSpriteCollidedWithBottomEdge":function(d){return "dotkne se dolního okraje"},
"whenSpriteCollidedWithLeftEdge":function(d){return "dotkne levého okraje"},
"whenSpriteCollidedWithRightEdge":function(d){return "dotkne se pravého okraje"},
"whenSpriteCollidedWithTopEdge":function(d){return "dotkne se horního okraje"},
"whenTouchItem":function(d){return "když se položka dotkla"},
"whenTouchItemTooltip":function(d){return "Provést níže uvedené akce, když aktér se dotkne položky."},
"whenTouchWall":function(d){return "když se dotkl zdi"},
"whenTouchWallTooltip":function(d){return "Provést akce níže uvedené, když aktér se dotkne položky."},
"whenUp":function(d){return "když šipka nahoru"},
"whenUpTooltip":function(d){return "Spusť uvedené akce když je stisknutá klávesa \"nahoru\"."},
"yes":function(d){return "Ano"},
"calloutPlaceCommandsHere":function(d){return "Place commands here"},
"calloutPlaceCommandsAtTop":function(d){return "Place commands to set up your game at the top"},
"calloutTypeCommandsHere":function(d){return "Type your commands here"},
"calloutCharactersMove":function(d){return "These new commands let you control how the characters move"},
"calloutPutCommandsTouchCharacter":function(d){return "Put a command here to have it happen when you touch a character"},
"calloutClickCategory":function(d){return "Click a category header to see commands in each category"},
"calloutTryOutNewCommands":function(d){return "Try out all the new commands you’ve unlocked"}};