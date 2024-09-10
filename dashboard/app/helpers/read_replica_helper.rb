require 'dynamic_config/gatekeeper'

module ReadReplicaHelper
  def self.included(base)
    ActiveRecord::Base.include GatekeeperReadReplica
  end

  # Wrap ActiveRecord::ConnectionHandling methods in Gatekeeper flag to allow
  # dynamic control over offloading queries to the read pool.
  module GatekeeperReadReplica
    extend ActiveSupport::Concern
    module ClassMethods
      def read_replica?
        Gatekeeper.allows('dashboard_read_replica')
      end

      def connected_to(role: nil, prevent_writes: false, &blk)
        if read_replica?
          super
        else
          super(role: :writing, prevent_writes: prevent_writes, &blk)
        end
      end
    end
  end
end
