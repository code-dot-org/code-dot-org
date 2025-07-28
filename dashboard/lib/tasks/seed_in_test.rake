Rake::Task['db:test:prepare'].enhance do
  ActiveRecord::Base.establish_connection(:test)
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
