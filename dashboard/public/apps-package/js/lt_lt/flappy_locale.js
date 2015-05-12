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
"continue":function(d){return "Tęsti"},
"doCode":function(d){return "daryk"},
"elseCode":function(d){return "kitu atveju"},
"endGame":function(d){return "baigti žaidimą"},
"endGameTooltip":function(d){return "Užbaigia žaidimą."},
"finalLevel":function(d){return "Sveikinu! Tu išsprendei paskutinį galvosūkį."},
"flap":function(d){return "plasnok"},
"flapRandom":function(d){return "pakilk atsitiktiniu dydžiu"},
"flapVerySmall":function(d){return "pakilk labai mažu dydžiu"},
"flapSmall":function(d){return "pakilk mažu dydžiu"},
"flapNormal":function(d){return "pakilk normaliu dydžiu"},
"flapLarge":function(d){return "pakilk dideliu dydžiu"},
"flapVeryLarge":function(d){return "pakilk labai dideliu dydžiu"},
"flapTooltip":function(d){return "Nuskraidink Flappy į viršų."},
"flappySpecificFail":function(d){return "Tavo kodas atrodo gerai - jis plasnos su kiekvienu paspaudimu. Tačiau tau reikia nuspausti daug kartų, kad jis nuplasnotų į tikslą."},
"incrementPlayerScore":function(d){return "gauk tašką"},
"incrementPlayerScoreTooltip":function(d){return "Pridėk vieną tašką prie dabartinio žaidėjo rezultato."},
"nextLevel":function(d){return "Sveikinu! Išsprendei šią užduotį."},
"no":function(d){return "Ne"},
"numBlocksNeeded":function(d){return "Ši užduotis gali būti išspręsta su %1 blokų(-ais)."},
"playSoundRandom":function(d){return "groti atsitiktinį garsą"},
"playSoundBounce":function(d){return "grok atsimušimo garsą"},
"playSoundCrunch":function(d){return "garsas = trakšt"},
"playSoundDie":function(d){return "grok liūdną garsą"},
"playSoundHit":function(d){return "grok sutraiškymo garsą"},
"playSoundPoint":function(d){return "grok bakstelėjimo garsą"},
"playSoundSwoosh":function(d){return "grok swoosh garsą"},
"playSoundWing":function(d){return "grok sparnų garsą"},
"playSoundJet":function(d){return "grok reaktyvinio lėktuvo garsą"},
"playSoundCrash":function(d){return "grok crash garsą"},
"playSoundJingle":function(d){return "grok jingle garsą"},
"playSoundSplash":function(d){return "grok splash garsą"},
"playSoundLaser":function(d){return "grok lazerio garsą"},
"playSoundTooltip":function(d){return "Grok pasirinktą garsą."},
"reinfFeedbackMsg":function(d){return "Gali nuspausti mygtuką „Mėginti dar kartą“, kad grįžtum prie savo žaidimo."},
"scoreText":function(d){return "Taškai: "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "scena ="},
"setBackgroundRandom":function(d){return " scena = Atsitiktinė"},
"setBackgroundFlappy":function(d){return "scena = Miestas dieną"},
"setBackgroundNight":function(d){return "scena = Miestas naktį"},
"setBackgroundSciFi":function(d){return "scena = Fantastika"},
"setBackgroundUnderwater":function(d){return "scena = Po vandeniu"},
"setBackgroundCave":function(d){return "scena = Urvas"},
"setBackgroundSanta":function(d){return "scena = Kalėdos"},
"setBackgroundTooltip":function(d){return "Nustato fono paveikslėlį"},
"setGapRandom":function(d){return "tarpas = bet koks"},
"setGapVerySmall":function(d){return "tarpas = labai mažas"},
"setGapSmall":function(d){return "tarpas = mažas"},
"setGapNormal":function(d){return "tarpas = normalus"},
"setGapLarge":function(d){return "tarpas = didelis"},
"setGapVeryLarge":function(d){return "tarpas = labai didelis"},
"setGapHeightTooltip":function(d){return "Nustato vertikalų tarpą kliūtyje"},
"setGravityRandom":function(d){return "gravitacija = bet kokia"},
"setGravityVeryLow":function(d){return "gravitacija =labai maža"},
"setGravityLow":function(d){return "gravitacija = maža"},
"setGravityNormal":function(d){return "gravitacija = normali"},
"setGravityHigh":function(d){return "gravitacija = didelė"},
"setGravityVeryHigh":function(d){return "gravitacija = labai didelė"},
"setGravityTooltip":function(d){return "Nustato šio lygio/etapo gravitaciją"},
"setGround":function(d){return "žemės paviršius ="},
"setGroundRandom":function(d){return "žemės paviršius = bet koks"},
"setGroundFlappy":function(d){return "žemės paviršius = Normalus"},
"setGroundSciFi":function(d){return "žemės paviršius = Fantastika"},
"setGroundUnderwater":function(d){return "žemės paviršius = Povandeninis"},
"setGroundCave":function(d){return "žemės paviršius = Urvas"},
"setGroundSanta":function(d){return "žemės paviršius = Senelis Šalitis"},
"setGroundLava":function(d){return "žemės paviršius = Lava"},
"setGroundTooltip":function(d){return "Nustato žemės paviršiaus paveikslėlį"},
"setObstacle":function(d){return "kliūtis ="},
"setObstacleRandom":function(d){return "kliūtis = bet kokia"},
"setObstacleFlappy":function(d){return "kliūtis = Vamzdis"},
"setObstacleSciFi":function(d){return "kliūtis = Fantastika"},
"setObstacleUnderwater":function(d){return "kliūtis = Augalas"},
"setObstacleCave":function(d){return "kliūtis = Urvas"},
"setObstacleSanta":function(d){return "kliūtis = Kaminas"},
"setObstacleLaser":function(d){return "kliūtis = Lazeris"},
"setObstacleTooltip":function(d){return "Nustato kliūties paveikslėlį"},
"setPlayer":function(d){return "žaidėjas ="},
"setPlayerRandom":function(d){return "žaidėjas = Random"},
"setPlayerFlappy":function(d){return "žaidėjas = Geltonas paukštis"},
"setPlayerRedBird":function(d){return "žaidėjas = Raudonas paukštis"},
"setPlayerSciFi":function(d){return "žaidėjas = Kosminis laivas"},
"setPlayerUnderwater":function(d){return "žaidėjas = Žuvis"},
"setPlayerCave":function(d){return "žaidėjas = Šikšnosparnis"},
"setPlayerSanta":function(d){return "žaidėjas = Kalėdų Senelis"},
"setPlayerShark":function(d){return "žaidėjas = Ryklys"},
"setPlayerEaster":function(d){return "žaidėjas = Velykų kiškis"},
"setPlayerBatman":function(d){return "žaidėjas = BatMan"},
"setPlayerSubmarine":function(d){return "žaidėjas = Submarine"},
"setPlayerUnicorn":function(d){return "žaidėjas = Vienaragis"},
"setPlayerFairy":function(d){return "žaidėjas = Fėja"},
"setPlayerSuperman":function(d){return "žaidėjas = Flappyman"},
"setPlayerTurkey":function(d){return "žaidėjas = Kalakutas"},
"setPlayerTooltip":function(d){return "Nustato žaidėjo paveikslėlį"},
"setScore":function(d){return "taškai = "},
"setScoreTooltip":function(d){return "Nustato žaidėjo rezultatą"},
"setSpeed":function(d){return "greitis ="},
"setSpeedTooltip":function(d){return "Nustato šio lygio greitį"},
"shareFlappyTwitter":function(d){return "Pažiūrėk, kokį Flappy žaidimą sukūriau. Parašiau jį pats puslapyje code.org"},
"shareGame":function(d){return "Bendrink savo žaidimą:"},
"soundRandom":function(d){return "atsitiktinis"},
"soundBounce":function(d){return "atsimušk"},
"soundCrunch":function(d){return "trakšt"},
"soundDie":function(d){return "liūdnas"},
"soundHit":function(d){return "babach"},
"soundPoint":function(d){return "„point“ garsas"},
"soundSwoosh":function(d){return "„swoosh“ garsas"},
"soundWing":function(d){return "plast plast"},
"soundJet":function(d){return "reaktyvinis"},
"soundCrash":function(d){return "susidūrimas"},
"soundJingle":function(d){return "skambesys"},
"soundSplash":function(d){return "pliaukšt"},
"soundLaser":function(d){return "laseris"},
"speedRandom":function(d){return "greitis = atsitiktinis"},
"speedVerySlow":function(d){return "greitis = labai lėtai"},
"speedSlow":function(d){return "greitis = lėtai"},
"speedNormal":function(d){return "greitis = normalus"},
"speedFast":function(d){return "greitis = greitai"},
"speedVeryFast":function(d){return "greitis = labai greitai"},
"whenClick":function(d){return "kai spusteli"},
"whenClickTooltip":function(d){return "Vykdyti pateiktas komandas, kai bus spustelta pele."},
"whenCollideGround":function(d){return "kai nuktrenti ant žemės"},
"whenCollideGroundTooltip":function(d){return "Vykdyti pateiktus veiksmus, kai Flappy pasieks žemę."},
"whenCollideObstacle":function(d){return "kai atsimuši į kliūtį"},
"whenCollideObstacleTooltip":function(d){return "Vykdyti  pateiktus veiksmus, kai Flappy atsitrenks į kliūtį."},
"whenEnterObstacle":function(d){return "kai įveiki kliūtį"},
"whenEnterObstacleTooltip":function(d){return "Vykdyti pateiktus veiksmus, kai Flappy įeis į kliūtį."},
"whenRunButtonClick":function(d){return "kai žaidimas prasideda"},
"whenRunButtonClickTooltip":function(d){return "Vykdyti žemiau nurodytus veiksmus, kai žaidimas prasideda."},
"yes":function(d){return "Taip"}};