module Pd
  module SharedWorkshopConstants
    COURSES = [
      COURSE_CSF = 'CS Fundamentals'.freeze,
      COURSE_CSP = 'CS Principles'.freeze,
      COURSE_ECS = 'Exploring Computer Science'.freeze,
      COURSE_CS_IN_A = 'CS in Algebra'.freeze,
      COURSE_CS_IN_S = 'CS in Science'.freeze,
      COURSE_CSD = 'CS Discoveries'.freeze,
      COURSE_COUNSELOR = 'Counselor'.freeze,
      COURSE_ADMIN = 'Admin'.freeze,
      COURSE_FACILITATOR = 'Facilitator'.freeze
    ].freeze

    STATES = [
      STATE_NOT_STARTED = 'Not Started'.freeze,
      STATE_IN_PROGRESS = 'In Progress'.freeze,
      STATE_ENDED = 'Ended'.freeze
    ].freeze

    SUBJECT_TEACHER_CON = 'Code.org TeacherCon'.freeze

    # Academic Year Workshop subjects shared between CSP and CSD.
    SUBJECT_WORKSHOP_1 = 'Academic Year Workshop 1'.freeze
    SUBJECT_WORKSHOP_2 = 'Academic Year Workshop 2'.freeze
    SUBJECT_WORKSHOP_3 = 'Academic Year Workshop 3'.freeze
    SUBJECT_WORKSHOP_4 = 'Academic Year Workshop 4'.freeze
    SUBJECT_WORKSHOP_1_2 = 'Academic Year Workshop 1 + 2'.freeze
    SUBJECT_WORKSHOP_3_4 = 'Academic Year Workshop 3 + 4'.freeze

    # Note: the original intent of this constant is to put subjects
    # in here that will be used explicitly in JS code.
    # See this PR for more detail:
    # https://github.com/code-dot-org/code-dot-org/pull/29510
    SUBJECT_NAMES = {
      SUBJECT_CSF_101: SUBJECT_CSF_101 = 'Intro'.freeze,
      SUBJECT_CSF_201: SUBJECT_CSF_201 = 'Deep Dive'.freeze,
      SUBJECT_FIT: SUBJECT_FIT = 'Code.org Facilitator Weekend'.freeze,
      SUBJECT_SUMMER_WORKSHOP: SUBJECT_SUMMER_WORKSHOP = '5-day Summer'.freeze,
      SUBJECT_VIRTUAL_KICKOFF: SUBJECT_VIRTUAL_KICKOFF = 'Virtual Workshop Kickoff'.freeze,
      SUBJECT_CSP_FOR_RETURNING_TEACHERS: SUBJECT_CSP_FOR_RETURNING_TEACHERS = 'Workshop for Returning Teachers'.freeze
    }

    SUBJECTS = {
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
      COURSE_CSP => [
        SUBJECT_CSP_SUMMER_WORKSHOP = SUBJECT_SUMMER_WORKSHOP,
        SUBJECT_CSP_VIRTUAL_KICKOFF = SUBJECT_VIRTUAL_KICKOFF,
        SUBJECT_CSP_WORKSHOP_1 = SUBJECT_WORKSHOP_1,
        SUBJECT_CSP_WORKSHOP_2 = SUBJECT_WORKSHOP_2,
        SUBJECT_CSP_WORKSHOP_3 = SUBJECT_WORKSHOP_3,
        SUBJECT_CSP_WORKSHOP_4 = SUBJECT_WORKSHOP_4,
        SUBJECT_CSP_WORKSHOP_1_2 = SUBJECT_WORKSHOP_1_2,
        SUBJECT_CSP_WORKSHOP_3_4 = SUBJECT_WORKSHOP_3_4,
        SUBJECT_CSP_TEACHER_CON = SUBJECT_TEACHER_CON,
        SUBJECT_CSP_FIT = SUBJECT_FIT,
        SUBJECT_CSP_FOR_RETURNING_TEACHERS,
      ],
      COURSE_CSD => [
        SUBJECT_CSD_SUMMER_WORKSHOP = SUBJECT_SUMMER_WORKSHOP,
        SUBJECT_CSD_VIRTUAL_KICKOFF = SUBJECT_VIRTUAL_KICKOFF,
        SUBJECT_CSD_WORKSHOP_1 = SUBJECT_WORKSHOP_1,
        SUBJECT_CSD_WORKSHOP_2 = SUBJECT_WORKSHOP_2,
        SUBJECT_CSD_WORKSHOP_3 = SUBJECT_WORKSHOP_3,
        SUBJECT_CSD_WORKSHOP_4 = SUBJECT_WORKSHOP_4,
        SUBJECT_CSD_WORKSHOP_1_2 = SUBJECT_WORKSHOP_1_2,
        SUBJECT_CSD_WORKSHOP_3_4 = SUBJECT_WORKSHOP_3_4,
        SUBJECT_CSD_TEACHER_CON = SUBJECT_TEACHER_CON,
        SUBJECT_CSD_FIT = SUBJECT_FIT,
      ],
      COURSE_CSF => [
        SUBJECT_CSF_101,
        SUBJECT_CSF_201,
        SUBJECT_CSF_FIT = SUBJECT_FIT
      ]
    }.freeze

    VIRTUAL_ONLY_SUBJECTS = [
      SUBJECT_VIRTUAL_KICKOFF
    ].freeze

    # Used in create/edit workshop UI
    MUST_SUPPRESS_EMAIL_SUBJECTS = [
      SUBJECT_VIRTUAL_KICKOFF,
      SUBJECT_WORKSHOP_1,
      SUBJECT_WORKSHOP_2,
      SUBJECT_WORKSHOP_3,
      SUBJECT_WORKSHOP_4,
      SUBJECT_WORKSHOP_1_2,
      SUBJECT_WORKSHOP_3_4
    ].freeze

    # Used to suppress post-workshop emails
    ACADEMIC_YEAR_WORKSHOP_SUBJECTS = [
      SUBJECT_VIRTUAL_KICKOFF,
      SUBJECT_WORKSHOP_1,
      SUBJECT_WORKSHOP_2,
      SUBJECT_WORKSHOP_3,
      SUBJECT_WORKSHOP_4,
      SUBJECT_WORKSHOP_1_2,
      SUBJECT_WORKSHOP_3_4
    ].freeze

    LEGACY_SUBJECTS = {
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
        LEGACY_SUBJECT_CSP_VIRTUAL_8 = 'Virtual Workshop 8'.freeze
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
        LEGACY_SUBJECT_CSD_VIRTUAL_8 = 'Virtual Workshop 8'.freeze
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

    WORKSHOP_TYPES = {
      teachercon: SUBJECT_TEACHER_CON,
      local_summer: SUBJECT_SUMMER_WORKSHOP,
      both: 'both'
    }.freeze

    COURSE_KEY_MAP = {
      COURSE_CSF => 'csf',
      COURSE_CSD => 'csd',
      COURSE_CSP => 'csp'
    }
  end
end
