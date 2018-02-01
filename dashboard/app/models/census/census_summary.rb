# == Schema Information
#
# Table name: census_summaries
#
#  id          :integer          not null, primary key
#  school_id   :string(12)       not null
#  school_year :integer          not null
#  teaches_cs  :string(1)
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
  }.freeze
  enum teaches_cs: TEACHES

  validates_presence_of :audit_data

  def self.submission_teaches_cs(submission, is_high_school)
    if is_high_school
      (submission.how_many_20_hours_some? || submission.how_many_20_hours_all?)
    else
      (
        submission.how_many_10_hours_some? ||
        submission.how_many_10_hours_all? ||
        submission.how_many_20_hours_some? ||
        submission.how_many_20_hours_all?
      )
    end
  end

  def self.summarize_census_data
    latest_survey_year = Census::CensusSubmission.maximum(:school_year)
    latest_ap_data_year = Census::ApCsOffering.maximum(:school_year)
    latest_ib_data_year = Census::IbCsOffering.maximum(:school_year)
    latest_state_data_years = {}
    state_years_with_data = {}
    Census::StateCsOffering::SUPPORTED_STATES.each do |state|
      state_years_with_data[state] = Census::StateCsOffering.
                                       joins(:school).
                                       where(schools: {state: state}).
                                       select(:school_year).
                                       group(:school_year).
                                       map(&:school_year)
      latest_state_data_years[state] = state_years_with_data[state].max
    end

    max_year = [
      latest_survey_year,
      latest_ap_data_year,
      latest_ib_data_year,
      latest_state_data_years.map {|_, v| v}.max
    ].max
    school_years = (2016..max_year)

    ActiveRecord::Base.transaction do
      School.eager_load(school_info: :census_submissions).
        eager_load(ap_school_code: :ap_cs_offering).
        eager_load(ib_school_code: :ib_cs_offering).
        eager_load(:state_cs_offering).
        eager_load(:school_stats_by_year).
        find_each do |school|

        school_years.each do |school_year|
          audit = {
            version: 0.1,
            stats: [],
            census_submissions: [],
            ap_cs_offerings: [],
            ib_cs_offerings: [],
            state_cs_offerings: [],
          }
          yes_count = 0
          no_count = 0

          # If the schools doesn't have stats then treat it as not high school.
          # The lack of stats will show up in the audit data as a null value for high_school.
          stats = school.school_stats_by_year.try(:sort).try(:last)
          high_school = stats.try(:has_high_school_grades?)
          audit[:stats].push({high_school: high_school})

          # Census Submissions
          submissions = school.school_info.map(&:census_submissions).flatten
          # Lack of a submission for a school isn't considered evidence
          # so we only look at actual submissions.
          submissions.select {|s| s.school_year == school_year}.each do |submission|
            # Treat an "I don't know" response the same as not having any response
            if high_school ? submission.how_many_20_hours_dont_know? : submission.how_many_10_hours_dont_know?
              audit[:census_submissions].push(
                {
                  id: submission.id,
                  skipped: true,
                }
              )
              next
            end

            teaches = submission_teaches_cs(submission, high_school)

            audit[:census_submissions].push(
              {
                id: submission.id,
                teaches: teaches
              }
            )

            if teaches
              yes_count += 1
            else
              no_count += 1
            end
          end

          # AP data
          ap_offerings = school.ap_school_code.try(:ap_cs_offering) || []
          ap_offerings.select {|o| o.school_year == school_year}.each do |offering|
            audit[:ap_cs_offerings].push(offering.id)
            yes_count += 1
          end

          # IB data
          ib_offerings = school.ib_school_code.try(:ib_cs_offering) || []
          ib_offerings.select {|o| o.school_year == school_year}.each do |offering|
            audit[:ib_cs_offerings].push(offering.id)
            yes_count += 1
          end

          # State data

          # Schools without state school ids cannot have state data.
          # Ignore those schools so that we won't count the lack of
          # state data as a NO.
          if school.state_school_id
            state_offerings = school.state_cs_offering || []
            state_offerings = state_offerings.select {|o| o.school_year == school_year}
            # If we have any state data for this year then a high school
            # without a row is counted as a NO
            if high_school &&
               state_offerings.empty? &&
               Census::StateCsOffering::SUPPORTED_STATES.include?(school.state) &&
               state_years_with_data[school.state].include?(school_year)
              audit[:state_cs_offerings].push(nil)
              no_count += 1
            else
              state_offerings.each do |offering|
                audit[:state_cs_offerings].push(offering.id)
                yes_count += 1
              end
            end
          end

          summary = Census::CensusSummary.find_or_initialize_by(
            school: school,
            school_year: school_year,
          )

          summary.audit_data = JSON.generate(audit)

          summary.teaches_cs =
            if yes_count == 0 && no_count == 0
              nil
            elsif yes_count == 0
              'N'
            elsif no_count == 0
              'Y'
            else
              'M'
            end

          summary.save!
        end
      end
    end
  end
end
