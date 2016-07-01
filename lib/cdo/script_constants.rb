# Info on existing tutorial scripts on Code Studio,
# sometimes referenced in Pegasus.
# Used for conditional behaviors.

module ScriptConstants
  HOC_2013_NAME = 'Hour of Code' # this is the old (2013) hour of code
  EDIT_CODE_NAME = 'edit-code'
  TWENTY_FOURTEEN_NAME = 'events'
  JIGSAW_NAME = 'jigsaw'
  HOC_NAME = 'hourofcode' # name of the new (2014) hour of code script
  STARWARS_NAME = 'starwars'
  MINECRAFT_NAME = 'mc'
  STARWARS_BLOCKS_NAME = 'starwarsblocks'
  FROZEN_NAME = 'frozen'
  PLAYLAB_NAME = 'playlab'
  GUMBALL_NAME = 'gumball'
  ICEAGE_NAME = 'iceage'
  INFINITY_NAME = 'infinity'
  ARTIST_NAME = 'artist'
  ALGEBRA_NAME = 'algebra'
  ALGEBRA_A_NAME = 'AlgebraA'
  ALGEBRA_B_NAME = 'AlgebraB'
  FLAPPY_NAME = 'flappy'
  TWENTY_HOUR_NAME = '20-hour'
  ACCELERATED_NAME = 'accelerated'
  COURSE1_NAME = 'course1'
  COURSE2_NAME = 'course2'
  COURSE3_NAME = 'course3'
  COURSE4_NAME = 'course4'
  CSP_UNIT1_NAME = 'cspunit1'
  CSP_UNIT2_NAME = 'cspunit2'
  CSP_UNIT3_NAME = 'cspunit3'
  CSP_UNIT4_NAME = 'cspunit4'
  CSP_UNIT5_NAME = 'cspunit5'
  CSP_UNIT6_NAME = 'cspunit6'

  CSP17_UNIT1_NAME = 'csp1'
  CSP17_UNIT2_NAME = 'csp2'
  CSP17_UNIT3_NAME = 'csp3'

  CSP_ASSESSMENT_NAME = 'cspassessment'
  CSP_EXAM1_NAME = 'cspexam1-mWU7ilDYM9'
  CSP_EXAM2_NAME = 'cspexam2-AKwgAh1ac5'

  MINECRAFT_TEACHER_DASHBOARD_NAME = 'minecraft'
  HOC_TEACHER_DASHBOARD_NAME = 'classicmaze'

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
  }

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
