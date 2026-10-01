module Queries
  module User
    # The authentication options the account settings page lists under
    # "Manage linked accounts".
    #
    # A ClassLink user can hold several ClassLink records for one identity: a
    # v1 record keyed by ClassLink's UserId and v2 records keyed by
    # "<TenantId>|<SourcedId>". Sign-in keeps every one of them (see
    # Services::Classlink::V1AuthOptionBuilder for why), but to the user they
    # are a single login, so only one is listed: the newest v2 record, or the
    # v1 record when no v2 exists. The disconnect action treats the listed
    # record as standing for all of them, see
    # AuthenticationOptionsController#disconnect.
    class LinkedAccounts < Queries::Base
      def initialize(user:)
        @user = user
      end

      def call
        options = @user.authentication_options.to_a
        classlink_options = options.select {|option| option.credential_type == AuthenticationOption::CLASSLINK}
        return options if classlink_options.size <= 1

        shown = classlink_options.max_by do |option|
          [option.version == AuthenticationOption::Classlink::VERSION[:v2] ? 1 : 0, option.created_at, option.id]
        end
        options.reject {|option| classlink_options.include?(option) && option != shown}
      end
    end
  end
end
