require 'test_helper'
require 'cdo/contact_rollups'

PEGASUS_TEST_DB_NAME = "pegasus_#{Rails.env}"
COLUMN_NAME_TO_INDEX_MAP = { "roles": 0, "ages_taught": 1 }.freeze

class PardotTest < ActiveSupport::TestCase
  def test_empty_contacts
    # Test the rollup process with an empty database
    rollups_test_helper 0, []
  end

  def test_teachers
    # Create teacher 1 with no section
    @teacher1 = create(:teacher, email: "rolluptestteacher1@code.org")

    # Create teacher 2 with one section and one student
    @teacher2 = create(:teacher, email: "rolluptestteacher2@code.org")
    create_sections_helper @teacher2, [[{age: 6}]]

    # Create teacher 3 with one section and multiple students
    @teacher3 = create(:teacher, email: "rolluptestteacher3@code.org")
    @teacher3_section = create(:section, user: @teacher3)
    create_sections_helper @teacher3, [[{age: 6}, {age: 10}, {age: 14}, {age: 10}]]

    # Create teacher 4 with three sections and multiple students
    @teacher4 = create(:teacher, email: "rolluptestteacher4@code.org")
    create_sections_helper @teacher4,
      [
        [{age: 14}, {age: 10}, {age: 11}, {age: 10}, {age: 10}, {age: 11}],
        [{age: 9}, {age: 11}, {age: 9}],
        [{age: 15}]
      ]

    # Expected values for ages taught is the union of all unique values of student ages,
    # no duplicates, in ascending sorted order
    expected_values = [
      { "rolluptestteacher1@code.org": { "roles": "Teacher", "ages_taught": nil }},
      { "rolluptestteacher2@code.org": { "roles": "Teacher", "ages_taught": "6" }},
      { "rolluptestteacher3@code.org": { "roles": "Teacher", "ages_taught": "6,10,14" }},
      { "rolluptestteacher4@code.org": { "roles": "Teacher", "ages_taught": "9,10,11,14,15" }}
    ]

    rollups_test_helper 4, expected_values
  end

  private

  def rollups_test_helper(expected_count, expected_values)
    # Run the rollup process
    ContactRollups.build_contact_rollups

    # Should now have expected_count records in daily rollups table, and still none in main rollups table
    assert ActiveRecord::Base.connection.execute("select count(*) from pegasus_test.contact_rollups_daily").first[0] == expected_count
    assert ActiveRecord::Base.connection.execute("select count(*) from pegasus_test.contact_rollups").first[0] == 0

    # Verify expected values in contacts_rollup_daily
    expected_values.each do |expected_values_hash|
      email = expected_values_hash.keys.first
      email_sanitized = ActiveRecord::Base.sanitize(expected_values_hash.keys.first)
      results = ActiveRecord::Base.connection.execute("select roles, ages_taught from pegasus_test.contact_rollups_daily where email=#{email_sanitized}")
      assert results.count == 1
      row = results.first
      expected_column_values = expected_values_hash[email]
      expected_column_values.each do |key, value|
        column_index = COLUMN_NAME_TO_INDEX_MAP[key]
        # puts ("email: #{email} actual: #{row[column_index]} expected: #{value}")
        assert row[column_index] == value
      end
    end
  end

  def create_sections_helper(teacher, sections)
    sections.each do |students|
      @section = create(:section, user: teacher)
      students.each do |student|
        create_follower_helper @section, student[:age]
      end
    end
  end

  def create_follower_helper(section, age)
    # subtract an additional day when calculating birthday for desired age to avoid time zone issues
    @student = create(:student, birthday: Time.zone.today - age.years - 1.days)
    create(:follower, section: section, student_user: @student)
  end
end
