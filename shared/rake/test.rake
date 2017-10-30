require 'rake/testtask'
task :test do
  ENV['RACK_ENV'] = 'test' if rack_env?(:development)
  ENV['HONEYBADGER_LOGGING_LEVEL'] = 'error'
  Rake::TestTask.new.tap do |t|
    t.warning = false
    t.pattern = 'test/**/test*.rb'
  end
end
