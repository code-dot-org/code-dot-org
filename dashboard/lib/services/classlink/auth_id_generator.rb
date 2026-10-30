module Services
  module Classlink
    class AuthIdGenerator < Services::Base
      SEPARATOR = AuthenticationOption::Classlink::SEPARATOR

      attr_reader :tenant_id, :sourced_id, :classlink_user_id

      def initialize(tenant_id:, sourced_id:, classlink_user_id: nil)
        @tenant_id = tenant_id
        @sourced_id = sourced_id
        @classlink_user_id = classlink_user_id
      end

      # Joins TenantId and SourcedId into the v2 authentication_id.
      #
      # Validation is deliberately asymmetric: both components must be non-blank
      # after to_s, and tenant_id must not contain a pipe — but a pipe in
      # sourced_id is legal, because SourcedId is an arbitrary SIS-supplied
      # string whose format ClassLink does not constrain. Rejecting a pipe in
      # tenant_id is what keeps the format unambiguous and makes the first-pipe
      # split in AuthenticationOption::Classlink.parse sound.
      #
      # Returns nil when the components cannot form an id, so callers stay on
      # the v1 path rather than constructing "<TenantId>|" and colliding every
      # user in the tenant onto one auth option. Only an unexplained failure is
      # reported; see below for why a blank sourced_id is not one.
      def call
        tenant = tenant_id.to_s
        sourced = sourced_id.to_s

        # ClassLink leaves SourcedId empty for districts that have not enabled
        # OneRoster. Those users have no v2 identifier and never will, so they
        # sign up and sign in on the v1 UserId format permanently — this branch
        # is their normal path, taken on every such sign-in, and reporting it
        # would bury the anomalies below under routine traffic.
        return nil if sourced.blank?

        # A sourced_id in hand and still no id means tenant_id arrived in a
        # shape ClassLink does not document. Report it: nothing explains it,
        # and it silently costs the user their v2 record.
        if tenant.blank? || tenant.include?(SEPARATOR)
          Observability::Errors.report(
            'ClassLink v2 authentication id not built',
            context: {
              classlink_user_id: classlink_user_id,
              tenant_id_blank: tenant.blank?,
              tenant_id_contains_separator: tenant.include?(SEPARATOR),
            }
          )
          return nil
        end

        "#{tenant}#{SEPARATOR}#{sourced}"
      end
    end
  end
end
