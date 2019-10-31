# == Schema Information
#
# Table name: pd_regional_partner_mini_contacts
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
#  index_pd_regional_partner_mini_contacts_on_regional_partner_id  (regional_partner_id)
#  index_pd_regional_partner_mini_contacts_on_user_id              (user_id)
#

class Pd::RegionalPartnerMiniContact < ApplicationRecord
  include Pd::Form

  UNMATCHED_FORM_EMAIL = 'liz.gauthier@code.org'

  belongs_to :user
  belongs_to :regional_partner

  validate :validate_email

  before_save :update_regional_partner

  after_create :send_regional_partner_contact_emails
  def send_regional_partner_contact_emails
    form = sanitize_and_trim_form_data_hash

    # We don't have a known role here, so let's use another word.
    form[:role] = "person"
    form[:mini] = true

    if regional_partner_id
      partner = RegionalPartner.find(regional_partner_id)
      regional_partner_program_managers = RegionalPartnerProgramManager.where(regional_partner: partner)

      if regional_partner_program_managers.empty?
        matched_but_no_pms = true
        Pd::RegionalPartnerContactMailer.unmatched(form, UNMATCHED_FORM_EMAIL, matched_but_no_pms).deliver_now
      else
        regional_partner_program_managers.each do |rp_pm|
          Pd::RegionalPartnerContactMailer.matched(form, rp_pm).deliver_now
        end
      end
    else
      Pd::RegionalPartnerContactMailer.unmatched(form, UNMATCHED_FORM_EMAIL).deliver_now
    end

    Pd::RegionalPartnerContactMailer.receipt(form, regional_partner).deliver_now
  end

  def self.required_fields
    [
      :zip
    ]
  end

  def email
    sanitize_form_data_hash[:email]
  end

  private

  def validate_email
    hash = sanitize_form_data_hash

    add_key_error(:email) unless Cdo::EmailValidator.email_address?(hash[:email])
  end

  def update_regional_partner
    hash = sanitize_form_data_hash
    zipcode = hash[:zip]

    self.regional_partner, _ = RegionalPartner.find_by_zip(zipcode)
  end
end
