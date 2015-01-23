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
"and":function(d){return "dhe"},
"booleanTrue":function(d){return "e saktë"},
"booleanFalse":function(d){return "e pasaktë"},
"blocklyMessage":function(d){return "Blockly"},
"catActions":function(d){return "Veprimet"},
"catColour":function(d){return "Ngjyra"},
"catLogic":function(d){return "Logjika"},
"catLists":function(d){return "Listat"},
"catLoops":function(d){return "perseritje"},
"catMath":function(d){return "Matematikë"},
"catProcedures":function(d){return "funksionet"},
"catText":function(d){return "Tekst"},
"catVariables":function(d){return "variabla"},
"codeTooltip":function(d){return "Shikoni kodin e gjeneruar në JavaScript."},
"continue":function(d){return "Vazhdo"},
"dialogCancel":function(d){return "Anullo"},
"dialogOK":function(d){return "Ne rregull"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionEastLetter":function(d){return "E"},
"directionWestLetter":function(d){return "W"},
"end":function(d){return "fundi"},
"emptyBlocksErrorMsg":function(d){return "Blloku \"Përsërit\" ose \"Nëse\"  ka nevojë të ketë blloqe të tjera brënda në mënyrë që të funksionojë. Sigurohu që blloku i brendshëm të përshtatet në mënyrë sa më të mirë brenda bllokut që e përmban."},
"emptyFunctionBlocksErrorMsg":function(d){return "Blloku i funksionit ka nevojë për blloqe të tjera brënda, në mënyrë që të funksionojë."},
"errorEmptyFunctionBlockModal":function(d){return "Duhet që të ketë blloqe brenda përcaktimit të funksionit tënd. Kliko \"redakto\" dhe zhvendos blloqet brenda bllokut të gjelbër."},
"errorIncompleteBlockInFunction":function(d){return "Kliko \"redakto\" për tu siguruar që nuk mungon ndonjë bllok brenda përcaktimit të funksionit tënd."},
"errorParamInputUnattached":function(d){return "Kujtohu që të bashkangjitësh një bllok në çdo parametër që futet në bllokun e funksionit tek zona juaj e punimit."},
"errorUnusedParam":function(d){return "Ti shtove një bllok parametër, por nuk e përdore atë në përcaktim. Sigurohu që të përdorësh parametrin tënd duke klikuar \"redakto\" dhe duke vendosur këtë parametër bllok brenda bllokut të gjelbër."},
"errorRequiredParamsMissing":function(d){return "Krijo një parametër për funksionin tënd duke klikuar \"redakto\" dhe duke shtuar parametrat e nevojshëm. Zhvendos blloqet e reja me parametra brenda në përcaktimin e funksionit tënd."},
"errorUnusedFunction":function(d){return "Ti krijove një funksion, por nuk e përdore asnjëherë në hapësirën tënde të punës! Kliko tek \"Funksionet\" në grupin e komandave dhe sigurohu që ta përdorësh atë në programin tënd."},
"errorQuestionMarksInNumberField":function(d){return "Përpiqu të zëvendësosh \"???\" me një vlerë."},
"extraTopBlocks":function(d){return "Ti ke blloqe që nuk janë të bashkuar. Mendove të bashkosh ato me bllokun \"kur vrapon\"?"},
"finalStage":function(d){return "Urime! Ju sapo perfunduat fazen finale "},
"finalStageTrophies":function(d){return "Urime! Ti ke përfunduar fazën finale dhe ke fituar "+locale.p(d,"numTrophies",0,"sq",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"finish":function(d){return "Përfundo"},
"generatedCodeInfo":function(d){return "Edhe universitetet më të mira të mësojnë kodimin e bazuar në blloqe (psh "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). Por mbrapa asaj çfarë shohim, blloqet të cilat ke mbledhur, mund të shfaqen në JavaScript, në gjuhën më të përdorur të kodimit:"},
"hashError":function(d){return "Më vjen keq, '%1' nuk përputhet me asnjë program të ruajtur."},
"help":function(d){return "Ndihmë"},
"hintTitle":function(d){return "Ndihmes:"},
"jump":function(d){return "hidhu"},
"levelIncompleteError":function(d){return "Ti je duke përdorur të gjithë tipet e nevojshëm të blloqeve, por jo në mënyrën e duhur."},
"listVariable":function(d){return "listë"},
"makeYourOwnFlappy":function(d){return "Bëj lojën tënde Flappy"},
"missingBlocksErrorMsg":function(d){return "Përdor një ose më shumë nga blloqet e mëposhtme për të zgjidhur këtë puzzle."},
"nextLevel":function(d){return "Urime ju e perfunduat Puzzle-n "+locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Urime! Ti përfundove Puzzle "+locale.v(d,"puzzleNumber")+" dhe fitove "+locale.p(d,"numTrophies",0,"sq",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"nextStageTrophies":function(d){return "Urime! Ti përfundove "+locale.v(d,"stageName")+" dhe fitove "+locale.p(d,"numTrophies",0,"sq",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"numBlocksNeeded":function(d){return "Urime! Ti përfundove Puzzle "+locale.v(d,"puzzleNumber")+". (Megjithatë, ti mund të kishe përdorur vetëm "+locale.p(d,"numBlocks",0,"sq",{"one":"1 block","other":locale.n(d,"numBlocks")+" blocks"})+".)"},
"numLinesOfCodeWritten":function(d){return "Ti sapo shkruajte "+locale.p(d,"numLines",0,"sq",{"one":"1 line","other":locale.n(d,"numLines")+" lines"})+" të kodit!"},
"play":function(d){return "luaj"},
"print":function(d){return "Shtyp"},
"puzzleTitle":function(d){return "Puzzle "+locale.v(d,"puzzle_number")+" i "+locale.v(d,"stage_total")},
"repeat":function(d){return "përsërit"},
"resetProgram":function(d){return "Rivendosni"},
"runProgram":function(d){return "Ekzekuto"},
"runTooltip":function(d){return "Ekzekuto programin e përcaktuar nga blloqet, në hapësirën tënde të punës."},
"score":function(d){return "rezultati"},
"showCodeHeader":function(d){return "Shfaq kodin"},
"showBlocksHeader":function(d){return "Shfaq Blloqet"},
"showGeneratedCode":function(d){return "Shfaq kodin"},
"stringEquals":function(d){return "vargu=?"},
"subtitle":function(d){return "një mjedis i dukshëm programimi"},
"textVariable":function(d){return "teksti"},
"tooFewBlocksMsg":function(d){return "Ti je duke i përdorur të gjithë tipet e nevojshëm të blloqeve, por përpiqu të përdorësh më shumë nga këto tipe blloqesh për të përfunduar këtë puzzle."},
"tooManyBlocksMsg":function(d){return "Ky puzzle mund të zgjidhet me blloqet <x id='START_SPAN'/><x id='END_SPAN'/>."},
"tooMuchWork":function(d){return "Ti më detyrove të bëj shumë veprime! Mund të përpiqesh ta përsërisësh me më pak hapa?"},
"toolboxHeader":function(d){return "Blloqet"},
"openWorkspace":function(d){return "Si Funksionon"},
"totalNumLinesOfCodeWritten":function(d){return "Totali i gjithë kohës: "+locale.p(d,"numLines",0,"sq",{"one":"1 line","other":locale.n(d,"numLines")+" lines"})+" i kodit."},
"tryAgain":function(d){return "Provo perseri"},
"hintRequest":function(d){return "Shih ndihmën"},
"backToPreviousLevel":function(d){return "Kthehu në nivelin e mëparshëm"},
"saveToGallery":function(d){return "Ruaj tek galeria"},
"savedToGallery":function(d){return "U ruajt në galeri!"},
"shareFailure":function(d){return "Më vjen keq, ne nuk mund ta ndajmë këtë program."},
"workspaceHeader":function(d){return "Vendosi blloqet e tua këtu: "},
"workspaceHeaderJavaScript":function(d){return "Shtyp kodin tënd JavaScript këtu"},
"infinity":function(d){return "Pafundësi"},
"rotateText":function(d){return "Rrotullo pajisjen tënde."},
"orientationLock":function(d){return "Fik orientimet në konfigurimet e pajisjes."},
"wantToLearn":function(d){return "Dëshiron të mësosh se si të kodosh?"},
"watchVideo":function(d){return "Shiko Videon"},
"when":function(d){return "kur"},
"whenRun":function(d){return "kur vrapon"},
"tryHOC":function(d){return "Provo Orën e Kodimit"},
"signup":function(d){return "Rregjistrohu për kursin hyrës"},
"hintHeader":function(d){return "Ja ku është një këshillë:"},
"genericFeedback":function(d){return "Shiko se si përfundove dhe përpiqu të rregullosh programin tënd."},
"toggleBlocksErrorMsg":function(d){return "Ti duhet të rregullosh një gabim në programin tënd përpara se të shfaqet si blloqet."},
"defaultTwitterText":function(d){return "Shiko se çfarë bëra"}};