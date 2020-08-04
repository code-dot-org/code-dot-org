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

  task :round_trip_schema_cache do
    Rake::Task['environment'].invoke

    # This should be a no-op, but on staging we sometimes get a cache dump that changes when round-tripped through Marshal.
    schema_cache_file = dashboard_dir('db/schema_cache.dump')
    2.times do
      data = File.binread(schema_cache_file)
      checksum = Digest::MD5.hexdigest data
      open(schema_cache_file, 'wb') do |f|
        f.write(Marshal.dump(Marshal.load(data)))
      end
      ChatClient.log "Can the schema cache dump #{checksum} be round-tripped through Marshal? #{(data == Marshal.dump(Marshal.load(data)))}"
    end
  end
end
