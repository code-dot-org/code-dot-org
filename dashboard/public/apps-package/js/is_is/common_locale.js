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
"booleanTrue":function(d){return "satt"},
"booleanFalse":function(d){return "ósatt"},
"blocklyMessage":function(d){return "Blockly"},
"catActions":function(d){return "Aðgerðir"},
"catColour":function(d){return "Litir"},
"catLogic":function(d){return "Rökvísi"},
"catLists":function(d){return "Listar"},
"catLoops":function(d){return "Lykkjur"},
"catMath":function(d){return "Reikningur"},
"catProcedures":function(d){return "Föll"},
"catText":function(d){return "texti"},
"catVariables":function(d){return "Breytur"},
"codeTooltip":function(d){return "Sjá samsvarandi JavaScript kóða."},
"continue":function(d){return "Halda áfram"},
"dialogCancel":function(d){return "Hætta við"},
"dialogOK":function(d){return "Í lagi"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionEastLetter":function(d){return "A"},
"directionWestLetter":function(d){return "V"},
"end":function(d){return "endir"},
"emptyBlocksErrorMsg":function(d){return "Kubbarnir \"endurtaka\" og \"ef\" verða að innihalda aðra kubba til að virka. Gættu þess að innri kubburinn smellpassi í ytri kubbinn."},
"emptyFunctionBlocksErrorMsg":function(d){return "Fallkubburinn þarf að innhalda aðra kubba til að virka."},
"errorEmptyFunctionBlockModal":function(d){return "Það þurfa að vera kubbar innan í skilgreiningunni á fallinu. Smelltu á \"breyta\" og dragðu kubba inn í græna kubbinn."},
"errorIncompleteBlockInFunction":function(d){return "Smelltu á \"breyta\" til að ganga úr skugga um að það vanti ekki neina kubba í skilgreininguna á fallinu."},
"errorParamInputUnattached":function(d){return "Mundu að tengja kubb við hvert inntak fyrir stika sem er á kubbi fallsins á vinnusvæðinu."},
"errorUnusedParam":function(d){return "Þú bættir við kubbi fyrir stika en notaðir hann ekki í skilgreiningunni. Gættu þess að nota stikann þinn með því að smella á \"breyta\" og setja stikakubbinn inn í græna kubbinn."},
"errorRequiredParamsMissing":function(d){return "Búðu til stika fyrir fallið þitt með því að smella á \"breyta\" og bæta við stikunum sem þarf. Dragðu nýju stikakubbana inn í skilgreiningu þína fyrir fallið."},
"errorUnusedFunction":function(d){return "Þú bjóst til fall, en notaðir það aldrei á vinnusvæðinu! Smelltu á \"Föll\" í verkfærakassanum og gættu þess að nota fallið í forritinu þínu."},
"errorQuestionMarksInNumberField":function(d){return "Prófaðu að skipta \"???\" út fyrir gildi."},
"extraTopBlocks":function(d){return "Þú ert með ótengda kubba. Ætlaðir þú að festa þá á \"þegar keyrt\" kubbinn?"},
"finalStage":function(d){return "Til hamingju! Þú hefur klárað síðasta áfangann."},
"finalStageTrophies":function(d){return "Til hamingju! Þú hefur klárað síðasta áfangann og unnið "+locale.p(d,"numTrophies",0,"is",{"one":"bikar","other":locale.n(d,"numTrophies")+" bikara"})+"."},
"finish":function(d){return "Ljúka"},
"generatedCodeInfo":function(d){return "Jafnvel bestu háskólar kenna forritun með kubbum (t.d. "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). En bak við tjöldin er hægt að sýna kubbana sem þú hefur sett saman sem JavaScript, sem er mest notaða forritunarmál í heimi:"},
"hashError":function(d){return "Því miður finnst ekkert vistað forrit '%1'."},
"help":function(d){return "Hjálp"},
"hintTitle":function(d){return "Vísbending:"},
"jump":function(d){return "stökkva"},
"levelIncompleteError":function(d){return "Þú ert að nota allar nauðsynlegu tegundirnar af kubbum en ekki á réttan hátt."},
"listVariable":function(d){return "listi"},
"makeYourOwnFlappy":function(d){return "Búðu til þinn eigin(n) Flappy leik"},
"missingBlocksErrorMsg":function(d){return "Reyndu einn eða fleiri af kubbunum hér fyrir neðan til að leysa þessa þraut."},
"nextLevel":function(d){return "Til hamingju! Þú hefur leyst þraut "+locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Til hamingju! Þú hefur leyst þraut "+locale.v(d,"puzzleNumber")+" og unnið "+locale.p(d,"numTrophies",0,"is",{"one":"bikar","other":locale.n(d,"numTrophies")+" bikara"})+"."},
"nextStage":function(d){return "Til hamingju! Þú kláraðir "+locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Til hamingju! Þú kláraðir "+locale.v(d,"stageName")+" og vannst "+locale.p(d,"numTrophies",0,"is",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"numBlocksNeeded":function(d){return "Til hamingju! Þú kláraðir þraut "+locale.v(d,"puzzleNumber")+". (En þú hefðir getað notað bara  "+locale.p(d,"numBlocks",0,"is",{"one":"1 kubb","other":locale.n(d,"numBlocks")+" kubba"})+".)"},
"numLinesOfCodeWritten":function(d){return "Þú náðir að skrifa "+locale.p(d,"numLines",0,"is",{"one":"1 línu","other":locale.n(d,"numLines")+" línur"})+" af kóða!"},
"play":function(d){return "spila"},
"print":function(d){return "Prenta"},
"puzzleTitle":function(d){return "Þraut "+locale.v(d,"puzzle_number")+" af "+locale.v(d,"stage_total")},
"repeat":function(d){return "endurtaka"},
"resetProgram":function(d){return "Endurstilla"},
"runProgram":function(d){return "Keyra"},
"runTooltip":function(d){return "Keyra forritið sem samanstendur af kubbunum á vinnusvæðinu."},
"score":function(d){return "stig"},
"showCodeHeader":function(d){return "Sýna kóða"},
"showBlocksHeader":function(d){return "Sýna kubba"},
"showGeneratedCode":function(d){return "Sýna kóða"},
"stringEquals":function(d){return "strengur=?"},
"subtitle":function(d){return "sjónrænt forritunarumhverfi"},
"textVariable":function(d){return "texti"},
"tooFewBlocksMsg":function(d){return "Þú ert að nota allar nauðsynlegu tegundirnar af kubbum, en reyndu að nota fleiri svoleiðis kubba til að leysa þessa þraut."},
"tooManyBlocksMsg":function(d){return "Þessa þraut er hægt að leysa með <x id='START_SPAN'/><x id='END_SPAN'/> kubbum."},
"tooMuchWork":function(d){return "Þú lagðir á mig mjög mikla vinnu! Gætirðu reynt að nota færri endurtekningar?"},
"toolboxHeader":function(d){return "kubbar"},
"openWorkspace":function(d){return "Hvernig það virkar"},
"totalNumLinesOfCodeWritten":function(d){return "Samtals: "+locale.p(d,"numLines",0,"is",{"one":"1 lína","other":locale.n(d,"numLines")+" línur"})+" af kóða."},
"tryAgain":function(d){return "Reyna aftur"},
"hintRequest":function(d){return "Sjá vísbendingu"},
"backToPreviousLevel":function(d){return "Til baka í fyrri áfanga"},
"saveToGallery":function(d){return "Vista í safni"},
"savedToGallery":function(d){return "Vistað í safni!"},
"shareFailure":function(d){return "Því miður getum við ekki deilt þessu forriti."},
"workspaceHeader":function(d){return "Settu kubbana saman hér: "},
"workspaceHeaderJavaScript":function(d){return "Skrifaðu JavaScript kóða þinn hér"},
"infinity":function(d){return "Óendanleiki"},
"rotateText":function(d){return "Snúðu tækinu þínu."},
"orientationLock":function(d){return "Slökktu á stefnulæsingu í stillingum tækis."},
"wantToLearn":function(d){return "Viltu læra að kóða?"},
"watchVideo":function(d){return "Horfa á videóið"},
"when":function(d){return "þegar"},
"whenRun":function(d){return "þegar keyrt"},
"tryHOC":function(d){return "Prófa Klukkustund kóðunar"},
"signup":function(d){return "Skráning á inngangsnámskeiðið"},
"hintHeader":function(d){return "Vísbending:"},
"genericFeedback":function(d){return "Athugaðu hvernig þetta fór og reyndu að laga forritið."},
"toggleBlocksErrorMsg":function(d){return "Þú þarft að leiðrétta villu í forritinu þínu áður en hægt er að sýna það með kubbum."},
"defaultTwitterText":function(d){return "Skoðaðu það sem ég bjó til"}};