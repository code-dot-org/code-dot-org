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
"blockDestroyBlock":function(d){return "zniszcz blok"},
"blockIf":function(d){return "jeśli"},
"blockIfLavaAhead":function(d){return "jeśli lawa z przodu"},
"blockMoveForward":function(d){return "idź do przodu"},
"blockPlaceTorch":function(d){return "umieść pochodnię"},
"blockPlaceXAheadAhead":function(d){return "z przodu"},
"blockPlaceXAheadPlace":function(d){return "umieść"},
"blockPlaceXPlace":function(d){return "umieść"},
"blockPlantCrop":function(d){return "uprawa roślin"},
"blockShear":function(d){return "nożyce"},
"blockTillSoil":function(d){return "gleba"},
"blockTurnLeft":function(d){return "skręć w lewo"},
"blockTurnRight":function(d){return "skręć w prawo"},
"blockTypeBedrock":function(d){return "skała macierzysta"},
"blockTypeBricks":function(d){return "cegły"},
"blockTypeClay":function(d){return "glina"},
"blockTypeClayHardened":function(d){return "utwardzona glina"},
"blockTypeCobblestone":function(d){return "bruk"},
"blockTypeDirt":function(d){return "ziemia"},
"blockTypeDirtCoarse":function(d){return "jałowa ziemia"},
"blockTypeEmpty":function(d){return "pusta"},
"blockTypeFarmlandWet":function(d){return "pole uprawne"},
"blockTypeGlass":function(d){return "szkło"},
"blockTypeGrass":function(d){return "trawa"},
"blockTypeGravel":function(d){return "żwir"},
"blockTypeLava":function(d){return "lawa"},
"blockTypeLogAcacia":function(d){return "bal akacji"},
"blockTypeLogBirch":function(d){return "bal brzeziny"},
"blockTypeLogJungle":function(d){return "bal drewna egzotycznego"},
"blockTypeLogOak":function(d){return "bal dębu"},
"blockTypeLogSpruce":function(d){return "bal świerku"},
"blockTypeOreCoal":function(d){return "ruda węgla"},
"blockTypeOreDiamond":function(d){return "ruda diamentowa"},
"blockTypeOreEmerald":function(d){return "ruda szmaragdowa"},
"blockTypeOreGold":function(d){return "ruda złota"},
"blockTypeOreIron":function(d){return "ruda żelaza"},
"blockTypeOreLapis":function(d){return "ruda lapis lazuli"},
"blockTypeOreRedstone":function(d){return "ruda czerwonego pyłu"},
"blockTypePlanksAcacia":function(d){return "deski akacjowe"},
"blockTypePlanksBirch":function(d){return "deski brzeziny"},
"blockTypePlanksJungle":function(d){return "deski drewna egzotycznego"},
"blockTypePlanksOak":function(d){return "deski dębowe"},
"blockTypePlanksSpruce":function(d){return "deski świerkowe"},
"blockTypeRail":function(d){return "tory"},
"blockTypeSand":function(d){return "piasek"},
"blockTypeSandstone":function(d){return "piaskowiec"},
"blockTypeStone":function(d){return "kamień"},
"blockTypeTnt":function(d){return "TNT"},
"blockTypeTree":function(d){return "drzewo"},
"blockTypeWater":function(d){return "woda"},
"blockTypeWool":function(d){return "wełna"},
"blockWhileXAheadAhead":function(d){return "z przodu"},
"blockWhileXAheadDo":function(d){return "wykonaj"},
"blockWhileXAheadWhile":function(d){return "dopóki"},
"generatedCodeDescription":function(d){return "Przeciągając i umieszczając bloki w tej układance tworzysz zestaw instrukcji w języku komputerowym JavaScript. Kod mówi komputerowi, co ma wyświetlać na ekranie. Cokolwiek widzisz i robisz w Minecraft, zaczyna się liniami kodu, jak te."},
"houseSelectChooseFloorPlan":function(d){return "Wybierz plan podłogi dla swojego domu."},
"houseSelectEasy":function(d){return "Łatwy"},
"houseSelectHard":function(d){return "Trudny"},
"houseSelectLetsBuild":function(d){return "Wybudujmy dom."},
"houseSelectMedium":function(d){return "Średni"},
"keepPlayingButton":function(d){return "Graj dalej"},
"level10FailureMessage":function(d){return "Aby przejść przykryj lawę, a potem po drugiej stronie wykop dwa bloki żelaza."},
"level11FailureMessage":function(d){return "Upewnij się, że rozłożysz bruk jeśli natkniesz się na lawę z przodu. To pozwoli Ci bezpiecznie kopać w tym rzędzie surowców."},
"level12FailureMessage":function(d){return "Wykop 3 bloki kamienia czerwonego pyłu. To łączy to, czego nauczyłeś się z budowy swojego domu oraz używania instrukcji 'jeśli' w celu uniknięcia wpadnięcia do lawy."},
"level13FailureMessage":function(d){return "Umieść tory wzdłuż ścieżki pyłu prowadzącej od drzwi Twojego domu do krawędzi mapy."},
"level1FailureMessage":function(d){return "Aby dotrzeć do owcy musisz użyć poleceń."},
"level1TooFewBlocksMessage":function(d){return "Spróbuj użyć więcej poleceń, aby dotrzeć do owcy."},
"level2FailureMessage":function(d){return "Aby ściąć drzewo, musisz podejść do pnia i użyć polecenia \"zniszcz blok\"."},
"level2TooFewBlocksMessage":function(d){return "Aby ściąć drzewo, spróbuj użyć więcej poleceń. Podejdź do pnia i użyj polecenia 'zniszcz blok'."},
"level3FailureMessage":function(d){return "Aby pozyskać wełnę z obydwu owiec podejdź do każdej z nich i użyj polecenia 'nożyce'. Pamietaj o użyciu polecen 'obrót', aby dosięgnąć owiec."},
"level3TooFewBlocksMessage":function(d){return "Spróbuj użyć więcej poleceń, aby pozyskać wełnę z obydwu owiec. Podejdź do każdej z nich i użyj polecenia 'nożyce'."},
"level4FailureMessage":function(d){return "Musisz użyć polecenia \"zniszcz blok\" przy każdym z pni trzech drzew."},
"level5FailureMessage":function(d){return "Aby zbudować mur umieść swoje bloki na obrysie ziemi. Różowe polecenie \"powtórz\" wykona polecenia, które zostaną w nim umieszczone - takie jak na przykład \"umieść blok\" lub \"idź naprzód\"."},
"level6FailureMessage":function(d){return "Aby dokończyć rozwiązanie tej łamigłówki umieść bloki na obrysie domu."},
"level7FailureMessage":function(d){return "Użyj polecenia \"zasadź\", aby zasiać nasiona na każdym kawałku ciemnej ziemi."},
"level8FailureMessage":function(d){return "Jeśli dotkniesz creepera to wybuchnie. Przemykaj dookoła nich, aby dostać się do Twojego domu."},
"level9FailureMessage":function(d){return "Nie zapomnij umieścić co najmniej dwóch pochodni, aby oświetlić sobie drogę ORAZ wykop co namniej 2 bloki węgla."},
"minecraftBlock":function(d){return "blok"},
"nextLevelMsg":function(d){return "Łamigłówka "+craft_locale.v(d,"puzzleNumber")+" ukończona. Gratulacje!"},
"playerSelectChooseCharacter":function(d){return "Wybierz postać."},
"playerSelectChooseSelectButton":function(d){return "Wybierz"},
"playerSelectLetsGetStarted":function(d){return "Zacznijmy."},
"reinfFeedbackMsg":function(d){return "Możesz nacisnąć przycisk \"Graj dalej\", aby kontynuować swoją grę."},
"replayButton":function(d){return "Powtórka"},
"selectChooseButton":function(d){return "Wybierz"},
"tooManyBlocksFail":function(d){return "Łamigłówka "+craft_locale.v(d,"puzzleNumber")+" ukończona. Gratulacje! Można ją również ukończyć z "+craft_locale.p(d,"numBlocks",0,"pl",{"one":"1 block","other":craft_locale.n(d,"numBlocks")+" blocks"})+"."}};