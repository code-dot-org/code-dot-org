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
"booleanTrue":function(d){return "prawda"},
"booleanFalse":function(d){return "fałsz"},
"blocklyMessage":function(d){return "Blockly"},
"catActions":function(d){return "Działania"},
"catColour":function(d){return "Kolor"},
"catLogic":function(d){return "Logika"},
"catLists":function(d){return "Listy"},
"catLoops":function(d){return "Pętle"},
"catMath":function(d){return "Matematyka"},
"catProcedures":function(d){return "Funkcje"},
"catText":function(d){return "Tekst"},
"catVariables":function(d){return "Zmienne"},
"codeTooltip":function(d){return "Zobacz wygenerowany kod w JavaScript."},
"continue":function(d){return "Dalej"},
"dialogCancel":function(d){return "Anuluj"},
"dialogOK":function(d){return "OK"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionEastLetter":function(d){return "E"},
"directionWestLetter":function(d){return "W"},
"end":function(d){return "koniec"},
"emptyBlocksErrorMsg":function(d){return "Blok \"powtarzaj\" lub blok \"jeśli\" muszą zawierać inne bloki, by poprawnie działać. Upewnij się, czy wewnętrzny blok pasuje do zewnętrznego."},
"emptyFunctionBlocksErrorMsg":function(d){return "Blok funkcji musi zawierać inne bloki, by działał."},
"errorEmptyFunctionBlockModal":function(d){return "Wewnątrz definicji Twojej funkcji powinny znajdować się bloki. Kliknij przycisk Edytuj i przeciągnij bloki do wnętrza zielonego bloku."},
"errorIncompleteBlockInFunction":function(d){return "Kliknij przycisk Edytuj, aby upewnić się, że wewnątrz definicji Twojej funkcji nie brakuje żadnego bloku."},
"errorParamInputUnattached":function(d){return "Pamiętaj, aby dołączyć blok do każdego parametru wejścia w bloku funkcji w Twoim obszarze roboczym."},
"errorUnusedParam":function(d){return "Dodałeś blok parametru, ale nie użyłeś go w definicji. Upewnij się, że używasz swojego parametru klikając na przycisk Editi i umieszczając blok parametru wewnątrz bloku zielonego."},
"errorRequiredParamsMissing":function(d){return "Utwórz parametr dla swojej funkcji klikając na przycisk Edytuj i dodając niezbędne parametry. Przeciągnij nowe bloki parametrów do definicji swojej funkcji."},
"errorUnusedFunction":function(d){return "Utworzyłeś funkcję, ale nigdy nie użyłeś jej w swoim obszarze roboczym! W przyborniku kliknij na Funkcje i upewnij się, że używasz ich w swoim programie."},
"errorQuestionMarksInNumberField":function(d){return "Spróbuj zastąpić ??? wartością."},
"extraTopBlocks":function(d){return "Masz niezałączone bloki. Czy chcesz je załączyć do bloku \"po uruchomieniu\"?"},
"finalStage":function(d){return "Gratulacje! Ukończyłeś ostatni etap."},
"finalStageTrophies":function(d){return "Gratulacje! Ukończyłeś ostatni etap i wygrałeś "+locale.p(d,"numTrophies",0,"pl",{"one":"trofeum","other":locale.n(d,"numTrophies")+" trofea"})+"."},
"finish":function(d){return "Koniec"},
"generatedCodeInfo":function(d){return "Nawet najlepsze uczelnie uczą kodowania opartego o bloki (np. "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). Ale bloki, które użyłeś, można również znaleźć w JavaScript, w jednym z najpowszechniej stosowanym języku programowania na świecie:"},
"hashError":function(d){return "Przepraszamy, '%1' nie odpowiada żadnemu zapisanemu programowi."},
"help":function(d){return "Pomoc"},
"hintTitle":function(d){return "Podpowiedź:"},
"jump":function(d){return "skocz"},
"levelIncompleteError":function(d){return "Używasz wszystkich niezbędnych rodzajów bloków, ale w niewłaściwy sposób."},
"listVariable":function(d){return "lista"},
"makeYourOwnFlappy":function(d){return "Utwórz swoją grę Flappy"},
"missingBlocksErrorMsg":function(d){return "Spróbuj użyć jednego lub więcej poniższych bloków, by rozwiązać tę łamigłówkę."},
"nextLevel":function(d){return "Gratulacje! Rozwiązałeś Łamigłówkę nr "+locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Gratulacje! Rozwiązałeś Łamigłówkę nr "+locale.v(d,"puzzleNumber")+" i wygrałeś "+locale.p(d,"numTrophies",0,"pl",{"one":"trofeum","other":locale.n(d,"numTrophies")+" trofea"})+"."},
"nextStage":function(d){return "Gratulacje! Ukończyłeś etap "+locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Gratulacje! Ukończyłeś etap "+locale.v(d,"stageName")+" i wygrałeś "+locale.p(d,"numTrophies",0,"pl",{"one":"trofeum","other":locale.n(d,"numTrophies")+" trofea"})+"."},
"numBlocksNeeded":function(d){return "Gratulacje! Rozwiązałeś Łamigłówkę nr "+locale.v(d,"puzzleNumber")+". (Jednakże, mogłeś użyć jedynie "+locale.p(d,"numBlocks",0,"pl",{"one":"blok","other":locale.n(d,"numBlocks")+" bloki"})+")"},
"numLinesOfCodeWritten":function(d){return "Właśnie napisałeś "+locale.p(d,"numLines",0,"pl",{"one":"linię","other":locale.n(d,"numLines")+" linii"})+" kodu!"},
"play":function(d){return "zagraj"},
"print":function(d){return "Drukuj"},
"puzzleTitle":function(d){return "Łamigłówka "+locale.v(d,"puzzle_number")+" z "+locale.v(d,"stage_total")},
"repeat":function(d){return "powtarzaj"},
"resetProgram":function(d){return "Zresetuj"},
"runProgram":function(d){return "Uruchom"},
"runTooltip":function(d){return "Uruchom program zdefiniowany za pomocą bloków w miejscu roboczym."},
"score":function(d){return "wynik"},
"showCodeHeader":function(d){return "Pokaż Kod"},
"showBlocksHeader":function(d){return "Pokaż Bloki"},
"showGeneratedCode":function(d){return "Pokaż kod"},
"stringEquals":function(d){return "łańcuch=?"},
"subtitle":function(d){return "środowisko wizualnego programowania"},
"textVariable":function(d){return "tekst"},
"tooFewBlocksMsg":function(d){return "Używasz wszystkich wymaganych rodzajów bloków, ale spróbuj użyć ich więcej, aby ukończyć łamigłówkę."},
"tooManyBlocksMsg":function(d){return "Ta łamigłówka może być rozwiązana przy pomocy bloków <x id='START_SPAN'/><x id='END_SPAN'/>."},
"tooMuchWork":function(d){return "Spowodowałeś, że miałem dużo pracy. Czy możesz zmniejszyć liczbę powtórzeń?"},
"toolboxHeader":function(d){return "Bloki"},
"openWorkspace":function(d){return "Jak to Działa"},
"totalNumLinesOfCodeWritten":function(d){return "Sumaryczny wynik: "+locale.p(d,"numLines",0,"pl",{"one":"1 linia","other":locale.n(d,"numLines")+" linii"})+" kodu."},
"tryAgain":function(d){return "Spróbuj ponownie"},
"hintRequest":function(d){return "Zobacz wskazówkę"},
"backToPreviousLevel":function(d){return "Wróć do poprzedniego poziomu"},
"saveToGallery":function(d){return "Zapisz w galerii"},
"savedToGallery":function(d){return "Zapisane w galerii!"},
"shareFailure":function(d){return "Przepraszamy, ale nie możemy udostępnić tego programu."},
"workspaceHeader":function(d){return "Połącz swoje bloki tutaj: "},
"workspaceHeaderJavaScript":function(d){return "Wpisz tutaj swój kod w JavaScript"},
"infinity":function(d){return "Nieskończoność"},
"rotateText":function(d){return "Obróć swoje urządzenie."},
"orientationLock":function(d){return "Wyłącz blokadę orientacji w ustawieniach urządzenia."},
"wantToLearn":function(d){return "Czy chcesz nauczyć się kodowania (programowania)?"},
"watchVideo":function(d){return "Obejrzyj wideo"},
"when":function(d){return "kiedy"},
"whenRun":function(d){return "po uruchomieniu"},
"tryHOC":function(d){return "Weź udział w Godzinie Kodowania (the Hour of Code)"},
"signup":function(d){return "Zapisz się na kurs wprowadzający"},
"hintHeader":function(d){return "Oto wskazówka:"},
"genericFeedback":function(d){return "Zobacz jak zakończyłeś i spróbuj naprawić swój program."},
"toggleBlocksErrorMsg":function(d){return "You need to correct an error in your program before it can be shown as blocks."},
"defaultTwitterText":function(d){return "Sprawdź, co zrobiłem"}};