# This class is used to handle the delivery of enqueued emails through Active Job.
#
# To enqueue an email delivery, use the `deliver_later` method on any mailer object.
# This method allows scheduling options such as setting a wait time before sending.
#
# @example Enqueue an email to be sent one hour later
#   Notifier.welcome(User.first).deliver_later(wait: 1.hour)
# @see https://apidock.com/rails/v6.1.7.7/ActionMailer/MessageDelivery/deliver_later
class MailDeliveryJob < ActionMailer::MailDeliveryJob
  include ActiveJobMetrics
end
