require 'cdo/aws/metrics'

#
# Intercepting emails before they are handed off to the delivery agents.
# https://guides.rubyonrails.org/action_mailer_basics.html#intercepting-and-observing-emails
#
class EmailDeliveryInterceptor
  def self.delivering_email(message)
    metrics = [
      {
        metric_name: :EmailToSend,
        dimensions: [
          {name: "Environment", value: CDO.rack_env}
        ],
        value: 1
      }
    ]
    Cdo::Metrics.push 'ActionMailer', metrics
  end
end
