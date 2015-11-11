require 'active_record/errors'

namespace :db do
  def database_exists?
    ActiveRecord::Base.connection
  rescue ActiveRecord::NoDatabaseError
    false
  else
    true
  end

  task :setup_or_migrate => [:environment, :load_config] do
    if database_exists?
      Rake::Task["db:migrate"].invoke
    else
      Rake::Task["db:create"].invoke
      Rake::Task["db:schema:load"].invoke
    end
  end
end
