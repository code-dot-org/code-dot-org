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
"atHoneycomb":function(d){return "la fagure de miere"},
"atFlower":function(d){return "la floare"},
"avoidCowAndRemove":function(d){return "evită vaca şi elimină 1"},
"continue":function(d){return "Continuă"},
"dig":function(d){return "elimină 1"},
"digTooltip":function(d){return "elimină 1 unitate de pământ"},
"dirE":function(d){return "E"},
"dirN":function(d){return "N"},
"dirS":function(d){return "S"},
"dirW":function(d){return "V"},
"doCode":function(d){return "fă"},
"elseCode":function(d){return "altfel"},
"fill":function(d){return "umple 1"},
"fillN":function(d){return "umple "+maze_locale.v(d,"shovelfuls")},
"fillStack":function(d){return "umple stiva de "+maze_locale.v(d,"shovelfuls")+" gauri"},
"fillSquare":function(d){return "umple pătratul"},
"fillTooltip":function(d){return "Plasaţi o unitate de pământ"},
"finalLevel":function(d){return "Felicitări! Ai rezolvat puzzle-ul final."},
"flowerEmptyError":function(d){return "Floarea pe care ești nu mai are nectar."},
"get":function(d){return "obţine"},
"heightParameter":function(d){return "înălțime"},
"holePresent":function(d){return "acolo este o gaură"},
"honey":function(d){return "fă miere"},
"honeyAvailable":function(d){return "miere"},
"honeyTooltip":function(d){return "Fă miere din nectar"},
"honeycombFullError":function(d){return "Acest fagure nu mai are loc pentru mai multă miere."},
"ifCode":function(d){return "dacă"},
"ifInRepeatError":function(d){return "Ai nevoie de un bloc \"dacă\" în interiorul unui bloc \"repetă\". Dacă ai probleme, încearcă din nou nivelul anterior pentru a vedea cum a funcționat."},
"ifPathAhead":function(d){return "dacă drum înainte"},
"ifTooltip":function(d){return "Dacă există o cale de acces în direcţia specificată, atunci realizează unele acțiunii."},
"ifelseTooltip":function(d){return "Dacă există o cale de acces în direcţia specificată, atunci realizează primul bloc de acţiuni. Altfel, execută al doilea bloc de acţiuni."},
"ifFlowerTooltip":function(d){return "Dacă există o floare/un fagure de miere în direcţia specificată, atunci fă nişte acţiuni."},
"ifOnlyFlowerTooltip":function(d){return "Dacă există o floare în direcţia specificată, atunci realizează unele acțiuni."},
"ifelseFlowerTooltip":function(d){return "Dacă există o floare/un fagure de miere în direcţia specificată, atunci fă primul block de acţiuni. Altfel, fă al doilea bloc de acţiuni."},
"insufficientHoney":function(d){return "Folosești toate blocurile corecte, dar trebuie să produci cantitatea necesară de miere."},
"insufficientNectar":function(d){return "Folosești toate blocurile corecte, dar trebuie să aduni cantitatea necesară de nectar."},
"make":function(d){return "fă"},
"moveBackward":function(d){return "mută înapoi"},
"moveEastTooltip":function(d){return "Mută-mă un spaţiu la est."},
"moveForward":function(d){return "mută înainte"},
"moveForwardTooltip":function(d){return "Mută-mă înainte un spațiu."},
"moveNorthTooltip":function(d){return "Mută-mă un spaţiu la nord."},
"moveSouthTooltip":function(d){return "Mută-mă un spaţiu la sud."},
"moveTooltip":function(d){return "Mută-mă înainte/înapoi cu un spaţiu"},
"moveWestTooltip":function(d){return "Mută-mă un spaţiu la vest."},
"nectar":function(d){return "obţine nectar"},
"nectarRemaining":function(d){return "Nectar"},
"nectarTooltip":function(d){return "Ia nectar de la o floare"},
"nextLevel":function(d){return "Felicitări! Ai finalizat acest puzzle."},
"no":function(d){return "Nu"},
"noPathAhead":function(d){return "calea de acces este blocată"},
"noPathLeft":function(d){return "nu există cale de acces la stânga"},
"noPathRight":function(d){return "nu există cale de acces la dreapta"},
"notAtFlowerError":function(d){return "Poţi obţine nectar doar de la floare."},
"notAtHoneycombError":function(d){return "Poţi face doar miere la un fagure de miere."},
"numBlocksNeeded":function(d){return "Acest puzzle poate fi rezolvat cu %1 blocuri."},
"pathAhead":function(d){return "cale înainte"},
"pathLeft":function(d){return "dacă cale de acces la stânga"},
"pathRight":function(d){return "dacă cale de acces la dreapta"},
"pilePresent":function(d){return "există o grămadă"},
"putdownTower":function(d){return "pune jos turnul"},
"removeAndAvoidTheCow":function(d){return "elimină 1 şi evită vaca"},
"removeN":function(d){return "elimină "+maze_locale.v(d,"shovelfuls")},
"removePile":function(d){return "elimină grămada"},
"removeStack":function(d){return "elimină set de "+maze_locale.v(d,"shovelfuls")+" grămezi"},
"removeSquare":function(d){return "elimină pătratul"},
"repeatCarefullyError":function(d){return "Pentru a rezolva acest lucru, gândește-te cu atenţie la modelul cu două mişcări și o întoarcere pentru a îl pune în blocul \"repetă\".  Este bine să aibe o întoarcere suplimentară la sfârşit."},
"repeatUntil":function(d){return "repetă până când"},
"repeatUntilBlocked":function(d){return "atâta timp cât există cale de acces înainte"},
"repeatUntilFinish":function(d){return "repetă până la final"},
"step":function(d){return "Pas"},
"totalHoney":function(d){return "total de miere"},
"totalNectar":function(d){return "total de nectar"},
"turnLeft":function(d){return "ia-o la stânga"},
"turnRight":function(d){return "ia-o la dreapta"},
"turnTooltip":function(d){return "Mă roteşte la stânga sau la dreapta cu 90 de grade."},
"uncheckedCloudError":function(d){return "Asigură-te că verifici toţi norii să vezi dacă ei sunt ori flori ori faguri de miere."},
"uncheckedPurpleError":function(d){return "Asigură-te că verifici toate florile mov pentru a vedea dacă au nectar"},
"whileMsg":function(d){return "în timp ce"},
"whileTooltip":function(d){return "Repetă acţiunile cuprinse până când punctul final este atins."},
"word":function(d){return "Găsește cuvântul"},
"yes":function(d){return "Da"},
"youSpelled":function(d){return "Ai scris"},
"didNotCollectEverything":function(d){return "Make sure you don't leave any nectar or honey behind!"}};