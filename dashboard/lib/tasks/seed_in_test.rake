namespace :db do
  namespace :test do
    task :prepare => :environment do
      Rake::Task["seed:all"].invoke
    end
  end
end
