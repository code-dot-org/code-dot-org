# == Schema Information
#
# Table name: school_districts
#
#  id                          :integer          not null, primary key
#  name                        :string(255)      not null
#  city                        :string(255)      not null
#  state                       :string(255)      not null
#  zip                         :string(255)      not null
#  last_known_school_year_open :string(9)
#  created_at                  :datetime         not null
#  updated_at                  :datetime         not null
#
# Indexes
#
#  index_school_districts_on_name_and_city  (name,city)
#  index_school_districts_on_state          (state)
#

class SchoolDistrict < ApplicationRecord
  include Seeded

  has_many :regional_partners_school_districts
  has_many :regional_partners, through: :regional_partners_school_districts

  # Use the zero byte as the quote character to allow importing double quotes
  #   via http://stackoverflow.com/questions/8073920/importing-csv-quoting-error-is-driving-me-nuts
  CSV_IMPORT_OPTIONS = {col_sep: "\t", headers: true, quote_char: "\x00"}.freeze

  # School district statuses representing currently open districts in 2018-2019 import.
  # Non-open statuses are 'Closed', 'Future', 'Inactive'
  OPEN_SCHOOL_STATUSES = ['1-Open', '3-New', '8-Reopened', '5-Changed Boundary/Agency', '4-Added']

  # Gets the seeding file name.
  # @param stub_school_data [Boolean] True for stub file.
  def self.get_seed_filename(stub_school_data)
    stub_school_data ? 'test/fixtures/school_districts.tsv' : 'config/school_districts.tsv'
  end

  # Seeds all the data from the source file.
  # @param options [Hash] Optional map of options.
  def self.seed_all(options = {})
    options[:stub_school_data] = CDO.stub_school_data unless options.key?(:stub_school_data)

    if options[:stub_school_data]
      # use a much smaller dataset in environments that reseed data frequently.
      school_districts_tsv = get_seed_filename(true)
      SchoolDistrict.transaction do
        merge_from_csv(school_districts_tsv)
      end
      # else
      # SchoolDistrict.seed_from_s3
    end
  end

  def self.seed_from_s3
    SchoolDistrict.transaction do
      CDO.log.info "Seeding 2013-2014 school district data"
      AWS::S3.seed_from_file('cdo-nces', "2013-2014/ccd/ag131a_supp.txt") do |filename|
        SchoolDistrict.merge_from_csv(filename) do |row|
          {
            id:    row['LEAID'].to_i,
            name:  row['NAME'].upcase,
            city:  row['LCITY'].to_s.upcase.presence,
            state: row['LSTATE'].to_s.upcase.presence,
            zip:   row['LZIP']
          }
        end
      end

      CDO.log.info "Seeding 2014-2015 school district data"
      AWS::S3.seed_from_file('cdo-nces', "2014-2015/ccd/ccd_lea_029_1415_w_0216161ar.txt") do |filename|
        SchoolDistrict.merge_from_csv(filename) do |row|
          {
            id:    row['LEAID'].to_i,
            name:  row['LEA_NAME'].upcase,
            city:  row['LCITY'].to_s.upcase.presence,
            state: row['LSTATE'].to_s.upcase.presence,
            zip:   row['LZIP']
          }
        end
      end

      # Note this iteration was never run with write_updates set to true,
      # meaning that school districts that had updates in this iteration
      # (but were not new) were not completed.
      # That said, (presumably) most relevant updates were
      # completed in the subsequent upload for 2018-2019.
      CDO.log.info "Seeding 2017-2018 school district data"
      import_options_1718 = {col_sep: ",", headers: true, quote_char: "\x00"}
      AWS::S3.seed_from_file('cdo-nces', "2017-2018/ccd/ccd_lea_029_1718_w_0a_03302018.csv") do |filename|
        SchoolDistrict.merge_from_csv(filename, import_options_1718, false) do |row|
          {
            id:    row['LEAID'].to_i,
            name:  row['LEA_NAME'].upcase,
            city:  row['LCITY'].to_s.upcase.presence,
            state: row['LSTATE'].to_s.upcase.presence,
            zip:   row['LZIP']
          }
        end
      end

      CDO.log.info "Seeding 2018-2019 school district data"
      import_options_1819 = {col_sep: ",", headers: true, quote_char: "\x00"}
      # Used table generator here to get columns of interest:
      # https://nces.ed.gov/ccd/elsi/tableGenerator.aspx
      AWS::S3.seed_from_file('cdo-nces', "2018-2019/ccd/ELSI_csv_export_6374544705259568713496.csv") do |filename|
        SchoolDistrict.merge_from_csv(filename, import_options_1819, true, new_attributes: ['last_known_school_year_open']) do |row|
          {
            id:                           row['Agency ID - NCES Assigned [District] Latest available year'].tr('"=', '').to_i,
            name:                         row['Agency Name'].upcase,
            city:                         row['Location City [District] 2018-19'].to_s.upcase.presence,
            state:                        row['Location State Abbr [District] 2018-19'].strip.to_s.upcase.presence,
            zip:                          row['Location ZIP [District] 2018-19'].tr('"=', ''),
            last_known_school_year_open:  OPEN_SCHOOL_STATUSES.include?(row['Updated Status [District] 2018-19']) ? '2018-2019' : nil
          }
        end
      end

      CDO.log.info "Seeding 2019-2020 school district data"
      import_options_1920 = {col_sep: ",", headers: true, quote_char: "\x00"}
      AWS::S3.seed_from_file('cdo-nces', "2019-2020/ccd/districts.csv") do |filename|
        SchoolDistrict.merge_from_csv(filename, import_options_1920, true, is_dry_run: false) do |row|
          {
            id:                           row['Agency ID - NCES Assigned [District] Latest available year'].tr('"=', '').to_i,
            name:                         row['Agency Name'].upcase,
            city:                         row['Location City [District] 2019-20'].to_s.upcase.presence,
            state:                        row['Location State Abbr [District] 2019-20'].strip.to_s.upcase.presence,
            zip:                          row['Location ZIP [District] 2019-20'].tr('"=', ''),
            last_known_school_year_open:  OPEN_SCHOOL_STATUSES.include?(row['Updated Status [District] 2019-20']) ? '2019-2020' : nil
          }
        end
      end
    end
  end

  # Allows seeding of a single s3 object (must be CSV or other parsable text file) to the database.
  # Useful especially for dry runs, in order to observe the changes that would be made by an import.
  # Effectively a wrapper of merge_from_csv that allows your CSV to be stored on S3, and
  # to pass a block describing how to parse a row of new data.
  # @param bucket [String] S3 bucket where object is stored.
  # @param filepath [String] Filepath for S3 object.
  # @param import_options [Hash] The CSV file parsing options.
  # @param is_dry_run [Boolean] Allows a "dry run" of seeding a CSV without making database writes.
  # @param new_attributes  [Array] List of attributes included in a given import that are new to the model, and thus should not be used to determine whether a record is being "updated" or "unchanged"
  # @param parse_row [Block] A block to parse a row of new data -- see School.seed_from_s3 for examples.
  def self.seed_s3_object(bucket, filepath, import_options, is_dry_run: false, new_attributes: [], &parse_row)
    AWS::S3.seed_from_file(bucket, filepath, is_dry_run) do |filename|
      merge_from_csv(
        filename,
        import_options,
        true,
        is_dry_run: is_dry_run,
        new_attributes: new_attributes,
        &parse_row
      )
    end
  end

  # Loads/merges the data from a CSV into the school districts table.
  # Requires a block to parse the row.
  # @param filename [String] The CSV file name.
  # @param options [Hash] The CSV file parsing options.
  # @param write_updates [Boolean] Specify whether existing rows should be updated.  Default to true for backwards compatible with existing logic that calls this method to UPSERT school districts.
  # @param is_dry_run [Boolean] Specify that this is a dry run, and no writes to the database should be conducted. Gives more detailed output of expected changes from importing the given CSV.
  # @param new_attributes  [Array] List of attributes included in a given import that are new to the model, and thus should not be used to determine whether a record is being "updated" or "unchanged"
  def self.merge_from_csv(filename, options = CSV_IMPORT_OPTIONS, write_updates = true, is_dry_run: false, new_attributes: [])
    districts = nil
    new_districts = []
    updated_districts = 0
    unchanged_districts = 0

    ActiveRecord::Base.transaction do
      districts = CSV.read(filename, options).each do |row|
        parsed = block_given? ? yield(row) : row.to_hash.symbolize_keys
        loaded = find_by_id(parsed[:id])
        if loaded.nil?
          SchoolDistrict.new(parsed).save!
          new_districts << parsed
        elsif write_updates
          loaded.assign_attributes(parsed)
          if loaded.changed?
            loaded.changed.sort == new_attributes.sort ?
              unchanged_districts += 1 :
              updated_districts += 1

            loaded.update!(parsed)
          else
            unchanged_districts += 1
          end
        end
      end

      # Raise an error so that the db transaction rolls back
      raise "This was a dry run. No rows were modified or added. Set dry_run: false to modify db" if is_dry_run
    ensure
      future_tense_dry_run = is_dry_run ? ' to be' : ''
      summary_message = "School District seeding: done processing #{filename}.\n"\
        "#{new_districts.length} new districts#{future_tense_dry_run} added.\n"\
        "#{updated_districts} districts#{future_tense_dry_run} updated.\n"\
        "#{unchanged_districts} districts#{future_tense_dry_run} unchanged (district considered changed if only update was adding new columns included in this import).\n"

      # More detailed logging in dry run mode
      if !new_districts.empty? && is_dry_run
        summary_message <<
          "Districts#{future_tense_dry_run} added:\n"\
          "#{new_districts.map {|district| district[:name]}.join("\n")}\n"
      end

      CDO.log.info summary_message
    end

    districts
  end

  # Download the data in the table to a CSV file.
  # @param filename [String] The CSV file name.
  # @param options [Hash] The CSV file parsing options.
  # @return [String] The CSV file name.
  def self.write_to_csv(filename, options = CSV_IMPORT_OPTIONS)
    cols = %w(id name city state zip)
    CSV.open(filename, 'w', options) do |csv|
      csv << cols
      rows = block_given? ? yield : order(:id)
      rows.map do |row|
        csv << cols.map {|col| row[col]}
      end
    end
    return filename
  end
end
