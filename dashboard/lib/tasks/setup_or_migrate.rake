namespace :db do
  def database_exists?
    ActiveRecord::Base.connection
  rescue
    false
  else
    true
  end

  task :setup_or_migrate => [:environment, :load_config] do
    if database_exists?
      Rake::Task["db:migrate"].invoke
    else
      Rake::Task["db:setup"].invoke
    end
  end
end
