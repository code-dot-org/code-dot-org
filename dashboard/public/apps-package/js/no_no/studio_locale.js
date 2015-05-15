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
"actor":function(d){return "figur"},
"alienInvasion":function(d){return "Romveseninvasjon!"},
"backgroundBlack":function(d){return "svart"},
"backgroundCave":function(d){return "hule"},
"backgroundCloudy":function(d){return "overskyet"},
"backgroundHardcourt":function(d){return "grusbane"},
"backgroundNight":function(d){return "natt"},
"backgroundUnderwater":function(d){return "undervanns"},
"backgroundCity":function(d){return "by"},
"backgroundDesert":function(d){return "ørken"},
"backgroundRainbow":function(d){return "regnbue"},
"backgroundSoccer":function(d){return "fotball"},
"backgroundSpace":function(d){return "verdensrommmet"},
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
"changeScoreTooltip":function(d){return "Legge til eller fjerne et poeng fra poengsummen."},
"changeScoreTooltipK1":function(d){return "Legg til ett poeng til poengsummen."},
"continue":function(d){return "Fortsett"},
"decrementPlayerScore":function(d){return "Fjern punkt"},
"defaultSayText":function(d){return "Skriv her"},
"emotion":function(d){return "humør"},
"finalLevel":function(d){return "Gratulerer! Du har løst den siste oppgaven."},
"for":function(d){return "for"},
"hello":function(d){return "hallo"},
"helloWorld":function(d){return "Hei, verden!"},
"incrementPlayerScore":function(d){return "score poeng"},
"makeProjectileDisappear":function(d){return "forsvinne"},
"makeProjectileBounce":function(d){return "sprett"},
"makeProjectileBlueFireball":function(d){return "lag blå ildkule"},
"makeProjectilePurpleFireball":function(d){return "lag lilla ildkule"},
"makeProjectileRedFireball":function(d){return "lag rød ildkule"},
"makeProjectileYellowHearts":function(d){return "lag gule hjerter"},
"makeProjectilePurpleHearts":function(d){return "lag lilla hjerter"},
"makeProjectileRedHearts":function(d){return "lag røde hjerter"},
"makeProjectileTooltip":function(d){return "Gjøre prosjektil som bare kolliderte forsvinner eller spretter."},
"makeYourOwn":function(d){return "Lag Din Egen LekeLab-App"},
"moveDirectionDown":function(d){return "ned"},
"moveDirectionLeft":function(d){return "venstre"},
"moveDirectionRight":function(d){return "høyre"},
"moveDirectionUp":function(d){return "opp"},
"moveDirectionRandom":function(d){return "tilfeldig"},
"moveDistance25":function(d){return "25 piksler"},
"moveDistance50":function(d){return "50 piksler"},
"moveDistance100":function(d){return "100 piksler"},
"moveDistance200":function(d){return "200 piksler"},
"moveDistance400":function(d){return "400 piksler"},
"moveDistancePixels":function(d){return "piksler"},
"moveDistanceRandom":function(d){return "tilfeldige piksler"},
"moveDistanceTooltip":function(d){return "Flytt en skuespiller en bestemt avstand i den angitte retningen."},
"moveSprite":function(d){return "flytt"},
"moveSpriteN":function(d){return "flytte skuespiller "+studio_locale.v(d,"spriteIndex")},
"toXY":function(d){return "til x, y"},
"moveDown":function(d){return "flytt ned"},
"moveDownTooltip":function(d){return "Flytt en skuespiller ned."},
"moveLeft":function(d){return "flytt til venstre"},
"moveLeftTooltip":function(d){return "flytt en skuespiller til venstre."},
"moveRight":function(d){return "flytt til høyre"},
"moveRightTooltip":function(d){return "flytt en skuespiller til høyre."},
"moveUp":function(d){return "flytt opp"},
"moveUpTooltip":function(d){return "flytt en skuespiller opp."},
"moveTooltip":function(d){return "flytt en skuespiller."},
"nextLevel":function(d){return "Gratulerer! Du har fullført denne oppgaven."},
"no":function(d){return "Nei"},
"numBlocksNeeded":function(d){return "Denne oppgaven kan løses med %1 blokker."},
"onEventTooltip":function(d){return "Kjøre kode som svar på den angitte hendelsen."},
"ouchExclamation":function(d){return "Au!"},
"playSoundCrunch":function(d){return "Spill knase-lyd"},
"playSoundGoal1":function(d){return "spill mål-lyd 1"},
"playSoundGoal2":function(d){return "spill mål-lyd 2"},
"playSoundHit":function(d){return "spill treff-lyd"},
"playSoundLosePoint":function(d){return "spille miste poeng lyd"},
"playSoundLosePoint2":function(d){return "spille miste poeng 2 lyd"},
"playSoundRetro":function(d){return "spill retro-lyd"},
"playSoundRubber":function(d){return "spill gummi-lyd"},
"playSoundSlap":function(d){return "spill smekke-lyd"},
"playSoundTooltip":function(d){return "Spill den valgte lyden."},
"playSoundWinPoint":function(d){return "spill poeng-lyd"},
"playSoundWinPoint2":function(d){return "spill poeng-lyd 2"},
"playSoundWood":function(d){return "Spill tre-lyd"},
"positionOutTopLeft":function(d){return "over øverst venstre posisjon"},
"positionOutTopRight":function(d){return "til posisjonen over høyre topplassering"},
"positionTopOutLeft":function(d){return "til posisjonen på toppen utenfor venstre"},
"positionTopLeft":function(d){return "til øverste venstre posisjon"},
"positionTopCenter":function(d){return "til øverste midtre posisjon"},
"positionTopRight":function(d){return "til øverste høyre posisjon"},
"positionTopOutRight":function(d){return "til toppen utenfor høyre posisjon"},
"positionMiddleLeft":function(d){return "til midterste venstre posisjon"},
"positionMiddleCenter":function(d){return "til midterste posisjon i midten"},
"positionMiddleRight":function(d){return "til midterste høyre posisjon"},
"positionBottomOutLeft":function(d){return "til nederst utenfor høyre posisjon"},
"positionBottomLeft":function(d){return "til nederste venstre posisjon"},
"positionBottomCenter":function(d){return "til nederst i midten posisjon"},
"positionBottomRight":function(d){return "til nederst til høyre posisjon"},
"positionBottomOutRight":function(d){return "til nederst utenfor høyre posisjon"},
"positionOutBottomLeft":function(d){return "til under nederste venstre posisjon"},
"positionOutBottomRight":function(d){return "til under nederste høyre posisjon"},
"positionRandom":function(d){return "til den tilfeldige posisjonen"},
"projectileBlueFireball":function(d){return "blå ildkule"},
"projectilePurpleFireball":function(d){return "lilla ildkule"},
"projectileRedFireball":function(d){return "rød ildkule"},
"projectileYellowHearts":function(d){return "gule hjerter"},
"projectilePurpleHearts":function(d){return "lilla hjerter"},
"projectileRedHearts":function(d){return "røde hjerter"},
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
"repeatForeverTooltip":function(d){return "Utfør handlingne i denne blokken gjentatte ganger mens historien kjører."},
"saySprite":function(d){return "Sier"},
"saySpriteN":function(d){return "skuespiller "+studio_locale.v(d,"spriteIndex")+" sier"},
"saySpriteTooltip":function(d){return "Sprett opp en snakkeboble med den tilhørende teksten fra den spesifiserte aktøren."},
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
"scoreText":function(d){return "Sluttresultat: "+studio_locale.v(d,"playerScore")},
"setBackground":function(d){return "sett bakgrunn"},
"setBackgroundRandom":function(d){return "sett tilfeldig bakgrunn"},
"setBackgroundBlack":function(d){return "Angi svart bakgrunn"},
"setBackgroundCave":function(d){return "sett hulebakgrunn"},
"setBackgroundCloudy":function(d){return "Angi en bakgrunn med skyer"},
"setBackgroundHardcourt":function(d){return "sett idrettsplassbakgrunn"},
"setBackgroundNight":function(d){return "sett nattbakgrunn"},
"setBackgroundUnderwater":function(d){return "sett undersjøbakgrunn"},
"setBackgroundCity":function(d){return "sett bybakgrunn"},
"setBackgroundDesert":function(d){return "sett ørkenbakgrunn"},
"setBackgroundRainbow":function(d){return "sett regnbuebakgrunn"},
"setBackgroundSoccer":function(d){return "set fotball bakgrunn"},
"setBackgroundSpace":function(d){return "set verdensrom bakgrunn"},
"setBackgroundTennis":function(d){return "set tennis bakgrunn"},
"setBackgroundWinter":function(d){return "set vinter bakgrunn"},
"setBackgroundLeafy":function(d){return "sett bladbakgrunn"},
"setBackgroundGrassy":function(d){return "sett gressbakgrunn"},
"setBackgroundFlower":function(d){return "sett blomsterbakgrunn"},
"setBackgroundTile":function(d){return "sett flisbakgrunn"},
"setBackgroundIcy":function(d){return "sett isbakgrunn"},
"setBackgroundSnowy":function(d){return "sett snøbakgrunn"},
"setBackgroundTooltip":function(d){return "Angir bakgrunnsbilde"},
"setEnemySpeed":function(d){return "angi fiende hastighet"},
"setPlayerSpeed":function(d){return "angi spiller hastighet"},
"setScoreText":function(d){return "Angi poengsum"},
"setScoreTextTooltip":function(d){return "Angir teksten som skal vises i feltet for score."},
"setSpriteEmotionAngry":function(d){return "til et sint humør"},
"setSpriteEmotionHappy":function(d){return "til blid humør"},
"setSpriteEmotionNormal":function(d){return "til nøytralt humør"},
"setSpriteEmotionRandom":function(d){return "til et tilfeldig humør"},
"setSpriteEmotionSad":function(d){return "til trist humør"},
"setSpriteEmotionTooltip":function(d){return "Setter skuespillerens humør"},
"setSpriteAlien":function(d){return "til romvesen utseende"},
"setSpriteBat":function(d){return "til flaggermus utseende"},
"setSpriteBird":function(d){return "til fugle utseende"},
"setSpriteCat":function(d){return "til katte utseende"},
"setSpriteCaveBoy":function(d){return "til steinaldergutt utseende"},
"setSpriteCaveGirl":function(d){return "til steinalderjente utseende"},
"setSpriteDinosaur":function(d){return "til dinosaur utseende"},
"setSpriteDog":function(d){return "til hunde utseende"},
"setSpriteDragon":function(d){return "til drage utseende"},
"setSpriteGhost":function(d){return "til spøkelse utseende"},
"setSpriteHidden":function(d){return "til usynlig utseende"},
"setSpriteHideK1":function(d){return "gjemme"},
"setSpriteAnna":function(d){return "til et Anna-utseende"},
"setSpriteElsa":function(d){return "til et Elsa-utseende"},
"setSpriteHiro":function(d){return "til Hiro utseende"},
"setSpriteBaymax":function(d){return "til Baymax utseende"},
"setSpriteRapunzel":function(d){return "til Rapunzel utseende"},
"setSpriteKnight":function(d){return "til ridder utseende"},
"setSpriteMonster":function(d){return "til monster utseende"},
"setSpriteNinja":function(d){return "til ninja utseende"},
"setSpriteOctopus":function(d){return "til blekksprut utseende"},
"setSpritePenguin":function(d){return "til et pingvinbilde"},
"setSpritePirate":function(d){return "til et piratbilde"},
"setSpritePrincess":function(d){return "til et prinsessebilde"},
"setSpriteRandom":function(d){return "til et tilfeldig bilde"},
"setSpriteRobot":function(d){return "til et robotbilde"},
"setSpriteShowK1":function(d){return "vis"},
"setSpriteSpacebot":function(d){return "til robot utseende"},
"setSpriteSoccerGirl":function(d){return "til fotballjente utseende"},
"setSpriteSoccerBoy":function(d){return "til fotballgutt utseende"},
"setSpriteSquirrel":function(d){return "til ekorn utseende"},
"setSpriteTennisGirl":function(d){return "til tennisjente utseende"},
"setSpriteTennisBoy":function(d){return "til tennisgutt utseende"},
"setSpriteUnicorn":function(d){return "til enhjøring utseende"},
"setSpriteWitch":function(d){return "til et bilde av en heks"},
"setSpriteWizard":function(d){return "til trollmann utseende"},
"setSpritePositionTooltip":function(d){return "Flytter en skuespiller til den angitte plasseringen."},
"setSpriteK1Tooltip":function(d){return "Viser eller skjuler angitt skuespiller."},
"setSpriteTooltip":function(d){return "Angir skuespiller bildet"},
"setSpriteSizeRandom":function(d){return "til tilfeldig størrelse"},
"setSpriteSizeVerySmall":function(d){return "til veldig liten størrelse"},
"setSpriteSizeSmall":function(d){return "til liten størrelse"},
"setSpriteSizeNormal":function(d){return "til normal størrelse"},
"setSpriteSizeLarge":function(d){return "til stor størrelse"},
"setSpriteSizeVeryLarge":function(d){return "til veldig stor størrelse"},
"setSpriteSizeTooltip":function(d){return "Angir størrelsen på en skuespiller"},
"setSpriteSpeedRandom":function(d){return "til en tilfeldig fart"},
"setSpriteSpeedVerySlow":function(d){return "til en treig fart"},
"setSpriteSpeedSlow":function(d){return "til en langsom fart"},
"setSpriteSpeedNormal":function(d){return "til en normal fart"},
"setSpriteSpeedFast":function(d){return "til en rask fart"},
"setSpriteSpeedVeryFast":function(d){return "til en veldig rask fart"},
"setSpriteSpeedTooltip":function(d){return "Angir farten til en skuespiller"},
"setSpriteZombie":function(d){return "til zombie utseende"},
"shareStudioTwitter":function(d){return "Sjekk ut historien jeg lagde. Jeg skrev den selv med @codeorg"},
"shareGame":function(d){return "Del din historie:"},
"showCoordinates":function(d){return "vis koordinater"},
"showCoordinatesTooltip":function(d){return "Vis protagonistens koordinater på skjermen"},
"showTitleScreen":function(d){return "vis tittelskjerm"},
"showTitleScreenTitle":function(d){return "tittel"},
"showTitleScreenText":function(d){return "tekst"},
"showTSDefTitle":function(d){return "skriv tittelen her"},
"showTSDefText":function(d){return "skriv teksten her"},
"showTitleScreenTooltip":function(d){return "Vis en tittelskjerm med tilhørende tittel og tekst."},
"size":function(d){return "størrelse"},
"setSprite":function(d){return "sett"},
"setSpriteN":function(d){return "angi skuespiller "+studio_locale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "knas"},
"soundGoal1":function(d){return "mål 1"},
"soundGoal2":function(d){return "mål 2"},
"soundHit":function(d){return "slå"},
"soundLosePoint":function(d){return "miste poeng"},
"soundLosePoint2":function(d){return "miste poeng 2"},
"soundRetro":function(d){return "retro"},
"soundRubber":function(d){return "gummi"},
"soundSlap":function(d){return "slenge"},
"soundWinPoint":function(d){return "vinne poeng"},
"soundWinPoint2":function(d){return "vinne poeng 2"},
"soundWood":function(d){return "tre"},
"speed":function(d){return "fart"},
"startSetValue":function(d){return "start (funksjon)"},
"startSetVars":function(d){return "spill_verdier (tittel, undertittel, bakgrunn, mål, fare, spiller)"},
"startSetFuncs":function(d){return "spill_funk(oppdater-mål, oppdater-fare, oppdater-spiller, kollider?, på-skjermen?)"},
"stopSprite":function(d){return "stopp"},
"stopSpriteN":function(d){return "stopp skuespiller "+studio_locale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Stopper en skuespillers bevegelser."},
"throwSprite":function(d){return "kaste"},
"throwSpriteN":function(d){return "skuespiller kaster "+studio_locale.v(d,"spriteIndex")},
"throwTooltip":function(d){return "Kaster et prosjektil fra angitte skuespiller."},
"vanish":function(d){return "fjern"},
"vanishActorN":function(d){return "fjern skuespiller "+studio_locale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "Fjerner skuespilleren."},
"waitFor":function(d){return "vent på"},
"waitSeconds":function(d){return "sekunder"},
"waitForClick":function(d){return "vent på klikk"},
"waitForRandom":function(d){return "Vent på tilfeldig"},
"waitForHalfSecond":function(d){return "vente et halvt sekund"},
"waitFor1Second":function(d){return "Vent i 1 sekund"},
"waitFor2Seconds":function(d){return "Vent i 2 sekunder"},
"waitFor5Seconds":function(d){return "Vent i fem sekunder"},
"waitFor10Seconds":function(d){return "Vent i 10 sekunder"},
"waitParamsTooltip":function(d){return "Venter det spesifiserte antall sekunder eller bruk null for å vente på et klikk."},
"waitTooltip":function(d){return "Venter i en viss tid eller til et klikk oppstår."},
"whenArrowDown":function(d){return "pil ned"},
"whenArrowLeft":function(d){return "pil venstre"},
"whenArrowRight":function(d){return "pil høyre"},
"whenArrowUp":function(d){return "pil opp"},
"whenArrowTooltip":function(d){return "Utfør handlingene under når den angitte piltasten trykkes."},
"whenDown":function(d){return "Når pil ned"},
"whenDownTooltip":function(d){return "Utfør handlingene nedenfor når pil ned-tasten trykkes."},
"whenGameStarts":function(d){return "Når historien starter"},
"whenGameStartsTooltip":function(d){return "Utfør handlingene nedenfor når historien starter."},
"whenLeft":function(d){return "Når venstre pil"},
"whenLeftTooltip":function(d){return "Utfør handlingene nedenfor når venstre pil-tasten trykkes."},
"whenRight":function(d){return "Når høyre pil"},
"whenRightTooltip":function(d){return "Utfør handlingene nedenfor når du trykker piltasten høyre."},
"whenSpriteClicked":function(d){return "Når skuespilleren blir klikket"},
"whenSpriteClickedN":function(d){return "når skuespiller "+studio_locale.v(d,"spriteIndex")+" blir klikket på"},
"whenSpriteClickedTooltip":function(d){return "Utfør handlingene under når en skuespiller blir klikket på."},
"whenSpriteCollidedN":function(d){return "når skuespiller "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "Utfør handlingene nedenfor når en skuespiller berører en annen skuespiller."},
"whenSpriteCollidedWith":function(d){return "berører"},
"whenSpriteCollidedWithAnyActor":function(d){return "berører en skuespiller"},
"whenSpriteCollidedWithAnyEdge":function(d){return "berører en kant"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "berører et prosjektil"},
"whenSpriteCollidedWithAnything":function(d){return "berører noe"},
"whenSpriteCollidedWithN":function(d){return "berører skuespiller "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "berører blå ildkule"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "berører lilla ildkule"},
"whenSpriteCollidedWithRedFireball":function(d){return "berører rød ildkule"},
"whenSpriteCollidedWithYellowHearts":function(d){return "berører gult hjerte"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "berører lilla hjerte"},
"whenSpriteCollidedWithRedHearts":function(d){return "berører rødt hjerte"},
"whenSpriteCollidedWithBottomEdge":function(d){return "berører nedre kant"},
"whenSpriteCollidedWithLeftEdge":function(d){return "berører venstre kant"},
"whenSpriteCollidedWithRightEdge":function(d){return "berører høyre kant"},
"whenSpriteCollidedWithTopEdge":function(d){return "berører øvre kant"},
"whenUp":function(d){return "Når pil opp"},
"whenUpTooltip":function(d){return "Utfør handlingene nedenfor når pil opp-tasten trykkes."},
"yes":function(d){return "Ja"}};