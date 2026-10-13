# Testing Production Locally

Especially with asset additions and changes, it can be a good idea to test your local build in production mode.

Running a local production server requires a few different steps.

## Steps

1. Temporarily **comment/remove** both `unless Rails.env.production?` blocks in
   `dashboard/config/initializers/devise.rb` (the `secret_key` and `pepper`
   fallbacks), keeping the assignments inside them.
1. `dashboard/config/initializers/secret_token.rb` reads
   `dashboard_secret_key_base`, which production configuration treats as a
   secret. Set it to any value in `locals.yml`.
1. `RAILS_ENV=production bundle exec rake db:reset seed:all assets:precompile`
1. `RAILS_ENV=production bundle exec rails s`

## See Also

* [General Testing Instructions](../TESTING.md)
