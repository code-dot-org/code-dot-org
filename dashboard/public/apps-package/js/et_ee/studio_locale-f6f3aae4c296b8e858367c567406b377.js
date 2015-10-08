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
"actor":function(d){return "tegelaskuju"},
"addItems1":function(d){return "lisa ühte tüüpi ese"},
"addItems2":function(d){return "lisa 2 sama tüüpi eset"},
"addItems3":function(d){return "lisa 3 sama tüüpi eset"},
"addItems5":function(d){return "lisa 5 sama tüüpi eset"},
"addItems10":function(d){return "lisa 10 sama tüüpi eset"},
"addItemsRandom":function(d){return "lisa erinevaid tüüpi esemeid"},
"addItemsTooltip":function(d){return "Lisa esemeid stseeni."},
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
"dropletBlock_addItemsToScene_description":function(d){return "Add new items to the scene."},
"dropletBlock_addItemsToScene_param0":function(d){return "type"},
"dropletBlock_addItemsToScene_param0_description":function(d){return "The type of items to be added ('item_walk_item1', 'item_walk_item2', 'item_walk_item3', or ''item_walk_item4'."},
"dropletBlock_addItemsToScene_param1":function(d){return "count"},
"dropletBlock_addItemsToScene_param1_description":function(d){return "The number of items to add."},
"dropletBlock_changeScore_description":function(d){return "Lisa või lahuta tulemuselt üks punkt."},
"dropletBlock_changeScore_param0":function(d){return "tulemus"},
"dropletBlock_changeScore_param0_description":function(d){return "The value to add to the score (negative values will reduce the score)."},
"dropletBlock_moveEast_description":function(d){return "Moves the character to the east."},
"dropletBlock_moveNorth_description":function(d){return "Moves the character to the north."},
"dropletBlock_moveSouth_description":function(d){return "Moves the character to the south."},
"dropletBlock_moveWest_description":function(d){return "Moves the character to the west."},
"dropletBlock_playSound_description":function(d){return "Lase valitud heli."},
"dropletBlock_playSound_param0":function(d){return "sound"},
"dropletBlock_playSound_param0_description":function(d){return "The name of the sound to play."},
"dropletBlock_setBackground_description":function(d){return "Valib taustapildi"},
"dropletBlock_setBackground_param0":function(d){return "image"},
"dropletBlock_setBackground_param0_description":function(d){return "The name of the background theme ('background1', 'background2', or 'background3')."},
"dropletBlock_setItemActivity_description":function(d){return "Sets the activity mode for a set of items."},
"dropletBlock_setItemActivity_param0":function(d){return "type"},
"dropletBlock_setItemActivity_param0_description":function(d){return "The type of items to be changed ('item_walk_item1', 'item_walk_item2', 'item_walk_item3', or ''item_walk_item4'."},
"dropletBlock_setItemActivity_param1":function(d){return "activity"},
"dropletBlock_setItemActivity_param1_description":function(d){return "The name of the activity mode ('patrol', 'chase', 'flee', or 'none')."},
"dropletBlock_setItemSpeed_description":function(d){return "Sets the speed for a set of items."},
"dropletBlock_setItemSpeed_param0":function(d){return "type"},
"dropletBlock_setItemSpeed_param0_description":function(d){return "The type of items to be changed ('item_walk_item1', 'item_walk_item2', 'item_walk_item3', or ''item_walk_item4'."},
"dropletBlock_setItemSpeed_param1":function(d){return "kiirus"},
"dropletBlock_setItemSpeed_param1_description":function(d){return "The speed value (2, 3, 5, 8, or 12)."},
"dropletBlock_setCharacter_description":function(d){return "Sets the character image."},
"dropletBlock_setCharacter_param0":function(d){return "image"},
"dropletBlock_setCharacter_param0_description":function(d){return "The name of the character image ('character1' or 'character2')."},
"dropletBlock_setCharacterSpeed_description":function(d){return "Sets the character speed."},
"dropletBlock_setCharacterSpeed_param0":function(d){return "kiirus"},
"dropletBlock_setCharacterSpeed_param0_description":function(d){return "The speed value (2, 3, 5, 8, or 12)."},
"dropletBlock_setSpriteEmotion_description":function(d){return "Määrab näitleja meeleolu"},
"dropletBlock_setSpritePosition_description":function(d){return "Liigutab tegelase koheselt määratud suunas."},
"dropletBlock_setSpriteSpeed_description":function(d){return "Määrab tegelase kiiruse"},
"dropletBlock_setSprite_description":function(d){return "Määrab tegelase pildi"},
"dropletBlock_setSprite_param0":function(d){return "index"},
"dropletBlock_setSprite_param0_description":function(d){return "The index (starting at 0) indicating which actor should change."},
"dropletBlock_setSprite_param1":function(d){return "image"},
"dropletBlock_setSprite_param1_description":function(d){return "The name of the actor image."},
"dropletBlock_setWalls_description":function(d){return "Changes the walls in the scene."},
"dropletBlock_setWalls_param0":function(d){return "name"},
"dropletBlock_setWalls_param0_description":function(d){return "The name of the wall set ('border', 'maze', 'maze2', 'default', or 'hidden')."},
"dropletBlock_throw_description":function(d){return "Määratud tegelane viskab määratud asja."},
"dropletBlock_vanish_description":function(d){return "Kaotab tegelase."},
"dropletBlock_whenDown_description":function(d){return "This function executes when the down button is pressed."},
"dropletBlock_whenLeft_description":function(d){return "This function executes when the left button is pressed."},
"dropletBlock_whenRight_description":function(d){return "This function executes when the right button is pressed."},
"dropletBlock_whenTouchItem_description":function(d){return "This function executes when the character touches any item."},
"dropletBlock_whenTouchWall_description":function(d){return "This function executes when the character touches any wall."},
"dropletBlock_whenTouchWalkItem1_description":function(d){return "This function executes when the character touches items with type 'item_walk_item1'."},
"dropletBlock_whenTouchWalkItem2_description":function(d){return "This function executes when the character touches items with type 'item_walk_item2'."},
"dropletBlock_whenTouchWalkItem3_description":function(d){return "This function executes when the character touches items with type 'item_walk_item3'."},
"dropletBlock_whenTouchWalkItem4_description":function(d){return "This function executes when the character touches items with type 'item_walk_item4'."},
"dropletBlock_whenUp_description":function(d){return "This function executes when the up button is pressed."},
"emotion":function(d){return "tuju"},
"finalLevel":function(d){return "Tubli! Sa lahendasid viimase mõistatuse."},
"for":function(d){return " "},
"hello":function(d){return "tere"},
"helloWorld":function(d){return "Tere, Maailm!"},
"incrementPlayerScore":function(d){return "lisa punkt"},
"itemBlueFireball":function(d){return "sinine tulekera"},
"itemPurpleFireball":function(d){return "lilla tulekera"},
"itemRedFireball":function(d){return "punane tulekera"},
"itemYellowHearts":function(d){return "kollased südamed"},
"itemPurpleHearts":function(d){return "lillad südamed"},
"itemRedHearts":function(d){return "punased südamed"},
"itemRandom":function(d){return "juhuslik"},
"itemAnna":function(d){return "konks"},
"itemElsa":function(d){return "sparkle"},
"itemHiro":function(d){return "mikrobotid"},
"itemBaymax":function(d){return "rakett"},
"itemRapunzel":function(d){return "kastrul"},
"itemCherry":function(d){return "kirss"},
"itemIce":function(d){return "jää"},
"itemDuck":function(d){return "part"},
"itemItem1":function(d){return "Item1"},
"itemItem2":function(d){return "Item2"},
"itemItem3":function(d){return "Item3"},
"itemItem4":function(d){return "Item4"},
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
"moveSpriteN":function(d){return "liiguta tegelast"+studio_locale.v(d,"spriteIndex")},
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
"projectileHiro":function(d){return "mikrobotid"},
"projectileBaymax":function(d){return "rakett"},
"projectileRapunzel":function(d){return "kastrul"},
"projectileCherry":function(d){return "kirss"},
"projectileIce":function(d){return "jää"},
"projectileDuck":function(d){return "part"},
"reinfFeedbackMsg":function(d){return "Võite vajutada nuppu \"Jätka Mängimist\", et naaseda loo mängimise juurde."},
"repeatForever":function(d){return "korda igavesti"},
"repeatDo":function(d){return "täida"},
"repeatForeverTooltip":function(d){return "Käivita tegevusi selles plokis korduvalt, samal ajal kui lugu käib."},
"saySprite":function(d){return "ütle"},
"saySpriteN":function(d){return "tegelane "+studio_locale.v(d,"spriteIndex")+" ütleb"},
"saySpriteTooltip":function(d){return "Pop up a speech bubble with the associated text from the specified actor."},
"saySpriteChoices_0":function(d){return "Hei sina."},
"saySpriteChoices_1":function(d){return "Tere kõigile."},
"saySpriteChoices_2":function(d){return "Kuidas sul läheb?"},
"saySpriteChoices_3":function(d){return "Tere hommikust"},
"saySpriteChoices_4":function(d){return "Tere päevast"},
"saySpriteChoices_5":function(d){return "Head ööd"},
"saySpriteChoices_6":function(d){return "Tere õhtust"},
"saySpriteChoices_7":function(d){return "Mis uut?"},
"saySpriteChoices_8":function(d){return "Mis?"},
"saySpriteChoices_9":function(d){return "Kus?"},
"saySpriteChoices_10":function(d){return "Kuna?"},
"saySpriteChoices_11":function(d){return "Hea."},
"saySpriteChoices_12":function(d){return "Suurepärane!"},
"saySpriteChoices_13":function(d){return "Hästi."},
"saySpriteChoices_14":function(d){return "Pole paha."},
"saySpriteChoices_15":function(d){return "Edu."},
"saySpriteChoices_16":function(d){return "Jah"},
"saySpriteChoices_17":function(d){return "Ei"},
"saySpriteChoices_18":function(d){return "Okei"},
"saySpriteChoices_19":function(d){return "Kena vise!"},
"saySpriteChoices_20":function(d){return "Head päeva."},
"saySpriteChoices_21":function(d){return "Tsau."},
"saySpriteChoices_22":function(d){return "Ma tulen kohe tagasi."},
"saySpriteChoices_23":function(d){return "Homme näeme!"},
"saySpriteChoices_24":function(d){return "Hiljem näeme!"},
"saySpriteChoices_25":function(d){return "Hoia ennast!"},
"saySpriteChoices_26":function(d){return "Naudi!"},
"saySpriteChoices_27":function(d){return "Pean minema."},
"saySpriteChoices_28":function(d){return "Tahad olla sõber?"},
"saySpriteChoices_29":function(d){return "Hästi tehtud!"},
"saySpriteChoices_30":function(d){return "Woo hoo!"},
"saySpriteChoices_31":function(d){return "Jee!"},
"saySpriteChoices_32":function(d){return "Tore sinuga tutvuda."},
"saySpriteChoices_33":function(d){return "Hästi!"},
"saySpriteChoices_34":function(d){return "Aitäh"},
"saySpriteChoices_35":function(d){return "Ei, tänan"},
"saySpriteChoices_36":function(d){return "Aaaaaah!"},
"saySpriteChoices_37":function(d){return "Ükskõik"},
"saySpriteChoices_38":function(d){return "Täna"},
"saySpriteChoices_39":function(d){return "Homme"},
"saySpriteChoices_40":function(d){return "Eile"},
"saySpriteChoices_41":function(d){return "Ma leidsin su!"},
"saySpriteChoices_42":function(d){return "Leidsid mu üles!"},
"saySpriteChoices_43":function(d){return "10, 9, 8, 7, 6, 5, 4, 3, 2, 1!"},
"saySpriteChoices_44":function(d){return "Sa oled suurepärane!"},
"saySpriteChoices_45":function(d){return "Sa oled naljakas!"},
"saySpriteChoices_46":function(d){return "Sa oled rumal! "},
"saySpriteChoices_47":function(d){return "Sa oled hea sõber!"},
"saySpriteChoices_48":function(d){return "Vaata ette!"},
"saySpriteChoices_49":function(d){return "Kummardu!"},
"saySpriteChoices_50":function(d){return "Kätte sain!"},
"saySpriteChoices_51":function(d){return "Ai!"},
"saySpriteChoices_52":function(d){return "Vabandust!"},
"saySpriteChoices_53":function(d){return "Ettevaatust!"},
"saySpriteChoices_54":function(d){return "Vau!"},
"saySpriteChoices_55":function(d){return "Uups!"},
"saySpriteChoices_56":function(d){return "Peaaegu said mu kätte!"},
"saySpriteChoices_57":function(d){return "Hea üritus!"},
"saySpriteChoices_58":function(d){return "Sa ei saa mind kätte!"},
"scoreText":function(d){return "Tulemus: "+studio_locale.v(d,"playerScore")},
"setActivityRandom":function(d){return "set activity to random for"},
"setActivityPatrol":function(d){return "set activity to patrol for"},
"setActivityChase":function(d){return "set activity to chase for"},
"setActivityFlee":function(d){return "set activity to flee for"},
"setActivityNone":function(d){return "set activity to none for"},
"setActivityTooltip":function(d){return "Sets the activity for a set of items"},
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
"setBackgroundBackground1":function(d){return "set background1 background"},
"setBackgroundBackground2":function(d){return "set background2 background"},
"setBackgroundBackground3":function(d){return "set background3 background"},
"setBackgroundTooltip":function(d){return "Valib taustapildi"},
"setEnemySpeed":function(d){return "sea vaenlase kiirus"},
"setItemSpeedSet":function(d){return "set type"},
"setItemSpeedTooltip":function(d){return "Sets the speed for a set of items"},
"setPlayerSpeed":function(d){return "sea mängija kiirus"},
"setScoreText":function(d){return "määra skoor"},
"setScoreTextTooltip":function(d){return "Määrab teksti, mis kuvatakse skoori alal."},
"setSpriteEmotionAngry":function(d){return "vihasesse meeleollu"},
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
"setSpriteAnna":function(d){return "Anna pildile"},
"setSpriteElsa":function(d){return "Elsa pildile"},
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
"setSpriteCharacter1":function(d){return "to character1"},
"setSpriteCharacter2":function(d){return "to character2"},
"setWalls":function(d){return "set walls"},
"setWallsHidden":function(d){return "set hidden walls"},
"setWallsRandom":function(d){return "set random walls"},
"setWallsBorder":function(d){return "set border walls"},
"setWallsDefault":function(d){return "set default walls"},
"setWallsMaze":function(d){return "set maze walls"},
"setWallsMaze2":function(d){return "set maze2 walls"},
"setWallsTooltip":function(d){return "Changes the walls in the scene"},
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
"setSpriteN":function(d){return "Sea tegelane "+studio_locale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "purustama"},
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
"stopSpriteN":function(d){return "peata tegelane "+studio_locale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Peata tegelase liikumine."},
"throwSprite":function(d){return "viska"},
"throwSpriteN":function(d){return "tegelane "+studio_locale.v(d,"spriteIndex")+" viskab"},
"throwTooltip":function(d){return "Määratud tegelane viskab määratud asja."},
"vanish":function(d){return "kaob"},
"vanishActorN":function(d){return "kaota tegelane "+studio_locale.v(d,"spriteIndex")},
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
"whenSpriteClickedN":function(d){return "kui tegelast "+studio_locale.v(d,"spriteIndex")+" klikitakse"},
"whenSpriteClickedTooltip":function(d){return "Käivita järgnevad tegevused kui tegelast klikitakse."},
"whenSpriteCollidedN":function(d){return "kui näitleja "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "Käivita järgnevad tegevused kui üks tegelane puudutab teist tegelast."},
"whenSpriteCollidedWith":function(d){return "puudutab"},
"whenSpriteCollidedWithAnyActor":function(d){return "puudutab mõnda tegelast"},
"whenSpriteCollidedWithAnyEdge":function(d){return "puudutab mõnda serva"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "puudutab mõnda lendavat osakest"},
"whenSpriteCollidedWithAnything":function(d){return "puudutab ükskõik mida"},
"whenSpriteCollidedWithN":function(d){return "puudutab tegelast "+studio_locale.v(d,"spriteIndex")},
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
"whenTouchItem":function(d){return "when item touched"},
"whenTouchItemTooltip":function(d){return "Execute the actions below when the actor touches an item."},
"whenTouchWall":function(d){return "when wall touched"},
"whenTouchWallTooltip":function(d){return "Execute the actions below when the actor touches a wall."},
"whenUp":function(d){return "kui vajutatakse ülesnoolt"},
"whenUpTooltip":function(d){return "Täida allolevad käsud, kui vajutatakse ülesnoolt."},
"yes":function(d){return "Jah"},
"addCharacter":function(d){return "add a"},
"addCharacterTooltip":function(d){return "Add a character to the scene."},
"dropletBlock_addCharacter_description":function(d){return "Add a character to the scene."},
"dropletBlock_addCharacter_param0":function(d){return "type"},
"dropletBlock_addCharacter_param0_description":function(d){return "The type of the character to be added ('man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_moveRight_description":function(d){return "Moves the character to the right."},
"dropletBlock_moveUp_description":function(d){return "Moves the character up."},
"dropletBlock_moveDown_description":function(d){return "Moves the character down."},
"dropletBlock_moveLeft_description":function(d){return "Moves the character left."},
"dropletBlock_moveSlow_description":function(d){return "Changes a set of characters to move slow."},
"dropletBlock_moveSlow_param0":function(d){return "type"},
"dropletBlock_moveSlow_param0_description":function(d){return "The type of characters to be changed ('man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_moveNormal_description":function(d){return "Changes a set of characters to move at a normal speed."},
"dropletBlock_moveNormal_param0":function(d){return "type"},
"dropletBlock_moveNormal_param0_description":function(d){return "The type of characters to be changed ('man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_moveFast_description":function(d){return "Changes a set of characters to move fast."},
"dropletBlock_moveFast_param0":function(d){return "type"},
"dropletBlock_moveFast_param0_description":function(d){return "The type of characters to be changed ('man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_setBot_description":function(d){return "Changes the active bot."},
"dropletBlock_setBot_param0":function(d){return "image"},
"dropletBlock_setBot_param0_description":function(d){return "The name of the bot image ('bot1' or 'bot2')."},
"dropletBlock_setBotSpeed_description":function(d){return "Sets the bot speed."},
"dropletBlock_setBotSpeed_param0":function(d){return "speed"},
"dropletBlock_setBotSpeed_param0_description":function(d){return "The speed value ('slow', 'normal', or 'fast')."},
"dropletBlock_setToChase_description":function(d){return "Changes a set of characters to chase the bot."},
"dropletBlock_setToChase_param0":function(d){return "type"},
"dropletBlock_setToChase_param0_description":function(d){return "The type of characters to be changed ('man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_setToFlee_description":function(d){return "Changes a set of characters to flee from the bot."},
"dropletBlock_setToFlee_param0":function(d){return "type"},
"dropletBlock_setToFlee_param0_description":function(d){return "The type of characters to be changed ('man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_setToRoam_description":function(d){return "Changes a set of characters to roam freely."},
"dropletBlock_setToRoam_param0":function(d){return "type"},
"dropletBlock_setToRoam_param0_description":function(d){return "The type of characters to be changed ('man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_setToStop_description":function(d){return "Changes a set of characters to stop moving."},
"dropletBlock_setToStop_param0":function(d){return "type"},
"dropletBlock_setToStop_param0_description":function(d){return "The type of characters to be changed ('man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_setMap_description":function(d){return "Changes the map in the scene."},
"dropletBlock_setMap_param0":function(d){return "name"},
"dropletBlock_setMap_param0_description":function(d){return "The name of the map ('blank', 'circle', 'circle2', 'horizontal', 'grid', or 'blobs')."},
"dropletBlock_whenTouchCharacter_description":function(d){return "This function executes when the character touches any item."},
"dropletBlock_whenTouchObstacle_description":function(d){return "This function executes when the character touches any obstacle."},
"dropletBlock_whenTouchMan_description":function(d){return "This function executes when the character touches items with type 'man'."},
"dropletBlock_whenTouchPilot_description":function(d){return "This function executes when the character touches items with type 'pilot'."},
"dropletBlock_whenTouchPig_description":function(d){return "This function executes when the character touches items with type 'pig'."},
"dropletBlock_whenTouchBird_description":function(d){return "This function executes when the character touches items with type 'bird'."},
"dropletBlock_whenTouchMouse_description":function(d){return "This function executes when the character touches items with type 'mouse'."},
"dropletBlock_whenTouchRoo_description":function(d){return "This function executes when the character touches items with type 'roo'."},
"dropletBlock_whenTouchSpider_description":function(d){return "This function executes when the character touches items with type 'spider'."},
"itemMan":function(d){return "man"},
"itemPilot":function(d){return "pilot"},
"itemPig":function(d){return "pig"},
"itemBird":function(d){return "bird"},
"itemMouse":function(d){return "mouse"},
"itemRoo":function(d){return "roo"},
"itemSpider":function(d){return "spider"},
"setActivityRoam":function(d){return "set activity to roam for"},
"setBackgroundForest":function(d){return "set forest background"},
"setBackgroundSnow":function(d){return "set snow background"},
"setBackgroundShip":function(d){return "set ship background"},
"setSpriteBot1":function(d){return "to bot1"},
"setSpriteBot2":function(d){return "to bot2"},
"setMap":function(d){return "set map"},
"setMapRandom":function(d){return "set random map"},
"setMapBlank":function(d){return "set blank map"},
"setMapCircle":function(d){return "set circle map"},
"setMapCircle2":function(d){return "set circle2 map"},
"setMapHorizontal":function(d){return "set horizontal map"},
"setMapGrid":function(d){return "set grid map"},
"setMapBlobs":function(d){return "set blobs map"},
"setMapTooltip":function(d){return "Changes the map in the scene"}};