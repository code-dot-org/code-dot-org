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

  # Use the zero byte as the quote character to allow importing double quotes
  #   via http://stackoverflow.com/questions/8073920/importing-csv-quoting-error-is-driving-me-nuts
  CSV_IMPORT_OPTIONS = {col_sep: ",", headers: true, encoding: 'bom|utf-8'}.freeze

  # Seeds all the data from the S3 file.
  def self.seed_all
    Census::CensusSummary.transaction do
      CDO.log.info "Seeding census summary data."
      AWS::S3.seed_from_file('cdo-census', "access-report-data-files-2023/final_csv/final_csv_2023_08_04.csv") do |filename|
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
        parsed = block_given? ? yield(row) : row.to_hash.symbolize_keys

        # (As of Sept. 2023) Skip entries with school_id that doesn't match school in our database.
        # This is likely due to not receiving NCES private school data yet (will be ready in November)
        # and NCES schools that are being skipped when seeding due to an id conflict issue (tracked
        # here: https://codedotorg.atlassian.net/browse/ACQ-561). We will skip such entries for now,
        # and return to ensure all entries are processed once that issue is resolved and we receive
        # the private school data.
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
end
