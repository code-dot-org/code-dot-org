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
"blockDestroyBlock":function(d){return "블록 파괴"},
"blockIf":function(d){return "만약"},
"blockIfLavaAhead":function(d){return "만약 용암이 앞에 있다면"},
"blockMoveForward":function(d){return "앞으로 이동"},
"blockPlaceTorch":function(d){return "횃불 놓기"},
"blockPlaceXAheadAhead":function(d){return "앞에"},
"blockPlaceXAheadPlace":function(d){return "놓기"},
"blockPlaceXPlace":function(d){return "놓기"},
"blockPlantCrop":function(d){return "식물 심기"},
"blockShear":function(d){return "털깎기"},
"blockTillSoil":function(d){return "흙까지"},
"blockTurnLeft":function(d){return "왼쪽으로 회전"},
"blockTurnRight":function(d){return "오른쪽으로 회전"},
"blockTypeBedrock":function(d){return "기반암"},
"blockTypeBricks":function(d){return "벽돌"},
"blockTypeClay":function(d){return "찰흙"},
"blockTypeClayHardened":function(d){return "단단한 찰흙"},
"blockTypeCobblestone":function(d){return "자갈"},
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
"blockTypeLogOak":function(d){return "떡갈나무 통나무"},
"blockTypeLogSpruce":function(d){return "전나무 통나무"},
"blockTypeOreCoal":function(d){return "석탄 광석"},
"blockTypeOreDiamond":function(d){return "다이아몬드 광석"},
"blockTypeOreEmerald":function(d){return "에메랄드 광석"},
"blockTypeOreGold":function(d){return "금 광석"},
"blockTypeOreIron":function(d){return "철 광석"},
"blockTypeOreLapis":function(d){return "돌 광석"},
"blockTypeOreRedstone":function(d){return "레드스톤 광석"},
"blockTypePlanksAcacia":function(d){return "아카시아 판자"},
"blockTypePlanksBirch":function(d){return "자작나무 판자"},
"blockTypePlanksJungle":function(d){return "정글나무 판자"},
"blockTypePlanksOak":function(d){return "참나무 판자"},
"blockTypePlanksSpruce":function(d){return "전나무 판자"},
"blockTypeRail":function(d){return "레일"},
"blockTypeSand":function(d){return "모래"},
"blockTypeSandstone":function(d){return "사암"},
"blockTypeStone":function(d){return "돌"},
"blockTypeTnt":function(d){return "TNT"},
"blockTypeTree":function(d){return "나무"},
"blockTypeWater":function(d){return "물"},
"blockTypeWool":function(d){return "양털"},
"blockWhileXAheadAhead":function(d){return "앞에"},
"blockWhileXAheadDo":function(d){return "실행"},
"blockWhileXAheadWhile":function(d){return "반복(~인 동안):"},
"generatedCodeDescription":function(d){return "블록들을 드래그해서 가져다 붙이는 것은, 자바스크립트(Javascript) 라는 컴퓨터 프로그래밍 언어로 명령어들을 만들어낸 것과 같습니다. 이러한 코드는 컴퓨터가 화면에 표시해야할 것들을 컴퓨터에게 말해주는 것입니다. 여러분들이 마인크래프트(Minecraft) 에서 보고, 행동하거나 작업하는 모든 것들도 이런 컴퓨터 코드들을 만들어내는 것으로 부터 시작됩니다."},
"houseSelectChooseFloorPlan":function(d){return "집 바닥을 위한 계획을 선택하세요."},
"houseSelectEasy":function(d){return "초급"},
"houseSelectHard":function(d){return "고급"},
"houseSelectLetsBuild":function(d){return "집을 지어 봅시다."},
"houseSelectMedium":function(d){return "중간"},
"keepPlayingButton":function(d){return "계속 실행"},
"level10FailureMessage":function(d){return "건너갈 수 있도록 용암을 덮은 후, 건너 편에서 2개의 철 블록을 캐내세요."},
"level11FailureMessage":function(d){return "앞에 용암이 있으면 자갈을 깔아 주세요. 그렇게 하면 이 가로줄의 자원들을 안전하게 캐낼 수 있습니다."},
"level12FailureMessage":function(d){return "3개의 레드스톤 블록을 캐내세요. 집을 지으면서 배웠던 것과 \"만약\" 명령문을 이용해 떨어지는 용암을 피하세요."},
"level13FailureMessage":function(d){return "집 앞에서부터 지도의 끝까지 연결되어있는 흙 길을 따라 \"레일\"을 놓으세요."},
"level1FailureMessage":function(d){return "양에게 걸어가기 위해서는 명령들을 사용해야 합니다."},
"level1TooFewBlocksMessage":function(d){return "양에게 걸어가기 위해 더 많은 명령들을 사용해 보세요."},
"level2FailureMessage":function(d){return "나무를 얻기 위해서는, 나무 기둥으로 간 다음에 \"블록 파괴\" 명령을 사용하세요."},
"level2TooFewBlocksMessage":function(d){return "더 많은 나무를 얻기 위해서 더 많은 명령들을 사용해보세요. 나무 기둥으로 이동한 다음에 \"블록 파괴\" 명령을 사용해야 합니다."},
"level3FailureMessage":function(d){return "양으로 부터 양털을 얻으려면, 양에게 걸어간 후에 \"털 깎기\" 명령을 사용하면 됩니다. 양에게 다가가기 위해서는 회전 명령어를 사용해야 합니다."},
"level3TooFewBlocksMessage":function(d){return "더 많은 양털을 얻기 위해 더 많은 명령어들을 사용해 보세요. 양에게 다가간 후 \"털 깎기\" 명령어를 사용하면 됩니다."},
"level4FailureMessage":function(d){return "각각의 3개의 나무에 대해서 \"블록 파괴\" 명령을 사용해야 합니다."},
"level5FailureMessage":function(d){return "벽을 쌓기 위해서 흙으로 윤곽을 그리세요. 핑크색 \"repeat\" 명령은 그 안에 쓰여 있는 \"place block\"이나 \"move forward\" 같은 명령어들을 실행할 것입니다."},
"level6FailureMessage":function(d){return "이 레벨을 통과하려면, 흙 블록들로 집을 짓기 위한 윤곽을 그리세요."},
"level7FailureMessage":function(d){return "\"plant\" 명령을 사용해, 어두운 흙 타일에 농작물을 심어보세요."},
"level8FailureMessage":function(d){return "크리퍼에 닿으면 크리퍼가 폭발할 것입니다. 크리퍼를 피해서 집에 들어가세요."},
"level9FailureMessage":function(d){return "가는 길에 2개 이상의 횃불을 놓아야 하고, 2개 이상의 석탄을 캐야 합니다."},
"minecraftBlock":function(d){return "블록"},
"nextLevelMsg":function(d){return craft_locale.v(d,"puzzleNumber")+" 번 퍼즐을 해결했습니다. 축하합니다!"},
"playerSelectChooseCharacter":function(d){return "캐릭터를 선택하세요."},
"playerSelectChooseSelectButton":function(d){return "선택"},
"playerSelectLetsGetStarted":function(d){return "시작해 봅시다!"},
"reinfFeedbackMsg":function(d){return "\"계속하기\" 버튼을 누르면 게임을 계속할 수 있습니다."},
"replayButton":function(d){return "다시 시작"},
"selectChooseButton":function(d){return "선택"},
"tooManyBlocksFail":function(d){return craft_locale.v(d,"puzzleNumber")+" 번 퍼즐을 해결했습니다. 축하합니다! 이 퍼즐은 "+craft_locale.p(d,"numBlocks",0,"ko",{"one":"1 block","other":craft_locale.n(d,"numBlocks")+" blocks"})+" 블록들을 이용해서도 해결할 수 있습니다."}};