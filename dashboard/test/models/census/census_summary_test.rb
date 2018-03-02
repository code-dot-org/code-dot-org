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

  test "School with only state data is a yes" do
    offering = create :state_cs_offering
    school = offering.school
    year = offering.school_year

    summaries = Census::CensusSummary.summarize_school_data(
      school,
      [year],
      [year],
      [year],
      {
        school.state => [year]
      },
    )

    assert_equal 1, summaries.length

    summary = summaries[0]
    assert_equal "YES", summary.teaches_cs, summary.audit_data
  end

  test "School with only AP data is a yes" do
    offering = create :ap_cs_offering
    school = offering.ap_school_code.school
    year = offering.school_year

    summaries = Census::CensusSummary.summarize_school_data(
      school,
      [year],
      [year],
      [year],
      {
        school.state => [year]
      },
    )

    assert_equal 1, summaries.length

    summary = summaries[0]
    assert_equal "YES", summary.teaches_cs, summary.audit_data
  end

  test "School with only IB data is a yes" do
    offering = create :ib_cs_offering
    school = offering.ib_school_code.school
    year = offering.school_year

    summaries = Census::CensusSummary.summarize_school_data(
      school,
      [year],
      [year],
      [year],
      {
        school.state => [year]
      },
    )

    assert_equal 1, summaries.length

    summary = summaries[0]
    assert_equal "YES", summary.teaches_cs, summary.audit_data
  end

  test "School with only yes survey is a yes" do
    submission = create :census_teacher_banner_v1, how_many_20_hours: 'ALL'
    school = submission.school_infos[0].school
    year = submission.school_year

    summaries = Census::CensusSummary.summarize_school_data(
      school,
      [year],
      [year],
      [year],
      {
        school.state => [year]
      },
    )

    assert_equal 1, summaries.length

    summary = summaries[0]
    assert_equal "YES", summary.teaches_cs, summary.audit_data
  end

  test "School with only null survey is a null" do
    submission = create :census_teacher_banner_v1,
      how_many_10_hours: nil,
      how_many_20_hours: nil
    school = submission.school_infos[0].school
    year = submission.school_year

    summaries = Census::CensusSummary.summarize_school_data(
      school,
      [year],
      [year],
      [year],
      {
        school.state => [year]
      },
    )

    assert_equal 1, summaries.length

    summary = summaries[0]
    assert_nil summary.teaches_cs, summary.audit_data
  end

  test "School with one yes survey and one no survey is a maybe" do
    submission = create :census_teacher_banner_v1, how_many_20_hours: 'ALL'
    school = submission.school_infos[0].school
    year = submission.school_year
    create :census_teacher_banner_v1,
      school_year: year,
      how_many_20_hours: 'NONE',
      how_many_10_hours: 'NONE',
      school_infos: submission.school_infos

    summaries = Census::CensusSummary.summarize_school_data(
      school,
      [year],
      [year],
      [year],
      {
        school.state => [year]
      },
    )

    assert_equal 1, summaries.length

    summary = summaries[0]
    assert_equal "MAYBE", summary.teaches_cs, summary.audit_data
  end

  test "School with state data and a no survey is a yes or maybe" do
    offering = create :state_cs_offering
    school = offering.school
    year = offering.school_year
    school_info = create :school_info, school: school
    create :census_teacher_banner_v1,
      school_year: year,
      how_many_20_hours: 'NONE',
      how_many_10_hours: 'NONE',
      school_infos: [school_info]

    summaries = Census::CensusSummary.summarize_school_data(
      school,
      [year],
      [year],
      [year],
      {
        school.state => [year]
      },
    )

    assert_equal 1, summaries.length

    summary = summaries[0]
    assert ["YES", "MAYBE"].include?(summary.teaches_cs), summary.audit_data
  end

  test "High school without AP, or IB data and a yes survey is a yes" do
    submission = create :census_teacher_banner_v1, how_many_20_hours: 'ALL', topic_text: true
    school = submission.school_infos[0].school
    year = submission.school_year
    create :school_stats_by_year, school: school

    summaries = Census::CensusSummary.summarize_school_data(
      school,
      [year],
      [year],
      [year],
      {
        school.state => [year]
      },
    )

    assert_equal 1, summaries.length

    summary = summaries[0]
    assert_equal "YES", summary.teaches_cs, summary.audit_data
  end

  test "High school without state, AP, or IB data and a yes survey is a no or maybe" do
    submission = create :census_teacher_banner_v1, how_many_20_hours: 'ALL'
    school = submission.school_infos[0].school
    school.state = Census::StateCsOffering::SUPPORTED_STATES[0]
    year = submission.school_year
    create :school_stats_by_year, school: school

    summaries = Census::CensusSummary.summarize_school_data(
      school,
      [year],
      [year],
      [year],
      {
        school.state => [year]
      },
    )

    assert_equal 1, summaries.length

    summary = summaries[0]
    assert ["NO", "MAYBE"].include?(summary.teaches_cs), summary.audit_data
  end

  test "School with AP data and a no survey is a yes or maybe" do
    offering = create :ap_cs_offering
    school = offering.ap_school_code.school
    year = offering.school_year
    school_info = create :school_info, school: school
    create :census_teacher_banner_v1,
      school_year: year,
      how_many_20_hours: 'NONE',
      how_many_10_hours: 'NONE',
      school_infos: [school_info]

    summaries = Census::CensusSummary.summarize_school_data(
      school,
      [year],
      [year],
      [year],
      {
        school.state => [year]
      },
    )

    assert_equal 1, summaries.length

    summary = summaries[0]
    assert ["YES", "MAYBE"].include?(summary.teaches_cs), summary.audit_data
  end

  test "School with IB data and a no survey is a yes or maybe" do
    offering = create :ib_cs_offering
    school = offering.ib_school_code.school
    year = offering.school_year
    school_info = create :school_info, school: school
    create :census_teacher_banner_v1,
      school_year: year,
      how_many_20_hours: 'NONE',
      how_many_10_hours: 'NONE',
      school_infos: [school_info]

    summaries = Census::CensusSummary.summarize_school_data(
      school,
      [year],
      [year],
      [year],
      {
        school.state => [year]
      },
    )

    assert_equal 1, summaries.length

    summary = summaries[0]
    assert ["YES", "MAYBE"].include?(summary.teaches_cs), summary.audit_data
  end

  test "High school with AP data but not state data is a yes or maybe" do
    offering = create :ap_cs_offering
    school = offering.ap_school_code.school
    school.state = Census::StateCsOffering::SUPPORTED_STATES[0]
    year = offering.school_year
    create :school_stats_by_year, school: school

    summaries = Census::CensusSummary.summarize_school_data(
      school,
      [year],
      [year],
      [year],
      {
        school.state => [year]
      },
    )

    assert_equal 1, summaries.length

    summary = summaries[0]
    assert ["YES", "MAYBE"].include?(summary.teaches_cs), summary.audit_data
  end

  test "High school with IB data but not state data is a yes or maybe" do
    offering = create :ib_cs_offering
    school = offering.ib_school_code.school
    school.state = Census::StateCsOffering::SUPPORTED_STATES[0]
    year = offering.school_year
    create :school_stats_by_year, school: school

    summaries = Census::CensusSummary.summarize_school_data(
      school,
      [year],
      [year],
      [year],
      {
        school.state => [year]
      },
    )

    assert_equal 1, summaries.length

    summary = summaries[0]
    assert ["YES", "MAYBE"].include?(summary.teaches_cs), summary.audit_data
  end
end
