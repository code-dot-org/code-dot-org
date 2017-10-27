require 'test_helper'

module Api::V1::Pd
  class ApplicationsControllerTest < ::ActionController::TestCase
    setup_all do
      application = create :pd_facilitator1819_application
      @test_show_params = {
        id: application.id
      }
      @test_update_params = {
        application: {
          notes: 'Notes!'
        },
        id: application.id
      }
      @test_quick_view_params = {
        role: 'csf_facilitators'
      }
    end

    test_redirect_to_sign_in_for :index
    test_redirect_to_sign_in_for :show, params: -> {@test_show_params}
    test_redirect_to_sign_in_for :update, params: -> {@test_update_params}
    test_redirect_to_sign_in_for :quick_view, params: -> {@test_quick_view_params}

    [:student, :teacher, :facilitator, :workshop_admin].each do |user|
      test_user_gets_response_for :index, user: user, response: user == :workshop_admin ? :success : :forbidden
      test_user_gets_response_for :show, params: -> {@test_show_params}, user: user, response: user == :workshop_admin ? :success : :forbidden
      test_user_gets_response_for :update, params: -> {@test_update_params}, user: user, response: user == :workshop_admin ? :success : :forbidden
      test_user_gets_response_for :quick_view, params: -> {@test_quick_view_params}, user: user, response: user == :workshop_admin ? :success : :forbidden
    end

    test "quick view returns appropriate application type" do
      create :pd_facilitator1819_application, course: 'csf'
      create :pd_facilitator1819_application, course: 'csp'
      user = create :workshop_admin
      sign_in user

      get :quick_view, params: @test_quick_view_params
      assert_response :success
      assert_equal Pd::Application::Facilitator1819Application.csf.count, JSON.parse(@response.body).length
    end
  end
end
