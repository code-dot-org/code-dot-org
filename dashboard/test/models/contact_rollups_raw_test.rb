require 'test_helper'

class ContactRollupsRawTest < ActiveSupport::TestCase
  test 'truncate_table removes all rows' do
    create :email_preference
    assert_equal 1, EmailPreference.count

    ContactRollupsRaw.truncate_table
    assert_equal 0, EmailPreference.count
  end

  test 'extract_email_preferences adds all email preferences' do
    @email_preference = create :email_preference
    ContactRollupsRaw.extract_email_preferences
    assert ContactRollupsRaw.exists? email: @email_preference.email, sources: @email_preference.class.table_name
  end
end
