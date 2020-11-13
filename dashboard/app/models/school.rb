# == Schema Information
#
# Table name: schools
#
#  id                 :string(12)       not null, primary key
#  school_district_id :integer
#  name               :string(255)      not null
#  city               :string(255)      not null
#  state              :string(255)      not null
#  zip                :string(255)      not null
#  school_type        :string(255)      not null
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  address_line1      :string(50)
#  address_line2      :string(30)
#  address_line3      :string(30)
#  latitude           :decimal(8, 6)
#  longitude          :decimal(9, 6)
#  state_school_id    :string(255)
#
# Indexes
#
#  index_schools_on_id                  (id) UNIQUE
#  index_schools_on_name_and_city       (name,city)
#  index_schools_on_school_district_id  (school_district_id)
#  index_schools_on_state_school_id     (state_school_id) UNIQUE
#  index_schools_on_zip                 (zip)
#

class School < ActiveRecord::Base
  include Seeded

  self.primary_key = 'id'

  belongs_to :school_district

  has_many :school_stats_by_year
  has_many :school_info
  has_many :state_cs_offering, class_name: 'Census::StateCsOffering', foreign_key: :state_school_id, primary_key: :state_school_id
  has_many :census_overrides, class_name: 'Census::CensusOverride'
  has_many :census_summaries, class_name: 'Census::CensusSummary'

  has_many :ap_school_code, class_name: 'Census::ApSchoolCode'
  has_one :ib_school_code, class_name: 'Census::IbSchoolCode'

  validates :state_school_id, allow_blank: true, format: {with: /\A[A-Z]{2}-.+-.+\z/, message: "must be {State Code}-{State District Id}-{State School Id}"}

  # Gets the full address of the school.
  # @return [String] The full address.
  def full_address
    %w(address_line1 address_line2 address_line3 city state zip).map do |col|
      attributes[col].presence
    end.compact.join(' ')
  end

  def most_recent_school_stats
    school_stats_by_year.order(school_year: :desc).first
  end

  # Determines if this is a high-needs school for the purpose of distributing Maker Toolkit
  # discount codes - this is not a definition we apply broadly.
  # @return [Boolean] True if high-needs, false otherwise.
  def maker_high_needs?
    # As of January 2020, "high-needs" is defined as having >= 50% of the student population
    # eligible for free-and-reduced lunch programs.
    stats = most_recent_school_stats
    if stats.nil? || stats.frl_eligible_total.nil? || stats.students_total.nil?
      return false
    end
    stats.frl_eligible_total.to_f / stats.students_total.to_f >= 0.5
  end

  # Determines if school meets Amazon Fugure Engineer criteria.
  # Eligible if the school is any of the following:
  # a) title I school,
  # b) >40% URM students,
  # or c) >40% of students eligible for free and reduced meals.
  def afe_high_needs?
    stats = most_recent_school_stats
    return false if stats.nil?

    # To align with maker_high_needs? definition above,
    # returning false if we don't have all data for a given school.
    stats.title_i_eligible? || (stats.urm_percent || 0) >= 40 || (stats.frl_eligible_percent || 0) >= 40
  end

  # Public school ids from NCES are always 12 digits, possibly with
  # leading zeros. In the DB, those leading zeros have been stripped out.
  # Other school types are less than 12 characters and in the DB they
  # have not had their leading zeros removed.
  def self.normalize_school_id(raw_school_id)
    raw_school_id.length == 12 ? raw_school_id.to_i.to_s : raw_school_id
  end

  # Use the zero byte as the quote character to allow importing double quotes
  #   via http://stackoverflow.com/questions/8073920/importing-csv-quoting-error-is-driving-me-nuts
  CSV_IMPORT_OPTIONS = {col_sep: "\t", headers: true, quote_char: "\x00"}.freeze

  # Gets the seeding file name.
  # @param stub_school_data [Boolean] True for stub file.
  def self.get_seed_filename(stub_school_data)
    stub_school_data ? 'test/fixtures/schools.tsv' : 'config/schools.tsv'
  end

  def self.construct_state_school_id(state_code, district_id, school_id)
    "#{state_code}-#{district_id}-#{school_id}"
  end

  # Seeds all the data from the source file.
  # @param options [Hash] Optional map of options.
  def self.seed_all(options = {})
    options[:stub_school_data] ||= CDO.stub_school_data

    if options[:stub_school_data]
      # use a much smaller dataset in environments that reseed data frequently.
      schools_tsv = get_seed_filename(true)
      School.transaction do
        merge_from_csv(schools_tsv)
      end
    else
      School.seed_from_s3
    end
  end

  def self.seed_from_s3
    # NCES school data has been built up in the DB over time by pulling in different
    # data files. This seeding recreates the order in which they we incorporated.
    # NOTE: we are intentionally not populating the state_school_id based on the
    # 2014-2015 preliminary or 2013-2014 public/charter data sets. Those files
    # containt duplicate entries where some schools appear to be listed more than
    # once but with different NCES ids. Since state_school_id needs to be unique
    # the seeding would fail if we tried to set the state ids from those files.
    # The 2014-2015 public/charter data does not have this issue so we do load the
    # state_school_ids from there.
    School.transaction do
      CDO.log.info "Seeding 2014-2015 PRELIMINARY public and charter school data."
      # Originally from https://nces.ed.gov/ccd/Data/zip/Sch14pre_txt.zip
      AWS::S3.seed_from_file('cdo-nces', "2014-2015/ccd/Sch14pre.txt") do |filename|
        merge_from_csv(filename, {col_sep: "\t", headers: true, quote_char: "\x00", encoding: 'ISO-8859-1:UTF-8'}) do |row|
          {
            id:                 row['NCESSCH'].to_i.to_s,
            name:               row['SCHNAM'].upcase,
            address_line1:      row['LSTREE'].to_s.upcase.presence,
            address_line2:      nil,
            address_line3:      nil,
            city:               row['LCITY'].to_s.upcase.presence,
            state:              row['LSTATE'].to_s.upcase.presence,
            zip:                row['LZIP'],
            latitude:           nil,
            longitude:          nil,
            school_type:        row['CHARTR'] == '1' ? 'charter' : 'public',
            school_district_id: row['LEAID'].to_i,
          }
        end
      end

      CDO.log.info "Seeding 2013-2014 public and charter school data."
      # Originally from https://nces.ed.gov/ccd/Data/zip/sc132a_txt.zip
      AWS::S3.seed_from_file('cdo-nces', "2013-2014/ccd/sc132a.txt") do |filename|
        merge_from_csv(filename) do |row|
          {
            id:                 row['NCESSCH'].to_i.to_s,
            name:               row['SCHNAM'].upcase,
            address_line1:      row['LSTREE'].to_s.upcase.presence,
            address_line2:      nil,
            address_line3:      nil,
            city:               row['LCITY'].to_s.upcase.presence,
            state:              row['LSTATE'].to_s.upcase.presence,
            zip:                row['LZIP'],
            latitude:           nil,
            longitude:          nil,
            school_type:        row['CHARTR'] == '1' ? 'charter' : 'public',
            school_district_id: row['LEAID'].to_i,
          }
        end
      end

      CDO.log.info "Seeding 2013-2014 private school data."
      # Originally from https://nces.ed.gov/surveys/pss/zip/pss1314_pu_csv.zip
      AWS::S3.seed_from_file('cdo-nces', "2013-2014/pss/pss1314_pu.csv") do |filename|
        merge_from_csv(filename, {headers: true, encoding: 'ISO-8859-1:UTF-8'}) do |row|
          {
            id:                 row['PPIN'],
            name:               row['PINST'].upcase,
            address_line1:      row[row['PL_ADD'].nil? ? 'PADDRS' : 'PL_ADD'].to_s.upcase.presence,
            address_line2:      nil,
            address_line3:      nil,
            city:               row[row['PL_CIT'].nil? ? 'PCITY' : 'PL_CIT'].to_s.upcase.presence,
            state:              row[row['PL_STABB'].nil? ? 'PSTABB' : 'PL_STABB'].to_s.upcase.presence,
            zip:                row[row['PL_ZIP'].nil? ? 'PZIP' : 'PL_ZIP'],
            latitude:           row['LATITUDE14'].to_f,
            longitude:          row['LONGITUDE14'].to_f,
            school_type:        'private',
            school_district_id: nil,
            state_school_id:    nil,
          }
        end
      end

      CDO.log.info "Seeding 2014-2015 public and charter school data."
      # Originally from https://nces.ed.gov/ccd/Data/zip/ccd_sch_029_1415_w_0216601a_txt.zip
      AWS::S3.seed_from_file('cdo-nces', "2014-2015/ccd/ccd_sch_029_1415_w_0216601a.txt") do |filename|
        merge_from_csv(filename) do |row|
          {
            id:                 row['NCESSCH'].to_i.to_s,
            name:               row['SCH_NAME'].upcase,
            address_line1:      row['LSTREET1'].to_s.upcase.presence,
            address_line2:      row['LSTREET2'].to_s.upcase.presence,
            address_line3:      row['LSTREET3'].to_s.upcase.presence,
            city:               row['LCITY'].to_s.upcase.presence,
            state:              row['LSTATE'].to_s.upcase.presence,
            zip:                row['LZIP'],
            latitude:           nil,
            longitude:          nil,
            school_type:        row['CHARTER_TEXT'][0, 1] == 'Y' ? 'charter' : 'public',
            school_district_id: row['LEAID'].to_i,
            state_school_id:    construct_state_school_id(row['LSTATE'].to_s.upcase, row['ST_LEAID'], row['ST_SCHID']),
          }
        end
      end

      CDO.log.info "Seeding 2014-2015 public school geographic data."
      # Originally from https://nces.ed.gov/ccd/Data/zip/EDGE_GEOIDS_201415_PUBLIC_SCHOOL_csv.zip
      AWS::S3.seed_from_file('cdo-nces', "2014-2015/ccd/EDGE_GEOIDS_201415_PUBLIC_SCHOOL.csv") do |filename|
        merge_from_csv(filename, {headers: true, encoding: 'ISO-8859-1:UTF-8'}) do |row|
          {
            id:                 row['NCESSCH'].to_i.to_s,
            latitude:           row['LATCODE'].to_f,
            longitude:          row['LONGCODE'].to_f
          }
        end
      end

      CDO.log.info "Seeding 2015-2016 private school data."
      # Originally from https://nces.ed.gov/surveys/pss/zip/pss1516_pu_csv.zip
      AWS::S3.seed_from_file('cdo-nces', "2015-2016/pss/pss1516_pu.csv") do |filename|
        merge_from_csv(filename, {headers: true, encoding: 'ISO-8859-1:UTF-8'}) do |row|
          {
            id:                 row['ppin'],
            name:               row['pinst'].upcase,
            address_line1:      row[row['pl_add'].nil? ? 'paddrs' : 'pl_add'].to_s.upcase.presence,
            address_line2:      nil,
            address_line3:      nil,
            city:               row[row['pl_cit'].nil? ? 'pcity' : 'pl_cit'].to_s.upcase.presence,
            state:              row[row['pl_stabb'].nil? ? 'pstabb' : 'pl_stabb'].to_s.upcase.presence,
            zip:                row[row['pl_zip'].nil? ? 'pzip' : 'pl_zip'],
            latitude:           row['latitude16'].to_f,
            longitude:          row['longitude16'].to_f,
            school_type:        'private',
            school_district_id: nil,
            state_school_id:    nil,
          }
        end
      end

      CDO.log.info "Seeding 2017-2018 PRELIMINARY public and charter school data."
      # Originally from https://nces.ed.gov/ccd/Data/zip/ccd_sch_029_1718_w_0a_03302018_csv.zip
      AWS::S3.seed_from_file('cdo-nces', "2017-2018/ccd/ccd_sch_029_1718_w_0a_03302018.csv") do |filename|
        # Set write_updates argument to false as a data import precaution.  We are only inserting new schools, initially, from this NCES dataset.
        merge_from_csv(filename, {headers: true, encoding: 'ISO-8859-1:UTF-8', quote_char: "\x00"}, false) do |row|
          {
            id:                 row['NCESSCH'].to_i.to_s,
            name:               row['SCH_NAME'].upcase,
            address_line1:      row['LSTREET1'].to_s.upcase.presence,
            address_line2:      row['LSTREET2'].to_s.upcase.presence,
            address_line3:      row['LSTREET3'].to_s.upcase.presence,
            city:               row['LCITY'].to_s.upcase.presence,
            state:              row['LSTATE'].to_s.upcase.presence,
            zip:                row['LZIP'],
            latitude:           nil,
            longitude:          nil,
            school_type:        row['CHARTER_TEXT'][0, 1] == 'Y' ? 'charter' : 'public',
            school_district_id: row['LEAID'].to_i,
            # in the 2017-2018 data, the field ST_SCHID already
            # combines fields that were previously combined in
            # the construct_state_school_id method
            # they look like this: AL-101-0200
            state_school_id:    row['ST_SCHID'],
          }
        end
      end
    end
  end

  # Loads/merges the data from a CSV into the schools table.
  # Requires a block to parse the row.
  # @param filename [String] The CSV file name.
  # @param options [Hash] The CSV file parsing options.
  # @param write_updates [Boolean] Specify whether existing rows should be updated.  Default to true for backwards compatible with existing logic that calls this method to UPSERT schools.
  def self.merge_from_csv(filename, options = CSV_IMPORT_OPTIONS, write_updates = true)
    CSV.read(filename, options).each do |row|
      parsed = block_given? ? yield(row) : row.to_hash.symbolize_keys
      loaded = find_by_id(parsed[:id])
      if loaded.nil?
        begin
          School.new(parsed).save!
        rescue ActiveRecord::RecordNotUnique
          CDO.log.info "Record with NCES ID #{parsed[:id]} and state school ID #{parsed[:state_school_id]} not unique, not added"
        end
      elsif write_updates == true
        loaded.assign_attributes(parsed)
        loaded.update!(parsed) if loaded.changed?
      end
    end
  end

  # Download the data in the table to a CSV file.
  # @param filename [String] The CSV file name.
  # @param options [Hash] The CSV file parsing options.
  # @return [String] The CSV file name.
  def self.write_to_csv(filename, options = CSV_IMPORT_OPTIONS)
    cols = %w(id name address_line1 address_line2 address_line3 city state zip latitude longitude school_type school_district_id state_school_id)
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
