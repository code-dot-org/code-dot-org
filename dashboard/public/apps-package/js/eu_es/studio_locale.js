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
"actor":function(d){return "actor"},
"alienInvasion":function(d){return "Alien Invasion!"},
"backgroundBlack":function(d){return "black"},
"backgroundCave":function(d){return "cave"},
"backgroundCloudy":function(d){return "cloudy"},
"backgroundHardcourt":function(d){return "hardcourt"},
"backgroundNight":function(d){return "night"},
"backgroundUnderwater":function(d){return "underwater"},
"backgroundCity":function(d){return "city"},
"backgroundDesert":function(d){return "desert"},
"backgroundRainbow":function(d){return "rainbow"},
"backgroundSoccer":function(d){return "soccer"},
"backgroundSpace":function(d){return "space"},
"backgroundTennis":function(d){return "tennis"},
"backgroundWinter":function(d){return "winter"},
"catActions":function(d){return "Ekintzak"},
"catControl":function(d){return "Itzuliak"},
"catEvents":function(d){return "Gertaerak"},
"catLogic":function(d){return "Logika"},
"catMath":function(d){return "Matematika"},
"catProcedures":function(d){return "Funtzioak"},
"catText":function(d){return "Testua"},
"catVariables":function(d){return "Aldagaiak"},
"changeScoreTooltip":function(d){return "Add or remove a point to the score."},
"changeScoreTooltipK1":function(d){return "Add a point to the score."},
"continue":function(d){return "Jarraitu"},
"decrementPlayerScore":function(d){return "remove point"},
"defaultSayText":function(d){return "idatzi hemen"},
"emotion":function(d){return "mood"},
"finalLevel":function(d){return "Zorionak! Amaierako puzlea ebatzi duzu."},
"for":function(d){return "for"},
"hello":function(d){return "hello"},
"helloWorld":function(d){return "Hello World!"},
"incrementPlayerScore":function(d){return "score point"},
"makeProjectileDisappear":function(d){return "disappear"},
"makeProjectileBounce":function(d){return "bounce"},
"makeProjectileBlueFireball":function(d){return "make blue fireball"},
"makeProjectilePurpleFireball":function(d){return "make purple fireball"},
"makeProjectileRedFireball":function(d){return "make red fireball"},
"makeProjectileYellowHearts":function(d){return "make yellow hearts"},
"makeProjectilePurpleHearts":function(d){return "make purple hearts"},
"makeProjectileRedHearts":function(d){return "make red hearts"},
"makeProjectileTooltip":function(d){return "Make the projectile that just collided disappear or bounce."},
"makeYourOwn":function(d){return "Make Your Own Play Lab App"},
"moveDirectionDown":function(d){return "behera"},
"moveDirectionLeft":function(d){return "ezkerra"},
"moveDirectionRight":function(d){return "eskuina"},
"moveDirectionUp":function(d){return "gora"},
"moveDirectionRandom":function(d){return "ausazkoa"},
"moveDistance25":function(d){return "25 pixel"},
"moveDistance50":function(d){return "50 pixel"},
"moveDistance100":function(d){return "100 pixel"},
"moveDistance200":function(d){return "200 pixel"},
"moveDistance400":function(d){return "400 pixel"},
"moveDistancePixels":function(d){return "Pixelak"},
"moveDistanceRandom":function(d){return "ausazko pixelak"},
"moveDistanceTooltip":function(d){return "Mugitu aktorea distantzia zehatz batean eta norabide zehatzean."},
"moveSprite":function(d){return "mugitu"},
"moveSpriteN":function(d){return "move actor "+studio_locale.v(d,"spriteIndex")},
"toXY":function(d){return "to x,y"},
"moveDown":function(d){return "mugiru behera"},
"moveDownTooltip":function(d){return "Mugitu aktore bat behera."},
"moveLeft":function(d){return "mugitu ezkerrera"},
"moveLeftTooltip":function(d){return "mugitu aktore bat ezkerrera."},
"moveRight":function(d){return "mugitu eskuinera"},
"moveRightTooltip":function(d){return "Mugitu aktore bat eskuinera."},
"moveUp":function(d){return "Mugitu gora"},
"moveUpTooltip":function(d){return "Mugitu aktore bat gora."},
"moveTooltip":function(d){return "Mugitu aktore bat."},
"nextLevel":function(d){return "Zorionak! Puzle hau osatu duzu."},
"no":function(d){return "Ez"},
"numBlocksNeeded":function(d){return "Puzle hau %1 blokeekin ebaz daiteke."},
"onEventTooltip":function(d){return "Execute code in response to the specified event."},
"ouchExclamation":function(d){return "Ouch!"},
"playSoundCrunch":function(d){return "jo karraska soinua"},
"playSoundGoal1":function(d){return "jo 1 gol soinua"},
"playSoundGoal2":function(d){return "jo 2 gol soinua"},
"playSoundHit":function(d){return "jo kolpe soinua"},
"playSoundLosePoint":function(d){return "jo galdutako puntuaren soinua"},
"playSoundLosePoint2":function(d){return "jo galdutako 2 puntuaren soinua"},
"playSoundRetro":function(d){return "jo retro soinua"},
"playSoundRubber":function(d){return "jo borragoma soinua"},
"playSoundSlap":function(d){return "jo zaplasteko soinua"},
"playSoundTooltip":function(d){return "Jo aukeratutako soinua."},
"playSoundWinPoint":function(d){return "jo puntu irabazle soinua"},
"playSoundWinPoint2":function(d){return "jo puntu irabazle soinua 2"},
"playSoundWood":function(d){return "jo egur soinua"},
"positionOutTopLeft":function(d){return "to the above top left position"},
"positionOutTopRight":function(d){return "to the above top right position"},
"positionTopOutLeft":function(d){return "to the top outside left position"},
"positionTopLeft":function(d){return "joan goi ezkerreko posiziora"},
"positionTopCenter":function(d){return "goi erdiko posiziora"},
"positionTopRight":function(d){return "goi eskuineko posiziora"},
"positionTopOutRight":function(d){return "to the top outside right position"},
"positionMiddleLeft":function(d){return "erdiko ezkerreko posiziora"},
"positionMiddleCenter":function(d){return "erdiko zentroko posiziora"},
"positionMiddleRight":function(d){return "erdiko eskuineko posiziora"},
"positionBottomOutLeft":function(d){return "to the bottom outside left position"},
"positionBottomLeft":function(d){return "beheko ezkerreko posiziora"},
"positionBottomCenter":function(d){return "behko zentroko posiziora"},
"positionBottomRight":function(d){return "beheko eskuineko posiziora"},
"positionBottomOutRight":function(d){return "to the bottom outside right position"},
"positionOutBottomLeft":function(d){return "to the below bottom left position"},
"positionOutBottomRight":function(d){return "to the below bottom right position"},
"positionRandom":function(d){return "ausazko posiziora"},
"projectileBlueFireball":function(d){return "blue fireball"},
"projectilePurpleFireball":function(d){return "purple fireball"},
"projectileRedFireball":function(d){return "red fireball"},
"projectileYellowHearts":function(d){return "yellow hearts"},
"projectilePurpleHearts":function(d){return "purple hearts"},
"projectileRedHearts":function(d){return "red hearts"},
"projectileRandom":function(d){return "ausazkoa"},
"projectileAnna":function(d){return "Anna"},
"projectileElsa":function(d){return "Elsa"},
"projectileHiro":function(d){return "Hiro"},
"projectileBaymax":function(d){return "Baymax"},
"projectileRapunzel":function(d){return "Rapunzel"},
"projectileCherry":function(d){return "cherry"},
"projectileIce":function(d){return "ice"},
"projectileDuck":function(d){return "duck"},
"reinfFeedbackMsg":function(d){return "\"Berriro saiatu\" botoiean klikatu dezakezu zure istorioa atzera egiteko."},
"repeatForever":function(d){return "errepikatu betirako"},
"repeatDo":function(d){return "egin"},
"repeatForeverTooltip":function(d){return "Exekutatu blokeko ekintzak etengabe istorioa martxan dagoen bitartean."},
"saySprite":function(d){return "esan"},
"saySpriteN":function(d){return "actor "+studio_locale.v(d,"spriteIndex")+" say"},
"saySpriteTooltip":function(d){return "Zehaztutako aktoretik bokadiloa atera lotutako testuarekin."},
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
"saySpriteChoices_16":function(d){return "Bai"},
"saySpriteChoices_17":function(d){return "Ez"},
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
"scoreText":function(d){return "Markagailua: "+studio_locale.v(d,"playerScore")},
"setBackground":function(d){return "set background"},
"setBackgroundRandom":function(d){return "ezarri ausazko atzeko planoa"},
"setBackgroundBlack":function(d){return "ezarri atzekalde beltza"},
"setBackgroundCave":function(d){return "ezarri haitzulo atzekaldea"},
"setBackgroundCloudy":function(d){return "ezarri atzekalde hodeitsua"},
"setBackgroundHardcourt":function(d){return "ezarri zoru gogorreko atzekaldea"},
"setBackgroundNight":function(d){return "ezarri gaueko atzekaldea"},
"setBackgroundUnderwater":function(d){return "ezarri ur azpiko atzeko planoa"},
"setBackgroundCity":function(d){return "set city background"},
"setBackgroundDesert":function(d){return "set desert background"},
"setBackgroundRainbow":function(d){return "set rainbow background"},
"setBackgroundSoccer":function(d){return "set soccer background"},
"setBackgroundSpace":function(d){return "set space background"},
"setBackgroundTennis":function(d){return "set tennis background"},
"setBackgroundWinter":function(d){return "set winter background"},
"setBackgroundLeafy":function(d){return "set leafy background"},
"setBackgroundGrassy":function(d){return "set grassy background"},
"setBackgroundFlower":function(d){return "set flower background"},
"setBackgroundTile":function(d){return "set tile background"},
"setBackgroundIcy":function(d){return "set icy background"},
"setBackgroundSnowy":function(d){return "set snowy background"},
"setBackgroundTooltip":function(d){return "Atzeko irudia ezartzen du"},
"setEnemySpeed":function(d){return "set enemy speed"},
"setPlayerSpeed":function(d){return "set player speed"},
"setScoreText":function(d){return "ezarri markagailua"},
"setScoreTextTooltip":function(d){return "Sets the text to be displayed in the score area."},
"setSpriteEmotionAngry":function(d){return "to a angry mood"},
"setSpriteEmotionHappy":function(d){return "to a happy mood"},
"setSpriteEmotionNormal":function(d){return "to a normal mood"},
"setSpriteEmotionRandom":function(d){return "to a random mood"},
"setSpriteEmotionSad":function(d){return "to a sad mood"},
"setSpriteEmotionTooltip":function(d){return "Sets the actor mood"},
"setSpriteAlien":function(d){return "to an alien image"},
"setSpriteBat":function(d){return "to a bat image"},
"setSpriteBird":function(d){return "to a bird image"},
"setSpriteCat":function(d){return "to a cat image"},
"setSpriteCaveBoy":function(d){return "to a cave boy image"},
"setSpriteCaveGirl":function(d){return "to a cave girl image"},
"setSpriteDinosaur":function(d){return "to a dinosaur image"},
"setSpriteDog":function(d){return "to a dog image"},
"setSpriteDragon":function(d){return "to a dragon image"},
"setSpriteGhost":function(d){return "to a ghost image"},
"setSpriteHidden":function(d){return "ezkutuko irudira"},
"setSpriteHideK1":function(d){return "hide"},
"setSpriteAnna":function(d){return "to a Anna image"},
"setSpriteElsa":function(d){return "to a Elsa image"},
"setSpriteHiro":function(d){return "to a Hiro image"},
"setSpriteBaymax":function(d){return "to a Baymax image"},
"setSpriteRapunzel":function(d){return "to a Rapunzel image"},
"setSpriteKnight":function(d){return "to a knight image"},
"setSpriteMonster":function(d){return "to a monster image"},
"setSpriteNinja":function(d){return "to a masked ninja image"},
"setSpriteOctopus":function(d){return "to an octopus image"},
"setSpritePenguin":function(d){return "to a penguin image"},
"setSpritePirate":function(d){return "to a pirate image"},
"setSpritePrincess":function(d){return "to a princess image"},
"setSpriteRandom":function(d){return "ausazko irudi batera"},
"setSpriteRobot":function(d){return "to a robot image"},
"setSpriteShowK1":function(d){return "show"},
"setSpriteSpacebot":function(d){return "to a spacebot image"},
"setSpriteSoccerGirl":function(d){return "to a soccer girl image"},
"setSpriteSoccerBoy":function(d){return "to a soccer boy image"},
"setSpriteSquirrel":function(d){return "to a squirrel image"},
"setSpriteTennisGirl":function(d){return "to a tennis girl image"},
"setSpriteTennisBoy":function(d){return "to a tennis boy image"},
"setSpriteUnicorn":function(d){return "to a unicorn image"},
"setSpriteWitch":function(d){return "sorgin irudi batera"},
"setSpriteWizard":function(d){return "to a wizard image"},
"setSpritePositionTooltip":function(d){return "Toki zehatz batera aktorea berehala mugitzen du."},
"setSpriteK1Tooltip":function(d){return "Shows or hides the specified actor."},
"setSpriteTooltip":function(d){return "Aktorearen irudia ezartzen du"},
"setSpriteSizeRandom":function(d){return "to a random size"},
"setSpriteSizeVerySmall":function(d){return "to a very small size"},
"setSpriteSizeSmall":function(d){return "to a small size"},
"setSpriteSizeNormal":function(d){return "to a normal size"},
"setSpriteSizeLarge":function(d){return "to a large size"},
"setSpriteSizeVeryLarge":function(d){return "to a very large size"},
"setSpriteSizeTooltip":function(d){return "Sets the size of an actor"},
"setSpriteSpeedRandom":function(d){return "ausazko abiadura batera"},
"setSpriteSpeedVerySlow":function(d){return "abiadura oso motel batera"},
"setSpriteSpeedSlow":function(d){return "abiadura motel batera"},
"setSpriteSpeedNormal":function(d){return "abiadura normal batera"},
"setSpriteSpeedFast":function(d){return "abiadura azkar batera"},
"setSpriteSpeedVeryFast":function(d){return "abiadura oso azkar batera"},
"setSpriteSpeedTooltip":function(d){return "Aktore baten abiadura ezartzen du"},
"setSpriteZombie":function(d){return "to a zombie image"},
"shareStudioTwitter":function(d){return "Ikusi egin dudan istorioa. @codeorg-ekin idatzi dut nik bakarrik"},
"shareGame":function(d){return "Partekatu zure istorioa:"},
"showCoordinates":function(d){return "show coordinates"},
"showCoordinatesTooltip":function(d){return "show the protagonist's coordinates on the screen"},
"showTitleScreen":function(d){return "show title screen"},
"showTitleScreenTitle":function(d){return "title"},
"showTitleScreenText":function(d){return "testua"},
"showTSDefTitle":function(d){return "type title here"},
"showTSDefText":function(d){return "type text here"},
"showTitleScreenTooltip":function(d){return "Show a title screen with the associated title and text."},
"size":function(d){return "size"},
"setSprite":function(d){return "ezarri"},
"setSpriteN":function(d){return "set actor "+studio_locale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "crunch"},
"soundGoal1":function(d){return "goal 1"},
"soundGoal2":function(d){return "goal 2"},
"soundHit":function(d){return "hit"},
"soundLosePoint":function(d){return "lose point"},
"soundLosePoint2":function(d){return "lose point 2"},
"soundRetro":function(d){return "retro"},
"soundRubber":function(d){return "rubber"},
"soundSlap":function(d){return "slap"},
"soundWinPoint":function(d){return "win point"},
"soundWinPoint2":function(d){return "win point 2"},
"soundWood":function(d){return "wood"},
"speed":function(d){return "speed"},
"startSetValue":function(d){return "start (rocket-height function)"},
"startSetVars":function(d){return "game_vars (title, subtitle, background, target, danger, player)"},
"startSetFuncs":function(d){return "game_funcs (update-target, update-danger, update-player, collide?, on-screen?)"},
"stopSprite":function(d){return "geratu"},
"stopSpriteN":function(d){return "stop actor "+studio_locale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Aktore baten mugimendua geratzen du."},
"throwSprite":function(d){return "throw"},
"throwSpriteN":function(d){return "actor "+studio_locale.v(d,"spriteIndex")+" throw"},
"throwTooltip":function(d){return "Throws a projectile from the specified actor."},
"vanish":function(d){return "vanish"},
"vanishActorN":function(d){return "vanish actor "+studio_locale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "Vanishes the actor."},
"waitFor":function(d){return "wait for"},
"waitSeconds":function(d){return "seconds"},
"waitForClick":function(d){return "itxoin klikatzea"},
"waitForRandom":function(d){return "itxoin ausazkoa"},
"waitForHalfSecond":function(d){return "itxoin segundu erdia"},
"waitFor1Second":function(d){return "itxoin segundu 1"},
"waitFor2Seconds":function(d){return "itxoin 2 segundu"},
"waitFor5Seconds":function(d){return "itxoin 5 segundu"},
"waitFor10Seconds":function(d){return "itxoin 10 segundu"},
"waitParamsTooltip":function(d){return "Waits for a specified number of seconds or use zero to wait until a click occurs."},
"waitTooltip":function(d){return "Klikatzea edo denbora kopuru zehatz bat itxoiten ditu."},
"whenArrowDown":function(d){return "down arrow"},
"whenArrowLeft":function(d){return "left arrow"},
"whenArrowRight":function(d){return "right arrow"},
"whenArrowUp":function(d){return "up arrow"},
"whenArrowTooltip":function(d){return "Execute the actions below when the specified arrow key is pressed."},
"whenDown":function(d){return "beheko gezia sakatzean"},
"whenDownTooltip":function(d){return "Exekutatu behekaldeko ekintzak beheko gezidun tekla sakatzean."},
"whenGameStarts":function(d){return "isotorioa hasten denean"},
"whenGameStartsTooltip":function(d){return "Exekutatu beheko ekintzak istorioa hasten denean."},
"whenLeft":function(d){return "ezkerreko gezia sakatzean"},
"whenLeftTooltip":function(d){return "Exekutatu behekaldeko ekintzak ezkerreko gezidun tekla sakatzean."},
"whenRight":function(d){return "eskuineko gezia sakatzean"},
"whenRightTooltip":function(d){return "Exekutatu behekaldeko ekintzak eskubiko gezidun tekla sakatzean."},
"whenSpriteClicked":function(d){return "aktorea klikatzean"},
"whenSpriteClickedN":function(d){return "when actor "+studio_locale.v(d,"spriteIndex")+" clicked"},
"whenSpriteClickedTooltip":function(d){return "Aktorea klikatzen denean ekintza hauek exekutatu."},
"whenSpriteCollidedN":function(d){return "when actor "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "Exekutatu beheko ekintzak aktore batek beste bat ikutzen duenean."},
"whenSpriteCollidedWith":function(d){return "touches"},
"whenSpriteCollidedWithAnyActor":function(d){return "touches any actor"},
"whenSpriteCollidedWithAnyEdge":function(d){return "touches any edge"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "touches any projectile"},
"whenSpriteCollidedWithAnything":function(d){return "touches anything"},
"whenSpriteCollidedWithN":function(d){return "touches actor "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "touches blue fireball"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "touches purple fireball"},
"whenSpriteCollidedWithRedFireball":function(d){return "touches red fireball"},
"whenSpriteCollidedWithYellowHearts":function(d){return "touches yellow hearts"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "touches purple hearts"},
"whenSpriteCollidedWithRedHearts":function(d){return "touches red hearts"},
"whenSpriteCollidedWithBottomEdge":function(d){return "touches bottom edge"},
"whenSpriteCollidedWithLeftEdge":function(d){return "touches left edge"},
"whenSpriteCollidedWithRightEdge":function(d){return "touches right edge"},
"whenSpriteCollidedWithTopEdge":function(d){return "touches top edge"},
"whenUp":function(d){return "goiko gezia denean"},
"whenUpTooltip":function(d){return "Exekutatu behekaldeko ekintzak gora gezidun tekla sakatzean."},
"yes":function(d){return "Bai"}};