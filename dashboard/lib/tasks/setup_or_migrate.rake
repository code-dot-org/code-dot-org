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

  namespace :schema do
    namespace :cache do
      # Normalize schema cache dump by re-processing the binary output through Marshal.
      # This should be a no-op, but sometimes the output changes when round-tripped through Marshal
      # (e.g., from subtle differences in how Ruby de-duplicates String objects in hash keys).
      # See also SchemaCacheDedup patch.
      task :dump do
        file = 'schema_cache.dump'
        path = File.join(ActiveRecord::Tasks::DatabaseTasks.db_dir, file)
        old = File.binread(path)
        new = Marshal.dump(Marshal.load(old))
        unless old == new
          ChatClient.log "#{file} changed from " \
            "#{Digest::MD5.hexdigest(old)[0..4]} (#{old.bytesize} bytes) to " \
            "#{Digest::MD5.hexdigest(new)[0..4]} (#{new.bytesize} bytes) after reprocessing."
          File.binwrite(path, new)
        end
      end
    end
  end
end
