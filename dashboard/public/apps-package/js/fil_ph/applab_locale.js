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
},"da":function(n){return n===1?"one":"other"},"de":function(n){return n===1?"one":"other"},"el":function(n){return n===1?"one":"other"},"es":function(n){return n===1?"one":"other"},"et":function(n){return n===1?"one":"other"},"eu":function(n){return n===1?"one":"other"},"fa":function(n){return "other"},"fi":function(n){return n===1?"one":"other"},"fil":function(n){return n===0||n==1?"one":"other"}},
c:function(d,k){if(!d)throw new Error("MessageFormat: Data required for '"+k+"'.")},
n:function(d,k,o){if(isNaN(d[k]))throw new Error("MessageFormat: '"+k+"' isn't a number.");return d[k]-(o||0)},
v:function(d,k){appLocale.c(d,k);return d[k]},
p:function(d,k,o,l,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:(k=appLocale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).appLocale = {
"catActions":function(d){return "Mga aksyon"},
"catControl":function(d){return "Mga loop"},
"catEvents":function(d){return "Mga event"},
"catLogic":function(d){return "Lohika"},
"catMath":function(d){return "Math"},
"catProcedures":function(d){return "Mga function"},
"catText":function(d){return "Text"},
"catVariables":function(d){return "Mga variable"},
"continue":function(d){return "Magpatuloy"},
"container":function(d){return "lumikha ng container"},
"containerTooltip":function(d){return "Lumilikha ng dibisyon na container at itakda nito ang panloob na HTML."},
"finalLevel":function(d){return "Maligayang pagbati! Nalutas mo na ang pinakahuling puzzle."},
"nextLevel":function(d){return "Maligayang pagbati! Natapos mo ang puzzle na ito."},
"no":function(d){return "Hindi"},
"numBlocksNeeded":function(d){return "Ang puzzle na ito ay maaaring malutas sa %1 na mga block."},
"pause":function(d){return "Break"},
"reinfFeedbackMsg":function(d){return "Maaari mong pindutin ang \" Subukang muli \" na pindutan upang bumalik sa pagtakbo ang iyong mga  app."},
"repeatForever":function(d){return "ulitin ng walang katapusan"},
"repeatDo":function(d){return "gawin"},
"repeatForeverTooltip":function(d){return "Ipatupad ang mga pagkilos na ito sa block ng paulit-ulit habang ang app ay tumatakbo."},
"shareApplabTwitter":function(d){return "Tingnan ang app na ginawa ko. Sinulat ko ito sa @codeorg"},
"shareGame":function(d){return "Ibahagi ang iyong app:"},
"stepIn":function(d){return "Hakbang sa"},
"stepOver":function(d){return "Hakbang sa paglipas ng"},
"stepOut":function(d){return "Umalis"},
"viewData":function(d){return "Tingnan ang Data"},
"yes":function(d){return "Oo"}};