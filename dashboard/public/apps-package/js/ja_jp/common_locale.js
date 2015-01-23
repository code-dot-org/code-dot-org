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
"and":function(d){return "そして"},
"booleanTrue":function(d){return "true"},
"booleanFalse":function(d){return "false"},
"blocklyMessage":function(d){return "ブロッキー"},
"catActions":function(d){return "操作"},
"catColour":function(d){return "色"},
"catLogic":function(d){return "ロジック（論理）"},
"catLists":function(d){return "リスト"},
"catLoops":function(d){return "ループ"},
"catMath":function(d){return "数値"},
"catProcedures":function(d){return "関数"},
"catText":function(d){return "テキスト"},
"catVariables":function(d){return "変数"},
"codeTooltip":function(d){return "生成されたJavaScriptコードを見る。"},
"continue":function(d){return "続行"},
"dialogCancel":function(d){return "キャンセル"},
"dialogOK":function(d){return "OK"},
"directionNorthLetter":function(d){return "北"},
"directionSouthLetter":function(d){return "南"},
"directionEastLetter":function(d){return "東"},
"directionWestLetter":function(d){return "西"},
"end":function(d){return "終了"},
"emptyBlocksErrorMsg":function(d){return "”Repeat”または\"If\"のブロックを動作をさせるためには内側に別のブロックが必要になります。内側のブロックが構成されているブロック 内に適切にはめ込まれているか確認をしてください。\n\n\n"},
"emptyFunctionBlocksErrorMsg":function(d){return "関数ブロックは、中に他のブロックがないと動きません。"},
"errorEmptyFunctionBlockModal":function(d){return "関数の中に他のブロックがありません。「編集」をクリックしてから緑色のブロックの中にほかのブロックを持ってきてください。"},
"errorIncompleteBlockInFunction":function(d){return "「編集」をクリックして、関数定義の中に足りないブロックがないか確認してください。"},
"errorParamInputUnattached":function(d){return "ワークスペースにある関数ブロックのそれぞれのパラメーター入力にブロックをくっつけるのを忘れないでください。"},
"errorUnusedParam":function(d){return "パラメーターブロックをたしましたが、使われていません。「編集」をクリックしてから緑色のブロックの中にパラメーターブロックを置くことでパラメータを使うようにしてください"},
"errorRequiredParamsMissing":function(d){return "関数に必要なパラメータを作るために、「編集」をクリックして必要なパラメータを足してください。新しいパラメーターブロックを関数の定義にドラッグして持ってきます。"},
"errorUnusedFunction":function(d){return "関数を作りましたが、ワークスペースの中では使われていません！ツールボックスの「関数」をクリックして、プログラムで使われるようにしてください。"},
"errorQuestionMarksInNumberField":function(d){return "\"???\"を何かの値に置きかえてみて。"},
"extraTopBlocks":function(d){return "ブロックを外しました。もしかして、「実行時」のブロックにつなげたかったですか？"},
"finalStage":function(d){return "おめでとうございます ！最終ステージをクリアしました。"},
"finalStageTrophies":function(d){return "おめでとうございます ！最終ステージをクリアしたので  "+locale.p(d,"numTrophies",0,"ja",{"one":"トロフィー","other":locale.n(d,"numTrophies")+" トロフィー"})+"を獲得しました。"},
"finish":function(d){return "完了"},
"generatedCodeInfo":function(d){return "トップの大学(例えば、"+locale.v(d,"berkeleyLink")+" "+locale.v(d,"harvardLink")+")でもブロック ベースのプログラミングを教えています 。でも、どうなっているか確認できるように、あなたが書いたブロックを世界で最も広く使用されるプログラム言語の JavaScript で表示できます。"},
"hashError":function(d){return "申し訳ありませんが、'%1'は保存されているプログラムと一致しません。"},
"help":function(d){return "ヘルプ"},
"hintTitle":function(d){return "ヒント:"},
"jump":function(d){return "ジャンプ"},
"levelIncompleteError":function(d){return "構成に必要なブロックをすべて使っていますが、使い方が適切ではありません。"},
"listVariable":function(d){return "リスト"},
"makeYourOwnFlappy":function(d){return "自分だけの「パタパタゲーム」を作りましょう。"},
"missingBlocksErrorMsg":function(d){return "下にある一つ以上のブロックを使ってこのパズルを解いてみましょう。"},
"nextLevel":function(d){return "おめでとうございます ！あなたはパズルを "+locale.v(d,"puzzleNumber")+" 完了しました。"},
"nextLevelTrophies":function(d){return "おめでとうございます ！あなたはパズル "+locale.v(d,"puzzleNumber")+" を完了し、"+locale.p(d,"numTrophies",0,"ja",{"one":"トロフィー","other":locale.n(d,"numTrophies")+" トロフィー"})+"を獲得しました。"},
"nextStage":function(d){return "おめでとうございます ！"+locale.v(d,"stageName")+"を コンプリートしました。"},
"nextStageTrophies":function(d){return "おめでとうございます！ "+locale.v(d,"stageName")+" をクリアして "+locale.p(d,"numTrophies",0,"ja",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+" を手に入れました。"},
"numBlocksNeeded":function(d){return "おめでとうございます ！あなたはパズル "+locale.v(d,"puzzleNumber")+" を完了しました。 (もしくは "+locale.p(d,"numBlocks",0,"ja",{"one":"1 block","other":locale.n(d,"numBlocks")+" blocks"})+" のみの使用だけでも可能でした。)"},
"numLinesOfCodeWritten":function(d){return "あなたはたった今 "+locale.p(d,"numLines",0,"ja",{"one":"1 ライン","other":locale.n(d,"numLines")+" ライン"})+" のコードを書きました！\n"},
"play":function(d){return "再生"},
"print":function(d){return "印刷"},
"puzzleTitle":function(d){return "パズル "+locale.v(d,"puzzle_number")+" の "+locale.v(d,"stage_total")},
"repeat":function(d){return "繰り返し"},
"resetProgram":function(d){return "リセット"},
"runProgram":function(d){return "実行"},
"runTooltip":function(d){return "ワークスペース内のブロックによって定義されたプログラムを実行します。\n"},
"score":function(d){return "スコア"},
"showCodeHeader":function(d){return "コードの表示"},
"showBlocksHeader":function(d){return "ブロックを表示"},
"showGeneratedCode":function(d){return "コードの表示"},
"stringEquals":function(d){return "文字列 =？"},
"subtitle":function(d){return "ビジュアル・プログラミング環境"},
"textVariable":function(d){return "テキスト"},
"tooFewBlocksMsg":function(d){return "必要なすべての種類のブロックを使用していますが、このパズルを完成させるために、選択した種類のブロックの中から複数を選んでもう一度試してください。"},
"tooManyBlocksMsg":function(d){return "このパズルは <x id='START_SPAN'/><x id='END_SPAN'/>ブロックで解決する事ができます。\n"},
"tooMuchWork":function(d){return "ちょっと作業が多すぎますね！もう少し繰り返し回数を少なくできませんか？"},
"toolboxHeader":function(d){return "ブロック達"},
"openWorkspace":function(d){return "仕組み"},
"totalNumLinesOfCodeWritten":function(d){return "すべての時間の合計: コードの "+locale.p(d,"numLines",0,"ja",{"one":"1 ライン","other":locale.n(d,"numLines")+" ライン"})+"。\n"},
"tryAgain":function(d){return "やり直す"},
"hintRequest":function(d){return "ヒントを見る"},
"backToPreviousLevel":function(d){return "前のレベルに戻る"},
"saveToGallery":function(d){return "ギャラリーに保存"},
"savedToGallery":function(d){return "ギャラリーに保存されました！"},
"shareFailure":function(d){return "プログラムをシェアできませんでした。"},
"workspaceHeader":function(d){return "ここでブロックを組み立てよう:"},
"workspaceHeaderJavaScript":function(d){return "ここにJavascriptのコードを入力してください。"},
"infinity":function(d){return "無限\n"},
"rotateText":function(d){return "お使いのデバイスを回転させてください。"},
"orientationLock":function(d){return "デバイスの設定にあるオリエンテーション（方向）ロックをオフにしてください。"},
"wantToLearn":function(d){return "プログラムを覚えてみたいですか？"},
"watchVideo":function(d){return "ビデオを見る"},
"when":function(d){return "とき"},
"whenRun":function(d){return "実行時"},
"tryHOC":function(d){return "「コードの時間」に挑戦する"},
"signup":function(d){return "イントロのコースに申し込む"},
"hintHeader":function(d){return "コツ："},
"genericFeedback":function(d){return "どうなったかよく見て、プログラムを直してみよう。"},
"toggleBlocksErrorMsg":function(d){return "ブロックとして表示させるために、あなたのプログラムのエラーを直す必要があります。"},
"defaultTwitterText":function(d){return "私の作品を試してみてください"}};