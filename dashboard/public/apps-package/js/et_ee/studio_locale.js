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
"actor":function(d){return "tegelaskuju"},
"alienInvasion":function(d){return "Alien Invasion!"},
"backgroundBlack":function(d){return "must"},
"backgroundCave":function(d){return "koobas"},
"backgroundCloudy":function(d){return "pilvine"},
"backgroundHardcourt":function(d){return "kõvakattega väljak"},
"backgroundNight":function(d){return "öö"},
"backgroundUnderwater":function(d){return "veealune"},
"backgroundCity":function(d){return "linn"},
"backgroundDesert":function(d){return "kõrb"},
"backgroundRainbow":function(d){return "vikerkaar"},
"backgroundSoccer":function(d){return "jalgpall"},
"backgroundSpace":function(d){return "kosmos"},
"backgroundTennis":function(d){return "tennis"},
"backgroundWinter":function(d){return "talv"},
"catActions":function(d){return "Tegevused"},
"catControl":function(d){return "Tsüklid"},
"catEvents":function(d){return "Sündmused"},
"catLogic":function(d){return "Loogika"},
"catMath":function(d){return "Matemaatika"},
"catProcedures":function(d){return "Funktsioonid"},
"catText":function(d){return "Tekst"},
"catVariables":function(d){return "Muutujad"},
"changeScoreTooltip":function(d){return "Lisa või lahuta tulemuselt üks punkt."},
"changeScoreTooltipK1":function(d){return "Lisa tulemusele punkt."},
"continue":function(d){return "Jätka"},
"decrementPlayerScore":function(d){return "lahuta tulemuselt punkt"},
"defaultSayText":function(d){return "sisesta siia"},
"emotion":function(d){return "tuju"},
"finalLevel":function(d){return "Tubli! Sa lahendasid viimase mõistatuse."},
"for":function(d){return "for"},
"hello":function(d){return "tere"},
"helloWorld":function(d){return "Tere, Maailm!"},
"incrementPlayerScore":function(d){return "lisa punkt"},
"makeProjectileDisappear":function(d){return "kaduma"},
"makeProjectileBounce":function(d){return "põrkama"},
"makeProjectileBlueFireball":function(d){return "loo sinine tulekera"},
"makeProjectilePurpleFireball":function(d){return "loo lilla tulekera"},
"makeProjectileRedFireball":function(d){return "loo punane tulekera"},
"makeProjectileYellowHearts":function(d){return "loo kollased südamed"},
"makeProjectilePurpleHearts":function(d){return "loo lillad südamed"},
"makeProjectileRedHearts":function(d){return "loo punased südamed"},
"makeProjectileTooltip":function(d){return "Make the projectile that just collided disappear or bounce."},
"makeYourOwn":function(d){return "Make Your Own Play Lab App"},
"moveDirectionDown":function(d){return "alla"},
"moveDirectionLeft":function(d){return "vasakule"},
"moveDirectionRight":function(d){return "paremale"},
"moveDirectionUp":function(d){return "üles"},
"moveDirectionRandom":function(d){return "juhuslik"},
"moveDistance25":function(d){return "25 pikslit"},
"moveDistance50":function(d){return "50 pikslit"},
"moveDistance100":function(d){return "100 pikslit"},
"moveDistance200":function(d){return "200 pikslit"},
"moveDistance400":function(d){return "400 pikslit"},
"moveDistancePixels":function(d){return "piksli võrra"},
"moveDistanceRandom":function(d){return "suvaline arv piksleid"},
"moveDistanceTooltip":function(d){return "Move an actor a specific distance in the specified direction."},
"moveSprite":function(d){return "move"},
"moveSpriteN":function(d){return "move actor "+appLocale.v(d,"spriteIndex")},
"toXY":function(d){return "to x,y"},
"moveDown":function(d){return "liigu alla"},
"moveDownTooltip":function(d){return "Move an actor down."},
"moveLeft":function(d){return "liigu vasakule"},
"moveLeftTooltip":function(d){return "Move an actor to the left."},
"moveRight":function(d){return "liigu paremale"},
"moveRightTooltip":function(d){return "Move an actor to the right."},
"moveUp":function(d){return "liigu üles"},
"moveUpTooltip":function(d){return "Move an actor up."},
"moveTooltip":function(d){return "Move an actor."},
"nextLevel":function(d){return "Palju õnne! See ülesanne on lahendatud."},
"no":function(d){return "Ei"},
"numBlocksNeeded":function(d){return "Selle ülesande saab lahendada %1 pusletükiga."},
"ouchExclamation":function(d){return "Ai!"},
"playSoundCrunch":function(d){return "lase heli \"krõbin\""},
"playSoundGoal1":function(d){return "lase heli \"värav 1\""},
"playSoundGoal2":function(d){return "lase heli \"värav 2\""},
"playSoundHit":function(d){return "lase heli \"löök\""},
"playSoundLosePoint":function(d){return "lase heli \"kaotasid punkti\""},
"playSoundLosePoint2":function(d){return "lase heli \"kaotasid punkti 2\""},
"playSoundRetro":function(d){return "lase heli \"retro\""},
"playSoundRubber":function(d){return "lase heli \"kumm\""},
"playSoundSlap":function(d){return "lase heli \"laks\""},
"playSoundTooltip":function(d){return "Lase valitud heli."},
"playSoundWinPoint":function(d){return "lase heli \"võidad punkti\""},
"playSoundWinPoint2":function(d){return "lase heli \"võidad punkti 2\""},
"playSoundWood":function(d){return "lase heli \"puit\""},
"positionOutTopLeft":function(d){return "to the above top left position"},
"positionOutTopRight":function(d){return "to the above top right position"},
"positionTopOutLeft":function(d){return "to the top outside left position"},
"positionTopLeft":function(d){return "to the top left position"},
"positionTopCenter":function(d){return "to the top center position"},
"positionTopRight":function(d){return "to the top right position"},
"positionTopOutRight":function(d){return "to the top outside right position"},
"positionMiddleLeft":function(d){return "to the middle left position"},
"positionMiddleCenter":function(d){return "to the middle center position"},
"positionMiddleRight":function(d){return "to the middle right position"},
"positionBottomOutLeft":function(d){return "to the bottom outside left position"},
"positionBottomLeft":function(d){return "to the bottom left position"},
"positionBottomCenter":function(d){return "to the bottom center position"},
"positionBottomRight":function(d){return "to the bottom right position"},
"positionBottomOutRight":function(d){return "to the bottom outside right position"},
"positionOutBottomLeft":function(d){return "to the below bottom left position"},
"positionOutBottomRight":function(d){return "to the below bottom right position"},
"positionRandom":function(d){return "to the random position"},
"projectileBlueFireball":function(d){return "sinine tulekera"},
"projectilePurpleFireball":function(d){return "lilla tulekera"},
"projectileRedFireball":function(d){return "punane tulekera"},
"projectileYellowHearts":function(d){return "kollased südamed"},
"projectilePurpleHearts":function(d){return "lillad südamed"},
"projectileRedHearts":function(d){return "punased südamed"},
"projectileRandom":function(d){return "juhuslik"},
"projectileAnna":function(d){return "Anna"},
"projectileElsa":function(d){return "Elsa"},
"projectileHiro":function(d){return "Hiro"},
"projectileBaymax":function(d){return "Baymax"},
"projectileRapunzel":function(d){return "Rapuntsel"},
"projectileCherry":function(d){return "cherry"},
"projectileIce":function(d){return "ice"},
"projectileDuck":function(d){return "duck"},
"reinfFeedbackMsg":function(d){return "You can press the \"Try again\" button to go back to playing your story."},
"repeatForever":function(d){return "repeat forever"},
"repeatDo":function(d){return "täida"},
"repeatForeverTooltip":function(d){return "Execute the actions in this block repeatedly while the story is running."},
"saySprite":function(d){return "ütle"},
"saySpriteN":function(d){return "actor "+appLocale.v(d,"spriteIndex")+" say"},
"saySpriteTooltip":function(d){return "Pop up a speech bubble with the associated text from the specified actor."},
"saySpriteChoices_1":function(d){return "Hi there!"},
"saySpriteChoices_2":function(d){return "How are you?"},
"saySpriteChoices_3":function(d){return "This is fun..."},
"scoreText":function(d){return "Tulemus: "+appLocale.v(d,"playerScore")},
"setBackground":function(d){return "vali taust"},
"setBackgroundRandom":function(d){return "vali suvaline taust"},
"setBackgroundBlack":function(d){return "vali musta värvi taust"},
"setBackgroundCave":function(d){return "vali taustaks koobas"},
"setBackgroundCloudy":function(d){return "vali pilvine taust"},
"setBackgroundHardcourt":function(d){return "vali taustaks kõvakattega väljak"},
"setBackgroundNight":function(d){return "vali öine taust"},
"setBackgroundUnderwater":function(d){return "vali veealune taust"},
"setBackgroundCity":function(d){return "vali taustaks linn"},
"setBackgroundDesert":function(d){return "vali taustaks kõrb"},
"setBackgroundRainbow":function(d){return "vali taustaks vikerkaar"},
"setBackgroundSoccer":function(d){return "vali taustaks jalgpall"},
"setBackgroundSpace":function(d){return "vali taustaks kosmos"},
"setBackgroundTennis":function(d){return "vali taustaks tennis"},
"setBackgroundWinter":function(d){return "vali talvine taust"},
"setBackgroundLeafy":function(d){return "set leafy background"},
"setBackgroundGrassy":function(d){return "set grassy background"},
"setBackgroundFlower":function(d){return "set flower background"},
"setBackgroundTile":function(d){return "set tile background"},
"setBackgroundIcy":function(d){return "set icy background"},
"setBackgroundSnowy":function(d){return "set snowy background"},
"setBackgroundTooltip":function(d){return "Valib taustapildi"},
"setEnemySpeed":function(d){return "set enemy speed"},
"setPlayerSpeed":function(d){return "set player speed"},
"setScoreText":function(d){return "set score"},
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
"setSpriteHidden":function(d){return "to a hidden image"},
"setSpriteHideK1":function(d){return "peida"},
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
"setSpriteRandom":function(d){return "to a random image"},
"setSpriteRobot":function(d){return "to a robot image"},
"setSpriteShowK1":function(d){return "show"},
"setSpriteSpacebot":function(d){return "to a spacebot image"},
"setSpriteSoccerGirl":function(d){return "to a soccer girl image"},
"setSpriteSoccerBoy":function(d){return "to a soccer boy image"},
"setSpriteSquirrel":function(d){return "to a squirrel image"},
"setSpriteTennisGirl":function(d){return "to a tennis girl image"},
"setSpriteTennisBoy":function(d){return "to a tennis boy image"},
"setSpriteUnicorn":function(d){return "to a unicorn image"},
"setSpriteWitch":function(d){return "to a witch image"},
"setSpriteWizard":function(d){return "to a wizard image"},
"setSpritePositionTooltip":function(d){return "Instantly moves an actor to the specified location."},
"setSpriteK1Tooltip":function(d){return "Shows or hides the specified actor."},
"setSpriteTooltip":function(d){return "Sets the actor image"},
"setSpriteSizeRandom":function(d){return "to a random size"},
"setSpriteSizeVerySmall":function(d){return "to a very small size"},
"setSpriteSizeSmall":function(d){return "to a small size"},
"setSpriteSizeNormal":function(d){return "to a normal size"},
"setSpriteSizeLarge":function(d){return "to a large size"},
"setSpriteSizeVeryLarge":function(d){return "to a very large size"},
"setSpriteSizeTooltip":function(d){return "Sets the size of an actor"},
"setSpriteSpeedRandom":function(d){return "to a random speed"},
"setSpriteSpeedVerySlow":function(d){return "to a very slow speed"},
"setSpriteSpeedSlow":function(d){return "to a slow speed"},
"setSpriteSpeedNormal":function(d){return "to a normal speed"},
"setSpriteSpeedFast":function(d){return "to a fast speed"},
"setSpriteSpeedVeryFast":function(d){return "to a very fast speed"},
"setSpriteSpeedTooltip":function(d){return "Sets the speed of an actor"},
"setSpriteZombie":function(d){return "to a zombie image"},
"shareStudioTwitter":function(d){return "Check out the story I made. I wrote it myself with @codeorg"},
"shareGame":function(d){return "Jaga oma lugu:"},
"showCoordinates":function(d){return "show coordinates"},
"showCoordinatesTooltip":function(d){return "show the protagonist's coordinates on the screen"},
"showTitleScreen":function(d){return "show title screen"},
"showTitleScreenTitle":function(d){return "pealkiri"},
"showTitleScreenText":function(d){return "tekst"},
"showTSDefTitle":function(d){return "sisesta pealkiri"},
"showTSDefText":function(d){return "sisesta tekst"},
"showTitleScreenTooltip":function(d){return "Show a title screen with the associated title and text."},
"size":function(d){return "suurus"},
"setSprite":function(d){return "väärtusta"},
"setSpriteN":function(d){return "set actor "+appLocale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "crunch"},
"soundGoal1":function(d){return "eesmärk 1"},
"soundGoal2":function(d){return "eesmärk 2"},
"soundHit":function(d){return "hit"},
"soundLosePoint":function(d){return "lose point"},
"soundLosePoint2":function(d){return "lose point 2"},
"soundRetro":function(d){return "retro"},
"soundRubber":function(d){return "kumm"},
"soundSlap":function(d){return "slap"},
"soundWinPoint":function(d){return "win point"},
"soundWinPoint2":function(d){return "win point 2"},
"soundWood":function(d){return "puit"},
"speed":function(d){return "kiirus"},
"startSetValue":function(d){return "start (rocket-height function)"},
"stopSprite":function(d){return "stop"},
"stopSpriteN":function(d){return "stop actor "+appLocale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Stops an actor's movement."},
"throwSprite":function(d){return "viska"},
"throwSpriteN":function(d){return "actor "+appLocale.v(d,"spriteIndex")+" throw"},
"throwTooltip":function(d){return "Throws a projectile from the specified actor."},
"vanish":function(d){return "vanish"},
"vanishActorN":function(d){return "vanish actor "+appLocale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "Vanishes the actor."},
"waitFor":function(d){return "oota"},
"waitSeconds":function(d){return "sekundit"},
"waitForClick":function(d){return "wait for click"},
"waitForRandom":function(d){return "wait for random"},
"waitForHalfSecond":function(d){return "oota pool sekundit"},
"waitFor1Second":function(d){return "oota 1 sekund"},
"waitFor2Seconds":function(d){return "oota 2 sekundit"},
"waitFor5Seconds":function(d){return "oota 5 sekundit"},
"waitFor10Seconds":function(d){return "oota 10 sekundit"},
"waitParamsTooltip":function(d){return "Waits for a specified number of seconds or use zero to wait until a click occurs."},
"waitTooltip":function(d){return "Waits for a specified amount of time or until a click occurs."},
"whenArrowDown":function(d){return "down arrow"},
"whenArrowLeft":function(d){return "left arrow"},
"whenArrowRight":function(d){return "right arrow"},
"whenArrowUp":function(d){return "up arrow"},
"whenArrowTooltip":function(d){return "Execute the actions below when the specified arrow key is pressed."},
"whenDown":function(d){return "kui vajutatakse allanoolt"},
"whenDownTooltip":function(d){return "Täida allolevad käsud, kui vajutatakse allanoolt."},
"whenGameStarts":function(d){return "kui lugu algab"},
"whenGameStartsTooltip":function(d){return "Execute the actions below when the story starts."},
"whenLeft":function(d){return "kui vajutatakse vasaknoolt"},
"whenLeftTooltip":function(d){return "Kui kasutaja vajutab vasakpoolset noolt, teosta järgmised toimingud."},
"whenRight":function(d){return "kui vajutatakse paremnoolt"},
"whenRightTooltip":function(d){return "Täida allolevad käsud, kui vajutatakse paremnoolt."},
"whenSpriteClicked":function(d){return "when actor clicked"},
"whenSpriteClickedN":function(d){return "when actor "+appLocale.v(d,"spriteIndex")+" clicked"},
"whenSpriteClickedTooltip":function(d){return "Execute the actions below when an actor is clicked."},
"whenSpriteCollidedN":function(d){return "when actor "+appLocale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "Execute the actions below when an actor touches another actor."},
"whenSpriteCollidedWith":function(d){return "touches"},
"whenSpriteCollidedWithAnyActor":function(d){return "touches any actor"},
"whenSpriteCollidedWithAnyEdge":function(d){return "touches any edge"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "touches any projectile"},
"whenSpriteCollidedWithAnything":function(d){return "touches anything"},
"whenSpriteCollidedWithN":function(d){return "touches actor "+appLocale.v(d,"spriteIndex")},
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
"whenUp":function(d){return "kui vajutatakse ülesnoolt"},
"whenUpTooltip":function(d){return "Täida allolevad käsud, kui vajutatakse ülesnoolt."},
"yes":function(d){return "Jah"}};