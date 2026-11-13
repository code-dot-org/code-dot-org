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
        # Levelbuilders need to be able to read back their own curriculum saves data has replicated to the reader.
        return false if RequestStore.store[:current_user]&.levelbuilder?

        # Enable read splitting by default on `development` and `test` to exercise this functionality more broadly.
        # Disabled by default on production.
        Gatekeeper.allows('dashboard_read_replica', default: rack_env?(:development, :test))
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
