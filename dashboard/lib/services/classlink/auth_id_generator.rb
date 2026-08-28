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
      # Returns nil (and reports the ClassLink UserId to Sentry for follow-up)
      # when the components cannot form an id, so callers fall back to the v1
      # path rather than constructing "<TenantId>|" and colliding every user
      # in the tenant onto one auth option.
      def call
        tenant = tenant_id.to_s
        sourced = sourced_id.to_s
        if tenant.blank? || sourced.blank? || tenant.include?(SEPARATOR)
          Observability::Errors.capture_message(
            'ClassLink v2 authentication id not built',
            extra: {
              classlink_user_id: classlink_user_id,
              tenant_id_blank: tenant.blank?,
              sourced_id_blank: sourced.blank?,
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
