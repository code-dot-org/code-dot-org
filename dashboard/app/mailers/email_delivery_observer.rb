
#
# Observing emails after they have been sent.
# https://guides.rubyonrails.org/action_mailer_basics.html#intercepting-and-observing-emails
#
class EmailDeliveryObserver
  def self.delivered_email(message)
    action = ActionMailerMetrics.get_message_action(message)
    mailer_class = ActionMailerMetrics.get_message_class(message)
    metrics = [
      {
        metric_name: :EmailSent,
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
