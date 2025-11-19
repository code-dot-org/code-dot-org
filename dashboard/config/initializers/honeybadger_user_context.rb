# Honeybadger configuration for user tracking and data filtering

# Remove all Warden session data from error reports before sending to Honeybadger
# This prevents any sensitive authentication data from being logged
Honeybadger.configure do |config|
  config.before_notify do |notice|
    if notice.request && notice.request[:session]
      notice.request[:session].delete_if do |key, _value|
        key.to_s.start_with?('warden.')
      end
    end
  end
end

# Set user context for tracking unique affected users
# This allows Honeybadger to count affected users without exposing sensitive data
Warden::Manager.after_set_user do |user, _auth, _opts|
  if user.respond_to?(:id)
    Honeybadger.context(user_id: user.id)
  end
end
