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
"clearPuzzle":function(d){return "Memulai ulang"},
"clearPuzzleConfirm":function(d){return "Ini akan mengembalikan teka-teki ke keadaan awal dan menghapus semua blok yang Anda tambahkan atau ubah."},
"clearPuzzleConfirmHeader":function(d){return "Apakah Anda yakin Anda ingin memulai dari awal?"},
"codeMode":function(d){return "kode"},
"codeTooltip":function(d){return "Lihat kode JavaScript."},
"continue":function(d){return "Lanjutkan"},
"defaultTwitterText":function(d){return "Lihat apa yang saya buat"},
"designMode":function(d){return "Desain"},
"designModeHeader":function(d){return "Mode Desain"},
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
"dropletBlock_arcLeft_description":function(d){return "Menggerakkan kura-kura ke depan dan ke kiri pada busur lingkaran yang halus"},
"dropletBlock_arcLeft_param0":function(d){return "sudut/Segi"},
"dropletBlock_arcLeft_param0_description":function(d){return "The angle along the circle to move."},
"dropletBlock_arcLeft_param1":function(d){return "Radius"},
"dropletBlock_arcLeft_param1_description":function(d){return "The radius of the circle that is placed left of the turtle. Must be >= 0."},
"dropletBlock_arcRight_description":function(d){return "Menggerakkan kura-kura ke depan dan ke kanan pada busur lingkaran yang halus"},
"dropletBlock_arcRight_param0":function(d){return "sudut/Segi"},
"dropletBlock_arcRight_param0_description":function(d){return "The angle along the circle to move."},
"dropletBlock_arcRight_param1":function(d){return "Radius"},
"dropletBlock_arcRight_param1_description":function(d){return "The radius of the circle that is placed right of the turtle. Must be >= 0."},
"dropletBlock_assign_x_description":function(d){return "Menetapkan nilai ke variabel yang ada. Sebagai contoh, x = 0;"},
"dropletBlock_assign_x_param0":function(d){return "x"},
"dropletBlock_assign_x_param0_description":function(d){return "The variable name being assigned to"},
"dropletBlock_assign_x_param1":function(d){return "nilai"},
"dropletBlock_assign_x_param1_description":function(d){return "The value the variable is being assigned to."},
"dropletBlock_assign_x_signatureOverride":function(d){return "Menetapkan variabel"},
"dropletBlock_button_description":function(d){return "Membuat tombol yang dapat Anda klik. Tombol akan menampilkan teks yang disediakan dan dapat direferensikan oleh id yang diberikan"},
"dropletBlock_button_param0":function(d){return "Id Button/Tombol"},
"dropletBlock_button_param0_description":function(d){return "A unique identifier for the button. The id is used for referencing the created button. For example, to assign event handlers."},
"dropletBlock_button_param1":function(d){return "teks"},
"dropletBlock_button_param1_description":function(d){return "The text displayed within the button."},
"dropletBlock_callMyFunction_description":function(d){return "panggil sebuah nama fungsi yang tidak membutuhkan parameter"},
"dropletBlock_callMyFunction_n_description":function(d){return "panggil sebuah nama fungsi yang mengambil satu parameter atau lebih"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Panggil sebuah fungsi dengan parameter"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Panggil sebuah fungsi"},
"dropletBlock_changeScore_description":function(d){return "Menambah atau menghapus satu angka untuk Skor."},
"dropletBlock_checkbox_description":function(d){return "buat sebuah checkbox/kotak centang dan tetapkan elemen id"},
"dropletBlock_checkbox_param0":function(d){return "Id Checkbox"},
"dropletBlock_checkbox_param1":function(d){return "diperiksa"},
"dropletBlock_circle_description":function(d){return "gambarkan sebuah lingkaran diatas kanvas aktif dengan koordinat tertentu unutk pusat (x, y) dan radius"},
"dropletBlock_circle_param0":function(d){return "pusat X"},
"dropletBlock_circle_param0_description":function(d){return "The x position in pixels of the center of the circle."},
"dropletBlock_circle_param1":function(d){return "pusat Y"},
"dropletBlock_circle_param1_description":function(d){return "The y position in pixels of the center of the circle."},
"dropletBlock_circle_param2":function(d){return "Radius"},
"dropletBlock_circle_param2_description":function(d){return "The radius of the circle, in pixels."},
"dropletBlock_clearCanvas_description":function(d){return "Menghapus semua data pada kanvas yang aktif"},
"dropletBlock_clearInterval_description":function(d){return "Hapus timer interval yang ada dengan melewatkan nilai kembalian dari setInterval ()"},
"dropletBlock_clearInterval_param0":function(d){return "interval"},
"dropletBlock_clearInterval_param0_description":function(d){return "The value returned by the setInterval function to clear."},
"dropletBlock_clearTimeout_description":function(d){return "Hapus timer yang ada dengan melewatkan nilai kembalian dari setTimeout ()"},
"dropletBlock_clearTimeout_param0":function(d){return "timeout/waktu habis"},
"dropletBlock_clearTimeout_param0_description":function(d){return "The value returned by the setTimeout function to cancel."},
"dropletBlock_console.log_description":function(d){return "Tampilkan string atau variabel dalam tampilan konsol"},
"dropletBlock_console.log_param0":function(d){return "Pesan"},
"dropletBlock_console.log_param0_description":function(d){return "The message string to display in the console."},
"dropletBlock_container_description":function(d){return "Buat wadah pembagian dengan id elemen tertentu, dan  atur HTML dalamnya secara bebas"},
"dropletBlock_createCanvas_description":function(d){return "Buat kanvas dengan id tertentu, dan secara bebas mengatur lebar dan tinggi dimensi"},
"dropletBlock_createCanvas_param0":function(d){return "Id kanvas"},
"dropletBlock_createCanvas_param0_description":function(d){return "The id of the new canvas element."},
"dropletBlock_createCanvas_param1":function(d){return "Lebar"},
"dropletBlock_createCanvas_param1_description":function(d){return "The horizontal width in pixels of the rectangle."},
"dropletBlock_createCanvas_param2":function(d){return "tinggi"},
"dropletBlock_createCanvas_param2_description":function(d){return "The vertical height in pixels of the rectangle."},
"dropletBlock_createRecord_description":function(d){return "menggunakan tabel penyimpanan data App Lab, menciptakan record/baris dengan id unik di nama tabel yang disediakan, dan memanggil fungsi callback setelah tindakan selesai."},
"dropletBlock_createRecord_param0":function(d){return "NamaTabel"},
"dropletBlock_createRecord_param0_description":function(d){return "The name of the table the record should be added to. `tableName` gets created if it doesn't exist."},
"dropletBlock_createRecord_param1":function(d){return "record/baris"},
"dropletBlock_createRecord_param2":function(d){return "Fungsicallback"},
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
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "Mendeklarasikan sebuah variabel"},
"dropletBlock_deleteElement_description":function(d){return "Menghapus elemen dengan id tertentu"},
"dropletBlock_deleteElement_param0":function(d){return "id"},
"dropletBlock_deleteElement_param0_description":function(d){return "The id of the element to delete."},
"dropletBlock_deleteRecord_description":function(d){return "Menggunakan tabel penyimpanan data App Lab, menghapus record/baris yang disediakan di dalam NamaTabel. Record/baris adalah sebuah objek yang harus diidentifikasi secara unik dengan field/kolom id. ketika pemanggilan selesai, Fungsi callback dipanggil."},
"dropletBlock_deleteRecord_param0":function(d){return "NamaTabel"},
"dropletBlock_deleteRecord_param0_description":function(d){return "The name of the table from which the records should be searched and read."},
"dropletBlock_deleteRecord_param1":function(d){return "record/baris"},
"dropletBlock_deleteRecord_param2":function(d){return "Fungsicallback"},
"dropletBlock_deleteRecord_param2_description":function(d){return "A function that is asynchronously called when the call to deleteRecord() is finished."},
"dropletBlock_divideOperator_description":function(d){return "Membagi dua nomor"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "Membagi operator"},
"dropletBlock_dot_description":function(d){return "Menggambar titik lokasi kura-kura dengan jari-jari tertentu"},
"dropletBlock_dot_param0":function(d){return "Radius"},
"dropletBlock_dot_param0_description":function(d){return "The radius of the dot to draw"},
"dropletBlock_drawImage_description":function(d){return "Menggambar image atau kanvas elemen tertentu ke atas kanvas aktif pada posisi yang ditentukan, dan pilih skala elemen dengan lebar dan tinggi tertentu"},
"dropletBlock_drawImage_param0":function(d){return "id"},
"dropletBlock_drawImage_param0_description":function(d){return "The x position in pixels of the upper left corner of the image to draw."},
"dropletBlock_drawImage_param1":function(d){return "x"},
"dropletBlock_drawImage_param1_description":function(d){return "The x position in pixels of the upper left corner of the image to draw."},
"dropletBlock_drawImage_param2":function(d){return "y"},
"dropletBlock_drawImage_param2_description":function(d){return "The y position in pixels of the upper left corner of the image to draw."},
"dropletBlock_drawImage_param3":function(d){return "Lebar"},
"dropletBlock_drawImage_param4":function(d){return "tinggi"},
"dropletBlock_dropdown_description":function(d){return "Buat dropdown, menetapkan id elemen, dan mengisinya dengan daftar item"},
"dropletBlock_dropdown_signatureOverride":function(d){return "dropdown (dropdownID, option1, option2,..., optionX)"},
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
"dropletBlock_getAlpha_description":function(d){return "Mengembalikan jumlah alpha (opacity) (mulai dari 0 sampai 255) dalam warna pixel yang terletak di posisi x dan posisi y yang diberikan dalam data gambar yang diberikan"},
"dropletBlock_getAlpha_param0":function(d){return "Data Gambar"},
"dropletBlock_getAlpha_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_getAlpha_param1":function(d){return "x"},
"dropletBlock_getAlpha_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_getAlpha_param2":function(d){return "y"},
"dropletBlock_getAlpha_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_getAttribute_description":function(d){return "Mendapatkan atribut tertentu"},
"dropletBlock_getBlue_description":function(d){return "Mendapatkan jumlah biru (berkisar dari 0 hingga 255) dalam warna pixel yang terletak di posisi x dan posisi y yang diberikan dalam data gambar yang diberikan"},
"dropletBlock_getBlue_param0":function(d){return "Data Gambar"},
"dropletBlock_getBlue_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_getBlue_param1":function(d){return "x"},
"dropletBlock_getBlue_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_getBlue_param2":function(d){return "y"},
"dropletBlock_getBlue_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_getChecked_description":function(d){return "Mendapatkan kondisi dari  checkbox atau radio button"},
"dropletBlock_getChecked_param0":function(d){return "id"},
"dropletBlock_getDirection_description":function(d){return "Mengembalikan arah saat ini yang dihadap penyu. 0 derajat mengarah ke atas"},
"dropletBlock_getGreen_description":function(d){return "Mendapat jumlah warna hijau (mulai dari 0 sampai 255) dalam warna pixel yang terletak di posisi x dan posisi y yang diberikan dalam data gambar yang diberikan"},
"dropletBlock_getGreen_param0":function(d){return "Data Gambar"},
"dropletBlock_getGreen_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_getGreen_param1":function(d){return "x"},
"dropletBlock_getGreen_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_getGreen_param2":function(d){return "y"},
"dropletBlock_getGreen_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_getImageData_description":function(d){return "Mengembalikan sebuah objek yang mewakili data gambar yang diambil dari kanvas di koordinat berkisar dari startx, startY ke endX, endY"},
"dropletBlock_getImageData_param0":function(d){return "startX"},
"dropletBlock_getImageData_param0_description":function(d){return "The x position in pixels starting from the upper left corner of image to start the capture."},
"dropletBlock_getImageData_param1":function(d){return "startY"},
"dropletBlock_getImageData_param1_description":function(d){return "The y position in pixels starting from the upper left corner of image to start the capture."},
"dropletBlock_getImageData_param2":function(d){return "endX"},
"dropletBlock_getImageData_param2_description":function(d){return "The x position in pixels starting from the upper left corner of image to end the capture."},
"dropletBlock_getImageData_param3":function(d){return "endY"},
"dropletBlock_getImageData_param3_description":function(d){return "The y position in pixels starting from the upper left corner of image to end the capture."},
"dropletBlock_getImageURL_description":function(d){return "Dapatkan URL untuk disediakan elemen id gambar"},
"dropletBlock_getImageURL_param0":function(d){return "imageID"},
"dropletBlock_getImageURL_param0_description":function(d){return "The id of the image element."},
"dropletBlock_getKeyValue_description":function(d){return "Mengambil nilai yang tersimpan dalam nama kunci yang disediakan di  kunci App Lab/penyimpanan data nilai . Nilai tersebut dikembalikan sebagai parameter untuk callbackFunction/FungsiCallback ketika pengambilan selesai"},
"dropletBlock_getKeyValue_param0":function(d){return "kunci"},
"dropletBlock_getKeyValue_param0_description":function(d){return "The name of the key to be retrieved."},
"dropletBlock_getKeyValue_param1":function(d){return "Fungsicallback"},
"dropletBlock_getRed_description":function(d){return "Mendapat jumlah merah (mulai dari 0 sampai 255) dalam warna pixel yang terletak di posisi x dan posisi y yang diberikan dalam data gambar yang diberikan"},
"dropletBlock_getRed_param0":function(d){return "Data Gambar"},
"dropletBlock_getRed_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_getRed_param1":function(d){return "x"},
"dropletBlock_getRed_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_getRed_param2":function(d){return "y"},
"dropletBlock_getRed_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_getText_description":function(d){return "Dapatkan teks dari elemen tertentu"},
"dropletBlock_getText_param0":function(d){return "id"},
"dropletBlock_getTime_description":function(d){return "Dapatkan waktu saat ini dalam milidetik"},
"dropletBlock_getUserId_description":function(d){return "Dapatkan identifikasi unik bagi pengguna saat ini  dari aplikasi ini"},
"dropletBlock_getXPosition_description":function(d){return "Dapatkan posisi elemen x"},
"dropletBlock_getXPosition_param0":function(d){return "id"},
"dropletBlock_getX_description":function(d){return "Mendapatkan koordinat y saat ini dalam pixel pada penyu"},
"dropletBlock_getYPosition_description":function(d){return "Dapatkan posisi elemen y"},
"dropletBlock_getYPosition_param0":function(d){return "id"},
"dropletBlock_getY_description":function(d){return "Mendapatkan koordinat y saat ini dalam pixel pada penyu"},
"dropletBlock_greaterThanOperator_description":function(d){return "Tes apakah sebuah nomor lebih besar daripada nomor lain. Kembalikan nilai true jika nilai di sisi kiri dari ekspresi adalah benar lebih besar dari nilai di sisi kanan dari ekspresi"},
"dropletBlock_greaterThanOperator_param0":function(d){return "x"},
"dropletBlock_greaterThanOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_greaterThanOperator_param1":function(d){return "y"},
"dropletBlock_greaterThanOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_greaterThanOperator_signatureOverride":function(d){return "Lebih besar dari operator"},
"dropletBlock_hideElement_description":function(d){return "Menyembunyikan elemen dengan id disediakan sehingga tidak ditampilkan di layar"},
"dropletBlock_hideElement_param0":function(d){return "id"},
"dropletBlock_hideElement_param0_description":function(d){return "The id of the element to hide."},
"dropletBlock_hide_description":function(d){return "Menyembunyikan kura-kura sehingga tidak ditampilkan di layar"},
"dropletBlock_ifBlock_description":function(d){return "Mengeksekusi blok pernyataan jika kondisi tertentu adalah benar"},
"dropletBlock_ifBlock_signatureOverride":function(d){return "pernyataan if"},
"dropletBlock_ifElseBlock_description":function(d){return "Mengeksekusi blok pernyataan jika kondisi tertentu adalah benar; jika tidak, blok pernyataan dalam klausa yang lain dijalankan"},
"dropletBlock_ifElseBlock_signatureOverride":function(d){return "pernyataan if/else"},
"dropletBlock_imageUploadButton_description":function(d){return "Buat tombol upload gambar dan tetapkan elemen id"},
"dropletBlock_image_description":function(d){return "Menampilkan gambar dari url yang diberikan pada layar"},
"dropletBlock_image_param0":function(d){return "id"},
"dropletBlock_image_param0_description":function(d){return "The id of the image element."},
"dropletBlock_image_param1":function(d){return "URL"},
"dropletBlock_image_param1_description":function(d){return "The source URL of the image to be displayed on screen."},
"dropletBlock_inequalityOperator_description":function(d){return "Tes Apakah dua nilai berikut tidak sama. Mengembalikan nilai true apabila nilai di sebelah kiri dari ekspresi tidak sama dengan nilai di sisi kanan dari ekspresi"},
"dropletBlock_inequalityOperator_param0":function(d){return "x"},
"dropletBlock_inequalityOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_inequalityOperator_param1":function(d){return "y"},
"dropletBlock_inequalityOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_inequalityOperator_signatureOverride":function(d){return "Ketidaksetaraan operator"},
"dropletBlock_innerHTML_description":function(d){return "Mengatur innerHTML untuk elemen dengan id tertentu"},
"dropletBlock_lessThanOperator_description":function(d){return "Tes apakah nilai adalah kurang dari nilai lain. Mengembalikan nilai true jika nilai di sebelah kiri dari ekspresi benar-benar kurang dari nilai pada sisi kanan dari ekspresi"},
"dropletBlock_lessThanOperator_param0":function(d){return "x"},
"dropletBlock_lessThanOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_lessThanOperator_param1":function(d){return "y"},
"dropletBlock_lessThanOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_lessThanOperator_signatureOverride":function(d){return "Kurang dari operator"},
"dropletBlock_line_description":function(d){return "Menggambar garis di kanvas aktif dari x1, y1 ke x2, y2."},
"dropletBlock_line_param0":function(d){return "x 1"},
"dropletBlock_line_param0_description":function(d){return "The x position in pixels of the beginning of the line."},
"dropletBlock_line_param1":function(d){return "y1"},
"dropletBlock_line_param1_description":function(d){return "The y position in pixels of the beginning of the line."},
"dropletBlock_line_param2":function(d){return "x 2"},
"dropletBlock_line_param2_description":function(d){return "The x position in pixels of the end of the line."},
"dropletBlock_line_param3":function(d){return "Y2"},
"dropletBlock_line_param3_description":function(d){return "The y position in pixels of the end of the line."},
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
"dropletBlock_mathRound_description":function(d){return "Putaran sejumlah integer terdekat"},
"dropletBlock_mathRound_param0":function(d){return "x"},
"dropletBlock_mathRound_param0_description":function(d){return "An arbitrary number."},
"dropletBlock_mathRound_signatureOverride":function(d){return "Math.Round(x)"},
"dropletBlock_moveBackward_description":function(d){return "Memindahkan penyu ke belakang yang diberikan beberapa piksel di arah saat ini"},
"dropletBlock_moveBackward_param0":function(d){return "piksel"},
"dropletBlock_moveBackward_param0_description":function(d){return "The number of pixels to move the turtle back in its current direction. If not provided, the turtle will move back 25 pixels"},
"dropletBlock_moveForward_description":function(d){return "Memindahkan penyu ke depan yang diberikan beberapa piksel di arah saat ini"},
"dropletBlock_moveForward_param0":function(d){return "piksel"},
"dropletBlock_moveForward_param0_description":function(d){return "The number of pixels to move the turtle forward in its current direction. If not provided, the turtle will move forward 25 pixels"},
"dropletBlock_moveTo_description":function(d){return "Bergerak penyu ke koordinat x, y tertentu di layar"},
"dropletBlock_moveTo_param0":function(d){return "x"},
"dropletBlock_moveTo_param0_description":function(d){return "The x coordinate on the screen to move the turtle."},
"dropletBlock_moveTo_param1":function(d){return "y"},
"dropletBlock_moveTo_param1_description":function(d){return "The y coordinate on the screen to move the turtle."},
"dropletBlock_move_description":function(d){return "Memindahkan kura-kura dari lokasi saat ini. Menambahkan x untuk posisi x kura-kura dan y untuk posisi y kura-kura"},
"dropletBlock_move_param0":function(d){return "x"},
"dropletBlock_move_param0_description":function(d){return "The number of pixels to move the turtle right."},
"dropletBlock_move_param1":function(d){return "y"},
"dropletBlock_move_param1_description":function(d){return "The number of pixels to move the turtle down."},
"dropletBlock_multiplyOperator_description":function(d){return "Mengalikan dua nomor"},
"dropletBlock_multiplyOperator_signatureOverride":function(d){return "Kalikan operator"},
"dropletBlock_notOperator_description":function(d){return "Kembali ke pernyataan false/salah jika ekspresi dapat dikonversi ke nilai benar/true; Jika tidak, kembalikan nilai true"},
"dropletBlock_notOperator_signatureOverride":function(d){return "Operator boolean NOT"},
"dropletBlock_onEvent_description":function(d){return "Mengeksekusi kode callbackFunction/Fungsicallback ketika suatu jenis peristiwa tertentu terjadi untuk elemen tertentu"},
"dropletBlock_onEvent_param0":function(d){return "id"},
"dropletBlock_onEvent_param0_description":function(d){return "The ID of the UI control to which this function applies."},
"dropletBlock_onEvent_param1":function(d){return "Event"},
"dropletBlock_onEvent_param1_description":function(d){return "The type of event to respond to."},
"dropletBlock_onEvent_param2":function(d){return "Fungsicallback"},
"dropletBlock_onEvent_param2_description":function(d){return "A function to execute."},
"dropletBlock_orOperator_description":function(d){return "Mengembalikan nilai true bila salah satu ekspresi benar dan yang salah sebaliknya"},
"dropletBlock_orOperator_signatureOverride":function(d){return "operator boolean OR"},
"dropletBlock_penColor_description":function(d){return "Menetapkan warna dari garis yang digambar di belakang kura-kura ketika bergerak"},
"dropletBlock_penColor_param0":function(d){return "warna"},
"dropletBlock_penColor_param0_description":function(d){return "The color of the line left behind the turtle as it moves"},
"dropletBlock_penColour_description":function(d){return "Menetapkan warna dari garis yang digambar di belakang kura-kura ketika bergerak"},
"dropletBlock_penColour_param0":function(d){return "warna"},
"dropletBlock_penDown_description":function(d){return "Mengakibatkan garis ditarik di belakang kura-kura ketika bergerak"},
"dropletBlock_penUp_description":function(d){return "Menghentikan kura-kura dari menggambar garis belakangnya ketika bergerak"},
"dropletBlock_penWidth_description":function(d){return "Perubahan diameter lingkaran digambar di balik penyu ketika bergerak"},
"dropletBlock_penWidth_param0":function(d){return "Lebar"},
"dropletBlock_penWidth_param0_description":function(d){return "The diameter of the circles drawn behind the turtle as it moves"},
"dropletBlock_playSound_description":function(d){return "Putar file suara MP3, OGG atau WAV  dari URL tertentu"},
"dropletBlock_playSound_param0":function(d){return "URL"},
"dropletBlock_putImageData_description":function(d){return "Menempatkan data gambar yang dimasukan ke elemen kanvas saat ini mulai dari posisi startx, startY"},
"dropletBlock_putImageData_param0":function(d){return "Data Gambar"},
"dropletBlock_putImageData_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_putImageData_param1":function(d){return "startX"},
"dropletBlock_putImageData_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image to place the data on the canvas."},
"dropletBlock_putImageData_param2":function(d){return "startY"},
"dropletBlock_putImageData_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image to place the data on the canvas."},
"dropletBlock_radioButton_description":function(d){return "Membuat tombol radio/radio button dan menempatkannya ke kelompok untuk memilih dari satu set pilihan yang telah ditetapkan. Hanya satu tombol radio/radio button dalam kelompok yang dapat dipilih sekaligus"},
"dropletBlock_radioButton_param0":function(d){return "id"},
"dropletBlock_radioButton_param0_description":function(d){return "A unique identifier for the radio button. The id is used for referencing the radioButton control. For example, to assign event handlers."},
"dropletBlock_radioButton_param1":function(d){return "diperiksa"},
"dropletBlock_radioButton_param1_description":function(d){return "Whether the radio button is initially checked."},
"dropletBlock_radioButton_param2":function(d){return "Kelompok/Grup"},
"dropletBlock_radioButton_param2_description":function(d){return "The group that the radio button is associated with. Only one button in a group can be checked at a time."},
"dropletBlock_randomNumber_max_description":function(d){return "Mengembalikan nomor acak mulai dari nol sampai max, termasuk kedua nol dan max dalam rentang"},
"dropletBlock_randomNumber_max_param0":function(d){return "max"},
"dropletBlock_randomNumber_max_param0_description":function(d){return "The maximum number returned"},
"dropletBlock_randomNumber_max_signatureOverride":function(d){return "Nomoracak (max)"},
"dropletBlock_randomNumber_min_max_description":function(d){return "Pengembalian nomor acak mulai dari nomor pertama (min) ke nomor kedua (max), termasuk kedua nomor pada kisaran"},
"dropletBlock_randomNumber_min_max_param0":function(d){return "min"},
"dropletBlock_randomNumber_min_max_param0_description":function(d){return "The minimum number returned"},
"dropletBlock_randomNumber_min_max_param1":function(d){return "max"},
"dropletBlock_randomNumber_min_max_param1_description":function(d){return "The maximum number returned"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "Nomoracak (min, max)"},
"dropletBlock_readRecords_description":function(d){return "Menggunakan tabel penyimpanan data App Lab, baca baris/record dari NamaTabel/tableName yang cocok dengan searchTerms/Syarat pencarian yang tersedia. Bila panggilan selesai, callbackFunction/fungsi callback dipanggil dan melewati larik/array dari baris/record."},
"dropletBlock_readRecords_param0":function(d){return "NamaTabel"},
"dropletBlock_readRecords_param0_description":function(d){return "The name of the table from which the records should be searched and read."},
"dropletBlock_readRecords_param1":function(d){return "searchParams"},
"dropletBlock_readRecords_param2":function(d){return "Fungsicallback"},
"dropletBlock_rect_description":function(d){return "gambarlah persegi panjang ke kanvas aktif yang terletak di upperLeftX/atas Kiri X dan upperLeftY/atas Kiri Y, dan ukuran lebar dan ukuran tinggi."},
"dropletBlock_rect_param0":function(d){return "upperLeftX/atas Kiri X"},
"dropletBlock_rect_param0_description":function(d){return "The x position in pixels of the upper left corner of the rectangle."},
"dropletBlock_rect_param1":function(d){return "upperLeftY/atas Kiri Y"},
"dropletBlock_rect_param1_description":function(d){return "The y position in pixels of the upper left corner of the rectangle."},
"dropletBlock_rect_param2":function(d){return "Lebar"},
"dropletBlock_rect_param2_description":function(d){return "The horizontal width in pixels of the rectangle."},
"dropletBlock_rect_param3":function(d){return "tinggi"},
"dropletBlock_rect_param3_description":function(d){return "The vertical height in pixels of the rectangle."},
"dropletBlock_return_description":function(d){return "Kembalikan nilai dari suatu fungsi"},
"dropletBlock_return_signatureOverride":function(d){return "kembali"},
"dropletBlock_setActiveCanvas_description":function(d){return "Mengubah kanvas aktif ke kanvas dengan id tertentu (perintah kanvas lainnya hanya mempengaruhi kanvas aktif)"},
"dropletBlock_setActiveCanvas_param0":function(d){return "Id kanvas"},
"dropletBlock_setActiveCanvas_param0_description":function(d){return "The id of the canvas element to activate."},
"dropletBlock_setAlpha_description":function(d){return "Menetapkan jumlah alpha (opasitas) (mulai dari 0 sampai 255) dalam warna pixel yang terletak di posisi x dan posisi y yang diberikan dalam data gambar yang diberikan"},
"dropletBlock_setAlpha_param0":function(d){return "Data Gambar"},
"dropletBlock_setAlpha_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_setAlpha_param1":function(d){return "x"},
"dropletBlock_setAlpha_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_setAlpha_param2":function(d){return "y"},
"dropletBlock_setAlpha_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_setAlpha_param3":function(d){return "Nilai Alpa"},
"dropletBlock_setAlpha_param3_description":function(d){return "The amount of alpha (opacity) (from 0 to 255) to set in the pixel."},
"dropletBlock_setAttribute_description":function(d){return "Mengatur nilai yang diberikan"},
"dropletBlock_setBackground_description":function(d){return "tetapkan latar belakang gambar"},
"dropletBlock_setBlue_description":function(d){return "Mengatur jumlah yang berwarna biru (berkisar dari 0 hingga 255) dalam warna pixel pixel yang diberikan terletak pada posisi x  dan posisi y dalam data gambar yang diberikan dengan jumlah masukan nilai biru/blueValue."},
"dropletBlock_setBlue_param0":function(d){return "Data Gambar"},
"dropletBlock_setBlue_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_setBlue_param1":function(d){return "x"},
"dropletBlock_setBlue_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_setBlue_param2":function(d){return "y"},
"dropletBlock_setBlue_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_setBlue_param3":function(d){return "blueValue/Nilai Biru"},
"dropletBlock_setBlue_param3_description":function(d){return "The amount of blue (from 0 to 255) to set in the pixel."},
"dropletBlock_setChecked_description":function(d){return "Atur kondisi dari checkbox atau radio button"},
"dropletBlock_setChecked_param0":function(d){return "id"},
"dropletBlock_setChecked_param1":function(d){return "diperiksa"},
"dropletBlock_setFillColor_description":function(d){return "Atur pengisian warna untuk kanvas aktif"},
"dropletBlock_setFillColor_param0":function(d){return "warna"},
"dropletBlock_setFillColor_param0_description":function(d){return "The color name or hex value representing the color."},
"dropletBlock_setGreen_description":function(d){return "Menetapkan jumlah warna hijau (berkisar dari 0 hingga 255) dalam warna pixel yang diberikan terletak pada posisi x  dan posisi y dalam data gambar yang diberikan dengan jumlah masukan nilai hijau/greenValue."},
"dropletBlock_setGreen_param0":function(d){return "Data Gambar"},
"dropletBlock_setGreen_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_setGreen_param1":function(d){return "x"},
"dropletBlock_setGreen_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_setGreen_param2":function(d){return "y"},
"dropletBlock_setGreen_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_setGreen_param3":function(d){return "greenValue/Nilai Hijau"},
"dropletBlock_setGreen_param3_description":function(d){return "The amount of green (from 0 to 255) to set in the pixel."},
"dropletBlock_setImageURL_description":function(d){return "Mengatur URL untuk elemen id gambar diberikan"},
"dropletBlock_setImageURL_param0":function(d){return "id"},
"dropletBlock_setImageURL_param0_description":function(d){return "The id of the image element."},
"dropletBlock_setImageURL_param1":function(d){return "URL"},
"dropletBlock_setImageURL_param1_description":function(d){return "TThe source URL of the image to be displayed on screen."},
"dropletBlock_setInterval_description":function(d){return "Jalankan kode fungsi callback tiap kali sejumlah milidetik telah berlalu, sampai dibatalkan"},
"dropletBlock_setInterval_param0":function(d){return "Fungsi"},
"dropletBlock_setInterval_param0_description":function(d){return "A function to execute."},
"dropletBlock_setInterval_param1":function(d){return "milliseconds/milidetik"},
"dropletBlock_setInterval_param1_description":function(d){return "The number of milliseconds between each execution of the function."},
"dropletBlock_setKeyValue_description":function(d){return "Sediakan sepasang kunci / nilai di kunci / nilai penyimpanan data App Lab , dan panggil Fungsi callback ketika aksi selesai."},
"dropletBlock_setKeyValue_param0":function(d){return "kunci"},
"dropletBlock_setKeyValue_param0_description":function(d){return "The name of the key to be stored."},
"dropletBlock_setKeyValue_param1":function(d){return "nilai"},
"dropletBlock_setKeyValue_param1_description":function(d){return "The data to be stored."},
"dropletBlock_setKeyValue_param2":function(d){return "Fungsicallback"},
"dropletBlock_setKeyValue_param2_description":function(d){return "A function that is asynchronously called when the call to setKeyValue is finished."},
"dropletBlock_setParent_description":function(d){return "Atur elemen untuk menjadi anak dari elemen induk"},
"dropletBlock_setPosition_description":function(d){return "Posisikan sebuah elemen dengan Koordinat x, y, lebar, dan tinggi"},
"dropletBlock_setPosition_param0":function(d){return "id"},
"dropletBlock_setPosition_param1":function(d){return "x"},
"dropletBlock_setPosition_param2":function(d){return "y"},
"dropletBlock_setPosition_param3":function(d){return "Lebar"},
"dropletBlock_setPosition_param4":function(d){return "tinggi"},
"dropletBlock_setRGB_description":function(d){return "Mengatur nilai warna RGB (mulai dari 0 sampai 255) dari pixel yang terletak di posisi x dan posisi y yang diberikan pada data gambar yang diberikan untuk memasukkan merah, hijau, biru jumlah"},
"dropletBlock_setRGB_param0":function(d){return "Data Gambar"},
"dropletBlock_setRGB_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_setRGB_param1":function(d){return "x"},
"dropletBlock_setRGB_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_setRGB_param2":function(d){return "y"},
"dropletBlock_setRGB_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_setRGB_param3":function(d){return "merah"},
"dropletBlock_setRGB_param3_description":function(d){return "The amount of red (from 0 to 255) to set in the pixel."},
"dropletBlock_setRGB_param4":function(d){return "hijau"},
"dropletBlock_setRGB_param4_description":function(d){return "The amount of green (from 0 to 255) to set in the pixel."},
"dropletBlock_setRGB_param5":function(d){return "biru"},
"dropletBlock_setRGB_param5_description":function(d){return "The amount of blue (from 0 to 255) to set in the pixel."},
"dropletBlock_setRGB_param6":function(d){return "alpha"},
"dropletBlock_setRGB_param6_description":function(d){return "Optional. The amount of opacity (from 0 to 255) to set in the pixel. Defaults to 255 (full opacity)."},
"dropletBlock_setRed_description":function(d){return "Mengatur jumlah yang berwarna merah (mulai dari 0 sampai 255) dalam warna pixel yang diberikan terletak pada posisi x  dan posisi y dalam data gambar yang diberikan pada jumlah masukan nilai merah."},
"dropletBlock_setRed_param0":function(d){return "Data Gambar"},
"dropletBlock_setRed_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_setRed_param1":function(d){return "x"},
"dropletBlock_setRed_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_setRed_param2":function(d){return "y"},
"dropletBlock_setRed_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_setRed_param3":function(d){return "redValue/Nilai Merah"},
"dropletBlock_setRed_param3_description":function(d){return "The amount of red (from 0 to 255) to set in the pixel."},
"dropletBlock_setSpriteEmotion_description":function(d){return "Tetapkan suasana hati aktor"},
"dropletBlock_setSpritePosition_description":function(d){return "gerakkan langsung aktor ke tempat yang ditentukan"},
"dropletBlock_setSpriteSpeed_description":function(d){return "atur kecepatan aktor"},
"dropletBlock_setSprite_description":function(d){return "atur gambar aktor"},
"dropletBlock_setStrokeColor_description":function(d){return "Atur goresan warna untuk kanvas aktif"},
"dropletBlock_setStrokeColor_param0":function(d){return "warna"},
"dropletBlock_setStrokeColor_param0_description":function(d){return "The color name or hex value representing the color."},
"dropletBlock_setStrokeWidth_description":function(d){return "Atur lebar garis untuk kanvas yang aktif"},
"dropletBlock_setStrokeWidth_param0":function(d){return "Lebar"},
"dropletBlock_setStrokeWidth_param0_description":function(d){return "The width in pixels with which to draw lines, circles, and rectangles."},
"dropletBlock_setStyle_description":function(d){return "Tambahkan teks Style CSS  ke sebuah elemen"},
"dropletBlock_setText_description":function(d){return "Tetapkan teks untuk elemen tertentu"},
"dropletBlock_setText_param0":function(d){return "id"},
"dropletBlock_setText_param1":function(d){return "teks"},
"dropletBlock_setTimeout_description":function(d){return "Atur timer dan eksekusi kode ketika jumlah milidetik itu telah terlewati"},
"dropletBlock_setTimeout_param0":function(d){return "Fungsi"},
"dropletBlock_setTimeout_param0_description":function(d){return "A function to execute."},
"dropletBlock_setTimeout_param1":function(d){return "milliseconds/milidetik"},
"dropletBlock_setTimeout_param1_description":function(d){return "The number of milliseconds to wait before executing the function."},
"dropletBlock_showElement_description":function(d){return "Menunjukkan elemen dengan id yang disediakan"},
"dropletBlock_showElement_param0":function(d){return "id"},
"dropletBlock_showElement_param0_description":function(d){return "The id of the element to hide."},
"dropletBlock_show_description":function(d){return "Menunjukkan penyu di layar, dengan membuatnya terlihat di lokasi yang sekarang"},
"dropletBlock_speed_description":function(d){return "Mengatur kecepatan untuk eksekusi seluruh app (yang meliputi kecepatan kura-kura). Memperkirakan nomor 1-100."},
"dropletBlock_speed_param0":function(d){return "nilai"},
"dropletBlock_speed_param0_description":function(d){return "The speed of the app's execution in the range of (1-100)"},
"dropletBlock_startWebRequest_description":function(d){return "Meminta data dari internet dan mengeksekusi kode ketika permintaan selesai"},
"dropletBlock_startWebRequest_param0":function(d){return "URL"},
"dropletBlock_startWebRequest_param0_description":function(d){return "The web address of a service that returns data."},
"dropletBlock_startWebRequest_param1":function(d){return "Fungsi"},
"dropletBlock_startWebRequest_param1_description":function(d){return "A function to execute."},
"dropletBlock_subtractOperator_description":function(d){return "Kurangi dua nomor"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Kurangi operator"},
"dropletBlock_textInput_description":function(d){return "Membuat inputan teks dan menetapkan elemen id"},
"dropletBlock_textInput_param0":function(d){return "ID Input"},
"dropletBlock_textInput_param1":function(d){return "teks"},
"dropletBlock_textLabel_description":function(d){return "Menciptakan dan menampilkan label teks. Label teks digunakan untuk menampilkan keterangan untuk kontrol masukan berikut: radio buttons, check boxes, text inputs, dan dropdown lists"},
"dropletBlock_textLabel_param0":function(d){return "ID Label"},
"dropletBlock_textLabel_param0_description":function(d){return "A unique identifier for the label control. The id is used for referencing the created label. For example, to assign event handlers."},
"dropletBlock_textLabel_param1":function(d){return "teks"},
"dropletBlock_textLabel_param1_description":function(d){return "The value to display for the label."},
"dropletBlock_textLabel_param2":function(d){return "ID For"},
"dropletBlock_textLabel_param2_description":function(d){return "The id to associate the label with. Clicking the label is the same as clicking on the control."},
"dropletBlock_throw_description":function(d){return "melempar sebuah objek ke aktor tertentu"},
"dropletBlock_turnLeft_description":function(d){return "Mengubah arah penyu ke kiri oleh sudut yang ditentukan dalam derajat"},
"dropletBlock_turnLeft_param0":function(d){return "sudut/Segi"},
"dropletBlock_turnLeft_param0_description":function(d){return "The angle to turn left."},
"dropletBlock_turnRight_description":function(d){return "Mengubah arah penyu ke kanan dengan sudut tertentu dalam derajat"},
"dropletBlock_turnRight_param0":function(d){return "sudut/Segi"},
"dropletBlock_turnRight_param0_description":function(d){return "The angle to turn right."},
"dropletBlock_turnTo_description":function(d){return "Mengubah arah penyu ke sudut tertentu. 0 ke atas, 90 ke bawah, 180 ke bawah, and 270 ke kiri"},
"dropletBlock_turnTo_param0":function(d){return "sudut/Segi"},
"dropletBlock_turnTo_param0_description":function(d){return "The new angle to set the turtle's direction to."},
"dropletBlock_updateRecord_description":function(d){return "Menggunakan tabel penyimpanan data App Lab, update record/baris yang disediakan di tableName/nama tabel. record/baris harus diidentifikasi secara unik dengan kolom.field id-nya. Bila panggilan selesai, Fungsi callback dipanggil"},
"dropletBlock_updateRecord_param0":function(d){return "NamaTabel"},
"dropletBlock_updateRecord_param0_description":function(d){return "The name of the table from which the records should be searched and read."},
"dropletBlock_updateRecord_param1":function(d){return "record/baris"},
"dropletBlock_updateRecord_param2":function(d){return "Fungsicallback"},
"dropletBlock_vanish_description":function(d){return "Lenyapkan aktor."},
"dropletBlock_whileBlock_description":function(d){return "Menciptakan loop/perulangan yang terdiri dari ekspresi kondisional dan blok pernyataan dieksekusi untuk setiap iterasi dari loop. Loop terus melaksanakan selama kondisi bernilai true/benar"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"dropletBlock_write_description":function(d){return "Menambahkan teks tertentu ke bagian bawah dokumen. Teks juga dapat diformat sebagai HTML."},
"dropletBlock_write_param0":function(d){return "teks"},
"dropletBlock_write_param0_description":function(d){return "The text or HTML you want appended to the bottom of your application"},
"emptyBlocksErrorMsg":function(d){return "Blok \"Ulangi\" atau blok \"Jika\" membutuhkan blok lain di dalamnya supaya bisa bekerja. Pastikan blok yang berada didalam diletakkan secara pas."},
"emptyFunctionBlocksErrorMsg":function(d){return "Blok fungsi membutuhkan blok lain di dalamnya agar dapat bekerja."},
"emptyFunctionalBlock":function(d){return "Kamu memiliki blok dengan masukan yang tidak terisi."},
"end":function(d){return "akhir"},
"errorEmptyFunctionBlockModal":function(d){return "Diharuskan adanya blok di dalam fungsi mu. Klik \"sunting\" lalu geser blok itu ke dalam Blok Hijau."},
"errorIncompleteBlockInFunction":function(d){return "Klik \"sunting\" untuk memastikan bahwa Anda tidak menyisakan satupun blok di dalam fungsi ini."},
"errorParamInputUnattached":function(d){return "Jangan lupa untuk memasang blok pada setiap parameter masukan di dalam blok fungsi pada program ini."},
"errorQuestionMarksInNumberField":function(d){return "Cobalah mengganti \"???\" dengan sebuah nilai."},
"errorRequiredParamsMissing":function(d){return "Buatlah sebuah parameter untuk fungsi ini dengan mengklik \"sunting\" dan menambahkan parameter yang diperlukan. Geser blok parameter baru tersebut ke dalam fungsi ini."},
"errorUnusedFunction":function(d){return "Anda membuat sebuah fungsi, tetapi tidak digunakan dalam program ini! Klik tombol \"Fungsi\" pada Kotak Perkakas dan pastikan Anda menggunakan fungsi tersebut."},
"errorUnusedParam":function(d){return "Anda menambahkan blok parameter, tapi tidak digunakan kemudian. Klik \"sunting\" untuk memastikan penggunaan parameter tersebut dan menempatkannya di blok parameter di dalam Blok Hijau."},
"extraTopBlocks":function(d){return "Anda memiliki blok yang tak terpasang."},
"extraTopBlocksWhenRun":function(d){return "Anda memiliki blok yang tak terpasang. Apakah maksud Anda untuk memasang ini ke blok \"ketika dijalankan\"/\"when run\" ?"},
"finalStage":function(d){return "Horee! Anda berhasil menyelesaikan tahap akhir."},
"finalStageTrophies":function(d){return "Horee! Anda berhasil menyelesaikan tahap akhir dan memenangkan "+common_locale.p(d,"numTrophies",0,"id",{"one":"piala","other":"piala "+common_locale.n(d,"numTrophies")})+"."},
"finish":function(d){return "Selesai"},
"generatedCodeInfo":function(d){return "Bahkan Universitas mengajar blok berbasis pengkodean (misalnya, "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+"). Tetapi di bawah tenda, blok Anda telah berkumpul dapat juga ditunjukkan dalam JavaScript, dunia yang paling banyak digunakan pengkodean bahasa:"},
"genericFeedback":function(d){return "Lihatlah hasil anda dan cobalah untuk memperbaiki program Anda."},
"hashError":function(d){return "Maaf, '%1' tidak sesuai dengan program yang disimpan."},
"help":function(d){return "Tolong"},
"hideToolbox":function(d){return "(Sembunyikan)"},
"hintHeader":function(d){return "Berikut adalah tip:"},
"hintRequest":function(d){return "Lihat petunjuk"},
"hintTitle":function(d){return "Tips:"},
"infinity":function(d){return "∞"},
"jump":function(d){return "lompat"},
"keepPlaying":function(d){return "Tetap bermain"},
"levelIncompleteError":function(d){return "Anda telah gunakan semua jenis blok yang diperlukan  tetapi tidak dengan cara yang tepat."},
"listVariable":function(d){return "list"},
"makeYourOwnFlappy":function(d){return "Buatlah permainan \"Flappy\" versi Anda sendiri"},
"missingBlocksErrorMsg":function(d){return "Cobalah satu atau lebih blok di bawah untuk memecahkan teka-teki ini."},
"nextLevel":function(d){return "Horee! Anda berhasil menyelesaikan teka-teki ke  "+common_locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Horee! Anda berhasil menyelesaikan teka-teki ke  "+common_locale.v(d,"puzzleNumber")+" dan memenangkan "+common_locale.p(d,"numTrophies",0,"id",{"satu":"a trophy","other":"trophies "+common_locale.n(d,"numTrophies")})+"."},
"nextPuzzle":function(d){return "Teka-teki berikutnya"},
"nextStage":function(d){return "Selamat! Anda telah menyelesaikan "+common_locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Horee! Anda berhasil menyelesaikan teka-teki ke "+common_locale.v(d,"stageNumber")+" dan memenangkan "+common_locale.p(d,"numTrophies",0,"id",{"one":"piala","other":common_locale.n(d,"numTrophies")+" piala"})+"."},
"numBlocksNeeded":function(d){return "Horee! Anda berhasil menyelesaikan teka-teki ke  "+common_locale.v(d,"puzzleNumber")+". (Namun, sebetulnya Anda cukup gunakan hanya "+common_locale.p(d,"numBlocks",0,"id",{"one":"1 blok","other":"blok "+common_locale.n(d,"numBlocks")})+".)"},
"numLinesOfCodeWritten":function(d){return "Anda baru saja menulis "+common_locale.p(d,"numLines",0,"id",{"one":"1 baris","other":common_locale.n(d,"numLines")+" baris"})+" kode!"},
"openWorkspace":function(d){return "Cara kerjanya"},
"orientationLock":function(d){return "Matikan orientasi kunci dalam pengaturan perangkat."},
"play":function(d){return "mainkan"},
"print":function(d){return "Cetak"},
"puzzleTitle":function(d){return "Teka-teki ke "+common_locale.v(d,"puzzle_number")+" dari "+common_locale.v(d,"stage_total")},
"repeat":function(d){return "Ulangi"},
"resetProgram":function(d){return "Kembali ke awal"},
"rotateText":function(d){return "Memutar perangkat anda."},
"runProgram":function(d){return "Jalankan"},
"runTooltip":function(d){return "Jalankan program yang dibuat di blok ruang kerja."},
"saveToGallery":function(d){return "Simpan di Galeri"},
"savedToGallery":function(d){return "Tersimpan di Galeri!"},
"score":function(d){return "Skor"},
"shareFailure":function(d){return "Maaf, kami tidak bisa membagikan program ini."},
"showBlocksHeader":function(d){return "Tampilkan blok-blok"},
"showCodeHeader":function(d){return "Tampilkan kode"},
"showGeneratedCode":function(d){return "Tampilkan kode"},
"showToolbox":function(d){return "Tampilkan Toolbox"},
"signup":function(d){return "Daftarlah untuk mengikuti kursus introduksi"},
"stringEquals":function(d){return "string=?"},
"subtitle":function(d){return "Perangkat pemrograman visual"},
"textVariable":function(d){return "teks"},
"toggleBlocksErrorMsg":function(d){return "Anda perlu memperbaiki kesalahan dalam program Anda sebelum dapat ditunjukkan sebagai blok."},
"tooFewBlocksMsg":function(d){return "Anda telah gunakan semua jenis blok diperlukan, tetapi cobalah menggunakan lebih banyak blok-blok ini supaya anda dapat menyelesaikan teka-teki ini."},
"tooManyBlocksMsg":function(d){return "Teka-teki ini dapat diselesaikan dengan blok < x id = 'START_SPAN' /> < x id = 'END_SPAN'/>."},
"tooMuchWork":function(d){return "Anda membuat saya melakukan terlalu banyak pekerjaan!  Bisakan Anda coba membuat pengulangan yang lebih sedikit?"},
"toolboxHeader":function(d){return "blok"},
"toolboxHeaderDroplet":function(d){return "Toolbox"},
"totalNumLinesOfCodeWritten":function(d){return "Total keseluruhan: "+common_locale.p(d,"numLines",0,"id",{"one":"1 baris","other":common_locale.n(d,"numLines")+" baris"})+" kode."},
"tryAgain":function(d){return "Ayo coba lagi!"},
"tryHOC":function(d){return "Cobalah \"Hour of Code\""},
"wantToLearn":function(d){return "Ingin belajar untuk mengkode?"},
"watchVideo":function(d){return "Tonton Videonya"},
"when":function(d){return "ketika"},
"whenRun":function(d){return "ketika dijalankan"},
"workspaceHeaderShort":function(d){return "Area kerja: "}};