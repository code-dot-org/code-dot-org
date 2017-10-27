# == Schema Information
#
# Table name: pd_regional_partner_contacts
#
#  id                  :integer          not null, primary key
#  user_id             :integer
#  regional_partner_id :integer
#  form_data           :text(65535)
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#
# Indexes
#
#  index_pd_regional_partner_contacts_on_regional_partner_id  (regional_partner_id)
#  index_pd_regional_partner_contacts_on_user_id              (user_id)
#
class Pd::RegionalPartnerContact < ActiveRecord::Base
  include Pd::Form

  belongs_to :user
  belongs_to :regional_partner

  validate :validate_district_fields
  validate :validate_email

  before_save :update_regional_partner

  def self.required_fields
    [
      :first_name,
      :last_name,
      :email,
      :role,
      :job_title,
      :grade_levels,
    ]
  end

  def self.options
    super.merge(
      {
        title: %w(Mr. Mrs. Ms. Dr.),
        role: ['Teacher', 'School Administrator', 'District Administrator'],
        gradeLevels: ['High School', 'Middle School', 'Elementary School'],
        program: ['CS Fundamentals (Pre-K - 5th grade)', 'CS Discoveries (6 - 10th grade)', 'CS Principles (appropriate for 9th - 12th grade, and can be implemented as an AP or introductory course)']
      }
    )
  end

  def add_general_errors(return_data)
    if errors.messages[:form_data].include? 'schoolDistrictData'
      return_data[:general_error] = 'Please fill out the fields about your school above'
    end
  end

  private

  def validate_district_fields
    hash = sanitize_form_data_hash

    unless hash[:school_type].presence && hash[:school_state].presence
      add_key_error(:school_district_data)
    end

    if ['public', 'charter'].include? hash[:school_type]
      if hash[:school_district_other]
        add_key_error(:school_district_data) unless hash[:school_district_name].presence
      else
        add_key_error(:school_district_data) unless hash[:school_district].presence
      end
    else
      add_key_error(:school_district_data) unless hash[:school_name].presence && hash[:school_zipcode]
    end
  end

  def validate_email
    hash = sanitize_form_data_hash

    add_key_error(:email) unless Cdo::EmailValidator.email_address?(hash[:email])
  end

  def update_regional_partner
    return if sanitize_form_data_hash[:grade_levels] == ['Elementary School']

    school_district = SchoolDistrict.find_by_id(sanitize_form_data_hash[:school_district])

    return unless school_district

    possible_partners = school_district.regional_partners_school_districts

    if possible_partners.size == 1
      self.regional_partner = possible_partners.first.regional_partner
    elsif possible_partners.size > 1
      grade_levels = sanitize_form_data_hash[:grade_levels]

      if grade_levels.include? 'High School'
        self.regional_partner = possible_partners.find_by(course: 'csp').try(:regional_partner)
      elsif grade_levels.include? 'Middle School'
        self.regional_partner = possible_partners.find_by(course: 'csd').try(:regional_partner)
      end

      self.regional_partner = possible_partners.first.regional_partner if regional_partner.nil?
    end
  end
end
