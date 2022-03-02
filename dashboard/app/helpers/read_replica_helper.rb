require 'dynamic_config/gatekeeper'

module ReadReplicaHelper
  # The Resolver class is used by the DatabaseSelector middleware to determine
  # which database the request should use.
  #
  # As recommended by Rails documentation, we change the behavior of the
  # Resolver class in our application by creating a custom resolver class that
  # inherits from DatabaseSelector::Resolver. In this case, we add the option
  # to dynamically disable redirecting traffic to the read replica with a
  # Gatekeeper flag.
  class GatekeeperReadReplicaResolver < ActiveRecord::Middleware::DatabaseSelector::Resolver
    private

      def read_from_primary?
        return true unless Gatekeeper.allows('dashboard_read_replica')
        super
      end
  end
end
