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
"continue":function(d){return "Vazhdo"},
"doCode":function(d){return "bej"},
"elseCode":function(d){return "përndryshe"},
"endGame":function(d){return "përfundo lojën"},
"endGameTooltip":function(d){return "Përfundon lojën."},
"finalLevel":function(d){return "Urime! Ju keni përfunduar puzzle-in përfundimtar."},
"flap":function(d){return "përplas flatrat"},
"flapRandom":function(d){return "fluturo në sasi të rastësishme"},
"flapVerySmall":function(d){return "fluturo në sasi shumë të vogël"},
"flapSmall":function(d){return "fluturo në sasi të vogël"},
"flapNormal":function(d){return "fluturo në sasi normale"},
"flapLarge":function(d){return "fluturo në sasi të madhe"},
"flapVeryLarge":function(d){return "fluturo në sasi shumë të madhe"},
"flapTooltip":function(d){return "Fluturoje Flappy-n përpara."},
"flappySpecificFail":function(d){return "Kodi juaj duket bukur - do të fluturojë me çdo klikim. Por, duhet të klikosh disa herë për të flutuar deri tek objektivi."},
"incrementPlayerScore":function(d){return "shëno një pikë"},
"incrementPlayerScoreTooltip":function(d){return "Shto një në rezultatin aktual të lojtarit."},
"nextLevel":function(d){return "Urime! Ju keni përfunduar këtë puzzle."},
"no":function(d){return "Jo"},
"numBlocksNeeded":function(d){return "Ky puzzle mund të zgjidhet me %1 blloqe."},
"playSoundRandom":function(d){return "luaj muzikë të zakonshme"},
"playSoundBounce":function(d){return "luaj muzikë hedhjeje"},
"playSoundCrunch":function(d){return "vendos tingullin \"e kërcitjes\""},
"playSoundDie":function(d){return "luaj muzikë të mërzitur"},
"playSoundHit":function(d){return "luaj muzikë thyerje"},
"playSoundPoint":function(d){return "luaj muzikë pike"},
"playSoundSwoosh":function(d){return "luaje tingullin e shushuritjes"},
"playSoundWing":function(d){return "luaj muzikë krahësh"},
"playSoundJet":function(d){return "luaje tingullin e motorit reaktiv"},
"playSoundCrash":function(d){return "luaje tingullin e përplasjes"},
"playSoundJingle":function(d){return "luaje tingullin e tringëllimës"},
"playSoundSplash":function(d){return "luaje tingullin e përplasjes në ujë"},
"playSoundLaser":function(d){return "luaje tingullin e laserit"},
"playSoundTooltip":function(d){return "Vendos tingullin e zgjedhur."},
"reinfFeedbackMsg":function(d){return "Ju mund të shtypni butonin \"Provo Përsëri\" për tu kthyer mbrapa dhe për të luajtur lojën tuaj."},
"scoreText":function(d){return "Pikët: "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "vendos skenën"},
"setBackgroundRandom":function(d){return "vendos skenën Rastësi"},
"setBackgroundFlappy":function(d){return "vendos skenën Qyteti (ditë)"},
"setBackgroundNight":function(d){return "caktoje skenën Qyteti (natë)"},
"setBackgroundSciFi":function(d){return "caktoje skenën Fantastikë Shkencore"},
"setBackgroundUnderwater":function(d){return "vendos skenën Nën ujë"},
"setBackgroundCave":function(d){return "vendos skenën Shpellë"},
"setBackgroundSanta":function(d){return "vendos skenën e Santa-s"},
"setBackgroundTooltip":function(d){return "Vendos sfondin e imazhit"},
"setGapRandom":function(d){return "vendos boshllëk të rastësishëm"},
"setGapVerySmall":function(d){return "vendos boshllëk shumë të vogël"},
"setGapSmall":function(d){return "vendos boshllëk të vogël"},
"setGapNormal":function(d){return "vendos boshllëk normal"},
"setGapLarge":function(d){return "vendos boshllëk të madh"},
"setGapVeryLarge":function(d){return "vendos boshllëk shumë të madh"},
"setGapHeightTooltip":function(d){return "Vendos boshllëkun vertikal në një pengesë"},
"setGravityRandom":function(d){return "vendos gravitet të rastësishëm"},
"setGravityVeryLow":function(d){return "vendos gravitet shumë të ulët"},
"setGravityLow":function(d){return "vendos gravitet të ulët"},
"setGravityNormal":function(d){return "vendos gravitet normal"},
"setGravityHigh":function(d){return "vendos gravitet të lartë"},
"setGravityVeryHigh":function(d){return "vendos gravitet shumë të lartë"},
"setGravityTooltip":function(d){return "Vendos gravitetin e nivelit"},
"setGround":function(d){return "vendos fushën"},
"setGroundRandom":function(d){return "vendos fushën Rastësi"},
"setGroundFlappy":function(d){return "vendos fushën Fushë"},
"setGroundSciFi":function(d){return "vendos fushën Fantastike Shkencore"},
"setGroundUnderwater":function(d){return "vendos fushën Nën ujë"},
"setGroundCave":function(d){return "vendos fushën Shpellë"},
"setGroundSanta":function(d){return "vendos fushën Santa"},
"setGroundLava":function(d){return "vendos fushën Llavë"},
"setGroundTooltip":function(d){return "Vendos imazhin e fushës"},
"setObstacle":function(d){return "vendos pengesën"},
"setObstacleRandom":function(d){return "Vendose pengesën si të rastit"},
"setObstacleFlappy":function(d){return "Vendos pengesë tub"},
"setObstacleSciFi":function(d){return "vendos pengesë Fantastike Shkencore"},
"setObstacleUnderwater":function(d){return "vendos pengesë Bime"},
"setObstacleCave":function(d){return "vendos pengesë Shpelle"},
"setObstacleSanta":function(d){return "vendos pengesë Oxhaku"},
"setObstacleLaser":function(d){return "vendos pengesë Laserin"},
"setObstacleTooltip":function(d){return "Vendos imazhin e pengesës"},
"setPlayer":function(d){return "vendos lojtarin"},
"setPlayerRandom":function(d){return "vendos lojtar të Rastit"},
"setPlayerFlappy":function(d){return "vendos lojtar Zogun e Verdhë"},
"setPlayerRedBird":function(d){return "vendos lojtar Zogun e Kuq"},
"setPlayerSciFi":function(d){return "vendos lojtar Anijen Hapësinore"},
"setPlayerUnderwater":function(d){return "vendos lojtar Peshkun"},
"setPlayerCave":function(d){return "vendos lojtar Lakuriqin e Natës"},
"setPlayerSanta":function(d){return "vendos lojtar Santën"},
"setPlayerShark":function(d){return "vendos lojtar Peshkaqenin"},
"setPlayerEaster":function(d){return "vendos lojtar Lepurin e Pashkëve"},
"setPlayerBatman":function(d){return "vendos lojtar njeriun Lakuriq Nate"},
"setPlayerSubmarine":function(d){return "vendos lojtar Nëndetësen"},
"setPlayerUnicorn":function(d){return "vendos lojtar Njëbrirëshin"},
"setPlayerFairy":function(d){return "vendos lojtare Zanën"},
"setPlayerSuperman":function(d){return "vendos lojtar Flappyman-in"},
"setPlayerTurkey":function(d){return "vendos lojtar Gjelin e Detit"},
"setPlayerTooltip":function(d){return "Vendos imazhin e lojtarit"},
"setScore":function(d){return "vendos pikën"},
"setScoreTooltip":function(d){return "Vendos pikën e lojtarit"},
"setSpeed":function(d){return "vendos shpejtësinë"},
"setSpeedTooltip":function(d){return "Vendos shpejtësinë e nivelit"},
"shareFlappyTwitter":function(d){return "Shiko lojën Flappy që bëra. E shkruajta vetë me @codeorg"},
"shareGame":function(d){return "Shpërndaj lojën tënde:"},
"soundRandom":function(d){return "zakonshëm"},
"soundBounce":function(d){return "hidhu"},
"soundCrunch":function(d){return "përtyp"},
"soundDie":function(d){return "mërzitur"},
"soundHit":function(d){return "thyhet"},
"soundPoint":function(d){return "pikë"},
"soundSwoosh":function(d){return "shushuritje"},
"soundWing":function(d){return "krahë"},
"soundJet":function(d){return "reaktiv"},
"soundCrash":function(d){return "përplasje"},
"soundJingle":function(d){return "tringëllin"},
"soundSplash":function(d){return "spërkatje"},
"soundLaser":function(d){return "lazer"},
"speedRandom":function(d){return "vendos shpejtësinë e zakonshme"},
"speedVerySlow":function(d){return "vendos shpejtësinë shumë të ngadaltë"},
"speedSlow":function(d){return "vendos shpejtësinë të ngadaltë"},
"speedNormal":function(d){return "vendos shpejtësinë normale"},
"speedFast":function(d){return "vendos shpejtësi të shpejtë"},
"speedVeryFast":function(d){return "vendos shpejtësi shumë të shpejtë"},
"whenClick":function(d){return "kur klikohet"},
"whenClickTooltip":function(d){return "Ekzekuto veprimet më poshtë kur ndodh një event klikimi."},
"whenCollideGround":function(d){return "kur goditet toka"},
"whenCollideGroundTooltip":function(d){return "Ekzekuto veprimet më poshtë kur Flappy e godet tokën."},
"whenCollideObstacle":function(d){return "kur goditet një pengesë"},
"whenCollideObstacleTooltip":function(d){return "Ekzekuto veprimet më poshtë kur Flappy godet një pengesë."},
"whenEnterObstacle":function(d){return "kur kalohet pengesa"},
"whenEnterObstacleTooltip":function(d){return "Ekzekuto veprimet më poshtë kur Flappy hyn në një pengesë."},
"whenRunButtonClick":function(d){return "kur fillon loja"},
"whenRunButtonClickTooltip":function(d){return "Ekzekuto veprimet më poshtë kur fillon loja."},
"yes":function(d){return "Po"}};