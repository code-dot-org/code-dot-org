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
v:function(d,k){bounce_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){bounce_locale.c(d,k);return d[k] in p?p[d[k]]:(k=bounce_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){bounce_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).bounce_locale = {
"bounceBall":function(d){return "përplas topin"},
"bounceBallTooltip":function(d){return "Përplase një top mbi një objekt."},
"continue":function(d){return "Vazhdo"},
"dirE":function(d){return "E"},
"dirN":function(d){return "N"},
"dirS":function(d){return "S"},
"dirW":function(d){return "W"},
"doCode":function(d){return "ekzekuto"},
"elseCode":function(d){return "perndryshe"},
"finalLevel":function(d){return "Urime! Ju keni perfunduar enigmen perfundimatare."},
"heightParameter":function(d){return "gjatësia"},
"ifCode":function(d){return "nese"},
"ifPathAhead":function(d){return "nese ka vend perpara"},
"ifTooltip":function(d){return "Nese ka vend ne nje drejtim te caktuar, atehere bej nje veprim te caktuar."},
"ifelseTooltip":function(d){return "Nese eshte nje rruge ne drejtimin e caktuar, atehere bej veprimet e grupit te pare. Perndryshe, bej veprimet e grupit te dyte."},
"incrementOpponentScore":function(d){return "rezultati i kundërshtarit/es"},
"incrementOpponentScoreTooltip":function(d){return "Shto një pikë në rezultatin aktual të kundërshtarit."},
"incrementPlayerScore":function(d){return "rezultati"},
"incrementPlayerScoreTooltip":function(d){return "Shto një pikë në rezultatin aktual të lojtarit."},
"isWall":function(d){return "nëse është një mur"},
"isWallTooltip":function(d){return "Kthehet \" e vërtetë\" nëse këtu ka një mur."},
"launchBall":function(d){return "hidh një top të ri"},
"launchBallTooltip":function(d){return "Hidh një top në lojë."},
"makeYourOwn":function(d){return "Krijo Lojën Tënde të përplasjes"},
"moveDown":function(d){return "lëviz poshtë"},
"moveDownTooltip":function(d){return "Lëviz raketën poshtë."},
"moveForward":function(d){return "levis perpara"},
"moveForwardTooltip":function(d){return "Me leviz perpara nje hapesire."},
"moveLeft":function(d){return "lëviz majtas"},
"moveLeftTooltip":function(d){return "Lëviz raketën në të majtë."},
"moveRight":function(d){return "lëviz djathtas"},
"moveRightTooltip":function(d){return "Lëviz pedalen në të djathtë."},
"moveUp":function(d){return "lëviz sipër"},
"moveUpTooltip":function(d){return "Lëviz pedalen sipër."},
"nextLevel":function(d){return "Urime! Ju keni perfunduar kete enigme."},
"no":function(d){return "Jo"},
"noPathAhead":function(d){return "rruga eshte bllokuar"},
"noPathLeft":function(d){return "nuk ka hapesire ne te majte"},
"noPathRight":function(d){return "nuk ka hapesire ne te djathte"},
"numBlocksNeeded":function(d){return "Kjo enigme mund te zgjidhet me %1 rreshta."},
"pathAhead":function(d){return "rruge perpara"},
"pathLeft":function(d){return "nese ka rruge ne te majte"},
"pathRight":function(d){return "nese ka rruge ne te djathte"},
"pilePresent":function(d){return "eshte nje grumbull"},
"playSoundCrunch":function(d){return "luaj tingullin \"e kërcitjes\""},
"playSoundGoal1":function(d){return "luaj tingullin \"goal 1\""},
"playSoundGoal2":function(d){return "luaj tingullin \"goal 2\""},
"playSoundHit":function(d){return "luaj tingullin \"e goditjes\""},
"playSoundLosePoint":function(d){return "luaj tingullin \"humb pikë\""},
"playSoundLosePoint2":function(d){return "luaj tingullin \"humb pikë 2\""},
"playSoundRetro":function(d){return "luaj tingullin \"retro\""},
"playSoundRubber":function(d){return "luaj tingullin e \"gomës\""},
"playSoundSlap":function(d){return "luaj tingullin e \"goditjes\""},
"playSoundTooltip":function(d){return "Luaj tingullin e zgjedhur."},
"playSoundWinPoint":function(d){return "luaj tingullin \"fito pikë\""},
"playSoundWinPoint2":function(d){return "luaj tingullin \"fito pikë \" 2"},
"playSoundWood":function(d){return "luaj tingullin \"e pyllit\""},
"putdownTower":function(d){return "vendos ne toke nje kulle"},
"reinfFeedbackMsg":function(d){return "Ju mund te shtypni butonin \"Provo Perseri\" per tu kthyer mrapa dhe per te luajtur lojen tuaj."},
"removeSquare":function(d){return "hiq katror"},
"repeatUntil":function(d){return "perserit derisa"},
"repeatUntilBlocked":function(d){return "perderisa ka hapesire perpara"},
"repeatUntilFinish":function(d){return "perserit deri sa te mbaroje"},
"scoreText":function(d){return "Rezultati: "+bounce_locale.v(d,"playerScore")+" : "+bounce_locale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "krijo një model të rastësishëm"},
"setBackgroundHardcourt":function(d){return "krijo një model të një loje tenisi"},
"setBackgroundRetro":function(d){return "krijo një model retro"},
"setBackgroundTooltip":function(d){return "Rregullo sfondin e imazhit"},
"setBallRandom":function(d){return "vendos një top të rastësishëm"},
"setBallHardcourt":function(d){return "vendos një top tenisi"},
"setBallRetro":function(d){return "vendos topin në retro"},
"setBallTooltip":function(d){return "Pamje nga pozicionet e topit"},
"setBallSpeedRandom":function(d){return "vendos topin në shpejtësi të zakonshme"},
"setBallSpeedVerySlow":function(d){return "vendos topin në shpejtësi shumë të ulët"},
"setBallSpeedSlow":function(d){return "vendos topin në shpejtësi të ulët"},
"setBallSpeedNormal":function(d){return "vendos topin në shpejtësi normale"},
"setBallSpeedFast":function(d){return "vendos topin në shpejtësi të lartë"},
"setBallSpeedVeryFast":function(d){return "Vendos topin në shpejtësi shumë të lartë"},
"setBallSpeedTooltip":function(d){return "Pamje nga shpejtësitë e topit"},
"setPaddleRandom":function(d){return "Vendos një raketë tenisi të çfarëdoshme"},
"setPaddleHardcourt":function(d){return "vendos raketën e tenisit"},
"setPaddleRetro":function(d){return "vendos lopatën në retro"},
"setPaddleTooltip":function(d){return "Pamje nga pozicionet e lopatës"},
"setPaddleSpeedRandom":function(d){return "vendos lopatën në shpejtësi të zakonshme"},
"setPaddleSpeedVerySlow":function(d){return "vendos lopatën në shpejtësi shumë të ulët"},
"setPaddleSpeedSlow":function(d){return "vendos lopatën në shpejtësi të ulët"},
"setPaddleSpeedNormal":function(d){return "vendos raketën në shpejtësi normale"},
"setPaddleSpeedFast":function(d){return "vendos lopatën në shpejtësi të lartë"},
"setPaddleSpeedVeryFast":function(d){return "Vendos lopatën në shpejtësi shumë të lartë"},
"setPaddleSpeedTooltip":function(d){return "Vendos shpejtësinë e raketës"},
"shareBounceTwitter":function(d){return "Hidhi një sy lojës me përplasje që krijova. E krijova vet me @codeorg"},
"shareGame":function(d){return "Shpërndaj lojën tënde:"},
"turnLeft":function(d){return "kthehu majtas"},
"turnRight":function(d){return "kthehu djathtas"},
"turnTooltip":function(d){return "Te kthen majtas ose djathtas prej 90 gradesh."},
"whenBallInGoal":function(d){return "kur topi kthehet në qëllim"},
"whenBallInGoalTooltip":function(d){return "Kryej veprimet si më poshtë kur futet një top në rrjetë."},
"whenBallMissesPaddle":function(d){return "kur topi nuk prek raketën"},
"whenBallMissesPaddleTooltip":function(d){return "Kryej veprimet si më poshtë kur një top nuk a arrin lopatën."},
"whenDown":function(d){return "me kursorin e poshtëm"},
"whenDownTooltip":function(d){return "Kryej veprimet si më poshtë me butonin e kursorit të poshtëm të shtypur."},
"whenGameStarts":function(d){return "kur loja fillon"},
"whenGameStartsTooltip":function(d){return "Kryej veprimet më poshtë kur të fillojë loja."},
"whenLeft":function(d){return "me kursorin e majtë"},
"whenLeftTooltip":function(d){return "Kryej veprimet si më poshtë me çelësin e kursorit të majtë të shtypur."},
"whenPaddleCollided":function(d){return "kur topi godet raketën"},
"whenPaddleCollidedTooltip":function(d){return "Kryej veprimet si më poshtë kur topi përplaset me raketën."},
"whenRight":function(d){return "me kursorin e djathtë"},
"whenRightTooltip":function(d){return "Kryej veprimet si më poshtë me kursorin e djathtë të shtypur."},
"whenUp":function(d){return "me kursorin e sipërm"},
"whenUpTooltip":function(d){return "Kryej veprimet si më poshtë me çelësin e kursorit të lartë të shtypur."},
"whenWallCollided":function(d){return "kur topi përplaset në mur"},
"whenWallCollidedTooltip":function(d){return "Kryej veprimet si më poshtë kur një top të përplaset në mur."},
"whileMsg":function(d){return "ndersa"},
"whileTooltip":function(d){return "Perserit veprimet e brendshme derisa pika e mbarimit arritet."},
"yes":function(d){return "Po"}};