# Creates a new v3.1 Clever AuthenticationOption by duplicating an existing v2 Clever
# AuthenticationOption.
# Returns the new AuthenticationOption without persisting it.
module Services
  module Clever
    class V3AuthOptionBuilder < Services::Base
      attr_reader :clever_v2_id, :clever_v3_id

      def initialize(clever_v2_id:, clever_v3_id:)
        @clever_v2_id = clever_v2_id
        @clever_v3_id = clever_v3_id
      end

      def call
        clever_auth_option = ::AuthenticationOption.find_by(
          credential_type: ::AuthenticationOption::CLEVER,
          authentication_id: clever_v2_id
        )

        return nil unless clever_auth_option

        new_auth_option = clever_auth_option.dup
        new_auth_option.authentication_id = clever_v3_id
        new_auth_option.version = ::AuthenticationOption::Clever::VERSION[:v3_1]

        new_auth_option
      end
    end
  end
end
