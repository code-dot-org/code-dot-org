require 'test_helper'

class Census::CensusYourSchool2017v5Test < ActiveSupport::TestCase
  test "basic census 2017 v5 submission" do
    submission = build(:census_your_school2017v5)
    assert submission.valid?, submission.errors.full_messages
  end

  test "census 2017 v4 submission missing share_with_regional_partners" do
    submission = build(:census_your_school2017v5, share_with_regional_partners: nil)
    assert_not submission.valid?, submission.errors.full_messages
  end
end
