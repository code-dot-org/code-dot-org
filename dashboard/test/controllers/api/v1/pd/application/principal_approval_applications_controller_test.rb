require 'test_helper'

module Api::V1::Pd::Application
  class PrincipalApprovalApplicationsControllerTest < ::ActionController::TestCase
    test 'Updates user and application_guid upon submit' do
      principal = create :teacher
      sign_in(principal)

      assert_creates(Pd::Application::PrincipalApproval1819Application) do
        put :create, params: {
          form_data: build(:pd_principal_approval1819_application_hash),
          application_guid: 'guid'
        }
      end

      application = Pd::Application::PrincipalApproval1819Application.find_by(application_guid: 'guid')
      assert_equal principal, application.user
    end
  end
end
