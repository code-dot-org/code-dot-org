require 'test_helper'

module Pd::Application
  class ApplicationBaseTest < ActiveSupport::TestCase
    include ApplicationConstants
    include Pd::Application::ActiveApplicationModels

    freeze_time

    test 'required fields' do
      application = ApplicationBase.new
      refute application.valid?
      assert_equal(
        [
          'Form data is required',
          'User is required',
          'Application type is not included in the list',
          'Application year is not included in the list',
          'Type is required'
        ],
        application.errors.full_messages
      )
    end

    test 'derived classes override type and year' do
      application = TEACHER_APPLICATION_CLASS.new
      assert_equal TEACHER_APPLICATION, application.application_type
      assert_equal APPLICATION_CURRENT_YEAR, application.application_year
    end

    test 'default status is unreviewed' do
      application = ApplicationBase.new

      assert_equal 'unreviewed', application.status
      assert application.unreviewed?
    end

    test 'can update status' do
      application = create FACILITATOR_APPLICATION_FACTORY
      assert application.unreviewed?

      application.update(status: 'pending')
      assert application.pending?

      application.reload
      assert application.pending?
    end

    test 'regional partner name' do
      partner = build :regional_partner
      application = build FACILITATOR_APPLICATION_FACTORY, regional_partner: partner

      assert_equal partner.name, application.regional_partner_name
    end

    test 'school name' do
      school_info = build :school_info
      teacher = build :teacher, school_info: school_info
      application = build FACILITATOR_APPLICATION_FACTORY, user: teacher

      assert_equal school_info.effective_school_name.titleize, application.school_name
    end

    test 'district name' do
      school_info = create :school_info
      teacher = build :teacher, school_info: school_info
      application = build FACILITATOR_APPLICATION_FACTORY, user: teacher

      assert_equal school_info.effective_school_district_name.titleize, application.district_name
    end

    test 'total score' do
      application = ApplicationBase.new

      # initially nil
      assert_nil application.total_score

      # non-numeric only, still nil
      # Also handles nil values
      application.response_scores = {
        q1: 'Yes',
        q2: nil,
      }.to_json
      assert_nil application.total_score

      # Numeric with 0
      application.response_scores = {
        q1: 'Yes',
        q2: nil,
        q3: '0',
        q4: 0
      }.to_json
      assert_equal 0, application.total_score

      # Numeric non-zero
      application.response_scores = {
        q1: 'Yes',
        q2: nil,
        q3: '1',
        q4: 2,
        q5: '0',
      }.to_json
      assert_equal 3, application.total_score
    end

    test 'answer_with_additional_text for a string answer' do
      answer_hash = {
        string_question: 'Other:',
        string_question_other: 'my explanation'
      }

      full_answer = ApplicationBase.answer_with_additional_text answer_hash, :string_question
      assert_equal 'Other: my explanation', full_answer
    end

    test 'answer_with_additional_text for a string answer and custom other text' do
      answer_hash = {
        string_question: 'A custom answer:',
        string_question_explanation: 'my custom explanation'
      }

      full_answer = ApplicationBase.answer_with_additional_text answer_hash,
        :string_question, 'A custom answer:', :string_question_explanation
      assert_equal 'A custom answer: my custom explanation', full_answer
    end

    test 'answer_with_additional_text for an array answer' do
      answer_hash = {
        array_question: [
          'An answer',
          'Other:'
        ],
        array_question_other: 'my explanation'
      }

      full_answer = ApplicationBase.answer_with_additional_text answer_hash, :array_question
      assert_equal(
        [
          'An answer',
          'Other: my explanation',
        ],
        full_answer
      )
    end

    test 'answer_with_additional_text for an array answer and custom other text' do
      answer_hash = {
        array_question: [
          'A supplied answer',
          'A custom answer:'
        ],
        array_question_other: 'my custom explanation'
      }

      full_answer = ApplicationBase.answer_with_additional_text answer_hash,
        :array_question, 'A custom answer:', :array_question_other
      assert_equal(
        [
          'A supplied answer',
          'A custom answer: my custom explanation',
        ],
        full_answer
      )
    end

    test 'full answers' do
      application = ApplicationBase.new
      application.stubs(additional_text_fields:
        [
          [:string_question_with_extra],
          [:array_question_with_extra]
        ]
      )
      form_data = {
        regular_string_question: 'regular string answer',
        regular_array_question: ['regular array answer'],
        string_question_with_extra: 'Other:',
        string_question_with_extra_other: 'my other string answer',
        array_question_with_extra: ['Other:'],
        array_question_with_extra_other: 'my other array answer',
        filtered_question: 'to be removed'
      }

      application.stubs(sanitize_form_data_hash: form_data)
      ApplicationBase.stubs(filtered_labels: form_data.except(:filtered_question))

      expected_full_answers = {
        regular_string_question: 'regular string answer',
        regular_array_question: ['regular array answer'],
        string_question_with_extra: 'Other: my other string answer',
        array_question_with_extra: ['Other: my other array answer'],
      }

      assert_equal expected_full_answers, application.full_answers
    end

    test 'date_accepted formats the accepted date as iso8601' do
      application = ApplicationBase.new
      assert_nil application.date_accepted

      # March 9, 2018 10:15am
      application.accepted_at = DateTime.new(2018, 3, 9, 10, 15)
      assert_equal '2018-03-09', application.date_accepted
    end

    test 'memoized full_answers' do
      application = ApplicationBase.new
      application.stubs(additional_text_fields:
        [
          [:string_question_with_extra]
        ]
      )
      form_data = {
        regular_string_question: 'regular string answer',
        string_question_with_extra: 'Other:',
        string_question_with_extra_other: 'my other string answer',
      }
      application.stubs(sanitize_form_data_hash: form_data)
      ApplicationBase.stubs(filtered_labels: form_data)

      expected_full_answers = {
        regular_string_question: 'regular string answer',
        string_question_with_extra: 'Other: my other string answer',
      }

      assert_nil application.instance_variable_get(:@full_answers)
      assert_equal expected_full_answers, application.full_answers
      assert_equal expected_full_answers, application.instance_variable_get(:@full_answers)

      application.form_data = nil
      assert_nil application.instance_variable_get(:@full_answers)
    end

    test 'queue_email creates an associated unsent Email record' do
      application = create TEACHER_APPLICATION_FACTORY

      application.expects(:deliver_email).never
      assert_creates Email do
        application.queue_email :test_email
      end
      email = Email.last
      assert_equal application, email.application
      assert_equal 'test_email', email.email_type
      assert_equal application.status, email.application_status
      assert_nil email.sent_at
    end

    test 'queue_email with deliver_now sends email and creates an associated sent Email record' do
      application = create TEACHER_APPLICATION_FACTORY

      application.expects(:deliver_email)
      assert_creates Email do
        application.queue_email :test_email, deliver_now: true
      end
      email = Email.last
      assert_equal application, email.application
      assert_equal 'test_email', email.email_type
      assert_equal application.status, email.application_status
      assert_not_nil email.sent_at
    end

    test 'record status change with user' do
      application = create TEACHER_APPLICATION_FACTORY
      workshop_admin = create :workshop_admin

      application.update(status: 'pending')
      application.update_status_timestamp_change_log(workshop_admin)
      expected_entry = {
        title: 'pending',
        changing_user_id: workshop_admin.id,
        changing_user_name: workshop_admin.name,
        time: Time.now
      }

      assert_equal(
        [expected_entry],
        (application.sanitize_status_timestamp_change_log)
      )

      application.update(status: 'approved')
      application.update_status_timestamp_change_log(workshop_admin)
      assert_equal(
        [
          expected_entry,
          expected_entry.dup.update({title: 'approved'})
        ], application.sanitize_status_timestamp_change_log
      )
    end

    test 'record status change without user' do
      application = create TEACHER_APPLICATION_FACTORY

      application.update(status: 'accepted')
      application.update_status_timestamp_change_log(nil)
      assert_equal(
        [{
          title: 'accepted',
          changing_user_id: nil,
          changing_user_name: nil,
          time: Time.now
        }],
        application.sanitize_status_timestamp_change_log
      )
    end

    test 'formatted_partner_contact_email' do
      application = create :pd_facilitator1920_application

      partner = create :regional_partner

      # no partner
      assert_nil application.formatted_partner_contact_email

      # partner w no contact info
      application.regional_partner = partner
      assert_nil application.formatted_partner_contact_email

      # name only? still nil
      partner.contact_name = 'We Teach Code'
      assert_nil application.formatted_partner_contact_email

      # email only? still nil
      partner.contact_name = nil
      assert_nil application.formatted_partner_contact_email

      # program manager but no contact_name or contact_email
      program_manager = (create :regional_partner_program_manager, regional_partner: partner).program_manager
      assert_equal "\"#{program_manager.name}\" <#{program_manager.email}>", application.formatted_partner_contact_email

      # name and email
      partner.contact_name = 'We Teach Code'
      partner.contact_email = 'we_teach_code@ex.net'
      assert_equal "\"We Teach Code\" <we_teach_code@ex.net>", application.formatted_partner_contact_email
    end

    test 'formatted_applicant_email uses user account email' do
      application = create :pd_teacher1920_application

      assert application.user.email.present?

      formatted_email = "\"#{application.applicant_full_name}\" <#{application.user.email}>"
      assert_equal formatted_email, application.formatted_applicant_email
    end

    test 'formatted_applicant_email uses alternate email if no user account email' do
      teacher_without_email = create :teacher, :with_school_info, :demigrated
      teacher_without_email.update_attribute(:email, '')
      teacher_without_email.update_attribute(:hashed_email, '')

      application = create :pd_teacher1920_application, user: teacher_without_email

      assert teacher_without_email.email.blank?

      formatted_alternate_email = "\"#{application.applicant_full_name}\" <#{application.sanitize_form_data_hash[:alternate_email]}>"
      assert_equal formatted_alternate_email, application.formatted_applicant_email
    end

    test 'formatted_applicant_email raises error if no user email or alternate email' do
      teacher_without_email = create :teacher, :with_school_info, :demigrated
      teacher_without_email.update_attribute(:email, '')
      teacher_without_email.update_attribute(:hashed_email, '')
      application_hash_without_email = build :pd_teacher1920_application_hash, alternate_email: ''
      application_without_email = create :pd_teacher1920_application, user: teacher_without_email, form_data: application_hash_without_email.to_json

      assert teacher_without_email.email.blank?
      assert application_without_email.sanitize_form_data_hash[:alternate_email].blank?
      assert_raises_matching("invalid email address for application #{application_without_email.id}") do
        application_without_email.formatted_applicant_email
      end
    end

    test 'deleting an application also deletes its unsent emails' do
      # Create two applications, each with sent and unsent email
      application_a = create TEACHER_APPLICATION_FACTORY
      application_b = create TEACHER_APPLICATION_FACTORY
      [application_a, application_b].each do |application|
        application.stubs(:deliver_email)
        application.queue_email :test_email
        application.queue_email :test_email, deliver_now: true
        assert_equal 2, application.emails.count
        assert_equal 1, application.emails.unsent.count
      end

      # Destroy one of the applications
      application_a.destroy

      # Unsent email for that application was destroyed
      assert_equal 0, application_a.emails.unsent.count
      # Sent email for that application was not destroyed
      assert_equal 1, application_a.emails.count
      # Email for the other application was not destroyed
      assert_equal 2, application_b.emails.count
    ensure
      application_a.emails.destroy_all
      application_b.emails.destroy_all
    end
  end
end
