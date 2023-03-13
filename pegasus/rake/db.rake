require lib_dir 'cdo/data/logging/rake_task_event_logger'
include TimedTaskWithLogging

Sequel.extension :migration

def migrations_dir
  pegasus_dir('migrations')
end

# Creates the MySQL database with the given database if it doesn't exist already.
def create_database(uri)
  db = URI.parse(uri)
  execute_db_statement(db, "CREATE DATABASE IF NOT EXISTS #{db.path.slice!(1..-1)}")
end

# Drops the MySQL database
def drop_database(uri)
  db = URI.parse(uri)
  execute_db_statement(db, "DROP DATABASE #{db.path.slice!(1..-1)}")
end

def execute_db_statement(db, statement)
  require_relative '../../lib/cdo/mysql_console_helper'
  MysqlConsoleHelper.run(db, statement, warn: false)
end

namespace :db do
  desc 'Prints current schema version'
  timed_task_with_logging :version do
    version =
      if DB.tables.include?(:schema_info)
        DB[:schema_info].first[:version]
      end || 0

    puts "Schema Version: #{version}"
  end

  desc 'Ensures that Pegasus database is created'
  timed_task_with_logging :ensure_created do
    create_database CDO.pegasus_db_writer
  end

  desc 'Recreate the pegasus database (test only)'
  timed_task_with_logging recreate: [:drop, :ensure_created, :migrate]

  desc 'Drop the pegasus database (test only)'
  timed_task_with_logging :drop do
    unless [:test].include? CDO.rack_env
      raise Exception.new 'Dropping the database is only permitted in test environment.'
    end
    drop_database CDO.pegasus_db_writer
  end

  desc 'Perform migration up to latest migration available'
  timed_task_with_logging :migrate do
    p DB
    Sequel::Migrator.run(DB, migrations_dir)
    Rake::Task['db:version'].execute
  end

  desc 'Perform rollback to specified target or full rollback as default'
  timed_task_with_logging :rollback, :target do |_t, args|
    args.with_defaults(target: 0)

    Sequel::Migrator.run(DB, migrations_dir, target: args[:target].to_i)
    Rake::Task['db:version'].execute
  end

  desc 'Perform migration reset (full rollback and migration)'
  timed_task_with_logging :reset do
    Sequel::Migrator.run(DB, migrations_dir, target: 0)
    Sequel::Migrator.run(DB, migrations_dir)
    Rake::Task['db:version'].execute
  end
end
