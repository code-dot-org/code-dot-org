# Info on existing tutorial scripts on Code Studio,
# sometimes referenced in Pegasus.
# Used for conditional behaviors.

module ScriptConstants
  HOC_2013_NAME = 'Hour of Code'.freeze # this is the old (2013) hour of code
  EDIT_CODE_NAME = 'edit-code'.freeze
  TWENTY_FOURTEEN_NAME = 'events'.freeze
  JIGSAW_NAME = 'jigsaw'.freeze
  HOC_NAME = 'hourofcode'.freeze # name of the new (2014) hour of code script
  STARWARS_NAME = 'starwars'.freeze
  MINECRAFT_NAME = 'mc'.freeze
  STARWARS_BLOCKS_NAME = 'starwarsblocks'.freeze
  FROZEN_NAME = 'frozen'.freeze
  PLAYLAB_NAME = 'playlab'.freeze
  GUMBALL_NAME = 'gumball'.freeze
  ICEAGE_NAME = 'iceage'.freeze
  INFINITY_NAME = 'infinity'.freeze
  ARTIST_NAME = 'artist'.freeze
  ALGEBRA_NAME = 'algebra'.freeze
  ALGEBRA_A_NAME = 'AlgebraA'.freeze
  ALGEBRA_B_NAME = 'AlgebraB'.freeze
  FLAPPY_NAME = 'flappy'.freeze
  TWENTY_HOUR_NAME = '20-hour'.freeze
  ACCELERATED_NAME = 'accelerated'.freeze
  COURSE1_NAME = 'course1'.freeze
  COURSE2_NAME = 'course2'.freeze
  COURSE3_NAME = 'course3'.freeze
  COURSE4_NAME = 'course4'.freeze
  CSP_UNIT1_NAME = 'cspunit1'.freeze
  CSP_UNIT2_NAME = 'cspunit2'.freeze
  CSP_UNIT3_NAME = 'cspunit3'.freeze
  CSP_UNIT4_NAME = 'cspunit4'.freeze
  CSP_UNIT5_NAME = 'cspunit5'.freeze
  CSP_UNIT6_NAME = 'cspunit6'.freeze

  CSP17_UNIT1_NAME = 'csp1'.freeze
  CSP17_UNIT2_NAME = 'csp2'.freeze
  CSP17_UNIT3_NAME = 'csp3'.freeze

  CSP_ASSESSMENT_NAME = 'cspassessment'.freeze
  CSP_EXAM1_NAME = 'cspexam1-mWU7ilDYM9'.freeze
  CSP_EXAM2_NAME = 'cspexam2-AKwgAh1ac5'.freeze

  MINECRAFT_TEACHER_DASHBOARD_NAME = 'minecraft'.freeze
  HOC_TEACHER_DASHBOARD_NAME = 'classicmaze'.freeze

  # The order here matters. The first category a script appears under will be
  # the category it belongs to in course dropdowns. The order of scripts within
  # a category will be the order in which they appear in the dropdown.
  CATEGORIES = {
    hoc: [
      # Note that now multiple scripts can be an 'hour of code' script.
      # If adding a script here,
      # you must also update the Data_HocTutorials gsheet so the end of script API works

      nil,
      HOC_2013_NAME,
      HOC_NAME,
      FROZEN_NAME,
      FLAPPY_NAME,
      PLAYLAB_NAME,
      GUMBALL_NAME,
      ICEAGE_NAME,
      STARWARS_NAME,
      STARWARS_BLOCKS_NAME,
      MINECRAFT_NAME,
      INFINITY_NAME,
      ARTIST_NAME
    ],
    csf: [
      TWENTY_HOUR_NAME,
      COURSE1_NAME,
      COURSE2_NAME,
      COURSE3_NAME,
      COURSE4_NAME
    ],
    csp: [
      CSP_UNIT1_NAME,
      CSP_UNIT2_NAME,
      CSP_UNIT3_NAME,
      CSP_UNIT4_NAME,
      CSP_UNIT5_NAME,
      CSP_UNIT6_NAME
    ],
    csp17: [
      CSP17_UNIT1_NAME,
      CSP17_UNIT2_NAME,
      CSP17_UNIT3_NAME
    ],
    cspexams: [
      CSP_ASSESSMENT_NAME,
      CSP_EXAM1_NAME,
      CSP_EXAM2_NAME
    ],
    math: [
      ALGEBRA_NAME,
      ALGEBRA_A_NAME,
      ALGEBRA_B_NAME
    ],
    twenty_hour: [TWENTY_HOUR_NAME],
    flappy: [FLAPPY_NAME],
    minecraft: [MINECRAFT_NAME]
  }.freeze

  def self.script_in_category?(category, script)
    return CATEGORIES[category].include? script
  end

  def self.categories(script)
    CATEGORIES.select {|_, scripts| scripts.include? script}.
        map {|category, _| category.to_s}
  end

  def self.position_in_category(script, category)
    CATEGORIES[category.to_sym] ? CATEGORIES[category.to_sym].find_index(script) : nil
  end

  def self.teacher_dashboard_name(script)
    if script == MINECRAFT_NAME
      MINECRAFT_TEACHER_DASHBOARD_NAME
    elsif script == HOC_NAME
      HOC_TEACHER_DASHBOARD_NAME
    else
      script
    end
  end
end
