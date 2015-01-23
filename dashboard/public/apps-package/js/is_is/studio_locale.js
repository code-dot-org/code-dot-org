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
"actor":function(d){return "leikmaður"},
"alienInvasion":function(d){return "Innrás úr geimnum!"},
"backgroundBlack":function(d){return "svart"},
"backgroundCave":function(d){return "hellir"},
"backgroundCloudy":function(d){return "skýjað"},
"backgroundHardcourt":function(d){return "völlur"},
"backgroundNight":function(d){return "nótt"},
"backgroundUnderwater":function(d){return "neðansjávar"},
"backgroundCity":function(d){return "borg"},
"backgroundDesert":function(d){return "eyðimörk"},
"backgroundRainbow":function(d){return "regnbogi"},
"backgroundSoccer":function(d){return "fótbolti"},
"backgroundSpace":function(d){return "geimur"},
"backgroundTennis":function(d){return "tennis"},
"backgroundWinter":function(d){return "vetur"},
"catActions":function(d){return "Aðgerðir"},
"catControl":function(d){return "Lykkjur"},
"catEvents":function(d){return "Atvik"},
"catLogic":function(d){return "Rökvísi"},
"catMath":function(d){return "Reikningur"},
"catProcedures":function(d){return "Föll"},
"catText":function(d){return "texti"},
"catVariables":function(d){return "Breytur"},
"changeScoreTooltip":function(d){return "Hækka eða lækka skorið um eitt stig."},
"changeScoreTooltipK1":function(d){return "Hækka skorið um eitt stig."},
"continue":function(d){return "Áfram"},
"decrementPlayerScore":function(d){return "fjarlægja stig"},
"defaultSayText":function(d){return "skrifa hér"},
"emotion":function(d){return "skap"},
"finalLevel":function(d){return "Til hamingju! Þú hefur leyst síðustu þrautina."},
"for":function(d){return "frá"},
"hello":function(d){return "halló"},
"helloWorld":function(d){return "Halló heimur!"},
"incrementPlayerScore":function(d){return "skora stig"},
"makeProjectileDisappear":function(d){return "hverfa"},
"makeProjectileBounce":function(d){return "skoppa"},
"makeProjectileBlueFireball":function(d){return "láta bláan eldhnött"},
"makeProjectilePurpleFireball":function(d){return "láta fjólubláan eldhnött"},
"makeProjectileRedFireball":function(d){return "láta rauðan eldhnött"},
"makeProjectileYellowHearts":function(d){return "láta gul hjörtu"},
"makeProjectilePurpleHearts":function(d){return "láta fjólublá hjörtu"},
"makeProjectileRedHearts":function(d){return "láta rauð hjörtu"},
"makeProjectileTooltip":function(d){return "Láta skotið, sem var að rekast á, hverfa eða skoppa."},
"makeYourOwn":function(d){return "Búðu til þitt eigið Leikjasmiðjuforrit"},
"moveDirectionDown":function(d){return "niður"},
"moveDirectionLeft":function(d){return "vinstri"},
"moveDirectionRight":function(d){return "hægri"},
"moveDirectionUp":function(d){return "upp"},
"moveDirectionRandom":function(d){return "af handahófi"},
"moveDistance25":function(d){return "25 díla"},
"moveDistance50":function(d){return "50 díla"},
"moveDistance100":function(d){return "100 díla"},
"moveDistance200":function(d){return "200 díla"},
"moveDistance400":function(d){return "400 díla"},
"moveDistancePixels":function(d){return "dílar"},
"moveDistanceRandom":function(d){return "díla af handahófi"},
"moveDistanceTooltip":function(d){return "Færa leikmann tiltekna vegalengd í hina tilteknu stefnu."},
"moveSprite":function(d){return "færa"},
"moveSpriteN":function(d){return "færa leikmann "+appLocale.v(d,"spriteIndex")},
"toXY":function(d){return "to x,y"},
"moveDown":function(d){return "færa niður"},
"moveDownTooltip":function(d){return "Færa leikmann niður."},
"moveLeft":function(d){return "færa til vinstri"},
"moveLeftTooltip":function(d){return "Færa leikmann til vinstri."},
"moveRight":function(d){return "færa til hægri"},
"moveRightTooltip":function(d){return "Færa leikmann til hægri."},
"moveUp":function(d){return "færa upp"},
"moveUpTooltip":function(d){return "Færa leikmann upp."},
"moveTooltip":function(d){return "Færa leikmann."},
"nextLevel":function(d){return "Til hamingju! Þú hefur klárað þessa þraut."},
"no":function(d){return "Nei"},
"numBlocksNeeded":function(d){return "Þessa þraut er hægt að leysa með %1 kubbum."},
"ouchExclamation":function(d){return "Ááá!"},
"playSoundCrunch":function(d){return "spila brothljóð"},
"playSoundGoal1":function(d){return "spila markhljóð 1"},
"playSoundGoal2":function(d){return "spila markhljóð 2"},
"playSoundHit":function(d){return "spila áreksturshljóð"},
"playSoundLosePoint":function(d){return "spila stigatapshljóð 1"},
"playSoundLosePoint2":function(d){return "spila stigatapshljóð 2"},
"playSoundRetro":function(d){return "spila retro hljóð"},
"playSoundRubber":function(d){return "spila gúmmíhljóð"},
"playSoundSlap":function(d){return "spila skellhljóð"},
"playSoundTooltip":function(d){return "Spila valið hljóð."},
"playSoundWinPoint":function(d){return "spila stigaskorshljóð 1"},
"playSoundWinPoint2":function(d){return "spila stigaskorshljóð 2"},
"playSoundWood":function(d){return "spila viðarhljóð"},
"positionOutTopLeft":function(d){return "á stað ofan við efst til vinstri"},
"positionOutTopRight":function(d){return "á stað ofan við efst til hægri"},
"positionTopOutLeft":function(d){return "á stað utan við efst til vinstri"},
"positionTopLeft":function(d){return "á stað efst til vinstri"},
"positionTopCenter":function(d){return "á stað efst fyrir miðju"},
"positionTopRight":function(d){return "á stað efst til hægri"},
"positionTopOutRight":function(d){return "á stað utan við efst til hægri"},
"positionMiddleLeft":function(d){return "á stað fyrir miðju til vinstri"},
"positionMiddleCenter":function(d){return "á stað í miðju"},
"positionMiddleRight":function(d){return "á stað fyrir miðju til hægri"},
"positionBottomOutLeft":function(d){return "á stað utan við neðst til vinstri"},
"positionBottomLeft":function(d){return "á stað neðst til vinstri"},
"positionBottomCenter":function(d){return "á stað neðst fyrir miðju"},
"positionBottomRight":function(d){return "á stað neðst til hægri"},
"positionBottomOutRight":function(d){return "á stað utan við neðst til hægri"},
"positionOutBottomLeft":function(d){return "á stað neðan við neðst til vinstri"},
"positionOutBottomRight":function(d){return "á stað neðan við neðst til hægri"},
"positionRandom":function(d){return "á stað af handahófi"},
"projectileBlueFireball":function(d){return "bláan eldhnött"},
"projectilePurpleFireball":function(d){return "fjólubláan eldhnött"},
"projectileRedFireball":function(d){return "rauðan eldhnött"},
"projectileYellowHearts":function(d){return "gul hjörtu"},
"projectilePurpleHearts":function(d){return "fjólublá hjörtu"},
"projectileRedHearts":function(d){return "rauð hjörtu"},
"projectileRandom":function(d){return "af handahófi"},
"projectileAnna":function(d){return "Anna"},
"projectileElsa":function(d){return "Elsa"},
"projectileHiro":function(d){return "Hiro"},
"projectileBaymax":function(d){return "Baymax"},
"projectileRapunzel":function(d){return "Garðabrúða"},
"reinfFeedbackMsg":function(d){return "Þú getur ýtt á \"Reyna aftur\" hnappinn til að fara aftur í að spila söguna þína."},
"repeatForever":function(d){return "endurtaka endalaust"},
"repeatDo":function(d){return "gera"},
"repeatForeverTooltip":function(d){return "Endurtaka aðgerðirnar í þessari stæðu á meðan sagan keyrir."},
"saySprite":function(d){return "segja"},
"saySpriteN":function(d){return "leikmaður "+appLocale.v(d,"spriteIndex")+" segir"},
"saySpriteTooltip":function(d){return "Birta talblöðru með textanum sem tengist hinum tiltekna leikmanni."},
"scoreText":function(d){return "Stig alls: "+appLocale.v(d,"playerScore")},
"setBackground":function(d){return "hafa bakgrunn"},
"setBackgroundRandom":function(d){return "hafa bakgrunn af handahófi"},
"setBackgroundBlack":function(d){return "hafa svartan bakgrunn"},
"setBackgroundCave":function(d){return "hafa hellisbakgrunn"},
"setBackgroundCloudy":function(d){return "hafa skýjaðan bakgrunn"},
"setBackgroundHardcourt":function(d){return "hafa vallarbakgrunn"},
"setBackgroundNight":function(d){return "hafa næturbakgrunn"},
"setBackgroundUnderwater":function(d){return "hafa neðansjávarbakgrunn"},
"setBackgroundCity":function(d){return "hafa borgarbakgrunn"},
"setBackgroundDesert":function(d){return "hafa eyðimerkurbakgrunn"},
"setBackgroundRainbow":function(d){return "hafa regnbogabakgrunn"},
"setBackgroundSoccer":function(d){return "hafa fótboltabakgrunn"},
"setBackgroundSpace":function(d){return "hafa geimbakgrunn"},
"setBackgroundTennis":function(d){return "hafa tennisbakgrunn"},
"setBackgroundWinter":function(d){return "hafa vetrarbakgrunn"},
"setBackgroundTooltip":function(d){return "Stillir bakgrunnsmynd"},
"setEnemySpeed":function(d){return "stilla hraða óvinar"},
"setPlayerSpeed":function(d){return "stilla hraða leikmanns"},
"setScoreText":function(d){return "setja stig á"},
"setScoreTextTooltip":function(d){return "Stillir textann sem á að birtast á stigasvæðinu."},
"setSpriteEmotionAngry":function(d){return "í vondu skapi"},
"setSpriteEmotionHappy":function(d){return "í góðu skapi"},
"setSpriteEmotionNormal":function(d){return "í hlutlausu skapi"},
"setSpriteEmotionRandom":function(d){return "í skapi af handhófi"},
"setSpriteEmotionSad":function(d){return "í döpru skapi"},
"setSpriteEmotionTooltip":function(d){return "Stillir skap leikmanns"},
"setSpriteAlien":function(d){return "geimveru"},
"setSpriteBat":function(d){return "leðurblöku"},
"setSpriteBird":function(d){return "fugl"},
"setSpriteCat":function(d){return "kött"},
"setSpriteCaveBoy":function(d){return "hellisbúastrák"},
"setSpriteCaveGirl":function(d){return "hellisbúastelpu"},
"setSpriteDinosaur":function(d){return "risaeðlu"},
"setSpriteDog":function(d){return "hund"},
"setSpriteDragon":function(d){return "dreka"},
"setSpriteGhost":function(d){return "draug"},
"setSpriteHidden":function(d){return "falinn"},
"setSpriteHideK1":function(d){return "fela"},
"setSpriteAnna":function(d){return "Önnu"},
"setSpriteElsa":function(d){return "Elsu"},
"setSpriteHiro":function(d){return "Hiro"},
"setSpriteBaymax":function(d){return "Baymax"},
"setSpriteRapunzel":function(d){return "Garðabrúðu"},
"setSpriteKnight":function(d){return "riddara"},
"setSpriteMonster":function(d){return "skrímsli"},
"setSpriteNinja":function(d){return "grímuklædda ninju"},
"setSpriteOctopus":function(d){return "kolkrabba"},
"setSpritePenguin":function(d){return "mörgæs"},
"setSpritePirate":function(d){return "sjóræningja"},
"setSpritePrincess":function(d){return "prinsessu"},
"setSpriteRandom":function(d){return "af handahófi"},
"setSpriteRobot":function(d){return "vélmenni"},
"setSpriteShowK1":function(d){return "sýna"},
"setSpriteSpacebot":function(d){return "geimróbóta"},
"setSpriteSoccerGirl":function(d){return "fótboltastelpu"},
"setSpriteSoccerBoy":function(d){return "fótboltastrák"},
"setSpriteSquirrel":function(d){return "íkorna"},
"setSpriteTennisGirl":function(d){return "tennisstelpu"},
"setSpriteTennisBoy":function(d){return "tennisstrák"},
"setSpriteUnicorn":function(d){return "einhyrning"},
"setSpriteWitch":function(d){return "norn"},
"setSpriteWizard":function(d){return "vitka"},
"setSpritePositionTooltip":function(d){return "Færir leikmann samstundis á hinn tiltekna stað."},
"setSpriteK1Tooltip":function(d){return "Sýnir eða felur hinn tiltekna leikmann."},
"setSpriteTooltip":function(d){return "Stillir ímynd leikmanns"},
"setSpriteSizeRandom":function(d){return "stærð af handahófi"},
"setSpriteSizeVerySmall":function(d){return "mjög lítill"},
"setSpriteSizeSmall":function(d){return "lítill"},
"setSpriteSizeNormal":function(d){return "venjuleg stærð"},
"setSpriteSizeLarge":function(d){return "stór"},
"setSpriteSizeVeryLarge":function(d){return "mjög stór"},
"setSpriteSizeTooltip":function(d){return "Stillir stærð leikmanns"},
"setSpriteSpeedRandom":function(d){return "hraðan af handahófi"},
"setSpriteSpeedVerySlow":function(d){return "mjög hægan"},
"setSpriteSpeedSlow":function(d){return "hægan"},
"setSpriteSpeedNormal":function(d){return "miðlungshraðan"},
"setSpriteSpeedFast":function(d){return "hraðan"},
"setSpriteSpeedVeryFast":function(d){return "mjög hraðan"},
"setSpriteSpeedTooltip":function(d){return "Stillir hraða leikmanns"},
"setSpriteZombie":function(d){return "uppvakning"},
"shareStudioTwitter":function(d){return "Kíktu á söguna sem ég bjó til. Ég skrifaði hana með @codeorg"},
"shareGame":function(d){return "Deila sögunni þinni:"},
"showCoordinates":function(d){return "sýna hnit"},
"showCoordinatesTooltip":function(d){return "sýna hnit leikmanns á skjánum"},
"showTitleScreen":function(d){return "sýna titilskjá"},
"showTitleScreenTitle":function(d){return "titill"},
"showTitleScreenText":function(d){return "texti"},
"showTSDefTitle":function(d){return "skrifaðu titil hér"},
"showTSDefText":function(d){return "skrifaðu texta hér"},
"showTitleScreenTooltip":function(d){return "Sýna titilskjá með viðkomandi titli og texta."},
"size":function(d){return "stærð"},
"setSprite":function(d){return "setja"},
"setSpriteN":function(d){return "hafa leikmann "+appLocale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "kremja"},
"soundGoal1":function(d){return "mark 1"},
"soundGoal2":function(d){return "mark 2"},
"soundHit":function(d){return "í mark"},
"soundLosePoint":function(d){return "stigatap"},
"soundLosePoint2":function(d){return "stigatap 2"},
"soundRetro":function(d){return "retro"},
"soundRubber":function(d){return "gúmmí"},
"soundSlap":function(d){return "skellur"},
"soundWinPoint":function(d){return "stigaskor"},
"soundWinPoint2":function(d){return "stigaskor 2"},
"soundWood":function(d){return "viður"},
"speed":function(d){return "hraði"},
"stopSprite":function(d){return "stöðva"},
"stopSpriteN":function(d){return "stöðva leikmann "+appLocale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Stöðvar hreyfingu leikmanns."},
"throwSprite":function(d){return "senda"},
"throwSpriteN":function(d){return "leikmaður "+appLocale.v(d,"spriteIndex")+" sendir"},
"throwTooltip":function(d){return "Sendir skot frá tiltekna leikmanninum."},
"vanish":function(d){return "hverfa"},
"vanishActorN":function(d){return "leikmaður "+appLocale.v(d,"spriteIndex")+" hverfur"},
"vanishTooltip":function(d){return "Lætur leikmanninn hverfa."},
"waitFor":function(d){return "bíða í"},
"waitSeconds":function(d){return "sekúndur"},
"waitForClick":function(d){return "bíða eftir smelli"},
"waitForRandom":function(d){return "bíða handahófskennt"},
"waitForHalfSecond":function(d){return "bíða í hálfa sekúndu"},
"waitFor1Second":function(d){return "bíða í 1 sekúndu"},
"waitFor2Seconds":function(d){return "bíða í 2 sekúndur"},
"waitFor5Seconds":function(d){return "bíða í 5 sekúndur"},
"waitFor10Seconds":function(d){return "bíða í 10 sekúndur"},
"waitParamsTooltip":function(d){return "Bíður í hinn tiltekna fjölda sekúndna eða þar til smellt er ef núll er notað."},
"waitTooltip":function(d){return "Bíður í tiltekinn tíma eða þar til smellt er."},
"whenArrowDown":function(d){return "niður ör"},
"whenArrowLeft":function(d){return "vinstri ör"},
"whenArrowRight":function(d){return "hægri ör"},
"whenArrowUp":function(d){return "upp ör"},
"whenArrowTooltip":function(d){return "Gera aðgerðirnar fyrir neðan þegar ýtt er á hinn tiltekna örvarlykil."},
"whenDown":function(d){return "þegar niður ör"},
"whenDownTooltip":function(d){return "Gera aðgerðirnar fyrir neðan þegar ýtt er á örvarlykil niður."},
"whenGameStarts":function(d){return "þegar sagan byrjar"},
"whenGameStartsTooltip":function(d){return "Gera aðgerðirnar fyrir neðan þegar sagan byrjar."},
"whenLeft":function(d){return "þegar vinstri ör"},
"whenLeftTooltip":function(d){return "Gera aðgerðirnar fyrir neðan þegar ýtt er á örvarlykil til vinstri."},
"whenRight":function(d){return "þegar hægri ör"},
"whenRightTooltip":function(d){return "Gera aðgerðirnar fyrir neðan þegar ýtt er á örvarlykil til hægri."},
"whenSpriteClicked":function(d){return "þegar smellt á leikmanni"},
"whenSpriteClickedN":function(d){return "þegar smellt á leikmanni "+appLocale.v(d,"spriteIndex")},
"whenSpriteClickedTooltip":function(d){return "Gera aðgerðirnar fyrir neðan þegar smellt er á leikmanni."},
"whenSpriteCollidedN":function(d){return "þegar leikmaður "+appLocale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "Gera aðgerðirnar fyrir neðan þegar leikmaður snertir annan leikmann."},
"whenSpriteCollidedWith":function(d){return "snertir"},
"whenSpriteCollidedWithAnyActor":function(d){return "snertir einhvern leikmann"},
"whenSpriteCollidedWithAnyEdge":function(d){return "snertir einhverja brún"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "snertir eitthvert skot"},
"whenSpriteCollidedWithAnything":function(d){return "snertir eitthvað"},
"whenSpriteCollidedWithN":function(d){return "snertir leikmann "+appLocale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "snertir bláan eldhnött"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "snertir fjólubláan eldhnött"},
"whenSpriteCollidedWithRedFireball":function(d){return "snertir rauðan eldhnött"},
"whenSpriteCollidedWithYellowHearts":function(d){return "snertir gul hjörtu"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "snertir fjólublá hjörtu"},
"whenSpriteCollidedWithRedHearts":function(d){return "snertir rauð hjörtu"},
"whenSpriteCollidedWithBottomEdge":function(d){return "snertir neðri brún"},
"whenSpriteCollidedWithLeftEdge":function(d){return "snertir vinstri brún"},
"whenSpriteCollidedWithRightEdge":function(d){return "snertir hægri brún"},
"whenSpriteCollidedWithTopEdge":function(d){return "snertir efri brún"},
"whenUp":function(d){return "þegar upp ör"},
"whenUpTooltip":function(d){return "Gera aðgerðirnar fyrir neðan þegar ýtt er á örvarlykil upp."},
"yes":function(d){return "Já"}};