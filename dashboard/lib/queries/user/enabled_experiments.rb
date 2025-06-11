# Query object for retrieving enabled experiment names for a given user.
#
# Provides methods to get the current user's enabled experiments and
# any experiments enabled for the user's associated teachers.
#
# Usage:
#   query = Queries::User::EnabledExperiments.new(user)
#   query.call            # => enabled experiment names for the user
#   query.from_teachers   # => unique experiment names from user's teachers
module Queries
  module User
    class EnabledExperiments < Queries::Base
      def initialize(user)
        @user = user
      end

      # Returns the enabled experiment names for the user.
      #
      # @return [Array<String>] list of experiment names
      def call
        experiment_names
      end

      # Gets all unique experiment names enabled for the user's teachers.
      #
      # @return [Array<String>] unique experiment names from teachers
      def from_teachers
        @user.teachers.flat_map do |teacher|
          Experiment.get_all_enabled(user: teacher).pluck(:name)
        end.uniq
      end

      # Gets all experiment names directly enabled for the user.
      #
      # @return [Array<String>] experiment names
      private def experiment_names
        Experiment.get_all_enabled(user: user).pluck(:name)
      end

      private attr_reader :user
    end
  end
end
