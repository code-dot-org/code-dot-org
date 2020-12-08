# == Schema Information
#
# Table name: pd_application_emails
#
#  id                 :integer          not null, primary key
#  pd_application_id  :integer          not null
#  application_status :string(255)      not null
#  email_type         :string(255)      not null
#  to                 :string(255)      not null
#  created_at         :datetime         not null
#  sent_at            :datetime
#
# Indexes
#
#  index_pd_application_emails_on_pd_application_id  (pd_application_id)
#

module Pd::Application
  class Email < ApplicationRecord
    self.table_name = 'pd_application_emails'

    belongs_to :application, class_name: 'Pd::Application::ApplicationBase', foreign_key: 'pd_application_id'
    scope :unsent, -> {where(sent_at: nil)}

    def send!
      application.deliver_email self
      application.log_sent_email self

      mark_sent!
    end

    def mark_sent!
      update!(sent_at: Time.zone.now)
    end

    def self.send_all_queued_emails
      errors = {}
      unsent.find_each do |email|
        email.send!
      rescue => e
        errors[email.id] = "#{e.message}, #{e.backtrace.first}"
      end

      if errors.any?
        msg = "Error sending emails for applications. Errors:\n"
        errors.each do |application_id, error|
          msg << "    Application #{application_id}: #{error}\n"
        end
        raise msg
      end
    end
  end
end
