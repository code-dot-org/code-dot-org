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
"actor":function(d){return "skodespelar"},
"alienInvasion":function(d){return "Romveseninvasjon!"},
"backgroundBlack":function(d){return "svart"},
"backgroundCave":function(d){return "hole"},
"backgroundCloudy":function(d){return "skya"},
"backgroundHardcourt":function(d){return "grusbane"},
"backgroundNight":function(d){return "natt"},
"backgroundUnderwater":function(d){return "undervass"},
"backgroundCity":function(d){return "by"},
"backgroundDesert":function(d){return "ørken"},
"backgroundRainbow":function(d){return "regnboge"},
"backgroundSoccer":function(d){return "fotball"},
"backgroundSpace":function(d){return "verdsommmet"},
"backgroundTennis":function(d){return "tennis"},
"backgroundWinter":function(d){return "vinter"},
"catActions":function(d){return "Handlinger"},
"catControl":function(d){return "Løkker"},
"catEvents":function(d){return "Hendelser"},
"catLogic":function(d){return "Logikk"},
"catMath":function(d){return "Matematikk"},
"catProcedures":function(d){return "Funksjoner"},
"catText":function(d){return "tekst"},
"catVariables":function(d){return "Variabler"},
"changeScoreTooltip":function(d){return "Legg til eller fjern eit poeng frå poengsummen."},
"changeScoreTooltipK1":function(d){return "Legg til eit poeng til poengsummen."},
"continue":function(d){return "Fortsett"},
"decrementPlayerScore":function(d){return "ta bort poeng"},
"defaultSayText":function(d){return "skriv her"},
"emotion":function(d){return "humør"},
"finalLevel":function(d){return "Gratulerer! Du har løst den siste oppgaven."},
"for":function(d){return "for"},
"hello":function(d){return "hallo"},
"helloWorld":function(d){return "Hei verda!"},
"incrementPlayerScore":function(d){return "score poeng"},
"makeProjectileDisappear":function(d){return "forsvinne"},
"makeProjectileBounce":function(d){return "sprett"},
"makeProjectileBlueFireball":function(d){return "lag blå eldkule"},
"makeProjectilePurpleFireball":function(d){return "lag lilla eldkule"},
"makeProjectileRedFireball":function(d){return "lag raud eldkule"},
"makeProjectileYellowHearts":function(d){return "lag gule hjarte"},
"makeProjectilePurpleHearts":function(d){return "lag lilla hjarte"},
"makeProjectileRedHearts":function(d){return "lag raude hjarte"},
"makeProjectileTooltip":function(d){return "Få prosjektilet som nett kolliderte til å forsvinne eller sprette."},
"makeYourOwn":function(d){return "Lag din eigen LeikeLab-app"},
"moveDirectionDown":function(d){return "ned"},
"moveDirectionLeft":function(d){return "venstre"},
"moveDirectionRight":function(d){return "høgre"},
"moveDirectionUp":function(d){return "opp"},
"moveDirectionRandom":function(d){return "tilfeldig"},
"moveDistance25":function(d){return "25 piksel"},
"moveDistance50":function(d){return "50 piksel"},
"moveDistance100":function(d){return "100 piksel"},
"moveDistance200":function(d){return "200 piksel"},
"moveDistance400":function(d){return "400 piksel"},
"moveDistancePixels":function(d){return "piksler"},
"moveDistanceRandom":function(d){return "tilfeldige piksel"},
"moveDistanceTooltip":function(d){return "Flytt ein skodepeler ein bestemd avstand i den gitte retninga."},
"moveSprite":function(d){return "flytt"},
"moveSpriteN":function(d){return "flytt skodespelar "+appLocale.v(d,"spriteIndex")},
"toXY":function(d){return "til x, y"},
"moveDown":function(d){return "flytt ned"},
"moveDownTooltip":function(d){return "Flytt ein skodespelar ned."},
"moveLeft":function(d){return "flytt til venstre"},
"moveLeftTooltip":function(d){return "Flytt ein skodespelar til venstre."},
"moveRight":function(d){return "flytt høyre"},
"moveRightTooltip":function(d){return "Flytt ein skodespelar til høyre."},
"moveUp":function(d){return "flytt opp"},
"moveUpTooltip":function(d){return "Flytt ein skodespelar opp."},
"moveTooltip":function(d){return "Flytt ein skodespelar."},
"nextLevel":function(d){return "Gratulerer! Du har fullført denne utfordringen."},
"no":function(d){return "Nei"},
"numBlocksNeeded":function(d){return "Denne utfordringen kan bli løst med %1 blokker."},
"onEventTooltip":function(d){return "Kjøre kode som svar på den angitte hendelsen."},
"ouchExclamation":function(d){return "Au!"},
"playSoundCrunch":function(d){return "Spill knase-lyd"},
"playSoundGoal1":function(d){return "spill mål-lyd 1"},
"playSoundGoal2":function(d){return "spill mål-lyd 2"},
"playSoundHit":function(d){return "spill treff-lyd"},
"playSoundLosePoint":function(d){return "spille miste poeng lyd"},
"playSoundLosePoint2":function(d){return "spille miste poeng 2 lyd"},
"playSoundRetro":function(d){return "spille retro lyd"},
"playSoundRubber":function(d){return "spel av gummi-lyd"},
"playSoundSlap":function(d){return "spel av smekke-lyd"},
"playSoundTooltip":function(d){return "Spill den valgte lyden."},
"playSoundWinPoint":function(d){return "spel av poeng-lyd"},
"playSoundWinPoint2":function(d){return "spel av poeng-lyd 2"},
"playSoundWood":function(d){return "Spel av tre-lyd"},
"positionOutTopLeft":function(d){return "til øvre venstre posisjon"},
"positionOutTopRight":function(d){return "til øvste høgre posisjon"},
"positionTopOutLeft":function(d){return "til posisjonen på toppen utanfor til venstre"},
"positionTopLeft":function(d){return "til øvste venstre posisjon"},
"positionTopCenter":function(d){return "til øvste midtre posisjon"},
"positionTopRight":function(d){return "til øvste høgre posisjon"},
"positionTopOutRight":function(d){return "til toppen utanfor høgre posisjon"},
"positionMiddleLeft":function(d){return "til midterste venstre posisjon"},
"positionMiddleCenter":function(d){return "til midterste posisjon i midten"},
"positionMiddleRight":function(d){return "til midterste høgre posisjon"},
"positionBottomOutLeft":function(d){return "til nedst utanfor høyre posisjon"},
"positionBottomLeft":function(d){return "til nedste venstre posisjon"},
"positionBottomCenter":function(d){return "til nedst i midten posisjon"},
"positionBottomRight":function(d){return "til nedste høgre posisjon"},
"positionBottomOutRight":function(d){return "til nedst utanfor høgre posisjon"},
"positionOutBottomLeft":function(d){return "til under nedste venstre posisjon"},
"positionOutBottomRight":function(d){return "til under nedste høgre posisjon"},
"positionRandom":function(d){return "til ein tilfeldig posisjon"},
"projectileBlueFireball":function(d){return "blå eldkule"},
"projectilePurpleFireball":function(d){return "lilla eldkule"},
"projectileRedFireball":function(d){return "raud eldkule"},
"projectileYellowHearts":function(d){return "gule hjerter"},
"projectilePurpleHearts":function(d){return "lilla hjerter"},
"projectileRedHearts":function(d){return "raude hjerter"},
"projectileRandom":function(d){return "tilfeldig"},
"projectileAnna":function(d){return "krok"},
"projectileElsa":function(d){return "gnistre"},
"projectileHiro":function(d){return "mikroboter"},
"projectileBaymax":function(d){return "rakett"},
"projectileRapunzel":function(d){return "kjele"},
"projectileCherry":function(d){return "kirsebær"},
"projectileIce":function(d){return "is"},
"projectileDuck":function(d){return "and"},
"reinfFeedbackMsg":function(d){return "Du kan trykke på \"Fortsett å spille\"-knappen for å gå tilbake til å spille din historie."},
"repeatForever":function(d){return "gjenta for alltid"},
"repeatDo":function(d){return "gjør"},
"repeatForeverTooltip":function(d){return "Utfør handlingane i denne blokka gjentatte gonger medan historia køyrer."},
"saySprite":function(d){return "sei"},
"saySpriteN":function(d){return "skodespelar "+appLocale.v(d,"spriteIndex")+" seier"},
"saySpriteTooltip":function(d){return "Vis ei snakkeboble med denne teksten frå den gjevne skodespelaren."},
"saySpriteChoices_0":function(d){return "Hei på deg."},
"saySpriteChoices_1":function(d){return "Hei, alle sammen."},
"saySpriteChoices_2":function(d){return "Hvordan har du det?"},
"saySpriteChoices_3":function(d){return "God morgen"},
"saySpriteChoices_4":function(d){return "God ettermiddag"},
"saySpriteChoices_5":function(d){return "God natt"},
"saySpriteChoices_6":function(d){return "God kveld"},
"saySpriteChoices_7":function(d){return "Noe nytt?"},
"saySpriteChoices_8":function(d){return "Hva?"},
"saySpriteChoices_9":function(d){return "Hvor?"},
"saySpriteChoices_10":function(d){return "Når?"},
"saySpriteChoices_11":function(d){return "Bra."},
"saySpriteChoices_12":function(d){return "Utmerket!"},
"saySpriteChoices_13":function(d){return "Greit."},
"saySpriteChoices_14":function(d){return "Ikke dårlig."},
"saySpriteChoices_15":function(d){return "Lykke til."},
"saySpriteChoices_16":function(d){return "Ja"},
"saySpriteChoices_17":function(d){return "Nei"},
"saySpriteChoices_18":function(d){return "OK"},
"saySpriteChoices_19":function(d){return "Bra kast!"},
"saySpriteChoices_20":function(d){return "Ha en fin dag."},
"saySpriteChoices_21":function(d){return "Farvel."},
"saySpriteChoices_22":function(d){return "Jeg er straks tilbake."},
"saySpriteChoices_23":function(d){return "Sees i morgen!"},
"saySpriteChoices_24":function(d){return "Vi ses!"},
"saySpriteChoices_25":function(d){return "Ta vare på deg selv!"},
"saySpriteChoices_26":function(d){return "Kos deg!"},
"saySpriteChoices_27":function(d){return "Jeg må gå."},
"saySpriteChoices_28":function(d){return "Skal vi være venner?"},
"saySpriteChoices_29":function(d){return "Bra jobba!"},
"saySpriteChoices_30":function(d){return "Hurra!"},
"saySpriteChoices_31":function(d){return "Ja!"},
"saySpriteChoices_32":function(d){return "Hyggelig å treffe deg."},
"saySpriteChoices_33":function(d){return "Greit!"},
"saySpriteChoices_34":function(d){return "Tusen takk"},
"saySpriteChoices_35":function(d){return "Nei, takk"},
"saySpriteChoices_36":function(d){return "Aaaaaah!"},
"saySpriteChoices_37":function(d){return "Glem det"},
"saySpriteChoices_38":function(d){return "I dag"},
"saySpriteChoices_39":function(d){return "I morgen"},
"saySpriteChoices_40":function(d){return "I går"},
"saySpriteChoices_41":function(d){return "Jeg fant deg!"},
"saySpriteChoices_42":function(d){return "Du fant meg!"},
"saySpriteChoices_43":function(d){return "10, 9, 8, 7, 6, 5, 4, 3, 2, 1!"},
"saySpriteChoices_44":function(d){return "Du er god!"},
"saySpriteChoices_45":function(d){return "Du er morsom!"},
"saySpriteChoices_46":function(d){return "Du er tullete! "},
"saySpriteChoices_47":function(d){return "Du er en god venn!"},
"saySpriteChoices_48":function(d){return "Se opp!"},
"saySpriteChoices_49":function(d){return "Dukk!"},
"saySpriteChoices_50":function(d){return "Tok deg!"},
"saySpriteChoices_51":function(d){return "Au!"},
"saySpriteChoices_52":function(d){return "Beklager!"},
"saySpriteChoices_53":function(d){return "Forsiktig!"},
"saySpriteChoices_54":function(d){return "OJ!"},
"saySpriteChoices_55":function(d){return "Oisann!"},
"saySpriteChoices_56":function(d){return "Du tok meg nesten!"},
"saySpriteChoices_57":function(d){return "Godt forsøk!"},
"saySpriteChoices_58":function(d){return "Du kan ikke ta meg!"},
"scoreText":function(d){return "Poengsum: "+appLocale.v(d,"playerScore")},
"setBackground":function(d){return "vis bakgrunn"},
"setBackgroundRandom":function(d){return "vis tilfeldig bakgrunn"},
"setBackgroundBlack":function(d){return "vis svart bakgrunn"},
"setBackgroundCave":function(d){return "vis hole-bagrunn"},
"setBackgroundCloudy":function(d){return "set skya bakgrunn"},
"setBackgroundHardcourt":function(d){return "set grusbane bakgrunn"},
"setBackgroundNight":function(d){return "vis natt bakgrunn"},
"setBackgroundUnderwater":function(d){return "vis undervass bakgrunn"},
"setBackgroundCity":function(d){return "vis by bakgrunn"},
"setBackgroundDesert":function(d){return "vis ørken bakgrunn"},
"setBackgroundRainbow":function(d){return "vis regnboge bakgrunn"},
"setBackgroundSoccer":function(d){return "vis fotball bakgrunn"},
"setBackgroundSpace":function(d){return "vis verdsrom bakgrunn"},
"setBackgroundTennis":function(d){return "vis tennis bakgrunn"},
"setBackgroundWinter":function(d){return "vis vinter bakgrunn"},
"setBackgroundLeafy":function(d){return "sett bladbakgrunn"},
"setBackgroundGrassy":function(d){return "sett gressbakgrunn"},
"setBackgroundFlower":function(d){return "sett blomsterbakgrunn"},
"setBackgroundTile":function(d){return "sett flisbakgrunn"},
"setBackgroundIcy":function(d){return "sett isbakgrunn"},
"setBackgroundSnowy":function(d){return "sett snøbakgrunn"},
"setBackgroundTooltip":function(d){return "Angir bakgrunnsbilde"},
"setEnemySpeed":function(d){return "set fiende fart"},
"setPlayerSpeed":function(d){return "set spelar fart"},
"setScoreText":function(d){return "Angi poengsum"},
"setScoreTextTooltip":function(d){return "Angi teksten som skal visast i poeng-feltet."},
"setSpriteEmotionAngry":function(d){return "til et sint humør"},
"setSpriteEmotionHappy":function(d){return "til blidt humør"},
"setSpriteEmotionNormal":function(d){return "til nøytralt humør"},
"setSpriteEmotionRandom":function(d){return "til tilfeldig humør"},
"setSpriteEmotionSad":function(d){return "til trist humør"},
"setSpriteEmotionTooltip":function(d){return "Set humøret til skodespelaren"},
"setSpriteAlien":function(d){return "til romvesen utsjånad"},
"setSpriteBat":function(d){return "til flaggermus utsjånad"},
"setSpriteBird":function(d){return "til fugle utsjånad"},
"setSpriteCat":function(d){return "til katte utsjånad"},
"setSpriteCaveBoy":function(d){return "til steinaldergut utsjånad"},
"setSpriteCaveGirl":function(d){return "til steinalderjente utsjånad"},
"setSpriteDinosaur":function(d){return "til dinosaur utsjånad"},
"setSpriteDog":function(d){return "til hunde utsjånad"},
"setSpriteDragon":function(d){return "til drage utsjånad"},
"setSpriteGhost":function(d){return "til spøkelse uutsjånad"},
"setSpriteHidden":function(d){return "til usynlig utsjånad"},
"setSpriteHideK1":function(d){return "gjøyme"},
"setSpriteAnna":function(d){return "til et Anna-utseende"},
"setSpriteElsa":function(d){return "til et Elsa-utseende"},
"setSpriteHiro":function(d){return "til Hiro-avatar"},
"setSpriteBaymax":function(d){return "til Baymax-avatar"},
"setSpriteRapunzel":function(d){return "til Rapunzel-avatar"},
"setSpriteKnight":function(d){return "til ridder utsjånad"},
"setSpriteMonster":function(d){return "til monster utsjånad"},
"setSpriteNinja":function(d){return "til ninja utsjånad"},
"setSpriteOctopus":function(d){return "til blekksprut utsjånad"},
"setSpritePenguin":function(d){return "til pingvin utsjånad"},
"setSpritePirate":function(d){return "til pirat utsjånad"},
"setSpritePrincess":function(d){return "til prinsesse utsjånad"},
"setSpriteRandom":function(d){return "til tilfeldig utsjånad"},
"setSpriteRobot":function(d){return "til robot utsjånad"},
"setSpriteShowK1":function(d){return "vis"},
"setSpriteSpacebot":function(d){return "til robot utsjånad"},
"setSpriteSoccerGirl":function(d){return "til fotballjente utsjånad"},
"setSpriteSoccerBoy":function(d){return "til fotballgut utsjånad"},
"setSpriteSquirrel":function(d){return "til ekorn utsjånad"},
"setSpriteTennisGirl":function(d){return "til tennisjente uutsjånad"},
"setSpriteTennisBoy":function(d){return "til tennisgutt utsjånad"},
"setSpriteUnicorn":function(d){return "til enhjøring utsjånad"},
"setSpriteWitch":function(d){return "til heks utsjånad"},
"setSpriteWizard":function(d){return "til trollmann utsjånad"},
"setSpritePositionTooltip":function(d){return "Flyttar ein skodespelar direkte til gitt plassering."},
"setSpriteK1Tooltip":function(d){return "Viser eller skjuler gitt skodespelar."},
"setSpriteTooltip":function(d){return "Set utsjånaden til skodespelar"},
"setSpriteSizeRandom":function(d){return "til tilfeldig storleik"},
"setSpriteSizeVerySmall":function(d){return "til veldig liten storleik"},
"setSpriteSizeSmall":function(d){return "til liten storleik"},
"setSpriteSizeNormal":function(d){return "til normal storleik"},
"setSpriteSizeLarge":function(d){return "til stor storleik"},
"setSpriteSizeVeryLarge":function(d){return "til veldig stor storleik"},
"setSpriteSizeTooltip":function(d){return "Set størrelsen på ein skodespelar"},
"setSpriteSpeedRandom":function(d){return "til ei tilfeldig fart"},
"setSpriteSpeedVerySlow":function(d){return "til ei svært sakte fart"},
"setSpriteSpeedSlow":function(d){return "til ei sakte fart"},
"setSpriteSpeedNormal":function(d){return "til ei normal fart"},
"setSpriteSpeedFast":function(d){return "til ei rask fart"},
"setSpriteSpeedVeryFast":function(d){return "til ei veldig rask fart"},
"setSpriteSpeedTooltip":function(d){return "Set farta til ein skodespelar"},
"setSpriteZombie":function(d){return "til zombie utsjånad"},
"shareStudioTwitter":function(d){return "Sjekk historia eg lagde. Eg skreiv ho sjølv med @codeorg"},
"shareGame":function(d){return "Del historia di:"},
"showCoordinates":function(d){return "vis koordinatar"},
"showCoordinatesTooltip":function(d){return "vis hovudpersonen sine koordinatar på skjermen"},
"showTitleScreen":function(d){return "vis tittelskjerm"},
"showTitleScreenTitle":function(d){return "tittel"},
"showTitleScreenText":function(d){return "tekst"},
"showTSDefTitle":function(d){return "skriv tittelen her"},
"showTSDefText":function(d){return "skriv teksten her"},
"showTitleScreenTooltip":function(d){return "Vis ein tittelskjerm med tilhørande tittel og tekst."},
"size":function(d){return "størrelse"},
"setSprite":function(d){return "sett"},
"setSpriteN":function(d){return "vis skodespelar "+appLocale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "knørve"},
"soundGoal1":function(d){return "mål 1"},
"soundGoal2":function(d){return "mål 2"},
"soundHit":function(d){return "treff"},
"soundLosePoint":function(d){return "miste poeng"},
"soundLosePoint2":function(d){return "miste poeng 2"},
"soundRetro":function(d){return "retro"},
"soundRubber":function(d){return "gummi"},
"soundSlap":function(d){return "slå"},
"soundWinPoint":function(d){return "vinne poeng"},
"soundWinPoint2":function(d){return "vinne poeng 2"},
"soundWood":function(d){return "tre"},
"speed":function(d){return "fart"},
"startSetValue":function(d){return "start (funksjon)"},
"startSetVars":function(d){return "spill_verdier (tittel, undertittel, bakgrunn, mål, fare, spiller)"},
"startSetFuncs":function(d){return "spill_funk(oppdater-mål, oppdater-fare, oppdater-spiller, kollider?, på-skjermen?)"},
"stopSprite":function(d){return "stopp"},
"stopSpriteN":function(d){return "stopp skodespelar "+appLocale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Stoppar rørslene til ein skodespelar."},
"throwSprite":function(d){return "kaste"},
"throwSpriteN":function(d){return "skodespelar kastar "+appLocale.v(d,"spriteIndex")},
"throwTooltip":function(d){return "Kastar eit prosjektil frå gitt skodespelar."},
"vanish":function(d){return "fjern"},
"vanishActorN":function(d){return "fjern skodespelar "+appLocale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "Fjernar skodespelaren."},
"waitFor":function(d){return "vent i"},
"waitSeconds":function(d){return "sekund"},
"waitForClick":function(d){return "vent på klikk"},
"waitForRandom":function(d){return "vent på tilfeldig"},
"waitForHalfSecond":function(d){return "vent i eit halvt sekund"},
"waitFor1Second":function(d){return "vent i 1 sekund"},
"waitFor2Seconds":function(d){return "vent i 2 sekund"},
"waitFor5Seconds":function(d){return "vent i fem sekund"},
"waitFor10Seconds":function(d){return "vent i 10 sekund"},
"waitParamsTooltip":function(d){return "Vent det gitte antall sekund, eller bruk null til å vente på eit klikk."},
"waitTooltip":function(d){return "Venter i gitt antall sekund eller på eit klikk."},
"whenArrowDown":function(d){return "pil ned"},
"whenArrowLeft":function(d){return "pil venstre"},
"whenArrowRight":function(d){return "pil høgre"},
"whenArrowUp":function(d){return "pil opp"},
"whenArrowTooltip":function(d){return "Utfør handlingane under når gitt piltaste blir trykt."},
"whenDown":function(d){return "Når pil ned"},
"whenDownTooltip":function(d){return "Utfør handlingene nedenfor når pil ned-tasten trykkes."},
"whenGameStarts":function(d){return "når historia startar"},
"whenGameStartsTooltip":function(d){return "Utfør handlingane nedenfor når historia startar."},
"whenLeft":function(d){return "Når venstre pil"},
"whenLeftTooltip":function(d){return "Utfør handlingene nedenfor når venstre pil-tasten trykkes."},
"whenRight":function(d){return "Når høyre pil"},
"whenRightTooltip":function(d){return "Utfør handlingene nedenfor når du trykker piltasten høyre."},
"whenSpriteClicked":function(d){return "når skodespelaren blir klikket"},
"whenSpriteClickedN":function(d){return "når skodespelar "+appLocale.v(d,"spriteIndex")+" blir klikka på"},
"whenSpriteClickedTooltip":function(d){return "Utfør handlingane under når ein skodespelar blir klikka på."},
"whenSpriteCollidedN":function(d){return "når skodespelar "+appLocale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "Utfør handlingane nedanfor når ein skodespelar rører ein annan skodespelar."},
"whenSpriteCollidedWith":function(d){return "rører"},
"whenSpriteCollidedWithAnyActor":function(d){return "rører ein skodespelar"},
"whenSpriteCollidedWithAnyEdge":function(d){return "rører ein kant"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "rører eit prosjektil"},
"whenSpriteCollidedWithAnything":function(d){return "rører noko"},
"whenSpriteCollidedWithN":function(d){return "rører skodespelar "+appLocale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "rører blå eldkule"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "rører lilla eldkule"},
"whenSpriteCollidedWithRedFireball":function(d){return "rører raud eldkule"},
"whenSpriteCollidedWithYellowHearts":function(d){return "rører gule hjerter"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "rører lilla hjerter"},
"whenSpriteCollidedWithRedHearts":function(d){return "berører raude hjerter"},
"whenSpriteCollidedWithBottomEdge":function(d){return "rører nedre kant"},
"whenSpriteCollidedWithLeftEdge":function(d){return "rører venstre kant"},
"whenSpriteCollidedWithRightEdge":function(d){return "rører høyre kant"},
"whenSpriteCollidedWithTopEdge":function(d){return "rører øvre kant"},
"whenUp":function(d){return "når pil opp"},
"whenUpTooltip":function(d){return "Utfør handlingane nedanfor når pil-opp-tasten blir trykt."},
"yes":function(d){return "Ja"}};