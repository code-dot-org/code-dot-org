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
},"da":function(n){return n===1?"one":"other"},"de":function(n){return n===1?"one":"other"},"el":function(n){return n===1?"one":"other"},"es":function(n){return n===1?"one":"other"},"et":function(n){return n===1?"one":"other"},"eu":function(n){return n===1?"one":"other"},"fa":function(n){return "other"},"fi":function(n){return n===1?"one":"other"},"fil":function(n){return n===0||n==1?"one":"other"},"fr":function(n){return Math.floor(n)===0||Math.floor(n)==1?"one":"other"},"he":function(n){return n===1?"one":"other"},"hi":function(n){return n===0||n==1?"one":"other"},"hr":function(n){
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
"and":function(d){return "i"},
"booleanTrue":function(d){return "cert"},
"booleanFalse":function(d){return "fals"},
"blocklyMessage":function(d){return "Blockly"},
"catActions":function(d){return "Accions"},
"catColour":function(d){return "Color"},
"catLogic":function(d){return "Lògic"},
"catLists":function(d){return "Llistes"},
"catLoops":function(d){return "Bucles"},
"catMath":function(d){return "Mates"},
"catProcedures":function(d){return "Funcions"},
"catText":function(d){return "text"},
"catVariables":function(d){return "Variables"},
"codeTooltip":function(d){return "Vegeu el codi JavaScript generat."},
"continue":function(d){return "Continuar"},
"dialogCancel":function(d){return "Cancel·lar"},
"dialogOK":function(d){return "OK"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionEastLetter":function(d){return "E"},
"directionWestLetter":function(d){return "W"},
"end":function(d){return "final"},
"emptyBlocksErrorMsg":function(d){return "Els blocs \"Repetir\" o el \"Si\" necessiten tenir altres blocs dins per a treballar. Assegureu-vos que el bloc interior encaixa bé dins del bloc que conté."},
"emptyFunctionBlocksErrorMsg":function(d){return "La funció bloc ha de tenir altres blocs a dins perquè funcioni."},
"errorEmptyFunctionBlockModal":function(d){return "Cal que hi hagi blocs dins de la definició de la teva funció. Fes clic a \"Edita\" i arrossega els blocs que calgui dins del bloc verd."},
"errorIncompleteBlockInFunction":function(d){return "Feu clic a \"Edita\" per assegurar-vos que no us falta cap bloc a la definició de funció."},
"errorParamInputUnattached":function(d){return "Recordeu d'afegir un bloc a cada entrada de paràmetre al bloc de funcions en el vostre espai de treball."},
"errorUnusedParam":function(d){return "Has afegit un bloc de paràmetre, però no l'has utilitzat a la definició. Assegura't d'utilitzar el paràmetre fent clic a \"edita\" i col·locant el bloc de paràmetre dins del bloc verd."},
"errorRequiredParamsMissing":function(d){return "Crea un paràmetre per a la funció fent clic a \"edita\" i afegint els paràmetres necessaris. Arrossega els nous blocs de paràmetres a la definició de funció."},
"errorUnusedFunction":function(d){return "Heu creat una funció però no l'heu utilitzat al vostre espai de treball! Feu clic a \"Funcions\" a la caixa d'eines i assegureu-vos d'utilitzar-la en el programa."},
"errorQuestionMarksInNumberField":function(d){return "Prova substituint \"???\" per un valor."},
"extraTopBlocks":function(d){return "Tens blocs sense lligams. Volies lligar-los al bloc \"quan s'executa\"?"},
"finalStage":function(d){return "Enhorabona! Has completat l'etapa final."},
"finalStageTrophies":function(d){return "Enhorabona! Has completat l'etapa final i guanyat "+locale.p(d,"numTrophies",0,"ca",{"un":"trofeu","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"finish":function(d){return "Finalitza"},
"generatedCodeInfo":function(d){return "Fins i tot les millors universitats ensenyen programació basada en blocs (per exemple, "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). Però sota el capó, els blocs que tu has reunit també es poden mostrar en JavaScript, la llengua de programació més utilitzada al món:"},
"hashError":function(d){return "Ho sentim, '%1' no correspon amb ningun programa guardat."},
"help":function(d){return "Ajuda"},
"hintTitle":function(d){return "Consell:"},
"jump":function(d){return "salt"},
"levelIncompleteError":function(d){return "Estàs utilitzant tots els tipus de blocs necessaris, però no de la manera correcta."},
"listVariable":function(d){return "llista"},
"makeYourOwnFlappy":function(d){return "Fes el teu propi joc Flappy"},
"missingBlocksErrorMsg":function(d){return "Prova un o més dels blocs de sota per a resoldre aquest puzzle."},
"nextLevel":function(d){return "Enhorabona! Has acabat el Puzzle! "+locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Felicitats! Has acabat el Puzzle "+locale.v(d,"puzzleNumber")+" i has guanyat "+locale.p(d,"numTrophies",0,"ca",{"one":"un trofeu","other":locale.n(d,"numTrophies")+" trofeus"})+"."},
"nextStage":function(d){return "Enhorabona! Heu completat "+locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Enhorabona! Has acabat "+locale.v(d,"stageName")+" i has guanyat "+locale.p(d,"numTrophies",0,"ca",{"un":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"numBlocksNeeded":function(d){return "Enhorabona! Has acabat el Puzzle "+locale.v(d,"puzzleNumber")+". (Tot i que podries haver utilitzat un "+locale.p(d,"numBlocks",0,"ca",{"one":"1 bloc","other":locale.n(d,"numBlocks")+" blocs"})+".)"},
"numLinesOfCodeWritten":function(d){return "Has escrit "+locale.p(d,"numLines",0,"ca",{"one":"1 línia","other":locale.n(d,"numLines")+" línies"})+" de codi!"},
"play":function(d){return "reprodueix"},
"print":function(d){return "Imprimeix"},
"puzzleTitle":function(d){return "Puzzle "+locale.v(d,"puzzle_number")+" de "+locale.v(d,"stage_total")},
"repeat":function(d){return "repeteix"},
"resetProgram":function(d){return "Reiniciar"},
"runProgram":function(d){return "executa"},
"runTooltip":function(d){return "Executa el programa definit per els blocs en l'àrea de treball."},
"score":function(d){return "puntuació"},
"showCodeHeader":function(d){return "Mostra el Codi"},
"showBlocksHeader":function(d){return "Mostra els blocs"},
"showGeneratedCode":function(d){return "Mostra el Codi"},
"stringEquals":function(d){return "cadena=?"},
"subtitle":function(d){return "un entorn de programació visual"},
"textVariable":function(d){return "text"},
"tooFewBlocksMsg":function(d){return "Estàs utilitzant tots els tipus de blocs necessaris, però prova d'utilitzar més d'aquest altre tipus per a completar el puzzle."},
"tooManyBlocksMsg":function(d){return "Aquest puzzle pot ser resolt amb <x id='START_SPAN'/><x id='END_SPAN'/> blocs."},
"tooMuchWork":function(d){return "Em fas fer molta feina! Podries intentar repetir menys vegades?"},
"toolboxHeader":function(d){return "blocs"},
"openWorkspace":function(d){return "Com funciona"},
"totalNumLinesOfCodeWritten":function(d){return "Total de tots els temps: "+locale.p(d,"numLines",0,"ca",{"one":"1 línia","other":locale.n(d,"numLines")+" línies"})+" de codi."},
"tryAgain":function(d){return "Torna a intentar-ho"},
"hintRequest":function(d){return "Veure pista"},
"backToPreviousLevel":function(d){return "Torna al nivell anterior"},
"saveToGallery":function(d){return "Desa a la galeria"},
"savedToGallery":function(d){return "Desat a la galeria!"},
"shareFailure":function(d){return "Ho sentim, no podem compartir aquest programa."},
"workspaceHeader":function(d){return "Uneix els teus blocs aquí: "},
"workspaceHeaderJavaScript":function(d){return "Escriviu el vostre codi JavaScript aquí"},
"infinity":function(d){return "Infinit"},
"rotateText":function(d){return "Gira el teu dispositiu."},
"orientationLock":function(d){return "Desactiva el bloqueig d'orientació en els ajustos del teu dispositiu."},
"wantToLearn":function(d){return "Vols aprendre a programar?"},
"watchVideo":function(d){return "Mira el vídeo"},
"when":function(d){return "quan"},
"whenRun":function(d){return "quan s'executa"},
"tryHOC":function(d){return "Proveu l'Hora de programació"},
"signup":function(d){return "Inscriu-te al curs d'introducció"},
"hintHeader":function(d){return "Aquí tens una pista:"},
"genericFeedback":function(d){return "Observa com has acabat i prova d'arreglar el teu programa."},
"toggleBlocksErrorMsg":function(d){return "You need to correct an error in your program before it can be shown as blocks."},
"defaultTwitterText":function(d){return "Comprova el que he fet"}};