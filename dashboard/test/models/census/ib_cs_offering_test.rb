require 'test_helper'

class Census::IbCsOfferingTest < ActiveSupport::TestCase
  test "Basic offering creation succeeds" do
    offering = build :ib_cs_offering
    assert offering.valid?, offering.errors.full_messages
  end

  test "Offering creation without level fails" do
    offering = build :ib_cs_offering, :without_level
    refute offering.valid?
  end

  test "Offering creation without school_code fails" do
    offering = build :ib_cs_offering, :without_school_code
    refute offering.valid?
  end

  test "Offering creation without school_year fails" do
    offering = build :ib_cs_offering, :without_school_year
    refute offering.valid?
  end

  test "Offering creation with invalid level fails" do
    assert_raises ArgumentError do
      build :ib_cs_offering, :with_invalid_level
    end
  end

  test "Offering creation with invalid school_year fails" do
    offering = build :ib_cs_offering, :with_invalid_school_year
    refute offering.valid?
  end
end
