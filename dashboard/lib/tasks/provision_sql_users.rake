require 'cdo/sql_user_provisioner'

namespace :db do
  desc 'Provision non-root writer/reader MySQL users for CI and local dev (parity with the SQLUser Lambda).'
  task :provision_sql_users do
    # Only self-managed MySQL servers need this: Drone CI and local development.
    # Every AWS environment (adhoc, the managed test server test-studio.code.org,
    # staging, production) has its users provisioned by the Custom::SQLUser Lambda
    # against the Aurora cluster, and its admin login is not exposed there. Guard
    # is needed because `rake install` runs on those instances too.
    # TODO: Expand this test to include other systems not provisioned via CloudFormation, such as k8s.
    unless ENV['CI'] || rack_env?(:development)
      puts "Skipping db:provision_sql_users: not a CI build or local development environment (rack_env=#{rack_env})."
      next
    end

    result = Cdo::SqlUserProvisioner.provision_from_config!

    result[:provisioned].each do |username|
      puts "Provisioned '#{username}'@'#{Cdo::SqlUserProvisioner::CLIENT_HOST}'."
    end
    result[:skipped].each do |username|
      puts "Skipped '#{username}': same as the admin user (db_credential_* not pointed at a non-root user)."
    end
  end
end
