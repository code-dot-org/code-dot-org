require 'test_helper'

class Pd::RegionalPartnerProgramRegistrationTest < ActiveSupport::TestCase
  test 'required fields are optional for deleted users' do
    registration = create :pd_regional_partner_program_registration
    user.destroy!
    registration.clear_data
    assert registration.valid?
  end
end
