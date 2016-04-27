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
"blockDestroyBlock":function(d){return "znič blok"},
"blockIf":function(d){return "Pokud"},
"blockIfLavaAhead":function(d){return "pokud stojíš před lávou"},
"blockMoveForward":function(d){return "posunout vpřed"},
"blockPlaceTorch":function(d){return "umísti pochodeň"},
"blockPlaceXAheadAhead":function(d){return "před sebe"},
"blockPlaceXAheadPlace":function(d){return "polož"},
"blockPlaceXPlace":function(d){return "polož"},
"blockPlantCrop":function(d){return "zasaď plodinu"},
"blockShear":function(d){return "ostříhej"},
"blockTillSoil":function(d){return "až k hlíně"},
"blockTurnLeft":function(d){return "otočit vlevo"},
"blockTurnRight":function(d){return "otočit vpravo"},
"blockTypeBedrock":function(d){return "skalní podloží"},
"blockTypeBricks":function(d){return "cihly"},
"blockTypeClay":function(d){return "jíl"},
"blockTypeClayHardened":function(d){return "tvrdý jíl"},
"blockTypeCobblestone":function(d){return "dlažební kámen"},
"blockTypeDirt":function(d){return "hlína"},
"blockTypeDirtCoarse":function(d){return "hrubá hlína"},
"blockTypeEmpty":function(d){return "prázdný"},
"blockTypeFarmlandWet":function(d){return "zemědělská půda"},
"blockTypeGlass":function(d){return "sklo"},
"blockTypeGrass":function(d){return "tráva"},
"blockTypeGravel":function(d){return "štěrk"},
"blockTypeLava":function(d){return "láva"},
"blockTypeLogAcacia":function(d){return "akátová kláda"},
"blockTypeLogBirch":function(d){return "březová kláda"},
"blockTypeLogJungle":function(d){return "sekvojová kláda"},
"blockTypeLogOak":function(d){return "dubová kláda"},
"blockTypeLogSpruce":function(d){return "smrková kláda"},
"blockTypeOreCoal":function(d){return "uhelná ruda"},
"blockTypeOreDiamond":function(d){return "diamantová ruda"},
"blockTypeOreEmerald":function(d){return "smaragdová ruda"},
"blockTypeOreGold":function(d){return "zlatá ruda"},
"blockTypeOreIron":function(d){return "železná ruda"},
"blockTypeOreLapis":function(d){return "jaspisová ruda"},
"blockTypeOreRedstone":function(d){return "ruditová ruda"},
"blockTypePlanksAcacia":function(d){return "akátová prkna"},
"blockTypePlanksBirch":function(d){return "březová prkna"},
"blockTypePlanksJungle":function(d){return "sekvojová prkna"},
"blockTypePlanksOak":function(d){return "dubová prkna"},
"blockTypePlanksSpruce":function(d){return "smrková prkna"},
"blockTypeRail":function(d){return "koleje"},
"blockTypeSand":function(d){return "písek"},
"blockTypeSandstone":function(d){return "pískovec"},
"blockTypeStone":function(d){return "kámen"},
"blockTypeTnt":function(d){return "tnt"},
"blockTypeTree":function(d){return "strom"},
"blockTypeWater":function(d){return "voda"},
"blockTypeWool":function(d){return "vlna"},
"blockWhileXAheadAhead":function(d){return "před sebe"},
"blockWhileXAheadDo":function(d){return "proveď"},
"blockWhileXAheadWhile":function(d){return "dokud"},
"generatedCodeDescription":function(d){return "Přetažením a umístěním bloků do této hádanky, jsi vytvořil sadu instrukcí v počítačovém jazyce, který se nazývá JavaScript. Tento kód říká počítači, co se zobrazí na obrazovce. Vše, co vidíš a děláš v Minecraftu, také začíná řádky počítačového kódu, jako jsou tyto."},
"houseSelectChooseFloorPlan":function(d){return "Vyberte plán vašeho domu."},
"houseSelectEasy":function(d){return "Snadný"},
"houseSelectHard":function(d){return "Těžký"},
"houseSelectLetsBuild":function(d){return "Pojďme postavit dům."},
"houseSelectMedium":function(d){return "Střední"},
"keepPlayingButton":function(d){return "Hraj dál"},
"level10FailureMessage":function(d){return "Zakryjte lávu, abyste po ní mohli přejít. Potom vytěžte dva bloky železa na druhé straně."},
"level11FailureMessage":function(d){return "Pokud je před tebou láva, polož před sebe dlažební kámen. To ti umožní bezpečně vytěžit tento řádek bloků."},
"level12FailureMessage":function(d){return "Vytěž 3 ruditové bloky. Zde využiješ co už znáš ze stavění domu a používání podmíněného příkazu “pokud“ k vyhnutí se lávě."},
"level13FailureMessage":function(d){return "Položte \"koleje\" podél hliněné cesty, která vede od vašeho domu k okraji mapy."},
"level1FailureMessage":function(d){return "Abyste došli k ovci, musíte použít příkazy."},
"level1TooFewBlocksMessage":function(d){return "Zkus použít více příkazů, aby ses dostal k ovci."},
"level2FailureMessage":function(d){return "Abyste porazili strom, dojděte k jeho kmenu a použijte příkaz \"znič blok\"."},
"level2TooFewBlocksMessage":function(d){return "Zkuste pro poražení stromu použít více příkazů. Jděte k jeho kmenu a použijte příkaz \"znič blok\"."},
"level3FailureMessage":function(d){return "K získání vlny z obou ovcí dojdi ke každé z nich a použij příkaz „ostříhej“. Nezapomeň použít příkazy k otáčení."},
"level3TooFewBlocksMessage":function(d){return "Zkus použít více příkazů k získání vlny z obou ovcí. Dojdi ke každé z nich a použij příkaz \"ostříhej\"."},
"level4FailureMessage":function(d){return "Musíš použít příkaz „znič blok“ na každý ze tří kmenů stromů."},
"level5FailureMessage":function(d){return "Postav zeď položením bloků na pruh hlíny. Růžový příkaz „opakuj“ opakovaně provádí příkazy v něm umístěné, například „polož blok“ a „jdi vpřed“."},
"level6FailureMessage":function(d){return "Pro vyřešení úkolu polož bloky na hliněný obrys domu."},
"level7FailureMessage":function(d){return "Použij příkaz „zasaď plodinu“ k umístění plodin na každý čtvereček tmavé hlíny."},
"level8FailureMessage":function(d){return "Když se dotkneš creepera, exploduje. Proklouzni kolem nich a vejdi do svého domu."},
"level9FailureMessage":function(d){return "Nezapomeň umístit 2 louče k osvětlení cesty, a natěžit aspoň 2 kusy uhlí."},
"minecraftBlock":function(d){return "blok"},
"nextLevelMsg":function(d){return "Hádanka "+craft_locale.v(d,"puzzleNumber")+" dokončena. Blahopřejeme!"},
"playerSelectChooseCharacter":function(d){return "Vyberte si svou postavu."},
"playerSelectChooseSelectButton":function(d){return "Vybrat"},
"playerSelectLetsGetStarted":function(d){return "Začněme."},
"reinfFeedbackMsg":function(d){return "Můžeš stisknout \"Hraj dál\" k vrácení do tvé hry."},
"replayButton":function(d){return "Přehrát"},
"selectChooseButton":function(d){return "Vybrat"},
"tooManyBlocksFail":function(d){return "Hádanka "+craft_locale.v(d,"puzzleNumber")+" dokončen. Blahopřejeme! Je též možné dokončit s "+craft_locale.p(d,"numBlocks",0,"cs",{"one":"1 block","other":craft_locale.n(d,"numBlocks")+" blocks"})+"."}};