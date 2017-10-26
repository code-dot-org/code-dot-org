require 'test_helper'

module Api::V1::Pd::Application
  class FacilitatorApplicationsControllerTest < ::ActionController::TestCase
    setup_all do
      @test_params = {
        form_data: build(:pd_facilitator1819_application_hash)
      }
    end

    test_redirect_to_sign_in_for :create
    test_user_gets_response_for :create, user: :student, params: -> {@test_params}, response: :forbidden
    test_user_gets_response_for :create, user: :teacher, params: -> {@test_params}, response: :success
  end
end
