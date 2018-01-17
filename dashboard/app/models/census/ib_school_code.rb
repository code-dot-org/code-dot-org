# == Schema Information
#
# Table name: ib_school_codes
#
#  school_code :string(6)        not null, primary key
#  school_id   :string(12)       not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_ib_school_codes_on_school_code  (school_code) UNIQUE
#  index_ib_school_codes_on_school_id    (school_id) UNIQUE
#

class Census::IbSchoolCode < ApplicationRecord
  self.primary_key = :school_code

  belongs_to :school, required: true

  validates :school_code, presence: true, length: {is: 6}, format: {with: /\A[0-9]+\z/, message: "only allows numbers"}

  # school_code is a 6-character string but in the input files we may have treated
  # them as integers and cut off leading zeros. Add them back if necessary.
  def self.normalize_school_code(raw_school_code)
    format("%06d", raw_school_code.to_i)
  end

  def self.seed_from_csv(filename)
    ActiveRecord::Base.transaction do
      CSV.foreach(filename, {headers: true}) do |row|
        school_code = normalize_school_code(row.to_hash['SCHOOL_CODE'])
        school_id = School.normalize_school_id(row.to_hash['NCES_ID'])
        begin
          school = School.find(school_id)
          find_or_create_by!(school_code: school_code, school: school)
        rescue ActiveRecord::RecordNotFound
          # Skip the row if we don't have the school in the DB
          puts "IB School Code seed: school not found - skipping row for school_code:#{school_code} school_id:#{school_id}"
        end
      end
    end
  end

  CENSUS_BUCKET_NAME = "cdo-census".freeze
  CSV_OBJECT_KEY = "ib_school_codes.csv".freeze

  def self.seed_from_s3
    AWS::S3.seed_from_file(CENSUS_BUCKET_NAME, CSV_OBJECT_KEY) do |filename|
      seed_from_csv(filename)
    end
  end

  def self.seed
    if CDO.stub_school_data
      seed_from_csv("test/fixtures/census/ib_school_codes.csv")
    else
      seed_from_s3
    end
  end
end
