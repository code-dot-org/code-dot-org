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
"actor":function(d){return "figur"},
"alienInvasion":function(d){return "Utomjordisk Invasion!"},
"backgroundBlack":function(d){return "svart"},
"backgroundCave":function(d){return "grotta"},
"backgroundCloudy":function(d){return "molnigt"},
"backgroundHardcourt":function(d){return "hardcourt"},
"backgroundNight":function(d){return "natt"},
"backgroundUnderwater":function(d){return "undervattens"},
"backgroundCity":function(d){return "stad"},
"backgroundDesert":function(d){return "öken"},
"backgroundRainbow":function(d){return "regnbåge"},
"backgroundSoccer":function(d){return "fotboll"},
"backgroundSpace":function(d){return "utrymme"},
"backgroundTennis":function(d){return "tennis"},
"backgroundWinter":function(d){return "vinter"},
"catActions":function(d){return "Åtgärder"},
"catControl":function(d){return "loopar"},
"catEvents":function(d){return "Händelser"},
"catLogic":function(d){return "Logik"},
"catMath":function(d){return "Matte"},
"catProcedures":function(d){return "funktioner"},
"catText":function(d){return "text"},
"catVariables":function(d){return "variabler"},
"changeScoreTooltip":function(d){return "Öka eller minska poängantalet med ett poäng."},
"changeScoreTooltipK1":function(d){return "Öka poängantalet med ett poäng."},
"continue":function(d){return "Fortsätt"},
"decrementPlayerScore":function(d){return "ta bort ett poäng"},
"defaultSayText":function(d){return "skriv här"},
"emotion":function(d){return "humör"},
"finalLevel":function(d){return "Grattis! Du har löst det sista pusslet."},
"for":function(d){return "för"},
"hello":function(d){return "hej"},
"helloWorld":function(d){return "Hej Världen!"},
"incrementPlayerScore":function(d){return "poäng punkt"},
"makeProjectileDisappear":function(d){return "försvinna"},
"makeProjectileBounce":function(d){return "studsa"},
"makeProjectileBlueFireball":function(d){return "skapa ett blått eldklot"},
"makeProjectilePurpleFireball":function(d){return "skapa ett lila eldklot"},
"makeProjectileRedFireball":function(d){return "skapa ett rött eldklot"},
"makeProjectileYellowHearts":function(d){return "skapa gula hjärtan"},
"makeProjectilePurpleHearts":function(d){return "skapa lila hjärtan"},
"makeProjectileRedHearts":function(d){return "skapa röda hjärtan"},
"makeProjectileTooltip":function(d){return "Gör så att projektilen som just kolliderade försvinner eller studsar."},
"makeYourOwn":function(d){return "Gör din egen Play Lab App"},
"moveDirectionDown":function(d){return "ner"},
"moveDirectionLeft":function(d){return "vänster"},
"moveDirectionRight":function(d){return "höger"},
"moveDirectionUp":function(d){return "upp"},
"moveDirectionRandom":function(d){return "slumpad"},
"moveDistance25":function(d){return "25 pixlar"},
"moveDistance50":function(d){return "50 pixlar"},
"moveDistance100":function(d){return "100 pixlar"},
"moveDistance200":function(d){return "200 pixlar"},
"moveDistance400":function(d){return "400 pixlar"},
"moveDistancePixels":function(d){return "pixlar"},
"moveDistanceRandom":function(d){return "slumpade pixlar"},
"moveDistanceTooltip":function(d){return "Flytta en figur en specifik sträcka i angiven riktning."},
"moveSprite":function(d){return "flytta"},
"moveSpriteN":function(d){return "flytta spelkaraktären "+appLocale.v(d,"spriteIndex")},
"toXY":function(d){return "to x,y"},
"moveDown":function(d){return "flytta neråt"},
"moveDownTooltip":function(d){return "Flytta en spelkaraktär nedåt."},
"moveLeft":function(d){return "flytta vänster"},
"moveLeftTooltip":function(d){return "Flytta en spelkaraktär till vänster."},
"moveRight":function(d){return "flytta höger"},
"moveRightTooltip":function(d){return "Flytta en spelkaraktär till höger."},
"moveUp":function(d){return "flytta uppåt"},
"moveUpTooltip":function(d){return "Flytta en spelkaraktär uppåt."},
"moveTooltip":function(d){return "Flytta en spelkaraktär."},
"nextLevel":function(d){return "Grattis! Du har slutfört detta pusslet."},
"no":function(d){return "Nej"},
"numBlocksNeeded":function(d){return "Detta pusslet kan lösas med %1 block."},
"onEventTooltip":function(d){return "Execute code in response to the specified event."},
"ouchExclamation":function(d){return "Aj!"},
"playSoundCrunch":function(d){return "spela krossa ljud"},
"playSoundGoal1":function(d){return "spela mål 1 ljud"},
"playSoundGoal2":function(d){return "spela mål 2 ljud"},
"playSoundHit":function(d){return "spela träffljud"},
"playSoundLosePoint":function(d){return "spela förlora poäng ljud"},
"playSoundLosePoint2":function(d){return "spela förlora poäng 2 ljud"},
"playSoundRetro":function(d){return "spela retro-ljud"},
"playSoundRubber":function(d){return "spela gummi-ljud"},
"playSoundSlap":function(d){return "spela klappljud"},
"playSoundTooltip":function(d){return "Spela det valda ljudet."},
"playSoundWinPoint":function(d){return "spela ljudet för vinn-punkten"},
"playSoundWinPoint2":function(d){return "spela ljudet för vinn-punkt 2"},
"playSoundWood":function(d){return "spela träljud"},
"positionOutTopLeft":function(d){return "till ovanstående övre vänster position"},
"positionOutTopRight":function(d){return "till ovanstående övre höger position"},
"positionTopOutLeft":function(d){return "till övre ytter vänster position"},
"positionTopLeft":function(d){return "till övre vänster position"},
"positionTopCenter":function(d){return "till övre mitt position"},
"positionTopRight":function(d){return "till övre höger position"},
"positionTopOutRight":function(d){return "till övre ytter höger position"},
"positionMiddleLeft":function(d){return "till vänster om mitten position"},
"positionMiddleCenter":function(d){return "till mitt position"},
"positionMiddleRight":function(d){return "till höger om mitten position"},
"positionBottomOutLeft":function(d){return "till nedre ytter vänster position"},
"positionBottomLeft":function(d){return "till nedre vänster position"},
"positionBottomCenter":function(d){return "till nedre mitt position"},
"positionBottomRight":function(d){return "till nedre höger position"},
"positionBottomOutRight":function(d){return "till nedre ytter höger position"},
"positionOutBottomLeft":function(d){return "till nedanför botten vänster position"},
"positionOutBottomRight":function(d){return "till nedanför botten höger position"},
"positionRandom":function(d){return "till den slumpmässga positionen"},
"projectileBlueFireball":function(d){return "blått eldklot"},
"projectilePurpleFireball":function(d){return "lila eldklot"},
"projectileRedFireball":function(d){return "rött eldklot"},
"projectileYellowHearts":function(d){return "gula hjärtan"},
"projectilePurpleHearts":function(d){return "lila hjärtan"},
"projectileRedHearts":function(d){return "röda hjärtan"},
"projectileRandom":function(d){return "slumpad"},
"projectileAnna":function(d){return "Anna"},
"projectileElsa":function(d){return "Elsa"},
"projectileHiro":function(d){return "Hiro"},
"projectileBaymax":function(d){return "Baymax"},
"projectileRapunzel":function(d){return "Rapunzel"},
"projectileCherry":function(d){return "cherry"},
"projectileIce":function(d){return "ice"},
"projectileDuck":function(d){return "duck"},
"reinfFeedbackMsg":function(d){return "Du kan trycka på \"Försök igen\"-knappen för att gå tillbaka och spela din berättelse."},
"repeatForever":function(d){return "upprepa för evigt"},
"repeatDo":function(d){return "gör"},
"repeatForeverTooltip":function(d){return "Utför åtgärder i detta block upprepade gånger medan historien är igång."},
"saySprite":function(d){return "säg"},
"saySpriteN":function(d){return "figur "+appLocale.v(d,"spriteIndex")+" säger"},
"saySpriteTooltip":function(d){return "Låter en pratbubbla dyka upp med texten från den angivna figuren."},
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
"saySpriteChoices_16":function(d){return "Ja"},
"saySpriteChoices_17":function(d){return "Nej"},
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
"scoreText":function(d){return "Poäng: "+appLocale.v(d,"playerScore")},
"setBackground":function(d){return "sätt bakgrund"},
"setBackgroundRandom":function(d){return "Ange slumpmässig bakgrund"},
"setBackgroundBlack":function(d){return "Ange svart bakgrund"},
"setBackgroundCave":function(d){return "Ange grott- bakgrund"},
"setBackgroundCloudy":function(d){return "Ange molnig bakgrund"},
"setBackgroundHardcourt":function(d){return "Ange hardcourt bakgrund"},
"setBackgroundNight":function(d){return "Ange natt -bakgrund"},
"setBackgroundUnderwater":function(d){return "Ange undervattens-bakgrund"},
"setBackgroundCity":function(d){return "Ange stads- bakgrund"},
"setBackgroundDesert":function(d){return "Ange öken- bakgrund"},
"setBackgroundRainbow":function(d){return "Ange regnbågs-bakgrund"},
"setBackgroundSoccer":function(d){return "Ange fotbolls- bakgrund"},
"setBackgroundSpace":function(d){return "Ange rymd-bakgrund"},
"setBackgroundTennis":function(d){return "Ange tennis- bakgrund"},
"setBackgroundWinter":function(d){return "Ange  vinter- bakgrund"},
"setBackgroundLeafy":function(d){return "set leafy background"},
"setBackgroundGrassy":function(d){return "set grassy background"},
"setBackgroundFlower":function(d){return "set flower background"},
"setBackgroundTile":function(d){return "set tile background"},
"setBackgroundIcy":function(d){return "set icy background"},
"setBackgroundSnowy":function(d){return "set snowy background"},
"setBackgroundTooltip":function(d){return "Ange bakgrundsbild"},
"setEnemySpeed":function(d){return "Ange fiendens hastighet"},
"setPlayerSpeed":function(d){return "Ange spelarens hastighet"},
"setScoreText":function(d){return "anger poäng"},
"setScoreTextTooltip":function(d){return "Anger texten som ska visas i området poäng."},
"setSpriteEmotionAngry":function(d){return "till  argt humör"},
"setSpriteEmotionHappy":function(d){return "till glad stämning"},
"setSpriteEmotionNormal":function(d){return "till normal stämning"},
"setSpriteEmotionRandom":function(d){return "till slumpmässig stämning"},
"setSpriteEmotionSad":function(d){return "till ledsam stämning"},
"setSpriteEmotionTooltip":function(d){return "anger figurens stämning"},
"setSpriteAlien":function(d){return "till en utomjordings- bild"},
"setSpriteBat":function(d){return "i en fladdermus-bild"},
"setSpriteBird":function(d){return "till en fågel bild"},
"setSpriteCat":function(d){return "till en katt-bild"},
"setSpriteCaveBoy":function(d){return "till en grottpojke- bild"},
"setSpriteCaveGirl":function(d){return "till en grottflicka- bild"},
"setSpriteDinosaur":function(d){return "till en dinosaurie-bild"},
"setSpriteDog":function(d){return "att en hund bild"},
"setSpriteDragon":function(d){return "till en drak- bild"},
"setSpriteGhost":function(d){return "till en spök-bild"},
"setSpriteHidden":function(d){return "till en dold bild"},
"setSpriteHideK1":function(d){return "göm"},
"setSpriteAnna":function(d){return "till en Anna bild"},
"setSpriteElsa":function(d){return "till en Elsa bild"},
"setSpriteHiro":function(d){return "till en Hiro bild"},
"setSpriteBaymax":function(d){return "till en Baymax bild"},
"setSpriteRapunzel":function(d){return "till en Rapunzel bild"},
"setSpriteKnight":function(d){return "till en riddar- bild"},
"setSpriteMonster":function(d){return "till en monster-bild"},
"setSpriteNinja":function(d){return "till en maskerad ninja bild"},
"setSpriteOctopus":function(d){return "till en bläckfisk- bild"},
"setSpritePenguin":function(d){return "till en pingvin -bild"},
"setSpritePirate":function(d){return "till en pirat-bild"},
"setSpritePrincess":function(d){return "till en prinsess-bild"},
"setSpriteRandom":function(d){return "till en slumpmässig bild"},
"setSpriteRobot":function(d){return "till en robotbild"},
"setSpriteShowK1":function(d){return "visa"},
"setSpriteSpacebot":function(d){return "till en rymdrobot-bild"},
"setSpriteSoccerGirl":function(d){return "till en fotbollsflicka -bild"},
"setSpriteSoccerBoy":function(d){return "till en fotbollspojke-bild"},
"setSpriteSquirrel":function(d){return "till en ekorr-bild"},
"setSpriteTennisGirl":function(d){return "till en tennisflicka- bild"},
"setSpriteTennisBoy":function(d){return "till en tennispojke- bild"},
"setSpriteUnicorn":function(d){return "till en enhörning-bild"},
"setSpriteWitch":function(d){return "till en häx-bild"},
"setSpriteWizard":function(d){return "till en trollkarls-bild"},
"setSpritePositionTooltip":function(d){return "Omedelbart flyttar en figur till den angivna platsen."},
"setSpriteK1Tooltip":function(d){return "Visar eller döljer angiven figur."},
"setSpriteTooltip":function(d){return "Anger figurens bild"},
"setSpriteSizeRandom":function(d){return "till en slumpmässig storlek"},
"setSpriteSizeVerySmall":function(d){return "till en mycket liten storlek"},
"setSpriteSizeSmall":function(d){return "till en liten storlek"},
"setSpriteSizeNormal":function(d){return "till en normal storlek"},
"setSpriteSizeLarge":function(d){return "till en stor storlek"},
"setSpriteSizeVeryLarge":function(d){return "till en mycket stor storlek"},
"setSpriteSizeTooltip":function(d){return "Anger storleken på en figur"},
"setSpriteSpeedRandom":function(d){return "till en slumpad hastighet"},
"setSpriteSpeedVerySlow":function(d){return "till en mycket långsam hastighet"},
"setSpriteSpeedSlow":function(d){return "till en långsam hastighet"},
"setSpriteSpeedNormal":function(d){return "till en normal hastighet"},
"setSpriteSpeedFast":function(d){return "till en snabb hastighet"},
"setSpriteSpeedVeryFast":function(d){return "till en mycket snabb hastighet"},
"setSpriteSpeedTooltip":function(d){return "Anger hastigheten på en figur"},
"setSpriteZombie":function(d){return "till en zombie-bild"},
"shareStudioTwitter":function(d){return "Kolla in  berättelsen som jag har gjort. Jag skrev den själv med @codeorg"},
"shareGame":function(d){return "Dela din berättelse:"},
"showCoordinates":function(d){return "Visa koordinater"},
"showCoordinatesTooltip":function(d){return "Visa huvudpersonens koordinater på skärmen"},
"showTitleScreen":function(d){return "Visa titelskärmen"},
"showTitleScreenTitle":function(d){return "titel"},
"showTitleScreenText":function(d){return "text"},
"showTSDefTitle":function(d){return "skriv titelnhär"},
"showTSDefText":function(d){return "Skriv text här"},
"showTitleScreenTooltip":function(d){return "Visa en titelskärm med tillhörande rubrik och text."},
"size":function(d){return "storlek"},
"setSprite":function(d){return "Välj"},
"setSpriteN":function(d){return "ange figur "+appLocale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "krasch"},
"soundGoal1":function(d){return "mål 1"},
"soundGoal2":function(d){return "mål 2"},
"soundHit":function(d){return "träff"},
"soundLosePoint":function(d){return "förlora punkt"},
"soundLosePoint2":function(d){return "förlora punkt 2"},
"soundRetro":function(d){return "retro"},
"soundRubber":function(d){return "gummi"},
"soundSlap":function(d){return "slå"},
"soundWinPoint":function(d){return "vinna punkt"},
"soundWinPoint2":function(d){return "vinna punkt 2"},
"soundWood":function(d){return "trä"},
"speed":function(d){return "hastighet"},
"startSetValue":function(d){return "start (rocket-height function)"},
"startSetVars":function(d){return "game_vars (title, subtitle, background, target, danger, player)"},
"startSetFuncs":function(d){return "game_funcs (update-target, update-danger, update-player, collide?, on-screen?)"},
"stopSprite":function(d){return "stanna"},
"stopSpriteN":function(d){return "stoppa figur "+appLocale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Stoppar en figurs rörelse."},
"throwSprite":function(d){return "kasta"},
"throwSpriteN":function(d){return "figur"+appLocale.v(d,"spriteIndex")+" kasta"},
"throwTooltip":function(d){return "Kastar en projektil från den angivna figuren."},
"vanish":function(d){return "försvinna"},
"vanishActorN":function(d){return "figur försvinner "+appLocale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "Låter figuren försvinna."},
"waitFor":function(d){return "vänta i"},
"waitSeconds":function(d){return "sekunder"},
"waitForClick":function(d){return "vänta på klick"},
"waitForRandom":function(d){return "vänta i slumpmässig tidsperiod"},
"waitForHalfSecond":function(d){return "vänta en halv sekund"},
"waitFor1Second":function(d){return "vänta i 1 sekund"},
"waitFor2Seconds":function(d){return "vänta 2 sekunder"},
"waitFor5Seconds":function(d){return "vänta i 5 sekunder"},
"waitFor10Seconds":function(d){return "vänta i 10 sekunder"},
"waitParamsTooltip":function(d){return "Vänta i ett angivet antal sekunder eller använd noll för att vänta tills ett klick sker."},
"waitTooltip":function(d){return "Vänta i en viss tid eller tills ett klick sker."},
"whenArrowDown":function(d){return "pil ner"},
"whenArrowLeft":function(d){return "vänster pil"},
"whenArrowRight":function(d){return "höger pil"},
"whenArrowUp":function(d){return "pil upp"},
"whenArrowTooltip":function(d){return "Utför åtgärderna nedan när den angivna piltangenten trycks."},
"whenDown":function(d){return "när pil nedåt"},
"whenDownTooltip":function(d){return "Utföra åtgärderna nedan när NEDPIL trycks."},
"whenGameStarts":function(d){return "När berättelsen börjar"},
"whenGameStartsTooltip":function(d){return "Utför åtgärderna nedan när berättelsen börjar."},
"whenLeft":function(d){return "när pil vänster"},
"whenLeftTooltip":function(d){return "Utföra åtgärderna nedan när du trycker på VÄNSTERPIL."},
"whenRight":function(d){return "när pil höger"},
"whenRightTooltip":function(d){return "Utföra åtgärderna nedan när du trycker på HÖGERPIL."},
"whenSpriteClicked":function(d){return "När figuren klickas"},
"whenSpriteClickedN":function(d){return "När figuren"+appLocale.v(d,"spriteIndex")+" klickas"},
"whenSpriteClickedTooltip":function(d){return "Utför åtgärderna nedan när en figur klickas."},
"whenSpriteCollidedN":function(d){return "När figur "+appLocale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "Utför åtgärderna nedan när en figur vidrör en annan figur."},
"whenSpriteCollidedWith":function(d){return "berör"},
"whenSpriteCollidedWithAnyActor":function(d){return "berör vilken figur som helst"},
"whenSpriteCollidedWithAnyEdge":function(d){return "berör vilken kant som helst"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "berör vilken projektil som helst"},
"whenSpriteCollidedWithAnything":function(d){return "vidrör något"},
"whenSpriteCollidedWithN":function(d){return "berör figur "+appLocale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "berör blå eldboll"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "berör lila eldboll"},
"whenSpriteCollidedWithRedFireball":function(d){return "berör röd eldboll"},
"whenSpriteCollidedWithYellowHearts":function(d){return "berör gula hjärtan"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "berör lila hjärtan"},
"whenSpriteCollidedWithRedHearts":function(d){return "berör röda hjärtan"},
"whenSpriteCollidedWithBottomEdge":function(d){return "berör nedre kant"},
"whenSpriteCollidedWithLeftEdge":function(d){return "berör vänster kant"},
"whenSpriteCollidedWithRightEdge":function(d){return "berör höger kant"},
"whenSpriteCollidedWithTopEdge":function(d){return "berör översta kanten"},
"whenUp":function(d){return "när pil upp"},
"whenUpTooltip":function(d){return "Utför handlingarna nedan när pil-upptangenten trycks ner."},
"yes":function(d){return "Ja"}};