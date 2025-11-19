# Honeybadger configuration for data filtering

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
