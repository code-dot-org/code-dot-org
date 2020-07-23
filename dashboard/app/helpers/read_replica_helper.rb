require 'dynamic_config/gatekeeper'

module ReadReplicaHelper
  def self.included(base)
    SeamlessDatabasePool::ControllerFilter.prepend GatekeeperReadReplica
  end

  # Wrap SeamlessDatabasePool::ControllerFilter methods in Gatekeeper flag
  # to allow dynamic control over offloading queries to the read pool.
  module GatekeeperReadReplica
    def read_replica?
      Gatekeeper.allows('dashboard_read_replica')
    end

    def use_master_db_connection_on_next_request
      super if read_replica?
    end

    def set_read_only_connection_for_block(action)
      read_replica? ? super : yield
    end
  end
end
