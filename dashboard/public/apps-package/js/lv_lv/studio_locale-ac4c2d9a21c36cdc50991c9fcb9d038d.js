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
"actor":function(d){return "aktieris"},
"addItems1":function(d){return "pievieno 1 šī tipa priekšmetu"},
"addItems2":function(d){return "pievieno 2. šī tipa priekšmetus"},
"addItems3":function(d){return "pievieno 3. šī tipa priekšmetus"},
"addItems5":function(d){return "pievieno 5. šī tipa priekšmetus"},
"addItems10":function(d){return "pievieno 10. šī tipa priekšmetus"},
"addItemsRandom":function(d){return "pievieno nejaušu daudzumu šī tipa priekšmetus"},
"addItemsTooltip":function(d){return "Pievieno priekšmetus ainai."},
"alienInvasion":function(d){return "Citplanētiešu uzbrukums!"},
"backgroundBlack":function(d){return "melns"},
"backgroundCave":function(d){return "ala"},
"backgroundCloudy":function(d){return "mākoņains"},
"backgroundHardcourt":function(d){return "cietsegums"},
"backgroundNight":function(d){return "nakts"},
"backgroundUnderwater":function(d){return "zemūdens"},
"backgroundCity":function(d){return "pilsēta"},
"backgroundDesert":function(d){return "tuksnesis"},
"backgroundRainbow":function(d){return "varavīksne"},
"backgroundSoccer":function(d){return "futbols"},
"backgroundSpace":function(d){return "telpa"},
"backgroundTennis":function(d){return "teniss"},
"backgroundWinter":function(d){return "ziema"},
"catActions":function(d){return "Darbības"},
"catControl":function(d){return "Cikli"},
"catEvents":function(d){return "Pasākumi"},
"catLogic":function(d){return "Loģika"},
"catMath":function(d){return "Matemātika"},
"catProcedures":function(d){return "Funkcijas"},
"catText":function(d){return "Teksts"},
"catVariables":function(d){return "Mainīgie"},
"changeScoreTooltip":function(d){return "Pievienot vai noņemt punktu rezultātam."},
"changeScoreTooltipK1":function(d){return "Pieskaitīt punktu rezultātam."},
"continue":function(d){return "Turpināt"},
"decrementPlayerScore":function(d){return "Noņemt punktu"},
"defaultSayText":function(d){return "Raksti šeit"},
"dropletBlock_changeScore_description":function(d){return "Pievienot vai noņemt punktu rezultātam."},
"dropletBlock_penColour_description":function(d){return "Sets the color of the line drawn behind the turtle as it moves"},
"dropletBlock_penColour_param0":function(d){return "color"},
"dropletBlock_setBackground_description":function(d){return "Iestata fona attēlu"},
"dropletBlock_setSpriteEmotion_description":function(d){return "nosaka aktiera noskaņojumu"},
"dropletBlock_setSpritePosition_description":function(d){return "Nekavējoties pārvieto aktieri uz norādīto atrašanās vietu."},
"dropletBlock_setSpriteSpeed_description":function(d){return "Iestata aktiera ātrumu"},
"dropletBlock_setSprite_description":function(d){return "Uzstādi aktiera attēlu"},
"dropletBlock_throw_description":function(d){return "Norādītais aktieris izmet šāviņu."},
"dropletBlock_vanish_description":function(d){return "Aktieris pazūd."},
"emotion":function(d){return "noskaņojums"},
"finalLevel":function(d){return "Apsveicu! Jūs esat atrisinājis pēdējo puzli."},
"for":function(d){return "priekš"},
"hello":function(d){return "labdien"},
"helloWorld":function(d){return "Sveika, pasaule!"},
"incrementPlayerScore":function(d){return "Gūt punktu"},
"itemBlueFireball":function(d){return "zila ugunsbumba"},
"itemPurpleFireball":function(d){return "violeta ugunsbumba"},
"itemRedFireball":function(d){return "sarkana ugunsbumba"},
"itemYellowHearts":function(d){return "dzeltenas sirdis"},
"itemPurpleHearts":function(d){return "violetas sirdis"},
"itemRedHearts":function(d){return "sarkanas sirdis"},
"itemRandom":function(d){return "nejaušs"},
"itemAnna":function(d){return "āķis"},
"itemElsa":function(d){return "spīdums"},
"itemHiro":function(d){return "mikrobots"},
"itemBaymax":function(d){return "raķete"},
"itemRapunzel":function(d){return "mērces panna"},
"itemCherry":function(d){return "ķirsis"},
"itemIce":function(d){return "ledus"},
"itemDuck":function(d){return "pīle"},
"makeProjectileDisappear":function(d){return "pazust"},
"makeProjectileBounce":function(d){return "atlekt"},
"makeProjectileBlueFireball":function(d){return "izveido zilu ugunsbumbu"},
"makeProjectilePurpleFireball":function(d){return "izveidot violetu ugunsbumbu"},
"makeProjectileRedFireball":function(d){return "izveidot sarkanu ugunsbumbu"},
"makeProjectileYellowHearts":function(d){return "izveidot dzeltenas sirdis"},
"makeProjectilePurpleHearts":function(d){return "izveidot violetas sirdis"},
"makeProjectileRedHearts":function(d){return "izveidot sarkanas sirdis"},
"makeProjectileTooltip":function(d){return "Izveido šāviņu, kas saduroties izzūd vai atlec."},
"makeYourOwn":function(d){return "Izveido pats savu Spēļu laboratorijas aplikāciju"},
"moveDirectionDown":function(d){return "uz leju"},
"moveDirectionLeft":function(d){return "pa kreisi"},
"moveDirectionRight":function(d){return "pa labi"},
"moveDirectionUp":function(d){return "uz augšu"},
"moveDirectionRandom":function(d){return "nejaušs"},
"moveDistance25":function(d){return "25 pikseļi"},
"moveDistance50":function(d){return "50 pikseļi"},
"moveDistance100":function(d){return "100 pikseļi"},
"moveDistance200":function(d){return "200 pikseļi"},
"moveDistance400":function(d){return "400 pikseļi"},
"moveDistancePixels":function(d){return "punktiem"},
"moveDistanceRandom":function(d){return "nejauši izvēlēti pikseļi"},
"moveDistanceTooltip":function(d){return "Pārvietot aktieri noteiktā attālumā, norādītajā virzienā."},
"moveSprite":function(d){return "pārvietot"},
"moveSpriteN":function(d){return "pārvietot aktieri "+studio_locale.v(d,"spriteIndex")},
"toXY":function(d){return "uz x,y"},
"moveDown":function(d){return "pārvietot uz leju"},
"moveDownTooltip":function(d){return "Pārvietot aktieri uz leju."},
"moveLeft":function(d){return "pārvietot pa kreisi"},
"moveLeftTooltip":function(d){return "Pārvieto aktieri pa kreisi."},
"moveRight":function(d){return "Pārvietot pa labi"},
"moveRightTooltip":function(d){return "Pārvieto aktieri pa labi."},
"moveUp":function(d){return "Pārvietot augšup"},
"moveUpTooltip":function(d){return "Pārvieto aktieri uz augšu."},
"moveTooltip":function(d){return "Pārvietot aktieri."},
"nextLevel":function(d){return "Apsveicu! Jūs pabeidzāt šo puzli."},
"no":function(d){return "Nē"},
"numBlocksNeeded":function(d){return "Šo puzli var atrisināt ar %1 blokiem."},
"onEventTooltip":function(d){return "Execute code in response to the specified event."},
"ouchExclamation":function(d){return "Au!"},
"playSoundCrunch":function(d){return "atskaņot krakšķa skaņu"},
"playSoundGoal1":function(d){return "atskaņot pirmo rezultāta skaņu"},
"playSoundGoal2":function(d){return "atskaņot otro rezultāta skaņu"},
"playSoundHit":function(d){return "atskaņot sitiena skaņu"},
"playSoundLosePoint":function(d){return "atskaņot punkta zaudēšanas skaņu"},
"playSoundLosePoint2":function(d){return "atskaņot punkta zaudēšanas otro skaņu"},
"playSoundRetro":function(d){return "atskaņot retro skaņu"},
"playSoundRubber":function(d){return "atskaņot gumijas skaņu"},
"playSoundSlap":function(d){return "atskaņot pliķa skaņu"},
"playSoundTooltip":function(d){return "Atskaņot izvēlēto skaņu."},
"playSoundWinPoint":function(d){return "atskaņot punkta iegūšanas skaņu"},
"playSoundWinPoint2":function(d){return "atskaņot punkta iegūšanas otro skaņu"},
"playSoundWood":function(d){return "atskaņot koka skaņu"},
"positionOutTopLeft":function(d){return "augšējā kreisā pozīcija"},
"positionOutTopRight":function(d){return "augšējā labā pozīcija"},
"positionTopOutLeft":function(d){return "ārpus augšējās kreisās pozīcijas"},
"positionTopLeft":function(d){return "uz kreiso augšējo pozīciju"},
"positionTopCenter":function(d){return "uz pozīciju centra augšā"},
"positionTopRight":function(d){return "uz labo augšējo pozīciju"},
"positionTopOutRight":function(d){return "augšējā labā pozīcija ārpusē"},
"positionMiddleLeft":function(d){return "uz vidējo kreiso pozīciju"},
"positionMiddleCenter":function(d){return "uz vidējo centra pozīciju"},
"positionMiddleRight":function(d){return "uz vidējo labo pozīciju"},
"positionBottomOutLeft":function(d){return "apakšējā kreisā ārējā pozīcija"},
"positionBottomLeft":function(d){return "apakšējā kreisajā pusē"},
"positionBottomCenter":function(d){return "centra apakšpusē"},
"positionBottomRight":function(d){return "apakšejā labajā pusē"},
"positionBottomOutRight":function(d){return "uz apakšējo ārējo labo pozīciju"},
"positionOutBottomLeft":function(d){return "zem apakšējās kreisās pozīcijas"},
"positionOutBottomRight":function(d){return "zem apakšējās labās pozīcijas"},
"positionRandom":function(d){return "uz nejaušu pozīciju"},
"projectileBlueFireball":function(d){return "zila ugunsbumba"},
"projectilePurpleFireball":function(d){return "violeta ugunsbumba"},
"projectileRedFireball":function(d){return "sarkana ugunsbumba"},
"projectileYellowHearts":function(d){return "dzeltenas sirdis"},
"projectilePurpleHearts":function(d){return "violetas sirdis"},
"projectileRedHearts":function(d){return "sarkanas sirdis"},
"projectileRandom":function(d){return "nejaušs"},
"projectileAnna":function(d){return "āķis"},
"projectileElsa":function(d){return "spīdums"},
"projectileHiro":function(d){return "mikrobots"},
"projectileBaymax":function(d){return "raķete"},
"projectileRapunzel":function(d){return "mērces panna"},
"projectileCherry":function(d){return "ķirsis"},
"projectileIce":function(d){return "ledus"},
"projectileDuck":function(d){return "pīle"},
"reinfFeedbackMsg":function(d){return "Tu vari nospiest pogu \"Turpināt spēlēt\", lai atgrieztos un turpinātu spēlēt savu stāstu."},
"repeatForever":function(d){return "mūžīgi atkārtot"},
"repeatDo":function(d){return "darīt"},
"repeatForeverTooltip":function(d){return "Izpildīt darbības šī bloka vairākkārt, kamēr notiek stāsts."},
"saySprite":function(d){return "saki"},
"saySpriteN":function(d){return "aktieris "+studio_locale.v(d,"spriteIndex")+" saka"},
"saySpriteTooltip":function(d){return "Izveido runas burbuli ar saistīto tekstu, no norādītā aktiera."},
"saySpriteChoices_0":function(d){return "Sveicināts."},
"saySpriteChoices_1":function(d){return "Sveiki, visi."},
"saySpriteChoices_2":function(d){return "Kā tev iet?"},
"saySpriteChoices_3":function(d){return "Labrīt"},
"saySpriteChoices_4":function(d){return "Labdien"},
"saySpriteChoices_5":function(d){return "Ar labu nakti"},
"saySpriteChoices_6":function(d){return "Labvakar"},
"saySpriteChoices_7":function(d){return "Kas jauns?"},
"saySpriteChoices_8":function(d){return "Ko?"},
"saySpriteChoices_9":function(d){return "Kur?"},
"saySpriteChoices_10":function(d){return "Kad?"},
"saySpriteChoices_11":function(d){return "Labi."},
"saySpriteChoices_12":function(d){return "Lieliski!"},
"saySpriteChoices_13":function(d){return "Normāli."},
"saySpriteChoices_14":function(d){return "Nav slikti."},
"saySpriteChoices_15":function(d){return "Veiksmi."},
"saySpriteChoices_16":function(d){return "Jā"},
"saySpriteChoices_17":function(d){return "Nē"},
"saySpriteChoices_18":function(d){return "Labi"},
"saySpriteChoices_19":function(d){return "Labs metiens!"},
"saySpriteChoices_20":function(d){return "Novēlu jauku dienu."},
"saySpriteChoices_21":function(d){return "Atā."},
"saySpriteChoices_22":function(d){return "Tūlīt būšu atpakaļ."},
"saySpriteChoices_23":function(d){return "Redzēsimies rīt!"},
"saySpriteChoices_24":function(d){return "Līdz vēlākam!"},
"saySpriteChoices_25":function(d){return "Saudzē sevi!"},
"saySpriteChoices_26":function(d){return "Izbaudi!"},
"saySpriteChoices_27":function(d){return "Man ir jādodas."},
"saySpriteChoices_28":function(d){return "Vēlies draudzēties?"},
"saySpriteChoices_29":function(d){return "Lielisks darbs!"},
"saySpriteChoices_30":function(d){return "Juhū!"},
"saySpriteChoices_31":function(d){return "Jēj!"},
"saySpriteChoices_32":function(d){return "Prieks iepazīties."},
"saySpriteChoices_33":function(d){return "Normāli!"},
"saySpriteChoices_34":function(d){return "Paldies"},
"saySpriteChoices_35":function(d){return "Nē, paldies"},
"saySpriteChoices_36":function(d){return "Āāāāāāāā!"},
"saySpriteChoices_37":function(d){return "Nekas"},
"saySpriteChoices_38":function(d){return "Šodien"},
"saySpriteChoices_39":function(d){return "Rītdien"},
"saySpriteChoices_40":function(d){return "Vakar"},
"saySpriteChoices_41":function(d){return "Es tevi atradu!"},
"saySpriteChoices_42":function(d){return "Tu mani atradi!"},
"saySpriteChoices_43":function(d){return "10, 9, 8, 7, 6, 5, 4, 3, 2, 1!"},
"saySpriteChoices_44":function(d){return "Tu esi lielisks!"},
"saySpriteChoices_45":function(d){return "Tu esi smieklīgs!"},
"saySpriteChoices_46":function(d){return "Tu esi muļķīgs! "},
"saySpriteChoices_47":function(d){return "Tu esi labs draugs!"},
"saySpriteChoices_48":function(d){return "Uzmanies!"},
"saySpriteChoices_49":function(d){return "Pīle!"},
"saySpriteChoices_50":function(d){return "Noķēru!"},
"saySpriteChoices_51":function(d){return "Ou!"},
"saySpriteChoices_52":function(d){return "Piedod!"},
"saySpriteChoices_53":function(d){return "Uzmanīgi!"},
"saySpriteChoices_54":function(d){return "Ooo!"},
"saySpriteChoices_55":function(d){return "Ups!"},
"saySpriteChoices_56":function(d){return "Tu gandrīz mani noķēri!"},
"saySpriteChoices_57":function(d){return "Labs mēģinājums!"},
"saySpriteChoices_58":function(d){return "Tu mani nevari noķert!"},
"scoreText":function(d){return "Rezultāts: "+studio_locale.v(d,"playerScore")},
"setBackground":function(d){return "iestati fonu"},
"setBackgroundRandom":function(d){return "iestati nejauši izvēlētu fonu"},
"setBackgroundBlack":function(d){return "iestati melnu fonu"},
"setBackgroundCave":function(d){return "iestati alas fonu"},
"setBackgroundCloudy":function(d){return "iestati mākoņainu fonu"},
"setBackgroundHardcourt":function(d){return "iestati cietseguma fonu"},
"setBackgroundNight":function(d){return "iestati nakts fonu"},
"setBackgroundUnderwater":function(d){return "iestati zemūdens fonu"},
"setBackgroundCity":function(d){return "iestati pilsētas fonu"},
"setBackgroundDesert":function(d){return "iestati tuksneša fonu"},
"setBackgroundRainbow":function(d){return "iestati varavīksnes fonu"},
"setBackgroundSoccer":function(d){return "iestati futbola fonu"},
"setBackgroundSpace":function(d){return "iestati kosmosa fonu"},
"setBackgroundTennis":function(d){return "iestati tenisa fonu"},
"setBackgroundWinter":function(d){return "iestati ziemas fonu"},
"setBackgroundLeafy":function(d){return "uzstādīt lapotu fonu"},
"setBackgroundGrassy":function(d){return "uzstādīt zālainu fonu"},
"setBackgroundFlower":function(d){return "uzstādīt puķainu fonu"},
"setBackgroundTile":function(d){return "uzstādīt mozaiku kā fonu"},
"setBackgroundIcy":function(d){return "uzstādīt ledaino fonu"},
"setBackgroundSnowy":function(d){return "uzstādīt sniegoto fonu"},
"setBackgroundTooltip":function(d){return "Iestata fona attēlu"},
"setEnemySpeed":function(d){return "iestati ienaidnieka ātrumu"},
"setPlayerSpeed":function(d){return "iestati spēlētāja ātrumu"},
"setScoreText":function(d){return "rezultāts"},
"setScoreTextTooltip":function(d){return "Nosaka tekstu, kas jārāda rezultātu zonā."},
"setSpriteEmotionAngry":function(d){return "būt dusmīgam"},
"setSpriteEmotionHappy":function(d){return "būt priecīgam"},
"setSpriteEmotionNormal":function(d){return "būt normālā noskaņojumā"},
"setSpriteEmotionRandom":function(d){return "būt nejaušā noskaņojumā"},
"setSpriteEmotionSad":function(d){return "būt bēdīgam"},
"setSpriteEmotionTooltip":function(d){return "nosaka aktiera noskaņojumu"},
"setSpriteAlien":function(d){return "citplanētiešu attēls"},
"setSpriteBat":function(d){return "sikspārņa attēls"},
"setSpriteBird":function(d){return "putna attēls"},
"setSpriteCat":function(d){return "kaķa attēls"},
"setSpriteCaveBoy":function(d){return "alu puikas attēls"},
"setSpriteCaveGirl":function(d){return "alu meitenes attēls"},
"setSpriteDinosaur":function(d){return "dinozaura attēls"},
"setSpriteDog":function(d){return "suņa attēls"},
"setSpriteDragon":function(d){return "pūķa attēls"},
"setSpriteGhost":function(d){return "spoka attēls"},
"setSpriteHidden":function(d){return "paslēpts attēls"},
"setSpriteHideK1":function(d){return "paslēpt"},
"setSpriteAnna":function(d){return "uz Annas attēla"},
"setSpriteElsa":function(d){return "uz Elzas attēla"},
"setSpriteHiro":function(d){return "uz Hiro attēla"},
"setSpriteBaymax":function(d){return "uz Baymax attēla"},
"setSpriteRapunzel":function(d){return "uz Zeltmatītes attēla"},
"setSpriteKnight":function(d){return "uz bruņinieka attēlu"},
"setSpriteMonster":function(d){return "uz briesmoņa attēlu"},
"setSpriteNinja":function(d){return "uz nomaskēta nindzjas attēlu"},
"setSpriteOctopus":function(d){return "uz astoņkāja attēlu"},
"setSpritePenguin":function(d){return "uz pingvīna attēlu"},
"setSpritePirate":function(d){return "uz pirāta attēlu"},
"setSpritePrincess":function(d){return "uz princeses attēlu"},
"setSpriteRandom":function(d){return "uz nejaušu attēlu"},
"setSpriteRobot":function(d){return "uz robota attēlu"},
"setSpriteShowK1":function(d){return "rādīt"},
"setSpriteSpacebot":function(d){return "uz kosmosa kuģa attēlu"},
"setSpriteSoccerGirl":function(d){return "uz futbola meitenes attēlu"},
"setSpriteSoccerBoy":function(d){return "uz futbola zēna attēlu"},
"setSpriteSquirrel":function(d){return "uz vāveres attēlu"},
"setSpriteTennisGirl":function(d){return "uz tenisa meitenes attēlu"},
"setSpriteTennisBoy":function(d){return "uz tenisa zēna attēlu"},
"setSpriteUnicorn":function(d){return "uz vienradža attēlu"},
"setSpriteWitch":function(d){return "uz raganas attēlu"},
"setSpriteWizard":function(d){return "uz burvja attēlu"},
"setSpritePositionTooltip":function(d){return "Nekavējoties pārvieto aktieri uz norādīto atrašanās vietu."},
"setSpriteK1Tooltip":function(d){return "Parāda vai paslēpj norādīto aktieri."},
"setSpriteTooltip":function(d){return "Uzstādi aktiera attēlu"},
"setSpriteSizeRandom":function(d){return "uz nejaušu izmēru"},
"setSpriteSizeVerySmall":function(d){return "uz ļoti mazu izmēru"},
"setSpriteSizeSmall":function(d){return "uz mazu izmēru"},
"setSpriteSizeNormal":function(d){return "uz parastu izmēru"},
"setSpriteSizeLarge":function(d){return "uz lielu izmēru"},
"setSpriteSizeVeryLarge":function(d){return "uz ļoti lielu izmēru"},
"setSpriteSizeTooltip":function(d){return "nosaka aktiera izmēru"},
"setSpriteSpeedRandom":function(d){return "uz nejaušu ātrumu"},
"setSpriteSpeedVerySlow":function(d){return "uz ļoti lēnu ātrumu"},
"setSpriteSpeedSlow":function(d){return "uz lēnu ātrumu"},
"setSpriteSpeedNormal":function(d){return "uz normālu ātrumu"},
"setSpriteSpeedFast":function(d){return "uz lielu ātrumu"},
"setSpriteSpeedVeryFast":function(d){return "uz ļoti lielu ātrumu"},
"setSpriteSpeedTooltip":function(d){return "Iestata aktiera ātrumu"},
"setSpriteZombie":function(d){return "uz zombija attēlu"},
"shareStudioTwitter":function(d){return "Apskaties kādu stāstu es izveidoju. Es uzrakstīju to pats izmantojot @codeorg"},
"shareGame":function(d){return "Dalies ar savu stāstu:"},
"showCoordinates":function(d){return "parādīt koordinātas"},
"showCoordinatesTooltip":function(d){return "parādīt galvenā varoņa koordinātas uz ekrāna"},
"showTitleScreen":function(d){return "parādi virsraksta ekrānu"},
"showTitleScreenTitle":function(d){return "nosaukums"},
"showTitleScreenText":function(d){return "teksts"},
"showTSDefTitle":function(d){return "ieraksti tekstu šeit"},
"showTSDefText":function(d){return "ieraksti tekstu šeit"},
"showTitleScreenTooltip":function(d){return "Parādi virsraksta ekrānu ar saistīto virsrakstu un tekstu."},
"size":function(d){return "izmērs"},
"setSprite":function(d){return "iestatīt"},
"setSpriteN":function(d){return "uzstādi aktieri "+studio_locale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "kraukš"},
"soundGoal1":function(d){return "mērķis 1"},
"soundGoal2":function(d){return "mērķis 2"},
"soundHit":function(d){return "trāpīt"},
"soundLosePoint":function(d){return "zaudē punktu"},
"soundLosePoint2":function(d){return "zaudē 2 punktus"},
"soundRetro":function(d){return "vecmodīgs"},
"soundRubber":function(d){return "gumija"},
"soundSlap":function(d){return "pliķis"},
"soundWinPoint":function(d){return "iegūstu punktu"},
"soundWinPoint2":function(d){return "iegūsti 2 punktus"},
"soundWood":function(d){return "koks"},
"speed":function(d){return "ātrums"},
"startSetValue":function(d){return "starts (funkcija)"},
"startSetVars":function(d){return "game_vars (virsraksts, apakšvirsraksts, fons, mērķis, briesmas, spēlētājs)"},
"startSetFuncs":function(d){return "game_funcs (atjaunināt mērķi, atjaunināt briesmas, atjaunināt spēlētāju, sadurties?, uz ekrāna?)"},
"stopSprite":function(d){return "apstājies"},
"stopSpriteN":function(d){return "apstādini aktieri "+studio_locale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Apstādina aktiera kustību."},
"throwSprite":function(d){return "met"},
"throwSpriteN":function(d){return "aktieris "+studio_locale.v(d,"spriteIndex")+" met"},
"throwTooltip":function(d){return "Norādītais aktieris izmet šāviņu."},
"vanish":function(d){return "pazūd"},
"vanishActorN":function(d){return "aktieris pazūd "+studio_locale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "Aktieris pazūd."},
"waitFor":function(d){return "gaidi"},
"waitSeconds":function(d){return "sekundes"},
"waitForClick":function(d){return "gaidi klikšķi"},
"waitForRandom":function(d){return "gaidi nejaušu"},
"waitForHalfSecond":function(d){return "nogaidi pussekundi"},
"waitFor1Second":function(d){return "nogaidi 1 sekundi"},
"waitFor2Seconds":function(d){return "uzgaidi 2 sekundes"},
"waitFor5Seconds":function(d){return "uzgaidi 5 sekundes"},
"waitFor10Seconds":function(d){return "nogaidi 10 sekundes"},
"waitParamsTooltip":function(d){return "Nogaida noteiktu sekunžu skaitu vai izmanto nulli, lai nogaidītu līdz klikšķim."},
"waitTooltip":function(d){return "Nogaida noteiktu laika sprīdi vai līdz klikšķim."},
"whenArrowDown":function(d){return "bultiņa uz leju"},
"whenArrowLeft":function(d){return "bultiņa pa kreisi"},
"whenArrowRight":function(d){return "bultiņa pa labi"},
"whenArrowUp":function(d){return "bultiņa uz augšu"},
"whenArrowTooltip":function(d){return "Izpildi zemāk minētās darbības, kad tiek piespiesta attiecīgā bultiņa."},
"whenDown":function(d){return "kad bultiņa uz leju"},
"whenDownTooltip":function(d){return "Veikt zemāk esošās darbības, kad nospiež bultiņu uz leju."},
"whenGameStarts":function(d){return "kad sākas stāsts"},
"whenGameStartsTooltip":function(d){return "Izpildi zemāk minētās darbības, kad sākas stāsts."},
"whenLeft":function(d){return "kad kreisā bultiņa"},
"whenLeftTooltip":function(d){return "Veikt zemāk esošās darbības, kad nospiež kreiso bultiņu."},
"whenRight":function(d){return "kad labā bultiņa"},
"whenRightTooltip":function(d){return "Veikt zemāk esošās darbības, kad nospiež labo bultiņu."},
"whenSpriteClicked":function(d){return "kad aktieris noklikšķināja"},
"whenSpriteClickedN":function(d){return "kad aktieris "+studio_locale.v(d,"spriteIndex")+" noklikšķināja"},
"whenSpriteClickedTooltip":function(d){return "Izpildi zemāk minētās darbības, kad aktieris ir noklikšķinājis."},
"whenSpriteCollidedN":function(d){return "kad aktieris "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "Izpildi zemāk minētas darbības, kad aktieris pieskaras citam aktierim."},
"whenSpriteCollidedWith":function(d){return "pieskaras"},
"whenSpriteCollidedWithAnyActor":function(d){return "pieskaras jebkuram aktierim"},
"whenSpriteCollidedWithAnyEdge":function(d){return "pieskaras jebkurai malai"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "pieskaras jebkuram šāviņam"},
"whenSpriteCollidedWithAnything":function(d){return "pieskaras jebkam"},
"whenSpriteCollidedWithN":function(d){return "pieskaras aktierim "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "pieskaras zilajai ugunsbumbai"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "pieskaras violetajai ugunsbumbai"},
"whenSpriteCollidedWithRedFireball":function(d){return "pieskaras sarkanajai ugunsbumbai"},
"whenSpriteCollidedWithYellowHearts":function(d){return "pieskaras dzeltenajām sirdīm"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "pieskaras violetajām sirdīm"},
"whenSpriteCollidedWithRedHearts":function(d){return "pieskaras sarkanajām sirdīm"},
"whenSpriteCollidedWithBottomEdge":function(d){return "pieskaras apakšējai malai"},
"whenSpriteCollidedWithLeftEdge":function(d){return "pieskaras kreisajai malai"},
"whenSpriteCollidedWithRightEdge":function(d){return "pieskaras labajai malai"},
"whenSpriteCollidedWithTopEdge":function(d){return "pieskaras augšējai malai"},
"whenUp":function(d){return "kad bultiņa uz augšu"},
"whenUpTooltip":function(d){return "Veikt zemāk esošās darbības, kad nospiež bultiņu uz augšu."},
"yes":function(d){return "Jā"}};