require 'test_helper'

class Census::CensusSummaryTest < ActiveSupport::TestCase
  test "Basic summary creation succeeds" do
    summary = build :census_summary
    assert summary.valid?, summary.errors.full_messages
  end

  test "Summary creation with valid teaches_cs succeeds" do
    summary = build :census_summary, :with_valid_teaches_cs
    assert summary.valid?, summary.errors.full_messages
  end

  test "Summary creation with valid historic teaches_cs succeeds" do
    summary = build :census_summary, :with_valid_historic_teaches_cs
    assert summary.valid?, summary.errors.full_messages
  end

  test "Summary creation with invalid teaches_cs fails" do
    assert_raises ArgumentError do
      build :census_summary, :with_invalid_teaches_cs
    end
  end

  test "Summary creation without school year fails" do
    summary = build :census_summary, :without_school_year
    refute summary.valid?
  end

  test "Summary creation with invalid school_year fails" do
    summary = build :census_summary, :with_invalid_school_year
    refute summary.valid?
  end

  test "Summary creation without school fails" do
    summary = build :census_summary, :without_school
    refute summary.valid?
  end

  test "Summary creation without audit data fails" do
    summary = build :census_summary, :without_audit_data
    refute summary.valid?
  end

  test "High school with NONE doesn't teach" do
    submission = build :census_submission, how_many_20_hours: "NONE"
    refute Census::CensusSummary.submission_teaches_cs?(submission, is_high_school: true, is_k8_school: false)
  end

  test "High school with SOME but no topics doesn't teach" do
    submission = build :census_submission, how_many_20_hours: "SOME", topic_blocks: nil, topic_text: nil
    refute Census::CensusSummary.submission_teaches_cs?(submission, is_high_school: true, is_k8_school: false)
  end

  test "Mixed K8/High school with SOME but no topics does teach" do
    submission = build :census_submission, how_many_20_hours: "SOME", topic_blocks: nil, topic_text: nil
    assert Census::CensusSummary.submission_teaches_cs?(submission, is_high_school: true, is_k8_school: true)
  end

  test "High school with SOME but no topics in teacher banner does teach" do
    submission = build :census_teacher_banner_v1, how_many_20_hours: "SOME", topic_blocks: nil, topic_text: nil
    assert Census::CensusSummary.submission_teaches_cs?(submission, is_high_school: true, is_k8_school: false)
  end

  test "High school with SOME and topic_blocks does teach" do
    submission = build :census_submission, how_many_20_hours: "SOME", topic_blocks: true, topic_text: nil
    assert Census::CensusSummary.submission_teaches_cs?(submission, is_high_school: true, is_k8_school: false)
  end

  test "High school with SOME and topic_text does teach" do
    submission = build :census_submission, how_many_20_hours: "SOME", topic_blocks: nil, topic_text: true
    assert Census::CensusSummary.submission_teaches_cs?(submission, is_high_school: true, is_k8_school: false)
  end

  test "High school with SOME and topic_text and topic_blocks does teach" do
    submission = build :census_submission, how_many_20_hours: "SOME", topic_blocks: true, topic_text: true
    assert Census::CensusSummary.submission_teaches_cs?(submission, is_high_school: true, is_k8_school: false)
  end

  test "High school with ALL and topic_blocks does teach" do
    submission = build :census_submission, how_many_20_hours: "ALL", topic_blocks: true, topic_text: nil
    assert Census::CensusSummary.submission_teaches_cs?(submission, is_high_school: true, is_k8_school: false)
  end

  test "High school with ALL and topic_text does teach" do
    submission = build :census_submission, how_many_20_hours: "ALL", topic_blocks: nil, topic_text: true
    assert Census::CensusSummary.submission_teaches_cs?(submission, is_high_school: true, is_k8_school: false)
  end

  test "High school with ALL and topic_text and topic_blocks does teach" do
    submission = build :census_submission, how_many_20_hours: "ALL", topic_blocks: true, topic_text: true
    assert Census::CensusSummary.submission_teaches_cs?(submission, is_high_school: true, is_k8_school: false)
  end

  test "Non-high school with NONE and NONE doesn't teach" do
    submission = build :census_submission, how_many_10_hours: "NONE", how_many_20_hours: "NONE"
    refute Census::CensusSummary.submission_teaches_cs?(submission, is_high_school: false, is_k8_school: true)
  end

  test "Non-high school with 10 hours SOME does teach" do
    submission = build :census_submission, how_many_10_hours: "SOME", how_many_20_hours: "NONE"
    assert Census::CensusSummary.submission_teaches_cs?(submission, is_high_school: false, is_k8_school: true)
  end

  test "Non-high school with 10 hours ALL does teach" do
    submission = build :census_submission, how_many_10_hours: "ALL", how_many_20_hours: "NONE"
    assert Census::CensusSummary.submission_teaches_cs?(submission, is_high_school: false, is_k8_school: true)
  end

  test "Non-high school with 20 hours SOME does teach" do
    submission = build :census_submission, how_many_10_hours: "NONE", how_many_20_hours: "SOME"
    assert Census::CensusSummary.submission_teaches_cs?(submission, is_high_school: false, is_k8_school: true)
  end

  test "Non-high school with 20 hours ALL does teach" do
    submission = build :census_submission, how_many_10_hours: "NONE", how_many_20_hours: "ALL"
    assert Census::CensusSummary.submission_teaches_cs?(submission, is_high_school: false, is_k8_school: true)
  end

  test "School without stats with NONE and NONE doesn't teach" do
    submission = build :census_submission, how_many_10_hours: "NONE", how_many_20_hours: "NONE"
    refute Census::CensusSummary.submission_teaches_cs?(submission, is_high_school: nil, is_k8_school: nil)
  end

  test "School without stats with 10 hours SOME does teach" do
    submission = build :census_submission, how_many_10_hours: "SOME", how_many_20_hours: "NONE"
    assert Census::CensusSummary.submission_teaches_cs?(submission, is_high_school: nil, is_k8_school: nil)
  end

  test "School without stats with 10 hours ALL does teach" do
    submission = build :census_submission, how_many_10_hours: "ALL", how_many_20_hours: "NONE"
    assert Census::CensusSummary.submission_teaches_cs?(submission, is_high_school: nil, is_k8_school: nil)
  end

  test "School without stats with 20 hours SOME does teach" do
    submission = build :census_submission, how_many_10_hours: "NONE", how_many_20_hours: "SOME"
    assert Census::CensusSummary.submission_teaches_cs?(submission, is_high_school: nil, is_k8_school: nil)
  end

  test "School without stats with 20 hours ALL does teach" do
    submission = build :census_submission, how_many_10_hours: "NONE", how_many_20_hours: "ALL"
    assert Census::CensusSummary.submission_teaches_cs?(submission, is_high_school: nil, is_k8_school: nil)
  end

  test "AP data overrides surveys, state data, and previous years" do
    school_year = 2020
    school = create :census_school,
      :with_teaches_no_teacher_census_submission,
      :with_ap_cs_offering,
      :with_one_year_ago_teaches_no,
      :with_two_years_ago_teaches_no,
      school_year: school_year
    validate_summary(school, school_year, "YES")
  end

  test "IB data overrides surveys and state data" do
    school_year = 2020
    school = create :census_school,
      :with_teaches_no_teacher_census_submission,
      :with_ib_cs_offering,
      :with_one_year_ago_teaches_no,
      :with_two_years_ago_teaches_no,
      school_year: school_year
    validate_summary(school, school_year, "YES")
  end

  test "Consistent yes teacher surveys override other surveys and state data" do
    school_year = 2020
    school = create :census_school,
      :with_teaches_yes_teacher_census_submission,
      :with_teaches_no_parent_census_submission,
      school_year: school_year
    validate_summary(school, school_year, "YES")
  end

  test "Consistent no teacher surveys override other surveys and state data" do
    school_year = 2020
    school = create :census_school,
      :with_teaches_no_teacher_census_submission,
      :with_teaches_yes_parent_census_submission,
      :with_state_cs_offering,
      :with_one_year_ago_teaches_yes,
      :with_two_years_ago_teaches_yes,
      school_year: school_year
    validate_summary(school, school_year, "NO")
  end

  test "State data overrides consistent non-teacher surveys and inconsistent teacher surveys" do
    school_year = 2020
    school = create :census_school,
      :with_teaches_no_teacher_census_submission,
      :with_teaches_yes_teacher_census_submission,
      :with_teaches_no_parent_census_submission,
      :with_state_cs_offering,
      :with_one_year_ago_teaches_no,
      :with_two_years_ago_teaches_no,
      school_year: school_year
    validate_summary(school, school_year, "YES")
  end

  test "High school lack of state data overrides consistent non-teacher surveys and inconsistent teacher surveys" do
    school_year = 2020
    school = create :census_school,
      :with_teaches_no_teacher_census_submission,
      :with_teaches_yes_teacher_census_submission,
      :with_teaches_yes_parent_census_submission,
      :with_one_year_ago_teaches_yes,
      :with_two_years_ago_teaches_yes,
      school_year: school_year
    validate_summary(school, school_year, "NO")
  end

  test "Consistent yes non-teacher surveys override other surveys" do
    school_year = 2020
    school = create :census_school,
      :with_teaches_yes_teacher_census_submission,
      :with_teaches_no_teacher_census_submission,
      :with_teaches_yes_parent_census_submission,
      :with_state_not_having_state_data,
      :with_one_year_ago_teaches_no,
      :with_two_years_ago_teaches_no,
      school_year: school_year
    validate_summary(school, school_year, "YES")
  end

  test "Consistent no non-teacher surveys override other surveys" do
    school_year = 2020
    school = create :census_school,
      :with_teaches_yes_teacher_census_submission,
      :with_teaches_no_teacher_census_submission,
      :with_teaches_no_parent_census_submission,
      :with_state_not_having_state_data,
      :with_one_year_ago_teaches_yes,
      :with_two_years_ago_teaches_yes,
      school_year: school_year
    validate_summary(school, school_year, "NO")
  end

  test "Last year yes overrides two years ago data" do
    school_year = 2020
    school = create :census_school,
      :with_state_not_having_state_data,
      :with_one_year_ago_teaches_yes,
      :with_two_years_ago_teaches_no,
      school_year: school_year
    validate_summary(school, school_year, "HISTORICAL_YES")
  end

  test "Last year no overrides two years ago data" do
    school_year = 2020
    school = create :census_school,
      :with_state_not_having_state_data,
      :with_one_year_ago_teaches_no,
      :with_two_years_ago_teaches_yes,
      school_year: school_year
    validate_summary(school, school_year, "HISTORICAL_NO")
  end

  test "Last year maybe overrides two years ago data" do
    school_year = 2020
    school = create :census_school,
      :with_state_not_having_state_data,
      :with_one_year_ago_teaches_maybe,
      :with_two_years_ago_teaches_yes,
      school_year: school_year
    validate_summary(school, school_year, "HISTORICAL_MAYBE")
  end

  test "Just two years ago yes is used" do
    school_year = 2020
    school = create :census_school,
      :with_state_not_having_state_data,
      :with_two_years_ago_teaches_yes,
      school_year: school_year
    validate_summary(school, school_year, "HISTORICAL_YES")
  end

  test "Just two years ago no is used" do
    school_year = 2020
    school = create :census_school,
      :with_state_not_having_state_data,
      :with_two_years_ago_teaches_no,
      school_year: school_year
    validate_summary(school, school_year, "HISTORICAL_NO")
  end

  test "Just two years ago maybe is used" do
    school_year = 2020
    school = create :census_school,
      :with_state_not_having_state_data,
      :with_two_years_ago_teaches_maybe,
      school_year: school_year
    validate_summary(school, school_year, "HISTORICAL_MAYBE")
  end

  test "No data is a nil teaches_cs" do
    school_year = 2020
    school = create :census_school,
      :with_state_not_having_state_data,
      school_year: school_year
    summary = generate_summary(school, school_year)
    assert_nil summary.teaches_cs, summary.audit_data
  end

  def generate_summary(school, year)
    summaries = Census::CensusSummary.summarize_school_data(
      school,
      [year - 2, year - 1, year],
      [year],
      [year],
      {
        school.state => [year]
      },
    )
    summaries.last
  end

  def validate_summary(school, year, expected_result)
    summary = generate_summary(school, year)
    assert_equal expected_result, summary.teaches_cs, summary.audit_data
  end
end
