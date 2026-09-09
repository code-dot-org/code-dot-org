# Creates a new v2 ClassLink AuthenticationOption by duplicating an existing v1 ClassLink
# AuthenticationOption. The v1 record stores ClassLink's internal UserId; the v2 record
# stores "<TenantId>|<SourcedId>" (see Services::Classlink::AuthIdGenerator). The v1
# record is kept, and not only for rollback: it stays a valid credential, and for a
# district that has not enabled OneRoster it is the only one the user will ever have,
# since ClassLink sends those districts no SourcedId to build a v2 id from.
# Returns nil if the v1 auth option doesn't exist, a v2 auth option already exists, or
# the v2 authentication id cannot be built from the given components.
# Returns the new AuthenticationOption without persisting it.
module Services
  module Classlink
    class V2AuthOptionBuilder < Services::Base
      attr_reader :classlink_v1_id, :tenant_id, :sourced_id

      def initialize(classlink_v1_id:, tenant_id:, sourced_id:)
        @classlink_v1_id = classlink_v1_id
        @tenant_id = tenant_id
        @sourced_id = sourced_id
      end

      def call
        classlink_v2_id = AuthIdGenerator.call(
          tenant_id: tenant_id,
          sourced_id: sourced_id,
          classlink_user_id: classlink_v1_id
        )
        return nil unless classlink_v2_id

        # Byte-exact lookups throughout: ClassLink ids are case-sensitive and
        # the column collation is not (see CASE_SENSITIVE_CREDENTIAL_TYPES).
        # The exactness matters most for the idempotency check below — under
        # the collation, a v2 id differing from this user's only by case would
        # block their v2 option from ever being built.
        classlink_auth_option = AuthenticationOption.find_by_exact_credential(
          credential_type: AuthenticationOption::CLASSLINK,
          authentication_id: classlink_v1_id
        )

        return nil unless classlink_auth_option

        v2_already_exists = AuthenticationOption.find_by_exact_credential(
          credential_type: AuthenticationOption::CLASSLINK,
          authentication_id: classlink_v2_id
        )

        return nil if v2_already_exists

        new_auth_option = classlink_auth_option.dup
        new_auth_option.authentication_id = classlink_v2_id
        new_auth_option.version = AuthenticationOption::Classlink::VERSION[:v2]

        new_auth_option
      end
    end
  end
end
