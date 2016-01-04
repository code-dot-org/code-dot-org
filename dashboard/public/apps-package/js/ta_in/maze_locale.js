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
"atHoneycomb":function(d){return "தேன்கூட்டில்"},
"atFlower":function(d){return "மலரில்"},
"avoidCowAndRemove":function(d){return "பசுவை தவிர்த்து ஒன்றை நீக்கு"},
"continue":function(d){return "தொடர்ந்து"},
"dig":function(d){return "1 நீக்கு"},
"digTooltip":function(d){return "ஒர் அலகு அழுக்கை நீக்கு"},
"dirE":function(d){return "கிழக்கு"},
"dirN":function(d){return "வடக்கு"},
"dirS":function(d){return "தெற்கு"},
"dirW":function(d){return "மேற்கு"},
"doCode":function(d){return "செய்க"},
"elseCode":function(d){return "அல்லது"},
"fill":function(d){return "1 நிரப்பு"},
"fillN":function(d){return maze_locale.v(d,"shovelfuls")+" நிரப்பு"},
"fillStack":function(d){return maze_locale.v(d,"shovelfuls")+" தொடர் ஓட்டைகளை நிரப்பு"},
"fillSquare":function(d){return "சதுரத்தை நிரப்பு"},
"fillTooltip":function(d){return "ஓர் அலகு அழுக்கை வை"},
"finalLevel":function(d){return "வாழ்த்துக்கள்! நீங்கள் இறுதிப் புதிரை முடித்துவிட்டீர்கள்."},
"flowerEmptyError":function(d){return "நீங்கள் இருக்கும் மலர்த்தேன் தீர்ந்துவிட்டது."},
"get":function(d){return "பெறு"},
"heightParameter":function(d){return "உயரம்"},
"holePresent":function(d){return "ஒரு துளை உள்ளது"},
"honey":function(d){return "தேன் செய்க"},
"honeyAvailable":function(d){return "தேன்"},
"honeyTooltip":function(d){return "மகரந்தத்தேனில்லிருந்து தேன் செய்"},
"honeycombFullError":function(d){return "தேன்கூட்டில் இதற்கு மேலும் தேன் சேர்க்க இடமில்லை."},
"ifCode":function(d){return "இருந்தால்"},
"ifInRepeatError":function(d){return "உங்களுக்கு ஒரு \"மீள்-repeat\" தொகுதிக்கு உள்ளே \"If\" தொகுதி தேவை.\nதீர்ப்பதில் இடரானால் முந்தைய நிலையில் எப்படி வேலை செய்ததென பார்க்கவும் ."},
"ifPathAhead":function(d){return "முன்னால் பாதை என்றால்"},
"ifTooltip":function(d){return "குறிப்பிட்ட திசையில் ஒரு பாதை உள்ளது என்றால், சில செயல்களை செய்ய."},
"ifelseTooltip":function(d){return "குறிப்பிட்ட திசையில் ஒரு பாதை உள்ளது என்றால், நடவடிக்கைகள் முதல் தொகுதி செய்கிறது. இல்லையெனில், நடவடிக்கைகள் இரண்டாவது தொகுதி செய்கிறது."},
"ifFlowerTooltip":function(d){return "குறிப்பிட்ட திசையில் மலரோ அல்லது தேன்கூடு இருந்தால் IF, பிறகு / then சில செயல்களை செய்."},
"ifOnlyFlowerTooltip":function(d){return "குறிப்பிட்ட திசையில் ஒரு பாதை உள்ளது என்றால், சில செயல்களை செய்ய."},
"ifelseFlowerTooltip":function(d){return "குறிப்பிட்ட திசையில் மலரோ அல்லது தேன்கூடு இருந்தால் IF, பிறகு / then \nமுதல் தொகுதிசெயல்களை  செய்  அல்லது  இரண்டாம்  தொகுதிசெயல்களை செய்."},
"insufficientHoney":function(d){return "நீங்கள் சரியான தொகுதிகளை பயன்படுத்துகிறீர்கள், ஆனால் சரியான அளவு தேன் உருவாக்க வேண்டும்."},
"insufficientNectar":function(d){return "நீங்கள் சரியான தொகுதிகளை பயன்படுத்துகிறீர்கள், ஆனால் சரியான அளவு தேன் சேகரிக்க வேண்டும்."},
"make":function(d){return "உருவாக்கு"},
"moveBackward":function(d){return "பின்னோக்கி நகர்"},
"moveEastTooltip":function(d){return "என்னை ஒரு அடி கிழக்கே நகர்த்து."},
"moveForward":function(d){return "முன்னோக்கி நகர்த்த"},
"moveForwardTooltip":function(d){return "என்னை ஒரு அடி முன்னே நகர்த்து."},
"moveNorthTooltip":function(d){return "என்னை ஒரு அடி வடக்கே நகர்த்து."},
"moveSouthTooltip":function(d){return "என்னை ஒரு அடி தெற்கே நகர்த்து."},
"moveTooltip":function(d){return "என்னை ஒரு அடி முன்னோ / பின்னோ நகர்த்து"},
"moveWestTooltip":function(d){return "என்னை ஒரு அடி மேற்கே நகர்த்து."},
"nectar":function(d){return "மலர்த்தேனை எடு"},
"nectarRemaining":function(d){return "மலர்த்தேன்"},
"nectarTooltip":function(d){return "மலரில் இருந்து மலர்த்தேனை எடு"},
"nextLevel":function(d){return "வாழ்த்துக்கள்! நீங்கள் இந்த புதிர் தீர்த்துவிட்டீர்கள்."},
"no":function(d){return "இல்லை"},
"noPathAhead":function(d){return "பாதை தடுக்கப்பட்டுள்ளது"},
"noPathLeft":function(d){return "இடப்புறம் வழி இல்லை"},
"noPathRight":function(d){return "வலப்புறம் வழி இல்லை"},
"notAtFlowerError":function(d){return "உங்களால், மலரில் இருந்து மட்டுமே மலர்த்தேன் எடுக்க முடியும்."},
"notAtHoneycombError":function(d){return "உங்களால், தேன்கூட்டில் இருந்து மட்டுமே தேனை உருவாக்க முடியும்."},
"numBlocksNeeded":function(d){return "இந்த புதிரை  %1 தொகுதிகள் கொண்டு தீர்க்க முடியும்."},
"pathAhead":function(d){return "வழி முன்னே"},
"pathLeft":function(d){return "இடப்புறம் வழி இருந்தால்"},
"pathRight":function(d){return "வலப்புறம் வழி இருந்தால்"},
"pilePresent":function(d){return "அங்கே ஒரு குவியல் இருக்கிறது"},
"putdownTower":function(d){return "கோபுரத்தை கீழே வை"},
"removeAndAvoidTheCow":function(d){return "ஒன்றை நீக்கி, மாட்டை தவிர்"},
"removeN":function(d){return "நீக்கு "+maze_locale.v(d,"shovelfuls")},
"removePile":function(d){return "குவியலை நீக்கு"},
"removeStack":function(d){return maze_locale.v(d,"shovelfuls")+" குவியல் அடுக்கை  நீக்கு"},
"removeSquare":function(d){return "சதுரத்தை நீக்கு"},
"repeatCarefullyError":function(d){return "இதை தீர்ப்பதற்கு, இரண்டு நகர்வுகள், \"மீள் தொகுதியில்\" போட ஒரு திருப்பம்  பற்றி கவனமாக சிந்தியுங்கள். இறுதியில் ஒரு கூடுதல் திருப்பம் செய்தால்  தவறில்லை."},
"repeatUntil":function(d){return "மெய்படும் வரை மீண்டும் செய்"},
"repeatUntilBlocked":function(d){return "முன்னே வழி இருக்கும் வரை"},
"repeatUntilFinish":function(d){return "முடியும் வரை மீண்டும் செய்"},
"step":function(d){return "அடி"},
"totalHoney":function(d){return "மொத்தத்  தேன்"},
"totalNectar":function(d){return "மொத்த  மலர்த்தேன்"},
"turnLeft":function(d){return "இடதுபுறம் திரும்பவும்"},
"turnRight":function(d){return "வலதுபுறம் திரும்பவும்"},
"turnTooltip":function(d){return "வலப்புறமோ இடப்புறமோ என்னை 90 degrees திருப்பும்."},
"uncheckedCloudError":function(d){return "எல்லா மேகங்களில் பூக்களோ தேன்கூடுகளோ இருக்கிறதா என்று சரிபார்."},
"uncheckedPurpleError":function(d){return "எல்லா செவ்வூதா பூக்ககளில் மலர்த்தேன் இருக்கிறதா என்று பார்"},
"whileMsg":function(d){return "while"},
"whileTooltip":function(d){return "உள்ளடக்கப்பட்ட செயல்களை மீண்டும் செய், புள்ளியை அடையும் வரை."},
"word":function(d){return "சொல்லை கண்டறி"},
"yes":function(d){return "ஆம்"},
"youSpelled":function(d){return "நீங்கள் உச்சரித்து"}};