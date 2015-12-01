var common_locale = {lc:{"ar":function(n){
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
v:function(d,k){common_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){common_locale.c(d,k);return d[k] in p?p[d[k]]:(k=common_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){common_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).common_locale = {
"and":function(d){return "そして"},
"backToPreviousLevel":function(d){return "前のレベルに戻る"},
"blocklyMessage":function(d){return "ブロッキー"},
"blocks":function(d){return "ブロック"},
"booleanFalse":function(d){return "false"},
"booleanTrue":function(d){return "true"},
"catActions":function(d){return "操作"},
"catColour":function(d){return "色"},
"catLists":function(d){return "リスト"},
"catLogic":function(d){return "ロジック（論理）"},
"catLoops":function(d){return "ループ"},
"catMath":function(d){return "数値"},
"catProcedures":function(d){return "関数"},
"catText":function(d){return "テキスト"},
"catVariables":function(d){return "変数"},
"clearPuzzle":function(d){return "最初からやり直す"},
"clearPuzzleConfirm":function(d){return "パズルを最初の状態にリセットし、追加または変更されたすべてのブロックを削除します。"},
"clearPuzzleConfirmHeader":function(d){return "本当に最初からやり直してもよいですか？"},
"codeMode":function(d){return "コード"},
"codeTooltip":function(d){return "生成されたJavaScriptコードを見る。"},
"completedWithoutRecommendedBlock":function(d){return "おめでとうございます！あなたはパズル"+common_locale.v(d,"puzzleNumber")+" を完了しました。(他のブロックを使ってより良いコードを書くことも出来ます。)"},
"continue":function(d){return "続行"},
"defaultTwitterText":function(d){return "私の作品を試してみてください"},
"designMode":function(d){return "デザイン"},
"dialogCancel":function(d){return "キャンセル"},
"dialogOK":function(d){return "OK"},
"directionEastLetter":function(d){return "東"},
"directionNorthLetter":function(d){return "北"},
"directionSouthLetter":function(d){return "南"},
"directionWestLetter":function(d){return "西"},
"dropletBlock_addOperator_description":function(d){return "二つの数を足す"},
"dropletBlock_addOperator_signatureOverride":function(d){return "演算子を追加"},
"dropletBlock_andOperator_description":function(d){return "両方の式が true の場合に true を返し、そうでない場合は false を返します。"},
"dropletBlock_andOperator_signatureOverride":function(d){return "ブール演算子"},
"dropletBlock_assign_x_description":function(d){return "Assigns a value to an existing variable. For example, x = 0;"},
"dropletBlock_assign_x_param0":function(d){return "x"},
"dropletBlock_assign_x_param0_description":function(d){return "The variable name being assigned to"},
"dropletBlock_assign_x_param1":function(d){return "value"},
"dropletBlock_assign_x_param1_description":function(d){return "The value the variable is being assigned to."},
"dropletBlock_assign_x_signatureOverride":function(d){return "変数を代入"},
"dropletBlock_callMyFunction_description":function(d){return "パラメーターを受け取らず、名前付き関数を呼び出す"},
"dropletBlock_callMyFunction_n_description":function(d){return "1 つまたは複数のパラメーターを名前付き関数を呼び出す"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "パラメーターを持つ関数を呼び出す"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "関数を呼び出す"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "変数を作成し、配列として初期化する"},
"dropletBlock_declareAssign_x_array_1_4_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_array_1_4_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_array_1_4_param1":function(d){return "1,2,3,4"},
"dropletBlock_declareAssign_x_array_1_4_param1_description":function(d){return "The initial values to the array"},
"dropletBlock_declareAssign_x_array_1_4_signatureOverride":function(d){return "Declare a variable assigned to an array"},
"dropletBlock_declareAssign_x_description":function(d){return "'var' の後に指定された名前で変数を宣言し、式の右側の値を割り当てます"},
"dropletBlock_declareAssign_x_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_param1":function(d){return "0"},
"dropletBlock_declareAssign_x_param1_description":function(d){return "The initial value of the variable"},
"dropletBlock_declareAssign_x_prompt_description":function(d){return "変数を作成し、プロンプトを表示することにより、値を割り当てる"},
"dropletBlock_declareAssign_x_prompt_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_prompt_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_prompt_param1":function(d){return "値を入力"},
"dropletBlock_declareAssign_x_prompt_param1_description":function(d){return "ユーザに値の入力を促すときに表示される文字列"},
"dropletBlock_declareAssign_x_prompt_signatureOverride":function(d){return "ユーザに値の入力を促し、入力された値を保存する"},
"dropletBlock_declareAssign_x_promptNum_description":function(d){return "Declares that the code will now use a variable and assign it an initial numerical value provided by the user"},
"dropletBlock_declareAssign_x_promptNum_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_promptNum_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_promptNum_param1":function(d){return "値を入力"},
"dropletBlock_declareAssign_x_promptNum_param1_description":function(d){return "ユーザに値の入力を促すときに表示される文字列"},
"dropletBlock_declareAssign_x_promptNum_signatureOverride":function(d){return "Prompt the user for a numerical value and store it"},
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "変数を宣言します。"},
"dropletBlock_declareNoAssign_x_description":function(d){return "Declares a variable with the given name after 'var'"},
"dropletBlock_declareNoAssign_x_signatureOverride":function(d){return "変数を宣言します。"},
"dropletBlock_divideOperator_description":function(d){return "二つの値を割り算する"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "Divide operator"},
"dropletBlock_equalityOperator_description":function(d){return "等しいさをテスト"},
"dropletBlock_equalityOperator_param0":function(d){return "x"},
"dropletBlock_equalityOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_equalityOperator_param1":function(d){return "y"},
"dropletBlock_equalityOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_equalityOperator_signatureOverride":function(d){return "Equality operator"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "初期化式、条件式、インクリメント式、ループの反復処理ごとに実行されるステートメントのブロックから成るループを作成します"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "for ループ"},
"dropletBlock_functionParams_n_description":function(d){return "1 つまたは複数のパラメーターを取り、関数が呼び出されるとタスクを実行したり値を計算したりする一連のステートメント"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "パラメーターを持つ関数を定義します。"},
"dropletBlock_functionParams_none_description":function(d){return "関数が呼び出されるとタスクを実行したり値を計算したりする一連のステートメント"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "関数を定義します。"},
"dropletBlock_getTime_description":function(d){return "現在の時刻をミリ秒単位で取得します。"},
"dropletBlock_greaterThanOperator_description":function(d){return "Compare two numbers"},
"dropletBlock_greaterThanOperator_param0":function(d){return "x"},
"dropletBlock_greaterThanOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_greaterThanOperator_param1":function(d){return "y"},
"dropletBlock_greaterThanOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_greaterThanOperator_signatureOverride":function(d){return "Greater than operator"},
"dropletBlock_ifBlock_description":function(d){return "指定した条件が true の場合、ステートメントのブロックを実行します"},
"dropletBlock_ifBlock_signatureOverride":function(d){return "if statement"},
"dropletBlock_ifElseBlock_description":function(d){return "Do something if a condition is true, otherwise do something else"},
"dropletBlock_ifElseBlock_signatureOverride":function(d){return "if/else statement"},
"dropletBlock_inequalityOperator_description":function(d){return "Test for inequality"},
"dropletBlock_inequalityOperator_param0":function(d){return "x"},
"dropletBlock_inequalityOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_inequalityOperator_param1":function(d){return "y"},
"dropletBlock_inequalityOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_inequalityOperator_signatureOverride":function(d){return "Inequality operator"},
"dropletBlock_lessThanOperator_description":function(d){return "Compare two numbers"},
"dropletBlock_lessThanOperator_param0":function(d){return "x"},
"dropletBlock_lessThanOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_lessThanOperator_param1":function(d){return "y"},
"dropletBlock_lessThanOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_lessThanOperator_signatureOverride":function(d){return "Less than operator"},
"dropletBlock_mathAbs_description":function(d){return "Absolute value"},
"dropletBlock_mathAbs_param0":function(d){return "x"},
"dropletBlock_mathAbs_param0_description":function(d){return "An arbitrary number."},
"dropletBlock_mathAbs_signatureOverride":function(d){return "Math.abs(x)"},
"dropletBlock_mathMax_description":function(d){return "Maximum value"},
"dropletBlock_mathMax_param0":function(d){return "n1, n2,..., nX"},
"dropletBlock_mathMax_param0_description":function(d){return "One or more numbers to compare."},
"dropletBlock_mathMax_signatureOverride":function(d){return "Math.max(n1, n2, ..., nX)"},
"dropletBlock_mathMin_description":function(d){return "Minimum value"},
"dropletBlock_mathMin_param0":function(d){return "n1, n2,..., nX"},
"dropletBlock_mathMin_param0_description":function(d){return "One or more numbers to compare."},
"dropletBlock_mathMin_signatureOverride":function(d){return "Math.min(n1, n2, ..., nX)"},
"dropletBlock_mathRandom_description":function(d){return "0以上であり1より小さい範囲のランダムな数字を返します"},
"dropletBlock_mathRandom_signatureOverride":function(d){return "Math.random()"},
"dropletBlock_mathRound_description":function(d){return "Round to the nearest integer"},
"dropletBlock_mathRound_param0":function(d){return "x"},
"dropletBlock_mathRound_param0_description":function(d){return "An arbitrary number."},
"dropletBlock_mathRound_signatureOverride":function(d){return "Math.round(x)"},
"dropletBlock_multiplyOperator_description":function(d){return "Multiply two numbers"},
"dropletBlock_multiplyOperator_signatureOverride":function(d){return "Multiply operator"},
"dropletBlock_notOperator_description":function(d){return "Logical NOT of a boolean"},
"dropletBlock_notOperator_signatureOverride":function(d){return "AND boolean operator"},
"dropletBlock_orOperator_description":function(d){return "Logical OR of two booleans"},
"dropletBlock_orOperator_signatureOverride":function(d){return "OR boolean operator"},
"dropletBlock_randomNumber_min_max_description":function(d){return "Returns a random number ranging from the first number (min) to the second number (max), including both numbers in the range"},
"dropletBlock_randomNumber_param0":function(d){return "最小"},
"dropletBlock_randomNumber_param0_description":function(d){return "返される範囲で最小の数"},
"dropletBlock_randomNumber_param1":function(d){return "最大"},
"dropletBlock_randomNumber_param1_description":function(d){return "返される範囲で最大の数"},
"dropletBlock_randomNumber_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_return_description":function(d){return "Return a value from a function"},
"dropletBlock_return_signatureOverride":function(d){return "返す"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_subtractOperator_description":function(d){return "Subtract two numbers"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"emptyBlockInFunction":function(d){return "関数 "+common_locale.v(d,"name")+" の中が入力されていません。"},
"emptyBlockInVariable":function(d){return "変数 "+common_locale.v(d,"name")+" の中が入力されていません。"},
"emptyBlocksErrorMsg":function(d){return "”繰り返す”または\"もし\"のブロックを動作をさせるためには内側に別のブロックが必要になります。ブロック内に内側のブロックが適切にはめ込まれているか確認をしてください。"},
"emptyExampleBlockErrorMsg":function(d){return "関数 "+common_locale.v(d,"functionName")+" は少なくとも一つの例が必要です。それぞれの例には呼び出しとその結果を書いてください。"},
"emptyFunctionBlocksErrorMsg":function(d){return "関数ブロックは、中に他のブロックがないと動きません。"},
"emptyFunctionalBlock":function(d){return "入力値が空のブロックがあります。"},
"emptyTopLevelBlock":function(d){return "実行するブロックがありません。"+common_locale.v(d,"topLevelBlockName")+" ブロックに何かブロックをつなげてください。"},
"end":function(d){return "終了"},
"errorEmptyFunctionBlockModal":function(d){return "関数の中に他のブロックがありません。「編集」をクリックしてから緑色のブロックの中にほかのブロックを持ってきてください。"},
"errorIncompleteBlockInFunction":function(d){return "「編集」をクリックして、関数定義の中に足りないブロックがないか確認してください。"},
"errorParamInputUnattached":function(d){return "ワークスペース内の関数ブロックのそれぞれのパラメーター入力にブロックをくっつけるのを忘れないでください。"},
"errorQuestionMarksInNumberField":function(d){return "\"???\"を何かの値に置きかえてみて。"},
"errorRequiredParamsMissing":function(d){return "「編集」をクリックして必要なパラメータを作ってください。新しいパラメーターブロックを関数の定義にドラッグして持ってきましょう。"},
"errorUnusedFunction":function(d){return "関数を作りましたが、ワークスペースの中で使われていません。ツールボックスの「関数」をクリックして、プログラムの中で使われているか確認してください。"},
"errorUnusedParam":function(d){return "パラメーターブロックを追加しましたが、使われていないようです。「編集」をクリックして緑色のブロックの中にパラメーターブロックを置いて、パラメータが使われていることを確認してください。"},
"exampleErrorMessage":function(d){return "関数 "+common_locale.v(d,"functionName")+" はいくつか（1 か所以上）直さなければいけないところがあります。定義と合っていることを確認して、問題に答えて下さい。"},
"examplesFailedOnClose":function(d){return "１つまたは複数の入力された例が、定義と一致しません。終了する前に入力された例をもう一度確かめてください。"},
"extraTopBlocks":function(d){return "つながっていないブロックがあります。"},
"extraTopBlocksWhenRun":function(d){return "つながっていないブロックがあります。\"実行した時\" のブロックに、それらをつなげてください。"},
"finalStage":function(d){return "おめでとうございます ！最終ステージをクリアしました。"},
"finalStageTrophies":function(d){return "おめでとうございます ！最終ステージをクリアしたので  "+common_locale.p(d,"numTrophies",0,"ja",{"one":"トロフィー","other":common_locale.n(d,"numTrophies")+" トロフィー"})+"を獲得しました。"},
"finish":function(d){return "完了"},
"generatedCodeInfo":function(d){return "アメリカのトップの大学(例えば、"+common_locale.v(d,"berkeleyLink")+" "+common_locale.v(d,"harvardLink")+")でもブロック ベースのプログラミングを教えています 。あなたが組み合わせたブロックは実際のプログラム言語でどのようになっているか確認できるようにJavaScriptで表示できます。JavaScriptは世界中で最も広く使われているプログラム言語です。"},
"hashError":function(d){return "申し訳ありませんが、'%1'は保存されているプログラムと一致しません。"},
"help":function(d){return "ヘルプ"},
"hideToolbox":function(d){return "（隠す）"},
"hintHeader":function(d){return "コツ："},
"hintRequest":function(d){return "ヒントを見る"},
"hintTitle":function(d){return "ヒント:"},
"ignore":function(d){return "無視する"},
"infinity":function(d){return "無限\n"},
"jump":function(d){return "ジャンプ"},
"keepPlaying":function(d){return "ゲームをつづける"},
"levelIncompleteError":function(d){return "構成に必要なブロックをすべて使っていますが、使い方が適切ではありません。"},
"listVariable":function(d){return "リスト"},
"makeYourOwnFlappy":function(d){return "自分だけの「パタパタゲーム」を作りましょう。"},
"missingRecommendedBlocksErrorMsg":function(d){return "不正解です。まだ使用していないブロックを使用してください。"},
"missingRequiredBlocksErrorMsg":function(d){return "不正解です。まだ使用していないブロックを使用しなければなりません。"},
"nestedForSameVariable":function(d){return "同じ可変名をネストのループの中でいくつも使っているので、無限ループになるのを避けるように、独自の可変名を使いましょう。"},
"nextLevel":function(d){return "おめでとうございます ！あなたはパズルを "+common_locale.v(d,"puzzleNumber")+" 完了しました。"},
"nextLevelTrophies":function(d){return "おめでとうございます ！あなたはパズル "+common_locale.v(d,"puzzleNumber")+" をクリアし、"+common_locale.p(d,"numTrophies",0,"ja",{"one":"トロフィー","other":common_locale.n(d,"numTrophies")+" トロフィー"})+"を獲得しました。"},
"nextPuzzle":function(d){return "次のパズル"},
"nextStage":function(d){return "おめでとうございます ！"+common_locale.v(d,"stageName")+"を クリアしました。"},
"nextStageTrophies":function(d){return "おめでとうございます！ "+common_locale.v(d,"stageName")+" をクリアして "+common_locale.p(d,"numTrophies",0,"ja",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+" を手に入れました。"},
"numBlocksNeeded":function(d){return "おめでとうございます ！あなたはパズル "+common_locale.v(d,"puzzleNumber")+" をクリアしました。 (ヒント： "+common_locale.p(d,"numBlocks",0,"ja",{"one":"1ブロック","other":common_locale.n(d,"numBlocks")+"ブロック"})+" だけで解くこともできました。)"},
"numLinesOfCodeWritten":function(d){return "あなたはたった今 "+common_locale.p(d,"numLines",0,"ja",{"one":"1 行","other":common_locale.n(d,"numLines")+" 行"})+" のコードを書きました！"},
"openWorkspace":function(d){return "仕組み"},
"orientationLock":function(d){return "デバイスの設定にあるオリエンテーション（方向）ロックをオフにしてください。"},
"play":function(d){return "再生する"},
"print":function(d){return "印刷"},
"puzzleTitle":function(d){return "パズル "+common_locale.v(d,"puzzle_number")+" (全 "+common_locale.v(d,"stage_total")+" ステージ)"},
"readonlyWorkspaceHeader":function(d){return "表示のみ: "},
"repeat":function(d){return "繰り返し"},
"resetProgram":function(d){return "リセット"},
"rotateText":function(d){return "お使いのデバイスを回転させてください。"},
"runProgram":function(d){return "実行"},
"runTooltip":function(d){return "ワークスペース内にブロックで作られたプログラムを実行します。\n"},
"runtimeErrorMsg":function(d){return "プログラムは正常に実行されませんでした。 "+common_locale.v(d,"lineNumber")+" を取り消しして、再度行ってください。"},
"saveToGallery":function(d){return "ギャラリーに保存"},
"savedToGallery":function(d){return "ギャラリーに保存されました！"},
"score":function(d){return "スコア"},
"shareFailure":function(d){return "プログラムをシェアできませんでした。"},
"shareWarningsAge":function(d){return "下記にあなたの年齢を示し、OKを押して続けてください。"},
"shareWarningsMoreInfo":function(d){return "情報をもっと見る"},
"shareWarningsStoreData":function(d){return "Code Studio上で作られたこちらのアプリは、共有リンクにて誰でも閲覧が可能ですが、個人情報の漏えいにはくれぐれもご注意ください。"},
"showBlocksHeader":function(d){return "ブロックを表示"},
"showCodeHeader":function(d){return "コードの表示"},
"showGeneratedCode":function(d){return "コードを表示します。"},
"showTextHeader":function(d){return "テキストを表示"},
"showToolbox":function(d){return "ツールボックスを表示"},
"showVersionsHeader":function(d){return "バージョンの履歴"},
"signup":function(d){return "イントロのコースに申し込む"},
"stringEquals":function(d){return "文字列 =？"},
"submit":function(d){return "送信"},
"submitYourProject":function(d){return "作品を提出する"},
"submitYourProjectConfirm":function(d){return "作品を提出後には編集ができなくなります。本当に提出しますか？"},
"unsubmit":function(d){return "取り消す"},
"unsubmitYourProject":function(d){return "作品の提出を取り下げる"},
"unsubmitYourProjectConfirm":function(d){return "作品の提出を取り下げると、提出日がリセットされます。本当に取り下げますか？"},
"subtitle":function(d){return "ビジュアル ・ プログラミング環境"},
"syntaxErrorMsg":function(d){return "プログラムの中にタイプミスが含まれています。行 "+common_locale.v(d,"lineNumber")+" を削除して、もう一度やり直してください。"},
"textVariable":function(d){return "テキスト"},
"toggleBlocksErrorMsg":function(d){return "ブロックとして表示させるために、あなたのプログラムのエラーを直す必要があります。"},
"tooFewBlocksMsg":function(d){return "すべての必要な種類のブロックを使用していますが、これらの種類のブロックも使ってみてこのパズルを完成させてください。"},
"tooManyBlocksMsg":function(d){return "このパズルは <x id='START_SPAN'/><x id='END_SPAN'/>のブロックで解決できます。\n"},
"tooMuchWork":function(d){return "ちょっと作業が多すぎますね！もう少し繰り返し回数を少なくできませんか？"},
"toolboxHeader":function(d){return "ブロック達"},
"toolboxHeaderDroplet":function(d){return "ツールボックス"},
"totalNumLinesOfCodeWritten":function(d){return "すべての時間の合計:  "+common_locale.p(d,"numLines",0,"ja",{"one":"1 ライン","other":common_locale.n(d,"numLines")+" ライン"})+" のコード\n"},
"tryAgain":function(d){return "やり直す"},
"tryBlocksBelowFeedback":function(d){return "次のブロックのいずれかを使用してください"},
"tryHOC":function(d){return "「コードの時間」に挑戦する"},
"unnamedFunction":function(d){return "名前のない変数または関数があります。全てにわかりやすい名前をつけるのを忘れないでください。"},
"wantToLearn":function(d){return "プログラムを覚えてみたいですか？"},
"watchVideo":function(d){return "ビデオを見る"},
"when":function(d){return "とき"},
"whenRun":function(d){return "実行した時"},
"workspaceHeaderShort":function(d){return "ワークスペース："}};