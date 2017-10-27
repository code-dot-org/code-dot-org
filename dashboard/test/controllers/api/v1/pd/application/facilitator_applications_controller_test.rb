require 'test_helper'

module Api::V1::Pd::Application
  class FacilitatorApplicationsControllerTest < ::ActionController::TestCase
    setup_all do
      @test_params = {
        form_data: build(:pd_facilitator1819_application_hash)
      }
    end

    setup do
      Pd::Application::Facilitator1819ApplicationMailer.stubs(:confirmation).returns(
        mock {|mail| mail.stubs(:deliver_now)}
      )
    end

    test_redirect_to_sign_in_for :create
    test_user_gets_response_for :create, user: :student, params: -> {@test_params}, response: :forbidden
    test_user_gets_response_for :create, user: :teacher, params: -> {@test_params}, response: :success

    test 'sends confirmation mail on successful create' do
      Pd::Application::Facilitator1819ApplicationMailer.expects(:confirmation).returns(
        mock {|mail| mail.expects(:deliver_now)}
      )
      sign_in create(:teacher)

      put :create, params: @test_params
      assert_response :success
    end

    test 'does not send confirmation mail on unsuccessful create' do
      Pd::Application::Facilitator1819ApplicationMailer.expects(:confirmation).never
      sign_in create(:teacher)

      put :create, params: {form_data: {firstName: ''}}
      assert_response :bad_request
    end
  end
end
