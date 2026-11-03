if Rails.env.production?
  ActionMailer::Base.register_interceptor EmailDeliveryInterceptor
  ActionMailer::Base.register_observer EmailDeliveryObserver
end
