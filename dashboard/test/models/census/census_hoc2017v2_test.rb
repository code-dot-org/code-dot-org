require 'test_helper'

class Census::CensusHoc2017v2Test < ActiveSupport::TestCase
  test "basic HOC census 2017 v2 submission" do
    submission = build(:census_hoc2017v2)
    assert submission.valid?, submission.errors.full_messages
  end
end
