require 'cdo/aws/metrics'

#
# Intercepting emails before they are handed off to the delivery agents.
# https://guides.rubyonrails.org/action_mailer_basics.html#intercepting-and-observing-emails
#
class EmailDeliveryInterceptor
  def self.delivering_email(message)
    action = ActionMailerMetrics.get_message_action(message) || 'unknown_action'
    mailer_class = ActionMailerMetrics.get_message_class(message) || 'unknown_class'
    metrics = [
      {
        metric_name: :EmailToSend,
        dimensions: [
          {name: "Environment", value: CDO.rack_env},
          {name: "Action", value: action},
          {name: "Class", value: mailer_class},
        ],
        value: 1
      }
    ]
    Cdo::Metrics.push 'ActionMailer', metrics
  end
end
