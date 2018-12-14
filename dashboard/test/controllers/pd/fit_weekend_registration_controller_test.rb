require 'test_helper'

class Pd::FitWeekendRegistrationControllerTest < ::ActionController::TestCase
  include Pd::Application::ActiveApplicationModels

  test 'destroy deletes registration' do
    application = create FACILITATOR_APPLICATION_FACTORY
    create FIT_WEEKEND_REGISTRATION_FACTORY, pd_application: application
    workshop_admin = create :workshop_admin
    sign_in workshop_admin

    assert_destroys(FIT_WEEKEND_REGISTRATION_CLASS) do
      delete :destroy, params: {application_guid: application.application_guid}
    end
  end
end
