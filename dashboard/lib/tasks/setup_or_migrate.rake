require 'active_record/errors'

namespace :db do
  def database_exists?
    Rake::Task['environment'].invoke
    ActiveRecord::Base.connection.execute('SHOW TABLES')
  rescue ActiveRecord::NoDatabaseError, ActiveRecord::StatementInvalid
    false
  else
    true
  end

  task :setup_or_migrate do
    db_exists = database_exists?
    Rake::Task["db:load_config"].invoke
    if db_exists
      Rake::Task["db:migrate"].invoke
    else
      Rake::Task["db:create"].invoke
      Rake::Task["db:schema:load"].invoke
    end
  end
end
