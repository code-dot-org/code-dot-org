namespace :test do
  task :prepare do
    ENV['RACK_ENV'] = 'test' # we need to set rack env before deployment.rb loads
  end
end
