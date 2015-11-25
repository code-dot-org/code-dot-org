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
"blockDestroyBlock":function(d){return "tuhoa kuutio"},
"blockIf":function(d){return "jos"},
"blockIfLavaAhead":function(d){return "jos laavaa edessä"},
"blockMoveForward":function(d){return "liiku eteenpäin"},
"blockPlaceTorch":function(d){return "aseta soihtu"},
"blockPlaceXAheadAhead":function(d){return "edessä"},
"blockPlaceXAheadPlace":function(d){return "aseta"},
"blockPlaceXPlace":function(d){return "aseta"},
"blockPlantCrop":function(d){return "istuta viljelykasvi"},
"blockShear":function(d){return "keritse"},
"blockTillSoil":function(d){return "maaperään asti"},
"blockTurnLeft":function(d){return "käänny vasempaan"},
"blockTurnRight":function(d){return "käänny oikeaan"},
"blockTypeBedrock":function(d){return "peruskallio"},
"blockTypeBricks":function(d){return "tiilet"},
"blockTypeClay":function(d){return "savi"},
"blockTypeClayHardened":function(d){return "kovettunut savi"},
"blockTypeCobblestone":function(d){return "mukulakivi"},
"blockTypeDirt":function(d){return "multa"},
"blockTypeDirtCoarse":function(d){return "karkea multa"},
"blockTypeEmpty":function(d){return "tyhjä"},
"blockTypeFarmlandWet":function(d){return "viljelysmaa"},
"blockTypeGlass":function(d){return "lasi"},
"blockTypeGrass":function(d){return "ruoho"},
"blockTypeGravel":function(d){return "sora"},
"blockTypeLava":function(d){return "laava"},
"blockTypeLogAcacia":function(d){return "akaasiatukki"},
"blockTypeLogBirch":function(d){return "koivutukki"},
"blockTypeLogJungle":function(d){return "viidakkopuutukki"},
"blockTypeLogOak":function(d){return "tammitukki"},
"blockTypeLogSpruce":function(d){return "kuusitukki"},
"blockTypeOreCoal":function(d){return "hiilimalmi"},
"blockTypeOreDiamond":function(d){return "timanttimalmi"},
"blockTypeOreEmerald":function(d){return "smaragdimalmi"},
"blockTypeOreGold":function(d){return "kultamalmi"},
"blockTypeOreIron":function(d){return "rautamalmi"},
"blockTypeOreLapis":function(d){return "lasuriittimalmi"},
"blockTypeOreRedstone":function(d){return "punakivimalmi"},
"blockTypePlanksAcacia":function(d){return "akaasialankut"},
"blockTypePlanksBirch":function(d){return "koivulankut"},
"blockTypePlanksJungle":function(d){return "viidakkopuulankut"},
"blockTypePlanksOak":function(d){return "tammilankut"},
"blockTypePlanksSpruce":function(d){return "kuusilankut"},
"blockTypeRail":function(d){return "raide"},
"blockTypeSand":function(d){return "hiekka"},
"blockTypeSandstone":function(d){return "hiekkakivi"},
"blockTypeStone":function(d){return "kivi"},
"blockTypeTnt":function(d){return "dynamiitti"},
"blockTypeTree":function(d){return "puu"},
"blockTypeWater":function(d){return "vesi"},
"blockTypeWool":function(d){return "villa"},
"blockWhileXAheadAhead":function(d){return "edessä"},
"blockWhileXAheadDo":function(d){return "tee"},
"blockWhileXAheadWhile":function(d){return "niin kauan kuin"},
"generatedCodeDescription":function(d){return "Raahamalla ja asettamalla palikat tähän tehtävään, olet luonut joukon ohjeita ohjelmointikielellä nimeltään JavaScript. Ohjelmakoodi kertoo tietokoneille mitä ruudulla tulisi näyttää. Kaikki mitä näet ja teet Minecraft:issä on toteutettu samantapaisilla koodiriveillä."},
"houseSelectChooseFloorPlan":function(d){return "Valitse talosi pohjapiirros."},
"houseSelectEasy":function(d){return "Helppo"},
"houseSelectHard":function(d){return "Vaikea"},
"houseSelectLetsBuild":function(d){return "Rakennetaan talo."},
"houseSelectMedium":function(d){return "Keskitaso"},
"keepPlayingButton":function(d){return "Jatka pelaamista"},
"level10FailureMessage":function(d){return "Peitä laava kävelläksesi toiselle puolelle, sitten louhi 2 rautamalmeista toisella puolella."},
"level11FailureMessage":function(d){return "Varmista että asetat mukulakiven eteesi jos edessäsi on laavaa. Se sallii sinun louhia turvallisesti tämän resurssirivin."},
"level12FailureMessage":function(d){return "Kaiva 3 punakivikuutiota. Tämä yhdistää mitä opit talosi rakentamisesta ja \"jos\"-lausekkeiden käyttämisestä siihen kuinka vältät laavaan putoamisen."},
"level13FailureMessage":function(d){return "Aseta \"raide\" hiekkapolun mukaisesti johtamaan oveltasi kartan laitaan."},
"level1FailureMessage":function(d){return "Sinun täytyy käyttää komentoja kävelläksesi lampaan luo."},
"level1TooFewBlocksMessage":function(d){return "Kokeile käyttää enemmän komentoja kävelläksesi lampaan luo."},
"level2FailureMessage":function(d){return "Pilkkoaksesi puu, kävele sen rungon luo ja käytä \"tuhoa kuutio\" -käskyä."},
"level2TooFewBlocksMessage":function(d){return "Kokeile käyttää enemmän komentoja pilkkoaksesi puu. Kävele sen rungon luo ja käytä \"tuhoa kuutio\" komentoa."},
"level3FailureMessage":function(d){return "Kerätäksesi villat molemmista lampaista, kävele molempien luo ja käytä \"keri\" komentoa. Muista käyttää käänny komentoja päästäksesi lampaiden luo."},
"level3TooFewBlocksMessage":function(d){return "Yritä käyttää enemmän komentoja keritäksesi villat molemmista lampaista. Kävele molempien luo ja käytä keri komentoa."},
"level4FailureMessage":function(d){return "Sinun täytyy käyttää \"tuhoa kuutio\" komentoa jokaiseen kolmeen puunrunkoon."},
"level5FailureMessage":function(d){return "Laita kuutiosi hiekan ääriviivoihin rakentaakseksesi muuri. Vaaleanpunainen \"toista\"-komento ajaa sen sisään sijoitetun komennot, kuten \"aseta kuutio\" ja \"siirry eteenpäin\"."},
"level6FailureMessage":function(d){return "Place blocks on the dirt outline of the house to complete the puzzle."},
"level7FailureMessage":function(d){return "Use the \"plant\" command to place crops on each patch of dark tilled soil."},
"level8FailureMessage":function(d){return "If you touch a creeper it will explode. Sneak around them and enter your house."},
"level9FailureMessage":function(d){return "Älä unohda asettaa ainakin 2 soihtua valaisemaan tietäsi JA kaivaa ainakin 2 hiiltä."},
"minecraftBlock":function(d){return "kuutio"},
"nextLevelMsg":function(d){return "Tehtävä "+craft_locale.v(d,"puzzleNumber")+" suoritettu. Onnittelut!"},
"playerSelectChooseCharacter":function(d){return "Valitse hahmosi."},
"playerSelectChooseSelectButton":function(d){return "Valitse"},
"playerSelectLetsGetStarted":function(d){return "Aloitetaan."},
"reinfFeedbackMsg":function(d){return "Voit painaa \"Jatka pelaamista\" palataksesi pelaamaan peliäsi."},
"replayButton":function(d){return "Pelaa uudelleen"},
"selectChooseButton":function(d){return "Valitse"},
"tooManyBlocksFail":function(d){return "Tehtävä "+craft_locale.v(d,"puzzleNumber")+" suoritettu. Onnittelut! Huomaa että voit myös ratkoa sen käyttäen "+craft_locale.p(d,"numBlocks",0,"fi",{"one":"1 block","other":craft_locale.n(d,"numBlocks")+" blocks"})+"."}};