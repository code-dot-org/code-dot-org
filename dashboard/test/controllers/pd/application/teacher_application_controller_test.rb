require 'test_helper'

module Pd::Application
  class TeacherApplicationControllerTest < ::ActionController::TestCase
    include Pd::Application::ActiveApplicationModels

    test 'logged out users see the logged-out message' do
      get :new
      assert_response :success
      assert_template :logged_out
    end

    test 'students see the not-teacher message' do
      sign_in create :student
      get :new
      assert_response :success
      assert_template :not_teacher
    end

    test 'teachers without email see the no-teacher-email message' do
      sign_in create :teacher, :without_email
      get :new
      assert_response :success
      assert_template :no_teacher_email
    end

    test 'teachers with an incomplete application see the in-progress message' do
      application = create :pd_teacher_application, :incomplete
      sign_in application.user
      get :new
      assert_response :success
      assert_template :in_progress
    end

    test 'teachers with a submitted application see the submitted message' do
      application = create :pd_teacher_application
      sign_in application.user
      get :new
      assert_response :success
      assert_template :submitted
    end
  end
end
