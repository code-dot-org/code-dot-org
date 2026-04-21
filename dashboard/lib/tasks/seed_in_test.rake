Rake::Task['db:test:prepare'].enhance do
  if CDO.test_system? && !ENV.fetch('TEST_ENV_NUMBER', nil)
    raise 'Do not run db:test:prepare against dashboard_test DB on the chef-managed test system. ' \
      'Instead, specify TEST_ENV_NUMBER=1 to run against the dashboard_test1 database.'
  end
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
