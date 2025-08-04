require 'test_helper'

class Census::CensusHoc2017v1Test < ActiveSupport::TestCase
  test "basic HOC census 2017 v1 submission" do
    submission = build(:census_hoc2017v1)
    assert submission.valid?, submission.errors.full_messages
  end
end
