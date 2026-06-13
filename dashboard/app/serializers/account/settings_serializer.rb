module Account
  # Read model for GET /api/v1/account/settings: a NAMED ALLOWLIST, strictly
  # narrower than the legacy getScriptData('edit') payload.
  #
  # NEVER serialize: oauth/refresh tokens, authentication_id, auth-option ids,
  # hashed_email, encrypted_password, secret words/pictures, failed_attempts,
  # locked_at, IPs, or admin flags. Field-visibility (student email masking,
  # edit-affordance gating) is computed here server-side, never on the client.
  class SettingsSerializer
    def initialize(user)
      @user = user
    end

    def as_json(*)
      {
        user_type: user.user_type,
        given_name: user.given_name,
        family_name: user.family_name,
        display_name: user.name,
        username: user.username,
        # User#email returns '' for students with no stored cleartext address
        # (the natural server-side masking); `.presence` makes that absent.
        email: user.email.presence,
        has_password: user.encrypted_password.present?,
        can_edit_email: user.can_edit_email?,
        can_edit_password: user.can_edit_password?,
        # Entitlement to add a first password (SSO-only accounts). Composite,
        # server-computed gate: false for oauth-only students (they get the
        # personal-login flow instead), sponsored, and LTI-restricted users.
        should_see_add_password_form: user.should_see_add_password_form?,
        should_see_edit_email_link: user.should_see_edit_email_link?,
        authentication_options: serialized_authentication_options,
        can_change_user_type: user.can_change_own_user_type?,
        can_delete_own_account: user.can_delete_own_account?,
        age: user.age,
        us_state: user.us_state,
        dependent_students_count: dependent_students_count,
      }
    end

    private attr_reader :user

    # Provider type and associated email only — never the per-option id or
    # hashed_email. The email mirrors what the legacy page already exposed for
    # this user (blank for word/picture students who have no stored address).
    private def serialized_authentication_options
      user.authentication_options.map do |option|
        {
          credential_type: option.credential_type,
          email: option.email.presence,
        }
      end
    end

    private def dependent_students_count
      Queries::User::DependentStudentsCount.call(user_id: user.id)
    end
  end
end
