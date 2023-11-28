const mysql = require('mysql2')

const {chain}  = require('stream-chain');

const {parser} = require('stream-json');
const {pick}   = require('stream-json/filters/Pick');
const {streamObject} = require('stream-json/streamers/StreamObject');
const fs = require('fs');
const zlib = require('zlib');

console.log(`Reading from ${process.argv[2]}`);

const pipeline = chain([
  fs.createReadStream(process.argv[2]),
  zlib.createGunzip(),
  parser(),
  pick({filter: 'v3.channels'}),
  streamObject(),
]);


const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'unfirebase'
})

connection.connect()

connection.query('DELETE FROM unfirebase;')

connection.query('set global max_allowed_packet=10000000000;')

let count = 0
let bytes = 0
let largestObjectBytes = 0
let largestObjectKey = ''

pipeline.on('data', data => {
  const json = JSON.stringify(data.value)

  bytes += json.length

  if (json.length > largestObjectBytes) {
    largestObjectKey = data.key
    largestObjectBytes = json.length
    console.log(`Largest object is ${largestObjectKey} with ${largestObjectBytes/1000000}MB`)
  }

  if (count % 100 == 0)
    console.log(`key name is ${data.key}, count is ${count}, parsed ${bytes/1000000}MB`)

  connection.query(
    'INSERT INTO unfirebase VALUES (?, ?);',
    [data.key, json],
    function(err, results) { 
      if (err) {
          // console.log(json)
          fs.writeFileSync('error.json', json)
          throw err;
      };
    }
  )

  count++
})

pipeline.on('end', () => {
  console.log(`Largest object was ${largestObjectKey} with ${largestObjectBytes/1000000}MB`)

  connection.end()
})