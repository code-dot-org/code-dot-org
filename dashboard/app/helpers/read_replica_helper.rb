require 'dynamic_config/gatekeeper'

module ReadReplicaHelper
  def self.included(base)
    ActiveRecord::Base.include GatekeeperReadReplica
  end

  # Read curriculum (units, lessons, levels and their associations) from a reader database instance.
  #
  # Levelbuilder is the one deployment that writes curriculum, and an author must read back what they just wrote, so
  # replication lag there would show them stale content.
  def self.read_curriculum(&block)
    return yield if Rails.application.config.levelbuilder_mode
    ActiveRecord::Base.connected_to(role: :reading, &block)
  end

  # Wrap ActiveRecord::ConnectionHandling methods in Gatekeeper flag to allow
  # dynamic control over offloading queries to the read pool.
  module GatekeeperReadReplica
    extend ActiveSupport::Concern
    module ClassMethods
      # On by default on development and test environments to exercise read splitting earlier (even when there isn't
      # a separate read replica database). Defaults to disabled on production.
      def read_replica?
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
