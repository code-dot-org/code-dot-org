# == Schema Information
#
# Table name: pd_applications
#
#  id                  :integer          not null, primary key
#  user_id             :integer
#  type                :string(255)      not null
#  application_year    :string(255)      not null
#  application_type    :string(255)      not null
#  regional_partner_id :integer
#  status              :string(255)
#  locked_at           :datetime
#  notes               :text(65535)
#  form_data           :text(65535)      not null
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#  course              :string(255)
#  response_scores     :text(65535)
#  application_guid    :string(255)
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
  class PrincipalApproval1819Application < ApplicationBase
    def set_type_and_year
      self.application_year = YEAR_18_19
      self.application_type = PRINCIPAL_APPROVAL_APPLICATION
    end

    def self.options
      {
        title: COMMON_OPTIONS[:title],
        school_state: COMMON_OPTIONS[:state],
        school_type: COMMON_OPTIONS[:school_type],
        do_you_approve: [YES, NO, OTHER_WITH_TEXT],
        committed_to_master_schedule: [YES, NO, OTHER_WITH_TEXT],
        hours_per_year: COMMON_OPTIONS[:course_hours_per_year],
        terms_per_year: COMMON_OPTIONS[:terms_per_year],
        replace_course: [
          YES,
          "No, this course will be added to the schedule, but it won't replace an existing computer science course",
          "I don't know (please explain):"
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
          OTHER_PLEASE_EXPLAIN
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
          OTHER_PLEASE_EXPLAIN
        ],
        committed_to_diversity: [YES, NO, OTHER_PLEASE_EXPLAIN],
        pay_fee: [
          'Yes, my school or my teacher will be able to pay the full summer workshop program fee',
          'No, my school or my teacher will not be able to pay the summer workshop program fee.'
        ]
      }
    end

    def self.required_fields
      %i(
        first_name
        last_name
        title
        email
        do_you_approve
        confirm_principal
      )
    end

    def dynamic_required_fields(hash)
      [].tap do |required|
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

    def additional_text_fields
      [
        [:do_you_approve],
        [:committed_to_master_schedule],
        [:committed_to_diversity]
      ]
    end
  end
end
