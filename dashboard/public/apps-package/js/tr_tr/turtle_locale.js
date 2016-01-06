var turtle_locale = {lc:{"ar":function(n){
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
v:function(d,k){turtle_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){turtle_locale.c(d,k);return d[k] in p?p[d[k]]:(k=turtle_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){turtle_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).turtle_locale = {
"blocksUsed":function(d){return "Kullanılan blok: %1"},
"branches":function(d){return "dallar"},
"catColour":function(d){return "Renk"},
"catControl":function(d){return "Döngüler"},
"catMath":function(d){return "Matematik"},
"catProcedures":function(d){return "Fonksiyonlar"},
"catTurtle":function(d){return "Eylemler"},
"catVariables":function(d){return "Değişkenler"},
"catLogic":function(d){return "Mantık"},
"colourTooltip":function(d){return "Kalem rengini değiştirir."},
"createACircle":function(d){return "bir çember oluşturun"},
"createSnowflakeSquare":function(d){return "bir kar tanesi türü kare oluşturun"},
"createSnowflakeParallelogram":function(d){return "kar tanesi türü paralelkenar oluşturmak"},
"createSnowflakeLine":function(d){return "bir kar tanesi türü çizgi oluşturma"},
"createSnowflakeSpiral":function(d){return "bir kar tanesi helezon türü oluşturma"},
"createSnowflakeFlower":function(d){return "bir kar tanesi türü çiçek oluşturmak"},
"createSnowflakeFractal":function(d){return "bir kar tanesi türü fraktal oluşturun"},
"createSnowflakeRandom":function(d){return "bir tür rastgele kar tanesi oluşturmak"},
"createASnowflakeBranch":function(d){return "bir kar tanesi dal oluşturun"},
"degrees":function(d){return "dereceler"},
"depth":function(d){return "derinlik"},
"dots":function(d){return "pikseller"},
"drawACircle":function(d){return "bir daire çizin"},
"drawAFlower":function(d){return "bir çiçek çiz"},
"drawAHexagon":function(d){return "bir Altıgen çiz"},
"drawAHouse":function(d){return "bir ev çiz"},
"drawAPlanet":function(d){return "bir gezegen çiz"},
"drawARhombus":function(d){return "bir karo çiz"},
"drawARobot":function(d){return "bir robot çiz"},
"drawARocket":function(d){return "bir roket çiz"},
"drawASnowflake":function(d){return "bir kar tanesi çiz"},
"drawASnowman":function(d){return "kardanadam çiz"},
"drawASquare":function(d){return "bir kare çizmek"},
"drawAStar":function(d){return "bir yıldız çiz"},
"drawATree":function(d){return "bir ağaç çiz"},
"drawATriangle":function(d){return "bir üçgen çizin"},
"drawUpperWave":function(d){return "üst dalga çiz"},
"drawLowerWave":function(d){return "alt dalga çiz"},
"drawStamp":function(d){return "Pul çizmek"},
"heightParameter":function(d){return "Yükseklik"},
"hideTurtle":function(d){return "Sanatçı gizle"},
"jump":function(d){return "zıpla"},
"jumpBackward":function(d){return "geriye atla"},
"jumpForward":function(d){return "İleri atla"},
"jumpTooltip":function(d){return "Sanatçıyı, hiç iz bırakmadan taşır."},
"jumpEastTooltip":function(d){return "Sanatçıyı doğuya hiç iz bırakmadan taşır."},
"jumpNorthTooltip":function(d){return "Sanatçıyı kuzeye hiç iz bırakmadan taşır."},
"jumpSouthTooltip":function(d){return "Sanatçıyı güneye hiç iz bırakmadan taşır."},
"jumpWestTooltip":function(d){return "Sanatçıyı batıya hiç iz bırakmadan taşır."},
"lengthFeedback":function(d){return "Hareket mesafeleri dışında doğru anlamışsın."},
"lengthParameter":function(d){return "uzunluk"},
"loopVariable":function(d){return "sayaç"},
"moveBackward":function(d){return "geriye doğru taşı"},
"moveEastTooltip":function(d){return "Sanatçıyı doğuya hareket ettirir."},
"moveForward":function(d){return "ileriye taşı"},
"moveForwardTooltip":function(d){return "Sanatçı ilerletir."},
"moveNorthTooltip":function(d){return "Sanatçıyı kuzeye hareket ettirir."},
"moveSouthTooltip":function(d){return "Sanatçıyı güneye hareket ettirir."},
"moveWestTooltip":function(d){return "Sanatçıyı batıya hareket ettirir."},
"moveTooltip":function(d){return "Sanatçıyı öne veya arkaya belirtilen miktar kadar taşır."},
"notBlackColour":function(d){return "Bu bulmaca için siyah dışında bir renk ayarlamanız gerekir."},
"numBlocksNeeded":function(d){return "Bu Bulmaca %1 blok ile çözülebilir.  %2'yi kullandık."},
"penDown":function(d){return "kalemi indir"},
"penTooltip":function(d){return "Çizimi başlatmak için veya durdurmak için kalemi kaldırır ya da indirir."},
"penUp":function(d){return "Kalemi kaldır"},
"reinfFeedbackMsg":function(d){return "Çiziminiz burada!Çiziminizin üzerinde çalışmaya devam et veya devam etmek için sonraki bulmaca geç"},
"setAlpha":function(d){return "alpha ayarla"},
"setColour":function(d){return "renk ayarla"},
"setPattern":function(d){return "deseni ayarla"},
"setWidth":function(d){return "genişliği ayarla"},
"shareDrawing":function(d){return "Kendi çiziminizi paylaşın:"},
"showMe":function(d){return "Göster"},
"showTurtle":function(d){return "Sanatçıyı göster"},
"sizeParameter":function(d){return "boyut"},
"step":function(d){return "adım"},
"tooFewColours":function(d){return "Bu bulmaca için en az %1 farklı renk kullanmalısınız. Siz sadece %2 kullandınız."},
"turnLeft":function(d){return "kadar sola dön"},
"turnRight":function(d){return "kadar sağa dön"},
"turnRightTooltip":function(d){return "Sanatçıyı belirtilen açı kadar döndürür."},
"turnTooltip":function(d){return "Sanatçı sağa ya da sola derece belirtilen açıda döndürür."},
"turtleVisibilityTooltip":function(d){return "Sanatçıyı, görünür ya da görünmez yapar."},
"widthTooltip":function(d){return "Kalemin genişliğini değiştirir."},
"wrongColour":function(d){return "Resiminin rengi yanlış.  Bu bulmaca için %1 olması gerekir."}};