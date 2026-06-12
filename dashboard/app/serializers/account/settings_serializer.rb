module Account
  # Read model for GET /api/v1/account/settings.
  #
  # A NAMED ALLOWLIST, strictly narrower than the legacy /users/edit
  # getScriptData('edit') payload. The legacy payload over-exposes: it ships
  # the whole User#properties hash (oauth_token/oauth_refresh_token),
  # AuthenticationOption#summarize (per-option id and hashed_email), and the
  # top-level hashed_email. None of that is reproduced here.
  #
  # NEVER serialize: oauth tokens or refresh tokens, authentication_id,
  # auth-option ids, hashed_email (top-level or per option), encrypted_password,
  # secret words or pictures, failed_attempts/locked_at, IP addresses, or admin
  # flags. Field-visibility policy (student email masking, edit-affordance
  # gating) is computed here, server-side — never left to the client.
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
