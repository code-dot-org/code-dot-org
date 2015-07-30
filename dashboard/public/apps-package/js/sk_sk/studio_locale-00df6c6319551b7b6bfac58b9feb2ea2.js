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
"actor":function(d){return "postava"},
"addItems1":function(d){return "pridať 1 vec typu"},
"addItems2":function(d){return "pridať 2 veci typu"},
"addItems3":function(d){return "pridať 3 veci typu"},
"addItems5":function(d){return "pridať 5 vecí typu"},
"addItems10":function(d){return "pridať 10 vecí typu"},
"addItemsRandom":function(d){return "pridať náhodné veci typu"},
"addItemsTooltip":function(d){return "Pridať veci do scény."},
"alienInvasion":function(d){return "Mimozemská invázia!"},
"backgroundBlack":function(d){return "čierne"},
"backgroundCave":function(d){return "jaskyňa"},
"backgroundCloudy":function(d){return "oblačno"},
"backgroundHardcourt":function(d){return "kurt"},
"backgroundNight":function(d){return "noc"},
"backgroundUnderwater":function(d){return "pod vodou"},
"backgroundCity":function(d){return "mesto"},
"backgroundDesert":function(d){return "púšť"},
"backgroundRainbow":function(d){return "dúha"},
"backgroundSoccer":function(d){return "futbal"},
"backgroundSpace":function(d){return "vesmír"},
"backgroundTennis":function(d){return "tenis"},
"backgroundWinter":function(d){return "zima"},
"catActions":function(d){return "Akcie"},
"catControl":function(d){return "Slučky"},
"catEvents":function(d){return "Udalosti"},
"catLogic":function(d){return "Logické"},
"catMath":function(d){return "Matematické"},
"catProcedures":function(d){return "Funkcie"},
"catText":function(d){return "Text"},
"catVariables":function(d){return "Premenné"},
"changeScoreTooltip":function(d){return "Pridať alebo odstrániť bod zo skóre."},
"changeScoreTooltipK1":function(d){return "Pridať bod do skóre."},
"continue":function(d){return "Pokračovať"},
"decrementPlayerScore":function(d){return "odstrániť bod"},
"defaultSayText":function(d){return "Napíš sem"},
"dropletBlock_changeScore_description":function(d){return "Pridať alebo odstrániť bod zo skóre."},
"dropletBlock_penColour_description":function(d){return "Sets the color of the line drawn behind the turtle as it moves"},
"dropletBlock_penColour_param0":function(d){return "color"},
"dropletBlock_setBackground_description":function(d){return "Nastaví obrázok pozadia"},
"dropletBlock_setSpriteEmotion_description":function(d){return "Nastaviť náladu postavy"},
"dropletBlock_setSpritePosition_description":function(d){return "Okamžite presunie postavu na zadanú pozíciu."},
"dropletBlock_setSpriteSpeed_description":function(d){return "Nastavenie rýchlosti postavy"},
"dropletBlock_setSprite_description":function(d){return "Nastaví obrázok postavy"},
"dropletBlock_throw_description":function(d){return "Hodiť projektil od zadanej postavy."},
"dropletBlock_vanish_description":function(d){return "Odstrániť postavu."},
"emotion":function(d){return "nálada"},
"finalLevel":function(d){return "Gratulujem! Vyriešili ste posledné puzzle."},
"for":function(d){return "pre"},
"hello":function(d){return "ahoj"},
"helloWorld":function(d){return "Ahoj svet!"},
"incrementPlayerScore":function(d){return "získať bod"},
"itemBlueFireball":function(d){return "modrá ohnivá guľa"},
"itemPurpleFireball":function(d){return "fialová ohnivá guľa"},
"itemRedFireball":function(d){return "červená ohnivá guľa"},
"itemYellowHearts":function(d){return "žlté srdcia"},
"itemPurpleHearts":function(d){return "fialové srdcia"},
"itemRedHearts":function(d){return "červené srdcia"},
"itemRandom":function(d){return "náhodný"},
"itemAnna":function(d){return "háčik"},
"itemElsa":function(d){return "iskriť"},
"itemHiro":function(d){return "mikroroboti"},
"itemBaymax":function(d){return "raketa"},
"itemRapunzel":function(d){return "hlboká panvica"},
"itemCherry":function(d){return "čerešňa"},
"itemIce":function(d){return "ľad"},
"itemDuck":function(d){return "kačica"},
"makeProjectileDisappear":function(d){return "zmizne"},
"makeProjectileBounce":function(d){return "skok"},
"makeProjectileBlueFireball":function(d){return "zmeň ohnivú guľu na modrú"},
"makeProjectilePurpleFireball":function(d){return "zmeň ohnivú guľu na fialovú"},
"makeProjectileRedFireball":function(d){return "zmeň ohnivú guľu na červenú"},
"makeProjectileYellowHearts":function(d){return "zmeň srdiečka na žlté"},
"makeProjectilePurpleHearts":function(d){return "zmeň srdiečka na fialové"},
"makeProjectileRedHearts":function(d){return "zmeň srdiečka na červené"},
"makeProjectileTooltip":function(d){return "Projektil, ktorý práve narazil nechajte zmiznúť alebo odraziť."},
"makeYourOwn":function(d){return "Vytvorte si svoju vlastnú Play Lab aplikáciu"},
"moveDirectionDown":function(d){return "nadol"},
"moveDirectionLeft":function(d){return "vľavo"},
"moveDirectionRight":function(d){return "vpravo"},
"moveDirectionUp":function(d){return "hore"},
"moveDirectionRandom":function(d){return "náhodný"},
"moveDistance25":function(d){return "25 pixelov"},
"moveDistance50":function(d){return "50 pixelov"},
"moveDistance100":function(d){return "100 pixelov"},
"moveDistance200":function(d){return "200 pixelov"},
"moveDistance400":function(d){return "400 pixelov"},
"moveDistancePixels":function(d){return "pixely"},
"moveDistanceRandom":function(d){return "náhodné pixely"},
"moveDistanceTooltip":function(d){return "Presunúť postavu o zadanú vzdialenosť v určenom smere."},
"moveSprite":function(d){return "presunúť"},
"moveSpriteN":function(d){return "posunúť postavu "+studio_locale.v(d,"spriteIndex")},
"toXY":function(d){return "do x, y"},
"moveDown":function(d){return "posunúť nadol"},
"moveDownTooltip":function(d){return "Posunúť postavu nadol."},
"moveLeft":function(d){return "posunúť doľava"},
"moveLeftTooltip":function(d){return "Posunúť postavu vľavo."},
"moveRight":function(d){return "posunúť doprava"},
"moveRightTooltip":function(d){return "Posunúť postavu vpravo."},
"moveUp":function(d){return "posunúť nahor"},
"moveUpTooltip":function(d){return "Posunúť postavu smerom hore."},
"moveTooltip":function(d){return "Posunúť postavu."},
"nextLevel":function(d){return "Gratulujem! Vyriešil si hádanku."},
"no":function(d){return "Nie"},
"numBlocksNeeded":function(d){return "Táto hádanka môže byť vyriešená s %1 blokmi."},
"onEventTooltip":function(d){return "Spustiť kód v reakcii na konkrétne udalosti."},
"ouchExclamation":function(d){return "Au!"},
"playSoundCrunch":function(d){return "prehrať zvuk chrumnutia"},
"playSoundGoal1":function(d){return "prehraj zvuk gól 1"},
"playSoundGoal2":function(d){return "prehraj zvuk gól 2"},
"playSoundHit":function(d){return "prehraj zvuk úderu"},
"playSoundLosePoint":function(d){return "prehraj zvuk straty bodu"},
"playSoundLosePoint2":function(d){return "prehraj zvuk straty bodu 2"},
"playSoundRetro":function(d){return "prehraj retro zvuk"},
"playSoundRubber":function(d){return "prehraj gumený zvuk"},
"playSoundSlap":function(d){return "prehraj zvuk plesknutia"},
"playSoundTooltip":function(d){return "Prehraj vybraný zvuk."},
"playSoundWinPoint":function(d){return "prehraj so zvukom bodu"},
"playSoundWinPoint2":function(d){return "prehraj so zvukom bodu 2"},
"playSoundWood":function(d){return "prehraj drevený zvuk"},
"positionOutTopLeft":function(d){return "na pozíciu hore vľavo"},
"positionOutTopRight":function(d){return "na pozíciu hore vpravo"},
"positionTopOutLeft":function(d){return "na pozíciu hore vľavo zvonku"},
"positionTopLeft":function(d){return "na pozíciu hore vľavo"},
"positionTopCenter":function(d){return "na pozíciu hore do stredu"},
"positionTopRight":function(d){return "na pozíciu hore vpravo"},
"positionTopOutRight":function(d){return "na pozíciu hore vpravo zvonku"},
"positionMiddleLeft":function(d){return "na pozíciu v strede vľavo"},
"positionMiddleCenter":function(d){return "na pozíciu v strede do stredu"},
"positionMiddleRight":function(d){return "na pozíciu v strede vpravo"},
"positionBottomOutLeft":function(d){return "zvonku na pozíciu vľavo dole"},
"positionBottomLeft":function(d){return "na pozíciu vľavo dole"},
"positionBottomCenter":function(d){return "na pozíciu do stredu dole"},
"positionBottomRight":function(d){return "na pozíciu vpravo dole"},
"positionBottomOutRight":function(d){return "zvonku na pozíciu vpravo dole"},
"positionOutBottomLeft":function(d){return "zospodu na pozíciu vľavo dole"},
"positionOutBottomRight":function(d){return "zospodu na pozíciu vpravo dole"},
"positionRandom":function(d){return "na náhodnú pozíciu"},
"projectileBlueFireball":function(d){return "modrá ohnivá guľa"},
"projectilePurpleFireball":function(d){return "fialová ohnivá guľa"},
"projectileRedFireball":function(d){return "červená ohnivá guľa"},
"projectileYellowHearts":function(d){return "žlté srdcia"},
"projectilePurpleHearts":function(d){return "fialové srdcia"},
"projectileRedHearts":function(d){return "červené srdcia"},
"projectileRandom":function(d){return "náhodný"},
"projectileAnna":function(d){return "háčik"},
"projectileElsa":function(d){return "iskriť"},
"projectileHiro":function(d){return "mikroroboti"},
"projectileBaymax":function(d){return "raketa"},
"projectileRapunzel":function(d){return "hlboká panvica"},
"projectileCherry":function(d){return "čerešňa"},
"projectileIce":function(d){return "ľad"},
"projectileDuck":function(d){return "kačica"},
"reinfFeedbackMsg":function(d){return "Môžete stlačiť tlačítko \"Pokračovať v prehrávaní\" pre návrat k prehrávaniu Vášho príbehu."},
"repeatForever":function(d){return "opakovať donekonečna"},
"repeatDo":function(d){return "vykonaj"},
"repeatForeverTooltip":function(d){return "Vykonajte akcie v tomto bloku opakovane pokiaľ príbeh prebieha."},
"saySprite":function(d){return "povedzte"},
"saySpriteN":function(d){return "postava "+studio_locale.v(d,"spriteIndex")+" hovorí"},
"saySpriteTooltip":function(d){return "Zobrazí dialógovú bublinu s textom od konkrétnej postavy."},
"saySpriteChoices_0":function(d){return "Ahoj."},
"saySpriteChoices_1":function(d){return "Ahoj všetci."},
"saySpriteChoices_2":function(d){return "Ako sa darí?"},
"saySpriteChoices_3":function(d){return "Dobré ráno"},
"saySpriteChoices_4":function(d){return "Dobré popoludnie"},
"saySpriteChoices_5":function(d){return "Dobrú noc"},
"saySpriteChoices_6":function(d){return "Dobrý večer"},
"saySpriteChoices_7":function(d){return "Čo je nové?"},
"saySpriteChoices_8":function(d){return "Čo?"},
"saySpriteChoices_9":function(d){return "Kde?"},
"saySpriteChoices_10":function(d){return "Kedy?"},
"saySpriteChoices_11":function(d){return "Dobre."},
"saySpriteChoices_12":function(d){return "Skvelé!"},
"saySpriteChoices_13":function(d){return "V poriadku."},
"saySpriteChoices_14":function(d){return "Ujde to."},
"saySpriteChoices_15":function(d){return "Veľa šťastia."},
"saySpriteChoices_16":function(d){return "Áno"},
"saySpriteChoices_17":function(d){return "Nie"},
"saySpriteChoices_18":function(d){return "Dobre"},
"saySpriteChoices_19":function(d){return "Pekný hod!"},
"saySpriteChoices_20":function(d){return "Prajem pekný deň."},
"saySpriteChoices_21":function(d){return "Maj sa."},
"saySpriteChoices_22":function(d){return "Hneď som späť."},
"saySpriteChoices_23":function(d){return "Uvidíme sa zajtra!"},
"saySpriteChoices_24":function(d){return "Uvidíme sa neskôr!"},
"saySpriteChoices_25":function(d){return "Dávaj si pozor!"},
"saySpriteChoices_26":function(d){return "Uži si to!"},
"saySpriteChoices_27":function(d){return "Musím ísť."},
"saySpriteChoices_28":function(d){return "Budeme kamaráti?"},
"saySpriteChoices_29":function(d){return "Skvelá práca!"},
"saySpriteChoices_30":function(d){return "Woo hoo!"},
"saySpriteChoices_31":function(d){return "Jaj!"},
"saySpriteChoices_32":function(d){return "Teší ma."},
"saySpriteChoices_33":function(d){return "V poriadku!"},
"saySpriteChoices_34":function(d){return "Ďakujeme"},
"saySpriteChoices_35":function(d){return "Nie, ďakujem"},
"saySpriteChoices_36":function(d){return "Aaaaaach!"},
"saySpriteChoices_37":function(d){return "Nevadí"},
"saySpriteChoices_38":function(d){return "Dnes"},
"saySpriteChoices_39":function(d){return "Zajtra"},
"saySpriteChoices_40":function(d){return "Včera"},
"saySpriteChoices_41":function(d){return "Našiel som ťa!"},
"saySpriteChoices_42":function(d){return "Našiel si ma!"},
"saySpriteChoices_43":function(d){return "10, 9, 8, 7, 6, 5, 4, 3, 2, 1!"},
"saySpriteChoices_44":function(d){return "Si skvelá!"},
"saySpriteChoices_45":function(d){return "Si vtipná!"},
"saySpriteChoices_46":function(d){return "Si hlúpa! "},
"saySpriteChoices_47":function(d){return "Si dobrá priateľka!"},
"saySpriteChoices_48":function(d){return "Dávaj pozor!"},
"saySpriteChoices_49":function(d){return "Kačica!"},
"saySpriteChoices_50":function(d){return "Mám ťa!"},
"saySpriteChoices_51":function(d){return "Au!"},
"saySpriteChoices_52":function(d){return "Prepáč!"},
"saySpriteChoices_53":function(d){return "Opatrne!"},
"saySpriteChoices_54":function(d){return "Hou!"},
"saySpriteChoices_55":function(d){return "Ups!"},
"saySpriteChoices_56":function(d){return "Skoro si ma dostala!"},
"saySpriteChoices_57":function(d){return "Pekný pokus!"},
"saySpriteChoices_58":function(d){return "Nechytíš ma!"},
"scoreText":function(d){return "Počet bodov: "+studio_locale.v(d,"playerScore")},
"setBackground":function(d){return "nastaviť pozadie"},
"setBackgroundRandom":function(d){return "nastaviť náhodné pozadie"},
"setBackgroundBlack":function(d){return "nastaviť čierne pozadie"},
"setBackgroundCave":function(d){return "nastaviť pozadie jaskyne"},
"setBackgroundCloudy":function(d){return "nastaviť pozadie mraky"},
"setBackgroundHardcourt":function(d){return "nastaviť pozadie antuka"},
"setBackgroundNight":function(d){return "nastaviť pozadie noc"},
"setBackgroundUnderwater":function(d){return "nastaviť pozadie pod vodou"},
"setBackgroundCity":function(d){return "nastaviť pozadie mesto"},
"setBackgroundDesert":function(d){return "nastaviť pozadie púšť"},
"setBackgroundRainbow":function(d){return "nastaviť pozadie dúha"},
"setBackgroundSoccer":function(d){return "nastaviť pozadie futbal"},
"setBackgroundSpace":function(d){return "nastaviť pozadie vesmír"},
"setBackgroundTennis":function(d){return "nastaviť pozadie tenis"},
"setBackgroundWinter":function(d){return "nastaviť pozadie zima"},
"setBackgroundLeafy":function(d){return "nastaviť listnaté pozadie"},
"setBackgroundGrassy":function(d){return "nastaviť trávnaté pozadie"},
"setBackgroundFlower":function(d){return "nastaviť kvetinkové pozadie"},
"setBackgroundTile":function(d){return "nastaviť dlaždicové pozadie"},
"setBackgroundIcy":function(d){return "nastaviť ľadové pozadie"},
"setBackgroundSnowy":function(d){return "nastaviť snehové pozadie"},
"setBackgroundTooltip":function(d){return "Nastaví obrázok pozadia"},
"setEnemySpeed":function(d){return "nastavenie rýchlosti nepriateľa"},
"setPlayerSpeed":function(d){return "nastavenie rýchlosti hráča"},
"setScoreText":function(d){return "nastaviť skóre"},
"setScoreTextTooltip":function(d){return "Nastavenie textu, ktorý sa zobrazí pri skóre."},
"setSpriteEmotionAngry":function(d){return "na nahnevanú náladu"},
"setSpriteEmotionHappy":function(d){return "prejsť k veselej nálade"},
"setSpriteEmotionNormal":function(d){return "prejsť k normálnej nálade"},
"setSpriteEmotionRandom":function(d){return "prejsť k náhodnej nálade"},
"setSpriteEmotionSad":function(d){return "prejsť k smutnej nálade"},
"setSpriteEmotionTooltip":function(d){return "Nastaviť náladu postavy"},
"setSpriteAlien":function(d){return "na obrázok mimozemšťana"},
"setSpriteBat":function(d){return "na obrázok netopiera"},
"setSpriteBird":function(d){return "na obrázok vtáka"},
"setSpriteCat":function(d){return "na obrázok mačky"},
"setSpriteCaveBoy":function(d){return "na obrázok jaskynného chlapca"},
"setSpriteCaveGirl":function(d){return "na obrázok jaskynného dievčaťa"},
"setSpriteDinosaur":function(d){return "na obrázok dinosaura"},
"setSpriteDog":function(d){return "na obrázok psa"},
"setSpriteDragon":function(d){return "na obrázok draka"},
"setSpriteGhost":function(d){return "na obrázok ducha"},
"setSpriteHidden":function(d){return "na skrytý obrázok"},
"setSpriteHideK1":function(d){return "skryť"},
"setSpriteAnna":function(d){return "na Anin obrázok"},
"setSpriteElsa":function(d){return "na Elsin obrázok"},
"setSpriteHiro":function(d){return "na obrázok Hira"},
"setSpriteBaymax":function(d){return "na obrázok Baymaxa"},
"setSpriteRapunzel":function(d){return "na obrázok Rapunzel"},
"setSpriteKnight":function(d){return "na obrázok rytiera"},
"setSpriteMonster":function(d){return "na obrázok príšery"},
"setSpriteNinja":function(d){return "na obrázok maskovaného ninju"},
"setSpriteOctopus":function(d){return "na obrázok chobotnice"},
"setSpritePenguin":function(d){return "na obrázok tučniaka"},
"setSpritePirate":function(d){return "na obrázok piráta"},
"setSpritePrincess":function(d){return "na obrázok princezny"},
"setSpriteRandom":function(d){return "na náhodný obrázok"},
"setSpriteRobot":function(d){return "na obrázok robota"},
"setSpriteShowK1":function(d){return "ukáž"},
"setSpriteSpacebot":function(d){return "na obrázok spacebota"},
"setSpriteSoccerGirl":function(d){return "na obrázok futbalistky"},
"setSpriteSoccerBoy":function(d){return "na obrázok futbalistu"},
"setSpriteSquirrel":function(d){return "na obrázok veveričky"},
"setSpriteTennisGirl":function(d){return "na obrázok tenistky"},
"setSpriteTennisBoy":function(d){return "na obrázok tenistu"},
"setSpriteUnicorn":function(d){return "na obrázok jednorožca"},
"setSpriteWitch":function(d){return "na obrázok čarodejnice"},
"setSpriteWizard":function(d){return "na obrázok čarodeja"},
"setSpritePositionTooltip":function(d){return "Okamžite presunie postavu na zadanú pozíciu."},
"setSpriteK1Tooltip":function(d){return "Ukáže alebo skryje vybranú postavu."},
"setSpriteTooltip":function(d){return "Nastaví obrázok postavy"},
"setSpriteSizeRandom":function(d){return "na náhodnú veľkosť"},
"setSpriteSizeVerySmall":function(d){return "na veľmi malú veľkosť"},
"setSpriteSizeSmall":function(d){return "na malú veľkosť"},
"setSpriteSizeNormal":function(d){return "na normálnu veľkosť"},
"setSpriteSizeLarge":function(d){return "na veľkú veľkosť"},
"setSpriteSizeVeryLarge":function(d){return "na veľmi veľkú veľkosť"},
"setSpriteSizeTooltip":function(d){return "Nastaví veľkosť postavy"},
"setSpriteSpeedRandom":function(d){return "na náhodnú rýchlosť"},
"setSpriteSpeedVerySlow":function(d){return "na veľmi pomalú rýchlosť"},
"setSpriteSpeedSlow":function(d){return "na pomalú rýchlosť"},
"setSpriteSpeedNormal":function(d){return "na normálnu rýchlosť"},
"setSpriteSpeedFast":function(d){return "na rýchlu rýchlosť"},
"setSpriteSpeedVeryFast":function(d){return "na veľmi rýchlu rýchlosť"},
"setSpriteSpeedTooltip":function(d){return "Nastavenie rýchlosti postavy"},
"setSpriteZombie":function(d){return "na obrázok zombíka"},
"shareStudioTwitter":function(d){return "Pozri si príbeh, ktorý som urobil. Vytvoril som ho sám s @codeorg"},
"shareGame":function(d){return "Zdieľaj svoj príbeh:"},
"showCoordinates":function(d){return "zobraziť súradnice"},
"showCoordinatesTooltip":function(d){return "zobraziť súradnice hlavnej postavy na obrazovke"},
"showTitleScreen":function(d){return "zobraziť úvodnú obrazovku"},
"showTitleScreenTitle":function(d){return "nadpis"},
"showTitleScreenText":function(d){return "text"},
"showTSDefTitle":function(d){return "sem napíš nadpis"},
"showTSDefText":function(d){return "sem napíš text"},
"showTitleScreenTooltip":function(d){return "Zobraziť úvodnú obrazovku s priradeným nadpisom a textom."},
"size":function(d){return "veľkosť"},
"setSprite":function(d){return "nastaviť"},
"setSpriteN":function(d){return "nastav postavu "+studio_locale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "chrúmať"},
"soundGoal1":function(d){return "cieľ 1"},
"soundGoal2":function(d){return "cieľ 2"},
"soundHit":function(d){return "zásah"},
"soundLosePoint":function(d){return "stratiť bod"},
"soundLosePoint2":function(d){return "stratiť bod 2"},
"soundRetro":function(d){return "retro"},
"soundRubber":function(d){return "guma"},
"soundSlap":function(d){return "facka"},
"soundWinPoint":function(d){return "vyherný bod"},
"soundWinPoint2":function(d){return "vyherný bod 2"},
"soundWood":function(d){return "drevo"},
"speed":function(d){return "rýchlosť"},
"startSetValue":function(d){return "štart (funkcia)"},
"startSetVars":function(d){return "game_vars (nadpis, podnadpis, pozadie, cieľ, výstraha, hráč)"},
"startSetFuncs":function(d){return "funkcie_hry (aktualizuj-ciel, aktualizuj-ohrozenie, aktualizuj-hraca, kolizia?, na-obrazovke?)"},
"stopSprite":function(d){return "zastaviť"},
"stopSpriteN":function(d){return "zastaviť postavu "+studio_locale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Zastaviť pohyb postavy."},
"throwSprite":function(d){return "hodiť"},
"throwSpriteN":function(d){return "postava "+studio_locale.v(d,"spriteIndex")+" hádže"},
"throwTooltip":function(d){return "Hodiť projektil od zadanej postavy."},
"vanish":function(d){return "zmiznúť"},
"vanishActorN":function(d){return "odstrániť postavu "+studio_locale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "Odstrániť postavu."},
"waitFor":function(d){return "čakať na"},
"waitSeconds":function(d){return "sekundy"},
"waitForClick":function(d){return "čakať na kliknutie"},
"waitForRandom":function(d){return "čakať na náhodné"},
"waitForHalfSecond":function(d){return "čakať pol sekundy"},
"waitFor1Second":function(d){return "čakať 1 sekundu"},
"waitFor2Seconds":function(d){return "čakať 2 sekundy"},
"waitFor5Seconds":function(d){return "čakať 5 sekúnd"},
"waitFor10Seconds":function(d){return "čakať 10 sekúnd"},
"waitParamsTooltip":function(d){return "Čakať zadaný počet sekúnd alebo použiť nulu, kým nenastane kliknutie."},
"waitTooltip":function(d){return "Čakať určitý čas alebo kým nenastane kliknutie."},
"whenArrowDown":function(d){return "šípka nadol"},
"whenArrowLeft":function(d){return "šípka vľavo"},
"whenArrowRight":function(d){return "šípka vpravo"},
"whenArrowUp":function(d){return "šípka hore"},
"whenArrowTooltip":function(d){return "Vykonajte akcie uvedené nižšie, keď je stlačená konkrétna šípka."},
"whenDown":function(d){return "keď šípka nadol"},
"whenDownTooltip":function(d){return "Vykonať akcie nižšie pri stlačení šípky dole."},
"whenGameStarts":function(d){return "keď začína príbeh"},
"whenGameStartsTooltip":function(d){return "Keď začína príbeh, vykonaj akcie uvedené nižšie."},
"whenLeft":function(d){return "keď šípka vľavo"},
"whenLeftTooltip":function(d){return "Vykonať akcie nižšie pri stlačení šípky vľavo."},
"whenRight":function(d){return "keď šípka vpravo"},
"whenRightTooltip":function(d){return "Vykonať akcie nižšie pri stlačení šípky vpravo."},
"whenSpriteClicked":function(d){return "po kliknutí na postavu"},
"whenSpriteClickedN":function(d){return "po kliknutí na postavu "+studio_locale.v(d,"spriteIndex")},
"whenSpriteClickedTooltip":function(d){return "Po kliknutí na postavu, vykonať akcie uvedené nižšie."},
"whenSpriteCollidedN":function(d){return "keď postava "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "Vykoná nižšie uvedené akcie, keď sa postava dotýka inej postavy."},
"whenSpriteCollidedWith":function(d){return "dotýka sa"},
"whenSpriteCollidedWithAnyActor":function(d){return "dotýka sa nejakej postavy"},
"whenSpriteCollidedWithAnyEdge":function(d){return "dotýka sa okraja"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "dotýka sa projektilu"},
"whenSpriteCollidedWithAnything":function(d){return "dotýka sa čohokoľvek"},
"whenSpriteCollidedWithN":function(d){return "dotýka sa postavy "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "dotýka sa modrej ohnivej gule"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "dotýka sa fialovej ohnivej gule"},
"whenSpriteCollidedWithRedFireball":function(d){return "dotýka sa červenej ohnivej gule"},
"whenSpriteCollidedWithYellowHearts":function(d){return "dotýka sa žltých sŕdc"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "dotýka sa fialových sŕdc"},
"whenSpriteCollidedWithRedHearts":function(d){return "dotýka sa červených sŕdc"},
"whenSpriteCollidedWithBottomEdge":function(d){return "dotýka sa spodného okraja"},
"whenSpriteCollidedWithLeftEdge":function(d){return "dotýka sa ľavého okraja"},
"whenSpriteCollidedWithRightEdge":function(d){return "dotýka sa pravého okraja"},
"whenSpriteCollidedWithTopEdge":function(d){return "dotýka sa horného okraja"},
"whenUp":function(d){return "keď šípka nahor"},
"whenUpTooltip":function(d){return "Vykonať akcie nižšie pri stlačení šípky hore."},
"yes":function(d){return "Áno"}};