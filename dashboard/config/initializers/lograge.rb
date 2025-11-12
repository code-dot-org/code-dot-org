Rails.application.configure do
  config.lograge.custom_options = lambda do |event|
    # Each event.payload includes controller data
    {
      user_id: event.payload[:user_id],
      admin_id: event.payload[:admin_id]
    }.compact
  end
end
