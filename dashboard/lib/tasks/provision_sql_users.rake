require 'cdo/sql_user_provisioner'

namespace :db do
  desc 'Provision writer/reader MySQL users where no Aurora cluster provisions them (parity with the SQLUser Lambda).'
  task :provision_sql_users do
    # 'localhost' means no Aurora cluster, so no Custom::SQLUser CloudFormation Resource provisioning these users:
    # continuous integration, local development, and adhocs running mysqld on the app server EC2 Instance.
    # TODO: Expand this test to include other systems not provisioned via CloudFormation, such as k8s.
    unless CDO.db_cluster_id == 'localhost'
      puts "Skipping db:provision_sql_users: db_cluster_id=#{CDO.db_cluster_id.inspect} is an Aurora cluster."
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
