# This module contains policies relating to the roles used by ActiveRecord to
# handle multiple database connections
module Policies::ActiveRecordRoles
  # Get the name of ActiveRecord "role" used for connecting to the writer
  # database, as configured in database.yml.
  def self.get_writing_role_name
    :primary
  end

  # Get the name of ActiveRecord "role" used for connecting to the reader
  # database. When read/write splitting is not enabled, this will be the same
  # as the writing role.
  #
  # Inspired by: https://medium.com/grailed-engineering/distributing-database-reads-across-replicas-with-rails-6-and-activerecord-23a24aa90c84
  def self.get_reading_role_name
    :primary_replica
  end

  def self.get_reporting_role_name
    :primary_reporting
  end
end
