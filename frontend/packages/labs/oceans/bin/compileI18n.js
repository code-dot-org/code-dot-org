var fs = require('fs');
var MessageFormat = require('messageformat');

const data = fs.readFileSync('i18n/oceans.json');
const mf = new MessageFormat('en');
const i18n = mf.precompileObject(JSON.parse(data));
fs.writeFileSync('i18n/oceans.js', 'export const oceans_locale = ' + i18n);
