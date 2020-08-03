require_relative '../../../../shared/test/spy_newrelic_agent'
require 'test_helper'

module Pd
  class WorkshopDailySurveyControllerTest < ActionDispatch::IntegrationTest
    include WorkshopConstants
    include WorkshopSurveyConstants

    # Array of ids for days 0 (pre) and 1 - 5
    FAKE_DAILY_FORM_IDS = (123450..123455).to_a.freeze
    FAKE_FACILITATOR_FORM_ID = 123459
    FAKE_SUBMISSION_ID = 987654
    FAKE_ACADEMIC_YEAR_IDS = (54321...54324).to_a.freeze
    FAKE_CSF_201_FORM_IDS = [201903, 201904].freeze
    FAKE_JOTFORM_FORMS = {
      local_summer: {
        day_0: FAKE_DAILY_FORM_IDS[0],
        day_1: FAKE_DAILY_FORM_IDS[1],
        day_5: FAKE_DAILY_FORM_IDS[5],
        facilitator: FAKE_FACILITATOR_FORM_ID
      },
      academic_year_1: {
        day_1: FAKE_ACADEMIC_YEAR_IDS[0],
        post_workshop: FAKE_ACADEMIC_YEAR_IDS[4],
        facilitator: FAKE_FACILITATOR_FORM_ID
      },
      academic_year_5: {
        day_1: FAKE_ACADEMIC_YEAR_IDS[0],
        day_2: FAKE_ACADEMIC_YEAR_IDS[1],
        post_workshop: FAKE_ACADEMIC_YEAR_IDS[4],
        facilitator: FAKE_FACILITATOR_FORM_ID
      },
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

      get '/pd/workshop_daily_survey/day/5'
      assert_response :not_found
    end

    test 'daily academic year workshop survey results 404 for days outside of 1' do
      setup_academic_year_workshop
      sign_in @enrolled_academic_year_teacher

      get '/pd/workshop_survey/day/0'
      assert_response :not_found

      get '/pd/workshop_survey/day/2'
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

    test 'post-workshop foorm survey displays foorm when enrolled' do
      setup_summer_workshop

      sign_in @enrolled_summer_teacher
      get '/pd/workshop_post_survey'
      assert_template :new_general_foorm
      assert_response :success
    end

    test 'pre-workshop submit redirect creates a placeholder and redirects to thanks' do
      setup_summer_workshop
      sign_in @enrolled_summer_teacher

      assert_creates Pd::WorkshopDailySurvey do
        post '/pd/workshop_survey/submit',
          params: general_submit_redirect_params(day: 0).merge(
            submission_id: FAKE_SUBMISSION_ID,
          )

        assert_redirected_to action: 'thanks'
      end

      new_record = Pd::WorkshopDailySurvey.last
      assert new_record.placeholder?
      assert_equal @summer_workshop, new_record.pd_workshop
      assert_equal 0, new_record.day
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

      sign_in @enrolled_summer_teacher
      get '/pd/workshop_survey/day/1'
      assert_response :success
      assert_closed
    end

    test 'daily workshop survey displays no attendance message when session is open but not attended' do
      setup_summer_workshop
      Session.any_instance.expects(:open_for_attendance?).returns(true)

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
      get '/pd/workshop_daily_survey/day/1'
      assert_response :success
      assert_closed
    end

    test 'daily workshop foorm survey displays no attendance message when session is open but not attended' do
      setup_summer_workshop
      Session.any_instance.expects(:open_for_attendance?).returns(true)

      sign_in @enrolled_summer_teacher
      get '/pd/workshop_daily_survey/day/1'
      assert_response :success
      assert_no_attendance
    end

    test 'daily summer workshop survey with open session attendance displays foorm' do
      setup_summer_workshop
      Session.any_instance.expects(:open_for_attendance?).returns(true)
      create :pd_attendance, session: @summer_workshop.sessions[0], teacher: @enrolled_summer_teacher, enrollment: @summer_enrollment

      submit_redirect = general_submit_redirect(day: 1)
      assert_equal '/pd/workshop_survey/submit', URI.parse(submit_redirect).path

      sign_in @enrolled_summer_teacher
      get '/pd/workshop_survey/day/1'
      assert_template :new_general_foorm
    end

    test 'academic year workshop with open session attendance displays embedded Jotform' do
      setup_academic_year_workshop
      Session.any_instance.expects(:open_for_attendance?).returns(true)
      create :pd_attendance, session: @academic_year_workshop.sessions[0], teacher: @enrolled_academic_year_teacher, enrollment: @academic_year_enrollment

      submit_redirect = general_submit_redirect(day: 1, user: @enrolled_academic_year_teacher, workshop: @academic_year_workshop)
      assert_equal '/pd/workshop_survey/submit', URI.parse(submit_redirect).path

      WorkshopDailySurveyController.view_context_class.any_instance.expects(:jotform_iframe).with(
        FAKE_ACADEMIC_YEAR_IDS[0],
        {
          environment: 'test',
          userId: @enrolled_academic_year_teacher.id,
          workshopId: @academic_year_workshop.id,
          day: 1,
          formId: FAKE_ACADEMIC_YEAR_IDS[0],
          sessionId: @academic_year_workshop.sessions[0].id,
          userName: @enrolled_academic_year_teacher.name,
          userEmail: @enrolled_academic_year_teacher.email,
          workshopCourse: COURSE_CSP,
          workshopSubject: SUBJECT_CSP_WORKSHOP_1,
          regionalPartnerName: @regional_partner.name,
          submitRedirect: submit_redirect
        }
      )

      sign_in @enrolled_academic_year_teacher
      get '/pd/workshop_survey/day/1'
      assert_response :success
    end

    test 'enrollment code override is used when fetching the workshop for a user' do
      setup_academic_year_workshop
      other_academic_workshop = create :csp_academic_year_workshop,
        regional_partner: @regional_partner, facilitators: @facilitators, sessions_from: Date.today + 1.month
      other_enrollment = create :pd_enrollment, :from_user, workshop: other_academic_workshop, user: @enrolled_academic_year_teacher
      create :pd_attendance, session: other_academic_workshop.sessions[0], teacher: @enrolled_academic_year_teacher, enrollment: other_enrollment

      # Same test as above but make sure we use the other workshop instead of @academic_year_workshop
      # because we are using the enrollment code
      submit_redirect = general_submit_redirect(day: 1, user: @enrolled_academic_year_teacher, workshop: other_academic_workshop)
      assert_equal '/pd/workshop_survey/submit', URI.parse(submit_redirect).path

      WorkshopDailySurveyController.view_context_class.any_instance.expects(:jotform_iframe).with(
        FAKE_ACADEMIC_YEAR_IDS[0],
        {
          environment: 'test',
          userId: @enrolled_academic_year_teacher.id,
          workshopId: other_academic_workshop.id,
          day: 1,
          formId: FAKE_ACADEMIC_YEAR_IDS[0],
          sessionId: other_academic_workshop.sessions[0].id,
          userName: @enrolled_academic_year_teacher.name,
          userEmail: @enrolled_academic_year_teacher.email,
          workshopCourse: COURSE_CSP,
          workshopSubject: SUBJECT_CSP_WORKSHOP_1,
          regionalPartnerName: @regional_partner.name,
          submitRedirect: submit_redirect
        }
      )

      sign_in @enrolled_academic_year_teacher
      get "/pd/workshop_survey/day/1?enrollmentCode=#{other_enrollment.code}"
      assert_response :success
    end

    test 'daily workshop submit redirect creates placeholder and redirects to first facilitator form' do
      setup_summer_workshop
      sign_in @enrolled_summer_teacher

      assert_creates Pd::WorkshopDailySurvey do
        post '/pd/workshop_survey/submit',
          params: general_submit_redirect_params(day: 1).merge(
            submission_id: FAKE_SUBMISSION_ID,
          )

        assert_redirected_to action: :new_facilitator, session_id: @summer_workshop.sessions[0].id, facilitator_index: 0
      end

      new_record = Pd::WorkshopDailySurvey.last
      assert new_record.placeholder?
      assert_equal @summer_workshop, new_record.pd_workshop
      assert_equal 1, new_record.day
    end

    test 'academic year workshop submit redirect creates placeholder and redirects to the first facilitator form' do
      setup_academic_year_workshop
      sign_in @enrolled_academic_year_teacher

      assert_creates Pd::WorkshopDailySurvey do
        params = general_submit_redirect_params(day: 1, user: @enrolled_academic_year_teacher, workshop: @academic_year_workshop).merge(
          submission_id: FAKE_SUBMISSION_ID,
        )

        post '/pd/workshop_survey/submit', params: params

        assert_redirected_to action: :new_facilitator, session_id: @academic_year_workshop.sessions[0].id, facilitator_index: 0
      end

      new_record = Pd::WorkshopDailySurvey.last
      assert new_record.placeholder?
      assert_equal @academic_year_workshop, new_record.pd_workshop
      assert_equal 1, new_record.day
    end

    test 'facilitator specific survey displays closed message when session attendance is closed' do
      setup_summer_workshop
      Session.any_instance.expects(:open_for_attendance?).returns(false)

      sign_in @enrolled_summer_teacher
      get "/pd/workshop_survey/facilitators/#{@summer_workshop.sessions[0].id}/0"
      assert_response :success
      assert_closed
    end

    test 'facilitator specific survey displays no attendance message when session is open but not attended' do
      setup_summer_workshop
      Session.any_instance.expects(:open_for_attendance?).returns(true)

      sign_in @enrolled_summer_teacher
      get "/pd/workshop_survey/facilitators/#{@summer_workshop.sessions[0].id}/0"
      assert_response :success
      assert_no_attendance
    end

    test 'facilitator specific survey redirects to next facilitator when response exists' do
      setup_summer_workshop
      Session.any_instance.expects(:open_for_attendance?).returns(true)
      create :pd_attendance, session: @summer_workshop.sessions[0], teacher: @enrolled_summer_teacher, enrollment: @summer_enrollment
      create :pd_workshop_facilitator_daily_survey, pd_workshop: @summer_workshop, user: @enrolled_summer_teacher,
        day: 1, form_id: FAKE_FACILITATOR_FORM_ID, pd_session: @summer_workshop.sessions[0], facilitator: @facilitators[0]

      sign_in @enrolled_summer_teacher
      get "/pd/workshop_survey/facilitators/#{@summer_workshop.sessions[0].id}/0"
      assert_redirected_to action: :new_facilitator, session_id: @summer_workshop.sessions[0].id, facilitator_index: 1
    end

    test 'facilitator specific survey with open session attendance displays embedded JotForm' do
      setup_summer_workshop
      Session.any_instance.expects(:open_for_attendance?).returns(true)
      create :pd_attendance, session: @summer_workshop.sessions[0], teacher: @enrolled_summer_teacher, enrollment: @summer_enrollment

      submit_redirect = facilitator_submit_redirect(day: 1, facilitator_index: 0)
      assert_equal '/pd/workshop_survey/facilitators/submit', URI.parse(submit_redirect).path

      WorkshopDailySurveyController.view_context_class.any_instance.expects(:jotform_iframe).with(
        FAKE_FACILITATOR_FORM_ID,
        {
          environment: 'test',
          userId: @enrolled_summer_teacher.id,
          sessionId: @summer_workshop.sessions[0].id,
          facilitatorId: @facilitators[0].id,
          facilitatorIndex: 0,
          formId: FAKE_FACILITATOR_FORM_ID,
          workshopId: @summer_workshop.id,
          userName: @enrolled_summer_teacher.name,
          userEmail: @enrolled_summer_teacher.email,
          workshopCourse: @summer_workshop.course,
          workshopSubject: @summer_workshop.subject,
          regionalPartnerName: @regional_partner.name,
          day: 1,
          facilitatorPosition: 1,
          facilitatorName: @facilitators[0].name,
          numFacilitators: 2,
          submitRedirect: submit_redirect
        }
      )

      sign_in @enrolled_summer_teacher
      get "/pd/workshop_survey/facilitators/#{@summer_workshop.sessions[0].id}/0"
      assert_response :success
    end

    test 'facilitator specific survey reports render to New Relic' do
      setup_summer_workshop
      NewRelic::Agent.expects(:record_custom_event).with(
        'RenderJotFormView',
        {
          route: "GET /pd/workshop_survey/facilitators/#{@summer_workshop.sessions[0].id}/0",
          form_id: FAKE_FACILITATOR_FORM_ID,
          workshop_course: @summer_workshop.course,
          workshop_subject: @summer_workshop.subject,
          regional_partner_name: @regional_partner.name
        }
      )

      CDO.stubs(:newrelic_logging).returns(true)

      Session.any_instance.expects(:open_for_attendance?).returns(true)
      create :pd_attendance, session: @summer_workshop.sessions[0], teacher: @enrolled_summer_teacher, enrollment: @summer_enrollment
      sign_in @enrolled_summer_teacher
      get "/pd/workshop_survey/facilitators/#{@summer_workshop.sessions[0].id}/0"
      assert_response :success
    end

    test 'facilitator specific submit redirect creates placeholder and redirects to next facilitator form' do
      setup_summer_workshop
      sign_in @enrolled_summer_teacher

      assert_creates Pd::WorkshopFacilitatorDailySurvey do
        post '/pd/workshop_survey/facilitators/submit',
          params: facilitator_submit_redirect_params(day: 1, facilitator_index: 0).merge(
            submission_id: FAKE_SUBMISSION_ID,
          )

        assert_redirected_to action: :new_facilitator, session_id: @summer_workshop.sessions[0].id, facilitator_index: 1
      end

      new_record = Pd::WorkshopFacilitatorDailySurvey.last
      assert new_record.placeholder?
      assert_equal @summer_workshop, new_record.pd_workshop
      assert_equal 1, new_record.day
      assert_equal @facilitators[0], new_record.facilitator
    end

    test 'facilitator specific submit redirect creates placeholder and redirects to thanks for last facilitator' do
      setup_summer_workshop
      sign_in @enrolled_summer_teacher

      assert_creates Pd::WorkshopFacilitatorDailySurvey do
        post '/pd/workshop_survey/facilitators/submit',
          params: facilitator_submit_redirect_params(day: 1, facilitator_index: 1).merge(
            submission_id: FAKE_SUBMISSION_ID,
          )

        assert_redirected_to action: :thanks
      end

      new_record = Pd::WorkshopFacilitatorDailySurvey.last
      assert new_record.placeholder?
      assert_equal @summer_workshop, new_record.pd_workshop
      assert_equal 1, new_record.day
      assert_equal @facilitators[1], new_record.facilitator
    end

    test 'facilitator specific submit for 2-day academic redirects to thanks for day 1' do
      setup_two_day_academic_year_workshop
      sign_in @enrolled_two_day_academic_year_teacher

      assert_creates Pd::WorkshopFacilitatorDailySurvey do
        post '/pd/workshop_survey/facilitators/submit',
          params: facilitator_submit_redirect_params(
            day: 1,
            user: @enrolled_two_day_academic_year_teacher,
            workshop: @two_day_academic_year_workshop,
            facilitator_index: 1
          ).deep_merge(
            submission_id: FAKE_SUBMISSION_ID,
            key: {
              userId: @enrolled_two_day_academic_year_teacher.id,
              sessionId: @two_day_academic_year_workshop.sessions[0].id
            }
          )

        assert_redirected_to action: :thanks
      end

      new_record = Pd::WorkshopFacilitatorDailySurvey.last
      assert new_record.placeholder?
      assert_equal @two_day_academic_year_workshop, new_record.pd_workshop
      assert_equal 1, new_record.day
      assert_equal @facilitators[1], new_record.facilitator
    end

    test 'facilitator specific submit for 2-day academic redirects to post for day 2' do
      setup_two_day_academic_year_workshop
      sign_in @enrolled_two_day_academic_year_teacher

      assert_creates Pd::WorkshopFacilitatorDailySurvey do
        post '/pd/workshop_survey/facilitators/submit',
          params: facilitator_submit_redirect_params(
            day: 2,
            user: @enrolled_two_day_academic_year_teacher,
            workshop: @two_day_academic_year_workshop,
            facilitator_index: 1
          ).deep_merge(
            submission_id: FAKE_SUBMISSION_ID,
            key: {
              userId: @enrolled_two_day_academic_year_teacher.id,
              sessionId: @two_day_academic_year_workshop.sessions[1].id
            }
          )

        assert_redirected_to action: :new_post, enrollment_code: @two_day_academic_year_enrollment.code
      end

      new_record = Pd::WorkshopFacilitatorDailySurvey.last
      assert new_record.placeholder?
      assert_equal @two_day_academic_year_workshop, new_record.pd_workshop
      assert_equal 2, new_record.day
      assert_equal @facilitators[1], new_record.facilitator
    end

    test 'facilitator specific submit for 1-day academic redirects to post for day 1' do
      setup_academic_year_workshop
      sign_in @enrolled_academic_year_teacher

      assert_creates Pd::WorkshopFacilitatorDailySurvey do
        post '/pd/workshop_survey/facilitators/submit',
          params: facilitator_submit_redirect_params(
            day: 1,
            user: @enrolled_academic_year_teacher,
            workshop: @academic_year_workshop,
            facilitator_index: 1
          ).deep_merge(
            submission_id: FAKE_SUBMISSION_ID,
            key: {
              userId: @enrolled_academic_year_teacher.id,
              sessionId: @academic_year_workshop.sessions[0].id
            }
          )

        assert_redirected_to action: :new_post, enrollment_code: @academic_year_enrollment.code
      end

      new_record = Pd::WorkshopFacilitatorDailySurvey.last
      assert new_record.placeholder?
      assert_equal @academic_year_workshop, new_record.pd_workshop
      assert_equal 1, new_record.day
      assert_equal @facilitators[1], new_record.facilitator
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

    test 'post workshop for summer submit redirect creates a placeholder and redirects to thanks' do
      setup_summer_workshop
      sign_in @enrolled_summer_teacher

      assert_creates Pd::WorkshopDailySurvey do
        post '/pd/workshop_survey/submit',
          params: general_submit_redirect_params(day: 5).merge(
            submission_id: FAKE_SUBMISSION_ID,
          )

        assert_redirected_to action: :new_facilitator, session_id: @summer_workshop.sessions[4].id, facilitator_index: 0
      end

      new_record = Pd::WorkshopDailySurvey.last
      assert new_record.placeholder?
      assert_equal @summer_workshop, new_record.pd_workshop
      assert_equal 5, new_record.day
    end

    test 'post workshop submit redirects to thanks academic year workshops' do
      setup_academic_year_workshop
      sign_in @enrolled_academic_year_teacher

      assert_creates Pd::WorkshopDailySurvey do
        params = general_submit_redirect_params(
          day: 1,
          user: @enrolled_academic_year_teacher,
          workshop: @academic_year_workshop,
          enrollment_code: @academic_year_enrollment.code
        ).merge submission_id: FAKE_SUBMISSION_ID

        params[:key][:formId] = FAKE_ACADEMIC_YEAR_IDS[1]
        post '/pd/workshop_survey/submit', params: params

        assert_redirected_to action: :thanks
      end

      new_record = Pd::WorkshopDailySurvey.last
      assert new_record.placeholder?
      assert_equal @academic_year_workshop, new_record.pd_workshop
      assert_equal 1, new_record.day
      assert_equal FAKE_ACADEMIC_YEAR_IDS[1], new_record.form_id
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

    def unenrolled_teacher
      create :teacher
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

    def general_submit_redirect(day:, user: @enrolled_summer_teacher, workshop: @summer_workshop, enrollment_code: nil)
      url_for(controller: 'pd/workshop_daily_survey', action: 'submit_general',
        params: general_submit_redirect_params(day: day, user: user, workshop: workshop, enrollment_code: enrollment_code)
      )
    end

    def general_submit_redirect_params(day:, user: @enrolled_summer_teacher, workshop: @summer_workshop, enrollment_code: nil)
      params = {
        key: {
          environment: 'test',
          userId: user.id,
          workshopId: workshop.id,
          day: day,
          formId: workshop.summer? ? FAKE_DAILY_FORM_IDS[day] : FAKE_ACADEMIC_YEAR_IDS[day - 1],
          sessionId: day == 0 ? nil : workshop.sessions[day - 1].id
        }
      }

      params[:key][:enrollmentCode] = enrollment_code if enrollment_code

      params
    end

    def facilitator_submit_redirect(day:, facilitator_index:)
      url_for(controller: 'pd/workshop_daily_survey', action: 'submit_facilitator',
        params: facilitator_submit_redirect_params(day: day, facilitator_index: facilitator_index)
      )
    end

    def facilitator_submit_redirect_params(day:, user: @enrolled_summer_teacher, workshop: @summer_workshop, facilitator_index:)
      {
        key: {
          environment: 'test',
          userId: user.id,
          sessionId: workshop.sessions[day - 1].id,
          day: day,
          facilitatorId: workshop.facilitators.order(:name, :id)[facilitator_index].id,
          facilitatorIndex: facilitator_index,
          formId: FAKE_FACILITATOR_FORM_ID,
        }
      }
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
