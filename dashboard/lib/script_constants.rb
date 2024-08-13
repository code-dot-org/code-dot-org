# Info on existing tutorial scripts on Code Studio,
# sometimes referenced in Pegasus.
# Used for conditional behaviors.

module ScriptConstants
  EDIT_CODE_NAME = 'edit-code'.freeze
  TWENTY_FOURTEEN_NAME = 'events'.freeze
  JIGSAW_NAME = 'jigsaw'.freeze
  ACCELERATED_NAME = 'accelerated'.freeze
  ALGEBRA_NAME = 'algebra'.freeze
  AIML_2021_NAME = 'aiml-2021'.freeze

  CSP_UNIT1_NAME = 'cspunit1'.freeze
  CSP_UNIT2_NAME = 'cspunit2'.freeze
  CSP_UNIT3_NAME = 'cspunit3'.freeze
  CSP17_UNIT1_NAME = 'csp1-2017'.freeze
  CSP17_UNIT2_NAME = 'csp2-2017'.freeze
  CSP17_UNIT3_NAME = 'csp3-2017'.freeze

  # CSF family names
  COURSEA = 'coursea'.freeze
  COURSEB = 'courseb'.freeze
  COURSEC = 'coursec'.freeze
  COURSED = 'coursed'.freeze
  COURSEE = 'coursee'.freeze
  COURSEF = 'coursef'.freeze
  EXPRESS = 'express'.freeze
  PREEXPRESS = 'pre-express'.freeze

  # The order here matters. The first category a script appears under will be
  # the category it belongs to in course dropdowns. The order of scripts within
  # a category will be the order in which they appear in the dropdown, and the
  # order of the categories will be their order in the dropdown.
  CATEGORIES = {
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
    csf_2020: [
      COURSEA_2020_NAME = 'coursea-2020'.freeze,
      COURSEB_2020_NAME = 'courseb-2020'.freeze,
      COURSEC_2020_NAME = 'coursec-2020'.freeze,
      COURSED_2020_NAME = 'coursed-2020'.freeze,
      COURSEE_2020_NAME = 'coursee-2020'.freeze,
      COURSEF_2020_NAME = 'coursef-2020'.freeze,
      EXPRESS_2020_NAME = 'express-2020'.freeze,
      PRE_READER_EXPRESS_2020_NAME = 'pre-express-2020'.freeze,
    ],
    csf_2021: [
      COURSEA_2021_NAME = 'coursea-2021'.freeze,
      COURSEB_2021_NAME = 'courseb-2021'.freeze,
      COURSEC_2021_NAME = 'coursec-2021'.freeze,
      COURSED_2021_NAME = 'coursed-2021'.freeze,
      COURSEE_2021_NAME = 'coursee-2021'.freeze,
      COURSEF_2021_NAME = 'coursef-2021'.freeze,
      EXPRESS_2021_NAME = 'express-2021'.freeze,
      PRE_READER_EXPRESS_2021_NAME = 'pre-express-2021'.freeze,
    ],
    csf_2022: [
      COURSEA_2022_NAME = 'coursea-2022'.freeze,
      COURSEB_2022_NAME = 'courseb-2022'.freeze,
      COURSEC_2022_NAME = 'coursec-2022'.freeze,
      COURSED_2022_NAME = 'coursed-2022'.freeze,
      COURSEE_2022_NAME = 'coursee-2022'.freeze,
      COURSEF_2022_NAME = 'coursef-2022'.freeze,
      EXPRESS_2022_NAME = 'express-2022'.freeze,
      PRE_READER_EXPRESS_2022_NAME = 'pre-express-2022'.freeze,
    ],
    csf_2023: [
      COURSEA_2023_NAME = 'coursea-2023'.freeze,
      COURSEB_2023_NAME = 'courseb-2023'.freeze,
      COURSEC_2023_NAME = 'coursec-2023'.freeze,
      COURSED_2023_NAME = 'coursed-2023'.freeze,
      COURSEE_2023_NAME = 'coursee-2023'.freeze,
      COURSEF_2023_NAME = 'coursef-2023'.freeze,
      EXPRESS_2023_NAME = 'express-2023'.freeze,
      PRE_READER_EXPRESS_2023_NAME = 'pre-express-2023'.freeze,
    ],
    csc_2021: [
      POETRY_2021_NAME = 'poetry-2021'.freeze,
      AI_ETHICS_2021_NAME = 'ai-ethics-2021'.freeze,
      COUNTING_CSC_2021_NAME = 'counting-csc-2021'.freeze,
      EXPLORE_DATA_1_2021_NAME = 'explore-data-1-2021'.freeze,
      SPELLING_BEE_2021_NAME = 'spelling-bee-2021'.freeze
    ],
    hoc: [
      # Note that now multiple scripts can be an 'hour of code' script.
      # If adding a script here, you must also update the cdo-tutorials gsheet
      # so the end of script API works; specifically, there needs to be a row
      # with code_s matching the script name (in quotes) in this list.

      nil,
      DANCE_AI_2023 = 'dance-ai-2023'.freeze, # 2023 hour of code
      POEM_ART_2021_NAME = 'poem-art-2021'.freeze, # 2021 hour of code
      HELLO_WORLD_FOOD_2021_NAME = 'hello-world-food-2021'.freeze, # 2021 hour of code
      HELLO_WORLD_ANIMALS_2021_NAME = 'hello-world-animals-2021'.freeze, # 2021 hour of code
      HELLO_WORLD_EMOJI_2021_NAME = 'hello-world-emoji-2021'.freeze, # 2021 hour of code
      HELLO_WORLD_RETRO_2021_NAME = 'hello-world-retro-2021'.freeze, # 2021 hour of code
      HELLO_WORLD_SPACE_2022_NAME = 'hello-world-space-2022'.freeze, # 2022 hour of code
      HELLO_WORLD_SOCCER_2022_NAME = 'hello-world-soccer-2022'.freeze, # 2022 hour of code
      DANCE_PARTY_2019_NAME = 'dance-2019'.freeze, # 2019 hour of code
      DANCE_PARTY_EXTRAS_2019_NAME = 'dance-extras-2019'.freeze, # 2019 hour of code
      OCEANS_NAME = 'oceans'.freeze,
      OUTBREAK_NAME = 'outbreak'.freeze,
      MINECRAFT_AQUATIC_NAME = 'aquatic'.freeze,
      MINECRAFT_HERO_NAME = 'hero'.freeze,
      MINECRAFT_NAME = 'mc'.freeze,
      MINECRAFT_DESIGNER_NAME = 'minecraft'.freeze,
      MINECRAFT_AI_NAME = 'generation-ai'.freeze,
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
      DANCE_PARTY_NAME = 'dance'.freeze, # 2018 hour of code
      DANCE_PARTY_EXTRAS_NAME = 'dance-extras'.freeze, # 2018 hour of code
      HOW_AI_WORKS_2023_NAME = 'how-ai-works-2023'.freeze,
      AI_ETHICS_2023_NAME = 'ai-ethics-2023'.freeze,
    ],
    csf_international: [
      COURSE1_NAME = 'course1'.freeze,
      COURSE2_NAME = 'course2'.freeze,
      COURSE3_NAME = 'course3'.freeze,
      COURSE4_NAME = 'course4'.freeze,
    ],
    csd_2023: [
      CSD1_2023_NAME = 'csd1-2023'.freeze,
      CSD2_2023_NAME = 'csd2-2023'.freeze,
      CSD3_2023_NAME = 'csd3-2023'.freeze,
      CSD4_2023_NAME = 'csd4-2023'.freeze,
      CSD5_2023_NAME = 'csd5-2023'.freeze,
      CSD6A_2023_NAME = 'csd6a-2023'.freeze,
      CSD6B_2023_NAME = 'csd6b-2023'.freeze,
      CSD7_2023_NAME = 'csd7-2023'.freeze,
    ],
    csd_2022: [
      CSD1_2022_NAME = 'csd1-2022'.freeze,
      CSD2_2022_NAME = 'csd2-2022'.freeze,
      CSD3_2022_NAME = 'csd3-2022'.freeze,
      CSD4_2022_NAME = 'csd4-2022'.freeze,
      CSD5_2022_NAME = 'csd5-2022'.freeze,
      CSD6_2022_NAME = 'csd6-2022'.freeze,
      CSD7_2022_NAME = 'csd7-2022'.freeze,
    ],
    csd_2021: [
      CSD1_2021_NAME = 'csd1-2021'.freeze,
      CSD2_2021_NAME = 'csd2-2021'.freeze,
      CSD3_2021_NAME = 'csd3-2021'.freeze,
      CSD4_2021_NAME = 'csd4-2021'.freeze,
      CSD5_2021_NAME = 'csd5-2021'.freeze,
      CSD6_2021_NAME = 'csd6-2021'.freeze,
      CSD7_2021_NAME = 'csd7-2021'.freeze,
    ],
    csd_2020: [
      CSD1_2020_NAME = 'csd1-2020'.freeze,
      CSD2_2020_NAME = 'csd2-2020'.freeze,
      CSD3_2020_NAME = 'csd3-2020'.freeze,
      CSD4_2020_NAME = 'csd4-2020'.freeze,
      CSD5_2020_NAME = 'csd5-2020'.freeze,
      CSD6_2020_NAME = 'csd6-2020'.freeze,
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
    twenty_hour: [
      TWENTY_HOUR_NAME = '20-hour'.freeze,
    ],
    flappy: [FLAPPY_NAME],
    minecraft: [
      MINECRAFT_NAME,
      MINECRAFT_DESIGNER_NAME,
      MINECRAFT_HERO_NAME,
      MINECRAFT_AQUATIC_NAME,
      MINECRAFT_AI_NAME,
    ],
  }.freeze

  TRANSLATEABLE_CSC_UNITS = [
    POETRY_2023_NAME = 'poetry-2023'.freeze,
    CSC_BOOKCOVERS_2023_NAME = 'csc-bookcovers-2023'.freeze,
    CSC_STARQUILTS_2023_NAME = 'csc-starquilts-2023'.freeze,
    CSC_ECOSYSTEMS_2023_NAME = 'csc-ecosystems-2023'.freeze,
    CSC_ADAPTATIONS_2023_NAME = 'csc-adaptations-2023'.freeze,
    CSC_TIMECAPSULE_2023_NAME = 'csc-timecapsule-2023'.freeze,
    CSC_MAPPINGLANDMARKS_2023_NAME = 'csc-mappinglandmarks-2023'.freeze,
  ].freeze

  ADDITIONAL_I18N_UNITS = [
    APPLAB_1HOUR = 'applab-1hour'.freeze,
    APPLAB_2HOUR = 'applab-2hour'.freeze,
    CSD_POST_SURVEY = 'csd-post-survey'.freeze,
    DEEPDIVE_DEBUGGING = 'deepdive-debugging'.freeze,
    FREQUENCY_ANALYSIS = 'frequency_analysis'.freeze,
    GAMELAB = 'gamelab'.freeze,
    HELLO_WORLD_FOOD = 'hello-world-food'.freeze,
    HELLO_WORLD_ANIMALS = 'hello-world-animals'.freeze,
    HELLO_WORLD_EMOJI = 'hello-world-emoji'.freeze,
    HELLO_WORLD_RETRO = 'hello-world-retro'.freeze,
    K1HOC_2017 = 'k1hoc2017'.freeze,
    MUSIC_INTRO_2024 = 'music-intro-2024'.freeze,
    MUSIC_ONBOARD = 'music-onboard'.freeze,
    MUSIC_TUTORIAL_2024 = 'music-tutorial-2024'.freeze,
    NETSIM = 'netsim'.freeze,
    ODOMETER = 'odometer'.freeze,
    OUTBREAK = 'outbreak'.freeze,
    PIXELATION = 'pixelation'.freeze,
    POEM_ART = 'poem-art'.freeze,
    POETRY_HOC3 = 'poetry-hoc3'.freeze,
    VIGENERE = 'vigenere'.freeze,
    K5_ONLINEPD_2019 = 'k5-onlinepd-2019'.freeze,
    K5_ONLINEPD_2023 = 'k5-onlinepd-2023'.freeze,
    K5_ONLINEPD = 'K5-OnlinePD'.freeze,
    KODEA_PD_2021 = 'kodea-pd-2021'.freeze,
    ALLTHETHINGS = 'allthethings'.freeze,
    COMPUTER_VISION = 'computer-vision'.freeze,
    CSD2_2024 = 'csd2-2024'.freeze,
  ]

  DEFAULT_VERSION_YEAR = '2017'

  # An allowlist of all family names which are not course offerings.
  # This list is deprecated. Do not add to this list.
  DEPRECATED_FAMILY_NAMES = [
    # CSP
    CSP1 = 'csp1'.freeze,
    CSP2 = 'csp2'.freeze,
    CSP3 = 'csp3'.freeze,
    CSP4 = 'csp4'.freeze,
    CSP5 = 'csp5'.freeze,
    CSP6 = 'csp6'.freeze,
    CSP7 = 'csp7'.freeze,
    CSP8 = 'csp8'.freeze,
    CSP9 = 'csp9'.freeze,
    CSP10 = 'csp10'.freeze,
    CSP_POSTAP = 'csppostap'.freeze,
    CSP_CREATE = 'csp-create'.freeze,
    CSP_EXPLORE = 'csp-explore'.freeze,

    # CSD
    CSD1 = "csd1".freeze,
    CSD2 = "csd2".freeze,
    CSD3 = "csd3".freeze,
    CSD4 = "csd4".freeze,
    CSD5 = "csd5".freeze,
    CSD6 = "csd6".freeze,
  ].freeze

  def self.unit_in_category?(category, script)
    return CATEGORIES[category].include? script
  end

  CSF_COURSE_PATTERNS = [/^(course[a-f])-([0-9]+)$/, /^(express)-([0-9]+)$/, /^(pre-express)-([0-9]+)$/]

  TRANSLATEABLE_UNITS = [
    *CATEGORIES[:csd],
    *CATEGORIES[:csd_2018],
    *CATEGORIES[:csd_2019],
    *CATEGORIES[:csd_2021],
    *CATEGORIES[:csd_2022],
    *CATEGORIES[:csd_2023],

    *CATEGORIES[:csf],
    *CATEGORIES[:csf_2018],
    *CATEGORIES[:csf_2019],
    *CATEGORIES[:csf_2020],
    *CATEGORIES[:csf_2021],
    *CATEGORIES[:csf_2022],
    *CATEGORIES[:csf_2023],
    *CATEGORIES[:csf_international],

    *CATEGORIES[:hoc],
    *CATEGORIES[:twenty_hour],
    *ADDITIONAL_I18N_UNITS,
    *TRANSLATEABLE_CSC_UNITS,
    JIGSAW_NAME,
  ].freeze

  def self.csf_next_course_recommendation(course_name)
    # These course names without years in them should be mapped statically to their recommendation.
    static_mapping = {
      "course1" => "course2",
      "course2" => "course3",
      "course3" => "course4",
      "accelerated" => "course4",
      "course4" => "applab-intro"
    }

    return static_mapping[course_name] if static_mapping.include?(course_name)

    # For CSF courses with years in their name, separate into prefix and year. Determine the recommended
    # next prefix based on constant mapping, then add the year to the recommended prefix.
    # Example: coursea-2019 becomes prefix: coursea, year: 2019.
    # coursea maps to courseb, so return courseb-2019.
    applab_courses = %w(coursef express)
    CSF_COURSE_PATTERNS.each do |r|
      match_data = r.match(course_name)
      next unless match_data

      prefix = match_data[1]
      year = match_data[2]

      return "applab-intro" if applab_courses.include?(prefix)

      prefix_mapping = {
        "coursea" => "courseb",
        "courseb" => "coursec",
        "coursec" => "coursed",
        "coursed" => "coursee",
        "coursee" => "coursef",
        "pre-express" => "coursec"
      }

      return "#{prefix_mapping[prefix]}-#{year}" if prefix_mapping.include?(prefix)
    end

    return nil
  end

  # Checks if the unit is translatable
  #
  # @param unit_name [String] the Unit name
  # @return [true, false]
  def self.i18n?(unit_name)
    TRANSLATEABLE_UNITS.include?(unit_name)
  end
end
