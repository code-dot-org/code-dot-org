require 'test_helper'

class ContactRollupsRawTest < ActiveSupport::TestCase
  test 'extract_email_preferences creates records as we would expect' do
    email_preference = create :email_preference
    ContactRollupsRaw.extract_email_preferences

    # Actual value stored in database is 1/0 instead of true/false
    expected_data = {opt_in: email_preference.opt_in ? 1 : 0}
    result = ContactRollupsRaw.find_by(
      email: email_preference.email,
      sources: "#{CDO.dashboard_db_name}.email_preferences"
    )

    assert_equal expected_data, result.data.symbolize_keys
  end

  test 'extract_parent_email creates records as we would expect' do
    student = create :student, parent_email: 'caring@parent.com'
    ContactRollupsRaw.extract_parent_emails

    # confirms that a) record exists, and b) data is blank
    refute_nil ContactRollupsRaw.find_by(
      email: student.parent_email,
      sources: "#{CDO.dashboard_db_name}.users.parent_email",
      data: nil
    )
  end

  test 'extract_email_preferences can import many email preferences' do
    3.times {|i| create :email_preference, email: "contact_#{i}@rollups.com"}
    ContactRollupsRaw.extract_email_preferences
    assert 3, ContactRollupsRaw.count
  end

  test 'get_extraction_query can import when data column is null' do
    teacher = create :teacher

    query = ContactRollupsRaw.get_extraction_query('users', false, [], 'email')
    ActiveRecord::Base.connection.execute(query)

    refute_nil ContactRollupsRaw.find_by(email: teacher.email, data: nil, sources: "#{CDO.dashboard_db_name}.users")
  end

  test 'get_extraction_query can import when source is a subquery' do
    first_child = create :student, parent_email: 'caring@parent.com'
    second_child = create :student, parent_email: 'caring@parent.com'

    # we're not actually interested in user IDs in contact rollups
    # just a simple example of something we could extract in a subquery
    subquery = <<~SQL
      SELECT parent_email, max(updated_at) as updated_at, max(id) as higher_student_id
      FROM users
      GROUP BY 1
    SQL

    query = ContactRollupsRaw.get_extraction_query(subquery, true, ['higher_student_id'], 'parent_email', "#{CDO.dashboard_db_name}.users.id")
    ActiveRecord::Base.connection.execute(query)

    refute_empty ContactRollupsRaw.where(
      "email = :email and data->'$.higher_student_id' = :higher_student_id and sources = :sources",
      email: first_child.parent_email,
      sources: "#{CDO.dashboard_db_name}.users.id",
      higher_student_id: second_child.id
    )
  end

  test 'get_extraction_query looks as expected when called with a single column' do
    expected_sql = <<~SQL
      INSERT INTO #{ContactRollupsRaw.table_name} (email, sources, data, data_updated_at, created_at, updated_at)
      SELECT
        email,
        '#{CDO.dashboard_db_name}.email_preferences' AS sources,
        JSON_OBJECT('opt_in',opt_in) AS data,
        updated_at AS data_updated_at,
        NOW() AS created_at,
        NOW() AS updated_at
      FROM email_preferences
      WHERE email IS NOT NULL AND email != ''
    SQL

    assert_equal expected_sql, ContactRollupsRaw.get_extraction_query('email_preferences', false, ['opt_in'], 'email')
  end

  test 'get_extraction_query looks as expected when called with multiple columns' do
    expected_sql = <<~SQL
      INSERT INTO #{ContactRollupsRaw.table_name} (email, sources, data, data_updated_at, created_at, updated_at)
      SELECT
        parent_email,
        '#{CDO.dashboard_db_name}.users' AS sources,
        JSON_OBJECT('birthday',birthday,'gender',gender) AS data,
        updated_at AS data_updated_at,
        NOW() AS created_at,
        NOW() AS updated_at
      FROM users
      WHERE parent_email IS NOT NULL AND parent_email != ''
    SQL

    assert_equal expected_sql, ContactRollupsRaw.get_extraction_query('users', false, ['birthday', 'gender'], 'parent_email')
  end

  test 'create_json_object looks as expected when called with single column' do
    assert_equal "JSON_OBJECT('test',test)", ContactRollupsRaw.create_json_object(['test'])
  end

  test 'create_json_object looks as expected when called with multiple columns' do
    assert_equal "JSON_OBJECT('age',age,'name',name,'email',email)",
      ContactRollupsRaw.create_json_object(%w(age name email))
  end
end
