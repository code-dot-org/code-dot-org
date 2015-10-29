require_relative '../../deployment'
require 'cdo/rake_utils'

require 'rake/testtask'
Rake::TestTask.new(test: :create_pegasus_test_database)

task :create_pegasus_test_database do
  Dir.chdir(pegasus_dir) do
    RakeUtils.rake 'db:ensure_created', 'db:migrate', 'RACK_ENV=test'
  end
end
