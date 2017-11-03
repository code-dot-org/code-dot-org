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

  test 'high needs false when no stats data' do
    school = School.find_by_id('20000100206')
    assert_equal(false, school.high_needs?)
  end

  test 'high needs false when null students total' do
    school = School.find_by_id('20000100206')
    school.school_stats_by_year << SchoolStatsByYear.new(
      {
        school_id: school.id,
        school_year: '1998-1999'
      }
    )
    school.save!
    assert_equal(false, school.high_needs?)
  end

  test 'high needs false when null frl eligible total' do
    school = School.find_by_id('20000100206')
    school.school_stats_by_year << SchoolStatsByYear.new(
      {
        school_id: school.id,
        school_year: '1998-1999',
        students_total: 4
      }
    )
    school.save!
    assert_equal(false, school.high_needs?)
  end

  test 'high needs false when null frl eligible below 50 percent of students' do
    school = School.find_by_id('20000100206')
    school.school_stats_by_year << SchoolStatsByYear.new(
      {
        school_id: school.id,
        school_year: '1998-1999',
        students_total: 4,
        frl_eligible_total: 1
      }
    )
    school.save!
    assert_equal(false, school.high_needs?)
  end

  test 'high needs false when null frl eligible equal to 50 percent of students' do
    school = School.find_by_id('20000100206')
    school.school_stats_by_year << SchoolStatsByYear.new(
      {
        school_id: school.id,
        school_year: '1998-1999',
        students_total: 4,
        frl_eligible_total: 2
      }
    )
    school.save!
    assert_equal(false, school.high_needs?)
  end

  test 'high needs false when null frl eligible above 50 percent of students' do
    school = School.find_by_id('20000100206')
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
