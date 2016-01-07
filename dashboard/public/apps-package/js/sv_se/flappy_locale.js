var flappy_locale = {lc:{"ar":function(n){
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
},"da":function(n){return n===1?"one":"other"},"de":function(n){return n===1?"one":"other"},"el":function(n){return n===1?"one":"other"},"es":function(n){return n===1?"one":"other"},"et":function(n){return n===1?"one":"other"},"eu":function(n){return n===1?"one":"other"},"fa":function(n){return "other"},"fi":function(n){return n===1?"one":"other"},"fil":function(n){return n===0||n==1?"one":"other"},"fr":function(n){return Math.floor(n)===0||Math.floor(n)==1?"one":"other"},"ga":function(n){return n==1?"one":(n==2?"two":"other")},"gl":function(n){return n===1?"one":"other"},"he":function(n){return n===1?"one":"other"},"hi":function(n){return n===0||n==1?"one":"other"},"hr":function(n){
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
},"mk":function(n){return (n%10)==1&&n!=11?"one":"other"},"mr":function(n){return n===1?"one":"other"},"ms":function(n){return "other"},"mt":function(n){
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
v:function(d,k){flappy_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){flappy_locale.c(d,k);return d[k] in p?p[d[k]]:(k=flappy_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){flappy_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).flappy_locale = {
"continue":function(d){return "Fortsätt"},
"doCode":function(d){return "gör"},
"elseCode":function(d){return "annars"},
"endGame":function(d){return "avsluta spelet"},
"endGameTooltip":function(d){return "Avslutar spelet."},
"finalLevel":function(d){return "Grattis! Du har löst den sista uppgiften."},
"flap":function(d){return "flaxa"},
"flapRandom":function(d){return "flaxa slumpmässigt antal gånger"},
"flapVerySmall":function(d){return "flaxa väldigt lite"},
"flapSmall":function(d){return "flaxa lite"},
"flapNormal":function(d){return "flaxa normalt"},
"flapLarge":function(d){return "flaxa mycket"},
"flapVeryLarge":function(d){return "flaxa väldigt mycket"},
"flapTooltip":function(d){return "Flyga Flappy uppåt."},
"flappySpecificFail":function(d){return "Din kod ser bra ut - den kommer att flaxa med varje klick. Men du måste klicka många gånger för att flaxa till målet."},
"incrementPlayerScore":function(d){return "Gör ett poäng"},
"incrementPlayerScoreTooltip":function(d){return "Lägg till ett till den nuvarande spelarens poängsumma."},
"nextLevel":function(d){return "Grattis! Du har klarat den här uppgiften."},
"no":function(d){return "Nej"},
"numBlocksNeeded":function(d){return "Den här uppgiften kan lösas med %1 block."},
"playSoundRandom":function(d){return "spela slumpmässigt ljud"},
"playSoundBounce":function(d){return "spela studsa ljud"},
"playSoundCrunch":function(d){return "spela krossa ljud"},
"playSoundDie":function(d){return "spela ledsen ljud"},
"playSoundHit":function(d){return "spela krasch ljud"},
"playSoundPoint":function(d){return "spela poäng ljud"},
"playSoundSwoosh":function(d){return "spela swoosh ljud"},
"playSoundWing":function(d){return "spela vinge ljud"},
"playSoundJet":function(d){return "spela jetplan ljud"},
"playSoundCrash":function(d){return "spela upp ett krasch-ljud"},
"playSoundJingle":function(d){return "spela upp ett pingel-ljud"},
"playSoundSplash":function(d){return "spela upp ett plask-ljud"},
"playSoundLaser":function(d){return "spela upp ett laser-ljud"},
"playSoundTooltip":function(d){return "Spela det valda ljudet."},
"reinfFeedbackMsg":function(d){return "Du kan klicka på \"Försök igen\" för att gå tillbaka till att spela ditt spel."},
"scoreText":function(d){return "Poäng: "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "Ange scen"},
"setBackgroundRandom":function(d){return "ange slumpmässig scen"},
"setBackgroundFlappy":function(d){return "ange stads-scen (dag)"},
"setBackgroundNight":function(d){return "ange stads-scen (natt)"},
"setBackgroundSciFi":function(d){return "ange science-fiction-scen"},
"setBackgroundUnderwater":function(d){return "ange undervattens-scen"},
"setBackgroundCave":function(d){return "ange grott-scen"},
"setBackgroundSanta":function(d){return "ange jultomte-scen"},
"setBackgroundTooltip":function(d){return "Ange bakgrundsbild"},
"setGapRandom":function(d){return "ange slumpmässigt mellanrum"},
"setGapVerySmall":function(d){return "ange ett väldigt litet mellanrum"},
"setGapSmall":function(d){return "ange ett litet mellanrum"},
"setGapNormal":function(d){return "ange ett normalt mellanrum"},
"setGapLarge":function(d){return "ange ett stort mellanrum"},
"setGapVeryLarge":function(d){return "ange ett väldigt stort mellanrum"},
"setGapHeightTooltip":function(d){return "Anger det vertikala mellanrummet i ett hinder"},
"setGravityRandom":function(d){return "ange slumpmässig gravitation"},
"setGravityVeryLow":function(d){return "ange väldigt låg gravitation"},
"setGravityLow":function(d){return "ange låg gravitation"},
"setGravityNormal":function(d){return "ange normal gravitation"},
"setGravityHigh":function(d){return "ange hög gravitation"},
"setGravityVeryHigh":function(d){return "ange väldigt hög gravitation"},
"setGravityTooltip":function(d){return "Anger nivåns gravitation"},
"setGround":function(d){return "Ange mark"},
"setGroundRandom":function(d){return "ange slumpmässig mark"},
"setGroundFlappy":function(d){return "ange vanlig mark"},
"setGroundSciFi":function(d){return "ange science-fiction-mark"},
"setGroundUnderwater":function(d){return "ange undervattens-mark"},
"setGroundCave":function(d){return "ange grott-mark"},
"setGroundSanta":function(d){return "ange jultomte-mark"},
"setGroundLava":function(d){return "ange lava-mark"},
"setGroundTooltip":function(d){return "Anger mark-bilden"},
"setObstacle":function(d){return "ange hinder"},
"setObstacleRandom":function(d){return "ange slumpmässigt hinder"},
"setObstacleFlappy":function(d){return "ange rör-hinder"},
"setObstacleSciFi":function(d){return "ange science-fiction-hinder"},
"setObstacleUnderwater":function(d){return "ange växt-hinder"},
"setObstacleCave":function(d){return "ange grott-hinder"},
"setObstacleSanta":function(d){return "ange skorstens-hinder"},
"setObstacleLaser":function(d){return "ange laser-hinder"},
"setObstacleTooltip":function(d){return "Anger hinder-bild"},
"setPlayer":function(d){return "ange spelare"},
"setPlayerRandom":function(d){return "ange slumpmässig spelare"},
"setPlayerFlappy":function(d){return "ange gul fågel som spelare"},
"setPlayerRedBird":function(d){return "ange röd fågel som spelare"},
"setPlayerSciFi":function(d){return "ange rymdskepp som spelare"},
"setPlayerUnderwater":function(d){return "ange fisk som spelare"},
"setPlayerCave":function(d){return "ange fladdermus som spelare"},
"setPlayerSanta":function(d){return "ange jultomten som spelare"},
"setPlayerShark":function(d){return "ange haj som spelare"},
"setPlayerEaster":function(d){return "ange påskharen som spelare"},
"setPlayerBatman":function(d){return "ange Bat-killen som spelare"},
"setPlayerSubmarine":function(d){return "ange ubåt som spelare"},
"setPlayerUnicorn":function(d){return "ange enhörning som spelare"},
"setPlayerFairy":function(d){return "ange älva som spelare"},
"setPlayerSuperman":function(d){return "ange Flaxmannen som spelare"},
"setPlayerTurkey":function(d){return "ange kalkon som spelare"},
"setPlayerTooltip":function(d){return "Anger spelarens bild"},
"setScore":function(d){return "anger poäng"},
"setScoreTooltip":function(d){return "Anger spelarens poäng"},
"setSpeed":function(d){return "ange hastighet"},
"setSpeedTooltip":function(d){return "Anger nivåns hastighet"},
"shareFlappyTwitter":function(d){return "Kolla in Flappyspelet jag gjort. Jag skrev det själv med @codeorg"},
"shareGame":function(d){return "Dela ditt spel:"},
"soundRandom":function(d){return "slumpad"},
"soundBounce":function(d){return "studsa"},
"soundCrunch":function(d){return "krasch"},
"soundDie":function(d){return "ledsen"},
"soundHit":function(d){return "smash"},
"soundPoint":function(d){return "punkt"},
"soundSwoosh":function(d){return "swoosh"},
"soundWing":function(d){return "vinge"},
"soundJet":function(d){return "Jet"},
"soundCrash":function(d){return "krasch"},
"soundJingle":function(d){return "jingel"},
"soundSplash":function(d){return "splash"},
"soundLaser":function(d){return "laser"},
"speedRandom":function(d){return "ange slumpmässig hastighet"},
"speedVerySlow":function(d){return "ange väldigt långsam hastighet"},
"speedSlow":function(d){return "ange långsam hastighet"},
"speedNormal":function(d){return "ange normal hastighet"},
"speedFast":function(d){return "ange snabb hastighet"},
"speedVeryFast":function(d){return "ange väldigt snabb hastighet"},
"whenClick":function(d){return "när ett klick sker"},
"whenClickTooltip":function(d){return "Utför kommandona nedan när en klick-händelse inträffar."},
"whenCollideGround":function(d){return "när slår i marken"},
"whenCollideGroundTooltip":function(d){return "Utför kommandona nedan när Flappy träffar marken."},
"whenCollideObstacle":function(d){return "när träffar ett hinder"},
"whenCollideObstacleTooltip":function(d){return "Utför kommandona nedan när Flappy träffar ett hinder."},
"whenEnterObstacle":function(d){return "när passerar ett hinder"},
"whenEnterObstacleTooltip":function(d){return "Utför kommandona nedan när Flappy åker genom ett hinder."},
"whenRunButtonClick":function(d){return "när spelet börjar"},
"whenRunButtonClickTooltip":function(d){return "Utför kommandona nedan när spelet startar."},
"yes":function(d){return "Ja"}};