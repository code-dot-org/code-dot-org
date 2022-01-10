# to do:
#   Gatekeeper flag support (from ReadReplicaHelper)
#   (in progress) use_database_pool controller route-by-route support
#   (in progress) manual use_master_connection block support from ChannelToken
module MultipleDatabasesTransitionHelper
  #include SeamlessDatabasePool::ControllerFilter
  def self.use_writer_connection(*args, &blk)
    if transitioned?
      connect_to_writer
    else
      SeamlessDatabasePool.use_master_connection(*args, &blk)
    end
  end

  def self.use_writer_connection_for_route(route)
    if transitioned?
      around_action :connect_to_writer, only: route
    else
      use_database_pool route => :persistent
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

  private

  def connect_to_writer
    ActiveRecord::Base.connected_to(role: :writing) do
      yield
    end
  end
end
