# == Schema Information
#
# Table name: pd_applications
#
#  id                          :integer          not null, primary key
#  user_id                     :integer
#  type                        :string(255)      not null
#  application_year            :string(255)      not null
#  application_type            :string(255)      not null
#  regional_partner_id         :integer
#  status                      :string(255)
#  locked_at                   :datetime
#  notes                       :text(65535)
#  form_data                   :text(65535)      not null
#  created_at                  :datetime         not null
#  updated_at                  :datetime         not null
#  course                      :string(255)
#  response_scores             :text(65535)
#  application_guid            :string(255)
#  accepted_at                 :datetime
#  properties                  :text(65535)
#  deleted_at                  :datetime
#  status_timestamp_change_log :text(65535)
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
  class PrincipalApproval1819Application < PrincipalApprovalApplicationBase
    include Pd::PrincipalApproval1819ApplicationConstants

    REPLACE_COURSE_NO = "No, this course will be added to the schedule, but it won't replace an existing computer science course"

    belongs_to :teacher_application, class_name: 'Pd::Application::Teacher1819Application',
               primary_key: :application_guid, foreign_key: :application_guid

    validates_presence_of :teacher_application

    # @override
    def year
      YEAR_18_19
    end

    def self.create_placeholder_and_send_mail(teacher_application)
      ::Pd::Application::TeacherApplicationMailer.principal_approval(teacher_application).deliver_now

      Pd::Application::PrincipalApproval1819Application.create(
        form_data: {}.to_json,
        application_guid: teacher_application.application_guid
      )
    end

    # @override
    def check_idempotency
      existing_application = Pd::Application::PrincipalApproval1819Application.find_by(application_guid: application_guid)

      (!existing_application || existing_application.placeholder?) ? nil : existing_application
    end

    def self.options
      {
        title: COMMON_OPTIONS[:title],
        school_state: COMMON_OPTIONS[:state],
        school_type: COMMON_OPTIONS[:school_type],
        do_you_approve: [YES, NO, TEXT_FIELDS[:other_with_text]],
        committed_to_master_schedule: [YES, NO, TEXT_FIELDS[:other_with_text]],
        hours_per_year: COMMON_OPTIONS[:course_hours_per_year],
        terms_per_year: COMMON_OPTIONS[:terms_per_year],
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
          'Yes, my school or my teacher will be able to pay the full summer workshop program fee.',
          'No, my school or my teacher will not be able to pay the summer workshop program fee.',
          'Not applicable: there is no fee for the summer workshop for teachers in my region.'
        ]
      }
    end

    def dynamic_required_fields(hash)
      [].tap do |required|
        unless hash.empty?
          required.concat [
            :first_name,
            :last_name,
            :email,
            :do_you_approve,
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
              :committed_to_master_schedule,
              :hours_per_year,
              :terms_per_year,
              :replace_course,
              :committed_to_diversity,
              :understand_fee,
              :pay_fee
            ]

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
        [:replace_course, TEXT_FIELDS[:dont_know_explain], :replace_course_other],
        [:committed_to_diversity, TEXT_FIELDS[:other_please_explain], :committed_to_diversity_other],
        [:replace_which_course_csd, TEXT_FIELDS[:other_please_explain], :replace_which_course_csd_other],
        [:replace_which_course_csp, TEXT_FIELDS[:other_please_explain], :replace_which_course_csp_other],
        [:do_you_approve]
      ]
    end
  end
end
