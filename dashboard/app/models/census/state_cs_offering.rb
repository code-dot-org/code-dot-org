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
  validates :school_year, presence: true, numericality: {greater_than_or_equal_to: 2015, less_than_or_equal_to: 2030}

  SUPPORTED_STATES = %w(
    AL
    AR
    CA
    CO
    CT
    FL
    GA
    IA
    ID
    IN
    KS
    KY
    LA
    MA
    MI
    MO
    MS
    MT
    NC
    ND
    NY
    OH
    OK
    OR
    PA
    RI
    SC
    UT
    VA
    WI
    WY
  ).freeze

  # By default we treat the lack of state data for high schools as an
  # indication that the school doesn't teach cs. We aren't as confident
  # that the state data is conplete for the following states so we do
  # not want to treat the lack of data as a no for those.
  INFERRED_NO_EXCLUSION_LIST = %w(
    CO
    ID
    MI
    OH
  ).freeze

  def self.infer_no(state_code)
    INFERRED_NO_EXCLUSION_LIST.exclude? state_code.upcase
  end

  def self.construct_state_school_id(state_code, row_hash)
    case state_code
    when 'AL'
      row_hash['State School ID']
    when 'AR'
      School.construct_state_school_id('AR', row_hash['District LEA'], row_hash['Location ID'])
    when 'CA'
      School.construct_state_school_id('CA', row_hash['DistrictCode'], row_hash['schoolCode'])
    when 'CO'
      row_hash['state_school_id']
    when 'CT'
      district_id = row_hash['District Code'][0..2]
      school_id = row_hash['School Code'][3..4]
      School.construct_state_school_id('CT', district_id, school_id)
    when 'FL'
      row_hash['State School ID']
    when 'GA'
      school_id = format("%04d", row_hash['SCHOOL_ID'].to_i)
      School.construct_state_school_id('GA', row_hash['SYSTEM_ID'], school_id)
    when 'IA'
      # Don't raise an error if school does not exist because the logic that invokes this method skips these.
      School.find_by(id: row_hash['NCES ID'])&.state_school_id
    when 'ID'
      School.construct_state_school_id('ID', row_hash['LeaNumber'], row_hash['SchoolNumber'])
    when 'IN'
      # Don't raise an error if school does not exist because the logic that invokes this method skips these.
      School.find_by(id: row_hash['NCES'])&.state_school_id
    when 'KS'
      row_hash['state_school_id']
    when 'KY'
      row_hash['State School ID']
    when 'LA'
      row_hash['State_School_ID']
    when 'MA'
      School.construct_state_school_id('MA', row_hash['District Code'][0..3], row_hash['School Code'])
    when 'MO'
      row_hash['STATE_SCHOOL_ID']
    when 'MS'
      School.find_by(id: row_hash['NCES School ID'])&.state_school_id
    when 'MI'
      # Strip spaces from within cell (convert 'MI - 50050 - 00119' to 'MI-50050-00119').
      row_hash['State School ID'].delete(' ')
    when 'MT'
      row_hash['state_school_id']
    when 'NC'
      # Don't raise an error if school does not exist because the logic that invokes this method skips these.
      School.find_by(id: row_hash['NCES ID'])&.state_school_id
    when 'ND'
      row_hash['state_school_id']
    when 'NY'
      row_hash['state_school_id']
    when 'OH'
      row_hash['State School ID']
    when 'OK'
      row_hash['State School ID']
    when 'OR'
      row_hash['state_school_id']
    when 'PA'
      row_hash['state_school_id']
    when 'RI'
      row_hash['School ID']
    when 'SC'
      School.construct_state_school_id('SC', row_hash['districtcode'], row_hash['schoolcode'])
    when 'UT'
      # Don't raise an error if school does not exist because the logic that invokes this method skips these.
      School.find_by(id: row_hash['NCES ID'])&.state_school_id
    when 'VA'
      row_hash['state_school_id']
    when 'WI'
      # Don't raise an error if school does not exist because the logic that invokes this method skips these.
      School.find_by(id: row_hash['SCHOOL_NCES_CODE'])&.state_school_id
    when 'WY'
      row_hash['State_school_ID']
    else
      raise ArgumentError.new("#{state_code} is not supported.")
    end
  end

  UNSPECIFIED_COURSE = 'unspecified'

  AL_COURSE_CODES = %w(
    520006
    520007
    560024
    520045
    520046
    560032
    520018
    220098
    520043
    925611
    560025
    560026
    450012
    520014
    520044
    520015
  ).freeze

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

  CO_COURSE_CODES = %w(
    10152
    10155
    10156
    10157
    10153
    10011
    10159
    10154
    10012
  ).freeze

  CT_COURSE_CODES = [
    'AP Computer Science A',
    'Computer Programming',
    'Java Programming',
    'Visual Basic (VB) Programming',
    'C++ Programming'
  ].freeze

  FL_COURSE_CODES = %w(
    9003450
    9007210
    9007220
    9007230
    9007240
    9007250
    0200320
    0200325
    0200810
    0200820
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

  KS_COURSE_CODES = %w(
    10152
    10155
    10156
    10153
    10154
    10199
    10197
  ).freeze

  KY_COURSE_CODES = %w(
    110711
    110701
    Other
  ).freeze

  LA_COURSE_CODES = %w(
    061102
    061103
    061177
    061175
    061176
  ).freeze

  MA_COURSE_CODES = %w(
    10011
    10012
    10019
    10153
    10154
    10155
    10156
    10158
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

  MO_COURSE_CODES = %w(
    034355
    991105
    100415
    991195
    991196
  ).freeze

  MS_COURSE_CODES = %w(
    561005
    000283
    110142
    232050
    232060
    232070
    110141
  ).freeze

  MT_COURSE_CODES = %w(
    21009
    10152
    10157
    10156
    10155
    10159
    10153
  ).freeze

  NC_COURSE_CODES = %w(
    BP10
    BP12
    II21
    II22
    BL08
    BP20
    BW40
    BW44
    BW36
    CS95
    TW24
    WC21
    WC22
    WC06
    BW38
    BX46
    IN29
    TW42
    BU10
    BL03
    CU00
    BW41
    BL14
    TP01
    BW35
    TW34
    IN42
    BP22
    BW97
    CN32
    BW56
    BP01
  ).freeze

  ND_COURSE_CODES = %w(
    27122
    23015
    23012
    23580
    27127
    27125
    23582
  ).freeze

  NY_COURSE_CODES = %w(
    10152
    10157
    10155
    10154
    10153
    10159
    10156
    2156
  ).freeze

  OH_COURSE_CODES = %w(
    031700
    145060
    145070
    290200
    290310
    145090
    175004
    290250
    145065
    321600
  ).freeze

  OK_COURSE_CODES = %w(
    2510
    2511
    2531
    2532
    2535
    2536
  ).freeze

  OR_COURSE_CODES = %w(
    10152
    10155
    10157
    10156
    10154
    10153
    10112
  ).freeze

  RI_COURSE_CODES = [
    '7th Grade Computer Science',
    '8th Grade Computer Science',
    'AP Computer Science A',
    'AP Computer Science Principles',
    'Block-Based Coding',
    'Bootstrap: Algebra',
    'Bootstrap: Data Science',
    'Coding integrated into other course',
    'Computer Science Elective',
    'Creative Computing with Scratch',
    'CS Discoveries',
    'CS Fundamentals',
    'Cubetto',
    'GameSalad',
    'Intro to Computer Science and Robotics',
    'Introduction to Computer Science',
    'Introduction to Computing and Data Science',
    'JavaScript Programming',
    'PLTW Computer Science Essentials',
    'PLTW Computer Science Principles',
    'PLTW Gateway: Computer Science for Innovators and Makers',
    'PLTW Gateway: App Creators',
    'Programming: Visual Basic',
    'Python I',
    'Python II',
    'Robotics & Coding',
    'TEALS Introducting to Programming',
    'URI Introduction to Computing'
  ].freeze

  # Utah did not provide codes, but did provide course titles.
  UT_COURSE_CODES = [
    'A.P.  Computer Science',
    'A.P. Computer Science Principles',
    'Computer Programming I',
    'Computer Programming I CE',
    'Computer Programming II',
    'Computer Programming II CE',
    'Computer Science Principles',
    'Computer Science Principles CE',
    'Exploring Computer Science I  (CS)',
    'Exploring Computer Science II',
    'IB Computer Science HL 1',
    'IB Computer Science HL 2',
    'IB Computer Science SL 1',
    'IB Computer Science SL 2',
    'PLtW Computer Science & Software Enginee'
  ].freeze

  VA_COURSE_CODES = [
    '10019',
    '10152',
    '10152 advanced',
    '10157',
    '10159'
  ].freeze

  WI_COURSE_CODES = %w(
    6490
    6464
    6467
    6476
    6485
    6665
    6466
    6480
    6458
    6492
    6475
    6491
    6660
    6650
    6470
    6664
    6488
    6667
    6484
    6666
    6644
    6661
    6662
    6487
    6471
    6655
    6478
    6645
    6659
    6486
    6489
    6653
    6465
    6457
    6474
    6479
    6481
    6646
    6472
    6482
  ).freeze

  WY_COURSE_CODES = %w(
    10011
    10152
    10157
    10153
    10159
    10199
    10154
    10156
    10012
    10155
  ).freeze

  def self.get_courses(state_code, row_hash)
    case state_code
    when 'AL'
      AL_COURSE_CODES.select {|course| course == row_hash['Course Code']}
    when 'AR'
      AR_COURSE_CODES.select {|course| course == row_hash['Course ID']}
    when 'CA'
      CA_COURSE_CODES.select {|course| course == row_hash['CourseCode']}
    when 'CO'
      CO_COURSE_CODES.select {|course| course == row_hash['course']}
    when 'CT'
      enrollment = row_hash['CourseEnrollments']
      # Don't consider a course as offered at a school if there is no enrollment ("*") or it is not a positive number
      CT_COURSE_CODES.select {|course| course == row_hash['Course'] && enrollment != '*' && enrollment.to_i > 0}
    when 'FL'
      FL_COURSE_CODES.select {|course| course == row_hash['Course']}
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
    when 'IA'
      # One source per row
      [UNSPECIFIED_COURSE]
    when 'ID'
      # A column per CS course with a value of 'Y' if the course is offered.
      ['02204',	'03208', '10157'].select {|course| row_hash[course] == 'Y'}
    when 'IN'
      # A column per CS course with a value of 'Y' if the course is offered.
      IN_COURSE_CODES.select {|course| row_hash[course] == 'Y'}
    when 'KS'
      KS_COURSE_CODES.select {|course| course == row_hash['course']}
    when 'KY'
      KY_COURSE_CODES.select {|course| course == row_hash['Course']}
    when 'LA'
      LA_COURSE_CODES.select {|course| course == row_hash['Course']}
    when 'MA'
      # Don't consider a course as offered at a school if there is no enrollment ("*") or it is not a positive number
      MA_COURSE_CODES.select do |course|
        course == row_hash['Course Code'] &&
        row_hash['Progrmming Included'] == 'Y' &&
        # Massachusetts has a note in their spreadsheet indicating that "*" means fewer than 6 students are enrolled
        row_hash['Total Enrollment'] != '*' &&
        row_hash['Total Enrollment'].to_i > 0
      end
    when 'MI'
      MI_COURSE_CODES.select {|course| course == row_hash['Subject Course Code']}
    when 'MO'
      MO_COURSE_CODES.select {|course| course == row_hash['COURSE']}
    when 'MS'
      MS_COURSE_CODES.select {|course| course == row_hash['Course ID']}
    when 'MT'
      MT_COURSE_CODES.select {|course| course == row_hash['NCES Course Code']}
    when 'NC'
      NC_COURSE_CODES.select {|course| course == row_hash['course']}
    when 'ND'
      ND_COURSE_CODES.select {|course| course == row_hash['Course']}
    when 'NY'
      NY_COURSE_CODES.select {|course| course == row_hash['course']}
    when 'OH'
      OH_COURSE_CODES.select {|course| course == row_hash['Course']}
    when 'OK'
      OK_COURSE_CODES.select {|course| course == row_hash['ClassCode']}
    when 'OR'
      OR_COURSE_CODES.select {|course| course == row_hash['Course']}
    when 'PA'
      # One source per row
      [UNSPECIFIED_COURSE]
    when 'RI'
      RI_COURSE_CODES.select {|course| course == row_hash['course']}
    when 'SC'
      # One source per row
      [UNSPECIFIED_COURSE]
    when 'UT'
      UT_COURSE_CODES.select {|course| row_hash[course] == '1'}
    when 'VA'
      VA_COURSE_CODES.select {|course| course == row_hash['course']}
    when 'WI'
      WI_COURSE_CODES.select {|course| course == row_hash['course']}
    when 'WY'
      WY_COURSE_CODES.select {|course| course == row_hash['course']}
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
    # The first school year where we have data is 2015-2016
    current_year = Date.today.year
    (2015..current_year).each do |school_year|
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
