# frozen_string_literal: true

require 'cdo/mailjet'

# This class is an ActiveJob wrapper for scheduling MailJet email sending.
class MailjetDeliveryJob < ApplicationJob
  ATTEMPTS_ON_RATE_LIMIT = 5

  queue_as CDO.active_job_queues[:mailjet]

  rescue_from StandardError, with: :report_exception

  # Retry on any reported rate limit (429 status). With 3 attempts, 'exponentially_longer' waits 3s, then 18s.
  retry_on RestClient::TooManyRequests, wait: :exponentially_longer, attempts: ATTEMPTS_ON_RATE_LIMIT do |job, error|
    job.report_exception(error)
    raise error
  end

  # @see MailJet.send_email
  def perform(...)
    MailJet.send_email(...)
  end
end
