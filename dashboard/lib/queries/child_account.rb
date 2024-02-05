require 'policies/child_account'

class Queries::ChildAccount
  # Get all the User's who are not compliant with the Child Account Policy for
  # longer than the grace period (7 days).
  # @param scope {User::ActiveRecord_Relation} The range of User's to query,
  # used for testing.
  # @param expiration_date [Time] User's who were locked out before this date
  # are considered 'expired'. Used for testing.
  def self.expired_accounts(scope: User.all, expiration_date: 7.days.ago)
    # Filter for accounts which don't have parent permission then filter for
    # accounts which have been locked out before the expiration_date
    scope.
      where(
        "JSON_EXTRACT(properties, '$.child_account_compliance_state') != ?",
        Policies::ChildAccount::ComplianceState::PERMISSION_GRANTED
      ).
      where(
        "CAST(properties->>'$.child_account_compliance_lock_out_date' AS DATETIME) <= ?",
        expiration_date
      )
  end

  # Retrieve the most recent ParentalPermissionRequest for a user
  def self.latest_permission_request(user)
    ParentalPermissionRequest.where(user: user).order(updated_at: :desc).limit(1).first
  end

  # Find the US state that the student most likely resides in, based on the state
  # associated with their most recent teacher's school.
  def self.teacher_us_state(user)
    return nil unless user.student?

    latest_student_section = user.sections_as_student.order(created_at: :desc).first
    return nil unless latest_student_section

    latest_teacher_school_info = UserSchoolInfo.where(user_id: latest_student_section.user_id).order(start_date: :desc).first
    return nil unless latest_teacher_school_info

    latest_teacher_school_info.school_info&.state
  end
end
