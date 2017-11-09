# == Schema Information
#
# Table name: pd_applications
#
#  id                  :integer          not null, primary key
#  user_id             :integer          not null
#  type                :string(255)      not null
#  application_year    :string(255)      not null
#  application_type    :string(255)      not null
#  regional_partner_id :integer
#  status              :string(255)      not null
#  locked_at           :datetime
#  notes               :text(65535)
#  form_data           :text(65535)      not null
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#  course              :string(255)
#  response_scores     :text(65535)
#
# Indexes
#
#  index_pd_applications_on_application_type     (application_type)
#  index_pd_applications_on_application_year     (application_year)
#  index_pd_applications_on_course               (course)
#  index_pd_applications_on_regional_partner_id  (regional_partner_id)
#  index_pd_applications_on_status               (status)
#  index_pd_applications_on_type                 (type)
#  index_pd_applications_on_user_id              (user_id)
#

module Pd::Application
  class Teacher1819Application < ApplicationBase
    def set_type_and_year
      self.application_year = YEAR_18_19
      self.application_type = TEACHER_APPLICATION
    end

    validates :status, exclusion: {in: ['interview'], message: '%{value} is reserved for facilitator applications.'}

    def self.statuses
      Pd::Application::ApplicationBase.statuses.except('interview')
    end

    validates_uniqueness_of :user_id
    validates_presence_of :course
    before_validation :set_course_from_program
    def set_course_from_program
      self.course = PROGRAMS.key(program)
    end

    before_create :match_partner, if: -> {regional_partner.nil?}
    def match_partner
      self.regional_partner = RegionalPartner.find_by_region(zip_code, state_code)
    end

    PROGRAMS = {
      csd: 'Computer Science Discoveries (appropriate for 6th - 10th grade)',
      csp: 'Computer Science Principles (appropriate for 9th - 12th grade, and can be implemented as an AP or introductory course)',
    }.freeze
    PROGRAM_OPTIONS = PROGRAMS.values

    GRADES = [
      'Pre-K'.freeze,
      'Kindergarten'.freeze,
      *(1..12).map {|n| "Grade #{n}".freeze}
    ].freeze

    SUBJECTS_THIS_YEAR = [
      'Computer Science',
      'Computer Literacy',
      'Math',
      'Science',
      'History',
      'Social Studies',
      'English/Language Arts',
      'Music',
      'Art',
      'Multimedia',
      'Foreign Language',
      OTHER_PLEASE_LIST
    ]

    COURSE_HOURS_PER_YEAR = [
      'At least 100 course hours',
      '50 to 99 course hours',
      'Less than 50 course hours'
    ]

    TERMS_PER_YEAR = [
      '1 quarter',
      '1 trimester',
      '1 semester',
      '2 trimesters',
      'Full year'
    ]

    def self.options
      {
        country: [
          'United States',
          'International'
        ],

        title: COMMON_OPTIONS[:title],
        state: COMMON_OPTIONS[:state],
        gender_identity: COMMON_OPTIONS[:gender_identity],
        race: COMMON_OPTIONS[:race],
        principal_title: COMMON_OPTIONS[:title],

        current_role: [
          'Teacher',
          'Instructional Coach',
          'Librarian',
          'School administrator',
          'District administrator',
          OTHER_PLEASE_LIST
        ],

        grades_at_school: GRADES,
        grades_teaching: [
          *GRADES,
          "I'm not teaching this year (please explain):"
        ],
        grades_expect_to_teach: GRADES,

        subjects_teaching: SUBJECTS_THIS_YEAR,
        subjects_expect_to_teach: SUBJECTS_THIS_YEAR,

        subjects_licensed_to_teach: [
          'Computer Science',
          'Career and Technical Education',
          'Math',
          'Science',
          'History',
          'Social Studies',
          'English/Language Arts',
          'Music',
          'Art',
          'Multimedia',
          'Foreign Language',
          'Business',
          'Special Education',
          'Physical Education',
          'I am not currently licensed',
          OTHER_PLEASE_LIST
        ],

        taught_in_past: [
          'Hour of Code',
          'CS Fundamentals',
          'CS in Algebra',
          'CS in Science',
          'CS Discoveries',
          'CS Principles (intro or AP-level)',
          'AP CS A',
          'Beauty and Joy of Computing',
          'Code HS',
          'Edhesive',
          'Exploring Computer Science',
          'Mobile CSP',
          'NMSI',
          'Project Lead the Way',
          'Robotics',
          'ScratchEd',
          OTHER_PLEASE_LIST,
          "I don't have experience teaching any of these courses"
        ],

        cs_offered_at_school: [
          'AP CS A',
          'Beauty and Joy of Computing',
          'Bootstrap',
          'Code HS',
          'Code Monkey',
          'Codesters',
          'CS in Algebra',
          'CS Discoveries',
          'CS Fundamentals',
          'CS Principles (intro or AP-level)',
          'CS in Science',
          'Edhesive',
          'Exploring Computer Science',
          'Globaloria',
          'Hour of Code',
          'Mobile CSP',
          'NMSI',
          'Project Lead the Way',
          'Pythonroom',
          'Robotics',
          'Scalable Game Design',
          'ScratchEd',
          'Tynker',
          'UC Davis C-Stem',
          'UTeach',
          OTHER_PLEASE_LIST,
          'No computer science courses are offered at my school'
        ],

        cs_opportunities_at_school: [
          'Courses for credit',
          'After school clubs',
          'Lunch clubs',
          'Hour of Code',
          'No computer science opportunities are currently available at my school',
          OTHER_WITH_TEXT
        ],

        program: PROGRAM_OPTIONS,

        csd_which_grades: (6..12).map(&:to_s),

        csd_course_hours_per_week: [
          '5 or more course hours per week',
          '4 to less than 5 course hours per week',
          '3 to less than 4 course hours per week',
          'Less than 3 course hours per week',
          OTHER_PLEASE_LIST
        ],

        csd_course_hours_per_year: COURSE_HOURS_PER_YEAR,

        csd_terms_per_year: TERMS_PER_YEAR,

        csp_which_grades: (9..12).map(&:to_s),

        csp_course_hours_per_week: [
          'More than 5 course hours per week',
          '4 - 5 course hours per week',
          'Less than 4 course hours per week'
        ],

        csp_course_hours_per_year: COURSE_HOURS_PER_YEAR,

        csp_terms_per_year: TERMS_PER_YEAR,

        csp_how_offer: [
          'As an introductory course',
          'As an AP course',
          'We will offer both introductory and AP-level courses'
        ],

        csp_ap_exam: [
          'Yes, all students will be expected to take the AP CS Principles exam',
          "Students will be encouraged to take the exam, but it won't be required",
          "No, I don't plan for my students to take the AP CS Principles exam"
        ],

        plan_to_teach: [
          'Yes, I plan to teach this course',
          'No, someone else from my school will teach this course',
          "I don't know if I will teach this course (please explain):"
        ],

        committed: [
          YES,
          'No (please explain):'
        ],

        willing_to_travel: [
          'Less than 10 miles',
          '10 to 25 miles',
          '25 to 50 miles',
          'More than 50 miles'
        ]
      }
    end

    def program
      sanitize_form_data_hash[:program]
    end

    def zip_code
      sanitize_form_data_hash[:zip_code]
    end

    def state_name
      sanitize_form_data_hash[:state]
    end

    def state_code
      STATE_ABBR_WITH_DC_HASH.key(state_name).try(:to_s)
    end
  end
end
