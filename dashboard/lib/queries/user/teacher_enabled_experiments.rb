# Query object for retrieving experiment names enabled for a user's teachers.
#
# Usage:
#   Queries::User::TeacherEnabledExperiments.call(user)
#   => ["experiment_1", "experiment_2"]
#
# This query is useful for determining which experiments a student might
# implicitly have access to based on their teachers’ experiment enrollments.
module Queries
  module User
    class TeacherEnabledExperiments < Queries::Base
      # @param user [::User] the user to query experiments for
      def initialize(user)
        @user = user
      end

      # Gets all unique experiment names enabled for the user's teachers.
      #
      # @return [Array<String>] unique experiment names from teachers
      def call
        return [] if user&.teachers.blank?

        user.teachers.flat_map do |teacher|
          Experiment.get_all_enabled(user: teacher).pluck(:name)
        end.uniq
      end

      private attr_reader :user
    end
  end
end
