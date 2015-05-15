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
"bounceBall":function(d){return "fă bila să ricoșeze"},
"bounceBallTooltip":function(d){return "Fă mingea să ricoșeze de pe un obiect."},
"continue":function(d){return "Continuă"},
"dirE":function(d){return "E"},
"dirN":function(d){return "N"},
"dirS":function(d){return "S"},
"dirW":function(d){return "V"},
"doCode":function(d){return "fă"},
"elseCode":function(d){return "altfel"},
"finalLevel":function(d){return "Felicitări! Ai rezolvat puzzle-ul final."},
"heightParameter":function(d){return "înălțime"},
"ifCode":function(d){return "dacă"},
"ifPathAhead":function(d){return "dacă drum înainte "},
"ifTooltip":function(d){return "Dacă există o cale de acces în direcţia specificată, atunci realizează unele acțiunii."},
"ifelseTooltip":function(d){return "Dacă există o cale de acces în direcţia specificată, atunci realizează primul bloc de acţiuni. Altfel, fă-l pe al doilea bloc de acţiuni."},
"incrementOpponentScore":function(d){return "adaugă punct la scorul adversarului"},
"incrementOpponentScoreTooltip":function(d){return "Adaugă unu la scorul curent al adversarului."},
"incrementPlayerScore":function(d){return "punct de scor"},
"incrementPlayerScoreTooltip":function(d){return "Adaugă unu la scorul de jucător curent."},
"isWall":function(d){return "este acesta un perete"},
"isWallTooltip":function(d){return "Returnează adevărat dacă este un perete aici"},
"launchBall":function(d){return "lansează minge nouă"},
"launchBallTooltip":function(d){return "Lansează o minge în joc."},
"makeYourOwn":function(d){return "Crează propriul joc Ţopăială"},
"moveDown":function(d){return "mută în jos"},
"moveDownTooltip":function(d){return "Mută paleta în jos."},
"moveForward":function(d){return "mută înainte"},
"moveForwardTooltip":function(d){return "Mută-mă înainte un spațiu."},
"moveLeft":function(d){return "mută la stânga"},
"moveLeftTooltip":function(d){return "Mută paleta la stânga."},
"moveRight":function(d){return "mută la dreapta"},
"moveRightTooltip":function(d){return "Mută paletă la dreapta."},
"moveUp":function(d){return "mută în sus"},
"moveUpTooltip":function(d){return "Mută paleta în sus."},
"nextLevel":function(d){return "Felicitări! Ai finalizat acest puzzle."},
"no":function(d){return "Nu"},
"noPathAhead":function(d){return "calea de acces este blocată"},
"noPathLeft":function(d){return "nu există cale de acces la stânga"},
"noPathRight":function(d){return "nu există cale de acces la dreapta"},
"numBlocksNeeded":function(d){return "Acest puzzle poate fi rezolvat cu %1 blocuri."},
"pathAhead":function(d){return "cale înainte"},
"pathLeft":function(d){return "dacă cale la stânga"},
"pathRight":function(d){return "dacă cale la dreapta"},
"pilePresent":function(d){return "este o grămadă"},
"playSoundCrunch":function(d){return "redă sunet de zdrobire"},
"playSoundGoal1":function(d){return "redă sunet obiectiv 1"},
"playSoundGoal2":function(d){return "redă sunet obiectiv 2"},
"playSoundHit":function(d){return "redă sunet lovit"},
"playSoundLosePoint":function(d){return "redă sunet punct pierdut"},
"playSoundLosePoint2":function(d){return "redă sunet punct pierdut 2"},
"playSoundRetro":function(d){return "redă sunet retro"},
"playSoundRubber":function(d){return "redă sunet radieră"},
"playSoundSlap":function(d){return "redă sunet pălmuire"},
"playSoundTooltip":function(d){return "Redă sunetul ales."},
"playSoundWinPoint":function(d){return "redă sunet punct câștigat"},
"playSoundWinPoint2":function(d){return "redă sunet punct câștigat 2"},
"playSoundWood":function(d){return "redă sunet lemn"},
"putdownTower":function(d){return "pune jos turnul"},
"reinfFeedbackMsg":function(d){return "Tu poţi apăsa butonul \"Încercaţi din nou\" pentru a reveni să joci jocul tău."},
"removeSquare":function(d){return "elimină pătratul"},
"repeatUntil":function(d){return "repetă până când"},
"repeatUntilBlocked":function(d){return "atîta timp cât există cale de acces înainte"},
"repeatUntilFinish":function(d){return "repetă până la final"},
"scoreText":function(d){return "Scor: "+bounce_locale.v(d,"playerScore")+": "+bounce_locale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "setează fundal aleator"},
"setBackgroundHardcourt":function(d){return "setează fundal hardcourt"},
"setBackgroundRetro":function(d){return "setează fundal retro"},
"setBackgroundTooltip":function(d){return "Setează imaginea de fundal"},
"setBallRandom":function(d){return "setează bila la întâmplare"},
"setBallHardcourt":function(d){return "setează bila pe hardcourt"},
"setBallRetro":function(d){return "setează bila pe retro"},
"setBallTooltip":function(d){return "Setează imaginea bilei"},
"setBallSpeedRandom":function(d){return "setează viteza bilei la nivel aleator"},
"setBallSpeedVerySlow":function(d){return "setează viteza bilei la nivel foarte lent"},
"setBallSpeedSlow":function(d){return "setează viteza bilei la nivel lent"},
"setBallSpeedNormal":function(d){return "setează viteza bilei la nivel normal"},
"setBallSpeedFast":function(d){return "setează viteza bilei la nivel rapid"},
"setBallSpeedVeryFast":function(d){return "setează viteza bilei la nivel foarte rapid"},
"setBallSpeedTooltip":function(d){return "Setează viteza bilei"},
"setPaddleRandom":function(d){return "setează paleta la întâmplare"},
"setPaddleHardcourt":function(d){return "setează paleta la hardcourt"},
"setPaddleRetro":function(d){return "setează paleta la retro"},
"setPaddleTooltip":function(d){return "Setează imaginea paletei"},
"setPaddleSpeedRandom":function(d){return "setează paleta la nivel de viteză aleatorie"},
"setPaddleSpeedVerySlow":function(d){return "setează paleta la viteză foarte mică"},
"setPaddleSpeedSlow":function(d){return "setează paleta la viteză mică"},
"setPaddleSpeedNormal":function(d){return "setează paleta la viteză normală"},
"setPaddleSpeedFast":function(d){return "setează paleta la viteză mare"},
"setPaddleSpeedVeryFast":function(d){return "setează paleta la viteză foarte mare"},
"setPaddleSpeedTooltip":function(d){return "Setează viteza paletei"},
"shareBounceTwitter":function(d){return "Hai să vezi ce  joc Ţopăială am creat. L-am realizat cu @codeorg"},
"shareGame":function(d){return "condivide jocul tău:"},
"turnLeft":function(d){return "ia-o la stânga"},
"turnRight":function(d){return "ia-o la dreapta"},
"turnTooltip":function(d){return "Mă roteşte la stânga sau la dreapta cu 90 de grade."},
"whenBallInGoal":function(d){return "Când bila la țintă"},
"whenBallInGoalTooltip":function(d){return "Execută acţiunile de mai jos când o minge intră la țintă."},
"whenBallMissesPaddle":function(d){return "Când bila ratează paleta"},
"whenBallMissesPaddleTooltip":function(d){return "Execută acţiunile de mai jos când o minge ratează paletele."},
"whenDown":function(d){return "când tasta săgeată în jos"},
"whenDownTooltip":function(d){return "Execută acțiunile de mai jos atunci când tasta săgeată în jos este apăsată."},
"whenGameStarts":function(d){return "când începe jocul"},
"whenGameStartsTooltip":function(d){return "Execută acţiunile de mai jos atunci când începe jocul."},
"whenLeft":function(d){return "când tasta săgeată la stânga"},
"whenLeftTooltip":function(d){return "Execută acțiunile de mai jos atunci când tasta săgeată la stânga este apăsată."},
"whenPaddleCollided":function(d){return "când bila lovește paleta"},
"whenPaddleCollidedTooltip":function(d){return "Execută acţiunile de mai jos când o bilă se ciocneşte cu o paletă."},
"whenRight":function(d){return "când tasta săgeată la dreapta"},
"whenRightTooltip":function(d){return "Execută acțiunile de mai jos atunci când tasta săgeată la dreapta este apăsată."},
"whenUp":function(d){return "atunci când săgeată în sus"},
"whenUpTooltip":function(d){return "Execută acțiunile de mai jos atunci când tasta săgeată în sus este apăsată."},
"whenWallCollided":function(d){return "când mingea loveşte peretele"},
"whenWallCollidedTooltip":function(d){return "Execută acţiunile de mai jos când o bilă se ciocneşte cu un perete."},
"whileMsg":function(d){return "în timp ce"},
"whileTooltip":function(d){return "Repetă acţiunile cuprinse până când punctul final este atins."},
"yes":function(d){return "Da"}};