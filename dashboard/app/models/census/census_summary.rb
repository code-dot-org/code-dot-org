# == Schema Information
#
# Table name: census_summaries
#
#  id          :integer          not null, primary key
#  school_id   :string(12)       not null
#  school_year :integer          not null
#  teaches_cs  :string(2)
#  audit_data  :text(65535)      not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_census_summaries_on_school_id_and_school_year  (school_id,school_year) UNIQUE
#

class Census::CensusSummary < ApplicationRecord
  belongs_to :school
  validates_presence_of :school_id
  validates :school_year, presence: true, numericality: {greater_than_or_equal_to: 2015, less_than_or_equal_to: 2030}

  TEACHES = {
    YES: "Y",
    NO: "N",
    MAYBE: "M",
    HISTORICAL_YES: "HY",
    HISTORICAL_NO: "HN",
    HISTORICAL_MAYBE: "HM",
  }.freeze
  enum teaches_cs: TEACHES

  validates_presence_of :audit_data

  # High schools need to teach a 20 hour course with either
  # block- or text-based programming for it to count as CS.
  # Other schools can teach any 10 or 20 hour courses.
  # Schools that are a mix of K8 and high school use the K8 logic.
  # The teacher banner does not have the topic check boxes
  # so we count those submissions even though they don't have
  # those options checked.
  def self.submission_teaches_cs?(submission, is_high_school:, is_k8_school:)
    if is_high_school && !is_k8_school
      (
        (
          submission.how_many_20_hours_some? ||
          submission.how_many_20_hours_all?
        ) &&
        (
          submission.type == "Census::CensusTeacherBannerV1" ||
          submission.topic_text ||
          submission.topic_blocks
        )
      )
    else
      (
        submission.how_many_10_hours_some? ||
        submission.how_many_10_hours_all? ||
        submission.how_many_20_hours_some? ||
        submission.how_many_20_hours_all?
      )
    end
  end

  def self.submission_has_response(submission, is_high_school)
    # Treat an "I don't know" response the same as not having any response
    if is_high_school
      !(submission.how_many_20_hours.nil? || submission.how_many_20_hours_dont_know?)
    else
      !(submission.how_many_10_hours.nil? || submission.how_many_10_hours_dont_know?) ||
      !(submission.how_many_20_hours.nil? || submission.how_many_20_hours_dont_know?)
    end
  end

  HISTORICAL_RESULTS_MAP = {
    "YES" => "HISTORICAL_YES",
    "NO" => "HISTORICAL_NO",
    "MAYBE" => "HISTORICAL_MAYBE",
  }

  def self.map_historical_teaches_cs(historical_value)
    HISTORICAL_RESULTS_MAP[historical_value]
  end

  def self.summarize_submission_data(school, school_year, high_school, k8_school, audit)
    submissions = school.school_info.map(&:census_submissions).flatten
    # Lack of a submission for a school isn't considered evidence
    # so we only look at actual submissions.
    counts = {
      teacher_or_admin: {
        yes: 0,
        no: 0,
      },
      not_teacher_or_admin: {
        yes: 0,
        no: 0,
      },
    }
    submissions.select {|s| s.school_year == school_year}.each do |submission|
      teaches =
        if submission_has_response(submission, high_school)
          submission_teaches_cs?(submission, is_high_school: high_school, is_k8_school: k8_school)
        else
          nil
        end

      is_teacher_or_admin = (submission.submitter_role_teacher? || submission.submitter_role_administrator?)
      teacher_or_admin = is_teacher_or_admin ? :teacher_or_admin : :not_teacher_or_admin

      audit[:census_submissions].push(
        {
          id: submission.id,
          teaches: teaches,
          teacher_or_admin: teacher_or_admin,
        }
      )

      next if teaches.nil?

      if teaches
        counts[teacher_or_admin][:yes] += 1
      else
        counts[teacher_or_admin][:no] += 1
      end
    end

    audit[:census_submissions].push({counts: counts})

    consistency = {
      teacher_or_admin: nil,
      not_teacher_or_admin: nil,
    }
    has_inconsistent_surveys = {
      teacher_or_admin: false,
      not_teacher_or_admin: false,
    }

    [:teacher_or_admin, :not_teacher_or_admin].each do |role|
      unless counts[role][:no] == 0 && counts[role][:yes] == 0
        if counts[role][:no] == 0
          consistency[role] = "YES"
        elsif counts[role][:yes] == 0
          consistency[role] = "NO"
        else
          has_inconsistent_surveys[role] = true
        end
      end
    end

    return {
      consistency: consistency,
      has_inconsistent_surveys: has_inconsistent_surveys,
      counts: counts,
    }
  end

  def self.summarize_ap_data(school, school_year, audit)
    ap_offerings = school.ap_school_code.try(:ap_cs_offering) || []
    ap_offerings_this_year = ap_offerings.select {|o| o.school_year == school_year}
    ap_offerings_this_year.each do |offering|
      audit[:ap_cs_offerings].push(offering.id)
    end
    ap_offerings_this_year.present?
  end

  def self.summarize_ib_data(school, school_year, audit)
    ib_offerings = school.ib_school_code.try(:ib_cs_offering) || []
    ib_offerings_this_year = ib_offerings.select {|o| o.school_year == school_year}
    ib_offerings_this_year.each do |offering|
      audit[:ib_cs_offerings].push(offering.id)
    end
    ib_offerings_this_year.present?
  end

  def self.summarize_state_data(school, school_year, high_school, state_years_with_data, audit)
    # Schools without state school ids cannot have state data.
    # Ignore those schools so that we won't count the lack of
    # state data as a NO.
    state_data = nil
    if school.state_school_id
      state_offerings = school.state_cs_offering || []
      state_offerings = state_offerings.select {|o| o.school_year == school_year}
      # If we have any state data for this year then a high school
      # without a row is counted as a NO
      if high_school &&
         state_offerings.empty? &&
         Census::StateCsOffering.infer_no(school.state) &&
         Census::StateCsOffering::SUPPORTED_STATES.include?(school.state) &&
         state_years_with_data[school.state].include?(school_year)
        audit[:state_cs_offerings].push(nil)
        state_data = 'NO'
      else
        state_offerings.each do |offering|
          audit[:state_cs_offerings].push(offering.id)
        end
        state_data = 'YES' unless state_offerings.empty?
      end
    end
    state_data
  end

  def self.summarize_override_data(overrides, school_year, audit)
    audit[:overrides] = {
      records: [],
    }

    overrides_summary = {
      should_override: false,
      override_value: nil,
    }

    overrides.order(:created_at).select {|o| o.school_year == school_year}.each do |o|
      audit[:overrides][:records].push({id: o.id, teaches_cs: o.teaches_cs})
      overrides_summary[:should_override] = true
      overrides_summary[:override_value] = o.teaches_cs
    end

    return overrides_summary
  end

  def self.conditional_result(detail_label, condition, new_result, detail_value, current_result, details, set_value_when_not_used = false)
    result = current_result
    if condition
      value = detail_value
      used = result.nil?
      result = new_result if result.nil?
    else
      value = set_value_when_not_used ? detail_value : nil
      used = false
    end
    details.push(
      {
        label: detail_label,
        value: value,
        used: used,
      }
    )

    return result
  end

  #
  # We will set teaches_cs to the first value we find in this order:
  # 0 Overrides
  # 1	This year's AP data
  # 2	This year's IB data
  # 3	This year's surveys from teachers/administrators - consistent
  # 4	State data
  # 5	This year's surveys from teachers/admins - inconsistent
  # 6	This year's surveys from non-teachers/admins
  # 7	teaches_cs from last year
  # 8	teaches_cs from 2 years ago
  # 9 nil
  #
  def self.compute_teaches_cs(overrides_summary, has_ap_data, has_ib_data, submissions_summary, state_summary, previous_years_results, audit)
    result = nil
    details = []

    # Each call to conditional_result will update the result if it hasn't already
    # been set and simultaneously add the appropriate data to the details array
    # so that we can explain the result in the /census/review UI. We need to make
    # the call for every data element so that we get the full data in the explanation.
    result = conditional_result(
      'overrides',
      overrides_summary[:should_override],
      overrides_summary[:override_value],
      overrides_summary[:override_value],
      result,
      details
    )

    result = conditional_result('offers_ap', has_ap_data, 'YES', true, result, details)
    result = conditional_result('offers_ib', has_ib_data, 'YES', true, result, details)
    result = conditional_result(
      'consistent_teacher_surveys',
      submissions_summary[:consistency][:teacher_or_admin],
      submissions_summary[:consistency][:teacher_or_admin],
      submissions_summary[:counts][:teacher_or_admin],
      result,
      details
    )

    state_value = {
      'NO' => false,
      'YES' => true,
      nil => nil
    }[state_summary]

    result = conditional_result('state_offering', state_summary, state_summary, state_value, result, details)

    result = conditional_result(
      'inconsistent_teacher_surveys',
      submissions_summary[:has_inconsistent_surveys][:teacher_or_admin],
      'MAYBE',
      submissions_summary[:counts][:teacher_or_admin],
      result,
      details
    )

    result = conditional_result(
      'non_teacher_surveys',
      submissions_summary[:consistency][:not_teacher_or_admin] || submissions_summary[:has_inconsistent_surveys][:not_teacher_or_admin],
      submissions_summary[:consistency][:not_teacher_or_admin] || 'MAYBE',
      submissions_summary[:counts][:not_teacher_or_admin],
      result,
      details
    )

    result = conditional_result(
      'last_years_summary',
      map_historical_teaches_cs(previous_years_results.first),
      map_historical_teaches_cs(previous_years_results.first),
      previous_years_results.first,
      result,
      details,
      true
    )

    result = conditional_result(
      'two_years_agos_summary',
      map_historical_teaches_cs(previous_years_results.second),
      map_historical_teaches_cs(previous_years_results.second),
      previous_years_results.second,
      result,
      details,
      true
    )

    audit[:explanation] = details
    return result
  end

  def self.empty_audit_data
    {
      version: 1.0,
      stats: {},
      census_submissions: [],
      ap_cs_offerings: [],
      ib_cs_offerings: [],
      state_cs_offerings: [],
    }
  end

  def self.get_school_stats(school, audit)
    # If the school doesn't have stats then treat it as not high school.
    # The lack of stats will show up in the audit data as a null value for high_school.
    # k8_school will behave similarly.
    stats = school.school_stats_by_year.try(:sort).try(:last)
    high_school = stats.try(:has_high_school_grades?)
    k8_school = stats.try(:has_k8_grades?)
    audit[:stats][:high_school] = high_school
    audit[:stats][:k8_school] = k8_school
    {high_school: high_school, k8_school: k8_school}
  end

  def self.summarize_school_data(summarization_data)
    school = summarization_data[:school]
    school_years = summarization_data[:school_years]
    state_years_with_data = summarization_data[:state_years_with_data]

    summaries = []
    previous_years_results = []

    school_years.each do |school_year|
      audit = empty_audit_data
      stats = get_school_stats(school, audit)

      submissions_summary = summarize_submission_data(
        school,
        school_year,
        stats[:high_school],
        stats[:k8_school],
        audit
      )
      has_ap_data = summarize_ap_data(school, school_year, audit)
      has_ib_data = summarize_ib_data(school, school_year, audit)
      state_summary = summarize_state_data(school, school_year, stats[:high_school], state_years_with_data, audit)
      overrides_summary = summarize_override_data(school.census_overrides, school_year, audit)

      summary = Census::CensusSummary.find_or_initialize_by(
        school: school,
        school_year: school_year,
      )
      summary.teaches_cs = compute_teaches_cs(
        overrides_summary,
        has_ap_data,
        has_ib_data,
        submissions_summary,
        state_summary,
        previous_years_results,
        audit
      )

      audit[:previous_years_results] = previous_years_results
      previous_years_results.unshift summary.teaches_cs

      summary.audit_data = JSON.generate(audit)
      summaries.push summary
    end

    return summaries
  end

  def self.summarize_census_data
    latest_survey_year = Census::CensusSubmission.maximum(:school_year)
    years_with_ap_data = Census::ApCsOffering.select(:school_year).group(:school_year).map(&:school_year)
    latest_ap_data_year = years_with_ap_data.max
    years_with_ib_data = Census::IbCsOffering.select(:school_year).group(:school_year).map(&:school_year)
    latest_ib_data_year = years_with_ib_data.max
    latest_data_year_by_state = {}
    state_years_with_data = {}
    Census::StateCsOffering::SUPPORTED_STATES.each do |state|
      state_years_with_data[state] = Census::StateCsOffering.
                                       joins(:school).
                                       where(schools: {state: state}).
                                       select(:school_year).
                                       group(:school_year).
                                       map(&:school_year)
      latest_data_year_by_state[state] = state_years_with_data[state].max
    end
    latest_state_data_year = latest_data_year_by_state.values.max

    latest_year = [
      latest_survey_year,
      latest_ap_data_year,
      latest_ib_data_year,
      latest_state_data_year,
    ].max
    school_years = (2016..latest_year)

    ActiveRecord::Base.transaction do
      School.eager_load(school_info: :census_submissions).
        eager_load(ap_school_code: :ap_cs_offering).
        eager_load(ib_school_code: :ib_cs_offering).
        eager_load(:state_cs_offering).
        eager_load(:school_stats_by_year).
        eager_load(:census_overrides).
        find_each do |school|

        summarize_school_data(
          {
            school: school,
            school_years: school_years,
            years_with_ap_data: years_with_ap_data,
            years_with_ib_data: years_with_ib_data,
            state_years_with_data: state_years_with_data,
          }
        ).each do |summary|
          if block_given?
            yield summary
          else
            summary.save!
          end
        end
      end
    end
  end
end
