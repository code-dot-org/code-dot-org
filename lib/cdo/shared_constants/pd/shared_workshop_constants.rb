module Pd
  module SharedWorkshopConstants
    ACTIVE_COURSES = [
      COURSE_CSF = 'CS Fundamentals'.freeze,
      COURSE_CSP = 'CS Principles'.freeze,
      COURSE_CSD = 'CS Discoveries'.freeze,
      COURSE_CSA = 'Computer Science A'.freeze,
      COURSE_FACILITATOR = 'Facilitator'.freeze,
      COURSE_ADMIN_COUNSELOR = 'Admin/Counselor Workshop'.freeze,
      COURSE_BUILD_YOUR_OWN = 'Build Your Own Workshop'.freeze,
    ].freeze

    ARCHIVED_COURSES = [
      COURSE_ECS = 'Exploring Computer Science'.freeze,
      COURSE_CS_IN_A = 'CS in Algebra'.freeze,
      COURSE_CS_IN_S = 'CS in Science'.freeze,
      COURSE_COUNSELOR = 'Counselor'.freeze,
      COURSE_ADMIN = 'Admin'.freeze
    ].freeze

    COURSES = ACTIVE_COURSES + ARCHIVED_COURSES

    STATES = [
      STATE_NOT_STARTED = 'Not Started'.freeze,
      STATE_IN_PROGRESS = 'In Progress'.freeze,
      STATE_ENDED = 'Ended'.freeze
    ].freeze

    SUBJECT_TEACHER_CON = 'Code.org TeacherCon'.freeze

    # Academic Year Workshop subjects shared between CSA, CSD, and CSP
    ACADEMIC_YEAR_SUBJECTS = [
      SUBJECT_WORKSHOP_1 = 'Academic Year Workshop 1'.freeze,
      SUBJECT_WORKSHOP_2 = 'Academic Year Workshop 2'.freeze,
      SUBJECT_WORKSHOP_3 = 'Academic Year Workshop 3'.freeze,
      SUBJECT_WORKSHOP_4 = 'Academic Year Workshop 4'.freeze,
      SUBJECT_WORKSHOP_1_2 = 'Academic Year Workshop 1 + 2'.freeze,
      SUBJECT_WORKSHOP_3_4 = 'Academic Year Workshop 3 + 4'.freeze
    ]

    # Note: the original intent of this constant is to put subjects
    # in here that will be used explicitly in JS code.
    # See this PR for more detail:
    # https://github.com/code-dot-org/code-dot-org/pull/29510
    SUBJECT_NAMES = {
      SUBJECT_CSF_101: SUBJECT_CSF_101 = 'Intro'.freeze,
      SUBJECT_CSF_201: SUBJECT_CSF_201 = 'Deep Dive'.freeze,
      SUBJECT_CSF_DISTRICT: SUBJECT_CSF_DISTRICT = 'District'.freeze,
      SUBJECT_FIT: SUBJECT_FIT = 'Code.org Facilitator Weekend'.freeze,
      SUBJECT_SUMMER_WORKSHOP: SUBJECT_SUMMER_WORKSHOP = '5-day Summer'.freeze,
      SUBJECT_VIRTUAL_KICKOFF: SUBJECT_VIRTUAL_KICKOFF = 'Virtual Workshop Kickoff'.freeze,
      SUBJECT_ADMIN_COUNSELOR_WELCOME: SUBJECT_ADMIN_COUNSELOR_WELCOME = 'Welcome'.freeze,
      SUBJECT_ADMIN_COUNSELOR_SLP_INTRO: SUBJECT_ADMIN_COUNSELOR_SLP_INTRO = 'SLP Intro'.freeze,
      SUBJECT_ADMIN_COUNSELOR_SLP_CALL1: SUBJECT_ADMIN_COUNSELOR_SLP_CALL1 = 'SLP Quarterly Call 1'.freeze,
      SUBJECT_ADMIN_COUNSELOR_SLP_CALL2: SUBJECT_ADMIN_COUNSELOR_SLP_CALL2 = 'SLP Quarterly Call 2'.freeze,
      SUBJECT_ADMIN_COUNSELOR_SLP_CALL3: SUBJECT_ADMIN_COUNSELOR_SLP_CALL3 = 'SLP Quarterly Call 3'.freeze,
      SUBJECT_ADMIN_COUNSELOR_SLP_CALL4: SUBJECT_ADMIN_COUNSELOR_SLP_CALL4 = 'SLP Quarterly Call 4'.freeze
    }

    SUBJECTS = {
      COURSE_CSP => [
        SUBJECT_CSP_SUMMER_WORKSHOP = SUBJECT_SUMMER_WORKSHOP,
        SUBJECT_CSP_WORKSHOP_1 = SUBJECT_WORKSHOP_1,
        SUBJECT_CSP_WORKSHOP_2 = SUBJECT_WORKSHOP_2,
        SUBJECT_CSP_WORKSHOP_3 = SUBJECT_WORKSHOP_3,
        SUBJECT_CSP_WORKSHOP_4 = SUBJECT_WORKSHOP_4,
        SUBJECT_CSP_WORKSHOP_1_2 = SUBJECT_WORKSHOP_1_2,
        SUBJECT_CSP_WORKSHOP_3_4 = SUBJECT_WORKSHOP_3_4
      ],
      COURSE_CSA => [
        SUBJECT_CSA_SUMMER_WORKSHOP = SUBJECT_SUMMER_WORKSHOP,
        SUBJECT_CSA_WORKSHOP_1 = SUBJECT_WORKSHOP_1,
        SUBJECT_CSA_WORKSHOP_2 = SUBJECT_WORKSHOP_2,
        SUBJECT_CSA_WORKSHOP_3 = SUBJECT_WORKSHOP_3,
        SUBJECT_CSA_WORKSHOP_4 = SUBJECT_WORKSHOP_4,
        SUBJECT_CSA_WORKSHOP_1_2 = SUBJECT_WORKSHOP_1_2,
        SUBJECT_CSA_WORKSHOP_3_4 = SUBJECT_WORKSHOP_3_4
      ],
      COURSE_CSD => [
        SUBJECT_CSD_SUMMER_WORKSHOP = SUBJECT_SUMMER_WORKSHOP,
        SUBJECT_CSD_WORKSHOP_1 = SUBJECT_WORKSHOP_1,
        SUBJECT_CSD_WORKSHOP_2 = SUBJECT_WORKSHOP_2,
        SUBJECT_CSD_WORKSHOP_3 = SUBJECT_WORKSHOP_3,
        SUBJECT_CSD_WORKSHOP_4 = SUBJECT_WORKSHOP_4,
        SUBJECT_CSD_WORKSHOP_1_2 = SUBJECT_WORKSHOP_1_2,
        SUBJECT_CSD_WORKSHOP_3_4 = SUBJECT_WORKSHOP_3_4
      ],
      COURSE_CSF => [
        SUBJECT_CSF_101,
        SUBJECT_CSF_201,
        SUBJECT_CSF_DISTRICT
      ],
      COURSE_ADMIN_COUNSELOR => [
        SUBJECT_ADMIN_COUNSELOR_WELCOME,
        SUBJECT_ADMIN_COUNSELOR_SLP_INTRO,
        SUBJECT_ADMIN_COUNSELOR_SLP_CALL1,
        SUBJECT_ADMIN_COUNSELOR_SLP_CALL2,
        SUBJECT_ADMIN_COUNSELOR_SLP_CALL3,
        SUBJECT_ADMIN_COUNSELOR_SLP_CALL4
      ]
    }.freeze

    VIRTUAL_ONLY_SUBJECTS = [
      SUBJECT_VIRTUAL_KICKOFF
    ].freeze

    CSD_CUSTOM_WORKSHOP_MODULES = [
      CS_BASICS_FOR_K5_TEACHERS = 'Computer Science Basics for K-5 Teachers'.freeze,
      CS_FUNDAMENTALS_MAKER_MICROBIT = 'CS Fundamentals Maker with micro:bit'.freeze,
      ARTIFICIAL_INTELLIGENCE_AND_MACHINE_LEARNING = 'Teaching Artificial Intelligence and Machine Learning'.freeze,
      CIRCUIT_PLAYGROUND = 'Teaching Creating Apps with Devices (Circuit Playground)'.freeze,
      MICRO_BIT = 'Teaching Creating Apps with Devices (micro:bit)'.freeze,
      TEACHING_CS_CONNECTIONS = 'Teaching CS Connections'.freeze,
      TEACHING_DATA_AND_SOCIETY = 'Teaching Data and Society'.freeze,
      TEACHING_DESIGN_PROCESS = 'Teaching Design Process'.freeze,
      INTERACTIVE_ANIMATIONS_AND_GAMES = 'Teaching Interactive Animations and Games'.freeze,
      PROBLEM_SOLVING_AND_COMPUTING = 'Teaching Problem Solving and Computing'.freeze,
      WEB_DEVELOPMENT = 'Teaching Web Development'.freeze,
    ].freeze

    NOT_FUNDED_SUBJECTS = [
      SUBJECT_ADMIN_COUNSELOR_WELCOME,
      SUBJECT_ADMIN_COUNSELOR_SLP_INTRO,
      SUBJECT_ADMIN_COUNSELOR_SLP_CALL1,
      SUBJECT_ADMIN_COUNSELOR_SLP_CALL2,
      SUBJECT_ADMIN_COUNSELOR_SLP_CALL3,
      SUBJECT_ADMIN_COUNSELOR_SLP_CALL4
    ].freeze

    HIDE_FEE_INFORMATION_SUBJECTS = [
      SUBJECT_CSF_DISTRICT
    ].freeze

    HIDE_ON_WORKSHOP_MAP_SUBJECTS = [
      SUBJECT_CSF_DISTRICT
    ].freeze

    HIDE_FUNDED_SUBJECTS = [
      SUBJECT_CSF_DISTRICT
    ].freeze

    ACADEMIC_YEAR_WORKSHOP_SUBJECTS = [
      SUBJECT_VIRTUAL_KICKOFF,
      SUBJECT_WORKSHOP_1,
      SUBJECT_WORKSHOP_2,
      SUBJECT_WORKSHOP_3,
      SUBJECT_WORKSHOP_4,
      SUBJECT_WORKSHOP_1_2,
      SUBJECT_WORKSHOP_3_4
    ].freeze

    # Used to suppress post-workshop emails and in create/edit workshop UI
    MUST_SUPPRESS_EMAIL_SUBJECTS = [
      SUBJECT_ADMIN_COUNSELOR_WELCOME,
      SUBJECT_ADMIN_COUNSELOR_SLP_INTRO,
      SUBJECT_ADMIN_COUNSELOR_SLP_CALL1,
      SUBJECT_ADMIN_COUNSELOR_SLP_CALL2,
      SUBJECT_ADMIN_COUNSELOR_SLP_CALL3,
      SUBJECT_ADMIN_COUNSELOR_SLP_CALL4
    ].freeze

    LEGACY_SUBJECTS = {
      COURSE_ECS => [
        SUBJECT_ECS_PHASE_2 = 'Phase 2 in-person'.freeze,
        SUBJECT_ECS_UNIT_3 = 'Unit 3 - HTML'.freeze,
        SUBJECT_ECS_UNIT_4 = 'Unit 4 - Scratch'.freeze,
        SUBJECT_ECS_UNIT_5 = 'Unit 5 - Data'.freeze,
        SUBJECT_ECS_UNIT_6 = 'Unit 6 - Robotics'.freeze,
        SUBJECT_ECS_PHASE_4 = 'Phase 4: Summer wrap-up'.freeze
      ],
      COURSE_CS_IN_A => [
        SUBJECT_CS_IN_A_PHASE_2 = 'Phase 2 in-person'.freeze,
        SUBJECT_CS_IN_A_PHASE_3 = 'Phase 3: Academic Year Development'.freeze
      ],
      COURSE_CS_IN_S => [
        SUBJECT_CS_IN_S_PHASE_2 = 'Phase 2: Blended Summer Study'.freeze,
        SUBJECT_CS_IN_S_PHASE_3_SEMESTER_1 = 'Phase 3 - Semester 1'.freeze,
        SUBJECT_CS_IN_S_PHASE_3_SEMESTER_2 = 'Phase 3 - Semester 2'.freeze
      ],
      COURSE_CSF => [
        SUBJECT_CSF_FIT = SUBJECT_FIT
      ],
      COURSE_CSA => [
        SUBJECT_CSA_CAPSTONE = 'Capstone'.freeze,
        SUBJECT_CSA_FIT = SUBJECT_FIT,
        SUBJECT_CSA_VIRTUAL_KICKOFF = SUBJECT_VIRTUAL_KICKOFF
      ],
      COURSE_CSP => [
        LEGACY_SUBJECT_CSP_WORKSHOP_1_1920 = 'Workshop 1: Unit 3'.freeze,
        LEGACY_SUBJECT_CSP_WORKSHOP_2_1920 = 'Workshop 2: Unit 4 and Explore Task'.freeze,
        LEGACY_SUBJECT_CSP_WORKSHOP_3_1920 = 'Workshop 3: Unit 5 and Create Task'.freeze,
        LEGACY_SUBJECT_CSP_WORKSHOP_4_1920 = 'Workshop 4: Unit 5 and Multiple Choice Exam'.freeze,
        LEGACY_SUBJECT_CSP_WORKSHOP_5_1920 = '2-day, Workshops 1+2: Units 3-4 and Explore Task'.freeze,
        LEGACY_SUBJECT_CSP_WORKSHOP_6_1920 = '2-day, Workshops 3+4: Unit 5, Create Task, and Multiple Choice Exam'.freeze,

        LEGACY_SUBJECT_CSP_WORKSHOP_1 = '1-day Academic Year, Units 1 and 2'.freeze,
        LEGACY_SUBJECT_CSP_WORKSHOP_2 = '1-day Academic Year, Unit 3'.freeze,
        LEGACY_SUBJECT_CSP_WORKSHOP_3 = '1-day Academic Year, Unit 4 + Explore Prep'.freeze,
        LEGACY_SUBJECT_CSP_WORKSHOP_4 = '1-day Academic Year, Unit 5 + Create Prep'.freeze,
        LEGACY_SUBJECT_CSP_WORKSHOP_5 = '2-day Academic Year, Units 1 to 3'.freeze,
        LEGACY_SUBJECT_CSP_WORKSHOP_6 = '2-day Academic Year, Units 4 and 5 + AP Prep'.freeze,

        LEGACY_SUBJECT_CSP_VIRTUAL_1 = 'Virtual Workshop 1'.freeze,
        LEGACY_SUBJECT_CSP_VIRTUAL_2 = 'Virtual Workshop 2'.freeze,
        LEGACY_SUBJECT_CSP_VIRTUAL_3 = 'Virtual Workshop 3'.freeze,
        LEGACY_SUBJECT_CSP_VIRTUAL_4 = 'Virtual Workshop 4'.freeze,
        LEGACY_SUBJECT_CSP_VIRTUAL_5 = 'Virtual Workshop 5'.freeze,
        LEGACY_SUBJECT_CSP_VIRTUAL_6 = 'Virtual Workshop 6'.freeze,
        LEGACY_SUBJECT_CSP_VIRTUAL_7 = 'Virtual Workshop 7'.freeze,
        LEGACY_SUBJECT_CSP_VIRTUAL_8 = 'Virtual Workshop 8'.freeze,

        SUBJECT_CSP_FOR_RETURNING_TEACHERS = 'Workshop for Returning Teachers'.freeze,
        SUBJECT_CSP_FIT = SUBJECT_FIT,
        SUBJECT_CSP_TEACHER_CON = SUBJECT_TEACHER_CON,
        SUBJECT_CSP_VIRTUAL_KICKOFF = SUBJECT_VIRTUAL_KICKOFF
      ],
      COURSE_CSD => [
        LEGACY_SUBJECT_CSD_WORKSHOP_1_1920 = 'Workshop 1: Unit 3'.freeze,
        LEGACY_SUBJECT_CSD_WORKSHOP_2_1920 = 'Workshop 2: Unit 4'.freeze,
        LEGACY_SUBJECT_CSD_WORKSHOP_3_1920 = 'Workshop 3: Unit 5'.freeze,
        LEGACY_SUBJECT_CSD_WORKSHOP_4_1920 = 'Workshop 4: Unit 6'.freeze,
        LEGACY_SUBJECT_CSD_WORKSHOP_5_1920 = '2-day, Workshops 1+2: Units 3 and 4'.freeze,
        LEGACY_SUBJECT_CSD_WORKSHOP_6_1920 = '2-day, Workshops 3+4: Units 5 and 6'.freeze,

        LEGACY_SUBJECT_CSD_UNITS_2_3 = '1-day Academic Year, Units 1 and 2'.freeze,
        LEGACY_SUBJECT_CSD_UNIT_3_4 = '1-day Academic Year, Unit 3'.freeze,
        LEGACY_SUBJECT_CSD_UNITS_4_5 = '1-day Academic Year, Units 4 and 5'.freeze,
        LEGACY_SUBJECT_CSD_UNIT_6 = '1-day Academic Year, Unit 6'.freeze,
        LEGACY_SUBJECT_CSD_UNITS_1_3 = '2-day Academic Year, Units 1 to 3'.freeze,
        LEGACY_SUBJECT_CSD_UNITS_4_6 = '2-day Academic Year, Units 4 to 6'.freeze,

        LEGACY_SUBJECT_CSD_VIRTUAL_1 = 'Virtual Workshop 1'.freeze,
        LEGACY_SUBJECT_CSD_VIRTUAL_2 = 'Virtual Workshop 2'.freeze,
        LEGACY_SUBJECT_CSD_VIRTUAL_3 = 'Virtual Workshop 3'.freeze,
        LEGACY_SUBJECT_CSD_VIRTUAL_4 = 'Virtual Workshop 4'.freeze,
        LEGACY_SUBJECT_CSD_VIRTUAL_5 = 'Virtual Workshop 5'.freeze,
        LEGACY_SUBJECT_CSD_VIRTUAL_6 = 'Virtual Workshop 6'.freeze,
        LEGACY_SUBJECT_CSD_VIRTUAL_7 = 'Virtual Workshop 7'.freeze,
        LEGACY_SUBJECT_CSD_VIRTUAL_8 = 'Virtual Workshop 8'.freeze,

        SUBJECT_CUSTOM_WORKSHOP = 'Custom Workshop'.freeze,
        SUBJECT_CSD_FIT = SUBJECT_FIT,
        SUBJECT_CSD_TEACHER_CON = SUBJECT_TEACHER_CON,
        SUBJECT_CSD_VIRTUAL_KICKOFF = SUBJECT_VIRTUAL_KICKOFF
      ]
    }.freeze

    WORKSHOP_APPLICATION_STATES = {
      now_closed: "now_closed",
      currently_open: "currently_open",
      opening_at: "opening_at",
      opening_sometime: "opening_sometime"
    }.freeze

    WORKSHOP_SEARCH_ERRORS = {
      no_partner: "no_partner",
      no_state: "no_state",
      unknown: "unknown"
    }.freeze

    ACTIVE_COURSE_WORKSHOPS = {
      CSD: COURSE_CSD,
      CSP: COURSE_CSP,
      CSA: COURSE_CSA
    }.freeze

    ACTIVE_COURSES_WITH_SURVEYS = [
      COURSE_CSD,
      COURSE_CSP,
      COURSE_CSA,
      COURSE_CSF
    ].freeze

    WORKSHOP_TYPES = {
      teachercon: SUBJECT_TEACHER_CON,
      local_summer: SUBJECT_SUMMER_WORKSHOP,
      both: 'both'
    }.freeze

    COURSE_KEY_MAP = {
      COURSE_CSF => 'csf',
      COURSE_CSD => 'csd',
      COURSE_CSP => 'csp',
      COURSE_CSA => 'csa'
    }

    OFFERED_PROGRAMS = [
      'CSD',
      'CSP',
      'CSA'
    ]
  end
end
