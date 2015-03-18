var appLocale = {lc:{"ar":function(n){
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
},"da":function(n){return n===1?"one":"other"},"de":function(n){return n===1?"one":"other"},"el":function(n){return n===1?"one":"other"},"es":function(n){return n===1?"one":"other"},"et":function(n){return n===1?"one":"other"},"eu":function(n){return n===1?"one":"other"},"fa":function(n){return "other"},"fi":function(n){return n===1?"one":"other"},"fil":function(n){return n===0||n==1?"one":"other"},"fr":function(n){return Math.floor(n)===0||Math.floor(n)==1?"one":"other"},"gl":function(n){return n===1?"one":"other"},"he":function(n){return n===1?"one":"other"},"hi":function(n){return n===0||n==1?"one":"other"},"hr":function(n){
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
},"mk":function(n){return (n%10)==1&&n!=11?"one":"other"},"ms":function(n){return "other"},"mt":function(n){
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
v:function(d,k){appLocale.c(d,k);return d[k]},
p:function(d,k,o,l,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:(k=appLocale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).appLocale = {
"actor":function(d){return "postava"},
"alienInvasion":function(d){return "Alien Invasion!"},
"backgroundBlack":function(d){return "čierny"},
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
"changeScoreTooltip":function(d){return "Pridať alebo odstrániť bod z počtu bodov."},
"changeScoreTooltipK1":function(d){return "Pridaj bod k počtu bodov."},
"continue":function(d){return "Pokračovať"},
"decrementPlayerScore":function(d){return "odstrániť bod"},
"defaultSayText":function(d){return "Zadajte tu"},
"emotion":function(d){return "nálada"},
"finalLevel":function(d){return "Gratulujem! Vyriešili ste posledné puzzle."},
"for":function(d){return "pre"},
"hello":function(d){return "ahoj"},
"helloWorld":function(d){return "Ahoj svet!"},
"incrementPlayerScore":function(d){return "získať bod"},
"makeProjectileDisappear":function(d){return "zmizne"},
"makeProjectileBounce":function(d){return "skok"},
"makeProjectileBlueFireball":function(d){return "zmeň ohnivú guľu na modrú"},
"makeProjectilePurpleFireball":function(d){return "zmeň ohnivú guľu na fialovú"},
"makeProjectileRedFireball":function(d){return "zmeň ohnivú guľu na červenú"},
"makeProjectileYellowHearts":function(d){return "zmeň srdiečka na žltú"},
"makeProjectilePurpleHearts":function(d){return "zmeň srdiečka na fialovú"},
"makeProjectileRedHearts":function(d){return "zmeň srdiečka na červenú"},
"makeProjectileTooltip":function(d){return "Projektil ktorý práve narazil nechajte zmiznúť alebo odraziť."},
"makeYourOwn":function(d){return "Spravte si svoj vlastnú Play Lab aplikáciu"},
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
"moveDistanceRandom":function(d){return "náhodne pixely"},
"moveDistanceTooltip":function(d){return "Presunie postavu o zadanú vzdialenosť v určenom smere."},
"moveSprite":function(d){return "presunúť"},
"moveSpriteN":function(d){return "posuň postavu "+appLocale.v(d,"spriteIndex")},
"toXY":function(d){return "to x,y"},
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
"onEventTooltip":function(d){return "Execute code in response to the specified event."},
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
"positionBottomOutLeft":function(d){return "na pozíciu dole vľavo zvonku"},
"positionBottomLeft":function(d){return "na pozíciu dole vľavo"},
"positionBottomCenter":function(d){return "na pozíciu dole do stredu"},
"positionBottomRight":function(d){return "na pozíciu dole vpravo"},
"positionBottomOutRight":function(d){return "na pozíciu dole vpravo zvonku"},
"positionOutBottomLeft":function(d){return "na pozíciu dole vľavo pod"},
"positionOutBottomRight":function(d){return "na pozíciu dole vpravo pod"},
"positionRandom":function(d){return "na náhodnú pozíciu"},
"projectileBlueFireball":function(d){return "modrá ohnivá guľa"},
"projectilePurpleFireball":function(d){return "fialová ohnivá guľa"},
"projectileRedFireball":function(d){return "červená ohnivá guľa"},
"projectileYellowHearts":function(d){return "žlté srdcia"},
"projectilePurpleHearts":function(d){return "fialové srdcia"},
"projectileRedHearts":function(d){return "červené srdcia"},
"projectileRandom":function(d){return "náhodný"},
"projectileAnna":function(d){return "Anna"},
"projectileElsa":function(d){return "Elza"},
"projectileHiro":function(d){return "Hiro"},
"projectileBaymax":function(d){return "Baymax"},
"projectileRapunzel":function(d){return "Rapunzel"},
"projectileCherry":function(d){return "cherry"},
"projectileIce":function(d){return "ice"},
"projectileDuck":function(d){return "duck"},
"reinfFeedbackMsg":function(d){return "Pre návrat k svojej hre môžete stlačiť tlačidlo \"Skúsiť znova\"."},
"repeatForever":function(d){return "opakovať donekonečna"},
"repeatDo":function(d){return "vykonaj"},
"repeatForeverTooltip":function(d){return "Vykonajte akcie v tomto bloku opakovane pokiaľ príbeh prebieha."},
"saySprite":function(d){return "povedať"},
"saySpriteN":function(d){return "postava "+appLocale.v(d,"spriteIndex")+" povedz"},
"saySpriteTooltip":function(d){return "Zobrazí dialógovú bublinu s textom od konkrétnej postavy."},
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
"saySpriteChoices_16":function(d){return "Áno"},
"saySpriteChoices_17":function(d){return "Nie"},
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
"scoreText":function(d){return "Počet bodov: "+appLocale.v(d,"playerScore")},
"setBackground":function(d){return "nastaviť pozadie"},
"setBackgroundRandom":function(d){return "náhodné pozadie"},
"setBackgroundBlack":function(d){return "nastaviť čierne pozadie"},
"setBackgroundCave":function(d){return "nastaviť jaskyňu ako pozadie"},
"setBackgroundCloudy":function(d){return "nastaviť oblaky ako pozadie"},
"setBackgroundHardcourt":function(d){return "nastaviť antuku ako pozadie"},
"setBackgroundNight":function(d){return "nastaviť noc ako pozadie"},
"setBackgroundUnderwater":function(d){return "nastaviť pozadie pod vodou"},
"setBackgroundCity":function(d){return "nastaviť mesto ko pozadie"},
"setBackgroundDesert":function(d){return "nastaviť púšť ako pozadie"},
"setBackgroundRainbow":function(d){return "nastaviť dúhu ako pozadie"},
"setBackgroundSoccer":function(d){return "nastaviť futbal ako pozadie"},
"setBackgroundSpace":function(d){return "nastaviť vesmír ako pozadie"},
"setBackgroundTennis":function(d){return "nastaviť tenis ako pozadie"},
"setBackgroundWinter":function(d){return "nastaviť zimu ako pozadie"},
"setBackgroundLeafy":function(d){return "set leafy background"},
"setBackgroundGrassy":function(d){return "set grassy background"},
"setBackgroundFlower":function(d){return "set flower background"},
"setBackgroundTile":function(d){return "set tile background"},
"setBackgroundIcy":function(d){return "set icy background"},
"setBackgroundSnowy":function(d){return "set snowy background"},
"setBackgroundTooltip":function(d){return "Nastaví obrázok pozadia"},
"setEnemySpeed":function(d){return "nastav rýchlosť nepriateľa"},
"setPlayerSpeed":function(d){return "nastav rýchlosť hráča"},
"setScoreText":function(d){return "nastaviť skóre"},
"setScoreTextTooltip":function(d){return "Nastaviť text, ktorý sa zobrazí v oblasti počtu bodov."},
"setSpriteEmotionAngry":function(d){return "prejdi k nahnevanej nálade"},
"setSpriteEmotionHappy":function(d){return "prejdi k radostnej nálade"},
"setSpriteEmotionNormal":function(d){return "prejdi k normálnej nálade"},
"setSpriteEmotionRandom":function(d){return "prejdi k náhodnej nálade"},
"setSpriteEmotionSad":function(d){return "prejdi k smutnej nálade"},
"setSpriteEmotionTooltip":function(d){return "Nastaví náladu postavy"},
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
"setSpriteAnna":function(d){return "na obrázok Anny"},
"setSpriteElsa":function(d){return "na obrázok Elzy"},
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
"setSpriteShowK1":function(d){return "ukázať"},
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
"setSpriteSpeedTooltip":function(d){return "Nastaví rýchlosť postavy"},
"setSpriteZombie":function(d){return "na obrázok zombíka"},
"shareStudioTwitter":function(d){return "Pozri si príbeh, ktorý som urobil. Vytvoril som ho sám s @codeorg"},
"shareGame":function(d){return "Zdieľaj svoj príbeh:"},
"showCoordinates":function(d){return "zobraziť súradnice"},
"showCoordinatesTooltip":function(d){return "zobrazí súradnice protagonistov na obrazovke"},
"showTitleScreen":function(d){return "zobraziť úvodnú obrazovku"},
"showTitleScreenTitle":function(d){return "nadpis"},
"showTitleScreenText":function(d){return "text"},
"showTSDefTitle":function(d){return "sem napíš nadpis"},
"showTSDefText":function(d){return "sem napíš text"},
"showTitleScreenTooltip":function(d){return "Zobrazí úvodnú obrazovku s priradeným nadpisom a textom."},
"size":function(d){return "veľkosť"},
"setSprite":function(d){return "nastaviť"},
"setSpriteN":function(d){return "nastav postavu "+appLocale.v(d,"spriteIndex")},
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
"startSetValue":function(d){return "start (rocket-height function)"},
"startSetVars":function(d){return "game_vars (title, subtitle, background, target, danger, player)"},
"startSetFuncs":function(d){return "game_funcs (update-target, update-danger, update-player, collide?, on-screen?)"},
"stopSprite":function(d){return "zastaviť"},
"stopSpriteN":function(d){return "zastaviť postavu "+appLocale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Zastaví pohyb postavy."},
"throwSprite":function(d){return "hodiť"},
"throwSpriteN":function(d){return "postava "+appLocale.v(d,"spriteIndex")+" hoď"},
"throwTooltip":function(d){return "Hodí projektil od zadanej postavy."},
"vanish":function(d){return "zmiznúť"},
"vanishActorN":function(d){return "odstráň postavu "+appLocale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "Odstráni postavu."},
"waitFor":function(d){return "čakať na"},
"waitSeconds":function(d){return "sekundy"},
"waitForClick":function(d){return "čakať na kliknutie"},
"waitForRandom":function(d){return "čakať na náhodné"},
"waitForHalfSecond":function(d){return "čakať pol sekundy"},
"waitFor1Second":function(d){return "čakať 1 sekundu"},
"waitFor2Seconds":function(d){return "čakať 2 sekundy"},
"waitFor5Seconds":function(d){return "čakať 5 sekúnd"},
"waitFor10Seconds":function(d){return "čakať 10 sekúnd"},
"waitParamsTooltip":function(d){return "Čaká zadaný počet sekúnd alebo použie nulu kým sa vyskytne kliknutie."},
"waitTooltip":function(d){return "Čaká určitý čas alebo kým sa vyskytne kliknutie."},
"whenArrowDown":function(d){return "šípka nadol"},
"whenArrowLeft":function(d){return "šípka vľavo"},
"whenArrowRight":function(d){return "šípka vpravo"},
"whenArrowUp":function(d){return "šípka hore"},
"whenArrowTooltip":function(d){return "Vykonajte akcie uvedené nižšie, keď je stlačená šípka."},
"whenDown":function(d){return "keď šípka nadol"},
"whenDownTooltip":function(d){return "Vykonať akcie nižšie pri stlačení šípky dole."},
"whenGameStarts":function(d){return "keď začína príbeh"},
"whenGameStartsTooltip":function(d){return "Vykonajte akcie uvedené nižšie, keď sa príbeh začína."},
"whenLeft":function(d){return "keď šípka vľavo"},
"whenLeftTooltip":function(d){return "Vykonať akcie nižšie pri stlačení šípky vľavo."},
"whenRight":function(d){return "keď šípka vpravo"},
"whenRightTooltip":function(d){return "Vykonať akcie nižšie pri stlačení šípky vpravo."},
"whenSpriteClicked":function(d){return "po kliknutí na postavu"},
"whenSpriteClickedN":function(d){return "po kliknutí na postavu "+appLocale.v(d,"spriteIndex")},
"whenSpriteClickedTooltip":function(d){return "Vykoná nižšie uvedené akcie po kliknutí na postavu."},
"whenSpriteCollidedN":function(d){return "keď postava "+appLocale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "Vykoná nižšie uvedené akcie, keď sa postava dotýka inej postavy."},
"whenSpriteCollidedWith":function(d){return "dotýka sa"},
"whenSpriteCollidedWithAnyActor":function(d){return "dotýka sa nejakej postavy"},
"whenSpriteCollidedWithAnyEdge":function(d){return "dotýka sa okraja"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "dotýka sa projektilu"},
"whenSpriteCollidedWithAnything":function(d){return "dotýka sa čohokoľvek"},
"whenSpriteCollidedWithN":function(d){return "dotýka sa postavy "+appLocale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "dotýka sa modrej ohnivej guli"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "dotýka sa fialovej ohnivej guli"},
"whenSpriteCollidedWithRedFireball":function(d){return "dotýka sa červenej ohnivej guli"},
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