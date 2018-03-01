require 'test_helper'

class Census::CensusYourSchool2017v1Test < ActiveSupport::TestCase
  test "basic census 2017 v1 submission" do
    submission = build(:census_your_school2017v1)
    assert submission.valid?, submission.errors.full_messages
  end

  test "census 2017 v1 submission as teacher with pledge" do
    submission = build(:census_your_school2017v1, :as_teacher, :with_pledge)
    assert submission.valid?, submission.errors.full_messages
  end

  test "census 2017 v1 submission with followup" do
    submission = build(:census_your_school2017v1, :requiring_followup, :with_topic_booleans)
    assert submission.valid?, submission.errors.full_messages
  end
end
