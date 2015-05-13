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
v:function(d,k){flappy_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){flappy_locale.c(d,k);return d[k] in p?p[d[k]]:(k=flappy_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){flappy_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).flappy_locale = {
"continue":function(d){return "Magpatuloy"},
"doCode":function(d){return "gawin"},
"elseCode":function(d){return "kung hindi"},
"endGame":function(d){return "tapusin ang laro"},
"endGameTooltip":function(d){return "Tinatapos ang laro."},
"finalLevel":function(d){return "Maligayang pagbati! Nalutas mo na ang pinakahuling puzzle."},
"flap":function(d){return "flap"},
"flapRandom":function(d){return "mag-flap ng random na amount"},
"flapVerySmall":function(d){return "mag-flap ng napakaliit na amount"},
"flapSmall":function(d){return "mag-flap ng maliit na amount"},
"flapNormal":function(d){return "mag-flap ng normal na amount"},
"flapLarge":function(d){return "mag-flap ng malaki na amount"},
"flapVeryLarge":function(d){return "mag-flap ng napakalaking amount"},
"flapTooltip":function(d){return "Paliparin ang Flappy pataas."},
"flappySpecificFail":function(d){return "Ang iyong code ay mukhang maganda - ito ay lilipad sa isang click lamang. Ngunit kailangan mo ito i-click ng maraming beses hanggang sa iyong target."},
"incrementPlayerScore":function(d){return "mag-score ng puntos"},
"incrementPlayerScoreTooltip":function(d){return "Magdagdag ng isa sa kasalukuyang score ng manlalaro."},
"nextLevel":function(d){return "Maligayang pagbati! Natapos mo ang puzzle na ito."},
"no":function(d){return "Hindi"},
"numBlocksNeeded":function(d){return "Ang puzzle na ito ay maaaring malutas sa %1 na mga block."},
"playSoundRandom":function(d){return "magpatugtog ng random na tunog"},
"playSoundBounce":function(d){return "magpatugtog ng bounce na tunog"},
"playSoundCrunch":function(d){return "magpatugtog ng crunch na tunog"},
"playSoundDie":function(d){return "magpatugtog ng malungkot na tunog"},
"playSoundHit":function(d){return "magpatugtog ng smash na tunog"},
"playSoundPoint":function(d){return "magpatugtog ng point na tunog"},
"playSoundSwoosh":function(d){return "magpatugtog ng swoosh na tunog"},
"playSoundWing":function(d){return "magpatugtog ng wing na tunog"},
"playSoundJet":function(d){return "magpatugtog ng jet na tunog"},
"playSoundCrash":function(d){return "magpatugtog ng crash na tunog"},
"playSoundJingle":function(d){return "magpatugtog ng jingle na tunog"},
"playSoundSplash":function(d){return "magpatugtog ng splash na tunog"},
"playSoundLaser":function(d){return "magpatugtog ng laser na tunog"},
"playSoundTooltip":function(d){return "Magpatugtog ng napiling tunog."},
"reinfFeedbackMsg":function(d){return "Maaarin mo pindutin ang \"Subukan muli\" na button upang bumalik sa paglalaro."},
"scoreText":function(d){return "Puntos: "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "i-set ang scene"},
"setBackgroundRandom":function(d){return "i-set ang scene sa Random"},
"setBackgroundFlappy":function(d){return "i-set ang scene sa Siyudad (umaga)"},
"setBackgroundNight":function(d){return "I-set ang scene sa Siyudad (gabi)"},
"setBackgroundSciFi":function(d){return "i-set ang scene sa Sci-Fi"},
"setBackgroundUnderwater":function(d){return "I-set ang scene sa Ilalim ng dagat"},
"setBackgroundCave":function(d){return "i-set ang scene sa Kuweba"},
"setBackgroundSanta":function(d){return "i-set ang scene sa Santa"},
"setBackgroundTooltip":function(d){return "Nilalagay ang larawan sa background"},
"setGapRandom":function(d){return "mag-set ng random na gap"},
"setGapVerySmall":function(d){return "mag-set ng napakaliit na gap"},
"setGapSmall":function(d){return "mag-set ng maliit na gap"},
"setGapNormal":function(d){return "maglagay ng normal na gap"},
"setGapLarge":function(d){return "maglagay ng malaki na gap"},
"setGapVeryLarge":function(d){return "maglagay ng napakalaking gap"},
"setGapHeightTooltip":function(d){return "Nilalagay ang vertical na gap sa isang obstacle"},
"setGravityRandom":function(d){return "ilagay ang gravity sa random"},
"setGravityVeryLow":function(d){return "ilagay ang gravity sa napakababa"},
"setGravityLow":function(d){return "ilagay ang gravity sa mababa"},
"setGravityNormal":function(d){return "ilagay ang gravity sa normal"},
"setGravityHigh":function(d){return "i-set ang gravity sa mataas"},
"setGravityVeryHigh":function(d){return "i-set ang gravity sa pinakamataas"},
"setGravityTooltip":function(d){return "Nilalagay ang level ng gravity"},
"setGround":function(d){return "i-set ang ground"},
"setGroundRandom":function(d){return "i-set ang ground sa Random"},
"setGroundFlappy":function(d){return "i-set ang ground sa Ground"},
"setGroundSciFi":function(d){return "i-set ang ground sa Sci-Fi"},
"setGroundUnderwater":function(d){return "ilagay ang ground sa Underwater"},
"setGroundCave":function(d){return "ilagay ang ground sa Cave"},
"setGroundSanta":function(d){return "ilagay ang ground sa Santa"},
"setGroundLava":function(d){return "ilagay ang ground sa Lava"},
"setGroundTooltip":function(d){return "Nilalagay ang imahe ng ground"},
"setObstacle":function(d){return "i-set ang obstacle"},
"setObstacleRandom":function(d){return "ilagay ang obstacle sa Random"},
"setObstacleFlappy":function(d){return "ilagay ang obstacle sa Pipe"},
"setObstacleSciFi":function(d){return "ilagay ang obstacle sa Sci-Fi"},
"setObstacleUnderwater":function(d){return "ilagay ang obstacle sa Paint"},
"setObstacleCave":function(d){return "ilagay ang obstacle sa Cave"},
"setObstacleSanta":function(d){return "ilagay ang obstacle sa Chimney"},
"setObstacleLaser":function(d){return "ilagay ang obstacle sa Laser"},
"setObstacleTooltip":function(d){return "Nilalagay ang imahe ng obstacle"},
"setPlayer":function(d){return "i-set ang player"},
"setPlayerRandom":function(d){return "ilagay ang player sa Random"},
"setPlayerFlappy":function(d){return "ilagay ang player sa Yellow Bird"},
"setPlayerRedBird":function(d){return "ilagay ang player sa Pulang Ibon"},
"setPlayerSciFi":function(d){return "ilagay ang player sa Spaceship"},
"setPlayerUnderwater":function(d){return "ilagay ang player sa Isda"},
"setPlayerCave":function(d){return "ilagay ang player sa Paniki"},
"setPlayerSanta":function(d){return "ilagay ang player sa Santa"},
"setPlayerShark":function(d){return "ilagay ang player sa Shark"},
"setPlayerEaster":function(d){return "ilagay ang player sa Easter Bunny"},
"setPlayerBatman":function(d){return "ilagay ang player sa Bat guy"},
"setPlayerSubmarine":function(d){return "ilagay ang player sa Submarine"},
"setPlayerUnicorn":function(d){return "ilagay ang player sa Unicorn"},
"setPlayerFairy":function(d){return "ilagay ang player sa Fairy"},
"setPlayerSuperman":function(d){return "ilagay ang player sa Flappyman"},
"setPlayerTurkey":function(d){return "ilagay ang player sa Turkey"},
"setPlayerTooltip":function(d){return "Nilalagay ang imahe ng manlalaro"},
"setScore":function(d){return "ilagay ang puntos"},
"setScoreTooltip":function(d){return "Nilalagay ang puntos ng manlalaro"},
"setSpeed":function(d){return "ilagay ang bilis"},
"setSpeedTooltip":function(d){return "Nilalagay ang bilis ng level"},
"shareFlappyTwitter":function(d){return "Tingnan ang larong Bounce na ginawa ko. Ako mismo ang nagsulat nito sa @codeorg"},
"shareGame":function(d){return "Ibahagi ang iyong laro:"},
"soundRandom":function(d){return "nang hindi pinipili"},
"soundBounce":function(d){return "bounce"},
"soundCrunch":function(d){return "crunch"},
"soundDie":function(d){return "malungkot"},
"soundHit":function(d){return "smash"},
"soundPoint":function(d){return "puntos"},
"soundSwoosh":function(d){return "swoosh"},
"soundWing":function(d){return "pakpak"},
"soundJet":function(d){return "jet"},
"soundCrash":function(d){return "crash"},
"soundJingle":function(d){return "jingle"},
"soundSplash":function(d){return "splash"},
"soundLaser":function(d){return "laser"},
"speedRandom":function(d){return "ilagay ang bilis sa random"},
"speedVerySlow":function(d){return "ilagay ang bilis sa napakabagal"},
"speedSlow":function(d){return "ilagay ang bilis sa mabagal"},
"speedNormal":function(d){return "ilagay ang bilis sa normal"},
"speedFast":function(d){return "ilagay ang bilis sa mabilis"},
"speedVeryFast":function(d){return "ilagay ang bilis sa napakabilis"},
"whenClick":function(d){return "kapag pinipindot"},
"whenClickTooltip":function(d){return "Ipatupad ang mga aksyon sa ibaba kapag naganap ang isang kaganapan sa pag-click."},
"whenCollideGround":function(d){return "kapag tinamaan ang lupa"},
"whenCollideGroundTooltip":function(d){return "Ipatupad ang mga aksyon sa ibaba kapag tinamaan ng Flappy ang lupa."},
"whenCollideObstacle":function(d){return "kapag tinamaan ang obstacle"},
"whenCollideObstacleTooltip":function(d){return "Ipatupad ang mga aksyon sa ibaba kapag may tinamaan ang Flappy na obstacle."},
"whenEnterObstacle":function(d){return "kapag dinadaanan ang obstacle"},
"whenEnterObstacleTooltip":function(d){return "Ipatupad ang mga aksyon sa ibaba kapag may tinamaan ang Flappy na obstacle."},
"whenRunButtonClick":function(d){return "kapag nagsimula ang laro"},
"whenRunButtonClickTooltip":function(d){return "Ipatupad ang mga aksyon sa ibaba kapag nagsisimula ang laro."},
"yes":function(d){return "Oo"}};