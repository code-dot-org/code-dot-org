require 'test_helper'

module Pd::Application
  class ApplicationBaseTest < ActiveSupport::TestCase
    include ApplicationConstants

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
      application = Teacher1819Application.new
      assert_equal TEACHER_APPLICATION, application.application_type
      assert_equal YEAR_18_19, application.application_year
    end

    test 'default status is unreviewed' do
      application = ApplicationBase.new

      assert_equal 'unreviewed', application.status
      assert application.unreviewed?
    end

    test 'can update status' do
      application = create :pd_facilitator1819_application
      assert application.unreviewed?

      application.update(status: 'pending')
      assert application.pending?

      application.reload
      assert application.pending?
    end

    test 'regional partner name' do
      partner = build :regional_partner
      application = build :pd_facilitator1819_application, regional_partner: partner

      assert_equal partner.name, application.regional_partner_name
    end

    test 'school name' do
      school_info = build :school_info
      teacher = build :teacher, school_info: school_info
      application = build :pd_facilitator1819_application, user: teacher

      assert_equal school_info.effective_school_name.titleize, application.school_name
    end

    test 'district name' do
      school_info = create :school_info
      teacher = build :teacher, school_info: school_info
      application = build :pd_facilitator1819_application, user: teacher

      assert_equal school_info.effective_school_district_name.titleize, application.district_name
    end

    test 'send_all_decision_notification_emails only sends once per application' do
      application = create :pd_facilitator1819_application
      application.update(status: 'declined')
      application.lock!

      mock_mail = stub
      mock_mail.stubs(:deliver_now).returns(nil)
      Pd::Application::Facilitator1819ApplicationMailer.expects(:declined).times(1).returns(mock_mail)

      Pd::Application::ApplicationBase.send_all_decision_notification_emails
      Pd::Application::ApplicationBase.send_all_decision_notification_emails
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
  end
end
