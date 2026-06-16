module Account
  # A named allowlist, deliberately narrower than the legacy account-edit
  # payload. NEVER serialize: oauth/refresh tokens, authentication_id,
  # auth-option ids, hashed_email, encrypted_password, secret words/pictures,
  # failed_attempts, locked_at, IPs, or admin flags. Field visibility (student
  # email masking, edit-affordance gating) is computed server-side, not the client.
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
        # User#email is '' for students with no stored cleartext address;
        # .presence turns that masking into an absent field.
        email: user.email.presence,
        has_password: user.encrypted_password.present?,
        can_edit_email: user.can_edit_email?,
        can_edit_password: user.can_edit_password?,
        # Entitlement to add a first password (SSO-only accounts); false for
        # oauth-only students, sponsored, and LTI-restricted users.
        should_see_add_password_form: user.should_see_add_password_form?,
        should_see_edit_email_link: user.should_see_edit_email_link?,
        authentication_options: serialized_authentication_options,
        can_change_user_type: user.can_change_own_user_type?,
        can_delete_own_account: user.can_delete_own_account?,
        age: user.age,
        us_state: user.us_state,
        # Student-only "For Parents and Guardians" value; absent when unset.
        parent_email: user.parent_email.presence,
        dependent_students_count: dependent_students_count,
      }
    end

    private attr_reader :user

    # Provider type and email only — never the per-option id or hashed_email.
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
