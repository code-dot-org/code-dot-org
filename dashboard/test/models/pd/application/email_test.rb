require 'test_helper'

module Pd::Application
  class EmailTest < ActiveSupport::TestCase
    test 'send all queued emails raises error but continues processing emails after error' do
      # sending email for an application without an email or alternate email will raise an error
      teacher_without_email = create :teacher, :with_school_info, :demigrated
      teacher_without_email.update_attribute(:email, '')
      teacher_without_email.update_attribute(:hashed_email, '')
      application_hash_without_email = build :pd_teacher_application_hash, alternate_email: ''
      application_without_email = create :pd_teacher_application, user: teacher_without_email, form_data: application_hash_without_email.to_json

      application_with_email = create :pd_teacher_application

      create :pd_application_email, application: application_without_email
      create :pd_application_email, application: application_with_email

      assert_equal 2, Pd::Application::Email.unsent.count
      assert_raises_matching("Error sending emails for applications.") do
        Pd::Application::Email.send_all_queued_emails
      end
      assert_equal 1, Pd::Application::Email.unsent.count
    end
  end
end
