# Creates a new v2 ClassLink AuthenticationOption by duplicating an existing v1 ClassLink
# AuthenticationOption. The v1 record stores ClassLink's internal UserId; the v2 record
# stores "<TenantId>|<SourcedId>", the identifier the One Roster rostering API keys on.
# Returns nil if the v1 auth option doesn't exist, a v2 auth option already exists, or
# the v2 authentication id cannot be built from the given components.
# Returns the new AuthenticationOption without persisting it.
module Services
  module Classlink
    class V2AuthOptionBuilder < Services::Base
      SEPARATOR = '|'.freeze

      attr_reader :classlink_v1_id, :tenant_id, :sourced_id

      def initialize(classlink_v1_id:, tenant_id:, sourced_id:)
        @classlink_v1_id = classlink_v1_id
        @tenant_id = tenant_id
        @sourced_id = sourced_id
      end

      # Joins TenantId and SourcedId into the v2 authentication_id.
      #
      # Validation is deliberately asymmetric: both components must be non-blank
      # after to_s, and tenant_id must not contain a pipe — but a pipe in
      # sourced_id is legal, because SourcedId is an arbitrary SIS-supplied
      # string whose format ClassLink does not constrain. The format stays
      # unambiguous anyway: parse with split('|', 2), never a bare split('|').
      #
      # Returns nil (and logs the ClassLink UserId for follow-up) when the
      # components cannot form an id, so callers fall back to the v1 path
      # rather than constructing "<TenantId>|" and colliding every user in
      # the tenant onto one auth option.
      def self.build_authentication_id(tenant_id:, sourced_id:, classlink_user_id: nil)
        tenant = tenant_id.to_s
        sourced = sourced_id.to_s
        if tenant.blank? || sourced.blank? || tenant.include?(SEPARATOR)
          Rails.logger.warn(
            "ClassLink v2 authentication_id not built " \
            "(UserId: #{classlink_user_id.inspect}, TenantId blank: #{tenant.blank?}, " \
            "SourcedId blank: #{sourced.blank?}, TenantId pipe: #{tenant.include?(SEPARATOR)})"
          )
          return nil
        end
        "#{tenant}#{SEPARATOR}#{sourced}"
      end

      # Splits a v2 authentication_id back into [tenant_id, sourced_id].
      # The limit of 2 is load-bearing: SourcedId may itself contain a pipe.
      def self.parse_authentication_id(authentication_id)
        authentication_id.to_s.split(SEPARATOR, 2)
      end

      # The version marker matching a ClassLink authentication_id: 'v2' for the
      # "<TenantId>|<SourcedId>" format, nil for a legacy UserId. Creation sites
      # that copy an id they didn't build (signup migration, silent takeover)
      # use this so the version column always describes the id's actual format.
      def self.version_for(authentication_id)
        authentication_id.to_s.include?(SEPARATOR) ? AuthenticationOption::Classlink::VERSION[:v2] : nil
      end

      def call
        classlink_v2_id = self.class.build_authentication_id(
          tenant_id: tenant_id,
          sourced_id: sourced_id,
          classlink_user_id: classlink_v1_id
        )
        return nil unless classlink_v2_id

        classlink_auth_option = AuthenticationOption.find_by(
          credential_type: AuthenticationOption::CLASSLINK,
          authentication_id: classlink_v1_id
        )

        return nil unless classlink_auth_option

        v2_already_exists = AuthenticationOption.exists?(
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
