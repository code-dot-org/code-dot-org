# == Schema Information
#
# Table name: census_summaries
#
#  id          :integer          not null, primary key
#  school_id   :string(12)       not null
#  school_year :integer          not null
#  teaches_cs  :string(2)
#  audit_data  :text(65535)
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
    EXCLUDED: "E",
    UNKNOWN: "U",
  }.freeze
  enum teaches_cs: TEACHES

  HISTORICAL_RESULTS_MAP = {
    "YES" => "HISTORICAL_YES",
    "NO" => "HISTORICAL_NO",
    "MAYBE" => "HISTORICAL_MAYBE",
  }

  # Use the zero byte as the quote character to allow importing double quotes
  #   via http://stackoverflow.com/questions/8073920/importing-csv-quoting-error-is-driving-me-nuts
  CSV_IMPORT_OPTIONS = {col_sep: ",", headers: true, encoding: 'bom|utf-8'}.freeze

  # Seeds all the data from the S3 file.
  def self.seed_all
    unless CDO.stub_school_data
      Census::CensusSummary.transaction do
        CDO.log.info "Seeding census summary data."
        AWS::S3.seed_from_file('cdo-census', "access-report-data-files-2023/final_csv/final_csv_2023_09_19.csv") do |filename|
          merge_from_csv(filename) do |row|
            {
              school_id:          row['school_id'],
              school_year:        row['school_year'].to_i,
              teaches_cs:         row['teaches_cs'],
            }
          end
        end
      end
    end
  end

  # Loads/merges the data from a CSV into the table.
  # Requires a block to parse the row.
  # @param filename [String] The CSV file name.
  # @param options [Hash] The CSV file parsing options.
  # @param is_dry_run [Boolean] Allows testing of importing a CSV by rolling back any changes.
  def self.merge_from_csv(filename, options = CSV_IMPORT_OPTIONS, is_dry_run: false)
    census_summaries = nil
    entries_skipped = 0

    ActiveRecord::Base.transaction do
      census_summaries = CSV.read(filename, **options).each do |row|
        parsed = row.to_hash.symbolize_keys

        # (As of Sept. 2023) Skip entries with school_id that doesn't match school in our database.
        # This is likely due to not receiving NCES private school data yet (will be ready in November).
        if School.find_by_id(parsed[:school_id]).nil?
          entries_skipped += 1
          next
        end

        parsed[:teaches_cs] = parsed[:teaches_cs] == 'unknown' ? 'U' : parsed[:teaches_cs]
        db_entry = find_by(school_id: parsed[:school_id])
        if db_entry.nil?
          Census::CensusSummary.new(parsed).save!
        else
          db_entry.update!(parsed)
        end
      end

      # Raise an error so that the db transaction rolls back
      raise "This was a dry run. No rows were modified or added. Set dry_run: false to modify db" if is_dry_run
    ensure
      CDO.log.info "#{entries_skipped} census summaries skipped due to no school_id match in database."
      CDO.log.info "Census summaries seeding: done processing #{filename}.\n"
    end

    census_summaries
  end

  def self.map_historical_teaches_cs(historical_value)
    HISTORICAL_RESULTS_MAP[historical_value]
  end

  def self.empty_audit_data
    {
      version: 1.0,
      stats: {},
      census_submissions: [],
    }
  end

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

  # We will set teaches_cs to the first value we find in this order:
  # 1	This year's surveys from teachers/administrators - consistent
  # 2	This year's surveys from teachers/admins - inconsistent
  # 3	This year's surveys from non-teachers/admins
  # 4	teaches_cs from last year
  # 5	teaches_cs from 2 years ago
  # 6 nil
  def self.compute_teaches_cs(submissions_summary, previous_years_results, audit)
    result = nil
    details = []

    # Each call to conditional_result will update the result if it hasn't already
    # been set and simultaneously add the appropriate data to the details array
    # so that we can explain the result in the /census/review UI. We need to make
    # the call for every data element so that we get the full data in the explanation.

    result = conditional_result(
      'consistent_teacher_surveys',
      submissions_summary[:consistency][:teacher_or_admin],
      submissions_summary[:consistency][:teacher_or_admin],
      submissions_summary[:counts][:teacher_or_admin],
      result,
      details
    )

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

  def self.summarize_school_data(summarization_data)
    school = summarization_data[:school]
    school_years = summarization_data[:school_years]

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

      summary = Census::CensusSummary.find_or_initialize_by(
        school: school,
        school_year: school_year,
      )
      summary.teaches_cs = compute_teaches_cs(
        submissions_summary,
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
    school_years = (2016..SharedConstants::CENSUS_CONSTANTS.CURRENT_CENSUS_SCHOOL_YEAR)

    ActiveRecord::Base.transaction do
      School.eager_load(school_info: :census_submissions).
        eager_load(:school_stats_by_year).
        find_each do |school|
          summarize_school_data(
            {
              school: school,
              school_years: school_years,
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
