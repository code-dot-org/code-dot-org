var applab_locale = {lc:{"ar":function(n){
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
  },"it":function(n){return n===1?"one":"other"},"ja":function(n){return "other"}},
c:function(d,k){if(!d)throw new Error("MessageFormat: Data required for '"+k+"'.")},
n:function(d,k,o){if(isNaN(d[k]))throw new Error("MessageFormat: '"+k+"' isn't a number.");return d[k]-(o||0)},
v:function(d,k){applab_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){applab_locale.c(d,k);return d[k] in p?p[d[k]]:(k=applab_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){applab_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).applab_locale = {
"catActions":function(d){return "操作"},
"catControl":function(d){return "ループ"},
"catEvents":function(d){return "イベント"},
"catLogic":function(d){return "ロジック（論理）"},
"catMath":function(d){return "数値"},
"catProcedures":function(d){return "関数"},
"catText":function(d){return "テキスト"},
"catVariables":function(d){return "変数"},
"continue":function(d){return "次へ"},
"container":function(d){return "containerを作成します。"},
"containerTooltip":function(d){return "Div containerを作成し、その内部HTMLを設定します。"},
"finalLevel":function(d){return "おめでとうございます ！最後のパズルを解決しました。"},
"nextLevel":function(d){return "おめでとうございます ！このパズルを完了しました。"},
"no":function(d){return "いいえ"},
"numBlocksNeeded":function(d){return "このパズルは%1個のブロックで解けます。"},
"pause":function(d){return "一時停止"},
"reinfFeedbackMsg":function(d){return "「リトライ」ボタンを押すと実行しているアプリに戻ります。"},
"repeatForever":function(d){return "永遠に繰りかえす"},
"repeatDo":function(d){return "してください"},
"repeatForeverTooltip":function(d){return "アプリが動いている間、このブロック内のアクションをくりかえし実行します。"},
"shareApplabTwitter":function(d){return "私の作ったアプリを見てください。 @codeorg を使って自分でコーディングしました。"},
"shareGame":function(d){return "アプリをシェアする："},
"stepIn":function(d){return "ステップイン"},
"stepOver":function(d){return "ステップオーバー"},
"stepOut":function(d){return "ステップアウト"},
"viewData":function(d){return "データの表示"},
"yes":function(d){return "はい"}};