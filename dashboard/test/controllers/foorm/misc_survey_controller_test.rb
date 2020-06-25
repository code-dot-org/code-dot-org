require 'test_helper'

module Foorm
  class MiscSurveyControllerTest < ActionDispatch::IntegrationTest
    setup do
      @teacher = create :teacher
      @user = create :user
    end

    test 'renders foorm if teacher is logged in' do
      sign_in @teacher

      get '/form/csd_sample'
      assert_template :new
      assert_response :success
    end

    test 'renders not a teacher if user is not a teacher' do
      sign_in @user

      get '/form/csd_sample'
      assert_template :not_teacher
      assert_response :success
    end

    test 'renders logged out if not logged in' do
      get '/form/csd_sample'
      assert_template :logged_out
      assert_response :success
    end
  end
end
