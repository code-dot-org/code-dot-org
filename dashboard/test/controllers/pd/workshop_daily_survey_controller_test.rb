require 'test_helper'

module Pd
  class WorkshopDailySurveyControllerTest < ActionDispatch::IntegrationTest
    include WorkshopConstants

    self.use_transactional_test_case = true
    setup_all do
      @unenrolled_teacher = create :teacher
      @enrolled_teacher = create :teacher
      @regional_partner = create :regional_partner
      @facilitators = create_list :facilitator, 2
      @workshop = create :pd_workshop, course: COURSE_CSP, subject: SUBJECT_TEACHER_CON,
        num_sessions: 5, regional_partner: @regional_partner, facilitators: @facilitators
      @enrollment = create :pd_enrollment, :from_user, user: @enrolled_teacher, workshop: @workshop
    end

    # Array of ids for days 0 (pre) and 1 - 5
    FAKE_DAILY_FORM_IDS = (123450..123455).to_a.freeze
    FAKE_FACILITATOR_FORM_ID = 123459
    FAKE_SUBMISSION_ID = 987654

    setup do
      CDO.stubs(:jotform_forms).returns(
        {
          local: {
            day_0: FAKE_DAILY_FORM_IDS[0],
            day_1: FAKE_DAILY_FORM_IDS[1],
            day_5: FAKE_DAILY_FORM_IDS[5],
            facilitator: FAKE_FACILITATOR_FORM_ID
          }
        }.deep_stringify_keys
      )
    end

    test 'daily workshop survey returns 404 for days outside of range 0-4' do
      sign_in @enrolled_teacher
      get '/pd/workshop_survey/day/-1'
      assert_response :not_found

      get '/pd/workshop_survey/day/5'
      assert_response :not_found
    end

    test 'pre-workshop survey displays not enrolled message when not enrolled' do
      sign_in @unenrolled_teacher
      get '/pd/workshop_survey/day/0'
      assert_response :success
      assert_not_enrolled
    end

    test 'pre-workshop survey redirects to thanks when a response exists' do
      create :pd_workshop_daily_survey, pd_workshop: @workshop, user: @enrolled_teacher,
        day: 0, form_id: FAKE_DAILY_FORM_IDS[0]

      sign_in @enrolled_teacher
      get '/pd/workshop_survey/day/0'
      assert_redirected_to action: 'thanks'
    end

    test 'pre-workshop survey displays embedded JotForm when enrolled' do
      submit_redirect = general_submit_redirect(day: 0)
      assert_equal '/pd/workshop_survey/submit', URI.parse(submit_redirect).path

      WorkshopDailySurveyController.view_context_class.any_instance.expects(:embed_jotform).with(
        FAKE_DAILY_FORM_IDS[0],
        {
          environment: 'test',
          userId: @enrolled_teacher.id,
          workshopId: @workshop.id,
          day: 0,
          formId: FAKE_DAILY_FORM_IDS[0],
          sessionId: nil,
          userName: @enrolled_teacher.name,
          userEmail: @enrolled_teacher.email,
          workshopCourse: COURSE_CSP,
          workshopSubject: SUBJECT_TEACHER_CON,
          regionalPartnerName: @regional_partner.name,
          submitRedirect: submit_redirect
        }
      )

      sign_in @enrolled_teacher
      get '/pd/workshop_survey/day/0'
      assert_response :success
    end

    test 'pre-workshop submit redirect creates a placeholder and redirects to thanks' do
      sign_in @enrolled_teacher

      assert_creates Pd::WorkshopDailySurvey do
        post '/pd/workshop_survey/submit',
          params: general_submit_redirect_params(day: 0).merge(
            submission_id: FAKE_SUBMISSION_ID,
          )

        assert_redirected_to action: 'thanks'
      end

      new_record = Pd::WorkshopDailySurvey.last
      assert new_record.placeholder?
      assert_equal @workshop, new_record.pd_workshop
      assert_equal 0, new_record.day
    end

    test 'daily workshop survey displays not enrolled message when not enrolled' do
      sign_in @unenrolled_teacher
      get '/pd/workshop_survey/day/1'
      assert_response :success
      assert_not_enrolled
    end

    test 'daily workshop survey displays closed message when session attendance is closed' do
      Session.any_instance.expects(:open_for_attendance?).returns(false)

      sign_in @enrolled_teacher
      get '/pd/workshop_survey/day/1'
      assert_response :success
      assert_closed
    end

    test 'daily workshop survey displays no attendance message when session is open but not attended' do
      Session.any_instance.expects(:open_for_attendance?).returns(true)

      sign_in @enrolled_teacher
      get '/pd/workshop_survey/day/1'
      assert_response :success
      assert_no_attendance
    end

    test 'daily workshop survey redirects to first facilitator form when a response exists' do
      Session.any_instance.expects(:open_for_attendance?).returns(true)
      create :pd_attendance, session: @workshop.sessions[0], teacher: @enrolled_teacher, enrollment: @enrollment
      create :pd_workshop_daily_survey, pd_workshop: @workshop, user: @enrolled_teacher,
        day: 1, form_id: FAKE_DAILY_FORM_IDS[1], pd_session: @workshop.sessions[0]

      sign_in @enrolled_teacher
      get '/pd/workshop_survey/day/1'
      assert_redirected_to action: :new_facilitator, session_id: @workshop.sessions[0].id, facilitator_index: 0
    end

    test 'daily workshop survey with open session attendance displays embedded JotForm' do
      Session.any_instance.expects(:open_for_attendance?).returns(true)
      create :pd_attendance, session: @workshop.sessions[0], teacher: @enrolled_teacher, enrollment: @enrollment

      submit_redirect = general_submit_redirect(day: 1)
      assert_equal '/pd/workshop_survey/submit', URI.parse(submit_redirect).path

      WorkshopDailySurveyController.view_context_class.any_instance.expects(:embed_jotform).with(
        FAKE_DAILY_FORM_IDS[1],
        {
          environment: 'test',
          userId: @enrolled_teacher.id,
          workshopId: @workshop.id,
          day: 1,
          formId: FAKE_DAILY_FORM_IDS[1],
          sessionId: @workshop.sessions[0].id,
          userName: @enrolled_teacher.name,
          userEmail: @enrolled_teacher.email,
          workshopCourse: COURSE_CSP,
          workshopSubject: SUBJECT_TEACHER_CON,
          regionalPartnerName: @regional_partner.name,
          submitRedirect: submit_redirect
        }
      )

      sign_in @enrolled_teacher
      get '/pd/workshop_survey/day/1'
      assert_response :success
    end

    test 'daily workshop submit redirect creates placeholder and redirects to first facilitator form' do
      sign_in @enrolled_teacher

      assert_creates Pd::WorkshopDailySurvey do
        post '/pd/workshop_survey/submit',
          params: general_submit_redirect_params(day: 1).merge(
            submission_id: FAKE_SUBMISSION_ID,
          )

        assert_redirected_to action: :new_facilitator, session_id: @workshop.sessions[0].id, facilitator_index: 0
      end

      new_record = Pd::WorkshopDailySurvey.last
      assert new_record.placeholder?
      assert_equal @workshop, new_record.pd_workshop
      assert_equal 1, new_record.day
    end

    test 'facilitator specific survey displays closed message when session attendance is closed' do
      Session.any_instance.expects(:open_for_attendance?).returns(false)

      sign_in @enrolled_teacher
      get "/pd/workshop_survey/facilitators/#{@workshop.sessions[0].id}/0"
      assert_response :success
      assert_closed
    end

    test 'facilitator specific survey displays no attendance message when session is open but not attended' do
      Session.any_instance.expects(:open_for_attendance?).returns(true)

      sign_in @enrolled_teacher
      get "/pd/workshop_survey/facilitators/#{@workshop.sessions[0].id}/0"
      assert_response :success
      assert_no_attendance
    end

    # TODO(Andrew): we can remove this test and the relevant code once the new submit logic is in the forms.
    # Once we don't intentionally use this route, it should render 404
    test 'facilitator specific survey redirects to thanks after the last facilitator' do
      Session.any_instance.expects(:open_for_attendance?).returns(true)
      create :pd_attendance, session: @workshop.sessions[0], teacher: @enrolled_teacher, enrollment: @enrollment

      sign_in @enrolled_teacher
      # With only 2 facilitators, index 2 is out of bounds and should display thanks.
      get "/pd/workshop_survey/facilitators/#{@workshop.sessions[0].id}/2"
      assert_redirected_to '/pd/workshop_survey/thanks'
    end

    test 'facilitator specific survey redirects to next facilitator when response exists' do
      Session.any_instance.expects(:open_for_attendance?).returns(true)
      create :pd_attendance, session: @workshop.sessions[0], teacher: @enrolled_teacher, enrollment: @enrollment
      create :pd_workshop_facilitator_daily_survey, pd_workshop: @workshop, user: @enrolled_teacher,
        day: 1, form_id: FAKE_FACILITATOR_FORM_ID, pd_session: @workshop.sessions[0], facilitator: @facilitators[0]

      sign_in @enrolled_teacher
      get "/pd/workshop_survey/facilitators/#{@workshop.sessions[0].id}/0"
      assert_redirected_to action: :new_facilitator, session_id: @workshop.sessions[0].id, facilitator_index: 1
    end

    test 'last facilitator specific survey redirects to thanks when response exists' do
      Session.any_instance.expects(:open_for_attendance?).returns(true)
      create :pd_attendance, session: @workshop.sessions[0], teacher: @enrolled_teacher, enrollment: @enrollment
      create :pd_workshop_facilitator_daily_survey, pd_workshop: @workshop, user: @enrolled_teacher,
        day: 1, form_id: FAKE_FACILITATOR_FORM_ID, pd_session: @workshop.sessions[0], facilitator: @facilitators[1]

      sign_in @enrolled_teacher
      get "/pd/workshop_survey/facilitators/#{@workshop.sessions[0].id}/1"
      assert_redirected_to '/pd/workshop_survey/thanks'
    end

    test 'facilitator specific survey with open session attendance displays embedded JotForm' do
      Session.any_instance.expects(:open_for_attendance?).returns(true)
      create :pd_attendance, session: @workshop.sessions[0], teacher: @enrolled_teacher, enrollment: @enrollment

      submit_redirect = facilitator_submit_redirect(day: 1, facilitator_index: 0)
      assert_equal '/pd/workshop_survey/facilitators/submit', URI.parse(submit_redirect).path

      WorkshopDailySurveyController.view_context_class.any_instance.expects(:embed_jotform).with(
        FAKE_FACILITATOR_FORM_ID,
        {
          environment: 'test',
          userId: @enrolled_teacher.id,
          sessionId: @workshop.sessions[0].id,
          facilitatorId: @facilitators[0].id,
          facilitatorIndex: 0,
          formId: FAKE_FACILITATOR_FORM_ID,
          workshopId: @workshop.id,
          userName: @enrolled_teacher.name,
          userEmail: @enrolled_teacher.email,
          workshopCourse: COURSE_CSP,
          workshopSubject: SUBJECT_TEACHER_CON,
          regionalPartnerName: @regional_partner.name,
          day: 1,
          facilitatorPosition: 1,
          facilitatorName: @facilitators[0].name,
          numFacilitators: 2,
          submitRedirect: submit_redirect
        }
      )

      sign_in @enrolled_teacher
      get "/pd/workshop_survey/facilitators/#{@workshop.sessions[0].id}/0"
      assert_response :success
    end

    test 'facilitator specific submit redirect creates placeholder and redirects to next facilitator form' do
      sign_in @enrolled_teacher

      assert_creates Pd::WorkshopFacilitatorDailySurvey do
        post '/pd/workshop_survey/facilitators/submit',
          params: facilitator_submit_redirect_params(day: 1, facilitator_index: 0).merge(
            submission_id: FAKE_SUBMISSION_ID,
          )

        assert_redirected_to action: :new_facilitator, session_id: @workshop.sessions[0].id, facilitator_index: 1
      end

      new_record = Pd::WorkshopFacilitatorDailySurvey.last
      assert new_record.placeholder?
      assert_equal @workshop, new_record.pd_workshop
      assert_equal 1, new_record.day
      assert_equal @facilitators[0], new_record.facilitator
    end

    test 'facilitator specific submit redirect creates placeholder and redirects to thanks for last facilitator' do
      sign_in @enrolled_teacher

      assert_creates Pd::WorkshopFacilitatorDailySurvey do
        post '/pd/workshop_survey/facilitators/submit',
          params: facilitator_submit_redirect_params(day: 1, facilitator_index: 1).merge(
            submission_id: FAKE_SUBMISSION_ID,
          )

        assert_redirected_to action: :thanks
      end

      new_record = Pd::WorkshopFacilitatorDailySurvey.last
      assert new_record.placeholder?
      assert_equal @workshop, new_record.pd_workshop
      assert_equal 1, new_record.day
      assert_equal @facilitators[1], new_record.facilitator
    end

    test 'post workshop survey without a valid enrollment code renders 404' do
      sign_in @enrolled_teacher
      get '/pd/workshop_survey/post/invalid_enrollment_code'
      assert_response :not_found
    end

    test 'post workshop survey renders embedded JotForm' do
      create :pd_attendance, session: @workshop.sessions[4], teacher: @enrolled_teacher, enrollment: @enrollment

      submit_redirect = general_submit_redirect(day: 5)
      assert_equal '/pd/workshop_survey/submit', URI.parse(submit_redirect).path

      WorkshopDailySurveyController.view_context_class.any_instance.expects(:embed_jotform).with(
        FAKE_DAILY_FORM_IDS[5],
        {
          environment: 'test',
          userId: @enrolled_teacher.id,
          workshopId: @workshop.id,
          day: 5,
          formId: FAKE_DAILY_FORM_IDS[5],
          sessionId: @workshop.sessions[4].id,
          userName: @enrolled_teacher.name,
          userEmail: @enrolled_teacher.email,
          workshopCourse: COURSE_CSP,
          workshopSubject: SUBJECT_TEACHER_CON,
          regionalPartnerName: @regional_partner.name,
          submitRedirect: submit_redirect
        }
      )

      sign_in @enrolled_teacher
      get "/pd/workshop_survey/post/#{@enrollment.code}"
      assert_response :success
    end

    test 'post workshop submit redirect creates a placeholder and redirects to first facilitator form' do
      sign_in @enrolled_teacher

      assert_creates Pd::WorkshopDailySurvey do
        post '/pd/workshop_survey/submit',
          params: general_submit_redirect_params(day: 5).merge(
            submission_id: FAKE_SUBMISSION_ID,
          )

        assert_redirected_to action: :new_facilitator, session_id: @workshop.sessions[4].id, facilitator_index: 0
      end

      new_record = Pd::WorkshopDailySurvey.last
      assert new_record.placeholder?
      assert_equal @workshop, new_record.pd_workshop
      assert_equal 5, new_record.day
    end

    test 'thanks displays thanks message' do
      sign_in @enrolled_teacher
      get '/pd/workshop_survey/thanks'
      assert_response :success
      assert_select 'h1', text: 'Thank you for submitting today’s survey.'
    end

    private

    def assert_not_enrolled
      assert_select 'h1', text: 'Not Enrolled'
      assert_select 'p', text: 'You need to be enrolled in a 5-day summer workshop before completing this survey.'
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

    def general_submit_redirect(day:)
      url_for(controller: 'pd/workshop_daily_survey', action: 'submit_general',
        params: general_submit_redirect_params(day: day)
      )
    end

    def general_submit_redirect_params(day:)
      {
        key: {
          environment: 'test',
          userId: @enrolled_teacher.id,
          workshopId: @workshop.id,
          day: day,
          formId: FAKE_DAILY_FORM_IDS[day],
          sessionId: day == 0 ? nil : @workshop.sessions[day - 1].id
        }
      }
    end

    def facilitator_submit_redirect(day:, facilitator_index:)
      url_for(controller: 'pd/workshop_daily_survey', action: 'submit_facilitator',
        params: facilitator_submit_redirect_params(day: day, facilitator_index: facilitator_index)
      )
    end

    def facilitator_submit_redirect_params(day:, facilitator_index:)
      {
        key: {
          environment: 'test',
          userId: @enrolled_teacher.id,
          sessionId: @workshop.sessions[day - 1].id,
          day: day,
          facilitatorId: @facilitators[facilitator_index].id,
          facilitatorIndex: facilitator_index,
          formId: FAKE_FACILITATOR_FORM_ID,
        }
      }
    end
  end
end
