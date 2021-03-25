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
