require 'rake/testtask'
task :test do
  ENV['RACK_ENV'] = 'test' if rack_env?(:development)
  ENV['HONEYBADGER_LOGGING_LEVEL'] = 'error'
  Rake::TestTask.new.tap {|x| x.warning = false}
end
