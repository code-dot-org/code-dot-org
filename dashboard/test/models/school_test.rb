require 'test_helper'

class SchoolTest < ActiveSupport::TestCase
  include ActiveSupport::Testing::Stream

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

  test 'null state_school_id is valid' do
    school = build :school, :without_state_school_id
    assert school.valid?, school.errors.full_messages
  end

  test 'invalid state_school_id is invalid' do
    school = build :school, :with_invalid_state_school_id
    refute school.valid?
  end

  test 'high needs false when no stats data' do
    school = create :school
    refute school.maker_high_needs?
  end

  test 'high needs false when null students total' do
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

  test 'high needs false when null frl eligible total' do
    school = create :school
    school.school_stats_by_year << SchoolStatsByYear.new(
      {
        school_id: school.id,
        school_year: '1998-1999',
        students_total: 4
      }
    )
    school.save!
    refute school.maker_high_needs?
  end

  test 'high needs false when null frl eligible below 40 percent of students' do
    school = create :school
    school.school_stats_by_year << SchoolStatsByYear.new(
      {
        school_id: school.id,
        school_year: '1998-1999',
        students_total: 1000,
        frl_eligible_total: 399
      }
    )
    school.save!
    refute school.maker_high_needs?
  end

  test 'high needs true when null frl eligible equal to 40 percent of students' do
    school = create :school
    school.school_stats_by_year << SchoolStatsByYear.new(
      {
        school_id: school.id,
        school_year: '1998-1999',
        students_total: 1000,
        frl_eligible_total: 400
      }
    )
    school.save!
    assert school.maker_high_needs?
  end

  test 'high needs true when null frl eligible above 40 percent of students' do
    school = create :school
    school.school_stats_by_year << SchoolStatsByYear.new(
      {
        school_id: school.id,
        school_year: '1998-1999',
        students_total: 1000,
        frl_eligible_total: 401
      }
    )
    school.save!
    assert school.maker_high_needs?
  end

  test 'urm school stats missing counts' do
    school = create :school
    stats_by_year =
      school.school_stats_by_year << SchoolStatsByYear.new(
        school_id: school.id,
        school_year: '1998-1999',
        students_total: 4,
        student_bl_count: 2
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
