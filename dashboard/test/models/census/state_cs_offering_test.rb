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
end
