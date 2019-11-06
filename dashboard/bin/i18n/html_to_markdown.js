var fs = require('fs')
var unified = require('unified')
var createStream = require('unified-stream')
var parse = require('rehype-parse')
var rehype2remark = require('rehype-remark')
var stringify = require('remark-stringify')
var yaml = require('node-yaml')


var processor = unified()
  .use(parse)
  .use(rehype2remark)
  .use(stringify, {
  });
var json_file = process.argv[2]
fs.readFile(json_file, 
  function(err, data) {
    var jsonParsed = JSON.parse(data);
    var locales = {};
    for (var key in jsonParsed) {
      if (key.startsWith("en.")) {
        continue;
      }
      var key_parts = key.split('.');
      var locale = key_parts[0];
      if (locales[locale] === undefined) {
        locales[locale] = {};
      }
      // build up the nested contexts if they don't exist
      var context = locales[locale];
      for (var i=0; i<key_parts.length-1; i++) {
        var key_part = key_parts[i];
        if (context[key_part] === undefined) {
          context[key_part] = {};
        }
        context = context[key_part];
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
            context[key_parts[key_parts.length-1]] = markdown_text;
          }
        });
    }
    for (var localeCode in locales) {
      var file_name = "translated_yml/" + localeCode + ".yml";
      var locale = locales[localeCode];
      yaml.writeSync(file_name, locale, {"lineWidth": -1});
    }
  }
);

