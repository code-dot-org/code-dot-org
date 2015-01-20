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
},"da":function(n){return n===1?"one":"other"},"de":function(n){return n===1?"one":"other"},"el":function(n){return n===1?"one":"other"},"es":function(n){return n===1?"one":"other"},"et":function(n){return n===1?"one":"other"},"eu":function(n){return n===1?"one":"other"},"fa":function(n){return "other"},"fi":function(n){return n===1?"one":"other"},"fil":function(n){return n===0||n==1?"one":"other"},"fr":function(n){return Math.floor(n)===0||Math.floor(n)==1?"one":"other"},"he":function(n){return n===1?"one":"other"},"hi":function(n){return n===0||n==1?"one":"other"},"hr":function(n){
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
"actor":function(d){return "szereplő"},
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
"emotion":function(d){return "hangulat"},
"finalLevel":function(d){return "Gratulálok, megoldottad az utolsó feladatot."},
"for":function(d){return "ciklus"},
"hello":function(d){return "helló"},
"helloWorld":function(d){return "Helló világ!"},
"incrementPlayerScore":function(d){return "pontszám"},
"makeProjectileDisappear":function(d){return "eltűnik"},
"makeProjectileBounce":function(d){return "visszapattan"},
"makeProjectileBlueFireball":function(d){return "legyen kék a tűzgolyó"},
"makeProjectilePurpleFireball":function(d){return "legyen lila a tűzgolyó"},
"makeProjectileRedFireball":function(d){return "legyen piros a tűzgolyó"},
"makeProjectileYellowHearts":function(d){return "csinálj sárga szíveket"},
"makeProjectilePurpleHearts":function(d){return "csinálj lila szíveket"},
"makeProjectileRedHearts":function(d){return "csinálj piros szíveket"},
"makeProjectileTooltip":function(d){return "Állítsd be, hogy az éppen ütköző lövedék eltűnjön vagy visszapattanjon."},
"makeYourOwn":function(d){return "Készíts saját Play Lab alkalmazást"},
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
"moveSpriteN":function(d){return "mozgasd a "+appLocale.v(d,"spriteIndex")+". szereplőt"},
"toXY":function(d){return "to x,y"},
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
"projectileAnna":function(d){return "Anna"},
"projectileElsa":function(d){return "Elsa"},
"projectileHiro":function(d){return "Hiro"},
"projectileBaymax":function(d){return "Baymax"},
"projectileRapunzel":function(d){return "Rapunzel"},
"reinfFeedbackMsg":function(d){return "Nyomja meg a \"Játszd újra\" gombot hogy visszatérj a saját játékodhoz."},
"repeatForever":function(d){return "végtelen ismétlés"},
"repeatDo":function(d){return "csináld"},
"repeatForeverTooltip":function(d){return "Hajtsd vége a műveleteket a blokkban ismételve miközben a történet zajlik."},
"saySprite":function(d){return "mondd"},
"saySpriteN":function(d){return appLocale.v(d,"spriteIndex")+". szereplő mondja"},
"saySpriteTooltip":function(d){return "Ugorjon fel egy beszéd buborék, a megadott szereplő szövegével."},
"scoreText":function(d){return "Pontszám: "+appLocale.v(d,"playerScore")},
"setBackground":function(d){return "háttér beállítása"},
"setBackgroundRandom":function(d){return "változó háttér beállítása"},
"setBackgroundBlack":function(d){return "fekete háttér beállítása"},
"setBackgroundCave":function(d){return "barlangos háttér beállítása "},
"setBackgroundCloudy":function(d){return "felhős háttér beállítása"},
"setBackgroundHardcourt":function(d){return "salakos háttér beállítás"},
"setBackgroundNight":function(d){return "éjszakai háttér beállítása"},
"setBackgroundUnderwater":function(d){return "víz alatti háttér beállítása"},
"setBackgroundCity":function(d){return "város legyen a háttér"},
"setBackgroundDesert":function(d){return "sivatag legyen a háttér"},
"setBackgroundRainbow":function(d){return "szivárvány legyen a háttér"},
"setBackgroundSoccer":function(d){return "focis háttér beállítása"},
"setBackgroundSpace":function(d){return "űr háttér beállítása"},
"setBackgroundTennis":function(d){return "tenisz háttér beállítása"},
"setBackgroundWinter":function(d){return "téli háttér beállítása"},
"setBackgroundTooltip":function(d){return "Adja meg a háttér képet"},
"setEnemySpeed":function(d){return "ellenfél sebesség beállítása"},
"setPlayerSpeed":function(d){return "játékos sebességének beállítása"},
"setScoreText":function(d){return "Pontszám beállítása"},
"setScoreTextTooltip":function(d){return "A pontszám mezőben megjelenő szöveg beállítása."},
"setSpriteEmotionAngry":function(d){return "legyen mérges"},
"setSpriteEmotionHappy":function(d){return "boldogság"},
"setSpriteEmotionNormal":function(d){return "normál hangulat"},
"setSpriteEmotionRandom":function(d){return "véletlenszerű hangulat"},
"setSpriteEmotionSad":function(d){return "szomorú"},
"setSpriteEmotionTooltip":function(d){return "Karakter hangulatának beállítása"},
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
"setSpriteAnna":function(d){return "Anna képre"},
"setSpriteElsa":function(d){return "Elsa képre"},
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
"setSpritePositionTooltip":function(d){return "Egy karakter azonnal átkerül a megadott helyre."},
"setSpriteK1Tooltip":function(d){return "Megjeleníti vagy elrejti a megadott karaktert."},
"setSpriteTooltip":function(d){return "A szereplő külsejének beállítása"},
"setSpriteSizeRandom":function(d){return "véletlenszerű méretre"},
"setSpriteSizeVerySmall":function(d){return "nagyon kicsire"},
"setSpriteSizeSmall":function(d){return "kicsire"},
"setSpriteSizeNormal":function(d){return "átlagos méretűre"},
"setSpriteSizeLarge":function(d){return "nagyra"},
"setSpriteSizeVeryLarge":function(d){return "nagyon nagyra"},
"setSpriteSizeTooltip":function(d){return "a karakter méretének beállítása"},
"setSpriteSpeedRandom":function(d){return "véletlenszerű sebességre"},
"setSpriteSpeedVerySlow":function(d){return "nagyon lassú sebességre"},
"setSpriteSpeedSlow":function(d){return "lassú sebességre"},
"setSpriteSpeedNormal":function(d){return "normál sebességre"},
"setSpriteSpeedFast":function(d){return "gyors sebességre"},
"setSpriteSpeedVeryFast":function(d){return "nagyon gyors sebességre"},
"setSpriteSpeedTooltip":function(d){return "a karakter sebességének beállítása"},
"setSpriteZombie":function(d){return "zombivá"},
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
"setSpriteN":function(d){return appLocale.v(d,"spriteIndex")+". szereplő beállítása"},
"soundCrunch":function(d){return "ropogás"},
"soundGoal1":function(d){return "1. cél"},
"soundGoal2":function(d){return "2. cél"},
"soundHit":function(d){return "találat"},
"soundLosePoint":function(d){return "pont vesztés"},
"soundLosePoint2":function(d){return "2 pont vesztés"},
"soundRetro":function(d){return "retro"},
"soundRubber":function(d){return "gumi"},
"soundSlap":function(d){return "pofon"},
"soundWinPoint":function(d){return "pont nyerés"},
"soundWinPoint2":function(d){return "2 pont nyerés"},
"soundWood":function(d){return "fa"},
"speed":function(d){return "sebesség"},
"stopSprite":function(d){return "állj"},
"stopSpriteN":function(d){return "karakter megállítása "+appLocale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Szereplő mozgásának megállítása."},
"throwSprite":function(d){return "dob"},
"throwSpriteN":function(d){return appLocale.v(d,"spriteIndex")+". szereplő eldobás"},
"throwTooltip":function(d){return "Adott karakter dobja a lövedéket."},
"vanish":function(d){return "eltűnik"},
"vanishActorN":function(d){return appLocale.v(d,"spriteIndex")+". szereplő eltüntetése"},
"vanishTooltip":function(d){return "Eltünteti a szereplőt."},
"waitFor":function(d){return "Várj, míg"},
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
"whenArrowTooltip":function(d){return "Hajtsd végre az alábbi műveleteket, ha az adott nyil gombot megnyomják."},
"whenDown":function(d){return "Ha van lefelé nyíl"},
"whenDownTooltip":function(d){return "Végrehajtja az alábbi parancsokat, ha a lefelé nyíl le van nyomva."},
"whenGameStarts":function(d){return "amikor a történet kezdődik"},
"whenGameStartsTooltip":function(d){return "Hajtsd végre az alábbi műveleteket, a történet indulásakor."},
"whenLeft":function(d){return "Ha van balra nyíl"},
"whenLeftTooltip":function(d){return "Végrehajtja az alábbi parancsokat, ha a balra nyíl le van nyomva."},
"whenRight":function(d){return "Ha van jobbra nyíl"},
"whenRightTooltip":function(d){return "Végrehajtja az alábbi parancsokat, ha a jobbra nyíl le van nyomva."},
"whenSpriteClicked":function(d){return "amikor a szereplőre kattintunk"},
"whenSpriteClickedN":function(d){return "amikor a "+appLocale.v(d,"spriteIndex")+". szereplőre kattint"},
"whenSpriteClickedTooltip":function(d){return "Hajtsd végre az alábbi műveleteket, ha egy szereplőre kattintanak."},
"whenSpriteCollidedN":function(d){return "amikor a "+appLocale.v(d,"spriteIndex")+". szereplő"},
"whenSpriteCollidedTooltip":function(d){return "Hajtsd végre az alábbi műveleteket, ha az egyik szereplő hozzáér egy másikhoz."},
"whenSpriteCollidedWith":function(d){return "megérinti"},
"whenSpriteCollidedWithAnyActor":function(d){return "bármely szereplő érintése"},
"whenSpriteCollidedWithAnyEdge":function(d){return "bármely szegély érintése"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "bármely lövedék érintése"},
"whenSpriteCollidedWithAnything":function(d){return "bármi érintése"},
"whenSpriteCollidedWithN":function(d){return appLocale.v(d,"spriteIndex")+". szereplő érintése"},
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
"whenUp":function(d){return "Ha van felfelé nyíl"},
"whenUpTooltip":function(d){return "Végrehajtja az alábbi parancsokat, ha a felfelé nyíl le van nyomva."},
"yes":function(d){return "Igen"}};