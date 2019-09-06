# Info on existing tutorial scripts on Code Studio,
# sometimes referenced in Pegasus.
# Used for conditional behaviors.

module ScriptConstants
  EDIT_CODE_NAME = 'edit-code'.freeze
  TWENTY_FOURTEEN_NAME = 'events'.freeze
  JIGSAW_NAME = 'jigsaw'.freeze
  ACCELERATED_NAME = 'accelerated'.freeze

  OTHER_CATEGORY_NAME = 'other'.freeze

  MINECRAFT_TEACHER_DASHBOARD_NAME = 'Minecraft Adventurer'.freeze
  MINECRAFT_DESIGNER_TEACHER_DASHBOARD_NAME = 'Minecraft Designer'.freeze
  HOC_TEACHER_DASHBOARD_NAME = 'classicmaze'.freeze

  # The order here matters. The first category a script appears under will be
  # the category it belongs to in course dropdowns. The order of scripts within
  # a category will be the order in which they appear in the dropdown, and the
  # order of the categories will be their order in the dropdown.
  CATEGORIES = {
    full_course: [
      CSP_2017 = 'csp-2017'.freeze,
      CSP_2018 = 'csp-2018'.freeze,
      CSP_2019 = 'csp-2019'.freeze,
      CSD_2017 = 'csd-2017'.freeze,
      CSD_2018 = 'csd-2018'.freeze,
      CSD_2019 = 'csd-2019'.freeze,
    ],
    csf: [
      COURSEA_NAME = 'coursea-2017'.freeze,
      COURSEB_NAME = 'courseb-2017'.freeze,
      COURSEC_NAME = 'coursec-2017'.freeze,
      COURSED_NAME = 'coursed-2017'.freeze,
      COURSEE_NAME = 'coursee-2017'.freeze,
      COURSEF_NAME = 'coursef-2017'.freeze,
      EXPRESS_NAME = 'express-2017'.freeze,
      PRE_READER_EXPRESS_NAME = 'pre-express-2017'.freeze,
    ],
    csf_2018: [
      COURSEA_2018_NAME = 'coursea-2018'.freeze,
      COURSEB_2018_NAME = 'courseb-2018'.freeze,
      COURSEC_2018_NAME = 'coursec-2018'.freeze,
      COURSED_2018_NAME = 'coursed-2018'.freeze,
      COURSEE_2018_NAME = 'coursee-2018'.freeze,
      COURSEF_2018_NAME = 'coursef-2018'.freeze,
      EXPRESS_2018_NAME = 'express-2018'.freeze,
      PRE_READER_EXPRESS_2018_NAME = 'pre-express-2018'.freeze,
    ],
    csf_2019: [
      COURSEA_2019_NAME = 'coursea-2019'.freeze,
      COURSEB_2019_NAME = 'courseb-2019'.freeze,
      COURSEC_2019_NAME = 'coursec-2019'.freeze,
      COURSED_2019_NAME = 'coursed-2019'.freeze,
      COURSEE_2019_NAME = 'coursee-2019'.freeze,
      COURSEF_2019_NAME = 'coursef-2019'.freeze,
      EXPRESS_2019_NAME = 'express-2019'.freeze,
      PRE_READER_EXPRESS_2019_NAME = 'pre-express-2019'.freeze,
    ],
    hoc: [
      # Note that now multiple scripts can be an 'hour of code' script.
      # If adding a script here,
      # you must also update the cdo-tutorials gsheet so the end of script API works

      nil,
      DANCE_PARTY_NAME = 'dance'.freeze, # 2018 hour of code
      DANCE_PARTY_EXTRAS_NAME = 'dance-extras'.freeze, # 2018 hour of code
      MINECRAFT_AQUATIC_NAME = 'aquatic'.freeze,
      MINECRAFT_HERO_NAME = 'hero'.freeze,
      MINECRAFT_NAME = 'mc'.freeze,
      MINECRAFT_DESIGNER_NAME = 'minecraft'.freeze,
      APPLAB_INTRO = 'applab-intro'.freeze,
      HOC_2013_NAME = 'Hour of Code'.freeze, # 2013 hour of code
      FROZEN_NAME = 'frozen'.freeze,
      FLAPPY_NAME = 'flappy'.freeze,
      PLAYLAB_NAME = 'playlab'.freeze,
      GUMBALL_NAME = 'gumball'.freeze,
      ICEAGE_NAME = 'iceage'.freeze,
      STARWARS_NAME = 'starwars'.freeze,
      STARWARS_BLOCKS_NAME = 'starwarsblocks'.freeze,
      INFINITY_NAME = 'infinity'.freeze,
      ARTIST_NAME = 'artist'.freeze,
      HOC_ENCRYPTION_NAME = 'hoc-encryption'.freeze,
      TEXT_COMPRESSION_NAME = 'text-compression'.freeze,
      BASKETBALL_NAME = 'basketball'.freeze,
      SPORTS_NAME = 'sports'.freeze,
      HOC_NAME = 'hourofcode'.freeze, # 2014 hour of code
    ],
    csf_international: [
      COURSE1_NAME = 'course1'.freeze,
      COURSE2_NAME = 'course2'.freeze,
      COURSE3_NAME = 'course3'.freeze,
      COURSE4_NAME = 'course4'.freeze,
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
    csf2_draft: [
      COURSEA_DRAFT_NAME = 'coursea-draft'.freeze,
      COURSEB_DRAFT_NAME = 'courseb-draft'.freeze,
      COURSEC_DRAFT_NAME = 'coursec-draft'.freeze,
      COURSED_DRAFT_NAME = 'coursed-draft'.freeze,
      COURSEE_DRAFT_NAME = 'coursee-draft'.freeze,
      COURSEF_DRAFT_NAME = 'coursef-draft'.freeze,
    ],
    csd_pilot: [
      CSD1_PILOT_NAME = 'csd1-pilot'.freeze,
      CSD2_PILOT_NAME = 'csd2-pilot'.freeze,
      CSD3_PILOT_NAME = 'csd3-pilot'.freeze,
    ],
    csd_2019: [
      CSD1_2019_NAME = 'csd1-2019'.freeze,
      CSD2_2019_NAME = 'csd2-2019'.freeze,
      CSD3_2019_NAME = 'csd3-2019'.freeze,
      CSD4_2019_NAME = 'csd4-2019'.freeze,
      CSD5_2019_NAME = 'csd5-2019'.freeze,
      CSD6_2019_NAME = 'csd6-2019'.freeze,
    ],
    csd_2018: [
      CSD1_2018_NAME = 'csd1-2018'.freeze,
      CSD2_2018_NAME = 'csd2-2018'.freeze,
      CSD3_2018_NAME = 'csd3-2018'.freeze,
      CSD4_2018_NAME = 'csd4-2018'.freeze,
      CSD5_2018_NAME = 'csd5-2018'.freeze,
      CSD6_2018_NAME = 'csd6-2018'.freeze,
      CSD_POST_SURVEY_2018_NAME = 'csd-post-survey-2018'.freeze,
    ],
    csd: [
      CSD1_NAME = 'csd1-2017'.freeze,
      CSD2_NAME = 'csd2-2017'.freeze,
      CSD3_NAME = 'csd3-2017'.freeze,
      CSD4_NAME = 'csd4-2017'.freeze,
      CSD5_NAME = 'csd5-2017'.freeze,
      CSD6_NAME = 'csd6-2017'.freeze,
    ],
    csp_2019: [
      CSP1_2019_NAME = 'csp1-2019'.freeze,
      CSP2_2019_NAME = 'csp2-2019'.freeze,
      CSP3_2019_NAME = 'csp3-2019'.freeze,
      CSP4_2019_NAME = 'csp4-2019'.freeze,
      CSP5_2019_NAME = 'csp5-2019'.freeze,
      CSP_CREATE_2019_NAME = 'csp-create-2019'.freeze,
      CSP_POSTAP_2019_NAME = 'csppostap-2019'.freeze,
      CSP_POST_SURVEY_2019_NAME = 'csp-post-survey-2019'.freeze,
      CSP_EXPLORE_2019_NAME = 'csp-explore-2019'.freeze,
    ],
    csp_2018: [
      CSP1_2018_NAME = 'csp1-2018'.freeze,
      CSP2_2018_NAME = 'csp2-2018'.freeze,
      CSP3_2018_NAME = 'csp3-2018'.freeze,
      CSP4_2018_NAME = 'csp4-2018'.freeze,
      CSP_EXPLORE_2018_NAME = 'csp-explore-2018'.freeze,
      CSP5_2018_NAME = 'csp5-2018'.freeze,
      CSP_CREATE_2018_NAME = 'csp-create-2018'.freeze,
      CSP_POSTAP_2018_NAME = 'csppostap-2018'.freeze,
      CSP_POST_SURVEY_2018_NAME = 'csp-post-survey-2018'.freeze,
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
      CSP17_UNIT1_NAME = 'csp1-2017'.freeze,
      CSP17_UNIT2_NAME = 'csp2-2017'.freeze,
      CSP17_UNIT3_NAME = 'csp3-2017'.freeze,
      CSP17_UNIT4_NAME = 'csp4-2017'.freeze,
      CSP17_UNIT5_NAME = 'csp5-2017'.freeze,
      # CSP17_UNIT6_NAME = 'csp6'.freeze,
      CSP17_EXPLORE_NAME = 'csp-explore-2017'.freeze,
      CSP17_CREATE_NAME = 'csp-create-2017'.freeze,
      CSP17_POSTAP_NAME = 'csppostap-2017'.freeze,
      CSP17_SURVEY_NAME = 'csp-post-survey'.freeze,
    ],
    cspexams: [
      CSP_ASSESSMENT_NAME = 'cspassessment'.freeze,
      CSP_EXAM1_NAME = 'cspexam1-mWU7ilDYM9'.freeze,
      CSP_EXAM2_NAME = 'cspexam2-AKwgAh1ac5'.freeze,
    ],
    twenty_hour: [
      TWENTY_HOUR_NAME = '20-hour'.freeze,
    ],
    flappy: [FLAPPY_NAME],
    minecraft: [
      MINECRAFT_NAME,
      MINECRAFT_DESIGNER_NAME,
      MINECRAFT_HERO_NAME,
      MINECRAFT_AQUATIC_NAME
    ],
    tts: [
      TTS_NAME = 'allthettsthings'.freeze
    ],
  }.freeze

  ADDITIONAL_I18N_SCRIPTS = [
    APPLAB_1HOUR = 'applab-1hour'.freeze,
    APPLAB_2HOUR = 'applab-2hour'.freeze,
    CSD_POST_SURVEY = 'csd-post-survey'.freeze,
    DEEPDIVE_DEBUGGING = 'deepdive-debugging'.freeze,
    FESBINARY = 'fesbinary'.freeze,
    FREQUENCY_ANALYSIS = 'frequency_analysis'.freeze,
    GAMELAB = 'gamelab'.freeze,
    K1HOC_2017 = 'k1hoc2017'.freeze,
    K5_ONLINE_PD = 'K5-OnlinePD'.freeze,
    NETSIM = 'netsim'.freeze,
    ODOMETER = 'odometer'.freeze,
    PIXELATION = 'pixelation'.freeze,
    VIGENERE = 'vigenere'.freeze
  ]

  DEFAULT_VERSION_YEAR = '2017'

  # A whitelist of all family names for scripts.
  FAMILY_NAMES = [
    # CSF
    COURSEA = 'coursea'.freeze,
    COURSEB = 'courseb'.freeze,
    COURSEC = 'coursec'.freeze,
    COURSED = 'coursed'.freeze,
    COURSEE = 'coursee'.freeze,
    COURSEF = 'coursef'.freeze,
    EXPRESS = 'express'.freeze,
    PREEXPRESS = 'pre-express'.freeze,

    # CSP
    CSP1 = 'csp1'.freeze,
    CSP2 = 'csp2'.freeze,
    CSP3 = 'csp3'.freeze,
    CSP4 = 'csp4'.freeze,
    CSP5 = 'csp5'.freeze,
    CSP_POSTAP = 'csppostap'.freeze,
    CSP_CREATE = 'csp-create'.freeze,
    CSP_EXPLORE = 'csp-explore'.freeze,

    # CSD
    CSD1 = "csd1".freeze,
    CSD2 = "csd2".freeze,
    CSD3 = "csd3".freeze,
    CSD4 = "csd4".freeze,
    CSD5 = "csd5".freeze,
    CSD6 = "csd6".freeze
  ].freeze

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
    if category == OTHER_CATEGORY_NAME
      CATEGORIES.keys.length # 'other' goes at the end
    else
      CATEGORIES.keys.find_index(category.to_sym)
    end
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

  # Sections can be assigned to both courses and scripts. We want to make sure
  # we give teacher dashboard the same information for both sets of assignables.
  # We also expect to be in a mixed world for a time where this info is asked for
  # both by dashboard and pegasus, and we want to keep that in sync. We accomplish
  # most of that through this shared method, leaving it to dashboard/pegasus
  # to take care of translating name/cateogry (with the unfortunate effect that
  # we could have two different translations).
  # @param course_or_script [Course|Script] A row object from either our courses
  #   or scripts dashboard db tables.
  # @param hidden [Boolean] True if the passed in item is hidden
  # @return {AssignableInfo} without strings translated
  def self.assignable_info(course_or_script)
    name = ScriptConstants.teacher_dashboard_name(course_or_script[:name])
    first_category = ScriptConstants.categories(course_or_script[:name])[0] ||
        OTHER_CATEGORY_NAME
    {
      id: course_or_script[:id],
      name: name,
      # Would better be called something like assignable_name
      script_name: course_or_script[:name],
      category: first_category,
      position: ScriptConstants.position_in_category(course_or_script[:name], first_category),
      category_priority: ScriptConstants.category_priority(first_category),
    }
  end

  def self.has_congrats_page?(script)
    script == ACCELERATED_NAME ||
      ScriptConstants.script_in_category?(:csf_international, script) ||
      ScriptConstants.script_in_category?(:csf, script) ||
      ScriptConstants.script_in_category?(:csf_2018, script) ||
      ScriptConstants.script_in_category?(:csf_2019, script)
  end

  def self.i18n?(script)
    ScriptConstants.script_in_category?(:csf_international, script) ||
      ScriptConstants.script_in_category?(:csf, script) ||
      ScriptConstants.script_in_category?(:csf_2018, script) ||
      ScriptConstants.script_in_category?(:csf_2019, script) ||
      ScriptConstants.script_in_category?(:csd, script) ||
      ScriptConstants.script_in_category?(:csd_2018, script) ||
      ScriptConstants.script_in_category?(:csd_2019, script) ||
      ScriptConstants.script_in_category?(:twenty_hour, script) ||
      ScriptConstants.script_in_category?(:hoc, script) ||
      JIGSAW_NAME == script ||
      ADDITIONAL_I18N_SCRIPTS.include?(script)
  end
end
