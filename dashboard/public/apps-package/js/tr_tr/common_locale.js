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
},"da":function(n){return n===1?"one":"other"},"de":function(n){return n===1?"one":"other"},"el":function(n){return n===1?"one":"other"},"es":function(n){return n===1?"one":"other"},"et":function(n){return n===1?"one":"other"},"eu":function(n){return n===1?"one":"other"},"fa":function(n){return "other"},"fi":function(n){return n===1?"one":"other"},"fil":function(n){return n===0||n==1?"one":"other"},"fr":function(n){return Math.floor(n)===0||Math.floor(n)==1?"one":"other"},"he":function(n){return n===1?"one":"other"},"hi":function(n){return n===0||n==1?"one":"other"},"hr":function(n){
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
"and":function(d){return "ve"},
"booleanTrue":function(d){return "doğru"},
"booleanFalse":function(d){return "false"},
"blocklyMessage":function(d){return "Parçalı"},
"catActions":function(d){return "Eylemler"},
"catColour":function(d){return "Renk"},
"catLogic":function(d){return "Mantık"},
"catLists":function(d){return "Listeler"},
"catLoops":function(d){return "Döngüler"},
"catMath":function(d){return "Matematik"},
"catProcedures":function(d){return "Fonksiyonlar"},
"catText":function(d){return "yazı"},
"catVariables":function(d){return "Değişkenler"},
"codeTooltip":function(d){return "Oluşturulan JavaScript kodunu gör."},
"continue":function(d){return "Devam Et"},
"dialogCancel":function(d){return "İptal"},
"dialogOK":function(d){return "TAMAM"},
"directionNorthLetter":function(d){return "K"},
"directionSouthLetter":function(d){return "G"},
"directionEastLetter":function(d){return "D"},
"directionWestLetter":function(d){return "B"},
"end":function(d){return "son"},
"emptyBlocksErrorMsg":function(d){return "\"Tekrar\" bloğu veya \"Eğer\" bloğunun çalışması için  içerisinde bir başka blok yer almalıdır. İçteki bloğu, dış blok içerisine yerleştirdiğine emin ol."},
"emptyFunctionBlocksErrorMsg":function(d){return "Fonksiyon bloğunun çalışabilmesi için içine başka bloklar koymalısın."},
"errorEmptyFunctionBlockModal":function(d){return "Fonksiyon tanımının içinde bloklara ihtiyacın var. \"Düzenle\" butonuna tıkla ve blokları yeşil bloğun içine sürükle."},
"errorIncompleteBlockInFunction":function(d){return "Fonksiyon tanımının içinde eksik blokların kalıp kalmadığından emin olmak için \"düzenle\" butonuna tıkla."},
"errorParamInputUnattached":function(d){return "Çalışma alanında bulunan fonksiyon bloğundaki her parametre girdisine bir blok eklemeyi unutma."},
"errorUnusedParam":function(d){return "Parametre bloğu ekledin ama bunu tanımında kullanmadın. \"Düzenle\" butonuna tıklayarak ve parametre bloğunu yeşil bloğun içine yerleştirerek parametreni kullandığından emin ol."},
"errorRequiredParamsMissing":function(d){return "\"Düzenle\" butonuna tıklayarak ve gerekli parametreleri ekleyecek fonksiyonun için bir parametre yarat. Yeni parametre bloğunu, fonksiyon tanımının içine sürükle."},
"errorUnusedFunction":function(d){return "Bir fonksiyon yarattın ama çalışma alanında kullanmadın! Araç çubuğundaki \"fonksiyonlar\" kısmına tıkla ve fonksiyonunu programında kullandığına emin ol."},
"errorQuestionMarksInNumberField":function(d){return "\"???\" kısmını bir değerle değiştirmeyi deneyin."},
"extraTopBlocks":function(d){return "Blokları bağlamadın. \"Çalıştığı zaman\" bloğuna bağlamayı denediniz mi?"},
"finalStage":function(d){return "Son aşamayı bitirdiniz. Tebrikler!"},
"finalStageTrophies":function(d){return "Tebrikler! Son aşamayı bitirerek "+locale.p(d,"numTrophies",0,"tr",{"one":"bir ganimet","other":locale.n(d,"numTrophies")+" ganimet"})+" kazandınız."},
"finish":function(d){return "Bitiş"},
"generatedCodeInfo":function(d){return "Dünyanın en iyi üniversiteleri bile yap-boz oyun tabanlı kodlama öğretiyor (Örn. "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). Ayrıca detaylı incelerseniz, birleştirdiğiniz bloklar dünyanın en yaygın kullanılan kodlama dili olan JavaScript dilinde de görüntüleniyor:"},
"hashError":function(d){return "Üzgünüz, '%1' kayıtlı herhangi bir programa karşılık gelmez."},
"help":function(d){return "Yardım"},
"hintTitle":function(d){return "İpucu:"},
"jump":function(d){return "zıpla"},
"levelIncompleteError":function(d){return "Tüm gerekli türdeki blokları kullanıyorsunuz ama doğru şekilde değil."},
"listVariable":function(d){return "liste"},
"makeYourOwnFlappy":function(d){return "Kendi Flappy Oyununu Yap"},
"missingBlocksErrorMsg":function(d){return "Aşağıdaki bloklardan bir ya da birden fazlasını kullanarak bulmacayı çözmeye çalışın."},
"nextLevel":function(d){return "Tebrikler! Bulmaca "+locale.v(d,"puzzleNumber")+" tamamlandı."},
"nextLevelTrophies":function(d){return "Tebrikler! Bulmaca "+locale.v(d,"puzzleNumber")+" tamamlandı ve "+locale.p(d,"numTrophies",0,"tr",{"one":"bir kupa","other":locale.n(d,"numTrophies")+"  kupa"})+" kazandınız."},
"nextStage":function(d){return "Tebrikler! "+locale.v(d,"stageName")+" tamamlandı."},
"nextStageTrophies":function(d){return "Tebrikler! Kademe "+locale.v(d,"stageNumber")+" tamamlandı ve "+locale.p(d,"numTrophies",0,"tr",{"one":"bir kupa","other":locale.n(d,"numTrophies")+" kupalar"})+" kazandınız."},
"numBlocksNeeded":function(d){return "Tebrikler! Bulmaca "+locale.v(d,"puzzleNumber")+" tamamlandı. (Ancak, sadece "+locale.p(d,"numBlocks",0,"tr",{"one":"1 blok","other":locale.n(d,"numBlocks")+" blok"})+" kullanmış olabilirdiniz.)"},
"numLinesOfCodeWritten":function(d){return "Tam olarak "+locale.p(d,"numLines",0,"tr",{"one":"1 satır","other":locale.n(d,"numLines")+" satır"})+" kod yazdınız!"},
"play":function(d){return "oynat"},
"print":function(d){return "Yazdır"},
"puzzleTitle":function(d){return "Bulmaca "+locale.v(d,"puzzle_number")+" / "+locale.v(d,"stage_total")},
"repeat":function(d){return "bu işlemleri"},
"resetProgram":function(d){return "Yeniden başla"},
"runProgram":function(d){return "Çalıştır"},
"runTooltip":function(d){return "Çalişma alaninda bloklar tarafından tanımlanmış bir program çalıştır."},
"score":function(d){return "puan"},
"showCodeHeader":function(d){return "Kodu Görüntüle"},
"showBlocksHeader":function(d){return "Bloklarını göster"},
"showGeneratedCode":function(d){return "Kodu Görüntüle"},
"stringEquals":function(d){return "dizi=?"},
"subtitle":function(d){return "Bir görsel programa ortamı"},
"textVariable":function(d){return "metin"},
"tooFewBlocksMsg":function(d){return "Tüm gerekli blok türlerini kullanıyorsun,fakat bulmacayı tamamlamak için bu blok tiplerinden daha fazla kullanmayı dene."},
"tooManyBlocksMsg":function(d){return "Bu bulmaca <x id='START_SPAN'/><x id='END_SPAN'/> bloklarıyla çözülebilir."},
"tooMuchWork":function(d){return "Bana çok fazla iş yaptırdın!Daha az tekrar etmeyi deneyebilir misin ?"},
"toolboxHeader":function(d){return "bloklar"},
"openWorkspace":function(d){return "Nasıl Çalışır"},
"totalNumLinesOfCodeWritten":function(d){return "Toplam: "+locale.p(d,"numLines",0,"tr",{"one":"1 satır","other":locale.n(d,"numLines")+" satır"})+" kod."},
"tryAgain":function(d){return "Tekrar dene"},
"hintRequest":function(d){return "İpucunu gör"},
"backToPreviousLevel":function(d){return "Önceki seviyeye dön"},
"saveToGallery":function(d){return "Galerisine Kaydet"},
"savedToGallery":function(d){return "Galeri klasörüne kaydedilmiş!"},
"shareFailure":function(d){return "Üzgünüz, bu programı paylaşamıyoruz."},
"workspaceHeader":function(d){return "Bloklarını burda topla: "},
"workspaceHeaderJavaScript":function(d){return "JavaScript kodunuzu buraya yazın"},
"infinity":function(d){return "Sonsuz"},
"rotateText":function(d){return "Cihazınızı döndürün."},
"orientationLock":function(d){return "Yönlendirme kilidini aygıt ayarlarından devre dışı bırakın."},
"wantToLearn":function(d){return "Kod yazmayı öğrenmek ister misiniz?"},
"watchVideo":function(d){return "Videoyu İzle"},
"when":function(d){return "Ne zaman"},
"whenRun":function(d){return "Çalıştığı zaman"},
"tryHOC":function(d){return "Kodlama Saati'ni Deneyin"},
"signup":function(d){return "Giriş dersi için üye olun"},
"hintHeader":function(d){return "İşte bir ipucu:"},
"genericFeedback":function(d){return "Sonucunu gör ve programını düzeltmeyi dene."},
"toggleBlocksErrorMsg":function(d){return "You need to correct an error in your program before it can be shown as blocks."},
"defaultTwitterText":function(d){return "Ne yaptığıma bakın"}};