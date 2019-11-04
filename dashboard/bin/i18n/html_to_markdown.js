var fs = require('fs')
var unified = require('unified')
var createStream = require('unified-stream')
var parse = require('rehype-parse')
var rehype2remark = require('rehype-remark')
var stringify = require('remark-stringify')

var processor = unified()
  .use(parse)
  .use(rehype2remark)
  .use(stringify)
var json_file = process.argv[2]
var json_markdown = {};
fs.readFile(json_file, 
  function(err, data) {
    var jsonParsed = JSON.parse(data);
    for (var key in jsonParsed) {
      var value = jsonParsed[key];
      unified()
        .use(parse)
        .use(rehype2remark)
        .use(stringify)
        .process(value, function(err, html) {
          if (err) {
            console.error("ERROR: " + err);
          } else {
            json_markdown[key] = String(html);
            console.log(key);
          }
        });
    }
  }
);
console.log(json_markdown);

