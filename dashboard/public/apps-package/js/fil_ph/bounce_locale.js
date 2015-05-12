var bounce_locale = {lc:{"ar":function(n){
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
v:function(d,k){bounce_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){bounce_locale.c(d,k);return d[k] in p?p[d[k]]:(k=bounce_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){bounce_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).bounce_locale = {
"bounceBall":function(d){return "bounce ball"},
"bounceBallTooltip":function(d){return "Patalbugin ang bola paalis sa bagay."},
"continue":function(d){return "Magpatuloy"},
"dirE":function(d){return "E"},
"dirN":function(d){return "N"},
"dirS":function(d){return "S"},
"dirW":function(d){return "W"},
"doCode":function(d){return "gawin"},
"elseCode":function(d){return "else"},
"finalLevel":function(d){return "Maligayang pagbati! Nalutas mo na ang pinakahuling puzzle."},
"heightParameter":function(d){return "taas"},
"ifCode":function(d){return "kung"},
"ifPathAhead":function(d){return "kung ang daan sa unahan"},
"ifTooltip":function(d){return "Kung meron daanan sa tinukay na direksyon, kung gayon ay gumawa ng mga aksyon."},
"ifelseTooltip":function(d){return "Kung meron daan sa nasabing direksyon, kung gayon ay gawin ang unang bloke ng mga aksyon. Kung hindi, gawin ang pangalawang bloke ng mga aksyon."},
"incrementOpponentScore":function(d){return "iskor puntos ng kalaban"},
"incrementOpponentScoreTooltip":function(d){return "Magdagdag ng isa sa kasalukuyang score ng kalaban."},
"incrementPlayerScore":function(d){return "score point"},
"incrementPlayerScoreTooltip":function(d){return "Magdagdag ng isa sa kasalukuyang score ng manlalaro."},
"isWall":function(d){return "ito ba ay pader"},
"isWallTooltip":function(d){return "Ire-return na true kung meron pader dito"},
"launchBall":function(d){return "gumamit ng bagong bola"},
"launchBallTooltip":function(d){return "Gumamit ng bola sa paglalaro."},
"makeYourOwn":function(d){return "Gumawa ng sarili mong Bounce Game"},
"moveDown":function(d){return "igalaw pababa"},
"moveDownTooltip":function(d){return "Galawin ang paddle pababa."},
"moveForward":function(d){return "umabante"},
"moveForwardTooltip":function(d){return "Igalaw ako ng paunahan ng isang puwang."},
"moveLeft":function(d){return "igalaw pakaliwa"},
"moveLeftTooltip":function(d){return "Galawin ang paddle papunta sa kaliwa."},
"moveRight":function(d){return "igalaw pakanan"},
"moveRightTooltip":function(d){return "Galawin ang paddle papunta sa kanan."},
"moveUp":function(d){return "igalaw pataas"},
"moveUpTooltip":function(d){return "Galawin ang paddle papunta sa taas."},
"nextLevel":function(d){return "Maligayang pagbati! Natapos mo ang puzzle na ito."},
"no":function(d){return "Hindi"},
"noPathAhead":function(d){return "ang daanan ay nahaharangan"},
"noPathLeft":function(d){return "walang daanan pakaliwa"},
"noPathRight":function(d){return "walang daanan pakanan"},
"numBlocksNeeded":function(d){return "Ang puzzle na ito ay maaaring malutas sa %1 na mga block."},
"pathAhead":function(d){return "ang daan sa unahan"},
"pathLeft":function(d){return "kung ang daan sa kaliwa"},
"pathRight":function(d){return "kung ang daan sa kanan"},
"pilePresent":function(d){return "meron mga tambak"},
"playSoundCrunch":function(d){return "magpatugtog ng crunch na tunog"},
"playSoundGoal1":function(d){return "patugtugin ang goal 1 na tunog"},
"playSoundGoal2":function(d){return "patugtugin ang goal 2 na tunog"},
"playSoundHit":function(d){return "patugtugin ang hit na tunog"},
"playSoundLosePoint":function(d){return "patugtugin ang lose point na tunog"},
"playSoundLosePoint2":function(d){return "patugtugin ang lose point 2 na tunog"},
"playSoundRetro":function(d){return "pagtugtugin ang retro na tunog"},
"playSoundRubber":function(d){return "patugtugin ang rubber na tunog"},
"playSoundSlap":function(d){return "patugtugin ang slap na tunog"},
"playSoundTooltip":function(d){return "Magpatugtog ng napiling tunog."},
"playSoundWinPoint":function(d){return "patugtugin ang win point na tunog"},
"playSoundWinPoint2":function(d){return "patugtugin ang win point 2 na tunog"},
"playSoundWood":function(d){return "patugtugin ang wood sound"},
"putdownTower":function(d){return "ibaba ang tore"},
"reinfFeedbackMsg":function(d){return "Maaarin mo pindutin ang \"Subukan muli\" na button upang bumalik sa paglalaro."},
"removeSquare":function(d){return "alisin ang parisukat"},
"repeatUntil":function(d){return "ulitin hanggang"},
"repeatUntilBlocked":function(d){return "habang ang daan ay diretso"},
"repeatUntilFinish":function(d){return "ulitin hanggang matapos"},
"scoreText":function(d){return "Puntos: "+bounce_locale.v(d,"playerScore")+" : "+bounce_locale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "ilagay ang random na scene"},
"setBackgroundHardcourt":function(d){return "ilagay ang hardcourt na scene"},
"setBackgroundRetro":function(d){return "ilagay ang retro na scene"},
"setBackgroundTooltip":function(d){return "Nilalagay ang imahe ng background"},
"setBallRandom":function(d){return "ilagay ang random na bola"},
"setBallHardcourt":function(d){return "ilagay ang hardcourt na bola"},
"setBallRetro":function(d){return "ilagay ang retro na bola"},
"setBallTooltip":function(d){return "Nilalagay ang larawan ng bola"},
"setBallSpeedRandom":function(d){return "ilagay ang random na bilis ng bola"},
"setBallSpeedVerySlow":function(d){return "ilagay sa napakabagal na bilis ang bola"},
"setBallSpeedSlow":function(d){return "ilagay sa mabagal na bilis ang bola"},
"setBallSpeedNormal":function(d){return "ilagay sa normal na bilis ang bola"},
"setBallSpeedFast":function(d){return "ilagay sa mabilis na bilis ang bola"},
"setBallSpeedVeryFast":function(d){return "ilagay  sa pinakamabilis ang bilis ng bola"},
"setBallSpeedTooltip":function(d){return "Nilalagay ang bilis ng bola"},
"setPaddleRandom":function(d){return "ilagay ang random na pamalo"},
"setPaddleHardcourt":function(d){return "ilagay ang hardcourt na pamalo"},
"setPaddleRetro":function(d){return "ilagay ang retro na pamalo"},
"setPaddleTooltip":function(d){return "Nilalagay ang larawan ng pamalo"},
"setPaddleSpeedRandom":function(d){return "ilagay ang random na bilis ng pamalo"},
"setPaddleSpeedVerySlow":function(d){return "ilagay sa napakabagal na bilis ang pamalo"},
"setPaddleSpeedSlow":function(d){return "ilagay sa mabagal na bilis ang pamalo"},
"setPaddleSpeedNormal":function(d){return "ilagay sa normal na bilis ang pamalo"},
"setPaddleSpeedFast":function(d){return "ilagay ang mabilis na bilis ang pamalo"},
"setPaddleSpeedVeryFast":function(d){return "ilagay ang pinakamabilis na bilis ng pamalo"},
"setPaddleSpeedTooltip":function(d){return "Nilalagay ang bilis ng pamalo"},
"shareBounceTwitter":function(d){return "Tingnan ang larong Bounce na ginawa ko. Ako mismo ang nagsulat nito sa @codeorg"},
"shareGame":function(d){return "Ibahagi ang iyong laro:"},
"turnLeft":function(d){return "kumaliwa"},
"turnRight":function(d){return "kumanan"},
"turnTooltip":function(d){return "Iniikot ako pakaliwa o pakanan ng 90 degrees."},
"whenBallInGoal":function(d){return "habang ang bola ay nasa goal"},
"whenBallInGoalTooltip":function(d){return "I-execute ang mga aksyon sa ibaba habang ang bola ay papasok ng goal."},
"whenBallMissesPaddle":function(d){return "kapag na miss ng bola ang paddle"},
"whenBallMissesPaddleTooltip":function(d){return "I-execute ang mga aksyon sa ibaba kapag na miss ng bola ang paddle."},
"whenDown":function(d){return "kapag ang pababang arrow"},
"whenDownTooltip":function(d){return "Ipatupad ang mga aksyon sa ibaba kapag ang pataas na arrow key ay pinindot."},
"whenGameStarts":function(d){return "kapag nagsimula ang laro"},
"whenGameStartsTooltip":function(d){return "Ipatupad ang mga aksyon sa ibaba kapag nagsisimula ang laro."},
"whenLeft":function(d){return "kapag ang kaliwa na arrow"},
"whenLeftTooltip":function(d){return "Ipatupad ang mga aksyon sa ibaba kapag ang pataas na arrow key ay pinindot."},
"whenPaddleCollided":function(d){return "kapag tumama ang bola sa paddle"},
"whenPaddleCollidedTooltip":function(d){return "I-execute ang mga aksyon sa ibaba kapag ang bola ay tumama sa paddle."},
"whenRight":function(d){return "kapag ang kanan na arrow"},
"whenRightTooltip":function(d){return "Ipatupad ang mga aksyon sa ibaba kapag ang pataas na arrow key ay pinindot."},
"whenUp":function(d){return "kapag ang pataas na arrow"},
"whenUpTooltip":function(d){return "Ipatupad ang mga aksyon sa ibaba kapag ang pataas na arrow key ay pinindot."},
"whenWallCollided":function(d){return "kapag ang bola ay tumama sa pader"},
"whenWallCollidedTooltip":function(d){return "I-execute ang mga aksyon sa ibaba kapag ang bola ay tumama sa pader."},
"whileMsg":function(d){return "habang"},
"whileTooltip":function(d){return "Ulitin ang mga nakalakip na mga aksyon hanggang ang dulo ay maabot."},
"yes":function(d){return "Oo"}};