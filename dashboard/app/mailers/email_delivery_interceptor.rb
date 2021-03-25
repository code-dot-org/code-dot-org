require 'cdo/aws/metrics'

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
