require 'cdo/shared_constants'
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
  # @param [Boolean] future Set to true if you want to know if the user will be
  # compliant in the future after CAP goes into affect in their US State.
  # Defaults to `false`
  def self.compliant?(user, future: false)
    return true unless parent_permission_required?(user, future: future)
    ComplianceState.permission_granted?(user)
  end

  # Checks if a user predates the us_state collection that occurs during the sign up
  # flow. We want to make sure we retrieve the state for those older accounts which have their
  # state missing
  # We use Colorado as it is the only start date we have for now
  def self.user_predates_state_collection?(user)
    # The date is the same as when CPA first started.
    user.created_at < StatePolicies.state_policies['CO'][:start_date]
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

    user_state_policy = StatePolicies.state_policy(user)
    return false unless user_state_policy

    # Due to a leaky bucket issue, roster-synced Google accounts weren't being locked out as intended.
    # Therefore, it was decided to move their locking out to the "all-user lockout" phase.
    return true if user_state_policy[:name] == StatePolicies.state_policies['CO'][:name] &&
      user.created_at < user_state_policy[:lockout_date] &&
      user.authentication_options.any?(&:google?)

    user.created_at < user_state_policy[:start_date]
  end

  # The date on which the student's grace period ends.
  # @param user [User] the student account
  # @param approximate [Boolean] if true, return an approximate date if the exact date is not known
  def self.grace_period_end_date(user, approximate: false)
    user_state_policy = StatePolicies.state_policy(user)
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
  # @param future [Boolean] return the lockout date for the user even if the CAP
  # policy for their state hasn't begun yet.
  def self.lockout_date(user, approximate: false, future: false)
    return if compliant?(user, future: future)
    return if ComplianceState.locked_out?(user)

    # CAP non-compliant "pre-policy" created students can be locked out only after their grace period ends.
    return grace_period_end_date(user, approximate: approximate) if user_predates_policy?(user)

    # CAP non-compliant "post-policy" created students should be locked out immediately after the policy goes into effect.
    StatePolicies.state_policy(user)&.dig(:start_date)
  end

  # Checks if the user is partially locked out due to current non-compliance with CAP, even
  # if we are granting them temporary 'compliance' in a grace period.
  def self.partially_locked_out?(user)
    # They are in the 'almost' locked out phase by predating the policy and
    # not pre-emptively getting parent permission. (They may be temporarily compliant.)
    user_predates_policy?(user) && !ComplianceState.permission_granted?(user)
  end

  # Authentication option types which we always consider to be "owned" by the school
  # the student attends because the school has admin control of the account.
  SCHOOL_OWNED_TYPES = Set[AuthenticationOption::CLEVER, AuthenticationOption::LTI_V1].freeze

  # Login types that are considered school owned only if the user is in a section or was created via
  # roster sync from an LMS.
  CONDITIONALLY_SCHOOL_OWNED_TYPES = Set[AuthenticationOption::GOOGLE, AuthenticationOption::MICROSOFT].freeze

  # Login types that are always considered personal logins.
  PERSONAL_LOGIN_TYPES = Set[AuthenticationOption::EMAIL, AuthenticationOption::FACEBOOK].freeze

  # Does the user login using credentials they personally control?
  # For example, some accounts are created and owned by schools (Clever).
  def self.personal_account?(user)
    # Sponsored accounts are always managed by the teacher.
    return false if user.sponsored?

    # Email + password logins are always personal logins.
    return true if user.encrypted_password.present?

    providers = user.migrated? ? Set.new(user.authentication_options.pluck(:credential_type)) : Set.new([user.provider])
    return true if providers.empty?

    # Email and Facebook are always personal logins.
    return true if providers.intersect?(PERSONAL_LOGIN_TYPES)

    # Clever and LTI are never personal logins if no other login types are present.
    return false if providers.subset?(SCHOOL_OWNED_TYPES)

    # Google and Microsoft are considered school owned for users who are in sections and/or
    # if the user was created via a roster sync.
    if providers.intersect?(CONDITIONALLY_SCHOOL_OWNED_TYPES)
      return !conditionally_school_managed?(user)
    end

    return true
  end

  # Checks if the user will not be old enough by the lockout date
  def self.underage?(user)
    return false unless user.student?
    return false unless user.birthday

    policy = StatePolicies.state_policy(user)
    return false unless policy

    lockout_date = policy.try(:[], :lockout_date)
    return false unless lockout_date

    # We have to add 1 to the max_age when calculating the birthday since birthdays are
    # inaccurate values and we want to *ensure* the student age is legally valid.
    min_required_age = (policy[:max_age] + 1).years

    # Checks if the student meets the minimum age requirement by the start of the lockout
    # (And thus they are not considered underage during pre-lockout periods)
    # We will default to UTC if the timezone is not set.
    student_birthday = user.birthday.in_time_zone('UTC').in_time_zone(lockout_date.utc_offset)
    return false unless student_birthday.since(min_required_age) > lockout_date

    # Check to see if they are old enough at the current date
    # We cannot trust 'user.age' because that is a different time zone and broken for leap years
    today = DateTime.now.in_time_zone(lockout_date.utc_offset)
    student_age = today.year - student_birthday.year
    ((student_birthday + student_age.years > today) ? (student_age - 1) : student_age) <= policy[:max_age]
  end

  # Whether or not the user can create/link new personal logins
  def self.can_link_new_personal_account?(user)
    return true unless user.student?
    return false unless has_required_information?(user)
    return true unless ['US', 'RD'].include?(user.country_code)
    return true unless underage?(user)

    ComplianceState.permission_granted?(user)
  end

  # Returns true if the user has provided the minimum information we need to decide if their account is affected by our Child Account Policy.
  def self.has_required_information?(user)
    [user.us_state, user.country_code, user.birthday].all?(&:present?)
  end

  # Check if parent permission is required for this account according to our
  # Child Account Policy.
  # @param [Boolean] future Set to true if you want to know if the student will
  # need parent permission in the future after CAP goes into affect in their
  # US State. Defaults to `false`.
  def self.parent_permission_required?(user, future: false)
    return false unless user.student?

    policy = StatePolicies.state_policy(user)
    # Parent permission is not required for students who are not covered by a US State child account policy.
    return false unless policy

    # Parental permission is not required until the policy is in effect.
    # Skip the date check if we want to know if the student will need parent
    # permission in the future.
    return false if !future && policy[:start_date] > DateTime.now

    # Parental permission is not required for students
    # whose age cannot be identified or who are older than the maximum age covered by the policy.
    return false unless underage?(user)

    personal_account?(user)
  end

  def self.conditionally_school_managed?(user)
    user.sections_as_student.exists? || user.roster_synced
  end
end
