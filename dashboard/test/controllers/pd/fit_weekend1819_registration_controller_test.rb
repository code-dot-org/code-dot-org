require 'test_helper'

class Pd::FitWeekend1819RegistrationControllerTest < ::ActionController::TestCase
  test 'destroy deletes registration' do
    application = create :pd_facilitator1819_application
    create :pd_fit_weekend1819_registration, pd_application: application
    workshop_admin = create :workshop_admin
    sign_in workshop_admin

    assert_destroys(Pd::FitWeekend1819Registration) do
      delete :destroy, params: {application_guid: application.application_guid}
    end
  end
end
