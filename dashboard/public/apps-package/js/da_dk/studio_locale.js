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
"actor":function(d){return "spiller"},
"alienInvasion":function(d){return "Invasion af fremmede!"},
"backgroundBlack":function(d){return "sort"},
"backgroundCave":function(d){return "grotte"},
"backgroundCloudy":function(d){return "overskyet"},
"backgroundHardcourt":function(d){return "fastbane"},
"backgroundNight":function(d){return "nat"},
"backgroundUnderwater":function(d){return "undervands"},
"backgroundCity":function(d){return "by"},
"backgroundDesert":function(d){return "ørken"},
"backgroundRainbow":function(d){return "regnbue"},
"backgroundSoccer":function(d){return "fodbold"},
"backgroundSpace":function(d){return "rummet"},
"backgroundTennis":function(d){return "tennis"},
"backgroundWinter":function(d){return "vinter"},
"catActions":function(d){return "Handlinger"},
"catControl":function(d){return "Løkker"},
"catEvents":function(d){return "Hændelser"},
"catLogic":function(d){return "Logik"},
"catMath":function(d){return "Matematik"},
"catProcedures":function(d){return "Funktioner"},
"catText":function(d){return "Tekst"},
"catVariables":function(d){return "Variabler"},
"changeScoreTooltip":function(d){return "Tilføj eller fjern et point til scoren."},
"changeScoreTooltipK1":function(d){return "Tilføj et point til scoren."},
"continue":function(d){return "Fortsæt"},
"decrementPlayerScore":function(d){return "fjern point"},
"defaultSayText":function(d){return "Skriv her"},
"emotion":function(d){return "humør"},
"finalLevel":function(d){return "Tillykke! Du har løst den sidste opgave."},
"for":function(d){return "for"},
"hello":function(d){return "hej"},
"helloWorld":function(d){return "Hej verden!"},
"incrementPlayerScore":function(d){return "score point"},
"makeProjectileDisappear":function(d){return "forsvinde"},
"makeProjectileBounce":function(d){return "hop"},
"makeProjectileBlueFireball":function(d){return "lav blå ildkugle"},
"makeProjectilePurpleFireball":function(d){return "lav lilla ildkugle"},
"makeProjectileRedFireball":function(d){return "lav røde ildkugle"},
"makeProjectileYellowHearts":function(d){return "lav gule hjerter"},
"makeProjectilePurpleHearts":function(d){return "lav lilla hjerter"},
"makeProjectileRedHearts":function(d){return "lav røde hjerter"},
"makeProjectileTooltip":function(d){return "Få projektilet, der ramte, til at forsvinde eller hoppe tilbage."},
"makeYourOwn":function(d){return "Lav din egen Play Lab App"},
"moveDirectionDown":function(d){return "ned"},
"moveDirectionLeft":function(d){return "venstre"},
"moveDirectionRight":function(d){return "højre"},
"moveDirectionUp":function(d){return "op"},
"moveDirectionRandom":function(d){return "tilfældig"},
"moveDistance25":function(d){return "25 pixels"},
"moveDistance50":function(d){return "50 pixels"},
"moveDistance100":function(d){return "100 pixels"},
"moveDistance200":function(d){return "200 pixels"},
"moveDistance400":function(d){return "400 pixels"},
"moveDistancePixels":function(d){return "pixels"},
"moveDistanceRandom":function(d){return "vilkårlige pixels"},
"moveDistanceTooltip":function(d){return "Flyt en karakter en bestemt afstand i den angivne retning."},
"moveSprite":function(d){return "flyt"},
"moveSpriteN":function(d){return "flyt spiller "+appLocale.v(d,"spriteIndex")},
"toXY":function(d){return "til x, y"},
"moveDown":function(d){return "Flyt ned"},
"moveDownTooltip":function(d){return "Flyt en spiller ned."},
"moveLeft":function(d){return "Flyt til venstre"},
"moveLeftTooltip":function(d){return "Flyt en spiller til venstre."},
"moveRight":function(d){return "Flyt til højre"},
"moveRightTooltip":function(d){return "Flyt spilleren til højre."},
"moveUp":function(d){return "Flyt op"},
"moveUpTooltip":function(d){return "Flyt en spiller op."},
"moveTooltip":function(d){return "Flyt en spiller."},
"nextLevel":function(d){return "Tillykke! Du har fuldført denne opgave."},
"no":function(d){return "Nej"},
"numBlocksNeeded":function(d){return "Denne opgave kan løses med %1 blokke."},
"onEventTooltip":function(d){return "Eksekvér kode som svar på den specificerede hændelse."},
"ouchExclamation":function(d){return "Av!"},
"playSoundCrunch":function(d){return "afspil kvaselyd"},
"playSoundGoal1":function(d){return "afspil mål 1 lyd"},
"playSoundGoal2":function(d){return "afspil mål 2 lyd"},
"playSoundHit":function(d){return "afspil rammer lyd"},
"playSoundLosePoint":function(d){return "afspil tab point lyd"},
"playSoundLosePoint2":function(d){return "afspil tab point 2 lyd"},
"playSoundRetro":function(d){return "afspil retro lyd"},
"playSoundRubber":function(d){return "Afspil gummi lyd"},
"playSoundSlap":function(d){return "afspil klaske lyd"},
"playSoundTooltip":function(d){return "Afspil den valgte lyd."},
"playSoundWinPoint":function(d){return "afspil vind point lyd"},
"playSoundWinPoint2":function(d){return "afspil vind point 2 lyd"},
"playSoundWood":function(d){return "afspil træ lyd"},
"positionOutTopLeft":function(d){return "til øverste, venstre position"},
"positionOutTopRight":function(d){return "til øverst højre position"},
"positionTopOutLeft":function(d){return "til toppen uden for venstre position"},
"positionTopLeft":function(d){return "til øverste venstre position"},
"positionTopCenter":function(d){return "til top midterpositionen"},
"positionTopRight":function(d){return "til øverste, højre position"},
"positionTopOutRight":function(d){return "til toppen uden for højre position"},
"positionMiddleLeft":function(d){return "i den midterste venstre position"},
"positionMiddleCenter":function(d){return "den midterste center holdning"},
"positionMiddleRight":function(d){return "i den midterste højre position"},
"positionBottomOutLeft":function(d){return "til bunden udenfor venstre position"},
"positionBottomLeft":function(d){return "til den nederste venstre position"},
"positionBottomCenter":function(d){return "til bunden center position"},
"positionBottomRight":function(d){return "til den nederste højre position"},
"positionBottomOutRight":function(d){return "til bunden udenfor højre position"},
"positionOutBottomLeft":function(d){return "til nederste venstre position"},
"positionOutBottomRight":function(d){return "til nederste højre position"},
"positionRandom":function(d){return "til tilfældig position"},
"projectileBlueFireball":function(d){return "blå ildkugle"},
"projectilePurpleFireball":function(d){return "lilla ildkugle"},
"projectileRedFireball":function(d){return "rød ildkugle"},
"projectileYellowHearts":function(d){return "gule hjerter"},
"projectilePurpleHearts":function(d){return "lilla hjerter"},
"projectileRedHearts":function(d){return "røde hjerter"},
"projectileRandom":function(d){return "tilfældig"},
"projectileAnna":function(d){return "krog"},
"projectileElsa":function(d){return "funkle"},
"projectileHiro":function(d){return "mikrobots"},
"projectileBaymax":function(d){return "raket"},
"projectileRapunzel":function(d){return "gryde"},
"projectileCherry":function(d){return "kirsebær"},
"projectileIce":function(d){return "Is"},
"projectileDuck":function(d){return "and"},
"reinfFeedbackMsg":function(d){return "Du kan trykke \"Fortsæt med at spille\"-knappen for at gå tilbage til at spille din historie."},
"repeatForever":function(d){return "Gentag for evigt"},
"repeatDo":function(d){return "udfør"},
"repeatForeverTooltip":function(d){return "Udføre handlinger i denne blok gentagne gange mens programmet kører."},
"saySprite":function(d){return "sig"},
"saySpriteN":function(d){return "spiller "+appLocale.v(d,"spriteIndex")+" siger"},
"saySpriteTooltip":function(d){return "En taleboble med den tilhørende tekst fra det angivne karakter."},
"saySpriteChoices_0":function(d){return "Hej."},
"saySpriteChoices_1":function(d){return "Hej alle."},
"saySpriteChoices_2":function(d){return "Hvordan går det?"},
"saySpriteChoices_3":function(d){return "Godmorgen"},
"saySpriteChoices_4":function(d){return "God eftermiddag"},
"saySpriteChoices_5":function(d){return "Godnat"},
"saySpriteChoices_6":function(d){return "God aften"},
"saySpriteChoices_7":function(d){return "Hvad er nyt?"},
"saySpriteChoices_8":function(d){return "Hvad?"},
"saySpriteChoices_9":function(d){return "Hvor?"},
"saySpriteChoices_10":function(d){return "Hvornår?"},
"saySpriteChoices_11":function(d){return "Godt."},
"saySpriteChoices_12":function(d){return "Enestående!"},
"saySpriteChoices_13":function(d){return "All right."},
"saySpriteChoices_14":function(d){return "Ikke dårligt."},
"saySpriteChoices_15":function(d){return "Held og lykke."},
"saySpriteChoices_16":function(d){return "Ja"},
"saySpriteChoices_17":function(d){return "Nej"},
"saySpriteChoices_18":function(d){return "Okay"},
"saySpriteChoices_19":function(d){return "Fint kast!"},
"saySpriteChoices_20":function(d){return "Hav en god dag."},
"saySpriteChoices_21":function(d){return "Farvel."},
"saySpriteChoices_22":function(d){return "Jeg er tilbage med det samme."},
"saySpriteChoices_23":function(d){return "Ses i morgen!"},
"saySpriteChoices_24":function(d){return "Ses senere!"},
"saySpriteChoices_25":function(d){return "Pas på dig selv!"},
"saySpriteChoices_26":function(d){return "Nyd!"},
"saySpriteChoices_27":function(d){return "Jeg bliver nødt til at gå."},
"saySpriteChoices_28":function(d){return "Skal vi være venner?"},
"saySpriteChoices_29":function(d){return "Super job!"},
"saySpriteChoices_30":function(d){return "Woo hoo!"},
"saySpriteChoices_31":function(d){return "Yay!"},
"saySpriteChoices_32":function(d){return "Hyggeligt at møde dig."},
"saySpriteChoices_33":function(d){return "All right!"},
"saySpriteChoices_34":function(d){return "Tak skal du have"},
"saySpriteChoices_35":function(d){return "Nej, tak"},
"saySpriteChoices_36":function(d){return "Aaaaaah!"},
"saySpriteChoices_37":function(d){return "Lige meget"},
"saySpriteChoices_38":function(d){return "I dag"},
"saySpriteChoices_39":function(d){return "I morgen"},
"saySpriteChoices_40":function(d){return "I går"},
"saySpriteChoices_41":function(d){return "Jeg fandt dig!"},
"saySpriteChoices_42":function(d){return "Du fandt mig!"},
"saySpriteChoices_43":function(d){return "10, 9, 8, 7, 6, 5, 4, 3, 2, 1!"},
"saySpriteChoices_44":function(d){return "Du er fantastisk!"},
"saySpriteChoices_45":function(d){return "Du er sjov!"},
"saySpriteChoices_46":function(d){return "Du er dum! "},
"saySpriteChoices_47":function(d){return "Du er en god ven!"},
"saySpriteChoices_48":function(d){return "Pas på!"},
"saySpriteChoices_49":function(d){return "Duk!"},
"saySpriteChoices_50":function(d){return "Fik dig!"},
"saySpriteChoices_51":function(d){return "Ow!"},
"saySpriteChoices_52":function(d){return "Beklager!"},
"saySpriteChoices_53":function(d){return "Forsigtig!"},
"saySpriteChoices_54":function(d){return "Whoa!"},
"saySpriteChoices_55":function(d){return "Ups!"},
"saySpriteChoices_56":function(d){return "Du fik mig næsten!"},
"saySpriteChoices_57":function(d){return "Godt forsøg!"},
"saySpriteChoices_58":function(d){return "Du kan ikke fange mig!"},
"scoreText":function(d){return "Score: "+appLocale.v(d,"playerScore")},
"setBackground":function(d){return "sæt baggrund"},
"setBackgroundRandom":function(d){return "sæt tilfældig baggrund"},
"setBackgroundBlack":function(d){return "sæt sort baggrund"},
"setBackgroundCave":function(d){return "sæt hule baggrund"},
"setBackgroundCloudy":function(d){return "sæt skyet baggrund"},
"setBackgroundHardcourt":function(d){return "sæt tennis baggrund"},
"setBackgroundNight":function(d){return "sæt nat baggrund"},
"setBackgroundUnderwater":function(d){return "indstille undervands baggrund"},
"setBackgroundCity":function(d){return "sæt by baggrund"},
"setBackgroundDesert":function(d){return "sæt ørkenbaggrund"},
"setBackgroundRainbow":function(d){return "sæt regnbuebaggrund"},
"setBackgroundSoccer":function(d){return "sæt fodboldbaggrund"},
"setBackgroundSpace":function(d){return "sæt verdensrumbaggrund"},
"setBackgroundTennis":function(d){return "sæt tennisbaggrund"},
"setBackgroundWinter":function(d){return "sæt vinterbaggrund"},
"setBackgroundLeafy":function(d){return "sæt bladfangsbaggrund"},
"setBackgroundGrassy":function(d){return "sæt græsklædt baggrund"},
"setBackgroundFlower":function(d){return "sæt blomsterklædt baggrund"},
"setBackgroundTile":function(d){return "sæt flisebaggrund"},
"setBackgroundIcy":function(d){return "sæt isbaggrund"},
"setBackgroundSnowy":function(d){return "sæt snebaggrund"},
"setBackgroundTooltip":function(d){return "Indstiller baggrundsbilledet"},
"setEnemySpeed":function(d){return "indstil fjende-hastighed"},
"setPlayerSpeed":function(d){return "indstil spiller-hastighed"},
"setScoreText":function(d){return "sæt score"},
"setScoreTextTooltip":function(d){return "Angiv teksten, der skal vises i score-området."},
"setSpriteEmotionAngry":function(d){return "til vrede"},
"setSpriteEmotionHappy":function(d){return "til glad"},
"setSpriteEmotionNormal":function(d){return "til normalt humør"},
"setSpriteEmotionRandom":function(d){return "til et vilkårligt humør"},
"setSpriteEmotionSad":function(d){return "til trist humør"},
"setSpriteEmotionTooltip":function(d){return "Sætter spillerhumør"},
"setSpriteAlien":function(d){return "til et rumvæsenbillede"},
"setSpriteBat":function(d){return "til flagermus billedet"},
"setSpriteBird":function(d){return "til et fuglebillede"},
"setSpriteCat":function(d){return "til et kattebillede"},
"setSpriteCaveBoy":function(d){return "til et huledrengsbillede"},
"setSpriteCaveGirl":function(d){return "til et hulepigebillede"},
"setSpriteDinosaur":function(d){return "til et dinosaurbillede"},
"setSpriteDog":function(d){return "til et hundebillede"},
"setSpriteDragon":function(d){return "til et dragbillede"},
"setSpriteGhost":function(d){return "til et spøgelsesbillede"},
"setSpriteHidden":function(d){return "til et skjult billede"},
"setSpriteHideK1":function(d){return "skjul"},
"setSpriteAnna":function(d){return "til et Anna-billede"},
"setSpriteElsa":function(d){return "til et Elsa-billede"},
"setSpriteHiro":function(d){return "til et Hiro-billede"},
"setSpriteBaymax":function(d){return "til et Baymax-billede"},
"setSpriteRapunzel":function(d){return "til et Rapunzel-billede"},
"setSpriteKnight":function(d){return "til et ridderbillede"},
"setSpriteMonster":function(d){return "til et monsterbillede"},
"setSpriteNinja":function(d){return "til et maskeret ninja-billede"},
"setSpriteOctopus":function(d){return "til et blækspruttebillede"},
"setSpritePenguin":function(d){return "til et pingvinbillede"},
"setSpritePirate":function(d){return "til et piratbillede"},
"setSpritePrincess":function(d){return "til et prinsessebillede"},
"setSpriteRandom":function(d){return "til et vilkårligt billede"},
"setSpriteRobot":function(d){return "at et robotbillede"},
"setSpriteShowK1":function(d){return "vis"},
"setSpriteSpacebot":function(d){return "til spacebot billedet"},
"setSpriteSoccerGirl":function(d){return "til fodbold pige billedet"},
"setSpriteSoccerBoy":function(d){return "til fodbold dreng billedet"},
"setSpriteSquirrel":function(d){return "til egern billedet"},
"setSpriteTennisGirl":function(d){return "til tennis pige billedet"},
"setSpriteTennisBoy":function(d){return "til tennis dreng billedet"},
"setSpriteUnicorn":function(d){return "til enhjørning billedet"},
"setSpriteWitch":function(d){return "til heks billedet"},
"setSpriteWizard":function(d){return "til troldmands billedet"},
"setSpritePositionTooltip":function(d){return "Flytter straks en spiller til den angivne placering."},
"setSpriteK1Tooltip":function(d){return "Viser eller skjuler den angivne spiller."},
"setSpriteTooltip":function(d){return "Indstiller spillererens billede"},
"setSpriteSizeRandom":function(d){return "til en tilfældig størrelse"},
"setSpriteSizeVerySmall":function(d){return "til en meget lille størrelse"},
"setSpriteSizeSmall":function(d){return "til en lille størrelse"},
"setSpriteSizeNormal":function(d){return "til en normal størrelse"},
"setSpriteSizeLarge":function(d){return "til en stor størrelse"},
"setSpriteSizeVeryLarge":function(d){return "til en meget stor størrelse"},
"setSpriteSizeTooltip":function(d){return "sætter størrelsen på en spiller"},
"setSpriteSpeedRandom":function(d){return "til en tilfældig hastighed"},
"setSpriteSpeedVerySlow":function(d){return "til en meget langsom hastighed"},
"setSpriteSpeedSlow":function(d){return "til en langsom hastighed"},
"setSpriteSpeedNormal":function(d){return "til en normal hastighed"},
"setSpriteSpeedFast":function(d){return "til en hurtig hastighed"},
"setSpriteSpeedVeryFast":function(d){return "til en meget hurtig hastighed"},
"setSpriteSpeedTooltip":function(d){return "Indstiller spillererens hastigheden"},
"setSpriteZombie":function(d){return "til et zombiebillede"},
"shareStudioTwitter":function(d){return "Tjek historien jeg lavede. Jeg skrev den selv med @codeorg"},
"shareGame":function(d){return "Del din historie:"},
"showCoordinates":function(d){return "vis koordinater"},
"showCoordinatesTooltip":function(d){return "vis hovedpersonens koordinater på skærmen"},
"showTitleScreen":function(d){return "vis titelskærm"},
"showTitleScreenTitle":function(d){return "titel"},
"showTitleScreenText":function(d){return "tekst"},
"showTSDefTitle":function(d){return "angiv titel hér"},
"showTSDefText":function(d){return "angiv tekst hér"},
"showTitleScreenTooltip":function(d){return "Vis en titelskærm med den tilhørende titel og tekst."},
"size":function(d){return "størrelse"},
"setSprite":function(d){return "sæt"},
"setSpriteN":function(d){return "sæt spiller "+appLocale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "kravle"},
"soundGoal1":function(d){return "mål 1"},
"soundGoal2":function(d){return "mål 2"},
"soundHit":function(d){return "slag"},
"soundLosePoint":function(d){return "pointtab"},
"soundLosePoint2":function(d){return "pointtab 2"},
"soundRetro":function(d){return "retro"},
"soundRubber":function(d){return "gummi"},
"soundSlap":function(d){return "smæk"},
"soundWinPoint":function(d){return "vind point"},
"soundWinPoint2":function(d){return "vind punkt 2"},
"soundWood":function(d){return "træ"},
"speed":function(d){return "hastighed"},
"startSetValue":function(d){return "start (funktion)"},
"startSetVars":function(d){return "game_vars (title, subtitle, background, target, danger, player)"},
"startSetFuncs":function(d){return "game_funcs (update-target, update-danger, update-player, collide?, on-screen?)"},
"stopSprite":function(d){return "Stop"},
"stopSpriteN":function(d){return "stop spiller "+appLocale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Stopper en spillers bevægelse."},
"throwSprite":function(d){return "kast"},
"throwSpriteN":function(d){return "spiller"+appLocale.v(d,"spriteIndex")+"kast"},
"throwTooltip":function(d){return "Kaster et projektil fra den angivne spiller."},
"vanish":function(d){return "forsvinde"},
"vanishActorN":function(d){return "lad spiller forsvinder "+appLocale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "Lader spilleren forsvinde."},
"waitFor":function(d){return "vent på"},
"waitSeconds":function(d){return "sekunder"},
"waitForClick":function(d){return "vent på klik"},
"waitForRandom":function(d){return "vent vilkårlig"},
"waitForHalfSecond":function(d){return "vent et halvt sekund"},
"waitFor1Second":function(d){return "vent 1 sekund"},
"waitFor2Seconds":function(d){return "vent 2 sekunder"},
"waitFor5Seconds":function(d){return "vent 5 sekunder"},
"waitFor10Seconds":function(d){return "vent 10 sekunder"},
"waitParamsTooltip":function(d){return "Venter i et specificeret antal sekunder eller benyt nul for at vente indtil næste klik."},
"waitTooltip":function(d){return "Venter i et specificeret tidsrum eller indtil næste klik."},
"whenArrowDown":function(d){return "pil ned"},
"whenArrowLeft":function(d){return "venstre pil"},
"whenArrowRight":function(d){return "højre pil"},
"whenArrowUp":function(d){return "pil op"},
"whenArrowTooltip":function(d){return "Udfør nedenstående handlingen når den specificerede pile-tast aktiveres."},
"whenDown":function(d){return "Når pil ned"},
"whenDownTooltip":function(d){return "Udfører handlingen herunder når der trykkes pil ned."},
"whenGameStarts":function(d){return "Når historien starter"},
"whenGameStartsTooltip":function(d){return "Udfør nedenstående handlinger, når historien starter."},
"whenLeft":function(d){return "Når venstre pil"},
"whenLeftTooltip":function(d){return "Udfører handlingen herunder når der trykkes venstre pil."},
"whenRight":function(d){return "Når højre pil"},
"whenRightTooltip":function(d){return "Udfører handlingen herunder når der trykkes højre pil."},
"whenSpriteClicked":function(d){return "ved klik på spiller"},
"whenSpriteClickedN":function(d){return "ved klik på spiller "+appLocale.v(d,"spriteIndex")},
"whenSpriteClickedTooltip":function(d){return "Udføre handlingen herunder når en der klikkes på spilleren."},
"whenSpriteCollidedN":function(d){return "når spilleren "+appLocale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "Udføre handlingen nedenfor når spilleren rører en anden spiller."},
"whenSpriteCollidedWith":function(d){return "berører"},
"whenSpriteCollidedWithAnyActor":function(d){return "berører enhver spiller"},
"whenSpriteCollidedWithAnyEdge":function(d){return "berører enhver kant"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "berører ethvert projektil"},
"whenSpriteCollidedWithAnything":function(d){return "berører noget"},
"whenSpriteCollidedWithN":function(d){return "berører spiller "+appLocale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "berører blå ildkugle"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "berører lilla ildkugle"},
"whenSpriteCollidedWithRedFireball":function(d){return "berører røde ildkugle"},
"whenSpriteCollidedWithYellowHearts":function(d){return "berører gule hjerter"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "berører lilla hjerter"},
"whenSpriteCollidedWithRedHearts":function(d){return "berører røde hjerter"},
"whenSpriteCollidedWithBottomEdge":function(d){return "berører nederste kant"},
"whenSpriteCollidedWithLeftEdge":function(d){return "berører venstre kant"},
"whenSpriteCollidedWithRightEdge":function(d){return "berører højre kant"},
"whenSpriteCollidedWithTopEdge":function(d){return "berører øverste kant"},
"whenUp":function(d){return "Når pil op"},
"whenUpTooltip":function(d){return "Udfører handlingen herunder når der trykkes pil op."},
"yes":function(d){return "Ja"}};