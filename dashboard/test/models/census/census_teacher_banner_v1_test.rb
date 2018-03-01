require 'test_helper'

class Census::CensusTeacherBannerV1Test < ActiveSupport::TestCase
  test "basic census teacher banner v1 submission is valid" do
    submission = build(:census_teacher_banner_v1)
    assert submission.valid?, submission.errors.full_messages
  end

  test "teacher banner v1 submission for non-teacher is invalid" do
    submission = build(:census_teacher_banner_v1, submitter_role: "PARENT")
    refute submission.valid?
  end

  test "teacher banner v1 submission missing how_many_10_hours, how_many_20_hours, how_many_after_school is invalid" do
    submission = build(:census_teacher_banner_v1, how_many_10_hours: nil, how_many_20_hours: nil, how_many_after_school: nil)
    refute submission.valid?
  end

  test "teacher banner v1 submission with one of how_many_10_hours, how_many_20_hours, how_many_after_school is valid" do
    submission = build(:census_teacher_banner_v1, how_many_10_hours: "SOME", how_many_20_hours: nil, how_many_after_school: nil)
    assert submission.valid?, submission.errors.full_messages
  end
end
