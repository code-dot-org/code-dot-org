require 'test_helper'

module Api::V1::Pd
  class ApplicationsControllerTest < ::ActionController::TestCase
    setup_all do
      application = create :pd_facilitator1819_application
      @test_params = {
        id: application.id
      }
    end

    test_redirect_to_sign_in_for :index
    test_user_gets_response_for :index, user: :student, response: :forbidden
    test_user_gets_response_for :index, user: :teacher, response: :forbidden
    test_user_gets_response_for :index, user: :workshop_admin, response: :success

    test_redirect_to_sign_in_for :show, params: -> {@test_params}
    test_user_gets_response_for :show, user: :student, params: -> {@test_params}, response: :forbidden
    test_user_gets_response_for :show, user: :teacher, params: -> {@test_params}, response: :forbidden
    test_user_gets_response_for :show, user: :workshop_admin, params: -> {@test_params}, response: :success
  end
end
