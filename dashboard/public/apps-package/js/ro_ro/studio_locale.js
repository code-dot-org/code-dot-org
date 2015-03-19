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
"actor":function(d){return "actorul"},
"alienInvasion":function(d){return "Invazia alienilor!"},
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
"changeScoreTooltip":function(d){return "Adăugaţi sau eliminaţi un punct la scor."},
"changeScoreTooltipK1":function(d){return "Adăuga un punct la scor."},
"continue":function(d){return "Continuă"},
"decrementPlayerScore":function(d){return "elimina punct"},
"defaultSayText":function(d){return "tastează aici"},
"emotion":function(d){return "starea de spirit"},
"finalLevel":function(d){return "Felicitări! Ai rezolvat puzzle-ul final."},
"for":function(d){return "pentru"},
"hello":function(d){return "bună"},
"helloWorld":function(d){return "Salutare lume!"},
"incrementPlayerScore":function(d){return "punct de scor"},
"makeProjectileDisappear":function(d){return "dispar"},
"makeProjectileBounce":function(d){return "saritura"},
"makeProjectileBlueFireball":function(d){return "fă o minge de foc albastră"},
"makeProjectilePurpleFireball":function(d){return "fă o minge de foc mov"},
"makeProjectileRedFireball":function(d){return "fă o minge de foc roşie"},
"makeProjectileYellowHearts":function(d){return "fă inimi galbene"},
"makeProjectilePurpleHearts":function(d){return "fă inimi mov"},
"makeProjectileRedHearts":function(d){return "fă inimi roşii"},
"makeProjectileTooltip":function(d){return "Fă proiectilul care tocmai s-a ciocnit să dispară au să sară."},
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
"moveDistanceTooltip":function(d){return "Mută un actor o distanță anume în direcția specificată."},
"moveSprite":function(d){return "mută"},
"moveSpriteN":function(d){return "muta actorul "+appLocale.v(d,"spriteIndex")},
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
"onEventTooltip":function(d){return "Execute code in response to the specified event."},
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
"positionTopOutLeft":function(d){return "în poziţia din stânga sus de afară"},
"positionTopLeft":function(d){return "stânga sus"},
"positionTopCenter":function(d){return "centru sus"},
"positionTopRight":function(d){return "dreapta sus"},
"positionTopOutRight":function(d){return "în poziţia din dreapta sus de afară"},
"positionMiddleLeft":function(d){return "mijloc stânga"},
"positionMiddleCenter":function(d){return "mijloc centru"},
"positionMiddleRight":function(d){return "mijloc dreapta"},
"positionBottomOutLeft":function(d){return "în poziţia din stânga jos de afară"},
"positionBottomLeft":function(d){return "stânga jos"},
"positionBottomCenter":function(d){return "mijloc jos"},
"positionBottomRight":function(d){return "dreapta jos"},
"positionBottomOutRight":function(d){return "în poziţia din dreapta jos de afară"},
"positionOutBottomLeft":function(d){return "în poziţia din stânga jos dedesubt"},
"positionOutBottomRight":function(d){return "în poziţia din dreapta jos dedesubt"},
"positionRandom":function(d){return "aleatoriu"},
"projectileBlueFireball":function(d){return "minge de foc albastră"},
"projectilePurpleFireball":function(d){return "minge de foc mov"},
"projectileRedFireball":function(d){return "minge de foc roşie"},
"projectileYellowHearts":function(d){return "inimi galbene"},
"projectilePurpleHearts":function(d){return "inimi mov"},
"projectileRedHearts":function(d){return "inimi roşii"},
"projectileRandom":function(d){return "aleator"},
"projectileAnna":function(d){return "Cârlig"},
"projectileElsa":function(d){return "strălucire"},
"projectileHiro":function(d){return "micro-roboți"},
"projectileBaymax":function(d){return "Rachetă"},
"projectileRapunzel":function(d){return "Cratiță"},
"projectileCherry":function(d){return "cireașă"},
"projectileIce":function(d){return "gheață"},
"projectileDuck":function(d){return "rață"},
"reinfFeedbackMsg":function(d){return "Poţi apăsa butonul \"Încearcă din nou\" pentru a reveni la povestea ta."},
"repeatForever":function(d){return "repetă pentru totdeauna"},
"repeatDo":function(d){return "fă"},
"repeatForeverTooltip":function(d){return "Execută acțiunile din acest bloc în mod repetat în timp ce povestea se desfăşoară."},
"saySprite":function(d){return "spune"},
"saySpriteN":function(d){return "actorul "+appLocale.v(d,"spriteIndex")+" zii"},
"saySpriteTooltip":function(d){return "Apare un balon cu textul asociat din partea actorului specificat."},
"saySpriteChoices_0":function(d){return "Hi there."},
"saySpriteChoices_1":function(d){return "Salut!"},
"saySpriteChoices_2":function(d){return "Ce mai faci?"},
"saySpriteChoices_3":function(d){return "Este distractiv..."},
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
"saySpriteChoices_16":function(d){return "Da"},
"saySpriteChoices_17":function(d){return "Nu"},
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
"scoreText":function(d){return "Scor: "+appLocale.v(d,"playerScore")},
"setBackground":function(d){return "seteaza fundalul"},
"setBackgroundRandom":function(d){return "setează fundal aleatoriu"},
"setBackgroundBlack":function(d){return "setează fundal negru"},
"setBackgroundCave":function(d){return "setează fundal peșteră"},
"setBackgroundCloudy":function(d){return "setează fundal tulbure"},
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
"setBackgroundLeafy":function(d){return "setează un fundal cu frunze"},
"setBackgroundGrassy":function(d){return "setează un fundal cu iarbă"},
"setBackgroundFlower":function(d){return "setează un fundal cu flori"},
"setBackgroundTile":function(d){return "stabilește fundalul"},
"setBackgroundIcy":function(d){return "setează un fundal înghețat"},
"setBackgroundSnowy":function(d){return "setează un fundal cu zăpadă"},
"setBackgroundTooltip":function(d){return "Setează imaginea de fundal"},
"setEnemySpeed":function(d){return "setează viteza inamicului"},
"setPlayerSpeed":function(d){return "setează viteza jucătorului"},
"setScoreText":function(d){return "Setează scor"},
"setScoreTextTooltip":function(d){return "Setează textul ca să fie afișat în zona scorului."},
"setSpriteEmotionAngry":function(d){return "la o stare de spirit furioasă"},
"setSpriteEmotionHappy":function(d){return "la o stare de spirit fericită"},
"setSpriteEmotionNormal":function(d){return "la o stare normală"},
"setSpriteEmotionRandom":function(d){return "la o stare de spirit aleatoare"},
"setSpriteEmotionSad":function(d){return "la o stare de spirit tristă"},
"setSpriteEmotionTooltip":function(d){return "Setează starea de spirit de actor"},
"setSpriteAlien":function(d){return "pentru o imagine extraterextră"},
"setSpriteBat":function(d){return "o imagine cu liliac"},
"setSpriteBird":function(d){return "o imagine cu pasăre"},
"setSpriteCat":function(d){return "o imagine cu pisica"},
"setSpriteCaveBoy":function(d){return "într-o poză cu un băiat din peşteră"},
"setSpriteCaveGirl":function(d){return "într-o poză cu o fată din peşteră"},
"setSpriteDinosaur":function(d){return "o imagine de dinozaur"},
"setSpriteDog":function(d){return "o imagine de câine"},
"setSpriteDragon":function(d){return "o imagine de dragon"},
"setSpriteGhost":function(d){return "o imagine fantomă"},
"setSpriteHidden":function(d){return "o imagine ascunsă"},
"setSpriteHideK1":function(d){return "ascunde"},
"setSpriteAnna":function(d){return "la o imagine cu Anna"},
"setSpriteElsa":function(d){return "o imagine cu Elsa"},
"setSpriteHiro":function(d){return "o imagine cu Hiro"},
"setSpriteBaymax":function(d){return "o imagine de Baymax"},
"setSpriteRapunzel":function(d){return "o imagine cu Rapunzel"},
"setSpriteKnight":function(d){return "o imagine de cavaler"},
"setSpriteMonster":function(d){return "o imagine de monstru"},
"setSpriteNinja":function(d){return "într-o poză cu un ninja mascat"},
"setSpriteOctopus":function(d){return "într-o poză cu o caracatiţă"},
"setSpritePenguin":function(d){return "într-o poză cu un penguin"},
"setSpritePirate":function(d){return "într-o poză cu un pirat"},
"setSpritePrincess":function(d){return "într-o poză cu o prinţesă"},
"setSpriteRandom":function(d){return "imagine aleatorie"},
"setSpriteRobot":function(d){return "într-o poză cu un robot"},
"setSpriteShowK1":function(d){return "arată"},
"setSpriteSpacebot":function(d){return "într-o poză cu un robot spaţial"},
"setSpriteSoccerGirl":function(d){return "într-o poză cu o fotbalistă"},
"setSpriteSoccerBoy":function(d){return "într-o poză cu un fotbalist"},
"setSpriteSquirrel":function(d){return "într-o poză cu o veveriţă"},
"setSpriteTennisGirl":function(d){return "într-o poză cu o jucătoare de tenis"},
"setSpriteTennisBoy":function(d){return "într-o poză cu un jucător de tenis"},
"setSpriteUnicorn":function(d){return "într-o poză cu un inorog"},
"setSpriteWitch":function(d){return "imagine de vrăjitoare"},
"setSpriteWizard":function(d){return "într-o poză cu un vrăjitor"},
"setSpritePositionTooltip":function(d){return "Instantaneu mută un actor la locația specificată."},
"setSpriteK1Tooltip":function(d){return "Arată sau ascunde actorul specificat."},
"setSpriteTooltip":function(d){return "Setează imaginea actorului"},
"setSpriteSizeRandom":function(d){return "într-o mărime aleatoare"},
"setSpriteSizeVerySmall":function(d){return "într-o dimensiune foarte mică"},
"setSpriteSizeSmall":function(d){return "într-o dimensiune mică"},
"setSpriteSizeNormal":function(d){return "într-o dimensiune normală"},
"setSpriteSizeLarge":function(d){return "într-o dimensiune mare"},
"setSpriteSizeVeryLarge":function(d){return "într-o dimensiune foarte mare"},
"setSpriteSizeTooltip":function(d){return "Setează mărimea unui actor"},
"setSpriteSpeedRandom":function(d){return "viteză aleatorie"},
"setSpriteSpeedVerySlow":function(d){return "viteză foarte lentă"},
"setSpriteSpeedSlow":function(d){return "viteză lentă"},
"setSpriteSpeedNormal":function(d){return "viteză normală"},
"setSpriteSpeedFast":function(d){return "viteză rapidă"},
"setSpriteSpeedVeryFast":function(d){return "viteză foarte rapidă"},
"setSpriteSpeedTooltip":function(d){return "Setează viteza unui actor"},
"setSpriteZombie":function(d){return "într-o poză cu un zombi"},
"shareStudioTwitter":function(d){return "Uite ce poveste am inventat. Am scris-o cu @codeorg"},
"shareGame":function(d){return "Împărtăşeşte povestea ta:"},
"showCoordinates":function(d){return "afișează coordonate"},
"showCoordinatesTooltip":function(d){return "afișează coordonatele protagonistului pe ecran"},
"showTitleScreen":function(d){return "arată ecranul titlu"},
"showTitleScreenTitle":function(d){return "titlu"},
"showTitleScreenText":function(d){return "text"},
"showTSDefTitle":function(d){return "scrie titlul aici"},
"showTSDefText":function(d){return "scrie aici"},
"showTitleScreenTooltip":function(d){return "Arată un ecran titlu cu titlul şi textul asociate."},
"size":function(d){return "dimensiune"},
"setSprite":function(d){return "setează"},
"setSpriteN":function(d){return "setează actorul "+appLocale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "criză"},
"soundGoal1":function(d){return "obiectivul 1"},
"soundGoal2":function(d){return "obiectivul 2"},
"soundHit":function(d){return "lovitură"},
"soundLosePoint":function(d){return "pierde punctul"},
"soundLosePoint2":function(d){return "pierde punctul 2"},
"soundRetro":function(d){return "retro"},
"soundRubber":function(d){return "cauciuc"},
"soundSlap":function(d){return "pălmuieşte"},
"soundWinPoint":function(d){return "câştigă punctul"},
"soundWinPoint2":function(d){return "câştigă punctul 2"},
"soundWood":function(d){return "lemn"},
"speed":function(d){return "viteză"},
"startSetValue":function(d){return "start (funcţie)"},
"startSetVars":function(d){return "game_vars(titlu, subtitlu, fundal, ţintă, pericol, jucător)"},
"startSetFuncs":function(d){return "game_funcs(actualizare-ţintă, actualizare-pericol, actualizare-jucător, coliziune?, pe-ecran?)"},
"stopSprite":function(d){return "opreşte"},
"stopSpriteN":function(d){return "opreşte actorul "+appLocale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Opreşte mişcarea unui actor."},
"throwSprite":function(d){return "aruncă"},
"throwSpriteN":function(d){return "aruncarea actorului "+appLocale.v(d,"spriteIndex")},
"throwTooltip":function(d){return "Aruncă un proiectil de la actorul specificat."},
"vanish":function(d){return "şterge"},
"vanishActorN":function(d){return "şterge actorul "+appLocale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "Şterge actorul."},
"waitFor":function(d){return "aşteaptă să"},
"waitSeconds":function(d){return "secunde"},
"waitForClick":function(d){return "aşteaptă clic"},
"waitForRandom":function(d){return "aşteaptă aleatoriu"},
"waitForHalfSecond":function(d){return "aşteaptă o jumătate de secundă"},
"waitFor1Second":function(d){return "aşteaptă 1 secundă"},
"waitFor2Seconds":function(d){return "aşteaptă 2 secunde"},
"waitFor5Seconds":function(d){return "aşteaptă 5 secunde"},
"waitFor10Seconds":function(d){return "aşteaptă 10 secunde"},
"waitParamsTooltip":function(d){return "Aşteaptă un număr anumit de secunde sau foloseşte zero pentru a aştepta până la un clic."},
"waitTooltip":function(d){return "Aşteaptă o anumită perioadă de timp sau până când se produce un clic."},
"whenArrowDown":function(d){return "săgeată în jos"},
"whenArrowLeft":function(d){return "săgeată la stânga"},
"whenArrowRight":function(d){return "săgeată dreapta"},
"whenArrowUp":function(d){return "săgeată în sus"},
"whenArrowTooltip":function(d){return "Executa acţiuniile de mai jos atunci când tasta săgeată specificat este apăsată."},
"whenDown":function(d){return "când săgeata în jos"},
"whenDownTooltip":function(d){return "Execută acțiunile de mai jos atunci când tasta săgeată în jos este apăsată."},
"whenGameStarts":function(d){return "când începe povestea"},
"whenGameStartsTooltip":function(d){return "Execută acţiunile de mai jos atunci când povestea începe."},
"whenLeft":function(d){return "când săgeată la stânga"},
"whenLeftTooltip":function(d){return "Execută acțiunile de mai jos atunci când tasta săgeată la stânga este apăsată."},
"whenRight":function(d){return "când săgeată la dreapta"},
"whenRightTooltip":function(d){return "Execută acțiunile de mai jos atunci când tasta săgeată la dreapta este apăsată."},
"whenSpriteClicked":function(d){return "când actorul este atins"},
"whenSpriteClickedN":function(d){return "Când faceţi clic pe actorul "+appLocale.v(d,"spriteIndex")},
"whenSpriteClickedTooltip":function(d){return "Execută acţiunile de mai jos atunci când un actor este apăsat."},
"whenSpriteCollidedN":function(d){return "cand actorul "+appLocale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "Execută acţiunile de mai jos atunci când un actor atinge un alt actor."},
"whenSpriteCollidedWith":function(d){return "atinge"},
"whenSpriteCollidedWithAnyActor":function(d){return "atinge orice actor"},
"whenSpriteCollidedWithAnyEdge":function(d){return "atinge orice margine"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "atinge orice proiectil"},
"whenSpriteCollidedWithAnything":function(d){return "nu atinge nimic"},
"whenSpriteCollidedWithN":function(d){return "atinge actorul "+appLocale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "atinge mingea de foc albastră"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "atinge mingea de foc mov"},
"whenSpriteCollidedWithRedFireball":function(d){return "atinge mingea de foc roşie"},
"whenSpriteCollidedWithYellowHearts":function(d){return "atinge inimile galbene"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "atinge inimile mov"},
"whenSpriteCollidedWithRedHearts":function(d){return "atinge inimile roşii"},
"whenSpriteCollidedWithBottomEdge":function(d){return "atinge marginea de jos"},
"whenSpriteCollidedWithLeftEdge":function(d){return "atinge marginea stânga"},
"whenSpriteCollidedWithRightEdge":function(d){return "atinge marginea dreapta"},
"whenSpriteCollidedWithTopEdge":function(d){return "atinge marginea de sus"},
"whenUp":function(d){return "când săgeată în sus"},
"whenUpTooltip":function(d){return "Execută acțiunile de mai jos atunci când tasta săgeată în sus este apăsată."},
"yes":function(d){return "Da"}};