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
# Every ClassLink account keeps a UserId-keyed record so that lookup always has
# somewhere to land.
#
# Returns nil if the UserId is blank, the v2 auth option doesn't exist, or this account
# already holds a v1 auth option — so callers can treat nil as "nothing to do".
# Returns the new AuthenticationOption without persisting it. Note that a v1 auth option
# held by a *different* account still returns a record, one that cannot save; see the
# comment at that check for why.
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

        # Byte-exact lookups throughout: ClassLink ids are case-sensitive and the column
        # collation is not (see CASE_SENSITIVE_CREDENTIAL_TYPES). For the existence check
        # below that means a case-twin's record must not be mistaken for this account's
        # own, which would leave the account unanchored forever.
        v2_auth_option = AuthenticationOption.find_by_exact_credential(
          credential_type: AuthenticationOption::CLASSLINK,
          authentication_id: classlink_v2_id
        )

        return nil unless v2_auth_option

        v1_already_exists = AuthenticationOption.find_by_exact_credential(
          credential_type: AuthenticationOption::CLASSLINK,
          authentication_id: v1_id
        )

        # Already anchored: nothing to do.
        #
        # Scoped to this account deliberately. A v1 row on a *different* account means
        # someone else holds this UserId, which should be impossible — ClassLink's UserId
        # is globally unique — so it means a duplicate account already exists, most likely
        # one orphaned before anchoring existed. That case falls through on purpose: the
        # uniqueness validation refuses the record built below, and the caller reports the
        # failure and signs the user in regardless. Returning nil for it would file the
        # duplicate as "already anchored" and discard the only trace of it.
        return nil if v1_already_exists&.user_id == v2_auth_option.user_id

        new_auth_option = v2_auth_option.dup
        new_auth_option.authentication_id = v1_id
        # version_for describes the id's actual format rather than asserting one, so a
        # UserId is stamped nil the same way it is everywhere else it gets copied.
        new_auth_option.version = AuthenticationOption::Classlink.version_for(v1_id)

        new_auth_option
      end
    end
  end
end
