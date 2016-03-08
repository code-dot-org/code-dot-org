ENV['RACK_ENV'] = 'test'

require 'rake/testtask'
require_relative '../test/fixtures/fake_dashboard.rb'
Rake::TestTask.new
Rake::Task['test'].enhance do
  FakeDashboard.destroy_fake_dashboard_db
end
