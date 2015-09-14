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
"actor":function(d){return "actorul"},
"addItems1":function(d){return "adaugă 1 element de tipul"},
"addItems2":function(d){return "adaugă 2 elemente de tip"},
"addItems3":function(d){return "adaugă 3 elemente de tip"},
"addItems5":function(d){return "adaugă 5 elemente de tip"},
"addItems10":function(d){return "adaugă 10 elemente de tip"},
"addItemsRandom":function(d){return "adaugă elemente aleatorii de tip"},
"addItemsTooltip":function(d){return "Adaugă elemente scenei."},
"alienInvasion":function(d){return "Invazia extratereștrilor!"},
"backgroundBlack":function(d){return "negru"},
"backgroundCave":function(d){return "peșteră"},
"backgroundCloudy":function(d){return "înnorat"},
"backgroundHardcourt":function(d){return "hardcourt"},
"backgroundNight":function(d){return "noapte"},
"backgroundUnderwater":function(d){return "subacvatic"},
"backgroundCity":function(d){return "oraș"},
"backgroundDesert":function(d){return "deșert"},
"backgroundRainbow":function(d){return "curcubeu"},
"backgroundSoccer":function(d){return "fotbal"},
"backgroundSpace":function(d){return "spaţiu"},
"backgroundTennis":function(d){return "tenis"},
"backgroundWinter":function(d){return "iarna"},
"catActions":function(d){return "Acţiuni"},
"catControl":function(d){return "Bucle"},
"catEvents":function(d){return "Evenimente"},
"catLogic":function(d){return "Logică"},
"catMath":function(d){return "Matematică"},
"catProcedures":function(d){return "Funcţii"},
"catText":function(d){return "Text"},
"catVariables":function(d){return "Variabile"},
"changeScoreTooltip":function(d){return "Adăugă sau elimină un punct la scor."},
"changeScoreTooltipK1":function(d){return "Adăugă un punct la scor."},
"continue":function(d){return "Continuă"},
"decrementPlayerScore":function(d){return "elimina punct"},
"defaultSayText":function(d){return "tastează aici"},
"dropletBlock_changeScore_description":function(d){return "Adăugă sau elimină un punct la scor."},
"dropletBlock_penColour_description":function(d){return "Sets the color of the line drawn behind the turtle as it moves"},
"dropletBlock_penColour_param0":function(d){return "color"},
"dropletBlock_setBackground_description":function(d){return "Setează imaginea de fundal"},
"dropletBlock_setSpriteEmotion_description":function(d){return "Setează starea de spirit a actorului"},
"dropletBlock_setSpritePosition_description":function(d){return "Instantaneu mută un actor la locația specificată."},
"dropletBlock_setSpriteSpeed_description":function(d){return "Setează viteza unui actor"},
"dropletBlock_setSprite_description":function(d){return "Setează imaginea actorului"},
"dropletBlock_throw_description":function(d){return "Aruncă un proiectil de la actorul specificat."},
"dropletBlock_vanish_description":function(d){return "Face să dispară actorul."},
"emotion":function(d){return "stare de spirit"},
"finalLevel":function(d){return "Felicitări! Ai rezolvat puzzle-ul final."},
"for":function(d){return "pentru"},
"hello":function(d){return "bună"},
"helloWorld":function(d){return "Salutare lume!"},
"incrementPlayerScore":function(d){return "punct de scor"},
"itemBlueFireball":function(d){return "minge de foc albastră"},
"itemPurpleFireball":function(d){return "minge de foc mov"},
"itemRedFireball":function(d){return "minge de foc roşie"},
"itemYellowHearts":function(d){return "inimi galbene"},
"itemPurpleHearts":function(d){return "inimi mov"},
"itemRedHearts":function(d){return "inimi roşii"},
"itemRandom":function(d){return "aleator"},
"itemAnna":function(d){return "cârlig"},
"itemElsa":function(d){return "scânteie"},
"itemHiro":function(d){return "micro-roboți"},
"itemBaymax":function(d){return "rachetă"},
"itemRapunzel":function(d){return "cratiță"},
"itemCherry":function(d){return "cireașă"},
"itemIce":function(d){return "gheață"},
"itemDuck":function(d){return "rață"},
"makeProjectileDisappear":function(d){return "dispar"},
"makeProjectileBounce":function(d){return "saritura"},
"makeProjectileBlueFireball":function(d){return "fă o minge de foc albastră"},
"makeProjectilePurpleFireball":function(d){return "fă o minge de foc mov"},
"makeProjectileRedFireball":function(d){return "fă o minge de foc roşie"},
"makeProjectileYellowHearts":function(d){return "fă inimi galbene"},
"makeProjectilePurpleHearts":function(d){return "fă inimi mov"},
"makeProjectileRedHearts":function(d){return "fă inimi roşii"},
"makeProjectileTooltip":function(d){return "Fă proiectilul care tocmai s-a ciocnit să dispară sau să sară."},
"makeYourOwn":function(d){return "Construiește propria ta aplicație Play Lab"},
"moveDirectionDown":function(d){return "jos"},
"moveDirectionLeft":function(d){return "stânga"},
"moveDirectionRight":function(d){return "dreapta"},
"moveDirectionUp":function(d){return "sus"},
"moveDirectionRandom":function(d){return "aleator"},
"moveDistance25":function(d){return "25 de pixeli"},
"moveDistance50":function(d){return "50 de pixeli"},
"moveDistance100":function(d){return "100 de pixeli"},
"moveDistance200":function(d){return "200 de pixeli"},
"moveDistance400":function(d){return "400 de pixeli"},
"moveDistancePixels":function(d){return "pixeli"},
"moveDistanceRandom":function(d){return "număr aleatoriu de pixeli"},
"moveDistanceTooltip":function(d){return "Mută un actor pe o distanță anume în direcția specificată."},
"moveSprite":function(d){return "mută"},
"moveSpriteN":function(d){return "mută actor "+studio_locale.v(d,"spriteIndex")},
"toXY":function(d){return "la x,y"},
"moveDown":function(d){return "mută în jos"},
"moveDownTooltip":function(d){return "Mută un actor în jos."},
"moveLeft":function(d){return "mută la stânga"},
"moveLeftTooltip":function(d){return "Mută un actor la stânga."},
"moveRight":function(d){return "mută la dreapta"},
"moveRightTooltip":function(d){return "Mută un actor la dreapta."},
"moveUp":function(d){return "mută în sus"},
"moveUpTooltip":function(d){return "Mută un actor în sus."},
"moveTooltip":function(d){return "Mută un actor."},
"nextLevel":function(d){return "Felicitări! Ai finalizat acest puzzle."},
"no":function(d){return "Nu"},
"numBlocksNeeded":function(d){return "Acest puzzle poate fi rezolvat cu %1 blocuri."},
"onEventTooltip":function(d){return "Execută cod ca răspuns la evenimentul specificat."},
"ouchExclamation":function(d){return "Aoleu!"},
"playSoundCrunch":function(d){return "redă sunet de zdrobire"},
"playSoundGoal1":function(d){return "Redă sunet obiectiv 1"},
"playSoundGoal2":function(d){return "Redă sunet obiectiv 2"},
"playSoundHit":function(d){return "redă sunet de lovitură"},
"playSoundLosePoint":function(d){return "redă sunet de punct slab"},
"playSoundLosePoint2":function(d){return "redă sunet de punct slab 2"},
"playSoundRetro":function(d){return "redă sunet retro"},
"playSoundRubber":function(d){return "redă sunet de cauciuc"},
"playSoundSlap":function(d){return "redă sunet de plezneală"},
"playSoundTooltip":function(d){return "Redă sunetul ales."},
"playSoundWinPoint":function(d){return "redă sunet de punct victorios"},
"playSoundWinPoint2":function(d){return "redă sunet de punct victorios 2"},
"playSoundWood":function(d){return "redă sunet de lemn"},
"positionOutTopLeft":function(d){return "în poziţia de sus din stânga"},
"positionOutTopRight":function(d){return "în poziţia de sus din dreapta"},
"positionTopOutLeft":function(d){return "în partea de sus înafară din stânga"},
"positionTopLeft":function(d){return "în partea de stânga sus"},
"positionTopCenter":function(d){return "în centru sus"},
"positionTopRight":function(d){return "în dreapta sus"},
"positionTopOutRight":function(d){return "în poziţia din dreapta sus din afară"},
"positionMiddleLeft":function(d){return "mijloc stânga"},
"positionMiddleCenter":function(d){return "mijloc centru"},
"positionMiddleRight":function(d){return "mijloc dreapta"},
"positionBottomOutLeft":function(d){return "în poziţia din stânga jos din afară"},
"positionBottomLeft":function(d){return "stânga jos"},
"positionBottomCenter":function(d){return "mijloc jos"},
"positionBottomRight":function(d){return "dreapta jos"},
"positionBottomOutRight":function(d){return "dreapta jos în afară"},
"positionOutBottomLeft":function(d){return "în poziţia din stânga jos dedesubt"},
"positionOutBottomRight":function(d){return "în poziţia din dreapta jos dedesubt"},
"positionRandom":function(d){return "oriunde"},
"projectileBlueFireball":function(d){return "minge de foc albastră"},
"projectilePurpleFireball":function(d){return "minge de foc mov"},
"projectileRedFireball":function(d){return "minge de foc roşie"},
"projectileYellowHearts":function(d){return "inimi galbene"},
"projectilePurpleHearts":function(d){return "inimi mov"},
"projectileRedHearts":function(d){return "inimi roşii"},
"projectileRandom":function(d){return "aleator"},
"projectileAnna":function(d){return "cârlig"},
"projectileElsa":function(d){return "scânteie"},
"projectileHiro":function(d){return "micro-roboți"},
"projectileBaymax":function(d){return "rachetă"},
"projectileRapunzel":function(d){return "cratiță"},
"projectileCherry":function(d){return "cireașă"},
"projectileIce":function(d){return "gheață"},
"projectileDuck":function(d){return "rață"},
"reinfFeedbackMsg":function(d){return "Ai posibilitatea să apeși butonul \"Continuă jocul\" pentru a reveni la povestea ta."},
"repeatForever":function(d){return "repetă pentru totdeauna"},
"repeatDo":function(d){return "fă"},
"repeatForeverTooltip":function(d){return "Execută acțiunile din acest bloc în mod repetat în timp ce povestea se desfăşoară."},
"saySprite":function(d){return "spune"},
"saySpriteN":function(d){return "actorul "+studio_locale.v(d,"spriteIndex")+" spune"},
"saySpriteTooltip":function(d){return "Fă să apară un balon cu textul asociat actorului specificat."},
"saySpriteChoices_0":function(d){return "Salutare!"},
"saySpriteChoices_1":function(d){return "Salutare la toată lumea!"},
"saySpriteChoices_2":function(d){return "Ce mai faci?"},
"saySpriteChoices_3":function(d){return "Bună dimineața"},
"saySpriteChoices_4":function(d){return "Bună ziua"},
"saySpriteChoices_5":function(d){return "Noapte bună"},
"saySpriteChoices_6":function(d){return "Bună seara"},
"saySpriteChoices_7":function(d){return "Ce mai este nou?"},
"saySpriteChoices_8":function(d){return "Ce?"},
"saySpriteChoices_9":function(d){return "Unde?"},
"saySpriteChoices_10":function(d){return "Când?"},
"saySpriteChoices_11":function(d){return "Bine."},
"saySpriteChoices_12":function(d){return "Minunat!"},
"saySpriteChoices_13":function(d){return "În regulă."},
"saySpriteChoices_14":function(d){return "Nu e rău."},
"saySpriteChoices_15":function(d){return "Noroc."},
"saySpriteChoices_16":function(d){return "Da"},
"saySpriteChoices_17":function(d){return "Nu"},
"saySpriteChoices_18":function(d){return "Bine"},
"saySpriteChoices_19":function(d){return "Frumoasă aruncare!"},
"saySpriteChoices_20":function(d){return "O zi bună."},
"saySpriteChoices_21":function(d){return "Pa."},
"saySpriteChoices_22":function(d){return "Revin imediat."},
"saySpriteChoices_23":function(d){return "Pe mâine!"},
"saySpriteChoices_24":function(d){return "Pe mai târziu!"},
"saySpriteChoices_25":function(d){return "Ai grijă!"},
"saySpriteChoices_26":function(d){return "Să-ți priască!"},
"saySpriteChoices_27":function(d){return "Trebuie să plec."},
"saySpriteChoices_28":function(d){return "Vrei să fim prieteni?"},
"saySpriteChoices_29":function(d){return "Foarte bună treabă!"},
"saySpriteChoices_30":function(d){return "Woo hoo!"},
"saySpriteChoices_31":function(d){return "Yay!"},
"saySpriteChoices_32":function(d){return "Îmi pare bine de cunoștință."},
"saySpriteChoices_33":function(d){return "În regulă!"},
"saySpriteChoices_34":function(d){return "Mulţumesc"},
"saySpriteChoices_35":function(d){return "Nu, mulţumesc"},
"saySpriteChoices_36":function(d){return "Aaaaaah!"},
"saySpriteChoices_37":function(d){return "Nu contează"},
"saySpriteChoices_38":function(d){return "Azi"},
"saySpriteChoices_39":function(d){return "Mâine"},
"saySpriteChoices_40":function(d){return "Ieri"},
"saySpriteChoices_41":function(d){return "Te-am găsit!"},
"saySpriteChoices_42":function(d){return "M-ai găsit!"},
"saySpriteChoices_43":function(d){return "10, 9, 8, 7, 6, 5, 4, 3, 2, 1!"},
"saySpriteChoices_44":function(d){return "Ești nemaipomenit!"},
"saySpriteChoices_45":function(d){return "Ești amuzant!"},
"saySpriteChoices_46":function(d){return "Ești prostuț!"},
"saySpriteChoices_47":function(d){return "Ești un prieten bun!"},
"saySpriteChoices_48":function(d){return "Fereşte-te!"},
"saySpriteChoices_49":function(d){return "Raţă!"},
"saySpriteChoices_50":function(d){return "Te-am prins!"},
"saySpriteChoices_51":function(d){return "Au!"},
"saySpriteChoices_52":function(d){return "Îmi pare rău!"},
"saySpriteChoices_53":function(d){return "Cu grijă!"},
"saySpriteChoices_54":function(d){return "Uau!"},
"saySpriteChoices_55":function(d){return "Ups!"},
"saySpriteChoices_56":function(d){return "Aproape m-ai prins!"},
"saySpriteChoices_57":function(d){return "Frumoasă încercare!"},
"saySpriteChoices_58":function(d){return "Nu poţi să mă prinzi!"},
"scoreText":function(d){return "Scor: "+studio_locale.v(d,"playerScore")},
"setBackground":function(d){return "setează fundalul"},
"setBackgroundRandom":function(d){return "setează fundal aleatoriu"},
"setBackgroundBlack":function(d){return "setează fundal negru"},
"setBackgroundCave":function(d){return "setează fundal peșteră"},
"setBackgroundCloudy":function(d){return "setează fundal înnorat"},
"setBackgroundHardcourt":function(d){return "setează fundal suprafață dură"},
"setBackgroundNight":function(d){return "setrează fundal noapte"},
"setBackgroundUnderwater":function(d){return "setează fundal subacvatic"},
"setBackgroundCity":function(d){return "setează oraşul ca fundal"},
"setBackgroundDesert":function(d){return "setează deşertul ca fundal"},
"setBackgroundRainbow":function(d){return "setează curcubeul ca fundal"},
"setBackgroundSoccer":function(d){return "setează terenul de fotbal ca fundal"},
"setBackgroundSpace":function(d){return "setează spaţiul ca fundal"},
"setBackgroundTennis":function(d){return "setează terenul de tenis ca fundal"},
"setBackgroundWinter":function(d){return "setează peisaj de iarnă ca fundal"},
"setBackgroundLeafy":function(d){return "setează fundal cu frunze"},
"setBackgroundGrassy":function(d){return "setează un fundal cu iarbă"},
"setBackgroundFlower":function(d){return "setează un fundal cu flori"},
"setBackgroundTile":function(d){return "setează fundal cu dale"},
"setBackgroundIcy":function(d){return "setează fundal de gheață"},
"setBackgroundSnowy":function(d){return "setează fundal cu zăpadă"},
"setBackgroundTooltip":function(d){return "Setează imaginea de fundal"},
"setEnemySpeed":function(d){return "setează viteza inamicului"},
"setPlayerSpeed":function(d){return "setează viteza jucătorului"},
"setScoreText":function(d){return "Setează scor"},
"setScoreTextTooltip":function(d){return "Setează textul pentru a fi afișat în zona de scor."},
"setSpriteEmotionAngry":function(d){return "la o stare de spirit furioasă"},
"setSpriteEmotionHappy":function(d){return "la o stare de spirit fericită"},
"setSpriteEmotionNormal":function(d){return "la o stare de spirit normală"},
"setSpriteEmotionRandom":function(d){return "la o stare de spirit aleatoare"},
"setSpriteEmotionSad":function(d){return "la o stare de spirit tristă"},
"setSpriteEmotionTooltip":function(d){return "Setează starea de spirit a actorului"},
"setSpriteAlien":function(d){return "la o imagine cu extraterestru"},
"setSpriteBat":function(d){return "la o imagine cu liliac"},
"setSpriteBird":function(d){return "la o imagine cu pasăre"},
"setSpriteCat":function(d){return "la o imagine cu pisică"},
"setSpriteCaveBoy":function(d){return "la o imagine cu un băiat din peşteră"},
"setSpriteCaveGirl":function(d){return "la o imagine cu fata(Jasmine) din peşteră"},
"setSpriteDinosaur":function(d){return "la o imagine de dinozaur"},
"setSpriteDog":function(d){return "la o imagine cu câine"},
"setSpriteDragon":function(d){return "la o imagine cu dragon"},
"setSpriteGhost":function(d){return "la o imagine cu fantomă"},
"setSpriteHidden":function(d){return "la o imagine ascunsă"},
"setSpriteHideK1":function(d){return "ascunde"},
"setSpriteAnna":function(d){return "la o imagine cu Anna"},
"setSpriteElsa":function(d){return "la o imagine cu Elsa"},
"setSpriteHiro":function(d){return "la o imagine cu Hiro"},
"setSpriteBaymax":function(d){return "la o imagine cu Baymax"},
"setSpriteRapunzel":function(d){return "la o imagine cu Rapunzel"},
"setSpriteKnight":function(d){return "la o imagine cu cavaler"},
"setSpriteMonster":function(d){return "la o imagine cu monstru"},
"setSpriteNinja":function(d){return "la o imagine cu un ninja mascat"},
"setSpriteOctopus":function(d){return "la o imagine cu caracatiţă"},
"setSpritePenguin":function(d){return "la o imagine cu un penguin (Waddles)"},
"setSpritePirate":function(d){return "la o imagine cu pirat"},
"setSpritePrincess":function(d){return "la o imagine cu prinţesă"},
"setSpriteRandom":function(d){return "la o imagine aleatorie"},
"setSpriteRobot":function(d){return "la o imagine cu un robot (Spiff)"},
"setSpriteShowK1":function(d){return "arată"},
"setSpriteSpacebot":function(d){return "la poză cu un robot spaţial"},
"setSpriteSoccerGirl":function(d){return "la poză cu o fotbalistă"},
"setSpriteSoccerBoy":function(d){return "la poză cu un fotbalist"},
"setSpriteSquirrel":function(d){return "la poză cu o veveriţă"},
"setSpriteTennisGirl":function(d){return "la poză cu o jucătoare de tenis"},
"setSpriteTennisBoy":function(d){return "la poză cu un jucător de tenis"},
"setSpriteUnicorn":function(d){return "la poză cu un inorog"},
"setSpriteWitch":function(d){return "la o imagine cu vrăjitoare"},
"setSpriteWizard":function(d){return "la o poză cu un vrăjitor"},
"setSpritePositionTooltip":function(d){return "Instantaneu mută un actor la locația specificată."},
"setSpriteK1Tooltip":function(d){return "Arată sau ascunde actorul specificat."},
"setSpriteTooltip":function(d){return "Setează imaginea actorului"},
"setSpriteSizeRandom":function(d){return "la o mărime aleatoare"},
"setSpriteSizeVerySmall":function(d){return "la o dimensiune foarte mică"},
"setSpriteSizeSmall":function(d){return "la o dimensiune mică"},
"setSpriteSizeNormal":function(d){return "la o dimensiune normală"},
"setSpriteSizeLarge":function(d){return "la o dimensiune mare"},
"setSpriteSizeVeryLarge":function(d){return "la dimensiune foarte mare"},
"setSpriteSizeTooltip":function(d){return "Setează mărimea unui actor"},
"setSpriteSpeedRandom":function(d){return "la o viteză aleatorie"},
"setSpriteSpeedVerySlow":function(d){return "la o viteză foarte mică"},
"setSpriteSpeedSlow":function(d){return "la o viteză mică"},
"setSpriteSpeedNormal":function(d){return "la o viteză normală"},
"setSpriteSpeedFast":function(d){return "la o viteză mare"},
"setSpriteSpeedVeryFast":function(d){return "la o viteză foarte mare"},
"setSpriteSpeedTooltip":function(d){return "Setează viteza unui actor"},
"setSpriteZombie":function(d){return "la o imagine cu un zombi"},
"shareStudioTwitter":function(d){return "Uite ce poveste am inventat. Am scris-o eu însămi cu @codeorg"},
"shareGame":function(d){return "Distribuie povestea ta:"},
"showCoordinates":function(d){return "afișează coordonate"},
"showCoordinatesTooltip":function(d){return "afișează coordonatele protagonistului pe ecran"},
"showTitleScreen":function(d){return "arată ecranul titlu"},
"showTitleScreenTitle":function(d){return "titlu"},
"showTitleScreenText":function(d){return "text"},
"showTSDefTitle":function(d){return "tastează titlul aici"},
"showTSDefText":function(d){return "tastează text aici"},
"showTitleScreenTooltip":function(d){return "Arată un ecran titlu cu titlul şi textul asociate."},
"size":function(d){return "dimensiune"},
"setSprite":function(d){return "setează"},
"setSpriteN":function(d){return "setează actorul "+studio_locale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "criză"},
"soundGoal1":function(d){return "obiectiv 1"},
"soundGoal2":function(d){return "obiectiv 2"},
"soundHit":function(d){return "lovitură"},
"soundLosePoint":function(d){return "pierde punct"},
"soundLosePoint2":function(d){return "pierde punctul 2"},
"soundRetro":function(d){return "retro"},
"soundRubber":function(d){return "cauciuc"},
"soundSlap":function(d){return "pălmuieşte"},
"soundWinPoint":function(d){return "câştigă punct"},
"soundWinPoint2":function(d){return "câştigă punctul 2"},
"soundWood":function(d){return "lemn"},
"speed":function(d){return "viteză"},
"startSetValue":function(d){return "start (funcţie)"},
"startSetVars":function(d){return "game_vars(titlu, subtitlu, fundal, ţintă, pericol, jucător)"},
"startSetFuncs":function(d){return "game_funcs(actualizare-ţintă, actualizare-pericol, actualizare-jucător, coliziune?, pe-ecran?)"},
"stopSprite":function(d){return "opreşte"},
"stopSpriteN":function(d){return "opreşte actorul "+studio_locale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Opreşte mişcarea unui actor."},
"throwSprite":function(d){return "aruncă"},
"throwSpriteN":function(d){return "actorul "+studio_locale.v(d,"spriteIndex")+" aruncă"},
"throwTooltip":function(d){return "Aruncă un proiectil de la actorul specificat."},
"vanish":function(d){return "fă să dispară"},
"vanishActorN":function(d){return "fă să dispară actorul "+studio_locale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "Face să dispară actorul."},
"waitFor":function(d){return "aşteaptă să"},
"waitSeconds":function(d){return "secunde"},
"waitForClick":function(d){return "aşteaptă clic-ul"},
"waitForRandom":function(d){return "aşteaptă orice"},
"waitForHalfSecond":function(d){return "aşteaptă o jumătate de secundă"},
"waitFor1Second":function(d){return "aşteaptă 1 secundă"},
"waitFor2Seconds":function(d){return "aşteaptă 2 secunde"},
"waitFor5Seconds":function(d){return "aşteaptă 5 secunde"},
"waitFor10Seconds":function(d){return "aşteaptă 10 secunde"},
"waitParamsTooltip":function(d){return "Aşteaptă un anumit număr de secunde sau foloseşte zero pentru a aştepta până la un clic."},
"waitTooltip":function(d){return "Aşteaptă o anumită perioadă de timp sau până când se produce un clic."},
"whenArrowDown":function(d){return "săgeată în jos"},
"whenArrowLeft":function(d){return "săgeată la stânga"},
"whenArrowRight":function(d){return "săgeată dreapta"},
"whenArrowUp":function(d){return "săgeată în sus"},
"whenArrowTooltip":function(d){return "Executp acţiuniile de mai jos atunci când tasta săgeată specificată este apăsată."},
"whenDown":function(d){return "când săgeata în jos"},
"whenDownTooltip":function(d){return "Execută acțiunile de mai jos atunci când tasta săgeată în jos este apăsată."},
"whenGameStarts":function(d){return "când începe povestea"},
"whenGameStartsTooltip":function(d){return "Execută acţiunile de mai jos atunci când povestea începe."},
"whenLeft":function(d){return "când săgeată la stânga"},
"whenLeftTooltip":function(d){return "Execută acțiunile de mai jos atunci când tasta săgeată la stânga este apăsată."},
"whenRight":function(d){return "când săgeată la dreapta"},
"whenRightTooltip":function(d){return "Execută acțiunile de mai jos atunci când tasta săgeată la dreapta este apăsată."},
"whenSpriteClicked":function(d){return "când actorul este atins cu cursorul"},
"whenSpriteClickedN":function(d){return "Când s-a făcut clic pe actorul "+studio_locale.v(d,"spriteIndex")},
"whenSpriteClickedTooltip":function(d){return "Execută acţiunile de mai jos atunci când un actor este apăsat."},
"whenSpriteCollidedN":function(d){return "cand actorul "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "Execută acţiunile de mai jos atunci când un actor atinge un alt actor."},
"whenSpriteCollidedWith":function(d){return "atinge"},
"whenSpriteCollidedWithAnyActor":function(d){return "atinge orice actor"},
"whenSpriteCollidedWithAnyEdge":function(d){return "atinge orice margine"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "atinge orice proiectil"},
"whenSpriteCollidedWithAnything":function(d){return "atinge orice"},
"whenSpriteCollidedWithN":function(d){return "atinge actorul "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "atinge mingea de foc albastră"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "atinge mingea de foc mov"},
"whenSpriteCollidedWithRedFireball":function(d){return "atinge mingea de foc roşie"},
"whenSpriteCollidedWithYellowHearts":function(d){return "atinge inimile galbene"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "atinge inimile mov"},
"whenSpriteCollidedWithRedHearts":function(d){return "atinge inimile roşii"},
"whenSpriteCollidedWithBottomEdge":function(d){return "atinge marginea de jos"},
"whenSpriteCollidedWithLeftEdge":function(d){return "atinge marginea stângă"},
"whenSpriteCollidedWithRightEdge":function(d){return "atinge marginea dreaptă"},
"whenSpriteCollidedWithTopEdge":function(d){return "atinge marginea de sus"},
"whenUp":function(d){return "când săgeată în sus"},
"whenUpTooltip":function(d){return "Execută acțiunile de mai jos atunci când tasta săgeată în sus este apăsată."},
"yes":function(d){return "Da"},
"dropletBlock_addItemsToScene_description":function(d){return "Add new items to the scene."},
"dropletBlock_addItemsToScene_param0":function(d){return "type"},
"dropletBlock_addItemsToScene_param0_description":function(d){return "The type of items to be added."},
"dropletBlock_addItemsToScene_param1":function(d){return "count"},
"dropletBlock_addItemsToScene_param1_description":function(d){return "The number of items to add."},
"dropletBlock_changeScore_param0":function(d){return "score"},
"dropletBlock_changeScore_param0_description":function(d){return "The value to add to the score (negative values will reduce the score)."},
"dropletBlock_moveEast_description":function(d){return "Moves the character to the east."},
"dropletBlock_moveNorth_description":function(d){return "Moves the character to the north."},
"dropletBlock_moveSouth_description":function(d){return "Moves the character to the south."},
"dropletBlock_moveWest_description":function(d){return "Moves the character to the west."},
"dropletBlock_playSound_description":function(d){return "Play the chosen sound."},
"dropletBlock_playSound_param0":function(d){return "sound"},
"dropletBlock_playSound_param0_description":function(d){return "The name of the sound to play."},
"dropletBlock_setBackground_param0":function(d){return "image"},
"dropletBlock_setBackground_param0_description":function(d){return "The name of the background image."},
"dropletBlock_setItemActivity_description":function(d){return "Set the activity mode for an item."},
"dropletBlock_setItemActivity_param0":function(d){return "index"},
"dropletBlock_setItemActivity_param0_description":function(d){return "The index (starting at 0) indicating which item's activity should change."},
"dropletBlock_setItemActivity_param1":function(d){return "activity"},
"dropletBlock_setItemActivity_param1_description":function(d){return "The name of the activity mode ('chaseGrid', 'roamGrid', or 'fleeGrid')."},
"dropletBlock_setSprite_param0":function(d){return "index"},
"dropletBlock_setSprite_param0_description":function(d){return "The index (starting at 0) indicating which actor should change."},
"dropletBlock_setSprite_param1":function(d){return "image"},
"dropletBlock_setSprite_param1_description":function(d){return "The name of the actor image."},
"dropletBlock_setWalls_description":function(d){return "Changes the walls in the scene."},
"dropletBlock_setWalls_param0":function(d){return "name"},
"dropletBlock_setWalls_param0_description":function(d){return "The name of the wall set ('border', 'maze', 'maze2', or 'none')."},
"dropletBlock_whenDown_description":function(d){return "This function executes when the down button is pressed."},
"dropletBlock_whenLeft_description":function(d){return "This function executes when the left button is pressed."},
"dropletBlock_whenRight_description":function(d){return "This function executes when the right button is pressed."},
"dropletBlock_whenTouchItem_description":function(d){return "This function executes when the actor touches any item."},
"dropletBlock_whenUp_description":function(d){return "This function executes when the up button is pressed."},
"itemItem1":function(d){return "Item1"},
"itemItem2":function(d){return "Item2"},
"itemItem3":function(d){return "Item3"},
"itemItem4":function(d){return "Item4"},
"setBackgroundBackground1":function(d){return "set background1 background"},
"setBackgroundBackground2":function(d){return "set background2 background"},
"setBackgroundBackground3":function(d){return "set background3 background"},
"setSpriteCharacter1":function(d){return "to item1"},
"setSpriteCharacter2":function(d){return "to item2"}};