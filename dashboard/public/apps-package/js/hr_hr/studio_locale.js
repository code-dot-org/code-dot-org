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
"actor":function(d){return "lik"},
"alienInvasion":function(d){return "Napad vanzemaljaca!"},
"backgroundBlack":function(d){return "crno"},
"backgroundCave":function(d){return "špilja"},
"backgroundCloudy":function(d){return "oblačno"},
"backgroundHardcourt":function(d){return "tvrda podloga"},
"backgroundNight":function(d){return "noć"},
"backgroundUnderwater":function(d){return "pod vodom"},
"backgroundCity":function(d){return "grad"},
"backgroundDesert":function(d){return "pustinja"},
"backgroundRainbow":function(d){return "duga"},
"backgroundSoccer":function(d){return "nogomet"},
"backgroundSpace":function(d){return "svemir"},
"backgroundTennis":function(d){return "tenis"},
"backgroundWinter":function(d){return "zima"},
"catActions":function(d){return "Akcije"},
"catControl":function(d){return "Petlje"},
"catEvents":function(d){return "Događaji"},
"catLogic":function(d){return "Logika"},
"catMath":function(d){return "Matematika"},
"catProcedures":function(d){return "Funkcije"},
"catText":function(d){return "tekst"},
"catVariables":function(d){return "Varijable"},
"changeScoreTooltip":function(d){return "Dodaje ili oduzima bod."},
"changeScoreTooltipK1":function(d){return "Dodaje bod."},
"continue":function(d){return "Nastavi"},
"decrementPlayerScore":function(d){return "oduzmi bod"},
"defaultSayText":function(d){return "piši ovdje"},
"emotion":function(d){return "raspoloženje"},
"finalLevel":function(d){return "Čestitamo ! Riješili ste posljednji zadatak."},
"for":function(d){return "za"},
"hello":function(d){return "zdravo"},
"helloWorld":function(d){return "Zdravo, svijete!"},
"incrementPlayerScore":function(d){return "osvoji bod"},
"makeProjectileDisappear":function(d){return "nestati"},
"makeProjectileBounce":function(d){return "odskočiti"},
"makeProjectileBlueFireball":function(d){return "napravi plavu vatrenu kuglu"},
"makeProjectilePurpleFireball":function(d){return "napravi ljubičastu vatrenu kuglu"},
"makeProjectileRedFireball":function(d){return "napravi crvenu vatrenu kuglu"},
"makeProjectileYellowHearts":function(d){return "napravi žuta srca"},
"makeProjectilePurpleHearts":function(d){return "napravi ljubičasta srca"},
"makeProjectileRedHearts":function(d){return "napravi crvena srca"},
"makeProjectileTooltip":function(d){return "Napravi da projektil koji se sudario nestane ili da se odbije."},
"makeYourOwn":function(d){return "Napravi vlastitu igricu laboratorija"},
"moveDirectionDown":function(d){return "dolje"},
"moveDirectionLeft":function(d){return "lijevo"},
"moveDirectionRight":function(d){return "desno"},
"moveDirectionUp":function(d){return "gore"},
"moveDirectionRandom":function(d){return "slučajno odabran"},
"moveDistance25":function(d){return "25 piksela"},
"moveDistance50":function(d){return "50 piksela"},
"moveDistance100":function(d){return "100 piksela"},
"moveDistance200":function(d){return "200 piksela"},
"moveDistance400":function(d){return "400 piksela"},
"moveDistancePixels":function(d){return "pikseli"},
"moveDistanceRandom":function(d){return "nasumični broj piksela"},
"moveDistanceTooltip":function(d){return "Pomiče lik za zadanu udaljenost i u zadanom smjeru."},
"moveSprite":function(d){return "pomakni"},
"moveSpriteN":function(d){return "pomakni lik "+appLocale.v(d,"spriteIndex")},
"toXY":function(d){return "na x,y"},
"moveDown":function(d){return "pomakni dolje"},
"moveDownTooltip":function(d){return "Pomiče lik dolje."},
"moveLeft":function(d){return "pomakni lijevo"},
"moveLeftTooltip":function(d){return "Pomiče lik ulijevo."},
"moveRight":function(d){return "pomakni desno"},
"moveRightTooltip":function(d){return "Pomiče lik udesno."},
"moveUp":function(d){return "pomakni gore"},
"moveUpTooltip":function(d){return "Pomiče lik gore."},
"moveTooltip":function(d){return "Pomiče lik."},
"nextLevel":function(d){return "Čestitamo! Ovaj zadatak je riješen."},
"no":function(d){return "Ne"},
"numBlocksNeeded":function(d){return "Ovaj zadatak se može riješiti s %1 blokova."},
"ouchExclamation":function(d){return "Jao!"},
"playSoundCrunch":function(d){return "pokreni zvuk krckanja"},
"playSoundGoal1":function(d){return "pokreni zvuk cilj 1"},
"playSoundGoal2":function(d){return "pokreni zvuk cilj 2"},
"playSoundHit":function(d){return "pokreni zvuk udara"},
"playSoundLosePoint":function(d){return "pokreni zvuk gubitak boda"},
"playSoundLosePoint2":function(d){return "pokreni zvuk izgubljen bod 2"},
"playSoundRetro":function(d){return "pokreni retro zvuk"},
"playSoundRubber":function(d){return "pokreni zvuk gume"},
"playSoundSlap":function(d){return "pokreni zvuk pljeska"},
"playSoundTooltip":function(d){return "Pokreni odabrani zvuk."},
"playSoundWinPoint":function(d){return "pokreni zvuk dobiveni bod"},
"playSoundWinPoint2":function(d){return "pokreni zvuk dobiven bod 2"},
"playSoundWood":function(d){return "pokreni zvuk drvo"},
"positionOutTopLeft":function(d){return "na položaj iznad gore lijevo"},
"positionOutTopRight":function(d){return "na položaj iznad gore desno"},
"positionTopOutLeft":function(d){return "na položaj izvana gore lijevo"},
"positionTopLeft":function(d){return "na položaj gore lijevo"},
"positionTopCenter":function(d){return "na položaj gore u sredinu"},
"positionTopRight":function(d){return "na položaj gore desno"},
"positionTopOutRight":function(d){return "na položaj izvana gore desno"},
"positionMiddleLeft":function(d){return "na položaj u sredinu lijevo"},
"positionMiddleCenter":function(d){return "na položaj u sredinu sredine"},
"positionMiddleRight":function(d){return "na položaj u sredinu desno"},
"positionBottomOutLeft":function(d){return "na položaj izvana dolje lijevo"},
"positionBottomLeft":function(d){return "na položaj dolje lijevo"},
"positionBottomCenter":function(d){return "na položaj dolje u sredinu"},
"positionBottomRight":function(d){return "na položaj dolje desno"},
"positionBottomOutRight":function(d){return "na položaj izvana dolje desno"},
"positionOutBottomLeft":function(d){return "na položaj ispod dolje lijevo"},
"positionOutBottomRight":function(d){return "na položaj ispod dolje desno"},
"positionRandom":function(d){return "na nasumično odabran položaj"},
"projectileBlueFireball":function(d){return "plava vatrena kugla"},
"projectilePurpleFireball":function(d){return "ljubičasta vatrena kugla"},
"projectileRedFireball":function(d){return "crvena vatrena kugla"},
"projectileYellowHearts":function(d){return "žuta srca"},
"projectilePurpleHearts":function(d){return "ljubičasta srca"},
"projectileRedHearts":function(d){return "crvena srca"},
"projectileRandom":function(d){return "slučajno odabran"},
"projectileAnna":function(d){return "Anna"},
"projectileElsa":function(d){return "Elsa"},
"projectileHiro":function(d){return "Hiro"},
"projectileBaymax":function(d){return "raketa"},
"projectileRapunzel":function(d){return "Rapunzel"},
"projectileCherry":function(d){return "trešnja"},
"projectileIce":function(d){return "led"},
"projectileDuck":function(d){return "patka"},
"reinfFeedbackMsg":function(d){return "Pritisni tipku \"Pokušaj ponovno\" da se vratiš na igru."},
"repeatForever":function(d){return "ponavljaj zauvijek"},
"repeatDo":function(d){return "napravi"},
"repeatForeverTooltip":function(d){return "Opetovano izvršava akcije u bloku, dok god se program izvršava."},
"saySprite":function(d){return "reći"},
"saySpriteN":function(d){return "lik "+appLocale.v(d,"spriteIndex")+" kaže"},
"saySpriteTooltip":function(d){return "Zadanom liku stvara strip-oblačić s pripadnim tekstom."},
"saySpriteChoices_1":function(d){return "Bok!"},
"saySpriteChoices_2":function(d){return "Kako si?"},
"saySpriteChoices_3":function(d){return "Ovo je zabavno..."},
"scoreText":function(d){return "Rezultat: "+appLocale.v(d,"playerScore")},
"setBackground":function(d){return "postavi pozadinu"},
"setBackgroundRandom":function(d){return "postavi nasumično odabranu pozadinu"},
"setBackgroundBlack":function(d){return "postavi crnu pozadinu"},
"setBackgroundCave":function(d){return "postavi pozadinu špilja"},
"setBackgroundCloudy":function(d){return "postavi oblačnu pozadinu"},
"setBackgroundHardcourt":function(d){return "postavi pozadinu beton"},
"setBackgroundNight":function(d){return "postavi noćnu pozadinu"},
"setBackgroundUnderwater":function(d){return "postavi pozadinu pod vodom"},
"setBackgroundCity":function(d){return "postavi gradsku pozadinu"},
"setBackgroundDesert":function(d){return "postavi pustinjsku pozadinu"},
"setBackgroundRainbow":function(d){return "postavi pozadinu s dugom"},
"setBackgroundSoccer":function(d){return "postavi nogomentu pozadinu"},
"setBackgroundSpace":function(d){return "postavi svemirsku pozadinu"},
"setBackgroundTennis":function(d){return "postavi tenisku pozadinu"},
"setBackgroundWinter":function(d){return "postavi zimsku pozadinu"},
"setBackgroundLeafy":function(d){return "set leafy background"},
"setBackgroundGrassy":function(d){return "set grassy background"},
"setBackgroundFlower":function(d){return "set flower background"},
"setBackgroundTile":function(d){return "set tile background"},
"setBackgroundIcy":function(d){return "set icy background"},
"setBackgroundSnowy":function(d){return "set snowy background"},
"setBackgroundTooltip":function(d){return "Postavlja sliku pozadine"},
"setEnemySpeed":function(d){return "postavi brzinu neprijatelja"},
"setPlayerSpeed":function(d){return "postavi brzinu igrača"},
"setScoreText":function(d){return "postavi rezultat"},
"setScoreTextTooltip":function(d){return "Postavlja tekst koji će biti prikazan u području bodova."},
"setSpriteEmotionAngry":function(d){return "ljutito raspoloženje"},
"setSpriteEmotionHappy":function(d){return "sretno raspoloženje"},
"setSpriteEmotionNormal":function(d){return "normalno raspoloženje"},
"setSpriteEmotionRandom":function(d){return "nasumično odabrano raspoloženje"},
"setSpriteEmotionSad":function(d){return "žalosno raspoloženje"},
"setSpriteEmotionTooltip":function(d){return "Postavlja raspoloženje lika"},
"setSpriteAlien":function(d){return "izgled vanzemaljca"},
"setSpriteBat":function(d){return "izgled šišmiša"},
"setSpriteBird":function(d){return "izgled ptice"},
"setSpriteCat":function(d){return "izgled mačke"},
"setSpriteCaveBoy":function(d){return "izgled špiljskog dječaka"},
"setSpriteCaveGirl":function(d){return "izgled špiljske djevojčice"},
"setSpriteDinosaur":function(d){return "izgled dinosaura"},
"setSpriteDog":function(d){return "izgled psa"},
"setSpriteDragon":function(d){return "izgled zmaja"},
"setSpriteGhost":function(d){return "izgled duha"},
"setSpriteHidden":function(d){return "skrivena slika"},
"setSpriteHideK1":function(d){return "sakrij"},
"setSpriteAnna":function(d){return "slika Anne"},
"setSpriteElsa":function(d){return "slika Else"},
"setSpriteHiro":function(d){return "slika Hiroa"},
"setSpriteBaymax":function(d){return "slika Baymaxa"},
"setSpriteRapunzel":function(d){return "slika Rapunzela"},
"setSpriteKnight":function(d){return "izgled viteza"},
"setSpriteMonster":function(d){return "izgled čudovišta"},
"setSpriteNinja":function(d){return "izgled maskiranog ninje"},
"setSpriteOctopus":function(d){return "izgled hobotnice"},
"setSpritePenguin":function(d){return "izgled pingvina"},
"setSpritePirate":function(d){return "izgled gusara"},
"setSpritePrincess":function(d){return "izgled princeze"},
"setSpriteRandom":function(d){return "nasumična slika"},
"setSpriteRobot":function(d){return "izgled robota"},
"setSpriteShowK1":function(d){return "prikaži"},
"setSpriteSpacebot":function(d){return "izgled svemirca"},
"setSpriteSoccerGirl":function(d){return "izgled nogometašice"},
"setSpriteSoccerBoy":function(d){return "izgled nogometaša"},
"setSpriteSquirrel":function(d){return "izgled vjeverice"},
"setSpriteTennisGirl":function(d){return "izgled tenisačice"},
"setSpriteTennisBoy":function(d){return "izgled tenisača"},
"setSpriteUnicorn":function(d){return "izgled jednoroga"},
"setSpriteWitch":function(d){return "izgled vještice"},
"setSpriteWizard":function(d){return "izgled čarobnjaka"},
"setSpritePositionTooltip":function(d){return "Odmah premješta lik na zadanu poziciju."},
"setSpriteK1Tooltip":function(d){return "Prikazuje ili skriva zadani lik."},
"setSpriteTooltip":function(d){return "Postavlja izgled lika"},
"setSpriteSizeRandom":function(d){return "na nasumično odabranu veličinu"},
"setSpriteSizeVerySmall":function(d){return "na veoma malu veličinu"},
"setSpriteSizeSmall":function(d){return "na malu veličinu"},
"setSpriteSizeNormal":function(d){return "na normalnu veličinu"},
"setSpriteSizeLarge":function(d){return "na veliku veličinu"},
"setSpriteSizeVeryLarge":function(d){return "na veoma veliku veličinu"},
"setSpriteSizeTooltip":function(d){return "Postavlja veličinu lika"},
"setSpriteSpeedRandom":function(d){return "na nasumično odabranu brzinu"},
"setSpriteSpeedVerySlow":function(d){return "za jako sporu brzinu"},
"setSpriteSpeedSlow":function(d){return "za sporu brzinu"},
"setSpriteSpeedNormal":function(d){return "za normalnu brzinu"},
"setSpriteSpeedFast":function(d){return "za brzu brzinu"},
"setSpriteSpeedVeryFast":function(d){return "za jako brzu brzinu"},
"setSpriteSpeedTooltip":function(d){return "Postavlja brzinu lika"},
"setSpriteZombie":function(d){return "izgled zombija"},
"shareStudioTwitter":function(d){return "Pogledaj priču koju sam smislio/la. Napisao/la sam je sam/a s @codeorg"},
"shareGame":function(d){return "Podijeli svoju priču:"},
"showCoordinates":function(d){return "pokaži koordinate"},
"showCoordinatesTooltip":function(d){return "na ekranu pokazuje koordinate glavnog lika"},
"showTitleScreen":function(d){return "pokaži početni ekran"},
"showTitleScreenTitle":function(d){return "naslov"},
"showTitleScreenText":function(d){return "tekst"},
"showTSDefTitle":function(d){return "ovdje napiši naslov"},
"showTSDefText":function(d){return "ovdje napiši tekst"},
"showTitleScreenTooltip":function(d){return "Pokazuje početni ekran s odgovarajućim naslovom i tekstom."},
"size":function(d){return "veličina"},
"setSprite":function(d){return "postaviti"},
"setSpriteN":function(d){return "postavi lik "+appLocale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "krckati"},
"soundGoal1":function(d){return "cilj 1"},
"soundGoal2":function(d){return "cilj 2"},
"soundHit":function(d){return "pogodak"},
"soundLosePoint":function(d){return "izgubljen bod"},
"soundLosePoint2":function(d){return "izgubljen bod 2"},
"soundRetro":function(d){return "retro"},
"soundRubber":function(d){return "guma"},
"soundSlap":function(d){return "pljuska"},
"soundWinPoint":function(d){return "osvojen bod"},
"soundWinPoint2":function(d){return "osvojen bod 2"},
"soundWood":function(d){return "drvo"},
"speed":function(d){return "brzina"},
"startSetValue":function(d){return "start (rocket-height function)"},
"startSetVars":function(d){return "game_vars (title, subtitle, background, target, danger, player)"},
"startSetFuncs":function(d){return "game_funcs (update-target, update-danger, update-player, collide?, on-screen?)"},
"stopSprite":function(d){return "zaustaviti"},
"stopSpriteN":function(d){return "zaustavi lik "+appLocale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Zaustavlja kretanje lika."},
"throwSprite":function(d){return "baciti"},
"throwSpriteN":function(d){return "lik "+appLocale.v(d,"spriteIndex")+" baca"},
"throwTooltip":function(d){return "Baca projektil iz odabranog lika."},
"vanish":function(d){return "nestati"},
"vanishActorN":function(d){return "nestaje lik "+appLocale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "Čini da lik nestane."},
"waitFor":function(d){return "čekaj"},
"waitSeconds":function(d){return "sekunde"},
"waitForClick":function(d){return "čekaj klik"},
"waitForRandom":function(d){return "čekaj nasumično dugo"},
"waitForHalfSecond":function(d){return "čekaj pola sekunde"},
"waitFor1Second":function(d){return "čekaj 1 sekundu"},
"waitFor2Seconds":function(d){return "čekaj 2 sekunde"},
"waitFor5Seconds":function(d){return "čekaj 5 sekundi"},
"waitFor10Seconds":function(d){return "čekaj 10 sekundi"},
"waitParamsTooltip":function(d){return "Čeka određeni broj sekundi ili koristi nulu da bi čekao dok se ne klikne."},
"waitTooltip":function(d){return "Čeka određeno vrijeme ili dok se ne klikne."},
"whenArrowDown":function(d){return "strelica dolje"},
"whenArrowLeft":function(d){return "strelica lijevo"},
"whenArrowRight":function(d){return "strelica desno"},
"whenArrowUp":function(d){return "strelica gore"},
"whenArrowTooltip":function(d){return "Izvršava dolje navedene akcije kada se pritisne određena tipka sa strelicom."},
"whenDown":function(d){return "kad strelica dolje"},
"whenDownTooltip":function(d){return "Izvrši sljedeće akcije kad se pritisne tipka dolje."},
"whenGameStarts":function(d){return "kad priča započne"},
"whenGameStartsTooltip":function(d){return "Izvršava sljedeće akcije kad priča započne."},
"whenLeft":function(d){return "kad lijeva strelica"},
"whenLeftTooltip":function(d){return "Izvrši sljedeće akcije kad se pritisne lijeva strelica."},
"whenRight":function(d){return "kad desna strelica"},
"whenRightTooltip":function(d){return "Izvrši sljedeće akcije kad se pritisne desna strelica."},
"whenSpriteClicked":function(d){return "kada se klikne lik"},
"whenSpriteClickedN":function(d){return "kada se klikne "+appLocale.v(d,"spriteIndex")+" lik"},
"whenSpriteClickedTooltip":function(d){return "Izvršava dolje navedene akcije kada se klikne lik."},
"whenSpriteCollidedN":function(d){return "kada lik "+appLocale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "Izvršava dolje navedene akcije kada lik takne neki drugi lik."},
"whenSpriteCollidedWith":function(d){return "dotaknuti"},
"whenSpriteCollidedWithAnyActor":function(d){return "dotakne bilo koji lik"},
"whenSpriteCollidedWithAnyEdge":function(d){return "dotakne bilo koji rub"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "dotakne bilo koji projektil"},
"whenSpriteCollidedWithAnything":function(d){return "dotakne bilo što"},
"whenSpriteCollidedWithN":function(d){return "dotakne lik "+appLocale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "dotakne plavu vatrenu kuglu"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "dotakne ljubičastu vatrenu kuglu"},
"whenSpriteCollidedWithRedFireball":function(d){return "dotakne crvenu vatrenu kuglu"},
"whenSpriteCollidedWithYellowHearts":function(d){return "dotakne žuta srca"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "dotakne ljubičasta srca"},
"whenSpriteCollidedWithRedHearts":function(d){return "dotakne crvena srca"},
"whenSpriteCollidedWithBottomEdge":function(d){return "dotakne donji rub"},
"whenSpriteCollidedWithLeftEdge":function(d){return "dotakne lijevu rub"},
"whenSpriteCollidedWithRightEdge":function(d){return "dotakne desni rub"},
"whenSpriteCollidedWithTopEdge":function(d){return "dotakne gornji rub"},
"whenUp":function(d){return "kad strelica gore"},
"whenUpTooltip":function(d){return "Izvrši sljedeće akcije kad se pritisne strelica gore."},
"yes":function(d){return "Da"}};