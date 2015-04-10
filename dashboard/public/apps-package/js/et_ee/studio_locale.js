var appLocale = {lc:{"ar":function(n){
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
v:function(d,k){appLocale.c(d,k);return d[k]},
p:function(d,k,o,l,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:(k=appLocale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).appLocale = {
"actor":function(d){return "tegelaskuju"},
"alienInvasion":function(d){return "Tulnukate sissetung!"},
"backgroundBlack":function(d){return "must"},
"backgroundCave":function(d){return "koobas"},
"backgroundCloudy":function(d){return "pilvine"},
"backgroundHardcourt":function(d){return "kõvakattega väljak"},
"backgroundNight":function(d){return "öö"},
"backgroundUnderwater":function(d){return "veealune"},
"backgroundCity":function(d){return "linn"},
"backgroundDesert":function(d){return "kõrb"},
"backgroundRainbow":function(d){return "vikerkaar"},
"backgroundSoccer":function(d){return "jalgpall"},
"backgroundSpace":function(d){return "kosmos"},
"backgroundTennis":function(d){return "tennis"},
"backgroundWinter":function(d){return "talv"},
"catActions":function(d){return "Tegevused"},
"catControl":function(d){return "Tsüklid"},
"catEvents":function(d){return "Sündmused"},
"catLogic":function(d){return "Loogika"},
"catMath":function(d){return "Matemaatika"},
"catProcedures":function(d){return "Funktsioonid"},
"catText":function(d){return "Tekst"},
"catVariables":function(d){return "Muutujad"},
"changeScoreTooltip":function(d){return "Lisa või lahuta tulemuselt üks punkt."},
"changeScoreTooltipK1":function(d){return "Lisa tulemusele punkt."},
"continue":function(d){return "Jätka"},
"decrementPlayerScore":function(d){return "lahuta tulemuselt punkt"},
"defaultSayText":function(d){return "sisesta siia"},
"emotion":function(d){return "tuju"},
"finalLevel":function(d){return "Tubli! Sa lahendasid viimase mõistatuse."},
"for":function(d){return " "},
"hello":function(d){return "tere"},
"helloWorld":function(d){return "Tere, Maailm!"},
"incrementPlayerScore":function(d){return "lisa punkt"},
"makeProjectileDisappear":function(d){return "kaduma"},
"makeProjectileBounce":function(d){return "põrkama"},
"makeProjectileBlueFireball":function(d){return "loo sinine tulekera"},
"makeProjectilePurpleFireball":function(d){return "loo lilla tulekera"},
"makeProjectileRedFireball":function(d){return "loo punane tulekera"},
"makeProjectileYellowHearts":function(d){return "loo kollased südamed"},
"makeProjectilePurpleHearts":function(d){return "loo lillad südamed"},
"makeProjectileRedHearts":function(d){return "loo punased südamed"},
"makeProjectileTooltip":function(d){return "Pane lendav osake mis just põrkas ära kaduma või põrkama."},
"makeYourOwn":function(d){return "Tee ise Mängu Labori Äpp"},
"moveDirectionDown":function(d){return "alla"},
"moveDirectionLeft":function(d){return "vasakule"},
"moveDirectionRight":function(d){return "paremale"},
"moveDirectionUp":function(d){return "üles"},
"moveDirectionRandom":function(d){return "juhuslik"},
"moveDistance25":function(d){return "25 pikslit"},
"moveDistance50":function(d){return "50 pikslit"},
"moveDistance100":function(d){return "100 pikslit"},
"moveDistance200":function(d){return "200 pikslit"},
"moveDistance400":function(d){return "400 pikslit"},
"moveDistancePixels":function(d){return "piksli võrra"},
"moveDistanceRandom":function(d){return "suvaline arv piksleid"},
"moveDistanceTooltip":function(d){return "Liiguta näitleja määratud kaugusesse ja määratud suunda."},
"moveSprite":function(d){return "liiguta"},
"moveSpriteN":function(d){return "liiguta tegelast"+appLocale.v(d,"spriteIndex")},
"toXY":function(d){return "x,y"},
"moveDown":function(d){return "liigu alla"},
"moveDownTooltip":function(d){return "Liiguta näitleja alla."},
"moveLeft":function(d){return "liigu vasakule"},
"moveLeftTooltip":function(d){return "Liiguta näitleja vasakule."},
"moveRight":function(d){return "liigu paremale"},
"moveRightTooltip":function(d){return "Liiguta näitleja paremale."},
"moveUp":function(d){return "liigu üles"},
"moveUpTooltip":function(d){return "Liiguta näitlejat üles."},
"moveTooltip":function(d){return "Liiguta näitlejat."},
"nextLevel":function(d){return "Palju õnne! See ülesanne on lahendatud."},
"no":function(d){return "Ei"},
"numBlocksNeeded":function(d){return "Selle ülesande saab lahendada %1 pusletükiga."},
"onEventTooltip":function(d){return "Execute code in response to the specified event."},
"ouchExclamation":function(d){return "Ai!"},
"playSoundCrunch":function(d){return "lase heli \"krõbin\""},
"playSoundGoal1":function(d){return "lase heli \"värav 1\""},
"playSoundGoal2":function(d){return "lase heli \"värav 2\""},
"playSoundHit":function(d){return "lase heli \"löök\""},
"playSoundLosePoint":function(d){return "lase heli \"kaotasid punkti\""},
"playSoundLosePoint2":function(d){return "lase heli \"kaotasid punkti 2\""},
"playSoundRetro":function(d){return "lase heli \"retro\""},
"playSoundRubber":function(d){return "lase heli \"kumm\""},
"playSoundSlap":function(d){return "lase heli \"laks\""},
"playSoundTooltip":function(d){return "Lase valitud heli."},
"playSoundWinPoint":function(d){return "lase heli \"võidad punkti\""},
"playSoundWinPoint2":function(d){return "lase heli \"võidad punkti 2\""},
"playSoundWood":function(d){return "lase heli \"puit\""},
"positionOutTopLeft":function(d){return "üles vasakule kohale"},
"positionOutTopRight":function(d){return "üles paremale kohale"},
"positionTopOutLeft":function(d){return "to the top outside left position"},
"positionTopLeft":function(d){return "üles vasakule"},
"positionTopCenter":function(d){return "üles keskele"},
"positionTopRight":function(d){return "üles paremale"},
"positionTopOutRight":function(d){return "to the top outside right position"},
"positionMiddleLeft":function(d){return "keskele vasakule"},
"positionMiddleCenter":function(d){return "keskele keskele"},
"positionMiddleRight":function(d){return "keskele paremale"},
"positionBottomOutLeft":function(d){return "to the bottom outside left position"},
"positionBottomLeft":function(d){return "alla vasakule"},
"positionBottomCenter":function(d){return "alla keskele"},
"positionBottomRight":function(d){return "alla paremale"},
"positionBottomOutRight":function(d){return "to the bottom outside right position"},
"positionOutBottomLeft":function(d){return "to the below bottom left position"},
"positionOutBottomRight":function(d){return "to the below bottom right position"},
"positionRandom":function(d){return "juhuslikku kohta"},
"projectileBlueFireball":function(d){return "sinine tulekera"},
"projectilePurpleFireball":function(d){return "lilla tulekera"},
"projectileRedFireball":function(d){return "punane tulekera"},
"projectileYellowHearts":function(d){return "kollased südamed"},
"projectilePurpleHearts":function(d){return "lillad südamed"},
"projectileRedHearts":function(d){return "punased südamed"},
"projectileRandom":function(d){return "juhuslik"},
"projectileAnna":function(d){return "konks"},
"projectileElsa":function(d){return "Elsa"},
"projectileHiro":function(d){return "Hiro"},
"projectileBaymax":function(d){return "rakett"},
"projectileRapunzel":function(d){return "kastrul"},
"projectileCherry":function(d){return "kirss"},
"projectileIce":function(d){return "jää"},
"projectileDuck":function(d){return "part"},
"reinfFeedbackMsg":function(d){return "You can press the \"Try again\" button to go back to playing your story."},
"repeatForever":function(d){return "korda igavesti"},
"repeatDo":function(d){return "täida"},
"repeatForeverTooltip":function(d){return "Käivita tegevusi selles plokis korduvalt, samal ajal kui lugu käib."},
"saySprite":function(d){return "ütle"},
"saySpriteN":function(d){return "tegelane "+appLocale.v(d,"spriteIndex")+" ütleb"},
"saySpriteTooltip":function(d){return "Pop up a speech bubble with the associated text from the specified actor."},
"saySpriteChoices_0":function(d){return "Hi there."},
"saySpriteChoices_1":function(d){return "Hi there!"},
"saySpriteChoices_2":function(d){return "How are you?"},
"saySpriteChoices_3":function(d){return "This is fun..."},
"saySpriteChoices_4":function(d){return "Good afternoon"},
"saySpriteChoices_5":function(d){return "Good night"},
"saySpriteChoices_6":function(d){return "Good evening"},
"saySpriteChoices_7":function(d){return "What’s new?"},
"saySpriteChoices_8":function(d){return "What?"},
"saySpriteChoices_9":function(d){return "Where?"},
"saySpriteChoices_10":function(d){return "When?"},
"saySpriteChoices_11":function(d){return "Good."},
"saySpriteChoices_12":function(d){return "Great!"},
"saySpriteChoices_13":function(d){return "All right."},
"saySpriteChoices_14":function(d){return "Not bad."},
"saySpriteChoices_15":function(d){return "Good luck."},
"saySpriteChoices_16":function(d){return "Jah"},
"saySpriteChoices_17":function(d){return "Ei"},
"saySpriteChoices_18":function(d){return "Okay"},
"saySpriteChoices_19":function(d){return "Nice throw!"},
"saySpriteChoices_20":function(d){return "Have a nice day."},
"saySpriteChoices_21":function(d){return "Bye."},
"saySpriteChoices_22":function(d){return "I’ll be right back."},
"saySpriteChoices_23":function(d){return "See you tomorrow!"},
"saySpriteChoices_24":function(d){return "See you later!"},
"saySpriteChoices_25":function(d){return "Take care!"},
"saySpriteChoices_26":function(d){return "Enjoy!"},
"saySpriteChoices_27":function(d){return "I have to go."},
"saySpriteChoices_28":function(d){return "Want to be friends?"},
"saySpriteChoices_29":function(d){return "Great job!"},
"saySpriteChoices_30":function(d){return "Woo hoo!"},
"saySpriteChoices_31":function(d){return "Yay!"},
"saySpriteChoices_32":function(d){return "Nice to meet you."},
"saySpriteChoices_33":function(d){return "All right!"},
"saySpriteChoices_34":function(d){return "Thank you"},
"saySpriteChoices_35":function(d){return "No, thank you"},
"saySpriteChoices_36":function(d){return "Aaaaaah!"},
"saySpriteChoices_37":function(d){return "Never mind"},
"saySpriteChoices_38":function(d){return "Today"},
"saySpriteChoices_39":function(d){return "Tomorrow"},
"saySpriteChoices_40":function(d){return "Yesterday"},
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
"scoreText":function(d){return "Tulemus: "+appLocale.v(d,"playerScore")},
"setBackground":function(d){return "vali taust"},
"setBackgroundRandom":function(d){return "vali suvaline taust"},
"setBackgroundBlack":function(d){return "vali musta värvi taust"},
"setBackgroundCave":function(d){return "vali taustaks koobas"},
"setBackgroundCloudy":function(d){return "vali pilvine taust"},
"setBackgroundHardcourt":function(d){return "vali taustaks kõvakattega väljak"},
"setBackgroundNight":function(d){return "vali öine taust"},
"setBackgroundUnderwater":function(d){return "vali veealune taust"},
"setBackgroundCity":function(d){return "vali taustaks linn"},
"setBackgroundDesert":function(d){return "vali taustaks kõrb"},
"setBackgroundRainbow":function(d){return "vali taustaks vikerkaar"},
"setBackgroundSoccer":function(d){return "vali taustaks jalgpall"},
"setBackgroundSpace":function(d){return "vali taustaks kosmos"},
"setBackgroundTennis":function(d){return "vali taustaks tennis"},
"setBackgroundWinter":function(d){return "vali talvine taust"},
"setBackgroundLeafy":function(d){return "set leafy background"},
"setBackgroundGrassy":function(d){return "Sea rohtukasvanud taust"},
"setBackgroundFlower":function(d){return "sea lille taust"},
"setBackgroundTile":function(d){return "sea plaatide taust"},
"setBackgroundIcy":function(d){return "sea jäine taust"},
"setBackgroundSnowy":function(d){return "sea lumine taust"},
"setBackgroundTooltip":function(d){return "Valib taustapildi"},
"setEnemySpeed":function(d){return "sea vaenlase kiirus"},
"setPlayerSpeed":function(d){return "sea mängija kiirus"},
"setScoreText":function(d){return "set score"},
"setScoreTextTooltip":function(d){return "Määrab teksti, mis kuvatakse skoori alal."},
"setSpriteEmotionAngry":function(d){return "to a angry mood"},
"setSpriteEmotionHappy":function(d){return "rõõmsasse meeleollu"},
"setSpriteEmotionNormal":function(d){return "tavalisse meeleollu"},
"setSpriteEmotionRandom":function(d){return "juhuslikku meeleollu"},
"setSpriteEmotionSad":function(d){return "kurba meeleollu"},
"setSpriteEmotionTooltip":function(d){return "Määrab näitleja meeleolu"},
"setSpriteAlien":function(d){return "tulnuka pildiks"},
"setSpriteBat":function(d){return "nahkhiire pildiks"},
"setSpriteBird":function(d){return "linnu pildiks"},
"setSpriteCat":function(d){return "kassi pildiks"},
"setSpriteCaveBoy":function(d){return "koopapoisi pildiks"},
"setSpriteCaveGirl":function(d){return "koopatüdruku pildiks"},
"setSpriteDinosaur":function(d){return "dinosauruse pildiks"},
"setSpriteDog":function(d){return "koera pildiks"},
"setSpriteDragon":function(d){return "draakoni pildiks"},
"setSpriteGhost":function(d){return "kummituse pildiks"},
"setSpriteHidden":function(d){return "peidetud pildiks"},
"setSpriteHideK1":function(d){return "peida"},
"setSpriteAnna":function(d){return "to a Anna image"},
"setSpriteElsa":function(d){return "to a Elsa image"},
"setSpriteHiro":function(d){return "Hiro pildiks"},
"setSpriteBaymax":function(d){return "Baymaxi pildiks"},
"setSpriteRapunzel":function(d){return "Rapsuntseli pildiks"},
"setSpriteKnight":function(d){return "rüütli pildiks"},
"setSpriteMonster":function(d){return "koletise pildiks"},
"setSpriteNinja":function(d){return "maskeeritud ninja pildiks"},
"setSpriteOctopus":function(d){return "kaheksajala pildiks"},
"setSpritePenguin":function(d){return "pingviini pildiks"},
"setSpritePirate":function(d){return "piraadi pildiks"},
"setSpritePrincess":function(d){return "printsessi pildiks"},
"setSpriteRandom":function(d){return "juhuslikuks pildiks"},
"setSpriteRobot":function(d){return "roboti pildiks"},
"setSpriteShowK1":function(d){return "näita"},
"setSpriteSpacebot":function(d){return "kosmoseroboti pildiks"},
"setSpriteSoccerGirl":function(d){return "jalgpallitüdruku pildiks"},
"setSpriteSoccerBoy":function(d){return "jalgpallipoisi pildiks"},
"setSpriteSquirrel":function(d){return "orava pildiks"},
"setSpriteTennisGirl":function(d){return "tennisetüdruku pildiks"},
"setSpriteTennisBoy":function(d){return "tennisepoisi pildiks"},
"setSpriteUnicorn":function(d){return "ükssarve pildiks"},
"setSpriteWitch":function(d){return "nõia pildiks"},
"setSpriteWizard":function(d){return "võluri pildiks"},
"setSpritePositionTooltip":function(d){return "Liigutab tegelase koheselt määratud suunas."},
"setSpriteK1Tooltip":function(d){return "Kuvab või peidab määratud tegelase."},
"setSpriteTooltip":function(d){return "Määrab tegelase pildi"},
"setSpriteSizeRandom":function(d){return "juhuslikuks suuruseks"},
"setSpriteSizeVerySmall":function(d){return "väga väikeseks"},
"setSpriteSizeSmall":function(d){return "väikeseks"},
"setSpriteSizeNormal":function(d){return "normaalsuuruseks"},
"setSpriteSizeLarge":function(d){return "suureks"},
"setSpriteSizeVeryLarge":function(d){return "väga suureks"},
"setSpriteSizeTooltip":function(d){return "Määrab näitleja suuruse"},
"setSpriteSpeedRandom":function(d){return "juhuslik kiirus"},
"setSpriteSpeedVerySlow":function(d){return "väga aeglane"},
"setSpriteSpeedSlow":function(d){return "aeglaseks"},
"setSpriteSpeedNormal":function(d){return "tavalise kiirusega"},
"setSpriteSpeedFast":function(d){return "kiireks"},
"setSpriteSpeedVeryFast":function(d){return "väga kiireks"},
"setSpriteSpeedTooltip":function(d){return "Määrab tegelase kiiruse"},
"setSpriteZombie":function(d){return "zombi pildiks"},
"shareStudioTwitter":function(d){return "Vaata seda rakendust, mis ma tegin. Kirjutasin selle ise @codeorg-is"},
"shareGame":function(d){return "Jaga oma lugu:"},
"showCoordinates":function(d){return "näidata koordinaate"},
"showCoordinatesTooltip":function(d){return "kuva ekraanil peategelse koordinaadid"},
"showTitleScreen":function(d){return "näita pealkirja"},
"showTitleScreenTitle":function(d){return "pealkiri"},
"showTitleScreenText":function(d){return "tekst"},
"showTSDefTitle":function(d){return "sisesta pealkiri"},
"showTSDefText":function(d){return "sisesta tekst"},
"showTitleScreenTooltip":function(d){return "Kuva pealkirja ekraan koos ühendatud pealkirja ja tekstiga."},
"size":function(d){return "suurus"},
"setSprite":function(d){return "väärtusta"},
"setSpriteN":function(d){return "Sea tegelane "+appLocale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "crunch"},
"soundGoal1":function(d){return "eesmärk 1"},
"soundGoal2":function(d){return "eesmärk 2"},
"soundHit":function(d){return "löök"},
"soundLosePoint":function(d){return "kaotasid punkti"},
"soundLosePoint2":function(d){return "kaotasid punkti 2"},
"soundRetro":function(d){return "retro"},
"soundRubber":function(d){return "kumm"},
"soundSlap":function(d){return "laks"},
"soundWinPoint":function(d){return "punkti saamine"},
"soundWinPoint2":function(d){return "punkti saamine 2"},
"soundWood":function(d){return "puit"},
"speed":function(d){return "kiirus"},
"startSetValue":function(d){return "käivita (funktsioon)"},
"startSetVars":function(d){return "game_vars (title, subtitle, background, target, danger, player)"},
"startSetFuncs":function(d){return "game_funcs (update-target, update-danger, update-player, collide?, on-screen?)"},
"stopSprite":function(d){return "stopp"},
"stopSpriteN":function(d){return "peata tegelane "+appLocale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Peata tegelase liikumine."},
"throwSprite":function(d){return "viska"},
"throwSpriteN":function(d){return "tegelane "+appLocale.v(d,"spriteIndex")+" viskab"},
"throwTooltip":function(d){return "Määratud tegelane viskab määratud asja."},
"vanish":function(d){return "kaob"},
"vanishActorN":function(d){return "kaota tegelane "+appLocale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "Kaotab tegelase."},
"waitFor":function(d){return "oota"},
"waitSeconds":function(d){return "sekundit"},
"waitForClick":function(d){return "oota klikki"},
"waitForRandom":function(d){return "oota juhuslikku sündmust"},
"waitForHalfSecond":function(d){return "oota pool sekundit"},
"waitFor1Second":function(d){return "oota 1 sekund"},
"waitFor2Seconds":function(d){return "oota 2 sekundit"},
"waitFor5Seconds":function(d){return "oota 5 sekundit"},
"waitFor10Seconds":function(d){return "oota 10 sekundit"},
"waitParamsTooltip":function(d){return "Ootab määratud arvu sekundeid või kasuta nulli et oodata kuni klikitakse."},
"waitTooltip":function(d){return "Ootab määratud aja või kuni klikitakse."},
"whenArrowDown":function(d){return "nool alla"},
"whenArrowLeft":function(d){return "nool vasakule"},
"whenArrowRight":function(d){return "Nool paremale"},
"whenArrowUp":function(d){return "Nool üles"},
"whenArrowTooltip":function(d){return "Käivita järgnevad tegevused kui vajutatakse määratud nuppu."},
"whenDown":function(d){return "kui vajutatakse allanoolt"},
"whenDownTooltip":function(d){return "Täida allolevad käsud, kui vajutatakse allanoolt."},
"whenGameStarts":function(d){return "kui lugu algab"},
"whenGameStartsTooltip":function(d){return "Käivita järgmised tegevused kui lugu algab."},
"whenLeft":function(d){return "kui vajutatakse vasaknoolt"},
"whenLeftTooltip":function(d){return "Kui kasutaja vajutab vasakpoolset noolt, teosta järgmised toimingud."},
"whenRight":function(d){return "kui vajutatakse paremnoolt"},
"whenRightTooltip":function(d){return "Täida allolevad käsud, kui vajutatakse paremnoolt."},
"whenSpriteClicked":function(d){return "kui tegelast puudutatakse"},
"whenSpriteClickedN":function(d){return "kui tegelast "+appLocale.v(d,"spriteIndex")+" klikitakse"},
"whenSpriteClickedTooltip":function(d){return "Käivita järgnevad tegevused kui tegelast klikitakse."},
"whenSpriteCollidedN":function(d){return "kui näitleja "+appLocale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "Käivita järgnevad tegevused kui üks tegelane puudutab teist tegelast."},
"whenSpriteCollidedWith":function(d){return "puudutab"},
"whenSpriteCollidedWithAnyActor":function(d){return "puudutab mõnda tegelast"},
"whenSpriteCollidedWithAnyEdge":function(d){return "puudutab mõnda serva"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "puudutab mõnda lendavat osakest"},
"whenSpriteCollidedWithAnything":function(d){return "puudutab ükskõik mida"},
"whenSpriteCollidedWithN":function(d){return "puudutab tegelast "+appLocale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "puudutab sinist tulekera"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "puudutab lillat tulekera"},
"whenSpriteCollidedWithRedFireball":function(d){return "puudutab punast tulekera"},
"whenSpriteCollidedWithYellowHearts":function(d){return "puudutab kollaseid südameid"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "puudutab lillasid südamed"},
"whenSpriteCollidedWithRedHearts":function(d){return "puudutab punaseid südameid"},
"whenSpriteCollidedWithBottomEdge":function(d){return "puudutab alumist serva"},
"whenSpriteCollidedWithLeftEdge":function(d){return "puudutab vasakut serva"},
"whenSpriteCollidedWithRightEdge":function(d){return "puudutab paremat serva"},
"whenSpriteCollidedWithTopEdge":function(d){return "puudutab ülemist serva"},
"whenUp":function(d){return "kui vajutatakse ülesnoolt"},
"whenUpTooltip":function(d){return "Täida allolevad käsud, kui vajutatakse ülesnoolt."},
"yes":function(d){return "Jah"}};