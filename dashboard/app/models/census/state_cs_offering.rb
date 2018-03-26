# == Schema Information
#
# Table name: state_cs_offerings
#
#  id              :integer          not null, primary key
#  state_school_id :string(255)      not null
#  course          :string(255)      not null
#  school_year     :integer          not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_state_cs_offerings_on_id_and_year_and_course  (state_school_id,school_year,course) UNIQUE
#

class Census::StateCsOffering < ApplicationRecord
  belongs_to :school, foreign_key: :state_school_id, primary_key: :state_school_id, required: true

  validates_presence_of :course
  validates :school_year, presence: true, numericality: {greater_than_or_equal_to: 2016, less_than_or_equal_to: 2030}

  SUPPORTED_STATES = [
    'CA',
    'GA',
    'ID',
    'SC'
  ].freeze

  def self.construct_state_school_id(state_code, row_hash)
    case state_code
    when 'CA'
      School.construct_state_school_id('CA', row_hash['DistrictCode'], row_hash['schoolCode'])
    when 'GA'
      school_id = format("%04d", row_hash['SCHOOL_ID'].to_i)
      School.construct_state_school_id('GA', row_hash['SYSTEM_ID'], school_id)
    when 'ID'
      School.construct_state_school_id('ID', row_hash['LeaNumber'], row_hash['SchoolNumber'])
    when 'SC'
      School.construct_state_school_id('SC', row_hash['districtcode'], row_hash['schoolcode'])
    else
      raise ArgumentError.new("#{state_code} is not supported.")
    end
  end

  UNSPECIFIED_COURSE = 'unspecified'

  CA_COURSE_CODES = %w(
    2451
    2453
    2465
    2470
    2471
    2472
    4601
    4616
    4619
    4631
    4634
    4640
    4641
    4647
    5612
    8131
  ).freeze

  GA_COURSE_CODES = %w(
    11.01600
    11.01700
    11.01710
    11.47100
    11.47200
    11.01900
  ).freeze

  def self.get_courses(state_code, row_hash)
    case state_code
    when 'CA'
      CA_COURSE_CODES.select {|course| course == row_hash['CourseCode']}
    when 'GA'
      # One course per row
      # Courses are in the form of XX.XXXXX but
      # sometimes the codes are trucated if they had trailing zeros
      # and other times they are padded with extra zeros.
      course_parts = row_hash['COURSE_NUMBER'].split('.')
      prefix = course_parts.first
      suffix = format("%-5.5s", course_parts.second).tr(' ', '0')
      course_code = "#{prefix}.#{suffix}"
      GA_COURSE_CODES.select {|course| course == course_code}
    when 'ID'
      # A column per CS course with a value of 'Y' if the course is offered.
      ['02204',	'03208', '10157'].select {|course| row_hash[course] == 'Y'}
    when 'SC'
      # One source per row
      [UNSPECIFIED_COURSE]
    else
      raise ArgumentError.new("#{state_code} is not supported.")
    end
  end

  def self.seed_from_csv(state_code, school_year, filename)
    ActiveRecord::Base.transaction do
      CSV.foreach(filename, {headers: true}) do |row|
        row_hash = row.to_hash
        state_school_id = construct_state_school_id(state_code, row_hash)
        courses = get_courses(state_code, row_hash)
        # state_school_id is unique so there should be at most one school
        school = School.where(state_school_id: state_school_id).first
        if school
          courses.each do |course|
            find_or_create_by!(
              school: school,
              course: course,
              school_year: school_year,
            )
          end
        else
          # We don't have mapping for every school code so skip over any that
          # can't be found in the database.
          CDO.log.warn "State CS Offering seeding: skipping unknown state school id #{state_school_id}"
        end
      end
    end
  end

  CENSUS_BUCKET_NAME = "cdo-census".freeze

  def self.construct_object_key(state_code, school_year)
    "state_cs_offerings/#{state_code}/#{school_year}-#{school_year + 1}.csv"
  end

  def self.seed_from_s3
    # State CS Offering data files in S3 are named
    # "state_cs_offerings/<STATE_CODE>/<SCHOOL_YEAR_START>-<SCHOOL_YEAR_END>.csv"
    # The first school year where we have data is 2016-2017
    current_year = Date.today.year
    (2016..current_year).each do |school_year|
      SUPPORTED_STATES.each do |state_code|
        object_key = construct_object_key(state_code, school_year)
        begin
          AWS::S3.seed_from_file(CENSUS_BUCKET_NAME, object_key) do |filename|
            seed_from_csv(state_code, school_year, filename)
          end
        rescue Aws::S3::Errors::NotFound
          # We don't expect every school year to be there so skip anything that isn't found.
          CDO.log.warn "State CS Offering seeding: object #{object_key} not found in S3 - skipping."
        end
      end
    end
  end

  def self.seed
    if CDO.stub_school_data
      seed_from_csv('GA', 2017, "test/fixtures/census/state_cs_offerings.csv")
    else
      seed_from_s3
    end
  end
end
