# == Schema Information
#
# Table name: other_curriculum_offerings
#
#  id                       :integer          not null, primary key
#  curriculum_provider_name :string(255)      not null
#  school_id                :string(12)       not null
#  course                   :string(255)      not null
#  school_year              :integer          not null
#  created_at               :datetime         not null
#  updated_at               :datetime         not null
#
# Indexes
#
#  fk_rails_5682e60354                      (school_id)
#  index_other_curriculum_offerings_unique  (curriculum_provider_name,school_id,course,school_year) UNIQUE
#

class Census::OtherCurriculumOffering < ApplicationRecord
  belongs_to :school, required: true

  validates_presence_of :curriculum_provider_name, :course
  validates :school_year, presence: true, numericality: {greater_than_or_equal_to: 2015, less_than_or_equal_to: 2030}

  SUPPORTED_PROVIDERS = %w(
    BootUp
    TEALS
    PLTW
  ).freeze

  def self.seed_from_csv(provider_code, school_year, filename, dry_run = false)
    ActiveRecord::Base.transaction do
      CSV.foreach(filename, {headers: true}) do |row|
        row_hash = row.to_hash
        input_school_id = row_hash['School ID']
        # Remove leading zero if it looks like an NCES ID (12 digits) because we imported NCES IDs into School.id
        # without the leading zero.
        lookup_school_id = input_school_id.length == 12 ? input_school_id.sub(/^0/, "") : input_school_id
        courses = row_hash['Course']
        school = School.find_by(id: lookup_school_id)
        if school
          unless dry_run
            courses.each do |course|
              find_or_create_by!(
                curriculum_provider_name: provider_code,
                school: school,
                course: course,
                school_year: school_year
              )
            end
          end
        else
          # We don't have mapping for every school code so skip over any that
          # can't be found in the database.
          CDO.log.warn "Other Curriculum Offering seeding: skipping unknown school with NCES ID: #{input_school_id}"
        end
      end
    end
  end

  CENSUS_BUCKET_NAME = "cdo-census".freeze

  def self.construct_object_key(provider_code, school_year)
    "other_curriculum_offerings/#{provider_code}/#{school_year}-#{school_year + 1}.csv"
  end

  # Deconstructs an object key into multiple variables.
  # @param [string] object_key - the AWS object name
  # @return [array] [course, start_year, extension]
  def self.deconstruct_object_key(object_key)
    # "other_curriculum_offerings/<provider_code>/<start_year>-<end_year>.<file_extension>"
    _, provider_code, filename = object_key.split('/')
    name, extension = filename.rpartition('.')
    start_year, _ = name.split('-')
    [
      provider_code,
      start_year.to_i,
      extension
    ]
  end

  # Test seeding an object from S3 to find issues.
  # This method does not check if the object had been seeded before
  # and does not write to the database.
  def self.dry_seed_s3_object(object_key)
    provider_code, start_year = deconstruct_object_key(object_key)
    AWS::S3.process_file(CENSUS_BUCKET_NAME, object_key) do |filename|
      seed_from_csv(provider_code, start_year, filename, true)
    end
  rescue Aws::S3::Errors::NoSuchKey
    CDO.log.warn "Other CS Offering seeding: Object #{object_key} not found in S3."
  ensure
    CDO.log.info "This is a dry run. No data is written to the database."
  end

  def self.seed_from_s3
    # Other Curriculum CS Offering data files in S3 are named
    # "other_curriculum_offerings/<PROVIDER_CODE>/<SCHOOL_YEAR_START>-<SCHOOL_YEAR_END>.csv"
    # The first school year where we have data is 2015-2016
    current_year = Date.today.year
    (2015..current_year).each do |school_year|
      SUPPORTED_PROVIDERS.each do |provider_code|
        object_key = construct_object_key(provider_code, school_year)
        begin
          AWS::S3.seed_from_file(CENSUS_BUCKET_NAME, object_key) do |filename|
            seed_from_csv(provider_code, school_year, filename)
          end
        rescue Aws::S3::Errors::NotFound
          # We don't expect every school year to be there so skip anything that isn't found.
          CDO.log.warn "Other Curriculum Provider CS Offering seeding: object #{object_key} not found in S3 - skipping."
        end
      end
    end
  end

  def self.seed
    if CDO.stub_school_data
      seed_from_csv('TEALS', 2017, 'test/fixtures/census/other_curriculum_offerings.csv')
    else
      seed_from_s3
    end
  end
end
