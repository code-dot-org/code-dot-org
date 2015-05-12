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
v:function(d,k){studio_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){studio_locale.c(d,k);return d[k] in p?p[d[k]]:(k=studio_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){studio_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).studio_locale = {
"actor":function(d){return "キャラクター"},
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
"decrementPlayerScore":function(d){return "ポイントをへらします。"},
"defaultSayText":function(d){return "ここに入力"},
"emotion":function(d){return "気分"},
"finalLevel":function(d){return "おめでとうございます ！最後のパズルを解決しました。"},
"for":function(d){return "ため"},
"hello":function(d){return "こんにちは"},
"helloWorld":function(d){return "ハローワールド！"},
"incrementPlayerScore":function(d){return "ポイントを採点する。"},
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
"moveDistanceTooltip":function(d){return "俳優を指定方向に特定距離で移動させる。"},
"moveSprite":function(d){return "移動"},
"moveSpriteN":function(d){return "キャラクター "+studio_locale.v(d,"spriteIndex")+" をうごかす"},
"toXY":function(d){return "x と y へ"},
"moveDown":function(d){return "下に移動します。"},
"moveDownTooltip":function(d){return "俳優を下に移動します。"},
"moveLeft":function(d){return "左に移動"},
"moveLeftTooltip":function(d){return "俳優を左に移動します。"},
"moveRight":function(d){return "右に移動します。"},
"moveRightTooltip":function(d){return "アクターを右に移動します。"},
"moveUp":function(d){return "上に移動します。"},
"moveUpTooltip":function(d){return "俳優を上に移動します。"},
"moveTooltip":function(d){return "俳優を移動します。"},
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
"positionOutTopLeft":function(d){return "ばしょを左上のトップへ"},
"positionOutTopRight":function(d){return "上右上のばしょに"},
"positionTopOutLeft":function(d){return "左のばしょ外トップへ"},
"positionTopLeft":function(d){return "左上に"},
"positionTopCenter":function(d){return "上のまんなかに"},
"positionTopRight":function(d){return "右上に"},
"positionTopOutRight":function(d){return "右のばしょ外トップへ"},
"positionMiddleLeft":function(d){return "左はしの真ん中に"},
"positionMiddleCenter":function(d){return "まんなかに"},
"positionMiddleRight":function(d){return "右はしのまんなかに"},
"positionBottomOutLeft":function(d){return "左のばしょの外側の下に"},
"positionBottomLeft":function(d){return "左下に"},
"positionBottomCenter":function(d){return "下のまんなかに"},
"positionBottomRight":function(d){return "右下に"},
"positionBottomOutRight":function(d){return "右のばしょの外側の下に"},
"positionOutBottomLeft":function(d){return "ばしょを左下の下"},
"positionOutBottomRight":function(d){return "下右ばしょの下"},
"positionRandom":function(d){return "ランダムな位置に"},
"projectileBlueFireball":function(d){return "青い火の玉"},
"projectilePurpleFireball":function(d){return "むらさきの火の玉"},
"projectileRedFireball":function(d){return "赤い火の玉"},
"projectileYellowHearts":function(d){return "きいろいハート"},
"projectilePurpleHearts":function(d){return "むらさきのハート"},
"projectileRedHearts":function(d){return "赤いハート"},
"projectileRandom":function(d){return "ランダム"},
"projectileAnna":function(d){return "アナ"},
"projectileElsa":function(d){return "キラキラ輝く"},
"projectileHiro":function(d){return "マイクロボット"},
"projectileBaymax":function(d){return "ロケット"},
"projectileRapunzel":function(d){return "ソースパン"},
"projectileCherry":function(d){return "チェリー"},
"projectileIce":function(d){return "氷"},
"projectileDuck":function(d){return "アヒル"},
"reinfFeedbackMsg":function(d){return "Keep Playing ボタンを押すとストーリーを再開できます"},
"repeatForever":function(d){return "ずっと"},
"repeatDo":function(d){return "してください"},
"repeatForeverTooltip":function(d){return "物語を動かしている間ずっと、ブロックの中のアクションをくりかえします。"},
"saySprite":function(d){return "という"},
"saySpriteN":function(d){return "と、スプライト "+studio_locale.v(d,"spriteIndex")+" が言う"},
"saySpriteTooltip":function(d){return "指定した俳優から会話気泡と関連の原文がポップアップする"},
"saySpriteChoices_0":function(d){return "こんにちは"},
"saySpriteChoices_1":function(d){return "みなさん、こんにちは"},
"saySpriteChoices_2":function(d){return "お元気ですか"},
"saySpriteChoices_3":function(d){return "おはとうございます"},
"saySpriteChoices_4":function(d){return "こんにちは"},
"saySpriteChoices_5":function(d){return "おやすみなさい"},
"saySpriteChoices_6":function(d){return "こんばんは"},
"saySpriteChoices_7":function(d){return "調子はどうですか？"},
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
"saySpriteChoices_27":function(d){return "私はもう行かねばなりません"},
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
"saySpriteChoices_41":function(d){return "I found you!"},
"saySpriteChoices_42":function(d){return "You found me!"},
"saySpriteChoices_43":function(d){return "10, 9, 8, 7, 6, 5, 4, 3, 2, 1!"},
"saySpriteChoices_44":function(d){return "You are great!"},
"saySpriteChoices_45":function(d){return "You are funny!"},
"saySpriteChoices_46":function(d){return "You are silly! "},
"saySpriteChoices_47":function(d){return "You are a good friend!"},
"saySpriteChoices_48":function(d){return "Watch out!"},
"saySpriteChoices_49":function(d){return "Duck!"},
"saySpriteChoices_50":function(d){return "Gotcha!"},
"saySpriteChoices_51":function(d){return "Ow!"},
"saySpriteChoices_52":function(d){return "Sorry!"},
"saySpriteChoices_53":function(d){return "Careful!"},
"saySpriteChoices_54":function(d){return "Whoa!"},
"saySpriteChoices_55":function(d){return "Oops!"},
"saySpriteChoices_56":function(d){return "You almost got me!"},
"saySpriteChoices_57":function(d){return "Nice try!"},
"saySpriteChoices_58":function(d){return "You can’t catch me!"},
"scoreText":function(d){return "得点："},
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
"setBackgroundLeafy":function(d){return "set leafy background"},
"setBackgroundGrassy":function(d){return "set grassy background"},
"setBackgroundFlower":function(d){return "set flower background"},
"setBackgroundTile":function(d){return "set tile background"},
"setBackgroundIcy":function(d){return "set icy background"},
"setBackgroundSnowy":function(d){return "set snowy background"},
"setBackgroundTooltip":function(d){return "背景画像を設定"},
"setEnemySpeed":function(d){return "てきのうごくはやさをえらぶ"},
"setPlayerSpeed":function(d){return "プレイヤーのうごくはやさをえらぶ"},
"setScoreText":function(d){return "得点を設定"},
"setScoreTextTooltip":function(d){return "ポイント欄に表示される文章を設定します。"},
"setSpriteEmotionAngry":function(d){return "おこったかおに"},
"setSpriteEmotionHappy":function(d){return "うれしいかおに"},
"setSpriteEmotionNormal":function(d){return "ふつうのかおに"},
"setSpriteEmotionRandom":function(d){return "ランダムな気分に"},
"setSpriteEmotionSad":function(d){return "かなしいかおに"},
"setSpriteEmotionTooltip":function(d){return "キャラの表情をセット"},
"setSpriteAlien":function(d){return "宇宙人"},
"setSpriteBat":function(d){return "こうもりに"},
"setSpriteBird":function(d){return "鳥に"},
"setSpriteCat":function(d){return "ねこに"},
"setSpriteCaveBoy":function(d){return "たんけんたいの男の子に"},
"setSpriteCaveGirl":function(d){return "たんけんたいの女の子に"},
"setSpriteDinosaur":function(d){return "恐竜に"},
"setSpriteDog":function(d){return "犬に"},
"setSpriteDragon":function(d){return "竜に"},
"setSpriteGhost":function(d){return "おばけに"},
"setSpriteHidden":function(d){return "隠れた像へ"},
"setSpriteHideK1":function(d){return "かくす"},
"setSpriteAnna":function(d){return "to a Anna image"},
"setSpriteElsa":function(d){return "エルザのイメージへ"},
"setSpriteHiro":function(d){return "ヒロのイメージへ"},
"setSpriteBaymax":function(d){return "to a Baymax image"},
"setSpriteRapunzel":function(d){return "ラプンツェルのイメージへ"},
"setSpriteKnight":function(d){return "騎士に"},
"setSpriteMonster":function(d){return "モンスターに"},
"setSpriteNinja":function(d){return "忍者に"},
"setSpriteOctopus":function(d){return "たこに"},
"setSpritePenguin":function(d){return "ペンギンに"},
"setSpritePirate":function(d){return "海賊に"},
"setSpritePrincess":function(d){return "おひめさまに"},
"setSpriteRandom":function(d){return "はいけいをランダムに"},
"setSpriteRobot":function(d){return "ロボットに"},
"setSpriteShowK1":function(d){return "表示する"},
"setSpriteSpacebot":function(d){return "宇宙ロボットに"},
"setSpriteSoccerGirl":function(d){return "サッカーする女の子に"},
"setSpriteSoccerBoy":function(d){return "サッカーをする男の子に"},
"setSpriteSquirrel":function(d){return "リスに"},
"setSpriteTennisGirl":function(d){return "テニスする女の子に"},
"setSpriteTennisBoy":function(d){return "テニスする男の子に"},
"setSpriteUnicorn":function(d){return "ユニコーンに"},
"setSpriteWitch":function(d){return "魔女に"},
"setSpriteWizard":function(d){return "魔法使いに"},
"setSpritePositionTooltip":function(d){return "キャラを指定した場所にすぐにうごかします。"},
"setSpriteK1Tooltip":function(d){return "キャラクターを表示したりかくしたりします。"},
"setSpriteTooltip":function(d){return "キャラクターのイメージを設定"},
"setSpriteSizeRandom":function(d){return "ランダムなサイズに"},
"setSpriteSizeVerySmall":function(d){return "とても小さいサイズに"},
"setSpriteSizeSmall":function(d){return "小さいサイズに"},
"setSpriteSizeNormal":function(d){return "もとのサイズに"},
"setSpriteSizeLarge":function(d){return "大きいサイズに"},
"setSpriteSizeVeryLarge":function(d){return "とても大きいサイズに"},
"setSpriteSizeTooltip":function(d){return "キャラクターの大きさを設定"},
"setSpriteSpeedRandom":function(d){return "ランダムなスピードに"},
"setSpriteSpeedVerySlow":function(d){return "とてもおそいスピードに"},
"setSpriteSpeedSlow":function(d){return "おそいスピードに"},
"setSpriteSpeedNormal":function(d){return "ふつうのスピードに"},
"setSpriteSpeedFast":function(d){return "はやいスピードに"},
"setSpriteSpeedVeryFast":function(d){return "とてもはやいスピードに"},
"setSpriteSpeedTooltip":function(d){return "キャラクターのはやさをセット"},
"setSpriteZombie":function(d){return "ゾンビに"},
"shareStudioTwitter":function(d){return "私のお話を見てください。 @codeorg を使って自分で作りました。"},
"shareGame":function(d){return "お話をみんなに見てもらう"},
"showCoordinates":function(d){return "座標を表示します。"},
"showCoordinatesTooltip":function(d){return "主人公の座標を画面に表示します。"},
"showTitleScreen":function(d){return "表紙を見せる"},
"showTitleScreenTitle":function(d){return "だいめい"},
"showTitleScreenText":function(d){return "テキスト"},
"showTSDefTitle":function(d){return "ここにタイトルを入れる"},
"showTSDefText":function(d){return "ここにテキストを入力"},
"showTitleScreenTooltip":function(d){return "だいめいとせつめいのあるひょうしをひょうじします。"},
"size":function(d){return "おおきさ"},
"setSprite":function(d){return "セット"},
"setSpriteN":function(d){return "キャラクター "+studio_locale.v(d,"spriteIndex")+" をセット"},
"soundCrunch":function(d){return "crunch"},
"soundGoal1":function(d){return "ゴール1"},
"soundGoal2":function(d){return "ゴール2"},
"soundHit":function(d){return "ヒット"},
"soundLosePoint":function(d){return "ポイントがへる"},
"soundLosePoint2":function(d){return "lose point 2"},
"soundRetro":function(d){return "レトロ"},
"soundRubber":function(d){return "ゴム"},
"soundSlap":function(d){return "たたく"},
"soundWinPoint":function(d){return "ポイントがふえる"},
"soundWinPoint2":function(d){return "win point 2"},
"soundWood":function(d){return "木"},
"speed":function(d){return "スピード"},
"startSetValue":function(d){return "start (rocket-height function)"},
"startSetVars":function(d){return "game_vars (title, subtitle, background, target, danger, player)"},
"startSetFuncs":function(d){return "game_funcs (update-target, update-danger, update-player, collide?, on-screen?)"},
"stopSprite":function(d){return "ストップ"},
"stopSpriteN":function(d){return "キャラクター "+studio_locale.v(d,"spriteIndex")+" を止める"},
"stopTooltip":function(d){return "キャラクターの動きを止めます。"},
"throwSprite":function(d){return "投げる"},
"throwSpriteN":function(d){return "キャラクター "+studio_locale.v(d,"spriteIndex")+" が投げる"},
"throwTooltip":function(d){return "指定したキャラクターからの物をなげます。"},
"vanish":function(d){return "消す"},
"vanishActorN":function(d){return "キャラクター "+studio_locale.v(d,"spriteIndex")+" を消す"},
"vanishTooltip":function(d){return "キャラクターを消します。"},
"waitFor":function(d){return "まで待つ"},
"waitSeconds":function(d){return "秒"},
"waitForClick":function(d){return "クリックされるまで待つ"},
"waitForRandom":function(d){return "wait for random"},
"waitForHalfSecond":function(d){return "0.5秒まつ"},
"waitFor1Second":function(d){return "1びょうまつ"},
"waitFor2Seconds":function(d){return "2びょうまつ"},
"waitFor5Seconds":function(d){return "5びょうまつ"},
"waitFor10Seconds":function(d){return "10びょうまつ"},
"waitParamsTooltip":function(d){return "Waits for a specified number of seconds or use zero to wait until a click occurs."},
"waitTooltip":function(d){return "Waits for a specified amount of time or until a click occurs."},
"whenArrowDown":function(d){return "↓"},
"whenArrowLeft":function(d){return "←"},
"whenArrowRight":function(d){return "→"},
"whenArrowUp":function(d){return "↑"},
"whenArrowTooltip":function(d){return "指定した矢印キーが押されるまでアクションを実行します。"},
"whenDown":function(d){return "矢印が下のとき"},
"whenDownTooltip":function(d){return "下向きの矢印キーが押されたとき次のアクションを実行します。"},
"whenGameStarts":function(d){return "ストーリーが始まったとき"},
"whenGameStartsTooltip":function(d){return "物語が始まったときアクションを実行します"},
"whenLeft":function(d){return "左矢印"},
"whenLeftTooltip":function(d){return "下向きの矢印キーが押されたとき以下のアクションを実行します。"},
"whenRight":function(d){return "右向き矢印キーが押されたとき"},
"whenRightTooltip":function(d){return "右矢印キーが押された場合、下記のアクションを実行"},
"whenSpriteClicked":function(d){return "クリックされたとき"},
"whenSpriteClickedN":function(d){return "キャラクター "+studio_locale.v(d,"spriteIndex")+" がクリックされたとき"},
"whenSpriteClickedTooltip":function(d){return "キャラクターがクリックされたときアクションを実行します。"},
"whenSpriteCollidedN":function(d){return "キャラクター "+studio_locale.v(d,"spriteIndex")+" が"},
"whenSpriteCollidedTooltip":function(d){return "キャラクターがほかのキャラクターにさわるとアクションを実行します"},
"whenSpriteCollidedWith":function(d){return "さわった"},
"whenSpriteCollidedWithAnyActor":function(d){return "何かキャラクターにさわる"},
"whenSpriteCollidedWithAnyEdge":function(d){return "どこかのはしっこにさわる"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "だれかがなげたなにかにさわる"},
"whenSpriteCollidedWithAnything":function(d){return "何かにさわる"},
"whenSpriteCollidedWithN":function(d){return "キャラクター "+studio_locale.v(d,"spriteIndex")+" にさわる"},
"whenSpriteCollidedWithBlueFireball":function(d){return "青い火の玉にさわる"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "むらさきの火の玉にさわる"},
"whenSpriteCollidedWithRedFireball":function(d){return "赤い火の玉にさわる"},
"whenSpriteCollidedWithYellowHearts":function(d){return "黄色のハートにさわる"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "むらさきのハートにさわる"},
"whenSpriteCollidedWithRedHearts":function(d){return "赤のハートにさわる"},
"whenSpriteCollidedWithBottomEdge":function(d){return "下のはしにさわる"},
"whenSpriteCollidedWithLeftEdge":function(d){return "ひだりはしにさわる"},
"whenSpriteCollidedWithRightEdge":function(d){return "みぎはしにさわる"},
"whenSpriteCollidedWithTopEdge":function(d){return "うえのはしにさわる"},
"whenUp":function(d){return "上向き矢印が押されたとき"},
"whenUpTooltip":function(d){return "上矢印キーが押された場合、下記のアクションを実行"},
"yes":function(d){return "はい"}};