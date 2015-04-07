// Example commonJS reference to a cdo-prefixed npm package
// This uses the "node_modules/@cdo/example -> ../../shared/js/example" symlink
var example = require('@cdo/example');
console.log('example: ' , example);
