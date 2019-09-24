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
  class PrincipalApproval2021Application < PrincipalApprovalApplicationBase
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

    def self.options
      {
        title: COMMON_OPTIONS[:title],
        school_state: COMMON_OPTIONS[:state],
        school_type: COMMON_OPTIONS[:school_type],
        do_you_approve: [YES, NO, TEXT_FIELDS[:other_with_text]],
        plan_to_teach: [
          'Yes, they are planning to teach this course this year (2019-20)',
          'I hope they will be able teach this course this year (2019-20)',
          'No, they are not planning to teach this course this year (2019-20), but they hope to teach this course the following year (2020-21)',
          'No, someone else from my school will teach this course this year (2019-20)',
          'I don’t know if they will teach this course (Please Explain):'
        ],
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
        committed_to_master_schedule: [
          'Yes, I plan to include this course in the 2019-20 master schedule',
          'I hope to include this course in the 2019-20 master schedule',
          'No, I do not plan to include this course in the 2019-20 master schedule but hope to the following year (2020-21)',
          'I don’t know if I will be able to include this course in the 2019-20 master schedule',
          TEXT_FIELDS[:other_with_text]
        ],
        replace_course: [
          TEXT_FIELDS[:yes_replace_existing_course],
          'No, it will not replace an existing computer science course',
          'No, this course will not be added to the schedule',
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
          'Yes, my school will be able to pay the full program fee.',
          'No, my school will not be able to pay the program fee. We would like to be considered for a scholarship.',
          'Not applicable: there is no fee for the program for teachers in my region.',
          'Not applicable: there is no Regional Partner in my region.'
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
              :plan_to_teach,
              :committed_to_master_schedule,
              :replace_course,
              :committed_to_diversity,
              :understand_fee,
              :pay_fee
            ]

            if teacher_application&.course == 'csd'
              required << :csd_implementation
            elsif teacher_application&.course == 'csp'
              required << :csp_implementation
            end

            if hash[:replace_course] == TEXT_FIELDS[:yes_replace_existing_course]
              if teacher_application&.course == 'csd'
                required << :replace_which_course_csd
              elsif teacher_application&.course == 'csp'
                required << :replace_which_course_csp
              end
            end
          end
        end
      end
    end

    def self.filtered_labels(course)
      ALL_LABELS
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
        [:plan_to_teach],
        [:contact_invoicing],
        [:contact_invoicing_detail]
      ]
    end

    # full_answers plus the other fields from form_data
    def csv_data
      sanitize_form_data_hash.tap do |hash|
        additional_text_fields.each do |field_name, option, additional_text_field_name|
          next unless hash.key? field_name

          option ||= OTHER_WITH_TEXT
          additional_text_field_name ||= "#{field_name}_other".to_sym
          hash[field_name] = self.class.answer_with_additional_text hash, field_name, option, additional_text_field_name
          hash.delete additional_text_field_name
        end
      end
    end

    def school
      @school ||= School.includes(:school_district).find_by(id: sanitize_form_data_hash[:school])
    end

    def district_name
      school ?
        school.try(:school_district).try(:name).try(:titleize) :
        sanitize_form_data_hash[:school_district_name]
    end

    def school_name
      school ? school.name.try(:titleize) : sanitize_form_data_hash[:school_name]
    end
  end
end
