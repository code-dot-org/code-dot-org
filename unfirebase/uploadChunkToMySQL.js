const mysql = require('mysql2')

const {chain}  = require('stream-chain');

const {parser} = require('stream-json');
const {pick}   = require('stream-json/filters/Pick');
const {streamObject} = require('stream-json/streamers/StreamObject');
const fs = require('fs')
const zlib = require('zlib');

console.log(process.argv[2])

const pipeline = chain([
  fs.createReadStream(process.argv[2]),
  parser(),
  streamObject(),
])

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'unfirebase'
})

connection.query('set global max_allowed_packet=10000000000;')

let count=0
pipeline.on('data', data => {
  console.log(`Inserting key ${data.key}, count is ${count}`)
  const json = JSON.stringify(data.value)

  connection.query(
    'INSERT INTO unfirebase VALUES (?, ?)',
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

pipeline.on('end', () => connection.end())