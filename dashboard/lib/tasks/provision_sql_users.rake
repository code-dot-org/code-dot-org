require 'cdo/sql_user_provisioner'

namespace :db do
  desc 'Provision writer/reader MySQL users for CI and local dev (parity with the SQLUser CloudFormation Resource).'
  task :provision_sql_users do
    # Only non-AWS ()development and continuous integration) environments need this.
    # Every AWS Stack has SQL Users provisioned via CloudFormation.
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
