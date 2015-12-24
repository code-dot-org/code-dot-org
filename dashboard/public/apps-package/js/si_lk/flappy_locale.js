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
v:function(d,k){flappy_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){flappy_locale.c(d,k);return d[k] in p?p[d[k]]:(k=flappy_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){flappy_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).flappy_locale = {
"continue":function(d){return "ඉදිරියට යන්න"},
"doCode":function(d){return "do"},
"elseCode":function(d){return "else"},
"endGame":function(d){return "ක්‍රීඩාව අවසන් කරන්න"},
"endGameTooltip":function(d){return "ක්‍රීඩාව අවසන් කරන්න."},
"finalLevel":function(d){return "සුභපැතුම්! ඔබ අවසාන ප්‍රහේලිකාව විසඳා ඇත."},
"flap":function(d){return "ඉගිලෙන්න"},
"flapRandom":function(d){return "අහඹු ප්‍රමාණයක් ඉගිලෙන්න"},
"flapVerySmall":function(d){return "ඉතා කුඩා ප්‍රමාණයක් ඉගිලෙන්න"},
"flapSmall":function(d){return "කුඩා ප්‍රමාණයක් ඉගිලෙන්න"},
"flapNormal":function(d){return "සමාන්‍යය ප්‍රමාණයක් ඉගිලෙන්න"},
"flapLarge":function(d){return "විශාල ප්‍රමාණයක් ඉගිලෙන්න"},
"flapVeryLarge":function(d){return "ඉතා විශාල ප්‍රමාණයක් ඉගිලෙන්න"},
"flapTooltip":function(d){return "Flappy ව ඉහළට පියාසර කරවන්න."},
"flappySpecificFail":function(d){return "ඔබගේ කේතය අනර්ඝයි - එය Click එකකදී එක් ඉගිල්ලුමක් සිදු කරනවා. නමුත් ඔබට ඉලක්කය කරා ඉගිලීමට නම් බොහෝ Click ප්‍රමාණයක් සිදු කිරීමට අවශ්‍යය වෙනවා."},
"incrementPlayerScore":function(d){return "ලකුණක් ලබා ගන්න"},
"incrementPlayerScoreTooltip":function(d){return "වත්මන් ක්‍රීඩකයා ගේ ලකුණු සඳහා එකක් එකතු කරන්න."},
"nextLevel":function(d){return "සුබ පැතුම්! ඔබට මෙම ප්‍රහේලිකාව සම්පූර්ණ කර ඇත."},
"no":function(d){return "නැහැ"},
"numBlocksNeeded":function(d){return "This puzzle can be solved with %1 blocks."},
"playSoundRandom":function(d){return "අහඹු ශබ්දයක් වාදනය කරන්න"},
"playSoundBounce":function(d){return "bounce ශබ්දය වාදනය කරන්න"},
"playSoundCrunch":function(d){return "හපන ශබ්ධය නගන්න"},
"playSoundDie":function(d){return "දුක් මුසු ශබ්දය වාදනය කරන්න"},
"playSoundHit":function(d){return "smash ශබ්දය වාදනය කරන්න"},
"playSoundPoint":function(d){return "point ශබ්දය වාදනය කරන්න"},
"playSoundSwoosh":function(d){return "swoosh ශබ්දය වාදනය කරන්න"},
"playSoundWing":function(d){return "wing ශබ්දය වාදනය කරන්න"},
"playSoundJet":function(d){return "jet ශබ්දය වාදනය කරන්න"},
"playSoundCrash":function(d){return "crash ශබ්දය වාදනය කරන්න"},
"playSoundJingle":function(d){return "jingle ශබ්දය වාදනය කරන්න"},
"playSoundSplash":function(d){return "splash"},
"playSoundLaser":function(d){return "laser ශබ්දය වාදනය කරන්න"},
"playSoundTooltip":function(d){return "තෝරාගත් ශබ්ධයක් නගන්න."},
"reinfFeedbackMsg":function(d){return "නැවත වරක් ක්‍රීඩා කිරීමට \"Try again\" බොත්තම ඔබන්න."},
"scoreText":function(d){return "ලකුණු ප්‍රමාණය: "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "පසුතලයක් පිහිටුවන්න"},
"setBackgroundRandom":function(d){return "අහඹු පසුතලයක් පිහිටුවන්න"},
"setBackgroundFlappy":function(d){return "(දිවා) නගරයක පසුතලයක් පිහිටුවන්න"},
"setBackgroundNight":function(d){return "(රාත්‍රී) නගරයක පසුතලයක් පිහිටුවන්න"},
"setBackgroundSciFi":function(d){return "විද්‍යා ප්‍රබන්ධ පසුතලයක් පිහිටුවන්න"},
"setBackgroundUnderwater":function(d){return "ජලය සහිත පසුතලයක් පිහිටුවන්න"},
"setBackgroundCave":function(d){return "ගුහාවකට සමගාමි පසුතලයක් පිහිටුවන්න"},
"setBackgroundSanta":function(d){return "santa සහිත පසුතලයක් පිහිටුවන්න"},
"setBackgroundTooltip":function(d){return "පසුතලය සඳහා පින්තූරයක් පිහිටුවන්න"},
"setGapRandom":function(d){return "අහුඹු පරතරයක් පිහිටුවන්න"},
"setGapVerySmall":function(d){return "ඉතා කුඩා පරතරයක් පිහිටුවන්න"},
"setGapSmall":function(d){return "කුඩා පරතරයක් පිහිටුවන්න"},
"setGapNormal":function(d){return "සාමාන්‍යය පරතරයක් පිහිටුවන්න"},
"setGapLarge":function(d){return "විශාල පරතරයක් පිහිටුවන්න"},
"setGapVeryLarge":function(d){return "ඉතා විශාල පරතරයක් පිහිටුවන්න"},
"setGapHeightTooltip":function(d){return "බාධක අතර සිරස් පරතරයක් පිහිටුවන්න"},
"setGravityRandom":function(d){return "අහුඹු ගුරුත්වාකර්ෂණ බලයක් එක් කරන්න"},
"setGravityVeryLow":function(d){return "අවම ගුරුත්වාකර්ෂණ බලය එක් කරන්න"},
"setGravityLow":function(d){return "පහළ ගුරුත්වාකර්ෂණ බලයක් එක් කරන්න"},
"setGravityNormal":function(d){return "සාමාන්‍යය ගුරුත්වාකර්ෂණ බලයක් එක් කරන්න"},
"setGravityHigh":function(d){return "ඉහළ ගුරුත්වාකර්ෂණ බලයක් එක් කරන්න"},
"setGravityVeryHigh":function(d){return "උපරිම ගුරුත්වාකර්ෂණ බලයක් එක් කරන්න"},
"setGravityTooltip":function(d){return "Level එක සඳහා ගුරුත්වාකර්ෂණ බලය එක් කරන්න"},
"setGround":function(d){return "භූමිය පිහිටුවන්න"},
"setGroundRandom":function(d){return "අහඹු භූමියක් පිහිටුවන්න"},
"setGroundFlappy":function(d){return "පිට්ටනියක් සහිත භූමියක් පිහිටුවන්න"},
"setGroundSciFi":function(d){return "විද්‍යාත්මක වටපිටාවක් සහිත භූමියක් පිහිටුවන්න"},
"setGroundUnderwater":function(d){return "ජලයතුල පිහිටි භූමියක් පිහිටුවන්න"},
"setGroundCave":function(d){return "ගුහාවක් වැනි භූමියක් පිහිටුවන්න"},
"setGroundSanta":function(d){return "santa සහිත භූමියක් පිහිටුවන්න"},
"setGroundLava":function(d){return "ලෝ දිය සහිත භූමියක් පිහිටුවන්න"},
"setGroundTooltip":function(d){return "භූමිය සඳහා පින්තූරයක් එක් කරන්න"},
"setObstacle":function(d){return "බාධක නිර්මාණය කරන්න"},
"setObstacleRandom":function(d){return "අහඹු ලෙස බාධක නිර්මාණය කරන්න"},
"setObstacleFlappy":function(d){return "pipe ආකාර බාධක නිර්මාණය කරන්න"},
"setObstacleSciFi":function(d){return "විද්‍යාත්මක ආකාර බාධක නිර්මාණය කරන්න"},
"setObstacleUnderwater":function(d){return "ශාක ආකාර බාධක නිර්මාණය කරන්න"},
"setObstacleCave":function(d){return "ගුහා ආකාර බාධක නිර්මාණය කරන්න"},
"setObstacleSanta":function(d){return "දුම් කවුළු ආකාර බාධක නිර්මාණය කරන්න"},
"setObstacleLaser":function(d){return "ලේසර් කිරණ ආකාර බාධක නිර්මාණය කරන්න"},
"setObstacleTooltip":function(d){return "බාධක සඳහා පින්තූරයක් එක් කරන්න"},
"setPlayer":function(d){return "ක්‍රීඩකයා නිර්මාණය කරන්න"},
"setPlayerRandom":function(d){return "අහඹු ලෙස ක්‍රීඩකයා නිර්මාණය කරන්න"},
"setPlayerFlappy":function(d){return "කහ පැහැති කුරුල්ලෙක් ලෙස ක්‍රීඩකයා නිර්මාණය කරන්න"},
"setPlayerRedBird":function(d){return "රතු පැහැති කුරුල්ලෙක් ලෙස ක්‍රීඩකයා නිර්මාණය කරන්න"},
"setPlayerSciFi":function(d){return "අභ්‍යාවකාශ යානාවක් ලෙස ක්‍රීඩකයා නිර්මාණය කරන්න"},
"setPlayerUnderwater":function(d){return "මාලුවෙකු ලෙස ක්‍රීඩකයා නිර්මාණය කරන්න"},
"setPlayerCave":function(d){return "වවුලෙක් ලෙස ක්‍රීඩකයා නිර්මාණය කරන්න"},
"setPlayerSanta":function(d){return "santa ලෙස ක්‍රීඩකයා නිර්මාණය කරන්න"},
"setPlayerShark":function(d){return "මෝරෙක් ලෙස ක්‍රීඩකයා නිර්මාණය කරන්න"},
"setPlayerEaster":function(d){return "හා පැටියෙකු ලෙස ක්‍රීඩකයා නිර්මාණය කරන්න"},
"setPlayerBatman":function(d){return "batman ල‍ෙස ක්‍රීඩකයා නිර්මාණය කරන්න"},
"setPlayerSubmarine":function(d){return "සබ්මැරීනයක් ල‍ෙස ක්‍රීඩකයා නිර්මාණය කරන්න"},
"setPlayerUnicorn":function(d){return "කඟවේනෙකු ල‍ෙස ක්‍රීඩකයා නිර්මාණය කරන්න"},
"setPlayerFairy":function(d){return "සුරංගනාවියක ල‍ෙස ක්‍රීඩකයා නිර්මාණය කරන්න"},
"setPlayerSuperman":function(d){return "Superman ල‍ෙස ක්‍රීඩකයා නිර්මාණය කරන්න"},
"setPlayerTurkey":function(d){return "කළුකුමා ල‍ෙස ක්‍රීඩකයා නිර්මාණය කරන්න"},
"setPlayerTooltip":function(d){return "ක්‍රීඩකයා ලෙස පින්තූරයක් එක් කරන්න"},
"setScore":function(d){return "ලකුණු පෙන්වන්න"},
"setScoreTooltip":function(d){return "ක්‍රීඩකයාගේ ලකුණු පෙන්වන්න"},
"setSpeed":function(d){return "වේගය එක් කරන්න"},
"setSpeedTooltip":function(d){return "ලෙවලය සඳහා වේගයක් එක් කරන්න"},
"shareFlappyTwitter":function(d){return "මා විසින් නිර්මාණය කරන ලද Flappy game ක්‍රීඩාව ඔබත් උත්සහ කර බලන්න. @codeorg හි සහය සහිතව මා විසින්ම මෙහි කේතයන් ලියා ඇත"},
"shareGame":function(d){return "ඔබෙගේ ක්‍රීඩාව මිතුරන් අතරේ හුවමාරු කරන්න:"},
"soundRandom":function(d){return "අහඹු"},
"soundBounce":function(d){return "bounce"},
"soundCrunch":function(d){return "crunch"},
"soundDie":function(d){return "sad"},
"soundHit":function(d){return "smash"},
"soundPoint":function(d){return "point"},
"soundSwoosh":function(d){return "swoosh"},
"soundWing":function(d){return "wing"},
"soundJet":function(d){return "jet"},
"soundCrash":function(d){return "crash"},
"soundJingle":function(d){return "jingle"},
"soundSplash":function(d){return "splash"},
"soundLaser":function(d){return "laser"},
"speedRandom":function(d){return "අහඹු වේගයක් එක් කරන්න"},
"speedVerySlow":function(d){return "ඉතා සුළු වේගයක් එක් කරන්න"},
"speedSlow":function(d){return "සුළු වේගයක් එක් කරන්න"},
"speedNormal":function(d){return "සාමාන්‍යය වේගයක් එක් කරන්න"},
"speedFast":function(d){return "වැඩි වේගයක් එක් කරන්න"},
"speedVeryFast":function(d){return "ඉතා වැඩි වේගයක් එක් කරන්න"},
"whenClick":function(d){return "Click කල විට"},
"whenClickTooltip":function(d){return "Click කිරීමක් සිදු වූ වහාම පහත ක්‍රියාවන් ක්‍රියාත්මක කරන්න."},
"whenCollideGround":function(d){return "භූමියේ ගැටුනු විගසම"},
"whenCollideGroundTooltip":function(d){return "Flappy බාධාවක ගැටුනු විගසම පහත ක්‍රියාවන් ක්‍රියාත්මක කරන්න."},
"whenCollideObstacle":function(d){return "බාධාවක ගැටුනු විගසම"},
"whenCollideObstacleTooltip":function(d){return "Flappy බාධාවක ගැටුනු විගසම පහත ක්‍රියාවන් ක්‍රියාත්මක කරන්න."},
"whenEnterObstacle":function(d){return "බාධාවක් පසු කරන විට"},
"whenEnterObstacleTooltip":function(d){return "Flappy බාධාවකට ඇතුලු වූ විගසම පහත ක්‍රියාවන් ක්‍රියාත්මක කරන්න."},
"whenRunButtonClick":function(d){return "ක්‍රීඩව ආරම්භ වූ විගස"},
"whenRunButtonClickTooltip":function(d){return "ක්‍රීඩව ආරම්භ වූ විගසම පහත ක්‍රියාවන් ක්‍රියාත්මක කරන්න."},
"yes":function(d){return "ඔව්"}};