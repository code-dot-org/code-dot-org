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
"continue":function(d){return "Continuă"},
"doCode":function(d){return "execută"},
"elseCode":function(d){return "altfel"},
"endGame":function(d){return "sfârşitul jocului"},
"endGameTooltip":function(d){return "Termină jocul."},
"finalLevel":function(d){return "Felicitări! Ai rezolvat puzzle-ul final."},
"flap":function(d){return "zboară"},
"flapRandom":function(d){return "zboară o porțiune întâmplătoare"},
"flapVerySmall":function(d){return "zboară o porțiune foarte mică"},
"flapSmall":function(d){return "zboară o porțiune mică"},
"flapNormal":function(d){return "zboară o porțiune normală"},
"flapLarge":function(d){return "zboară o porțiune largă"},
"flapVeryLarge":function(d){return "zboară o porțiune foarte largă"},
"flapTooltip":function(d){return "Zboară-l pe Flappy în sus."},
"flappySpecificFail":function(d){return "Codul tău arată bine - va zbura cu fiecare clic. Dar ai nevoie să faci clic de mai multe ori ca să zboare la țintă."},
"incrementPlayerScore":function(d){return "marchează un punct"},
"incrementPlayerScoreTooltip":function(d){return "Adaugă unu la scorul de jucător curent."},
"nextLevel":function(d){return "Felicitări! Ai finalizat acest puzzle."},
"no":function(d){return "Nu"},
"numBlocksNeeded":function(d){return "Acest puzzle poate fi rezolvat cu %1 blocuri."},
"playSoundRandom":function(d){return "redă sunet aleator"},
"playSoundBounce":function(d){return "redă sunet de salt"},
"playSoundCrunch":function(d){return "redă sunet zdrobit"},
"playSoundDie":function(d){return "redă sunet trist"},
"playSoundHit":function(d){return "redă sunet de spargere"},
"playSoundPoint":function(d){return "redă sunet point"},
"playSoundSwoosh":function(d){return "redă sunet de şuierat"},
"playSoundWing":function(d){return "redă sunet de aripă"},
"playSoundJet":function(d){return "redă sunet de jet"},
"playSoundCrash":function(d){return "redă sunet de prăbuşire"},
"playSoundJingle":function(d){return "redă sunet de zdrăngăneală"},
"playSoundSplash":function(d){return "redă sunet de stropire"},
"playSoundLaser":function(d){return "redă sunet de laser"},
"playSoundTooltip":function(d){return "Redă sunetul ales."},
"reinfFeedbackMsg":function(d){return "Tu poţi apăsa butonul \"Încercaţi din nou\" pentru a reveni să joci jocul tău."},
"scoreText":function(d){return "Scor: "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "setează scena"},
"setBackgroundRandom":function(d){return "Setează decor Aleator"},
"setBackgroundFlappy":function(d){return "Setează decor Oraș (zi)"},
"setBackgroundNight":function(d){return "setează decor Oraș (noaptea)"},
"setBackgroundSciFi":function(d){return "setează decor Sci-Fi"},
"setBackgroundUnderwater":function(d){return "setează decor Subacvatic"},
"setBackgroundCave":function(d){return "setează decor Peșteră"},
"setBackgroundSanta":function(d){return "setează decor Moș Crăciun"},
"setBackgroundTooltip":function(d){return "Setează imaginea de fundal"},
"setGapRandom":function(d){return "setează un decalaj aleator"},
"setGapVerySmall":function(d){return "setează un decalaj foarte mic"},
"setGapSmall":function(d){return "setează un decalaj mic"},
"setGapNormal":function(d){return "setează un decalaj normal"},
"setGapLarge":function(d){return "setează un decalaj larg"},
"setGapVeryLarge":function(d){return "setează un decalaj foarte larg"},
"setGapHeightTooltip":function(d){return "Setează decalajul vertical într-un obstacol"},
"setGravityRandom":function(d){return "setează gravitație aleatorie"},
"setGravityVeryLow":function(d){return "setează gravitație foarte redusă"},
"setGravityLow":function(d){return "setează gravitație redusă"},
"setGravityNormal":function(d){return "setează gravitație normală"},
"setGravityHigh":function(d){return "setează gravitație ridicată"},
"setGravityVeryHigh":function(d){return "setează gravitație foarte ridicată"},
"setGravityTooltip":function(d){return "Setează nivelul de gravitație"},
"setGround":function(d){return "Setează solul"},
"setGroundRandom":function(d){return "setează solul la întâmplare"},
"setGroundFlappy":function(d){return "setează solul Sol"},
"setGroundSciFi":function(d){return "setează solul Sci-Fi"},
"setGroundUnderwater":function(d){return "setează solul Subacvatic"},
"setGroundCave":function(d){return "setează solul Peșteră"},
"setGroundSanta":function(d){return "setează solul Crăciun"},
"setGroundLava":function(d){return "setează solul Lavă"},
"setGroundTooltip":function(d){return "Setează imaginea solului"},
"setObstacle":function(d){return "Setează obstacol"},
"setObstacleRandom":function(d){return "setează obstacol Aleator"},
"setObstacleFlappy":function(d){return "setează obstacol Țeavă"},
"setObstacleSciFi":function(d){return "setează obstacol Sci-Fi"},
"setObstacleUnderwater":function(d){return "setează obstacol Plantă"},
"setObstacleCave":function(d){return "setează obstacol Peșteră"},
"setObstacleSanta":function(d){return "setează obstacol Horn"},
"setObstacleLaser":function(d){return "setează obstacol Laser"},
"setObstacleTooltip":function(d){return "Setează imaginea obstacolului"},
"setPlayer":function(d){return "Setează jucător"},
"setPlayerRandom":function(d){return "setează jucător Aleator"},
"setPlayerFlappy":function(d){return "setează jucător Pasăre Galbenă"},
"setPlayerRedBird":function(d){return "setează jucător Pasăre Roșie"},
"setPlayerSciFi":function(d){return "setează jucător Navă Spațială"},
"setPlayerUnderwater":function(d){return "setează jucător Pește"},
"setPlayerCave":function(d){return "setează jucător Liliac"},
"setPlayerSanta":function(d){return "setează jucător Moș Crăciun"},
"setPlayerShark":function(d){return "setează jucător Rechin"},
"setPlayerEaster":function(d){return "setează jucător Iepuraș de Paște"},
"setPlayerBatman":function(d){return "setează jucător Omul Liliac"},
"setPlayerSubmarine":function(d){return "setează jucător Submarin"},
"setPlayerUnicorn":function(d){return "setează jucător Unicorn"},
"setPlayerFairy":function(d){return "setează jucător Zână"},
"setPlayerSuperman":function(d){return "setează jucător Flappyman"},
"setPlayerTurkey":function(d){return "setează jucător Curcan"},
"setPlayerTooltip":function(d){return "Setează imaginea jucătorului"},
"setScore":function(d){return "Setează scor"},
"setScoreTooltip":function(d){return "Setează scorul jucătorului"},
"setSpeed":function(d){return "setează viteză"},
"setSpeedTooltip":function(d){return "Setează viteza nivelului"},
"shareFlappyTwitter":function(d){return "Hai să vezi ce  joc Flappy am făcut. L-am scris-o eu cu @codeorg"},
"shareGame":function(d){return "condivide jocul tău:"},
"soundRandom":function(d){return "aleator"},
"soundBounce":function(d){return "saritura"},
"soundCrunch":function(d){return "criză"},
"soundDie":function(d){return "trist"},
"soundHit":function(d){return "Distruge"},
"soundPoint":function(d){return "punct"},
"soundSwoosh":function(d){return "swoosh"},
"soundWing":function(d){return "aripa"},
"soundJet":function(d){return "Jet"},
"soundCrash":function(d){return "accident"},
"soundJingle":function(d){return "Jingle"},
"soundSplash":function(d){return "Splash"},
"soundLaser":function(d){return "cu laser"},
"speedRandom":function(d){return "setează viteză aleatorie"},
"speedVerySlow":function(d){return "setează viteză foarte lentă"},
"speedSlow":function(d){return "setează viteză lentă"},
"speedNormal":function(d){return "setează viteză normală"},
"speedFast":function(d){return "setează viteză rapidă"},
"speedVeryFast":function(d){return "setează viteză foarte rapidă"},
"whenClick":function(d){return "când faci clic"},
"whenClickTooltip":function(d){return "Execută acţiunile de mai jos când se produce un eveniment de click."},
"whenCollideGround":function(d){return "când lovește solul"},
"whenCollideGroundTooltip":function(d){return "Execută acţiunile de mai jos când Flappy lovește solul."},
"whenCollideObstacle":function(d){return "când lovește un obstacol"},
"whenCollideObstacleTooltip":function(d){return "Execută acţiunile de mai jos când Flappy lovește un obstacol."},
"whenEnterObstacle":function(d){return "când trece obstacolul"},
"whenEnterObstacleTooltip":function(d){return "Execută acţiunile de mai jos când Flappy intră într-un obstacol."},
"whenRunButtonClick":function(d){return "Când începe jocul"},
"whenRunButtonClickTooltip":function(d){return "Execută acţiunile de mai jos atunci când începe jocul."},
"yes":function(d){return "Da"}};