require 'test_helper'

class SchoolTest < ActiveSupport::TestCase
  include ActiveSupport::Testing::Stream

  test "schools initialized from tsv" do
    # Populate school districts, since schools depends on them as a foreign key.
    SchoolDistrict.seed_all(stub_school_data: true, force: true)

    schools = School.merge_from_csv(School.get_seed_filename(true))
    assert_equal(16, schools.size, 'test data contains 16 schools')
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
    refute school.high_needs?
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
    refute school.high_needs?
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
    refute school.high_needs?
  end

  test 'high needs false when null frl eligible below 50 percent of students' do
    school = create :school
    school.school_stats_by_year << SchoolStatsByYear.new(
      {
        school_id: school.id,
        school_year: '1998-1999',
        students_total: 4,
        frl_eligible_total: 1
      }
    )
    school.save!
    refute school.high_needs?
  end

  test 'high needs false when null frl eligible equal to 50 percent of students' do
    school = create :school
    school.school_stats_by_year << SchoolStatsByYear.new(
      {
        school_id: school.id,
        school_year: '1998-1999',
        students_total: 4,
        frl_eligible_total: 2
      }
    )
    school.save!
    refute school.high_needs?
  end

  test 'high needs false when null frl eligible above 50 percent of students' do
    school = create :school
    school.school_stats_by_year << SchoolStatsByYear.new(
      {
        school_id: school.id,
        school_year: '1998-1999',
        students_total: 4,
        frl_eligible_total: 3
      }
    )
    school.save!
    assert_equal(true, school.high_needs?)
  end
end
