require_relative '../../../../shared/test/spy_newrelic_agent'
require 'test_helper'

module Pd
  class WorkshopDailySurveyControllerTest < ActionDispatch::IntegrationTest
    include WorkshopConstants
    include WorkshopSurveyConstants

    # Array of ids for days 0 (pre) and 1 - 5
    FAKE_FACILITATOR_FORM_ID = 123459
    FAKE_SUBMISSION_ID = 987654
    FAKE_CSF_201_FORM_IDS = [201903, 201904].freeze
    FAKE_JOTFORM_FORMS = {
      csf: {
        pre201: FAKE_CSF_201_FORM_IDS[0],
        post201: FAKE_CSF_201_FORM_IDS[1],
        facilitator: FAKE_FACILITATOR_FORM_ID
      }
    }.deep_stringify_keys

    self.use_transactional_test_case = true
    setup do
      CDO.stubs(:jotform_forms).returns(FAKE_JOTFORM_FORMS)
    end

    test 'daily summer workshop survey returns 404 for days outside of range 0-4' do
      setup_summer_workshop
      sign_in @enrolled_summer_teacher
      create :pd_attendance, session: @summer_workshop.sessions[0], teacher: @enrolled_summer_teacher, enrollment: @summer_enrollment
      get '/pd/workshop_survey/day/-1'
      assert_response :not_found

      get '/pd/workshop_survey/day/5'
      assert_response :not_found
    end

    test 'daily summer workshop foorm survey returns 404 for days outside of range 1-4 for a 5 day workshop' do
      setup_summer_workshop
      sign_in @enrolled_summer_teacher
      get '/pd/workshop_daily_survey/day/0'
      assert_response :not_found

      create :pd_attendance, session: @summer_workshop.sessions[0], teacher: @enrolled_summer_teacher, enrollment: @summer_enrollment
      get '/pd/workshop_daily_survey/day/5'
      assert_response :not_found
    end

    test 'pre-workshop survey displays not enrolled message when not enrolled' do
      sign_in unenrolled_teacher
      get '/pd/workshop_survey/day/0'
      assert_response :success
      assert_not_enrolled
    end

    test 'pre-workshop foorm survey displays not enrolled message when not enrolled' do
      sign_in unenrolled_teacher
      get '/pd/workshop_pre_survey'
      assert_response :success
      assert_not_enrolled
    end

    test 'pre-workshop foorm survey shows thanks when a response exists' do
      setup_summer_workshop
      existing_survey = create :daily_workshop_day_0_foorm_submission,
        :answers_high,
        form_name: "surveys/pd/summer_workshop_pre_survey"
      create :day_0_workshop_foorm_submission,
        foorm_submission: existing_survey,
        pd_workshop: @summer_workshop,
        user: @enrolled_summer_teacher

      sign_in @enrolled_summer_teacher
      get '/pd/workshop_pre_survey'
      assert_thanks
    end

    test 'pre-workshop foorm survey displays foorm when enrolled' do
      setup_summer_workshop

      sign_in @enrolled_summer_teacher
      get '/pd/workshop_pre_survey'
      assert_template :new_general_foorm
      assert_response :success
    end

    test 'post-workshop foorm survey displays foorm when enrolled and attended' do
      setup_summer_workshop

      sign_in @enrolled_summer_teacher
      create :pd_attendance, session: @summer_workshop.sessions[0], teacher: @enrolled_summer_teacher, enrollment: @summer_enrollment
      get '/pd/workshop_post_survey'
      assert_template :new_general_foorm
      assert_response :success
    end

    test 'daily workshop survey displays not enrolled message when not enrolled' do
      sign_in unenrolled_teacher
      get '/pd/workshop_survey/day/1'
      assert_response :success
      assert_not_enrolled
    end

    test 'daily workshop survey displays closed message when session attendance is closed' do
      setup_summer_workshop
      Session.any_instance.expects(:open_for_attendance?).returns(false)
      create :pd_attendance, session: @summer_workshop.sessions[0], teacher: @enrolled_summer_teacher, enrollment: @summer_enrollment

      sign_in @enrolled_summer_teacher
      get '/pd/workshop_survey/day/1'
      assert_response :success
      assert_closed
    end

    test 'daily workshop survey displays no attendance message when session is open but not attended' do
      setup_summer_workshop

      sign_in @enrolled_summer_teacher
      get '/pd/workshop_survey/day/1'
      assert_response :success
      assert_no_attendance
    end

    test 'daily workshop foorm survey displays not enrolled message when not enrolled' do
      sign_in unenrolled_teacher
      get '/pd/workshop_daily_survey/day/1'
      assert_response :success
      assert_not_enrolled
    end

    test 'daily workshop foorm survey displays closed message when session attendance is closed' do
      setup_summer_workshop
      Session.any_instance.expects(:open_for_attendance?).returns(false)

      sign_in @enrolled_summer_teacher
      create :pd_attendance, session: @summer_workshop.sessions[0], teacher: @enrolled_summer_teacher, enrollment: @summer_enrollment
      get '/pd/workshop_daily_survey/day/1'
      assert_response :success
      assert_closed
    end

    test 'daily workshop foorm survey displays no attendance message when session is open but not attended' do
      setup_summer_workshop

      sign_in @enrolled_summer_teacher
      get '/pd/workshop_daily_survey/day/1'
      assert_response :success
      assert_no_attendance
    end

    test 'daily summer workshop survey with open session attendance displays foorm' do
      setup_summer_workshop
      Session.any_instance.expects(:open_for_attendance?).returns(true)
      create :pd_attendance, session: @summer_workshop.sessions[0], teacher: @enrolled_summer_teacher, enrollment: @summer_enrollment

      sign_in @enrolled_summer_teacher
      get '/pd/workshop_survey/day/1'
      assert_template :new_general_foorm
    end

    test 'enrollment code override is used when fetching the workshop for a user' do
      setup_summer_workshop
      other_summer_workshop = create :summer_workshop,
        regional_partner: @regional_partner, facilitators: @facilitators, sessions_from: Date.today + 1.month
      other_enrollment = create :pd_enrollment, :from_user, workshop: other_summer_workshop, user: @enrolled_summer_teacher
      create :pd_attendance, session: other_summer_workshop.sessions[0], teacher: @enrolled_summer_teacher, enrollment: other_enrollment

      sign_in @enrolled_summer_teacher
      get "/pd/workshop_survey/day/0?enrollmentCode=#{other_enrollment.code}"
      assert_response :success
      assert_template :new_general_foorm

      submit_params = prop('submitParams')
      assert_equal other_summer_workshop.id, submit_params['pd_workshop_id']
    end

    test 'post workshop survey without a valid enrollment code renders invalid enrollment code' do
      setup_summer_workshop
      sign_in @enrolled_summer_teacher
      get '/pd/workshop_survey/post/invalid_enrollment_code'
      assert_template :invalid_enrollment_code
    end

    test 'pre workshop survey without a valid enrollment code renders invalid enrollment code' do
      setup_summer_workshop
      sign_in @enrolled_summer_teacher
      get '/pd/workshop_survey/day/0?enrollmentCode=invalid_enrollment_code'
      assert_template :invalid_enrollment_code
    end

    test 'pre workshop survey with a valid enrollment code but wrong user renders invalid enrollment code' do
      setup_summer_workshop
      summer_enrollment2 = create :pd_enrollment, :from_user, workshop: @summer_workshop
      sign_in @enrolled_summer_teacher
      get "/pd/workshop_survey/day/0?enrollmentCode=#{summer_enrollment2.code}"
      assert_template :invalid_enrollment_code
    end

    test 'foorm pre workshop survey without a valid enrollment code renders invalid enrollment code' do
      setup_summer_workshop
      sign_in @enrolled_summer_teacher
      get '/pd/workshop_pre_survey?enrollmentCode=invalid_enrollment_code'
      assert_template :invalid_enrollment_code
    end

    test 'foorm post workshop survey with a valid enrollment code but wrong user renders invalid enrollment code' do
      setup_summer_workshop
      summer_enrollment2 = create :pd_enrollment, :from_user, workshop: @summer_workshop
      sign_in @enrolled_summer_teacher
      get "/pd/workshop_post_survey?enrollmentCode=#{summer_enrollment2.code}"
      assert_template :invalid_enrollment_code
    end

    test 'csf101 workshop with attended teacher sees foorm survey' do
      setup_csf101_workshop
      sign_in @enrolled_csf101_teacher

      create :pd_attendance, session: @csf101_workshop.sessions[0], teacher: @enrolled_csf101_teacher, enrollment: @csf101_enrollment

      get '/pd/workshop_survey/csf/post101'
      assert_response :success
      assert_template :new_general_foorm
    end

    test 'csf101 workshop with not attended teacher sees no_attendance' do
      setup_csf101_workshop
      sign_in @enrolled_csf101_teacher

      get '/pd/workshop_survey/csf/post101'
      assert_response :success
      assert_no_attendance
    end

    test 'csf101 workshop with invalid enrollment code sees invalid enrollment code message' do
      setup_csf101_workshop
      sign_in @enrolled_csf101_teacher

      get '/pd/workshop_survey/csf/post101/invalid_code'
      assert_response :success
      assert_template :invalid_enrollment_code
    end

    test 'csf101 workshop with valid enrollment code sees survey' do
      setup_csf101_workshop
      sign_in @enrolled_csf101_teacher
      create :pd_attendance, session: @csf101_workshop.sessions[0], teacher: @enrolled_csf101_teacher, enrollment: @csf101_enrollment

      get "/pd/workshop_survey/csf/post101/#{@csf101_enrollment.code}"
      assert_response :success
      assert_template :new_general_foorm
    end

    test 'csf101 workshop with valid enrollment code but no attendance sees no_attendance' do
      setup_csf101_workshop
      sign_in @enrolled_csf101_teacher

      get "/pd/workshop_survey/csf/post101/#{@csf101_enrollment.code}"
      assert_response :success
      assert_no_attendance
    end

    test 'csf pre201 survey: unauthenticated teacher is redirected to sign-in' do
      get '/pd/workshop_survey/csf/pre201'
      assert_response :redirect
      assert_redirected_to_sign_in
    end

    test 'csf pre201 survey: unenrolled teacher gets not_enrolled msg' do
      sign_in unenrolled_teacher
      get '/pd/workshop_survey/csf/pre201'

      assert_response :success
      assert_not_enrolled
    end

    test 'csf pre201 survey: enrolled teacher in ended workshop gets too-late msg' do
      setup_csf201_ended_workshop
      teacher = create :teacher
      create :pd_enrollment, user: teacher, workshop: @csf201_ended_workshop

      sign_in teacher
      get '/pd/workshop_survey/csf/pre201'

      assert_response :success
      assert_closed
    end

    test 'csf pre201 survey: enrolled teacher in unended workshop gets survey' do
      setup_csf201_not_started_workshop
      teacher = create :teacher
      create :pd_enrollment, user: teacher, workshop: @csf201_not_started_workshop

      actual_form_id = nil
      actual_form_params = nil
      WorkshopDailySurveyController.view_context_class.any_instance.expects(:jotform_iframe).
        with do |id, params|
          actual_form_id = id
          actual_form_params = params
          true
        end

      sign_in teacher
      get '/pd/workshop_survey/csf/pre201'

      assert_response :success
      assert_equal csf_pre201_params[:formId], actual_form_id
      assert_equal teacher.id, actual_form_params[:userId]
      assert_equal @csf201_not_started_workshop.id, actual_form_params[:workshopId]
      assert_equal csf_pre201_params[:day], actual_form_params[:day]
    end

    test 'csf pre201 survey: reports survey render to New Relic' do
      setup_csf201_not_started_workshop
      teacher = create :teacher
      create :pd_enrollment, user: teacher, workshop: @csf201_not_started_workshop

      CDO.stubs(:newrelic_logging).returns(true)
      NewRelic::Agent.expects(:record_custom_event).with(
        'RenderJotFormView',
        {
          route: 'GET /pd/workshop_survey/csf/pre201',
          form_id: csf_pre201_params[:formId],
          workshop_course: COURSE_CSF,
          workshop_subject: SUBJECT_CSF_201,
          regional_partner_name: @regional_partner.name
        }
      )

      sign_in teacher
      get '/pd/workshop_survey/csf/pre201'

      assert_response :success
    end

    test 'csf pre201 survey: submission creates a placeholder record and redirects teacher to thanks' do
      setup_csf201_not_started_workshop
      teacher = create :teacher
      create :pd_enrollment, user: teacher, workshop: @csf201_not_started_workshop

      search_params = {
        user_id: teacher.id,
        pd_workshop_id: @csf201_not_started_workshop.id,
        day: csf_pre201_params[:day],
        form_id: csf_pre201_params[:formId],
        submission_id: FAKE_SUBMISSION_ID
      }

      key_params = csf_pre201_params.merge(
        userId: teacher.id,
        workshopId: @csf201_not_started_workshop.id
      )

      refute WorkshopDailySurvey.response_exists?(search_params)

      sign_in teacher
      post '/pd/workshop_survey/submit',
        params: {key: key_params}.merge(submission_id: FAKE_SUBMISSION_ID)

      assert WorkshopDailySurvey.response_exists?(
        search_params.merge(submission_id: FAKE_SUBMISSION_ID)
      )
      assert_redirected_to action: 'thanks'
    end

    test 'csf pre201 survey: teacher already submitted survey does not gets survey again' do
      setup_csf201_not_started_workshop
      teacher = create :teacher
      create :pd_enrollment, user: teacher, workshop: @csf201_not_started_workshop

      WorkshopDailySurvey.create_placeholder!(
        user_id: teacher.id,
        pd_workshop_id: @csf201_not_started_workshop.id,
        day: csf_pre201_params[:day],
        form_id: csf_pre201_params[:formId],
        submission_id: FAKE_SUBMISSION_ID
      )

      WorkshopDailySurveyController.view_context_class.any_instance.expects(:jotform_iframe).never

      sign_in teacher
      get '/pd/workshop_survey/csf/pre201'

      assert_redirected_to action: 'thanks'
    end

    test 'csf post201 survey: redirect to sign-in page if teacher did not authenticate' do
      get '/pd/workshop_survey/csf/post201'
      assert_response :redirect
      assert_redirected_to_sign_in
    end

    test 'csf post201 survey: show not-enrolled page if teacher did not enroll' do
      sign_in unenrolled_teacher
      get '/pd/workshop_survey/csf/post201'

      assert_response :success
      assert_not_enrolled
    end

    test 'csf post201 survey: show no-attendance page if teacher did not attend' do
      setup_csf201_not_started_workshop
      teacher = create :teacher
      create :pd_enrollment, user: teacher, workshop: @csf201_not_started_workshop

      sign_in teacher
      get '/pd/workshop_survey/csf/post201'

      assert_response :success
      assert_no_attendance
    end

    test 'csf post201 survey: show invalid enrollment code page if enrollment code is invalid' do
      setup_csf201_in_progress_workshop
      teacher = create :teacher
      create :pd_enrollment, user: teacher, workshop: @csf201_in_progress_workshop
      create :pd_attendance, session: @csf201_in_progress_workshop.sessions.first, teacher: teacher

      invalid_enrollment_code = "HAS1DIGIT"  # has a digit and length less than 10
      sign_in teacher
      get "/pd/workshop_survey/csf/post201/#{invalid_enrollment_code}"

      assert_template :invalid_enrollment_code
    end

    test 'csf post201 survey: show survey if attended teacher has valid enrollment code' do
      setup_csf201_in_progress_workshop
      teacher = create :teacher
      session = @csf201_in_progress_workshop.sessions.first
      enrollment = create :pd_enrollment, user: teacher, workshop: @csf201_in_progress_workshop
      create :pd_attendance, session: session, teacher: teacher

      actual_form_id = nil
      actual_form_params = nil
      WorkshopDailySurveyController.view_context_class.any_instance.expects(:jotform_iframe).
        with do |id, params|
          actual_form_id = id
          actual_form_params = params
          true
        end

      sign_in teacher
      get "/pd/workshop_survey/csf/post201/#{enrollment.code}"

      assert_response :success
      assert_equal csf_post201_params[:formId], actual_form_id
      assert_equal teacher.id, actual_form_params[:userId]
      assert_equal @csf201_in_progress_workshop.id, actual_form_params[:workshopId]
      assert_equal csf_post201_params[:day], actual_form_params[:day]
      assert_equal session.id, actual_form_params[:sessionId]
      refute nil, actual_form_params[:submitRedirect]
    end

    test 'csf post201 survey: show survey if attended teacher does not have enrollment code' do
      setup_csf201_in_progress_workshop
      teacher = create :teacher
      session = @csf201_in_progress_workshop.sessions.first
      create :pd_enrollment, user: teacher, workshop: @csf201_in_progress_workshop
      create :pd_attendance, session: session, teacher: teacher

      actual_form_id = nil
      actual_form_params = nil
      WorkshopDailySurveyController.view_context_class.any_instance.expects(:jotform_iframe).
        with do |id, params|
          actual_form_id = id
          actual_form_params = params
          true
        end

      sign_in teacher
      get '/pd/workshop_survey/csf/post201'

      assert_response :success
      assert_equal csf_post201_params[:formId], actual_form_id
      assert_equal teacher.id, actual_form_params[:userId]
      assert_equal @csf201_in_progress_workshop.id, actual_form_params[:workshopId]
      assert_equal csf_post201_params[:day], actual_form_params[:day]
      assert_equal session.id, actual_form_params[:sessionId]
      refute nil, actual_form_params[:submitRedirect]
    end

    test 'csf post201 survey: report survey rendering to New Relic' do
      setup_csf201_in_progress_workshop
      teacher = create :teacher
      create :pd_enrollment, user: teacher, workshop: @csf201_in_progress_workshop
      create :pd_attendance, session: @csf201_in_progress_workshop.sessions.first, teacher: teacher

      CDO.stubs(:newrelic_logging).returns(true)
      NewRelic::Agent.expects(:record_custom_event).with(
        'RenderJotFormView',
        {
          route: 'GET /pd/workshop_survey/csf/post201',
          form_id: csf_post201_params[:formId],
          workshop_course: COURSE_CSF,
          workshop_subject: SUBJECT_CSF_201,
          regional_partner_name: @regional_partner.name
        }
      )

      sign_in teacher
      get '/pd/workshop_survey/csf/post201'

      assert_response :success
    end

    test 'csf post201 survey: create placeholder and redirect to 1st facilitator survey on submission' do
      setup_csf201_in_progress_workshop
      teacher = create :teacher
      create :pd_enrollment, user: teacher, workshop: @csf201_in_progress_workshop
      session = @csf201_in_progress_workshop.sessions.first
      create :pd_attendance, session: session, teacher: teacher

      first_facilitator_index = 0

      search_params = {
        user_id: teacher.id,
        pd_workshop_id: @csf201_in_progress_workshop.id,
        day: csf_post201_params[:day],
        form_id: csf_post201_params[:formId]
      }

      key_params = csf_post201_params.merge(
        userId: teacher.id,
        workshopId: @csf201_in_progress_workshop.id,
        sessionId: session.id
        )

      refute WorkshopDailySurvey.response_exists?(search_params)

      sign_in teacher
      post '/pd/workshop_survey/submit',
        params: {key: key_params}.merge(submission_id: FAKE_SUBMISSION_ID)

      assert WorkshopDailySurvey.response_exists?(
        search_params.merge(submission_id: FAKE_SUBMISSION_ID)
      )

      assert_redirected_to action: :new_facilitator,
        session_id: session.id, facilitator_index: first_facilitator_index
    end

    test 'csf facilitator survey: show 1st facilitator survey to attended teacher' do
      setup_csf201_in_progress_workshop
      teacher = create :teacher
      create :pd_enrollment, user: teacher, workshop: @csf201_in_progress_workshop
      session = @csf201_in_progress_workshop.sessions.first
      create :pd_attendance, session: session, teacher: teacher

      first_facilitator = @csf201_in_progress_workshop.facilitators.order(:name, :id).first
      first_facilitator_index = 0

      actual_form_id = nil
      actual_form_params = nil
      WorkshopDailySurveyController.view_context_class.any_instance.expects(:jotform_iframe).
        with do |id, params|
          actual_form_id = id
          actual_form_params = params
          true
        end

      sign_in teacher
      get "/pd/workshop_survey/facilitators/#{session.id}/#{first_facilitator_index}"

      assert_response :success
      assert_equal FAKE_FACILITATOR_FORM_ID, actual_form_id
      assert_equal teacher.id, actual_form_params[:userId]
      assert_equal @csf201_in_progress_workshop.id, actual_form_params[:workshopId]
      assert_equal csf_post201_params[:day], actual_form_params[:day]
      assert_equal session.id, actual_form_params[:sessionId]
      assert_equal first_facilitator.id, actual_form_params[:facilitatorId]
      assert_equal first_facilitator_index, actual_form_params[:facilitatorIndex]
      refute nil, actual_form_params[:submitRedirect]
    end

    test 'csf facilitator survey: creates placeholder and redirects to 2nd facilitator survey on submission' do
      setup_csf201_in_progress_workshop
      teacher = create :teacher
      create :pd_enrollment, user: teacher, workshop: @csf201_in_progress_workshop
      session = @csf201_in_progress_workshop.sessions.first
      create :pd_attendance, session: session, teacher: teacher

      first_facilitator = @csf201_in_progress_workshop.facilitators.order(:name, :id).first
      first_facilitator_index = 0

      search_params = {
        user_id: teacher.id,
        pd_session_id: session.id,
        facilitator_id: first_facilitator.id,
        form_id: FAKE_FACILITATOR_FORM_ID
      }

      refute WorkshopFacilitatorDailySurvey.response_exists?(search_params)

      key_params = {
        environment: Rails.env,
        userId: teacher.id,
        day: csf_post201_params[:day],
        sessionId: session.id,
        facilitatorId: first_facilitator.id,
        facilitatorIndex: first_facilitator_index,
        formId: FAKE_FACILITATOR_FORM_ID
      }

      # Submit survey for the 1st facilitator
      sign_in teacher
      post '/pd/workshop_survey/facilitators/submit',
        params: {key: key_params}.merge(submission_id: FAKE_SUBMISSION_ID)

      # Verify placeholder created
      assert WorkshopFacilitatorDailySurvey.response_exists?(
        search_params.merge(submission_id: FAKE_SUBMISSION_ID)
      )

      # Verify redirection
      assert_redirected_to action: :new_facilitator,
        session_id: session.id, facilitator_index: first_facilitator_index + 1
    end

    test 'csf facilitator survey: redirect to 2nd facilitator survey if response exists for 1st one' do
      setup_csf201_in_progress_workshop
      teacher = create :teacher
      create :pd_enrollment, user: teacher, workshop: @csf201_in_progress_workshop
      session = @csf201_in_progress_workshop.sessions.first
      create :pd_attendance, session: session, teacher: teacher

      first_facilitator = @csf201_in_progress_workshop.facilitators.order(:name, :id).first
      first_facilitator_index = 0

      WorkshopFacilitatorDailySurvey.create_placeholder!(
        user_id: teacher.id,
        day: csf_post201_params[:day],
        pd_session_id: session.id,
        facilitator_id: first_facilitator.id,
        form_id: FAKE_FACILITATOR_FORM_ID,
        submission_id: FAKE_SUBMISSION_ID
      )

      WorkshopDailySurveyController.view_context_class.any_instance.expects(:jotform_iframe).never

      sign_in teacher
      get "/pd/workshop_survey/facilitators/#{session.id}/#{first_facilitator_index}"

      assert_redirected_to action: :new_facilitator,
        session_id: session.id, facilitator_index: first_facilitator_index + 1
    end

    test 'csf facilitator survey: show thanks page if response exists for all facilitators' do
      setup_csf201_in_progress_workshop
      teacher = create :teacher
      create :pd_enrollment, user: teacher, workshop: @csf201_in_progress_workshop
      session = @csf201_in_progress_workshop.sessions.first
      create :pd_attendance, session: session, teacher: teacher

      first_facilitator_index = 0
      @csf201_in_progress_workshop.facilitators.order(:name, :id).each_with_index do |facilitator, index|
        WorkshopFacilitatorDailySurvey.create_placeholder!(
          user_id: teacher.id,
          day: csf_post201_params[:day],
          pd_session_id: session.id,
          facilitator_id: facilitator.id,
          form_id: FAKE_FACILITATOR_FORM_ID,
          submission_id: FAKE_SUBMISSION_ID + index
        )
      end

      sign_in teacher
      get "/pd/workshop_survey/facilitators/#{session.id}/#{first_facilitator_index}"

      # This only works if there are exactly 2 facilitators
      follow_redirect!

      assert_redirected_to action: 'thanks'
    end

    test 'thanks displays thanks message' do
      setup_summer_workshop
      sign_in @enrolled_summer_teacher
      get '/pd/workshop_survey/thanks'
      assert_response :success
      assert_select 'h1', text: 'Thank you for submitting today’s survey.'
    end

    test 'AYW1 pre-survey link shows foorm survey' do
      setup_academic_year_workshop
      sign_in @enrolled_academic_year_teacher

      pre_survey_links = %w(/pd/AYW1/pre /pd/AYW1/pre/module/1 /pd/AYW1/pre/module/2)
      pre_survey_links.each do |link|
        get link
        assert_response :success
        assert_template :new_general_foorm
      end
    end

    test 'AYW1 post-survey link shows foorm survey for attended teacher' do
      setup_academic_year_workshop
      sign_in @enrolled_academic_year_teacher
      create :pd_attendance,
        session: @academic_year_workshop.sessions[0],
        teacher: @enrolled_academic_year_teacher,
        enrollment: @academic_year_enrollment

      post_survey_links = %w(/pd/AYW1/post/in_person /pd/AYW1/post/module/1 /pd/AYW1/post/module/2 /pd/AYW1/post/module/1_2)
      post_survey_links.each do |link|
        get link
        assert_response :success
        assert_template :new_general_foorm
      end
    end

    test 'AYW1 post-survey link shows no attendance for teacher with no attendance' do
      setup_academic_year_workshop
      sign_in @enrolled_academic_year_teacher

      post_survey_links = %w(/pd/AYW1/post/in_person /pd/AYW1/post/module/1 /pd/AYW1/post/module/2 /pd/AYW1/post/module/1_2)
      post_survey_links.each do |link|
        get link
        assert_response :success
        assert_no_attendance
      end
    end

    test 'AYW1_2 pre-survey link shows foorm survey' do
      setup_two_day_academic_year_workshop
      sign_in @enrolled_two_day_academic_year_teacher

      get '/pd/AYW1_2/pre'
      assert_response :success
      assert_template :new_general_foorm
    end

    test 'AYW1_2 post-survey link shows foorm survey for attended teacher' do
      setup_two_day_academic_year_workshop
      sign_in @enrolled_two_day_academic_year_teacher

      create :pd_attendance,
        session: @two_day_academic_year_workshop.sessions[0],
        teacher: @enrolled_two_day_academic_year_teacher,
        enrollment: @two_day_academic_year_enrollment
      get '/pd/AYW1_2/post/in_person'
      assert_response :success
      assert_template :new_general_foorm
    end

    test 'User cannot access AYW survey if they are not enrolled' do
      setup_two_day_academic_year_workshop
      sign_in @enrolled_two_day_academic_year_teacher

      # two day workshop enrollee should not be able to load 1 day survey
      get '/pd/AYW1/pre'
      assert_not_enrolled
    end

    private

    def setup_summer_workshop
      @regional_partner = create :regional_partner
      @summer_workshop = create :summer_workshop, regional_partner: @regional_partner
      @summer_enrollment = create :pd_enrollment, :from_user, workshop: @summer_workshop
      @enrolled_summer_teacher = @summer_enrollment.user
      @facilitators = @summer_workshop.facilitators.order(:name, :id)
    end

    def setup_academic_year_workshop
      @regional_partner = create :regional_partner
      @academic_year_workshop = create :csp_academic_year_workshop, regional_partner: @regional_partner
      @academic_year_enrollment = create :pd_enrollment, :from_user, workshop: @academic_year_workshop
      @enrolled_academic_year_teacher = @academic_year_enrollment.user
      @facilitators = @academic_year_workshop.facilitators.order(:name, :id)
    end

    def setup_two_day_academic_year_workshop
      @regional_partner = create :regional_partner
      @two_day_academic_year_workshop = create :csp_academic_year_workshop, :two_day,
        regional_partner: @regional_partner
      @two_day_academic_year_enrollment = create :pd_enrollment, :from_user,
        workshop: @two_day_academic_year_workshop
      @enrolled_two_day_academic_year_teacher = @two_day_academic_year_enrollment.user
      @facilitators = @two_day_academic_year_workshop.facilitators.order(:name, :id)
    end

    def setup_csf201_not_started_workshop
      @regional_partner = create :regional_partner
      @csf201_not_started_workshop = create :csf_deep_dive_workshop,
        regional_partner: @regional_partner,
        num_facilitators: 2
    end

    def setup_csf201_in_progress_workshop
      @regional_partner = create :regional_partner
      @csf201_in_progress_workshop = create :csf_deep_dive_workshop,
        :in_progress,
        regional_partner: @regional_partner,
        num_facilitators: 2
    end

    def setup_csf201_ended_workshop
      @regional_partner = create :regional_partner
      @csf201_ended_workshop = create :csf_deep_dive_workshop,
        :ended,
        regional_partner: @regional_partner,
        num_facilitators: 2
    end

    def setup_csf101_workshop
      @regional_partner = create :regional_partner
      @csf101_workshop = create :csf_intro_workshop,
        regional_partner: @regional_partner,
        num_facilitators: 2

      @csf101_enrollment = create :pd_enrollment, :from_user, workshop: @csf101_workshop
      @enrolled_csf101_teacher = @csf101_enrollment.user
      @facilitators = @csf101_workshop.facilitators.order(:name, :id)
    end

    def unenrolled_teacher
      create :teacher
    end

    def prop(name)
      JSON.parse(assigns(:script_data).try(:[], :props)).try(:[], name)
    end

    def assert_not_enrolled
      assert_select 'h1', text: 'Not Enrolled'
      assert_select 'p', text: 'You need to be enrolled in a workshop before completing this survey.'
    end

    def assert_closed
      assert_select 'h1', text: 'The survey has closed'
      assert_select 'p', text: /The survey for today’s session of your workshop is now closed\./
    end

    def assert_no_attendance
      assert_select 'h1', text: 'No Attendance'
      assert_select 'p', text:
        'You need to be marked as attended for today’s session of your workshop before you can complete this survey.'
    end

    def assert_thanks
      assert_select '#thanks>h1', text: 'Thank you for submitting today’s survey.'
    end

    def assert_redirected_to_sign_in
      assert_match %r{users/sign_in.*redirected}, response.body
    end

    def csf_pre201_params
      {
        environment: Rails.env,
        day: CSF_SURVEY_INDEXES[PRE_DEEPDIVE_SURVEY],
        formId: CDO.jotform_forms[CSF_CATEGORY][PRE_DEEPDIVE_SURVEY]
      }
    end

    def csf_post201_params
      {
        environment: Rails.env,
        day: CSF_SURVEY_INDEXES[POST_DEEPDIVE_SURVEY],
        formId: CDO.jotform_forms[CSF_CATEGORY][POST_DEEPDIVE_SURVEY]
      }
    end
  end
end
