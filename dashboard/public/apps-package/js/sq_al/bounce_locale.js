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
"bounceBall":function(d){return "Gjuajtje rikoshet"},
"bounceBallTooltip":function(d){return "Gjuaj një objekt rikoshet."},
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
"incrementOpponentScore":function(d){return "rezultati i oponentit/es"},
"incrementOpponentScoreTooltip":function(d){return "Shto një në rezultatin aktual të oponentit."},
"incrementPlayerScore":function(d){return "rezultati"},
"incrementPlayerScoreTooltip":function(d){return "Shto një në rezultatin aktual të lojtarit."},
"isWall":function(d){return "a është muri"},
"isWallTooltip":function(d){return "Kthehet në \" i vërtetë\" nëse këtu egziston një mur."},
"launchBall":function(d){return "nis nje top te ri"},
"launchBallTooltip":function(d){return "Nis nje top ne loje."},
"makeYourOwn":function(d){return "Krijo Lojen Tende"},
"moveDown":function(d){return "lëviz poshtë"},
"moveDownTooltip":function(d){return "Vendos pedalen poshtë."},
"moveForward":function(d){return "levis perpara"},
"moveForwardTooltip":function(d){return "Me leviz perpara nje hapesire."},
"moveLeft":function(d){return "lëviz majtas"},
"moveLeftTooltip":function(d){return "Lëvize pedalen në të majtë."},
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
"playSoundCrunch":function(d){return "vendos tingullin \"e kërcitjes\""},
"playSoundGoal1":function(d){return "vendos tingullin \"qëllimi 1\""},
"playSoundGoal2":function(d){return "vendos tingullin \"qëllimi 2\""},
"playSoundHit":function(d){return "vendos tingullin \"e goditjes\""},
"playSoundLosePoint":function(d){return "vendos tingullin \"humb pikë\""},
"playSoundLosePoint2":function(d){return "vendos tingullin \"humb pikë 2\""},
"playSoundRetro":function(d){return "vendos tingullin \"retro\""},
"playSoundRubber":function(d){return "vendos tingullin e \"gomës\""},
"playSoundSlap":function(d){return "vendos tingullin e \"goditjes\""},
"playSoundTooltip":function(d){return "Vendos tingullin e zgjedhur."},
"playSoundWinPoint":function(d){return "vendos tingullin e \"fitoj pikë\""},
"playSoundWinPoint2":function(d){return "vendos tingullin e \" fitoj pikë 2\""},
"playSoundWood":function(d){return "vendos tingullin \"e pyllit\""},
"putdownTower":function(d){return "vendos ne toke nje kulle"},
"reinfFeedbackMsg":function(d){return "Ju mund te shtypni butonin \"Provo Perseri\" per tu kthyer mrapa dhe per te luajtur lojen tuaj."},
"removeSquare":function(d){return "hiq katror"},
"repeatUntil":function(d){return "perserit derisa"},
"repeatUntilBlocked":function(d){return "perderisa ka hapesire perpara"},
"repeatUntilFinish":function(d){return "perserit deri sa te mbaroje"},
"scoreText":function(d){return "Rezultati: "+bounce_locale.v(d,"playerScore")+" : "+bounce_locale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "rregullo nje skene te rastesishme"},
"setBackgroundHardcourt":function(d){return "vendos nje skene te forte"},
"setBackgroundRetro":function(d){return "rregullo retro skenen"},
"setBackgroundTooltip":function(d){return "Rregullo sfondin e imazhit"},
"setBallRandom":function(d){return "rregullo topin e rastesishem"},
"setBallHardcourt":function(d){return "vendos topin në fushë"},
"setBallRetro":function(d){return "vendos topin në retrospektivë"},
"setBallTooltip":function(d){return "Pamje nga pozicionet e topit"},
"setBallSpeedRandom":function(d){return "vendos topin në shpejtësi të zakonshme"},
"setBallSpeedVerySlow":function(d){return "vendos topin në shpejtësi shumë të ulët"},
"setBallSpeedSlow":function(d){return "vendos topin në shpejtësi të ulët"},
"setBallSpeedNormal":function(d){return "vendos topin në shpejtësi normale"},
"setBallSpeedFast":function(d){return "vendos topin në shpejtësi të lartë"},
"setBallSpeedVeryFast":function(d){return "Vendos topin në shpejtësi shumë të lartë"},
"setBallSpeedTooltip":function(d){return "Vendos shpejtësinë e topit"},
"setPaddleRandom":function(d){return "Vendos një lopatë çfarëdo"},
"setPaddleHardcourt":function(d){return "vendos lopatën në fushë"},
"setPaddleRetro":function(d){return "vendos lopatën në retrospektivë"},
"setPaddleTooltip":function(d){return "Pamje nga pozicionet e lopatës"},
"setPaddleSpeedRandom":function(d){return "vendos lopatën në shpejtësi të zakonshme"},
"setPaddleSpeedVerySlow":function(d){return "vendos lopatën në shpejtësi shumë të ulët"},
"setPaddleSpeedSlow":function(d){return "vendos lopatën në shpejtësi të ulët"},
"setPaddleSpeedNormal":function(d){return "vendos lopatën në shpejtësi normale"},
"setPaddleSpeedFast":function(d){return "vendos lopatën në shpejtësi të lartë"},
"setPaddleSpeedVeryFast":function(d){return "Vendos lopatën në shpejtësi shumë të lartë"},
"setPaddleSpeedTooltip":function(d){return "Vendos shpejtësinë e lopatës"},
"shareBounceTwitter":function(d){return "Hidhi një sy lojës së topit që bëra. E krijova vet me @codeorg"},
"shareGame":function(d){return "Shpërndaj lojën tënde:"},
"turnLeft":function(d){return "kthehu majtas"},
"turnRight":function(d){return "kthehu djathtas"},
"turnTooltip":function(d){return "Te kthen majtas ose djathtas prej 90 gradesh."},
"whenBallInGoal":function(d){return "kur kthehet topi në qëllim"},
"whenBallInGoalTooltip":function(d){return "Kryej veprimet si më poshtë kur një top hyn në rrjetë."},
"whenBallMissesPaddle":function(d){return "kur një top nuk prek lopatën"},
"whenBallMissesPaddleTooltip":function(d){return "Kryej veprimet si më poshtë kur një top nuk a arrin lopatën."},
"whenDown":function(d){return "me kursorin poshtë"},
"whenDownTooltip":function(d){return "Kryej veprimet si më poshtë kur celësi i kursorit për poshtë të jetë i shtypur."},
"whenGameStarts":function(d){return "kur loja fillon"},
"whenGameStartsTooltip":function(d){return "Kryej veprimet më poshtë kur të fillojë loja."},
"whenLeft":function(d){return "me kursorin e majtë"},
"whenLeftTooltip":function(d){return "Kryej veprimet si më poshtë me  celësin e kursorit të majtë të shtypur."},
"whenPaddleCollided":function(d){return "kur topi godet lopatën"},
"whenPaddleCollidedTooltip":function(d){return "Kryej veprimet si më poshtë kur topi përplaset me lopatën."},
"whenRight":function(d){return "me kursorin e djathtë"},
"whenRightTooltip":function(d){return "Kryej veprimet si më poshtë me kursorin e djathtë të shtypur."},
"whenUp":function(d){return "me kursorin lartë"},
"whenUpTooltip":function(d){return "Kryej veprimet si më poshtë me çelësin e kursorit për lartë të shtypur."},
"whenWallCollided":function(d){return "kur topi të godasi në mur"},
"whenWallCollidedTooltip":function(d){return "Kryej veprimet si më poshtë kur një top të përplaset në mur."},
"whileMsg":function(d){return "ndersa"},
"whileTooltip":function(d){return "Perserit veprimet e brendshme derisa pika e mbarimit arritet."},
"yes":function(d){return "Po"}};