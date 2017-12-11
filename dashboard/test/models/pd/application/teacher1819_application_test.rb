require 'test_helper'
require 'cdo/shared_constants/pd/teacher1819_application_constants'

module Pd::Application
  class Teacher1819ApplicationTest < ActiveSupport::TestCase
    include Teacher1819ApplicationConstants

    test 'application guid is generated on create' do
      teacher_application = build :pd_teacher1819_application
      assert_nil teacher_application.application_guid

      teacher_application.save!
      assert_not_nil teacher_application.application_guid
    end

    test 'existing guid is preserved' do
      guid = SecureRandom.uuid
      teacher_application = create :pd_teacher1819_application, application_guid: guid
      assert_equal guid, teacher_application.application_guid

      # save again
      teacher_application.save!
      assert_equal guid, teacher_application.application_guid
    end

    test 'principal_greeting' do
      hash_with_principal_title = build :pd_teacher1819_application_hash
      hash_without_principal_title = build :pd_teacher1819_application_hash, principal_title: nil

      application_with_principal_title = build :pd_teacher1819_application, form_data_hash: hash_with_principal_title
      application_without_principal_title = build :pd_teacher1819_application, form_data_hash: hash_without_principal_title

      assert_equal 'Dr. Dumbledore', application_with_principal_title.principal_greeting
      assert_equal 'Albus Dumbledore', application_without_principal_title.principal_greeting
    end

    test 'meets criteria says an application meets critera when all YES_NO fields are marked yes' do
      teacher_application = build :pd_teacher1819_application, course: 'csp',
        response_scores: Teacher1819ApplicationConstants::CRITERIA_SCORE_QUESTIONS_CSP.map {|x| [x, 'Yes']}.to_h.to_json
      assert_equal 'Yes', teacher_application.meets_criteria

      teacher_application = build :pd_teacher1819_application, course: 'csd',
        response_scores: Teacher1819ApplicationConstants::CRITERIA_SCORE_QUESTIONS_CSD.map {|x| [x, 'Yes']}.to_h.to_json
      assert_equal 'Yes', teacher_application.meets_criteria
    end

    test 'meets criteria says an application does not meet criteria when any YES_NO fields are marked NO' do
      teacher_application = build :pd_teacher1819_application, response_scores: {
        committed: 'No'
      }.to_json
      assert_equal 'No', teacher_application.meets_criteria
    end

    test 'meets criteria returns incomplete when an application does not have YES on all YES_NO fields but has no NOs' do
      teacher_application = build :pd_teacher1819_application, response_scores: {
        committed: 'Yes'
      }.to_json
      assert_equal 'Incomplete', teacher_application.meets_criteria
    end

    test 'total score calculates the sum of all response scores' do
      teacher_application = build :pd_teacher1819_application, response_scores: {
        free_lunch_percent: '5',
        underrepresented_minority_percent: '5',
        able_to_attend_single: 'Yes',
        csp_which_grades: nil
      }.to_json

      assert_equal 10, teacher_application.total_score
    end

    test 'send_decision_notification_email only sends to G3 and unmatched' do
      application = create :pd_teacher1819_application
      application.update(status: 'waitlisted')

      mock_mail = stub
      mock_mail.stubs(:deliver_now).returns(nil)

      Pd::Application::Teacher1819ApplicationMailer.expects(:waitlisted).times(2).returns(mock_mail)
      application.send_decision_notification_email

      partner = create :regional_partner
      application.update(regional_partner: partner)

      partner.update(group: 1)
      application.send_decision_notification_email

      partner.update(group: 2)
      application.send_decision_notification_email

      partner.update(group: 3)
      application.send_decision_notification_email
    end

    test 'send_decision_notification_email only sends to finalized' do
      mock_mail = stub
      mock_mail.stubs(:deliver_now).returns(nil)

      Pd::Application::Teacher1819ApplicationMailer.expects(:pending).times(0)
      Pd::Application::Teacher1819ApplicationMailer.expects(:unreviewed).times(0)
      Pd::Application::Teacher1819ApplicationMailer.expects(:withdrawn).times(0)

      Pd::Application::Teacher1819ApplicationMailer.expects(:accepted).times(0).returns(mock_mail)
      Pd::Application::Teacher1819ApplicationMailer.expects(:declined).times(1).returns(mock_mail)
      Pd::Application::Teacher1819ApplicationMailer.expects(:waitlisted).times(1).returns(mock_mail)

      application = create :pd_teacher1819_application
      Pd::Application::Teacher1819Application.statuses.values.each do |status|
        application.update(status: status)
        application.send_decision_notification_email
      end
    end
  end
end
