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
"blockDestroyBlock":function(d){return "ブロックを破壊"},
"blockIf":function(d){return "もし"},
"blockIfLavaAhead":function(d){return "溶岩が前方にある場合"},
"blockMoveForward":function(d){return "まえにすすむ"},
"blockPlaceTorch":function(d){return "松明を置く"},
"blockPlaceXAheadAhead":function(d){return "前方"},
"blockPlaceXAheadPlace":function(d){return "置く"},
"blockPlaceXPlace":function(d){return "置く"},
"blockPlantCrop":function(d){return "作物を植える"},
"blockShear":function(d){return "刈る"},
"blockTillSoil":function(d){return "土を耕す"},
"blockTurnLeft":function(d){return "ひだりに　まがる"},
"blockTurnRight":function(d){return "みぎに　まがる"},
"blockTypeBedrock":function(d){return "岩盤"},
"blockTypeBricks":function(d){return "レンガ"},
"blockTypeClay":function(d){return "粘土"},
"blockTypeClayHardened":function(d){return "堅焼き粘土"},
"blockTypeCobblestone":function(d){return "丸石"},
"blockTypeDirt":function(d){return "土"},
"blockTypeDirtCoarse":function(d){return "荒れた土"},
"blockTypeEmpty":function(d){return "空"},
"blockTypeFarmlandWet":function(d){return "耕地"},
"blockTypeGlass":function(d){return "ガラス"},
"blockTypeGrass":function(d){return "草"},
"blockTypeGravel":function(d){return "砂利"},
"blockTypeLava":function(d){return "溶岩"},
"blockTypeLogAcacia":function(d){return "アカシアの丸太"},
"blockTypeLogBirch":function(d){return "シラカバの丸太"},
"blockTypeLogJungle":function(d){return "熱帯樹の丸太"},
"blockTypeLogOak":function(d){return "オークの丸太"},
"blockTypeLogSpruce":function(d){return "マツの丸太"},
"blockTypeOreCoal":function(d){return "石炭鉱石"},
"blockTypeOreDiamond":function(d){return "ダイヤモンド鉱石"},
"blockTypeOreEmerald":function(d){return "エメラルド鉱石"},
"blockTypeOreGold":function(d){return "金鉱石"},
"blockTypeOreIron":function(d){return "鉄鉱石"},
"blockTypeOreLapis":function(d){return "ラピスラズリ鉱石"},
"blockTypeOreRedstone":function(d){return "レッドストーン鉱石"},
"blockTypePlanksAcacia":function(d){return "アカシアの木材"},
"blockTypePlanksBirch":function(d){return "シラカバの木材"},
"blockTypePlanksJungle":function(d){return "熱帯樹の木材"},
"blockTypePlanksOak":function(d){return "オークの木材"},
"blockTypePlanksSpruce":function(d){return "マツの木材"},
"blockTypeRail":function(d){return "レール"},
"blockTypeSand":function(d){return "砂"},
"blockTypeSandstone":function(d){return "砂岩"},
"blockTypeStone":function(d){return "石"},
"blockTypeTnt":function(d){return "TNT"},
"blockTypeTree":function(d){return "木"},
"blockTypeWater":function(d){return "水"},
"blockTypeWool":function(d){return "羊毛"},
"blockWhileXAheadAhead":function(d){return "前方"},
"blockWhileXAheadDo":function(d){return "やること"},
"blockWhileXAheadWhile":function(d){return "以下の間"},
"generatedCodeDescription":function(d){return "パズル内でブロックをドラッグして配置すれば、Javascript の命令セットが完成します。このコードは画面の表示内容をコンピューターに指示します。Minecraft 内のオブジェクトや動作は、こうしたコードでできています。"},
"houseSelectChooseFloorPlan":function(d){return "家のフロア プランを選びます。"},
"houseSelectEasy":function(d){return "イージー"},
"houseSelectHard":function(d){return "ハード"},
"houseSelectLetsBuild":function(d){return "家を建てましょう。"},
"houseSelectMedium":function(d){return "ミディアム"},
"keepPlayingButton":function(d){return "プレイを続ける"},
"level10FailureMessage":function(d){return "渡れるように溶岩にフタをして、反対側の鉄のブロックを掘りましょう。"},
"level11FailureMessage":function(d){return "前方に溶岩があるときは丸石を置きましょう。これで、安全にこの並びの資源を掘ることができます。"},
"level12FailureMessage":function(d){return "3 つのレッドストーン ブロックを忘れずに掘ること。家の建設で学んだ方法と、溶岩を避ける \"if\" 文の両方を活かしましょう。"},
"level13FailureMessage":function(d){return "ドアからマップの端へと続く土の道に \"レール\" を置きます。"},
"level1FailureMessage":function(d){return "羊のそばまで歩くにはコマンドを使います。"},
"level1TooFewBlocksMessage":function(d){return "羊のそばまで歩くためもう少しコマンドを使いましょう。"},
"level2FailureMessage":function(d){return "木を切り倒すには、切株まで歩いて、\"ブロックを破壊\" コマンドを使います。"},
"level2TooFewBlocksMessage":function(d){return "木を切り倒すため、もう少しコマンドを使いましょう。切株まで歩いて、\"ブロックを破壊\" コマンドを使います。"},
"level3FailureMessage":function(d){return "2 匹の羊から羊毛を採取するには、それぞれのそばまで歩き、\"刈る\" コマンドを使います。羊のところに行くには回転コマンドを使いましょう。"},
"level3TooFewBlocksMessage":function(d){return "2 匹の羊から羊毛を採取するため、もう少しコマンドを使いましょう。それぞれのそばまで歩き、\"刈る\" コマンドを使います。"},
"level4FailureMessage":function(d){return "3 つの切株それぞれに \"ブロックを破壊\" コマンドを使わなければなりません。"},
"level5FailureMessage":function(d){return "土の枠にブロックを置き、壁を作ります。ピンクの \"リピート\" コマンドは、中に置かれた \"ブロックを置く\" や \"前進\" のようなコマンドを実行します。"},
"level6FailureMessage":function(d){return "パズルをクリアするには、家の土の枠にブロックを置いてください。"},
"level7FailureMessage":function(d){return "耕したそれぞれの地面に作物を植えるには、\"植える\" コマンドを使います。"},
"level8FailureMessage":function(d){return "Creeper は触れると爆発します。見つからないように周囲を迂回して、家に入りましょう。"},
"level9FailureMessage":function(d){return "2 つ以上の松明を置いて、道を照らしましょう。それから石炭を 2 個掘るのも忘れずに。"},
"minecraftBlock":function(d){return "ブロック"},
"nextLevelMsg":function(d){return "パズル "+craft_locale.v(d,"puzzleNumber")+" をクリアしました。おめでとうございます!"},
"playerSelectChooseCharacter":function(d){return "キャラクターを選んでください。"},
"playerSelectChooseSelectButton":function(d){return "選択"},
"playerSelectLetsGetStarted":function(d){return "さっそく始めましょう。"},
"reinfFeedbackMsg":function(d){return "\"プレイを続ける\" を押せば、ゲームに戻れます。"},
"replayButton":function(d){return "リプレイ"},
"selectChooseButton":function(d){return "選択"},
"tooManyBlocksFail":function(d){return "パズル "+craft_locale.v(d,"puzzleNumber")+" を解きました。おめでとうございます! ちなみにブロック "+craft_locale.p(d,"numBlocks",0,"ja",{"one":"1 つ","other":craft_locale.n(d,"numBlocks")+" 個"})+" でも解くことができます。"}};