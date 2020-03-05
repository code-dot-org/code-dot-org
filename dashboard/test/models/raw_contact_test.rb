require 'test_helper'

class RawContactTest < ActiveSupport::TestCase
  test 'can create raw contact from email preference' do
    email_preference = create :email_preference
    raw_contact = {
      email: email_preference.email,
      sources: 'dashboard_production.email_preferences',
      data: {opt_in: email_preference.opt_in}.to_json,
      data_updated_at: email_preference.updated_at
    }
    assert RawContact.create raw_contact
  end
end
