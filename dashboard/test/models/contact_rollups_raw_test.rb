require 'test_helper'

class ContactRollupsRawTest < ActiveSupport::TestCase
  test 'extract_email_preferences creates records as we would expect' do
    email_preference = create(:email_preference)
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
    3.times {|i| create(:email_preference, email: "contact_#{i}@rollups.com")}
    ContactRollupsRaw.extract_email_preferences
    assert 3, ContactRollupsRaw.count
  end

  test 'extract_parent_email creates records as we would expect' do
    student = create(:student, parent_email: 'caring@parent.com')
    ContactRollupsRaw.extract_parent_emails

    result = ContactRollupsRaw.find_by(
      email: student.parent_email,
      sources: 'dashboard.users',
    )
    refute_nil result
    assert_equal({'is_parent' => 1}, result.data)
  end

  test 'extract_pd_enrollments teacher with multiple enrollments' do
    teacher = create(:teacher)
    csf_workshop = build(:workshop, course: Pd::Workshop::COURSE_CSF)
    csf_workshop.save(validate: false)
    csd_workshop = create(:workshop, course: Pd::Workshop::COURSE_CSD)
    create(:pd_enrollment, email: teacher.email, workshop: csf_workshop)
    create(:pd_enrollment, email: teacher.email, workshop: csd_workshop)

    refute ContactRollupsRaw.find_by_email(teacher.email)
    ContactRollupsRaw.extract_pd_enrollments

    records = ContactRollupsRaw.where(email: teacher.email)
    assert_equal 2, records.count
    courses = records.map {|record| record[:data]['course']}.sort
    assert_equal [Pd::Workshop::COURSE_CSD, Pd::Workshop::COURSE_CSF], courses
  end

  test 'extract_sections_taught aggregates to one row per teacher' do
    teacher = create(:teacher)
    # Two sections in different CSD units (sections with a script must also
    # carry the script's unit group), plus one section assigned directly to
    # a csp-named course.
    2.times do
      csd_script = create(:csd_script)
      create(:unit_group_unit, unit_group: create(:unit_group), script: csd_script, position: 1)
      create(:section, user: teacher, script_id: csd_script.id)
    end
    create(:section, user: teacher, course_id: create(:unit_group, name: 'csp-2020').id)

    ContactRollupsRaw.extract_sections_taught

    records = ContactRollupsRaw.where(email: teacher.email, sources: 'dashboard.sections')
    assert_equal 1, records.count
    data = records.first.data
    assert_equal 'CSD', data['curriculum_umbrellas']
    assert_equal 'csp', data['course_name_prefixes']
  end

  test 'extract_sections_taught emits a row even without curriculum matches' do
    teacher = create(:teacher)
    # A script with no curriculum umbrella, in a course whose name matches
    # no curriculum prefix (the unit_group factory default).
    script = create(:script)
    create(:unit_group_unit, unit_group: create(:unit_group), script: script, position: 1)
    create(:section, user: teacher, script_id: script.id)

    ContactRollupsRaw.extract_sections_taught

    record = ContactRollupsRaw.find_by(email: teacher.email, sources: 'dashboard.sections')
    refute_nil record
    assert_nil record.data['curriculum_umbrellas']
    assert_nil record.data['course_name_prefixes']
  end

  test 'extract_users_and_geos takes only the latest geo record per user' do
    teacher = create(:teacher)
    base_time = Time.now.utc
    create(:user_geo, user: teacher, city: 'Old Town', state: 'Washington',
      updated_at: base_time - 2.days
)
    create(:user_geo, user: teacher, city: 'Newville', state: 'Oregon',
      updated_at: base_time
)

    ContactRollupsRaw.extract_users_and_geos

    records = ContactRollupsRaw.where(email: teacher.email, sources: 'dashboard.users')
    assert_equal 1, records.count
    data = records.first.data
    assert_equal teacher.id, data['user_id']
    assert_equal 'Newville', data['city']
    assert_equal 'Oregon', data['state']
  end

  test 'extract_users_and_geos includes teachers without geo records' do
    teacher = create(:teacher)

    ContactRollupsRaw.extract_users_and_geos

    record = ContactRollupsRaw.find_by(email: teacher.email, sources: 'dashboard.users')
    refute_nil record
    assert_equal teacher.id, record.data['user_id']
    assert_nil record.data['city']
  end

  test 'get_extraction_query can import when no data column is given' do
    email_preference = create(:email_preference)

    select_query = 'SELECT email, updated_at from email_preferences'
    query = ContactRollupsRaw.get_extraction_query('dashboard.email_preferences', select_query)
    ActiveRecord::Base.connection.execute(query)

    refute_nil ContactRollupsRaw.find_by(email: email_preference.email, data: nil, sources: 'dashboard.email_preferences')
  end

  test 'get_extraction_query can import when source is a subquery' do
    first_child = create(:student, parent_email: 'caring@parent.com')
    second_child = create(:student, parent_email: 'caring@parent.com')

    # we're not actually interested in user IDs in contact rollups
    # just a simple example of something we could extract in a subquery
    subquery = <<~SQL.squish
      SELECT parent_email AS email, MAX(updated_at) AS updated_at, MAX(id) AS higher_student_id
      FROM users
      GROUP BY parent_email
    SQL

    source_name = 'dashboard.users'
    query = ContactRollupsRaw.get_extraction_query(source_name, subquery, 'higher_student_id')
    ActiveRecord::Base.connection.execute(query)

    refute_empty ContactRollupsRaw.where(
      "email = :email and data->'$.higher_student_id' = CAST(:higher_student_id AS UNSIGNED) and sources = :sources",
      email: first_child.parent_email,
      sources: source_name,
      higher_student_id: second_child.id
    )
  end

  test 'get_extraction_query looks as expected when called with a single column' do
    select_query = 'SELECT email, opt_in, updated_at FROM email_preferences'
    expected_sql = <<~SQL.squish
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
    expected_sql = <<~SQL.squish
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
