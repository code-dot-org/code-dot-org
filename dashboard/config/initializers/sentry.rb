require 'cdo/user_log_token'

if Observability::Sentry.enabled?
  Warden::Manager.after_fetch(scope: :user) do |user, _auth, _opts|
    # Never pass user.id here -- Sentry gets the log token only.
    Observability::Sentry.set_user_token(
      Cdo::UserLogToken.derive(user.id, destination: Cdo::UserLogToken::SENTRY)
    )
  end
end
