var maze_locale = {lc:{"ar":function(n){
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
v:function(d,k){maze_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){maze_locale.c(d,k);return d[k] in p?p[d[k]]:(k=maze_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){maze_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).maze_locale = {
"atHoneycomb":function(d){return "prie korio"},
"atFlower":function(d){return "prie gėlės"},
"avoidCowAndRemove":function(d){return "Išvenk karvės ir pašalink 1"},
"continue":function(d){return "Tęsti"},
"dig":function(d){return "pašalink 1"},
"digTooltip":function(d){return "pašalink 1 krūvą žemių"},
"dirE":function(d){return "R"},
"dirN":function(d){return "Š"},
"dirS":function(d){return "P"},
"dirW":function(d){return "V"},
"doCode":function(d){return " "},
"elseCode":function(d){return "kitu atveju"},
"fill":function(d){return "užpildyk 1"},
"fillN":function(d){return "užpildyk "+maze_locale.v(d,"shovelfuls")},
"fillStack":function(d){return "užpildyk "+maze_locale.v(d,"shovelfuls")+" duobes žemėmis"},
"fillSquare":function(d){return "užpildyk kvadratą"},
"fillTooltip":function(d){return "iškrauk 1 žemių krūvą"},
"finalLevel":function(d){return "Sveikinu! Tu išsprendei paskutinį galvosūkį."},
"flowerEmptyError":function(d){return "Gėlėje, prie kurios esi, nebėra nektaro."},
"get":function(d){return "paimk"},
"heightParameter":function(d){return "aukštis"},
"holePresent":function(d){return "čia yra duobė"},
"honey":function(d){return "pagamink medų"},
"honeyAvailable":function(d){return "medus"},
"honeyTooltip":function(d){return "Pagamink medų iš nektaro"},
"honeycombFullError":function(d){return "Šis korys jau pilnas - daugiau medaus negali tilpti."},
"ifCode":function(d){return "jei"},
"ifInRepeatError":function(d){return "Tau reikia blokelio „jei“, o ne kartojimo blokelio. Jeigu niekaip neišsprendi užduoties, pamėgink sugrįžti į prieš tai spręstą užduotį ir išsiaiškink, kaip ji buvo išspręsta."},
"ifPathAhead":function(d){return "jei yra kelias į priekį"},
"ifTooltip":function(d){return "Jei kelias yra nurodytoje kryptyje, atlik kokius nors veiksmus."},
"ifelseTooltip":function(d){return "Jei kelias yra nurodytoje kryptyje, atlik pirmą veiksmų bloką. Priešingu atveju, atlik antrą veiksmų bloką."},
"ifFlowerTooltip":function(d){return "Jei nurodytoje krypty yra gėlė/korys, atliekami veiksmai."},
"ifOnlyFlowerTooltip":function(d){return "Jei nurodyta kryptimi yra gėlė, tada vykdyti kokius nors veiksmus."},
"ifelseFlowerTooltip":function(d){return "Jei nurodytoje krypty yra gėlė/korys, atliekami pirmesni veiksmai, kitu atveju - kiti."},
"insufficientHoney":function(d){return "Tau reikia pagaminti teisingą medaus kiekį."},
"insufficientNectar":function(d){return "Tau reikia surinkti teisingą nektaro kiekį."},
"make":function(d){return "pagamink"},
"moveBackward":function(d){return "atgal"},
"moveEastTooltip":function(d){return "Pajudink mane į rytus per vieną laukelį."},
"moveForward":function(d){return "ženk į priekį"},
"moveForwardTooltip":function(d){return "Perkelk mane į priekį per vieną laukelį."},
"moveNorthTooltip":function(d){return "Pajudink mane į šiaurę per vieną laukelį."},
"moveSouthTooltip":function(d){return "Pajudink mane į pietus per vieną laukelį."},
"moveTooltip":function(d){return "Pajudink mane pirmyn/atgal per vieną laukelį/langelį/žingsnį."},
"moveWestTooltip":function(d){return "Pajudink mane į vakarus per vieną laukelį."},
"nectar":function(d){return "gauk nektarą"},
"nectarRemaining":function(d){return "nektaras"},
"nectarTooltip":function(d){return "Gauk nektarą iš gėlės"},
"nextLevel":function(d){return "Sveikinu! Išsprendei šią užduotį."},
"no":function(d){return "Ne"},
"noPathAhead":function(d){return "kelias yra užblokuotas"},
"noPathLeft":function(d){return "nėra kelio į kairę"},
"noPathRight":function(d){return "nėra kelio į dešinę"},
"notAtFlowerError":function(d){return "Tik iš gėlės galima gauti nektaro. Turbūt bitė yra ne tame langelyje..."},
"notAtHoneycombError":function(d){return "Tik koryje galima gaminti medų. Turbūt bitė yra netinkamame langelyje..."},
"numBlocksNeeded":function(d){return "Ši užduotis gali būti išspręsta su %1 blokų(-ais)."},
"pathAhead":function(d){return "kelias į priekį"},
"pathLeft":function(d){return "jei yra kelias į kairę"},
"pathRight":function(d){return "jei yra kelias į dešinę"},
"pilePresent":function(d){return "čia yra žemių krūva"},
"putdownTower":function(d){return "padėk bokštą"},
"removeAndAvoidTheCow":function(d){return "pašalink 1krūvą ir išvenk karvės"},
"removeN":function(d){return "pašalink "+maze_locale.v(d,"shovelfuls")},
"removePile":function(d){return "pašalink krūvą"},
"removeStack":function(d){return "pašalink "+maze_locale.v(d,"shovelfuls")+" krūveles(-ių)"},
"removeSquare":function(d){return "pašalink kvadratą"},
"repeatCarefullyError":function(d){return "Norėdamas išspręsti, gerai pagalvok - kiek kartų reiktų pakartot po seką: du žingsniai ir pasukimas."},
"repeatUntil":function(d){return "kartok, kol pasieksi"},
"repeatUntilBlocked":function(d){return "kol yra kelias į priekį"},
"repeatUntilFinish":function(d){return "kartok iki finišo"},
"step":function(d){return "Žingsnis"},
"totalHoney":function(d){return "iš viso medaus"},
"totalNectar":function(d){return "iš viso nektaro"},
"turnLeft":function(d){return "pasisuk į kairę"},
"turnRight":function(d){return "pasisuk į dešinę"},
"turnTooltip":function(d){return "Pasuka mane į kairę arba į dešinę per 90 laipsnių."},
"uncheckedCloudError":function(d){return "Neužmiršk patikrint visų debesų - ar ten yra gėlė, ar korys."},
"uncheckedPurpleError":function(d){return "Neužmiršk patikrint visų violetinių gėlių, ar jose yra nektaro."},
"whileMsg":function(d){return "kol"},
"whileTooltip":function(d){return "Pakartok sujungtus veiksmus, kol bus pasiektas finišas."},
"word":function(d){return "Surast žodį"},
"yes":function(d){return "Taip"},
"youSpelled":function(d){return "Tu įvedei"}};