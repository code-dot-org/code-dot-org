require 'cdo/shared_constants'
require 'cpa'
require 'date'

class Policies::ChildAccount
  # Values for the `cap_status` attribute
  module ComplianceState
    # The period for "existing" users before their accounts locked out.
    GRACE_PERIOD = SharedConstants::CHILD_ACCOUNT_COMPLIANCE_STATES.GRACE_PERIOD

    # The student's account has been used to issue a request to a parent.
    LOCKED_OUT = SharedConstants::CHILD_ACCOUNT_COMPLIANCE_STATES.LOCKED_OUT

    # The student's account has been approved by their parent.
    PERMISSION_GRANTED = SharedConstants::CHILD_ACCOUNT_COMPLIANCE_STATES.PERMISSION_GRANTED

    # def self.grace_period?(student)
    # def self.locked_out?(student)
    # def self.permission_granted?(student)
    SharedConstants::CHILD_ACCOUNT_COMPLIANCE_STATES.to_h.each do |key, value|
      define_singleton_method("#{key.downcase}?") do |student|
        student.cap_status == value
      end
    end
  end

  # The delay is intended to provide notice to a parent
  # when a student may no longer be monitoring the "parent's email."
  PERMISSION_GRANTED_MAIL_DELAY = 24.hours

  # The maximum number of daily requests a student can send to their parent.
  MAX_STUDENT_DAILY_PARENT_PERMISSION_REQUESTS = 3

  # The maximum number of times a student can resend a request to a parent.
  MAX_PARENT_PERMISSION_RESENDS = 3

  # The maximum number of days a student should be age-gated before
  # a teacher stops receiving warnings about the sections the student is following.
  TEACHER_WARNING_PERIOD = 30.days

  # Is this user compliant with our Child Account Policy(cap)?
  # For students under-13, in Colorado, with a personal email login: we require
  # parent permission before the student can start using their account.
  def self.compliant?(user)
    return true unless parent_permission_required?(user)
    ComplianceState.permission_granted?(user)
  end

  # Checks if a user predates the us_state collection that occurs during the sign up
  # flow. We want to make sure we retrieve the state for those older accounts which have their
  # state missing
  # We use Colorado as it is the only start date we have for now
  def self.user_predates_state_collection?(user)
    # The date is the same as when CPA first started.
    user.created_at < state_policies['CO'][:start_date]
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
    return false unless parent_permission_required?(user)

    user_state_policy = state_policy(user)
    return false unless user_state_policy

    # Due to a leaky bucket issue, roster-synced Google accounts weren't being locked out as intended.
    # Therefore, it was decided to move their locking out to the "all-user lockout" phase.
    return true if user_state_policy[:name] == Cpa::NAME &&
      user.created_at < user_state_policy[:lockout_date] &&
      user.authentication_options.any?(&:google?)

    user.created_at < user_state_policy[:start_date]
  end

  # The date on which the student's grace period ends.
  # @param user [User] the student account
  # @param approximate [Boolean] if true, return an approximate date if the exact date is not known
  def self.grace_period_end_date(user, approximate: false)
    user_state_policy = state_policy(user)
    return unless user_state_policy

    grace_period_duration = user_state_policy[:grace_period_duration]
    return unless grace_period_duration

    start_date = user.cap_status_date if ComplianceState.grace_period?(user)
    start_date = user_state_policy[:lockout_date] if approximate && start_date.nil?

    start_date&.since(grace_period_duration)
  end

  # The date on which the student's account will be locked if the account is not compliant.
  # @param user [User] the student account
  # @param approximate [Boolean] if true, return an approximate date if the exact date is not known
  def self.lockout_date(user, approximate: false)
    return if compliant?(user)
    return if ComplianceState.locked_out?(user)

    # CAP non-compliant "pre-policy" created students can be locked out only after their grace period ends.
    return grace_period_end_date(user, approximate: approximate) if user_predates_policy?(user)

    # CAP non-compliant "post-policy" created students should be locked out immediately after the policy goes into effect.
    state_policy(user).try(:[], :start_date)
  end

  # Checks if the user is partially locked out due to current non-compliance with CAP, even
  # if we are granting them temporary 'compliance' in a grace period.
  def self.partially_locked_out?(user)
    # They are in the 'almost' locked out phase by predating the policy and
    # not pre-emptively getting parent permission. (They may be temporarily compliant.)
    user_predates_policy?(user) && !ComplianceState.permission_granted?(user)
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

  def self.state_policies
    # The individual US State child account policy configuration
    # name: the name of the policy
    # grace_period_duration: the duration of the grace period in seconds.
    # max_age: the oldest age of the child at which this policy applies.
    # lockout_date: the date at which we will begin to lockout all CPA users who
    # are not in compliance with the policy.
    # start_date: the date on which this policy first went into effect.
    {
      'CO' => {
        name: Cpa::NAME,
        max_age: 12,
        grace_period_duration: DCDO.get('cpa_grace_period_duration', Cpa::GRACE_PERIOD_DURATION)&.seconds,
        lockout_date: DateTime.parse(DCDO.get('cpa_schedule', {})[Cpa::ALL_USER_LOCKOUT] || Cpa::ALL_USER_LOCKOUT_DATE.iso8601),
        start_date: DateTime.parse(DCDO.get('cpa_schedule', {})[Cpa::NEW_USER_LOCKOUT] || Cpa::NEW_USER_LOCKOUT_DATE.iso8601),
      }
    }
  end

  def self.state_policy(user)
    # If the country_code is not set, then us_state value was inherited
    # from the teacher and we don't trust it.
    return unless user.country_code
    return unless user.us_state
    state_policies[user.us_state]
  end

  # Checks if the user will not be old enough by the lockout date
  def self.underage?(user)
    return false unless user.student?
    return false unless user.birthday

    policy = state_policy(user)
    return false unless policy

    lockout_date = policy.try(:[], :lockout_date)
    return false unless lockout_date

    # We have to add 1 to the max_age when calculating the birthday since birthdays are
    # inaccurate values and we want to *ensure* the student age is legally valid.
    min_required_age = (policy[:max_age] + 1).years

    # Checks if the student meets the minimum age requirement by the start of the lockout
    # (And thus they are not considered underage during pre-lockout periods)
    student_birthday = user.birthday.in_time_zone(lockout_date.utc_offset)
    return false unless student_birthday.since(min_required_age) > lockout_date

    # Check to see if they are old enough at the current date
    # We cannot trust 'user.age' because that is a different time zone and broken for leap years
    today = Time.zone.today.in_time_zone(lockout_date.utc_offset)
    student_age = today.year - student_birthday.year
    ((student_birthday + student_age.years > today) ? (student_age - 1) : student_age) <= policy[:max_age]
  end

  # Whether or not the user can create/link new personal logins
  def self.can_link_new_personal_account?(user)
    return true unless user.student?
    return false unless user.us_state && user.country_code
    return true unless user.birthday
    return true unless underage?(user)

    ComplianceState.permission_granted?(user)
  end

  # Check if parent permission is required for this account according to our
  # Child Account Policy.
  def self.parent_permission_required?(user)
    return false unless user.student?

    policy = state_policy(user)
    # Parent permission is not required for students who are not covered by a US State child account policy.
    return false unless policy

    # Parental permission is not required until the policy is in effect.
    return false if policy[:start_date] > DateTime.now

    # Parental permission is not required for students
    # whose age cannot be identified or who are older than the maximum age covered by the policy.
    return false unless underage?(user)

    personal_account?(user)
  end
end
