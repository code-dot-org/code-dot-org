var locale = {lc:{"ar":function(n){
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
v:function(d,k){locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){locale.c(d,k);return d[k] in p?p[d[k]]:(k=locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).locale = {
"and":function(d){return "dan"},
"booleanTrue":function(d){return "benar"},
"booleanFalse":function(d){return "palsu"},
"blocks":function(d){return "blocks"},
"blocklyMessage":function(d){return "Blockly"},
"catActions":function(d){return "Tindakan"},
"catColour":function(d){return "Warna"},
"catLogic":function(d){return "Logik"},
"catLists":function(d){return "Senarai"},
"catLoops":function(d){return "Gelung"},
"catMath":function(d){return "Matematik"},
"catProcedures":function(d){return "Fungsi"},
"catText":function(d){return "teks"},
"catVariables":function(d){return "Pembolehubah"},
"clearPuzzle":function(d){return "Clear Puzzle"},
"clearPuzzleConfirm":function(d){return "This will delete all blocks and reset the puzzle to its start state."},
"clearPuzzleConfirmHeader":function(d){return "Are you sure you want to clear the puzzle?"},
"codeTooltip":function(d){return "Lihat kod JavaScript yang dijana."},
"continue":function(d){return "Teruskan"},
"dialogCancel":function(d){return "Batal"},
"dialogOK":function(d){return "OK"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionEastLetter":function(d){return "E"},
"directionWestLetter":function(d){return "W"},
"end":function(d){return "tamat"},
"emptyBlocksErrorMsg":function(d){return "\"Ulangan\" atau \"Jika\" blok perlu mempunyai blok lain di dalamnya untuk berfungsi. Pastikan blok dalaman sesuai di dalam kandungan blok."},
"emptyFunctionBlocksErrorMsg":function(d){return "Blok fungsi perlu mengandungi blok-blok yang lain di dalamnya untuk berfungsi."},
"errorEmptyFunctionBlockModal":function(d){return "There need to be blocks inside your function definition. Click \"edit\" and drag blocks inside the green block."},
"errorIncompleteBlockInFunction":function(d){return "Click \"edit\" to make sure you don't have any blocks missing inside your function definition."},
"errorParamInputUnattached":function(d){return "Remember to attach a block to each parameter input on the function block in your workspace."},
"errorUnusedParam":function(d){return "You added a parameter block, but didn't use it in the definition. Make sure to use your parameter by clicking \"edit\" and placing the parameter block inside the green block."},
"errorRequiredParamsMissing":function(d){return "Create a parameter for your function by clicking \"edit\" and adding the necessary parameters. Drag the new parameter blocks into your function definition."},
"errorUnusedFunction":function(d){return "You created a function, but never used it on your workspace! Click on \"Functions\" in the toolbox and make sure you use it in your program."},
"errorQuestionMarksInNumberField":function(d){return "Try replacing \"???\" with a value."},
"extraTopBlocks":function(d){return "You have unattached blocks. Did you mean to attach these to the \"when run\" block?"},
"finalStage":function(d){return "Tahniah! Anda telah melengkapkan peringkat akhir."},
"finalStageTrophies":function(d){return "Tahniah! Anda telah selesai peringkat akhir dan memenangi "+locale.p(d,"numTrophies",0,"ms",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"finish":function(d){return "Selesai"},
"generatedCodeInfo":function(d){return "Universiti terkemuka juga mengajarkan blok-asas koding (cth., "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). Tetapi, blok yang telah disusun juga boleh ditunjukkan dalam JavaScript, bahasa koding yang paling meluas digunakan:"},
"hashError":function(d){return "Maaf, '%1' tidak sepadan dengan sebarang atur cara yang disimpan."},
"help":function(d){return "Bantu"},
"hintTitle":function(d){return "Petunjuk:"},
"jump":function(d){return "lompat"},
"levelIncompleteError":function(d){return "Anda menggunakan kesemua jenis blok yang diperlukan tetapi dengan cara yang tidak betul."},
"listVariable":function(d){return "senarai"},
"makeYourOwnFlappy":function(d){return "Buat permainan Flappy anda sendiri"},
"missingBlocksErrorMsg":function(d){return "Cuba satu atau lebih blok di bawah untuk menyelesaikan puzzle ini."},
"nextLevel":function(d){return "Tahniah! Anda telah melengkapkan puzzle "+locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Tahniah! Anda telah menyelesaikan Puzzle "+locale.v(d,"puzzleNumber")+" dan memenangi "+locale.p(d,"numTrophies",0,"ms",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"nextStage":function(d){return "Tahniah! Anda tamatkan "+locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Tahniah! Anda telah menyelesaikan "+locale.v(d,"stageName")+" dan memenangi "+locale.p(d,"numTrophies",0,"ms",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"numBlocksNeeded":function(d){return "Tahniah! Anda melengkapkan Puzzle "+locale.v(d,"puzzleNumber")+". (Walau bagaimanapun, anda hanya boleh menggunakan "+locale.p(d,"numBlocks",0,"ms",{"one":"1 block","other":locale.n(d,"numBlocks")+" blocks"})+".)"},
"numLinesOfCodeWritten":function(d){return "Anda baru sahaja menulis "+locale.p(d,"numLines",0,"ms",{"one":"1 line","other":locale.n(d,"numLines")+" lines"})+" kod!"},
"play":function(d){return "Main"},
"print":function(d){return "Cetak"},
"puzzleTitle":function(d){return "Puzzle "+locale.v(d,"puzzle_number")+" dari "+locale.v(d,"stage_total")},
"repeat":function(d){return "Ulang"},
"resetProgram":function(d){return "Tetapkan semula"},
"runProgram":function(d){return "Mainkan program"},
"runTooltip":function(d){return "Jalankan program yang ditetapkan dengan blok dalam ruang kerja."},
"score":function(d){return "skor"},
"showCodeHeader":function(d){return "Tunjukkan Kod"},
"showBlocksHeader":function(d){return "Tunjuk blok-blok"},
"showGeneratedCode":function(d){return "Tunjukkan Kod"},
"stringEquals":function(d){return "string=?"},
"subtitle":function(d){return "persekitaran pengaturcaraan visual"},
"textVariable":function(d){return "teks"},
"tooFewBlocksMsg":function(d){return "Anda menggunakan semua jenis blok yang diperlukan, cuba gunakan lebih banyak jenis blok untuk menyelesaikan puzzle ini."},
"tooManyBlocksMsg":function(d){return "Puzzle ini dapat diselesaikan dengan <x id='START_SPAN'/><x id='END_SPAN'/> blok."},
"tooMuchWork":function(d){return "Anda membuatkan saya melakukan banyak kerja! Bolehkah anda cuba ulang beberapa kali sahaja?"},
"toolboxHeader":function(d){return "blok"},
"openWorkspace":function(d){return "Bagaimana ia berfungsi"},
"totalNumLinesOfCodeWritten":function(d){return "Total masa keseluruhan: "+locale.p(d,"numLines",0,"ms",{"one":"1 line","other":locale.n(d,"numLines")+" lines"})+" kod."},
"tryAgain":function(d){return "Cuba lagi"},
"hintRequest":function(d){return "See hint"},
"backToPreviousLevel":function(d){return "Kembali ke tahap yang sebelumnya"},
"saveToGallery":function(d){return "Simpan ke galeri"},
"savedToGallery":function(d){return "Disimpan di dalam galeri!"},
"shareFailure":function(d){return "Maaf, kami tidak dapat berkongsi program ini."},
"workspaceHeader":function(d){return "Pasang blok anda di sini: "},
"workspaceHeaderJavaScript":function(d){return "Taip kod Javascript anda di sini"},
"workspaceHeaderShort":function(d){return "Workspace: "},
"infinity":function(d){return "Infinity"},
"rotateText":function(d){return "Pusingkan peranti anda."},
"orientationLock":function(d){return "Matikan kunci orientasi dalam tetapan peranti."},
"wantToLearn":function(d){return "Ingin belajar untuk mengekod?"},
"watchVideo":function(d){return "Tonton Video"},
"when":function(d){return "apabila"},
"whenRun":function(d){return "when run"},
"tryHOC":function(d){return "Cuba Hour of Code"},
"signup":function(d){return "Daftar untuk kursus pengenalan"},
"hintHeader":function(d){return "Sedikit Tip:"},
"genericFeedback":function(d){return "Lihat bagaimana anda akhiri, dan cuba membaiki program anda."},
"toggleBlocksErrorMsg":function(d){return "Anda perlu membetulkan kesilapan di dalam program sebelum ia boleh dipaparkan sebagai blok-blok."},
"defaultTwitterText":function(d){return "Check out what I made"}};