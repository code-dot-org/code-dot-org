require 'test_helper'

class Census::CensusYourSchool2017v6Test < ActiveSupport::TestCase
  test "basic census 2017 v6 submission" do
    submission = build(:census_your_school2017v6)
    assert submission.valid?, submission.errors.full_messages
  end

  test "census 2017 v6 submission missing topic_ethical_social" do
    submission = build(:census_your_school2017v6, :requiring_followup, topic_ethical_social: nil)
    assert_not submission.valid?, submission.errors.full_messages
  end
end
