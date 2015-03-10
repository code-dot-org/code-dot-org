# Testing IE9

IE9 also cannot load more than a certain number of stylesheets and javascript files, so disabling asset debugging and blockly prettifying will fix the issue.

## Steps

1. In `config/environments/development.rb`, set these two config variables to false:
  * `config.assets.debug = false`
  * `config.pretty_apps = false`
2. Run your Rails server normally with `bundle exec rails s`
3. Be sure not to commit these line changes

## Newer IE in IE9 mode

Note that it's also possible to use a newer version of IE (e.g. IE10 or IE11) and switching it to IE9 mode in the developer console.
