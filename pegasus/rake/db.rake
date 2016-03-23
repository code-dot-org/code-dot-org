Sequel.extension :migration

def migrations_dir()
  pegasus_dir('migrations')
end

# Creates the MySQL database with the given database if it doesn't exist already.
def create_database(uri)
  db = URI.parse(uri)

  command = [
    'mysql',
    "--user=#{db.user}",
    "--host=#{db.host}",
  ]
  command << "--execute=\"CREATE DATABASE IF NOT EXISTS #{db.path[1..-1]}\""
  command << "--password=#{db.password}" unless db.password.nil?

  system command.join(' ')
end

namespace :db do
  desc 'Prints current schema version'
  task :version do
    version =
      if DB.tables.include?(:schema_info)
        DB[:schema_info].first[:version]
      end || 0

    puts "Schema Version: #{version}"
  end

  desc 'Ensures that Pegasus database is created'
  task :ensure_created do
    create_database CDO.pegasus_db_writer
  end

  desc 'Perform migration up to latest migration available'
  task :migrate do
    p DB
    Sequel::Migrator.run(DB, migrations_dir)
    Rake::Task['db:version'].execute
  end

  desc 'Perform rollback to specified target or full rollback as default'
  task :rollback, :target do |_t, args|
    args.with_defaults(:target => 0)

    Sequel::Migrator.run(DB, migrations_dir, target: args[:target].to_i)
    Rake::Task['db:version'].execute
  end

  desc 'Perform migration reset (full rollback and migration)'
  task :reset do
    Sequel::Migrator.run(DB, migrations_dir, target: 0)
    Sequel::Migrator.run(DB, migrations_dir)
    Rake::Task['db:version'].execute
  end

  task :help do
    puts 'db:version'
    puts 'db:migrate'
    puts 'db:rollback'
    puts 'db:reset'
  end
end
