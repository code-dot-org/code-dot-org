require "active_support/concern"

# A helper module to factilitate the transition from SeamlessDatabasePool to
# ActiveRecord's new Multiple Databases implementation.
module MultipleDatabasesTransitionHelper
  # Provide a new `use_reader_connection_for_route` method on controllers to
  # replace our existing use of `use_database_pool route_name: :persistent`
  # which can be used to declare that a particular route should explicitly
  # always use the read replica.
  module ControllerFilter
    extend ActiveSupport::Concern
    class_methods do
      def use_reader_connection_for_route(route)
        around_action :connect_to_reader, only: route
      end
    end

    def connect_to_reader
      if Gatekeeper.allows('reader_connection_override', where: {route: action_name}, default: false)
        yield
      else
        ActiveRecord::Base.connected_to(role: :reading) do
          yield
        end
      end
    end
  end

  # Get the name of ActiveRecord "role" used for connecting to the writer
  # database, as configured in database.yml
  def self.get_writing_role_name
    :primary
  end

  # Get the name of ActiveRecord "role" used for connecting to the reader
  # database. When read/write splitting is not enabled, this will be the same
  # as the writing role.
  #
  # Inspired by: https://medium.com/grailed-engineering/distributing-database-reads-across-replicas-with-rails-6-and-activerecord-23a24aa90c84
  def self.get_reading_role_name
    configurations = ActiveRecord::Base.configurations.configs_for(env_name: Rails.env, include_replicas: true)
    configurations.find(&:replica?)&.spec_name&.to_sym || get_writing_role_name
  end
end
