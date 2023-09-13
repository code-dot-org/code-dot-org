require 'test_helper'

class Census::CensusYourSchool2017v4Test < ActiveSupport::TestCase
  test "basic census 2017 v4 submission" do
    submission = build(:census_your_school2017v4)
    assert submission.valid?, submission.errors.full_messages
  end

  test "census 2017 v4 submission as teacher with pledge" do
    submission = build(:census_your_school2017v4, :as_teacher, :with_pledge)
    assert submission.valid?, submission.errors.full_messages
  end

  test "census 2017 v4 submission as teacher without pledge" do
    submission = build(:census_your_school2017v4, :as_teacher)
    refute submission.valid?, submission.errors.full_messages
  end

  test "census 2017 v4 submission missing followup" do
    submission = build(:census_your_school2017v4, :requiring_followup)
    refute submission.valid?, submission.errors.full_messages
  end

  test "census 2017 v4 submission with followup" do
    submission = build(:census_your_school2017v4, :requiring_followup, :with_topic_booleans, :with_other_description)
    assert submission.valid?, submission.errors.full_messages
  end
end
