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
      # On by default on development and test environments to exercise read splitting earlier (even when there isn't
      # a separate read replica database). Defaults to disabled on production.
      def read_replica?
        # `read_from_writer specifies that all ActiveRecord queries should read from the writer database for the current
        # request/job. One usage is to ensure curriculum authors (levelbuilders) always read the changes they just saved.
        return false if Current.read_from_writer

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
