namespace :db do
  namespace :test do
    task :prepare do
      Rake::Task["seed:all"].invoke
    end
  end
end
