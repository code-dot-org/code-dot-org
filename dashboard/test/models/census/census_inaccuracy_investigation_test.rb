require 'test_helper'

class CensusInaccuracyInvestigationTest < ActiveSupport::TestCase
  test "basic investigation creation succeeds" do
    investigation = build :census_inaccuracy_investigation
    assert investigation.valid?, investigation.errors.full_messages
  end

  test "investigation creation without submission fails" do
    investigation = build :census_inaccuracy_investigation, :without_submission
    refute investigation.valid?
  end

  test "investigation creation without user fails" do
    investigation = build :census_inaccuracy_investigation, :without_user
    refute investigation.valid?
  end

  test "investigation creation without notes fails" do
    investigation = build :census_inaccuracy_investigation, :without_notes
    refute investigation.valid?
  end
end
