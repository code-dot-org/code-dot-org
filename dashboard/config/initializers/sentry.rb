if Observability::Sentry.enabled?
  Warden::Manager.after_fetch(scope: :user) do |user, _auth, _opts|
    # Never pass user.id here -- Sentry gets the log token only.
    Observability::Sentry.set_user_token(user.log_token(destination: User::LogToken::SENTRY))
  end
end
