const {chain}  = require('stream-chain');

const {parser} = require('stream-json');
const {pick}   = require('stream-json/filters/Pick');
const {streamObject} = require('stream-json/streamers/StreamObject');
const fs = require('fs')
const zlib = require('zlib');

const pipeline = chain([
  fs.createReadStream('big-data.json.gz'),
  zlib.createGunzip(),
  parser(),
  pick({filter: 'v3.channels'}),
  streamObject(),
]);

if (!fs.existsSync('chunks')){
    fs.mkdirSync('chunks');
}

let count = 0
let chunkMaxCount = 10000 // i.e. 10K objects per json file
let fileNum = 0
let objectsInChunk = {}
let objectsInChunkCount = 0
let file = null

pipeline.on('data', data => {
  console.log(`key name is ${data.key}, count is ${count++}`)

  if (!file) {
    file = fs.createWriteStream(`chunks/${fileNum++}.json`)
    file.write('{')
  }

  // objectsInChunk[data.key] = data.value
  objectsInChunkCount++
  if (objectsInChunkCount > chunkMaxCount) {
    file.write(`"${data.key}": ${JSON.stringify(data)}\n}`)
    //fs.writeFileSync(`chunks/${fileNum++}.json`, JSON.stringify(objectsInChunk), 'utf8')
    //objectsInChunk = {}
    file.close()
    file = null
    objectsInChunkCount = 0
  } else {
    file.write(`"${data.key}": ${JSON.stringify(data)},\n`)
  }
});
