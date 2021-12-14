Rake::Task['db:test:prepare'].enhance do
  ActiveRecord::Base.establish_connection(:test)
  if ENV['UTF8']
    ActiveRecord::Base.connection.execute(
      "ALTER DATABASE #{ActiveRecord::Base.connection.current_database} CHARACTER SET utf8 COLLATE utf8_unicode_ci;"
    )
  end
  Rake::Task['db:fixtures:load'].invoke
  require 'cdo/db_utils'
  DBUtils.reload_proxy_backends
  Rake::Task['seed:test'].invoke
  ActiveRecord::Base.establish_connection(ENV['RAILS_ENV'].to_sym)
end

Rake::Task['db:test:purge'].enhance do
  require 'cdo/db_utils'
  DBUtils.reload_proxy_backends
end
