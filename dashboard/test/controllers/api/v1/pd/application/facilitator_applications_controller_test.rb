require 'test_helper'

module Api::V1::Pd::Application
  class FacilitatorApplicationsControllerTest < ::ActionController::TestCase
    self.use_transactional_test_case = true

    include Pd::Application::ActiveApplicationModels
    setup_all do
      @test_params = {
        form_data: build(FACILITATOR_APPLICATION_HASH_FACTORY)
      }

      @applicant = create :teacher
    end

    setup do
      Pd::Application::FacilitatorApplicationMailer.stubs(:confirmation).returns(
        mock {|mail| mail.stubs(:deliver_now)}
      )
    end

    test_redirect_to_sign_in_for :create
    test_user_gets_response_for :create, user: :student, params: -> {@test_params}, response: :forbidden
    test_user_gets_response_for :create, user: :teacher, params: -> {@test_params}, response: :success

    test 'sends confirmation mail on successful create' do
      Pd::Application::FacilitatorApplicationMailer.expects(:confirmation).returns(
        mock {|mail| mail.expects(:deliver_now)}
      )
      sign_in @applicant

      put :create, params: @test_params
      assert_response :success
    end

    test 'does not send confirmation mail on unsuccessful create' do
      Pd::Application::FacilitatorApplicationMailer.expects(:confirmation).never
      sign_in @applicant

      put :create, params: {form_data: {firstName: ''}}
      assert_response :bad_request
    end

    test 'submit is idempotent' do
      create FACILITATOR_APPLICATION_FACTORY, user: @applicant

      sign_in @applicant
      assert_no_difference 'Pd::Application::Facilitator1920Application.count' do
        put :create, params: @test_params
      end
      assert_response :success
    end
  end
end
