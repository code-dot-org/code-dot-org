class MailDeliveryJob < ActionMailer::MailDeliveryJob
  include ActiveJobMetrics
end
