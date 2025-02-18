# frozen_string_literal: true

module Queries
  module Section
    # Selects sections with followers affected by the Child Account Policy.
    #
    # @param scope [Section::ActiveRecord_Relation] The range of sections to query.
    # @param period [Date, Range<Date>] The period to query for CAP affected followers.
    #
    # @return [Section::ActiveRecord_Relation] The sections with CAP affected followers.
    def self.cap_affected(scope: ::Section.all, period: nil)
      cap_affected_students = Queries::ChildAccount.cap_affected
      cap_affected_students = cap_affected_students.where(cap_status_date: period) if period

      cap_affected_followers = Follower.where(
        student_user_id: cap_affected_students.select(:id),
      )

      scope.where(
        id: cap_affected_followers.select(:section_id),
      )
    end
  end
end
