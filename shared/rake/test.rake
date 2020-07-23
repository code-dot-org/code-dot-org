require 'rake/testtask'
require 'cdo/rake_utils'

task :prepare_dbs do
  with_rack_env(:test) do
    Dir.chdir(pegasus_dir) do
      puts "Migrating #{CDO.pegasus_db_name} database..."
      RakeUtils.rake 'db:ensure_created', 'db:migrate', 'seed:migrate'
    end
  end
end

task test: [:prepare_dbs] do
  ENV['RACK_ENV'] = 'test' if rack_env?(:development)
  ENV['HONEYBADGER_LOGGING_LEVEL'] = 'error'
  Rake::TestTask.new.tap do |t|
    t.warning = false
    t.pattern = 'test/**/test*.rb'
  end
end
