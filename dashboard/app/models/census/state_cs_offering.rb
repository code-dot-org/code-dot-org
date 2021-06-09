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

  UNSPECIFIED_VALUE = 'unspecified'.freeze

  SUPPORTED_STATES = %w(
    AK
    AL
    AR
    AZ
    CA
    CO
    CT
    DC
    DE
    FL
    GA
    HI
    IA
    ID
    IL
    IN
    KS
    KY
    LA
    MA
    ME
    MD
    MI
    MN
    MO
    MS
    MT
    NC
    ND
    NE
    NH
    NJ
    NM
    NV
    NY
    OH
    OK
    OR
    PA
    RI
    SC
    SD
    TN
    TX
    UT
    VA
    VT
    WA
    WI
    WV
    WY
  ).freeze

  SUPPORTED_UPDATES = [1, 2, 3].freeze

  # The following states use the "V2" format for CSV files in 2017-2018.
  # (The expectation is that all states will use the new format as of 2019-20.)
  STATES_USING_FORMAT_V2_IN_2017_18 = %w(
    CA
    HI
    IL
    MA
    MD
    NE
    NY
    OR
    PA
    VA
  ).freeze

  # The following states use the "V2" format for CSV files in 2018-2019.
  STATES_USING_FORMAT_V2_IN_2018_19 = %w(
    AK
    AR
    CA
    CT
    FL
    GA
    IA
    ID
    IL
    IN
    LA
    MA
    MD
    MN
    MO
    MS
    MT
    ND
    NE
    NJ
    NM
    NY
    OH
    OR
    PA
    RI
    SC
    SD
    TX
    UT
    VA
    WA
    WI
    WV
    WY
  ).freeze

  # For a few states, we already placed a 2017-2018 CSV on S3 using their V1 format,
  # but they are now getting an update mid-way through the year using the V2 format.
  # For such states, we specify which update of the 2017-2018 file is in the V2
  # format.
  UPDATES_FOR_STATES_USING_FORMAT_V2_IN_MID_2017_18 = {
    NJ: 2,
    RI: 2
  }.freeze

  # For a few states, we already placed a 2018-2019 CSV on S3 using their V1 format,
  # but they are now getting an update mid-way through the year using the V2 format.
  # For such states, we specify which update of the 2018-2019 file is in the V2
  # format.
  UPDATES_FOR_STATES_USING_FORMAT_V2_IN_MID_2018_19 = {
    DC: 2,
    DE: 2,
    NH: 2,
    VT: 2
  }.freeze

  def self.state_uses_format_v2(state_code, school_year, update)
    state_uses_format_v2_in_2017 =
      STATES_USING_FORMAT_V2_IN_2017_18.include?(state_code) ||
      (UPDATES_FOR_STATES_USING_FORMAT_V2_IN_MID_2017_18.include?(state_code.to_sym) &&
        update >= UPDATES_FOR_STATES_USING_FORMAT_V2_IN_MID_2017_18[state_code.to_sym])
    state_uses_format_v2_in_2018 =
      STATES_USING_FORMAT_V2_IN_2018_19.include?(state_code) ||
      (UPDATES_FOR_STATES_USING_FORMAT_V2_IN_MID_2018_19.include?(state_code.to_sym) &&
        update >= UPDATES_FOR_STATES_USING_FORMAT_V2_IN_MID_2018_19[state_code.to_sym])

    (school_year == 2017 && state_uses_format_v2_in_2017) ||
      (school_year == 2018 && state_uses_format_v2_in_2018) ||
      school_year >= 2019
  end

  # By default we treat the lack of state data for high schools as an
  # indication that the school doesn't teach cs. We aren't as confident
  # that the state data is complete for the following states so we do
  # not want to treat the lack of data as a no for those.
  INFERRED_NO_EXCLUSION_LIST = [].freeze

  def self.infer_no(state_code)
    INFERRED_NO_EXCLUSION_LIST.exclude? state_code.upcase
  end

  def self.get_state_school_id(state_code, row_hash, school_year, update)
    # Using V2 format.
    if state_uses_format_v2(state_code, school_year, update)
      # The V2 format requires either nces_id or state_school_id.

      # Try to get the state_school_id from the nces_id first.
      nces_id = row_hash['nces_id']
      if nces_id != UNSPECIFIED_VALUE
        state_school_id = School.find_by(id: nces_id)&.state_school_id
        return state_school_id if state_school_id
      end

      # Fall back to the provided state_school_id.
      state_school_id = row_hash['state_school_id']
      if state_school_id != UNSPECIFIED_VALUE
        return state_school_id
      end

      # At this point we have nothing left.
      CDO.log.warn "Entry for #{state_code} requires either state_school_id or nces_id that matches a School in the db with state_school_id column populated.  (nces_id: #{nces_id}, state_school_id: #{state_school_id})"
      return nil
    end

    # Special casing for V1 format.
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
    when 'DC'
      row_hash['State School Id']
    when 'DE'
      row_hash['State School Id']
    when 'FL'
      row_hash['State School ID']
    when 'GA'
      school_id = format("%04d", row_hash['SCHOOL_ID'].to_i)
      School.construct_state_school_id('GA', row_hash['SYSTEM_ID'], school_id)
    when 'HI'
      row_hash['State School Id']
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
    when 'MD'
      row_hash['STATE SCHOOL ID:']
    when 'ME'
      School.find_by(id: row_hash['NCES School ID: '])&.state_school_id
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
    when 'NH'
      row_hash['State_school_ID']
    when 'NJ'
      School.find_by(id: row_hash['NCES_SCHOOL_ID'])&.state_school_id
    when 'NV'
      row_hash['State School ID']
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
    when 'TN'
      row_hash['State_school_ID']
    when 'TX'
      row_hash['State_school_ID']
    when 'UT'
      # Don't raise an error if school does not exist because the logic that invokes this method skips these.
      School.find_by(id: row_hash['NCES ID'])&.state_school_id
    when 'VA'
      row_hash['state_school_id']
    when 'VT'
      row_hash['State School Id']
    when 'WI'
      # Don't raise an error if school does not exist because the logic that invokes this method skips these.
      School.find_by(id: row_hash['SCHOOL_NCES_CODE'])&.state_school_id
    when 'WV'
      School.find_by(id: row_hash['NCES ID'])&.state_school_id
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

  DC_COURSE_CODES = [
    UNSPECIFIED_COURSE,
    '10011',
    '10157',
    '10152'
  ].freeze

  DE_COURSE_CODES = [
    UNSPECIFIED_COURSE,
    '10012',
    '10157'
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

  HI_COURSE_CODES = [UNSPECIFIED_COURSE].freeze

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

  MD_COURSE_CODES = %w(
    10157
    10152
    10007
    10155
    10153
    10199
    10011
    10171
    10154
    10156
    10012
    10175
    10159
    10205
  ).freeze

  ME_COURSE_CODES = [
    'Computer Science Principles',
    'Computer Programming',
    'AP Computer Science A',
    'Intro to Computer Programming',
    'Exploring Computer Science',
    'Computer Applications',
    'Computer and Information Technology',
    'C++ Programming',
    'STEM: Computer Science Essentials',
    'STEM: Computer Science Principles',
    'Computer Programming,Other',
    'Computer Technology'
  ].freeze

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

  NH_COURSE_CODES = %w(
    11200
    11400
    11500
    14500
    15200
    16000
    21310
    21600
    21700
    21800
    21900
    22800
    11200
    11400
    11500
    21800
    21900
    99943
    99944
    10153
  ).freeze

  NJ_COURSE_CODES = %w(
    10152
    10155
    10157
    10153
    10154
    10156
    10019
    10159
  ).freeze

  NV_COURSE_CODES = [UNSPECIFIED_COURSE].freeze

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

  TN_COURSE_CODES = %w(
    3634
    6098
    6095
    3635
    6099
    5908
    3110
    3109
    6178
  ).freeze

  TX_COURSE_CODES = %w(
    227901
    184907
    71909
    43902
    5901
    61910
    220901
    220905
    217901
    227825
    101912
    10902
    220916
    57916
    220902
    130901
    74903
    220918
    136901
    15915
    20905
    239901
    101907
    15830
    57905
    61911
    94902
    178903
    71907
    191901
    220919
    11901
    246913
    246909
    43905
    226903
    225906
    15910
    101914
    84910
    79907
    170902
    220906
    57922
    71902
    57903
    220912
    62901
    227910
    61901
    101917
    57907
    25909
    15911
    246904
    71905
    108904
    178914
    220907
    79901
    152907
    84911
    144901
    20908
    187903
    205902
    123914
    31903
    101858
    161807
    101862
    71806
    15828
    101903
    61902
    227904
    108905
    57911
    246906
    108807
    57912
    105906
    57910
    240903
    15916
    126906
    14906
    178904
    227820
    101915
    232901
    75902
    101916
    227912
    227913
    57909
    116906
    43919
    152901
    170906
    227907
    20901
    27904
    43907
    165901
    182903
    108908
    93904
    123905
    79906
    220817
    101910
    227804
    123910
    195901
    68901
    119903
    43910
    178908
    31901
    170908
    43912
    15906
    70911
    15914
    4901
    199901
    214903
    139908
    203901
    105902
    84909
    15827
    31916
    101920
    112901
    19907
    101921
    235902
    181907
    226906
    237904
    70912
    184903
    108913
    227909
    212906
    101845
    A3580100
    188901
    2901
    20902
    14903
    101906
    101908
    91903
    57906
    66903
    213901
    101846
    227816
    186903
    108906
    57913
    61914
    31906
    220908
    161909
    A3580300
    57914
    170903
    252903
    199902
    84906
    15913
    21901
    221901
    15901
    71904
    15808
    101913
    34901
    61907
    194902
    220915
    30903
    249902
    160901
    220920
    184909
    145901
    27903
    29901
    49905
    101919
    15837
    220917
    57904
    210901
    227814
    212909
    99902
    73901
    174901
    226901
    67902
    126903
    91902
    20907
    45902
    116903
    161921
    60902
    175903
    172902
    56901
    19901
    240901
    105904
    171901
    11902
    107905
    220904
    81902
    128904
    114904
    1904
    86901
    174903
    167901
    88902
    101911
    111901
    91917
    47903
    95903
    143901
    102904
    104901
    250902
    202903
    201902
    59901
    97903
    188903
    243905
    71901
    3902
    34903
    236902
    152910
    221801
    21902
    108912
    212905
    220914
    248901
    31905
    247903
    220910
    141901
    61804
    74909
    57807
    212903
    187907
    28902
    161907
    3903
    28903
    245902
    129905
    107906
    73903
    234905
    157901
    15904
    43908
    13027600
    18902
    161903
    15806
    80901
    49902
    163903
    94903
    153905
    37908
    139911
    140905
    187910
    230903
    53001
    158905
    172905
    32902
    19912
    61906
    123908
    139912
    43911
    161922
    177901
    92906
    123913
    58909
    117903
    31913
    182904
    15831
    94901
    108911
    91906
    143903
    13905
    218901
    15917
    229905
    79910
    72903
    20906
    201910
    14909
    133903
    71908
    228903
    57803
    232903
    18904
    91908
    37909
    161916
    117904
    91909
    170904
    234907
    250907
    43914
    25906
    126904
    252902
    72801
    74917
    152903
    13027700
    95901
    43901
    22901
    36901
    110901
    212901
    196901
    39904
    8901
    16902
    185901
    169901
    15907
    198901
    249903
    223901
    161919
    243901
    159901
    101924
    198902
    106901
    64903
    227817
    206903
    38901
    139905
    194904
    204901
    42901
    43918
    187904
    71801
    47902
    115903
    251901
    108902
    108903
    120901
    1903
    101838
    70905
    247901
    148902
    122901
    57831
    14804
    169906
    89901
    252901
    238904
    116905
    219901
    101925
    86902
    148903
    163904
    133904
    243903
    70907
    119902
    126905
    129903
    242905
    175907
    61912
    92903
    144902
    34905
    49907
    181908
    178906
    83902
    152906
    25905
    223902
    163908
    3580200
    246801
    70908
    138903
    84802
    70910
    57850
    169909
    189902
    108910
    108909
    99903
    19906
    93905
    67908
    41902
    73905
    237905
    14908
    42903
    74911
    100904
    249908
    1909
    208902
    170907
    140907
    184902
    182905
    140908
    57919
    129906
    91918
    74912
    219903
    57845
    212804
    232904
    68803
    223904
    91910
    81905
    62904
    244901
    189901
    227803
    202905
    3580300
    3580350
    205901
    195902
    14902
    66902
    183902
    20910
    176903
    129902
    65902
    120905
    7902
    15822
    105801
    100903
    113903
    108907
    167902
    42905
    31909
    31912
    55901
    62903
    3580140
    30902
    100905
    70909
    205906
    100908
    105905
    3580380
    I3580300
    I3580200
    181905
    3580390
    57829
    84902
    161923
    212801
    35901
    186902
    183904
    57830
    101813
    250903
    33902
    167904
    37907
    183801
    89905
    57828
    3580830
  ).freeze

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

  VT_COURSE_CODES = [UNSPECIFIED_COURSE].freeze

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

  WV_COURSE_CODES = %w(
    2801
    2832
    2816
    3030
    2831
    2833
    2856
    2835
    2817
    2857
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

  def self.get_courses(state_code, row_hash, school_year, update)
    # Using V2 format.
    if state_uses_format_v2(state_code, school_year, update)
      return [row_hash['course_id']]
    end

    # Special casing for V1 format.
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
    when 'DC'
      DC_COURSE_CODES.select {|course| course == row_hash['Teaches CS?']}
    when 'DE'
      DE_COURSE_CODES.select {|course| course == row_hash['Teaches CS?']}
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
    when 'HI'
      HI_COURSE_CODES.select {|course| course == row_hash['Teaches CS']}
    when 'IA'
      # One source per row
      [UNSPECIFIED_COURSE]
    when 'ID'
      # A column per CS course with a value of 'Y' if the course is offered.
      ['02204', '03208', '10157'].select {|course| row_hash[course] == 'Y'}
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
    when 'MD'
      MD_COURSE_CODES.select {|course| course == row_hash['SCED_CD']}
    when 'ME'
      ME_COURSE_CODES.select {|course| course == row_hash['course']}
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
    when 'NH'
      NH_COURSE_CODES.select {|course| course == row_hash['course #']}
    when 'NJ'
      NJ_COURSE_CODES.select {|course| course == row_hash['COURSEID']}
    when 'NV'
      NV_COURSE_CODES.select {|course| course == row_hash['Teaches CS - From Cindi/NV']}
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
    when 'TN'
      TN_COURSE_CODES.select {|course| course == row_hash['COURSE_CODE']}
    when 'TX'
      TX_COURSE_CODES.select {|course| course == row_hash['course_codes']}
    when 'UT'
      UT_COURSE_CODES.select {|course| row_hash[course] == '1'}
    when 'VA'
      VA_COURSE_CODES.select {|course| course == row_hash['course']}
    when 'VT'
      VT_COURSE_CODES.select {|course| course == row_hash['Teaches CS']}
    when 'WI'
      WI_COURSE_CODES.select {|course| course == row_hash['course']}
    when 'WV'
      WV_COURSE_CODES.select {|course| course == row_hash['CourseCode']}
    when 'WY'
      WY_COURSE_CODES.select {|course| course == row_hash['course']}
    else
      raise ArgumentError.new("#{state_code} is not supported.")
    end
  end

  def self.seed_from_csv(state_code, school_year, update, filename, dry_run = false)
    ActiveRecord::Base.transaction do
      succeeded = 0
      skipped = 0
      CSV.foreach(filename, {headers: true}) do |row|
        row_hash = row.to_hash
        state_school_id = get_state_school_id(state_code, row_hash, school_year, update)
        courses = get_courses(state_code, row_hash, school_year, update)
        # state_school_id is unique so there should be at most one school.
        school = School.where(state_school_id: state_school_id).first
        if school && state_school_id && courses
          unless dry_run
            courses.each do |course|
              find_or_create_by!(
                school: school,
                course: course,
                school_year: school_year,
              )
            end
          end
          succeeded += 1
        else
          # We don't have mapping for every school code so skip over any that
          # can't be found in the database.
          CDO.log.warn "State CS Offering seeding: skipping row #{succeeded + skipped + 1}, "\
            "unknown state school id #{state_school_id}" \
            "#{courses.nil? ? 'and/or found no CS courses' : ''}"
          skipped += 1
        end
      end

      CDO.log.info "State CS Offering seeding: done processing "\
        "#{state_code}-#{school_year}-#{update} data. "\
        "#{succeeded} rows succeeded, #{skipped} rows skipped."
    end
  end

  CENSUS_BUCKET_NAME = "cdo-census".freeze
  STATE_CS_FOLDER = "state_cs_offerings".freeze

  # Construct a path to the CSV.
  # @param [string] state_code - Something like "CA".
  # @param [number] school_year - Something like 2018.
  # @param [number] update - Something like 2.
  # @param [string] file_extension
  def self.construct_object_key(state_code, school_year, update = 1, file_extension = 'csv')
    update_string = update == 1 ? "" : ".#{update}"
    "#{STATE_CS_FOLDER}/#{state_code}/#{school_year}-#{school_year + 1}#{update_string}.#{file_extension}"
  end

  # Deconstructs an object key into multiple variables.
  # @param [string] object_key - the AWS object name
  # @return [array] [state_code, school_year, update, extension]
  def self.deconstruct_object_key(object_key)
    # "state_cs_offerings/<state_code>/<school_year>-<school_year_end>(.<update>).<file_extension>"
    _, state_code, name = object_key.split('/')
    years, update_or_extension, extension = name.split('.')
    start_year, _ = years.split('-')
    update = extension ? update_or_extension : 1
    extension ||= update_or_extension
    [
      state_code,
      start_year,
      update,
      extension
    ]
  end

  # Searches the state_cs_offering folder for files with the .test extension and attempts to dry run seed them
  def self.dry_run_new_test_file(object_key)
    state_code, school_year, update = deconstruct_object_key(object_key)
    AWS::S3.process_file(CENSUS_BUCKET_NAME, object_key) do |filename|
      seed_from_csv(state_code, school_year, update, filename, true)
    end
  end

  def self.seed_from_s3(file_extension: 'csv', dry_run: false)
    # State CS Offering data files in S3 are named
    # "state_cs_offerings/<STATE_CODE>/<SCHOOL_YEAR_START>-<SCHOOL_YEAR_END>.csv"
    # The first school year where we have data is 2015-2016
    seeded_objects = []
    current_year = Date.today.year
    (2015..current_year).each do |school_year|
      SUPPORTED_STATES.each do |state_code|
        SUPPORTED_UPDATES.each do |update|
          object_key = construct_object_key(state_code, school_year, update, file_extension)
          begin
            AWS::S3.seed_from_file(CENSUS_BUCKET_NAME, object_key, dry_run) do |filename|
              seed_from_csv(state_code, school_year, update, filename, dry_run)
              seeded_objects << object_key
            end
          rescue Aws::S3::Errors::NotFound
            # We don't expect every school year to be there so skip anything that isn't found.
            # Note: Don't print out this warning in a dry run to reduce noises.
            CDO.log.warn "State CS Offering seeding: object #{object_key} not found in S3 - skipping." unless dry_run
          end
        end
      end
    end
    CDO.log.info "Seeded data from #{seeded_objects.count} object(s)."
    CDO.log.info seeded_objects.join("\n")
    CDO.log.info "This is a dry run. No data is written to the database." if dry_run
  end

  # Test seeding an object from S3 to find issues.
  # This method does not check if the object had been seeded before
  # and does not write to the database.
  #
  # @example:
  #   Census::StateCsOffering.dry_seed_s3_object('AL', 2019, 1)
  #   will seed from state_cs_offerings/AL/2019-2020.csv object
  #
  #   Census::StateCsOffering.dry_seed_s3_object('WA', 2019, 2, 'txt')
  #   will seed from state_cs_offerings/WA/2019-2020.2.txt object
  def self.dry_seed_s3_object(state_code, school_year, update, file_extension = 'csv')
    object_key = construct_object_key(state_code, school_year, update, file_extension)
    AWS::S3.process_file(CENSUS_BUCKET_NAME, object_key) do |filename|
      seed_from_csv(state_code, school_year, update, filename, true)
    end
  rescue Aws::S3::Errors::NoSuchKey
    CDO.log.warn "State CS Offering seeding: Object #{object_key} not found in S3."
  ensure
    CDO.log.info "This is a dry run. No data is written to the database."
  end

  def self.seed
    if CDO.stub_school_data
      STATES_USING_FORMAT_V2_IN_2017_18.each do |state_code|
        school_year = 2017
        update = 1
        filename = construct_object_key(state_code, school_year, update)
        seed_from_csv(state_code, school_year, update, "config/" + filename)
      end

      UPDATES_FOR_STATES_USING_FORMAT_V2_IN_MID_2017_18.each do |state_code, update|
        school_year = 2017
        filename = construct_object_key(state_code, school_year, update)
        seed_from_csv(state_code.to_s, school_year, update, "config/" + filename)
      end

      STATES_USING_FORMAT_V2_IN_2018_19.each do |state_code|
        school_year = 2018
        update = 1
        filename = construct_object_key(state_code, school_year, update)
        seed_from_csv(state_code, school_year, update, "config/" + filename)
      end

      UPDATES_FOR_STATES_USING_FORMAT_V2_IN_MID_2018_19.each do |state_code, update|
        school_year = 2018
        filename = construct_object_key(state_code, school_year, update)
        seed_from_csv(state_code.to_s, school_year, update, "config/" + filename)
      end
    else
      seed_from_s3
    end
  end
end
