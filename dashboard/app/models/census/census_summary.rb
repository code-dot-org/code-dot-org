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

  def self.summarize_ap_data(school, school_year, audit)
    ap_offerings_this_year = []
    school.ap_school_code.each do |ap_school_code|
      ap_offerings = ap_school_code.try(:ap_cs_offering) || []
      ap_offerings_filtered = ap_offerings.select {|o| o.school_year == school_year}
      ap_offerings_filtered.each do |offering|
        audit[:ap_cs_offerings].push(offering.id)
      end
      ap_offerings_this_year.push(*ap_offerings_filtered)
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
         Census::StateCsOffering.infer_no(school.state, school_year) &&
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
end
