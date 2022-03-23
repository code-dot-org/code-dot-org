require 'test_helper'

class Census::StateCsOfferingTest < ActiveSupport::TestCase
  test "Basic offering creation succeeds" do
    offering = build :state_cs_offering
    assert offering.valid?, offering.errors.full_messages
  end

  test "Offering creation without course fails" do
    offering = build :state_cs_offering, :without_course
    refute offering.valid?
  end

  test "Offering creation without school fails" do
    offering = build :state_cs_offering, :without_school
    refute offering.valid?
  end

  test "Offering creation without school_year fails" do
    offering = build :state_cs_offering, :without_school_year
    refute offering.valid?
  end

  test "Offering creation with invalid school_year fails" do
    offering = build :state_cs_offering, :with_invalid_school_year
    refute offering.valid?
  end

  test "Deconstructing the object key succeeds" do
    object_key = "state_cs_offerings/DE/2020-2021.test"
    state_code, school_year, update, extension = Census::StateCsOffering.deconstruct_object_key(object_key)
    assert state_code == 'DE'
    assert school_year == 2020
    assert update == 1
    assert extension == 'test'

    object_key = "state_cs_offerings/DE/2020-2021.2.test2"
    state_code, school_year, update, extension = Census::StateCsOffering.deconstruct_object_key(object_key)
    assert state_code == 'DE'
    assert school_year == 2020
    assert update == 2
    assert extension == 'test2'
  end

  test "seeding attempts to seed all updates in order" do
    # mock out s3 call
    AWS::S3.stubs(:find_objects_with_ext).returns(
      [
        'state_cs_offerings/WA/2021-2022.2.csv',
        'state_cs_offerings/WA/2021-2022.csv',
        'state_cs_offerings/WA/2021-2022.3.csv'
      ]
    )

    results = Census::StateCsOffering.find_all_updates_for_state_year('WA', 2021, 'csv')

    assert results[0] == 'state_cs_offerings/WA/2021-2022.csv'
    assert results[1] == 'state_cs_offerings/WA/2021-2022.2.csv'
    assert results[2] == 'state_cs_offerings/WA/2021-2022.3.csv'
  end
end
