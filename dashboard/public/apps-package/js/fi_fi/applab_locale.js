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
},"en":function(n){return n===1?"one":"other"},"bg":function(n){return n===1?"one":"other"},"bn":function(n){return n===1?"one":"other"},"ca":function(n){return n===1?"one":"other"},"cs":function(n){
  if (n == 1) {
    return 'one';
  }
  if (n == 2 || n == 3 || n == 4) {
    return 'few';
  }
  return 'other';
},"da":function(n){return n===1?"one":"other"},"de":function(n){return n===1?"one":"other"},"el":function(n){return n===1?"one":"other"},"es":function(n){return n===1?"one":"other"},"et":function(n){return n===1?"one":"other"},"eu":function(n){return n===1?"one":"other"},"fa":function(n){return "other"},"fi":function(n){return n===1?"one":"other"}},
c:function(d,k){if(!d)throw new Error("MessageFormat: Data required for '"+k+"'.")},
n:function(d,k,o){if(isNaN(d[k]))throw new Error("MessageFormat: '"+k+"' isn't a number.");return d[k]-(o||0)},
v:function(d,k){applab_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){applab_locale.c(d,k);return d[k] in p?p[d[k]]:(k=applab_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){applab_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).applab_locale = {
"catActions":function(d){return "Toiminnot"},
"catControl":function(d){return "Silmukat"},
"catEvents":function(d){return "Tapahtumat"},
"catLogic":function(d){return "Logiikka"},
"catMath":function(d){return "Matematiikka"},
"catProcedures":function(d){return "Funktiot"},
"catText":function(d){return "Teksti"},
"catVariables":function(d){return "Muuttujat"},
"continue":function(d){return "Jatka"},
"container":function(d){return "luo säiliö"},
"containerTooltip":function(d){return "Luo div-säiliön ja asettaa sen sisäisen HTML:n."},
"finalLevel":function(d){return "Onneksi olkoon! Olet suorittanut viimeisen tehtävän."},
"nextLevel":function(d){return "Onneksi olkoon! Olet suorittanut tämän tehtävän."},
"no":function(d){return "Ei"},
"numBlocksNeeded":function(d){return "Tämän tehtävän voi ratkaista %1 lohkolla."},
"pause":function(d){return "Tauko"},
"reinfFeedbackMsg":function(d){return "Voit painaa \"Yritä uudelleen\"-painiketta jos haluat käynnistää sovelluksesi uudestaan."},
"repeatForever":function(d){return "toista jatkuvasti"},
"repeatDo":function(d){return "tee"},
"repeatForeverTooltip":function(d){return "Suorita toimet tässä lohkossa toistuvasti sovelluksen ollessa käynnissä."},
"shareApplabTwitter":function(d){return "Katso tekemäni sovellus. Tein sen itse @codeorg:ssa"},
"shareGame":function(d){return "Jaa sovelluksesi:"},
"stepIn":function(d){return "Astu sisään"},
"stepOver":function(d){return "Astu yli"},
"stepOut":function(d){return "Astu ulos"},
"viewData":function(d){return "Näytä tiedot"},
"yes":function(d){return "Kyllä"}};