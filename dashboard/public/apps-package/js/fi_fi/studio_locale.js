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
"actor":function(d){return "hahmo"},
"addCharacter":function(d){return "add a"},
"addCharacterTooltip":function(d){return "Add a character to the scene."},
"alienInvasion":function(d){return "Avaruusolioiden hyökkäys!"},
"backgroundBlack":function(d){return "musta"},
"backgroundCave":function(d){return "luola"},
"backgroundCloudy":function(d){return "pilvinen"},
"backgroundHardcourt":function(d){return "massakenttä"},
"backgroundNight":function(d){return "yö"},
"backgroundUnderwater":function(d){return "vedenalainen"},
"backgroundCity":function(d){return "kaupunki"},
"backgroundDesert":function(d){return "aavikko"},
"backgroundRainbow":function(d){return "sateenkaari"},
"backgroundSoccer":function(d){return "Jalkapallo"},
"backgroundSpace":function(d){return "avaruus"},
"backgroundTennis":function(d){return "tennis"},
"backgroundWinter":function(d){return "talvi"},
"catActions":function(d){return "Toiminnot"},
"catControl":function(d){return "Silmukat"},
"catEvents":function(d){return "Tapahtumat"},
"catLogic":function(d){return "Logiikka"},
"catMath":function(d){return "Matematiikka"},
"catProcedures":function(d){return "Funktiot"},
"catText":function(d){return "teksti"},
"catVariables":function(d){return "Muuttujat"},
"changeScoreTooltip":function(d){return "Lisää tai poista piste pistemäärästä."},
"changeScoreTooltipK1":function(d){return "Lisää piste pistemäärään."},
"continue":function(d){return "Jatka"},
"decrementPlayerScore":function(d){return "poista piste"},
"defaultSayText":function(d){return "kirjoita tähän"},
"dropletBlock_addCharacter_description":function(d){return "Add a character to the scene."},
"dropletBlock_addCharacter_param0":function(d){return "type"},
"dropletBlock_addCharacter_param0_description":function(d){return "The type of the character to be added ('random', 'man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_changeScore_description":function(d){return "Lisää tai poista piste pistemäärästä."},
"dropletBlock_changeScore_param0":function(d){return "pisteet"},
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
"dropletBlock_playSound_description":function(d){return "Soita valittu ääni."},
"dropletBlock_playSound_param0":function(d){return "sound"},
"dropletBlock_playSound_param0_description":function(d){return "The name of the sound to play."},
"dropletBlock_setBackground_description":function(d){return "Aseta taustakuva"},
"dropletBlock_setBackground_param0":function(d){return "image"},
"dropletBlock_setBackground_param0_description":function(d){return "The name of the background theme ('background1', 'background2', or 'background3')."},
"dropletBlock_setBot_description":function(d){return "Changes the active bot."},
"dropletBlock_setBot_param0":function(d){return "image"},
"dropletBlock_setBot_param0_description":function(d){return "The name of the bot image ('random', 'bot1', or 'bot2')."},
"dropletBlock_setBotSpeed_description":function(d){return "Sets the bot speed."},
"dropletBlock_setBotSpeed_param0":function(d){return "nopeus"},
"dropletBlock_setBotSpeed_param0_description":function(d){return "The speed value ('random', 'slow', 'normal', or 'fast')."},
"dropletBlock_setSpriteEmotion_description":function(d){return "Asettaa hahmon mielialan"},
"dropletBlock_setSpritePosition_description":function(d){return "Siirtää hahmon heti määriteltyyn kohtaan."},
"dropletBlock_setSpriteSpeed_description":function(d){return "Asettaa hahmon nopeuden"},
"dropletBlock_setSprite_description":function(d){return "Asettaa hahmon kuvan"},
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
"dropletBlock_throw_description":function(d){return "Heittää ammuksen kohti määriteltyä hahmoa."},
"dropletBlock_vanish_description":function(d){return "Kadottaa hahmon."},
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
"emotion":function(d){return "mieliala"},
"finalLevel":function(d){return "Onneksi olkoon! Olet suorittanut viimeisen pulman."},
"for":function(d){return "koska"},
"hello":function(d){return "hei"},
"helloWorld":function(d){return "Hei maailma!"},
"incrementPlayerScore":function(d){return "lisää piste"},
"itemBlueFireball":function(d){return "sininen tulipallo"},
"itemPurpleFireball":function(d){return "violetti tulipallo"},
"itemRedFireball":function(d){return "punainen tulipallo"},
"itemYellowHearts":function(d){return "keltaiset sydämet"},
"itemPurpleHearts":function(d){return "violetit sydämet"},
"itemRedHearts":function(d){return "punaiset sydämet"},
"itemRandom":function(d){return "satunnainen"},
"itemAnna":function(d){return "koukku"},
"itemElsa":function(d){return "kimallus"},
"itemHiro":function(d){return "microbotit"},
"itemBaymax":function(d){return "raketti"},
"itemRapunzel":function(d){return "kattila"},
"itemCherry":function(d){return "kirsikka"},
"itemIce":function(d){return "jää"},
"itemDuck":function(d){return "ankka"},
"itemMan":function(d){return "man"},
"itemPilot":function(d){return "pilot"},
"itemPig":function(d){return "pig"},
"itemBird":function(d){return "bird"},
"itemMouse":function(d){return "mouse"},
"itemRoo":function(d){return "roo"},
"itemSpider":function(d){return "spider"},
"makeProjectileDisappear":function(d){return "katoamaan"},
"makeProjectileBounce":function(d){return "kimpoamaan"},
"makeProjectileBlueFireball":function(d){return "laita sininen tulipallo"},
"makeProjectilePurpleFireball":function(d){return "laita violetti tulipallo"},
"makeProjectileRedFireball":function(d){return "laita punainen tulipallo"},
"makeProjectileYellowHearts":function(d){return "laita keltaiset sydämet"},
"makeProjectilePurpleHearts":function(d){return "laita violetit sydämet"},
"makeProjectileRedHearts":function(d){return "laita punaiset sydämet"},
"makeProjectileTooltip":function(d){return "Laita juuri törmännyt ammus katoamaan tai kimpoamaan."},
"makeYourOwn":function(d){return "Tee oma Play Lab -sovelluksesi"},
"moveDirectionDown":function(d){return "alas"},
"moveDirectionLeft":function(d){return "vasemmalle"},
"moveDirectionRight":function(d){return "oikealle"},
"moveDirectionUp":function(d){return "ylös"},
"moveDirectionRandom":function(d){return "satunnainen"},
"moveDistance25":function(d){return "25 kuvapistettä"},
"moveDistance50":function(d){return "50 kuvapistettä"},
"moveDistance100":function(d){return "100 kuvapistettä"},
"moveDistance200":function(d){return "200 kuvapistettä"},
"moveDistance400":function(d){return "400 kuvapistettä"},
"moveDistancePixels":function(d){return "kuvapistettä"},
"moveDistanceRandom":function(d){return "satunnainen määrä kuvapisteitä"},
"moveDistanceTooltip":function(d){return "Liikuta hahmoa annettu määrä määrättyyn suuntaan."},
"moveSprite":function(d){return "liikuta"},
"moveSpriteN":function(d){return "liikuta hahmoa "+studio_locale.v(d,"spriteIndex")},
"toXY":function(d){return "x,y pisteisiin"},
"moveDown":function(d){return "siirrä alas"},
"moveDownTooltip":function(d){return "Liikuta hahmoa alas."},
"moveLeft":function(d){return "siirrä vasemmalle"},
"moveLeftTooltip":function(d){return "Liikuta hahmoa vasemmalle."},
"moveRight":function(d){return "siirrä oikealle"},
"moveRightTooltip":function(d){return "Liikuta hahmoa oikealle."},
"moveUp":function(d){return "siirrä ylös"},
"moveUpTooltip":function(d){return "Liikuta hahmoa ylös."},
"moveTooltip":function(d){return "Liikuta hahmoa."},
"nextLevel":function(d){return "Onneksi olkoon! Olet suorittanut tämän pulman."},
"no":function(d){return "Ei"},
"numBlocksNeeded":function(d){return "Pulman voi ratkaista %1 lohkolla."},
"onEventTooltip":function(d){return "Suorita koodia vasteena määritettyyn tapahtumaan."},
"ouchExclamation":function(d){return "Auts!"},
"playSoundCrunch":function(d){return "soita räsähdyksen ääni"},
"playSoundGoal1":function(d){return "soita maalin ääni"},
"playSoundGoal2":function(d){return "soita maalin toinen ääni"},
"playSoundHit":function(d){return "soita osuman ääni"},
"playSoundLosePoint":function(d){return "soita pisteen menetyksen ääni"},
"playSoundLosePoint2":function(d){return "soita pisteen menetyksen toinen ääni"},
"playSoundRetro":function(d){return "soita retro ääni"},
"playSoundRubber":function(d){return "soita kumin ääni"},
"playSoundSlap":function(d){return "soita läpsähdyksen ääni"},
"playSoundTooltip":function(d){return "Soita valittu ääni."},
"playSoundWinPoint":function(d){return "soita pisteen voittamisen ääni"},
"playSoundWinPoint2":function(d){return "soita pisteen voittamisen toinen ääni"},
"playSoundWood":function(d){return "soita puinen ääni"},
"positionOutTopLeft":function(d){return "vasemman yläkulman yläpuolelle"},
"positionOutTopRight":function(d){return "oikean yläkulman yläpuolelle"},
"positionTopOutLeft":function(d){return "yläreunaan, vasemman reunan ulkopuolelle"},
"positionTopLeft":function(d){return "vasempaan yläkulmaan"},
"positionTopCenter":function(d){return "yläreunan keskelle"},
"positionTopRight":function(d){return "oikeaan yläreunaan"},
"positionTopOutRight":function(d){return "yläreunaan, oikean reunan ulkopuolelle"},
"positionMiddleLeft":function(d){return "keskelle vasempaan reunaan"},
"positionMiddleCenter":function(d){return "keskelle keskitetysti"},
"positionMiddleRight":function(d){return "keskelle oikeaan reunaan"},
"positionBottomOutLeft":function(d){return "alareunaan, vasemman reunan ulkopuolelle"},
"positionBottomLeft":function(d){return "vasempaan alakulmaan"},
"positionBottomCenter":function(d){return "keskelle alareunaa"},
"positionBottomRight":function(d){return "oikeaan alakulmaan"},
"positionBottomOutRight":function(d){return "alareunaan, oikean reunan ulkopuolelle"},
"positionOutBottomLeft":function(d){return "vasempaan alakulmaan, alareunan alapuolelle"},
"positionOutBottomRight":function(d){return "oikeaan alakulmaan, alareunan alapuolelle"},
"positionRandom":function(d){return "satunnaiseen sijaintiin"},
"projectileBlueFireball":function(d){return "sininen tulipallo"},
"projectilePurpleFireball":function(d){return "violetti tulipallo"},
"projectileRedFireball":function(d){return "punainen tulipallo"},
"projectileYellowHearts":function(d){return "keltaiset sydämet"},
"projectilePurpleHearts":function(d){return "violetit sydämet"},
"projectileRedHearts":function(d){return "punaiset sydämet"},
"projectileRandom":function(d){return "satunnainen"},
"projectileAnna":function(d){return "koukku"},
"projectileElsa":function(d){return "kimallus"},
"projectileHiro":function(d){return "microbotit"},
"projectileBaymax":function(d){return "raketti"},
"projectileRapunzel":function(d){return "kattila"},
"projectileCherry":function(d){return "kirsikka"},
"projectileIce":function(d){return "jää"},
"projectileDuck":function(d){return "ankka"},
"reinfFeedbackMsg":function(d){return "Voit painaa \"Jatka Pelaamista\" nappia jos haluat jatkaa tarinasi pelaamista."},
"repeatForever":function(d){return "toista jatkuvasti"},
"repeatDo":function(d){return "tee"},
"repeatForeverTooltip":function(d){return "Toista lohkon toiminnot toistuvastu niin kauan kuin tarina on käynnissä."},
"saySprite":function(d){return "sano"},
"saySpriteN":function(d){return "hahmo "+studio_locale.v(d,"spriteIndex")+" sanoo"},
"saySpriteTooltip":function(d){return "Näytä hahmolle puhekupla, jossa oheinen teksti."},
"saySpriteChoices_0":function(d){return "Moikka."},
"saySpriteChoices_1":function(d){return "Hei kaikille."},
"saySpriteChoices_2":function(d){return "Mitenkäs olet pärjäillyt?"},
"saySpriteChoices_3":function(d){return "Hyvää huomenta"},
"saySpriteChoices_4":function(d){return "Hyvää iltapäivää"},
"saySpriteChoices_5":function(d){return "Hyvää yötä"},
"saySpriteChoices_6":function(d){return "Hyvää iltaa"},
"saySpriteChoices_7":function(d){return "Mitä uutta?"},
"saySpriteChoices_8":function(d){return "Mikä?"},
"saySpriteChoices_9":function(d){return "Missä?"},
"saySpriteChoices_10":function(d){return "Milloin?"},
"saySpriteChoices_11":function(d){return "Hyvä."},
"saySpriteChoices_12":function(d){return "Upea!"},
"saySpriteChoices_13":function(d){return "Kaikki hyvin."},
"saySpriteChoices_14":function(d){return "Ei hassumpaa."},
"saySpriteChoices_15":function(d){return "Lykkyä tykö."},
"saySpriteChoices_16":function(d){return "Kyllä"},
"saySpriteChoices_17":function(d){return "Ei"},
"saySpriteChoices_18":function(d){return "Okei"},
"saySpriteChoices_19":function(d){return "Hyvä heitto!"},
"saySpriteChoices_20":function(d){return "Hyvää päivänjatkoa."},
"saySpriteChoices_21":function(d){return "Heippa."},
"saySpriteChoices_22":function(d){return "Tulen takaisin."},
"saySpriteChoices_23":function(d){return "Nähdään huomenna!"},
"saySpriteChoices_24":function(d){return "Nähdään taas!"},
"saySpriteChoices_25":function(d){return "Voi hyvin!"},
"saySpriteChoices_26":function(d){return "Nauti!"},
"saySpriteChoices_27":function(d){return "Minun on mentävä."},
"saySpriteChoices_28":function(d){return "Haluavat olla ystäviä?"},
"saySpriteChoices_29":function(d){return "Hyvää työtä!"},
"saySpriteChoices_30":function(d){return "Jihuu!"},
"saySpriteChoices_31":function(d){return "Jes!"},
"saySpriteChoices_32":function(d){return "Hauska tutustua."},
"saySpriteChoices_33":function(d){return "Kaikki hyvin!"},
"saySpriteChoices_34":function(d){return "Kiitos"},
"saySpriteChoices_35":function(d){return "Ei kiitos"},
"saySpriteChoices_36":function(d){return "Aaaaaah!"},
"saySpriteChoices_37":function(d){return "Antaa olla"},
"saySpriteChoices_38":function(d){return "Tänään"},
"saySpriteChoices_39":function(d){return "Huomenna"},
"saySpriteChoices_40":function(d){return "Eilen"},
"saySpriteChoices_41":function(d){return "Löysin sinut!"},
"saySpriteChoices_42":function(d){return "Olet löytänyt minut!"},
"saySpriteChoices_43":function(d){return "10, 9, 8, 7, 6, 5, 4, 3, 2, 1!"},
"saySpriteChoices_44":function(d){return "Olet loistava!"},
"saySpriteChoices_45":function(d){return "Olet hassu!"},
"saySpriteChoices_46":function(d){return "Olet typerä! "},
"saySpriteChoices_47":function(d){return "Olet hyvä ystävä!"},
"saySpriteChoices_48":function(d){return "Varo!"},
"saySpriteChoices_49":function(d){return "Kumarru!"},
"saySpriteChoices_50":function(d){return "Sainpas!"},
"saySpriteChoices_51":function(d){return "Au!"},
"saySpriteChoices_52":function(d){return "Pahoittelut!"},
"saySpriteChoices_53":function(d){return "Varovasti!"},
"saySpriteChoices_54":function(d){return "Oho!"},
"saySpriteChoices_55":function(d){return "Hupsis!"},
"saySpriteChoices_56":function(d){return "Melkein sait minut!"},
"saySpriteChoices_57":function(d){return "Hyvä yritys!"},
"saySpriteChoices_58":function(d){return "Etpä saa kiinni!"},
"scoreText":function(d){return "Pisteet: "+studio_locale.v(d,"playerScore")},
"setActivityRandom":function(d){return "set activity to random for"},
"setActivityRoam":function(d){return "set activity to roam for"},
"setActivityChase":function(d){return "set activity to chase for"},
"setActivityFlee":function(d){return "set activity to flee for"},
"setActivityNone":function(d){return "set activity to none for"},
"setActivityTooltip":function(d){return "Sets the activity for a set of items"},
"setBackground":function(d){return "aseta tausta"},
"setBackgroundRandom":function(d){return "aseta satunnainen tausta"},
"setBackgroundBlack":function(d){return "aseta musta tausta"},
"setBackgroundCave":function(d){return "aseta luolatausta"},
"setBackgroundCloudy":function(d){return "aseta pilvinen tausta"},
"setBackgroundHardcourt":function(d){return "aseta tenniskenttätausta"},
"setBackgroundNight":function(d){return "aseta yötausta"},
"setBackgroundUnderwater":function(d){return "aseta vedenalainen tausta"},
"setBackgroundCity":function(d){return "aseta kaupunkitausta"},
"setBackgroundDesert":function(d){return "aseta autiomaatausta"},
"setBackgroundRainbow":function(d){return "aseta sateenkaaritausta"},
"setBackgroundSoccer":function(d){return "aseta jalkapallotausta"},
"setBackgroundSpace":function(d){return "aseta avaruustausta"},
"setBackgroundTennis":function(d){return "aseta tennistausta"},
"setBackgroundWinter":function(d){return "aseta talvitausta"},
"setBackgroundLeafy":function(d){return "aseta lehtevä tausta"},
"setBackgroundGrassy":function(d){return "aseta ruohoinen tausta"},
"setBackgroundFlower":function(d){return "Aseta kukkainen tausta"},
"setBackgroundTile":function(d){return "aseta laatta tausta"},
"setBackgroundIcy":function(d){return "aseta jäinen tausta"},
"setBackgroundSnowy":function(d){return "aseta luminen tausta"},
"setBackgroundForest":function(d){return "set forest background"},
"setBackgroundSnow":function(d){return "set snow background"},
"setBackgroundShip":function(d){return "set ship background"},
"setBackgroundTooltip":function(d){return "Aseta taustakuva"},
"setEnemySpeed":function(d){return "aseta vihollisen nopeus"},
"setItemSpeedSet":function(d){return "set type"},
"setItemSpeedTooltip":function(d){return "Sets the speed for a set of items"},
"setPlayerSpeed":function(d){return "aseta pelaajan nopeus"},
"setScoreText":function(d){return "aseta pisteet"},
"setScoreTextTooltip":function(d){return "Asettaa tekstin näytettäväksi pistealueella."},
"setSpriteEmotionAngry":function(d){return "vihaiseen mielialaan"},
"setSpriteEmotionHappy":function(d){return "iloiseen mielialaan"},
"setSpriteEmotionNormal":function(d){return "normaaliin mielialaan"},
"setSpriteEmotionRandom":function(d){return "satunnaiseen mielialaan"},
"setSpriteEmotionSad":function(d){return "surulliseen mielialaan"},
"setSpriteEmotionTooltip":function(d){return "Asettaa hahmon mielialan"},
"setSpriteAlien":function(d){return "avaruusolion kuvaan"},
"setSpriteBat":function(d){return "lepakon kuvaan"},
"setSpriteBird":function(d){return "linnun kuvaan"},
"setSpriteCat":function(d){return "kissan kuvaan"},
"setSpriteCaveBoy":function(d){return "luolapojan kuvaan"},
"setSpriteCaveGirl":function(d){return "luolatytön kuvaan"},
"setSpriteDinosaur":function(d){return "dinosauruksen kuvaan"},
"setSpriteDog":function(d){return "koiran kuvaan"},
"setSpriteDragon":function(d){return "lohikäärmeen kuvaan"},
"setSpriteGhost":function(d){return "haamun kuvaan"},
"setSpriteHidden":function(d){return "piilotettuun kuvaan"},
"setSpriteHideK1":function(d){return "piilota"},
"setSpriteAnna":function(d){return "Annan kuvaan"},
"setSpriteElsa":function(d){return "Elsan kuvaan"},
"setSpriteHiro":function(d){return "Hiro-kuvaan"},
"setSpriteBaymax":function(d){return "Baymax-kuvaan"},
"setSpriteRapunzel":function(d){return "Rapunzel-kuvaan"},
"setSpriteKnight":function(d){return "ritarin kuvaan"},
"setSpriteMonster":function(d){return "hirviön kuvaan"},
"setSpriteNinja":function(d){return "naamioidun ninjan kuvaan"},
"setSpriteOctopus":function(d){return "mustekalan kuvaan"},
"setSpritePenguin":function(d){return "pingviinin kuvaan"},
"setSpritePirate":function(d){return "merirosvon kuvaan"},
"setSpritePrincess":function(d){return "prinsessan kuvaan"},
"setSpriteRandom":function(d){return "satunnaiseen kuvaan"},
"setSpriteRobot":function(d){return "robotin kuvaan"},
"setSpriteShowK1":function(d){return "näytä"},
"setSpriteSpacebot":function(d){return "avaruusrobotin kuvaan"},
"setSpriteSoccerGirl":function(d){return "jalkapallotytön kuvaan"},
"setSpriteSoccerBoy":function(d){return "jalkapallopojan kuvaan"},
"setSpriteSquirrel":function(d){return "oravan kuvaan"},
"setSpriteTennisGirl":function(d){return "tennistytön kuvaan"},
"setSpriteTennisBoy":function(d){return "tennispojan kuvaan"},
"setSpriteUnicorn":function(d){return "yksisarvisen kuvaan"},
"setSpriteWitch":function(d){return "noidan kuvaan"},
"setSpriteWizard":function(d){return "velhon kuvaan"},
"setSpritePositionTooltip":function(d){return "Siirtää hahmon heti määriteltyyn kohtaan."},
"setSpriteK1Tooltip":function(d){return "Näyttää tai piilottaa määritellyn hahmon."},
"setSpriteTooltip":function(d){return "Asettaa hahmon kuvan"},
"setSpriteSizeRandom":function(d){return "satunnaiseen kokoon"},
"setSpriteSizeVerySmall":function(d){return "hyvin pieneen kokoon"},
"setSpriteSizeSmall":function(d){return "pieneen kokoon"},
"setSpriteSizeNormal":function(d){return "normaaliin kokoon"},
"setSpriteSizeLarge":function(d){return "suureen kokoon"},
"setSpriteSizeVeryLarge":function(d){return "erittäin suureen kokoon"},
"setSpriteSizeTooltip":function(d){return "Asettaa hahmon koon"},
"setSpriteSpeedRandom":function(d){return "satunnaiseen nopeuteen"},
"setSpriteSpeedVerySlow":function(d){return "erittäin hitaaseen nopeuteen"},
"setSpriteSpeedSlow":function(d){return "hitaaseen nopeuteen"},
"setSpriteSpeedNormal":function(d){return "normaaliin nopeuteen"},
"setSpriteSpeedFast":function(d){return "nopeaan nopeuteen"},
"setSpriteSpeedVeryFast":function(d){return "erittäin nopeaan nopeuteen"},
"setSpriteSpeedTooltip":function(d){return "Asettaa hahmon nopeuden"},
"setSpriteZombie":function(d){return "zombin kuvaan"},
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
"shareStudioTwitter":function(d){return "Katso tekemääni tarinaa. Kirjoitin sen itse @codeorg:ssa"},
"shareGame":function(d){return "Jaa tarinasi:"},
"showCoordinates":function(d){return "näytä koordinaatit"},
"showCoordinatesTooltip":function(d){return "näyttää päähenkilön koordinaatit ruudulla"},
"showTitleScreen":function(d){return "näytä otsikkonäyttö"},
"showTitleScreenTitle":function(d){return "otsikko"},
"showTitleScreenText":function(d){return "teksti"},
"showTSDefTitle":function(d){return "kirjoita otsikko tähän"},
"showTSDefText":function(d){return "kirjoita tekstiä tähän"},
"showTitleScreenTooltip":function(d){return "Näytä otsikkosivu liitetyllä otsikolla ja tekstillä."},
"size":function(d){return "koko"},
"setSprite":function(d){return "aseta"},
"setSpriteN":function(d){return "aseta hahmo "+studio_locale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "murskaa"},
"soundGoal1":function(d){return "tavoite 1"},
"soundGoal2":function(d){return "tavoite 2"},
"soundHit":function(d){return "osuma"},
"soundLosePoint":function(d){return "pisteen menetys"},
"soundLosePoint2":function(d){return "pisteen menetys 2"},
"soundRetro":function(d){return "retro"},
"soundRubber":function(d){return "kumi"},
"soundSlap":function(d){return "läpsäytys"},
"soundWinPoint":function(d){return "voittopiste"},
"soundWinPoint2":function(d){return "voittopiste 2"},
"soundWood":function(d){return "puu"},
"speed":function(d){return "nopeus"},
"startSetValue":function(d){return "Käynnistä (funktio)"},
"startSetVars":function(d){return "game_vars (otsikko, alaotsikko, tausta, tavoite, vaara, pelaaja)"},
"startSetFuncs":function(d){return "game_funcs (päivitä-kohde, päivitä-vaara, päivitä-pelaaja, törmää?, näytöllä?)"},
"stopSprite":function(d){return "pysähdy"},
"stopSpriteN":function(d){return "pysäytä hahmo "+studio_locale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Pysäyttää hahmon liikkeen."},
"throwSprite":function(d){return "heitä"},
"throwSpriteN":function(d){return "hahmo "+studio_locale.v(d,"spriteIndex")+" heitä"},
"throwTooltip":function(d){return "Heittää ammuksen kohti määriteltyä hahmoa."},
"vanish":function(d){return "kadota"},
"vanishActorN":function(d){return "kadota hahmo "+studio_locale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "Kadottaa hahmon."},
"waitFor":function(d){return "odota kunnes"},
"waitSeconds":function(d){return "sekuntia"},
"waitForClick":function(d){return "odota klikkausta"},
"waitForRandom":function(d){return "odota kunnes satunnainen"},
"waitForHalfSecond":function(d){return "odota kunnes ½ sekuntia on kulunut"},
"waitFor1Second":function(d){return "odota kunnes 1 sekunti on kulunut"},
"waitFor2Seconds":function(d){return "odota kunnes 2 sekuntia on kulunut"},
"waitFor5Seconds":function(d){return "odota kunnes 5 sekuntia on kulunut"},
"waitFor10Seconds":function(d){return "odota kunnes 10 sekuntia on kulunut"},
"waitParamsTooltip":function(d){return "Odota määritelty aika sekunteina tai käytä nollaa odottamaan kunnes napsautus tapahtuu."},
"waitTooltip":function(d){return "Odota määritelty aika tai kunnes napsautus tapahtuu."},
"whenArrowDown":function(d){return "nuoli alas"},
"whenArrowLeft":function(d){return "nuoli vasemmalle"},
"whenArrowRight":function(d){return "nuoli oikealle"},
"whenArrowUp":function(d){return "nuoli ylös"},
"whenArrowTooltip":function(d){return "Tee seuraavat toimet kun määriteltyä nuolinäppäintä painetaan."},
"whenDown":function(d){return "kun nuoli alas"},
"whenDownTooltip":function(d){return "Suorita alla olevat toiminnot, kun alas-nuolinäppäintä painetaan."},
"whenGameStarts":function(d){return "tarinan alkaessa"},
"whenGameStartsTooltip":function(d){return "Tee seuraavat toimet kun tarina alkaa."},
"whenLeft":function(d){return "kun nuoli vasemmalle"},
"whenLeftTooltip":function(d){return "Suorita alla olevat toiminnot, kun vasenta nuolinäppäintä painetaan."},
"whenRight":function(d){return "kun nuoli oikealle"},
"whenRightTooltip":function(d){return "Suorita alla olevat toiminnot, kun oikeaa nuolinäppäintä painetaan."},
"whenSpriteClicked":function(d){return "Kun hahmoa napsautetaan"},
"whenSpriteClickedN":function(d){return "kun hahmoa "+studio_locale.v(d,"spriteIndex")+" napsautetaan"},
"whenSpriteClickedTooltip":function(d){return "Tee seuraavat toimet kun hahmoa napsautetaan."},
"whenSpriteCollidedN":function(d){return "kun hahmo "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "Tee seuraavat toimet kun hahmo koskee toista hahmoa."},
"whenSpriteCollidedWith":function(d){return "koskee"},
"whenSpriteCollidedWithAnyActor":function(d){return "koskee mitä tahansa hahmoa"},
"whenSpriteCollidedWithAnyEdge":function(d){return "koskee mitä tahansa reunaa"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "koskee mitä tahansa ammusta"},
"whenSpriteCollidedWithAnything":function(d){return "koskee mitä tahansa"},
"whenSpriteCollidedWithN":function(d){return "koskee hahmoa "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "koskee siniseen tulipalloon"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "koskee violettiin tulipalloon"},
"whenSpriteCollidedWithRedFireball":function(d){return "koskee punaiseen tulipalloon"},
"whenSpriteCollidedWithYellowHearts":function(d){return "koskee keltaisia sydämiä"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "koskee violetteja sydämiä"},
"whenSpriteCollidedWithRedHearts":function(d){return "koskee punaisia sydämiä"},
"whenSpriteCollidedWithBottomEdge":function(d){return "koskee alareunaa"},
"whenSpriteCollidedWithLeftEdge":function(d){return "koskee vasenta reunaa"},
"whenSpriteCollidedWithRightEdge":function(d){return "koskee oikeaa reunaa"},
"whenSpriteCollidedWithTopEdge":function(d){return "koskee yläreunaa"},
"whenTouchItem":function(d){return "when item touched"},
"whenTouchItemTooltip":function(d){return "Execute the actions below when the actor touches an item."},
"whenTouchWall":function(d){return "when wall touched"},
"whenTouchWallTooltip":function(d){return "Execute the actions below when the actor touches a wall."},
"whenUp":function(d){return "kun nuoli ylös"},
"whenUpTooltip":function(d){return "Suorita alla olevat toiminnot, kun ylös-nuolinäppäintä painetaan."},
"yes":function(d){return "Kyllä"},
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