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
"blockDestroyBlock":function(d){return "블록 부수기"},
"blockIf":function(d){return "만약"},
"blockIfLavaAhead":function(d){return "만약 용암이 앞에 있으면"},
"blockMoveForward":function(d){return "앞으로 이동"},
"blockPlaceTorch":function(d){return "횃불 놓기"},
"blockPlaceXAheadAhead":function(d){return "(을)를 앞에"},
"blockPlaceXAheadPlace":function(d){return "놓기:"},
"blockPlaceXPlace":function(d){return "놓기:"},
"blockPlantCrop":function(d){return "작물 심기"},
"blockShear":function(d){return "털 깎기"},
"blockTillSoil":function(d){return "땅 갈기"},
"blockTurnLeft":function(d){return "왼쪽으로 회전"},
"blockTurnRight":function(d){return "오른쪽으로 회전"},
"blockTypeBedrock":function(d){return "기반암"},
"blockTypeBricks":function(d){return "벽돌"},
"blockTypeClay":function(d){return "찰흙"},
"blockTypeClayHardened":function(d){return "단단한 찰흙"},
"blockTypeCobblestone":function(d){return "조약돌"},
"blockTypeDirt":function(d){return "흙"},
"blockTypeDirtCoarse":function(d){return "거친 흙"},
"blockTypeEmpty":function(d){return "빈 블록"},
"blockTypeFarmlandWet":function(d){return "농지"},
"blockTypeGlass":function(d){return "유리"},
"blockTypeGrass":function(d){return "잔디"},
"blockTypeGravel":function(d){return "자갈"},
"blockTypeLava":function(d){return "용암"},
"blockTypeLogAcacia":function(d){return "아카시아 통나무"},
"blockTypeLogBirch":function(d){return "자작나무 통나무"},
"blockTypeLogJungle":function(d){return "정글 통나무"},
"blockTypeLogOak":function(d){return "참나무 통나무"},
"blockTypeLogSpruce":function(d){return "전나무 통나무"},
"blockTypeOreCoal":function(d){return "석탄 광석"},
"blockTypeOreDiamond":function(d){return "다이아몬드 광석"},
"blockTypeOreEmerald":function(d){return "에메랄드 광석"},
"blockTypeOreGold":function(d){return "황금 광석"},
"blockTypeOreIron":function(d){return "철광석"},
"blockTypeOreLapis":function(d){return "청금석 광석"},
"blockTypeOreRedstone":function(d){return "레드스톤 광석"},
"blockTypePlanksAcacia":function(d){return "아카시아 판자"},
"blockTypePlanksBirch":function(d){return "자작나무 판자"},
"blockTypePlanksJungle":function(d){return "정글 판자"},
"blockTypePlanksOak":function(d){return "참나무 판자"},
"blockTypePlanksSpruce":function(d){return "전나무 판자"},
"blockTypeRail":function(d){return "레일"},
"blockTypeSand":function(d){return "모래"},
"blockTypeSandstone":function(d){return "사암"},
"blockTypeStone":function(d){return "돌"},
"blockTypeTnt":function(d){return "폭탄"},
"blockTypeTree":function(d){return "나무"},
"blockTypeWater":function(d){return "물"},
"blockTypeWool":function(d){return "양털"},
"blockWhileXAheadAhead":function(d){return "(을)를 앞에"},
"blockWhileXAheadDo":function(d){return "실행"},
"blockWhileXAheadWhile":function(d){return "반복(~인 동안):"},
"generatedCodeDescription":function(d){return "퍼즐에서 블록을 끌어다 놓으면서, 여러분은 자바 스크립트라는 컴퓨터 언어로 쓰여진 명령어 세트를 만들었습니다. 이 코드들은 컴퓨터에게 화면에 무엇을 보여줄지를 알려줍니다. 여러분이 Minecraft 안에서 보거나 하는 모든 것들도 이러한 컴퓨터 코드들로 시작합니다."},
"houseSelectChooseFloorPlan":function(d){return "집의 평면도를 선택하세요."},
"houseSelectEasy":function(d){return "쉬움"},
"houseSelectHard":function(d){return "어려움"},
"houseSelectLetsBuild":function(d){return "집을 지어요."},
"houseSelectMedium":function(d){return "보통"},
"keepPlayingButton":function(d){return "계속 플레이하기"},
"level10FailureMessage":function(d){return "용암을 덮어서 건너간 후 반대쪽에 있는 철 블록 두 개를 채굴하세요."},
"level11FailureMessage":function(d){return "용암이 앞에 있을 경우 반드시 조약돌을 앞에 놓으세요. 그러면 이 줄에 있는 자원들을 안전하게 채굴할 수 있습니다."},
"level12FailureMessage":function(d){return "레드스톤 블록 3개를 채굴하세요. 집을 지으면서 배운 것과 용암을 피하기 위해 \"만약\" 블록을 쓰면서 배운 것을 기억하면 채굴할 수 있을 겁니다."},
"level13FailureMessage":function(d){return "문에서 지도 끝으로 난 흙길을 따라 \"레일\"을 놓으세요."},
"level1FailureMessage":function(d){return "양에게 다가가려면 명령어를 사용해야 합니다."},
"level1TooFewBlocksMessage":function(d){return "양에게 다가가려면 더 많은 명령어를 사용해보세요."},
"level2FailureMessage":function(d){return "나무를 베려면, 나무 몸통 쪽으로 가서 \"블록 부수기\" 명령을 사용하세요."},
"level2TooFewBlocksMessage":function(d){return "나무를 베려면, 더 많은 명령어를 사용해 보세요. 나무 몸통 쪽으로 가서 \"블록 부수기\" 명령을 사용하세요."},
"level3FailureMessage":function(d){return "두 마리 양에게서 양털을 채집하려면, 각각에게로 가서 \"털 깎기\" 명령을 사용하세요. 양에게 도달하려면 돌기 명령어를 사용해야 한다는 것을 기억하세요."},
"level3TooFewBlocksMessage":function(d){return "두 마리 양에게서 양털을 채집하려면, 더 많은 명령어를 사용해 보세요. 각각에게로 가서 \"털 깎기\" 명령을 사용하세요."},
"level4FailureMessage":function(d){return "세 그루의 나무 몸통 각각에 \"블록 부수기\" 명령을 사용해야 합니다."},
"level5FailureMessage":function(d){return "벽을 지으려면 흙 외곽선에 블록을 놓으세요. 분홍색 \"반복하기\" 명령은 그 안에 놓여진 \"블록 놓기\"나 \"앞으로 이동\" 같은 명령을 실행합니다."},
"level6FailureMessage":function(d){return "퍼즐을 완성하려면 집의 흙 외곽선에 블록을 놓으세요."},
"level7FailureMessage":function(d){return "어두운 경작된 토양의 각 부분에 작물을 놓으려면 \"심기\" 명령을 사용하세요."},
"level8FailureMessage":function(d){return "크리퍼를 건드리면 폭발합니다. 조용히 걸어서 집으로 들어가세요."},
"level9FailureMessage":function(d){return "길을 밝히려면 횃불을 2개 이상 놓고 석탄을 2개 이상 채굴해야 한다는 걸 잊지 마세요."},
"minecraftBlock":function(d){return "블록"},
"nextLevelMsg":function(d){return craft_locale.v(d,"puzzleNumber")+"번 퍼즐을 풀었습니다. 축하해요!"},
"playerSelectChooseCharacter":function(d){return "캐릭터를 선택하세요."},
"playerSelectChooseSelectButton":function(d){return "선택"},
"playerSelectLetsGetStarted":function(d){return "시작해 볼까요."},
"reinfFeedbackMsg":function(d){return "게임으로 돌아가려면 \"계속 플레이하기\"를 누르면 됩니다."},
"replayButton":function(d){return "다시 플레이"},
"selectChooseButton":function(d){return "선택"},
"tooManyBlocksFail":function(d){return craft_locale.v(d,"puzzleNumber")+"번 퍼즐이 완료되었습니다. 축하해요! "+craft_locale.p(d,"numBlocks",0,"ko",{"one":"1 block","other":craft_locale.n(d,"numBlocks")+" blocks"})+"(으)로도 완료가 가능합니다."}};