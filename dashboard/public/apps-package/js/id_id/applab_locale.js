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
},"hu":function(n){return "other"},"id":function(n){return "other"}},
c:function(d,k){if(!d)throw new Error("MessageFormat: Data required for '"+k+"'.")},
n:function(d,k,o){if(isNaN(d[k]))throw new Error("MessageFormat: '"+k+"' isn't a number.");return d[k]-(o||0)},
v:function(d,k){appLocale.c(d,k);return d[k]},
p:function(d,k,o,l,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:(k=appLocale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).appLocale = {
"catActions":function(d){return "Aksi"},
"catControl":function(d){return "Loop"},
"catEvents":function(d){return "kegiatan"},
"catLogic":function(d){return "Logika"},
"catMath":function(d){return "Matematika"},
"catProcedures":function(d){return "fungsi"},
"catText":function(d){return "Teks"},
"catVariables":function(d){return "variabel"},
"continue":function(d){return "Lanjutkan"},
"container":function(d){return "membuat wadah"},
"containerTooltip":function(d){return "Membuat sebagian kontainer dan mengatur di dalam HTML."},
"finalLevel":function(d){return "Horee! Anda telah memecahkan teka-teki akhir."},
"nextLevel":function(d){return "Horee! Anda telah menyelesaikan teka-teki ini."},
"no":function(d){return "Tidak"},
"numBlocksNeeded":function(d){return "Teka-teki ini dapat diselesaikan dengan %1 blok."},
"pause":function(d){return "Baris baru"},
"reinfFeedbackMsg":function(d){return "Anda dapat menekan tombol \"Coba lagi\" untuk kembali menjalankan aplikasi Anda."},
"repeatForever":function(d){return "Ulangi selamanya"},
"repeatDo":function(d){return "kerjakan"},
"repeatForeverTooltip":function(d){return "Jalankan tindakan di blok ini secara berulang selagi aplikasi berjalan."},
"shareApplabTwitter":function(d){return "Lihatlah aplikasi yang saya buat. Saya membuatnya sendiri dengan @codeorg"},
"shareGame":function(d){return "Bagikan aplikasi Anda:"},
"stepIn":function(d){return "Masuk"},
"stepOver":function(d){return "Lompati"},
"stepOut":function(d){return "Keluar"},
"viewData":function(d){return "Lihat Data"},
"yes":function(d){return "Ya"}};