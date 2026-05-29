if Observability::Sentry.enabled?
  Warden::Manager.after_fetch(scope: :user) do |user, _auth, _opts|
    Observability::Sentry.set_user_id(user.id)
  end
end
