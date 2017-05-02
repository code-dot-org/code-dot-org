# == Schema Information
#
# Table name: pd_teacher_applications
#
#  id                        :integer          not null, primary key
#  created_at                :datetime         not null
#  updated_at                :datetime         not null
#  user_id                   :integer          not null
#  primary_email             :string(255)      not null
#  secondary_email           :string(255)      not null
#  application               :text(65535)      not null
#  regional_partner_override :string(255)
#
# Indexes
#
#  index_pd_teacher_applications_on_primary_email    (primary_email)
#  index_pd_teacher_applications_on_secondary_email  (secondary_email)
#  index_pd_teacher_applications_on_user_id          (user_id) UNIQUE
#

require_dependency 'pd/program_registration_validation'

class Pd::TeacherApplication < ActiveRecord::Base
  PROGRAM_DETAILS_BY_COURSE = {
    'csd' => {
      name: Pd::Workshop::COURSE_CSD,
      url: 'https://code.org/educate/professional-learning/cs-discoveries',
      approval_form_id: '1FAIpQLSdcR6oK-JZCtJ7LR92MmNsRheZjODu_Qb-MVc97jEgxyPk24A'
    },
    'csp' => {
      name: Pd::Workshop::COURSE_CSP,
      url: 'https://code.org/educate/professional-learning/cs-principles',
      approval_form_id: '1FAIpQLScVReYg18EYXvOFN2mQkDpDFgoVqKVv0bWOSE1LFSY34kyEHQ'
    }
  }

  # principalEmail is not included
  REQUIRED_APPLICATION_FIELDS = %w[
    school
    school-district
    firstName
    lastName
    primaryEmail
    secondaryEmail
    phoneNumber
    principalPrefix
    principalFirstName
    principalLastName
    principalEmail
    selectedCourse
    gradesAtSchool
    genderIdentity
    grades2016
    subjects2016
    grades2017
    subjects2017
    committedToSummer
    allStudentsShouldLearn
    allStudentsCanLearn
    newApproaches
    allAboutContent
    allAboutProgramming
    csCreativity
    currentCsOpportunities
    whyCsIsImportant
    whatTeachingSteps
  ]

  PROGRAM_REGISTRATION_FORM_KIND = 'PdProgramRegistration'.freeze

  belongs_to :user
  has_one :accepted_program, class_name: 'Pd::AcceptedProgram', foreign_key: :teacher_application_id

  validates_presence_of :user
  validates_presence_of :application
  validates_presence_of :primary_email
  validates_presence_of :secondary_email
  validates_email_format_of :primary_email, allow_blank: true
  validates_email_format_of :secondary_email, allow_blank: true
  validates_email_format_of :principal_email, allow_blank: true
  validates_inclusion_of :selected_course, in: PROGRAM_DETAILS_BY_COURSE.keys, unless: -> {!(application && selected_course)}
  validates_format_of :accepted_workshop, with: /.+:.+/, if: -> {accepted_workshop.present?}, message:
    'is not a valid format. Expected "dates : location" for teachercon, or "partner : dates" for a partner workshop'

  validate :validate_required_application_fields
  def validate_required_application_fields
    return unless application
    hash = application_hash

    REQUIRED_APPLICATION_FIELDS.each do |key|
      errors.add(:application, "must contain #{key}") unless hash.key? key
    end
  end

  validate :primary_email_must_match_user_email
  def primary_email_must_match_user_email
    return unless user
    unless primary_email_matches_user_email?
      message = (
        if admin_managed
          "must match the user's account email #{user.email}"
        else
          account_settings_link = ActionController::Base.helpers.link_to('account settings', '/users/edit')
          "must match your login. If you want to use this email instead, first update it in #{account_settings_link}."
        end
      )

      errors.add :primary_email, message
    end
  end

  attr_accessor :admin_managed, :move_to_user

  def primary_email_matches_user_email?
    user && user.hashed_email == Digest::MD5.hexdigest(primary_email)
  end

  after_create :ensure_user_is_a_teacher
  def ensure_user_is_a_teacher
    user.update!(user_type: User::TYPE_TEACHER, email: primary_email) if user.email.blank?
  end

  def application_json=(json)
    write_attribute :application, json

    # Also set the primary and secondary email fields.
    hash = JSON.parse(json)
    write_attribute :primary_email, hash['primaryEmail']
    write_attribute :secondary_email, hash['secondaryEmail']
  end

  def application_json
    application
  end

  # Convenience method to set value(s) on the application JSON
  def update_application_hash(update_hash)
    self.application_hash = (application_hash || {}).merge update_hash
  end

  def application_hash=(hash)
    write_attribute :application, hash.to_json

    # Also set the primary and secondary email fields.
    hash = hash.stringify_keys
    write_attribute :primary_email, hash['primaryEmail']
    write_attribute :secondary_email, hash['secondaryEmail']
  end

  def application_hash
    application ? JSON.parse(application) : {}
  end

  def accepted_workshop=(workshop_name)
    if workshop_name.blank?
      accepted_program.try(:destroy)
      return
    end

    params = {
      workshop_name: workshop_name,
      course: selected_course,
      user_id: user_id,
      teacher_application_id: id
    }

    if accepted_program
      accepted_program.update! params
    else
      self.accepted_program = Pd::AcceptedProgram.find_or_create_by! params
    end
  end

  def accepted_workshop
    accepted_program.try(:workshop_name)
  end

  def teacher_first_name
    application_hash['preferredFirstName'].presence || application_hash['firstName']
  end

  def teacher_last_name
    application_hash['lastName']
  end

  def teacher_name
    "#{teacher_first_name} #{teacher_last_name}"
  end

  def phone_number
    application_hash['phoneNumber']
  end

  def principal_prefix
    application_hash['principalPrefix']
  end

  def principal_first_name
    application_hash['principalFirstName']
  end

  def principal_last_name
    application_hash['principalLastName']
  end

  def principal_name
    "#{principal_first_name} #{principal_last_name}"
  end

  def principal_email
    application_hash['principalEmail']
  end

  def selected_course
    application_hash['selectedCourse']
  end

  def program_details
    PROGRAM_DETAILS_BY_COURSE[selected_course]
  end

  def program_name
    program_details[:name]
  end

  def program_url
    program_details[:url]
  end

  def approval_form_url
    form_id = program_details[:approval_form_id]
    return nil unless form_id

    params = {
      'entry.1124819666': teacher_name,
      'entry.1772278630': school_name,
      'entry.2063346846': id
    }.to_query
    "https://docs.google.com/forms/d/e/#{form_id}/viewform?#{params}"
  end

  def school
    application_hash['school'].present? ? School.find(application_hash['school']) : nil
  end

  def school_name
    school.try(:name) || application_hash['school-name']
  end

  def school_district
    application_hash['school-district'].present? ? SchoolDistrict.find(application_hash['school-district']) : nil
  end

  def school_district_name
    school_district.try(:name) || application_hash['school-district-name']
  end

  def regional_partner
    school_district.try do |d|
      d.regional_partners_school_districts.find_by(course: selected_course).try(:regional_partner) ||
      d.regional_partners.first
    end
  end

  def regional_partner_override=(value)
    write_attribute :regional_partner_override, value if value.present? && value != regional_partner_name
  end

  alias_method :regional_partner_name=, :regional_partner_override=

  def regional_partner_name
    regional_partner_override || regional_partner.try(:name)
  end

  def to_expanded_json
    application_hash.merge(
      {
        id: id,
        userId: user_id,
        timestamp: created_at,
        schoolName: school_name,
        schoolDistrictName: school_district_name,
        regionalPartner: regional_partner_name
      }
    ).stringify_keys
  end

  def program_registration
    return @program_registration if @program_registration || @override_program_registration

    # Lazy-load from pegasus if it hasn't yet been retrieved
    form = PEGASUS_DB[:forms].where(kind: PROGRAM_REGISTRATION_FORM_KIND, source_id: id).first
    @program_registration = form.present? ? JSON.parse(form[:data]).symbolize_keys : nil
  end

  def program_registration=(value)
    @program_registration = value

    # store this separately to differentiate nil between delete on save vs. not yet retrieved
    @override_program_registration = true
    @raw_program_registration_json = nil
  end

  def reload
    @override_program_registration = false
    @program_registration = nil
    super
  end

  def program_registration_json
    @raw_program_registration_json || JSON.pretty_generate(
      program_registration.except(*automatic_program_registration_fields.keys)
    )
  end

  def program_registration_json=(value)
    if value.blank?
      self.program_registration = nil
      return
    end

    parsed = begin
      JSON.parse(value)
    rescue JSON::ParserError
      # store the raw json, and fail validation
      @raw_program_registration_json = value
      return
    end

    @raw_program_registration_json = nil
    self.program_registration = parsed.merge(automatic_program_registration_fields).symbolize_keys
  end

  validate :program_registration_form_must_be_valid
  def program_registration_form_must_be_valid
    if @raw_program_registration_json
      errors.add :program_registration_json, 'is not valid JSON'
      return
    end

    return nil unless @override_program_registration && @program_registration

    unless accepted_program.try(&:teachercon?)
      errors.add :accepted_workshop, 'must be a TeacherCon workshop for program registration'
      return
    end

    begin
      Pd::ProgramRegistrationValidation.validate @program_registration
    rescue PegasusFormErrors::FormError => e
      error_text = e.errors.map {|key, error| "#{key}: #{error}"}.join(',')
      errors.add :program_registration_json, "contains errors: #{error_text}"
    end
  end

  validate :move_to_user_is_a_user
  def move_to_user_is_a_user
    if move_to_user.present? && lookup_move_to_user.nil?
      errors.add :move_to_user, 'not found'
    end
  end

  before_validation :save_move_to_user
  def save_move_to_user
    found_user = lookup_move_to_user
    self.user = found_user if found_user
  end

  def lookup_move_to_user
    return nil if move_to_user.blank?

    if move_to_user.to_i.to_s == move_to_user
      User.find move_to_user
    else
      User.find_by_email_or_hashed_email move_to_user
    end
  end

  # Update or delete registration form in the Pegasus DB, if one has been provided
  before_save :update_program_registration
  def update_program_registration
    return unless @override_program_registration

    if @program_registration.blank?
      PEGASUS_DB[:forms].where(kind: PROGRAM_REGISTRATION_FORM_KIND, source_id: id).delete
    else
      json_data = @program_registration.to_json
      PEGASUS_DB[:forms].where(kind: PROGRAM_REGISTRATION_FORM_KIND, source_id: id).update(data: json_data)
    end
  end

  private

  def automatic_program_registration_fields
    {
      email_s: primary_email,
      name_s: user.try(:name),
      user_id_i: user.try(:id).to_s,
      first_name_s: teacher_first_name,
      last_name_s: teacher_last_name,
      phone_number_s: phone_number,
      pd_teacher_application_id_i: id.to_s,
      school_district_s: school_district,
      selected_course_s: selected_course,
      accepted_workshop_s: accepted_workshop
    }
  end
end
