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
"continue":function(d){return "Turpināt"},
"doCode":function(d){return "darīt"},
"elseCode":function(d){return "cits"},
"endGame":function(d){return "spēles beigas"},
"endGameTooltip":function(d){return "Beidz spēli."},
"finalLevel":function(d){return "Apsveicu! Jūs esat atrisinājis pēdējo puzli."},
"flap":function(d){return "vicināt"},
"flapRandom":function(d){return "vicināt nejaušu daudzumu"},
"flapVerySmall":function(d){return "vicināt ļoti nelielu daudzumu reižu"},
"flapSmall":function(d){return "vicināt nelielu daudzumu reižu"},
"flapNormal":function(d){return "vicināt normālu skaitu reižu"},
"flapLarge":function(d){return "vicināt lielu daudzumu reižu"},
"flapVeryLarge":function(d){return "vicināt ļoti lielu daudzumu"},
"flapTooltip":function(d){return "Lidināt Flappy augšup."},
"flappySpecificFail":function(d){return "Tavs kods izskatās labi - Flappy lidos ar katru klikšķi. Taču tev vajadzēs klikšķināt daudzas reizes lai aizvicinātos līdz mērķim."},
"incrementPlayerScore":function(d){return "iegūt punktu"},
"incrementPlayerScoreTooltip":function(d){return "Palielināt pašreizējā spēlētāja rezultātu par vienu."},
"nextLevel":function(d){return "Apsveicu! Jūs pabeidzāt šo puzli."},
"no":function(d){return "Nē"},
"numBlocksNeeded":function(d){return "Šo puzli var atrisināt ar %1 blokiem."},
"playSoundRandom":function(d){return "atskaņot nejaušu skaņu"},
"playSoundBounce":function(d){return "atskaņot atlekšanas skaņu"},
"playSoundCrunch":function(d){return "atskaņot krakšķa skaņu"},
"playSoundDie":function(d){return "atskaņot bēdīgu skaņu"},
"playSoundHit":function(d){return "atskaņot sasišanās skaņu"},
"playSoundPoint":function(d){return "atskaņot punkta skaņu"},
"playSoundSwoosh":function(d){return "atskaņot \"svūūš\" skaņu"},
"playSoundWing":function(d){return "atskaņot spārnu skaņu"},
"playSoundJet":function(d){return "atskaņot lidmašīnas skaņu"},
"playSoundCrash":function(d){return "atskaņot blīkšķa skaņu"},
"playSoundJingle":function(d){return "atskaņot žvadzēšanas skaņu"},
"playSoundSplash":function(d){return "atskaņot šļakatu skaņu"},
"playSoundLaser":function(d){return "atskaņot lāzera skaņu"},
"playSoundTooltip":function(d){return "Atskaņot izvēlēto skaņu."},
"reinfFeedbackMsg":function(d){return "Tu vari nospiest \"Mēģināt vēlreiz\" pogu, lai atgrieztos atpakaļ pie spēles spēlēšanas."},
"scoreText":function(d){return "Rezultāts: "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "iestatīt ainu"},
"setBackgroundRandom":function(d){return "iestatīt nejaušu ainu"},
"setBackgroundFlappy":function(d){return "iestatīt ainu - Pilsēta(dienā)"},
"setBackgroundNight":function(d){return "iestatīt ainu - Pilsēta(naktī)"},
"setBackgroundSciFi":function(d){return "iestatīt ainu - Sci-Fi"},
"setBackgroundUnderwater":function(d){return "iestatīt ainu - Zemūdens"},
"setBackgroundCave":function(d){return "iestatīt ainu - Ala"},
"setBackgroundSanta":function(d){return "iestatīt ainu - Ziemassvētku vecītis"},
"setBackgroundTooltip":function(d){return "Iestata fona attēlu"},
"setGapRandom":function(d){return "iestatīt nejaušu atstarpi"},
"setGapVerySmall":function(d){return "iestatīt ļoti mazu atstarpi"},
"setGapSmall":function(d){return "iestatīt mazu atstarpi"},
"setGapNormal":function(d){return "iestatīt normālu atstarpi"},
"setGapLarge":function(d){return "iestatīt lielu atstarpi"},
"setGapVeryLarge":function(d){return "iestatīt ļoti lielu atstarpi"},
"setGapHeightTooltip":function(d){return "Iestata vertikālu atstarpi šķērslim"},
"setGravityRandom":function(d){return "iestata nejaušu gravitāti"},
"setGravityVeryLow":function(d){return "iestatīt ļoti mazu gravitāti"},
"setGravityLow":function(d){return "iestatīt mazu gravitāti"},
"setGravityNormal":function(d){return "iestatīt normālu gravitāti"},
"setGravityHigh":function(d){return "iestatīt augstu gravitāti"},
"setGravityVeryHigh":function(d){return "iestatīt ļoti lielu gravitāti"},
"setGravityTooltip":function(d){return "Iestata gravitātes lielumu"},
"setGround":function(d){return "iestatīt zemi"},
"setGroundRandom":function(d){return "iestatīt nejaušu zemi"},
"setGroundFlappy":function(d){return "iestatīt zemi - Zeme"},
"setGroundSciFi":function(d){return "iestatīt zemi - Sci-Fi"},
"setGroundUnderwater":function(d){return "iestatīt zemi - Zemūdens"},
"setGroundCave":function(d){return "iestatīt zemi - Ala"},
"setGroundSanta":function(d){return "iestatīt zemi - Santaklauss"},
"setGroundLava":function(d){return "iestatīt zemi - Lava"},
"setGroundTooltip":function(d){return "Iestata zemes attēlu"},
"setObstacle":function(d){return "iestatīt šķērsli"},
"setObstacleRandom":function(d){return "iestatīt šķērsli - Nejaušs"},
"setObstacleFlappy":function(d){return "iestati šķērsli - Caurule"},
"setObstacleSciFi":function(d){return "iestatīt šķērsli - Sci-Fi"},
"setObstacleUnderwater":function(d){return "iestatīt šķērsli - Augs"},
"setObstacleCave":function(d){return "iestatīt šķērsli - Ala"},
"setObstacleSanta":function(d){return "iestatīt šķērsli - Skurstenis"},
"setObstacleLaser":function(d){return "iestatīt šķērsli - Lāzers"},
"setObstacleTooltip":function(d){return "Iestata šķēršļa attēlu"},
"setPlayer":function(d){return "iestatīt spēlētāju"},
"setPlayerRandom":function(d){return "iestatīt spēlētāju - Nejaušs"},
"setPlayerFlappy":function(d){return "iestatīt spēlētāju - Dzeltens putns"},
"setPlayerRedBird":function(d){return "iestatīt spēlētāju - Sarkans putns"},
"setPlayerSciFi":function(d){return "iestatīt spēlētāju - Kosmosa kuģis"},
"setPlayerUnderwater":function(d){return "iestatīt spēlētāju - Zivs"},
"setPlayerCave":function(d){return "iestatīt spēlētāju - Sikspārnis"},
"setPlayerSanta":function(d){return "iestatīt spēlētāju - Santaklauss"},
"setPlayerShark":function(d){return "iestatīt spēlētāju - Haizivs"},
"setPlayerEaster":function(d){return "iestatīt spēlētāju - Lieldienu zaķītis"},
"setPlayerBatman":function(d){return "iestatīt spēlētāju - Betmens"},
"setPlayerSubmarine":function(d){return "iestatīt spēlētāju - Zemūdene"},
"setPlayerUnicorn":function(d){return "iestatīt spēlētāju - Vienradzis"},
"setPlayerFairy":function(d){return "iestatīt spēlētāju - Feja"},
"setPlayerSuperman":function(d){return "iestatīt spēlētāju - Flapijs"},
"setPlayerTurkey":function(d){return "iestatīt spēlētāju - Tītars"},
"setPlayerTooltip":function(d){return "Iestata spēlētāja attēlu"},
"setScore":function(d){return "rezultāts"},
"setScoreTooltip":function(d){return "Iestata spēlētāja rezultātu"},
"setSpeed":function(d){return "iestatīt ātrumu"},
"setSpeedTooltip":function(d){return "Iestata līmeņa ātrumu"},
"shareFlappyTwitter":function(d){return "Aplūko Flappy spēli, kuru izveidoju. Es uzrakstīju to pats kopā ar @codeorg"},
"shareGame":function(d){return "Iesaki savu speli:"},
"soundRandom":function(d){return "nejaušs"},
"soundBounce":function(d){return "atlekt"},
"soundCrunch":function(d){return "kraukš"},
"soundDie":function(d){return "bēdīgs"},
"soundHit":function(d){return "sadauzīt"},
"soundPoint":function(d){return "punkts"},
"soundSwoosh":function(d){return "Swoosh"},
"soundWing":function(d){return "spārns"},
"soundJet":function(d){return "lidmašīna"},
"soundCrash":function(d){return "blīkšķis"},
"soundJingle":function(d){return "žvadzināšana"},
"soundSplash":function(d){return "sļakstiens"},
"soundLaser":function(d){return "lāzers"},
"speedRandom":function(d){return "iestatīt nejaušu ātrumu"},
"speedVerySlow":function(d){return "iestatīt ļoti mazu ātrumu"},
"speedSlow":function(d){return "iestatīt mazu ātrumu"},
"speedNormal":function(d){return "iestatīt normālu ātrumu"},
"speedFast":function(d){return "iestatīt lielu ātrumu"},
"speedVeryFast":function(d){return "iestatīt ļoti lielu ātrumu"},
"whenClick":function(d){return "kad noklikšķināts"},
"whenClickTooltip":function(d){return "Izpildīt sekojošas darbības, kad notiek klikšķa notikums."},
"whenCollideGround":function(d){return "kad notiek sadursme ar zemi"},
"whenCollideGroundTooltip":function(d){return "Izpildīt sekojošas darbīas, kad Flapijs saduras ar zemi."},
"whenCollideObstacle":function(d){return "kad saduras ar šķērsli"},
"whenCollideObstacleTooltip":function(d){return "Izpildīt sekojošas darbības, kad Flapijs saduras ar šķērsli."},
"whenEnterObstacle":function(d){return "kad pārvarēt šķērsli"},
"whenEnterObstacleTooltip":function(d){return "Izpildīt sekojošas darbīas, kad Flapijs saskaras ar šķērsli."},
"whenRunButtonClick":function(d){return "kad spēle sākas"},
"whenRunButtonClickTooltip":function(d){return "Izpildīt sekojošas darbības, kad spēle sākas."},
"yes":function(d){return "Jā"}};