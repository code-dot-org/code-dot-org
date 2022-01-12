require "active_support/concern"

# to do:
#   Gatekeeper flag support (from ReadReplicaHelper)
#   (in progress) use_database_pool controller route-by-route support
#   (in progress) manual use_master_connection block support from ChannelToken
module MultipleDatabasesTransitionHelper
  module ControllerFilter
    #include SeamlessDatabasePool::ControllerFilter
    extend ActiveSupport::Concern
    class_methods do
      def use_reader_connection_for_route(route)
        if MultipleDatabasesTransitionHelper.transitioned?
          around_action :connect_to_reader, only: route
        else
          use_database_pool route => :persistent
        end
      end
    end

    def connect_to_reader
      ActiveRecord::Base.connected_to(role: :reading) do
        yield
      end
    end
  end

  def self.use_writer_connection(*args, &blk)
    if MultipleDatabasesTransitionHelper.transitioned?
      ActiveRecord::Base.connected_to(role: :writing) do
        yield
      end
    else
      SeamlessDatabasePool.use_master_connection(*args, &blk)
    end
  end

  def self.use_persistent_read_connection(*args, &blk)
    if MultipleDatabasesTransitionHelper.transitioned?
      # TODO
    else
      SeamlessDatabasePool.use_persistent_read_connection(*args, &blk)
    end
  end

  def self.transitioned?
    case Rails.version
    when "5.2.4.4"
      false
    when "6.0.4.1"
      true
    else
      raise "unknown Rails version #{Rails.version.inspect}"
    end
  end
end
