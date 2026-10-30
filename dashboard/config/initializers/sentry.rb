if Observability::Sentry.enabled?
  Warden::Manager.after_fetch(scope: :user) do |user, _auth, _opts|
    Observability::Sentry.set_user_token(user.log_token(destination: User::LogToken::SENTRY))
  end
end
