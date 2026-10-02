module Queries
  module User
    # The authentication options the account settings page lists under
    # "Manage linked accounts".
    #
    # Some providers leave a user holding several records for one identity.
    # A ClassLink user can have a v1 record keyed by ClassLink's UserId and
    # v2 records keyed by "<TenantId>|<SourcedId>"; a Clever user can have a
    # pre-v3 record (nil version) and a v3 record. Sign-in keeps every one of
    # them (see Services::Classlink::V1AuthOptionBuilder for why), but to the
    # user they are a single login, so only one is listed per provider: the
    # newest record on the preferred version, or the newest record at all
    # when none is on it. The disconnect action treats the listed record as
    # standing for all of them, see AuthenticationOptionsController#disconnect.
    class LinkedAccounts < Queries::Base
      # Providers that may hold several records per identity, with the
      # version the listed record should come from.
      COLLAPSED_PROVIDERS = {
        AuthenticationOption::CLASSLINK => AuthenticationOption::Classlink::VERSION[:v2],
        AuthenticationOption::CLEVER => AuthenticationOption::Clever::VERSION[:v3],
      }.freeze

      def self.collapsed?(credential_type)
        COLLAPSED_PROVIDERS.key?(credential_type)
      end

      def initialize(user:)
        @user = user
      end

      def call
        options = @user.authentication_options.to_a
        hidden = COLLAPSED_PROVIDERS.flat_map do |credential_type, preferred_version|
          records = options.select {|option| option.credential_type == credential_type}
          next [] if records.size <= 1

          shown = records.max_by do |option|
            [option.version == preferred_version ? 1 : 0, option.created_at, option.id]
          end
          records - [shown]
        end
        options - hidden
      end
    end
  end
end
