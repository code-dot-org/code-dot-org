require 'test_helper'

class Census::CensusYourSchool2017v7Test < ActiveSupport::TestCase
  test "basic census yourschool v7 submission" do
    submission = build :census_your_school2017v7
    assert submission.valid?, submission.errors.full_messages
  end

  test "census yourschool v7 submission with inaccuracy_reported but no inaccuracy_comment fails" do
    submission = build :census_your_school2017v7, :with_inaccuracy_reported
    refute submission.valid?
  end

  test "census yourschool v7 submission with inaccuracy_reported and inaccuracy_comment succeeds" do
    submission = build :census_your_school2017v7, :with_inaccuracy_reported, :with_inaccuracy_comment
    assert submission.valid?, submission.errors.full_messages
  end
end
