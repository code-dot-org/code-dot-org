module Devise
  module Models
    # Provides custom timeout support, extending default Devise behavior.
    # Intended to allow different session timeouts based on special criteria,
    # such as user association with specific school districts, user roles, or
    # entities in third-party systems, like LTI integrations.
    module CustomTimeoutable
      extend ActiveSupport::Concern

      included do
        devise :timeoutable
      end

      # Devise provides the timeout_in method. Override this functionality here
      # to set custom session timeout values for different users.
      def timeout_in
        self.class.timeout_in
      end
    end
  end
end
