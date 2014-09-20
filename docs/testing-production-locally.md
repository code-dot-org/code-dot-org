# Testing Production Locally

Especially with asset additions and changes, it can be a good idea to test your local build in production mode. IE9 also cannot load more than a certain number of stylesheets and javascript files, so running your server in production mode to concatenate and minify assets is one workaround.

Running a local production server requires a few different steps.

## Steps

1. Temporarily **comment/remove these two lines** in **both** `config/initializers/devise.rb` and `config/initializers/secret_token.rb`:
  * `unless Rails.env.production?`
  * the corresponding `end`
1. `RAILS_ENV=production bundle exec rake db:reset seed:all assets:precompile`
1. `RAILS_ENV=production bundle exec rails s`
