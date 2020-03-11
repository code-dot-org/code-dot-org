require 'test_helper'

class ContactRollupsRawTest < ActiveSupport::TestCase
  test 'extract_email_preferences creates records as we would expect' do
    email_preference = create :email_preference
    ContactRollupsRaw.extract_email_preferences

    expected_data = {opt_in: email_preference.opt_in}
    result = ContactRollupsRaw.find_by(
      email: email_preference.email,
      sources: "dashboard.#{email_preference.class.table_name}"
    )

    assert_equal expected_data, result.data.symbolize_keys
  end

  test 'extract_email_preferences can import many email preferences' do
    3.times {|i| create :email_preference, email: "contact_#{i}@rollups.com"}
    ContactRollupsRaw.extract_email_preferences
    assert 3, ContactRollupsRaw.count
  end
end
