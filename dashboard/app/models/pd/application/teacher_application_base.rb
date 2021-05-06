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
  class TeacherApplicationBase < ApplicationBase
    include PdWorkshopHelper
    include Rails.application.routes.url_helpers
    include SchoolInfoDeduplicator

    VALID_COURSES = COURSE_NAME_MAP.keys.map(&:to_s)

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

    validates :status, exclusion: {in: ['interview'], message: '%{value} is reserved for facilitator applications.'}
    validates :course, presence: true, inclusion: {in: VALID_COURSES}

    before_validation :set_course_from_program
    before_save :save_partner, if: -> {form_data_changed? && regional_partner_id.nil? && !deleted?}

    serialized_attrs %w(
      pd_workshop_id
    )

    # Updates the associated user's school info with the info from this teacher application
    # based on these rules in order:
    # 1. Application has a specific school? always overwrite the user's school info
    # 2. User doesn't have a specific school? overwrite with the custom school info.
    def update_user_school_info!
      if school_id || user.school_info.try(&:school).nil?
        school_info = get_duplicate_school_info(school_info_attr) || SchoolInfo.create!(school_info_attr)
        user.update_school_info(school_info)
      end
    end

    def update_scholarship_status(scholarship_status)
      Pd::ScholarshipInfo.update_or_create(user, application_year, course, scholarship_status)
    end

    def scholarship_status
      if user && application_year && course
        Pd::ScholarshipInfo.find_by(user: user, application_year: application_year, course: course)&.scholarship_status
      end
    end

    # Implement in derived class.
    # @return a valid year (see ApplicationConstants.APPLICATION_YEARS)
    def year
      raise 'Abstract method must be overridden by inheriting class'
    end

    # @override
    def set_type_and_year
      self.application_type = TEACHER_APPLICATION
      self.application_year = year
    end

    def set_course_from_program
      self.course = PROGRAMS.key(program)
    end

    def save_partner
      self.regional_partner_id = sanitize_form_data_hash[:regional_partner_id]
    end

    def self.options
      raise 'Abstract method must be overridden by inheriting class'
    end

    def self.required_fields
      %i(
        country
        school
        first_name
        last_name
        phone
        address
        city
        state
        zip_code
        gender_identity
        race
        principal_first_name
        principal_last_name
        principal_email
        principal_confirm_email
        principal_phone_number
        current_role
        grades_at_school
        grades_teaching
        grades_expect_to_teach
        subjects_teaching
        subjects_expect_to_teach
        does_school_require_cs_license
        have_cs_license
        subjects_licensed_to_teach
        taught_in_past
        previous_yearlong_cdo_pd
        cs_offered_at_school
        cs_opportunities_at_school
        program
        plan_to_teach
        committed
        willing_to_travel
        agree
      )
    end

    def dynamic_required_fields(hash)
      [].tap do |required|
        if hash[:program] == PROGRAMS[:csd]
          required.concat [
            :csd_which_grades,
            :csd_course_hours_per_week,
            :csd_course_hours_per_year,
            :csd_terms_per_year
          ]
        elsif hash[:program] == PROGRAMS[:csp]
          required.concat [
            :csp_which_grades,
            :csp_course_hours_per_week,
            :csp_course_hours_per_year,
            :csp_terms_per_year,
            :csp_how_offer,
            :csp_ap_exam
          ]
        end
      end
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

    def district_name
      school ?
        school.try(:school_district).try(:name).try(:titleize) :
        sanitize_form_data_hash[:school_district_name]
    end

    def school_name
      school ? school.name.try(:titleize) : sanitize_form_data_hash[:school_name]
    end

    def school_zip_code
      school ? school.zip : sanitize_form_data_hash[:zip_code]
    end

    def school_state
      if school
        school.state.try(:upcase)
      else
        STATE_ABBR_WITH_DC_HASH.key(sanitize_form_data_hash[:state]).try(:to_s)
      end
    end

    def school_city
      school ? school.city.try(:titleize) : sanitize_form_data_hash[:city]
    end

    def school_address
      if school
        address = ""
        [
          school.address_line1,
          school.address_line2,
          school.address_line3
        ].each do |line|
          if line
            address << line << " "
          end
        end
        address.titleize
      else
        sanitize_form_data_hash[:address]
      end
    end

    def school_type
      school ? school.try(:school_type).try(:titleize) : sanitize_form_data_hash[:school_type]
    end

    def first_name
      hash = sanitize_form_data_hash
      hash[:preferred_first_name] || hash[:first_name]
    end
    alias_method :teacher_first_name, :first_name

    def last_name
      sanitize_form_data_hash[:last_name]
    end

    def state_code
      STATE_ABBR_WITH_DC_HASH.key(state_name).try(:to_s)
    end

    def application_url
      CDO.studio_url("/pd/application_dashboard/#{course}_teachers/#{id}", CDO.default_scheme)
    end

    def principal_email
      sanitize_form_data_hash[:principal_email]
    end

    # Title & last name, or full name if no title was provided.
    def principal_greeting
      hash = sanitize_form_data_hash
      title = hash[:principal_title]
      "#{title.presence || hash[:principal_first_name]} #{hash[:principal_last_name]}"
    end

    def principal_approval_url
      pd_application_principal_approval_url(application_guid) if application_guid
    end

    def meets_criteria
      raise 'Abstract method must be overridden by inheriting class'
    end

    def principal_approval_state
      principal_approval = Pd::Application::PrincipalApprovalApplication.find_by(application_guid: application_guid)

      if principal_approval
        if principal_approval.placeholder?
          'Sent'
        else
          sanitize_form_data_hash[:principal_approval]
        end
      else
        'No approval sent'
      end
    end

    # @override
    # Include additional text for all the multi-select fields that have the option
    def additional_text_fields
      raise 'Abstract method must be overridden by inheriting class'
    end

    # @override
    # Add account_email (based on the associated user's email) to the sanitized form data hash
    def sanitize_form_data_hash
      super.merge(account_email: user.email)
    end

    def school_id
      raw_school_id = sanitize_form_data_hash[:school]

      # -1 designates custom school info, in which case return nil
      raw_school_id.to_i == -1 ? nil : raw_school_id
    end

    def school_info_attr
      if school_id
        {
          school_id: school_id
        }
      else
        hash = sanitize_form_data_hash
        {
          country: 'US',
          # Take the first word in school type, downcased. E.g. "Public school" -> "public"
          school_type: hash[:school_type].split(' ').first.downcase,
          state: hash[:school_state],
          zip: hash[:school_zip_code],
          school_name: hash[:school_name],
          full_address: hash[:school_address],
          validation_type: SchoolInfo::VALIDATION_COMPLETE
        }
      end
    end

    # @override
    def find_default_workshop
      get_first_selected_workshop || super
    end

    def get_first_selected_workshop
      hash = sanitize_form_data_hash
      return nil if hash[:teachercon]

      workshop_ids = hash[:regional_partner_workshop_ids]
      return nil unless workshop_ids.try(:any?)

      return Pd::Workshop.find_by(id: workshop_ids.first) if workshop_ids.length == 1

      # able_to_attend_multiple responses are in the format:
      # "${friendly_date_range} in ${location} hosted by ${regionalPartnerName}"
      # Map back to actual workshops by reconstructing the friendly_date_range
      workshops = Pd::Workshop.where(id: workshop_ids)
      hash[:able_to_attend_multiple].each do |response|
        workshops_for_date = workshops.select {|w| response.start_with?(w.friendly_date_range)}
        return workshops_for_date.first if workshops_for_date.size == 1

        location = response.scan(/in (.+) hosted/).first.try(:first) || ''
        workshops_for_date_and_location = workshops_for_date.find {|w| w.location_address == location} || workshops_for_date.first
        return workshops_for_date_and_location if workshops_for_date_and_location
      end

      # No match? Return the first workshop
      workshops.first
    end

    def friendly_registered_workshop
      Pd::Enrollment.find_by(user: user, workshop: pd_workshop_id) ? 'Yes' : 'No'
    end

    def self.prefetch_associated_models(applications)
      prefetch_workshops applications.map(&:pd_workshop_id).uniq.compact

      # also prefetch schools
      prefetch_schools applications.map(&:school_id).uniq.compact
    end

    def self.prefetch_schools(school_ids)
      return if school_ids.empty?

      School.includes(:school_district).where(id: school_ids).each do |school|
        Rails.cache.write get_school_cache_key(school.id), school, expires_in: CACHE_TTL
      end
    end

    def self.get_school_cache_key(school_id)
      "#{self.class.name}.school(#{school_id})"
    end

    # Called once after the application is submitted, and the principal approval is done
    # Automatically scores the application based on given responses for this and the
    # principal approval application. It is idempotent, and will not override existing
    # scores on this application
    def auto_score!
      raise 'Abstract method must be overridden by inheriting class'
    end

    # Called after the application is created. Do any manipulation needed for the form data
    # hash here, as well as wend emails
    def on_successful_create
      # no-op for the base class
    end

    # Called after principal approval has been created. Do any manipulation needed for the
    # form data has here, as well as send emails
    def on_successful_principal_approval_create
      # no-op for the base class
    end

    protected

    def school
      school_id = self.school_id
      return nil unless school_id

      # attempt to retrieve from cache
      cache_fetch self.class.get_school_cache_key(school_id) do
        School.includes(:school_district).find_by(id: school_id)
      end
    end
  end
end
