require 'email_delivery_interceptor'
require 'email_delivery_observer'

if Rails.env.production?
  ActionMailer::Base.register_interceptor EmailDeliveryInterceptor
  ActionMailer::Base.register_observer EmailDeliveryObserver
end
