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
"actor":function(d){return "aktor"},
"alienInvasion":function(d){return "Pagsugod ng mga Alien!"},
"backgroundBlack":function(d){return "itim"},
"backgroundCave":function(d){return "kuweba"},
"backgroundCloudy":function(d){return "maulap"},
"backgroundHardcourt":function(d){return "hardcourt"},
"backgroundNight":function(d){return "gabi"},
"backgroundUnderwater":function(d){return "sa ilalim ng tubig"},
"backgroundCity":function(d){return "siyudad"},
"backgroundDesert":function(d){return "desert"},
"backgroundRainbow":function(d){return "bahaghari"},
"backgroundSoccer":function(d){return "soccer"},
"backgroundSpace":function(d){return "space"},
"backgroundTennis":function(d){return "tennis"},
"backgroundWinter":function(d){return "winter"},
"catActions":function(d){return "Mga aksyon"},
"catControl":function(d){return "Mga loop"},
"catEvents":function(d){return "Mga event"},
"catLogic":function(d){return "Lohika"},
"catMath":function(d){return "Math"},
"catProcedures":function(d){return "Mga function"},
"catText":function(d){return "Text"},
"catVariables":function(d){return "Mga variable"},
"changeScoreTooltip":function(d){return "Magdagdag o mag-alis ng isang point sa score."},
"changeScoreTooltipK1":function(d){return "Magdagdag ng isang point sa score."},
"continue":function(d){return "Magpatuloy"},
"decrementPlayerScore":function(d){return "alisin ang point"},
"defaultSayText":function(d){return "mag-type dito"},
"emotion":function(d){return "mood"},
"finalLevel":function(d){return "Maligayang pagbati! Nalutas mo na ang pinakahuling puzzle."},
"for":function(d){return "para sa"},
"hello":function(d){return "kumusta"},
"helloWorld":function(d){return "Mabuhay!"},
"incrementPlayerScore":function(d){return "score point"},
"makeProjectileDisappear":function(d){return "mawala"},
"makeProjectileBounce":function(d){return "bounce"},
"makeProjectileBlueFireball":function(d){return "gumawa ng blue na fireball"},
"makeProjectilePurpleFireball":function(d){return "gumawa ng purple na fireball"},
"makeProjectileRedFireball":function(d){return "gumawa ng red na fireball"},
"makeProjectileYellowHearts":function(d){return "gumawa ng yellow na mga puso"},
"makeProjectilePurpleHearts":function(d){return "gumawa ng purple na mga puso"},
"makeProjectileRedHearts":function(d){return "gumawa ng red na mga puso"},
"makeProjectileTooltip":function(d){return "Gawin ang projectile na bumangga na mawala o mag-bounce."},
"makeYourOwn":function(d){return "Gumawa ng Iyong Sariling Play Lab App"},
"moveDirectionDown":function(d){return "baba"},
"moveDirectionLeft":function(d){return "kaliwa"},
"moveDirectionRight":function(d){return "kanan"},
"moveDirectionUp":function(d){return "taas"},
"moveDirectionRandom":function(d){return "nang hindi pinipili"},
"moveDistance25":function(d){return "25 pixels"},
"moveDistance50":function(d){return "50 pixels"},
"moveDistance100":function(d){return "100 pixels"},
"moveDistance200":function(d){return "200 pixels"},
"moveDistance400":function(d){return "400 pixels"},
"moveDistancePixels":function(d){return "pixels"},
"moveDistanceRandom":function(d){return "random na mga pixel"},
"moveDistanceTooltip":function(d){return "Igalaw ang aktor sa partikular na distansya sa tinukoy na direksyon."},
"moveSprite":function(d){return "galaw"},
"moveSpriteN":function(d){return "move actor "+studio_locale.v(d,"spriteIndex")},
"toXY":function(d){return "sa x, y"},
"moveDown":function(d){return "igalaw pababa"},
"moveDownTooltip":function(d){return "Igalaw ang aktor pababa."},
"moveLeft":function(d){return "igalaw pakaliwa"},
"moveLeftTooltip":function(d){return "Igalaw ang aktor pakaliwa."},
"moveRight":function(d){return "igalaw pakanan"},
"moveRightTooltip":function(d){return "Igalaw ang aktor pakanan."},
"moveUp":function(d){return "igalaw pataas"},
"moveUpTooltip":function(d){return "Igalaw ang aktor pataas."},
"moveTooltip":function(d){return "Igalaw ang aktor."},
"nextLevel":function(d){return "Maligayang pagbati! Natapos mo ang puzzle na ito."},
"no":function(d){return "Hindi"},
"numBlocksNeeded":function(d){return "Ang puzzle na ito ay maaaring malutas sa %1 na mga block."},
"onEventTooltip":function(d){return "Execute code in response to the specified event."},
"ouchExclamation":function(d){return "Aray!"},
"playSoundCrunch":function(d){return "magpatugtog ng crunch na tunog"},
"playSoundGoal1":function(d){return "patugtugin ang goal 1 na tunog"},
"playSoundGoal2":function(d){return "patugtugin ang goal 2 na tunog"},
"playSoundHit":function(d){return "patugtugin ang hit na tunog"},
"playSoundLosePoint":function(d){return "patugtugin ang lose point na tunog"},
"playSoundLosePoint2":function(d){return "patugtugin ang lose point 2 na tunog"},
"playSoundRetro":function(d){return "pagtugtugin ang retro na tunog"},
"playSoundRubber":function(d){return "patugtugin ang rubber na tunog"},
"playSoundSlap":function(d){return "patugtugin ang slap na tunog"},
"playSoundTooltip":function(d){return "Magpatugtog ng napiling tunog."},
"playSoundWinPoint":function(d){return "patugtugin ang win point na tunog"},
"playSoundWinPoint2":function(d){return "patugtugin ang win point 2 na tunog"},
"playSoundWood":function(d){return "patugtugin ang wood sound"},
"positionOutTopLeft":function(d){return "sa itaas na kaliwang tuktok na posisyon"},
"positionOutTopRight":function(d){return "sa itaas kanang tuktok na posisyon"},
"positionTopOutLeft":function(d){return "sa tuktok na kaliwa sa labas na posisyon"},
"positionTopLeft":function(d){return "sa kaliwang tuktok na posisyon"},
"positionTopCenter":function(d){return "sa gitnang tuktok na posisyon"},
"positionTopRight":function(d){return "sa kanang tuktok na posisyon"},
"positionTopOutRight":function(d){return "sa tuktok labas mismo na posisyon"},
"positionMiddleLeft":function(d){return "sa gitnang kaliwa na posisyon"},
"positionMiddleCenter":function(d){return "sa gitnang posisyon"},
"positionMiddleRight":function(d){return "sa gitnang kanan na posisyon"},
"positionBottomOutLeft":function(d){return "sa ibaba sa labas na kaliwa na posisyon"},
"positionBottomLeft":function(d){return "sa kaliwang ibaba na posisyon"},
"positionBottomCenter":function(d){return "sa kanang ibaba na posisyon"},
"positionBottomRight":function(d){return "sa kanang ibaba na posisyon"},
"positionBottomOutRight":function(d){return "sa ibaba sa labas mismo na posisyon"},
"positionOutBottomLeft":function(d){return "sa ibaba sa kaliwa na posisyon"},
"positionOutBottomRight":function(d){return "sa ibabang kanan na posisyon"},
"positionRandom":function(d){return "sa random na posisyon"},
"projectileBlueFireball":function(d){return "asul na fireball"},
"projectilePurpleFireball":function(d){return "purple na fireball"},
"projectileRedFireball":function(d){return "red na fireball"},
"projectileYellowHearts":function(d){return "dilaw na mga puso"},
"projectilePurpleHearts":function(d){return "purple na puso"},
"projectileRedHearts":function(d){return "pulang puso"},
"projectileRandom":function(d){return "nang hindi pinipili"},
"projectileAnna":function(d){return "Anna"},
"projectileElsa":function(d){return "Elsa"},
"projectileHiro":function(d){return "Hiro"},
"projectileBaymax":function(d){return "Baymax"},
"projectileRapunzel":function(d){return "Rapunzel"},
"projectileCherry":function(d){return "cherry"},
"projectileIce":function(d){return "ice"},
"projectileDuck":function(d){return "duck"},
"reinfFeedbackMsg":function(d){return "Maaarin mo pindutin ang \"Subukan muli\" na button upang bumalik sa paglalaro."},
"repeatForever":function(d){return "ulitin ng walang katapusan"},
"repeatDo":function(d){return "gawin"},
"repeatForeverTooltip":function(d){return "Ipatupad ang mga aksyon sa block na ito ng paulit-ulit habang ang kuwento ay tumatakbo."},
"saySprite":function(d){return "sabihin"},
"saySpriteN":function(d){return "aktor "+studio_locale.v(d,"spriteIndex")+" sabihin"},
"saySpriteTooltip":function(d){return "Magpakita ng speech bubble ng mga nauugnay na teksto mula sa tinukoy na aktor."},
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
"saySpriteChoices_16":function(d){return "Oo"},
"saySpriteChoices_17":function(d){return "Hindi"},
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
"scoreText":function(d){return "Puntos: "+studio_locale.v(d,"playerScore")},
"setBackground":function(d){return "i-set ang background"},
"setBackgroundRandom":function(d){return "i-set ang random na background"},
"setBackgroundBlack":function(d){return "i-set ang itim na background"},
"setBackgroundCave":function(d){return "i-set ang kuweba na background"},
"setBackgroundCloudy":function(d){return "i-set ang maulap na background"},
"setBackgroundHardcourt":function(d){return "i-set ang hardcourt na background"},
"setBackgroundNight":function(d){return "i-set ang gabi na background"},
"setBackgroundUnderwater":function(d){return "i-set ang sa ilalim ng dagat na background"},
"setBackgroundCity":function(d){return "i-set ang background na lungsod"},
"setBackgroundDesert":function(d){return "i-set ang background na disyerto"},
"setBackgroundRainbow":function(d){return "i-set ng background na bahaghari"},
"setBackgroundSoccer":function(d){return "i-set ang background na soccer"},
"setBackgroundSpace":function(d){return "i-set ang space na background"},
"setBackgroundTennis":function(d){return "i-set ang background na pang-tennis"},
"setBackgroundWinter":function(d){return "i-set ang background na taglamig"},
"setBackgroundLeafy":function(d){return "itakda ang leafy background"},
"setBackgroundGrassy":function(d){return "set grassy background"},
"setBackgroundFlower":function(d){return "set flower background"},
"setBackgroundTile":function(d){return "set tile background"},
"setBackgroundIcy":function(d){return "set icy background"},
"setBackgroundSnowy":function(d){return "set snowy background"},
"setBackgroundTooltip":function(d){return "Nilalagay ang imahe ng background"},
"setEnemySpeed":function(d){return "i-set ang bilis ng kaaway"},
"setPlayerSpeed":function(d){return "i-set ang bilis ng manlalaro"},
"setScoreText":function(d){return "ilagay ang puntos"},
"setScoreTextTooltip":function(d){return "Sine-set ang teksto upang maipakita sa score area."},
"setSpriteEmotionAngry":function(d){return "sa isang galit na mood"},
"setSpriteEmotionHappy":function(d){return "sa isang masayang mood"},
"setSpriteEmotionNormal":function(d){return "sa isang normal na mood"},
"setSpriteEmotionRandom":function(d){return "sa isang random na mood"},
"setSpriteEmotionSad":function(d){return "sa isang malungkot na mood"},
"setSpriteEmotionTooltip":function(d){return "sine-set ang mood ng aktor"},
"setSpriteAlien":function(d){return "sa isang alien na larawan"},
"setSpriteBat":function(d){return "sa isang paniki na larawan"},
"setSpriteBird":function(d){return "sa isang ibon na larawan"},
"setSpriteCat":function(d){return "sa isang pusa na larawan"},
"setSpriteCaveBoy":function(d){return "sa isang batang lalaki sa kuweba na larawan"},
"setSpriteCaveGirl":function(d){return "sa isang batang babae sa kuweba na larawan"},
"setSpriteDinosaur":function(d){return "sa isang dinosaur na larawan"},
"setSpriteDog":function(d){return "sa isang aso na larawan"},
"setSpriteDragon":function(d){return "sa isang dragon na larawan"},
"setSpriteGhost":function(d){return "sa isang ghost na larawan"},
"setSpriteHidden":function(d){return "sa isang nakatago na imahe"},
"setSpriteHideK1":function(d){return "itago"},
"setSpriteAnna":function(d){return "sa isang Anna na larawan"},
"setSpriteElsa":function(d){return "sa isang Elsa na larawan"},
"setSpriteHiro":function(d){return "sa isang Hiro na larawan"},
"setSpriteBaymax":function(d){return "sa isang Baymax na larawan"},
"setSpriteRapunzel":function(d){return "sa isang Rapunzel na larawan"},
"setSpriteKnight":function(d){return "sa isang kabalyero na larawan"},
"setSpriteMonster":function(d){return "sa isang halimaw na larawan"},
"setSpriteNinja":function(d){return "sa isang may maskara na ninja na larawan"},
"setSpriteOctopus":function(d){return "sa isang octopus na larawan"},
"setSpritePenguin":function(d){return "sa isang penguin na larawan"},
"setSpritePirate":function(d){return "sa isang pirata na larawan"},
"setSpritePrincess":function(d){return "sa isang prinsesa na larawan"},
"setSpriteRandom":function(d){return "sa isang random na imahe"},
"setSpriteRobot":function(d){return "sa isang robot na larawan"},
"setSpriteShowK1":function(d){return "ipakita"},
"setSpriteSpacebot":function(d){return "sa isang spacebot na larawan"},
"setSpriteSoccerGirl":function(d){return "sa isang soccer girl na larawan"},
"setSpriteSoccerBoy":function(d){return "sa isang soccer boy na larawan"},
"setSpriteSquirrel":function(d){return "sa isang squirrel na larawan"},
"setSpriteTennisGirl":function(d){return "sa isang tennis girl na larawan"},
"setSpriteTennisBoy":function(d){return "sa isang tennis boy na larawan"},
"setSpriteUnicorn":function(d){return "sa isang unicorn na larawan"},
"setSpriteWitch":function(d){return "sa isang witch na imahe"},
"setSpriteWizard":function(d){return "sa isang wizard na larawan"},
"setSpritePositionTooltip":function(d){return "Agad na naglilipat ng isang aktor sa tinukoy na lokasyon."},
"setSpriteK1Tooltip":function(d){return "Ipinapakita o itinatago ang mga tinukoy na aktor ."},
"setSpriteTooltip":function(d){return "I-set ang imahe ng aktor"},
"setSpriteSizeRandom":function(d){return "sa isang random na laki"},
"setSpriteSizeVerySmall":function(d){return "sa isang napakaliit na sukat"},
"setSpriteSizeSmall":function(d){return "sa isang maliit na sukat"},
"setSpriteSizeNormal":function(d){return "sa isang normal na laki"},
"setSpriteSizeLarge":function(d){return "sa isang malaking sukat"},
"setSpriteSizeVeryLarge":function(d){return "sa isang napakalaking sukat"},
"setSpriteSizeTooltip":function(d){return "Itinatakda ang laki ng isang aktor"},
"setSpriteSpeedRandom":function(d){return "sa random na bilis"},
"setSpriteSpeedVerySlow":function(d){return "sa napakabagal na bilis"},
"setSpriteSpeedSlow":function(d){return "sa mabagal na bilis"},
"setSpriteSpeedNormal":function(d){return "sa normal na bilis"},
"setSpriteSpeedFast":function(d){return "sa napakabilis"},
"setSpriteSpeedVeryFast":function(d){return "sa pinakamabilis"},
"setSpriteSpeedTooltip":function(d){return "Sini-set ang bilis ng aktor"},
"setSpriteZombie":function(d){return "sa isang zombie na larawan"},
"shareStudioTwitter":function(d){return "Tingnan ang kuwento na ginawa ko. Ako mismo ang nagsulat nito sa @codeorg"},
"shareGame":function(d){return "Ibahagi ang iyong kuwento:"},
"showCoordinates":function(d){return "ipakita ang mga coordinate ng"},
"showCoordinatesTooltip":function(d){return "ipakita ang mga coordinate ang kalaban sa screen"},
"showTitleScreen":function(d){return "ipakita ang title screen"},
"showTitleScreenTitle":function(d){return "title"},
"showTitleScreenText":function(d){return "text"},
"showTSDefTitle":function(d){return "i-type ang title dito"},
"showTSDefText":function(d){return "i-type ang text dito"},
"showTitleScreenTooltip":function(d){return "Ipakita ng title screen kasama ang mga kaugnay na pamagat at teksto."},
"size":function(d){return "sukat"},
"setSprite":function(d){return "set"},
"setSpriteN":function(d){return "set actor "+studio_locale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "crunch"},
"soundGoal1":function(d){return "goal 1"},
"soundGoal2":function(d){return "goal 2"},
"soundHit":function(d){return "tamaan"},
"soundLosePoint":function(d){return "mawalan ng point"},
"soundLosePoint2":function(d){return "mawalan ng point 2"},
"soundRetro":function(d){return "retro"},
"soundRubber":function(d){return "goma"},
"soundSlap":function(d){return "slap"},
"soundWinPoint":function(d){return "point ng panalo"},
"soundWinPoint2":function(d){return "point ng panalo 2"},
"soundWood":function(d){return "kahoy"},
"speed":function(d){return "bilis"},
"startSetValue":function(d){return "start (rocket-height function)"},
"startSetVars":function(d){return "game_vars (title, subtitle, background, target, danger, player)"},
"startSetFuncs":function(d){return "game_funcs (update-target, update-danger, update-player, collide?, on-screen?)"},
"stopSprite":function(d){return "hinto"},
"stopSpriteN":function(d){return "itigil ang aktor  "+studio_locale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Itigil ang ginagawa ng aktor."},
"throwSprite":function(d){return "itapon"},
"throwSpriteN":function(d){return "aktor  "+studio_locale.v(d,"spriteIndex")+" hagis"},
"throwTooltip":function(d){return "Itatapon ang isang projectile mula sa tinukoy na aktor ."},
"vanish":function(d){return "mawala"},
"vanishActorN":function(d){return "mawala ang aktor  "+studio_locale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "Mawawala ang aktor ."},
"waitFor":function(d){return "maghintay sa"},
"waitSeconds":function(d){return "segundo"},
"waitForClick":function(d){return "maghintay sa click"},
"waitForRandom":function(d){return "maghintay sa random"},
"waitForHalfSecond":function(d){return "maghintay ng kalahating segundo"},
"waitFor1Second":function(d){return "maghintay ng 1 segundo"},
"waitFor2Seconds":function(d){return "maghintay ng 2 segundo"},
"waitFor5Seconds":function(d){return "maghintay ng 5 segundo"},
"waitFor10Seconds":function(d){return "maghintay ng 10 segundo"},
"waitParamsTooltip":function(d){return "Maghintay sa tinukoy na bilang ng mga segundo o gamitin ang zero upang maghintay hanggang ang isang click ay mangyari."},
"waitTooltip":function(d){return "Maghintay ng tinakdang oras o kaya hanggang meron click na maganap."},
"whenArrowDown":function(d){return "pababa na arrow"},
"whenArrowLeft":function(d){return "kaliwang arrow"},
"whenArrowRight":function(d){return "kanang arrow"},
"whenArrowUp":function(d){return "pataas na arrow"},
"whenArrowTooltip":function(d){return "Ipatupad ang mga aksyon sa ibaba kapag ang tinukoy na arrow key ay pinindot."},
"whenDown":function(d){return "kapag ang pababang arrow"},
"whenDownTooltip":function(d){return "Ipatupad ang mga aksyon sa ibaba kapag ang pataas na arrow key ay pinindot."},
"whenGameStarts":function(d){return "kapag nagsimula ang kuwento"},
"whenGameStartsTooltip":function(d){return "Ipatupad ang mga aksyon sa ibaba kapag nagsimula ang kuwento."},
"whenLeft":function(d){return "kapag ang kaliwa na arrow"},
"whenLeftTooltip":function(d){return "Ipatupad ang mga aksyon sa ibaba kapag ang pataas na arrow key ay pinindot."},
"whenRight":function(d){return "kapag ang kanan na arrow"},
"whenRightTooltip":function(d){return "Ipatupad ang mga aksyon sa ibaba kapag ang pataas na arrow key ay pinindot."},
"whenSpriteClicked":function(d){return "kapag ang aktor ay na-click"},
"whenSpriteClickedN":function(d){return "kapag ang artista  "+studio_locale.v(d,"spriteIndex")+" na click"},
"whenSpriteClickedTooltip":function(d){return "Ipatupad ang mga aksyon sa ibaba kapag ang isang artista ay na-click."},
"whenSpriteCollidedN":function(d){return "kapag ang artista  "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "Ipatupad ang mga aksyon sa ibaba kapag ang isang aktor ay hinawakan ang isa pang aktor."},
"whenSpriteCollidedWith":function(d){return "hinahawakan"},
"whenSpriteCollidedWithAnyActor":function(d){return "nahawakan kahit sinong aktor"},
"whenSpriteCollidedWithAnyEdge":function(d){return "nahawakan ang anumang gilid"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "nahawakan ang anumang projectile"},
"whenSpriteCollidedWithAnything":function(d){return "nahawakan ang anumang bagay"},
"whenSpriteCollidedWithN":function(d){return "nahawakan ang aktor  "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "nahawakan ang asul na fireball"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "nahawakan ang purple na fireball"},
"whenSpriteCollidedWithRedFireball":function(d){return "nahawakan ang pula na fireball"},
"whenSpriteCollidedWithYellowHearts":function(d){return "nahawakan ang dilaw na puso"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "nahawakan ang purple na puso"},
"whenSpriteCollidedWithRedHearts":function(d){return "nahawakan ang pulang puso"},
"whenSpriteCollidedWithBottomEdge":function(d){return "nahawakan ang ilalim"},
"whenSpriteCollidedWithLeftEdge":function(d){return "nahawakan ang kaliwang ilalim"},
"whenSpriteCollidedWithRightEdge":function(d){return "nahawakan ang kanang ilalim"},
"whenSpriteCollidedWithTopEdge":function(d){return "nahawakan ang tuktok"},
"whenUp":function(d){return "kapag ang pataas na arrow"},
"whenUpTooltip":function(d){return "Ipatupad ang mga aksyon sa ibaba kapag ang pataas na arrow key ay pinindot."},
"yes":function(d){return "Oo"}};