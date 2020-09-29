require 'test_helper'

class ContactRollupsRawTest < ActiveSupport::TestCase
  test 'extract_email_preferences creates records as we would expect' do
    email_preference = create :email_preference
    ContactRollupsRaw.extract_email_preferences

    # Actual value stored in database is 1/0 instead of true/false
    expected_data = {opt_in: email_preference.opt_in ? 1 : 0}
    result = ContactRollupsRaw.find_by(
      email: email_preference.email,
      sources: 'dashboard.email_preferences'
    )

    assert_equal expected_data, result.data.symbolize_keys
  end

  test 'extract_email_preferences can import many email preferences' do
    3.times {|i| create :email_preference, email: "contact_#{i}@rollups.com"}
    ContactRollupsRaw.extract_email_preferences
    assert 3, ContactRollupsRaw.count
  end

  test 'extract_parent_email creates records as we would expect' do
    student = create :student, parent_email: 'caring@parent.com'
    ContactRollupsRaw.extract_parent_emails

    result = ContactRollupsRaw.find_by(
      email: student.parent_email,
      sources: 'dashboard.users',
    )
    refute_nil result
    assert_equal({'is_parent' => 1}, result.data)
  end

  test 'extract_pd_enrollments teacher with multiple enrollments' do
    teacher = create :teacher
    csf_workshop = create :workshop, course: Pd::Workshop::COURSE_CSF
    csd_workshop = create :workshop, course: Pd::Workshop::COURSE_CSD
    create :pd_enrollment, email: teacher.email, workshop: csf_workshop
    create :pd_enrollment, email: teacher.email, workshop: csd_workshop

    refute ContactRollupsRaw.find_by_email(teacher.email)
    ContactRollupsRaw.extract_pd_enrollments

    records = ContactRollupsRaw.where(email: teacher.email)
    assert_equal 2, records.count
    courses = records.map {|record| record[:data]['course']}.sort
    assert_equal [Pd::Workshop::COURSE_CSD, Pd::Workshop::COURSE_CSF], courses
  end

  test 'get_extraction_query can import when no data column is given' do
    email_preference = create :email_preference

    select_query = 'SELECT email, updated_at from email_preferences'
    query = ContactRollupsRaw.get_extraction_query('dashboard.email_preferences', select_query)
    ActiveRecord::Base.connection.execute(query)

    refute_nil ContactRollupsRaw.find_by(email: email_preference.email, data: nil, sources: 'dashboard.email_preferences')
  end

  test 'get_extraction_query can import when source is a subquery' do
    first_child = create :student, parent_email: 'caring@parent.com'
    second_child = create :student, parent_email: 'caring@parent.com'

    # we're not actually interested in user IDs in contact rollups
    # just a simple example of something we could extract in a subquery
    subquery = <<~SQL
      SELECT parent_email AS email, MAX(updated_at) AS updated_at, MAX(id) AS higher_student_id
      FROM users
      GROUP BY parent_email
    SQL

    source_name = 'dashboard.users'
    query = ContactRollupsRaw.get_extraction_query(source_name, subquery, 'higher_student_id')
    ActiveRecord::Base.connection.execute(query)

    refute_empty ContactRollupsRaw.where(
      "email = :email and data->'$.higher_student_id' = :higher_student_id and sources = :sources",
      email: first_child.parent_email,
      sources: source_name,
      higher_student_id: second_child.id
    )
  end

  test 'get_extraction_query looks as expected when called with a single column' do
    select_query = 'SELECT email, opt_in, updated_at FROM email_preferences'
    expected_sql = <<~SQL
      INSERT INTO #{ContactRollupsRaw.table_name}
        (email, sources, data, data_updated_at, created_at, updated_at)
      SELECT
        email,
        'dashboard.email_preferences' AS sources,
        JSON_OBJECT('opt_in',opt_in) AS data,
        updated_at AS data_updated_at,
        NOW() AS created_at,
        NOW() AS updated_at
      FROM (#{select_query}) AS subquery
      WHERE email > ''
    SQL

    assert_equal expected_sql, ContactRollupsRaw.get_extraction_query('dashboard.email_preferences', select_query, 'opt_in')
  end

  test 'get_extraction_query looks as expected when called with multiple columns' do
    select_query = 'SELECT email, birthday, gender, updated_at FROM users'
    expected_sql = <<~SQL
      INSERT INTO #{ContactRollupsRaw.table_name}
        (email, sources, data, data_updated_at, created_at, updated_at)
      SELECT
        email,
        'dashboard.users' AS sources,
        JSON_OBJECT('birthday',birthday,'gender',gender) AS data,
        updated_at AS data_updated_at,
        NOW() AS created_at,
        NOW() AS updated_at
      FROM (#{select_query}) AS subquery
      WHERE email > ''
    SQL

    assert_equal expected_sql, ContactRollupsRaw.get_extraction_query('dashboard.users', select_query, 'birthday', 'gender')
  end

  test 'create_json_object looks as expected when called with single column' do
    assert_equal "JSON_OBJECT('test',test)", ContactRollupsRaw.create_json_object(['test'])
  end

  test 'create_json_object looks as expected when called with multiple columns' do
    assert_equal "JSON_OBJECT('age',age,'name',name,'email',email)",
      ContactRollupsRaw.create_json_object(%w(age name email))
  end
end
