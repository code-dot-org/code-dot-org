
# This class is used to enqueue the delivery of emails through ActiveJob.
#
# To enqueue an email delivery, use the `deliver_later` method on any mailer object.
# This method allows scheduling options such as setting a wait time before sending.
#
# @example Enqueue an email to be sent one hour later
#   Notifier.welcome(User.first).deliver_later(wait: 1.hour)
# @see https://apidock.com/rails/v6.1.7.7/ActionMailer/MessageDelivery/deliver_later
class MailDeliveryJob < ActionMailer::MailDeliveryJob
  include ActiveJobMetrics

  rescue_from StandardError, with: :report_exception

  private def report_exception(exception)
    Harness.error_notify(
      exception,
      error_message: '[MailDeliveryJob] Runtime error',
      context: {
        job: as_json,
      }
    )
  ensure
    raise exception
  end
end
