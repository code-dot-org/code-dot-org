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
"bounceBall":function(d){return "odbij žogo"},
"bounceBallTooltip":function(d){return "Odbij žogo od predmeta."},
"continue":function(d){return "Nadaljuj"},
"dirE":function(d){return "V"},
"dirN":function(d){return "S"},
"dirS":function(d){return "J"},
"dirW":function(d){return "Z"},
"doCode":function(d){return "izvrši"},
"elseCode":function(d){return "potem"},
"finalLevel":function(d){return "Čestitke! Rešil/a si zadnjo uganko."},
"heightParameter":function(d){return "višina"},
"ifCode":function(d){return "če"},
"ifPathAhead":function(d){return "če je pot naprej"},
"ifTooltip":function(d){return "Če obstaja pot naprej v določeni smeri, potem naredi nekaj."},
"ifelseTooltip":function(d){return "Če obstaja pot naprej v določeni smeri, potem naredi prvi blok dejanj. V nasprotnem primeru, naredi drugi blok dejanj."},
"incrementOpponentScore":function(d){return "nasprotnik doseže točko"},
"incrementOpponentScoreTooltip":function(d){return "Dodaj ena k nasprotnikovim točkam."},
"incrementPlayerScore":function(d){return "dosežena točka"},
"incrementPlayerScoreTooltip":function(d){return "Dodaj ena k trenutnemu dosežku."},
"isWall":function(d){return "je to stena"},
"isWallTooltip":function(d){return "Vrne resnično, če je tukaj zid"},
"launchBall":function(d){return "zaženi novo žogo"},
"launchBallTooltip":function(d){return "Pošlji žogo v igro."},
"makeYourOwn":function(d){return "Naredi svojo Bounce Game"},
"moveDown":function(d){return "premakni se dol"},
"moveDownTooltip":function(d){return "Premakni lopar dol."},
"moveForward":function(d){return "premakni se naprej"},
"moveForwardTooltip":function(d){return "Premakni me naprej za 1 mesto."},
"moveLeft":function(d){return "premakni se levo"},
"moveLeftTooltip":function(d){return "Premakni lopar v levo."},
"moveRight":function(d){return "premakni se desno"},
"moveRightTooltip":function(d){return "Premakni lopar v desno."},
"moveUp":function(d){return "premakni se gor"},
"moveUpTooltip":function(d){return "Dvigni lopar."},
"nextLevel":function(d){return "Čestitam! Rešili ste to uganko."},
"no":function(d){return "Ne"},
"noPathAhead":function(d){return "pot je blokirana"},
"noPathLeft":function(d){return "ni poti na levo"},
"noPathRight":function(d){return "ni poti na desno"},
"numBlocksNeeded":function(d){return "Ta uganka je lahko rešena z %1 blokom."},
"pathAhead":function(d){return "pot naprej"},
"pathLeft":function(d){return "če je pot na levo"},
"pathRight":function(d){return "če je pot na desno"},
"pilePresent":function(d){return "tukaj je kup"},
"playSoundCrunch":function(d){return "predvajaj zvok drobljenja"},
"playSoundGoal1":function(d){return "predvajaj zvok: cilj 1"},
"playSoundGoal2":function(d){return "predvajaj zvok: cilj 2"},
"playSoundHit":function(d){return "predvajaj zvok udarca"},
"playSoundLosePoint":function(d){return "predvajaj zvok: izgubljena točka"},
"playSoundLosePoint2":function(d){return "predvajaj zvok: izgubljena točka 2"},
"playSoundRetro":function(d){return "predvajaj retro zvok"},
"playSoundRubber":function(d){return "predvajaj zvok: radirka"},
"playSoundSlap":function(d){return "predvajaj zvok: udarec"},
"playSoundTooltip":function(d){return "Predvajaj izbrani zvok."},
"playSoundWinPoint":function(d){return "predvajaj zvok: dobljena točka"},
"playSoundWinPoint2":function(d){return "predvajaj zvok: dobljena točka 2"},
"playSoundWood":function(d){return "predvajaj zvok: lesen udarec"},
"putdownTower":function(d){return "postavi stolp"},
"reinfFeedbackMsg":function(d){return "Lahko pritisnete gumb \"Poskusi znova\" in se vrnete nazaj k igranju svoje igre."},
"removeSquare":function(d){return "odstrani kvadrat"},
"repeatUntil":function(d){return "ponavljaj dokler"},
"repeatUntilBlocked":function(d){return "dokler je pot naprej"},
"repeatUntilFinish":function(d){return "ponavljaj do konca"},
"scoreText":function(d){return "Rezultat: "+bounce_locale.v(d,"playerScore")+" : "+bounce_locale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "nastavite naključno sceno"},
"setBackgroundHardcourt":function(d){return "določi teniško sceno"},
"setBackgroundRetro":function(d){return "nastavite retro sceno"},
"setBackgroundTooltip":function(d){return "Nastavite sliko ozadja"},
"setBallRandom":function(d){return "nastavite naključno žogo"},
"setBallHardcourt":function(d){return "določi teniško žogico"},
"setBallRetro":function(d){return "nastavite žogo vzvratno"},
"setBallTooltip":function(d){return "Nastavi sliko žoge"},
"setBallSpeedRandom":function(d){return "nastavite nakljuno hitrost žoge"},
"setBallSpeedVerySlow":function(d){return "nastavite zelo počasno hitrost žoge"},
"setBallSpeedSlow":function(d){return "nastavite počasno hitrost žoge"},
"setBallSpeedNormal":function(d){return "nastavite navadno hitrost žoge"},
"setBallSpeedFast":function(d){return "nastavite hitro hitrost žoge"},
"setBallSpeedVeryFast":function(d){return "nastavite zelo hitro hitrost žoge"},
"setBallSpeedTooltip":function(d){return "Nastavi hitrost žoge"},
"setPaddleRandom":function(d){return "nastavite naključen odbijač"},
"setPaddleHardcourt":function(d){return "določi teniški lopar"},
"setPaddleRetro":function(d){return "nastavite lopar vzvratno"},
"setPaddleTooltip":function(d){return "Nastavi sliko odbijača"},
"setPaddleSpeedRandom":function(d){return "nastavite naključno hitrost odbijača"},
"setPaddleSpeedVerySlow":function(d){return "nastavite zelo počasno hitrost odbijača"},
"setPaddleSpeedSlow":function(d){return "nastavite počasno hitrost odbijača"},
"setPaddleSpeedNormal":function(d){return "nastavite navadno hitrost odbijača"},
"setPaddleSpeedFast":function(d){return "nastavite hitro hitrost odbijača"},
"setPaddleSpeedVeryFast":function(d){return "nastavite histrost vesla na zelo hitro"},
"setPaddleSpeedTooltip":function(d){return "Nastavi hitrost vesla"},
"shareBounceTwitter":function(d){return "Oglejte si mojo igrico pri kateri odbijaš žogo. Igrico sem izdelal sam z @codeorg"},
"shareGame":function(d){return "Delite vašo igro z ostalimi:"},
"turnLeft":function(d){return "obrni se levo"},
"turnRight":function(d){return "obrni se desno"},
"turnTooltip":function(d){return "Obrne me levo ali desno za 90 stopinj."},
"whenBallInGoal":function(d){return "ko je žoga na cilju"},
"whenBallInGoalTooltip":function(d){return "Izvedi spodnja dejanja, ko žoga doseže cilj."},
"whenBallMissesPaddle":function(d){return "ko žoga zgreši odbijač"},
"whenBallMissesPaddleTooltip":function(d){return "Izvedi spodnja dejanja, ko žoga zgreši odbijač."},
"whenDown":function(d){return "ko puščica za navzdol"},
"whenDownTooltip":function(d){return "Ko je pritisnjena puščica za navzdol, izvedi sledeče ukaze."},
"whenGameStarts":function(d){return "ko se igra začne"},
"whenGameStartsTooltip":function(d){return "Izvedite spodnja dejanja, ko se igra začne."},
"whenLeft":function(d){return "ko leva puščica"},
"whenLeftTooltip":function(d){return "Ko je pritisnjena desna puščica izvedi sledeče ukaze."},
"whenPaddleCollided":function(d){return "ko žoga zadene lopar"},
"whenPaddleCollidedTooltip":function(d){return "Izvedi spodnja dejanja, ko žoga zadene zid."},
"whenRight":function(d){return "ko je pritisnjena puščica desno"},
"whenRightTooltip":function(d){return "Ko je pritisnjena desna puščica izvedi sledeče ukaze."},
"whenUp":function(d){return "ko je pritisnjena puščica gor"},
"whenUpTooltip":function(d){return "Ko je pritisnjena gor puščica izvedi sledeče ukaze."},
"whenWallCollided":function(d){return "ko žoga zadene zid"},
"whenWallCollidedTooltip":function(d){return "Izvedi spodnja dejanja, ko žoga zadene zid."},
"whileMsg":function(d){return "dokler"},
"whileTooltip":function(d){return "Ponavljaj vključena dejanja, dokler ne dosežeš zaključne točke."},
"yes":function(d){return "Da"}};