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
        if MultipleDatabasesTransitionHelper.transitioned?
          around_action :connect_to_reader, only: route
        else
          use_database_pool route => :persistent
        end
      end

      def connect_to_writer
        ActiveRecord::Base.connected_to(role: :writing) do
          yield
        end
      end
    end

    def connect_to_reader
      ActiveRecord::Base.connected_to(role: :reading) do
        yield
      end
    end
  end

  # Provide a new `use_writer_connection` method to replace our existing use of
  # `use_master_connection` with the entirely-equivalent ActiveRecord
  # implementation.
  def self.use_writer_connection
    if MultipleDatabasesTransitionHelper.transitioned?
      ActiveRecord::Base.connected_to(role: :writing) do
        yield
      end
    else
      SeamlessDatabasePool.use_master_connection do
        yield
      end
    end
  end

  # Provide a new `use_reader_connection` method to replace our existing use of
  # `use_persistent_read_connection` with the entirely-equivalent ActiveRecord
  # implementation.
  def self.use_reader_connection
    if MultipleDatabasesTransitionHelper.transitioned?
      ActiveRecord::Base.connected_to(role: :reading) do
        yield
      end
    else
      SeamlessDatabasePool.use_persistent_read_connection do
        yield
      end
    end
  end

  # Whether we are still on the old version (false, pre-transition) or the new
  # version (true, post-transition). Hardcoded to the known versions for
  # resiliency and narrow focus.
  def self.transitioned?
    case Rails.version
    when "5.2.4.4"
      false
    when ["6.0.4.1", "6.0.4.6"]
      true
    else
      raise "unknown Rails version #{Rails.version.inspect}"
    end
  end
end
