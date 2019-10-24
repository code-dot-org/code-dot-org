// Outputs a skeleteon of the code for each png to be put in fishData
var fs = require('fs');

const dir = 'public/images/fish/pectoralFin/';
const path = 'images/fish/pectoralFin/';
files = fs.readdirSync(dir);



/*files.forEach((file, idx) => {
  let key = file.match(/Dorsal_Fin_(.*?).png/)[1].toLowerCase();
  console.log(key + ": {");
  console.log("index: " + idx + ",");
  console.log("src: '" + path + file + "',");
  console.log("knnData: [0],");
  console.log("type: FishBodyPart.DORSAL_FIN");
  console.log("},");
});
*/
/*
files.forEach((file, idx) => {
  let key = file.match(/Tail_Fin_(.*?).png/)[1].toLowerCase();
  console.log(key + ": {");
  console.log("index: " + idx + ",");
  console.log("src: '" + path + file + "',");
  console.log("knnData: [0],");
  console.log("type: FishBodyPart.TAIL");
  console.log("},");
});*/
let idx = 0;
files.forEach((file) => {
  const match = file.match(/Pectoral_Fin_(.*?).png/);
  if (match) {
  let key = match[1].toLowerCase();
  console.log(key + ": {");
  console.log("index: " + idx + ",");
  console.log("src: '" + path + file + "',");
  console.log("knnData: [0],");
  console.log("type: FishBodyPart.PECTORAL_FIN_FRONT");
  console.log("},");
  idx++;
  }
});
