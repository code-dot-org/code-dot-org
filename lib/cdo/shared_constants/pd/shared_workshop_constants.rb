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
    SUBJECT_NAMES = {
      SUBJECT_CSF_101: SUBJECT_CSF_101 = 'Intro'.freeze,
      SUBJECT_CSF_201: SUBJECT_CSF_201 = 'Deep Dive'.freeze,
      SUBJECT_FIT: SUBJECT_FIT = 'Code.org Facilitator Weekend'.freeze,
      SUBJECT_SUMMER_WORKSHOP: SUBJECT_SUMMER_WORKSHOP = '5-day Summer'.freeze,
      SUBJECT_VIRTUAL_1: SUBJECT_VIRTUAL_1 = 'Virtual Workshop 1'.freeze,
      SUBJECT_VIRTUAL_2: SUBJECT_VIRTUAL_2 = 'Virtual Workshop 2'.freeze,
      SUBJECT_VIRTUAL_3: SUBJECT_VIRTUAL_3 = 'Virtual Workshop 3'.freeze,
      SUBJECT_VIRTUAL_4: SUBJECT_VIRTUAL_4 = 'Virtual Workshop 4'.freeze,
      SUBJECT_VIRTUAL_5: SUBJECT_VIRTUAL_5 = 'Virtual Workshop 5'.freeze,
      SUBJECT_VIRTUAL_6: SUBJECT_VIRTUAL_6 = 'Virtual Workshop 6'.freeze,
      SUBJECT_VIRTUAL_7: SUBJECT_VIRTUAL_7 = 'Virtual Workshop 7'.freeze,
      SUBJECT_VIRTUAL_8: SUBJECT_VIRTUAL_8 = 'Virtual Workshop 8'.freeze
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
        SUBJECT_CSP_WORKSHOP_1 = 'Workshop 1: Unit 3'.freeze,
        SUBJECT_CSP_WORKSHOP_2 = 'Workshop 2: Unit 4 and Explore Task'.freeze,
        SUBJECT_CSP_WORKSHOP_3 = 'Workshop 3: Unit 5 and Create Task'.freeze,
        SUBJECT_CSP_WORKSHOP_4 = 'Workshop 4: Unit 5 and Multiple Choice Exam'.freeze,
        SUBJECT_CSP_WORKSHOP_5 = '2-day, Workshops 1+2: Units 3-4 and Explore Task'.freeze,
        SUBJECT_CSP_WORKSHOP_6 = '2-day, Workshops 3+4: Unit 5, Create Task, and Multiple Choice Exam'.freeze,
        SUBJECT_CSP_TEACHER_CON = SUBJECT_TEACHER_CON,
        SUBJECT_CSP_FIT = SUBJECT_FIT,
        SUBJECT_CSP_VIRTUAL_1 = SUBJECT_VIRTUAL_1,
        SUBJECT_CSP_VIRTUAL_2 = SUBJECT_VIRTUAL_2,
        SUBJECT_CSP_VIRTUAL_3 = SUBJECT_VIRTUAL_3,
        SUBJECT_CSP_VIRTUAL_4 = SUBJECT_VIRTUAL_4,
        SUBJECT_CSP_VIRTUAL_5 = SUBJECT_VIRTUAL_5,
        SUBJECT_CSP_VIRTUAL_6 = SUBJECT_VIRTUAL_6,
        SUBJECT_CSP_VIRTUAL_7 = SUBJECT_VIRTUAL_7,
        SUBJECT_CSP_VIRTUAL_8 = SUBJECT_VIRTUAL_8
      ],
      COURSE_CSD => [
        SUBJECT_CSD_SUMMER_WORKSHOP = SUBJECT_SUMMER_WORKSHOP,
        SUBJECT_CSD_WORKSHOP_1 = 'Workshop 1: Unit 3'.freeze,
        SUBJECT_CSD_WORKSHOP_2 = 'Workshop 2: Unit 4'.freeze,
        SUBJECT_CSD_WORKSHOP_3 = 'Workshop 3: Unit 5'.freeze,
        SUBJECT_CSD_WORKSHOP_4 = 'Workshop 4: Unit 6'.freeze,
        SUBJECT_CSD_WORKSHOP_5 = '2-day, Workshops 1+2: Units 3 and 4'.freeze,
        SUBJECT_CSD_WORKSHOP_6 = '2-day, Workshops 3+4: Units 5 and 6'.freeze,
        SUBJECT_CSD_TEACHER_CON = SUBJECT_TEACHER_CON,
        SUBJECT_CSD_FIT = SUBJECT_FIT,
        SUBJECT_CSD_VIRTUAL_1 = SUBJECT_VIRTUAL_1,
        SUBJECT_CSD_VIRTUAL_2 = SUBJECT_VIRTUAL_2,
        SUBJECT_CSD_VIRTUAL_3 = SUBJECT_VIRTUAL_3,
        SUBJECT_CSD_VIRTUAL_4 = SUBJECT_VIRTUAL_4,
        SUBJECT_CSD_VIRTUAL_5 = SUBJECT_VIRTUAL_5,
        SUBJECT_CSD_VIRTUAL_6 = SUBJECT_VIRTUAL_6,
        SUBJECT_CSD_VIRTUAL_7 = SUBJECT_VIRTUAL_7,
        SUBJECT_CSD_VIRTUAL_8 = SUBJECT_VIRTUAL_8
      ],
      COURSE_CSF => [
        SUBJECT_CSF_101,
        SUBJECT_CSF_201,
        SUBJECT_CSF_FIT = SUBJECT_FIT
      ]
    }.freeze

    LEGACY_SUBJECTS = {
      COURSE_CSP => [
        LEGACY_SUBJECT_CSP_WORKSHOP_1 = '1-day Academic Year, Units 1 and 2'.freeze,
        LEGACY_SUBJECT_CSP_WORKSHOP_2 = '1-day Academic Year, Unit 3'.freeze,
        LEGACY_SUBJECT_CSP_WORKSHOP_3 = '1-day Academic Year, Unit 4 + Explore Prep'.freeze,
        LEGACY_SUBJECT_CSP_WORKSHOP_4 = '1-day Academic Year, Unit 5 + Create Prep'.freeze,
        LEGACY_SUBJECT_CSP_WORKSHOP_5 = '2-day Academic Year, Units 1 to 3'.freeze,
        LEGACY_SUBJECT_CSP_WORKSHOP_6 = '2-day Academic Year, Units 4 and 5 + AP Prep'.freeze,
      ],
      COURSE_CSD => [
        LEGACY_SUBJECT_CSD_UNITS_2_3 = '1-day Academic Year, Units 1 and 2'.freeze,
        LEGACY_SUBJECT_CSD_UNIT_3_4 = '1-day Academic Year, Unit 3'.freeze,
        LEGACY_SUBJECT_CSD_UNITS_4_5 = '1-day Academic Year, Units 4 and 5'.freeze,
        LEGACY_SUBJECT_CSD_UNIT_6 = '1-day Academic Year, Unit 6'.freeze,
        LEGACY_SUBJECT_CSD_UNITS_1_3 = '2-day Academic Year, Units 1 to 3'.freeze,
        LEGACY_SUBJECT_CSD_UNITS_4_6 = '2-day Academic Year, Units 4 to 6'.freeze,
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
  end
end
