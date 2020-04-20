require 'test_helper'

class ContactRollupsRawTest < ActiveSupport::TestCase
  test 'extract_email_preferences creates records as we would expect' do
    email_preference = create :email_preference
    ContactRollupsRaw.extract_from_table('email_preferences', ['opt_in'], 'email')

    expected_data = {opt_in: email_preference.opt_in ? 1 : 0}
    result = ContactRollupsRaw.find_by(
      email: email_preference.email,
      sources: "dashboard.#{email_preference.class.table_name}"
    )

    assert_equal expected_data, result.data.symbolize_keys
  end

  test 'extract_from_table can import many email preferences' do
    3.times {|i| create :email_preference, email: "contact_#{i}@rollups.com"}
    ContactRollupsRaw.extract_from_table('email_preferences', ['opt_in'], 'email')
    assert 3, ContactRollupsRaw.count
  end

  test 'extract_from_table can import when data column is null' do
    teacher = create :teacher

    ContactRollupsRaw.extract_from_table('users', [], 'email')
    refute_nil ContactRollupsRaw.find_by(email: teacher.email, data: nil, sources: 'dashboard.users')
  end

  test 'extract_from_table_query works when called with a single column' do
    expected_sql = <<~SQL
      INSERT INTO #{ContactRollupsRaw.table_name} (email, sources, data, data_updated_at, created_at, updated_at)
      SELECT
        email,
        'dashboard.email_preferences' AS sources,
        JSON_OBJECT('opt_in', opt_in) AS data,
        email_preferences.updated_at AS data_updated_at,
        NOW() AS created_at,
        NOW() AS updated_at
      FROM email_preferences
      WHERE email IS NOT NULL AND email != ''
    SQL

    assert_equal expected_sql, ContactRollupsRaw.extract_from_table_query('email_preferences', ['opt_in'], 'email')
  end

  test 'extract_columns_into_mysql_json works when called with single column' do
    assert_equal "JSON_OBJECT('test', test)", ContactRollupsRaw.extract_columns_into_mysql_json(['test'])
  end

  test 'extract_columns_into_mysql_json works when called with multiple columns' do
    assert_equal "JSON_OBJECT('age', age, 'name', name, 'email', email)",
      ContactRollupsRaw.extract_columns_into_mysql_json(%w(age name email))
  end
end
