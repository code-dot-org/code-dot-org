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

      def lookup_connection_handler(handler_key)
        if read_replica?
          super(handler_key)
        else
          super(ActiveRecord::Base.writing_role)
        end
      end
    end
  end
end
