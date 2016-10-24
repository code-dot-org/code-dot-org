require 'test_helper'

class SchoolTest < ActiveSupport::TestCase
  include ActiveSupport::Testing::Stream

  test "schools initialized from tsv" do
    schools = School.find_or_create_all_from_tsv('test/fixtures/schools.tsv')
    assert_equal(schools.size, 16, 'test data contains 16 schools')
    assert_not_nil School.find_by({
      id: 10_000_500_871,
      school_district_id: 100005,
      name: 'ALBERTVILLE HIGH SCH',
      city: 'ALBERTVILLE',
      state: 'AL',
      zip: '35950',
      school_type: 'public',
    })
  end

  # See CHARTR in http://nces.ed.gov/ccd/pdf/2015150_sc132a_Documentation_052716.pdf
  test "school_type parses charter values properly" do
    assert_equal School.send(:school_type, 'N'), 'public'
    assert_equal School.send(:school_type, '1'), 'charter'
    assert_equal School.send(:school_type, '2'), 'public'
  end
end
