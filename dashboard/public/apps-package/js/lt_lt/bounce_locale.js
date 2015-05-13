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
"bounceBall":function(d){return "atmušk kamuolį"},
"bounceBallTooltip":function(d){return "Atmušk kamuolį nuo objekto."},
"continue":function(d){return "Tęsti"},
"dirE":function(d){return "R"},
"dirN":function(d){return "Š"},
"dirS":function(d){return "P"},
"dirW":function(d){return "V"},
"doCode":function(d){return " "},
"elseCode":function(d){return "kitu atveju"},
"finalLevel":function(d){return "Sveikinu! Tu išsprendei paskutinį galvosūkį."},
"heightParameter":function(d){return "aukštis"},
"ifCode":function(d){return "jei"},
"ifPathAhead":function(d){return "jei yra kelias į priekį"},
"ifTooltip":function(d){return "Jei kelias yra nurodytoje kryptyje, atlik kokius nors veiksmus."},
"ifelseTooltip":function(d){return "Jei kelias yra nurodytoje kryptyje, atlik pirmą veiksmų bloką. Priešingu atveju, atlik antrą veiksmų bloką."},
"incrementOpponentScore":function(d){return "pridėk tašką priešininkui"},
"incrementOpponentScoreTooltip":function(d){return "Pridėk vieną tašką dabartiniam priešininkui."},
"incrementPlayerScore":function(d){return "pridėk tašką"},
"incrementPlayerScoreTooltip":function(d){return "Pridėk vieną tašką prie esamo žaidėjo rezultato."},
"isWall":function(d){return "ar tai yra siena"},
"isWallTooltip":function(d){return "Grąžina teisingą rezultatą, jei čia yra siena"},
"launchBall":function(d){return "paleisk naują kamuolį"},
"launchBallTooltip":function(d){return "Paleidžia kamuolį į žaidimą."},
"makeYourOwn":function(d){return "Sukurk teniso žaidimą"},
"moveDown":function(d){return "judėk žemyn"},
"moveDownTooltip":function(d){return "Pajudink raketę žemyn."},
"moveForward":function(d){return "judėk į priekį"},
"moveForwardTooltip":function(d){return "Perkelk mane į priekį per vieną laukelį."},
"moveLeft":function(d){return "judėk kairėn"},
"moveLeftTooltip":function(d){return "Pajudink raketę į kairę."},
"moveRight":function(d){return "judėk dešinėn"},
"moveRightTooltip":function(d){return "Pajudink raketę į dešinę."},
"moveUp":function(d){return "judėk aukštyn"},
"moveUpTooltip":function(d){return "Pajudink raketę aukštyn."},
"nextLevel":function(d){return "Sveikinu! Išsprendei šią užduotį."},
"no":function(d){return "Ne"},
"noPathAhead":function(d){return "kelias yra užblokuotas"},
"noPathLeft":function(d){return "nėra kelio į kairę"},
"noPathRight":function(d){return "nėra kelio į dešinę"},
"numBlocksNeeded":function(d){return "Ši užduotis gali būti išspręsta su %1 blokų(-ais)."},
"pathAhead":function(d){return "kelias į priekį"},
"pathLeft":function(d){return "jei kelias yra į kairę"},
"pathRight":function(d){return "jei kelias yra į dešinę"},
"pilePresent":function(d){return "čia yra žemių krūva"},
"playSoundCrunch":function(d){return "garsas = trakšt"},
"playSoundGoal1":function(d){return "garsas = įvartis 1"},
"playSoundGoal2":function(d){return "garsas = įvartis 2"},
"playSoundHit":function(d){return "garsas = atsimušimas"},
"playSoundLosePoint":function(d){return "garsas = taško praradimas"},
"playSoundLosePoint2":function(d){return "garsas = taško praradimas 2"},
"playSoundRetro":function(d){return "garsas = retro"},
"playSoundRubber":function(d){return "garsas = guma"},
"playSoundSlap":function(d){return "garsas = pliaukšt"},
"playSoundTooltip":function(d){return "Grok pasirinktą garsą."},
"playSoundWinPoint":function(d){return "garsas = pelnyti taškai 1"},
"playSoundWinPoint2":function(d){return "garsas = pelnyti taškai 2"},
"playSoundWood":function(d){return "garsas = mediena"},
"putdownTower":function(d){return "padėk bokštą"},
"reinfFeedbackMsg":function(d){return "Gali nuspausti mygtuką „Mėginti dar kartą“, kad grįžtum prie savo žaidimo."},
"removeSquare":function(d){return "pašalink kvadratą"},
"repeatUntil":function(d){return "kartok, kol"},
"repeatUntilBlocked":function(d){return "kol yra kelias į priekį "},
"repeatUntilFinish":function(d){return "kartok iki finišo"},
"scoreText":function(d){return "Rezultatas: "+bounce_locale.v(d,"playerScore")+" : "+bounce_locale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "scena = bet kokia"},
"setBackgroundHardcourt":function(d){return "scena = teniso kortai"},
"setBackgroundRetro":function(d){return "scena = retro"},
"setBackgroundTooltip":function(d){return "Nustato fono paveikslėlį"},
"setBallRandom":function(d){return "kamuolys = bet koks"},
"setBallHardcourt":function(d){return "kamuolys = teniso"},
"setBallRetro":function(d){return "kamuolys = retro"},
"setBallTooltip":function(d){return "Nustato kamuolio vaizdą"},
"setBallSpeedRandom":function(d){return "kamuolio greitis = bet koks"},
"setBallSpeedVerySlow":function(d){return "kamuolio greitis = labai mažas"},
"setBallSpeedSlow":function(d){return "kamuolio greitis = mažas"},
"setBallSpeedNormal":function(d){return "kamuolio greitis = normalus"},
"setBallSpeedFast":function(d){return "kamuolio greitis = didelis"},
"setBallSpeedVeryFast":function(d){return "kamuolio greitis = labai didelis"},
"setBallSpeedTooltip":function(d){return "Nustato kamuolio greitį"},
"setPaddleRandom":function(d){return "raketė = bet kokia"},
"setPaddleHardcourt":function(d){return "raketė = teniso"},
"setPaddleRetro":function(d){return "raketė = retro"},
"setPaddleTooltip":function(d){return "Nustato raketės vaizdą"},
"setPaddleSpeedRandom":function(d){return "raketės greitis = bet koks"},
"setPaddleSpeedVerySlow":function(d){return "raketės greitis = labai mažas"},
"setPaddleSpeedSlow":function(d){return "raketės greitis = mažas"},
"setPaddleSpeedNormal":function(d){return "raketės greitis = normalus"},
"setPaddleSpeedFast":function(d){return "raketės greitis = didelis"},
"setPaddleSpeedVeryFast":function(d){return "raketės greitis = labai didelis"},
"setPaddleSpeedTooltip":function(d){return "Nustato raketės greitį"},
"shareBounceTwitter":function(d){return "Pažiūrėk, kokį Teniso žaidimą sukūriau su code.org"},
"shareGame":function(d){return "Bendrink savo žaidimą:"},
"turnLeft":function(d){return "pasisuk į kairę"},
"turnRight":function(d){return "pasisuk į dešinę"},
"turnTooltip":function(d){return "Pasuka mane į kairę arba į dešinę per 90 laipsnių."},
"whenBallInGoal":function(d){return "kai kamuolys pataiko į tikslą"},
"whenBallInGoalTooltip":function(d){return "Vykdyti žemiau nurodytus veiksmus, kai kamuolys pataiko į tikslą."},
"whenBallMissesPaddle":function(d){return "kai kamuolys nepataiko į raketę"},
"whenBallMissesPaddleTooltip":function(d){return "Vykdyti žemiau nurodytus veiksmus, kai kamuolys nepataiko į raketę."},
"whenDown":function(d){return "kai paspausta rodyklė žemyn"},
"whenDownTooltip":function(d){return "Įvykdyk žemiau nurodytus veiksmus, kai bus nuspaustas klaviatūros klavišas rodyklė žemyn."},
"whenGameStarts":function(d){return "kai žaidimas prasideda"},
"whenGameStartsTooltip":function(d){return "Vykdyti nurodytus veiksmus, kai žaidimas prasideda."},
"whenLeft":function(d){return "kai paspausta rodyklė kairėn"},
"whenLeftTooltip":function(d){return "Įvykdyk žemiau nurodytus veiksmus, kai bus nuspaustas klaviatūros klavišas rodyklė į kairę."},
"whenPaddleCollided":function(d){return "kai kamuolys atsimuša į raketę"},
"whenPaddleCollidedTooltip":function(d){return "Įvykdyk žemiau nurodytus veiksmus, kai kamuolys atsitrenkia į raketę."},
"whenRight":function(d){return "kai paspausta rodyklė dešinėn"},
"whenRightTooltip":function(d){return "Įvykdyk žemiau nurodytus veiksmus, kai bus nuspaustas klaviatūros klavišas rodyklė dešinėn."},
"whenUp":function(d){return "kai paspausta rodyklė aukštyn"},
"whenUpTooltip":function(d){return "Įvykdyk žemiau nurodytus veiksmus, kai bus nuspaustas klaviatūros klavišas rodyklė aukštyn."},
"whenWallCollided":function(d){return "kai kamuolys atsitrenkia į sieną"},
"whenWallCollidedTooltip":function(d){return "Įvykdyk žemiau nurodytus veiksmus, kai kamuolys atsitrenkia į sieną."},
"whileMsg":function(d){return "kol"},
"whileTooltip":function(d){return "Pakartok sujungtus veiksmus, kol bus pasiektas finišas."},
"yes":function(d){return "Taip"}};