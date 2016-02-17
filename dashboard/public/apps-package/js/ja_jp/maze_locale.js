var maze_locale = {lc:{"ar":function(n){
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
v:function(d,k){maze_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){maze_locale.c(d,k);return d[k] in p?p[d[k]]:(k=maze_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){maze_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).maze_locale = {
"atHoneycomb":function(d){return "はちのす"},
"atFlower":function(d){return "はな"},
"avoidCowAndRemove":function(d){return "うしにぶつからないように つちをかたづけよう"},
"continue":function(d){return "続行"},
"dig":function(d){return "つちをかたづける"},
"digTooltip":function(d){return "つちをかたづける"},
"dirE":function(d){return "みぎ"},
"dirN":function(d){return "うえ"},
"dirS":function(d){return "した"},
"dirW":function(d){return "西"},
"doCode":function(d){return "やること"},
"elseCode":function(d){return "ちがうときには"},
"fill":function(d){return "あなをうめる"},
"fillN":function(d){return maze_locale.v(d,"shovelfuls")+"かい あなをうめる"},
"fillStack":function(d){return maze_locale.v(d,"shovelfuls")+"つのあなをうめる"},
"fillSquare":function(d){return "しかくのなかを ぬる"},
"fillTooltip":function(d){return "つちを１かい おく"},
"finalLevel":function(d){return "やったね！ さいごのパズルができたね！"},
"flowerEmptyError":function(d){return "このはなには みつがないよ。"},
"get":function(d){return "取得"},
"heightParameter":function(d){return "たかさ"},
"holePresent":function(d){return "あながある"},
"honey":function(d){return "はちみつをつくる"},
"honeyAvailable":function(d){return "はちみつ"},
"honeyTooltip":function(d){return "はなのみつを はちみつにする"},
"honeycombFullError":function(d){return "はちのすは いっぱいになりました。はちみつをつくれません。"},
"ifCode":function(d){return "もし"},
"ifInRepeatError":function(d){return "「もういっかいやる」ブロックのなかに「もしも」のブロックがひつようです。もしわからなくなったら、ひとつまえのレベルにもどって、「もしも」のブロックが、どうやってうごいたか、みてみましょう。"},
"ifPathAhead":function(d){return "もし まえにいけるなら"},
"ifTooltip":function(d){return "もしも、いきたいところに、みちがあったら、なにかやってみます。"},
"ifelseTooltip":function(d){return "もしも、いきたいほうに、みちがあったら、ひとつめのブロックをやってみましょう。もしも、みちがなかったら、ふたつめのブロックをやってみましょう。"},
"ifFlowerTooltip":function(d){return "はなや はちのすがあるときにだけ、どうぐをつかいます。"},
"ifOnlyFlowerTooltip":function(d){return "指定した方向に花があれば、なにかアクションをおこします"},
"ifelseFlowerTooltip":function(d){return "はなや はちのすがあるときにだけ、うえのどうぐをつかいます。ないときには、したのどうぐをつかいます。"},
"insufficientHoney":function(d){return "どうぐをただしくつかうことができたね！ でも、はちみつがたりないよ！"},
"insufficientNectar":function(d){return "どうぐをただしくつかうことができたね！ でも、はなのみつがたりないよ！"},
"make":function(d){return "つくる"},
"moveBackward":function(d){return "うしろにもどる"},
"moveEastTooltip":function(d){return "いっぽみぎにうごくよ。"},
"moveForward":function(d){return "まえにすすむ"},
"moveForwardTooltip":function(d){return "わたしを、いっぽ、すすめてください。"},
"moveNorthTooltip":function(d){return "いっぽうえにうごくよ。"},
"moveSouthTooltip":function(d){return "いっぽしたにうごくよ。"},
"moveTooltip":function(d){return "いっぽまえかうしろにうごくよ。"},
"moveWestTooltip":function(d){return "いっぽひだりにうごくよ。"},
"nectar":function(d){return "はなのみつをとる"},
"nectarRemaining":function(d){return "はなのみつ"},
"nectarTooltip":function(d){return "はなのみつをとるよ。"},
"nextLevel":function(d){return "やったね！ パズルができたね！"},
"no":function(d){return "ちがいます"},
"noPathAhead":function(d){return "そこは とおれないよ"},
"noPathLeft":function(d){return "ひだりに　いけません"},
"noPathRight":function(d){return "みぎに　いけません"},
"notAtFlowerError":function(d){return "ここでは、はなのみつをとれないよ。"},
"notAtHoneycombError":function(d){return "ここでは、はちみつをつくれないよ。"},
"numBlocksNeeded":function(d){return "ぶひんを %1こつかって つくってみよう。"},
"pathAhead":function(d){return "まえに みちがある"},
"pathLeft":function(d){return "ひだりに みちがあるなら"},
"pathRight":function(d){return "みぎに みちがあるなら"},
"pilePresent":function(d){return "つちのやまがある"},
"putdownTower":function(d){return "タワーを　おいてください"},
"removeAndAvoidTheCow":function(d){return "うしにぶつからないように つちをかたづける"},
"removeN":function(d){return maze_locale.v(d,"shovelfuls")+"かい つちをかたづける"},
"removePile":function(d){return "つちをかたづける"},
"removeStack":function(d){return maze_locale.v(d,"shovelfuls")+"かい つちをかたづける"},
"removeSquare":function(d){return "しかくを けす"},
"repeatCarefullyError":function(d){return "このもんだいを　とくときの　ちゅういは、ふたつ　うごかさなくては　いけないことと、”おなじことを　くりかえす”ブロックのなかに　いっかい　まがるを　いれないと　いけないことです。　さいごは、　いっかい　よぶんにまがっても　だいじょうぶです。"},
"repeatUntil":function(d){return "とどくまで くりかえす"},
"repeatUntilBlocked":function(d){return "まえにみちがあるとき"},
"repeatUntilFinish":function(d){return "とどくまで くりかえす"},
"step":function(d){return "ステップ"},
"totalHoney":function(d){return "ぜんぶのはちみつ"},
"totalNectar":function(d){return "ぜんぶのはなのみつ"},
"turnLeft":function(d){return "ひだりに　まがる"},
"turnRight":function(d){return "みぎに　まがる"},
"turnTooltip":function(d){return "わたしを、みぎ か ひだりへ　 ちょっかくに　まがらせて　ください"},
"uncheckedCloudError":function(d){return "くものなかにあるのは、もしかしたらはなですか？ はちのすですか？ どうぐをつかってしらべよう。"},
"uncheckedPurpleError":function(d){return "むらさきのはなに、みつがあるかどうか。どうぐをつかってしらべてみよう。"},
"whileMsg":function(d){return "以下の間"},
"whileTooltip":function(d){return "しゅうてんに　たどりつくまで、かこってある　うごきを　くりかえし　やってください。"},
"word":function(d){return "ことばを　みつけましょう"},
"yes":function(d){return "はい"},
"youSpelled":function(d){return "あなたのスペル"},
"didNotCollectEverything":function(d){return "Make sure you don't leave any nectar or honey behind!"}};