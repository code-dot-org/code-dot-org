module Services
  module User
    class Migrated < Services::Base
      PROVIDER_MIGRATED = 'migrated'.freeze

      attr_reader :user

      def initialize(user)
        @user = user
      end

      def call
        user.provider == PROVIDER_MIGRATED
      end
    end
  end
end
