# == Schema Information
#
# Table name: schools
#
#  id                          :string(12)       not null, primary key
#  school_district_id          :integer
#  name                        :string(255)      not null
#  city                        :string(255)      not null
#  state                       :string(255)      not null
#  zip                         :string(255)      not null
#  school_type                 :string(255)      not null
#  created_at                  :datetime         not null
#  updated_at                  :datetime         not null
#  address_line1               :string(50)
#  address_line2               :string(30)
#  address_line3               :string(30)
#  latitude                    :decimal(8, 6)
#  longitude                   :decimal(9, 6)
#  state_school_id             :string(255)
#  school_category             :string(255)
#  last_known_school_year_open :string(9)
#
# Indexes
#
#  index_schools_on_id                           (id) UNIQUE
#  index_schools_on_last_known_school_year_open  (last_known_school_year_open)
#  index_schools_on_name_and_city                (name,city)
#  index_schools_on_school_district_id           (school_district_id)
#  index_schools_on_state_school_id              (state_school_id) UNIQUE
#  index_schools_on_zip                          (zip)
#

class School < ApplicationRecord
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

  # School statuses representing currently open schools in 2018-2019 import.
  # Non-open statuses are 'Closed', 'Future', 'Inactive'
  OPEN_SCHOOL_STATUSES = ['Open', 'New', 'Reopened', 'Changed Boundary/Agency', 'Added']

  # School statuses representing currently open schools in 2019-2020 import.
  # Non-open statuses are '2-Closed', '7-Future', '6-Inactive'
  OPEN_SCHOOL_STATUSES_2019_2020 = ['1-Open', '3-New', '8-Reopened', '5-Changed Boundary/Agency', '4-Added']

  # School categories need to be mapped to existing values for 2019-2020 import.
  SCHOOL_CATEGORY_MAP = {
    '1-Regular school' => 'Regular School',
    '2-Special education school' => 'Special Education School',
    '3-Vocational school' => 'Career and Technical School',
    '4-Alternative/other school' => 'Alternative School'
  }

  # School charter values need to be mapped to existing values for 2019-2020 import.
  CHARTER_SCHOOL_MAP = {
    '1-Yes' => 'charter',
    '2-No' => 'public',
    '' => 'public'
  }

  # These values should always be mapped to nil
  NIL_CHARS = ['†', '–', '‡']

  # Gets the seeding file name.
  # @param stub_school_data [Boolean] True for stub file.
  def self.get_seed_filename(stub_school_data)
    stub_school_data ? 'test/fixtures/schools.tsv' : 'config/schools.tsv'
  end

  def self.construct_state_school_id(state_code, district_id, school_id)
    "#{state_code}-#{district_id}-#{school_id}"
  end

  # @param unsanitized [String, nil] the unsanitized string
  # @returns [String, nil] the sanitized version of the string, with equal signs and double
  #   quotations removed. Returns nil on nil input, or if value is a dash (signifies missing in NCES data).
  def self.sanitize_string_for_db(unsanitized)
    unsanitized = NIL_CHARS.include?(unsanitized) ? nil : unsanitized
    unsanitized&.tr('="', '')
  end

  # Seeds all the data from the source file.
  # @param options [Hash] Optional map of options.
  def self.seed_all(options = {})
    options[:stub_school_data] = CDO.stub_school_data unless options.key?(:stub_school_data)

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
        merge_from_csv(filename, {col_sep: "\t", headers: true, quote_char: "\x00", encoding: 'ISO-8859-1:UTF-8'}, true) do |row|
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
        merge_from_csv(filename, {headers: true, encoding: 'ISO-8859-1:UTF-8'}, true) do |row|
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
        merge_from_csv(filename, {headers: true, encoding: 'ISO-8859-1:UTF-8'}, true) do |row|
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
        merge_from_csv(filename, {headers: true, encoding: 'ISO-8859-1:UTF-8'}, true) do |row|
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
        # Set update_existing argument to false as a data import precaution.  We are only inserting new schools from this NCES dataset.
        # Note as of November 2020, we never did the updates from this NCES update iteration.
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

      CDO.log.info "Seeding 2018-2019 public and charter school data."
      # Download link found here: https://nces.ed.gov/ccd/files.asp#Fiscal:2,LevelId:7,SchoolYearId:33,Page:1
      # Actual download link: https://nces.ed.gov/ccd/data/zip/ccd_sch_029_1819_w_1a_091019.zip
      AWS::S3.seed_from_file('cdo-nces', "2018-2019/ccd/ccd_sch_029_1819_w_1a_091019.csv") do |filename|
        merge_from_csv(filename, {headers: true, encoding: 'ISO-8859-1:UTF-8', quote_char: "\x00"}, true, is_dry_run: false, ignore_attributes: ['last_known_school_year_open', 'school_category']) do |row|
          {
            id:                           row['NCESSCH'].to_i.to_s,
            name:                         row['SCH_NAME'].upcase,
            # Four schools with addresses longer than 50 characters (DB column limit)
            # Also four schools with second address line longer than 30 characters.
            address_line1:                row['LSTREET1'].to_s.upcase.truncate(50).presence,
            address_line2:                row['LSTREET2'].to_s.upcase.truncate(30).presence,
            address_line3:                row['LSTREET3'].to_s.upcase.presence,
            city:                         row['LCITY'].to_s.upcase.presence,
            state:                        row['LSTATE'].to_s.upcase.presence,
            zip:                          row['LZIP'],
            school_type:                  row['CHARTER_TEXT'][0, 1] == 'Y' ? 'charter' : 'public',
            school_district_id:           row['LEAID'].to_i,
            state_school_id:              row['ST_SCHID'],
            # New addition for this iteration -- a "school category",
            # which is Regular, Special Education, Alternative, or Career and Technical
            school_category:              row['SCH_TYPE_TEXT'],
            last_known_school_year_open:  OPEN_SCHOOL_STATUSES.include?(row['UPDATED_STATUS_TEXT']) ? '2018-2019' : nil
          }
        end
      end

      CDO.log.info "Seeding 2018-2019 public and charter school geographic data."
      # Download link found here: https://nces.ed.gov/programs/edge/Geographic/SchoolLocations
      # Actual download link: https://nces.ed.gov/programs/edge/data/EDGE_GEOCODE_PUBLICSCH_1819.zip
      AWS::S3.seed_from_file('cdo-nces', "2018-2019/ccd/EDGE_GEOCODE_PUBLICSCH_1819.csv") do |filename|
        merge_from_csv(filename, {headers: true, encoding: 'ISO-8859-1:UTF-8'}, true, is_dry_run: false, insert_new: false) do |row|
          {
            id:                 row['NCESSCH'].to_i.to_s,
            latitude:           row['LAT'].to_f,
            longitude:          row['LON'].to_f
          }
        end
      end

      # Some of this data has #- appended to the front, so we strip that off with .to_s.slice(2) (it's always a single digit)
      CDO.log.info "Seeding 2019-2020 public school data."
      AWS::S3.seed_from_file('cdo-nces', "2019-2020/ccd/schools.csv") do |filename|
        merge_from_csv(filename, {headers: true, quote_char: "\x00"}, true, is_dry_run: false, ignore_attributes: ['last_known_school_year_open']) do |row|
          row = row.to_h.map {|k, v| [k, sanitize_string_for_db(v)]}.to_h
          {
            id:                           row['School ID - NCES Assigned [Public School] Latest available year'].to_i.to_s,
            name:                         row['School Name'].upcase,
            address_line1:                row['Location Address 1 [Public School] 2019-20'].to_s.upcase.truncate(50).presence,
            address_line2:                row['Location Address 2 [Public School] 2019-20'].to_s.upcase.truncate(30).presence,
            address_line3:                row['Location Address 3 [Public School] 2019-20'].to_s.upcase.presence,
            city:                         row['Location City [Public School] 2019-20'].to_s.upcase.presence,
            state:                        row['Location State Abbr [Public School] 2019-20'].to_s.strip.upcase.presence,
            zip:                          row['Location ZIP [Public School] 2019-20'],
            latitude:                     row['Latitude [Public School] 2019-20'].to_f,
            longitude:                    row['Longitude [Public School] 2019-20'].to_f,
            school_type:                  CHARTER_SCHOOL_MAP[row['Charter School [Public School] 2019-20'].to_s] || 'public',
            school_district_id:           row['Agency ID - NCES Assigned [Public School] Latest available year'].to_i,
            state_school_id:              row['State School ID [Public School] 2019-20'],
            school_category:              SCHOOL_CATEGORY_MAP[row['School Type [Public School] 2019-20']].presence,
            last_known_school_year_open:  OPEN_SCHOOL_STATUSES_2019_2020.include?(row['Updated Status [Public School] 2019-20']) ? '2019-2020' : nil
          }
        end
      end
    end
  end

  def load_state_cs_offerings(offerings_to_load, is_dry_run)
    offerings_to_load.each do |offering|
      new_offering = offering.slice(:course, :school_year)
      new_offering[:state_school_id] = state_school_id
      Census::StateCsOffering.create!(new_offering) unless is_dry_run
    end

    return state_cs_offering.reload
  end

  # format a list of schools to a string
  def self.pretty_print_school_list(schools)
    schools.map {|school| school[:name] + ' ' + school[:id]}.join("\n")
  end

  # Loads/merges the data from a CSV into the schools table.
  # Requires a block to parse the row.
  # @param filename [String] The CSV file name.
  # @param options [Hash] The CSV file parsing options.
  # @param update_existing [Boolean] Specify whether existing rows should be updated.  Default to true for backwards compatible with existing logic that calls this method to UPSERT schools.
  # @param is_dry_run [Boolean] Allows testing of importing a CSV by rolling back any changes
  # @param ignore_attributes [Array] List of attributes included in a given import that should not be used to determine whether a record is being "updated" or "unchanged". Allows us to more clearly identify which schools have real changes to existing data.
  # @param insert_new [Boolean] Determines whether to insert (or if false, skip) importing new schools in this import
  # @param limit [Integer] Limits the number of rows parsed from the csv file (for testing). Default to nil for no limit.
  def self.merge_from_csv(filename, options = CSV_IMPORT_OPTIONS, update_existing = true, is_dry_run: false, ignore_attributes: [], insert_new: true, limit: nil)
    schools = nil
    new_schools = []
    updated_schools = 0
    updated_schools_attribute_frequency = {}
    unchanged_schools = 0
    duplicate_schools = []
    state_cs_offerings_deleted_count = 0
    state_cs_offerings_reloaded_count = 0
    lines_processed = 0

    ActiveRecord::Base.transaction do
      schools = CSV.read(filename, options).each do |row|
        break if limit && lines_processed > limit
        lines_processed += 1
        csv_entry = block_given? ? yield(row) : row.to_hash.symbolize_keys
        db_entry = find_by_id(csv_entry[:id])

        if db_entry.nil? && insert_new
          begin
            School.new(csv_entry).save!
            new_schools << csv_entry
          rescue ActiveRecord::RecordNotUnique
            # NCES ID and state school ID are required to be unique,
            # so this error would occur if two rows with different NCES IDs
            # had the same state school ID.
            CDO.log.info "Record with NCES ID #{csv_entry[:id]} and state school ID #{csv_entry[:state_school_id]} not unique, not added"
            duplicate_schools << csv_entry
          end
        elsif !db_entry.nil? && update_existing
          old_state_school_id = db_entry.state_school_id.clone

          # skip DB query if state school ID not in provided set of data
          has_state_cs_offerings = csv_entry.key?(:state_school_id) ?
            db_entry.state_cs_offering.any? :
            false

          db_entry.assign_attributes(csv_entry)

          if db_entry.changed?
            # Not counting schools as "updated" if the only change
            # is adding a new column or making a change to all rows (eg, updating the most recent year a school is active).
            # Otherwise, all found rows will be updated.
            db_entry.changed.sort == ignore_attributes.sort ?
              unchanged_schools += 1 :
              updated_schools += 1

            db_entry.changed.each do |attribute|
              updated_schools_attribute_frequency.key?(attribute) ?
                updated_schools_attribute_frequency[attribute] += 1 :
                updated_schools_attribute_frequency[attribute] = 1
            end

            # We need to delete and reload state_cs_offerings
            # if we're going to update the state_school_id for a given school.
            deleted_state_cs_offerings = []
            if has_state_cs_offerings && db_entry.changed.include?('state_school_id')
              deleted_state_cs_offerings = Census::StateCsOffering.where(state_school_id: old_state_school_id).destroy_all unless is_dry_run
              state_cs_offerings_deleted_count += deleted_state_cs_offerings.count
            end

            begin
              db_entry.update!(csv_entry)
            rescue ActiveRecord::RecordNotUnique
              CDO.log.info "Record with NCES ID #{csv_entry[:id]} and state school ID #{csv_entry[:state_school_id]} not unique, not added"
              duplicate_schools << csv_entry
            end

            if deleted_state_cs_offerings.any?
              reloaded_state_cs_offerings = db_entry.load_state_cs_offerings(deleted_state_cs_offerings, is_dry_run)
              state_cs_offerings_reloaded_count += reloaded_state_cs_offerings.count

              # Check and see if old and new are the same
              reconstituted = reloaded_state_cs_offerings.pluck(:course, :school_year)
              original = deleted_state_cs_offerings.pluck(:course, :school_year)
              failure = ((reconstituted - original) + (original - reconstituted)).any?
              raise "Mismatch between state CS offerings deleted and recreated for NCES ID #{db_entry.id}, originally #{original.length} records, now #{reconstituted.length} records" if failure
            end
          else
            unchanged_schools += 1
          end
        end
      end

      # Raise an error so that the db transaction rolls back
      raise "This was a dry run. No rows were modified or added. Set dry_run: false to modify db" if is_dry_run
    ensure
      future_tense_dry_run = is_dry_run ? ' to be' : ''
      summary_message =
        "School seeding: done processing #{filename}.\n"\
        "#{new_schools.length} new schools#{future_tense_dry_run} added.\n"\
        "#{updated_schools} schools#{future_tense_dry_run} updated.\n"\
        "#{unchanged_schools} schools#{future_tense_dry_run} unchanged (apart from specified ignored attributes).\n"\
        "#{duplicate_schools.length} duplicate schools#{future_tense_dry_run} skipped.\n"\
        "State CS offerings#{future_tense_dry_run} deleted: #{state_cs_offerings_deleted_count}, state CS offerings#{future_tense_dry_run} reloaded: #{state_cs_offerings_reloaded_count}\n"

      if updated_schools_attribute_frequency.any?
        summary_message <<
          "Among updated schools, these attributes #{is_dry_run ? 'will be' : 'were'} updated:\n"\
          "#{updated_schools_attribute_frequency.sort_by {|_, v| v}.
            reverse.
            map {|attribute, frequency| attribute + ': ' + frequency.to_s}.join("\n")}\n"
      end

      # More verbose logging in dry run
      if is_dry_run
        if new_schools.any?
          summary_message <<
            "Schools#{future_tense_dry_run} added:\n"\
            "#{pretty_print_school_list(new_schools)}\n"
        end

        if duplicate_schools.any?
          summary_message <<
            "Duplicate schools#{future_tense_dry_run} skipped:\n"\
            "#{pretty_print_schools_list(duplicate_schools)}"
        end
      end

      CDO.log.info summary_message
    end

    schools
  end

  def self.seed_s3_object(bucket, filepath, import_options, is_dry_run: false, ignore_attributes: [], &parse_row)
    AWS::S3.seed_from_file(bucket, filepath) do |filename|
      merge_from_csv(
        filename,
        import_options,
        true,
        is_dry_run: is_dry_run,
        ignore_attributes: ignore_attributes,
        &parse_row
      )
    ensure
      CDO.log.info "This is a dry run. No data is written to the database." if is_dry_run
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
