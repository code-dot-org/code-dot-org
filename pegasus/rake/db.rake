Sequel.extension :migration

def migrations_dir()
  pegasus_dir('migrations')
end

namespace :db do
  desc 'Prints current schema version'
  task :version do
    version = if DB.tables.include?(:schema_info)
      DB[:schema_info].first[:version]
    end || 0

    puts "Schema Version: #{version}"
  end

  desc 'Perform migration up to latest migration available'
  task :migrate do
    Sequel::Migrator.run(DB, migrations_dir)
    Rake::Task['db:version'].execute
  end

  desc 'Perform rollback to specified target or full rollback as default'
  task :rollback, :target do |t, args|
    args.with_defaults(:target => 0)

    Sequel::Migrator.run(DB, migrations_dir, target:args[:target].to_i)
    Rake::Task['db:version'].execute
  end

  desc 'Perform migration reset (full rollback and migration)'
  task :reset do
    Sequel::Migrator.run(DB, migrations_dir, target:0)
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
