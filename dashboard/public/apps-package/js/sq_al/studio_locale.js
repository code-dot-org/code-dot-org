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
"actor":function(d){return "pjesmarrës"},
"alienInvasion":function(d){return "Invazioni i Huaj!"},
"backgroundBlack":function(d){return "e zezë"},
"backgroundCave":function(d){return "shpellë"},
"backgroundCloudy":function(d){return "me re"},
"backgroundHardcourt":function(d){return "terren i fortë"},
"backgroundNight":function(d){return "natë"},
"backgroundUnderwater":function(d){return "nën ujë"},
"backgroundCity":function(d){return "qytet"},
"backgroundDesert":function(d){return "shkretëtirë"},
"backgroundRainbow":function(d){return "ylber"},
"backgroundSoccer":function(d){return "futboll"},
"backgroundSpace":function(d){return "hapësirë"},
"backgroundTennis":function(d){return "tenis"},
"backgroundWinter":function(d){return "dimër"},
"catActions":function(d){return "Veprimet"},
"catControl":function(d){return "perseritje"},
"catEvents":function(d){return "Ngjarjet"},
"catLogic":function(d){return "Logjika"},
"catMath":function(d){return "Matematikë"},
"catProcedures":function(d){return "funksionet"},
"catText":function(d){return "Tekst"},
"catVariables":function(d){return "variabla"},
"changeScoreTooltip":function(d){return "Shto ose hiq një pikë tek rezultati."},
"changeScoreTooltipK1":function(d){return "Shto një pikë tek rezultati."},
"continue":function(d){return "Vazhdo"},
"decrementPlayerScore":function(d){return "hiq pikën"},
"defaultSayText":function(d){return "shtyp këtu"},
"emotion":function(d){return "humori"},
"finalLevel":function(d){return "Urime! Ju keni perfunduar enigmen perfundimatare."},
"for":function(d){return "për"},
"hello":function(d){return "përshëndetje"},
"helloWorld":function(d){return "Përshëndetje Botë!"},
"incrementPlayerScore":function(d){return "rezultati"},
"makeProjectileDisappear":function(d){return "zhduket"},
"makeProjectileBounce":function(d){return "kërce"},
"makeProjectileBlueFireball":function(d){return "bëj topa zjarri blu"},
"makeProjectilePurpleFireball":function(d){return "bëj topa zjarri lejla"},
"makeProjectileRedFireball":function(d){return "bëj topa zjarri të kuq"},
"makeProjectileYellowHearts":function(d){return "bëj zemra e verdha"},
"makeProjectilePurpleHearts":function(d){return "bëj zemra lejla"},
"makeProjectileRedHearts":function(d){return "bëj zemra të kuqe"},
"makeProjectileTooltip":function(d){return "Bëj që raketa, e cila sapo u përplas, të zhduket ose të kërcejë."},
"makeYourOwn":function(d){return "Bëj aplikacionin tënd Play Lab"},
"moveDirectionDown":function(d){return "poshtë"},
"moveDirectionLeft":function(d){return "majtas"},
"moveDirectionRight":function(d){return "djathtas"},
"moveDirectionUp":function(d){return "lart"},
"moveDirectionRandom":function(d){return "zakonshem"},
"moveDistance25":function(d){return "25 piksela"},
"moveDistance50":function(d){return "50 piksela"},
"moveDistance100":function(d){return "100 piksela"},
"moveDistance200":function(d){return "200 piksela"},
"moveDistance400":function(d){return "400 piksela"},
"moveDistancePixels":function(d){return "piksela"},
"moveDistanceRandom":function(d){return "piksela të rastësishëm"},
"moveDistanceTooltip":function(d){return "Lëviz një pjesmarrës tek një largësi e caktuar në drejtimin e caktuar."},
"moveSprite":function(d){return "lëviz"},
"moveSpriteN":function(d){return "lëviz pjesmarrësin "+appLocale.v(d,"spriteIndex")},
"toXY":function(d){return "tek x,y"},
"moveDown":function(d){return "lëviz poshtë"},
"moveDownTooltip":function(d){return "Lëviz një pjesmarrës poshtë."},
"moveLeft":function(d){return "lëviz majtas"},
"moveLeftTooltip":function(d){return "Lëviz një pjesmarrës majtas."},
"moveRight":function(d){return "lëviz djathtas"},
"moveRightTooltip":function(d){return "Lëviz një pjesmarrës djathtas."},
"moveUp":function(d){return "lëviz sipër"},
"moveUpTooltip":function(d){return "Lëviz një pjesmarrës lart."},
"moveTooltip":function(d){return "Lëviz një pjesmarrës."},
"nextLevel":function(d){return "Urime! Ju keni perfunduar kete enigme."},
"no":function(d){return "Jo"},
"numBlocksNeeded":function(d){return "Kjo enigme mund te zgjidhet me %1 rreshta."},
"onEventTooltip":function(d){return "Ekzekuto kodin në përgjigje te eventit specifik."},
"ouchExclamation":function(d){return "Ouch!"},
"playSoundCrunch":function(d){return "vendos tingullin \"e kërcitjes\""},
"playSoundGoal1":function(d){return "vendos tingullin \"qëllimi 1\""},
"playSoundGoal2":function(d){return "vendos tingullin \"qëllimi 2\""},
"playSoundHit":function(d){return "vendos tingullin \"e goditjes\""},
"playSoundLosePoint":function(d){return "vendos tingullin \"humb pikë\""},
"playSoundLosePoint2":function(d){return "vendos tingullin \"humb pikë 2\""},
"playSoundRetro":function(d){return "vendos tingullin \"retro\""},
"playSoundRubber":function(d){return "vendos tingullin e \"gomës\""},
"playSoundSlap":function(d){return "vendos tingullin e \"goditjes\""},
"playSoundTooltip":function(d){return "Vendos tingullin e zgjedhur."},
"playSoundWinPoint":function(d){return "vendos tingullin e \"fitoj pikë\""},
"playSoundWinPoint2":function(d){return "vendos tingullin e \" fitoj pikë 2\""},
"playSoundWood":function(d){return "vendos tingullin \"e pyllit\""},
"positionOutTopLeft":function(d){return "në pozicionin sipër në të majtë"},
"positionOutTopRight":function(d){return "në pozicionin lart në të djathtë"},
"positionTopOutLeft":function(d){return "në pozicionin e jashtëm lart në të majtë"},
"positionTopLeft":function(d){return "në pozicionin lart në të majtë"},
"positionTopCenter":function(d){return "në pozicionin lart në qendër"},
"positionTopRight":function(d){return "në pozicionin lart në të djathtë"},
"positionTopOutRight":function(d){return "në pozicionin e jashtëm lart në të djathtë"},
"positionMiddleLeft":function(d){return "në pozicionin në mes majtas"},
"positionMiddleCenter":function(d){return "në pozicionin në mes të qendrës"},
"positionMiddleRight":function(d){return "në pozicionin në mes në të djathtë"},
"positionBottomOutLeft":function(d){return "në pozicionin e poshtëm nga jashtë"},
"positionBottomLeft":function(d){return "në pozicionin majtas poshtë"},
"positionBottomCenter":function(d){return "në pozicionin poshtë në mes"},
"positionBottomRight":function(d){return "në pozicionin në mes në të djathtë"},
"positionBottomOutRight":function(d){return "në pozicionin poshtë nga jashtë në të djathtë"},
"positionOutBottomLeft":function(d){return "në pozicionin poshtë në fund majtas"},
"positionOutBottomRight":function(d){return "në pozicionin poshtë në fund djathtas"},
"positionRandom":function(d){return "në pozicionin e çfarëdoshëm"},
"projectileBlueFireball":function(d){return "top zjarri blu"},
"projectilePurpleFireball":function(d){return "top zjarri lejla"},
"projectileRedFireball":function(d){return "top zjarri i kuq"},
"projectileYellowHearts":function(d){return "zemrat e verdha"},
"projectilePurpleHearts":function(d){return "zemrat lejla"},
"projectileRedHearts":function(d){return "zemrat e kuqe"},
"projectileRandom":function(d){return "zakonshem"},
"projectileAnna":function(d){return "grep"},
"projectileElsa":function(d){return "shkëlqen"},
"projectileHiro":function(d){return "mikrobot"},
"projectileBaymax":function(d){return "raketë"},
"projectileRapunzel":function(d){return "tenxhere"},
"projectileCherry":function(d){return "qershi"},
"projectileIce":function(d){return "akull"},
"projectileDuck":function(d){return "rosë"},
"reinfFeedbackMsg":function(d){return "Mund të shtypni butonin \"Vazhdoni Luani\" të shkoni mbrapa për të luajtur historinë tënde."},
"repeatForever":function(d){return "përsërit përgjithmonë"},
"repeatDo":function(d){return "bej"},
"repeatForeverTooltip":function(d){return "Kryej veprimet në këtë bllok herë pas here, ndërkohë që ngjarja juaj po vazhdon."},
"saySprite":function(d){return "thuaj"},
"saySpriteN":function(d){return "pjesmarrës "+appLocale.v(d,"spriteIndex")+" thuaj"},
"saySpriteTooltip":function(d){return "Shfaq një flluskë të shoqëruar me tekstin përkatës nga pjesmarësi i caktuar."},
"saySpriteChoices_0":function(d){return "Përshëndetje aty."},
"saySpriteChoices_1":function(d){return "Përshëndetje të gjithëve."},
"saySpriteChoices_2":function(d){return "Si po ja kaloni?"},
"saySpriteChoices_3":function(d){return "Mirëmëngjesi"},
"saySpriteChoices_4":function(d){return "Mirëdita"},
"saySpriteChoices_5":function(d){return "Natën e mirë"},
"saySpriteChoices_6":function(d){return "Mirëmbrëma"},
"saySpriteChoices_7":function(d){return "Cfarë ka ndonjë te re?"},
"saySpriteChoices_8":function(d){return "Cfarë?"},
"saySpriteChoices_9":function(d){return "Ku?"},
"saySpriteChoices_10":function(d){return "Kur?"},
"saySpriteChoices_11":function(d){return "Mirë."},
"saySpriteChoices_12":function(d){return "Mrekullueshëm!"},
"saySpriteChoices_13":function(d){return "Në rregull."},
"saySpriteChoices_14":function(d){return "Jo keq."},
"saySpriteChoices_15":function(d){return "Pac Fat."},
"saySpriteChoices_16":function(d){return "Po"},
"saySpriteChoices_17":function(d){return "Jo"},
"saySpriteChoices_18":function(d){return "Okej"},
"saySpriteChoices_19":function(d){return "Hedhje e mirë!"},
"saySpriteChoices_20":function(d){return "Kalofshi një ditë të bukur."},
"saySpriteChoices_21":function(d){return "Mirëupafshim."},
"saySpriteChoices_22":function(d){return "Do të kthehem për pak."},
"saySpriteChoices_23":function(d){return "Shihemi nesër!"},
"saySpriteChoices_24":function(d){return "Shihemi më vonë!"},
"saySpriteChoices_25":function(d){return "Bëj kujdes!"},
"saySpriteChoices_26":function(d){return "Shijoje!"},
"saySpriteChoices_27":function(d){return "Më duhet te shkoj."},
"saySpriteChoices_28":function(d){return "Do të bëhemi miq?"},
"saySpriteChoices_29":function(d){return "Punë e mrekullueshme!"},
"saySpriteChoices_30":function(d){return "Uuu huu!"},
"saySpriteChoices_31":function(d){return "Yay!"},
"saySpriteChoices_32":function(d){return "Kënaqësi që ju takova."},
"saySpriteChoices_33":function(d){return "Në rregull!"},
"saySpriteChoices_34":function(d){return "Faleminderit"},
"saySpriteChoices_35":function(d){return "Jo, faleminderit"},
"saySpriteChoices_36":function(d){return "Aaaaaah!"},
"saySpriteChoices_37":function(d){return "S'ka rëndësi"},
"saySpriteChoices_38":function(d){return "Sot"},
"saySpriteChoices_39":function(d){return "Nesër"},
"saySpriteChoices_40":function(d){return "Dje"},
"saySpriteChoices_41":function(d){return "Të gjeta!"},
"saySpriteChoices_42":function(d){return "Më gjete!"},
"saySpriteChoices_43":function(d){return "10, 9, 8, 7, 6, 5, 4, 3, 2, 1!"},
"saySpriteChoices_44":function(d){return "Je i mrekullueshëm!"},
"saySpriteChoices_45":function(d){return "Je zbavitës!"},
"saySpriteChoices_46":function(d){return "Je budalla!"},
"saySpriteChoices_47":function(d){return "Je një shok i mirë!"},
"saySpriteChoices_48":function(d){return "Kujdes!"},
"saySpriteChoices_49":function(d){return "Përkulu!"},
"saySpriteChoices_50":function(d){return "Të kapa!"},
"saySpriteChoices_51":function(d){return "Ou!"},
"saySpriteChoices_52":function(d){return "Më fal!"},
"saySpriteChoices_53":function(d){return "Kujdes!"},
"saySpriteChoices_54":function(d){return "Whoa!"},
"saySpriteChoices_55":function(d){return "Ups!"},
"saySpriteChoices_56":function(d){return "Për pak me kape!"},
"saySpriteChoices_57":function(d){return "Përpjekje e mirë!"},
"saySpriteChoices_58":function(d){return "Ti s'më kap dot!"},
"scoreText":function(d){return "Pikë: "+appLocale.v(d,"playerScore")},
"setBackground":function(d){return "vendos sfond"},
"setBackgroundRandom":function(d){return "vendos sfond të çfarëdoshëm"},
"setBackgroundBlack":function(d){return "vendos sfond të zi"},
"setBackgroundCave":function(d){return "vcendos sfond shpelle"},
"setBackgroundCloudy":function(d){return "vendos sfond me re"},
"setBackgroundHardcourt":function(d){return "vendos sfond me terren të fortë"},
"setBackgroundNight":function(d){return "vendos sfond nate"},
"setBackgroundUnderwater":function(d){return "vendos sfond nën ujor"},
"setBackgroundCity":function(d){return "vendos sfond qyteti"},
"setBackgroundDesert":function(d){return "vendos sfond shkretëtire"},
"setBackgroundRainbow":function(d){return "vendos sfond ylberi"},
"setBackgroundSoccer":function(d){return "vendos sfond futbolli"},
"setBackgroundSpace":function(d){return "vendos sfond hapësire"},
"setBackgroundTennis":function(d){return "vendos sfond tenisi"},
"setBackgroundWinter":function(d){return "vendos sfond dimri"},
"setBackgroundLeafy":function(d){return "vendos sfond me gjethe"},
"setBackgroundGrassy":function(d){return "vendos sfond me bar"},
"setBackgroundFlower":function(d){return "vendos sfond me lule"},
"setBackgroundTile":function(d){return "vendos sfond me tjegulla"},
"setBackgroundIcy":function(d){return "vendos sfond të akullt"},
"setBackgroundSnowy":function(d){return "vendos sfond me dëborë"},
"setBackgroundTooltip":function(d){return "Rregullo sfondin e imazhit"},
"setEnemySpeed":function(d){return "vendos shpejtësinë e armikut"},
"setPlayerSpeed":function(d){return "vendos shpejtësinë e lojtarit"},
"setScoreText":function(d){return "vendos pikët"},
"setScoreTextTooltip":function(d){return "Vendos tekstin, që të shfaqet në fushën e pikëve."},
"setSpriteEmotionAngry":function(d){return "tek nje humor i inatosur"},
"setSpriteEmotionHappy":function(d){return "në gjëndje të gëzuar"},
"setSpriteEmotionNormal":function(d){return "në gjëndje normale"},
"setSpriteEmotionRandom":function(d){return "në një gjëndje të rastit"},
"setSpriteEmotionSad":function(d){return "në gjëndje të mërzitur"},
"setSpriteEmotionTooltip":function(d){return "Vendos gjëndjen e pjesmarrësit"},
"setSpriteAlien":function(d){return "në një imazh të huaj"},
"setSpriteBat":function(d){return "në një imazh lakuriqi nate"},
"setSpriteBird":function(d){return "në një imazh zogu"},
"setSpriteCat":function(d){return "në një imazh maceje"},
"setSpriteCaveBoy":function(d){return "në një imazh djali prej shpelle"},
"setSpriteCaveGirl":function(d){return "në një imazh vajze prej shpelle"},
"setSpriteDinosaur":function(d){return "në një imazh dinosauri"},
"setSpriteDog":function(d){return "në një imazh qeni"},
"setSpriteDragon":function(d){return "në një imazh dragoi"},
"setSpriteGhost":function(d){return "në një imazh fantazme"},
"setSpriteHidden":function(d){return "në një imazh të fshehur"},
"setSpriteHideK1":function(d){return "fsheh"},
"setSpriteAnna":function(d){return "tek nje imazh i Anës"},
"setSpriteElsa":function(d){return "tek nje imazh i Elsës"},
"setSpriteHiro":function(d){return "në një imazh Hiro"},
"setSpriteBaymax":function(d){return "në një imazh Baymax"},
"setSpriteRapunzel":function(d){return "në një imazh Rapunzel"},
"setSpriteKnight":function(d){return "në një imazh kalorësi"},
"setSpriteMonster":function(d){return "në një imazh përbindëshi"},
"setSpriteNinja":function(d){return "në një imazh ninja të maskuar"},
"setSpriteOctopus":function(d){return "në një imazh oktapodi"},
"setSpritePenguin":function(d){return "në një imazh pinguini"},
"setSpritePirate":function(d){return "në një imazh pirati"},
"setSpritePrincess":function(d){return "në një imazh princeshe"},
"setSpriteRandom":function(d){return "në një imazh të rastësishëm"},
"setSpriteRobot":function(d){return "në një imazh roboti"},
"setSpriteShowK1":function(d){return "trego"},
"setSpriteSpacebot":function(d){return "në një imazh spacebot"},
"setSpriteSoccerGirl":function(d){return "në një imazh vajze futbolliste"},
"setSpriteSoccerBoy":function(d){return "në një imazh djali futbollist"},
"setSpriteSquirrel":function(d){return "në një imazh ketri"},
"setSpriteTennisGirl":function(d){return "në një imazh vajze teniste"},
"setSpriteTennisBoy":function(d){return "në një imazh djali tenist"},
"setSpriteUnicorn":function(d){return "në një imazh njëbrirëshi"},
"setSpriteWitch":function(d){return "në një imazh shtrige"},
"setSpriteWizard":function(d){return "në një imazh magjistari"},
"setSpritePositionTooltip":function(d){return "Lëviz menjëherë pjesmarrësin në vendin e caktuar."},
"setSpriteK1Tooltip":function(d){return "Tregon ose fsheh pjesmarrësin e përcaktuar."},
"setSpriteTooltip":function(d){return "Vendos imazhin e pjesmarrësit"},
"setSpriteSizeRandom":function(d){return "në një madhësi të çfarëdoshme"},
"setSpriteSizeVerySmall":function(d){return "në një madhësi shumë të vogël"},
"setSpriteSizeSmall":function(d){return "në një madhësi të vogël"},
"setSpriteSizeNormal":function(d){return "në një madhësi normale"},
"setSpriteSizeLarge":function(d){return "në një madhësi të madhe"},
"setSpriteSizeVeryLarge":function(d){return "në një madhësi shumë të madhe"},
"setSpriteSizeTooltip":function(d){return "Vendos madhësinë e pjesmarrësit"},
"setSpriteSpeedRandom":function(d){return "në një shpejtsi të çfarëdoshme"},
"setSpriteSpeedVerySlow":function(d){return "me një shpejtësi shumë të ngadaltë"},
"setSpriteSpeedSlow":function(d){return "me një shpejtësi të ngadaltë"},
"setSpriteSpeedNormal":function(d){return "me një shpejtësi normale"},
"setSpriteSpeedFast":function(d){return "me një shpejtësi shumë të shpejtë"},
"setSpriteSpeedVeryFast":function(d){return "me një shpejtësi akoma edhe më të shpejtë"},
"setSpriteSpeedTooltip":function(d){return "Vendos shpejtësinë e pjesmarrësit"},
"setSpriteZombie":function(d){return "në një imazh zombi"},
"shareStudioTwitter":function(d){return "Shiko ngjarjen që bëra unë. E shkruajta vetë me @codeorg"},
"shareGame":function(d){return "Ndaj ngjarjen tënde:"},
"showCoordinates":function(d){return "trego koordinatat"},
"showCoordinatesTooltip":function(d){return "shfaq koordinatat e protagonistëve në ekran"},
"showTitleScreen":function(d){return "shfaq ekranin e titullit"},
"showTitleScreenTitle":function(d){return "titull"},
"showTitleScreenText":function(d){return "tekst"},
"showTSDefTitle":function(d){return "shtyp titullin këtu"},
"showTSDefText":function(d){return "shtyp tekstin këtu"},
"showTitleScreenTooltip":function(d){return "Shfaq një ekran shoqëruar me titullin dhe tekstin përkatës."},
"size":function(d){return "madhësia"},
"setSprite":function(d){return "vendos"},
"setSpriteN":function(d){return "vendos pjesmarrësin "+appLocale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "përtyp"},
"soundGoal1":function(d){return "qëllimi 1"},
"soundGoal2":function(d){return "qëllimi 2"},
"soundHit":function(d){return "godit"},
"soundLosePoint":function(d){return "humb pikë"},
"soundLosePoint2":function(d){return "humb pikën 2"},
"soundRetro":function(d){return "retro"},
"soundRubber":function(d){return "gomë"},
"soundSlap":function(d){return "gjuaj"},
"soundWinPoint":function(d){return "fito pikë"},
"soundWinPoint2":function(d){return "fito pikë 2"},
"soundWood":function(d){return "druri"},
"speed":function(d){return "shpejtësia"},
"startSetValue":function(d){return "fillo (funksion)"},
"startSetVars":function(d){return "game_vars (ttulli, nëntitulli, sfond, target, rrezik, lojtar)"},
"startSetFuncs":function(d){return "game_funcs (përditëso-targetin, përditëso-rrezikun, përditëso-lojtarin, përplaset?, në-ekran?)"},
"stopSprite":function(d){return "ndalo"},
"stopSpriteN":function(d){return "ndalo pjesmarrësin "+appLocale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Ndalon lëvizjen e një pjemsarrësi."},
"throwSprite":function(d){return "hedh"},
"throwSpriteN":function(d){return "pjesmarrës "+appLocale.v(d,"spriteIndex")+" hedh"},
"throwTooltip":function(d){return "Hedh një raketë nga një pjesmarrës i caktuar."},
"vanish":function(d){return "zhduket"},
"vanishActorN":function(d){return "zhduk pjesmarrësin "+appLocale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "Zhduk pjesmarrësin."},
"waitFor":function(d){return "prit për"},
"waitSeconds":function(d){return "sekondat"},
"waitForClick":function(d){return "prit për klikimin"},
"waitForRandom":function(d){return "prit për çfarëdo"},
"waitForHalfSecond":function(d){return "prit për gjysëm sekonde"},
"waitFor1Second":function(d){return "prit për një sekondë"},
"waitFor2Seconds":function(d){return "prit 2 sekonda"},
"waitFor5Seconds":function(d){return "prit 5 sekonda"},
"waitFor10Seconds":function(d){return "prit 10 sekonda"},
"waitParamsTooltip":function(d){return "Pret për një numër të caktuar sekondash ose përdor zeron për të pritur derisa të ndodhë klikimi."},
"waitTooltip":function(d){return "Pret për një sasi të caktuar kohe ose pret derisa të ndodhë klikimi."},
"whenArrowDown":function(d){return "shigjetë drejtuar poshtë"},
"whenArrowLeft":function(d){return "shigjetë drejtuar majtas"},
"whenArrowRight":function(d){return "shigjetë drejtuar djathtas"},
"whenArrowUp":function(d){return "shigjetë drejtuar lart"},
"whenArrowTooltip":function(d){return "Kryej veprimet e mëposhtme kur tasti i shigjetës së caktuar të shtypet."},
"whenDown":function(d){return "kur shigjeta është poshtë"},
"whenDownTooltip":function(d){return "Kryej veprimet më poshtë kur tasti i shigjetës poshtë të shtypet."},
"whenGameStarts":function(d){return "kur ngjarjafillon"},
"whenGameStartsTooltip":function(d){return "Kryej veprimet e mëposhtme kur ngjarja fillon."},
"whenLeft":function(d){return "kur shigjeta është majtas"},
"whenLeftTooltip":function(d){return "Kryej veprimet më poshtë kur tasti i shigjetës majtas të shtypet."},
"whenRight":function(d){return "kur shigjeta është djathtas"},
"whenRightTooltip":function(d){return "Kryej veprimet më poshtë kur tasti i shigjetës djathtas të shtypet."},
"whenSpriteClicked":function(d){return "kur klikoi pjesmarrësi"},
"whenSpriteClickedN":function(d){return "kur klikoi pjesmarrësi "+appLocale.v(d,"spriteIndex")},
"whenSpriteClickedTooltip":function(d){return "Kryej veprimet më poshtë kur pjesmarrësi klikohet."},
"whenSpriteCollidedN":function(d){return "kur pjesmarrësi "+appLocale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "Kryej veprimet më poshtë kur pjesmarrësi prek pjesmarrësin tjetër."},
"whenSpriteCollidedWith":function(d){return "prek"},
"whenSpriteCollidedWithAnyActor":function(d){return "prek ndonjë pjesmarrës"},
"whenSpriteCollidedWithAnyEdge":function(d){return "prek ndonjë cep"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "prek ndonjë raketë"},
"whenSpriteCollidedWithAnything":function(d){return "prek ndonjë gjë"},
"whenSpriteCollidedWithN":function(d){return "prek pjesmarrësin "+appLocale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "prek topin e zjarrtë blu"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "prek topin e zjarrit lejla"},
"whenSpriteCollidedWithRedFireball":function(d){return "prek topin e zjarrit të kuq"},
"whenSpriteCollidedWithYellowHearts":function(d){return "prek zemrat e verdha"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "prek zemrat lejla"},
"whenSpriteCollidedWithRedHearts":function(d){return "prek zemrat e kuqe"},
"whenSpriteCollidedWithBottomEdge":function(d){return "prek cepin në fund"},
"whenSpriteCollidedWithLeftEdge":function(d){return "prek cepin e majtë"},
"whenSpriteCollidedWithRightEdge":function(d){return "prek cepin e djathtë"},
"whenSpriteCollidedWithTopEdge":function(d){return "prek cepin në majë"},
"whenUp":function(d){return "kur shigjeta është lart"},
"whenUpTooltip":function(d){return "Kryej veprimet më poshtë kur tasti i shigjetës lart shtypet."},
"yes":function(d){return "Po"}};