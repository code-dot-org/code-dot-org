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
"blockDestroyBlock":function(d){return "ブロックをこわす"},
"blockIf":function(d){return "もし"},
"blockIfLavaAhead":function(d){return "もし前方が溶岩なら"},
"blockMoveForward":function(d){return "前に進む"},
"blockPlaceTorch":function(d){return "たいまつを置く"},
"blockPlaceXAheadAhead":function(d){return "前方に"},
"blockPlaceXAheadPlace":function(d){return "置く"},
"blockPlaceXPlace":function(d){return "置く"},
"blockPlantCrop":function(d){return "作物を植える"},
"blockShear":function(d){return "毛をかる"},
"blockTillSoil":function(d){return "たがやす"},
"blockTurnLeft":function(d){return "左に回転"},
"blockTurnRight":function(d){return "右に回転"},
"blockTypeBedrock":function(d){return "岩盤"},
"blockTypeBricks":function(d){return "レンガ"},
"blockTypeClay":function(d){return "ねん土"},
"blockTypeClayHardened":function(d){return "硬い粘土"},
"blockTypeCobblestone":function(d){return "丸石"},
"blockTypeDirt":function(d){return "土"},
"blockTypeDirtCoarse":function(d){return "粗い土"},
"blockTypeEmpty":function(d){return "空"},
"blockTypeFarmlandWet":function(d){return "耕地"},
"blockTypeGlass":function(d){return "ガラス"},
"blockTypeGrass":function(d){return "草"},
"blockTypeGravel":function(d){return "砂利"},
"blockTypeLava":function(d){return "よう岩"},
"blockTypeLogAcacia":function(d){return "アカシアの丸太"},
"blockTypeLogBirch":function(d){return "シラカバの丸太"},
"blockTypeLogJungle":function(d){return "ジャングルの丸太"},
"blockTypeLogOak":function(d){return "オークの丸太"},
"blockTypeLogSpruce":function(d){return "マツの丸太"},
"blockTypeOreCoal":function(d){return "石炭鉱石"},
"blockTypeOreDiamond":function(d){return "ダイヤモンド鉱石"},
"blockTypeOreEmerald":function(d){return "エメラルド鉱石"},
"blockTypeOreGold":function(d){return "金鉱石"},
"blockTypeOreIron":function(d){return "鉄鉱石"},
"blockTypeOreLapis":function(d){return "ラピスラズリ鉱石"},
"blockTypeOreRedstone":function(d){return "レッドス トーン鉱石"},
"blockTypePlanksAcacia":function(d){return "アカシアの木材"},
"blockTypePlanksBirch":function(d){return "シラカバの木材"},
"blockTypePlanksJungle":function(d){return "ジャングルの木材"},
"blockTypePlanksOak":function(d){return "オークの木材"},
"blockTypePlanksSpruce":function(d){return "マツの木材"},
"blockTypeRail":function(d){return "レール"},
"blockTypeSand":function(d){return "砂"},
"blockTypeSandstone":function(d){return "砂岩"},
"blockTypeStone":function(d){return "石"},
"blockTypeTnt":function(d){return "ＴＮＴ"},
"blockTypeTree":function(d){return "木"},
"blockTypeWater":function(d){return "水"},
"blockTypeWool":function(d){return "羊毛"},
"blockWhileXAheadAhead":function(d){return "前方に"},
"blockWhileXAheadDo":function(d){return "実行"},
"blockWhileXAheadWhile":function(d){return "以下の間"},
"generatedCodeDescription":function(d){return "このパズルであなたはブロックを運んだり並べたりすることで、あなたはJavaScript というコンピューター言語で書かれた、ひとまとまりの指示をつくり上げました。このようなプログラムによって、人間はコンピューターに画面に何を表示すればいいのかを指示できるのです。あなたがマインクラフト内で目にすることや行うこともすべて、こうしたコンピュータープログラムからスタートしています。"},
"houseSelectChooseFloorPlan":function(d){return "これからたてる家のかたちをえらんでください。"},
"houseSelectEasy":function(d){return "やさしい"},
"houseSelectHard":function(d){return "むずかしい"},
"houseSelectLetsBuild":function(d){return "さあ、家をたてましょう"},
"houseSelectMedium":function(d){return "ふつう"},
"keepPlayingButton":function(d){return "プレーを続ける"},
"level10FailureMessage":function(d){return "溶岩をうめてその上をとおり、鉄ブロック2つを掘ります。"},
"level11FailureMessage":function(d){return "すすみたいところに溶岩があれば、そこに丸石を置くようにします。そうすることではじめて安全にまっすぐ掘っていくことができようになります。"},
"level12FailureMessage":function(d){return "レッドストーンブロックを3つ掘り出しましたか？ これまでに家をたてたり、「もし」をつかって溶岩をよけて歩いたりしたことをよく思いだしてください。"},
"level13FailureMessage":function(d){return "「レール」を、家のげんかんからマップのはしまでつづく、土でできた道の上に置いていきます。"},
"level1FailureMessage":function(d){return "ヒツジにちかづくにはコマンドをつかわないといけません。"},
"level1TooFewBlocksMessage":function(d){return "ヒツジにたどりつくためには、もっとコマンドがいります。"},
"level2FailureMessage":function(d){return "木を切るためには、その木のねもとまで行ってから「ブロックをこわす」コマンドをつかいます。"},
"level2TooFewBlocksMessage":function(d){return "木を切るためにはもっとコマンドがいります。切りたい木のねもとまで行ってから「ブロックをこわす」コマンドをつかいます。"},
"level3FailureMessage":function(d){return "りょう方のヒツジから毛をかるには、一匹ずつ近よってから「毛をかる」コマンドをつかいます。ヒツジにたどりつくには「回転」コマンドがいることをおぼえておいてください。"},
"level3TooFewBlocksMessage":function(d){return "ヒツジの毛をかるためにはもっとコマンドがいります。一匹ずつヒツジのちかくに行ってから「毛をかる」コマンドをつかいます。"},
"level4FailureMessage":function(d){return "3本ある木のねもとで「ブロックをこわす」コマンドを使わないといけません。"},
"level5FailureMessage":function(d){return "ブロックを土の目じるしにそって置き、カベをつくります。ピンク色の「くりかえす」コマンドは、その中におかれた「ブロックを置く」や「前に進む」といったようなコマンドを実行します。"},
"level6FailureMessage":function(d){return "ブロックを、土で家のかたちになった目じるしの上に置いて、パズルを解きます。"},
"level7FailureMessage":function(d){return "「植える」コマンドをつかって、色のこい、たがやされた地面に作物を植えます。"},
"level8FailureMessage":function(d){return "クリーパーはさわるとバクハツします。そっと間をすりぬけて、お家にはいりましょう。"},
"level9FailureMessage":function(d){return "たいまつ2つ（かそれより多く）をおいてまわりを明るくすることと、石炭2つ（かそれより多く）を掘り出すのをわすれないように。"},
"minecraftBlock":function(d){return "ブロック"},
"nextLevelMsg":function(d){return "パズル"+craft_locale.v(d,"puzzleNumber")+" をクリアしました。おめでとうございます!"},
"playerSelectChooseCharacter":function(d){return "つかいたいキャラクターを選んでください"},
"playerSelectChooseSelectButton":function(d){return "えらぶ"},
"playerSelectLetsGetStarted":function(d){return "さあ、はじめましょう。"},
"reinfFeedbackMsg":function(d){return "「続ける」を押してゲームに戻ることが出来ます。"},
"replayButton":function(d){return "もういちど"},
"selectChooseButton":function(d){return "えらぶ"},
"tooManyBlocksFail":function(d){return "パズル"+craft_locale.v(d,"puzzleNumber")+"クリア。おめでとうございます！"+craft_locale.p(d,"numBlocks",0,"ja",{"one":"1 ブロック","other":craft_locale.n(d,"numBlocks")+" ブロック"})+"でクリアすることもできるよ"}};