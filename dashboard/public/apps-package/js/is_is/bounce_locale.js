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
"bounceBall":function(d){return "skoppa bolta"},
"bounceBallTooltip":function(d){return "Láta bolta skoppa af hlut."},
"continue":function(d){return "Áfram"},
"dirE":function(d){return "A"},
"dirN":function(d){return "N"},
"dirS":function(d){return "S"},
"dirW":function(d){return "V"},
"doCode":function(d){return "gera"},
"elseCode":function(d){return "annars"},
"finalLevel":function(d){return "Til hamingju! Þú hefur leyst síðustu þrautina."},
"heightParameter":function(d){return "hæð"},
"ifCode":function(d){return "ef"},
"ifPathAhead":function(d){return "ef slóð framundan"},
"ifTooltip":function(d){return "Ef það er slóð í tiltekna stefnu þá á að gera eitthvað."},
"ifelseTooltip":function(d){return "Ef það er slóð í tiltekna stefnu, þá að gera fyrri kubbastæðuna. Annars á að gera seinni kubbastæðuna."},
"incrementOpponentScore":function(d){return "gefa andstæðingi stig"},
"incrementOpponentScoreTooltip":function(d){return "Bæta 1 við núverandi skor andstæðings."},
"incrementPlayerScore":function(d){return "skora stig"},
"incrementPlayerScoreTooltip":function(d){return "Bæta einu stigi við núverandi stöðu."},
"isWall":function(d){return "er þetta veggur"},
"isWallTooltip":function(d){return "Skilar gildinu satt ef það er veggur hér"},
"launchBall":function(d){return "nýr bolti"},
"launchBallTooltip":function(d){return "Setja nýjan bolta i leik."},
"makeYourOwn":function(d){return "Búa til eigin boltaleik"},
"moveDown":function(d){return "færa niður"},
"moveDownTooltip":function(d){return "Færa spaðann niður."},
"moveForward":function(d){return "færa áfram"},
"moveForwardTooltip":function(d){return "Færa mig áfram um einn reit."},
"moveLeft":function(d){return "færa til vinstri"},
"moveLeftTooltip":function(d){return "Færa spaðann til vinstri."},
"moveRight":function(d){return "færa til hægri"},
"moveRightTooltip":function(d){return "Færa spaðann til hægri."},
"moveUp":function(d){return "færa upp"},
"moveUpTooltip":function(d){return "Færa spaðann upp."},
"nextLevel":function(d){return "Til hamingju! Þú hefur klárað þessa þraut."},
"no":function(d){return "Nei"},
"noPathAhead":function(d){return "slóðin er lokuð"},
"noPathLeft":function(d){return "engin slóð til vinstri"},
"noPathRight":function(d){return "engin slóð til hægri"},
"numBlocksNeeded":function(d){return "Þessa þraut er hægt að leysa með %1 kubbum."},
"pathAhead":function(d){return "slóð framundan"},
"pathLeft":function(d){return "ef slóð til vinstri"},
"pathRight":function(d){return "ef slóð til hægri"},
"pilePresent":function(d){return "það er haugur"},
"playSoundCrunch":function(d){return "spila kremjuhljóð"},
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
"putdownTower":function(d){return "setja niður turn"},
"reinfFeedbackMsg":function(d){return "Þú getur smellt á \"Reyna aftur\" hnappinn til þess að spila leikinn aftur."},
"removeSquare":function(d){return "fjarlægja ferning"},
"repeatUntil":function(d){return "endurtaka þar til"},
"repeatUntilBlocked":function(d){return "meðan slóð framundan"},
"repeatUntilFinish":function(d){return "endurtaka þar til búið"},
"scoreText":function(d){return "Skor: "+bounce_locale.v(d,"playerScore")+" : "+bounce_locale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "handahófsumhverfi"},
"setBackgroundHardcourt":function(d){return "vallarumhverfi"},
"setBackgroundRetro":function(d){return "eldra umhverfi"},
"setBackgroundTooltip":function(d){return "Stillir bakgrunnsmynd"},
"setBallRandom":function(d){return "handahófsbolti"},
"setBallHardcourt":function(d){return "vallarbolti"},
"setBallRetro":function(d){return "eldri bolti"},
"setBallTooltip":function(d){return "Stillir gerð bolta"},
"setBallSpeedRandom":function(d){return "stilla á handahófshraða bolta"},
"setBallSpeedVerySlow":function(d){return "stilla á mjög hægfara bolta"},
"setBallSpeedSlow":function(d){return "stilla á hægan bolta"},
"setBallSpeedNormal":function(d){return "stilla á venjulegan hraða bolta"},
"setBallSpeedFast":function(d){return "stilla á hraðan bolta"},
"setBallSpeedVeryFast":function(d){return "stilla á mjög hraðan bolta"},
"setBallSpeedTooltip":function(d){return "Stillir hraða boltans"},
"setPaddleRandom":function(d){return "stilla á handahófsspaða"},
"setPaddleHardcourt":function(d){return "stilla á vallarspaða"},
"setPaddleRetro":function(d){return "stilla á retro spaða"},
"setPaddleTooltip":function(d){return "Stillir gerð spaða"},
"setPaddleSpeedRandom":function(d){return "stilla á handahófshraða spaða"},
"setPaddleSpeedVerySlow":function(d){return "stilla á mjög hægan spaða"},
"setPaddleSpeedSlow":function(d){return "stilla á hægan spaða"},
"setPaddleSpeedNormal":function(d){return "stilla á venjulega hraðan spaða"},
"setPaddleSpeedFast":function(d){return "stilla á hraðan spaða"},
"setPaddleSpeedVeryFast":function(d){return "stilla á mjög hraðan spaða"},
"setPaddleSpeedTooltip":function(d){return "Stillir hraða spaðans"},
"shareBounceTwitter":function(d){return "Kíktu á boltaleikinn sem ég bjó til. Ég skrifaði hann með @codeorg"},
"shareGame":function(d){return "Deildu leiknum þínum:"},
"turnLeft":function(d){return "snúa til vinstri"},
"turnRight":function(d){return "snúa til hægri"},
"turnTooltip":function(d){return "Snýr mér til vinstri eða hægri um 90 gráður."},
"whenBallInGoal":function(d){return "þegar bolti í marki"},
"whenBallInGoalTooltip":function(d){return "Gera aðgerðirnar fyrir neðan þegar bolti fer í markið."},
"whenBallMissesPaddle":function(d){return "þegar bolti hittir ekki spaða"},
"whenBallMissesPaddleTooltip":function(d){return "Gera aðgerðirnar fyrir neðan þegar bolti hittir ekki spaðann."},
"whenDown":function(d){return "þegar niður ör"},
"whenDownTooltip":function(d){return "Gera aðgerðirnar fyrir neðan þegar ýtt er á örvarlykil niður."},
"whenGameStarts":function(d){return "þegar leikur byrjar"},
"whenGameStartsTooltip":function(d){return "Gera aðgerðirnar hér fyrir neðan þegar leikurinn byrjar."},
"whenLeft":function(d){return "þegar vinstri ör"},
"whenLeftTooltip":function(d){return "Gera aðgerðirnar fyrir neðan þegar ýtt er á örvarlykil til vinstri."},
"whenPaddleCollided":function(d){return "þegar bolti hittir spaða"},
"whenPaddleCollidedTooltip":function(d){return "Gera aðgerðirnar fyrir neðan þegar bolti rekst á spaða."},
"whenRight":function(d){return "þegar hægri ör"},
"whenRightTooltip":function(d){return "Gera aðgerðirnar fyrir neðan þegar ýtt er á örvarlykil til hægri."},
"whenUp":function(d){return "þegar upp ör"},
"whenUpTooltip":function(d){return "Gera aðgerðirnar fyrir neðan þegar ýtt er á örvarlykil upp."},
"whenWallCollided":function(d){return "þegar bolti hittir vegg"},
"whenWallCollidedTooltip":function(d){return "Gera aðgerðirnar fyrir neðan þegar bolti rekst á vegg."},
"whileMsg":function(d){return "meðan"},
"whileTooltip":function(d){return "Endurtaka innifaldar aðgerðir þar til endapunkti er náð."},
"yes":function(d){return "Já"}};