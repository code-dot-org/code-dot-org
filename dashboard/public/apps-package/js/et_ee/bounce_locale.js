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
"bounceBall":function(d){return "põrgata palli"},
"bounceBallTooltip":function(d){return "Põrgata pall objektilt."},
"continue":function(d){return "Jätka"},
"dirE":function(d){return "I"},
"dirN":function(d){return "P"},
"dirS":function(d){return "L"},
"dirW":function(d){return "L"},
"doCode":function(d){return "täida"},
"elseCode":function(d){return "muidu"},
"finalLevel":function(d){return "Tubli! Sa lahendasid viimase mõistatuse."},
"heightParameter":function(d){return "kõrgus"},
"ifCode":function(d){return "kui"},
"ifPathAhead":function(d){return "kui ees on tee"},
"ifTooltip":function(d){return "Kui antud suunal on tee, täida mingid käsud."},
"ifelseTooltip":function(d){return "Kui antud suunal on tee, täida esimene käskude plokk. Muidu täida teine käskude plokk."},
"incrementOpponentScore":function(d){return "lisa vastasele punkt"},
"incrementOpponentScoreTooltip":function(d){return "Annab vastasele ühe punkti."},
"incrementPlayerScore":function(d){return "lisa punkt"},
"incrementPlayerScoreTooltip":function(d){return "Annab mängijale ühe punkti."},
"isWall":function(d){return "kas see on sein"},
"isWallTooltip":function(d){return "Tagastab \"tõene\", kui siin on sein"},
"launchBall":function(d){return "lisa uus pall"},
"launchBallTooltip":function(d){return "Lisa uus pall mängu."},
"makeYourOwn":function(d){return "Loo päris oma põrgatamismäng"},
"moveDown":function(d){return "liigu alla"},
"moveDownTooltip":function(d){return "Liiguta reket allapoole."},
"moveForward":function(d){return "liigu edasi"},
"moveForwardTooltip":function(d){return "Liiguta mind ühe ühiku võrra edasi."},
"moveLeft":function(d){return "liigu vasakule"},
"moveLeftTooltip":function(d){return "Liiguta reket vasakule."},
"moveRight":function(d){return "liigu paremale"},
"moveRightTooltip":function(d){return "Liiguta reket paremale."},
"moveUp":function(d){return "liigu üles"},
"moveUpTooltip":function(d){return "Liiguta reket ülespoole."},
"nextLevel":function(d){return "Palju õnne! See ülesanne on lahendatud."},
"no":function(d){return "Ei"},
"noPathAhead":function(d){return "teel on takistus"},
"noPathLeft":function(d){return "vasakul ei ole teed"},
"noPathRight":function(d){return "paremal ei ole teed"},
"numBlocksNeeded":function(d){return "Selle ülesande saab lahendada %1 pusletükiga."},
"pathAhead":function(d){return "ees on tee"},
"pathLeft":function(d){return "kui vasakut kätt on tee"},
"pathRight":function(d){return "kui paremat kätt on tee"},
"pilePresent":function(d){return "there is a pile"},
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
"putdownTower":function(d){return "put down tower"},
"reinfFeedbackMsg":function(d){return "You can press the \"Try again\" button to go back to playing your game."},
"removeSquare":function(d){return "eemalda ruut"},
"repeatUntil":function(d){return "korda kuni"},
"repeatUntilBlocked":function(d){return "while path ahead"},
"repeatUntilFinish":function(d){return "repeat until finish"},
"scoreText":function(d){return "Skoor: "+bounce_locale.v(d,"playerScore")+" : "+bounce_locale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "vali suvaline taust"},
"setBackgroundHardcourt":function(d){return "vali suvaline pall"},
"setBackgroundRetro":function(d){return "vali retro taust"},
"setBackgroundTooltip":function(d){return "Valib taustapildi"},
"setBallRandom":function(d){return "vali suvaline pall"},
"setBallHardcourt":function(d){return "vali pall kõvakattega väljaku jaoks"},
"setBallRetro":function(d){return "vali retro pall"},
"setBallTooltip":function(d){return "Valib palli kujutise"},
"setBallSpeedRandom":function(d){return "vali suvaline palli liikumise kiirus"},
"setBallSpeedVerySlow":function(d){return "vali väga madal palli liikumise kiirus"},
"setBallSpeedSlow":function(d){return "vali madal palli liikumise kiirus"},
"setBallSpeedNormal":function(d){return "vali tavaline palli liikumise kiirus"},
"setBallSpeedFast":function(d){return "vali suur palli liikumise kiirus"},
"setBallSpeedVeryFast":function(d){return "vali väga suur palli liikumise kiirus"},
"setBallSpeedTooltip":function(d){return "Määrab ära palli liikumise kiiruse"},
"setPaddleRandom":function(d){return "vali suvaline reket"},
"setPaddleHardcourt":function(d){return "vali reket kõvakattega väljaku jaoks"},
"setPaddleRetro":function(d){return "vali retro reket"},
"setPaddleTooltip":function(d){return "Valib reketi kujutise"},
"setPaddleSpeedRandom":function(d){return "vali suvaline reketi liikumise kiirus"},
"setPaddleSpeedVerySlow":function(d){return "vali väga madal reketi liikumise kiirus"},
"setPaddleSpeedSlow":function(d){return "vali madal reketi liikumise kiirus"},
"setPaddleSpeedNormal":function(d){return "vali tavaline reketi liikumise kiirus"},
"setPaddleSpeedFast":function(d){return "vali suur reketi liikumise kiirus"},
"setPaddleSpeedVeryFast":function(d){return "vali väga suur reketi liikumise kiirus"},
"setPaddleSpeedTooltip":function(d){return "Määrab ära reketi liikumise kiiruse"},
"shareBounceTwitter":function(d){return "Vaata mu Põrgatamismängu. Ma tegin selle ise @codeorg abil"},
"shareGame":function(d){return "Jaga oma mängu:"},
"turnLeft":function(d){return "pööra vasakule"},
"turnRight":function(d){return "pööra paremale"},
"turnTooltip":function(d){return "Pöörab mind vasakule või paremale 90 kraadi võrra."},
"whenBallInGoal":function(d){return "kui pall on väravas"},
"whenBallInGoalTooltip":function(d){return "Täida allolevad käsud, kui pall läheb väravasse."},
"whenBallMissesPaddle":function(d){return "kui pall lendab reketist mööda"},
"whenBallMissesPaddleTooltip":function(d){return "Kui pall lendab reketist mööda, teosta järgmised toimingud."},
"whenDown":function(d){return "kui vajutatakse allanoolt"},
"whenDownTooltip":function(d){return "Täida allolevad käsud, kui vajutatakse allanoolt."},
"whenGameStarts":function(d){return "kui mäng algab"},
"whenGameStartsTooltip":function(d){return "Täidab allolevad käsud, kui mäng algab."},
"whenLeft":function(d){return "kui vajutatakse vasaknoolt"},
"whenLeftTooltip":function(d){return "Kui kasutaja vajutab vasakpoolset noolt, teosta järgmised toimingud."},
"whenPaddleCollided":function(d){return "kui reket lööb palli"},
"whenPaddleCollidedTooltip":function(d){return "Kui reket lööb palli, teosta järgmised toimingud."},
"whenRight":function(d){return "kui vajutatakse paremnoolt"},
"whenRightTooltip":function(d){return "Täida allolevad käsud, kui vajutatakse paremnoolt."},
"whenUp":function(d){return "kui vajutatakse ülesnoolt"},
"whenUpTooltip":function(d){return "Täida allolevad käsud, kui vajutatakse ülesnoolt."},
"whenWallCollided":function(d){return "kui pall läheb vastu seina"},
"whenWallCollidedTooltip":function(d){return "Täida allolevad käsud, kui pall läheb vastu seina."},
"whileMsg":function(d){return "tingimusel"},
"whileTooltip":function(d){return "Korrake lisatud tegevusi kuni lõpppunkt on saavutatud."},
"yes":function(d){return "Jah"}};