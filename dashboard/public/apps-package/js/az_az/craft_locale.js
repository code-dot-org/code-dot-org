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
"blockDestroyBlock":function(d){return "bloku dağıt"},
"blockIf":function(d){return "əgər"},
"blockIfLavaAhead":function(d){return "əgər qabaqda lava varsa"},
"blockMoveForward":function(d){return "irəli get"},
"blockPlaceTorch":function(d){return "məşəl yerləşdir"},
"blockPlaceXAheadAhead":function(d){return "irəli"},
"blockPlaceXAheadPlace":function(d){return "məkan"},
"blockPlaceXPlace":function(d){return "məkan"},
"blockPlantCrop":function(d){return "bitki mıhsulu"},
"blockShear":function(d){return "kəs"},
"blockTillSoil":function(d){return "torpağa qədər"},
"blockTurnLeft":function(d){return "sola dön"},
"blockTurnRight":function(d){return "sağa dön"},
"blockTypeBedrock":function(d){return "ana süxur"},
"blockTypeBricks":function(d){return "kərpiclər"},
"blockTypeClay":function(d){return "gil"},
"blockTypeClayHardened":function(d){return "bərkimiş gil"},
"blockTypeCobblestone":function(d){return "çay daşı"},
"blockTypeDirt":function(d){return "torpaq"},
"blockTypeDirtCoarse":function(d){return "iri torpaq"},
"blockTypeEmpty":function(d){return "boş"},
"blockTypeFarmlandWet":function(d){return "əkinçilik"},
"blockTypeGlass":function(d){return "şüşə"},
"blockTypeGrass":function(d){return "ot"},
"blockTypeGravel":function(d){return "çınqıl"},
"blockTypeLava":function(d){return "lava"},
"blockTypeLogAcacia":function(d){return "akasiya qeydi"},
"blockTypeLogBirch":function(d){return "ağcaqayın qeydləri"},
"blockTypeLogJungle":function(d){return "cəngəllik qeydi"},
"blockTypeLogOak":function(d){return "palıd qeydləri"},
"blockTypeLogSpruce":function(d){return "küknar qeydləri"},
"blockTypeOreCoal":function(d){return "kömür filizi"},
"blockTypeOreDiamond":function(d){return "almaz filizi"},
"blockTypeOreEmerald":function(d){return "zümrüd filizi"},
"blockTypeOreGold":function(d){return "qızıl filizi"},
"blockTypeOreIron":function(d){return "dəmir filizi"},
"blockTypeOreLapis":function(d){return "lapis filizi"},
"blockTypeOreRedstone":function(d){return "qırmızı daş filizi"},
"blockTypePlanksAcacia":function(d){return "akasiya odunları"},
"blockTypePlanksBirch":function(d){return "ağcaqayın odunları"},
"blockTypePlanksJungle":function(d){return "cəngəllik odunları"},
"blockTypePlanksOak":function(d){return "palıd odunları"},
"blockTypePlanksSpruce":function(d){return "küknar odunları"},
"blockTypeRail":function(d){return "rels"},
"blockTypeSand":function(d){return "qum"},
"blockTypeSandstone":function(d){return "qumdaşı"},
"blockTypeStone":function(d){return "daş"},
"blockTypeTnt":function(d){return "bomba"},
"blockTypeTree":function(d){return "ağac"},
"blockTypeWater":function(d){return "su"},
"blockTypeWool":function(d){return "yun"},
"blockWhileXAheadAhead":function(d){return "irəli"},
"blockWhileXAheadDo":function(d){return "et"},
"blockWhileXAheadWhile":function(d){return "hələ ki,"},
"generatedCodeDescription":function(d){return "Bu tapmacada blokları sürüşdürüb yerləşdirərək \"Javascript\" adlı kompyuter dilində bir sıra təlimat düzəltdiniz. Bu kod kompyuterlərə ekranda nə təsvir olacağını deyir. \"Minecraft\"-da gördüyünüz və etdiyiniz hər şey də eyni cür bunun kimi kompyuter kodu sıraları ilə başlayır."},
"houseSelectChooseFloorPlan":function(d){return "Evinizin planı üçün döşəmə seçin."},
"houseSelectEasy":function(d){return "Asan"},
"houseSelectHard":function(d){return "Çətin"},
"houseSelectLetsBuild":function(d){return "Ev tikək."},
"houseSelectMedium":function(d){return "Orta"},
"keepPlayingButton":function(d){return "Oyuna davam edin"},
"level10FailureMessage":function(d){return "Qabağa keçmək üçün lavanın üstünü bağlayın və sonra digər tərəfdəki 2 dəmir blokunu çıxarın."},
"level11FailureMessage":function(d){return "Qabağınızda lava varsa, irəliyə qırıqdaş yerləşdirməyi unutmayın. Beləliklə, bu qaynaqları rahat şəkildə çıxara bilərsiniz."},
"level12FailureMessage":function(d){return "3 Dənə qızıldaşı çıxarmağı unutmayın. Bu, evinizi tikəndə öyrəndiklərinizi və lavadan qurtulmaq üçün \"əgər\" komandalarından istifadə etməyi birləşdirəcək."},
"level13FailureMessage":function(d){return "Qapınızdan xəritənin ucuna qədər olan yol boyu \"rels\" yerləşdirin."},
"level1FailureMessage":function(d){return "Qoyunun yanına getmək üçün komandalaradan istifadə etməlisən."},
"level1TooFewBlocksMessage":function(d){return "Qoyuna çatmaq üçün daha çox komandalardan istifadə et."},
"level2FailureMessage":function(d){return "Bir ağacı kəsmək üçün ağacın gövdəsinə tərəf gedin və \"bloku məh et\" komandasından istifadə edin."},
"level2TooFewBlocksMessage":function(d){return "Ağacı kəsmək üçün daha çox komanda istifadə etməyə cəhd edin. Gövdəsinə tərəf gedin və \"bloku məhv et\" komandasından istifadə edin."},
"level3FailureMessage":function(d){return "Hər 2 qoyundan da yun almaq üçün qoyunlara tərəf gedin və \"qırx\" komandasından istifadə edin. Qoyunlara çatmaq üçün dönmə komandalarından istifadə etməyi unutmayın."},
"level3TooFewBlocksMessage":function(d){return "Hər 2 qoyundan da yun toplamaq üçün daha çox komanda istifadə edin. Qoyunlara tərəf gedin və \"qırx\" komandasından istifadə edin."},
"level4FailureMessage":function(d){return "Hər 3 ağac gövdəsi üçün \"bloku dağıt\" komandasından istifadə etməlisən."},
"level5FailureMessage":function(d){return "Bir divar tikmək üçün bloklarınızı torpaq xəttinə yerləşdirin. Çəhrayı \"təkrarla\" komandası \"bloku yerləşdir\" və \"irəli get\" kimi içinə yerləşdirilən komandaları çalışdıracaq."},
"level6FailureMessage":function(d){return "Evin planında blokları yerləşdir və tapmacayı tamamla."},
"level7FailureMessage":function(d){return "Tünd rəngli torpağın hər bir parçasına əkinləri yerləşdirmək üçün \"ək\" komandasından istifadə et."},
"level8FailureMessage":function(d){return "Əgər bir liana toxunsanız, partlayar. Onların ətrafından gizlincə keçin və evinizə girin."},
"level9FailureMessage":function(d){return "Yolu işıqlandırması üçün azı 2 məşəl və azı 2 kömür şaxtasını yerləşdirməlisən."},
"minecraftBlock":function(d){return "blok"},
"nextLevelMsg":function(d){return "Tapmaca "+craft_locale.v(d,"puzzleNumber")+" tamamlandı. Təbriklər!"},
"playerSelectChooseCharacter":function(d){return "Xarakter seç."},
"playerSelectChooseSelectButton":function(d){return "Seç"},
"playerSelectLetsGetStarted":function(d){return "Başlayaq."},
"reinfFeedbackMsg":function(d){return "Sən oyununu oynamağa geri qayıtmaq üçün \"Oyuna davam et\"-ə basa bilərsən."},
"replayButton":function(d){return "Təkrarla"},
"selectChooseButton":function(d){return "Seç"},
"tooManyBlocksFail":function(d){return "Tapmaca "+craft_locale.v(d,"puzzleNumber")+" tamamlandı. Təbriklər! Həmçinin bunu "+craft_locale.p(d,"numBlocks",0,"en",{"one":"1 block","other":craft_locale.n(d,"numBlocks")+" blocks"})+" ilə də tamamlaya bilərsiniz."}};