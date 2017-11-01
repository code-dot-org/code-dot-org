require 'test_helper'

class Census::HocCensus2017v2Test < ActiveSupport::TestCase
  test "basic HOC census 2017 v2 submission" do
    submission = build(:hoc_census2017v2)
    assert submission.valid?, submission.errors.full_messages
  end
end
