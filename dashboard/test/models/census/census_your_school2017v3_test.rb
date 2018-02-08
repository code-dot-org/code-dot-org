require 'test_helper'

class Census::CensusYourSchool2017v3Test < ActiveSupport::TestCase
  test "basic census 2017 v3 submission" do
    submission = build(:census_your_school2017v3)
    assert submission.valid?, submission.errors.full_messages
  end
end
