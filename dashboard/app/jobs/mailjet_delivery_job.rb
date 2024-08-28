# frozen_string_literal: true

require 'cdo/mailjet'

# This class is an ActiveJob wrapper for scheduling MailJet email sending.
class MailjetDeliveryJob < ApplicationJob
  queue_as CDO.active_job_queues[:mailjet]

  rescue_from StandardError, with: :report_exception

  # @see MailJet.send_email
  def perform(...)
    MailJet.send_email(...)
  end
end
