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
  class Facilitator1819Application < ApplicationBase
    def set_type_and_year
      self.application_year = YEAR_18_19
      self.application_type = FACILITATOR_APPLICATION
    end

    validates_presence_of :course
    before_validation :set_course_from_program
    def set_course_from_program
      self.course = PROGRAMS.key(program)
    end

    OTHER = 'Other'.freeze
    YES = 'Yes'.freeze
    NO = 'No'.freeze
    NONE = 'None'.freeze

    PROGRAMS = {
      csf: 'CS Fundamentals (Pre-K - 5th grade)',
      csd: 'CS Discoveries (6 - 10th grade)',
      csp: 'CS Principles (9 - 12th grade)'
    }.freeze
    PROGRAM_OPTIONS = PROGRAMS.values

    ONLY_WEEKEND = 'I will only be able to attend Saturday and Sunday of the training'.freeze

    def self.options
      {
        title: %w(Mr. Mrs. Ms. Dr.),

        gender_identity: [
          'Female',
          'Male',
          OTHER,
          'Prefer not to answer'
        ],

        race: [
          'White',
          'Black or African American',
          'Hispanic or Latino',
          'Asian',
          'Native Hawaiian or other Pacific Islander',
          'American Indian/Alaska Native',
          OTHER,
          'Prefer not to say'
        ],

        institution_type: [
          'School district',
          'Non-profit',
          'Institute of higher education',
          'Tech company',
          OTHER
        ],

        worked_in_cs_job: [YES, NO],

        completed_cs_courses_and_activities: [
          'Intro CS in HS',
          'Intro CS in College',
          'Advanced CS in HS or College',
          'Online (Udacity, Coursera, etc.)',
          'Attended a coding or CS camp',
          'Attended a computer science professional development workshop',
          'I have a minor, major, certificate',
          NONE,
          OTHER
        ],

        diversity_training: [YES, NO],

        how_heard: [
          'Code.org email',
          'Code.org social media post',
          'A current Code.org facilitator (please share name)',
          'A Code.org staff member (please share name)',
          'My employer',
          OTHER
        ],

        program: PROGRAM_OPTIONS,

        plan_on_teaching: [
          YES,
          NO,
          "I don’t know yet",
          OTHER
        ],

        ability_to_meet_requirements: (1..10).map(&:to_s),

        csf_availability: [
          YES,
          NO,
          ONLY_WEEKEND
        ],

        csd_csp_teachercon_availability: [
          'TeacherCon 1: June 17 - 22, 2018',
          'TeacherCon 2: July 22 - 27, 2018',
          "I'm not available for either TeacherCon. (Please Explain)"
        ],

        csd_csp_fit_availability: [
          'June 23 - 24, 2018 (immediately following TeacherCon 1)',
          'July 28 - 29, 2018 (immediately following TeacherCon 2)',
          "I'm not available for either Facilitator-in-Training workshop. (Please Explain)"
        ],

        led_cs_extracurriculars: [
          'Hour of Code',
          'After-school or lunchtime computer science clubs',
          'Computer science-focused summer camps',
          'Other (please list)',
        ],

        teaching_experience: [YES, NO],

        grades_taught: [
          'Pre-K-2',
          '3-4',
          '5-6',
          '7-8',
          '9-10',
          '11-12',
          'Community college, college, or university',
          'Participants in a tech bootcamp or professional development program',
          'Other'
        ],

        grades_currently_teaching: [
          'K-2',
          '3-4',
          '5-6',
          '7-8',
          '9-10',
          '11-12',
          'Community college, college, or university',
          'Participants in a tech bootcamp or professional development program',
          'Other',
          'None - I don’t currently teach'
        ],

        subjects_taught: [
          'Computer Science',
          'Math',
          'Science',
          'Social Studies',
          'English/Language Arts',
          'History',
          'Art',
          'Foreign Language',
          'Other'
        ],

        years_experience: [
          '1-2 years',
          '3-5 years',
          '6+ years',
          'None'
        ],

        experience_leading: [
          'Hour of Code',
          'One or more of the CS Fundamentals (K-5) Courses',
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
          'ScratchEd',
          'Other',
          "I don't have experience teaching any of these courses",
        ],

        completed_pd: [
          'CS Fundamentals (1 day workshop)',
          'CS in Algebra (one year professional learning program)',
          'CS in Science (one year professional learning program)',
          'CS Discoveries (pilot program)',
          'CS Discoveries (one year professional learning program)',
          'CS Principles (one year professional learning program)',
          'Exploring Computer Science (one year professional learning program)',
          "I haven't completed a Code.org Professional Learning Program as a teacher"
        ],

        code_org_facilitator: [YES, NO],

        code_org_facilitator_years: [
          '2014-15 school year',
          '2015-16 school year',
          '2016-17 school year',
          '2017-18 school year'
        ],

        code_org_facilitator_programs: [
          'CS Fundamentals',
          'CS in Algebra',
          'CS in Science',
          'Summer CS Discoveries workshop',
          'School year CS Discoveries workshop',
          'Summer CS Principles workshop',
          'School year CS Principles workshops',
          'Summer Exploring Computer Science workshop',
          'School year Exploring Computer Science workshops'
        ],

        groups_led_pd: [
          'K-12 teachers',
          'Other types of adult professional development',
          'None'
        ],

        # Every hour, "7am PT / 10am ET" to "5pm PT / 8pm ET"
        weekly_availability: (7..17).map do |hour|
          "#{format_hour(hour)} PT / #{format_hour(hour + 3)} ET"
        end,

        travel_distance: [
          'Within my city',
          'Within my state',
          'Within my region (example: Pacific Northwest, Northeast, Southwest, etc.)',
          'Anywhere!'
        ]
      }
    end

    def self.required_fields
      %i(
        first_name
        last_name
        phone
        address
        city
        state
        zip_code
        gender_identity
        race
        institution_type
        current_employer
        job_title
        resume_link
        worked_in_cs_job
        completed_cs_courses_and_activities
        diversity_training
        how_heard

        program
        plan_on_teaching
        ability_to_meet_requirements

        code_org_facilitator
        groups_led_pd
        describe_prior_pd

        who_should_have_opportunity
        how_support_equity
        expected_teacher_needs
        describe_adapting_lesson_plan
        describe_strategies
        example_how_used_feedback
        example_how_provided_feedback
        hope_to_learn

        weekly_availability
        travel_distance

        additional_info
        agree
      )
    end

    def dynamic_required_fields(hash)
      [].tap do |required|
        required << :cs_related_job_requirements if hash[:worked_in_cs_job] == YES
        required << :diversity_training_description if hash[:diversity_training] == YES

        if hash[:program] == PROGRAMS[:csf]
          required << :csf_availability
          required << :csf_partial_attendance_reason if hash[:csf_availability] == ONLY_WEEKEND
        elsif hash[:program].present?
          required << :csd_csp_teachercon_availability
          required << :csd_csp_fit_availability
        end

        if hash[:teaching_experience] == YES
          required.concat [
            :grades_taught,
            :grades_currently_teaching,
            :subjects_taught,
            :years_experience
          ]
        end

        if hash[:years_experience].present? && hash[:years_experience] != NONE
          required.concat [
            :experience_leading,
            :completed_pd
          ]
        end

        if hash[:code_org_facilitator] == YES
          required.concat [
            :code_org_facilitator_years,
            :code_org_facilitator_programs
          ]
        end
      end
    end

    def program
      sanitize_form_data_hash[:program]
    end

    # Formats hour as 0-12(am|pm)
    # e.g. 7 -> 7am, 15 -> 3pm
    private_class_method def self.format_hour(hour)
      (Date.today + hour.hours).strftime("%l%P").strip
    end
  end
end
