# Creates the v1 ClassLink AuthenticationOption for an account that holds only a v2 one,
# by duplicating the v2 record and swapping in ClassLink's UserId.
#
# This is the mirror of V2AuthOptionBuilder, and it exists because the two ids are not a
# before-and-after pair: the UserId is ClassLink-assigned, globally unique, stable, and
# present on every v2/my/info response, while "<TenantId>|<SourcedId>" depends on a
# SourcedId that is empty for districts without OneRoster. An account reachable
# only by its v2 id is therefore unreachable the moment its SourcedId changes or
# stops arriving — at which point we still know who the user is from the payload's
# UserId and have nothing stored under it to match.
# Every ClassLink account therefore keeps a record under its UserId, the one id that is
# always present, so a lookup always has somewhere to land.
#
# Returns nil if the UserId is blank, the v2 auth option doesn't exist, or this account
# already holds its v1 record — so callers can treat nil as "nothing to do".
# Returns the new AuthenticationOption without persisting it. Note that a v1 auth option
# held by a *different* account still returns a record, one that cannot save; see
# #already_holds_v1_option? for why.
module Services
  module Classlink
    class V1AuthOptionBuilder < Services::Base
      attr_reader :classlink_v2_id, :classlink_user_id

      def initialize(classlink_v2_id:, classlink_user_id:)
        @classlink_v2_id = classlink_v2_id
        @classlink_user_id = classlink_user_id
      end

      def call
        v1_id = classlink_user_id.to_s
        return nil if v1_id.blank?

        v2_auth_option = AuthenticationOption.find_by_exact_credential(
          credential_type: AuthenticationOption::CLASSLINK,
          authentication_id: classlink_v2_id
        )

        return nil unless v2_auth_option

        return nil if already_holds_v1_option?(v1_id: v1_id, user_id: v2_auth_option.user_id)

        new_auth_option = v2_auth_option.dup
        new_auth_option.authentication_id = v1_id
        # version_for describes the id's actual format rather than asserting one, so a
        # UserId is stamped nil the same way it is everywhere else it gets copied.
        new_auth_option.version = AuthenticationOption::Classlink.version_for(v1_id)

        new_auth_option
      end

      # Checks if this account already hold its v1 record.
      #
      # @param v1_id [String] the ClassLink UserId to check for
      # @param user_id [Integer] the id of the account to check for the v1_id on
      # @return [Boolean] true if the account already holds the v1 record
      private def already_holds_v1_option?(v1_id:, user_id:)
        existing = AuthenticationOption.find_by_exact_credential(
          credential_type: AuthenticationOption::CLASSLINK,
          authentication_id: v1_id
        )

        existing&.user_id == user_id
      end
    end
  end
end
