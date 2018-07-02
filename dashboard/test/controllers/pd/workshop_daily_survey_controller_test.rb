require 'test_helper'

module Pd
  class WorkshopDailySurveyControllerTest < ActionDispatch::IntegrationTest
    include WorkshopConstants

    test 'new_general' do
      teacher = create :teacher
      workshop = create :pd_workshop, course: COURSE_CSP, subject: SUBJECT_TEACHER_CON
      create :pd_enrollment, :from_user, user: teacher, workshop: workshop

      sign_in teacher
      get '/pd/workshop_survey/day/0'
      assert_response :success
    end
  end
end
