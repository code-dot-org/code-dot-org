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

  def self.required_fields
    [
      :first_name,
      :last_name,
      :title,
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
        gradeLevels: ['High School', 'Middle School', 'Elementary School']
      }
    )
  end

  private

  def validate_district_fields
    hash = sanitize_form_data_hash

    unless hash[:school_type].presence && hash[:school_state].presence
      add_key_error('Missing school district data')
    end

    if ['public', 'charter'].include? hash[:school_type]
      if hash[:school_district_other]
        add_key_error('Missing school district data') unless hash[:school_district_name].presence
      else
        add_key_error('Missing school district data') unless hash[:school_district].presence
      end
    else
      add_key_error('Missing school district data') unless hash[:school_name].presence && hash[:school_zipcode]
    end
  end
end
