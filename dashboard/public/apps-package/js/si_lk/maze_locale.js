var maze_locale = {lc:{"ar":function(n){
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
v:function(d,k){maze_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){maze_locale.c(d,k);return d[k] in p?p[d[k]]:(k=maze_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){maze_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).maze_locale = {
"atHoneycomb":function(d){return "මී වදයේදී"},
"atFlower":function(d){return "මලේදී"},
"avoidCowAndRemove":function(d){return "ගවයාව මඟහැර 1ක් ඉවත් කරන්න"},
"continue":function(d){return "ඉදිරියට යන්න"},
"dig":function(d){return "1ක් ඉවත් කරන්න"},
"digTooltip":function(d){return "කුණු ඒකක 1 ඉවත් කරන්න"},
"dirE":function(d){return "නැ"},
"dirN":function(d){return "උ"},
"dirS":function(d){return "ද"},
"dirW":function(d){return "බ"},
"doCode":function(d){return "do"},
"elseCode":function(d){return "else"},
"fill":function(d){return "1ක් පුරවන්න"},
"fillN":function(d){return maze_locale.v(d,"shovelfuls")+" පුරවන්න"},
"fillStack":function(d){return "fill stack of "+maze_locale.v(d,"shovelfuls")+" holes"},
"fillSquare":function(d){return "චතුරශ්‍රය පුරවන්න"},
"fillTooltip":function(d){return "කුණු ඒකක 1ක් ස්ථාන ගත කරන්න"},
"finalLevel":function(d){return "සුභපැතුම්! ඔබ අවසාන ප්‍රහේලිකාව විසඳා ඇත."},
"flowerEmptyError":function(d){return "ඔබ සිටින මල තුල තව දුරටත් මල්පැණි නැත."},
"get":function(d){return "ලබාගන්න"},
"heightParameter":function(d){return "උස"},
"holePresent":function(d){return "සිදුරක් ඇත"},
"honey":function(d){return "මී පැණි සකසන්න"},
"honeyAvailable":function(d){return "මී පැණි"},
"honeyTooltip":function(d){return "මී පැණි වලින් පැණි සකසන්න"},
"honeycombFullError":function(d){return "මෙම මීවදයෙ මී පැනි එකතු කරන්න තව ඉඩ නැත."},
"ifCode":function(d){return "if"},
"ifInRepeatError":function(d){return "You need an \"if\" block inside a \"repeat\" block. If you're having trouble, try the previous level again to see how it worked."},
"ifPathAhead":function(d){return "if path ahead"},
"ifTooltip":function(d){return "If there is a path in the specified direction, then do some actions."},
"ifelseTooltip":function(d){return "If there is a path in the specified direction, then do the first block of actions. Otherwise, do the second block of actions."},
"ifFlowerTooltip":function(d){return "If there is a flower/honeycomb in the specified direction, then do some actions."},
"ifOnlyFlowerTooltip":function(d){return "If there is a flower in the specified direction, then do some actions."},
"ifelseFlowerTooltip":function(d){return "If there is a flower/honeycomb in the specified direction, then do the first block of actions. Otherwise, do the second block of actions."},
"insufficientHoney":function(d){return "You need to make the right amount of honey."},
"insufficientNectar":function(d){return "You need to collect the right amount of nectar."},
"make":function(d){return "සකසන්න"},
"moveBackward":function(d){return "පසුපසට චලනය වන්න"},
"moveEastTooltip":function(d){return "මාව එක පියවරකින් නැගෙනහිරට ගෙන යන්න."},
"moveForward":function(d){return "ඉදිරියට චලනය වන්න"},
"moveForwardTooltip":function(d){return "මාව එක පියවරකින් ඉදිරියට ගෙන යන්න."},
"moveNorthTooltip":function(d){return "මාව එක පියවරකින් උතුරට ගෙන යන්න."},
"moveSouthTooltip":function(d){return "මාව එක පියවරකින් දකුණට ගෙන යන්න."},
"moveTooltip":function(d){return "මාව එක පියවරකින් ඉදිරියට/පසුපසට ගෙන යන්න"},
"moveWestTooltip":function(d){return "මාව එක පියවරකින් බටහිරට ගෙන යන්න."},
"nectar":function(d){return "මල්පැණි ලබාගන්න"},
"nectarRemaining":function(d){return "මල් පැණි"},
"nectarTooltip":function(d){return "මලකින් මල් පැණි ලබාගන්න"},
"nextLevel":function(d){return "සුබ පැතුම්! ඔබට මෙම ප්‍රහේලිකාව සම්පූර්ණ කර ඇත."},
"no":function(d){return "නැහැ"},
"noPathAhead":function(d){return "මාර්ගය අවහිර කර ඇත"},
"noPathLeft":function(d){return "වමට මාර්ගයක් නොමැත"},
"noPathRight":function(d){return "දකුණට මාර්ගයක් නොමැත"},
"notAtFlowerError":function(d){return "You can only get nectar from a flower."},
"notAtHoneycombError":function(d){return "You can only make honey at a honeycomb."},
"numBlocksNeeded":function(d){return "This puzzle can be solved with %1 blocks."},
"pathAhead":function(d){return "මාර්ගය ඉදිරියෙන්"},
"pathLeft":function(d){return "if path to the left"},
"pathRight":function(d){return "if path to the right"},
"pilePresent":function(d){return "කුළුණක් තියෙනවා"},
"putdownTower":function(d){return "කුළුණ බිඳ දමන්න"},
"removeAndAvoidTheCow":function(d){return "1 ක් ඉවත් කර ගවයාව මග හරින්න"},
"removeN":function(d){return maze_locale.v(d,"shovelfuls")+" ඉවත් කරන්න"},
"removePile":function(d){return "ගොඩක් ඉවත් කරන්න"},
"removeStack":function(d){return "remove stack of "+maze_locale.v(d,"shovelfuls")+" piles"},
"removeSquare":function(d){return "චතුරශ්‍රය ඉවත් කරන්න"},
"repeatCarefullyError":function(d){return "To solve this, think carefully about the pattern of two moves and one turn to put in the \"repeat\" block.  It's okay to have an extra turn at the end."},
"repeatUntil":function(d){return "repeat until"},
"repeatUntilBlocked":function(d){return "while path ahead"},
"repeatUntilFinish":function(d){return "repeat until finish"},
"step":function(d){return "පියවර"},
"totalHoney":function(d){return "සම්පූර්ණ මී පැණි ප්‍රමාණය"},
"totalNectar":function(d){return "සම්පූර්ණ මල් පැණි ප්‍රමාණය"},
"turnLeft":function(d){return "වමට හැරෙන්න"},
"turnRight":function(d){return "දකුණට හැරෙන්න"},
"turnTooltip":function(d){return "මාව වමට හෝ දකුණට අංශක 90 කින් හරවන්න."},
"uncheckedCloudError":function(d){return "මල් හෝ මී වද ඇත්දැයි සියලුම වලාකුළු පරීක්ෂා කිරීමට වග බලා ගන්න."},
"uncheckedPurpleError":function(d){return "මල්පැණි ඇත්දැයි සියලුම දම් පාට මල් පරීක්ෂා කිරීමට වග බලා ගන්න"},
"whileMsg":function(d){return "එතෙක්"},
"whileTooltip":function(d){return "Repeat the enclosed actions until finish point is reached."},
"word":function(d){return "වචනය සොයන්න"},
"yes":function(d){return "ඔව්"},
"youSpelled":function(d){return "You spelled"}};