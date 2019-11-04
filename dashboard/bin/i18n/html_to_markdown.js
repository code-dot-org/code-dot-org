var fs = require('fs')
var unified = require('unified')
var createStream = require('unified-stream')
var parse = require('rehype-parse')
var rehype2remark = require('rehype-remark')
var stringify = require('remark-stringify')

var processor = unified()
  .use(parse)
  .use(rehype2remark)
  .use(stringify, {
  });
var json_file = process.argv[2]
fs.readFile(json_file, 
  function(err, data) {
    var json_markdown = {};
    var jsonParsed = JSON.parse(data);
    for (var key in jsonParsed) {
      if (key.startsWith("en.")) {
        continue;
      }
      var value = jsonParsed[key];
      unified()
        .use(parse)
        .use(rehype2remark)
        .use(stringify)
        .process(value, function(err, markdown_text_file) {
          if (err) {
            console.error("ERROR: " + err);
          } else {
            markdown_text = String(markdown_text_file).trim();
            json_markdown[key] = markdown_text;
          }
        });
    }
    console.log(json_markdown);
  }
);

