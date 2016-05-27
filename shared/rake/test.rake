require 'rake/testtask'
task :test do
  ENV['RACK_ENV'] = 'test' if rack_env?(:development)
  Rake::TestTask.new
end
