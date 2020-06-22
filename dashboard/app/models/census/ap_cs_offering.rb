# == Schema Information
#
# Table name: ap_cs_offerings
#
#  id          :integer          not null, primary key
#  school_code :string(6)        not null
#  course      :string(3)        not null
#  school_year :integer          not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_ap_cs_offerings_on_school_code_and_school_year_and_course  (school_code,school_year,course) UNIQUE
#

class Census::ApCsOffering < ApplicationRecord
  belongs_to :ap_school_code, foreign_key: [:school_code, :school_year], primary_key: [:school_code, :school_year], required: true
  has_one :school, through: :ap_school_code

  COURSES = {
    CSP: "CSP",
    CSA: "CSA",
  }.freeze

  validates_presence_of :course
  enum course: COURSES

  validates :school_year, presence: true, numericality: {greater_than_or_equal_to: 2016, less_than_or_equal_to: 2030}

  def self.seed_from_csv(course, school_year, filename, dry_run = false)
    succeeded = 0
    skipped = 0

    ActiveRecord::Base.transaction do
      CSV.foreach(filename, {headers: true}) do |row|
        raw_school_code = row.to_hash['School Code']  # College Board attending institution (AI) code
        next unless raw_school_code
        normalized_school_code = Census::ApSchoolCode.normalize_school_code(raw_school_code)
        next if normalized_school_code == '000000'

        begin
          ap_school_code = Census::ApSchoolCode.find([normalized_school_code, school_year])
          unless dry_run
            Census::ApCsOffering.find_or_create_by!(
              ap_school_code: ap_school_code,
              course: course,
              school_year: school_year
            )
          end
          succeeded += 1
        rescue ActiveRecord::RecordNotFound
          # We don't have mapping for every school code so skip over any that
          # can't be found in the database.
          raw_school_name = row.to_hash['School Name']
          CDO.log.warn "AP CS Offering seeding: skipping unknown school code #{normalized_school_code}, school name #{raw_school_name}"
          skipped += 1
        end
      end
    end

    CDO.log.info "AP CS Offering seeding: done processing #{course}-#{school_year} data. "\
      "#{succeeded} rows succeeded, #{skipped} rows skipped."
  end

  CENSUS_BUCKET_NAME = "cdo-census".freeze

  def self.construct_object_key(course, school_year, file_extension = 'csv')
    "ap_cs_offerings/#{course}-#{school_year}-#{school_year + 1}.#{file_extension}"
  end

  def self.seed_from_s3
    # AP CS Offering data files in S3 are named
    # "ap_cs_offerings/<COURSE>-<SCHOOL_YEAR_START>-<SCHOOL_YEAR_END>.csv"
    # where COURSE is either 'CSP' or 'CSA'
    # The first school year where we have data is 2016-2017
    current_year = Date.today.year
    (2016..current_year).each do |school_year|
      ['CSP', 'CSA'].each do |course|
        object_key = construct_object_key(course, school_year)
        begin
          AWS::S3.seed_from_file(CENSUS_BUCKET_NAME, object_key) do |filename|
            seed_from_csv(course, school_year, filename)
          end
        rescue Aws::S3::Errors::NotFound
          # We don't expect every school year to be there so skip anything that isn't found.
          CDO.log.warn "AP CS Offering seeding: object #{object_key} not found in S3 - skipping."
        end
      end
    end
  end

  # Test seeding an object from S3 to find issues.
  # This method does not check if the object had been seeded before
  # and does not write to the database.
  #
  # @example:
  #   Census::ApCsOffering.dry_seed_s3_object('CSP', 2017)
  #   will seed from ap_cs_offerings/CSP-2017-2028.csv object.
  #
  #   Census::StateCsOffering.dry_seed_s3_object('CSA', 2019, 'txt')
  #   will seed from ap_cs_offerings/CSA-2019-2020.txt object.
  #
  # @note: A CSV file with a right format name in S3 will be automatically
  # picked up by the +seed_from_s3+ method as part of the build seeding process.
  # To prevent that, use a different file extension such as .test or .txt.
  def self.dry_seed_s3_object(course, school_year, file_extension = 'csv')
    object_key = construct_object_key(course, school_year, file_extension)
    AWS::S3.process_file(CENSUS_BUCKET_NAME, object_key) do |filename|
      seed_from_csv(course, school_year, filename, true)
    end
  rescue Aws::S3::Errors::NoSuchKey
    CDO.log.warn "AP CS Offering seeding: Object #{object_key} not found in S3."
  ensure
    CDO.log.info "This is a dry run. No data is written to the database."
  end

  def self.seed
    if CDO.stub_school_data
      seed_from_csv("CSP", 2017, "test/fixtures/census/ap_cs_offerings.csv")
    else
      seed_from_s3
    end
  end
end
