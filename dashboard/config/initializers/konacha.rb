# config/initializers/konacha.rb
if defined?(Konacha)
  require 'capybara/poltergeist'
  Konacha.configure do |config|
    config.driver = :poltergeist
  end
end
