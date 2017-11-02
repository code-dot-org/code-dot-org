ENV['RACK_ENV'] = 'test'

ENV['HONEYBADGER_LOGGING_LEVEL'] = 'error'

require 'rake/testtask'
Rake::TestTask.new.tap {|x| x.warning = false}

namespace :test do
  desc 'Reset test dependencies: Drop, re-create and re-seed the database'
  task reset_dependencies: ['db:recreate', 'seed:reset']
end
