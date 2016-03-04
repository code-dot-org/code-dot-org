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
"blockDestroyBlock":function(d){return "uništiti blok"},
"blockIf":function(d){return "ako"},
"blockIfLavaAhead":function(d){return "ako lava ispred"},
"blockMoveForward":function(d){return "idi naprijed"},
"blockPlaceTorch":function(d){return "postavi baklju"},
"blockPlaceXAheadAhead":function(d){return "naprijed"},
"blockPlaceXAheadPlace":function(d){return "postaviti"},
"blockPlaceXPlace":function(d){return "postaviti"},
"blockPlantCrop":function(d){return "zasadite usjev"},
"blockShear":function(d){return "ošišaj"},
"blockTillSoil":function(d){return "prekopaj tlo"},
"blockTurnLeft":function(d){return "okreni lijevo"},
"blockTurnRight":function(d){return "okreni desno"},
"blockTypeBedrock":function(d){return "temelj"},
"blockTypeBricks":function(d){return "cigle"},
"blockTypeClay":function(d){return "glina"},
"blockTypeClayHardened":function(d){return "pečena glina"},
"blockTypeCobblestone":function(d){return "kocka kaldrme"},
"blockTypeDirt":function(d){return "zemlja"},
"blockTypeDirtCoarse":function(d){return "gruba zemlja"},
"blockTypeEmpty":function(d){return "prazno"},
"blockTypeFarmlandWet":function(d){return "obrađena zemlja"},
"blockTypeGlass":function(d){return "staklo"},
"blockTypeGrass":function(d){return "trava"},
"blockTypeGravel":function(d){return "šljunak"},
"blockTypeLava":function(d){return "lava"},
"blockTypeLogAcacia":function(d){return "cjepanica akacije"},
"blockTypeLogBirch":function(d){return "cjepanica breze"},
"blockTypeLogJungle":function(d){return "džungla daska"},
"blockTypeLogOak":function(d){return "cjepanica hrasta"},
"blockTypeLogSpruce":function(d){return "cjepanica smrekovine"},
"blockTypeOreCoal":function(d){return "ruda ugljena"},
"blockTypeOreDiamond":function(d){return "ruda dijamanta"},
"blockTypeOreEmerald":function(d){return "ruda smaragda"},
"blockTypeOreGold":function(d){return "ruda zlata"},
"blockTypeOreIron":function(d){return "ruda željeza"},
"blockTypeOreLapis":function(d){return "ruda lazulita"},
"blockTypeOreRedstone":function(d){return "ruda crvenog kamena"},
"blockTypePlanksAcacia":function(d){return "daska akacije"},
"blockTypePlanksBirch":function(d){return "daska breze"},
"blockTypePlanksJungle":function(d){return "džungla daske"},
"blockTypePlanksOak":function(d){return "daska hrasta"},
"blockTypePlanksSpruce":function(d){return "daska smrekovine"},
"blockTypeRail":function(d){return "tračnica"},
"blockTypeSand":function(d){return "pijesak"},
"blockTypeSandstone":function(d){return "pješčani kamen"},
"blockTypeStone":function(d){return "kamen"},
"blockTypeTnt":function(d){return "dinamit"},
"blockTypeTree":function(d){return "drvo"},
"blockTypeWater":function(d){return "voda"},
"blockTypeWool":function(d){return "vuna"},
"blockWhileXAheadAhead":function(d){return "naprijed"},
"blockWhileXAheadDo":function(d){return "napravi"},
"blockWhileXAheadWhile":function(d){return "dok"},
"generatedCodeDescription":function(d){return "Povlačenjem i postavljanjem blokova u ovoj zagonetki, stvorit ćete skup uputa u računalnom jeziku Javascript. Ovaj kod govori računalu što će prikazati na zaslonu. Sve što vidite i radite u Minecraftu također počinje sa linijama računalnog koda poput ovih."},
"houseSelectChooseFloorPlan":function(d){return "Odaberite tlocrt za svoju kuću."},
"houseSelectEasy":function(d){return "Lagano"},
"houseSelectHard":function(d){return "Teško"},
"houseSelectLetsBuild":function(d){return "Ajmo sagraditi kuću."},
"houseSelectMedium":function(d){return "Srednje"},
"keepPlayingButton":function(d){return "Nastaviti igrati"},
"level10FailureMessage":function(d){return "Pokrij lavu da prođeš preko, onda iskopaj dva željezna bloka na drugoj strani."},
"level11FailureMessage":function(d){return "Postavi kamen ako je lava naprijed. To će ti dopustit da sigurno iskopaš ovaj red resursa."},
"level12FailureMessage":function(d){return "Iskopajte 3 redstone bloka. Ovime kombinirajte ono što ste naučili gradeći svoju kuću i korištenjem \"ako(if)\" izraza kako bi izbjegli pad u lavu."},
"level13FailureMessage":function(d){return "Postavi \"tračnice\" uz zemljani put koji vodi od tvojih vrata do kraja mape."},
"level1FailureMessage":function(d){return "Moraš koristiti komande da dohodaš do ovce."},
"level1TooFewBlocksMessage":function(d){return "Probaj koristiti još komandi da dođeš do ovce."},
"level2FailureMessage":function(d){return "Kako biste srušli drvo, hodajte do stabla i upotrijebite naredbu \"uništi blok\"."},
"level2TooFewBlocksMessage":function(d){return "Pokušaj koristiti više nardbi za nasjeckati drvo. Dođi do debla i koristi \"uništi blok\" naredbu."},
"level3FailureMessage":function(d){return "Za prikupiti vunu od obadvije ovce, potrebno je doći do svake i koristiti naredbu \"šišanje\". Koristite naredbu za okrenuti se kako bi došli do ovce."},
"level3TooFewBlocksMessage":function(d){return "Pokušajte koristiti više naredbi kako bi prikupili vunu od ovaca. Dođite do svake od njih i koristite naredbu \"šišaj\"."},
"level4FailureMessage":function(d){return "Morate koristiti \"uništi blok\" naredbu na svakom od tri debla."},
"level5FailureMessage":function(d){return "Postavite svoje blokove u blatni dio kako bi izgradili zid. Roza \"ponovi\" naredba će pokrenuti naredbe unutar nje, poput \"postavi blok\" i \"naprijed\"."},
"level6FailureMessage":function(d){return "Postavite blok na blatnu konturu kuće kako bi završili zadatak."},
"level7FailureMessage":function(d){return "Koristite \"zasadi\" naredbu kako bi posadili usjev na svaki komad uzoranog tla."},
"level8FailureMessage":function(d){return "Ako dodaknete \"creepera\", eksplodirati će. Šunjajte se oko njih i uđite u svoju kuću."},
"level9FailureMessage":function(d){return "Ne zaboravite postaviti najmanje 2 lampe da bi osvjetlili put i izrudarite najmanje 2 ugljena."},
"minecraftBlock":function(d){return "blok"},
"nextLevelMsg":function(d){return "Zagonetka "+craft_locale.v(d,"puzzleNumber")+" dovršena. Čestitamo!"},
"playerSelectChooseCharacter":function(d){return "Odaberite svoj lik."},
"playerSelectChooseSelectButton":function(d){return "Odaberi"},
"playerSelectLetsGetStarted":function(d){return "Hajde da počnemo."},
"reinfFeedbackMsg":function(d){return "Možete izabrati \"Nastavi igrati\" da bi se vratili u svoju igru."},
"replayButton":function(d){return "Ponovi"},
"selectChooseButton":function(d){return "Odaberi"},
"tooManyBlocksFail":function(d){return "Zagonetka "+craft_locale.v(d,"puzzleNumber")+" je dovršena. Čestitam! Također je moguće završiti ju sa "+craft_locale.p(d,"numBlocks",0,"hr",{"jedna":"jednom kockom","other":craft_locale.n(d,"numBlocks")+" kocki"})+"."}};