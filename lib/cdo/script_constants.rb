# Info on existing tutorial scripts on Code Studio,
# sometimes referenced in Pegasus.
# Used for conditional behaviors.

module ScriptConstants
  EDIT_CODE_NAME = 'edit-code'.freeze
  TWENTY_FOURTEEN_NAME = 'events'.freeze
  JIGSAW_NAME = 'jigsaw'.freeze
  ACCELERATED_NAME = 'accelerated'.freeze

  MINECRAFT_TEACHER_DASHBOARD_NAME = 'Minecraft Adventurer'.freeze
  MINECRAFT_DESIGNER_TEACHER_DASHBOARD_NAME = 'Minecraft Designer'.freeze
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
      HOC_2013_NAME = 'Hour of Code'.freeze, # 2013 hour of code
      HOC_NAME = 'hourofcode'.freeze, # 2014 hour of code
      FROZEN_NAME = 'frozen'.freeze,
      FLAPPY_NAME = 'flappy'.freeze,
      PLAYLAB_NAME = 'playlab'.freeze,
      GUMBALL_NAME = 'gumball'.freeze,
      ICEAGE_NAME = 'iceage'.freeze,
      STARWARS_NAME = 'starwars'.freeze,
      STARWARS_BLOCKS_NAME = 'starwarsblocks'.freeze,
      MINECRAFT_NAME = 'mc'.freeze,
      MINECRAFT_DESIGNER_NAME = 'minecraft'.freeze,
      INFINITY_NAME = 'infinity'.freeze,
      ARTIST_NAME = 'artist'.freeze,
      HOC_ENCRYPTION_NAME = 'hoc-encryption'.freeze,
      TEXT_COMPRESSION_NAME = 'text-compression'.freeze,
      BASKETBALL_NAME = 'basketball'.freeze,
      SPORTS_NAME = 'sports'.freeze,
    ],
    csf: [
      TWENTY_HOUR_NAME = '20-hour'.freeze,
      COURSE1_NAME = 'course1'.freeze,
      COURSE2_NAME = 'course2'.freeze,
      COURSE3_NAME = 'course3'.freeze,
      COURSE4_NAME = 'course4'.freeze,
    ],
    csf2_draft: [
      COURSEA_DRAFT_NAME = 'coursea-draft'.freeze,
      COURSEB_DRAFT_NAME = 'courseb-draft'.freeze,
      COURSEC_DRAFT_NAME = 'coursec-draft'.freeze,
      COURSED_DRAFT_NAME = 'coursed-draft'.freeze,
      COURSEE_DRAFT_NAME = 'coursee-draft'.freeze,
      COURSEF_DRAFT_NAME = 'coursef-draft'.freeze,
    ],
    csd: [
      CSD1_NAME = 'csd1'.freeze,
      CSD2_NAME = 'csd2'.freeze,
      CSD3_NAME = 'csd3'.freeze,
      CSD4_NAME = 'csd4'.freeze,
      CSD5_NAME = 'csd5'.freeze,
      CSD6_NAME = 'csd6'.freeze,
    ],
    csp: [
      CSP_UNIT1_NAME = 'cspunit1'.freeze,
      CSP_UNIT2_NAME = 'cspunit2'.freeze,
      CSP_UNIT3_NAME = 'cspunit3'.freeze,
      CSP_UNIT4_NAME = 'cspunit4'.freeze,
      CSP_UNIT5_NAME = 'cspunit5'.freeze,
      CSP_UNIT6_NAME = 'cspunit6'.freeze,
    ],
    csp17: [
      CSP17_UNIT1_NAME = 'csp1'.freeze,
      CSP17_UNIT2_NAME = 'csp2'.freeze,
      CSP17_UNIT3_NAME = 'csp3'.freeze,
      CSP17_UNIT4_NAME = 'csp4'.freeze,
      CSP17_UNIT5_NAME = 'csp5'.freeze,
      CSP17_UNIT6_NAME = 'csp6'.freeze,
      CSP17_POSTAP_NAME = 'csppostap'.freeze,
    ],
    cspexams: [
      CSP_ASSESSMENT_NAME = 'cspassessment'.freeze,
      CSP_EXAM1_NAME = 'cspexam1-mWU7ilDYM9'.freeze,
      CSP_EXAM2_NAME = 'cspexam2-AKwgAh1ac5'.freeze,
    ],
    math: [
      ALGEBRA_NAME = 'algebra'.freeze,
      ALGEBRA_A_NAME = 'AlgebraA'.freeze,
      ALGEBRA_B_NAME = 'AlgebraB'.freeze,
    ],
    research_studies: [
      HOC_IMPACT_STUDY_NAME = 'hoc-impact-study'.freeze,
      FLAPPY_IMPACT_STUDY_NAME = 'flappy-impact-study'.freeze
    ],
    twenty_hour: [TWENTY_HOUR_NAME],
    flappy: [FLAPPY_NAME],
    minecraft: [
      MINECRAFT_NAME,
      MINECRAFT_DESIGNER_NAME
    ]
  }.freeze

  # By default, categories have an ordering priority of 0 and are ordered alphabetically by name.
  # This can be used to override that, with lower numbers ordered sooner, and higher numbers
  # ordered later.
  CATEGORY_ORDERING_PRIORITY = {
    research_studies: 1,
    csp: 2,
  }.freeze

  def self.script_in_category?(category, script)
    return CATEGORIES[category].include? script
  end

  def self.script_in_any_category?(script)
    CATEGORIES.keys.any? do |category|
      script_in_category?(category, script)
    end
  end

  def self.categories(script)
    CATEGORIES.select {|_, scripts| scripts.include? script}.
        map {|category, _| category.to_s}
  end

  def self.position_in_category(script, category)
    CATEGORIES[category.to_sym] ? CATEGORIES[category.to_sym].find_index(script) : nil
  end

  def self.category_priority(category)
    CATEGORY_ORDERING_PRIORITY[category.to_sym] || 0
  end

  def self.teacher_dashboard_name(script)
    if script == MINECRAFT_NAME
      MINECRAFT_TEACHER_DASHBOARD_NAME
    elsif script == MINECRAFT_DESIGNER_NAME
      MINECRAFT_DESIGNER_TEACHER_DASHBOARD_NAME
    elsif script == HOC_NAME
      HOC_TEACHER_DASHBOARD_NAME
    else
      script
    end
  end
end
