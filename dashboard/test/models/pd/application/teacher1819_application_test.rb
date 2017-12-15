require 'test_helper'
require 'cdo/shared_constants/pd/teacher1819_application_constants'

module Pd::Application
  class Teacher1819ApplicationTest < ActiveSupport::TestCase
    include Teacher1819ApplicationConstants
    include ApplicationConstants

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

    test 'autoscore does not override existing scores' do
      application_hash = build :pd_teacher1819_application_hash
      application_hash.merge!(
        {
          committed: YES,
          able_to_attend_single: YES,
          csp_which_grades: ['12'],
          csp_course_hours_per_year: Pd::Application::ApplicationBase::COMMON_OPTIONS[:course_hours_per_year].first,
          previous_yearlong_cdo_pd: ['CS Discoveries'],
          csp_ap_exam: Pd::Application::Teacher1819Application.options[:csp_ap_exam].first,
          taught_in_past: ['Hour of Code']
        }
      )

      application = create(:pd_teacher1819_application, course: 'csp', form_data: application_hash.to_json, regional_partner: (create :regional_partner))
      application.auto_score!

      assert_equal(
        {
          regional_partner_name: YES,
          committed: YES,
          able_to_attend_single: YES,
          csp_which_grades: YES,
          csp_course_hours_per_year: YES,
          previous_yearlong_cdo_pd: YES,
          csp_ap_exam: YES,
          taught_in_past: 2
        }, application.response_scores_hash
      )

      application.update_form_data_hash(
        {
          principal_approval: YES,
          schedule_confirmed: YES,
          diversity_recruitment: YES,
          free_lunch_percent: '50.1%',
          underrepresented_minority_percent: '50.1%',
          wont_replace_existing_course: Pd::Application::PrincipalApproval1819Application.options[:replace_course].second,
        }
      )

      application.update(response_scores: application.response_scores_hash.merge({regional_partner_name: NO}).to_json)

      application.auto_score!
      application.reload
      assert_equal(
        {
          regional_partner_name: NO,
          committed: YES,
          able_to_attend_single: YES,
          principal_approval: YES,
          schedule_confirmed: YES,
          diversity_recruitment: YES,
          free_lunch_percent: 5,
          underrepresented_minority_percent: 5,
          wont_replace_existing_course: 5,
          csp_which_grades: YES,
          csp_course_hours_per_year: YES,
          previous_yearlong_cdo_pd: YES,
          csp_ap_exam: YES,
          taught_in_past: 2
        }, application.response_scores_hash
      )
    end

    test 'autoscore for a CSP application where they should get YES/Points for everything' do
      application_hash = build :pd_teacher1819_application_hash
      application_hash.merge!(
        {
          committed: YES,
          able_to_attend_single: YES,
          principal_approval: YES,
          schedule_confirmed: YES,
          diversity_recruitment: YES,
          free_lunch_percent: '50.1%',
          underrepresented_minority_percent: '50.1%',
          wont_replace_existing_course: Pd::Application::PrincipalApproval1819Application.options[:replace_course].second,
          csp_which_grades: ['12'],
          csp_course_hours_per_year: Pd::Application::ApplicationBase::COMMON_OPTIONS[:course_hours_per_year].first,
          previous_yearlong_cdo_pd: ['CS Discoveries'],
          csp_ap_exam: Pd::Application::Teacher1819Application.options[:csp_ap_exam].first,
          taught_in_past: ['Hour of Code']
        }
      )

      application = create :pd_teacher1819_application, course: 'csp', form_data: application_hash.to_json
      application.update(regional_partner: (create :regional_partner))
      application.auto_score!

      assert_equal(
        {
          regional_partner_name: YES,
          committed: YES,
          able_to_attend_single: YES,
          principal_approval: YES,
          schedule_confirmed: YES,
          diversity_recruitment: YES,
          free_lunch_percent: 5,
          underrepresented_minority_percent: 5,
          wont_replace_existing_course: 5,
          csp_which_grades: YES,
          csp_course_hours_per_year: YES,
          previous_yearlong_cdo_pd: YES,
          csp_ap_exam: YES,
          taught_in_past: 2
        }, application.response_scores_hash
      )
    end

    test 'autoscore for a CSP application where they should get NO/No points for everything' do
      application_hash = build :pd_teacher1819_application_hash
      application_hash.merge!(
        {
          committed: Pd::Application::Teacher1819Application.options[:committed].last,
          able_to_attend_single: NO,
          principal_approval: YES,
          schedule_confirmed: NO,
          diversity_recruitment: NO,
          free_lunch_percent: '49.9%',
          underrepresented_minority_percent: '49.9%',
          wont_replace_existing_course: YES,
          csp_which_grades: ['12'],
          csp_course_hours_per_year: Pd::Application::ApplicationBase::COMMON_OPTIONS[:course_hours_per_year].last,
          previous_yearlong_cdo_pd: ['CS Principles'],
          csp_ap_exam: Pd::Application::Teacher1819Application.options[:csp_ap_exam].last,
          taught_in_past: ['AP CS A']
        }
      )

      application = create :pd_teacher1819_application, course: 'csp', form_data: application_hash.to_json, regional_partner: nil
      application.auto_score!

      assert_equal(
        {
          regional_partner_name: NO,
          committed: NO,
          able_to_attend_single: NO,
          principal_approval: YES, # Keep this as yes to test additional fields
          schedule_confirmed: NO,
          diversity_recruitment: NO,
          free_lunch_percent: 0,
          underrepresented_minority_percent: 0,
          wont_replace_existing_course: nil,
          csp_which_grades: YES, # Not possible to select responses for which this would be No
          csp_course_hours_per_year: NO,
          previous_yearlong_cdo_pd: NO,
          csp_ap_exam: NO,
          taught_in_past: 0
        }, application.response_scores_hash
      )
    end

    test 'autoscore for a CSD application where they should get YES/Points for everything' do
      application_hash = build :pd_teacher1819_application_hash, program: Pd::Application::Teacher1819Application::PROGRAM_OPTIONS.first
      application_hash.merge!(
        {
          committed: YES,
          able_to_attend_single: YES,
          principal_approval: YES,
          schedule_confirmed: YES,
          diversity_recruitment: YES,
          free_lunch_percent: '50.1%',
          underrepresented_minority_percent: '50.1%',
          wont_replace_existing_course: Pd::Application::PrincipalApproval1819Application.options[:replace_course].second,
          csd_which_grades: ['10', '11'],
          csd_course_hours_per_year: Pd::Application::ApplicationBase::COMMON_OPTIONS[:course_hours_per_year].first,
          previous_yearlong_cdo_pd: ['CS in Science'],
          taught_in_past: Pd::Application::Teacher1819Application.options[:taught_in_past].last
        }
      )

      application = create :pd_teacher1819_application, course: 'csd', form_data: application_hash.to_json
      application.update(regional_partner: (create :regional_partner))
      application.auto_score!

      assert_equal(
        {
          regional_partner_name: YES,
          committed: YES,
          able_to_attend_single: YES,
          principal_approval: YES,
          schedule_confirmed: YES,
          diversity_recruitment: YES,
          free_lunch_percent: 5,
          underrepresented_minority_percent: 5,
          wont_replace_existing_course: 5,
          csd_which_grades: YES,
          csd_course_hours_per_year: YES,
          previous_yearlong_cdo_pd: YES,
          taught_in_past: 2
        }, application.response_scores_hash
      )
    end

    test 'autoscore for a CSD application where they should get NO/No points for everything' do
      application_hash = build :pd_teacher1819_application_hash, program: Pd::Application::Teacher1819Application::PROGRAM_OPTIONS.first
      application_hash.merge!(
        {
          committed: Pd::Application::Teacher1819Application.options[:committed].last,
          able_to_attend_single: NO,
          principal_approval: YES,
          schedule_confirmed: NO,
          diversity_recruitment: NO,
          free_lunch_percent: '49.9%',
          underrepresented_minority_percent: '49.9%',
          wont_replace_existing_course: YES,
          csd_which_grades: ['12'],
          csd_course_hours_per_year: Pd::Application::ApplicationBase::COMMON_OPTIONS[:course_hours_per_year].last,
          previous_yearlong_cdo_pd: ['Exploring Computer Science'],
          taught_in_past: ['Exploring Computer Science']
        }
      )

      application = create :pd_teacher1819_application, course: 'csd', form_data: application_hash.to_json, regional_partner: nil
      application.auto_score!

      assert_equal(
        {
          regional_partner_name: NO,
          committed: NO,
          able_to_attend_single: NO,
          principal_approval: YES, # Keep this as yes to test additional fields
          schedule_confirmed: NO,
          diversity_recruitment: NO,
          free_lunch_percent: 0,
          underrepresented_minority_percent: 0,
          wont_replace_existing_course: nil,
          csd_which_grades: NO,
          csd_course_hours_per_year: NO,
          previous_yearlong_cdo_pd: NO,
          taught_in_past: 0
        }, application.response_scores_hash
      )
    end

    test 'send_decision_notification_email only sends to G3 and unmatched' do
      application = create :pd_teacher1819_application
      application.update(status: 'waitlisted')

      mock_mail = stub
      mock_mail.stubs(:deliver_now).returns(nil)

      Pd::Application::Teacher1819ApplicationMailer.expects(:waitlisted).times(1).returns(mock_mail)
      application.send_decision_notification_email

      partner = create :regional_partner
      application.update(regional_partner: partner)

      partner.update(group: 1)
      Pd::Application::Teacher1819ApplicationMailer.expects(:waitlisted).times(0).returns(mock_mail)
      application.send_decision_notification_email

      partner.update(group: 2)
      Pd::Application::Teacher1819ApplicationMailer.expects(:waitlisted).times(0).returns(mock_mail)
      application.send_decision_notification_email

      partner.update(group: 3)
      Pd::Application::Teacher1819ApplicationMailer.expects(:waitlisted).times(1).returns(mock_mail)
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
