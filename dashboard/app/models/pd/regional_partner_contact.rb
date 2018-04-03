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

  after_create :send_regional_partner_contact_emails
  def send_regional_partner_contact_emails
    form = sanitize_and_trim_form_data_hash

    if regional_partner_id
      partner = RegionalPartner.find(regional_partner_id)
      regional_partner_program_managers = RegionalPartnerProgramManager.where(regional_partner_id: partner)

      if regional_partner_program_managers.empty?
        matched_but_no_pms = true
        # TODO: When cc supported, send one unmatched email with Jenna cc'ed
        Pd::RegionalPartnerContactMailer.unmatched(form, 'nimisha@code.org', matched_but_no_pms).deliver_now
        Pd::RegionalPartnerContactMailer.unmatched(form, 'jenna@code.org', matched_but_no_pms).deliver_now
      else
        regional_partner_program_managers.each do |rp_pm|
          Pd::RegionalPartnerContactMailer.matched(form, rp_pm).deliver_now
        end
      end
    else
      # TODO: When cc supported, send one unmatched email with Jenna cc'ed
      Pd::RegionalPartnerContactMailer.unmatched(form, 'nimisha@code.org').deliver_now
      Pd::RegionalPartnerContactMailer.unmatched(form, 'jenna@code.org').deliver_now
    end

    Pd::RegionalPartnerContactMailer.receipt(form).deliver_now
  end

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
    hash = sanitize_form_data_hash
    zipcode = hash[:school_zipcode]
    state = hash[:school_state]

    self.regional_partner = RegionalPartner.find_by_region(zipcode, state)
  end
end
