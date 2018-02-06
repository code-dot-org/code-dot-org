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

  # High schools need to teach a 20 hour course for it to count as CS.
  # Other schools can teach 10 or 20 hour courses.
  def self.submission_teaches_cs?(submission, is_high_school)
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

  #
  # Summarization is effectively implemented as a Naive Bayes Classifier
  # (https://en.wikipedia.org/wiki/Naive_Bayes_classifier)
  # We are using the data we have about a school to update how strongly we
  # believe they teach computer science, with the belief falling in the
  # range from 0.0 to 1.0.
  #
  # In a machine learning setting (such as spam filtering) the likelihoods
  # would be learned from labeled data (old messages marked a spam or not.)
  # In our case, we've hand crafted the likelihoods based on what we know
  # about the data sets.
  #
  # For each year, we set our prior to the previous year's posterior after
  # lowering it a bit. The assumption here is that there is some chance
  # that a school will stop teaching computer science.
  #

  #
  # NOTE: within each deepest likelihood grouping, the weights of all the
  # options must add up to 1.0
  #
  SUBMISSION_LIKELIHOODS = {
    given_teaches: {
      survey_yes: 0.8,
      survey_no: 0.2, # There is a chance people will not be aware of the offering at their school
    },
    given_does_not_teach: {
      survey_yes: 0.1, # Here we are accounting for people misunderstanding / misreporting
      survey_no: 0.9,
    },
  }.freeze

  AP_LIKELIHOODS = {
    given_teaches: {
      data_present: 0.2, # Most schools don't have AP even if they teach CS
      no_data: 0.8,
    },
    given_does_not_teach: {
      data_present: 0.00001, # There is a chance that the school code mappings are wrong
      no_data: 0.99999,
    },
  }.freeze

  IB_LIKELIHOODS = {
    given_teaches: {
      data_present: 0.01, # Most schools don't have IB even if they teach CS
      no_data: 0.99,
    },
    given_does_not_teach: {
      data_present: 0.00001, # There is a chance that the school code mappings are wrong
      no_data: 0.99999,
    },
  }.freeze

  STATE_LIKELIHOODS = {
    given_teaches: {
      data_present: 0.99,
      no_data: 0.01,
    },
    given_does_not_teach: {
      data_present: 0.001,
      no_data: 0.999,
    },
  }.freeze

  def self.decide_teaches(posterior)
    if posterior.nil?
      nil
    elsif posterior <= 0.1
      "N"
    elsif posterior >= 0.8
      "Y"
    else
      "M"
    end
  end

  def self.summarize_school_data(school, school_years, years_with_ap_data, years_with_ib_data, state_years_with_data)
    previous_years_belief = nil
    summaries = []

    school_years.each do |school_year|
      audit = {
        version: 0.2,
        stats: [],
        census_submissions: [],
        ap_cs_offerings: [],
        ib_cs_offerings: [],
        state_cs_offerings: [],
      }

      likelihoods = {
        teaches: [],
        not_teaches: [],
      }

      def likelihoods.push_likelihoods_for(category, data)
        # P(data | School actually teaches)
        self[:teaches].push category[:given_teaches][data]
        # P(data | School does not actually teach)
        self[:not_teaches].push category[:given_does_not_teach][data]
      end

      # If the school doesn't have stats then treat it as not high school.
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

        teaches = submission_teaches_cs?(submission, high_school)

        audit[:census_submissions].push(
          {
            id: submission.id,
            teaches: teaches
          }
        )

        data =
          if teaches
            :survey_yes
          else
            :survey_no
          end

        likelihoods.push_likelihoods_for(SUBMISSION_LIKELIHOODS, data)
      end

      # AP data

      ap_offerings = school.ap_school_code.try(:ap_cs_offering) || []
      ap_offerings_this_year = ap_offerings.select {|o| o.school_year == school_year}
      ap_offerings_this_year.each do |offering|
        audit[:ap_cs_offerings].push(offering.id)
        likelihoods.push_likelihoods_for(AP_LIKELIHOODS, :data_present)
      end

      # Since AP is only for high school grades, the lack of AP data for a non high school
      # doesn't give us any information.
      if years_with_ap_data.include?(school_year) && high_school && ap_offerings_this_year.empty?
        audit[:ap_cs_offerings].push(nil)
        likelihoods.push_likelihoods_for(AP_LIKELIHOODS, :no_data)
      end

      # IB data

      ib_offerings = school.ib_school_code.try(:ib_cs_offering) || []
      ib_offerings_this_year = ib_offerings.select {|o| o.school_year == school_year}
      ib_offerings_this_year.each do |offering|
        audit[:ib_cs_offerings].push(offering.id)
        likelihoods.push_likelihoods_for(IB_LIKELIHOODS, :data_present)
      end

      # Since IB CS is only for high school grades, the lack of IB data for a non high school
      # doesn't give us any information.
      if years_with_ib_data.include?(school_year) && high_school && ib_offerings_this_year.empty?
        audit[:ib_cs_offerings].push(nil)
        likelihoods.push_likelihoods_for(IB_LIKELIHOODS, :no_data)
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
          likelihoods.push_likelihoods_for(STATE_LIKELIHOODS, :no_data)
        else
          state_offerings.each do |offering|
            audit[:state_cs_offerings].push(offering.id)
            likelihoods.push_likelihoods_for(STATE_LIKELIHOODS, :data_present)
          end
        end
      end

      summary = Census::CensusSummary.find_or_initialize_by(
        school: school,
        school_year: school_year,
      )

      # Assuming some chance that the school will stop teaching we degrade the
      # old belief.
      # Use an uninformed prior (0.5) if we don't have a previous year's belief.
      prior = previous_years_belief ? (previous_years_belief * 0.9) : 0.5
      audit[:previous_years_belief] = previous_years_belief
      audit[:prior] = prior

      # If we have no information about a school then it will be reported as
      # a null classification rather than as a maybe. This lets us see the
      # difference between a computed maybe and one that is the result of
      # no data.
      posterior = nil

      if likelihoods[:teaches].presence
        # P(teaches | data) = P(teaches) * P(data_1 | teaches) * P(data_2 | teaches) * ... / P(data)
        # P(not teaches | data) = P(not teaches) * P(data_1 | not teaches) * P(data_2 | not teaches) * ... / P(data)
        #
        # P(teaches) is the prior, P(not teaches) is 1 - prior
        # P(data_n | teaches) and P(data_n | not teaches) are the likelihoods for data_n
        # P(data) can be computed as the sum of the numerators of P(teaches | data) and P(not teaches | data)
        #         since those two fractions need to sum to 1.0 (since there are only two possibilities.)
        prior_times_likelihoods = {
          teaches: prior * likelihoods[:teaches].reduce(1, :*),
          not_teaches: (1 - prior) * likelihoods[:not_teaches].reduce(1, :*)
        }
        posterior = prior_times_likelihoods[:teaches] /
                    (prior_times_likelihoods[:teaches] + prior_times_likelihoods[:not_teaches])
      elsif previous_years_belief
        # No data, so no updating (beyond the degrading of the previous belief done above.)
        posterior = prior
      end

      audit[:posterior] = posterior
      previous_years_belief = posterior

      summary.teaches_cs = decide_teaches(posterior)
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
        find_each do |school|

        summarize_school_data(
          school,
          school_years,
          years_with_ap_data,
          years_with_ib_data,
          state_years_with_data
        ).each(&:save!)
      end
    end
  end
end
