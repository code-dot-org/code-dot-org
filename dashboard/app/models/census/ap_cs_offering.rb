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
  belongs_to :ap_school_code, foreign_key: :school_code, primary_key: :school_code, required: true
  has_one :school, through: :ap_school_code

  COURSES = {
    CSP: "CSP",
    CSA: "CSA",
  }.freeze

  validates_presence_of :course
  enum course: COURSES

  validates :school_year, presence: true, numericality: {greater_than_or_equal_to: 2016, less_than_or_equal_to: 2030}

  def self.seed_from_csv(course, school_year, filename)
    ActiveRecord::Base.transaction do
      CSV.foreach(filename, {headers: true}) do |row|
        raw_school_code = row.to_hash['School Code']
        next unless raw_school_code
        normalized_school_code = Census::ApSchoolCode.normalize_school_code(raw_school_code)
        unless normalized_school_code == '000000'
          begin
            ap_school_code = Census::ApSchoolCode.find(normalized_school_code)
            Census::ApCsOffering.find_or_create_by!(
              ap_school_code: ap_school_code,
              course: course,
              school_year: school_year
            )
          rescue ActiveRecord::RecordNotFound
            # We don't have mapping for every school code so skip over any that
            # can't be found in the database.
            puts "AP CS Offering seeding: skipping unknown school code #{normalized_school_code}"
          end
        end
      end
    end
  end

  CENSUS_BUCKET_NAME = "cdo-census".freeze

  def self.seed_from_s3
    # AP CS Offering data files in S3 are named
    # "ap_cs_offerings/<COURSE>-<SCHOOL_YEAR_START>-<SCHOOL_YEAR_END>.csv"
    # where COURSE is either 'CSP' or 'CSA'
    # The first school year where we have data is 2016-2017
    current_year = Date.today.year
    (2016..current_year).each do |school_year|
      ['CSP', 'CSA'].each do |course|
        object_key = "ap_cs_offerings/#{course}-#{school_year}-#{school_year + 1}.csv"
        begin
          etag = AWS::S3.create_client.head_object({bucket: CENSUS_BUCKET_NAME, key: object_key}).etag
          unless SeededS3Object.exists?(bucket: CENSUS_BUCKET_NAME, key: object_key, etag: etag)
            AWS::S3.process_file(CENSUS_BUCKET_NAME, object_key) do |filename|
              ActiveRecord::Base.transaction do
                seed_from_csv(course, school_year, filename)
                SeededS3Object.create!(
                  bucket: CENSUS_BUCKET_NAME,
                  key: object_key,
                  etag: etag,
                )
              end
            end
          end
        rescue Aws::S3::Errors::NotFound
          # We don't expect every school year to be there so skip anything that isn't found.
          puts "AP CS Offering seeding: object #{object_key} not found in S3 - skipping."
        end
      end
    end
  end

  def self.seed
    if CDO.stub_school_data
      seed_from_csv("CSP", 2017, "test/fixtures/census/ap_cs_offerings.csv")
    else
      seed_from_s3
    end
  end
end
