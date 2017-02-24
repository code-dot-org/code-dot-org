require 'test_helper'
require 'cdo/contact_rollups'

PEGASUS_TEST_DB_NAME = "pegasus_#{Rails.env}"
COLUMN_NAME_TO_INDEX_MAP = { roles: 0, ages_taught: 1 }.freeze

class PardotTest < ActiveSupport::TestCase
  freeze_time

  def setup
    # Create the contact_rollups_daily table, which in production exists only on the replica server. Do it here outside
    # the main ActiveRecord connection. The test framework runs the test inside a transaction on the ActiveRecord connection
    # in order to be able to roll back the transaction and discard test changes at the end of the test. CREATE TABLE on
    # that connection would cause an implicit commit of the transaction and break tests. The simplest way to get a different
    # ActiveRecord connection is to run the command in a different thread. The structure below ensures the connection
    # is returned to the connection pool at the end of the block.
    Thread.new do
      ActiveRecord::Base.connection_pool.with_connection do |connection|
        connection.execute "CREATE TABLE IF NOT EXISTS pegasus_test.contact_rollups_daily LIKE pegasus_test.contact_rollups"
      end
    end.join
  end

  def test_empty_contacts
    # Test the rollup process with an empty database
    build_and_verify_contact_rollups 0, {}
  end

  def test_teachers
    # Create teacher 1 with no section
    create(:teacher, email: "rolluptestteacher1@code.org")

    # Create teacher 2 with an empty section
    teacher2 = create(:teacher, email: "rolluptestteacher2@code.org")
    create_sections_helper teacher2, [[]]

    # Create teacher 3 with one section and one student
    teacher3 = create(:teacher, email: "rolluptestteacher3@code.org")
    create_sections_helper teacher3, [[{age: 6}]]

    # Create teacher 4 with one section and multiple students
    teacher4 = create(:teacher, email: "rolluptestteacher4@code.org")
    create_sections_helper teacher4, [[{age: 6}, {age: 10}, {age: 14}, {age: 10}]]

    # Create teacher 5 with three sections and multiple students
    teacher5 = create(:teacher, email: "rolluptestteacher5@code.org")
    create_sections_helper teacher5,
      [
        [{age: 14}, {age: 10}, {age: 11}, {age: 10}, {age: 10}, {age: 11}],
        [{age: 9}, {age: 11}, {age: 9}],
        [{age: 15}],
        []  # deliberately empty section
      ]

    # Expected values for ages taught is the union of all unique values of student ages,
    # no duplicates, in ascending sorted order
    expected_values = {
      "rolluptestteacher1@code.org": { "roles": "Teacher", "ages_taught": nil },
      "rolluptestteacher2@code.org": { "roles": "Teacher", "ages_taught": nil },
      "rolluptestteacher3@code.org": { "roles": "Teacher", "ages_taught": "6" },
      "rolluptestteacher4@code.org": { "roles": "Teacher", "ages_taught": "6,10,14" },
      "rolluptestteacher5@code.org": { "roles": "Teacher", "ages_taught": "9,10,11,14,15" }
    }

    build_and_verify_contact_rollups 5, expected_values
  end

  private

  def build_and_verify_contact_rollups(expected_count, expected_values)
    # Run the rollup process
    ContactRollups.build_contact_rollups

    # Should now have expected_count records in daily rollups table, and still none in main rollups table
    assert_equal expected_count, ActiveRecord::Base.connection.execute("select count(*) from pegasus_test.contact_rollups_daily").first[0]
    assert_equal 0, ActiveRecord::Base.connection.execute("select count(*) from pegasus_test.contact_rollups").first[0]

    # Verify expected values in contacts_rollup_daily
    expected_values.each do |email, expected_info|
      results = ActiveRecord::Base.connection.execute("select roles, ages_taught from pegasus_test.contact_rollups_daily where email='#{email}'")
      assert_equal 1, results.count
      expected_info.each do |column, expected_column_value|
        actual_column_value = results.first[COLUMN_NAME_TO_INDEX_MAP[column]]
        # need to handle nil expected value differently because assert_equal with expected value of nil is being deprecated
        if  expected_column_value.nil?
          assert_nil actual_column_value
        else
          assert_equal expected_column_value, actual_column_value, "email: #{email}"
        end
      end
    end
  end

  # Create sections and students for this teacher
  # @param teacher [User] teacher to create for
  # @param sections [Array[Array[Hash]] array of sections; each section is an array of hashes of user properties for students
  def create_sections_helper(teacher, sections)
    sections.each do |students|
      section = create(:section, user: teacher)
      students.each do |student|
        create_follower_helper section, student[:age]
      end
    end
  end

  # Create a user in a section
  # @param section [Section] section to create for
  # @param age [Integer] age of student to create
  def create_follower_helper(section, age)
    student = create(:student, birthday: Time.zone.today - age.years)
    create(:follower, section: section, student_user: student)
  end
end
