require 'test_helper'

class Census::CensusYourSchool2017v2Test < ActiveSupport::TestCase
  test "basic census 2017 v2 submission" do
    submission = build(:census_your_school2017v2)
    assert submission.valid?, submission.errors.full_messages
  end

  test "census 2017 v2 submission missing other description" do
    submission = build(:census_your_school2017v2, :requiring_other_description)
    assert_not submission.valid?, submission.errors.full_messages
  end

  test "census 2017 v2 submission with other description" do
    submission = build(:census_your_school2017v2, :requiring_other_description, :with_other_description, :with_topic_booleans)
    assert submission.valid?, submission.errors.full_messages
  end
end
