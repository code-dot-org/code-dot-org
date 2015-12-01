var common_locale = {lc:{"ar":function(n){
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
v:function(d,k){common_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){common_locale.c(d,k);return d[k] in p?p[d[k]]:(k=common_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){common_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).common_locale = {
"and":function(d){return "dan"},
"backToPreviousLevel":function(d){return "Kembali ke teka-teki sebelumnya"},
"blocklyMessage":function(d){return "Blockly"},
"blocks":function(d){return "blok"},
"booleanFalse":function(d){return "Salah"},
"booleanTrue":function(d){return "Benar"},
"catActions":function(d){return "Aksi"},
"catColour":function(d){return "Warna"},
"catLists":function(d){return "List"},
"catLogic":function(d){return "Logika"},
"catLoops":function(d){return "Loop"},
"catMath":function(d){return "Matematika"},
"catProcedures":function(d){return "Fungsi"},
"catText":function(d){return "teks"},
"catVariables":function(d){return "Variabel"},
"clearPuzzle":function(d){return "Memulai kembali"},
"clearPuzzleConfirm":function(d){return "Ini akan mengembalikan puzzle ke dalam posisi awal dan menghapus blok yang sudah kamu tambahkan atau ubah."},
"clearPuzzleConfirmHeader":function(d){return "Apakah Anda yakin Anda ingin memulai dari awal?"},
"codeMode":function(d){return "kode"},
"codeTooltip":function(d){return "Lihat kode JavaScript."},
"completedWithoutRecommendedBlock":function(d){return "Selamat! Anda menyelesaikan teka-teki "+common_locale.v(d,"puzzleNumber")+". (Tapi Anda bisa menggunakan blok yang berbeda untuk kode yang lebih baik.)"},
"continue":function(d){return "Lanjutkan"},
"defaultTwitterText":function(d){return "Lihat apa yang saya buat"},
"designMode":function(d){return "Desain"},
"dialogCancel":function(d){return "Batal"},
"dialogOK":function(d){return "Oke!"},
"directionEastLetter":function(d){return "T"},
"directionNorthLetter":function(d){return "U"},
"directionSouthLetter":function(d){return "S"},
"directionWestLetter":function(d){return "B"},
"dropletBlock_addOperator_description":function(d){return "tambahkan dua nomor"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Tambahkan operator"},
"dropletBlock_andOperator_description":function(d){return "Pengembalian nilai true hanya bisa jika kedua ekspresi adalah benar dan sebaliknya jika salah"},
"dropletBlock_andOperator_signatureOverride":function(d){return "Operator boolean AND"},
"dropletBlock_assign_x_description":function(d){return "Menetapkan nilai ke variabel yang ada. Sebagai contoh, x = 0;"},
"dropletBlock_assign_x_param0":function(d){return "x"},
"dropletBlock_assign_x_param0_description":function(d){return "Nama variabel yang diberikan untuk"},
"dropletBlock_assign_x_param1":function(d){return "nilai"},
"dropletBlock_assign_x_param1_description":function(d){return "Nilai variabel yang diberikan."},
"dropletBlock_assign_x_signatureOverride":function(d){return "Menetapkan variabel"},
"dropletBlock_callMyFunction_description":function(d){return "panggil sebuah nama fungsi yang tidak membutuhkan parameter"},
"dropletBlock_callMyFunction_n_description":function(d){return "panggil sebuah nama fungsi yang mengambil satu parameter atau lebih"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Panggil sebuah fungsi dengan parameter"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Panggil sebuah fungsi"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "Mendeklarasikan variabel dan menetapkannya ke sebuah array dengan nilai awal yang diberikan"},
"dropletBlock_declareAssign_x_array_1_4_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_array_1_4_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_array_1_4_param1":function(d){return "1,2,3,4"},
"dropletBlock_declareAssign_x_array_1_4_param1_description":function(d){return "The initial values to the array"},
"dropletBlock_declareAssign_x_array_1_4_signatureOverride":function(d){return "Mendeklarasikan variabel yang ditetapkan ke array"},
"dropletBlock_declareAssign_x_description":function(d){return "Menyatakan sebuah variabel dengan nama yang telah diberikan setelah 'var', dan menetapkannya kepada nilai di sisi kanan dari ekspresi"},
"dropletBlock_declareAssign_x_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_param1":function(d){return "0"},
"dropletBlock_declareAssign_x_param1_description":function(d){return "The initial value of the variable"},
"dropletBlock_declareAssign_x_prompt_description":function(d){return "Mendeklarasikan atau Menyatakan bahwa kode tersebut sekarang akan menggunakan variabel dan menetapkan nilai awal yang diberikan oleh pengguna"},
"dropletBlock_declareAssign_x_prompt_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_prompt_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_prompt_param1":function(d){return "\"Enter value\""},
"dropletBlock_declareAssign_x_prompt_param1_description":function(d){return "The string the user will see in the pop up when asked to enter a value"},
"dropletBlock_declareAssign_x_prompt_signatureOverride":function(d){return "Meminta pengguna untuk suatu nilai dan menyimpannya"},
"dropletBlock_declareAssign_x_promptNum_description":function(d){return "Declares that the code will now use a variable and assign it an initial numerical value provided by the user"},
"dropletBlock_declareAssign_x_promptNum_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_promptNum_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_promptNum_param1":function(d){return "\"Enter value\""},
"dropletBlock_declareAssign_x_promptNum_param1_description":function(d){return "The string the user will see in the pop up when asked to enter a value"},
"dropletBlock_declareAssign_x_promptNum_signatureOverride":function(d){return "Prompt the user for a numerical value and store it"},
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "Mendeklarasikan sebuah variabel"},
"dropletBlock_declareNoAssign_x_description":function(d){return "Declares a variable with the given name after 'var'"},
"dropletBlock_declareNoAssign_x_signatureOverride":function(d){return "Mendeklarasikan sebuah variabel"},
"dropletBlock_divideOperator_description":function(d){return "Membagi dua nomor"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "Membagi operator"},
"dropletBlock_equalityOperator_description":function(d){return "Menguji apakah dua nilai sama rata. Mengembalikan nilai true jika nilai di sisi kiri dari ekspresi sama dengan nilai di sisi kanan ekspresi, dan false sebaliknya"},
"dropletBlock_equalityOperator_param0":function(d){return "x"},
"dropletBlock_equalityOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_equalityOperator_param1":function(d){return "y"},
"dropletBlock_equalityOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_equalityOperator_signatureOverride":function(d){return "Kesetaraan operator"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "Membuat loop yang terdiri dari sebuah ekspresi inisialisasi, ekspresi kondisional, ekspresi incrementing, dan suatu blok statemen dieksekusi untuk setiap iterasi dari loop"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "untuk pengulangan/loop"},
"dropletBlock_functionParams_n_description":function(d){return "Satu set pernyataan yang mengambil satu atau lebih parameter, dan melakukan tugas atau menghitung nilai saat fungsi ini dipanggil"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "definisikan suatu fungsi dengan parameter"},
"dropletBlock_functionParams_none_description":function(d){return "Serangkaian pernyataan yang melaksanakan tugas atau menghitung nilai saat fungsi dipanggil"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "Mendefinisikan fungsi"},
"dropletBlock_getTime_description":function(d){return "Dapatkan waktu saat ini dalam milidetik"},
"dropletBlock_greaterThanOperator_description":function(d){return "Tes apakah sebuah nomor lebih besar daripada nomor lain. Kembalikan nilai true jika nilai di sisi kiri dari ekspresi adalah benar lebih besar dari nilai di sisi kanan dari ekspresi"},
"dropletBlock_greaterThanOperator_param0":function(d){return "x"},
"dropletBlock_greaterThanOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_greaterThanOperator_param1":function(d){return "y"},
"dropletBlock_greaterThanOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_greaterThanOperator_signatureOverride":function(d){return "Lebih besar dari operator"},
"dropletBlock_ifBlock_description":function(d){return "Mengeksekusi blok pernyataan jika kondisi tertentu adalah benar"},
"dropletBlock_ifBlock_signatureOverride":function(d){return "pernyataan if"},
"dropletBlock_ifElseBlock_description":function(d){return "Mengeksekusi blok pernyataan jika kondisi tertentu adalah benar; jika tidak, blok pernyataan dalam klausa yang lain dijalankan"},
"dropletBlock_ifElseBlock_signatureOverride":function(d){return "pernyataan if/else"},
"dropletBlock_inequalityOperator_description":function(d){return "Tes Apakah dua nilai berikut tidak sama. Mengembalikan nilai true apabila nilai di sebelah kiri dari ekspresi tidak sama dengan nilai di sisi kanan dari ekspresi"},
"dropletBlock_inequalityOperator_param0":function(d){return "x"},
"dropletBlock_inequalityOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_inequalityOperator_param1":function(d){return "y"},
"dropletBlock_inequalityOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_inequalityOperator_signatureOverride":function(d){return "Ketidaksetaraan operator"},
"dropletBlock_lessThanOperator_description":function(d){return "Tes apakah nilai adalah kurang dari nilai lain. Mengembalikan nilai true jika nilai di sebelah kiri dari ekspresi benar-benar kurang dari nilai pada sisi kanan dari ekspresi"},
"dropletBlock_lessThanOperator_param0":function(d){return "x"},
"dropletBlock_lessThanOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_lessThanOperator_param1":function(d){return "y"},
"dropletBlock_lessThanOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_lessThanOperator_signatureOverride":function(d){return "Kurang dari operator"},
"dropletBlock_mathAbs_description":function(d){return "Mengambil nilai absolut x"},
"dropletBlock_mathAbs_param0":function(d){return "x"},
"dropletBlock_mathAbs_param0_description":function(d){return "An arbitrary number."},
"dropletBlock_mathAbs_signatureOverride":function(d){return "Math.ABS(x)"},
"dropletBlock_mathMax_description":function(d){return "Mengambil nilai maksimum antara satu atau lebih nilai n1, n2,..., nX"},
"dropletBlock_mathMax_param0":function(d){return "n1, n2,..., nX"},
"dropletBlock_mathMax_param0_description":function(d){return "One or more numbers to compare."},
"dropletBlock_mathMax_signatureOverride":function(d){return "Math.Max (n1, n2,..., nX)"},
"dropletBlock_mathMin_description":function(d){return "Mengambil nilai minimum antara satu atau lebih nilai n1, n2,..., nX"},
"dropletBlock_mathMin_param0":function(d){return "n1, n2,..., nX"},
"dropletBlock_mathMin_param0_description":function(d){return "One or more numbers to compare."},
"dropletBlock_mathMin_signatureOverride":function(d){return "Math.Min (n1, n2,..., nX)"},
"dropletBlock_mathRandom_description":function(d){return "Mengembalikan nomor acak berkisar dari 0 (inklusif) hingga kurang dari 1 (eksklusif)"},
"dropletBlock_mathRandom_signatureOverride":function(d){return "Math.Random()"},
"dropletBlock_mathRound_description":function(d){return "Putaran sejumlah integer terdekat"},
"dropletBlock_mathRound_param0":function(d){return "x"},
"dropletBlock_mathRound_param0_description":function(d){return "An arbitrary number."},
"dropletBlock_mathRound_signatureOverride":function(d){return "Math.Round(x)"},
"dropletBlock_multiplyOperator_description":function(d){return "Mengalikan dua nomor"},
"dropletBlock_multiplyOperator_signatureOverride":function(d){return "Kalikan operator"},
"dropletBlock_notOperator_description":function(d){return "Kembali ke pernyataan false/salah jika ekspresi dapat dikonversi ke nilai benar/true; Jika tidak, kembalikan nilai true"},
"dropletBlock_notOperator_signatureOverride":function(d){return "Operator boolean NOT"},
"dropletBlock_orOperator_description":function(d){return "Mengembalikan nilai true bila salah satu ekspresi benar dan yang salah sebaliknya"},
"dropletBlock_orOperator_signatureOverride":function(d){return "operator boolean OR"},
"dropletBlock_randomNumber_min_max_description":function(d){return "Pengembalian nomor acak mulai dari nomor pertama (min) ke nomor kedua (max), termasuk kedua nomor pada kisaran"},
"dropletBlock_randomNumber_param0":function(d){return "min"},
"dropletBlock_randomNumber_param0_description":function(d){return "Jumlah minimal angka yang dikembalikan"},
"dropletBlock_randomNumber_param1":function(d){return "max"},
"dropletBlock_randomNumber_param1_description":function(d){return "Jumlah maksimum yang kembali"},
"dropletBlock_randomNumber_signatureOverride":function(d){return "Nomoracak (min, max)"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "Nomoracak (min, max)"},
"dropletBlock_return_description":function(d){return "Kembalikan nilai dari suatu fungsi"},
"dropletBlock_return_signatureOverride":function(d){return "kembali"},
"dropletBlock_setAttribute_description":function(d){return "Mengatur nilai yang diberikan"},
"dropletBlock_subtractOperator_description":function(d){return "Kurangi dua nomor"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Kurangi operator"},
"dropletBlock_whileBlock_description":function(d){return "Menciptakan loop/perulangan yang terdiri dari ekspresi kondisional dan blok pernyataan dieksekusi untuk setiap iterasi dari loop. Loop terus melaksanakan selama kondisi bernilai true/benar"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"emptyBlockInFunction":function(d){return "Fungsi "+common_locale.v(d,"name")+" memiliki input yang belum terisi."},
"emptyBlockInVariable":function(d){return "Variabel "+common_locale.v(d,"name")+" memiliki input yang belum terisi."},
"emptyBlocksErrorMsg":function(d){return "Blok \"Ulangi\" atau blok \"Jika\" membutuhkan blok lain di dalamnya supaya bisa bekerja. Pastikan blok yang berada didalam diletakkan secara pas."},
"emptyExampleBlockErrorMsg":function(d){return "Anda memerlukan setidaknya satu contoh di fungsi "+common_locale.v(d,"functionName")+". Pastikan setiap contoh memiliki panggilan dan hasil."},
"emptyFunctionBlocksErrorMsg":function(d){return "Blok fungsi membutuhkan blok lain di dalamnya agar dapat bekerja."},
"emptyFunctionalBlock":function(d){return "Kamu memiliki blok dengan input yang belum terisi."},
"emptyTopLevelBlock":function(d){return "Tidak ada kotak lagi untuk dijalankan. Kamu harus memasang kotak-kotak tersebut ke dalam kotak "+common_locale.v(d,"topLevelBlockName")+"."},
"end":function(d){return "akhir"},
"errorEmptyFunctionBlockModal":function(d){return "Diharuskan adanya blok di dalam fungsi mu. Klik \"sunting\" lalu geser blok itu ke dalam Blok Hijau."},
"errorIncompleteBlockInFunction":function(d){return "Klik \"sunting\" untuk memastikan bahwa Anda tidak menyisakan satupun blok di dalam fungsi ini."},
"errorParamInputUnattached":function(d){return "Jangan lupa untuk memasang blok pada setiap parameter masukan di dalam blok fungsi pada program ini."},
"errorQuestionMarksInNumberField":function(d){return "Cobalah mengganti \"???\" dengan sebuah nilai."},
"errorRequiredParamsMissing":function(d){return "Buatlah sebuah parameter untuk fungsi ini dengan mengklik \"sunting\" dan menambahkan parameter yang diperlukan. Geser blok parameter baru tersebut ke dalam fungsi ini."},
"errorUnusedFunction":function(d){return "Anda membuat sebuah fungsi, tetapi tidak digunakan dalam program ini! Klik tombol \"Fungsi\" pada Kotak Perkakas dan pastikan Anda menggunakan fungsi tersebut."},
"errorUnusedParam":function(d){return "Anda menambahkan blok parameter, tapi tidak digunakan kemudian. Klik \"sunting\" untuk memastikan penggunaan parameter tersebut dan menempatkannya di blok parameter di dalam Blok Hijau."},
"exampleErrorMessage":function(d){return "Fungsi "+common_locale.v(d,"functionName")+" memiliki satu atau beberapa contoh yang perlu menyesuaikan. Pastikan mereka cocok dengan definisi Anda dan jawab pertanyaan."},
"examplesFailedOnClose":function(d){return "Satu atau lebih contoh Anda tidak cocok dengan definisi Anda. Periksa contoh Anda sebelum keluar"},
"extraTopBlocks":function(d){return "Anda memiliki blok yang tak terpasang."},
"extraTopBlocksWhenRun":function(d){return "Kamu memiliki blok yang belum terpasang. Apakah kamu bermaksud untuk memasang blok-blok ini dengan blok \"ketika dijalankan\"?"},
"finalStage":function(d){return "Horee! Anda berhasil menyelesaikan tahap akhir."},
"finalStageTrophies":function(d){return "Horee! Anda berhasil menyelesaikan tahap akhir dan memenangkan "+common_locale.p(d,"numTrophies",0,"id",{"one":"piala","other":"piala "+common_locale.n(d,"numTrophies")})+"."},
"finish":function(d){return "Selesai"},
"generatedCodeInfo":function(d){return "Bahkan Universitas mengajar blok berbasis pengkodean (misalnya, "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+"). Tetapi di bawah tenda, blok Anda telah berkumpul dapat juga ditunjukkan dalam JavaScript, dunia yang paling banyak digunakan pengkodean bahasa:"},
"hashError":function(d){return "Maaf, '%1' tidak sesuai dengan program yang disimpan."},
"help":function(d){return "Tolong"},
"hideToolbox":function(d){return "(Sembunyikan)"},
"hintHeader":function(d){return "Berikut adalah tip:"},
"hintRequest":function(d){return "Lihat petunjuk"},
"hintTitle":function(d){return "Tips:"},
"ignore":function(d){return "Abaikan"},
"infinity":function(d){return "∞"},
"jump":function(d){return "lompat"},
"keepPlaying":function(d){return "Terus bermain"},
"levelIncompleteError":function(d){return "Anda telah gunakan semua jenis blok yang diperlukan  tetapi tidak dengan cara yang tepat."},
"listVariable":function(d){return "list"},
"makeYourOwnFlappy":function(d){return "Buatlah permainan \"Flappy\" versi Anda sendiri"},
"missingRecommendedBlocksErrorMsg":function(d){return "Kurang tepat. Coba gunakan blok yang belum Anda gunakan."},
"missingRequiredBlocksErrorMsg":function(d){return "Kurang tepat. Anda harus menggunakan blok yang belum Anda gunakan."},
"nestedForSameVariable":function(d){return "Anda menggunakan variabel yang sama di dalam dua atau lebih nested loop. Gunakan nama-nama variabel yang unik untuk menghindari loop tak terbatas."},
"nextLevel":function(d){return "Horee! Anda berhasil menyelesaikan teka-teki ke  "+common_locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Horee! Anda berhasil menyelesaikan teka-teki ke  "+common_locale.v(d,"puzzleNumber")+" dan memenangkan "+common_locale.p(d,"numTrophies",0,"id",{"satu":"a trophy","other":"trophies "+common_locale.n(d,"numTrophies")})+"."},
"nextPuzzle":function(d){return "Teka-Teki Berikutnya"},
"nextStage":function(d){return "Selamat! Anda telah menyelesaikan "+common_locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Horee! Anda berhasil menyelesaikan teka-teki ke "+common_locale.v(d,"stageNumber")+" dan memenangkan "+common_locale.p(d,"numTrophies",0,"id",{"one":"piala","other":common_locale.n(d,"numTrophies")+" piala"})+"."},
"numBlocksNeeded":function(d){return "Horee! Anda berhasil menyelesaikan teka-teki ke  "+common_locale.v(d,"puzzleNumber")+". (Namun, sebetulnya Anda cukup gunakan hanya "+common_locale.p(d,"numBlocks",0,"id",{"one":"1 blok","other":"blok "+common_locale.n(d,"numBlocks")})+".)"},
"numLinesOfCodeWritten":function(d){return "Anda baru saja menulis "+common_locale.p(d,"numLines",0,"id",{"one":"1 baris","other":common_locale.n(d,"numLines")+" baris"})+" kode!"},
"openWorkspace":function(d){return "Cara kerjanya"},
"orientationLock":function(d){return "Matikan orientasi kunci dalam pengaturan perangkat."},
"play":function(d){return "mainkan"},
"print":function(d){return "Cetak"},
"puzzleTitle":function(d){return "Teka-teki ke "+common_locale.v(d,"puzzle_number")+" dari "+common_locale.v(d,"stage_total")},
"readonlyWorkspaceHeader":function(d){return "Lihat: "},
"repeat":function(d){return "Ulangi"},
"resetProgram":function(d){return "Kembali ke awal"},
"rotateText":function(d){return "Memutar perangkat anda."},
"runProgram":function(d){return "Jalankan"},
"runTooltip":function(d){return "Jalankan program yang dibuat di blok ruang kerja."},
"runtimeErrorMsg":function(d){return "Program Anda tidak sukses berjalan. Segera hilangkan line "+common_locale.v(d,"lineNumber")+" dan ulangi kembali."},
"saveToGallery":function(d){return "Simpan di Galeri"},
"savedToGallery":function(d){return "Tersimpan di Galeri!"},
"score":function(d){return "Skor"},
"shareFailure":function(d){return "Maaf, kami tidak bisa membagikan program ini."},
"shareWarningsAge":function(d){return "Tolong isikan umur Anda dibawah dan klik OK untuk melanjutkan."},
"shareWarningsMoreInfo":function(d){return "Lebih Lanjut"},
"shareWarningsStoreData":function(d){return "Aplikasi ini dibangun dengan kode Studio dan data yang disimpan dapat dilihat oleh siapa saja dengan mebagikan link ini, jadi hati-hati jika Anda diminta untuk memberikan informasi pribadi."},
"showBlocksHeader":function(d){return "Tampilkan blok-blok"},
"showCodeHeader":function(d){return "Tampilkan kode"},
"showGeneratedCode":function(d){return "Tampilkan kode"},
"showTextHeader":function(d){return "Tampilkan Teks"},
"showToolbox":function(d){return "Tampilkan Perangkat kerja"},
"showVersionsHeader":function(d){return "Riwayat Versi"},
"signup":function(d){return "Daftarlah untuk mengikuti kursus introduksi"},
"stringEquals":function(d){return "string=?"},
"submit":function(d){return "Kirim"},
"submitYourProject":function(d){return "Kirim proyek Anda"},
"submitYourProjectConfirm":function(d){return "Anda tidak dapat mengedit proyek Anda setelah mengirim, benar-benar kirimkan?"},
"unsubmit":function(d){return "Unsubmit"},
"unsubmitYourProject":function(d){return "Unsubmit proyek Anda"},
"unsubmitYourProjectConfirm":function(d){return "Unsubmitting proyek Anda akan mengatur ulang tanggal diterbitkan, benar-benar unsubmit?"},
"subtitle":function(d){return "Perangkat pemrograman visual"},
"syntaxErrorMsg":function(d){return "Terdapat salah tik pada program Anda. Tolong hapus line "+common_locale.v(d,"lineNumber")+" dan ulangi kembali."},
"textVariable":function(d){return "teks"},
"toggleBlocksErrorMsg":function(d){return "Kamu perlu memperbaiki kesalahan di dalam program kamu sebelum dapat ditunjukkan sebagai blok."},
"tooFewBlocksMsg":function(d){return "Anda telah gunakan semua jenis blok diperlukan, tetapi cobalah menggunakan lebih banyak blok-blok ini supaya anda dapat menyelesaikan teka-teki ini."},
"tooManyBlocksMsg":function(d){return "Teka-teki ini dapat diselesaikan dengan blok < x id = 'START_SPAN' /> < x id = 'END_SPAN'/>."},
"tooMuchWork":function(d){return "Anda membuat saya melakukan terlalu banyak pekerjaan!  Bisakan Anda coba membuat pengulangan yang lebih sedikit?"},
"toolboxHeader":function(d){return "blok"},
"toolboxHeaderDroplet":function(d){return "Perangkat kerja"},
"totalNumLinesOfCodeWritten":function(d){return "Total keseluruhan: "+common_locale.p(d,"numLines",0,"id",{"one":"1 baris","other":common_locale.n(d,"numLines")+" baris"})+" kode."},
"tryAgain":function(d){return "Coba Lagi"},
"tryBlocksBelowFeedback":function(d){return "Coba gunakan salah satu blok di bawah ini:"},
"tryHOC":function(d){return "Cobalah \"Hour of Code\""},
"unnamedFunction":function(d){return "Anda memiliki variabel atau fungsi yang belum memiliki nama. Jangan lupa untuk menamai semuanya secara deskriptif."},
"wantToLearn":function(d){return "Ingin belajar untuk mengkode?"},
"watchVideo":function(d){return "Tonton Videonya"},
"when":function(d){return "ketika"},
"whenRun":function(d){return "ketika dijalankan"},
"workspaceHeaderShort":function(d){return "Area kerja: "},
"copy":function(d){return "Copy"},
"sendToPhone":function(d){return "Send To Phone"}};