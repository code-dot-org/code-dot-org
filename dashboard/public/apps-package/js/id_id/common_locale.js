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
"booleanTrue":function(d){return "Benar"},
"booleanFalse":function(d){return "Salah"},
"blocks":function(d){return "blok"},
"blocklyMessage":function(d){return "Blockly"},
"catActions":function(d){return "Aksi"},
"catColour":function(d){return "Warna"},
"catLogic":function(d){return "Logika"},
"catLists":function(d){return "List"},
"catLoops":function(d){return "Loop"},
"catMath":function(d){return "Matematika"},
"catProcedures":function(d){return "Fungsi"},
"catText":function(d){return "teks"},
"catVariables":function(d){return "Variabel"},
"clearPuzzle":function(d){return "Memulai ulang"},
"clearPuzzleConfirm":function(d){return "Ini akan mengembalikan teka-teki ke keadaan awal dan menghapus semua blok yang Anda tambahkan atau ubah."},
"clearPuzzleConfirmHeader":function(d){return "Apakah Anda yakin Anda ingin memulai dari awal?"},
"codeMode":function(d){return "kode"},
"codeTooltip":function(d){return "Lihat kode JavaScript."},
"continue":function(d){return "Lanjutkan"},
"designMode":function(d){return "Desain"},
"designModeHeader":function(d){return "Mode Desain"},
"dialogCancel":function(d){return "Batal"},
"dialogOK":function(d){return "Oke!"},
"directionNorthLetter":function(d){return "U"},
"directionSouthLetter":function(d){return "S"},
"directionEastLetter":function(d){return "T"},
"directionWestLetter":function(d){return "B"},
"dropletBlock_addOperator_description":function(d){return "tambahkan dua nomor"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Add operator"},
"dropletBlock_andOperator_description":function(d){return "Pengembalian nilai true hanya bisa jika kedua ekspresi adalah benar dan sebaliknya jika salah"},
"dropletBlock_andOperator_signatureOverride":function(d){return "Operator boolean AND"},
"dropletBlock_arcLeft_description":function(d){return "Pindahkan penyu di busur berlawanan arah jarum jam menggunakan nomor tertentu derajat dan radius"},
"dropletBlock_arcLeft_param0":function(d){return "angle"},
"dropletBlock_arcLeft_param1":function(d){return "Radius"},
"dropletBlock_arcRight_description":function(d){return "Pindahkan penyu di busur searah jarum jam menggunakan nomor tertentu derajat dan radius"},
"dropletBlock_arcRight_param0":function(d){return "angle"},
"dropletBlock_arcRight_param1":function(d){return "Radius"},
"dropletBlock_assign_x_description":function(d){return "menetapkan kembali sebuah variabel"},
"dropletBlock_assign_x_signatureOverride":function(d){return "Assign a variable"},
"dropletBlock_button_description":function(d){return "buatlah sebuah tombol dan tetapkan sebuah elemen id"},
"dropletBlock_button_param0":function(d){return "buttonId"},
"dropletBlock_button_param1":function(d){return "teks"},
"dropletBlock_callMyFunction_description":function(d){return "panggil sebuah nama fungsi yang tidak membutuhkan parameter"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Panggil sebuah fungsi"},
"dropletBlock_callMyFunction_n_description":function(d){return "panggil sebuah nama fungsi yang mengambil satu parameter atau lebih"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Panggil sebuah fungsi dengan parameter"},
"dropletBlock_changeScore_description":function(d){return "Menambah atau menghapus satu angka untuk Skor."},
"dropletBlock_checkbox_description":function(d){return "buat sebuah checkbox/kotak centang dan tetapkan elemen id"},
"dropletBlock_checkbox_param0":function(d){return "checkboxId"},
"dropletBlock_checkbox_param1":function(d){return "checked"},
"dropletBlock_circle_description":function(d){return "gambarkan sebuah lingkaran diatas kanvas aktif dengan koordinat tertentu unutk pusat (x, y) dan radius"},
"dropletBlock_circle_param0":function(d){return "pusat X"},
"dropletBlock_circle_param1":function(d){return "pusat Y"},
"dropletBlock_circle_param2":function(d){return "Radius"},
"dropletBlock_clearCanvas_description":function(d){return "Menghapus semua data pada kanvas yang aktif"},
"dropletBlock_clearInterval_description":function(d){return "Hapus timer interval yang ada dengan melewatkan nilai kembalian dari setInterval ()"},
"dropletBlock_clearInterval_param0":function(d){return "interval"},
"dropletBlock_clearTimeout_description":function(d){return "Hapus timer yang ada dengan melewatkan nilai kembalian dari setTimeout ()"},
"dropletBlock_clearTimeout_param0":function(d){return "timeout"},
"dropletBlock_console.log_description":function(d){return "Tampilkan string atau variabel dalam tampilan konsol"},
"dropletBlock_console.log_param0":function(d){return "Pesan"},
"dropletBlock_container_description":function(d){return "Buat wadah pembagian dengan id elemen tertentu, dan  atur HTML dalamnya secara bebas"},
"dropletBlock_createCanvas_description":function(d){return "Buat kanvas dengan id tertentu, dan secara bebas mengatur lebar dan tinggi dimensi"},
"dropletBlock_createCanvas_param0":function(d){return "Id kanvas"},
"dropletBlock_createCanvas_param1":function(d){return "Lebar"},
"dropletBlock_createCanvas_param2":function(d){return "tinggi"},
"dropletBlock_createRecord_description":function(d){return "menggunakan tabel penyimpanan data App Lab, menciptakan record/baris dengan id unik di nama tabel yang disediakan, dan memanggil fungsi callback setelah tindakan selesai."},
"dropletBlock_createRecord_param0":function(d){return "NamaTabel"},
"dropletBlock_createRecord_param1":function(d){return "record/baris"},
"dropletBlock_createRecord_param2":function(d){return "onSuccess"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "Membuat variabel dan menginisialisasi sebagai array"},
"dropletBlock_declareAssign_x_array_1_4_signatureOverride":function(d){return "Declare a variable assigned to an array"},
"dropletBlock_declareAssign_x_description":function(d){return "Menyatakan sebuah variabel dengan nama yang telah diberikan setelah 'var', dan menetapkannya kepada nilai di sisi kanan dari ekspresi"},
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "Mendeklarasikan sebuah variabel"},
"dropletBlock_declareAssign_x_prompt_description":function(d){return "Membuat variabel dan menetapkan nilai dengan menampilkan prompt"},
"dropletBlock_declareAssign_x_prompt_signatureOverride":function(d){return "Prompt the user for a value and store it"},
"dropletBlock_deleteElement_description":function(d){return "Menghapus elemen dengan id tertentu"},
"dropletBlock_deleteElement_param0":function(d){return "id"},
"dropletBlock_deleteRecord_description":function(d){return "Menggunakan tabel penyimpanan data App Lab, menghapus record/baris yang disediakan di dalam NamaTabel. Record/baris adalah sebuah objek yang harus diidentifikasi secara unik dengan field/kolom id. ketika pemanggilan selesai, Fungsi callback dipanggil."},
"dropletBlock_deleteRecord_param0":function(d){return "NamaTabel"},
"dropletBlock_deleteRecord_param1":function(d){return "record/baris"},
"dropletBlock_deleteRecord_param2":function(d){return "onSuccess"},
"dropletBlock_divideOperator_description":function(d){return "Membagi dua nomor"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "Divide operator"},
"dropletBlock_dot_description":function(d){return "Menggambar titik lokasi kura-kura dengan jari-jari tertentu"},
"dropletBlock_dot_param0":function(d){return "Radius"},
"dropletBlock_drawImage_description":function(d){return "Menggambar Gambar pada kanvas yang aktif dengan elemen gambar tertentu dan x, y sebagai koordinat kiri atas"},
"dropletBlock_drawImage_param0":function(d){return "id"},
"dropletBlock_drawImage_param1":function(d){return "x"},
"dropletBlock_drawImage_param2":function(d){return "y"},
"dropletBlock_drawImage_param3":function(d){return "Lebar"},
"dropletBlock_drawImage_param4":function(d){return "tinggi"},
"dropletBlock_dropdown_description":function(d){return "Buat dropdown, menetapkan id elemen, dan mengisinya dengan daftar item"},
"dropletBlock_dropdown_signatureOverride":function(d){return "dropdown(dropdownID, option1, option2, ..., optionX)"},
"dropletBlock_equalityOperator_description":function(d){return "Test for equality"},
"dropletBlock_equalityOperator_signatureOverride":function(d){return "Equality operator"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "Membuat loop yang terdiri dari sebuah ekspresi inisialisasi, ekspresi kondisional, ekspresi incrementing, dan suatu blok statemen dieksekusi untuk setiap iterasi dari loop"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "untuk pengulangan/loop"},
"dropletBlock_functionParams_n_description":function(d){return "Satu set pernyataan yang mengambil satu atau lebih parameter, dan melakukan tugas atau menghitung nilai saat fungsi ini dipanggil"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "definisikan suatu fungsi dengan parameter"},
"dropletBlock_functionParams_none_description":function(d){return "Serangkaian pernyataan yang melaksanakan tugas atau menghitung nilai saat fungsi dipanggil"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "Mendefinisikan fungsi"},
"dropletBlock_getAlpha_description":function(d){return "Gets the alpha"},
"dropletBlock_getAlpha_param0":function(d){return "Data Gambar"},
"dropletBlock_getAlpha_param1":function(d){return "x"},
"dropletBlock_getAlpha_param2":function(d){return "y"},
"dropletBlock_getAttribute_description":function(d){return "Mendapatkan atribut tertentu"},
"dropletBlock_getBlue_description":function(d){return "Gets the given blue value"},
"dropletBlock_getBlue_param0":function(d){return "Data Gambar"},
"dropletBlock_getBlue_param1":function(d){return "x"},
"dropletBlock_getBlue_param2":function(d){return "y"},
"dropletBlock_getChecked_description":function(d){return "Mendapatkan kondisi dari  checkbox atau radio button"},
"dropletBlock_getChecked_param0":function(d){return "id"},
"dropletBlock_getDirection_description":function(d){return "Get the turtle's direction (0 degrees is pointing up)"},
"dropletBlock_getGreen_description":function(d){return "Gets the given green value"},
"dropletBlock_getGreen_param0":function(d){return "Data Gambar"},
"dropletBlock_getGreen_param1":function(d){return "x"},
"dropletBlock_getGreen_param2":function(d){return "y"},
"dropletBlock_getImageData_description":function(d){return "Get the ImageData for a rectangle (x, y, width, height) within the active  canvas"},
"dropletBlock_getImageData_param0":function(d){return "startX"},
"dropletBlock_getImageData_param1":function(d){return "startY"},
"dropletBlock_getImageData_param2":function(d){return "endX"},
"dropletBlock_getImageData_param3":function(d){return "endY"},
"dropletBlock_getImageURL_description":function(d){return "Get the URL associated with an image or image upload button"},
"dropletBlock_getImageURL_param0":function(d){return "imageID"},
"dropletBlock_getKeyValue_description":function(d){return "Reads the value associated with the key from the remote data store."},
"dropletBlock_getKeyValue_param0":function(d){return "kunci"},
"dropletBlock_getKeyValue_param1":function(d){return "callbackFunction"},
"dropletBlock_getRed_description":function(d){return "Gets the given red value"},
"dropletBlock_getRed_param0":function(d){return "Data Gambar"},
"dropletBlock_getRed_param1":function(d){return "x"},
"dropletBlock_getRed_param2":function(d){return "y"},
"dropletBlock_getText_description":function(d){return "Dapatkan teks dari elemen tertentu"},
"dropletBlock_getText_param0":function(d){return "id"},
"dropletBlock_getTime_description":function(d){return "Dapatkan waktu saat ini dalam milidetik"},
"dropletBlock_getUserId_description":function(d){return "Dapatkan identifikasi unik bagi pengguna saat ini  dari aplikasi ini"},
"dropletBlock_getX_description":function(d){return "Mendapatkan koordinat y saat ini dalam pixel pada penyu"},
"dropletBlock_getXPosition_description":function(d){return "Dapatkan posisi elemen x"},
"dropletBlock_getXPosition_param0":function(d){return "id"},
"dropletBlock_getY_description":function(d){return "Mendapatkan koordinat y saat ini dalam pixel pada penyu"},
"dropletBlock_getYPosition_description":function(d){return "Dapatkan posisi elemen y"},
"dropletBlock_getYPosition_param0":function(d){return "id"},
"dropletBlock_greaterThanOperator_description":function(d){return "Compare two numbers"},
"dropletBlock_greaterThanOperator_signatureOverride":function(d){return "Greater than operator"},
"dropletBlock_hide_description":function(d){return "Menyembunyikan kura-kura sehingga tidak ditampilkan di layar"},
"dropletBlock_hideElement_description":function(d){return "Hide the element with the specified id"},
"dropletBlock_hideElement_param0":function(d){return "id"},
"dropletBlock_ifBlock_description":function(d){return "Mengeksekusi blok pernyataan jika kondisi tertentu adalah benar"},
"dropletBlock_ifBlock_signatureOverride":function(d){return "pernyataan if"},
"dropletBlock_ifElseBlock_description":function(d){return "Mengeksekusi blok pernyataan jika kondisi tertentu adalah benar; jika tidak, blok pernyataan dalam klausa yang lain dijalankan"},
"dropletBlock_ifElseBlock_signatureOverride":function(d){return "pernyataan if/else"},
"dropletBlock_image_description":function(d){return "Create an image and assign it an element id"},
"dropletBlock_image_param0":function(d){return "id"},
"dropletBlock_image_param1":function(d){return "URL"},
"dropletBlock_imageUploadButton_description":function(d){return "Buat tombol upload gambar dan tetapkan elemen id"},
"dropletBlock_inequalityOperator_description":function(d){return "Test for inequality"},
"dropletBlock_inequalityOperator_signatureOverride":function(d){return "Inequality operator"},
"dropletBlock_innerHTML_description":function(d){return "Mengatur innerHTML untuk elemen dengan id tertentu"},
"dropletBlock_lessThanOperator_description":function(d){return "Compare two numbers"},
"dropletBlock_lessThanOperator_signatureOverride":function(d){return "Less than operator"},
"dropletBlock_line_description":function(d){return "Menggambar garis di kanvas aktif dari x1, y1 ke x2, y2."},
"dropletBlock_line_param0":function(d){return "x 1"},
"dropletBlock_line_param1":function(d){return "y1"},
"dropletBlock_line_param2":function(d){return "x 2"},
"dropletBlock_line_param3":function(d){return "Y2"},
"dropletBlock_mathAbs_description":function(d){return "Mengambil nilai absolut x"},
"dropletBlock_mathAbs_signatureOverride":function(d){return "Math.ABS(x)"},
"dropletBlock_mathMax_description":function(d){return "Mengambil nilai maksimum antara satu atau lebih nilai n1, n2,..., nX"},
"dropletBlock_mathMax_signatureOverride":function(d){return "Math.Max (n1, n2,..., nX)"},
"dropletBlock_mathMin_description":function(d){return "Mengambil nilai minimum antara satu atau lebih nilai n1, n2,..., nX"},
"dropletBlock_mathMin_signatureOverride":function(d){return "Math.Min (n1, n2,..., nX)"},
"dropletBlock_mathRound_description":function(d){return "Round to the nearest integer"},
"dropletBlock_mathRound_signatureOverride":function(d){return "Math.round(x)"},
"dropletBlock_move_description":function(d){return "Memindahkan kura-kura dari lokasi saat ini. Menambahkan x untuk posisi x kura-kura dan y untuk posisi y kura-kura"},
"dropletBlock_move_param0":function(d){return "x"},
"dropletBlock_move_param1":function(d){return "y"},
"dropletBlock_moveBackward_description":function(d){return "Memindahkan penyu ke belakang yang diberikan beberapa piksel di arah saat ini"},
"dropletBlock_moveBackward_param0":function(d){return "piksel"},
"dropletBlock_moveForward_description":function(d){return "Memindahkan penyu ke depan yang diberikan beberapa piksel di arah saat ini"},
"dropletBlock_moveForward_param0":function(d){return "piksel"},
"dropletBlock_moveTo_description":function(d){return "Bergerak penyu ke koordinat x, y tertentu di layar"},
"dropletBlock_moveTo_param0":function(d){return "x"},
"dropletBlock_moveTo_param1":function(d){return "y"},
"dropletBlock_multiplyOperator_description":function(d){return "Mengalikan dua nomor"},
"dropletBlock_multiplyOperator_signatureOverride":function(d){return "Multiply operator"},
"dropletBlock_notOperator_description":function(d){return "Kembali ke pernyataan false/salah jika ekspresi dapat dikonversi ke nilai benar/true; Jika tidak, kembalikan nilai true"},
"dropletBlock_notOperator_signatureOverride":function(d){return "AND boolean operator"},
"dropletBlock_onEvent_description":function(d){return "Execute code in response to the specified event."},
"dropletBlock_onEvent_param0":function(d){return "id"},
"dropletBlock_onEvent_param1":function(d){return "Event"},
"dropletBlock_onEvent_param2":function(d){return "function"},
"dropletBlock_orOperator_description":function(d){return "Mengembalikan nilai true bila salah satu ekspresi benar dan yang salah sebaliknya"},
"dropletBlock_orOperator_signatureOverride":function(d){return "operator boolean OR"},
"dropletBlock_penColor_description":function(d){return "Menetapkan warna dari garis yang digambar di belakang kura-kura ketika bergerak"},
"dropletBlock_penColor_param0":function(d){return "warna"},
"dropletBlock_penColour_description":function(d){return "Menetapkan warna dari garis yang digambar di belakang kura-kura ketika bergerak"},
"dropletBlock_penColour_param0":function(d){return "warna"},
"dropletBlock_penDown_description":function(d){return "Mengakibatkan garis ditarik di belakang kura-kura ketika bergerak"},
"dropletBlock_penUp_description":function(d){return "Menghentikan kura-kura dari menggambar garis belakangnya ketika bergerak"},
"dropletBlock_penWidth_description":function(d){return "Set the turtle to the specified pen width"},
"dropletBlock_penWidth_param0":function(d){return "Lebar"},
"dropletBlock_playSound_description":function(d){return "Putar file suara MP3, OGG atau WAV  dari URL tertentu"},
"dropletBlock_playSound_param0":function(d){return "URL"},
"dropletBlock_putImageData_description":function(d){return "Set the ImageData for a rectangle within the active  canvas with x, y as the top left coordinates"},
"dropletBlock_putImageData_param0":function(d){return "Data Gambar"},
"dropletBlock_putImageData_param1":function(d){return "startX"},
"dropletBlock_putImageData_param2":function(d){return "startY"},
"dropletBlock_radioButton_description":function(d){return "Create a radio button and assign it an element id"},
"dropletBlock_radioButton_param0":function(d){return "id"},
"dropletBlock_radioButton_param1":function(d){return "checked"},
"dropletBlock_radioButton_param2":function(d){return "group"},
"dropletBlock_randomNumber_max_description":function(d){return "Get a random number between 0 and the specified maximum value"},
"dropletBlock_randomNumber_max_signatureOverride":function(d){return "randomNumber(max)"},
"dropletBlock_randomNumber_min_max_description":function(d){return "Get a random number between the specified minimum and maximum values"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_readRecords_description":function(d){return "Menggunakan tabel penyimpanan data App Lab, baca baris/record dari NamaTabel/tableName yang cocok dengan searchTerms/Syarat pencarian yang tersedia. Bila panggilan selesai, callbackFunction/fungsi callback dipanggil dan melewati larik/array dari baris/record."},
"dropletBlock_readRecords_param0":function(d){return "NamaTabel"},
"dropletBlock_readRecords_param1":function(d){return "searchParams"},
"dropletBlock_readRecords_param2":function(d){return "onSuccess"},
"dropletBlock_rect_description":function(d){return "gambarlah persegi panjang ke kanvas aktif yang terletak di upperLeftX/atas Kiri X dan upperLeftY/atas Kiri Y, dan ukuran lebar dan ukuran tinggi."},
"dropletBlock_rect_param0":function(d){return "upperLeftX/atas Kiri X"},
"dropletBlock_rect_param1":function(d){return "upperLeftY/atas Kiri Y"},
"dropletBlock_rect_param2":function(d){return "Lebar"},
"dropletBlock_rect_param3":function(d){return "tinggi"},
"dropletBlock_return_description":function(d){return "Kembalikan nilai dari suatu fungsi"},
"dropletBlock_return_signatureOverride":function(d){return "kembali"},
"dropletBlock_setActiveCanvas_description":function(d){return "Set the canvas id for subsequent canvas commands (only needed when there are multiple canvas elements)"},
"dropletBlock_setActiveCanvas_param0":function(d){return "Id kanvas"},
"dropletBlock_setAlpha_description":function(d){return "Sets the given value"},
"dropletBlock_setAlpha_param0":function(d){return "Data Gambar"},
"dropletBlock_setAlpha_param1":function(d){return "x"},
"dropletBlock_setAlpha_param2":function(d){return "y"},
"dropletBlock_setAlpha_param3":function(d){return "alphaValue"},
"dropletBlock_setAttribute_description":function(d){return "Mengatur nilai yang diberikan"},
"dropletBlock_setBackground_description":function(d){return "tetapkan latar belakang gambar"},
"dropletBlock_setBlue_description":function(d){return "Mengatur jumlah yang berwarna biru (berkisar dari 0 hingga 255) dalam warna pixel pixel yang diberikan terletak pada posisi x  dan posisi y dalam data gambar yang diberikan dengan jumlah masukan nilai biru/blueValue."},
"dropletBlock_setBlue_param0":function(d){return "Data Gambar"},
"dropletBlock_setBlue_param1":function(d){return "x"},
"dropletBlock_setBlue_param2":function(d){return "y"},
"dropletBlock_setBlue_param3":function(d){return "blueValue/Nilai Biru"},
"dropletBlock_setChecked_description":function(d){return "Atur kondisi dari checkbox atau radio button"},
"dropletBlock_setChecked_param0":function(d){return "id"},
"dropletBlock_setChecked_param1":function(d){return "checked"},
"dropletBlock_setFillColor_description":function(d){return "Set the fill color for the active  canvas"},
"dropletBlock_setFillColor_param0":function(d){return "warna"},
"dropletBlock_setGreen_description":function(d){return "Menetapkan jumlah warna hijau (berkisar dari 0 hingga 255) dalam warna pixel yang diberikan terletak pada posisi x  dan posisi y dalam data gambar yang diberikan dengan jumlah masukan nilai hijau/greenValue."},
"dropletBlock_setGreen_param0":function(d){return "Data Gambar"},
"dropletBlock_setGreen_param1":function(d){return "x"},
"dropletBlock_setGreen_param2":function(d){return "y"},
"dropletBlock_setGreen_param3":function(d){return "greenValue/Nilai Hijau"},
"dropletBlock_setImageURL_description":function(d){return "Set the URL for the specified image element id"},
"dropletBlock_setImageURL_param0":function(d){return "id"},
"dropletBlock_setImageURL_param1":function(d){return "URL"},
"dropletBlock_setInterval_description":function(d){return "Continue to execute code each time the specified number of milliseconds has elapsed"},
"dropletBlock_setInterval_param0":function(d){return "callbackFunction"},
"dropletBlock_setInterval_param1":function(d){return "milliseconds/milidetik"},
"dropletBlock_setKeyValue_description":function(d){return "Sediakan sepasang kunci / nilai di kunci / nilai penyimpanan data App Lab , dan panggil Fungsi callback ketika aksi selesai."},
"dropletBlock_setKeyValue_param0":function(d){return "kunci"},
"dropletBlock_setKeyValue_param1":function(d){return "nilai"},
"dropletBlock_setKeyValue_param2":function(d){return "callbackFunction"},
"dropletBlock_setParent_description":function(d){return "Atur elemen untuk menjadi anak dari elemen induk"},
"dropletBlock_setPosition_description":function(d){return "Posisikan sebuah elemen dengan Koordinat x, y, lebar, dan tinggi"},
"dropletBlock_setPosition_param0":function(d){return "id"},
"dropletBlock_setPosition_param1":function(d){return "x"},
"dropletBlock_setPosition_param2":function(d){return "y"},
"dropletBlock_setPosition_param3":function(d){return "Lebar"},
"dropletBlock_setPosition_param4":function(d){return "tinggi"},
"dropletBlock_setRed_description":function(d){return "Mengatur jumlah yang berwarna merah (mulai dari 0 sampai 255) dalam warna pixel yang diberikan terletak pada posisi x  dan posisi y dalam data gambar yang diberikan pada jumlah masukan nilai merah."},
"dropletBlock_setRed_param0":function(d){return "Data Gambar"},
"dropletBlock_setRed_param1":function(d){return "x"},
"dropletBlock_setRed_param2":function(d){return "y"},
"dropletBlock_setRed_param3":function(d){return "redValue/Nilai Merah"},
"dropletBlock_setRGB_description":function(d){return "Sets the RGB color values (ranging from 0 to 255) of the pixel located at the given x and y position in the given image data to the input red, green, blue amounts"},
"dropletBlock_setRGB_param0":function(d){return "Data Gambar"},
"dropletBlock_setRGB_param1":function(d){return "x"},
"dropletBlock_setRGB_param2":function(d){return "y"},
"dropletBlock_setRGB_param3":function(d){return "merah"},
"dropletBlock_setRGB_param4":function(d){return "hijau"},
"dropletBlock_setRGB_param5":function(d){return "biru"},
"dropletBlock_setStrokeColor_description":function(d){return "Atur goresan warna untuk kanvas aktif"},
"dropletBlock_setStrokeColor_param0":function(d){return "warna"},
"dropletBlock_setSprite_description":function(d){return "atur gambar aktor"},
"dropletBlock_setSpriteEmotion_description":function(d){return "Tetapkan suasana hati aktor"},
"dropletBlock_setSpritePosition_description":function(d){return "gerakkan langsung aktor ke tempat yang ditentukan"},
"dropletBlock_setSpriteSpeed_description":function(d){return "atur kecepatan aktor"},
"dropletBlock_setStrokeWidth_description":function(d){return "Atur lebar garis untuk kanvas yang aktif"},
"dropletBlock_setStrokeWidth_param0":function(d){return "Lebar"},
"dropletBlock_setStyle_description":function(d){return "Tambahkan teks Style CSS  ke sebuah elemen"},
"dropletBlock_setText_description":function(d){return "Tetapkan teks untuk elemen tertentu"},
"dropletBlock_setText_param0":function(d){return "id"},
"dropletBlock_setText_param1":function(d){return "teks"},
"dropletBlock_setTimeout_description":function(d){return "Atur timer dan eksekusi kode ketika jumlah milidetik itu telah terlewati"},
"dropletBlock_setTimeout_param0":function(d){return "function"},
"dropletBlock_setTimeout_param1":function(d){return "milliseconds/milidetik"},
"dropletBlock_show_description":function(d){return "Menunjukkan penyu di layar, dengan membuatnya terlihat di lokasi yang sekarang"},
"dropletBlock_showElement_description":function(d){return "Show the element with the specified id"},
"dropletBlock_showElement_param0":function(d){return "id"},
"dropletBlock_speed_description":function(d){return "Change the execution speed of the program to the specified percentage value"},
"dropletBlock_speed_param0":function(d){return "nilai"},
"dropletBlock_startWebRequest_description":function(d){return "Meminta data dari internet dan mengeksekusi kode ketika permintaan selesai"},
"dropletBlock_startWebRequest_param0":function(d){return "URL"},
"dropletBlock_startWebRequest_param1":function(d){return "function"},
"dropletBlock_subtractOperator_description":function(d){return "Kurangi dua nomor"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_textInput_description":function(d){return "Membuat inputan teks dan menetapkan elemen id"},
"dropletBlock_textInput_param0":function(d){return "inputId"},
"dropletBlock_textInput_param1":function(d){return "teks"},
"dropletBlock_textLabel_description":function(d){return "Create a text label, assign it an element id, and bind it to an associated element"},
"dropletBlock_textLabel_param0":function(d){return "labelId"},
"dropletBlock_textLabel_param1":function(d){return "teks"},
"dropletBlock_textLabel_param2":function(d){return "forId"},
"dropletBlock_throw_description":function(d){return "melempar sebuah objek ke aktor tertentu"},
"dropletBlock_turnLeft_description":function(d){return "Turn the turtle counterclockwise by the specified number of degrees"},
"dropletBlock_turnLeft_param0":function(d){return "angle"},
"dropletBlock_turnRight_description":function(d){return "Turn the turtle clockwise by the specified number of degrees"},
"dropletBlock_turnRight_param0":function(d){return "angle"},
"dropletBlock_turnTo_description":function(d){return "Turn the turtle to the specified direction (0 degrees is pointing up)"},
"dropletBlock_turnTo_param0":function(d){return "angle"},
"dropletBlock_updateRecord_description":function(d){return "Menggunakan tabel penyimpanan data App Lab, update record/baris yang disediakan di tableName/nama tabel. record/baris harus diidentifikasi secara unik dengan kolom.field id-nya. Bila panggilan selesai, Fungsi callback dipanggil"},
"dropletBlock_updateRecord_param0":function(d){return "NamaTabel"},
"dropletBlock_updateRecord_param1":function(d){return "record/baris"},
"dropletBlock_updateRecord_param2":function(d){return "callbackFunction"},
"dropletBlock_vanish_description":function(d){return "Lenyapkan aktor."},
"dropletBlock_whileBlock_description":function(d){return "Menciptakan loop/perulangan yang terdiri dari ekspresi kondisional dan blok pernyataan dieksekusi untuk setiap iterasi dari loop. Loop terus melaksanakan selama kondisi bernilai true/benar"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"dropletBlock_write_description":function(d){return "Create a block of text"},
"dropletBlock_write_param0":function(d){return "teks"},
"end":function(d){return "akhir"},
"emptyBlocksErrorMsg":function(d){return "Blok \"Ulangi\" atau blok \"Jika\" membutuhkan blok lain di dalamnya supaya bisa bekerja. Pastikan blok yang berada didalam diletakkan secara pas."},
"emptyFunctionalBlock":function(d){return "Kamu memiliki blok dengan masukan yang tidak terisi."},
"emptyFunctionBlocksErrorMsg":function(d){return "Blok fungsi membutuhkan blok lain di dalamnya agar dapat bekerja."},
"errorEmptyFunctionBlockModal":function(d){return "Diharuskan adanya blok di dalam fungsi mu. Klik \"sunting\" lalu geser blok itu ke dalam Blok Hijau."},
"errorIncompleteBlockInFunction":function(d){return "Klik \"sunting\" untuk memastikan bahwa Anda tidak menyisakan satupun blok di dalam fungsi ini."},
"errorParamInputUnattached":function(d){return "Jangan lupa untuk memasang blok pada setiap parameter masukan di dalam blok fungsi pada program ini."},
"errorUnusedParam":function(d){return "Anda menambahkan blok parameter, tapi tidak digunakan kemudian. Klik \"sunting\" untuk memastikan penggunaan parameter tersebut dan menempatkannya di blok parameter di dalam Blok Hijau."},
"errorRequiredParamsMissing":function(d){return "Buatlah sebuah parameter untuk fungsi ini dengan mengklik \"sunting\" dan menambahkan parameter yang diperlukan. Geser blok parameter baru tersebut ke dalam fungsi ini."},
"errorUnusedFunction":function(d){return "Anda membuat sebuah fungsi, tetapi tidak digunakan dalam program ini! Klik tombol \"Fungsi\" pada Kotak Perkakas dan pastikan Anda menggunakan fungsi tersebut."},
"errorQuestionMarksInNumberField":function(d){return "Cobalah mengganti \"???\" dengan sebuah nilai."},
"extraTopBlocks":function(d){return "Anda memiliki blok yang tak terpasang."},
"extraTopBlocksWhenRun":function(d){return "Anda memiliki blok yang tak terpasang. Apakah maksud Anda untuk memasang ini ke blok \"ketika dijalankan\"/\"when run\" ?"},
"finalStage":function(d){return "Horee! Anda berhasil menyelesaikan tahap akhir."},
"finalStageTrophies":function(d){return "Horee! Anda berhasil menyelesaikan tahap akhir dan memenangkan "+locale.p(d,"numTrophies",0,"id",{"one":"piala","other":"piala "+locale.n(d,"numTrophies")})+"."},
"finish":function(d){return "Selesai"},
"generatedCodeInfo":function(d){return "Bahkan Universitas mengajar blok berbasis pengkodean (misalnya, "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). Tetapi di bawah tenda, blok Anda telah berkumpul dapat juga ditunjukkan dalam JavaScript, dunia yang paling banyak digunakan pengkodean bahasa:"},
"hashError":function(d){return "Maaf, '%1' tidak sesuai dengan program yang disimpan."},
"help":function(d){return "Tolong"},
"hintTitle":function(d){return "Tips:"},
"jump":function(d){return "lompat"},
"keepPlaying":function(d){return "Tetap bermain"},
"levelIncompleteError":function(d){return "Anda telah gunakan semua jenis blok yang diperlukan  tetapi tidak dengan cara yang tepat."},
"listVariable":function(d){return "list"},
"makeYourOwnFlappy":function(d){return "Buatlah permainan \"Flappy\" versi Anda sendiri"},
"missingBlocksErrorMsg":function(d){return "Cobalah satu atau lebih blok di bawah untuk memecahkan teka-teki ini."},
"nextLevel":function(d){return "Horee! Anda berhasil menyelesaikan teka-teki ke  "+locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Horee! Anda berhasil menyelesaikan teka-teki ke  "+locale.v(d,"puzzleNumber")+" dan memenangkan "+locale.p(d,"numTrophies",0,"id",{"satu":"a trophy","other":"trophies "+locale.n(d,"numTrophies")})+"."},
"nextPuzzle":function(d){return "Next Puzzle"},
"nextStage":function(d){return "Selamat! Anda telah menyelesaikan "+locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Horee! Anda berhasil menyelesaikan teka-teki ke "+locale.v(d,"stageNumber")+" dan memenangkan "+locale.p(d,"numTrophies",0,"id",{"one":"piala","other":locale.n(d,"numTrophies")+" piala"})+"."},
"numBlocksNeeded":function(d){return "Horee! Anda berhasil menyelesaikan teka-teki ke  "+locale.v(d,"puzzleNumber")+". (Namun, sebetulnya Anda cukup gunakan hanya "+locale.p(d,"numBlocks",0,"id",{"one":"1 blok","other":"blok "+locale.n(d,"numBlocks")})+".)"},
"numLinesOfCodeWritten":function(d){return "Anda baru saja menulis "+locale.p(d,"numLines",0,"id",{"one":"1 baris","other":locale.n(d,"numLines")+" baris"})+" kode!"},
"play":function(d){return "mainkan"},
"print":function(d){return "Cetak"},
"puzzleTitle":function(d){return "Teka-teki ke "+locale.v(d,"puzzle_number")+" dari "+locale.v(d,"stage_total")},
"repeat":function(d){return "Ulangi"},
"resetProgram":function(d){return "Kembali ke awal"},
"runProgram":function(d){return "Jalankan"},
"runTooltip":function(d){return "Jalankan program yang dibuat di blok ruang kerja."},
"score":function(d){return "Skor"},
"showCodeHeader":function(d){return "Tampilkan kode"},
"showBlocksHeader":function(d){return "Tampilkan blok-blok"},
"showGeneratedCode":function(d){return "Tampilkan kode"},
"stringEquals":function(d){return "string=?"},
"subtitle":function(d){return "Perangkat pemrograman visual"},
"textVariable":function(d){return "teks"},
"tooFewBlocksMsg":function(d){return "Anda telah gunakan semua jenis blok diperlukan, tetapi cobalah menggunakan lebih banyak blok-blok ini supaya anda dapat menyelesaikan teka-teki ini."},
"tooManyBlocksMsg":function(d){return "Teka-teki ini dapat diselesaikan dengan blok < x id = 'START_SPAN' /> < x id = 'END_SPAN'/>."},
"tooMuchWork":function(d){return "Anda membuat saya melakukan terlalu banyak pekerjaan!  Bisakan Anda coba membuat pengulangan yang lebih sedikit?"},
"toolboxHeader":function(d){return "blok"},
"toolboxHeaderDroplet":function(d){return "Toolbox"},
"hideToolbox":function(d){return "(Sembunyikan)"},
"showToolbox":function(d){return "Tampilkan Toolbox"},
"openWorkspace":function(d){return "Cara kerjanya"},
"totalNumLinesOfCodeWritten":function(d){return "Total keseluruhan: "+locale.p(d,"numLines",0,"id",{"one":"1 baris","other":locale.n(d,"numLines")+" baris"})+" kode."},
"tryAgain":function(d){return "Ayo coba lagi!"},
"hintRequest":function(d){return "Lihat petunjuk"},
"backToPreviousLevel":function(d){return "Kembali ke teka-teki sebelumnya"},
"saveToGallery":function(d){return "Simpan di Galeri"},
"savedToGallery":function(d){return "Tersimpan di Galeri!"},
"shareFailure":function(d){return "Maaf, kami tidak bisa membagikan program ini."},
"workspaceHeaderShort":function(d){return "Area kerja: "},
"infinity":function(d){return "∞"},
"rotateText":function(d){return "Memutar perangkat anda."},
"orientationLock":function(d){return "Matikan orientasi kunci dalam pengaturan perangkat."},
"wantToLearn":function(d){return "Ingin belajar untuk mengkode?"},
"watchVideo":function(d){return "Tonton Videonya"},
"when":function(d){return "ketika"},
"whenRun":function(d){return "ketika dijalankan"},
"tryHOC":function(d){return "Cobalah \"Hour of Code\""},
"signup":function(d){return "Daftarlah untuk mengikuti kursus introduksi"},
"hintHeader":function(d){return "Berikut adalah tip:"},
"genericFeedback":function(d){return "Lihatlah hasil anda dan cobalah untuk memperbaiki program Anda."},
"toggleBlocksErrorMsg":function(d){return "Anda perlu memperbaiki kesalahan dalam program Anda sebelum dapat ditunjukkan sebagai blok."},
"defaultTwitterText":function(d){return "Lihat apa yang saya buat"}};