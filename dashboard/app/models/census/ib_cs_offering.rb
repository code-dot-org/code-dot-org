# == Schema Information
#
# Table name: ib_cs_offerings
#
#  id          :integer          not null, primary key
#  school_code :string(6)        not null
#  level       :string(2)        not null
#  school_year :integer          not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_ib_cs_offerings_on_school_code_and_school_year_and_level  (school_code,school_year,level) UNIQUE
#

class Census::IbCsOffering < ApplicationRecord
  belongs_to :ib_school_code, foreign_key: :school_code, primary_key: :school_code, required: true
  has_one :school, through: :ib_school_code

  # IB offers two differnt CS course: Standard Level (SL) and Higher Level (HL)
  # http://www.ibo.org/programmes/diploma-programme/curriculum/sciences/computer-science/
  LEVELS = {
    HL: "HL",
    SL: "SL",
  }.freeze

  validates_presence_of :level
  enum level: LEVELS

  validates :school_year, presence: true, numericality: {greater_than_or_equal_to: 2017, less_than_or_equal_to: 2030}

  def self.seed_from_csv(school_year, filename)
    ActiveRecord::Base.transaction do
      CSV.foreach(filename, {headers: true}) do |row|
        level = row.to_hash['LVL']
        raw_school_code = row.to_hash['SCHOOL_CODE']
        next unless raw_school_code
        normalized_school_code = Census::IbSchoolCode.normalize_school_code(raw_school_code)
        unless normalized_school_code == '000000'
          begin
            ib_school_code = Census::IbSchoolCode.find(normalized_school_code)
            Census::IbCsOffering.find_or_create_by!(
              ib_school_code: ib_school_code,
              level: level,
              school_year: school_year
            )
          rescue ActiveRecord::RecordNotFound
            # We don't have mapping for every school code so skip over any that
            # can't be found in the database.
            puts "IB CS Offering seeding: skipping unknown school code #{normalized_school_code}"
          end
        end
      end
    end
  end

  CENSUS_BUCKET_NAME = "cdo-census".freeze

  def self.construct_object_key(school_year)
    "ib_cs_offerings/#{school_year}-#{school_year + 1}.csv"
  end

  def self.seed_from_s3
    # IB CS Offering data files in S3 are named
    # "ib_cs_offerings/<SCHOOL_YEAR_START>-<SCHOOL_YEAR_END>.csv"
    # The first school year where we have data is 2017-2018
    current_year = Date.today.year
    (2017..current_year).each do |school_year|
      object_key = construct_object_key(school_year)
      begin
        AWS::S3.seed_from_file(CENSUS_BUCKET_NAME, object_key) do |filename|
          seed_from_csv(school_year, filename)
        end
      rescue Aws::S3::Errors::NotFound
        # We don't expect every school year to be there so skip anything that isn't found.
        puts "IB CS Offering seeding: object #{object_key} not found in S3 - skipping."
      end
    end
  end

  def self.seed
    if CDO.stub_school_data
      seed_from_csv(2017, "test/fixtures/census/ib_cs_offerings.csv")
    else
      seed_from_s3
    end
  end
end
