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
"actor":function(d){return "veikėjas"},
"addCharacter":function(d){return "add a"},
"addCharacterTooltip":function(d){return "Add a character to the scene."},
"alienInvasion":function(d){return "Ateivių įsiveržimas!"},
"backgroundBlack":function(d){return "juoda"},
"backgroundCave":function(d){return "uola"},
"backgroundCloudy":function(d){return "debesuota"},
"backgroundHardcourt":function(d){return "sporto aikštelė"},
"backgroundNight":function(d){return "naktis"},
"backgroundUnderwater":function(d){return "po vandeniu"},
"backgroundCity":function(d){return "miestas"},
"backgroundDesert":function(d){return "dykuma"},
"backgroundRainbow":function(d){return "vaivorykštė"},
"backgroundSoccer":function(d){return "futbolas"},
"backgroundSpace":function(d){return "kosmosas"},
"backgroundTennis":function(d){return "tenisas"},
"backgroundWinter":function(d){return "žiema"},
"calloutPlaceCommandsHere":function(d){return "Place commands here"},
"calloutPlaceCommandsAtTop":function(d){return "Place commands to set up your game at the top"},
"calloutTypeCommandsHere":function(d){return "Type your commands here"},
"calloutCharactersMove":function(d){return "These new commands let you control how the characters move"},
"calloutPutCommandsTouchCharacter":function(d){return "Put a command here to have it happen when you touch a character"},
"calloutClickCategory":function(d){return "Click a category header to see commands in each category"},
"calloutTryOutNewCommands":function(d){return "Try out all the new commands you’ve unlocked"},
"catActions":function(d){return "Komandos"},
"catControl":function(d){return "Kartojimas"},
"catEvents":function(d){return "Įvykiai"},
"catLogic":function(d){return "Logika"},
"catMath":function(d){return "Matematika"},
"catProcedures":function(d){return "Komandų kūrimas"},
"catText":function(d){return "Tekstas"},
"catVariables":function(d){return "Kintamieji"},
"changeScoreTooltip":function(d){return "Pakeisti rezultato reikšmę."},
"changeScoreTooltipK1":function(d){return "Padidint rezultatą vienu tašku."},
"continue":function(d){return "Tęsti"},
"decrementPlayerScore":function(d){return "atimk tašką"},
"defaultSayText":function(d){return "rašyk čia"},
"dropletBlock_addCharacter_description":function(d){return "Add a character to the scene."},
"dropletBlock_addCharacter_param0":function(d){return "type"},
"dropletBlock_addCharacter_param0_description":function(d){return "The type of the character to be added ('random', 'man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_changeScore_description":function(d){return "Pakeisti rezultato reikšmę."},
"dropletBlock_changeScore_param0":function(d){return "rezultatas"},
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
"dropletBlock_playSound_description":function(d){return "Grok pasirinktą garsą."},
"dropletBlock_playSound_param0":function(d){return "sound"},
"dropletBlock_playSound_param0_description":function(d){return "The name of the sound to play."},
"dropletBlock_setBackground_description":function(d){return "Nustato fono paveikslėlį"},
"dropletBlock_setBackground_param0":function(d){return "image"},
"dropletBlock_setBackground_param0_description":function(d){return "The name of the background theme ('background1', 'background2', or 'background3')."},
"dropletBlock_setBot_description":function(d){return "Changes the active bot."},
"dropletBlock_setBot_param0":function(d){return "image"},
"dropletBlock_setBot_param0_description":function(d){return "The name of the bot image ('random', 'bot1', or 'bot2')."},
"dropletBlock_setBotSpeed_description":function(d){return "Sets the bot speed."},
"dropletBlock_setBotSpeed_param0":function(d){return "greitis"},
"dropletBlock_setBotSpeed_param0_description":function(d){return "The speed value ('random', 'slow', 'normal', or 'fast')."},
"dropletBlock_setSpriteEmotion_description":function(d){return "Nustato veikėjo nuotaiką"},
"dropletBlock_setSpritePosition_description":function(d){return "Iškart perkelia veikėją į nurodytą vietą."},
"dropletBlock_setSpriteSpeed_description":function(d){return "Nustato veikėjo greitį"},
"dropletBlock_setSprite_description":function(d){return "Nustato veikėjo išvaizdą"},
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
"dropletBlock_throw_description":function(d){return "Nurodytas veikėjas išmeta objektą (pvz, ugnies kamuolį)."},
"dropletBlock_vanish_description":function(d){return "Pašalina veikėją"},
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
"emotion":function(d){return "nuotaika"},
"finalLevel":function(d){return "Sveikinu! Tu išsprendei paskutinį galvosūkį."},
"for":function(d){return "tam"},
"hello":function(d){return "labas"},
"helloWorld":function(d){return "Labas, Pasauli!"},
"incrementPlayerScore":function(d){return "pridėk tašką"},
"itemBlueFireball":function(d){return "mėlynas ugnies kamuolys"},
"itemPurpleFireball":function(d){return "violetinis ugnies kamuolys"},
"itemRedFireball":function(d){return "raudonas ugnies kamuolys"},
"itemYellowHearts":function(d){return "geltonos širdutės"},
"itemPurpleHearts":function(d){return "violetinės širdutės"},
"itemRedHearts":function(d){return "raudonos širdutės"},
"itemRandom":function(d){return "atsitiktinis"},
"itemAnna":function(d){return "kablys"},
"itemElsa":function(d){return "žibėti"},
"itemHiro":function(d){return "mikro robotai"},
"itemBaymax":function(d){return "raketa"},
"itemRapunzel":function(d){return "puodas"},
"itemCherry":function(d){return "vyšnia"},
"itemIce":function(d){return "ledas"},
"itemDuck":function(d){return "antis"},
"itemMan":function(d){return "man"},
"itemPilot":function(d){return "pilot"},
"itemPig":function(d){return "pig"},
"itemBird":function(d){return "bird"},
"itemMouse":function(d){return "mouse"},
"itemRoo":function(d){return "roo"},
"itemSpider":function(d){return "spider"},
"makeProjectileDisappear":function(d){return "pradink"},
"makeProjectileBounce":function(d){return "atsitrenkimas"},
"makeProjectileBlueFireball":function(d){return "mėlynas ugnies kamuolys"},
"makeProjectilePurpleFireball":function(d){return "violetinis ugnies kamuolys"},
"makeProjectileRedFireball":function(d){return "raudonas ugnies kamuolys"},
"makeProjectileYellowHearts":function(d){return "geltonos širdutės"},
"makeProjectilePurpleHearts":function(d){return "violetinės širdutės"},
"makeProjectileRedHearts":function(d){return "raudonos širdutės"},
"makeProjectileTooltip":function(d){return "Susidūręs sviedinys/objektas turi pradingti arba atšokti."},
"makeYourOwn":function(d){return "Sukurk savo programėlę su žaidimų laboratorija"},
"moveDirectionDown":function(d){return "žemyn"},
"moveDirectionLeft":function(d){return "kairė"},
"moveDirectionRight":function(d){return "dešinė"},
"moveDirectionUp":function(d){return "aukštyn"},
"moveDirectionRandom":function(d){return "atsitiktinis"},
"moveDistance25":function(d){return "25 pikseliai"},
"moveDistance50":function(d){return "50 pikselių"},
"moveDistance100":function(d){return "100 pikselių"},
"moveDistance200":function(d){return "200 pikselių"},
"moveDistance400":function(d){return "400 pikselių"},
"moveDistancePixels":function(d){return "pikselių"},
"moveDistanceRandom":function(d){return "atsitiktinis pikselių skaičius"},
"moveDistanceTooltip":function(d){return "Pajudink veikėją tam tikru atstumu nurodyta kryptimi."},
"moveSprite":function(d){return "judėk"},
"moveSpriteN":function(d){return "pajudink veikėją "+studio_locale.v(d,"spriteIndex")},
"toXY":function(d){return "į x,y"},
"moveDown":function(d){return "judėk žemyn"},
"moveDownTooltip":function(d){return "Perkelti veikėją žemyn."},
"moveLeft":function(d){return "judėk kairėn"},
"moveLeftTooltip":function(d){return "Perkelti veikėją kairėn."},
"moveRight":function(d){return "judėk dešinėn"},
"moveRightTooltip":function(d){return "Perkelti veikėją dešinėn."},
"moveUp":function(d){return "judėk aukštyn"},
"moveUpTooltip":function(d){return "Perkelti veikėją aukštyn."},
"moveTooltip":function(d){return "Perkelti veikėją."},
"nextLevel":function(d){return "Sveikinu! Išsprendei šią užduotį."},
"no":function(d){return "Ne"},
"numBlocksNeeded":function(d){return "Ši užduotis gali būti išspręsta su %1 blokų(-ais)."},
"onEventTooltip":function(d){return "Vykdyti kodą atsakant į nurodytą įvykį."},
"ouchExclamation":function(d){return "Ojoj!"},
"playSoundCrunch":function(d){return "grok trakšt garsą"},
"playSoundGoal1":function(d){return "grok garsą „įvartis 1“"},
"playSoundGoal2":function(d){return "grok garsą „įvartis 2“"},
"playSoundHit":function(d){return "grok garsą „atsimušimas“"},
"playSoundLosePoint":function(d){return "grok garsą „taško praradimas“"},
"playSoundLosePoint2":function(d){return "grok garsą „taško praradimas 2“"},
"playSoundRetro":function(d){return "grok garsą „retro“"},
"playSoundRubber":function(d){return "grok garsą „guma“"},
"playSoundSlap":function(d){return "grok garsą „pliaukšt“"},
"playSoundTooltip":function(d){return "Grok pasirinktą garsą."},
"playSoundWinPoint":function(d){return "grok garsą „pelnytas taškas 1“"},
"playSoundWinPoint2":function(d){return "grok garsą „pelnytas taškas 2“"},
"playSoundWood":function(d){return "grok garsą „mediena“"},
"positionOutTopLeft":function(d){return "pozicija = virš viršutinio kairio kampo"},
"positionOutTopRight":function(d){return "pozicija = virš viršutinio dešinio kampo"},
"positionTopOutLeft":function(d){return "pozicija = kairiau viršutinio kairio kampo"},
"positionTopLeft":function(d){return "pozicija = viršuje kairėje"},
"positionTopCenter":function(d){return "pozicija = viršuje centre"},
"positionTopRight":function(d){return "pozicija = viršuje dešinėn"},
"positionTopOutRight":function(d){return "pozicija = dešiniau viršutinio dešinio kampo"},
"positionMiddleLeft":function(d){return "pozicija = viduryje kairėje"},
"positionMiddleCenter":function(d){return "pozicija = viduryje"},
"positionMiddleRight":function(d){return "pozicija = viduryje dešinėje"},
"positionBottomOutLeft":function(d){return "pozicija = kairiau apatinio kairio kampo"},
"positionBottomLeft":function(d){return "pozicija = apačioje kairėje"},
"positionBottomCenter":function(d){return "pozicija = apačioje centre"},
"positionBottomRight":function(d){return "pozicija = apačioje dešinėje"},
"positionBottomOutRight":function(d){return "pozicija = dešiniau viršutinio dešinio kampo"},
"positionOutBottomLeft":function(d){return "pozicija = žemiau apatinio kairio kampo"},
"positionOutBottomRight":function(d){return "pozicija = žemiau apatinio dešinio kampo"},
"positionRandom":function(d){return "pozicija = atsitiktinė"},
"projectileBlueFireball":function(d){return "mėlynas ugnies kamuolys"},
"projectilePurpleFireball":function(d){return "violetinis ugnies kamuolys"},
"projectileRedFireball":function(d){return "raudonas ugnies kamuolys"},
"projectileYellowHearts":function(d){return "geltonos širdutės"},
"projectilePurpleHearts":function(d){return "violetinės širdutės"},
"projectileRedHearts":function(d){return "raudonos širdutės"},
"projectileRandom":function(d){return "atsitiktinis"},
"projectileAnna":function(d){return "kablys"},
"projectileElsa":function(d){return "žibėti"},
"projectileHiro":function(d){return "mikro robotai"},
"projectileBaymax":function(d){return "raketa"},
"projectileRapunzel":function(d){return "puodas"},
"projectileCherry":function(d){return "vyšnia"},
"projectileIce":function(d){return "ledas"},
"projectileDuck":function(d){return "antis"},
"reinfFeedbackMsg":function(d){return "Galite paspausti mygtuką \""+studio_locale.v(d,"backButton")+"\" ir grįžti prie savo istorijos peržiūros."},
"repeatForever":function(d){return "kartok visada"},
"repeatDo":function(d){return " "},
"repeatForeverTooltip":function(d){return "Vykdyk veiksmus, esančius šiame bloke, pakartotinai, kol istorija yra rodoma."},
"saySprite":function(d){return "sakyk"},
"saySpriteN":function(d){return "veikėjas "+studio_locale.v(d,"spriteIndex")+" sakys"},
"saySpriteTooltip":function(d){return "Virš veikėjo galvos atsiras burbulas su nurodytu tekstu."},
"saySpriteChoices_0":function(d){return "Labas."},
"saySpriteChoices_1":function(d){return "Sveiki visi."},
"saySpriteChoices_2":function(d){return "Kaip sekasi?"},
"saySpriteChoices_3":function(d){return "Labas rytas"},
"saySpriteChoices_4":function(d){return "Laba diena"},
"saySpriteChoices_5":function(d){return "Labanakt"},
"saySpriteChoices_6":function(d){return "Labas vakaras"},
"saySpriteChoices_7":function(d){return "Kas naujo?"},
"saySpriteChoices_8":function(d){return "Ką?"},
"saySpriteChoices_9":function(d){return "Kur?"},
"saySpriteChoices_10":function(d){return "Kada?"},
"saySpriteChoices_11":function(d){return "Gerai."},
"saySpriteChoices_12":function(d){return "Puiku!"},
"saySpriteChoices_13":function(d){return "Gerai."},
"saySpriteChoices_14":function(d){return "Neblogai."},
"saySpriteChoices_15":function(d){return "Sėkmės."},
"saySpriteChoices_16":function(d){return "Taip"},
"saySpriteChoices_17":function(d){return "Ne"},
"saySpriteChoices_18":function(d){return "Gerai"},
"saySpriteChoices_19":function(d){return "Gražus metimas!"},
"saySpriteChoices_20":function(d){return "Geros dienos."},
"saySpriteChoices_21":function(d){return "Iki."},
"saySpriteChoices_22":function(d){return "Tuoj sugrįšiu."},
"saySpriteChoices_23":function(d){return "Iki rytojaus!"},
"saySpriteChoices_24":function(d){return "Iki pasimatymo!"},
"saySpriteChoices_25":function(d){return "Lik sveikas!"},
"saySpriteChoices_26":function(d){return "Mėgaukis!"},
"saySpriteChoices_27":function(d){return "Man reikia eiti."},
"saySpriteChoices_28":function(d){return "Nori būti draugais?"},
"saySpriteChoices_29":function(d){return "Puikiai atlikta!"},
"saySpriteChoices_30":function(d){return "Jėga!"},
"saySpriteChoices_31":function(d){return "Valio!"},
"saySpriteChoices_32":function(d){return "Malonu susipažinti."},
"saySpriteChoices_33":function(d){return "Gerai!"},
"saySpriteChoices_34":function(d){return "Ačiū"},
"saySpriteChoices_35":function(d){return "Ačiū, ne"},
"saySpriteChoices_36":function(d){return "Aaaaaa!"},
"saySpriteChoices_37":function(d){return "Nesvarbu"},
"saySpriteChoices_38":function(d){return "Šiandien"},
"saySpriteChoices_39":function(d){return "Rytoj"},
"saySpriteChoices_40":function(d){return "Vakar"},
"saySpriteChoices_41":function(d){return "Radau tave!"},
"saySpriteChoices_42":function(d){return "Tu mane radai!"},
"saySpriteChoices_43":function(d){return "10, 9, 8, 7, 6, 5, 4, 3, 2, 1!"},
"saySpriteChoices_44":function(d){return "Tu esi šaunus!"},
"saySpriteChoices_45":function(d){return "Tu esi juokingas!"},
"saySpriteChoices_46":function(d){return "Tu esi bukas! "},
"saySpriteChoices_47":function(d){return "Tu esi geras draugas!"},
"saySpriteChoices_48":function(d){return "Saugokis!"},
"saySpriteChoices_49":function(d){return "Tūpkis!"},
"saySpriteChoices_50":function(d){return "Pagavau!"},
"saySpriteChoices_51":function(d){return "Oi!"},
"saySpriteChoices_52":function(d){return "Atsiprašau!"},
"saySpriteChoices_53":function(d){return "Atsargiai!"},
"saySpriteChoices_54":function(d){return "Ojoi!"},
"saySpriteChoices_55":function(d){return "Ups!"},
"saySpriteChoices_56":function(d){return "Beveik pagavai mane!"},
"saySpriteChoices_57":function(d){return "Geras bandymas!"},
"saySpriteChoices_58":function(d){return "Nepagausi!"},
"scoreText":function(d){return "Rezultatas: "+studio_locale.v(d,"playerScore")},
"setActivityRandom":function(d){return "set activity to random for"},
"setActivityRoam":function(d){return "set activity to roam for"},
"setActivityChase":function(d){return "set activity to chase for"},
"setActivityFlee":function(d){return "set activity to flee for"},
"setActivityNone":function(d){return "set activity to none for"},
"setActivityTooltip":function(d){return "Sets the activity for a set of items"},
"setBackground":function(d){return "fonas = "},
"setBackgroundRandom":function(d){return "fonas = atsitiktinis"},
"setBackgroundBlack":function(d){return "fonas = juodas"},
"setBackgroundCave":function(d){return "fonas = urvas"},
"setBackgroundCloudy":function(d){return "fonas = debesys"},
"setBackgroundHardcourt":function(d){return "fonas = aikštė"},
"setBackgroundNight":function(d){return "fonas = naktis"},
"setBackgroundUnderwater":function(d){return "fonas = po vandeniu"},
"setBackgroundCity":function(d){return "fonas = miestas"},
"setBackgroundDesert":function(d){return "fonas = dykuma"},
"setBackgroundRainbow":function(d){return "fonas = vaivorykštė"},
"setBackgroundSoccer":function(d){return "fonas = futbolas"},
"setBackgroundSpace":function(d){return "fonas = kosmosas"},
"setBackgroundTennis":function(d){return "fonas = tenisas"},
"setBackgroundWinter":function(d){return "fonas = žiema"},
"setBackgroundLeafy":function(d){return "nustatyti lapuotą foną"},
"setBackgroundGrassy":function(d){return "nustatyti žolėtą foną"},
"setBackgroundFlower":function(d){return "nustatyti gėlėtą foną"},
"setBackgroundTile":function(d){return "nustatyti languotą foną"},
"setBackgroundIcy":function(d){return "nustatyti ledinį foną"},
"setBackgroundSnowy":function(d){return "nustatyti snieguotą foną"},
"setBackgroundForest":function(d){return "set forest background"},
"setBackgroundSnow":function(d){return "set snow background"},
"setBackgroundShip":function(d){return "set ship background"},
"setBackgroundTooltip":function(d){return "Nustato fono paveikslėlį"},
"setEnemySpeed":function(d){return "priešo greitis = "},
"setItemSpeedSet":function(d){return "set type"},
"setItemSpeedTooltip":function(d){return "Sets the speed for a set of items"},
"setPlayerSpeed":function(d){return "mano greitis = "},
"setScoreText":function(d){return "taškai ="},
"setScoreTextTooltip":function(d){return "Kokį tekstą rodyti šalia taškų."},
"setSpriteEmotionAngry":function(d){return "nuotaika = pikta"},
"setSpriteEmotionHappy":function(d){return "nuotaika = laiminga"},
"setSpriteEmotionNormal":function(d){return "nuotaika = normali"},
"setSpriteEmotionRandom":function(d){return "nuotaika = atsitiktinė"},
"setSpriteEmotionSad":function(d){return "nuotaika = liūdna"},
"setSpriteEmotionTooltip":function(d){return "Nustato veikėjo nuotaiką"},
"setSpriteAlien":function(d){return "išvaizda = ufonautas"},
"setSpriteBat":function(d){return "išvaizda = šikšnosparnis"},
"setSpriteBird":function(d){return "išvaizda = paukštis"},
"setSpriteCat":function(d){return "išvaizda = katė"},
"setSpriteCaveBoy":function(d){return "išvaizda = urvinis jaunuolis"},
"setSpriteCaveGirl":function(d){return "išvaizda = urvinė mergina"},
"setSpriteDinosaur":function(d){return "išvaizda = dinozauras"},
"setSpriteDog":function(d){return "išvaizda = šuo"},
"setSpriteDragon":function(d){return "išvaizda = drakonas"},
"setSpriteGhost":function(d){return "išvaizda = vaiduoklis"},
"setSpriteHidden":function(d){return "išvaizda = nematomas"},
"setSpriteHideK1":function(d){return "pa(si)slėpk"},
"setSpriteAnna":function(d){return "nuotrauka = Anna"},
"setSpriteElsa":function(d){return "nuotrauka = Elsa"},
"setSpriteHiro":function(d){return "Hiro vaizdą"},
"setSpriteBaymax":function(d){return "Baymax vaizdą"},
"setSpriteRapunzel":function(d){return "Rapunzel vaizdą"},
"setSpriteKnight":function(d){return "išvaizda = riteris"},
"setSpriteMonster":function(d){return "išvaizda = pabaisa"},
"setSpriteNinja":function(d){return "išvaizda = ninzė"},
"setSpriteOctopus":function(d){return "išvaizda = aštunkojis"},
"setSpritePenguin":function(d){return "išvaizda = pingvinas"},
"setSpritePirate":function(d){return "išvaizda = piratas"},
"setSpritePrincess":function(d){return "išvaizda = princesė"},
"setSpriteRandom":function(d){return "išvaizda = atsitiktinė"},
"setSpriteRobot":function(d){return "išvaizda = robotas"},
"setSpriteShowK1":function(d){return "parodyk"},
"setSpriteSpacebot":function(d){return "išvaizda = kosminis laivas"},
"setSpriteSoccerGirl":function(d){return "išvaizda = futbolininkė"},
"setSpriteSoccerBoy":function(d){return "išvaizda = futbolininkas"},
"setSpriteSquirrel":function(d){return "išvaizda = voverė"},
"setSpriteTennisGirl":function(d){return "išvaizda = tenisininkė"},
"setSpriteTennisBoy":function(d){return "išvaizda = tenisininkas"},
"setSpriteUnicorn":function(d){return "išvaizda = vienaragis"},
"setSpriteWitch":function(d){return "išvaizda = ragana"},
"setSpriteWizard":function(d){return "išvaizda = žynys"},
"setSpritePositionTooltip":function(d){return "Iškart perkelia veikėją į nurodytą vietą."},
"setSpriteK1Tooltip":function(d){return "Paslėpia/parodo veikėją."},
"setSpriteTooltip":function(d){return "Nustato veikėjo išvaizdą"},
"setSpriteSizeRandom":function(d){return "dydis = atsitiktinis"},
"setSpriteSizeVerySmall":function(d){return "dydis = labai mažas"},
"setSpriteSizeSmall":function(d){return "dydis = mažas"},
"setSpriteSizeNormal":function(d){return "dydis = normalus"},
"setSpriteSizeLarge":function(d){return "dydis = didelis"},
"setSpriteSizeVeryLarge":function(d){return "dydis = labai didelis"},
"setSpriteSizeTooltip":function(d){return "Nustato veikėjo dydį."},
"setSpriteSpeedRandom":function(d){return "greitis = atsitiktinis"},
"setSpriteSpeedVerySlow":function(d){return "greitis = labai lėtas"},
"setSpriteSpeedSlow":function(d){return "greitis = lėtas"},
"setSpriteSpeedNormal":function(d){return "greitis = normalus"},
"setSpriteSpeedFast":function(d){return "greitis = didelis"},
"setSpriteSpeedVeryFast":function(d){return "greitis = labai didelis"},
"setSpriteSpeedTooltip":function(d){return "Nustato veikėjo greitį"},
"setSpriteZombie":function(d){return "išvaizda = zombis"},
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
"shareStudioTwitter":function(d){return "Pažiūrėk, kokią istoriją sukūriau. Ją parašiau pats su @codeorg"},
"shareGame":function(d){return "Pasidalink savo istorija:"},
"showCoordinates":function(d){return "rodyti koordinates"},
"showCoordinatesTooltip":function(d){return "rodyti \"geriečio\" koordinates ekrane"},
"showTitleScreen":function(d){return "parodyk ekrano pavadinimą"},
"showTitleScreenTitle":function(d){return "pavadinimas"},
"showTitleScreenText":function(d){return "tekstas"},
"showTSDefTitle":function(d){return "įrašykite pavadinimą"},
"showTSDefText":function(d){return "įrašykite tekstą"},
"showTitleScreenTooltip":function(d){return "Parodyti pradinį ekraną su pavadinimu ir tekstu."},
"size":function(d){return "dydis"},
"setSprite":function(d){return " "},
"setSpriteN":function(d){return "veikėjas "+studio_locale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "trakšt"},
"soundGoal1":function(d){return "įvartis 1"},
"soundGoal2":function(d){return "įvartis 2"},
"soundHit":function(d){return "atsimušimas"},
"soundLosePoint":function(d){return "taško praradimas 1"},
"soundLosePoint2":function(d){return "taško praradimas 2"},
"soundRetro":function(d){return "retro"},
"soundRubber":function(d){return "guma"},
"soundSlap":function(d){return "pliaukšt"},
"soundWinPoint":function(d){return "taško laimėjimas 1"},
"soundWinPoint2":function(d){return "taško laimėjimas 2"},
"soundWood":function(d){return "mediena"},
"speed":function(d){return "greitis"},
"startSetValue":function(d){return "pradėti (funkciją)"},
"startSetVars":function(d){return "game_vars (title, subtitle, background, target, danger, player)"},
"startSetFuncs":function(d){return "game_funcs (update-target, update-danger, update-player, collide?, on-screen?)"},
"stopSprite":function(d){return "sustok"},
"stopSpriteN":function(d){return "sustabdyk veikėją "+studio_locale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Sustabdo veikėją."},
"throwSprite":function(d){return "mesk"},
"throwSpriteN":function(d){return "veikėjau "+studio_locale.v(d,"spriteIndex")+" mesk"},
"throwTooltip":function(d){return "Nurodytas veikėjas išmeta objektą (pvz, ugnies kamuolį)."},
"vanish":function(d){return "išnyk"},
"vanishActorN":function(d){return "panaikink veikėją "+studio_locale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "Pašalina veikėją"},
"waitFor":function(d){return "palauk "},
"waitSeconds":function(d){return "sekundes"},
"waitForClick":function(d){return "lauk paspaudimo"},
"waitForRandom":function(d){return "lauk atsitiktinį laiką"},
"waitForHalfSecond":function(d){return "lauk pusę sekundės"},
"waitFor1Second":function(d){return "lauk 1 sekundę"},
"waitFor2Seconds":function(d){return "lauk 2 sekundes"},
"waitFor5Seconds":function(d){return "lauk 5 sekundes"},
"waitFor10Seconds":function(d){return "lauk 10 sekundžių"},
"waitParamsTooltip":function(d){return "Palaukia nurodytą kiekį sekundžių. O jei nurodyta 0 -  kol bus spustelta pele."},
"waitTooltip":function(d){return "Palaukia, kol praeis nurodytas laikas arba kai įvyks mygtuko paspaudimas."},
"whenArrowDown":function(d){return "rodyklė į apačią"},
"whenArrowLeft":function(d){return "rodyklė į kairę"},
"whenArrowRight":function(d){return "rodyklė į dešinę"},
"whenArrowUp":function(d){return "rodyklė į viršų"},
"whenArrowTooltip":function(d){return "Įvykdys nurodytus veiksmus, kai atitinkama rodyklė bus paspausta."},
"whenDown":function(d){return "kai rodyklė žemyn"},
"whenDownTooltip":function(d){return "Įvykdyk žemiau nurodytus veiksmus, kai bus nuspaustas klaviatūros klavišas rodyklė žemyn."},
"whenGameStarts":function(d){return "kai istorija prasideda"},
"whenGameStartsTooltip":function(d){return "Įvykdyk žemiau nurodytus veiksmus, kai istorija prasidės."},
"whenLeft":function(d){return "kai rodyklė į kairę"},
"whenLeftTooltip":function(d){return "Įvykdyk žemiau nurodytus veiksmus, kai bus nuspaustas klaviatūros klavišas rodyklė į kairę."},
"whenRight":function(d){return "kai rodyklė į dešinę"},
"whenRightTooltip":function(d){return "Įvykdyk žemiau nurodytus veiksmus, kai bus nuspaustas klaviatūros klavišas rodyklė dešinėn."},
"whenSpriteClicked":function(d){return "kai veikėjas spustelimas"},
"whenSpriteClickedN":function(d){return "kai veikėjas "+studio_locale.v(d,"spriteIndex")+" spustelimas"},
"whenSpriteClickedTooltip":function(d){return "Vykdyti veiksmus,  kai bus spustelta ant veikėjo."},
"whenSpriteCollidedN":function(d){return "kai veikėjas "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "Vykdyti nurodytus veiksmus, kai veikėjas paliečia kitą veikėją."},
"whenSpriteCollidedWith":function(d){return "paliečia"},
"whenSpriteCollidedWithAnyActor":function(d){return "paliečia bet kurį aktorių"},
"whenSpriteCollidedWithAnyEdge":function(d){return "paliečia bet kurį kraštą"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "paliečia bet kurį sviedinį"},
"whenSpriteCollidedWithAnything":function(d){return "paliečia bet ką"},
"whenSpriteCollidedWithN":function(d){return "paliečia veikėją "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "paliečia mėlyną ugnies kamuolį"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "paliečia violetinį ugnies kamuolį"},
"whenSpriteCollidedWithRedFireball":function(d){return "paliečia raudoną ugnies kamuolį"},
"whenSpriteCollidedWithYellowHearts":function(d){return "paliečia geltonas širdutes"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "paliečia violetines širdutes"},
"whenSpriteCollidedWithRedHearts":function(d){return "paliečia raudonas širdutes"},
"whenSpriteCollidedWithBottomEdge":function(d){return "paliečia scenos apačią"},
"whenSpriteCollidedWithLeftEdge":function(d){return "paliečia scenos kairį šoną"},
"whenSpriteCollidedWithRightEdge":function(d){return "paliečia scenos dešinį šoną"},
"whenSpriteCollidedWithTopEdge":function(d){return "paliečia scenos viršų"},
"whenTouchItem":function(d){return "when item touched"},
"whenTouchItemTooltip":function(d){return "Execute the actions below when the actor touches an item."},
"whenTouchWall":function(d){return "when wall touched"},
"whenTouchWallTooltip":function(d){return "Execute the actions below when the actor touches a wall."},
"whenUp":function(d){return "kai rodyklė aukštyn"},
"whenUpTooltip":function(d){return "Įvykdyk žemiau nurodytus veiksmus, kai bus nuspaustas klaviatūros klavišas rodyklė aukštyn."},
"yes":function(d){return "Taip"},
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