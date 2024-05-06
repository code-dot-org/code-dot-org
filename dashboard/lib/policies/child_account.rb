require 'cdo/shared_constants'
require 'cpa'
require 'date'

class Policies::ChildAccount
  # Values for the `child_account_compliance_state` attribute
  module ComplianceState
    # The student's account has been used to issue a request to a parent.
    LOCKED_OUT = SharedConstants::CHILD_ACCOUNT_COMPLIANCE_STATES.LOCKED_OUT

    # The student's account has been used to issue a request to a parent.
    REQUEST_SENT = SharedConstants::CHILD_ACCOUNT_COMPLIANCE_STATES.REQUEST_SENT

    # The student's account has been approved by their parent.
    PERMISSION_GRANTED = SharedConstants::CHILD_ACCOUNT_COMPLIANCE_STATES.PERMISSION_GRANTED

    # def self.locked_out?(student)
    # def self.request_sent?(student)
    # def self.permission_granted?(student)
    SharedConstants::CHILD_ACCOUNT_COMPLIANCE_STATES.to_h.each do |key, value|
      define_singleton_method("#{key.downcase}?") do |student|
        student.child_account_compliance_state == value
      end
    end
  end

  # The individual US State child account policy configuration
  # max_age: the oldest age of the child at which this policy applies.
  # start_date: the date on which this policy first went into effect.
  STATE_POLICY = {
    'CO' => {
      max_age: 12,
      lockout_date: DateTime.parse(DCDO.get('cpa_schedule', {Cpa::ALL_USER_LOCKOUT => '2024-07-01T00:00:00MST'})[Cpa::ALL_USER_LOCKOUT]),
      start_date: DateTime.parse(DCDO.get('cpa_schedule', {Cpa::NEW_USER_LOCKOUT => '2023-07-01T00:00:00Z'})[Cpa::NEW_USER_LOCKOUT])
    }
  }.freeze

  # The delay is intended to provide notice to a parent
  # when a student may no longer be monitoring the "parent's email."
  PERMISSION_GRANTED_MAIL_DELAY = 24.hours

  # The maximum number of daily requests a student can send to their parent.
  MAX_STUDENT_DAILY_PARENT_PERMISSION_REQUESTS = 3

  # The maximum number of times a student can resend a request to a parent.
  MAX_PARENT_PERMISSION_RESENDS = 3

  # Is this user compliant with our Child Account Policy(cap)?
  # For students under-13, in Colorado, with a personal email login: we require
  # parent permission before the student can start using their account.
  def self.compliant?(user)
    return true unless parent_permission_required?(user)
    # CPA Part 2: unlock students created before the policy went into effect
    # who have requested parental permission but have not yet received approval.
    return true if ComplianceState.request_sent?(user) && user_predates_policy?(user)

    ComplianceState.permission_granted?(user)
  end

  # Checks if a user predates the us_state collection that occurs during the sign up
  # flow. We want to make sure we retrieve the state for those older accounts which have their
  # state missing
  # We use Colorado as it is the only start date we have for now
  def self.user_predates_state_collection?(user)
    user.created_at < STATE_POLICY['CO'][:start_date]
  end

  # 'cap-state-modal-rollout' should be a value in the range [0,100]
  # If the value is 10, 10% of users will see the modal
  # If the value is 50, 50% of users will see the modal
  def self.show_cap_state_modal?(user)
    return false unless user&.id
    (user.id % 100) < DCDO.get('cap-state-modal-rollout', 0)
  end

  # Checks if a user is affected by a state policy but was created prior to the
  # policy going into effect.
  def self.user_predates_policy?(user)
    parent_permission_required?(user) && user.created_at < STATE_POLICY[user.us_state][:start_date]
  end

  # The date on which the student's account will be locked if the account is not compliant.
  def self.lockout_date(user)
    return if compliant?(user)
    state_policy(user).try(:[], :lockout_date)
  end

  private_class_method def self.state_policy(user)
    return unless user.us_state
    STATE_POLICY[user.us_state]
  end

  # Check if parent permission is required for this account according to our
  # Child Account Policy.
  private_class_method def self.parent_permission_required?(user)
    return false unless user.student?

    policy = state_policy(user)
    return false unless policy

    lockout_date = policy[:lockout_date]
    student_birthday = user.birthday.in_time_zone(lockout_date.utc_offset)
    min_required_age = policy[:max_age].next.years
    # Checks if the student meets the minimum age requirement at the start of the lockout
    return false if student_birthday.since(min_required_age) <= lockout_date

    personal_account?(user)
  end

  # Authentication option types which we consider to be "owned" by the school
  # the student attends because the school has admin control of the account.
  SCHOOL_OWNED_TYPES = [AuthenticationOption::CLEVER, AuthenticationOption::LTI_V1].freeze

  # Does the user login using credentials they personally control?
  # For example, some accounts are created and owned by schools (Clever).
  def self.personal_account?(user)
    return false if user.sponsored?
    # List of credential types which we believe schools have ownership of.
    # Does the user have an authentication method which is not controlled by
    # their school? The presence of at least one authentication method which
    # is owned by the student/parent means this is a "personal account".
    if user.migrated?
      user.authentication_options.any? do |option|
        SCHOOL_OWNED_TYPES.exclude?(option.credential_type)
      end
    else
      SCHOOL_OWNED_TYPES.exclude?(user.provider)
    end
  end
end
