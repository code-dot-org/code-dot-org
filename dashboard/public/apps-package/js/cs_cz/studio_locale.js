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
v:function(d,k){studio_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){studio_locale.c(d,k);return d[k] in p?p[d[k]]:(k=studio_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){studio_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).studio_locale = {
"actor":function(d){return "herec"},
"alienInvasion":function(d){return "Mimozemská invaze!"},
"backgroundBlack":function(d){return "černý"},
"backgroundCave":function(d){return "jeskyně"},
"backgroundCloudy":function(d){return "zataženo"},
"backgroundHardcourt":function(d){return "tvrdé hřiště"},
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
"emotion":function(d){return "nálada"},
"finalLevel":function(d){return "Dobrá práce! Vyřešil si poslední hádanku."},
"for":function(d){return "pro"},
"hello":function(d){return "ahoj"},
"helloWorld":function(d){return "Ahoj světe!"},
"incrementPlayerScore":function(d){return "Bod"},
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
"toXY":function(d){return "to x,y"},
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
"onEventTooltip":function(d){return "Execute code in response to the specified event."},
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
"playSoundWinPoint":function(d){return "přehrát zvuk získaný bod"},
"playSoundWinPoint2":function(d){return "přehrát zvuk získaný bod 2"},
"playSoundWood":function(d){return "přehrát zvuk dřevo"},
"positionOutTopLeft":function(d){return "na pozici nad horní levou pozicí"},
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
"positionBottomCenter":function(d){return "na spodní středovou pozici"},
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
"projectileAnna":function(d){return "Anna"},
"projectileElsa":function(d){return "Elsa"},
"projectileHiro":function(d){return "Hiro"},
"projectileBaymax":function(d){return "raketa"},
"projectileRapunzel":function(d){return "pánev"},
"projectileCherry":function(d){return "třešeň"},
"projectileIce":function(d){return "led"},
"projectileDuck":function(d){return "kachna"},
"reinfFeedbackMsg":function(d){return "Můžete stisknout tlačítko \"Zkusit znovu\" a vrátit se k přehrávání vašeho příběhu."},
"repeatForever":function(d){return "opakujte navždy"},
"repeatDo":function(d){return "dělej"},
"repeatForeverTooltip":function(d){return "Provést akce v tomto bloku opakovaně dokud je spuštěn příběh."},
"saySprite":function(d){return "řekni"},
"saySpriteN":function(d){return "herec "+studio_locale.v(d,"spriteIndex")+" říká"},
"saySpriteTooltip":function(d){return "Zobrazit komiksovou bublinu s přidruženým textem od zvoleného herece."},
"saySpriteChoices_0":function(d){return "Hi there."},
"saySpriteChoices_1":function(d){return "Hi there!"},
"saySpriteChoices_2":function(d){return "How are you?"},
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
"saySpriteChoices_19":function(d){return "Nice throw!"},
"saySpriteChoices_20":function(d){return "Hezký den."},
"saySpriteChoices_21":function(d){return "Ahoj."},
"saySpriteChoices_22":function(d){return "Hned jsem zpátky."},
"saySpriteChoices_23":function(d){return "Zítra ahoj!"},
"saySpriteChoices_24":function(d){return "Zatím se měj!"},
"saySpriteChoices_25":function(d){return "Opatruj se!"},
"saySpriteChoices_26":function(d){return "Užijte si!"},
"saySpriteChoices_27":function(d){return "Musím jít."},
"saySpriteChoices_28":function(d){return "Chcete být přátelé?"},
"saySpriteChoices_29":function(d){return "Skvělá práce!"},
"saySpriteChoices_30":function(d){return "Woo hoo!"},
"saySpriteChoices_31":function(d){return "Yay!"},
"saySpriteChoices_32":function(d){return "Těší mě."},
"saySpriteChoices_33":function(d){return "Dobře!"},
"saySpriteChoices_34":function(d){return "Děkuji"},
"saySpriteChoices_35":function(d){return "Ne, děkuji"},
"saySpriteChoices_36":function(d){return "Aaaaaah!"},
"saySpriteChoices_37":function(d){return "Nevadí"},
"saySpriteChoices_38":function(d){return "Dnes"},
"saySpriteChoices_39":function(d){return "Zítra"},
"saySpriteChoices_40":function(d){return "Včera"},
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
"scoreText":function(d){return "Body: "+studio_locale.v(d,"playerScore")},
"setBackground":function(d){return "nastavit pozadí"},
"setBackgroundRandom":function(d){return "nastavit náhodné pozadí"},
"setBackgroundBlack":function(d){return "nastavit černé pozadí"},
"setBackgroundCave":function(d){return "nastavit pozadí jeskyně"},
"setBackgroundCloudy":function(d){return "nastavit pozadí mraky"},
"setBackgroundHardcourt":function(d){return "nastavit pozadí tvrdé hřiště"},
"setBackgroundNight":function(d){return "nastavit pozadí noc"},
"setBackgroundUnderwater":function(d){return "nastavit pozadí pod vodou"},
"setBackgroundCity":function(d){return "nastavit pozadí město"},
"setBackgroundDesert":function(d){return "nastavit pozadí poušť"},
"setBackgroundRainbow":function(d){return "nastavit pozadí duha"},
"setBackgroundSoccer":function(d){return "nastavit pozadí fotbal"},
"setBackgroundSpace":function(d){return "nastavit pozadí vesmír"},
"setBackgroundTennis":function(d){return "nastavit pozadí tenis"},
"setBackgroundWinter":function(d){return "nastavit pozadí zima"},
"setBackgroundLeafy":function(d){return "set leafy background"},
"setBackgroundGrassy":function(d){return "set grassy background"},
"setBackgroundFlower":function(d){return "set flower background"},
"setBackgroundTile":function(d){return "set tile background"},
"setBackgroundIcy":function(d){return "set icy background"},
"setBackgroundSnowy":function(d){return "set snowy background"},
"setBackgroundTooltip":function(d){return "Nastavit obrázek pozadí"},
"setEnemySpeed":function(d){return "nastavit rychlost protivníka"},
"setPlayerSpeed":function(d){return "nastavit rychlost hráče"},
"setScoreText":function(d){return "nastavit body"},
"setScoreTextTooltip":function(d){return "Nastaví text, který se má zobrazit v oblasti pro výsledek."},
"setSpriteEmotionAngry":function(d){return "na rozzlobenou náladu"},
"setSpriteEmotionHappy":function(d){return "na šťastnou náladu"},
"setSpriteEmotionNormal":function(d){return "na normální náladu"},
"setSpriteEmotionRandom":function(d){return "na náhodnou náladu"},
"setSpriteEmotionSad":function(d){return "na smutnou náladu"},
"setSpriteEmotionTooltip":function(d){return "Nastaví náladu herce"},
"setSpriteAlien":function(d){return "na obrázek mimozemšťana"},
"setSpriteBat":function(d){return "na obrázek netopýra"},
"setSpriteBird":function(d){return "na obrázek ptáka"},
"setSpriteCat":function(d){return "na obrázek kočky"},
"setSpriteCaveBoy":function(d){return "na obrázek jeskynního chlapece"},
"setSpriteCaveGirl":function(d){return "na obrázek jeskynní dívky"},
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
"setSpriteNinja":function(d){return "na obrázek maskovaného ninjy"},
"setSpriteOctopus":function(d){return "na obrázek chobotnice"},
"setSpritePenguin":function(d){return "na obrázek tučňáka"},
"setSpritePirate":function(d){return "na obrázek piráta"},
"setSpritePrincess":function(d){return "na obrázek princezny"},
"setSpriteRandom":function(d){return "na náhodný obrázek"},
"setSpriteRobot":function(d){return "na obrázek robota"},
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
"setSpritePositionTooltip":function(d){return "Okamžitě přesune herce na zadané místo."},
"setSpriteK1Tooltip":function(d){return "Zobrazí nebo skryje zadaného herce."},
"setSpriteTooltip":function(d){return "Nastaví obrázek herce"},
"setSpriteSizeRandom":function(d){return "na náhodnou velikost"},
"setSpriteSizeVerySmall":function(d){return "na velmi malou velikost"},
"setSpriteSizeSmall":function(d){return "na malou velikost"},
"setSpriteSizeNormal":function(d){return "na normální velikost"},
"setSpriteSizeLarge":function(d){return "na velkou velikost"},
"setSpriteSizeVeryLarge":function(d){return "na velmi velkou velikost"},
"setSpriteSizeTooltip":function(d){return "Nastaví velikost herce"},
"setSpriteSpeedRandom":function(d){return "na náhodnou rychlost"},
"setSpriteSpeedVerySlow":function(d){return "na velmi pomalou rychlost"},
"setSpriteSpeedSlow":function(d){return "na pomalou rychlost"},
"setSpriteSpeedNormal":function(d){return "na normální rychlost"},
"setSpriteSpeedFast":function(d){return "na rychlou rychlost"},
"setSpriteSpeedVeryFast":function(d){return "na velmi rychlou rychlost"},
"setSpriteSpeedTooltip":function(d){return "Nastaví rychlost herce"},
"setSpriteZombie":function(d){return "na obrázek zombie"},
"shareStudioTwitter":function(d){return "Podívejte se na aplikaci, kterou jsem udělal. Napsal jsem to sám s @codeorg"},
"shareGame":function(d){return "Sdílej svůj příběh:"},
"showCoordinates":function(d){return "Zobrazit souřadnice"},
"showCoordinatesTooltip":function(d){return "zobrazí souřadnice hlavní postavy na obrazovce"},
"showTitleScreen":function(d){return "zobrazit úvodní obrazovku"},
"showTitleScreenTitle":function(d){return "nadpis"},
"showTitleScreenText":function(d){return "text"},
"showTSDefTitle":function(d){return "zde napiš nadpis"},
"showTSDefText":function(d){return "zde napiš text"},
"showTitleScreenTooltip":function(d){return "Zobrazit úvodní obrazovka k přidruženému názvu a textu."},
"size":function(d){return "velikost"},
"setSprite":function(d){return "nastavit"},
"setSpriteN":function(d){return "nastavit herece "+studio_locale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "křupnutí"},
"soundGoal1":function(d){return "cíl 1"},
"soundGoal2":function(d){return "cíl 2"},
"soundHit":function(d){return "zásah"},
"soundLosePoint":function(d){return "ztracený bod"},
"soundLosePoint2":function(d){return "ztracený bod 2"},
"soundRetro":function(d){return "retro"},
"soundRubber":function(d){return "guma"},
"soundSlap":function(d){return "facka"},
"soundWinPoint":function(d){return "vyhraný bod"},
"soundWinPoint2":function(d){return "vyhraný bod 2"},
"soundWood":function(d){return "dřevo"},
"speed":function(d){return "rychlost"},
"startSetValue":function(d){return "start (rocket-height function)"},
"startSetVars":function(d){return "game_vars (title, subtitle, background, target, danger, player)"},
"startSetFuncs":function(d){return "game_funcs (update-target, update-danger, update-player, collide?, on-screen?)"},
"stopSprite":function(d){return "zastavit"},
"stopSpriteN":function(d){return "zastavit herce "+studio_locale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Zastaví pohyb herce."},
"throwSprite":function(d){return "hoď"},
"throwSpriteN":function(d){return "herec "+studio_locale.v(d,"spriteIndex")+" hodí"},
"throwTooltip":function(d){return "Hodí střelu od zadaného herce."},
"vanish":function(d){return "zmiz"},
"vanishActorN":function(d){return "zmiz herec "+studio_locale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "Herec zmizí."},
"waitFor":function(d){return "čekat na"},
"waitSeconds":function(d){return "sekund"},
"waitForClick":function(d){return "čekat na kliknutí"},
"waitForRandom":function(d){return "čekat na náhodně"},
"waitForHalfSecond":function(d){return "čekat půl sekundy"},
"waitFor1Second":function(d){return "čekat 1 sekundu"},
"waitFor2Seconds":function(d){return "čekat 2 sekundy"},
"waitFor5Seconds":function(d){return "čekat 5 sekund"},
"waitFor10Seconds":function(d){return "čekat 10 sekund"},
"waitParamsTooltip":function(d){return "Čeká zadaný počet sekund. Použijte nulu pro čekání na kliknutí."},
"waitTooltip":function(d){return "Čeká zadané množství času nebo dokud nedojde ke kliknutí."},
"whenArrowDown":function(d){return "šipka dolů"},
"whenArrowLeft":function(d){return "šipka vlevo"},
"whenArrowRight":function(d){return "šipka vpravo"},
"whenArrowUp":function(d){return "šipka nahoru"},
"whenArrowTooltip":function(d){return "Provést zadané akce po stisknutí klávesy se šipkou."},
"whenDown":function(d){return "když šipka dolů"},
"whenDownTooltip":function(d){return "Spusť uvedené akce když je stisknutá klávesa \"dolů\"."},
"whenGameStarts":function(d){return "když se příběh začne"},
"whenGameStartsTooltip":function(d){return "Provést uvedené akce, když příběh začne."},
"whenLeft":function(d){return "když šipka vlevo"},
"whenLeftTooltip":function(d){return "Spusť uvedené akce když je stisknutá klávesa \"vlevo\"."},
"whenRight":function(d){return "když šipka vpravo"},
"whenRightTooltip":function(d){return "Spusť uvedené akce když je stisknutá klávesa \"vpravo\"."},
"whenSpriteClicked":function(d){return "po kliknutí na herce"},
"whenSpriteClickedN":function(d){return "po kliknutí na herce "+studio_locale.v(d,"spriteIndex")},
"whenSpriteClickedTooltip":function(d){return "Provést uvedené akce po kliknutí na herce."},
"whenSpriteCollidedN":function(d){return "když se herec "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "Provést uvedené akce když se herec dotkne jiného herce."},
"whenSpriteCollidedWith":function(d){return "dotkne"},
"whenSpriteCollidedWithAnyActor":function(d){return "dotkne jiného herce"},
"whenSpriteCollidedWithAnyEdge":function(d){return "dotkne okraje"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "dotkne střely"},
"whenSpriteCollidedWithAnything":function(d){return "dotkne čehokoliv"},
"whenSpriteCollidedWithN":function(d){return "dotkne herce "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "dotkne modré ohnivé koule"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "dotkne fialové ohnivé koule"},
"whenSpriteCollidedWithRedFireball":function(d){return "dotkne červené ohnivé koule"},
"whenSpriteCollidedWithYellowHearts":function(d){return "dotkne žlutých srdcí"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "dotkne fialových srdcí"},
"whenSpriteCollidedWithRedHearts":function(d){return "dotkne červených srdcí"},
"whenSpriteCollidedWithBottomEdge":function(d){return "dotkne dolního okraje"},
"whenSpriteCollidedWithLeftEdge":function(d){return "dotkne levého okraje"},
"whenSpriteCollidedWithRightEdge":function(d){return "dotkne pravého okraje"},
"whenSpriteCollidedWithTopEdge":function(d){return "dotkne horního okraje"},
"whenUp":function(d){return "když šipka nahoru"},
"whenUpTooltip":function(d){return "Spusť uvedené akce když je stisknutá klávesa \"nahoru\"."},
"yes":function(d){return "Ano"}};