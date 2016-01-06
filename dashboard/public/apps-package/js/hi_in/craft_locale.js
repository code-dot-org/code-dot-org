var craft_locale = {lc:{"ar":function(n){
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
v:function(d,k){craft_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){craft_locale.c(d,k);return d[k] in p?p[d[k]]:(k=craft_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){craft_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).craft_locale = {
"blockDestroyBlock":function(d){return "ब्लॉक नष्ट करें"},
"blockIf":function(d){return "if"},
"blockIfLavaAhead":function(d){return "यदि लावा आगे हो"},
"blockMoveForward":function(d){return "आगे जाएं"},
"blockPlaceTorch":function(d){return "टॉर्च रखें"},
"blockPlaceXAheadAhead":function(d){return "आगे"},
"blockPlaceXAheadPlace":function(d){return "रखें"},
"blockPlaceXPlace":function(d){return "रखें"},
"blockPlantCrop":function(d){return "फसल रोपें"},
"blockShear":function(d){return "कतरन"},
"blockTillSoil":function(d){return "ज़मीन जोतें"},
"blockTurnLeft":function(d){return "turn left"},
"blockTurnRight":function(d){return "turn right"},
"blockTypeBedrock":function(d){return "आधार-चट्टान"},
"blockTypeBricks":function(d){return "ईंट"},
"blockTypeClay":function(d){return "चिकनी मिट्टी"},
"blockTypeClayHardened":function(d){return "कठोर मिट्टी"},
"blockTypeCobblestone":function(d){return "गोल पत्थर"},
"blockTypeDirt":function(d){return "गर्द"},
"blockTypeDirtCoarse":function(d){return "मोटी गर्द"},
"blockTypeEmpty":function(d){return "खाली"},
"blockTypeFarmlandWet":function(d){return "खेत"},
"blockTypeGlass":function(d){return "काँच"},
"blockTypeGrass":function(d){return "घास"},
"blockTypeGravel":function(d){return "कंकड"},
"blockTypeLava":function(d){return "लावा"},
"blockTypeLogAcacia":function(d){return "बबूल का लट्ठा"},
"blockTypeLogBirch":function(d){return "भोज वृक्ष का लट्ठा"},
"blockTypeLogJungle":function(d){return "जंगल लट्ठा"},
"blockTypeLogOak":function(d){return "शाहबलूत का लट्ठा"},
"blockTypeLogSpruce":function(d){return "फ़र वृक्ष का लट्ठा"},
"blockTypeOreCoal":function(d){return "कोयला अयस्क"},
"blockTypeOreDiamond":function(d){return "हीरा अयस्क"},
"blockTypeOreEmerald":function(d){return "पन्ना अयस्क"},
"blockTypeOreGold":function(d){return "सोने का अयस्क"},
"blockTypeOreIron":function(d){return "लौह अयस्क"},
"blockTypeOreLapis":function(d){return "लापिस अयस्क"},
"blockTypeOreRedstone":function(d){return "रेडस्टोन अयस्क"},
"blockTypePlanksAcacia":function(d){return "बबूल के तख्ते"},
"blockTypePlanksBirch":function(d){return "भोज के तख्ते"},
"blockTypePlanksJungle":function(d){return "जंगल तख्ते"},
"blockTypePlanksOak":function(d){return "शाहबलूत के तख्ते"},
"blockTypePlanksSpruce":function(d){return "फ़र के तख्ते"},
"blockTypeRail":function(d){return "रेलिंग"},
"blockTypeSand":function(d){return "रेत"},
"blockTypeSandstone":function(d){return "बलुआ पत्थर"},
"blockTypeStone":function(d){return "पत्थर"},
"blockTypeTnt":function(d){return "टीएनटी"},
"blockTypeTree":function(d){return "पेड़"},
"blockTypeWater":function(d){return "पानी"},
"blockTypeWool":function(d){return "ऊन"},
"blockWhileXAheadAhead":function(d){return "आगे"},
"blockWhileXAheadDo":function(d){return "do"},
"blockWhileXAheadWhile":function(d){return "जबकि"},
"generatedCodeDescription":function(d){return "इस पहेली में ब्लॉक को खींचते और रखते हुए, आपने Javascript नामक कंप्यूटर भाषा में निर्देशों का सेट तैयार किया है।  यह कोड कंप्यूटर को बताता है कि स्क्रीन पर क्या प्रदर्शित किया जाए। Minecraft में आप जो भी देखते और करते हैं, वह भी इन जैसे कंप्यूटर कोड की लाइनों के साथ शुरू होता है।"},
"houseSelectChooseFloorPlan":function(d){return "अपने घर के फ़्लोर-प्लान का चयन करें।"},
"houseSelectEasy":function(d){return "आसान"},
"houseSelectHard":function(d){return "कठिन"},
"houseSelectLetsBuild":function(d){return "आइए एक घर का निर्माण करें।"},
"houseSelectMedium":function(d){return "मध्यम"},
"keepPlayingButton":function(d){return "खेलते रहें"},
"level10FailureMessage":function(d){return "पार करने के लिए लावा को ढकें, फिर दूसरी ओर दो लौह खंड को खोदें।"},
"level11FailureMessage":function(d){return "यदि आगे लावा है तो आगे गोल पत्थर रखना सुनिश्चित करें। यह आपको संसाधनों की इस पंक्ति का सुरक्षित खनन करने देगा।"},
"level12FailureMessage":function(d){return "3 रेडस्टोन ब्लॉक का खनन सुनिश्चित करें। इसमें अपने घर के निर्माण से आपने जो सीखा और लावा में गिरने से बचने के लिए \"if\" स्टेटमेंट के प्रयोग का संयोजन है।"},
"level13FailureMessage":function(d){return "आपके दरवाज़े से नक्शे के किनारे तक जाने वाले गर्द मार्ग पर \"rail\" रखें।"},
"level1FailureMessage":function(d){return "भेड़ तक चल कर जाने के लिए आपको कुछ कमांड इस्तेमाल करने की ज़रूरत होगी।"},
"level1TooFewBlocksMessage":function(d){return "भेड़ तक जाने के लिए अनेक कमांड के उपयोग की कोशिश करें।"},
"level2FailureMessage":function(d){return "पेड़ को काटने के लिए, उसके तने के पास जाएँ और \"destroy block\" कमांड का उपयोग करें।"},
"level2TooFewBlocksMessage":function(d){return "पेड़ काटने के लिए अनेक कमांड के उपयोग की कोशिश करें। उसके तने के पास जाएँ और \"destroy block\" कमांड का उपयोग करें।"},
"level3FailureMessage":function(d){return "दोनों भेड़ों से ऊन इकट्ठा करने के लिए, हरेक के पास जाएँ और \"shear\" कमांड का उपयोग करें। भेड़ तक पहुँचने के लिए मुड़े (turn) कमांड का उपयोग करना न भूलें।"},
"level3TooFewBlocksMessage":function(d){return "दोनों भेड़ों से ऊन इकट्ठा करने के लिए अनेक कमांड के उपयोग की कोशिश करें। प्रत्येक के पास जाएँ और \"shear\" कमांड का उपयोग करें।"},
"level4FailureMessage":function(d){return "आपको तीन तनों से प्रत्येक पर \"destroy block\" कमांड का उपयोग करना चाहिए।"},
"level5FailureMessage":function(d){return "दीवार बनाने के लिए अपने ब्लॉक गर्द की आउटलाइन पर रखें। गुलाबी \"repeat\" कमांड उसके अंदर मौजूद \"place block\" और \"move forward\" जैसे कमांड चलाएगा।"},
"level6FailureMessage":function(d){return "पहेली पूरा करने के लिए घर की गर्द आउटलाइन पर ब्लॉक रखें।"},
"level7FailureMessage":function(d){return "गहरी जोती गई भूमि के प्रत्येक भाग में फसल रखने के लिए \"plant\" कमांड का उपयोग करें।"},
"level8FailureMessage":function(d){return "यदि आप किसी बेल को छूते हैं तो वह विस्फोटित होगी। उनसे बच कर जाएँ और अपने घर में प्रवेश करें।"},
"level9FailureMessage":function(d){return "अपने रास्ते को प्रकाशित करने के लिए कम से कम 2 टॉर्च जलाना और कम से कम 2 कोयले खोदना न भूलें।"},
"minecraftBlock":function(d){return "ब्लॉक"},
"nextLevelMsg":function(d){return "पहेली "+craft_locale.v(d,"puzzleNumber")+" संपन्न। बधाई!"},
"playerSelectChooseCharacter":function(d){return "अपना किरदार चुनें।"},
"playerSelectChooseSelectButton":function(d){return "चयन करें"},
"playerSelectLetsGetStarted":function(d){return "आइए शुरूआत करते हैं।"},
"reinfFeedbackMsg":function(d){return "अपना गेम खेलने के लिए वापस जाने हेतु आप \"Keep Playing\" दबा सकते हैं।"},
"replayButton":function(d){return "रीप्ले"},
"selectChooseButton":function(d){return "चयन करें"},
"tooManyBlocksFail":function(d){return "पहेली "+craft_locale.v(d,"puzzleNumber")+" संपन्न। बधाई! उसे "+craft_locale.p(d,"numBlocks",0,"hi",{"one":"1 block","other":craft_locale.n(d,"numBlocks")+" blocks"})+" के साथ पूरा करना भी संभव है."}};