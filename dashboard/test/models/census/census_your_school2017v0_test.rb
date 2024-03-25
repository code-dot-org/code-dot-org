require 'test_helper'

class Census::CensusYourSchool2017v0Test < ActiveSupport::TestCase
  test "basic census 2017 v0 submission" do
    submission = build :census_your_school2017v0
    assert submission.valid?, submission.errors.full_messages
  end

  test "census 2017 v0 submission missing email" do
    submission = build :census_your_school2017v1, submitter_email_address: nil
    refute submission.valid?, submission.errors.full_messages
  end

  test "census 2017 v0 submission missing role" do
    submission = build :census_your_school2017v1, submitter_role: nil
    refute submission.valid?, submission.errors.full_messages
  end
end
