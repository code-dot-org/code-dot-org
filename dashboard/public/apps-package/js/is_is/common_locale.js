var common_locale = {lc:{"ar":function(n){
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
v:function(d,k){common_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){common_locale.c(d,k);return d[k] in p?p[d[k]]:(k=common_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){common_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).common_locale = {
"and":function(d){return "og"},
"backToPreviousLevel":function(d){return "Til baka í fyrri áfanga"},
"blocklyMessage":function(d){return "Blockly"},
"blocks":function(d){return "kubbar"},
"booleanFalse":function(d){return "ósatt"},
"booleanTrue":function(d){return "satt"},
"catActions":function(d){return "Aðgerðir"},
"catColour":function(d){return "Litir"},
"catLists":function(d){return "Listar"},
"catLogic":function(d){return "Rökvísi"},
"catLoops":function(d){return "Lykkjur"},
"catMath":function(d){return "Reikningur"},
"catProcedures":function(d){return "Föll"},
"catText":function(d){return "texti"},
"catVariables":function(d){return "Breytur"},
"clearPuzzle":function(d){return "Byrja aftur"},
"clearPuzzleConfirm":function(d){return "Þetta setur þrautina aftur í upphafsstöðu og eyðir öllum kubbum sem þú hefur bætt við eða breytt."},
"clearPuzzleConfirmHeader":function(d){return "Ertu viss um að þú viljir byrja aftur?"},
"codeMode":function(d){return "Kóði"},
"codeTooltip":function(d){return "Sjá samsvarandi JavaScript kóða."},
"completedWithoutRecommendedBlock":function(d){return "Til hamingju! Þú laukst þraut "+common_locale.v(d,"puzzleNumber")+". (En þú gætir notað öðruvísi kubb til að fá öflugri kóða.)"},
"continue":function(d){return "Halda áfram"},
"defaultTwitterText":function(d){return "Skoðaðu það sem ég bjó til"},
"designMode":function(d){return "Hönnun"},
"dialogCancel":function(d){return "Hætta við"},
"dialogOK":function(d){return "Í lagi"},
"directionEastLetter":function(d){return "A"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionWestLetter":function(d){return "V"},
"dropletBlock_addOperator_description":function(d){return "Leggja saman tvær tölur"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Virki samlagningar"},
"dropletBlock_andOperator_description":function(d){return "Skilar \"true\" aðeins ef báðar yrðingarnar eru sannar, en \"false\" annars"},
"dropletBlock_andOperator_signatureOverride":function(d){return "Boole virkinn AND"},
"dropletBlock_assign_x_description":function(d){return "Setur gildi í breytu sem er til. Til dæmis x = 0;"},
"dropletBlock_assign_x_param0":function(d){return "x"},
"dropletBlock_assign_x_param0_description":function(d){return "Heiti breytunnar sem verið er að skilgreina"},
"dropletBlock_assign_x_param1":function(d){return "gildi"},
"dropletBlock_assign_x_param1_description":function(d){return "Gildið sem er verið að setja í breytuna."},
"dropletBlock_assign_x_signatureOverride":function(d){return "Skilgreina breytu"},
"dropletBlock_callMyFunction_description":function(d){return "Kallar á nefnt fall sem hefur enga stika"},
"dropletBlock_callMyFunction_n_description":function(d){return "Kallar á nefnt fall sem tekur einn eða fleiri stika"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Kallar á fall sem tekur stika"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Kallar á fall"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "Tilgreinir breytu og tengir hana við fylki með gefnu upphafsgildunum"},
"dropletBlock_declareAssign_x_array_1_4_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_array_1_4_param0_description":function(d){return "Heitið sem verður notað í forritinu til að vísa í breytuna"},
"dropletBlock_declareAssign_x_array_1_4_param1":function(d){return "1,2,3,4"},
"dropletBlock_declareAssign_x_array_1_4_param1_description":function(d){return "Upphaflegu gildin í fylkinu"},
"dropletBlock_declareAssign_x_array_1_4_signatureOverride":function(d){return "Tilgreinir breytu sem tengist fylki"},
"dropletBlock_declareAssign_x_description":function(d){return "Tilkynnir breytu með heitinu, sem er tilgreint á eftir 'var', og setur í hana gildið hægra megin í yrðingunni"},
"dropletBlock_declareAssign_x_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_param0_description":function(d){return "Heitið sem verður notað í forritinu til að vísa í breytuna"},
"dropletBlock_declareAssign_x_param1":function(d){return "0"},
"dropletBlock_declareAssign_x_param1_description":function(d){return "Upphaflegt gildi breytunnar"},
"dropletBlock_declareAssign_x_prompt_description":function(d){return "Tilgreinir að kóðinn muni nú nota breytu og tengja hana við upphafsgildi sem notandi leggur til"},
"dropletBlock_declareAssign_x_prompt_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_prompt_param0_description":function(d){return "Heitið sem verður notað í forritinu til að vísa í breytuna"},
"dropletBlock_declareAssign_x_prompt_param1":function(d){return "\"Slá inn gildi\""},
"dropletBlock_declareAssign_x_prompt_param1_description":function(d){return "Strengurinn sem sést í svarglugganum þegar notandinn er beðinn um að færa inn gildi"},
"dropletBlock_declareAssign_x_prompt_signatureOverride":function(d){return "Biðja notandann um gildi og geyma það"},
"dropletBlock_declareAssign_x_promptNum_description":function(d){return "Segir að kóðinn muni nú nota breytu og gefa henni í byrjun tölugildi sem notandi leggur til"},
"dropletBlock_declareAssign_x_promptNum_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_promptNum_param0_description":function(d){return "Heitið sem verður notað í forritinu til að vísa í breytuna"},
"dropletBlock_declareAssign_x_promptNum_param1":function(d){return "\"Slá inn gildi\""},
"dropletBlock_declareAssign_x_promptNum_param1_description":function(d){return "Strengurinn sem sést í svarglugganum þegar notandinn er beðinn um að færa inn gildi"},
"dropletBlock_declareAssign_x_promptNum_signatureOverride":function(d){return "Biðja notandann um tölugildi og geyma það"},
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "Tilkynna breytu"},
"dropletBlock_declareNoAssign_x_description":function(d){return "Skilgreinir breytu með gefna heitinu á eftir 'var'"},
"dropletBlock_declareNoAssign_x_signatureOverride":function(d){return "Tilkynna breytu"},
"dropletBlock_divideOperator_description":function(d){return "Deiling tveggja talna"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "Virki deilingar"},
"dropletBlock_equalityOperator_description":function(d){return "Prófa hvort tvö gildi séu jöfn. Skilar \"true\" ef gildið vinstra megin í formúlunni er jafnt gildinu hægra megin, annars \"false\"."},
"dropletBlock_equalityOperator_param0":function(d){return "x"},
"dropletBlock_equalityOperator_param0_description":function(d){return "Fyrra gildið sem á að nota til samanburðar."},
"dropletBlock_equalityOperator_param1":function(d){return "y"},
"dropletBlock_equalityOperator_param1_description":function(d){return "Annað gildið sem á að nota til samanburðar."},
"dropletBlock_equalityOperator_signatureOverride":function(d){return "Virki samanburðar"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "Býr til lykkju sem samanstendur af upphafsskilyrði, háðu skilyrði, síauknu skilyrði og hóp skipana sem forritið keyrir í hvert skipti sem lykkjan hefst að nýju"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "for lykkja"},
"dropletBlock_functionParams_n_description":function(d){return "Safn yrðinga sem taka inn einn eða fleiri stika og vinna verk eða reikna gildi þegar kallað er á fallið"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "Skilgreina fall með stikum"},
"dropletBlock_functionParams_none_description":function(d){return "Safn yrðinga sem vinna verk eða reikna gildi þegar kallað er á fallið"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "Skilgreina fall"},
"dropletBlock_getTime_description":function(d){return "Ná í núgildandi tíma í millisekúndum"},
"dropletBlock_greaterThanOperator_description":function(d){return "Prófar hvort ein tala sé stærri en önnur. Skilar \"true\" ef gildið vinstra megin í yrðingunni er stærra en gildið hægra megin í yrðingunni"},
"dropletBlock_greaterThanOperator_param0":function(d){return "x"},
"dropletBlock_greaterThanOperator_param0_description":function(d){return "Fyrra gildið sem á að nota til samanburðar."},
"dropletBlock_greaterThanOperator_param1":function(d){return "y"},
"dropletBlock_greaterThanOperator_param1_description":function(d){return "Annað gildið sem á að nota til samanburðar."},
"dropletBlock_greaterThanOperator_signatureOverride":function(d){return "Stærri en virkinn"},
"dropletBlock_ifBlock_description":function(d){return "Keyrir bálk yrðinga ef tilgreinda skilyrðið er satt"},
"dropletBlock_ifBlock_signatureOverride":function(d){return "ef yrðing"},
"dropletBlock_ifElseBlock_description":function(d){return "Keyrir bálk yrðinga ef tilgreinda skilyrðið er satt; ef ekki þá er bálkur yrðinganna í \"annars\" hlutanum keyrður."},
"dropletBlock_ifElseBlock_signatureOverride":function(d){return "ef/annars yrðing"},
"dropletBlock_inequalityOperator_description":function(d){return "Prófar hvort tvö gildi eru ekki jöfn. Skilar \"true\" ef gildið vinstra megin í yrðingunni er ekki jafnt og gildið hægra megin í yrðingunni"},
"dropletBlock_inequalityOperator_param0":function(d){return "x"},
"dropletBlock_inequalityOperator_param0_description":function(d){return "Fyrra gildið sem á að nota til samanburðar."},
"dropletBlock_inequalityOperator_param1":function(d){return "y"},
"dropletBlock_inequalityOperator_param1_description":function(d){return "Annað gildið sem á að nota til samanburðar."},
"dropletBlock_inequalityOperator_signatureOverride":function(d){return "Virki ójafnaðar"},
"dropletBlock_lessThanOperator_description":function(d){return "Prófar hvort gildi er minna en annað gildi. Skilar \"true\" ef gildið vinstra megin í yrðingunni er minna en gildið hægra megin í yrðingunni"},
"dropletBlock_lessThanOperator_param0":function(d){return "x"},
"dropletBlock_lessThanOperator_param0_description":function(d){return "Fyrra gildið sem á að nota til samanburðar."},
"dropletBlock_lessThanOperator_param1":function(d){return "y"},
"dropletBlock_lessThanOperator_param1_description":function(d){return "Annað gildið sem á að nota til samanburðar."},
"dropletBlock_lessThanOperator_signatureOverride":function(d){return "Minna en virkinn"},
"dropletBlock_mathAbs_description":function(d){return "Tekur algildi x"},
"dropletBlock_mathAbs_param0":function(d){return "x"},
"dropletBlock_mathAbs_param0_description":function(d){return "Tala af handahófi."},
"dropletBlock_mathAbs_signatureOverride":function(d){return "Math.abs(x)"},
"dropletBlock_mathMax_description":function(d){return "Tekur hæsta gildið af einu eða fleiri gildum n1, n2, ..., nX"},
"dropletBlock_mathMax_param0":function(d){return "n1, n2,..., nX"},
"dropletBlock_mathMax_param0_description":function(d){return "Ein eða fleiri tölur til að bera saman."},
"dropletBlock_mathMax_signatureOverride":function(d){return "Math.max(n1, n2, ..., nX)"},
"dropletBlock_mathMin_description":function(d){return "Tekur minnsta gildið af einni eða fleiri tölum n1, n2, ..., nX"},
"dropletBlock_mathMin_param0":function(d){return "n1, n2,..., nX"},
"dropletBlock_mathMin_param0_description":function(d){return "Ein eða fleiri tölur til að bera saman."},
"dropletBlock_mathMin_signatureOverride":function(d){return "Math.min(n1, n2, ..., nX)"},
"dropletBlock_mathRandom_description":function(d){return "Skilar handahófstölu frá og með 0 til en ekki með 1"},
"dropletBlock_mathRandom_signatureOverride":function(d){return "Math.random()"},
"dropletBlock_mathRound_description":function(d){return "Námundar tölu að næstu heiltölu"},
"dropletBlock_mathRound_param0":function(d){return "x"},
"dropletBlock_mathRound_param0_description":function(d){return "Tala af handahófi."},
"dropletBlock_mathRound_signatureOverride":function(d){return "Math.round(x)"},
"dropletBlock_multiplyOperator_description":function(d){return "Margfalda tvær tölur"},
"dropletBlock_multiplyOperator_signatureOverride":function(d){return "Virki margföldunar"},
"dropletBlock_notOperator_description":function(d){return "Skilar \"false\" ef yrðingin sjálf gefur \"true\", en skilar annars \"true\""},
"dropletBlock_notOperator_signatureOverride":function(d){return "Boole virkinn NOT"},
"dropletBlock_orOperator_description":function(d){return "Skilar \"true\" þegar önnur hvort yrðingin er sönn en annars \"false\""},
"dropletBlock_orOperator_signatureOverride":function(d){return "Boole virkinn OR"},
"dropletBlock_randomNumber_min_max_description":function(d){return "Skilar tölu af handhófi á bilinu frá og með fyrri tölunni (lágmark) upp að og með seinni tölunni (hámark)"},
"dropletBlock_randomNumber_param0":function(d){return "min"},
"dropletBlock_randomNumber_param0_description":function(d){return "Lægsta talan sem skilað er"},
"dropletBlock_randomNumber_param1":function(d){return "max"},
"dropletBlock_randomNumber_param1_description":function(d){return "Hæsta talan sem skilað er"},
"dropletBlock_randomNumber_signatureOverride":function(d){return "randomNumber(lágmark, hámark)"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(lágmark, hámark)"},
"dropletBlock_return_description":function(d){return "Skila gildi úr falli"},
"dropletBlock_return_signatureOverride":function(d){return "skila"},
"dropletBlock_setAttribute_description":function(d){return "Setur tilgreinda gildið"},
"dropletBlock_subtractOperator_description":function(d){return "Frádráttur tveggja talna"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Virki frádráttar"},
"dropletBlock_whileBlock_description":function(d){return "Býr til lykkju sem samanstendur af yrðingu með skilyrði og bálki yrðinga sem eru keyrðar í hverri umferð lykkjunnar. Lykkjan er keyrð á meðan skilyrðið gefur gildið \"true\""},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while lykkja"},
"emptyBlockInFunction":function(d){return "Fallið "+common_locale.v(d,"name")+" er með óútfyllt inntak."},
"emptyBlockInVariable":function(d){return "Breytan "+common_locale.v(d,"name")+" er með óútfyllt inntak."},
"emptyBlocksErrorMsg":function(d){return "Kubbarnir \"endurtaka\" og \"ef\" verða að innihalda aðra kubba til að virka. Gættu þess að innri kubburinn smellpassi í ytri kubbinn."},
"emptyExampleBlockErrorMsg":function(d){return "Þú verður að hafa a.m.k. tvö dæmi í fallinu "+common_locale.v(d,"functionName")+". Gættu þess að hvert dæmi sýni kall og útkomu þess."},
"emptyFunctionBlocksErrorMsg":function(d){return "Fallkubburinn þarf að innhalda aðra kubba til að virka."},
"emptyFunctionalBlock":function(d){return "Það er kubbur með óútfyllt inntak."},
"emptyTopLevelBlock":function(d){return "Það eru engir kubbar til að keyra. Þú verður að tengja kubb við kubbinn "+common_locale.v(d,"topLevelBlockName")+"."},
"end":function(d){return "endir"},
"errorEmptyFunctionBlockModal":function(d){return "Það þurfa að vera kubbar innan í skilgreiningunni á fallinu. Smelltu á \"breyta\" og dragðu kubba inn í græna kubbinn."},
"errorIncompleteBlockInFunction":function(d){return "Smelltu á \"breyta\" til að ganga úr skugga um að það vanti ekki neina kubba í skilgreininguna á fallinu."},
"errorParamInputUnattached":function(d){return "Mundu að tengja kubb við hvert inntak fyrir stika sem er á kubbi fallsins á vinnusvæðinu."},
"errorQuestionMarksInNumberField":function(d){return "Prófaðu að skipta \"???\" út fyrir gildi."},
"errorRequiredParamsMissing":function(d){return "Búðu til stika fyrir fallið þitt með því að smella á \"breyta\" og bæta við stikunum sem þarf. Dragðu nýju stikakubbana inn í skilgreiningu þína fyrir fallið."},
"errorUnusedFunction":function(d){return "Þú bjóst til fall, en notaðir það aldrei á vinnusvæðinu! Smelltu á \"Föll\" í verkfærakassanum og gættu þess að nota fallið í forritinu þínu."},
"errorUnusedParam":function(d){return "Þú bættir við kubbi fyrir stika en notaðir hann ekki í skilgreiningunni. Gættu þess að nota stikann þinn með því að smella á \"breyta\" og setja stikakubbinn inn í græna kubbinn."},
"exampleErrorMessage":function(d){return "Fallið "+common_locale.v(d,"functionName")+" er með eitt eða fleiri dæmi sem þarf að laga. Gættu þess að þau passi við skilgreiningu fallsins og svari spurningunni."},
"examplesFailedOnClose":function(d){return "Eitt eða fleiri dæmi passa ekki við skilgreininguna þína. Athugaðu dæmin áður en þú lokar"},
"extraTopBlocks":function(d){return "Það eru ótengdir kubbar."},
"extraTopBlocksWhenRun":function(d){return "Það eru ótengdir kubbar. Var meiningin að tengja þá við \"þegar keyrt\" kubbinn?"},
"finalStage":function(d){return "Til hamingju! Þú hefur klárað síðasta áfangann."},
"finalStageTrophies":function(d){return "Til hamingju! Þú hefur klárað síðasta áfangann og unnið "+common_locale.p(d,"numTrophies",0,"is",{"one":"bikar","other":common_locale.n(d,"numTrophies")+" bikara"})+"."},
"finish":function(d){return "Ljúka"},
"generatedCodeInfo":function(d){return "Jafnvel bestu háskólar kenna forritun með kubbum (t.d. "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+"). En bak við tjöldin er hægt að sýna kubbana sem þú hefur sett saman sem JavaScript, sem er mest notaða forritunarmál í heimi:"},
"hashError":function(d){return "Því miður finnst ekkert vistað forrit '%1'."},
"help":function(d){return "Hjálp"},
"hideToolbox":function(d){return "(Fela)"},
"hintHeader":function(d){return "Vísbending:"},
"hintRequest":function(d){return "Sjá vísbendingu"},
"hintTitle":function(d){return "Vísbending:"},
"ignore":function(d){return "Hunsa"},
"infinity":function(d){return "Óendanleiki"},
"jump":function(d){return "stökkva"},
"keepPlaying":function(d){return "Spila áfram"},
"levelIncompleteError":function(d){return "Þú ert að nota allar nauðsynlegu tegundirnar af kubbum en ekki á réttan hátt."},
"listVariable":function(d){return "listi"},
"makeYourOwnFlappy":function(d){return "Búðu til þinn eigin(n) Flappy leik"},
"missingRecommendedBlocksErrorMsg":function(d){return "Ekki alveg. Prófaðu að nota kubb sem þú ert ekki að nota."},
"missingRequiredBlocksErrorMsg":function(d){return "Ekki alveg. Þú verður að nota kubb sem þú ert ekki að nota nú."},
"nestedForSameVariable":function(d){return "Þú ert að nota sömu breytuna innan í tveimur eða fleiri földuðum lykkjum. Notaðu ólík heiti fyrir breytur til að forðast óendanlegar lykkjur."},
"nextLevel":function(d){return "Til hamingju! Þú hefur leyst þraut "+common_locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Til hamingju! Þú hefur leyst þraut "+common_locale.v(d,"puzzleNumber")+" og unnið "+common_locale.p(d,"numTrophies",0,"is",{"one":"bikar","other":common_locale.n(d,"numTrophies")+" bikara"})+"."},
"nextPuzzle":function(d){return "Næsta þraut"},
"nextStage":function(d){return "Til hamingju! Þú kláraðir "+common_locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Til hamingju! Þú kláraðir "+common_locale.v(d,"stageName")+" og vannst "+common_locale.p(d,"numTrophies",0,"is",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+"."},
"numBlocksNeeded":function(d){return "Til hamingju! Þú kláraðir þraut "+common_locale.v(d,"puzzleNumber")+". (En þú hefðir getað notað bara  "+common_locale.p(d,"numBlocks",0,"is",{"one":"1 kubb","other":common_locale.n(d,"numBlocks")+" kubba"})+".)"},
"numLinesOfCodeWritten":function(d){return "Þú náðir að skrifa "+common_locale.p(d,"numLines",0,"is",{"one":"1 línu","other":common_locale.n(d,"numLines")+" línur"})+" af kóða!"},
"openWorkspace":function(d){return "Hvernig það virkar"},
"orientationLock":function(d){return "Slökktu á stefnulæsingu í stillingum tækis."},
"play":function(d){return "spila"},
"print":function(d){return "Prenta"},
"puzzleTitle":function(d){return "Þraut "+common_locale.v(d,"puzzle_number")+" af "+common_locale.v(d,"stage_total")},
"readonlyWorkspaceHeader":function(d){return "Aðeins skoða: "},
"repeat":function(d){return "endurtaka"},
"resetProgram":function(d){return "Endurstilla"},
"rotateText":function(d){return "Snúðu tækinu þínu."},
"runProgram":function(d){return "Keyra"},
"runTooltip":function(d){return "Keyra forritið sem samanstendur af kubbunum á vinnusvæðinu."},
"runtimeErrorMsg":function(d){return "Tókst ekki að keyra forritið þitt. Vinsamlegast fjarlægðu línu "+common_locale.v(d,"lineNumber")+" og reyndu aftur."},
"saveToGallery":function(d){return "Vista í safni"},
"savedToGallery":function(d){return "Vistað í safni!"},
"score":function(d){return "stig"},
"shareFailure":function(d){return "Því miður getum við ekki deilt þessu forriti."},
"shareWarningsAge":function(d){return "Vinsamlegast færðu inn aldur þinn hér fyrir neðan og smelltu á Í lagi til að halda áfram."},
"shareWarningsMoreInfo":function(d){return "Nánar"},
"shareWarningsStoreData":function(d){return "Þetta app gert með Kóðastúdíóinu geymir gögn sem allir með þennan deilda tengil gætu séð. Farðu því varlega ef einhver biður þig um persónulegar upplýsingar."},
"showBlocksHeader":function(d){return "Sýna kubba"},
"showCodeHeader":function(d){return "Sýna kóða"},
"showGeneratedCode":function(d){return "Sýna kóða"},
"showTextHeader":function(d){return "Sýna texta"},
"showToolbox":function(d){return "Sýna verkfærakassann"},
"showVersionsHeader":function(d){return "Útgáfur verkefnis"},
"signup":function(d){return "Skráning á inngangsnámskeiðið"},
"stringEquals":function(d){return "strengur=?"},
"submit":function(d){return "Senda inn"},
"submitYourProject":function(d){return "Senda inn verkefni þitt"},
"submitYourProjectConfirm":function(d){return "Þú getur ekki breytt verkefninu eftir innsendingu, senda það samt inn?"},
"unsubmit":function(d){return "Afturkalla innsendingu"},
"unsubmitYourProject":function(d){return "Draga verkefni þitt til baka"},
"unsubmitYourProjectConfirm":function(d){return "Að draga verkefni til baka endurstillir dagsetningu innsendingar. Viltu örugglega draga til baka?"},
"subtitle":function(d){return "sjónrænt forritunarumhverfi"},
"syntaxErrorMsg":function(d){return "Forritið þitt inniheldur ritvillu. Vinsamlegast fjarlægðu "+common_locale.v(d,"lineNumber")+" og reyndu aftur."},
"textVariable":function(d){return "texti"},
"toggleBlocksErrorMsg":function(d){return "Þú þarft að leiðrétta villu í forritinu þínu áður en hægt er að sýna það með kubbum."},
"tooFewBlocksMsg":function(d){return "Þú ert að nota alla réttu kubbana, en reyndu að nota fleiri svoleiðis kubba til að leysa þessa þraut."},
"tooManyBlocksMsg":function(d){return "Þessa þraut er hægt að leysa með <x id='START_SPAN'/><x id='END_SPAN'/> kubbum."},
"tooMuchWork":function(d){return "Þú lagðir á mig mjög mikla vinnu! Gætirðu reynt að nota færri endurtekningar?"},
"toolboxHeader":function(d){return "kubbar"},
"toolboxHeaderDroplet":function(d){return "Verkfærakassinn"},
"totalNumLinesOfCodeWritten":function(d){return "Samtals: "+common_locale.p(d,"numLines",0,"is",{"one":"1 lína","other":common_locale.n(d,"numLines")+" línur"})+" af kóða."},
"tryAgain":function(d){return "Reyna aftur"},
"tryBlocksBelowFeedback":function(d){return "Reyndu að nota einn af þessum kubbum:"},
"tryHOC":function(d){return "Prófa Klukkustund kóðunar"},
"unnamedFunction":function(d){return "Þú ert með breytu eða fall sem hefur ekkert heiti. Ekki gleyma að gefa öllu lýsandi heiti."},
"wantToLearn":function(d){return "Viltu læra að kóða?"},
"watchVideo":function(d){return "Horfa á videóið"},
"when":function(d){return "þegar"},
"whenRun":function(d){return "þegar keyrt"},
"workspaceHeaderShort":function(d){return "Vinnusvæði: "}};