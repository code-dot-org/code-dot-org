require 'test_helper'

module Pd::Application
  class PrincipalApprovalApplicationControllerTest < ::ActionController::TestCase
    test 'invalid guid goes to not_found page' do
      get :new, params: {application_guid: 'invalid_guid'}
      assert_redirected_to :not_found
    end

    test 'already completed principal application goes to submitted page' do
      Pd::Application::PrincipalApproval1819Application.create
    end

    test 'completed teacher application but no principal application goes to new page' do
    end
  end
end
