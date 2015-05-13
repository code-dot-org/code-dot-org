var applab_locale = {lc:{"ar":function(n){
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
},"en":function(n){return n===1?"one":"other"},"bg":function(n){return n===1?"one":"other"}},
c:function(d,k){if(!d)throw new Error("MessageFormat: Data required for '"+k+"'.")},
n:function(d,k,o){if(isNaN(d[k]))throw new Error("MessageFormat: '"+k+"' isn't a number.");return d[k]-(o||0)},
v:function(d,k){applab_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){applab_locale.c(d,k);return d[k] in p?p[d[k]]:(k=applab_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){applab_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).applab_locale = {
"catActions":function(d){return "Действия"},
"catControl":function(d){return "Цикли"},
"catEvents":function(d){return "Събития"},
"catLogic":function(d){return "Логика"},
"catMath":function(d){return "Математика"},
"catProcedures":function(d){return "Функции"},
"catText":function(d){return "Текст"},
"catVariables":function(d){return "Променливи"},
"continue":function(d){return "Продължение"},
"container":function(d){return "създаване на контейнер"},
"containerTooltip":function(d){return "Създава отделен контейнер и поставя HTML вътре."},
"finalLevel":function(d){return "Поздравления! Ти реши последния пъзел."},
"nextLevel":function(d){return "Поздравления! Вие завършихте този пъзел."},
"no":function(d){return "Не"},
"numBlocksNeeded":function(d){return "Този пъзел може да бъде решен с %1 блока."},
"pause":function(d){return "Прекъсване"},
"reinfFeedbackMsg":function(d){return "Можете да натиснете бутона \"Опитайте отново\", за да се върнете да работите над приложението ви."},
"repeatForever":function(d){return "Повтаря завинаги"},
"repeatDo":function(d){return "правя"},
"repeatForeverTooltip":function(d){return "Изпълнява действията в този блок многократно, докато приложението се изпълнява."},
"shareApplabTwitter":function(d){return "Вижте приложението, което направих. Аз сам го написал с @codeorg"},
"shareGame":function(d){return "Споделете вашето приложение:"},
"stepIn":function(d){return "Стъпка в"},
"stepOver":function(d){return "Стъпка над"},
"stepOut":function(d){return "Стъпка извън"},
"viewData":function(d){return "Преглед на данните"},
"yes":function(d){return "Да"}};