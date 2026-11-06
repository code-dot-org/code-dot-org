require_relative '../../deployment'

namespace :sql_users do
  desc 'Provision the non-root writer and reader MySQL users.'
  task :provision do
    sh deploy_dir('bin', 'provision-sql-users')
  end
end
