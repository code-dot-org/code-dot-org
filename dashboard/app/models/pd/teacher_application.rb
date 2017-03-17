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
#  accepted_workshop         :string(255)
#  regional_partner_override :string(255)
#
# Indexes
#
#  index_pd_teacher_applications_on_primary_email    (primary_email)
#  index_pd_teacher_applications_on_secondary_email  (secondary_email)
#  index_pd_teacher_applications_on_user_id          (user_id) UNIQUE
#

class Pd::TeacherApplication < ActiveRecord::Base
  PROGRAM_DETAILS_BY_COURSE = {
    'csd' => {
      name: 'CS Discoveries',
      url: 'https://code.org/educate/professional-learning/cs-discoveries',
      approval_form_id: '1FAIpQLSdcR6oK-JZCtJ7LR92MmNsRheZjODu_Qb-MVc97jEgxyPk24A'
    },
    'csp' => {
      name: 'CS Principles',
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

  belongs_to :user

  validates_presence_of :user
  validates_presence_of :application
  validates_presence_of :primary_email
  validates_presence_of :secondary_email
  validates_email_format_of :primary_email, allow_blank: true
  validates_email_format_of :secondary_email, allow_blank: true
  validates_email_format_of :principal_email, allow_blank: true
  validates_inclusion_of :selected_course, in: PROGRAM_DETAILS_BY_COURSE.keys, unless: -> {!(application && selected_course)}

  validate :validate_required_application_fields
  def validate_required_application_fields
    return unless application
    hash = application_hash

    REQUIRED_APPLICATION_FIELDS.each do |key|
      errors.add(:application, "must contain #{key}") unless hash.key? key
    end
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

  def teacher_first_name
    application_hash['preferredFirstName'].presence || application_hash['firstName']
  end

  def teacher_last_name
    application_hash['lastName']
  end

  def teacher_name
    "#{teacher_first_name} #{teacher_last_name}"
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
end
