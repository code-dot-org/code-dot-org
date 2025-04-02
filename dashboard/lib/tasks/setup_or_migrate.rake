require 'active_record/errors'
require lib_dir 'cdo/data/logging/rake_task_event_logger'
include TimedTaskWithLogging

namespace :db do
  def database_exists?
    Rake::Task['environment'].invoke
    ActiveRecord::Base.connection.execute('SHOW TABLES')
  rescue ActiveRecord::NoDatabaseError, ActiveRecord::StatementInvalid
    false
  else
    true
  end

  timed_task_with_logging :setup_or_migrate do
    db_exists = database_exists?
    Rake::Task["db:load_config"].invoke
    if db_exists
      Rake::Task["db:migrate"].invoke
    else
      Rake::Task["db:create"].invoke
      Rake::Task["db:schema:load"].invoke
    end
  end

  # ensure that developers have their development and test databases set to use utf8mb3.
  # otherwise, new migrations will introduce schema.rb diffs in other environments.
  timed_task_with_logging :check_db_charset_collate do
    return unless [:development, :test].include? rack_env
    raise "DB does not exist" unless database_exists?

    character_set, collation = ActiveRecord::Base.connection.execute("SELECT @@character_set_database, @@collation_database").to_a[0]
    alter_command = "ALTER DATABASE #{ActiveRecord::Base.connection.current_database} CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci;"

    unless character_set == 'utf8mb3'
      raise "Database character set #{character_set.dump} is not 'utf8mb3'. please run:\n\n  #{alter_command}\n\n"
    end

    unless collation == 'utf8mb3_unicode_ci'
      raise "Database collation #{collation.dump} is not 'utf8mb3_unicode_ci'. please run:\n\n  #{alter_command}\n\n"
    end
  end
end

Rake::Task['db:migrate'].enhance [:check_db_charset_collate]
