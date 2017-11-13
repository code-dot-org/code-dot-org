require 'test_helper'

class Census::CensusSubmissionFormMapTest < ActiveSupport::TestCase
  test "empty census submission form map" do
    submission = build(:census_submission_form_map)
    assert_not submission.valid?, submission.errors.full_messages
  end

  test "census submission form map without form" do
    submission = build(:census_submission_form_map, :with_submission)
    assert_not submission.valid?, submission.errors.full_messages
  end

  test "census submission form map without submission" do
    submission = build(:census_submission_form_map, :with_form)
    assert_not submission.valid?, submission.errors.full_messages
  end

  test "good census submission form map" do
    submission = build(:census_submission_form_map, :with_submission, :with_form)
    assert submission.valid?, submission.errors.full_messages
  end
end
