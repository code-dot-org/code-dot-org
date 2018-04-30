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
      CSP = 'csp'.freeze,
      CSD = 'csd'.freeze,
    ],
    csf: [
      COURSEA_NAME = 'coursea'.freeze,
      COURSEB_NAME = 'courseb'.freeze,
      COURSEC_NAME = 'coursec'.freeze,
      COURSED_NAME = 'coursed'.freeze,
      COURSEE_NAME = 'coursee'.freeze,
      COURSEF_NAME = 'coursef'.freeze,
      EXPRESS_NAME = 'express'.freeze,
      PRE_READER_EXPRESS_NAME = 'pre-express'.freeze,
    ],
    hoc: [
      # Note that now multiple scripts can be an 'hour of code' script.
      # If adding a script here,
      # you must also update the Data_HocTutorials gsheet so the end of script API works

      nil,
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
      TWENTY_HOUR_NAME = '20-hour'.freeze,
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
      # CSP17_UNIT6_NAME = 'csp6'.freeze,
      CSP17_EXPORE_NAME = 'csp-explore'.freeze,
      CSP17_CREATE_NAME = 'csp-create'.freeze,
      CSP17_POSTAP_NAME = 'csppostap'.freeze,
    ],
    cspexams: [
      CSP_ASSESSMENT_NAME = 'cspassessment'.freeze,
      CSP_EXAM1_NAME = 'cspexam1-mWU7ilDYM9'.freeze,
      CSP_EXAM2_NAME = 'cspexam2-AKwgAh1ac5'.freeze,
    ],
    twenty_hour: [TWENTY_HOUR_NAME],
    flappy: [FLAPPY_NAME],
    minecraft: [
      MINECRAFT_NAME,
      MINECRAFT_DESIGNER_NAME,
      MINECRAFT_HERO_NAME,
    ],
    tts: [
      TTS_NAME = 'allthettsthings'.freeze
    ],
  }.freeze

  # If the course name (e.g. "foo-2018") has a version suffix, then the first
  # capture group is the assignment group name ("foo") and the second capture
  # group is the version year ("2018"). Does not match course name without
  # version suffix.
  VERSIONED_COURSE_NAME_REGEX = /^(.*)-(\d{4})$/

  DEFAULT_VERSION_YEAR = '2017'

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
  # both by dashboard and pegasus, and we want to keep that in sycn. We accomplish
  # most of that through this shared method, leaving it to dashboard/pegasus
  # to take care of translating name/cateogry (with the unfortunate affect that
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
end
