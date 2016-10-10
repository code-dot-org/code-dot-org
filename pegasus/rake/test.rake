ENV['RACK_ENV'] = 'test'

ENV['HONEYBADGER_LOGGING_LEVEL'] = 'error'

require 'rake/testtask'
require_relative '../test/fixtures/fake_dashboard.rb'
Rake::TestTask.new.tap{|x| x.warning = false}
Rake::Task['test'].enhance do
  FakeDashboard.destroy_fake_dashboard_db
end
