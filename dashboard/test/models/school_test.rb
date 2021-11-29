require 'test_helper'

class SchoolTest < ActiveSupport::TestCase
  include ActiveSupport::Testing::Stream

  self.use_transactional_test_case = true

  # merge_from_csv dry run tests require a clean schools table.
  setup_all do
    School.delete_all
  end

  test "schools initialized from tsv" do
    # Populate school districts, since schools depends on them as a foreign key.
    SchoolDistrict.seed_all(stub_school_data: true, force: true)

    schools = School.merge_from_csv(School.get_seed_filename(true))
    assert_equal(20, schools.size, 'test data contains 20 schools')
    assert_not_nil School.find_by(
      {
        id: '10000500871',
        school_district_id: 100005,
        name: 'ALBERTVILLE HIGH SCH',
        city: 'ALBERTVILLE',
        state: 'AL',
        zip: '35950',
        school_type: 'public',
      }
    )
  end

  test 'merge_from_csv in dry run mode with blank table makes no database writes' do
    # Populate school districts, since schools depends on them as a foreign key.
    SchoolDistrict.seed_all(stub_school_data: true, force: true)

    begin
      School.merge_from_csv(School.get_seed_filename(true), is_dry_run: true)
    rescue => error
      assert_includes error.to_s, 'This was a dry run'
      assert_equal 0, School.count
    end
  end

  test 'merge_from_csv in dry run mode with existing rows makes no database writes' do
    # Populate school districts, since schools depends on them as a foreign key.
    SchoolDistrict.seed_all(stub_school_data: true, force: true)
    School.merge_from_csv(School.get_seed_filename(true))

    before_count = School.count

    # Arbitrary change that should result in an update to each row.
    parse_row = proc do |row|
      {
        id: row['id'],
        state_school_id: row['state_school_id'],
        name: row['name'] + 'test'
      }
    end

    begin
      School.merge_from_csv(School.get_seed_filename(true), is_dry_run: true, &parse_row)
    rescue => error
      assert_includes error.to_s, 'This was a dry run'
      assert_equal before_count, School.count
    end
  end

  test 'reload_state_cs_offerings' do
    school = create :school
    state_cs_offering = create :state_cs_offering
    state_cs_offering_collection = Census::StateCsOffering.where(state_school_id: state_cs_offering.state_school_id)

    assert school.state_cs_offering.empty?
    reloaded_state_cs_offerings = school.load_state_cs_offerings(state_cs_offering_collection, false)

    assert_equal state_cs_offering_collection.pluck(:course, :school_year),
      reloaded_state_cs_offerings.pluck(:course, :school_year)
  end

  test 'null state_school_id is valid' do
    school = build :school, :without_state_school_id
    assert school.valid?, school.errors.full_messages
  end

  test 'invalid state_school_id is invalid' do
    school = build :school, :with_invalid_state_school_id
    refute school.valid?
  end

  test 'maker high needs false when no stats data' do
    school = create :school
    refute school.maker_high_needs?
  end

  test 'maker high needs false when null students total' do
    school = create :school
    school.school_stats_by_year << SchoolStatsByYear.new(
      {
        school_id: school.id,
        school_year: '1998-1999'
      }
    )
    school.save!
    refute school.maker_high_needs?
  end

  test 'maker high needs false when null frl eligible total' do
    school = create :school
    school.school_stats_by_year << SchoolStatsByYear.new(
      {
        school_id: school.id,
        school_year: '1998-1999',
        students_total: 100
      }
    )
    school.save!
    refute school.maker_high_needs?
  end

  test 'maker high needs false when frl eligible below 50 percent of students' do
    school = create :school
    school.school_stats_by_year << SchoolStatsByYear.new(
      {
        school_id: school.id,
        school_year: '1998-1999',
        students_total: 100,
        frl_eligible_total: 49
      }
    )
    school.save!
    refute school.maker_high_needs?
  end

  test 'maker high needs true when frl eligible equal to 50 percent of students' do
    school = create :school
    school.school_stats_by_year << SchoolStatsByYear.new(
      {
        school_id: school.id,
        school_year: '1998-1999',
        students_total: 1000,
        frl_eligible_total: 500
      }
    )
    school.save!
    assert school.maker_high_needs?
  end

  test 'maker high needs true when frl eligible above 50 percent of students' do
    school = create :school
    school.school_stats_by_year << SchoolStatsByYear.new(
      {
        school_id: school.id,
        school_year: '1998-1999',
        students_total: 1000,
        frl_eligible_total: 501
      }
    )
    school.save!
    assert school.maker_high_needs?
  end

  test 'AFE high needs false when no stats data' do
    school = create :school
    refute school.afe_high_needs?
  end

  test 'AFE high needs false when null students total' do
    school = create :school
    school.school_stats_by_year << SchoolStatsByYear.new(
      {
        school_id: school.id,
        school_year: '1998-1999'
      }
    )
    school.save!
    refute school.afe_high_needs?
  end

  test 'AFE high needs true when frl eligible above 40 percent of students' do
    school = create :school
    school.school_stats_by_year << SchoolStatsByYear.new(
      {
        school_id: school.id,
        school_year: '1998-1999',
        students_total: 100,
        frl_eligible_total: 41
      }
    )
    school.save!
    assert school.afe_high_needs?
  end

  test 'AFE high needs true when urm percent above 40 percent of students' do
    school = create :school
    school.school_stats_by_year << SchoolStatsByYear.new(
      {
        school_id: school.id,
        school_year: '1998-1999',
        students_total: 100,
        student_bl_count: 50
      }
    )
    school.save!
    assert school.afe_high_needs?
  end

  test 'AFE high needs false when urm percent below 40 percent of students' do
    school = create :school
    school.school_stats_by_year << SchoolStatsByYear.new(
      {
        school_id: school.id,
        school_year: '1998-1999',
        students_total: 100,
        student_bl_count: 25
      }
    )
    school.save!
    refute school.afe_high_needs?
  end

  test 'AFE high needs true when title_i_status is yes' do
    school = create :school
    school.school_stats_by_year << SchoolStatsByYear.new(
      {
        school_id: school.id,
        school_year: '1998-1999',
        title_i_status: '5'
      }
    )
    school.save!
    assert school.afe_high_needs?
  end

  test 'AFE high needs false when no criteria are met' do
    school = create :school
    school.school_stats_by_year << SchoolStatsByYear.new(
      {
        school_id: school.id,
        school_year: '1998-1999',
        students_total: 100,
        student_bl_count: 5,
        student_am_count: 0,
        student_hi_count: 0,
        student_hp_count: 5,
        frl_eligible_total: 20,
        title_i_status: '6'
      }
    )
    school.save!
    refute school.afe_high_needs?
  end

  test 'urm school stats missing counts' do
    school = create :school
    stats_by_year =
      school.school_stats_by_year << SchoolStatsByYear.new(
        school_id: school.id,
        school_year: '1998-1999',
        students_total: 100,
        student_bl_count: 50
      )
    school.save!
    assert_equal(50.0, stats_by_year.first.urm_percent)
  end

  test 'normalize_school_id works for short ids without leading zeros' do
    normalized_id = School.normalize_school_id("123456")
    assert_equal "123456", normalized_id
  end

  test 'normalize_school_id works for alphanumeric short ids' do
    normalized_id = School.normalize_school_id("A00123")
    assert_equal "A00123", normalized_id
  end

  test 'normalize_school_id works for short ids with leading zeros' do
    normalized_id = School.normalize_school_id("000123")
    assert_equal "000123", normalized_id
  end

  test 'normalize_school_id works for 12-character ids without leading zeros' do
    normalized_id = School.normalize_school_id("123456789012")
    assert_equal "123456789012", normalized_id
  end

  test 'normalize_school_id works for 12-character ids with leading zeros' do
    normalized_id = School.normalize_school_id("012345678901")
    assert_equal "12345678901", normalized_id
  end

  test 'normalize_school_id works for 12-character ids with leading zeros missing' do
    normalized_id = School.normalize_school_id("12345678901")
    assert_equal "12345678901", normalized_id
  end
end
