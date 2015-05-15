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
"continue":function(d){return "Jatka"},
"doCode":function(d){return "tee"},
"elseCode":function(d){return "muuten"},
"endGame":function(d){return "lopeta peli"},
"endGameTooltip":function(d){return "Lopettaa pelin."},
"finalLevel":function(d){return "Onneksi olkoon! Olet suorittanut viimeisen pulman."},
"flap":function(d){return "räpyttele"},
"flapRandom":function(d){return "räpyttele satunnainen määrä"},
"flapVerySmall":function(d){return "räpyttele hyvin pieni määrä"},
"flapSmall":function(d){return "räpyttele pieni määrä"},
"flapNormal":function(d){return "räpyttele normaali määrä"},
"flapLarge":function(d){return "räpyttele suuri määrä"},
"flapVeryLarge":function(d){return "räpyttele hyvin suuri määrä"},
"flapTooltip":function(d){return "Lennätä Flappyä ylöspäin."},
"flappySpecificFail":function(d){return "Koodisi näyttää hyvältä - se räpyttelee joka klikkauksella. Sinun pitää vain klikkailla monta kertaa räpytelläksesi maaliin."},
"incrementPlayerScore":function(d){return "anna piste"},
"incrementPlayerScoreTooltip":function(d){return "Lisää yksi piste pelaajan pisteisiin."},
"nextLevel":function(d){return "Onneksi olkoon! Olet suorittanut tämän pulman."},
"no":function(d){return "Ei"},
"numBlocksNeeded":function(d){return "Pulman voi ratkaista %1 lohkolla."},
"playSoundRandom":function(d){return "soita satunnainen ääni"},
"playSoundBounce":function(d){return "soita pompun ääni"},
"playSoundCrunch":function(d){return "soita rusahduksen ääni"},
"playSoundDie":function(d){return "soita surullinen ääni"},
"playSoundHit":function(d){return "soita mäiskähdyksen ääni"},
"playSoundPoint":function(d){return "soita pisteen saamisen ääni"},
"playSoundSwoosh":function(d){return "soita humahduksen ääni"},
"playSoundWing":function(d){return "soita siiven ääni"},
"playSoundJet":function(d){return "soita suihkumoottorin ääni"},
"playSoundCrash":function(d){return "soita törmäyksen ääni"},
"playSoundJingle":function(d){return "soita kilisevä ääni"},
"playSoundSplash":function(d){return "soita läiskähdyksen ääni"},
"playSoundLaser":function(d){return "soita laserin ääni"},
"playSoundTooltip":function(d){return "Soita valittu ääni."},
"reinfFeedbackMsg":function(d){return "Voit painaa \"Yritä uudelleen\" nappia palataksesi takaisin peliisi."},
"scoreText":function(d){return "Pisteet: "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "aseta tausta"},
"setBackgroundRandom":function(d){return "aseta tausta Satunnainen"},
"setBackgroundFlappy":function(d){return "aseta tausta Kaupunki (päivä)"},
"setBackgroundNight":function(d){return "aseta tausta Kaupunki (yö)"},
"setBackgroundSciFi":function(d){return "aseta tausta Sci-Fi"},
"setBackgroundUnderwater":function(d){return "aseta tausta Vedenalainen"},
"setBackgroundCave":function(d){return "aseta tausta Luola"},
"setBackgroundSanta":function(d){return "aseta tausta Joulupukki"},
"setBackgroundTooltip":function(d){return "Aseta taustakuva"},
"setGapRandom":function(d){return "aseta sattumanvarainen väli"},
"setGapVerySmall":function(d){return "aseta hyvin pieni väli"},
"setGapSmall":function(d){return "aseta pieni väli"},
"setGapNormal":function(d){return "aseta normaali väli"},
"setGapLarge":function(d){return "aseta suuri väli"},
"setGapVeryLarge":function(d){return "aseta hyvin suuri väli"},
"setGapHeightTooltip":function(d){return "Aseta pystysuora väli esteeseen"},
"setGravityRandom":function(d){return "aseta painovoima satunnaisesti"},
"setGravityVeryLow":function(d){return "aseta painovoima hyvin alhaiseksi"},
"setGravityLow":function(d){return "aseta painovoima alhaiseksi"},
"setGravityNormal":function(d){return "aseta painovoima normaaliksi"},
"setGravityHigh":function(d){return "aseta painovoima korkeaksi"},
"setGravityVeryHigh":function(d){return "aseta painovoima hyvin korkeaksi"},
"setGravityTooltip":function(d){return "Aseta tason painovoima"},
"setGround":function(d){return "aseta pohja"},
"setGroundRandom":function(d){return "aseta pohja Satunnainen"},
"setGroundFlappy":function(d){return "aseta pohja Maa"},
"setGroundSciFi":function(d){return "aseta pohja Sci-Fi"},
"setGroundUnderwater":function(d){return "aseta pohja Vedenalainen"},
"setGroundCave":function(d){return "aseta pohja Luola"},
"setGroundSanta":function(d){return "aseta pohja Joulu"},
"setGroundLava":function(d){return "aseta pohja Laava"},
"setGroundTooltip":function(d){return "Asettaa pohjassa käytettävän kuvan"},
"setObstacle":function(d){return "aseta este"},
"setObstacleRandom":function(d){return "aseta este Satunnainen"},
"setObstacleFlappy":function(d){return "aseta este Putki"},
"setObstacleSciFi":function(d){return "aseta este Sci-Fi"},
"setObstacleUnderwater":function(d){return "aseta este Kasvi"},
"setObstacleCave":function(d){return "aseta este Luola"},
"setObstacleSanta":function(d){return "aseta este Piippu"},
"setObstacleLaser":function(d){return "aseta este Laser"},
"setObstacleTooltip":function(d){return "Asettaa esteen kuvan"},
"setPlayer":function(d){return "aseta pelaaja"},
"setPlayerRandom":function(d){return "aseta pelaaja Satunnainen"},
"setPlayerFlappy":function(d){return "aseta pelaaja Keltainen lintu"},
"setPlayerRedBird":function(d){return "aseta pelaaja Punainen lintu"},
"setPlayerSciFi":function(d){return "aseta pelaaja Avaruusalus"},
"setPlayerUnderwater":function(d){return "aseta pelaaja Kala"},
"setPlayerCave":function(d){return "aseta pelaaja Lepakko"},
"setPlayerSanta":function(d){return "aseta pelaaja Joulupukki"},
"setPlayerShark":function(d){return "aseta pelaaja Hai"},
"setPlayerEaster":function(d){return "aseta pelaaja Pääsiäispupu"},
"setPlayerBatman":function(d){return "aseta pelaaja Lepakkotyyppi"},
"setPlayerSubmarine":function(d){return "aseta pelaaja Sukellusvene"},
"setPlayerUnicorn":function(d){return "aseta pelaaja Yksisarvinen"},
"setPlayerFairy":function(d){return "aseta pelaaja Keijukainen"},
"setPlayerSuperman":function(d){return "aseta pelaaja Räpyttelijämies"},
"setPlayerTurkey":function(d){return "aseta pelaaja Kalkkuna"},
"setPlayerTooltip":function(d){return "Asettaa pelaajakuvan"},
"setScore":function(d){return "aseta pisteet"},
"setScoreTooltip":function(d){return "Asettaa pelaajan pisteet"},
"setSpeed":function(d){return "aseta nopeus"},
"setSpeedTooltip":function(d){return "Asettaa tason nopeuden"},
"shareFlappyTwitter":function(d){return "Tutustu Flappy-peliin, jonka tein. Koodasin sen itse @codeorg:illa"},
"shareGame":function(d){return "Jaa pelisi:"},
"soundRandom":function(d){return "satunnainen"},
"soundBounce":function(d){return "pomppu"},
"soundCrunch":function(d){return "rusahdus"},
"soundDie":function(d){return "surullinen"},
"soundHit":function(d){return "mäiskähdys"},
"soundPoint":function(d){return "piste"},
"soundSwoosh":function(d){return "humahdus"},
"soundWing":function(d){return "siipi"},
"soundJet":function(d){return "suihkumoottori"},
"soundCrash":function(d){return "törmäys"},
"soundJingle":function(d){return "kilinä"},
"soundSplash":function(d){return "läiskähdys"},
"soundLaser":function(d){return "laser"},
"speedRandom":function(d){return "aseta nopeus satunnainen"},
"speedVerySlow":function(d){return "aseta nopeus hyvin hidas"},
"speedSlow":function(d){return "aseta nopeus hidas"},
"speedNormal":function(d){return "aseta nopeus normaali"},
"speedFast":function(d){return "aseta nopeus nopea"},
"speedVeryFast":function(d){return "aseta nopeus hyvin nopea"},
"whenClick":function(d){return "napsautuksella"},
"whenClickTooltip":function(d){return "Suorita alla olevat toiminnot kun napsautat hiirellä tai kosketuksella."},
"whenCollideGround":function(d){return "maahan osuttaessa"},
"whenCollideGroundTooltip":function(d){return "Suorita alla olevat toiminnot kun Flappy osuu maahan."},
"whenCollideObstacle":function(d){return "esteeseen osuttaessa"},
"whenCollideObstacleTooltip":function(d){return "Suorita alla olevat toiminnot, kun Flappy osuu esteeseen."},
"whenEnterObstacle":function(d){return "kun este on ohitettu"},
"whenEnterObstacleTooltip":function(d){return "Suorita alla olevat toiminnot, kun Flappy saapuu esteelle."},
"whenRunButtonClick":function(d){return "kun peli alkaa"},
"whenRunButtonClickTooltip":function(d){return "Suorita alla olevat toiminnot, kun peli alkaa."},
"yes":function(d){return "Kyllä"}};