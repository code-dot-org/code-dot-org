require 'cdo/aws/metrics'

#
# Observing emails after they have been sent.
# https://guides.rubyonrails.org/action_mailer_basics.html#intercepting-and-observing-emails
#
class EmailDeliveryObserver
  def self.delivered_email(message)
    metrics = [
      {
        metric_name: :EmailSent,
        dimensions: [
          {name: "Environment", value: CDO.rack_env}
        ],
        value: 1
      }
    ]
    Cdo::Metrics.push 'ActionMailer', metrics
  end
end
