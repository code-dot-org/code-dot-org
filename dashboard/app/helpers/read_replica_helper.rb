require 'dynamic_config/gatekeeper'

module ReadReplicaHelper
  def self.included(base)
    ActiveRecord::Base.include ReadReplicaRouting
  end

  # Sends each connected_to(role: :reading) block to the replica or to the writer.
  module ReadReplicaRouting
    extend ActiveSupport::Concern
    module ClassMethods
      def read_replica?
        # Levelbuilders read back curriculum they have just saved, which may not have reached the replica yet.
        return false if RequestStore.store[:current_user]&.levelbuilder?

        # On by default in development and test, to exercise read splitting even without a separate replica.
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
