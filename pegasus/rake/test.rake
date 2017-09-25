ENV['RACK_ENV'] = 'test'

ENV['HONEYBADGER_LOGGING_LEVEL'] = 'error'

require 'rake/testtask'
require_relative '../test/fixtures/fake_dashboard.rb'
Rake::TestTask.new.tap {|x| x.warning = false}
Rake::Task['test'].enhance do
  FakeDashboard.destroy_fake_dashboard_db
end

namespace :test do
  desc 'Reset test dependencies: Drop, re-create and re-seed the database'
  task reset_dependencies: ['db:recreate', 'seed:reset']
end
