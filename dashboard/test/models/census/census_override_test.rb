require 'test_helper'

class Census::CensusOverrideTest < ActiveSupport::TestCase
  test "Basic override creation succeeds" do
    override = build :census_override
    assert override.valid?, override.errors.full_messages
  end

  test "Override creation with valid teaches_cs succeeds" do
    override = build :census_override, :with_valid_teaches_cs
    assert override.valid?, override.errors.full_messages
  end

  test "Override creation with invalid teaches_cs fails" do
    assert_raises ArgumentError do
      build :census_override, :with_invalid_teaches_cs
    end
  end

  test "Override creation without school year fails" do
    override = build :census_override, :without_school_year
    refute override.valid?
  end

  test "Override creation with invalid school_year fails" do
    override = build :census_override, :with_invalid_school_year
    refute override.valid?
  end

  test "Override creation without school fails" do
    override = build :census_override, :without_school
    refute override.valid?
  end
end
