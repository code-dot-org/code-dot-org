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
"and":function(d){return "şi"},
"booleanTrue":function(d){return "adevărat"},
"booleanFalse":function(d){return "fals"},
"blocklyMessage":function(d){return "Blockly"},
"catActions":function(d){return "Acţiuni"},
"catColour":function(d){return "Culoare"},
"catLogic":function(d){return "Logică"},
"catLists":function(d){return "Liste"},
"catLoops":function(d){return "Bucle"},
"catMath":function(d){return "Matematică"},
"catProcedures":function(d){return "Funcţii"},
"catText":function(d){return "text"},
"catVariables":function(d){return "Variabile"},
"codeTooltip":function(d){return "Vezi codul JavaScript generat."},
"continue":function(d){return "Continuă"},
"dialogCancel":function(d){return "Anulează"},
"dialogOK":function(d){return "OK"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionEastLetter":function(d){return "E"},
"directionWestLetter":function(d){return "V"},
"end":function(d){return "șfârșit"},
"emptyBlocksErrorMsg":function(d){return "Blocul \"Repetă\" sau \"Dacă\" trebuie să aibe alte blocuri în interiorul său  pentru a putea funcționa. Asigură-te că blocul interior se încadrează corect în blocul care îl conține."},
"emptyFunctionBlocksErrorMsg":function(d){return "Blocul de funcţie trebuie să aibă alte blocuri în interior ca să funcţioneze."},
"errorEmptyFunctionBlockModal":function(d){return "În interiorul definiției unei funcții trebuie să includem blocuri. Dați clic pe ”editare” și trageți blocuri în interiorul blocului verde."},
"errorIncompleteBlockInFunction":function(d){return "Faceţi clic pe \"editare\" pentru a vă asigura că nu aveţi blocuri lipsă în interiorul definiţiei funcţiei dvs."},
"errorParamInputUnattached":function(d){return "Amintiţi-vă să ataşați un bloc pentru fiecare parametru de intrare în blocul funcţiei din spaţiul de lucru."},
"errorUnusedParam":function(d){return "Aţi adăugat un bloc de parametri, dar nu l-ați utilizat în definiţie. Asiguraţi-vă de utilizarea parametrului dvs. făcând clic pe \"Editaţi\" şi plasând blocul parametru în interiorul blocului verde."},
"errorRequiredParamsMissing":function(d){return "Creaţi un parametru pentru funcţia dvs. făcând clic pe \"Editaţi\" şi adăugând parametrii necesari. Glisaţi noile blocuri parametru în definiţia funcţiei dvs."},
"errorUnusedFunction":function(d){return "Ați creat o funcţie, dar nu ați folosit-o în spaţiul de lucru! Faceţi clic pe \"Funcţii\" în caseta de instrumente şi asiguraţi-vă că o folosiţi în programul dvs."},
"errorQuestionMarksInNumberField":function(d){return "Încercaţi să înlocuiți \"???\" cu o valoare."},
"extraTopBlocks":function(d){return "Ai blocuri neatașate. Ai vrut să ataşezi acestea la blocul \"atunci când rulaţi\"?"},
"finalStage":function(d){return "Felicitări! Ai terminat ultima etapă."},
"finalStageTrophies":function(d){return "Felicitări! Ai terminat etapa finală şi ai câştigat "+locale.p(d,"numTrophies",0,"ro",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"finish":function(d){return "Sfârsit"},
"generatedCodeInfo":function(d){return "Chiar și în universităţi de top se predă programarea bazată pe blocuri de coduri (de exemplu, "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). Dar în esență, blocurile de cod pe care le-ai compus pot fi de asemenea afișate în JavaScript, limbajul de programare cel mai utilizat din lume:"},
"hashError":function(d){return "Ne pare rău, '%1' nu corespunde cu nici un program salvat."},
"help":function(d){return "Ajutor"},
"hintTitle":function(d){return "Sugestie:"},
"jump":function(d){return "sari"},
"levelIncompleteError":function(d){return "Utilizezi toate tipurile de blocuri necesare, dar nu așa cum trebuie."},
"listVariable":function(d){return "listă"},
"makeYourOwnFlappy":function(d){return "Crează-ți propriul tău joc Flappy"},
"missingBlocksErrorMsg":function(d){return "Încearcă unul sau mai multe blocuri de mai jos pentru a rezolva acest puzzle."},
"nextLevel":function(d){return "Felicitări! Ai terminat Puzzle-ul "+locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Felicitări! Ai terminat Puzzle-ul "+locale.v(d,"puzzleNumber")+" și ai câștigat "+locale.p(d,"numTrophies",0,"ro",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"nextStage":function(d){return "Felicitări! Ai terminat "+locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Felicitări! Ai finalizat Etapa "+locale.v(d,"stageName")+" și ai câștigat "+locale.p(d,"numTrophies",0,"ro",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"numBlocksNeeded":function(d){return "Felicităr! Ai terminat Puzzle-ul "+locale.v(d,"puzzleNumber")+". (Însă, ai fi putut folosi doar "+locale.p(d,"numBlocks",0,"ro",{"one":"1 block","other":locale.n(d,"numBlocks")+" blocks"})+".)"},
"numLinesOfCodeWritten":function(d){return "Ai scris doar "+locale.p(d,"numLines",0,"ro",{"one":"1 line","other":locale.n(d,"numLines")+" lines"})+" de cod!"},
"play":function(d){return "joacă"},
"print":function(d){return "Tipărire"},
"puzzleTitle":function(d){return "Puzzle "+locale.v(d,"puzzle_number")+" din "+locale.v(d,"stage_total")},
"repeat":function(d){return "repetă"},
"resetProgram":function(d){return "Resetează"},
"runProgram":function(d){return "Rulează"},
"runTooltip":function(d){return "Rulează programul definit de blocuri în spațiul de lucru."},
"score":function(d){return "scor"},
"showCodeHeader":function(d){return "Arată codul"},
"showBlocksHeader":function(d){return "Afișează blocurile"},
"showGeneratedCode":function(d){return "Arată codul"},
"stringEquals":function(d){return "şir =?"},
"subtitle":function(d){return "un mediu de programare vizual"},
"textVariable":function(d){return "scris"},
"tooFewBlocksMsg":function(d){return "Folosești toate tipurile necesare de blocuri, dar încearcă să utilizezi mai multe din aceste tipuri de blocuri pentru a completa puzzle-ul."},
"tooManyBlocksMsg":function(d){return "Acest puzzle poate fi rezolvat cu blocuri <x id='START_SPAN'/><x id='END_SPAN'/>."},
"tooMuchWork":function(d){return "M-ai făcut să lucrez foarte mult! Ai putea să încerci să repeți de mai puține ori?"},
"toolboxHeader":function(d){return "blocuri"},
"openWorkspace":function(d){return "Cum funcţionează"},
"totalNumLinesOfCodeWritten":function(d){return "Totalul all-time: "+locale.p(d,"numLines",0,"ro",{"one":"1 line","other":locale.n(d,"numLines")+" lines"})+" de cod."},
"tryAgain":function(d){return "Încearcă din nou"},
"hintRequest":function(d){return "Dă un indiciu"},
"backToPreviousLevel":function(d){return "Înapoi la nivelul anterior"},
"saveToGallery":function(d){return "Salvare în galerie"},
"savedToGallery":function(d){return "Salvat în galerie!"},
"shareFailure":function(d){return "Ne pare rau, nu putem să distribuim acest program."},
"workspaceHeader":function(d){return "Asamblează-ţi blocurile aici: "},
"workspaceHeaderJavaScript":function(d){return "Tastează codul JavaScript aici"},
"infinity":function(d){return "Infinit"},
"rotateText":function(d){return "Rotește dispozitivul tău."},
"orientationLock":function(d){return "Oprește blocarea de orientare în setările dispozitivului."},
"wantToLearn":function(d){return "Vrei să înveți să codezi?"},
"watchVideo":function(d){return "Urmărește clipul video"},
"when":function(d){return "când"},
"whenRun":function(d){return "când rulezi"},
"tryHOC":function(d){return "Încearcă Ora de Cod"},
"signup":function(d){return "Înscrie-te la cursul introductiv"},
"hintHeader":function(d){return "Iată un sfat:"},
"genericFeedback":function(d){return "Vezi cum se termină şi încearcă să-ți corectezi programul."},
"toggleBlocksErrorMsg":function(d){return "You need to correct an error in your program before it can be shown as blocks."},
"defaultTwitterText":function(d){return "Verifică ceea ce am creat"}};