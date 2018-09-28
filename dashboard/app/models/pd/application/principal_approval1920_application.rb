# == Schema Information
#
# Table name: pd_applications
#
#  id                                  :integer          not null, primary key
#  user_id                             :integer
#  type                                :string(255)      not null
#  application_year                    :string(255)      not null
#  application_type                    :string(255)      not null
#  regional_partner_id                 :integer
#  status                              :string(255)
#  locked_at                           :datetime
#  notes                               :text(65535)
#  form_data                           :text(65535)      not null
#  created_at                          :datetime         not null
#  updated_at                          :datetime         not null
#  course                              :string(255)
#  response_scores                     :text(65535)
#  application_guid                    :string(255)
#  decision_notification_email_sent_at :datetime
#  accepted_at                         :datetime
#  properties                          :text(65535)
#  deleted_at                          :datetime
#
# Indexes
#
#  index_pd_applications_on_application_guid     (application_guid)
#  index_pd_applications_on_application_type     (application_type)
#  index_pd_applications_on_application_year     (application_year)
#  index_pd_applications_on_course               (course)
#  index_pd_applications_on_regional_partner_id  (regional_partner_id)
#  index_pd_applications_on_status               (status)
#  index_pd_applications_on_type                 (type)
#  index_pd_applications_on_user_id              (user_id)
#

module Pd::Application
  class PrincipalApproval1920Application < PrincipalApprovalApplicationBase
    include Pd::PrincipalApproval1920ApplicationConstants

    # @override
    def year
      YEAR_19_20
    end

    validates_presence_of :teacher_application
    belongs_to :teacher_application, class_name: 'Pd::Application::Teacher1920Application',
      primary_key: :application_guid, foreign_key: :application_guid

    def self.create_placeholder_and_send_mail(teacher_application)
      teacher_application.queue_email :principal_approval, deliver_now: true

      Pd::Application::PrincipalApproval1920Application.create(
        form_data: {}.to_json,
        application_guid: teacher_application.application_guid
      )
    end

    # @override
    def check_idempotency
      existing_application = Pd::Application::PrincipalApproval1920Application.find_by(application_guid: application_guid)

      (!existing_application || existing_application.placeholder?) ? nil : existing_application
    end

    REPLACE_COURSE_NO = "No, this course will be added to the schedule, but it won't replace an existing computer science course"
    def self.options
      {
        title: COMMON_OPTIONS[:title],
        school_state: COMMON_OPTIONS[:state],
        school_type: COMMON_OPTIONS[:school_type],
        do_you_approve: [YES, NO, TEXT_FIELDS[:other_with_text]],
        going_to_teach: [YES, NO, TEXT_FIELDS[:other_with_text]],
        csd_implementation: [
          '50+ instructional hours per section of students for a semester-long course (Units 1 - 3)',
          '100+ instructional hours for a year-long course (Units 1-  6)',
          'I don’t know yet which implementation schedule we will use.',
          'We will use a different implementation schedule. (Please Explain):'

        ],
        csp_implementation: [
          '100+ instructional hours for a year-long course',
          '100+ instructional hours for a one semester (block schedule) course',
          'I don’t know yet which implementation schedule we will use.',
          'We will use a different implementation schedule. (Please Explain):'
        ],
        committed_to_master_schedule: [YES, NO, TEXT_FIELDS[:other_with_text]],
        replace_course: [
          YES,
          REPLACE_COURSE_NO,
          TEXT_FIELDS[:dont_know_explain]
        ],
        replace_which_course_csp: [
          'Beauty and Joy of Computing',
          'CodeHS',
          'Computer Applications (ex: using Microsoft programs)',
          'CS50',
          'Exploring Computer Science',
          'Intro to Computer Science',
          'Intro to Programming',
          'Mobile CSP',
          'Project Lead the Way - Computer Science',
          'UTeach CSP',
          'Web Development',
          'We’ve created our own course',
          TEXT_FIELDS[:other_please_explain]
        ],
        replace_which_course_csd: [
          'CodeHS',
          'Codesters',
          'Computer Applications (ex: using Microsoft programs)',
          'CS Fundamentals',
          'Exploring Computer Science',
          'Globaloria',
          'My CS',
          'Project Lead the Way - Computer Science',
          'Robotics',
          'ScratchEd',
          'Typing',
          'We’ve created our own course',
          TEXT_FIELDS[:other_please_explain]
        ],
        committed_to_diversity: [YES, NO, TEXT_FIELDS[:other_please_explain]],
        pay_fee: [
          'Yes, my school or teacher will be able to pay the full program fee.',
          'No, my school or teacher will not be able to pay the program fee. We would like to be considered for a full or partial scholarship.',
          'Not applicable: there is no fee for the progam for teachers in my region.'
        ],
        how_heard: [
          'From a teacher',
          'Code.org Website',
          'Code.org Email',
          'Regional Partner website',
          'Regional Partner Email',
          'Regional Partner Event/Workshop',
          TEXT_FIELDS[:other_with_text]
        ]
      }
    end

    def dynamic_required_fields(hash)
      [].tap do |required|
        if hash[:do_you_approve]
          required.concat [
            :first_name,
            :last_name,
            :email,
            :confirm_principal
          ]

          unless hash[:do_you_approve] == NO
            required.concat [
              :total_student_enrollment,
              :free_lunch_percent,
              :white,
              :black,
              :hispanic,
              :asian,
              :pacific_islander,
              :american_indian,
              :other,
              :going_to_teach,
              :committed_to_master_schedule,
              :replace_course,
              :committed_to_diversity,
              :understand_fee,
              :pay_fee,
              :how_heard
            ]

            if course == 'csd'
              required << :csd_implementation
            elsif course == 'csp'
              required << :csp_implementation
            end

            if hash[:replace_course] == YES
              if course == 'csd'
                required << :replace_which_course_csd
              elsif course == 'csp'
                required << :replace_which_course_csp
              end
            end
          end
        end
      end
    end

    def additional_text_fields
      [
        [:committed_to_master_schedule],
        [:csd_implementation],
        [:csp_implementation],
        [:replace_course, TEXT_FIELDS[:dont_know_explain], :replace_course_other],
        [:committed_to_diversity, TEXT_FIELDS[:other_please_explain], :committed_to_diversity_other],
        [:replace_which_course_csd, TEXT_FIELDS[:other_please_explain], :replace_which_course_csd_other],
        [:replace_which_course_csp, TEXT_FIELDS[:other_please_explain], :replace_which_course_csp_other],
        [:do_you_approve],
        [:going_to_teach],
        [:how_heard]
      ]
    end
  end
end
