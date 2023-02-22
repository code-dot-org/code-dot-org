// Match the functionality of pre-manifest.js-controlled Sprokets; ie, include
// only the application.{css.js} files and images, but not the other files in
// the javascripts and stylesheets directories.
// See https://github.com/rails/sprockets/blob/main/UPGRADING.md#manifestjs
//
//= link application.css
//= link application.js
//= link_tree ../images
