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
#  applied_at                  :datetime
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
  class PrincipalApprovalApplication < ApplicationBase
    include Pd::PrincipalApprovalApplicationConstants
    include Pd::SharedApplicationConstants

    belongs_to :teacher_application, class_name: 'Pd::Application::TeacherApplication',
               primary_key: :application_guid, foreign_key: :application_guid
    after_create :update_teacher_app_status

    # @return a valid year (see Pd::SharedApplicationConstants::APPLICATION_YEARS)
    def year
      application_year
    end

    def update_teacher_app_status
      teacher_application.update!(status: 'unreviewed') if teacher_application.status == 'awaiting_admin_approval'
    end

    def self.next_year(year)
      current_year_index = APPLICATION_YEARS.index(year)
      current_year_index.nil? ? nil : APPLICATION_YEARS[current_year_index + 1]
    end

    # @override
    def set_type_and_year
      self.application_type = PRINCIPAL_APPROVAL_APPLICATION
      self.application_year = ActiveApplicationModels::APPLICATION_CURRENT_YEAR unless application_year
    end

    def underrepresented_minority_percent
      underrepresented_minority_groups = [
        :black,
        :hispanic,
        :pacific_islander,
        :american_indian
      ]
      sanitized_form_data_hash.select do |k, _|
        underrepresented_minority_groups.include? k
      end.values.sum(&:to_f)
    end

    def placeholder?
      JSON.parse(form_data).empty?
    end

    def self.create_placeholder_and_send_mail(teacher_application)
      teacher_application.send_pd_application_email :admin_approval

      Pd::Application::PrincipalApprovalApplication.create(
        form_data: {}.to_json,
        application_guid: teacher_application.application_guid
      )
    end

    # @override
    def check_idempotency
      existing_application = Pd::Application::PrincipalApprovalApplication.find_by(application_guid: application_guid)

      (!existing_application || existing_application.placeholder?) ? nil : existing_application
    end

    def self.options(year = APPLICATION_CURRENT_YEAR)
      {
        title: COMMON_OPTIONS[:title],
        can_email_you: [YES, NO],
        school_state: COMMON_OPTIONS[:state],
        school_type: COMMON_OPTIONS[:school_type],
        do_you_approve: [YES, NO, TEXT_FIELDS[:other_with_text]],
        committed_to_master_schedule: [
          "Yes, I plan to include this course in the #{year} master schedule",
          "Yes, I plan to include this course in the #{year} master schedule, but not taught by this teacher",
          "No, I do not plan to include this course in the #{year} master schedule but hope to the following year (#{next_year(year)})",
          TEXT_FIELDS[:other_with_text]
        ],
        replace_course: [
          YES,
          'No, this course will be added to the schedule in addition to an existing computer science course',
          'No, computer science is new to my school',
          TEXT_FIELDS[:dont_know_explain]
        ],
        pay_fee: [
          'Yes, my school would be able to pay the full program fee.',
          'No, my school would not be able to pay the program fee. We would like to be considered for a scholarship.'
        ]
      }
    end

    def dynamic_required_fields(hash)
      [].tap do |required|
        if hash[:do_you_approve]
          required.push(
            :first_name,
            :last_name,
            :email,
            :can_email_you,
            :confirm_principal
          )

          unless hash[:do_you_approve] == NO
            required.push(
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
              :replace_course,
              :understand_fee,
              :pay_fee
            )
          end
        end
      end
    end

    def self.filtered_labels(course, status = 'unreviewed')
      ALL_LABELS
    end

    def additional_text_fields
      [
        [:committed_to_master_schedule],
        [:replace_course, TEXT_FIELDS[:dont_know_explain], :replace_course_other],
        [:do_you_approve],
        [:contact_invoicing],
        [:contact_invoicing_detail]
      ]
    end

    # full_answers plus the other fields from form_data
    def csv_data
      sanitized_form_data_hash.tap do |hash|
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
      @school ||= School.includes(:school_district).find_by(id: sanitized_form_data_hash[:school])
    end

    def district_name
      school ?
        school.try(:school_district).try(:name).try(:titleize) :
        sanitized_form_data_hash[:school_district_name]
    end

    def school_name
      school ? school.name.try(:titleize) : sanitized_form_data_hash[:school_name]
    end
  end
end
