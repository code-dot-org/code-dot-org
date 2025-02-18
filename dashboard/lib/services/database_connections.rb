require "active_support/concern"

module Services
  module DatabaseConnections
    # Provide a `use_reader_connection_for_route` method on controllers to
    # declare that a particular route should explicitly always use the read
    # replica.
    #
    # Also supports the `reader_connection_override` gatekeeper flag, which can
    # be used to override said declaration on a route-by-route basis.
    module ControllerFilter
      extend ActiveSupport::Concern
      class_methods do
        def use_reader_connection_for_route(route)
          around_action :connect_to_reader, only: route
        end
      end

      def connect_to_reader(&block)
        filter_params = {
          action: action_name,
          controller: controller_name
        }
        if Gatekeeper.allows('reader_connection_override', where: filter_params, default: false)
          yield
        else
          ActiveRecord::Base.connected_to(role: :reading, &block)
        end
      end
    end
  end
end
