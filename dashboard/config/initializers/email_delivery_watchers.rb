Rails.application.configure do
  if Rails.env.production?
    config.action_mailer.interceptors = %w[EmailDeliveryInterceptor]
    config.action_mailer.observers = %w[EmailDeliveryObserver]
  end
end
