var locale = {lc:{"ar":function(n){
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
v:function(d,k){locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){locale.c(d,k);return d[k] in p?p[d[k]]:(k=locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).locale = {
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
"continue":function(d){return "Halda áfram"},
"defaultTwitterText":function(d){return "Skoðaðu það sem ég bjó til"},
"designMode":function(d){return "Hönnun"},
"designModeHeader":function(d){return "Hönnun"},
"dialogCancel":function(d){return "Hætta við"},
"dialogOK":function(d){return "Í lagi"},
"directionEastLetter":function(d){return "A"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionWestLetter":function(d){return "V"},
"dropletBlock_addOperator_description":function(d){return "Leggja saman tvær tölur"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Samlagning"},
"dropletBlock_andOperator_description":function(d){return "Skilar \"true\" aðeins ef báðar yrðingarnar eru sannar, en \"false\" annars"},
"dropletBlock_andOperator_signatureOverride":function(d){return "boole virkinn AND"},
"dropletBlock_arcLeft_description":function(d){return "Færir skjaldbökuna áfram og til vinstri í ávölum boga"},
"dropletBlock_arcLeft_param0":function(d){return "horn"},
"dropletBlock_arcLeft_param0_description":function(d){return "The angle along the circle to move."},
"dropletBlock_arcLeft_param1":function(d){return "radius"},
"dropletBlock_arcLeft_param1_description":function(d){return "The radius of the circle that is placed left of the turtle. Must be >= 0."},
"dropletBlock_arcRight_description":function(d){return "Færir skjaldbökuna áfram og til hægri í ávölum boga"},
"dropletBlock_arcRight_param0":function(d){return "horn"},
"dropletBlock_arcRight_param0_description":function(d){return "The angle along the circle to move."},
"dropletBlock_arcRight_param1":function(d){return "radius"},
"dropletBlock_arcRight_param1_description":function(d){return "The radius of the circle that is placed right of the turtle. Must be >= 0."},
"dropletBlock_assign_x_description":function(d){return "Setur gildi í breytu sem er til. Til dæmis x = 0;"},
"dropletBlock_assign_x_param0":function(d){return "x"},
"dropletBlock_assign_x_param0_description":function(d){return "The variable name being assigned to"},
"dropletBlock_assign_x_param1":function(d){return "value"},
"dropletBlock_assign_x_param1_description":function(d){return "The value the variable is being assigned to."},
"dropletBlock_assign_x_signatureOverride":function(d){return "Skilgreina breytu"},
"dropletBlock_button_description":function(d){return "Býr til hnapp sem þú getur smellt á. Hnappurinn sýnir tilgreinda textann og það er hægt að vísa á hann með tilgreinda kenninu"},
"dropletBlock_button_param0":function(d){return "buttonId"},
"dropletBlock_button_param0_description":function(d){return "A unique identifier for the button. The id is used for referencing the created button. For example, to assign event handlers."},
"dropletBlock_button_param1":function(d){return "texti"},
"dropletBlock_button_param1_description":function(d){return "The text displayed within the button."},
"dropletBlock_callMyFunction_description":function(d){return "Kallar á nefnt fall sem hefur enga stika"},
"dropletBlock_callMyFunction_n_description":function(d){return "Kallar á nefnt fall sem tekur einn eða fleiri stika"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Kallar á fall sem tekur stika"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Kallar á fall"},
"dropletBlock_changeScore_description":function(d){return "Hækka eða lækka skorið um eitt stig."},
"dropletBlock_checkbox_description":function(d){return "Búa til gátreit og gefa honum kenni sem einingu"},
"dropletBlock_checkbox_param0":function(d){return "checkboxId"},
"dropletBlock_checkbox_param1":function(d){return "valinn"},
"dropletBlock_circle_description":function(d){return "Teikna hring á virka myndflötinn með tilgreindum geisla og hnitum fyrir miðju (x, y)"},
"dropletBlock_circle_param0":function(d){return "centerX"},
"dropletBlock_circle_param0_description":function(d){return "The x position in pixels of the center of the circle."},
"dropletBlock_circle_param1":function(d){return "centerY"},
"dropletBlock_circle_param1_description":function(d){return "The y position in pixels of the center of the circle."},
"dropletBlock_circle_param2":function(d){return "radius"},
"dropletBlock_circle_param2_description":function(d){return "The radius of the circle, in pixels."},
"dropletBlock_clearCanvas_description":function(d){return "Hreinsa öll gögn af virka myndfletinum"},
"dropletBlock_clearInterval_description":function(d){return "Núllstilla tímamæli með því að setja í hann gildið sem setInterval() skilaði"},
"dropletBlock_clearInterval_param0":function(d){return "bil"},
"dropletBlock_clearInterval_param0_description":function(d){return "The value returned by the setInterval function to clear."},
"dropletBlock_clearTimeout_description":function(d){return "Núllstilla tímamæli með því að setja í hann gildið sem setTimeout() skilaði"},
"dropletBlock_clearTimeout_param0":function(d){return "hlé"},
"dropletBlock_clearTimeout_param0_description":function(d){return "The value returned by the setTimeout function to cancel."},
"dropletBlock_console.log_description":function(d){return "Birtir strenginn eða breytuna á skjá stjórnborðsins"},
"dropletBlock_console.log_param0":function(d){return "skilaboð"},
"dropletBlock_console.log_param0_description":function(d){return "The message string to display in the console."},
"dropletBlock_container_description":function(d){return "Búa til div tag með hinu tilgreinda kenni (id) og ef vill setja í það innri HTML kóða (inner HTML)"},
"dropletBlock_createCanvas_description":function(d){return "Búa til myndflöt (canvas) með hinu tilgreinda kenni (id) og  ef vill stilla breidd og hæð"},
"dropletBlock_createCanvas_param0":function(d){return "canvasId"},
"dropletBlock_createCanvas_param0_description":function(d){return "The id of the new canvas element."},
"dropletBlock_createCanvas_param1":function(d){return "width"},
"dropletBlock_createCanvas_param1_description":function(d){return "The horizontal width in pixels of the rectangle."},
"dropletBlock_createCanvas_param2":function(d){return "hæð"},
"dropletBlock_createCanvas_param2_description":function(d){return "The vertical height in pixels of the rectangle."},
"dropletBlock_createRecord_description":function(d){return "Notar töfluvistun App-smiðjunnar og býr til færslu með einkvæmu kenni í tiltekinni töflu og kallar á fallið callbackFunction að því loknu."},
"dropletBlock_createRecord_param0":function(d){return "table"},
"dropletBlock_createRecord_param0_description":function(d){return "The name of the table the record should be added to. `tableName` gets created if it doesn't exist."},
"dropletBlock_createRecord_param1":function(d){return "færsla"},
"dropletBlock_createRecord_param2":function(d){return "fall"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "Tilgreinir breytu og tengir hana við fylki með gefnu upphafsgildunum"},
"dropletBlock_declareAssign_x_array_1_4_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_array_1_4_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_array_1_4_param1":function(d){return "1,2,3,4"},
"dropletBlock_declareAssign_x_array_1_4_param1_description":function(d){return "The initial values to the array"},
"dropletBlock_declareAssign_x_array_1_4_signatureOverride":function(d){return "Tilgreinir breytu sem tengist fylki"},
"dropletBlock_declareAssign_x_description":function(d){return "Tilkynnir breytu með heitinu, sem er tilgreint á eftir 'var', og setur í hana gildið hægra megin í yrðingunni"},
"dropletBlock_declareAssign_x_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_param1":function(d){return "0"},
"dropletBlock_declareAssign_x_param1_description":function(d){return "The initial value of the variable"},
"dropletBlock_declareAssign_x_prompt_description":function(d){return "Tilgreinir að kóðinn muni nú nota breytu og tengja hana við upphafsgildi sem notandi leggur til"},
"dropletBlock_declareAssign_x_prompt_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_prompt_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_prompt_param1":function(d){return "\"Enter value\""},
"dropletBlock_declareAssign_x_prompt_param1_description":function(d){return "The string the user will see in the pop up when asked to enter a value"},
"dropletBlock_declareAssign_x_prompt_signatureOverride":function(d){return "Biðja notandann um gildi og geyma það"},
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "Tilkynna breytu"},
"dropletBlock_deleteElement_description":function(d){return "Eyða einingunni með hinu tilgreinda kenni (id)"},
"dropletBlock_deleteElement_param0":function(d){return "kenni"},
"dropletBlock_deleteElement_param0_description":function(d){return "The id of the element to delete."},
"dropletBlock_deleteRecord_description":function(d){return "Notar töfluvistun App-smiðjunnar og eyðir tilgreindu færslunni í töflunni tableName. Færsla er hlutur sem verður að vera auðkenndur einkæmt með id sviði sínu. Þegar þessu er lokið, er kallað á fallið callbackFunction."},
"dropletBlock_deleteRecord_param0":function(d){return "table"},
"dropletBlock_deleteRecord_param0_description":function(d){return "The name of the table from which the records should be searched and read."},
"dropletBlock_deleteRecord_param1":function(d){return "færsla"},
"dropletBlock_deleteRecord_param2":function(d){return "fall"},
"dropletBlock_deleteRecord_param2_description":function(d){return "A function that is asynchronously called when the call to deleteRecord() is finished."},
"dropletBlock_divideOperator_description":function(d){return "Deiling tveggja talna"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "Deiling"},
"dropletBlock_dot_description":function(d){return "Teikna doppu með tilgreindum geisla á stað skjaldbökunnar"},
"dropletBlock_dot_param0":function(d){return "radius"},
"dropletBlock_dot_param0_description":function(d){return "The radius of the dot to draw"},
"dropletBlock_drawImage_description":function(d){return "Teiknar tilgreindu myndina eða myndflatareininguna á virka myndflötinn á tilgreindum stað og gefur kost á að stilla breidd og hæð einingarinnar"},
"dropletBlock_drawImage_param0":function(d){return "kenni"},
"dropletBlock_drawImage_param0_description":function(d){return "The x position in pixels of the upper left corner of the image to draw."},
"dropletBlock_drawImage_param1":function(d){return "x"},
"dropletBlock_drawImage_param1_description":function(d){return "The x position in pixels of the upper left corner of the image to draw."},
"dropletBlock_drawImage_param2":function(d){return "y"},
"dropletBlock_drawImage_param2_description":function(d){return "The y position in pixels of the upper left corner of the image to draw."},
"dropletBlock_drawImage_param3":function(d){return "width"},
"dropletBlock_drawImage_param4":function(d){return "hæð"},
"dropletBlock_dropdown_description":function(d){return "Búa til fellilista, gefa honum kenni sem einingu og fylla hann með röð atriða"},
"dropletBlock_dropdown_signatureOverride":function(d){return "dropdown(dropdownID, option1, option2, ..., optionX)"},
"dropletBlock_equalityOperator_description":function(d){return "Prófa hvort tvö gildi séu jöfn. Skilar \"true\" ef gildið vinstra megin í formúlunni er jafnt gildinu hægra megin, annars \"false\"."},
"dropletBlock_equalityOperator_param0":function(d){return "x"},
"dropletBlock_equalityOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_equalityOperator_param1":function(d){return "y"},
"dropletBlock_equalityOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_equalityOperator_signatureOverride":function(d){return "Samanburður"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "Býr til lykkju sem samanstendur af upphafsskilyrði, háðu skilyrði, síauknu skilyrði og hóp skipana sem forritið keyrir í hvert skipti sem lykkjan hefst að nýju"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "for lykkja"},
"dropletBlock_functionParams_n_description":function(d){return "Safn yrðinga sem taka inn einn eða fleiri stika og vinna verk eða reikna gildi þegar kallað er á fallið"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "Skilgreina fall með stikum"},
"dropletBlock_functionParams_none_description":function(d){return "Safn yrðinga sem vinna verk eða reikna gildi þegar kallað er á fallið"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "Skilgreina fall"},
"dropletBlock_getAlpha_description":function(d){return "Skilar magni \"alpha\" (ógagnsæis) (á bilinu 0 til 255) í lit díls sem er á hinum tiltekna x og y stað í gefnu myndgögnunum"},
"dropletBlock_getAlpha_param0":function(d){return "imageData"},
"dropletBlock_getAlpha_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_getAlpha_param1":function(d){return "x"},
"dropletBlock_getAlpha_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_getAlpha_param2":function(d){return "y"},
"dropletBlock_getAlpha_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_getAttribute_description":function(d){return "Nær í tilgreindu eigindina"},
"dropletBlock_getBlue_description":function(d){return "Skilar styrkleika bláa litarins (á bilinu 0 til 255) í lit díls sem er á hinum tiltekna x og y stað í gefnu myndgögnunum"},
"dropletBlock_getBlue_param0":function(d){return "imageData"},
"dropletBlock_getBlue_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_getBlue_param1":function(d){return "x"},
"dropletBlock_getBlue_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_getBlue_param2":function(d){return "y"},
"dropletBlock_getBlue_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_getChecked_description":function(d){return "Nær í stöðu gátreits eða valhrings"},
"dropletBlock_getChecked_param0":function(d){return "kenni"},
"dropletBlock_getDirection_description":function(d){return "Skilar stefnunni sem skjaldbakann hefur. 0 gráður er beint upp"},
"dropletBlock_getGreen_description":function(d){return "Skilar styrkleika græna litarins (á bilinu 0 til 255) í lit díls sem er á hinum tiltekna x og y stað í gefnu myndgögnunum"},
"dropletBlock_getGreen_param0":function(d){return "imageData"},
"dropletBlock_getGreen_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_getGreen_param1":function(d){return "x"},
"dropletBlock_getGreen_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_getGreen_param2":function(d){return "y"},
"dropletBlock_getGreen_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_getImageData_description":function(d){return "Skilar hlut sem táknar myndgögnin sem eru tekin úr myndfletinum á svæðinu með hnit frá startX, startY til endX, endY"},
"dropletBlock_getImageData_param0":function(d){return "startX"},
"dropletBlock_getImageData_param0_description":function(d){return "The x position in pixels starting from the upper left corner of image to start the capture."},
"dropletBlock_getImageData_param1":function(d){return "startY"},
"dropletBlock_getImageData_param1_description":function(d){return "The y position in pixels starting from the upper left corner of image to start the capture."},
"dropletBlock_getImageData_param2":function(d){return "endX"},
"dropletBlock_getImageData_param2_description":function(d){return "The x position in pixels starting from the upper left corner of image to end the capture."},
"dropletBlock_getImageData_param3":function(d){return "endY"},
"dropletBlock_getImageData_param3_description":function(d){return "The y position in pixels starting from the upper left corner of image to end the capture."},
"dropletBlock_getImageURL_description":function(d){return "Sækja vefslóð (URL) fyrir gefið kenni myndeiningar"},
"dropletBlock_getImageURL_param0":function(d){return "imageID"},
"dropletBlock_getImageURL_param0_description":function(d){return "The id of the image element."},
"dropletBlock_getKeyValue_description":function(d){return "Reads the value associated with the key from the remote data store."},
"dropletBlock_getKeyValue_param0":function(d){return "key"},
"dropletBlock_getKeyValue_param0_description":function(d){return "The name of the key to be retrieved."},
"dropletBlock_getKeyValue_param1":function(d){return "fall"},
"dropletBlock_getRed_description":function(d){return "Skilar styrkleika rauða litarins (á bilinu 0 til 255) í lit díls sem er á hinum tiltekna x og y stað í gefnu myndgögnunum"},
"dropletBlock_getRed_param0":function(d){return "imageData"},
"dropletBlock_getRed_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_getRed_param1":function(d){return "x"},
"dropletBlock_getRed_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_getRed_param2":function(d){return "y"},
"dropletBlock_getRed_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_getText_description":function(d){return "Nær í textann úr tilgreindri einingu"},
"dropletBlock_getText_param0":function(d){return "kenni"},
"dropletBlock_getTime_description":function(d){return "Ná í núgildandi tíma í millisekúndum"},
"dropletBlock_getUserId_description":function(d){return "Gets a unique identifier for the current user of this app."},
"dropletBlock_getXPosition_description":function(d){return "Ná í x stöðu einingarinnar"},
"dropletBlock_getXPosition_param0":function(d){return "kenni"},
"dropletBlock_getX_description":function(d){return "Get the turtle's x position"},
"dropletBlock_getYPosition_description":function(d){return "Ná í y stöðu einingarinnar"},
"dropletBlock_getYPosition_param0":function(d){return "kenni"},
"dropletBlock_getY_description":function(d){return "Get the turtle's y position"},
"dropletBlock_greaterThanOperator_description":function(d){return "Bera saman tvær tölur"},
"dropletBlock_greaterThanOperator_param0":function(d){return "x"},
"dropletBlock_greaterThanOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_greaterThanOperator_param1":function(d){return "y"},
"dropletBlock_greaterThanOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_greaterThanOperator_signatureOverride":function(d){return "Greater than operator"},
"dropletBlock_hideElement_description":function(d){return "Fela eininguna með tilgreinda kennið"},
"dropletBlock_hideElement_param0":function(d){return "kenni"},
"dropletBlock_hideElement_param0_description":function(d){return "The id of the element to hide."},
"dropletBlock_hide_description":function(d){return "Hide the turtle image"},
"dropletBlock_ifBlock_description":function(d){return "Do something only if a condition is true"},
"dropletBlock_ifBlock_signatureOverride":function(d){return "if statement"},
"dropletBlock_ifElseBlock_description":function(d){return "Do something if a condition is true, otherwise do something else"},
"dropletBlock_ifElseBlock_signatureOverride":function(d){return "if/else statement"},
"dropletBlock_imageUploadButton_description":function(d){return "Búa til upphleðsluhnapp myndar og gefa honum kenni sem einingu"},
"dropletBlock_image_description":function(d){return "Búa til mynd og gefa henni kenni sem einingu"},
"dropletBlock_image_param0":function(d){return "kenni"},
"dropletBlock_image_param0_description":function(d){return "The id of the image element."},
"dropletBlock_image_param1":function(d){return "url"},
"dropletBlock_image_param1_description":function(d){return "The source URL of the image to be displayed on screen."},
"dropletBlock_inequalityOperator_description":function(d){return "Prófa ójöfnuð"},
"dropletBlock_inequalityOperator_param0":function(d){return "x"},
"dropletBlock_inequalityOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_inequalityOperator_param1":function(d){return "y"},
"dropletBlock_inequalityOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_inequalityOperator_signatureOverride":function(d){return "Inequality operator"},
"dropletBlock_innerHTML_description":function(d){return "Setja innra HTML í eininguna með hið tilgreinda kenni"},
"dropletBlock_lessThanOperator_description":function(d){return "Bera saman tvær tölur"},
"dropletBlock_lessThanOperator_param0":function(d){return "x"},
"dropletBlock_lessThanOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_lessThanOperator_param1":function(d){return "y"},
"dropletBlock_lessThanOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_lessThanOperator_signatureOverride":function(d){return "Less than operator"},
"dropletBlock_line_description":function(d){return "Draw a line on the active canvas from x1, y1 to x2, y2"},
"dropletBlock_line_param0":function(d){return "x1"},
"dropletBlock_line_param0_description":function(d){return "The x position in pixels of the beginning of the line."},
"dropletBlock_line_param1":function(d){return "y1"},
"dropletBlock_line_param1_description":function(d){return "The y position in pixels of the beginning of the line."},
"dropletBlock_line_param2":function(d){return "x2"},
"dropletBlock_line_param2_description":function(d){return "The x position in pixels of the end of the line."},
"dropletBlock_line_param3":function(d){return "y2"},
"dropletBlock_line_param3_description":function(d){return "The y position in pixels of the end of the line."},
"dropletBlock_mathAbs_description":function(d){return "Absolute value"},
"dropletBlock_mathAbs_param0":function(d){return "x"},
"dropletBlock_mathAbs_param0_description":function(d){return "An arbitrary number."},
"dropletBlock_mathAbs_signatureOverride":function(d){return "Math.abs(x)"},
"dropletBlock_mathMax_description":function(d){return "Maximum value"},
"dropletBlock_mathMax_param0":function(d){return "n1, n2,..., nX"},
"dropletBlock_mathMax_param0_description":function(d){return "One or more numbers to compare."},
"dropletBlock_mathMax_signatureOverride":function(d){return "Math.max(n1, n2, ..., nX)"},
"dropletBlock_mathMin_description":function(d){return "Minimum value"},
"dropletBlock_mathMin_param0":function(d){return "n1, n2,..., nX"},
"dropletBlock_mathMin_param0_description":function(d){return "One or more numbers to compare."},
"dropletBlock_mathMin_signatureOverride":function(d){return "Math.min(n1, n2, ..., nX)"},
"dropletBlock_mathRound_description":function(d){return "Námunda að næstu heiltölu"},
"dropletBlock_mathRound_param0":function(d){return "x"},
"dropletBlock_mathRound_param0_description":function(d){return "An arbitrary number."},
"dropletBlock_mathRound_signatureOverride":function(d){return "Math.round(x)"},
"dropletBlock_moveBackward_description":function(d){return "Move the turtle backward the specified distance"},
"dropletBlock_moveBackward_param0":function(d){return "díla"},
"dropletBlock_moveBackward_param0_description":function(d){return "The number of pixels to move the turtle back in its current direction. If not provided, the turtle will move back 25 pixels"},
"dropletBlock_moveForward_description":function(d){return "Move the turtle forward the specified distance"},
"dropletBlock_moveForward_param0":function(d){return "díla"},
"dropletBlock_moveForward_param0_description":function(d){return "The number of pixels to move the turtle forward in its current direction. If not provided, the turtle will move forward 25 pixels"},
"dropletBlock_moveTo_description":function(d){return "Move the turtle to the specified x and y coordinates"},
"dropletBlock_moveTo_param0":function(d){return "x"},
"dropletBlock_moveTo_param0_description":function(d){return "The x coordinate on the screen to move the turtle."},
"dropletBlock_moveTo_param1":function(d){return "y"},
"dropletBlock_moveTo_param1_description":function(d){return "The y coordinate on the screen to move the turtle."},
"dropletBlock_move_description":function(d){return "Move the turtle by the specified x and y coordinates"},
"dropletBlock_move_param0":function(d){return "x"},
"dropletBlock_move_param0_description":function(d){return "The number of pixels to move the turtle right."},
"dropletBlock_move_param1":function(d){return "y"},
"dropletBlock_move_param1_description":function(d){return "The number of pixels to move the turtle down."},
"dropletBlock_multiplyOperator_description":function(d){return "Margfalda tvær tölur"},
"dropletBlock_multiplyOperator_signatureOverride":function(d){return "Multiply operator"},
"dropletBlock_notOperator_description":function(d){return "Boole gildi tengd með EKKI"},
"dropletBlock_notOperator_signatureOverride":function(d){return "boole virkinn AND"},
"dropletBlock_onEvent_description":function(d){return "Keyra kóða til að bregðast við hinu tiltekna atviki."},
"dropletBlock_onEvent_param0":function(d){return "kenni"},
"dropletBlock_onEvent_param0_description":function(d){return "The ID of the UI control to which this function applies."},
"dropletBlock_onEvent_param1":function(d){return "atvik"},
"dropletBlock_onEvent_param1_description":function(d){return "The type of event to respond to."},
"dropletBlock_onEvent_param2":function(d){return "fall"},
"dropletBlock_onEvent_param2_description":function(d){return "A function to execute."},
"dropletBlock_orOperator_description":function(d){return "Logical OR of two booleans"},
"dropletBlock_orOperator_signatureOverride":function(d){return "OR boolean operator"},
"dropletBlock_penColor_description":function(d){return "Set the turtle to the specified pen color"},
"dropletBlock_penColor_param0":function(d){return "color"},
"dropletBlock_penColor_param0_description":function(d){return "The color of the line left behind the turtle as it moves"},
"dropletBlock_penColour_description":function(d){return "Set the turtle to the specified pen color"},
"dropletBlock_penColour_param0":function(d){return "color"},
"dropletBlock_penDown_description":function(d){return "Set down the turtle's pen"},
"dropletBlock_penUp_description":function(d){return "Pick up the turtle's pen"},
"dropletBlock_penWidth_description":function(d){return "Stilla skjaldbökuna á tilgreinda breidd penna"},
"dropletBlock_penWidth_param0":function(d){return "width"},
"dropletBlock_penWidth_param0_description":function(d){return "The diameter of the circles drawn behind the turtle as it moves"},
"dropletBlock_playSound_description":function(d){return "Spila MP3, OGG eða WAV hljóðskrá frá tilgreindri URL slóð"},
"dropletBlock_playSound_param0":function(d){return "url"},
"dropletBlock_putImageData_description":function(d){return "Set the ImageData for a rectangle within the active  canvas with x, y as the top left coordinates"},
"dropletBlock_putImageData_param0":function(d){return "imageData"},
"dropletBlock_putImageData_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_putImageData_param1":function(d){return "startX"},
"dropletBlock_putImageData_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image to place the data on the canvas."},
"dropletBlock_putImageData_param2":function(d){return "startY"},
"dropletBlock_putImageData_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image to place the data on the canvas."},
"dropletBlock_radioButton_description":function(d){return "Búa til valhring og gefa honum kenni sem einingu"},
"dropletBlock_radioButton_param0":function(d){return "kenni"},
"dropletBlock_radioButton_param0_description":function(d){return "A unique identifier for the radio button. The id is used for referencing the radioButton control. For example, to assign event handlers."},
"dropletBlock_radioButton_param1":function(d){return "valinn"},
"dropletBlock_radioButton_param1_description":function(d){return "Whether the radio button is initially checked."},
"dropletBlock_radioButton_param2":function(d){return "group"},
"dropletBlock_radioButton_param2_description":function(d){return "The group that the radio button is associated with. Only one button in a group can be checked at a time."},
"dropletBlock_randomNumber_max_description":function(d){return "Ná í slembitölu á milli 0 og tilgreinds hámarksgildis"},
"dropletBlock_randomNumber_max_param0":function(d){return "max"},
"dropletBlock_randomNumber_max_param0_description":function(d){return "The maximum number returned"},
"dropletBlock_randomNumber_max_signatureOverride":function(d){return "randomNumber(max)"},
"dropletBlock_randomNumber_min_max_description":function(d){return "Ná í slembitölu á milli tilgreindra lágmarks- og hámarksgilda"},
"dropletBlock_randomNumber_min_max_param0":function(d){return "min"},
"dropletBlock_randomNumber_min_max_param0_description":function(d){return "The minimum number returned"},
"dropletBlock_randomNumber_min_max_param1":function(d){return "max"},
"dropletBlock_randomNumber_min_max_param1_description":function(d){return "The maximum number returned"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_readRecords_description":function(d){return "Reads all records whose properties match those on the searchParams object."},
"dropletBlock_readRecords_param0":function(d){return "table"},
"dropletBlock_readRecords_param0_description":function(d){return "The name of the table from which the records should be searched and read."},
"dropletBlock_readRecords_param1":function(d){return "searchParams"},
"dropletBlock_readRecords_param2":function(d){return "fall"},
"dropletBlock_rect_description":function(d){return "Draw a rectangle on the active  canvas with x, y, width, and height coordinates"},
"dropletBlock_rect_param0":function(d){return "upperLeftX"},
"dropletBlock_rect_param0_description":function(d){return "The x position in pixels of the upper left corner of the rectangle."},
"dropletBlock_rect_param1":function(d){return "upperLeftY"},
"dropletBlock_rect_param1_description":function(d){return "The y position in pixels of the upper left corner of the rectangle."},
"dropletBlock_rect_param2":function(d){return "width"},
"dropletBlock_rect_param2_description":function(d){return "The horizontal width in pixels of the rectangle."},
"dropletBlock_rect_param3":function(d){return "hæð"},
"dropletBlock_rect_param3_description":function(d){return "The vertical height in pixels of the rectangle."},
"dropletBlock_return_description":function(d){return "Skila gildi úr falli"},
"dropletBlock_return_signatureOverride":function(d){return "skila"},
"dropletBlock_setActiveCanvas_description":function(d){return "Gefa myndfleti kenni fyrir eftirfarandi myndflataraðgerðir (þarf aðeins ef myndfletirnir eru fleiri en einn)"},
"dropletBlock_setActiveCanvas_param0":function(d){return "canvasId"},
"dropletBlock_setActiveCanvas_param0_description":function(d){return "The id of the canvas element to activate."},
"dropletBlock_setAlpha_description":function(d){return "Setur tilgreinda gildið"},
"dropletBlock_setAlpha_param0":function(d){return "imageData"},
"dropletBlock_setAlpha_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_setAlpha_param1":function(d){return "x"},
"dropletBlock_setAlpha_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_setAlpha_param2":function(d){return "y"},
"dropletBlock_setAlpha_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_setAlpha_param3":function(d){return "alphaValue"},
"dropletBlock_setAlpha_param3_description":function(d){return "The amount of alpha (opacity) (from 0 to 255) to set in the pixel."},
"dropletBlock_setAttribute_description":function(d){return "Setur tilgreinda gildið"},
"dropletBlock_setBackground_description":function(d){return "Stillir bakgrunninn"},
"dropletBlock_setBlue_description":function(d){return "Sets the given value"},
"dropletBlock_setBlue_param0":function(d){return "imageData"},
"dropletBlock_setBlue_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_setBlue_param1":function(d){return "x"},
"dropletBlock_setBlue_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_setBlue_param2":function(d){return "y"},
"dropletBlock_setBlue_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_setBlue_param3":function(d){return "blueValue"},
"dropletBlock_setBlue_param3_description":function(d){return "The amount of blue (from 0 to 255) to set in the pixel."},
"dropletBlock_setChecked_description":function(d){return "Stilla stöðu gátreits eða valhrings"},
"dropletBlock_setChecked_param0":function(d){return "kenni"},
"dropletBlock_setChecked_param1":function(d){return "valinn"},
"dropletBlock_setFillColor_description":function(d){return "Stilla fyllingarlit virka myndflatarins"},
"dropletBlock_setFillColor_param0":function(d){return "color"},
"dropletBlock_setFillColor_param0_description":function(d){return "The color name or hex value representing the color."},
"dropletBlock_setGreen_description":function(d){return "Sets the given value"},
"dropletBlock_setGreen_param0":function(d){return "imageData"},
"dropletBlock_setGreen_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_setGreen_param1":function(d){return "x"},
"dropletBlock_setGreen_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_setGreen_param2":function(d){return "y"},
"dropletBlock_setGreen_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_setGreen_param3":function(d){return "greenValue"},
"dropletBlock_setGreen_param3_description":function(d){return "The amount of green (from 0 to 255) to set in the pixel."},
"dropletBlock_setImageURL_description":function(d){return "Stilla URL slóð fyrir tilgreint kenni myndeiningar"},
"dropletBlock_setImageURL_param0":function(d){return "kenni"},
"dropletBlock_setImageURL_param0_description":function(d){return "The id of the image element."},
"dropletBlock_setImageURL_param1":function(d){return "url"},
"dropletBlock_setImageURL_param1_description":function(d){return "TThe source URL of the image to be displayed on screen."},
"dropletBlock_setInterval_description":function(d){return "Halda áfram að keyra kóða í hvert sinn sem tilgreindur fjöldi millisekúndna er liðinn"},
"dropletBlock_setInterval_param0":function(d){return "fall"},
"dropletBlock_setInterval_param0_description":function(d){return "A function to execute."},
"dropletBlock_setInterval_param1":function(d){return "milliseconds"},
"dropletBlock_setInterval_param1_description":function(d){return "The number of milliseconds between each execution of the function."},
"dropletBlock_setKeyValue_description":function(d){return "Saves the value associated with the key to the remote data store."},
"dropletBlock_setKeyValue_param0":function(d){return "key"},
"dropletBlock_setKeyValue_param0_description":function(d){return "The name of the key to be stored."},
"dropletBlock_setKeyValue_param1":function(d){return "value"},
"dropletBlock_setKeyValue_param1_description":function(d){return "The data to be stored."},
"dropletBlock_setKeyValue_param2":function(d){return "fall"},
"dropletBlock_setKeyValue_param2_description":function(d){return "A function that is asynchronously called when the call to setKeyValue is finished."},
"dropletBlock_setParent_description":function(d){return "Stilla einingu þannig að hún verði undireining yfireiningar"},
"dropletBlock_setPosition_description":function(d){return "Setja einingu á stað með hnitum fyrir x, y, breidd og hæð"},
"dropletBlock_setPosition_param0":function(d){return "kenni"},
"dropletBlock_setPosition_param1":function(d){return "x"},
"dropletBlock_setPosition_param2":function(d){return "y"},
"dropletBlock_setPosition_param3":function(d){return "width"},
"dropletBlock_setPosition_param4":function(d){return "hæð"},
"dropletBlock_setRGB_description":function(d){return "Sets the RGB color values (ranging from 0 to 255) of the pixel located at the given x and y position in the given image data to the input red, green, blue amounts"},
"dropletBlock_setRGB_param0":function(d){return "imageData"},
"dropletBlock_setRGB_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_setRGB_param1":function(d){return "x"},
"dropletBlock_setRGB_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_setRGB_param2":function(d){return "y"},
"dropletBlock_setRGB_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_setRGB_param3":function(d){return "rauður"},
"dropletBlock_setRGB_param3_description":function(d){return "The amount of red (from 0 to 255) to set in the pixel."},
"dropletBlock_setRGB_param4":function(d){return "grænn"},
"dropletBlock_setRGB_param4_description":function(d){return "The amount of green (from 0 to 255) to set in the pixel."},
"dropletBlock_setRGB_param5":function(d){return "blár"},
"dropletBlock_setRGB_param5_description":function(d){return "The amount of blue (from 0 to 255) to set in the pixel."},
"dropletBlock_setRGB_param6":function(d){return "alpha"},
"dropletBlock_setRGB_param6_description":function(d){return "Optional. The amount of opacity (from 0 to 255) to set in the pixel. Defaults to 255 (full opacity)."},
"dropletBlock_setRed_description":function(d){return "Sets the given value"},
"dropletBlock_setRed_param0":function(d){return "imageData"},
"dropletBlock_setRed_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_setRed_param1":function(d){return "x"},
"dropletBlock_setRed_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_setRed_param2":function(d){return "y"},
"dropletBlock_setRed_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_setRed_param3":function(d){return "redValue"},
"dropletBlock_setRed_param3_description":function(d){return "The amount of red (from 0 to 255) to set in the pixel."},
"dropletBlock_setSpriteEmotion_description":function(d){return "Stillir skap leikmanns"},
"dropletBlock_setSpritePosition_description":function(d){return "Færir leikmann samstundis á hinn tiltekna stað."},
"dropletBlock_setSpriteSpeed_description":function(d){return "Stillir hraða leikmanns"},
"dropletBlock_setSprite_description":function(d){return "Stillir ímynd leikmanns"},
"dropletBlock_setStrokeColor_description":function(d){return "Set the stroke color for the active  canvas"},
"dropletBlock_setStrokeColor_param0":function(d){return "color"},
"dropletBlock_setStrokeColor_param0_description":function(d){return "The color name or hex value representing the color."},
"dropletBlock_setStrokeWidth_description":function(d){return "Set the line width for the active  canvas"},
"dropletBlock_setStrokeWidth_param0":function(d){return "width"},
"dropletBlock_setStrokeWidth_param0_description":function(d){return "The width in pixels with which to draw lines, circles, and rectangles."},
"dropletBlock_setStyle_description":function(d){return "Bæta CSS sniðtexta við einingu"},
"dropletBlock_setText_description":function(d){return "Setja textann í tilgreinda einingu"},
"dropletBlock_setText_param0":function(d){return "kenni"},
"dropletBlock_setText_param1":function(d){return "texti"},
"dropletBlock_setTimeout_description":function(d){return "Stilla tímamæli og keyra kóða þegar tilgreindur fjöldi millisekúndna er liðinn"},
"dropletBlock_setTimeout_param0":function(d){return "fall"},
"dropletBlock_setTimeout_param0_description":function(d){return "A function to execute."},
"dropletBlock_setTimeout_param1":function(d){return "milliseconds"},
"dropletBlock_setTimeout_param1_description":function(d){return "The number of milliseconds to wait before executing the function."},
"dropletBlock_showElement_description":function(d){return "Sýna eininguna með tilgreinda kennið"},
"dropletBlock_showElement_param0":function(d){return "kenni"},
"dropletBlock_showElement_param0_description":function(d){return "The id of the element to hide."},
"dropletBlock_show_description":function(d){return "Show the turtle image at its current location"},
"dropletBlock_speed_description":function(d){return "Stilla keyrsluhraða forritsins á tilgreint prósentugildi"},
"dropletBlock_speed_param0":function(d){return "value"},
"dropletBlock_speed_param0_description":function(d){return "The speed of the app's execution in the range of (1-100)"},
"dropletBlock_startWebRequest_description":function(d){return "Biðja um gögn af internetinu og keyra kóða þegar beiðninni er lokið"},
"dropletBlock_startWebRequest_param0":function(d){return "url"},
"dropletBlock_startWebRequest_param0_description":function(d){return "The web address of a service that returns data."},
"dropletBlock_startWebRequest_param1":function(d){return "fall"},
"dropletBlock_startWebRequest_param1_description":function(d){return "A function to execute."},
"dropletBlock_subtractOperator_description":function(d){return "Frádráttur tveggja talna"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_textInput_description":function(d){return "Búa til textareit (input) og gefa honum kenni sem einingu"},
"dropletBlock_textInput_param0":function(d){return "inputId"},
"dropletBlock_textInput_param1":function(d){return "texti"},
"dropletBlock_textLabel_description":function(d){return "Búa til textaskýringu (label), gefa henni kenni sem einingu og binda hana við tengda einingu"},
"dropletBlock_textLabel_param0":function(d){return "labelId"},
"dropletBlock_textLabel_param0_description":function(d){return "A unique identifier for the label control. The id is used for referencing the created label. For example, to assign event handlers."},
"dropletBlock_textLabel_param1":function(d){return "texti"},
"dropletBlock_textLabel_param1_description":function(d){return "The value to display for the label."},
"dropletBlock_textLabel_param2":function(d){return "forId"},
"dropletBlock_textLabel_param2_description":function(d){return "The id to associate the label with. Clicking the label is the same as clicking on the control."},
"dropletBlock_throw_description":function(d){return "Sendir skot frá tiltekna leikmanninum."},
"dropletBlock_turnLeft_description":function(d){return "Snúa skjaldbökunni rangsælis um tilgreindan fjölda gráða"},
"dropletBlock_turnLeft_param0":function(d){return "horn"},
"dropletBlock_turnLeft_param0_description":function(d){return "The angle to turn left."},
"dropletBlock_turnRight_description":function(d){return "Snúa skjaldbökunni réttsælis um tilgreindan fjölda gráða"},
"dropletBlock_turnRight_param0":function(d){return "horn"},
"dropletBlock_turnRight_param0_description":function(d){return "The angle to turn right."},
"dropletBlock_turnTo_description":function(d){return "Snúa skjaldbökunni í tilgreinda stefnu (0 gráður vísar upp)"},
"dropletBlock_turnTo_param0":function(d){return "horn"},
"dropletBlock_turnTo_param0_description":function(d){return "The new angle to set the turtle's direction to."},
"dropletBlock_updateRecord_description":function(d){return "Updates a record, identified by record.id."},
"dropletBlock_updateRecord_param0":function(d){return "tableName"},
"dropletBlock_updateRecord_param0_description":function(d){return "The name of the table from which the records should be searched and read."},
"dropletBlock_updateRecord_param1":function(d){return "færsla"},
"dropletBlock_updateRecord_param2":function(d){return "fall"},
"dropletBlock_vanish_description":function(d){return "Lætur leikmanninn hverfa."},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"dropletBlock_write_description":function(d){return "Búa til textabálk"},
"dropletBlock_write_param0":function(d){return "texti"},
"dropletBlock_write_param0_description":function(d){return "The text or HTML you want appended to the bottom of your application"},
"emptyBlocksErrorMsg":function(d){return "Kubbarnir \"endurtaka\" og \"ef\" verða að innihalda aðra kubba til að virka. Gættu þess að innri kubburinn smellpassi í ytri kubbinn."},
"emptyFunctionBlocksErrorMsg":function(d){return "Fallkubburinn þarf að innhalda aðra kubba til að virka."},
"emptyFunctionalBlock":function(d){return "Það er kubbur með óútfyllt inntak."},
"end":function(d){return "endir"},
"errorEmptyFunctionBlockModal":function(d){return "Það þurfa að vera kubbar innan í skilgreiningunni á fallinu. Smelltu á \"breyta\" og dragðu kubba inn í græna kubbinn."},
"errorIncompleteBlockInFunction":function(d){return "Smelltu á \"breyta\" til að ganga úr skugga um að það vanti ekki neina kubba í skilgreininguna á fallinu."},
"errorParamInputUnattached":function(d){return "Mundu að tengja kubb við hvert inntak fyrir stika sem er á kubbi fallsins á vinnusvæðinu."},
"errorQuestionMarksInNumberField":function(d){return "Prófaðu að skipta \"???\" út fyrir gildi."},
"errorRequiredParamsMissing":function(d){return "Búðu til stika fyrir fallið þitt með því að smella á \"breyta\" og bæta við stikunum sem þarf. Dragðu nýju stikakubbana inn í skilgreiningu þína fyrir fallið."},
"errorUnusedFunction":function(d){return "Þú bjóst til fall, en notaðir það aldrei á vinnusvæðinu! Smelltu á \"Föll\" í verkfærakassanum og gættu þess að nota fallið í forritinu þínu."},
"errorUnusedParam":function(d){return "Þú bættir við kubbi fyrir stika en notaðir hann ekki í skilgreiningunni. Gættu þess að nota stikann þinn með því að smella á \"breyta\" og setja stikakubbinn inn í græna kubbinn."},
"extraTopBlocks":function(d){return "Þú ert með ótengda kubba. Ætlaðir þú að festa þá á \"þegar keyrt\" kubbinn?"},
"extraTopBlocksWhenRun":function(d){return "You have unattached blocks. Did you mean to attach these to the \"when run\" block?"},
"finalStage":function(d){return "Til hamingju! Þú hefur klárað síðasta áfangann."},
"finalStageTrophies":function(d){return "Til hamingju! Þú hefur klárað síðasta áfangann og unnið "+locale.p(d,"numTrophies",0,"is",{"one":"bikar","other":locale.n(d,"numTrophies")+" bikara"})+"."},
"finish":function(d){return "Ljúka"},
"generatedCodeInfo":function(d){return "Jafnvel bestu háskólar kenna forritun með kubbum (t.d. "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). En bak við tjöldin er hægt að sýna kubbana sem þú hefur sett saman sem JavaScript, sem er mest notaða forritunarmál í heimi:"},
"genericFeedback":function(d){return "Athugaðu hvernig þetta fór og reyndu að laga forritið."},
"hashError":function(d){return "Því miður finnst ekkert vistað forrit '%1'."},
"help":function(d){return "Hjálp"},
"hideToolbox":function(d){return "(Hide)"},
"hintHeader":function(d){return "Vísbending:"},
"hintRequest":function(d){return "Sjá vísbendingu"},
"hintTitle":function(d){return "Vísbending:"},
"infinity":function(d){return "Óendanleiki"},
"jump":function(d){return "stökkva"},
"keepPlaying":function(d){return "Spila áfram"},
"levelIncompleteError":function(d){return "Þú ert að nota allar nauðsynlegu tegundirnar af kubbum en ekki á réttan hátt."},
"listVariable":function(d){return "listi"},
"makeYourOwnFlappy":function(d){return "Búðu til þinn eigin(n) Flappy leik"},
"missingBlocksErrorMsg":function(d){return "Reyndu einn eða fleiri af kubbunum hér fyrir neðan til að leysa þessa þraut."},
"nextLevel":function(d){return "Til hamingju! Þú hefur leyst þraut "+locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Til hamingju! Þú hefur leyst þraut "+locale.v(d,"puzzleNumber")+" og unnið "+locale.p(d,"numTrophies",0,"is",{"one":"bikar","other":locale.n(d,"numTrophies")+" bikara"})+"."},
"nextPuzzle":function(d){return "Next Puzzle"},
"nextStage":function(d){return "Til hamingju! Þú kláraðir "+locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Til hamingju! Þú kláraðir "+locale.v(d,"stageName")+" og vannst "+locale.p(d,"numTrophies",0,"is",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"numBlocksNeeded":function(d){return "Til hamingju! Þú kláraðir þraut "+locale.v(d,"puzzleNumber")+". (En þú hefðir getað notað bara  "+locale.p(d,"numBlocks",0,"is",{"one":"1 kubb","other":locale.n(d,"numBlocks")+" kubba"})+".)"},
"numLinesOfCodeWritten":function(d){return "Þú náðir að skrifa "+locale.p(d,"numLines",0,"is",{"one":"1 línu","other":locale.n(d,"numLines")+" línur"})+" af kóða!"},
"openWorkspace":function(d){return "Hvernig það virkar"},
"orientationLock":function(d){return "Slökktu á stefnulæsingu í stillingum tækis."},
"play":function(d){return "spila"},
"print":function(d){return "Prenta"},
"puzzleTitle":function(d){return "Þraut "+locale.v(d,"puzzle_number")+" af "+locale.v(d,"stage_total")},
"repeat":function(d){return "endurtaka"},
"resetProgram":function(d){return "Endurstilla"},
"rotateText":function(d){return "Snúðu tækinu þínu."},
"runProgram":function(d){return "Keyra"},
"runTooltip":function(d){return "Keyra forritið sem samanstendur af kubbunum á vinnusvæðinu."},
"saveToGallery":function(d){return "Vista í safni"},
"savedToGallery":function(d){return "Vistað í safni!"},
"score":function(d){return "stig"},
"shareFailure":function(d){return "Því miður getum við ekki deilt þessu forriti."},
"showBlocksHeader":function(d){return "Sýna kubba"},
"showCodeHeader":function(d){return "Sýna kóða"},
"showGeneratedCode":function(d){return "Sýna kóða"},
"showToolbox":function(d){return "Show Toolbox"},
"signup":function(d){return "Skráning á inngangsnámskeiðið"},
"stringEquals":function(d){return "strengur=?"},
"subtitle":function(d){return "sjónrænt forritunarumhverfi"},
"textVariable":function(d){return "texti"},
"toggleBlocksErrorMsg":function(d){return "Þú þarft að leiðrétta villu í forritinu þínu áður en hægt er að sýna það með kubbum."},
"tooFewBlocksMsg":function(d){return "Þú ert að nota allar nauðsynlegu tegundirnar af kubbum, en reyndu að nota fleiri svoleiðis kubba til að leysa þessa þraut."},
"tooManyBlocksMsg":function(d){return "Þessa þraut er hægt að leysa með <x id='START_SPAN'/><x id='END_SPAN'/> kubbum."},
"tooMuchWork":function(d){return "Þú lagðir á mig mjög mikla vinnu! Gætirðu reynt að nota færri endurtekningar?"},
"toolboxHeader":function(d){return "kubbar"},
"toolboxHeaderDroplet":function(d){return "Toolbox"},
"totalNumLinesOfCodeWritten":function(d){return "Samtals: "+locale.p(d,"numLines",0,"is",{"one":"1 lína","other":locale.n(d,"numLines")+" línur"})+" af kóða."},
"tryAgain":function(d){return "Reyna aftur"},
"tryHOC":function(d){return "Prófa Klukkustund kóðunar"},
"wantToLearn":function(d){return "Viltu læra að kóða?"},
"watchVideo":function(d){return "Horfa á videóið"},
"when":function(d){return "þegar"},
"whenRun":function(d){return "þegar keyrt"},
"workspaceHeaderShort":function(d){return "Vinnusvæði: "}};