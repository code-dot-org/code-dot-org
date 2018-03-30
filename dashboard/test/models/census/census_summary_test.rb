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

  test "Override outweighs all other data sources" do
    school_year = 2020
    school = create :census_school,
      :with_census_override_no,
      :with_teaches_yes_teacher_census_submission,
      :with_ap_cs_offering,
      :with_ib_cs_offering,
      :with_one_year_ago_teaches_yes,
      :with_two_years_ago_teaches_yes,
      :with_three_years_ago_teaches_yes,
      school_year: school_year
    validate_summary(school, school_year, "NO")
  end

  test "Latest override is used when there are many" do
    school_year = 2020
    school = create :census_school,
      :with_census_override_no,
      :with_census_override_maybe,
      school_year: school_year
    # create another override separately to make sure it has a later created_at
    create :census_override,
      school: school,
      school_year: school_year,
      teaches_cs: 'HISTORICAL_YES',
      created_at: school.created_at + 1.minute

    validate_summary(school, school_year, "HISTORICAL_YES")
  end

  test "AP data overrides surveys, state data, and previous years" do
    school_year = 2020
    school = create :census_school,
      :with_teaches_no_teacher_census_submission,
      :with_ap_cs_offering,
      :with_one_year_ago_teaches_no,
      :with_two_years_ago_teaches_no,
      :with_three_years_ago_teaches_no,
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
      :with_three_years_ago_teaches_no,
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
      :with_three_years_ago_teaches_yes,
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
      :with_three_years_ago_teaches_no,
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
      :with_three_years_ago_teaches_yes,
      school_year: school_year
    validate_summary(school, school_year, "NO")
  end

  test "High school lack of state data in a blacklist state does not override anything" do
    school_year = 2020
    school = create :census_school,
      :with_teaches_no_teacher_census_submission,
      :with_teaches_yes_teacher_census_submission,
      :with_teaches_yes_parent_census_submission,
      :with_one_year_ago_teaches_yes,
      :with_two_years_ago_teaches_yes,
      :with_three_years_ago_teaches_yes,
      state: Census::StateCsOffering::INFERRED_NO_EXCLUSION_LIST.first,
      school_year: school_year
    validate_summary(school, school_year, "MAYBE")
  end

  test "Inconsistent teacher surveys override other surveys" do
    school_year = 2020
    school = create :census_school,
      :with_teaches_yes_teacher_census_submission,
      :with_teaches_no_teacher_census_submission,
      :with_teaches_yes_parent_census_submission,
      :with_state_not_having_state_data,
      :with_one_year_ago_teaches_no,
      :with_two_years_ago_teaches_no,
      :with_three_years_ago_teaches_no,
      school_year: school_year
    validate_summary(school, school_year, "MAYBE")
  end

  test "Consistent yes non-teacher surveys override previous years" do
    school_year = 2020
    school = create :census_school,
      :with_teaches_yes_parent_census_submission,
      :with_state_not_having_state_data,
      :with_one_year_ago_teaches_no,
      :with_two_years_ago_teaches_no,
      :with_three_years_ago_teaches_no,
      school_year: school_year
    validate_summary(school, school_year, "YES")
  end

  test "Consistent no non-teacher surveys override previous years" do
    school_year = 2020
    school = create :census_school,
      :with_teaches_no_parent_census_submission,
      :with_state_not_having_state_data,
      :with_one_year_ago_teaches_yes,
      :with_two_years_ago_teaches_yes,
      :with_three_years_ago_teaches_yes,
      school_year: school_year
    validate_summary(school, school_year, "NO")
  end

  test "Last year yes overrides two years ago data" do
    school_year = 2020
    school = create :census_school,
      :with_state_not_having_state_data,
      :with_one_year_ago_teaches_yes,
      :with_two_years_ago_teaches_no,
      :with_three_years_ago_teaches_no,
      school_year: school_year
    validate_summary(school, school_year, "HISTORICAL_YES")
  end

  test "Last year no overrides two years ago data" do
    school_year = 2020
    school = create :census_school,
      :with_state_not_having_state_data,
      :with_one_year_ago_teaches_no,
      :with_two_years_ago_teaches_yes,
      :with_three_years_ago_teaches_yes,
      school_year: school_year
    validate_summary(school, school_year, "HISTORICAL_NO")
  end

  test "Last year maybe overrides two years ago data" do
    school_year = 2020
    school = create :census_school,
      :with_state_not_having_state_data,
      :with_one_year_ago_teaches_maybe,
      :with_two_years_ago_teaches_yes,
      :with_three_years_ago_teaches_no,
      school_year: school_year
    validate_summary(school, school_year, "HISTORICAL_MAYBE")
  end

  test "Just two years ago yes is used" do
    school_year = 2020
    school = create :census_school,
      :with_state_not_having_state_data,
      :with_two_years_ago_teaches_yes,
      :with_three_years_ago_teaches_no,
      school_year: school_year
    validate_summary(school, school_year, "HISTORICAL_YES")
  end

  test "Just two years ago no is used" do
    school_year = 2020
    school = create :census_school,
      :with_state_not_having_state_data,
      :with_two_years_ago_teaches_no,
      :with_three_years_ago_teaches_yes,
      school_year: school_year
    validate_summary(school, school_year, "HISTORICAL_NO")
  end

  test "Just two years ago maybe is used" do
    school_year = 2020
    school = create :census_school,
      :with_state_not_having_state_data,
      :with_two_years_ago_teaches_maybe,
      :with_three_years_ago_teaches_no,
      school_year: school_year
    validate_summary(school, school_year, "HISTORICAL_MAYBE")
  end

  test "Three years ago data is not used" do
    school_year = 2020
    school = create :census_school,
      :with_state_not_having_state_data,
      :with_three_years_ago_teaches_maybe,
      school_year: school_year
    summary = generate_summary(school, school_year)
    assert_nil summary.teaches_cs, summary.audit_data
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
      {
        school: school,
        school_years: [year - 3, year - 2, year - 1, year],
        years_with_ap_data: [year],
        years_with_ib_data: [year],
        state_years_with_data: {
          school.state => [year]
        },
      }
    )
    summaries.last
  end

  def validate_summary(school, year, expected_result)
    summary = generate_summary(school, year)
    assert_equal expected_result, summary.teaches_cs, summary.audit_data
    explanation = JSON.parse(summary.audit_data)['explanation']
    validate_explanation(explanation)
    # only one datum shoud be used for the decision
    assert_equal 1, explanation.map {|e| e['used'] ? 1 : 0}.reduce(:+), explanation
  end

  def empty_compute_teaches_cs_args
    {
      audit: {},
      overrides_summary: {
        should_override: false,
        override_value: nil,
      },
      has_ap_data: false,
      has_ib_data: false,
      submissions_summary: {
        consistency: {
          teacher_or_admin: nil,
          not_teacher_or_admin: nil,
        },
        has_inconsistent_surveys: {
          teacher_or_admin: false,
          not_teacher_or_admin: false,
        },
        counts: {
          teacher_or_admin: {
            yes: 0,
            no: 0,
          },
          not_teacher_or_admin: {
            yes: 0,
            no: 0,
          },
        }
      },
      state_summary: nil,
      previous_years_results: [nil, nil, nil],
    }
  end

  def compute_teaches_cs(args)
    Census::CensusSummary.compute_teaches_cs(
      args[:overrides_summary],
      args[:has_ap_data],
      args[:has_ib_data],
      args[:submissions_summary],
      args[:state_summary],
      args[:previous_years_results],
      args[:audit]
    )
  end

  def validate_explanation(explanation)
    assert_not_nil explanation
    assert_equal 9, explanation.length, explanation
  end

  test "compute_teaches_cs without data gives correct results" do
    args = empty_compute_teaches_cs_args
    teaches_cs = compute_teaches_cs args

    assert_nil teaches_cs
    explanation = args[:audit][:explanation]
    validate_explanation explanation
    explanation.each do |e|
      refute e['used'], e
      assert_nil e['value'], e
    end
  end

  def validate_compute_teaches_cs_with_override(override_value)
    args = empty_compute_teaches_cs_args
    args[:overrides_summary] = {
      should_override: true,
      override_value: override_value,
    }

    teaches_cs = compute_teaches_cs args

    assert_equal override_value, teaches_cs, args[:audit] unless override_value.nil?
    assert_nil teaches_cs, args[:audit] if override_value.nil?
    explanation = args[:audit][:explanation]
    validate_explanation explanation
    explanation.select {|e| e[:label] == 'overrides'}.first.tap do |e|
      assert e[:used], e
      assert_equal override_value, e[:value], e unless override_value.nil?
      assert_nil e[:value], e if override_value.nil?
    end
  end

  test "compute_teaches_cs with yes override gives correct results" do
    validate_compute_teaches_cs_with_override('YES')
  end

  test "compute_teaches_cs with no override gives correct results" do
    validate_compute_teaches_cs_with_override('NO')
  end

  test "compute_teaches_cs with maybe override gives correct results" do
    validate_compute_teaches_cs_with_override('MAYBE')
  end

  test "compute_teaches_cs with historic yes override gives correct results" do
    validate_compute_teaches_cs_with_override('HISTORIC_YES')
  end

  test "compute_teaches_cs with historic no override gives correct results" do
    validate_compute_teaches_cs_with_override('HISTORIC_NO')
  end

  test "compute_teaches_cs with historic maybe override gives correct results" do
    validate_compute_teaches_cs_with_override('HISTORIC_MAYBE')
  end

  test "compute_teaches_cs with nil override gives correct results" do
    validate_compute_teaches_cs_with_override(nil)
  end

  test "compute_teaches_cs with AP data gives correct results" do
    args = empty_compute_teaches_cs_args
    args[:has_ap_data] = true
    teaches_cs = compute_teaches_cs args

    assert_equal 'YES', teaches_cs, args[:audit]
    explanation = args[:audit][:explanation]
    validate_explanation explanation
    explanation.select {|e| e[:label] == 'offers_ap'}.first.tap do |e|
      assert e[:used], e
      assert e[:value], e
    end
  end

  test "compute_teaches_cs with IB data gives correct results" do
    args = empty_compute_teaches_cs_args
    args[:has_ib_data] = true
    teaches_cs = compute_teaches_cs args

    assert_equal 'YES', teaches_cs, args[:audit]
    explanation = args[:audit][:explanation]
    validate_explanation explanation
    explanation.select {|e| e[:label] == 'offers_ib'}.first.tap do |e|
      assert e[:used], e
      assert e[:value], e
    end
  end

  test "compute_teaches_cs with consistent yes teacher surveys gives correct results" do
    args = empty_compute_teaches_cs_args
    args[:submissions_summary] = {
      consistency: {
        teacher_or_admin: 'YES',
        not_teacher_or_admin: nil,
      },
      has_inconsistent_surveys: {
        teacher_or_admin: false,
        not_teacher_or_admin: false,
      },
      counts: {
        teacher_or_admin: {
          yes: 5,
          no: 0,
        },
        not_teacher_or_admin: {
          yes: 0,
          no: 0,
        },
      }
    }

    teaches_cs = compute_teaches_cs args

    assert_equal 'YES', teaches_cs, args[:audit]
    explanation = args[:audit][:explanation]
    validate_explanation explanation
    explanation.select {|e| e[:label] == 'consistent_teacher_surveys'}.first.tap do |e|
      assert e[:used], e
      assert_equal({yes: 5, no: 0}, e[:value], e)
    end
  end

  test "compute_teaches_cs with consistent no teacher surveys gives correct results" do
    args = empty_compute_teaches_cs_args
    args[:submissions_summary] = {
      consistency: {
        teacher_or_admin: 'NO',
        not_teacher_or_admin: nil,
      },
      has_inconsistent_surveys: {
        teacher_or_admin: false,
        not_teacher_or_admin: false,
      },
      counts: {
        teacher_or_admin: {
          yes: 0,
          no: 5,
        },
        not_teacher_or_admin: {
          yes: 0,
          no: 0,
        },
      }
    }

    teaches_cs = compute_teaches_cs args

    assert_equal 'NO', teaches_cs, args[:audit]
    explanation = args[:audit][:explanation]
    validate_explanation explanation
    explanation.select {|e| e[:label] == 'consistent_teacher_surveys'}.first.tap do |e|
      assert e[:used], e
      assert_equal({yes: 0, no: 5}, e[:value], e)
    end
  end

  test "compute_teaches_cs with state yes data gives correct results" do
    args = empty_compute_teaches_cs_args
    args[:state_summary] = 'YES'
    teaches_cs = compute_teaches_cs args

    assert_equal 'YES', teaches_cs, args[:audit]
    explanation = args[:audit][:explanation]
    validate_explanation explanation
    explanation.select {|e| e[:label] == 'state_offering'}.first.tap do |e|
      assert e[:used], e
      assert e[:value], e
    end
  end

  test "compute_teaches_cs with state no data gives correct results" do
    args = empty_compute_teaches_cs_args
    args[:state_summary] = 'NO'
    teaches_cs = compute_teaches_cs args

    assert_equal 'NO', teaches_cs, args[:audit]
    explanation = args[:audit][:explanation]
    validate_explanation explanation
    explanation.select {|e| e[:label] == 'state_offering'}.first.tap do |e|
      assert e[:used], e
      refute e[:value], e
    end
  end

  test "compute_teaches_cs with consistent yes non teacher surveys gives correct results" do
    args = empty_compute_teaches_cs_args
    args[:submissions_summary] = {
      consistency: {
        teacher_or_admin: nil,
        not_teacher_or_admin: 'YES',
      },
      has_inconsistent_surveys: {
        teacher_or_admin: false,
        not_teacher_or_admin: false,
      },
      counts: {
        teacher_or_admin: {
          yes: 0,
          no: 0,
        },
        not_teacher_or_admin: {
          yes: 5,
          no: 0,
        },
      }
    }

    teaches_cs = compute_teaches_cs args

    assert_equal 'YES', teaches_cs, args[:audit]
    explanation = args[:audit][:explanation]
    validate_explanation explanation
    explanation.select {|e| e[:label] == 'non_teacher_surveys'}.first.tap do |e|
      assert e[:used], e
      assert_equal({yes: 5, no: 0}, e[:value], e)
    end
  end

  test "compute_teaches_cs with consistent no non teacher surveys gives correct results" do
    args = empty_compute_teaches_cs_args
    args[:submissions_summary] = {
      consistency: {
        teacher_or_admin: nil,
        not_teacher_or_admin: 'NO',
      },
      has_inconsistent_surveys: {
        teacher_or_admin: false,
        not_teacher_or_admin: false,
      },
      counts: {
        teacher_or_admin: {
          yes: 0,
          no: 0,
        },
        not_teacher_or_admin: {
          yes: 0,
          no: 5,
        },
      }
    }

    teaches_cs = compute_teaches_cs args

    assert_equal 'NO', teaches_cs, args[:audit]
    explanation = args[:audit][:explanation]
    validate_explanation explanation
    explanation.select {|e| e[:label] == 'non_teacher_surveys'}.first.tap do |e|
      assert e[:used], e
      assert_equal({yes: 0, no: 5}, e[:value], e)
    end
  end

  test "compute_teaches_cs with inconsistent teacher surveys gives correct results" do
    args = empty_compute_teaches_cs_args
    args[:submissions_summary] = {
      consistency: {
        teacher_or_admin: nil,
        not_teacher_or_admin: nil,
      },
      has_inconsistent_surveys: {
        teacher_or_admin: true,
        not_teacher_or_admin: true,
      },
      counts: {
        teacher_or_admin: {
          yes: 5,
          no: 1,
        },
        not_teacher_or_admin: {
          yes: 5,
          no: 5,
        },
      }
    }

    teaches_cs = compute_teaches_cs args

    assert_equal 'MAYBE', teaches_cs, args[:audit]
    explanation = args[:audit][:explanation]
    validate_explanation explanation
    explanation.select {|e| e[:label] == 'inconsistent_teacher_surveys'}.first.tap do |e|
      assert e[:used], e
      assert_equal({yes: 5, no: 1}, e[:value], e)
    end
    explanation.select {|e| e[:label] == 'non_teacher_surveys'}.first.tap do |e|
      refute e[:used], e
      assert_equal({yes: 5, no: 5}, e[:value], e)
    end
  end

  def validate_compute_teaches_cs_with_last_years_value(last_years_value, expected_teaches_cs, expected_used)
    args = empty_compute_teaches_cs_args
    args[:previous_years_results] = [last_years_value, nil]
    teaches_cs = compute_teaches_cs args

    assert_equal expected_teaches_cs, teaches_cs, args[:audit] unless expected_teaches_cs.nil?
    assert_nil teaches_cs, args[:audit] if expected_teaches_cs.nil?
    explanation = args[:audit][:explanation]
    validate_explanation explanation
    explanation.select {|e| e[:label] == 'last_years_summary'}.first.tap do |e|
      assert_equal expected_used, e[:used], e
      assert_equal last_years_value, e[:value], e unless last_years_value.nil?
      assert_nil e[:value], e if last_years_value.nil?
    end
  end

  test "compute_teaches_cs with last year yes gives correct results" do
    validate_compute_teaches_cs_with_last_years_value('YES', 'HISTORICAL_YES', true)
  end

  test "compute_teaches_cs with last year no gives correct results" do
    validate_compute_teaches_cs_with_last_years_value('NO', 'HISTORICAL_NO', true)
  end

  test "compute_teaches_cs with last year maybe gives correct results" do
    validate_compute_teaches_cs_with_last_years_value('MAYBE', 'HISTORICAL_MAYBE', true)
  end

  test "compute_teaches_cs with last year historical yes gives correct results" do
    validate_compute_teaches_cs_with_last_years_value('HISTORICAL_YES', nil, false)
  end

  test "compute_teaches_cs with last year historical no gives correct results" do
    validate_compute_teaches_cs_with_last_years_value('HISTORICAL_NO', nil, false)
  end

  test "compute_teaches_cs with last year historical maybe gives correct results" do
    validate_compute_teaches_cs_with_last_years_value('HISTORICAL_MAYBE', nil, false)
  end

  def validate_compute_teaches_cs_with_two_years_ago_value(two_years_ago_value, expected_teaches_cs, expected_used)
    args = empty_compute_teaches_cs_args
    args[:previous_years_results] = [nil, two_years_ago_value]
    teaches_cs = compute_teaches_cs args

    assert_equal expected_teaches_cs, teaches_cs, args[:audit] unless expected_teaches_cs.nil?
    assert_nil teaches_cs, args[:audit] if expected_teaches_cs.nil?
    explanation = args[:audit][:explanation]
    validate_explanation explanation
    explanation.select {|e| e[:label] == 'two_years_agos_summary'}.first.tap do |e|
      assert_equal expected_used, e[:used], e
      assert_equal two_years_ago_value, e[:value], e unless two_years_ago_value.nil?
      assert_nil e[:value], e if two_years_ago_value.nil?
    end
  end

  test "compute_teaches_cs with two years ago yes gives correct results" do
    validate_compute_teaches_cs_with_two_years_ago_value('YES', 'HISTORICAL_YES', true)
  end

  test "compute_teaches_cs with two years ago no gives correct results" do
    validate_compute_teaches_cs_with_two_years_ago_value('NO', 'HISTORICAL_NO', true)
  end

  test "compute_teaches_cs with two years ago maybe gives correct results" do
    validate_compute_teaches_cs_with_two_years_ago_value('MAYBE', 'HISTORICAL_MAYBE', true)
  end

  test "compute_teaches_cs with two years ago historical yes gives correct results" do
    validate_compute_teaches_cs_with_two_years_ago_value('HISTORICAL_YES', nil, false)
  end

  test "compute_teaches_cs with two years ago historical no gives correct results" do
    validate_compute_teaches_cs_with_two_years_ago_value('HISTORICAL_NO', nil, false)
  end

  test "compute_teaches_cs with two years ago historical maybe gives correct results" do
    validate_compute_teaches_cs_with_two_years_ago_value('HISTORICAL_MAYBE', nil, false)
  end
end
