require 'test_helper'

class Census::CensusSubmissionTest < ActiveSupport::TestCase
  test "basic census submission" do
    submission = build(:census_submission)
    assert submission.valid?, submission.errors.full_messages
  end

  test "census submission with bad email is invalid" do
    submission = build :census_submission, submitter_email_address: "email"
    refute submission.valid?, submission.errors.full_messages
  end

  test "census submission with blank email is invalid" do
    submission = build :census_submission, submitter_email_address: "   "
    refute submission.valid?, submission.errors.full_messages
  end

  test "census submission without school infos" do
    submission = build(:census_submission, school_info_count: 0)
    refute submission.valid?, submission.errors.full_messages
  end

  test "census submission with bad how many" do
    caught = false
    begin
      build(:census_submission, :with_bad_how_many)
    rescue ArgumentError
      caught = true
    end
    assert caught, "expected ArgumentError when building submission with bad how many"
  end

  test "census submission with bad role" do
    caught = false
    begin
      build(:census_submission, :with_bad_role)
    rescue ArgumentError
      caught = true
    end
    assert caught, "expected ArgumentError when building submission with bad role"
  end

  test "census submission with bad frequency" do
    caught = false
    begin
      build(:census_submission, :with_bad_frequency)
    rescue ArgumentError
      caught = true
    end
    assert caught, "expected ArgumentError when building submission with bad frequency"
  end

  test "census submission with bad school year" do
    submission = build(:census_submission, :with_bad_school_year)
    refute submission.valid?, submission.errors.full_messages
  end

  test "census submission with long email" do
    submission = build(:census_submission, :with_long_email)
    refute submission.valid?, submission.errors.full_messages
  end

  test "census submission with long name" do
    submission = build(:census_submission, :with_long_name)
    refute submission.valid?, submission.errors.full_messages
  end

  test "census submission with long other description" do
    submission = build(:census_submission, :with_long_other_description)
    refute submission.valid?, submission.errors.full_messages
  end

  test "census submission submitter email address is lowercased" do
    submission = build(:census_submission, submitter_email_address: 'MiXeD.CaSe@example.net')

    assert_equal 'mixed.case@example.net', submission.submitter_email_address
  end
end
