class Policies::ChildAccount
  # Values for the `child_account_compliance_state` attribute
  module ComplianceState
    # The student's account has been used to issue a request to a parent.
    LOCKED_OUT = 'l'.freeze

    # The student's account has been used to issue a request to a parent.
    REQUEST_SENT = 's'.freeze

    # The student's account has been approved by their parent.
    PERMISSION_GRANTED = 'g'.freeze
  end

  # The individual US State child account policy configuration
  # max_age: the oldest age of the child at which this policy applies.
  STATE_POLICY = {
    'CO' => {
      max_age: 12
    }
  }.freeze

  # Is this user compliant with our Child Account Policy(cap)?
  # For students under-13, in Colorado, with a personal email login: we require
  # parent permission before the student can start using their account.
  def self.compliant?(user)
    return true unless parent_permission_required?(user)
    user.child_account_compliance_state == ComplianceState::PERMISSION_GRANTED
  end

  # Check if parent permission is required for this account according to our
  # Child Account Policy.
  private_class_method def self.parent_permission_required?(user)
    return false unless user.us_state
    policy = STATE_POLICY[user.us_state]
    return false unless policy
    return false unless user.age.to_i <= policy[:max_age].to_i
    personal_account?(user)
  end

  # Authentication option types which we consider to be "owned" by the school
  # the student attends because the school has admin control of the account.
  SCHOOL_OWNED_TYPES = [AuthenticationOption::CLEVER].freeze

  # Does the user login using credentials they personally control?
  # For example, some accounts are created and owned by schools (Clever).
  private_class_method def self.personal_account?(user)
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
