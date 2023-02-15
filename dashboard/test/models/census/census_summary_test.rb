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

  def validate_explanation(explanation)
    assert_not_nil explanation
    assert_equal 9, explanation.length, explanation
  end
end
