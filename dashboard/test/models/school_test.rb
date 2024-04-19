require 'test_helper'

class SchoolTest < ActiveSupport::TestCase
  include ActiveSupport::Testing::Stream

  test "schools initialized from tsv" do
    # Populate school districts, since schools depends on them as a foreign key.
    SchoolDistrict.seed_all(stub_school_data: true, force: true)

    schools = School.merge_from_csv(School.get_seed_filename(true))
    assert_equal(20, schools.size, 'test data contains 20 schools')
    refute_nil School.find_by(
      {
        id: '10000500871',
        school_district_id: 100005,
        name: 'ALBERTVILLE HIGH SCH',
        city: 'ALBERTVILLE',
        state: 'AL',
        zip: '35950',
        school_type: 'public',
        last_known_school_year_open: '2022-2023'
      }
    )
  end

  test 'merge_from_csv in dry run mode with blank table makes no database writes' do
    clear_schools_and_dependent_models

    # Populate school districts, since schools depends on them as a foreign key.
    SchoolDistrict.seed_all(stub_school_data: true, force: true)

    begin
      School.merge_from_csv(School.get_seed_filename(true), is_dry_run: true)
    rescue => exception
      assert_includes exception.message, 'This was a dry run'
      assert_equal 0, School.count
    end
  end

  test 'merge_from_csv in dry run mode with existing rows makes no database writes' do
    clear_schools_and_dependent_models

    # Populate school districts, since schools depends on them as a foreign key.
    SchoolDistrict.seed_all(stub_school_data: true, force: true)
    School.merge_from_csv(School.get_seed_filename(true))

    before_count = School.count

    # Arbitrary change that should result in an update to each row.
    parse_row = proc do |row|
      {
        id: row['id'],
        name: row['name'] + 'test'
      }
    end

    begin
      School.merge_from_csv(School.get_seed_filename(true), is_dry_run: true, &parse_row)
    rescue => exception
      assert_includes exception.message, 'This was a dry run'
      assert_equal before_count, School.count
    end
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

  private def clear_schools_and_dependent_models
    # Clear tables with hard dependencies (ie, MySQL foreign keys)
    # on the schools table.
    Census::CensusSummary.delete_all
    SchoolInfo.delete_all
    SchoolStatsByYear.delete_all

    School.delete_all
  end
end
