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
  class FacilitatorApplicationBase < ApplicationBase
    include PdWorkshopHelper
    include Pd::FacilitatorCommonApplicationConstants

    PROGRAMS = {
      csf: 'CS Fundamentals',
      csd: 'CS Discoveries',
      csp: 'CS Principles'
    }.freeze

    VALID_COURSES = PROGRAMS.keys.map(&:to_s)

    YES_COMMIT = 'Yes, I can commit to this requirement'
    NO_COMMIT = "No, I can't commit to this requirement"

    validates :course, presence: true, inclusion: {in: VALID_COURSES}

    before_validation :set_course_from_program
    before_save :destroy_fit_autoenrollment, if: -> {status_changed? && status != "accepted"}
    before_create :match_partner, if: -> {regional_partner.nil?}

    serialized_attrs %w(
      pd_workshop_id
      fit_workshop_id
      auto_assigned_fit_enrollment_id
      question_1
      question_2
      question_3
      question_4
      question_5
      question_6
      question_7
    )
    # Implement in derived class.
    # @return a valid year (see ApplicationConstants.APPLICATION_YEARS)
    def year
      raise 'Abstract method must be overridden by inheriting class'
    end

    # @override
    def set_type_and_year
      self.application_type = FACILITATOR_APPLICATION
      self.application_year = year
    end

    def set_course_from_program
      self.course = PROGRAMS.key(program)
    end

    def match_partner
      self.regional_partner = RegionalPartner.find_by_region(zip_code, state_code)
    end

    def fit_workshop
      return nil unless fit_workshop_id

      # attempt to retrieve from cache
      cache_fetch self.class.get_workshop_cache_key(fit_workshop_id) do
        Pd::Workshop.includes(:sessions, :enrollments).find_by(id: fit_workshop_id)
      end
    end

    def fit_workshop_date_and_location
      fit_workshop.try(&:date_and_location_name)
    end

    def assigned_workshop_date_and_location
      Pd::Workshop.find_by(id: pd_workshop_id)&.date_and_location_name
    end

    def log_fit_workshop_change(user)
      update_status_timestamp_change_log(user, "Fit Workshop: #{fit_workshop_id ? fit_workshop_date_and_location : 'Unassigned'}")
    end

    def registered_fit_workshop?
      # inspect the cached fit_workshop.enrollments rather than querying the DB
      fit_workshop.enrollments.any? {|e| e.user_id == user.id} if fit_workshop_id
    end

    def friendly_registered_workshop(workshop_id = pd_workshop_id)
      Pd::Enrollment.find_by(user: user, workshop: workshop_id) ? 'Yes' : 'No'
    end

    def friendly_registered_fit_workshop
      friendly_registered_workshop(fit_workshop_id)
    end

    def self.options
      {
        title: COMMON_OPTIONS[:title],
        state: COMMON_OPTIONS[:state],
        gender_identity: COMMON_OPTIONS[:gender_identity],
        race: COMMON_OPTIONS[:race],

        institution_type: [
          'School district',
          'Non-profit',
          'Institute of higher education',
          'Tech company',
          TEXT_FIELDS[:other_with_text]
        ],

        how_heard: [
          'Code.org email',
          'Code.org social media post',
          TEXT_FIELDS[:how_heard_facilitator],
          TEXT_FIELDS[:how_heard_code_org_staff],
          TEXT_FIELDS[:how_heard_regional_partner],
          'My employer',
          TEXT_FIELDS[:other_with_text]
        ],

        plan_on_teaching: [
          YES,
          NO,
          "I don't know yet",
          TEXT_FIELDS[:other_with_text]
        ],

        teaching_experience: [
          'Yes, I am a current classroom teacher',
          'Yes. I am not currently a classroom teacher, but I have taught in a classroom in the past.',
          'No, I do not have classroom teaching experience'
        ],

        currently_involved_in_cs_education: [
          'I teach CS courses for credit to K-12, community college, or university students',
          'I teach CS courses in a CS bootcamp program',
          'I lead an afterschool or enrichment program focused on CS',
          'I advocate for CS education within my community',
          'I work at an organization that supports CS education advocacy and access',
          'I am not currently involved with CS education',
          TEXT_FIELDS[:other_please_describe]
        ],

        grades_taught: [
          'Elementary school',
          'Middle school ',
          'High school ',
          'Post-secondary ',
          "N/A: I don't have classroom teaching experience"
        ],

        experience_teaching_this_course: [
          'Yes, to elementary school students',
          'Yes, to middle school students',
          'Yes, to high school students',
          'I do not have experience teaching this curriculum to students, but I do have experience teaching a different CS curriculum to students',
          'I do not have experience teaching any CS curriculum to students',
        ],

        csf_previous_workshop: [
          'Yes, I have attended a Code.org CS Fundamentals workshop.',
          'I have attended a Code.org workshop, but for a different curriculum.',
          'No, I have not attended a Code.org workshop.'
        ],

        csd_csp_completed_pd: [
          'Yes, I have participated in the Code.org Professional Learning Program for this curriculum.',
          'I have participated in the Code.org Professional Learning Program, but for a different curriculum.',
          'No, I have not participated in a Code.org Professional Learning Program for any curriculum.',
        ],

        facilitator_availability: [
          'Weekdays during the school year',
          'Weekdays during the summer',
          'Saturdays during the school year',
          'Saturdays during the summer',
          'Sundays during the school year',
          'Sundays during the summer',
          TEXT_FIELDS[:other_with_text]
        ],

        csf_good_standing_requirement: [YES_COMMIT, NO_COMMIT],

        code_org_facilitator: [YES, NO],

        code_org_facilitator_years: [
          '2014-15 school year',
          '2015-16 school year',
          '2016-17 school year',
          '2017-18 school year',
          '2018-19 school year',
          TEXT_FIELDS[:other_with_text]
        ],

        code_org_facilitator_programs: [
          'CS Fundamentals',
          'CS Discoveries',
          'CS Principles',
          'CS in Algebra',
          'CS in Science',
          'Exploring Computer Science',
          TEXT_FIELDS[:other_with_text]
        ],

        have_led_adults: [YES, NO],

        csf_summit_requirement: [YES_COMMIT, NO_COMMIT],
        csf_workshop_requirement: [YES_COMMIT, NO_COMMIT],
        csf_community_requirement: [YES_COMMIT, NO_COMMIT],

        csd_csp_fit_weekend_requirement: [YES_COMMIT, NO_COMMIT],

        csd_csp_workshop_requirement: [YES_COMMIT, NO_COMMIT],

        csd_training_requirement: [YES_COMMIT, NO_COMMIT],
        csp_training_requirement: [YES_COMMIT, NO_COMMIT],

        csd_csp_lead_summer_workshop_requirement: [YES_COMMIT, NO_COMMIT],
        csd_csp_deeper_learning_requirement: [YES_COMMIT, NO_COMMIT],
        development_and_preparation_requirement: [YES_COMMIT, NO_COMMIT],

        csd_csp_good_standing_requirement: [YES_COMMIT, NO_COMMIT],

        csd_csp_no_partner_summer_workshop: [
          'Yes, I understand that I must commit to a 5-day summer workshop. If I am assigned to a nearby Regional Partner, I will coordinate with Code.org once dates are finalized.'
        ],

        csd_csp_partner_but_no_summer_workshop: [
          'Yes, I understand that I must commit to a 5-day summer workshop. I will coordinate with Code.org once dates are finalized.'
        ],

        csd_csp_partner_with_summer_workshop: [YES_COMMIT, NO_COMMIT],
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
        institution_type
        current_employer
        job_title

        program
        code_org_facilitator

        teaching_experience
        have_led_adults
        development_and_preparation_requirement

        currently_involved_in_cs_education
        grades_taught
        experience_teaching_this_course
        plan_on_teaching
        facilitator_availability

        why_should_all_have_access
        skills_areas_to_improve
        inquiry_based_learning
        why_interested

        gender_identity
        race
        agree
      )
    end

    def dynamic_required_fields(hash)
      [].tap do |required|
        if hash[:code_org_facilitator] == YES
          required.concat [
            :code_org_facilitator_years,
            :code_org_facilitator_programs
          ]
        end

        if hash[:program] == PROGRAMS[:csf]
          required.concat [
            :csf_summit_requirement,
            :csf_workshop_requirement,
            :csf_community_requirement,
            :csf_previous_workshop,
            :csf_good_standing_requirement
          ]
        end

        if hash[:program] != PROGRAMS[:csf]
          if !hash[:regional_partner_id]
            required << :csd_csp_no_partner_summer_workshop
          else
            if hash[:summer_workshops] && !hash[:summer_workshops].empty?
              required.concat [
                :csd_csp_partner_with_summer_workshop,
                :csd_csp_which_summer_workshop
              ]
            else
              required << :csd_csp_partner_but_no_summer_workshop
            end
            if hash[:fit_workshops] && !hash[:fit_workshops].empty?
              required << :csd_csp_which_fit_weekend
            end
          end
          required.concat [
            :csd_csp_fit_weekend_requirement,
            :csd_csp_workshop_requirement,
            :csd_csp_lead_summer_workshop_requirement,
            :csd_csp_deeper_learning_requirement,
            :csd_csp_completed_pd,
            :csd_csp_good_standing_requirement
          ]
        end

        if hash[:program] == PROGRAMS[:csd]
          required << :csd_training_requirement
        end

        if hash[:program] == PROGRAMS[:csp]
          required << :csp_training_requirement
        end
      end
    end

    def first_name
      sanitize_form_data_hash[:first_name]
    end

    def last_name
      sanitize_form_data_hash[:last_name]
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

    # Include additional text for all the multi-select fields that have the option
    def additional_text_fields
      [
        [:institution_type],
        [:code_org_facilitator_years],
        [:code_org_facilitator_programs],
        [:csd_csp_which_summer_workshop, TEXT_FIELDS[:not_sure_please_explain], :csd_csp_which_summer_workshop_not_sure],
        [:csd_csp_which_summer_workshop, TEXT_FIELDS[:unable_to_attend_please_explain], :csd_csp_which_summer_workshop_unable_to_attend],
        [:csd_csp_which_fit_weekend, TEXT_FIELDS[:not_sure_please_explain], :csd_csp_which_fit_weekend_not_sure],
        [:csd_csp_which_fit_weekend, TEXT_FIELDS[:unable_to_attend_please_explain], :csd_csp_which_fit_weekend_unable_to_attend],
        [:currently_involved_in_cs_education, TEXT_FIELDS[:other_please_describe]],
        [:plan_on_teaching],
        [:facilitator_availability],
        [:how_heard, TEXT_FIELDS[:how_heard_facilitator], :how_heard_facilitator],
        [:how_heard, TEXT_FIELDS[:how_heard_code_org_staff], :how_heard_code_org_staff],
        [:how_heard, TEXT_FIELDS[:how_heard_regional_partner], :how_heard_regional_partner],
        [:how_heard]
      ]
    end

    # @override
    # Add account_email (based on the associated user's email) to the sanitized form data hash
    def sanitize_form_data_hash
      super.merge(account_email: user.email)
    end

    def destroy_fit_autoenrollment
      return unless auto_assigned_fit_enrollment_id

      Pd::Enrollment.find_by(id: auto_assigned_fit_enrollment_id).try(:destroy)
      update(auto_assigned_fit_enrollment_id: nil)
    end

    def application_url
      CDO.studio_url("/pd/application_dashboard/#{course}_facilitators/#{id}", CDO.default_scheme)
    end

    # override
    def enroll_user
      return unless fit_workshop_id

      enrollment = Pd::Enrollment.where(
        pd_workshop_id: fit_workshop_id,
        email: user.email
      ).first_or_initialize

      # If this is a new enrollment, we want to:
      #   - save it with all required data
      #   - save a reference to it in properties
      #   - delete the previous auto-created enrollment if it exists
      if enrollment.new_record?
        enrollment.update!(
          user: user,
          school_info: user.school_info,
          first_name: first_name,
          last_name: last_name
        )

        destroy_fit_autoenrollment
        update(auto_assigned_fit_enrollment_id: enrollment.id)
      end
    end

    def self.prefetch_associated_models(applications)
      # also prefetch fit workshops
      prefetch_workshops applications.flat_map {|a| [a.pd_workshop_id, a.fit_workshop_id]}.uniq.compact
    end

    # @override
    def self.can_see_locked_status?(user)
      true
    end
  end
end
