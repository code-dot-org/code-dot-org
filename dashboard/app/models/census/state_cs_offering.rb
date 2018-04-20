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

  SUPPORTED_STATES = %w(
    AR
    CA
    GA
    ID
    IN
    MI
    NC
    SC
  ).freeze

  # By default we treat the lack of state data for high schools as an
  # indication that the school doesn't teach cs. We aren't as confident
  # that the state data is conplete for the following states so we do
  # not want to treat the lack of data as a no for those.
  INFERRED_NO_EXCLUSION_LIST = %w(
    ID
    MI
  ).freeze

  def self.infer_no(state_code)
    INFERRED_NO_EXCLUSION_LIST.exclude? state_code.upcase
  end

  def self.construct_state_school_id(state_code, row_hash)
    case state_code
    when 'AR'
      School.construct_state_school_id('AR', row_hash['District LEA'], row_hash['Location ID'])
    when 'CA'
      School.construct_state_school_id('CA', row_hash['DistrictCode'], row_hash['schoolCode'])
    when 'GA'
      school_id = format("%04d", row_hash['SCHOOL_ID'].to_i)
      School.construct_state_school_id('GA', row_hash['SYSTEM_ID'], school_id)
    when 'ID'
      School.construct_state_school_id('ID', row_hash['LeaNumber'], row_hash['SchoolNumber'])
    when 'IN'
      # Don't raise an error if school does not exist because the logic that invokes this method skips these.
      School.find_by(id: row_hash['NCES'])&.state_school_id
    when 'MI'
      # Strip spaces from within cell (convert 'MI - 50050 - 00119' to 'MI-50050-00119').
      row_hash['State School ID'].delete(' ')
    when 'NC'
      # School code in the spreadsheet from North Carolina is prefixed with the district code
      # but our schools data imported from NCES is not.
      district_code = row_hash['NC LEA Code']
      school_code = row_hash['NC School Code']
      # Remove district code prefix from school code.
      school_code.slice!(district_code)
      School.construct_state_school_id('NC', district_code, school_code)
    when 'SC'
      School.construct_state_school_id('SC', row_hash['districtcode'], row_hash['schoolcode'])
    else
      raise ArgumentError.new("#{state_code} is not supported.")
    end
  end

  UNSPECIFIED_COURSE = 'unspecified'

  AR_COURSE_CODES = %w(
    565320
    565310
    565120
    565110
    565020
    565010
    465520
    465510
    465340
    465330
    465320
    465310
    465220
    465210
    465140
    465130
    465120
    465110
    465060
    465050
    465040
    465030
    465020
    465010
  ).freeze

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

  IN_COURSE_CODES = %w(
    4570
    4568
    4801
    5236
    4803
    5612
    4586
  ).freeze

  MI_COURSE_CODES = %w(
    10157
    10999
    10004
    10201
    10152
    10158
    10002
    10155
    10003
    10199
    10197
  ).freeze

  NC_COURSE_CODES = %w(
    BL03
    BL08
    BL14
    BP10
    BP12
    BP22
    BW35
    BW36
    BW38
    BW40
    BW41
    BW44
    BX32
    BX46
    CS95
    CU00
    II21
    II22
    TP01
    WC21
    WC22
  ).freeze

  def self.get_courses(state_code, row_hash)
    case state_code
    when 'AR'
      AR_COURSE_CODES.select {|course| course == row_hash['Course ID']}
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
    when 'IN'
      # A column per CS course with a value of 'Y' if the course is offered.
      IN_COURSE_CODES.select {|course| row_hash[course] == 'Y'}
    when 'MI'
      MI_COURSE_CODES.select {|course| course == row_hash['Subject Course Code']}
    when 'NC'
      NC_COURSE_CODES.select {|course| course == row_hash['4 CHAR Code']}
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
        # state_school_id is unique so there should be at most one school.
        school = School.where(state_school_id: state_school_id).first
        if school && state_school_id
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
