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
"blocks":function(d){return "ブロック"},
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
"clearPuzzle":function(d){return "最初からスタート"},
"clearPuzzleConfirm":function(d){return "パズルを最初の状態にリセットし、追加または変更されたすべてのブロックを削除します。"},
"clearPuzzleConfirmHeader":function(d){return "本当に最初からやり直してもよいですか？"},
"codeMode":function(d){return "コード"},
"codeTooltip":function(d){return "生成されたJavaScriptコードを見る。"},
"continue":function(d){return "続行"},
"designMode":function(d){return "デザイン"},
"designModeHeader":function(d){return "デザイン モード"},
"dialogCancel":function(d){return "キャンセル"},
"dialogOK":function(d){return "OK"},
"directionNorthLetter":function(d){return "北"},
"directionSouthLetter":function(d){return "南"},
"directionEastLetter":function(d){return "東"},
"directionWestLetter":function(d){return "西"},
"dropletBlock_addOperator_description":function(d){return "二つの数値を足す"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Add operator"},
"dropletBlock_andOperator_description":function(d){return "両方の式が true と false それ以外の場合場合にのみ true を返します"},
"dropletBlock_andOperator_signatureOverride":function(d){return "ブール演算子"},
"dropletBlock_arcLeft_description":function(d){return "指定した角度と半径に沿い、亀を反時計回りに動かす"},
"dropletBlock_arcLeft_param0":function(d){return "angle"},
"dropletBlock_arcLeft_param1":function(d){return "半径"},
"dropletBlock_arcRight_description":function(d){return "指定した角度と半径に沿い、亀を時計回りに動かす"},
"dropletBlock_arcRight_param0":function(d){return "angle"},
"dropletBlock_arcRight_param1":function(d){return "半径"},
"dropletBlock_assign_x_description":function(d){return "変数を割り当て直す"},
"dropletBlock_assign_x_signatureOverride":function(d){return "Assign a variable"},
"dropletBlock_button_description":function(d){return "ボタンを作成し、エレメントIDを割り当てる"},
"dropletBlock_button_param0":function(d){return "buttonId"},
"dropletBlock_button_param1":function(d){return "テキスト"},
"dropletBlock_callMyFunction_description":function(d){return "パラメーターを受け取らず、名前付き関数を呼び出す"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "関数をコール"},
"dropletBlock_callMyFunction_n_description":function(d){return "1 つまたは複数のパラメーターを名前付き関数を呼び出す"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "パラメーターを持つ関数を呼び出す"},
"dropletBlock_changeScore_description":function(d){return "スコアへポイントを追加または削除します。"},
"dropletBlock_checkbox_description":function(d){return "チェックボックスを作成し、エレメントIDを割り当てる"},
"dropletBlock_checkbox_param0":function(d){return "checkboxId"},
"dropletBlock_checkbox_param1":function(d){return "checked"},
"dropletBlock_circle_description":function(d){return "指定の座標(x,y)と半径を元にアクティバなキャンバスに円を描く"},
"dropletBlock_circle_param0":function(d){return "[centerx]"},
"dropletBlock_circle_param1":function(d){return "centerY"},
"dropletBlock_circle_param2":function(d){return "半径"},
"dropletBlock_clearCanvas_description":function(d){return "アクティバなキャンバスからデータを消す"},
"dropletBlock_clearInterval_description":function(d){return "setInterval()の戻り値を渡し、既存のインターバル・タイマーをクリアする"},
"dropletBlock_clearInterval_param0":function(d){return "interval"},
"dropletBlock_clearTimeout_description":function(d){return "setTimeout()の戻り値を渡し、既存のタイマーをクリアする"},
"dropletBlock_clearTimeout_param0":function(d){return "timeout"},
"dropletBlock_console.log_description":function(d){return "コンソール表示に文字列または変数を表示します"},
"dropletBlock_console.log_param0":function(d){return "メッセージ"},
"dropletBlock_container_description":function(d){return "指定のエレメントIDを使い、分割コンテイナーを作成する。必要に応じて、内部HTMLを設定する"},
"dropletBlock_createCanvas_description":function(d){return "指定のIDを元に、キャンバスを作成する。必要に応じて、幅と高さを設定する"},
"dropletBlock_createCanvas_param0":function(d){return "canvasId"},
"dropletBlock_createCanvas_param1":function(d){return "幅"},
"dropletBlock_createCanvas_param2":function(d){return "高さ"},
"dropletBlock_createRecord_description":function(d){return "アプリの実験室のテーブルのデータ ストレージを使用して、テーブル名に一意の id を持つレコードが作成され、アクションが終了するときに、コールバック関数を呼び出します。"},
"dropletBlock_createRecord_param0":function(d){return "テーブルネーム"},
"dropletBlock_createRecord_param1":function(d){return "記録"},
"dropletBlock_createRecord_param2":function(d){return "onSuccess"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "変数を作成し、配列として初期化する"},
"dropletBlock_declareAssign_x_array_1_4_signatureOverride":function(d){return "Declare a variable assigned to an array"},
"dropletBlock_declareAssign_x_description":function(d){return "'Var' の後、指定された名前を持つ変数を宣言し、式の右側に値を割り当てます"},
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "変数を宣言します。"},
"dropletBlock_declareAssign_x_prompt_description":function(d){return "変数を作成し、プロンプトを表示することにより、値を割り当てる"},
"dropletBlock_declareAssign_x_prompt_signatureOverride":function(d){return "Prompt the user for a value and store it"},
"dropletBlock_deleteElement_description":function(d){return "指定のIDを使い、エレメントを消す"},
"dropletBlock_deleteElement_param0":function(d){return "id"},
"dropletBlock_deleteRecord_description":function(d){return "アプリの実験室のテーブルのデータ ストレージを使用して、tableName で指定されたレコードを削除します。レコードは、id フィールドを一意に識別する必要があります、オブジェクトです。呼び出しが完了したとき、コールバック関数は呼び出されます。"},
"dropletBlock_deleteRecord_param0":function(d){return "テーブルネーム"},
"dropletBlock_deleteRecord_param1":function(d){return "記録"},
"dropletBlock_deleteRecord_param2":function(d){return "onSuccess"},
"dropletBlock_divideOperator_description":function(d){return "二つの値をを割る"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "Divide operator"},
"dropletBlock_dot_description":function(d){return "亀の位置に指定した半径のドットを描く"},
"dropletBlock_dot_param0":function(d){return "半径"},
"dropletBlock_drawImage_description":function(d){return "指定のimage elementでイメージを描き、 x, y を左上の座標として設定"},
"dropletBlock_drawImage_param0":function(d){return "id"},
"dropletBlock_drawImage_param1":function(d){return "x"},
"dropletBlock_drawImage_param2":function(d){return "y"},
"dropletBlock_drawImage_param3":function(d){return "幅"},
"dropletBlock_drawImage_param4":function(d){return "高さ"},
"dropletBlock_dropdown_description":function(d){return "ドロップダウンリストを作成し、エレメントIDを割り当て、項目をリスト内のアイテムで埋める"},
"dropletBlock_dropdown_signatureOverride":function(d){return "dropdown(dropdownID, option1, option2, ..., optionX)"},
"dropletBlock_equalityOperator_description":function(d){return "等しいさをテスト"},
"dropletBlock_equalityOperator_signatureOverride":function(d){return "Equality operator"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "初期化式、条件式、インクリメント式、ループの反復処理ごとに実行されるステートメントのブロックから成るループを作成します"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "for ループ"},
"dropletBlock_functionParams_n_description":function(d){return "1 つまたは複数のパラメーターで、かかるとタスクを実行または関数が呼び出されたときに値を計算する一連のステートメント"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "パラメーターを持つ関数を定義します。"},
"dropletBlock_functionParams_none_description":function(d){return "タスクの実行または関数が呼び出されたときに、値が計算されるステートメントのセット"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "関数を定義します。"},
"dropletBlock_getAlpha_description":function(d){return "Gets the alpha"},
"dropletBlock_getAlpha_param0":function(d){return "imageData"},
"dropletBlock_getAlpha_param1":function(d){return "x"},
"dropletBlock_getAlpha_param2":function(d){return "y"},
"dropletBlock_getAttribute_description":function(d){return "特定の属性を取得します。"},
"dropletBlock_getBlue_description":function(d){return "Gets the given blue value"},
"dropletBlock_getBlue_param0":function(d){return "imageData"},
"dropletBlock_getBlue_param1":function(d){return "x"},
"dropletBlock_getBlue_param2":function(d){return "y"},
"dropletBlock_getChecked_description":function(d){return "チェック ボックスまたはラジオ ボタンの状態を取得します。"},
"dropletBlock_getChecked_param0":function(d){return "id"},
"dropletBlock_getDirection_description":function(d){return "Get the turtle's direction (0 degrees is pointing up)"},
"dropletBlock_getGreen_description":function(d){return "Gets the given green value"},
"dropletBlock_getGreen_param0":function(d){return "imageData"},
"dropletBlock_getGreen_param1":function(d){return "x"},
"dropletBlock_getGreen_param2":function(d){return "y"},
"dropletBlock_getImageData_description":function(d){return "Get the ImageData for a rectangle (x, y, width, height) within the active  canvas"},
"dropletBlock_getImageData_param0":function(d){return "startX"},
"dropletBlock_getImageData_param1":function(d){return "startY"},
"dropletBlock_getImageData_param2":function(d){return "endX"},
"dropletBlock_getImageData_param3":function(d){return "endY"},
"dropletBlock_getImageURL_description":function(d){return "Get the URL associated with an image or image upload button"},
"dropletBlock_getImageURL_param0":function(d){return "imageID"},
"dropletBlock_getKeyValue_description":function(d){return "Reads the value associated with the key from the remote data store."},
"dropletBlock_getKeyValue_param0":function(d){return "キー"},
"dropletBlock_getKeyValue_param1":function(d){return "callbackFunction"},
"dropletBlock_getRed_description":function(d){return "Gets the given red value"},
"dropletBlock_getRed_param0":function(d){return "imageData"},
"dropletBlock_getRed_param1":function(d){return "x"},
"dropletBlock_getRed_param2":function(d){return "y"},
"dropletBlock_getText_description":function(d){return "指定した要素からテキストを取得します。"},
"dropletBlock_getText_param0":function(d){return "id"},
"dropletBlock_getTime_description":function(d){return "現在の時刻をミリ秒単位で取得します。"},
"dropletBlock_getUserId_description":function(d){return "このアプリケーションの現在のユーザーの一意の識別子を取得します。"},
"dropletBlock_getX_description":function(d){return "カメの現在位置の x 座標 (ピクセル単位)を取得"},
"dropletBlock_getXPosition_description":function(d){return "要素の x 位置を取得します。"},
"dropletBlock_getXPosition_param0":function(d){return "id"},
"dropletBlock_getY_description":function(d){return "カメの現在位置の y 座標 (ピクセル単位)を取得"},
"dropletBlock_getYPosition_description":function(d){return "要素の y 位置を取得します。"},
"dropletBlock_getYPosition_param0":function(d){return "id"},
"dropletBlock_greaterThanOperator_description":function(d){return "Compare two numbers"},
"dropletBlock_greaterThanOperator_signatureOverride":function(d){return "Greater than operator"},
"dropletBlock_hide_description":function(d){return "画面には表示されませんので、カメを非表示にします"},
"dropletBlock_hideElement_description":function(d){return "Hide the element with the specified id"},
"dropletBlock_hideElement_param0":function(d){return "id"},
"dropletBlock_ifBlock_description":function(d){return "指定した条件が true の場合、ステートメントのブロックを実行します"},
"dropletBlock_ifBlock_signatureOverride":function(d){return "if statement"},
"dropletBlock_ifElseBlock_description":function(d){return "Do something if a condition is true, otherwise do something else"},
"dropletBlock_ifElseBlock_signatureOverride":function(d){return "if/else statement"},
"dropletBlock_image_description":function(d){return "Create an image and assign it an element id"},
"dropletBlock_image_param0":function(d){return "id"},
"dropletBlock_image_param1":function(d){return "url"},
"dropletBlock_imageUploadButton_description":function(d){return "Create an image upload button and assign it an element id"},
"dropletBlock_inequalityOperator_description":function(d){return "Test for inequality"},
"dropletBlock_inequalityOperator_signatureOverride":function(d){return "Inequality operator"},
"dropletBlock_innerHTML_description":function(d){return "Set the inner HTML for the element with the specified id"},
"dropletBlock_lessThanOperator_description":function(d){return "Compare two numbers"},
"dropletBlock_lessThanOperator_signatureOverride":function(d){return "Less than operator"},
"dropletBlock_line_description":function(d){return "Draw a line on the active canvas from x1, y1 to x2, y2"},
"dropletBlock_line_param0":function(d){return "x1"},
"dropletBlock_line_param1":function(d){return "y1"},
"dropletBlock_line_param2":function(d){return "x2"},
"dropletBlock_line_param3":function(d){return "y2"},
"dropletBlock_mathAbs_description":function(d){return "Absolute value"},
"dropletBlock_mathAbs_signatureOverride":function(d){return "Math.abs(x)"},
"dropletBlock_mathMax_description":function(d){return "Maximum value"},
"dropletBlock_mathMax_signatureOverride":function(d){return "Math.max(n1, n2, ..., nX)"},
"dropletBlock_mathMin_description":function(d){return "Minimum value"},
"dropletBlock_mathMin_signatureOverride":function(d){return "Math.min(n1, n2, ..., nX)"},
"dropletBlock_mathRound_description":function(d){return "Round to the nearest integer"},
"dropletBlock_mathRound_signatureOverride":function(d){return "Math.round(x)"},
"dropletBlock_move_description":function(d){return "Move the turtle by the specified x and y coordinates"},
"dropletBlock_move_param0":function(d){return "x"},
"dropletBlock_move_param1":function(d){return "y"},
"dropletBlock_moveBackward_description":function(d){return "Move the turtle backward the specified distance"},
"dropletBlock_moveBackward_param0":function(d){return "ピクセル"},
"dropletBlock_moveForward_description":function(d){return "Move the turtle forward the specified distance"},
"dropletBlock_moveForward_param0":function(d){return "ピクセル"},
"dropletBlock_moveTo_description":function(d){return "Move the turtle to the specified x and y coordinates"},
"dropletBlock_moveTo_param0":function(d){return "x"},
"dropletBlock_moveTo_param1":function(d){return "y"},
"dropletBlock_multiplyOperator_description":function(d){return "Multiply two numbers"},
"dropletBlock_multiplyOperator_signatureOverride":function(d){return "Multiply operator"},
"dropletBlock_notOperator_description":function(d){return "Logical NOT of a boolean"},
"dropletBlock_notOperator_signatureOverride":function(d){return "AND boolean operator"},
"dropletBlock_onEvent_description":function(d){return "特定のイベントに対して、コードを実行する"},
"dropletBlock_onEvent_param0":function(d){return "id"},
"dropletBlock_onEvent_param1":function(d){return "event"},
"dropletBlock_onEvent_param2":function(d){return "function"},
"dropletBlock_orOperator_description":function(d){return "Logical OR of two booleans"},
"dropletBlock_orOperator_signatureOverride":function(d){return "OR boolean operator"},
"dropletBlock_penColor_description":function(d){return "Set the turtle to the specified pen color"},
"dropletBlock_penColor_param0":function(d){return "color"},
"dropletBlock_penColour_description":function(d){return "Set the turtle to the specified pen color"},
"dropletBlock_penColour_param0":function(d){return "color"},
"dropletBlock_penDown_description":function(d){return "Set down the turtle's pen"},
"dropletBlock_penUp_description":function(d){return "Pick up the turtle's pen"},
"dropletBlock_penWidth_description":function(d){return "Set the turtle to the specified pen width"},
"dropletBlock_penWidth_param0":function(d){return "幅"},
"dropletBlock_playSound_description":function(d){return "Play the MP3, OGG, or WAV sound file from the specified URL"},
"dropletBlock_playSound_param0":function(d){return "url"},
"dropletBlock_putImageData_description":function(d){return "Set the ImageData for a rectangle within the active  canvas with x, y as the top left coordinates"},
"dropletBlock_putImageData_param0":function(d){return "imageData"},
"dropletBlock_putImageData_param1":function(d){return "startX"},
"dropletBlock_putImageData_param2":function(d){return "startY"},
"dropletBlock_radioButton_description":function(d){return "Create a radio button and assign it an element id"},
"dropletBlock_radioButton_param0":function(d){return "id"},
"dropletBlock_radioButton_param1":function(d){return "checked"},
"dropletBlock_radioButton_param2":function(d){return "group"},
"dropletBlock_randomNumber_max_description":function(d){return "Get a random number between 0 and the specified maximum value"},
"dropletBlock_randomNumber_max_signatureOverride":function(d){return "randomNumber(max)"},
"dropletBlock_randomNumber_min_max_description":function(d){return "Get a random number between the specified minimum and maximum values"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_readRecords_description":function(d){return "Reads all records whose properties match those on the searchParams object."},
"dropletBlock_readRecords_param0":function(d){return "テーブルネーム"},
"dropletBlock_readRecords_param1":function(d){return "searchParams"},
"dropletBlock_readRecords_param2":function(d){return "onSuccess"},
"dropletBlock_rect_description":function(d){return "Draw a rectangle on the active  canvas with x, y, width, and height coordinates"},
"dropletBlock_rect_param0":function(d){return "upperLeftX"},
"dropletBlock_rect_param1":function(d){return "upperLeftY"},
"dropletBlock_rect_param2":function(d){return "幅"},
"dropletBlock_rect_param3":function(d){return "高さ"},
"dropletBlock_return_description":function(d){return "Return a value from a function"},
"dropletBlock_return_signatureOverride":function(d){return "返す"},
"dropletBlock_setActiveCanvas_description":function(d){return "Set the canvas id for subsequent canvas commands (only needed when there are multiple canvas elements)"},
"dropletBlock_setActiveCanvas_param0":function(d){return "canvasId"},
"dropletBlock_setAlpha_description":function(d){return "Sets the given value"},
"dropletBlock_setAlpha_param0":function(d){return "imageData"},
"dropletBlock_setAlpha_param1":function(d){return "x"},
"dropletBlock_setAlpha_param2":function(d){return "y"},
"dropletBlock_setAlpha_param3":function(d){return "alphaValue"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_setBackground_description":function(d){return "背景画像を設定"},
"dropletBlock_setBlue_description":function(d){return "Sets the given value"},
"dropletBlock_setBlue_param0":function(d){return "imageData"},
"dropletBlock_setBlue_param1":function(d){return "x"},
"dropletBlock_setBlue_param2":function(d){return "y"},
"dropletBlock_setBlue_param3":function(d){return "blueValue"},
"dropletBlock_setChecked_description":function(d){return "Set the state of a checkbox or radio button"},
"dropletBlock_setChecked_param0":function(d){return "id"},
"dropletBlock_setChecked_param1":function(d){return "checked"},
"dropletBlock_setFillColor_description":function(d){return "Set the fill color for the active  canvas"},
"dropletBlock_setFillColor_param0":function(d){return "color"},
"dropletBlock_setGreen_description":function(d){return "Sets the given value"},
"dropletBlock_setGreen_param0":function(d){return "imageData"},
"dropletBlock_setGreen_param1":function(d){return "x"},
"dropletBlock_setGreen_param2":function(d){return "y"},
"dropletBlock_setGreen_param3":function(d){return "greenValue"},
"dropletBlock_setImageURL_description":function(d){return "Set the URL for the specified image element id"},
"dropletBlock_setImageURL_param0":function(d){return "id"},
"dropletBlock_setImageURL_param1":function(d){return "url"},
"dropletBlock_setInterval_description":function(d){return "Continue to execute code each time the specified number of milliseconds has elapsed"},
"dropletBlock_setInterval_param0":function(d){return "callbackFunction"},
"dropletBlock_setInterval_param1":function(d){return "milliseconds"},
"dropletBlock_setKeyValue_description":function(d){return "Saves the value associated with the key to the remote data store."},
"dropletBlock_setKeyValue_param0":function(d){return "キー"},
"dropletBlock_setKeyValue_param1":function(d){return "value"},
"dropletBlock_setKeyValue_param2":function(d){return "callbackFunction"},
"dropletBlock_setParent_description":function(d){return "Set an element to become a child of a parent element"},
"dropletBlock_setPosition_description":function(d){return "Position an element with x, y, width, and height coordinates"},
"dropletBlock_setPosition_param0":function(d){return "id"},
"dropletBlock_setPosition_param1":function(d){return "x"},
"dropletBlock_setPosition_param2":function(d){return "y"},
"dropletBlock_setPosition_param3":function(d){return "幅"},
"dropletBlock_setPosition_param4":function(d){return "高さ"},
"dropletBlock_setRed_description":function(d){return "Sets the given value"},
"dropletBlock_setRed_param0":function(d){return "imageData"},
"dropletBlock_setRed_param1":function(d){return "x"},
"dropletBlock_setRed_param2":function(d){return "y"},
"dropletBlock_setRed_param3":function(d){return "redValue"},
"dropletBlock_setRGB_description":function(d){return "Sets the RGB color values (ranging from 0 to 255) of the pixel located at the given x and y position in the given image data to the input red, green, blue amounts"},
"dropletBlock_setRGB_param0":function(d){return "imageData"},
"dropletBlock_setRGB_param1":function(d){return "x"},
"dropletBlock_setRGB_param2":function(d){return "y"},
"dropletBlock_setRGB_param3":function(d){return "赤"},
"dropletBlock_setRGB_param4":function(d){return "緑"},
"dropletBlock_setRGB_param5":function(d){return "青"},
"dropletBlock_setStrokeColor_description":function(d){return "Set the stroke color for the active  canvas"},
"dropletBlock_setStrokeColor_param0":function(d){return "color"},
"dropletBlock_setSprite_description":function(d){return "キャラクターのイメージを設定"},
"dropletBlock_setSpriteEmotion_description":function(d){return "キャラの表情をセット"},
"dropletBlock_setSpritePosition_description":function(d){return "キャラを指定した場所にすぐにうごかします。"},
"dropletBlock_setSpriteSpeed_description":function(d){return "キャラクターのはやさをセット"},
"dropletBlock_setStrokeWidth_description":function(d){return "Set the line width for the active  canvas"},
"dropletBlock_setStrokeWidth_param0":function(d){return "幅"},
"dropletBlock_setStyle_description":function(d){return "Add CSS style text to an element"},
"dropletBlock_setText_description":function(d){return "Set the text for the specified element"},
"dropletBlock_setText_param0":function(d){return "id"},
"dropletBlock_setText_param1":function(d){return "テキスト"},
"dropletBlock_setTimeout_description":function(d){return "Set a timer and execute code when that number of milliseconds has elapsed"},
"dropletBlock_setTimeout_param0":function(d){return "function"},
"dropletBlock_setTimeout_param1":function(d){return "milliseconds"},
"dropletBlock_show_description":function(d){return "Show the turtle image at its current location"},
"dropletBlock_showElement_description":function(d){return "Show the element with the specified id"},
"dropletBlock_showElement_param0":function(d){return "id"},
"dropletBlock_speed_description":function(d){return "Change the execution speed of the program to the specified percentage value"},
"dropletBlock_speed_param0":function(d){return "value"},
"dropletBlock_startWebRequest_description":function(d){return "Request data from the internet and execute code when the request is complete"},
"dropletBlock_startWebRequest_param0":function(d){return "url"},
"dropletBlock_startWebRequest_param1":function(d){return "function"},
"dropletBlock_subtractOperator_description":function(d){return "Subtract two numbers"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_textInput_description":function(d){return "Create a text input and assign it an element id"},
"dropletBlock_textInput_param0":function(d){return "inputId"},
"dropletBlock_textInput_param1":function(d){return "テキスト"},
"dropletBlock_textLabel_description":function(d){return "Create a text label, assign it an element id, and bind it to an associated element"},
"dropletBlock_textLabel_param0":function(d){return "labelId"},
"dropletBlock_textLabel_param1":function(d){return "テキスト"},
"dropletBlock_textLabel_param2":function(d){return "forId"},
"dropletBlock_throw_description":function(d){return "指定したキャラクターからの物をなげます。"},
"dropletBlock_turnLeft_description":function(d){return "Turn the turtle counterclockwise by the specified number of degrees"},
"dropletBlock_turnLeft_param0":function(d){return "angle"},
"dropletBlock_turnRight_description":function(d){return "Turn the turtle clockwise by the specified number of degrees"},
"dropletBlock_turnRight_param0":function(d){return "angle"},
"dropletBlock_turnTo_description":function(d){return "Turn the turtle to the specified direction (0 degrees is pointing up)"},
"dropletBlock_turnTo_param0":function(d){return "angle"},
"dropletBlock_updateRecord_description":function(d){return "Updates a record, identified by record.id."},
"dropletBlock_updateRecord_param0":function(d){return "テーブルネーム"},
"dropletBlock_updateRecord_param1":function(d){return "記録"},
"dropletBlock_updateRecord_param2":function(d){return "callbackFunction"},
"dropletBlock_vanish_description":function(d){return "キャラクターを消します。"},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"dropletBlock_write_description":function(d){return "Create a block of text"},
"dropletBlock_write_param0":function(d){return "テキスト"},
"end":function(d){return "終了"},
"emptyBlocksErrorMsg":function(d){return "”Repeat”または\"If\"のブロックを動作をさせるためには内側に別のブロックが必要になります。ブロック 内に内側のブロックが適切にはめ込まれているか確認をしてください。"},
"emptyFunctionalBlock":function(d){return "入力値が空のブロックがあります。"},
"emptyFunctionBlocksErrorMsg":function(d){return "関数ブロックは、中に他のブロックがないと動きません。"},
"errorEmptyFunctionBlockModal":function(d){return "関数の中に他のブロックがありません。「編集」をクリックしてから緑色のブロックの中にほかのブロックを持ってきてください。"},
"errorIncompleteBlockInFunction":function(d){return "「編集」をクリックして、関数定義の中に足りないブロックがないか確認してください。"},
"errorParamInputUnattached":function(d){return "ワークスペース内の関数ブロックのそれぞれのパラメーター入力にブロックをくっつけるのを忘れないでください。"},
"errorUnusedParam":function(d){return "パラメーターブロックを追加しましたが、使われていないようです。「編集」をクリックして緑色のブロックの中にパラメーターブロックを置いて、パラメータが使われていることを確認してください。"},
"errorRequiredParamsMissing":function(d){return "「編集」をクリックして必要なパラメータを作ってください。新しいパラメーターブロックを関数の定義にドラッグして持ってきましょう。"},
"errorUnusedFunction":function(d){return "関数を作りましたが、ワークスペースの中で使われていません。ツールボックスの「関数」をクリックして、プログラムの中で使われているか確認してください。"},
"errorQuestionMarksInNumberField":function(d){return "\"???\"を何かの値に置きかえてみて。"},
"extraTopBlocks":function(d){return "ブロックを外しました。もしかして、「実行時」のブロックにつなげたかったですか？"},
"extraTopBlocksWhenRun":function(d){return "You have unattached blocks. Did you mean to attach these to the \"when run\" block?"},
"finalStage":function(d){return "おめでとうございます ！最終ステージをクリアしました。"},
"finalStageTrophies":function(d){return "おめでとうございます ！最終ステージをクリアしたので  "+locale.p(d,"numTrophies",0,"ja",{"one":"トロフィー","other":locale.n(d,"numTrophies")+" トロフィー"})+"を獲得しました。"},
"finish":function(d){return "完了"},
"generatedCodeInfo":function(d){return "アメリカのトップの大学(例えば、"+locale.v(d,"berkeleyLink")+" "+locale.v(d,"harvardLink")+")でもブロック ベースのプログラミングを教えています 。あなたが組み合わせたブロックは実際のプログラム言語でどのようになっているか確認できるようにJavaScriptで表示できます。JavaScriptは世界中で最も広く使われているプログラム言語です。"},
"hashError":function(d){return "申し訳ありませんが、'%1'は保存されているプログラムと一致しません。"},
"help":function(d){return "ヘルプ"},
"hintTitle":function(d){return "ヒント:"},
"jump":function(d){return "ジャンプ"},
"keepPlaying":function(d){return "Keep Playing"},
"levelIncompleteError":function(d){return "構成に必要なブロックをすべて使っていますが、使い方が適切ではありません。"},
"listVariable":function(d){return "リスト"},
"makeYourOwnFlappy":function(d){return "自分だけの「パタパタゲーム」を作りましょう。"},
"missingBlocksErrorMsg":function(d){return "下にあるブロックを使ってこのパズルを解いてみましょう。"},
"nextLevel":function(d){return "おめでとうございます ！あなたはパズルを "+locale.v(d,"puzzleNumber")+" 完了しました。"},
"nextLevelTrophies":function(d){return "おめでとうございます ！あなたはパズル "+locale.v(d,"puzzleNumber")+" をクリアし、"+locale.p(d,"numTrophies",0,"ja",{"one":"トロフィー","other":locale.n(d,"numTrophies")+" トロフィー"})+"を獲得しました。"},
"nextPuzzle":function(d){return "Next Puzzle"},
"nextStage":function(d){return "おめでとうございます ！"+locale.v(d,"stageName")+"を クリアしました。"},
"nextStageTrophies":function(d){return "おめでとうございます！ "+locale.v(d,"stageName")+" をクリアして "+locale.p(d,"numTrophies",0,"ja",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+" を手に入れました。"},
"numBlocksNeeded":function(d){return "おめでとうございます ！あなたはパズル "+locale.v(d,"puzzleNumber")+" をクリアしました。 (ヒント： "+locale.p(d,"numBlocks",0,"ja",{"one":"1 block","other":locale.n(d,"numBlocks")+" blocks"})+" だけで解くこともできました。)"},
"numLinesOfCodeWritten":function(d){return "あなたはたった今 "+locale.p(d,"numLines",0,"ja",{"one":"1 行","other":locale.n(d,"numLines")+" 行"})+" のコードを書きました！"},
"play":function(d){return "再生する"},
"print":function(d){return "印刷"},
"puzzleTitle":function(d){return "パズル "+locale.v(d,"puzzle_number")+" (全 "+locale.v(d,"stage_total")+" ステージ)"},
"repeat":function(d){return "繰り返し"},
"resetProgram":function(d){return "リセット"},
"runProgram":function(d){return "実行"},
"runTooltip":function(d){return "ワークスペース内にブロックで作られたプログラムを実行します。\n"},
"score":function(d){return "スコア"},
"showCodeHeader":function(d){return "コードの表示"},
"showBlocksHeader":function(d){return "ブロックを表示"},
"showGeneratedCode":function(d){return "コードを表示します。"},
"stringEquals":function(d){return "文字列 =？"},
"subtitle":function(d){return "ビジュアル ・ プログラミング環境"},
"textVariable":function(d){return "テキスト"},
"tooFewBlocksMsg":function(d){return "すべての必要な種類のブロックを使用していますが、これらの種類のブロックも使ってみてこのパズルを完成させてください。"},
"tooManyBlocksMsg":function(d){return "このパズルは <x id='START_SPAN'/><x id='END_SPAN'/>のブロックで解決できます。\n"},
"tooMuchWork":function(d){return "ちょっと作業が多すぎますね！もう少し繰り返し回数を少なくできませんか？"},
"toolboxHeader":function(d){return "ブロック達"},
"toolboxHeaderDroplet":function(d){return "Toolbox"},
"hideToolbox":function(d){return "(Hide)"},
"showToolbox":function(d){return "Show Toolbox"},
"openWorkspace":function(d){return "仕組み"},
"totalNumLinesOfCodeWritten":function(d){return "すべての時間の合計:  "+locale.p(d,"numLines",0,"ja",{"one":"1 ライン","other":locale.n(d,"numLines")+" ライン"})+" のコード\n"},
"tryAgain":function(d){return "やり直す"},
"hintRequest":function(d){return "ヒントを見る"},
"backToPreviousLevel":function(d){return "前のレベルに戻る"},
"saveToGallery":function(d){return "ギャラリーに保存"},
"savedToGallery":function(d){return "ギャラリーに保存されました！"},
"shareFailure":function(d){return "プログラムをシェアできませんでした。"},
"workspaceHeaderShort":function(d){return "ワークスペース："},
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