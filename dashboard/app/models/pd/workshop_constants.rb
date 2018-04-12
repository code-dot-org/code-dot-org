require_dependency 'cdo/shared_constants/pd/shared_workshop_constants'

module Pd
  module WorkshopConstants
    include SharedWorkshopConstants

    COURSE_NAMES_MAP = {
      COURSE_CSF => 'CS Fundamentals',
      COURSE_CSP => 'CS Principles',
      COURSE_ECS => 'Exploring Computer Science',
      COURSE_CS_IN_A => 'CS in Algebra',
      COURSE_CS_IN_S => 'CS in Science',
      COURSE_CSD => 'CS Discoveries',
      COURSE_COUNSELOR => 'Counselor',
      COURSE_ADMIN => 'Administrator'
    }.freeze

    COURSE_URLS_MAP = {
      COURSE_CSF => CDO.code_org_url('/educate/curriculum/elementary-school'),
      COURSE_CSP => CDO.code_org_url('/educate/csp'),
      COURSE_CSD => CDO.code_org_url('/educate/csd'),
      COURSE_CS_IN_S => CDO.code_org_url('/curriculum/science'),
      COURSE_CS_IN_A => CDO.code_org_url('/educate/algebra'),
      COURSE_ECS => 'http://www.exploringcs.org/'
    }.freeze

    # Section types by course
    SECTION_TYPE_MAP = {
      COURSE_CSF => 'csf_workshop',
      COURSE_CSP => 'csp_workshop',
      COURSE_ECS => 'ecs_workshop',
      COURSE_CS_IN_A => 'csina_workshop',
      COURSE_CS_IN_S => 'csins_workshop',
      COURSE_CSD => 'csd_workshop',
      COURSE_COUNSELOR => 'counselor_workshop',
      COURSE_ADMIN => 'admin_workshop'
    }.freeze
    SECTION_TYPES = SECTION_TYPE_MAP.values.freeze

    # Time constrains for payment, per subject.
    # Each subject has the following constraints:
    # min_days: the minimum # of days a teacher must attend in order to be counted at all.
    # max_days: the maximum # of days the workshop can be recognized for.
    # max_hours: the maximum # of hours the workshop can be recognized for.
    TIME_CONSTRAINTS = {
      COURSE_ECS => {
        SUBJECT_ECS_PHASE_2 => {min_days: 3, max_days: 5, max_hours: 30},
        SUBJECT_ECS_UNIT_3 => {min_days: 1, max_days: 1, max_hours: 6},
        SUBJECT_ECS_UNIT_4 => {min_days: 1, max_days: 1, max_hours: 6},
        SUBJECT_ECS_UNIT_5 => {min_days: 1, max_days: 1, max_hours: 6},
        SUBJECT_ECS_UNIT_6 => {min_days: 1, max_days: 1, max_hours: 6},
        SUBJECT_ECS_PHASE_4 => {min_days: 2, max_days: 3, max_hours: 18}
      },
      COURSE_CS_IN_A => {
        SUBJECT_CS_IN_A_PHASE_2 => {min_days: 2, max_days: 3, max_hours: 18},
        SUBJECT_CS_IN_A_PHASE_3 => {min_days: 1, max_days: 1, max_hours: 7}
      },
      COURSE_CS_IN_S => {
        SUBJECT_CS_IN_S_PHASE_2 => {min_days: 2, max_days: 3, max_hours: 18},
        SUBJECT_CS_IN_S_PHASE_3_SEMESTER_1 => {min_days: 1, max_days: 1, max_hours: 7},
        SUBJECT_CS_IN_S_PHASE_3_SEMESTER_2 => {min_days: 1, max_days: 1, max_hours: 7}
      },
      COURSE_CSP => {
        SUBJECT_CSP_SUMMER_WORKSHOP => {max_hours: 33.5},
        SUBJECT_CSP_WORKSHOP_1 => {min_days: 1, max_days: 1, max_hours: 6},
        SUBJECT_CSP_WORKSHOP_2 => {min_days: 1, max_days: 1, max_hours: 6},
        SUBJECT_CSP_WORKSHOP_3 => {min_days: 1, max_days: 1, max_hours: 6},
        SUBJECT_CSP_WORKSHOP_4 => {min_days: 1, max_days: 1, max_hours: 6},
        SUBJECT_CSP_TEACHER_CON => {max_hours: 33.5}
      },
      COURSE_CSD => {
        SUBJECT_CSD_TEACHER_CON => {max_hours: 33.5}
      }
    }.freeze

    FUNDING_TYPES = [
      FUNDING_TYPE_FACILITATOR = 'facilitator',
      FUNDING_TYPE_PARTNER = 'partner'
    ]

    WORKSHOP_COURSE_ONLINE_LEARNING_MAPPING = {
      COURSE_CSP => 'CSP Support',
      COURSE_ECS => 'ECS Support',
      COURSE_CS_IN_A => 'CS in Algebra Support',
      COURSE_CS_IN_S => 'CS in Science Support'
    }.freeze

    # Pre-survey data, arranged by course, consisting of:
    #  - course_name : the name of the Course object associated with that workshop.
    # Only courses with a pre-survey will have an entry here
    PRE_SURVEY_BY_COURSE = {
      COURSE_CSD => {course_name: 'csd'},
      COURSE_CSP => {course_name: 'csp'}
    }.freeze
  end
end
