var studio_locale = {lc:{"ar":function(n){
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
v:function(d,k){studio_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){studio_locale.c(d,k);return d[k] in p?p[d[k]]:(k=studio_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){studio_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).studio_locale = {
"actor":function(d){return "キャラ"},
"addItems1":function(d){return "このアイテムを 1 つ追加"},
"addItems2":function(d){return "このアイテムを 2 つ追加"},
"addItems3":function(d){return "このアイテムを 3 つ追加"},
"addItems5":function(d){return "このアイテムを 5 つ追加"},
"addItems10":function(d){return "このアイテムを 10 こ追加"},
"addItemsRandom":function(d){return "このアイテムをランダムに追加"},
"addItemsTooltip":function(d){return "シーンにアイテムを追加"},
"alienInvasion":function(d){return "エイリアンが侵略(しんりゃく) してきた！"},
"backgroundBlack":function(d){return "まっくろ"},
"backgroundCave":function(d){return "どうくつ"},
"backgroundCloudy":function(d){return "くもり"},
"backgroundHardcourt":function(d){return "テニスコート"},
"backgroundNight":function(d){return "よる"},
"backgroundUnderwater":function(d){return "みずのなか"},
"backgroundCity":function(d){return "まち"},
"backgroundDesert":function(d){return "さばく"},
"backgroundRainbow":function(d){return "にじ"},
"backgroundSoccer":function(d){return "サッカー"},
"backgroundSpace":function(d){return "うちゅう"},
"backgroundTennis":function(d){return "テニス"},
"backgroundWinter":function(d){return "ふゆ"},
"catActions":function(d){return "操作"},
"catControl":function(d){return "ループ"},
"catEvents":function(d){return "イベント"},
"catLogic":function(d){return "ロジック（論理）"},
"catMath":function(d){return "数値"},
"catProcedures":function(d){return "関数"},
"catText":function(d){return "テキスト"},
"catVariables":function(d){return "変数"},
"changeScoreTooltip":function(d){return "スコアへポイントを追加または削除します。"},
"changeScoreTooltipK1":function(d){return "スコアにポイントを追加します。"},
"continue":function(d){return "次へ"},
"decrementPlayerScore":function(d){return "減点する"},
"defaultSayText":function(d){return "ここに入力"},
"dropletBlock_changeScore_description":function(d){return "スコアへポイントを追加または削除します。"},
"dropletBlock_penColour_description":function(d){return "Sets the color of the line drawn behind the turtle as it moves"},
"dropletBlock_penColour_param0":function(d){return "color"},
"dropletBlock_setBackground_description":function(d){return "背景画像を設定"},
"dropletBlock_setSpriteEmotion_description":function(d){return "キャラの表情をセット"},
"dropletBlock_setSpritePosition_description":function(d){return "キャラを指定した場所にすぐにうごかします。"},
"dropletBlock_setSpriteSpeed_description":function(d){return "キャラのはやさをセット"},
"dropletBlock_setSprite_description":function(d){return "キャラのイメージを設定"},
"dropletBlock_throw_description":function(d){return "指定したキャラから弾を撃ちます。"},
"dropletBlock_vanish_description":function(d){return "キャラを消します。"},
"emotion":function(d){return "気分"},
"finalLevel":function(d){return "おめでとうございます ！最後のパズルを解決しました。"},
"for":function(d){return "ため"},
"hello":function(d){return "こんにちは"},
"helloWorld":function(d){return "ハローワールド！"},
"incrementPlayerScore":function(d){return "加点する"},
"itemBlueFireball":function(d){return "青い火の玉"},
"itemPurpleFireball":function(d){return "むらさきの火の玉"},
"itemRedFireball":function(d){return "赤い火の玉"},
"itemYellowHearts":function(d){return "黄色いハート"},
"itemPurpleHearts":function(d){return "むらさきのハート"},
"itemRedHearts":function(d){return "赤いハート"},
"itemRandom":function(d){return "ランダム"},
"itemAnna":function(d){return "かぎ針"},
"itemElsa":function(d){return "キラキラ輝く"},
"itemHiro":function(d){return "マイクロボット"},
"itemBaymax":function(d){return "ロケット"},
"itemRapunzel":function(d){return "片手鍋"},
"itemCherry":function(d){return "チェリー"},
"itemIce":function(d){return "氷"},
"itemDuck":function(d){return "アヒル"},
"makeProjectileDisappear":function(d){return "消える"},
"makeProjectileBounce":function(d){return "はねる"},
"makeProjectileBlueFireball":function(d){return "青い火の玉を作る"},
"makeProjectilePurpleFireball":function(d){return "むらさきの火の玉を作る"},
"makeProjectileRedFireball":function(d){return "赤い火の玉を作る"},
"makeProjectileYellowHearts":function(d){return "きいろいハートを作る"},
"makeProjectilePurpleHearts":function(d){return "むらさきのハートを作る"},
"makeProjectileRedHearts":function(d){return "赤いハートを作る"},
"makeProjectileTooltip":function(d){return "投射物を衝突した瞬間消す、もしくは跳ねる"},
"makeYourOwn":function(d){return "あなた専用のプレイラボアプリを作ろう！"},
"moveDirectionDown":function(d){return "下"},
"moveDirectionLeft":function(d){return "左"},
"moveDirectionRight":function(d){return "右"},
"moveDirectionUp":function(d){return "上"},
"moveDirectionRandom":function(d){return "ランダム"},
"moveDistance25":function(d){return "25 ピクセル"},
"moveDistance50":function(d){return "50 ピクセル"},
"moveDistance100":function(d){return "100 ピクセル"},
"moveDistance200":function(d){return "200 ピクセル"},
"moveDistance400":function(d){return "400 ピクセル"},
"moveDistancePixels":function(d){return "ピクセル"},
"moveDistanceRandom":function(d){return "ランダムなピクセル"},
"moveDistanceTooltip":function(d){return "キャラを指定方向に特定距離で移動させる。"},
"moveSprite":function(d){return "移動"},
"moveSpriteN":function(d){return "キャラ"+studio_locale.v(d,"spriteIndex")+"をうごかす"},
"toXY":function(d){return "x と y へ"},
"moveDown":function(d){return "下に移動します。"},
"moveDownTooltip":function(d){return "キャラを下にうごかす。"},
"moveLeft":function(d){return "左に移動"},
"moveLeftTooltip":function(d){return "キャラを左にうごかす。"},
"moveRight":function(d){return "右に移動します。"},
"moveRightTooltip":function(d){return "キャラを右にうごかす。"},
"moveUp":function(d){return "上に移動します。"},
"moveUpTooltip":function(d){return "キャラを上にうごかす。"},
"moveTooltip":function(d){return "キャラをうごかす。"},
"nextLevel":function(d){return "おめでとうございます ！このパズルを完了しました。"},
"no":function(d){return "いいえ"},
"numBlocksNeeded":function(d){return "このパズルは%1個のブロックで解けます。"},
"onEventTooltip":function(d){return "特定のイベントに対して、コードを実行する"},
"ouchExclamation":function(d){return "いたい！"},
"playSoundCrunch":function(d){return "バリバリ音の再生"},
"playSoundGoal1":function(d){return "目標 1 のサウンドを再生します。"},
"playSoundGoal2":function(d){return "目標 2 サウンドを再生します。"},
"playSoundHit":function(d){return "サウンドを押して再生します。"},
"playSoundLosePoint":function(d){return "失点音の再生してください。"},
"playSoundLosePoint2":function(d){return "失点音2の再生をしてください。"},
"playSoundRetro":function(d){return "レトロなサウンドを再生します。"},
"playSoundRubber":function(d){return "ゴムの音を再生します。"},
"playSoundSlap":function(d){return "平手打ちの音を再生します。"},
"playSoundTooltip":function(d){return "選択音を再生"},
"playSoundWinPoint":function(d){return "勝利ポイントの音を再生します。"},
"playSoundWinPoint2":function(d){return "勝利ポイント2の音を再生します。"},
"playSoundWood":function(d){return "木製の音を再生します。"},
"positionOutTopLeft":function(d){return "左上のさらに上へ"},
"positionOutTopRight":function(d){return "右上のさらに上へ"},
"positionTopOutLeft":function(d){return "左の外側の上へ"},
"positionTopLeft":function(d){return "左上に"},
"positionTopCenter":function(d){return "上のまんなかへ"},
"positionTopRight":function(d){return "右上に"},
"positionTopOutRight":function(d){return "右の外側の上へ"},
"positionMiddleLeft":function(d){return "左はしの真ん中に"},
"positionMiddleCenter":function(d){return "まんなかに"},
"positionMiddleRight":function(d){return "右はしのまんなかに"},
"positionBottomOutLeft":function(d){return "左の外側の下へ"},
"positionBottomLeft":function(d){return "左下に"},
"positionBottomCenter":function(d){return "下のまんなかへ"},
"positionBottomRight":function(d){return "右下へ"},
"positionBottomOutRight":function(d){return "右の外側の下へ"},
"positionOutBottomLeft":function(d){return "左下のさらに下へ"},
"positionOutBottomRight":function(d){return "右下のさらに下へ"},
"positionRandom":function(d){return "ランダムな位置に"},
"projectileBlueFireball":function(d){return "青い火の玉"},
"projectilePurpleFireball":function(d){return "むらさきの火の玉"},
"projectileRedFireball":function(d){return "赤い火の玉"},
"projectileYellowHearts":function(d){return "黄色いハート"},
"projectilePurpleHearts":function(d){return "むらさきのハート"},
"projectileRedHearts":function(d){return "赤いハート"},
"projectileRandom":function(d){return "ランダム"},
"projectileAnna":function(d){return "かぎ針"},
"projectileElsa":function(d){return "キラキラ輝く"},
"projectileHiro":function(d){return "マイクロボット"},
"projectileBaymax":function(d){return "ロケット"},
"projectileRapunzel":function(d){return "片手鍋"},
"projectileCherry":function(d){return "チェリー"},
"projectileIce":function(d){return "氷"},
"projectileDuck":function(d){return "アヒル"},
"reinfFeedbackMsg":function(d){return studio_locale.v(d,"backButton")+" ボタンを押すとストーリーを再開できます"},
"repeatForever":function(d){return "ずっと"},
"repeatDo":function(d){return "してください"},
"repeatForeverTooltip":function(d){return "物語を動かしている間ずっと、ブロックの中のアクションをくりかえします。"},
"saySprite":function(d){return "言う"},
"saySpriteN":function(d){return "キャラ"+studio_locale.v(d,"spriteIndex")+"が言う"},
"saySpriteTooltip":function(d){return "指定したキャラから結び付けた文章の吹き出しを出す。"},
"saySpriteChoices_0":function(d){return "こんにちは。"},
"saySpriteChoices_1":function(d){return "みなさん、こんにちは"},
"saySpriteChoices_2":function(d){return "お元気ですか"},
"saySpriteChoices_3":function(d){return "おはようございます"},
"saySpriteChoices_4":function(d){return "こんにちは"},
"saySpriteChoices_5":function(d){return "おやすみなさい"},
"saySpriteChoices_6":function(d){return "こんばんは"},
"saySpriteChoices_7":function(d){return "新着情報"},
"saySpriteChoices_8":function(d){return "なにですか？"},
"saySpriteChoices_9":function(d){return "どこですか？"},
"saySpriteChoices_10":function(d){return "いつですか？"},
"saySpriteChoices_11":function(d){return "良い"},
"saySpriteChoices_12":function(d){return "素晴らしい！"},
"saySpriteChoices_13":function(d){return "了解"},
"saySpriteChoices_14":function(d){return "悪くないです"},
"saySpriteChoices_15":function(d){return "頑張ってください"},
"saySpriteChoices_16":function(d){return "はい"},
"saySpriteChoices_17":function(d){return "いいえ"},
"saySpriteChoices_18":function(d){return "オッケー"},
"saySpriteChoices_19":function(d){return "いい投球です！"},
"saySpriteChoices_20":function(d){return "良い1日を"},
"saySpriteChoices_21":function(d){return "さようなら"},
"saySpriteChoices_22":function(d){return "すぐに戻ってきます"},
"saySpriteChoices_23":function(d){return "ではまた明日"},
"saySpriteChoices_24":function(d){return "じゃあ、またね"},
"saySpriteChoices_25":function(d){return "体に気をつけて"},
"saySpriteChoices_26":function(d){return "お楽しみください"},
"saySpriteChoices_27":function(d){return "私は行かなくてはいけません。"},
"saySpriteChoices_28":function(d){return "友達になりたいですか？"},
"saySpriteChoices_29":function(d){return "素晴らし出来です！"},
"saySpriteChoices_30":function(d){return "やったー！"},
"saySpriteChoices_31":function(d){return "やったー！"},
"saySpriteChoices_32":function(d){return "初めまして"},
"saySpriteChoices_33":function(d){return "大丈夫だよ！"},
"saySpriteChoices_34":function(d){return "ありがとうございます"},
"saySpriteChoices_35":function(d){return "いいえ、大丈夫です。"},
"saySpriteChoices_36":function(d){return "あー！"},
"saySpriteChoices_37":function(d){return "気にしないで"},
"saySpriteChoices_38":function(d){return "今日"},
"saySpriteChoices_39":function(d){return "明日"},
"saySpriteChoices_40":function(d){return "昨日"},
"saySpriteChoices_41":function(d){return "あなたをみつけた！"},
"saySpriteChoices_42":function(d){return "わたしがみつかっちゃった！"},
"saySpriteChoices_43":function(d){return "10、9、8、7、6、5、4、3、2、1!"},
"saySpriteChoices_44":function(d){return "すばらしい！"},
"saySpriteChoices_45":function(d){return "おもしろい！"},
"saySpriteChoices_46":function(d){return "ハハハ！"},
"saySpriteChoices_47":function(d){return "素敵な友だちだよ！"},
"saySpriteChoices_48":function(d){return "気をつけて！"},
"saySpriteChoices_49":function(d){return "隠れろ！"},
"saySpriteChoices_50":function(d){return "りょうかい！"},
"saySpriteChoices_51":function(d){return "わー!"},
"saySpriteChoices_52":function(d){return "ごめんなさい！"},
"saySpriteChoices_53":function(d){return "きをつけて！"},
"saySpriteChoices_54":function(d){return "うわぁ！"},
"saySpriteChoices_55":function(d){return "おっと！"},
"saySpriteChoices_56":function(d){return "あぶないところだった！"},
"saySpriteChoices_57":function(d){return "ナイストライ！"},
"saySpriteChoices_58":function(d){return "ベロベロバ～"},
"scoreText":function(d){return "得点:"+studio_locale.v(d,"playerScore")},
"setBackground":function(d){return "背景をセット"},
"setBackgroundRandom":function(d){return "背景をランダムにセット"},
"setBackgroundBlack":function(d){return "背景を黒くする"},
"setBackgroundCave":function(d){return "背景をどうくつにする"},
"setBackgroundCloudy":function(d){return "背景を雲にする"},
"setBackgroundHardcourt":function(d){return "背景を木の模様にする"},
"setBackgroundNight":function(d){return "背景を夜にする"},
"setBackgroundUnderwater":function(d){return "背景を水の中にする"},
"setBackgroundCity":function(d){return "背景を街の中にする"},
"setBackgroundDesert":function(d){return "背景を砂漠にする"},
"setBackgroundRainbow":function(d){return "背景を虹にする"},
"setBackgroundSoccer":function(d){return "背景をサッカー場にする"},
"setBackgroundSpace":function(d){return "背景を宇宙にする"},
"setBackgroundTennis":function(d){return "背景をテニスコートにする"},
"setBackgroundWinter":function(d){return "背景を冬に"},
"setBackgroundLeafy":function(d){return "背景を葉の模様にする"},
"setBackgroundGrassy":function(d){return "背景を芝の模様にする"},
"setBackgroundFlower":function(d){return "背景を花の模様にする"},
"setBackgroundTile":function(d){return "背景をタイルにする"},
"setBackgroundIcy":function(d){return "背景を氷の模様にする"},
"setBackgroundSnowy":function(d){return "背景を雪の模様にする"},
"setBackgroundTooltip":function(d){return "背景画像を設定"},
"setEnemySpeed":function(d){return "てきのうごくはやさをえらぶ"},
"setPlayerSpeed":function(d){return "プレイヤーのうごくはやさをえらぶ"},
"setScoreText":function(d){return "得点を設定"},
"setScoreTextTooltip":function(d){return "得点欄に表示される文章を設定します。"},
"setSpriteEmotionAngry":function(d){return "プンプンで"},
"setSpriteEmotionHappy":function(d){return "うれしいかおに"},
"setSpriteEmotionNormal":function(d){return "ふつうのかおに"},
"setSpriteEmotionRandom":function(d){return "ランダムな気分に"},
"setSpriteEmotionSad":function(d){return "かなしいかおに"},
"setSpriteEmotionTooltip":function(d){return "キャラの表情をセット"},
"setSpriteAlien":function(d){return "宇宙人の画像に"},
"setSpriteBat":function(d){return "こうもりの画像に"},
"setSpriteBird":function(d){return "鳥の画像に"},
"setSpriteCat":function(d){return "ねこの画像に"},
"setSpriteCaveBoy":function(d){return "たんけんたいの男の子の画像に"},
"setSpriteCaveGirl":function(d){return "たんけんたいの女の子の画像に"},
"setSpriteDinosaur":function(d){return "恐竜の画像に"},
"setSpriteDog":function(d){return "犬の画像に"},
"setSpriteDragon":function(d){return "竜の画像に"},
"setSpriteGhost":function(d){return "おばけの画像に"},
"setSpriteHidden":function(d){return "非表示に"},
"setSpriteHideK1":function(d){return "かくす"},
"setSpriteAnna":function(d){return "アナの画像に"},
"setSpriteElsa":function(d){return "エルサの画像に"},
"setSpriteHiro":function(d){return "ヒロの画像に"},
"setSpriteBaymax":function(d){return "ベイマックスの画像に"},
"setSpriteRapunzel":function(d){return "ラプンツェルの画像に"},
"setSpriteKnight":function(d){return "騎士の画像に"},
"setSpriteMonster":function(d){return "怪物の画像に"},
"setSpriteNinja":function(d){return "仮面の忍者の画像に"},
"setSpriteOctopus":function(d){return "たこの画像に"},
"setSpritePenguin":function(d){return "ペンギンの画像に"},
"setSpritePirate":function(d){return "海賊の画像に"},
"setSpritePrincess":function(d){return "おひめさまの画像に"},
"setSpriteRandom":function(d){return "ランダムの画像に"},
"setSpriteRobot":function(d){return "ロボットの画像に"},
"setSpriteShowK1":function(d){return "表示(ひょうじ)する"},
"setSpriteSpacebot":function(d){return "宇宙ロボットの画像に"},
"setSpriteSoccerGirl":function(d){return "サッカーする女の子の画像に"},
"setSpriteSoccerBoy":function(d){return "サッカーをする男の子の画像に"},
"setSpriteSquirrel":function(d){return "リスの画像に"},
"setSpriteTennisGirl":function(d){return "テニスする女の子の画像に"},
"setSpriteTennisBoy":function(d){return "テニスする男の子の画像に"},
"setSpriteUnicorn":function(d){return "ユニコーンの画像に"},
"setSpriteWitch":function(d){return "魔女の画像に"},
"setSpriteWizard":function(d){return "魔法使いの画像に"},
"setSpritePositionTooltip":function(d){return "キャラを指定した場所にすぐにうごかします。"},
"setSpriteK1Tooltip":function(d){return "指定したキャラを表示するか隠すかします。"},
"setSpriteTooltip":function(d){return "キャラのイメージを設定"},
"setSpriteSizeRandom":function(d){return "ランダムなサイズに"},
"setSpriteSizeVerySmall":function(d){return "とてもちいさいサイズに"},
"setSpriteSizeSmall":function(d){return "ちいさいサイズに"},
"setSpriteSizeNormal":function(d){return "もとのサイズに"},
"setSpriteSizeLarge":function(d){return "大きいサイズに"},
"setSpriteSizeVeryLarge":function(d){return "とても大きいサイズに"},
"setSpriteSizeTooltip":function(d){return "キャラの大きさを設定"},
"setSpriteSpeedRandom":function(d){return "ランダムなスピードに"},
"setSpriteSpeedVerySlow":function(d){return "とてもおそいスピードに"},
"setSpriteSpeedSlow":function(d){return "おそいスピードに"},
"setSpriteSpeedNormal":function(d){return "ふつうのスピードに"},
"setSpriteSpeedFast":function(d){return "はやいスピードに"},
"setSpriteSpeedVeryFast":function(d){return "とてもはやいスピードに"},
"setSpriteSpeedTooltip":function(d){return "キャラのはやさをセット"},
"setSpriteZombie":function(d){return "ゾンビの画像に"},
"shareStudioTwitter":function(d){return "私のお話を見てください。 @codeorg を使って自分で作りました。"},
"shareGame":function(d){return "物語を共有する"},
"showCoordinates":function(d){return "座標を表示"},
"showCoordinatesTooltip":function(d){return "主人公の座標を画面に表示"},
"showTitleScreen":function(d){return "タイトル画面を表示する"},
"showTitleScreenTitle":function(d){return "タイトル"},
"showTitleScreenText":function(d){return "テキスト"},
"showTSDefTitle":function(d){return "ここにタイトルを入力"},
"showTSDefText":function(d){return "ここにテキストを入力"},
"showTitleScreenTooltip":function(d){return "だいめいとせつめいのあるひょうしをひょうじします。"},
"size":function(d){return "おおきさ"},
"setSprite":function(d){return "セット"},
"setSpriteN":function(d){return "キャラ"+studio_locale.v(d,"spriteIndex")+"をセット"},
"soundCrunch":function(d){return "ドスン"},
"soundGoal1":function(d){return "ゴール1"},
"soundGoal2":function(d){return "ゴール2"},
"soundHit":function(d){return "ヒット"},
"soundLosePoint":function(d){return "ポイントがへる"},
"soundLosePoint2":function(d){return "マイナス 2 ポイント"},
"soundRetro":function(d){return "レトロ"},
"soundRubber":function(d){return "ゴム"},
"soundSlap":function(d){return "たたく"},
"soundWinPoint":function(d){return "1ポイントゲット"},
"soundWinPoint2":function(d){return "2 ポイントゲット"},
"soundWood":function(d){return "木"},
"speed":function(d){return "スピード"},
"startSetValue":function(d){return "スタート（関数）"},
"startSetVars":function(d){return "ゲームの変数 (タイトル、サブタイトル、背景、ターゲット、危険度、プレーヤー)"},
"startSetFuncs":function(d){return "ゲームの関数 (ターゲットの更新、危険度の更新、プレイヤーの更新、衝突する？、画面上？)"},
"stopSprite":function(d){return "ストップ"},
"stopSpriteN":function(d){return "キャラ"+studio_locale.v(d,"spriteIndex")+"を止める"},
"stopTooltip":function(d){return "キャラの動きを止めます。"},
"throwSprite":function(d){return "投げる"},
"throwSpriteN":function(d){return "キャラ"+studio_locale.v(d,"spriteIndex")+"が撃つ"},
"throwTooltip":function(d){return "指定したキャラから弾を撃ちます。"},
"vanish":function(d){return "消す"},
"vanishActorN":function(d){return "キャラ"+studio_locale.v(d,"spriteIndex")+"を消す"},
"vanishTooltip":function(d){return "キャラを消します。"},
"waitFor":function(d){return "まで待つ"},
"waitSeconds":function(d){return "秒"},
"waitForClick":function(d){return "クリックされるまで待つ"},
"waitForRandom":function(d){return "ランダムびょうまつ"},
"waitForHalfSecond":function(d){return "0.5びょうまつ"},
"waitFor1Second":function(d){return "1びょうまつ"},
"waitFor2Seconds":function(d){return "2びょうまつ"},
"waitFor5Seconds":function(d){return "5びょうまつ"},
"waitFor10Seconds":function(d){return "10びょうまつ"},
"waitParamsTooltip":function(d){return "指定した秒待ってからクリックされます（ゼロも入力できます）。"},
"waitTooltip":function(d){return "指定した時間待ってからクリックされます。"},
"whenArrowDown":function(d){return "下向き矢印キーが押されたとき"},
"whenArrowLeft":function(d){return "左向き矢印キーが押されたとき"},
"whenArrowRight":function(d){return "→"},
"whenArrowUp":function(d){return "↑"},
"whenArrowTooltip":function(d){return "指定したキーが押されたとき次のアクションを実行します。"},
"whenDown":function(d){return "矢印が下のとき"},
"whenDownTooltip":function(d){return "下向きの矢印キーが押されたとき次のアクションを実行します。"},
"whenGameStarts":function(d){return "ストーリーが始まったとき"},
"whenGameStartsTooltip":function(d){return "物語が始まったとき次のアクションを実行します"},
"whenLeft":function(d){return "左矢印"},
"whenLeftTooltip":function(d){return "下向きの矢印キーが押されたとき以下のアクションを実行します。"},
"whenRight":function(d){return "右向き矢印キーが押されたとき"},
"whenRightTooltip":function(d){return "右向きの矢印キーが押されたとき以下のアクションを実行します。"},
"whenSpriteClicked":function(d){return "キャラがクリックされたとき"},
"whenSpriteClickedN":function(d){return "キャラ"+studio_locale.v(d,"spriteIndex")+"がクリックされたとき"},
"whenSpriteClickedTooltip":function(d){return "キャラがクリックされたとき下のアクションを実行します。"},
"whenSpriteCollidedN":function(d){return "キャラ"+studio_locale.v(d,"spriteIndex")+"が"},
"whenSpriteCollidedTooltip":function(d){return "キャラがほかのキャラにさわるとアクションを実行します"},
"whenSpriteCollidedWith":function(d){return "触れる"},
"whenSpriteCollidedWithAnyActor":function(d){return "どれかのキャラにさわる"},
"whenSpriteCollidedWithAnyEdge":function(d){return "どこかのはしっこにさわる"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "だれかがなげたなにかにさわる"},
"whenSpriteCollidedWithAnything":function(d){return "何かにさわる"},
"whenSpriteCollidedWithN":function(d){return "キャラ"+studio_locale.v(d,"spriteIndex")+"にさわる"},
"whenSpriteCollidedWithBlueFireball":function(d){return "あおいひのたまにさわる"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "むらさきのひのたまにさわる"},
"whenSpriteCollidedWithRedFireball":function(d){return "あかいひのたまにさわる"},
"whenSpriteCollidedWithYellowHearts":function(d){return "きいろのハートにさわる"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "むらさきのハートにさわる"},
"whenSpriteCollidedWithRedHearts":function(d){return "あかのハートにさわる"},
"whenSpriteCollidedWithBottomEdge":function(d){return "したのはしにさわる"},
"whenSpriteCollidedWithLeftEdge":function(d){return "ひだりはしにさわる"},
"whenSpriteCollidedWithRightEdge":function(d){return "みぎはしにさわる"},
"whenSpriteCollidedWithTopEdge":function(d){return "うえのはしにさわる"},
"whenUp":function(d){return "上向き矢印キーが押されたとき"},
"whenUpTooltip":function(d){return "上向きの矢印キーが押されたとき以下のアクションを実行します。"},
"yes":function(d){return "はい"}};