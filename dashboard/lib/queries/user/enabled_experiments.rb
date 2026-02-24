# Query object for retrieving experiment names directly enabled for a user.
#
# Usage:
#   Queries::User::EnabledExperiments.call(user)
#   => ["experiment_1", "experiment_2"]
module Queries
  module User
    class EnabledExperiments < Queries::Base
      # @param user [::User] the user to query experiments for
      def initialize(user)
        @user = user
      end

      # Gets all experiment names directly enabled for the user
      #
      # @return [Array<String>] list of experiment names
      def call
        Experiment.get_all_enabled(user: user).pluck(:name)
      end

      private attr_reader :user
    end
  end
end
